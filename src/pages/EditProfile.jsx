import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Loader2, User, Mail, Phone, MapPin, Save, Trash2, X } from 'lucide-react';

function EditProfile() {
  const navigate = useNavigate();
  const backendUrl = 'https://professional-rating-backend-production.up.railway.app';
  
  const [professional, setProfessional] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  
  // Campos del formulario
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [location, setLocation] = useState('');
  
  // Modal eliminar cuenta
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleting, setDeleting] = useState(false);
  
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = () => {
    const savedData = localStorage.getItem('professional');
    if (savedData) {
      const data = JSON.parse(savedData);
      setProfessional(data);
      setName(data.name || '');
      setEmail(data.email || '');
      setPhone(data.phone || '');
      setLocation(data.location || '');
      setLoading(false);
    } else {
      navigate('/professional-login');
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setSaving(true);

    try {
      const response = await fetch(`${backendUrl}/api/auth/update-profile`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ phone, location })
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Error al actualizar perfil');
      }

      const data = await response.json();
      
      // Actualizar localStorage
      const updatedProfessional = {
        ...professional,
        phone: data.phone || phone,
        location: data.location || location
      };
      localStorage.setItem('professional', JSON.stringify(updatedProfessional));
      setProfessional(updatedProfessional);

      setSuccess('Perfil actualizado correctamente');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteAccount = async () => {
    setDeleting(true);
    try {
      const response = await fetch(`${backendUrl}/api/auth/delete-account/${professional.id}`, {
        method: 'DELETE',
        credentials: 'include'
      });

      if (!response.ok) {
        throw new Error('Error al eliminar cuenta');
      }

      localStorage.removeItem('professional');
      alert('Tu cuenta ha sido eliminada exitosamente');
      navigate('/');
    } catch (error) {
      console.error('Error deleting account:', error);
      alert('Error al eliminar la cuenta. Intentá nuevamente.');
    } finally {
      setDeleting(false);
      setShowDeleteModal(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center animate-fadeIn">
        <div className="text-center">
          <Loader2 className="w-16 h-16 text-white animate-spin mx-auto mb-4" />
          <p className="text-white text-xl">Cargando...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 animate-fadeIn">
      {/* Navbar */}
      <nav className="bg-gradient-to-r from-blue-500 to-purple-600 px-4 py-4 animate-slideDown">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div 
            onClick={() => navigate('/dashboard')}
            className="text-xl font-bold text-white cursor-pointer hover:scale-105 transition-transform flex items-center gap-2"
          >
            <ArrowLeft className="w-5 h-5" />
            Volver al Dashboard
          </div>
        </div>
      </nav>

      {/* Header */}
      <div className="bg-gradient-to-br from-blue-500 to-purple-600 px-4 pt-6 pb-24">
        <div className="max-w-4xl mx-auto text-center">
          <div className="w-24 h-24 bg-white rounded-full mx-auto mb-4 flex items-center justify-center text-4xl font-bold text-purple-600 animate-scaleIn">
            {name.charAt(0)}
          </div>
          <h1 className="text-3xl font-bold text-white mb-2 animate-slideUp">
            Editar Perfil
          </h1>
          <p className="text-white/90 animate-slideUp delay-100">
            Actualizá tus datos personales
          </p>
        </div>
      </div>

      {/* Contenido */}
      <div className="max-w-4xl mx-auto px-4 -mt-16">
        {/* Formulario */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-4 animate-slideUp">
          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-2xl mb-4 animate-shake">
              {error}
            </div>
          )}

          {success && (
            <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded-2xl mb-4 animate-slideUp">
              {success}
            </div>
          )}

          <form onSubmit={handleSave}>
            {/* Nombre (solo lectura) */}
            <div className="mb-4">
              <label className="block text-gray-700 font-semibold mb-2 flex items-center">
                <User className="w-5 h-5 mr-2 text-purple-600" />
                Nombre
              </label>
              <input
                type="text"
                value={name}
                disabled
                className="w-full border-2 border-gray-200 bg-gray-50 rounded-2xl px-4 py-3 text-gray-500 cursor-not-allowed"
              />
              <p className="text-xs text-gray-500 mt-1">El nombre no se puede modificar</p>
            </div>

            {/* Email (solo lectura) */}
            <div className="mb-4">
              <label className="block text-gray-700 font-semibold mb-2 flex items-center">
                <Mail className="w-5 h-5 mr-2 text-purple-600" />
                Email
              </label>
              <input
                type="email"
                value={email}
                disabled
                className="w-full border-2 border-gray-200 bg-gray-50 rounded-2xl px-4 py-3 text-gray-500 cursor-not-allowed"
              />
              <p className="text-xs text-gray-500 mt-1">El email no se puede modificar</p>
            </div>

            {/* Teléfono */}
            <div className="mb-4">
              <label className="block text-gray-700 font-semibold mb-2 flex items-center">
                <Phone className="w-5 h-5 mr-2 text-purple-600" />
                Teléfono
              </label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+54 11 1234-5678"
                className="w-full border-2 border-gray-200 rounded-2xl px-4 py-3 focus:border-purple-500 focus:outline-none transition-all"
              />
            </div>

            {/* Ubicación */}
            <div className="mb-6">
              <label className="block text-gray-700 font-semibold mb-2 flex items-center">
                <MapPin className="w-5 h-5 mr-2 text-purple-600" />
                Ubicación
              </label>
              <input
                type="text"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="Buenos Aires, Argentina"
                className="w-full border-2 border-gray-200 rounded-2xl px-4 py-3 focus:border-purple-500 focus:outline-none transition-all"
              />
            </div>

            {/* Botón Guardar */}
            <button
              type="submit"
              disabled={saving}
              className="w-full bg-gradient-to-r from-blue-500 to-purple-600 text-white font-bold py-4 rounded-2xl shadow-lg disabled:opacity-50 hover:scale-105 transition-all ripple flex items-center justify-center"
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

        {/* Zona de peligro - Eliminar cuenta */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-6 border-2 border-red-200 animate-slideUp delay-100">
          <h3 className="text-lg font-bold text-red-600 mb-2 flex items-center">
            <Trash2 className="w-5 h-5 mr-2" />
            Zona de Peligro
          </h3>
          <p className="text-gray-600 mb-4 text-sm">
            Una vez eliminada tu cuenta, no podrás recuperar tus datos.
          </p>
          <button
            onClick={() => setShowDeleteModal(true)}
            className="w-full bg-red-500 text-white font-bold py-3 rounded-2xl shadow-lg hover:bg-red-600 transition-all"
          >
            Eliminar mi cuenta
          </button>
        </div>
      </div>

      {/* Modal de confirmación */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 animate-fadeIn">
          <div className="bg-white rounded-3xl p-8 max-w-md w-full mx-4 animate-scaleIn">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">
              ¿Eliminar cuenta?
            </h2>
            <p className="text-gray-600 mb-6">
              Esta acción es permanente y eliminará todos tus datos, incluyendo tu CV, calificaciones y perfil. 
              <strong> No se puede deshacer.</strong>
            </p>
            
            <div className="flex gap-4">
              <button
                onClick={() => setShowDeleteModal(false)}
                className="flex-1 bg-gray-200 text-gray-800 font-bold py-3 rounded-2xl hover:bg-gray-300 transition-all"
              >
                Cancelar
              </button>
              <button
                onClick={handleDeleteAccount}
                disabled={deleting}
                className="flex-1 bg-red-500 text-white font-bold py-3 rounded-2xl hover:bg-red-600 disabled:opacity-50 transition-all"
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
    </div>
  );
}

export default EditProfile;