export default function StudentAnalytics() {
  return (
    <section className="an-page-canvas">
      <h2 className="an-page-title">Öğrenci Analitiği &amp; İstihdam</h2>

      <div className="an-main-grid">
        <div className="an-success-card">
          <h4 className="an-card-title">Mezuniyet Başarı Dağılımı</h4>
          <div className="an-success-list">
            <div>
              <div className="an-success-meta">
                <span className="an-success-label">Onur Öğrencisi (3.50+)</span>
                <span className="an-success-count-green">148</span>
              </div>
              <div className="an-bar-outer">
                <div className="an-bar-fill-green" />
              </div>
            </div>

            <div>
              <div className="an-success-meta">
                <span className="an-success-label">Yüksek Başarı (3.00-3.49)</span>
                <span className="an-success-count-blue">89</span>
              </div>
              <div className="an-bar-outer">
                <div className="an-bar-fill-blue" />
              </div>
            </div>

            <div>
              <div className="an-success-meta">
                <span className="an-success-label">Orta Başarı (2.00-2.99)</span>
                <span className="an-success-count-orange">63</span>
              </div>
              <div className="an-bar-outer">
                <div className="an-bar-fill-orange" />
              </div>
            </div>
          </div>
        </div>

        <div className="an-sectors-card">
          <h4 className="an-card-title">İstihdam Sektörleri</h4>
          <div className="an-sectors-list">
            <div className="an-sector-row">
              <span className="an-sector-dot-navy" />
              <span className="an-sector-name">Yazılım Geliştirme</span>
              <span className="an-sector-percent">48%</span>
            </div>

            <div className="an-sector-row">
              <span className="an-sector-dot-blue" />
              <span className="an-sector-name">Veri / AI</span>
              <span className="an-sector-percent">22%</span>
            </div>

            <div className="an-sector-row">
              <span className="an-sector-dot-green" />
              <span className="an-sector-name">Siber Güvenlik</span>
              <span className="an-sector-percent">14%</span>
            </div>

            <div className="an-sector-row">
              <span className="an-sector-dot-orange" />
              <span className="an-sector-name">Mobil / Oyun</span>
              <span className="an-sector-percent">10%</span>
            </div>

            <div className="an-sector-row">
              <span className="an-sector-dot-gray" />
              <span className="an-sector-name">Diğer</span>
              <span className="an-sector-percent">6%</span>
            </div>
          </div>
        </div>

        <div className="an-companies-card">
          <h4 className="an-card-title">Mezunlarımız Bu Şirketlerde Çalışıyor</h4>
          <div className="an-companies-list">
            <div className="an-company-badge">Microsoft</div>
            <div className="an-company-badge">Google</div>
            <div className="an-company-badge">Amazon</div>
            <div className="an-company-badge">Trendyol</div>
            <div className="an-company-badge">Getir</div>
            <div className="an-company-badge">Logo Software</div>
            <div className="an-company-badge">Aselsan</div>
            <div className="an-company-badge">Netaş</div>
          </div>
        </div>
      </div>
    </section>
  )
}
