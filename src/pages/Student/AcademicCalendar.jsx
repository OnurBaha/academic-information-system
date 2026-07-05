import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { jsPDF } from 'jspdf'
import autoTable from 'jspdf-autotable'
import { toast } from 'react-hot-toast'

const ITEMS_PER_PAGE = 30

export default function AcademicCalendar() {
  const navigate = useNavigate()
  const [view, setView] = useState('selection') // 'selection' | 'academic' | 'exams'
  const [academicSemesterFilter, setAcademicSemesterFilter] = useState('all')
  const [examSemesterFilter, setExamSemesterFilter] = useState('bahar')
  const [searchTerm, setSearchTerm] = useState('')
  const [currentPage, setCurrentPage] = useState(1)

  // Filtre veya arama değiştiğinde 1. sayfaya sıfırla
  useEffect(() => {
    setCurrentPage(1)
  }, [academicSemesterFilter, searchTerm])

  const cleanTurkishChars = (str) => {
    return str
      .replace(/Ş/g, 'S').replace(/ş/g, 's')
      .replace(/Ç/g, 'C').replace(/ç/g, 'c')
      .replace(/Ğ/g, 'G').replace(/ğ/g, 'g')
      .replace(/Ü/g, 'U').replace(/ü/g, 'u')
      .replace(/Ö/g, 'O').replace(/ö/g, 'o')
      .replace(/I/g, 'I').replace(/ı/g, 'i')
      .replace(/İ/g, 'I')
  }

  const [academicEvents, setAcademicEvents] = useState([])
  const [studentExams, setStudentExams] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([
      fetch('http://localhost:3001/academicEvents').then(res => res.json()),
      fetch('http://localhost:3001/studentExams').then(res => res.json())
    ])
      .then(([events, exams]) => {
        setAcademicEvents(events)
        setStudentExams(exams)
        setLoading(false)
      })
      .catch(err => {
        console.error('Error loading academic calendar data', err)
        setLoading(false)
      })
  }, [])

  // ── PDF İndirme ───────────────────
  const downloadExamSchedulePDF = () => {
    if (examSemesterFilter === 'yaz') {
      toast.error('Yaz okulu sınav takvimi henüz açıklanmadığı için PDF indirilemez.')
      return
    }
    try {
      const doc = new jsPDF()
      const examsToPrint = studentExams[examSemesterFilter] || []
      const semesterLabel =
        examSemesterFilter === 'guz' ? 'Guz Donemi' :
          examSemesterFilter === 'bahar' ? 'Bahar Donemi' : 'Yaz Ogretimi'

      // Title
      doc.setFont('Helvetica', 'bold')
      doc.setFontSize(15)
      doc.text('SoftIto OBIS - Sinav Takvimi', 14, 18)

      doc.setFont('Helvetica', 'normal')
      doc.setFontSize(9)
      doc.text(`2025-2026 ${semesterLabel} Sinav Programi`, 14, 26)
      doc.text('Yazdirilma Tarihi: ' + new Date().toLocaleDateString('tr-TR'), 14, 32)

      // Bordered table
      autoTable(doc, {
        startY: 40,
        head: [['Tarih', 'Saat', 'Sinav Turu', 'Ders Kodu', 'Ders Adi', 'Sinif / Lab / Blok', 'Gozlemci']],
        body: examsToPrint.map(e => [e.date, e.time, e.type || 'Sinav', e.code, e.name, e.room, e.instructor]),
        styles: {
          fontSize: 8,
          cellPadding: 3,
          lineColor: [203, 213, 225],
          lineWidth: 0.3,
          font: 'Helvetica',
          textColor: [30, 41, 59]
        },
        headStyles: {
          fillColor: [30, 64, 175],
          textColor: 255,
          fontStyle: 'bold',
          halign: 'left'
        },
        alternateRowStyles: {
          fillColor: [248, 250, 252]
        },
        columnStyles: {
          0: { cellWidth: 24 },
          1: { cellWidth: 16 },
          2: { cellWidth: 24 },
          3: { cellWidth: 20 },
          4: { cellWidth: 50 },
          5: { cellWidth: 28 },
          6: { cellWidth: 28 }
        },
        margin: { left: 14, right: 14 }
      })

      doc.save(`Sinav_Takvimi_${examSemesterFilter}_2025_2026.pdf`)
      toast.success(`${semesterLabel} sınav takvimi PDF olarak indirildi!`)
    } catch (err) {
      console.error(err)
      toast.error('PDF oluşturulurken bir hata oluştu!')
    }
  }

  // ── Filtreleme ve Sayfalama ─────────────────────────────────────────────
  const parseDateString = (dateStr) => {
    const parts = dateStr.split('.')
    if (parts.length === 3) {
      return new Date(parts[2], parts[1] - 1, parts[0])
    }
    return new Date(0)
  }

  const sortedAcademicEvents = Array.isArray(academicEvents) ? [...academicEvents].filter(event => {
    const q = searchTerm.toLowerCase()
    const matchesSearch = event.title.toLowerCase().includes(q) || event.date.toLowerCase().includes(q)
    const matchesTab = academicSemesterFilter === 'all' || event.semester === academicSemesterFilter
    return matchesSearch && matchesTab
  }).sort((a, b) => parseDateString(a.date) - parseDateString(b.date)) : []

  // Sayfalama artık tek liste halinde gösterildiği için etkisizdir
  const totalPages = 1
  const pagedEvents = sortedAcademicEvents

  // Sayfalama yardımcısı — en fazla 7 sayfa butonu göster
  const getPageNumbers = () => {
    return [1]
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-900"></div>
      </div>
    )
  }

  // ──────────────────────────────────────────────────────────────────────
  // GÖRÜNÜM: SEÇİM
  // ──────────────────────────────────────────────────────────────────────
  if (view === 'selection') {
    return (
      <div className="flex flex-col items-center justify-center min-h-[75vh] p-6 max-w-[1440px] mx-auto w-full animate-fade-in">
        <div className="text-center mb-12">
          <h2 className="text-xl md:text-2xl font-bold text-slate-800 dark:text-white flex items-center justify-center gap-3">
            <span className="material-symbols-outlined text-primary text-3xl">calendar_month</span>
            <span>Akademik &amp; Sınav Takvimi</span>
          </h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-3 max-w-xl leading-relaxed">
            İncelemek istediğiniz takvim türünü seçiniz. 2025-2026 dönemlik planlar ve sınav programlarına buradan ulaşabilirsiniz.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 w-full max-w-4xl">
          {/* Kart 1 — Akademik Takvim */}
          <div
            onClick={() => setView('academic')}
            className="group relative cursor-pointer overflow-hidden rounded-3xl bg-white dark:bg-[#111827] p-8 border border-slate-200/60 dark:border-slate-800/80 shadow-md hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 flex flex-col justify-between"
          >
            <div className="absolute top-0 right-0 -mt-6 -mr-6 w-32 h-32 bg-blue-500/5 dark:bg-blue-500/10 rounded-full blur-2xl group-hover:scale-150 transition-all duration-500" />
            <div>
              <div className="w-16 h-16 rounded-2xl bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                <span className="material-symbols-outlined text-3xl">calendar_today</span>
              </div>
              <h3 className="text-xl font-bold text-slate-800 dark:text-white mb-3 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                2025-2026 Akademik Takvim
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                Kayıt tarihleri, ders başlangıçları, ekleme-bırakma dönemleri, ara sınav haftaları, resmi tatiller ve daha fazlası.
              </p>
            </div>
            <div className="mt-8 flex items-center text-xs font-bold text-blue-600 dark:text-blue-400 gap-1.5">
              <span>Takvimi İncele</span>
              <span className="material-symbols-outlined text-sm group-hover:translate-x-1 transition-transform">arrow_forward</span>
            </div>
          </div>

          {/* Kart 2 — Sınav Takvimi */}
          <div
            onClick={() => setView('exams')}
            className="group relative cursor-pointer overflow-hidden rounded-3xl bg-white dark:bg-[#111827] p-8 border border-slate-200/60 dark:border-slate-800/80 shadow-md hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 flex flex-col justify-between"
          >
            <div className="absolute top-0 right-0 -mt-6 -mr-6 w-32 h-32 bg-emerald-500/5 dark:bg-emerald-500/10 rounded-full blur-2xl group-hover:scale-150 transition-all duration-500" />
            <div>
              <div className="w-16 h-16 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                <span className="material-symbols-outlined text-3xl">edit_calendar</span>
              </div>
              <h3 className="text-xl font-bold text-slate-800 dark:text-white mb-3 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
                Sınav Takvimi
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                Kayıtlı derslerinize ait ara sınav, mazeret ve final programları. Sınav günleri, saatleri, salonları ve gözetmenler.
              </p>
            </div>
            <div className="mt-8 flex items-center text-xs font-bold text-emerald-600 dark:text-emerald-400 gap-1.5">
              <span>Sınavları Görüntüle</span>
              <span className="material-symbols-outlined text-sm group-hover:translate-x-1 transition-transform">arrow_forward</span>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // ──────────────────────────────────────────────────────────────────────
  // GÖRÜNÜM: AKADEMİK TAKVİM
  // ──────────────────────────────────────────────────────────────────────
  if (view === 'academic') {
    return (
      <div className="flex flex-col gap-6 p-6 max-w-[1440px] mx-auto w-full academic-calendar-page-canvas animate-fade-in">

        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-slate-100 dark:border-slate-800 pb-5">
          <div>
            <h2 className="student-page-title flex items-center gap-2">
              <span className="material-symbols-outlined text-blue-600 text-2xl">calendar_today</span>
              <span>2025-2026 Akademik Takvim</span>
            </h2>
            <p className="student-page-subtitle">
              T.C. İstanbul Softito Üniversitesi Ön Lisans ve Lisans Eğitim-Öğretim Yılı Takvimi.
            </p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setView('exams')}
              className="flex items-center gap-1.5 py-2 px-4 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition-all border-none cursor-pointer"
            >
              <span className="material-symbols-outlined text-sm">edit_calendar</span>
              <span>Sınav Takvimine Geç</span>
            </button>
            <button
              onClick={() => setView('selection')}
              className="flex items-center gap-1.5 py-2 px-4 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 rounded-xl text-xs font-bold transition-all border-none cursor-pointer"
            >
              <span className="material-symbols-outlined text-sm">arrow_back</span>
              <span>Ana Menüye Dön</span>
            </button>
          </div>
        </div>

        {/* Filtreleme ve Arama */}
        <div className="flex flex-col md:flex-row justify-between gap-4 items-center bg-white dark:bg-[#111827] p-6 rounded-3xl border border-slate-200/50 dark:border-slate-800/80 shadow-sm">
          <div className="flex flex-wrap gap-1.5 w-full md:w-auto">
            {[
              { id: 'all', label: 'Tümü' },
              { id: 'guz', label: 'Güz Yarıyılı' },
              { id: 'bahar', label: 'Bahar Yarıyılı' },
              { id: 'yaz', label: 'Yaz Öğretimi' },
              { id: 'tatil', label: 'Resmi Tatiller' }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setAcademicSemesterFilter(tab.id)}
                className={`py-1.5 px-3 rounded-lg text-xs font-bold transition-all cursor-pointer border-none ${academicSemesterFilter === tab.id
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'bg-slate-50 hover:bg-slate-100 dark:bg-slate-800/60 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300'
                  }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <div className="relative w-full md:w-64">
            <span className="material-symbols-outlined absolute left-3 top-2.5 text-slate-400 text-sm">search</span>
            <input
              type="text"
              placeholder="Takvimde ara..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-800 dark:text-white placeholder-slate-400 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
            />
          </div>
        </div>

        {/* Tablo */}
        <div className="bg-white dark:bg-[#111827] rounded-3xl shadow-sm border border-slate-200/50 dark:border-slate-800/80 transition-all duration-300 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-50 dark:bg-slate-800 text-slate-500 dark:text-slate-400 uppercase tracking-wider text-[10px] font-bold">
                  <th className="py-3.5 px-6 w-56">Tarih</th>
                  <th className="py-3.5 px-4">Etkinlik Başlığı</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {pagedEvents.length > 0 ? (
                  pagedEvents.map((item, idx) => (
                    <tr key={idx} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors">
                      <td className="py-3.5 px-6 font-bold text-slate-800 dark:text-slate-200 w-56">{item.date}</td>
                      <td className="py-3.5 px-4 font-semibold text-slate-700 dark:text-slate-300 leading-normal">{item.title}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={2} className="py-10 text-center text-slate-400 dark:text-slate-500 font-medium">
                      Arama kriterlerinize uygun etkinlik bulunamadı.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Tablo içindeki sayfalama alt alanı */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between px-6 py-4 border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/20">
              <p className="text-[10px] text-slate-400 dark:text-slate-500 font-medium">
                Toplam <span className="font-bold text-slate-600 dark:text-slate-300">{sortedAcademicEvents.length}</span> kayıt,{' '}
                sayfa <span className="font-bold text-slate-600 dark:text-slate-300">{currentPage}</span> / {totalPages}
              </p>
              <div className="flex items-center gap-1">
                {/* Geri */}
                <button
                  onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  className="w-7 h-7 flex items-center justify-center rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-blue-50 dark:hover:bg-blue-950/30 hover:text-blue-600 disabled:opacity-30 disabled:cursor-not-allowed transition-all cursor-pointer"
                >
                  <span className="material-symbols-outlined text-sm">chevron_left</span>
                </button>

                {getPageNumbers().map((p, i) =>
                  p === '...' ? (
                    <span key={`ellipsis-${i}`} className="w-7 h-7 flex items-center justify-center text-[10px] text-slate-400">…</span>
                  ) : (
                    <button
                      key={p}
                      onClick={() => setCurrentPage(p)}
                      className={`w-7 h-7 flex items-center justify-center rounded-lg text-[11px] font-bold transition-all cursor-pointer border ${currentPage === p
                        ? 'bg-blue-600 text-white border-blue-600 shadow-sm'
                        : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-blue-50 dark:hover:bg-blue-950/30 hover:text-blue-600'
                        }`}
                    >
                      {p}
                    </button>
                  )
                )}

                {/* İleri */}
                <button
                  onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                  className="w-7 h-7 flex items-center justify-center rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-blue-50 dark:hover:bg-blue-950/30 hover:text-blue-600 disabled:opacity-30 disabled:cursor-not-allowed transition-all cursor-pointer"
                >
                  <span className="material-symbols-outlined text-sm">chevron_right</span>
                </button>
              </div>
            </div>
          )}
        </div>

      </div>
    )
  }

  // ──────────────────────────────────────────────────────────────────────
  // GÖRÜNÜM: SINAV TAKVİMİ
  // ──────────────────────────────────────────────────────────────────────
  if (view === 'exams') {
    const currentExams = studentExams[examSemesterFilter] || []

    return (
      <div className="flex flex-col gap-6 p-6 max-w-[1440px] mx-auto w-full exams-calendar-page-canvas animate-fade-in">

        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-slate-100 dark:border-slate-800 pb-5">
          <div>
            <h2 className="student-page-title flex items-center gap-2">
              <span className="material-symbols-outlined text-emerald-600 text-2xl">edit_calendar</span>
              <span>Sınav Takvimi</span>
            </h2>
            <p className="student-page-subtitle">Dönemlik sınav saatleri, derslik yerleşimi ve gözetmen öğretim üyeleri.</p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setView('academic')}
              className="flex items-center gap-1.5 py-2 px-4 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition-all border-none cursor-pointer"
            >
              <span className="material-symbols-outlined text-sm">calendar_today</span>
              <span>Akademik Takvime Geç</span>
            </button>
            <button
              onClick={() => setView('selection')}
              className="flex items-center gap-1.5 py-2 px-4 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 rounded-xl text-xs font-bold transition-all border-none cursor-pointer"
            >
              <span className="material-symbols-outlined text-sm">arrow_back</span>
              <span>Ana Menüye Dön</span>
            </button>
          </div>
        </div>

        {/* Dönem Seçimi ve PDF Butonu */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white dark:bg-[#111827] p-6 rounded-3xl border border-slate-200/50 dark:border-slate-800/80 shadow-sm">
          <div className="flex gap-1.5 flex-wrap">
            {[
              { id: 'guz', label: 'Güz Yarıyılı Sınavları' },
              { id: 'bahar', label: 'Bahar Yarıyılı Sınavları' },
              { id: 'yaz', label: 'Yaz Okulu Sınavları' }
            ].map(term => (
              <button
                key={term.id}
                onClick={() => setExamSemesterFilter(term.id)}
                className={`py-1.5 px-3 rounded-lg text-xs font-bold transition-all cursor-pointer border-none ${examSemesterFilter === term.id
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'bg-slate-50 hover:bg-slate-100 dark:bg-slate-800/60 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300'
                  }`}
              >
                {term.label}
              </button>
            ))}
          </div>

          <button
            onClick={downloadExamSchedulePDF}
            className="flex items-center gap-1.5 py-2.5 px-5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition-all shadow-md border-none cursor-pointer shrink-0"
          >
            <span className="material-symbols-outlined text-sm">download</span>
            <span>Bu Dönemin Sınav Takvimini PDF İndir</span>
          </button>
        </div>

        {/* Sınavlar Tablosu */}
        {examSemesterFilter === 'yaz' ? (
          <div className="bg-white dark:bg-[#111827] rounded-3xl p-8 shadow-sm border border-slate-200/50 dark:border-slate-800/80 transition-all duration-300 flex items-center gap-4">
            <span className="material-symbols-outlined text-3xl text-blue-650 shrink-0">info</span>
            <p className="text-sm font-semibold text-slate-700 dark:text-slate-350 leading-relaxed m-0">
              Yaz okulu sınav takvimi henüz açıklanmamıştır. Yaz okulu 16.07.2026 tarihinde başlayacaktır.
            </p>
          </div>
        ) : (
          <div className="bg-white dark:bg-[#111827] rounded-3xl p-6 shadow-sm border border-slate-200/50 dark:border-slate-800/80 transition-all duration-300">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-50 dark:bg-slate-800 text-slate-500 dark:text-slate-400 uppercase tracking-wider text-[10px] font-bold">
                    <th className="py-3.5 px-4 rounded-l-xl">Tarih</th>
                    <th className="py-3.5 px-4">Saat</th>
                    <th className="py-3.5 px-4">Sınav Türü</th>
                    <th className="py-3.5 px-4">Ders Kodu</th>
                    <th className="py-3.5 px-4">Ders Adı</th>
                    <th className="py-3.5 px-4">Sınıf / Lab / Blok</th>
                    <th className="py-3.5 px-4 rounded-r-xl">Gözetmen / Öğretim Üyesi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {currentExams.length > 0 ? (
                    currentExams.map((exam, idx) => (
                      <tr key={idx} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors">
                        <td className="py-4 px-4 font-bold text-slate-800 dark:text-slate-200">{exam.date}</td>
                        <td className="py-4 px-4 text-slate-600 dark:text-slate-300 font-semibold">{exam.time}</td>
                        <td className="py-4 px-4">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${exam.type === 'Ara Sınav'
                            ? 'bg-blue-50 text-blue-600 dark:bg-blue-950/40 dark:text-blue-400 border border-blue-100/40 dark:border-blue-900/30'
                            : exam.type === 'Final Sınavı'
                              ? 'bg-red-50 text-red-600 dark:bg-red-950/40 dark:text-red-400 border border-red-100/40 dark:border-red-900/30'
                              : 'bg-amber-50 text-amber-600 dark:bg-amber-950/40 dark:text-amber-400 border border-amber-100/40 dark:border-amber-900/30'
                            }`}>{exam.type || 'Sınav'}</span>
                        </td>
                        <td className="py-4 px-4">
                          <span className="px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 font-extrabold">{exam.code}</span>
                        </td>
                        <td className="py-4 px-4 font-semibold text-slate-800 dark:text-slate-200 leading-normal">{exam.name}</td>
                        <td className="py-4 px-4 font-medium text-slate-500 dark:text-slate-400">{exam.room}</td>
                        <td className="py-4 px-4 text-slate-500 dark:text-slate-400">{exam.instructor}</td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={7} className="py-10 text-center text-slate-400 dark:text-slate-500 font-medium">
                        Bu döneme ait kayıtlı sınav bilgisi bulunmamaktadır.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

      </div>
    )
  }
}
