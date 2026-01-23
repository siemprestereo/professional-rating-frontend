import { useEffect } from 'react';
import { X, AlertCircle, CheckCircle, Info, XCircle } from 'lucide-react';

function Toast({ message, type = 'info', onClose, duration = 5000 }) {
  useEffect(() => {
    if (duration > 0) {
      const timer = setTimeout(() => {
        onClose();
      }, duration);
      return () => clearTimeout(timer);
    }
  }, [duration, onClose]);

  const types = {
    success: {
      bg: 'bg-green-500',
      icon: <CheckCircle className="w-6 h-6" />,
    },
    error: {
      bg: 'bg-red-500',
      icon: <XCircle className="w-6 h-6" />,
    },
    warning: {
      bg: 'bg-yellow-500',
      icon: <AlertCircle className="w-6 h-6" />,
    },
    info: {
      bg: 'bg-blue-500',
      icon: <Info className="w-6 h-6" />,
    },
  };

  const { bg, icon } = types[type] || types.info;

  return (
    <div className="fixed top-4 right-4 z-50 animate-slideInRight">
      <div className={`${bg} text-white px-6 py-4 rounded-2xl shadow-2xl flex items-center gap-3 min-w-[300px] max-w-md`}>
        {icon}
        <p className="flex-1 font-medium text-base">{message}</p>
        <button
          onClick={onClose}
          className="hover:bg-white/20 rounded-full p-1 transition-all"
        >
          <X className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
}

export default Toast;