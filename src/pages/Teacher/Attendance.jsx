// React, Redux, slice thunk'ları ve API fonksiyonlarının içe aktarılması
import { useState, useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useLocation } from 'react-router-dom'
import { fetchTeacherStudentsGradesAsync, updateAttendanceAsync } from '../../store/teacher/teacherSlice'
import { apiFetch } from '../../services/api'

// Ders yoklama yönetiminin yapıldığı panel bileşeni
export default function Attendance() {
  const dispatch = useDispatch()
  const location = useLocation()
  
  // Redux store'dan öğretmen durumlarının (öğrenciler, yüklenme durumları ve dersler) alınması
  const { studentsGrades, status, courses = [] } = useSelector(state => state.teacher)

  const passedCourseCode = location.state?.courseCode
  const passedGroup = location.state?.group

  const [selectedCourseCode, setSelectedCourseCode] = useState(passedCourseCode || 'WEB 307')
  const [selectedGroup, setSelectedGroup] = useState(passedGroup || 'Grup A')

  useEffect(() => {
    if (passedCourseCode) {
      setSelectedCourseCode(passedCourseCode)
    }
  }, [passedCourseCode])

  useEffect(() => {
    if (passedGroup) {
      setSelectedGroup(passedGroup)
    }
  }, [passedGroup])

  const [users, setUsers] = useState([]) // Genel kullanıcı listesi
  const [students, setStudents] = useState([]) // Eşleştirilmiş ve bu dersi alan öğrencilerin yoklama listesi

  // Bileşen yüklendiğinde ders notu/durumu listesini ve genel kullanıcı listesini çeken efekt
  useEffect(() => {
    dispatch(fetchTeacherStudentsGradesAsync())
    apiFetch('/users')
      .then(data => setUsers(data))
      .catch(err => console.error(err))
  }, [dispatch])

  // Veritabanından gelen not/yoklama durumu ile kullanıcı hesap bilgilerini eşleştiren efekt
  useEffect(() => {
    if (status === 'succeeded' && users.length > 0) {
      const mapped = studentsGrades
        .filter(g => g.courseCode === selectedCourseCode) // Seçilen dersi alanlar
        .map(g => {
          const u = users.find(user => user.id === g.studentId) || {}
          return {
            id: g.id,
            studentId: g.studentId,
            name: u.name || 'Bilinmeyen Öğrenci',
            avatar: u.name ? u.name.charAt(0) : '?',
            studentNumber: u.studentNumber || '—',
            status: g.attendanceStatus || 'Belirsiz'
          }
        })
      setStudents(mapped)
    }
  }, [studentsGrades, users, status, selectedCourseCode])

  const [toast, setToast] = useState(null) // Toast bildirim durumu
  const showToast = (message, type) => {
    setToast({ message, type })
  }

  // Toast bildirim pencerelerini 4 saniye sonra kapatan efekt
  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => {
        setToast(null)
      }, 4000)
      return () => clearTimeout(timer)
    }
  }, [toast])

  // Sınıftaki tüm öğrencilerin yoklama durumunu toplu değiştiren fonksiyon (örn: Tümünü Mevcut Yap)
  const setAllStatus = (status) => {
    setStudents(prev => prev.map(s => ({ ...s, status })))
    showToast(`Tüm öğrenciler "${status}" olarak işaretlendi.`, status === 'Mevcut' ? 'success' : 'info')
  }

  // Tek bir öğrencinin yoklama durumunu ('Mevcut', 'Yok' vb.) güncelleyen yerel fonksiyon
  const updateStatus = (id, status) => {
    setStudents(prev => prev.map(s => s.id === id ? { ...s, status } : s))
  }

  // Yapılan yoklama değişikliklerini sunucuya/Redux slice'a asenkron olarak kaydeden fonksiyon
  const handleSave = async () => {
    try {
      await Promise.all(students.map(s =>
        dispatch(updateAttendanceAsync({
          gradeId: s.id,
          attendanceStatus: s.status
        })).unwrap()
      ))
      showToast('Yoklama başarıyla kaydedildi!', 'success')
    } catch (err) {
      showToast(`Hata: ${err}`, 'error')
    }
  }

  const totalCount = students.length
  const presentCount = students.filter(s => s.status === 'Mevcut').length
  const absentCount = students.filter(s => s.status === 'Yok').length
  const uncertainCount = students.filter(s => s.status === 'Belirsiz').length
  const currentCourse = courses.find(c => c.code === selectedCourseCode)

  return (
    <section className="att-page-canvas">
      <div className="att-page-header">
        <div className="flex flex-col md:flex-row md:items-center gap-4 w-full justify-between">
          <div className="flex flex-col sm:flex-row sm:items-center gap-4">
            <div>
              <h2 className="att-page-title">Yoklama Yönetimi</h2>
              <p className="att-page-subtitle">
                {currentCourse?.name || 'Modern Web Geliştirme'} · Bugün 14:00 · {selectedGroup}
              </p>
            </div>
            <div className="flex items-center gap-2 mt-2 sm:mt-0">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider text-nowrap">Ders Seçin:</span>
              <select
                className="att-course-select"
                value={selectedCourseCode}
                onChange={(e) => setSelectedCourseCode(e.target.value)}
              >
                {courses.map(course => (
                  <option key={course.code} value={course.code}>
                    {course.code} - {course.name}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <button className="att-btn-save" onClick={handleSave}>
            <span className="material-symbols-outlined">save</span>
            <span>Yoklamayı Kaydet</span>
          </button>
        </div>
      </div>

      <div className="att-stats-row">
        <div className="att-stat-chip-navy">
          <span className="att-stat-count">{totalCount}</span>
          <span className="att-stat-label">Toplam</span>
        </div>
        <div className="att-stat-chip-green">
          <span className="att-stat-count">{presentCount}</span>
          <span className="att-stat-label">Mevcut</span>
        </div>
        <div className="att-stat-chip-red">
          <span className="att-stat-count">{absentCount}</span>
          <span className="att-stat-label">Yok</span>
        </div>
        <div className="att-stat-chip-amber">
          <span className="att-stat-count">{uncertainCount}</span>
          <span className="att-stat-label">Belirsiz</span>
        </div>
      </div>

      <div className="att-table-card">
        <div className="att-card-header">
          <button className="att-btn-bulk-green" onClick={() => setAllStatus('Mevcut')}>Tümünü Mevcut İşaretle</button>
          <button className="att-btn-bulk-red" onClick={() => setAllStatus('Yok')}>Tümünü Yok İşaretle</button>
          <button className="att-btn-bulk-amber" onClick={() => setAllStatus('Belirsiz')}>Tümünü Belirsiz İşaretle</button>
        </div>

        <div className="att-list-container">
          {students.map(student => {
            let badgeClass = 'att-badge-gray'
            if (student.status === 'Mevcut') badgeClass = 'att-badge-green'
            if (student.status === 'Yok') badgeClass = 'att-badge-red'
            if (student.status === 'Belirsiz') badgeClass = 'att-badge-amber'

            return (
              <div key={student.id} className="att-student-row">
                <div className="att-student-left">
                  <div className="att-student-avatar">{student.avatar}</div>
                  <div>
                    <p className="att-student-name">{student.name}</p>
                    <p className="att-student-id">{student.studentNumber}</p>
                  </div>
                </div>
                <div className="att-student-right">
                  <span className={badgeClass}>{student.status}</span>
                  <div className="att-actions-wrap">
                    <button
                      className={`att-btn-check ${student.status === 'Mevcut' ? 'active' : ''}`}
                      title="Mevcut"
                      onClick={() => updateStatus(student.id, 'Mevcut')}
                    >
                      <span className="material-symbols-outlined">check</span>
                    </button>
                    <button
                      className={`att-btn-absent ${student.status === 'Yok' ? 'active' : ''}`}
                      title="Yok"
                      onClick={() => updateStatus(student.id, 'Yok')}
                    >
                      <span className="material-symbols-outlined">close</span>
                    </button>
                    <button
                      className={`att-btn-neutral ${student.status === 'Belirsiz' ? 'active' : ''}`}
                      title="Belirsiz"
                      onClick={() => updateStatus(student.id, 'Belirsiz')}
                    >
                      <span className="material-symbols-outlined">help_outline</span>
                    </button>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </div>

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
