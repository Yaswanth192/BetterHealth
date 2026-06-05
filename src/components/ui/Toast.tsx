import { CheckCircle, XCircle, AlertCircle, Info, X } from 'lucide-react';
import { useEffect, useState } from 'react';

export type ToastType = 'success' | 'error' | 'warning' | 'info';

interface ToastProps {
  type: ToastType;
  message: string;
  onClose: () => void;
  duration?: number;
}

const config = {
  success: { icon: CheckCircle, bg: 'bg-emerald-50', border: 'border-emerald-200', text: 'text-emerald-700', iconColor: 'text-emerald-500' },
  error: { icon: XCircle, bg: 'bg-red-50', border: 'border-red-200', text: 'text-red-700', iconColor: 'text-red-500' },
  warning: { icon: AlertCircle, bg: 'bg-amber-50', border: 'border-amber-200', text: 'text-amber-700', iconColor: 'text-amber-500' },
  info: { icon: Info, bg: 'bg-primary-50', border: 'border-primary-200', text: 'text-primary-700', iconColor: 'text-primary-500' },
};

export function Toast({ type, message, onClose, duration = 4000 }: ToastProps) {
  const [visible, setVisible] = useState(true);
  const { icon: Icon, bg, border, text, iconColor } = config[type];

  useEffect(() => {
    const timer = setTimeout(() => {
      setVisible(false);
      setTimeout(onClose, 300);
    }, duration);
    return () => clearTimeout(timer);
  }, [duration, onClose]);

  return (
    <div className={`flex items-start gap-3 px-4 py-3 rounded-xl border shadow-lg transition-all duration-300 ${bg} ${border} ${visible ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-2'}`}>
      <Icon className={`w-5 h-5 mt-0.5 flex-shrink-0 ${iconColor}`} />
      <p className={`text-sm font-medium flex-1 ${text}`}>{message}</p>
      <button onClick={() => { setVisible(false); setTimeout(onClose, 300); }} className={`p-0.5 hover:opacity-60 transition-opacity ${text}`}>
        <X className="w-4 h-4" />
      </button>
    </div>
  );
}

interface ToastContainerProps {
  toasts: { id: string; type: ToastType; message: string }[];
  removeToast: (id: string) => void;
}

export function ToastContainer({ toasts, removeToast }: ToastContainerProps) {
  return (
    <div className="fixed top-4 right-4 z-[100] flex flex-col gap-2 w-full max-w-sm">
      {toasts.map((t) => (
        <Toast key={t.id} type={t.type} message={t.message} onClose={() => removeToast(t.id)} />
      ))}
    </div>
  );
}
