const { contextBridge, ipcRenderer } = require('electron');
const crypto = require('crypto');

// --- Cryptographic Helper Functions ---

/**
 * Derives a 32-byte key from a password and salt using scryptSync.
 */
function deriveKey(password, salt) {
    return crypto.scryptSync(password, salt, 32);
}

/**
 * Encrypts data using AES-256-GCM.
 */
function encrypt(text, password, salt) {
    try {
        if (!password || !salt) {
            throw new Error('Eksik şifre veya salt verisi.');
        }
        const key = deriveKey(password, Buffer.from(salt, 'hex'));
        const iv = crypto.randomBytes(12);
        const cipher = crypto.createCipheriv('aes-256-gcm', key, iv);

        let encrypted = cipher.update(text, 'utf8', 'hex');
        encrypted += cipher.final('hex');

        const authTag = cipher.getAuthTag().toString('hex');

        return {
            content: encrypted,
            iv: iv.toString('hex'),
            authTag: authTag
        };
    } catch (error) {
        console.error('Encryption failed details:', error);
        throw new Error('Şifreleme hatası: ' + error.message);
    }
}

/**
 * Decrypts data using AES-256-GCM and verifies integrity.
 */
function decrypt(encryptedData, password, salt) {
    try {
        const key = deriveKey(password, Buffer.from(salt, 'hex'));
        const decipher = crypto.createDecipheriv(
            'aes-256-gcm',
            key,
            Buffer.from(encryptedData.iv, 'hex')
        );

        decipher.setAuthTag(Buffer.from(encryptedData.authTag, 'hex'));

        let decrypted = decipher.update(encryptedData.content, 'hex', 'utf8');
        decrypted += decipher.final('utf8');

        return decrypted;
    } catch (error) {
        console.error('Decryption failed:', error);
        throw new Error('Erişim Reddedildi: Hatalı Şifre veya Veri Tahrif Edilmiş.');
    }
}

// --- Exposing the API to the Renderer ---

contextBridge.exposeInMainWorld('api', {
    // Vault operations
    loadVault: () => ipcRenderer.invoke('vault:load'),
    saveVault: (data) => ipcRenderer.invoke('vault:save', data),
    getVaultPath: () => ipcRenderer.invoke('vault:getPath'),

    // Crypto operations
    encrypt: (text, password, salt) => encrypt(text, password, salt),
    decrypt: (data, password, salt) => decrypt(data, password, salt),
    generateSalt: () => crypto.randomBytes(16).toString('hex'),

    // System operations
    selectFiles: () => ipcRenderer.invoke('dialog:openFile')
});
