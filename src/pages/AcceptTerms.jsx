import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Loader2, FileText, CheckCircle } from 'lucide-react';
import { BACKEND_URL } from '../config';

function AcceptTerms() {
  const navigate = useNavigate();
  const [accepted, setAccepted] = useState(false);
  const [loading, setLoading] = useState(false);

  const token = localStorage.getItem('authToken');
  const userType = localStorage.getItem('userType');

  const handleAccept = async () => {
    if (!accepted || !token) return;
    setLoading(true);
    try {
      const response = await fetch(`${BACKEND_URL}/api/auth/accept-terms`, {
        method: 'PUT',
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json' 
        }
      });
      
      if (!response.ok) throw new Error('Error al aceptar términos');

      // Actualización del localStorage
      const key = userType === 'PROFESSIONAL' ? 'professional' : 'client';
      try {
        const storedData = localStorage.getItem(key);
        const stored = storedData ? JSON.parse(storedData) : {};
        localStorage.setItem(key, JSON.stringify({ ...stored, termsAccepted: true }));
      } catch (e) {
        //
      }

      // Redirección
      const targetPath = userType === 'PROFESSIONAL' ? '/professional-dashboard' : '/client-dashboard';
      navigate(targetPath, { replace: true });

    } catch {
      //
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-black/60 flex items-center justify-center px-4 animate-fadeIn">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md p-8 animate-scaleIn">

        {/* Ícono */}
        <div className="flex justify-center mb-5">
          <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
            <FileText className="w-8 h-8 text-white" />
          </div>
        </div>

        {/* Título */}
        <div className="text-center mb-6">
          <h2 className="text-2xl font-light text-gray-800 mb-2">
            Términos y Condiciones
          </h2>
          <p className="text-gray-500 text-sm">
            Para continuar usando Calificalo necesitás aceptar nuestros términos.
          </p>
        </div>

        {/* Checkbox */}
        <label className="flex items-start gap-3 cursor-pointer mb-6 p-4 rounded-2xl border-2 border-gray-200 hover:border-purple-300 transition-colors">
          <input
            type="checkbox"
            checked={accepted}
            onChange={(e) => setAccepted(e.target.checked)}
            className="w-5 h-5 mt-0.5 text-purple-600 border-gray-300 rounded focus:ring-purple-500 flex-shrink-0"
          />
          <span className="text-sm text-gray-700 leading-relaxed">
            He leído y acepto los{' '}
            <a 
              href="/terms"
              target="_blank"
              rel="noopener noreferrer"
              className="text-purple-600 font-semibold underline hover:text-purple-800"
              onClick={(e) => e.stopPropagation()} // Evita que al clickear el link se marque el checkbox
            >
              Términos y Condiciones
            </a>
            {' '}de Calificalo
          </span>
        </label>

        {/* Botón */}
        <button
          onClick={handleAccept}
          disabled={!accepted || loading}
          className="w-full bg-gradient-to-r from-blue-500 to-purple-600 text-white font-bold py-4 rounded-2xl shadow-lg disabled:opacity-40 disabled:cursor-not-allowed active:scale-95 transition-all text-lg flex items-center justify-center gap-2"
        >
          {loading ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              <span>Procesando...</span>
            </>
          ) : (
            <>
              <CheckCircle className="w-5 h-5" />
              <span>Aceptar y continuar</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
}

export default AcceptTerms;