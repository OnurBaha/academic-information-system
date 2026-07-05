import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import { fetchDeanDashboardData, publishGlobalBulletinAsync } from '../../store/dean/deanSlice';

export default function DeanOverview() {
  const dispatch = useDispatch();
  const { users, courses, deanOverview, instructors, status } = useSelector((state) => state.dean);
  const [announcementText, setAnnouncementText] = useState('');
  const [audience, setAudience] = useState('Herkes');

  useEffect(() => {
    dispatch(fetchDeanDashboardData());
  }, [dispatch]);

  // Dynamic metrics calculation
  const students = users.filter(u => u.role === 'student');
  const studentCount = students.length > 0 ? students.length : 340;
  
  const avgGpa = students.length > 0
    ? (students.reduce((acc, s) => acc + (s.gpa || 0), 0) / students.length).toFixed(2)
    : '2.94';

  const employmentSuccess = deanOverview?.metrics?.employmentRate 
    ? `%${deanOverview.metrics.employmentRate}` 
    : '%84.2';

  const pendingApprovalsCount = courses.filter(c => c.gradesApproved === false).length || 3;

  const handlePublish = () => {
    if (!announcementText.trim()) return;
    dispatch(publishGlobalBulletinAsync({
      priority: 'Normal',
      title: 'Genel Akademik Duyuru',
      content: announcementText,
      target: audience
    }));
    setAnnouncementText('');
    alert('Duyuru başarıyla yayınlandı!');
  };

  return (
    <section className="dean-page-canvas">
      {/* Welcome Banner */}
      <div className="dean-welcome-banner">
        <div className="dean-welcome-content">
          <h2 className="dean-welcome-title">Hoş geldiniz, Dekan Prof. Dr. Kemal Arslan.</h2>
          <p className="dean-welcome-desc">
            Sistem genelinde aktif <strong>{courses.length || 14} branş / ders</strong> ve <strong>{studentCount} kayıtlı öğrenci</strong> bulunmaktadır.
          </p>
          <p className="dean-welcome-desc">Akademik takvim planlandığı gibi ilerlemektedir.</p>
        </div>
        <span className="material-symbols-outlined dean-welcome-bg-icon">account_balance</span>
      </div>

      {/* Metrics Cards */}
      <div className="dean-metrics-grid-4">
        {/* Card 1: Toplam Aktif Öğrenci */}
        <div className="dean-metric-card-new">
          <div className="dean-card-top-row">
            <div className="dean-card-icon-box dean-card-icon-blue">
              <span className="material-symbols-outlined">school</span>
            </div>
            <span className="dean-card-trend">
              <span className="material-symbols-outlined">trending_up</span>
              +8%
            </span>
          </div>
          <div className="dean-card-content">
            <span className="dean-card-label">Toplam Aktif Öğrenci</span>
            <div className="dean-card-value-group">
              <h3 className="dean-card-value">{studentCount}</h3>
            </div>
          </div>
        </div>

        {/* Card 2: GANO */}
        <div className="dean-metric-card-new">
          <div className="dean-card-top-row">
            <div className="dean-card-icon-box dean-card-icon-blue">
              <span className="material-symbols-outlined">star</span>
            </div>
            <div className="w-8 h-8 flex items-center justify-center">
              <svg className="w-7 h-7 text-blue-600" viewBox="0 0 36 36">
                <path
                  className="text-slate-100"
                  strokeWidth="3.5"
                  stroke="currentColor"
                  fill="none"
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                />
                <path
                  className="text-blue-600"
                  strokeWidth="3.5"
                  strokeDasharray="73, 100"
                  strokeLinecap="round"
                  stroke="currentColor"
                  fill="none"
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                />
              </svg>
            </div>
          </div>
          <div className="dean-card-content">
            <span className="dean-card-label">Genel Başarı (GANO)</span>
            <div className="dean-card-value-group">
              <h3 className="dean-card-value">{avgGpa}</h3>
              <span className="dean-card-value-sub">/ 4.00</span>
            </div>
          </div>
        </div>

        {/* Card 3: İstihdam & Staj */}
        <div className="dean-metric-card-new">
          <div className="dean-card-top-row">
            <div className="dean-card-icon-box dean-card-icon-blue">
              <span className="material-symbols-outlined">work_history</span>
            </div>
            <div className="flex items-end gap-1 h-6 pb-1">
              <div className="w-1.5 bg-blue-600 rounded-t h-[40%]"></div>
              <div className="w-1.5 bg-blue-600 rounded-t h-[70%]"></div>
              <div className="w-1.5 bg-blue-600 rounded-t h-[100%]"></div>
            </div>
          </div>
          <div className="dean-card-content">
            <span className="dean-card-label">İstihdam &amp; Staj</span>
            <div className="dean-card-value-group">
              <h3 className="dean-card-value">{employmentSuccess}</h3>
            </div>
          </div>
        </div>

        {/* Card 4: Bekleyen Onaylar */}
        <div className="dean-metric-card-new">
          <div className="dean-card-top-row">
            <div className="dean-card-icon-box dean-card-icon-amber">
              <span className="material-symbols-outlined">warning</span>
            </div>
            <span className="dean-card-badge-urgent">ACİL</span>
          </div>
          <div className="dean-card-content">
            <span className="dean-card-label">Bekleyen Onaylar</span>
            <div className="dean-card-value-group">
              <h3 className="dean-card-value">{pendingApprovalsCount}</h3>
            </div>
          </div>
        </div>
      </div>

      {/* Bento Grid Row 1: Academic Performance & System Logs */}
      <div className="dean-bento-grid">
        {/* Academic Performance Chart */}
        <div className="dean-perf-card">
          <div className="dean-perf-header">
            <div className="dean-perf-title-wrap">
              <h4 className="dean-perf-title">Akademik Performans Grafiği</h4>
              <p className="dean-perf-subtitle">Bölüm bazlı ortalama başarı dağılımı</p>
            </div>
            <select className="dean-perf-select" defaultValue="Son Dönem">
              <option>Son Dönem</option>
              <option>Tüm Dönemler</option>
            </select>
          </div>
          <div className="dean-perf-list">
            {(deanOverview?.branchPopularity || [
              { label: 'Tıp ve Sağlık Bilimleri', percentage: 85 },
              { label: 'Mühendislik ve Teknoloji', percentage: 70 },
              { label: 'Tarih ve Sosyal Bilimler', percentage: 55 },
              { label: 'Edebiyat ve Dil Bilimi', percentage: 40 }
            ]).map((item, idx) => (
              <div className="dean-perf-item" key={idx}>
                <div className="dean-perf-item-header">
                  <span className="dean-perf-name">{item.label}</span>
                  <span className="dean-perf-val">{item.percentage}%</span>
                </div>
                <div className="dean-perf-track">
                  <div className="dean-perf-fill" style={{ width: `${item.percentage}%` }}></div>
                </div>
              </div>
            ))}
          </div>
          
          <div className="dean-perf-legend">
            <div className="dean-legend-item">
              <span className="dean-legend-dot-blue"></span>
              <span>Aktif Eğitim</span>
            </div>
            <div className="dean-legend-item">
              <span className="dean-legend-dot-gray"></span>
              <span>Planlanan</span>
            </div>
          </div>
        </div>

        {/* System Logs (Timeline) */}
        <div className="dean-log-card">
          <div className="dean-log-header">
            <h4 className="dean-log-title">Kritik Sistem Günlüğü</h4>
            <p className="dean-log-subtitle">Gerçek zamanlı akademik akış</p>
          </div>
          <div className="dean-log-timeline">
            <div className="dean-log-item">
              <div className="dean-log-dot-wrap dean-log-dot-green">
                <div className="dean-log-dot-inner-green"></div>
              </div>
              <span className="dean-log-time">Bugün, 09:45</span>
              <h5 className="dean-log-msg-title">Not Girişi Tamamlandı</h5>
              <p className="dean-log-desc">TAR202 Osmanlı Müesseseleri Tarihi sınav notları Dr. Elif Soylu tarafından sisteme girildi.</p>
            </div>

            <div className="dean-log-item">
              <div className="dean-log-dot-wrap dean-log-dot-blue">
                <div className="dean-log-dot-inner-blue"></div>
              </div>
              <span className="dean-log-time">Dün, 16:20</span>
              <h5 className="dean-log-msg-title">Müfredat Güncellemesi</h5>
              <p className="dean-log-desc">TIP101 Temel Anatomi dökümantasyonu sürüm 1.8 olarak güncellendi.</p>
            </div>

            <div className="dean-log-item">
              <div className="dean-log-dot-wrap dean-log-dot-amber">
                <div className="dean-log-dot-inner-amber"></div>
              </div>
              <span className="dean-log-time">12 Ocak, 11:30</span>
              <h5 className="dean-log-msg-title">Akademik İzin Talebi</h5>
              <p className="dean-log-desc">Doç. Dr. Mert Akın tarafından sempozyum katılım izin dilekçesi gönderildi.</p>
            </div>

            <div className="dean-log-item">
              <div className="dean-log-dot-wrap dean-log-dot-gray">
                <div className="dean-log-dot-inner-gray"></div>
              </div>
              <span className="dean-log-time">11 Ocak, 08:00</span>
              <h5 className="dean-log-msg-title">Yeni Dönem Kayıtları</h5>
              <p className="dean-log-desc">Hukuk Fakültesi ek ders kontenjan artırım talebi onaylandı.</p>
            </div>
          </div>
          <button className="dean-log-btn-more">Tüm Geçmişi Görüntüle</button>
        </div>
      </div>

      {/* Featured Academicians */}
      <div className="dean-featured-card">
        <div className="dean-featured-header">
          <h4 className="dean-featured-title">Öne Çıkan Akademisyenler</h4>
          <Link to="/dean/faculty" className="dean-featured-link">
            <span>Tüm Kadro</span>
            <span className="material-symbols-outlined text-[16px]">chevron_right</span>
          </Link>
        </div>
        <div className="dean-featured-grid grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {(instructors.length > 0 ? instructors.slice(0, 6) : [
            { name: 'Dr. Elif Soylu', dept: 'Tarih Bölümü', avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&q=80', status: 'active' },
            { name: 'Doç. Dr. Mert Akın', dept: 'Genel Cerrahi', avatar: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=150&q=80', status: 'active' },
            { name: 'Dr. Cem Kaya', dept: 'Hukuk', avatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150&q=80', status: 'idle' },
            { name: 'Prof. Seda Demir', dept: 'Edebiyat', avatar: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=150&q=80', status: 'active' },
            { name: 'Dr. Ahmet Yılmaz', dept: 'Mühendislik Fakültesi', avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&q=80', status: 'active' },
            { name: 'Lektör Canan Kaya', dept: 'Yabancı Diller', avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&q=80', status: 'busy' }
          ]).map((item, idx) => (
            <div className="dean-academician-item" key={idx}>
              <div className="dean-academician-avatar-wrap">
                {item.avatar && item.avatar.startsWith('http') ? (
                  <img 
                    className="dean-academician-img" 
                    src={item.avatar} 
                    alt={item.name} 
                  />
                ) : (
                  <div className="w-12 h-12 rounded-full bg-[#00236f] text-white flex items-center justify-center font-black text-sm uppercase">
                    {item.name?.charAt(0) || 'A'}
                  </div>
                )}
                <span className={`dean-status-badge ${item.status === 'active' ? 'dean-status-active' : item.status === 'busy' ? 'dean-status-busy' : 'dean-status-idle'}`}></span>
              </div>
              <p className="dean-academician-name">{item.name}</p>
              <p className="dean-academician-role">{item.dept}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Footer Area */}
      <footer className="dean-footer">
        <p className="dean-footer-text">© 2024 OBİS Akademik Bilgi Sistemi. Tüm hakları saklıdır.</p>
        <div className="dean-footer-links">
          <a href="#" className="dean-footer-link">Gizlilik Politikası</a>
          <a href="#" className="dean-footer-link">Kullanım Şartları</a>
          <a href="#" className="dean-footer-link">Kurumsal Kimlik</a>
        </div>
      </footer>

      {/* Floating Action Button */}
      <button className="dean-fab-emergency group">
        <span className="material-symbols-outlined">campaign</span>
        <span className="dean-fab-tooltip">Acil Durum Duyurusu</span>
      </button>
    </section>
  )
}
