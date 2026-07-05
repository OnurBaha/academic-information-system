import React from 'react';

export default function ScheduleForm({
  courses = [],
  scheduleCourse,
  setScheduleCourse,
  scheduleDay,
  setScheduleDay,
  scheduleTime,
  setScheduleTime,
  scheduleRoom,
  setScheduleRoom,
  scheduleType,
  setScheduleType,
  handleAddSchedule
}) {
  return (
    <div className="bg-white border border-slate-200/60 rounded-2xl p-5 shadow-sm">
      <h3 className="text-sm font-black text-slate-800 mb-3 flex items-center gap-1.5">
        <span className="material-symbols-outlined text-blue-900">add_circle</span>
        <span>Program Kaydı Tanımla</span>
      </h3>
      <p className="text-[11px] text-slate-500 mb-4">
        Fakülte müfredatında yer alan dersler veya ara sınav / final haftaları için çakışmasız takvim girdileri tanımlayın.
      </p>

      <div className="flex flex-col gap-4">
        <div className="flex flex-col gap-1">
          <label className="text-[10px] font-bold text-slate-400 uppercase">Ders Seçimi</label>
          <select
            className="border border-slate-200 rounded-lg p-2 text-xs focus:outline-none focus:ring-1 focus:ring-[#00236f]"
            value={scheduleCourse}
            onChange={(e) => setScheduleCourse(e.target.value)}
          >
            {courses.map((c) => (
              <option key={c.id || c.code} value={c.id || c.code}>
                {c.id || c.code} - {c.name}
              </option>
            ))}
          </select>
        </div>

        <div className="flex flex-col gap-1">
          <label className="text-[10px] font-bold text-slate-400 uppercase">Haftalık Gün</label>
          <select
            className="border border-slate-200 rounded-lg p-2 text-xs focus:outline-none focus:ring-1 focus:ring-[#00236f]"
            value={scheduleDay}
            onChange={(e) => setScheduleDay(e.target.value)}
          >
            <option value="Pazartesi">Pazartesi</option>
            <option value="Salı">Salı</option>
            <option value="Çarşamba">Çarşamba</option>
            <option value="Perşembe">Perşembe</option>
            <option value="Cuma">Cuma</option>
          </select>
        </div>

        <div className="flex flex-col gap-1">
          <label className="text-[10px] font-bold text-slate-400 uppercase">Saat Dilimi</label>
          <input
            type="text"
            className="border border-slate-200 rounded-lg p-2 text-xs focus:outline-none focus:ring-1 focus:ring-[#00236f]"
            placeholder="Örn: 09:00 - 10:30"
            value={scheduleTime}
            onChange={(e) => setScheduleTime(e.target.value)}
          />
        </div>

        <div className="flex flex-col gap-1">
          <label className="text-[10px] font-bold text-slate-400 uppercase">Derslik / Sınıf</label>
          <input
            type="text"
            className="border border-slate-200 rounded-lg p-2 text-xs focus:outline-none focus:ring-1 focus:ring-[#00236f]"
            placeholder="Örn: LAB-B3 veya Amfi-1"
            value={scheduleRoom}
            onChange={(e) => setScheduleRoom(e.target.value)}
          />
        </div>

        <div className="flex flex-col gap-1">
          <label className="text-[10px] font-bold text-slate-400 uppercase">Etkinlik Türü</label>
          <div className="flex gap-4 mt-1">
            <label className="flex items-center gap-1.5 text-xs text-slate-700 cursor-pointer">
              <input
                type="radio"
                name="schedType"
                checked={scheduleType === 'ders'}
                onChange={() => setScheduleType('ders')}
                className="text-[#00236f] focus:ring-0"
              />
              <span>Ders Saatleri</span>
            </label>
            <label className="flex items-center gap-1.5 text-xs text-slate-700 cursor-pointer">
              <input
                type="radio"
                name="schedType"
                checked={scheduleType === 'sinav'}
                onChange={() => setScheduleType('sinav')}
                className="text-[#00236f] focus:ring-0"
              />
              <span>Sınav Programı</span>
            </label>
          </div>
        </div>

        <button
          onClick={handleAddSchedule}
          className="w-full py-2.5 bg-[#00236f] hover:bg-blue-900 text-white font-bold text-xs rounded-xl transition-all flex items-center justify-center gap-1 border-none cursor-pointer"
        >
          <span className="material-symbols-outlined text-[16px]">save</span>
          <span>Takvime Kaydet</span>
        </button>
      </div>
    </div>
  );
}
