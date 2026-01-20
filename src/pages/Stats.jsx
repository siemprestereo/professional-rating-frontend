import { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Star, TrendingUp, Users, Calendar, Loader2, Home, ChevronDown, User, FileText, LogOut } from 'lucide-react';

function Stats() {
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);
  const [ratings, setRatings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [professional, setProfessional] = useState(null);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    loadStats();

    // Cerrar dropdown al hacer click fuera
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowUserMenu(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const loadStats = async () => {
    try {
      const professionalData = JSON.parse(localStorage.getItem('professional'));
      if (!professionalData) {
        navigate('/professional-login');
        return;
      }

      setProfessional(professionalData);

      const backendUrl = 'https://professional-rating-backend-production.up.railway.app';
      
      // Cargar ratings
      const ratingsResponse = await fetch(`${backendUrl}/api/ratings/professional/${professionalData.id}`);
      if (ratingsResponse.ok) {
        const ratingsData = await ratingsResponse.json();
        setRatings(ratingsData);
        
        // Calcular estadísticas
        const totalRatings = ratingsData.length;
        const averageScore = totalRatings > 0 
          ? ratingsData.reduce((sum, r) => sum + r.score, 0) / totalRatings 
          : 0;
        
        const scoreDistribution = {
          5: ratingsData.filter(r => r.score === 5).length,
          4: ratingsData.filter(r => r.score === 4).length,
          3: ratingsData.filter(r => r.score === 3).length,
          2: ratingsData.filter(r => r.score === 2).length,
          1: ratingsData.filter(r => r.score === 1).length,
        };

        setStats({
          totalRatings,
          averageScore,
          scoreDistribution,
          recentRatings: ratingsData.slice(0, 10)
        });
      }
    } catch (error) {
      console.error('Error loading stats:', error);
    } finally {
      setLoading(false);
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
        className={`w-5 h-5 ${i < score ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'}`}
      />
    ));
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center animate-fadeIn">
        <div className="text-center">
          <Loader2 className="w-16 h-16 text-white animate-spin mx-auto mb-4" />
          <p className="text-white text-xl font-light">Cargando estadísticas...</p>
        </div>
      </div>
    );
  }

  // Extraer solo el primer nombre
  const firstName = professional?.name?.split(' ')[0] || 'Usuario';

  return (
    <div className="min-h-screen bg-gray-50 animate-fadeIn pb-24">
      {/* Header con navbar */}
      <div className="bg-gradient-to-br from-blue-500 to-purple-600 px-4 pt-6 pb-24 animate-slideDown">
        <div className="flex justify-between items-center mb-6">
          <button
            onClick={() => window.location.href = 'https://professional-rating-frontend.vercel.app/'}
            className="text-white text-2xl hover:scale-105 transition-transform"
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
          <h1 className="text-3xl font-bold text-white mb-2 animate-slideUp">
            Estadísticas
          </h1>
          <p className="text-white/90 animate-slideUp delay-100">
            Análisis de tus calificaciones
          </p>
        </div>
      </div>

      {/* Contenido */}
      <div className="max-w-4xl mx-auto px-4 -mt-16 pb-8">
        {/* Tarjetas de métricas principales */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          {/* Total de calificaciones */}
          <div className="bg-white rounded-2xl shadow-lg p-6 animate-slideUp">
            <div className="flex items-center justify-between mb-2">
              <Users className="w-8 h-8 text-blue-600" />
              <span className="text-3xl font-bold text-gray-800">
                {stats?.totalRatings || 0}
              </span>
            </div>
            <p className="text-gray-600 text-sm">Total de Calificaciones</p>
          </div>

          {/* Promedio */}
          <div className="bg-white rounded-2xl shadow-lg p-6 animate-slideUp delay-100">
            <div className="flex items-center justify-between mb-2">
              <TrendingUp className="w-8 h-8 text-green-600" />
              <span className="text-3xl font-bold text-gray-800">
                {stats?.averageScore?.toFixed(1) || '0.0'}
              </span>
            </div>
            <p className="text-gray-600 text-sm">Promedio de Estrellas</p>
          </div>

          {/* Última calificación */}
          <div className="bg-white rounded-2xl shadow-lg p-6 animate-slideUp delay-200">
            <div className="flex items-center justify-between mb-2">
              <Calendar className="w-8 h-8 text-purple-600" />
              <span className="text-lg font-bold text-gray-800">
                {stats?.recentRatings?.[0] 
                  ? new Date(stats.recentRatings[0].createdAt).toLocaleDateString('es-AR')
                  : 'N/A'}
              </span>
            </div>
            <p className="text-gray-600 text-sm">Última Calificación</p>
          </div>
        </div>

        {/* Distribución de estrellas */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-6 animate-slideUp delay-300">
          <h2 className="text-xl font-bold text-gray-800 mb-4">
            Distribución de Calificaciones
          </h2>
          <div className="space-y-3">
            {[5, 4, 3, 2, 1].map((stars) => {
              const count = stats?.scoreDistribution?.[stars] || 0;
              const percentage = stats?.totalRatings > 0 
                ? (count / stats.totalRatings) * 100 
                : 0;
              
              return (
                <div key={stars} className="flex items-center gap-4">
                  <div className="flex items-center gap-1 w-24">
                    <span className="font-semibold text-gray-700">{stars}</span>
                    <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                  </div>
                  <div className="flex-1 bg-gray-200 rounded-full h-4 overflow-hidden">
                    <div
                      className="bg-gradient-to-r from-blue-500 to-purple-600 h-full rounded-full transition-all duration-500"
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                  <span className="text-sm text-gray-600 w-16 text-right">
                    {count} ({percentage.toFixed(0)}%)
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Calificaciones recientes - clickeable */}
        {stats?.recentRatings && stats.recentRatings.length > 0 && (
          <div 
            onClick={() => navigate('/ratings-history')}
            className="bg-white rounded-2xl shadow-lg p-6 animate-slideUp delay-400 hover-lift cursor-pointer"
          >
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-gray-800">
                Calificaciones Recientes
              </h2>
              <span className="text-sm text-purple-600 font-semibold">
                Ver todas →
              </span>
            </div>
            <div className="space-y-4">
              {stats.recentRatings.map((rating) => (
                <div key={rating.id} className="border-b border-gray-100 pb-4 last:border-0">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center">
                      {renderStars(rating.score)}
                    </div>
                    <span className="text-sm text-gray-500">
                      {new Date(rating.createdAt).toLocaleDateString('es-AR')}
                    </span>
                  </div>
                  {rating.comment && (
                    <p className="text-gray-600 text-sm">{rating.comment}</p>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Estado vacío */}
        {stats?.totalRatings === 0 && (
          <div className="bg-white rounded-2xl shadow-lg p-12 text-center animate-slideUp">
            <Star className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-gray-800 mb-2">
              Aún no tenés calificaciones
            </h3>
            <p className="text-gray-600">
              Compartí tu código QR con tus clientes para empezar a recibir calificaciones
            </p>
          </div>
        )}
      </div>

      {/* Botón Home flotante fijo abajo centrado */}
      <div className="fixed bottom-4 left-0 right-0 flex justify-center z-50 animate-slideUp">
        <button 
          onClick={() => navigate(-1)}
          className="w-14 h-14 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 rounded-full flex items-center justify-center transition-all hover:scale-110 shadow-2xl border-4 border-white"
          aria-label="Volver al inicio"
        >
          <Home className="w-7 h-7 text-white" />
        </button>
      </div>
    </div>
  );
}

export default Stats;