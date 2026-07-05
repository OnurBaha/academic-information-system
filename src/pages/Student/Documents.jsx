import { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import {
  fetchStudentDocumentsAsync,
  requestOfficialDocumentAsync
} from '../../store/student/studentSlice'
import { toast } from 'react-hot-toast'
import { jsPDF } from 'jspdf'
import { defaultCertificates } from '../../store/student/studentData'

export default function Documents() {
  const dispatch = useDispatch()
  const { currentUser } = useSelector((state) => state.auth || {})
  const { documents, status } = useSelector((state) => state.student || {})
  
  const [docSearchQuery, setDocSearchQuery] = useState('')
  const [showOtherForm, setShowOtherForm] = useState(false)
  const [otherDocType, setOtherDocType] = useState('Staj Belgesi')

  useEffect(() => {
    if (currentUser?.id) {
      dispatch(fetchStudentDocumentsAsync(currentUser.id))
    }
  }, [dispatch, currentUser])

  // FAZ 2.2 — Belge durumu badge yardımcısı (Dekan onayını göster)
  const getStatusBadge = (status) => {
    switch (status) {
      case 'ready':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 dark:bg-emerald-950/30 dark:text-emerald-400 dark:border-emerald-900/40">
            <span className="material-symbols-outlined text-[10px]">check_circle</span>
            Hazır
          </span>
        )
      case 'rejected':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-red-50 text-red-700 border border-red-200 dark:bg-red-950/30 dark:text-red-400 dark:border-red-900/40">
            <span className="material-symbols-outlined text-[10px]">cancel</span>
            Reddedildi
          </span>
        )
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 text-amber-700 border border-amber-200 dark:bg-amber-950/30 dark:text-amber-400 dark:border-amber-900/40">
            <span className="material-symbols-outlined text-[10px]">hourglass_empty</span>
            Bekliyor
          </span>
        )
    }
  }

  // PDF İndirme Fonksiyonu (Gerçek indirme simülasyonu)
  const handleDownloadPdf = (title) => {
    try {
      const doc = new jsPDF()
      
      // Çerçeve (Resmi Görünüm)
      doc.setDrawColor(30, 58, 138)
      doc.setLineWidth(1)
      doc.rect(10, 10, 190, 277)
      
      doc.setFont('Helvetica', 'bold')
      doc.setFontSize(16)
      doc.setTextColor(30, 41, 59)
      doc.text('T.C. ISTANBUL SOFTITO UNIVERSITESI', 105, 30, { align: 'center' })
      doc.setFontSize(11)
      doc.text('OGRENCI ISLERI DAIRE BASKANLIGI', 105, 38, { align: 'center' })
      
      doc.setDrawColor(226, 232, 240)
      doc.line(20, 45, 190, 45)
      
      doc.setFont('Helvetica', 'bold')
      doc.setFontSize(13)
      doc.text(title.toUpperCase(), 105, 60, { align: 'center' })
      
      doc.setFont('Helvetica', 'normal')
      doc.setFontSize(10)
      doc.setTextColor(51, 65, 85)
      
      // Belge içeriği
      let contentText = ''
      if (title.includes('Ogrenci') || title.includes('Öğrenci')) {
        contentText = `Yukarida kimlik bilgileri yer alan ${currentUser?.name || 'Ogrenci'} isimli ogrencinin, Universitemiz Bilgisayar Muhendisligi programinda kayitli ve aktif ogrencimiz oldugunu gosterir resmi ogrenci belgesidir.\n\nBu belge ogrencinin talebi uzerine ilgili makama sunulmak uzere duzenlenmistir.`
      } else if (title.includes('Transkript') || title.includes('Not')) {
        contentText = `Yukarida kimlik bilgileri yer alan ${currentUser?.name || 'Ogrenci'} isimli ogrencinin, Universitemiz bunyesinde aldigi tum dersleri ve not dokumunu iceren resmi transkript belgesidir. Ogrencinin Genel Akademik Not Ortalamasi (GANO) 3.42'dir.\n\nBu belge ogrencinin talebi uzerine ilgili makama sunulmak uzere duzenlenmistir.`
      } else {
        contentText = `Yukarida kimlik bilgileri yer alan ${currentUser?.name || 'Ogrenci'} isimli ogrencimizin, universitemiz resmi kayitlarina gore hazirlanmis resmi ${title} belgesidir.\n\nBu belge ilgili makama sunulmak uzere ogrencinin talebi dogrultusunda duzenlenmistir.`
      }
      
      // Öğrenci Detayları Kutusu
      doc.rect(20, 75, 170, 45)
      doc.setFont('Helvetica', 'bold')
      doc.text('Ogrenci No:', 25, 85)
      doc.text('Ad Soyad:', 25, 95)
      doc.text('T.C. Kimlik No:', 25, 105)
      doc.text('Fakulte / Bolum:', 25, 115)
      
      doc.setFont('Helvetica', 'normal')
      doc.text(currentUser?.id || '20211024007', 70, 85)
      doc.text(currentUser?.name || 'Ogrenci', 70, 95)
      doc.text('102*********', 70, 105)
      doc.text('Muhendislik Fakultesi / Bilgisayar Muhendisligi', 70, 115)
      
      // İçerik Metni
      const splitText = doc.splitTextToSize(contentText, 170)
      doc.text(splitText, 20, 140)
      
      // Belge Doğrulama Kodu
      doc.setFont('Helvetica', 'bold')
      doc.setFontSize(9)
      doc.text('Belge Dogrulama Kodu: ' + Math.random().toString(36).substring(2, 10).toUpperCase(), 20, 200)
      doc.setFont('Helvetica', 'normal')
      doc.setFontSize(8)
      doc.text('Bu belge elektronik imzali olup, yukaridaki dogrulama kodu ile sorgulanabilir.', 20, 205)
      
      // İmza Yetkilileri
      doc.setFont('Helvetica', 'bold')
      doc.setFontSize(10)
      doc.text('Ogrenci Isleri Daire Baskani', 130, 230)
      doc.setFont('Helvetica', 'normal')
      doc.text('Elektronik E-Imza', 130, 240)
      
      doc.save(`${title.replace(/\s+/g, '_')}_Belgesi.pdf`)
      toast.success(`${title} belgesi başarıyla indirildi!`)
    } catch (err) {
      console.error(err)
      toast.error('Belge PDF olarak oluşturulurken bir hata meydana geldi.')
    }
  }

  // Talep Gönderimi Fonksiyonu
  const handleRequestSubmit = async (type) => {
    let description = ''
    if (type === 'Öğrenci Belgesi') {
      description = 'Türkçe, Dijital'
    } else if (type === 'Transkript') {
      description = 'E-İmzalı, Türkçe'
    } else {
      description = 'Resmi Onaylı, Türkçe'
    }

    const resultAction = await dispatch(requestOfficialDocumentAsync({
      studentId: currentUser.id,
      title: type,
      description: description,
      type: 'document'
    }))

    if (requestOfficialDocumentAsync.fulfilled.match(resultAction)) {
      toast.success(`${type} talebiniz oluşturuldu ve anında indirilebilir duruma getirildi!`)
      setShowOtherForm(false)
    } else {
      toast.error(resultAction.payload || 'Talep oluşturulamadı')
    }
  }

  const documentRequests = (documents || []).filter(d => (d.type === 'document' || !d.type) && d.title !== 'Askerlik Tecil Belgesi')
  
  // defaultCertificates → src/data/studentData.js'ten import edilir
  const certificatesList = (documents || []).filter(d => d.type === 'certificate')
  const certificates = certificatesList.length > 0 ? certificatesList : defaultCertificates

  // Arama filtreleme mantığı (Geçmiş Talepler için)
  const filteredRequests = documentRequests.filter((req) => {
    const queryDoc = docSearchQuery.trim().toLowerCase()
    return queryDoc === '' || 
      req.title.toLowerCase().includes(queryDoc) || 
      (req.description && req.description.toLowerCase().includes(queryDoc))
  })

  // En fazla 5 belgenin listelenmesi sınırı
  const displayedRequests = filteredRequests.slice(0, 5)

  // Sertifika arama filtreleme mantığı
  const filteredCertificates = certificates.filter((cert) => {
    const queryDoc = docSearchQuery.trim().toLowerCase()
    return queryDoc === '' || 
      cert.name.toLowerCase().includes(queryDoc) || 
      cert.issuer.toLowerCase().includes(queryDoc)
  })

  const isLoading = status === 'loading'

  return (
    <section className="p-4 md:p-8 max-w-7xl mx-auto space-y-6 text-slate-800 dark:text-white">
      
      {/* Üst Bilgi Başlığı */}
      <div className="student-hero-banner">
        <div className="absolute right-0 top-0 w-1/3 h-full opacity-10 pointer-events-none">
          <span className="material-symbols-outlined text-[200px] translate-x-12 -translate-y-6">history_edu</span>
        </div>
        <div className="relative z-10 space-y-2">
          <h3 className="student-page-title !text-white text-2xl md:text-3xl">Resmi Belge İşlemleri</h3>
          <p className="student-page-subtitle !text-blue-100 max-w-2xl font-medium">
            Öğrenciliğinize dair ihtiyaç duyduğunuz tüm resmi belgelere buradan ulaşabilir, dijital veya e-imzalı taleplerinizi anında oluşturup indirebilirsiniz.
          </p>
        </div>
      </div>

      {/* Belge Talep Bento Kartları Grubu */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Kart 1: Öğrenci Belgesi */}
        <div className="bento-card bg-white dark:bg-slate-800 p-6 rounded-2xl border border-slate-100 dark:border-slate-800/60 flex flex-col justify-between group shadow-sm">
          <div>
            <div className="w-12 h-12 bg-blue-100 dark:bg-blue-950/50 text-blue-600 dark:text-blue-400 rounded-xl flex items-center justify-center mb-5 transition-transform group-hover:scale-110">
              <span className="material-symbols-outlined text-2xl font-bold">school</span>
            </div>
            <h4 className="text-base font-extrabold text-slate-800 dark:text-white mb-2">Öğrenci Belgesi</h4>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed mb-4">
              Aktif öğrencilik durumunuzu gösteren standart onaylı belge.
            </p>
          </div>
          <div className="flex items-center justify-between mt-2 pt-2 border-t border-slate-50 dark:border-slate-800/40">
            <span className="text-emerald-500 font-bold text-[10px] flex items-center gap-1">
              <span className="material-symbols-outlined text-sm font-bold">verified</span> Dijital Anında
            </span>
            <button
              onClick={() => handleRequestSubmit('Öğrenci Belgesi')}
              className="bg-blue-900 hover:bg-blue-800 text-white px-4 py-2 rounded-lg font-bold text-xs active:scale-95 transition-all cursor-pointer"
            >
              Talep Et
            </button>
          </div>
        </div>

        {/* Kart 2: Transkript */}
        <div className="bento-card bg-white dark:bg-slate-800 p-6 rounded-2xl border border-slate-100 dark:border-slate-800/60 flex flex-col justify-between group shadow-sm">
          <div>
            <div className="w-12 h-12 bg-amber-100 dark:bg-amber-950/50 text-amber-600 dark:text-amber-400 rounded-xl flex items-center justify-center mb-5 transition-transform group-hover:scale-110">
              <span className="material-symbols-outlined text-2xl font-bold">analytics</span>
            </div>
            <h4 className="text-base font-extrabold text-slate-800 dark:text-white mb-2">Transkript (E-İmzalı)</h4>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed mb-4">
              Not döküm belgesi. Tüm dönemlerinize ait başarı durumunuzu içerir.
            </p>
          </div>
          <div className="flex items-center justify-between mt-2 pt-2 border-t border-slate-50 dark:border-slate-800/40">
            <span className="text-emerald-500 font-bold text-[10px] flex items-center gap-1">
              <span className="material-symbols-outlined text-sm font-bold">verified</span> Dijital Anında
            </span>
            <button
              onClick={() => handleRequestSubmit('Transkript')}
              className="bg-blue-900 hover:bg-blue-800 text-white px-4 py-2 rounded-lg font-bold text-xs active:scale-95 transition-all cursor-pointer"
            >
              Talep Et
            </button>
          </div>
        </div>

        {/* Kart 3: Mezuniyet Belgesi */}
        <div className="bento-card bg-white dark:bg-slate-800 p-6 rounded-2xl border border-slate-100 dark:border-slate-800/60 flex flex-col justify-between group shadow-sm">
          <div>
            <div className="w-12 h-12 bg-slate-100 dark:bg-slate-900/60 text-slate-400 dark:text-slate-500 rounded-xl flex items-center justify-center mb-5 transition-transform group-hover:scale-110">
              <span className="material-symbols-outlined text-2xl font-bold">workspace_premium</span>
            </div>
            <h4 className="text-base font-extrabold text-slate-800 dark:text-white mb-2">Mezuniyet Belgesi</h4>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed mb-4">
              Mezun adayları veya mezunlar için düzenlenen geçici mezuniyet belgesi.
            </p>
          </div>
          <div className="flex items-center justify-between mt-2 pt-2 border-t border-slate-50 dark:border-slate-800/40">
            <span className="text-red-500 font-bold text-[10px] flex items-center gap-1">
              <span className="material-symbols-outlined text-sm font-bold">lock</span> Şarta Bağlı
            </span>
            <button
              disabled
              className="bg-slate-100 dark:bg-slate-700 text-slate-400 dark:text-slate-500 px-4 py-2 rounded-lg font-bold text-xs cursor-not-allowed"
            >
              Talep Et
            </button>
          </div>
        </div>

      </div>

      {/* Geçmiş Taleplerim Tablo Alanı */}
      <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-800/60 shadow-sm overflow-hidden">
        
        {/* Tablo Başlık Barı */}
        <div className="px-6 py-5 border-b border-slate-100 dark:border-slate-800/60 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-slate-50/50 dark:bg-slate-800/40">
          <h3 className="text-base font-extrabold text-blue-900 dark:text-blue-400 flex items-center gap-2">
            <span className="material-symbols-outlined">history</span>
            Geçmiş Taleplerim
          </h3>
          
          <div className="flex items-center gap-2 w-full sm:w-auto">
            {/* Arama Girişi */}
            <div className="relative flex-grow sm:flex-none">
              <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-base">search</span>
              <input
                type="text"
                placeholder="Belge ara..."
                value={docSearchQuery}
                onChange={(e) => setDocSearchQuery(e.target.value)}
                className="pl-9 pr-4 py-1.5 w-full sm:w-48 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs focus:ring-1 focus:ring-blue-500 focus:outline-none"
              />
            </div>

            {/* Diğer Belge Talebi Formu / Butonu */}
            {!showOtherForm ? (
              <button
                onClick={() => setShowOtherForm(true)}
                className="px-3.5 py-1.5 bg-blue-900 hover:bg-blue-800 text-white rounded-xl text-xs font-bold flex items-center gap-1 cursor-pointer shrink-0"
              >
                <span className="material-symbols-outlined text-sm">add</span>
                <span>Diğer Talepler</span>
              </button>
            ) : (
              <div className="flex items-center gap-1.5 shrink-0">
                <select
                  value={otherDocType}
                  onChange={(e) => setOtherDocType(e.target.value)}
                  className="py-1.5 px-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs focus:outline-none"
                >
                  <option value="Staj Belgesi">Staj Belgesi</option>
                  <option value="Disiplin Durum Belgesi">Disiplin Durum Belgesi</option>
                </select>
                <button
                  onClick={() => handleRequestSubmit(otherDocType)}
                  className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold cursor-pointer"
                >
                  Gönder
                </button>
                <button
                  onClick={() => setShowOtherForm(false)}
                  className="px-2 py-1.5 bg-slate-200 dark:bg-slate-700 text-slate-650 rounded-xl text-xs font-bold cursor-pointer"
                >
                  İptal
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Tablo İçeriği */}
        <div className="overflow-x-auto">
          {isLoading ? (
            <div className="text-center py-10 text-slate-400 dark:text-slate-500">
              <span className="animate-spin material-symbols-outlined mr-2">sync</span>
              <span>Yükleniyor...</span>
            </div>
          ) : displayedRequests.length === 0 ? (
            <div className="text-center py-12 text-slate-400 dark:text-slate-500 text-xs font-semibold">
              Gösterilecek belge talebi bulunamadı.
            </div>
          ) : (
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/50 dark:bg-slate-900/50 text-slate-500 dark:text-slate-400 text-[10px] font-bold uppercase border-b border-slate-100 dark:border-slate-800">
                  <th className="px-6 py-3.5">Talep No</th>
                  <th className="px-6 py-3.5">Belge Tipi</th>
                  <th className="px-6 py-3.5">Tarih</th>
                  <th className="px-6 py-3.5">Durum</th>
                  <th className="px-6 py-3.5 text-right">İşlem</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/40 text-xs">
                {displayedRequests.map((req, idx) => {
                  return (
                    <tr key={req.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/20 transition-colors group">
                      <td className="px-6 py-4 font-bold text-slate-500 dark:text-slate-400">
                        #BEL-2026-{String(idx + 1).padStart(3, '0')}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex flex-col">
                          <span className="font-bold text-slate-800 dark:text-white">{req.title}</span>
                          <span className="text-[10px] text-slate-400 dark:text-slate-500 mt-0.5">{req.description || req.desc || 'Belge Talebi'}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-slate-500 dark:text-slate-400 font-semibold">{req.requestDate}</td>
                      <td className="px-6 py-4">
                        {getStatusBadge(req.status)}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <button
                          onClick={() => handleDownloadPdf(req.title)}
                          disabled={req.status !== 'ready'}
                          className={`inline-flex items-center gap-1.5 font-bold cursor-pointer ${
                            req.status === 'ready'
                              ? 'text-blue-600 dark:text-blue-400 hover:text-blue-700 hover:underline'
                              : 'text-slate-300 dark:text-slate-600 cursor-not-allowed'
                          }`}
                        >
                          <span className="material-symbols-outlined text-base">picture_as_pdf</span>
                          {req.status === 'ready' ? 'PDF İndir' : 'Hazır Değil'}
                        </button>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          )}
        </div>

        {/* Tablo Alt Sayfalama */}
        <div className="px-6 py-4 bg-slate-50/50 dark:bg-slate-900/40 border-t border-slate-100 dark:border-slate-800/60 flex justify-between items-center text-slate-500 dark:text-slate-400 text-[10px] font-bold uppercase">
          <p>Toplam {filteredRequests.length} belgeden {displayedRequests.length} tanesi listeleniyor</p>
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

      {/* Bilgi Kartları ve Sertifikalar 2'li Bento Alanı */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 pt-2">
        
        {/* Kart 1: Yardım mı gerekiyor? */}
        <div className="flex flex-col p-5 rounded-2xl border border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-800/60 shadow-sm">
          <div className="flex items-center gap-2 border-b border-slate-100 dark:border-slate-800/60 pb-2.5 mb-3 shrink-0">
            <span className="material-symbols-outlined text-blue-600 dark:text-blue-400 text-xl font-bold">contact_support</span>
            <h5 className="text-sm font-extrabold text-slate-800 dark:text-white">Yardım mı gerekiyor?</h5>
          </div>
          <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed font-semibold mb-3">
            Talep ettiğiniz belge listede yoksa veya bir sorun yaşıyorsanız öğrenci işleri ile iletişime geçebilirsiniz.
          </p>
          <div className="text-[11px] text-slate-700 dark:text-slate-300 font-bold bg-slate-50 dark:bg-slate-900/60 p-2.5 rounded-xl border border-slate-100 dark:border-slate-800/50 flex flex-col gap-1 mt-auto">
            <div className="flex items-center gap-1.5">
              <span className="material-symbols-outlined text-xs text-blue-600 dark:text-blue-400">call</span>
              <span>+90 (212) 444 5060</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="material-symbols-outlined text-xs text-blue-600 dark:text-blue-400">mail</span>
              <span>oidb@softito.edu.tr</span>
            </div>
          </div>
        </div>

        {/* Kart 3: Sertifikalarım Listesi */}
        <div className="flex flex-col p-5 rounded-2xl border border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-800/60 shadow-sm">
          <div className="flex items-center gap-2 border-b border-slate-100 dark:border-slate-800/60 pb-2.5 mb-3 shrink-0">
            <span className="material-symbols-outlined text-blue-600 dark:text-blue-400 text-xl font-bold">workspace_premium</span>
            <h5 className="text-sm font-extrabold text-slate-800 dark:text-white">Sertifikalarım</h5>
          </div>

          <div className="space-y-2 overflow-y-auto max-h-40 pr-1 flex-1">
            {isLoading ? (
              <p className="text-[10px] text-slate-400">Yükleniyor...</p>
            ) : certificates.length === 0 ? (
              <p className="text-[10px] text-slate-400 dark:text-slate-500 italic">Gösterilecek sertifika bulunamadı.</p>
            ) : (
              certificates.map((cert) => (
                <div key={cert.id} className="flex items-center justify-between p-2 bg-slate-50 dark:bg-slate-900/60 rounded-xl border border-slate-100 dark:border-slate-800/50">
                  <div className="min-w-0 mr-2">
                    <p className="text-[11px] font-bold text-slate-800 dark:text-white truncate">{cert.name}</p>
                    <p className="text-[9px] text-slate-400">{cert.issuer} · {cert.date}</p>
                  </div>
                  <button
                    onClick={() => toast.success(`${cert.name} sertifikası indiriliyor...`)}
                    className="w-7 h-7 bg-blue-50 hover:bg-blue-100 dark:bg-slate-800 dark:hover:bg-slate-700 rounded-lg text-blue-600 dark:text-blue-400 flex items-center justify-center cursor-pointer shrink-0"
                  >
                    <span className="material-symbols-outlined text-base">download</span>
                  </button>
                </div>
              ))
            )}
          </div>
        </div>

      </div>

    </section>
  )
}
