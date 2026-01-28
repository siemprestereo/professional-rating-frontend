import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Star, Home, ArrowLeft, Trash2 } from 'lucide-react';
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
    if (selectedIds.length < 2) return;
    const selected = professionals.filter(p => selectedIds.includes(p.professionalId));
    navigate('/compare-professionals', { state: { professionals: selected } });
  };

  const handleCardClick = (e, professionalId) => {
    // Si clickeó en el checkbox o botón, no navegar
    if (e.target.type === 'checkbox' || e.target.closest('button')) return;
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

  const canCompare = selectedIds.length >= 2;

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
          <h1 className="text-3xl roboto-light text-white mb-3">
            Profesionales Guardados
          </h1>
          <p className="text-white/90 text-sm mb-4">
            Seleccioná a los Profesionales para comparar su desempeño
          </p>

          {/* Botón Comparar (fijo en el header) */}
          <button
            onClick={handleCompare}
            disabled={!canCompare}
            className={`w-full font-bold py-4 px-6 rounded-xl transition-all flex items-center justify-center gap-2 ${
              canCompare
                ? 'bg-white text-purple-600 shadow-lg hover:scale-105'
                : 'bg-white/20 text-white/50 cursor-not-allowed'
            }`}
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 4 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
            {canCompare ? `Comparar (${selectedIds.length})` : 'Seleccioná al menos 2'}
          </button>
        </div>
      </div>

      {/* Contenido */}
      <div className="max-w-4xl mx-auto px-4 -mt-4 pb-8">
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
                className="bg-white rounded-2xl shadow-lg p-4 cursor-pointer hover:shadow-xl transition-all"
              >
                <div className="flex items-start gap-4">
                  {/* Checkbox */}
                  <div className="flex-shrink-0 pt-1">
                    <input
                      type="checkbox"
                      checked={selectedIds.includes(prof.professionalId)}
                      onChange={() => toggleSelection(prof.professionalId)}
                      className="w-5 h-5 text-purple-600 border-gray-300 rounded focus:ring-purple-500 cursor-pointer"
                      onClick={(e) => e.stopPropagation()}
                    />
                  </div>

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

                    {/* Botón eliminar (con cuerpo) */}
                    <button
                      onClick={(e) => handleRemoveFavorite(e, prof.professionalId)}
                      className="mt-3 bg-red-100 text-red-600 px-4 py-2 rounded-xl font-semibold hover:bg-red-200 transition-all text-sm flex items-center gap-2"
                    >
                      <Trash2 className="w-4 h-4" />
                      Eliminar
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Botón Home flotante */}
      <div className="fixed bottom-4 left-0 right-0 flex justify-center z-50 animate-slideUp">
        <button 
          onClick={() => navigate(-1)}
          className="w-14 h-14 bg-gradient-to-r from-green-500 to-teal-600 hover:from-green-600 hover:to-teal-700 rounded-full flex items-center justify-center transition-all hover:scale-110 shadow-2xl border-4 border-white"
          aria-label="Volver atrás"
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