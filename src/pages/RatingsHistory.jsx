import { useState, useEffect, useMemo } from 'react';
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
  const [professionalId, setProfessionalId] = useState(null);

  // ✅ MEJORA 1: useMemo en lugar de useRef + setTimeout
  const headerData = useMemo(() => {
    if (!workHistoryIdFilter || ratings.length === 0) return null;
    return {
      position: ratings[0].workplacePosition,
      businessName: ratings[0].businessName || ratings[0].workplaceName,
      professionalId: ratings[0].professionalId
    };
  }, [ratings, workHistoryIdFilter]);

  useEffect(() => {
    loadRatings();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [workHistoryIdFilter]);

  const loadRatings = async () => {
    const token = localStorage.getItem('authToken');
    
    // ✅ Modo público: ratings por workHistoryId
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
          setRatings(data);
          
          // Guardar professionalId para navegación
          if (data.length > 0) {
            setProfessionalId(data[0].professionalId);
          }
        } else {
          throw new Error('Error al cargar calificaciones');
        }
      } catch (error) {
        console.error('Error loading public ratings:', error);
        setRatings([]);
      } finally {
        setLoading(false);
      }
      return;
    }

    // ✅ Modo privado: requiere login
    if (!token) {
      navigate('/professional-login');
      return;
    }

    // ✅ MEJORA 2: Try-catch para localStorage
    try {
      const professionalData = localStorage.getItem('professional');
      if (!professionalData) {
        throw new Error('No hay datos de profesional');
      }

      const professional = JSON.parse(professionalData);
      
      const response = await fetch(
        `${backendUrl}/api/ratings/professional/${professional.id}`,
        {
          headers: { 'Authorization': `Bearer ${token}` }
        }
      );

      if (response.ok) {
        const data = await response.json();
        setRatings(data);
      } else {
        throw new Error('Error al cargar calificaciones');
      }
    } catch (error) {
      console.error('Error loading ratings:', error);
      // Si falla el localStorage o la petición, redirigir al login
      if (error.message.includes('No hay datos')) {
        navigate('/professional-login');
      }
      setRatings([]);
    } finally {
      setLoading(false);
    }
  };

  // ✅ MEJORA 3: Navegación inteligente según contexto
  const handleBack = () => {
    if (workHistoryIdFilter) {
      // Modo público: volver a stats del profesional
      if (professionalId || headerData?.professionalId) {
        navigate(`/stats-public/${professionalId || headerData.professionalId}`);
      } else {
        // Fallback si no hay professionalId
        navigate('/');
      }
    } else {
      // Modo privado: volver al dashboard
      navigate('/professional-dashboard');
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
      {/* Header */}
      <div className="bg-gradient-to-br from-blue-500 to-purple-600 px-4 py-6">
        <div className="flex items-center justify-between">
          <div className="flex-1">
            {workHistoryIdFilter && headerData ? (
              <>
                <p className="text-xs text-white/80 font-semibold uppercase tracking-wide mb-1">
                  CALIFICACIONES
                </p>
                <p className="text-2xl font-bold text-white">
                  {headerData.position}
                </p>
                <p className="text-base text-white/90">
                  {headerData.businessName}
                </p>
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
          
          {/* ✅ MEJORA 4: Botón X solo en modo público */}
          {workHistoryIdFilter && (
            <button 
              onClick={handleBack}
              className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center text-white hover:bg-white/30 transition-all"
              aria-label="Volver a estadísticas"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>
      </div>

      {/* Contenido */}
      <div className="px-4 py-6">
        {ratings.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-lg p-8 text-center animate-slideUp">
            {workHistoryIdFilter ? (
              <>
                <div className="w-16 h-16 bg-gray-100 rounded-full mx-auto mb-4 flex items-center justify-center">
                  <Star className="w-8 h-8 text-gray-400" />
                </div>
                <h3 className="text-lg font-semibold text-gray-800 mb-2">
                  Sin calificaciones aún
                </h3>
                <p className="text-gray-500 mb-4">
                  No hay calificaciones para este trabajo
                </p>
              </>
            ) : (
              <>
                <div className="w-16 h-16 bg-gray-100 rounded-full mx-auto mb-4 flex items-center justify-center">
                  <Star className="w-8 h-8 text-gray-400" />
                </div>
                <h3 className="text-lg font-semibold text-gray-800 mb-2">
                  Sin calificaciones
                </h3>
                <p className="text-gray-500">
                  Aún no tenés calificaciones
                </p>
              </>
            )}
          </div>
        ) : (
          <div className="space-y-3">
            {ratings.map((rating, index) => (
              <div
                key={rating.id}
                onClick={() => setSelectedRating(rating)}
                className="bg-white rounded-2xl shadow-lg p-4 hover:shadow-xl transition-all cursor-pointer animate-slideUp"
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
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-gray-800 break-words">
                      {rating.clientName?.trim() || 'Anónimo'}
                    </p>
                    {!workHistoryIdFilter && (
                      <p className="text-xs text-gray-500 break-words">
                        {rating.businessName} • {rating.workplacePosition}
                      </p>
                    )}
                  </div>
                  
                  {rating.comment && (
                    <span className="text-xs text-purple-600 font-semibold ml-2 flex-shrink-0">
                      Ver más →
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ✅ Botón Home flotante */}
      <div className="fixed bottom-4 left-0 right-0 flex justify-center z-50 animate-slideUp">
        <button 
          onClick={handleBack}
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