import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import {
  fetchStudentGradesAsync,
  fetchStudentDashboardAsync
} from '../../store/student/studentSlice'
import { toast } from 'react-hot-toast'

const absenceDetails = [
  { id: 1, date: "12.05.2026", hours: 2, courseName: "Yapay Zeka ve Veri Analitiği" },
  { id: 2, date: "28.05.2026", hours: 3, courseName: "Modern Web Teknolojileri" },
  { id: 3, date: "03.06.2026", hours: 2, courseName: "Siber Güvenlik Temelleri" }
]

export default function StudentDashboard() {
  const dispatch = useDispatch()
  const { currentUser } = useSelector((state) => state.auth || {})
  const { grades, dashboardData, status } = useSelector((state) => state.student || {})
  
  const [localSearch, setLocalSearch] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const [showAllCourses, setShowAllCourses] = useState(false)

  useEffect(() => {
    if (currentUser?.id) {
      dispatch(fetchStudentGradesAsync(currentUser.id))
      dispatch(fetchStudentDashboardAsync())
    }
  }, [dispatch, currentUser])

  // Kullanıcı bilgileri
  const currentGano = currentUser?.gpa || 0
  const completedEcts = currentUser?.completedEcts || 0
  const totalEcts = currentUser?.totalEcts || 240
  const absentPercent = 100 - (currentUser?.attendanceRate || 92)

  // Kayıtlı Dersler & Yaklaşan Dersler
  const studentCourses = dashboardData?.registeredCourses || []
  const upcomingClasses = dashboardData?.upcomingLessons || []

  // Ders arama filtresi
  const filteredStudentCourses = studentCourses.filter(course => {
    const name = course.name || course.courseName || ''
    const instructor = course.instructor || ''
    const category = course.category || ''
    
    return localSearch.trim() === '' || 
      name.toLowerCase().includes(localSearch.toLowerCase()) || 
      instructor.toLowerCase().includes(localSearch.toLowerCase()) ||
      category.toLowerCase().includes(localSearch.toLowerCase())
  })

  const isLoading = status === 'loading'

  // Sayfa başına 5 ders gösterimi
  const itemsPerPage = 5
  const totalPages = Math.ceil(filteredStudentCourses.length / itemsPerPage)
  
  const displayedCourses = showAllCourses 
    ? filteredStudentCourses 
    : filteredStudentCourses.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage)

  return (
    <>
      <main className="student-main-content">
        <section className="student-page-canvas">
          <div className="student-greeting-banner">
            <div className="student-greeting-text">
              <h2 className="student-greeting-title">Hoş geldin, {currentUser?.name || 'Öğrenci'} 👋</h2>
              <p className="student-greeting-sub">Derslerindeki başarını takip etmeye devam et. Bu dönem hedefine ulaşmana çok az kaldı!</p>
            </div>
            <div className="student-greeting-deco">
              <span className="material-symbols-outlined">auto_stories</span>
            </div>
          </div>

          <div className="student-stats-grid">
            <div className="student-stat-card">
              <div className="student-stat-icon-blue">
                <span className="material-symbols-outlined">school</span>
              </div>
              <div className="student-stat-info">
                <p className="student-stat-label">Genel Ortalama (GANO)</p>
                <h3 className="student-stat-value">{isLoading ? '...' : currentGano.toFixed(2)}</h3>
              </div>
            </div>
            <div className="student-stat-card">
              <div className="student-stat-icon-green">
                <span className="material-symbols-outlined">task_alt</span>
              </div>
              <div className="student-stat-info">
                <p className="student-stat-label">Tamamlanan AKTS</p>
                <h3 className="student-stat-value">{completedEcts} / {totalEcts}</h3>
              </div>
            </div>
            <div className="student-stat-card">
              <div className="student-stat-icon-amber">
                <span className="material-symbols-outlined">event_busy</span>
              </div>
              <div className="student-stat-info">
                <p className="student-stat-label">Devamsızlık Oranı</p>
                <h3 className="student-stat-value">%{isLoading ? '...' : absentPercent}</h3>
              </div>
            </div>
          </div>

          <div className="student-dashboard-bento">
            <div className="student-left-col">
              <div className="student-section-header flex flex-col sm:flex-row sm:items-center justify-between gap-4 w-full">
                <h3 className="student-section-title flex items-center gap-2">
                  <span className="material-symbols-outlined">collections_bookmark</span>
                  <span>Kayıtlı Derslerim</span>
                </h3>
                <div className="flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-end">
                  <div className="relative">
                    <span className="material-symbols-outlined absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400 text-sm">search</span>
                    <input
                      type="text"
                      placeholder="Ders ara..."
                      value={localSearch}
                      onChange={(e) => {
                        setLocalSearch(e.target.value)
                        setCurrentPage(1)
                      }}
                      className="pl-8 pr-3 py-1 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-xs focus:ring-1 focus:ring-blue-500 focus:outline-none w-36 sm:w-48"
                    />
                  </div>
                  <button 
                    onClick={() => {
                      setShowAllCourses(prev => !prev)
                      setCurrentPage(1)
                    }}
                    className="student-link-all cursor-pointer border-none bg-transparent font-bold text-xs"
                  >
                    {showAllCourses ? 'Sayfalı Göster' : 'Tümünü Gör'}
                  </button>
                </div>
              </div>
              
              <div className={showAllCourses ? "flex flex-col gap-6" : "student-courses-grid"}>
                {displayedCourses.length === 0 ? (
                  <p className="student-card-instructor" style={{ gridColumn: '1 / -1', padding: '20px 0' }}>
                    {isLoading ? 'Yükleniyor...' : 'Kayıtlı dersiniz bulunmamaktadır.'}
                  </p>
                ) : (
                  displayedCourses.map((course) => {
                    const isDotNet = course.styleClass === 'dotnet'
                    const thumbClass = isDotNet ? 'student-card-thumb-dotnet' : 'student-card-thumb-sql'
                    const badgeClass = course.category === 'Mühendislik' ? 'student-card-badge-blue' : 'student-card-badge-amber'
                    
                    return (
                      <div className="student-course-card" key={course.id}>
                        <div className={thumbClass}>
                          <span className={badgeClass}>{course.category}</span>
                        </div>
                        <div className="student-card-body">
                          <h4 className="student-card-title">{course.name || course.courseName}</h4>
                          <p className="student-card-instructor">{course.instructor}</p>
                          <div className="student-card-progress">
                            <div className="student-progress-labels">
                              <span className="student-progress-text">İlerleme</span>
                              <span className="student-progress-percent">%{course.progress}</span>
                            </div>
                            <div className="student-progress-bar">
                              <div className="student-progress-fill-75" style={{ width: `${course.progress}%` }} />
                            </div>
                            <div className="student-card-actions">
                              <Link to="/student/courses" className="student-btn-vod">
                                <span className="material-symbols-outlined">play_circle</span>
                                <span>VOD Tekrarı</span>
                              </Link>
                              <button className="student-btn-doc" onClick={() => toast.success(`${course.name || course.courseName} ders dökümanları hazır.`)}>
                                <span className="material-symbols-outlined">description</span>
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    )
                  })
                )}
              </div>

              {!showAllCourses && totalPages > 1 && (
                <div className="flex justify-center items-center gap-2 mt-6">
                  <div className="flex gap-1.5">
                    <button
                      onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                      disabled={currentPage === 1}
                      className="w-7 h-7 rounded border border-slate-200 dark:border-slate-700 flex items-center justify-center hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                    >
                      <span className="material-symbols-outlined text-sm">chevron_left</span>
                    </button>
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                      <button
                        key={page}
                        onClick={() => setCurrentPage(page)}
                        className={`w-7 h-7 rounded flex items-center justify-center text-xs font-bold transition-colors cursor-pointer ${
                          currentPage === page
                            ? 'bg-blue-900 text-white border-none'
                            : 'border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                        }`}
                      >
                        {page}
                      </button>
                    ))}
                    <button
                      onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                      disabled={currentPage === totalPages}
                      className="w-7 h-7 rounded border border-slate-200 dark:border-slate-700 flex items-center justify-center hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                    >
                      <span className="material-symbols-outlined text-sm">chevron_right</span>
                    </button>
                  </div>
                </div>
              )}
            </div>

            <div className="student-right-col">
              <h3 className="student-section-title">
                <span className="material-symbols-outlined">schedule</span>
                <span>Yaklaşan Dersler</span>
              </h3>
              <div className="student-timeline-card">
                {upcomingClasses.length === 0 ? (
                  <p className="student-timeline-name" style={{ padding: '10px 0' }}>Yaklaşan ders bulunmuyor.</p>
                ) : (
                  upcomingClasses.map((item) => (
                    <div className="student-timeline-item" key={item.id}>
                      <div className={item.isLive ? 'student-timeline-dot-active' : 'student-timeline-dot-inactive'} />
                      <div className="student-timeline-header">
                        <span className={item.isLive ? 'student-timeline-time-blue' : 'student-timeline-time-gray'}>
                          {item.time}
                        </span>
                        {item.isLive && <span className="student-timeline-live">Canlı</span>}
                      </div>
                      <p className="student-timeline-name">{item.name}</p>
                      <p className="student-timeline-loc">{item.location}</p>
                      {item.isLive && (
                        <button className="student-btn-join" onClick={() => toast.success('Derse bağlanılıyor...')}>
                          Derse Katıl
                        </button>
                      )}
                    </div>
                  ))
                )}

                <Link to="/student/schedule" className="student-btn-calendar" style={{ display: 'block', textAlign: 'center', textDecoration: 'none' }}>
                  Tüm Takvimi İncele
                </Link>
              </div>

              <h3 className="student-section-title mt-6">
                <span className="material-symbols-outlined">event_busy</span>
                <span>Devamsızlık Tarihleri</span>
              </h3>
              <div className="student-timeline-card flex flex-col gap-3 p-4">
                {absenceDetails.map((detail) => (
                  <div key={detail.id} className="flex justify-between items-center text-xs border-b border-slate-100 dark:border-slate-800 pb-2 last:border-0 last:pb-0">
                    <div>
                      <p className="font-bold text-slate-800 dark:text-white">{detail.courseName}</p>
                      <p className="text-[10px] text-slate-400 mt-0.5">Tarih: {detail.date}</p>
                    </div>
                    <span className="bg-red-50 dark:bg-red-950/30 text-red-600 dark:text-red-400 px-2.5 py-0.5 rounded text-[9px] font-extrabold shrink-0">
                      {detail.hours} Saat
                    </span>
                  </div>
                ))}
              </div>

              <div className="student-advisor-card">
                <div className="student-advisor-info">
                  <div className="student-advisor-avatar">{currentUser?.advisor?.charAt(0) || 'S'}</div>
                  <div className="student-advisor-details">
                    <p className="student-advisor-title">Akademik Danışman</p>
                    <p className="student-advisor-name">{currentUser?.advisor || 'Danışman Belirtilmedi'}</p>
                  </div>
                </div>
                <button className="student-btn-appt" onClick={() => toast.success('Danışman randevu talebiniz oluşturuldu.')}>
                  Randevu Al
                </button>
              </div>
            </div>
          </div>
        </section>

        <footer className="student-page-footer">
          © 2024 Academic Information System. Tüm hakları saklıdır.
        </footer>
      </main>

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

      <button className="student-fab-btn" onClick={() => toast.success('Canlı destek talebiniz alındı.')}>
        <span className="material-symbols-outlined">chat_bubble</span>
        <span className="student-fab-tooltip">Canlı Yardım</span>
      </button>
    </>
  )
}
