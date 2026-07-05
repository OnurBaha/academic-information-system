import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { fetchStudentGradesAsync } from '../../store/student/studentSlice'
import { simulateGano, calculateGano, getDayNameTurkish, getDayKeyEnglish, getSystemToday } from '../../utils/studentCalc'
import { toast } from 'react-hot-toast'

export default function StudentDashboard() {
  const dispatch = useDispatch()
  const { currentUser } = useSelector((state) => state.auth || {})
  const { grades, studentGrades, status } = useSelector((state) => state.student || {})

  const [weeklySchedule, setWeeklySchedule] = useState(null)
  const [academicEvents, setAcademicEvents] = useState([])
  const [bulletins, setBulletins] = useState([])
  const [overviewLoading, setOverviewLoading] = useState(true)

  // Advisor state
  const [advisorUser, setAdvisorUser] = useState(null)

  const currentGrades = studentGrades || grades || []
  const isLoading = status === 'loading' || overviewLoading

  useEffect(() => {
    if (currentUser?.id) {
      dispatch(fetchStudentGradesAsync(currentUser.id))
      // FAZ 3.3 — advisorId'yi dinamik olarak kullanıcıdan çek, yoksa u20'ye düş
      const advisorId = currentUser.advisorId || 'u20'
      fetch(`http://localhost:3001/users/${advisorId}`)
        .then(res => res.json())
        .then(data => setAdvisorUser(data))
        .catch(err => console.error('Error fetching advisor info', err))
    }
  }, [dispatch, currentUser])

  useEffect(() => {
    Promise.all([
      fetch('http://localhost:3001/weeklyLessonsByWeek').then(res => res.json()),
      fetch('http://localhost:3001/academicEvents').then(res => res.json()),
      fetch('http://localhost:3001/bulletins').then(res => res.json())
    ])
      .then(([schedule, events, bulls]) => {
        setWeeklySchedule(schedule)
        setAcademicEvents(events)
        setBulletins(bulls)
        setOverviewLoading(false)
      })
      .catch(err => {
        console.error('Error loading dashboard overview data', err)
        setOverviewLoading(false)
      })
  }, [])



  // GANO Calculations (consistent with studentCalc)
  const semesterGano = currentGrades.length > 0
    ? calculateGano(currentGrades)
    : 0.0

  const generalGano = currentGrades.length > 0
    ? simulateGano(currentGrades, null, 0)
    : (currentUser?.gpa || 3.42)

  // AKTS Progress Calculation
  const baseCompletedEcts = currentUser?.completedEcts || 180
  const currentSemesterCompletedEcts = currentGrades
    .filter(g => g.final !== null && g.final !== undefined && g.final !== 'Açıklanmadı' && g.letterGrade !== 'FF')
    .reduce((sum, g) => sum + (Number(g.ects || g.akts) || 0), 0)
  const totalCompletedEcts = baseCompletedEcts + currentSemesterCompletedEcts
  const totalEctsRequirement = currentUser?.totalEcts || 240

  // Devamsızlık Oranı Calculation
  const overallAbsencePercentage = currentGrades.length > 0
    ? Math.round(currentGrades.reduce((sum, g) => sum + (g.absencePercentage || 0), 0) / currentGrades.length)
    : 0

  // Today's lessons filter
  const getTodayLessons = () => {
    if (!weeklySchedule) return []
    const todayName = getDayKeyEnglish()
    const today = getSystemToday()
    const day = today.getDate()
    const month = today.getMonth() // 4 = May, 5 = June

    let weekIndex = 1
    if (month === 4) {
      if (day >= 4 && day <= 10) weekIndex = 1
      else if (day >= 11 && day <= 17) weekIndex = 2
      else if (day >= 18 && day <= 24) weekIndex = 3
      else if (day >= 25 && day <= 31) weekIndex = 4
    } else if (month === 5) {
      if (day >= 1 && day <= 7) weekIndex = 5
      else if (day >= 8 && day <= 14) weekIndex = 6
      else if (day >= 15 && day <= 21) weekIndex = 7
      else if (day >= 22 && day <= 28) weekIndex = 8
    }

    const currentWeekSchedule = weeklySchedule[String(weekIndex)] || {}
    return currentWeekSchedule[todayName] || []
  }

  const todayLessons = getTodayLessons()

  // getDayNameTurkish → src/utils/studentCalc.js'ten import edilir

  // Academic Calendar sorting and filtering
  const parseDateStr = (dateStr) => {
    if (!dateStr) return getSystemToday()
    const parts = dateStr.split('.')
    if (parts.length !== 3) return getSystemToday()
    const [d, m, y] = parts
    return new Date(Number(y), Number(m) - 1, Number(d))
  }

  const getUpcomingEvents = () => {
    if (!academicEvents || academicEvents.length === 0) return []
    const sorted = [...academicEvents].sort((a, b) => parseDateStr(a.date) - parseDateStr(b.date))

    const today = getSystemToday()
    today.setHours(0, 0, 0, 0)

    let upcoming = sorted.filter(ev => parseDateStr(ev.date) >= today)
    if (upcoming.length < 4) {
      return sorted.slice(-4)
    }
    return upcoming.slice(0, 4)
  }

  const upcomingEvents = getUpcomingEvents()

  // Critical absences warning (>= 25% absence rate is close to 30% limit)
  const warningAbsenceLimit = 25
  const criticalAbsenceCourses = currentGrades.filter(g =>
    g.semester === '2025-2026 Bahar' && (g.absencePercentage || 0) >= warningAbsenceLimit
  )



  return (
    <>
      <main className="student-main-content">
        <section className="student-page-canvas">

          {(() => {
            const urgent = bulletins.filter(b => b.priority === 'ACİL');
            const latest = urgent.length > 0 ? urgent[urgent.length - 1] : null;
            if (!latest) return null;
            return (
              <div className="p-4 mb-6 bg-red-50 dark:bg-red-950/20 border-l-4 border-red-600 rounded-xl flex items-start gap-3 shadow-sm animate-pulse">
                <span className="material-symbols-outlined text-red-650 shrink-0 mt-0.5">campaign</span>
                <div>
                  <h4 className="text-xs font-extrabold text-red-900 dark:text-red-400 uppercase tracking-wider">ACİL DUYURU: {latest.title}</h4>
                  <p className="text-xs font-medium text-slate-700 dark:text-slate-350 mt-1 leading-relaxed">{latest.content}</p>
                  <span className="text-[9px] text-slate-400 dark:text-slate-500 font-bold mt-2 block">{latest.date} · Dekanlık Makamı</span>
                </div>
              </div>
            );
          })()}

          {/* Kurumsal Karşılama Banner'ı */}
          <div className="student-hero-banner mb-6">
            <div className="z-10 max-w-2xl">
              <h2 className="text-xl md:text-2xl font-extrabold tracking-tight">Sayın {currentUser?.name || 'Öğrenci'},</h2>
              <p className="text-xs md:text-sm text-slate-300 mt-2 font-medium leading-relaxed">
                Öğrenci Bilgi Sistemi portalına hoş geldiniz. Dönem akademik durumunuzu, ders devam çizelgenizi ve akademik takvimi tek bir bakışta bu ekran üzerinden inceleyebilirsiniz.
              </p>
            </div>
            <div className="absolute right-6 top-1/2 -translate-y-1/2 opacity-5 pointer-events-none hidden lg:block z-0">
              <span className="material-symbols-outlined text-[120px]">account_balance</span>
            </div>
          </div>

          {/* Üst Akademik Durum Kartları */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 mb-6">

            {/* Genel GANO */}
            <div className="bg-white dark:bg-slate-800 rounded-2xl p-5 border border-slate-100 dark:border-slate-800/60 shadow-sm flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-blue-50 dark:bg-blue-900/30 text-blue-900 dark:text-blue-400 flex items-center justify-center shrink-0">
                <span className="material-symbols-outlined text-2xl">school</span>
              </div>
              <div>
                <p className="text-[10px] uppercase font-bold tracking-wider text-slate-400 dark:text-slate-500">Genel GANO</p>
                <h4 className="text-xl font-extrabold text-slate-800 dark:text-white mt-1">
                  {isLoading ? '...' : generalGano.toFixed(2)}
                </h4>
              </div>
            </div>

            {/* Dönem GANO */}
            <div className="bg-white dark:bg-slate-800 rounded-2xl p-5 border border-slate-100 dark:border-slate-800/60 shadow-sm flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-indigo-50 dark:bg-indigo-900/30 text-indigo-900 dark:text-indigo-400 flex items-center justify-center shrink-0">
                <span className="material-symbols-outlined text-2xl">grade</span>
              </div>
              <div>
                <p className="text-[10px] uppercase font-bold tracking-wider text-slate-400 dark:text-slate-500">Dönem GANO</p>
                <h4 className="text-xl font-extrabold text-slate-800 dark:text-white mt-1">
                  {isLoading ? '...' : semesterGano.toFixed(2)}
                </h4>
              </div>
            </div>

            {/* Kayıtlı Ders Sayısı */}
            <div className="bg-white dark:bg-slate-800 rounded-2xl p-5 border border-slate-100 dark:border-slate-800/60 shadow-sm flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-purple-50 dark:bg-purple-900/30 text-purple-900 dark:text-purple-400 flex items-center justify-center shrink-0">
                <span className="material-symbols-outlined text-2xl">collections_bookmark</span>
              </div>
              <div>
                <p className="text-[10px] uppercase font-bold tracking-wider text-slate-400 dark:text-slate-500">Kayıtlı Ders Sayısı</p>
                <h4 className="text-xl font-extrabold text-slate-800 dark:text-white mt-1">
                  {isLoading ? '...' : currentGrades.length}
                </h4>
              </div>
            </div>

            {/* Toplam/Tamamlanan Kredi */}
            <div className="bg-white dark:bg-slate-800 rounded-2xl p-5 border border-slate-100 dark:border-slate-800/60 shadow-sm flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-450 flex items-center justify-center shrink-0">
                <span className="material-symbols-outlined text-2xl">task_alt</span>
              </div>
              <div>
                <p className="text-[10px] uppercase font-bold tracking-wider text-slate-400 dark:text-slate-500">Tamamlanan AKTS</p>
                <h4 className="text-xl font-extrabold text-slate-800 dark:text-white mt-1 font-mono">
                  {isLoading ? '...' : `${totalCompletedEcts} / ${totalEctsRequirement}`}
                </h4>
              </div>
            </div>

            {/* Genel Devamsızlık Oranı */}
            <div className="bg-white dark:bg-slate-800 rounded-2xl p-5 border border-slate-100 dark:border-slate-800/60 shadow-sm flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-rose-50 dark:bg-rose-900/30 text-rose-600 dark:text-rose-450 flex items-center justify-center shrink-0">
                <span className="material-symbols-outlined text-2xl">event_busy</span>
              </div>
              <div>
                <p className="text-[10px] uppercase font-bold tracking-wider text-slate-400 dark:text-slate-500">Dönem Devamsızlık Oranı</p>
                <h4 className="text-xl font-extrabold text-slate-800 dark:text-white mt-1">
                  {isLoading ? '...' : `%${overallAbsencePercentage}`}
                </h4>
              </div>
            </div>

          </div>

          {/* Dashboard Bento Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

            {/* Sol Sütun - 2 Kolon Kaplar (Bugünün Dersleri & Akademik Takvim Özeti) */}
            <div className="lg:col-span-2 space-y-6">

              {/* Bugünün Dersleri */}
              <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-800/60 shadow-sm p-6">
                <div className="flex justify-between items-center pb-3 border-b border-slate-100 dark:border-slate-700/60 mb-5">
                  <h3 className="text-sm font-extrabold text-slate-800 dark:text-white flex items-center gap-2">
                    <span className="material-symbols-outlined text-blue-900 dark:text-blue-450">calendar_today</span>
                    <span>Bugünün Ders Programı ({getDayNameTurkish()})</span>
                  </h3>
                  <Link to="/student/calendar" className="text-xs font-bold text-blue-900 dark:text-blue-400 hover:underline">
                    Haftalık Program
                  </Link>
                </div>

                {isLoading ? (
                  <p className="text-xs text-slate-500 py-4 text-center">Yükleniyor...</p>
                ) : todayLessons.length === 0 ? (
                  <div className="p-6 bg-slate-50 dark:bg-slate-900/40 rounded-xl border border-slate-100 dark:border-slate-800/60 text-center">
                    <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                      Bugün programınızda kayıtlı ders bulunmamaktadır.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {todayLessons.map((lesson, idx) => (
                      <div key={idx} className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 bg-slate-50 dark:bg-slate-900/30 rounded-xl border border-slate-100 dark:border-slate-800/40 hover:border-slate-200 dark:hover:border-slate-700 transition-colors">
                        <div className="flex items-center gap-3">
                          <div className="px-2.5 py-1 bg-blue-50 dark:bg-blue-900/30 text-blue-950 dark:text-blue-300 rounded text-xs font-extrabold font-mono shrink-0">
                            {lesson.time}
                          </div>
                          <div>
                            <h4 className="text-xs font-bold text-slate-800 dark:text-white">{lesson.name}</h4>
                            <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-1 font-semibold">{lesson.instructor}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className={`text-[9px] px-2 py-0.5 rounded-full font-bold ${lesson.type === 'Laboratuvar'
                            ? 'bg-amber-50 dark:bg-amber-950/20 text-amber-600 dark:text-amber-400 border border-amber-100 dark:border-amber-900/20'
                            : 'bg-indigo-50 dark:bg-indigo-950/20 text-indigo-600 dark:text-indigo-455 border border-indigo-100 dark:border-indigo-900/20'
                            }`}>
                            {lesson.type}
                          </span>
                          <span className="text-[10px] font-bold text-slate-605 dark:text-slate-300 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 px-2 py-0.5 rounded">
                            {lesson.room}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Akademik Takvim Özeti */}
              <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-800/60 shadow-sm p-6">
                <div className="flex justify-between items-center pb-3 border-b border-slate-100 dark:border-slate-700/60 mb-5">
                  <h3 className="text-sm font-extrabold text-slate-800 dark:text-white flex items-center gap-2">
                    <span className="material-symbols-outlined text-blue-900 dark:text-blue-450">event_note</span>
                    <span>Yaklaşan Tarihler</span>
                  </h3>
                  <Link to="/student/academic-calendar" className="text-xs font-bold text-blue-900 dark:text-blue-450 hover:underline">
                    Akademik Takvim
                  </Link>
                </div>

                {isLoading ? (
                  <p className="text-xs text-slate-500 py-4 text-center">Yükleniyor...</p>
                ) : upcomingEvents.length === 0 ? (
                  <p className="text-xs text-slate-500 py-4 text-center">Planlanmış yakın tarihli etkinlik bulunmamaktadır.</p>
                ) : (
                  <div className="divide-y divide-slate-100 dark:divide-slate-700/40">
                    {upcomingEvents.map((event) => (
                      <div key={event.id} className="py-3.5 first:pt-0 last:pb-0 flex items-center justify-between gap-4">
                        <div className="min-w-0">
                          <p className="text-xs font-bold text-slate-700 dark:text-slate-300 leading-relaxed">
                            {event.title}
                          </p>
                        </div>
                        <div className="flex items-center gap-2 shrink-0">
                          <span className={`text-[8px] uppercase tracking-wider font-extrabold px-1.5 py-0.2 rounded-full ${event.semester === 'tatil'
                            ? 'bg-rose-50 dark:bg-rose-950/30 text-rose-600 dark:text-rose-450 border border-rose-100/50 dark:border-rose-900/20'
                            : 'bg-blue-50 dark:bg-blue-900/30 text-blue-950 dark:text-blue-300 border border-blue-100/50 dark:border-blue-900/20'
                            }`}>
                            {event.semester === 'tatil' ? 'Tatil' : 'Akademik'}
                          </span>
                          <span className="text-[10px] font-bold font-mono text-slate-500 dark:text-slate-400">
                            {event.date}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

            </div>

            {/* Sağ Sütun - 1 Kolon Kaplar (Devamsızlık Uyarısı, Danışmanlık & Takip) */}
            <div className="space-y-6">

              {/* Devamsızlık Uyarısı */}
              <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-800/60 shadow-sm p-6">
                <h3 className="text-sm font-extrabold text-slate-800 dark:text-white flex items-center gap-2 pb-3 border-b border-slate-100 dark:border-slate-700/60 mb-5">
                  <span className="material-symbols-outlined text-rose-500">warning</span>
                  <span>Kritik Devamsızlık Uyarıları</span>
                </h3>

                {isLoading ? (
                  <p className="text-xs text-slate-500 py-4 text-center">Yükleniyor...</p>
                ) : criticalAbsenceCourses.length === 0 ? (
                  <div className="p-4 bg-emerald-50/50 dark:bg-emerald-950/10 border border-emerald-100/50 dark:border-emerald-900/20 text-emerald-800 dark:text-emerald-450 rounded-xl flex items-center gap-3">
                    <span className="material-symbols-outlined text-lg shrink-0">check_circle</span>
                    <p className="text-[11px] font-semibold leading-relaxed m-0">
                      Kritik devamsızlık sınırına (%30) yaklaşan veya sınırı aşan dersiniz bulunmamaktadır.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <p className="text-[10px] text-slate-400 font-semibold leading-relaxed">
                      Aşağıdaki ders(ler) için devamsızlık oranınız akademik kritik sınıra (%30) yaklaşmış veya bu sınırı aşmıştır:
                    </p>
                    {criticalAbsenceCourses.map((course) => (
                      <div key={course.id} className="p-4 bg-rose-50/40 dark:bg-rose-950/10 border border-rose-100/40 dark:border-rose-900/20 rounded-xl">
                        <div className="flex justify-between items-start mb-2">
                          <div>
                            <h4 className="text-xs font-bold text-slate-800 dark:text-white">{course.courseCode}</h4>
                            <p className="text-[10px] text-slate-500 dark:text-slate-400 font-semibold mt-0.5">{course.courseName}</p>
                          </div>
                          <span className="text-xs font-extrabold text-rose-600 dark:text-rose-450 font-mono">
                            %{course.absencePercentage}
                          </span>
                        </div>
                        <div className="w-full bg-slate-200 dark:bg-slate-700 h-1.5 rounded-full overflow-hidden">
                          <div
                            className="bg-rose-550 h-full rounded-full"
                            style={{ width: `${Math.min(course.absencePercentage, 100)}%` }}
                          />
                        </div>
                        <div className="flex justify-between items-center mt-2.5 text-[9px] text-rose-600 dark:text-rose-455 font-bold">
                          <span>Kritik Limit: %30</span>
                          <Link to="/student/schedule" className="hover:underline">
                            Detaylı İncele
                          </Link>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Akademik Danışman Bilgisi */}
              <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-800/60 shadow-sm p-6">
                <h3 className="text-sm font-extrabold text-slate-800 dark:text-white flex items-center gap-2 pb-3 border-b border-slate-100 dark:border-slate-700/60 mb-5">
                  <span className="material-symbols-outlined text-slate-500">support_agent</span>
                  <span>Akademik Danışmanlık</span>
                </h3>

                <div className="flex items-center gap-4 mb-4">
                  <div className="w-12 h-12 rounded-full bg-blue-100 dark:bg-blue-900/40 text-blue-900 dark:text-blue-300 flex items-center justify-center font-extrabold text-lg shrink-0">
                    {currentUser?.advisor?.charAt(0) || 'S'}
                  </div>
                  <div>
                    <p className="text-[10px] text-slate-404 uppercase font-bold tracking-wider">Danışman Öğretim Üyesi</p>
                    <p className="text-xs font-extrabold text-slate-800 dark:text-white mt-0.5">{currentUser?.advisor || 'Danışman Belirtilmedi'}</p>
                    <p className="text-[9px] text-slate-500 dark:text-slate-400 font-semibold mt-0.5">Yazılım Mühendisliği Bölümü</p>
                  </div>
                </div>

                <div className="mt-4 pt-4 border-t border-slate-100 dark:border-slate-700/60 space-y-3">
                  <div className="flex items-start gap-2.5 text-xs text-slate-600 dark:text-slate-350">
                    <span className="material-symbols-outlined text-slate-400 shrink-0 text-base mt-0.5">meeting_room</span>
                    <div>
                      <p className="text-[10px] text-slate-400 dark:text-slate-500 uppercase font-bold tracking-wider">Ofis / Oda</p>
                      <p className="font-semibold text-slate-800 dark:text-white mt-0.5">{advisorUser?.room || 'Mühendislik Fakültesi, A-Blok, A-302'}</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-2.5 text-xs text-slate-600 dark:text-slate-350">
                    <span className="material-symbols-outlined text-slate-400 shrink-0 text-base mt-0.5">mail</span>
                    <div>
                      <p className="text-[10px] text-slate-400 dark:text-slate-500 uppercase font-bold tracking-wider">E-Posta</p>
                      <a href={`mailto:${advisorUser?.email || 's.yilmaz@university.edu.tr'}`} className="font-semibold text-blue-900 dark:text-blue-400 hover:underline mt-0.5 block break-all">
                        {advisorUser?.email || 's.yilmaz@university.edu.tr'}
                      </a>
                    </div>
                  </div>
                  <div className="flex items-start gap-2.5 text-xs text-slate-600 dark:text-slate-350">
                    <span className="material-symbols-outlined text-slate-400 shrink-0 text-base mt-0.5">phone</span>
                    <div>
                      <p className="text-[10px] text-slate-400 dark:text-slate-500 uppercase font-bold tracking-wider">Telefon</p>
                      <p className="font-semibold text-slate-800 dark:text-white mt-0.5">{advisorUser?.phone || '+90 555 888 9911'}</p>
                    </div>
                  </div>
                </div>
              </div>

            </div>

          </div>

        </section>

        <footer className="student-page-footer mt-8 py-4 border-t border-slate-100 dark:border-slate-800/40 text-center text-[10px] text-slate-400 font-medium">
          © 2026 Academic Information System. Tüm hakları saklıdır.
        </footer>
      </main>

      {/* Mobil Alt Navigasyon Barı */}
      <nav className="student-mobile-nav">
        <Link to="/student/dashboard" className="student-mobile-active">
          <span className="material-symbols-outlined">dashboard</span>
          <span>Panel</span>
        </Link>
        <Link to="/student/courses" className="student-mobile-item">
          <span className="material-symbols-outlined">menu_book</span>
          <span>Dersler</span>
        </Link>
        <Link to="/student/grades" className="student-mobile-item">
          <span className="material-symbols-outlined">grade</span>
          <span>Notlar</span>
        </Link>
        <Link to="/student/schedule" className="student-mobile-item">
          <span className="material-symbols-outlined">calendar_month</span>
          <span>Takvim</span>
        </Link>
      </nav>

      {/* Mobil Canlı Yardım Destek FAB Butonu */}
      <button className="student-fab-btn" onClick={() => toast.success('Canlı destek talebiniz alınmıştır.')}>
        <span className="material-symbols-outlined">chat_bubble</span>
        <span className="student-fab-tooltip">Canlı Yardım</span>
      </button>
    </>
  )
}
