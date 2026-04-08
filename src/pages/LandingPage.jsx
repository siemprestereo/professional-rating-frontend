import { useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { Star, Users, TrendingUp, QrCode, Search, UserPlus, ArrowRight, Download, ChevronDown, ChevronUp } from 'lucide-react';
import LoginRequiredModal from '../components/LoginRequiredModal';
import SearchComingSoonModal from '../components/SearchComingSoonModal';
import { getFirstName } from '../utils/formatName';

function FaqItem({ question, answer }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="bg-white/10 rounded-2xl overflow-hidden">
      <button onClick={() => setOpen(!open)} className="w-full flex items-center justify-between px-4 py-3 text-left text-white font-semibold text-sm sm:text-base gap-2">
        <span>{question}</span>
        {open ? <ChevronUp className="w-4 h-4 flex-shrink-0" /> : <ChevronDown className="w-4 h-4 flex-shrink-0" />}
      </button>
      {open && <p className="px-4 pb-3 text-white/80 text-sm sm:text-base">{answer}</p>}
    </div>
  );
}

function LandingPage() {
  const navigate = useNavigate();
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [userInfo, setUserInfo] = useState(null);
  const [installPrompt, setInstallPrompt] = useState(null);
  const [faqOpen, setFaqOpen] = useState(null);
  const [showSearchComingSoon, setShowSearchComingSoon] = useState(false);

  useEffect(() => {
    // Obtener información del usuario del token
    const token = localStorage.getItem('authToken');
    if (token) {
      try {
        const base64 = token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/');
        const payload = JSON.parse(decodeURIComponent(atob(base64).split('').map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2)).join('')));
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

    // PWA: capturar evento de instalación
    const handleInstallPrompt = (e) => {
      e.preventDefault();
      setInstallPrompt(e);
    };
    window.addEventListener('beforeinstallprompt', handleInstallPrompt);
    return () => window.removeEventListener('beforeinstallprompt', handleInstallPrompt);
  }, []);

  const handleInstall = async () => {
    if (!installPrompt) return;
    installPrompt.prompt();
    const result = await installPrompt.userChoice;
    if (result.outcome === 'accepted') {
      setInstallPrompt(null);
    }
  };

  const handleSearchClick = () => {
    setShowSearchComingSoon(true);
  };

  const handleDashboard = () => {
    if (userInfo?.role === 'PROFESSIONAL') {
      navigate('/professional-dashboard');
    } else if (userInfo?.role === 'ADMIN') {
      navigate('/admin');
    } else {
      navigate('/client-dashboard');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-500 via-purple-600 to-pink-500 animate-fadeIn">
      {/* Hero Section - Condicional según si está logueado */}
      {userInfo ? (
        // Usuario logueado - Mostrar bienvenida con logo grande
        <div className="h-screen flex flex-col justify-center items-center px-4 text-center">
          {/* Logo grande arriba del mensaje */}
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

          {installPrompt && (
            <button
              onClick={handleInstall}
              className="mt-4 bg-white/20 backdrop-blur-md text-white px-6 py-3 rounded-2xl font-semibold text-base shadow-lg hover:bg-white/30 hover:scale-105 transition-all flex items-center gap-2"
            >
              <Download className="w-5 h-5" />
              Instalar App
            </button>
          )}
        </div>
      ) : (
        <>
          <div className="max-w-6xl mx-auto px-4 pt-4 sm:pt-8 pb-4 sm:pb-6 text-center flex flex-col justify-center">
            {/* Logo arriba del título */}
            <div
              onClick={() => window.location.href = 'https://www.calificalo.com.ar/'}
              className="flex items-center justify-center cursor-pointer hover:scale-105 transition-transform mb-2 sm:mb-4 animate-slideDown"
            >
              <img
                src="/Logo-calificalo.png"
                alt="Calificalo"
                className="h-28 sm:h-36 md:h-44 lg:h-52 w-auto logo-pulse"
              />
            </div>

            <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl roboto-light text-white mb-2 sm:mb-3 animate-slideUp leading-tight">
              Construí tu reputación
              <br />
              <span className="text-yellow-300 font-bold">profesional</span>
            </h1>

            <p className="text-sm sm:text-base md:text-lg text-white/90 mb-4 sm:mb-6 max-w-2xl mx-auto animate-slideUp delay-100 px-4 leading-snug">
              La plataforma que transforma calificaciones en oportunidades laborales para profesionales de todos los rubros
            </p>

            <div className="flex flex-col gap-2 sm:gap-3 justify-center items-center animate-slideUp delay-200 px-4">
              <button
                onClick={() => navigate('/professional-login')}
                className="w-full sm:w-auto bg-gradient-to-r from-yellow-400 to-orange-500 text-white px-8 sm:px-10 py-3 sm:py-4 rounded-2xl font-bold text-base sm:text-lg shadow-2xl hover:shadow-yellow-500/50 hover:scale-105 transition-all flex items-center justify-center gap-2 hover:brightness-110"
              >
                <UserPlus className="w-6 h-6 sm:w-7 sm:h-7" />
                Soy profesional
              </button>

              <button
                onClick={() => navigate('/client-login')}
                className="w-full sm:w-auto bg-gradient-to-r from-green-500 to-teal-600 text-white px-8 sm:px-10 py-3 sm:py-4 rounded-2xl font-bold text-base sm:text-lg shadow-2xl hover:shadow-green-500/50 hover:scale-105 transition-all flex items-center justify-center gap-2 hover:brightness-110 whitespace-nowrap"
              >
                <span className="text-2xl">⭐</span>
                Soy cliente y quiero calificar
              </button>

              <button
                onClick={handleSearchClick}
                className="w-full sm:w-auto bg-gradient-to-r from-blue-500 to-indigo-600 text-white px-8 sm:px-10 py-3 sm:py-4 rounded-2xl font-bold text-base sm:text-lg shadow-2xl hover:shadow-blue-500/50 hover:scale-105 transition-all flex items-center justify-center gap-2 hover:brightness-110"
              >
                <Search className="w-6 h-6 sm:w-7 sm:h-7" />
                Buscar profesional
              </button>

              {installPrompt && (
                <button
                  onClick={handleInstall}
                  className="w-full sm:w-auto bg-white/20 backdrop-blur-md text-white px-8 sm:px-10 py-4 sm:py-5 rounded-2xl font-bold text-lg sm:text-xl shadow-lg hover:bg-white/30 hover:scale-105 transition-all flex items-center justify-center gap-2"
                >
                  <Download className="w-6 h-6 sm:w-7 sm:h-7" />
                  Instalar App
                </button>
              )}
            </div>
          </div>

          {/* FAQ */}
          <div className="max-w-2xl mx-auto px-4 pb-6 sm:pb-10">
            <p className="text-white/80 text-center mb-4 text-base sm:text-lg">¿Querés saber cómo funciona? ¿Sos Cliente? ¿Sos Profesional y brindas un servicio? </p>
            <div className="flex gap-3 justify-center mb-4">
              <button
                onClick={() => setFaqOpen(faqOpen === 'client' ? null : 'client')}
                className={`flex-1 sm:flex-none px-6 py-3 rounded-2xl font-bold text-base transition-all ${faqOpen === 'client' ? 'bg-green-500 text-white shadow-lg scale-105' : 'bg-white/20 text-white hover:bg-white/30'}`}
              >
                Soy cliente ⭐
              </button>
              <button
                onClick={() => setFaqOpen(faqOpen === 'professional' ? null : 'professional')}
                className={`flex-1 sm:flex-none px-6 py-3 rounded-2xl font-bold text-base transition-all ${faqOpen === 'professional' ? 'bg-yellow-400 text-purple-900 shadow-lg scale-105' : 'bg-white/20 text-white hover:bg-white/30'}`}
              >
                Soy profesional 💼
              </button>
            </div>

            {faqOpen === 'client' && (
              <div className="bg-white/10 backdrop-blur-md rounded-3xl p-6 animate-slideUp space-y-3">
                {[
                  { q: '¿Qué es Calificalo?', a: 'Una plataforma donde podés calificar a profesionales que te prestaron un servicio y ayudar a otros a elegir bien.' },
                  { q: '¿Cómo califico a un profesional?', a: 'Escaneás el código QR que te muestra el profesional y dejás tu calificación en segundos.' },
                  { q: '¿Es gratis registrarse?', a: 'Sí, totalmente gratis. Solo necesitás un email para crear tu cuenta.' },
                  { q: '¿Las calificaciones que haga son anónimas?', a: 'El profesional que califiques sólo podrá ver tu nombre, no tu apellido ni tu mail.' },
                  { q: '¿Qué pasa si me arrepiento de una calificación?', a: 'Tendrás 30 minutos para editarla o borrarla.' },
                ].map((item, i) => (
                  <FaqItem key={i} question={item.q} answer={item.a} />
                ))}
                <button onClick={() => navigate('/client-login')} className="w-full mt-2 bg-green-500 text-white font-bold py-3 rounded-2xl hover:scale-105 transition-all">
                  Registrarme como cliente
                </button>
              </div>
            )}

            {faqOpen === 'professional' && (
              <div className="bg-white/10 backdrop-blur-md rounded-3xl p-6 animate-slideUp space-y-3">
                {[
                  { q: '¿Cómo recibo calificaciones?', a: 'Desde el panel principal podés generar un QR y mostrarlo a tu cliente para que pueda calificarte.' },
                  { q: '¿Cómo es el sistema de puntaje?', a: 'Pueden puntuar tu servicio de 1 a 5 y si lo desean dejar un comentario.' },
                  { q: '¿Qué es el CV digital?', a: 'Es tu perfil público en Calificalo: muestra tu información laboral y las calificaciones que te brindaron los clientes.' },
                  { q: '¿Qué pasa con mis calificaciones si cambio de trabajo?', a: 'Te acompañan. Las calificaciones son tuyas, no del lugar donde trabajás.' },
                  { q: '¿Es gratis para profesionales?', a: 'Sí, el registro y el uso básico son completamente gratuitos.' },
                  { q: '¿Puedo compartir mi CV?', a: 'Sí, tu CV puede ser visto por cualquier persona a la que le compartas el link.' },
                ].map((item, i) => (
                  <FaqItem key={i} question={item.q} answer={item.a} />
                ))}
                <button onClick={() => navigate('/professional-login')} className="w-full mt-2 bg-yellow-400 text-purple-900 font-bold py-3 rounded-2xl hover:scale-105 transition-all">
                  Registrarme como profesional
                </button>
              </div>
            )}
          </div>

          {/* Features */}
          <div className="max-w-6xl mx-auto px-4 py-12 sm:py-16 grid md:grid-cols-3 gap-6 sm:gap-8">
            <div className="bg-white/10 backdrop-blur-md rounded-3xl p-6 sm:p-8 text-center animate-slideUp delay-300 hover-lift">
              <Star className="w-14 sm:w-16 h-14 sm:h-16 text-yellow-300 mx-auto mb-3 sm:mb-4" />
              <h3 className="text-2xl sm:text-3xl roboto-light text-white mb-2 sm:mb-3">
                Recibí Calificaciones
              </h3>
              <p className="text-base sm:text-lg text-white/80">
                Los clientes escanean tu QR y califican tu servicio profesional
              </p>
            </div>

            <div className="bg-white/10 backdrop-blur-md rounded-3xl p-6 sm:p-8 text-center animate-slideUp delay-400 hover-lift">
              <TrendingUp className="w-14 sm:w-16 h-14 sm:h-16 text-green-300 mx-auto mb-3 sm:mb-4" />
              <h3 className="text-2xl sm:text-3xl roboto-light text-white mb-2 sm:mb-3">
                Construí tu Reputación
              </h3>
              <p className="text-base sm:text-lg text-white/80">
                Tu historial y promedio te acompañan a donde vayas
              </p>
            </div>

            <div className="bg-white/10 backdrop-blur-md rounded-3xl p-6 sm:p-8 text-center animate-slideUp delay-500 hover-lift">
              <Users className="w-14 sm:w-16 h-14 sm:h-16 text-blue-300 mx-auto mb-3 sm:mb-4" />
              <h3 className="text-2xl sm:text-3xl roboto-light text-white mb-2 sm:mb-3">
                Conseguí Mejores Trabajos
              </h3>
              <p className="text-base sm:text-lg text-white/80">
                Los empleadores buscan profesionales con buena reputación
              </p>
            </div>
          </div>

          {/* CTA Section - Solo visible en tablet y desktop */}
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
        <div className="max-w-6xl mx-auto px-4 text-center text-white/70 space-y-1">
          <p className="text-sm sm:text-base">Consultas y sugerencias: <a href="mailto:hola@calificalo.com.ar" className="text-white/90 hover:text-white underline transition-colors">hola@calificalo.com.ar</a></p>
          <p className="text-sm sm:text-base">© 2025 Calificalo - Tu reputación profesional</p>
          <p className="text-sm sm:text-base">
            <a href="/terms" className="text-white/70 hover:text-white underline transition-colors">Términos y condiciones</a>
          </p>
        </div>
      </footer>

      {/* Modal de Login Requerido */}
      {showLoginModal && (
        <LoginRequiredModal onClose={() => setShowLoginModal(false)} />
      )}
      {showSearchComingSoon && <SearchComingSoonModal onClose={() => setShowSearchComingSoon(false)} />}
    </div>
  );
}

export default LandingPage;