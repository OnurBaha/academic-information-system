export default function ApprovalCenter() {
  return (
    <section className="app-page-canvas">
      <div className="app-page-header">
        <h2 className="app-page-title">Onay &amp; Bildirim Merkezi</h2>
        <span className="app-badge-pending">
          3 Bekleyen Onay
        </span>
      </div>

      <div className="app-list-container">
        <div className="app-approval-card">
          <div className="app-card-header">
            <div>
              <div className="app-card-meta-line">
                <span className="app-priority-red">Yüksek Öncelik</span>
                <h4 className="app-card-title">Müfredat Güncellemesi</h4>
              </div>
              <p className="app-card-desc">Mobil Geliştirme dersine 2 AKTS eklenecek.</p>
            </div>
          </div>
          <div className="app-card-footer">
            <div className="app-footer-meta">
              <span className="app-meta-item">
                <span className="material-symbols-outlined">person</span>
                <span>Dr. Elif Soylu</span>
              </span>
              <span className="app-meta-item">
                <span className="material-symbols-outlined">calendar_today</span>
                <span>02.07.2024</span>
              </span>
            </div>
            <div className="app-actions-row">
              <button className="app-btn-reject">Reddet</button>
              <button className="app-btn-approve">
                <span className="material-symbols-outlined">check</span>
                <span>Onayla</span>
              </button>
            </div>
          </div>
        </div>

        <div className="app-approval-card">
          <div className="app-card-header">
            <div>
              <div className="app-card-meta-line">
                <span className="app-priority-orange">Orta Öncelik</span>
                <h4 className="app-card-title">Staj Onayı</h4>
              </div>
              <p className="app-card-desc">Can Demir – TechCorp A.Ş. staj belgesi onayı.</p>
            </div>
          </div>
          <div className="app-card-footer">
            <div className="app-footer-meta">
              <span className="app-meta-item">
                <span className="material-symbols-outlined">person</span>
                <span>Öğr. Bürosu</span>
              </span>
              <span className="app-meta-item">
                <span className="material-symbols-outlined">calendar_today</span>
                <span>01.07.2024</span>
              </span>
            </div>
            <div className="app-actions-row">
              <button className="app-btn-reject">Reddet</button>
              <button className="app-btn-approve">
                <span className="material-symbols-outlined">check</span>
                <span>Onayla</span>
              </button>
            </div>
          </div>
        </div>

        <div className="app-approval-card">
          <div className="app-card-header">
            <div>
              <div className="app-card-meta-line">
                <span className="app-priority-green">Düşük Öncelik</span>
                <h4 className="app-card-title">Not İtirazı</h4>
              </div>
              <p className="app-card-desc">FIZ102 final notu itirazı.</p>
            </div>
          </div>
          <div className="app-card-footer">
            <div className="app-footer-meta">
              <span className="app-meta-item">
                <span className="material-symbols-outlined">person</span>
                <span>Seda Kaya</span>
              </span>
              <span className="app-meta-item">
                <span className="material-symbols-outlined">calendar_today</span>
                <span>30.06.2024</span>
              </span>
            </div>
            <div className="app-actions-row">
              <button className="app-btn-reject">Reddet</button>
              <button className="app-btn-approve">
                <span className="material-symbols-outlined">check</span>
                <span>Onayla</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
