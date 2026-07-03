export default function Attendance() {
  return (
    <section className="att-page-canvas">
      <div className="att-page-header">
        <div>
          <h2 className="att-page-title">Yoklama Yönetimi</h2>
          <p className="att-page-subtitle">Advanced React Context API · Bugün 14:00 · Grup A</p>
        </div>
        <button className="att-btn-save">
          <span className="material-symbols-outlined">save</span>
          <span>Yoklamayı Kaydet</span>
        </button>
      </div>

      <div className="att-stats-row">
        <div className="att-stat-chip-navy">
          <span className="att-stat-count">7</span>
          <span className="att-stat-label">Toplam</span>
        </div>
        <div className="att-stat-chip-green">
          <span className="att-stat-count">5</span>
          <span className="att-stat-label">Mevcut</span>
        </div>
        <div className="att-stat-chip-red">
          <span className="att-stat-count">2</span>
          <span className="att-stat-label">Yok</span>
        </div>
      </div>

      <div className="att-table-card">
        <div className="att-card-header">
          <button className="att-btn-bulk-green">Tümünü Mevcut İşaretle</button>
          <button className="att-btn-bulk-red">Tümünü Yok İşaretle</button>
        </div>

        <div className="att-list-container">
          <div className="att-student-row">
            <div className="att-student-left">
              <div className="att-student-avatar">C</div>
              <div>
                <p className="att-student-name">Can Demir</p>
                <p className="att-student-id">20211024001</p>
              </div>
            </div>
            <div className="att-student-right">
              <span className="att-badge-green">Mevcut</span>
              <div className="att-actions-wrap">
                <button className="att-btn-check" title="Mevcut">
                  <span className="material-symbols-outlined">check</span>
                </button>
                <button className="att-btn-absent" title="Yok">
                  <span className="material-symbols-outlined">close</span>
                </button>
              </div>
            </div>
          </div>

          <div className="att-student-row">
            <div className="att-student-left">
              <div className="att-student-avatar">S</div>
              <div>
                <p className="att-student-name">Seda Kaya</p>
                <p className="att-student-id">20211024002</p>
              </div>
            </div>
            <div className="att-student-right">
              <span className="att-badge-red">Yok</span>
              <div className="att-actions-wrap">
                <button className="att-btn-check" title="Mevcut">
                  <span className="material-symbols-outlined">check</span>
                </button>
                <button className="att-btn-absent" title="Yok">
                  <span className="material-symbols-outlined">close</span>
                </button>
              </div>
            </div>
          </div>

          <div className="att-student-row">
            <div className="att-student-left">
              <div className="att-student-avatar">B</div>
              <div>
                <p className="att-student-name">Bora Ak</p>
                <p className="att-student-id">20211024003</p>
              </div>
            </div>
            <div className="att-student-right">
              <span className="att-badge-green">Mevcut</span>
              <div className="att-actions-wrap">
                <button className="att-btn-check" title="Mevcut">
                  <span className="material-symbols-outlined">check</span>
                </button>
                <button className="att-btn-absent" title="Yok">
                  <span className="material-symbols-outlined">close</span>
                </button>
              </div>
            </div>
          </div>

          <div className="att-student-row">
            <div className="att-student-left">
              <div className="att-student-avatar">E</div>
              <div>
                <p className="att-student-name">Elif Şahin</p>
                <p className="att-student-id">20211024004</p>
              </div>
            </div>
            <div className="att-student-right">
              <span className="att-badge-green">Mevcut</span>
              <div className="att-actions-wrap">
                <button className="att-btn-check" title="Mevcut">
                  <span className="material-symbols-outlined">check</span>
                </button>
                <button className="att-btn-absent" title="Yok">
                  <span className="material-symbols-outlined">close</span>
                </button>
              </div>
            </div>
          </div>

          <div className="att-student-row">
            <div className="att-student-left">
              <div className="att-student-avatar">M</div>
              <div>
                <p className="att-student-name">Murat Yıldız</p>
                <p className="att-student-id">20211024005</p>
              </div>
            </div>
            <div className="att-student-right">
              <span className="att-badge-red">Yok</span>
              <div className="att-actions-wrap">
                <button className="att-btn-check" title="Mevcut">
                  <span className="material-symbols-outlined">check</span>
                </button>
                <button className="att-btn-absent" title="Yok">
                  <span className="material-symbols-outlined">close</span>
                </button>
              </div>
            </div>
          </div>

          <div className="att-student-row">
            <div className="att-student-left">
              <div className="att-student-avatar">A</div>
              <div>
                <p className="att-student-name">Ayşe Toprak</p>
                <p className="att-student-id">20211024006</p>
              </div>
            </div>
            <div className="att-student-right">
              <span className="att-badge-green">Mevcut</span>
              <div className="att-actions-wrap">
                <button className="att-btn-check" title="Mevcut">
                  <span className="material-symbols-outlined">check</span>
                </button>
                <button className="att-btn-absent" title="Yok">
                  <span className="material-symbols-outlined">close</span>
                </button>
              </div>
            </div>
          </div>

          <div className="att-student-row">
            <div className="att-student-left">
              <div className="att-student-avatar">K</div>
              <div>
                <p className="att-student-name">Kemal Arslan</p>
                <p className="att-student-id">20211024007</p>
              </div>
            </div>
            <div className="att-student-right">
              <span className="att-badge-gray">Belirsiz</span>
              <div className="att-actions-wrap">
                <button className="att-btn-check" title="Mevcut">
                  <span className="material-symbols-outlined">check</span>
                </button>
                <button className="att-btn-absent" title="Yok">
                  <span className="material-symbols-outlined">close</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
