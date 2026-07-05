/**
 * studentData.js
 * Student sayfalarında kullanılan tüm statik/sabit UI verileri.
 * API veya db.json'dan gelen dinamik veriler buraya dahil edilmez.
 */

// ─── Calendar ────────────────────────────────────────────────────────────────

/**
 * Mini takvim hücreleri: Mayıs – Haziran 2026.
 * Mayıs 2026: 4 Mayıs'tan başlar (Pazartesi).
 * 1-4. Haftalar: Mayıs normal ders haftaları
 * 5. Hafta: Final sınav haftası (1-7 Haziran)
 * 6. Hafta: Final sonrası derssiz hafta (8-14 Haziran - Bugün 12 Haziran Cuma bu haftadadır)
 * 7. Hafta: Bütünleme hazırlık haftası (15-21 Haziran)
 * 8. Hafta: Bütünleme sınav haftası (22-28 Haziran)
 */
export const miniCalendarWeeks = [
  // 1. Hafta (4 - 10 Mayıs)
  [
    { day: 4,  month: 'May', key: 'may4' },
    { day: 5,  month: 'May', key: 'may5' },
    { day: 6,  month: 'May', key: 'may6' },
    { day: 7,  month: 'May', key: 'may7' },
    { day: 8,  month: 'May', key: 'may8' },
    { day: 9,  month: 'May', key: 'may9', isWeekend: true },
    { day: 10, month: 'May', key: 'may10', isWeekend: true }
  ],
  // 2. Hafta (11 - 17 Mayıs)
  [
    { day: 11, month: 'May', key: 'may11' },
    { day: 12, month: 'May', key: 'may12' },
    { day: 13, month: 'May', key: 'may13' },
    { day: 14, month: 'May', key: 'may14' },
    { day: 15, month: 'May', key: 'may15' },
    { day: 16, month: 'May', key: 'may16', isWeekend: true },
    { day: 17, month: 'May', key: 'may17', isWeekend: true }
  ],
  // 3. Hafta (18 - 24 Mayıs)
  [
    { day: 18, month: 'May', key: 'may18' },
    { day: 19, month: 'May', key: 'may19' },
    { day: 20, month: 'May', key: 'may20' },
    { day: 21, month: 'May', key: 'may21' },
    { day: 22, month: 'May', key: 'may22' },
    { day: 23, month: 'May', key: 'may23', isWeekend: true },
    { day: 24, month: 'May', key: 'may24', isWeekend: true }
  ],
  // 4. Hafta (25 - 31 Mayıs)
  [
    { day: 25, month: 'May', key: 'may25' },
    { day: 26, month: 'May', key: 'may26' },
    { day: 27, month: 'May', key: 'may27' },
    { day: 28, month: 'May', key: 'may28' },
    { day: 29, month: 'May', key: 'may29' },
    { day: 30, month: 'May', key: 'may30', isWeekend: true },
    { day: 31, month: 'May', key: 'may31', isWeekend: true }
  ],
  // 5. Hafta (1 - 7 Haziran - Final Sınavları)
  [
    { day: 1,  month: 'Haz', key: 'haz1' },
    { day: 2,  month: 'Haz', key: 'haz2' },
    { day: 3,  month: 'Haz', key: 'haz3' },
    { day: 4,  month: 'Haz', key: 'haz4' },
    { day: 5,  month: 'Haz', key: 'haz5' },
    { day: 6,  month: 'Haz', key: 'haz6', isWeekend: true },
    { day: 7,  month: 'Haz', key: 'haz7', isWeekend: true }
  ],
  // 6. Hafta (8 - 14 Haziran - Bugünün Yer Aldığı Hafta)
  [
    { day: 8,  month: 'Haz', key: 'haz8' },
    { day: 9,  month: 'Haz', key: 'haz9' },
    { day: 10, month: 'Haz', key: 'haz10' },
    { day: 11, month: 'Haz', key: 'haz11' },
    { day: 12, month: 'Haz', key: 'haz12' },
    { day: 13, month: 'Haz', key: 'haz13', isWeekend: true },
    { day: 14, month: 'Haz', key: 'haz14', isWeekend: true }
  ],
  // 7. Hafta (15 - 21 Haziran)
  [
    { day: 15, month: 'Haz', key: 'haz15' },
    { day: 16, month: 'Haz', key: 'haz16' },
    { day: 17, month: 'Haz', key: 'haz17' },
    { day: 18, month: 'Haz', key: 'haz18' },
    { day: 19, month: 'Haz', key: 'haz19' },
    { day: 20, month: 'Haz', key: 'haz20', isWeekend: true },
    { day: 21, month: 'Haz', key: 'haz21', isWeekend: true }
  ],
  // 8. Hafta (22 - 28 Haziran - Bütünleme Sınavları)
  [
    { day: 22, month: 'Haz', key: 'haz22' },
    { day: 23, month: 'Haz', key: 'haz23' },
    { day: 24, month: 'Haz', key: 'haz24' },
    { day: 25, month: 'Haz', key: 'haz25' },
    { day: 26, month: 'Haz', key: 'haz26' },
    { day: 27, month: 'Haz', key: 'haz27', isWeekend: true },
    { day: 28, month: 'Haz', key: 'haz28', isWeekend: true }
  ]
]

// ─── Courses ─────────────────────────────────────────────────────────────────

/** Ders forumu için demo gönderileri. */
export const defaultForumPosts = [
  {
    id: 1,
    author: 'Mehmet Emin',
    avatar: 'ME',
    time: '2 saat önce',
    text: 'useEffect içindeki dependency array boş olduğunda gerçekten sadece bir kez mi çalışıyor?',
    likes: 12,
    replies: 2,
    hasLiked: false,
    repliesList: [
      { id: 101, author: 'Nazlı BAŞAK', avatar: 'NB', role: 'Eğitmen', time: '1 saat önce',     text: 'Evet Mehmet Emin, boş bağımlılık dizisi ile useEffect sadece component mount edildiğinde bir kez çalışır.' },
      { id: 102, author: 'Elif Soylu',   avatar: 'ES',                   time: '30 dakika önce', text: 'Eğer return fonksiyonu eklerseniz o da component unmount edilirken (kaldırılırken) çalışacaktır.' }
    ]
  },
  {
    id: 2,
    author: 'Dr. Nazlı BAŞAK',
    avatar: 'NB',
    role: 'Eğitmen',
    time: '1 gün önce',
    text: 'Gelecek hafta yapılacak canlı ders için hazırlık PDF\'lerini ekledim, inceleyebilirsiniz.',
    likes: 45,
    replies: 1,
    hasLiked: false,
    repliesList: [
      { id: 201, author: 'Mert Akın', avatar: 'MA', time: '12 saat önce', text: 'Teşekkürler hocam, PDF\'leri indirdim ve çalışmaya başladım.' }
    ]
  }
]

/** Ders koduna göre kısa tanıtım metni. */
export const courseDescriptions = {
  'DBM 301': 'Bu ders ilişkisel veri tabanı tasarımı, SQL sorgulama dili, veri tabanı normalizasyon teorisi, indeksleme mekanizmaları, transaction yönetimi ve veri tabanı güvenliği konularını kapsamlı bir şekilde incelemektedir.',
  'OPS 302': 'İşletim sistemlerinin temel kavramları; süreç yönetimi (process management), CPU zamanlaması, bellek yönetimi (memory management), sanal bellek (virtual memory), dosya sistemleri ve eşzamanlılık (concurrency) konularını teorik ve pratik yönleriyle ele almaktadır.',
  'SE 305':  'Yazılım geliştirme yaşam döngüsü (SDLC) modelleri, çevik (agile) metodolojiler, gereksinim analizi, UML diyagramları ile nesne yönelimli analiz ve tasarım, tasarım şablonları (design patterns) ve yazılım test stratejilerini içermektedir.',
  'NET 305': 'Bilgisayar ağları mimarisi, OSI referans modeli ve TCP/IP protokol yığını; veri iletimi, yönlendirme (routing) algoritmaları, sıkışıklık kontrolü (congestion control) ve ağ güvenliği temel prensiplerini incelemektedir.',
  'ML 307': 'Arama algoritmaları (A*, heuristik arama), makine öğrenmesi temelleri, denetimli ve denetimsiz öğrenme, yapay sinir ağları, karar ağaçları, doğal dil işleme ve yapay zekanın etik sorunlarını konu almaktadır.',
  'HC 309':  'Kullanıcı odaklı tasarım felsefesi, kullanılabilirlik testleri, etkileşim modelleri, arayüz tasarım prensipleri, prototipleme araçları ve engelsiz erişim standartlarını ele almaktadır.',
  'WEB 307': 'Bu ders, modern web geliştirme teknolojileri, HTML5, CSS3, Javascript, React kütüphanesi, durum yönetimi (Redux/Context API), bileşen tabanlı geliştirme ve istemci taraflı yönlendirme konularını ele almaktadır.'
}

/** Ders koduna göre izlence (syllabus) başlıkları. */
export const syllabusOutlines = {
  'DBM 301': [
    'Veri Tabanı Sistemlerine Giriş ve Temel Kavramlar',
    'Varlık-İlişki (E-R) Modellemesi ve İlişkisel Model',
    'İlişkisel Cebir ve SQL Sorgulama Diline Giriş',
    'Gelişmiş SQL: Alt Sorgular, Join Türleri ve Tetikleyiciler (Triggers)',
    'Veri Tabanı Tasarımı ve Normalizasyon (1NF, 2NF, 3NF, BCNF)',
    'İndeksleme ve Sorgu Optimizasyonu Temelleri',
    'İşlem (Transaction) Yönetimi, Eşzamanlılık Kontrolü ve ACID Kuralları',
    'NoSQL Veri Tabanları ve Dağıtık Mimariler'
  ],
  'OPS 302': [
    'İşletim Sistemlerine Giriş ve Bilgisayar Mimarisi Temelleri',
    'Süreç (Process) ve Thread Kavramları, Süreç Durumları',
    'CPU Zamanlama Algoritmaları (FCFS, SJF, Round Robin, Öncelikli Zamanlama)',
    'Süreç Eşzamanlaması (Critical Section, Semaförler ve Mutex Yapıları)',
    'Kilitlenmeler (Deadlocks) - Belirleme, Önleme ve Kaçınma Yöntemleri',
    'Ana Bellek Yönetimi: Bölümleme, Paging ve Segmentation',
    'Sanal Bellek (Virtual Memory) ve Sayfa Değiştirme Algoritmaları',
    'Dosya Sistemleri Yapısı ve Disk Zamanlama Yöntemleri'
  ],
  'SE 305': [
    'Yazılım Mühendisliği Tanımı ve Tarihçesi',
    'Yazılım Geliştirme Yaşam Döngüsü (SDLC) Modelleri (Şelale, Çevik)',
    'Gereksinim Analizi ve Belgelendirme (SRS)',
    'Nesne Yönelimli Modelleme ve UML Diyagramları',
    'Yazılım Mimarileri ve Tasarım Prensipleri (SOLID)',
    'Tasarım Şablonları (Design Patterns) - Yaratıcı, Yapısal ve Davranışsal Şablonlar',
    'Yazılım Doğrulama ve Geçerleme: Birim, Entegrasyon ve Sistem Testleri',
    'Yazılım Proje Yönetimi: Kestirimler, Risk Yönetimi ve Sürüm Kontrolü'
  ],
  'NET 305': [
    'Bilgisayar Ağlarına Giriş, Ağ Topolojileri ve OSI Modeli',
    'Fiziksel Katman: Kablolu/Kablosuz İletim ve Veri Kodlama',
    'Veri Bağı Katmanı: Hata Belirleme, Akış Kontrolü ve Çoklu Erişim (MAC)',
    'Ağ Katmanı: IPv4, IPv6 Adresleme ve Yönlendirme Protokolleri (OSPF, BGP)',
    'Taşıma Katmanı: Port Kavramı, UDP ve TCP (Bağlantı Kurulumu, Güvenilir İletim)',
    'Uygulama Katmanı: DNS, HTTP, FTP, SMTP Protokolleri',
    'Ağ Güvenliği Temelleri: Şifreleme, Güvenlik Duvarları ve VPN Teknolojileri',
    'Geleceğin Ağ Teknolojileri (SDN, Bulut Bilişim Ağ Altyapısı)'
  ],
  'ML 307': [
    'Yapay Zeka ve Akıllı Ajanların Tanımı',
    'Problem Çözme ve Heuristik Arama Yöntemleri (A*, Greedy BFS)',
    'Bilgi Temsili ve Mantıksal Akıl Yürütme',
    'Makine Öğrenmesine Giriş: Denetimli ve Denetimsiz Öğrenme',
    'Regresyon ve Sınıflandırma Algoritmaları (KNN, Naive Bayes)',
    'Karar Ağaçları ve Rastgele Orman (Random Forest) Modelleri',
    'Yapay Sinir Ağları (YSA) ve Derin Öğrenmeye Giriş',
    'Yapay Zekada Etik, Önyargı ve Sorumluluk Tartışmaları'
  ],
  'HC 309': [
    'İnsan-Bilgisayar Etkileşimine Giriş ve Temel İlkeler',
    'Bilişsel Modeller ve Kullanıcı Özelliklerinin Analizi',
    'Kullanıcı Odaklı Tasarım Süreci ve Gereksinim Toplama',
    'Arayüz Tasarım Prensipleri ve Rehberler (Don Norman Kuralları)',
    'Prototipleme Yöntemleri: Kağıt Prototip ve Dijital Araçlar (Figma, Adobe XD)',
    'Kullanılabilirlik Değerlendirme ve Heuristik Analiz Yöntemleri',
    'Engelsiz Erişim (Accessibility) Standartları (W3C-WAI)',
    'Geleceğin Etkileşim Teknolojileri (Ses Kontrolü, VR/AR Arayüzleri)'
  ],
  'WEB 307': [
    'Web Teknolojilerine Giriş, HTML5 ve CSS3 Standartları',
    'Modern Javascript (ES6+) Özellikleri ve Asenkron Programlama',
    'React Kütüphanesi Temelleri ve Bileşen (Component) Mimarisi',
    'State ve Props Kavramları, Olay Yönetimi',
    'React Hooks (useState, useEffect, useMemo, useCallback)',
    'Context API ve Redux ile Global Durum Yönetimi (State Management)',
    'React Router ile İstemci Taraflı Sayfa Yönlendirmeleri',
    'RESTful API Entegrasyonu ve Axios Kullanımı'
  ]
}

// ─── Profile ─────────────────────────────────────────────────────────────────

/** Profil sayfasında gösterilen akademik rozetler. */
export const academicBadges = [
  {
    title: 'Üstün Başarı',
    description: 'Dönem Ortalaması 3.90+',
    icon: 'auto_awesome',
    colorClass: 'bg-blue-500/10 border-blue-500/20 text-blue-600 dark:text-blue-400'
  },
  {
    title: 'Aktif Katılımcı',
    description: '15+ Kulüp Etkinliği',
    icon: 'groups',
    colorClass: 'bg-indigo-500/10 border-indigo-500/20 text-indigo-600 dark:text-indigo-400'
  },
  {
    title: 'Kod Ustası',
    description: 'GitHub Final Projesi',
    icon: 'code',
    colorClass: 'bg-emerald-500/10 border-emerald-500/20 text-emerald-600 dark:text-emerald-400'
  }
]

/**
 * Sertifika listesi yüklenemezse kullanılan fallback verisi.
 * Profile.jsx ve Documents.jsx tarafından paylaşılır.
 */
export const fallbackCertificates = [
  {
    id: 1,
    name: 'Full-Stack Developer Başarı Sertifikası',
    issuer: 'SoftIto Akademi',
    date: '12 Eylül 2023',
    licenseId: 'SO-2023-9941-XF',
    icon: 'workspace_premium',
    bgColor: 'bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400'
  },
  {
    id: 2,
    name: 'Veri Yapıları ve Algoritmalar',
    issuer: 'SoftIto Akademi',
    date: '05 Haziran 2023',
    licenseId: 'SO-2023-8822-DS',
    icon: 'terminal',
    bgColor: 'bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400'
  },
  {
    id: 3,
    name: 'Siber Güvenlik Temelleri',
    issuer: 'SoftIto Akademi',
    date: '18 Mart 2023',
    licenseId: 'SO-2023-1120-SC',
    icon: 'security',
    bgColor: 'bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400'
  }
]

// ─── Documents ───────────────────────────────────────────────────────────────

/**
 * Belge sayfasında API'den sertifika gelmezse kullanılan fallback.
 * Profil sayfasındaki fallbackCertificates ile aynı kaynaktan beslenir.
 */
export const defaultCertificates = [
  { id: 'cert-1', name: 'React Developer Certificate',  issuer: 'Softito Academy',   date: '15.01.2026' },
  { id: 'cert-2', name: 'Full-Stack Web Development',   issuer: 'AIS Certification', date: '10.03.2026' }
]

// ─── HomeworkSubmit ───────────────────────────────────────────────────────────

export const initialHomeworks = [
  {
    id: 'row-1',
    courseName: 'Database Management Systems',
    courseCode: 'DBM 301',
    title: 'SQL Veritabanı Optimizasyonu',
    dueDate: '22.05.2026 - 23:59',
    daysLeft: null,
    status: 'Teslim Edildi',
    submittedAt: '20.05.2026 14:15',
    submittedFileName: 'Ahmet_Yilmaz_Database_Design_Raporu.pdf',
    studentNote: 'Veritabanı şeması ve normalizasyon analizlerini içeren rapor dosyası ekte sunulmuştur.',
    colorClass: 'bg-indigo-100/50 text-indigo-600 dark:bg-indigo-950/40 dark:text-indigo-400'
  },
  {
    id: 'row-2',
    courseName: 'Operating Systems',
    courseCode: 'OPS 302',
    title: 'CPU Zamanlama Simülasyonu',
    dueDate: '24.05.2026 - 23:59',
    daysLeft: null,
    status: 'Teslim Edildi',
    submittedAt: '24.05.2026 11:30',
    submittedFileName: 'Ahmet_Yilmaz_Process_Scheduler_Analizi.pdf',
    studentNote: 'CPU zamanlama simülasyonu raporu ve ekran görüntüleri ektedir.',
    colorClass: 'bg-indigo-100/50 text-indigo-600 dark:bg-indigo-950/40 dark:text-indigo-400'
  },
  {
    id: 'row-3',
    courseName: 'Software Engineering',
    courseCode: 'SE 305',
    title: 'Gereksinim Analizi Raporu',
    dueDate: '05.06.2026 - 23:59',
    daysLeft: null,
    status: 'Teslim Edildi',
    submittedAt: '28.05.2026 16:45',
    submittedFileName: 'Ahmet_Yilmaz_Gereksinim_Analiz_Dokumani.pdf',
    studentNote: 'SOLID prensiplerine uygun olarak hazırlanan UML sınıf diyagramları ve SRS dokümanı ektedir.',
    colorClass: 'bg-indigo-100/50 text-indigo-600 dark:bg-indigo-950/40 dark:text-indigo-400'
  },
  {
    id: 'row-4',
    courseName: 'Web Programming',
    courseCode: 'WEB 307',
    title: 'React Hooks ve Context API',
    dueDate: '28.05.2026 - 23:59',
    daysLeft: null,
    status: 'Teslim Edildi',
    submittedAt: '30.05.2026 10:20',
    submittedFileName: 'Ahmet_Yilmaz_React_Single_Page_App.zip',
    studentNote: 'Redux State Management kullanan e-ticaret arayüzü kaynak kodları ve kurulum rehberi ektedir.',
    colorClass: 'bg-indigo-100/50 text-indigo-600 dark:bg-indigo-950/40 dark:text-indigo-400'
  },
  {
    id: 'row-5',
    courseName: 'Computer Networks',
    courseCode: 'NET 305',
    title: 'Alt Ağ Maskeleme Projesi',
    dueDate: '03.06.2026 - 23:59',
    daysLeft: null,
    status: 'Teslim Edildi',
    submittedAt: '02.06.2026 15:10',
    submittedFileName: 'Ahmet_Yilmaz_Packet_Tracer_Agi.pdf',
    studentNote: 'Cisco Packet Tracer üzerinde tasarlanan alt ağ maskeleme ve yönlendirme raporu ekte yer almaktadır.',
    colorClass: 'bg-indigo-100/50 text-indigo-600 dark:bg-indigo-950/40 dark:text-indigo-400'
  },
  {
    id: 'row-6',
    courseName: 'Machine Learning',
    courseCode: 'ML 307',
    title: 'Classification Model Raporu',
    dueDate: '06.06.2026 - 23:59',
    daysLeft: null,
    status: 'Teslim Edildi',
    submittedAt: '05.06.2026 09:30',
    submittedFileName: 'Ahmet_Yilmaz_Classification_Model_Raporu.pdf',
    studentNote: 'Karar ağaçları ve yapay sinir ağı performans metrikleri analiz raporudur.',
    colorClass: 'bg-indigo-100/50 text-indigo-600 dark:bg-indigo-950/40 dark:text-indigo-400'
  },
  {
    id: 'row-7',
    courseName: 'Human-Computer Interaction',
    courseCode: 'HC 309',
    title: 'Dönem Sonu Bitirme Projesi Raporu',
    dueDate: '17.06.2026 - 23:59',
    daysLeft: 5,
    status: 'Bekliyor',
    colorClass: 'bg-amber-100/50 text-amber-600 dark:bg-amber-950/40 dark:text-amber-400'
  }
]
