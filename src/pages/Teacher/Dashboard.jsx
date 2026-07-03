export default function TeacherDashboard() {
  return (
    <section className="teacher-page-canvas">
      <div className="teacher-banner-card">
        <div className="teacher-banner-content">
          <span className="teacher-banner-tag">Hoş Geldiniz</span>
          <h2 className="teacher-banner-title">Hoş geldiniz, Dr. Ahmet Yılmaz</h2>
          <p className="teacher-banner-desc">
            Bugün planlanmış <strong>2 canlı dersiniz</strong> var. Öğrencileriniz dijital sınıflarda sizi bekliyor.
          </p>
          <div>
            <button className="teacher-btn-start">
              <span className="material-symbols-outlined">play_circle</span>
              <span>Yayını Başlat</span>
            </button>
          </div>
        </div>
        <div className="teacher-banner-deco">
          <span className="material-symbols-outlined">school</span>
        </div>
      </div>

      <div className="teacher-kpis-grid">
        <div className="teacher-kpi-card">
          <div className="teacher-kpi-header">
            <div className="teacher-kpi-icon-blue">
              <span className="material-symbols-outlined">groups</span>
            </div>
            <span className="teacher-badge-green">+3 yeni</span>
          </div>
          <div className="teacher-kpi-body">
            <p className="teacher-kpi-label">Toplam Öğrenci Sayısı</p>
            <h3 className="teacher-kpi-value">128</h3>
          </div>
        </div>

        <div className="teacher-kpi-card">
          <div className="teacher-kpi-header">
            <div className="teacher-kpi-icon-red">
              <span className="material-symbols-outlined">assignment_late</span>
            </div>
            <span className="teacher-badge-red">Önemli</span>
          </div>
          <div className="teacher-kpi-body">
            <p className="teacher-kpi-label">Okunmamış Ödev</p>
            <h3 className="teacher-kpi-value-red">14</h3>
          </div>
        </div>

        <div className="teacher-kpi-card">
          <div className="teacher-kpi-header">
            <div className="teacher-kpi-icon-blue">
              <span className="material-symbols-outlined">event_busy</span>
            </div>
          </div>
          <div className="teacher-kpi-body">
            <p className="teacher-kpi-label">Devamsızlık Ortalaması</p>
            <h3 className="teacher-kpi-value">%8</h3>
          </div>
        </div>

        <div className="teacher-kpi-card">
          <div className="teacher-kpi-header">
            <div className="teacher-kpi-icon-blue">
              <span className="material-symbols-outlined">video_library</span>
            </div>
            <span className="teacher-badge-green">↑ 12%</span>
          </div>
          <div className="teacher-kpi-body">
            <p className="teacher-kpi-label">Tamamlanan Canlı Ders</p>
            <h3 className="teacher-kpi-value">45 Saat</h3>
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
                <button className="teacher-btn-arrow">
                  <span className="material-symbols-outlined">chevron_left</span>
                </button>
                <button className="teacher-btn-arrow">
                  <span className="material-symbols-outlined">chevron_right</span>
                </button>
              </div>
            </div>
            
            <div className="teacher-schedule-list">
              <div className="teacher-schedule-row">
                <div className="teacher-schedule-left">
                  <div className="teacher-time-chip-active">
                    <span className="teacher-time-day">BUGÜN</span>
                    <span className="teacher-time-hour">14:00</span>
                  </div>
                  <div>
                    <h4 className="teacher-course-name">Advanced React Context API</h4>
                    <p className="teacher-course-duration">
                      <span className="material-symbols-outlined">schedule</span>
                      <span>90 Dakika · Grup A</span>
                    </p>
                  </div>
                </div>
                <div className="teacher-schedule-actions">
                  <button className="teacher-btn-prep">Hazırlan</button>
                  <button className="teacher-btn-stream">
                    <span className="material-symbols-outlined">sensors</span>
                    <span>Yayını Başlat</span>
                  </button>
                </div>
              </div>

              <div className="teacher-schedule-row">
                <div className="teacher-schedule-left">
                  <div className="teacher-time-chip-inactive">
                    <span className="teacher-time-day">BUGÜN</span>
                    <span className="teacher-time-hour">16:30</span>
                  </div>
                  <div>
                    <h4 className="teacher-course-name">Node.js Express Middleware</h4>
                    <p className="teacher-course-duration">
                      <span className="material-symbols-outlined">schedule</span>
                      <span>60 Dakika · Grup B</span>
                    </p>
                  </div>
                </div>
                <div className="teacher-schedule-actions">
                  <button className="teacher-btn-prep">Materyalleri Düzenle</button>
                </div>
              </div>

              <div className="teacher-schedule-row">
                <div className="teacher-schedule-left">
                  <div className="teacher-time-chip-inactive">
                    <span className="teacher-time-day">YARIN</span>
                    <span className="teacher-time-hour">10:00</span>
                  </div>
                  <div>
                    <h4 className="teacher-course-name">Database Schema Design</h4>
                    <p className="teacher-course-duration">
                      <span className="material-symbols-outlined">schedule</span>
                      <span>120 Dakika · Tüm Gruplar</span>
                    </p>
                  </div>
                </div>
                <div className="teacher-schedule-actions">
                  <button className="teacher-btn-prep">Materyalleri Düzenle</button>
                </div>
              </div>
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
            <button className="teacher-btn-activities">Tümünü Gör</button>
          </div>

          <div className="teacher-growth-card">
            <div className="teacher-growth-deco">
              <span className="material-symbols-outlined">analytics</span>
            </div>
            <h4 className="teacher-growth-title">Gelişim Analizi</h4>
            <p className="teacher-growth-desc">Bu ay genel sınıf başarısı %12 arttı.</p>
            <div className="teacher-growth-bar-box">
              <div className="teacher-growth-bar">
                <div className="teacher-growth-fill" />
              </div>
              <span className="teacher-growth-percent">75%</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
