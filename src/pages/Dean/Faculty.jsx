import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchDeanDashboardData } from '../../store/dean/deanSlice';

export default function Faculty() {
  const dispatch = useDispatch();
  const { instructors, users } = useSelector((state) => state.dean);
  const [filter, setFilter] = useState('Tümü');

  useEffect(() => {
    dispatch(fetchDeanDashboardData());
  }, [dispatch]);

  // Calculate dynamic metrics
  const totalInstructors = instructors.length > 0 ? instructors.length : 124;
  const avgRating = instructors.length > 0 
    ? (instructors.reduce((acc, curr) => acc + (curr.rating || 0), 0) / instructors.length).toFixed(2)
    : '4.82';
    
  const avgWorkload = instructors.length > 0 
    ? (instructors.reduce((acc, curr) => acc + (curr.workload || 0), 0) / instructors.length).toFixed(1)
    : '94.1';

  // Filtered instructors list
  const filteredInstructors = instructors.filter(inst => {
    if (filter === 'Tümü') return true;
    if (filter === 'Tam Zamanlı') return inst.workload >= 70; // Mock condition
    if (filter === 'Yarı Zamanlı') return inst.workload < 70; // Mock condition
    return true;
  });

  return (
    <section className="fac-page-canvas">
      {/* Breadcrumb & Header */}
      <div>
        <p className="fac-breadcrumb">
          YÖNETİM &gt; <span className="fac-breadcrumb-active">AKADEMİK KADRO</span>
        </p>
        <div className="fac-header-row">
          <div className="fac-header-info">
            <h2 className="fac-title">Eğitmen Portföyü &amp; Performans</h2>
            <p className="fac-desc">
              Akademik personelin verimlilik, katılım ve öğrenci geri bildirimlerini takip edin.
            </p>
          </div>
          <button className="fac-btn-add">
            <span className="material-symbols-outlined">person_add</span>
            <span>Yeni Eğitmen Ekle</span>
          </button>
        </div>
      </div>

      {/* Metrics Cards */}
      <div className="fac-metrics-grid">
        {/* Card 1: Toplam Eğitmen */}
        <div className="fac-metric-card">
          <div className="fac-card-top">
            <div className="fac-card-icon-wrap fac-icon-blue">
              <span className="material-symbols-outlined text-[20px]">groups</span>
            </div>
            <span className="fac-card-badge-green">
              <span className="material-symbols-outlined text-[14px]">trending_up</span>
              +4
            </span>
          </div>
          <div className="fac-card-content">
            <span className="fac-card-label">Toplam Eğitmen</span>
            <div className="fac-card-val-wrap">
              <h3 className="fac-card-val">{totalInstructors}</h3>
            </div>
          </div>
        </div>

        {/* Card 2: Öğrenci Değerlendirmesi */}
        <div className="fac-metric-card">
          <div className="fac-card-top">
            <div className="fac-card-icon-wrap fac-icon-gold">
              <span className="material-symbols-outlined text-[20px]">star</span>
            </div>
            <span className="fac-card-badge-gray">Ortalama Skor</span>
          </div>
          <div className="fac-card-content">
            <span className="fac-card-label">Öğrenci Değerlendirmesi</span>
            <div className="fac-card-val-wrap">
              <h3 className="fac-card-val">{avgRating}</h3>
              <span className="fac-card-val-sub">/ 5.0</span>
            </div>
          </div>
        </div>

        {/* Card 3: Yoklama Katılım Oranı */}
        <div className="fac-metric-card">
          <div className="fac-card-top">
            <div className="fac-card-icon-wrap fac-icon-green">
              <span className="material-symbols-outlined text-[20px]">calendar_month</span>
            </div>
            <span className="fac-card-badge-gray">Bu Ay</span>
          </div>
          <div className="fac-card-content">
            <span className="fac-card-label">Yoklama Katılım Oranı</span>
            <div className="fac-card-val-wrap">
              <h3 className="fac-card-val">%{avgWorkload}</h3>
            </div>
          </div>
        </div>

        {/* Card 4: Yayındaki Branş Sayısı */}
        <div className="fac-metric-card">
          <div className="fac-card-top">
            <div className="fac-card-icon-wrap fac-icon-purple">
              <span className="material-symbols-outlined text-[20px]">book</span>
            </div>
            <span className="fac-card-badge-gray">Aktif Kurslar</span>
          </div>
          <div className="fac-card-content">
            <span className="fac-card-label">Yayındaki Branş Sayısı</span>
            <div className="fac-card-val-wrap">
              <h3 className="fac-card-val">42</h3>
            </div>
          </div>
        </div>
      </div>

      {/* Instructor List Card */}
      <div className="fac-list-card">
        <div className="fac-list-header">
          <h4 className="fac-list-title">Eğitmen Listesi</h4>
          <div className="fac-list-actions">
            <div className="fac-segment-control">
              <button 
                className={`fac-segment-btn ${filter === 'Tümü' ? 'fac-segment-btn-active' : ''}`}
                onClick={() => setFilter('Tümü')}
              >
                Tümü
              </button>
              <button 
                className={`fac-segment-btn ${filter === 'Tam Zamanlı' ? 'fac-segment-btn-active' : ''}`}
                onClick={() => setFilter('Tam Zamanlı')}
              >
                Tam Zamanlı
              </button>
              <button 
                className={`fac-segment-btn ${filter === 'Yarı Zamanlı' ? 'fac-segment-btn-active' : ''}`}
                onClick={() => setFilter('Yarı Zamanlı')}
              >
                Yarı Zamanlı
              </button>
            </div>
            <button className="fac-filter-btn">
              <span className="material-symbols-outlined text-[20px]">filter_list</span>
            </button>
          </div>
        </div>

        <div className="fac-table-wrap">
          <table className="fac-table">
            <thead>
              <tr>
                <th className="fac-th">EĞİTMEN</th>
                <th className="fac-th">BRANŞ &amp; KURSLAR</th>
                <th className="fac-th">ÖĞRENCİ PUANI</th>
                <th className="fac-th">YOKLAMA ORANI</th>
                <th className="fac-th">DURUM</th>
                <th className="fac-th"></th>
              </tr>
            </thead>
            <tbody>
              {filteredInstructors.map((inst, idx) => (
                <tr className="fac-row" key={inst.id || idx}>
                  <td className="fac-td">
                    <div className="fac-instructor-box">
                      {inst.avatar && inst.avatar.startsWith('http') ? (
                        <img 
                          className="w-10 h-10 rounded-xl object-cover" 
                          src={inst.avatar} 
                          alt={inst.name} 
                        />
                      ) : (
                        <div className="w-10 h-10 rounded-xl bg-slate-200 text-slate-700 flex items-center justify-center font-black text-sm uppercase">
                          {inst.name?.charAt(0)}
                        </div>
                      )}
                      <div className="fac-instructor-info">
                        <span className="fac-instructor-name">{inst.name}</span>
                        <span className="fac-instructor-role">{inst.workload >= 70 ? 'Senior Lecturer' : 'Lecturer'}</span>
                      </div>
                    </div>
                  </td>
                  <td className="fac-td">
                    <div className="fac-tags-wrap">
                      <span className="fac-tag">{inst.dept || 'Akademik'}</span>
                    </div>
                  </td>
                  <td className="fac-td">
                    <div className="fac-rating-box">
                      <span className="material-symbols-outlined fac-star-icon">star</span>
                      <span>{inst.rating}</span>
                      <span className="fac-rating-count">({inst.studentCount})</span>
                    </div>
                  </td>
                  <td className="fac-td">
                    <div className="fac-attendance-box">
                      <div className="fac-attendance-bar">
                        <div className="fac-attendance-fill bg-blue-600" style={{ width: `${inst.workload}%` }}></div>
                      </div>
                      <span>%{inst.workload}</span>
                    </div>
                  </td>
                  <td className="fac-td">
                    <span className={`fac-status-pill ${inst.workload >= 50 ? 'fac-status-active' : 'fac-status-leave'}`}>
                      {inst.workload >= 50 ? 'AKTİF' : 'İZİNLİ'}
                    </span>
                  </td>
                  <td className="fac-td">
                    <button className="fac-action-btn">
                      <span className="material-symbols-outlined">chevron_right</span>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="fac-list-footer">
          <span>Toplam {filteredInstructors.length} kayıttan 1-{filteredInstructors.length} arası gösteriliyor</span>
          <div className="fac-pagination">
            <button className="fac-page-btn">
              <span className="material-symbols-outlined text-[16px]">chevron_left</span>
            </button>
            <button className="fac-page-btn fac-page-btn-active">1</button>
            <button className="fac-page-btn">
              <span className="material-symbols-outlined text-[16px]">chevron_right</span>
            </button>
          </div>
        </div>
      </div>
    </section>
  )
}
