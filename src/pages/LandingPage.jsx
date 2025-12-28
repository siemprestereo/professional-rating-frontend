import { useNavigate } from 'react-router-dom';
import { Star, Users, TrendingUp, QrCode, Search, LogIn, UserPlus } from 'lucide-react';

function LandingPage() {
  const navigate = useNavigate();

const handleGoogleLogin = () => {
  // Hardcodeado temporalmente para producción
  const backendUrl = 'https://professional-rating-backend-production.up.railway.app';
  console.log('Backend URL:', backendUrl);
  console.log('Full OAuth URL:', `${backendUrl}/oauth2/authorization/google`);
  window.location.href = `${backendUrl}/oauth2/authorization/google`;
};
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-500 via-purple-600 to-pink-500 animate-fadeIn">
      {/* Navbar */}
      <nav className="bg-white/10 backdrop-blur-md border-b border-white/20 px-4 py-4 animate-slideDown">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div 
            onClick={() => navigate('/')}
            className="text-2xl font-bold text-white cursor-pointer hover:scale-105 transition-transform"
          >
            ⭐ ProRate
          </div>
          
          <div className="flex gap-3">
            <button
              onClick={() => navigate('/search')}
              className="bg-white/20 hover:bg-white/30 text-white px-4 py-2 rounded-full font-semibold flex items-center gap-2 transition-all hover-lift"
            >
              <Search className="w-4 h-4" />
              <span className="hidden sm:inline">Buscar profesional</span>
            </button>
            
            <button
              onClick={() => navigate('/professional-login')}
              className="bg-white text-purple-600 hover:bg-gray-100 px-4 py-2 rounded-full font-semibold flex items-center gap-2 transition-all hover-lift"
            >
              <LogIn className="w-4 h-4" />
              <span className="hidden sm:inline">Soy profesional</span>
            </button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <div className="max-w-6xl mx-auto px-4 py-16 text-center">
        <h1 className="text-5xl md:text-6xl font-bold text-white mb-6 animate-slideUp">
          Construí tu Reputación
          <br />
          <span className="text-yellow-300">Profesional</span>
        </h1>
        
        <p className="text-xl text-white/90 mb-8 max-w-2xl mx-auto animate-slideUp delay-100">
          La plataforma que transforma calificaciones en oportunidades laborales para profesionales de todos los rubros
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center animate-slideUp delay-200">
          <button
            onClick={() => navigate('/professional-register')}
            className="bg-white text-purple-600 px-8 py-4 rounded-2xl font-bold text-lg shadow-2xl hover:scale-105 transition-all flex items-center gap-2 ripple"
          >
            <UserPlus className="w-6 h-6" />
            Registrarme como profesional
          </button>
          
          <button
            onClick={() => navigate('/client-login')}
            className="bg-white/20 backdrop-blur-md text-white px-8 py-4 rounded-2xl font-bold text-lg border-2 border-white/50 hover:bg-white/30 transition-all flex items-center gap-2"
          >
            <svg className="w-6 h-6" viewBox="0 0 24 24">
              <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
              <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
            Quiero calificar a alguien
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
        <div className="bg-white/10 backdrop-blur-md rounded-3xl p-12 animate-scaleIn">
          <QrCode className="w-20 h-20 text-white mx-auto mb-6 animate-pulseGlow" />
          <h2 className="text-3xl font-bold text-white mb-4">
            ¿Cómo funciona?
          </h2>
          <p className="text-white/90 text-lg mb-8 max-w-2xl mx-auto">
            Generá tu código QR único, los clientes lo escanean después del servicio, 
            califican tu atención y construís tu CV profesional con experiencia verificada.
          </p>
          <button
            onClick={() => navigate('/professional-register')}
            className="bg-yellow-400 text-purple-900 px-10 py-4 rounded-2xl font-bold text-lg shadow-2xl hover:scale-105 transition-all ripple"
          >
            Empezar Ahora - Es Gratis
          </button>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-black/20 backdrop-blur-md py-8 mt-16">
        <div className="max-w-6xl mx-auto px-4 text-center text-white/70">
          <p className="mb-2">© 2025 ProRate - Tu reputación profesional</p>
          <div className="flex gap-6 justify-center">
            <button onClick={() => navigate('/search')} className="hover:text-white transition-colors">
              Buscar profesional
            </button>
            <button onClick={() => navigate('/professional-login')} className="hover:text-white transition-colors">
              Login Profesionales
            </button>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default LandingPage;