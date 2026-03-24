import { useState } from 'react';
import { useLocation } from 'react-router-dom';
import { Mail, Loader2 } from 'lucide-react';
import { BACKEND_URL } from '../config';

function PendingVerification() {
  const location = useLocation();
  const email = location.state?.email || '';
  const [resendStatus, setResendStatus] = useState('idle'); // 'idle' | 'loading' | 'sent' | 'error'

  const handleResend = async () => {
    const token = localStorage.getItem('authToken');
    if (!token) return;
    setResendStatus('loading');
    try {
      const res = await fetch(`${BACKEND_URL}/api/auth/resend-verification`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      setResendStatus(res.ok ? 'sent' : 'error');
    } catch {
      setResendStatus('error');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl p-8 max-w-md w-full text-center animate-scaleIn">
        <div className="w-20 h-20 bg-blue-100 rounded-full mx-auto mb-5 flex items-center justify-center">
          <Mail className="w-10 h-10 text-blue-600" />
        </div>
        <h2 className="text-2xl roboto-light text-gray-800 mb-2">Verificá tu cuenta</h2>
        <p className="text-gray-600 mb-2">
          Te enviamos un mail{email ? ' a ' : ''}
          {email && <span className="font-semibold text-gray-800">{email}</span>}
        </p>
        <p className="text-gray-600 mb-6">
          Hacé clic en el enlace del mail para activar tu cuenta y continuar.
        </p>
        <div className="bg-amber-50 border border-amber-200 rounded-2xl px-4 py-3 text-sm text-amber-800 mb-6">
          ¿No lo ves? Revisá la carpeta de <strong>spam</strong> o correo no deseado.
        </div>

        {resendStatus === 'sent' ? (
          <p className="text-green-600 text-sm font-semibold">¡Mail reenviado! Revisá tu bandeja.</p>
        ) : resendStatus === 'error' ? (
          <p className="text-red-500 text-sm">No se pudo reenviar. Escribinos a <a href="mailto:soporte@calificalo.com.ar" className="underline">soporte@calificalo.com.ar</a></p>
        ) : (
          <button
            onClick={handleResend}
            disabled={resendStatus === 'loading'}
            className="text-sm text-blue-600 hover:text-blue-800 transition-colors flex items-center gap-1 mx-auto disabled:opacity-50"
          >
            {resendStatus === 'loading' && <Loader2 className="w-4 h-4 animate-spin" />}
            Reenviar mail de verificación
          </button>
        )}
      </div>
    </div>
  );
}

export default PendingVerification;
