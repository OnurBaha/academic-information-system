export default function TopAppBar({ role = 'student', userName = 'Ahmet Yılmaz', userId = '20211024032' }) {
  return (
    <header className="topbar-container">
      <div className="topbar-left-side">
        <button className="topbar-btn-menu">
          <span className="material-symbols-outlined">menu</span>
        </button>
        <div className="topbar-search-box">
          <span className="material-symbols-outlined">search</span>
          <input className="topbar-search-input" type="text" placeholder="Arama yapın..." readOnly />
        </div>
      </div>

      <div className="topbar-right-side">
        <div className="topbar-badge-role">
          <span className="topbar-dot-role" />
          <span>Role: {role === 'student' ? 'Öğrenci' : role === 'teacher' ? 'Akademisyen' : 'Dekan'}</span>
        </div>

        <button className="topbar-btn-notif">
          <span className="material-symbols-outlined">notifications</span>
          <span className="topbar-badge-notif" />
        </button>

        <button className="topbar-btn-settings">
          <span className="material-symbols-outlined">settings</span>
        </button>

        <div className="topbar-dev-divider" />

        <div className="topbar-profile-box">
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
