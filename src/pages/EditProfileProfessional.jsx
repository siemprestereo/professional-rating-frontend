import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Loader2, User, Mail, Phone, Save, Trash2, UserCheck } from 'lucide-react';
import Toast from '../components/Toast';
import ErrorModal from '../components/ErrorModal';
import SwitchToClientModal from '../components/SwitchToClientModal';
import LoadingScreen from '../components/LoadingScreen';
import BackButton from '../components/BackButton';
import HomeButton from '../components/HomeButton';
import { clearAllAppData, validatePhone } from '../utils/storage';
import { BACKEND_URL } from '../config';
import LocationSelector from '../components/LocationSelector';
import ProfilePictureUpload from '../components/ProfilePictureUpload';

function EditProfileProfessional() {
  const navigate = useNavigate();
  const [professional, setProfessional] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [location, setLocation] = useState('');
  const [isAlreadyClient, setIsAlreadyClient] = useState(false);

  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [showSwitchModal, setShowSwitchModal] = useState(false);

  const [toast, setToast] = useState(null);
  const [errorModal, setErrorModal] = useState(null);

  useEffect(() => { loadProfile(); }, []);

  const loadProfile = async () => {
    try {
      const savedData = localStorage.getItem('professional');
      const token = localStorage.getItem('authToken');

      if (!savedData || !token) { navigate('/professional-login'); return; }

      let localData;
      try {
        localData = JSON.parse(savedData);
      } catch {
        localStorage.removeItem('professional');
        navigate('/professional-login');
        return;
      }

      setProfessional(localData);
      setName(localData.name || '');
      setEmail(localData.email || '');
      setPhone(localData.phone || '');
      setLocation(localData.location || '');

      try {
        const [profileResponse, roleResponse] = await Promise.all([
          fetch(`${BACKEND_URL}/api/professionals/${localData.id}`, {
            headers: { 'Authorization': `Bearer ${token}` }
          }),
          fetch(`${BACKEND_URL}/api/role/current`, {
            headers: { 'Authorization': `Bearer ${token}` }
          })
        ]);

        if (profileResponse.ok) {
          const serverData = await profileResponse.json();
          setProfessional(serverData);
          setName(serverData.name || '');
          setEmail(serverData.email || '');
          setPhone(serverData.phone || '');
          setLocation(serverData.location || '');
          localStorage.setItem('professional', JSON.stringify(serverData));
        }

        if (roleResponse.ok) {
          const roleData = await roleResponse.json();
          setIsAlreadyClient(roleData.activeRole === 'CLIENT');
        }
      } catch (fetchError) {
        console.warn('Usando datos locales por error de red:', fetchError.message);
      }
    } catch (error) {
      if (error instanceof SyntaxError) {
        clearAllAppData();
        navigate('/professional-login');
        return;
      }
      setErrorModal({
        title: 'Error al cargar perfil',
        message: 'No se pudieron cargar tus datos. Por favor, iniciá sesión nuevamente.'
      });
      setTimeout(() => { clearAllAppData(); navigate('/professional-login'); }, 2000);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();

    if (phone && !validatePhone(phone)) {
      setToast({ type: 'error', message: 'El formato del teléfono no es válido. Ej: +54 11 1234-5678' });
      return;
    }

    setSaving(true);
    try {
      const token = localStorage.getItem('authToken');
      const response = await fetch(`${BACKEND_URL}/api/auth/update-profile`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ phone, location })
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Error al actualizar perfil');
      }

      const updatedData = await response.json();
      setProfessional(updatedData);
      setName(updatedData.name || '');
      setEmail(updatedData.email || '');
      setPhone(updatedData.phone || '');
      setLocation(updatedData.location || '');
      localStorage.setItem('professional', JSON.stringify(updatedData));
      setToast({ type: 'success', message: 'Perfil actualizado correctamente' });
    } catch (err) {
      setToast({ type: 'error', message: err.message });
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteAccount = async () => {
    setDeleting(true);
    try {
      const token = localStorage.getItem('authToken');
      const response = await fetch(`${BACKEND_URL}/api/auth/delete-account/${professional.id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (!response.ok) throw new Error('Error al eliminar cuenta');
      clearAllAppData();
      setToast({ type: 'success', message: 'Cuenta eliminada exitosamente' });
      setTimeout(() => navigate('/'), 2000);
    } catch (error) {
      setErrorModal({ title: 'Error al eliminar cuenta', message: 'No se pudo eliminar tu cuenta. Por favor, intentá nuevamente.' });
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

  if (loading) return <LoadingScreen />;

  return (
    <div className="min-h-screen bg-gray-50 animate-fadeIn pb-32">
      <div className="bg-gradient-to-br from-blue-500 to-purple-600 px-4 pt-6 pb-24">
        <div className="max-w-4xl mx-auto">
          <BackButton />
          <div className="text-center">
            <ProfilePictureUpload
              currentPhoto={professional?.profilePicture}
              userName={name}
              onUploadSuccess={(url) => {
                const updated = { ...professional, profilePicture: url };
                setProfessional(updated);
                localStorage.setItem('professional', JSON.stringify(updated));
              }}
            />
            <h1 className="text-3xl roboto-light text-white mb-2 animate-slideUp mt-3">Editar Perfil</h1>
            <p className="text-white/90 text-lg animate-slideUp delay-100">Actualizá tu información personal</p>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 -mt-16">
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-4 animate-slideUp">
          <form onSubmit={handleSave}>
            <div className="mb-4">
              <label className="block text-gray-700 font-semibold mb-2 flex items-center text-base">
                <User className="w-5 h-5 mr-2 text-purple-600" />Nombre
              </label>
              <input type="text" value={name} disabled className="w-full border-2 border-gray-200 bg-gray-50 rounded-2xl px-4 py-3 text-gray-500 cursor-not-allowed text-base" />
              <p className="text-sm text-gray-500 mt-1">El nombre no se puede modificar</p>
            </div>

            <div className="mb-4">
              <label className="block text-gray-700 font-semibold mb-2 flex items-center text-base">
                <Mail className="w-5 h-5 mr-2 text-purple-600" />Email
              </label>
              <input type="email" value={email} disabled className="w-full border-2 border-gray-200 bg-gray-50 rounded-2xl px-4 py-3 text-gray-500 cursor-not-allowed text-base" />
              <p className="text-sm text-gray-500 mt-1">El email no se puede modificar</p>
            </div>

            <div className="mb-4">
              <label className="block text-gray-700 font-semibold mb-2 flex items-center text-base">
                <Phone className="w-5 h-5 mr-2 text-purple-600" />Teléfono
              </label>
              <input type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="+54 11 1234-5678"
                className="w-full border-2 border-gray-200 rounded-2xl px-4 py-3 focus:border-purple-500 focus:outline-none transition-all text-base" />
              <p className="text-sm text-gray-500 mt-1">Formato: +54 11 1234-5678</p>
            </div>

            <div className="mb-6">
              <LocationSelector value={location} onChange={setLocation} focusColor="purple" label="Lugar de residencia" />
            </div>

            <button type="submit" disabled={saving}
              className="w-full bg-gradient-to-r from-blue-500 to-purple-600 text-white font-bold py-4 rounded-2xl shadow-lg disabled:opacity-50 hover:scale-105 transition-all ripple flex items-center justify-center text-lg">
              {saving ? <><Loader2 className="w-5 h-5 mr-2 animate-spin" />Guardando...</> : <><Save className="w-5 h-5 mr-2" />Guardar Cambios</>}
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
              : 'Si ya no prestás servicios profesionales, podés convertirte en Cliente.'}
          </p>
          <button type="button" onClick={handleSwitchToClient}
            className="w-full bg-gradient-to-r from-green-500 to-teal-600 text-white font-bold py-3 rounded-2xl hover:scale-105 transition-all text-base">
            {isAlreadyClient ? 'Ir a mi perfil de Cliente' : 'Convertirme en Cliente'}
          </button>
        </div>

        <div className="bg-white rounded-2xl shadow-lg p-6 mb-8 border-2 border-red-200 animate-slideUp delay-100">
          <h3 className="text-xl roboto-light text-red-600 mb-2 flex items-center">
            <Trash2 className="w-6 h-6 mr-2" />Zona de Peligro
          </h3>
          <p className="text-gray-600 mb-4 text-base">
            Una vez eliminada tu cuenta, no podrás recuperar tus datos, incluyendo tu CV, calificaciones y perfil.
          </p>
          <button onClick={() => setShowDeleteModal(true)}
            className="w-full bg-red-500 text-white font-bold py-3 rounded-2xl shadow-lg hover:bg-red-600 transition-all text-base">
            Eliminar mi cuenta
          </button>
        </div>
      </div>

      <HomeButton />

      {showDeleteModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 animate-fadeIn">
          <div className="bg-white rounded-3xl p-8 max-w-md w-full mx-4 animate-scaleIn">
            <h2 className="text-2xl roboto-light text-gray-800 mb-4">¿Eliminar cuenta?</h2>
            <p className="text-gray-600 mb-6 text-base">
              Esta acción es permanente y eliminará todos tus datos. <strong>No se puede deshacer.</strong>
            </p>
            <div className="flex gap-4">
              <button onClick={() => setShowDeleteModal(false)} className="flex-1 bg-gray-200 text-gray-800 font-bold py-3 rounded-2xl hover:bg-gray-300 transition-all text-base">Cancelar</button>
              <button onClick={handleDeleteAccount} disabled={deleting}
                className="flex-1 bg-red-500 text-white font-bold py-3 rounded-2xl hover:bg-red-600 disabled:opacity-50 transition-all text-base">
                {deleting ? <span className="flex items-center justify-center"><Loader2 className="w-5 h-5 mr-2 animate-spin" />Eliminando...</span> : 'Sí, eliminar'}
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

      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
      {errorModal && <ErrorModal title={errorModal.title} message={errorModal.message} onClose={() => setErrorModal(null)} />}
    </div>
  );
}

export default EditProfileProfessional;