// React hook'ları, Redux dispatch/select metotları ve API çağrı fonksiyonlarının import edilmesi
import { useState, useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { fetchTeacherStudentsGradesAsync, updateStudentGradeAsync, fetchTeacherDashboardDataAsync } from '../../store/teacher/teacherSlice'
import { apiFetch } from '../../services/api'
import { calculateScore, getLetterGrade } from '../../utils/studentCalc'

export default function GradeEntry() {
  const dispatch = useDispatch()
  const { currentUser } = useSelector(state => state.auth || {})
  const { studentsGrades, status, courses = [], homeworkReviews = [] } = useSelector(state => state.teacher)

  const [selectedCourseCode, setSelectedCourseCode] = useState('')
  const [activeTab, setActiveTab] = useState('exams')
  const [users, setUsers] = useState([])
  const [students, setStudents] = useState([])
  const [termStatus, setTermStatus] = useState({ isGradeLocksActive: false, isTermClosed: false })
  const [toast, setToast] = useState(null)

  // Load teacher dashboard data on mount to get courses list
  useEffect(() => {
    dispatch(fetchTeacherDashboardDataAsync())
    dispatch(fetchTeacherStudentsGradesAsync())
    apiFetch('/users')
      .then(data => setUsers(data))
      .catch(err => console.error(err))
    
    // Fetch term status
    apiFetch('/termStatus')
      .then(data => setTermStatus(data))
      .catch(err => console.error(err))
  }, [dispatch])

  // Select the first course code taught by the teacher
  const teacherCourses = courses.filter(c => c.instructor === currentUser?.name)
  
  useEffect(() => {
    if (teacherCourses.length > 0 && !selectedCourseCode) {
      setSelectedCourseCode(teacherCourses[0].code)
    }
  }, [courses, currentUser, selectedCourseCode])

  const currentCourse = courses.find(c => c.code === selectedCourseCode)
  const courseHomeworks = currentCourse ? currentCourse.homeworks || [] : []

  // Map enrolled students dynamically
  useEffect(() => {
    if (status === 'succeeded' && users.length > 0 && selectedCourseCode) {
      const mapped = studentsGrades
        .filter(g => g.courseCode === selectedCourseCode)
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
  }, [studentsGrades, users, status, selectedCourseCode])

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
  const getHomeworkCellStatus = (studentId, hw) => {
    const review = homeworkReviews.find(r => 
      r.studentId === studentId && 
      r.courseCode === selectedCourseCode && 
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

  // Vize (%25 veya %40), Proje (%25), Ödev (%15) ve Final (%35 veya %60) notlarına göre harf notunu hesaplayan ortak fonksiyon
  const calculateLetterGrade = (midterm, final, project, homeworkAvg = 0) => {
    if (midterm === '' || final === '' || midterm === null || final === null) return '—'
    const score = calculateScore(midterm, final, project !== '' && project !== null ? project : undefined, homeworkAvg || 0)
    return getLetterGrade(score)
  }

  // Kullanıcı girdi alanlarındaki (vize, final, proje) not değişimlerini kontrol edip filtreleyen fonksiyon
  const handleGradeChange = (id, field, value) => {
    if (termStatus.isGradeLocksActive) return;
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
    if (termStatus.isGradeLocksActive) {
      showToast('Not girişleri kilitli olduğu için içe aktarma yapılamaz.', 'error')
      return
    }
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
    if (termStatus.isGradeLocksActive) {
      showToast('Not girişleri kilitli olduğu için kayıt yapılamaz.', 'error')
      return
    }
    try {
      await Promise.all(students.map(s => {
        const hwStats = calculateStudentHomeworkAverage(s.studentId, selectedCourseCode)
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
      {termStatus.isGradeLocksActive && (
        <div className="bg-amber-50 border border-solid border-amber-200 text-amber-800 px-4 py-3 rounded-xl mb-4 flex items-center gap-2.5 text-xs font-semibold shadow-sm">
          <span className="material-symbols-outlined text-amber-600 text-base">lock</span>
          <span>
            Bu dönemin not girişleri dekanlık kararıyla resmi olarak kilitlenmiştir. Not güncellemeleri, kaydetme ve Excel işlemleri kapalıdır.
          </span>
        </div>
      )}
      <div className="grades-entry-header">
        <div className="flex flex-col gap-1.5">
          <h2 className="grades-entry-title">Not Giriş Sistemi</h2>
          <div className="flex items-center gap-3">
            <span className="text-xs font-semibold text-slate-500">Aktif Ders:</span>
            <select
              value={selectedCourseCode}
              onChange={(e) => setSelectedCourseCode(e.target.value)}
              className="p-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-bold text-slate-800 dark:text-white focus:outline-none focus:ring-1 focus:ring-blue-500"
            >
              {teacherCourses.map(c => (
                <option key={c.id} value={c.code}>{c.code} - {c.name}</option>
              ))}
            </select>
          </div>
        </div>
        {activeTab === 'exams' && (
          <div className="grades-entry-actions">
            <button 
              className="grades-entry-btn-excel" 
              onClick={handleExcelImport}
              disabled={termStatus.isGradeLocksActive}
              style={{ opacity: termStatus.isGradeLocksActive ? 0.5 : 1, cursor: termStatus.isGradeLocksActive ? 'not-allowed' : 'pointer' }}
            >
              <span className="material-symbols-outlined">upload</span>
              <span>Excel İçe Aktar</span>
            </button>
            <button 
              className="grades-entry-btn-save" 
              onClick={handleSave}
              disabled={termStatus.isGradeLocksActive}
              style={{ opacity: termStatus.isGradeLocksActive ? 0.5 : 1, cursor: termStatus.isGradeLocksActive ? 'not-allowed' : 'pointer' }}
            >
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
                  const hwStats = calculateStudentHomeworkAverage(student.studentId, selectedCourseCode)
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
                          disabled={termStatus.isGradeLocksActive}
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
                          disabled={termStatus.isGradeLocksActive}
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
                          disabled={termStatus.isGradeLocksActive}
                        />
                      </td>
                      <td className="grades-entry-td-center">
                        <span className={getBadgeClass(letter)}>{letter}</span>
                      </td>
                      <td className="grades-entry-td-center">
                        <button
                          className="grades-entry-btn-edit"
                          disabled={termStatus.isGradeLocksActive}
                          style={{ opacity: termStatus.isGradeLocksActive ? 0.5 : 1, cursor: termStatus.isGradeLocksActive ? 'not-allowed' : 'pointer' }}
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
              <h4 className="grades-entry-card-title">Ögev Takip Çizelgesi</h4>
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
                  const hwStats = calculateStudentHomeworkAverage(student.studentId, selectedCourseCode)
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
                        const statusVal = getHomeworkCellStatus(student.studentId, hw)
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
