import { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Star, Briefcase, Award, Loader2, Edit, Home, ChevronDown, User, FileText, LogOut } from 'lucide-react';
import LoadingScreen from '../components/LoadingScreen';

function MyProfile() {
  const navigate = useNavigate();
  const [professional, setProfessional] = useState(null);
  const [ratings, setRatings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    loadMyProfile();

    // Cerrar dropdown al hacer click fuera
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowUserMenu(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const loadMyProfile = async () => {
    console.log('📍 loadMyProfile ejecutándose...');
    
    // Intentar cargar desde localStorage primero
    const savedData = localStorage.getItem('professional');
    console.log('📦 savedData:', savedData ? 'EXISTS' : 'NULL');
    
    if (savedData) {
      const data = JSON.parse(savedData);
      console.log('✅ Professional data loaded:', data);
      setProfessional(data);
      loadRatings(data.id);
      setLoading(false);
      return;
    }

    // Si no hay datos en localStorage, cargar desde el backend
    console.log('🚨 No hay datos de professional en localStorage, redirigiendo al login');
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

  const handleLogout = () => {
    localStorage.removeItem('authToken');
    localStorage.removeItem('professional');
    setShowUserMenu(false);
    navigate('/');
  };

  const handleCV = () => {
    setShowUserMenu(false);
    navigate('/cv-view');
  };

  const renderStars = (score) => {
    return [...Array(5)].map((_, i) => (
      <Star
        key={i}
        className={`w-5 h-5 transition-all duration-300 ${i < score ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'}`}
      />
    ));
  };

  // Función para traducir el professionType
  const getProfessionTypeLabel = (type) => {
    const translations = {
      'WAITER': 'Mozo/a',
      'CHEF': 'Chef',
      'BARTENDER': 'Bartender',
      'SOMMELIER': 'Sommelier',
      'HOST': 'Anfitrión/a',
      'MANAGER': 'Manager',
      'BARISTA': 'Barista',
      'COOK': 'Cocinero/a',
      'DISHWASHER': 'Lavavajillas',
      'DELIVERY': 'Delivery',
      'CASHIER': 'Cajero/a',
      'CLEANER': 'Personal de limpieza',
      'SECURITY': 'Seguridad',
      'VALET': 'Valet parking',
      'OTHER': 'Otro'
    };
    return translations[type] || type;
  };

  if (loading) {
    return <LoadingScreen />;
  }

  if (!professional) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center p-4 animate-fadeIn">
        <div className="bg-white rounded-2xl p-8 text-center animate-scaleIn">
          <p className="text-gray-600 mb-4 text-base">No se pudo cargar tu perfil</p>
          <button
            onClick={() => navigate('/professional-dashboard')}
            className="bg-blue-500 text-white px-6 py-2 rounded-full hover:bg-blue-600 transition-all ripple text-base"
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
  
  // Extraer solo el primer nombre para el menú
  const firstName = professionalName.split(' ')[0];

  return (
    <div className="min-h-screen bg-gray-50 animate-fadeIn pb-24">
      {/* Header con navbar */}
      <div className="bg-gradient-to-br from-blue-500 to-purple-600 px-4 pt-6 pb-24 animate-slideDown">
        <div className="flex justify-between items-center mb-6">
          <button
            onClick={() => window.location.href = 'https://professional-rating-frontend.vercel.app/'}
            className="text-white text-2xl hover:scale-105 transition-transform logo-pulse"
            style={{ fontFamily: 'Playball, cursive' }}
          >
            Calificalo
          </button>
          
          {/* Menú desplegable */}
          <div className="relative" ref={dropdownRef}>
            <button
              onClick={() => setShowUserMenu(!showUserMenu)}
              className="bg-white/20 hover:bg-white/30 text-white px-3 sm:px-4 py-2 rounded-full font-semibold flex items-center gap-2 transition-all hover-lift text-sm sm:text-base"
            >
              <User className="w-4 h-4" />
              <span>{firstName}</span>
              <ChevronDown className={`w-4 h-4 transition-transform ${showUserMenu ? 'rotate-180' : ''}`} />
            </button>

            {/* Dropdown Menu */}
            {showUserMenu && (
              <div className="absolute right-0 mt-2 w-48 sm:w-56 bg-white rounded-2xl shadow-2xl overflow-hidden z-50 animate-slideDown">
                <div className="py-2">
                  <button
                    onClick={handleCV}
                    className="w-full px-4 py-3 text-left text-gray-700 hover:bg-purple-50 transition-colors flex items-center gap-3"
                  >
                    <FileText className="w-5 h-5 text-purple-600" />
                    <span className="font-medium text-sm sm:text-base">Mi CV</span>
                  </button>
                  
                  <div className="border-t border-gray-200 my-2"></div>
                  
                  <button
                    onClick={handleLogout}
                    className="w-full px-4 py-3 text-left text-red-600 hover:bg-red-50 transition-colors flex items-center gap-3"
                  >
                    <LogOut className="w-5 h-5" />
                    <span className="font-medium text-sm sm:text-base">Cerrar sesión</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="max-w-4xl mx-auto text-center">
          <div className="w-24 h-24 bg-white rounded-full mx-auto mb-4 flex items-center justify-center text-4xl font-bold text-purple-600 animate-scaleIn">
            {professionalName.charAt(0)}
          </div>
          <h1 className="text-3xl roboto-light text-white mb-2 animate-slideUp">
            {professionalName}
          </h1>
          <div className="flex items-center justify-center mb-4 animate-slideUp delay-100">
            {renderStars(Math.round(reputationScore))}
            <span className="ml-2 text-white font-semibold text-lg">
              {reputationScore.toFixed(1)}
            </span>
          </div>
          <p className="text-white/90 animate-slideUp delay-200 text-base">
            {totalRatings} {totalRatings === 1 ? 'calificación' : 'calificaciones'}
          </p>
        </div>
      </div>

      {/* Contenido */}
      <div className="max-w-4xl mx-auto px-4 -mt-16">
        {/* Tipo de profesión */}
        {professional.professionType && (
          <div className="bg-white rounded-2xl shadow-lg p-6 mb-4 animate-slideUp hover-lift">
            <h2 className="text-xl roboto-light text-gray-800 mb-3">Tipo de Profesión</h2>
            <p className="text-gray-600 text-base">{getProfessionTypeLabel(professional.professionType)}</p>
          </div>
        )}

        {/* Información del perfil */}
        {professional.professionalTitle && (
          <div className="bg-white rounded-2xl shadow-lg p-6 mb-4 animate-slideUp delay-100 hover-lift">
            <h2 className="text-xl roboto-light text-gray-800 mb-3">Título Profesional</h2>
            <p className="text-gray-600 text-base">{professional.professionalTitle}</p>
          </div>
        )}

        {professional.phone && (
          <div className="bg-white rounded-2xl shadow-lg p-6 mb-4 animate-slideUp delay-150 hover-lift">
            <h2 className="text-xl roboto-light text-gray-800 mb-3">Contacto</h2>
            <p className="text-gray-600 text-base">📞 {professional.phone}</p>
            {professional.location && (
              <p className="text-gray-600 mt-2 text-base">📍 {professional.location}</p>
            )}
          </div>
        )}

        {/* Calificaciones recientes */}
        {ratings.length > 0 && (
          <div className="bg-white rounded-2xl shadow-lg p-6 mb-4 animate-slideUp delay-200 hover-lift">
            <h2 className="text-xl roboto-light text-gray-800 mb-4 flex items-center">
              <Award className="w-6 h-6 mr-2 text-yellow-500" />
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
                    <p className="text-gray-600 text-base mb-2">{rating.comment}</p>
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
          <div className="bg-white rounded-2xl shadow-lg p-6 mb-4 text-center animate-slideUp delay-200 hover-lift">
            <Award className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500 text-base">Aún no tenés calificaciones</p>
            <p className="text-sm text-gray-400 mt-2">
              Compartí tu perfil con clientes para recibir calificaciones
            </p>
          </div>
        )}

        {/* Botón Editar Perfil - MOVIDO AL FINAL */}
        <div className="mb-6 flex justify-center">
          <button
            onClick={() => navigate('/edit-profile-professional')}
            className="bg-white rounded-2xl shadow-lg p-6 text-center animate-slideUp delay-250 hover-lift max-w-xs w-full"
          >
            <Edit className="w-10 h-10 text-blue-600 mx-auto mb-3" />
            <p className="font-semibold text-gray-800 text-lg">Editar Perfil</p>
          </button>
        </div>
      </div>

      {/* Botón Home flotante fijo abajo centrado */}
      <div className="fixed bottom-4 left-0 right-0 flex justify-center z-50 animate-slideUp pointer-events-none">
        <button 
          onClick={() => navigate('/professional-dashboard')}
          className="w-14 h-14 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 rounded-full flex items-center justify-center transition-all hover:scale-110 shadow-2xl border-4 border-white pointer-events-auto"
          aria-label="Volver al inicio"
        >
          <Home className="w-7 h-7 text-white" />
        </button>
      </div>
    </div>
  );
}

export default MyProfile;