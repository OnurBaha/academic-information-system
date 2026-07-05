import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchCurriculumAsync, createNewCurriculumCourseAsync } from '../../store/course/courseSlice';

export default function Curriculum() {
  const dispatch = useDispatch();
  const { curriculum } = useSelector((state) => state.course);

  // Form states
  const [courseName, setCourseName] = useState('');
  const [track, setTrack] = useState('Full-Stack Web');
  const [ects, setEcts] = useState(6);
  const [instructor, setInstructor] = useState('Dr. Arda Yılmaz');
  const [hours, setHours] = useState(48);
  const [quota, setQuota] = useState(50);

  useEffect(() => {
    dispatch(fetchCurriculumAsync());
  }, [dispatch]);

  const handleSaveCourse = () => {
    if (!courseName.trim()) return;

    // Generate random code based on track
    const prefix = track.slice(0, 3).toUpperCase();
    const num = Math.floor(100 + Math.random() * 800);
    const code = `${prefix}${num}`;

    dispatch(createNewCurriculumCourseAsync({
      code,
      name: courseName,
      ects: Number(ects),
      semester: 1, // default
      status: 'Taslak',
      instructor,
      hours: Number(hours),
      quota: Number(quota)
    }));

    setCourseName('');
    alert('Yeni ders onay için gönderildi ve taslak olarak eklendi!');
  };

  // Group curriculum by status or track
  const activeCourses = curriculum.filter(c => c.status === 'Aktif');
  const draftCourses = curriculum.filter(c => c.status === 'Taslak' || c.status === 'Pasif');

  return (
    <section className="curr-page-canvas">
      {/* Breadcrumb & Header */}
      <div>
        <p className="curr-breadcrumb">
          AKADEMİK PLANLAMA
        </p>
        <div className="curr-header-row">
          <div className="curr-header-info">
            <h2 className="curr-title">Müfredat &amp; AKTS Yönetimi</h2>
          </div>
          <div className="curr-header-actions">
            <button className="curr-btn-export">
              <span className="material-symbols-outlined text-[18px]">download</span>
              <span>Dışa Aktar (PDF)</span>
            </button>
            <button className="curr-btn-create">
              <span className="material-symbols-outlined text-[18px]">add</span>
              <span>Müfredat Taslağı Oluştur</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Bento Grid */}
      <div className="curr-main-grid">
        {/* Left Side: Programs Lists */}
        <div className="curr-programs-wrap">
          {/* Active Curriculum Programs */}
          <div className="curr-program-card">
            <div className="curr-program-header">
              <div className="curr-program-header-info">
                <h4 className="curr-program-title">Aktif Üniversite Müfredatı</h4>
                <p className="curr-program-sub">Tüm onaylanmış ve yürürlükte olan aktif dersler</p>
              </div>
              <div className="curr-program-kredi">
                <span className="curr-kredi-lbl">Toplam Aktif Ders</span>
                <span className="curr-kredi-val">{activeCourses.length}</span>
              </div>
            </div>
            <div className="curr-table-wrap">
              <table className="curr-table">
                <thead>
                  <tr>
                    <th className="curr-th">DERS ADI</th>
                    <th className="curr-th">KOD</th>
                    <th className="curr-th">AKTS</th>
                    <th className="curr-th">DURUM</th>
                    <th className="curr-th"></th>
                  </tr>
                </thead>
                <tbody>
                  {activeCourses.map((course, idx) => (
                    <tr className="curr-row" key={course.id || idx}>
                      <td className="curr-td-bold">{course.name}</td>
                      <td className="curr-td">{course.code}</td>
                      <td className="curr-td-bold">{course.ects} AKTS</td>
                      <td className="curr-td">
                        <span className="curr-status-pill curr-status-active">AKTİF</span>
                      </td>
                      <td className="curr-td">
                        <button className="curr-action-btn">
                          <span className="material-symbols-outlined">more_vert</span>
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Draft/Passive Programs */}
          <div className="curr-program-card">
            <div className="curr-program-header">
              <div className="curr-program-header-info">
                <h4 className="curr-program-title">Taslak ve Pasif Dersler</h4>
                <p className="curr-program-sub">Onay bekleyen veya pasife alınmış müfredat unsurları</p>
              </div>
              <div className="curr-program-kredi">
                <span className="curr-kredi-lbl">Toplam Taslak</span>
                <span className="curr-kredi-val">{draftCourses.length}</span>
              </div>
            </div>
            <div className="curr-table-wrap">
              <table className="curr-table">
                <thead>
                  <tr>
                    <th className="curr-th">DERS ADI</th>
                    <th className="curr-th">KOD</th>
                    <th className="curr-th">AKTS</th>
                    <th className="curr-th">DURUM</th>
                    <th className="curr-th"></th>
                  </tr>
                </thead>
                <tbody>
                  {draftCourses.map((course, idx) => (
                    <tr className="curr-row" key={course.id || idx}>
                      <td className="curr-td-bold">{course.name}</td>
                      <td className="curr-td">{course.code}</td>
                      <td className="curr-td-bold">{course.ects} AKTS</td>
                      <td className="curr-td">
                        <span className="curr-status-pill curr-status-passive">{course.status}</span>
                      </td>
                      <td className="curr-td">
                        <button className="curr-action-btn">
                          <span className="material-symbols-outlined">more_vert</span>
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Right Side: Sidebar Form */}
        <div className="curr-sidebar-wrap">
          {/* Form Card */}
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
                <option value="Mühendislik">Mühendislik</option>
                <option value="Tıp Fakültesi">Tıp Fakültesi</option>
                <option value="Tarih Bölümü">Tarih Bölümü</option>
                <option value="Edebiyat Bölümü">Edebiyat Bölümü</option>
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
        </div>
      </div>
    </section>
  )
}
