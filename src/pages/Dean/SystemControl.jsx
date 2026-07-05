import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { 
  fetchDeanDashboardData, 
  updateUserStatus, 
  updateUserTuition, 
  triggerEmergencyAlert, 
  createNewSection,
  writeSystemLog 
} from '../../store/dean/deanSlice';

export default function SystemControl() {
  const dispatch = useDispatch();
  const { users, termStatus, courses } = useSelector((state) => state.dean);

  // Form states for New Section
  const [newSecCourse, setNewSecCourse] = useState('SOFT-302');
  const [newSecName, setNewSecName] = useState('Sınıf-A');
  const [newSecCapacity, setNewSecCapacity] = useState(40);
  const [newSecTeacher, setNewSecTeacher] = useState('Dr. Elif Soylu');

  // Interactive Tab for SystemControl: 'system' | 'academics'
  const [activeSubTab, setActiveSubTab] = useState('system');
  const [selectedFacultyId, setSelectedFacultyId] = useState('f1');

  // Emergency Alert input states
  const { faculties = [], departments = [] } = useSelector((state) => state.dean);
  const [alertText, setAlertText] = useState(termStatus.emergencyAlertText || '');

  useEffect(() => {
    dispatch(fetchDeanDashboardData());
  }, [dispatch]);

  // Update alertText local input when store updates
  useEffect(() => {
    if (termStatus.emergencyAlertText) {
      setAlertText(termStatus.emergencyAlertText);
    }
  }, [termStatus.emergencyAlertText]);

  // Filter students & teachers
  const studentsList = users.filter(u => u.role === 'student');
  const teachersList = users.filter(u => u.role === 'teacher');

  const handleToggleTuition = (student) => {
    const nextTuitionState = !student.tuitionPaid;
    dispatch(updateUserTuition({ id: student.id, tuitionPaid: nextTuitionState })).then(() => {
      dispatch(writeSystemLog({
        operator: 'Prof. Dr. Kemal Arslan',
        action: 'Finansal Durum Güncellemesi',
        details: `${student.name} isimli öğrencinin harç ödeme durumu ${nextTuitionState ? 'ÖDENDİ' : 'ÖDENMEDİ'} olarak güncellendi.`
      }));
      dispatch(fetchDeanDashboardData());
    });
  };

  const handleToggleUserStatus = (user) => {
    const nextStatus = user.status === 'active' ? 'suspended' : 'active';
    dispatch(updateUserStatus({ id: user.id, status: nextStatus })).then(() => {
      dispatch(writeSystemLog({
        operator: 'Prof. Dr. Kemal Arslan',
        action: nextStatus === 'suspended' ? 'Hesap Askıya Alındı' : 'Hesap Aktifleştirildi',
        details: `${user.name} (${user.role === 'student' ? 'Öğrenci' : 'Eğitmen'}) hesabı ${nextStatus === 'suspended' ? 'askıya alındı' : 'aktif edildi'}.`
      }));
      dispatch(fetchDeanDashboardData());
    });
  };

  const handlePasswordReset = (user) => {
    alert(`${user.name} isimli kullanıcının şifresi başarıyla sıfırlandı. Yeni geçici şifre: university123`);
    dispatch(writeSystemLog({
      operator: 'Prof. Dr. Kemal Arslan',
      action: 'Şifre Sıfırlama',
      details: `${user.name} kullanıcısının şifresi sıfırlandı.`
    }));
  };

  const handleCreateSection = () => {
    if (!newSecName.trim()) return;
    dispatch(createNewSection({
      name: `${newSecCourse} - ${newSecName}`,
      instructor: newSecTeacher,
      capacity: Number(newSecCapacity),
      category: 'Mühendislik', // Mock category
      akts: 5
    })).then(() => {
      dispatch(writeSystemLog({
        operator: 'Prof. Dr. Kemal Arslan',
        action: 'Yeni Şube Açıldı',
        details: `${newSecCourse} dersi için ${newSecName} şubesi oluşturuldu.`
      }));
      dispatch(fetchDeanDashboardData());
      setNewSecName('');
      alert('Yeni sınıf şubesi başarıyla açıldı ve kontenjan tanımlandı!');
    });
  };

  const handleToggleEmergencyAlert = () => {
    const nextAlertState = !termStatus.emergencyAlertActive;
    dispatch(triggerEmergencyAlert({
      emergencyAlertActive: nextAlertState,
      emergencyAlertText: alertText
    })).then(() => {
      dispatch(writeSystemLog({
        operator: 'Prof. Dr. Kemal Arslan',
        action: nextAlertState ? 'Acil Durum Bildirisi Yayında' : 'Acil Durum Bildirisi Kaldırıldı',
        details: nextAlertState ? `Sistem geneli acil durum mesajı yayınlandı: "${alertText}"` : 'Sistem geneli acil durum mesajı yayından kaldırıldı.'
      }));
      dispatch(fetchDeanDashboardData());
    });
  };

  return (
    <section className="app-page-canvas">
      {/* Breadcrumb & Header */}
      <div className="app-header-row mb-6">
        <div className="app-header-info">
          <p className="fac-breadcrumb mb-1">
            YÖNETİM &gt; <span className="fac-breadcrumb-active">SİSTEM KONTROLÜ</span>
          </p>
          <h2 className="app-title text-[#00236f] font-black text-xl flex items-center gap-2">
            <span className="material-symbols-outlined text-[24px]">shield_person</span>
            Sistem Kontrolü &amp; Admin Panel
          </h2>
          <p className="app-desc text-slate-500">
            Harç ödemeleri, hesap askıya alma, acil durum FAB banner tetikleyicisi ve yeni şube açılışlarını denetleyin.
          </p>
        </div>
      </div>

      {/* Sub Tabs Menu Navigation */}
      <div className="flex gap-2 border-b border-slate-200 mb-6 pb-px">
        <button
          className={`px-4 py-2 font-bold text-xs rounded-t-lg transition-all border-none bg-transparent cursor-pointer ${activeSubTab === 'system' ? 'border-b-2 border-solid border-[#00236f] text-[#00236f]' : 'text-slate-500 hover:bg-slate-50'}`}
          onClick={() => setActiveSubTab('system')}
        >
          Sistem Denetimleri
        </button>
        <button
          className={`px-4 py-2 font-bold text-xs rounded-t-lg transition-all border-none bg-transparent cursor-pointer ${activeSubTab === 'academics' ? 'border-b-2 border-solid border-[#00236f] text-[#00236f]' : 'text-slate-500 hover:bg-slate-50'}`}
          onClick={() => setActiveSubTab('academics')}
        >
          Akademik Yapı &amp; Matris Yönetimi
        </button>
      </div>

      {activeSubTab === 'academics' ? (
        /* Akademik Yapı Matrisi */
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="bg-white border border-slate-200/60 rounded-2xl p-5 shadow-sm lg:col-span-1">
            <h3 className="text-sm font-black text-slate-800 mb-3 flex items-center gap-2">
              <span className="material-symbols-outlined text-blue-900">account_balance</span>
              Fakülteler
            </h3>
            <div className="flex flex-col gap-2">
              {faculties.map(fac => (
                <button
                  key={fac.id}
                  onClick={() => setSelectedFacultyId(fac.id)}
                  className={`text-left p-3.5 rounded-xl border border-solid text-xs font-bold transition-all cursor-pointer ${
                    selectedFacultyId === fac.id
                      ? 'bg-blue-50/50 border-blue-200 text-[#00236f]'
                      : 'bg-white border-slate-100 text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  <div className="flex justify-between items-center">
                    <span>{fac.name}</span>
                    <span className="text-[10px] bg-slate-100 text-slate-500 px-2 py-0.5 rounded-full font-black uppercase">{fac.code}</span>
                  </div>
                </button>
              ))}
            </div>
          </div>

          <div className="lg:col-span-2 flex flex-col gap-6">
            <div className="bg-white border border-slate-200/60 rounded-2xl p-5 shadow-sm">
              <h3 className="text-sm font-black text-slate-800 mb-4 flex items-center gap-2">
                <span className="material-symbols-outlined text-blue-900">grid_on</span>
                Bölüm, Eğitmen &amp; Ders Dağılımı
              </h3>
              
              <div className="space-y-6">
                {departments.filter(dept => dept.facultyId === selectedFacultyId).map(dept => {
                  const deptCourses = courses.filter(c => c.departmentId === dept.id);
                  const deptTeachers = teachersList.filter(t => t.departmentId === dept.id);
                  
                  return (
                    <div key={dept.id} className="border border-solid border-slate-150 rounded-2xl p-4 space-y-4">
                      <div className="flex justify-between items-center border-b border-solid border-slate-100 pb-2">
                        <h4 className="text-xs font-black text-slate-800 flex items-center gap-1.5">
                          <span className="material-symbols-outlined text-sm text-blue-900">folder_open</span>
                          {dept.name} ({dept.code})
                        </h4>
                        <span className="text-[10px] text-slate-500 font-bold">
                          {deptCourses.length} Ders · {deptTeachers.length} Eğitmen
                        </span>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <p className="text-[10px] font-black text-slate-450 uppercase tracking-wider flex items-center gap-1">
                            <span className="material-symbols-outlined text-xs">book</span> Ders Kataloğu
                          </p>
                          <div className="flex flex-col gap-1.5">
                            {deptCourses.map(c => (
                              <div key={c.id} className="bg-slate-55/40 bg-slate-50 p-2.5 rounded-xl border border-solid border-slate-100/60 flex justify-between items-center">
                                <div>
                                  <div className="font-bold text-[11px] text-slate-800">{c.name}</div>
                                  <div className="text-[9px] text-slate-400 font-bold uppercase mt-0.5">{c.code} · {c.akts} AKTS</div>
                                </div>
                                <span className="text-[9px] bg-blue-50 text-blue-800 px-2 py-0.5 rounded font-black">{c.type}</span>
                              </div>
                            ))}
                            {deptCourses.length === 0 && <p className="text-[10px] text-slate-400 italic">Kayıtlı ders bulunamadı.</p>}
                          </div>
                        </div>

                        <div className="space-y-2">
                          <p className="text-[10px] font-black text-slate-450 uppercase tracking-wider flex items-center gap-1">
                            <span className="material-symbols-outlined text-xs">badge</span> Akademik Kadro
                          </p>
                          <div className="flex flex-col gap-1.5">
                            {deptTeachers.map(t => {
                              const teacherCourses = courses.filter(c => c.instructor === t.name);
                              return (
                                <div key={t.id} className="bg-slate-55/40 bg-slate-50 p-2.5 rounded-xl border border-solid border-slate-100/60 flex justify-between items-center">
                                  <div>
                                    <div className="font-bold text-[11px] text-slate-800">{t.name}</div>
                                    <div className="text-[9px] text-slate-400 font-bold mt-0.5">{t.email}</div>
                                  </div>
                                  <span className="text-[9px] bg-emerald-50 text-emerald-800 px-2 py-0.5 rounded font-black uppercase">
                                    {teacherCourses.length} Ders
                                  </span>
                                </div>
                              );
                            })}
                            {deptTeachers.length === 0 && <p className="text-[10px] text-slate-400 italic">Kayıtlı eğitmen bulunamadı.</p>}
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      ) : (
        /* Ana Bento Düzeni - Sistem Denetimleri */
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Column: Tuition Tracker & Account Manager */}
        <div className="lg:col-span-2 flex flex-col gap-6">
          
          {/* Tuition Tracker */}
          <div className="bg-white border border-slate-200/60 rounded-2xl p-5 shadow-sm">
            <h3 className="text-sm font-black text-slate-800 mb-3 flex items-center gap-2">
              <span className="material-symbols-outlined text-blue-900">payments</span>
              Harç &amp; Ödeme Takip Sistemi (Tuition Tracker)
            </h3>
            <p className="text-[11px] text-slate-500 mb-4">
              Ödemesi geciken öğrencilerin listesini inceleyin. Ödemesi eksik olan öğrencilerin ders kayıtları askıya alınacaktır.
            </p>
            <div className="overflow-x-auto">
              <table className="min-w-full text-left text-xs text-slate-600">
                <thead>
                  <tr className="bg-slate-50 text-[10px] font-bold text-slate-400 uppercase tracking-wider border-b border-slate-100">
                    <th className="py-2.5 px-3">Öğrenci</th>
                    <th className="py-2.5 px-3">Okul No</th>
                    <th className="py-2.5 px-3">İletişim &amp; Adres</th>
                    <th className="py-2.5 px-3">Harç Durumu</th>
                    <th className="py-2.5 px-3 text-right">İşlem</th>
                  </tr>
                </thead>
                <tbody>
                  {studentsList.map((student, idx) => (
                    <tr className="border-b border-slate-50 hover:bg-slate-50 transition-all" key={student.id || idx}>
                      <td className="py-3 px-3 font-bold text-slate-800">{student.name}</td>
                      <td className="py-3 px-3">{student.studentNumber}</td>
                      <td className="py-3 px-3">
                        <div className="flex flex-col gap-0.5">
                          <span className="font-semibold text-slate-700">{student.phone || '—'}</span>
                          <span className="text-[10px] text-slate-400 truncate max-w-[180px]">{student.address || '—'}</span>
                        </div>
                      </td>
                      <td className="py-3 px-3">
                        <span className={`px-2 py-0.5 rounded-full text-[9px] font-black uppercase ${student.tuitionPaid ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'}`}>
                          {student.tuitionPaid ? 'ÖDENDİ' : 'GECİKTİ'}
                        </span>
                      </td>
                      <td className="py-3 px-3 text-right">
                        <button 
                          onClick={() => handleToggleTuition(student)}
                          className="px-2.5 py-1 bg-slate-100 hover:bg-[#00236f] hover:text-white rounded font-bold text-[9px] transition-all"
                        >
                          {student.tuitionPaid ? 'Harç Gecikmesi Ver' : 'Ödeme Onayla'}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Account Suspensions & Password Resets */}
          <div className="bg-white border border-slate-200/60 rounded-2xl p-5 shadow-sm">
            <h3 className="text-sm font-black text-slate-800 mb-3 flex items-center gap-2">
              <span className="material-symbols-outlined text-blue-900">manage_accounts</span>
              Hesap Yönetimi &amp; Güvenlik
            </h3>
            <p className="text-[11px] text-slate-500 mb-4">
              Akademik ve idari personelin sisteme giriş yetkisini dondurabilir (Suspend) veya şifrelerini sıfırlayabilirsiniz.
            </p>
            <div className="overflow-x-auto">
              <table className="min-w-full text-left text-xs text-slate-600">
                <thead>
                  <tr className="bg-slate-50 text-[10px] font-bold text-slate-400 uppercase tracking-wider border-b border-slate-100">
                    <th className="py-2.5 px-3">Kullanıcı</th>
                    <th className="py-2.5 px-3">Rol</th>
                    <th className="py-2.5 px-3">Durum</th>
                    <th className="py-2.5 px-3 text-right">İşlem</th>
                  </tr>
                </thead>
                <tbody>
                  {users.filter(u => u.role !== 'dean' && u.role !== 'admin').map((user, idx) => (
                    <tr className="border-b border-slate-50 hover:bg-slate-50 transition-all" key={user.id || idx}>
                      <td className="py-3 px-3 font-bold text-slate-800">{user.name}</td>
                      <td className="py-3 px-3 capitalize">{user.role === 'teacher' ? 'Eğitmen' : 'Öğrenci'}</td>
                      <td className="py-3 px-3">
                        <span className={`px-2 py-0.5 rounded-full text-[9px] font-black uppercase ${user.status === 'suspended' ? 'bg-red-100 text-red-700' : 'bg-blue-100 text-blue-700'}`}>
                          {user.status === 'suspended' ? 'DONDURULDU' : 'AKTİF'}
                        </span>
                      </td>
                      <td className="py-3 px-3 text-right flex gap-1.5 justify-end">
                        <button 
                          onClick={() => handleToggleUserStatus(user)}
                          className={`px-2 py-1 rounded font-bold text-[9px] text-white transition-all ${user.status === 'suspended' ? 'bg-emerald-600 hover:bg-emerald-700' : 'bg-amber-600 hover:bg-amber-700'}`}
                        >
                          {user.status === 'suspended' ? 'Aktifleştir' : 'Dondur (Suspend)'}
                        </button>
                        <button 
                          onClick={() => handlePasswordReset(user)}
                          className="px-2 py-1 bg-slate-200 hover:bg-slate-300 rounded font-bold text-[9px] transition-all"
                        >
                          Şifre Sıfırla
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

        </div>

        {/* Right Column: Emergency Alert Banner Trigger & Section Manager */}
        <div className="flex flex-col gap-6">
          
          {/* Emergency Alert Marquee Panel */}
          <div className="bg-white border border-slate-200/60 rounded-2xl p-5 shadow-sm">
            <h3 className="text-sm font-black text-slate-800 mb-3 flex items-center gap-2">
              <span className="material-symbols-outlined text-red-600">campaign</span>
              Acil Durum FAB Banner Duyurusu
            </h3>
            <p className="text-[11px] text-slate-500 mb-4">
              Kritik idari veya hava durumu duyurularını tüm sisteme anlık kırmızı kayan şerit (marquee) olarak yansıtın.
            </p>
            <div className="flex flex-col gap-3">
              <textarea 
                className="w-full border border-slate-200 rounded-xl p-3 text-xs text-slate-700 focus:outline-none focus:ring-1 focus:ring-red-600"
                rows="3"
                value={alertText}
                onChange={(e) => setAlertText(e.target.value)}
                placeholder="Duyuru mesajını buraya yazın..."
              />
              <button 
                onClick={handleToggleEmergencyAlert}
                className={`w-full py-2.5 rounded-xl font-bold text-xs text-white transition-all flex items-center justify-center gap-1.5 ${termStatus.emergencyAlertActive ? 'bg-red-600 hover:bg-red-700' : 'bg-slate-700 hover:bg-slate-800'}`}
              >
                <span className="material-symbols-outlined text-[16px]">
                  {termStatus.emergencyAlertActive ? 'cancel' : 'notification_important'}
                </span>
                {termStatus.emergencyAlertActive ? 'Acil Durumu Kapat' : 'Acil Durumu Yayına Al'}
              </button>
            </div>
          </div>

          {/* Section Branch Creator */}
          <div className="bg-white border border-slate-200/60 rounded-2xl p-5 shadow-sm">
            <h3 className="text-sm font-black text-slate-800 mb-3 flex items-center gap-2">
              <span className="material-symbols-outlined text-blue-900">add_card</span>
              Yeni Şube / Sınıf Açılışı
            </h3>
            <p className="text-[11px] text-slate-500 mb-4">
              Mevcut derslerin altına yeni şubeler (örn: A, B, C şubesi) oluşturarak kontenjan ve hoca atayın.
            </p>
            <div className="flex flex-col gap-3.5">
              <div className="flex flex-col gap-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase">Ders Seçimi</label>
                <select className="border border-slate-200 rounded-lg p-2 text-xs" value={newSecCourse} onChange={(e) => setNewSecCourse(e.target.value)}>
                  {courses.map(c => (
                    <option key={c.id} value={c.id}>{c.code} - {c.name}</option>
                  ))}
                </select>
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase">Şube Adı</label>
                <input 
                  type="text" 
                  className="border border-slate-200 rounded-lg p-2 text-xs"
                  placeholder="Örn: Sınıf-A veya Şube-B"
                  value={newSecName}
                  onChange={(e) => setNewSecName(e.target.value)}
                />
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase">Kontenjan</label>
                <input 
                  type="number" 
                  className="border border-slate-200 rounded-lg p-2 text-xs"
                  value={newSecCapacity}
                  onChange={(e) => setNewSecCapacity(Number(e.target.value))}
                />
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase">Eğitmen Atama</label>
                <select className="border border-slate-200 rounded-lg p-2 text-xs" value={newSecTeacher} onChange={(e) => setNewSecTeacher(e.target.value)}>
                  {teachersList.map((teacher, idx) => (
                    <option key={teacher.id || idx} value={teacher.name}>{teacher.name}</option>
                  ))}
                </select>
              </div>

              <button 
                onClick={handleCreateSection}
                className="w-full py-2.5 bg-[#00236f] hover:bg-blue-900 text-white font-bold text-xs rounded-xl transition-all"
              >
                Yeni Şube Oluştur
              </button>
            </div>
          </div>
        </div>
      </div>
      )}
    </section>
  );
}
