import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { resolveQR } from '../services/api';
import { Loader2, XCircle } from 'lucide-react';

function QRResolve() {
  const { code } = useParams();
  const navigate = useNavigate();
  const [error, setError] = useState(null);

  useEffect(() => {
    resolveQRCode();
  }, [code]);

  const resolveQRCode = async () => {
    try {
      const response = await resolveQR(code);
      const professionalId = response.professionalId;
      navigate('/rate-professional/' + professionalId, { replace: true });
    } catch (err) {
      console.error('Error resolving QR:', err);
      setError('Error al procesar el QR');
    }
  };

  if (error) {
    return (
      <div className="min-h-screen bg-red-500 flex items-center justify-center p-4">
        <div className="bg-white rounded-3xl p-8 text-center">
          <XCircle className="w-20 h-20 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold mb-4">Error al procesar QR</h2>
          <p className="text-gray-600 mb-6">
            El código QR no es válido o ha expirado
          </p>
          <button
            onClick={() => navigate('/')}
            className="bg-blue-500 text-white py-3 px-8 rounded-full hover:bg-blue-600 transition-all"
          >
            Volver al inicio
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
      <div className="text-center">
        <Loader2 className="w-16 h-16 text-white animate-spin mx-auto mb-4" />
        <p className="text-white text-xl">Procesando código QR...</p>
      </div>
    </div>
  );
}

export default QRResolve;