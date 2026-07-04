import { useState, useEffect } from 'react'

export default function Calendar() {
  const [selectedDay, setSelectedDay] = useState(13) // Varsayılan seçili gün Çarşamba (13 Mayıs 2026)
  const [weeklyLessonsByWeek, setWeeklyLessonsByWeek] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('http://localhost:3001/weeklyLessonsByWeek')
      .then(res => res.json())
      .then(data => {
        setWeeklyLessonsByWeek(data)
        setLoading(false)
      })
      .catch(err => {
        console.error('Error fetching calendar', err)
        setLoading(false)
      })
  }, [])

  const getWeekdayIndex = (day) => {
    // 1 Mayıs 2026 Cuma günüdür (indeks 5)
    // Nisan ayından kalan dolgu günleri (27, 28, 29, 30):
    if (day === 27) return 1 // Pzt
    if (day === 28) return 2 // Sal
    if (day === 29) return 3 // Çar
    if (day === 30) return 4 // Per
    
    const index = (day - 1 + 5) % 7
    return index // 1: Pzt, 2: Sal, 3: Çar, 4: Per, 5: Cum, 6: Cmt, 0: Paz
  }

  const getWeekIndex = (day) => {
    if (day === 27 || day === 28 || day === 29 || day === 30) return 1
    if (day <= 3) return 1
    if (day >= 4 && day <= 10) return 2
    if (day >= 11 && day <= 17) return 3
    if (day >= 18 && day <= 24) return 4
    return 5
  }

  const selectedWeekday = getWeekdayIndex(selectedDay)
  const weekIndex = getWeekIndex(selectedDay)

  const isMondayActive = selectedWeekday === 1
  const isTuesdayActive = selectedWeekday === 2
  const isWednesdayActive = selectedWeekday === 3
  const isThursdayActive = selectedWeekday === 4
  const isFridayActive = selectedWeekday === 5

  const getSelectedDaySchedule = () => {
    if (!weeklyLessonsByWeek) return []
    const dayOfWeek = getWeekdayIndex(selectedDay)
    const currentWeekLessons = weeklyLessonsByWeek[weekIndex] || {}
    if (dayOfWeek === 1) return currentWeekLessons.monday || []
    if (dayOfWeek === 2) return currentWeekLessons.tuesday || []
    if (dayOfWeek === 3) return currentWeekLessons.wednesday || []
    if (dayOfWeek === 4) return currentWeekLessons.thursday || []
    if (dayOfWeek === 5) return currentWeekLessons.friday || []
    return []
  }

  const selectedDaySchedule = getSelectedDaySchedule()

  const getDayLabelString = () => {
    if (selectedDay === 27) return '27 Nisan'
    if (selectedDay === 28) return '28 Nisan'
    if (selectedDay === 29) return '29 Nisan'
    if (selectedDay === 30) return '30 Nisan'
    return `${selectedDay} Mayıs`
  }

  // Mini takvim verileri — Nisan dolgusu + Mayıs 2026 günleri
  // Nisan 2026: 30 gün. 1 Mayıs = Cuma. Hafta Pazartesi başlar.
  // Mini takvim haftaları:
  //  Week 1: Mon 27Apr Tue 28Apr Wed 29Apr Thu 30Apr Fri 1May Sat 2May Sun 3May
  //  Week 2: Mon 4May  Tue 5May  Wed 6May  Thu 7May  Fri 8May  Sat 9May  Sun 10May
  //  Week 3: Mon 11May Tue 12May Wed 13May Thu 14May Fri 15May Sat 16May Sun 17May
  //  Week 4: Mon 18May Tue 19May Wed 20May Thu 21May Fri 22May Sat 23May Sun 24May
  //  Week 5: Mon 25May Tue 26May Wed 27May Thu 28May Fri 29May Sat 30May Sun 31May
  const miniCalendarWeeks = [
    [
      { day: 27, month: 'Nis', key: 27, isApril: true },
      { day: 28, month: 'Nis', key: 28, isApril: true },
      { day: 29, month: 'Nis', key: 29, isApril: true },
      { day: 30, month: 'Nis', key: 30, isApril: true },
      { day: 1,  month: 'May', key: 1,  isApril: false },
      { day: 2,  month: 'May', key: 2,  isApril: false, isWeekend: true },
      { day: 3,  month: 'May', key: 3,  isApril: false, isWeekend: true }
    ],
    [
      { day: 4,  month: 'May', key: 4,  isApril: false },
      { day: 5,  month: 'May', key: 5,  isApril: false },
      { day: 6,  month: 'May', key: 6,  isApril: false },
      { day: 7,  month: 'May', key: 7,  isApril: false },
      { day: 8,  month: 'May', key: 8,  isApril: false },
      { day: 9,  month: 'May', key: 9,  isApril: false, isWeekend: true },
      { day: 10, month: 'May', key: 10, isApril: false, isWeekend: true }
    ],
    [
      { day: 11, month: 'May', key: 11, isApril: false },
      { day: 12, month: 'May', key: 12, isApril: false },
      { day: 13, month: 'May', key: 13, isApril: false },
      { day: 14, month: 'May', key: 14, isApril: false },
      { day: 15, month: 'May', key: 15, isApril: false },
      { day: 16, month: 'May', key: 16, isApril: false, isWeekend: true },
      { day: 17, month: 'May', key: 17, isApril: false, isWeekend: true }
    ],
    [
      { day: 18, month: 'May', key: 18, isApril: false },
      { day: 19, month: 'May', key: 19, isApril: false },
      { day: 20, month: 'May', key: 20, isApril: false },
      { day: 21, month: 'May', key: 21, isApril: false },
      { day: 22, month: 'May', key: 22, isApril: false },
      { day: 23, month: 'May', key: 23, isApril: false, isWeekend: true },
      { day: 24, month: 'May', key: 24, isApril: false, isWeekend: true }
    ],
    [
      { day: 25, month: 'May', key: 25, isApril: false },
      { day: 26, month: 'May', key: 26, isApril: false },
      { day: 27, month: 'May', key: 'may27', isApril: false },
      { day: 28, month: 'May', key: 28, isApril: false },
      { day: 29, month: 'May', key: 29, isApril: false },
      { day: 30, month: 'May', key: 30, isApril: false, isWeekend: true },
      { day: 31, month: 'May', key: 31, isApril: false, isWeekend: true }
    ]
  ]

  // Mini takvim hücresini seçili gün değerine eşleme
  const getDayKey = (cell) => {
    if (cell.isApril) return cell.day // Nisan günleri: 27,28,29,30
    if (cell.key === 'may27') return 27 // Mayıs 27 ve Nisan 27 çakışmasını önlemek için ayırt etme
    return cell.day
  }

  const isSelectedCell = (cell) => {
    if (cell.isApril) return selectedDay === cell.day && weekIndex === 1
    if (cell.key === 'may27') return selectedDay === 27 && weekIndex === 5
    return selectedDay === cell.day && !cell.isApril
  }

  const handleMiniCalClick = (cell) => {
    if (cell.isWeekend) return
    if (cell.isApril) { setSelectedDay(cell.day); return }
    if (cell.key === 'may27') { setSelectedDay(27); return }
    setSelectedDay(cell.day)
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-900"></div>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-6 p-6 max-w-[1440px] mx-auto w-full calendar-page-canvas animate-fade-in">
      
      {/* Sayfa Başlığı */}
      <div className="flex items-start gap-4 border-b border-slate-100 dark:border-slate-800 pb-5">
        <div>
          <h2 className="text-xl font-bold text-slate-800 dark:text-white flex items-center gap-2">
            <span className="material-symbols-outlined text-secondary text-2xl">view_week</span>
            <span>Haftalık Ders Programı</span>
          </h2>
          <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">2025-2026 Bahar Dönemi — gün seçmek için sağdaki takvimi veya kolon başlıklarını kullanın.</p>
        </div>
      </div>

      {/* Satır: Haftalık Ders Programı (Sol) + Mini Takvim (Sağ) */}
      <div className="flex gap-5 items-start">

        {/* Haftalık Ders Programı */}
        <div className="flex-1 min-w-0">
        <div className="glass-card rounded-3xl overflow-hidden shadow-sm">
          
          {/* Haftalık Başlık Günleri (Pazartesi - Cuma, aktif günü seçmek için tıklanabilir) */}
          <div className="grid grid-cols-[80px_1fr_1fr_1fr_1fr_1fr] bg-table-header border-b border-outline-variant/30 py-4 text-center">
            <div className="font-label-sm text-on-surface-variant flex items-center justify-center font-bold">SAAT</div>
            
            <button 
              onClick={() => {
                if (weekIndex === 1) setSelectedDay(27)
                else if (weekIndex === 2) setSelectedDay(4)
                else if (weekIndex === 3) setSelectedDay(11)
                else if (weekIndex === 4) setSelectedDay(18)
                else if (weekIndex === 5) setSelectedDay(25)
              }}
              className={`font-label-md transition-all duration-300 border-none bg-transparent cursor-pointer flex flex-col items-center justify-center gap-0.5 ${
                isMondayActive ? 'text-secondary font-extrabold scale-105' : 'text-primary dark:text-slate-300 hover:opacity-80'
              }`}
            >
              <span>Pazartesi</span>
              <span className="text-[10px] opacity-70">
                {weekIndex === 1 && '27'}
                {weekIndex === 2 && '4'}
                {weekIndex === 3 && '11'}
                {weekIndex === 4 && '18'}
                {weekIndex === 5 && '25'}
              </span>
            </button>

            <button 
              onClick={() => {
                if (weekIndex === 1) setSelectedDay(28)
                else if (weekIndex === 2) setSelectedDay(5)
                else if (weekIndex === 3) setSelectedDay(12)
                else if (weekIndex === 4) setSelectedDay(19)
                else if (weekIndex === 5) setSelectedDay(26)
              }}
              className={`font-label-md transition-all duration-300 border-none bg-transparent cursor-pointer flex flex-col items-center justify-center gap-0.5 ${
                isTuesdayActive ? 'text-secondary font-extrabold scale-105' : 'text-primary dark:text-slate-300 hover:opacity-80'
              }`}
            >
              <span>Salı</span>
              <span className="text-[10px] opacity-70">
                {weekIndex === 1 && '28'}
                {weekIndex === 2 && '5'}
                {weekIndex === 3 && '12'}
                {weekIndex === 4 && '19'}
                {weekIndex === 5 && '26'}
              </span>
            </button>

            <button 
              onClick={() => {
                if (weekIndex === 1) setSelectedDay(29)
                else if (weekIndex === 2) setSelectedDay(6)
                else if (weekIndex === 3) setSelectedDay(13)
                else if (weekIndex === 4) setSelectedDay(20)
                else if (weekIndex === 5) setSelectedDay(27)
              }}
              className={`font-label-md transition-all duration-300 border-none bg-transparent cursor-pointer flex flex-col items-center justify-center gap-0.5 ${
                isWednesdayActive ? 'text-secondary font-extrabold scale-105' : 'text-primary dark:text-slate-300 hover:opacity-80'
              }`}
            >
              <span>Çarşamba</span>
              <span className="text-[10px] opacity-70">
                {weekIndex === 1 && '29'}
                {weekIndex === 2 && '6'}
                {weekIndex === 3 && '13'}
                {weekIndex === 4 && '20'}
                {weekIndex === 5 && '27'}
              </span>
            </button>

            <button 
              onClick={() => {
                if (weekIndex === 1) setSelectedDay(30)
                else if (weekIndex === 2) setSelectedDay(7)
                else if (weekIndex === 3) setSelectedDay(14)
                else if (weekIndex === 4) setSelectedDay(21)
                else if (weekIndex === 5) setSelectedDay(28)
              }}
              className={`font-label-md transition-all duration-300 border-none bg-transparent cursor-pointer flex flex-col items-center justify-center gap-0.5 hover:opacity-80 ${
                isThursdayActive ? 'text-secondary font-extrabold scale-105' : 'text-primary dark:text-slate-300'
              }`}
            >
              <span>Perşembe</span>
              <span className="text-[10px] opacity-70">
                {weekIndex === 1 && '30'}
                {weekIndex === 2 && '7'}
                {weekIndex === 3 && '14'}
                {weekIndex === 4 && '21'}
                {weekIndex === 5 && '28'}
              </span>
            </button>

            <button 
              onClick={() => {
                if (weekIndex === 1) setSelectedDay(1)
                else if (weekIndex === 2) setSelectedDay(8)
                else if (weekIndex === 3) setSelectedDay(15)
                else if (weekIndex === 4) setSelectedDay(22)
                else if (weekIndex === 5) setSelectedDay(29)
              }}
              className={`font-label-md transition-all duration-300 border-none bg-transparent cursor-pointer flex flex-col items-center justify-center gap-0.5 ${
                isFridayActive ? 'text-secondary font-extrabold scale-105' : 'text-primary dark:text-slate-300 hover:opacity-80'
              }`}
            >
              <span>Cuma</span>
              <span className="text-[10px] opacity-70">
                {weekIndex === 1 && '1'}
                {weekIndex === 2 && '8'}
                {weekIndex === 3 && '15'}
                {weekIndex === 4 && '22'}
                {weekIndex === 5 && '29'}
              </span>
            </button>
          </div>

          {/* Izgara Gövdesi */}
          <div className="schedule-grid relative">
            
            {/* Saat Satırları */}
            {['09:00', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00', '17:00'].map((hour, idx) => (
              <div key={idx} className="contents">
                <div className="border-r border-outline-variant/20 flex items-center justify-center font-label-sm text-outline">
                  {hour}
                </div>
                <div className="border-r border-outline-variant/10 border-b"></div>
                <div className="border-r border-outline-variant/10 border-b"></div>
                <div className="border-r border-outline-variant/10 border-b"></div>
                <div className="border-r border-outline-variant/10 border-b"></div>
                <div className="border-b border-outline-variant/10"></div>
              </div>
            ))}

            {/* Seçili gün için dikey vurgu katmanı */}
            {selectedWeekday >= 1 && selectedWeekday <= 5 && (
              <div 
                className="absolute top-0 bottom-0 bg-secondary/5 border-l border-r border-secondary/20 pointer-events-none transition-all duration-500 ease-out"
                style={{
                  left: `calc(80px + ((100% - 80px) / 5) * ${selectedWeekday - 1})`,
                  width: `calc((100% - 80px) / 5)`
                }}
              />
            )}

            {/* Pazartesi Ders Gösterimi */}
            {(weeklyLessonsByWeek[weekIndex]?.monday || []).map((course, idx) => (
              <div 
                key={`mon-${idx}`}
                className={`absolute w-[calc((100%-80px)/5)] p-2 transition-all duration-300 ${isMondayActive ? 'z-10 scale-[1.01]' : 'opacity-85 z-0'}`}
                style={{
                  top: `${course.top}px`,
                  left: '80px',
                  height: `${course.height}px`
                }}
                onClick={() => {
                  if (weekIndex === 1) setSelectedDay(27)
                  else if (weekIndex === 2) setSelectedDay(4)
                  else if (weekIndex === 3) setSelectedDay(11)
                  else if (weekIndex === 4) setSelectedDay(18)
                  else if (weekIndex === 5) setSelectedDay(25)
                }}
              >
                <div className={`w-full h-full course-card-inner course-card-${course.color} ${isMondayActive ? 'active' : ''} rounded-lg p-3 flex flex-col gap-1 shadow-sm transition-transform hover:scale-[1.02] cursor-pointer`}>
                  <span className={`font-label-sm text-${course.color} uppercase tracking-wider`}>{course.type}</span>
                  <h4 className={`font-title-lg text-${course.color} text-[14px] leading-tight font-bold`}>{course.name}</h4>
                  <p className="text-[11px] text-on-surface-variant font-medium mt-auto flex items-center gap-1">
                    <span className="material-symbols-outlined text-[13px]">person</span>
                    <span>{course.instructor}</span>
                  </p>
                  <p className="text-[11px] text-on-surface-variant font-medium flex items-center gap-1">
                    <span className="material-symbols-outlined text-[13px]">meeting_room</span>
                    <span>{course.room}</span>
                  </p>
                </div>
              </div>
            ))}

            {/* Salı Ders Gösterimi */}
            {(weeklyLessonsByWeek[weekIndex]?.tuesday || []).map((course, idx) => (
              <div 
                key={`tue-${idx}`}
                className={`absolute w-[calc((100%-80px)/5)] p-2 transition-all duration-300 ${isTuesdayActive ? 'z-10 scale-[1.01]' : 'opacity-85 z-0'}`}
                style={{
                  top: `${course.top}px`,
                  left: 'calc(80px + ((100% - 80px) / 5) * 1)',
                  height: `${course.height}px`
                }}
                onClick={() => {
                  if (weekIndex === 1) setSelectedDay(28)
                  else if (weekIndex === 2) setSelectedDay(5)
                  else if (weekIndex === 3) setSelectedDay(12)
                  else if (weekIndex === 4) setSelectedDay(19)
                  else if (weekIndex === 5) setSelectedDay(26)
                }}
              >
                <div className={`w-full h-full course-card-inner course-card-${course.color} ${isTuesdayActive ? 'active' : ''} rounded-lg p-3 flex flex-col gap-1 shadow-sm transition-transform hover:scale-[1.02] cursor-pointer`}>
                  <span className={`font-label-sm text-${course.color} uppercase tracking-wider`}>{course.type}</span>
                  <h4 className={`font-title-lg text-${course.color} text-[14px] leading-tight font-bold`}>{course.name}</h4>
                  <p className="text-[11px] text-on-surface-variant font-medium mt-auto flex items-center gap-1">
                    <span className="material-symbols-outlined text-[13px]">person</span>
                    <span>{course.instructor}</span>
                  </p>
                  <p className="text-[11px] text-on-surface-variant font-medium flex items-center gap-1">
                    <span className="material-symbols-outlined text-[13px]">meeting_room</span>
                    <span>{course.room}</span>
                  </p>
                </div>
              </div>
            ))}

            {/* Çarşamba Ders Gösterimi */}
            {(weeklyLessonsByWeek[weekIndex]?.wednesday || []).map((course, idx) => (
              <div 
                key={`wed-${idx}`}
                className={`absolute w-[calc((100%-80px)/5)] p-2 transition-all duration-300 ${isWednesdayActive ? 'z-10 scale-[1.01]' : 'opacity-85 z-0'}`}
                style={{
                  top: `${course.top}px`,
                  left: 'calc(80px + ((100% - 80px) / 5) * 2)',
                  height: `${course.height}px`
                }}
                onClick={() => {
                  if (weekIndex === 1) setSelectedDay(29)
                  else if (weekIndex === 2) setSelectedDay(6)
                  else if (weekIndex === 3) setSelectedDay(13)
                  else if (weekIndex === 4) setSelectedDay(20)
                  else if (weekIndex === 5) setSelectedDay(27)
                }}
              >
                <div className={`w-full h-full course-card-inner course-card-${course.color} ${isWednesdayActive ? 'active' : ''} rounded-lg p-3 flex flex-col gap-1 shadow-sm transition-transform hover:scale-[1.02] cursor-pointer`}>
                  <span className={`font-label-sm text-${course.color} uppercase tracking-wider`}>{course.type}</span>
                  <h4 className={`font-title-lg text-${course.color} text-[14px] leading-tight font-bold`}>{course.name}</h4>
                  <p className="text-[11px] text-on-surface-variant font-medium mt-auto flex items-center gap-1">
                    <span className="material-symbols-outlined text-[13px]">person</span>
                    <span>{course.instructor}</span>
                  </p>
                  <p className="text-[11px] text-on-surface-variant font-medium flex items-center gap-1">
                    <span className="material-symbols-outlined text-[13px]">meeting_room</span>
                    <span>{course.room}</span>
                  </p>
                </div>
              </div>
            ))}

            {/* Perşembe Ders Gösterimi */}
            {(weeklyLessonsByWeek[weekIndex]?.thursday || []).map((course, idx) => (
              <div 
                key={`thu-${idx}`}
                className={`absolute w-[calc((100%-80px)/5)] p-2 transition-all duration-300 ${isThursdayActive ? 'z-10 scale-[1.01]' : 'opacity-85 z-0'}`}
                style={{
                  top: `${course.top}px`,
                  left: 'calc(80px + ((100% - 80px) / 5) * 3)',
                  height: `${course.height}px`
                }}
                onClick={() => {
                  if (weekIndex === 1) setSelectedDay(30)
                  else if (weekIndex === 2) setSelectedDay(7)
                  else if (weekIndex === 3) setSelectedDay(14)
                  else if (weekIndex === 4) setSelectedDay(21)
                  else if (weekIndex === 5) setSelectedDay(28)
                }}
              >
                <div className={`w-full h-full course-card-inner course-card-${course.color} ${isThursdayActive ? 'active' : ''} rounded-lg p-3 flex flex-col gap-1 shadow-sm transition-transform hover:scale-[1.02] cursor-pointer`}>
                  <span className={`font-label-sm text-${course.color} uppercase tracking-wider`}>{course.type}</span>
                  <h4 className={`font-title-lg text-${course.color} text-[14px] leading-tight font-bold`}>{course.name}</h4>
                  <p className="text-[11px] text-on-surface-variant font-medium mt-auto flex items-center gap-1">
                    <span className="material-symbols-outlined text-[13px]">person</span>
                    <span>{course.instructor}</span>
                  </p>
                  <p className="text-[11px] text-on-surface-variant font-medium flex items-center gap-1">
                    <span className="material-symbols-outlined text-[13px]">meeting_room</span>
                    <span>{course.room}</span>
                  </p>
                </div>
              </div>
            ))}

            {/* Cuma Ders Gösterimi */}
            {(weeklyLessonsByWeek[weekIndex]?.friday || []).map((course, idx) => (
              <div 
                key={`fri-${idx}`}
                className={`absolute w-[calc((100%-80px)/5)] p-2 transition-all duration-300 ${isFridayActive ? 'z-10 scale-[1.01]' : 'opacity-85 z-0'}`}
                style={{
                  top: `${course.top}px`,
                  left: 'calc(80px + ((100% - 80px) / 5) * 4)',
                  height: `${course.height}px`
                }}
                onClick={() => {
                  if (weekIndex === 1) setSelectedDay(1)
                  else if (weekIndex === 2) setSelectedDay(8)
                  else if (weekIndex === 3) setSelectedDay(15)
                  else if (weekIndex === 4) setSelectedDay(22)
                  else if (weekIndex === 5) setSelectedDay(29)
                }}
              >
                <div className={`w-full h-full course-card-inner course-card-${course.color} ${isFridayActive ? 'active' : ''} rounded-lg p-3 flex flex-col gap-1 shadow-sm transition-transform hover:scale-[1.02] cursor-pointer`}>
                  <span className={`font-label-sm text-${course.color} uppercase tracking-wider`}>{course.type}</span>
                  <h4 className={`font-title-lg text-${course.color} text-[14px] leading-tight font-bold`}>{course.name}</h4>
                  <p className="text-[11px] text-on-surface-variant font-medium mt-auto flex items-center gap-1">
                    <span className="material-symbols-outlined text-[13px]">person</span>
                    <span>{course.instructor}</span>
                  </p>
                  <p className="text-[11px] text-on-surface-variant font-medium flex items-center gap-1">
                    <span className="material-symbols-outlined text-[13px]">meeting_room</span>
                    <span>{course.room}</span>
                  </p>
                </div>
              </div>
            ))}

          </div>
        </div>
        </div>
        {/* ── Mini Takvim ── Haftalık ders programının sağında ── */}
        <div className="w-64 shrink-0 bg-white dark:bg-[#111827] rounded-3xl p-5 shadow-sm border border-outline-variant/30 flex flex-col gap-4 sticky top-6">

          {/* Başlık */}
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-extrabold text-slate-800 dark:text-white flex items-center gap-2">
              <span className="material-symbols-outlined text-secondary text-lg">calendar_month</span>
              <span>Nis – May 2026</span>
            </h3>
            <span className="text-[10px] font-bold text-secondary bg-secondary/10 px-2 py-0.5 rounded-lg">{weekIndex}. Hafta</span>
          </div>

          {/* Gün etiketleri */}
          <div className="grid grid-cols-7 text-center">
            {['Pzt','Sal','Çar','Per','Cum','Cmt','Paz'].map((d,i)=>(
              <div key={d} className={`text-[9px] font-extrabold uppercase tracking-wider py-1 ${i>=5?'text-slate-300 dark:text-slate-600':'text-slate-400 dark:text-slate-500'}`}>{d}</div>
            ))}
          </div>

          {/* Hafta satırları */}
          <div className="flex flex-col gap-1">
            {miniCalendarWeeks.map((week, rowIdx) => {
              const isActiveWeek = weekIndex === rowIdx + 1
              return (
                <div key={rowIdx} className={`grid grid-cols-7 rounded-xl transition-all duration-200 ${isActiveWeek?'bg-secondary/5 ring-1 ring-secondary/20':''}`}>
                  {week.map((cell, colIdx) => {
                    const sel = isSelectedCell(cell)
                    return (
                      <button
                        key={colIdx}
                        onClick={() => handleMiniCalClick(cell)}
                        disabled={cell.isWeekend}
                        title={cell.isWeekend ? 'Hafta sonu' : `${cell.day} ${cell.month} 2026`}
                        className={`w-full aspect-square flex flex-col items-center justify-center rounded-lg text-[11px] font-bold transition-all duration-150 border-none ${
                          cell.isWeekend
                            ? 'opacity-25 cursor-not-allowed text-slate-400 dark:text-slate-600 bg-transparent'
                            : sel
                            ? 'bg-secondary text-white shadow-md scale-105 cursor-pointer'
                            : cell.isApril
                            ? 'text-slate-300 dark:text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer'
                            : 'text-slate-700 dark:text-slate-300 hover:bg-secondary/10 hover:text-secondary cursor-pointer'
                        }`}
                      >
                        {cell.day}
                      </button>
                    )
                  })}
                </div>
              )
            })}
          </div>

          {/* Hafta açıklamaları */}
          <div className="border-t border-slate-100 dark:border-slate-800 pt-3 flex flex-col gap-1">
            <p className="text-[9px] font-extrabold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-1">Hafta Özeti</p>
            {[
              { w:1, label:'Nis 27 – May 3',  exam:false },
              { w:2, label:'4 – 10 Mayıs',    exam:false },
              { w:3, label:'11 – 17 Mayıs',   exam:false },
              { w:4, label:'18 – 24 Mayıs',   exam:true  },
              { w:5, label:'25 – 31 Mayıs',   exam:false }
            ].map(row=>(
              <div key={row.w}
                onClick={()=>{ if(row.w===1)setSelectedDay(29); else if(row.w===2)setSelectedDay(6); else if(row.w===3)setSelectedDay(13); else if(row.w===4)setSelectedDay(20); else setSelectedDay(25) }}
                className={`flex items-center justify-between py-1 px-2 rounded-lg cursor-pointer transition-all ${weekIndex===row.w?'bg-secondary/10':'hover:bg-slate-50 dark:hover:bg-slate-800'}`}>
                <span className={`text-[10px] font-bold ${weekIndex===row.w?'text-secondary':'text-slate-500 dark:text-slate-400'}`}>{row.w}. Hafta — {row.label}</span>
                {row.exam && <span className="text-[9px] text-red-400 font-extrabold">Vize</span>}
              </div>
            ))}
          </div>
        </div>{/* end Mini Calendar */}

      </div>{/* end ROW: grid + mini cal */}

      {/* Günlük Ders Akışı */}
      <div className="bg-white dark:bg-[#111827] rounded-3xl p-6 shadow-sm border border-outline-variant/30 transition-all duration-300">
        <div className="flex justify-between items-center mb-4 border-b border-slate-100 dark:border-slate-800 pb-3">
          <h3 className="font-title-lg text-title-lg text-primary dark:text-white flex items-center gap-2">
            <span className="material-symbols-outlined text-secondary">schedule</span>
            <span>{getDayLabelString()} 2026 Günlük Ders Akışı</span>
          </h3>
          <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">
            {selectedWeekday===1&&'Pazartesi'}{selectedWeekday===2&&'Salı'}{selectedWeekday===3&&'Çarşamba'}
            {selectedWeekday===4&&'Perşembe'}{selectedWeekday===5&&'Cuma'}
            {(selectedWeekday===0||selectedWeekday===6)&&'Hafta Sonu'}
          </span>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {selectedDaySchedule.length === 0 ? (
            <div className="col-span-2 text-center py-6 text-slate-400 dark:text-slate-500 text-xs flex flex-col items-center justify-center gap-2">
              <span className="material-symbols-outlined text-3xl">event_busy</span>
              <span>Bu tarihe ait kayıtlı dersiniz bulunmamaktadır.</span>
            </div>
          ) : (
            selectedDaySchedule.map((course, idx) => {
              let borderCol = 'border-secondary bg-secondary/5 text-secondary'
              if (course.color==='success-emerald') borderCol='border-success-emerald bg-success-emerald/5 text-success-emerald'
              if (course.color==='warning-amber')   borderCol='border-warning-amber bg-warning-amber/5 text-warning-amber'
              if (course.color==='error')            borderCol='border-error bg-error/5 text-error'
              if (course.color==='primary')          borderCol='border-primary bg-primary/5 text-primary'
              return (
                <div key={idx} className={`p-4 border-l-4 rounded-r-xl border border-slate-100 dark:border-slate-800 flex flex-col gap-2 ${borderCol}`}>
                  <div className="flex justify-between items-center">
                    <span className="text-[10px] font-extrabold uppercase tracking-widest">{course.type}</span>
                    <strong className="text-xs font-bold">{course.time}</strong>
                  </div>
                  <h4 className="text-sm font-bold text-slate-800 dark:text-slate-200">{course.name}</h4>
                  <div className="flex justify-between items-center text-[11px] text-slate-500 dark:text-slate-400 mt-2">
                    <span className="flex items-center gap-1"><span className="material-symbols-outlined text-xs">person</span>{course.instructor}</span>
                    <span className="flex items-center gap-1"><span className="material-symbols-outlined text-xs">meeting_room</span>{course.room}</span>
                  </div>
                </div>
              )
            })
          )}
        </div>
      </div>

    </div>
  )
}

