import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  fetchCurriculumAsync,
  createNewCurriculumCourseAsync,
  updateCurriculumCourseAsync,
  deleteCurriculumCourseAsync
} from '../../store/course/courseSlice';
import { jsPDF } from 'jspdf';
import { toast } from 'react-hot-toast';
import CurriculumForm from '../../components/curriculum/CurriculumForm';
import ConfirmationModal from '../../components/UI/ConfirmationModal';

export default function Curriculum() {
  const dispatch = useDispatch();
  const { curriculum = [] } = useSelector((state) => state.course);
  const [modalConfig, setModalConfig] = useState({ isOpen: false, title: '', message: '', onConfirm: null, confirmType: 'danger' });
  const [courseName, setCourseName] = useState('');
  const [track, setTrack] = useState('Full-Stack Web');
  const [ects, setEcts] = useState(6);
  const [instructor, setInstructor] = useState('Dr. Arda Yılmaz');
  const [hours, setHours] = useState(48);
  const [quota, setQuota] = useState(50);
  const [activeMenuId, setActiveMenuId] = useState(null);
  const [expandedCourseIds, setExpandedCourseIds] = useState({});

  useEffect(() => {
    dispatch(fetchCurriculumAsync());
  }, [dispatch]);

  const handleExportPDF = () => {
    try {
      const doc = new jsPDF();
      doc.setFont('Helvetica', 'bold');
      doc.setFontSize(16);
      doc.setTextColor(0, 35, 111);
      doc.text('OBIS AKADEMIK MUREDIFAT VE AKTS RAPORU', 14, 20);

      doc.setFont('Helvetica', 'normal');
      doc.setFontSize(10);
      doc.setTextColor(100, 116, 139);
      doc.text(`Tarih: ${new Date().toLocaleDateString('tr-TR')} · Toplam Ders Sayısı: ${curriculum.length}`, 14, 28);
      doc.line(14, 34, 196, 34);

      let startY = 44;
      doc.setFont('Helvetica', 'bold');
      doc.setFontSize(12);
      doc.setTextColor(30, 41, 59);
      doc.text('Ders Listesi', 14, startY);
      startY += 10;

      doc.setFont('Helvetica', 'normal');
      doc.setFontSize(9);
      curriculum.forEach((c, index) => {
        if (startY > 270) {
          doc.addPage();
          startY = 20;
        }
        const text = `${index + 1}. [${c.code}] ${c.name} - ${c.ects} AKTS (${c.status}) · Eğitmen: ${c.instructor || 'Atanmadı'}`;
        doc.text(text, 14, startY);
        startY += 8;
      });

      doc.save('Universite_Mufredat_Raporu.pdf');
      toast.success('Müfredat PDF olarak başarıyla indirildi!');
    } catch (err) {
      console.error(err);
      toast.error('PDF üretilirken hata oluştu.');
    }
  };

  const { faculties = [], departments = [] } = useSelector((state) => state.dean);

  const handleUpdateStatus = (id, status) => {
    dispatch(updateCurriculumCourseAsync({ id, status })).then(() => {
      dispatch(fetchCurriculumAsync());
      setActiveMenuId(null);
      toast.success(`Ders durumu '${status}' olarak güncellendi.`);

      if (status === 'Aktif') {
        const templates = [
          { name: 'Veri Güvenliği (Data Security)', code: 'SEC401', ects: 5, instructor: 'Doç. Dr. Mert Akın', hours: 42, quota: 40, status: 'Aktif' },
          { name: 'Yapay Zeka Etiği (Artificial Intelligence Ethics)', code: 'AI405', ects: 4, instructor: 'Prof. Dr. Kerem Soylu', hours: 36, quota: 50, status: 'Aktif' },
          { name: 'Bulut Bilişim (Cloud Computing)', code: 'CLOUD408', ects: 6, instructor: 'Dr. Elif Soylu', hours: 48, quota: 30, status: 'Aktif' }
        ];

        Promise.all(templates.map(t =>
          dispatch(createNewCurriculumCourseAsync({ ...t, semester: 1 })).unwrap()
        )).then(() => {
          dispatch(fetchCurriculumAsync());
          toast.success('Müfredat onay şablonu (Veri Güvenliği, Yapay Zeka Etiği, Bulut Bilişim) otomatik olarak eklendi!');
        }).catch(err => console.error('Template injection failed', err));
      }
    });
  };

  const handleDeleteCourse = (id) => {
    const executeDelete = () => {
      dispatch(deleteCurriculumCourseAsync(id)).then(() => {
        dispatch(fetchCurriculumAsync());
        setActiveMenuId(null);
        toast.success('Ders müfredattan silindi.');
      });
    };

    setModalConfig({
      isOpen: true,
      title: 'Dersi Sil?',
      message: 'Bu dersi müfredattan tamamen kaldırmak istediğinize emin misiniz? Bu işlem geri alınamaz.',
      confirmType: 'danger',
      onConfirm: executeDelete
    });
  };

  const toggleExpandRow = (id) => {
    setExpandedCourseIds(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const handleSaveCourse = () => {
    if (!courseName.trim()) return;

    const prefix = track.slice(0, 3).toUpperCase();
    const num = Math.floor(100 + Math.random() * 800);
    const code = `${prefix}${num}`;

    dispatch(createNewCurriculumCourseAsync({
      code,
      name: courseName,
      ects: Number(ects),
      semester: 1,
      status: 'Taslak',
      instructor,
      hours: Number(hours),
      quota: Number(quota)
    })).then(() => {
      dispatch(fetchCurriculumAsync());
      toast.success('Yeni ders onay için gönderildi ve taslak olarak eklendi!');
    });

    setCourseName('');
  };

  const activeCourses = curriculum.filter(c => c.status === 'Aktif');
  const draftCourses = curriculum.filter(c => c.status === 'Taslak' || c.status === 'Pasif');

  return (
    <section className="curr-page-canvas">
      <div>
        <p className="curr-breadcrumb">
          AKADEMİK PLANLAMA
        </p>
        <div className="curr-header-row">
          <div className="curr-header-info">
            <h2 className="curr-title">Müfredat &amp; AKTS Yönetimi</h2>
          </div>
          <div className="curr-header-actions">
            <button className="curr-btn-export" onClick={handleExportPDF}>
              <span className="material-symbols-outlined text-[18px]">download</span>
              <span>Dışa Aktar (PDF)</span>
            </button>
          </div>
        </div>
      </div>

      <div className="curr-main-grid">
        <div className="curr-programs-wrap">
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
                  {activeCourses.map((course, idx) => {
                    const isExpanded = !!expandedCourseIds[course.id];
                    const isMenuOpen = activeMenuId === course.id;
                    return (
                      <tr className="hover:bg-slate-50/60 cursor-pointer" key={course.id || idx}>
                        <td className="curr-td-bold flex items-center gap-2" onClick={() => toggleExpandRow(course.id)}>
                          <span className="material-symbols-outlined text-slate-400 text-xs transition-transform duration-200" style={{ transform: isExpanded ? 'rotate(90deg)' : 'none' }}>
                            chevron_right
                          </span>
                          <span>{course.name}</span>
                        </td>
                        <td className="curr-td">{course.code}</td>
                        <td className="curr-td-bold">{course.ects} AKTS</td>
                        <td className="curr-td">
                          <span className="curr-status-pill curr-status-active">AKTİF</span>
                        </td>
                        <td className="curr-td relative">
                          <button className="curr-action-btn" onClick={() => setActiveMenuId(isMenuOpen ? null : course.id)}>
                            <span className="material-symbols-outlined">more_vert</span>
                          </button>
                          {isMenuOpen && (
                            <div className="absolute right-0 mt-1 w-36 bg-white border border-slate-200 rounded-lg shadow-lg z-20 py-1 text-xs">
                              <button className="w-full text-left px-3 py-1.5 hover:bg-slate-50 text-slate-700 font-bold border-none bg-transparent cursor-pointer" onClick={() => handleUpdateStatus(course.id, 'Taslak')}>
                                Taslağa Çek
                              </button>
                              <button className="w-full text-left px-3 py-1.5 hover:bg-slate-50 text-slate-700 font-bold border-none bg-transparent cursor-pointer" onClick={() => handleUpdateStatus(course.id, 'Pasif')}>
                                Pasif Yap
                              </button>
                              <button className="w-full text-left px-3 py-1.5 hover:bg-slate-50 text-rose-600 font-bold border-none bg-transparent cursor-pointer" onClick={() => handleDeleteCourse(course.id)}>
                                Dersi Sil
                              </button>
                            </div>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

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
                  {draftCourses.map((course, idx) => {
                    const isExpanded = !!expandedCourseIds[course.id];
                    const isMenuOpen = activeMenuId === course.id;
                    return (
                      <tr className="hover:bg-slate-50/60 cursor-pointer" key={course.id || idx}>
                        <td className="curr-td-bold flex items-center gap-2" onClick={() => toggleExpandRow(course.id)}>
                          <span className="material-symbols-outlined text-slate-400 text-xs transition-transform duration-200" style={{ transform: isExpanded ? 'rotate(90deg)' : 'none' }}>
                            chevron_right
                          </span>
                          <span>{course.name}</span>
                        </td>
                        <td className="curr-td">{course.code}</td>
                        <td className="curr-td-bold">{course.ects} AKTS</td>
                        <td className="curr-td">
                          <span className={`curr-status-pill ${course.status === 'Taslak' ? 'curr-status-draft' : 'curr-status-passive'}`}>
                            {course.status === 'Taslak' ? 'TASLAK' : 'PASİF'}
                          </span>
                        </td>
                        <td className="curr-td relative">
                          <button className="curr-action-btn" onClick={() => setActiveMenuId(isMenuOpen ? null : course.id)}>
                            <span className="material-symbols-outlined">more_vert</span>
                          </button>
                          {isMenuOpen && (
                            <div className="absolute right-0 mt-1 w-36 bg-white border border-slate-200 rounded-lg shadow-lg z-20 py-1 text-xs">
                              <button className="w-full text-left px-3 py-1.5 hover:bg-slate-50 text-slate-700 font-bold border-none bg-transparent cursor-pointer" onClick={() => handleUpdateStatus(course.id, 'Aktif')}>
                                Onayla (Aktif Et)
                              </button>
                              <button className="w-full text-left px-3 py-1.5 hover:bg-slate-50 text-slate-700 font-bold border-none bg-transparent cursor-pointer" onClick={() => handleUpdateStatus(course.id, 'Pasif')}>
                                Pasif Yap
                              </button>
                              <button className="w-full text-left px-3 py-1.5 hover:bg-slate-50 text-rose-600 font-bold border-none bg-transparent cursor-pointer" onClick={() => handleDeleteCourse(course.id)}>
                                Dersi Sil
                              </button>
                            </div>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        <div className="curr-sidebar-wrap">
          <CurriculumForm
            courseName={courseName}
            setCourseName={setCourseName}
            track={track}
            setTrack={setTrack}
            ects={ects}
            setEcts={setEcts}
            instructor={instructor}
            setInstructor={setInstructor}
            hours={hours}
            setHours={setHours}
            quota={quota}
            setQuota={setQuota}
            faculties={faculties}
            departments={departments}
            handleSaveCourse={handleSaveCourse}
          />
        </div>
      </div>

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
