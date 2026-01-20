import { X, LogIn, UserPlus } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

function LoginRequiredModal({ onClose }) {
  const navigate = useNavigate();

  const handleProfessionalLogin = () => {
    navigate('/professional-login');
  };

  const handleClientLogin = () => {
    navigate('/client-login');
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 animate-fadeIn p-4">
      <div className="bg-white rounded-3xl p-8 max-w-md w-full animate-scaleIn relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
        >
          <X className="w-6 h-6" />
        </button>

        <div className="text-center mb-6">
          <div className="w-16 h-16 bg-purple-100 rounded-full mx-auto mb-4 flex items-center justify-center">
            <LogIn className="w-8 h-8 text-purple-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">
            Iniciá sesión para continuar
          </h2>
          <p className="text-gray-600">
            Necesitás estar logueado para buscar profesionales
          </p>
        </div>

        <div className="space-y-3">
          <button
            onClick={handleClientLogin}
            className="w-full bg-gradient-to-r from-green-500 to-teal-600 text-white px-6 py-3 rounded-2xl font-bold hover:scale-105 transition-all flex items-center justify-center gap-2"
          >
            <span className="text-xl">⭐</span>
            Entrar como Cliente
          </button>

          <button
            onClick={handleProfessionalLogin}
            className="w-full bg-gradient-to-r from-yellow-400 to-orange-500 text-white px-6 py-3 rounded-2xl font-bold hover:scale-105 transition-all flex items-center justify-center gap-2"
          >
            <UserPlus className="w-5 h-5" />
            Entrar como Profesional
          </button>

          <button
            onClick={onClose}
            className="w-full bg-gray-200 text-gray-700 px-6 py-3 rounded-2xl font-semibold hover:bg-gray-300 transition-all"
          >
            Cancelar
          </button>
        </div>
      </div>
    </div>
  );
}

export default LoginRequiredModal;