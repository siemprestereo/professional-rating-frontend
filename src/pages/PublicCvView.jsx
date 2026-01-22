import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { GraduationCap, Award, Star, ChevronRight, Home } from 'lucide-react';
import LoadingScreen from '../components/LoadingScreen';

function PublicCvView() {
  const { professionalId } = useParams();
  const navigate = useNavigate();
  const backendUrl = 'https://professional-rating-backend-production.up.railway.app';
  
  const [cvData, setCvData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Es buena práctica verificar si el ID existe antes de llamar a la API
    if (professionalId) {
      loadPublicCV();
    }
  }, [professionalId]);

  const loadPublicCV = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${backendUrl}/api/cv/professional/${professionalId}`);

      if (!response.ok) {
        throw new Error('CV no encontrado');
      }

      const data = await response.json();
      setCvData(data);
      
    } catch (error) {
      console.error('Error loading public CV:', error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'Presente';
    const date = new Date(dateString);
    return date.toLocaleDateString('es-AR', { month: 'short', year: 'numeric' });
  };

  const translateProfession = (type) => {
    const translations = {
      'WAITER': 'Mozo', 'ELECTRICIAN': 'Electricista', 'PAINTER': 'Pintor',
      'HAIRDRESSER': 'Peluquero', 'PLUMBER': 'Plomero', 'CARPENTER': 'Carpintero',
      'MECHANIC': 'Mecánico', 'CHEF': 'Chef', 'BARISTA': 'Barista',
      'BARTENDER': 'Bartender', 'CLEANER': 'Personal de limpieza',
      'GARDENER': 'Jardinero', 'DRIVER': 'Conductor', 'SECURITY': 'Seguridad',
      'RECEPTIONIST': 'Recepcionista'
    };
    return translations[type] || type;
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
    navigate(`/ratings-history?workHistoryId=${workHistoryId}`);
  };

  const handleHomeClick = () => {
    // Si estás en React, lo ideal es usar navigate o un link interno si es posible
    window.location.href = 'https://professional-rating-frontend.vercel.app/';
  };

  if (loading) return <LoadingScreen message="Cargando CV..." />;

  if (error || !cvData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center p-4">
        <div className="bg-white rounded-3xl p-8 text-center max-w-md shadow-2xl">
          <div className="w-16 h-16 bg-red-100 rounded-full mx-auto mb-4 flex items-center justify-center text-red-600">
            <span className="text-3xl">×</span>
          </div>
          <h2 className="text-2xl font-light text-gray-800 mb-2">CV no encontrado</h2>
          <p className="text-gray-600 mb-6">El perfil que buscas no existe o no es público.</p>
          <button onClick={handleHomeClick} className="bg-blue-500 text-white px-6 py-3 rounded-2xl font-semibold hover:bg-blue-600 transition-all">
            Volver al inicio
          </button>
        </div>
      </div>
    );
  }

  const freelanceActive = (cvData.workHistory || []).filter(w => w.isFreelance && w.isActive);
  const employeeActive = (cvData.workHistory || []).filter(w => !w.isFreelance && w.isActive);
  const pastJobs = (cvData.workHistory || []).filter(w => !w.isActive);

  return (
    <div className="min-h-screen bg-gray-50 pb-24">
      {/* HEADER */}
      <div className="bg-gradient-to-br from-blue-500 to-purple-600 px-4 py-12">
        <div className="max-w-4xl mx-auto text-center">
          <div className="w-24 h-24 bg-white rounded-full mx-auto mb-4 flex items-center justify-center text-4xl font-bold text-purple-600 shadow-xl">
            {cvData.professionalName?.charAt(0) || 'P'}
          </div>
          <h1 className="text-3xl font-light text-white mb-2">{cvData.professionalName}</h1>
          <p className="text-white/90 text-lg mb-4">{translateProfession(cvData.professionType)}</p>
          <div className="flex items-center justify-center gap-2">
            {renderStars(cvData.reputationScore || 0)}
            <span className="text-white font-bold">{(cvData.reputationScore || 0).toFixed(1)}</span>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 -mt-10 pb-8 space-y-4">
        {/* CONTACTO CORREGIDO */}
        <div className="bg-white rounded-2xl shadow-lg p-6">
          <h2 className="text-xl font-light text-gray-800 mb-4 flex items-center gap-2"><span>📞</span> Contacto</h2>
          <div className="grid gap-3">
            {cvData.professionalEmail && (
              <a href={`mailto:${cvData.professionalEmail}`} className="flex items-center gap-3 p-4 border-2 border-gray-100 rounded-xl hover:border-blue-400 hover:bg-blue-50 transition-all group">
                <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center text-blue-600">@</div>
                <div className="flex-1">
                  <p className="text-xs text-gray-500 font-bold uppercase tracking-wider">Email</p>
                  <p className="font-semibold text-gray-800">{cvData.professionalEmail}</p>
                </div>
                <ChevronRight className="w-5 h-5 text-gray-300 group-hover:text-blue-500 group-hover:translate-x-1 transition-all" />
              </a>
            )}
            
            {cvData.professionalPhone && (
              <a 
                href={`https://wa.me/${cvData.professionalPhone.replace(/\D/g, '')}`} 
                target="_blank" rel="noopener noreferrer"
                className="flex items-center gap-3 p-4 border-2 border-gray-100 rounded-xl hover:border-green-400 hover:bg-green-50 transition-all group"
              >
                <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center text-green-600">W</div>
                <div className="flex-1">
                  <p className="text-xs text-gray-500 font-bold uppercase tracking-wider">WhatsApp</p>
                  <p className="font-semibold text-gray-800">{cvData.professionalPhone}</p>
                </div>
                <ChevronRight className="w-5 h-5 text-gray-300 group-hover:text-green-500 group-hover:translate-x-1 transition-all" />
              </a>
            )}
          </div>
        </div>

        {/* ... Resto de las secciones (Sobre mí, Experiencia, etc.) ... */}
      </div>

      {/* BOTÓN HOME */}
      <div className="fixed bottom-6 left-0 right-0 flex justify-center pointer-events-none">
        <button onClick={handleHomeClick} className="pointer-events-auto w-14 h-14 bg-white text-purple-600 rounded-full shadow-2xl flex items-center justify-center border-4 border-purple-600 hover:scale-110 transition-transform">
          <Home className="w-6 h-6" />
        </button>
      </div>
    </div>
  );
}

export default PublicCvView;