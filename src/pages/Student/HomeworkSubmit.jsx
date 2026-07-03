export default function VideoPlayer() {
  return (
    <section className="video-page-canvas">
      <div className="video-main-layout">
        <div className="video-left-column">
          <div className="video-player-wrapper">
            <div className="video-screen-mock">
              <div className="video-player-overlay">
                <button className="video-btn-play">
                  <span className="material-symbols-outlined">play_arrow</span>
                </button>
              </div>
            </div>
            <div className="video-controls-bar">
              <button className="video-btn-control">
                <span className="material-symbols-outlined">play_arrow</span>
              </button>
              <div className="video-progress-bar">
                <div className="video-progress-fill" />
              </div>
              <span className="video-time-text">15:42 / 45:00</span>
              <button className="video-btn-control">
                <span className="material-symbols-outlined">volume_up</span>
              </button>
              <button className="video-btn-control">
                <span className="material-symbols-outlined">fullscreen</span>
              </button>
            </div>
          </div>

          <div className="video-details-box">
            <div className="video-header-row">
              <div>
                <h2 className="video-details-title">Ders 1 — React Hooks Temelleri</h2>
                <p className="video-details-subtitle">Full-Stack .NET &amp; React · Dr. Elif Soylu</p>
              </div>
              <div className="video-header-actions">
                <button className="video-btn-action">
                  <span className="material-symbols-outlined">bookmark</span>
                  <span>Kaydet</span>
                </button>
                <button className="video-btn-action">
                  <span className="material-symbols-outlined">share</span>
                  <span>Paylaş</span>
                </button>
              </div>
            </div>
          </div>

          <div className="video-attachments-card">
            <h4 className="video-attachments-title">Ders Materyalleri</h4>
            <div className="video-attachments-list">
              <div className="video-attachment-item">
                <div className="video-attachment-left">
                  <span className="material-symbols-outlined video-icon-red">picture_as_pdf</span>
                  <div>
                    <p className="video-file-name">Ders Notları — Hafta 3.pdf</p>
                    <p className="video-file-meta">2.4 MB</p>
                  </div>
                </div>
                <button className="video-btn-download">
                  <span className="material-symbols-outlined">download</span>
                </button>
              </div>

              <div className="video-attachment-item">
                <div className="video-attachment-left">
                  <span className="material-symbols-outlined video-icon-blue">link</span>
                  <div>
                    <p className="video-file-name">GitHub Repository</p>
                    <p className="video-file-meta">Repo</p>
                  </div>
                </div>
                <button className="video-btn-download">
                  <span className="material-symbols-outlined">download</span>
                </button>
              </div>

              <div className="video-attachment-item">
                <div className="video-attachment-left">
                  <span className="material-symbols-outlined video-icon-amber">folder_zip</span>
                  <div>
                    <p className="video-file-name">Örnek Kodlar.zip</p>
                    <p className="video-file-meta">1.1 MB</p>
                  </div>
                </div>
                <button className="video-btn-download">
                  <span className="material-symbols-outlined">download</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="video-right-column">
          <h3 className="video-playlist-title">Ders Listesi</h3>
          
          <div className="video-playlist-list">
            <div className="video-playlist-item-active">
              <div className="video-lesson-thumb">
                <span className="material-symbols-outlined">play_circle</span>
              </div>
              <div className="video-lesson-info">
                <p className="video-lesson-title">Ders 1 — React Hooks Temelleri</p>
                <p className="video-lesson-meta">45 dk</p>
              </div>
              <span className="video-active-tag">Şimdi</span>
            </div>

            <div className="video-playlist-item">
              <div className="video-lesson-thumb">
                <span className="material-symbols-outlined">play_arrow</span>
              </div>
              <div className="video-lesson-info">
                <p className="video-lesson-title">Ders 2 — useEffect &amp; useContext</p>
                <p className="video-lesson-meta">52 dk</p>
              </div>
            </div>

            <div className="video-playlist-item">
              <div className="video-lesson-thumb">
                <span className="material-symbols-outlined">play_arrow</span>
              </div>
              <div className="video-lesson-info">
                <p className="video-lesson-title">Ders 3 — Redux Advanced Patterns</p>
                <p className="video-lesson-meta">60 dk</p>
              </div>
            </div>

            <div className="video-playlist-item">
              <div className="video-lesson-thumb">
                <span className="material-symbols-outlined">play_arrow</span>
              </div>
              <div className="video-lesson-info">
                <p className="video-lesson-title">Ders 4 — Testing with Jest</p>
                <p className="video-lesson-meta">38 dk</p>
              </div>
            </div>
          </div>

          <div className="video-qa-card">
            <h4 className="video-qa-title">Soru &amp; Cevap</h4>
            <p className="video-qa-desc">Bu dersle ilgili sorunuzu eğitmene iletin.</p>
            <textarea className="video-qa-textarea" placeholder="Sorunuzu buraya yazın..." />
            <button className="video-btn-qa">Soru Gönder</button>
          </div>
        </div>
      </div>
    </section>
  )
}
