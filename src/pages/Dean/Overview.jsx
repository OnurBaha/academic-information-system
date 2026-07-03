export default function DeanOverview() {
  return (
    <section className="dean-page-canvas">
      <div className="dean-header-row">
        <div>
          <h2 className="dean-page-title">Akademik Genel Bakış</h2>
          <p className="dean-page-subtitle">2023-2024 Akademik Yılı Güz Dönemi Verileri</p>
        </div>
        <div className="dean-header-actions">
          <button className="dean-btn-report">
            <span className="material-symbols-outlined">download</span>
            <span>Rapor İndir</span>
          </button>
          <button className="dean-btn-refresh">
            <span className="material-symbols-outlined">refresh</span>
            <span>Verileri Güncelle</span>
          </button>
        </div>
      </div>

      <div className="dean-metrics-grid">
        <div className="dean-metric-card-blue">
          <div className="dean-metric-text">
            <p className="dean-metric-label">Toplam Aktif Öğrenci</p>
            <h3 className="dean-metric-value">1,250</h3>
            <p className="dean-metric-trend-up">
              <span className="material-symbols-outlined">trending_up</span>
              <span>↑ Geçen yıla göre %4 artış</span>
            </p>
          </div>
          <div className="dean-metric-avatar-blue">
            <span className="material-symbols-outlined">group</span>
          </div>
        </div>

        <div className="dean-metric-card-green">
          <div className="dean-metric-text">
            <p className="dean-metric-label">İşe Yerleştirme Oranı</p>
            <h3 className="dean-metric-value">%94</h3>
            <div className="dean-metric-progress-wrap">
              <div className="dean-metric-progress-bar">
                <div className="dean-metric-progress-fill-94" />
              </div>
            </div>
          </div>
          <div className="dean-metric-avatar-green">
            <span className="material-symbols-outlined">work_history</span>
          </div>
        </div>

        <div className="dean-metric-card-amber">
          <div className="dean-metric-text">
            <p className="dean-metric-label">Eğitmen Performans Ort.</p>
            <h3 className="dean-metric-value">4.8</h3>
            <div className="dean-metric-stars-wrap">
              <span className="material-symbols-outlined">star</span>
              <span className="material-symbols-outlined">star</span>
              <span className="material-symbols-outlined">star</span>
              <span className="material-symbols-outlined">star</span>
              <span className="material-symbols-outlined">star_half</span>
            </div>
          </div>
          <div className="dean-metric-avatar-amber">
            <span className="material-symbols-outlined">psychology</span>
          </div>
        </div>
      </div>

      <div className="dean-dashboard-bento">
        <div className="dean-chart-card">
          <div className="dean-chart-header">
            <h4 className="dean-chart-title">Yazılım Branş Popülerliği</h4>
            <select className="dean-chart-select">
              <option>Tüm Bölümler</option>
              <option>Sadece Yazılım</option>
            </select>
          </div>
          <div className="dean-bar-chart">
            <div className="dean-bar-column">
              <div className="dean-bar-outer-blue">
                <div className="dean-bar-inner-85">
                  <span className="dean-bar-count">482</span>
                </div>
              </div>
              <span className="dean-bar-label">React / Frontend</span>
            </div>

            <div className="dean-bar-column">
              <div className="dean-bar-outer-navy">
                <div className="dean-bar-inner-70">
                  <span className="dean-bar-count">394</span>
                </div>
              </div>
              <span className="dean-bar-label">.NET / Backend</span>
            </div>

            <div className="dean-bar-column">
              <div className="dean-bar-outer-gray">
                <div className="dean-bar-inner-55">
                  <span className="dean-bar-count">286</span>
                </div>
              </div>
              <span className="dean-bar-label">SQL / Database</span>
            </div>

            <div className="dean-bar-column">
              <div className="dean-bar-outer-amber">
                <div className="dean-bar-inner-40">
                  <span className="dean-bar-count">185</span>
                </div>
              </div>
              <span className="dean-bar-label">Python / AI</span>
            </div>
          </div>
        </div>

        <div className="dean-curriculum-card">
          <h4 className="dean-curr-title">Müfredat Yönetimi</h4>
          <div className="dean-curr-list">
            <div className="dean-curr-item">
              <div>
                <p className="dean-curr-name">Mobil Geliştirme (Flutter)</p>
                <p className="dean-curr-meta">6 AKTS</p>
              </div>
              <button className="dean-curr-btn-edit">
                <span className="material-symbols-outlined">edit</span>
              </button>
            </div>

            <div className="dean-curr-item">
              <div>
                <p className="dean-curr-name">Cyber Security 101</p>
                <div className="dean-curr-edit-row">
                  <input type="number" defaultValue={4} className="dean-curr-input" />
                  <span className="dean-curr-input-label">AKTS</span>
                </div>
              </div>
              <button className="dean-curr-btn-edit">
                <span className="material-symbols-outlined">edit</span>
              </button>
            </div>

            <div className="dean-curr-item">
              <div>
                <p className="dean-curr-name">Full-Stack .NET &amp; React</p>
                <p className="dean-curr-meta">8 AKTS</p>
              </div>
              <button className="dean-curr-btn-edit">
                <span className="material-symbols-outlined">edit</span>
              </button>
            </div>
          </div>
          <button className="dean-curr-btn-add">
            <span className="material-symbols-outlined">add</span>
            <span>Yeni Ders Ekle</span>
          </button>
        </div>
      </div>

      <div className="dean-bottom-grid">
        <div className="dean-faculty-card">
          <div className="dean-faculty-header">
            <h4 className="dean-faculty-title">Akademik Kadro Analitik</h4>
          </div>
          <table className="dean-faculty-table">
            <thead>
              <tr>
                <th className="dean-table-th">Eğitmen</th>
                <th className="dean-table-th">Bölüm</th>
                <th className="dean-table-th-center">Dersler</th>
                <th className="dean-table-th-center">Öğrenciler</th>
                <th className="dean-table-th-center">Performans</th>
              </tr>
            </thead>
            <tbody>
              <tr className="dean-table-row">
                <td className="dean-table-td">
                  <div className="dean-instructor-box">
                    <div className="dean-instructor-avatar">S</div>
                    <span className="dean-instructor-name">Dr. Elif Soylu</span>
                  </div>
                </td>
                <td className="dean-table-td-gray">Yazılım Mühendisliği</td>
                <td className="dean-table-td-num">3</td>
                <td className="dean-table-td-num">96</td>
                <td className="dean-table-td-rating">
                  <div className="dean-rating-box">
                    <span className="material-symbols-outlined">star</span>
                    <span>4.9</span>
                  </div>
                </td>
              </tr>

              <tr className="dean-table-row">
                <td className="dean-table-td">
                  <div className="dean-instructor-box">
                    <div className="dean-instructor-avatar">A</div>
                    <span className="dean-instructor-name">Doç. Dr. Mert Akın</span>
                  </div>
                </td>
                <td className="dean-table-td-gray">Veri Bilimi</td>
                <td className="dean-table-td-num">2</td>
                <td className="dean-table-td-num">64</td>
                <td className="dean-table-td-rating">
                  <div className="dean-rating-box">
                    <span className="material-symbols-outlined">star</span>
                    <span>4.7</span>
                  </div>
                </td>
              </tr>

              <tr className="dean-table-row">
                <td className="dean-table-td">
                  <div className="dean-instructor-box">
                    <div className="dean-instructor-avatar">K</div>
                    <span className="dean-instructor-name">Dr. Cem Kaya</span>
                  </div>
                </td>
                <td className="dean-table-td-gray">Mobil Geliştirme</td>
                <td className="dean-table-td-num">2</td>
                <td className="dean-table-td-num">48</td>
                <td className="dean-table-td-rating">
                  <div className="dean-rating-box">
                    <span className="material-symbols-outlined">star</span>
                    <span>4.6</span>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <div className="dean-funnel-card">
          <h4 className="dean-funnel-title">İstihdam Hunisi</h4>
          <p className="dean-funnel-subtitle">Mezun işe yerleşme süreçleri</p>
          <div className="dean-funnel-list">
            <div className="dean-funnel-stage">
              <div className="dean-funnel-number-blue">1</div>
              <div className="dean-funnel-info">
                <div className="dean-funnel-label-row">
                  <span className="dean-funnel-stage-name">Staj</span>
                  <span className="dean-funnel-stage-count">340 kişi</span>
                </div>
                <div className="dean-funnel-bar">
                  <div className="dean-funnel-fill-90" />
                </div>
              </div>
            </div>

            <div className="dean-funnel-stage">
              <div className="dean-funnel-number-navy">2</div>
              <div className="dean-funnel-info">
                <div className="dean-funnel-label-row">
                  <span className="dean-funnel-stage-name">Mülakat</span>
                  <span className="dean-funnel-stage-count">210 kişi</span>
                </div>
                <div className="dean-funnel-bar">
                  <div className="dean-funnel-fill-60" />
                </div>
              </div>
            </div>

            <div className="dean-funnel-stage">
              <div className="dean-funnel-number-green">3</div>
              <div className="dean-funnel-info">
                <div className="dean-funnel-label-row">
                  <span className="dean-funnel-stage-name">Yerleşti</span>
                  <span className="dean-funnel-stage-count">185 kişi</span>
                </div>
                <div className="dean-funnel-bar">
                  <div className="dean-funnel-fill-48" />
                </div>
              </div>
            </div>
          </div>
          
          <div className="dean-funnel-footer">
            <p className="dean-funnel-percent">%94</p>
            <p className="dean-funnel-footer-label">Genel İşe Yerleştirme Başarısı</p>
          </div>
        </div>
      </div>
    </section>
  )
}
