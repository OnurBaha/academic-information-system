import React from 'react';

/**
 * Reusable premium Confirmation Modal
 * @param {boolean} isOpen - controls visibility
 * @param {function} onClose - cancel/close function
 * @param {function} onConfirm - action executing function
 * @param {string} title - modal title
 * @param {string} message - description or message
 * @param {string} confirmType - 'danger' (red) or 'primary' (blue)
 */
export default function ConfirmationModal({ isOpen, onClose, onConfirm, title, message, confirmType = 'danger' }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[9999] flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl w-full max-w-sm overflow-hidden shadow-2xl border border-solid border-slate-100 p-6 flex flex-col gap-4 animate-fade-in">
        <div className="flex items-start gap-3.5">
          <div className={`w-10 h-10 rounded-2xl flex items-center justify-center shrink-0 ${confirmType === 'danger' ? 'bg-rose-50 text-rose-600' : 'bg-blue-50 text-blue-900'}`}>
            <span className="material-symbols-outlined text-[20px]">{confirmType === 'danger' ? 'warning' : 'help_outline'}</span>
          </div>
          <div className="min-w-0 flex-1">
            <h4 className="font-black text-slate-800 text-sm leading-snug">{title || 'Onay Gerekiyor'}</h4>
            <p className="text-xs text-slate-500 mt-1.5 leading-relaxed">{message || 'Bu işlemi gerçekleştirmek istediğinize emin misiniz?'}</p>
          </div>
        </div>
        <div className="flex justify-end gap-2 mt-2">
          <button 
            type="button"
            onClick={onClose}
            className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 rounded-xl text-xs font-bold text-slate-650 cursor-pointer transition-all border-none"
          >
            İptal
          </button>
          <button 
            type="button"
            onClick={() => {
              onConfirm();
              onClose();
            }}
            className={`px-4 py-2.5 text-white rounded-xl text-xs font-bold cursor-pointer transition-all border-none ${confirmType === 'danger' ? 'bg-rose-600 hover:bg-rose-700' : 'bg-[#00236f] hover:bg-blue-900'}`}
          >
            Onayla
          </button>
        </div>
      </div>
    </div>
  );
}
