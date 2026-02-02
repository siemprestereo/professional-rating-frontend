import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Star, ArrowLeft, CheckCircle, Loader2, Clock } from 'lucide-react';
import Toast from '../components/Toast';
import api from '../services/api.js';
import LoadingScreen from '../components/LoadingScreen';

function EditRatingForm() {
  const { ratingId } = useParams();
  const navigate = useNavigate();
  
  const [rating, setRating] = useState(null);
  const [score, setScore] = useState(0);
  const [hoverScore, setHoverScore] = useState(0);
  const [comment, setComment] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [toast, setToast] = useState(null);

  useEffect(() => {
    loadRating();
  }, [ratingId]);

  const loadRating = async () => {
    try {
      const backendUrl = 'https://professional-rating-backend-production.up.railway.app';
      const token = localStorage.getItem('authToken');
      
      const response = await fetch(`${backendUrl}/api/ratings/client/${JSON.parse(localStorage.getItem('client')).id}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const ratings = await response.json();
        const currentRating = ratings.find(r => r.id === parseInt(ratingId));
        
        if (!currentRating) {
          setToast({ type: 'error', message: 'Calificación no encontrada' });
          setTimeout(() => navigate('/client-dashboard'), 2000);
          return;
        }

        if (!currentRating.canEdit) {
          setToast({ type: 'error', message: 'Ya no podés editar esta calificación' });
          setTimeout(() => navigate('/client-dashboard'), 2000);
          return;
        }

        setRating(currentRating);
        setScore(currentRating.score);
        setComment(currentRating.comment || '');
      }
    } catch (error) {
      console.error('Error loading rating:', error);
      setToast({ type: 'error', message: 'Error al cargar la calificación' });
    } finally {
      setLoading(false);
    }
  };

  const getTimeRemaining = () => {
    if (!rating) return '';
    const now = new Date();
    const created = new Date(rating.createdAt);
    const diff = 30 * 60 * 1000 - (now - created);
    
    if (diff <= 0) return 'Tiempo expirado';
    
    const minutes = Math.floor(diff / 60000);
    return `${minutes} minutos restantes`;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (score === 0) {
      setToast({ type: 'warning', message: 'Por favor seleccioná una calificación' });
      return;
    }

    setSubmitting(true);

    try {
      const updateData = {
        professionalId: rating.professionalId,
        workHistoryId: rating.workHistoryId,
        score: score,
        comment: comment.trim() || null
      };

      await api.updateRating(ratingId, updateData);

      setSuccess(true);
      
      setTimeout(() => {
        navigate('/client-dashboard');
      }, 2000);
    } catch (error) {
      console.error('Error al actualizar:', error);
      
      if (error.response?.status === 401) {
        setToast({ type: 'error', message: 'Sesión expirada. Por favor iniciá sesión nuevamente' });
        setTimeout(() => navigate('/client-login'), 2000);
      } else {
        const errorMessage = error.response?.data?.message || 'Error al actualizar la calificación';
        setToast({ type: 'error', message: errorMessage });
      }
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return <LoadingScreen />;
  }

  if (success) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-400 to-blue-500 flex items-center justify-center p-4 animate-fadeIn">
        <div className="bg-white rounded-3xl p-8 text-center max-w-md w-full animate-scaleIn">
          <CheckCircle className="w-20 h-20 text-green-500 mx-auto mb-4 animate-scaleIn" />
          <h2 className="text-3xl roboto-light text-gray-800 mb-2 animate-slideUp">
            ¡Calificación actualizada!
          </h2>
          <p className="text-gray-600 mb-6 animate-slideUp delay-100 text-base">
            Tu calificación ha sido modificada exitosamente
          </p>
          <div className="animate-pulse text-gray-500">
            Redirigiendo...
          </div>
        </div>
      </div>
    );
  }

  if (!rating) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-500 to-purple-600 animate-fadeIn">
      {/* Header */}
      <div className="bg-white/10 backdrop-blur-md px-4 py-4 animate-slideDown">
        <button
          onClick={() => navigate('/client-dashboard')}
          className="text-white flex items-center hover:translate-x-[-4px] transition-transform duration-300 text-base"
        >
          <ArrowLeft className="w-5 h-5 mr-2" />
          Volver
        </button>
      </div>

      {/* Contenido */}
      <div className="px-4 py-8">
        <div className="bg-white rounded-3xl p-6 max-w-md mx-auto animate-slideUp">
          {/* Avatar y nombre */}
          <div className="text-center mb-6">
            <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full mx-auto mb-4 flex items-center justify-center text-3xl font-bold text-white animate-scaleIn">
              {rating.professionalName?.charAt(0) || '?'}
            </div>
            <h1 className="text-2xl roboto-light text-gray-800 animate-slideUp delay-100">
              Editar calificación a {rating.professionalName}
            </h1>
            <p className="text-sm text-gray-500 mt-2">{rating.businessName}</p>
          </div>

          {/* Tiempo restante */}
          <div className="bg-blue-50 border border-blue-200 rounded-xl p-3 mb-6 flex items-center gap-2">
            <Clock className="w-5 h-5 text-blue-600 flex-shrink-0" />
            <p className="text-sm text-blue-800 font-semibold">
              {getTimeRemaining()} para editar
            </p>
          </div>

          <form onSubmit={handleSubmit}>
            {/* Estrellas */}
            <div className="mb-6 animate-slideUp delay-200">
              <label className="block text-gray-700 font-semibold mb-3 text-center text-base">
                ¿Cómo fue tu experiencia?
              </label>
              <div className="flex justify-center gap-2 mb-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setScore(star)}
                    onMouseEnter={() => setHoverScore(star)}
                    onMouseLeave={() => setHoverScore(0)}
                    className="focus:outline-none transform transition-all duration-200 hover:scale-125 active:scale-110"
                  >
                    <Star
                      className={`w-12 h-12 transition-all duration-200 ${
                        star <= (hoverScore || score)
                          ? 'text-yellow-400 fill-yellow-400 drop-shadow-lg'
                          : 'text-gray-300'
                      }`}
                    />
                  </button>
                ))}
              </div>
              <div className="text-center text-base text-gray-500 transition-all duration-300">
                {score === 0 && 'Tocá para calificar'}
                {score === 1 && '😞 Malo'}
                {score === 2 && '😕 Regular'}
                {score === 3 && '😐 Bueno'}
                {score === 4 && '😊 Muy bueno'}
                {score === 5 && '🤩 Excelente'}
              </div>
            </div>

            {/* Comentario */}
            <div className="mb-6 animate-slideUp delay-300">
              <label className="block text-gray-700 font-semibold mb-2 text-base">
                Contanos más (opcional)
              </label>
              <textarea
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="¿Qué te gustó o qué podría mejorar?"
                className="w-full border-2 border-gray-200 rounded-2xl p-4 focus:border-purple-500 focus:outline-none resize-none transition-all duration-300 text-base"
                rows="4"
                maxLength="500"
              />
              <div className="text-right text-sm text-gray-400 mt-1">
                {comment.length}/500
              </div>
            </div>

            {/* Botón */}
            <button
              type="submit"
              disabled={submitting || score === 0}
              className="w-full bg-gradient-to-r from-blue-500 to-purple-600 text-white font-bold py-4 rounded-2xl shadow-lg disabled:opacity-50 disabled:cursor-not-allowed transform transition-all duration-300 hover:scale-105 active:scale-95 animate-scaleIn delay-400 ripple text-lg"
            >
              {submitting ? (
                <span className="flex items-center justify-center">
                  <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                  Actualizando...
                </span>
              ) : (
                'Actualizar Calificación'
              )}
            </button>
          </form>

          {/* Info */}
          <p className="text-center text-sm text-gray-500 mt-4 animate-slideUp delay-500">
            Los cambios se reflejarán inmediatamente en el perfil del profesional
          </p>
        </div>
      </div>

      {/* Toast notification */}
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

export default EditRatingForm;