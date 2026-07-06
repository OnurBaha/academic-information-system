# 📋 Proje Dokümantasyonu — Academic Information System

## 🎯 Proje Amacı

**Academic Information System**, bir üniversite ya da yüksekokul bünyesinde öğrencilerin, öğretmenlerin ve dekan/idari personelin akademik süreçleri tek bir platformdan yönetmesini sağlayan kapsamlı bir web uygulamasıdır.

Proje; ders kaydı, not yönetimi, devam takibi, ödev yönetimi, müfredat planlaması ve kurumsal raporlama gibi temel akademik iş akışlarını dijital ortama taşımayı hedefler.

---

## 🏗️ Mimari

### Genel Mimari

```
┌─────────────────────────────────────────────────┐
│                 React SPA (Vite)                │
│                                                 │
│  ┌──────────┐  ┌──────────┐  ┌──────────────┐  │
│  │ Student  │  │ Teacher  │  │     Dean     │  │
│  │  Module  │  │  Module  │  │    Module    │  │
│  └────┬─────┘  └────┬─────┘  └──────┬───────┘  │
│       │              │               │           │
│       └──────────────┴───────────────┘           │
│                      │                           │
│             ┌─────────────────┐                  │
│             │  Redux Toolkit  │                  │
│             │  (State Store)  │                  │
│             └────────┬────────┘                  │
│                      │ Axios                     │
└──────────────────────┼──────────────────────────┘
                       │
              ┌────────▼────────┐
              │   JSON Server   │
              │  (Mock REST API)│
              │  localhost:3001 │
              └─────────────────┘
```

### State Yönetimi (Redux Slices)

| Slice | Sorumluluk |
|---|---|
| `auth` | Kullanıcı oturumu ve rol bilgisi |
| `student` | Öğrenci verileri ve işlemleri |
| `teacher` | Öğretmen verileri ve işlemleri |
| `dean` | Dekan istatistik ve yönetim verileri |
| `course` | Ders kataloğu ve kayıt işlemleri |
| `announcements` | Sistem genelindeki duyurular |

---

## 🗂️ Modüller

### 1. Auth Modülü
- Rol tabanlı giriş sistemi (`student` / `teacher` / `dean`)
- Login sonrası otomatik yönlendirme
- Redux'ta oturum yönetimi

### 2. Öğrenci Modülü
Öğrencinin tüm akademik işlemlerini karşılar:
- **Dashboard**: Güncel not ortalaması, devam yüzdesi, yaklaşan sınavlar ve duyurular
- **Ders Kaydı**: Fakülte/bölüme göre filtrelenmiş ders seçimi, kredi limiti kontrolü
- **Notlar**: Ders notu görüntüleme, dönem/yıl bazlı GPA hesaplama
- **Devam**: Ders bazında devam yüzdesi ve uyarı eşiği takibi
- **Ödev Gönderimi**: Dosya yükleme ve son gün takibi
- **Belgeler**: Transkript, öğrenci durum belgesi, PDF formatında export
- **Takvim**: Ders, sınav ve etkinlik takvimi
- **Profil**: Kişisel bilgi yönetimi

### 3. Öğretmen Modülü
Öğretmenin ders yönetim araçlarını kapsar:
- **Dashboard**: Aktif dersler, öğrenci sayıları, not özeti
- **Dersler**: Ders içerikleri, haftalık plan ve materyal yönetimi
- **Not Girişi**: Öğrenciye not atama, not dönüştürme, toplu not güncelleme
- **Devam**: Yoklama alma, devamsızlık raporu
- **Ödev İnceleme**: Öğrenci gönderimlerini değerlendirme, geri bildirim yazma
- **Duyurular**: Ders bazlı duyuru oluşturma ve yönetimi
- **Canlı Yayın**: Online ders yayın yönetimi

### 4. Dekan Modülü
Kurumsal yönetim ve analitik araçları:
- **Genel Bakış**: Fakülte KPI'ları, öğrenci/öğretmen/ders istatistikleri
- **Fakülte Yönetimi**: Öğretmen ekleme/düzenleme/silme, görev atama
- **Müfredat**: Dönemlik ders planı ve müfredat oluşturma/düzenleme
- **Öğrenci Analitiği**: Başarı grafikleri, devam raporları, risk analizi
- **Onay Merkezi**: Kayıt talepleri, belge istekleri ve çeşitli onay süreçleri
- **Sistem Kontrolü**: Uygulama çapında yapılandırma ayarları
- **Denetim**: İşlem logları ve sistem izleme

---

## 🔄 Veri Akışı

```
Kullanıcı Eylemi
      │
      ▼
React Component (dispatch)
      │
      ▼
Redux Async Thunk (createAsyncThunk)
      │
      ▼
Axios → JSON Server REST API
      │
      ▼
JSON db.json güncellemesi
      │
      ▼
Redux State güncellenir
      │
      ▼
React bileşen yeniden render
```

---

## 🛣️ Sayfa Rotaları

### Ortak
| Rota | Bileşen |
|---|---|
| `/login` | `Auth/Login` |

### Öğrenci (`/student/...`)
| Rota | Bileşen |
|---|---|
| `/student/dashboard` | Dashboard |
| `/student/courses` | Dersler |
| `/student/course-registration` | Ders Kaydı |
| `/student/grades` | Notlar |
| `/student/schedule` | Devam |
| `/student/homework` | Ödev Gönderimi |
| `/student/documents` | Belgeler |
| `/student/calendar` | Takvim |
| `/student/academic-calendar` | Akademik Takvim |
| `/student/exams` | Sınav Takvimi |
| `/student/profile` | Profil |

### Öğretmen (`/teacher/...`)
| Rota | Bileşen |
|---|---|
| `/teacher/dashboard` | Dashboard |
| `/teacher/lessons` | Dersler |
| `/teacher/grades` | Not Girişi |
| `/teacher/attendance` | Devam |
| `/teacher/homework` | Ödev İnceleme |
| `/teacher/announcements` | Duyurular |
| `/teacher/live` | Canlı Yayın |
| `/teacher/profile` | Profil |

### Dekan (`/dean/...`)
| Rota | Bileşen |
|---|---|
| `/dean/overview` | Genel Bakış |
| `/dean/faculty` | Fakülte Yönetimi |
| `/dean/curriculum` | Müfredat |
| `/dean/analytics` | Öğrenci Analitiği |
| `/dean/approvals` | Onay Merkezi |
| `/dean/system-control` | Sistem Kontrolü |
| `/dean/oversight` | Denetim |
| `/dean/profile` | Profil |

---

## 🧩 Bileşen Mimarisi

```
src/components/
├── UI/
│   ├── ConfirmationModal.jsx   # Genel onay modalı
│   └── ...
├── approvals/                  # Onay süreci bileşenleri
├── curriculum/                 # Müfredat düzenleyici bileşenler
└── overview/                   # Özet istatistik bileşenleri

src/layouts/
├── AuthLayout.jsx              # Sadece Outlet içerir (login için)
└── MainLayout.jsx              # Sidebar + Header + Outlet
```

---

## 🗄️ Mock Veritabanı (db.json)

JSON Server ile çalışan REST API aşağıdaki koleksiyonları barındırır:

- `users` — Tüm kullanıcılar (öğrenci, öğretmen, dekan)
- `courses` — Ders kataloğu
- `enrollments` — Öğrenci ders kayıtları
- `grades` — Not kayıtları
- `attendance` — Devam kayıtları
- `homework` — Ödevler
- `submissions` — Ödev gönderileri
- `announcements` — Duyurular
- `faculties` — Fakülte/bölüm bilgileri
- `curriculum` — Müfredat planları
- `approvals` — Onay talepleri
- `documents` — Belge istekleri

API endpoint örneği: `GET http://localhost:3001/courses`

---

## 🧪 Geliştirme Notları

- **Eş zamanlı başlatma**: `npx concurrently` ile frontend ve mock API aynı anda başlatılabilir.
- **HMR**: Vite'ın Hot Module Replacement özelliği aktiftir.
- **db.json izleme**: `vite.config.js`'de `db.json` dosyası watch listesinden dışlanmıştır, böylece JSON Server değişikliklerinde Vite gereksiz yere yeniden başlamaz.
- **PDF Export**: `jsPDF` ve `jsPDF-AutoTable` ile transkript ve belgeler tarayıcı üzerinden PDF olarak indirilebilir.
- **Toast Bildirimleri**: `react-hot-toast` ile işlem sonuçları kullanıcıya anlık bildirim olarak gösterilir.

---

## 📌 Gelecek Geliştirmeler (Roadmap)

- [ ] Gerçek backend entegrasyonu (Node.js / Django / Spring Boot)
- [ ] JWT tabanlı kimlik doğrulama
- [ ] Çok dil desteği (i18n) — Türkçe / İngilizce
- [ ] Karanlık / Açık tema geçişi
- [ ] Mobil uygulama (React Native)
- [ ] E-posta bildirimleri
- [ ] Sınav sonucu otomatik hesaplama
- [ ] Öğretmen/Öğrenci mesajlaşma sistemi

---

## 👤 Geliştirici

Bu proje akademik amaçlarla geliştirilmiştir.
