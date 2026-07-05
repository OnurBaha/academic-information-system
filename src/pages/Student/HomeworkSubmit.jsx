import React, { useState } from 'react'
import { useSelector } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import { toast } from 'react-hot-toast'
import { initialHomeworks } from '../../store/student/studentData'

// initialHomeworks → src/data/studentData.js'ten import edilir

export default function HomeworkSubmit() {
  const navigate = useNavigate()
  const { user } = useSelector((state) => state.auth)

  // Sayfa Durumları
  const [homeworks, setHomeworks] = useState(initialHomeworks)
  const [activeFilter, setActiveFilter] = useState('all') // 'all' | 'pending'
  const [searchQuery, setSearchQuery] = useState('')
  const [expandedRow, setExpandedRow] = useState(null) // Açık olan ödev teslim satırı
  const [studentNotes, setStudentNotes] = useState({}) // Ödev notları
  const [uploadedFiles, setUploadedFiles] = useState({}) // Yüklenen dosya isimleri
  const [confirmingRowId, setConfirmingRowId] = useState(null) // Onaylama durumundaki ödev

  // İstatistikleri hesapla (Dinamik ve canlı tepki veren sayaçlar)
  const pendingCount = homeworks.filter(h => h.status === 'Bekliyor').length
  const completedCount = homeworks.filter(h => h.status === 'Teslim Edildi').length
  const approachingCount = homeworks.filter(h => h.status === 'Bekliyor' && h.daysLeft !== null && h.daysLeft <= 5).length
  const delayedCount = 0



  // Tablo satırını aç/kapat
  const toggleRow = (rowId) => {
    if (expandedRow === rowId) {
      setExpandedRow(null)
      setConfirmingRowId(null)
    } else {
      setExpandedRow(rowId)
      setConfirmingRowId(null)
    }
  }

  // Bilgisayardan dosya seçildiğinde tetiklenen fonksiyon
  const handleFileChange = (e, hwId) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0]
      setUploadedFiles(prev => ({ ...prev, [hwId]: file.name }))
      toast.success(`${file.name} yüklenmek üzere seçildi!`)
    }
  }

  // Ödev Gönderimini Tamamla (Canlı Simülasyon)
  const handleSubmissionComplete = (rowId, courseName) => {
    const fileName = uploadedFiles[rowId] || `${user?.name || 'Ahmet'}_${courseName.replace(/\s+/g, '_')}_Odev.pdf`
    
    // Ödev durumunu güncelle
    setHomeworks(prev => prev.map(h => {
      if (h.id === rowId) {
        return {
          ...h,
          status: 'Teslim Edildi',
          daysLeft: null
        }
      }
      return h
    }))

    toast.success(`'${fileName}' başarıyla sisteme yüklendi!`)
    setExpandedRow(null)
    setConfirmingRowId(null)
  }

  // Arama ve filtreleme mantığı
  const filteredList = homeworks.filter(h => {
    const matchesSearch = h.courseName.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          h.title.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesTab = activeFilter === 'all' || h.status === 'Bekliyor'
    return matchesSearch && matchesTab
  })

  // Bekleyen ödevler listede 1. sırada (en üstte) olmalı
  const sortedList = [...filteredList].sort((a, b) => {
    if (a.status === 'Bekliyor' && b.status !== 'Bekliyor') return -1
    if (a.status !== 'Bekliyor' && b.status === 'Bekliyor') return 1
    return 0
  })

  return (
    <section className="flex-grow p-4 md:p-8 max-w-7xl mx-auto space-y-6 text-slate-800 dark:text-white">
      
      {/* Üst Menü ve Arama Çubuğu */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-4">
        <div>
          <nav className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400">
            <span>Öğrenci Portalı</span>
            <span className="material-symbols-outlined text-[14px]">chevron_right</span>
            <span className="font-bold text-blue-600 dark:text-blue-400 font-sans">Ödevler</span>
          </nav>
          <h1 className="student-page-title mt-1">
            Sınav ve Ödev Gönderim Merkezi
          </h1>
        </div>

        {/* Ödev Arama Barı */}
        <div className="relative w-full md:w-64">
          <span className="material-symbols-outlined absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 text-base pointer-events-none">
            search
          </span>
          <input
            type="text"
            placeholder="Ödev veya ders ara..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9 pr-4 py-1.5 w-full bg-white dark:bg-slate-800 text-slate-800 dark:text-white border border-slate-200 dark:border-slate-700 rounded-xl text-xs focus:ring-1 focus:ring-blue-500 focus:outline-none"
          />
        </div>
      </div>

      {/* Özet Durum Kartları */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
        
        {/* Kart 1: Bekleyen */}
        <div className="bg-white dark:bg-slate-800 p-5 rounded-2xl border border-slate-100 dark:border-slate-800/60 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0">
            <span className="material-symbols-outlined text-2xl font-bold">pending_actions</span>
          </div>
          <div>
            <p className="text-[10px] text-slate-400 dark:text-slate-500 uppercase tracking-wider font-bold">Bekleyen</p>
            <h3 className="text-xl font-black text-slate-800 dark:text-white mt-0.5">
              {String(pendingCount).padStart(2, '0')}
            </h3>
          </div>
        </div>

        {/* Kart 2: Tamamlanan */}
        <div className="bg-white dark:bg-slate-800 p-5 rounded-2xl border border-slate-100 dark:border-slate-800/60 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
            <span className="material-symbols-outlined text-2xl font-bold">check_circle</span>
          </div>
          <div>
            <p className="text-[10px] text-slate-400 dark:text-slate-500 uppercase tracking-wider font-bold">Tamamlanan</p>
            <h3 className="text-xl font-black text-slate-800 dark:text-white mt-0.5">
              {String(completedCount).padStart(2, '0')}
            </h3>
          </div>
        </div>

        {/* Kart 3: Yaklaşan Tarih */}
        <div className="bg-white dark:bg-slate-800 p-5 rounded-2xl border border-slate-100 dark:border-slate-800/60 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0">
            <span className="material-symbols-outlined text-2xl font-bold">timer</span>
          </div>
          <div>
            <p className="text-[10px] text-slate-400 dark:text-slate-500 uppercase tracking-wider font-bold">Yaklaşan Tarih</p>
            <h3 className="text-xl font-black text-slate-800 dark:text-white mt-0.5">
              {String(approachingCount).padStart(2, '0')}
            </h3>
          </div>
        </div>

        {/* Kart 4: Geciken */}
        <div className="bg-white dark:bg-slate-800 p-5 rounded-2xl border border-slate-100 dark:border-slate-800/60 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-450 flex items-center justify-center shrink-0">
            <span className="material-symbols-outlined text-2xl font-bold">release_alert</span>
          </div>
          <div>
            <p className="text-[10px] text-slate-400 dark:text-slate-500 uppercase tracking-wider font-bold">Geciken</p>
            <h3 className="text-xl font-black text-slate-800 dark:text-white mt-0.5">
              {String(delayedCount).padStart(2, '0')}
            </h3>
          </div>
        </div>

      </div>

      {/* Güncel Ödev ve Sınav Listesi (Ana Tablo Alanı) */}
      <div className="bg-white dark:bg-slate-800 rounded-3xl border border-slate-100 dark:border-slate-800/60 shadow-sm overflow-hidden">
        
        {/* Üst Filtre Barı */}
        <div className="px-6 py-4 bg-slate-50/50 dark:bg-slate-800/40 border-b border-slate-100 dark:border-slate-800/60 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <h2 className="text-sm font-extrabold text-blue-900 dark:text-blue-400 flex items-center gap-2">
            <span className="material-symbols-outlined">assignment_late</span>
            Güncel Ödev ve Sınav Listesi
          </h2>

          <div className="flex gap-1.5 self-end sm:self-auto">
            <button
              onClick={() => setActiveFilter('all')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                activeFilter === 'all'
                  ? 'bg-blue-900 text-white shadow-sm'
                  : 'border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700/50'
              }`}
            >
              Tümü
            </button>
            <button
              onClick={() => setActiveFilter('pending')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                activeFilter === 'pending'
                  ? 'bg-blue-900 text-white shadow-sm'
                  : 'border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700/50'
              }`}
            >
              Bekleyenler
            </button>
          </div>
        </div>

        {/* Tablo Yapısı */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/20 dark:bg-slate-900/20 text-slate-400 dark:text-slate-500 text-[10px] font-bold uppercase border-b border-slate-100 dark:border-slate-800">
                <th className="px-6 py-3.5">Ders Adı</th>
                <th className="px-6 py-3.5">Ödev/Proje Başlığı</th>
                <th className="px-6 py-3.5">Son Teslim Tarihi</th>
                <th className="px-6 py-3.5">Durum</th>
                <th className="px-6 py-3.5 text-right">Eylem</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/40 text-xs">
              {sortedList.map((hw) => {
                const isCompleted = hw.status === 'Teslim Edildi'
                const isOpened = expandedRow === hw.id
                const cleanTitle = hw.title.replace(/^Ödev\s*(?:#?\d+)?\s*[-—]\s*/i, '')

                return (
                  <React.Fragment key={hw.id}>
                    <tr className="hover:bg-slate-50/50 dark:hover:bg-slate-800/20 transition-colors group">
                      {/* Ders Adı */}
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-1.5">
                          <span className={`px-2 py-0.5 rounded font-bold text-[10px] shrink-0 ${hw.colorClass} mr-2`}>
                            {hw.courseCode}
                          </span>
                          <span className="font-bold text-slate-800 dark:text-white">
                            {hw.courseName}
                          </span>
                        </div>
                      </td>

                      {/* Ödev Başlığı */}
                      <td className="px-6 py-4 text-slate-700 dark:text-slate-300 font-semibold">
                        {cleanTitle}
                      </td>

                      {/* Son Teslim Tarihi */}
                      <td className="px-6 py-4">
                        <div className="flex flex-col">
                          <span className="font-bold text-slate-800 dark:text-white">{hw.dueDate}</span>
                          {isCompleted ? (
                            <span className="text-emerald-500 font-bold text-[10px] flex items-center gap-0.5 mt-0.5">
                              <span className="material-symbols-outlined text-xs font-bold">check_circle</span>
                              Tamamlandı
                            </span>
                          ) : (
                            <span className="text-amber-500 font-bold text-[10px] flex items-center gap-0.5 mt-0.5">
                              <span className="material-symbols-outlined text-xs">schedule</span>
                              {hw.daysLeft} Gün Kaldı
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Durum Rozeti */}
                      <td className="px-6 py-4">
                        {isCompleted ? (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 border border-emerald-100 dark:border-emerald-900/30">
                            Teslim Edildi
                          </span>
                        ) : (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 dark:bg-amber-950/20 text-amber-600 dark:text-amber-400 border border-amber-100 dark:border-amber-900/20">
                            Beklemede
                          </span>
                        )}</td>

                      {/* Eylem */}
                      <td className="px-6 py-4 text-right">
                        {isCompleted ? (
                          <button
                            onClick={() => toggleRow(hw.id)}
                            className="text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 font-bold text-xs transition-colors flex items-center justify-end gap-1 ml-auto cursor-pointer"
                          >
                            <span>Detaylar</span>
                            <span className={`material-symbols-outlined text-sm transition-transform duration-300 ${isOpened ? 'rotate-180 text-blue-600' : ''}`}>
                              visibility
                            </span>
                          </button>
                        ) : (
                          <button
                            onClick={() => toggleRow(hw.id)}
                            className="text-blue-600 dark:text-blue-400 hover:underline font-bold text-xs flex items-center justify-end gap-0.5 ml-auto cursor-pointer"
                          >
                            <span>Dosya Gönder</span>
                            <span className={`material-symbols-outlined text-sm transition-transform duration-300 ${isOpened ? 'rotate-180' : ''}`}>
                              expand_more
                            </span>
                          </button>
                        )}
                      </td>
                    </tr>

                    {/* Çekmece - Dosya Teslim Paneli veya Gönderim Detayları */}
                    {isOpened && (
                      <tr className="bg-slate-50/40 dark:bg-slate-900/20 overflow-hidden animate-fade-in">
                        <td className="p-0" colSpan={5}>
                          <div className="p-6 border-t border-slate-100 dark:border-slate-800">
                            
                            {isCompleted ? (
                              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                <div className="space-y-4 text-left">
                                  <div>
                                    <p className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Gönderim Tarihi ve Saati</p>
                                    <p className="text-xs font-bold text-slate-800 dark:text-white mt-1">
                                      {hw.submittedAt || '24.05.2026 15:30'}
                                    </p>
                                  </div>
                                  <div>
                                    <p className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Yüklenen Dosya</p>
                                    <p className="text-xs font-bold text-blue-600 dark:text-blue-400 mt-1 flex items-center gap-1.5 cursor-pointer hover:underline" onClick={() => toast.success('Dosya indirme simüle ediliyor...')}>
                                      <span className="material-symbols-outlined text-sm">download</span>
                                      {hw.submittedFileName || 'Ahmet_Yilmaz_Proje_Raporu.pdf'}
                                    </p>
                                  </div>
                                </div>
                                <div className="text-left">
                                  <p className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Öğrenci Gönderim Notu</p>
                                  <p className="text-xs text-slate-600 dark:text-slate-350 leading-relaxed font-semibold mt-1 bg-white dark:bg-slate-800/80 p-3 border border-slate-100 dark:border-slate-700/60 rounded-xl">
                                    {hw.studentNote || 'Ödev raporu ve ilgili dokümanlar sisteme başarıyla yüklenmiştir.'}
                                  </p>
                                </div>
                              </div>
                            ) : (
                              <>
                                {/* Dosya yükleme için gizli input */}
                                <input
                                  type="file"
                                  accept=".pdf,.docx,.zip"
                                  id={`file-input-${hw.id}`}
                                  onChange={(e) => handleFileChange(e, hw.id)}
                                  className="hidden"
                                />

                                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                  
                                  {/* Dosya yükleme alanı */}
                                  <div className="flex flex-col gap-2 text-left">
                                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                                      Ödev Dosyası
                                    </label>
                                    <div
                                      onClick={() => document.getElementById(`file-input-${hw.id}`).click()}
                                      className="border-2 border-dashed border-slate-200 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-800/80 p-6 flex flex-col items-center justify-center text-center hover:border-blue-500 hover:bg-blue-50/20 dark:hover:bg-blue-950/10 transition-all cursor-pointer group"
                                    >
                                      <div className="w-12 h-12 rounded-full bg-slate-100 dark:bg-slate-700 text-slate-400 dark:text-slate-500 flex items-center justify-center mb-3 group-hover:text-blue-600 transition-colors">
                                        <span className="material-symbols-outlined text-2xl">upload_file</span>
                                      </div>
                                      <p className="text-xs font-bold text-slate-800 dark:text-white">
                                        {uploadedFiles[hw.id] ? (
                                          <span className="text-blue-600 dark:text-blue-400">{uploadedFiles[hw.id]}</span>
                                        ) : (
                                          'Dosyayı bilgisayardan seçmek için tıklayın'
                                        )}
                                      </p>
                                      <p className="text-[9px] text-slate-400 dark:text-slate-500 mt-1 font-semibold">
                                        Sadece .pdf, .docx, .zip formatları - Maks 50MB
                                      </p>
                                    </div>
                                  </div>

                                  {/* Not & Gönderim Butonları (Onaylama Aşaması Dahil) */}
                                  <div className="flex flex-col gap-2 justify-between">
                                    {confirmingRowId === hw.id ? (
                                      /* Emin Misiniz? Onay Kutusu */
                                      <div className="flex flex-col justify-center items-center text-center p-5 bg-amber-500/5 border border-amber-500/20 rounded-xl gap-3.5 flex-1 min-h-[160px]">
                                        <span className="material-symbols-outlined text-amber-500 text-3xl animate-bounce">help</span>
                                        <div>
                                          <p className="text-xs font-bold text-slate-800 dark:text-white">
                                            Ödevi teslim etmek istediğinize emin misiniz?
                                          </p>
                                          <p className="text-[10px] text-slate-400 dark:text-slate-500 mt-0.5 font-semibold">
                                            Gönderilen dosya: {uploadedFiles[hw.id]}
                                          </p>
                                        </div>
                                        <div className="flex gap-2">
                                          <button
                                            type="button"
                                            onClick={() => setConfirmingRowId(null)}
                                            className="px-3.5 py-1.5 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 font-bold text-[10px] rounded-lg cursor-pointer"
                                          >
                                            Hayır / Vazgeç
                                          </button>
                                          <button
                                            type="button"
                                            onClick={() => handleSubmissionComplete(hw.id, hw.courseName)}
                                            className="px-5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-[10px] rounded-lg shadow cursor-pointer border-none"
                                          >
                                            Evet, Teslim Et
                                          </button>
                                        </div>
                                      </div>
                                    ) : (
                                      /* Normal Form ve Gönderim Butonları */
                                      <>
                                        <div className="flex flex-col gap-1.5 text-left">
                                          <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                                            Öğrenci Notu (İsteğe Bağlı)
                                          </label>
                                          <textarea
                                            placeholder="Öğretmeninize iletmek istediğiniz notu buraya yazabilirsiniz..."
                                            value={studentNotes[hw.id] || ''}
                                            onChange={(e) => setStudentNotes(prev => ({ ...prev, [hw.id]: e.target.value }))}
                                            className="w-full bg-white dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl p-3 text-xs focus:ring-1 focus:ring-blue-500 focus:outline-none resize-none min-h-[100px]"
                                          ></textarea>
                                        </div>

                                        <div className="flex justify-end gap-2 mt-4">
                                          <button
                                            onClick={() => toggleRow(hw.id)}
                                            className="px-4 py-2 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 font-bold text-xs rounded-xl transition-colors cursor-pointer"
                                          >
                                            Vazgeç
                                          </button>
                                          <button
                                            onClick={() => {
                                              if (!uploadedFiles[hw.id]) {
                                                toast.error('Lütfen önce ödev dosyanızı seçin.')
                                                return
                                              }
                                              setConfirmingRowId(hw.id)
                                            }}
                                            className="px-6 py-2.5 bg-blue-900 hover:bg-blue-800 text-white font-bold text-xs rounded-xl shadow-md active:scale-95 transition-all cursor-pointer"
                                          >
                                            Teslim Et
                                          </button>
                                        </div>
                                      </>
                                    )}
                                  </div>

                                </div>
                              </>
                            )}
                          </div>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                )
              })}
            </tbody>
          </table>
        </div>

        {/* Tablo Alt Sayfalama */}
        <div className="px-6 py-4 bg-slate-50/50 dark:bg-slate-800/40 border-t border-slate-100 dark:border-slate-800 flex justify-between items-center text-slate-500 dark:text-slate-400 text-[10px] font-bold uppercase">
          <p>Toplam {filteredList.length} kayıt arasından 1-{filteredList.length} arası gösteriliyor</p>
          <div className="flex gap-1.5">
            <button className="w-7 h-7 rounded border border-slate-200 dark:border-slate-700 flex items-center justify-center hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
              <span className="material-symbols-outlined text-sm">chevron_left</span>
            </button>
            <button className="w-7 h-7 rounded bg-blue-900 text-white flex items-center justify-center text-xs">1</button>
            <button className="w-7 h-7 rounded border border-slate-200 dark:border-slate-700 flex items-center justify-center hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
              <span className="material-symbols-outlined text-sm">chevron_right</span>
            </button>
          </div>
        </div>

      </div>

      {/* Alt Bilgilendirme ve Yan Alanlar Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-2">
        
        {/* Önemli Hatırlatma Kutusu (Sol - Geniş) */}
        <div className="md:col-span-2 bg-blue-955 dark:bg-slate-900 border border-slate-900 dark:border-slate-800 p-8 rounded-2xl relative overflow-hidden bg-blue-950 text-white shadow-lg">
          <div className="relative z-10 space-y-4">
            <h4 className="text-lg font-black tracking-tight text-white">Ödev Teslim Kuralları</h4>
            <ul className="text-xs text-blue-100/90 leading-relaxed space-y-2 list-disc list-inside font-semibold">
              <li>Dosya Formatı: Sadece .pdf, .docx veya .zip uzantılı dosyalar kabul edilmektedir.</li>
              <li>Dosya Boyutu: Yüklenecek tek bir dosyanın boyutu en fazla 50 MB olmalıdır.</li>
              <li>Dosya İsimlendirme: Dosya adı "Ad_Soyad_Odev" formatında olmalıdır.</li>
              <li>Son Teslim Tarihi: Süresi geçen ödevlerin sisteme yüklenmesi engellenmektedir.</li>
            </ul>
          </div>
          {/* Dekoratif Gradient Çember */}
          <div className="absolute -right-10 -bottom-10 w-48 h-48 bg-blue-800/30 rounded-full blur-3xl"></div>
        </div>

        {/* Akademik Takvim Yönlendirme (Sağ - Dar) */}
        <div className="bg-slate-50 dark:bg-slate-800/40 p-8 rounded-2xl border border-slate-200/50 dark:border-slate-800 flex flex-col items-center justify-center text-center shadow-sm">
          <div className="w-14 h-14 rounded-full bg-white dark:bg-slate-800 flex items-center justify-center text-blue-600 dark:text-blue-400 mb-4 shadow-md border border-slate-100 dark:border-slate-700">
            <span className="material-symbols-outlined text-2xl font-bold">calendar_today</span>
          </div>
          <h4 className="text-sm font-extrabold text-blue-900 dark:text-blue-400 mb-1">Akademik Takvim</h4>
          <p className="text-[10px] text-slate-400 dark:text-slate-500 mb-6 font-semibold max-w-[200px]">
            Final haftası ve teslimat periyotlarını takip edin.
          </p>
          <button
            onClick={() => navigate('/student/academic-calendar')}
            className="w-full py-2.5 bg-blue-900/10 text-blue-900 dark:text-blue-400 border border-blue-900/20 hover:bg-blue-900/20 dark:hover:bg-blue-950/40 rounded-xl font-bold text-xs transition-all cursor-pointer"
          >
            Takvimi İncele
          </button>
        </div>

      </div>

    </section>
  )
}
