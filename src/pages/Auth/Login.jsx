import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { loginStudent, loginDemoStudent } from '../../store/auth/authSlice'
import { toast } from 'react-hot-toast'

export default function Login() {
  const [role, setRole] = useState('student')
  const [idNumber, setIdNumber] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const { status } = useSelector((state) => state.auth)

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (role === 'student') {
      if (!idNumber || !password) {
        toast.error('Lütfen öğrenci numarası ve şifrenizi girin')
        return
      }
      
      const resultAction = await dispatch(loginStudent({ ogrenciNo: idNumber, password }))
      if (loginStudent.fulfilled.match(resultAction)) {
        toast.success(`Hoş geldin, ${resultAction.payload.name}!`)
        navigate('/student/dashboard')
      } else {
        toast.error(resultAction.payload || 'Giriş başarısız')
      }
    } else {
      // Akademisyen ve dekan için doğrudan demo yönlendirmesi
      toast.success(`${role === 'teacher' ? 'Akademisyen' : 'Dekan'} girişi (Demo)`)
      navigate(role === 'teacher' ? '/teacher/dashboard' : '/dean/overview')
    }
  }

  const handleDemoStudentLogin = async (e) => {
    e.preventDefault()
    const resultAction = await dispatch(loginDemoStudent())
    if (loginDemoStudent.fulfilled.match(resultAction)) {
      toast.success(`Hoş geldin, ${resultAction.payload.name}! (Demo Öğrenci)`)
      navigate('/student/dashboard')
    } else {
      toast.error(resultAction.payload || 'Demo girişi başarısız')
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
                <label className="login-input-label" htmlFor="role">Giriş Rolü Seçin</label>
                <div className="login-select-wrapper">
                  <select 
                    className="login-form-select" 
                    id="role" 
                    value={role}
                    onChange={(e) => setRole(e.target.value)}
                  >
                    <option value="student">Öğrenci</option>
                    <option value="teacher">Akademisyen</option>
                    <option value="dean">Dekan</option>
                  </select>
                  <span className="material-symbols-outlined">expand_more</span>
                </div>
              </div>

              <div className="login-form-group">
                <label className="login-input-label" htmlFor="id_number">
                  {role === 'student' ? 'Öğrenci No' : 'T.C. Kimlik No'}
                </label>
                <div className="login-input-wrapper">
                  <span className="material-symbols-outlined">person</span>
                  <input 
                    className="login-form-input" 
                    id="id_number" 
                    type="text" 
                    placeholder="Örn: 20211024032" 
                    value={idNumber}
                    onChange={(e) => setIdNumber(e.target.value)}
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
              <button onClick={handleDemoStudentLogin} className="login-demo-btn" style={{ cursor: 'pointer' }}>Öğrenci</button>
              <Link to="/teacher/dashboard" className="login-demo-btn">Akademisyen</Link>
              <Link to="/dean/overview" className="login-demo-btn">Dekan</Link>
            </div>
          </div>
        </div>
      </section>
    </main>
  )
}

