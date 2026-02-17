import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Loader2, ArrowLeft, UserPlus, Eye, EyeOff } from 'lucide-react';
import Toast from '../components/Toast';
import ErrorModal from '../components/ErrorModal';
import { exchangeOAuthCode, handlePostLoginRedirect, saveAuthData, formatName } from '../utils/authUtils';

function ClientRegister() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState(null);
  const [errorModal, setErrorModal] = useState(null);

  // Detectar errores de OAuth e intercambiar código por token
  useEffect(() => {
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
      // Limpiar la URL inmediatamente
      window.history.replaceState({}, document.title, window.location.pathname);

      // Intercambiar código por JWT
      exchangeOAuthCode(code).then((data) => {
        if (!data) {
          setToast({ type: 'error', message: 'Error al procesar autenticación. Intentá nuevamente.' });
          return;
        }

        // Guardar datos con función centralizada
        saveAuthData('CLIENT', data.token, {
          id: data.id,
          email: data.email,
          name: data.name
        });

        if (data.userType === 'CLIENT') {
          setToast({ type: 'success', message: '¡Registro exitoso! Redirigiendo...' });
          setTimeout(() => {
            handlePostLoginRedirect('/client-dashboard', navigate, true);
          }, 300);
        } else {
          handlePostLoginRedirect('/professional-dashboard', navigate, true);
        }
      });
    }
  }, [searchParams, navigate]);

  // Aplicar formatName solo al salir del campo
  const handleNameBlur = () => {
    setName(formatName(name));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Formatear nombre antes de enviar
    const formattedName = formatName(name);

    // Validaciones
    if (password !== confirmPassword) {
      setToast({ type: 'error', message: 'Las contraseñas no coinciden' });
      return;
    }

    if (password.length < 8) {
      setToast({ type: 'error', message: 'La contraseña debe tener al menos 6 caracteres' });
      return;
    }

    setLoading(true);

    try {
      const backendUrl = 'https://professional-rating-backend-production.up.railway.app';
      const response = await fetch(`${backendUrl}/api/auth/register-client`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: formattedName, email, password })
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Error al registrarse');
      }

      const data = await response.json();
      
      // Guardar con función centralizada
      saveAuthData('CLIENT', data.token, {
        id: data.id,
        email: data.email,
        name: data.name
      });

      setToast({ type: 'success', message: '¡Registro exitoso!' });
      
      setTimeout(() => {
        handlePostLoginRedirect('/client-dashboard', navigate, true);
      }, 300);
    } catch (err) {
      setToast({ type: 'error', message: err.message });
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
          type="button"
          onClick={() => navigate('/client-login')}
          className="text-gray-600 mb-3 sm:mb-4 flex items-center hover:text-gray-800 transition-colors text-base"
        >
          <ArrowLeft className="w-5 h-5 mr-2" />
          Volver al login
        </button>

        <div className="text-center mb-6 sm:mb-8">
          <div className="w-16 h-16 sm:w-20 sm:h-20 bg-gradient-to-br from-green-500 to-teal-600 rounded-full mx-auto mb-3 sm:mb-4 flex items-center justify-center animate-scaleIn">
            <UserPlus className="w-8 h-8 sm:w-10 sm:h-10 text-white" />
          </div>
          <h1 className="text-2xl sm:text-3xl roboto-light text-gray-800 mb-1 sm:mb-2">
            Registro Clientes
          </h1>
          <p className="text-sm sm:text-base text-gray-600">
            Creá tu cuenta para calificar profesionales
          </p>
        </div>

        {/* Botón de Google */}
        <button
          type="button"
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

        <div className="relative mb-4 sm:mb-6">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-300"></div>
          </div>
          <div className="relative flex justify-center text-xs sm:text-sm">
            <span className="px-4 bg-white text-gray-500">O registrate con email</span>
          </div>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="mb-3 sm:mb-4">
            <label className="block text-gray-700 font-semibold mb-1.5 sm:mb-2 text-sm sm:text-base">
              Nombre y apellido
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              onBlur={handleNameBlur}
              placeholder="Juan Pérez"
              autoComplete="name"
              required
              className="w-full border-2 border-gray-200 rounded-2xl px-4 py-2.5 sm:py-3 focus:border-green-500 focus:outline-none transition-all text-sm sm:text-base"
            />
          </div>

          <div className="mb-3 sm:mb-4">
            <label className="block text-gray-700 font-semibold mb-1.5 sm:mb-2 text-sm sm:text-base">
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="tu@email.com"
              autoComplete="email"
              required
              className="w-full border-2 border-gray-200 rounded-2xl px-4 py-2.5 sm:py-3 focus:border-green-500 focus:outline-none transition-all text-sm sm:text-base"
            />
          </div>

          <div className="mb-3 sm:mb-4">
            <label className="block text-gray-700 font-semibold mb-1.5 sm:mb-2 text-sm sm:text-base">
              Password
            </label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Mínimo 6 caracteres"
                autoComplete="new-password"
                required
                minLength={6}
                className="w-full border-2 border-gray-200 rounded-2xl px-4 py-2.5 sm:py-3 pr-12 focus:border-green-500 focus:outline-none transition-all text-sm sm:text-base"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
              >
                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
            <p className="text-xs text-gray-500 mt-1.5">Debe tener al menos 6 caracteres</p>
          </div>

          <div className="mb-4 sm:mb-6">
            <label className="block text-gray-700 font-semibold mb-1.5 sm:mb-2 text-sm sm:text-base">
              Confirmar Password
            </label>
            <div className="relative">
              <input
                type={showConfirmPassword ? "text" : "password"}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Repetí tu password"
                autoComplete="new-password"
                required
                className="w-full border-2 border-gray-200 rounded-2xl px-4 py-2.5 sm:py-3 pr-12 focus:border-green-500 focus:outline-none transition-all text-sm sm:text-base"
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
              >
                {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-r from-green-500 to-teal-600 text-white font-bold py-3 sm:py-4 rounded-2xl shadow-lg disabled:opacity-50 hover:scale-105 transition-all ripple text-base sm:text-lg"
          >
            {loading ? (
              <span className="flex items-center justify-center">
                <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                Creando cuenta...
              </span>
            ) : (
              'Crear Cuenta'
            )}
          </button>
        </form>

        <div className="mt-4 sm:mt-6 text-center">
          <p className="text-gray-600 text-sm sm:text-base">
            ¿Ya tenés cuenta?{' '}
            <button
              type="button"
              onClick={() => navigate('/client-login')}
              className="text-green-600 font-semibold hover:text-green-700"
            >
              Iniciá sesión
            </button>
          </p>
        </div>
      </div>

      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}
      
      {errorModal && (
        <ErrorModal
          title={errorModal.title}
          message={errorModal.message}
          onClose={() => setErrorModal(null)}
        />
      )}
    </div>
  );
}

export default ClientRegister;