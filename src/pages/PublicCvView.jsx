import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Loader2, Briefcase, GraduationCap, Award, Star, ArrowLeft, ChevronRight } from 'lucide-react';

function PublicCvView() {
  const { professionalId } = useParams();
  const navigate = useNavigate();
  const backendUrl = 'https://professional-rating-backend-production.up.railway.app';
  
  const [cvData, setCvData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadPublicCV();
  }, [professionalId]);

  const loadPublicCV = async () => {
    try {
      const response = await fetch(`${backendUrl}/api/cv/professional/${professionalId}`);

      if (!response.ok) {
        throw new Error('CV no encontrado');
      }

      const data = await response.json();
      console.log('✅ CV público cargado:', data);
      setCvData(data);
      
    } catch (error) {
      console.error('Error loading public CV:', error);
      setError('No se pudo cargar el CV');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'Presente';
    const date = new Date(dateString);
    return date.toLocaleDateString('es-AR', { month: 'short', year: 'numeric' });
  };

  const renderStars = (score) => {
    return [...Array(5)].map((_, i) => (
      <Star
        key={i}
        className={`w-5 h-5 ${i < Math.round(score) ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'}`}
      />
    ));
  };

  const handleWorkClick = (workHistoryId) => {
    console.log('🔍 Click en trabajo, navegando a ratings con workHistoryId:', workHistoryId);
    navigate(`/ratings-history?workHistoryId=${workHistoryId}`);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-16 h-16 text-white animate-spin mx-auto mb-4" />
          <p className="text-white text-xl font-light">Cargando C.V...</p>
        </div>
      </div>
    );
  }

  if (error || !cvData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center p-4">
        <div className="bg-white rounded-3xl p-8 text-center max-w-md">
          <div className="w-16 h-16 bg-red-100 rounded-full mx-auto mb-4 flex items-center justify-center">
            <span className="text-3xl">❌</span>
          </div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">CV no encontrado</h2>
          <p className="text-gray-600 mb-6">
            El CV que buscás no existe o ya no está disponible
          </p>
          <button
            onClick={() => navigate('/')}
            className="bg-blue-500 text-white px-6 py-3 rounded-2xl font-semibold hover:bg-blue-600 transition-all"
          >
            Volver al inicio
          </button>
        </div>
      </div>
    );
  }

  // Separar trabajos por tipo y estado
  const freelanceActive = (cvData.workHistory || []).filter(w => w.isFreelance && w.isActive);
  const employeeActive = (cvData.workHistory || []).filter(w => !w.isFreelance && w.isActive);
  const pastJobs = (cvData.workHistory || []).filter(w => !w.isActive);

  console.log('📊 Trabajos separados:', {
    freelanceActive,
    employeeActive,
    pastJobs
  });

  return (
    <div className="min-h-screen bg-gray-50 pb-8">
      {/* Navbar simple */}
      <nav className="bg-gradient-to-r from-blue-500 to-purple-600 px-4 py-4">
        <div className="max-w-4xl mx-auto flex items-center">
          <button 
            onClick={() => navigate('/')}
            className="flex items-center text-white hover:text-white/80 transition-colors"
          >
            <ArrowLeft className="w-5 h-5 mr-2" />
            <span className="font-semibold">Volver</span>
          </button>
        </div>
      </nav>

      {/* Header */}
      <div className="bg-gradient-to-br from-blue-500 to-purple-600 px-4 pt-6 pb-24">
        <div className="max-w-4xl mx-auto text-center">
          <div className="w-24 h-24 bg-white rounded-full mx-auto mb-4 flex items-center justify-center text-4xl font-bold text-purple-600">
            {cvData.professionalName?.charAt(0) || 'P'}
          </div>
          <h1 className="text-3xl font-bold text-white mb-2">
            {cvData.professionalName}
          </h1>
          {cvData.professionType && (
            <p className="text-white/90 text-lg mb-4">
              {cvData.professionType}
            </p>
          )}
          
          {/* Reputación */}
          <div className="flex items-center justify-center mb-2">
            {renderStars(cvData.reputationScore || 0)}
            <span className="ml-2 text-white font-semibold text-lg">
              {(cvData.reputationScore || 0).toFixed(1)}
            </span>
          </div>
          <p className="text-white/80 text-sm">
            {cvData.totalRatings || 0} {cvData.totalRatings === 1 ? 'calificación' : 'calificaciones'}
          </p>
        </div>
      </div>

      {/* Contenido */}
      <div className="max-w-4xl mx-auto px-4 -mt-16 pb-8">
        
        {/* Información de Contacto */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-4 animate-slideUp">
          <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center">
            <span className="text-2xl mr-2">📞</span>
            Contacto
          </h2>
          
          <div className="space-y-3">
            {/* Email */}
            {cvData.professionalEmail && (
              <a
                href={`mailto:${cvData.professionalEmail}`}
                className="flex items-center gap-3 p-4 border-2 border-gray-200 rounded-xl hover:bg-blue-50 hover:border-blue-400 transition-all group"
              >
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center group-hover:bg-blue-200 transition-colors">
                  <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                </div>
                <div className="flex-1">
                  <p className="text-xs text-gray-500 font-semibold">Email</p>
                  <p className="font-semibold text-gray-800 group-hover:text-blue-600 transition-colors">
                    {cvData.professionalEmail}
                  </p>
                </div>
                <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-blue-600 group-hover:translate-x-1 transition-all" />
              </a>
            )}

            {/* Teléfono / WhatsApp */}
            {cvData.professionalPhone && (
              <a
                href={`https://wa.me/${cvData.professionalPhone.replace(/[^0-9]/g, '')}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-3 p-4 border-2 border-gray-200 rounded-xl hover:bg-green-50 hover:border-green-400 transition-all group"
              >
                <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center group-hover:bg-green-200 transition-colors">
                  <svg className="w-6 h-6 text-green-600" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
                  </svg>
                </div>
                <div className="flex-1">
                  <p className="text-xs text-gray-500 font-semibold">WhatsApp</p>
                  <p className="font-semibold text-gray-800 group-hover:text-green-600 transition-colors">
                    {cvData.professionalPhone}
                  </p>
                </div>
                <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-green-600 group-hover:translate-x-1 transition-all" />
              </a>
            )}

            {/* Ubicación */}
            {cvData.professionalLocation && (
              <div className="flex items-center gap-3 p-4 border-2 border-gray-200 rounded-xl">
                <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
                  <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                </div>
                <div className="flex-1">
                  <p className="text-xs text-gray-500 font-semibold">Ubicación</p>
                  <p className="font-semibold text-gray-800">{cvData.professionalLocation}</p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Descripción */}
        {cvData.description && (
          <div className="bg-white rounded-2xl shadow-lg p-6 mb-4 animate-slideUp">
            <h2 className="text-xl font-bold text-gray-800 mb-3">Sobre mí</h2>
            <p className="text-gray-600">{cvData.description}</p>
          </div>
        )}

        {/* Botón Ver Estadísticas */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-4 animate-slideUp">
          <button
            onClick={() => navigate(`/stats-public/${professionalId}`)}
            className="w-full bg-gradient-to-r from-purple-500 to-pink-600 text-white font-bold py-4 px-6 rounded-xl hover:scale-105 transition-all flex items-center justify-center gap-3 shadow-lg"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
            <span className="text-lg">Ver Estadísticas Detalladas</span>
          </button>
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
                  onClick={() => handleWorkClick(work.workHistoryId)}
                  className="border-2 border-purple-200 rounded-xl p-4 cursor-pointer hover:bg-purple-50 hover:border-purple-400 transition-all group"
                >
                  <div className="flex items-center gap-2">
                    <ChevronRight className="w-5 h-5 text-purple-600 group-hover:translate-x-1 transition-transform" />
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <p className="font-bold text-gray-800 text-lg">
                          {work.position || work.businessName || 'Autónomo'}
                        </p>
                        <span className="bg-purple-100 text-purple-700 text-xs font-semibold px-2 py-1 rounded-full">
                          Autónomo
                        </span>
                      </div>
                      {work.businessName && work.position && (
                        <p className="text-purple-600 font-semibold">{work.businessName}</p>
                      )}
                      <p className="text-sm text-gray-500">
                        📅 {formatDate(work.startDate)} - Presente
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TRABAJOS ACTUALES */}
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
                  onClick={() => handleWorkClick(work.workHistoryId)}
                  className="border-2 border-blue-200 rounded-xl p-4 cursor-pointer hover:bg-blue-50 hover:border-blue-400 transition-all group"
                >
                  <div className="flex items-center gap-2">
                    <ChevronRight className="w-5 h-5 text-blue-600 group-hover:translate-x-1 transition-transform" />
                    <div>
                      <p className="font-bold text-gray-800 text-lg">{work.position}</p>
                      <p className="text-blue-600 font-semibold">{work.businessName}</p>
                      <p className="text-sm text-gray-500">
                        📅 {formatDate(work.startDate)} - Presente
                      </p>
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
                  onClick={() => handleWorkClick(work.workHistoryId)}
                  className="border-2 border-gray-200 rounded-xl p-4 cursor-pointer hover:bg-gray-50 hover:border-gray-400 transition-all group"
                >
                  <div className="flex items-center gap-2">
                    <ChevronRight className="w-5 h-5 text-gray-600 group-hover:translate-x-1 transition-transform" />
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <p className="font-bold text-gray-800 text-lg">{work.position}</p>
                        {work.isFreelance && (
                          <span className="bg-gray-200 text-gray-700 text-xs font-semibold px-2 py-1 rounded-full">
                            Autónomo
                          </span>
                        )}
                      </div>
                      <p className="text-gray-600 font-semibold">{work.businessName}</p>
                      <p className="text-sm text-gray-500">
                        📅 {formatDate(work.startDate)} - {formatDate(work.endDate)}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Educación */}
        {cvData.education && cvData.education.length > 0 && (
          <div className="bg-white rounded-2xl shadow-lg p-6 mb-4 animate-slideUp delay-150">
            <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center">
              <GraduationCap className="w-6 h-6 mr-2 text-purple-600" />
              Educación
            </h2>
            <div className="space-y-4">
              {cvData.education.map((edu, index) => (
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
        {cvData.certifications && cvData.certifications.length > 0 && (
          <div className="bg-white rounded-2xl shadow-lg p-6 mb-4 animate-slideUp delay-200">
            <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center">
              <Award className="w-6 h-6 mr-2 text-purple-600" />
              Certificaciones
            </h2>
            <div className="space-y-4">
              {cvData.certifications.map((cert, index) => (
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
      </div>
    </div>
  );
}

export default PublicCvView;