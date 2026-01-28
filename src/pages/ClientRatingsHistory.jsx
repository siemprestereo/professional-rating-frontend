import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Star, Home, ArrowLeft, Calendar } from 'lucide-react';
import LoadingScreen from '../components/LoadingScreen';

function ClientRatingsHistory() {
  const navigate = useNavigate();
  const backendUrl = 'https://professional-rating-backend-production.up.railway.app';
  
  const [ratings, setRatings] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadRatings();
  }, []);

  const loadRatings = async () => {
    const token = localStorage.getItem('authToken');
    const savedClient = localStorage.getItem('client');
    
    if (!token || !savedClient) {
      navigate('/client-login');
      return;
    }

    const clientData = JSON.parse(savedClient);

    try {
      const response = await fetch(`${backendUrl}/api/ratings/client/${clientData.id}`, {
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
    return <LoadingScreen gradient="from-green-500 to-teal-600" />;
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-24 animate-fadeIn">
      {/* Header */}
      <div className="bg-gradient-to-br from-green-500 to-teal-600 px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <button
            onClick={() => navigate('/client-stats')}
            className="flex items-center text-white mb-4 hover:opacity-80 transition-opacity"
          >
            <ArrowLeft className="w-5 h-5 mr-2" />
            Volver a estadísticas
          </button>
          <h1 className="text-3xl roboto-light text-white mb-2">
            Historial de Calificaciones
          </h1>
          <p className="text-white/90">
            {ratings.length} {ratings.length === 1 ? 'calificación otorgada' : 'calificaciones otorgadas'}
          </p>
        </div>
      </div>

      {/* Contenido */}
      <div className="max-w-4xl mx-auto px-4 -mt-8 pb-8">
        {ratings.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-lg p-8 text-center">
            <div className="w-16 h-16 bg-gray-100 rounded-full mx-auto mb-4 flex items-center justify-center">
              <Calendar className="w-8 h-8 text-gray-400" />
            </div>
            <h2 className="text-xl roboto-light text-gray-800 mb-2">
              No hay calificaciones
            </h2>
            <p className="text-gray-600 mb-6">
              Aún no has dado ninguna calificación
            </p>
            <button
              onClick={() => navigate('/client-dashboard')}
              className="bg-green-600 text-white px-6 py-3 rounded-xl font-semibold hover:bg-green-700 transition-all"
            >
              Ir al inicio
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            {ratings.map((rating) => (
              <div 
                key={rating.id} 
                className="bg-white rounded-2xl shadow-lg p-4 hover:shadow-xl transition-all"
              >
                <div className="flex items-start justify-between mb-2">
                  <div className="flex-1">
                    <h4 className="font-semibold text-gray-800 text-lg">
                      {rating.professionalName}
                    </h4>
                    <p className="text-sm text-gray-500">{rating.businessName}</p>
                  </div>
                  <div className="flex items-center gap-1">
                    {renderStars(rating.score)}
                  </div>
                </div>
                
                {rating.comment && (
                  <p className="text-gray-600 text-sm mb-2 italic bg-gray-50 p-3 rounded-xl">
                    "{rating.comment}"
                  </p>
                )}
                
                <div className="flex items-center text-xs text-gray-400">
                  <Calendar className="w-3 h-3 mr-1" />
                  {new Date(rating.createdAt).toLocaleDateString('es-AR', {
                    day: '2-digit',
                    month: 'long',
                    year: 'numeric'
                  })}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Botón Home */}
      <div className="fixed bottom-4 left-0 right-0 flex justify-center z-50">
        <button
          onClick={() => navigate('/client-dashboard')}
          className="w-14 h-14 bg-gradient-to-r from-green-500 to-teal-600 hover:from-green-600 hover:to-teal-700 rounded-full flex items-center justify-center transition-all hover:scale-110 shadow-2xl border-4 border-white"
        >
          <Home className="w-7 h-7 text-white" />
        </button>
      </div>
    </div>
  );
}

export default ClientRatingsHistory;