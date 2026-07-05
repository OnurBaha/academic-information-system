// React ve React Router kütüphanelerinden gerekli hook'ların içe aktarılması
import { useState, useEffect, useMemo } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { useSelector, useDispatch } from 'react-redux'
import { fetchTeacherDashboardDataAsync } from '../../store/teacher/teacherSlice'

// Mock YouTube Video IDs for Past Lessons
const mockYoutubeIds = {
  1: "dQw4w9WgXcQ",
  2: "84WUGpO5HU4",
  3: "PLbW6i5NrkU",
  4: "6dvRik84CIk",
  5: "dQw4w9WgXcQ"
}

// Öğretmen Ana Sayfası (Dashboard) Bileşeni
export default function TeacherDashboard() {
  const navigate = useNavigate()
  const location = useLocation()
  const dispatch = useDispatch()
  const { currentUser } = useSelector((state) => state.auth || {})
  const { pastLessons = [], bulletins = [], courses = [], studentsGrades = [], users = [], homeworkReviews = [] } = useSelector((state) => state.teacher || {})

  // Compute teacher courses
  const teacherCourses = useMemo(() => courses.filter(c => c.instructor === currentUser?.name), [courses, currentUser])
  const teacherCourseCodes = useMemo(() => teacherCourses.map(c => c.code), [teacherCourses])

  // Compute dynamic students list
  const students = useMemo(() => {
    if (!studentsGrades.length || !users.length) return []
    const gradesForTeacher = studentsGrades.filter(g => teacherCourseCodes.includes(g.courseCode))
    const seen = new Set()
    const list = []
    gradesForTeacher.forEach(g => {
      const u = users.find(user => user.id === g.studentId)
      if (u && !seen.has(u.id)) {
        seen.add(u.id)
        list.push({
          id: u.studentNumber || u.id || '—',
          dbId: u.id,
          name: u.name || 'Bilinmeyen Öğrenci',
          avatar: u.name ? u.name.charAt(0) : '?',
          email: u.email || '—',
          group: g.courseCode + ' - ' + (g.group || 'Sınıf A').replace('Grup', 'Sınıf'),
          attendance: (100 - (g.absencePercentage || 0)) + '%',
          grade: g.letterGrade || 'Süreçte',
          status: u.status || 'active'
        })
      }
    })
    return list
  }, [studentsGrades, users, teacherCourseCodes])

  // Compute dynamic KPIs
  const kpis = useMemo(() => {
    const totalStudents = students.length
    const unreadHomework = homeworkReviews.filter(r => teacherCourseCodes.includes(r.courseCode) && r.status === 'Bekliyor').length
    
    // Average attendance
    const gradesForTeacher = studentsGrades.filter(g => teacherCourseCodes.includes(g.courseCode))
    const attendanceSum = gradesForTeacher.reduce((sum, g) => sum + (100 - (g.absencePercentage || 0)), 0)
    const attendanceAverage = gradesForTeacher.length > 0 ? Math.round(attendanceSum / gradesForTeacher.length) : 0

    // Completed live lessons
    const completedHours = pastLessons.length * 1.5 // assume 1.5 hours per lesson
    const completedLiveLessons = `${completedHours} Saat`

    return {
      totalStudents,
      unreadHomework,
      attendanceAverage,
      completedLiveLessons
    }
  }, [students, homeworkReviews, teacherCourseCodes, studentsGrades, pastLessons])

  useEffect(() => {
    dispatch(fetchTeacherDashboardDataAsync())
  }, [dispatch])
  
  // Bileşenin durum (state) yönetim tanımlamaları
  const [isStreaming, setIsStreaming] = useState(false) // Canlı yayın aktiflik durumu
  const [toast, setToast] = useState(null) // Toast bildirim mesajı durumu
  const [showStudentList, setShowStudentList] = useState(false) // Öğrenci listesi modalının görünürlüğü
  const [searchTerm, setSearchTerm] = useState('') // Öğrenci aramaları için girdi değeri
  const [selectedGroup, setSelectedGroup] = useState('All') // Seçilen grup filtresi (A / B)
  const [showPastLessons, setShowPastLessons] = useState(false) // Geçmiş canlı dersler modalının görünürlüğü
  const [lessonSearchTerm, setLessonSearchTerm] = useState('') // Ders aramaları için girdi değeri
  const [lessonSelectedGroup, setLessonSelectedGroup] = useState('All') // Seçilen geçmiş ders grubu filtresi
  const [playingLesson, setPlayingLesson] = useState(null) // İzlenen geçmiş ders kaydı
  const [showAllActivities, setShowAllActivities] = useState(false) // Tüm etkinlikler modalı


  const filteredPastLessons = pastLessons.filter(lesson => {
    const matchesSearch = lesson.name.toLowerCase().includes(lessonSearchTerm.toLowerCase())
    const lessonClass = (lesson.group || '').replace('Grup', 'Sınıf')
    const matchesGroup = lessonSelectedGroup === 'All' || lessonClass.includes(lessonSelectedGroup.replace('Grup', 'Sınıf'))
    return matchesSearch && matchesGroup
  })

  // Arama ve sınıf filtresine göre öğrencileri filtreleme işlemi
  const filteredStudents = students.filter(student => {
    const matchesSearch = student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student.id.includes(searchTerm)
    const matchesGroup = selectedGroup === 'All' || student.group.includes(selectedGroup.replace('Grup', 'Sınıf'))
    return matchesSearch && matchesGroup
  })

  // ESC tuşuna basıldığında açık olan modalları kapatma ve sayfa kaydırmasını (overflow) engelleme
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        setShowStudentList(false)
        setShowPastLessons(false)
        setPlayingLesson(null)
        setShowAllActivities(false)
      }
    }
    if (showStudentList || showPastLessons || playingLesson || showAllActivities) {
      window.addEventListener('keydown', handleKeyDown)
      document.body.style.overflow = 'hidden' // Arka planın kaymasını engelle
    }
    return () => {
      window.removeEventListener('keydown', handleKeyDown)
      document.body.style.overflow = 'unset' // Eski haline getir
    }
  }, [showStudentList, showPastLessons, playingLesson, showAllActivities])

  // Tüm etkinlikler verisi
  const allActivities = [
    { id: 1, icon: 'upload_file', iconClass: 'teacher-activity-icon-navy', text: <><strong>Can Demir</strong> ödevini teslim etti.</>, time: '10 Dakika Önce · Ödev #4' },
    { id: 2, icon: 'help_center', iconClass: 'teacher-activity-icon-blue', text: <><strong>Seda Kaya</strong> bir soru sordu.</>, time: '45 Dakika Önce · React Hooks' },
    { id: 3, icon: 'person_add', iconClass: 'teacher-activity-icon-green', text: <><strong>Bora Ak</strong> derse kayıt oldu.</>, time: '2 Saat Önce · Grup A' },
    { id: 4, icon: 'report_problem', iconClass: 'teacher-activity-icon-amber', text: <><strong>Sistem Uyarısı:</strong> Düşük katılım.</>, time: 'Bugün 09:30 · Sınıf C' },
    { id: 5, icon: 'assignment_turned_in', iconClass: 'teacher-activity-icon-green', text: <><strong>Elif Yılmaz</strong> ödevini teslim etti.</>, time: '3 Saat Önce · Ödev #3' },
    { id: 6, icon: 'videocam', iconClass: 'teacher-activity-icon-blue', text: <><strong>Canlı ders</strong> kaydı oluşturuldu.</>, time: 'Dün 14:30 · WEB 307' },
    { id: 7, icon: 'grade', iconClass: 'teacher-activity-icon-amber', text: <><strong>Not girişi</strong> tamamlandı.</>, time: 'Dün 16:00 · DBM 301 Vize' },
    { id: 8, icon: 'upload_file', iconClass: 'teacher-activity-icon-navy', text: <><strong>Ahmet Çelik</strong> ödevini teslim etti.</>, time: 'Dün 11:20 · Ödev #4' },
    { id: 9, icon: 'person_add', iconClass: 'teacher-activity-icon-green', text: <><strong>Zeynep Demir</strong> derse kayıt oldu.</>, time: 'Dün 09:15 · Grup B' },
    { id: 10, icon: 'event_busy', iconClass: 'teacher-activity-icon-navy', text: <><strong>Yoklama</strong> alındı.</>, time: '2 Gün Önce · DBM 301 Grup A' },
    { id: 11, icon: 'campaign', iconClass: 'teacher-activity-icon-amber', text: <><strong>Duyuru</strong> yayınlandı.</>, time: '2 Gün Önce · Vize tarihi hatırlatması' },
    { id: 12, icon: 'upload_file', iconClass: 'teacher-activity-icon-navy', text: <><strong>Merve Arslan</strong> ödevini teslim etti.</>, time: '3 Gün Önce · Ödev #3' },
    { id: 13, icon: 'help_center', iconClass: 'teacher-activity-icon-blue', text: <><strong>Ali Kara</strong> bir soru sordu.</>, time: '3 Gün Önce · JavaScript Promises' },
    { id: 14, icon: 'videocam', iconClass: 'teacher-activity-icon-blue', text: <><strong>Canlı ders</strong> tamamlandı.</>, time: '4 Gün Önce · OPS 302' },
    { id: 15, icon: 'report_problem', iconClass: 'teacher-activity-icon-amber', text: <><strong>Sistem Uyarısı:</strong> 3 öğrenci ödevi geciktirdi.</>, time: '5 Gün Önce · Ödev #2' },
  ]

  // Canlı yayın sonlandırıldığında gelen yönlendirme durumunu (duration vb.) okuyup toast ile gösteren efekt
  useEffect(() => {
    if (location.state?.streamEnded) {
      showToast(`Canlı yayın başarıyla sonlandırıldı! Süre: ${location.state.duration}`, "info")
      // Tarayıcı geçmişindeki state bilgisini temizle
      window.history.replaceState({}, document.title)
    }
  }, [location])

  // Canlı yayın sayfasına yönlendirme yapan tetikleyici
  const toggleStream = () => {
    navigate('/teacher/live')
  }

  // Toast bildirim penceresini açan yardımcı fonksiyon
  function showToast(message, type) {
    setToast({ message, type })
  }

  // Gösterilen toast bildirimini 4 saniye sonra otomatik olarak kapatan efekt
  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => {
        setToast(null)
      }, 4000)
      return () => clearTimeout(timer)
    }
  }, [toast])

  const dashboardLessons = [
    {
      id: 'l1',
      code: 'WEB 307',
      name: 'Modern Web Geliştirme',
      day: 'Pazartesi',
      time: '14:00 - 16:30',
      duration: '150 Dakika',
      type: 'online',
      classroom: 'Online / Zoom',
      group: 'Grup A',
      color: 'indigo'
    },
    {
      id: 'l2',
      code: 'WEB 307',
      name: 'Modern Web Geliştirme',
      day: 'Salı',
      time: '10:00 - 12:30',
      duration: '150 Dakika',
      type: 'online',
      classroom: 'Online / Zoom',
      group: 'Grup B',
      color: 'indigo'
    },
    {
      id: 'l3',
      code: 'DBM 301',
      name: 'Veri Tabanı Yönetim Sistemleri',
      day: 'Çarşamba',
      time: '09:00 - 11:30',
      duration: '150 Dakika',
      type: 'school',
      classroom: 'LAB-B2',
      group: 'Grup A',
      color: 'emerald'
    },
    {
      id: 'l4',
      code: 'DBM 301',
      name: 'Veri Tabanı Yönetim Sistemleri',
      day: 'Perşembe',
      time: '13:00 - 15:30',
      duration: '150 Dakika',
      type: 'school',
      classroom: 'LAB-B2',
      group: 'Grup B',
      color: 'emerald'
    },
    {
      id: 'l5',
      code: 'OPS 302',
      name: 'İşletim Sistemleri',
      day: 'Cuma',
      time: '14:00 - 16:30',
      duration: '150 Dakika',
      type: 'school',
      classroom: 'LAB-B3',
      group: 'Tüm Gruplar',
      color: 'amber'
    }
  ]

  const getCardColorClass = (color) => {
    if (color === 'indigo') return 'course-card-secondary'
    if (color === 'emerald') return 'course-card-success-emerald'
    if (color === 'amber') return 'course-card-warning-amber'
    if (color === 'rose') return 'course-card-error'
    return 'course-card-primary'
  }

  const getTextColorClass = (color) => {
    if (color === 'indigo') return 'text-secondary'
    if (color === 'emerald') return 'text-success-emerald'
    if (color === 'amber') return 'text-warning-amber'
    if (color === 'rose') return 'text-error'
    return 'text-primary'
  }



  const days = ['Pazartesi', 'Salı', 'Çarşamba', 'Perşembe', 'Cuma']

  return (
    <section className="teacher-page-canvas">
      {(() => {
        const urgent = bulletins.filter(b => b.priority === 'ACİL');
        const latest = urgent.length > 0 ? urgent[urgent.length - 1] : null;
        if (!latest) return null;
        return (
          <div className="p-4 mb-6 bg-red-50 dark:bg-red-950/20 border-l-4 border-red-600 rounded-xl flex items-start gap-3 shadow-sm animate-pulse">
            <span className="material-symbols-outlined text-red-600 shrink-0 mt-0.5">campaign</span>
            <div className="flex-1">
              <h4 className="text-xs font-extrabold text-red-900 dark:text-red-400 uppercase tracking-wider">ACİL DUYURU: {latest.title}</h4>
              <p className="text-xs font-medium text-slate-700 dark:text-slate-350 mt-1 leading-relaxed">{latest.content}</p>
              <span className="text-[9px] text-slate-400 dark:text-slate-500 font-bold mt-2 block">{latest.date} · Dekanlık Makamı</span>
            </div>
          </div>
        );
      })()}

      <div className={isStreaming ? "teacher-banner-card bg-red-950 transition-all duration-500 border border-red-500/20" : "teacher-banner-card transition-all duration-500"}>
        <div className="teacher-banner-content">
          {isStreaming ? (
            <span className="teacher-banner-tag bg-red-600 border-red-500 animate-pulse text-white flex items-center gap-1.5 self-start px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider">
              <span className="w-1.5 h-1.5 rounded-full bg-white animate-ping"></span>
              CANLI YAYINDA
            </span>
          ) : (
            <span className="teacher-banner-tag">Hoş Geldiniz</span>
          )}
          <h2 className="teacher-banner-title">
            {isStreaming ? "Advanced React Context API" : `Hoş geldiniz, ${currentUser?.name || 'Dr. Nazlı BAŞAK'}`}
          </h2>
          <p className="teacher-banner-desc">
            {isStreaming
              ? "Şu anda canlı yayındasınız. Öğrenciler yayına katılabilir ve dersi izleyebilir."
              : "Bugün planlanmış 2 canlı dersiniz var. Öğrencileriniz dijital sınıflarda sizi bekliyor."}
          </p>
          <div>
            <button
              className={isStreaming ? "px-6 py-2.5 bg-red-600 text-white rounded-full text-sm font-bold flex items-center gap-2 hover:bg-red-700 transition-all border-none cursor-pointer shadow-md" : "teacher-btn-start"}
              onClick={toggleStream}
            >
              <span className="material-symbols-outlined">{isStreaming ? 'stop_circle' : 'play_circle'}</span>
              <span>{isStreaming ? 'Yayını Durdur' : 'Yayını Başlat'}</span>
            </button>
          </div>
        </div>
        <div className="teacher-banner-deco">
          <span className="material-symbols-outlined">{isStreaming ? 'sensors' : 'school'}</span>
        </div>
      </div>

      <div className="teacher-kpis-grid">
        <div
          className="teacher-kpi-card cursor-pointer hover:shadow-md hover:border-blue-300 hover:-translate-y-0.5 active:scale-98 transition-all duration-200"
          onClick={() => setShowStudentList(true)}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              setShowStudentList(true);
            }
          }}
          title="Öğrenci listesini görüntülemek için tıklayın"
        >
          <div className="teacher-kpi-header">
            <div className="teacher-kpi-icon-blue">
              <span className="material-symbols-outlined">groups</span>
            </div>
            <span className="teacher-badge-green">+3 yeni</span>
          </div>
          <div className="teacher-kpi-body flex justify-between items-end">
            <div>
              <p className="teacher-kpi-label">Toplam Öğrenci Sayısı</p>
              <h3 className="teacher-kpi-value">{kpis?.totalStudents || 0}</h3>
            </div>
            <span className="material-symbols-outlined text-blue-500/60 pb-1 text-lg">chevron_right</span>
          </div>
        </div>

        <div
          className="teacher-kpi-card cursor-pointer hover:shadow-md hover:border-red-300 hover:-translate-y-0.5 active:scale-98 transition-all duration-200"
          onClick={() => navigate('/teacher/homework', { state: { filter: 'Bekliyor' } })}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              navigate('/teacher/homework', { state: { filter: 'Bekliyor' } });
            }
          }}
          title="Okunmamış ödevleri incelemek için tıklayın"
        >
          <div className="teacher-kpi-header">
            <div className="teacher-kpi-icon-red">
              <span className="material-symbols-outlined">assignment_late</span>
            </div>
            <span className="teacher-badge-red">Önemli</span>
          </div>
          <div className="teacher-kpi-body flex justify-between items-end">
            <div>
              <p className="teacher-kpi-label">Okunmamış Ödev</p>
              <h3 className="teacher-kpi-value-red">{kpis?.unreadHomework || 0}</h3>
            </div>
            <span className="material-symbols-outlined text-red-500/60 pb-1 text-lg">chevron_right</span>
          </div>
        </div>


        <div
          className="teacher-kpi-card cursor-pointer hover:shadow-md hover:border-blue-300 hover:-translate-y-0.5 active:scale-98 transition-all duration-200"
          onClick={() => navigate('/teacher/attendance')}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              navigate('/teacher/attendance');
            }
          }}
          title="Yoklama panelini görüntülemek için tıklayın"
        >
          <div className="teacher-kpi-header">
            <div className="teacher-kpi-icon-blue">
              <span className="material-symbols-outlined">event_busy</span>
            </div>
          </div>
          <div className="teacher-kpi-body flex justify-between items-end">
            <div>
              <p className="teacher-kpi-label">Devamsızlık Ortalaması</p>
              <h3 className="teacher-kpi-value">%{kpis?.attendanceAverage || 0}</h3>
            </div>
            <span className="material-symbols-outlined text-blue-500/60 pb-1 text-lg">chevron_right</span>
          </div>
        </div>

        <div
          className="teacher-kpi-card cursor-pointer hover:shadow-md hover:border-blue-300 hover:-translate-y-0.5 active:scale-98 transition-all duration-200"
          onClick={() => setShowPastLessons(true)}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              setShowPastLessons(true);
            }
          }}
          title="Geçmiş canlı dersleri görüntülemek için tıklayın"
        >
          <div className="teacher-kpi-header">
            <div className="teacher-kpi-icon-blue">
              <span className="material-symbols-outlined">video_library</span>
            </div>
            <span className="teacher-badge-green">↑ 12%</span>
          </div>
          <div className="teacher-kpi-body flex justify-between items-end">
            <div>
              <p className="teacher-kpi-label">Tamamlanan Canlı Ders</p>
              <h3 className="teacher-kpi-value">{kpis?.completedLiveLessons || '0 Saat'}</h3>
            </div>
            <span className="material-symbols-outlined text-blue-500/60 pb-1 text-lg">chevron_right</span>
          </div>
        </div>
      </div>

      <div className="teacher-dashboard-bento">
        <div className="teacher-left-col">
          <div className="teacher-schedule-card">
            <div className="teacher-schedule-header">
              <div>
                <h3 className="teacher-schedule-title">Haftalık Ders Programı</h3>
                <p className="teacher-schedule-subtitle">Yaklaşan canlı dersleriniz ve akademik takviminiz</p>
              </div>
              <div className="teacher-schedule-arrows">
                <button className="teacher-btn-arrow" onClick={() => showToast("Önceki haftanın ders programı yükleniyor...", "info")}>
                  <span className="material-symbols-outlined">chevron_left</span>
                </button>
                <button className="teacher-btn-arrow" onClick={() => showToast("Sonraki haftanın ders programı yükleniyor...", "info")}>
                  <span className="material-symbols-outlined">chevron_right</span>
                </button>
              </div>
            </div>

            <div className="teacher-schedule-list">
              {dashboardLessons.map((course) => {
                const turkishDays = ['Pazar', 'Pazartesi', 'Salı', 'Çarşamba', 'Perşembe', 'Cuma', 'Cumartesi'];
                const todayIndex = new Date().getDay();
                const isToday = course.day === turkishDays[todayIndex];

                const dayShort = course.day.substring(0, 3).toUpperCase();
                const startHour = course.time.split(' - ')[0];

                return (
                  <div key={course.id} className="teacher-schedule-row">
                    <div className="teacher-schedule-left">
                      <div className={isToday ? "teacher-time-chip-active" : "teacher-time-chip-inactive dark:bg-slate-800 dark:text-slate-300"}>
                        <span className="teacher-time-day">{dayShort}</span>
                        <span className="teacher-time-hour">{startHour}</span>
                      </div>
                      <div>
                        <h4 className="teacher-course-name dark:text-white">
                          {course.name} <span className="text-xs font-normal text-slate-400">({course.code})</span>
                        </h4>
                        <div className="teacher-course-duration">
                          <span className="material-symbols-outlined text-xs">schedule</span>
                          <span>{course.day}, {course.time} ({course.duration})</span>
                          <span className="mx-1.5">·</span>
                          <span className="material-symbols-outlined text-xs">meeting_room</span>
                          <span>{course.classroom}</span>
                          <span className="mx-1.5">·</span>
                          <span className="font-bold bg-slate-100 dark:bg-slate-800 text-slate-650 dark:text-slate-400 px-1.5 py-0.2 rounded text-[10px]">{course.group}</span>
                        </div>
                      </div>
                    </div>

                    <div className="teacher-schedule-actions">
                      {course.type === 'online' ? (
                        <button
                          onClick={() => navigate('/teacher/live', { state: { courseName: course.name, courseCode: course.code, group: course.group } })}
                          className="teacher-btn-stream"
                        >
                          <span className="material-symbols-outlined text-sm">videocam</span>
                          <span>Yayını Başlat</span>
                        </button>
                      ) : (
                        <button
                          onClick={() => navigate('/teacher/attendance', { state: { courseCode: course.code, group: course.group } })}
                          className="teacher-btn-prep"
                        >
                          <span className="material-symbols-outlined text-sm">fact_check</span>
                          <span>Yoklama Al</span>
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        <div className="teacher-right-col">
          <div className="teacher-activities-card">
            <h3 className="teacher-activities-title">Son Etkinlikler</h3>
            <div className="teacher-activities-list">
              <div className="teacher-activity-item">
                <div className="teacher-timeline-line" />
                <div className="teacher-activity-icon-navy">
                  <span className="material-symbols-outlined">upload_file</span>
                </div>
                <div>
                  <p className="teacher-activity-text"><strong>Can Demir</strong> ödevini teslim etti.</p>
                  <p className="teacher-activity-time">10 Dakika Önce · Ödev #4</p>
                </div>
              </div>

              <div className="teacher-activity-item">
                <div className="teacher-timeline-line" />
                <div className="teacher-activity-icon-blue">
                  <span className="material-symbols-outlined">help_center</span>
                </div>
                <div>
                  <p className="teacher-activity-text"><strong>Seda Kaya</strong> bir soru sordu.</p>
                  <p className="teacher-activity-time">45 Dakika Önce · React Hooks</p>
                </div>
              </div>

              <div className="teacher-activity-item">
                <div className="teacher-timeline-line" />
                <div className="teacher-activity-icon-green">
                  <span className="material-symbols-outlined">person_add</span>
                </div>
                <div>
                  <p className="teacher-activity-text"><strong>Bora Ak</strong> derse kayıt oldu.</p>
                  <p className="teacher-activity-time">2 Saat Önce · Grup A</p>
                </div>
              </div>

              <div className="teacher-activity-item">
                <div className="teacher-activity-icon-amber">
                  <span className="material-symbols-outlined">report_problem</span>
                </div>
                <div>
                  <p className="teacher-activity-text"><strong>Sistem Uyarısı:</strong> Düşük katılım.</p>
                  <p className="teacher-activity-time">Bugün 09:30 · Sınıf C</p>
                </div>
              </div>
            </div>
            <button className="teacher-btn-activities" onClick={() => setShowAllActivities(true)}>Tümünü Gör</button>
          </div>


        </div>
      </div>

      {toast && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-2.5 px-5 py-3.5 rounded-xl shadow-xl bg-slate-900 text-slate-100 border-l-4 border-emerald-500 teacher-toast-notification font-medium text-sm">
          <span className="material-symbols-outlined text-emerald-500">
            {toast.type === 'success' ? 'check_circle' : 'info'}
          </span>
          <span>{toast.message}</span>
        </div>
      )}

      {showStudentList && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in" onClick={() => setShowStudentList(false)}>
          <div
            className="bg-white rounded-2xl shadow-xl max-w-4xl w-full max-h-[85vh] overflow-hidden flex flex-col border border-slate-100 animate-slide-up"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/50">
              <div>
                <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                  <span className="material-symbols-outlined text-blue-600">groups</span>
                  Kayıtlı Öğrenci Listesi
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">Derslerinize kayıtlı aktif ve pasif öğrencilerin listesi</p>
              </div>
              <button
                className="w-8 h-8 rounded-full flex items-center justify-center text-slate-400 hover:bg-slate-200/60 hover:text-slate-600 transition-colors border-none bg-transparent cursor-pointer"
                onClick={() => setShowStudentList(false)}
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            {/* Modal Filters */}
            <div className="p-6 border-b border-slate-100 flex flex-col sm:flex-row justify-between gap-4 items-center bg-white">
              <div className="relative w-full sm:w-72">
                <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm">search</span>
                <input
                  type="text"
                  placeholder="Öğrenci adı veya numarası ile ara..."
                  className="w-full pl-9 pr-4 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all placeholder:text-slate-400"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>

              <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
                <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Sınıf:</span>
                <select
                  className="px-3 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all bg-white text-slate-700 cursor-pointer font-medium"
                  value={selectedGroup}
                  onChange={(e) => setSelectedGroup(e.target.value)}
                >
                  <option value="All">Tüm Sınıflar</option>
                  <option value="Sınıf A">Sınıf A</option>
                  <option value="Sınıf B">Sınıf B</option>
                </select>
              </div>
            </div>

            {/* Modal Content */}
            <div className="flex-1 overflow-y-auto p-6 bg-white min-h-[300px]">
              {filteredStudents.length > 0 ? (
                <div className="overflow-x-auto border border-slate-100 rounded-xl">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-slate-50 text-slate-400 font-semibold uppercase text-xs tracking-wider border-b border-slate-100">
                        <th className="py-3 px-4 font-bold text-slate-500">Öğrenci</th>
                        <th className="py-3 px-4 font-bold text-slate-500">Öğrenci No</th>
                        <th className="py-3 px-4 font-bold text-slate-500">E-Posta</th>
                        <th className="py-3 px-4 font-bold text-slate-500">Sınıf / Ders</th>
                        <th className="py-3 px-4 font-bold text-slate-500">Devamsızlık</th>
                        <th className="py-3 px-4 font-bold text-slate-500">Not Ort.</th>
                        <th className="py-3 px-4 font-bold text-slate-500 text-center">Durum</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 text-sm">
                      {filteredStudents.map((student) => (
                        <tr key={student.id} className="hover:bg-slate-50/50 transition-colors">
                          <td className="py-3.5 px-4">
                            <div className="flex items-center gap-3">
                              <div className="w-9 h-9 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center font-bold text-sm shadow-sm border border-blue-100">
                                {student.avatar}
                              </div>
                              <span className="font-semibold text-slate-700">{student.name}</span>
                            </div>
                          </td>
                          <td className="py-3.5 px-4 text-slate-500 font-medium">{student.id}</td>
                          <td className="py-3.5 px-4 text-slate-500">{student.email}</td>
                          <td className="py-3.5 px-4">
                            <span className="px-2.5 py-1 bg-slate-100 text-slate-600 rounded-lg text-xs font-semibold">
                              {student.group}
                            </span>
                          </td>
                          <td className="py-3.5 px-4 text-slate-500 font-medium">{student.attendance}</td>
                          <td className="py-3.5 px-4">
                            <span className={`px-2 py-0.5 rounded text-xs font-bold ${student.grade === 'AA' || student.grade === 'BA'
                                ? 'bg-emerald-50 text-emerald-700'
                                : student.grade === 'FF'
                                  ? 'bg-rose-50 text-rose-700'
                                  : 'bg-blue-50 text-blue-700'
                              }`}>
                              {student.grade}
                            </span>
                          </td>
                          <td className="py-3.5 px-4 text-center">
                            <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-bold leading-5 ${student.status === 'Aktif'
                                ? 'bg-emerald-50 text-emerald-600'
                                : 'bg-slate-100 text-slate-400'
                              }`}>
                              {student.status}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-12 text-slate-400">
                  <span className="material-symbols-outlined text-4xl mb-2 text-slate-300">search_off</span>
                  <p className="text-sm font-medium">Arama kriterlerine uygun öğrenci bulunamadı.</p>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="px-6 py-4 border-t border-slate-100 bg-slate-50/50 flex justify-between items-center text-xs text-slate-400 font-medium">
              <span>Toplam 128 öğrenciden {filteredStudents.length} tanesi listeleniyor</span>
              <button
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold cursor-pointer transition-all shadow-sm border-none"
                onClick={() => setShowStudentList(false)}
              >
                Kapat
              </button>
            </div>
          </div>
        </div>
      )}

      {showPastLessons && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in" onClick={() => setShowPastLessons(false)}>
          <div
            className="bg-white rounded-2xl shadow-xl max-w-4xl w-full max-h-[85vh] overflow-hidden flex flex-col border border-slate-100 animate-slide-up"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/50">
              <div>
                <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                  <span className="material-symbols-outlined text-blue-600">video_library</span>
                  Geçmiş Canlı Dersler
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">Tamamlanan ve kaydedilen canlı derslerinizin listesi</p>
              </div>
              <button
                className="w-8 h-8 rounded-full flex items-center justify-center text-slate-400 hover:bg-slate-200/60 hover:text-slate-600 transition-colors border-none bg-transparent cursor-pointer"
                onClick={() => setShowPastLessons(false)}
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            {/* Modal Filters */}
            <div className="p-6 border-b border-slate-100 flex flex-col sm:flex-row justify-between gap-4 items-center bg-white">
              <div className="relative w-full sm:w-72">
                <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm">search</span>
                <input
                  type="text"
                  placeholder="Ders adı ile ara..."
                  className="w-full pl-9 pr-4 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all placeholder:text-slate-400"
                  value={lessonSearchTerm}
                  onChange={(e) => setLessonSearchTerm(e.target.value)}
                />
              </div>

              <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
                <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Sınıf:</span>
                <select
                  className="px-3 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all bg-white text-slate-700 cursor-pointer font-medium"
                  value={lessonSelectedGroup}
                  onChange={(e) => setLessonSelectedGroup(e.target.value)}
                >
                  <option value="All">Tüm Sınıflar</option>
                  <option value="Sınıf A">Sınıf A</option>
                  <option value="Sınıf B">Sınıf B</option>
                  <option value="Tüm Sınıflar">Tüm Sınıflar</option>
                </select>
              </div>
            </div>

            {/* Modal Content */}
            <div className="flex-1 overflow-y-auto p-6 bg-white min-h-[300px]">
              {filteredPastLessons.length > 0 ? (
                <div className="overflow-x-auto border border-slate-100 rounded-xl">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-slate-50 text-slate-400 font-semibold uppercase text-xs tracking-wider border-b border-slate-100">
                        <th className="py-3 px-4 font-bold text-slate-500">Ders Adı</th>
                        <th className="py-3 px-4 font-bold text-slate-500">Sınıf</th>
                        <th className="py-3 px-4 font-bold text-slate-500">Tarih / Saat</th>
                        <th className="py-3 px-4 font-bold text-slate-500">Süre</th>
                        <th className="py-3 px-4 font-bold text-slate-500">İzleyici</th>
                        <th className="py-3 px-4 font-bold text-slate-500 text-center">Aksiyon</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 text-sm">
                      {filteredPastLessons.map((lesson) => (
                        <tr key={lesson.id} className="hover:bg-slate-50/50 transition-colors">
                          <td className="py-3.5 px-4 font-semibold text-slate-700">
                            <div className="flex items-center gap-2.5">
                              <span className="material-symbols-outlined text-blue-500 text-lg">play_circle</span>
                              <span>{lesson.name}</span>
                            </div>
                          </td>
                          <td className="py-3.5 px-4">
                            <span className="px-2.5 py-1 bg-slate-100 text-slate-600 rounded-lg text-xs font-semibold">
                              {lesson.group.replace('Grup', 'Sınıf')}
                            </span>
                          </td>
                          <td className="py-3.5 px-4 text-slate-500">{lesson.date} - {lesson.time}</td>
                          <td className="py-3.5 px-4 text-slate-500 font-medium">{lesson.duration}</td>
                          <td className="py-3.5 px-4 text-slate-500 font-medium">{lesson.viewers} Öğrenci</td>
                          <td className="py-3.5 px-4 text-center">
                            <button
                              className="px-3.5 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-600 rounded-lg text-xs font-bold transition-all border-none cursor-pointer flex items-center gap-1 mx-auto"
                              onClick={() => setPlayingLesson(lesson)}
                            >
                              <span className="material-symbols-outlined text-xs">play_arrow</span>
                              Kaydı İzle
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-12 text-slate-400">
                  <span className="material-symbols-outlined text-4xl mb-2 text-slate-300">search_off</span>
                  <p className="text-sm font-medium">Arama kriterlerine uygun ders kaydı bulunamadı.</p>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="px-6 py-4 border-t border-slate-100 bg-slate-50/50 flex justify-between items-center text-xs text-slate-400 font-medium">
              <span>Toplam {pastLessons.length} dersten {filteredPastLessons.length} tanesi listeleniyor</span>
              <button
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold cursor-pointer transition-all shadow-sm border-none"
                onClick={() => setShowPastLessons(false)}
              >
                Kapat
              </button>
            </div>
          </div>
        </div>
      )}

      {playingLesson && (
        <div 
          className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-sm animate-fade-in" 
          onClick={() => setPlayingLesson(null)}
        >
          <div
            className="bg-white dark:bg-slate-800 rounded-2xl shadow-xl max-w-3xl w-full overflow-hidden flex flex-col border border-slate-100 dark:border-slate-700/60 animate-slide-up"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-slate-700/60 bg-slate-50/50 dark:bg-slate-900/30">
              <div>
                <span className="bg-red-50 dark:bg-red-950/40 text-red-600 dark:text-red-400 font-extrabold text-[9px] px-2 py-0.5 rounded uppercase tracking-wider">
                  Kayıt İzleniyor
                </span>
                <h3 className="text-base font-bold text-slate-800 dark:text-white mt-1.5">
                  {playingLesson.name}
                </h3>
                <p className="text-xs text-slate-400 dark:text-slate-500 mt-0.5 font-medium">
                  Grup: {playingLesson.group} · Tarih: {playingLesson.date} {playingLesson.time} · Süre: {playingLesson.duration}
                </p>
              </div>
              <button
                className="w-8 h-8 rounded-full flex items-center justify-center text-slate-400 hover:bg-slate-200/60 hover:text-slate-600 transition-colors border-none bg-transparent cursor-pointer"
                onClick={() => setPlayingLesson(null)}
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            {/* Video Player */}
            <div className="relative w-full aspect-video bg-slate-950 border-y border-slate-100 dark:border-slate-700/60">
              <iframe
                className="w-full h-full"
                src={`https://www.youtube.com/embed/${mockYoutubeIds[playingLesson.id] || 'dQw4w9WgXcQ'}?autoplay=1&mute=0&rel=0`}
                title={playingLesson.name}
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              ></iframe>
            </div>

            {/* Modal Footer */}
            <div className="px-6 py-4 border-t border-slate-100 dark:border-slate-700/60 bg-slate-50/50 dark:bg-slate-900/30 flex justify-between items-center">
              <button
                className="flex items-center gap-1 px-4 py-2 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-900 text-slate-600 dark:text-slate-350 font-bold text-xs rounded-xl transition-all active:scale-95 cursor-pointer bg-white dark:bg-slate-800"
                onClick={() => {
                  navigator.clipboard.writeText(`https://www.youtube.com/watch?v=${mockYoutubeIds[playingLesson.id] || 'dQw4w9WgXcQ'}`);
                  showToast('Ders kayıt bağlantısı kopyalandı!', 'success');
                }}
              >
                <span className="material-symbols-outlined text-sm">share</span>
                Bağlantıyı Kopyala
              </button>
              <button
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold cursor-pointer transition-all shadow-sm border-none"
                onClick={() => setPlayingLesson(null)}
              >
                Kapat
              </button>
            </div>
          </div>
        </div>
      )}

      {showAllActivities && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in" onClick={() => setShowAllActivities(false)}>
          <div
            className="bg-white rounded-2xl shadow-xl max-w-2xl w-full max-h-[85vh] overflow-hidden flex flex-col border border-slate-100 animate-slide-up"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/50">
              <div>
                <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                  <span className="material-symbols-outlined text-blue-600">notifications</span>
                  Tüm Etkinlikler
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">Son dönemdeki tüm akademik etkinlikler ve bildirimler</p>
              </div>
              <button
                className="w-8 h-8 rounded-full flex items-center justify-center text-slate-400 hover:bg-slate-200/60 hover:text-slate-600 transition-colors border-none bg-transparent cursor-pointer"
                onClick={() => setShowAllActivities(false)}
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            {/* Modal Content */}
            <div className="flex-1 overflow-y-auto p-6 bg-white">
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                {allActivities.map((activity, index) => {
                  const iconColors = {
                    'teacher-activity-icon-navy': { bg: '#f8fafc', color: '#334155', border: '1px solid rgba(203,213,225,0.55)' },
                    'teacher-activity-icon-blue': { bg: '#eff6ff', color: '#2563eb', border: '1px solid rgba(191,219,254,0.5)' },
                    'teacher-activity-icon-green': { bg: '#ecfdf5', color: '#059669', border: '1px solid rgba(167,243,208,0.5)' },
                    'teacher-activity-icon-amber': { bg: '#fffbeb', color: '#d97706', border: '1px solid rgba(253,230,138,0.5)' },
                  }
                  const colors = iconColors[activity.iconClass] || iconColors['teacher-activity-icon-navy']
                  return (
                    <div key={activity.id} style={{ display: 'flex', alignItems: 'flex-start', gap: '14px', position: 'relative', paddingBottom: index < allActivities.length - 1 ? '20px' : '0' }}>
                      {/* Timeline line */}
                      {index < allActivities.length - 1 && (
                        <div style={{ position: 'absolute', left: '17px', top: '40px', bottom: '0', width: '2px', background: 'linear-gradient(to bottom, #e2e8f0, #f1f5f9)' }} />
                      )}
                      {/* Icon */}
                      <div style={{ flexShrink: 0, width: '36px', height: '36px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1, position: 'relative', background: colors.bg, color: colors.color, border: colors.border }}>
                        <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>{activity.icon}</span>
                      </div>
                      {/* Content */}
                      <div style={{ flex: 1, minWidth: 0, paddingTop: '2px' }}>
                        <p style={{ margin: 0, fontSize: '13px', color: '#334155', lineHeight: '1.5' }}>{activity.text}</p>
                        <p style={{ margin: '2px 0 0', fontSize: '11px', color: '#94a3b8', fontWeight: 500 }}>{activity.time}</p>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>

            {/* Modal Footer */}
            <div className="px-6 py-4 border-t border-slate-100 bg-slate-50/50 flex justify-between items-center text-xs text-slate-400 font-medium">
              <span>Toplam {allActivities.length} etkinlik listeleniyor</span>
              <button
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold cursor-pointer transition-all shadow-sm border-none"
                onClick={() => setShowAllActivities(false)}
              >
                Kapat
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  )
}

