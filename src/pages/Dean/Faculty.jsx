import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { 
  fetchDeanDashboardData, 
  addInstructorAsync, 
  updateInstructorAsync, 
  deleteInstructorAsync,
  writeSystemLog
} from '../../store/dean/deanSlice';
import { toast } from 'react-hot-toast';

export default function Faculty() {
  const dispatch = useDispatch();
  const { instructors = [], status } = useSelector((state) => state.dean);
  const [filter, setFilter] = useState('Tümü');
  const [searchQuery, setSearchQuery] = useState('');

  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  // Add/Edit Modals state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState('add'); // 'add' | 'edit'
  const [selectedInstId, setSelectedInstId] = useState(null);

  // Form fields
  const [name, setName] = useState('');
  const [dept, setDept] = useState('Yazılım Mühendisliği');
  const [rating, setRating] = useState(0);
  const [workload, setWorkload] = useState(85);
  const [studentCount, setStudentCount] = useState(0);
  const [employmentType, setEmploymentType] = useState('Full-Time');

  useEffect(() => {
    dispatch(fetchDeanDashboardData());
  }, [dispatch]);

  // Calculate dynamic metrics
  const totalInstructors = instructors.length;
  const avgRating = totalInstructors > 0 
    ? (instructors.reduce((acc, curr) => acc + (Number(curr.rating) || 0), 0) / totalInstructors).toFixed(2)
    : '0.00';
    
  const avgWorkload = totalInstructors > 0 
    ? (instructors.reduce((acc, curr) => acc + (Number(curr.workload) || 0), 0) / totalInstructors).toFixed(1)
    : '0';

  const activeCoursesCount = totalInstructors * 2; // Dynamic estimate

  // Filter & Search
  const filteredInstructors = instructors.filter(inst => {
    const matchesSearch = inst.name?.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          inst.dept?.toLowerCase().includes(searchQuery.toLowerCase());
    if (!matchesSearch) return false;

    if (filter === 'Tümü') return true;
    if (filter === 'Tam Zamanlı') return inst.employmentType === 'Full-Time' || inst.workload >= 70;
    if (filter === 'Yarı Zamanlı') return inst.employmentType === 'Part-Time' || inst.workload < 70;
    return true;
  });

  // Pagination logic
  const totalItems = filteredInstructors.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage) || 1;
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedInstructors = filteredInstructors.slice(startIndex, startIndex + itemsPerPage);

  const handleOpenAddModal = () => {
    setModalMode('add');
    setName('');
    setDept('Yazılım Mühendisliği');
    setRating(0); // newly hired: no student rating
    setWorkload(0); // newly hired: no attendance rate
    setStudentCount(0);
    setEmploymentType('Full-Time');
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (inst) => {
    setModalMode('edit');
    setSelectedInstId(inst.id);
    setName(inst.name);
    setDept(inst.dept || 'Yazılım Mühendisliği');
    setRating(inst.rating || 0);
    setWorkload(inst.workload || 0);
    setStudentCount(inst.studentCount || 0);
    setEmploymentType(inst.employmentType || (inst.workload >= 70 ? 'Full-Time' : 'Part-Time'));
    setIsModalOpen(true);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!name.trim()) {
      toast.error('Lütfen eğitmen ismini girin.');
      return;
    }

    if (modalMode === 'add') {
      const newInst = {
        name,
        dept,
        rating: 0, // Newly hired: no historical rating
        workload: employmentType === 'Full-Time' ? 100 : 40, // Base default workload based on type
        studentCount: 0,
        employmentType,
        status: 'pending', // Hooked directly into administrative sign-off approvals
        avatar: `https://images.unsplash.com/photo-${1500000000000 + Math.floor(Math.random() * 900000)}?w=150&q=80`
      };
      dispatch(addInstructorAsync(newInst)).then(() => {
        dispatch(writeSystemLog({
          operator: 'Prof. Dr. Kemal Arslan',
          action: 'Eğitmen Kaydı Onay Bekliyor',
          details: `Yeni öğretim görevlisi ${name} (${dept} - ${employmentType === 'Full-Time' ? 'Tam Zamanlı' : 'Yarı Zamanlı'}) için idari onay süreci başlatıldı.`
        }));
        dispatch(fetchDeanDashboardData());
        toast.success('Yeni eğitmen kaydı onay merkezine gönderildi!');
        setIsModalOpen(false);
      });
    } else {
      dispatch(updateInstructorAsync({ 
        id: selectedInstId, 
        rating: Number(rating), 
        workload: Number(workload),
        employmentType
      })).then(() => {
        dispatch(writeSystemLog({
          operator: 'Prof. Dr. Kemal Arslan',
          action: 'Eğitmen Bilgisi Güncellendi',
          details: `${name} isimli eğitmenin performans ve katılım verileri güncellendi.`
        }));
        dispatch(fetchDeanDashboardData());
        toast.success('Eğitmen bilgileri güncellendi!');
        setIsModalOpen(false);
      });
    }
  };

  const handleDelete = (id, instName) => {
    if (!window.confirm(`${instName} kadrodan tamamen çıkarılsın mı? Bu işlem geri alınamaz.`)) return;

    dispatch(deleteInstructorAsync(id)).then(() => {
      dispatch(writeSystemLog({
        operator: 'Prof. Dr. Kemal Arslan',
        action: 'Eğitmen Kadrodan Çıkarıldı',
        details: `${instName} isimli öğretim görevlisi fakülte kadrosundan çıkarıldı.`
      }));
      dispatch(fetchDeanDashboardData());
      toast.success('Eğitmen kadrodan çıkarıldı.');
      // Check if page needs correction
      if (paginatedInstructors.length === 1 && currentPage > 1) {
        setCurrentPage(prev => prev - 1);
      }
    });
  };

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
          <button className="fac-btn-add" onClick={handleOpenAddModal}>
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
              Aktif Kadro
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
            <span className="fac-card-badge-gray">Genel Memnuniyet</span>
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
            <span className="fac-card-badge-gray">Ortalama</span>
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
              <h3 className="fac-card-val">{activeCoursesCount}</h3>
            </div>
          </div>
        </div>
      </div>

      {/* Instructor List Card */}
      <div className="fac-list-card">
        <div className="fac-list-header flex flex-col md:flex-row md:items-center justify-between gap-4">
          <h4 className="fac-list-title">Eğitmen Listesi</h4>
          <div className="fac-list-actions flex flex-wrap items-center gap-3">
            <div className="relative">
              <input 
                type="text" 
                placeholder="Eğitmen veya bölüm ara..." 
                className="py-1.5 px-3 bg-slate-50 border border-solid border-slate-200 rounded-xl text-xs focus:ring-1 focus:ring-blue-500 focus:outline-none w-52"
                value={searchQuery}
                onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1); }}
              />
            </div>
            <div className="fac-segment-control">
              {['Tümü', 'Tam Zamanlı', 'Yarı Zamanlı'].map(lbl => (
                <button 
                  key={lbl}
                  className={`fac-segment-btn ${filter === lbl ? 'fac-segment-btn-active' : ''}`}
                  onClick={() => { setFilter(lbl); setCurrentPage(1); }}
                >
                  {lbl}
                </button>
              ))}
            </div>
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
                <th className="fac-th text-right">İŞLEMLER</th>
              </tr>
            </thead>
            <tbody>
              {paginatedInstructors.map((inst, idx) => (
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
                      <span className="fac-tag">{inst.dept || 'Yazılım Mühendisliği'}</span>
                    </div>
                  </td>
                  <td className="fac-td">
                    <div className="fac-rating-box">
                      <span className="material-symbols-outlined fac-star-icon">star</span>
                      <span>{inst.rating}</span>
                      <span className="fac-rating-count">({inst.studentCount || 0})</span>
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
                    <span className={`fac-status-pill ${inst.status === 'pending' ? 'bg-amber-100 text-amber-800' : (inst.workload >= 50 ? 'fac-status-active' : 'fac-status-leave')}`}>
                      {inst.status === 'pending' ? 'ONAY BEKLİYOR' : (inst.workload >= 50 ? 'AKTİF' : 'İZİNLİ')}
                    </span>
                  </td>
                  <td className="fac-td text-right">
                    <div className="flex gap-2 justify-end">
                      <button 
                        className="p-1.5 hover:bg-slate-100 rounded-lg border-none bg-transparent cursor-pointer text-blue-600 flex items-center justify-center"
                        onClick={() => handleOpenEditModal(inst)}
                        title="Düzenle"
                      >
                        <span className="material-symbols-outlined text-base">edit</span>
                      </button>
                      <button 
                        className="p-1.5 hover:bg-rose-50 rounded-lg border-none bg-transparent cursor-pointer text-rose-600 flex items-center justify-center"
                        onClick={() => handleDelete(inst.id, inst.name)}
                        title="Sil"
                      >
                        <span className="material-symbols-outlined text-base">delete</span>
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {paginatedInstructors.length === 0 && (
                <tr>
                  <td colSpan="6" className="text-center py-8 text-xs text-slate-400 italic">Eğitmen bulunamadı.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Dynamic Pagination footer */}
        <div className="fac-list-footer flex justify-between items-center p-4">
          <span className="text-xs text-slate-500">
            Toplam {totalItems} kayıttan {totalItems > 0 ? startIndex + 1 : 0}-{Math.min(startIndex + itemsPerPage, totalItems)} arası gösteriliyor
          </span>
          <div className="fac-pagination flex gap-2">
            <button 
              className="fac-page-btn border border-solid border-slate-200 bg-white p-1 rounded-lg flex items-center justify-center cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={currentPage === 1}
              onClick={() => setCurrentPage(prev => prev - 1)}
            >
              <span className="material-symbols-outlined text-[16px]">chevron_left</span>
            </button>
            
            {Array.from({ length: totalPages }, (_, i) => i + 1).map(pageNum => (
              <button 
                key={pageNum}
                className={`fac-page-btn w-8 h-8 rounded-lg font-bold text-xs border border-solid border-slate-250 cursor-pointer ${
                  currentPage === pageNum ? 'bg-[#00236f] text-white' : 'bg-white text-slate-700 hover:bg-slate-50'
                }`}
                onClick={() => setCurrentPage(pageNum)}
              >
                {pageNum}
              </button>
            ))}

            <button 
              className="fac-page-btn border border-solid border-slate-200 bg-white p-1 rounded-lg flex items-center justify-center cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={currentPage === totalPages}
              onClick={() => setCurrentPage(prev => prev + 1)}
            >
              <span className="material-symbols-outlined text-[16px]">chevron_right</span>
            </button>
          </div>
        </div>
      </div>

      {/* Add / Edit Instructor Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <form onSubmit={handleSubmit} className="bg-white rounded-3xl w-full max-w-md overflow-hidden shadow-2xl flex flex-col border border-solid border-slate-100">
            <div className="p-5 border-b border-solid border-slate-100 flex justify-between items-center bg-slate-50/50">
              <div>
                <h3 className="font-black text-slate-800 text-sm flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-blue-900 text-base">
                    {modalMode === 'add' ? 'person_add' : 'edit'}
                  </span>
                  {modalMode === 'add' ? 'Yeni Eğitmen Kaydı' : 'Eğitmen Bilgilerini Güncelle'}
                </h3>
                <p className="text-[10px] text-slate-400 font-medium">Akademik kadro yetkinlik ve performans tanımlama formu</p>
              </div>
              <button 
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="w-8 h-8 rounded-full border border-solid border-slate-200 bg-white hover:bg-slate-50 cursor-pointer flex items-center justify-center text-slate-500 font-bold"
              >
                <span className="material-symbols-outlined text-sm">close</span>
              </button>
            </div>
            
            <div className="p-6 space-y-4">
              <div className="curr-form-group">
                <label className="curr-form-label">Adı Soyadı</label>
                <input 
                  type="text" 
                  disabled={modalMode === 'edit'}
                  className="curr-form-input w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-1 focus:ring-blue-500 focus:outline-none disabled:opacity-60"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Örn: Dr. Ahmet Yılmaz"
                />
              </div>

              <div className="curr-form-group">
                <label className="curr-form-label">Fakülte / Bölüm</label>
                <select 
                  disabled={modalMode === 'edit'}
                  className="curr-form-select w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-1 focus:ring-blue-500 focus:outline-none disabled:opacity-60"
                  value={dept}
                  onChange={(e) => setDept(e.target.value)}
                >
                  <option value="Yazılım Mühendisliği">Yazılım Mühendisliği</option>
                  <option value="Bilgisayar Mühendisliği">Bilgisayar Mühendisliği</option>
                  <option value="İşletme Bölümü">İşletme Bölümü</option>
                  <option value="Moleküler Biyoloji">Moleküler Biyoloji</option>
                </select>
              </div>

              <div className="curr-form-group">
                <label className="curr-form-label">İstihdam Türü (Employment Type)</label>
                <select 
                  className="curr-form-select w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-1 focus:ring-blue-500 focus:outline-none"
                  value={employmentType}
                  onChange={(e) => setEmploymentType(e.target.value)}
                >
                  <option value="Full-Time">Tam Zamanlı (Full-Time)</option>
                  <option value="Part-Time">Yarı Zamanlı (Part-Time)</option>
                </select>
              </div>

              {modalMode === 'edit' && (
                <div className="grid grid-cols-2 gap-4">
                  <div className="curr-form-group">
                    <label className="curr-form-label">Öğrenci Puanı (5.0 üzerinden)</label>
                    <input 
                      type="number" 
                      step="0.1"
                      min="1"
                      max="5"
                      className="curr-form-input w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-1 focus:ring-blue-500 focus:outline-none"
                      value={rating}
                      onChange={(e) => setRating(e.target.value)}
                    />
                  </div>
                  <div className="curr-form-group">
                    <label className="curr-form-label">Yoklama Katılım Oranı (%)</label>
                    <input 
                      type="number" 
                      min="10"
                      max="100"
                      className="curr-form-input w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-1 focus:ring-blue-500 focus:outline-none"
                      value={workload}
                      onChange={(e) => setWorkload(e.target.value)}
                    />
                  </div>
                </div>
              )}

              <div className="flex gap-3 justify-end pt-2">
                <button 
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 border border-solid border-slate-200 bg-white hover:bg-slate-50 text-slate-600 font-bold text-xs rounded-xl cursor-pointer"
                >
                  İptal Et
                </button>
                <button 
                  type="submit"
                  className="px-4 py-2 bg-[#00236f] hover:bg-blue-900 text-white font-bold text-xs rounded-xl border-none cursor-pointer"
                >
                  {modalMode === 'add' ? 'Eğitmeni Kaydet' : 'Değişiklikleri Güncelle'}
                </button>
              </div>
            </div>
          </form>
        </div>
      )}
    </section>
  );
}
