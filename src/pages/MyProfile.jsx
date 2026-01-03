import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Star, Briefcase, Award, ArrowLeft, Loader2, Edit, FileText } from 'lucide-react';

function MyProfile() {
  const navigate = useNavigate();
  const [professional, setProfessional] = useState(null);
  const [ratings, setRatings] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadMyProfile();
  }, []);

  const loadMyProfile = async () => {
    // Intentar cargar desde localStorage primero
    const savedData = localStorage.getItem('professional');
    if (savedData) {
      const data = JSON.parse(savedData);
      setProfessional(data);
      loadRatings(data.id);
      setLoading(false);
      return;
    }

    // Si no hay datos en localStorage, cargar desde el backend
      console.log('No hay datos de sesión, redirigiendo al login');
  navigate('/professional-login');
  setLoading(false);
};

  const loadRatings = async (professionalId) => {
    try {
      const backendUrl = 'https://professional-rating-backend-production.up.railway.app';
      const response = await fetch(`${backendUrl}/api/ratings/professional/${professionalId}`, {
        credentials: 'include'
      });

      if (response.ok) {
        const data = await response.json();
        setRatings(data);
      }
    } catch (error) {
      console.error('Error loading ratings:', error);
    }
  };

  const renderStars = (score) => {
    return [...Array(5)].map((_, i) => (
      <Star
        key={i}
        className={`w-5 h-5 transition-all duration-300 ${i < score ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'}`}
      />
    ));
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center animate-fadeIn">
        <div className="text-center">
          <Loader2 className="w-16 h-16 text-white animate-spin mx-auto mb-4" />
          <p className="text-white text-xl">Cargando perfil...</p>
        </div>
      </div>
    );
  }

  if (!professional) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center p-4 animate-fadeIn">
        <div className="bg-white rounded-2xl p-8 text-center animate-scaleIn">
          <p className="text-gray-600 mb-4">No se pudo cargar tu perfil</p>
          <button
            onClick={() => navigate('/dashboard')}
            className="bg-blue-500 text-white px-6 py-2 rounded-full hover:bg-blue-600 transition-all ripple"
          >
            Volver al panel principal
          </button>
        </div>
      </div>
    );
  }

  const reputationScore = professional.reputationScore || professional.averageRating || 0;
  const totalRatings = professional.totalRatings || 0;
  const professionalName = professional.name || professional.professionalName || 'Mi Perfil';

  return (
    <div className="min-h-screen bg-gray-50 animate-fadeIn">
      {/* Navbar */}
      <nav className="bg-gradient-to-r from-blue-500 to-purple-600 px-4 py-4 animate-slideDown">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div 
            onClick={() => navigate('/dashboard')}
            className="text-xl font-bold text-white cursor-pointer hover:scale-105 transition-transform flex items-center gap-2"
          >
            <ArrowLeft className="w-5 h-5" />
            Volver al Dashboard
          </div>
        </div>
      </nav>

      {/* Header con perfil */}
      <div className="bg-gradient-to-br from-blue-500 to-purple-600 px-4 pt-6 pb-24">
        <div className="max-w-4xl mx-auto text-center">
          <div className="w-24 h-24 bg-white rounded-full mx-auto mb-4 flex items-center justify-center text-4xl font-bold text-purple-600 animate-scaleIn">
            {professionalName.charAt(0)}
          </div>
          <h1 className="text-3xl font-bold text-white mb-2 animate-slideUp">
            {professionalName}
          </h1>
          <div className="flex items-center justify-center mb-4 animate-slideUp delay-100">
            {renderStars(Math.round(reputationScore))}
            <span className="ml-2 text-white font-semibold">
              {reputationScore.toFixed(1)}
            </span>
          </div>
          <p className="text-white/90 animate-slideUp delay-200">
            {totalRatings} {totalRatings === 1 ? 'calificación' : 'calificaciones'}
          </p>
        </div>
      </div>

      {/* Contenido */}
      <div className="max-w-4xl mx-auto px-4 -mt-16">
        {/* Acciones de edición */}
        <div className="grid grid-cols-2 gap-4 mb-4">
          <button
            onClick={() => navigate('/edit-profile')}
            className="bg-white rounded-2xl shadow-lg p-6 text-center animate-slideUp hover-lift"
          >
            <Edit className="w-8 h-8 text-blue-600 mx-auto mb-2" />
            <p className="font-semibold text-gray-800">Editar Perfil</p>
          </button>

          <button
            onClick={() => navigate('/edit-cv')}
            className="bg-white rounded-2xl shadow-lg p-6 text-center animate-slideUp delay-100 hover-lift"
          >
            <FileText className="w-8 h-8 text-purple-600 mx-auto mb-2" />
            <p className="font-semibold text-gray-800">Editar CV</p>
          </button>
        </div>

        {/* Información del perfil */}
        {professional.professionalTitle && (
          <div className="bg-white rounded-2xl shadow-lg p-6 mb-4 animate-slideUp delay-200 hover-lift">
            <h2 className="text-lg font-bold text-gray-800 mb-3">Título Profesional</h2>
            <p className="text-gray-600">{professional.professionalTitle}</p>
          </div>
        )}

        {professional.phone && (
          <div className="bg-white rounded-2xl shadow-lg p-6 mb-4 animate-slideUp delay-250 hover-lift">
            <h2 className="text-lg font-bold text-gray-800 mb-3">Contacto</h2>
            <p className="text-gray-600">📞 {professional.phone}</p>
            {professional.location && (
              <p className="text-gray-600 mt-2">📍 {professional.location}</p>
            )}
          </div>
        )}

        {/* Calificaciones recientes */}
        {ratings.length > 0 && (
          <div className="bg-white rounded-2xl shadow-lg p-6 mb-6 animate-slideUp delay-300 hover-lift">
            <h2 className="text-lg font-bold text-gray-800 mb-4 flex items-center">
              <Award className="w-5 h-5 mr-2 text-yellow-500" />
              Mis Calificaciones Recientes
            </h2>
            <div className="space-y-4">
              {ratings.slice(0, 5).map((rating, index) => (
                <div 
                  key={rating.id} 
                  className="border-b border-gray-100 pb-4 last:border-0 animate-slideUp"
                  style={{ animationDelay: `${(index + 4) * 0.1}s` }}
                >
                  <div className="flex items-center mb-2">
                    {renderStars(rating.score)}
                    <span className="ml-2 text-sm text-gray-500">
                      {new Date(rating.createdAt).toLocaleDateString('es-AR')}
                    </span>
                  </div>
                  {rating.comment && (
                    <p className="text-gray-600 text-sm mb-2">{rating.comment}</p>
                  )}
                  
                  {rating.workplaceName ? (
                    <div className="flex items-start gap-1 text-xs text-purple-600 bg-purple-50 px-2 py-1 rounded-lg inline-block">
                      <Briefcase className="w-3 h-3 mt-0.5 flex-shrink-0" />
                      <span>
                        <span className="font-semibold">En:</span> {rating.workplaceName}
                        {rating.workplacePosition && ` (${rating.workplacePosition})`}
                      </span>
                    </div>
                  ) : (
                    <p className="text-xs text-gray-400">
                      {rating.businessName}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {ratings.length === 0 && (
          <div className="bg-white rounded-2xl shadow-lg p-6 mb-6 text-center animate-slideUp delay-300 hover-lift">
            <Award className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500">Aún no tenés calificaciones</p>
            <p className="text-sm text-gray-400 mt-2">
              Compartí tu perfil con clientes para recibir calificaciones
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

export default MyProfile;