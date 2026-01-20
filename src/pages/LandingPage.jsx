import { useNavigate } from 'react-router-dom';
import { useState, useEffect, useRef } from 'react';
import { Star, Users, TrendingUp, QrCode, Search, UserPlus, ChevronDown, User, FileText, LogOut, BarChart3, ArrowRight } from 'lucide-react';
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
        
        // Obtener el nombre y limpiar espacios
        let fullName = payload.name || payload.sub || payload.email || 'Usuario';
        fullName = fullName.trim(); // Eliminar espacios al inicio y final
        
        // Extraer solo el primer nombre
        const firstName = fullName.split(' ')[0].split('@')[0];
        
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
    navigate('/professional-cv');
  };

  const handleStats = () => {
    setShowUserMenu(false);
    navigate('/client-stats');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-500 via-purple-600 to-pink-500 animate-fadeIn">
      {/* Navbar - Solo visible cuando hay usuario logueado */}
      {userInfo && (
        <nav className="bg-white/10 backdrop-blur-md border-b border-white/20 px-4 py-4 animate-slideDown">
          <div className="max-w-6xl mx-auto flex items-center justify-between">
            <div 
              onClick={() => window.location.href = 'https://professional-rating-frontend.vercel.app/'}
              className="flex items-center gap-2 cursor-pointer hover:scale-105 transition-transform"
            >
              <img 
                src="/Logo-calificalo.png" 
                alt="Calificalo" 
                className="h-10 sm:h-12 logo-pulse"
              />
            </div>
            
            <div className="flex gap-2 sm:gap-3 items-center">
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
            </div>
          </div>
        </nav>
      )}

      {/* Hero Section - Condicional según si está logueado */}
      {userInfo ? (
        // Usuario logueado - Mostrar bienvenida
        <div className="max-w-6xl mx-auto px-4 py-32 text-center">
          <h1 className="text-5xl sm:text-6xl md:text-7xl font-bold text-white mb-8 animate-slideUp">
            ¡Qué bueno tenerte
            <br />
            otra vez acá,
            <br />
            <span className="text-yellow-300">{userInfo.name}!</span>
          </h1>
          
          <button
            onClick={handleDashboard}
            className="bg-gradient-to-r from-yellow-400 to-orange-500 text-white px-12 py-5 rounded-2xl font-bold text-xl shadow-2xl hover:shadow-yellow-500/50 hover:scale-105 transition-all flex items-center justify-center gap-3 mx-auto hover:brightness-110"
          >
            Ingresar
            <ArrowRight className="w-6 h-6" />
          </button>
        </div>
      ) : (
        // Usuario no logueado - Mostrar landing normal con logo arriba
        <>
          <div className="max-w-6xl mx-auto px-4 pt-6 sm:pt-12 pb-8 sm:pb-10 text-center min-h-screen flex flex-col justify-center">
            {/* Logo arriba del título */}
            <div 
              onClick={() => window.location.href = 'https://professional-rating-frontend.vercel.app/'}
              className="flex items-center justify-center cursor-pointer hover:scale-105 transition-transform mb-4 sm:mb-8 animate-slideDown"
            >
              <img 
                src="/Logo-calificalo.png" 
                alt="Calificalo" 
                className="h-40 sm:h-48 md:h-56 lg:h-64 w-auto logo-pulse"
              />
            </div>

            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-3 sm:mb-5 animate-slideUp leading-tight">
              Construí tu reputación
              <br />
              <span className="text-yellow-300">profesional</span>
            </h1>
            
            <p className="text-sm sm:text-base md:text-lg lg:text-xl text-white/90 mb-8 sm:mb-10 max-w-2xl mx-auto animate-slideUp delay-100 px-4 leading-snug">
              La plataforma que transforma calificaciones en oportunidades laborales para profesionales de todos los rubros
            </p>

            <div className="flex flex-col gap-3 sm:gap-4 justify-center items-center animate-slideUp delay-200 px-4">
              <button
                onClick={() => navigate('/professional-login')}
                className="w-full sm:w-auto bg-gradient-to-r from-yellow-400 to-orange-500 text-white px-8 sm:px-10 py-3.5 sm:py-4 rounded-2xl font-bold text-base sm:text-lg shadow-2xl hover:shadow-yellow-500/50 hover:scale-105 transition-all flex items-center justify-center gap-2 hover:brightness-110"
              >
                <UserPlus className="w-5 sm:w-6 h-5 sm:h-6" />
                Soy profesional
              </button>
              
              <button
                onClick={() => navigate('/client-login')}
                className="w-full sm:w-auto bg-gradient-to-r from-green-500 to-teal-600 text-white px-8 sm:px-10 py-3.5 sm:py-4 rounded-2xl font-bold text-base sm:text-lg shadow-2xl hover:shadow-green-500/50 hover:scale-105 transition-all flex items-center justify-center gap-2 hover:brightness-110 whitespace-nowrap"
              >
                <span className="text-2xl">⭐</span>
                Soy cliente y quiero calificar
              </button>

              <button
                onClick={handleSearchClick}
                className="w-full sm:w-auto bg-gradient-to-r from-blue-500 to-indigo-600 text-white px-8 sm:px-10 py-3.5 sm:py-4 rounded-2xl font-bold text-base sm:text-lg shadow-2xl hover:shadow-blue-500/50 hover:scale-105 transition-all flex items-center justify-center gap-2 hover:brightness-110"
              >
                <Search className="w-5 sm:w-6 h-5 sm:h-6" />
                Buscar profesional
              </button>
            </div>
          </div>

          {/* Features */}
          <div className="max-w-6xl mx-auto px-4 py-12 sm:py-16 grid md:grid-cols-3 gap-6 sm:gap-8">
            <div className="bg-white/10 backdrop-blur-md rounded-3xl p-6 sm:p-8 text-center animate-slideUp delay-300 hover-lift">
              <Star className="w-12 sm:w-16 h-12 sm:h-16 text-yellow-300 mx-auto mb-3 sm:mb-4" />
              <h3 className="text-xl sm:text-2xl font-bold text-white mb-2 sm:mb-3">
                Recibí Calificaciones
              </h3>
              <p className="text-sm sm:text-base text-white/80">
                Los clientes escanean tu QR y califican tu servicio profesional
              </p>
            </div>

            <div className="bg-white/10 backdrop-blur-md rounded-3xl p-6 sm:p-8 text-center animate-slideUp delay-400 hover-lift">
              <TrendingUp className="w-12 sm:w-16 h-12 sm:h-16 text-green-300 mx-auto mb-3 sm:mb-4" />
              <h3 className="text-xl sm:text-2xl font-bold text-white mb-2 sm:mb-3">
                Construí tu Reputación
              </h3>
              <p className="text-sm sm:text-base text-white/80">
                Tu historial y promedio te acompañan a donde vayas
              </p>
            </div>

            <div className="bg-white/10 backdrop-blur-md rounded-3xl p-6 sm:p-8 text-center animate-slideUp delay-500 hover-lift">
              <Users className="w-12 sm:w-16 h-12 sm:h-16 text-blue-300 mx-auto mb-3 sm:mb-4" />
              <h3 className="text-xl sm:text-2xl font-bold text-white mb-2 sm:mb-3">
                Conseguí Mejores Trabajos
              </h3>
              <p className="text-sm sm:text-base text-white/80">
                Los empleadores buscan profesionales con buena reputación
              </p>
            </div>
          </div>

          {/* CTA Section - Solo visible en tablet y desktop */}
          <div className="hidden sm:block max-w-4xl mx-auto px-4 py-12 sm:py-16 text-center">
            <div className="bg-white/10 backdrop-blur-md rounded-3xl p-6 sm:p-12 animate-scaleIn">
              <QrCode className="w-12 sm:w-16 md:w-20 h-12 sm:h-16 md:h-20 text-white mx-auto mb-4 sm:mb-6 animate-pulseGlow" />
              <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-white mb-3 sm:mb-4">
                ¿Cómo funciona?
              </h2>
              <p className="text-sm sm:text-base md:text-lg text-white/90 mb-6 sm:mb-8 max-w-2xl mx-auto">
                Generá tu código QR único, los clientes lo escanean después del servicio, 
                califican tu atención y construís tu CV profesional con experiencia verificada.
              </p>
              <button
                onClick={() => navigate('/professional-register')}
                className="w-full sm:w-auto bg-yellow-400 text-purple-900 px-6 sm:px-8 md:px-10 py-3 sm:py-4 rounded-2xl font-bold text-base sm:text-lg shadow-2xl hover:scale-105 transition-all ripple"
              >
                Empezar Ahora - Es Gratis
              </button>
            </div>
          </div>
        </>
      )}

      {/* Footer */}
      <footer className="bg-black/20 backdrop-blur-md py-6 sm:py-8 mt-12 sm:mt-16">
        <div className="max-w-6xl mx-auto px-4 text-center text-white/70">
          <p className="mb-2 text-sm sm:text-base">© 2025 Calificalo - Tu reputación profesional</p>
          <div className="flex gap-4 sm:gap-6 justify-center flex-wrap">
            <button onClick={handleSearchClick} className="hover:text-white transition-colors text-sm sm:text-base">
              Buscar profesional
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