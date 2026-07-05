import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchDeanDashboardData } from '../../store/dean/deanSlice';

export default function StudentAnalytics() {
  const dispatch = useDispatch();
  const { users, studentAnalytics, deanOverview } = useSelector((state) => state.dean);

  useEffect(() => {
    dispatch(fetchDeanDashboardData());
  }, [dispatch]);

  const students = users.filter(u => u.role === 'student');
  const studentCount = students.length > 0 ? students.length : 2840;

  // Filter students under academic risk
  const riskStudents = students.filter(s => s.gpa < 2.5);

  const funnelStages = deanOverview?.employmentFunnel || [
    { name: 'Eğitimde', count: 1420, percentage: 50, color: 'blue' },
    { name: 'Stajda/Pratikte', count: 840, percentage: 30, color: 'navy' },
    { name: 'Mülakat/TUS', count: 430, percentage: 15, color: 'navy' },
    { name: 'Yerleşti', count: 185, percentage: 5, color: 'green' }
  ];

  const placementCompanies = studentAnalytics?.companies || ['Haseki Hastanesi', 'Osmanlı Arşivi', 'TDK'];
  const successStories = studentAnalytics?.successStories || [];

  return (
    <section className="an-page-canvas">
      {/* Breadcrumb & Header */}
      <div className="an-breadcrumb-wrap">
        <div className="an-breadcrumb-left">
          <h2 className="an-breadcrumb-title">Kariyer Hunisi (Career Funnel)</h2>
          <p className="an-breadcrumb-desc">Mezuniyet öncesi istihdam süreçleri anlık takibi</p>
        </div>
        <div className="an-breadcrumb-right">
          <span className="an-right-lbl">TOPLAM ÖĞRENCİ</span>
          <span className="an-right-val">{studentCount}</span>
        </div>
      </div>

      {/* Career Funnel Stage Row */}
      <div className="an-funnel-row">
        {funnelStages.map((stage, idx) => (
          <div className={`an-funnel-stage an-funnel-${idx + 1}`} key={idx}>
            <span className="an-funnel-label">{stage.name}</span>
            <span className="an-funnel-val">{stage.count}</span>
            <span className="an-funnel-percent">{stage.percentage}% GENEL</span>
          </div>
        ))}
      </div>

      {/* Main Bento Grid */}
      <div className="an-main-grid">
        {/* Left column */}
        <div className="an-left-column">
          {/* Risk Analizi Card */}
          <div className="an-risk-card">
            <div className="an-risk-header">
              <div className="an-risk-title-wrap">
                <div className="an-risk-icon-box">
                  <span className="material-symbols-outlined">warning</span>
                </div>
                <div className="an-risk-header-info">
                  <h4 className="an-risk-title">Akademik Risk Analizi</h4>
                  <p className="an-risk-desc">GANO &lt; 2.50 veya Düşük Devamsızlık Oranı</p>
                </div>
              </div>
              <a href="#" className="an-risk-link">
                <span>Tümünü Gör</span>
                <span className="material-symbols-outlined text-[14px]">open_in_new</span>
              </a>
            </div>

            <div className="an-table-wrap">
              <table className="an-table">
                <thead>
                  <tr>
                    <th className="an-th">ÖĞRENCİ</th>
                    <th className="an-th">BÖLÜM</th>
                    <th className="an-th">GANO</th>
                    <th className="an-th">DEVAMSIZLIK</th>
                    <th className="an-th">EYLEM</th>
                  </tr>
                </thead>
                <tbody>
                  {riskStudents.map((student, idx) => (
                    <tr className="an-row" key={student.id || idx}>
                      <td className="an-td-student">
                        <div className="an-student-avatar">{student.name?.slice(0, 2).toUpperCase()}</div>
                        <span className="an-student-name">{student.name}</span>
                      </td>
                      <td className="an-td">Mühendislik / Edebiyat</td>
                      <td className="an-td-red">{student.gpa}</td>
                      <td className="an-td">
                        <div className="an-attendance-cell">
                          <div className="an-attendance-bar">
                            <div className="an-attendance-fill bg-red-500" style={{ width: `${student.attendanceRate || 65}%` }}></div>
                          </div>
                          <span className="text-red-500">%{student.attendanceRate || 65}</span>
                        </div>
                      </td>
                      <td className="an-td">
                        <button className="an-btn-action">Akademik Danışman Ata</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Placement Mini Cards Grid */}
          <div className="an-placement-grid">
            {placementCompanies.slice(0, 3).map((comp, idx) => (
              <div className="an-place-card" key={idx}>
                <div className="an-place-icon-box">
                  <span className="material-symbols-outlined">
                    {idx === 0 ? 'domain' : idx === 1 ? 'archive' : 'edit_document'}
                  </span>
                </div>
                <div className="an-place-info">
                  <span className="an-place-name">{comp}</span>
                  <span className="an-place-val">{24 - idx * 5} Yerleşim</span>
                </div>
                <span className="an-place-trend an-trend-up">
                  <span className="material-symbols-outlined text-[12px]">trending_up</span>
                  +{12 - idx * 2}%
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Right column: Timeline of Success Stories */}
        <div className="an-right-column">
          <div className="an-success-card">
            <div className="an-success-header">
              <div className="an-success-header-icon">
                <span className="material-symbols-outlined">handshake</span>
              </div>
              <h4 className="an-success-header-title">Yeni Yerleşen Mezunlar</h4>
            </div>

            <div className="an-success-timeline">
              {successStories.map((story, idx) => (
                <div className="an-timeline-item" key={idx}>
                  <div className="an-timeline-node-wrap">
                    <div className="an-timeline-node"></div>
                    <div className="an-timeline-line"></div>
                  </div>
                  <img 
                    className="an-timeline-avatar" 
                    src={story.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&q=80'} 
                    alt={story.name} 
                  />
                  <div className="an-timeline-content">
                    <div className="an-timeline-header">
                      <div className="an-timeline-user-info">
                        <span className="an-timeline-name">{story.name}</span>
                        <span className="an-timeline-title">{story.title}</span>
                      </div>
                      <span className="an-timeline-time">{story.time}</span>
                    </div>
                    <p className="an-timeline-quote">"{story.quote}"</p>
                  </div>
                </div>
              ))}
            </div>

            <button className="an-timeline-btn-more">Tüm Başarı Hikayelerini İncele</button>
          </div>
        </div>
      </div>

      {/* Bottom stats row */}
      <div className="an-bottom-stats-row">
        {/* Stat 1 */}
        <div className="an-stat-box">
          <div className="an-stat-donut">
            <svg className="w-12 h-12 transform -rotate-90" viewBox="0 0 36 36">
              <path
                className="text-slate-100"
                strokeWidth="3.5"
                stroke="currentColor"
                fill="none"
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
              />
              <path
                className="text-blue-900"
                strokeWidth="3.5"
                strokeDasharray="90, 100"
                strokeLinecap="round"
                stroke="currentColor"
                fill="none"
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
              />
            </svg>
            <span className="an-stat-donut-val">90%</span>
          </div>
          <div className="an-stat-info">
            <span className="an-stat-label">Genel Katılım</span>
            <span className="an-stat-desc">Yüksek</span>
          </div>
        </div>

        {/* Stat 2 */}
        <div className="an-stat-box">
          <div className="an-stat-donut">
            <svg className="w-12 h-12 transform -rotate-90" viewBox="0 0 36 36">
              <path
                className="text-slate-100"
                strokeWidth="3.5"
                stroke="currentColor"
                fill="none"
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
              />
              <path
                className="text-emerald-500"
                strokeWidth="3.5"
                strokeDasharray="85, 100"
                strokeLinecap="round"
                stroke="currentColor"
                fill="none"
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
              />
            </svg>
            <span className="an-stat-donut-val">85%</span>
          </div>
          <div className="an-stat-info">
            <span className="an-stat-label">İstihdam Oranı</span>
            <span className="an-stat-desc">Hedef Üstü</span>
          </div>
        </div>

        {/* Stat 3 */}
        <div className="an-stat-box">
          <div className="an-stat-donut">
            <svg className="w-12 h-12 transform -rotate-90" viewBox="0 0 36 36">
              <path
                className="text-slate-100"
                strokeWidth="3.5"
                stroke="currentColor"
                fill="none"
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
              />
              <path
                className="text-amber-500"
                strokeWidth="3.5"
                strokeDasharray="20, 100"
                strokeLinecap="round"
                stroke="currentColor"
                fill="none"
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
              />
            </svg>
            <span className="an-stat-donut-val">20%</span>
          </div>
          <div className="an-stat-info">
            <span className="an-stat-label">Riskli Öğrenci</span>
            <span className="an-stat-desc">Azalıyor</span>
          </div>
        </div>

        {/* Stat 4 */}
        <div className="an-stat-box">
          <div className="an-stat-donut">
            <svg className="w-12 h-12 transform -rotate-90" viewBox="0 0 36 36">
              <path
                className="text-slate-100"
                strokeWidth="3.5"
                stroke="currentColor"
                fill="none"
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
              />
              <path
                className="text-blue-900"
                strokeWidth="3.5"
                strokeDasharray="95, 100"
                strokeLinecap="round"
                stroke="currentColor"
                fill="none"
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
              />
            </svg>
            <span className="an-stat-donut-val">95%</span>
          </div>
          <div className="an-stat-info">
            <span className="an-stat-label">Şirket Memnuniyeti</span>
            <span className="an-stat-desc">Mükemmel</span>
          </div>
        </div>
      </div>
    </section>
  )
}
