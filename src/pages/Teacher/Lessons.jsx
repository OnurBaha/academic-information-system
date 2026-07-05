import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useSelector, useDispatch } from 'react-redux'
import { miniCalendarWeeks } from '../../store/student/studentData'
import { jsPDF } from 'jspdf'
import { toast } from 'react-hot-toast'
import { fetchTeacherDashboardDataAsync, submitTeacherCourseRequestAsync } from '../../store/teacher/teacherSlice'

export default function TeacherLessons() {
  const navigate = useNavigate()
  const dispatch = useDispatch()
  const { currentUser } = useSelector((state) => state.auth || {})
  const { courses: COURSES = [] } = useSelector((state) => state.teacher || {})

  const [schedules, setSchedules] = useState([])
  const [allCoursesCatalog, setAllCoursesCatalog] = useState([])
  const [isRequestModalOpen, setIsRequestModalOpen] = useState(false)

  // Course Request States
  const [reqCourseCode, setReqCourseCode] = useState('')
  const [reqDay, setReqDay] = useState('Pazartesi')
  const [reqTimeSlot, setReqTimeSlot] = useState('09:00 - 10:30')
  const [reqRoom, setReqRoom] = useState('LAB-B3')
  const [reqGroup, setReqGroup] = useState('Grup A')

  const fetchScheduleAndCatalog = () => {
    fetch('http://localhost:3001/schedules')
      .then(res => res.json())
      .then(data => setSchedules(data))
      .catch(err => console.error(err))

    fetch('http://localhost:3001/courses')
      .then(res => res.json())
      .then(data => {
        setAllCoursesCatalog(data)
        if (data.length > 0) {
          setReqCourseCode(data[0].code)
        }
      })
      .catch(err => console.error(err))
  }

  useEffect(() => {
    dispatch(fetchTeacherDashboardDataAsync())
    fetchScheduleAndCatalog()
  }, [dispatch])

  // Map schedules to initialLessons format
  const initialLessons = schedules
    .filter(s => s.instructorName === currentUser?.name && s.status === 'approved')
    .map(s => {
      const dayIndexMap = { 'Pazartesi': 1, 'Salı': 2, 'Çarşamba': 3, 'Perşembe': 4, 'Cuma': 5 }
      const duration = s.timeSlot.includes('-')
        ? (() => {
            const [start, end] = s.timeSlot.split('-').map(x => x.trim())
            const [sh, sm] = start.split(':').map(Number)
            const [eh, em] = end.split(':').map(Number)
            return String((eh * 60 + em) - (sh * 60 + sm)) + " Dakika"
          })()
        : '90 Dakika'

      return {
        id: s.id,
        code: s.courseCode,
        name: s.courseName,
        instructor: s.instructorName,
        day: s.day,
        dayIndex: dayIndexMap[s.day] || 1,
        time: s.timeSlot,
        duration: duration,
        type: s.room === 'Online / Zoom' ? 'online' : 'school',
        classroom: s.room,
        group: s.group || 'Grup A',
        grade: '3. Sınıf',
        studentCount: s.studentCount || 40,
        topic: s.type === 'sinav' ? 'Sınav Değerlendirmesi' : 'Ders Konusu Detayları',
        color: s.type === 'sinav' ? 'rose' : s.room === 'Online / Zoom' ? 'indigo' : 'emerald',
        isLiveNow: false
      }
    })

  const handleRequestCourse = (e) => {
    e.preventDefault()
    const selectedCourseObj = allCoursesCatalog.find(c => c.code === reqCourseCode)
    if (!selectedCourseObj) return

    dispatch(submitTeacherCourseRequestAsync({
      instructorName: currentUser?.name || 'Öğretim Üyesi',
      courseName: `${selectedCourseObj.code} - ${selectedCourseObj.name}`,
      dept: selectedCourseObj.category || 'Mühendislik Fakültesi',
      day: reqDay,
      timeSlot: reqTimeSlot,
      room: reqRoom,
      group: reqGroup,
      courseCode: selectedCourseObj.code
    })).unwrap().then(() => {
      toast.success('Ders görevlendirme talebiniz Dekan onayına sunuldu!')
      setIsRequestModalOpen(false)
      fetchScheduleAndCatalog()
    }).catch(() => {
      toast.error('Talep gönderilemedi.')
    })
  }

  const downloadDocPDF = (title, courseName, courseCode) => {
    try {
      const doc = new jsPDF()
      
      doc.setFont('Helvetica', 'bold')
      doc.setFontSize(16)
      doc.setTextColor(30, 58, 138)
      doc.text('AKADEMIK BILGI SISTEMI - DERS MATERYALI', 14, 20)
      
      doc.setFont('Helvetica', 'normal')
      doc.setFontSize(10)
      doc.setTextColor(100, 116, 139)
      doc.text(`Ders: ${courseName || 'Secili Ders'} (${courseCode || ''})`, 14, 28)
      doc.text(`Dokuman: ${title}`, 14, 34)
      doc.text(`Tarih: ${new Date().toLocaleDateString('tr-TR')}`, 14, 40)
      
      doc.line(14, 46, 196, 46)
      
      doc.setFont('Helvetica', 'bold')
      doc.setFontSize(12)
      doc.setTextColor(30, 41, 59)
      doc.text('Ders Ozeti ve Genel Degerlendirme Notlari (Akademisyen Yuklemesi)', 14, 56)
      
      doc.setFont('Helvetica', 'normal')
      doc.setFontSize(10)
      const details = [
        `1. Ders Mufredat Detaylari: Bu bolumde ${courseName || 'ders'} ile ilgili akademisyen tarafindan yuklenen haftalik calisma notlari ve sunumlari yer almaktadir.`,
        `2. Laboratuvar ve Pratik Notlari: Uygulamali konularin calisma kodlari ve simulasyon sonuclari bu dokumanda yer alir.`,
        `3. Ek Kaynaklar: Konunun pekismesi icin onerilen makaleler ve ek baglantilar.`
      ]
      
      let startY = 66
      details.forEach(line => {
        const splitText = doc.splitTextToSize(line, 180)
        doc.text(splitText, 14, startY)
        startY += 18
      })
      
      // Footer
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

  const handleOpenLink = (url) => {
    window.open(url, '_blank', 'noopener,noreferrer')
    toast.success('Kaynak kod deposuna yönlendiriliyorsunuz...')
  }
  
  // Görünüm tipi: 'grid' (Haftalık Çizelge) veya 'list' (Ders Listesi)
  const [viewMode, setViewMode] = useState('grid')
  // Filtre: 'all', 'online', 'school'
  const [typeFilter, setTypeFilter] = useState('all')
  // Seçili ders detayı için modal durumu
  const [selectedLesson, setSelectedLesson] = useState(null)
  // Seçili gün durumu (Varsayılan olarak Cuma, 12 Haziran 2026 seçili)
  const [selectedDay, setSelectedDay] = useState({ day: 12, month: 'Haz' })

  // ESC tuşuyla modal kapatma
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        setSelectedLesson(null)
      }
    }
    if (selectedLesson) {
      window.addEventListener('keydown', handleKeyDown)
      document.body.style.overflow = 'hidden'
    }
    return () => {
      window.removeEventListener('keydown', handleKeyDown)
      document.body.style.overflow = 'unset'
    }
  }, [selectedLesson])

  const filteredLessons = initialLessons.filter((lesson) => {
    if (typeFilter === 'online') return lesson.type === 'online'
    if (typeFilter === 'school') return lesson.type === 'school'
    return true
  })

  // ── Mini Calendar & Position Helpers ──
  const getWeekdayIndex = (day, month) => {
    const mIdx = month === 'May' ? 4 : 5
    const date = new Date(2026, mIdx, day)
    return date.getDay() === 0 ? 7 : date.getDay()
  }

  const getWeekIndex = (day, month) => {
    const idx = miniCalendarWeeks.findIndex(week =>
      week.some(cell => cell.day === day && cell.month === month)
    )
    return idx !== -1 ? idx + 1 : 1
  }

  const getWeekdayDayNum = (dayIndex, wIdx) => {
    const week = miniCalendarWeeks[wIdx - 1]
    if (!week) return { day: 12, month: 'Haz' }
    const cell = week[dayIndex - 1]
    return { day: cell.day, month: cell.month }
  }

  const selectedWeekday = getWeekdayIndex(selectedDay.day, selectedDay.month)
  const weekIndex = getWeekIndex(selectedDay.day, selectedDay.month)

  const isMondayActive = selectedWeekday === 1
  const isTuesdayActive = selectedWeekday === 2
  const isWednesdayActive = selectedWeekday === 3
  const isThursdayActive = selectedWeekday === 4
  const isFridayActive = selectedWeekday === 5

  const getDayLabelString = () => {
    return `${selectedDay.day} ${selectedDay.month === 'May' ? 'Mayıs' : 'Haziran'}`
  }

  const isSelectedCell = (cell) => {
    return selectedDay.day === cell.day && selectedDay.month === cell.month
  }

  const handleMiniCalClick = (cell) => {
    if (cell.isWeekend) return
    setSelectedDay({ day: cell.day, month: cell.month })
  }

  const getLessonsForDay = (dayName) => {
    return filteredLessons
      .filter((l) => l.day === dayName)
      .map((l) => {
        let top = 400;
        if (l.time.startsWith('09:00')) top = 0;
        else if (l.time.startsWith('10:00')) top = 80;
        else if (l.time.startsWith('11:00')) top = 160;
        else if (l.time.startsWith('12:00')) top = 240;
        else if (l.time.startsWith('13:00')) top = 320;
        else if (l.time.startsWith('14:00')) top = 400;
        else if (l.time.startsWith('15:00')) top = 480;
        else if (l.time.startsWith('16:00')) top = 560;

        let height = 200;
        if (l.duration) {
          const mins = parseInt(l.duration);
          if (!isNaN(mins)) {
            height = (mins / 60) * 80;
          }
        }

        let calendarColor = 'primary';
        if (l.color === 'indigo') calendarColor = 'secondary';
        else if (l.color === 'emerald') calendarColor = 'success-emerald';
        else if (l.color === 'amber') calendarColor = 'warning-amber';
        else if (l.color === 'rose') calendarColor = 'error';

        return {
          ...l,
          top,
          height,
          color: calendarColor,
          room: l.classroom,
          typeLabel: l.type === 'online' ? 'Online' : 'Yüz Yüze'
        }
      });
  }

  const currentWeekLessons = {
    monday: getLessonsForDay('Pazartesi'),
    tuesday: getLessonsForDay('Salı'),
    wednesday: getLessonsForDay('Çarşamba'),
    thursday: getLessonsForDay('Perşembe'),
    friday: getLessonsForDay('Cuma')
  }

  const getSelectedDaySchedule = () => {
    const dayOfWeek = getWeekdayIndex(selectedDay.day, selectedDay.month)
    if (dayOfWeek === 1) return currentWeekLessons.monday
    if (dayOfWeek === 2) return currentWeekLessons.tuesday
    if (dayOfWeek === 3) return currentWeekLessons.wednesday
    if (dayOfWeek === 4) return currentWeekLessons.thursday
    if (dayOfWeek === 5) return currentWeekLessons.friday
    return []
  }

  const selectedDaySchedule = getSelectedDaySchedule()

  const daysOfWeek = ['Pazartesi', 'Salı', 'Çarşamba', 'Perşembe', 'Cuma']

  // İlgili derse katıl / canlı yayını başlat
  const handleStartLive = (lesson) => {
    navigate('/teacher/live', { state: { courseName: lesson.name, courseCode: lesson.code, group: lesson.group } })
  }

  // Okuldaki ders için yoklama sayfasına yönlendir
  const handleTakeAttendance = (lesson) => {
    navigate('/teacher/attendance', { state: { courseCode: lesson.code, group: lesson.group } })
  }

  // Okuldaki ders için not giriş sayfasına yönlendir
  const handleGradeEntry = (lesson) => {
    navigate('/teacher/grades', { state: { courseCode: lesson.code, group: lesson.group } })
  }

  return (
    <section className="teacher-page-canvas animate-fade-in flex flex-col gap-6">
      {/* Sayfa Başlığı */}
      <div className="flex items-start justify-between border-b border-slate-100 dark:border-slate-800 pb-5">
        <div>
          <h2 className="text-xl font-extrabold text-slate-800 dark:text-white flex items-center gap-2">
            <span className="material-symbols-outlined text-secondary text-2xl">view_week</span>
            <span>Haftalık Ders Programı</span>
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">2025-2026 Bahar Dönemi — gün seçmek için sağdaki takvimi veya kolon başlıklarını kullanın.</p>
        </div>
        <button
          onClick={() => setIsRequestModalOpen(true)}
          className="px-4 py-2 bg-gradient-to-r from-blue-750 to-blue-900 hover:from-blue-800 hover:to-blue-950 text-white rounded-xl text-xs font-bold flex items-center gap-2 border-none cursor-pointer shadow-sm hover:shadow-md transition-all duration-300"
        >
          <span className="material-symbols-outlined text-sm">add_circle</span>
          <span>Ders Görevlendirmesi Talep Et</span>
        </button>
      </div>

      {/* İstatistik Özet Kartları */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <div className="bg-white dark:bg-slate-800 border border-slate-200/60 dark:border-slate-700/50 rounded-2xl p-5 shadow-sm flex items-center gap-4 hover:shadow-md transition-all duration-300">
          <div className="w-12 h-12 rounded-xl bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 flex items-center justify-center text-2xl font-bold">
            <span className="material-symbols-outlined">schedule</span>
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Haftalık Toplam Ders</p>
            <h3 className="text-xl font-extrabold text-slate-800 dark:text-white mt-1">12.5 Saat <span className="text-xs font-normal text-slate-400 dark:text-slate-500">(5 Ders)</span></h3>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-800 border border-slate-200/60 dark:border-slate-700/50 rounded-2xl p-5 shadow-sm flex items-center gap-4 hover:shadow-md transition-all duration-300">
          <div className="w-12 h-12 rounded-xl bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 flex items-center justify-center text-2xl font-bold">
            <span className="material-symbols-outlined">sensors</span>
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Online Eğitim Şubeleri</p>
            <h3 className="text-xl font-extrabold text-slate-800 dark:text-white mt-1">2 Şube <span className="text-xs font-normal text-indigo-500 font-bold bg-indigo-50 dark:bg-indigo-950/40 px-2 py-0.5 rounded ml-2">Zoom / AIS</span></h3>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-800 border border-slate-200/60 dark:border-slate-700/50 rounded-2xl p-5 shadow-sm flex items-center gap-4 hover:shadow-md transition-all duration-300">
          <div className="w-12 h-12 rounded-xl bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 flex items-center justify-center text-2xl font-bold">
            <span className="material-symbols-outlined">meeting_room</span>
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Yüz Yüze Sınıflar</p>
            <h3 className="text-xl font-extrabold text-slate-800 dark:text-white mt-1">3 Şube <span className="text-xs font-normal text-emerald-500 font-bold bg-emerald-50 dark:bg-emerald-950/40 px-2 py-0.5 rounded ml-2">Fakülte Laboratuvar</span></h3>
          </div>
        </div>
      </div>

      {/* Kontrol Çubuğu (Filtreleme & Görünüm Değiştirme) */}
      <div className="flex flex-col sm:flex-row justify-between items-center gap-4 bg-white dark:bg-slate-800 p-4 border border-slate-200/60 dark:border-slate-700/50 rounded-2xl shadow-sm">
        
        {/* Sol Taraf: Filtre Butonları */}
        <div className="flex items-center gap-2 bg-slate-100 dark:bg-slate-900/60 p-1.5 rounded-xl w-full sm:w-auto">
          <button
            onClick={() => setTypeFilter('all')}
            className={`flex-1 sm:flex-initial px-4 py-2 rounded-lg text-xs font-bold transition-all border-none cursor-pointer ${
              typeFilter === 'all'
                ? 'bg-white dark:bg-slate-800 text-slate-800 dark:text-white shadow-sm'
                : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300 bg-transparent'
            }`}
          >
            Tüm Dersler
          </button>
          <button
            onClick={() => setTypeFilter('online')}
            className={`flex-1 sm:flex-initial px-4 py-2 rounded-lg text-xs font-bold transition-all border-none cursor-pointer flex items-center justify-center gap-1.5 ${
              typeFilter === 'online'
                ? 'bg-indigo-600 text-white shadow-md'
                : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300 bg-transparent'
            }`}
          >
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping"></span>
            Online
          </button>
          <button
            onClick={() => setTypeFilter('school')}
            className={`flex-1 sm:flex-initial px-4 py-2 rounded-lg text-xs font-bold transition-all border-none cursor-pointer ${
              typeFilter === 'school'
                ? 'bg-emerald-600 text-white shadow-md'
                : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300 bg-transparent'
            }`}
          >
            Yüz Yüze
          </button>
        </div>

        {/* Sağ Taraf: Görünüm Seçici (Grid vs List) */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setViewMode('list')}
            className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all border-none cursor-pointer ${
              viewMode === 'list'
                ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 border border-blue-100 dark:border-blue-800'
                : 'text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-900 bg-transparent'
            }`}
            title="Ders Listesi"
          >
            <span className="material-symbols-outlined">view_agenda</span>
          </button>
          <button
            onClick={() => setViewMode('grid')}
            className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all border-none cursor-pointer ${
              viewMode === 'grid'
                ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 border border-blue-100 dark:border-blue-800'
                : 'text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-900 bg-transparent'
            }`}
            title="Haftalık Çizelge"
          >
            <span className="material-symbols-outlined">grid_view</span>
          </button>
        </div>
      </div>

      {/* DERS PROGRAMI GÖSTERİMİ */}
      {viewMode === 'list' ? (
        
        /* 1) DETAYLI LİSTE GÖRÜNÜMÜ */
        <div className="flex flex-col gap-6">
          {daysOfWeek.map((day) => {
            const dayLessons = filteredLessons.filter((lesson) => lesson.day === day)
            if (dayLessons.length === 0) return null

            return (
              <div key={day} className="flex flex-col gap-3">
                {/* Gün Başlığı */}
                <div className="flex items-center gap-2 px-1">
                  <span className="w-2.5 h-2.5 rounded-full bg-blue-600"></span>
                  <h3 className="text-sm font-extrabold text-slate-800 dark:text-slate-200 tracking-wide uppercase">
                    {day}
                  </h3>
                  <span className="text-[10px] text-slate-400 dark:text-slate-500 font-bold bg-slate-100 dark:bg-slate-900 px-2 py-0.5 rounded-full">
                    {dayLessons.length} Ders
                  </span>
                </div>

                {/* Günün Ders Kartları */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {dayLessons.map((lesson) => (
                    <div
                      key={lesson.id}
                      className={`group bg-white dark:bg-slate-800 border border-slate-200/60 dark:border-slate-700/50 rounded-3xl p-5 shadow-sm hover:shadow-md hover:border-slate-300 dark:hover:border-slate-600 transition-all duration-300 flex flex-col gap-4 relative overflow-hidden`}
                    >
                      {/* Kart Arka Plan Dekoratif Halka */}
                      <div className={`absolute -right-4 -bottom-4 w-24 h-24 rounded-full bg-gradient-to-tr from-${lesson.color}-500/5 to-transparent blur-md group-hover:scale-110 transition-transform duration-300`}></div>

                      {/* Kart Üst Kısım: Zaman & Etiketler */}
                      <div className="flex justify-between items-center relative z-10">
                        <div className="flex items-center gap-2">
                          <div className="bg-slate-50 dark:bg-slate-900/60 px-3 py-1.5 rounded-xl border border-slate-100 dark:border-slate-800 flex items-center gap-1.5 text-xs font-bold text-slate-600 dark:text-slate-300">
                            <span className="material-symbols-outlined text-[14px] text-blue-600">schedule</span>
                            <span>{lesson.time}</span>
                          </div>
                        </div>

                        {/* Online vs Sınıfta Etiketleri */}
                        {lesson.type === 'online' ? (
                          <span className="px-3 py-1 rounded-full text-[10px] font-bold tracking-wider uppercase bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400 border border-indigo-100 dark:border-indigo-900/40 flex items-center gap-1">
                            <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 animate-ping"></span>
                            Online
                          </span>
                        ) : (
                          <span className="px-3 py-1 rounded-full text-[10px] font-bold tracking-wider uppercase bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400 border border-emerald-100 dark:border-emerald-900/40 flex items-center gap-1">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                            Yüz Yüze
                          </span>
                        )}
                      </div>

                      {/* Kart Orta Kısım: Ders Detayı */}
                      <div className="flex flex-col gap-1 relative z-10 cursor-pointer" onClick={() => setSelectedLesson(lesson)}>
                        <div className="text-[10px] font-bold text-slate-400 dark:text-slate-500 tracking-widest uppercase">{lesson.code}</div>
                        <h4 className="text-base font-extrabold text-slate-800 dark:text-white group-hover:text-blue-600 transition-colors">
                          {lesson.name}
                        </h4>
                        <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 mt-2 text-xs text-slate-500 dark:text-slate-400">
                          <span className="flex items-center gap-1.5">
                            <span className="material-symbols-outlined text-sm">groups</span>
                            <strong>{lesson.grade} · {lesson.group}</strong>
                          </span>
                          <span className="flex items-center gap-1.5">
                            <span className="material-symbols-outlined text-sm">meeting_room</span>
                            <span>{lesson.classroom}</span>
                          </span>
                          <span className="flex items-center gap-1.5">
                            <span className="material-symbols-outlined text-sm">group</span>
                            <span>{lesson.studentCount} Öğrenci</span>
                          </span>
                        </div>
                      </div>

                      {/* Kart Alt Kısım: Butonlar */}
                      <div className="flex gap-2.5 mt-2 relative z-10 pt-4 border-t border-slate-100 dark:border-slate-700/50">
                        {lesson.type === 'online' ? (
                          <>
                            <button
                              onClick={() => handleStartLive(lesson)}
                              className="flex-1 py-2.5 px-4 bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-700 hover:to-blue-700 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-2 border-none cursor-pointer shadow-sm hover:shadow-md transition-all active:scale-98"
                            >
                              <span className="material-symbols-outlined text-[16px] animate-pulse">sensors</span>
                              <span>Yayını Başlat / Katıl</span>
                            </button>
                            <button
                              onClick={() => setSelectedLesson(lesson)}
                              className="py-2.5 px-3 bg-slate-50 hover:bg-slate-100 dark:bg-slate-900/60 dark:hover:bg-slate-900 text-slate-600 dark:text-slate-300 rounded-xl text-xs font-bold border border-slate-100 dark:border-slate-800 hover:border-slate-200 cursor-pointer transition-all flex items-center justify-center"
                              title="Ders Detayları"
                            >
                              <span className="material-symbols-outlined text-[16px]">info</span>
                            </button>
                          </>
                        ) : (
                          <>
                            <button
                              onClick={() => handleTakeAttendance(lesson)}
                              className="flex-1 py-2.5 px-4 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-2 border-none cursor-pointer transition-all active:scale-98"
                            >
                              <span className="material-symbols-outlined text-[16px]">fact_check</span>
                              <span>Yoklama Al</span>
                            </button>
                            <button
                              onClick={() => handleGradeEntry(lesson)}
                              className="flex-1 py-2.5 px-4 bg-slate-50 hover:bg-slate-100 dark:bg-slate-900/60 dark:hover:bg-slate-900 text-slate-700 dark:text-slate-300 rounded-xl text-xs font-bold border border-slate-100 dark:border-slate-800 cursor-pointer transition-all flex items-center justify-center gap-1.5"
                            >
                              <span className="material-symbols-outlined text-[16px]">edit_note</span>
                              <span>Not Girişi</span>
                            </button>
                          </>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )
          })}
        </div>
      ) : (
        
        /* 2) HAFTALIK ÇİZELGE (GRID VEYA AJANDA) GÖRÜNÜMÜ */
        <div className="flex flex-col gap-6 max-w-[1440px] mx-auto w-full">
          {/* Satır: Haftalık Ders Programı (Sol) + Mini Takvim (Sağ) */}
          <div className="flex flex-col xl:flex-row gap-5 items-start">
            
            {/* Haftalık Ders Programı */}
            <div className="flex-1 min-w-0 w-full overflow-x-auto">
              <div className="bg-white dark:bg-slate-800 border border-slate-200/60 dark:border-slate-700/50 rounded-3xl overflow-hidden shadow-sm min-w-[800px]">
                
                {/* Haftalık Başlık Günleri (Pazartesi - Cuma, aktif günü seçmek için tıklanabilir) */}
                <div className="grid grid-cols-[80px_1fr_1fr_1fr_1fr_1fr] bg-table-header border-b border-outline-variant/30 py-4 text-center">
                  <div className="font-label-sm text-on-surface-variant flex items-center justify-center font-bold">SAAT</div>
                  
                  {/* Pazartesi */}
                  <button
                    onClick={() => setSelectedDay(getWeekdayDayNum(1, weekIndex))}
                    className={`font-label-md transition-all duration-300 border-none bg-transparent cursor-pointer flex flex-col items-center justify-center gap-0.5 ${isMondayActive ? 'text-secondary font-extrabold scale-105' : 'text-primary dark:text-slate-300 hover:opacity-80'}`}
                  >
                    <span>Pazartesi</span>
                    <span className="text-[10px] opacity-70">
                      {getWeekdayDayNum(1, weekIndex).day}
                    </span>
                  </button>

                  {/* Salı */}
                  <button
                    onClick={() => setSelectedDay(getWeekdayDayNum(2, weekIndex))}
                    className={`font-label-md transition-all duration-300 border-none bg-transparent cursor-pointer flex flex-col items-center justify-center gap-0.5 ${isTuesdayActive ? 'text-secondary font-extrabold scale-105' : 'text-primary dark:text-slate-300 hover:opacity-80'}`}
                  >
                    <span>Salı</span>
                    <span className="text-[10px] opacity-70">
                      {getWeekdayDayNum(2, weekIndex).day}
                    </span>
                  </button>

                  {/* Çarşamba */}
                  <button
                    onClick={() => setSelectedDay(getWeekdayDayNum(3, weekIndex))}
                    className={`font-label-md transition-all duration-300 border-none bg-transparent cursor-pointer flex flex-col items-center justify-center gap-0.5 ${isWednesdayActive ? 'text-secondary font-extrabold scale-105' : 'text-primary dark:text-slate-300 hover:opacity-80'}`}
                  >
                    <span>Çarşamba</span>
                    <span className="text-[10px] opacity-70">
                      {getWeekdayDayNum(3, weekIndex).day}
                    </span>
                  </button>

                  {/* Perşembe */}
                  <button
                    onClick={() => setSelectedDay(getWeekdayDayNum(4, weekIndex))}
                    className={`font-label-md transition-all duration-300 border-none bg-transparent cursor-pointer flex flex-col items-center justify-center gap-0.5 ${isThursdayActive ? 'text-secondary font-extrabold scale-105' : 'text-primary dark:text-slate-300 hover:opacity-80'}`}
                  >
                    <span>Perşembe</span>
                    <span className="text-[10px] opacity-70">
                      {getWeekdayDayNum(4, weekIndex).day}
                    </span>
                  </button>

                  {/* Cuma */}
                  <button
                    onClick={() => setSelectedDay(getWeekdayDayNum(5, weekIndex))}
                    className={`font-label-md transition-all duration-300 border-none bg-transparent cursor-pointer flex flex-col items-center justify-center gap-0.5 ${isFridayActive ? 'text-secondary font-extrabold scale-105' : 'text-primary dark:text-slate-300 hover:opacity-80'}`}
                  >
                    <span>Cuma</span>
                    <span className="text-[10px] opacity-70">
                      {getWeekdayDayNum(5, weekIndex).day}
                    </span>
                  </button>
                </div>

                {/* Izgara Gövdesi */}
                <div className="schedule-grid relative">
                  
                  {/* Saat Satırları */}
                  {['09:00', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00', '17:00'].map((hour, idx) => (
                    <div key={idx} className="contents">
                      <div className="border-r border-outline-variant/20 flex items-center justify-center font-label-sm text-outline">
                        {hour}
                      </div>
                      <div className="border-r border-outline-variant/10 border-b"></div>
                      <div className="border-r border-outline-variant/10 border-b"></div>
                      <div className="border-r border-outline-variant/10 border-b"></div>
                      <div className="border-r border-outline-variant/10 border-b"></div>
                      <div className="border-b border-outline-variant/10"></div>
                    </div>
                  ))}

                  {/* Seçili gün için dikey vurgu katmanı */}
                  {selectedWeekday >= 1 && selectedWeekday <= 5 && (
                    <div
                      className="absolute top-0 bottom-0 bg-secondary/5 border-l border-r border-secondary/20 pointer-events-none transition-all duration-500 ease-out"
                      style={{
                        left: `calc(80px + ((100% - 80px) / 5) * ${selectedWeekday - 1})`,
                        width: `calc((100% - 80px) / 5)`
                      }}
                    />
                  )}

                  {/* Pazartesi Ders Gösterimi */}
                  {currentWeekLessons.monday.map((course) => (
                    <div
                      key={course.id}
                      className={`absolute w-[calc((100%-80px)/5)] p-2 transition-all duration-300 ${isMondayActive ? 'z-10 scale-[1.01]' : 'opacity-85 z-0'}`}
                      style={{
                        top: `${course.top}px`,
                        left: '80px',
                        height: `${course.height}px`
                      }}
                      onClick={() => setSelectedDay(getWeekdayDayNum(1, weekIndex))}
                    >
                      <div className={`w-full h-full course-card-inner course-card-${course.color} ${isMondayActive ? 'active' : ''} rounded-lg p-3 flex flex-col gap-1 shadow-sm transition-transform hover:scale-[1.02] cursor-pointer`}>
                        <span className={`font-label-sm text-${course.color} uppercase tracking-wider`}>{course.typeLabel}</span>
                        <h4 className={`font-title-lg text-${course.color} text-[14px] leading-tight font-bold`}>{course.name}</h4>
                        <p className="text-[11px] text-on-surface-variant font-medium mt-auto flex items-center gap-1">
                          <span className="material-symbols-outlined text-[13px]">person</span>
                          <span>{course.instructor}</span>
                        </p>
                        <p className="text-[11px] text-on-surface-variant font-medium flex items-center gap-1">
                          <span className="material-symbols-outlined text-[13px]">meeting_room</span>
                          <span>{course.room}</span>
                        </p>
                      </div>
                    </div>
                  ))}

                  {/* Salı Ders Gösterimi */}
                  {currentWeekLessons.tuesday.map((course) => (
                    <div
                      key={course.id}
                      className={`absolute w-[calc((100%-80px)/5)] p-2 transition-all duration-300 ${isTuesdayActive ? 'z-10 scale-[1.01]' : 'opacity-85 z-0'}`}
                      style={{
                        top: `${course.top}px`,
                        left: 'calc(80px + ((100% - 80px) / 5) * 1)',
                        height: `${course.height}px`
                      }}
                      onClick={() => setSelectedDay(getWeekdayDayNum(2, weekIndex))}
                    >
                      <div className={`w-full h-full course-card-inner course-card-${course.color} ${isTuesdayActive ? 'active' : ''} rounded-lg p-3 flex flex-col gap-1 shadow-sm transition-transform hover:scale-[1.02] cursor-pointer`}>
                        <span className={`font-label-sm text-${course.color} uppercase tracking-wider`}>{course.typeLabel}</span>
                        <h4 className={`font-title-lg text-${course.color} text-[14px] leading-tight font-bold`}>{course.name}</h4>
                        <p className="text-[11px] text-on-surface-variant font-medium mt-auto flex items-center gap-1">
                          <span className="material-symbols-outlined text-[13px]">person</span>
                          <span>{course.instructor}</span>
                        </p>
                        <p className="text-[11px] text-on-surface-variant font-medium flex items-center gap-1">
                          <span className="material-symbols-outlined text-[13px]">meeting_room</span>
                          <span>{course.room}</span>
                        </p>
                      </div>
                    </div>
                  ))}

                  {/* Çarşamba Ders Gösterimi */}
                  {currentWeekLessons.wednesday.map((course) => (
                    <div
                      key={course.id}
                      className={`absolute w-[calc((100%-80px)/5)] p-2 transition-all duration-300 ${isWednesdayActive ? 'z-10 scale-[1.01]' : 'opacity-85 z-0'}`}
                      style={{
                        top: `${course.top}px`,
                        left: 'calc(80px + ((100% - 80px) / 5) * 2)',
                        height: `${course.height}px`
                      }}
                      onClick={() => setSelectedDay(getWeekdayDayNum(3, weekIndex))}
                    >
                      <div className={`w-full h-full course-card-inner course-card-${course.color} ${isWednesdayActive ? 'active' : ''} rounded-lg p-3 flex flex-col gap-1 shadow-sm transition-transform hover:scale-[1.02] cursor-pointer`}>
                        <span className={`font-label-sm text-${course.color} uppercase tracking-wider`}>{course.typeLabel}</span>
                        <h4 className={`font-title-lg text-${course.color} text-[14px] leading-tight font-bold`}>{course.name}</h4>
                        <p className="text-[11px] text-on-surface-variant font-medium mt-auto flex items-center gap-1">
                          <span className="material-symbols-outlined text-[13px]">person</span>
                          <span>{course.instructor}</span>
                        </p>
                        <p className="text-[11px] text-on-surface-variant font-medium flex items-center gap-1">
                          <span className="material-symbols-outlined text-[13px]">meeting_room</span>
                          <span>{course.room}</span>
                        </p>
                      </div>
                    </div>
                  ))}

                  {/* Perşembe Ders Gösterimi */}
                  {currentWeekLessons.thursday.map((course) => (
                    <div
                      key={course.id}
                      className={`absolute w-[calc((100%-80px)/5)] p-2 transition-all duration-300 ${isThursdayActive ? 'z-10 scale-[1.01]' : 'opacity-85 z-0'}`}
                      style={{
                        top: `${course.top}px`,
                        left: 'calc(80px + ((100% - 80px) / 5) * 3)',
                        height: `${course.height}px`
                      }}
                      onClick={() => setSelectedDay(getWeekdayDayNum(4, weekIndex))}
                    >
                      <div className={`w-full h-full course-card-inner course-card-${course.color} ${isThursdayActive ? 'active' : ''} rounded-lg p-3 flex flex-col gap-1 shadow-sm transition-transform hover:scale-[1.02] cursor-pointer`}>
                        <span className={`font-label-sm text-${course.color} uppercase tracking-wider`}>{course.typeLabel}</span>
                        <h4 className={`font-title-lg text-${course.color} text-[14px] leading-tight font-bold`}>{course.name}</h4>
                        <p className="text-[11px] text-on-surface-variant font-medium mt-auto flex items-center gap-1">
                          <span className="material-symbols-outlined text-[13px]">person</span>
                          <span>{course.instructor}</span>
                        </p>
                        <p className="text-[11px] text-on-surface-variant font-medium flex items-center gap-1">
                          <span className="material-symbols-outlined text-[13px]">meeting_room</span>
                          <span>{course.room}</span>
                        </p>
                      </div>
                    </div>
                  ))}

                  {/* Cuma Ders Gösterimi */}
                  {currentWeekLessons.friday.map((course) => (
                    <div
                      key={course.id}
                      className={`absolute w-[calc((100%-80px)/5)] p-2 transition-all duration-300 ${isFridayActive ? 'z-10 scale-[1.01]' : 'opacity-85 z-0'}`}
                      style={{
                        top: `${course.top}px`,
                        left: 'calc(80px + ((100% - 80px) / 5) * 4)',
                        height: `${course.height}px`
                      }}
                      onClick={() => setSelectedDay(getWeekdayDayNum(5, weekIndex))}
                    >
                      <div className={`w-full h-full course-card-inner course-card-${course.color} ${isFridayActive ? 'active' : ''} rounded-lg p-3 flex flex-col gap-1 shadow-sm transition-transform hover:scale-[1.02] cursor-pointer`}>
                        <span className={`font-label-sm text-${course.color} uppercase tracking-wider`}>{course.typeLabel}</span>
                        <h4 className={`font-title-lg text-${course.color} text-[14px] leading-tight font-bold`}>{course.name}</h4>
                        <p className="text-[11px] text-on-surface-variant font-medium mt-auto flex items-center gap-1">
                          <span className="material-symbols-outlined text-[13px]">person</span>
                          <span>{course.instructor}</span>
                        </p>
                        <p className="text-[11px] text-on-surface-variant font-medium flex items-center gap-1">
                          <span className="material-symbols-outlined text-[13px]">meeting_room</span>
                          <span>{course.room}</span>
                        </p>
                      </div>
                    </div>
                  ))}

                </div>
              </div>
            </div>
            
            {/* ── Mini Takvim ── Haftalık ders programının sağında ── */}
            <div className="w-full xl:w-64 shrink-0 bg-white dark:bg-[#111827] rounded-3xl p-5 shadow-sm border border-slate-200/60 dark:border-slate-700/50 flex flex-col gap-4 sticky top-6">

              {/* Başlık */}
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-extrabold text-slate-800 dark:text-white flex items-center gap-2">
                  <span className="material-symbols-outlined text-secondary text-lg">calendar_month</span>
                  <span>May – Haz 2026</span>
                </h3>
                <span className="text-[10px] font-bold text-secondary bg-secondary/10 px-2 py-0.5 rounded-lg">{weekIndex}. Hafta</span>
              </div>

              {/* Gün etiketleri */}
              <div className="grid grid-cols-7 text-center">
                {['Pzt', 'Sal', 'Çar', 'Per', 'Cum', 'Cmt', 'Paz'].map((d, i) => (
                  <div key={d} className={`text-[9px] font-extrabold uppercase tracking-wider py-1 ${i >= 5 ? 'text-slate-300 dark:text-slate-600' : 'text-slate-400 dark:text-slate-500'}`}>{d}</div>
                ))}
              </div>

              {/* Hafta satırları */}
              <div className="flex flex-col gap-1">
                {miniCalendarWeeks.map((week, rowIdx) => {
                  const actualWeekNum = rowIdx + 1
                  if (actualWeekNum < 2 || actualWeekNum > 6) return null
                  const isActiveWeek = weekIndex === actualWeekNum
                  return (
                    <div key={rowIdx} className={`grid grid-cols-7 rounded-xl transition-all duration-200 ${isActiveWeek ? 'bg-secondary/5 ring-1 ring-secondary/20' : ''}`}>
                      {week.map((cell, colIdx) => {
                        const sel = isSelectedCell(cell)
                        return (
                          <button
                            key={colIdx}
                            onClick={() => handleMiniCalClick(cell)}
                            disabled={cell.isWeekend}
                            title={cell.isWeekend ? 'Hafta sonu' : `${cell.day} ${cell.month} 2026`}
                            className={`w-full aspect-square flex flex-col items-center justify-center rounded-lg text-[11px] font-bold transition-all duration-150 border-none ${cell.isWeekend
                                ? 'opacity-25 cursor-not-allowed text-slate-400 dark:text-slate-600 bg-transparent'
                                : sel
                                  ? 'bg-secondary text-white shadow-md scale-105 cursor-pointer'
                                  : 'text-slate-700 dark:text-slate-300 hover:bg-secondary/10 hover:text-secondary cursor-pointer'
                              }`}
                          >
                            {cell.day}
                          </button>
                        )
                      })}
                    </div>
                  )
                })}
              </div>

              {/* Hafta açıklamaları */}
              <div className="border-t border-slate-100 dark:border-slate-800 pt-3 flex flex-col gap-1">
                <p className="text-[9px] font-extrabold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-1">Hafta Özeti</p>
                {[
                  { w: 2, label: '11 – 17 Mayıs', exam: false },
                  { w: 3, label: '18 – 24 Mayıs', exam: false },
                  { w: 4, label: '25 – 31 Mayıs', exam: false },
                  { w: 5, label: '1 – 7 Haziran', exam: true, examType: 'Final' },
                  { w: 6, label: '8 – 14 Haziran', exam: false, labelSuffix: ' (Bugün)' }
                ].map(row => (
                  <div key={row.w}
                    onClick={() => setSelectedDay(getWeekdayDayNum(3, row.w))}
                    className={`flex items-center justify-between py-1 px-2 rounded-lg cursor-pointer transition-all ${weekIndex === row.w ? 'bg-secondary/10' : 'hover:bg-slate-50 dark:hover:bg-slate-800'}`}>
                    <span className={`text-[10px] font-bold ${weekIndex === row.w ? 'text-secondary' : 'text-slate-500 dark:text-slate-400'}`}>
                      {row.w}. Hafta — {row.label}{row.labelSuffix || ''}
                    </span>
                    {row.exam && <span className="text-[9px] text-red-400 font-extrabold">{row.examType}</span>}
                  </div>
                ))}
              </div>
            </div>{/* end Mini Calendar */}

          </div>{/* end ROW: grid + mini cal */}

          {/* Günlük Ders Akışı */}
          <div className="bg-white dark:bg-slate-800 border border-slate-200/60 dark:border-slate-700/50 rounded-3xl p-6 shadow-sm transition-all duration-300">
            <div className="flex justify-between items-center mb-4 border-b border-slate-100 dark:border-slate-800 pb-3">
              <h3 className="font-title-lg text-title-lg text-primary dark:text-white flex items-center gap-2">
                <span className="material-symbols-outlined text-secondary">schedule</span>
                <span>{getDayLabelString()} 2026 Günlük Ders Akışı</span>
              </h3>
              <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">
                {selectedWeekday === 1 && 'Pazartesi'}{selectedWeekday === 2 && 'Salı'}{selectedWeekday === 3 && 'Çarşamba'}
                {selectedWeekday === 4 && 'Perşembe'}{selectedWeekday === 5 && 'Cuma'}
                {(selectedWeekday === 0 || selectedWeekday === 6) && 'Hafta Sonu'}
              </span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {selectedDaySchedule.length === 0 ? (
                <div className="col-span-2 text-center py-6 text-slate-400 dark:text-slate-500 text-xs flex flex-col items-center justify-center gap-2">
                  <span className="material-symbols-outlined text-3xl">event_busy</span>
                  <span>Bu tarihe ait kayıtlı dersiniz bulunmamaktadır.</span>
                </div>
              ) : (
                selectedDaySchedule.map((course) => {
                  let borderCol = 'border-secondary bg-secondary/5 text-secondary'
                  if (course.color === 'success-emerald') borderCol = 'border-success-emerald bg-success-emerald/5 text-success-emerald'
                  if (course.color === 'warning-amber') borderCol = 'border-warning-amber bg-warning-amber/5 text-warning-amber'
                  if (course.color === 'error') borderCol = 'border-error bg-error/5 text-error'
                  if (course.color === 'primary') borderCol = 'border-primary bg-primary/5 text-primary'
                  return (
                    <div key={course.id} className={`p-4 border-l-4 rounded-r-xl border border-slate-100 dark:border-slate-800 flex flex-col gap-2 ${borderCol}`}>
                      <div className="flex justify-between items-center">
                        <span className="text-[10px] font-extrabold uppercase tracking-widest">{course.typeLabel}</span>
                        <strong className="text-xs font-bold">{course.time}</strong>
                      </div>
                      <h4 className="text-sm font-bold text-slate-800 dark:text-slate-200">{course.name}</h4>
                      <div className="flex justify-between items-center text-[11px] text-slate-500 dark:text-slate-400 mt-2">
                        <span className="flex items-center gap-1"><span className="material-symbols-outlined text-xs">person</span>{course.instructor}</span>
                        <span className="flex items-center gap-1"><span className="material-symbols-outlined text-xs">meeting_room</span>{course.room}</span>
                      </div>
                      {/* Kart Alt Eylemleri (Öğretmen Aksiyon Butonları) */}
                      <div className="flex gap-2 mt-2 pt-3 border-t border-slate-100 dark:border-slate-700/50">
                        {course.type === 'online' ? (
                          <>
                            <button
                              onClick={() => handleStartLive(course)}
                              className="flex-1 py-2 px-3 bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-700 hover:to-blue-700 text-white rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 border-none cursor-pointer shadow-sm hover:shadow-md transition-all active:scale-98"
                            >
                              <span className="material-symbols-outlined text-[14px] animate-pulse">sensors</span>
                              <span>Yayını Başlat</span>
                            </button>
                            <button
                              onClick={() => setSelectedLesson(course)}
                              className="py-2 px-2 bg-slate-50 hover:bg-slate-100 dark:bg-slate-900/60 dark:hover:bg-slate-900 text-slate-600 dark:text-slate-300 rounded-lg text-xs font-bold border border-slate-100 dark:border-slate-800 hover:border-slate-200 cursor-pointer transition-all flex items-center justify-center"
                              title="Ders Detayları"
                            >
                              <span className="material-symbols-outlined text-[14px]">info</span>
                            </button>
                          </>
                        ) : (
                          <>
                            <button
                              onClick={() => handleTakeAttendance(course)}
                              className="flex-1 py-2 px-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 border-none cursor-pointer transition-all active:scale-98"
                            >
                              <span className="material-symbols-outlined text-[14px]">fact_check</span>
                              <span>Yoklama Al</span>
                            </button>
                            <button
                              onClick={() => handleGradeEntry(course)}
                              className="flex-1 py-2 px-3 bg-slate-50 hover:bg-slate-100 dark:bg-slate-900/60 dark:hover:bg-slate-900 text-slate-700 dark:text-slate-300 rounded-lg text-xs font-bold border border-slate-100 dark:border-slate-800 cursor-pointer transition-all flex items-center justify-center gap-1.5"
                            >
                              <span className="material-symbols-outlined text-[14px]">edit_note</span>
                              <span>Not Girişi</span>
                            </button>
                          </>
                        )}
                      </div>
                    </div>
                  )
                })
              )}
            </div>
          </div>
        </div>
      )}
      {/* DERS DETAYI MODAL PENCERESİ */}
      {selectedLesson && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in" onClick={() => setSelectedLesson(null)}>
          <div
            className="bg-white dark:bg-slate-800 rounded-3xl shadow-xl max-w-lg w-full overflow-hidden flex flex-col border border-slate-100 dark:border-slate-700/50 animate-slide-up"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex justify-between items-start px-6 py-5 border-b border-slate-100 dark:border-slate-700/50 bg-slate-50/50 dark:bg-slate-900/20">
              <div>
                <span className="text-[10px] font-bold text-slate-400 tracking-wider uppercase">{selectedLesson.code} · {selectedLesson.group}</span>
                <h3 className="text-lg font-extrabold text-slate-800 dark:text-white mt-0.5">{selectedLesson.name}</h3>
              </div>
              <button
                className="w-8 h-8 rounded-full flex items-center justify-center text-slate-400 hover:bg-slate-200/60 dark:hover:bg-slate-900 hover:text-slate-600 dark:hover:text-slate-300 transition-colors border-none bg-transparent cursor-pointer"
                onClick={() => setSelectedLesson(null)}
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            {/* Gövde */}
            <div className="p-6 flex flex-col gap-5">
              
              {/* Ders Konusu / Müfredat Başlığı */}
              <div className="bg-slate-50 dark:bg-slate-900/30 p-4 rounded-2xl border border-slate-100 dark:border-slate-800">
                <span className="text-[10px] font-extrabold text-blue-500 uppercase tracking-widest">BU HAFTAKİ KONU</span>
                <p className="text-sm font-bold text-slate-700 dark:text-slate-300 mt-1">{selectedLesson.topic}</p>
              </div>

              {/* Bilgi Grid */}
              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-0.5">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Zaman Dilimi</span>
                  <div className="flex items-center gap-1.5 text-xs font-bold text-slate-700 dark:text-slate-200 mt-1">
                    <span className="material-symbols-outlined text-[15px] text-slate-400">schedule</span>
                    <span>{selectedLesson.day}, {selectedLesson.time}</span>
                  </div>
                </div>

                <div className="flex flex-col gap-0.5">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Ders Türü</span>
                  <div className="flex items-center gap-1.5 text-xs font-bold text-slate-700 dark:text-slate-200 mt-1">
                    <span className="material-symbols-outlined text-[15px] text-slate-400">
                      {selectedLesson.type === 'online' ? 'sensors' : 'meeting_room'}
                    </span>
                    <span className="capitalize">{selectedLesson.type === 'online' ? 'Online / Canlı' : 'Yüz Yüze (Okulda)'}</span>
                  </div>
                </div>

                <div className="flex flex-col gap-0.5">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Derslik / Konum</span>
                  <div className="flex items-center gap-1.5 text-xs font-bold text-slate-700 dark:text-slate-200 mt-1">
                    <span className="material-symbols-outlined text-[15px] text-slate-400">location_on</span>
                    <span>{selectedLesson.classroom}</span>
                  </div>
                </div>

                <div className="flex flex-col gap-0.5">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Mevcut Kontenjan</span>
                  <div className="flex items-center gap-1.5 text-xs font-bold text-slate-700 dark:text-slate-200 mt-1">
                    <span className="material-symbols-outlined text-[15px] text-slate-400">person</span>
                    <span>{selectedLesson.studentCount} Kayıtlı Öğrenci</span>
                  </div>
                </div>
              </div>

              {/* Materyal Listesi Mock */}
              <div className="flex flex-col gap-2 border-t border-slate-100 dark:border-slate-700/50 pt-4">
                <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">DERS MATERYALLERİ</span>
                <div className="flex flex-col gap-2">
                  <div 
                    onClick={() => downloadDocPDF('Ders Notları — Hafta 12.pdf', selectedLesson.name, selectedLesson.code)}
                    className="flex items-center justify-between p-2.5 bg-slate-50/50 dark:bg-slate-900/10 hover:bg-slate-100 dark:hover:bg-slate-800/60 rounded-xl border border-slate-100 dark:border-slate-800 transition-colors cursor-pointer active:scale-98"
                  >
                    <div className="flex items-center gap-2">
                      <span className="material-symbols-outlined text-red-500 text-lg">picture_as_pdf</span>
                      <span className="text-xs font-bold text-slate-600 dark:text-slate-300">Ders Notları — Hafta 12.pdf</span>
                    </div>
                    <span className="text-[10px] font-bold text-slate-400">1.8 MB</span>
                  </div>
                  <div 
                    onClick={() => handleOpenLink('https://github.com')}
                    className="flex items-center justify-between p-2.5 bg-slate-50/50 dark:bg-slate-900/10 hover:bg-slate-100 dark:hover:bg-slate-800/60 rounded-xl border border-slate-100 dark:border-slate-800 transition-colors cursor-pointer active:scale-98"
                  >
                    <div className="flex items-center gap-2">
                      <span className="material-symbols-outlined text-blue-500 text-lg">link</span>
                      <span className="text-xs font-bold text-slate-600 dark:text-slate-300">GitHub Kaynak Kod Deposu</span>
                    </div>
                    <span className="text-[10px] font-bold text-slate-400">Repo</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Alt Kısım Eylemler */}
            <div className="px-6 py-4 border-t border-slate-100 dark:border-slate-700/50 bg-slate-50/50 dark:bg-slate-900/20 flex gap-3">
              <button
                onClick={() => setSelectedLesson(null)}
                className="flex-1 py-2.5 px-4 bg-slate-100 hover:bg-slate-200 dark:bg-slate-700 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-200 rounded-xl text-xs font-bold border-none cursor-pointer transition-colors"
              >
                Kapat
              </button>
              {selectedLesson.type === 'online' ? (
                <button
                  onClick={() => {
                    setSelectedLesson(null)
                    handleStartLive(selectedLesson)
                  }}
                  className="flex-1 py-2.5 px-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold border-none cursor-pointer transition-colors flex items-center justify-center gap-2 shadow-sm"
                >
                  <span className="material-symbols-outlined text-[16px]">sensors</span>
                  <span>Dersi Başlat</span>
                </button>
              ) : (
                <button
                  onClick={() => {
                    setSelectedLesson(null)
                    handleTakeAttendance(selectedLesson)
                  }}
                  className="flex-1 py-2.5 px-4 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold border-none cursor-pointer transition-colors flex items-center justify-center gap-2 shadow-sm"
                >
                  <span className="material-symbols-outlined text-[16px]">fact_check</span>
                  <span>Yoklama Al</span>
                </button>
              )}
            </div>
          </div>
        </div>
      )}
      {/* YENİ DERS GÖREVLENDİRME TALEBİ MODALI */}
      {isRequestModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in" onClick={() => setIsRequestModalOpen(false)}>
          <div
            className="bg-white dark:bg-slate-800 rounded-3xl shadow-xl max-w-md w-full overflow-hidden flex flex-col border border-slate-100 dark:border-slate-700/50 animate-slide-up"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex justify-between items-center px-6 py-5 border-b border-slate-100 dark:border-slate-700/50 bg-slate-50/50 dark:bg-slate-900/20">
              <div>
                <h3 className="text-base font-extrabold text-slate-800 dark:text-white">Ders Görevlendirme Talebi</h3>
                <p className="text-[10px] text-slate-400 mt-0.5">Talep onaylandığında haftalık ders programınıza otomatik eklenir.</p>
              </div>
              <button
                className="w-8 h-8 rounded-full flex items-center justify-center text-slate-400 hover:bg-slate-200/60 dark:hover:bg-slate-900 hover:text-slate-600 dark:hover:text-slate-300 transition-colors border-none bg-transparent cursor-pointer"
                onClick={() => setIsRequestModalOpen(false)}
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleRequestCourse} className="p-6 flex flex-col gap-4">
              <div className="flex flex-col gap-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Talep Edilecek Ders</label>
                <select
                  value={reqCourseCode}
                  onChange={(e) => setReqCourseCode(e.target.value)}
                  className="w-full p-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/60 text-slate-800 dark:text-slate-250 text-xs font-bold focus:outline-none focus:ring-1 focus:ring-blue-500"
                >
                  {allCoursesCatalog.map(c => (
                    <option key={c.id} value={c.code}>{c.code} - {c.name}</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Haftalık Gün</label>
                  <select
                    value={reqDay}
                    onChange={(e) => setReqDay(e.target.value)}
                    className="w-full p-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/60 text-slate-800 dark:text-slate-250 text-xs font-bold focus:outline-none focus:ring-1 focus:ring-blue-500"
                  >
                    <option value="Pazartesi">Pazartesi</option>
                    <option value="Salı">Salı</option>
                    <option value="Çarşamba">Çarşamba</option>
                    <option value="Perşembe">Perşembe</option>
                    <option value="Cuma">Cuma</option>
                  </select>
                </div>

                <div className="flex flex-col gap-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Sınıf / Şube</label>
                  <select
                    value={reqGroup}
                    onChange={(e) => setReqGroup(e.target.value)}
                    className="w-full p-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/60 text-slate-800 dark:text-slate-250 text-xs font-bold focus:outline-none focus:ring-1 focus:ring-blue-500"
                  >
                    <option value="Sınıf A">Sınıf A</option>
                    <option value="Sınıf B">Sınıf B</option>
                    <option value="Tüm Sınıflar">Tüm Sınıflar</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Saat Dilimi</label>
                  <select
                    value={reqTimeSlot}
                    onChange={(e) => setReqTimeSlot(e.target.value)}
                    className="w-full p-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/60 text-slate-800 dark:text-slate-250 text-xs font-bold focus:outline-none focus:ring-1 focus:ring-blue-500"
                  >
                    <option value="09:00 - 10:30">09:00 - 10:30</option>
                    <option value="11:00 - 12:30">11:00 - 12:30</option>
                    <option value="13:00 - 14:30">13:00 - 14:30</option>
                    <option value="14:00 - 16:30">14:00 - 16:30</option>
                    <option value="15:00 - 16:30">15:00 - 16:30</option>
                  </select>
                </div>

                <div className="flex flex-col gap-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Derslik / Konum</label>
                  <select
                    value={reqRoom}
                    onChange={(e) => setReqRoom(e.target.value)}
                    className="w-full p-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/60 text-slate-800 dark:text-slate-250 text-xs font-bold focus:outline-none focus:ring-1 focus:ring-blue-500"
                  >
                    <option value="Online / Zoom">Online / Zoom</option>
                    <option value="LAB-B3">LAB-B3</option>
                    <option value="LAB-B2">LAB-B2</option>
                    <option value="Amfi-1">Amfi-1</option>
                    <option value="Amfi-2">Amfi-2</option>
                  </select>
                </div>
              </div>

              <div className="mt-4 pt-4 border-t border-slate-100 dark:border-slate-700/50 flex gap-3">
                <button
                  type="button"
                  onClick={() => setIsRequestModalOpen(false)}
                  className="flex-1 py-2.5 px-4 bg-slate-100 hover:bg-slate-200 dark:bg-slate-700 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-200 rounded-xl text-xs font-bold border-none cursor-pointer transition-colors"
                >
                  İptal
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 px-4 bg-[#00236f] hover:bg-blue-900 text-white rounded-xl text-xs font-bold border-none cursor-pointer transition-colors shadow-sm"
                >
                  Talebi Gönder
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </section>
  )
}
