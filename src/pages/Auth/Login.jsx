import { Link } from 'react-router-dom'

export default function Login() {
  return (
    <main className="login-wrapper">
      <section className="login-side-brand">
        <div className="login-brand-overlay" />
        <div className="login-brand-shade" />
        <div className="login-brand-content">
          <div className="login-brand-logo">
            <span className="material-symbols-outlined">school</span>
            <h1 className="login-brand-title">AIS</h1>
          </div>
          <p className="login-brand-tagline">Geleceğin Yazılımcıları Burada Yetişiyor.</p>
          <div className="login-brand-features">
            <div className="login-feature-item">
              <span className="material-symbols-outlined">verified_user</span>
              <span className="login-feature-text">Güvenli Akademik Bilgi Sistemi</span>
            </div>
            <div className="login-feature-item">
              <span className="material-symbols-outlined">speed</span>
              <span className="login-feature-text">Hızlı ve Kesintisiz Veri Erişimi</span>
            </div>
            <div className="login-feature-item">
              <span className="material-symbols-outlined">hub</span>
              <span className="login-feature-text">Entegre Eğitim Teknolojileri</span>
            </div>
          </div>
        </div>
      </section>

      <section className="login-side-form">
        <div className="login-form-container">
          <div className="login-form-card">
            <div className="login-form-header">
              <div className="login-mobile-logo">
                <span className="material-symbols-outlined">school</span>
                <span className="login-mobile-text">AIS</span>
              </div>
              <h2 className="login-header-title">Hoş Geldiniz</h2>
              <p className="login-header-subtitle">Lütfen hesabınıza giriş yapın</p>
            </div>

            <form className="login-form-body">
              <div className="login-form-group">
                <label className="login-input-label" htmlFor="role">Giriş Rolü Seçin</label>
                <div className="login-select-wrapper">
                  <select className="login-form-select" id="role" defaultValue="student">
                    <option value="student">Öğrenci</option>
                    <option value="teacher">Akademisyen</option>
                    <option value="dean">Dekan</option>
                  </select>
                  <span className="material-symbols-outlined">expand_more</span>
                </div>
              </div>

              <div className="login-form-group">
                <label className="login-input-label" htmlFor="id_number">T.C. Kimlik / Öğrenci No</label>
                <div className="login-input-wrapper">
                  <span className="material-symbols-outlined">person</span>
                  <input className="login-form-input" id="id_number" type="text" placeholder="Örn: 12345678901" />
                </div>
              </div>

              <div className="login-form-group">
                <div className="login-pass-row">
                  <label className="login-input-label" htmlFor="password">Şifre</label>
                  <a href="#" className="login-link-forgot">Şifremi Unuttum</a>
                </div>
                <div className="login-input-wrapper">
                  <span className="material-symbols-outlined">lock</span>
                  <input className="login-form-input" id="password" type="password" placeholder="••••••••" />
                  <button type="button" className="login-btn-visibility">
                    <span className="material-symbols-outlined">visibility</span>
                  </button>
                </div>
              </div>

              <Link to="/student/dashboard" className="login-btn-submit">
                <span>Giriş Yap</span>
                <span className="material-symbols-outlined">login</span>
              </Link>
            </form>

            <div className="login-trust-bar">
              <div className="login-trust-item">
                <span className="material-symbols-outlined">verified</span>
                <span>KVKK Uyumlu</span>
              </div>
              <div className="login-trust-item">
                <span className="material-symbols-outlined">security</span>
                <span>SSL Sertifikalı</span>
              </div>
            </div>

            <div className="login-form-footer">
              <span>Sistem erişimi ile ilgili sorun mu yaşıyorsunuz?</span>
              <a href="#" className="login-link-support">Destek Talebi Oluşturun</a>
            </div>
          </div>

          <div className="login-demo-panel">
            <p className="login-demo-title">Demo Giriş Linkleri</p>
            <div className="login-demo-links">
              <Link to="/student/dashboard" className="login-demo-btn">Öğrenci</Link>
              <Link to="/teacher/dashboard" className="login-demo-btn">Akademisyen</Link>
              <Link to="/dean/overview" className="login-demo-btn">Dekan</Link>
            </div>
          </div>
        </div>
      </section>
    </main>
  )
}
