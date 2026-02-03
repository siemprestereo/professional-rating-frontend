import { useNavigate } from 'react-router-dom';
import { useState, useEffect, useRef } from 'react';
import { Star, Users, TrendingUp, QrCode, Search, UserPlus, ArrowRight } from 'lucide-react';
import LoginRequiredModal from '../components/LoginRequiredModal';
import { getFirstName } from '../utils/formatName';

function LandingPage() {
  const navigate = useNavigate();
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [userInfo, setUserInfo] = useState(null);
  const [currentCard, setCurrentCard] = useState(0);
  const [touchStart, setTouchStart] = useState(0);
  const [touchEnd, setTouchEnd] = useState(0);
  const containerRef = useRef(null);

  const cards = [
    {
      icon: Star,
      title: 'Recibí Calificaciones',
      description: 'Los clientes escanean tu QR y califican tu servicio profesional',
      color: 'text-yellow-300'
    },
    {
      icon: TrendingUp,
      title: 'Construí tu Reputación',
      description: 'Tu historial y promedio te acompañan a donde vayas',
      color: 'text-green-300'
    },
    {
      icon: Users,
      title: 'Conseguí Mejores Trabajos',
      description: 'Los empleadores buscan profesionales con buena reputación',
      color: 'text-blue-300'
    }
  ];

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

  // Auto-rotate cards
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentCard((prev) => (prev + 1) % cards.length);
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  const handleTouchStart = (e) => {
    setTouchStart(e.touches[0].clientY);
  };

  const handleTouchMove = (e) => {
    setTouchEnd(e.touches[0].clientY);
  };

  const handleTouchEnd = () => {
    if (!touchStart || !touchEnd) return;
    
    const distance = touchStart - touchEnd;
    const minSwipeDistance = 50;

    if (distance > minSwipeDistance) {
      // Swipe up
      setCurrentCard((prev) => (prev + 1) % cards.length);
    } else if (distance < -minSwipeDistance) {
      // Swipe down
      setCurrentCard((prev) => (prev - 1 + cards.length) % cards.length);
    }

    setTouchStart(0);
    setTouchEnd(0);
  };

  const handleWheel = (e) => {
    e.preventDefault();
    if (e.deltaY > 0) {
      setCurrentCard((prev) => (prev + 1) % cards.length);
    } else {
      setCurrentCard((prev) => (prev - 1 + cards.length) % cards.length);
    }
  };

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

  const getCardStyle = (index) => {
    const diff = index - currentCard;
    const totalCards = cards.length;
    
    // Normalizar diff para que siempre tome el camino más corto
    let normalizedDiff = diff;
    if (Math.abs(diff) > totalCards / 2) {
      normalizedDiff = diff > 0 ? diff - totalCards : diff + totalCards;
    }

    const angle = normalizedDiff * 30; // 30 grados entre cada card
    const translateZ = Math.abs(normalizedDiff) === 0 ? 0 : -100;
    const opacity = Math.abs(normalizedDiff) === 0 ? 1 : 0.4;
    const scale = Math.abs(normalizedDiff) === 0 ? 1 : 0.8;

    return {
      transform: `rotateX(${-angle}deg) translateZ(${translateZ}px) scale(${scale})`,
      opacity: opacity,
      zIndex: 10 - Math.abs(normalizedDiff)
    };
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-500 via-purple-600 to-pink-500 animate-fadeIn">
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
          <div className="max-w-6xl mx-auto px-4 pt-6 sm:pt-12 pb-8 sm:pb-10 text-center min-h-screen flex flex-col justify-center">
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

          {/* 3D Rotating Cards */}
          <div className="max-w-6xl mx-auto px-4 py-12 sm:py-16 h-[500px] flex items-center justify-center">
            <div 
              ref={containerRef}
              className="relative w-full max-w-md h-[400px] perspective-1000"
              onTouchStart={handleTouchStart}
              onTouchMove={handleTouchMove}
              onTouchEnd={handleTouchEnd}
              onWheel={handleWheel}
              style={{ perspective: '1000px' }}
            >
              <div className="relative w-full h-full preserve-3d">
                {cards.map((card, index) => {
                  const Icon = card.icon;
                  return (
                    <div
                      key={index}
                      className="absolute w-full bg-white/10 backdrop-blur-md rounded-3xl p-8 text-center transition-all duration-700 ease-out preserve-3d"
                      style={getCardStyle(index)}
                    >
                      <Icon className={`w-16 h-16 ${card.color} mx-auto mb-4`} />
                      <h3 className="text-3xl roboto-light text-white mb-3">
                        {card.title}
                      </h3>
                      <p className="text-lg text-white/80">
                        {card.description}
                      </p>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Indicadores */}
            <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 flex gap-2">
              {cards.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentCard(index)}
                  className={`w-3 h-3 rounded-full transition-all ${
                    currentCard === index 
                      ? 'bg-white w-8' 
                      : 'bg-white/50'
                  }`}
                />
              ))}
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