import { Link } from 'react-router-dom'

export default function StudentDashboard() {
  return (
    <>
      <main className="student-main-content">
        <section className="student-page-canvas">
          <div className="student-greeting-banner">
            <div className="student-greeting-text">
              <h2 className="student-greeting-title">Hoş geldin, Ahmet Yılmaz 👋</h2>
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
                <h3 className="student-stat-value">3.52</h3>
              </div>
            </div>
            <div className="student-stat-card">
              <div className="student-stat-icon-green">
                <span className="material-symbols-outlined">task_alt</span>
              </div>
              <div className="student-stat-info">
                <p className="student-stat-label">Tamamlanan AKTS</p>
                <h3 className="student-stat-value">180 / 240</h3>
              </div>
            </div>
            <div className="student-stat-card">
              <div className="student-stat-icon-amber">
                <span className="material-symbols-outlined">event_busy</span>
              </div>
              <div className="student-stat-info">
                <p className="student-stat-label">Devamsızlık Oranı</p>
                <h3 className="student-stat-value">%8</h3>
              </div>
            </div>
          </div>

          <div className="student-dashboard-bento">
            <div className="student-left-col">
              <div className="student-section-header">
                <h3 className="student-section-title">
                  <span className="material-symbols-outlined">collections_bookmark</span>
                  <span>Kayıtlı Derslerim</span>
                </h3>
                <Link to="/student/courses" className="student-link-all">Tümünü Gör</Link>
              </div>
              
              <div className="student-courses-grid">
                <div className="student-course-card">
                  <div className="student-card-thumb-dotnet">
                    <span className="student-card-badge-blue">Mühendislik</span>
                  </div>
                  <div className="student-card-body">
                    <h4 className="student-card-title">Full-Stack .NET & React</h4>
                    <p className="student-card-instructor">Dr. Elif Soylu</p>
                    <div className="student-card-progress">
                      <div className="student-progress-labels">
                        <span className="student-progress-text">İlerleme</span>
                        <span className="student-progress-percent">%75</span>
                      </div>
                      <div className="student-progress-bar">
                        <div className="student-progress-fill-75" />
                      </div>
                      <div className="student-card-actions">
                        <Link to="/student/video" className="student-btn-vod">
                          <span className="material-symbols-outlined">play_circle</span>
                          <span>VOD Tekrarı</span>
                        </Link>
                        <button className="student-btn-doc">
                          <span className="material-symbols-outlined">description</span>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="student-course-card">
                  <div className="student-card-thumb-sql">
                    <span className="student-card-badge-amber">Veri Bilimi</span>
                  </div>
                  <div className="student-card-body">
                    <h4 className="student-card-title">SQL & Database Design</h4>
                    <p className="student-card-instructor">Doç. Dr. Mert Akın</p>
                    <div className="student-card-progress">
                      <div className="student-progress-labels">
                        <span className="student-progress-text">İlerleme</span>
                        <span className="student-progress-percent">%40</span>
                      </div>
                      <div className="student-progress-bar">
                        <div className="student-progress-fill-40" />
                      </div>
                      <div className="student-card-actions">
                        <Link to="/student/video" className="student-btn-vod">
                          <span className="material-symbols-outlined">play_circle</span>
                          <span>VOD Tekrarı</span>
                        </Link>
                        <button className="student-btn-doc">
                          <span className="material-symbols-outlined">description</span>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="student-right-col">
              <h3 className="student-section-title">
                <span className="material-symbols-outlined">schedule</span>
                <span>Yaklaşan Dersler</span>
              </h3>
              <div className="student-timeline-card">
                <div className="student-timeline-item">
                  <div className="student-timeline-dot-active" />
                  <div className="student-timeline-header">
                    <span className="student-timeline-time-blue">Bugün, 14:00</span>
                    <span className="student-timeline-live">Canlı</span>
                  </div>
                  <p className="student-timeline-name">React Redux Advanced</p>
                  <p className="student-timeline-loc">Sınıf: LAB-B3 / Online</p>
                  <button className="student-btn-join">Derse Katıl</button>
                </div>

                <div className="student-timeline-item">
                  <div className="student-timeline-dot-inactive" />
                  <div className="student-timeline-header">
                    <span className="student-timeline-time-gray">Yarın, 10:30</span>
                  </div>
                  <p className="student-timeline-name">.NET Microservices</p>
                  <p className="student-timeline-loc">Sınıf: Amfi-1 / Yüz Yüze</p>
                </div>

                <div className="student-timeline-item">
                  <div className="student-timeline-dot-inactive" />
                  <div className="student-timeline-header">
                    <span className="student-timeline-time-gray">Perşembe, 09:00</span>
                  </div>
                  <p className="student-timeline-name">System Architecture</p>
                  <p className="student-timeline-loc">Sınıf: LAB-C2</p>
                </div>

                <button className="student-btn-calendar">Tüm Takvimi İncele</button>
              </div>

              <div className="student-advisor-card">
                <div className="student-advisor-info">
                  <div className="student-advisor-avatar">S</div>
                  <div className="student-advisor-details">
                    <p className="student-advisor-title">Akademik Danışman</p>
                    <p className="student-advisor-name">Prof. Dr. Selçuk Yılmaz</p>
                  </div>
                </div>
                <button className="student-btn-appt">Randevu Al</button>
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

      <button className="student-fab-btn">
        <span className="material-symbols-outlined">chat_bubble</span>
        <span className="student-fab-tooltip">Canlı Yardım</span>
      </button>
    </>
  )
}
