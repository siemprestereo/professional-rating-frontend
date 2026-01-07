import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Loader2, Briefcase, GraduationCap, Award, Calendar, Star, ArrowLeft } from 'lucide-react';

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

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-16 h-16 text-white animate-spin mx-auto mb-4" />
          <p className="text-white text-xl font-light">Cargando CV...</p>
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

  return (
    <div className="min-h-screen bg-gray-50">
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
            <span className="ml-2 text-white font-semibold">
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
        
        {/* Descripción */}
        {cvData.description && (
          <div className="bg-white rounded-2xl shadow-lg p-6 mb-4">
            <h2 className="text-xl font-bold text-gray-800 mb-3">Sobre mí</h2>
            <p className="text-gray-600">{cvData.description}</p>
          </div>
        )}

        {/* Experiencia Laboral */}
        {cvData.workHistory && cvData.workHistory.length > 0 && (
          <div className="bg-white rounded-2xl shadow-lg p-6 mb-4">
            <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center">
              <Briefcase className="w-6 h-6 mr-2 text-purple-600" />
              Experiencia Laboral
            </h2>
            <div className="space-y-6">
              {cvData.workHistory.map((exp, index) => (
                <div key={index} className="border-l-4 border-purple-500 pl-4">
                  <h3 className="font-bold text-gray-800 text-lg">{exp.position}</h3>
                  <p className="text-purple-600 font-semibold">{exp.businessName}</p>
                  <div className="flex items-center text-sm text-gray-500 mt-1">
                    <Calendar className="w-4 h-4 mr-1" />
                    {formatDate(exp.startDate)} - {exp.isActive ? 'Presente' : formatDate(exp.endDate)}
                  </div>
                  {exp.description && (
                    <p className="text-gray-600 mt-2">{exp.description}</p>
                  )}
                  {exp.referenceContact && (
                    <p className="text-sm text-gray-500 mt-2">
                      📞 Referencia: {exp.referenceContact}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Call to Action */}
        <div className="bg-gradient-to-r from-green-500 to-teal-600 rounded-2xl shadow-lg p-6 text-center">
          <h3 className="text-white text-xl font-bold mb-2">
            ¿Te interesa contratar este profesional?
          </h3>
          <p className="text-white/90 mb-4">
            Contactá directamente al profesional para coordinar
          </p>
          {cvData.professionalEmail && (
            <a>
              href={`mailto:${cvData.professionalEmail}`}
              className="inline-block bg-white text-green-600 font-bold px-8 py-3 rounded-2xl hover:scale-105 transition-all"
            
              Enviar Email
            </a>
          )}
        </div>
      </div>
    </div>
  );
}

export default PublicCvView;