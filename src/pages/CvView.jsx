import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Star, Briefcase, GraduationCap, Award, Loader2, Home, ChevronRight, Search } from 'lucide-react';
import ShareModal from '../components/ShareModal';
import LoadingScreen from '../components/LoadingScreen';

function CvView() {
  const navigate = useNavigate();
  const { professionalId } = useParams();
  const backendUrl = 'https://professional-rating-backend-production.up.railway.app';
  
  const [cv, setCv] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showShareModal, setShowShareModal] = useState(false);
  const [isSearchable, setIsSearchable] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    loadCv();
    loadSearchableStatus();
  }, [professionalId]);

  const loadCv = async () => {
    try {
      const token = localStorage.getItem('authToken');
      const professional = JSON.parse(localStorage.getItem('professional'));
      
      if (!professional && !professionalId) {
        navigate('/professional-login');
        return;
      }

      const idToLoad = professionalId || professional?.id;
      
      const response = await fetch(`${backendUrl}/api/cv/professional/${idToLoad}`, {
        headers: token ? { 'Authorization': `Bearer ${token}` } : {}
      });

      if (response.ok) {
        const data = await response.json();
        console.log('✅ CV cargado:', data);
        setCv(data);
      } else {
        throw new Error('No se pudo cargar el CV');
      }
    } catch (error) {
      console.error('Error loading CV:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadSearchableStatus = async () => {
    try {
      const token = localStorage.getItem('authToken');
      
      if (!token) return;

      const response = await fetch(
        `${backendUrl}/api/professionals/me/searchable-status`,
        {
          headers: { 'Authorization': `Bearer ${token}` }
        }
      );

      if (response.ok) {
        const data = await response.json();
        setIsSearchable(data.searchable);
      }
    } catch (error) {
      console.error('Error loading searchable status:', error);
    }
  };

  const toggleSearchable = async () => {
    try {
      setIsAnimating(true);
      const token = localStorage.getItem('authToken');
      
      if (!token) return;

      const response = await fetch(
        `${backendUrl}/api/professionals/me/searchable`,
        {
          method: 'PUT',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ searchable: !isSearchable })
        }
      );

      if (response.ok) {
        setIsSearchable(!isSearchable);
      }
    } catch (error) {
      console.error('Error toggling searchable:', error);
    } finally {
      setTimeout(() => setIsAnimating(false), 300);
    }
  };

  const renderStars = (score) => {
    return [...Array(5)].map((_, i) => (
      <Star
        key={i}
        className={`w-5 h-5 ${i < score ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'}`}
      />
    ));
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    return date.toLocaleDateString('es-AR', { month: 'short', year: 'numeric' });
  };

  const translateProfession = (type) => {
    const translations = {
      'WAITER': 'Mozo',
      'ELECTRICIAN': 'Electricista',
      'PAINTER': 'Pintor',
      'HAIRDRESSER': 'Peluquero',
      'PLUMBER': 'Plomero',
      'CARPENTER': 'Carpintero',
      'MECHANIC': 'Mecánico',
      'CHEF': 'Chef',
      'BARISTA': 'Barista',
      'BARTENDER': 'Bartender',
      'CLEANER': 'Personal de limpieza',
      'GARDENER': 'Jardinero',
      'DRIVER': 'Conductor',
      'SECURITY': 'Seguridad',
      'RECEPTIONIST': 'Recepcionista'
    };
    return translations[type] || type;
  };

  const handleWorkClick = (workHistoryId, businessName) => {
    console.log('🔍 Click en trabajo:', { workHistoryId, businessName });
    navigate(`/ratings-history?workHistoryId=${workHistoryId}`);
  };

  if (loading) {
  return <LoadingScreen />;
}

  if (!cv) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p className="text-gray-600">No se pudo cargar el CV</p>
      </div>
    );
  }

  // Separar trabajos por tipo y estado
  const freelanceActive = (cv.workHistory || []).filter(w => w.isFreelance && w.isActive);
  const employeeActive = (cv.workHistory || []).filter(w => !w.isFreelance && w.isActive);
  const pastJobs = (cv.workHistory || []).filter(w => !w.isActive);

  return (
    <div className="min-h-screen bg-gray-50 animate-fadeIn pb-24">
      {/* Header */}
      <div className="bg-gradient-to-br from-blue-500 to-purple-600 px-4 pt-8 pb-24">
        <div className="max-w-4xl mx-auto text-center">
          {/* Área clickeable: Avatar + Nombre → /my-profile */}
          <button 
            onClick={() => navigate('/my-profile')}
            className="w-full hover:opacity-90 transition-opacity focus:outline-none"
          >
            <div className="w-24 h-24 bg-white rounded-full mx-auto mb-4 flex items-center justify-center text-4xl font-bold text-purple-600 animate-scaleIn">
              {cv.professionalName.charAt(0)}
            </div>
            <h1 className="text-3xl font-bold text-white mb-2 animate-slideUp">
              {cv.professionalName}
            </h1>
            {cv.professionType && (
              <p className="text-white/90 text-lg mb-4 animate-slideUp">
                {translateProfession(cv.professionType)}
              </p>
            )}
          </button>

          {/* Área clickeable: Estrellas + Calificaciones → /stats */}
          <button 
            onClick={() => navigate('/stats')}
            className="w-full hover:opacity-90 transition-opacity focus:outline-none"
          >
            <div className="flex items-center justify-center mb-2 animate-slideUp delay-100">
              {renderStars(Math.round(cv.reputationScore || 0))}
              <span className="ml-2 text-white font-semibold text-lg">
                {(cv.reputationScore || 0).toFixed(1)}
              </span>
            </div>
            <p className="text-white/90 animate-slideUp delay-200">
              {cv.totalRatings || 0} calificaciones
            </p>
          </button>
        </div>
      </div>

      {/* Contenido */}
      <div className="max-w-4xl mx-auto px-4 -mt-16 pb-8">
        
        {/* SearchableToggle */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-4 animate-slideUp">
          {/* Header centrado */}
          <div className="flex items-center justify-center mb-4">
            <Search className="w-6 h-6 text-purple-600 mr-2" />
            <h2 className="text-xl font-bold text-gray-800">
              Visibilidad en Búsquedas
            </h2>
          </div>

          {/* Toggle centrado */}
          <div className="flex items-center justify-center">
            <button
              onClick={toggleSearchable}
              disabled={isAnimating}
              className={`
                relative w-20 h-10 rounded-full transition-all duration-300 ease-in-out
                ${isSearchable ? 'bg-green-500' : 'bg-gray-300'}
                ${isAnimating ? 'opacity-50' : 'hover:opacity-90'}
                focus:outline-none focus:ring-4 focus:ring-purple-300
              `}
            >
              <span
                className={`
                  absolute top-1 left-1 w-8 h-8 bg-white rounded-full shadow-md
                  transition-transform duration-300 ease-in-out
                  flex items-center justify-center
                  ${isSearchable ? 'translate-x-10' : 'translate-x-0'}
                `}
              >
                <Search className={`w-4 h-4 transition-colors duration-300 ${
                  isSearchable ? 'text-green-500' : 'text-gray-400'
                }`} />
              </span>
            </button>
          </div>

          {/* Texto descriptivo centrado */}
          <p className="text-center text-sm text-gray-600 mt-4">
            {isSearchable 
              ? '✅ Tu perfil es visible en búsquedas de clientes' 
              : '🔒 Tu perfil está oculto de las búsquedas'}
          </p>
        </div>

        {/* TRABAJO AUTÓNOMO ACTUAL */}
        {freelanceActive.length > 0 && (
          <div className="bg-white rounded-2xl shadow-lg p-6 mb-4 animate-slideUp">
            <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center">
              <span className="text-2xl mr-2">💼</span>
              Trabajo Autónomo Actual
            </h2>
            <div className="space-y-2">
              {freelanceActive.map((work) => (
                <div
                  key={work.workHistoryId}
                  onClick={() => handleWorkClick(work.workHistoryId, work.businessName)}
                  className="border-2 border-purple-200 rounded-xl p-4 cursor-pointer hover:bg-purple-50 hover:border-purple-400 transition-all group"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <ChevronRight className="w-5 h-5 text-purple-600 group-hover:translate-x-1 transition-transform" />
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <p className="font-bold text-gray-800 text-lg">
                              {work.position}
                            </p>
                            <span className="bg-purple-100 text-purple-700 text-xs font-semibold px-2 py-1 rounded-full">
                              Autónomo
                            </span>
                          </div>
                          {work.businessName && work.businessName !== 'Autónomo' && (
                            <p className="text-purple-600 font-semibold">
                              {work.businessName}
                            </p>
                          )}
                          <p className="text-sm text-gray-500">
                            📅 {formatDate(work.startDate)} - Presente
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TRABAJOS ACTUALES (Relación de dependencia) */}
        {employeeActive.length > 0 && (
          <div className="bg-white rounded-2xl shadow-lg p-6 mb-4 animate-slideUp delay-50">
            <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center">
              <span className="text-2xl mr-2">🏢</span>
              Trabajos Actuales
            </h2>
            <div className="space-y-2">
              {employeeActive.map((work) => (
                <div
                  key={work.workHistoryId}
                  onClick={() => handleWorkClick(work.workHistoryId, work.businessName)}
                  className="border-2 border-blue-200 rounded-xl p-4 cursor-pointer hover:bg-blue-50 hover:border-blue-400 transition-all group"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <ChevronRight className="w-5 h-5 text-blue-600 group-hover:translate-x-1 transition-transform" />
                        <div>
                          <p className="font-bold text-gray-800 text-lg">
                            {work.position}
                          </p>
                          <p className="text-blue-600 font-semibold">
                            {work.businessName}
                          </p>
                          <p className="text-sm text-gray-500">
                            📅 {formatDate(work.startDate)} - Presente
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* EXPERIENCIAS PASADAS */}
        {pastJobs.length > 0 && (
          <div className="bg-white rounded-2xl shadow-lg p-6 mb-4 animate-slideUp delay-100">
            <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center">
              <span className="text-2xl mr-2">📋</span>
              Experiencias Laborales Pasadas
            </h2>
            <div className="space-y-2">
              {pastJobs.map((work) => (
                <div
                  key={work.workHistoryId}
                  onClick={() => handleWorkClick(work.workHistoryId, work.businessName)}
                  className="border-2 border-gray-200 rounded-xl p-4 cursor-pointer hover:bg-gray-50 hover:border-gray-400 transition-all group"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <ChevronRight className="w-5 h-5 text-gray-600 group-hover:translate-x-1 transition-transform" />
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <p className="font-bold text-gray-800 text-lg">
                              {work.position}
                            </p>
                            {work.isFreelance && (
                              <span className="bg-gray-200 text-gray-700 text-xs font-semibold px-2 py-1 rounded-full">
                                Autónomo
                              </span>
                            )}
                          </div>
                          <p className="text-gray-600 font-semibold">
                            {work.businessName}
                          </p>
                          <p className="text-sm text-gray-500">
                            📅 {formatDate(work.startDate)} - {formatDate(work.endDate)}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Educación */}
        {cv.education && cv.education.length > 0 && (
          <div className="bg-white rounded-2xl shadow-lg p-6 mb-4 animate-slideUp delay-150">
            <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center">
              <GraduationCap className="w-6 h-6 mr-2 text-purple-600" />
              Educación
            </h2>
            <div className="space-y-4">
              {cv.education.map((edu, index) => (
                <div key={index} className="border-l-4 border-purple-600 pl-4">
                  <p className="font-bold text-gray-800">{edu.degree}</p>
                  <p className="text-purple-600">{edu.institution}</p>
                  <p className="text-sm text-gray-500">
                    {formatDate(edu.startDate)} - {edu.currentlyStudying ? 'Presente' : formatDate(edu.endDate)}
                  </p>
                  {edu.description && (
                    <p className="text-gray-600 mt-2 text-sm">{edu.description}</p>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Certificaciones */}
        {cv.certifications && cv.certifications.length > 0 && (
          <div className="bg-white rounded-2xl shadow-lg p-6 mb-4 animate-slideUp delay-200">
            <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center">
              <Award className="w-6 h-6 mr-2 text-purple-600" />
              Certificaciones
            </h2>
            <div className="space-y-4">
              {cv.certifications.map((cert, index) => (
                <div key={index} className="border-l-4 border-green-500 pl-4">
                  <p className="font-bold text-gray-800">{cert.name}</p>
                  <p className="text-green-600">{cert.issuer}</p>
                  <p className="text-sm text-gray-500">
                    Obtenida: {formatDate(cert.dateObtained)}
                    {cert.expiryDate && ` | Expira: ${formatDate(cert.expiryDate)}`}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Botones de acción - 3 botones en fila */}
        <div className="grid grid-cols-3 gap-3 mb-4">
          <button
            onClick={() => navigate('/edit-cv')}
            className="bg-white rounded-2xl shadow-lg p-4 text-center hover-lift cursor-pointer"
          >
            <Briefcase className="w-6 h-6 text-purple-600 mx-auto mb-2" />
            <p className="font-semibold text-gray-800 text-sm">Editar CV</p>
          </button>

          <button
            onClick={() => setShowShareModal(true)}
            className="bg-white rounded-2xl shadow-lg p-4 text-center hover-lift cursor-pointer"
          >
            <svg className="w-6 h-6 text-green-600 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
            </svg>
            <p className="font-semibold text-gray-800 text-sm">Compartir CV</p>
          </button>

          <button
            onClick={() => window.open(`${backendUrl}/api/cv/${cv.professionalId}/download-pdf`, '_blank')}
            className="bg-white rounded-2xl shadow-lg p-4 text-center hover-lift cursor-pointer"
          >
            <svg className="w-6 h-6 text-blue-600 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M9 19l3 3m0 0l3-3m-3 3V10" />
            </svg>
            <p className="font-semibold text-gray-800 text-sm">Descargar CV en PDF</p>
          </button>
        </div>
      </div>

      {/* Botón Home flotante */}
      <div className="fixed bottom-4 left-0 right-0 flex justify-center z-50 animate-slideUp">
        <button 
          onClick={() => navigate('/professional-dashboard')}
          className="w-14 h-14 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 rounded-full flex items-center justify-center transition-all hover:scale-110 shadow-2xl border-4 border-white"
          aria-label="Volver al inicio"
        >
          <Home className="w-7 h-7 text-white" />
        </button>
      </div>

      {/* Modal de compartir */}
      {showShareModal && (
        <ShareModal
          professionalId={cv.professionalId}
          professionalName={cv.professionalName}
          onClose={() => setShowShareModal(false)}
        />
      )}
    </div>
  );
}

export default CvView;