import { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import {
  fetchDocumentRequests,
  fetchCertificates,
  createDocumentRequest
} from '../../store/student/studentSlice'
import { toast } from 'react-hot-toast'

export default function Documents() {
  const dispatch = useDispatch()
  const { user } = useSelector((state) => state.auth)
  const { documentRequests, certificates, status, searchQuery } = useSelector((state) => state.student)
  
  const [docSearchQuery, setDocSearchQuery] = useState('')
  const [showOtherForm, setShowOtherForm] = useState(false)
  const [otherDocType, setOtherDocType] = useState('Staj Belgesi')

  useEffect(() => {
    if (user?.id) {
      dispatch(fetchDocumentRequests(user.id))
      dispatch(fetchCertificates(user.id))
    }
  }, [dispatch, user])

  // PDF İndirme Fonksiyonu (Gerçek indirme simülasyonu)
  const handleDownloadPdf = (title) => {
    const content = `%PDF-1.4\n1 0 obj\n<< /Type /Catalog /Pages 2 0 R >>\nendobj\n2 0 obj\n<< /Type /Pages /Kids [3 0 R] /Count 1 >>\nendobj\n3 0 obj\n<< /Type /Page /Parent 2 0 R /MediaBox [0 0 595 842] /Resources << >> /Contents 4 0 R >>\nendobj\n4 0 obj\n<< /Length 50 >>\nstream\nBT /F1 24 Tf 100 700 Td (${title}) Tj ET\nendstream\nendobj\nxref\n0 5\n0000000000 65535 f\n0000000009 00000 n\n0000000056 00000 n\n0000000111 00000 n\n0000000212 00000 n\ntrailer\n<< /Size 5 >>\nstartxref\n311\n%%EOF`;
    
    const blob = new Blob([content], { type: 'application/pdf' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${title.replace(/\s+/g, '_')}_Belgesi.pdf`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
    
    toast.success(`${title} belgesi başarıyla indirildi!`)
  }

  // Talep Gönderimi Fonksiyonu (Durum anında 'Hazır' olur)
  const handleRequestSubmit = async (type) => {
    const today = new Date()
    const formattedDate = `${String(today.getDate()).padStart(2, '0')}.${String(today.getMonth() + 1).padStart(2, '0')}.${today.getFullYear()}`
    
    let description = ''
    if (type === 'Öğrenci Belgesi') {
      description = 'Türkçe, Dijital'
    } else if (type === 'Transkript') {
      description = 'E-İmzalı, Türkçe'
    } else {
      description = 'Resmi Onaylı, Türkçe'
    }

    const resultAction = await dispatch(createDocumentRequest({
      studentId: user.id,
      title: type,
      description: description,
      requestDate: formattedDate
    }))

    if (createDocumentRequest.fulfilled.match(resultAction)) {
      toast.success(`${type} talebiniz oluşturuldu ve anında indirilebilir duruma getirildi!`)
      setShowOtherForm(false)
    } else {
      toast.error(resultAction.payload || 'Talep oluşturulamadı')
    }
  }

  // Arama filtreleme mantığı (Geçmiş Talepler için)
  const filteredRequests = documentRequests.filter((req) => {
    const queryDoc = docSearchQuery.trim().toLowerCase()
    const queryGeneral = searchQuery ? searchQuery.trim().toLowerCase() : ''
    
    const matchesDoc = queryDoc === '' || 
      req.title.toLowerCase().includes(queryDoc) || 
      (req.description && req.description.toLowerCase().includes(queryDoc))
      
    const matchesGeneral = queryGeneral === '' || 
      req.title.toLowerCase().includes(queryGeneral) || 
      (req.description && req.description.toLowerCase().includes(queryGeneral))
      
    return matchesDoc && matchesGeneral
  })

  // En fazla 5 belgenin listelenmesi sınırı
  const displayedRequests = filteredRequests.slice(0, 5)

  // Sertifika arama filtreleme mantığı
  const filteredCertificates = certificates.filter((cert) => {
    const queryDoc = docSearchQuery.trim().toLowerCase()
    const queryGeneral = searchQuery ? searchQuery.trim().toLowerCase() : ''
    
    const matchesDoc = queryDoc === '' || 
      cert.name.toLowerCase().includes(queryDoc) || 
      cert.issuer.toLowerCase().includes(queryDoc)
      
    const matchesGeneral = queryGeneral === '' || 
      cert.name.toLowerCase().includes(queryGeneral) || 
      cert.issuer.toLowerCase().includes(queryGeneral)
      
    return matchesDoc && matchesGeneral
  })

  return (
    <section className="p-4 md:p-8 max-w-7xl mx-auto space-y-6 text-slate-800 dark:text-white">
      
      {/* Üst Bilgi Başlığı */}
      <div className="relative overflow-hidden rounded-2xl bg-blue-900 px-8 py-10 text-white shadow-xl flex items-center justify-between">
        <div className="absolute right-0 top-0 w-1/3 h-full opacity-10 pointer-events-none">
          <span className="material-symbols-outlined text-[200px] translate-x-12 -translate-y-6">history_edu</span>
        </div>
        <div className="relative z-10 space-y-2">
          <h3 className="text-2xl md:text-3xl font-extrabold tracking-tight">Resmi Belge İşlemleri</h3>
          <p className="text-sm md:text-base text-blue-100 max-w-2xl font-medium">
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
                  className="px-2 py-1.5 bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300 rounded-xl text-xs font-bold cursor-pointer"
                >
                  İptal
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Tablo İçeriği (Durum kolonu kaldırılmıştır) */}
        <div className="overflow-x-auto">
          {status.documentRequests === 'loading' ? (
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
                  <th className="px-6 py-3.5">Doğrulama</th>
                  <th className="px-6 py-3.5 text-right">İşlem</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/40 text-xs">
                {displayedRequests.map((req) => {
                  return (
                    <tr key={req.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/20 transition-colors group">
                      <td className="px-6 py-4 font-bold text-slate-500 dark:text-slate-400">
                        #BEL-2026-{String(req.id).padStart(3, '0')}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex flex-col">
                          <span className="font-bold text-slate-800 dark:text-white">{req.title}</span>
                          <span className="text-[10px] text-slate-400 dark:text-slate-500 mt-0.5">{req.description || 'Türkçe'}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-slate-500 dark:text-slate-400 font-semibold">{req.requestDate}</td>
                      <td className="px-6 py-4">
                        <span className="material-symbols-outlined text-slate-500 dark:text-slate-400 cursor-help text-lg" title="Karekod Doğrulama Barkodu Mevcut">
                          qr_code_2
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <button
                          onClick={() => handleDownloadPdf(req.title)}
                          className="inline-flex items-center gap-1.5 text-blue-600 dark:text-blue-400 hover:text-blue-700 hover:underline font-bold cursor-pointer"
                        >
                          <span className="material-symbols-outlined text-base">picture_as_pdf</span>
                          PDF İndir
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

      {/* Bilgi Kartları ve Sertifikalar 3'lü Bento Alanı */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 pt-2">
        
        {/* Kart 1: Dijital Belge Doğrulama */}
        <div className="flex gap-4 p-5 rounded-2xl border border-blue-200 dark:border-blue-900/40 bg-blue-50/30 dark:bg-blue-950/10">
          <span className="material-symbols-outlined text-blue-600 dark:text-blue-400 text-3xl shrink-0">info</span>
          <div className="space-y-1.5">
            <h5 className="text-sm font-extrabold text-blue-900 dark:text-blue-400">Dijital Belge Doğrulama</h5>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed font-semibold">
              Sistemimiz üzerinden oluşturulan belgeler karekod (QR) ve doğrulama kodu içerir. Üçüncü kurumlar <strong>SoftIto Doğrulama Portalı</strong> üzerinden belgenin geçerliliğini teyit edebilirler.
            </p>
          </div>
        </div>

        {/* Kart 2: Yardım mı gerekiyor? */}
        <div className="flex gap-4 p-5 rounded-2xl border border-slate-200/60 dark:border-slate-800 bg-slate-50/40 dark:bg-slate-800/40">
          <span className="material-symbols-outlined text-slate-400 text-3xl shrink-0">contact_support</span>
          <div className="space-y-1.5">
            <h5 className="text-sm font-extrabold text-slate-800 dark:text-white">Yardım mı gerekiyor?</h5>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed font-semibold mb-2">
              Talep ettiğiniz belge listede yoksa veya bir sorun yaşıyorsanız öğrenci işleri ile iletişime geçebilirsiniz.
            </p>
            <a className="inline-block text-blue-600 dark:text-blue-400 font-extrabold text-[11px] hover:underline" href="#">
              Öğrenci İşleri Destek Masası →
            </a>
          </div>
        </div>

        {/* Kart 3: Sertifikalarım Listesi (Veri kaybı olmadan) */}
        <div className="flex flex-col p-5 rounded-2xl border border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-800/60 shadow-sm">
          <div className="flex items-center gap-2 border-b border-slate-100 dark:border-slate-800/60 pb-2.5 mb-3 shrink-0">
            <span className="material-symbols-outlined text-blue-600 dark:text-blue-400 text-xl font-bold">workspace_premium</span>
            <h5 className="text-sm font-extrabold text-slate-800 dark:text-white">Sertifikalarım</h5>
          </div>

          <div className="space-y-2 overflow-y-auto max-h-40 pr-1 flex-1">
            {status.certificates === 'loading' ? (
              <p className="text-[10px] text-slate-400">Yükleniyor...</p>
            ) : filteredCertificates.length === 0 ? (
              <p className="text-[10px] text-slate-400 dark:text-slate-500 italic">Gösterilecek sertifika bulunamadı.</p>
            ) : (
              filteredCertificates.map((cert) => (
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
