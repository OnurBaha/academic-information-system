import { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { fetchStudentGradesAsync, requestOfficialDocumentAsync, submitStudentRequestAsync } from '../../store/student/studentSlice'
import { toast } from 'react-hot-toast'
import { jsPDF } from 'jspdf'
import autoTable from 'jspdf-autotable'

export default function StudentAttendance() {
  const dispatch = useDispatch()
  const { currentUser } = useSelector((state) => state.auth || {})
  const { grades, status } = useSelector((state) => state.student || {})

  const [selectedSemester, setSelectedSemester] = useState('current')

  // Modal states for Sağlık Raporu & Özel İzin Dilekçesi
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [modalType, setModalType] = useState('rapor') // 'rapor' | 'izin'
  const [explanation, setExplanation] = useState('')
  const [fileName, setFileName] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSubmitted, setIsSubmitted] = useState(false)

  const handleModalSubmit = async (e) => {
    e.preventDefault()
    if (!explanation.trim()) {
      toast.error('Lütfen bir açıklama giriniz.')
      return
    }
    if (!fileName) {
      toast.error('Lütfen bir belge seçiniz.')
      return
    }

    setIsSubmitting(true)

    // Simulate upload delay (cidden bekle yüklensin!)
    setTimeout(async () => {
      try {
        const title = modalType === 'rapor' ? 'Sağlık Raporu' : 'Özel İzin Dilekçesi'
        const description = explanation

        // FAZ 2.5 — Belge talebi (Oversight'ta görünür)
        await dispatch(requestOfficialDocumentAsync({
          studentId: currentUser.id,
          title: title,
          description: description,
          type: 'document',
          status: 'pending',
          fileName: fileName,
          studentName: currentUser.name || 'Öğrenci'
        }))

        // FAZ 2.5 — Aynı zamanda ApprovalCenter'a da talep gönder (Dekan görebilsin)
        await dispatch(submitStudentRequestAsync({
          studentName: currentUser.name || 'Öğrenci',
          studentNumber: currentUser.studentNumber || currentUser.id,
          requestType: title,
          details: `${description} (Dosya: ${fileName})`,
        }))

        setIsSubmitting(false)
        setIsSubmitted(true)
        setExplanation('')
        setFileName('')
      } catch (err) {
        console.error(err)
        setIsSubmitting(false)
        toast.error('Belge gönderilirken bir hata oluştu.')
      }
    }, 2500)
  }

  const studentGrades = grades || []

  useEffect(() => {
    if (currentUser?.id) {
      dispatch(fetchStudentGradesAsync(currentUser.id))
    }
  }, [dispatch, currentUser])

  // Dönem filtresi
  const filteredGrades = studentGrades.filter(g => {
    let matchesSemester = true
    if (selectedSemester === 'current') matchesSemester = g.semester === '2025-2026 Bahar'
    else if (selectedSemester === 'spring') matchesSemester = g.semester === '2024-2025 Bahar'
    else if (selectedSemester === 'fall') matchesSemester = g.semester === '2024-2025 Güz'

    return matchesSemester
  })

  // Sadece devamsızlığı olan dersler listelenecek
  const displayGrades = filteredGrades.filter(g => g.absentDates && g.absentDates.length > 0)

  // Genel İstatistiklerin Hesaplanması (Tüm dönem dersleri üzerinden)
  const totalAbsentDays = filteredGrades.reduce((sum, g) => sum + (g.absentDates ? g.absentDates.length : 0), 0)
  const coursesWithAbsences = filteredGrades.filter(g => g.absentDates && g.absentDates.length > 0).length
  const criticalCourses = filteredGrades.filter(g => (g.absencePercentage || 0) >= 30).length

  // Genel katılım yüzdesi (Her devamsızlık günü için %5 azalır)
  const attendanceRate = Math.max(0, 100 - (totalAbsentDays * 5))
  const strokeCircumference = 364
  const strokeOffset = strokeCircumference - (strokeCircumference * attendanceRate) / 100

  const isLoading = status === 'loading'

  const downloadAttendancePDF = () => {
    try {
      const doc = new jsPDF()
      const semesterLabel = selectedSemester === 'current' ? '2025-2026 Bahar Dönemi' : 'Tüm Dönemler'

      doc.setFont('Helvetica', 'bold')
      doc.setFontSize(16)
      doc.setTextColor(30, 41, 59)
      doc.text('AKADEMIK BILGI SISTEMI', 14, 18)

      doc.setFont('Helvetica', 'normal')
      doc.setFontSize(10)
      doc.setTextColor(100, 116, 139)
      doc.text(`Devamsizlik Raporu - ${semesterLabel}`, 14, 25)
      doc.text(`Ogrenci: ${currentUser?.name || 'Ogrenci'} | Ogrenci No: ${currentUser?.id || '20211024007'}`, 14, 30)
      doc.text(`Tarih: ${new Date().toLocaleDateString('tr-TR')}`, 14, 35)

      const bodyData = filteredGrades.map(g => {
        const total = g.absentDates ? g.absentDates.length : 0
        const percentage = g.absencePercentage !== undefined ? g.absencePercentage : 0
        const datesText = g.absentDates && g.absentDates.length > 0 ? g.absentDates.join(', ') : 'Devamsizlik Yok'
        return [
          g.courseCode,
          g.courseName,
          `${percentage}%`,
          datesText,
          `${total} Saat`
        ]
      })

      autoTable(doc, {
        startY: 42,
        head: [['Ders Kodu', 'Ders Adi', 'Devamsizlik Yuzdesi', 'Devamsizlik Tarihleri', 'Toplam Devamsizlik']],
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
          fillColor: [30, 58, 138],
          textColor: 255,
          fontStyle: 'bold'
        },
        alternateRowStyles: { fillColor: [248, 250, 252] },
        columnStyles: {
          0: { cellWidth: 25 },
          1: { cellWidth: 50 },
          2: { cellWidth: 35, halign: 'center' },
          3: { cellWidth: 50 },
          4: { cellWidth: 25, halign: 'center' }
        },
        margin: { left: 14, right: 14 }
      })

      doc.save(`Devamsizlik_Raporu_${selectedSemester}_2025_2026.pdf`)
      toast.success('Devamsızlık raporu başarıyla indirildi!')
    } catch (err) {
      console.error(err)
      toast.error('PDF oluşturulurken bir hata oluştu!')
    }
  }

  return (
    <section className="grades-page-canvas text-slate-850 dark:text-white">

      {/* Sayfa Başlığı ve Filtre */}
      <div className="grades-page-header">
        <div>
          <h2 className="grades-page-title">Ders Devamsızlık Durumu</h2>
          <p className="grades-page-subtitle">Kayıtlı olunan derslerin dönemlik devam takip çizelgesi ve devamsızlık detayları.</p>
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
              <option value="all">Tüm Dönemler</option>
            </select>
            <span className="material-symbols-outlined">expand_more</span>
          </div>
        </div>
      </div>

      {/* İstatistik Kartları */}
      <div className="grades-stats-row mb-6">
        <div className="grades-stat-card">
          <div className="grades-card-header">
            <div className="grades-icon-blue">
              <span className="material-symbols-outlined">analytics</span>
            </div>
            <span className="grades-badge-gray">Aktif</span>
          </div>
          <div className="grades-card-body">
            <p className="grades-card-label">Genel Katılım Oranı</p>
            <h3 className="grades-card-value">%{attendanceRate}</h3>
          </div>
        </div>

        <div className="grades-stat-card">
          <div className="grades-card-header">
            <div className="grades-icon-navy">
              <span className="material-symbols-outlined">event_busy</span>
            </div>
            <span className="grades-badge-gray">{filteredGrades.length} Toplam Ders</span>
          </div>
          <div className="grades-card-body">
            <p className="grades-card-label">Toplam Devamsızlık Sayısı</p>
            <h3 className="grades-card-value">{isLoading ? '...' : `${totalAbsentDays} Gün`}</h3>
          </div>
        </div>

        <div className="grades-stat-card">
          <div className="grades-card-header">
            <div className="grades-icon-amber">
              <span className="material-symbols-outlined">menu_book</span>
            </div>
            <span className="grades-badge-gray">Kayıtlar</span>
          </div>
          <div className="grades-card-body">
            <p className="grades-card-label">Devamsız Ders Sayısı</p>
            <h3 className="grades-card-value">{isLoading ? '...' : `${coursesWithAbsences} Ders`}</h3>
          </div>
        </div>

        <div className="grades-stat-card">
          <div className="grades-card-header">
            <div className="grades-icon-emerald">
              <span className="material-symbols-outlined">warning</span>
            </div>
            <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${criticalCourses > 0 ? 'bg-red-50 text-red-600 dark:bg-red-950/20 dark:text-red-400 border border-red-100 dark:border-red-900/30' : 'grades-badge-green'}`}>
              {criticalCourses > 0 ? 'Risk Altında' : 'Olağan'}
            </span>
          </div>
          <div className="grades-card-body">
            <p className="grades-card-label">Sınırda Olan Dersler (≥%30)</p>
            <h3 className={`grades-card-value ${criticalCourses > 0 ? 'text-red-650 dark:text-red-400' : ''}`}>
              {isLoading ? '...' : criticalCourses}
            </h3>
          </div>
        </div>
      </div>

      {/* Devamsızlık Ana Bölümü */}
      <div className="grades-main-layout">
        <div className="grades-left-column">

          {/* Devamsızlık Detay Tablosu */}
          <div className="grades-table-wrapper">
            <div className="grades-table-header">
              <h4 className="grades-table-title">Ders Bazlı Devamsızlık Çizelgesi</h4>
              <button
                className="grades-btn-download cursor-pointer"
                onClick={downloadAttendancePDF}
              >
                <span className="material-symbols-outlined">download</span>
                <span>Raporu İndir</span>
              </button>
            </div>
            <div className="grades-table-scroll">
              <table className="grades-data-table">
                <thead>
                  <tr>
                    <th className="grades-th-center w-1/5">Ders Kodu</th>
                    <th className="grades-th-center w-2/5">Ders Adı</th>
                    <th className="grades-th-center w-1/5">Devamsızlık Yüzdesi</th>
                    <th className="grades-th-center w-2/5">Devamsızlık Yapılan Tarihler</th>
                    <th className="grades-th-center w-1/5">Toplam Devamsızlık</th>
                  </tr>
                </thead>
                <tbody>
                  {isLoading ? (
                    <tr>
                      <td colSpan="5" className="grades-td-course" style={{ textAlign: 'center', padding: '30px 0' }}>
                        Yükleniyor...
                      </td>
                    </tr>
                  ) : displayGrades.length === 0 ? (
                    <tr>
                      <td colSpan="5" className="grades-td-course" style={{ textAlign: 'center', padding: '30px 0' }}>
                        Seçilen döneme ait devamsızlık kaydınız bulunmamaktadır.
                      </td>
                    </tr>
                  ) : (
                    displayGrades.map((g) => {
                      const percent = g.absencePercentage || 0
                      const isCritical = percent >= 30
                      const dates = g.absentDates || []
                      const totalCount = dates.length

                      return (
                        <tr className="grades-table-row" key={g.id}>
                          {/* Ders Kodu */}
                          <td className="grades-td-score">
                            <p className="grades-course-code font-bold text-slate-800 dark:text-white text-center">
                              {g.courseCode}
                            </p>
                          </td>
                          {/* Ders Adı */}
                          <td className="grades-td-score">
                            <p className="font-semibold text-slate-800 dark:text-slate-200 text-center">
                              {g.courseName}
                            </p>
                          </td>
                          {/* Devamsızlık Yüzdesi */}
                          <td className="grades-td-score font-bold">
                            <span
                              className={isCritical ? 'text-red-650 dark:text-red-400 font-extrabold text-base' : 'text-slate-700 dark:text-slate-350 text-sm font-semibold'}
                              style={isCritical ? { color: '#ef4444' } : {}}
                            >
                              %{percent}
                            </span>
                            {isCritical && (
                              <span className="block text-[10px] text-red-650 dark:text-red-400 font-bold uppercase mt-0.5">
                                Sınıra Yakın
                              </span>
                            )}
                          </td>
                          {/* Devamsızlık Yapılan Tarihler (gg/aa/yyyy formatında, alt alta listelenmiş) */}
                          <td className="grades-td-score">
                            <div className="flex flex-wrap gap-1 items-center justify-center max-w-[200px] mx-auto">
                              {dates.map((d, index) => (
                                <span
                                  key={index}
                                  className="bg-slate-100 dark:bg-slate-850 text-slate-700 dark:text-slate-300 px-2 py-0.5 rounded text-[10px] font-bold border border-slate-200/40 dark:border-slate-700/40"
                                >
                                  {d}
                                </span>
                              ))}
                            </div>
                          </td>
                          {/* Toplam Devamsızlık */}
                          <td className="grades-td-score font-semibold text-slate-700 dark:text-slate-200">
                            {totalCount} Gün
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

        {/* Yan Sütun: Dairesel Görsel ve Hızlı Bilgiler */}
        <div className="grades-right-column">

          <div className="grades-attendance-card flex flex-col gap-6 w-full">
            <div className="flex flex-col items-center justify-center gap-6 p-4">

              <div className="grades-attendance-visual relative select-none filter drop-shadow-md">
                <svg className="grades-attendance-svg w-32 h-32 transform -rotate-90">
                  <defs>
                    <linearGradient id="attendanceGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor="#2563eb" />
                      <stop offset="100%" stopColor="#10b981" />
                    </linearGradient>
                  </defs>
                  <circle
                    cx="64"
                    cy="64"
                    r="58"
                    strokeWidth="8"
                    className="grades-circle-bg stroke-slate-100 dark:stroke-slate-700/60 fill-none"
                  />
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
                  <span className="text-xl font-black text-slate-800 dark:text-white leading-none">{attendanceRate}%</span>
                  <span className="text-[9px] text-slate-400 dark:text-slate-500 uppercase tracking-widest mt-1 font-bold">Katılım</span>
                </div>
              </div>

              <div className="grades-attendance-details text-center">
                <h5 className="grades-details-title text-sm font-extrabold text-blue-900 dark:text-blue-400">Genel Katılım Analizi</h5>
                <p className="grades-details-desc text-xs text-slate-500 mt-1 leading-relaxed">
                  Bu dönem kayıtlı derslerinizin ortalama %{attendanceRate} oranında katılımını sağladınız. Sınırı geçmemek için devamsızlık durumunuzu düzenli kontrol edin.
                </p>
                <div className="grades-details-chips flex justify-center gap-2 mt-3 text-[10px] font-bold">
                  <span className="grades-chip-green bg-emerald-50 dark:bg-emerald-950/20 text-emerald-600 dark:text-emerald-400 px-2.5 py-1 rounded-full border border-emerald-100 dark:border-emerald-900/30 flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                    <span>Güvenli Limit</span>
                  </span>
                  <span className="grades-chip-gray bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-350 px-2.5 py-1 rounded-full border border-slate-100 dark:border-slate-700 flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-slate-400" />
                    <span>Toplam {totalAbsentDays} Gün Yok</span>
                  </span>
                </div>
              </div>

            </div>
          </div>

          <div className="grades-actions-card">
            <h5 className="grades-actions-title">Yoklama İşlemleri</h5>
            <div className="grades-actions-list">
              <button
                className="grades-action-row cursor-pointer"
                onClick={() => {
                  setModalType('rapor');
                  setIsModalOpen(true);
                  setIsSubmitted(false);
                  setExplanation('');
                  setFileName('');
                }}
              >
                <div className="grades-action-left">
                  <span className="material-symbols-outlined">upload_file</span>
                  <span>Sağlık Raporu Yükle</span>
                </div>
                <span className="material-symbols-outlined">chevron_right</span>
              </button>
              <button
                className="grades-action-row cursor-pointer"
                onClick={() => {
                  setModalType('izin');
                  setIsModalOpen(true);
                  setIsSubmitted(false);
                  setExplanation('');
                  setFileName('');
                }}
              >
                <div className="grades-action-left">
                  <span className="material-symbols-outlined">badge</span>
                  <span>Özel İzin Dilekçesi</span>
                </div>
                <span className="material-symbols-outlined">chevron_right</span>
              </button>
            </div>
          </div>

        </div>

      </div>

      {/* Rapor / İzin Yükleme Modalı */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 transition-all">
          <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-3xl w-full max-w-md overflow-hidden shadow-2xl p-6 relative flex flex-col gap-6 animate-in fade-in zoom-in-95 duration-200">

            {/* Modal Header */}
            <div className="flex justify-between items-start">
              <div>
                <h3 className="text-base font-extrabold text-slate-850 dark:text-white flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-blue-650">
                    {modalType === 'rapor' ? 'medical_services' : 'history_edu'}
                  </span>
                  <span>{modalType === 'rapor' ? 'Sağlık Raporu Girişi' : 'Özel İzin Dilekçesi Talebi'}</span>
                </h3>
                <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">
                  {modalType === 'rapor'
                    ? 'Devamsızlık muafiyeti için sağlık raporu belgesi yükleyin.'
                    : 'Dekanlık onayına sunulmak üzere resmi izin dilekçesi yükleyin.'}
                </p>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1 hover:bg-slate-100 dark:hover:bg-slate-750 rounded-lg text-slate-400 dark:text-slate-500 transition-colors border-none bg-transparent cursor-pointer material-symbols-outlined text-lg"
              >
                close
              </button>
            </div>

            {/* Modal Body */}
            {isSubmitted ? (
              <div className="flex flex-col items-center justify-center py-6 text-center gap-4">
                <span className="material-symbols-outlined text-6xl text-emerald-500 animate-bounce">check_circle</span>
                <div>
                  <h4 className="text-sm font-extrabold text-slate-850 dark:text-white">
                    {modalType === 'rapor' ? 'Rapor Gönderilmiştir' : 'Dilekçe Gönderilmiştir'}
                  </h4>
                  <p className="text-xs text-slate-400 dark:text-slate-500 mt-1.5 px-4 leading-relaxed font-semibold">
                    {modalType === 'rapor'
                      ? 'Sağlık raporunuz sisteme başarıyla kaydedilmiş ve onay sürecine alınmıştır.'
                      : 'Özel izin dilekçeniz başarıyla Dekanlık onayına sunulmuştur. Dekan onayından sonra durum güncellenecektir.'}
                  </p>
                </div>
                <button
                  onClick={() => { setIsModalOpen(false); setIsSubmitted(false); }}
                  className="mt-2 px-6 py-2 bg-blue-900 hover:bg-blue-800 text-white font-bold text-xs rounded-xl shadow-md cursor-pointer border-none"
                >
                  Kapat
                </button>
              </div>
            ) : isSubmitting ? (
              <div className="flex flex-col items-center justify-center py-10 text-center gap-4">
                <svg className="animate-spin h-10 w-10 text-blue-600" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                <div>
                  <h4 className="text-sm font-extrabold text-slate-850 dark:text-white">Belge Yükleniyor</h4>
                  <p className="text-xs text-slate-400 dark:text-slate-500 mt-1 font-semibold">Lütfen bekleyiniz, belge sisteme yükleniyor...</p>
                </div>
              </div>
            ) : (
              <form onSubmit={handleModalSubmit} className="space-y-4">
                <div className="space-y-1">
                  <label className="block text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Açıklama</label>
                  <textarea
                    value={explanation}
                    onChange={(e) => setExplanation(e.target.value)}
                    placeholder={modalType === 'rapor' ? 'Rapor detaylarını (rapor tarihi, protokol no, hastane) belirtiniz...' : 'İzin talebinizin gerekçesini açıklayınız...'}
                    rows={3}
                    required
                    className="w-full text-xs px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-1 focus:ring-blue-500 focus:outline-none resize-none font-semibold text-slate-700 dark:text-slate-200"
                  />
                </div>

                <div className="space-y-1">
                  <label className="block text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Belge Yükle</label>
                  <div
                    onClick={() => document.getElementById('modal-file-input').click()}
                    className="border-2 border-dashed border-slate-200 dark:border-slate-700 hover:border-blue-500/50 rounded-2xl p-6 text-center cursor-pointer transition-colors relative"
                  >
                    <input
                      type="file"
                      id="modal-file-input"
                      className="hidden"
                      accept=".pdf,.png,.jpg,.jpeg,.doc,.docx"
                      required
                      onChange={(e) => {
                        if (e.target.files && e.target.files[0]) {
                          setFileName(e.target.files[0].name)
                        }
                      }}
                    />
                    <span className="material-symbols-outlined text-3xl text-slate-400 dark:text-slate-600">upload_file</span>
                    <p className="text-[11px] text-slate-750 dark:text-slate-300 font-bold mt-1.5 max-w-full truncate px-4">
                      {fileName ? fileName : 'Dosya Seçin veya Sürükleyin'}
                    </p>
                    <p className="text-[9px] text-slate-400 mt-0.5">Sadece PDF, PNG, JPG, DOCX - Maks 10MB</p>
                  </div>
                </div>

                <div className="flex gap-3 justify-end pt-3">
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="px-4 py-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-700 dark:hover:bg-slate-650 text-slate-750 dark:text-slate-300 font-bold text-xs rounded-xl cursor-pointer border-none"
                  >
                    Vazgeç
                  </button>
                  <button
                    type="submit"
                    className="px-6 py-2 bg-blue-900 hover:bg-blue-800 text-white font-bold text-xs rounded-xl shadow-md cursor-pointer border-none flex items-center gap-1.5"
                  >
                    <span className="material-symbols-outlined text-sm">send</span>
                    <span>Gönder</span>
                  </button>
                </div>
              </form>
            )}

          </div>
        </div>
      )}

    </section>
  )
}
