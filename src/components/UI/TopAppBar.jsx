import { useEffect, useState, useRef } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useNavigate, useLocation } from 'react-router-dom'
import { logout } from '../../store/auth/authSlice'
import { fetchAnnouncementsAsync } from '../../store/announcement/announcementSlice'
import { toast } from 'react-hot-toast'

export default function TopAppBar() {
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const location = useLocation()

  const { currentUser } = useSelector((state) => state.auth || {})
  const { announcements } = useSelector((state) => state.announcements || {})

  const [isNotifOpen, setIsNotifOpen] = useState(false)
  const dropdownRef = useRef(null)

  const [isSettingsOpen, setIsSettingsOpen] = useState(false)
  const settingsRef = useRef(null)

  const [theme, setTheme] = useState(localStorage.getItem('theme') || 'light')

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

  // Duyuruları (Bildirimleri) çek
  useEffect(() => {
    if (currentUser) {
      dispatch(fetchAnnouncementsAsync())
    }
  }, [dispatch, currentUser])

  // Dışarı tıklanınca menüleri kapat
  useEffect(() => {
    function handleClickOutside(event) {
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

  // Kullanıcı bilgileri
  const role = currentUser?.role || 'student'
  const userName = currentUser?.name || 'Kullanıcı'
  const userId = currentUser?.studentNumber || currentUser?.phone || currentUser?.id || '—'

  // Kullanıcının rolüne göre duyuruları filtrele (öğrenci ise ders bazlı veya genel, akademisyen/dekan ise hepsini görebilir)
  const filteredAnnouncements = announcements.filter(ann => {
    if (role === 'student') {
      return ann.target === 'global' || (ann.target === 'class' && ann.courseId);
    }
    return true;
  });

  const unreadCount = filteredAnnouncements.length

  const handleLogout = () => {
    dispatch(logout())
    toast.success('Başarıyla çıkış yapıldı')
    navigate('/')
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
          <span>Rol: {role === 'student' ? 'Öğrenci' : role === 'teacher' ? 'Akademisyen' : role === 'dean' ? 'Dekan' : 'Yönetici'}</span>
        </div>

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
                <span className="text-xs font-bold text-slate-800">Duyurular ({unreadCount})</span>
              </div>
              <div className="flex flex-col gap-2 overflow-y-auto max-h-64 pr-1">
                {filteredAnnouncements.length === 0 ? (
                  <p className="text-xs text-slate-400 text-center py-4">Duyuru bulunmuyor.</p>
                ) : (
                  filteredAnnouncements.map((ann) => (
                    <div
                      key={ann.id}
                      className="notif-item notif-unread cursor-default"
                    >
                      <div className="text-xs font-bold text-slate-800 flex justify-between items-center">
                        <span>{ann.title}</span>
                        {ann.pinned && <span className="text-[10px] bg-red-100 text-red-600 px-1.5 py-0.5 rounded-full">Sabit</span>}
                      </div>
                      <p className="text-xs text-slate-500 leading-normal mt-1">{ann.body || ann.content}</p>
                      <span className="text-[10px] text-slate-400 self-end mt-1">{ann.date}</span>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        <button className="topbar-btn-theme" onClick={toggleTheme} title="Tema Değiştir" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <span className="material-symbols-outlined">
            {theme === 'dark' ? 'light_mode' : 'dark_mode'}
          </span>
        </button>

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
                  navigate(role === 'student' ? '/student/profile' : role === 'teacher' ? '/teacher/profile' : '/dean/profile')
                }}
                className="w-full text-left px-3 py-2 text-xs text-slate-700 hover:bg-slate-50 hover:text-blue-600 rounded-lg transition-all flex items-center gap-2 cursor-pointer border-none bg-transparent"
              >
                <span className="material-symbols-outlined text-base">person</span>
                <span>Profil Bilgileri</span>
              </button>
              <button
                onClick={handleLogout}
                className="w-full text-left px-3 py-2 text-xs text-red-600 hover:bg-red-50 rounded-lg transition-all flex items-center gap-2 cursor-pointer border-none bg-transparent"
              >
                <span className="material-symbols-outlined text-base">logout</span>
                <span>Çıkış Yap</span>
              </button>
            </div>
          )}
        </div>

        <div className="topbar-dev-divider" />

        <div
          className="topbar-profile-box cursor-pointer"
          onClick={() => navigate(role === 'student' ? '/student/profile' : role === 'teacher' ? '/teacher/profile' : '/dean/profile')}
          title="Profilimi Görüntüle"
        >
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