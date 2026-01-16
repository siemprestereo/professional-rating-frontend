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
  const [loading, setLoading] = useState(true);
  const [selectedRating, setSelectedRating] = useState(null);
  const [filterInfo, setFilterInfo] = useState(null);

  useEffect(() => {
    loadRatings();
  }, [workHistoryIdFilter]);

  const loadRatings = async () => {
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
          
          // Establecer info del filtro
          if (data.length > 0) {
            setFilterInfo({
              position: data[0].workplacePosition,
              businessName: data[0].businessName || data[0].workplaceName
            });
          } else {
            setFilterInfo({ position: 'Trabajo', businessName: 'Sin especificar' });
          }
        }
      } catch (error) {
        console.error('Error loading public ratings:', error);
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
        setFilterInfo(null);
      }
    } catch (error) {
      console.error('Error loading ratings:', error);
    } finally {
      setLoading(false);
    }
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
    <div className="min-h-screen bg-gray-50 pb-24 animate-fadeIn">
      {/* ✅ NUEVO HEADER CON CARD FLOTANTE */}
      <div className="bg-gradient-to-br from-blue-500 to-purple-600 px-4 pt-8 pb-32 relative">
        {filterInfo ? (
          <>
            {/* Botón X flotante */}
            <button
              onClick={clearFilter}
              className="absolute top-6 right-6 w-10 h-10 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center text-white hover:bg-white/30 transition-all hover:scale-110"
            >
              <X className="w-6 h-6" />
            </button>
            
            {/* Card flotante con glassmorphism */}
            <div className="bg-white/10 backdrop-blur-md rounded-3xl p-6 text-white animate-scaleIn">
              <p className="text-sm font-semibold opacity-80 mb-2">
                Calificaciones de:
              </p>
              <h1 className="text-3xl font-black mb-2">
                {filterInfo.position}
              </h1>
              <p className="text-xl opacity-90 mb-4">
                {filterInfo.businessName}
              </p>
              <div className="inline-block bg-white/20 backdrop-blur-sm px-4 py-2 rounded-full">
                <p className="text-sm font-semibold">
                  {ratings.length} calificación{ratings.length !== 1 ? 'es' : ''}
                </p>
              </div>
            </div>
          </>
        ) : (
          /* Card para vista sin filtro */
          <div className="bg-white/10 backdrop-blur-md rounded-3xl p-6 text-white animate-scaleIn">
            <h1 className="text-3xl font-black mb-2">
              Historial de Calificaciones
            </h1>
            <div className="inline-block bg-white/20 backdrop-blur-sm px-4 py-2 rounded-full">
              <p className="text-sm font-semibold">
                {ratings.length} calificación{ratings.length !== 1 ? 'es' : ''}
              </p>
            </div>
          </div>
        )}
      </div>

      {/* ✅ CONTENIDO CON -MT PARA "EMPUJAR" EL CARD */}
      <div className="px-4 -mt-20">
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