import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Loader2, User, Mail, Phone, MapPin, Save, Trash2, Briefcase, Home } from 'lucide-react';
import Toast from '../components/Toast';
import ErrorModal from '../components/ErrorModal';
import UpgradeToProfessionalModal from '../components/UpgradeToProfessionalModal';
import LoadingScreen from '../components/LoadingScreen';
import { clearAllAppData, validatePhone } from '../utils/storage';

function EditProfile() {
  const navigate = useNavigate();
  const backendUrl = 'https://professional-rating-backend-production.up.railway.app';
  
  const [client, setClient] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [location, setLocation] = useState('');
  
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  
  const [toast, setToast] = useState(null);
  const [errorModal, setErrorModal] = useState(null);

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      const savedData = localStorage.getItem('client');
      const token = localStorage.getItem('authToken');
      
      if (!savedData || !token) {
        navigate('/client-login');
        return;
      }

      const localData = JSON.parse(savedData);
      
      // Mostrar datos locales inmediatamente (UX rápida)
      setClient(localData);
      setName(localData.name || '');
      setEmail(localData.email || '');
      setPhone(localData.phone || '');
      setLocation(localData.location || '');

      // Intentar actualizar desde el servidor
      try {
        const response = await fetch(`${backendUrl}/api/auth/me`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });

        if (response.ok) {
          const serverData = await response.json();
          
          // Actualizar con datos frescos del servidor
          setClient(serverData);
          setName(serverData.name || '');
          setEmail(serverData.email || '');
          setPhone(serverData.phone || '');
          setLocation(serverData.location || '');
          
          localStorage.setItem('client', JSON.stringify(serverData));
        }
      } catch (fetchError) {
        console.warn('No se pudo actualizar desde el servidor, usando datos locales:', fetchError);
        // Continuar con datos locales
      }
      
    } catch (error) {
      console.error('Error al cargar perfil:', error);
      
      if (error instanceof SyntaxError) {
        // LocalStorage corrupto
        clearAllAppData();
        navigate('/client-login');
        return;
      }
      
      setErrorModal({
        title: 'Error al cargar perfil',
        message: 'No se pudieron cargar tus datos. Por favor, iniciá sesión nuevamente.'
      });
      
      setTimeout(() => {
        clearAllAppData();
        navigate('/client-login');
      }, 2000);
      
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    
    // Validar teléfono
    if (phone && !validatePhone(phone)) {
      setToast({ 
        type: 'error', 
        message: 'El formato del teléfono no es válido. Ej: +54 11 1234-5678' 
      });
      return;
    }
    
    setSaving(true);

    try {
      const token = localStorage.getItem('authToken');
      const response = await fetch(`${backendUrl}/api/auth/update-profile`, {
        method: 'PUT',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ phone, location })
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Error al actualizar perfil');
      }

      // ✅ CONFIAR 100% EN LA RESPUESTA DEL SERVIDOR
      const updatedData = await response.json();
      console.log('✅ Datos actualizados desde servidor:', updatedData);
      
      // Actualizar estado y localStorage con los datos del servidor
      setClient(updatedData);
      setName(updatedData.name || '');
      setEmail(updatedData.email || '');
      setPhone(updatedData.phone || '');
      setLocation(updatedData.location || '');
      
      localStorage.setItem('client', JSON.stringify(updatedData));

      setToast({ type: 'success', message: 'Perfil actualizado correctamente' });
      
    } catch (err) {
      console.error('❌ Error al guardar:', err);
      setToast({ type: 'error', message: err.message });
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteAccount = async () => {
    setDeleting(true);
    try {
      const token = localStorage.getItem('authToken');
      const response = await fetch(`${backendUrl}/api/auth/delete-account/${client.id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (!response.ok) {
        throw new Error('Error al eliminar cuenta');
      }

      // ✅ LIMPIAR TODO EL LOCALSTORAGE
      clearAllAppData();
      
      setToast({ type: 'success', message: 'Cuenta eliminada exitosamente' });
      
      setTimeout(() => {
        navigate('/');
      }, 2000);
      
    } catch (error) {
      console.error('Error deleting account:', error);
      setErrorModal({
        title: 'Error al eliminar cuenta',
        message: 'No se pudo eliminar tu cuenta. Por favor, intentá nuevamente.'
      });
    } finally {
      setDeleting(false);
      setShowDeleteModal(false);
    }
  };

  if (loading) {
    return <LoadingScreen />;
  }

  return (
    <div className="min-h-screen bg-gray-50 animate-fadeIn pb-32">
      {/* Header */}
      <div className="bg-gradient-to-br from-green-500 to-teal-600 px-4 pt-8 pb-24">
        <div className="max-w-4xl mx-auto text-center">
          <div className="w-24 h-24 bg-white rounded-full mx-auto mb-4 flex items-center justify-center text-4xl font-bold text-teal-600 animate-scaleIn">
            {name.charAt(0).toUpperCase()}
          </div>
          <h1 className="text-3xl roboto-light text-white mb-2 animate-slideUp">
            Editar Perfil
          </h1>
          <p className="text-white/90 text-lg animate-slideUp delay-100">
            Actualizá tus datos personales
          </p>
        </div>
      </div>

      {/* Contenido */}
      <div className="max-w-4xl mx-auto px-4 -mt-16">
        {/* Formulario */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-4 animate-slideUp">
          <form onSubmit={handleSave}>
            {/* Nombre (solo lectura) */}
            <div className="mb-4">
              <label className="block text-gray-700 font-semibold mb-2 flex items-center text-base">
                <User className="w-5 h-5 mr-2 text-teal-600" />
                Nombre
              </label>
              <input
                type="text"
                value={name}
                disabled
                className="w-full border-2 border-gray-200 bg-gray-50 rounded-2xl px-4 py-3 text-gray-500 cursor-not-allowed text-base"
              />
              <p className="text-sm text-gray-500 mt-1">El nombre no se puede modificar</p>
            </div>

            {/* Email (solo lectura) */}
            <div className="mb-4">
              <label className="block text-gray-700 font-semibold mb-2 flex items-center text-base">
                <Mail className="w-5 h-5 mr-2 text-teal-600" />
                Email
              </label>
              <input
                type="email"
                value={email}
                disabled
                className="w-full border-2 border-gray-200 bg-gray-50 rounded-2xl px-4 py-3 text-gray-500 cursor-not-allowed text-base"
              />
              <p className="text-sm text-gray-500 mt-1">El email no se puede modificar</p>
            </div>

            {/* Teléfono */}
            <div className="mb-4">
              <label className="block text-gray-700 font-semibold mb-2 flex items-center text-base">
                <Phone className="w-5 h-5 mr-2 text-teal-600" />
                Teléfono
              </label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+54 11 1234-5678"
                className="w-full border-2 border-gray-200 rounded-2xl px-4 py-3 focus:border-teal-500 focus:outline-none transition-all text-base"
              />
              <p className="text-sm text-gray-500 mt-1">Formato: +54 11 1234-5678</p>
            </div>

            {/* Ubicación */}
            <div className="mb-6">
              <label className="block text-gray-700 font-semibold mb-2 flex items-center text-base">
                <MapPin className="w-5 h-5 mr-2 text-teal-600" />
                Ubicación
              </label>
              <input
                type="text"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="Buenos Aires, Argentina"
                className="w-full border-2 border-gray-200 rounded-2xl px-4 py-3 focus:border-teal-500 focus:outline-none transition-all text-base"
              />
            </div>

            {/* Botón Guardar */}
            <button
              type="submit"
              disabled={saving}
              className="w-full bg-gradient-to-r from-green-500 to-teal-600 text-white font-bold py-4 rounded-2xl shadow-lg disabled:opacity-50 hover:scale-105 transition-all ripple flex items-center justify-center text-lg"
            >
              {saving ? (
                <>
                  <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                  Guardando...
                </>
              ) : (
                <>
                  <Save className="w-5 h-5 mr-2" />
                  Guardar Cambios
                </>
              )}
            </button>
          </form>
        </div>

        {/* Upgrade to Professional */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-4 border-2 border-blue-200 animate-slideUp delay-50">
          <h3 className="text-xl roboto-light text-gray-800 mb-2 flex items-center">
            <Briefcase className="w-6 h-6 mr-2 text-blue-600" />
            ¿Sos un profesional?
          </h3>
          <p className="text-gray-600 mb-4 text-base">
            Si prestás servicios profesionales, convertite en Profesional para recibir calificaciones de tus clientes.
          </p>
          <button
            type="button"
            onClick={() => setShowUpgradeModal(true)}
            className="w-full bg-gradient-to-r from-blue-500 to-purple-600 text-white font-bold py-3 rounded-2xl hover:scale-105 transition-all text-base"
          >
            Convertirme en Profesional
          </button>
        </div>

        {/* Zona de peligro - Eliminar cuenta */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-8 border-2 border-red-200 animate-slideUp delay-100">
          <h3 className="text-xl roboto-light text-red-600 mb-2 flex items-center">
            <Trash2 className="w-6 h-6 mr-2" />
            Zona de Peligro
          </h3>
          <p className="text-gray-600 mb-4 text-base">
            Una vez eliminada tu cuenta, no podrás recuperar tus datos.
          </p>
          <button
            onClick={() => setShowDeleteModal(true)}
            className="w-full bg-red-500 text-white font-bold py-3 rounded-2xl shadow-lg hover:bg-red-600 transition-all text-base"
          >
            Eliminar mi cuenta
          </button>
        </div>
      </div>

      {/* Botón Home flotante */}
      <div className="fixed bottom-4 left-0 right-0 flex justify-center z-50 animate-slideUp pointer-events-none">
        <button 
          onClick={() => navigate('/client-dashboard')}
          className="w-14 h-14 bg-gradient-to-r from-green-500 to-teal-600 hover:from-green-600 hover:to-teal-700 rounded-full flex items-center justify-center transition-all hover:scale-110 shadow-2xl border-4 border-white pointer-events-auto"
          aria-label="Volver al inicio"
        >
          <Home className="w-7 h-7 text-white" />
        </button>
      </div>

      {/* Modal de confirmación eliminación */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 animate-fadeIn">
          <div className="bg-white rounded-3xl p-8 max-w-md w-full mx-4 animate-scaleIn">
            <h2 className="text-2xl roboto-light text-gray-800 mb-4">
              ¿Eliminar cuenta?
            </h2>
            <p className="text-gray-600 mb-6 text-base">
              Esta acción es permanente y eliminará todos tus datos.
              <strong> No se puede deshacer.</strong>
            </p>
            
            <div className="flex gap-4">
              <button
                onClick={() => setShowDeleteModal(false)}
                className="flex-1 bg-gray-200 text-gray-800 font-bold py-3 rounded-2xl hover:bg-gray-300 transition-all text-base"
              >
                Cancelar
              </button>
              <button
                onClick={handleDeleteAccount}
                disabled={deleting}
                className="flex-1 bg-red-500 text-white font-bold py-3 rounded-2xl hover:bg-red-600 disabled:opacity-50 transition-all text-base"
              >
                {deleting ? (
                  <span className="flex items-center justify-center">
                    <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                    Eliminando...
                  </span>
                ) : (
                  'Sí, eliminar'
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal de upgrade a Professional */}
      {showUpgradeModal && (
        <UpgradeToProfessionalModal
          onClose={() => setShowUpgradeModal(false)}
          onSuccess={(newToken) => {
            localStorage.setItem('authToken', newToken);
            localStorage.removeItem('client');
            navigate('/professional-dashboard');
          }}
        />
      )}

      {/* Toast notification */}
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}
      
      {/* Error modal */}
      {errorModal && (
        <ErrorModal
          title={errorModal.title}
          message={errorModal.message}
          onClose={() => setErrorModal(null)}
        />
      )}
    </div>
  );
}

export default EditProfile;