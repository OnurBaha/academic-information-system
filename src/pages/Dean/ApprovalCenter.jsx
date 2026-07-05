import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  fetchDeanDashboardData,
  publishGlobalBulletinAsync,
  updateCourseAssignmentStatus,
  updateStudentRequestStatus,
  updateGraduationApprovalStatus,
  updateTermLocks,
  writeSystemLog
} from '../../store/dean/deanSlice';

export default function ApprovalCenter() {
  const dispatch = useDispatch();
  const {
    bulletins,
    courseAssignments,
    studentRequests,
    termStatus,
    systemLogs,
    graduationApprovals
  } = useSelector((state) => state.dean);

  const [activeTab, setActiveTab] = useState('assignments');
  const [title, setTitle] = useState('');
  const [audience, setAudience] = useState('Sistem');
  const [isUrgent, setIsUrgent] = useState(true);
  const [content, setContent] = useState('');

  useEffect(() => {
    dispatch(fetchDeanDashboardData());
  }, [dispatch]);

  const handlePublish = () => {
    if (!title.trim() || !content.trim()) return;

    dispatch(publishGlobalBulletinAsync({
      priority: isUrgent ? 'ACİL' : 'Normal',
      title,
      content,
      target: audience
    })).then(() => {
      dispatch(writeSystemLog({
        operator: 'Prof. Dr. Kemal Arslan',
        action: 'Bülten Yayınlandı',
        details: `"${title}" başlıklı genel bülten yayınlandı.`
      }));
      dispatch(fetchDeanDashboardData());
    });

    setTitle('');
    setContent('');
    alert('Bülten başarıyla yayınlandı!');
  };

  const handleApproveAssignment = (id, name, course) => {
    dispatch(updateCourseAssignmentStatus({ id, status: 'approved' })).then(() => {
      dispatch(writeSystemLog({
        operator: 'Prof. Dr. Kemal Arslan',
        action: 'Ders Görevlendirmesi Onaylandı',
        details: `${course} dersinin ${name} görevlendirmesi onaylandı.`
      }));
      dispatch(fetchDeanDashboardData());
      alert('Ders görevlendirmesi başarıyla onaylandı!');
    });
  };

  const handleRejectAssignment = (id, name, course) => {
    dispatch(updateCourseAssignmentStatus({ id, status: 'rejected' })).then(() => {
      dispatch(writeSystemLog({
        operator: 'Prof. Dr. Kemal Arslan',
        action: 'Ders Görevlendirmesi Reddedildi',
        details: `${course} dersinin ${name} görevlendirmesi reddedildi.`
      }));
      dispatch(fetchDeanDashboardData());
      alert('Ders görevlendirmesi reddedildi.');
    });
  };

  const handleApproveStudent = (id, name, type) => {
    dispatch(updateStudentRequestStatus({ id, status: 'approved' })).then(() => {
      dispatch(writeSystemLog({
        operator: 'Prof. Dr. Kemal Arslan',
        action: 'Öğrenci Talebi Onaylandı',
        details: `${name} isimli öğrencinin ${type} talebi onaylandı.`
      }));
      dispatch(fetchDeanDashboardData());
      alert('Talep başarıyla onaylandı!');
    });
  };

  const handleRejectStudent = (id, name, type) => {
    dispatch(updateStudentRequestStatus({ id, status: 'rejected' })).then(() => {
      dispatch(writeSystemLog({
        operator: 'Prof. Dr. Kemal Arslan',
        action: 'Öğrenci Talebi Reddedildi',
        details: `${name} isimli öğrencinin ${type} talebi reddedildi.`
      }));
      dispatch(fetchDeanDashboardData());
      alert('Talep reddedildi.');
    });
  };

  const handleApproveGraduation = (id, name) => {
    dispatch(updateGraduationApprovalStatus({ id, status: 'approved' })).then(() => {
      dispatch(writeSystemLog({
        operator: 'Prof. Dr. Kemal Arslan',
        action: 'Mezuniyet Onaylandı',
        details: `${name} isimli öğrencinin mezuniyet belgesi onaylandı.`
      }));
      dispatch(fetchDeanDashboardData());
      alert('Öğrencinin mezuniyeti onaylandı ve rektörlük onayına gönderildi!');
    });
  };

  const handleToggleLocks = () => {
    const nextLocksState = !termStatus.isGradeLocksActive;
    dispatch(updateTermLocks({
      isTermClosed: termStatus.isTermClosed,
      isGradeLocksActive: nextLocksState
    })).then(() => {
      dispatch(writeSystemLog({
        operator: 'Prof. Dr. Kemal Arslan',
        action: nextLocksState ? 'Not Giriş Ekranları Kilitlendi' : 'Not Giriş Ekranları Açıldı',
        details: nextLocksState ? 'Tüm akademik birimler için not giriş kilitleri aktif edildi.' : 'Öğretim üyeleri için not kilitleri geçici olarak kaldırıldı.'
      }));
      dispatch(fetchDeanDashboardData());
      alert(nextLocksState ? 'Not girişleri kilitlendi!' : 'Not giriş ekranları başarıyla açıldı!');
    });
  };

  const handleCloseTerm = () => {
    if (!window.confirm('Mevcut dönemi resmi olarak kapatmak istediğinize emin misiniz? Bu işlem geri alınamaz.')) return;

    dispatch(updateTermLocks({
      isTermClosed: true,
      isGradeLocksActive: true
    })).then(() => {
      dispatch(writeSystemLog({
        operator: 'Prof. Dr. Kemal Arslan',
        action: 'Dönem Sonu Resmi Kapanış',
        details: '2026-2027 Güz Dönemi fakülte genelinde resmen kapatıldı.'
      }));
      dispatch(fetchDeanDashboardData());
      alert('Dönem resmi olarak kapatıldı!');
    });
  };

  const pendingAssignments = courseAssignments.filter(x => x.status === 'pending');
  const pendingStudents = studentRequests.filter(x => x.status === 'pending');
  const pendingGraduations = graduationApprovals.filter(x => x.status === 'pending');

  return (
    <section className="app-page-canvas">
      {/* Breadcrumb & Header */}
      <div className="app-header-row">
        <div className="app-header-info">
          <h2 className="app-title">Onay &amp; Bildirim Merkezi</h2>
          <p className="app-desc">
            Akademik süreçleri denetleyin, kriz yönetimi yetkilerini kullanın ve kurum genelinde duyuru yayınlayın.
          </p>
        </div>
        <div className="app-header-badges">
          <div className="app-stat-badge">
            <span className="app-badge-lbl">AKADEMİK TALEPLER</span>
            <span className="app-badge-val text-red-600">
              {pendingAssignments.length + pendingStudents.length + pendingGraduations.length}
            </span>
          </div>
          <div className="app-stat-badge">
            <span className="app-badge-lbl">YAYINDA BİLDİRİM</span>
            <span className="app-badge-val text-blue-600">{bulletins.length}</span>
          </div>
        </div>
      </div>

      {/* Tabs Menu Navigation */}
      <div className="flex gap-2 border-b border-slate-200 mb-6 pb-px overflow-x-auto">
        <button
          className={`px-4 py-2.5 font-bold text-xs rounded-t-lg transition-all ${activeTab === 'assignments' ? 'bg-[#00236f] text-white' : 'text-slate-600 hover:bg-slate-100'}`}
          onClick={() => setActiveTab('assignments')}
        >
          Ders Görevlendirmeleri ({pendingAssignments.length})
        </button>
        <button
          className={`px-4 py-2.5 font-bold text-xs rounded-t-lg transition-all ${activeTab === 'students' ? 'bg-[#00236f] text-white' : 'text-slate-600 hover:bg-slate-100'}`}
          onClick={() => setActiveTab('students')}
        >
          Öğrenci İşlemleri ({pendingStudents.length})
        </button>
        <button
          className={`px-4 py-2.5 font-bold text-xs rounded-t-lg transition-all ${activeTab === 'term' ? 'bg-[#00236f] text-white' : 'text-slate-600 hover:bg-slate-100'}`}
          onClick={() => setActiveTab('term')}
        >
          Dönem &amp; Kilit Denetimi
        </button>
        <button
          className={`px-4 py-2.5 font-bold text-xs rounded-t-lg transition-all ${activeTab === 'graduation' ? 'bg-[#00236f] text-white' : 'text-slate-600 hover:bg-slate-100'}`}
          onClick={() => setActiveTab('graduation')}
        >
          Mezuniyet Onayları ({pendingGraduations.length})
        </button>
        <button
          className={`px-4 py-2.5 font-bold text-xs rounded-t-lg transition-all ${activeTab === 'logs' ? 'bg-[#00236f] text-white' : 'text-slate-600 hover:bg-slate-100'}`}
          onClick={() => setActiveTab('logs')}
        >
          Sistem Logları ({systemLogs.length})
        </button>
      </div>

      {/* Main Bento Grid */}
      <div className="app-main-grid">
        {/* Left Column: Dynamic Tables Based on Tabs */}
        <div className="app-left-column">

          {/* TAB 1: Course Assignments */}
          {activeTab === 'assignments' && (
            <div className="app-card">
              <h4 className="text-sm font-black text-slate-800 mb-4 flex items-center gap-2">
                <span className="material-symbols-outlined text-[20px] text-blue-900">groups</span>
                Ders Görevlendirme Onayları
              </h4>
              <div className="app-table-wrap">
                <table className="app-table">
                  <thead>
                    <tr>
                      <th className="app-th">EĞİTMEN &amp; BÖLÜM</th>
                      <th className="app-th">GÖREVLENDİRME</th>
                      <th className="app-th">İŞLEM</th>
                    </tr>
                  </thead>
                  <tbody>
                    {pendingAssignments.length > 0 ? (
                      pendingAssignments.map((ca, idx) => (
                        <tr className="app-row" key={ca.id || idx}>
                          <td className="app-td-info">
                            <span className="app-td-course-name">{ca.instructorName}</span>
                            <span className="app-td-instructor">{ca.dept}</span>
                          </td>
                          <td className="app-td-bold text-slate-700">{ca.courseName}</td>
                          <td className="app-td">
                            <div className="app-actions-wrap">
                              <button
                                className="app-btn-action-ok"
                                onClick={() => handleApproveAssignment(ca.id, ca.instructorName, ca.courseName)}
                              >
                                <span className="material-symbols-outlined text-[16px]">check</span>
                              </button>
                              <button
                                className="app-btn-action-no"
                                onClick={() => handleRejectAssignment(ca.id, ca.instructorName, ca.courseName)}
                              >
                                <span className="material-symbols-outlined text-[16px]">close</span>
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="3" className="app-td text-center text-slate-400 py-8">
                          Bekleyen ders görevlendirme talebi bulunmamaktadır.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 2: Student Requests */}
          {activeTab === 'students' && (
            <div className="app-card">
              <h4 className="text-sm font-black text-slate-800 mb-4 flex items-center gap-2">
                <span className="material-symbols-outlined text-[20px] text-blue-900">school</span>
                Öğrenci İstisnai Talepleri (FYK Kararları)
              </h4>
              <div className="app-table-wrap">
                <table className="app-table">
                  <thead>
                    <tr>
                      <th className="app-th">ÖĞRENCİ</th>
                      <th className="app-th">TALEP TÜRÜ</th>
                      <th className="app-th">DETAY &amp; GEREKÇE</th>
                      <th className="app-th">İŞLEM</th>
                    </tr>
                  </thead>
                  <tbody>
                    {pendingStudents.length > 0 ? (
                      pendingStudents.map((sr, idx) => (
                        <tr className="app-row" key={sr.id || idx}>
                          <td className="app-td-info">
                            <span className="app-td-course-name">{sr.studentName}</span>
                            <span className="app-td-instructor">No: {sr.studentNumber}</span>
                          </td>
                          <td className="app-td font-bold text-slate-800">{sr.requestType}</td>
                          <td className="app-td text-slate-600 text-[11px]">{sr.details}</td>
                          <td className="app-td">
                            <div className="app-actions-wrap">
                              <button
                                className="app-btn-action-ok"
                                onClick={() => handleApproveStudent(sr.id, sr.studentName, sr.requestType)}
                              >
                                <span className="material-symbols-outlined text-[16px]">check</span>
                              </button>
                              <button
                                className="app-btn-action-no"
                                onClick={() => handleRejectStudent(sr.id, sr.studentName, sr.requestType)}
                              >
                                <span className="material-symbols-outlined text-[16px]">close</span>
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="4" className="app-td text-center text-slate-400 py-8">
                          Bekleyen öğrenci istisnai talebi bulunmamaktadır.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 3: Term Status Control */}
          {activeTab === 'term' && (
            <div className="app-card">
              <h4 className="text-sm font-black text-slate-800 mb-4 flex items-center gap-2">
                <span className="material-symbols-outlined text-[20px] text-blue-900">lock_open</span>
                Dönem Sonu Kapatma &amp; Not Giriş Denetimi
              </h4>
              <div className="p-4 bg-slate-50 border border-slate-200/60 rounded-xl mb-6">
                <h5 className="font-bold text-slate-800 text-xs mb-1">
                  1. Not Giriş Kilitleri (Ek Süre Tanıma)
                </h5>
                <p className="text-[11px] text-slate-500 mb-4">
                  Sınav not girişi süresi bittiğinde öğretmenlerin not değiştirmesini engellemek için kilitler otomatik olarak devrededir. İstisnai durumlarda kilidi açabilirsiniz.
                </p>
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-700">
                    Not Giriş Durumu: {termStatus.isGradeLocksActive ? '🔒 KİLİTLİ (Öğretmenler not giremez)' : '🔓 AÇIK (Öğretmenler not girebilir)'}
                  </span>
                  <button
                    className={`px-4 py-2 text-xs font-bold rounded-lg transition-all ${termStatus.isGradeLocksActive ? 'bg-amber-600 text-white hover:bg-amber-700' : 'bg-red-600 text-white hover:bg-red-700'}`}
                    onClick={handleToggleLocks}
                  >
                    {termStatus.isGradeLocksActive ? 'Kilitleri Kaldır (Ek Süre Ver)' : 'Kilitleri Aktifleştir'}
                  </button>
                </div>
              </div>

              <div className="p-4 bg-slate-50 border border-slate-200/60 rounded-xl">
                <h5 className="font-bold text-slate-800 text-xs mb-1">
                  2. Dönem Kapatma Onayı
                </h5>
                <p className="text-[11px] text-slate-500 mb-4">
                  Dönem sonu bütünleme ve mezuniyet aşamaları tamamlandığında dönemi fakülte genelinde resmen kapatabilirsiniz. Kapatıldıktan sonra sisteme veri girişi yapılamaz.
                </p>
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-700">
                    Dönem Resmi Durumu: {termStatus.isTermClosed ? '🟥 KAPATILDI' : '🟩 AKTİF / AÇIK'}
                  </span>
                  <button
                    className={`px-4 py-2 text-xs font-bold rounded-lg transition-all bg-[#00236f] text-white hover:bg-blue-900 ${termStatus.isTermClosed ? 'opacity-50 cursor-not-allowed' : ''}`}
                    onClick={handleCloseTerm}
                    disabled={termStatus.isTermClosed}
                  >
                    {termStatus.isTermClosed ? 'Dönem Zaten Kapatılmış' : 'Dönemi Resmi Olarak Kapat'}
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: Graduation Approvals */}
          {activeTab === 'graduation' && (
            <div className="app-card">
              <h4 className="text-sm font-black text-slate-800 mb-4 flex items-center gap-2">
                <span className="material-symbols-outlined text-[20px] text-blue-900">verified</span>
                Mezuniyet &amp; Diploma Onayları
              </h4>
              <div className="app-table-wrap">
                <table className="app-table">
                  <thead>
                    <tr>
                      <th className="app-th">ÖĞRENCİ BİLGİSİ</th>
                      <th className="app-th">TAMAMLANAN AKTS</th>
                      <th className="app-th">GANO</th>
                      <th className="app-th">İŞLEM</th>
                    </tr>
                  </thead>
                  <tbody>
                    {pendingGraduations.length > 0 ? (
                      pendingGraduations.map((ga, idx) => (
                        <tr className="app-row" key={ga.id || idx}>
                          <td className="app-td-info">
                            <span className="app-td-course-name">{ga.studentName}</span>
                            <span className="app-td-instructor">No: {ga.studentNumber}</span>
                          </td>
                          <td className="app-td-bold">{ga.ects} / 240 AKTS</td>
                          <td className="app-td-bold text-blue-900">{ga.gpa}</td>
                          <td className="app-td">
                            <button
                              className="px-3 py-1.5 bg-[#00236f] hover:bg-blue-900 text-white rounded-lg text-[10px] font-bold transition-all"
                              onClick={() => handleApproveGraduation(ga.id, ga.studentName)}
                            >
                              Mezuniyeti Onayla
                            </button>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="4" className="app-td text-center text-slate-400 py-8">
                          Mezuniyet onayı bekleyen öğrenci bulunmamaktadır.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 5: System Audit Logs */}
          {activeTab === 'logs' && (
            <div className="app-card">
              <h4 className="text-sm font-black text-slate-800 mb-4 flex items-center gap-2">
                <span className="material-symbols-outlined text-[20px] text-blue-900">receipt_long</span>
                Fakülte İşlem Geçmişi (Logs Audit)
              </h4>
              <div className="flex flex-col gap-3">
                {systemLogs.map((log, idx) => (
                  <div className="p-3 bg-slate-50 border border-slate-100 rounded-xl flex items-start justify-between" key={log.id || idx}>
                    <div className="flex flex-col gap-0.5">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-slate-800">{log.operator}</span>
                        <span className="px-2 py-0.5 bg-slate-200 text-slate-600 rounded text-[9px] font-bold uppercase">{log.action}</span>
                      </div>
                      <span className="text-[11px] text-slate-500">{log.details}</span>
                    </div>
                    <span className="text-[10px] text-slate-400 font-bold">{log.timestamp}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Son Yayınlanan Bültenler History */}
          <div className="app-card">
            <div className="app-card-header-row">
              <div className="app-card-title-wrap">
                <div className="app-card-icon-box">
                  <span className="material-symbols-outlined text-[20px]">history</span>
                </div>
                <h4 className="app-card-header-title">Son Yayınlanan Bültenler</h4>
              </div>
            </div>

            <div className="app-bulletin-list">
              {bulletins.map((bulletin, idx) => (
                <div className="app-bulletin-item" key={bulletin.id || idx}>
                  <div className={`app-bulletin-badge ${bulletin.priority === 'ACİL' ? 'app-badge-acil' : 'app-badge-normal'}`}>
                    {bulletin.priority || 'NOR'}
                  </div>
                  <div className="app-bulletin-info">
                    <h5 className="app-bulletin-title">{bulletin.title}</h5>
                    <p className="app-bulletin-desc">{bulletin.content}</p>
                    <div className="app-bulletin-footer">
                      <span>HEDEF: {bulletin.target}</span>
                      <span>TARİH: {bulletin.date}</span>
                    </div>
                  </div>
                  <button className="app-bulletin-action-btn">
                    <span className="material-symbols-outlined">more_vert</span>
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column: Bulletin Creator Form */}
        <div className="app-sidebar">
          <div className="app-sidebar-card">
            <h4 className="app-sidebar-title">
              <span className="material-symbols-outlined text-[20px]">campaign</span>
              <span>Bülten Oluşturucu</span>
            </h4>

            <div className="app-form-group">
              <label className="app-form-label">Başlık</label>
              <input
                type="text"
                className="app-form-input"
                placeholder="Duyuru başlığını girin..."
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />
            </div>

            <div className="app-form-group">
              <label className="app-form-label">Hedef Kitle</label>
              <div className="app-segment-control">
                <button
                  className={`app-segment-btn ${audience === 'Sistem' ? 'app-segment-btn-active' : ''}`}
                  onClick={() => setAudience('Sistem')}
                >
                  Sistem
                </button>
                <button
                  className={`app-segment-btn ${audience === 'Eğitmen' ? 'app-segment-btn-active' : ''}`}
                  onClick={() => setAudience('Eğitmen')}
                >
                  Eğitmen
                </button>
                <button
                  className={`app-segment-btn ${audience === 'Öğrenci' ? 'app-segment-btn-active' : ''}`}
                  onClick={() => setAudience('Öğrenci')}
                >
                  Öğrenci
                </button>
              </div>
            </div>

            <div className="app-form-group">
              <label className="app-form-label">Öncelik Seviyesi</label>
              <div className="app-radio-group">
                <label className="app-radio-label" onClick={() => setIsUrgent(false)}>
                  <input type="radio" name="priority" className="app-radio-input" checked={!isUrgent} readOnly />
                  <span>Normal</span>
                </label>
                <label className="app-radio-label" onClick={() => setIsUrgent(true)}>
                  <input type="radio" name="priority" className="app-radio-input" checked={isUrgent} readOnly />
                  <span className="text-red-600 font-bold">Acil</span>
                </label>
              </div>
            </div>

            <div className="app-form-group">
              <label className="app-form-label">İçerik</label>
              <div className="app-rich-editor">
                <div className="app-editor-toolbar">
                  <button className="app-toolbar-btn">
                    <span className="material-symbols-outlined text-[16px]">format_bold</span>
                  </button>
                  <button className="app-toolbar-btn">
                    <span className="material-symbols-outlined text-[16px]">format_italic</span>
                  </button>
                  <button className="app-toolbar-btn">
                    <span className="material-symbols-outlined text-[16px]">format_underlined</span>
                  </button>
                  <button className="app-toolbar-btn">
                    <span className="material-symbols-outlined text-[16px]">link</span>
                  </button>
                  <button className="app-toolbar-btn">
                    <span className="material-symbols-outlined text-[16px]">attach_file</span>
                  </button>
                </div>
                <textarea
                  className="app-editor-textarea"
                  placeholder="Duyuru metnini buraya yazın..."
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                />
              </div>
            </div>

            <button className="app-btn-publish" onClick={handlePublish}>
              <span className="material-symbols-outlined">send</span>
              <span>Bülteni Yayınla</span>
            </button>

            <button className="app-btn-save-draft">
              <span>Taslağı Kaydet</span>
            </button>
          </div>
        </div>
      </div>
    </section>
  )
}
