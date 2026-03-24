import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Loader2, CheckCircle, XCircle } from 'lucide-react';
import { BACKEND_URL } from '../config';

function VerifyEmail() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');
  const [status, setStatus] = useState('loading'); // 'loading' | 'success' | 'error'

  useEffect(() => {
    if (!token) { setStatus('error'); return; }

    fetch(`${BACKEND_URL}/api/auth/verify-email?token=${encodeURIComponent(token)}`)
      .then(res => res.ok ? setStatus('success') : setStatus('error'))
      .catch(() => setStatus('error'));
  }, [token]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl p-8 max-w-md w-full text-center animate-scaleIn">
        {status === 'loading' && (
          <>
            <Loader2 className="w-12 h-12 text-blue-500 animate-spin mx-auto mb-4" />
            <p className="text-gray-600">Verificando tu email...</p>
          </>
        )}

        {status === 'success' && (
          <>
            <div className="w-16 h-16 bg-green-100 rounded-full mx-auto mb-4 flex items-center justify-center">
              <CheckCircle className="w-9 h-9 text-green-600" />
            </div>
            <h2 className="text-2xl roboto-light text-gray-800 mb-2">¡Email verificado!</h2>
            <p className="text-sm text-gray-600 mb-6">Tu cuenta está confirmada. Ya podés usar Calificalo al 100%.</p>
            <button
              onClick={() => {
                const userType = localStorage.getItem('userType');
                if (userType === 'PROFESSIONAL') navigate('/edit-cv');
                else if (userType === 'CLIENT') navigate('/client-dashboard');
                else navigate('/');
              }}
              className="w-full bg-gradient-to-r from-blue-500 to-purple-600 text-white font-bold py-3 rounded-2xl"
            >
              Continuar
            </button>
          </>
        )}

        {status === 'error' && (
          <>
            <div className="w-16 h-16 bg-red-100 rounded-full mx-auto mb-4 flex items-center justify-center">
              <XCircle className="w-9 h-9 text-red-500" />
            </div>
            <h2 className="text-2xl roboto-light text-gray-800 mb-2">Enlace inválido</h2>
            <p className="text-sm text-gray-600 mb-6">El enlace ya fue usado o expiró. Si necesitás reenviar la verificación, contactá a soporte@calificalo.com.ar</p>
            <button
              onClick={() => navigate('/')}
              className="w-full bg-gradient-to-r from-blue-500 to-purple-600 text-white font-bold py-3 rounded-2xl"
            >
              Ir al inicio
            </button>
          </>
        )}
      </div>
    </div>
  );
}

export default VerifyEmail;
