import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Loader2, Mail } from 'lucide-react';
import { BACKEND_URL } from '../config';

function ForgotPassword() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await fetch(`${BACKEND_URL}/api/auth/forgot-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      if (res.status === 429) {
        setError('Demasiados intentos. Esperá 15 minutos.');
        return;
      }
      // Siempre mostramos éxito (el backend no revela si el email existe)
      setSent(true);
    } catch {
      setError('Error de conexión. Intentá nuevamente.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center p-4 animate-fadeIn">
      <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-md w-full animate-scaleIn">
        <button
          type="button"
          onClick={() => navigate(-1)}
          className="text-gray-600 mb-4 flex items-center hover:text-gray-800 transition-colors text-base"
        >
          <ArrowLeft className="w-5 h-5 mr-2" />
          Volver
        </button>

        <div className="text-center mb-6">
          <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full mx-auto mb-3 flex items-center justify-center">
            <Mail className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-2xl roboto-light text-gray-800 mb-1">Recuperar contraseña</h1>
          <p className="text-sm text-gray-600">Te enviamos un enlace para restablecer tu contraseña</p>
        </div>

        {sent ? (
          <div className="text-center py-4">
            <div className="w-14 h-14 bg-green-100 rounded-full mx-auto mb-4 flex items-center justify-center">
              <Mail className="w-7 h-7 text-green-600" />
            </div>
            <p className="text-gray-700 font-semibold mb-2">¡Listo!</p>
            <p className="text-sm text-gray-600 mb-6">
              Si el email está registrado, vas a recibir el enlace en los próximos minutos. Revisá también tu carpeta de spam.
            </p>
            <button
              type="button"
              onClick={() => navigate(-1)}
              className="w-full bg-gradient-to-r from-blue-500 to-purple-600 text-white font-bold py-3 rounded-2xl"
            >
              Volver al login
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit}>
            <div className="mb-4">
              <label className="block text-gray-700 font-semibold mb-2 text-sm">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => { setEmail(e.target.value); setError(''); }}
                placeholder="tu@email.com"
                required
                autoComplete="email"
                className="w-full border-2 border-gray-200 rounded-2xl px-4 py-3 focus:border-blue-500 focus:outline-none text-sm transition-all"
              />
            </div>

            {error && (
              <p className="text-red-600 text-sm mb-4">{error}</p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-blue-500 to-purple-600 text-white font-bold py-3 rounded-2xl shadow-lg disabled:opacity-50 transition-all text-base"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <Loader2 className="w-5 h-5 animate-spin" /> Enviando...
                </span>
              ) : 'Enviar enlace'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}

export default ForgotPassword;
