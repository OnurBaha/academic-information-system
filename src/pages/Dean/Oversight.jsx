import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  fetchDeanDashboardData,
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
import { toast } from 'react-hot-toast';
import ScheduleForm from '../../components/curriculum/ScheduleForm';
import CalendarForm from '../../components/curriculum/CalendarForm';
import QaMonitor from '../../components/curriculum/QaMonitor';
import ConfirmationModal from '../../components/UI/ConfirmationModal';

export default function DeanOversight() {
  const dispatch = useDispatch();
  const { currentUser } = useSelector((state) => state.auth || {});
  const {
    users = [],
    courses = [],
    forumQuestions = [],
    liveStreams = [],
    schedules = [],
    academicEvents = [],
    status
  } = useSelector((state) => state.dean);

  const [activeTab, setActiveTab] = useState('qa');
  const [modalConfig, setModalConfig] = useState({ isOpen: false, title: '', message: '', onConfirm: null, confirmType: 'danger' });
  const [scheduleCourse, setScheduleCourse] = useState('');
  const [scheduleDay, setScheduleDay] = useState('Pazartesi');
  const [scheduleTime, setScheduleTime] = useState('09:00 - 10:30');
  const [scheduleRoom, setScheduleRoom] = useState('LAB-B3');
  const [scheduleType, setScheduleType] = useState('ders');
  const [calTitle, setCalTitle] = useState('');
  const [calDate, setCalDate] = useState('15.09.2025');
  const [calSemester, setCalSemester] = useState('guz');
  const [calFilter, setCalFilter] = useState('all');
  const [calSearch, setCalSearch] = useState('');

  useEffect(() => {
    dispatch(fetchDeanDashboardData());
  }, [dispatch]);

  useEffect(() => {
    if (courses.length > 0 && !scheduleCourse) {
      setScheduleCourse(courses[0].id || courses[0].code);
    }
  }, [courses, scheduleCourse]);

  const handleAlertInstructor = (question) => {
    dispatch(writeSystemLog({
      operator: 'Prof. Dr. Kemal Arslan',
      action: 'Eğitmene Soru Uyarısı',
      details: `${question.instructorName} isimli eğitmene, ${question.courseCode} dersindeki yanıtsız soru için bildirim gönderildi.`
    }));
    toast.success(`${question.instructorName} öğretim üyesine cevaplama uyarısı başarıyla iletildi.`);
  };

  const handleResolveReport = (id) => {
    dispatch(moderateForumQuestionAsync({ id, status: 'answered' })).then(() => {
      dispatch(writeSystemLog({
        operator: 'Prof. Dr. Kemal Arslan',
        action: 'Forum Raporu Çözüldü',
        details: `#${id} nolu forum sorusundaki şikayet kaldırıldı ve onaylandı.`
      }));
      dispatch(fetchDeanDashboardData());
      toast.success('Şikayet raporu başarıyla kaldırıldı.');
    });
  };

  const handleDeleteQuestion = (id) => {
    const executeDelete = () => {
      dispatch(deleteForumQuestionAsync(id)).then(() => {
        dispatch(writeSystemLog({
          operator: currentUser?.name || 'Prof. Dr. Mehmet Kaya',
          action: 'Forum Sorusu Silindi',
          details: `#${id} nolu soru uygunsuz içerik nedeniyle dekanlık tarafından silindi.`
        }));
        dispatch(fetchDeanDashboardData());
        toast.success('Soru forumdan başarıyla kaldırıldı.');
      });
    };
    setModalConfig({
      isOpen: true,
      title: 'Soruyu Sil?',
      message: 'Bu soruyu kalıcı olarak forumdan kaldırmak istediğinize emin misiniz? Bu işlem geri alınamaz.',
      confirmType: 'danger',
      onConfirm: executeDelete
    });
  };

  const handleTerminateStream = (stream) => {
    const executeTerminate = () => {
      dispatch(terminateLiveStreamAsync(stream.id)).then(() => {
        dispatch(writeSystemLog({
          operator: currentUser?.name || 'Prof. Dr. Mehmet Kaya',
          action: 'Canlı Ders Sonlandırıldı',
          details: `${stream.instructorName} tarafından yürütülen ${stream.courseCode} dersinin canlı yayını idari kararla kapatıldı.`
        }));
        dispatch(fetchDeanDashboardData());
        toast.success('Canlı yayın başarıyla sonlandırıldı.');
      });
    };
    setModalConfig({
      isOpen: true,
      title: 'Yayını Sonlandır?',
      message: `"${stream.courseName}" dersinin canlı yayınını sonlandırmak istediğinize emin misiniz?`,
      confirmType: 'danger',
      onConfirm: executeTerminate
    });
  };

  const handleAddSchedule = () => {
    const selectedCourse = courses.find(c => c.id === scheduleCourse || c.code === scheduleCourse);
    if (!selectedCourse) {
      toast.error('Lütfen geçerli bir ders seçin.');
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
      dispatch(writeSystemLog({
        operator: 'Prof. Dr. Kemal Arslan',
        action: 'Program Eklemesi Yapıldı',
        details: `${selectedCourse.id} kodlu ders için ${scheduleDay} günü ${scheduleTime} dilimine program tanımlandı.`
      }));
      dispatch(fetchDeanDashboardData());
      toast.success('Yeni ders/sınav programı başarıyla kaydedildi!');
    });
  };

  const handleApproveSchedule = (id, code) => {
    dispatch(approveScheduleAsync(id)).then(() => {
      dispatch(writeSystemLog({
        operator: 'Prof. Dr. Kemal Arslan',
        action: 'Program Girişi Onaylandı',
        details: `${code} kodlu dersin taslak takvim programı onaylandı.`
      }));
      dispatch(fetchDeanDashboardData());
      toast.success('Ders programı başarıyla onaylandı!');
    });
  };

  const handleDeleteSchedule = (id, code) => {
    const executeDelete = () => {
      dispatch(deleteScheduleAsync(id)).then(() => {
        dispatch(writeSystemLog({
          operator: currentUser?.name || 'Prof. Dr. Mehmet Kaya',
          action: 'Program Silindi',
          details: `${code} dersine ait program kaydı takvimden kaldırıldı.`
        }));
        dispatch(fetchDeanDashboardData());
        toast.success('Program kaydı takvimden kaldırıldı.');
      });
    };
    setModalConfig({
      isOpen: true,
      title: 'Programı Sil?',
      message: 'Bu program kaydını silmek istediğinize emin misiniz?',
      confirmType: 'danger',
      onConfirm: executeDelete
    });
  };

  const handleCreateCalendarEvent = () => {
    if (!calTitle.trim() || !calDate.trim()) {
      toast.error('Lütfen başlık ve tarih bilgilerini doldurun.');
      return;
    }
    const payload = {
      title: calTitle,
      date: calDate,
      semester: calSemester
    };
    dispatch(addAcademicEventAsync(payload)).then(() => {
      dispatch(writeSystemLog({
        operator: currentUser?.name || 'Prof. Dr. Mehmet Kaya',
        action: 'Akademik Takvim Güncellemesi',
        details: `Akademik takvime yeni etkinlik eklendi: "${calTitle}" (${calDate})`
      }));
      dispatch(fetchDeanDashboardData());
      setCalTitle('');
      toast.success('Etkinlik akademik takvime başarıyla eklendi!');
    });
  };

  const handleDeleteCalendarEvent = (id, title) => {
    const executeDelete = () => {
      dispatch(deleteAcademicEventAsync(id)).then(() => {
        dispatch(writeSystemLog({
          operator: currentUser?.name || 'Prof. Dr. Mehmet Kaya',
          action: 'Akademik Takvim Güncellemesi',
          details: `Akademik takvimden etkinlik silindi: "${title}"`
        }));
        dispatch(fetchDeanDashboardData());
        toast.success('Etkinlik akademik takvimden silindi.');
      });
    };
    setModalConfig({
      isOpen: true,
      title: 'Etkinliği Sil?',
      message: `"${title}" etkinliğini akademik takvimden silmek istediğinize emin misiniz?`,
      confirmType: 'danger',
      onConfirm: executeDelete
    });
  };

  const totalQuestions = forumQuestions.length;
  const unansweredQuestionsCount = forumQuestions.filter((q) => q.status === 'unanswered').length;
  const reportedQuestionsCount = forumQuestions.filter((q) => q.status === 'reported').length;
  const answeredQs = forumQuestions.filter((q) => q.status === 'answered' && q.responseTimeHours !== null);
  const avgResponseTime = answeredQs.length > 0
    ? (answeredQs.reduce((acc, q) => acc + q.responseTimeHours, 0) / answeredQs.length).toFixed(1)
    : '0.0';

  const activeStreams = liveStreams.filter((s) => s.status === 'live');

  return (
    <section className="app-page-canvas">
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
            Fakültenin soru-cevap aktivitelerini, bekleyen e-imzalı belge taleplerini, canlı yayınları ve müfredat takvimlerini denetleyin.
          </p>
        </div>
      </div>

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
          className={`px-4 py-2.5 font-bold text-xs rounded-t-lg transition-all flex items-center gap-1.5 ${activeTab === 'live' ? 'bg-[#00236f] text-white' : 'text-slate-600 hover:bg-slate-100'}`}
          onClick={() => setActiveTab('live')}
        >
          <span className="material-symbols-outlined text-[16px]">sensors</span>
          <span>Canlı Yayın ({activeStreams.length})</span>
        </button>
        <button
          className={`px-4 py-2.5 font-bold text-xs rounded-t-lg transition-all flex items-center gap-1.5 ${activeTab === 'schedule' ? 'bg-[#00236f] text-white' : 'text-slate-600 hover:bg-slate-100'}`}
          onClick={() => setActiveTab('schedule')}
        >
          <span className="material-symbols-outlined text-[16px]">calendar_month</span>
          <span>Program &amp; Takvim</span>
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
          {activeTab === 'qa' && (
            <QaMonitor
              forumQuestions={forumQuestions}
              totalQuestions={totalQuestions}
              unansweredQuestionsCount={unansweredQuestionsCount}
              reportedQuestionsCount={reportedQuestionsCount}
              avgResponseTime={avgResponseTime}
              handleAlertInstructor={handleAlertInstructor}
              handleResolveReport={handleResolveReport}
              handleDeleteQuestion={handleDeleteQuestion}
            />
          )}

          {activeTab === 'live' && (
            <div className="flex flex-col gap-6">
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
                            <td className="py-4 px-4 text-slate-505">{stream.startTime}</td>
                            <td className="py-4 px-4">
                              <span className={`px-2 py-0.5 rounded-full text-[9px] font-black uppercase flex items-center w-fit gap-1 ${stream.status === 'live' ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-400'}`}>
                                {stream.status === 'live' ? 'CANLI YAYINDA' : 'SONLANDI'}
                              </span>
                            </td>
                            <td className="py-4 px-4 text-right">
                              {stream.status === 'live' ? (
                                <button
                                  onClick={() => handleTerminateStream(stream)}
                                  className="px-3 py-1 bg-rose-50 hover:bg-rose-600 hover:text-white rounded border border-rose-200 text-rose-700 font-bold text-[10px] transition-all border-none cursor-pointer"
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
                          <td colSpan="5" className="py-8 text-center text-slate-400 font-medium">
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

          {activeTab === 'schedule' && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-1">
                <ScheduleForm
                  courses={courses}
                  scheduleCourse={scheduleCourse}
                  setScheduleCourse={setScheduleCourse}
                  scheduleDay={scheduleDay}
                  setScheduleDay={setScheduleDay}
                  scheduleTime={scheduleTime}
                  setScheduleTime={setScheduleTime}
                  scheduleRoom={scheduleRoom}
                  setScheduleRoom={setScheduleRoom}
                  scheduleType={scheduleType}
                  setScheduleType={setScheduleType}
                  handleAddSchedule={handleAddSchedule}
                />
              </div>

              <div className="lg:col-span-2 flex flex-col gap-6">
                <div className="bg-white border border-slate-200/60 rounded-2xl p-5 shadow-sm">
                  <h3 className="text-sm font-black text-slate-800 mb-4 flex items-center gap-2">
                    <span className="material-symbols-outlined text-blue-900">calendar_view_week</span>
                    Haftalık Takvim &amp; Sınav Programı Listesi
                  </h3>
                  <div className="overflow-x-auto">
                    <table className="min-w-full text-xs text-left text-slate-650">
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
                        {schedules.map((item) => (
                          <tr className="border-b border-slate-50 hover:bg-slate-50 transition-all" key={item.id}>
                            <td className="py-3 px-3">
                              <span className={`px-2 py-0.5 rounded text-[8px] font-black uppercase ${item.type === 'sinav' ? 'bg-amber-100 text-amber-700' : 'bg-blue-100 text-[#00236f]'}`}>
                                {item.type === 'sinav' ? 'SINAV' : 'DERS'}
                              </span>
                            </td>
                            <td className="py-3 px-3">
                              <div className="font-bold text-slate-800">{item.courseName}</div>
                              <div className="text-[9px] text-slate-405">{item.courseCode} — {item.instructorName}</div>
                            </td>
                            <td className="py-3 px-3 font-medium text-slate-705">
                              {item.day}, {item.timeSlot}
                            </td>
                            <td className="py-3 px-3">
                              <code className="bg-slate-100 px-1.5 py-0.5 rounded font-mono text-[10px] text-slate-600">
                                {item.room}
                              </code>
                            </td>
                            <td className="py-3 px-3">
                              <span className={`px-1.5 py-0.5 rounded text-[8px] font-bold ${item.status === 'approved' ? 'text-emerald-600 bg-emerald-50' : 'text-amber-600 bg-amber-50'}`}>
                                {item.status === 'approved' ? 'ONAYLI' : 'ONAY BEKLİYOR'}
                              </span>
                            </td>
                            <td className="py-3 px-3 text-right">
                              <div className="flex justify-end gap-1">
                                {item.status === 'pending' && (
                                  <button
                                    onClick={() => handleApproveSchedule(item.id, item.courseCode)}
                                    className="px-2 py-1 bg-emerald-50 hover:bg-emerald-600 hover:text-white rounded border border-emerald-200 text-emerald-700 font-bold text-[9px] transition-all border-none cursor-pointer"
                                  >
                                    Onayla
                                  </button>
                                )}
                                <button
                                  onClick={() => handleDeleteSchedule(item.id, item.courseCode)}
                                  className="px-2 py-1 bg-slate-100 hover:bg-rose-600 hover:text-white rounded font-bold text-[9px] transition-all border-none cursor-pointer"
                                >
                                  Sil
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'calendar' && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-1">
                <CalendarForm
                  calTitle={calTitle}
                  setCalTitle={setCalTitle}
                  calDate={calDate}
                  setCalDate={setCalDate}
                  calSemester={calSemester}
                  setCalSemester={setCalSemester}
                  handleCreateCalendarEvent={handleCreateCalendarEvent}
                />
              </div>

              <div className="lg:col-span-2 flex flex-col gap-4">
                <div className="bg-white border border-slate-200/60 rounded-2xl p-4 shadow-sm flex flex-col md:flex-row justify-between items-center gap-3">
                  <div className="flex flex-wrap gap-1">
                    {[
                      { id: 'all', label: 'Tümü' },
                      { id: 'guz', label: 'Güz Yarıyılı' },
                      { id: 'bahar', label: 'Bahar Yarıyılı' },
                      { id: 'yaz', label: 'Yaz Yarıyılı' },
                      { id: 'tatil', label: 'Resmi Tatiller' }
                    ].map((btn) => (
                      <button
                        key={btn.id}
                        onClick={() => setCalFilter(btn.id)}
                        className={`px-2.5 py-1.5 rounded-lg font-bold text-[10px] transition-all border-none cursor-pointer ${calFilter === btn.id ? 'bg-[#00236f] text-white' : 'bg-slate-50 text-slate-650 hover:bg-slate-100'}`}
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

                <div className="bg-white border border-slate-200/60 rounded-2xl p-5 shadow-sm">
                  <div className="overflow-x-auto">
                    <table className="min-w-full text-xs text-left text-slate-650">
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
                        {academicEvents
                          .filter((event) => {
                            const q = calSearch.toLowerCase();
                            return (event.title.toLowerCase().includes(q) || event.date.toLowerCase().includes(q)) && (calFilter === 'all' || event.semester === calFilter);
                          })
                          .map((event, idx) => (
                            <tr className="border-b border-slate-50 hover:bg-slate-50 transition-all" key={event.id}>
                              <td className="py-3 px-3 text-center text-slate-400 font-medium">{idx + 1}</td>
                              <td className="py-3 px-3 font-bold text-slate-800">{event.date}</td>
                              <td className="py-3 px-3 text-slate-700 font-medium">{event.title}</td>
                              <td className="py-3 px-3">
                                <span className={`px-2 py-0.5 rounded text-[8px] font-black uppercase ${event.semester === 'guz' ? 'bg-blue-50 text-blue-700' :
                                    event.semester === 'bahar' ? 'bg-emerald-50 text-emerald-700' :
                                      event.semester === 'yaz' ? 'bg-purple-50 text-purple-700' :
                                        'bg-rose-50 text-rose-700'
                                  }`}>
                                  {event.semester === 'guz' ? 'Güz Yarıyılı' : event.semester === 'bahar' ? 'Bahar Yarıyılı' : event.semester === 'yaz' ? 'Yaz Yarıyılı' : 'Resmi Tatil'}
                                </span>
                              </td>
                              <td className="py-3 px-3 text-right">
                                <button
                                  onClick={() => handleDeleteCalendarEvent(event.id, event.title)}
                                  className="px-2 py-1 bg-slate-100 hover:bg-rose-600 hover:text-white rounded font-bold text-[9px] transition-all border-none cursor-pointer"
                                >
                                  Sil
                                </button>
                              </td>
                            </tr>
                          ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      <ConfirmationModal
        isOpen={modalConfig.isOpen}
        onClose={() => setModalConfig(prev => ({ ...prev, isOpen: false }))}
        onConfirm={modalConfig.onConfirm}
        title={modalConfig.title}
        message={modalConfig.message}
        confirmType={modalConfig.confirmType}
      />
    </section>
  );
}
