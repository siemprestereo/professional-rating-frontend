import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Loader2, User, Mail, Phone, MapPin, Save, Trash2, Award, UserCheck, Briefcase, Home } from 'lucide-react';
import Toast from '../components/Toast';
import ErrorModal from '../components/ErrorModal';
import SwitchToClientModal from '../components/SwitchToClientModal';
import LoadingScreen from '../components/LoadingScreen';
import { clearAllAppData, validatePhone } from '../utils/storage';
import { PROFESSIONS } from '../constants/professions';

function EditProfileProfessional() {
  const navigate = useNavigate();
  const backendUrl = 'https://professional-rating-backend-production.up.railway.app';
  
  const [professional, setProfessional] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [location, setLocation] = useState('');
  const [professionalTitle, setProfessionalTitle] = useState('');
  const [professionType, setProfessionType] = useState('');
  
  const [isAlreadyClient, setIsAlreadyClient] = useState(false);
  
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleting, setDeleting] = useState(false);
  
  const [showSwitchModal, setShowSwitchModal] = useState(false);
  
  const [toast, setToast] = useState(null);
  const [errorModal, setErrorModal] = useState(null);

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      const savedData = localStorage.getItem('professional');
      const token = localStorage.getItem('authToken');
      
      if (!savedData || !token) {
        navigate('/professional-login');
        return;
      }

      const localData = JSON.parse(savedData);
      
      setProfessional(localData);
      setName(localData.name || '');
      setEmail(localData.email || '');
      setPhone(localData.phone || '');
      setLocation(localData.location || '');
      setProfessionalTitle(localData.professionalTitle || '');
      setProfessionType(localData.professionType || '');

      try {
        const [profileResponse, roleResponse] = await Promise.all([
          fetch(`${backendUrl}/api/professionals/${localData.id}`, {
            headers: { 'Authorization': `Bearer ${token}` }
          }),
          fetch(`${backendUrl}/api/role/current`, {
            headers: { 'Authorization': `Bearer ${token}` }
          })
        ]);

        if (profileResponse.ok) {
          const serverData = await profileResponse.json();
          console.log('✅ Datos del servidor:', serverData);
          
          setProfessional(serverData);
          setName(serverData.name || '');
          setEmail(serverData.email || '');
          setPhone(serverData.phone || '');
          setLocation(serverData.location || '');
          setProfessionalTitle(serverData.professionalTitle || '');
          setProfessionType(serverData.professionType || '');
          
          localStorage.setItem('professional', JSON.stringify(serverData));
        }

        if (roleResponse.ok) {
          const roleData = await roleResponse.json();
          console.log('✅ Verificación de rol:', roleData);
          setIsAlreadyClient(roleData.activeRole === 'CLIENT');
        }

      } catch (fetchError) {
        console.warn('No se pudo actualizar desde el servidor, usando datos locales:', fetchError);
      }

    } catch (error) {
      console.error('Error al cargar perfil:', error);
      
      if (error instanceof SyntaxError) {
        clearAllAppData();
        navigate('/professional-login');
        return;
      }
      
      setErrorModal({
        title: 'Error al cargar perfil',
        message: 'No se pudieron cargar tus datos. Por favor, iniciá sesión nuevamente.'
      });
      
      setTimeout(() => {
        clearAllAppData();
        navigate('/professional-login');
      }, 2000);
      
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    
    if (phone && !validatePhone(phone)) {
      setToast({ 
        type: 'error', 
        message: 'El formato del teléfono no es válido. Ej: +54 11 1234-5678' 
      });
      return;
    }

    if (!professionType) {
      setToast({ 
        type: 'error', 
        message: 'Por favor seleccioná tu tipo de profesión' 
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
        body: JSON.stringify({ 
          phone, 
          location, 
          professionalTitle,
          professionType
        })
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Error al actualizar perfil');
      }

      const updatedData = await response.json();
      console.log('✅ Perfil actualizado desde servidor:', updatedData);
      
      setProfessional(updatedData);
      setName(updatedData.name || '');
      setEmail(updatedData.email || '');
      setPhone(updatedData.phone || '');
      setLocation(updatedData.location || '');
      setProfessionalTitle(updatedData.professionalTitle || '');
      setProfessionType(updatedData.professionType || '');
      
      localStorage.setItem('professional', JSON.stringify(updatedData));

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
      const response = await fetch(`${backendUrl}/api/auth/delete-account/${professional.id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (!response.ok) {
        throw new Error('Error al eliminar cuenta');
      }

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

  const handleSwitchToClient = () => {
    if (isAlreadyClient) {
      localStorage.setItem('userType', 'CLIENT');
      navigate('/client-dashboard');
    } else {
      setShowSwitchModal(true);
    }
  };

  if (loading) {
    return <LoadingScreen />;
  }

  return (
    <div className="min-h-screen bg-gray-50 animate-fadeIn pb-32">
      <div className="bg-gradient-to-br from-blue-500 to-purple-600 px-4 pt-8 pb-24">
        <div className="max-w-4xl mx-auto text-center">
          <div className="w-24 h-24 bg-white rounded-full mx-auto mb-4 flex items-center justify-center text-4xl font-bold text-purple-600 animate-scaleIn">
            {name.charAt(0).toUpperCase()}
          </div>
          <h1 className="text-3xl roboto-light text-white mb-2 animate-slideUp">
            Editar Perfil
          </h1>
          <p className="text-white/90 text-lg animate-slideUp delay-100">
            Actualizá tus datos profesionales
          </p>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 -mt-16">
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-4 animate-slideUp">
          <form onSubmit={handleSave}>
            <div className="mb-4">
              <label className="block text-gray-700 font-semibold mb-2 flex items-center text-base">
                <User className="w-5 h-5 mr-2 text-purple-600" />
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

            <div className="mb-4">
              <label className="block text-gray-700 font-semibold mb-2 flex items-center text-base">
                <Mail className="w-5 h-5 mr-2 text-purple-600" />
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

            <div className="mb-4">
              <label className="block text-gray-700 font-semibold mb-2 flex items-center text-base">
                <Briefcase className="w-5 h-5 mr-2 text-purple-600" />
                Tipo de profesión *
              </label>
              <select
                value={professionType}
                onChange={(e) => setProfessionType(e.target.value)}
                required
                className="w-full border-2 border-gray-200 rounded-2xl px-4 py-3 focus:border-purple-500 focus:outline-none transition-all text-base"
              >
                <option value="">Seleccioná una opción</option>
                {PROFESSIONS.map((prof) => (
                  <option key={prof.value} value={prof.value}>
                    {prof.label}
                  </option>
                ))}
              </select>
              <p className="text-sm text-gray-500 mt-1">Tu área de especialización (requerido)</p>
            </div>

            <div className="mb-4">
              <label className="block text-gray-700 font-semibold mb-2 flex items-center text-base">
                <Award className="w-5 h-5 mr-2 text-purple-600" />
                Título Profesional
              </label>
              <input
                type="text"
                value={professionalTitle}
                onChange={(e) => setProfessionalTitle(e.target.value)}
                placeholder="Ej: Mesero Senior, Electricista Matriculado..."
                className="w-full border-2 border-gray-200 rounded-2xl px-4 py-3 focus:border-purple-500 focus:outline-none transition-all text-base"
                maxLength="100"
              />
              <p className="text-sm text-gray-500 mt-1">Tu título o especialización profesional</p>
            </div>

            <div className="mb-4">
              <label className="block text-gray-700 font-semibold mb-2 flex items-center text-base">
                <Phone className="w-5 h-5 mr-2 text-purple-600" />
                Teléfono
              </label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+54 11 1234-5678"
                className="w-full border-2 border-gray-200 rounded-2xl px-4 py-3 focus:border-purple-500 focus:outline-none transition-all text-base"
              />
              <p className="text-sm text-gray-500 mt-1">Formato: +54 11 1234-5678</p>
            </div>

            <div className="mb-6">
              <label className="block text-gray-700 font-semibold mb-2 flex items-center text-base">
                <MapPin className="w-5 h-5 mr-2 text-purple-600" />
                Ubicación
              </label>
              <input
                type="text"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="Buenos Aires, Argentina"
                className="w-full border-2 border-gray-200 rounded-2xl px-4 py-3 focus:border-purple-500 focus:outline-none transition-all text-base"
              />
            </div>

            <button
              type="submit"
              disabled={saving}
              className="w-full bg-gradient-to-r from-blue-500 to-purple-600 text-white font-bold py-4 rounded-2xl shadow-lg disabled:opacity-50 hover:scale-105 transition-all ripple flex items-center justify-center text-lg"
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

        <div className="bg-white rounded-2xl shadow-lg p-6 mb-4 border-2 border-green-200 animate-slideUp delay-50">
          <h3 className="text-xl roboto-light text-gray-800 mb-2 flex items-center">
            <UserCheck className="w-6 h-6 mr-2 text-green-600" />
            {isAlreadyClient ? '¿Querés usar tu perfil de Cliente?' : '¿Ya no ejercés tu profesión?'}
          </h3>
          <p className="text-gray-600 mb-4 text-base">
            {isAlreadyClient 
              ? 'Ya tenés un perfil de Cliente activo. Podés cambiar cuando quieras.'
              : 'Si ya no prestás servicios profesionales, podés cambiar tu perfil y convertirte en Cliente para seguir calificando a otros profesionales.'
            }
          </p>
          <button
            type="button"
            onClick={handleSwitchToClient}
            className="w-full bg-gradient-to-r from-green-500 to-teal-600 text-white font-bold py-3 rounded-2xl hover:scale-105 transition-all text-base"
          >
            {isAlreadyClient ? 'Ir a mi perfil de Cliente' : 'Convertirme en Cliente'}
          </button>
        </div>

        <div className="bg-white rounded-2xl shadow-lg p-6 mb-8 border-2 border-red-200 animate-slideUp delay-100">
          <h3 className="text-xl roboto-light text-red-600 mb-2 flex items-center">
            <Trash2 className="w-6 h-6 mr-2" />
            Zona de Peligro
          </h3>
          <p className="text-gray-600 mb-4 text-base">
            Una vez eliminada tu cuenta, no podrás recuperar tus datos, incluyendo tu CV, calificaciones y perfil.
          </p>
          <button
            onClick={() => setShowDeleteModal(true)}
            className="w-full bg-red-500 text-white font-bold py-3 rounded-2xl shadow-lg hover:bg-red-600 transition-all text-base"
          >
            Eliminar mi cuenta
          </button>
        </div>
      </div>

      <div className="fixed bottom-4 left-0 right-0 flex justify-center z-50 animate-slideUp pointer-events-none">
        <button 
          onClick={() => navigate('/professional-dashboard')}
          className="w-14 h-14 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 rounded-full flex items-center justify-center transition-all hover:scale-110 shadow-2xl border-4 border-white pointer-events-auto"
          aria-label="Volver al inicio"
        >
          <Home className="w-7 h-7 text-white" />
        </button>
      </div>
      
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 animate-fadeIn">
          <div className="bg-white rounded-3xl p-8 max-w-md w-full mx-4 animate-scaleIn">
            <h2 className="text-2xl roboto-light text-gray-800 mb-4">
              ¿Eliminar cuenta?
            </h2>
            <p className="text-gray-600 mb-6 text-base">
              Esta acción es permanente y eliminará todos tus datos, incluyendo tu CV, calificaciones y perfil. 
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

      {showSwitchModal && !isAlreadyClient && (
        <SwitchToClientModal
          onClose={() => setShowSwitchModal(false)}
          onSuccess={(newToken) => {
            localStorage.setItem('authToken', newToken);
            localStorage.removeItem('professional');
            localStorage.setItem('userType', 'CLIENT');
            navigate('/client-dashboard');
          }}
        />
      )}

      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}
      
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

export default EditProfileProfessional;