import { useState, useEffect, useMemo } from 'react'
import { useLocation } from 'react-router-dom'
import { useSelector, useDispatch } from 'react-redux'
import { evaluateHomework, addHomework, updateHomeworkWeights } from '../../store/teacher/teacherSlice'
import { fetchTeacherStudentsGradesAsync, fetchTeacherDashboardDataAsync } from '../../store/teacher/teacherSlice'

export default function HomeworkReview() {
  const location = useLocation()
  const dispatch = useDispatch()
  const [viewMode, setViewMode] = useState('homework-based')

  const { currentUser } = useSelector(state => state.auth || {})
  const { homeworkReviews = [], courses: COURSES = [], studentsGrades = [], users = [] } = useSelector(state => state.teacher || {})

  // Fetch teacher data on mount
  useEffect(() => {
    dispatch(fetchTeacherDashboardDataAsync())
    dispatch(fetchTeacherStudentsGradesAsync())
  }, [dispatch])

  const teacherCourses = COURSES.filter(c => c.instructor === currentUser?.name)

  const [selectedCourse, setSelectedCourse] = useState('')
  const [selectedHomework, setSelectedHomework] = useState('')
  const [selectedStudentId, setSelectedStudentId] = useState('')
  const [subFilterTab, setSubFilterTab] = useState('All')
  const [teacherCurrentPage, setTeacherCurrentPage] = useState(1)

  useEffect(() => {
    setTeacherCurrentPage(1)
  }, [selectedCourse, selectedHomework, subFilterTab])

  // Dynamic student derivation
  const students = useMemo(() => {
    if (!studentsGrades.length || !users.length || !selectedCourse) return []
    const gradesForCourse = studentsGrades.filter(g => g.courseCode === selectedCourse)
    return gradesForCourse.map(g => {
      const u = users.find(user => user.id === g.studentId) || {}
      return {
        id: u.id || '',
        studentNumber: u.studentNumber || '—',
        name: u.name || 'Bilinmeyen Öğrenci',
        avatar: u.name ? u.name.charAt(0) : '?',
        email: u.email || '—',
        group: (g.group || 'Sınıf A').replace('Grup', 'Sınıf'),
        attendance: (100 - (g.absencePercentage || 0)) + '%',
        grade: g.letterGrade || 'Süreçte',
        status: u.status || 'active'
      }
    })
  }, [studentsGrades, users, selectedCourse])

  useEffect(() => {
    if (teacherCourses.length > 0 && !selectedCourse) {
      setSelectedCourse(teacherCourses[0].code)
      if (teacherCourses[0].homeworks && teacherCourses[0].homeworks.length > 0) {
        setSelectedHomework(teacherCourses[0].homeworks[0].id)
      }
    }
  }, [COURSES, currentUser, teacherCourses, selectedCourse])

  const currentCourse = COURSES.find(c => c.code === selectedCourse)
  const currentHw = currentCourse?.homeworks?.find(h => h.id === selectedHomework)

  // Giriş değerlerini yönetmek için yerel durumlar (Input States)
  // Key formatı: `${studentId}_${courseCode}_${homeworkId}`
  const [grades, setGrades] = useState({})
  const [feedbacks, setFeedbacks] = useState({})
  const [toast, setToast] = useState(null)

  // Ağırlık Düzenleme Durumları
  const [isEditingWeights, setIsEditingWeights] = useState(false)
  const [tempWeights, setTempWeights] = useState({})

  // Yeni Ödev Ekleme Modalı Durumları
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)
  const [newHwCourseCode, setNewHwCourseCode] = useState('WEB 307')
  const [newHwTitle, setNewHwTitle] = useState('')
  const [newHwGivenDate, setNewHwGivenDate] = useState('')
  const [newHwDueDate, setNewHwDueDate] = useState('')
  const [newHwWeight, setNewHwWeight] = useState('0')

  const formatDatePickerDate = (dateStr) => {
    if (!dateStr) return ''
    const parts = dateStr.split('-')
    if (parts.length !== 3) return dateStr
    const [year, month, day] = parts
    return `${day}.${month}.${year}`
  }

  const handleOpenAddModal = () => {
    const now = new Date()
    const year = now.getFullYear()
    const month = String(now.getMonth() + 1).padStart(2, '0')
    const day = String(now.getDate()).padStart(2, '0')
    
    setNewHwCourseCode(selectedCourse || (teacherCourses[0]?.code || ''))
    setNewHwTitle('')
    setNewHwGivenDate(`${year}-${month}-${day}`)
    setNewHwDueDate('')
    setNewHwWeight('0')
    setIsAddModalOpen(true)
  }

  const handleCreateHomework = (e) => {
    e.preventDefault()
    if (!newHwTitle.trim()) {
      showToast('Lütfen ödev başlığını girin.', 'error')
      return
    }
    if (!newHwGivenDate) {
      showToast('Lütfen veriliş tarihini seçin.', 'error')
      return
    }
    if (!newHwDueDate) {
      showToast('Lütfen son teslim tarihini seçin.', 'error')
      return
    }

    const formattedGiven = formatDatePickerDate(newHwGivenDate)
    const formattedDue = formatDatePickerDate(newHwDueDate)

    // Dispatch action
    dispatch(addHomework({
      courseCode: newHwCourseCode,
      homeworkPayload: {
        title: newHwTitle,
        givenDate: formattedGiven,
        dueDate: formattedDue,
        weight: Number(newHwWeight)
      }
    }))

    // Bir sonraki ödev ID'sini hesaplama
    const courseObj = COURSES.find(c => c.code === newHwCourseCode)
    const nextHwId = courseObj ? `hw-${courseObj.homeworks.length + 1}` : 'hw-1'

    // Otomatik olarak yeni oluşturulan ödeve odaklan
    setSelectedCourse(newHwCourseCode)
    setSelectedHomework(nextHwId)
    setViewMode('homework-based')

    showToast('Yeni ödev başarıyla atandı ve yayınlandı.', 'success')

    // Formu temizle ve kapat
    setNewHwTitle('')
    setNewHwGivenDate('')
    setNewHwDueDate('')
    setNewHwWeight('0')
    setIsAddModalOpen(false)
  }

  // Sayfa yönlendirmesiyle gelen filtre parametrelerini yakalama
  useEffect(() => {
    if (location.state?.filter) {
      if (location.state.filter === 'Bekliyor') {
        setSubFilterTab('Pending')
      } else if (location.state.filter === 'Done') {
        setSubFilterTab('Graded')
      }
      window.history.replaceState({}, document.title)
    }
  }, [location])

  // İlk öğrenciyi seçili hale getirme
  useEffect(() => {
    if (students.length > 0 && !selectedStudentId) {
      setSelectedStudentId(students[0].id)
    }
  }, [students, selectedStudentId])

  // Seçilen ders değiştiğinde ödev ağırlıklarını tempState'e yükleme
  useEffect(() => {
    if (currentCourse) {
      const initialWeights = {};
      (currentCourse.homeworks || []).forEach(hw => {
        initialWeights[hw.id] = hw.weight !== undefined ? hw.weight : 0
      })
      setTempWeights(initialWeights)
    }
  }, [selectedCourse, currentCourse])

  // Seçilen ders değiştiğinde otomatik olarak o derse ait ilk ödevi seçme
  const handleCourseChange = (courseCode) => {
    setSelectedCourse(courseCode)
    const course = COURSES.find(c => c.code === courseCode)
    if (course && (course.homeworks || []).length > 0) {
      setSelectedHomework(course.homeworks[0].id)
    }
  }

  const showToast = (message, type) => {
    setToast({ message, type })
  }

  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => {
        setToast(null)
      }, 4000)
      return () => clearTimeout(timer)
    }
  }, [toast])

  const handleOpenGithub = (url) => {
    if (!url) {
      showToast('Bu öğrenci ödev teslim etmemiştir.', 'error')
      return
    }
    window.open(url, '_blank')
    showToast('Öğrenci GitHub deposu yeni sekmede açıldı.', 'success')
  }

  const handleGradeChangeLocal = (key, val) => {
    if (val === '') {
      setGrades(prev => ({ ...prev, [key]: '' }))
    } else {
      const num = parseInt(val, 10)
      if (!isNaN(num) && num >= 0 && num <= 100) {
        setGrades(prev => ({ ...prev, [key]: num }))
      }
    }
  }

  const handleFeedbackChangeLocal = (key, val) => {
    setFeedbacks(prev => ({ ...prev, [key]: val }))
  }

  const handleSaveEvaluationLocal = (student, courseCode, homeworkId, isApprove = false, isCancelApproval = false) => {
    const key = `${student.id}_${courseCode}_${homeworkId}`
    const review = homeworkReviews.find(r => 
      r.studentId === student.id && 
      r.courseCode === courseCode && 
      r.homeworkId === homeworkId
    )

    const grade = grades[key] !== undefined ? grades[key] : (review?.grade !== undefined ? review.grade : '')
    const feedback = feedbacks[key] !== undefined ? feedbacks[key] : (review?.feedback || '')
    
    let status = 'İncelendi'
    if (isCancelApproval) {
      status = 'İncelendi'
    } else if (isApprove) {
      status = 'Onaylandı'
    } else {
      status = review?.status === 'Bekliyor' ? 'İncelendi' : (review?.status || 'İncelendi')
    }

    dispatch(evaluateHomework({
      studentId: student.id,
      courseCode,
      homeworkId,
      name: student.name,
      avatar: student.avatar,
      grade,
      feedback,
      status
    }))

    if (isCancelApproval) {
      showToast(`${student.name} ödev onayı iptal edildi.`, 'info')
    } else {
      showToast(`${student.name} değerlendirmesi başarıyla kaydedildi.`, 'success')
    }
  }

  const handleSaveWeights = (e) => {
    e.preventDefault()
    dispatch(updateHomeworkWeights({
      courseCode: selectedCourse,
      weights: tempWeights
    }))
    const total = Object.values(tempWeights).reduce((sum, w) => sum + (Number(w) || 0), 0)
    if (total === 100) {
      showToast('Ödev ağırlık yüzdeleri başarıyla kaydedildi.', 'success')
    } else {
      showToast(`Ödev ağırlık yüzdeleri kaydedildi. Toplam ağırlık: %${total}. (Öneri: Ağırlık toplamının %100 olması tavsiye edilir.)`, 'info')
    }
    setIsEditingWeights(false)
  }

  const calculateStudentHomeworkAverage = (studentId, courseCode) => {
    const course = COURSES.find(c => c.code === courseCode)
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
      // Fallback to arithmetic average if total weight is 0
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

  // Bekleyen inceleme sayısını dinamik hesaplama
  const pendingCount = homeworkReviews.filter(r => r.status === 'Bekliyor').length

  // Ödev Bazlı Görünüm için Öğrenci Listesi ve Filtreleme
  const studentsWithStatus = students.map(student => {
    const review = homeworkReviews.find(r => 
      r.studentId === student.id && 
      r.courseCode === selectedCourse && 
      r.homeworkId === selectedHomework
    )
    return {
      student,
      review,
      isSubmitted: !!review && review.status !== 'Teslim Edilmedi',
      status: review ? review.status : 'Teslim Edilmedi'
    }
  })

  const filteredStudents = studentsWithStatus.filter(item => {
    if (subFilterTab === 'Submitted') return item.isSubmitted
    if (subFilterTab === 'Pending') return item.review?.status === 'Bekliyor'
    if (subFilterTab === 'Graded') return item.review?.status === 'İncelendi' || item.review?.status === 'Onaylandı'
    if (subFilterTab === 'NotSubmitted') return !item.isSubmitted
    return true
  })

  const sortedFilteredStudents = useMemo(() => {
    return [...filteredStudents].sort((a, b) => {
      const statusOrder = {
        'Bekliyor': 1,
        'İncelendi': 2,
        'Onaylandı': 3,
        'Teslim Edilmedi': 4
      }
      const orderA = statusOrder[a.status] || 99
      const orderB = statusOrder[b.status] || 99
      return orderA - orderB
    })
  }, [filteredStudents])

  const tItemsPerPage = 5
  const tTotalPages = Math.ceil(sortedFilteredStudents.length / tItemsPerPage) || 1

  useEffect(() => {
    if (teacherCurrentPage > tTotalPages) {
      setTeacherCurrentPage(tTotalPages)
    }
  }, [tTotalPages, teacherCurrentPage])

  const displayedStudents = sortedFilteredStudents.slice((teacherCurrentPage - 1) * tItemsPerPage, teacherCurrentPage * tItemsPerPage)

  // Öğrenci Bazlı Görünüm için Seçili Öğrenci Bilgileri
  const selectedStudent = students.find(s => s.id === selectedStudentId)

  // Ödevlerin Durum Badge Sınıfı
  const getStatusBadge = (status) => {
    if (status === 'Bekliyor') return 'px-2.5 py-1 bg-amber-50 text-amber-600 text-xs font-bold rounded-full border border-amber-100/50'
    if (status === 'İncelendi') return 'px-2.5 py-1 bg-blue-50 text-blue-600 text-xs font-bold rounded-full border border-blue-100/50'
    if (status === 'Onaylandı') return 'px-2.5 py-1 bg-emerald-50 text-emerald-600 text-xs font-bold rounded-full border border-emerald-100/50'
    return 'px-2.5 py-1 bg-slate-50 text-slate-400 text-xs font-bold rounded-full border border-slate-200/50'
  }

  return (
    <section className="hw-page-canvas">
      {/* Sayfa Başlığı */}
      <div className="hw-page-header">
        <div>
          <h2 className="hw-page-title">Ödev Kontrol Merkezi</h2>
          <p className="hw-page-subtitle">Ders & ödev bazlı teslim raporları, not girişi ve öğrenci karnesi</p>
        </div>
        <div className="hw-header-actions flex items-center gap-3">
          <button
            onClick={handleOpenAddModal}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold flex items-center gap-1.5 cursor-pointer transition-all shadow-sm border-none"
          >
            <span className="material-symbols-outlined text-[16px]">add</span>
            <span>Yeni Ödev Ver</span>
          </button>
          <div className="hw-badge-pending flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-red-500 animate-ping"></span>
            {pendingCount} Bekleyen İnceleme
          </div>
        </div>
      </div>

      {/* Görünüm Modu Sekmesi */}
      <div className="flex gap-6 border-b border-slate-100 pb-0 mb-2">
        <button
          onClick={() => setViewMode('homework-based')}
          className={`pb-3 text-xs sm:text-sm font-bold relative transition-all cursor-pointer ${
            viewMode === 'homework-based'
              ? 'text-blue-600'
              : 'text-slate-400 hover:text-slate-600'
          }`}
        >
          <div className="flex items-center gap-1.5">
            <span className="material-symbols-outlined text-lg">assignment</span>
            <span>Ödev Bazlı İnceleme</span>
          </div>
          {viewMode === 'homework-based' && (
            <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600 rounded-full" />
          )}
        </button>
        <button
          onClick={() => setViewMode('student-based')}
          className={`pb-3 text-xs sm:text-sm font-bold relative transition-all cursor-pointer ${
            viewMode === 'student-based'
              ? 'text-blue-600'
              : 'text-slate-400 hover:text-slate-600'
          }`}
        >
          <div className="flex items-center gap-1.5">
            <span className="material-symbols-outlined text-lg">person</span>
            <span>Öğrenci Bazlı İnceleme</span>
          </div>
          {viewMode === 'student-based' && (
            <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600 rounded-full" />
          )}
        </button>
      </div>

      {/* ────────────────── 1. ÖDEV BAZLI İNCELEME GÖRÜNÜMÜ ────────────────── */}
      {viewMode === 'homework-based' && (
        <>
          {/* Filtre ve Detay Kartı */}
          <div className="bg-white border border-slate-200/60 rounded-xl p-5 shadow-sm flex flex-col gap-4">
            <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between border-b border-slate-50 pb-4">
              <div className="flex flex-wrap gap-3 w-full sm:w-auto">
                {/* Ders Seçimi */}
                <div className="flex flex-col gap-1 w-full sm:w-56">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">Ders Seçin</label>
                  <select
                    value={selectedCourse}
                    onChange={(e) => handleCourseChange(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs font-semibold bg-white text-slate-700 shadow-sm focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 cursor-pointer"
                  >
                     {teacherCourses.map((c, idx) => (
                       <option key={`${c.code}-${idx}`} value={c.code}>{c.code} - {c.name}</option>
                     ))}
                  </select>
                </div>

                {/* Ödev Seçimi */}
                <div className="flex flex-col gap-1 w-full sm:w-56">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">Ödev Seçin</label>
                  <select
                    value={selectedHomework}
                    onChange={(e) => setSelectedHomework(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs font-semibold bg-white text-slate-700 shadow-sm focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 cursor-pointer"
                  >
                    {(currentCourse?.homeworks || []).map(h => (
                      <option key={h.id} value={h.id}>{h.title}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Alt Filtre Butonları */}
              <div className="flex flex-wrap gap-1.5 bg-slate-50 p-1 rounded-xl self-end sm:self-auto">
                <button
                  onClick={() => setSubFilterTab('All')}
                  className={`px-3 py-1.5 text-xs font-bold rounded-lg cursor-pointer transition-all ${
                    subFilterTab === 'All' ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-400 hover:text-slate-600'
                  }`}
                >
                  Tümü ({studentsWithStatus.length})
                </button>
                <button
                  onClick={() => setSubFilterTab('Submitted')}
                  className={`px-3 py-1.5 text-xs font-bold rounded-lg cursor-pointer transition-all ${
                    subFilterTab === 'Submitted' ? 'bg-emerald-50 text-emerald-600 shadow-sm' : 'text-slate-400 hover:text-slate-600'
                  }`}
                >
                  Teslim Edenler ({studentsWithStatus.filter(s => s.isSubmitted).length})
                </button>
                <button
                  onClick={() => setSubFilterTab('Pending')}
                  className={`px-3 py-1.5 text-xs font-bold rounded-lg cursor-pointer transition-all ${
                    subFilterTab === 'Pending' ? 'bg-amber-50 text-amber-600 shadow-sm' : 'text-slate-400 hover:text-slate-600'
                  }`}
                >
                  Bekleyenler ({studentsWithStatus.filter(s => s.review?.status === 'Bekliyor').length})
                </button>
                <button
                  onClick={() => setSubFilterTab('Graded')}
                  className={`px-3 py-1.5 text-xs font-bold rounded-lg cursor-pointer transition-all ${
                    subFilterTab === 'Graded' ? 'bg-blue-50 text-blue-600 shadow-sm' : 'text-slate-400 hover:text-slate-600'
                  }`}
                >
                  İncelenenler ({studentsWithStatus.filter(s => s.review?.status === 'İncelendi' || s.review?.status === 'Onaylandı').length})
                </button>
                <button
                  onClick={() => setSubFilterTab('NotSubmitted')}
                  className={`px-3 py-1.5 text-xs font-bold rounded-lg cursor-pointer transition-all ${
                    subFilterTab === 'NotSubmitted' ? 'bg-rose-50 text-rose-600 shadow-sm' : 'text-slate-400 hover:text-slate-600'
                  }`}
                >
                  Teslim Etmeyenler ({studentsWithStatus.filter(s => !s.isSubmitted).length})
                </button>
              </div>
            </div>

            {/* Ödev Tarih Bilgisi */}
            {currentHw && (
              <div className="flex flex-col sm:flex-row gap-4 sm:items-center text-xs text-slate-500 bg-blue-50/50 p-3 rounded-lg border border-blue-100/50">
                <div className="flex items-center gap-1.5 font-semibold text-blue-700">
                  <span className="material-symbols-outlined text-base">calendar_today</span>
                  <span>Ödev Süre Bilgisi</span>
                </div>
                <div className="flex flex-wrap gap-x-6 gap-y-1">
                  <div><strong className="text-slate-600">Veriliş Tarihi:</strong> {currentHw.givenDate}</div>
                  <div><strong className="text-slate-600">Son Teslim Tarihi:</strong> {currentHw.dueDate}</div>
                </div>
              </div>
            )}

            {/* Ağırlık Yüzdeleri Bölümü */}
            {currentCourse && (
              <div className="border-t border-slate-100 pt-3">
                <div className="flex items-center justify-between">
                  <button
                    type="button"
                    onClick={() => {
                      setIsEditingWeights(!isEditingWeights)
                      if (!isEditingWeights) {
                        const initialWeights = {}
                        (currentCourse.homeworks || []).forEach(hw => {
                          initialWeights[hw.id] = hw.weight !== undefined ? hw.weight : 0
                        })
                        setTempWeights(initialWeights)
                      }
                    }}
                    className="text-xs font-bold text-blue-600 hover:text-blue-800 flex items-center gap-1 cursor-pointer transition-colors bg-transparent border-none p-0"
                  >
                    <span className="material-symbols-outlined text-[16px]">percent</span>
                    <span>{isEditingWeights ? 'Ağırlık Düzenlemeyi Kapat' : 'Ödev Ağırlık Yüzdelerini Düzenle'}</span>
                  </button>
                  <div className="text-[10px] font-bold text-slate-400">
                    Toplam Ağırlık: {(currentCourse.homeworks || []).reduce((sum, hw) => sum + (hw.weight || 0), 0)}%
                  </div>
                </div>

                {isEditingWeights && (
                  <form onSubmit={handleSaveWeights} className="mt-3 bg-slate-50 p-4 rounded-xl border border-slate-200/50 flex flex-col gap-3">
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 text-left">
                      {currentCourse.homeworks.map(hw => (
                        <div key={hw.id} className="flex flex-col gap-1">
                          <label className="text-[10px] font-bold text-slate-500 truncate" title={hw.title}>{hw.title}</label>
                          <div className="relative flex items-center">
                            <input
                              type="number"
                              min="0"
                              max="100"
                              value={tempWeights[hw.id] !== undefined ? tempWeights[hw.id] : ''}
                              onChange={(e) => {
                                const val = e.target.value === '' ? '' : Number(e.target.value)
                                setTempWeights(prev => ({ ...prev, [hw.id]: val }))
                              }}
                              className="w-full pl-3 pr-8 py-1.5 border border-slate-200 rounded-lg text-xs bg-white text-slate-800 font-bold focus:outline-none focus:border-blue-500"
                            />
                            <span className="absolute right-2.5 text-slate-400 text-[10px] font-medium">%</span>
                          </div>
                        </div>
                      ))}
                    </div>
                    
                    <div className="flex justify-end gap-2 border-t border-slate-200/60 pt-2.5">
                      <button
                        type="button"
                        onClick={() => setIsEditingWeights(false)}
                        className="px-3 py-1.5 border border-slate-200 hover:bg-slate-100 text-slate-600 font-bold text-xs rounded-lg transition-colors cursor-pointer bg-white"
                      >
                        İptal
                      </button>
                      <button
                        type="submit"
                        className="px-4 py-1.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-lg shadow-sm active:scale-95 transition-all cursor-pointer border-none"
                      >
                        Ağırlıkları Kaydet
                      </button>
                    </div>
                  </form>
                )}
              </div>
            )}
          </div>

          {/* Öğrenci Listesi */}
          <div className="hw-list-container">
            {displayedStudents.length > 0 ? (
              displayedStudents.map(({ student, review, isSubmitted, status }) => {
                const inputKey = `${student.id}_${selectedCourse}_${selectedHomework}`
                const gradeVal = grades[inputKey] !== undefined 
                  ? grades[inputKey] 
                  : (review?.grade !== undefined ? review.grade : '')
                const feedbackVal = feedbacks[inputKey] !== undefined 
                  ? feedbacks[inputKey] 
                  : (review?.feedback || '')

                return (
                  <div key={student.id} className="hw-review-card">
                    {/* Üst Kısım: Öğrenci Bilgisi ve Rozet */}
                    <div className="hw-card-header">
                      <div className="hw-student-box">
                        <div 
                          className="hw-student-avatar bg-gradient-to-tr from-blue-700 to-indigo-500 text-white cursor-pointer hover:opacity-90 hover:scale-[1.03] transition-all"
                          onClick={() => {
                            setSelectedStudentId(student.id)
                            setViewMode('student-based')
                          }}
                          title="Öğrenci bazlı incelemeye git"
                        >
                          {student.avatar || student.name.charAt(0)}
                        </div>
                        <div>
                          <p 
                            className="hw-student-name cursor-pointer hover:text-blue-600 hover:underline transition-colors"
                            onClick={() => {
                              setSelectedStudentId(student.id)
                              setViewMode('student-based')
                            }}
                            title="Öğrenci bazlı incelemeye git"
                          >
                            {student.name}
                          </p>
                          <p className="hw-student-meta">No: {student.id} · Grup: {student.group || 'Grup A'}</p>
                          {(() => {
                            const hwStats = calculateStudentHomeworkAverage(student.id, selectedCourse)
                            return (
                              <div className="flex flex-wrap gap-x-2 gap-y-1 mt-1.5 items-center">
                                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-extrabold bg-blue-50 text-blue-700 border border-blue-100">
                                  <span className="material-symbols-outlined text-[10px]">analytics</span>
                                  Ödev Ortalaması: {hwStats.average}/100
                                </span>
                                {hwStats.nonSubmittedCount > 0 ? (
                                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-extrabold bg-rose-50 text-rose-600 border border-rose-100">
                                    <span className="material-symbols-outlined text-[10px]">warning</span>
                                    {hwStats.nonSubmittedCount} ödev teslim edilmedi
                                  </span>
                                ) : (
                                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-extrabold bg-emerald-50 text-emerald-600 border border-emerald-100">
                                    <span className="material-symbols-outlined text-[10px]">check_circle</span>
                                    Tüm ödevler teslim edildi
                                  </span>
                                )}
                              </div>
                            )
                          })()}
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {isSubmitted ? (
                          <span className={getStatusBadge(status)}>
                            {status === 'Bekliyor' ? 'Onay Bekliyor' : status}
                          </span>
                        ) : (
                          <span className="px-2.5 py-1 bg-red-50 text-red-600 text-xs font-bold rounded-full border border-red-100/50">
                            Teslim Edilmedi
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Not ve Değerlendirme Formu */}
                    <div className="p-4 bg-slate-50/60 border border-slate-100 rounded-xl flex flex-col gap-3">
                      <h4 className="text-xs font-bold text-slate-700 flex items-center gap-1.5 uppercase tracking-wide">
                        <span className="material-symbols-outlined text-sm text-slate-500">rate_review</span>
                        Değerlendirme ve Not Girişi
                      </h4>

                      <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                        {/* Ödev Notu */}
                        <div className="flex flex-col gap-1 md:col-span-1">
                          <label className="text-[11px] font-semibold text-slate-500">Not (0-100)</label>
                          <div className="relative flex items-center">
                            <input
                              type="number"
                              min="0"
                              max="100"
                              placeholder="Örn: 85"
                              value={gradeVal}
                              onChange={(e) => handleGradeChangeLocal(inputKey, e.target.value)}
                              className="w-full pl-3 pr-8 py-2 border border-slate-200 rounded-lg text-xs focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 bg-white text-slate-800 font-bold"
                            />
                            <span className="absolute right-2.5 text-slate-400 text-[10px] font-medium">/100</span>
                          </div>
                        </div>

                        {/* Geri Bildirim */}
                        <div className="flex flex-col gap-1 md:col-span-3">
                          <label className="text-[11px] font-semibold text-slate-500">Geri Bildirim</label>
                          <textarea
                            rows="1"
                            placeholder="Öğrencinin ödevi için geri bildirimlerinizi yazın..."
                            value={feedbackVal}
                            onChange={(e) => handleFeedbackChangeLocal(inputKey, e.target.value)}
                            className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 bg-white text-slate-700 resize-y min-h-[34px]"
                          />
                        </div>
                      </div>
                    </div>

                    {review?.fileName && (
                      <div className="text-[11px] text-slate-500 font-semibold mb-2 bg-slate-100 dark:bg-slate-800/80 p-2 rounded-lg flex items-center gap-1.5 w-full">
                        <span className="material-symbols-outlined text-[13px] text-blue-600">description</span>
                        <span>Dosya: {review.fileName}</span>
                      </div>
                    )}

                    {/* Aksiyon Butonları */}
                    <div className="hw-actions-wrap flex gap-2">
                      <button
                        className={`flex-1 py-2.5 rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 cursor-pointer transition-all border ${
                          review?.github 
                            ? 'bg-blue-50 hover:bg-blue-100 border-blue-200/50 text-blue-600' 
                            : 'bg-slate-50 text-slate-400 border-slate-200 cursor-not-allowed'
                        }`}
                        onClick={() => handleOpenGithub(review?.github)}
                        disabled={!review?.github}
                      >
                        <span className="material-symbols-outlined">link</span>
                        <span>Dosya Gör / Git</span>
                      </button>

                      <button
                        className="py-2.5 px-5 bg-blue-50 hover:bg-blue-100 border border-blue-200 text-blue-600 rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 cursor-pointer transition-all"
                        onClick={() => handleSaveEvaluationLocal(student, selectedCourse, selectedHomework, false)}
                      >
                        <span className="material-symbols-outlined text-base">save</span>
                        <span>Kaydet</span>
                      </button>

                      {status !== 'Onaylandı' ? (
                        <button
                          className="hw-btn-approve"
                          onClick={() => handleSaveEvaluationLocal(student, selectedCourse, selectedHomework, true)}
                        >
                          <span className="material-symbols-outlined">check_circle</span>
                          <span>Onayla</span>
                        </button>
                      ) : (
                        <button
                          className="hw-btn-approve bg-rose-50 text-rose-600 border border-rose-200 hover:bg-rose-100"
                          onClick={() => handleSaveEvaluationLocal(student, selectedCourse, selectedHomework, false, true)}
                        >
                          <span className="material-symbols-outlined">cancel</span>
                          <span>Onayı İptal Et</span>
                        </button>
                      )}
                    </div>
                  </div>
                )})
              ) : (
                <div className="flex flex-col items-center justify-center py-12 text-slate-400 bg-white border border-slate-200/60 rounded-xl">
                  <span className="material-symbols-outlined text-4xl mb-2 text-slate-300">search_off</span>
                  <p className="text-sm font-medium">Seçilen kriterlere uygun öğrenci bulunamadı.</p>
                </div>
              )}
            </div>

            {/* Sayfalama Kontrolleri */}
            {sortedFilteredStudents.length > 0 && (
              <div className="mt-4 px-6 py-4 bg-white border border-slate-200/65 rounded-xl flex justify-between items-center text-slate-500 text-[10px] font-bold uppercase shadow-sm">
                <p>
                  Toplam {sortedFilteredStudents.length} kayıt arasından{' '}
                  {(teacherCurrentPage - 1) * tItemsPerPage + 1}-
                  {Math.min(teacherCurrentPage * tItemsPerPage, sortedFilteredStudents.length)} arası gösteriliyor
                </p>
                <div className="flex gap-1.5 items-center">
                  <button
                    onClick={() => setTeacherCurrentPage(prev => Math.max(prev - 1, 1))}
                    disabled={teacherCurrentPage === 1}
                    className={`w-7 h-7 rounded border border-slate-200 flex items-center justify-center transition-colors ${
                      teacherCurrentPage === 1 ? 'opacity-50 cursor-not-allowed' : 'hover:bg-slate-100 cursor-pointer text-slate-700'
                    }`}
                  >
                    <span className="material-symbols-outlined text-sm">chevron_left</span>
                  </button>
                  
                  {Array.from({ length: tTotalPages }).map((_, i) => {
                    const pageNum = i + 1
                    if (tTotalPages > 5 && Math.abs(pageNum - teacherCurrentPage) > 1 && pageNum !== 1 && pageNum !== tTotalPages) {
                      if (pageNum === 2 || pageNum === tTotalPages - 1) {
                        return <span key={pageNum} className="text-slate-450 px-0.5 normal-case">...</span>
                      }
                      return null
                    }
                    return (
                      <button
                        key={pageNum}
                        onClick={() => setTeacherCurrentPage(pageNum)}
                        className={`w-7 h-7 rounded flex items-center justify-center text-xs cursor-pointer font-bold ${
                          teacherCurrentPage === pageNum
                            ? 'bg-blue-900 text-white'
                            : 'border border-slate-200 hover:bg-slate-100 text-slate-700'
                        }`}
                      >
                        {pageNum}
                      </button>
                    )
                  })}

                  <button
                    onClick={() => setTeacherCurrentPage(prev => Math.min(prev + 1, tTotalPages))}
                    disabled={teacherCurrentPage === tTotalPages}
                    className={`w-7 h-7 rounded border border-slate-200 flex items-center justify-center transition-colors ${
                      teacherCurrentPage === tTotalPages ? 'opacity-50 cursor-not-allowed' : 'hover:bg-slate-100 cursor-pointer text-slate-700'
                    }`}
                  >
                    <span className="material-symbols-outlined text-sm">chevron_right</span>
                  </button>
                </div>
              </div>
            )}
        </>
      )}

      {/* ────────────────── 2. ÖĞRENCİ BAZLI İNCELEME GÖRÜNÜMÜ ────────────────── */}
      {viewMode === 'student-based' && (
        <>
          {/* Öğrenci ve Ders Seçici */}
          <div className="bg-white border border-slate-200/60 rounded-xl p-5 shadow-sm flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
            <div className="flex flex-wrap gap-3 w-full sm:w-auto">
              {/* Öğrenci Dropdown */}
              <div className="flex flex-col gap-1 w-full sm:w-60">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">Öğrenci Seçin</label>
                <select
                  value={selectedStudentId}
                  onChange={(e) => setSelectedStudentId(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs font-semibold bg-white text-slate-700 shadow-sm focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 cursor-pointer"
                >
                  {students.map(s => (
                    <option key={s.id} value={s.id}>{s.name} ({s.id})</option>
                  ))}
                </select>
              </div>

              {/* Ders Dropdown */}
              <div className="flex flex-col gap-1 w-full sm:w-60">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">Ders Filtresi</label>
                <select
                  value={selectedCourse}
                  onChange={(e) => handleCourseChange(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs font-semibold bg-white text-slate-700 shadow-sm focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 cursor-pointer"
                >
                  {teacherCourses.map((c, idx) => (
                    <option key={`${c.code}-${idx}`} value={c.code}>{c.code} - {c.name}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Seçili Öğrencinin Kısa Özeti */}
            {selectedStudent && (() => {
              const hwStats = calculateStudentHomeworkAverage(selectedStudent.id, selectedCourse)
              return (
                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 bg-slate-50 px-4 py-2.5 rounded-xl border border-slate-200/50 w-full sm:w-auto mt-2 sm:mt-0">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-blue-700 to-indigo-500 text-white font-bold flex items-center justify-center text-xs">
                      {selectedStudent.avatar || selectedStudent.name.charAt(0)}
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-slate-800">{selectedStudent.name}</h4>
                      <p className="text-[10px] text-slate-400">Devamsızlık: {selectedStudent.attendance} · Not: {selectedStudent.grade}</p>
                      {selectedStudent.email && (
                        <p className="text-[10px] text-slate-500 flex items-center gap-1 mt-0.5 font-medium">
                          <span className="material-symbols-outlined text-[12px] text-slate-400">mail</span>
                          <a href={`mailto:${selectedStudent.email}`} className="hover:text-blue-600 hover:underline">{selectedStudent.email}</a>
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="h-6 w-px bg-slate-200 hidden sm:block" />
                  <div className="text-left flex flex-col gap-0.5">
                    <div className="text-[10px] font-bold text-slate-500">
                      Ödev Ortalaması: <span className="text-blue-600 text-xs font-black">{hwStats.average}/100</span>
                    </div>
                    <div className="text-[10px] font-bold">
                      {hwStats.nonSubmittedCount > 0 ? (
                        <span className="text-rose-600">{hwStats.nonSubmittedCount} ödev teslim edilmedi</span>
                      ) : (
                        <span className="text-emerald-600">Tüm ödevler teslim edildi</span>
                      )}
                    </div>
                  </div>
                </div>
              )
            })()}
          </div>

          {/* Öğrencinin Ödev Listesi */}
          <div className="hw-list-container">
            {currentCourse && selectedStudent ? (
              (currentCourse.homeworks || []).map(hw => {
                const review = homeworkReviews.find(r => 
                  r.studentId === selectedStudent.id && 
                  r.courseCode === selectedCourse && 
                  r.homeworkId === hw.id
                )
                const isSubmitted = !!review && review.status !== 'Teslim Edilmedi'
                const status = review ? review.status : 'Teslim Edilmedi'
                const inputKey = `${selectedStudent.id}_${selectedCourse}_${hw.id}`

                const gradeVal = grades[inputKey] !== undefined 
                  ? grades[inputKey] 
                  : (review?.grade !== undefined ? review.grade : '')
                const feedbackVal = feedbacks[inputKey] !== undefined 
                  ? feedbacks[inputKey] 
                  : (review?.feedback || '')

                return (
                  <div key={hw.id} className="bg-white border border-slate-200/60 rounded-xl p-5 shadow-sm flex flex-col gap-4">
                    {/* Ödev Başlığı ve Teslim Rozeti */}
                    <div className="flex justify-between items-start gap-4">
                      <div>
                        <h3 className="text-sm font-bold text-slate-800 flex items-center gap-1.5">
                          <span className="material-symbols-outlined text-slate-400 text-lg">description</span>
                          {hw.title}
                        </h3>
                        <p className="text-xs text-slate-400 mt-1">
                          Veriliş: {hw.givenDate} · Son Teslim: {hw.dueDate}
                        </p>
                      </div>
                      <div>
                        {isSubmitted ? (
                          <span className={getStatusBadge(status)}>
                            {status === 'Bekliyor' ? 'Onay Bekliyor' : status}
                          </span>
                        ) : (
                          <span className="px-2.5 py-1 bg-red-50 text-red-600 text-xs font-bold rounded-full border border-red-100/50">
                            Teslim Edilmedi
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Not ve Geri Bildirim Formu */}
                    <div className="p-3 bg-slate-50/60 border border-slate-100 rounded-lg flex flex-col gap-3">
                      <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                        <div className="flex flex-col gap-1 md:col-span-1">
                          <label className="text-[10px] font-bold text-slate-500">Not (0-100)</label>
                          <div className="relative flex items-center">
                            <input
                              type="number"
                              min="0"
                              max="100"
                              placeholder="Not"
                              value={gradeVal}
                              onChange={(e) => handleGradeChangeLocal(inputKey, e.target.value)}
                              className="w-full pl-3 pr-8 py-1.5 border border-slate-200 rounded-lg text-xs bg-white text-slate-800 font-bold focus:outline-none focus:border-blue-500"
                            />
                            <span className="absolute right-2.5 text-slate-400 text-[10px] font-medium">/100</span>
                          </div>
                        </div>
                        <div className="flex flex-col gap-1 md:col-span-3">
                          <label className="text-[10px] font-bold text-slate-500">Açıklama / Geri Bildirim</label>
                          <input
                            type="text"
                            placeholder="Değerlendirme notu veya açıklama girin..."
                            value={feedbackVal}
                            onChange={(e) => handleFeedbackChangeLocal(inputKey, e.target.value)}
                            className="w-full px-3 py-1.5 border border-slate-200 rounded-lg text-xs bg-white text-slate-700 focus:outline-none focus:border-blue-500"
                          />
                        </div>
                      </div>
                    </div>

                    {hw.review?.fileName && (
                      <div className="text-[11px] text-slate-500 font-semibold mb-2 bg-slate-100 dark:bg-slate-800/80 p-2 rounded-lg flex items-center gap-1.5 w-full">
                        <span className="material-symbols-outlined text-[13px] text-blue-600">description</span>
                        <span>Dosya: {hw.review.fileName}</span>
                      </div>
                    )}

                    {/* Kaydetme Butonu */}
                    <div className="flex justify-end gap-2">
                      <button
                        className={`px-4 py-2 border rounded-lg text-xs font-bold flex items-center gap-1.5 cursor-pointer transition-all ${
                          review?.github
                            ? 'bg-white hover:bg-slate-50 text-slate-700 border-slate-200'
                            : 'bg-slate-50 text-slate-400 border-slate-100 cursor-not-allowed'
                        }`}
                        onClick={() => handleOpenGithub(review?.github)}
                        disabled={!review?.github}
                      >
                        <span className="material-symbols-outlined text-sm">link</span>
                        <span>Dosya Gör</span>
                      </button>

                      <button
                        className="px-4 py-2 bg-blue-50 hover:bg-blue-100 border border-blue-200 text-blue-600 rounded-lg text-xs font-bold flex items-center gap-1.5 cursor-pointer transition-all"
                        onClick={() => handleSaveEvaluationLocal(selectedStudent, selectedCourse, hw.id, false)}
                      >
                        <span className="material-symbols-outlined text-sm">save</span>
                        <span>Değerlendirmeyi Kaydet</span>
                      </button>

                      {status !== 'Onaylandı' ? (
                        <button
                          className="px-4 py-2 bg-blue-900 text-white hover:bg-blue-950 rounded-lg text-xs font-bold flex items-center gap-1.5 cursor-pointer transition-all"
                          onClick={() => handleSaveEvaluationLocal(selectedStudent, selectedCourse, hw.id, true)}
                        >
                          <span className="material-symbols-outlined text-sm">check_circle</span>
                          <span>Onayla</span>
                        </button>
                      ) : (
                        <button
                          className="px-4 py-2 bg-rose-50 hover:bg-rose-100 border border-rose-200 text-rose-600 rounded-lg text-xs font-bold flex items-center gap-1.5 cursor-pointer transition-all"
                          onClick={() => handleSaveEvaluationLocal(selectedStudent, selectedCourse, hw.id, false, true)}
                        >
                          <span className="material-symbols-outlined text-sm">cancel</span>
                          <span>Onayı İptal Et</span>
                        </button>
                      )}
                    </div>
                  </div>
                )
              })
            ) : (
              <div className="flex flex-col items-center justify-center py-12 text-slate-400 bg-white border border-slate-200/60 rounded-xl">
                <span className="material-symbols-outlined text-4xl mb-2 text-slate-300">error</span>
                <p className="text-sm font-medium">Veri yüklenirken bir hata oluştu veya öğrenci kaydı bulunamadı.</p>
              </div>
            )}
          </div>
        </>
      )}

      {/* Yeni Ödev Ata Modalı */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto">
          {/* Backdrop (Glassmorphism & blur animation) */}
          <div 
            className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm transition-opacity duration-300"
            onClick={() => setIsAddModalOpen(false)}
          />

          {/* Modal Content Card */}
          <div className="relative bg-white rounded-2xl shadow-2xl border border-slate-100 max-w-lg w-full overflow-hidden transform transition-all duration-300 scale-100 flex flex-col z-10 animate-in fade-in zoom-in-95">
            {/* Header */}
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
              <h3 className="text-sm font-extrabold text-blue-900 flex items-center gap-2">
                <span className="material-symbols-outlined text-lg">assignment_add</span>
                <span>Yeni Ödev Ata</span>
              </h3>
              <button 
                type="button"
                onClick={() => setIsAddModalOpen(false)}
                className="w-8 h-8 rounded-full border border-slate-200 flex items-center justify-center text-slate-400 hover:text-slate-600 hover:bg-slate-50 cursor-pointer transition-all border-none bg-transparent"
              >
                <span className="material-symbols-outlined text-lg">close</span>
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleCreateHomework} className="p-6 flex flex-col gap-4">
              {/* Ders Seçin */}
              <div className="flex flex-col gap-1.5 text-left">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">Ders Seçin</label>
                <select
                  value={newHwCourseCode}
                  onChange={(e) => setNewHwCourseCode(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs font-semibold bg-white text-slate-700 shadow-sm focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 cursor-pointer"
                >
                  {teacherCourses.map((c, idx) => (
                    <option key={`${c.code}-${idx}`} value={c.code}>{c.code} - {c.name}</option>
                  ))}
                </select>
              </div>

              {/* Ödev Başlığı */}
              <div className="flex flex-col gap-1.5 text-left">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">Ödev Başlığı</label>
                <input
                  type="text"
                  placeholder="Örn: React Hooks ve Context API Kullanımı"
                  value={newHwTitle}
                  onChange={(e) => setNewHwTitle(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 bg-white text-slate-800 font-medium"
                />
              </div>

              {/* Ödev Ağırlık Yüzdesi */}
              <div className="flex flex-col gap-1.5 text-left">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">Ödev Ağırlık Yüzdesi (%)</label>
                <input
                  type="number"
                  min="0"
                  max="100"
                  placeholder="Örn: 25"
                  value={newHwWeight}
                  onChange={(e) => setNewHwWeight(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 bg-white text-slate-800 font-medium"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-left">
                {/* Veriliş Tarihi */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">Veriliş Tarihi</label>
                  <input
                    type="date"
                    value={newHwGivenDate}
                    onChange={(e) => setNewHwGivenDate(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 bg-white text-slate-800 font-medium cursor-pointer"
                  />
                </div>

                {/* Son Teslim Tarihi */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">Son Teslim Tarihi</label>
                  <input
                    type="date"
                    value={newHwDueDate}
                    onChange={(e) => setNewHwDueDate(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 bg-white text-slate-800 font-medium cursor-pointer"
                  />
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex justify-end gap-2.5 mt-4 border-t border-slate-100 pt-4">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 border border-slate-200 hover:bg-slate-50 text-slate-600 font-bold text-xs rounded-xl transition-colors cursor-pointer bg-white"
                >
                  İptal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-md active:scale-95 transition-all cursor-pointer border-none"
                >
                  Ödevi Yayınla
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Bildirim Balonu */}
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
