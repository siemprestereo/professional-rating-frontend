import { useLocation } from 'react-router-dom';
import { Mail } from 'lucide-react';

function PendingVerification() {
  const location = useLocation();
  const email = location.state?.email || '';

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl p-8 max-w-md w-full text-center animate-scaleIn">
        <div className="w-20 h-20 bg-blue-100 rounded-full mx-auto mb-5 flex items-center justify-center">
          <Mail className="w-10 h-10 text-blue-600" />
        </div>
        <h2 className="text-2xl roboto-light text-gray-800 mb-2">Verificá tu cuenta</h2>
        <p className="text-gray-600 mb-2">
          Te enviamos un mail{email ? ' a' : ''}{' '}
          {email && <span className="font-semibold text-gray-800">{email}</span>}
        </p>
        <p className="text-gray-600 mb-6">
          Hacé clic en el enlace del mail para activar tu cuenta y continuar.
        </p>
        <div className="bg-amber-50 border border-amber-200 rounded-2xl px-4 py-3 text-sm text-amber-800">
          ¿No lo ves? Revisá la carpeta de <strong>spam</strong> o correo no deseado.
        </div>
      </div>
    </div>
  );
}

export default PendingVerification;
