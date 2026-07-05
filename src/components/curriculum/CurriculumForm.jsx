export default function CurriculumForm({
  courseName,
  setCourseName,
  track,
  setTrack,
  ects,
  setEcts,
  instructor,
  setInstructor,
  hours,
  setHours,
  quota,
  setQuota,
  faculties = [],
  departments = [],
  handleSaveCourse
}) {
  return (
    <div className="curr-form-card">
      <h4 className="curr-form-title">
        <span className="material-symbols-outlined">add_circle</span>
        <span>Yeni Ders Ekle</span>
      </h4>
      <div className="curr-form-group">
        <label className="curr-form-label">Ders Adı</label>
        <input 
          type="text" 
          className="curr-form-input" 
          placeholder="Örn: Osmanlı Tarihi, Genel Fizik vb." 
          value={courseName}
          onChange={(e) => setCourseName(e.target.value)}
        />
      </div>

      <div className="curr-form-group">
        <label className="curr-form-label">Uzmanlık Alanı (Fakülte/Bölüm)</label>
        <select className="curr-form-select" value={track} onChange={(e) => setTrack(e.target.value)}>
          {faculties.map(f => (
            <option key={f.id} value={f.name}>{f.name}</option>
          ))}
          {departments.map(d => (
            <option key={d.id} value={d.name}>{d.name}</option>
          ))}
          {faculties.length === 0 && (
            <>
              <option value="Mühendislik">Mühendislik</option>
              <option value="Tıp Fakültesi">Tıp Fakültesi</option>
              <option value="Tarih Bölümü">Tarih Bölümü</option>
              <option value="Edebiyat Bölümü">Edebiyat Bölümü</option>
            </>
          )}
        </select>
      </div>

      <div className="curr-form-slider-wrap">
        <div className="curr-slider-header">
          <span>AKTS Kredisi</span>
          <span>{ects}</span>
        </div>
        <input 
          type="range" 
          className="curr-slider" 
          min="1" 
          max="10" 
          value={ects}
          onChange={(e) => setEcts(e.target.value)}
        />
      </div>

      <div className="curr-form-group">
        <label className="curr-form-label">Sorumlu Eğitmen</label>
        <select className="curr-form-select" value={instructor} onChange={(e) => setInstructor(e.target.value)}>
          <option value="Dr. Elif Soylu">Dr. Elif Soylu</option>
          <option value="Doç. Dr. Mert Akın">Doç. Dr. Mert Akın</option>
          <option value="Dr. Cem Kaya">Dr. Cem Kaya</option>
          <option value="Prof. Seda Demir">Prof. Seda Demir</option>
        </select>
      </div>

      <div className="curr-form-row-2">
        <div className="curr-form-group">
          <label className="curr-form-label">Toplam Saat</label>
          <input 
            type="number" 
            className="curr-form-input" 
            value={hours}
            onChange={(e) => setHours(e.target.value)}
          />
        </div>
        <div className="curr-form-group">
          <label className="curr-form-label">Kontenjan</label>
          <input 
            type="number" 
            className="curr-form-input" 
            value={quota}
            onChange={(e) => setQuota(e.target.value)}
          />
        </div>
      </div>

      <button className="curr-btn-save" onClick={handleSaveCourse}>
        <span className="material-symbols-outlined">save</span>
        <span>Dersi Müfredata Kaydet</span>
      </button>

      <p className="curr-form-note">
        Kaydedilen dersler "Onay Merkezi"ne gönderilir ve dekan onayından sonra aktifleşir.
      </p>
    </div>
  );
}
