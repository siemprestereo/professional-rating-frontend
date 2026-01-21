import { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Star, LogOut, Loader2, Calendar, MessageSquare, User, BarChart3, Search, ChevronDown } from 'lucide-react';

function ClientDashboard() {
  const navigate = useNavigate();
  const backendUrl = 'https://professional-rating-backend-production.up.railway.app';
  const [client, setClient] = useState(null);
  const [myRatings, setMyRatings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState(null);
  const [topBadges, setTopBadges] = useState([]);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    // Primero verificar si hay token en la URL (OAuth redirect)
    const urlParams = new URLSearchParams(window.location.search);
    const tokenFromUrl = urlParams.get('token');
    
    if (tokenFromUrl) {
      console.log('✅ Token recibido de OAuth en dashboard:', tokenFromUrl);
      localStorage.setItem('authToken', tokenFromUrl);
      
      // Limpiar la URL (quitar el ?token=xxx)
      window.history.replaceState({}, document.title, window.location.pathname);
    }
    
    loadClientData();

    // Cerrar dropdown al hacer click fuera
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowUserMenu(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const loadClientData = async () => {
    // Verificar si hay token
    const token = localStorage.getItem('authToken');
    
    if (!token) {
      console.log('No hay token, redirigiendo al login');
      navigate('/client-login');
      setLoading(false);
      return;
    }

    try {
      // Llamar al backend con el token JWT
      const response = await fetch(`${backendUrl}/api/auth/me/client`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const clientData = await response.json();
        setClient(clientData);
        localStorage.setItem('client', JSON.stringify(clientData));
        loadRatings(clientData.id, token);
      } else if (response.status === 401) {
        // Token inválido o expirado
        console.log('Token inválido, redirigiendo al login');
        localStorage.removeItem('authToken');
        localStorage.removeItem('client');
        navigate('/client-login');
      } else {
        throw new Error('Error al cargar datos del cliente');
      }
    } catch (error) {
      console.error('Error loading client:', error);
      navigate('/client-login');
    } finally {
      setLoading(false);
    }
  };

  const loadRatings = async (clientId, token) => {
    try {
      const response = await fetch(`${backendUrl}/api/ratings/client/${clientId}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setMyRatings(data);
        calculateQuickStats(data);
        calculateTopBadges(data);
      }
    } catch (error) {
      console.error('Error loading ratings:', error);
      setMyRatings([]);
    }
  };

  const calculateQuickStats = (ratingsData) => {
    if (ratingsData.length === 0) {
      setStats({ total: 0, average: 0, categories: 0 });
      return;
    }

    const total = ratingsData.length;
    const average = ratingsData.reduce((sum, r) => sum + r.score, 0) / total;
    const categories = new Set(ratingsData.map(r => r.professionalType || 'general')).size;

    setStats({
      total,
      average: average.toFixed(1),
      categories
    });
  };

  const calculateTopBadges = (ratingsData) => {
    const badges = [];
    const total = ratingsData.length;

    // Obtener las últimas 3 medallas desbloqueadas
    if (total >= 100) badges.push({ icon: '⭐', name: 'Legendario' });
    else if (total >= 50) badges.push({ icon: '👑', name: 'Maestro' });
    else if (total >= 25) badges.push({ icon: '💎', name: 'Experto' });
    else if (total >= 10) badges.push({ icon: '🥇', name: 'Experimentado' });
    else if (total >= 5) badges.push({ icon: '🥈', name: 'Activo' });
    else if (total >= 1) badges.push({ icon: '🥉', name: 'Primera' });

    // Medallas especiales
    const withComment = ratingsData.filter(r => r.comment && r.comment.trim().length > 0).length;
    const commentPercentage = total > 0 ? (withComment / total) * 100 : 0;
    
    if (commentPercentage >= 80) {
      badges.push({ icon: '💬', name: 'Comunicador' });
    }

    const average = total > 0 ? ratingsData.reduce((sum, r) => sum + r.score, 0) / total : 0;
    if (average >= 4.5) {
      badges.push({ icon: '🌟', name: 'Generoso' });
    }

    setTopBadges(badges.slice(0, 3)); // Solo mostrar las primeras 3
  };

  const handleLogout = () => {
    localStorage.removeItem('authToken');
    localStorage.removeItem('client');
    setShowUserMenu(false);
    navigate('/');
  };

  const renderStars = (score) => {
    return [...Array(5)].map((_, i) => (
      <Star
        key={i}
        className={`w-4 h-4 ${i < score ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'}`}
      />
    ));
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-500 to-teal-600 flex items-center justify-center animate-fadeIn">
        <div className="text-center">
          <Loader2 className="w-16 h-16 text-white animate-spin mx-auto mb-4" />
          <p className="text-white text-xl font-light">Cargando panel principal</p>
        </div>
      </div>
    );
  }

  if (!client) {
    return null;
  }

  // Extraer solo el primer nombre
  const firstName = client.name.split(' ')[0];

  // Obtener últimas 3 calificaciones
  const recentRatings = myRatings.slice(0, 3);

  return (
    <div className="min-h-screen bg-gray-50 animate-fadeIn">
      {/* Header */}
      <div className="bg-gradient-to-br from-green-500 to-teal-600 px-4 pt-6 pb-24 animate-slideDown">
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
                    onClick={() => {
                      setShowUserMenu(false);
                      navigate('/client-stats');
                    }}
                    className="w-full px-4 py-3 text-left text-gray-700 hover:bg-teal-50 transition-colors flex items-center gap-3"
                  >
                    <BarChart3 className="w-5 h-5 text-teal-600" />
                    <span className="font-medium text-sm sm:text-base">Mis estadísticas</span>
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
        
        <div className="text-center">
          <div className="w-20 h-20 bg-white rounded-full mx-auto mb-3 flex items-center justify-center text-3xl font-bold text-teal-600 animate-scaleIn">
            {client.name.charAt(0)}
          </div>
          <h2 className="text-xl font-bold text-white mb-2 animate-slideUp">{client.name}</h2>
          {/* Medalla del usuario */}
          {topBadges.length > 0 && (
            <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm px-3 py-1 rounded-full animate-slideUp delay-100">
              <span className="text-2xl">{topBadges[0].icon}</span>
              <span className="text-white text-sm font-semibold">{topBadges[0].name}</span>
            </div>
          )}
        </div>
      </div>

      {/* Contenido */}
      <div className="px-4 -mt-16">
        {/* Quick Stats */}
        {stats && stats.total > 0 && (
          <div className="grid grid-cols-2 gap-3 mb-4 animate-slideUp">
            <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl p-4 text-white shadow-lg">
              <p className="text-2xl font-bold mb-1">{stats.total}</p>
              <p className="text-xs opacity-90">Calificaciones otorgadas</p>
            </div>
            <div className="bg-gradient-to-br from-yellow-500 to-orange-600 rounded-2xl p-4 text-white shadow-lg">
              <p className="text-2xl font-bold mb-1">{stats.average}</p>
              <p className="text-xs opacity-90">Tu Promedio</p>
            </div>
          </div>
        )}

        {/* Mensaje de bienvenida */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-4 animate-slideUp">
          <h3 className="text-lg font-bold text-gray-800 mb-2">
            ¡Hola {firstName}! 👋
          </h3>
          <p className="text-gray-600">
            Para calificar a un profesional, pídele que te muestre su código QR.
          </p>
        </div>

        {/* Calificaciones Recientes */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-4 animate-slideUp delay-100">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold text-gray-800 flex items-center">
              <Star className="w-5 h-5 mr-2 text-yellow-500" />
              Calificaciones recientes
            </h3>
            {myRatings.length > 3 && (
              <button
                onClick={() => navigate('/client-stats')}
                className="text-teal-600 text-sm font-semibold hover:text-teal-700"
              >
                Ver todas →
              </button>
            )}
          </div>
          
          {myRatings.length === 0 ? (
            <div className="text-center py-8">
              <MessageSquare className="w-16 h-16 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500 mb-4">
                Aún no has calificado a ningún profesional
              </p>
              <p className="text-sm text-gray-400">
                Escaneá un código QR para comenzar
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {recentRatings.map((rating, index) => (
                <div 
                  key={rating.id} 
                  className="border border-gray-100 rounded-xl p-4 hover:shadow-md transition-all"
                >
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <h4 className="font-semibold text-gray-800">{rating.professionalName}</h4>
                      <p className="text-sm text-gray-500">{rating.businessName}</p>
                    </div>
                    <div className="flex items-center gap-1">
                      {renderStars(rating.score)}
                    </div>
                  </div>
                  
                  {rating.comment && (
                    <p className="text-gray-600 text-sm mb-2 italic">"{rating.comment}"</p>
                  )}
                  
                  <div className="flex items-center text-xs text-gray-400">
                    <Calendar className="w-3 h-3 mr-1" />
                    {new Date(rating.createdAt).toLocaleDateString('es-AR', {
                      day: '2-digit',
                      month: 'long',
                      year: 'numeric'
                    })}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Acciones rápidas */}
        <div className="grid grid-cols-3 gap-3 mb-6">
          <button
            onClick={() => navigate('/client-stats')}
            className="bg-white rounded-2xl shadow-lg p-4 text-center animate-slideUp delay-150 hover-lift"
          >
            <BarChart3 className="w-8 h-8 text-blue-600 mx-auto mb-2" />
            <p className="text-xs font-semibold text-gray-800">Mis estadísticas</p>
          </button>

          <button
            onClick={() => navigate('/edit-profile')}
            className="bg-white rounded-2xl shadow-lg p-4 text-center animate-slideUp delay-200 hover-lift"
          >
            <User className="w-8 h-8 text-green-600 mx-auto mb-2" />
            <p className="text-xs font-semibold text-gray-800">Mi Perfil</p>
          </button>

          <button
            onClick={() => navigate('/search')}
            className="bg-white rounded-2xl shadow-lg p-4 text-center animate-slideUp delay-250 hover-lift"
          >
            <Search className="w-8 h-8 text-teal-600 mx-auto mb-2" />
            <p className="text-xs font-semibold text-gray-800">Buscar Profesional</p>
          </button>
        </div>
      </div>
    </div>
  );
}

export default ClientDashboard;