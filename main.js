const { app, BrowserWindow, ipcMain, dialog } = require('electron');
const path = require('path');
const fs = require('fs');

// Disable hardware acceleration to prevent GPU-related errors on some systems
app.disableHardwareAcceleration();

let mainWindow;

/**
 * Helper to get the vault path. 
 * Now stored in the project's root directory as requested.
 */
function getVaultPath() {
    const userDataPath = app.getPath('userData');
    if (!fs.existsSync(userDataPath)) {
        fs.mkdirSync(userDataPath, { recursive: true });
    }
    const fullPath = path.join(userDataPath, 'vault.json');
    console.log("Vault storage path:", fullPath);
    return fullPath;
}

function createWindow() {
    mainWindow = new BrowserWindow({
        width: 1100,
        height: 750,
        icon: path.join(__dirname, '787.ico'),
        webPreferences: {
            preload: path.join(__dirname, 'preload.js'),
            contextIsolation: true,
            nodeIntegration: false,
            sandbox: false
        },
        autoHideMenuBar: true,
        backgroundColor: '#121212',
        title: "787 Vault"
    });

    mainWindow.loadFile(path.join(__dirname, 'src', 'index.html'));
}

app.on('ready', () => {
    createWindow();
});

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') app.quit();
});

app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
});

// --- IPC Handlers ---

// Vault Load
ipcMain.handle('vault:load', async () => {
    const vaultPath = getVaultPath();
    if (!fs.existsSync(vaultPath)) {
        return { notes: [], salt: null, verifier: null };
    }
    try {
        const data = fs.readFileSync(vaultPath, 'utf8');
        return JSON.parse(data);
    } catch (e) {
        console.error("Vault load error:", e);
        return { notes: [], salt: null, verifier: null };
    }
});

// Vault Save
ipcMain.handle('vault:save', async (event, data) => {
    const vaultPath = getVaultPath();
    fs.writeFileSync(vaultPath, JSON.stringify(data, null, 2));
    return { success: true };
});

// Get Vault Path
ipcMain.handle('vault:getPath', async () => {
    return getVaultPath();
});

// File Import Dialog
ipcMain.handle('dialog:openFile', async () => {
    const result = await dialog.showOpenDialog(mainWindow, {
        properties: ['openFile', 'multiSelections'],
        filters: [
            { name: 'Text Files', extensions: ['txt', 'md'] },
            { name: 'All Files', extensions: ['*'] }
        ]
    });

    if (result.canceled) return [];

    const filesData = result.filePaths.map(filePath => {
        return {
            name: path.basename(filePath, path.extname(filePath)),
            content: fs.readFileSync(filePath, 'utf8')
        };
    });

    return filesData;
});
