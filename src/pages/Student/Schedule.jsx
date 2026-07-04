import { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { fetchStudentGrades, fetchAttendance } from '../../store/student/studentSlice'
import { calculateScore, getLetterGrade, simulateGano, calculateAttendancePercent } from '../../utils/studentCalc'
import { toast } from 'react-hot-toast'

// Mock Devamsızlık Detayları
const absenceDetails = [
  { id: 1, date: "12.05.2026", hours: 2, courseName: "Yapay Zeka ve Veri Analitiği" },
  { id: 2, date: "28.05.2026", hours: 3, courseName: "Modern Web Teknolojileri" },
  { id: 3, date: "03.06.2026", hours: 2, courseName: "Siber Güvenlik Temelleri" }
]

export default function StudentGrades() {
  const dispatch = useDispatch()
  const { user } = useSelector((state) => state.auth)
  const { studentGrades, attendance, status, searchQuery } = useSelector((state) => state.student)
  
  const [selectedSemester, setSelectedSemester] = useState('current')
  
  // GANO Robotu simülasyon state'leri
  const [simCourseCode, setSimCourseCode] = useState('')
  const [simTargetScore, setSimTargetScore] = useState('')
  const [simTargetAkts, setSimTargetAkts] = useState('')
  const [estimatedGano, setEstimatedGano] = useState(3.42)

  useEffect(() => {
    if (user?.id) {
      dispatch(fetchStudentGrades(user.id))
      dispatch(fetchAttendance(user.id))
    }
  }, [dispatch, user])

  // Notlar yüklendiğinde simülatör ilk değerlerini ata
  useEffect(() => {
    if (studentGrades.length > 0) {
      const firstCourse = studentGrades[0]
      setSimCourseCode(firstCourse.courseCode)
      setSimTargetAkts(firstCourse.akts)
      
      // Varsayılan kümülatif GANO'yu hesapla
      const defaultGano = simulateGano(studentGrades, null, 0)
      setEstimatedGano(defaultGano)
    }
  }, [studentGrades])

  // Ders seçildiğinde AKTS alanını güncelle
  const handleSimCourseChange = (code) => {
    setSimCourseCode(code)
    const selected = studentGrades.find(g => g.courseCode === code)
    if (selected) {
      setSimTargetAkts(selected.akts)
    }
  }

  // Simülasyon hesaplama
  const handleSimulate = (e) => {
    e.preventDefault()
    if (!simTargetScore) {
      toast.error('Lütfen simülasyon için hedef not girin.')
      return
    }
    const score = Number(simTargetScore)
    if (score < 0 || score > 100) {
      toast.error('Hedef not 0 ile 100 arasında olmalıdır.')
      return
    }

    const nextGano = simulateGano(studentGrades, simCourseCode, score)
    setEstimatedGano(nextGano)
    toast.success(`Simülasyon hesaplandı. Tahmini GANO: ${nextGano}`)
  }

  // Not tablosu dönem filtresi
  const filteredGrades = studentGrades.filter(g => {
    let matchesSemester = true
    if (selectedSemester === 'current') matchesSemester = g.semester === '2025-2026 Güz'
    else if (selectedSemester === 'spring') matchesSemester = g.semester === '2024-2025 Bahar'
    else if (selectedSemester === 'fall') matchesSemester = g.semester === '2024-2025 Güz'

    const query = searchQuery ? searchQuery.trim().toLowerCase() : ''
    const matchesSearch = query === '' || 
      g.courseCode.toLowerCase().includes(query) || 
      g.instructor.toLowerCase().includes(query)
      
    return matchesSemester && matchesSearch
  })

  // Mevcut kümülatif GANO hesabı
  const currentGano = studentGrades.length > 0 
    ? simulateGano(studentGrades, null, 0)
    : 0

  // Devamsızlık hesabı (Mock detaya uygun olarak güncellenmiştir)
  const attendancePercent = attendance 
    ? calculateAttendancePercent(attendance.attendedHours, attendance.totalHours)
    : 90
  const absentHours = attendance ? attendance.absentHours : 18
  
  // Daire grafiği için çizgi hesabı (Çevre = 2 * PI * r = 2 * 3.14 * 58 = 364.24)
  const strokeCircumference = 364
  const strokeOffset = strokeCircumference - (strokeCircumference * attendancePercent) / 100

  return (
    <section className="grades-page-canvas text-slate-850 dark:text-white">
      
      <div className="grades-page-header">
        <div>
          <h2 className="grades-page-title">Notlarım ve Akademik Durum</h2>
          <p className="grades-page-subtitle">Mevcut dönem başarı puanlarınızı ve transkript detaylarını inceleyin.</p>
        </div>
        <div className="grades-select-container">
          <label className="grades-select-label">Dönem Seç:</label>
          <div className="grades-select-wrapper">
            <select 
              className="grades-semester-select text-slate-800 dark:text-white bg-white dark:bg-slate-800" 
              value={selectedSemester}
              onChange={(e) => setSelectedSemester(e.target.value)}
            >
              <option value="current">2025-2026 Güz</option>
              <option value="spring">2024-2025 Bahar</option>
              <option value="fall">2024-2025 Güz</option>
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
            <h3 className="grades-card-value">{status.studentGrades === 'loading' ? '...' : currentGano.toFixed(2)}</h3>
          </div>
        </div>

        <div className="grades-stat-card">
          <div className="grades-card-header">
            <div className="grades-icon-navy">
              <span className="material-symbols-outlined">book</span>
            </div>
            <span className="grades-badge-gray">{filteredGrades.length} Ders</span>
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
          
          {/* Not Çizelgesi Tablosu */}
          <div className="grades-table-wrapper">
            <div className="grades-table-header">
              <h4 className="grades-table-title">Dönem Not Çizelgesi</h4>
              <button className="grades-btn-download cursor-pointer" onClick={() => toast.success('Resmi not çizelgesi PDF olarak indiriliyor...')}>
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
                  {status.studentGrades === 'loading' ? (
                    <tr>
                      <td colSpan="6" className="grades-td-course" style={{ textAlign: 'center', padding: '30px 0' }}>
                        Yükleniyor...
                      </td>
                    </tr>
                  ) : filteredGrades.length === 0 ? (
                    <tr>
                      <td colSpan="6" className="grades-td-course" style={{ textAlign: 'center', padding: '30px 0' }}>
                        Bu döneme ait not bilgisi bulunmuyor.
                      </td>
                    </tr>
                  ) : (
                    filteredGrades.map((g) => {
                      const hasFinal = g.final !== null && g.final !== undefined
                      const score = hasFinal ? calculateScore(g.vize, g.final, g.proje) : null
                      const letter = hasFinal ? getLetterGrade(score) : 'Açıklanmadı'
                      
                      let badgeClass = ''
                      if (hasFinal) {
                        badgeClass = `grades-badge-${letter.toLowerCase()}`
                      } else {
                        badgeClass = 'bg-amber-50 text-amber-600 dark:bg-amber-950/20 dark:text-amber-400 border border-amber-100 dark:border-amber-900/30'
                      }

                      return (
                        <tr className="grades-table-row" key={g.id}>
                          <td className="grades-td-course">
                            <p className="grades-course-code font-bold text-slate-800 dark:text-white">
                              {g.courseCode}
                            </p>
                            <p className="grades-course-inst">{g.instructor}</p>
                          </td>
                          <td className="grades-td-score font-semibold">{g.vize}</td>
                          <td className="grades-td-score font-semibold">{g.final !== null ? g.final : 'Açıklanmadı'}</td>
                          <td className="grades-td-score font-semibold">{g.proje !== null ? g.proje : '-'}</td>
                          <td className="grades-td-badge">
                            <span className={`px-2 py-0.5 rounded text-[10px] font-extrabold uppercase ${badgeClass}`}>
                              {letter === 'Açıklanmadı' ? 'Sınav Yapılmadı' : letter}
                            </span>
                          </td>
                          {/* Light modda koyu olması istenen AKTS */}
                          <td className="grades-td-score akts-light-dark text-sm">{g.akts}</td>
                        </tr>
                      )
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Devamsızlık ve Katılım Analizi (Daha düzgün grafik çemberi ve alt geçmiş detayları) */}
          <div className="grades-attendance-card flex flex-col gap-6">
            <div className="flex flex-col sm:flex-row items-center gap-6">
              
              {/* Devamsızlık Dairesi (Premium Tasarım) */}
              <div className="grades-attendance-visual relative select-none filter drop-shadow-md">
                <svg className="grades-attendance-svg w-32 h-32 transform -rotate-90">
                  <defs>
                    <linearGradient id="attendanceGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor="#2563eb" />
                      <stop offset="100%" stopColor="#10b981" />
                    </linearGradient>
                  </defs>
                  {/* Arka plan çemberi */}
                  <circle
                    cx="64"
                    cy="64"
                    r="58"
                    strokeWidth="8"
                    className="grades-circle-bg stroke-slate-100 dark:stroke-slate-700/60 fill-none"
                  />
                  {/* Katılım oranı çemberi */}
                  <circle 
                    cx="64" 
                    cy="64" 
                    r="58"
                    strokeWidth="8"
                    className="grades-circle-fill-gradient fill-none" 
                    style={{ strokeDasharray: strokeCircumference, strokeDashoffset: strokeOffset }}
                  />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                  <span className="text-xl font-black text-slate-800 dark:text-white leading-none">{attendancePercent}%</span>
                  <span className="text-[9px] text-slate-400 dark:text-slate-500 uppercase tracking-widest mt-1 font-bold">Katılım</span>
                </div>
              </div>

              {/* Açıklama Detayları */}
              <div className="grades-attendance-details flex-1">
                <h5 className="grades-details-title text-sm font-extrabold text-blue-900 dark:text-blue-400">Devamsızlık ve Katılım Analizi</h5>
                <p className="grades-details-desc text-xs text-slate-500 mt-1 leading-relaxed">
                  Bu dönem toplam {attendance?.totalHours || 180} ders saatinin {attendance?.attendedHours || 162} saatine katılım sağladınız. Kalan hakkınızı takip edebilirsiniz.
                </p>
                <div className="grades-details-chips flex gap-2 mt-3 text-[10px] font-bold">
                  <span className="grades-chip-green bg-emerald-50 dark:bg-emerald-950/20 text-emerald-600 dark:text-emerald-400 px-2.5 py-1 rounded-full border border-emerald-100 dark:border-emerald-900/30 flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                    <span>Güvenli Sınır</span>
                  </span>
                  <span className="grades-chip-gray bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-300 px-2.5 py-1 rounded-full border border-slate-100 dark:border-slate-700 flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-slate-400" />
                    <span>{absentHours} Saat Devamsızlık</span>
                  </span>
                </div>
              </div>
            </div>

            {/* Geçmiş Devamsızlık Detayları Listesi */}
            <div className="border-t border-slate-50 dark:border-slate-800/60 pt-4 space-y-3">
              <h6 className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
                Geçmiş Devamsızlık Detayları
              </h6>
              
              <div className="divide-y divide-slate-50 dark:divide-slate-800/40">
                {absenceDetails.map((detail) => (
                  <div key={detail.id} className="py-2 flex items-center justify-between text-xs font-semibold">
                    <div>
                      <p className="text-slate-800 dark:text-white font-bold">{detail.courseName}</p>
                      <p className="text-[9px] text-slate-400 dark:text-slate-500 font-semibold mt-0.5">Tarih: {detail.date}</p>
                    </div>
                    <span className="bg-red-50 dark:bg-red-950/30 text-red-650 dark:text-red-400 text-red-500 px-2.5 py-0.5 rounded font-extrabold text-[9px]">
                      {detail.hours} Saat Devamsızlık
                    </span>
                  </div>
                ))}
              </div>
            </div>

          </div>

        </div>

        {/* Sağ Kolon: GANO Robotu ve Hızlı Aksiyonlar */}
        <div className="grades-right-column">
          <div className="grades-robot-card">
            <div className="grades-robot-header">
              <span className="material-symbols-outlined">smart_toy</span>
              <h4 className="grades-robot-title">GANO Robotu</h4>
            </div>
            <p className="grades-robot-desc">Açıklanmamış dersleri simüle ederek GANO değişimini tahmin edin.</p>

            <form className="grades-robot-form" onSubmit={handleSimulate}>
              <div className="grades-robot-group">
                <label className="grades-robot-label">Simülasyon İçin Ders Seç</label>
                <select 
                  className="grades-robot-select text-slate-800 dark:text-white bg-white dark:bg-slate-800" 
                  value={simCourseCode}
                  onChange={(e) => handleSimCourseChange(e.target.value)}
                >
                  {studentGrades.map((g) => (
                    <option key={g.id} value={g.courseCode}>
                      {g.courseCode} {g.final === null ? '(Not Açıklanmadı)' : ''}
                    </option>
                  ))}
                </select>
              </div>
              
              <div className="grades-robot-row">
                <div className="grades-robot-col">
                  <label className="grades-robot-label">Hedef Not</label>
                  <input 
                    className="grades-robot-input bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-white" 
                    type="number" 
                    placeholder="Örn: 85" 
                    value={simTargetScore}
                    onChange={(e) => setSimTargetScore(e.target.value)}
                  />
                </div>
                <div className="grades-robot-col">
                  <label className="grades-robot-label">AKTS</label>
                  <input 
                    className="grades-robot-input" 
                    type="number" 
                    placeholder="AKTS" 
                    value={simTargetAkts}
                    readOnly
                    style={{ backgroundColor: 'rgba(0,0,0,0.03)', cursor: 'not-allowed' }}
                  />
                </div>
              </div>
              
              <div className="grades-robot-results">
                <div className="grades-result-item">
                  <span>Mevcut GANO:</span>
                  <span className="grades-result-bold">{currentGano.toFixed(2)}</span>
                </div>
                <div className="grades-result-item">
                  <span>Tahmini GANO:</span>
                  <span className="grades-result-large text-blue-600 dark:text-blue-400">{estimatedGano.toFixed(2)}</span>
                </div>
                <div className="grades-result-progress">
                  <div className="grades-result-fill bg-gradient-to-r from-blue-600 to-emerald-500" style={{ width: `${(estimatedGano / 4.0) * 100}%` }} />
                </div>
              </div>
              
              <button type="submit" className="grades-btn-simulate bg-blue-900 hover:bg-blue-800 text-white font-bold cursor-pointer">
                Hesapla ve Karşılaştır
              </button>
            </form>
          </div>

          <div className="grades-actions-card">
            <h5 className="grades-actions-title">Hızlı İşlemler</h5>
            <div className="grades-actions-list">
              <button className="grades-action-row cursor-pointer" onClick={() => toast.success('Resmi transkript talebiniz alındı. Belgeler sekmesinden kontrol edebilirsiniz.')}>
                <div className="grades-action-left">
                  <span className="material-symbols-outlined">verified</span>
                  <span>Resmi Transkript Talebi</span>
                </div>
                <span className="material-symbols-outlined">chevron_right</span>
              </button>
              <button className="grades-action-row cursor-pointer" onClick={() => toast.success('Not itiraz formu PDF olarak indiriliyor...')}>
                <div className="grades-action-left">
                  <span className="material-symbols-outlined">grading</span>
                  <span>Not İtiraz Formu</span>
                </div>
                <span className="material-symbols-outlined">chevron_right</span>
              </button>
              <button className="grades-action-row cursor-pointer" onClick={() => toast.success('Tüm dönemlerin not dökümü PDF olarak indiriliyor...')}>
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
