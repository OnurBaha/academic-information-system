export default function CourseReg() {
  return (
    <section className="reg-page-canvas">
      <div className="reg-page-header">
        <div>
          <h2 className="reg-page-title">Ders Kayıt &amp; Harç İşlemleri</h2>
          <p className="reg-page-subtitle">Dönem ders seçimini yap ve AKTS limitini takip et.</p>
        </div>
        <div className="reg-header-actions">
          <button className="reg-btn-filter">
            <span className="material-symbols-outlined">filter_list</span>
            <span>Filtrele</span>
          </button>
        </div>
      </div>

      <div className="reg-main-layout">
        <div className="reg-left-column">
          <h3 className="reg-section-title">Mevcut Dersler</h3>
          
          <div className="reg-courses-list">
            <div className="reg-course-row">
              <div className="reg-course-info">
                <div className="reg-course-title-line">
                  <p className="reg-course-name">MOB401 — Mobil Geliştirme (Flutter)</p>
                  <span className="reg-course-tag">Yazılım</span>
                </div>
                <p className="reg-course-inst">Dr. Cem Kaya</p>
                <div className="reg-course-meta">
                  <span><strong>6</strong> AKTS</span>
                  <span>Kontenjan: 24/30</span>
                </div>
              </div>
              <button className="reg-btn-add">
                <span className="material-symbols-outlined">add</span>
                <span>Ekle</span>
              </button>
            </div>

            <div className="reg-course-row">
              <div className="reg-course-info">
                <div className="reg-course-title-line">
                  <p className="reg-course-name">CYB302 — Cyber Security 101</p>
                  <span className="reg-course-tag">Güvenlik</span>
                </div>
                <p className="reg-course-inst">Dr. Elif Demir</p>
                <div className="reg-course-meta">
                  <span><strong>4</strong> AKTS</span>
                  <span>Kontenjan: 15/25</span>
                </div>
              </div>
              <button className="reg-btn-add">
                <span className="material-symbols-outlined">add</span>
                <span>Ekle</span>
              </button>
            </div>

            <div className="reg-course-row">
              <div className="reg-course-info">
                <div className="reg-course-title-line">
                  <p className="reg-course-name">AI501 — Python &amp; Machine Learning</p>
                  <span className="reg-course-tag">AI</span>
                  <span className="reg-course-tag">Yazılım</span>
                </div>
                <p className="reg-course-inst">Prof. Mert Can</p>
                <div className="reg-course-meta">
                  <span><strong>7</strong> AKTS</span>
                  <span>Kontenjan: 10/20</span>
                </div>
              </div>
              <button className="reg-btn-add">
                <span className="material-symbols-outlined">add</span>
                <span>Ekle</span>
              </button>
            </div>

            <div className="reg-course-row">
              <div className="reg-course-info">
                <div className="reg-course-title-line">
                  <p className="reg-course-name">UX201 — UI/UX Tasarım Temelleri</p>
                  <span className="reg-course-tag">Tasarım</span>
                </div>
                <p className="reg-course-inst">Uzm. Seda Ak</p>
                <div className="reg-course-meta">
                  <span><strong>3</strong> AKTS</span>
                  <span>Kontenjan: 28/30</span>
                </div>
              </div>
              <button className="reg-btn-add">
                <span className="material-symbols-outlined">add</span>
                <span>Ekle</span>
              </button>
            </div>
          </div>
        </div>

        <div className="reg-right-column">
          <div className="reg-cart-card">
            <h3 className="reg-cart-title">Ders Sepetim</h3>
            
            <div className="reg-cart-progress-box">
              <div className="reg-cart-progress-labels">
                <span className="reg-cart-progress-title">AKTS Kullanımı</span>
                <span className="reg-cart-progress-value">13 / 30</span>
              </div>
              <div className="reg-cart-progress-bar">
                <div className="reg-cart-progress-fill" />
              </div>
            </div>

            <div className="reg-cart-items-list">
              <div className="reg-cart-item">
                <div className="reg-cart-item-info">
                  <p className="reg-cart-item-name">Mobil Geliştirme (Flutter)</p>
                  <p className="reg-cart-item-code">MOB401 · 6 AKTS</p>
                </div>
                <button className="reg-btn-remove">
                  <span className="material-symbols-outlined">remove_circle</span>
                </button>
              </div>

              <div className="reg-cart-item">
                <div className="reg-cart-item-info">
                  <p className="reg-cart-item-name">Python &amp; Machine Learning</p>
                  <p className="reg-cart-item-code">AI501 · 7 AKTS</p>
                </div>
                <button className="reg-btn-remove">
                  <span className="material-symbols-outlined">remove_circle</span>
                </button>
              </div>
            </div>

            <div className="reg-cart-total-box">
              <div className="reg-cart-total-row">
                <span className="reg-cart-total-label">Toplam Ders</span>
                <strong className="reg-cart-total-value">2</strong>
              </div>
              <div className="reg-cart-total-row">
                <span className="reg-cart-total-label">Toplam AKTS</span>
                <strong className="reg-cart-total-value">13</strong>
              </div>
            </div>

            <button className="reg-btn-confirm">Kaydı Tamamla</button>

            <div className="reg-tuition-card">
              <div className="reg-tuition-header">
                <span className="material-symbols-outlined">payments</span>
                <p className="reg-tuition-title">Harç Durumu</p>
              </div>
              <p className="reg-tuition-status">2023-2024 Güz dönemi harcı ödendi.</p>
              <span className="reg-tuition-check">✓ Onaylandı</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
