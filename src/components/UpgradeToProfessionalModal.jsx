import { useState } from 'react';
import { Briefcase, X, Loader2, CheckCircle } from 'lucide-react';
import * as api from '../services/api';

function UpgradeToProfessionalModal({ onClose, onSuccess }) {
  const [step, setStep] = useState(1); // 1: selección, 2: confirmación, 3: procesando, 4: éxito
  const [professionType, setProfessionType] = useState('');
  const [professionalTitle, setProfessionalTitle] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const professions = [
    { value: 'WAITER', label: 'Mozo/Camarero' },
    { value: 'ELECTRICIAN', label: 'Electricista' },
    { value: 'PAINTER', label: 'Pintor' },
    { value: 'PLUMBER', label: 'Plomero' },
    { value: 'CARPENTER', label: 'Carpintero' },
    { value: 'MECHANIC', label: 'Mecánico' },
    { value: 'CLEANER', label: 'Personal de limpieza' },
    { value: 'OTHER', label: 'Otro' }
  ];

  const handleSubmit = async () => {
    if (!professionType) {
      setError('Debes seleccionar un tipo de profesión');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await api.switchRole(
        'PROFESSIONAL',
        professionType,
        professionalTitle || null
      );

      // Éxito
      setStep(4);
      
      setTimeout(() => {
        onSuccess(response.token);
      }, 2000);
    } catch (err) {
      console.error('Error upgrading to professional:', err);
      setError(err.response?.data?.message || 'Error al convertir a profesional. Intentá nuevamente.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 animate-fadeIn p-4">
      <div className="bg-white rounded-3xl p-8 max-w-md w-full animate-scaleIn">
        {/* Header */}
        <div className="flex justify-between items-start mb-6">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
              <Briefcase className="w-6 h-6 text-blue-600" />
            </div>
            <h2 className="text-2xl font-bold text-gray-800">
              {step === 4 ? '¡Listo!' : 'Convertirse en Profesional'}
            </h2>
          </div>
          {step !== 4 && (
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          )}
        </div>

        {/* Contenido según el step */}
        {step === 1 && (
          <>
            <p className="text-gray-600 mb-6">
              Seleccioná tu profesión para empezar a recibir calificaciones de tus clientes.
            </p>

            {/* Selector de profesión */}
            <div className="mb-4">
              <label className="block text-gray-700 font-semibold mb-2">
                Tipo de profesión *
              </label>
              <select
                value={professionType}
                onChange={(e) => setProfessionType(e.target.value)}
                className="w-full border-2 border-gray-200 rounded-2xl px-4 py-3 focus:border-blue-500 focus:outline-none transition-all"
              >
                <option value="">Seleccioná una opción</option>
                {professions.map((prof) => (
                  <option key={prof.value} value={prof.value}>
                    {prof.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Título profesional (opcional) */}
            <div className="mb-6">
              <label className="block text-gray-700 font-semibold mb-2">
                Título profesional (opcional)
              </label>
              <input
                type="text"
                value={professionalTitle}
                onChange={(e) => setProfessionalTitle(e.target.value)}
                placeholder="Ej: Mozo Senior, Electricista Matriculado"
                className="w-full border-2 border-gray-200 rounded-2xl px-4 py-3 focus:border-blue-500 focus:outline-none transition-all"
              />
            </div>

            {error && (
              <div className="mb-4 p-4 bg-red-50 border-2 border-red-200 rounded-2xl">
                <p className="text-red-600 text-sm">{error}</p>
              </div>
            )}

            {/* Botones */}
            <div className="flex gap-3">
              <button
                onClick={onClose}
                className="flex-1 bg-gray-200 text-gray-800 font-bold py-3 rounded-2xl hover:bg-gray-300 transition-all"
              >
                Cancelar
              </button>
              <button
                onClick={() => setStep(2)}
                disabled={!professionType}
                className="flex-1 bg-gradient-to-r from-blue-500 to-purple-600 text-white font-bold py-3 rounded-2xl hover:scale-105 disabled:opacity-50 disabled:hover:scale-100 transition-all"
              >
                Continuar
              </button>
            </div>
          </>
        )}

        {step === 2 && (
          <>
            <p className="text-gray-600 mb-4">
              Al convertirte en Profesional:
            </p>
            <ul className="space-y-2 mb-6 text-sm text-gray-600">
              <li className="flex items-start">
                <span className="text-green-500 mr-2">✓</span>
                <span>Podrás generar códigos QR para recibir calificaciones</span>
              </li>
              <li className="flex items-start">
                <span className="text-green-500 mr-2">✓</span>
                <span>Tendrás tu propio perfil profesional con CV</span>
              </li>
              <li className="flex items-start">
                <span className="text-green-500 mr-2">✓</span>
                <span>Construirás tu reputación profesional</span>
              </li>
              <li className="flex items-start">
                <span className="text-blue-500 mr-2">ℹ</span>
                <span>Podrás volver a ser Cliente cuando quieras</span>
              </li>
            </ul>

            <div className="bg-blue-50 border-2 border-blue-200 rounded-2xl p-4 mb-6">
              <p className="text-sm text-blue-800">
                <strong>Profesión:</strong> {professions.find(p => p.value === professionType)?.label}
              </p>
              {professionalTitle && (
                <p className="text-sm text-blue-800 mt-1">
                  <strong>Título:</strong> {professionalTitle}
                </p>
              )}
            </div>

            {/* Botones */}
            <div className="flex gap-3">
              <button
                onClick={() => setStep(1)}
                className="flex-1 bg-gray-200 text-gray-800 font-bold py-3 rounded-2xl hover:bg-gray-300 transition-all"
              >
                Volver
              </button>
              <button
                onClick={handleSubmit}
                disabled={loading}
                className="flex-1 bg-gradient-to-r from-blue-500 to-purple-600 text-white font-bold py-3 rounded-2xl hover:scale-105 disabled:opacity-50 transition-all"
              >
                {loading ? (
                  <span className="flex items-center justify-center">
                    <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                    Procesando...
                  </span>
                ) : (
                  'Confirmar'
                )}
              </button>
            </div>
          </>
        )}

        {step === 4 && (
          <>
            <div className="text-center">
              <CheckCircle className="w-20 h-20 text-green-500 mx-auto mb-4 animate-scaleIn" />
              <p className="text-gray-600 mb-4">
                ¡Tu cuenta se convirtió en Profesional exitosamente!
              </p>
              <p className="text-sm text-gray-500">
                Redirigiendo al panel profesional...
              </p>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default UpgradeToProfessionalModal;