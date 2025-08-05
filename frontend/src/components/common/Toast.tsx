import { useEffect, useState } from 'react';
import { X, CheckCircle, XCircle, AlertCircle, Info } from 'lucide-react';
import { createPortal } from 'react-dom';

export type ToastType = 'success' | 'error' | 'warning' | 'info';
export type ToastPosition = 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left' | 'top-center' | 'bottom-center';

export interface ToastMessage {
  id: string;
  type: ToastType;
  title: string;
  message?: string;
  duration?: number;
  position?: ToastPosition;
  action?: {
    label: string;
    onClick: () => void;
  };
}

interface ToastProps {
  toast: ToastMessage;
  onClose: (id: string) => void;
}

const Toast = ({ toast, onClose }: ToastProps) => {
  const [isVisible, setIsVisible] = useState(false);
  const [isExiting, setIsExiting] = useState(false);

  useEffect(() => {
    // Trigger enter animation
    const timer = setTimeout(() => setIsVisible(true), 10);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (toast.duration && toast.duration > 0) {
      const timer = setTimeout(() => {
        handleClose();
      }, toast.duration);
      return () => clearTimeout(timer);
    }
  }, [toast.duration]);

  const handleClose = () => {
    setIsExiting(true);
    setTimeout(() => {
      onClose(toast.id);
    }, 300);
  };

  const icons = {
    success: <CheckCircle className="w-5 h-5" />,
    error: <XCircle className="w-5 h-5" />,
    warning: <AlertCircle className="w-5 h-5" />,
    info: <Info className="w-5 h-5" />,
  };

  const colors = {
    success: 'bg-green-500 text-white',
    error: 'bg-red-500 text-white',
    warning: 'bg-yellow-500 text-white',
    info: 'bg-blue-500 text-white',
  };

  return (
    <div
      className={`
        flex items-start gap-3 min-w-[300px] max-w-[400px] p-4 rounded-lg shadow-lg
        ${colors[toast.type]}
        transition-all duration-300 transform
        ${isVisible && !isExiting ? 'translate-y-0 opacity-100' : 'translate-y-2 opacity-0'}
      `}
    >
      {/* Icon */}
      <div className="flex-shrink-0">
        {icons[toast.type]}
      </div>

      {/* Content */}
      <div className="flex-1">
        <h4 className="font-medium">{toast.title}</h4>
        {toast.message && (
          <p className="mt-1 text-sm opacity-90">{toast.message}</p>
        )}
        {toast.action && (
          <button
            onClick={toast.action.onClick}
            className="mt-2 text-sm font-medium underline hover:no-underline"
          >
            {toast.action.label}
          </button>
        )}
      </div>

      {/* Close Button */}
      <button
        onClick={handleClose}
        className="flex-shrink-0 p-1 rounded hover:bg-white/20 transition-colors"
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  );
};

interface ToastContainerProps {
  toasts: ToastMessage[];
  onClose: (id: string) => void;
}

export const ToastContainer = ({ toasts, onClose }: ToastContainerProps) => {
  // Group toasts by position
  const groupedToasts = toasts.reduce((acc, toast) => {
    const position = toast.position || 'top-right';
    if (!acc[position]) {
      acc[position] = [];
    }
    acc[position].push(toast);
    return acc;
  }, {} as Record<ToastPosition, ToastMessage[]>);

  const positionClasses: Record<ToastPosition, string> = {
    'top-right': 'top-4 right-4',
    'top-left': 'top-4 left-4',
    'bottom-right': 'bottom-4 right-4',
    'bottom-left': 'bottom-4 left-4',
    'top-center': 'top-4 left-1/2 -translate-x-1/2',
    'bottom-center': 'bottom-4 left-1/2 -translate-x-1/2',
  };

  return createPortal(
    <>
      {Object.entries(groupedToasts).map(([position, positionToasts]) => (
        <div
          key={position}
          className={`fixed z-50 ${positionClasses[position as ToastPosition]} space-y-2`}
        >
          {positionToasts.map((toast) => (
            <Toast key={toast.id} toast={toast} onClose={onClose} />
          ))}
        </div>
      ))}
    </>,
    document.body
  );
};

// Toast Hook
export const useToast = () => {
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const showToast = (options: Omit<ToastMessage, 'id'>) => {
    const id = Date.now().toString();
    const toast: ToastMessage = {
      id,
      duration: 5000,
      position: 'top-right',
      ...options,
    };
    setToasts((prev) => [...prev, toast]);
  };

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  };

  const success = (title: string, message?: string) => {
    showToast({ type: 'success', title, message });
  };

  const error = (title: string, message?: string) => {
    showToast({ type: 'error', title, message });
  };

  const warning = (title: string, message?: string) => {
    showToast({ type: 'warning', title, message });
  };

  const info = (title: string, message?: string) => {
    showToast({ type: 'info', title, message });
  };

  return {
    toasts,
    showToast,
    removeToast,
    success,
    error,
    warning,
    info,
  };
};

export default Toast;