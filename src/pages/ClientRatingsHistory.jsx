import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Star, Home, ArrowLeft, Calendar, Edit2, Trash2, Clock } from 'lucide-react';
import LoadingScreen from '../components/LoadingScreen';
import DeleteConfirmModal from '../components/DeleteConfirmModal';
import Toast from '../components/Toast';
import api from '../services/api';

function ClientRatingsHistory() {
  const navigate = useNavigate();
  const backendUrl = 'https://professional-rating-backend-production.up.railway.app';
  
  const [ratings, setRatings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deleteModal, setDeleteModal] = useState(null);
  const [toast, setToast] = useState(null);

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
        
        // ✅ Ordenar por fecha (más reciente primero)
        const sortedData = data.sort((a, b) => {
          return new Date(b.createdAt) - new Date(a.createdAt);
        });
        
        setRatings(sortedData);
      }
    } catch (error) {
      console.error('Error loading ratings:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleEditRating = (rating) => {
    navigate(`/edit-rating/${rating.id}`);
  };

  const handleDeleteClick = (rating) => {
    setDeleteModal({
      ratingId: rating.id,
      professionalName: rating.professionalName
    });
  };

  const handleDeleteConfirm = async () => {
    if (!deleteModal) return;

    try {
      await api.deleteRating(deleteModal.ratingId);
      
      setToast({ 
        type: 'success', 
        message: 'Calificación eliminada exitosamente' 
      });

      // Recargar ratings
      loadRatings();
      
    } catch (error) {
      console.error('Error al eliminar:', error);
      setToast({ 
        type: 'error', 
        message: error.response?.data?.message || 'Error al eliminar la calificación' 
      });
    } finally {
      setDeleteModal(null);
    }
  };

  const getTimeRemaining = (createdAt) => {
  try {
    const now = new Date();
    const created = new Date(createdAt);
    
    // Verificar que la fecha es válida
    if (isNaN(created.getTime())) {
      console.error('Fecha inválida:', createdAt);
      return null;
    }
    
    const diffMs = now.getTime() - created.getTime();
    const diffMinutes = Math.floor(diffMs / (1000 * 60));
    const remainingMinutes = 30 - diffMinutes;
    
    if (remainingMinutes <= 0) {
      return null;
    }
    
    return `${remainingMinutes} min`;
  } catch (error) {
    console.error('Error calculando tiempo:', error);
    return null;
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
      <div className="max-w-4xl mx-auto px-4 -mt-4 pb-8">
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
            {ratings.map((rating) => {
              const timeRemaining = getTimeRemaining(rating.createdAt);
              const canEdit = rating.canEdit;

              return (
                <div 
                  key={rating.id} 
                  className={`rounded-2xl p-4 hover:shadow-xl transition-all ${
                    canEdit && timeRemaining 
                      ? 'border-2 border-blue-400 bg-blue-50/30 shadow-lg editable-rating' 
                      : 'bg-white shadow-lg'
                  }`}
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
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center text-xs text-gray-400">
                      <Calendar className="w-3 h-3 mr-1" />
                      {new Date(rating.createdAt).toLocaleDateString('es-AR', {
                        day: '2-digit',
                        month: 'long',
                        year: 'numeric'
                      })}
                    </div>

                    {/* Botones de editar/eliminar */}
                    {canEdit && timeRemaining && (
                      <div className="flex items-center gap-2">
                        <div className="flex items-center gap-1 text-xs text-blue-600 bg-blue-100 px-2 py-1 rounded-lg font-semibold">
                          <Clock className="w-3 h-3" />
                          <span>{timeRemaining}</span>
                        </div>
                        <button
                          onClick={() => handleEditRating(rating)}
                          className="p-2 text-blue-600 hover:bg-blue-100 rounded-lg transition-colors"
                          title="Editar calificación"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteClick(rating)}
                          className="p-2 text-red-600 hover:bg-red-100 rounded-lg transition-colors"
                          title="Eliminar calificación"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
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

      {/* Modal de confirmación de eliminación */}
      <DeleteConfirmModal
        isOpen={deleteModal !== null}
        onClose={() => setDeleteModal(null)}
        onConfirm={handleDeleteConfirm}
        professionalName={deleteModal?.professionalName}
      />

      {/* Toast notifications */}
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}

      {/* Estilos de animación */}
      <style>{`
        @keyframes shimmer {
          0% {
            box-shadow: 0 0 0 0 rgba(59, 130, 246, 0.7);
          }
          50% {
            box-shadow: 0 0 20px 5px rgba(59, 130, 246, 0.4);
          }
          100% {
            box-shadow: 0 0 0 0 rgba(59, 130, 246, 0.7);
          }
        }
        
        .editable-rating {
          animation: shimmer 2s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
}

export default ClientRatingsHistory;