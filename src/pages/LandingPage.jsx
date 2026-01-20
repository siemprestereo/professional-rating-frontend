import { useNavigate } from 'react-router-dom';
import { useState, useEffect, useRef } from 'react';
import { Star, Users, TrendingUp, QrCode, Search, LogIn, UserPlus, ChevronDown, User, FileText, LogOut, BarChart3 } from 'lucide-react';
import LoginRequiredModal from '../components/LoginRequiredModal';

function LandingPage() {
  const navigate = useNavigate();
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [userInfo, setUserInfo] = useState(null);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
  // Obtener información del usuario del token
  const token = localStorage.getItem('authToken');
  if (token) {
    try {
      // Decodificar el JWT para obtener el nombre
      const payload = JSON.parse(atob(token.split('.')[1]));
      console.log('Full payload:', payload); // Para debug
      
      // Obtener el nombre y limpiar espacios
      let fullName = payload.name || payload.sub || payload.email || 'Usuario';
      fullName = fullName.trim(); // Eliminar espacios al inicio y final
      
      // Extraer solo el primer nombre
      const firstName = fullName.split(' ')[0].split('@')[0];
      
      console.log('Nombre extraído:', firstName); // Para debug
      console.log('User type:', payload.userType); // Para debug
      
      setUserInfo({
        name: firstName,
        role: payload.userType || payload.role
      });
    } catch (error) {
      console.error('Error al decodificar token:', error);
    }
  }

  // Cerrar dropdown al hacer click fuera
  const handleClickOutside = (event) => {
    if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
      setShowUserMenu(false);
    }
  };

  document.addEventListener('mousedown', handleClickOutside);
  return () => document.removeEventListener('mousedown', handleClickOutside);
}, []);

  const handleSearchClick = () => {
    const token = localStorage.getItem('authToken');
    
    if (token) {
      navigate('/search');
    } else {
      setShowLoginModal(true);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('authToken');
    setUserInfo(null);
    setShowUserMenu(false);
    window.location.href = '/';
  };

  const handleDashboard = () => {
    setShowUserMenu(false);
    if (userInfo?.role === 'PROFESSIONAL') {
      navigate('/professional-dashboard');
    } else {
      navigate('/client-dashboard');
    }
  };

  const handleCV = () => {
    setShowUserMenu(false);
    navigate('/cv-view');
  };

  const handleStats = () => {
    setShowUserMenu(false);
    navigate('/client-stats'); // Ajusta esta ruta según tu aplicación
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-500 via-purple-600 to-pink-500 animate-fadeIn">
      {/* Navbar */}
      <nav className="bg-white/10 backdrop-blur-md border-b border-white/20 px-4 py-4 animate-slideDown">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div 
            onClick={() => window.location.href = 'https://professional-rating-frontend.vercel.app/'}
            className="flex items-center gap-2 cursor-pointer hover:scale-105 transition-transform"
          >
            <span className="text-3xl sm:text-4xl text-white" style={{ fontFamily: 'Playball, cursive' }}>
              Calificalo
            </span>
          </div>
          
          <div className="flex gap-2 sm:gap-3 items-center">
            {userInfo ? (
              // Usuario logueado - Mostrar nombre con dropdown
              <div className="relative" ref={dropdownRef}>
                <button
                  onClick={() => setShowUserMenu(!showUserMenu)}
                  className="bg-white/20 hover:bg-white/30 text-white px-3 sm:px-4 py-2 rounded-full font-semibold flex items-center gap-2 transition-all hover-lift text-sm sm:text-base"
                >
                  <User className="w-4 h-4" />
                  <span>{userInfo.name}</span>
                  <ChevronDown className={`w-4 h-4 transition-transform ${showUserMenu ? 'rotate-180' : ''}`} />
                </button>

                {/* Dropdown Menu */}
                {showUserMenu && (
                  <div className="absolute right-0 mt-2 w-48 sm:w-56 bg-white rounded-2xl shadow-2xl overflow-hidden z-50 animate-slideDown">
                    <div className="py-2">
                      <button
                        onClick={handleDashboard}
                        className="w-full px-4 py-3 text-left text-gray-700 hover:bg-purple-50 transition-colors flex items-center gap-3"
                      >
                        <User className="w-5 h-5 text-purple-600" />
                        <span className="font-medium text-sm sm:text-base">Panel principal</span>
                      </button>
                      
                      {/* Opciones para PROFESSIONAL */}
                      {userInfo.role === 'PROFESSIONAL' && (
                        <button
                          onClick={handleCV}
                          className="w-full px-4 py-3 text-left text-gray-700 hover:bg-purple-50 transition-colors flex items-center gap-3"
                        >
                          <FileText className="w-5 h-5 text-purple-600" />
                          <span className="font-medium text-sm sm:text-base">Mi CV</span>
                        </button>
                      )}
                      
                      {/* Opciones para CLIENT */}
                      {userInfo.role === 'CLIENT' && (
                        <button
                          onClick={handleStats}
                          className="w-full px-4 py-3 text-left text-gray-700 hover:bg-purple-50 transition-colors flex items-center gap-3"
                        >
                          <BarChart3 className="w-5 h-5 text-purple-600" />
                          <span className="font-medium text-sm sm:text-base">Mis estadísticas</span>
                        </button>
                      )}
                      
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
            ) : (
              // Usuario no logueado - Mostrar botón login profesional
              <button
                onClick={() => navigate('/professional-login')}
                className="bg-white text-purple-600 hover:bg-gray-100 px-3 sm:px-4 py-2 rounded-full font-semibold flex items-center gap-2 transition-all hover-lift text-sm sm:text-base"
              >
                <LogIn className="w-4 h-4" />
                <span className="hidden sm:inline">Soy profesional</span>
                <span className="sm:hidden">Login</span>
              </button>
            )}
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <div className="max-w-6xl mx-auto px-4 py-16 text-center">
        <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold text-white mb-6 animate-slideUp">
          Construí tu reputación
          <br />
          <span className="text-yellow-300">profesional</span>
        </h1>
        
        <p className="text-lg sm:text-xl text-white/90 mb-8 max-w-2xl mx-auto animate-slideUp delay-100 px-4">
          La plataforma que transforma calificaciones en oportunidades laborales para profesionales de todos los rubros
        </p>

        <div className="flex flex-col gap-4 justify-center items-center animate-slideUp delay-200 px-4">
          <button
            onClick={() => navigate('/professional-register')}
            className="w-full sm:w-auto bg-gradient-to-r from-yellow-400 to-orange-500 text-white px-6 sm:px-8 py-4 rounded-2xl font-bold text-base sm:text-lg shadow-2xl hover:shadow-yellow-500/50 hover:scale-105 transition-all flex items-center justify-center gap-2 hover:brightness-110"
          >
            <UserPlus className="w-5 sm:w-6 h-5 sm:h-6" />
            Registrarme como profesional
          </button>
          
          <button
            onClick={() => navigate('/client-login')}
            className="w-full sm:w-auto bg-gradient-to-r from-green-500 to-teal-600 text-white px-6 sm:px-8 py-4 rounded-2xl font-bold text-base sm:text-lg shadow-2xl hover:shadow-green-500/50 hover:scale-105 transition-all flex items-center justify-center gap-2 hover:brightness-110"
          >
            <span className="text-2xl">⭐</span>
            Quiero calificar a alguien
          </button>

          <button
            onClick={handleSearchClick}
            className="w-full sm:w-auto bg-gradient-to-r from-blue-500 to-indigo-600 text-white px-6 sm:px-8 py-4 rounded-2xl font-bold text-base sm:text-lg shadow-2xl hover:shadow-blue-500/50 hover:scale-105 transition-all flex items-center justify-center gap-2 hover:brightness-110"
          >
            <Search className="w-5 sm:w-6 h-5 sm:h-6" />
            Buscar profesional
          </button>
        </div>
      </div>

      {/* Features */}
      <div className="max-w-6xl mx-auto px-4 py-16 grid md:grid-cols-3 gap-8">
        <div className="bg-white/10 backdrop-blur-md rounded-3xl p-8 text-center animate-slideUp delay-300 hover-lift">
          <Star className="w-16 h-16 text-yellow-300 mx-auto mb-4" />
          <h3 className="text-2xl font-bold text-white mb-3">
            Recibí Calificaciones
          </h3>
          <p className="text-white/80">
            Los clientes escanean tu QR y califican tu servicio profesional
          </p>
        </div>

        <div className="bg-white/10 backdrop-blur-md rounded-3xl p-8 text-center animate-slideUp delay-400 hover-lift">
          <TrendingUp className="w-16 h-16 text-green-300 mx-auto mb-4" />
          <h3 className="text-2xl font-bold text-white mb-3">
            Construí tu Reputación
          </h3>
          <p className="text-white/80">
            Tu historial y promedio te acompañan a donde vayas
          </p>
        </div>

        <div className="bg-white/10 backdrop-blur-md rounded-3xl p-8 text-center animate-slideUp delay-500 hover-lift">
          <Users className="w-16 h-16 text-blue-300 mx-auto mb-4" />
          <h3 className="text-2xl font-bold text-white mb-3">
            Conseguí Mejores Trabajos
          </h3>
          <p className="text-white/80">
            Los empleadores buscan profesionales con buena reputación
          </p>
        </div>
      </div>

      {/* CTA Section */}
      <div className="max-w-4xl mx-auto px-4 py-16 text-center">
        <div className="bg-white/10 backdrop-blur-md rounded-3xl p-8 sm:p-12 animate-scaleIn">
          <QrCode className="w-16 sm:w-20 h-16 sm:h-20 text-white mx-auto mb-6 animate-pulseGlow" />
          <h2 className="text-2xl sm:text-3xl font-bold text-white mb-4">
            ¿Cómo funciona?
          </h2>
          <p className="text-white/90 text-base sm:text-lg mb-8 max-w-2xl mx-auto">
            Generá tu código QR único, los clientes lo escanean después del servicio, 
            califican tu atención y construís tu CV profesional con experiencia verificada.
          </p>
          <button
            onClick={() => navigate('/professional-register')}
            className="w-full sm:w-auto bg-yellow-400 text-purple-900 px-8 sm:px-10 py-4 rounded-2xl font-bold text-base sm:text-lg shadow-2xl hover:scale-105 transition-all ripple"
          >
            Empezar Ahora - Es Gratis
          </button>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-black/20 backdrop-blur-md py-8 mt-16">
        <div className="max-w-6xl mx-auto px-4 text-center text-white/70">
          <p className="mb-2 text-sm sm:text-base">© 2025 Calificalo - Tu reputación profesional</p>
          <div className="flex gap-4 sm:gap-6 justify-center flex-wrap">
            <button onClick={handleSearchClick} className="hover:text-white transition-colors text-sm sm:text-base">
              Buscar profesional
            </button>
            <button onClick={() => navigate('/professional-login')} className="hover:text-white transition-colors text-sm sm:text-base">
              Login Profesionales
            </button>
          </div>
        </div>
      </footer>

      {/* Modal de Login Requerido */}
      {showLoginModal && (
        <LoginRequiredModal onClose={() => setShowLoginModal(false)} />
      )}
    </div>
  );
}

export default LandingPage;