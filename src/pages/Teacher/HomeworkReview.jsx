export default function HomeworkReview() {
  return (
    <section className="hw-page-canvas">
      <div className="hw-page-header">
        <div>
          <h2 className="hw-page-title">Ödev Kontrol Merkezi</h2>
          <p className="hw-page-subtitle">GitHub link incelemeleri ve AI destekli intihal denetimi</p>
        </div>
        <div className="hw-header-actions">
          <div className="hw-badge-pending">
            14 Bekleyen İnceleme
          </div>
        </div>
      </div>

      <div className="hw-list-container">
        <div className="hw-review-card">
          <div className="hw-card-header">
            <div className="hw-student-box">
              <div className="hw-student-avatar">C</div>
              <div>
                <p className="hw-student-name">Can Demir</p>
                <p className="hw-student-meta">20211024001 · Ödev #4 — React Redux</p>
              </div>
            </div>
            <span className="hw-badge-amber">Bekliyor</span>
          </div>

          <div className="hw-github-box">
            <span className="material-symbols-outlined">code</span>
            <a href="https://github.com/candemir/hw4" className="hw-github-link">github.com/candemir/hw4</a>
            <span className="hw-submit-time">Teslim: 03.07.2024 14:22</span>
          </div>

          <div className="hw-actions-wrap">
            <button className="hw-btn-review">
              <span className="material-symbols-outlined">link</span>
              <span>GitHub'da İncele</span>
            </button>
            <button className="hw-btn-plag">
              <span className="material-symbols-outlined">psychology</span>
              <span>AI İntihal Tara</span>
            </button>
            <button className="hw-btn-approve">
              <span className="material-symbols-outlined">check_circle</span>
              <span>Onayla</span>
            </button>
          </div>
        </div>

        <div className="hw-review-card">
          <div className="hw-card-header">
            <div className="hw-student-box">
              <div className="hw-student-avatar">S</div>
              <div>
                <p className="hw-student-name">Seda Kaya</p>
                <p className="hw-student-meta">20211024002 · Ödev #4 — React Redux</p>
              </div>
            </div>
            <span className="hw-badge-blue">İncelendi</span>
          </div>

          <div className="hw-github-box">
            <span className="material-symbols-outlined">code</span>
            <a href="https://github.com/sedakaya/hw4" className="hw-github-link">github.com/sedakaya/hw4</a>
            <span className="hw-submit-time">Teslim: 02.07.2024 23:55</span>
          </div>

          <div className="hw-actions-wrap">
            <button className="hw-btn-review">
              <span className="material-symbols-outlined">link</span>
              <span>GitHub'da İncele</span>
            </button>
            <button className="hw-btn-plag">
              <span className="material-symbols-outlined">psychology</span>
              <span>AI İntihal Tara</span>
            </button>
            <button className="hw-btn-approve">
              <span className="material-symbols-outlined">check_circle</span>
              <span>Onayla</span>
            </button>
          </div>
        </div>

        <div className="hw-review-card">
          <div className="hw-card-header">
            <div className="hw-student-box">
              <div className="hw-student-avatar">E</div>
              <div>
                <p className="hw-student-name">Elif Şahin</p>
                <p className="hw-student-meta">20211024004 · Ödev #4 — React Redux</p>
              </div>
            </div>
            <span className="hw-badge-green">Onaylandı</span>
          </div>

          <div className="hw-github-box">
            <span className="material-symbols-outlined">code</span>
            <a href="https://github.com/elifsahin/hw4" className="hw-github-link">github.com/elifsahin/hw4</a>
            <span className="hw-submit-time">Teslim: 01.07.2024 10:10</span>
          </div>

          <div className="hw-actions-wrap">
            <button className="hw-btn-review">
              <span className="material-symbols-outlined">link</span>
              <span>GitHub'da İncele</span>
            </button>
            <button className="hw-btn-plag">
              <span className="material-symbols-outlined">psychology</span>
              <span>AI İntihal Tara</span>
            </button>
            <button className="hw-btn-approve">
              <span className="material-symbols-outlined">check_circle</span>
              <span>Onayla</span>
            </button>
          </div>
        </div>
      </div>
    </section>
  )
}
