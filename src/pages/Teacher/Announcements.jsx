export default function Announcements() {
  return (
    <section className="ann-page-canvas">
      <div className="ann-page-header">
        <h2 className="ann-page-title">Duyuru &amp; İletişim Portalı</h2>
        <button className="ann-btn-new">
          <span className="material-symbols-outlined">add</span>
          <span>Yeni Duyuru</span>
        </button>
      </div>

      <div className="ann-composer-card">
        <h4 className="ann-composer-title">Duyuru Oluştur</h4>
        <div className="ann-composer-form">
          <input className="ann-input-title" placeholder="Duyuru Başlığı..." />
          <div className="ann-select-row">
            <select className="ann-composer-select">
              <option>Tüm Öğrenciler</option>
              <option>Grup A</option>
              <option>Grup B</option>
            </select>
            <select className="ann-composer-select">
              <option>Düşük Öncelik</option>
              <option>Orta Öncelik</option>
              <option>Yüksek Öncelik</option>
            </select>
          </div>
          <textarea className="ann-textarea-body" placeholder="Duyuru içeriğini buraya yazın..." />
          <div className="ann-btn-row">
            <button className="ann-btn-cancel">İptal</button>
            <button className="ann-btn-submit">Yayınla</button>
          </div>
        </div>
      </div>

      <div className="ann-list-container">
        <div className="ann-pinned-card">
          <div className="ann-card-header">
            <div className="ann-title-wrap">
              <span className="ann-badge-pinned">Sabitlendi</span>
              <h4 className="ann-card-title">Vize Sınavı Tarihleri Açıklandı</h4>
            </div>
            <div className="ann-actions-wrap">
              <button className="ann-btn-edit">
                <span className="material-symbols-outlined">edit</span>
              </button>
              <button className="ann-btn-delete">
                <span className="material-symbols-outlined">delete</span>
              </button>
            </div>
          </div>
          <p className="ann-card-body">Vize sınavları 15-22 Kasım tarihleri arasında yapılacaktır. Öğrencilerin derse devamını kontrol ediniz.</p>
          <div className="ann-card-footer">
            <span className="ann-meta-item">
              <span className="material-symbols-outlined">calendar_today</span>
              <span>01.07.2024</span>
            </span>
            <span className="ann-meta-item">
              <span className="material-symbols-outlined">group</span>
              <span>Tüm Öğrenciler</span>
            </span>
          </div>
        </div>

        <div className="ann-normal-card">
          <div className="ann-card-header">
            <div className="ann-title-wrap">
              <h4 className="ann-card-title">Ödev 4 Teslim Tarihi Uzatıldı</h4>
            </div>
            <div className="ann-actions-wrap">
              <button className="ann-btn-edit">
                <span className="material-symbols-outlined">edit</span>
              </button>
              <button className="ann-btn-delete">
                <span className="material-symbols-outlined">delete</span>
              </button>
            </div>
          </div>
          <p className="ann-card-body">React Redux ödevinin teslim tarihi 10 Temmuz olarak güncellenmiştir.</p>
          <div className="ann-card-footer">
            <span className="ann-meta-item">
              <span className="material-symbols-outlined">calendar_today</span>
              <span>30.06.2024</span>
            </span>
            <span className="ann-meta-item">
              <span className="material-symbols-outlined">group</span>
              <span>Grup A</span>
            </span>
          </div>
        </div>

        <div className="ann-normal-card">
          <div className="ann-card-header">
            <div className="ann-title-wrap">
              <h4 className="ann-card-title">Staj Başvuruları Başladı</h4>
            </div>
            <div className="ann-actions-wrap">
              <button className="ann-btn-edit">
                <span className="material-symbols-outlined">edit</span>
              </button>
              <button className="ann-btn-delete">
                <span className="material-symbols-outlined">delete</span>
              </button>
            </div>
          </div>
          <p className="ann-card-body">Yaz stajı başvuruları için kariyer portalını ziyaret ediniz.</p>
          <div className="ann-card-footer">
            <span className="ann-meta-item">
              <span className="material-symbols-outlined">calendar_today</span>
              <span>25.06.2024</span>
            </span>
            <span className="ann-meta-item">
              <span className="material-symbols-outlined">group</span>
              <span>Tüm Öğrenciler</span>
            </span>
          </div>
        </div>
      </div>
    </section>
  )
}
