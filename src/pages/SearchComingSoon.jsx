import { useNavigate } from 'react-router-dom';

function SearchComingSoon() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center p-4 animate-fadeIn">
      <div className="bg-white rounded-3xl p-8 text-center max-w-sm w-full animate-scaleIn shadow-2xl">
        <div className="text-6xl mb-4">🔍</div>
        <h2 className="text-2xl font-bold text-gray-800 mb-3">
          Próximamente
        </h2>
        <p className="text-gray-500 text-base mb-6">
          Pronto podrás buscar profesionales de todos los rubros cerca tuyo.
        </p>
        <button
          onClick={() => navigate(-1)}
          className="w-full bg-gradient-to-r from-blue-500 to-purple-600 text-white font-bold py-3 rounded-2xl transition-all hover:scale-105 active:scale-95"
        >
          Volver
        </button>
      </div>
    </div>
  );
}

export default SearchComingSoon;
