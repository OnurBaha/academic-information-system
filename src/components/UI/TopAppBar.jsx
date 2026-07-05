import { useEffect, useState, useRef, useCallback, useMemo } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useNavigate, useLocation } from 'react-router-dom'
import { logout } from '../../store/auth/authSlice'
import { fetchAnnouncementsAsync } from '../../store/announcement/announcementSlice'
import { toast } from 'react-hot-toast'

// localStorage key for read announcement IDs (per user)
const getReadKey = (userId) => `readAnnouncements_${userId || 'default'}`

export default function TopAppBar() {
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const location = useLocation()

  const { currentUser } = useSelector((state) => state.auth || {})
  const { announcements: apiAnnouncements } = useSelector((state) => state.announcements || {})
  const teacherAnnouncements = useSelector((state) => state.teacher?.announcements || [])

  const [isNotifOpen, setIsNotifOpen] = useState(false)
  const [selectedAnn, setSelectedAnn] = useState(null)
  const dropdownRef = useRef(null)

  const [isSettingsOpen, setIsSettingsOpen] = useState(false)
  const settingsRef = useRef(null)

  const [isProfileOpen, setIsProfileOpen] = useState(false)
  const profileRef = useRef(null)

  const [theme, setTheme] = useState(localStorage.getItem('theme') || 'light')
  const [bulletins, setBulletins] = useState([])

  // Okunmuş duyuru ID'lerini localStorage'dan yükle
  const [readIds, setReadIds] = useState(() => {
    try {
      const stored = localStorage.getItem(getReadKey(currentUser?.id))
      return stored ? JSON.parse(stored) : []
    } catch {
      return []
    }
  })

  // Kullanıcı değiştiğinde readIds'i güncelle
  useEffect(() => {
    try {
      const stored = localStorage.getItem(getReadKey(currentUser?.id))
      setReadIds(stored ? JSON.parse(stored) : [])
    } catch {
      setReadIds([])
    }
  }, [currentUser?.id])

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
      fetch('http://localhost:3001/bulletins')
        .then(res => res.json())
        .then(data => setBulletins(data))
        .catch(err => console.error(err))
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
        setSelectedAnn(null)
      }
      if (settingsRef.current && !settingsRef.current.contains(event.target)) {
        setIsSettingsOpen(false)
      }
      if (profileRef.current && !profileRef.current.contains(event.target)) {
        setIsProfileOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  // Kullanıcı bilgileri
  const role = currentUser?.role || 'student'
  const userName = currentUser?.name || 'Kullanıcı'
  const userId = role === 'student' ? (currentUser?.studentNumber || currentUser?.id || '—') : null

  // Hem API hem de teacher store duyurularını birleştir, ID'ye göre tekrarları engelle
  // Hem API, teacher hem de dekan bültenlerini birleştir
  const allAnnouncements = useMemo(() => {
    const mappedBulletins = bulletins.map(b => ({
      id: b.id,
      title: b.title,
      body: b.content,
      date: b.date,
      target: b.target || 'global',
      pinned: b.priority === 'ACİL'
    }));

    const combined = [
      ...(apiAnnouncements || []), 
      ...(teacherAnnouncements || []),
      ...mappedBulletins
    ]
    const seen = new Set()
    return combined.filter(ann => {
      const key = String(ann.id)
      if (seen.has(key)) return false
      seen.add(key)
      return true
    })
  }, [apiAnnouncements, teacherAnnouncements, bulletins])

  // Kullanıcının rolüne göre duyuruları filtrele
  const filteredAnnouncements = useMemo(() => {
    return allAnnouncements.filter(ann => {
      if (role === 'student') {
        return ann.target === 'global' || ann.target === 'Tüm Öğrenciler' || (ann.target === 'class' && ann.courseId);
      }
      return true;
    })
  }, [allAnnouncements, role])

  // Okunmamış sayısını hesapla
  const unreadCount = useMemo(() => {
    return filteredAnnouncements.filter(ann => !readIds.includes(String(ann.id))).length
  }, [filteredAnnouncements, readIds])

  // Duyuruyu okundu olarak işaretle
  const markAsRead = useCallback((annId) => {
    const id = String(annId)
    setReadIds(prev => {
      if (prev.includes(id)) return prev
      const updated = [...prev, id]
      localStorage.setItem(getReadKey(currentUser?.id), JSON.stringify(updated))
      return updated
    })
  }, [currentUser?.id])

  // Tüm duyuruları okundu olarak işaretle
  const markAllAsRead = useCallback(() => {
    const allIds = filteredAnnouncements.map(ann => String(ann.id))
    setReadIds(allIds)
    localStorage.setItem(getReadKey(currentUser?.id), JSON.stringify(allIds))
  }, [filteredAnnouncements, currentUser?.id])

  // Duyuruya tıklandığında detay görünümüne geç ve okundu olarak işaretle
  const handleAnnClick = (ann) => {
    setSelectedAnn(ann)
    markAsRead(ann.id)
  }

  // Detay görünümünden listeye geri dön
  const handleBackToList = () => {
    setSelectedAnn(null)
  }

  const [termStatus, setTermStatus] = useState(null)

  useEffect(() => {
    const fetchTermStatus = () => {
      fetch('http://localhost:3001/termStatus')
        .then(res => res.json())
        .then(data => setTermStatus(data))
        .catch(err => console.error('Error fetching termStatus:', err))
    }
    fetchTermStatus()
    const interval = setInterval(fetchTermStatus, 3000) // Poll every 3 seconds for real-time responsiveness
    return () => clearInterval(interval)
  }, [])

  const handleLogout = () => {
    dispatch(logout())
    toast.success('Başarıyla çıkış yapıldı')
    navigate('/')
  }

  return (
    <>
      {termStatus?.emergencyAlertActive && (
        <div className="w-full bg-red-600 text-white text-xs font-black py-1.5 px-4 flex items-center justify-between overflow-hidden select-none border-b border-red-700 shadow-sm z-50">
          <marquee className="flex-1 font-bold text-center uppercase tracking-wider">{termStatus.emergencyAlertText}</marquee>
          <span className="material-symbols-outlined text-[16px] ml-2">warning</span>
        </div>
      )}
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
            onClick={() => {
              setIsNotifOpen(!isNotifOpen)
              if (isNotifOpen) setSelectedAnn(null)
            }}
            title="Bildirimler"
          >
            <span className={`material-symbols-outlined ${unreadCount > 0 ? 'bell-shaking' : ''}`}>notifications</span>
            {unreadCount > 0 && <span className="topbar-badge-notif" />}
          </button>

          {isNotifOpen && (
            <div className="notif-dropdown">
              {/* HEADER */}
              <div className="notif-dropdown-header">
                {selectedAnn ? (
                  <button className="notif-back-btn" onClick={handleBackToList}>
                    <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>arrow_back</span>
                    <span>Duyurular</span>
                  </button>
                ) : (
                  <>
                    <div className="notif-header-left">
                      <span className="material-symbols-outlined notif-header-icon">notifications</span>
                      <span className="notif-header-title">Duyurular</span>
                      {unreadCount > 0 && <span className="notif-header-count">{unreadCount}</span>}
                    </div>
                    {unreadCount > 0 && (
                      <button className="notif-mark-all-btn" onClick={markAllAsRead}>
                        <span className="material-symbols-outlined" style={{ fontSize: '14px' }}>done_all</span>
                        <span>Tümünü Oku</span>
                      </button>
                    )}
                  </>
                )}
              </div>

              {/* CONTENT */}
              {selectedAnn ? (
                /* DETAY GÖRÜNÜMÜ */
                <div className="notif-detail-view">
                  <div className="notif-detail-badges">
                    {selectedAnn.pinned && (
                      <span className="notif-badge-pinned">
                        <span className="material-symbols-outlined" style={{ fontSize: '12px' }}>push_pin</span>
                        Sabitlendi
                      </span>
                    )}
                    <span className="notif-badge-target">
                      <span className="material-symbols-outlined" style={{ fontSize: '12px' }}>group</span>
                      {selectedAnn.target}
                    </span>
                  </div>
                  <h4 className="notif-detail-title">{selectedAnn.title}</h4>
                  <div className="notif-detail-date">
                    <span className="material-symbols-outlined" style={{ fontSize: '14px' }}>calendar_today</span>
                    <span>{selectedAnn.date}</span>
                  </div>
                  <div className="notif-detail-divider" />
                  <p className="notif-detail-body">{selectedAnn.body || selectedAnn.content}</p>
                </div>
              ) : (
                /* LİSTE GÖRÜNÜMÜ */
                <div className="notif-list-view">
                  {filteredAnnouncements.length === 0 ? (
                    <div className="notif-empty-state">
                      <span className="material-symbols-outlined notif-empty-icon">notifications_off</span>
                      <p>Henüz duyuru bulunmuyor.</p>
                    </div>
                  ) : (
                    filteredAnnouncements.map((ann) => {
                      const isRead = readIds.includes(String(ann.id))
                      return (
                        <div
                          key={ann.id}
                          className={`notif-list-item ${isRead ? 'notif-read' : 'notif-unread'}`}
                          onClick={() => handleAnnClick(ann)}
                        >
                          <div className="notif-item-indicator">
                            {!isRead && <span className="notif-unread-dot" />}
                          </div>
                          <div className="notif-item-content">
                            <div className="notif-item-top">
                              <span className="notif-item-title">{ann.title}</span>
                              {ann.pinned && (
                                <span className="notif-item-pin">
                                  <span className="material-symbols-outlined" style={{ fontSize: '11px' }}>push_pin</span>
                                </span>
                              )}
                            </div>
                            <p className="notif-item-preview">{(ann.body || ann.content || '').slice(0, 80)}{(ann.body || ann.content || '').length > 80 ? '...' : ''}</p>
                            <span className="notif-item-date">{ann.date}</span>
                          </div>
                        </div>
                      )
                    })
                  )}
                </div>
              )}
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

        <div className="relative animate-fade-in" ref={profileRef}>
          <div
            className="topbar-profile-box cursor-pointer"
            onClick={() => setIsProfileOpen(!isProfileOpen)}
            title="Kullanıcı Menüsü"
          >
            <div className="topbar-profile-text">
              <p className="topbar-profile-name">{userName}</p>
              {userId && <p className="topbar-profile-id">{userId}</p>}
            </div>
            <div className="topbar-profile-avatar">
              {currentUser?.photo ? (
                <img
                  src={currentUser.photo}
                  alt={userName}
                  className="w-full h-full object-cover rounded-full"
                />
              ) : (
                <div className="topbar-avatar-initial w-full h-full flex items-center justify-center">
                  {userName.charAt(0)}
                </div>
              )}
            </div>
          </div>

          {isProfileOpen && (
            <div className="absolute right-0 mt-3 w-52 bg-white border border-slate-200 rounded-xl shadow-xl z-50 p-2 flex flex-col gap-1">
              <div className="px-3 py-1.5 text-[10px] font-bold text-slate-400 uppercase tracking-wider border-b border-slate-100 mb-1">
                Kullanıcı Paneli
              </div>
              <button
                onClick={() => {
                  setIsProfileOpen(false)
                  navigate(role === 'student' ? '/student/profile' : role === 'teacher' ? '/teacher/profile' : '/dean/profile')
                }}
                className="w-full text-left px-3 py-2 text-xs text-slate-700 hover:bg-slate-50 hover:text-blue-600 rounded-lg transition-all flex items-center gap-2 cursor-pointer border-none bg-transparent"
              >
                <span className="material-symbols-outlined text-base">person</span>
                <span>Profil Bilgileri</span>
              </button>
              <button
                onClick={() => {
                  setIsProfileOpen(false)
                  handleLogout()
                }}
                className="w-full text-left px-3 py-2 text-xs text-red-600 hover:bg-red-50 rounded-lg transition-all flex items-center gap-2 cursor-pointer border-none bg-transparent"
              >
                <span className="material-symbols-outlined text-base">logout</span>
                <span>Çıkış Yap</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
    </>
  )
}