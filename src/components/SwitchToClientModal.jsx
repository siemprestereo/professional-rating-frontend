import { useState, useEffect } from 'react';
import { UserCheck, X, Loader2, CheckCircle, AlertTriangle, Calendar } from 'lucide-react';
import * as api from '../services/api';

function SwitchToClientModal({ onClose, onSuccess }) {
  const [step, setStep] = useState(1); // 1: confirmación, 2: bloqueado, 3: éxito
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
      
      // Si no puede cambiar de rol, ir directo al step 2 (bloqueado)
      if (!data.canSwitchRole) {
        setStep(2);
      }
    } catch (err) {
      console.error('Error checking role restriction:', err);
    } finally {
      setCheckingRestriction(false);
    }
  };

  const handleSubmit = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await api.switchRole('CLIENT', null, null);

      // Éxito
      setStep(3);
      
      setTimeout(() => {
        onSuccess(response.token);
      }, 2000);
    } catch (err) {
      console.error('Error switching to client:', err);
      
      // Si el error es por restricción de 6 meses
      if (err.response?.data?.message?.includes('6 meses')) {
        setError(err.response.data.message);
        setStep(2); // Ir al step de bloqueado
      } else {
        setError(err.response?.data?.message || 'Error al cambiar a cliente. Intentá nuevamente.');
      }
    } finally {
      setLoading(false);
    }
  };

  if (checkingRestriction) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 animate-fadeIn p-4">
        <div className="bg-white rounded-3xl p-8 max-w-md w-full animate-scaleIn text-center">
          <Loader2 className="w-12 h-12 text-green-600 animate-spin mx-auto mb-4" />
          <p className="text-gray-600 text-base">Verificando disponibilidad...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 animate-fadeIn p-4">
      <div className="bg-white rounded-3xl p-8 max-w-md w-full animate-scaleIn">
        {/* Header */}
        <div className="flex justify-between items-start mb-6">
          <div className="flex items-center gap-3">
            <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
              step === 2 ? 'bg-orange-100' : step === 3 ? 'bg-green-100' : 'bg-green-100'
            }`}>
              {step === 2 ? (
                <AlertTriangle className="w-6 h-6 text-orange-600" />
              ) : step === 3 ? (
                <CheckCircle className="w-6 h-6 text-green-600" />
              ) : (
                <UserCheck className="w-6 h-6 text-green-600" />
              )}
            </div>
            <h2 className="text-2xl roboto-light text-gray-800">
              {step === 2 ? 'No disponible' : step === 3 ? '¡Listo!' : 'Volver a ser Cliente'}
            </h2>
          </div>
          {step !== 3 && (
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          )}
        </div>

        {/* Step 1: Confirmación con advertencia */}
        {step === 1 && (
          <>
            <p className="text-gray-600 mb-4 text-base">
              Al volver a ser Cliente:
            </p>
            <ul className="space-y-2 mb-6 text-sm text-gray-600">
              <li className="flex items-start">
                <span className="text-green-500 mr-2">✓</span>
                <span>Podrás calificar a otros profesionales</span>
              </li>
              <li className="flex items-start">
                <span className="text-green-500 mr-2">✓</span>
                <span>Tendrás acceso a tu historial de calificaciones emitidas</span>
              </li>
              <li className="flex items-start">
                <span className="text-blue-500 mr-2">ℹ</span>
                <span>Tu perfil profesional se mantendrá guardado</span>
              </li>
              <li className="flex items-start">
                <span className="text-blue-500 mr-2">ℹ</span>
                <span>Podrás volver a ser Profesional cuando quieras</span>
              </li>
            </ul>

            {/* Warning de restricción de 6 meses */}
            <div className="bg-orange-50 border-2 border-orange-200 rounded-2xl p-4 mb-6">
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

            {error && (
              <div className="mb-4 p-4 bg-red-50 border-2 border-red-200 rounded-2xl">
                <p className="text-red-600 text-sm">{error}</p>
              </div>
            )}

            {/* Botones */}
            <div className="flex gap-3">
              <button
                onClick={onClose}
                className="flex-1 bg-gray-200 text-gray-800 font-bold py-3 rounded-2xl hover:bg-gray-300 transition-all text-base"
              >
                Cancelar
              </button>
              <button
                onClick={handleSubmit}
                disabled={loading}
                className="flex-1 bg-gradient-to-r from-green-500 to-teal-600 text-white font-bold py-3 rounded-2xl hover:scale-105 disabled:opacity-50 transition-all text-base"
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

        {/* Step 2: Bloqueado por restricción de 6 meses */}
        {step === 2 && (
          <>
            <div className="text-center mb-6">
              <Calendar className="w-20 h-20 text-orange-500 mx-auto mb-4" />
              <p className="text-gray-600 mb-2 text-base">
                No podés cambiar de rol todavía
              </p>
              <p className="text-sm text-gray-500">
                {roleInfo?.lastRoleSwitchAt && (
                  <>Ya realizaste un cambio de rol el: <strong>{roleInfo.lastRoleSwitchAt}</strong></>
                )}
              </p>
            </div>

            <div className="bg-orange-50 border-2 border-orange-200 rounded-2xl p-4 mb-6">
              <p className="text-sm text-orange-800 text-center">
                Podrás volver a cambiar de rol el:
              </p>
              <p className="text-lg font-bold text-orange-900 text-center mt-2">
                {roleInfo?.nextAllowedRoleSwitchDate}
              </p>
            </div>

            <button
              onClick={onClose}
              className="w-full bg-gradient-to-r from-green-500 to-teal-600 text-white font-bold py-3 rounded-2xl hover:scale-105 transition-all text-base"
            >
              Entendido
            </button>
          </>
        )}

        {/* Step 3: Éxito con info de próximo cambio */}
        {step === 3 && (
          <>
            <div className="text-center mb-6">
              <CheckCircle className="w-20 h-20 text-green-500 mx-auto mb-4 animate-scaleIn" />
              <p className="text-gray-600 mb-4 text-base">
                ¡Tu cuenta volvió a ser Cliente exitosamente!
              </p>
            </div>

            <div className="bg-blue-50 border-2 border-blue-200 rounded-2xl p-4 mb-4">
              <div className="flex items-start">
                <Calendar className="w-5 h-5 text-blue-600 mr-2 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-xs text-blue-700 mb-1">
                    Podrás volver a cambiar de rol el:
                  </p>
                  <p className="text-sm font-semibold text-blue-900">
                    {roleInfo?.nextAllowedRoleSwitchDate || 'Calculando...'}
                  </p>
                </div>
              </div>
            </div>

            <p className="text-sm text-gray-500 text-center">
              Redirigiendo al panel de cliente...
            </p>
          </>
        )}
      </div>
    </div>
  );
}

export default SwitchToClientModal;