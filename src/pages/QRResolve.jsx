import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../services/api.js';
import { Loader2, XCircle } from 'lucide-react';
import RatingForm from './RatingForm';

function QRResolve() {
  const { code } = useParams();
  const navigate = useNavigate();
  const [error, setError] = useState(null);
  const [professionalId, setProfessionalId] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    resolveQRCode();
  }, [code]);

  const resolveQRCode = async () => {
    try {
      const response = await api.resolveQR(code);
      const profId = response.professionalId;

      const token = localStorage.getItem('authToken');
      if (!token) {
        // Guardar contexto para mostrar el banner en el login
        localStorage.setItem('redirectAfterLogin', `/rate/${code}`);
        localStorage.setItem('qrProfessionalName', response.professionalName || '');
        console.log('✅ Guardado en localStorage:', {
          redirect: localStorage.getItem('redirectAfterLogin'),
          name: localStorage.getItem('qrProfessionalName')
        });
        navigate('/client-login');
        return;
      }

      setProfessionalId(profId);
      setLoading(false);
    } catch (err) {
      console.error('Error resolving QR:', err);
      setError('Error al procesar el QR');
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center animate-fadeIn">
        <div className="text-center">
          <Loader2 className="w-16 h-16 text-white animate-spin mx-auto mb-4" />
          <p className="text-white text-xl roboto-light">Procesando código QR...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-red-500 flex items-center justify-center p-4 animate-fadeIn">
        <div className="bg-white rounded-3xl p-8 text-center animate-scaleIn">
          <XCircle className="w-20 h-20 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl roboto-light mb-4">Error al procesar QR</h2>
          <p className="text-gray-600 mb-6 text-base">
            El código QR no es válido o ha expirado
          </p>
          <button
            onClick={() => navigate('/')}
            className="bg-blue-500 text-white py-3 px-8 rounded-full hover:bg-blue-600 transition-all text-base font-semibold"
          >
            Volver al inicio
          </button>
        </div>
      </div>
    );
  }

  return <RatingForm professionalIdFromToken={professionalId} />;
}

export default QRResolve;