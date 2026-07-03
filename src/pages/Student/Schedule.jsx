export default function StudentGrades() {
  return (
    <section className="grades-page-canvas">
      <div className="grades-page-header">
        <div>
          <h2 className="grades-page-title">Notlarım ve Akademik Durum</h2>
          <p className="grades-page-subtitle">Mevcut dönem başarı puanlarınızı ve transkript detaylarını inceleyin.</p>
        </div>
        <div className="grades-select-container">
          <label className="grades-select-label">Dönem Seç:</label>
          <div className="grades-select-wrapper">
            <select className="grades-semester-select" defaultValue="current">
              <option value="current">2023-2024 Güz</option>
              <option value="spring">2022-2023 Bahar</option>
              <option value="fall">2022-2023 Güz</option>
              <option value="all">Tüm Transkript</option>
            </select>
            <span className="material-symbols-outlined">expand_more</span>
          </div>
        </div>
      </div>

      <div className="grades-stats-row">
        <div className="grades-stat-card">
          <div className="grades-card-header">
            <div className="grades-icon-blue">
              <span className="material-symbols-outlined">school</span>
            </div>
            <span className="grades-badge-green">+0.12 ↑</span>
          </div>
          <div className="grades-card-body">
            <p className="grades-card-label">Genel Not Ortalaması</p>
            <h3 className="grades-card-value">3.42</h3>
          </div>
        </div>

        <div className="grades-stat-card">
          <div className="grades-card-header">
            <div className="grades-icon-navy">
              <span className="material-symbols-outlined">book</span>
            </div>
            <span className="grades-badge-gray">8 Ders</span>
          </div>
          <div className="grades-card-body">
            <p className="grades-card-label">Toplam AKTS</p>
            <h3 className="grades-card-value">210</h3>
          </div>
        </div>

        <div className="grades-stat-card">
          <div className="grades-card-header">
            <div className="grades-icon-amber">
              <span className="material-symbols-outlined">pending_actions</span>
            </div>
            <span className="grades-badge-gray">2 Kalan</span>
          </div>
          <div className="grades-card-body">
            <p className="grades-card-label">Başarı Durumu</p>
            <h3 className="grades-card-value">%85.4</h3>
          </div>
        </div>

        <div className="grades-stat-card">
          <div className="grades-card-header">
            <div className="grades-icon-emerald">
              <span className="material-symbols-outlined">military_tech</span>
            </div>
            <span className="grades-badge-green">Onur Belgesi</span>
          </div>
          <div className="grades-card-body">
            <p className="grades-card-label">Akademik Sıralama</p>
            <h3 className="grades-card-value">12 / 450</h3>
          </div>
        </div>
      </div>

      <div className="grades-main-layout">
        <div className="grades-left-column">
          <div className="grades-table-wrapper">
            <div className="grades-table-header">
              <h4 className="grades-table-title">Dönem Not Çizelgesi</h4>
              <button className="grades-btn-download">
                <span className="material-symbols-outlined">download</span>
                <span>PDF Olarak İndir</span>
              </button>
            </div>
            <div className="grades-table-scroll">
              <table className="grades-data-table">
                <thead>
                  <tr>
                    <th className="grades-th-left">Ders Adı</th>
                    <th className="grades-th-center">Vize</th>
                    <th className="grades-th-center">Final</th>
                    <th className="grades-th-center">Proje</th>
                    <th className="grades-th-center">Harf</th>
                    <th className="grades-th-center">AKTS</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="grades-table-row">
                    <td className="grades-td-course">
                      <p className="grades-course-code">MAT101 - Kalkülüs I</p>
                      <p className="grades-course-inst">Prof. Dr. Ahmet Yılmaz</p>
                    </td>
                    <td className="grades-td-score">85</td>
                    <td className="grades-td-score">90</td>
                    <td className="grades-td-score">-</td>
                    <td className="grades-td-badge"><span className="grades-badge-aa">AA</span></td>
                    <td className="grades-td-score">6</td>
                  </tr>
                  <tr className="grades-table-row">
                    <td className="grades-td-course">
                      <p className="grades-course-code">BIL203 - Veri Yapıları</p>
                      <p className="grades-course-inst">Doç. Dr. Elif Soylu</p>
                    </td>
                    <td className="grades-td-score">72</td>
                    <td className="grades-td-score">68</td>
                    <td className="grades-td-score">80</td>
                    <td className="grades-td-badge"><span className="grades-badge-ba">BA</span></td>
                    <td className="grades-td-score">7</td>
                  </tr>
                  <tr className="grades-table-row">
                    <td className="grades-td-course">
                      <p className="grades-course-code">FIZ102 - Genel Fizik II</p>
                      <p className="grades-course-inst">Dr. Öğr. Üyesi Cem Akın</p>
                    </td>
                    <td className="grades-td-score">55</td>
                    <td className="grades-td-score">60</td>
                    <td className="grades-td-score">-</td>
                    <td className="grades-td-badge"><span className="grades-badge-cb">CB</span></td>
                    <td className="grades-td-score">5</td>
                  </tr>
                  <tr className="grades-table-row">
                    <td className="grades-td-course">
                      <p className="grades-course-code">ING101 - Akademik İngilizce</p>
                      <p className="grades-course-inst">Lektör Canan Kaya</p>
                    </td>
                    <td className="grades-td-score">95</td>
                    <td className="grades-td-score">100</td>
                    <td className="grades-td-score">-</td>
                    <td className="grades-td-badge"><span className="grades-badge-aa">AA</span></td>
                    <td className="grades-td-score">3</td>
                  </tr>
                  <tr className="grades-table-row">
                    <td className="grades-td-course">
                      <p className="grades-course-code">TAR101 - Devrim Tarihi</p>
                      <p className="grades-course-inst">Uzm. Mert Bulut</p>
                    </td>
                    <td className="grades-td-score">80</td>
                    <td className="grades-td-score">85</td>
                    <td className="grades-td-score">-</td>
                    <td className="grades-td-badge"><span className="grades-badge-aa">AA</span></td>
                    <td className="grades-td-score">2</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          <div className="grades-attendance-card">
            <div className="grades-attendance-visual">
              <svg className="grades-attendance-svg">
                <circle cx="64" cy="64" r="58" className="grades-circle-bg" />
                <circle cx="64" cy="64" r="58" className="grades-circle-fill" />
              </svg>
              <div className="grades-attendance-percent">
                <span className="grades-percent-num">90%</span>
                <span className="grades-percent-label">Katılım</span>
              </div>
            </div>
            <div className="grades-attendance-details">
              <h5 className="grades-details-title">Devamsızlık ve Katılım Analizi</h5>
              <p className="grades-details-desc">Bu dönem toplam 180 ders saatinin 162 saatine katılım sağladınız.</p>
              <div className="grades-details-chips">
                <span className="grades-chip-green">
                  <span className="grades-chip-dot" />
                  <span>Kritik Sınırda Değil</span>
                </span>
                <span className="grades-chip-gray">
                  <span className="grades-chip-dot" />
                  <span>4 Ders Devamsızlık</span>
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="grades-right-column">
          <div className="grades-robot-card">
            <div className="grades-robot-header">
              <span className="material-symbols-outlined">smart_toy</span>
              <h4 className="grades-robot-title">GANO Robotu</h4>
            </div>
            <p className="grades-robot-desc">Gelecek notlarınızı simüle ederek GANO değişimini görün.</p>

            <div className="grades-robot-form">
              <div className="grades-robot-group">
                <label className="grades-robot-label">Simülasyon İçin Ders Seç</label>
                <select className="grades-robot-select" defaultValue="fiz">
                  <option value="fiz">FIZ102 - Genel Fizik II</option>
                  <option value="bil">BIL203 - Veri Yapıları</option>
                </select>
              </div>
              <div className="grades-robot-row">
                <div className="grades-robot-col">
                  <label className="grades-robot-label">Hedef Not</label>
                  <input className="grades-robot-input" type="number" placeholder="85" />
                </div>
                <div className="grades-robot-col">
                  <label className="grades-robot-label">AKTS</label>
                  <input className="grades-robot-input" type="number" placeholder="5" />
                </div>
              </div>
              <div className="grades-robot-results">
                <div className="grades-result-item">
                  <span>Mevcut GANO:</span>
                  <span className="grades-result-bold">3.42</span>
                </div>
                <div className="grades-result-item">
                  <span>Tahmini GANO:</span>
                  <span className="grades-result-large">3.51</span>
                </div>
                <div className="grades-result-progress">
                  <div className="grades-result-fill" />
                </div>
              </div>
              <button className="grades-btn-simulate">Hesapla ve Karşılaştır</button>
            </div>
          </div>

          <div className="grades-actions-card">
            <h5 className="grades-actions-title">Hızlı İşlemler</h5>
            <div className="grades-actions-list">
              <button className="grades-action-row">
                <div className="grades-action-left">
                  <span className="material-symbols-outlined">verified</span>
                  <span>Resmi Transkript Talebi</span>
                </div>
                <span className="material-symbols-outlined">chevron_right</span>
              </button>
              <button className="grades-action-row">
                <div className="grades-action-left">
                  <span className="material-symbols-outlined">grading</span>
                  <span>Not İtiraz Formu</span>
                </div>
                <span className="material-symbols-outlined">chevron_right</span>
              </button>
              <button className="grades-action-row">
                <div className="grades-action-left">
                  <span className="material-symbols-outlined">download</span>
                  <span>Not Dökümü İndir</span>
                </div>
                <span className="material-symbols-outlined">chevron_right</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
