import { useState, useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { fetchCoursesAsync } from '../../store/course/courseSlice'
import { toast } from 'react-hot-toast'

export default function CourseRegistration() {
  const dispatch = useDispatch()
  const { currentUser } = useSelector((state) => state.auth || {})
  const { courses = [], status: coursesStatus } = useSelector((state) => state.course || {})

  // State tanımlamaları
  const [selectedCourses, setSelectedCourses] = useState([])
  const [searchQuery, setSearchQuery] = useState('')
  const [categoryFilter, setCategoryFilter] = useState('All')
  const [status, setStatus] = useState('Taslak') // 'Taslak' | 'Onay Bekliyor' | 'Onaylandı'
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showSuccessModal, setShowSuccessModal] = useState(false)

  // Harç ödeme durumları
  const [isTuitionPaid, setIsTuitionPaid] = useState(currentUser?.tuitionPaid || false)
  const [paymentStep, setPaymentStep] = useState('overview') // 'overview' | 'installments' | 'card' | 'sms' | 'success'
  const [selectedInstallment, setSelectedInstallment] = useState(1) // 1, 3, 6, 12
  const [cardName, setCardName] = useState('')
  const [cardNumber, setCardNumber] = useState('')
  const [cardExpiryMonth, setCardExpiryMonth] = useState('')
  const [cardExpiryYear, setCardExpiryYear] = useState('')
  const [cardCvv, setCardCvv] = useState('')
  const [smsCode, setSmsCode] = useState('')
  const [smsError, setSmsError] = useState('')
  const [timerSeconds, setTimerSeconds] = useState(120)
  const [isCvvFocused, setIsCvvFocused] = useState(false)

  // Başlangıçta ders listesini çekme
  useEffect(() => {
    dispatch(fetchCoursesAsync())
  }, [dispatch])

  // Başlangıçta localStorage'dan yükleme
  useEffect(() => {
    if (currentUser?.id) {
      const savedState = localStorage.getItem(`course_reg_${currentUser.id}`)
      if (savedState) {
        try {
          const parsed = JSON.parse(savedState)
          setSelectedCourses(parsed.selectedCourses || [])
          setStatus(parsed.status || 'Taslak')
        } catch (e) {
          console.error('Error parsing saved course registration state', e)
        }
      }

      // Harç ödeme durumu kontrolü
      const savedTuition = localStorage.getItem(`tuition_paid_2026_2027_${currentUser.id}`)
      if (savedTuition === 'true' || currentUser?.tuitionPaid) {
        setIsTuitionPaid(true)
      }
    }
  }, [currentUser])

  // SMS kodu için zamanlayıcı efekti
  useEffect(() => {
    let interval = null
    if (paymentStep === 'sms') {
      setTimerSeconds(120)
      interval = setInterval(() => {
        setTimerSeconds((prev) => {
          if (prev <= 1) {
            clearInterval(interval)
            return 0
          }
          return prev - 1
        })
      }, 1000)
    } else {
      clearInterval(interval)
    }
    return () => clearInterval(interval)
  }, [paymentStep])

  // Kaydetme yardımcısı
  const saveState = (newSelected, newStatus) => {
    if (currentUser?.id) {
      localStorage.setItem(
        `course_reg_${currentUser.id}`,
        JSON.stringify({ selectedCourses: newSelected, status: newStatus })
      )
    }
  }

  // AKTS hesaplamaları
  const totalAkts = selectedCourses.reduce((sum, item) => sum + (item.akts || 0), 0)
  const isLimitExceeded = totalAkts > 30

  // Seçmeli ders sayısını sayma
  const selectedElectivesCount = selectedCourses.filter((c) => c.type === 'Seçmeli').length

  // Ders işlem fonksiyonları
  const handleAddCourse = (course) => {
    if (!isTuitionPaid) {
      toast.error('Öncelikle okul ücretini ödemeniz gerekmektedir.')
      return
    }

    if (status !== 'Taslak') {
      toast.error('Ders seçiminiz onayda veya onaylanmış olduğu için değişiklik yapamazsınız.')
      return
    }

    if (selectedCourses.some((c) => c.id === course.id)) {
      toast.error('Bu ders zaten seçilenler listesinde.')
      return
    }

    // Ders eklemeden önce limit kontrolü
    if (totalAkts + course.akts > 30) {
      toast.error('En fazla 30 AKTS seçebilirsiniz!')
      return
    }

    const updated = [...selectedCourses, course]
    setSelectedCourses(updated)
    saveState(updated, status)
    toast.success(`${course.id} ders sepetine eklendi.`)
  }

  const handleRemoveCourse = (courseId) => {
    if (status !== 'Taslak') {
      toast.error('Ders seçiminiz onayda veya onaylanmış olduğu için değişiklik yapamazsınız.')
      return
    }

    const updated = selectedCourses.filter((c) => c.id !== courseId)
    setSelectedCourses(updated)
    saveState(updated, status)
    toast.success('Ders sepetten çıkarıldı.')
  }

  // İşlem: Taslak kaydetme
  const handleSaveDraft = () => {
    if (status !== 'Taslak') {
      toast.error('Onay bekleyen veya onaylanmış kayıtlar üzerinde taslak kaydedilemez.')
      return
    }
    setStatus('Taslak')
    saveState(selectedCourses, 'Taslak')
    toast.success('Taslak başarıyla kaydedildi.')
  }

  // İşlem: Danışmana gönderme
  const handleSendToAdvisor = async () => {
    if (!isTuitionPaid) {
      toast.error('Öncelikle okul ücretini ödemeniz gerekmektedir.')
      return
    }

    if (selectedCourses.length === 0) {
      toast.error('Lütfen önce seçeceğiniz dersleri belirleyin.')
      return
    }

    if (isLimitExceeded) {
      toast.error('En fazla 30 AKTS seçebilirsiniz!')
      return
    }

    // Doğrulama: Tüm zorunlu derslerin seçilmiş olma zorunluluğu
    const compulsoryCourses = courses.filter((c) => c.type === 'Zorunlu')
    const hasAllCompulsory = compulsoryCourses.every((compCourse) =>
      selectedCourses.some((selCourse) => selCourse.id === compCourse.id)
    )
    if (!hasAllCompulsory) {
      toast.error('Lütfen tüm zorunlu ve alttan derslerinizi seçiniz!')
      return
    }

    // Doğrulama: En az 1 seçmeli ders seçme zorunluluğu
    if (selectedElectivesCount < 1) {
      toast.error('Ders kaydı için en az 1 adet seçmeli ders seçmelisiniz!')
      return
    }

    setIsSubmitting(true)
    
    // API isteği simülasyonu
    setTimeout(() => {
      setStatus('Onay Bekliyor')
      saveState(selectedCourses, 'Onay Bekliyor')
      setIsSubmitting(false)
      setShowSuccessModal(true) // Show success overlay modal
    }, 1500)
  }

  // İşlem: Gönderimi iptal et ve taslağa dön
  const handleCancelSubmission = () => {
    setStatus('Taslak')
    saveState(selectedCourses, 'Taslak')
    toast.success('Ders seçimi onay talebi iptal edildi, taslak moduna geri dönüldü.')
  }

  // Demo durumu geçişleri
  const handleDemoSetStatus = (newStatus) => {
    setStatus(newStatus)
    saveState(selectedCourses, newStatus)
    toast.success(`Demo: Durum '${newStatus}' olarak güncellendi.`);
  }

  // Harç ödeme formu işlemleri
  const handleStartPayment = () => {
    setPaymentStep('installments')
  }

  const handleNextToCard = () => {
    setPaymentStep('card')
  }

  const handleSendSms = (e) => {
    e.preventDefault()
    if (!cardName || !cardNumber || !cardExpiryMonth || !cardExpiryYear || !cardCvv) {
      toast.error('Lütfen tüm kart alanlarını doldurunuz.')
      return
    }
    setPaymentStep('sms')
    toast.success('Doğrulama SMS kodu gönderildi.')
  }

  const handleVerifySms = (e) => {
    e.preventDefault()
    if (smsCode.trim().length >= 4) {
      setPaymentStep('success')
      toast.success('Ödeme doğrulaması başarılı!')
    } else {
      setSmsError('Lütfen en az 4 haneli bir onay kodu giriniz.')
    }
  }

  const handleUnlockRegistration = () => {
    setIsTuitionPaid(true)
    if (currentUser?.id) {
      localStorage.setItem(`tuition_paid_2026_2027_${currentUser.id}`, 'true')
    }
    toast.success('Ders kayıt ekranı başarıyla aktif hale getirildi!')
  }

  // Harç hesaplamaları
  const totalTuition = 120000
  const getMonthlyAmount = (inst) => {
    return Math.round(totalTuition / inst).toLocaleString('tr-TR')
  }

  // Sanal kart simülasyon yardımcıları
  const formatCardNumberDisplay = (num) => {
    const padded = num.padEnd(16, '•')
    return `${padded.slice(0, 4)} ${padded.slice(4, 8)} ${padded.slice(8, 12)} ${padded.slice(12, 16)}`
  }

  const formatExpiryDisplay = () => {
    const mm = cardExpiryMonth.padEnd(2, '•')
    const yy = cardExpiryYear.padEnd(2, '•')
    return `${mm}/${yy}`
  }

  // SMS zamanlayıcı biçimlendirici
  const formatTimer = (seconds) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`
  }

  // Arama ve filtreleme mantığı
  const filteredOffered = courses.filter((c) => {
    const matchesSearch =
      c.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.name.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesCategory = categoryFilter === 'All' || c.category === categoryFilter
    return matchesSearch && matchesCategory
  })

  // Sıralama: Öncelikle alttan kalınan başarısız dersler
  const sortedOffered = [...filteredOffered].sort((a, b) => {
    if (a.isFailed && !b.isFailed) return -1
    if (!a.isFailed && b.isFailed) return 1
    return 0
  })

  const categories = ['All', ...new Set(courses.map((c) => c.category))]

  const isLoading = coursesStatus === 'loading'

  return (
    <section className="flex-1 p-4 md:p-6 bg-[#f6f9ff] dark:bg-slate-900 transition-colors duration-200 overflow-y-auto pb-36 relative min-h-screen">
      
      {/* Harç ödeme katmanı */}
      {!isTuitionPaid && (
        <div className="absolute inset-0 bg-[#f6f9ff] dark:bg-slate-900 z-50 overflow-y-auto flex flex-col justify-start p-4 md:p-8">
          <div className="max-w-4xl w-full mx-auto my-auto flex flex-col justify-center min-h-full">
            
            {/* Aşama 1: Harç Bilgileri */}
            {paymentStep === 'overview' && (
              <div className="space-y-6 bg-white dark:bg-slate-800 rounded-3xl p-6 md:p-10 shadow-xl border border-slate-100 dark:border-slate-700/50">
                <div className="flex items-center gap-3 border-b border-slate-100 dark:border-slate-700/60 pb-5">
                  <div className="w-12 h-12 bg-amber-50 dark:bg-amber-950/40 rounded-full flex items-center justify-center text-amber-500 shrink-0">
                    <span className="material-symbols-outlined text-2xl font-bold">account_balance_wallet</span>
                  </div>
                  <div>
                    <h2 className="text-xl md:text-2xl font-extrabold tracking-tight text-slate-800 dark:text-white">Okul Ücreti Ödemesi</h2>
                    <p className="text-xs text-slate-400 dark:text-slate-500 uppercase font-bold tracking-wider">T.C. AKADEMİK BİLGİ SİSTEMİ</p>
                  </div>
                </div>

                <div className="p-4 bg-amber-500/10 border border-amber-500/30 rounded-2xl flex items-start gap-3">
                  <span className="material-symbols-outlined text-amber-500 mt-0.5 shrink-0">warning</span>
                  <div className="space-y-1">
                    <p className="text-sm font-bold text-slate-800 dark:text-slate-200">
                      2026-2027 Güz Dönemi Kayıtları Başlamıştır.
                    </p>
                    <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed font-semibold">
                      Okul Ücreti Henüz Ödenmemiştir. Ders kayıtlarına başlayabilmek için öncelikle okul ücretinizi ödemeniz gerekmektedir.
                    </p>
                  </div>
                </div>

                <div className="bg-slate-50 dark:bg-slate-900/40 rounded-2xl p-6 border border-slate-100 dark:border-slate-700/50 space-y-3.5">
                  <div className="flex justify-between items-center text-sm font-semibold text-slate-500 dark:text-slate-400">
                    <span>Akademik Yıl</span>
                    <span className="text-slate-800 dark:text-slate-200 font-bold">2026-2027</span>
                  </div>
                  <div className="flex justify-between items-center text-sm font-semibold text-slate-500 dark:text-slate-400">
                    <span>Dönem</span>
                    <span className="text-slate-800 dark:text-slate-200 font-bold">Güz Dönemi</span>
                  </div>
                  <div className="border-t border-dashed border-slate-200 dark:border-slate-700 my-2"></div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-bold text-slate-800 dark:text-slate-200">Yıllık Okul Ücreti</span>
                    <span className="text-xl font-black text-blue-600 dark:text-blue-400">120.000 TL</span>
                  </div>
                </div>

                <button
                  onClick={handleStartPayment}
                  className="w-full py-4 bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm rounded-xl shadow-lg shadow-blue-500/25 active:scale-95 transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  <span className="material-symbols-outlined text-sm">payment</span>
                  <span>Okul Ücretini Öde</span>
                </button>
              </div>
            )}

            {/* Aşama 2: Taksit Seçenekleri */}
            {paymentStep === 'installments' && (
              <div className="space-y-6 bg-white dark:bg-slate-800 rounded-3xl p-6 md:p-10 shadow-xl border border-slate-100 dark:border-slate-700/50">
                <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-700/60 pb-4">
                  <h2 className="text-xl font-extrabold tracking-tight">Taksit Seçenekleri</h2>
                  <span className="text-xs font-bold text-slate-400 uppercase">Aşama 2 / 5</span>
                </div>

                <div className="flex flex-col space-y-3">
                  {[1, 3, 6, 12].map((inst) => (
                    <label
                      key={inst}
                      onClick={() => setSelectedInstallment(inst)}
                      className={`flex items-center justify-between p-4 border rounded-2xl cursor-pointer transition-all ${
                        selectedInstallment === inst
                          ? 'border-blue-600 bg-blue-50/30 dark:bg-blue-950/20 shadow-sm'
                          : 'border-slate-200 dark:border-slate-700 hover:border-slate-300'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <input
                          type="radio"
                          name="installment"
                          checked={selectedInstallment === inst}
                          onChange={() => setSelectedInstallment(inst)}
                          className="text-blue-600 focus:ring-blue-500 h-4 w-4"
                        />
                        <span className="text-sm font-bold text-slate-800 dark:text-slate-200">
                          {inst === 1 ? 'Tek Çekim (Peşin)' : `${inst} Taksit`}
                        </span>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-black text-blue-600 dark:text-blue-400">
                          {getMonthlyAmount(inst)} TL <span className="text-[10px] font-semibold text-slate-400">/ ay</span>
                        </p>
                        <p className="text-[10px] text-slate-400 dark:text-slate-500 font-bold">Toplam: 120.000 TL</p>
                      </div>
                    </label>
                  ))}
                </div>

                <div className="flex items-center gap-3 pt-2">
                  <button
                    onClick={() => setPaymentStep('overview')}
                    className="flex-1 py-3.5 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 font-bold text-sm rounded-xl transition-all cursor-pointer text-center"
                  >
                    Geri Dön
                  </button>
                  <button
                    onClick={handleNextToCard}
                    className="flex-[2] py-3.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm rounded-xl shadow-lg shadow-blue-500/25 active:scale-95 transition-all text-center cursor-pointer"
                  >
                    Kart Bilgilerine Geç
                  </button>
                </div>
              </div>
            )}

            {/* Aşama 3: Kart Ödeme Detayları */}
            {paymentStep === 'card' && (
              <form onSubmit={handleSendSms} className="space-y-6 bg-white dark:bg-slate-800 rounded-3xl p-6 md:p-10 shadow-xl border border-slate-100 dark:border-slate-700/50">
                <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-700/60 pb-4">
                  <h2 className="text-xl font-extrabold tracking-tight text-slate-800 dark:text-white">Güvenli Kart Ödeme</h2>
                  <span className="text-xs font-bold text-slate-400 uppercase">Aşama 3 / 5</span>
                </div>

                <div className="grid grid-cols-12 gap-6">
                  
                  {/* Sol Sütun: Kredi Kartı Simülasyonu */}
                  <div className="col-span-12 md:col-span-5 flex flex-col justify-between space-y-6">
                    
                    <div className="w-full h-48 [perspective:1000px] shrink-0">
                      <div className={`relative w-full h-full transition-transform duration-700 [transform-style:preserve-3d] ${isCvvFocused ? '[transform:rotateY(180deg)]' : ''}`}>
                        
                        {/* Ön Yüz */}
                        <div className="absolute inset-0 w-full h-full bg-gradient-to-br from-indigo-950 via-blue-900 to-slate-900 rounded-2xl p-5 text-white shadow-2xl flex flex-col justify-between overflow-hidden border border-white/10 [backface-visibility:hidden]">
                          <div className="flex justify-between items-center">
                            <div className="w-11 h-8 bg-gradient-to-r from-yellow-400 via-amber-200 to-yellow-500 rounded-md relative border border-yellow-600/30 overflow-hidden shadow-[inset_0_1px_3px_rgba(255,255,255,0.4)] shrink-0">
                              <div className="absolute inset-0 grid grid-cols-3 grid-rows-3 gap-0 opacity-40">
                                <div className="border-r border-b border-yellow-800/40"></div>
                                <div className="border-r border-b border-yellow-800/40"></div>
                                <div className="border-b border-yellow-800/40"></div>
                                <div className="border-r border-b border-yellow-800/40"></div>
                                <div className="border-r border-b border-yellow-800/40"></div>
                                <div className="border-b border-yellow-800/40"></div>
                                <div className="border-r border-yellow-800/40"></div>
                                <div className="border-r border-yellow-800/40"></div>
                                <div></div>
                              </div>
                            </div>
                            <div className="text-xl font-bold tracking-tight text-white/80 font-mono">VISA</div>
                          </div>
                          
                          <div className="text-lg font-mono tracking-widest my-4 text-center">
                            {formatCardNumberDisplay(cardNumber)}
                          </div>
                          
                          <div className="flex justify-between items-end">
                            <div className="min-w-0 flex-1 mr-2">
                              <p className="text-[8px] text-white/40 uppercase tracking-widest mb-0.5">KART SAHİBİ</p>
                              <p className="text-xs font-bold font-mono tracking-wide uppercase truncate">
                                {cardName || 'AD SOYAD'}
                              </p>
                            </div>
                            <div className="text-right shrink-0">
                              <p className="text-[8px] text-white/40 uppercase tracking-widest mb-0.5">S.K.T</p>
                              <p className="text-xs font-bold font-mono tracking-wide">
                                {formatExpiryDisplay()}
                              </p>
                            </div>
                          </div>
                        </div>

                        {/* Arka Yüz */}
                        <div className="absolute inset-0 w-full h-full bg-gradient-to-br from-indigo-950 via-blue-900 to-slate-900 rounded-2xl text-white shadow-2xl flex flex-col justify-between overflow-hidden border border-white/10 [backface-visibility:hidden] [transform:rotateY(180deg)]">
                          <div className="w-full h-10 bg-slate-950 mt-4"></div>
                          
                          <div className="px-5 flex items-center justify-between">
                            <div className="flex-1 h-8 bg-slate-200/20 rounded-md mr-3 flex items-center px-2 text-white/40 text-[9px] italic font-semibold">
                              Yetkili İmza
                            </div>
                            <div className="bg-white text-slate-800 font-mono font-bold px-3 py-1.5 rounded-md text-sm shrink-0 shadow-inner">
                              {cardCvv || '***'}
                            </div>
                          </div>
                          
                          <div className="px-5 pb-4 flex justify-between items-center text-[8px] text-white/40 font-mono">
                            <span>T.C. AKADEMİK BİLGİ SİSTEMİ</span>
                            <span className="font-bold text-xs">VISA</span>
                          </div>
                        </div>

                      </div>
                    </div>

                    <div className="bg-slate-50 dark:bg-slate-900/40 rounded-2xl p-4 border border-slate-100 dark:border-slate-700/50 space-y-2.5">
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">Ödeme Özeti</p>
                      <div className="flex justify-between text-xs font-semibold text-slate-500">
                        <span>Hizmet</span>
                        <span className="text-slate-800 dark:text-slate-200">Okul Ücreti Ödemesi</span>
                      </div>
                      <div className="flex justify-between text-xs font-semibold text-slate-500">
                        <span>Plan</span>
                        <span className="text-slate-800 dark:text-slate-200">
                          {selectedInstallment === 1 ? 'Tek Çekim' : `${selectedInstallment} Taksit`}
                        </span>
                      </div>
                      <div className="border-t border-dashed border-slate-200 dark:border-slate-700 my-1"></div>
                      <div className="flex justify-between items-baseline">
                        <span className="text-xs font-bold">Aylık Tutar</span>
                        <span className="text-base font-extrabold text-blue-600 dark:text-blue-400">
                          {getMonthlyAmount(selectedInstallment)} TL <span className="text-[9px] text-slate-400 font-normal">/ ay</span>
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Sağ Sütun: Form alanları */}
                  <div className="col-span-12 md:col-span-7 space-y-4">
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wide">Kart Sahibi</label>
                      <input
                        type="text"
                        required
                        placeholder="Kart üzerindeki isim"
                        value={cardName}
                        onChange={(e) => setCardName(e.target.value)}
                        className="w-full px-3.5 py-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-1 focus:ring-blue-500 focus:outline-none text-sm"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wide">Kart Numarası</label>
                      <input
                        type="text"
                        required
                        placeholder="XXXX XXXX XXXX XXXX"
                        maxLength={16}
                        value={cardNumber}
                        onChange={(e) => setCardNumber(e.target.value.replace(/\D/g, ''))}
                        className="w-full px-3.5 py-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-1 focus:ring-blue-500 focus:outline-none text-sm tracking-widest"
                      />
                    </div>

                    <div className="grid grid-cols-12 gap-4">
                      <div className="col-span-4 space-y-1">
                        <label className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wide">Ay (AA)</label>
                        <input
                          type="text"
                          required
                          placeholder="Ay"
                          maxLength={2}
                          value={cardExpiryMonth}
                          onChange={(e) => setCardExpiryMonth(e.target.value.replace(/\D/g, ''))}
                          className="w-full px-3.5 py-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-1 focus:ring-blue-500 focus:outline-none text-sm text-center font-mono"
                        />
                      </div>

                      <div className="col-span-4 space-y-1">
                        <label className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wide">Yıl (YY)</label>
                        <input
                          type="text"
                          required
                          placeholder="Yıl"
                          maxLength={2}
                          value={cardExpiryYear}
                          onChange={(e) => setCardExpiryYear(e.target.value.replace(/\D/g, ''))}
                          className="w-full px-3.5 py-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-1 focus:ring-blue-500 focus:outline-none text-sm text-center font-mono"
                        />
                      </div>

                      <div className="col-span-4 space-y-1">
                        <label className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wide">CVC/CVV</label>
                        <input
                          type="password"
                          required
                          placeholder="***"
                          maxLength={3}
                          value={cardCvv}
                          onChange={(e) => setCardCvv(e.target.value.replace(/\D/g, ''))}
                          onFocus={() => setIsCvvFocused(true)}
                          onBlur={() => setIsCvvFocused(false)}
                          className="w-full px-3.5 py-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-1 focus:ring-blue-500 focus:outline-none text-sm text-center font-mono"
                        />
                      </div>
                    </div>
                  </div>

                </div>

                <div className="flex items-center gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setPaymentStep('installments')}
                    className="flex-1 py-3 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 font-bold text-sm rounded-xl transition-all cursor-pointer text-center"
                  >
                    Geri Dön
                  </button>
                  <button
                    type="submit"
                    className="flex-[2] py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm rounded-xl shadow-lg shadow-blue-500/25 active:scale-95 transition-all text-center cursor-pointer"
                  >
                    Güvenli Ödeme Kodu Gönder
                  </button>
                </div>
              </form>
            )}

            {/* Aşama 4: SMS Doğrulama */}
            {paymentStep === 'sms' && (
              <form onSubmit={handleVerifySms} className="space-y-6 bg-white dark:bg-slate-800 rounded-3xl p-6 md:p-10 shadow-xl border border-slate-100 dark:border-slate-700/50">
                <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-700/60 pb-4">
                  <h2 className="text-xl font-extrabold tracking-tight">SMS Onay Kodu</h2>
                  <span className="text-xs font-bold text-slate-400 uppercase">Aşama 4 / 5</span>
                </div>

                <div className="p-4 bg-blue-500/10 rounded-2xl text-xs leading-relaxed text-slate-600 dark:text-slate-300 font-medium">
                  Telefonunuza gönderilen 3D Secure doğrulama kodunu giriniz. (Onay kodu alanına rastgele bir şeyler girmeniz yeterlidir)
                </div>

                <div className="flex flex-col items-center justify-center space-y-1">
                  <span className="text-2xl font-black text-blue-600 dark:text-blue-400 tracking-wider font-mono">
                    {formatTimer(timerSeconds)}
                  </span>
                  <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">Kalan Onay Süresi</span>
                </div>

                <div className="space-y-2">
                  <input
                    type="text"
                    required
                    placeholder="Onay Kodu"
                    value={smsCode}
                    onChange={(e) => {
                      setSmsCode(e.target.value)
                      setSmsError('')
                    }}
                    className="w-full px-4 py-3 bg-[#f6f9ff] dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-1 focus:ring-blue-500 focus:outline-none text-base tracking-widest text-center font-bold"
                  />
                  {smsError && (
                    <p className="text-xs font-semibold text-red-500 text-center animate-pulse">{smsError}</p>
                  )}
                  {timerSeconds === 0 && (
                    <p className="text-xs text-red-500 text-center">
                      Onay kodu süresi doldu! Lütfen tekrar kod talep edin.
                    </p>
                  )}
                </div>

                <div className="flex items-center gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => {
                      setPaymentStep('card')
                      setSmsCode('')
                      setSmsError('')
                    }}
                    className="flex-1 py-3 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 font-bold text-sm rounded-xl transition-all cursor-pointer text-center"
                  >
                    Kart Düzenle
                  </button>
                  <button
                    type="submit"
                    disabled={timerSeconds === 0}
                    className={`flex-[2] py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm rounded-xl shadow-lg shadow-emerald-500/25 active:scale-95 transition-all text-center cursor-pointer ${
                      timerSeconds === 0 ? 'bg-slate-300 text-slate-500 cursor-not-allowed pointer-events-none' : ''
                    }`}
                  >
                    Doğrula ve Öde
                  </button>
                </div>
              </form>
            )}

            {/* Aşama 5: Ödeme Başarılı */}
            {paymentStep === 'success' && (
              <div className="flex flex-col items-center text-center space-y-6 py-6 bg-white dark:bg-slate-800 rounded-3xl p-6 md:p-10 shadow-xl border border-slate-100 dark:border-slate-700/50">
                <div className="w-20 h-20 bg-emerald-50 dark:bg-emerald-950/40 rounded-full flex items-center justify-center text-emerald-500 animate-success-bounce shadow-[0_0_20px_rgba(16,185,129,0.2)]">
                  <svg className="w-12 h-12 stroke-emerald-500 fill-none" viewBox="0 0 52 52">
                    <circle className="animate-draw-circle" cx="26" cy="26" r="25" strokeWidth="3" />
                    <path className="animate-draw-check" d="M14.1 27.2l7.1 7.2 16.7-16.8" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </div>

                <div className="space-y-2">
                  <h2 className="text-2xl font-black text-slate-800 dark:text-white tracking-tight">Ödeme Başarılı!</h2>
                  <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed font-semibold">
                    Yıllık okul ücreti tahsilatınız başarıyla gerçekleştirilmiştir. Ders kayıt işlemleriniz açılmıştır.
                  </p>
                </div>

                <button
                  onClick={handleUnlockRegistration}
                  className="w-full py-3.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm rounded-xl shadow-lg shadow-emerald-500/25 active:scale-95 transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  <span>Ders Seçimine Başla</span>
                  <span className="material-symbols-outlined text-sm">arrow_forward</span>
                </button>
              </div>
            )}

          </div>
        </div>
      )}

      {/* Başarılı Modalı */}
      {showSuccessModal && (
        <div className="fixed inset-0 bg-slate-900/70 backdrop-blur-md flex items-center justify-center z-[100] p-4 transition-opacity duration-300">
          <div className="bg-white dark:bg-slate-800 rounded-3xl p-8 max-w-md w-full shadow-2xl border border-slate-100 dark:border-slate-700/50 flex flex-col items-center text-center space-y-6 transform scale-100 animate-fade-in-up">
            
            <div className="w-20 h-20 bg-emerald-50 dark:bg-emerald-950/40 rounded-full flex items-center justify-center text-emerald-500 animate-success-bounce shadow-[0_0_20px_rgba(16,185,129,0.2)]">
              <svg className="w-12 h-12 stroke-emerald-500 fill-none" viewBox="0 0 52 52">
                <circle className="animate-draw-circle" cx="26" cy="26" r="25" strokeWidth="3" />
                <path className="animate-draw-check" d="M14.1 27.2l7.1 7.2 16.7-16.8" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>

            <div className="space-y-2">
              <h2 className="text-2xl font-black text-slate-800 dark:text-white tracking-tight">
                Ders Seçiminiz Alınmıştır!
              </h2>
              <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
                Talebiniz başarıyla danışmanınız <strong>{currentUser?.advisor || 'Prof. Dr. Selçuk Yılmaz'}</strong> onayına gönderilmiştir.
              </p>
            </div>

            <button
              onClick={() => setShowSuccessModal(false)}
              className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm rounded-xl shadow-lg shadow-emerald-500/25 active:scale-95 transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <span>Ders Kayıt Paneline Geri Dön</span>
              <span className="material-symbols-outlined text-sm">arrow_forward</span>
            </button>
          </div>
        </div>
      )}

      {/* Ana kayıt içeriği alanı */}
      <div className={`max-w-7xl mx-auto space-y-5 transition-all duration-1000 ease-in-out ${isTuitionPaid ? 'blur-none' : 'blur-[6px] pointer-events-none select-none'}`}>
        
        {/* Başlık Bölümü */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-4">
          <div>
            <h1 className="text-xl md:text-2xl font-extrabold text-slate-800 dark:text-white tracking-tight">
              Ders Kayıt ve Harç İşlemleri
            </h1>
            <p className="text-xs md:text-sm text-slate-500 dark:text-slate-400 mt-0.5">
              2026-2027 Güz Dönemi Kayıtları
            </p>
          </div>
        </div>

        {/* Durum Bandı */}
        <div className="p-4 bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800/60 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-50 dark:bg-blue-950/40 rounded-full flex items-center justify-center text-blue-600 dark:text-blue-400 shrink-0">
              <span className="material-symbols-outlined text-2xl">info</span>
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-800 dark:text-white">
                2026-2027 Güz Dönemi Kayıtları
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                {status === 'Onaylandı'
                  ? 'Tebrikler! Ders seçiminiz akademik danışmanınız tarafından onaylanmıştır.'
                  : status === 'Onay Bekliyor' 
                  ? 'Ders seçiminiz yapılmış olup akademik danışman onayı beklenmektedir.'
                  : 'Okul ücreti ödemeniz doğrulanmıştır. En az 1 adet Seçmeli ders seçerek onay kutusuna gönderin.'}
              </p>
            </div>
          </div>
          
          <div className="shrink-0">
            {status === 'Onaylandı' ? (
              <span className="bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 px-3.5 py-1.5 rounded-full text-xs font-bold border border-emerald-200 dark:border-emerald-900/40 flex items-center gap-1.5 shadow-[0_0_12px_rgba(16,185,129,0.15)] animate-success-bounce">
                <span className="material-symbols-outlined text-sm font-bold text-emerald-500">done_all</span>
                <span className="font-semibold">Ders Seçiminiz Onaylanmıştır</span>
              </span>
            ) : status === 'Onay Bekliyor' ? (
              <span className="bg-amber-50 dark:bg-amber-950/20 text-amber-600 dark:text-amber-400 px-3.5 py-1.5 rounded-full text-xs font-bold border border-amber-200 dark:border-amber-900/40 flex items-center gap-1.5 shadow-[0_0_12px_rgba(245,158,11,0.15)] animate-pulse">
                <span className="relative flex h-2 w-2 mr-0.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-500"></span>
                </span>
                Danışman Onayı Bekleniyor
              </span>
            ) : (
              <span className="bg-blue-50 dark:bg-blue-950/30 text-blue-600 dark:text-blue-400 px-3.5 py-1.5 rounded-full text-xs font-bold border border-blue-200 dark:border-blue-900/40 flex items-center gap-1.5">
                <span className="relative flex h-2 w-2 mr-0.5">
                  <span className="animate-slow-pulse absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500"></span>
                </span>
                Ders Seçimi Yapılıyor
              </span>
            )}
          </div>
        </div>

        {/* Uyarı Bantları */}
        <div className="flex flex-col gap-2">
          {isLimitExceeded && (
            <div className="p-3 bg-red-50 dark:bg-red-950/30 text-red-700 dark:text-red-400 rounded-xl border border-red-200 dark:border-red-900/40 flex items-center gap-3 animate-bounce">
              <span className="material-symbols-outlined text-red-500 shrink-0">warning</span>
              <span className="text-xs font-semibold">
                En fazla 30 AKTS seçebilirsiniz! Lütfen bazı dersleri listenizden çıkarın.
              </span>
            </div>
          )}

          {status === 'Taslak' && selectedElectivesCount < 1 && (
            <div className="p-3 bg-blue-50 dark:bg-blue-950/20 text-blue-700 dark:text-blue-400 rounded-xl border border-blue-100 dark:border-blue-900/30 flex items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-blue-500 shrink-0 text-lg">info</span>
                <span className="text-xs font-medium">
                  Seçmeli ders kuralları: Programınız gereği en az <strong>1 adet seçmeli ders</strong> seçmelisiniz.
                </span>
              </div>
              <span className="shrink-0 bg-blue-100 dark:bg-blue-900/60 text-blue-600 dark:text-blue-300 text-[10px] font-bold px-2 py-0.5 rounded">
                Seçilen: {selectedElectivesCount} / 1
              </span>
            </div>
          )}
        </div>

        {/* Ana Izgara */}
        <div className="grid grid-cols-12 gap-5 h-auto">

          {/* Sol Sütun: Açılan Dersler */}
          <div className="col-span-12 lg:col-span-7 bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800/60 overflow-hidden flex flex-col h-auto">
            
            {/* Başlık + Arama/Filtreleme */}
            <div className="p-4 border-b border-slate-100 dark:border-slate-800/60 bg-slate-50/50 dark:bg-slate-800/30 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <h3 className="font-bold text-sm text-slate-800 dark:white flex items-center gap-2 shrink-0">
                <span className="material-symbols-outlined text-blue-600 dark:text-blue-400">list_alt</span>
                Açılan Dersler
              </h3>
              
              <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
                <div className="relative flex-grow sm:flex-none sm:w-48">
                  <input
                    type="text"
                    placeholder="Ders kodu veya ad..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-9 pr-3 py-1.5 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 text-xs rounded-lg border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  />
                  <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-base pointer-events-none flex items-center justify-center">
                    search
                  </span>
                </div>

                <select
                  value={categoryFilter}
                  onChange={(e) => setCategoryFilter(e.target.value)}
                  className="flex-grow sm:flex-none sm:w-36 py-1.5 px-2 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 text-xs rounded-lg border border-slate-200 dark:border-slate-700 focus:outline-none"
                >
                  <option value="All">Tüm Kategoriler</option>
                  {categories.filter(cat => cat !== 'All').map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Dersler Tablosu */}
            <div className="overflow-y-auto max-h-[600px] lg:max-h-[800px]">
              {isLoading ? (
                <div className="flex items-center justify-center py-12 text-slate-400 dark:text-slate-500">
                  <span className="animate-spin material-symbols-outlined mr-2">sync</span>
                  <p className="text-sm">Dersler yükleniyor...</p>
                </div>
              ) : sortedOffered.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-16 text-slate-400 dark:text-slate-500 p-6">
                  <span className="material-symbols-outlined text-4xl mb-2">find_in_page</span>
                  <p className="text-sm">Aranan kriterlere uygun ders bulunamadı.</p>
                </div>
              ) : (
                <table className="w-full text-left border-collapse">
                  <thead className="sticky top-0 bg-slate-50 dark:bg-slate-900/90 text-slate-500 dark:text-slate-400 text-[10px] font-bold uppercase border-b border-slate-100 dark:border-slate-800 z-10">
                    <tr>
                      <th className="px-4 py-2.5">Kod</th>
                      <th className="px-4 py-2.5">Ders Adı</th>
                      <th className="px-4 py-2.5">AKTS</th>
                      <th className="px-4 py-2.5 text-right">İşlem</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800/40">
                    {sortedOffered.map((course) => {
                      const isAdded = selectedCourses.some((c) => c.id === course.id)
                      return (
                        <tr key={course.id} className={`hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors ${course.isFailed ? 'bg-red-50/10 dark:bg-red-950/5' : ''}`}>
                          <td className="px-4 py-3 text-xs font-bold text-blue-600 dark:text-blue-400">
                            {course.id}
                          </td>
                          <td className="px-4 py-3">
                            <div className="flex items-center flex-wrap gap-1.5">
                              <span className="font-semibold text-xs text-slate-800 dark:text-white">
                                {course.name}
                              </span>
                              {course.isFailed && (
                                <span className="bg-red-100 dark:bg-red-950 text-red-600 dark:text-red-400 text-[8px] font-extrabold px-1.5 py-0.5 rounded border border-red-200 dark:border-red-900/50 uppercase tracking-wider">
                                  Alttan
                                </span>
                              )}
                              <span className={`text-[8px] font-bold px-1.5 py-0.5 rounded uppercase tracking-wider ${
                                course.type === 'Zorunlu' 
                                  ? 'bg-blue-100 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400' 
                                  : 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400'
                              }`}>
                                {course.type || 'Zorunlu'}
                              </span>
                            </div>
                            <div className="text-[10px] text-slate-400 dark:text-slate-500 mt-0.5">
                              {course.instructor} · {course.category}
                            </div>
                          </td>
                          <td className="px-4 py-3">
                            <span className="bg-slate-100 dark:bg-slate-700/60 text-slate-600 dark:text-slate-300 text-[10px] font-bold px-2 py-0.5 rounded-md border border-slate-200/50 dark:border-slate-700/30">
                              {course.akts} AKTS
                            </span>
                          </td>
                          <td className="px-4 py-3 text-right">
                            <button
                              onClick={() => handleAddCourse(course)}
                              disabled={isAdded || status !== 'Taslak'}
                              className={`w-7 h-7 rounded-lg flex items-center justify-center transition-all ${
                                isAdded
                                  ? 'bg-slate-100 dark:bg-slate-700/40 text-slate-400 dark:text-slate-500 cursor-not-allowed'
                                  : status !== 'Taslak'
                                  ? 'bg-slate-100 dark:bg-slate-800 text-slate-400 dark:text-slate-600 cursor-not-allowed'
                                  : 'bg-blue-600 hover:bg-blue-700 text-white hover:shadow-md hover:shadow-blue-500/20 active:scale-95'
                              }`}
                              title={isAdded ? 'Sepete Eklendi' : 'Ekle'}
                            >
                              <span className="material-symbols-outlined text-base">
                                {isAdded ? 'check' : 'add'}
                              </span>
                            </button>
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              )}
            </div>
          </div>

          {/* Sağ Sütun: Seçilen Dersler */}
          <div className="col-span-12 lg:col-span-5 bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800/60 overflow-hidden flex flex-col h-auto">
            
            {/* Başlık */}
            <div className="p-4 border-b border-slate-100 dark:border-slate-800/60 bg-slate-50/50 dark:bg-slate-800/30 flex items-center justify-between">
              <h3 className="font-bold text-sm text-slate-800 dark:text-white flex items-center gap-2">
                <span className="material-symbols-outlined text-blue-600 dark:text-blue-400">shopping_cart</span>
                {status === 'Taslak' ? 'Seçilen Dersler' : 'Seçtiğim Dersler'}
              </h3>
              <span className="bg-blue-600 dark:bg-blue-500/20 text-white dark:text-blue-400 px-2.5 py-0.5 rounded-full text-[10px] font-bold">
                {selectedCourses.length} Ders
              </span>
            </div>

            {/* Liste */}
            <div className="flex-grow overflow-y-auto p-4 space-y-3 max-h-[500px] lg:max-h-[700px]">
              {selectedCourses.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-16 text-slate-400 dark:text-slate-500 text-center p-6">
                  <span className="material-symbols-outlined text-4xl mb-2">add_shopping_cart</span>
                  <p className="text-sm font-medium">Henüz ders seçmediniz.</p>
                  <p className="text-xs mt-1 text-slate-400">Soldaki havuzdan ders ekleyebilirsiniz.</p>
                </div>
              ) : (
                selectedCourses.map((course) => (
                  <div
                    key={course.id}
                    className="group flex items-center justify-between p-3.5 bg-slate-50 dark:bg-slate-900/60 border border-slate-100 dark:border-slate-800/60 rounded-xl hover:border-blue-400/40 dark:hover:border-blue-500/30 transition-all shadow-sm"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0">
                        <span className="material-symbols-outlined text-base">menu_book</span>
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <span className="text-[10px] font-bold text-blue-600 dark:text-blue-400">{course.id}</span>
                          <span className={`text-[8px] font-bold px-1 rounded ${
                            course.type === 'Zorunlu' 
                              ? 'bg-blue-100 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400' 
                              : 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400'
                          }`}>
                            {course.type || 'Zorunlu'}
                          </span>
                        </div>
                        <p className="text-xs font-bold text-slate-800 dark:text-white truncate w-32 sm:w-52 md:w-60 lg:w-32 xl:w-52">
                          {course.name}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <span className="text-[10px] font-bold text-slate-600 dark:text-slate-300">
                        {course.akts} AKTS
                      </span>
                      <button
                        onClick={() => handleRemoveCourse(course.id)}
                        disabled={status !== 'Taslak'}
                        className={`text-slate-400 hover:text-red-500 transition-colors ${
                          status !== 'Taslak' ? 'cursor-not-allowed opacity-10' : ''
                        }`}
                        title="Dersi Çıkar"
                      >
                        <span className="material-symbols-outlined text-base">delete</span>
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Özet Alanı */}
            <div className="p-4 bg-slate-50/50 dark:bg-slate-900/40 border-t border-slate-100 dark:border-slate-800">
              <div className="flex justify-between items-center mb-2">
                <span className="text-xs font-bold text-slate-500 dark:text-slate-400">Dönemlik Toplam</span>
                <span className={`text-lg font-extrabold ${isLimitExceeded ? 'text-red-600 dark:text-red-400' : 'text-slate-800 dark:text-white'}`}>
                  {totalAkts} AKTS
                </span>
              </div>
              <div className="w-full bg-slate-200 dark:bg-slate-700 h-2 rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-300 ${
                    isLimitExceeded ? 'bg-red-600' : 'bg-blue-600'
                  }`}
                  style={{ width: `${Math.min((totalAkts / 30) * 100, 100)}%` }}
                ></div>
              </div>
              <div className="flex justify-between items-center text-[9px] text-slate-400 dark:text-slate-500 mt-1 font-bold uppercase">
                <span>0 AKTS</span>
                <span>Max: 30 AKTS</span>
              </div>
            </div>

          </div>
        </div>

      </div>

      {/* Yapışkan Aksiyon Altlığı */}
      <footer className={`fixed bottom-0 left-0 md:left-[280px] right-0 h-16 md:h-20 bg-white/70 dark:bg-slate-900/70 backdrop-blur-md border-t border-slate-200/80 dark:border-slate-800/80 flex items-center px-4 md:px-6 z-40 transition-all duration-1000 ease-in-out shadow-xl ${isTuitionPaid ? 'blur-none' : 'blur-[6px] pointer-events-none select-none'}`}>
        <div className="max-w-7xl mx-auto w-full flex flex-col sm:flex-row items-center justify-between gap-3">
          
          {/* İstatistik Bilgileri (Sol) */}
          <div className="flex flex-wrap items-center justify-between sm:justify-start gap-4 sm:gap-5 w-full sm:w-auto">
            
            <div className="shrink-0">
              <p className="text-[9px] text-slate-400 dark:text-slate-500 font-bold uppercase tracking-wider mb-0.5">
                Toplam Seçilen AKTS
              </p>
              <div className="flex items-baseline gap-1">
                <span className={`text-2xl md:text-3xl font-black tracking-tighter ${isLimitExceeded ? 'text-red-600 dark:text-red-400 animate-pulse' : 'text-blue-600 dark:text-blue-400'}`}>
                  {totalAkts}
                </span>
                <span className="text-xs font-semibold text-slate-400 dark:text-slate-500">
                  / 30 AKTS
                </span>
                <span className={`ml-2 px-1.5 py-0.5 rounded text-[8px] font-extrabold border ${
                  isLimitExceeded 
                    ? 'bg-red-50 dark:bg-red-950/20 text-red-600 dark:text-red-400 border-red-200 dark:border-red-900/40' 
                    : 'bg-blue-50 dark:bg-blue-950/30 text-blue-600 dark:text-blue-400 border-blue-100 dark:border-blue-900/30'
                }`}>
                  {isLimitExceeded ? 'AŞILDI' : `KALAN: ${30 - totalAkts}`}
                </span>
              </div>
            </div>

            <div className="hidden sm:block border-l border-slate-200 dark:border-slate-800 h-8"></div>

            {/* Durum Göstergesi */}
            <div className="shrink-0">
              <p className="text-[9px] text-slate-400 dark:text-slate-500 font-bold uppercase tracking-wider mb-0.5">
                Kayıt Durumu
              </p>
              <div className="flex items-center gap-1.5 mt-0.5">
                {status === 'Onaylandı' ? (
                  <div className="flex items-center gap-1.5 bg-emerald-500/10 dark:bg-emerald-500/5 px-2.5 py-1 rounded-lg border border-emerald-500/20 shadow-[0_0_8px_rgba(16,185,129,0.15)] animate-success-bounce">
                    <span className="material-symbols-outlined text-sm font-bold text-emerald-500">done_all</span>
                    <span className="text-[11px] font-extrabold text-emerald-600 dark:text-emerald-400 uppercase tracking-wide">
                      Ders Seçiminiz Onaylanmıştır
                    </span>
                  </div>
                ) : status === 'Onay Bekliyor' ? (
                  <div className="flex items-center gap-1.5 bg-amber-500/10 dark:bg-amber-500/5 px-2.5 py-1 rounded-lg border border-amber-500/20 shadow-[0_0_8px_rgba(245,158,11,0.15)]">
                    <span className="relative flex h-2 w-2 shrink-0">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-500"></span>
                    </span>
                    <span className="text-[11px] font-extrabold text-amber-600 dark:text-amber-400 uppercase tracking-wide animate-pulse">
                      Danışman Onayı Bekleniyor
                    </span>
                  </div>
                ) : (
                  <div className="flex items-center gap-1.5 bg-blue-500/10 dark:bg-blue-500/5 px-2.5 py-1 rounded-lg border border-blue-500/20">
                    <span className="relative flex h-2 w-2 shrink-0">
                      <span className="animate-slow-pulse absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500"></span>
                    </span>
                    <span className="text-[11px] font-extrabold text-blue-600 dark:text-blue-400 uppercase tracking-wide">
                      Ders Seçimi Yapılıyor
                    </span>
                  </div>
                )}
              </div>
            </div>

            <div className="hidden sm:block border-l border-slate-200 dark:border-slate-800 h-8"></div>

            {/* Seçmeli Ders Sayıları */}
            <div className="shrink-0">
              <p className="text-[9px] text-slate-400 dark:text-slate-500 font-bold uppercase tracking-wider mb-0.5">
                Seçmeli Ders Sayısı
              </p>
              <div className="flex items-center gap-1 mt-0.5 bg-slate-100 dark:bg-slate-800/80 px-2 py-0.5 rounded border border-slate-200 dark:border-slate-700/60 font-bold text-[10px]">
                <span className={`${selectedElectivesCount >= 1 ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-600 dark:text-slate-400'}`}>
                  {selectedElectivesCount} / 1
                </span>
              </div>
            </div>

          </div>

          {/* Butonlar (Sağ) */}
          <div className="flex items-center gap-2 shrink-0 justify-end w-full sm:w-auto mt-2 sm:mt-0">
            {status === 'Onaylandı' ? (
              <div className="w-full sm:w-auto px-5 py-2 bg-emerald-100 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 border border-emerald-200 dark:border-emerald-900/30">
                <span className="material-symbols-outlined text-sm">check_circle</span>
                Kayıt Tamamlandı
              </div>
            ) : status === 'Onay Bekliyor' ? (
              <button
                onClick={handleCancelSubmission}
                className="w-full sm:w-auto px-5 py-2 bg-red-500 hover:bg-red-600 dark:bg-red-600 dark:hover:bg-red-700 text-white font-bold text-xs rounded-xl shadow-md hover:shadow-red-500/20 active:scale-95 transition-all flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <span className="material-symbols-outlined text-sm">cancel</span>
                Seçimi İptal Et
              </button>
            ) : (
              <>
                <button
                  onClick={handleSaveDraft}
                  disabled={isSubmitting}
                  className="px-4 py-2 rounded-xl border-2 border-blue-600 dark:border-blue-500/40 text-blue-600 dark:text-blue-400 hover:bg-blue-50/50 dark:hover:bg-blue-950/20 bg-transparent font-bold text-xs transition-all active:scale-95 cursor-pointer flex items-center justify-center gap-1"
                >
                  <span className="material-symbols-outlined text-sm">save</span>
                  Taslağı Kaydet
                </button>

                <button
                  onClick={handleSendToAdvisor}
                  disabled={isLimitExceeded || isSubmitting || selectedCourses.length === 0}
                  className={`px-5 py-2 rounded-xl font-bold text-xs text-white shadow-lg flex items-center justify-center gap-1.5 transition-all duration-300 transform active:scale-95 cursor-pointer animate-shimmer ${
                    isLimitExceeded || isSubmitting || selectedCourses.length === 0
                      ? 'bg-slate-300 dark:bg-slate-800 text-slate-400 dark:text-slate-600 shadow-none cursor-not-allowed pointer-events-none'
                      : 'bg-emerald-600 dark:bg-emerald-50 hover:bg-emerald-700 dark:hover:bg-emerald-600 hover:translate-x-1.5 hover:shadow-[0_0_15px_rgba(16,185,129,0.7)]'
                  }`}
                >
                  {isSubmitting ? (
                    <>
                      <svg className="animate-spin -ml-1 mr-1 h-3.5 w-3.5 text-white" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                      </svg>
                      <span>Gönderiliyor...</span>
                    </>
                  ) : (
                    <>
                      <span>Danışman Onayına Gönder</span>
                      <span className="material-symbols-outlined text-sm">send</span>
                    </>
                  )}
                </button>
              </>
            )}
          </div>

        </div>
      </footer>
    </section>
  )
}
