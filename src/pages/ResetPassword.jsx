import { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { ArrowLeft, Loader2, Lock, Eye, EyeOff } from 'lucide-react';
import { BACKEND_URL } from '../config';

function ResetPassword() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');

  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState('');

  if (!token) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center p-4">
        <div className="bg-white rounded-3xl p-8 max-w-md w-full text-center">
          <p className="text-red-600 font-semibold mb-4">Enlace inválido o expirado.</p>
          <button onClick={() => navigate('/forgot-password')} className="text-blue-600 font-semibold">
            Solicitar uno nuevo
          </button>
        </div>
      </div>
    );
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (password !== confirm) {
      setError('Las contraseñas no coinciden');
      return;
    }
    if (password.length < 8 || !/[a-zA-Z]/.test(password) || !/[0-9]/.test(password)) {
      setError('La contraseña debe tener al menos 8 caracteres, letras y números');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(`${BACKEND_URL}/api/auth/reset-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, password }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || 'Error al restablecer la contraseña');
        return;
      }
      setDone(true);
    } catch {
      setError('Error de conexión. Intentá nuevamente.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center p-4 animate-fadeIn">
      <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-md w-full animate-scaleIn">
        <div className="text-center mb-6">
          <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full mx-auto mb-3 flex items-center justify-center">
            <Lock className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-2xl roboto-light text-gray-800 mb-1">Nueva contraseña</h1>
          <p className="text-sm text-gray-600">Mínimo 8 caracteres con letras y números</p>
        </div>

        {done ? (
          <div className="text-center py-4">
            <div className="w-14 h-14 bg-green-100 rounded-full mx-auto mb-4 flex items-center justify-center">
              <Lock className="w-7 h-7 text-green-600" />
            </div>
            <p className="text-gray-700 font-semibold mb-2">¡Contraseña actualizada!</p>
            <p className="text-sm text-gray-600 mb-6">Ya podés iniciar sesión con tu nueva contraseña.</p>
            <button
              onClick={() => navigate('/professional-login')}
              className="w-full bg-gradient-to-r from-blue-500 to-purple-600 text-white font-bold py-3 rounded-2xl mb-3"
            >
              Ir al login profesional
            </button>
            <button
              onClick={() => navigate('/client-login')}
              className="w-full border-2 border-gray-200 text-gray-700 font-semibold py-3 rounded-2xl"
            >
              Ir al login cliente
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit}>
            <div className="mb-4">
              <label className="block text-gray-700 font-semibold mb-2 text-sm">Nueva contraseña</label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => { setPassword(e.target.value); setError(''); }}
                  placeholder="Mínimo 8 caracteres con letras y números"
                  required
                  className="w-full border-2 border-gray-200 rounded-2xl px-4 py-3 pr-12 focus:border-blue-500 focus:outline-none text-sm transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            <div className="mb-4">
              <label className="block text-gray-700 font-semibold mb-2 text-sm">Confirmar contraseña</label>
              <input
                type={showPassword ? 'text' : 'password'}
                value={confirm}
                onChange={(e) => { setConfirm(e.target.value); setError(''); }}
                placeholder="Repetí tu nueva contraseña"
                required
                className="w-full border-2 border-gray-200 rounded-2xl px-4 py-3 focus:border-blue-500 focus:outline-none text-sm transition-all"
              />
            </div>

            {error && <p className="text-red-600 text-sm mb-4">{error}</p>}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-blue-500 to-purple-600 text-white font-bold py-3 rounded-2xl shadow-lg disabled:opacity-50 transition-all text-base"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <Loader2 className="w-5 h-5 animate-spin" /> Guardando...
                </span>
              ) : 'Guardar contraseña'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}

export default ResetPassword;
