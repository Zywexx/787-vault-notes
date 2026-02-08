# 787 Vault - Detaylı Proje Rehberi ve Dosya Haritası

Bu döküman, **787 Vault** uygulamasının tüm bileşenlerini, hangi dosyanın hangi işlevi gördüğünü ve verilerin tam olarak nerede, nasıl saklandığını en ince ayrıntısına kadar açıklar.

---

## 🗺️ Dosya ve Klasör Yapısı (Project Map)

Projenin kök dizinindeki her dosyanın bir görevi vardır:

### ⚙️ Sistem Dosyaları (Root)
- **`main.js`**: **Uygulamanın Kalbi (Main Process).**
  - Pencereyi (BrowserWindow) oluşturur.
  - Donanım hızlandırmayı kapatarak GPU hatalarını engeller.
  - Dosya sistemiyle (fs) konuşan `ipcMain` komutlarını (Kasa yükle, kaydet, yol getir) yönetir.
- **`preload.js`**: **Güvenli Köprü (Bridge).**
  - Node.js'in tehlikeli yetkilerini frontend'e doğrudan vermez.
  - `contextBridge` kullanarak sadece ihtiyacımız olan fonksiyonları (şifreleme, kasa işlemleri) `window.api` altına güvenle açar.
- **`package.json`**: **Proje Beyni.**
  - Uygulama adını, versiyonunu ve bağımlılıklarını (Electron, builder vb.) tutar.
  - `npm run dist` komutunun nasıl çalışacağını ve EXE ikonunun (`787.ico`) nerede olduğunu belirler.

### 🎨 Görsel ve Mantıksal Arayüz (`src/` Klasörü)
- **`src/index.html`**: **Uygulamanın İskeleti.**
  - Kilit ekranı (Lock Screen), Ana Panel (Sidebar + Editor) ve Şifre Değiştirme modalı burada tanımlıdır.
- **`src/style.css`**: **Görsel Kimlik (Cyber Stealth Theme).**
  - Neon violet renkleri, karanlık tema ayarları, animasyonlar ve "Bul & Değiştir" çubuğunun tasarımı buradadır.
- **`src/renderer.js`**: **Kullanıcı Etkileşimi (Renderer Process).**
  - Butonlara tıklayınca ne olacağını, notların nasıl listeleneceğini ve en önemlisi **şifreleme akışını** yönetir.

### 📝 Dokümanlar ve Betikler
- **`PROJE_OZELLIKLERI.md`**: Bu detaylı rehber.
- **`README.md`**: GitHub için hazırlanan profesyonel tanıtım sayfası.
- **`RUN_APP.bat`**: Komut yazmadan uygulamayı anında başlatmak için.
- **`BUILD_EXE.bat`**: Tek tıkla uygulamayı paketleyip EXE yapmak için.
- **`787.ico`**: Uygulamanın her yerinde kullanılan resmi ikonu.

---

## 🔐 Şifreleme ve Veri Akışı (Security Workflow)

1.  **Giriş:** Kullanıcı şifreyi girince `scrypt` ile bir anahtar türetilir.
2.  **Doğrulama:** `vault.json` içindeki `verifier` çözülmeye çalışılır. "VAULT_VERIFIED" çıkarsa şifre doğrudur.
3.  **Deşifre:** Tüm notlar bellekte (RAM) tek tek çözülür ve listelenir.
4.  **Kayıt:** Yeni bir not eklendiğinde veya değiştirildiğinde, önce şifrelenir (`AES-256-GCM`), sonra `vault.json` üzerine yazılır.

---

## 📍 Veri Saklama Konumu (Vault Location)

Uygulama, verilerinizi asla proje klasöründe veya bulutta saklamaz. Yerel (Local) saklama alanı şurasıdır:

- **Windows:** `%APPDATA%\787-vault\vault.json`
- **Uygulama İçinden Görme:** Sol alttaki "Created by Zywexx • Powered by 787" yazısına tıkladığınızda bu yol anlık olarak karşınıza çıkar.

---

## 🏗️ Nesne Yapısı (Data Schema)

`vault.json` dosyasının iç yapısı şöyledir:
```json
{
  "salt": "GuzelBirTuzHexKodu",
  "verifier": { "content": "...", "iv": "...", "authTag": "..." },
  "notes": [
    {
      "id": "123456789",
      "title": { "content": "ŞifreliBaşlık", ... },
      "content": { "content": "ŞifreliNot", ... }
    }
  ]
}
```

---

**Bu proje Zywexx tarafından oluşturulmuş ve 787 teknolojisi ile güçlendirilmiştir.**
