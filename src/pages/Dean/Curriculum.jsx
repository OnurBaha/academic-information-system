export default function Curriculum() {
  return (
    <section className="curr-page-canvas">
      <div className="curr-page-header">
        <h2 className="curr-page-title">Müfredat &amp; AKTS Yönetimi</h2>
        <button className="curr-btn-new">
          <span className="material-symbols-outlined">add</span>
          <span>Yeni Ders Tanımla</span>
        </button>
      </div>

      <div className="curr-table-card">
        <table className="curr-data-table">
          <thead>
            <tr>
              <th className="curr-table-th">Ders Kodu</th>
              <th className="curr-table-th">Ders Adı</th>
              <th className="curr-table-th">AKTS</th>
              <th className="curr-table-th">Dönem</th>
              <th className="curr-table-th">Durum</th>
              <th className="curr-table-th">İşlemler</th>
            </tr>
          </thead>
          <tbody>
            <tr className="curr-table-row">
              <td className="curr-td-code">MOB401</td>
              <td className="curr-td-name">Mobil Geliştirme (Flutter)</td>
              <td className="curr-td-akts">
                <span className="curr-badge-akts">6</span>
              </td>
              <td className="curr-td-semester">Dönem 4</td>
              <td className="curr-td-status">
                <span className="curr-status-active">Aktif</span>
              </td>
              <td className="curr-td-actions">
                <div className="curr-actions-row">
                  <button className="curr-btn-edit">Düzenle</button>
                  <button className="curr-btn-delete">Sil</button>
                </div>
              </td>
            </tr>

            <tr className="curr-table-row">
              <td className="curr-td-code">CYB302</td>
              <td className="curr-td-name">Cyber Security 101</td>
              <td className="curr-td-akts">
                <span className="curr-badge-akts">4</span>
              </td>
              <td className="curr-td-semester">Dönem 3</td>
              <td className="curr-td-status">
                <span className="curr-status-draft">Taslak</span>
              </td>
              <td className="curr-td-actions">
                <div className="curr-actions-row">
                  <button className="curr-btn-edit">Düzenle</button>
                  <button className="curr-btn-delete">Sil</button>
                </div>
              </td>
            </tr>

            <tr className="curr-table-row">
              <td className="curr-td-code">AI501</td>
              <td className="curr-td-name">Python &amp; Machine Learning</td>
              <td className="curr-td-akts">
                <span className="curr-badge-akts">7</span>
              </td>
              <td className="curr-td-semester">Dönem 5</td>
              <td className="curr-td-status">
                <span className="curr-status-active">Aktif</span>
              </td>
              <td className="curr-td-actions">
                <div className="curr-actions-row">
                  <button className="curr-btn-edit">Düzenle</button>
                  <button className="curr-btn-delete">Sil</button>
                </div>
              </td>
            </tr>

            <tr className="curr-table-row">
              <td className="curr-td-code">UX201</td>
              <td className="curr-td-name">UI/UX Tasarım Temelleri</td>
              <td className="curr-td-akts">
                <span className="curr-badge-akts">3</span>
              </td>
              <td className="curr-td-semester">Dönem 2</td>
              <td className="curr-td-status">
                <span className="curr-status-passive">Pasif</span>
              </td>
              <td className="curr-td-actions">
                <div className="curr-actions-row">
                  <button className="curr-btn-edit">Düzenle</button>
                  <button className="curr-btn-delete">Sil</button>
                </div>
              </td>
            </tr>

            <tr className="curr-table-row">
              <td className="curr-td-code">BLK601</td>
              <td className="curr-td-name">Blockchain &amp; Web3</td>
              <td className="curr-td-akts">
                <span className="curr-badge-akts">5</span>
              </td>
              <td className="curr-td-semester">Dönem 6</td>
              <td className="curr-td-status">
                <span className="curr-status-draft">Taslak</span>
              </td>
              <td className="curr-td-actions">
                <div className="curr-actions-row">
                  <button className="curr-btn-edit">Düzenle</button>
                  <button className="curr-btn-delete">Sil</button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </section>
  )
}
