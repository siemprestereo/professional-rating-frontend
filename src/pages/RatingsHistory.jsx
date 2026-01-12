import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Star, Home, Loader2 } from 'lucide-react';
import RatingDetailModal from '../components/RatingDetailModal';

function RatingsHistory() {
  const backendUrl = 'https://professional-rating-backend-production.up.railway.app';
  const navigate = useNavigate();
  const [ratings, setRatings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedRating, setSelectedRating] = useState(null);

  useEffect(() => {
    loadRatings();
  }, []);

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
        setRatings(data);
      }
    } catch (error) {
      console.error('Error loading ratings:', error);
    } finally {
      setLoading(false);
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
    <div className="min-h-screen bg-gray-50 pb-24">
      {/* Header */}
      <div className="bg-gradient-to-br from-blue-500 to-purple-600 px-4 py-8">
        <h1 className="text-white text-2xl font-bold">
          Historial de Calificaciones
        </h1>
        <p className="text-white/80 text-sm mt-1">
          {ratings.length} {ratings.length === 1 ? 'calificación' : 'calificaciones'}
        </p>
      </div>

      {/* Lista de ratings */}
      <div className="px-4 py-6">
        {ratings.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-lg p-8 text-center">
            <p className="text-gray-500">Aún no tenés calificaciones</p>
          </div>
        ) : (
          <div className="space-y-3">
            {ratings.map((rating) => (
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
                    <p className="text-xs text-gray-500">
                      {rating.businessName} • {rating.workplacePosition}
                    </p>
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