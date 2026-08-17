import React from 'react';
import { usePortfolio } from '../../context/PortfolioContext';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';

export const ToastContainer: React.FC = () => {
  const { toasts, removeToast } = usePortfolio();

  if (toasts.length === 0) return null;

  return (
    <div
      aria-live="polite"
      aria-atomic="true"
      className="fixed bottom-6 right-6 z-50 flex flex-col gap-2 max-w-md w-full px-4 pointer-events-none"
      id="toast-container"
    >
      {toasts.map((toast) => {
        const isSuccess = toast.type === 'success';
        const isError = toast.type === 'error';

        return (
          <div
            key={toast.id}
            id={`toast-${toast.id}`}
            role="alert"
            className="pointer-events-auto flex items-center justify-between gap-3 p-4 rounded-xl shadow-lg border transition-all transform translate-y-0"
            style={{
              backgroundColor: 'var(--theme-surface)',
              borderColor: isSuccess
                ? 'var(--theme-success)'
                : isError
                ? 'var(--theme-error)'
                : 'var(--theme-border)',
              color: 'var(--theme-text-primary)',
            }}
          >
            <div className="flex items-center gap-3">
              {isSuccess && <CheckCircle2 className="w-5 h-5 shrink-0 text-emerald-600" />}
              {isError && <AlertCircle className="w-5 h-5 shrink-0 text-red-600" />}
              {!isSuccess && !isError && <Info className="w-5 h-5 shrink-0 text-blue-600" />}
              <span className="text-sm font-medium leading-snug">{toast.message}</span>
            </div>
            <button
              onClick={() => removeToast(toast.id)}
              aria-label="Fechar notificação"
              className="p-1 rounded-lg hover:opacity-75 focus:outline-none"
            >
              <X className="w-4 h-4 opacity-70" />
            </button>
          </div>
        );
      })}
    </div>
  );
};
