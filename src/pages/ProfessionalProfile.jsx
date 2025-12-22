import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Star, Briefcase, Award, ArrowLeft, Loader2, Search, X } from 'lucide-react';
import { getProfessionalProfile, getProfessionalRatings } from '../services/api.js';

function ProfessionalProfile() {
  const { professionalId } = useParams();
  const navigate = useNavigate();
  const [professional, setProfessional] = useState(null);
  const [ratings, setRatings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showWorkplaceSelector, setShowWorkplaceSelector] = useState(false);

  useEffect(() => {
    loadProfessionalData();
  }, [professionalId]);

  const loadProfessionalData = async () => {
    try {
      const [profileData, ratingsData] = await Promise.all([
        getProfessionalProfile(professionalId),
        getProfessionalRatings(professionalId)
      ]);
      setProfessional(profileData);
      setRatings(ratingsData);
    } catch (error) {
      console.error('Error loading professional:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRateClick = () => {
    // Filtrar solo trabajos activos
    const activeWorkplaces = professional.workHistory?.filter(work => work.isActive) || [];

    if (activeWorkplaces.length === 0) {
      // No tiene trabajos activos, ir directo sin workHistoryId
      navigate(`/rate-professional/${professionalId}`);
    } else if (activeWorkplaces.length === 1) {
      // Tiene 1 trabajo activo, ir directo con ese workHistoryId
      navigate(`/rate-professional/${professionalId}?workHistoryId=${activeWorkplaces[0].workHistoryId}`);
    } else {
      // Tiene múltiples trabajos activos, mostrar selector
      setShowWorkplaceSelector(true);
    }
  };

  const handleWorkplaceSelect = (workHistoryId) => {
    setShowWorkplaceSelector(false);
    navigate(`/rate-professional/${professionalId}?workHistoryId=${workHistoryId}`);
  };

  const getWorkplaceIcon = (businessName) => {
    const name = businessName?.toLowerCase() || '';
    if (name.includes('restaurant') || name.includes('parrilla')) return '🍽️';
    if (name.includes('bar')) return '🍺';
    if (name.includes('café') || name.includes('cafe')) return '☕';
    if (name.includes('hotel')) return '🏨';
    if (name.includes('catering')) return '📋';
    return '💼';
  };

  const renderStars = (score) => {
    const stars = [];
    
    for (let i = 0; i < 5; i++) {
      const diff = score - i;
      
      if (diff >= 1) {
        stars.push(
          <Star
            key={i}
            className="w-5 h-5 text-yellow-400 fill-yellow-400 transition-all duration-300"
          />
        );
      } else if (diff > 0 && diff < 1) {
        const percentage = Math.round(diff * 100);
        stars.push(
          <div key={i} className="relative inline-flex w-5 h-5">
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="w-5 h-5"
            >
              <defs>
                <linearGradient id={`grad-${i}`}>
                  <stop offset={`${percentage}%`} stopColor="#FBBF24" />
                  <stop offset={`${percentage}%`} stopColor="#D1D5DB" />
                </linearGradient>
              </defs>
              <polygon
                points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"
                fill={`url(#grad-${i})`}
                stroke="none"
              />
            </svg>
          </div>
        );
      } else {
        stars.push(
          <Star
            key={i}
            className="w-5 h-5 text-gray-300 transition-all duration-300"
          />
        );
      }
    }
    
    return stars;
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
          <p className="text-gray-600 mb-4">Profesional no encontrado</p>
          <button
            onClick={() => navigate('/')}
            className="bg-blue-500 text-white px-6 py-2 rounded-full hover:bg-blue-600 transition-all ripple"
          >
            Volver al inicio
          </button>
        </div>
      </div>
    );
  }

  const activeWorkplaces = professional.workHistory?.filter(work => work.isActive) || [];

  return (
    <div className="min-h-screen bg-gray-50 animate-fadeIn">
      {/* Navbar */}
      <nav className="bg-gradient-to-r from-blue-500 to-purple-600 px-4 py-4 animate-slideDown">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div 
            onClick={() => navigate('/')}
            className="text-xl font-bold text-white cursor-pointer hover:scale-105 transition-transform flex items-center gap-2"
          >
            <ArrowLeft className="w-5 h-5" />
            ProRate
          </div>
          
          <div className="flex gap-3">
            <button
              onClick={() => navigate('/search')}
              className="bg-white/20 hover:bg-white/30 text-white px-4 py-2 rounded-full font-semibold flex items-center gap-2 transition-all"
            >
              <Search className="w-4 h-4" />
              <span className="hidden sm:inline">Buscar</span>
            </button>
          </div>
        </div>
      </nav>

      {/* Header con perfil */}
      <div className="bg-gradient-to-br from-blue-500 to-purple-600 px-4 pt-6 pb-24">
        <div className="max-w-4xl mx-auto text-center">
          <div className="w-24 h-24 bg-white rounded-full mx-auto mb-4 flex items-center justify-center text-4xl font-bold text-purple-600 animate-scaleIn">
            {professional.professionalName.charAt(0)}
          </div>
          <h1 className="text-3xl font-bold text-white mb-2 animate-slideUp">
            {professional.professionalName}
          </h1>
          <div className="flex items-center justify-center mb-4 animate-slideUp delay-100">
            {renderStars(Math.round(professional.reputationScore))}
            <span className="ml-2 text-white font-semibold">
              {professional.reputationScore.toFixed(1)}
            </span>
          </div>
          <p className="text-white/90 animate-slideUp delay-200">
            {professional.totalRatings} {professional.totalRatings === 1 ? 'calificación' : 'calificaciones'}
          </p>
        </div>
      </div>

      {/* Contenido */}
      <div className="max-w-4xl mx-auto px-4 -mt-16">
        {/* Descripción */}
        {professional.description && (
          <div className="bg-white rounded-2xl shadow-lg p-6 mb-4 animate-slideUp hover-lift">
            <h2 className="text-lg font-bold text-gray-800 mb-3">Sobre mí</h2>
            <p className="text-gray-600">{professional.description}</p>
          </div>
        )}

        {/* Experiencias */}
        {professional.workHistory && professional.workHistory.length > 0 && (
          <div className="bg-white rounded-2xl shadow-lg p-6 mb-4 animate-slideUp delay-100 hover-lift">
            <h2 className="text-lg font-bold text-gray-800 mb-4 flex items-center">
              <Briefcase className="w-5 h-5 mr-2 text-purple-600" />
              Experiencia
            </h2>
            <div className="space-y-4">
              {professional.workHistory.map((exp, index) => (
                <div 
                  key={exp.workHistoryId} 
                  className="border-l-4 border-purple-600 pl-4 animate-slideUp"
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
                  <h3 className="font-semibold text-gray-800">{exp.position}</h3>
                  <p className="text-purple-600 font-medium">{exp.businessName}</p>
                  <p className="text-sm text-gray-500">
                    {exp.startDate} - {exp.endDate || 'Presente'}
                  </p>
                  {exp.isActive && (
                    <span className="inline-block mt-1 px-2 py-1 bg-green-100 text-green-700 text-xs rounded-full">
                      Activo
                    </span>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Botón para calificar */}
        <button
          onClick={handleRateClick}
          className="w-full bg-gradient-to-r from-yellow-400 to-orange-500 text-white font-bold py-4 rounded-2xl shadow-lg mb-4 flex items-center justify-center animate-scaleIn delay-200 hover-scale ripple"
        >
          <Star className="w-5 h-5 mr-2" />
          Calificar a {professional.professionalName.split(' ')[0]}
        </button>

        {/* Calificaciones recientes */}
        {ratings.length > 0 && (
          <div className="bg-white rounded-2xl shadow-lg p-6 mb-6 animate-slideUp delay-300 hover-lift">
            <h2 className="text-lg font-bold text-gray-800 mb-4 flex items-center">
              <Award className="w-5 h-5 mr-2 text-yellow-500" />
              Calificaciones Recientes
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
                  
                  {/* Mostrar workplace específico si existe */}
                  {rating.workplaceName ? (
                    <div className="flex items-start gap-1 text-xs text-purple-600 bg-purple-50 px-2 py-1 rounded-lg inline-block">
                      <Briefcase className="w-3 h-3 mt-0.5 flex-shrink-0" />
                      <span>
                        <span className="font-semibold">Calificado en:</span> {rating.workplaceName}
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
      </div>

      {/* Bottom Sheet - Selector de lugar de trabajo */}
      {showWorkplaceSelector && (
        <>
          {/* Overlay */}
          <div 
            className="fixed inset-0 bg-black bg-opacity-30 z-40 animate-fadeIn"
            onClick={() => setShowWorkplaceSelector(false)}
          />
          
          {/* Bottom Sheet */}
          <div className="fixed bottom-0 left-0 right-0 z-50 animate-slideUp">
            <div className="bg-white rounded-t-3xl shadow-2xl p-6 max-h-[80vh] overflow-y-auto">
              {/* Handle bar */}
              <div className="w-12 h-1 bg-gray-300 rounded-full mx-auto mb-4" />
              
              <div className="flex justify-between items-center mb-3">
                <h3 className="text-xl font-bold text-gray-800">¿Dónde te atendió?</h3>
                <button
                  onClick={() => setShowWorkplaceSelector(false)}
                  className="text-gray-500 hover:text-gray-700 p-2 hover:bg-gray-100 rounded-full transition-all"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              
              <p className="text-sm text-gray-500 mb-4">
                Seleccioná el lugar donde {professional.professionalName.split(' ')[0]} te atendió
              </p>
              
              <div className="space-y-3">
                {activeWorkplaces.map((work) => (
                  <button
                    key={work.workHistoryId}
                    onClick={() => handleWorkplaceSelect(work.workHistoryId)}
                    className="w-full text-left p-4 bg-gray-50 hover:bg-purple-50 rounded-2xl transition-all active:scale-95 border-2 border-transparent hover:border-purple-500"
                  >
                    <div className="flex items-center">
                      <span className="text-3xl mr-3">{getWorkplaceIcon(work.businessName)}</span>
                      <div className="flex-1">
                        <p className="font-bold text-gray-800">{work.businessName}</p>
                        <p className="text-sm text-gray-500">{work.position}</p>
                      </div>
                      <span className="text-purple-600">→</span>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

export default ProfessionalProfile;