import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchDeanDashboardData, updateStudentAdvisorAsync, writeSystemLog } from '../../store/dean/deanSlice';
import { toast } from 'react-hot-toast';

export default function StudentAnalytics() {
  const dispatch = useDispatch();
  const { currentUser } = useSelector((state) => state.auth || {});
  const { users = [], studentAnalytics, deanOverview, instructors = [] } = useSelector((state) => state.dean);
  
  const [isStoriesModalOpen, setIsStoriesModalOpen] = useState(false);
  const [selectedStudentForAdvisor, setSelectedStudentForAdvisor] = useState(null);

  useEffect(() => {
    dispatch(fetchDeanDashboardData());
  }, [dispatch]);

  const students = users.filter(u => u.role === 'student');
  const studentCount = students.length;

  const riskStudents = students.filter(s => (s.gpa || 0) < 2.5);

  const placedStudents = students.filter(s => s.status === 'graduated' || s.tuitionPaid === false);
  const internStudents = students.filter(s => s.advisorId && s.status !== 'graduated');
  const interviewStudents = students.filter(s => s.gpa >= 3.5 && s.status !== 'graduated');

  const funnelStages = [
    { name: 'Eğitimde', count: students.length, percentage: 100, color: 'blue' },
    { name: 'Stajda/Pratikte', count: internStudents.length, percentage: Math.round((internStudents.length / (students.length || 1)) * 100), color: 'navy' },
    { name: 'Mülakat/Değerlendirme', count: interviewStudents.length, percentage: Math.round((interviewStudents.length / (students.length || 1)) * 100), color: 'navy' },
    { name: 'Yerleşti / Mezun', count: placedStudents.length, percentage: Math.round((placedStudents.length / (students.length || 1)) * 100), color: 'green' }
  ];

  const placementData = students
    .filter(s => s.internshipCompany)
    .map(s => ({
      studentName: s.name,
      company: s.internshipCompany,
      department: s.departmentId === 'd2' ? 'Yazılım Mühendisliği' : 'Bilgisayar Mühendisliği'
    }));

  const fallbackPlacementData = [
    { studentName: 'Ahmet Yılmaz', company: 'Aselsan A.Ş.', department: 'Yazılım Mühendisliği' },
    { studentName: 'Mehmet Demir', company: 'Havelsan', department: 'Bilgisayar Mühendisliği' },
    { studentName: 'Zeynep Kaya', company: 'Bayer Pharmaceuticals', department: 'Moleküler Biyoloji' },
    { studentName: 'Elif Şahin', company: 'Türk Hava Yolları', department: 'Endüstri Mühendisliği' }
  ];

  const actualPlacementList = placementData.length > 0 ? placementData : fallbackPlacementData;

  const successStories = studentAnalytics?.successStories || [
    { name: 'Merve Bulut', title: 'Yazılım Mühendisi @ Google', avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&q=80', time: '2 gün önce', quote: 'Üniversite hayatım boyunca yaptığım projeler ve hocalarımın desteği Google kapılarını açtı.' },
    { name: 'Caner Şen', title: 'Veri Analisti @ Trendyol', avatar: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=150&q=80', time: '1 hafta önce', quote: 'Müfredattaki uygulamalı dersler sayesinde Trendyol mülakat sürecinde hiç zorlanmadım.' },
    { name: 'Büşra Koç', title: 'Biyolog @ Pfizer', avatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150&q=80', time: '2 hafta önce', quote: 'Lab çalışmalarının kalitesi ve hocalarımın yönlendirmesiyle global bir firmada staj imkanı buldum.' }
  ];

  const avgGpa = students.length > 0
    ? (students.reduce((acc, s) => acc + (s.gpa || 0), 0) / students.length).toFixed(2)
    : '0.00';

  const riskRate = students.length > 0
    ? Math.round((riskStudents.length / students.length) * 100)
    : 0;

  const placementRate = students.length > 0
    ? Math.round((placedStudents.length / students.length) * 100)
    : 0;

  const handleAssignAdvisor = (student, advisorId) => {
    if (!advisorId) return;
    const teachersList = users.filter(u => u.role === 'teacher');
    const chosenAdvisor = teachersList.find(t => t.id === advisorId);
    if (!chosenAdvisor) return;

    dispatch(updateStudentAdvisorAsync({ 
      id: student.id, 
      advisorId: chosenAdvisor.id,
      advisor: chosenAdvisor.name
    })).then(() => {
      dispatch(writeSystemLog({
        operator: currentUser?.name || 'Prof. Dr. Mehmet Kaya',
        action: 'Akademik Danışman Atandı',
        details: `${student.name} isimli risk grubundaki öğrenciye ${chosenAdvisor.name} akademik danışman olarak atandı.`
      }));
      dispatch(fetchDeanDashboardData());
      toast.success(`${student.name} öğrencisine ${chosenAdvisor.name} danışman olarak atandı!`);
    });
  };

  const handleAssignAdvisorAutomatically = (student) => {
    const teachersList = users.filter(u => u.role === 'teacher');
    const matchingAdvisors = teachersList.filter(t => t.departmentId === student.departmentId);
    const chosenAdvisor = matchingAdvisors.length > 0 ? matchingAdvisors[0] : teachersList[0];

    if (!chosenAdvisor) {
      toast.error('Atama yapılacak uygun bir akademik danışman bulunamadı.');
      return;
    }

    dispatch(updateStudentAdvisorAsync({ 
      id: student.id, 
      advisorId: chosenAdvisor.id,
      advisor: chosenAdvisor.name
    })).then(() => {
      dispatch(writeSystemLog({
        operator: currentUser?.name || 'Prof. Dr. Mehmet Kaya',
        action: 'Akademik Danışman Atandı',
        details: `${student.name} isimli risk grubundaki öğrenciye ${chosenAdvisor.name} akademik danışman olarak atandı.`
      }));
      dispatch(fetchDeanDashboardData());
      toast.success(`${student.name} öğrencisine ${chosenAdvisor.name} danışman olarak atandı!`);
    });
  };

  return (
    <section className="an-page-canvas">
      <div className="an-breadcrumb-wrap flex justify-between items-center bg-white p-6 rounded-3xl border border-solid border-slate-100 shadow-sm mb-6">
        <div className="an-breadcrumb-left">
          <h2 className="an-breadcrumb-title font-black text-slate-800 text-lg">Kariyer Hunisi &amp; Akademik Analitik</h2>
          <p className="an-breadcrumb-desc text-xs text-slate-450 mt-1">Mezuniyet öncesi istihdam süreçleri ve akademik risk analizi takibi</p>
        </div>
        <div className="an-breadcrumb-right flex flex-col items-end">
          <span className="an-right-lbl text-[10px] font-black text-slate-400 uppercase tracking-wider">TOPLAM AKTİF ÖĞRENCİ</span>
          <span className="an-right-val text-xl font-black text-blue-900 mt-1">{studentCount} Öğrenci</span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
        <div className="bg-white p-5 rounded-3xl border border-solid border-slate-100 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-blue-50 text-[#00236f] flex items-center justify-center">
            <span className="material-symbols-outlined">analytics</span>
          </div>
          <div>
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider block">Fakülte GANO Ort.</span>
            <h3 className="text-lg font-black text-slate-800 mt-1">{avgGpa} <span className="text-xs text-slate-400 font-normal">/ 4.00</span></h3>
          </div>
        </div>

        <div className="bg-white p-5 rounded-3xl border border-solid border-slate-100 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-650 flex items-center justify-center">
            <span className="material-symbols-outlined">warning</span>
          </div>
          <div>
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider block">Akademik Risk Oranı</span>
            <h3 className="text-lg font-black text-slate-800 mt-1">%{riskRate}</h3>
          </div>
        </div>

        <div className="bg-white p-5 rounded-3xl border border-solid border-slate-100 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
            <span className="material-symbols-outlined">work</span>
          </div>
          <div>
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider block">Mezun Yerleşim Oranı</span>
            <h3 className="text-lg font-black text-slate-800 mt-1">%{placementRate}</h3>
          </div>
        </div>

        <div className="bg-white p-5 rounded-3xl border border-solid border-slate-100 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-purple-50 text-purple-650 flex items-center justify-center">
            <span className="material-symbols-outlined">assignment_ind</span>
          </div>
          <div>
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider block">Stajdaki Öğrenci</span>
            <h3 className="text-lg font-black text-slate-800 mt-1">{internStudents.length} Stajyer</h3>
          </div>
        </div>
      </div>

      <div className="an-funnel-row flex gap-4 mb-6 overflow-x-auto pb-2">
        {funnelStages.map((stage, idx) => (
          <div className="flex-1 min-w-[200px] p-5 bg-white rounded-3xl border border-solid border-slate-100 shadow-sm flex flex-col justify-between relative overflow-hidden" key={idx}>
            <div>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{stage.name}</span>
              <h4 className="text-xl font-black text-slate-800 mt-2">{stage.count} Öğrenci</h4>
            </div>
            <div className="mt-4 flex items-center gap-2">
              <div className="flex-1 bg-slate-100 h-1.5 rounded-full overflow-hidden">
                <div className={`h-full ${stage.color === 'green' ? 'bg-emerald-500' : 'bg-[#00236f]'}`} style={{ width: `${stage.percentage}%` }} />
              </div>
              <span className="text-[10px] font-black text-slate-500">% {stage.percentage}</span>
            </div>
          </div>
        ))}
      </div>

      <div className="an-main-grid grid grid-cols-12 gap-6">
        <div className="col-span-12 lg:col-span-8 space-y-6">
          <div className="bg-white p-6 rounded-3xl border border-solid border-slate-100 shadow-sm">
            <div className="flex justify-between items-center mb-4">
              <div>
                <h4 className="font-black text-slate-800 text-sm flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-amber-500 text-base">warning</span>
                  Akademik Risk Analizi
                </h4>
                <p className="text-[10px] text-slate-450 mt-1">GANO &lt; 2.50 olan aktif öğrenciler listesi</p>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full border-collapse text-left text-xs">
                <thead>
                  <tr className="border-b border-solid border-slate-100">
                    <th className="pb-3 font-black text-slate-400 text-[10px] uppercase">ÖĞRENCİ</th>
                    <th className="pb-3 font-black text-slate-400 text-[10px] uppercase">DURUM</th>
                    <th className="pb-3 font-black text-slate-400 text-[10px] uppercase">GANO</th>
                    <th className="pb-3 font-black text-slate-400 text-[10px] uppercase">DANIŞMAN</th>
                    <th className="pb-3 font-black text-slate-400 text-[10px] uppercase text-right">EYLEM</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {riskStudents.map((student, idx) => {
                    const currentAdvisor = users.find(u => u.role === 'teacher' && u.id === student.advisorId);
                    return (
                      <tr className="hover:bg-slate-50/50" key={student.id || idx}>
                        <td className="py-3 flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-[#00236f] text-white flex items-center justify-center font-bold text-[10px]">
                            {student.name?.slice(0, 2).toUpperCase()}
                          </div>
                          <div>
                            <span className="font-bold text-slate-800 block">{student.name}</span>
                            <span className="text-[9px] text-slate-400">No: {student.studentNumber || '30491'}</span>
                          </div>
                        </td>
                        <td className="py-3 text-slate-600 font-medium">
                          {student.departmentId === 'd2' ? 'Yazılım Müh.' : 'Bilgisayar Müh.'}
                        </td>
                        <td className="py-3 font-black text-rose-600">{student.gpa || '1.80'}</td>
                        <td className="py-3 text-slate-500 font-medium">
                          <div className="flex flex-col gap-1">
                            <span className="font-semibold">{currentAdvisor ? currentAdvisor.name : (student.advisor || 'Atanmadı')}</span>
                            <select
                              value={student.advisorId || ''}
                              onChange={(e) => handleAssignAdvisor(student, e.target.value)}
                              className="px-2 py-1 bg-white border border-slate-200 rounded-lg text-[10px] font-bold text-slate-700 focus:outline-none focus:ring-1 focus:ring-blue-500 max-w-[155px] cursor-pointer"
                            >
                              <option value="">Danışman Değiştir...</option>
                              {users.filter(u => u.role === 'teacher').map(t => (
                                <option key={t.id} value={t.id}>{t.name}</option>
                              ))}
                            </select>
                          </div>
                        </td>
                        <td className="py-3 text-right">
                          <button 
                            onClick={() => handleAssignAdvisorAutomatically(student)}
                            className="px-3 py-1.5 bg-[#00236f] hover:bg-blue-900 text-white font-bold text-[10px] rounded-lg border-none cursor-pointer transition-all"
                          >
                            Otomatik Danışman Ata
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                  {riskStudents.length === 0 && (
                    <tr>
                      <td colSpan="5" className="text-center py-6 text-slate-400 italic">Akademik risk altında öğrenci bulunmamaktadır.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          <div className="bg-white p-6 rounded-3xl border border-solid border-slate-100 shadow-sm">
            <div className="mb-4">
              <h4 className="font-black text-slate-800 text-sm flex items-center gap-1.5">
                <span className="material-symbols-outlined text-emerald-500 text-base">domain</span>
                Aktif Staj / Şirket Eşleşmeleri
              </h4>
              <p className="text-[10px] text-slate-450 mt-1">Öğrencilerin staj yaptığı kurumlar ve çalışma alanları</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {actualPlacementList.map((item, idx) => (
                <div key={idx} className="p-4 bg-slate-50 rounded-2xl border border-solid border-slate-100 flex justify-between items-center gap-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-[#00236f]/10 text-[#00236f] flex items-center justify-center">
                      <span className="material-symbols-outlined">apartment</span>
                    </div>
                    <div>
                      <span className="font-black text-slate-800 text-xs block">{item.company}</span>
                      <span className="text-[10px] text-slate-550 font-bold block mt-0.5">{item.studentName}</span>
                    </div>
                  </div>
                  <span className="text-[9px] font-black text-blue-900 bg-blue-50 px-2.5 py-1 rounded-full">{item.department}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="col-span-12 lg:col-span-4">
          <div className="bg-white p-6 rounded-3xl border border-solid border-slate-100 shadow-sm h-full flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                  <span className="material-symbols-outlined text-base">handshake</span>
                </div>
                <h4 className="font-black text-slate-800 text-xs uppercase tracking-wider">Yerleşen Mezunlar</h4>
              </div>

              <div className="space-y-4">
                {successStories.slice(0, 3).map((story, idx) => (
                  <div className="flex gap-3 items-start pb-4 border-b border-solid border-slate-50 last:border-none" key={idx}>
                    <img 
                      className="w-10 h-10 rounded-xl object-cover shrink-0" 
                      src={story.avatar} 
                      alt={story.name} 
                    />
                    <div className="min-w-0 flex-1">
                      <div className="flex justify-between items-center gap-2">
                        <span className="font-bold text-slate-800 text-xs">{story.name}</span>
                        <span className="text-[9px] text-slate-400 font-bold">{story.time}</span>
                      </div>
                      <span className="text-[10px] text-blue-900 font-bold block mt-0.5">{story.title}</span>
                      <p className="text-[10px] text-slate-500 italic mt-1 leading-relaxed">"{story.quote}"</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <button 
              onClick={() => setIsStoriesModalOpen(true)}
              className="w-full mt-4 py-2.5 bg-slate-50 hover:bg-slate-100 rounded-xl border border-solid border-slate-200 text-xs font-bold text-slate-650 cursor-pointer transition-all"
            >
              Tüm Başarı Hikayelerini İncele
            </button>
          </div>
        </div>
      </div>

      {isStoriesModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl w-full max-w-lg overflow-hidden shadow-2xl flex flex-col max-h-[85vh] border border-solid border-slate-100 animate-fade-in">
            <div className="p-5 border-b border-solid border-slate-100 flex justify-between items-center bg-slate-50/50">
              <div>
                <h3 className="font-black text-slate-800 text-sm flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-emerald-600 text-base">military_tech</span>
                  Mezun Başarı Hikayeleri
                </h3>
                <p className="text-[10px] text-slate-450 font-medium">Fakültemizden mezun olup kariyere adım atan parlak zihinler</p>
              </div>
              <button 
                onClick={() => setIsStoriesModalOpen(false)}
                className="w-8 h-8 rounded-full border border-solid border-slate-200 bg-white hover:bg-slate-50 cursor-pointer flex items-center justify-center text-slate-500 font-bold"
              >
                <span className="material-symbols-outlined text-sm">close</span>
              </button>
            </div>
            
            <div className="flex-1 overflow-y-auto p-6 space-y-4">
              {successStories.map((story, idx) => (
                <div key={idx} className="p-4 bg-slate-50 rounded-2xl border border-solid border-slate-100/60 flex gap-4 items-start text-xs">
                  <img 
                    className="w-12 h-12 rounded-xl object-cover shrink-0" 
                    src={story.avatar} 
                    alt={story.name} 
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-center">
                      <span className="font-black text-slate-800">{story.name}</span>
                      <span className="text-[9px] text-slate-400 font-bold">{story.time}</span>
                    </div>
                    <span className="text-[10px] font-black text-blue-900 block mt-0.5">{story.title}</span>
                    <p className="text-slate-600 leading-relaxed mt-2 italic">"{story.quote}"</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
