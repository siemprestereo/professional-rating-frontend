import { useState, useEffect, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Star, Home, Loader2, X } from 'lucide-react';
import RatingDetailModal from '../components/RatingDetailModal';

function RatingsHistory() {
  const backendUrl = 'https://professional-rating-backend-production.up.railway.app';
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const workHistoryIdFilter = searchParams.get('workHistoryId');
  
  const [ratings, setRatings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedRating, setSelectedRating] = useState(null);
  const [filterInfo, setFilterInfo] = useState(null);
  const [professionalId, setProfessionalId] = useState(null);
  const filterInfoRef = useRef(null);

  useEffect(() => {
    loadRatings();
  }, [workHistoryIdFilter]);

  const loadRatings = async () => {
    console.log('🔄 loadRatings called, workHistoryIdFilter:', workHistoryIdFilter);
    const token = localStorage.getItem('authToken');
    
    // Si viene workHistoryId, cargar ratings públicos por workHistoryId
    if (workHistoryIdFilter) {
      try {
        const response = await fetch(
          `${backendUrl}/api/ratings/work-history/${workHistoryIdFilter}`,
          {
            headers: token ? { 'Authorization': `Bearer ${token}` } : {}
          }
        );

        if (response.ok) {
          const data = await response.json();
          console.log('✅ Ratings públicos cargados:', data);
          setRatings(data);
          
          // ✅ GUARDAR professionalId para poder volver a sus stats
          if (data.length > 0) {
            setProfessionalId(data[0].professionalId);
            
            const filter = {
              position: data[0].workplacePosition,
              businessName: data[0].businessName || data[0].workplaceName
            };
            console.log('✅ filterInfo set:', filter);
            
            filterInfoRef.current = filter;
            setFilterInfo(filter);
            
            setTimeout(() => {
              if (!filterInfo && filterInfoRef.current) {
                console.log('🔄 Forcing re-render with filterInfo');
                setFilterInfo(filterInfoRef.current);
              }
            }, 100);
          } else {
            const filter = { position: 'Trabajo', businessName: 'Sin especificar' };
            console.log('✅ filterInfo set (empty):', filter);
            filterInfoRef.current = filter;
            setFilterInfo(filter);
          }
        }
      } catch (error) {
        console.error('❌ Error loading public ratings:', error);
      } finally {
        setLoading(false);
      }
      return;
    }

    // Si NO hay workHistoryId, requiere login (modo privado)
    if (!token) {
      navigate('/professional-login');
      return;
    }

    // Cargar todos los ratings del profesional (modo privado)
    try {
      const professional = JSON.parse(localStorage.getItem('professional'));
      const response = await fetch(
        `${backendUrl}/api/ratings/professional/${professional.id}`,
        {
          headers: { 'Authorization': `Bearer ${token}` }
        }
      );

      if (response.ok) {
        const data = await response.json();
        console.log('✅ Ratings privados cargados:', data);
        setRatings(data);
        console.log('✅ filterInfo cleared (private mode)');
        setFilterInfo(null);
      }
    } catch (error) {
      console.error('❌ Error loading ratings:', error);
    } finally {
      setLoading(false);
    }
  };

  // ✅ MODIFICADO: Volver a las estadísticas públicas del profesional
  const handleBackToStats = () => {
    if (professionalId) {
      navigate(`/stats-public/${professionalId}`);
    } else {
      navigate('/ratings-history');
    }
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
    <div className="min-h-screen bg-gray-50 pb-24 animate-fadeIn">
      {/* Header con gradiente tornasol */}
      <div className="bg-gradient-to-br from-blue-500 to-purple-600 px-4 py-6">
        <div className="flex items-center justify-between">
          <div className="flex-1">
            {workHistoryIdFilter && (filterInfo || filterInfoRef.current) ? (
              <>
                <p className="text-xs text-white/80 font-semibold uppercase tracking-wide mb-1">CALIFICACIONES</p>
                <p className="text-2xl font-bold text-white">{(filterInfo || filterInfoRef.current)?.position}</p>
                <p className="text-base text-white/90">{(filterInfo || filterInfoRef.current)?.businessName}</p>
                <p className="text-sm text-white/80 font-semibold mt-1">
                  {ratings.length} {ratings.length === 1 ? 'calificación' : 'calificaciones'}
                </p>
              </>
            ) : (
             <>
  <p className="text-xs text-white/80 font-semibold uppercase tracking-wide mb-1 roboto-regular">
    HISTORIAL
  </p>
  <p className="text-2xl roboto-light text-white">
    Calificaciones
  </p>
  <p className="text-sm text-white/80 font-semibold mt-1 roboto-regular">
    {ratings.length} {ratings.length === 1 ? 'calificación' : 'calificaciones'}
  </p>
</>
            )}
          </div>
          {workHistoryIdFilter && (
            <button 
              onClick={handleBackToStats}
              className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center text-white hover:bg-white/30 transition-all"
              aria-label="Volver a estadísticas"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>
      </div>

      {/* ✅ CONTENIDO */}
      <div className="px-4 py-6">
        {ratings.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-lg p-8 text-center animate-slideUp">
            {workHistoryIdFilter ? (
              <p className="text-gray-500 mb-4">
                No hay calificaciones para este trabajo aún
              </p>
            ) : (
              <p className="text-gray-500">Aún no tenés calificaciones</p>
            )}
          </div>
        ) : (
          <div className="space-y-3">
            {ratings.map((rating, index) => (
              <div
                key={rating.id}
                onClick={() => setSelectedRating(rating)}
                className="bg-white rounded-2xl shadow-lg p-4 hover-lift cursor-pointer animate-slideUp"
                style={{ animationDelay: `${index * 50}ms` }}
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
          onClick={() => navigate(-1)}
          className="w-14 h-14 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 rounded-full flex items-center justify-center transition-all hover:scale-110 shadow-2xl border-4 border-white"
          aria-label="Volver"
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