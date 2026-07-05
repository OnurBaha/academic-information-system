import { useState, useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { fetchStudentDocumentsAsync } from '../../store/student/studentSlice'
import { toast } from 'react-hot-toast'
import { jsPDF } from 'jspdf'
import autoTable from 'jspdf-autotable'
import { academicBadges, fallbackCertificates } from '../../store/student/studentData'

// academicBadges ve fallbackCertificates → src/data/studentData.js'ten import edilir

export default function Profile() {
  const dispatch = useDispatch()
  const { currentUser } = useSelector((state) => state.auth || {})
  const { documents } = useSelector((state) => state.student || {})

  const certificates = (documents || []).filter(d => d.type === 'certificate')

  // İletişim Bilgileri Durumu (E-posta Kilitli)
  const [email] = useState(currentUser?.email || 'ahmet.yilmaz@softito.edu.tr')
  const [phone, setPhone] = useState(currentUser?.phone || '+90 (555) 000 00 00')
  const [city, setCity] = useState('İstanbul')

  // Adres Bilgileri Durumu (Ayrı Kutu)
  const [address, setAddress] = useState(currentUser?.address || 'Kadıköy, İstanbul')

  // Sertifika Listesi Durumu (Silme/Güncelleme için dinamik state)
  const [certificatesList, setCertificatesList] = useState([])

  // Harici Yükleme Dosya Durumu
  const [selectedCertFile, setSelectedCertFile] = useState(null)
  const [newCertName, setNewCertName] = useState('')

  // Kayıt Animasyon Durumu
  const [isSaving, setIsSaving] = useState(false)
  const [saveStatus, setSaveStatus] = useState('idle') // 'idle' | 'saving' | 'success'

  useEffect(() => {
    if (currentUser?.id) {
      dispatch(fetchStudentDocumentsAsync(currentUser.id))
    }
  }, [dispatch, currentUser])

  // Redux sertifikalarını state'e eşitle
  useEffect(() => {
    if (certificates && certificates.length > 0) {
      setCertificatesList(certificates)
    } else {
      setCertificatesList(fallbackCertificates)
    }
  }, [documents])

  // İletişim bilgilerini güncelle
  const handleUpdateInfo = (e) => {
    e.preventDefault()
    if (!phone) {
      toast.error('Lütfen telefon alanını boş bırakmayın.')
      return
    }

    setIsSaving(true)
    setSaveStatus('saving')

    setTimeout(() => {
      setIsSaving(false)
      setSaveStatus('success')
      toast.success('İletişim bilgileriniz başarıyla güncellendi!')

      // Butonu 2 saniye sonra normale döndür
      setTimeout(() => {
        setSaveStatus('idle')
      }, 2000)
    }, 1000)
  }

  // Adres bilgilerini güncelle
  const handleUpdateAddress = (e) => {
    e.preventDefault()
    if (!address.trim()) {
      toast.error('Lütfen adres alanını boş bırakmayın.')
      return
    }
    // Adres içindeki şehri otomatik yakala
    const parts = address.split(',')
    if (parts.length > 1) {
      setCity(parts[parts.length - 1].trim())
    }
    toast.success('Adres bilgileriniz başarıyla güncellendi!')
  }

  // Sertifika dosya seçimi tetikleyicisi
  const handleCertFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0]
      setSelectedCertFile(file)
      // Dosya adını uzantısız olarak varsayılan sertifika adı yap
      const baseName = file.name.substring(0, file.name.lastIndexOf('.')) || file.name
      setNewCertName(baseName)
    }
  }

  // Sertifikayı profile kaydetme
  const handleSaveUploadedCert = () => {
    if (!newCertName.trim()) {
      toast.error('Lütfen sertifika adı girin.')
      return
    }

    const newCert = {
      id: Date.now(),
      name: newCertName,
      issuer: "Harici Kaynak",
      date: new Date().toLocaleDateString('tr-TR'),
      licenseId: `EXT-${Math.floor(1000 + Math.random() * 9000)}-${Math.floor(1000 + Math.random() * 9000)}`,
      icon: "workspace_premium",
      bgColor: "bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400"
    }

    setCertificatesList([newCert, ...certificatesList])
    setSelectedCertFile(null)
    setNewCertName('')
    toast.success('Sertifikanız başarıyla kaydedildi!')
  }

  // Sertifikayı silme
  const handleRemoveCert = (certId) => {
    setCertificatesList(prev => prev.filter(c => c.id !== certId))
    toast.success('Sertifika kaldırıldı.')
  }

  const downloadCertificatesPDF = () => {
    try {
      const doc = new jsPDF()
      
      doc.setFont('Helvetica', 'bold')
      doc.setFontSize(16)
      doc.setTextColor(30, 41, 59)
      doc.text('KAZANILAN SERTIFIKALAR RAPORU', 14, 18)
      
      doc.setFont('Helvetica', 'normal')
      doc.setFontSize(10)
      doc.setTextColor(100, 116, 139)
      doc.text(`Ogrenci Ad Soyad: ${currentUser?.name || 'Ogrenci'}`, 14, 26)
      doc.text(`Ogrenci No: ${currentUser?.id || '20211024007'}`, 14, 32)
      doc.text(`Tarih: ${new Date().toLocaleDateString('tr-TR')}`, 14, 38)
      
      const bodyData = certificatesList.map(c => [
        c.name,
        c.issuer || 'SoftIto Akademi',
        c.date,
        c.licenseId
      ])

      autoTable(doc, {
        startY: 44,
        head: [['Sertifika Adi', 'Veren Kurum', 'Verilis Tarihi', 'Lisans / Belge ID']],
        body: bodyData,
        styles: {
          fontSize: 9,
          cellPadding: 4,
          lineColor: [226, 232, 240],
          lineWidth: 0.3,
          font: 'Helvetica'
        },
        headStyles: {
          fillColor: [30, 58, 138],
          textColor: 255,
          fontStyle: 'bold'
        },
        alternateRowStyles: { fillColor: [248, 250, 252] },
        columnStyles: {
          0: { cellWidth: 70 },
          1: { cellWidth: 40 },
          2: { cellWidth: 35 },
          3: { cellWidth: 40 }
        },
        margin: { left: 14, right: 14 }
      })

      doc.save(`Sertifikalar_${currentUser?.id || 'Ogrenci'}.pdf`)
      toast.success('Sertifikalar listesi başarıyla indirildi!')
    } catch (err) {
      console.error(err)
      toast.error('Sertifikalar PDF oluşturulurken bir hata oluştu!')
    }
  }

  return (
    <section className="flex-grow p-4 md:p-8 max-w-7xl mx-auto space-y-6 text-slate-800 dark:text-white">
      
      {/* Sertifika yükleme için gizli input */}
      <input
        type="file"
        accept=".pdf,.png,.jpg,.jpeg"
        id="cert-upload-input"
        onChange={handleCertFileChange}
        className="hidden"
      />

      {/* 12 Kolonlu Responsive Izgara Yapısı */}
      <div className="grid grid-cols-12 gap-6 items-start">
        
        {/* Sol Kolon (4 Kolon Genişliği): Profil Kartı, İletişim Formu, Adres Kartı */}
        <div className="col-span-12 lg:col-span-4 space-y-6">
          
          {/* Profil Kartı */}
          <div className="bg-white dark:bg-slate-800 rounded-3xl border border-slate-100 dark:border-slate-800/60 shadow-sm overflow-hidden bento-card">
            
            {/* Lacivert/Mavi Kapak Resmi Görünümü */}
            <div className="h-28 bg-gradient-to-r from-blue-900 via-indigo-950 to-slate-900 relative">
              
              {/* Profil Fotoğrafı - Kapağa taşan negatif margin */}
              <div className="absolute -bottom-10 left-6">
                <div className="w-20 h-20 rounded-2xl border-4 border-white dark:border-slate-800 shadow-md overflow-hidden bg-white">
                  <img
                    className="w-full h-full object-cover"
                    alt="Profil Fotoğrafı"
                    src="https://lh3.googleusercontent.com/aida-public/AB6AXuAPS4JeJwTrLYNaaRatmdTdxV5peWrRR7VmpjiC2WoDEngtf6tXGiNYM9AsZKJZUyt7W_ZQ9AybUiXqtAyXrRwvTe19nQ2fgymViJz6WINvghtIePXH5vtDT0ivI495jWCn5_9P6VN5W_7VxidM0tdsNBEy9hpZXG4jlQ2HbxTNeVBlJVacusztTV36-kUZTTlC5w0o1IiZN2a2z4r2edQxXIR5QLvF4dmlW0KE01RHSRCmXDaWr0-aZYo3OlHflQpLrRNwT_bDgDs-"
                  />
                </div>
              </div>
            </div>

            {/* İsim ve Bölüm Bilgisi */}
            <div className="pt-14 px-6 pb-6 space-y-4">
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <h3 className="text-base font-extrabold text-slate-800 dark:text-white">
                    {currentUser?.name || 'Ahmet Yılmaz'}
                  </h3>
                  <span className="px-2.5 py-0.5 bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 font-extrabold text-[8px] rounded-full border border-blue-100 dark:border-blue-900/30 uppercase tracking-wider">
                    Öğrenci
                  </span>
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 font-semibold">
                  Yazılım Mühendisliği Bölümü - 3. Sınıf
                </p>
              </div>

              {/* İletişim Detayları */}
              <div className="space-y-2.5 pt-4 border-t border-slate-50 dark:border-slate-800/40 text-xs font-semibold text-slate-600 dark:text-slate-300">
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-blue-600 dark:text-blue-400 text-lg shrink-0">mail</span>
                  <span className="truncate">{email}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-blue-600 dark:text-blue-400 text-lg shrink-0">call</span>
                  <span>{phone}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-blue-600 dark:text-blue-400 text-lg shrink-0">location_on</span>
                  <span className="truncate">{address}</span>
                </div>
              </div>
            </div>

          </div>

          {/* İletişim Bilgilerini Güncelleme Kartı */}
          <div className="bg-white dark:bg-slate-800 rounded-3xl border border-slate-100 dark:border-slate-800/60 shadow-sm p-6 space-y-5">
            <h4 className="text-sm font-extrabold text-blue-900 dark:text-blue-400 flex items-center gap-2 border-b border-slate-50 dark:border-slate-800/40 pb-3">
              <span className="material-symbols-outlined text-lg">contact_emergency</span>
              İletişim Bilgilerini Güncelle
            </h4>

            <form onSubmit={handleUpdateInfo} className="space-y-4 text-xs font-semibold">
              <div className="space-y-1">
                <label className="block text-slate-500 dark:text-slate-400">E-posta Adresi (Değiştirilemez)</label>
                <input
                  type="email"
                  disabled
                  value={email}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-400 dark:text-slate-500 cursor-not-allowed focus:outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="block text-slate-500 dark:text-slate-400">Telefon Numarası</label>
                <input
                  type="text"
                  required
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg focus:ring-1 focus:ring-blue-500 focus:outline-none"
                />
              </div>

              <button
                type="submit"
                disabled={isSaving}
                className={`w-full py-2.5 rounded-xl font-bold text-xs text-white shadow-md transition-all active:scale-95 flex items-center justify-center gap-1.5 cursor-pointer border-none ${
                  saveStatus === 'success'
                    ? 'bg-emerald-600'
                    : 'bg-blue-900 hover:bg-blue-800'
                }`}
              >
                {saveStatus === 'saving' ? (
                  <>
                    <svg className="animate-spin h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    <span>Güncelleniyor...</span>
                  </>
                ) : saveStatus === 'success' ? (
                  <>
                    <span className="material-symbols-outlined text-sm font-bold">check_circle</span>
                    <span>Güncellendi!</span>
                  </>
                ) : (
                  <span>Değişiklikleri Kaydet</span>
                )}
              </button>
            </form>
          </div>

          {/* Adres Bilgilerim Kartı */}
          <div className="bg-white dark:bg-slate-800 rounded-3xl border border-slate-100 dark:border-slate-800/60 shadow-sm p-6 space-y-5">
            <h4 className="text-sm font-extrabold text-blue-900 dark:text-blue-400 flex items-center gap-2 border-b border-slate-50 dark:border-slate-800/40 pb-3">
              <span className="material-symbols-outlined text-lg">home</span>
              Adres Bilgilerim
            </h4>

            <form onSubmit={handleUpdateAddress} className="space-y-4 text-xs font-semibold">
              <div className="space-y-1">
                <label className="block text-slate-500 dark:text-slate-400">İkamet / Ev Adresi</label>
                <textarea
                  required
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="Lütfen güncel adresinizi girin..."
                  rows={2}
                  className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg focus:ring-1 focus:ring-blue-500 focus:outline-none resize-none min-h-[80px]"
                ></textarea>
              </div>

              <button
                type="submit"
                className="w-full py-2.5 bg-blue-900 hover:bg-blue-800 text-white font-bold text-xs rounded-xl shadow-md transition-all active:scale-95 cursor-pointer border-none"
              >
                Adresi Güncelle
              </button>
            </form>
          </div>

        </div>

        {/* Sağ Kolon (8 Kolon Genişliği) */}
        <div className="col-span-12 lg:col-span-8 space-y-6">
          
          {/* Sertifikalar Bölümü */}
          <div className="space-y-4">
            
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
              <h3 className="text-base font-extrabold text-blue-900 dark:text-blue-400">Kazanılan Sertifikalar</h3>
              
              <button
                onClick={downloadCertificatesPDF}
                className="px-3.5 py-1.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-400 font-bold text-[10px] rounded-lg hover:bg-slate-50 dark:hover:bg-slate-900 transition-all flex items-center gap-1.5 cursor-pointer shadow-sm"
              >
                <span className="material-symbols-outlined text-sm">download</span>
                <span>PDF Olarak İndir</span>
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              
              {certificatesList.map((cert) => (
                <div
                  key={cert.id}
                  className="bg-white dark:bg-slate-800 rounded-3xl border border-slate-100 dark:border-slate-800/60 shadow-sm hover:shadow-md transition-all overflow-hidden flex flex-col justify-between p-6 bento-card group"
                >
                  <div>
                    <div className="flex justify-between items-start mb-5">
                      <div className={`w-14 h-14 rounded-xl flex items-center justify-center shrink-0 ${cert.bgColor || 'bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400'}`}>
                        <span className="material-symbols-outlined text-2xl font-bold">
                          {cert.icon || 'workspace_premium'}
                        </span>
                      </div>
                      
                      <div className="flex gap-1">
                        <button
                          onClick={() => toast.success('Paylaşım bağlantısı kopyalandı!')}
                          className="p-1.5 text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-slate-700/40 rounded-lg transition-colors material-symbols-outlined text-base cursor-pointer"
                          title="Paylaş"
                        >
                          share
                        </button>
                        <button
                          onClick={() => toast.success('Sertifika kaynağı açılıyor...')}
                          className="p-1.5 text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-slate-700/40 rounded-lg transition-colors material-symbols-outlined text-base cursor-pointer"
                          title="Görüntüle"
                        >
                          open_in_new
                        </button>
                        <button
                          onClick={() => handleRemoveCert(cert.id)}
                          className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/40 rounded-lg transition-colors material-symbols-outlined text-base cursor-pointer"
                          title="Sertifikayı Sil"
                        >
                          delete
                        </button>
                      </div>
                    </div>

                    <h4 className="text-xs font-extrabold text-slate-800 dark:text-white leading-relaxed">
                      {cert.name}
                    </h4>
                    <p className="text-[10px] text-slate-400 dark:text-slate-500 mt-1 font-semibold">
                      Veriliş Tarihi: {cert.date}
                    </p>
                  </div>

                  <div className="pt-4 mt-6 border-t border-slate-50 dark:border-slate-800/40 flex items-center justify-between">
                    <div>
                      <p className="text-[8px] text-slate-400 uppercase tracking-widest font-bold">Lisans ID</p>
                      <p className="text-[10px] text-slate-700 dark:text-slate-300 font-mono font-bold">{cert.licenseId}</p>
                    </div>

                    <div className="px-2.5 py-0.5 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 font-bold text-[9px] rounded-full border border-emerald-100 dark:border-emerald-900/30">
                      Doğrulandı
                    </div>
                  </div>
                </div>
              ))}

              {selectedCertFile ? (
                <div className="border-2 border-blue-500/30 bg-blue-50/10 rounded-3xl p-6 flex flex-col justify-between min-h-[190px]">
                  <div className="space-y-3">
                    <div className="flex items-center gap-2 text-xs text-blue-600 dark:text-blue-400 font-bold truncate">
                      <span className="material-symbols-outlined text-lg">description</span>
                      <span className="truncate">{selectedCertFile.name}</span>
                    </div>
                    
                    <div className="space-y-1">
                      <label className="text-[9px] font-bold text-slate-400 uppercase">Sertifika İsmi</label>
                      <input
                        type="text"
                        value={newCertName}
                        onChange={(e) => setNewCertName(e.target.value)}
                        className="w-full px-2.5 py-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-xs outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 font-semibold"
                      />
                    </div>
                  </div>

                  <div className="flex gap-2 justify-end pt-3">
                    <button
                      onClick={() => setSelectedCertFile(null)}
                      className="px-2.5 py-1.5 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 font-bold text-[10px] rounded-lg cursor-pointer"
                    >
                      İptal
                    </button>
                    <button
                      onClick={handleSaveUploadedCert}
                      className="px-3.5 py-1.5 bg-blue-900 hover:bg-blue-800 text-white font-bold text-[10px] rounded-lg cursor-pointer"
                    >
                      Profile Kaydet
                    </button>
                  </div>
                </div>
              ) : (
                <div
                  onClick={() => document.getElementById('cert-upload-input').click()}
                  className="group border-2 border-dashed border-slate-200 dark:border-slate-700 rounded-3xl flex flex-col items-center justify-center p-8 hover:border-blue-500/50 hover:bg-blue-50/20 dark:hover:bg-blue-950/10 transition-all cursor-pointer min-h-[190px]"
                >
                  <div className="w-12 h-12 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-400 dark:text-slate-500 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                    <span className="material-symbols-outlined text-lg">add_task</span>
                  </div>
                  <p className="text-xs font-bold text-slate-800 dark:text-white">Harici Sertifika Yükle</p>
                  <p className="text-[9px] text-slate-400 dark:text-slate-500 text-center mt-1 font-semibold max-w-[180px]">
                    Belgelerinizi (.pdf, .png, .jpg) buraya tıklayarak seçin
                  </p>
                </div>
              )}

            </div>
          </div>

          {/* Akademik Rozetler Bölümü */}
          <div className="bg-white dark:bg-slate-800 rounded-3xl border border-slate-100 dark:border-slate-800/60 shadow-sm p-6 space-y-4">
            <h4 className="text-sm font-extrabold text-blue-900 dark:text-blue-400 flex items-center gap-2 border-l-4 border-blue-600 pl-3">
              Akademik Rozetler
            </h4>

            <div className="flex flex-wrap gap-4">
              {academicBadges.map((badge, idx) => (
                <div
                  key={idx}
                  className="flex items-center gap-3 bg-slate-50 dark:bg-slate-900/60 px-4 py-3 rounded-xl border border-slate-100 dark:border-slate-800/60 w-full sm:w-auto shadow-sm"
                >
                  <div className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 border ${badge.colorClass}`}>
                    <span className="material-symbols-outlined text-lg font-bold">{badge.icon}</span>
                  </div>
                  <div>
                    <p className="text-xs font-extrabold text-slate-800 dark:text-white">
                      {badge.title}
                    </p>
                    <p className="text-[10px] text-slate-400 dark:text-slate-500 font-semibold">
                      {badge.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>

      </div>

    </section>
  )
}
