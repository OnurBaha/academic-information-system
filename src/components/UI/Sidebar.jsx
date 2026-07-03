import { Link, useLocation } from 'react-router-dom'

export default function Sidebar({ role = 'student' }) {
  const location = useLocation()

  return (
    <aside className="sidebar-container">
      <div className="sidebar-header">
        <div className="sidebar-logo">
          <span className="material-symbols-outlined">school</span>
        </div>
        <div className="sidebar-brand">
          <p className="sidebar-brand-name">AIS</p>
          <p className="sidebar-brand-sub">Academic System</p>
        </div>
      </div>

      <nav className="sidebar-nav">
        {role === 'student' && (
          <>
            <Link to="/student/dashboard" className={location.pathname === '/student/dashboard' ? 'sidebar-item-active' : 'sidebar-item'}>
              <span className="material-symbols-outlined">dashboard</span>
              <span>Panel</span>
            </Link>
            <Link to="/student/courses" className={location.pathname === '/student/courses' ? 'sidebar-item-active' : 'sidebar-item'}>
              <span className="material-symbols-outlined">menu_book</span>
              <span>Derslerim</span>
            </Link>
            <Link to="/student/grades" className={location.pathname === '/student/grades' ? 'sidebar-item-active' : 'sidebar-item'}>
              <span className="material-symbols-outlined">grade</span>
              <span>Notlarım</span>
            </Link>
            <Link to="/student/schedule" className={location.pathname === '/student/schedule' ? 'sidebar-item-active' : 'sidebar-item'}>
              <span className="material-symbols-outlined">event_available</span>
              <span>Devamsızlık</span>
            </Link>
            <Link to="/student/documents" className={location.pathname === '/student/documents' ? 'sidebar-item-active' : 'sidebar-item'}>
              <span className="material-symbols-outlined">calendar_month</span>
              <span>Belgeler</span>
            </Link>
          </>
        )}

        {role === 'teacher' && (
          <>
            <Link to="/teacher/dashboard" className={location.pathname === '/teacher/dashboard' ? 'sidebar-item-active' : 'sidebar-item'}>
              <span className="material-symbols-outlined">dashboard</span>
              <span>Dashboard</span>
            </Link>
            <Link to="/teacher/grades" className={location.pathname === '/teacher/grades' ? 'sidebar-item-active' : 'sidebar-item'}>
              <span className="material-symbols-outlined">edit_note</span>
              <span>Not Girişi</span>
            </Link>
            <Link to="/teacher/attendance" className={location.pathname === '/teacher/attendance' ? 'sidebar-item-active' : 'sidebar-item'}>
              <span className="material-symbols-outlined">fact_check</span>
              <span>Yoklama</span>
            </Link>
            <Link to="/teacher/homework" className={location.pathname === '/teacher/homework' ? 'sidebar-item-active' : 'sidebar-item'}>
              <span className="material-symbols-outlined">assignment</span>
              <span>Ödevler</span>
            </Link>
            <Link to="/teacher/announcements" className={location.pathname === '/teacher/announcements' ? 'sidebar-item-active' : 'sidebar-item'}>
              <span className="material-symbols-outlined">notifications_active</span>
              <span>Duyurular</span>
            </Link>
          </>
        )}

        {role === 'dean' && (
          <>
            <Link to="/dean/overview" className={location.pathname === '/dean/overview' ? 'sidebar-item-active' : 'sidebar-item'}>
              <span className="material-symbols-outlined">dashboard</span>
              <span>Panel</span>
            </Link>
            <Link to="/dean/curriculum" className={location.pathname === '/dean/curriculum' ? 'sidebar-item-active' : 'sidebar-item'}>
              <span className="material-symbols-outlined">menu_book</span>
              <span>Müfredat</span>
            </Link>
            <Link to="/dean/faculty" className={location.pathname === '/dean/faculty' ? 'sidebar-item-active' : 'sidebar-item'}>
              <span className="material-symbols-outlined">groups</span>
              <span>Kadro</span>
            </Link>
            <Link to="/dean/analytics" className={location.pathname === '/dean/analytics' ? 'sidebar-item-active' : 'sidebar-item'}>
              <span className="material-symbols-outlined">analytics</span>
              <span>Analitik</span>
            </Link>
            <Link to="/dean/approvals" className={location.pathname === '/dean/approvals' ? 'sidebar-item-active' : 'sidebar-item'}>
              <span className="material-symbols-outlined">approval</span>
              <span>Onaylar</span>
            </Link>
          </>
        )}
      </nav>

      <div className="sidebar-footer">
        <button className="sidebar-btn-support">
          <span className="material-symbols-outlined">support_agent</span>
          <span>Destek Talebi</span>
        </button>
        <div className="sidebar-btn-divider">
          <Link to="/login" className="sidebar-btn-logout">
            <span className="material-symbols-outlined">logout</span>
            <span>Çıkış Yap</span>
          </Link>
        </div>
      </div>
    </aside>
  )
}
