import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Loader2, User, Mail, Phone, Save, Trash2, Briefcase } from 'lucide-react';
import Toast from '../components/Toast';
import ErrorModal from '../components/ErrorModal';
import UpgradeToProfessionalModal from '../components/UpgradeToProfessionalModal';
import LoadingScreen from '../components/LoadingScreen';
import BackButton from '../components/BackButton';
import HomeButton from '../components/HomeButton';
import { clearAllAppData, validatePhone } from '../utils/storage';
import { BACKEND_URL } from '../config';
import LocationSelector from '../components/LocationSelector';
import ProfilePictureUpload from '../components/ProfilePictureUpload';

function EditProfile() {
  const navigate = useNavigate();
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

  useEffect(() => { loadProfile(); }, []);

  const loadProfile = async () => {
    try {
      const savedData = localStorage.getItem('client');
      const token = localStorage.getItem('authToken');

      if (!savedData || !token) { navigate('/client-login'); return; }

      let localData;
      try {
        localData = JSON.parse(savedData);
      } catch {
        localStorage.removeItem('client');
        navigate('/client-login');
        return;
      }

      setClient(localData);
      setName(localData.name || '');
      setEmail(localData.email || '');
      setPhone(localData.phone || '');
      setLocation(localData.location || '');

      try {
        const response = await fetch(`${BACKEND_URL}/api/auth/me/client`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (response.ok) {
          const serverData = await response.json();
          setClient(serverData);
          setName(serverData.name || '');
          setEmail(serverData.email || '');
          setPhone(serverData.phone || '');
          setLocation(serverData.location || '');
          localStorage.setItem('client', JSON.stringify(serverData));
        }
      } catch {
        console.warn('Uso de datos locales por error de red');
      }
    } catch (error) {
      console.error('Error al cargar perfil:', error);
      if (error instanceof SyntaxError) { clearAllAppData(); navigate('/client-login'); return; }
      setErrorModal({ title: 'Error al cargar perfil', message: 'No se pudieron cargar tus datos.' });
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (phone && !validatePhone(phone)) {
      setToast({ type: 'error', message: 'El formato del teléfono no es válido.' });
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
      if (!response.ok) throw new Error('Error al actualizar');
      const updatedData = await response.json();
      setClient(updatedData);
      localStorage.setItem('client', JSON.stringify(updatedData));
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
      const response = await fetch(`${BACKEND_URL}/api/auth/delete-account/${client.id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (!response.ok) throw new Error('Error al eliminar cuenta');
      clearAllAppData();
      setToast({ type: 'success', message: 'Cuenta eliminada' });
      setTimeout(() => navigate('/'), 2000);
    } catch (error) {
      setErrorModal({ title: 'Error', message: 'No se pudo eliminar la cuenta.' });
    } finally {
      setDeleting(false);
      setShowDeleteModal(false);
    }
  };

  if (loading) return <LoadingScreen />;

  return (
    <div className="min-h-screen bg-gray-50 animate-fadeIn pb-32">
      <div className="bg-gradient-to-br from-green-500 to-teal-600 px-4 pt-6 pb-16 text-center relative">
        <div className="flex items-start mb-4">
          <BackButton to="/client-dashboard" />
        </div>
        <ProfilePictureUpload
          currentPhoto={client?.profilePicture}
          userName={name}
          onUploadSuccess={(url) => {
            const updated = { ...client, profilePicture: url };
            setClient(updated);
            localStorage.setItem('client', JSON.stringify(updated));
          }}
        />
        <h1 className="text-3xl roboto-light text-white mb-2 mt-3">Editar Perfil</h1>
      </div>

      <div className="max-w-4xl mx-auto px-4 mt-4">
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-4">
          <form onSubmit={handleSave}>
            <div className="mb-4">
              <label className="block text-gray-700 font-semibold mb-2 flex items-center">
                <User className="w-5 h-5 mr-2 text-teal-600" /> Nombre
              </label>
              <input type="text" value={name} disabled className="w-full border-2 bg-gray-50 rounded-2xl px-4 py-3 text-gray-500 cursor-not-allowed" />
            </div>
            <div className="mb-4">
              <label className="block text-gray-700 font-semibold mb-2 flex items-center">
                <Mail className="w-5 h-5 mr-2 text-teal-600" /> Email
              </label>
              <input type="email" value={email} disabled className="w-full border-2 bg-gray-50 rounded-2xl px-4 py-3 text-gray-500 cursor-not-allowed" />
            </div>
            <div className="mb-4">
              <label className="block text-gray-700 font-semibold mb-2 flex items-center">
                <Phone className="w-5 h-5 mr-2 text-teal-600" /> Teléfono
              </label>
              <input type="tel" value={phone} onChange={(e) => setPhone(e.target.value)}
                className="w-full border-2 rounded-2xl px-4 py-3 focus:border-teal-500 focus:outline-none transition-all" />
            </div>
            <div className="mb-6">
              <LocationSelector value={location} onChange={setLocation} focusColor="green" />
            </div>
            <button type="submit" disabled={saving}
              className="w-full bg-gradient-to-r from-green-500 to-teal-600 text-white font-bold py-4 rounded-2xl flex items-center justify-center text-lg shadow-lg disabled:opacity-50 hover:scale-105 transition-all">
              {saving
                ? <><Loader2 className="w-5 h-5 mr-2 animate-spin" />Guardando...</>
                : <><Save className="w-5 h-5 mr-2" />Guardar Cambios</>
              }
            </button>
          </form>
        </div>

        <div className="bg-white rounded-2xl shadow-lg p-6 mb-4 border-2 border-blue-200">
          <h3 className="text-xl roboto-light text-gray-800 mb-2 flex items-center">
            <Briefcase className="w-6 h-6 mr-2 text-blue-600" /> ¿Sos un profesional?
          </h3>
          <p className="text-gray-600 mb-4">Convertite en Profesional para recibir calificaciones.</p>
          <button onClick={() => setShowUpgradeModal(true)}
            className="w-full bg-gradient-to-r from-blue-500 to-purple-600 text-white font-bold py-3 rounded-2xl hover:scale-105 transition-all">
            Convertirme en Profesional
          </button>
        </div>

        <div className="bg-white rounded-2xl shadow-lg p-6 mb-8 border-2 border-red-200">
          <h3 className="text-xl roboto-light text-red-600 mb-2 flex items-center">
            <Trash2 className="w-6 h-6 mr-2" /> Zona de Peligro
          </h3>
          <p className="text-gray-600 mb-4 text-base">
            Una vez eliminada tu cuenta, no podrás recuperar tus datos. <strong>No se puede deshacer.</strong>
          </p>
          <button onClick={() => setShowDeleteModal(true)}
            className="w-full bg-red-500 text-white font-bold py-3 rounded-2xl shadow-lg hover:bg-red-600 transition-all">
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
              <button onClick={() => setShowDeleteModal(false)}
                className="flex-1 bg-gray-200 text-gray-800 font-bold py-3 rounded-2xl hover:bg-gray-300 transition-all">
                Cancelar
              </button>
              <button onClick={handleDeleteAccount} disabled={deleting}
                className="flex-1 bg-red-500 text-white font-bold py-3 rounded-2xl hover:bg-red-600 disabled:opacity-50 transition-all">
                {deleting
                  ? <span className="flex items-center justify-center"><Loader2 className="w-5 h-5 mr-2 animate-spin" />Eliminando...</span>
                  : 'Sí, eliminar'
                }
              </button>
            </div>
          </div>
        </div>
      )}

      {showUpgradeModal && (
        <UpgradeToProfessionalModal
          onClose={() => setShowUpgradeModal(false)}
          onSuccess={(newToken) => {
            localStorage.setItem('authToken', newToken);
            localStorage.setItem('userType', 'PROFESSIONAL');
            const professionalData = { id: client.id, name: client.name, email: client.email, totalRatings: 0, reputationScore: 0 };
            localStorage.setItem('professional', JSON.stringify(professionalData));
            localStorage.removeItem('client');
            setToast({ type: 'success', message: '¡Rol actualizado! Cargando CV...' });
            setTimeout(() => navigate('/edit-cv'), 800);
          }}
        />
      )}

      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
      {errorModal && <ErrorModal title={errorModal.title} message={errorModal.message} onClose={() => setErrorModal(null)} />}
    </div>
  );
}

export default EditProfile;