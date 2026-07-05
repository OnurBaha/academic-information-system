import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  fetchDeanDashboardData,
  publishGlobalBulletinAsync,
  updateCourseAssignmentStatus,
  updateStudentRequestStatus,
  updateGraduationApprovalStatus,
  updateTermLocks,
  updateUserStatus,
  updateInstructorAsync,
  writeSystemLog,
  updateDocumentStatusAsync
} from '../../store/dean/deanSlice';
import {
  fetchCurriculumAsync,
  updateCurriculumCourseAsync,
  createNewCurriculumCourseAsync
} from '../../store/course/courseSlice';
import { toast } from 'react-hot-toast';
import RequestTable from '../../components/approvals/RequestTable';

export default function ApprovalCenter() {
  const dispatch = useDispatch();
  const { currentUser } = useSelector((state) => state.auth || {});
  const {
    bulletins = [],
    courseAssignments = [],
    studentRequests = [],
    termStatus = { isGradeLocksActive: true, isTermClosed: false },
    systemLogs = [],
    graduationApprovals = [],
    instructors = [],
    users = [],
    documents = []
  } = useSelector((state) => state.dean);

  const { curriculum = [] } = useSelector((state) => state.course);

  const [activeTab, setActiveTab] = useState('assignments');
  const [title, setTitle] = useState('');
  const [audience, setAudience] = useState('Sistem');
  const [isUrgent, setIsUrgent] = useState(true);
  const [content, setContent] = useState('');

  useEffect(() => {
    dispatch(fetchDeanDashboardData());
    dispatch(fetchCurriculumAsync());
  }, [dispatch]);

  // Publish global bültenler
  const handlePublish = () => {
    if (!title.trim() || !content.trim()) return;

    dispatch(publishGlobalBulletinAsync({
      priority: isUrgent ? 'ACİL' : 'Normal',
      title,
      content,
      target: audience
    })).then(() => {
      dispatch(writeSystemLog({
        operator: currentUser?.name || 'Prof. Dr. Mehmet Kaya',
        action: 'Bülten Yayınlandı',
        details: `"${title}" başlıklı genel bülten yayınlandı.`
      }));
      dispatch(fetchDeanDashboardData());
    });

    setTitle('');
    setContent('');
    toast.success('Bülten başarıyla yayınlandı!');
  };

  // Course Assignment Approvals
  const handleApproveAssignment = (id, name, course) => {
    const ca = courseAssignments.find(x => x.id === id);
    if (!ca) return;

    dispatch(updateCourseAssignmentStatus({ id, status: 'approved' })).then(() => {
      // POST to /schedules
      fetch('http://localhost:3001/schedules', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: `sch-${Date.now()}`,
          courseCode: ca.courseCode,
          courseName: ca.courseName.split(' - ')[1] || ca.courseName,
          instructorName: ca.instructorName,
          day: ca.day,
          timeSlot: ca.timeSlot,
          room: ca.room,
          group: ca.group || 'Grup A',
          type: 'ders',
          status: 'approved'
        })
      }).then(() => {
        // Also update the instructor in /courses
        fetch(`http://localhost:3001/courses?code=${ca.courseCode}`)
          .then(res => res.json())
          .then(cList => {
            if (cList.length > 0) {
              fetch(`http://localhost:3001/courses/${cList[0].id}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ instructor: ca.instructorName })
              });
            }
          });

        dispatch(writeSystemLog({
          operator: currentUser?.name || 'Prof. Dr. Mehmet Kaya',
          action: 'Ders Görevlendirmesi Onaylandı',
          details: `${ca.courseName} dersinin ${ca.instructorName} görevlendirmesi onaylandı.`
        }));
        dispatch(fetchDeanDashboardData());
        toast.success('Ders görevlendirmesi başarıyla onaylandı!');
      });
    });
  };

  const handleRejectAssignment = (id, name, course) => {
    dispatch(updateCourseAssignmentStatus({ id, status: 'rejected' })).then(() => {
      dispatch(writeSystemLog({
        operator: currentUser?.name || 'Prof. Dr. Mehmet Kaya',
        action: 'Ders Görevlendirmesi Reddedildi',
        details: `${course} dersinin ${name} görevlendirmesi reddedildi.`
      }));
      dispatch(fetchDeanDashboardData());
      toast.success('Ders görevlendirmesi reddedildi.');
    });
  };

  // Student Requests
  const handleApproveStudent = (id, name, type) => {
    dispatch(updateStudentRequestStatus({ id, status: 'approved' })).then(() => {
      dispatch(writeSystemLog({
        operator: currentUser?.name || 'Prof. Dr. Mehmet Kaya',
        action: 'Öğrenci Talebi Onaylandı',
        details: `${name} isimli öğrencinin ${type} talebi onaylandı.`
      }));
      dispatch(fetchDeanDashboardData());
      toast.success('Talep başarıyla onaylandı!');
    });
  };

  const handleRejectStudent = (id, name, type) => {
    dispatch(updateStudentRequestStatus({ id, status: 'rejected' })).then(() => {
      dispatch(writeSystemLog({
        operator: currentUser?.name || 'Prof. Dr. Mehmet Kaya',
        action: 'Öğrenci Talebi Reddedildi',
        details: `${name} isimli öğrencinin ${type} talebi reddedildi.`
      }));
      dispatch(fetchDeanDashboardData());
      toast.success('Talep reddedildi.');
    });
  };

  // Official Document Request Approvals
  const handleApproveDocument = (id, name, type) => {
    dispatch(updateDocumentStatusAsync({ id, status: 'approved' })).then(() => {
      dispatch(writeSystemLog({
        operator: currentUser?.name || 'Prof. Dr. Mehmet Kaya',
        action: 'Resmi Evrak Onaylandı',
        details: `${name} isimli öğrencinin ${type} talebi onaylandı.`
      }));
      dispatch(fetchDeanDashboardData());
      toast.success('Resmi evrak talebi başarıyla onaylandı!');
    });
  };

  const handleRejectDocument = (id, name, type) => {
    dispatch(updateDocumentStatusAsync({ id, status: 'rejected' })).then(() => {
      dispatch(writeSystemLog({
        operator: currentUser?.name || 'Prof. Dr. Mehmet Kaya',
        action: 'Resmi Evrak Reddedildi',
        details: `${name} isimli öğrencinin ${type} talebi reddedildi.`
      }));
      dispatch(fetchDeanDashboardData());
      toast.success('Resmi evrak talebi reddedildi.');
    });
  };

  // Graduation
  const handleApproveGraduation = (id, name) => {
    dispatch(updateGraduationApprovalStatus({ id, status: 'approved' })).then(() => {
      dispatch(writeSystemLog({
        operator: currentUser?.name || 'Prof. Dr. Mehmet Kaya',
        action: 'Mezuniyet Onaylandı',
        details: `${name} isimli öğrencinin mezuniyet belgesi onaylandı.`
      }));
      dispatch(fetchDeanDashboardData());
      toast.success('Öğrencinin mezuniyeti onaylandı!');
    });
  };

  // Curriculum Draft
  const handleApproveCurriculum = (id, name) => {
    dispatch(updateCurriculumCourseAsync({ id, status: 'Aktif' })).then(() => {
      dispatch(writeSystemLog({
        operator: currentUser?.name || 'Prof. Dr. Mehmet Kaya',
        action: 'Müfredat Dersi Onaylandı',
        details: `Müfredata yeni eklenen ${name} ders taslağı onaylanıp aktifleştirildi.`
      }));

      const templates = [
        { name: 'Veri Güvenliği (Data Security)', code: 'SEC401', ects: 5, instructor: 'Doç. Dr. Mert Akın', hours: 42, quota: 40, status: 'Aktif' },
        { name: 'Yapay Zeka Etiği (Artificial Intelligence Ethics)', code: 'AI405', ects: 4, instructor: 'Prof. Dr. Kerem Soylu', hours: 36, quota: 50, status: 'Aktif' },
        { name: 'Bulut Bilişim (Cloud Computing)', code: 'CLOUD408', ects: 6, instructor: 'Dr. Elif Soylu', hours: 48, quota: 30, status: 'Aktif' }
      ];

      Promise.all(templates.map(t =>
        dispatch(createNewCurriculumCourseAsync({ ...t, semester: 1 })).unwrap()
      )).then(() => {
        dispatch(fetchDeanDashboardData());
        dispatch(fetchCurriculumAsync());
        toast.success('Müfredat taslağı onaylandı ve şablon dersler enjekte edildi!');
      }).catch(() => {
        dispatch(fetchDeanDashboardData());
        dispatch(fetchCurriculumAsync());
      });
    });
  };

  const handleRejectCurriculum = (id, name) => {
    dispatch(updateCurriculumCourseAsync({ id, status: 'Pasif' })).then(() => {
      dispatch(writeSystemLog({
        operator: currentUser?.name || 'Prof. Dr. Mehmet Kaya',
        action: 'Müfredat Dersi Reddedildi',
        details: `Müfredat ders planı ${name} pasif duruma getirildi.`
      }));
      dispatch(fetchCurriculumAsync());
      toast.success('Müfredat ders planı reddedildi.');
    });
  };

  // Faculty Onboarding
  const handleApproveFacultyOnboarding = (id, name) => {
    dispatch(updateInstructorAsync({ id, status: 'active' })).then(() => {
      dispatch(writeSystemLog({
        operator: currentUser?.name || 'Prof. Dr. Mehmet Kaya',
        action: 'Eğitmen Girişi Onaylandı',
        details: `Yeni öğretim görevlisi ${name} idari onaydan geçerek resmi kadroya alındı.`
      }));
      dispatch(fetchDeanDashboardData());
      toast.success(`${name} isimli eğitmenin kadroya katılımı resmi olarak onaylandı!`);
    });
  };

  const handleRejectFacultyOnboarding = (id, name) => {
    dispatch(updateInstructorAsync({ id, status: 'rejected' })).then(() => {
      dispatch(writeSystemLog({
        operator: currentUser?.name || 'Prof. Dr. Mehmet Kaya',
        action: 'Eğitmen Girişi Reddedildi',
        details: `Yeni öğretim görevlisi ${name} idari onay talebi reddedildi.`
      }));
      dispatch(fetchDeanDashboardData());
      toast.success('Eğitmen giriş talebi reddedildi.');
    });
  };

  // Student Internship
  const handleApproveInternship = (id, name, company) => {
    dispatch(updateUserStatus({ id, status: 'active', internshipStatus: 'approved' })).then(() => {
      dispatch(writeSystemLog({
        operator: currentUser?.name || 'Prof. Dr. Mehmet Kaya',
        action: 'Staj Başvurusu Onaylandı',
        details: `${name} isimli öğrencinin ${company} kurumundaki stajyerlik başvurusu onaylandı.`
      }));
      dispatch(fetchDeanDashboardData());
      toast.success(`${name} stajı onaylandı!`);
    });
  };

  const handleRejectInternship = (id, name, company) => {
    dispatch(updateUserStatus({ id, internshipStatus: 'rejected' })).then(() => {
      dispatch(writeSystemLog({
        operator: currentUser?.name || 'Prof. Dr. Mehmet Kaya',
        action: 'Staj Başvurusu Reddedildi',
        details: `${name} isimli öğrencinin ${company} kurumundaki stajyerlik başvurusu reddedildi.`
      }));
      dispatch(fetchDeanDashboardData());
      toast.success('Stajyerlik başvurusu reddedildi.');
    });
  };

  // Lock status control
  const handleToggleLocks = () => {
    const nextLocksState = !termStatus.isGradeLocksActive;
    dispatch(updateTermLocks({
      isTermClosed: termStatus.isTermClosed,
      isGradeLocksActive: nextLocksState
    })).then(() => {
      dispatch(fetchDeanDashboardData());
      toast.success(nextLocksState ? 'Not girişleri kilitlendi!' : 'Not giriş ekranları açıldı!');
    });
  };

  const handleCloseTerm = () => {
    if (!window.confirm('Mevcut dönemi resmi olarak kapatmak istediğinize emin misiniz?')) return;
    dispatch(updateTermLocks({
      isTermClosed: true,
      isGradeLocksActive: true
    })).then(() => {
      dispatch(fetchDeanDashboardData());
      toast.success('Dönem resmi olarak kapatıldı!');
    });
  };

  // Counts definition
  const pendingAssignments = courseAssignments.filter(x => x.status === 'pending');
  const pendingStudents = studentRequests.filter(x => x.status === 'pending');
  const pendingDocuments = (documents || []).filter(x => x.status === 'pending');
  const pendingGraduations = graduationApprovals.filter(x => x.status === 'pending');
  const pendingCurriculums = curriculum.filter(c => c.status === 'Taslak');
  const pendingInstructors = instructors.filter(inst => inst.status === 'pending');
  const pendingInternships = users.filter(u => u.role === 'student' && u.internshipStatus === 'pending');

  const totalPendingCount =
    pendingAssignments.length +
    pendingStudents.length +
    pendingDocuments.length +
    pendingGraduations.length +
    pendingCurriculums.length +
    pendingInstructors.length +
    pendingInternships.length;

  return (
    <section className="app-page-canvas">
      {/* Breadcrumb & Header */}
      <div className="app-header-row">
        <div className="app-header-info">
          <h2 className="app-title">Onay &amp; Bildirim Merkezi</h2>
          <p className="app-desc">Akademik süreçleri denetleyin ve bildirim bültenleri yayınlayın.</p>
        </div>
        <div className="app-header-badges">
          <div className="app-stat-badge">
            <span className="app-badge-lbl">AKADEMİK TALEPLER</span>
            <span className="app-badge-val text-red-600">{totalPendingCount}</span>
          </div>
          <div className="app-stat-badge">
            <span className="app-badge-lbl">YAYINDA BİLDİRİM</span>
            <span className="app-badge-val text-blue-600">{bulletins.length}</span>
          </div>
        </div>
      </div>

      {/* Tabs Menu Navigation */}
      <div className="flex gap-2 border-b border-slate-200 mb-6 pb-px overflow-x-auto">
        <button className={`px-4 py-2.5 font-bold text-xs rounded-t-lg transition-all ${activeTab === 'assignments' ? 'bg-[#00236f] text-white' : 'text-slate-600 hover:bg-slate-100'}`} onClick={() => setActiveTab('assignments')}>
          Görevlendirmeler ({pendingAssignments.length})
        </button>
        <button className={`px-4 py-2.5 font-bold text-xs rounded-t-lg transition-all ${activeTab === 'curriculum' ? 'bg-[#00236f] text-white' : 'text-slate-600 hover:bg-slate-100'}`} onClick={() => setActiveTab('curriculum')}>
          Taslak Dersler ({pendingCurriculums.length})
        </button>
        <button className={`px-4 py-2.5 font-bold text-xs rounded-t-lg transition-all ${activeTab === 'faculty' ? 'bg-[#00236f] text-white' : 'text-slate-600 hover:bg-slate-100'}`} onClick={() => setActiveTab('faculty')}>
          Eğitmen Kadrosu ({pendingInstructors.length})
        </button>
        <button className={`px-4 py-2.5 font-bold text-xs rounded-t-lg transition-all ${activeTab === 'internship' ? 'bg-[#00236f] text-white' : 'text-slate-600 hover:bg-slate-100'}`} onClick={() => setActiveTab('internship')}>
          Staj Talepleri ({pendingInternships.length})
        </button>
        <button className={`px-4 py-2.5 font-bold text-xs rounded-t-lg transition-all ${activeTab === 'students' ? 'bg-[#00236f] text-white' : 'text-slate-600 hover:bg-slate-100'}`} onClick={() => setActiveTab('students')}>
          Talepler &amp; Evraklar ({pendingStudents.length + pendingDocuments.length})
        </button>
        <button className={`px-4 py-2.5 font-bold text-xs rounded-t-lg transition-all ${activeTab === 'term' ? 'bg-[#00236f] text-white' : 'text-slate-600 hover:bg-slate-100'}`} onClick={() => setActiveTab('term')}>
          Dönem &amp; Kilit
        </button>
        <button className={`px-4 py-2.5 font-bold text-xs rounded-t-lg transition-all ${activeTab === 'graduation' ? 'bg-[#00236f] text-white' : 'text-slate-600 hover:bg-slate-100'}`} onClick={() => setActiveTab('graduation')}>
          Mezuniyet ({pendingGraduations.length})
        </button>
        <button className={`px-4 py-2.5 font-bold text-xs rounded-t-lg transition-all ${activeTab === 'logs' ? 'bg-[#00236f] text-white' : 'text-slate-600 hover:bg-slate-100'}`} onClick={() => setActiveTab('logs')}>
          İşlem Kayıtları
        </button>
      </div>

      <div className="app-main-grid">
        <div className="app-left-column">
          {activeTab === 'assignments' && (
            <div className="app-card">
              <h4 className="text-sm font-black text-slate-800 mb-4">Ders Görevlendirme Onayları</h4>
              <RequestTable 
                headers={['Eğitmen & Bölüm', 'Görevlendirme', 'İşlem']}
                items={pendingAssignments}
                renderRow={(ca, idx) => (
                  <tr className="app-row" key={ca.id || idx}>
                    <td className="app-td-info">
                      <span className="app-td-course-name">{ca.instructorName}</span>
                      <span className="app-td-instructor">{ca.dept}</span>
                    </td>
                    <td className="app-td-bold text-slate-700">{ca.courseName}</td>
                    <td className="app-td">
                      <div className="app-actions-wrap">
                        <button className="app-btn-action-ok" onClick={() => handleApproveAssignment(ca.id, ca.instructorName, ca.courseName)}>
                          <span className="material-symbols-outlined text-[16px]">check</span>
                        </button>
                        <button className="app-btn-action-no" onClick={() => handleRejectAssignment(ca.id, ca.instructorName, ca.courseName)}>
                          <span className="material-symbols-outlined text-[16px]">close</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                )}
              />
            </div>
          )}

          {activeTab === 'curriculum' && (
            <div className="app-card">
              <h4 className="text-sm font-black text-slate-800 mb-4">Müfredat Taslak Onayları</h4>
              <RequestTable 
                headers={['Taslak Adı & Kodu', 'AKTS Değeri', 'İşlem']}
                items={pendingCurriculums}
                renderRow={(c, idx) => (
                  <tr className="app-row" key={c.id || idx}>
                    <td className="app-td-info">
                      <span className="app-td-course-name">{c.name}</span>
                      <span className="app-td-instructor">Kod: {c.code}</span>
                    </td>
                    <td className="app-td-bold text-slate-750">{c.ects} AKTS</td>
                    <td className="app-td">
                      <div className="app-actions-wrap">
                        <button className="app-btn-action-ok" onClick={() => handleApproveCurriculum(c.id, c.name)}>
                          <span className="material-symbols-outlined text-[16px]">check</span>
                        </button>
                        <button className="app-btn-action-no" onClick={() => handleRejectCurriculum(c.id, c.name)}>
                          <span className="material-symbols-outlined text-[16px]">close</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                )}
              />
            </div>
          )}

          {activeTab === 'faculty' && (
            <div className="app-card">
              <h4 className="text-sm font-black text-slate-800 mb-4">Eğitmen Kadro Onayları</h4>
              <RequestTable 
                headers={['Eğitmen Bilgisi', 'Fakülte / Branş', 'İşlem']}
                items={pendingInstructors}
                renderRow={(inst, idx) => (
                  <tr className="app-row" key={inst.id || idx}>
                    <td className="app-td-info">
                      <span className="app-td-course-name">{inst.name}</span>
                      <span className="app-td-instructor">{inst.employmentType === 'Full-Time' ? 'Tam Zamanlı' : 'Yarı Zamanlı'}</span>
                    </td>
                    <td className="app-td-bold text-slate-750">{inst.dept}</td>
                    <td className="app-td">
                      <div className="app-actions-wrap">
                        <button className="app-btn-action-ok" onClick={() => handleApproveFacultyOnboarding(inst.id, inst.name)}>
                          <span className="material-symbols-outlined text-[16px]">check</span>
                        </button>
                        <button className="app-btn-action-no" onClick={() => handleRejectFacultyOnboarding(inst.id, inst.name)}>
                          <span className="material-symbols-outlined text-[16px]">close</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                )}
              />
            </div>
          )}

          {activeTab === 'internship' && (
            <div className="app-card">
              <h4 className="text-sm font-black text-slate-800 mb-4">Öğrenci Staj Onayları</h4>
              <RequestTable 
                headers={['Öğrenci Bilgisi', 'Staj Yapılacak Şirket', 'İşlem']}
                items={pendingInternships}
                renderRow={(stud, idx) => (
                  <tr className="app-row" key={stud.id || idx}>
                    <td className="app-td-info">
                      <span className="app-td-course-name">{stud.name}</span>
                      <span className="app-td-instructor">No: {stud.studentNumber}</span>
                    </td>
                    <td className="app-td-bold text-slate-705">{stud.internshipCompany}</td>
                    <td className="app-td">
                      <div className="app-actions-wrap">
                        <button className="app-btn-action-ok" onClick={() => handleApproveInternship(stud.id, stud.name, stud.internshipCompany)}>
                          <span className="material-symbols-outlined text-[16px]">check</span>
                        </button>
                        <button className="app-btn-action-no" onClick={() => handleRejectInternship(stud.id, stud.name, stud.internshipCompany)}>
                          <span className="material-symbols-outlined text-[16px]">close</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                )}
              />
            </div>
          )}

          {activeTab === 'students' && (
            <div className="flex flex-col gap-6">
              {/* FYK Talepleri */}
              <div className="app-card">
                <h4 className="text-sm font-black text-slate-800 mb-4">Öğrenci İstisnai Talepleri (FYK)</h4>
                <RequestTable 
                  headers={['Öğrenci', 'Talep Türü', 'Detay & Gerekçe', 'İşlem']}
                  items={pendingStudents}
                  renderRow={(sr, idx) => (
                    <tr className="app-row" key={sr.id || idx}>
                      <td className="app-td-info">
                        <span className="app-td-course-name">{sr.studentName}</span>
                        <span className="app-td-instructor">No: {sr.studentNumber}</span>
                      </td>
                      <td className="app-td font-bold text-slate-800">{sr.requestType}</td>
                      <td className="app-td text-slate-600 text-[11px]">{sr.details}</td>
                      <td className="app-td">
                        <div className="app-actions-wrap">
                          <button className="app-btn-action-ok" onClick={() => handleApproveStudent(sr.id, sr.studentName, sr.requestType)}>
                            <span className="material-symbols-outlined text-[16px]">check</span>
                          </button>
                          <button className="app-btn-action-no" onClick={() => handleRejectStudent(sr.id, sr.studentName, sr.requestType)}>
                            <span className="material-symbols-outlined text-[16px]">close</span>
                          </button>
                        </div>
                      </td>
                    </tr>
                  )}
                />
              </div>

              {/* Resmi Evrak Talepleri */}
              <div className="app-card">
                <h4 className="text-sm font-black text-slate-800 mb-4">Resmi Evrak Talepleri (Transkript / Belge)</h4>
                <RequestTable 
                  headers={['Öğrenci', 'Belge Başlığı', 'Açıklama', 'İşlem']}
                  items={pendingDocuments}
                  renderRow={(doc, idx) => (
                    <tr className="app-row" key={doc.id || idx}>
                      <td className="app-td-info">
                        <span className="app-td-course-name">{doc.studentName}</span>
                        <span className="app-td-instructor">ID: {doc.studentId}</span>
                      </td>
                      <td className="app-td font-bold text-slate-800">{doc.title}</td>
                      <td className="app-td text-slate-600 text-[11px]">{doc.description}</td>
                      <td className="app-td">
                        <div className="app-actions-wrap">
                          <button className="app-btn-action-ok" onClick={() => handleApproveDocument(doc.id, doc.studentName, doc.title)}>
                            <span className="material-symbols-outlined text-[16px]">check</span>
                          </button>
                          <button className="app-btn-action-no" onClick={() => handleRejectDocument(doc.id, doc.studentName, doc.title)}>
                            <span className="material-symbols-outlined text-[16px]">close</span>
                          </button>
                        </div>
                      </td>
                    </tr>
                  )}
                />
              </div>
            </div>
          )}

          {activeTab === 'term' && (
            <div className="app-card">
              <h4 className="text-sm font-black text-slate-800 mb-4">Dönem Sonu Kapatma &amp; Not Giriş Denetimi</h4>
              <div className="p-4 bg-slate-50 border border-slate-200/60 rounded-xl mb-6">
                <h5 className="font-bold text-slate-800 text-xs mb-1">1. Not Giriş Kilitleri (Ek Süre Tanıma)</h5>
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-700">
                    Not Giriş Durumu: {termStatus.isGradeLocksActive ? '🔒 KİLİTLİ' : '🔓 AÇIK'}
                  </span>
                  <button className={`px-4 py-2 text-xs font-bold rounded-lg transition-all ${termStatus.isGradeLocksActive ? 'bg-amber-600 text-white hover:bg-amber-700' : 'bg-red-600 text-white hover:bg-red-700'}`} onClick={handleToggleLocks}>
                    {termStatus.isGradeLocksActive ? 'Kilitleri Kaldır' : 'Kilitleri Aktifleştir'}
                  </button>
                </div>
              </div>
              <div className="p-4 bg-slate-50 border border-slate-200/60 rounded-xl">
                <h5 className="font-bold text-slate-800 text-xs mb-1">2. Dönem Kapatma Onayı</h5>
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-700">
                    Dönem Resmi Durumu: {termStatus.isTermClosed ? '🟥 KAPATILDI' : '🟩 AKTİF'}
                  </span>
                  <button className={`px-4 py-2 text-xs font-bold rounded-lg transition-all bg-[#00236f] text-white hover:bg-blue-900 ${termStatus.isTermClosed ? 'opacity-50 cursor-not-allowed' : ''}`} onClick={handleCloseTerm} disabled={termStatus.isTermClosed}>
                    {termStatus.isTermClosed ? 'Dönem Kapatılmış' : 'Dönemi Resmi Olarak Kapat'}
                  </button>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'graduation' && (
            <div className="app-card">
              <h4 className="text-sm font-black text-slate-800 mb-4">Mezuniyet &amp; Diploma Onayları</h4>
              <RequestTable 
                headers={['Öğrenci Bilgisi', 'AKTS Durumu', 'GANO', 'İşlem']}
                items={pendingGraduations}
                renderRow={(ga, idx) => (
                  <tr className="app-row" key={ga.id || idx}>
                    <td className="app-td-info">
                      <span className="app-td-course-name">{ga.studentName}</span>
                      <span className="app-td-instructor">No: {ga.studentNumber}</span>
                    </td>
                    <td className="app-td-bold">{ga.ects} / 240 AKTS</td>
                    <td className="app-td-bold text-blue-900">{ga.gpa}</td>
                    <td className="app-td">
                      <button className="px-3 py-1.5 bg-[#00236f] hover:bg-blue-900 text-white rounded-lg text-[10px] font-bold transition-all border-none cursor-pointer" onClick={() => handleApproveGraduation(ga.id, ga.studentName)}>
                        Mezuniyeti Onayla
                      </button>
                    </td>
                  </tr>
                )}
              />
            </div>
          )}

          {activeTab === 'logs' && (
            <div className="app-card">
              <h4 className="text-sm font-black text-slate-800 mb-4">Fakülte İşlem Geçmişi (Logs Audit)</h4>
              <div className="flex flex-col gap-3">
                {systemLogs.map((log, idx) => (
                  <div className="p-3 bg-slate-50 border border-slate-100 rounded-xl flex items-start justify-between text-xs" key={log.id || idx}>
                    <div>
                      <span className="font-bold text-slate-800">{log.operator}</span> — <span className="px-2 py-0.5 bg-slate-200 text-slate-600 rounded text-[9px] font-bold uppercase">{log.action}</span>
                      <p className="text-[11px] text-slate-500 mt-1 m-0">{log.details}</p>
                    </div>
                    <span className="text-[10px] text-slate-400 font-bold">{log.timestamp}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Sidebar Bulletin Form */}
        <div className="app-sidebar">
          <div className="app-sidebar-card">
            <h4 className="app-sidebar-title">Bülten Oluşturucu</h4>
            <div className="app-form-group">
              <label className="app-form-label">Başlık</label>
              <input type="text" className="app-form-input" placeholder="Duyuru başlığı..." value={title} onChange={(e) => setTitle(e.target.value)} />
            </div>
            <div className="app-form-group">
              <label className="app-form-label">Hedef Kitle</label>
              <select className="app-form-select" value={audience} onChange={(e) => setAudience(e.target.value)}>
                <option value="Sistem">Sistem</option>
                <option value="Eğitmen">Eğitmen</option>
                <option value="Öğrenci">Öğrenci</option>
              </select>
            </div>
            <button className="app-btn-publish w-full py-2.5 bg-[#00236f] hover:bg-blue-900 text-white rounded-xl text-xs font-bold transition-all border-none cursor-pointer flex items-center justify-center gap-2" onClick={handlePublish}>
              <span>Bülteni Yayınla</span>
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
