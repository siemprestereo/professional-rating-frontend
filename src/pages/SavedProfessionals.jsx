import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Star, Home, ArrowLeft } from 'lucide-react';
import LoadingScreen from '../components/LoadingScreen';
import Toast from '../components/Toast';

function SavedProfessionals() {
  const navigate = useNavigate();
  const backendUrl = 'https://professional-rating-backend-production.up.railway.app';
  
  const [professionals, setProfessionals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedIds, setSelectedIds] = useState([]);
  const [toast, setToast] = useState(null);

  useEffect(() => {
    loadFavorites();
  }, []);

  const loadFavorites = async () => {
    try {
      const token = localStorage.getItem('authToken');
      
      if (!token) {
        navigate('/client-login');
        return;
      }

      const response = await fetch(`${backendUrl}/api/clients/me/favorites`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (response.ok) {
        const data = await response.json();
        console.log('✅ Favoritos cargados:', data);
        setProfessionals(data);
      } else {
        throw new Error('Error al cargar favoritos');
      }
    } catch (error) {
      console.error('Error loading favorites:', error);
      setToast({ type: 'error', message: 'Error al cargar profesionales guardados' });
    } finally {
      setLoading(false);
    }
  };

  const toggleSelection = (professionalId) => {
    setSelectedIds(prev => 
      prev.includes(professionalId)
        ? prev.filter(id => id !== professionalId)
        : [...prev, professionalId]
    );
  };

  const handleCompare = () => {
    const selected = professionals.filter(p => selectedIds.includes(p.professionalId));
    navigate('/compare-professionals', { state: { professionals: selected } });
  };

  const handleCardClick = (e, professionalId) => {
    // Si clickeó en el checkbox, no navegar
    if (e.target.type === 'checkbox') return;
    navigate(`/public-cv/${professionalId}`);
  };

  const handleRemoveFavorite = async (e, professionalId) => {
    e.stopPropagation(); // Evitar que se abra el CV
    
    try {
      const token = localStorage.getItem('authToken');
      
      const response = await fetch(
        `${backendUrl}/api/clients/me/favorites/${professionalId}`,
        {
          method: 'DELETE',
          headers: { 'Authorization': `Bearer ${token}` }
        }
      );

      if (response.ok) {
        setToast({ type: 'success', message: 'Profesional eliminado de guardados' });
        setProfessionals(prev => prev.filter(p => p.professionalId !== professionalId));
        setSelectedIds(prev => prev.filter(id => id !== professionalId));
      } else {
        throw new Error('Error al eliminar');
      }
    } catch (error) {
      console.error('Error removing favorite:', error);
      setToast({ type: 'error', message: 'Error al eliminar profesional' });
    }
  };

  const renderStars = (score) => {
    return [...Array(5)].map((_, i) => (
      <Star
        key={i}
        className={`w-4 h-4 ${i < Math.round(score) ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'}`}
      />
    ));
  };

  const translateProfession = (type) => {
    const translations = {
      'WAITER': 'Mozo',
      'ELECTRICIAN': 'Electricista',
      'PAINTER': 'Pintor',
      'HAIRDRESSER': 'Peluquero',
      'PLUMBER': 'Plomero',
      'CARPENTER': 'Carpintero',
      'MECHANIC': 'Mecánico',
      'CHEF': 'Chef',
      'BARISTA': 'Barista',
      'BARTENDER': 'Bartender',
      'CLEANER': 'Personal de limpieza',
      'GARDENER': 'Jardinero',
      'DRIVER': 'Conductor',
      'SECURITY': 'Seguridad',
      'RECEPTIONIST': 'Recepcionista'
    };
    return translations[type] || type;
  };

  if (loading) {
    return <LoadingScreen message="Cargando profesionales..." />;
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-24">
      {/* Header */}
      <div className="bg-gradient-to-br from-blue-500 to-purple-600 px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <button
            onClick={() => navigate('/client-dashboard')}
            className="flex items-center text-white mb-4 hover:opacity-80 transition-opacity"
          >
            <ArrowLeft className="w-5 h-5 mr-2" />
            Volver
          </button>
          <h1 className="text-3xl roboto-light text-white mb-2">
            Profesionales Guardados
          </h1>
          <p className="text-white/90">
            {professionals.length} {professionals.length === 1 ? 'profesional' : 'profesionales'}
          </p>
        </div>
      </div>

      {/* Contenido */}
      <div className="max-w-4xl mx-auto px-4 -mt-8 pb-8">
        {professionals.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-lg p-8 text-center">
            <div className="w-16 h-16 bg-gray-100 rounded-full mx-auto mb-4 flex items-center justify-center">
              <svg className="w-8 h-8 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" clipRule="evenodd" />
              </svg>
            </div>
            <h2 className="text-xl roboto-light text-gray-800 mb-2">
              No hay profesionales guardados
            </h2>
            <p className="text-gray-600 mb-6">
              Guardá profesionales desde su CV para tenerlos siempre a mano
            </p>
            <button
              onClick={() => navigate('/search')}
              className="bg-purple-600 text-white px-6 py-3 rounded-xl font-semibold hover:bg-purple-700 transition-all"
            >
              Buscar profesionales
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            {professionals.map((prof) => (
              <div
                key={prof.professionalId}
                onClick={(e) => handleCardClick(e, prof.professionalId)}
                className="bg-white rounded-2xl shadow-lg p-4 cursor-pointer hover:shadow-xl transition-all relative"
              >
                {/* Checkbox */}
                <div className="absolute top-4 right-4 z-10">
                  <input
                    type="checkbox"
                    checked={selectedIds.includes(prof.professionalId)}
                    onChange={() => toggleSelection(prof.professionalId)}
                    className="w-5 h-5 text-purple-600 border-gray-300 rounded focus:ring-purple-500 cursor-pointer"
                    onClick={(e) => e.stopPropagation()}
                  />
                </div>

                <div className="flex items-center gap-4 pr-12">
                  {/* Avatar */}
                  <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center text-2xl font-bold text-purple-600 flex-shrink-0">
                    {prof.professionalName.charAt(0)}
                  </div>

                  {/* Info */}
                  <div className="flex-1">
                    <h3 className="text-lg font-bold text-gray-800">
                      {prof.professionalName}
                    </h3>
                    <p className="text-sm text-purple-600">
                      {translateProfession(prof.professionType)}
                    </p>
                    <div className="flex items-center gap-2 mt-1">
                      <div className="flex">
                        {renderStars(prof.reputationScore || 0)}
                      </div>
                      <span className="text-sm text-gray-600">
                        {(prof.reputationScore || 0).toFixed(1)} ({prof.totalRatings || 0})
                      </span>
                    </div>
                    {prof.notes && (
                      <p className="text-sm text-gray-500 mt-2 italic">
                        📝 {prof.notes}
                      </p>
                    )}
                  </div>
                </div>

                {/* Botón eliminar */}
                <button
                  onClick={(e) => handleRemoveFavorite(e, prof.professionalId)}
                  className="absolute bottom-4 right-4 text-red-500 hover:text-red-700 text-sm font-semibold"
                >
                  Eliminar
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Botón flotante Comparar */}
      {selectedIds.length > 0 && (
        <div className="fixed bottom-4 left-0 right-0 flex justify-center z-50 animate-slideUp">
          <button
            onClick={handleCompare}
            className="bg-gradient-to-r from-purple-500 to-pink-600 text-white font-bold py-4 px-8 rounded-full shadow-2xl hover:scale-110 transition-all flex items-center gap-2"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
            Comparar ({selectedIds.length})
          </button>
        </div>
      )}

      {/* Botón Home */}
      <div className="fixed bottom-20 right-4 z-40">
        <button
          onClick={() => navigate('/client-dashboard')}
          className="w-14 h-14 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 rounded-full flex items-center justify-center transition-all hover:scale-110 shadow-2xl border-4 border-white"
        >
          <Home className="w-7 h-7 text-white" />
        </button>
      </div>

      {/* Toast */}
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}
    </div>
  );
}

export default SavedProfessionals;