import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Loader2, ArrowLeft, User, AlertCircle, Eye, EyeOff, Star } from 'lucide-react';
import Toast from '../components/Toast';
import ErrorModal from '../components/ErrorModal';
import { exchangeOAuthCode, handlePostLoginRedirect, saveAuthData, getLoginErrorMessage } from '../utils/authUtils';
import { BACKEND_URL } from '../config';

function ClientLogin() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState(null);
  const [errorModal, setErrorModal] = useState(null);
  const [loginError, setLoginError] = useState('');
  const [shake, setShake] = useState(false);
  const [qrProfessionalName, setQrProfessionalName] = useState(null);

  useEffect(() => {
    // Detectar si viene de un QR
    const name = localStorage.getItem('qrProfessionalName');
    if (name) setQrProfessionalName(name);

    const errorParam = searchParams.get('error');
    if (errorParam === 'email_already_registered_as_professional') {
      setErrorModal({
        title: 'Email ya registrado',
        message: 'Este email ya está registrado como Profesional. Por favor, usá otro email o iniciá sesión como Profesional.'
      });
      return;
    }

    const code = searchParams.get('code');
    if (code) {
      window.history.replaceState({}, document.title, window.location.pathname);

      exchangeOAuthCode(code).then((data) => {
        if (!data) {
          setToast({ type: 'error', message: 'Error al procesar autenticación. Intentá nuevamente.' });
          return;
        }

        saveAuthData('CLIENT', data.token, {
          id: data.id,
          email: data.email,
          name: data.name
        });

        if (data.userType === 'CLIENT') {
          setToast({ type: 'success', message: '¡Login exitoso! Redirigiendo...' });
          setTimeout(() => {
            handlePostLoginRedirect('/client-dashboard', navigate, true);
          }, 300);
        } else {
          handlePostLoginRedirect('/professional-dashboard', navigate, true);
        }
      });
    }
  }, [searchParams, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setLoginError('');
    setShake(false);

    try {
      const response = await fetch(`${BACKEND_URL}/api/auth/login-client`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });

      if (!response.ok) {
        const errorMessage = await getLoginErrorMessage(response);
        setLoginError(errorMessage);
        setShake(true);
        setPassword('');
        setTimeout(() => setShake(false), 500);
        setLoading(false);
        return;
      }

      const data = await response.json();

      saveAuthData('CLIENT', data.token, {
        id: data.id,
        email: data.email,
        name: data.name
      });

      // Limpiar el contexto del QR
      localStorage.removeItem('qrProfessionalName');

      setToast({ type: 'success', message: '¡Login exitoso!' });

      setTimeout(() => {
        handlePostLoginRedirect('/client-dashboard', navigate, true);
      }, 300);

    } catch (err) {
      console.error('Error en login:', err);
      setLoginError('Error de conexión. Intentá nuevamente.');
      setShake(true);
      setTimeout(() => setShake(false), 500);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = () => {
    window.location.href = `${BACKEND_URL}/oauth2/authorization/google-client`;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-500 to-teal-600 flex items-center justify-center p-4 animate-fadeIn">
      <div className="max-w-md w-full space-y-3">

        {/* Banner QR — visible solo si viene de escanear un QR */}
        {qrProfessionalName && (
          <div className="bg-yellow-400 rounded-2xl px-4 py-4 flex items-start gap-3 animate-slideDown shadow-lg">
            <Star className="w-6 h-6 text-yellow-800 flex-shrink-0 mt-0.5 fill-yellow-800" />
            <div>
              <p className="font-bold text-yellow-900 text-sm sm:text-base">
                Escaneaste el QR de {qrProfessionalName}
              </p>
              <p className="text-yellow-800 text-xs sm:text-sm mt-0.5">
                Iniciá sesión o creá una cuenta para poder calificar
              </p>
            </div>
          </div>
        )}

        {/* Card de login */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 animate-scaleIn">
          <button
            type="button"
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

          <button
            type="button"
            onClick={handleGoogleLogin}
            className="w-full bg-white border-2 border-gray-300 text-gray-700 font-semibold py-2.5 sm:py-3 rounded-2xl mb-3 sm:mb-4 flex items-center justify-center hover:bg-gray-50 transition-all hover-lift text-sm sm:text-base"
          >
            <svg className="w-5 h-5 mr-3" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
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
                autoComplete="email"
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
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    setLoginError('');
                  }}
                  placeholder="••••••••"
                  autoComplete="current-password"
                  required
                  className={`w-full border-2 rounded-2xl px-4 py-2.5 sm:py-3 pr-12 focus:outline-none transition-all text-sm sm:text-base ${
                    loginError
                      ? 'border-red-500 focus:border-red-500'
                      : 'border-gray-200 focus:border-green-500'
                  } ${shake ? 'animate-shake' : ''}`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

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

            <button
              type="button"
              onClick={() => {}}
              className="w-full text-green-600 font-semibold hover:text-green-700 transition-colors text-sm sm:text-base"
            >
              ¿Olvidaste tu contraseña?
            </button>
          </form>

          <div className="mt-4 sm:mt-5 text-center">
            <p className="text-gray-600 text-sm sm:text-base">
              ¿No tenés cuenta?{' '}
              <button
                type="button"
                onClick={() => navigate('/client-register')}
                className="text-green-600 font-semibold hover:text-green-700"
              >
                Registrate acá
              </button>
            </p>
          </div>
        </div>
      </div>

      {toast && (
        <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />
      )}

      {errorModal && (
        <ErrorModal
          title={errorModal.title}
          message={errorModal.message}
          onClose={() => setErrorModal(null)}
        />
      )}

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