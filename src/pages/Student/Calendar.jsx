import { useState, useEffect } from 'react'
import { miniCalendarWeeks } from '../../store/student/studentData'

export default function Calendar() {
  const [selectedDay, setSelectedDay] = useState({ day: 12, month: 'Haz' }) // Varsayılan seçili gün Cuma (12 Haziran 2026)
  const [weeklyLessonsByWeek, setWeeklyLessonsByWeek] = useState(null)
  const [loading, setLoading] = useState(true)

  const [schedules, setSchedules] = useState([])

  useEffect(() => {
    Promise.all([
      fetch('http://localhost:3001/weeklyLessonsByWeek').then(res => res.json()),
      fetch('http://localhost:3001/schedules?status=approved').then(res => res.json())
    ])
      .then(([lessonsData, schedulesData]) => {
        setWeeklyLessonsByWeek(lessonsData)
        setSchedules(schedulesData)
        setLoading(false)
      })
      .catch(err => {
        console.error('Error fetching calendar data', err)
        setLoading(false)
      })
  }, [])

  const getWeekdayIndex = (day, month) => {
    const mIdx = month === 'May' ? 4 : 5
    const date = new Date(2026, mIdx, day)
    return date.getDay() === 0 ? 7 : date.getDay()
  }

  const getWeekIndex = (day, month) => {
    const idx = miniCalendarWeeks.findIndex(week =>
      week.some(cell => cell.day === day && cell.month === month)
    )
    return idx !== -1 ? idx + 1 : 1
  }

  const getWeekdayDayNum = (dayIndex, wIdx) => {
    const week = miniCalendarWeeks[wIdx - 1]
    if (!week) return { day: 12, month: 'Haz' }
    const cell = week[dayIndex - 1]
    return { day: cell.day, month: cell.month }
  }

  const selectedWeekday = getWeekdayIndex(selectedDay.day, selectedDay.month)
  const weekIndex = getWeekIndex(selectedDay.day, selectedDay.month)

  const isMondayActive = selectedWeekday === 1
  const isTuesdayActive = selectedWeekday === 2
  const isWednesdayActive = selectedWeekday === 3
  const isThursdayActive = selectedWeekday === 4
  const isFridayActive = selectedWeekday === 5

  // FAZ 7.2 — schedules (dekan onaylı ders planları) ile haftalık programı birleştir
  const getSelectedDaySchedule = () => {
    if (!weeklyLessonsByWeek) return []
    const dayOfWeek = getWeekdayIndex(selectedDay.day, selectedDay.month)
    const currentWeekLessons = weeklyLessonsByWeek[weekIndex] || {}
    let dayLessons = []
    
    if (dayOfWeek === 1) dayLessons = [...(currentWeekLessons.monday || [])]
    else if (dayOfWeek === 2) dayLessons = [...(currentWeekLessons.tuesday || [])]
    else if (dayOfWeek === 3) dayLessons = [...(currentWeekLessons.wednesday || [])]
    else if (dayOfWeek === 4) dayLessons = [...(currentWeekLessons.thursday || [])]
    else if (dayOfWeek === 5) dayLessons = [...(currentWeekLessons.friday || [])]

    // Bu güne denk gelen onaylı dekan programlarını ekle
    const dayNames = [null, 'Pazartesi', 'Salı', 'Çarşamba', 'Perşembe', 'Cuma']
    const currentDayName = dayNames[dayOfWeek]
    
    if (currentDayName) {
      const activeSchedules = schedules.filter(s => s.day === currentDayName)
      activeSchedules.forEach(s => {
        // Çakışmayı önlemek için eğer zaten aynı isimde ders varsa ekleme
        if (!dayLessons.some(l => l.name === s.courseName)) {
          // Saat aralığına göre top piksel hesaplama simülasyonu
          // '09:00 - 10:30' -> 09:00 (top: 0), 10:30 (height: 120)
          const startHour = parseInt(s.timeSlot.split(':')[0]) || 9
          const topVal = (startHour - 9) * 80
          
          dayLessons.push({
            top: topVal >= 0 ? topVal : 0,
            height: 120,
            color: s.type === 'sinav' ? 'error' : 'success-emerald',
            type: s.type === 'sinav' ? 'Sınav' : 'Teorik',
            name: s.courseName,
            instructor: s.instructorName,
            room: s.room,
            time: s.timeSlot
          })
        }
      })
    }

    return dayLessons
  }

  const selectedDaySchedule = getSelectedDaySchedule()

  const getDayLabelString = () => {
    return `${selectedDay.day} ${selectedDay.month === 'May' ? 'Mayıs' : 'Haziran'}`
  }

  const isSelectedCell = (cell) => {
    return selectedDay.day === cell.day && selectedDay.month === cell.month
  }

  const handleMiniCalClick = (cell) => {
    if (cell.isWeekend) return
    setSelectedDay({ day: cell.day, month: cell.month })
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
          <h2 className="student-page-title flex items-center gap-2">
            <span className="material-symbols-outlined text-secondary text-2xl">view_week</span>
            <span>Haftalık Ders Programı</span>
          </h2>
          <p className="student-page-subtitle">2025-2026 Bahar Dönemi — gün seçmek için sağdaki takvimi veya kolon başlıklarını kullanın.</p>
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
                onClick={() => setSelectedDay(getWeekdayDayNum(1, weekIndex))}
                className={`font-label-md transition-all duration-300 border-none bg-transparent cursor-pointer flex flex-col items-center justify-center gap-0.5 ${isMondayActive ? 'text-secondary font-extrabold scale-105' : 'text-primary dark:text-slate-300 hover:opacity-80'
                  }`}
              >
                <span>Pazartesi</span>
                <span className="text-[10px] opacity-70">
                  {getWeekdayDayNum(1, weekIndex).day}
                </span>
              </button>

              <button
                onClick={() => setSelectedDay(getWeekdayDayNum(2, weekIndex))}
                className={`font-label-md transition-all duration-300 border-none bg-transparent cursor-pointer flex flex-col items-center justify-center gap-0.5 ${isTuesdayActive ? 'text-secondary font-extrabold scale-105' : 'text-primary dark:text-slate-300 hover:opacity-80'
                  }`}
              >
                <span>Salı</span>
                <span className="text-[10px] opacity-70">
                  {getWeekdayDayNum(2, weekIndex).day}
                </span>
              </button>

              <button
                onClick={() => setSelectedDay(getWeekdayDayNum(3, weekIndex))}
                className={`font-label-md transition-all duration-300 border-none bg-transparent cursor-pointer flex flex-col items-center justify-center gap-0.5 ${isWednesdayActive ? 'text-secondary font-extrabold scale-105' : 'text-primary dark:text-slate-300 hover:opacity-80'
                  }`}
              >
                <span>Çarşamba</span>
                <span className="text-[10px] opacity-70">
                  {getWeekdayDayNum(3, weekIndex).day}
                </span>
              </button>

              <button
                onClick={() => setSelectedDay(getWeekdayDayNum(4, weekIndex))}
                className={`font-label-md transition-all duration-300 border-none bg-transparent cursor-pointer flex flex-col items-center justify-center gap-0.5 hover:opacity-80 ${isThursdayActive ? 'text-secondary font-extrabold scale-105' : 'text-primary dark:text-slate-300'
                  }`}
              >
                <span>Perşembe</span>
                <span className="text-[10px] opacity-70">
                  {getWeekdayDayNum(4, weekIndex).day}
                </span>
              </button>

              <button
                onClick={() => setSelectedDay(getWeekdayDayNum(5, weekIndex))}
                className={`font-label-md transition-all duration-300 border-none bg-transparent cursor-pointer flex flex-col items-center justify-center gap-0.5 ${isFridayActive ? 'text-secondary font-extrabold scale-105' : 'text-primary dark:text-slate-300 hover:opacity-80'
                  }`}
              >
                <span>Cuma</span>
                <span className="text-[10px] opacity-70">
                  {getWeekdayDayNum(5, weekIndex).day}
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
              {((() => {
                const lessons = weeklyLessonsByWeek[weekIndex]?.monday || []
                const approvedSchedules = schedules.filter(s => s.day === 'Pazartesi')
                approvedSchedules.forEach(s => {
                  if (!lessons.some(l => l.name === s.courseName)) {
                    const startHour = parseInt(s.timeSlot.split(':')[0]) || 9
                    const topVal = (startHour - 9) * 80
                    lessons.push({
                      top: topVal >= 0 ? topVal : 0,
                      height: 120,
                      color: s.type === 'sinav' ? 'error' : 'success-emerald',
                      type: s.type === 'sinav' ? 'Sınav' : 'Teorik',
                      name: s.courseName,
                      instructor: s.instructorName,
                      room: s.room,
                      time: s.timeSlot
                    })
                  }
                })
                return lessons
              })()).map((course, idx) => (
                <div
                  key={`mon-${idx}`}
                  className={`absolute w-[calc((100%-80px)/5)] p-2 transition-all duration-300 ${isMondayActive ? 'z-10 scale-[1.01]' : 'opacity-85 z-0'}`}
                  style={{
                    top: `${course.top}px`,
                    left: '80px',
                    height: `${course.height}px`
                  }}
                  onClick={() => setSelectedDay(getWeekdayDayNum(1, weekIndex))}
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
              {((() => {
                const lessons = weeklyLessonsByWeek[weekIndex]?.tuesday || []
                const approvedSchedules = schedules.filter(s => s.day === 'Salı')
                approvedSchedules.forEach(s => {
                  if (!lessons.some(l => l.name === s.courseName)) {
                    const startHour = parseInt(s.timeSlot.split(':')[0]) || 9
                    const topVal = (startHour - 9) * 80
                    lessons.push({
                      top: topVal >= 0 ? topVal : 0,
                      height: 120,
                      color: s.type === 'sinav' ? 'error' : 'success-emerald',
                      type: s.type === 'sinav' ? 'Sınav' : 'Teorik',
                      name: s.courseName,
                      instructor: s.instructorName,
                      room: s.room,
                      time: s.timeSlot
                    })
                  }
                })
                return lessons
              })()).map((course, idx) => (
                <div
                  key={`tue-${idx}`}
                  className={`absolute w-[calc((100%-80px)/5)] p-2 transition-all duration-300 ${isTuesdayActive ? 'z-10 scale-[1.01]' : 'opacity-85 z-0'}`}
                  style={{
                    top: `${course.top}px`,
                    left: 'calc(80px + ((100% - 80px) / 5) * 1)',
                    height: `${course.height}px`
                  }}
                  onClick={() => setSelectedDay(getWeekdayDayNum(2, weekIndex))}
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
              {((() => {
                const lessons = weeklyLessonsByWeek[weekIndex]?.wednesday || []
                const approvedSchedules = schedules.filter(s => s.day === 'Çarşamba')
                approvedSchedules.forEach(s => {
                  if (!lessons.some(l => l.name === s.courseName)) {
                    const startHour = parseInt(s.timeSlot.split(':')[0]) || 9
                    const topVal = (startHour - 9) * 80
                    lessons.push({
                      top: topVal >= 0 ? topVal : 0,
                      height: 120,
                      color: s.type === 'sinav' ? 'error' : 'success-emerald',
                      type: s.type === 'sinav' ? 'Sınav' : 'Teorik',
                      name: s.courseName,
                      instructor: s.instructorName,
                      room: s.room,
                      time: s.timeSlot
                    })
                  }
                })
                return lessons
              })()).map((course, idx) => (
                <div
                  key={`wed-${idx}`}
                  className={`absolute w-[calc((100%-80px)/5)] p-2 transition-all duration-300 ${isWednesdayActive ? 'z-10 scale-[1.01]' : 'opacity-85 z-0'}`}
                  style={{
                    top: `${course.top}px`,
                    left: 'calc(80px + ((100% - 80px) / 5) * 2)',
                    height: `${course.height}px`
                  }}
                  onClick={() => setSelectedDay(getWeekdayDayNum(3, weekIndex))}
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
              {((() => {
                const lessons = weeklyLessonsByWeek[weekIndex]?.thursday || []
                const approvedSchedules = schedules.filter(s => s.day === 'Perşembe')
                approvedSchedules.forEach(s => {
                  if (!lessons.some(l => l.name === s.courseName)) {
                    const startHour = parseInt(s.timeSlot.split(':')[0]) || 9
                    const topVal = (startHour - 9) * 80
                    lessons.push({
                      top: topVal >= 0 ? topVal : 0,
                      height: 120,
                      color: s.type === 'sinav' ? 'error' : 'success-emerald',
                      type: s.type === 'sinav' ? 'Sınav' : 'Teorik',
                      name: s.courseName,
                      instructor: s.instructorName,
                      room: s.room,
                      time: s.timeSlot
                    })
                  }
                })
                return lessons
              })()).map((course, idx) => (
                <div
                  key={`thu-${idx}`}
                  className={`absolute w-[calc((100%-80px)/5)] p-2 transition-all duration-300 ${isThursdayActive ? 'z-10 scale-[1.01]' : 'opacity-85 z-0'}`}
                  style={{
                    top: `${course.top}px`,
                    left: 'calc(80px + ((100% - 80px) / 5) * 3)',
                    height: `${course.height}px`
                  }}
                  onClick={() => setSelectedDay(getWeekdayDayNum(4, weekIndex))}
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
              {((() => {
                const lessons = weeklyLessonsByWeek[weekIndex]?.friday || []
                const approvedSchedules = schedules.filter(s => s.day === 'Cuma')
                approvedSchedules.forEach(s => {
                  if (!lessons.some(l => l.name === s.courseName)) {
                    const startHour = parseInt(s.timeSlot.split(':')[0]) || 9
                    const topVal = (startHour - 9) * 80
                    lessons.push({
                      top: topVal >= 0 ? topVal : 0,
                      height: 120,
                      color: s.type === 'sinav' ? 'error' : 'success-emerald',
                      type: s.type === 'sinav' ? 'Sınav' : 'Teorik',
                      name: s.courseName,
                      instructor: s.instructorName,
                      room: s.room,
                      time: s.timeSlot
                    })
                  }
                })
                return lessons
              })()).map((course, idx) => (
                <div
                  key={`fri-${idx}`}
                  className={`absolute w-[calc((100%-80px)/5)] p-2 transition-all duration-300 ${isFridayActive ? 'z-10 scale-[1.01]' : 'opacity-85 z-0'}`}
                  style={{
                    top: `${course.top}px`,
                    left: 'calc(80px + ((100% - 80px) / 5) * 4)',
                    height: `${course.height}px`
                  }}
                  onClick={() => setSelectedDay(getWeekdayDayNum(5, weekIndex))}
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
              <span>May – Haz 2026</span>
            </h3>
            <span className="text-[10px] font-bold text-secondary bg-secondary/10 px-2 py-0.5 rounded-lg">{weekIndex}. Hafta</span>
          </div>

          {/* Gün etiketleri */}
          <div className="grid grid-cols-7 text-center">
            {['Pzt', 'Sal', 'Çar', 'Per', 'Cum', 'Cmt', 'Paz'].map((d, i) => (
              <div key={d} className={`text-[9px] font-extrabold uppercase tracking-wider py-1 ${i >= 5 ? 'text-slate-300 dark:text-slate-600' : 'text-slate-400 dark:text-slate-500'}`}>{d}</div>
            ))}
          </div>

          {/* Hafta satırları */}
          <div className="flex flex-col gap-1">
            {miniCalendarWeeks.map((week, rowIdx) => {
              const actualWeekNum = rowIdx + 1
              if (actualWeekNum < 2 || actualWeekNum > 6) return null
              const isActiveWeek = weekIndex === actualWeekNum
              return (
                <div key={rowIdx} className={`grid grid-cols-7 rounded-xl transition-all duration-200 ${isActiveWeek ? 'bg-secondary/5 ring-1 ring-secondary/20' : ''}`}>
                  {week.map((cell, colIdx) => {
                    const sel = isSelectedCell(cell)
                    return (
                      <button
                        key={colIdx}
                        onClick={() => handleMiniCalClick(cell)}
                        disabled={cell.isWeekend}
                        title={cell.isWeekend ? 'Hafta sonu' : `${cell.day} ${cell.month} 2026`}
                        className={`w-full aspect-square flex flex-col items-center justify-center rounded-lg text-[11px] font-bold transition-all duration-150 border-none ${cell.isWeekend
                            ? 'opacity-25 cursor-not-allowed text-slate-400 dark:text-slate-600 bg-transparent'
                            : sel
                              ? 'bg-secondary text-white shadow-md scale-105 cursor-pointer'
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
              { w: 2, label: '11 – 17 Mayıs', exam: false },
              { w: 3, label: '18 – 24 Mayıs', exam: false },
              { w: 4, label: '25 – 31 Mayıs', exam: false },
              { w: 5, label: '1 – 7 Haziran', exam: true, examType: 'Final' },
              { w: 6, label: '8 – 14 Haziran', exam: false, labelSuffix: ' (Bugün)' }
            ].map(row => (
              <div key={row.w}
                onClick={() => setSelectedDay(getWeekdayDayNum(3, row.w))}
                className={`flex items-center justify-between py-1 px-2 rounded-lg cursor-pointer transition-all ${weekIndex === row.w ? 'bg-secondary/10' : 'hover:bg-slate-50 dark:hover:bg-slate-800'}`}>
                <span className={`text-[10px] font-bold ${weekIndex === row.w ? 'text-secondary' : 'text-slate-500 dark:text-slate-400'}`}>
                  {row.w}. Hafta — {row.label}{row.labelSuffix || ''}
                </span>
                {row.exam && <span className="text-[9px] text-red-400 font-extrabold">{row.examType}</span>}
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
            {selectedWeekday === 1 && 'Pazartesi'}{selectedWeekday === 2 && 'Salı'}{selectedWeekday === 3 && 'Çarşamba'}
            {selectedWeekday === 4 && 'Perşembe'}{selectedWeekday === 5 && 'Cuma'}
            {(selectedWeekday === 0 || selectedWeekday === 6) && 'Hafta Sonu'}
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
              if (course.color === 'success-emerald') borderCol = 'border-success-emerald bg-success-emerald/5 text-success-emerald'
              if (course.color === 'warning-amber') borderCol = 'border-warning-amber bg-warning-amber/5 text-warning-amber'
              if (course.color === 'error') borderCol = 'border-error bg-error/5 text-error'
              if (course.color === 'primary') borderCol = 'border-primary bg-primary/5 text-primary'
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
