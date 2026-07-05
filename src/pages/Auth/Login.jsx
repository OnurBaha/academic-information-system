import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { loginUserAsync } from '../../store/auth/authSlice'
import { toast } from 'react-hot-toast'

export default function Login() {
  const [usernameInput, setUsernameInput] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const { status } = useSelector((state) => state.auth || {})

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!usernameInput || !password) {
      toast.error('Lütfen kullanıcı adı ve şifrenizi girin')
      return
    }
    
    const resultAction = await dispatch(loginUserAsync({ username: usernameInput, password }))
    if (loginUserAsync.fulfilled.match(resultAction)) {
      const loggedUser = resultAction.payload
      toast.success(`Hoş geldin, ${loggedUser.name}!`)
      
      // Kullanıcı rolüne göre yönlendir
      if (loggedUser.role === 'student') {
        navigate('/student/dashboard')
      } else if (loggedUser.role === 'teacher') {
        navigate('/teacher/dashboard')
      } else if (loggedUser.role === 'dean') {
        navigate('/dean/overview')
      } else {
        navigate('/')
      }
    } else {
      toast.error(resultAction.payload || 'Giriş başarısız. Lütfen bilgilerinizi kontrol edin.')
    }
  }

  // Demo giriş yardımcı fonksiyonu
  const handleDemoLogin = async (e, demoUsername) => {
    e.preventDefault()
    const resultAction = await dispatch(loginUserAsync({ username: demoUsername, password: 'password123' }))
    if (loginUserAsync.fulfilled.match(resultAction)) {
      const loggedUser = resultAction.payload
      toast.success(`Hoş geldin, ${loggedUser.name}! (Demo)`)
      if (loggedUser.role === 'student') {
        navigate('/student/dashboard')
      } else if (loggedUser.role === 'teacher') {
        navigate('/teacher/dashboard')
      } else if (loggedUser.role === 'dean') {
        navigate('/dean/overview')
      }
    } else {
      toast.error('Demo girişi başarısız')
    }
  }

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

            <form className="login-form-body" onSubmit={handleSubmit}>
              <div className="login-form-group">
                <label className="login-input-label" htmlFor="username">Kullanıcı Adı</label>
                <div className="login-input-wrapper">
                  <span className="material-symbols-outlined">person</span>
                  <input 
                    className="login-form-input" 
                    id="username" 
                    type="text" 
                    placeholder="Örn: student.ahmet" 
                    value={usernameInput}
                    onChange={(e) => setUsernameInput(e.target.value)}
                  />
                </div>
              </div>

              <div className="login-form-group">
                <div className="login-pass-row">
                  <label className="login-input-label" htmlFor="password">Şifre</label>
                  <a href="#" className="login-link-forgot" onClick={(e) => { e.preventDefault(); toast.error('Lütfen sistem yöneticisiyle iletişime geçin.'); }}>Şifremi Unuttum</a>
                </div>
                <div className="login-input-wrapper">
                  <span className="material-symbols-outlined">lock</span>
                  <input 
                    className="login-form-input" 
                    id="password" 
                    type={showPassword ? "text" : "password"} 
                    placeholder="••••••••" 
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                  <button 
                    type="button" 
                    className="login-btn-visibility"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    <span className="material-symbols-outlined">{showPassword ? "visibility_off" : "visibility"}</span>
                  </button>
                </div>
              </div>

              <button type="submit" className="login-btn-submit" disabled={status === 'loading'}>
                <span>{status === 'loading' ? 'Giriş Yapılıyor...' : 'Giriş Yap'}</span>
                <span className="material-symbols-outlined">login</span>
              </button>
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

          </div>

          <div className="login-demo-panel">
            <p className="login-demo-title">Demo Giriş Linkleri</p>
            <div className="login-demo-links">
              <button onClick={(e) => handleDemoLogin(e, 'student.ahmet')} className="login-demo-btn" style={{ cursor: 'pointer' }}>Öğrenci</button>
              <button onClick={(e) => handleDemoLogin(e, 'teacher.nazli')} className="login-demo-btn" style={{ cursor: 'pointer' }}>Akademisyen</button>
              <button onClick={(e) => handleDemoLogin(e, 'dean.mehmet')} className="login-demo-btn" style={{ cursor: 'pointer' }}>Dekan</button>
            </div>
          </div>
        </div>
      </section>
    </main>
  )
}
