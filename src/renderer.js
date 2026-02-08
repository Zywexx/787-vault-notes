// --- State Variables ---
let currentVault = { notes: [], salt: null, verifier: null };
let decryptedNotes = []; // Actual note objects: { id, title, content }
let masterPassword = '';
let activeNoteId = null;
let searchQuery = '';

// --- DOM Elements ---
const lockScreen = document.getElementById('lock-screen');
const mainPanel = document.getElementById('main-panel');
const passwordInput = document.getElementById('master-password');
const unlockBtn = document.getElementById('unlock-btn');
const lockError = document.getElementById('lock-error');

const notesList = document.getElementById('notes-list');
const noteTitle = document.getElementById('note-title');
const noteContent = document.getElementById('note-content');
const saveBtn = document.getElementById('save-note-btn');
const deleteBtn = document.getElementById('delete-note-btn');
const newNoteBtn = document.getElementById('new-note-btn');
const importBtn = document.getElementById('import-btn');
const searchInput = document.getElementById('search-notes');
const lockAppBtn = document.getElementById('lock-app-btn');
const saveStatus = document.getElementById('save-status');
const toastContainer = document.getElementById('toast-container');
const creditsTrigger = document.getElementById('credits-trigger');
const vaultPathDisplay = document.getElementById('vault-path-display');

// Password Change Elements
const pwdModal = document.getElementById('password-modal');
const changePwdTrigger = document.getElementById('change-pwd-trigger');
const oldPwdInput = document.getElementById('old-password');
const newPwdInput = document.getElementById('new-password');
const confirmPwdInput = document.getElementById('confirm-password');
const confirmPwdBtn = document.getElementById('confirm-pwd-btn');
const cancelPwdBtn = document.getElementById('cancel-pwd-btn');

// Find & Replace Elements
const frBar = document.getElementById('find-replace-bar');
const findInput = document.getElementById('find-input');
const replaceInput = document.getElementById('replace-input');
const replaceRow = document.getElementById('replace-row');
const findNextBtn = document.getElementById('find-next-btn');
const replaceBtn = document.getElementById('replace-btn');
const replaceAllBtn = document.getElementById('replace-all-btn');
const closeFrBtn = document.getElementById('close-fr');

// --- Initialization ---
async function init() {
    const vault = await window.api.loadVault();
    if (vault.salt && vault.verifier) {
        currentVault = vault;
        document.getElementById('lock-msg').innerText = "Kasa mevcut. Lütfen şifreyi girin.";
        unlockBtn.innerText = "Kilidi Aç";
    } else {
        document.getElementById('lock-msg').innerText = "Kasa bulunamadı. Yeni bir Master Password belirleyin.";
        unlockBtn.innerText = "Şifreyi Belirle ve Başla";
        currentVault.salt = window.api.generateSalt();
        currentVault.notes = [];
        currentVault.verifier = null;
    }
    passwordInput.focus();
}

// --- Event Listeners ---
unlockBtn.addEventListener('click', handleUnlock);
passwordInput.addEventListener('keypress', (e) => { if (e.key === 'Enter') handleUnlock(); });
saveBtn.addEventListener('click', handleSaveNote);
deleteBtn.addEventListener('click', handleDeleteNote);
newNoteBtn.addEventListener('click', handleNewNote);
importBtn.addEventListener('click', handleImportNotes);
searchInput.addEventListener('input', (e) => {
    searchQuery = e.target.value.toLowerCase();
    renderNotesList();
});

lockAppBtn.addEventListener('click', () => { window.location.reload(); });

// Keyboard Shortcuts for Find/Replace
window.addEventListener('keydown', (e) => {
    if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'f') {
        e.preventDefault();
        showFindReplace(false);
    }
    if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'h') {
        e.preventDefault();
        showFindReplace(true);
    }
    if (e.key === 'Escape') {
        frBar.classList.add('hidden');
    }
});

closeFrBtn.addEventListener('click', () => frBar.classList.add('hidden'));
findNextBtn.addEventListener('click', () => findText(true));
replaceBtn.addEventListener('click', replaceText);
replaceAllBtn.addEventListener('click', replaceAllText);

// Password Change Event Listeners
changePwdTrigger.addEventListener('click', () => {
    oldPwdInput.value = '';
    newPwdInput.value = '';
    confirmPwdInput.value = '';
    pwdModal.classList.remove('hidden');
});

cancelPwdBtn.addEventListener('click', () => pwdModal.classList.add('hidden'));

confirmPwdBtn.addEventListener('click', handlePasswordChange);

creditsTrigger.addEventListener('click', async () => {
    if (vaultPathDisplay.classList.contains('hidden')) {
        const path = await window.api.getVaultPath();
        vaultPathDisplay.innerText = path;
        vaultPathDisplay.classList.remove('hidden');
        setTimeout(() => {
            vaultPathDisplay.classList.add('hidden');
        }, 5000);
    } else {
        vaultPathDisplay.classList.add('hidden');
    }
});

// --- Key Functions ---

async function handlePasswordChange() {
    const oldPwd = oldPwdInput.value;
    const newPwd = newPwdInput.value;
    const confirmPwd = confirmPwdInput.value;

    if (oldPwd !== masterPassword) {
        showToast('Eski şifre hatalı!', 'error');
        return;
    }

    if (!newPwd || newPwd.length < 4) {
        showToast('Yeni şifre en az 4 karakter olmalı.', 'error');
        return;
    }

    if (newPwd !== confirmPwd) {
        showToast('Şifreler eşleşmiyor!', 'error');
        return;
    }

    try {
        confirmPwdBtn.disabled = true;
        confirmPwdBtn.innerText = 'İşleniyor...';

        // 1. Generate new salt
        const newSalt = window.api.generateSalt();

        // 2. Create new verifier with new password
        const newVerifier = await window.api.encrypt("VAULT_VERIFIED", newPwd, newSalt);

        // 3. Update state
        masterPassword = newPwd;
        currentVault.salt = newSalt;
        currentVault.verifier = newVerifier;

        // 4. Re-sync to vault will encrypt all notes with NEW masterPassword and NEW salt
        await syncToVault();

        showToast('Şifre başarıyla değiştirildi ve veriler güncellendi.', 'success');
        pwdModal.classList.add('hidden');
    } catch (error) {
        showToast('Şifre değiştirme hatası: ' + error.message, 'error');
    } finally {
        confirmPwdBtn.disabled = false;
        confirmPwdBtn.innerText = 'Güncelle';
    }
}

function showFindReplace(showReplace) {
    if (activeNoteId === null) return;
    frBar.classList.remove('hidden');
    if (showReplace) {
        replaceRow.classList.remove('hidden');
    } else {
        replaceRow.classList.add('hidden');
    }
    findInput.focus();
}

function findText(selectNext) {
    const query = findInput.value;
    if (!query) return;

    const content = noteContent.value;
    const scrollPos = noteContent.scrollTop;

    // Simple iterative search
    let startPos = noteContent.selectionEnd;
    let index = content.indexOf(query, startPos);

    if (index === -1) {
        // Start from beginning if not found or reached end
        index = content.indexOf(query, 0);
    }

    if (index !== -1) {
        noteContent.focus();
        noteContent.setSelectionRange(index, index + query.length);
        // Scroll into view if possible
        const lineHeight = 20; // estimate
        const lineCount = content.substr(0, index).split('\n').length;
        noteContent.scrollTop = (lineCount * 1.8 * 16) - 100; // rough estimate based on line-height 1.8
    } else {
        showToast('Eşleşme bulunamadı.', 'error');
    }
}

function replaceText() {
    const query = findInput.value;
    const replacement = replaceInput.value;
    if (!query) return;

    const content = noteContent.value;
    const selectionStart = noteContent.selectionStart;
    const selectionEnd = noteContent.selectionEnd;
    const selectedText = content.substring(selectionStart, selectionEnd);

    if (selectedText === query) {
        const newContent = content.substring(0, selectionStart) + replacement + content.substring(selectionEnd);
        noteContent.value = newContent;
        noteContent.setSelectionRange(selectionStart, selectionStart + replacement.length);
        findText(true);
    } else {
        findText(true);
    }
}

function replaceAllText() {
    const query = findInput.value;
    const replacement = replaceInput.value;
    if (!query) return;

    const content = noteContent.value;
    const newContent = content.split(query).join(replacement);
    noteContent.value = newContent;
    showToast('Tüm eşleşmeler değiştirildi.', 'success');
}

async function handleUnlock() {
    const pwd = passwordInput.value;
    if (!pwd) return;

    try {
        if (!currentVault.salt) {
            currentVault.salt = window.api.generateSalt();
        }
        masterPassword = pwd;
        decryptedNotes = [];

        // CASE 1: New Vault
        if (!currentVault.verifier) {
            currentVault.verifier = await window.api.encrypt("VAULT_VERIFIED", masterPassword, currentVault.salt);
            await window.api.saveVault(currentVault);
            showToast('Kasa kurulumu tamamlandı.', 'success');
        }
        // CASE 2: Existing Vault
        else {
            try {
                const check = await window.api.decrypt(currentVault.verifier, masterPassword, currentVault.salt);
                if (check !== "VAULT_VERIFIED") throw new Error();
            } catch (e) {
                throw new Error("Erişim Reddedildi: Hatalı Şifre!");
            }

            // Password correct, decrypt notes
            for (const note of currentVault.notes) {
                const decryptedTitle = await window.api.decrypt(note.title, masterPassword, currentVault.salt);
                const decryptedText = await window.api.decrypt(note.content, masterPassword, currentVault.salt);

                decryptedNotes.push({
                    id: note.id,
                    title: decryptedTitle,
                    content: decryptedText
                });
            }
            showToast('Kasa başarıyla açıldı.', 'success');
        }

        renderNotesList();
        lockScreen.classList.add('hidden');
        mainPanel.classList.remove('hidden');
    } catch (error) {
        lockError.innerText = error.message;
        masterPassword = '';
    }
}

async function handleSaveNote() {
    if (!activeNoteId) return;

    const title = noteTitle.value || 'Adsız Not';
    const content = noteContent.value;
    saveStatus.innerText = 'Kaydediliyor...';

    try {
        let noteIdx = decryptedNotes.findIndex(n => n.id === activeNoteId);
        if (noteIdx === -1) {
            decryptedNotes.push({ id: activeNoteId, title, content });
        } else {
            decryptedNotes[noteIdx].title = title;
            decryptedNotes[noteIdx].content = content;
        }

        await syncToVault();

        renderNotesList();
        saveStatus.innerText = 'Kaydedildi';
        showToast('Not güvenli bir şekilde kaydedildi.', 'success');
        setTimeout(() => { saveStatus.innerText = ''; }, 2000);
    } catch (error) {
        showToast("Kaydetme hatası: " + error.message, 'error');
        saveStatus.innerText = 'Hata!';
    }
}

async function handleImportNotes() {
    try {
        const files = await window.api.selectFiles();
        if (files.length === 0) return;

        let importCount = 0;
        for (const file of files) {
            const id = Date.now().toString() + Math.random().toString(36).substr(2, 5);
            decryptedNotes.push({
                id: id,
                title: file.name,
                content: file.content
            });
            importCount++;
        }

        await syncToVault();
        renderNotesList();
        showToast(`${importCount} not başarıyla içe aktarıldı.`, 'success');
    } catch (error) {
        showToast("İçe aktarma hatası: " + error.message, 'error');
    }
}

async function syncToVault() {
    const encryptedNotes = [];
    for (const dn of decryptedNotes) {
        const eTitle = await window.api.encrypt(dn.title, masterPassword, currentVault.salt);
        const eContent = await window.api.encrypt(dn.content, masterPassword, currentVault.salt);
        encryptedNotes.push({ id: dn.id, title: eTitle, content: eContent });
    }
    currentVault.notes = encryptedNotes;
    await window.api.saveVault(currentVault);
}

async function handleDeleteNote() {
    if (!activeNoteId) return;
    if (!confirm('Bu notu kalıcı olarak silmek istediğinize emin misiniz?')) return;

    decryptedNotes = decryptedNotes.filter(n => n.id !== activeNoteId);

    try {
        await syncToVault();
        activeNoteId = null;
        noteTitle.value = '';
        noteContent.value = '';
        noteTitle.readOnly = true;
        noteContent.readOnly = true;
        renderNotesList();
        showToast('Not silindi.', 'success');
    } catch (e) {
        showToast("Silme hatası", "error");
    }
}

function handleNewNote() {
    activeNoteId = Date.now().toString();
    noteTitle.value = '';
    noteContent.value = '';
    noteTitle.readOnly = false;
    noteContent.readOnly = false;
    noteTitle.focus();
    renderNotesList();
}

function renderNotesList() {
    notesList.innerHTML = '';

    // Filtering
    const filtered = decryptedNotes.filter(note =>
        note.title.toLowerCase().includes(searchQuery) ||
        note.content.toLowerCase().includes(searchQuery)
    );

    // Sorting by date (ID is timestamp)
    filtered.sort((a, b) => b.id.localeCompare(a.id));

    filtered.forEach(note => {
        const div = document.createElement('div');
        div.className = `note-item ${activeNoteId === note.id ? 'active' : ''}`;

        // Extract a preview of the content
        const preview = note.content.substring(0, 35).replace(/\n/g, ' ') + (note.content.length > 35 ? '...' : '');

        div.innerHTML = `
            <h4>${note.title || 'Adsız Not'}</h4>
            <small>${preview || 'İçerik yok'}</small>
        `;

        div.onclick = () => {
            activeNoteId = note.id;
            noteTitle.value = note.title;
            noteContent.value = note.content;
            noteTitle.readOnly = false;
            noteContent.readOnly = false;
            renderNotesList();
        };
        notesList.appendChild(div);
    });
}

function showToast(msg, type = 'success') {
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.innerText = msg;
    toastContainer.appendChild(toast);
    setTimeout(() => { if (toast.parentNode) toast.remove(); }, 3000);
}

// Initialize on load
init();
