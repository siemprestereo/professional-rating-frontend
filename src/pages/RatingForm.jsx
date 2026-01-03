import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Star, ArrowLeft, CheckCircle, Loader2, Briefcase } from 'lucide-react';
import Toast from '../components/Toast';
import api from '../services/api.js';

function RatingForm() {
  const { professionalId } = useParams();
  const navigate = useNavigate();
  const [professional, setProfessional] = useState(null);
  const [score, setScore] = useState(0);
  const [hoverScore, setHoverScore] = useState(0);
  const [comment, setComment] = useState('');
  const [selectedWorkplace, setSelectedWorkplace] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [toast, setToast] = useState(null);

  useEffect(() => {
    loadProfessional();
  }, [professionalId]);

  const loadProfessional = async () => {
  try {
    console.log('🔍 Loading professional:', professionalId);
    const data = await api.getProfessionalProfile(professionalId);
    console.log('✅ Professional data received:', data);
    console.log('📦 Type of data:', typeof data);
    console.log('📦 Data.name:', data?.name);
    
    setProfessional(data);
    console.log('✅ Professional state set');
    
    // Auto-seleccionar si solo hay 1 trabajo activo
    const activeJobs = data.workHistory?.filter(w => w.isActive) || [];
    if (activeJobs.length === 1) {
      setSelectedWorkplace(activeJobs[0]);
    }
  } catch (error) {
    console.error('❌ Error loading professional:', error);
  } finally {
    setLoading(false);
  }
};

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (score === 0) {
      setToast({ type: 'warning', message: 'Por favor seleccioná una calificación' });
      return;
    }

    const activeJobs = professional?.workHistory?.filter(w => w.isActive) || [];
    
    // Validar workplace si hay múltiples trabajos activos
    if (activeJobs.length > 1 && !selectedWorkplace) {
      setToast({ type: 'warning', message: 'Por favor seleccioná dónde te atendió este profesional' });
      return;
    }

    setSubmitting(true);

    try {
      const ratingData = {
        professionalId: parseInt(professionalId),
        businessId: selectedWorkplace?.businessId || professional?.workHistory?.[0]?.businessId || 1,
        score: score,
        comment: comment.trim()
      };

      // Agregar workHistoryId si hay workplace seleccionado
      if (selectedWorkplace) {
        ratingData.workHistoryId = selectedWorkplace.workHistoryId;
      }

      await api.createRating(ratingData);

      setSuccess(true);
      
      setTimeout(() => {
        navigate(`/professional/${professionalId}`);
      }, 2000);
    } catch (error) {
      console.error('Error submitting rating:', error);
      
      // Mensaje más específico según el tipo de error
      if (error.response?.status === 401) {
        setToast({ 
          type: 'error', 
          message: 'Debes iniciar sesión como Cliente para calificar' 
        });
      } else if (error.response?.status === 409) {
        setToast({ 
          type: 'warning', 
          message: 'Ya calificaste a este profesional en este lugar' 
        });
      } else {
        setToast({ 
          type: 'error', 
          message: 'Error al enviar la calificación. Intentá nuevamente.' 
        });
      }
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center animate-fadeIn">
        <div className="text-center">
          <Loader2 className="w-16 h-16 text-white animate-spin mx-auto mb-4" />
          <p className="text-white text-xl">Cargando...</p>
        </div>
      </div>
    );
  }

  if (success) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-400 to-blue-500 flex items-center justify-center p-4 animate-fadeIn">
        <div className="bg-white rounded-3xl p-8 text-center max-w-md w-full animate-scaleIn">
          <CheckCircle className="w-20 h-20 text-green-500 mx-auto mb-4 animate-scaleIn" />
          <h2 className="text-3xl font-bold text-gray-800 mb-2 animate-slideUp">
            ¡Gracias por tu opinión!
          </h2>
          <p className="text-gray-600 mb-6 animate-slideUp delay-100">
            Tu calificación ayuda a {professional?.Name?.split(' ')[0] || 'este profesional'} a mejorar su servicio
          </p>
          <div className="animate-pulse text-gray-500">
            Redirigiendo...
          </div>
        </div>
      </div>
    );
  }

  const activeJobs = professional?.workHistory?.filter(w => w.isActive) || [];
  const showWorkplaceSelector = activeJobs.length > 1;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-500 to-purple-600 animate-fadeIn">
      {/* Header */}
      <div className="bg-white/10 backdrop-blur-md px-4 py-4 animate-slideDown">
        <button
          onClick={() => navigate(`/professional/${professionalId}`)}
          className="text-white flex items-center hover:translate-x-[-4px] transition-transform duration-300"
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
              {professional?.Name?.charAt(0) || '?'}
            </div>
            <h1 className="text-2xl font-bold text-gray-800 animate-slideUp delay-100">
              Calificar a {professional?.Name || 'Cargando...'}
            </h1>
          </div>

          <form onSubmit={handleSubmit}>
            {/* Selector de lugar de trabajo (si tiene múltiples) */}
            {showWorkplaceSelector && (
              <div className="mb-6 animate-slideUp delay-150">
                <label className="block text-gray-700 font-semibold mb-2">
                  ¿Dónde te atendió?
                </label>
                <div className="space-y-2">
                  {activeJobs.map((job) => (
                    <button
                      key={job.workHistoryId}
                      type="button"
                      onClick={() => setSelectedWorkplace(job)}
                      className={`w-full p-4 rounded-xl border-2 transition-all duration-200 text-left ${
                        selectedWorkplace?.workHistoryId === job.workHistoryId
                          ? 'border-purple-500 bg-purple-50'
                          : 'border-gray-200 hover:border-purple-300'
                      }`}
                    >
                      <div className="flex items-center">
                        <Briefcase className={`w-5 h-5 mr-3 ${
                          selectedWorkplace?.workHistoryId === job.workHistoryId
                            ? 'text-purple-600'
                            : 'text-gray-400'
                        }`} />
                        <div>
                          <p className="font-semibold text-gray-800">{job.businessName}</p>
                          <p className="text-sm text-gray-500">{job.position}</p>
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Estrellas */}
            <div className="mb-6 animate-slideUp delay-200">
              <label className="block text-gray-700 font-semibold mb-3 text-center">
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
              <div className="text-center text-sm text-gray-500 transition-all duration-300">
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
              <label className="block text-gray-700 font-semibold mb-2">
                Contanos más (opcional)
              </label>
              <textarea
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="¿Qué te gustó o qué podría mejorar?"
                className="w-full border-2 border-gray-200 rounded-2xl p-4 focus:border-purple-500 focus:outline-none resize-none transition-all duration-300"
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
              disabled={submitting || score === 0 || (showWorkplaceSelector && !selectedWorkplace)}
              className="w-full bg-gradient-to-r from-yellow-400 to-orange-500 text-white font-bold py-4 rounded-2xl shadow-lg disabled:opacity-50 disabled:cursor-not-allowed transform transition-all duration-300 hover:scale-105 active:scale-95 animate-scaleIn delay-400 ripple"
            >
              {submitting ? (
                <span className="flex items-center justify-center">
                  <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                  Enviando...
                </span>
              ) : (
                'Enviar Calificación'
              )}
            </button>
          </form>

          {/* Info */}
          <p className="text-center text-sm text-gray-500 mt-4 animate-slideUp delay-500">
            Tu calificación es anónima y ayuda a construir la reputación profesional
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

export default RatingForm;