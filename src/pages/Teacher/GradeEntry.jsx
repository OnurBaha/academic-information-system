// React hook'ları, Redux dispatch/select metotları ve API çağrı fonksiyonlarının import edilmesi
import { useState, useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { fetchTeacherStudentsGradesAsync, updateStudentGradeAsync } from '../../store/teacher/teacherSlice'
import { apiFetch } from '../../services/api'

// Öğretmenin not girişi yaptığı "Not Giriş Sistemi" bileşeni
export default function GradeEntry() {
  const dispatch = useDispatch()
  
  // Redux store'dan öğretmen durumlarının (öğrenci notları, yüklenme durumu, dersler ve ödevler) alınması
  const { studentsGrades, status, courses = [], homeworkReviews = [] } = useSelector(state => state.teacher)

  const [activeTab, setActiveTab] = useState('exams') // 'exams' veya 'homeworks' sekmeleri
  const [users, setUsers] = useState([]) // Tüm kullanıcı/öğrenci hesap bilgileri
  const [students, setStudents] = useState([]) // Bu derse kayıtlı öğrencilerin eşleştirilmiş not listesi

  // WEB 307 dersinin ödevlerini filtreleme
  const currentCourse = courses.find(c => c.code === 'WEB 307')
  const courseHomeworks = currentCourse ? currentCourse.homeworks : []

  // Bileşen yüklendiğinde öğrenci notlarını ve genel kullanıcı listesini API'den çekme
  useEffect(() => {
    dispatch(fetchTeacherStudentsGradesAsync())
    apiFetch('/users')
      .then(data => setUsers(data))
      .catch(err => console.error(err))
  }, [dispatch])

  // Gelen not verileri ile kullanıcı (ad, numara vb.) bilgilerini eşleştirip yerel state'e atayan efekt
  useEffect(() => {
    if (status === 'succeeded' && users.length > 0) {
      const mapped = studentsGrades
        .filter(g => g.courseCode === 'WEB 307') // Sadece bu derse ait notları filtrele
        .map(g => {
          const u = users.find(user => user.id === g.studentId) || {}
          return {
            id: g.id,
            studentId: g.studentId,
            name: u.name || 'Bilinmeyen Öğrenci',
            avatar: u.name ? u.name.charAt(0) : '?',
            studentNumber: u.studentNumber || '—',
            midterm: g.midterm !== null && g.midterm !== undefined ? g.midterm : '',
            final: g.final !== null && g.final !== undefined ? g.final : '',
            project: g.project !== null && g.project !== undefined ? g.project : ''
          }
        })
      setStudents(mapped)
    }
  }, [studentsGrades, users, status])

  const [toast, setToast] = useState(null) // Toast bildirim durumu
  const showToast = (message, type) => {
    setToast({ message, type })
  }

  // Öğrencinin ödev not ortalamasını hesaplayan fonksiyon (geç teslim edilmemiş ve aktif ödevlere göre)
  const calculateStudentHomeworkAverage = (studentId, courseCode) => {
    const course = courses.find(c => c.code === courseCode)
    if (!course || !course.homeworks || course.homeworks.length === 0) return { average: 0, nonSubmittedCount: 0 }

    const isDueDatePassed = (dueDateStr) => {
      if (!dueDateStr) return true
      const parts = dueDateStr.split(' - ')
      const datePart = parts[0].trim()
      const timePart = parts[1] ? parts[1].trim() : null

      const dateParts = datePart.split('.')
      if (dateParts.length !== 3) return true
      const day = parseInt(dateParts[0], 10)
      const month = parseInt(dateParts[1], 10) - 1
      const year = parseInt(dateParts[2], 10)

      let hours = 23
      let minutes = 59
      if (timePart) {
        const timeParts = timePart.split(':')
        if (timeParts.length === 2) {
          hours = parseInt(timeParts[0], 10)
          minutes = parseInt(timeParts[1], 10)
        }
      }

      const dueDateTime = new Date(year, month, day, hours, minutes, 59)
      return new Date() > dueDateTime
    }

    const activeHomeworks = course.homeworks.filter(hw => {
      const review = homeworkReviews.find(r => 
        r.studentId === studentId && 
        r.courseCode === courseCode && 
        r.homeworkId === hw.id
      )
      const hasGrade = review && review.grade !== '' && review.grade !== undefined && review.grade !== null
      return isDueDatePassed(hw.dueDate) || hasGrade
    })
    if (activeHomeworks.length === 0) return { average: 0, nonSubmittedCount: 0 }

    let weightedScoreSum = 0
    let totalWeight = 0
    let nonSubmittedCount = 0

    activeHomeworks.forEach(hw => {
      const review = homeworkReviews.find(r => 
        r.studentId === studentId && 
        r.courseCode === courseCode && 
        r.homeworkId === hw.id
      )
      
      const isSubmitted = !!review && review.status !== 'Teslim Edilmedi'
      if (!isSubmitted) {
        nonSubmittedCount++
      }

      let grade = 0
      if (review && review.grade !== '' && review.grade !== undefined && review.grade !== null) {
        grade = Number(review.grade)
      }

      const weight = hw.weight !== undefined ? Number(hw.weight) : 0
      weightedScoreSum += grade * weight
      totalWeight += weight
    })

    let average = 0
    if (totalWeight > 0) {
      average = weightedScoreSum / totalWeight
    } else {
      const gradedReviews = activeHomeworks.map(hw => {
        const review = homeworkReviews.find(r => 
          r.studentId === studentId && 
          r.courseCode === courseCode && 
          r.homeworkId === hw.id
        )
        return review && review.grade !== '' && review.grade !== undefined && review.grade !== null ? Number(review.grade) : 0
      })
      average = gradedReviews.reduce((sum, g) => sum + g, 0) / activeHomeworks.length
    }

    return {
      average: Math.round(average * 10) / 10,
      nonSubmittedCount
    }
  }

  // Ödevlerin hücre bazında durum veya notunu getiren fonksiyon
  const getHomeworkCellStatus = (studentNumber, hw) => {
    const review = homeworkReviews.find(r => 
      r.studentId === studentNumber && 
      r.courseCode === 'WEB 307' && 
      r.homeworkId === hw.id
    )

    if (review && review.grade !== '' && review.grade !== undefined && review.grade !== null) {
      return {
        text: review.grade,
        className: 'font-bold text-slate-800'
      }
    }

    if (review && review.status === 'Bekliyor') {
      return {
        text: 'Bekliyor',
        className: 'text-amber-600 bg-amber-50 px-2 py-0.5 rounded text-xs font-semibold'
      }
    }

    const isDueDatePassed = (dueDateStr) => {
      if (!dueDateStr) return true
      const parts = dueDateStr.split(' - ')
      const datePart = parts[0].trim()
      const timePart = parts[1] ? parts[1].trim() : null

      const dateParts = datePart.split('.')
      if (dateParts.length !== 3) return true
      const day = parseInt(dateParts[0], 10)
      const month = parseInt(dateParts[1], 10) - 1
      const year = parseInt(dateParts[2], 10)

      let hours = 23
      let minutes = 59
      if (timePart) {
        const timeParts = timePart.split(':')
        if (timeParts.length === 2) {
          hours = parseInt(timeParts[0], 10)
          minutes = parseInt(timeParts[1], 10)
        }
      }

      const dueDateTime = new Date(year, month, day, hours, minutes, 59)
      return new Date() > dueDateTime
    }

    const passed = isDueDatePassed(hw.dueDate)
    if (passed) {
      return {
        text: '0 (Teslim Edilmedi)',
        className: 'text-rose-500 text-xs font-medium'
      }
    }

    return {
      text: 'Süreçte',
      className: 'text-slate-400 text-xs italic'
    }
  }

  // Ortalama notuna göre rozet (badge) CSS sınıfını getiren fonksiyon
  const getAverageBadgeClass = (avg) => {
    if (avg >= 80) return 'px-2.5 py-1 bg-emerald-50 text-emerald-700 text-xs font-bold rounded-full border border-emerald-100/50'
    if (avg >= 60) return 'px-2.5 py-1 bg-blue-50 text-blue-700 text-xs font-bold rounded-full border border-blue-100/50'
    if (avg >= 45) return 'px-2.5 py-1 bg-amber-50 text-amber-700 text-xs font-bold rounded-full border border-amber-100/50'
    return 'px-2.5 py-1 bg-rose-50 text-rose-700 text-xs font-bold rounded-full border border-rose-100/50'
  }

  // Toast bildirimlerini 4 saniye sonra kapatan efekt
  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => {
        setToast(null)
      }, 4000)
      return () => clearTimeout(timer)
    }
  }, [toast])

  // Vize (%25), Proje (%25), Ödev (%15) ve Final (%35) notlarına göre harf notunu hesaplayan yardımcı fonksiyon
  const calculateLetterGrade = (midterm, final, project, homeworkAvg = 0) => {
    if (midterm === '' || final === '' || midterm === null || final === null) return '—'
    const m = parseFloat(midterm) || 0
    const f = parseFloat(final) || 0
    const p = parseFloat(project) || 0
    const hw = parseFloat(homeworkAvg) || 0
    const average = Math.round((m * 0.25) + (p * 0.25) + (hw * 0.15) + (f * 0.35))

    if (average >= 90) return 'AA'
    if (average >= 80) return 'BA'
    if (average >= 70) return 'BB'
    if (average >= 60) return 'CB'
    if (average >= 50) return 'CC'
    if (average >= 45) return 'DC'
    return 'FF'
  }

  // Kullanıcı girdi alanlarındaki (vize, final, proje) not değişimlerini kontrol edip filtreleyen fonksiyon
  const handleGradeChange = (id, field, value) => {
    // Sadece 0-100 arasındaki geçerli sayıları veya boş string'i kabul et
    if (value !== '' && (isNaN(value) || parseFloat(value) < 0 || parseFloat(value) > 100)) {
      return
    }
    setStudents(prev => prev.map(s => {
      if (s.id === id) {
        return {
          ...s,
          [field]: value === '' ? '' : parseFloat(value)
        }
      }
      return s
    }))
  }

  // Excel'den not yüklenmesini simüle eden rastgele not doldurma fonksiyonu
  const handleExcelImport = () => {
    setStudents(prev => prev.map(s => ({
      ...s,
      midterm: s.midterm === '' ? Math.floor(Math.random() * 41) + 60 : s.midterm,
      final: s.final === '' ? Math.floor(Math.random() * 41) + 60 : s.final,
      project: s.project === '' ? Math.floor(Math.random() * 41) + 60 : s.project,
    })))
    showToast('Excel şablonu başarıyla içe aktarıldı. Boş notlar dolduruldu.', 'success')
  }

  // Düzenlenen notları asenkron olarak Redux slice/sunucu üzerine kaydeden fonksiyon
  const handleSave = async () => {
    try {
      await Promise.all(students.map(s => {
        const hwStats = calculateStudentHomeworkAverage(s.studentNumber, 'WEB 307')
        return dispatch(updateStudentGradeAsync({
          gradeId: s.id,
          midterm: s.midterm,
          final: s.final,
          project: s.project,
          homeworkAverage: hwStats.average
        })).unwrap()
      }))
      showToast('Notlar başarıyla sisteme kaydedildi!', 'success')
    } catch (err) {
      showToast(`Hata: ${err}`, 'error')
    }
  }

  // Harf notuna göre görsel rozet (badge) CSS sınıfını getiren fonksiyon
  const getBadgeClass = (letter) => {
    if (letter === 'AA' || letter === 'BA') return 'grades-entry-badge-green'
    if (letter === 'BB' || letter === 'CB' || letter === 'CC') return 'grades-entry-badge-blue'
    if (letter === 'DC' || letter === 'FF') return 'grades-entry-badge-amber'
    return 'grades-entry-badge-gray'
  }

  const totalCount = students.length
  const dynamicEntered = students.filter(s => s.midterm !== '' && s.final !== '').length
  const dynamicPending = totalCount - dynamicEntered

  return (
    <section className="grades-entry-canvas">
      <div className="grades-entry-header">
        <div>
          <h2 className="grades-entry-title">Not Giriş Sistemi</h2>
          <p className="grades-entry-subtitle">Web Programming (Full-Stack .NET &amp; React) · Grup A</p>
        </div>
        {activeTab === 'exams' && (
          <div className="grades-entry-actions">
            <button className="grades-entry-btn-excel" onClick={handleExcelImport}>
              <span className="material-symbols-outlined">upload</span>
              <span>Excel İçe Aktar</span>
            </button>
            <button className="grades-entry-btn-save" onClick={handleSave}>
              <span className="material-symbols-outlined">save</span>
              <span>Kaydet</span>
            </button>
          </div>
        )}
      </div>

      {/* Sekme Menüsü */}
      <div className="flex gap-6 border-b border-slate-200 pb-0 mb-2">
        <button
          onClick={() => setActiveTab('exams')}
          className={`pb-3 text-xs sm:text-sm font-bold relative transition-all cursor-pointer border-none bg-transparent ${
            activeTab === 'exams'
              ? 'text-blue-900 font-extrabold'
              : 'text-slate-400 hover:text-slate-600'
          }`}
        >
          <div className="flex items-center gap-1.5">
            <span className="material-symbols-outlined text-lg">edit_note</span>
            <span>Sınav &amp; Proje Notları</span>
          </div>
          {activeTab === 'exams' && (
            <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-900 rounded-full" />
          )}
        </button>
        <button
          onClick={() => setActiveTab('homeworks')}
          className={`pb-3 text-xs sm:text-sm font-bold relative transition-all cursor-pointer border-none bg-transparent ${
            activeTab === 'homeworks'
              ? 'text-blue-900 font-extrabold'
              : 'text-slate-400 hover:text-slate-600'
          }`}
        >
          <div className="flex items-center gap-1.5">
            <span className="material-symbols-outlined text-lg">assignment</span>
            <span>Ödev Notları</span>
          </div>
          {activeTab === 'homeworks' && (
            <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-900 rounded-full" />
          )}
        </button>
      </div>

      {activeTab === 'exams' ? (
        <div className="grades-entry-table-card">
          <div className="grades-entry-card-header">
            <div>
              <h4 className="grades-entry-card-title">Öğrenci Not Çizelgesi</h4>
            </div>
            <div className="grades-entry-card-meta">
              <span>Toplam: <strong className="grades-meta-navy">{totalCount}</strong> öğrenci</span>
              <span>Girildi: <strong className="grades-meta-green">{dynamicEntered}</strong></span>
              <span>Bekliyor: <strong className="grades-meta-amber">{dynamicPending}</strong></span>
            </div>
          </div>

          <div className="grades-entry-table-scroll">
            <table className="grades-entry-data-table">
              <thead>
                <tr>
                  <th className="grades-entry-th-left">#</th>
                  <th className="grades-entry-th-left">Öğrenci Adı</th>
                  <th className="grades-entry-th-left">Öğrenci No</th>
                  <th className="grades-entry-th-center">Vize (%25)</th>
                  <th className="grades-entry-th-center">Ödev (%15)</th>
                  <th className="grades-entry-th-center">Proje (%25)</th>
                  <th className="grades-entry-th-center">Final (%35)</th>
                  <th className="grades-entry-th-center">Harf Notu</th>
                  <th className="grades-entry-th-center">İşlem</th>
                </tr>
              </thead>
              <tbody>
                {students.map((student, index) => {
                  const hwStats = calculateStudentHomeworkAverage(student.studentNumber, 'WEB 307')
                  const letter = calculateLetterGrade(student.midterm, student.final, student.project, hwStats.average)
                  return (
                    <tr key={student.id} className="grades-entry-row">
                      <td className="grades-entry-td-left-num">{index + 1}</td>
                      <td className="grades-entry-td-left">
                        <div className="grades-entry-student-box">
                          <div className="grades-entry-avatar">{student.avatar}</div>
                          <span className="grades-entry-name">{student.name}</span>
                        </div>
                      </td>
                      <td className="grades-entry-td-left-id">{student.studentNumber}</td>
                      <td className="grades-entry-td-center">
                        <input
                          className="grades-entry-input"
                          type="number"
                          value={student.midterm}
                          onChange={e => handleGradeChange(student.id, 'midterm', e.target.value)}
                          min={0}
                          max={100}
                        />
                      </td>
                      <td className="grades-entry-td-center">
                        <input
                          className="grades-entry-input bg-slate-50 text-slate-500 cursor-not-allowed"
                          type="number"
                          value={hwStats.average}
                          readOnly
                        />
                      </td>
                      <td className="grades-entry-td-center">
                        <input
                          className="grades-entry-input"
                          type="number"
                          value={student.project}
                          onChange={e => handleGradeChange(student.id, 'project', e.target.value)}
                          min={0}
                          max={100}
                        />
                      </td>
                      <td className="grades-entry-td-center">
                        <input
                          className="grades-entry-input"
                          type="number"
                          value={student.final}
                          onChange={e => handleGradeChange(student.id, 'final', e.target.value)}
                          min={0}
                          max={100}
                        />
                      </td>
                      <td className="grades-entry-td-center">
                        <span className={getBadgeClass(letter)}>{letter}</span>
                      </td>
                      <td className="grades-entry-td-center">
                        <button
                          className="grades-entry-btn-edit"
                          onClick={() => {
                            showToast(`${student.name} için not düzenleme hücresi odaklandı.`, 'info')
                          }}
                        >
                          <span className="material-symbols-outlined">edit</span>
                        </button>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="grades-entry-table-card">
          <div className="grades-entry-card-header bg-slate-50/50">
            <div>
              <h4 className="grades-entry-card-title">Ödev Takip Çizelgesi</h4>
              <p className="grades-entry-card-subtitle">
                Ödev notları ve ağırlıklı ortalamalar Ödev Kontrol Merkezi'nden otomatik yansıtılır.
              </p>
            </div>
            <div className="grades-entry-card-meta">
              <span>Toplam: <strong className="grades-meta-navy">{totalCount}</strong> öğrenci</span>
              <span>Ödev Sayısı: <strong className="text-blue-900 font-bold">{courseHomeworks.length}</strong></span>
            </div>
          </div>

          <div className="grades-entry-table-scroll">
            <table className="grades-entry-data-table">
              <thead>
                <tr>
                  <th className="grades-entry-th-left">#</th>
                  <th className="grades-entry-th-left">Öğrenci Adı</th>
                  <th className="grades-entry-th-left">Öğrenci No</th>
                  {courseHomeworks.map((hw, idx) => (
                    <th key={hw.id} className="grades-entry-th-center" title={hw.title}>
                      Ödev #{idx + 1} (%{hw.weight})
                    </th>
                  ))}
                  <th className="grades-entry-th-center">Ödev Ortalaması</th>
                </tr>
              </thead>
              <tbody>
                {students.map((student, index) => {
                  const hwStats = calculateStudentHomeworkAverage(student.studentNumber, 'WEB 307')
                  return (
                    <tr key={student.id} className="grades-entry-row">
                      <td className="grades-entry-td-left-num">{index + 1}</td>
                      <td className="grades-entry-td-left">
                        <div className="grades-entry-student-box">
                          <div className="grades-entry-avatar bg-blue-50 text-blue-900 font-bold">{student.avatar}</div>
                          <span className="grades-entry-name">{student.name}</span>
                        </div>
                      </td>
                      <td className="grades-entry-td-left-id">{student.studentNumber}</td>
                      {courseHomeworks.map(hw => {
                        const statusVal = getHomeworkCellStatus(student.studentNumber, hw)
                        return (
                          <td key={hw.id} className="grades-entry-td-center">
                            <span className={statusVal.className}>{statusVal.text}</span>
                          </td>
                        )
                      })}
                      <td className="grades-entry-td-center">
                        <span className={getAverageBadgeClass(hwStats.average)}>
                          {hwStats.average}/100
                        </span>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {toast && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-2.5 px-5 py-3.5 rounded-xl shadow-xl bg-slate-900 text-slate-100 border-l-4 border-emerald-500 teacher-toast-notification font-medium text-sm">
          <span className="material-symbols-outlined text-emerald-500">
            {toast.type === 'success' ? 'check_circle' : 'info'}
          </span>
          <span>{toast.message}</span>
        </div>
      )}
    </section>
  )
}
