import React from 'react';

export default function CalendarForm({ calTitle, setCalTitle, calDate, setCalDate, calSemester, setCalSemester, handleCreateCalendarEvent }) {
  return (
    <div className="bg-white border border-slate-200/60 rounded-2xl p-5 shadow-sm">
      <h3 className="text-sm font-black text-slate-800 mb-3 flex items-center gap-1.5">
        <span className="material-symbols-outlined text-blue-900">event</span>
        <span>Takvim Etkinliği Ekle</span>
      </h3>
      <p className="text-[11px] text-slate-500 mb-4">
        Akademik takvime yeni kayıt tarihleri, ders başlangıçları, sınav haftaları veya resmi tatil günleri tanımlayın.
      </p>

      <div className="flex flex-col gap-4">
        <div className="flex flex-col gap-1">
          <label className="text-[10px] font-bold text-slate-400 uppercase">Etkinlik Başlığı</label>
          <input
            type="text"
            className="border border-slate-200 rounded-lg p-2 text-xs focus:outline-none focus:ring-1 focus:ring-[#00236f]"
            placeholder="Örn: Güz Dönemi Ders Kayıtları"
            value={calTitle}
            onChange={(e) => setCalTitle(e.target.value)}
          />
        </div>

        <div className="flex flex-col gap-1">
          <label className="text-[10px] font-bold text-slate-400 uppercase">Tarih</label>
          <input
            type="text"
            className="border border-slate-200 rounded-lg p-2 text-xs focus:outline-none focus:ring-1 focus:ring-[#00236f]"
            placeholder="Örn: 15.09.2025"
            value={calDate}
            onChange={(e) => setCalDate(e.target.value)}
          />
        </div>

        <div className="flex flex-col gap-1">
          <label className="text-[10px] font-bold text-slate-400 uppercase">Dönem / Kategori</label>
          <select
            className="border border-slate-200 rounded-lg p-2 text-xs focus:outline-none focus:ring-1 focus:ring-[#00236f]"
            value={calSemester}
            onChange={(e) => setCalSemester(e.target.value)}
          >
            <option value="guz">Güz Yarıyılı</option>
            <option value="bahar">Bahar Yarıyılı</option>
            <option value="yaz">Yaz Öğretimi</option>
            <option value="tatil">Resmi Tatiller</option>
          </select>
        </div>

        <button
          onClick={handleCreateCalendarEvent}
          className="w-full py-2.5 bg-[#00236f] hover:bg-blue-900 text-white font-bold text-xs rounded-xl transition-all flex items-center justify-center gap-1 border-none cursor-pointer"
        >
          <span className="material-symbols-outlined text-[16px]">add_circle</span>
          <span>Takvime Ekle</span>
        </button>
      </div>
    </div>
  );
}
