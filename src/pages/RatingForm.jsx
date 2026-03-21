import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Star, ArrowLeft, CheckCircle, Loader2, Briefcase, Clock } from 'lucide-react';
import Toast from '../components/Toast';
import ErrorModal from '../components/ErrorModal';
import api from '../services/api.js';
import LoadingScreen from '../components/LoadingScreen';

function RatingForm({ professionalIdFromToken }) {
  const { professionalId: professionalIdFromUrl } = useParams();
  const navigate = useNavigate();

  // ✅ Usar el ID del token si existe, sino usar el de la URL (para compatibilidad con rutas viejas)
  const professionalId = professionalIdFromToken || professionalIdFromUrl;

  const [professional, setProfessional] = useState(null);
  const [score, setScore] = useState(0);
  const [hoverScore, setHoverScore] = useState(0);
  const [comment, setComment] = useState('');
  const [selectedWorkplace, setSelectedWorkplace] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [commentModerated, setCommentModerated] = useState(false);
  const [toast, setToast] = useState(null);
  const [errorModal, setErrorModal] = useState(null);

  useEffect(() => {
    if (professionalId) {
      loadProfessional();
    }
  }, [professionalId]);

  const loadProfessional = async () => {
    try {
      const data = await api.getProfessionalProfile(professionalId);

      // Mapear professionalName a name para compatibilidad
      const mappedData = {
        ...data,
        name: data.professionalName || data.name
      };

      setProfessional(mappedData);

      // Auto-seleccionar si solo hay 1 trabajo activo
      const activeJobs = mappedData.workHistory?.filter(w => w.isActive) || [];

      if (activeJobs.length === 1) {
        setSelectedWorkplace(activeJobs[0]);
      }
    } catch (error) {
      console.error('Error loading professional:', error);
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
      // Determinar qué trabajo usar
      const workplaceToUse = selectedWorkplace || activeJobs[0];

      if (!workplaceToUse || !workplaceToUse.workHistoryId) {
        setToast({
          type: 'error',
          message: 'No se pudo determinar el lugar de trabajo'
        });
        setSubmitting(false);
        return;
      }

      const ratingData = {
        professionalId: parseInt(professionalId),
        workHistoryId: workplaceToUse.workHistoryId,
        score: score,
        comment: comment.trim() || null
      };

      const result = await api.createRating(ratingData);

      if (result?.commentModerated) setCommentModerated(true);
      setSuccess(true);

      setTimeout(() => {
        navigate('/client-dashboard');
      }, 2000);
    } catch (error) {
      // Mensaje más específico según el tipo de error
      if (error.response?.status === 401) {
        setErrorModal({
          title: 'Inicio de sesión requerido',
          message: 'Para calificar a este profesional deberás iniciar sesión como Cliente.',
          actionText: 'Iniciar sesión',
          onAction: () => {
            localStorage.setItem('returnTo', window.location.pathname);
            navigate('/client-login');
          }
        });
      } else if (error.response?.status === 409) {
        setErrorModal({
          title: 'No podrás calificar a este profesional',
          message: error.response?.data?.message || 'Aún no transcurrieron 6 meses desde la última vez que lo calificaste',
          onClose: () => {
            setErrorModal(null);
            navigate('/client-dashboard');
          }
        });
      } else {
        // Mostrar el mensaje de error real del backend
        const errorMessage = error.response?.data?.message || 'Error al enviar la calificación. Intentá nuevamente.';
        setToast({
          type: 'error',
          message: errorMessage
        });
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
            ¡Gracias por tu opinión!
          </h2>
          <p className="text-gray-600 mb-4 animate-slideUp delay-100 text-base">
            Tu calificación ayuda a {professional?.name?.split(' ')[0] || 'este profesional'} a mejorar su servicio
          </p>
          {commentModerated && (
            <div className="bg-amber-50 border border-amber-200 rounded-xl px-4 py-3 mb-4 text-sm text-amber-800 animate-slideUp">
              Tu comentario fue removido automáticamente por contener lenguaje no permitido.
            </div>
          )}
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
              {professional?.name?.charAt(0) || '?'}
            </div>
            <h1 className="text-2xl roboto-light text-gray-800 animate-slideUp delay-100">
              Calificar a {professional?.name || 'Cargando...'}
            </h1>
          </div>

          <form onSubmit={handleSubmit}>
            {/* Selector de lugar de trabajo (si tiene múltiples) */}
            {showWorkplaceSelector && (
              <div className="mb-6 animate-slideUp delay-150">
                <label className="block text-gray-700 font-semibold mb-2 text-base">
                  ¿Dónde te atendió?
                </label>
                <div className="space-y-2">
                  {activeJobs.map((job) => (
                    <button
                      key={job.workHistoryId}
                      type="button"
                      onClick={() => setSelectedWorkplace(job)}
                      className={`w-full p-4 rounded-xl border-2 transition-all duration-200 text-left ${selectedWorkplace?.workHistoryId === job.workHistoryId
                        ? 'border-purple-500 bg-purple-50'
                        : 'border-gray-200 hover:border-purple-300'
                        }`}
                    >
                      <div className="flex items-center">
                        <Briefcase className={`w-5 h-5 mr-3 ${selectedWorkplace?.workHistoryId === job.workHistoryId
                          ? 'text-purple-600'
                          : 'text-gray-400'
                          }`} />
                        <div>
                          <p className="font-semibold text-gray-800 text-base">{job.businessName}</p>
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
                      className={`w-12 h-12 transition-all duration-200 ${star <= (hoverScore || score)
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

            {/* Aviso de edición */}
            <div className="bg-blue-50 border-2 border-blue-200 rounded-xl p-4 mb-4 animate-slideUp delay-450">
              <div className="flex items-start gap-3">
                <Clock className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-sm text-blue-800 font-semibold mb-1">
                    Podrás editar o eliminar tu calificación
                  </p>
                  <p className="text-xs text-blue-600">
                    Tenés 30 minutos desde el envío para modificar o eliminar tu calificación
                  </p>
                </div>
              </div>
            </div>

            {/* Botón */}
            <button
              type="submit"
              disabled={submitting || score === 0 || (showWorkplaceSelector && !selectedWorkplace)}
              className="w-full bg-gradient-to-r from-yellow-400 to-orange-500 text-white font-bold py-4 rounded-2xl shadow-lg disabled:opacity-50 disabled:cursor-not-allowed transform transition-all duration-300 hover:scale-105 active:scale-95 animate-scaleIn delay-400 ripple text-lg"
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

      {/* Error modal con botón de login */}
      {errorModal && (
        <ErrorModal
          title={errorModal.title}
          message={errorModal.message}
          actionText={errorModal.actionText}
          onClose={() => {
            if (errorModal.onClose) {
              errorModal.onClose();
            } else {
              setErrorModal(null);
            }
          }}
          onAction={errorModal.onAction}
        />
      )}
    </div>
  );
}

export default RatingForm;