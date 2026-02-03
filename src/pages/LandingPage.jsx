import { useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { Star, Users, TrendingUp, QrCode, Search, UserPlus, ArrowRight, ChevronUp, ChevronDown } from 'lucide-react';
import LoginRequiredModal from '../components/LoginRequiredModal';
import { getFirstName } from '../utils/formatName';

function LandingPage() {
  const navigate = useNavigate();
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [userInfo, setUserInfo] = useState(null);
  const [active, setActive] = useState(1);

  const cards = [
    {
      icon: Star,
      title: 'Recibí Calificaciones',
      description: 'Los clientes escanean tu QR y califican tu servicio profesional',
      color: 'text-yellow-300',
      gradient: 'from-yellow-400 to-orange-500'
    },
    {
      icon: TrendingUp,
      title: 'Construí tu Reputación',
      description: 'Tu historial y promedio te acompañan a donde vayas',
      color: 'text-green-300',
      gradient: 'from-green-400 to-emerald-500'
    },
    {
      icon: Users,
      title: 'Conseguí Mejores Trabajos',
      description: 'Los empleadores buscan profesionales con buena reputación',
      color: 'text-blue-300',
      gradient: 'from-blue-400 to-indigo-500'
    }
  ];

  const MAX_VISIBILITY = 2;

  useEffect(() => {
    const token = localStorage.getItem('authToken');
    if (token) {
      try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        let fullName = payload.name || payload.sub || payload.email || 'Usuario';
        fullName = fullName.trim();
        const firstName = getFirstName(fullName.split('@')[0]);
        
        setUserInfo({
          name: firstName,
          role: payload.userType || payload.role
        });
      } catch (error) {
        console.error('Error al decodificar token:', error);
      }
    }
  }, []);

  // Auto-rotate
  useEffect(() => {
    const interval = setInterval(() => {
      setActive((prev) => (prev + 1) % cards.length);
    }, 4000);
    return () => clearInterval(interval);
  }, [cards.length]);

  const handleSearchClick = () => {
    const token = localStorage.getItem('authToken');
    
    if (token) {
      navigate('/search');
    } else {
      setShowLoginModal(true);
    }
  };

  const handleDashboard = () => {
    if (userInfo?.role === 'PROFESSIONAL') {
      navigate('/professional-dashboard');
    } else {
      navigate('/client-dashboard');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-500 via-purple-600 to-pink-500 animate-fadeIn overflow-x-hidden">
      {userInfo ? (
        <div className="h-screen flex flex-col justify-center items-center px-4 text-center">
          <div 
            onClick={() => window.location.href = 'https://www.calificalo.com.ar/'}
            className="flex items-center justify-center cursor-pointer hover:scale-105 transition-transform mb-6 sm:mb-10 animate-slideDown"
          >
            <img 
              src="/Logo-calificalo.png" 
              alt="Calificalo" 
              className="h-46 sm:h-56 md:h-64 lg:h-72 w-auto logo-pulse"
            />
          </div>
                  
          <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl roboto-light text-white mb-6 sm:mb-8 animate-slideUp leading-tight">
            ¡Qué bueno tenerte
            <br />
            otra vez acá,
            <br />
            <span className="text-yellow-300 font-bold">{userInfo.name}!</span>
          </h1>
          
          <button
            onClick={handleDashboard}
            className="bg-gradient-to-r from-yellow-400 to-orange-500 text-white px-10 sm:px-12 py-4 sm:py-5 rounded-2xl font-bold text-xl sm:text-2xl shadow-2xl hover:shadow-yellow-500/50 hover:scale-105 transition-all flex items-center justify-center gap-3 hover:brightness-110"
          >
            Ingresar
            <ArrowRight className="w-6 h-6 sm:w-7 sm:h-7" />
          </button>
        </div>
      ) : (
        <>
          <div className="max-w-6xl mx-auto px-4 pt-6 sm:pt-12 pb-8 sm:pb-10 text-center">
            <div 
              onClick={() => window.location.href = 'https://www.calificalo.com.ar/'}
              className="flex items-center justify-center cursor-pointer hover:scale-105 transition-transform mb-4 sm:mb-8 animate-slideDown"
            >
              <img 
                src="/Logo-calificalo.png" 
                alt="Calificalo" 
                className="h-40 sm:h-48 md:h-56 lg:h-64 w-auto logo-pulse"
              />
            </div>
            
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl roboto-light text-white mb-3 sm:mb-5 animate-slideUp leading-tight">
              Construí tu reputación
              <br />
              <span className="text-yellow-300 font-bold">profesional</span>
            </h1>
            
            <p className="text-base sm:text-lg md:text-xl lg:text-2xl text-white/90 mb-8 sm:mb-10 max-w-2xl mx-auto animate-slideUp delay-100 px-4 leading-snug">
              La plataforma que transforma calificaciones en oportunidades laborales para profesionales de todos los rubros
            </p>

            <div className="flex flex-col gap-3 sm:gap-4 justify-center items-center animate-slideUp delay-200 px-4">
              <button
                onClick={() => navigate('/professional-login')}
                className="w-full sm:w-auto bg-gradient-to-r from-yellow-400 to-orange-500 text-white px-8 sm:px-10 py-4 sm:py-5 rounded-2xl font-bold text-lg sm:text-xl shadow-2xl hover:shadow-yellow-500/50 hover:scale-105 transition-all flex items-center justify-center gap-2 hover:brightness-110"
              >
                <UserPlus className="w-6 h-6 sm:w-7 sm:h-7" />
                Soy profesional
              </button>
              
              <button
                onClick={() => navigate('/client-login')}
                className="w-full sm:w-auto bg-gradient-to-r from-green-500 to-teal-600 text-white px-8 sm:px-10 py-4 sm:py-5 rounded-2xl font-bold text-lg sm:text-xl shadow-2xl hover:shadow-green-500/50 hover:scale-105 transition-all flex items-center justify-center gap-2 hover:brightness-110 whitespace-nowrap"
              >
                <span className="text-2xl">⭐</span>
                Soy cliente y quiero calificar
              </button>

              <button
                onClick={handleSearchClick}
                className="w-full sm:w-auto bg-gradient-to-r from-blue-500 to-indigo-600 text-white px-8 sm:px-10 py-4 sm:py-5 rounded-2xl font-bold text-lg sm:text-xl shadow-2xl hover:shadow-blue-500/50 hover:scale-105 transition-all flex items-center justify-center gap-2 hover:brightness-110"
              >
                <Search className="w-6 h-6 sm:w-7 sm:h-7" />
                Buscar profesional
              </button>
            </div>
          </div>

          {/* 3D Carousel */}
          <div className="max-w-6xl mx-auto px-4 py-12 sm:py-16 flex items-center justify-center">
            <div className="carousel-3d">
              {active > 0 && (
                <button 
                  className="nav-button top" 
                  onClick={() => setActive(i => i - 1)}
                >
                  <ChevronUp />
                </button>
              )}
              
              {cards.map((card, i) => {
                const Icon = card.icon;
                const offset = (active - i) / 3;
                const direction = Math.sign(active - i);
                const absOffset = Math.abs(active - i) / 3;
                const isActive = i === active ? 1 : 0;
                
                return (
                  <div
                    key={i}
                    className="card-container-3d"
                    style={{
                      '--active': isActive,
                      '--offset': offset,
                      '--direction': direction,
                      '--abs-offset': absOffset,
                      pointerEvents: active === i ? 'auto' : 'none',
                      opacity: Math.abs(active - i) >= MAX_VISIBILITY ? '0' : '1',
                      display: Math.abs(active - i) > MAX_VISIBILITY ? 'none' : 'block',
                    }}
                  >
                    <div className="feature-card-3d">
                      <div className={`bg-gradient-to-r ${card.gradient} w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg`}>
                        <Icon className="w-10 h-10 text-white" />
                      </div>
                      <h3 className="card-title">{card.title}</h3>
                      <p className="card-description">{card.description}</p>
                    </div>
                  </div>
                );
              })}
              
              {active < cards.length - 1 && (
                <button 
                  className="nav-button bottom" 
                  onClick={() => setActive(i => i + 1)}
                >
                  <ChevronDown />
                </button>
              )}
            </div>
          </div>

          {/* CTA Section */}
          <div className="hidden sm:block max-w-4xl mx-auto px-4 py-12 sm:py-16 text-center">
            <div className="bg-white/10 backdrop-blur-md rounded-3xl p-6 sm:p-12 animate-scaleIn">
              <QrCode className="w-14 sm:w-18 md:w-20 h-14 sm:h-18 md:h-20 text-white mx-auto mb-4 sm:mb-6 animate-pulseGlow" />
              <h2 className="text-2xl sm:text-3xl md:text-4xl roboto-light text-white mb-3 sm:mb-4">
                ¿Cómo funciona?
              </h2>
              <p className="text-base sm:text-lg md:text-xl text-white/90 mb-6 sm:mb-8 max-w-2xl mx-auto">
                Generá tu código QR único, los clientes lo escanean después del servicio, 
                califican tu atención y construís tu CV profesional con experiencia verificada.
              </p>
              <button
                onClick={() => navigate('/professional-register')}
                className="w-full sm:w-auto bg-yellow-400 text-purple-900 px-6 sm:px-8 md:px-10 py-4 sm:py-5 rounded-2xl font-bold text-lg sm:text-xl shadow-2xl hover:scale-105 transition-all ripple"
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
          <p className="text-sm sm:text-base">© 2025 Calificalo - Tu reputación profesional</p>
        </div>
      </footer>

      {showLoginModal && (
        <LoginRequiredModal onClose={() => setShowLoginModal(false)} />
      )}
    </div>
  );
}

export default LandingPage;