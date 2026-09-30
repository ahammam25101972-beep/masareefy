import React from 'react';
import { useApp } from '../../context/AppContext';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';

export const ToastContainer: React.FC = () => {
  const { toasts, dismissToast } = useApp();

  if (toasts.length === 0) return null;

  return (
    <div className="fixed bottom-20 md:bottom-6 left-4 z-50 flex flex-col gap-2 max-w-sm w-full pointer-events-none">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className={`pointer-events-auto flex items-center justify-between p-3.5 rounded-xl shadow-lg border backdrop-blur-md transition-all duration-300 transform translate-y-0 text-sm ${
            toast.type === 'success'
              ? 'bg-emerald-950/90 border-emerald-700 text-emerald-100 shadow-emerald-950/30'
              : toast.type === 'error'
              ? 'bg-rose-950/90 border-rose-700 text-rose-100 shadow-rose-950/30'
              : 'bg-slate-900/90 border-slate-700 text-slate-100 shadow-slate-950/30'
          }`}
        >
          <div className="flex items-center gap-2.5">
            {toast.type === 'success' && <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />}
            {toast.type === 'error' && <AlertCircle className="w-5 h-5 text-rose-400 shrink-0" />}
            {toast.type === 'info' && <Info className="w-5 h-5 text-sky-400 shrink-0" />}
            <span className="font-medium">{toast.message}</span>
          </div>
          <button
            onClick={() => dismissToast(toast.id)}
            className="p-1 text-slate-400 hover:text-white rounded-lg transition-colors mr-2"
            aria-label="إغلاق"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      ))}
    </div>
  );
};
