import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Star, Home, Loader2, X } from 'lucide-react';
import RatingDetailModal from '../components/RatingDetailModal';

function RatingsHistory() {
  const backendUrl = 'https://professional-rating-backend-production.up.railway.app';
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const workHistoryIdFilter = searchParams.get('workHistoryId');
  
  const [ratings, setRatings] = useState([]);
  const [filteredRatings, setFilteredRatings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedRating, setSelectedRating] = useState(null);
  const [filterInfo, setFilterInfo] = useState(null);

  useEffect(() => {
    loadRatings();
  }, []);

  useEffect(() => {
    applyFilter();
  }, [ratings, workHistoryIdFilter]);

  const loadRatings = async () => {
    const token = localStorage.getItem('authToken');
    if (!token) {
      navigate('/professional-login');
      return;
    }

    try {
      const professional = JSON.parse(localStorage.getItem('professional'));
      const response = await fetch(`${backendUrl}/api/ratings/professional/${professional.id}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (response.ok) {
        const data = await response.json();
        console.log('✅ Ratings cargados:', data);
        setRatings(data);
      }
    } catch (error) {
      console.error('Error loading ratings:', error);
    } finally {
      setLoading(false);
    }
  };

  const applyFilter = () => {
    if (!workHistoryIdFilter) {
      setFilteredRatings(ratings);
      setFilterInfo(null);
      return;
    }

    const filtered = ratings.filter(r => 
      r.workHistoryId === parseInt(workHistoryIdFilter)
    );

    setFilteredRatings(filtered);

    // Obtener info del trabajo para mostrar en el header
    if (filtered.length > 0) {
      const firstRating = filtered[0];
      setFilterInfo({
        position: firstRating.workplacePosition,
        businessName: firstRating.businessName
      });
    } else {
      setFilterInfo({ position: 'Trabajo', businessName: 'Sin especificar' });
    }

    console.log('🔍 Filtrado aplicado:', {
      workHistoryId: workHistoryIdFilter,
      total: ratings.length,
      filtered: filtered.length
    });
  };

  const clearFilter = () => {
    navigate('/ratings-history');
  };

  const renderStars = (score) => {
    return [...Array(5)].map((_, i) => (
      <Star
        key={i}
        className={`w-4 h-4 ${i < score ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'}`}
      />
    ));
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
        <Loader2 className="w-16 h-16 text-white animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-24">
      {/* Header */}
      <div className="bg-gradient-to-br from-blue-500 to-purple-600 px-4 py-8">
        {filterInfo ? (
          <>
            <div className="flex items-center justify-between mb-2">
              <h1 className="text-white text-xl font-bold">
                Calificaciones de:
              </h1>
              <button
                onClick={clearFilter}
                className="bg-white/20 hover:bg-white/30 text-white p-2 rounded-full transition-all"
                aria-label="Cerrar filtro"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <p className="text-white text-lg font-semibold mb-1">
              {filterInfo.position}
            </p>
            <p className="text-white/90 text-base mb-3">
              {filterInfo.businessName}
            </p>
            <p className="text-white/80 text-sm">
              {filteredRatings.length} {filteredRatings.length === 1 ? 'calificación' : 'calificaciones'}
            </p>
            <button
              onClick={clearFilter}
              className="mt-3 text-white/90 text-sm underline hover:text-white"
            >
              Ver todas las calificaciones
            </button>
          </>
        ) : (
          <>
            <h1 className="text-white text-2xl font-bold">
              Historial de Calificaciones
            </h1>
            <p className="text-white/80 text-sm mt-1">
              {filteredRatings.length} {filteredRatings.length === 1 ? 'calificación' : 'calificaciones'}
            </p>
          </>
        )}
      </div>

      {/* Lista de ratings */}
      <div className="px-4 py-6">
        {filteredRatings.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-lg p-8 text-center">
            {workHistoryIdFilter ? (
              <>
                <p className="text-gray-500 mb-4">
                  No hay calificaciones para este trabajo aún
                </p>
                <button
                  onClick={clearFilter}
                  className="bg-purple-600 text-white px-6 py-2 rounded-full hover:bg-purple-700 transition-all"
                >
                  Ver todas las calificaciones
                </button>
              </>
            ) : (
              <p className="text-gray-500">Aún no tenés calificaciones</p>
            )}
          </div>
        ) : (
          <div className="space-y-3">
            {filteredRatings.map((rating) => (
              <div
                key={rating.id}
                onClick={() => setSelectedRating(rating)}
                className="bg-white rounded-2xl shadow-lg p-4 hover-lift cursor-pointer"
              >
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center gap-2">
                    {renderStars(rating.score)}
                  </div>
                  <span className="text-xs text-gray-500">
                    {new Date(rating.createdAt).toLocaleDateString('es-AR')}
                  </span>
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-semibold text-gray-800">
                      {rating.clientName?.trim() || 'Anónimo'}
                    </p>
                    {!workHistoryIdFilter && (
                      <p className="text-xs text-gray-500">
                        {rating.businessName} • {rating.workplacePosition}
                      </p>
                    )}
                  </div>
                  
                  {rating.comment && (
                    <span className="text-xs text-purple-600 font-semibold">
                      Ver más →
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Botón Home flotante fijo abajo centrado */}
      <div className="fixed bottom-4 left-0 right-0 flex justify-center z-50 animate-slideUp">
        <button 
          onClick={() => navigate('/professional-dashboard')}
          className="w-14 h-14 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 rounded-full flex items-center justify-center transition-all hover:scale-110 shadow-2xl border-4 border-white"
          aria-label="Volver al inicio"
        >
          <Home className="w-7 h-7 text-white" />
        </button>
      </div>

      {/* Modal de detalle */}
      {selectedRating && (
        <RatingDetailModal
          rating={selectedRating}
          onClose={() => setSelectedRating(null)}
          renderStars={renderStars}
        />
      )}
    </div>
  );
}

export default RatingsHistory;