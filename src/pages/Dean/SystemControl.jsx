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
  const [newSecCourse, setNewSecCourse] = useState('TAR202');
  const [newSecName, setNewSecName] = useState('React-Sınıfı-A');
  const [newSecCapacity, setNewSecCapacity] = useState(30);
  const [newSecTeacher, setNewSecTeacher] = useState('Dr. Elif Soylu');

  // Emergency Alert input states
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

      {/* Main Bento Layout */}
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
                  <option value="TAR202">TAR202 - Osmanlı Müesseseleri</option>
                  <option value="TIP101">TIP101 - Temel Anatomi</option>
                  <option value="EDB301">EDB301 - Klasik Edebiyat</option>
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
    </section>
  );
}
