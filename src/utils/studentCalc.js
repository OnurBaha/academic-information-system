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
    if (g.final === null || g.final === undefined) return

    const score = calculateScore(g.vize, g.final, g.proje)
    const letter = getLetterGrade(score)
    const coeff = getGradeCoefficient(letter)
    totalWeightedPoints += coeff * Number(g.akts)
    totalAkts += Number(g.akts)
  })

  return totalAkts > 0 ? Number((totalWeightedPoints / totalAkts).toFixed(2)) : 0
}

/**
 * GANO robotu simülasyonu yapar.
 * Seçilen dersin notunu hedef notla değiştirip tahmini GANO'yu hesaplar.
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
    } else if (g.final !== null && g.final !== undefined) {
      score = calculateScore(g.vize, g.final, g.proje)
      hasGrade = true
    }

    if (hasGrade) {
      const letter = getLetterGrade(score)
      const coeff = getGradeCoefficient(letter)
      currentSemesterWeighted += coeff * Number(g.akts)
      currentSemesterAkts += Number(g.akts)
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
