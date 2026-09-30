import React from 'react';
import { AlertTriangle } from 'lucide-react';

interface ConfirmModalProps {
  isOpen: boolean;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  danger?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export const ConfirmModal: React.FC<ConfirmModalProps> = ({
  isOpen,
  title,
  message,
  confirmText = 'تأكيد الحذف',
  cancelText = 'إلغاء',
  danger = true,
  onConfirm,
  onCancel,
}) => {
  if (!isOpen) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in"
    >
      <div className="bg-white rounded-2xl w-full max-w-md p-6 shadow-2xl border border-slate-100 flex flex-col gap-4 text-right">
        <div className="flex items-center gap-3">
          <div className={`p-3 rounded-full ${danger ? 'bg-rose-100 text-rose-600' : 'bg-amber-100 text-amber-600'}`}>
            <AlertTriangle className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-slate-900">{title}</h3>
            <p className="text-sm text-slate-500 mt-1">{message}</p>
          </div>
        </div>

        <div className="flex items-center justify-end gap-3 mt-3 pt-3 border-t border-slate-100">
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 text-sm font-semibold text-slate-600 hover:text-slate-800 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
          >
            {cancelText}
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className={`px-5 py-2 text-sm font-bold text-white rounded-xl shadow-sm transition-all cursor-pointer ${
              danger
                ? 'bg-rose-600 hover:bg-rose-700 active:scale-98'
                : 'bg-emerald-600 hover:bg-emerald-700 active:scale-98'
            }`}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
};
