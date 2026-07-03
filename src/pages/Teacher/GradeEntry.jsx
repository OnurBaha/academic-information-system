export default function GradeEntry() {
  return (
    <section className="grades-entry-canvas">
      <div className="grades-entry-header">
        <div>
          <h2 className="grades-entry-title">Not Giriş Sistemi</h2>
          <p className="grades-entry-subtitle">Full-Stack .NET &amp; React · Grup A</p>
        </div>
        <div className="grades-entry-actions">
          <button className="grades-entry-btn-excel">
            <span className="material-symbols-outlined">upload</span>
            <span>Excel İçe Aktar</span>
          </button>
          <button className="grades-entry-btn-save">
            <span className="material-symbols-outlined">save</span>
            <span>Kaydet</span>
          </button>
        </div>
      </div>

      <div className="grades-entry-table-card">
        <div className="grades-entry-card-header">
          <div>
            <h4 className="grades-entry-card-title">Öğrenci Not Çizelgesi</h4>
            <p className="grades-entry-card-subtitle">Vize %40 · Final %40 · Proje %20</p>
          </div>
          <div className="grades-entry-card-meta">
            <span>Toplam: <strong className="grades-meta-navy">128</strong> öğrenci</span>
            <span>Girildi: <strong className="grades-meta-green">114</strong></span>
            <span>Bekliyor: <strong className="grades-meta-amber">14</strong></span>
          </div>
        </div>

        <div className="grades-entry-table-scroll">
          <table className="grades-entry-data-table">
            <thead>
              <tr>
                <th className="grades-entry-th-left">#</th>
                <th className="grades-entry-th-left">Öğrenci Adı</th>
                <th className="grades-entry-th-left">Öğrenci No</th>
                <th className="grades-entry-th-center">Vize (%40)</th>
                <th className="grades-entry-th-center">Final (%40)</th>
                <th className="grades-entry-th-center">Proje (%20)</th>
                <th className="grades-entry-th-center">Harf Notu</th>
                <th className="grades-entry-th-center">İşlem</th>
              </tr>
            </thead>
            <tbody>
              <tr className="grades-entry-row">
                <td className="grades-entry-td-left-num">1</td>
                <td className="grades-entry-td-left">
                  <div className="grades-entry-student-box">
                    <div className="grades-entry-avatar">C</div>
                    <span className="grades-entry-name">Can Demir</span>
                  </div>
                </td>
                <td className="grades-entry-td-left-id">20211024001</td>
                <td className="grades-entry-td-center">
                  <input className="grades-entry-input" type="number" defaultValue={85} min={0} max={100} />
                </td>
                <td className="grades-entry-td-center">
                  <input className="grades-entry-input" type="number" defaultValue={90} min={0} max={100} />
                </td>
                <td className="grades-entry-td-center">
                  <input className="grades-entry-input" type="number" defaultValue={88} min={0} max={100} />
                </td>
                <td className="grades-entry-td-center">
                  <span className="grades-entry-badge-green">AA</span>
                </td>
                <td className="grades-entry-td-center">
                  <button className="grades-entry-btn-edit">
                    <span className="material-symbols-outlined">edit</span>
                  </button>
                </td>
              </tr>

              <tr className="grades-entry-row">
                <td className="grades-entry-td-left-num">2</td>
                <td className="grades-entry-td-left">
                  <div className="grades-entry-student-box">
                    <div className="grades-entry-avatar">S</div>
                    <span className="grades-entry-name">Seda Kaya</span>
                  </div>
                </td>
                <td className="grades-entry-td-left-id">20211024002</td>
                <td className="grades-entry-td-center">
                  <input className="grades-entry-input" type="number" defaultValue={72} min={0} max={100} />
                </td>
                <td className="grades-entry-td-center">
                  <input className="grades-entry-input" type="number" defaultValue={68} min={0} max={100} />
                </td>
                <td className="grades-entry-td-center">
                  <input className="grades-entry-input" type="number" defaultValue={80} min={0} max={100} />
                </td>
                <td className="grades-entry-td-center">
                  <span className="grades-entry-badge-blue">BA</span>
                </td>
                <td className="grades-entry-td-center">
                  <button className="grades-entry-btn-edit">
                    <span className="material-symbols-outlined">edit</span>
                  </button>
                </td>
              </tr>

              <tr className="grades-entry-row">
                <td className="grades-entry-td-left-num">3</td>
                <td className="grades-entry-td-left">
                  <div className="grades-entry-student-box">
                    <div className="grades-entry-avatar">B</div>
                    <span className="grades-entry-name">Bora Ak</span>
                  </div>
                </td>
                <td className="grades-entry-td-left-id">20211024003</td>
                <td className="grades-entry-td-center">
                  <input className="grades-entry-input" type="number" defaultValue={55} min={0} max={100} />
                </td>
                <td className="grades-entry-td-center">
                  <input className="grades-entry-input" type="number" defaultValue="" min={0} max={100} />
                </td>
                <td className="grades-entry-td-center">
                  <input className="grades-entry-input" type="number" defaultValue="" min={0} max={100} />
                </td>
                <td className="grades-entry-td-center">
                  <span className="grades-entry-badge-gray">—</span>
                </td>
                <td className="grades-entry-td-center">
                  <button className="grades-entry-btn-edit">
                    <span className="material-symbols-outlined">edit</span>
                  </button>
                </td>
              </tr>

              <tr className="grades-entry-row">
                <td className="grades-entry-td-left-num">4</td>
                <td className="grades-entry-td-left">
                  <div className="grades-entry-student-box">
                    <div className="grades-entry-avatar">E</div>
                    <span className="grades-entry-name">Elif Şahin</span>
                  </div>
                </td>
                <td className="grades-entry-td-left-id">20211024004</td>
                <td className="grades-entry-td-center">
                  <input className="grades-entry-input" type="number" defaultValue={95} min={0} max={100} />
                </td>
                <td className="grades-entry-td-center">
                  <input className="grades-entry-input" type="number" defaultValue={100} min={0} max={100} />
                </td>
                <td className="grades-entry-td-center">
                  <input className="grades-entry-input" type="number" defaultValue="" min={0} max={100} />
                </td>
                <td className="grades-entry-td-center">
                  <span className="grades-entry-badge-green">AA</span>
                </td>
                <td className="grades-entry-td-center">
                  <button className="grades-entry-btn-edit">
                    <span className="material-symbols-outlined">edit</span>
                  </button>
                </td>
              </tr>

              <tr className="grades-entry-row">
                <td className="grades-entry-td-left-num">5</td>
                <td className="grades-entry-td-left">
                  <div className="grades-entry-student-box">
                    <div className="grades-entry-avatar">M</div>
                    <span className="grades-entry-name">Murat Yıldız</span>
                  </div>
                </td>
                <td className="grades-entry-td-left-id">20211024005</td>
                <td className="grades-entry-td-center">
                  <input className="grades-entry-input" type="number" defaultValue={60} min={0} max={100} />
                </td>
                <td className="grades-entry-td-center">
                  <input className="grades-entry-input" type="number" defaultValue={75} min={0} max={100} />
                </td>
                <td className="grades-entry-td-center">
                  <input className="grades-entry-input" type="number" defaultValue={65} min={0} max={100} />
                </td>
                <td className="grades-entry-td-center">
                  <span className="grades-entry-badge-amber">CB</span>
                </td>
                <td className="grades-entry-td-center">
                  <button className="grades-entry-btn-edit">
                    <span className="material-symbols-outlined">edit</span>
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </section>
  )
}
