import { XCircle, X } from 'lucide-react';

function ErrorModal({ 
  title, 
  message, 
  onClose, 
  onAction,
  actionText = 'Entendido', 
  showCancel = false 
}) {
  const handleAction = () => {
    if (onAction) {
      onAction(); // Ejecutar la acción personalizada
    } else {
      onClose(); // Si no hay acción, simplemente cerrar
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 animate-fadeIn">
      <div className="bg-white rounded-3xl p-8 max-w-md w-full mx-4 animate-scaleIn">
        <div className="flex justify-between items-start mb-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
              <XCircle className="w-6 h-6 text-red-500" />
            </div>
            <h2 className="text-2xl roboto-light text-gray-800">{title}</h2>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>
        
        <p className="text-gray-600 mb-6 text-base">{message}</p>
        
        <div className={`flex gap-3 ${showCancel ? '' : 'justify-end'}`}>
          {showCancel && (
            <button
              onClick={onClose}
              className="flex-1 bg-gray-200 text-gray-800 font-bold py-3 rounded-2xl hover:bg-gray-300 transition-all text-base"
            >
              Cancelar
            </button>
          )}
          <button
            onClick={handleAction}
            className={`${showCancel ? 'flex-1' : 'w-full'} bg-red-500 text-white font-bold py-3 rounded-2xl hover:bg-red-600 transition-all text-base`}
          >
            {actionText}
          </button>
        </div>
      </div>
    </div>
  );
}

export default ErrorModal;