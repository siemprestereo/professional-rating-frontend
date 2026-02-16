import { useState, useEffect } from 'react';
import { Briefcase, X, Loader2, CheckCircle, AlertTriangle, Calendar } from 'lucide-react';
import * as api from '../services/api';
import { PROFESSIONS, getProfessionLabel } from '../constants/professions';
import { formatDate, clearAllAppData } from '../utils/storage';

function UpgradeToProfessionalModal({ onClose, onSuccess }) {
  const [step, setStep] = useState(1);
  const [professionType, setProfessionType] = useState('');
  const [professionalTitle, setProfessionalTitle] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [roleInfo, setRoleInfo] = useState(null);
  const [checkingRestriction, setCheckingRestriction] = useState(true);

  useEffect(() => {
    checkRoleSwitchRestriction();
  }, []);

  const checkRoleSwitchRestriction = async () => {
    try {
      const data = await api.getCurrentRole();
      setRoleInfo(data);
      
      if (!data.canSwitchRole) {
        setStep(3);
      }
    } catch (err) {
      console.error('Error checking role restriction:', err);
      
      if (err.response?.status === 401) {
        clearAllAppData();
        window.location.href = '/client-login';
        return;
      }
    } finally {
      setCheckingRestriction(false);
    }
  };

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

      setRoleInfo({
        ...roleInfo,
        lastRoleSwitchAt: new Date().toISOString(),
        canSwitchRole: false
      });

      setStep(4);
      
      setTimeout(() => {
        localStorage.removeItem('client');
        localStorage.setItem('userType', 'PROFESSIONAL');
        onSuccess(response.token);
      }, 1500);
      
    } catch (err) {
      console.error('Error upgrading to professional:', err);
      
      if (err.response?.status === 401) {
        clearAllAppData();
        window.location.href = '/client-login';
        return;
      }
      
      if (err.response?.data?.message?.includes('6 meses')) {
        setError(err.response.data.message);
        setStep(3);
      } else {
        setError(err.response?.data?.message || 'Error al convertir a profesional. Intentá nuevamente.');
      }
    } finally {
      setLoading(false);
    }
  };

  if (checkingRestriction) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 animate-fadeIn p-4">
        <div className="bg-white rounded-3xl p-8 max-w-md w-full animate-scaleIn text-center">
          <Loader2 className="w-12 h-12 text-blue-600 animate-spin mx-auto mb-4" />
          <p className="text-gray-600 text-base">Verificando disponibilidad...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 animate-fadeIn p-4">
      <div className="bg-white rounded-3xl p-8 max-w-md w-full animate-scaleIn">
        <div className="flex justify-between items-start mb-6">
          <div className="flex items-center gap-3">
            <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
              step === 3 ? 'bg-orange-100' : step === 4 ? 'bg-green-100' : 'bg-blue-100'
            }`}>
              {step === 3 ? (
                <AlertTriangle className="w-6 h-6 text-orange-600" />
              ) : step === 4 ? (
                <CheckCircle className="w-6 h-6 text-green-600" />
              ) : (
                <Briefcase className="w-6 h-6 text-blue-600" />
              )}
            </div>
            <h2 className="text-2xl roboto-light text-gray-800">
              {step === 3 ? 'No disponible' : step === 4 ? '¡Listo!' : 'Convertirse en Profesional'}
            </h2>
          </div>
          {step !== 4 && (
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
              aria-label="Cerrar"
            >
              <X className="w-6 h-6" />
            </button>
          )}
        </div>

        {step === 1 && (
          <>
            <p className="text-gray-600 mb-6 text-base">
              Seleccioná tu profesión para empezar a recibir calificaciones de tus clientes.
            </p>

            <div className="mb-4">
              <label className="block text-gray-700 font-semibold mb-2 text-base">
                Tipo de profesión *
              </label>
              <select
                value={professionType}
                onChange={(e) => setProfessionType(e.target.value)}
                className="w-full border-2 border-gray-200 rounded-2xl px-4 py-3 focus:border-blue-500 focus:outline-none transition-all text-base"
              >
                <option value="">Seleccioná una opción</option>
                {PROFESSIONS.map((prof) => (
                  <option key={prof.value} value={prof.value}>
                    {prof.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="mb-6">
              <label className="block text-gray-700 font-semibold mb-2 text-base">
                Título profesional (opcional)
              </label>
              <input
                type="text"
                value={professionalTitle}
                onChange={(e) => setProfessionalTitle(e.target.value)}
                placeholder="Ej: Mozo Senior, Electricista Matriculado"
                className="w-full border-2 border-gray-200 rounded-2xl px-4 py-3 focus:border-blue-500 focus:outline-none transition-all text-base"
                maxLength="100"
              />
            </div>

            {error && (
              <div className="mb-4 p-4 bg-red-50 border-2 border-red-200 rounded-2xl">
                <p className="text-red-600 text-sm">{error}</p>
              </div>
            )}

            <div className="flex gap-3">
              <button
                onClick={onClose}
                className="flex-1 bg-gray-200 text-gray-800 font-bold py-3 rounded-2xl hover:bg-gray-300 transition-all text-base"
              >
                Cancelar
              </button>
              <button
                onClick={() => setStep(2)}
                disabled={!professionType}
                className="flex-1 bg-gradient-to-r from-blue-500 to-purple-600 text-white font-bold py-3 rounded-2xl hover:scale-105 disabled:opacity-50 disabled:hover:scale-100 transition-all text-base"
              >
                Continuar
              </button>
            </div>
          </>
        )}

        {step === 2 && (
          <>
            <p className="text-gray-600 mb-4 text-base">
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
                <span>Tus calificaciones como cliente se mantendrán guardadas</span>
              </li>
              <li className="flex items-start">
                <span className="text-blue-500 mr-2">ℹ</span>
                <span>Podrás volver a ser Cliente cuando se cumpla el plazo de espera</span>
              </li>
            </ul>

            <div className="bg-orange-50 border-2 border-orange-200 rounded-2xl p-4 mb-4">
              <div className="flex items-start">
                <AlertTriangle className="w-5 h-5 text-orange-600 mr-2 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-semibold text-orange-800 mb-1">
                    Importante: Restricción de cambio de rol
                  </p>
                  <p className="text-xs text-orange-700">
                    Solo podés cambiar de rol una vez cada 6 meses. Pensalo bien antes de confirmar.
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-blue-50 border-2 border-blue-200 rounded-2xl p-4 mb-6">
              <p className="text-sm text-blue-800">
                <strong>Profesión:</strong> {getProfessionLabel(professionType)}
              </p>
              {professionalTitle && (
                <p className="text-sm text-blue-800 mt-1">
                  <strong>Título:</strong> {professionalTitle}
                </p>
              )}
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setStep(1)}
                disabled={loading}
                className="flex-1 bg-gray-200 text-gray-800 font-bold py-3 rounded-2xl hover:bg-gray-300 transition-all text-base disabled:opacity-50"
              >
                Volver
              </button>
              <button
                onClick={handleSubmit}
                disabled={loading}
                className="flex-1 bg-gradient-to-r from-blue-500 to-purple-600 text-white font-bold py-3 rounded-2xl hover:scale-105 disabled:opacity-50 transition-all text-base"
              >
                {loading ? (
                  <span className="flex items-center justify-center">
                    <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                    Procesando...
                  </span>
                ) : (
                  'Confirmar cambio'
                )}
              </button>
            </div>
          </>
        )}

        {step === 3 && (
          <>
            <div className="text-center mb-6">
              <Calendar className="w-20 h-20 text-orange-500 mx-auto mb-4" />
              <p className="text-gray-600 mb-2 text-base">
                No podés cambiar de rol todavía
              </p>
              {roleInfo?.lastRoleSwitchAt && (
                <p className="text-sm text-gray-500">
                  Ya realizaste un cambio de rol el: <strong>{formatDate(roleInfo.lastRoleSwitchAt)}</strong>
                </p>
              )}
            </div>

            <div className="bg-orange-50 border-2 border-orange-200 rounded-2xl p-4 mb-6">
              <p className="text-sm text-orange-800 text-center">
                Podrás volver a cambiar de rol el:
              </p>
              <p className="text-lg font-bold text-orange-900 text-center mt-2">
                {formatDate(roleInfo?.nextAllowedRoleSwitchDate)}
              </p>
            </div>

            <button
              onClick={onClose}
              className="w-full bg-gradient-to-r from-blue-500 to-purple-600 text-white font-bold py-3 rounded-2xl hover:scale-105 transition-all text-base"
            >
              Entendido
            </button>
          </>
        )}

        {step === 4 && (
          <>
            <div className="text-center mb-6">
              <CheckCircle className="w-20 h-20 text-green-500 mx-auto mb-4 animate-scaleIn" />
              <p className="text-gray-600 mb-4 text-base">
                ¡Tu cuenta se convirtió en Profesional exitosamente!
              </p>
            </div>

            <div className="bg-blue-50 border-2 border-blue-200 rounded-2xl p-4 mb-4">
              <div className="flex items-start">
                <Calendar className="w-5 h-5 text-blue-600 mr-2 flex-shrink-0 mt-0.5" />
                <div className="flex-1">
                  <p className="text-xs text-blue-700 mb-1">
                    Podrás volver a cambiar de rol el:
                  </p>
                  <p className="text-sm font-semibold text-blue-900">
                    {formatDate(roleInfo?.nextAllowedRoleSwitchDate)}
                  </p>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-center gap-2 text-sm text-gray-500">
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>Redirigiendo al panel profesional...</span>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default UpgradeToProfessionalModal;