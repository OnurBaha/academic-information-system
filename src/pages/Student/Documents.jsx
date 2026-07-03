export default function Documents() {
  return (
    <section className="doc-page-canvas">
      <div className="doc-main-layout">
        <div className="doc-left-column">
          <div className="doc-header-row">
            <h2 className="doc-page-title">Belge Talepleri</h2>
            <button className="doc-btn-new">
              <span className="material-symbols-outlined">add</span>
              <span>Yeni Talep</span>
            </button>
          </div>

          <div className="doc-list-container">
            <div className="doc-request-card">
              <div className="doc-card-left">
                <div className="doc-icon-wrapper">
                  <span className="material-symbols-outlined">description</span>
                </div>
                <div>
                  <p className="doc-card-title">Öğrenci Belgesi</p>
                  <p className="doc-card-desc">E-imzalı resmi öğrenci belgesi</p>
                  <p className="doc-card-date">Talep Tarihi: 02.07.2024</p>
                </div>
              </div>
              <div className="doc-card-right">
                <span className="doc-status-ready">Hazır</span>
                <button className="doc-btn-download">
                  <span className="material-symbols-outlined">download</span>
                </button>
              </div>
            </div>

            <div className="doc-request-card">
              <div className="doc-card-left">
                <div className="doc-icon-wrapper">
                  <span className="material-symbols-outlined">description</span>
                </div>
                <div>
                  <p className="doc-card-title">Transkript</p>
                  <p className="doc-card-desc">Güncel dönem transkripti</p>
                  <p className="doc-card-date">Talep Tarihi: 28.06.2024</p>
                </div>
              </div>
              <div className="doc-card-right">
                <span className="doc-status-pending">Hazırlanıyor</span>
              </div>
            </div>

            <div className="doc-request-card">
              <div className="doc-card-left">
                <div className="doc-icon-wrapper">
                  <span className="material-symbols-outlined">description</span>
                </div>
                <div>
                  <p className="doc-card-title">Staj Belgesi</p>
                  <p className="doc-card-desc">Yaz stajı onay belgesi</p>
                  <p className="doc-card-date">Talep Tarihi: 15.06.2024</p>
                </div>
              </div>
              <div className="doc-card-right">
                <span className="doc-status-ready">Hazır</span>
                <button className="doc-btn-download">
                  <span className="material-symbols-outlined">download</span>
                </button>
              </div>
            </div>

            <div className="doc-request-card">
              <div className="doc-card-left">
                <div className="doc-icon-wrapper">
                  <span className="material-symbols-outlined">description</span>
                </div>
                <div>
                  <p className="doc-card-title">Askerlik Tecil Belgesi</p>
                  <p className="doc-card-desc">Askerlik tecil işlemleri için belge</p>
                  <p className="doc-card-date">Talep Tarihi: 10.06.2024</p>
                </div>
              </div>
              <div className="doc-card-right">
                <span className="doc-status-pending">Hazırlanıyor</span>
              </div>
            </div>
          </div>
        </div>

        <div className="doc-right-column">
          <div className="doc-qr-card">
            <h4 className="doc-qr-title">QR Doğrulama</h4>
            <div className="doc-qr-box">
              <span className="material-symbols-outlined">qr_code_2</span>
              <p className="doc-qr-desc">Belge hazır olduğunda QR kodu burada görünecektir.</p>
            </div>
            <p className="doc-qr-footer">Belgeyi doğrulamak için QR kodu okutun veya link ile kontrol edin.</p>
          </div>

          <div className="doc-certs-card">
            <h4 className="doc-certs-title">Sertifikalarım</h4>
            <div className="doc-certs-list">
              <div className="doc-cert-item">
                <span className="material-symbols-outlined">workspace_premium</span>
                <div className="doc-cert-info">
                  <p className="doc-cert-name">React Developer</p>
                  <p className="doc-cert-meta">SoftIto · Mar 2024</p>
                </div>
                <button className="doc-btn-download-cert">
                  <span className="material-symbols-outlined">download</span>
                </button>
              </div>

              <div className="doc-cert-item">
                <span className="material-symbols-outlined">workspace_premium</span>
                <div className="doc-cert-info">
                  <p className="doc-cert-name">.NET Foundations</p>
                  <p className="doc-cert-meta">SoftIto · Jan 2024</p>
                </div>
                <button className="doc-btn-download-cert">
                  <span className="material-symbols-outlined">download</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
