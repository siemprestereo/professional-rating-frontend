import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Loader2, ArrowLeft, User, AlertCircle } from 'lucide-react';
import Toast from '../components/Toast';
import ErrorModal from '../components/ErrorModal';

function ClientLogin() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState(null);
  const [errorModal, setErrorModal] = useState(null);
  const [loginError, setLoginError] = useState('');
  const [shake, setShake] = useState(false);

  // Detectar errores de OAuth y capturar token
  useEffect(() => {
    // Detectar errores de OAuth
    const errorParam = searchParams.get('error');
    
    if (errorParam === 'email_already_registered_as_professional') {
      setErrorModal({
        title: 'Email ya registrado',
        message: 'Este email ya está registrado como Profesional. Por favor, usá otro email o iniciá sesión como Profesional.'
      });
      return;
    }

    // Capturar token de OAuth
    const token = searchParams.get('token');
    if (token) {
      console.log('✅ Token recibido de OAuth:', token);
      localStorage.setItem('authToken', token);
      localStorage.setItem('userType', 'CLIENT');
      
      try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        console.log('📦 Payload del token:', payload);
        
        if (payload.userType === 'CLIENT') {
          setToast({ type: 'success', message: '¡Login exitoso! Redirigiendo...' });
          setTimeout(() => {
            window.location.href = 'https://www.calificalo.com.ar/client-dashboard';
          }, 1000);
        } else {
          window.location.href = 'https://www.calificalo.com.ar/professional-dashboard';
        }
      } catch (e) {
        console.error('Error al decodificar token:', e);
        setToast({ type: 'error', message: 'Error al procesar autenticación' });
      }
    }
  }, [searchParams]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setLoginError('');
    setShake(false);

    try {
      const backendUrl = 'https://professional-rating-backend-production.up.railway.app';
      const response = await fetch(`${backendUrl}/api/auth/login-client`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });

      if (!response.ok) {
        const data = await response.json();
        
        setLoginError('Email o contraseña incorrectos');
        setShake(true);
        
        setTimeout(() => setShake(false), 500);
        
        setLoading(false);
        return;
      }

      const data = await response.json();
      
      localStorage.setItem('authToken', data.token);
      localStorage.setItem('userType', 'CLIENT');
      
      localStorage.setItem('client', JSON.stringify({
        id: data.id,
        email: data.email,
        name: data.name
      }));

      setToast({ type: 'success', message: '¡Login exitoso!' });
      
      setTimeout(() => {
        window.location.href = 'https://www.calificalo.com.ar/client-dashboard';
      }, 1000);
    } catch (err) {
      setLoginError('Error de conexión. Intentá nuevamente.');
      setShake(true);
      setTimeout(() => setShake(false), 500);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = () => {
    const backendUrl = 'https://professional-rating-backend-production.up.railway.app';
    window.location.href = `${backendUrl}/oauth2/authorization/google-client`;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-500 to-teal-600 flex items-center justify-center p-4 animate-fadeIn">
      <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-md w-full animate-scaleIn">
        <button
          onClick={() => navigate('/')}
          className="text-gray-600 mb-3 sm:mb-4 flex items-center hover:text-gray-800 transition-colors text-base"
        >
          <ArrowLeft className="w-5 h-5 mr-2" />
          Volver
        </button>

        <div className="text-center mb-5 sm:mb-6">
          <div className="w-16 h-16 sm:w-20 sm:h-20 bg-gradient-to-br from-green-500 to-teal-600 rounded-full mx-auto mb-3 sm:mb-4 flex items-center justify-center animate-scaleIn">
            <User className="w-8 h-8 sm:w-10 sm:h-10 text-white" />
          </div>
          <h1 className="text-2xl sm:text-3xl roboto-light text-gray-800 mb-1 sm:mb-2">
            Ingreso Clientes
          </h1>
          <p className="text-sm sm:text-base text-gray-600">
            Accedé para calificar profesionales
          </p>
        </div>

        {/* Botón de Google */}
        <button
          onClick={handleGoogleLogin}
          className="w-full bg-white border-2 border-gray-300 text-gray-700 font-semibold py-2.5 sm:py-3 rounded-2xl mb-3 sm:mb-4 flex items-center justify-center hover:bg-gray-50 transition-all hover-lift text-sm sm:text-base"
        >
          <svg className="w-5 h-5 mr-3" viewBox="0 0 24 24">
            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
          </svg>
          Continuar con Google
        </button>

        <div className="relative mb-4 sm:mb-5">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-300"></div>
          </div>
          <div className="relative flex justify-center text-xs sm:text-sm">
            <span className="px-4 bg-white text-gray-500">O ingresá con email</span>
          </div>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="mb-3 sm:mb-4">
            <label className="block text-gray-700 font-semibold mb-1.5 sm:mb-2 text-sm sm:text-base">
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                setLoginError('');
              }}
              placeholder="tu@email.com"
              required
              className={`w-full border-2 rounded-2xl px-4 py-2.5 sm:py-3 focus:outline-none transition-all text-sm sm:text-base ${
                loginError 
                  ? 'border-red-500 focus:border-red-500' 
                  : 'border-gray-200 focus:border-green-500'
              } ${shake ? 'animate-shake' : ''}`}
            />
          </div>

          <div className="mb-2">
            <label className="block text-gray-700 font-semibold mb-1.5 sm:mb-2 text-sm sm:text-base">
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                setLoginError('');
              }}
              placeholder="••••••••"
              required
              className={`w-full border-2 rounded-2xl px-4 py-2.5 sm:py-3 focus:outline-none transition-all text-sm sm:text-base ${
                loginError 
                  ? 'border-red-500 focus:border-red-500' 
                  : 'border-gray-200 focus:border-green-500'
              } ${shake ? 'animate-shake' : ''}`}
            />
          </div>

          {/* Mensaje de error inline */}
          {loginError && (
            <div className="mb-3 sm:mb-4 flex items-center gap-2 text-red-600 text-xs sm:text-sm animate-fadeIn">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{loginError}</span>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-r from-green-500 to-teal-600 text-white font-bold py-3 sm:py-3.5 rounded-2xl shadow-lg disabled:opacity-50 hover:scale-105 transition-all ripple mb-3 sm:mb-4 text-base sm:text-lg"
          >
            {loading ? (
              <span className="flex items-center justify-center">
                <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                Iniciando sesión...
              </span>
            ) : (
              'Iniciar Sesión'
            )}
          </button>

          {/* Botón olvidaste tu contraseña */}
          <button
            type="button"
            onClick={() => {
              console.log('Recuperar contraseña');
            }}
            className="w-full text-green-600 font-semibold hover:text-green-700 transition-colors text-sm sm:text-base"
          >
            ¿Olvidaste tu contraseña?
          </button>
        </form>

        <div className="mt-4 sm:mt-5 text-center">
          <p className="text-gray-600 text-sm sm:text-base">
            ¿No tenés cuenta?{' '}
            <button
              onClick={() => navigate('/client-register')}
              className="text-green-600 font-semibold hover:text-green-700"
            >
              Registrate acá
            </button>
          </p>
        </div>
      </div>

      {/* Toast notification */}
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}
      
      {/* Error modal */}
      {errorModal && (
        <ErrorModal
          title={errorModal.title}
          message={errorModal.message}
          onClose={() => setErrorModal(null)}
        />
      )}

      {/* Estilos de animación shake */}
      <style>{`
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          10%, 30%, 50%, 70%, 90% { transform: translateX(-10px); }
          20%, 40%, 60%, 80% { transform: translateX(10px); }
        }
        
        .animate-shake {
          animation: shake 0.5s cubic-bezier(.36,.07,.19,.97) both;
        }
      `}</style>
    </div>
  );
}

export default ClientLogin;