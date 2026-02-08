# 787 Vault - Secure Zero-Knowledge Note Manager ⚡

![Electron](https://img.shields.io/badge/Electron-33.0.0-47848F?logo=electron)
![Security](https://img.shields.io/badge/Security-AES--256--GCM-blueviolet)

**787 Vault**, gizliliği ve yerel güvenliği odağına alan, modern bir şifreli not yöneticisidir. Tüm verileriniz **Sıfır Bilgi (Zero-Knowledge)** prensibiyle şifrelenir ve sadece sizin bilgisayarınızda saklanır.

---

## ✨ Öne Çıkan Özellikler

- 🛡️ **Endüstri Standartı Güvenlik:** AES-256-GCM şifreleme ve `scrypt` ile anahtar türetme.
- 🕶️ **Cyber Stealth GUI:** Neon violet aksanlı, şık ve profesyonel karanlık tema.
- 🔍 **Gelişmiş Arama & Değiştirme:** Notlarınızın içinde `Ctrl+F` ve `Ctrl+H` ile hızla işlem yapın.
- 📥 **Dosya İçe Aktarma:** `.txt` ve `.md` dosyalarını toplu olarak sisteme güvenle aktarın.
- 🔑 **Güçlü Şifre Yönetimi:** Kasanızı dilediğiniz zaman yeni bir ana şifreyle yeniden şifreleyin.
- 🔒 **Anlık Oturum Kilidi:** Tek tıkla verileri bellekten temizleyin ve sistemi kilitleyin.
- 📍 **Dosya Yolu Takibi:** Kasanızın (`vault.json`) bilgisayarınızda nerede olduğunu uygulama içinden tek tıkla görün.

---

## 🚀 Kurulum ve Çalıştırma

### 1. Geliştirme Ortamı
Projeyi yerelinizde çalıştırmak için:

```bash
# Bağımlılıkları yükleyin
npm install

# Uygulamayı başlatın
npm start
# VEYA dizindeki RUN_APP.bat dosyasına çift tıklayın
```

### 2. EXE Olarak Paketleme
Kendi kurulabilir Windows uygulamanızı oluşturmak için:

```bash
npm run dist
# VEYA dizindeki BUILD_EXE.bat dosyasına çift tıklayın
```

---

## 🔐 Güvenlik ve Depolama

Uygulama, verilerinizi asla merkezi bir sunucuya göndermez. Master Password'ünüz sadece sizin zihninizde ve uygulamanın çalışma zamanında RAM üzerindedir.

- **Kasa Konumu:** `%APPDATA%\787-vault\vault.json`
- **Görünürlük:** Sidebar'daki künye kısmına tıklayarak dosya yolunu anlık olarak doğrulayabilirsiniz.

---

## 🛠️ Teknik Detaylar

Detaylı dosya haritası, mimari yapı ve güvenlik protokolleri için [PROJE_OZELLIKLERI.md](PROJE_OZELLIKLERI.md) dosyasını inceleyebilirsiniz.

---

**Created by Zywexx • Powered by 787**
