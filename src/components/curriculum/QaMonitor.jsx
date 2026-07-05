import React from 'react';

export default function QaMonitor({
  forumQuestions = [],
  totalQuestions,
  unansweredQuestionsCount,
  reportedQuestionsCount,
  avgResponseTime,
  handleAlertInstructor,
  handleResolveReport,
  handleDeleteQuestion
}) {
  return (
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
                            className="px-2.5 py-1 bg-amber-50 hover:bg-[#00236f] hover:text-white rounded border border-amber-200 text-amber-700 font-bold text-[10px] flex items-center gap-0.5 transition-all border-none cursor-pointer"
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
                              className="px-2.5 py-1 bg-emerald-50 hover:bg-emerald-600 hover:text-white rounded border border-emerald-200 text-emerald-700 font-bold text-[10px] transition-all border-none cursor-pointer"
                              title="Şikayeti İptal Et / Güvenli İşaretle"
                            >
                              Raporu Kaldır
                            </button>
                            <button
                              onClick={() => handleDeleteQuestion(q.id)}
                              className="px-2.5 py-1 bg-rose-50 hover:bg-rose-600 hover:text-white rounded border border-rose-200 text-rose-700 font-bold text-[10px] transition-all border-none cursor-pointer"
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
  );
}
