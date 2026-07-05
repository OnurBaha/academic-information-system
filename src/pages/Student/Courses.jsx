import { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { fetchStudentCourses } from '../../store/student/studentSlice'
import { toast } from 'react-hot-toast'
import { jsPDF } from 'jspdf'
import {
  defaultForumPosts,
  courseDescriptions,
  syllabusOutlines
} from '../../store/student/studentData'

export default function Courses() {
  const dispatch = useDispatch()
  const { currentUser } = useSelector((state) => state.auth || {})
  const { studentCourses = [], status } = useSelector((state) => state.student || {})

  const [selectedCourseCode, setSelectedCourseCode] = useState('')
  const [activeLecture, setActiveLecture] = useState(null)
  const [activeTab, setActiveTab] = useState('notes')
  const [viewMode, setViewMode] = useState('list')

  const [likes, setLikes] = useState(148)
  const [hasLiked, setHasLiked] = useState(false)
  const [forumPosts, setForumPosts] = useState(defaultForumPosts)
  const [newQuestion, setNewQuestion] = useState('')
  const [expandedSections, setExpandedSections] = useState({ 0: true, 1: true })
  const [expandedPosts, setExpandedPosts] = useState({ 1: true, 2: true })

  useEffect(() => {
    if (currentUser?.id) {
      dispatch(fetchStudentCourses(currentUser.id))
    }
  }, [dispatch, currentUser])

  const onlineCourses = studentCourses

  useEffect(() => {
    if (onlineCourses.length > 0 && (!selectedCourseCode || !onlineCourses.some(c => c.code === selectedCourseCode))) {
      setSelectedCourseCode(onlineCourses[0].code)
    }
  }, [onlineCourses, selectedCourseCode])

  const courseLectures = [
    { id: "dQw4w9WgXcQ", title: "1. Hafta Ders Tekrar Kaydı", duration: "45:10", completed: true },
    { id: "84WUGpO5HU4", title: "2. Hafta Ders Tekrar Kaydı", duration: "50:15", completed: true },
    { id: "PLbW6i5NrkU", title: "3. Hafta Ders Tekrar Kaydı", duration: "48:40", completed: true },
    { id: "6dvRik84CIk", title: "4. Hafta Ders Tekrar Kaydı", duration: "52:20", completed: false }
  ]
  
  const currentCourse = onlineCourses.find(c => c.code === selectedCourseCode) || onlineCourses[0]

  useEffect(() => {
    setActiveLecture(courseLectures[0])
    if (selectedCourseCode && selectedCourseCode !== 'WEB 307') {
      setActiveTab('notes')
    }
  }, [selectedCourseCode])

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

  const handleAddReply = (postId, replyText) => {
    setForumPosts(prev => prev.map(post => {
      if (post.id === postId) {
        const newReply = {
          id: Date.now(),
          author: currentUser?.name || "Öğrenci",
          avatar: currentUser?.name ? currentUser.name.split(' ').map(n => n[0]).join('') : "Ö",
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

  const handleSendQuestion = (e) => {
    e.preventDefault()
    if (!newQuestion.trim()) {
      toast.error('Lütfen boş soru göndermeyin.')
      return
    }
    const newPost = {
      id: forumPosts.length + 1,
      author: currentUser?.name || "Öğrenci",
      avatar: currentUser?.name ? currentUser.name.split(' ').map(n => n[0]).join('') : "Ö",
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

  const codeSnippet = `import React, { useState, useEffect } from 'react';

const Timer = () => {
  const [count, setCount] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCount(prev => prev + 1);
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div>Sayaç: {count}</div>
  );
};`

  const handleCopyCode = () => {
    navigator.clipboard.writeText(codeSnippet)
    toast.success('Kod panoya kopyalandı!')
  }

  const downloadCourseDocPDF = (title) => {
    try {
      const doc = new jsPDF()
      
      doc.setFont('Helvetica', 'bold')
      doc.setFontSize(16)
      doc.setTextColor(30, 58, 138)
      doc.text('AKADEMIK BILGI SISTEMI - DERS MATERYALI', 14, 20)
      
      doc.setFont('Helvetica', 'normal')
      doc.setFontSize(10)
      doc.setTextColor(100, 116, 139)
      doc.text(`Ders: ${currentCourse?.courseName || currentCourse?.name || 'Secili Ders'} (${currentCourse?.code || ''})`, 14, 28)
      doc.text(`Dokuman: ${title}`, 14, 34)
      doc.text(`Tarih: ${new Date().toLocaleDateString('tr-TR')}`, 14, 40)
      
      doc.line(14, 46, 196, 46)
      
      doc.setFont('Helvetica', 'bold')
      doc.setFontSize(12)
      doc.setTextColor(30, 41, 59)
      doc.text('Ders Ozeti ve Genel Degerlendirme Notlari', 14, 56)
      
      doc.setFont('Helvetica', 'normal')
      doc.setFontSize(10)
      const details = [
        `1. Ders Mufredatina Giris: Bu bolumde ${currentCourse?.courseName || 'ders'} ile ilgili temel kavramlar, haftalik plan ve beklentiler aciklanmistir.`,
        `2. Temel Kavramlar ve Mimariler: Derste ele alinan temel ilkeler, yaklasimlar ve metodolojiler ozetlenmistir.`,
        `3. Sinav Hazirlik Sorulari: Vize ve final sinavlarina yonelik ornek problem ve cozum senaryolari derlenmistir.`,
        `4. Ek Okuma ve Kaynaklar: Akademik literaturdeki kaynak makaleler ve ders kitaplarinin ilgili bolum referanslari eklenmistir.`
      ]
      
      let startY = 66
      details.forEach(line => {
        const splitText = doc.splitTextToSize(line, 180)
        doc.text(splitText, 14, startY)
        startY += 18
      })
      
      doc.line(14, 260, 196, 260)
      doc.setFontSize(8)
      doc.text('Bu belge Academic Information System uzerinden otomatik olarak uretilmistir.', 14, 268)
      
      const filename = title.toLowerCase().endsWith('.pdf') ? title : `${title}.pdf`
      doc.save(filename.replace(/\s+/g, '_'))
      toast.success(`${title} başarıyla indirildi!`)
    } catch (err) {
      console.error(err)
      toast.error('Belge indirilirken bir hata oluştu.')
    }
  }

  const isLoading = status === 'loading' || status?.studentCourses === 'loading'

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

  if (viewMode === 'list') {
    return (
      <section className="flex-grow p-4 md:p-8 max-w-7xl mx-auto space-y-6 text-slate-800 dark:text-white animate-fade-in">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-slate-100 dark:border-slate-800 pb-5">
          <div>
            <h2 className="student-page-title flex items-center gap-2">
              <span className="material-symbols-outlined text-blue-600 text-2xl">menu_book</span>
              <span>Derslerim</span>
            </h2>
            <p className="student-page-subtitle">
              2025-2026 Bahar Dönemi kayıtlı olduğunuz derslerin listesi. Ayrıntıları görmek için derse tıklayın.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-6">
          {onlineCourses.map((course, idx) => {
            const isCourseOnline = course.type === 'Online'
            return (
              <div 
                key={`${course.code}-${idx}`}
                className="bg-white dark:bg-slate-800 rounded-3xl border border-slate-200/50 dark:border-slate-800/80 p-6 flex flex-col justify-between hover:shadow-md transition-all group relative overflow-hidden cursor-pointer"
                onClick={() => {
                  setSelectedCourseCode(course.code)
                  setViewMode('detail')
                }}
              >
                <div className={`absolute top-0 left-0 w-full h-1.5 ${isCourseOnline ? 'bg-amber-500' : 'bg-blue-600'}`}></div>

                <div>
                  <div className="flex justify-between items-start gap-2 mb-4">
                    <span className="text-[10px] font-black uppercase tracking-wider text-slate-400">
                      {course.code}
                    </span>
                    <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold tracking-wide ${
                      isCourseOnline 
                        ? 'bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400' 
                        : 'bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400'
                    }`}>
                      {isCourseOnline ? 'Online' : 'Yüz Yüze'}
                    </span>
                  </div>

                  <h3 className="text-base font-extrabold text-slate-800 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors line-clamp-1">
                    {course.courseName || course.name}
                  </h3>

                  <p className="text-xs mt-2 flex items-center gap-1.5 text-slate-500 dark:text-slate-400">
                    <span className="material-symbols-outlined text-[16px]">person</span>
                    <span>{course.instructor}</span>
                  </p>

                  <p className="text-xs mt-1 flex items-center gap-1.5 text-slate-500 dark:text-slate-400">
                    <span className="material-symbols-outlined text-[16px]">meeting_room</span>
                    <span>{course.classroom || 'Belirtilmedi'}</span>
                  </p>
                </div>

                <div className="mt-6 pt-4 border-t border-slate-100 dark:border-slate-700/50 flex justify-between items-center">
                  <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                    {course.akts || course.ects} AKTS
                  </span>
                  <span className="flex items-center gap-1 text-blue-600 dark:text-blue-400 font-extrabold text-xs group-hover:translate-x-1 transition-transform">
                    <span>Ayrıntılar</span>
                    <span className="material-symbols-outlined text-xs">arrow_forward</span>
                  </span>
                </div>
              </div>
            )
          })}
        </div>
      </section>
    )
  }

  const isOnline = currentCourse?.type === 'Online'

  return (
    <section className="flex-grow p-4 md:p-8 max-w-7xl mx-auto space-y-6 text-slate-800 dark:text-white animate-fade-in">

      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-4">
        <div>
          <nav className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400">
            <span className="cursor-pointer hover:underline text-slate-400 dark:text-slate-505 font-bold" onClick={() => setViewMode('list')}>Dersler</span>
            <span className="material-symbols-outlined text-[14px]">chevron_right</span>
            <span className="font-bold text-blue-600 dark:text-blue-400">
              {currentCourse ? `${currentCourse.courseName || currentCourse.name} (${isOnline ? 'Online Ders' : 'Fakülte Dersi'})` : ''}
            </span>
          </nav>
          
          <div className="flex items-center gap-2 mt-2">
            <button
              onClick={() => setViewMode('list')}
              className="flex items-center justify-center p-1 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-lg border-none cursor-pointer transition-all"
              title="Ders Listesine Geri Dön"
            >
              <span className="material-symbols-outlined text-lg">arrow_back</span>
            </button>
            <h1 className="text-lg md:text-xl font-black tracking-tight text-slate-800 dark:text-white m-0">
              {currentCourse ? `${currentCourse.courseName || currentCourse.name} (${isOnline ? 'Online' : 'Yüz Yüze'})` : ''}
            </h1>
          </div>
          <p className="text-xs text-slate-405 mt-1 pl-7">Eğitmen: {currentCourse?.instructor}</p>
        </div>

        <div className="shrink-0 w-full md:w-64">
          <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
            Hızlı Ders Değiştir
          </label>
          <select
            value={selectedCourseCode}
            onChange={(e) => setSelectedCourseCode(e.target.value)}
            className="w-full py-2 px-3 bg-white dark:bg-slate-800 text-slate-800 dark:text-white border border-slate-200 dark:border-slate-700 rounded-xl text-xs focus:ring-1 focus:ring-blue-500 focus:outline-none"
          >
            {onlineCourses.map((course, idx) => (
              <option key={`${course.code}-${idx}`} value={course.code}>
                {course.courseName || course.name} ({course.type === 'Online' ? 'Online' : 'Fakülte'})
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="grid grid-cols-12 gap-6 items-start">

        {isOnline ? (
          <>
            <div className="col-span-12 lg:col-span-8 space-y-4">

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

                <div className="flex items-center gap-2 shrink-0">
                  <button
                    onClick={handleLike}
                    className={`flex items-center gap-1.5 px-4 py-2 border rounded-xl text-xs font-bold transition-all active:scale-95 cursor-pointer ${hasLiked
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

            <aside className="col-span-12 lg:col-span-4">
              <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-800/60 shadow-sm overflow-hidden flex flex-col min-h-[400px]">

                <div className="p-4 bg-slate-50 dark:bg-slate-800/80 border-b border-slate-100 dark:border-slate-700/60 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-amber-500">video_library</span>
                    <h3 className="text-xs font-bold text-slate-800 dark:text-white uppercase tracking-wider">
                      Ders Kayıt Arşivi (VOD)
                    </h3>
                  </div>
                  <span className="text-[10px] text-slate-400 font-bold">
                    {courseLectures.length} Ders Kaydı
                  </span>
                </div>

                <div className="divide-y divide-slate-100 dark:divide-slate-700/50 overflow-y-auto max-h-[350px]">
                  {courseLectures.map((lecture, index) => {
                    const isActive = activeLecture?.id === lecture.id
                    return (
                      <div
                        key={lecture.id}
                        onClick={() => setActiveLecture(lecture)}
                        className={`flex gap-3 p-4 items-start cursor-pointer transition-colors ${isActive
                          ? 'bg-blue-50/50 dark:bg-blue-950/20'
                          : 'hover:bg-slate-50 dark:hover:bg-slate-900/40'
                          }`}
                      >
                        <span className={`material-symbols-outlined text-lg mt-0.5 shrink-0 ${isActive
                          ? 'text-blue-600 dark:text-blue-400'
                          : 'text-slate-400 dark:text-slate-500'
                          }`}>
                          {isActive ? 'play_circle' : 'play_arrow'}
                        </span>
                        <div className="flex-1 min-w-0">
                          <p className={`text-xs font-bold leading-snug truncate ${isActive
                            ? 'text-blue-650 dark:text-blue-400'
                            : 'text-slate-700 dark:text-slate-300'
                            }`}>
                            {lecture.title}
                          </p>
                          <p className="text-[10px] text-slate-400 dark:text-slate-505 mt-0.5">
                            {isActive ? 'Şu an izleniyor' : `Süre: ${lecture.duration}`}
                          </p>
                        </div>
                      </div>
                    )
                  })}
                </div>

              </div>
            </aside>
          </>
        ) : (
          /* Yüz Yüze / Fakülte Dersi Bilgi Paneli (Geniş 12 Kolon) */
          <div className="col-span-12 space-y-6">
            <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl border border-slate-100 dark:border-slate-800/60 shadow-sm flex flex-col gap-6 animate-fade-in">
              <div className="flex items-center gap-4 border-b border-slate-100 dark:border-slate-700/50 pb-4">
                <div className="w-12 h-12 rounded-2xl bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0">
                  <span className="material-symbols-outlined text-2xl">location_on</span>
                </div>
                <div>
                  <h3 className="text-base font-extrabold text-slate-800 dark:text-white">Fakülte Dersi (Yüz Yüze Öğretim)</h3>
                  <p className="text-xs text-slate-400 dark:text-slate-505">Bu ders üniversite yerleşkesinde, yüz yüze örgün öğretim şeklinde işlenmektedir.</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="p-4 bg-slate-50 dark:bg-slate-900/40 rounded-xl border border-slate-100 dark:border-slate-800 flex flex-col gap-1">
                  <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Derslik / Ders Yeri</span>
                  <span className="text-xs font-bold text-slate-850 dark:text-white flex items-center gap-1 mt-0.5">
                    <span className="material-symbols-outlined text-sm text-blue-650">meeting_room</span>
                    {currentCourse?.classroom || 'Belirtilmedi'}
                  </span>
                </div>
                <div className="p-4 bg-slate-50 dark:bg-slate-900/40 rounded-xl border border-slate-100 dark:border-slate-800 flex flex-col gap-1">
                  <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Öğretim Üyesi</span>
                  <span className="text-xs font-bold text-slate-850 dark:text-white flex items-center gap-1 mt-0.5">
                    <span className="material-symbols-outlined text-sm text-blue-650">person</span>
                    {currentCourse?.instructor}
                  </span>
                </div>
                <div className="p-4 bg-slate-50 dark:bg-slate-900/40 rounded-xl border border-slate-100 dark:border-slate-800 flex flex-col gap-1">
                  <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Ders Kodu &amp; Kredi</span>
                  <span className="text-xs font-bold text-slate-855 dark:text-white mt-0.5">
                    {currentCourse?.code} · {currentCourse?.akts || currentCourse?.ects} AKTS
                  </span>
                </div>
                <div className="p-4 bg-slate-50 dark:bg-slate-900/40 rounded-xl border border-slate-100 dark:border-slate-800 flex flex-col gap-1">
                  <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Eğitim Türü</span>
                  <span className="text-xs font-bold text-slate-855 dark:text-white mt-0.5">Fakülte / Örgün Öğretim</span>
                </div>
              </div>

              <div className="bg-slate-50 dark:bg-slate-900/40 p-6 rounded-2xl border border-slate-100 dark:border-slate-800 space-y-6">
                <div>
                  <h4 className="text-sm font-extrabold text-slate-800 dark:text-white flex items-center gap-1.5 mb-2">
                    <span className="material-symbols-outlined text-blue-650 text-base">info</span>
                    <span>Ders Hakkında Genel Bilgiler</span>
                  </h4>
                  <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                    {courseDescriptions[currentCourse?.code] || 'Bu ders, yazılım mühendisliği programının temel teknik dersleri arasında yer almakta olup yüz yüze teorik anlatım ve laboratuvar uygulamalarıyla desteklenmektedir.'}
                  </p>
                </div>

                <div className="border-t border-slate-100 dark:border-slate-700/60 pt-5">
                  <h4 className="text-sm font-extrabold text-slate-800 dark:text-white flex items-center gap-1.5 mb-3">
                    <span className="material-symbols-outlined text-blue-650 text-base">menu_book</span>
                    <span>Haftalık Müfredat Akışı (Syllabus)</span>
                  </h4>
                  <div className="space-y-2 text-xs">
                    {syllabusOutlines[currentCourse?.code]?.map((item, idx) => (
                      <div key={idx} className="flex gap-4 items-start py-1.5 border-b border-slate-100/50 dark:border-slate-800/40 last:border-0 pb-1.5">
                        <span className="font-extrabold text-blue-600 dark:text-blue-400 shrink-0 w-16">Hafta {idx + 1}:</span>
                        <span className="text-slate-700 dark:text-slate-300">{item}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="border-t border-slate-100 dark:border-slate-700/60 pt-5 flex flex-col md:flex-row justify-between gap-6">
                  <div className="flex-1">
                    <h4 className="text-sm font-extrabold text-slate-800 dark:text-white flex items-center gap-1.5 mb-3">
                      <span className="material-symbols-outlined text-blue-650 text-base">assessment</span>
                      <span>Değerlendirme Kriterleri</span>
                    </h4>
                    <div className="space-y-2 text-xs text-slate-700 dark:text-slate-300">
                      <div className="flex justify-between max-w-[240px] border-b border-slate-100/50 dark:border-slate-800/40 pb-1.5">
                        <span>Ara Sınav (Vize):</span>
                        <span className="font-extrabold text-slate-900 dark:text-white">%40</span>
                      </div>
                      <div className="flex justify-between max-w-[240px] pb-1.5">
                        <span>Yarıyıl Sonu Sınavı (Final):</span>
                        <span className="font-extrabold text-slate-900 dark:text-white">%60</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex-1 bg-blue-50/50 dark:bg-blue-950/10 border border-blue-100/50 dark:border-blue-900/20 p-5 rounded-2xl">
                    <h4 className="text-xs font-bold text-blue-800 dark:text-blue-400 flex items-center gap-1.5 mb-2">
                      <span className="material-symbols-outlined text-sm">info</span>
                      <span>Ders Materyalleri ve Notları Hakkında</span>
                    </h4>
                    <p className="text-[11px] text-blue-700 dark:text-blue-300/80 leading-relaxed m-0">
                      Bu ders yüz yüze işlenmektedir. Derse ait haftalık ders notları, slaytlar ve ek okuma materyallerine sayfanın altındaki "Ders Notları & PDF" sekmesinden ulaşabilir ve indirebilirsiniz.
                    </p>
                  </div>
                </div>
              </div>

            </div>
          </div>
        )}

      </div>

      <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-800/60 shadow-sm overflow-hidden">

          <div className="flex border-b border-slate-200 dark:border-slate-700/60 px-4 overflow-x-auto whitespace-nowrap scrollbar-none bg-slate-50/50 dark:bg-slate-800/40">
            <button
              onClick={() => setActiveTab('notes')}
              className={`py-4 px-6 text-xs font-bold flex items-center gap-1.5 transition-all border-b-2 cursor-pointer ${activeTab === 'notes'
                ? 'border-blue-600 text-blue-600 dark:text-blue-400'
                : 'border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
                }`}
            >
              <span className="material-symbols-outlined text-base">description</span>
              <span>Ders Notları &amp; PDF</span>
            </button>

            <button
              onClick={() => setActiveTab('code')}
              className={`py-4 px-6 text-xs font-bold flex items-center gap-1.5 transition-all border-b-2 cursor-pointer ${activeTab === 'code'
                ? 'border-blue-600 text-blue-600 dark:text-blue-400'
                : 'border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
                }`}
            >
              <span className="material-symbols-outlined text-base">code</span>
              <span>Derste Yazılan Kodlar (GitHub)</span>
            </button>

            {currentCourse?.code === 'WEB 307' && (
              <button
                onClick={() => setActiveTab('forum')}
                className={`py-4 px-6 text-xs font-bold flex items-center gap-1.5 transition-all border-b-2 relative cursor-pointer ${activeTab === 'forum'
                  ? 'border-blue-600 text-blue-600 dark:text-blue-400'
                  : 'border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
                  }`}
              >
                <span className="material-symbols-outlined text-base">forum</span>
                <span>Soru-Cevap / Forum</span>
                <span className="absolute top-3.5 right-2.5 w-1.5 h-1.5 bg-red-500 rounded-full"></span>
              </button>
            )}
          </div>

          <div className="p-6">
            {activeTab === 'notes' && (
              <div className="space-y-4">
                <div className="flex justify-between items-center pb-2 border-b border-slate-100 dark:border-slate-700/60">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">Ders Dokümanları (PDF)</h4>
                  <span className="text-[10px] text-slate-400 dark:text-slate-500">İndirmek için dokümana tıklayın</span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div
                    onClick={() => downloadCourseDocPDF('Hafta 1-2 Ders Özeti')}
                    className="p-4 bg-slate-50 dark:bg-slate-900/40 hover:bg-slate-100 dark:hover:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl flex items-center justify-between cursor-pointer transition-all active:scale-98"
                  >
                    <div className="flex items-center gap-3">
                      <span className="material-symbols-outlined text-red-500 text-3xl">picture_as_pdf</span>
                      <div>
                        <p className="text-xs font-bold text-slate-700 dark:text-slate-300">Hafta 1-2 Ders Özeti.pdf</p>
                        <p className="text-[9px] text-slate-405 dark:text-slate-505 mt-0.5">Slaytlar &amp; Çözümlü Problemler · 2.4 MB</p>
                      </div>
                    </div>
                    <span className="material-symbols-outlined text-slate-404 dark:text-slate-500">download</span>
                  </div>

                  <div
                    onClick={() => downloadCourseDocPDF('Hafta 3-4 Konu Detayları')}
                    className="p-4 bg-slate-50 dark:bg-slate-900/40 hover:bg-slate-100 dark:hover:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl flex items-center justify-between cursor-pointer transition-all active:scale-98"
                  >
                    <div className="flex items-center gap-3">
                      <span className="material-symbols-outlined text-red-500 text-3xl">picture_as_pdf</span>
                      <div>
                        <p className="text-xs font-bold text-slate-700 dark:text-slate-300">Hafta 3-4 Konu Detayları.pdf</p>
                        <p className="text-[9px] text-slate-405 dark:text-slate-505 mt-0.5">Ek Okuma Materyalleri · 1.8 MB</p>
                      </div>
                    </div>
                    <span className="material-symbols-outlined text-slate-404 dark:text-slate-500">download</span>
                  </div>

                  <div
                    onClick={() => downloadCourseDocPDF('Vize Sınavı Çalışma Rehberi')}
                    className="p-4 bg-slate-50 dark:bg-slate-900/40 hover:bg-slate-100 dark:hover:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl flex items-center justify-between cursor-pointer transition-all active:scale-98"
                  >
                    <div className="flex items-center gap-3">
                      <span className="material-symbols-outlined text-red-500 text-3xl">picture_as_pdf</span>
                      <div>
                        <p className="text-xs font-bold text-slate-700 dark:text-slate-300">Vize Sınavı Çalışma Rehberi.pdf</p>
                        <p className="text-[9px] text-slate-405 dark:text-slate-505 mt-0.5">Soru Tipleri &amp; Yanıt Anahtarı · 3.1 MB</p>
                      </div>
                    </div>
                    <span className="material-symbols-outlined text-slate-404 dark:text-slate-500">download</span>
                  </div>

                  <div
                    onClick={() => downloadCourseDocPDF('Ders İçi Proje Şablonu')}
                    className="p-4 bg-slate-50 dark:bg-slate-900/40 hover:bg-slate-100 dark:hover:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl flex items-center justify-between cursor-pointer transition-all active:scale-98"
                  >
                    <div className="flex items-center gap-3">
                      <span className="material-symbols-outlined text-red-500 text-3xl">picture_as_pdf</span>
                      <div>
                        <p className="text-xs font-bold text-slate-700 dark:text-slate-300">Ders İçi Proje Şablonu.pdf</p>
                        <p className="text-[9px] text-slate-405 dark:text-slate-505 mt-0.5">Proje Teslim Format Kılavuzu · 1.2 MB</p>
                      </div>
                    </div>
                    <span className="material-symbols-outlined text-slate-404 dark:text-slate-500">download</span>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'code' && (
              <div className="space-y-4">
                <div className="flex justify-between items-center pb-2 border-b border-slate-100 dark:border-slate-700/60">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">Derste Yazılan Kodlar</h4>
                  <button
                    onClick={handleCopyCode}
                    className="flex items-center gap-1 text-[10px] text-blue-600 dark:text-blue-400 font-extrabold cursor-pointer border-none bg-transparent hover:underline"
                  >
                    <span className="material-symbols-outlined text-xs">content_copy</span>
                    <span>Kodu Kopyala</span>
                  </button>
                </div>

                <div className="rounded-xl overflow-hidden bg-slate-900 text-slate-300 font-mono text-xs border border-slate-850 p-4 relative shadow-inner">
                  <pre className="overflow-x-auto whitespace-pre leading-relaxed">{codeSnippet}</pre>
                </div>
              </div>
            )}

            {activeTab === 'forum' && currentCourse?.code === 'WEB 307' && (
              <div className="space-y-6">
                <div className="flex justify-between items-center pb-2 border-b border-slate-100 dark:border-slate-700/60">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">Soru Cevap ve Tartışmalar</h4>
                  <span className="text-[10px] text-slate-400 dark:text-slate-500">{forumPosts.length} Gönderi</span>
                </div>

                <div className="space-y-4">
                  {forumPosts.map(post => (
                    <div key={post.id} className="p-4 bg-slate-50 dark:bg-slate-900/40 rounded-2xl border border-slate-100 dark:border-slate-800/80 flex gap-3 items-start">
                      <div className="w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900/50 text-blue-900 dark:text-blue-300 flex items-center justify-center font-bold text-xs shrink-0">
                        {post.avatar}
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-extrabold text-slate-800 dark:text-white">{post.author}</span>
                            {post.role && (
                              <span className="bg-blue-600 text-white text-[8px] px-1.5 py-0.2 rounded-full font-bold uppercase">
                                {post.role}
                              </span>
                            )}
                          </div>
                          <span className="text-[9px] text-slate-404 dark:text-slate-500 font-semibold">{post.time}</span>
                        </div>

                        <p className="text-xs text-slate-600 dark:text-slate-300 mt-2 font-medium leading-relaxed">{post.text}</p>

                        <div className="flex gap-4 items-center mt-3 pt-3 border-t border-slate-100 dark:border-slate-800/40 text-[10px] text-slate-400 font-bold">
                          <button
                            onClick={() => handleLikePost(post.id)}
                            className={`flex items-center gap-1 cursor-pointer border-none bg-transparent hover:text-slate-600 dark:hover:text-slate-300 ${post.hasLiked ? 'text-rose-500 dark:text-rose-400' : ''}`}
                          >
                            <span className="material-symbols-outlined text-sm">thumb_up</span>
                            <span>{post.likes}</span>
                          </button>

                          <button
                            onClick={() => setExpandedPosts(prev => ({ ...prev, [post.id]: !prev[post.id] }))}
                            className="flex items-center gap-1 cursor-pointer border-none bg-transparent hover:text-slate-600 dark:hover:text-slate-300"
                          >
                            <span className="material-symbols-outlined text-sm">chat_bubble</span>
                            <span>{post.replies} Yanıt</span>
                          </button>
                        </div>

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
                                    <span className="text-[8px] text-slate-404 font-semibold">{reply.time}</span>
                                  </div>
                                  <p className="text-slate-650 dark:text-slate-300 font-medium">{reply.text}</p>
                                </div>
                              </div>
                            ))}

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
                  ))}
                </div>

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
                        className="absolute right-3.5 bottom-3.5 text-blue-600 hover:text-blue-700 dark:text-blue-400 cursor-pointer flex items-center justify-center border-none bg-transparent"
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
