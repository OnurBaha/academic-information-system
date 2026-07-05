import { useEffect, useState, useMemo } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { fetchStudentGradesAsync, requestOfficialDocumentAsync } from '../../store/student/studentSlice'
import { calculateScore, getLetterGrade, simulateGano, calculateGano, getLetterBadgeStyle } from '../../utils/studentCalc'
import { toast } from 'react-hot-toast'
import { jsPDF } from 'jspdf'
import autoTable from 'jspdf-autotable'


export default function StudentGrades() {
  const dispatch = useDispatch()
  const { currentUser } = useSelector((state) => state.auth || {})
  const { grades, status } = useSelector((state) => state.student || {})
  const { homeworkReviews = [], courses = [] } = useSelector((state) => state.teacher || {})

  const [selectedSemester, setSelectedSemester] = useState('current')

  // GANO Robotu simülasyon state'leri
  const [simCourseCode, setSimCourseCode] = useState('')
  const [simTargetScore, setSimTargetScore] = useState('')
  const [simTargetAkts, setSimTargetAkts] = useState('')
  const [estimatedGano, setEstimatedGano] = useState(3.42)

  const studentGrades = grades || []

  const calculateStudentHomeworkAverage = (studentId, courseCode) => {
    const course = courses.find(c => c.code === courseCode)
    if (!course || !course.homeworks || course.homeworks.length === 0) return 0

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
    if (activeHomeworks.length === 0) return 0

    let weightedScoreSum = 0
    let totalWeight = 0

    activeHomeworks.forEach(hw => {
      const review = homeworkReviews.find(r => 
        r.studentId === studentId && 
        r.courseCode === courseCode && 
        r.homeworkId === hw.id
      )

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

    return Math.round(average * 10) / 10
  }

  const homeworkAverages = useMemo(() => {
    const avgs = {};
    if (currentUser?.id && courses.length > 0) {
      courses.forEach(course => {
        avgs[course.code] = calculateStudentHomeworkAverage(currentUser.id, course.code);
      });
    }
    return avgs;
  }, [currentUser, courses, homeworkReviews]);
  useEffect(() => {
    if (currentUser?.id) {
      dispatch(fetchStudentGradesAsync(currentUser.id))
    }
  }, [dispatch, currentUser])

  // Notlar yüklendiğinde simülatör ilk değerlerini ata
  useEffect(() => {
    if (studentGrades.length > 0) {
      const firstCourse = studentGrades[0]
      setSimCourseCode(firstCourse.courseCode)
      setSimTargetAkts(firstCourse.ects || firstCourse.akts)

      // Varsayılan kümülatif GANO'yu hesapla
      const defaultGano = simulateGano(studentGrades, null, 0, homeworkAverages)
      setEstimatedGano(defaultGano)
    }
  }, [studentGrades, homeworkAverages])

  const downloadGradeListPDF = () => {
    try {
      const doc = new jsPDF()
      const semesterLabel = selectedSemester === 'current' ? '2025-2026 Guz Donemi' : 'Tum Donemler'

      doc.setFont('Helvetica', 'bold')
      doc.setFontSize(16)
      doc.setTextColor(30, 41, 59)
      doc.text('AKADEMIK BILGI SISTEMI', 14, 18)

      doc.setFont('Helvetica', 'normal')
      doc.setFontSize(10)
      doc.setTextColor(100, 116, 139)
      doc.text(`Donem Not Cizelgesi - ${semesterLabel}`, 14, 25)
      doc.text(`Ogrenci: ${currentUser?.name || 'Ogrenci'} | GANO: ${grades.length ? calculateGano(filteredGrades, homeworkAverages).toFixed(2) : '3.42'}`, 14, 30)
      doc.text(`Tarih: ${new Date().toLocaleDateString('tr-TR')}`, 14, 35)

      const bodyData = filteredGrades.map(g => {
        const hasFinal = g.final !== null && g.final !== undefined
        const hwAvg = homeworkAverages[g.courseCode]
        const score = hasFinal ? calculateScore(g.midterm || g.vize, g.final, g.proje ?? g.project, hwAvg) : null
        const letter = hasFinal ? getLetterGrade(score) : 'Aciklanmadi'
        return [
          g.courseCode,
          g.courseName,
          g.midterm ?? g.vize ?? '-',
          hwAvg !== undefined && hwAvg !== null && hwAvg !== 0 ? hwAvg : '-',
          g.proje ?? g.project ?? '-',
          g.final ?? 'Aciklanmadi',
          letter,
          `${g.ects || g.akts} AKTS`
        ]
      })

      autoTable(doc, {
        startY: 42,
        head: [['Kod', 'Ders Adi', 'Vize', 'Odev', 'Proje', 'Final', 'Harf', 'Kredi']],
        body: bodyData,
        styles: {
          fontSize: 8.5,
          cellPadding: 4,
          lineColor: [226, 232, 240],
          lineWidth: 0.3,
          font: 'Helvetica',
          textColor: [51, 65, 85]
        },
        headStyles: {
          fillColor: [30, 58, 138], // Dark navy
          textColor: 255,
          fontStyle: 'bold'
        },
        alternateRowStyles: { fillColor: [248, 250, 252] },
        columnStyles: {
          0: { cellWidth: 20 },
          1: { cellWidth: 50 },
          2: { cellWidth: 15, halign: 'center' },
          3: { cellWidth: 15, halign: 'center' },
          4: { cellWidth: 15, halign: 'center' },
          5: { cellWidth: 25, halign: 'center' },
          6: { cellWidth: 15, halign: 'center' },
          7: { cellWidth: 15, halign: 'center' }
        },
        margin: { left: 14, right: 14 }
      })

      doc.save(`Not_Cizelgesi_${selectedSemester}_2025_2026.pdf`)
      toast.success('Resmi not çizelgesi başarıyla indirildi!')
    } catch (err) {
      console.error(err)
      toast.error('PDF oluşturulurken bir hata oluştu!')
    }
  }

  const downloadDisputeFormPDF = () => {
    try {
      const doc = new jsPDF()

      doc.setFont('Helvetica', 'bold')
      doc.setFontSize(16)
      doc.text('NOT ITIRAZ DILEKCESI', 70, 20)

      doc.setFont('Helvetica', 'bold')
      doc.setFontSize(11)
      doc.text('MUDURLUGUNE,', 14, 40)

      doc.setFont('Helvetica', 'normal')
      doc.setFontSize(10)
      const text = `Universiteniz ${currentUser?.department || 'Muhendislik Fakultesi'} ogrencisiyim. Asagida bilgileri verilen dersin sinav notunun yeniden maddi hata acisindan degerlendirilmesini talep ediyorum.\n\nGereginin yapilmasini arz ederim.`
      const splitText = doc.splitTextToSize(text, 180)
      doc.text(splitText, 14, 50)

      // Form Fields Box
      doc.rect(14, 70, 182, 60)
      doc.setFont('Helvetica', 'bold')
      doc.text('Ogrenci No:', 20, 80)
      doc.text('Ad Soyad:', 20, 90)
      doc.text('Ders Kodu / Adi:', 20, 100)
      doc.text('Itiraz Edilen Sinav:', 20, 110)
      doc.text('Telefon:', 20, 120)

      doc.setFont('Helvetica', 'normal')
      doc.text(currentUser?.id || '20211024007', 60, 80)
      doc.text(currentUser?.name || 'Ogrenci', 60, 90)
      doc.text('...........................................................................', 60, 100)
      doc.text('[  ] Vize  /  [  ] Final  /  [  ] Proje', 60, 110)
      doc.text('...........................................................................', 60, 120)

      // Date and Signature
      doc.text('Tarih: ...../...../2026', 130, 145)
      doc.text('Imza: ....................', 130, 155)

      doc.save('Not_Itiraz_Dilekcesi.pdf')
      toast.success('Not itiraz formu PDF olarak indirildi!')
    } catch (err) {
      console.error(err)
      toast.error('PDF oluşturulurken bir hata oluştu!')
    }
  }

  const downloadTranscriptPDF = () => {
    try {
      const doc = new jsPDF()

      doc.setFont('Helvetica', 'bold')
      doc.setFontSize(16)
      doc.setTextColor(30, 41, 59)
      doc.text('RESMI TRANSKRIPT / NOT DOKUMU', 14, 18)

      doc.setFont('Helvetica', 'normal')
      doc.setFontSize(10)
      doc.setTextColor(100, 116, 139)
      doc.text(`Ogrenci Ad Soyad: ${currentUser?.name || 'Ogrenci'}`, 14, 26)
      doc.text(`Ogrenci No: ${currentUser?.id || '20211024007'}`, 14, 32)
      doc.text(`Program: Bilgisayar Muhendisligi`, 14, 38)
      doc.text(`Akademik GANO: ${grades.length ? calculateGano(studentGrades, homeworkAverages).toFixed(2) : '3.42'} | Toplam AKTS: 215`, 14, 44)
      doc.text(`Yazdirilma Tarihi: ${new Date().toLocaleDateString('tr-TR')}`, 14, 50)

      // Render all student courses across all semesters
      const allGradesBody = studentGrades.map(g => {
        const hasFinal = g.final !== null && g.final !== undefined
        const score = hasFinal ? calculateScore(g.midterm || g.vize, g.final, g.proje ?? g.project, homeworkAverages[g.courseCode]) : null
        const letter = hasFinal ? getLetterGrade(score) : ''
        return [
          g.semester || '2025-2026 Guz',
          g.courseCode,
          g.courseName,
          g.midterm ?? g.vize ?? '-',
          g.final ?? 'Aciklanmadi',
          letter,
          `${g.ects || g.akts} AKTS`
        ]
      })

      autoTable(doc, {
        startY: 56,
        head: [['Donem', 'Ders Kodu', 'Ders Adi', 'Vize', 'Final', 'Harf Notu', 'Kredi']],
        body: allGradesBody,
        styles: {
          fontSize: 8,
          cellPadding: 3,
          lineColor: [226, 232, 240],
          lineWidth: 0.2,
          font: 'Helvetica'
        },
        headStyles: {
          fillColor: [30, 58, 138],
          textColor: 255,
          fontStyle: 'bold'
        },
        alternateRowStyles: { fillColor: [248, 250, 252] },
        columnStyles: {
          0: { cellWidth: 28 },
          1: { cellWidth: 22 },
          2: { cellWidth: 55 },
          3: { cellWidth: 15, halign: 'center' },
          4: { cellWidth: 25, halign: 'center' },
          5: { cellWidth: 20, halign: 'center' },
          6: { cellWidth: 15, halign: 'center' }
        },
        margin: { left: 14, right: 14 }
      })

      doc.save(`Transcript_${currentUser?.id || 'Ogrenci'}.pdf`)
      toast.success('Resmi transkript başarıyla indirildi!')
    } catch (err) {
      console.error(err)
      toast.error('PDF oluşturulurken bir hata oluştu!')
    }
  }

  // FAZ 2.3 — Resmi Transkript Talebi → DB'ye POST at (Dekan görebilsin)
  const [isRequestingTranscript, setIsRequestingTranscript] = useState(false)

  const handleTranscriptRequest = async () => {
    if (isRequestingTranscript) return
    setIsRequestingTranscript(true)
    try {
      await dispatch(requestOfficialDocumentAsync({
        studentId: currentUser?.id,
        studentName: currentUser?.name || 'Öğrenci',
        title: 'Resmi Transkript',
        description: 'Öğrenci Not Dökümü talebinde bulunulmuştur.',
        type: 'document',
        status: 'pending',
      }))
      toast.success('Transkript talebiniz alındı! Belgeler sekmesinden takip edebilirsiniz.')
    } catch (err) {
      console.error(err)
      toast.error('Transkript talebi gönderilemedi.')
    } finally {
      setIsRequestingTranscript(false)
    }
  }
  // Ders seçildiğinde AKTS alanını güncelle
  const handleSimCourseChange = (code) => {
    setSimCourseCode(code)
    const selected = studentGrades.find(g => g.courseCode === code)
    if (selected) {
      setSimTargetAkts(selected.ects || selected.akts)
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

    const nextGano = simulateGano(studentGrades, simCourseCode, score, homeworkAverages)
    setEstimatedGano(nextGano)
    toast.success(`Simülasyon hesaplandı. Tahmini GANO: ${nextGano}`)
  }

  // Not tablosu dönem filtresi
  const filteredGrades = studentGrades.filter(g => {
    let matchesSemester = true
    if (selectedSemester === 'current') matchesSemester = g.semester === '2025-2026 Bahar'
    else if (selectedSemester === 'spring') matchesSemester = g.semester === '2024-2025 Bahar'
    else if (selectedSemester === 'fall') matchesSemester = g.semester === '2024-2025 Güz'

    return matchesSemester
  })

  // Mevcut kümülatif GANO hesabı
  const currentGano = studentGrades.length > 0
    ? simulateGano(studentGrades, null, 0, homeworkAverages)
    : 0

  const isLoading = status === 'loading'

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
              <option value="current">2025-2026 Bahar</option>
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
            <h3 className="grades-card-value">{isLoading ? '...' : currentGano.toFixed(2)}</h3>
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
              <button className="grades-btn-download cursor-pointer" onClick={downloadGradeListPDF}>
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
                    <th className="grades-th-center">Ödev</th>
                    <th className="grades-th-center">Proje</th>
                    <th className="grades-th-center">Final</th>
                    <th className="grades-th-center">Harf</th>
                    <th className="grades-th-center">AKTS</th>
                  </tr>
                </thead>
                <tbody>
                  {isLoading ? (
                    <tr>
                      <td colSpan="7" className="grades-td-course" style={{ textAlign: 'center', padding: '30px 0' }}>
                        Yükleniyor...
                      </td>
                    </tr>
                  ) : filteredGrades.length === 0 ? (
                    <tr>
                      <td colSpan="7" className="grades-td-course" style={{ textAlign: 'center', padding: '30px 0' }}>
                        Bu döneme ait not bilgisi bulunmuyor.
                      </td>
                    </tr>
                  ) : (
                    filteredGrades.map((g) => {
                      const hasFinal = g.final !== null && g.final !== undefined
                      const score = hasFinal ? calculateScore(g.midterm || g.vize, g.final, g.proje ?? g.project, homeworkAverages[g.courseCode]) : null
                      const letter = hasFinal ? getLetterGrade(score) : ''

                      return (
                        <tr className="grades-table-row" key={g.id}>
                          <td className="grades-td-course">
                            <p className="grades-course-code font-bold text-slate-800 dark:text-white">
                              {g.courseCode}
                            </p>
                            <p className="grades-course-inst">{g.instructor}</p>
                          </td>
                          <td className="grades-td-score">
                            <span className="px-2.5 py-1 rounded-md bg-blue-50/50 dark:bg-blue-950/20 text-blue-750 dark:text-blue-400 border border-blue-100/50 dark:border-blue-900/30 text-xs font-bold">
                              {g.midterm ?? g.vize ?? '-'}
                            </span>
                          </td>
                          <td className="grades-td-score">
                            {homeworkAverages[g.courseCode] !== undefined && homeworkAverages[g.courseCode] !== null && homeworkAverages[g.courseCode] !== 0 ? (
                              <span className="px-2.5 py-1 rounded-md bg-amber-50/50 dark:bg-amber-950/20 text-amber-750 dark:text-amber-400 border border-amber-100/50 dark:border-amber-900/30 text-xs font-bold">
                                {homeworkAverages[g.courseCode]}
                              </span>
                            ) : (
                              <span className="text-slate-400 dark:text-slate-650 font-bold">-</span>
                            )}
                          </td>
                          <td className="grades-td-score">
                            {(g.proje ?? g.project) !== null && (g.proje ?? g.project) !== undefined ? (
                              <span className="px-2.5 py-1 rounded-md bg-slate-100/80 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200/50 dark:border-slate-700/60 text-xs font-bold">
                                {g.proje ?? g.project}
                              </span>
                            ) : (
                              <span className="text-slate-400 dark:text-slate-650 font-bold">-</span>
                            )}
                          </td>
                          <td className="grades-td-score">
                            {g.final !== null && g.final !== undefined ? (
                              <span className="px-2.5 py-1 rounded-md bg-indigo-50/50 dark:bg-indigo-950/20 text-indigo-750 dark:text-indigo-400 border border-indigo-100/50 dark:border-indigo-900/30 text-xs font-bold">
                                {g.final}
                              </span>
                            ) : (
                              <span className="px-2.5 py-1 rounded-md bg-amber-50/60 dark:bg-amber-950/20 text-amber-700 dark:text-amber-400 border border-amber-100/60 dark:border-amber-900/30 text-xs font-bold">
                                Açıklanmadı
                              </span>
                            )}
                          </td>
                          <td className="grades-td-badge">
                            {letter ? (
                              <span className={`px-2.5 py-1 rounded-md text-xs font-black uppercase ${getLetterBadgeStyle(letter)}`}>
                                {letter}
                              </span>
                            ) : null}
                          </td>
                          <td className="grades-td-score text-slate-500 dark:text-slate-400 font-bold text-xs">
                            {g.ects || g.akts} AKTS
                          </td>
                        </tr>
                      )
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>

        </div>

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
              <button
                className={`grades-action-row cursor-pointer ${isRequestingTranscript ? 'opacity-60' : ''}`}
                onClick={handleTranscriptRequest}
                disabled={isRequestingTranscript}
              >
                <div className="grades-action-left">
                  <span className="material-symbols-outlined">verified</span>
                  <span>{isRequestingTranscript ? 'Gönderiliyor...' : 'Resmi Transkript Talebi'}</span>
                </div>
                <span className="material-symbols-outlined">chevron_right</span>
              </button>
              <button className="grades-action-row cursor-pointer" onClick={downloadDisputeFormPDF}>
                <div className="grades-action-left">
                  <span className="material-symbols-outlined">grading</span>
                  <span>Not İtiraz Formu</span>
                </div>
                <span className="material-symbols-outlined">chevron_right</span>
              </button>
              <button className="grades-action-row cursor-pointer" onClick={downloadTranscriptPDF}>
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
