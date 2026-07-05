import { useState, useEffect } from 'react'
import { jsPDF } from 'jspdf'
import autoTable from 'jspdf-autotable'
import { toast } from 'react-hot-toast'
import { useNavigate } from 'react-router-dom'

export default function ExamCalendar() {
  const navigate = useNavigate()
  const [activeSemester, setActiveSemester] = useState('bahar')
  const [studentExams, setStudentExams] = useState(null)
  const [registeredCourseCodes, setRegisteredCourseCodes] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem('currentUser')) || { id: 'u7' }
    
    // Fetch student's registered courses first
    fetch(`http://localhost:3001/studentCourses?studentId=${user.id}`)
      .then(res => res.json())
      .then(courses => {
        const codes = courses.map(c => c.code)
        setRegisteredCourseCodes(codes)
        
        // Fetch all exams
        return fetch('http://localhost:3001/studentExams')
      })
      .then(res => res.json())
      .then(data => {
        setStudentExams(data)
        setLoading(false)
      })
      .catch(err => {
        console.error('Error fetching exams calendar', err)
        setLoading(false)
      })
  }, [])

  const downloadExamSchedulePDF = () => {
    if (!studentExams) return
    if (activeSemester === 'yaz') {
      toast.error('Yaz okulu sınav takvimi henüz açıklanmadığı için PDF indirilemez.')
      return
    }
    try {
      const doc = new jsPDF()
      const examsToPrint = (studentExams[activeSemester] || []).filter(exam => registeredCourseCodes.includes(exam.code))
      const semesterLabel =
        activeSemester === 'guz' ? 'Guz Donemi' :
        activeSemester === 'bahar' ? 'Bahar Donemi' : 'Yaz Ogretimi'

      doc.setFont('Helvetica', 'bold')
      doc.setFontSize(15)
      doc.text('SoftIto OBIS - Sinav Takvimi', 14, 18)

      doc.setFont('Helvetica', 'normal')
      doc.setFontSize(9)
      doc.text(`2025-2026 ${semesterLabel} Sinav Programi`, 14, 26)
      doc.text('Yazdirilma Tarihi: ' + new Date().toLocaleDateString('tr-TR'), 14, 32)

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
        alternateRowStyles: { fillColor: [248, 250, 252] },
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

      doc.save(`Sinav_Takvimi_${activeSemester}_2025_2026.pdf`)
      toast.success(`${semesterLabel} sınav takvimi PDF olarak indirildi!`)
    } catch (err) {
      console.error(err)
      toast.error('PDF oluşturulurken bir hata oluştu!')
    }
  }

  const currentExams = studentExams ? (studentExams[activeSemester] || []).filter(exam => registeredCourseCodes.includes(exam.code)) : []

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-900"></div>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-6 p-6 max-w-[1440px] mx-auto w-full exams-calendar-page-canvas animate-fade-in">

      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-slate-100 dark:border-slate-800 pb-5">
        <div>
          <h2 className="student-page-title flex items-center gap-2">
            <span className="material-symbols-outlined text-emerald-600 text-2xl">edit_calendar</span>
            <span>Sınav Takvimi</span>
          </h2>
          <p className="student-page-subtitle">Dönemlik sınav saatleri, gözetmen öğretim üyeleri ve sınav salonları.</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => navigate('/student/academic-calendar')}
            className="flex items-center gap-1.5 py-2 px-4 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 rounded-xl text-xs font-bold transition-all border-none cursor-pointer"
          >
            <span className="material-symbols-outlined text-sm">event_note</span>
            <span>Akademik Takvime Git</span>
          </button>
          <button
            onClick={() => navigate('/student/calendar')}
            className="flex items-center gap-1.5 py-2 px-4 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 rounded-xl text-xs font-bold transition-all border-none cursor-pointer"
          >
            <span className="material-symbols-outlined text-sm">arrow_back</span>
            <span>Ders Programına Dön</span>
          </button>
        </div>
      </div>

      {/* Term Switcher + PDF */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white dark:bg-[#111827] p-6 rounded-3xl border border-slate-200/50 dark:border-slate-800/80 shadow-sm">
        <div className="flex gap-1.5 flex-wrap">
          {[
            { id: 'guz', label: 'Güz Yarıyılı Sınavları' },
            { id: 'bahar', label: 'Bahar Yarıyılı Sınavları' },
            { id: 'yaz', label: 'Yaz Okulu Sınavları' }
          ].map(term => (
            <button
              key={term.id}
              onClick={() => setActiveSemester(term.id)}
              className={`py-1.5 px-3 rounded-lg text-xs font-bold transition-all cursor-pointer border-none ${
                activeSemester === term.id
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
          <span>Sınav Takvimini PDF İndir</span>
        </button>
      </div>

      {/* Exams Table */}
      {activeSemester === 'yaz' ? (
        <div className="bg-white dark:bg-[#111827] rounded-3xl p-8 shadow-sm border border-slate-200/50 dark:border-slate-800/80 transition-all duration-300 flex items-center gap-4">
          <span className="material-symbols-outlined text-3xl text-blue-650 shrink-0">info</span>
          <p className="text-sm font-semibold text-slate-700 dark:text-slate-350 leading-relaxed m-0">
            Yaz okulu sınav takvimi henüz açıklanmamıştır. Yaz okulu 06.07.2026 tarihinde başlayacaktır.
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
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          exam.type === 'Ara Sınav'
                            ? 'bg-blue-50 text-blue-600 dark:bg-blue-950/40 dark:text-blue-400 border border-blue-100/40 dark:border-blue-900/30'
                            : exam.type === 'Final Sınavı'
                            ? 'bg-red-50 text-red-600 dark:bg-red-950/40 dark:text-red-400 border border-red-100/40 dark:border-red-900/30'
                            : 'bg-amber-50 text-amber-600 dark:bg-amber-950/40 dark:text-amber-400 border border-amber-100/40 dark:border-amber-900/30'
                        }`}>{exam.type || 'Sınav'}</span>
                      </td>
                      <td className="py-4 px-4">
                        <span className="px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 font-extrabold">{exam.code}</span>
                      </td>
                      <td className="py-4 px-4 font-semibold text-slate-800 dark:text-slate-200">{exam.name}</td>
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
