export default function Faculty() {
  return (
    <section className="fac-page-canvas">
      <h2 className="fac-page-title">Akademik Kadro Analitik</h2>

      <div className="fac-cards-grid">
        <div className="fac-instructor-card">
          <div className="fac-card-header">
            <div className="fac-avatar">S</div>
            <div>
              <p className="fac-name">Dr. Elif Soylu</p>
              <p className="fac-dept">Yazılım Mühendisliği</p>
            </div>
          </div>
          <div className="fac-stats-grid">
            <div className="fac-stat-box">
              <p className="fac-stat-value">3</p>
              <p className="fac-stat-label">Dersler</p>
            </div>
            <div className="fac-stat-box">
              <p className="fac-stat-value">96</p>
              <p className="fac-stat-label">Öğrenci</p>
            </div>
            <div className="fac-stat-box">
              <p className="fac-stat-value">4.9</p>
              <p className="fac-stat-label">Puan</p>
            </div>
          </div>
          <div className="fac-workload-box">
            <div className="fac-workload-labels">
              <span className="fac-workload-text">Ders Yükü</span>
              <span className="fac-workload-percent">%85</span>
            </div>
            <div className="fac-workload-bar">
              <div className="fac-workload-fill-orange" />
            </div>
          </div>
        </div>

        <div className="fac-instructor-card">
          <div className="fac-card-header">
            <div className="fac-avatar">A</div>
            <div>
              <p className="fac-name">Doç. Dr. Mert Akın</p>
              <p className="fac-dept">Veri Bilimi</p>
            </div>
          </div>
          <div className="fac-stats-grid">
            <div className="fac-stat-box">
              <p className="fac-stat-value">2</p>
              <p className="fac-stat-label">Dersler</p>
            </div>
            <div className="fac-stat-box">
              <p className="fac-stat-value">64</p>
              <p className="fac-stat-label">Öğrenci</p>
            </div>
            <div className="fac-stat-box">
              <p className="fac-stat-value">4.7</p>
              <p className="fac-stat-label">Puan</p>
            </div>
          </div>
          <div className="fac-workload-box">
            <div className="fac-workload-labels">
              <span className="fac-workload-text">Ders Yükü</span>
              <span className="fac-workload-percent">%65</span>
            </div>
            <div className="fac-workload-bar">
              <div className="fac-workload-fill-blue" />
            </div>
          </div>
        </div>

        <div className="fac-instructor-card">
          <div className="fac-card-header">
            <div className="fac-avatar">K</div>
            <div>
              <p className="fac-name">Dr. Cem Kaya</p>
              <p className="fac-dept">Mobil Geliştirme</p>
            </div>
          </div>
          <div className="fac-stats-grid">
            <div className="fac-stat-box">
              <p className="fac-stat-value">2</p>
              <p className="fac-stat-label">Dersler</p>
            </div>
            <div className="fac-stat-box">
              <p className="fac-stat-value">48</p>
              <p className="fac-stat-label">Öğrenci</p>
            </div>
            <div className="fac-stat-box">
              <p className="fac-stat-value">4.6</p>
              <p className="fac-stat-label">Puan</p>
            </div>
          </div>
          <div className="fac-workload-box">
            <div className="fac-workload-labels">
              <span className="fac-workload-text">Ders Yükü</span>
              <span className="fac-workload-percent">%55</span>
            </div>
            <div className="fac-workload-bar">
              <div className="fac-workload-fill-blue" />
            </div>
          </div>
        </div>

        <div className="fac-instructor-card">
          <div className="fac-card-header">
            <div className="fac-avatar">D</div>
            <div>
              <p className="fac-name">Prof. Seda Demir</p>
              <p className="fac-dept">Siber Güvenlik</p>
            </div>
          </div>
          <div className="fac-stats-grid">
            <div className="fac-stat-box">
              <p className="fac-stat-value">1</p>
              <p className="fac-stat-label">Dersler</p>
            </div>
            <div className="fac-stat-box">
              <p className="fac-stat-value">32</p>
              <p className="fac-stat-label">Öğrenci</p>
            </div>
            <div className="fac-stat-box">
              <p className="fac-stat-value">4.5</p>
              <p className="fac-stat-label">Puan</p>
            </div>
          </div>
          <div className="fac-workload-box">
            <div className="fac-workload-labels">
              <span className="fac-workload-text">Ders Yükü</span>
              <span className="fac-workload-percent">%40</span>
            </div>
            <div className="fac-workload-bar">
              <div className="fac-workload-fill-blue" />
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
