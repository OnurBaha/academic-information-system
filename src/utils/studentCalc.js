/**
 * Sınav notlarından ortalama puanı hesaplar.
 * Proje varsa: vize %30, proje %20, final %50
 * Proje yoksa: vize %40, final %60
 */
export const calculateScore = (vize, final, proje) => {
  const v = Number(vize) || 0
  const f = Number(final) || 0

  if (proje !== null && proje !== undefined && proje !== '-') {
    const p = Number(proje) || 0
    return v * 0.3 + p * 0.2 + f * 0.5
  }

  return v * 0.4 + f * 0.6
}

/**
 * Puan karşılığı olan harf notunu döndürür.
 */
export const getLetterGrade = (score) => {
  const s = Number(score) || 0
  if (s >= 80) return 'AA'
  if (s >= 70) return 'BA'
  if (s >= 65) return 'BB'
  if (s >= 58) return 'CB'
  if (s >= 50) return 'CC'
  if (s >= 45) return 'DC'
  if (s >= 40) return 'DD'
  return 'FF'
}

/**
 * Harf notunun GANO katsayısını döndürür.
 */
export const getGradeCoefficient = (letterGrade) => {
  switch (letterGrade) {
    case 'AA': return 4.0
    case 'BA': return 3.5
    case 'BB': return 3.0
    case 'CB': return 2.5
    case 'CC': return 2.0
    case 'DC': return 1.5
    case 'DD': return 1.0
    default: return 0.0
  }
}

/**
 * Mevcut ders notlarına göre dönem GANO'sunu hesaplar.
 * Sadece açıklanmış (final notu girilmiş) dersleri hesaba katar.
 */
export const calculateGano = (grades) => {
  if (!grades || grades.length === 0) return 0

  let totalWeightedPoints = 0
  let totalAkts = 0

  grades.forEach((g) => {
    // Final notu açıklanmamışsa hesaba katma
    if (g.final === null || g.final === undefined || g.final === 'Açıklanmadı') return

    const score = calculateScore(g.midterm || g.vize, g.final, g.proje ?? g.project)
    const letter = getLetterGrade(score)
    const coeff = getGradeCoefficient(letter)
    const courseEcts = Number(g.ects || g.akts || 0)
    totalWeightedPoints += coeff * courseEcts
    totalAkts += courseEcts
  })

  return totalAkts > 0 ? Number((totalWeightedPoints / totalAkts).toFixed(2)) : 0
}

/**
 * GANO robotu simülasyonu yapar.
 * Seçilen dersin notunu hedef notla değiştirip tahmini GANO'yu hesapla.
 * Açıklanmamış dersler de simülasyona dahil edilebilir.
 */
export const simulateGano = (grades, courseCode, targetScore) => {
  if (!grades || grades.length === 0) return 0

  const baselineAkts = 187 // Önceki dönemlerden gelen tahmini AKTS
  const baselineWeightedPoints = 187 * 3.41 // Önceki dönemlerden gelen katsayı ağırlığı

  let currentSemesterWeighted = 0
  let currentSemesterAkts = 0

  grades.forEach((g) => {
    let score = 0
    let hasGrade = false

    if (g.courseCode === courseCode) {
      score = Number(targetScore)
      hasGrade = true
    } else if (g.final !== null && g.final !== undefined && g.final !== 'Açıklanmadı') {
      score = calculateScore(g.midterm || g.vize, g.final, g.proje ?? g.project)
      hasGrade = true
    }

    if (hasGrade) {
      const letter = getLetterGrade(score)
      const coeff = getGradeCoefficient(letter)
      const courseEcts = Number(g.ects || g.akts || 0)
      currentSemesterWeighted += coeff * courseEcts
      currentSemesterAkts += courseEcts
    }
  })

  const totalAkts = baselineAkts + currentSemesterAkts
  const totalWeighted = baselineWeightedPoints + currentSemesterWeighted

  return Number((totalWeighted / totalAkts).toFixed(2))
}

/**
 * Toplam tamamlanan AKTS miktarını hesaplar.
 */
export const calculateTotalAkts = (enrolledCourses) => {
  if (!enrolledCourses) return 0
  return enrolledCourses.reduce((sum, course) => sum + (Number(course.akts) || 0), 0)
}

/**
 * Devamsızlık yüzdesini hesaplar.
 */
export const calculateAttendancePercent = (attendedHours, totalHours) => {
  const total = Number(totalHours) || 0
  const attended = Number(attendedHours) || 0
  if (total === 0) return 0
  return Math.round((attended / total) * 100)
}

/**
 * Harf notuna karşılık gelen Tailwind CSS sınıfını döndürür.
 * Grades.jsx ve benzeri sayfalarda badge renklendirmesi için kullanılır.
 */
export const getLetterBadgeStyle = (letter) => {
  if (!letter || letter === 'Açıklanmadı') {
    return 'bg-amber-50/65 text-amber-600 dark:bg-amber-950/20 dark:text-amber-400 border border-amber-100/60 dark:border-amber-900/30'
  }
  switch (letter.toUpperCase()) {
    case 'AA':
    case 'BA':
      return 'bg-emerald-50 text-emerald-600 dark:bg-emerald-950/20 dark:text-emerald-400 border border-emerald-100 dark:border-emerald-900/30 font-bold'
    case 'BB':
    case 'CB':
      return 'bg-blue-50 text-blue-600 dark:bg-blue-950/20 dark:text-blue-400 border border-blue-100 dark:border-blue-900/30 font-bold'
    case 'CC':
    case 'DC':
      return 'bg-slate-100/60 text-slate-700 dark:bg-slate-800 dark:text-slate-350 border border-slate-200/50 dark:border-slate-700/60 font-semibold'
    case 'DD':
    case 'FF':
      return 'bg-red-50 text-red-600 dark:bg-red-950/20 dark:text-red-400 border border-red-100 dark:border-red-900/30 font-bold'
    default:
      return 'bg-slate-50 text-slate-600'
  }
}

/**
 * Sistemin baz alacağı referans bugün tarihini döndürür (12.06.2026).
 */
export const getSystemToday = () => {
  return new Date(2026, 5, 12)
}

/**
 * Bugünün Türkçe gün adını döndürür.
 * Dashboard ve Calendar sayfalarında tekrar tanımlanmaz.
 */
export const getDayNameTurkish = () => {
  const days = ['Pazar', 'Pazartesi', 'Salı', 'Çarşamba', 'Perşembe', 'Cuma', 'Cumartesi']
  return days[getSystemToday().getDay()]
}

/**
 * JavaScript getDay() indeksine karşılık gelen İngilizce gün anahtar kelimesini döndürür.
 * Ders programı nesnesindeki monday/tuesday/... anahtarlarıyla eşleştirir.
 */
export const getDayKeyEnglish = () => {
  const days = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday']
  return days[getSystemToday().getDay()]
}
