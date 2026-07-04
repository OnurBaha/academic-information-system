import { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { fetchStudentCourses } from '../../store/student/studentSlice'
import { toast } from 'react-hot-toast'

// Müfredat Verileri (Ders bazlı dinamik bölümler)
const courseCurriculum = {
  "SOFT-302": [
    {
      title: "Bölüm 1: Yazılım Mimarisi Temelleri",
      lectures: [
        { id: "dQw4w9WgXcQ", title: "01. Yazılım Tasarım İlkelerine Giriş", duration: "12:30", completed: true },
        { id: "84WUGpO5HU4", title: "02. Katmanlı Mimari ve Gevşek Bağlılık", duration: "45:12", completed: true }
      ]
    },
    {
      title: "Bölüm 2: Tasarım Desenleri (Design Patterns)",
      lectures: [
        { id: "PLbW6i5NrkU", title: "03. Creational Patterns (Singleton, Factory)", duration: "28:40", completed: true },
        { id: "6dvRik84CIk", title: "04. Behavioral Patterns (Observer, Strategy)", duration: "35:10", completed: false }
      ]
    }
  ],
  "SOFT-304": [
    {
      title: "Bölüm 1: React & Framework Temelleri",
      lectures: [
        { id: "5t4WhR58JAk", title: "01. Modern JavaScript ve React JSX Giriş", duration: "15:20", completed: true },
        { id: "dQw4w9WgXcQ", title: "02. State ve Props Yönetimi", duration: "32:45", completed: true }
      ]
    },
    {
      title: "Bölüm 2: Gelişmiş State ve Lifecycle",
      lectures: [
        { id: "84WUGpO5HU4", title: "03. useEffect ve Lifecycle Yönetimi", duration: "42:15", completed: false },
        { id: "6dvRik84CIk", title: "04. Custom Hooks ve Performans Optimizasyonu", duration: "25:30", completed: false }
      ]
    }
  ],
  "default": [
    {
      title: "Bölüm 1: Akademik Derse Giriş",
      lectures: [
        { id: "dQw4w9WgXcQ", title: "01. Dönem Planı ve Müfredat Tanıtımı", duration: "10:15", completed: true },
        { id: "84WUGpO5HU4", title: "02. Temel Kavramlar ve Kurulumlar", duration: "22:40", completed: true }
      ]
    },
    {
      title: "Bölüm 2: Uygulamalı Laboratuvar",
      lectures: [
        { id: "PLbW6i5NrkU", title: "03. İlk Proje ve Pratik Uygulamalar", duration: "30:50", completed: false },
        { id: "6dvRik84CIk", title: "04. Değerlendirme Soruları ve Özet", duration: "15:20", completed: false }
      ]
    }
  ]
}

const defaultForumPosts = [
  {
    id: 1,
    author: "Mehmet Emin",
    avatar: "ME",
    time: "2 saat önce",
    text: "useEffect içindeki dependency array boş olduğunda gerçekten sadece bir kez mi çalışıyor?",
    likes: 12,
    replies: 2,
    hasLiked: false,
    repliesList: [
      { id: 101, author: "Ahmet Yılmaz", avatar: "AY", role: "Eğitmen", time: "1 saat önce", text: "Evet Mehmet Emin, boş bağımlılık dizisi ile useEffect sadece component mount edildiğinde bir kez çalışır." },
      { id: 102, author: "Elif Soylu", avatar: "ES", time: "30 dakika önce", text: "Eğer return fonksiyonu eklerseniz o da component unmount edilirken (kaldırılırken) çalışacaktır." }
    ]
  },
  {
    id: 2,
    author: "Dr. Ahmet Yılmaz",
    avatar: "AY",
    role: "Eğitmen",
    time: "1 gün önce",
    text: "Gelecek hafta yapılacak canlı ders için hazırlık PDF'lerini ekledim, inceleyebilirsiniz.",
    likes: 45,
    replies: 1,
    hasLiked: false,
    repliesList: [
      { id: 201, author: "Mert Akın", avatar: "MA", time: "12 saat önce", text: "Teşekkürler hocam, PDF'leri indirdim ve çalışmaya başladım." }
    ]
  }
]

export default function Courses() {
  const dispatch = useDispatch()
  const { user } = useSelector((state) => state.auth)
  const { studentCourses, status: studentCoursesStatus } = useSelector((state) => state.student)

  // Sayfa durumları
  const [selectedCourseCode, setSelectedCourseCode] = useState('')
  const [activeLecture, setActiveLecture] = useState(null)
  const [activeTab, setActiveTab] = useState('notes') // 'notes' | 'code' | 'forum'
  
  // Etkileşim durumları
  const [likes, setLikes] = useState(148)
  const [hasLiked, setHasLiked] = useState(false)
  const [forumPosts, setForumPosts] = useState(defaultForumPosts)
  const [newQuestion, setNewQuestion] = useState('')
  const [expandedSections, setExpandedSections] = useState({ 0: true, 1: true })
  const [expandedPosts, setExpandedPosts] = useState({ 1: true, 2: true })

  // Kurs verilerini getirme
  useEffect(() => {
    if (user?.id) {
      dispatch(fetchStudentCourses(user.id))
    }
  }, [dispatch, user])

  // Sadece online dersleri filtrele
  const onlineCourses = studentCourses.filter(course => 
    ['MOB401', 'CYB302', 'AI501', 'NET401'].includes(course.code)
  )

  // İlk online dersi seçme
  useEffect(() => {
    if (onlineCourses.length > 0 && (!selectedCourseCode || !['MOB401', 'CYB302', 'AI501', 'NET401'].includes(selectedCourseCode))) {
      setSelectedCourseCode(onlineCourses[0].code)
    }
  }, [onlineCourses, selectedCourseCode])

  // Aktif müfredatı belirleme
  const currentCurriculum = courseCurriculum[selectedCourseCode] || courseCurriculum.default
  const currentCourse = onlineCourses.find(c => c.code === selectedCourseCode) || onlineCourses[0]

  useEffect(() => {
    if (currentCurriculum && currentCurriculum.length > 0) {
      const firstLecture = currentCurriculum[0].lectures[0]
      setActiveLecture(firstLecture)
    }
  }, [selectedCourseCode])

  // Akordeon menü
  const toggleSection = (index) => {
    setExpandedSections(prev => ({
      ...prev,
      [index]: !prev[index]
    }))
  }

  // Genel ders beğenisi
  const handleLike = () => {
    if (hasLiked) {
      setLikes(prev => prev - 1)
      setHasLiked(false)
    } else {
      setLikes(prev => prev + 1)
      setHasLiked(true)
      toast.success('Ders beğenildi!')
    }
  }

  // Paylaş butonu (YouTube video bağlantısını kopyalar)
  const handleShare = () => {
    if (activeLecture) {
      const videoUrl = `https://www.youtube.com/watch?v=${activeLecture.id}`
      navigator.clipboard.writeText(videoUrl)
      toast.success('Ders video bağlantısı panoya kopyalandı!')
    } else {
      navigator.clipboard.writeText(window.location.href)
      toast.success('Ders bağlantısı panoya kopyalandı!')
    }
  }

  // Forum sorusunu beğenme
  const handleLikePost = (postId) => {
    setForumPosts(prev => prev.map(post => {
      if (post.id === postId) {
        const liked = !post.hasLiked
        return {
          ...post,
          hasLiked: liked,
          likes: liked ? post.likes + 1 : post.likes - 1
        }
      }
      return post
    }))
  }

  // Forum sorusuna yanıt/cevap yazma
  const handleAddReply = (postId, replyText) => {
    setForumPosts(prev => prev.map(post => {
      if (post.id === postId) {
        const newReply = {
          id: Date.now(),
          author: user?.name || "Öğrenci",
          avatar: user?.name ? user.name.split(' ').map(n => n[0]).join('') : "Ö",
          time: "Şimdi",
          text: replyText
        }
        return {
          ...post,
          replies: post.replies + 1,
          repliesList: [...(post.repliesList || []), newReply]
        }
      }
      return post
    }))
    toast.success('Cevabınız eklendi!')
  }

  // Forumda yeni soru sorma
  const handleSendQuestion = (e) => {
    e.preventDefault()
    if (!newQuestion.trim()) {
      toast.error('Lütfen boş soru göndermeyin.')
      return
    }
    const newPost = {
      id: forumPosts.length + 1,
      author: user?.name || "Öğrenci",
      avatar: user?.name ? user.name.split(' ').map(n => n[0]).join('') : "Ö",
      time: "Şimdi",
      text: newQuestion,
      likes: 0,
      replies: 0,
      hasLiked: false,
      repliesList: []
    }
    setForumPosts([newPost, ...forumPosts])
    setNewQuestion('')
    toast.success('Sorunuz foruma gönderildi!')
  }

  // Kopyalama işlemi (GitHub kodu)
  const codeSnippet = `import React, { useState, useEffect } from 'react';

const Timer = () => {
  const [count, setCount] = useState(0);

  useEffect(() => {
    // Sayacı başlat
    const interval = setInterval(() => {
      setCount(prev => prev + 1);
    }, 1000);

    // Temizleme: Bileşen kaldırıldığında sayacı durdur
    return () => clearInterval(interval);
  }, []); // Boş dizi = Sadece bileşen yüklendiğinde çalışır

  return (
    <div>Sayaç: {count}</div>
  );
};`

  const handleCopyCode = () => {
    navigator.clipboard.writeText(codeSnippet)
    toast.success('Kod panoya kopyalandı!')
  }

  const isLoading = studentCoursesStatus === 'loading'

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[#f6f9ff] dark:bg-slate-900 text-slate-500 dark:text-slate-400">
        <span className="animate-spin material-symbols-outlined text-4xl mr-2">sync</span>
        <p className="text-lg">Dersler yükleniyor...</p>
      </div>
    )
  }

  if (onlineCourses.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-[#f6f9ff] dark:bg-slate-900 text-slate-500 dark:text-slate-400 p-6">
        <span className="material-symbols-outlined text-6xl mb-4 text-slate-300">menu_book</span>
        <h3 className="text-xl font-bold mb-2">Kayıtlı Online Dersiniz Bulunmamaktadır</h3>
        <p className="text-sm text-slate-400">Lütfen önce ders kayıt işlemlerinden ders seçimi yapıp onaylatın.</p>
      </div>
    )
  }

  return (
    <section className="flex-grow p-4 md:p-8 max-w-7xl mx-auto space-y-6 text-slate-800 dark:text-white">
      
      {/* Üst Ders Başlığı ve Seçici */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-4">
        <div>
          <nav className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400">
            <span>Derslerim</span>
            <span className="material-symbols-outlined text-[14px]">chevron_right</span>
            <span className="font-bold text-blue-600 dark:text-blue-400">{currentCourse ? `${currentCourse.courseName} (Online Ders)` : ''}</span>
          </nav>
          <h1 className="text-xl md:text-2xl font-black tracking-tight mt-1 text-slate-800 dark:text-white">
            {currentCourse ? `${currentCourse.courseName} (Online Ders)` : ''}
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">Eğitmen: {currentCourse?.instructor}</p>
        </div>

        {/* Ders Seçim Dropdown */}
        <div className="shrink-0 w-full md:w-64">
          <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
            İzlenecek Dersi Seçin
          </label>
          <select
            value={selectedCourseCode}
            onChange={(e) => setSelectedCourseCode(e.target.value)}
            className="w-full py-2 px-3 bg-white dark:bg-slate-800 text-slate-800 dark:text-white border border-slate-200 dark:border-slate-700 rounded-xl text-xs focus:ring-1 focus:ring-blue-500 focus:outline-none"
          >
            {onlineCourses.map(course => (
              <option key={course.code} value={course.code}>
                {course.courseName} (Online Ders)
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Ana Arayüz Grid (Video + Sağ Müfredat) */}
      <div className="grid grid-cols-12 gap-6 items-start">
        
        {/* Sol Kolon: Video ve Detaylar */}
        <div className="col-span-12 lg:col-span-8 space-y-4">
          
          {/* Video Player */}
          <div className="relative w-full aspect-video bg-slate-900 rounded-2xl overflow-hidden shadow-lg border border-slate-200/50 dark:border-slate-800">
            {activeLecture ? (
              <iframe
                className="w-full h-full"
                src={`https://www.youtube.com/embed/${activeLecture.id}?autoplay=0&mute=0&rel=0`}
                title={activeLecture.title}
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              ></iframe>
            ) : (
              <div className="absolute inset-0 flex items-center justify-center text-slate-500">
                <span className="material-symbols-outlined text-4xl animate-pulse mr-2">play_circle</span>
                <span>Video Hazırlanıyor...</span>
              </div>
            )}
          </div>

          {/* Oynatılan Video Detayları ve Beğen/Paylaş Butonları */}
          <div className="bg-white dark:bg-slate-800 p-5 rounded-2xl border border-slate-100 dark:border-slate-800/60 shadow-sm flex flex-col sm:flex-row justify-between sm:items-center gap-4">
            <div>
              <span className="bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 font-extrabold text-[9px] px-2 py-0.5 rounded uppercase tracking-wider">
                Şu An İzleniyor
              </span>
              <h2 className="text-base font-extrabold text-slate-800 dark:text-white mt-1.5">
                {activeLecture?.title || 'Ders Yükleniyor...'}
              </h2>
              <p className="text-xs text-slate-400 dark:text-slate-500 mt-0.5">
                Eğitmen: {currentCourse?.instructor} · Süre: {activeLecture?.duration || '00:00'}
              </p>
            </div>

            {/* Beğen / Paylaş */}
            <div className="flex items-center gap-2 shrink-0">
              <button
                onClick={handleLike}
                className={`flex items-center gap-1.5 px-4 py-2 border rounded-xl text-xs font-bold transition-all active:scale-95 cursor-pointer ${
                  hasLiked
                    ? 'bg-rose-500 border-rose-500 text-white shadow-md shadow-rose-500/20'
                    : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-900'
                }`}
              >
                <span className="material-symbols-outlined text-base">thumb_up</span>
                <span>{likes} Beğeni</span>
              </button>

              <button
                onClick={handleShare}
                className="flex items-center gap-1.5 px-4 py-2 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-900 text-slate-600 dark:text-slate-300 font-bold text-xs rounded-xl transition-all active:scale-95 cursor-pointer"
              >
                <span className="material-symbols-outlined text-base">share</span>
                <span>Paylaş</span>
              </button>
            </div>
          </div>
        </div>

        {/* Sağ Kolon: Ders Müfredat Listesi */}
        <aside className="col-span-12 lg:col-span-4">
          <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-800/60 shadow-sm overflow-hidden flex flex-col min-h-[400px]">
            
            {/* Müfredat Başlık */}
            <div className="p-5 border-b border-slate-100 dark:border-slate-800/60 bg-slate-50/50 dark:bg-slate-800/30">
              <h3 className="font-extrabold text-sm text-blue-900 dark:text-blue-400">Ders Müfredat Listesi</h3>
              <div className="mt-3 w-full bg-slate-100 dark:bg-slate-900 rounded-full h-1.5">
                <div className="bg-emerald-500 h-1.5 rounded-full w-[45%]"></div>
              </div>
              <p className="text-[10px] text-slate-400 dark:text-slate-500 mt-1.5 font-bold uppercase">
                İlerleme: %45 Tamamlandı
              </p>
            </div>

            {/* Müfredat Bölümler Listesi */}
            <div className="flex-1 overflow-y-auto p-3 space-y-2">
              {currentCurriculum.map((section, sIdx) => {
                const isExpanded = !!expandedSections[sIdx]
                return (
                  <div key={sIdx} className="rounded-xl border border-slate-100 dark:border-slate-700/60 overflow-hidden shadow-sm">
                    {/* Bölüm Başlığı Accordion Button */}
                    <button
                      onClick={() => toggleSection(sIdx)}
                      className="w-full flex items-center justify-between p-3.5 bg-slate-50/70 dark:bg-slate-900/50 hover:bg-slate-100/50 dark:hover:bg-slate-900 text-left transition-colors"
                    >
                      <span className="text-xs font-extrabold text-blue-900 dark:text-blue-400 truncate pr-2">
                        {section.title}
                      </span>
                      <span className={`material-symbols-outlined text-slate-400 text-lg transition-transform ${isExpanded ? 'rotate-180' : ''}`}>
                        expand_more
                      </span>
                    </button>

                    {/* Ders Listesi */}
                    {isExpanded && (
                      <div className="divide-y divide-slate-100 dark:divide-slate-800/60 bg-white dark:bg-slate-800">
                        {section.lectures.map((lecture) => {
                          const isActive = activeLecture?.id === lecture.id
                          return (
                            <div
                              key={lecture.id}
                              onClick={() => setActiveLecture(lecture)}
                              className={`p-3.5 flex items-center gap-3 cursor-pointer transition-colors ${
                                isActive
                                  ? 'bg-blue-500/10 dark:bg-blue-500/5 border-l-4 border-blue-600'
                                  : 'hover:bg-slate-50 dark:hover:bg-slate-700/30'
                              }`}
                            >
                              {isActive ? (
                                <span className="material-symbols-outlined text-blue-600 dark:text-blue-400 text-lg shrink-0">
                                  play_circle
                                </span>
                              ) : lecture.completed ? (
                                <span className="material-symbols-outlined text-emerald-500 text-lg shrink-0">
                                  check_circle
                                </span>
                              ) : (
                                <span className="material-symbols-outlined text-slate-300 dark:text-slate-600 text-lg shrink-0">
                                  lock
                                </span>
                              )}

                              <div className="min-w-0 flex-1">
                                <p className={`text-xs truncate ${isActive ? 'font-bold text-blue-600 dark:text-blue-400' : 'text-slate-700 dark:text-slate-300'}`}>
                                  {lecture.title}
                                </p>
                                <p className="text-[10px] text-slate-400 dark:text-slate-500 mt-0.5">
                                  {isActive ? 'Şu an izleniyor' : `Süre: ${lecture.duration}`}
                                </p>
                              </div>
                            </div>
                          )
                        })}
                      </div>
                    )}
                  </div>
                )
              })}
            </div>

          </div>
        </aside>

      </div>

      {/* Alt Bölüm: 3 Sekmeli Ders Materyali & Forum */}
      <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-800/60 shadow-sm overflow-hidden">
        
        {/* Sekme Butonları */}
        <div className="flex border-b border-slate-200 dark:border-slate-700/60 px-4 overflow-x-auto whitespace-nowrap scrollbar-none bg-slate-50/50 dark:bg-slate-800/40">
          <button
            onClick={() => setActiveTab('notes')}
            className={`py-4 px-6 text-xs font-bold flex items-center gap-1.5 transition-all border-b-2 cursor-pointer ${
              activeTab === 'notes'
                ? 'border-blue-600 text-blue-600 dark:text-blue-400'
                : 'border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            <span className="material-symbols-outlined text-base">description</span>
            <span>Ders Notları &amp; PDF</span>
          </button>

          <button
            onClick={() => setActiveTab('code')}
            className={`py-4 px-6 text-xs font-bold flex items-center gap-1.5 transition-all border-b-2 cursor-pointer ${
              activeTab === 'code'
                ? 'border-blue-600 text-blue-600 dark:text-blue-400'
                : 'border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            <span className="material-symbols-outlined text-base">code</span>
            <span>Derste Yazılan Kodlar (GitHub)</span>
          </button>

          <button
            onClick={() => setActiveTab('forum')}
            className={`py-4 px-6 text-xs font-bold flex items-center gap-1.5 transition-all border-b-2 relative cursor-pointer ${
              activeTab === 'forum'
                ? 'border-blue-600 text-blue-600 dark:text-blue-400'
                : 'border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            <span className="material-symbols-outlined text-base">forum</span>
            <span>Soru-Cevap / Forum</span>
            <span className="absolute top-3.5 right-2.5 w-1.5 h-1.5 bg-red-500 rounded-full"></span>
          </button>
        </div>

        {/* Sekme İçerikleri */}
        <div className="p-6">
          
          {/* Sekme 1: Ders Notları & PDF */}
          {activeTab === 'notes' && (
            <div className="space-y-6">
              
              {/* PDF İndirme Kartları */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* PDF Kartı 1 */}
                <div
                  onClick={() => toast.success('Ders Özeti - Bölüm 4.pdf indiriliyor...')}
                  className="p-4 bg-slate-50 dark:bg-slate-900/60 border border-slate-100 dark:border-slate-800/60 rounded-2xl flex items-center justify-between hover:border-blue-400/40 dark:hover:border-blue-500/30 transition-all cursor-pointer group shadow-sm"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-red-100/50 dark:bg-red-950/40 text-red-600 dark:text-red-400 rounded-xl flex items-center justify-center shrink-0">
                      <span className="material-symbols-outlined text-2xl">picture_as_pdf</span>
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-slate-800 dark:text-white">Ders Özeti - Bölüm 4.pdf</h4>
                      <p className="text-[10px] text-slate-400 mt-0.5">2.4 MB · PDF Belgesi</p>
                    </div>
                  </div>
                  <span className="material-symbols-outlined text-slate-400 group-hover:text-blue-600 dark:group-hover:text-blue-400 text-lg">
                    download
                  </span>
                </div>

                {/* PDF Kartı 2 */}
                <div
                  onClick={() => toast.success('Ek Okuma Materyalleri.docx indiriliyor...')}
                  className="p-4 bg-slate-50 dark:bg-slate-900/60 border border-slate-100 dark:border-slate-800/60 rounded-2xl flex items-center justify-between hover:border-blue-400/40 dark:hover:border-blue-500/30 transition-all cursor-pointer group shadow-sm"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-blue-100/50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 rounded-xl flex items-center justify-center shrink-0">
                      <span className="material-symbols-outlined text-2xl">article</span>
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-slate-800 dark:text-white">Ek Okuma Materyalleri.docx</h4>
                      <p className="text-[10px] text-slate-400 mt-0.5">1.1 MB · Word Belgesi</p>
                    </div>
                  </div>
                  <span className="material-symbols-outlined text-slate-400 group-hover:text-blue-600 dark:group-hover:text-blue-400 text-lg">
                    download
                  </span>
                </div>
              </div>

              {/* Ders Notları Metin Alanı */}
              <div className="bg-slate-50 dark:bg-slate-900/40 p-5 rounded-2xl border border-slate-100 dark:border-slate-800/50">
                <h3 className="text-sm font-extrabold text-blue-900 dark:text-blue-400 mb-3">Ders Hakkında Notlar</h3>
                <div className="text-xs text-slate-600 dark:text-slate-300 space-y-3 leading-relaxed font-semibold">
                  <p>
                    Bu derste React kütüphanesinin en önemli Hook'larından biri olan <code>useEffect</code> kullanımını detaylıca ele aldık. Özellikle API çağrıları yaparken bileşenin yaşam döngüsünü (lifecycle) nasıl kontrol edeceğimizi öğrendik.
                  </p>
                  <ul className="list-disc pl-5 space-y-1.5">
                    <li>useEffect bağımlılık dizisi (dependency array) kullanımı.</li>
                    <li>ComponentDidMount ve ComponentWillUnmount karşılıkları.</li>
                    <li>Side effect yönetimi ve temizlik (cleanup) fonksiyonları.</li>
                  </ul>
                </div>
              </div>

            </div>
          )}

          {/* Sekme 2: GitHub / Yazılan Kodlar */}
          {activeTab === 'code' && (
            <div className="space-y-4">
              
              {/* Kod Editörü */}
              <div className="bg-slate-900 text-slate-300 rounded-2xl font-mono text-[11px] overflow-hidden border border-slate-800 shadow-inner">
                {/* Editör Üst Barı */}
                <div className="flex items-center justify-between px-4 py-2.5 bg-slate-950/80 border-b border-slate-800 text-[10px] text-slate-400">
                  <div className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-slate-500 text-sm">folder</span>
                    <span>softito-obis-course / src / components / UseEffectDemo.js</span>
                  </div>
                  <button
                    onClick={handleCopyCode}
                    className="text-slate-400 hover:text-white flex items-center gap-1 cursor-pointer font-bold"
                  >
                    <span className="material-symbols-outlined text-xs">content_copy</span>
                    <span>Kopyala</span>
                  </button>
                </div>

                {/* Kod İçeriği */}
                <pre className="p-5 overflow-x-auto leading-relaxed text-left">
                  <code>{codeSnippet}</code>
                </pre>
              </div>

              {/* GitHub Link */}
              <div className="flex justify-center">
                <button
                  onClick={() => toast.success('GitHub deposuna yönlendiriliyorsunuz...')}
                  className="bg-blue-900 hover:bg-blue-800 text-white px-6 py-2.5 rounded-full flex items-center gap-2 text-xs font-bold transition-all active:scale-95 shadow-md shadow-blue-900/25 cursor-pointer"
                >
                  <span className="material-symbols-outlined text-sm">terminal</span>
                  <span>GitHub Repository'sine Git</span>
                </button>
              </div>

            </div>
          )}

          {/* Sekme 3: Forum / Soru Cevap */}
          {activeTab === 'forum' && (
            <div className="space-y-6">
              
              {/* Forum Soru Listesi */}
              <div className="space-y-3">
                {forumPosts.map((post) => (
                  <div
                    key={post.id}
                    className="p-5 bg-slate-50 dark:bg-slate-900/60 rounded-2xl border border-slate-100 dark:border-slate-800/60 hover:border-blue-400/30 transition-all shadow-sm"
                  >
                    <div className="flex gap-3">
                      <div className="w-9 h-9 rounded-full bg-blue-100 dark:bg-blue-950 text-blue-600 dark:text-blue-400 flex items-center justify-center font-black text-xs shrink-0">
                        {post.avatar}
                      </div>

                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <h5 className="text-xs font-bold text-slate-800 dark:text-white">{post.author}</h5>
                            {post.role && (
                              <span className="bg-blue-900 text-white text-[8px] px-1.5 py-0.5 rounded-full font-bold uppercase">
                                {post.role}
                              </span>
                            )}
                          </div>
                          <span className="text-[10px] text-slate-400 dark:text-slate-500 font-semibold">{post.time}</span>
                        </div>
                        <p className="text-xs text-slate-600 dark:text-slate-300 mt-1 leading-relaxed font-semibold">
                          {post.text}
                        </p>

                        <div className="mt-3.5 flex items-center gap-5 text-[10px] text-slate-400 dark:text-slate-500 font-bold uppercase">
                          <button
                            onClick={() => {
                              setExpandedPosts(prev => ({ ...prev, [post.id]: !prev[post.id] }))
                            }}
                            className="flex items-center gap-1 hover:text-blue-600 dark:hover:text-blue-400 cursor-pointer border-none bg-transparent"
                          >
                            <span className="material-symbols-outlined text-sm">reply</span>
                            <span>{post.replies} Yanıt</span>
                          </button>
                          <button
                            onClick={() => handleLikePost(post.id)}
                            className={`flex items-center gap-1 cursor-pointer border-none bg-transparent ${
                              post.hasLiked ? 'text-rose-500 hover:text-rose-600 font-bold' : 'hover:text-rose-500 text-slate-400 dark:text-slate-500 font-bold'
                            }`}
                          >
                            <span className="material-symbols-outlined text-sm">favorite</span>
                            <span>{post.likes} Beğeni</span>
                          </button>
                        </div>

                        {/* Yanıtlar listesi ve cevap yazma alanı */}
                        {expandedPosts[post.id] && (
                          <div className="mt-4 pl-4 border-l-2 border-slate-200 dark:border-slate-700 space-y-3.5">
                            {post.repliesList && post.repliesList.map(reply => (
                              <div key={reply.id} className="flex gap-2.5 items-start text-xs">
                                <div className="w-7 h-7 rounded-full bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 flex items-center justify-center font-bold text-[10px] shrink-0">
                                  {reply.avatar}
                                </div>
                                <div className="flex-1 bg-slate-100/50 dark:bg-slate-900/40 p-2.5 rounded-xl">
                                  <div className="flex items-center justify-between mb-0.5">
                                    <div className="flex items-center gap-1.5 flex-wrap">
                                      <span className="font-extrabold text-[10px] text-slate-800 dark:text-white">{reply.author}</span>
                                      {reply.role && (
                                        <span className="bg-blue-900 text-white text-[7px] px-1 py-0.2 rounded-full font-bold uppercase">
                                          {reply.role}
                                        </span>
                                      )}
                                    </div>
                                    <span className="text-[8px] text-slate-400 font-semibold">{reply.time}</span>
                                  </div>
                                  <p className="text-slate-600 dark:text-slate-300 font-medium">{reply.text}</p>
                                </div>
                              </div>
                            ))}

                            {/* Cevap yazma formu */}
                            <form 
                              onSubmit={(e) => {
                                e.preventDefault();
                                const replyText = e.target.replyInput.value;
                                if (!replyText.trim()) return;
                                handleAddReply(post.id, replyText);
                                e.target.replyInput.value = '';
                              }}
                              className="flex gap-2 items-center pt-2"
                            >
                              <div className="w-7 h-7 rounded-full bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300 flex items-center justify-center shrink-0">
                                <span className="material-symbols-outlined text-sm">account_circle</span>
                              </div>
                              <input
                                name="replyInput"
                                type="text"
                                placeholder="Cevap yaz..."
                                className="flex-1 bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg px-2.5 py-1 text-xs focus:ring-1 focus:ring-blue-500 focus:outline-none"
                              />
                              <button
                                type="submit"
                                className="px-3 py-1 bg-blue-900 text-white font-bold text-[10px] rounded-lg cursor-pointer hover:bg-blue-800 border-none"
                              >
                                Cevapla
                              </button>
                            </form>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Soru Gönderme Alanı */}
              <div className="pt-5 border-t border-slate-100 dark:border-slate-800/80">
                <form onSubmit={handleSendQuestion} className="flex gap-3 items-start">
                  <div className="w-9 h-9 rounded-full bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300 flex items-center justify-center shrink-0">
                    <span className="material-symbols-outlined text-lg">account_circle</span>
                  </div>

                  <div className="flex-1 relative">
                    <textarea
                      required
                      placeholder="Soru sor veya tartışmaya katıl..."
                      rows={2}
                      value={newQuestion}
                      onChange={(e) => setNewQuestion(e.target.value)}
                      className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl p-3 pr-12 focus:ring-1 focus:ring-blue-500 focus:outline-none text-xs resize-none"
                    ></textarea>
                    <button
                      type="submit"
                      className="absolute right-3.5 bottom-3.5 text-blue-600 hover:text-blue-700 dark:text-blue-400 cursor-pointer flex items-center justify-center"
                      title="Soru Gönder"
                    >
                      <span className="material-symbols-outlined text-lg">send</span>
                    </button>
                  </div>
                </form>
              </div>

            </div>
          )}

        </div>

      </div>

    </section>
  )
}
