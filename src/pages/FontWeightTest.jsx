import { Home } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

function FontWeightTest() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gray-50 animate-fadeIn pb-20">
      {/* Header sin navbar */}
      <div className="bg-gradient-to-br from-blue-500 to-purple-600 px-4 pt-8 pb-24">
        <div className="max-w-4xl mx-auto text-center">
          <div className="w-24 h-24 bg-white rounded-full mx-auto mb-4 flex items-center justify-center text-4xl font-bold text-purple-600 animate-scaleIn">
            P
          </div>
          <h1 className="text-3xl font-bold text-white mb-2 animate-slideUp">
            Prueba de UI
          </h1>
          <p className="text-white/90 text-lg animate-slideUp delay-100">
            Botón Home abajo centrado
          </p>
        </div>
      </div>

      {/* Contenido */}
      <div className="max-w-4xl mx-auto px-4 -mt-16">
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-4 animate-slideUp hover-lift">
          <h2 className="text-xl font-bold text-gray-800 mb-4">
            Contenido de prueba
          </h2>
          <p className="text-gray-600 mb-4">
            Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.
          </p>
          <p className="text-gray-600 mb-4">
            Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.
          </p>
          <p className="text-gray-600">
            Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur.
          </p>
        </div>

        <div className="bg-white rounded-2xl shadow-lg p-6 mb-4 animate-slideUp delay-100 hover-lift">
          <h2 className="text-xl font-bold text-gray-800 mb-4">
            Más contenido
          </h2>
          <p className="text-gray-600">
            Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.
          </p>
        </div>
      </div>

      {/* Botón Home flotante abajo centrado */}
      <div className="fixed bottom-6 left-0 right-0 flex justify-center z-50 animate-slideUp">
        <button 
          onClick={() => navigate('/professional-dashboard')}
          className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 rounded-full flex items-center justify-center transition-all hover:scale-110 shadow-2xl border-4 border-white"
          aria-label="Volver al inicio"
        >
          <Home className="w-8 h-8 text-white" />
        </button>
      </div>
    </div>
  );
}

export default FontWeightTest;