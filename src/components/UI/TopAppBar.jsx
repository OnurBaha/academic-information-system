import { useEffect, useState, useRef } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useNavigate, useLocation } from 'react-router-dom'
import { fetchNotifications, toggleNotificationRead, setSearchQuery, createNotification } from '../../store/student/studentSlice'
import { toast } from 'react-hot-toast'

export default function TopAppBar({ role = 'student', userName = 'Ahmet Yılmaz', userId = '20211024032' }) {
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const location = useLocation()
  
  const isDocumentsPage = location.pathname === '/student/documents'
  const isHideSearchPage = isDocumentsPage || location.pathname === '/student/academic-calendar' || location.pathname === '/student/exams' || location.pathname === '/student/course-registration'
  const { notifications, searchQuery, studentCourses } = useSelector((state) => state.student || {})
  const { user } = useSelector((state) => state.auth || {})
  
  const [isNotifOpen, setIsNotifOpen] = useState(false)
  const dropdownRef = useRef(null)

  const [isSettingsOpen, setIsSettingsOpen] = useState(false)
  const settingsRef = useRef(null)

  // Tema durumu
  const [theme, setTheme] = useState(localStorage.getItem('theme') || 'light')

  // Tema değişimi takibi
  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark')
    } else {
      document.documentElement.classList.remove('dark')
    }
    localStorage.setItem('theme', theme)
  }, [theme])

  const toggleTheme = () => {
    setTheme(prev => prev === 'dark' ? 'light' : 'dark')
  }

  // Bildirimleri çek
  useEffect(() => {
    if (role === 'student' && user?.id) {
      dispatch(fetchNotifications(user.id))
    }
  }, [dispatch, role, user])

  // Dışarı tıklanınca menüleri kapat
  useEffect(() => {
    function handleClickOutside(event) {
      // Eğer tıklanan eleman DOM'dan silinmişse (örneğin bildirim okundu durumuna geçince yeniden render ile silinen nokta), dışarı tıklama saymıyoruz.
      if (event.target && !document.body.contains(event.target)) {
        return
      }
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsNotifOpen(false)
      }
      if (settingsRef.current && !settingsRef.current.contains(event.target)) {
        setIsSettingsOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  // Simüle bildirim tetikleyici
  const simulationTriggered = useRef(false)

  useEffect(() => {
    if (isNotifOpen && !simulationTriggered.current && role === 'student' && user?.id) {
      const timer = setTimeout(() => {
        simulationTriggered.current = true
        
        // Öğrenci ders bilgileri
        const course = studentCourses && studentCourses.length > 0 
          ? studentCourses[0] 
          : { code: 'NET401', courseName: 'Full-Stack .NET & React' }
        const courseCode = course.code || 'NET401'
        const courseName = course.courseName || 'Full-Stack .NET & React'

        const today = new Date()
        const formattedDate = `${String(today.getDate()).padStart(2, '0')}.${String(today.getMonth() + 1).padStart(2, '0')}.${today.getFullYear()}`

        // Son teslim tarihi hesabı (7 gün sonrası)
        const dueDate = new Date()
        dueDate.setDate(dueDate.getDate() + 7)
        const formattedDueDate = `${String(dueDate.getDate()).padStart(2, '0')}.${String(dueDate.getMonth() + 1).padStart(2, '0')}.${dueDate.getFullYear()}`

        dispatch(createNotification({
          studentId: user.id,
          title: 'Yeni Bir Ödeviniz Var!',
          content: `Yeni bir ödeviniz var. ${courseCode} - ${courseName} dersi için yeni ödev sisteme yüklendi. Son teslim tarihi: ${formattedDueDate}`,
          date: formattedDate,
          read: false
        })).then(() => {
          toast.success('Yeni bir bildiriminiz var!')
        })
      }, 2000)
      
      return () => clearTimeout(timer)
    }
  }, [isNotifOpen, role, user, studentCourses, dispatch])

  const unreadCount = notifications ? notifications.filter(n => !n.read).length : 0

  const handleNotificationClick = (notif) => {
    dispatch(toggleNotificationRead({ id: notif.id, read: !notif.read }))
    toast.success(notif.read ? 'Bildirim okunmadı olarak işaretlendi' : 'Bildirim okundu olarak işaretlendi')
  }

  // Tüm bildirimleri okundu yap
  const handleMarkAllAsRead = (e) => {
    e.stopPropagation()
    const unread = notifications.filter(n => !n.read)
    if (unread.length === 0) return

    unread.forEach(notif => {
      dispatch(toggleNotificationRead({ id: notif.id, read: true }))
    })
    toast.success('Tüm bildirimler okundu olarak işaretlendi')
  }

  return (
    <header className="topbar-container relative">
      <div className="topbar-left-side">
        <button className="topbar-btn-menu">
          <span className="material-symbols-outlined">menu</span>
        </button>
      </div>

      <div className="topbar-right-side">
        <div className="topbar-badge-role">
          <span className="topbar-dot-role" />
          <span>Role: {role === 'student' ? 'Öğrenci' : role === 'teacher' ? 'Akademisyen' : 'Dekan'}</span>
        </div>

        {role === 'student' && (
          <div className="relative" ref={dropdownRef}>
            <button 
              className="topbar-btn-notif" 
              onClick={() => setIsNotifOpen(!isNotifOpen)}
              title="Bildirimler"
            >
              <span className={`material-symbols-outlined ${unreadCount > 0 ? 'bell-shaking' : ''}`}>notifications</span>
              {unreadCount > 0 && <span className="topbar-badge-notif" />}
            </button>

            {isNotifOpen && (
              <div className="absolute right-0 mt-3 w-80 bg-white border border-slate-200 rounded-xl shadow-xl z-50 p-4 flex flex-col gap-2 max-h-96">
                <div className="flex justify-between items-center pb-2 border-b border-slate-100">
                  <span className="text-xs font-bold text-slate-800">Bildirimler ({unreadCount} Okunmamış)</span>
                  {unreadCount > 0 ? (
                    <button 
                      onClick={handleMarkAllAsRead}
                      className="text-[10px] text-blue-600 hover:text-blue-800 font-semibold cursor-pointer underline bg-transparent border-none p-0"
                    >
                      Tümünü Oku
                    </button>
                  ) : (
                    notifications && notifications.length > 0 && (
                      <span className="text-[10px] text-slate-400">Hepsi Okundu</span>
                    )
                  )}
                </div>
                <div className="flex flex-col gap-2 overflow-y-auto max-h-64 pr-1">
                  {!notifications || notifications.length === 0 ? (
                    <p className="text-xs text-slate-400 text-center py-4">Yeni bildirim bulunmuyor.</p>
                  ) : (
                    notifications.map((notif) => (
                      <div 
                        key={notif.id} 
                        onClick={() => handleNotificationClick(notif)}
                        className={`notif-item ${notif.read ? 'notif-read' : 'notif-unread'}`}
                      >
                        <div className="text-xs font-bold text-slate-800 flex justify-between items-center">
                          <span>{notif.title}</span>
                          {!notif.read && <span className="w-1.5 h-1.5 rounded-full bg-blue-600 shrink-0 ml-2" />}
                        </div>
                        <p className="text-xs text-slate-500 leading-normal">{notif.content}</p>
                        <span className="text-[10px] text-slate-400 self-end mt-1">{notif.date}</span>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>
        )}

        {role !== 'student' && (
          <button className="topbar-btn-notif" onClick={() => toast.error('Bu rolde bildirimler devre dışı.')}>
            <span className="material-symbols-outlined">notifications</span>
          </button>
        )}

        {/* Tema seçici */}
        {role === 'student' && (
          <button className="topbar-btn-theme" onClick={toggleTheme} title="Tema Değiştir" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <span className="material-symbols-outlined">
              {theme === 'dark' ? 'light_mode' : 'dark_mode'}
            </span>
          </button>
        )}

        {/* Ayarlar menüsü */}
        <div className="relative" ref={settingsRef}>
          <button className="topbar-btn-settings" onClick={() => setIsSettingsOpen(!isSettingsOpen)} title="Ayarlar">
            <span className="material-symbols-outlined">settings</span>
          </button>

          {isSettingsOpen && (
            <div className="absolute right-0 mt-3 w-52 bg-white border border-slate-200 rounded-xl shadow-xl z-50 p-2 flex flex-col gap-1">
              <div className="px-3 py-1.5 text-[10px] font-bold text-slate-400 uppercase tracking-wider border-b border-slate-100 mb-1">
                Kullanıcı Ayarları
              </div>
              <button 
                onClick={() => {
                  setIsSettingsOpen(false)
                  navigate('/student/profile')
                }}
                className="w-full text-left px-3 py-2 text-xs text-slate-700 hover:bg-slate-50 hover:text-blue-600 rounded-lg transition-all flex items-center gap-2 cursor-pointer border-none bg-transparent"
              >
                <span className="material-symbols-outlined text-base">person</span>
                <span>Profil Bilgileri</span>
              </button>
              <button 
                onClick={() => {
                  setIsSettingsOpen(false)
                  navigate('/student/profile')
                }}
                className="w-full text-left px-3 py-2 text-xs text-slate-700 hover:bg-slate-50 hover:text-blue-600 rounded-lg transition-all flex items-center gap-2 cursor-pointer border-none bg-transparent"
              >
                <span className="material-symbols-outlined text-base">lock</span>
                <span>Şifre Değiştir</span>
              </button>
            </div>
          )}
        </div>

        <div className="topbar-dev-divider" />

        <div className="topbar-profile-box" onClick={() => navigate('/student/profile')} title="Profilimi Görüntüle">
          <div className="topbar-profile-text">
            <p className="topbar-profile-name">{userName}</p>
            <p className="topbar-profile-id">{userId}</p>
          </div>
          <div className="topbar-profile-avatar">
            <div className="topbar-avatar-initial">
              {userName.charAt(0)}
            </div>
          </div>
        </div>
      </div>
    </header>
  )
}
