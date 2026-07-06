import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchDeanDashboardData } from '../../store/dean/deanSlice';
import OverviewMetrics from '../../components/overview/OverviewMetrics';
import FeaturedAcademicians from '../../components/overview/FeaturedAcademicians';

export default function DeanOverview() {
  const dispatch = useDispatch();
  const { currentUser } = useSelector((state) => state.auth || {});
  const { 
    users, 
    courses, 
    deanOverview, 
    instructors, 
    systemLogs = [], 
    courseAssignments = [], 
    studentRequests = [],
    graduationApprovals = [],
    documents = []
  } = useSelector((state) => state.dean);
  
  const [selectedTermFilter, setSelectedTermFilter] = useState('Son Dönem');
  const [isLogsModalOpen, setIsLogsModalOpen] = useState(false);

  useEffect(() => {
    dispatch(fetchDeanDashboardData());
  }, [dispatch]);

  const students = users.filter(u => u.role === 'student');
  const studentCount = students.length > 0 ? students.length : 340;
  
  const avgGpa = students.length > 0
    ? (students.reduce((acc, s) => acc + (s.gpa || 0), 0) / students.length).toFixed(2)
    : '2.94';

  const employmentSuccess = deanOverview?.metrics?.employmentRate 
    ? `%${deanOverview.metrics.employmentRate}` 
    : '%84.2';

  const pendingGrades = courses.filter(c => !c.gradesApproved).length;
  const pendingAssignments = courseAssignments.filter(ca => ca.status === 'pending').length;
  const pendingRequests = studentRequests.filter(sr => sr.status === 'pending').length;
  const pendingGraduations = graduationApprovals.filter(ga => ga.status === 'pending').length;
  const pendingDocs = documents.filter(d => d.status === 'pending').length;

  const totalPendingApprovals = pendingGrades + pendingAssignments + pendingRequests + pendingGraduations + pendingDocs;

  return (
    <section className="dean-page-canvas">
      <div className="dean-welcome-banner">
        <div className="dean-welcome-content">
          <h2 className="dean-welcome-title">Hoş geldiniz, Dekan {currentUser?.name || 'Değerli Dekan'}.</h2>
          <p className="dean-welcome-desc">
            Sistem genelinde aktif <strong>{courses.length || 14} branş / ders</strong> ve <strong>{studentCount} kayıtlı öğrenci</strong> bulunmaktadır.
          </p>
          <p className="dean-welcome-desc">Akademik takvim planlandığı gibi ilerlemektedir.</p>
        </div>
        <span className="material-symbols-outlined dean-welcome-bg-icon">account_balance</span>
      </div>

      <OverviewMetrics 
        studentCount={studentCount} 
        avgGpa={avgGpa} 
        employmentSuccess={employmentSuccess} 
        totalPendingApprovals={totalPendingApprovals} 
      />

      <div className="dean-bento-grid">
        <div className="dean-perf-card">
          <div className="dean-perf-header">
            <div className="dean-perf-title-wrap">
              <h4 className="dean-perf-title">Akademik Performans Grafiği</h4>
              <p className="dean-perf-subtitle">Bölüm bazlı ortalama başarı dağılımı</p>
            </div>
            <select 
              className="dean-perf-select" 
              value={selectedTermFilter} 
              onChange={(e) => setSelectedTermFilter(e.target.value)}
            >
              <option value="Son Dönem">Son Dönem</option>
              <option value="Tüm Dönemler">Tüm Dönemler</option>
            </select>
          </div>
          <div className="dean-perf-list">
            {(selectedTermFilter === 'Son Dönem' ? [
              { label: 'Bilgisayar Mühendisliği', percentage: 88 },
              { label: 'Yazılım Mühendisliği', percentage: 92 },
              { label: 'İşletme', percentage: 76 },
              { label: 'Yönetim Bilişim Sistemleri', percentage: 81 }
            ] : [
              { label: 'Bilgisayar Mühendisliği', percentage: 84 },
              { label: 'Yazılım Mühendisliği', percentage: 89 },
              { label: 'İşletme', percentage: 73 },
              { label: 'Yönetim Bilişim Sistemleri', percentage: 78 },
              { label: 'Moleküler Biyoloji ve Genetik', percentage: 85 },
              { label: 'Matematik', percentage: 80 }
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

        <div className="dean-log-card">
          <div className="dean-log-header">
            <h4 className="dean-log-title">Kritik Sistem Günlüğü</h4>
            <p className="dean-log-subtitle">Gerçek zamanlı akademik akış</p>
          </div>
          <div className="dean-log-timeline overflow-y-auto max-h-[300px] pr-2 flex flex-col gap-4">
            {systemLogs.length > 0 ? (
              systemLogs.slice(0, 5).map((log, idx) => {
                let dotColor = 'dean-log-dot-blue';
                if (log.action?.includes('Red') || log.action?.includes('Kilitle') || log.action?.includes('Askı')) {
                  dotColor = 'dean-log-dot-amber';
                } else if (log.action?.includes('Onay') || log.action?.includes('Aktif')) {
                  dotColor = 'dean-log-dot-green';
                }
                
                return (
                  <div className="dean-log-item flex gap-3 relative pb-2 border-b border-solid border-slate-50 last:border-none" key={log.id || idx}>
                    <div className={`w-2 h-2 rounded-full mt-1.5 shrink-0 ${
                      dotColor === 'dean-log-dot-green' ? 'bg-emerald-500' : dotColor === 'dean-log-dot-amber' ? 'bg-amber-500' : 'bg-blue-500'
                    }`} />
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-center gap-2">
                        <h5 className="font-bold text-[11px] text-slate-800 truncate m-0">{log.action}</h5>
                        <span className="text-[9px] text-slate-400 shrink-0 font-bold">{log.timestamp || 'Yeni'}</span>
                      </div>
                      <p className="text-[10px] text-slate-550 leading-relaxed mt-1 m-0">{log.details} <span className="text-[9px] text-slate-400">({log.operator})</span></p>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="text-center py-6 text-xs text-slate-400">Henüz sistem günlüğü kaydı bulunmamaktadır.</div>
            )}
          </div>
          <button className="dean-log-btn-more w-full mt-4 py-2 border border-slate-200 border-solid hover:bg-slate-50 rounded-xl text-[10px] font-bold text-slate-650 cursor-pointer bg-white transition-all" onClick={() => setIsLogsModalOpen(true)}>
            Tüm Geçmişi Görüntüle
          </button>
        </div>
      </div>

      <FeaturedAcademicians instructors={instructors} />

      <footer className="dean-footer">
        <p className="dean-footer-text">© 2024 OBİS Akademik Bilgi Sistemi. Tüm hakları saklıdır.</p>
        <div className="dean-footer-links">
          <a href="#" className="dean-footer-link">Gizlilik Politikası</a>
          <a href="#" className="dean-footer-link">Kullanım Şartları</a>
          <a href="#" className="dean-footer-link">Kurumsal Kimlik</a>
        </div>
      </footer>

      {isLogsModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl w-full max-w-2xl overflow-hidden shadow-2xl flex flex-col max-h-[80vh] border border-solid border-slate-100">
            <div className="p-5 border-b border-solid border-slate-100 flex justify-between items-center bg-slate-50/50">
              <div>
                <h3 className="font-black text-slate-800 text-sm flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-blue-900 text-base">history</span>
                  Sistem Kritik Günlük Geçmişi
                </h3>
                <p className="text-[10px] text-slate-400 font-medium">Fakültede bugüne dek gerçekleşmiş tüm idari hareketlerin listesi</p>
              </div>
              <button 
                onClick={() => setIsLogsModalOpen(false)}
                className="w-8 h-8 rounded-full border border-solid border-slate-200 bg-white hover:bg-slate-50 cursor-pointer flex items-center justify-center text-slate-500 font-bold"
              >
                <span className="material-symbols-outlined text-sm">close</span>
              </button>
            </div>
            
            <div className="flex-1 overflow-y-auto p-6 space-y-4">
              {systemLogs.map((log, idx) => (
                <div key={log.id || idx} className="p-3 bg-slate-50 rounded-2xl border border-solid border-slate-100/60 flex justify-between items-start gap-4 text-xs">
                  <div className="flex-1 min-w-0">
                    <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest block mb-1">{log.action}</span>
                    <p className="font-bold text-slate-700 m-0">{log.details}</p>
                    <span className="text-[9px] text-slate-400 block mt-1.5 font-bold">Gerçekleştiren: {log.operator}</span>
                  </div>
                  <span className="text-[9px] text-slate-400 shrink-0 font-bold">{log.timestamp}</span>
                </div>
              ))}
              {systemLogs.length === 0 && (
                <p className="text-center py-8 text-slate-400 text-xs italic">Kayıtlı sistem günlüğü bulunmamaktadır.</p>
              )}
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
