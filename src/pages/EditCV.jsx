import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Plus, Edit2, Trash2, Save, Loader2, Briefcase, X, User, MapPin, Phone, Award, Download, Camera } from 'lucide-react';
import Toast from '../components/Toast';
import ErrorModal from '../components/ErrorModal';


function EditCV() {
  const navigate = useNavigate();
  const backendUrl = 'https://professional-rating-backend-production.up.railway.app';
  const [professional, setProfessional] = useState(null);
  
  // Información personal
  const [description, setDescription] = useState('');
  const [phone, setPhone] = useState('');
  const [location, setLocation] = useState('');
  const [professionalTitle, setProfessionalTitle] = useState('');
  const [profilePicture, setProfilePicture] = useState('');
  
  const [workHistory, setWorkHistory] = useState([]);
  const [businesses, setBusinesses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingWork, setEditingWork] = useState(null);
  const [downloadingPDF, setDownloadingPDF] = useState(false);
  
  // Estados para foto
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const [photoPreview, setPhotoPreview] = useState(null);

  // Toast, ErrorModal y ConfirmModal
  const [toast, setToast] = useState(null);
  const [errorModal, setErrorModal] = useState(null);
  const [confirmModal, setConfirmModal] = useState(null);

  // Form data para experiencia laboral
  const [formData, setFormData] = useState({
    businessName: '',
    position: '',
    description: '',
    startDate: '',
    endDate: '',
    currentJob: false
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    // Cargar desde localStorage primero
    const savedData = localStorage.getItem('professional');
    if (savedData) {
      const meData = JSON.parse(savedData);
      setProfessional(meData);
      
      // Cargar datos personales
      setPhone(meData.phone || '');
      setLocation(meData.location || '');
      setProfessionalTitle(meData.professionalTitle || '');
      setProfilePicture(meData.profilePicture || '');
    } else {
      navigate('/professional-login');
      return;
    }

    try {
      const token = localStorage.getItem('authToken');
      
      // Obtener CV usando /me
      const cvResponse = await fetch(`${backendUrl}/api/cv/me`, { 
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (cvResponse.ok) {
        const cvData = await cvResponse.json();
        setDescription(cvData.description || '');
        setWorkHistory(cvData.workHistory || []);
      }

      // Obtener lugares de trabajo
      const businessResponse = await fetch(`${backendUrl}/api/businesses`);
      if (businessResponse.ok) {
        const businessData = await businessResponse.json();
        setBusinesses(businessData);
      }
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handlePhotoChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Validar tipo
    if (!file.type.startsWith('image/')) {
      setToast({ type: 'error', message: 'Solo se permiten imágenes' });
      return;
    }

    // Validar tamaño (5MB)
    if (file.size > 5 * 1024 * 1024) {
      setToast({ type: 'error', message: 'La imagen no puede superar 5MB' });
      return;
    }

    // Preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setPhotoPreview(reader.result);
    };
    reader.readAsDataURL(file);

    // Upload automático
    handlePhotoUpload(file);
  };

  const handlePhotoUpload = async (file) => {
    setUploadingPhoto(true);
    try {
      const token = localStorage.getItem('authToken');
      const formData = new FormData();
      formData.append('photo', file);

      const response = await fetch(`${backendUrl}/api/auth/upload-photo`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData
      });

      if (response.ok) {
        const data = await response.json();
        setProfilePicture(data.profilePicture);
        setToast({ type: 'success', message: 'Foto actualizada correctamente' });
      } else {
        const error = await response.json();
        setToast({ type: 'error', message: error.error || 'No se pudo subir la foto' });
        setPhotoPreview(null);
      }
    } catch (error) {
      console.error('Error uploading photo:', error);
      setToast({ type: 'error', message: 'Error al subir la foto' });
      setPhotoPreview(null);
    } finally {
      setUploadingPhoto(false);
    }
  };

  const handleDownloadPDF = async () => {
    setDownloadingPDF(true);
    try {
      const token = localStorage.getItem('authToken');
      const response = await fetch(`${backendUrl}/api/cv/${professional.id}/download-pdf`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error('Error al descargar PDF');
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `CV_${professional.name.replace(/\s+/g, '_')}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      
      setToast({ type: 'success', message: 'CV descargado exitosamente' });
      
    } catch (error) {
      console.error('Error downloading PDF:', error);
      setToast({ type: 'error', message: 'Error al descargar el CV' });
    } finally {
      setDownloadingPDF(false);
    }
  };

  const handleSavePersonalInfo = async () => {
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
          professionalTitle 
        })
      });

      if (response.ok) {
        setToast({ type: 'success', message: 'Información personal guardada' });
        // Actualizar localStorage
        const updatedProfessional = {
          ...professional,
          phone,
          location,
          professionalTitle
        };
        localStorage.setItem('professional', JSON.stringify(updatedProfessional));
        setProfessional(updatedProfessional);
      } else {
        const error = await response.json();
        setToast({ type: 'error', message: error.message || 'No se pudo guardar' });
      }
    } catch (error) {
      console.error('Error saving personal info:', error);
      setToast({ type: 'error', message: 'Error al guardar' });
    } finally {
      setSaving(false);
    }
  };

  const handleSaveDescription = async () => {
    setSaving(true);
    try {
      const token = localStorage.getItem('authToken');
      const response = await fetch(`${backendUrl}/api/cv/me/description`, {
        method: 'PUT',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ description })
      });

      if (response.ok) {
        setToast({ type: 'success', message: 'Descripción guardada' });
      } else {
        const error = await response.json();
        setToast({ type: 'error', message: error.message || 'No se pudo guardar' });
      }
    } catch (error) {
      console.error('Error saving description:', error);
      setToast({ type: 'error', message: 'Error al guardar' });
    } finally {
      setSaving(false);
    }
  };

  const handleAddWorkHistory = async () => {
    if (!formData.businessName || !formData.position || !formData.startDate) {
      setToast({ type: 'warning', message: 'Completá todos los campos obligatorios' });
      return;
    }

    setSaving(true);
    try {
      const token = localStorage.getItem('authToken');
      const payload = {
        businessName: formData.businessName,
        position: formData.position,
        description: formData.description || null,
        startDate: formData.startDate,
        endDate: formData.currentJob ? null : (formData.endDate || null)
      };
      
      const response = await fetch(`${backendUrl}/api/cv/me/work-history`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      });

      if (response.ok) {
        setToast({ type: 'success', message: 'Experiencia agregada' });
        setShowAddForm(false);
        resetForm();
        loadData();
      } else {
        const error = await response.json();
        setToast({ type: 'error', message: error.message || 'No se pudo agregar' });
      }
    } catch (error) {
      console.error('Error adding work history:', error);
      setToast({ type: 'error', message: 'Error al agregar experiencia' });
    } finally {
      setSaving(false);
    }
  };

  const handleUpdateWorkHistory = async () => {
    if (!formData.businessName || !formData.position || !formData.startDate) {
      setToast({ type: 'warning', message: 'Completá todos los campos obligatorios' });
      return;
    }

    setSaving(true);
    try {
      const token = localStorage.getItem('authToken');
      const payload = {
        businessName: formData.businessName,
        position: formData.position,
        description: formData.description || null,
        startDate: formData.startDate,
        endDate: formData.currentJob ? null : (formData.endDate || null)
      };

      const response = await fetch(`${backendUrl}/api/cv/me/work-history/${editingWork.workHistoryId}`, {
        method: 'PUT',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      });

      if (response.ok) {
        setToast({ type: 'success', message: 'Experiencia actualizada' });
        setEditingWork(null);
        resetForm();
        loadData();
      } else {
        const error = await response.json();
        setToast({ type: 'error', message: error.message || 'No se pudo actualizar' });
      }
    } catch (error) {
      console.error('Error updating work history:', error);
      setToast({ type: 'error', message: 'Error al actualizar experiencia' });
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteWorkHistory = async (workHistoryId) => {
    setConfirmModal({
      title: '¿Eliminar experiencia?',
      message: 'Esta acción no se puede deshacer.',
      onConfirm: async () => {
        setSaving(true);
        try {
          const token = localStorage.getItem('authToken');
          const response = await fetch(`${backendUrl}/api/cv/me/work-history/${workHistoryId}`, {
            method: 'DELETE',
            headers: {
              'Authorization': `Bearer ${token}`
            }
          });

          if (response.ok) {
            setToast({ type: 'success', message: 'Experiencia eliminada' });
            loadData();
          } else {
            const error = await response.json();
            setToast({ type: 'error', message: error.message || 'No se pudo eliminar' });
          }
        } catch (error) {
          console.error('Error deleting work history:', error);
          setToast({ type: 'error', message: 'Error al eliminar experiencia' });
        } finally {
          setSaving(false);
          setConfirmModal(null);
        }
      }
    });
  };

  const startEditWorkHistory = (work) => {
    setEditingWork(work);
    setFormData({
      businessName: work.businessName || '',
      position: work.position,
      description: work.description || '',
      startDate: work.startDate,
      endDate: work.endDate || '',
      currentJob: !work.endDate
    });
    setShowAddForm(false);
  };

  const resetForm = () => {
    setFormData({
      businessName: '',
      position: '',
      description: '',
      startDate: '',
      endDate: '',
      currentJob: false
    });
  };

  const cancelEdit = () => {
    setEditingWork(null);
    setShowAddForm(false);
    resetForm();
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

  if (!professional) {
    return null;
  }

  // Determinar qué foto mostrar
  const displayPhoto = photoPreview || profilePicture;

  return (
    <div className="min-h-screen bg-gray-50 animate-fadeIn">
      {/* Header */}
      <div className="bg-gradient-to-br from-blue-500 to-purple-600 px-4 py-6 animate-slideDown">
        <button
          onClick={() => navigate('/dashboard')}
          className="text-white mb-4 flex items-center hover:translate-x-[-4px] transition-transform duration-300"
        >
          <ArrowLeft className="w-5 h-5 mr-2" />
          Volver al Dashboard
        </button>
        <h1 className="text-2xl font-bold text-white">Editar mi CV</h1>
      </div>

      <div className="px-4 py-6 max-w-3xl mx-auto">
        {/* Foto de Perfil */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-6 animate-slideUp">
          <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center">
            <Camera className="w-5 h-5 mr-2 text-purple-600" />
            Foto de Perfil
          </h2>

          <div className="flex flex-col items-center">
            {/* Preview de foto */}
            <div className="relative mb-4">
              {displayPhoto ? (
                <img
                  src={displayPhoto}
                  alt="Foto de perfil"
                  className="w-32 h-32 rounded-full object-cover border-4 border-purple-500"
                />
              ) : (
                <div className="w-32 h-32 rounded-full bg-purple-500 flex items-center justify-center text-white text-4xl font-bold">
                  {professional.name.charAt(0)}
                </div>
              )}
              {uploadingPhoto && (
                <div className="absolute inset-0 bg-black bg-opacity-50 rounded-full flex items-center justify-center">
                  <Loader2 className="w-8 h-8 text-white animate-spin" />
                </div>
              )}
            </div>

            {/* Input de archivo */}
            <label className="bg-gradient-to-r from-blue-500 to-purple-600 text-white font-semibold px-6 py-2 rounded-full hover:scale-105 transition-all cursor-pointer flex items-center">
              <Camera className="w-4 h-4 mr-2" />
              {displayPhoto ? 'Cambiar foto' : 'Subir foto'}
              <input
                type="file"
                accept="image/*"
                capture="user"
                onChange={handlePhotoChange}
                className="hidden"
                disabled={uploadingPhoto}
              />
            </label>
            <p className="text-xs text-gray-500 mt-2">JPG, PNG. Máx 5MB</p>
          </div>
        </div>

        {/* Información Personal */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-6 animate-slideUp delay-50">
          <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center">
            <User className="w-5 h-5 mr-2 text-purple-600" />
            Información Personal
          </h2>

          <div className="space-y-4">
            {/* Título Profesional */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1 flex items-center">
                <Award className="w-4 h-4 mr-1 text-purple-600" />
                Título Profesional
              </label>
              <input
                type="text"
                value={professionalTitle}
                onChange={(e) => setProfessionalTitle(e.target.value)}
                placeholder="Ej: Mesero Senior, Electricista Matriculado, Chef Profesional..."
                className="w-full border-2 border-gray-200 rounded-xl px-3 py-2 focus:border-purple-500 focus:outline-none"
                maxLength="100"
              />
              <p className="text-xs text-gray-500 mt-1">Tu título o especialización profesional</p>
            </div>

            {/* Teléfono */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1 flex items-center">
                <Phone className="w-4 h-4 mr-1 text-purple-600" />
                Teléfono
              </label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="Ej: +54 11 1234-5678"
                className="w-full border-2 border-gray-200 rounded-xl px-3 py-2 focus:border-purple-500 focus:outline-none"
                maxLength="20"
              />
            </div>

            {/* Ubicación */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1 flex items-center">
                <MapPin className="w-4 h-4 mr-1 text-purple-600" />
                Ubicación
              </label>
              <input
                type="text"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="Ej: Buenos Aires, Argentina"
                className="w-full border-2 border-gray-200 rounded-xl px-3 py-2 focus:border-purple-500 focus:outline-none"
                maxLength="100"
              />
              <p className="text-xs text-gray-500 mt-1">Ciudad y país donde trabajás</p>
            </div>
          </div>

          <div className="flex justify-end mt-4">
            <button
              onClick={handleSavePersonalInfo}
              disabled={saving}
              className="bg-gradient-to-r from-blue-500 to-purple-600 text-white font-semibold px-6 py-2 rounded-full hover:scale-105 transition-all disabled:opacity-50 flex items-center ripple"
            >
              {saving ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
              Guardar
            </button>
          </div>
        </div>

        {/* Sobre mí */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-6 animate-slideUp delay-100">
          <h2 className="text-xl font-bold text-gray-800 mb-4">Sobre mí</h2>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Describite profesionalmente... ¿Cuáles son tus fortalezas? ¿Qué te apasiona de tu trabajo?"
            className="w-full border-2 border-gray-200 rounded-2xl p-4 focus:border-purple-500 focus:outline-none resize-none transition-all"
            rows="5"
            maxLength="500"
            spellCheck="true"
            lang="es"
          />
          <div className="flex justify-between items-center mt-2">
            <span className="text-sm text-gray-400">{description.length}/500</span>
            <button
              onClick={handleSaveDescription}
              disabled={saving}
              className="bg-gradient-to-r from-blue-500 to-purple-600 text-white font-semibold px-6 py-2 rounded-full hover:scale-105 transition-all disabled:opacity-50 flex items-center ripple"
            >
              {saving ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
              Guardar
            </button>
          </div>
        </div>
        {/* Historial Laboral */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-6 animate-slideUp delay-200">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold text-gray-800 flex items-center">
              <Briefcase className="w-5 h-5 mr-2 text-purple-600" />
              Experiencia Laboral
            </h2>
            {!showAddForm && !editingWork && (
              <button
                onClick={() => setShowAddForm(true)}
                className="bg-green-500 text-white p-2 rounded-full hover:bg-green-600 transition-all hover-scale"
              >
                <Plus className="w-5 h-5" />
              </button>
            )}
          </div>

          {/* Formulario agregar/editar */}
          {(showAddForm || editingWork) && (
            <div className="bg-gray-50 rounded-2xl p-4 mb-4 animate-scaleIn">
              <div className="flex justify-between items-center mb-3">
                <h3 className="font-semibold text-gray-800">
                  {editingWork ? 'Editar Experiencia' : 'Nueva Experiencia'}
                </h3>
                <button
                  onClick={cancelEdit}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              
              <div className="mb-3">
                <label className="block text-sm font-semibold text-gray-700 mb-1">Lugar de Trabajo *</label>
                <input
                  type="text"
                  value={formData.businessName || ''}
                  onChange={(e) => setFormData({ ...formData, businessName: e.target.value })}
                  placeholder="Ej: La Parrilla, Estudio Jurídico López, etc."
                  className="w-full border-2 border-gray-200 rounded-xl px-3 py-2 focus:border-purple-500 focus:outline-none"
                  required
                />
                <p className="text-xs text-gray-500 mt-1">Escribí el nombre del lugar donde trabajás o trabajaste</p>
              </div>

              <div className="mb-3">
                <label className="block text-sm font-semibold text-gray-700 mb-1">Puesto *</label>
                <input
                  type="text"
                  value={formData.position}
                  onChange={(e) => setFormData({ ...formData, position: e.target.value })}
                  placeholder="Ej: Camarero, Electricista, Peluquera, etc."
                  className="w-full border-2 border-gray-200 rounded-xl px-3 py-2 focus:border-purple-500 focus:outline-none"
                  required
                />
              </div>

              {/* Descripción del puesto */}
              <div className="mb-3">
                <label className="block text-sm font-semibold text-gray-700 mb-1">Descripción (opcional)</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Ej: Atención al cliente, manejo de caja, preparación de bebidas, gestión de inventario..."
                  className="w-full border-2 border-gray-200 rounded-xl px-3 py-2 focus:border-purple-500 focus:outline-none resize-none"
                  rows="3"
                  maxLength="500"
                />
                <p className="text-xs text-gray-500 mt-1">Describí tus responsabilidades y logros en este puesto</p>
              </div>

              <div className="grid grid-cols-2 gap-3 mb-3">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Desde *</label>
                  <input
                    type="date"
                    value={formData.startDate}
                    onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                    min="1950-01-01"
                    max={new Date().toISOString().split('T')[0]}
                    className="w-full border-2 border-gray-200 rounded-xl px-3 py-2 focus:border-purple-500 focus:outline-none"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Hasta</label>
                  <input
                    type="date"
                    value={formData.endDate}
                    onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                    min={formData.startDate || "1950-01-01"}
                    max={new Date().toISOString().split('T')[0]}
                    disabled={formData.currentJob}
                    className="w-full border-2 border-gray-200 rounded-xl px-3 py-2 focus:border-purple-500 focus:outline-none disabled:bg-gray-100"
                  />
                </div>
              </div>

              <label className="flex items-center mb-4">
                <input
                  type="checkbox"
                  checked={formData.currentJob}
                  onChange={(e) => setFormData({ ...formData, currentJob: e.target.checked, endDate: '' })}
                  className="mr-2"
                />
                <span className="text-sm text-gray-700">Trabajo aquí actualmente</span>
              </label>

              <div className="flex gap-2">
                <button
                  onClick={editingWork ? handleUpdateWorkHistory : handleAddWorkHistory}
                  disabled={saving}
                  className="flex-1 bg-green-500 text-white font-semibold py-2 rounded-xl hover:bg-green-600 transition-all disabled:opacity-50"
                >
                  {saving ? 'Guardando...' : (editingWork ? 'Actualizar' : 'Agregar')}
                </button>
                <button
                  onClick={cancelEdit}
                  className="flex-1 bg-gray-300 text-gray-700 font-semibold py-2 rounded-xl hover:bg-gray-400 transition-all"
                >
                  Cancelar
                </button>
              </div>
            </div>
          )}

          {/* Lista de experiencias */}
          <div className="space-y-3">
            {workHistory.length === 0 ? (
              <p className="text-gray-500 text-center py-4">No tenés experiencias agregadas</p>
            ) : (
              workHistory.map((work, index) => (
                <div 
                  key={work.workHistoryId} 
                  className="border-l-4 border-purple-600 pl-4 py-2 bg-gray-50 rounded-r-xl animate-slideUp flex justify-between items-start"
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-800">{work.position}</h3>
                    <p className="text-purple-600 font-medium">{work.businessName}</p>
                    {work.description && (
                      <p className="text-sm text-gray-600 mt-1">{work.description}</p>
                    )}
                    <p className="text-sm text-gray-500 mt-1">
                      {work.startDate} - {work.endDate || 'Presente'}
                    </p>
                  </div>
                  <div className="flex gap-2 ml-4">
                    <button
                      onClick={() => startEditWorkHistory(work)}
                      className="text-blue-600 hover:text-blue-800 p-2 hover:bg-blue-50 rounded-lg transition-all"
                      title="Editar"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDeleteWorkHistory(work.workHistoryId)}
                      className="text-red-600 hover:text-red-800 p-2 hover:bg-red-50 rounded-lg transition-all"
                      title="Eliminar"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Descargar CV PDF */}
        <div className="bg-gradient-to-r from-green-500 to-emerald-600 rounded-2xl shadow-lg p-6 mb-6 animate-slideUp delay-300">
          <div className="text-center text-white">
            <Download className="w-12 h-12 mx-auto mb-3" />
            <h3 className="text-xl font-bold mb-2">¿Listo para compartir tu CV?</h3>
            <p className="text-sm text-white/90 mb-4">
              Descargá tu CV profesional en formato PDF con toda la información actualizada
            </p>
            <button
              onClick={handleDownloadPDF}
              disabled={downloadingPDF}
              className="bg-white text-green-600 font-bold px-8 py-3 rounded-xl shadow-lg disabled:opacity-50 hover:scale-105 transition-all duration-300 ripple flex items-center mx-auto"
            >
              {downloadingPDF ? (
                <>
                  <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                  Generando PDF...
                </>
              ) : (
                <>
                  <Download className="w-5 h-5 mr-2" />
                  Descargar mi CV
                </>
              )}
            </button>
          </div>
        </div>
      </div>

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

      {/* Confirm modal */}
      {confirmModal && (
        <ErrorModal
          title={confirmModal.title}
          message={confirmModal.message}
          onClose={() => setConfirmModal(null)}
          showCancel={true}
          onConfirm={confirmModal.onConfirm}
          actionText="Sí, eliminar"
        />
      )}
    </div>
  );
}

export default EditCV;