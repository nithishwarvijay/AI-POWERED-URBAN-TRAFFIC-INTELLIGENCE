import { useState, useEffect, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { X, CheckCircle, AlertCircle, AlertTriangle, Info } from 'lucide-react';

const toastIcons = {
  success: CheckCircle,
  error: AlertCircle,
  warning: AlertTriangle,
  info: Info,
};

const Toast = ({ toasts, onDismiss }) => {
  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-2 items-end" role="region" aria-live="polite">
      {toasts.map((toast) => {
        const Icon = toastIcons[toast.type] || Info;
        const bgColors = {
          success: 'bg-success-600',
          error: 'bg-danger-600',
          warning: 'bg-warning-600',
          info: 'bg-primary-600',
        };

        return (
          <div
            key={toast.id}
            className={`toast ${bgColors[toast.type]} text-white animate-slide-in flex items-center gap-3 px-4 py-3 rounded-xl shadow-elevated min-w-[300px] max-w-md`}
            role="alert"
          >
            <Icon size={20} className="shrink-0" />
            <div className="flex-1">
              {toast.title && <p className="font-semibold">{toast.title}</p>}
              {toast.message && <p className="text-sm opacity-90">{toast.message}</p>}
            </div>
            <button
              onClick={() => onDismiss(toast.id)}
              className="p-1 rounded-lg hover:bg-white/20 transition-colors"
              aria-label="Dismiss"
            >
              <X size={16} />
            </button>
          </div>
        );
      })}
    </div>
  );
};

export const useToast = () => {
  const [toasts, setToasts] = useState([]);

  const addToast = useCallback((toast) => {
    const id = Date.now().toString();
    const newToast = { id, ...toast };
    setToasts((prev) => [...prev, newToast]);

    if (toast.duration !== 0) {
      setTimeout(() => {
        setToasts((prev) => prev.filter((t) => t.id !== id));
      }, toast.duration || 5000);
    }
    return id;
  }, []);

  const dismiss = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const success = useCallback((title, message, options) => addToast({ type: 'success', title, message, ...options }), [addToast]);
  const error = useCallback((title, message, options) => addToast({ type: 'error', title, message, ...options }), [addToast]);
  const warning = useCallback((title, message, options) => addToast({ type: 'warning', title, message, ...options }), [addToast]);
  const info = useCallback((title, message, options) => addToast({ type: 'info', title, message, ...options }), [addToast]);

  return { toasts, addToast, dismiss, success, error, warning, info };
};

export const ToastProvider = ({ children }) => {
  const toast = useToast();
  return (
    <>
      {children}
      <Toast toasts={toast.toasts} onDismiss={toast.dismiss} />
    </>
  );
};

export default Toast;