import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  fetchDeanDashboardData,
  updateDocumentStatusAsync,
  moderateForumQuestionAsync,
  deleteForumQuestionAsync,
  terminateLiveStreamAsync,
  addScheduleAsync,
  deleteScheduleAsync,
  approveScheduleAsync,
  writeSystemLog,
  addAcademicEventAsync,
  deleteAcademicEventAsync
} from '../../store/dean/deanSlice';

export default function DeanOversight() {
  const dispatch = useDispatch();
  const {
    users,
    courses,
    documents,
    forumQuestions,
    liveStreams,
    schedules,
    academicEvents,
    status
  } = useSelector((state) => state.dean);

  const [activeTab, setActiveTab] = useState('qa');

  // Schedule form states
  const [scheduleCourse, setScheduleCourse] = useState('');
  const [scheduleDay, setScheduleDay] = useState('Pazartesi');
  const [scheduleTime, setScheduleTime] = useState('09:00 - 10:30');
  const [scheduleRoom, setScheduleRoom] = useState('LAB-B3');
  const [scheduleType, setScheduleType] = useState('ders');

  // Academic Calendar form states
  const [calTitle, setCalTitle] = useState('');
  const [calDate, setCalDate] = useState('15.09.2025');
  const [calSemester, setCalSemester] = useState('guz');
  const [calFilter, setCalFilter] = useState('all');
  const [calSearch, setCalSearch] = useState('');

  useEffect(() => {
    dispatch(fetchDeanDashboardData());
  }, [dispatch]);

  // Set default course in state when courses are loaded
  useEffect(() => {
    if (courses.length > 0 && !scheduleCourse) {
      setScheduleCourse(courses[0].id || courses[0].code);
    }
  }, [courses, scheduleCourse]);

  // Helper: Find student info by ID
  const getStudentInfo = (studentId) => {
    const student = users.find((u) => u.id === studentId);
    return student
      ? { name: student.name, number: student.studentNumber || '—' }
      : { name: 'Bilinmeyen Öğrenci', number: '—' };
  };

  // Action handlers
  const handleApproveDocument = (doc) => {
    const student = getStudentInfo(doc.studentId);
    dispatch(updateDocumentStatusAsync({ id: doc.id, status: 'ready' })).then(() => {
      dispatch(
        writeSystemLog({
          operator: 'Prof. Dr. Kemal Arslan',
          action: 'Belge E-İmzalandı',
          details: `${student.name} (${student.number}) isimli öğrencinin "${doc.title}" talebi onaylanıp e-imzalandı.`
        })
      );
      dispatch(fetchDeanDashboardData());
      alert('Belge başarıyla e-imzalandı ve öğrenciye gönderildi!');
    });
  };

  const handleRejectDocument = (doc) => {
    const student = getStudentInfo(doc.studentId);
    dispatch(updateDocumentStatusAsync({ id: doc.id, status: 'rejected' })).then(() => {
      dispatch(
        writeSystemLog({
          operator: 'Prof. Dr. Kemal Arslan',
          action: 'Belge Talebi Reddedildi',
          details: `${student.name} (${student.number}) isimli öğrencinin "${doc.title}" talebi reddedildi.`
        })
      );
      dispatch(fetchDeanDashboardData());
      alert('Belge talebi reddedildi.');
    });
  };

  const handleAlertInstructor = (question) => {
    dispatch(
      writeSystemLog({
        operator: 'Prof. Dr. Kemal Arslan',
        action: 'Eğitmene Soru Uyarısı',
        details: `${question.instructorName} isimli eğitmene, ${question.courseCode} dersindeki yanıtsız soru için bildirim gönderildi.`
      })
    );
    alert(`${question.instructorName} öğretim üyesine cevaplama uyarısı başarıyla iletildi.`);
  };

  const handleResolveReport = (id) => {
    dispatch(moderateForumQuestionAsync({ id, status: 'answered' })).then(() => {
      dispatch(
        writeSystemLog({
          operator: 'Prof. Dr. Kemal Arslan',
          action: 'Forum Raporu Çözüldü',
          details: `#${id} nolu forum sorusundaki şikayet kaldırıldı ve onaylandı.`
        })
      );
      dispatch(fetchDeanDashboardData());
      alert('Şikayet raporu başarıyla kaldırıldı.');
    });
  };

  const handleDeleteQuestion = (id) => {
    if (!window.confirm('Bu soruyu kalıcı olarak forumdan kaldırmak istediğinize emin misiniz?')) return;
    dispatch(deleteForumQuestionAsync(id)).then(() => {
      dispatch(
        writeSystemLog({
          operator: 'Prof. Dr. Kemal Arslan',
          action: 'Forum Sorusu Silindi',
          details: `#${id} nolu soru uygunsuz içerik nedeniyle dekanlık tarafından silindi.`
        })
      );
      dispatch(fetchDeanDashboardData());
      alert('Soru forumdan başarıyla kaldırıldı.');
    });
  };

  const handleTerminateStream = (stream) => {
    if (!window.confirm(`"${stream.courseName}" dersinin canlı yayınını sonlandırmak istediğinize emin misiniz?`)) return;
    dispatch(terminateLiveStreamAsync(stream.id)).then(() => {
      dispatch(
        writeSystemLog({
          operator: 'Prof. Dr. Kemal Arslan',
          action: 'Canlı Ders Sonlandırıldı',
          details: `${stream.instructorName} tarafından yürütülen ${stream.courseCode} dersinin canlı yayını idari kararla kapatıldı.`
        })
      );
      dispatch(fetchDeanDashboardData());
      alert('Canlı yayın başarıyla sonlandırıldı.');
    });
  };

  const handleAddSchedule = () => {
    const selectedCourse = courses.find(c => c.id === scheduleCourse || c.code === scheduleCourse);
    if (!selectedCourse) {
      alert('Lütfen geçerli bir ders seçin.');
      return;
    }

    const payload = {
      courseCode: selectedCourse.id,
      courseName: selectedCourse.name,
      instructorName: selectedCourse.instructor,
      day: scheduleDay,
      timeSlot: scheduleTime,
      room: scheduleRoom,
      type: scheduleType,
      status: 'approved'
    };

    dispatch(addScheduleAsync(payload)).then(() => {
      dispatch(
        writeSystemLog({
          operator: 'Prof. Dr. Kemal Arslan',
          action: 'Program Eklemesi Yapıldı',
          details: `${selectedCourse.id} kodlu ders için ${scheduleDay} günü ${scheduleTime} dilimine program tanımlandı.`
        })
      );
      dispatch(fetchDeanDashboardData());
      alert('Yeni ders/sınav programı başarıyla kaydedildi!');
    });
  };

  const handleApproveSchedule = (id, code) => {
    dispatch(approveScheduleAsync(id)).then(() => {
      dispatch(
        writeSystemLog({
          operator: 'Prof. Dr. Kemal Arslan',
          action: 'Program Girişi Onaylandı',
          details: `${code} kodlu dersin taslak takvim programı onaylandı.`
        })
      );
      dispatch(fetchDeanDashboardData());
      alert('Ders programı başarıyla onaylandı!');
    });
  };

  const handleDeleteSchedule = (id, code) => {
    if (!window.confirm('Bu program kaydını silmek istediğinize emin misiniz?')) return;
    dispatch(deleteScheduleAsync(id)).then(() => {
      dispatch(
        writeSystemLog({
          operator: 'Prof. Dr. Kemal Arslan',
          action: 'Program Silindi',
          details: `${code} dersine ait program kaydı takvimden kaldırıldı.`
        })
      );
      dispatch(fetchDeanDashboardData());
      alert('Program kaydı takvimden kaldırıldı.');
    });
  };

  const handleCreateCalendarEvent = () => {
    if (!calTitle.trim() || !calDate.trim()) {
      alert('Lütfen başlık ve tarih bilgilerini doldurun.');
      return;
    }
    const payload = {
      title: calTitle,
      date: calDate,
      semester: calSemester
    };
    dispatch(addAcademicEventAsync(payload)).then(() => {
      dispatch(writeSystemLog({
        operator: 'Prof. Dr. Kemal Arslan',
        action: 'Akademik Takvim Güncellemesi',
        details: `Akademik takvime yeni etkinlik eklendi: "${calTitle}" (${calDate})`
      }));
      dispatch(fetchDeanDashboardData());
      setCalTitle('');
      alert('Etkinlik akademik takvime başarıyla eklendi!');
    });
  };

  const handleDeleteCalendarEvent = (id, title) => {
    if (!window.confirm(`"${title}" etkinliğini akademik takvimden silmek istediğinize emin misiniz?`)) return;
    dispatch(deleteAcademicEventAsync(id)).then(() => {
      dispatch(writeSystemLog({
        operator: 'Prof. Dr. Kemal Arslan',
        action: 'Akademik Takvim Güncellemesi',
        details: `Akademik takvimden etkinlik silindi: "${title}"`
      }));
      dispatch(fetchDeanDashboardData());
      alert('Etkinlik akademik takvimden silindi.');
    });
  };

  // Metrics Calculations
  // Q&A Stats
  const totalQuestions = forumQuestions.length;
  const unansweredQuestionsCount = forumQuestions.filter((q) => q.status === 'unanswered').length;
  const reportedQuestionsCount = forumQuestions.filter((q) => q.status === 'reported').length;
  const answeredQs = forumQuestions.filter((q) => q.status === 'answered' && q.responseTimeHours !== null);
  const avgResponseTime = answeredQs.length > 0
    ? (answeredQs.reduce((acc, q) => acc + q.responseTimeHours, 0) / answeredQs.length).toFixed(1)
    : '0.0';

  // Documents Stats
  const pendingDocs = documents.filter((d) => d.status === 'pending');

  // Live Streams Stats
  const activeStreams = liveStreams.filter((s) => s.status === 'live');
  const totalViewers = activeStreams.reduce((acc, s) => acc + (s.viewerCount || 0), 0);

  return (
    <section className="app-page-canvas">
      {/* Header Info */}
      <div className="app-header-row mb-6">
        <div className="app-header-info">
          <p className="fac-breadcrumb mb-1">
            YÖNETİM &gt; <span className="fac-breadcrumb-active">DENETİM &amp; GÖZETİM</span>
          </p>
          <h2 className="app-title text-[#00236f] font-black text-xl flex items-center gap-2">
            <span className="material-symbols-outlined text-[24px]">visibility</span>
            Denetim &amp; Gözetim Masası
          </h2>
          <p className="app-desc text-slate-500">
            Fakültenin soru-cevap aktivitelerini, bekleyen e-imzalı belge taleplerini, canlı yayınları ve müfredat takvimlerini tek noktadan denetleyin.
          </p>
        </div>
      </div>

      {/* Tabs Menu Navigation */}
      <div className="flex gap-2 border-b border-slate-200 mb-6 pb-px overflow-x-auto">
        <button
          className={`px-4 py-2.5 font-bold text-xs rounded-t-lg transition-all flex items-center gap-1.5 ${activeTab === 'qa' ? 'bg-[#00236f] text-white' : 'text-slate-600 hover:bg-slate-100'}`}
          onClick={() => setActiveTab('qa')}
        >
          <span className="material-symbols-outlined text-[16px]">forum</span>
          <span>Soru-Cevap Denetimi</span>
          {reportedQuestionsCount > 0 && (
            <span className="px-1.5 py-0.5 bg-rose-600 text-white rounded-full text-[9px] font-black">{reportedQuestionsCount}</span>
          )}
        </button>
        <button
          className={`px-4 py-2.5 font-bold text-xs rounded-t-lg transition-all flex items-center gap-1.5 ${activeTab === 'docs' ? 'bg-[#00236f] text-white' : 'text-slate-600 hover:bg-slate-100'}`}
          onClick={() => setActiveTab('docs')}
        >
          <span className="material-symbols-outlined text-[16px]">description</span>
          <span>Belge İstekleri ({pendingDocs.length})</span>
        </button>
        <button
          className={`px-4 py-2.5 font-bold text-xs rounded-t-lg transition-all flex items-center gap-1.5 ${activeTab === 'live' ? 'bg-[#00236f] text-white' : 'text-slate-600 hover:bg-slate-100'}`}
          onClick={() => setActiveTab('live')}
        >
          <span className="material-symbols-outlined text-[16px]">sensors</span>
          <span>Canlı Yayın Takipçisi ({activeStreams.length})</span>
        </button>
        <button
          className={`px-4 py-2.5 font-bold text-xs rounded-t-lg transition-all flex items-center gap-1.5 ${activeTab === 'schedule' ? 'bg-[#00236f] text-white' : 'text-slate-600 hover:bg-slate-100'}`}
          onClick={() => setActiveTab('schedule')}
        >
          <span className="material-symbols-outlined text-[16px]">calendar_month</span>
          <span>Program &amp; Takvim Yönetimi</span>
        </button>
        <button
          className={`px-4 py-2.5 font-bold text-xs rounded-t-lg transition-all flex items-center gap-1.5 ${activeTab === 'calendar' ? 'bg-[#00236f] text-white' : 'text-slate-600 hover:bg-slate-100'}`}
          onClick={() => setActiveTab('calendar')}
        >
          <span className="material-symbols-outlined text-[16px]">calendar_today</span>
          <span>Akademik Takvim</span>
        </button>
      </div>

      {status === 'loading' ? (
        <div className="flex items-center justify-center py-16 text-slate-500 font-bold text-sm">
          <span className="material-symbols-outlined animate-spin mr-2">sync</span>
          Veriler sunucudan yükleniyor...
        </div>
      ) : (
        <div className="transition-all duration-300">
          
          {/* TAB 1: Q&A MONITOR */}
          {activeTab === 'qa' && (
            <div className="flex flex-col gap-6">
              {/* Q&A Metrics Row */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="bg-white border border-slate-200/60 rounded-xl p-4 shadow-sm flex items-center gap-3">
                  <div className="p-2 bg-blue-50 text-blue-900 rounded-lg">
                    <span className="material-symbols-outlined text-[24px]">quiz</span>
                  </div>
                  <div>
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Toplam Soru</span>
                    <span className="text-lg font-black text-slate-800">{totalQuestions}</span>
                  </div>
                </div>
                <div className="bg-white border border-slate-200/60 rounded-xl p-4 shadow-sm flex items-center gap-3">
                  <div className="p-2 bg-amber-50 text-amber-600 rounded-lg">
                    <span className="material-symbols-outlined text-[24px]">pending_actions</span>
                  </div>
                  <div>
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Cevap Bekleyen</span>
                    <span className="text-lg font-black text-slate-800">{unansweredQuestionsCount}</span>
                  </div>
                </div>
                <div className="bg-white border border-slate-200/60 rounded-xl p-4 shadow-sm flex items-center gap-3">
                  <div className="p-2 bg-rose-50 text-rose-600 rounded-lg">
                    <span className="material-symbols-outlined text-[24px]">report</span>
                  </div>
                  <div>
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Şikayet Edilen</span>
                    <span className="text-lg font-black text-slate-800">{reportedQuestionsCount}</span>
                  </div>
                </div>
                <div className="bg-white border border-slate-200/60 rounded-xl p-4 shadow-sm flex items-center gap-3">
                  <div className="p-2 bg-emerald-50 text-emerald-600 rounded-lg">
                    <span className="material-symbols-outlined text-[24px]">schedule</span>
                  </div>
                  <div>
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Ort. Yanıtlama</span>
                    <span className="text-lg font-black text-slate-800">{avgResponseTime} Saat</span>
                  </div>
                </div>
              </div>

              {/* Q&A List Card */}
              <div className="bg-white border border-slate-200/60 rounded-2xl p-5 shadow-sm">
                <h3 className="text-sm font-black text-slate-800 mb-4 flex items-center gap-2">
                  <span className="material-symbols-outlined text-blue-900">forum</span>
                  Fakülte Ders Forumları Soru Denetim Listesi
                </h3>
                <div className="overflow-x-auto">
                  <table className="min-w-full text-xs text-left text-slate-600">
                    <thead>
                      <tr className="bg-slate-50 text-[10px] font-bold text-slate-400 uppercase tracking-wider border-b border-slate-100">
                        <th className="py-3 px-4">Ders / Hoca</th>
                        <th className="py-3 px-4">Öğrenci</th>
                        <th className="py-3 px-4 w-1/3">Soru İçeriği</th>
                        <th className="py-3 px-4">Durum</th>
                        <th className="py-3 px-4 text-center">İşlem / Aksiyon</th>
                      </tr>
                    </thead>
                    <tbody>
                      {forumQuestions.length > 0 ? (
                        forumQuestions.map((q) => (
                          <tr className="border-b border-slate-50 hover:bg-slate-50 transition-all" key={q.id}>
                            <td className="py-4 px-4">
                              <div className="font-bold text-slate-800">{q.courseName}</div>
                              <div className="text-[10px] text-slate-400">{q.courseCode} — {q.instructorName}</div>
                            </td>
                            <td className="py-4 px-4 font-medium text-slate-700">{q.studentName}</td>
                            <td className="py-4 px-4 text-slate-600 leading-relaxed">
                              {q.questionText}
                              {q.reportedReason && (
                                <div className="mt-1.5 p-2 bg-rose-50 border border-rose-100 rounded text-[10px] text-rose-700 font-medium flex items-center gap-1">
                                  <span className="material-symbols-outlined text-[12px]">info</span>
                                  Şikayet Nedeni: {q.reportedReason}
                                </div>
                              )}
                            </td>
                            <td className="py-4 px-4">
                              <span className={`px-2 py-0.5 rounded-full text-[9px] font-black uppercase ${
                                q.status === 'answered' ? 'bg-emerald-100 text-emerald-700' :
                                q.status === 'reported' ? 'bg-rose-100 text-rose-700' :
                                'bg-slate-100 text-slate-500'
                              }`}>
                                {q.status === 'answered' ? 'Yanıtlandı' : q.status === 'reported' ? 'Raporlandı' : 'Yanıtsız'}
                              </span>
                            </td>
                            <td className="py-4 px-4 text-center">
                              <div className="flex items-center justify-center gap-1.5">
                                {q.status === 'unanswered' && (
                                  <button
                                    onClick={() => handleAlertInstructor(q)}
                                    className="px-2.5 py-1 bg-amber-50 hover:bg-[#00236f] hover:text-white rounded border border-amber-200 text-amber-700 font-bold text-[10px] flex items-center gap-0.5 transition-all"
                                    title="Eğitmene Yanıtlama Uyarısı Gönder"
                                  >
                                    <span className="material-symbols-outlined text-[12px]">mail</span>
                                    <span>Hocayı Uyar</span>
                                  </button>
                                )}
                                {q.status === 'reported' && (
                                  <>
                                    <button
                                      onClick={() => handleResolveReport(q.id)}
                                      className="px-2.5 py-1 bg-emerald-50 hover:bg-emerald-600 hover:text-white rounded border border-emerald-200 text-emerald-700 font-bold text-[10px] transition-all"
                                      title="Şikayeti İptal Et / Güvenli İşaretle"
                                    >
                                      Raporu Kaldır
                                    </button>
                                    <button
                                      onClick={() => handleDeleteQuestion(q.id)}
                                      className="px-2.5 py-1 bg-rose-50 hover:bg-rose-600 hover:text-white rounded border border-rose-200 text-rose-700 font-bold text-[10px] transition-all"
                                      title="Soruyu Forumdan Sil"
                                    >
                                      Gizle / Sil
                                    </button>
                                  </>
                                )}
                                {q.status === 'answered' && (
                                  <span className="text-[10px] text-slate-400 font-medium">
                                    {q.responseTimeHours} sa içinde yanıtlandı
                                  </span>
                                )}
                              </div>
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan="5" className="py-8 text-center text-slate-400 font-medium">
                            Kayıtlı soru bulunmamaktadır.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: DOCUMENT APPROVALS */}
          {activeTab === 'docs' && (
            <div className="bg-white border border-slate-200/60 rounded-2xl p-5 shadow-sm">
              <h3 className="text-sm font-black text-slate-800 mb-2 flex items-center gap-2">
                <span className="material-symbols-outlined text-blue-900">verified_user</span>
                Belge İstekleri Onay Sırası
              </h3>
              <p className="text-[11px] text-slate-500 mb-4">
                Öğrencilerin talep ettiği Transkript ve Öğrenci Belgelerini inceleyin. Onay verdiğinizde belgeye dekanlık e-imzası basılacaktır.
              </p>
              <div className="overflow-x-auto">
                <table className="min-w-full text-xs text-left text-slate-600">
                  <thead>
                    <tr className="bg-slate-50 text-[10px] font-bold text-slate-400 uppercase tracking-wider border-b border-slate-100">
                      <th className="py-3 px-4">Öğrenci Adı / No</th>
                      <th className="py-3 px-4">İstenen Belge</th>
                      <th className="py-3 px-4">Açıklama</th>
                      <th className="py-3 px-4">Talep Tarihi</th>
                      <th className="py-3 px-4">Doğrulama Kodu</th>
                      <th className="py-3 px-4">Durum</th>
                      <th className="py-3 px-4 text-right">İşlemler</th>
                    </tr>
                  </thead>
                  <tbody>
                    {documents.filter(d => d.status === 'pending').length > 0 ? (
                      documents
                        .filter((d) => d.status === 'pending')
                        .map((doc) => {
                          const student = getStudentInfo(doc.studentId);
                          return (
                            <tr className="border-b border-slate-50 hover:bg-slate-50 transition-all" key={doc.id}>
                              <td className="py-4 px-4">
                                <div className="font-bold text-slate-800">{student.name}</div>
                                <div className="text-[10px] text-slate-400">No: {student.number}</div>
                              </td>
                              <td className="py-4 px-4 font-bold text-[#00236f]">{doc.title}</td>
                              <td className="py-4 px-4 text-slate-500">{doc.desc}</td>
                              <td className="py-4 px-4">{doc.requestDate}</td>
                              <td className="py-4 px-4">
                                <code className="bg-slate-100 px-1.5 py-0.5 rounded text-slate-600 font-mono text-[10px]">
                                  {doc.verificationCode}
                                </code>
                              </td>
                              <td className="py-4 px-4">
                                <span className="px-2 py-0.5 bg-amber-100 text-amber-700 rounded-full text-[9px] font-black uppercase">
                                  BEKLİYOR
                                </span>
                              </td>
                              <td className="py-4 px-4 text-right">
                                <div className="flex justify-end gap-1.5">
                                  <button
                                    onClick={() => handleApproveDocument(doc)}
                                    className="px-3 py-1 bg-[#00236f] hover:bg-blue-900 text-white rounded font-bold text-[10px] flex items-center gap-0.5 transition-all"
                                  >
                                    <span className="material-symbols-outlined text-[12px]">draw</span>
                                    <span>E-İmzala</span>
                                  </button>
                                  <button
                                    onClick={() => handleRejectDocument(doc)}
                                    className="px-3 py-1 bg-slate-100 hover:bg-rose-600 hover:text-white rounded font-bold text-[10px] transition-all"
                                  >
                                    Reddet
                                  </button>
                                </div>
                              </td>
                            </tr>
                          );
                        })
                    ) : (
                      <tr>
                        <td colSpan="7" className="py-12 text-center text-slate-400 font-medium">
                          Bekleyen resmi belge onay isteği bulunmamaktadır.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 3: ACTIVE LIVE STREAMS */}
          {activeTab === 'live' && (
            <div className="flex flex-col gap-6">
              {/* Live Streams KPIs */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-white border border-slate-200/60 rounded-xl p-4 shadow-sm flex items-center gap-3">
                  <div className="p-2 bg-emerald-50 text-emerald-600 rounded-lg relative">
                    <span className="material-symbols-outlined text-[24px]">sensors</span>
                    <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-emerald-500 rounded-full animate-ping"></span>
                  </div>
                  <div>
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Yayındaki Aktif Dersler</span>
                    <span className="text-lg font-black text-slate-800">{activeStreams.length} Ders</span>
                  </div>
                </div>
                <div className="bg-white border border-slate-200/60 rounded-xl p-4 shadow-sm flex items-center gap-3">
                  <div className="p-2 bg-blue-50 text-blue-900 rounded-lg">
                    <span className="material-symbols-outlined text-[24px]">groups</span>
                  </div>
                  <div>
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Yayındaki Toplam İzleyici</span>
                    <span className="text-lg font-black text-slate-800">{totalViewers} Öğrenci</span>
                  </div>
                </div>
              </div>

              {/* Streams List Card */}
              <div className="bg-white border border-slate-200/60 rounded-2xl p-5 shadow-sm">
                <h3 className="text-sm font-black text-slate-800 mb-4 flex items-center gap-2">
                  <span className="material-symbols-outlined text-red-600">videocam</span>
                  Fakülte Canlı Yayın Denetimi (Aktif Dersler)
                </h3>
                <div className="overflow-x-auto">
                  <table className="min-w-full text-xs text-left text-slate-600">
                    <thead>
                      <tr className="bg-slate-50 text-[10px] font-bold text-slate-400 uppercase tracking-wider border-b border-slate-100">
                        <th className="py-3 px-4">Ders Kodu &amp; Adı</th>
                        <th className="py-3 px-4">Eğitmen</th>
                        <th className="py-3 px-4">Yayın Başlangıcı</th>
                        <th className="py-3 px-4">Aktif İzleyici Sayısı</th>
                        <th className="py-3 px-4">Yayın Durumu</th>
                        <th className="py-3 px-4 text-right">İdari İşlem</th>
                      </tr>
                    </thead>
                    <tbody>
                      {liveStreams.length > 0 ? (
                        liveStreams.map((stream) => (
                          <tr className="border-b border-slate-50 hover:bg-slate-50 transition-all" key={stream.id}>
                            <td className="py-4 px-4 font-bold text-slate-800">
                              {stream.courseCode} — {stream.courseName}
                            </td>
                            <td className="py-4 px-4 font-medium">{stream.instructorName}</td>
                            <td className="py-4 px-4 text-slate-500">{stream.startTime}</td>
                            <td className="py-4 px-4">
                              {stream.status === 'live' ? (
                                <div className="flex items-center gap-1.5">
                                  <span className="font-bold text-slate-800">{stream.viewerCount}</span>
                                  <span className="text-[10px] text-slate-400">öğrenci izliyor</span>
                                </div>
                              ) : '—'}
                            </td>
                            <td className="py-4 px-4">
                              <span className={`px-2 py-0.5 rounded-full text-[9px] font-black uppercase flex items-center w-fit gap-1 ${
                                stream.status === 'live' ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-400'
                              }`}>
                                {stream.status === 'live' && (
                                  <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse"></span>
                                )}
                                {stream.status === 'live' ? 'CANLI YAYINDA' : 'SONLANDI'}
                              </span>
                            </td>
                            <td className="py-4 px-4 text-right">
                              {stream.status === 'live' ? (
                                <button
                                  onClick={() => handleTerminateStream(stream)}
                                  className="px-3 py-1 bg-rose-50 hover:bg-rose-600 hover:text-white rounded border border-rose-200 text-rose-700 font-bold text-[10px] transition-all"
                                >
                                  Yayını Kapat
                                </button>
                              ) : (
                                <span className="text-[10px] text-slate-400 font-medium">İşlem Gerekmiyor</span>
                              )}
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan="6" className="py-8 text-center text-slate-400 font-medium">
                            Kayıtlı yayın bulunmamaktadır.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: SCHEDULE & CALENDAR MANAGEMENT */}
          {activeTab === 'schedule' && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              
              {/* Left Column: Form to Add Schedule */}
              <div className="lg:col-span-1">
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
                      className="w-full py-2.5 bg-[#00236f] hover:bg-blue-900 text-white font-bold text-xs rounded-xl transition-all flex items-center justify-center gap-1"
                    >
                      <span className="material-symbols-outlined text-[16px]">save</span>
                      <span>Takvime Kaydet</span>
                    </button>
                  </div>
                </div>
              </div>

              {/* Right Column: Listing Schedules */}
              <div className="lg:col-span-2 flex flex-col gap-6">
                <div className="bg-white border border-slate-200/60 rounded-2xl p-5 shadow-sm">
                  <h3 className="text-sm font-black text-slate-800 mb-4 flex items-center gap-2">
                    <span className="material-symbols-outlined text-blue-900">calendar_view_week</span>
                    Haftalık Takvim &amp; Sınav Programı Listesi
                  </h3>
                  <div className="overflow-x-auto">
                    <table className="min-w-full text-xs text-left text-slate-600">
                      <thead>
                        <tr className="bg-slate-50 text-[10px] font-bold text-slate-400 uppercase tracking-wider border-b border-slate-100">
                          <th className="py-2.5 px-3">Tür</th>
                          <th className="py-2.5 px-3">Ders / Hoca</th>
                          <th className="py-2.5 px-3">Zamanlama</th>
                          <th className="py-2.5 px-3">Derslik</th>
                          <th className="py-2.5 px-3">Durum</th>
                          <th className="py-2.5 px-3 text-right">Aksiyon</th>
                        </tr>
                      </thead>
                      <tbody>
                        {schedules.length > 0 ? (
                          schedules.map((item) => (
                            <tr className="border-b border-slate-50 hover:bg-slate-50 transition-all" key={item.id}>
                              <td className="py-3 px-3">
                                <span className={`px-2 py-0.5 rounded text-[8px] font-black uppercase ${
                                  item.type === 'sinav' ? 'bg-amber-100 text-amber-700' : 'bg-blue-100 text-[#00236f]'
                                }`}>
                                  {item.type === 'sinav' ? 'SINAV' : 'DERS'}
                                </span>
                              </td>
                              <td className="py-3 px-3">
                                <div className="font-bold text-slate-800">{item.courseName}</div>
                                <div className="text-[9px] text-slate-400">{item.courseCode} — {item.instructorName}</div>
                              </td>
                              <td className="py-3 px-3 font-medium text-slate-700">
                                {item.day}, {item.timeSlot}
                              </td>
                              <td className="py-3 px-3">
                                <code className="bg-slate-100 px-1.5 py-0.5 rounded font-mono text-[10px] text-slate-600">
                                  {item.room}
                                </code>
                              </td>
                              <td className="py-3 px-3">
                                <span className={`px-1.5 py-0.5 rounded text-[8px] font-bold ${
                                  item.status === 'approved' ? 'text-emerald-600 bg-emerald-50' : 'text-amber-600 bg-amber-50'
                                }`}>
                                  {item.status === 'approved' ? 'ONAYLI' : 'ONAY BEKLİYOR'}
                                </span>
                              </td>
                              <td className="py-3 px-3 text-right">
                                <div className="flex justify-end gap-1">
                                  {item.status === 'pending' && (
                                    <button
                                      onClick={() => handleApproveSchedule(item.id, item.courseCode)}
                                      className="px-2 py-1 bg-emerald-50 hover:bg-emerald-600 hover:text-white rounded border border-emerald-200 text-emerald-700 font-bold text-[9px] transition-all"
                                      title="Program Girişini Onayla"
                                    >
                                      Onayla
                                    </button>
                                  )}
                                  <button
                                    onClick={() => handleDeleteSchedule(item.id, item.courseCode)}
                                    className="px-2 py-1 bg-slate-100 hover:bg-rose-600 hover:text-white rounded font-bold text-[9px] transition-all"
                                    title="Takvimden Kaldır"
                                  >
                                    Sil
                                  </button>
                                </div>
                              </td>
                            </tr>
                          ))
                        ) : (
                          <tr>
                            <td colSpan="6" className="py-8 text-center text-slate-400 font-medium">
                              Takvimde herhangi bir program kaydı bulunmamaktadır.
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>

            </div>
          )}

          {/* TAB 5: ACADEMIC CALENDAR MANAGEMENT */}
          {activeTab === 'calendar' && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              
              {/* Left Column: Form to Add Event */}
              <div className="lg:col-span-1">
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
                      className="w-full py-2.5 bg-[#00236f] hover:bg-blue-900 text-white font-bold text-xs rounded-xl transition-all flex items-center justify-center gap-1"
                    >
                      <span className="material-symbols-outlined text-[16px]">add_circle</span>
                      <span>Takvime Ekle</span>
                    </button>
                  </div>
                </div>
              </div>

              {/* Right Column: Event List Card */}
              <div className="lg:col-span-2 flex flex-col gap-4">
                
                {/* Filters Row */}
                <div className="bg-white border border-slate-200/60 rounded-2xl p-4 shadow-sm flex flex-col md:flex-row justify-between items-center gap-3">
                  <div className="flex flex-wrap gap-1">
                    {[
                      { id: 'all', label: 'Tümü' },
                      { id: 'guz', label: 'Güz Yarıyılı' },
                      { id: 'bahar', label: 'Bahar Yarıyılı' },
                      { id: 'yaz', label: 'Yaz Öğretimi' },
                      { id: 'tatil', label: 'Resmi Tatiller' }
                    ].map((btn) => (
                      <button
                        key={btn.id}
                        onClick={() => setCalFilter(btn.id)}
                        className={`px-2.5 py-1.5 rounded-lg font-bold text-[10px] transition-all ${
                          calFilter === btn.id
                            ? 'bg-[#00236f] text-white'
                            : 'bg-slate-50 text-slate-600 hover:bg-slate-100'
                        }`}
                      >
                        {btn.label}
                      </button>
                    ))}
                  </div>

                  <input
                    type="text"
                    className="border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs w-full md:w-48 focus:outline-none focus:ring-1 focus:ring-[#00236f]"
                    placeholder="Takvimde ara..."
                    value={calSearch}
                    onChange={(e) => setCalSearch(e.target.value)}
                  />
                </div>

                {/* Table Card */}
                <div className="bg-white border border-slate-200/60 rounded-2xl p-5 shadow-sm">
                  <div className="overflow-x-auto">
                    <table className="min-w-full text-xs text-left text-slate-600">
                      <thead>
                        <tr className="bg-slate-50 text-[10px] font-bold text-slate-400 uppercase tracking-wider border-b border-slate-100">
                          <th className="py-2.5 px-3 w-12 text-center">#</th>
                          <th className="py-2.5 px-3">Tarih</th>
                          <th className="py-2.5 px-3 w-1/2">Etkinlik Başlığı</th>
                          <th className="py-2.5 px-3">Kategori</th>
                          <th className="py-2.5 px-3 text-right">İşlem</th>
                        </tr>
                      </thead>
                      <tbody>
                        {academicEvents && academicEvents.length > 0 ? (
                          academicEvents
                            .filter((event) => {
                              const q = calSearch.toLowerCase();
                              const matchesSearch =
                                event.title.toLowerCase().includes(q) ||
                                event.date.toLowerCase().includes(q);
                              const matchesTab =
                                calFilter === 'all' || event.semester === calFilter;
                              return matchesSearch && matchesTab;
                            })
                            .map((event, idx) => (
                              <tr className="border-b border-slate-50 hover:bg-slate-50 transition-all" key={event.id}>
                                <td className="py-3 px-3 text-center text-slate-400 font-medium">{idx + 1}</td>
                                <td className="py-3 px-3 font-bold text-slate-800">{event.date}</td>
                                <td className="py-3 px-3 text-slate-700 font-medium">{event.title}</td>
                                <td className="py-3 px-3">
                                  <span className={`px-2 py-0.5 rounded text-[8px] font-black uppercase ${
                                    event.semester === 'guz' ? 'bg-blue-50 text-blue-700' :
                                    event.semester === 'bahar' ? 'bg-emerald-50 text-emerald-700' :
                                    event.semester === 'yaz' ? 'bg-purple-50 text-purple-700' :
                                    'bg-rose-50 text-rose-700'
                                  }`}>
                                    {
                                      event.semester === 'guz' ? 'Güz Yarıyılı' :
                                      event.semester === 'bahar' ? 'Bahar Yarıyılı' :
                                      event.semester === 'yaz' ? 'Yaz Öğretimi' : 'Resmi Tatil'
                                    }
                                  </span>
                                </td>
                                <td className="py-3 px-3 text-right">
                                  <button
                                    onClick={() => handleDeleteCalendarEvent(event.id, event.title)}
                                    className="px-2 py-1 bg-slate-100 hover:bg-rose-600 hover:text-white rounded font-bold text-[9px] transition-all"
                                    title="Etkinliği Sil"
                                  >
                                    Sil
                                  </button>
                                </td>
                              </tr>
                            ))
                        ) : (
                          <tr>
                            <td colSpan="5" className="py-8 text-center text-slate-400 font-medium">
                              Takvimde herhangi bir etkinlik kaydı bulunmamaktadır.
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>

              </div>

            </div>
          )}

        </div>
      )}
    </section>
  );
}
