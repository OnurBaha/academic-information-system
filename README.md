# 🎓 Academic Information System

A full-featured academic management platform built with **React**, **Redux Toolkit**, **TailwindCSS v4**, and **JSON Server**. The system supports three distinct user roles — **Student**, **Teacher**, and **Dean** — each with their own dedicated dashboard and feature set.

---

## 📸 Proje Özeti

Bu proje; öğrenciler, öğretmenler ve dekanlar için kapsamlı bir akademik yönetim sistemi sunar. Ders kaydı, not girişi, devam takibi, ödev yönetimi, müfredat planlaması ve pek çok özelliği barındıran bu sistem, modern bir web arayüzü ile kullanıma hazırdır.

---

## 🚀 Kurulum ve Çalıştırma

### Gereksinimler

- Node.js >= 18
- npm >= 9

### Adımlar

```bash
# Bağımlılıkları yükle
npm install

# Frontend ve JSON Server'ı aynı anda başlat
npx concurrently "npm run dev" "npm run server"
```

Uygulama varsayılan olarak `http://localhost:5173` adresinde, API ise `http://localhost:3001` adresinde çalışır.

> **Not:** Vite, geliştirme modunda `/api` isteklerini otomatik olarak `localhost:3001`'e proxy'ler. Bu nedenle `npm run dev` ve `npm run server`'ı eş zamanlı çalıştırman gerekir.

### Ayrı Başlatma

```bash
# Yalnızca frontend
npm run dev

# Yalnızca JSON Server (Mock API)
npm run server

# Production build
npm run build

# Build önizleme
npm run preview
```

---

## ☁️ Vercel'e Dağıtım

Bu proje Vercel'e hazır hâle getirilmiştir. JSON Server, `api/server.js` dosyasıyla **Vercel Serverless Function** olarak çalışır.

### Nasıl Çalışır?

```
Tarayıcı → /api/users
    ↓
Vercel (vercel.json rewrites)
    ↓
api/server.js (Serverless Function)
    ↓
json-server v1 (db.json'dan veri okur)
    ↓
JSON yanıt döner
```

### Dağıtım Adımları

1. [vercel.com](https://vercel.com) hesabı aç (ücretsiz)
2. GitHub reposunu Vercel'e bağla
3. **Build Command:** `npm run build`  
   **Output Directory:** `dist`  
   **Install Command:** `npm install`
4. **Deploy** butonuna bas — Vercel gerisini otomatik halleder.

> ⚠️ **Önemli:** Vercel'in dosya sistemi salt okunurdur. `POST`, `PATCH`, `DELETE` gibi yazma işlemleri o oturum için geçerlidir; sunucu yeniden başladığında veriler `db.json`'daki orijinal haline döner. Demo/akademik projeler için bu normaldir.

---

## 🛠️ Teknoloji Yığını

| Katman | Teknoloji |
|---|---|
| UI Framework | React 19 |
| State Management | Redux Toolkit + React-Redux |
| Routing | React Router DOM v7 |
| Styling | TailwindCSS v4 |
| HTTP Client | Axios |
| Mock API | JSON Server |
| PDF Üretimi | jsPDF + jsPDF-AutoTable |
| Bildirimler | React Hot Toast |
| Build Tool | Vite 8 |

---

## 📁 Proje Yapısı

```
academic-information-system/
├── public/                     # Statik dosyalar
├── src/
│   ├── assets/                 # Görseller ve statik varlıklar
│   ├── components/             # Yeniden kullanılabilir bileşenler
│   │   ├── UI/                 # Genel UI bileşenleri (Modal, vb.)
│   │   ├── approvals/          # Onay işlemleri bileşenleri
│   │   ├── curriculum/         # Müfredat bileşenleri
│   │   └── overview/           # Genel bakış bileşenleri
│   ├── layouts/                # Sayfa düzeni bileşenleri
│   │   ├── AuthLayout.jsx      # Giriş sayfası layout'u
│   │   └── MainLayout.jsx      # Ana uygulama layout'u (Sidebar vb.)
│   ├── pages/                  # Route bazlı sayfa bileşenleri
│   │   ├── Auth/               # Giriş sayfası
│   │   ├── Student/            # Öğrenci modülü sayfaları
│   │   ├── Teacher/            # Öğretmen modülü sayfaları
│   │   └── Dean/               # Dekan modülü sayfaları
│   ├── services/
│   │   └── api.js              # Axios API yapılandırması
│   ├── store/                  # Redux Toolkit store
│   │   ├── auth/               # Auth slice
│   │   ├── student/            # Student slice
│   │   ├── teacher/            # Teacher slice
│   │   ├── dean/               # Dean slice
│   │   ├── course/             # Course slice
│   │   ├── announcement/       # Announcement slice
│   │   └── index.js            # Store konfigürasyonu
│   ├── utils/                  # Yardımcı fonksiyonlar
│   ├── App.jsx                 # Ana Router bileşeni
│   └── main.jsx                # Uygulama giriş noktası
├── db.json                     # JSON Server mock veritabanı
├── package.json
└── vite.config.js
```

---

## 👥 Kullanıcı Rolleri ve Özellikler

### 🎓 Öğrenci
| Sayfa | Açıklama |
|---|---|
| Dashboard | Genel özet, duyurular, yaklaşan etkinlikler |
| Dersler | Kayıtlı ders listesi ve detayları |
| Ders Kaydı | Dönemlik ders seçimi ve kayıt |
| Notlar | Ders notları ve GPA hesaplama |
| Devam Durumu | Ders devam takibi |
| Ödev Gönderimi | Ödev yükleme ve takip |
| Belgeler | Transkript, öğrenci belgesi vb. (PDF export) |
| Takvim | Akademik ve ders takvimi |
| Akademik Takvim | Dönem başı/sonu ve önemli tarihler |
| Sınav Takvimi | Sınav tarihleri ve yerleri |
| Profil | Kişisel bilgiler ve ayarlar |

### 👩‍🏫 Öğretmen
| Sayfa | Açıklama |
|---|---|
| Dashboard | Ders ve öğrenci özeti |
| Dersler | Ders yönetimi ve içerik planlaması |
| Not Girişi | Öğrencilere not atama |
| Devam | Yoklama alma ve yönetimi |
| Ödev İnceleme | Gönderilen ödevlerin değerlendirilmesi |
| Duyurular | Ders bazlı duyuru oluşturma |
| Canlı Yayın | Online ders yayını |

### 🏛️ Dekan
| Sayfa | Açıklama |
|---|---|
| Genel Bakış | Fakülte genelinde özet istatistikler |
| Fakülte | Öğretmen ve personel yönetimi |
| Müfredat | Ders planı ve müfredat yönetimi |
| Öğrenci Analitiği | Öğrenci performans ve istatistik raporları |
| Onay Merkezi | Kayıt, belge ve talep onayları |
| Sistem Kontrolü | Uygulama genel ayarları |
| Denetim | Sistem genelinde log ve izleme |

---

## 🔐 Kimlik Doğrulama

Sistem, rol tabanlı kimlik doğrulama kullanır. Giriş yapan kullanıcının rolüne (`student`, `teacher`, `dean`) göre ilgili dashboard'a yönlendirme yapılır. Oturum bilgileri Redux Store üzerinde tutulur.

---

## 📄 Lisans

Bu proje eğitim amaçlı geliştirilmiştir.
