import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Loader2, Plus, Save, Briefcase, GraduationCap, Award, Home, ChevronDown, ChevronRight, Lock, AlertTriangle } from 'lucide-react';
import Toast from '../components/Toast';
import LoadingScreen from '../components/LoadingScreen';

function EditCV() {
  const navigate = useNavigate();
  const backendUrl = 'https://professional-rating-backend-production.up.railway.app';
  
  const [cv, setCv] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [savingWorkId, setSavingWorkId] = useState(null); // Para controlar qué trabajo se está guardando
  
  // Estados para el formulario
  const [description, setDescription] = useState('');
  const [freelanceJobs, setFreelanceJobs] = useState([]);
  const [employeeJobs, setEmployeeJobs] = useState([]);
  const [education, setEducation] = useState([]);
  const [certifications, setCertifications] = useState([]);
  
  // Estados de expansión (acordeón)
  const [expandedFreelance, setExpandedFreelance] = useState(null);
  const [expandedEmployee, setExpandedEmployee] = useState(null);
  const [expandedEducation, setExpandedEducation] = useState(null);
  const [expandedCertification, setExpandedCertification] = useState(null);
  
  // Modal de confirmación
  const [deleteModal, setDeleteModal] = useState(null);
  
  // Toast
  const [toast, setToast] = useState(null);

  useEffect(() => {
    loadCV();
  }, []);

  const loadCV = async () => {
    try {
      const professional = JSON.parse(localStorage.getItem('professional'));
      if (!professional) {
        navigate('/professional-login');
        return;
      }

      const token = localStorage.getItem('authToken');
      
      const response = await fetch(`${backendUrl}/api/cv/me/full`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        console.log('✅ CV cargado:', data);
        
        setCv({ id: data.id });
        setDescription(data.description || '');
        
        // Mapear trabajos con información de si tienen calificaciones
        const allJobs = (data.workExperiences || []).map(exp => ({
          workHistoryId: exp.workHistoryId,
          company: exp.businessName || '',
          position: exp.position || '',
          startDate: exp.startDate || '',
          endDate: exp.endDate || '',
          currentlyWorking: exp.isActive || false,
          isFreelance: exp.isFreelance === true,
          description: exp.description || '',
          referenceName: exp.referenceContact || '',
          referencePhone: '',
          hasRatings: exp.totalRatings > 0,
          totalRatings: exp.totalRatings || 0
        }));
        
        setFreelanceJobs(allJobs.filter(job => job.isFreelance === true));
        setEmployeeJobs(allJobs.filter(job => job.isFreelance === false));
        
        setEducation(data.education || []);
        setCertifications(data.certifications || []);
      } else {
        throw new Error('No se pudo cargar el CV');
      }
    } catch (error) {
      console.error('Error loading CV:', error);
      setToast({ type: 'error', message: 'Error al cargar CV' });
    } finally {
      setLoading(false);
    }
  };

  // Función para contar trabajos activos
  const countActiveJobs = () => {
    return [...freelanceJobs, ...employeeJobs].filter(job => job.currentlyWorking === true).length;
  };

  // Nueva función para guardar UNA experiencia laboral individual
  // Nueva función para guardar UNA experiencia laboral individual
const handleSaveWorkExperience = async (job, isFreelance, index) => {
  if (!cv || !cv.id) {
    setToast({ type: 'error', message: 'Error: CV no inicializado' });
    return;
  }

  // Validar que tenga al menos el puesto
  if (!job.position || job.position.trim() === '') {
    setToast({ type: 'error', message: 'El puesto es obligatorio' });
    return;
  }

  setSavingWorkId(job.workHistoryId || 'new'); // Marcar como guardando
  
  try {
    const token = localStorage.getItem('authToken');
    
    // Mapear al formato que espera el backend
    const payload = {
      businessId: job.workHistoryId || null,
      businessName: job.company || '',
      position: job.position,
      startDate: job.startDate,
      endDate: job.endDate,
      isActive: job.currentlyWorking,
      isFreelance: isFreelance,
      description: job.description,
      referenceContact: job.referenceName
    };

    console.log('💾 Guardando experiencia:', payload);

    const response = await fetch(`${backendUrl}/api/cv/${cv.id}/work-experience`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(payload)
    });

    if (response.ok) {
      const data = await response.json();
      console.log('✅ Experiencia guardada:', data);
      
      setToast({ type: 'success', message: 'Experiencia guardada correctamente' });
      
      // Recargar el CV para obtener el ID actualizado
      await loadCV();
      
      // ✅ COLAPSAR DESPUÉS de recargar (agregar un pequeño delay)
      setTimeout(() => {
        if (isFreelance) {
          setExpandedFreelance(null);
        } else {
          setExpandedEmployee(null);
        }
      }, 100); // ← CAMBIO: Agregar delay de 100ms
      
    } else {
      const errorData = await response.json();
      console.error('❌ Error del backend:', errorData);
      setToast({ type: 'error', message: errorData.error || 'Error al guardar' });
    }
  } catch (error) {
    console.error('Error saving work experience:', error);
    setToast({ type: 'error', message: 'Error de conexión al guardar' });
  } finally {
    setSavingWorkId(null);
  }
};

  const handleSave = async () => {
  if (!cv || !cv.id) {
    setToast({ type: 'error', message: 'Error: CV no inicializado correctamente' });
    return;
  }

  setSaving(true);
  try {
    const token = localStorage.getItem('authToken');
    
    // Ahora solo guardamos descripción, educación y certificaciones
    const payload = {
      description,
      education,
      certifications
    };

    const response = await fetch(`${backendUrl}/api/cv/${cv.id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(payload)
    });

    if (response.ok) {
      setToast({ type: 'success', message: 'CV actualizado correctamente' });
      
      // ✅ Redirigir a cv-view después de 1 segundo
      setTimeout(() => {
        navigate('/cv-view');
      }, 1000);
    } else {
      const errorData = await response.json();
      console.error('❌ Error del backend:', errorData);
      
      const errorMessage = errorData.error || errorData.message || 'Error al guardar CV';
      setToast({ type: 'error', message: errorMessage });
      return;
    }
  } catch (error) {
    console.error('Error saving CV:', error);
    setToast({ type: 'error', message: 'Error de conexión al guardar CV' });
  } finally {
    setSaving(false);
  }
};

  // Freelance handlers
  const addFreelanceJob = () => {
    const newJob = {
      company: '',
      position: '',
      startDate: '',
      endDate: '',
      currentlyWorking: false,
      isFreelance: true,
      description: '',
      referenceName: '',
      referencePhone: '',
      hasRatings: false,
      totalRatings: 0
    };
    setFreelanceJobs([...freelanceJobs, newJob]);
    setExpandedFreelance(freelanceJobs.length);
  };

  const updateFreelanceJob = (index, field, value) => {
    const updated = [...freelanceJobs];
    
    // Si intenta marcar como activo, validar el límite
    if (field === 'currentlyWorking' && value === true) {
      const currentActive = countActiveJobs();
      if (currentActive >= 3 && !updated[index].currentlyWorking) {
        setToast({ 
          type: 'warning', 
          message: 'Ya tienes 3 trabajos activos. Desactiva uno para agregar otro.' 
        });
        return;
      }
      updated[index].endDate = '';
    }
    
    updated[index][field] = value;
    setFreelanceJobs(updated);
  };

  const confirmDeleteFreelanceJob = (index) => {
    setDeleteModal({
      type: 'freelance',
      index: index,
      title: '¿Eliminar trabajo autónomo?',
      message: 'Esta acción no se puede deshacer.'
    });
  };

  const removeFreelanceJob = (index) => {
    setFreelanceJobs(freelanceJobs.filter((_, i) => i !== index));
    setDeleteModal(null);
    setExpandedFreelance(null);
  };

  // Employee handlers
  const addEmployeeJob = () => {
    const newJob = {
      company: '',
      position: '',
      startDate: '',
      endDate: '',
      currentlyWorking: false,
      isFreelance: false,
      description: '',
      referenceName: '',
      referencePhone: '',
      hasRatings: false,
      totalRatings: 0
    };
    setEmployeeJobs([...employeeJobs, newJob]);
    setExpandedEmployee(employeeJobs.length);
  };

  const updateEmployeeJob = (index, field, value) => {
    const updated = [...employeeJobs];
    
    // Si intenta marcar como activo, validar el límite
    if (field === 'currentlyWorking' && value === true) {
      const currentActive = countActiveJobs();
      if (currentActive >= 3 && !updated[index].currentlyWorking) {
        setToast({ 
          type: 'warning', 
          message: 'Ya tienes 3 trabajos activos. Desactiva uno para agregar otro.' 
        });
        return;
      }
      updated[index].endDate = '';
    }
    
    updated[index][field] = value;
    setEmployeeJobs(updated);
  };

  const confirmDeleteEmployeeJob = (index) => {
    setDeleteModal({
      type: 'employee',
      index: index,
      title: '¿Eliminar trabajo?',
      message: 'Esta acción no se puede deshacer.'
    });
  };

  const removeEmployeeJob = (index) => {
    setEmployeeJobs(employeeJobs.filter((_, i) => i !== index));
    setDeleteModal(null);
    setExpandedEmployee(null);
  };

  // Education handlers
  const addEducation = () => {
    const newEdu = {
      institution: '',
      degree: '',
      startDate: '',
      endDate: '',
      currentlyStudying: false,
      description: ''
    };
    setEducation([...education, newEdu]);
    setExpandedEducation(education.length);
  };

  const updateEducation = (index, field, value) => {
    const updated = [...education];
    updated[index][field] = value;
    
    if (field === 'currentlyStudying' && value === true) {
      updated[index].endDate = '';
    }
    
    setEducation(updated);
  };

  const confirmDeleteEducation = (index) => {
    setDeleteModal({
      type: 'education',
      index: index,
      title: '¿Eliminar educación?',
      message: 'Esta acción no se puede deshacer.'
    });
  };

  const removeEducation = (index) => {
    setEducation(education.filter((_, i) => i !== index));
    setDeleteModal(null);
    setExpandedEducation(null);
  };

  // Certification handlers
  const addCertification = () => {
    const newCert = {
      name: '',
      issuer: '',
      dateObtained: '',
      expiryDate: ''
    };
    setCertifications([...certifications, newCert]);
    setExpandedCertification(certifications.length);
  };

  const updateCertification = (index, field, value) => {
    const updated = [...certifications];
    updated[index][field] = value;
    setCertifications(updated);
  };

  const confirmDeleteCertification = (index) => {
    setDeleteModal({
      type: 'certification',
      index: index,
      title: '¿Eliminar certificación?',
      message: 'Esta acción no se puede deshacer.'
    });
  };

  const removeCertification = (index) => {
    setCertifications(certifications.filter((_, i) => i !== index));
    setDeleteModal(null);
    setExpandedCertification(null);
  };

  const handleConfirmDelete = () => {
    if (!deleteModal) return;
    
    switch (deleteModal.type) {
      case 'freelance':
        removeFreelanceJob(deleteModal.index);
        break;
      case 'employee':
        removeEmployeeJob(deleteModal.index);
        break;
      case 'education':
        removeEducation(deleteModal.index);
        break;
      case 'certification':
        removeCertification(deleteModal.index);
        break;
    }
  };

  if (loading) {
    return <LoadingScreen />;
  }

  return (
    <div className="min-h-screen bg-gray-50 animate-fadeIn pb-24">
      {/* Header */}
      <div className="bg-gradient-to-br from-blue-500 to-purple-600 px-4 pt-8 pb-24">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-3xl roboto-light text-white mb-2 animate-slideUp">
            Editar CV
          </h1>
          <p className="text-white/90 text-lg animate-slideUp delay-100">
            Agregá tu experiencia, educación y certificaciones
          </p>
        </div>
      </div>

      {/* Contenido */}
      <div className="max-w-4xl mx-auto px-4 -mt-16 pb-8">
        
        {/* SOBRE MÍ */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-4 animate-slideUp">
          <h2 className="text-2xl roboto-light text-gray-800 mb-4 flex items-center">
            <span className="text-2xl mr-2">👤</span>
            Sobre mí
          </h2>
          <textarea
            placeholder="Escribí una breve descripción sobre vos, tus habilidades y experiencia..."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 focus:border-purple-500 focus:outline-none text-base"
            rows="4"
          />
        </div>

        {/* Banner de advertencia - Solo si no tiene trabajos activos */}
        {countActiveJobs() === 0 && (
          <div className="bg-orange-50 border-2 border-orange-200 rounded-2xl p-4 shadow-lg mb-4 animate-slideUp">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center flex-shrink-0">
                <AlertTriangle className="w-5 h-5 text-orange-600" />
              </div>
              <div className="flex-1">
                <h3 className="text-base roboto-light text-orange-900 mb-1">
                  ⚠️ No podés recibir calificaciones todavía
                </h3>
                <p className="text-sm text-orange-800">
                  Para que los clientes puedan calificarte, necesitás tener al menos un trabajo activo (marcado con "Aún trabajo aquí") en tu CV.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Banner informativo - Máximo 3 trabajos activos */}
        {countActiveJobs() >= 3 && (
          <div className="bg-blue-50 border-2 border-blue-200 rounded-2xl p-4 shadow-lg mb-4 animate-slideUp">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                <AlertTriangle className="w-5 h-5 text-blue-600" />
              </div>
              <div className="flex-1">
                <h3 className="text-base roboto-light text-blue-900 mb-1">
                  ℹ️ Límite de trabajos activos alcanzado
                </h3>
                <p className="text-sm text-blue-800">
                  Ya tienes 3 trabajos activos. Para agregar otro trabajo activo, primero desactiva uno existente.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* TRABAJO AUTÓNOMO */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-4 animate-slideUp">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl roboto-light text-gray-800 flex items-center">
              <span className="text-2xl mr-2">💼</span>
              Trabajo Autónomo / Freelance
            </h2>
            <button
              onClick={addFreelanceJob}
              className="bg-green-500 text-white p-2 rounded-full hover:bg-green-600 transition-all hover:scale-110"
            >
              <Plus className="w-5 h-5" />
            </button>
          </div>

          {freelanceJobs.length === 0 ? (
            <p className="text-gray-500 text-center py-4">
              No hay trabajos autónomos agregados
            </p>
          ) : (
            <div className="space-y-2">
              {freelanceJobs.map((job, index) => (
                <div key={index} className="border-2 border-gray-200 rounded-xl overflow-hidden">
                  {/* Header colapsable */}
                  <div
                    onClick={() => setExpandedFreelance(expandedFreelance === index ? null : index)}
                    className="flex items-center justify-between p-4 cursor-pointer hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      {expandedFreelance === index ? (
                        <ChevronDown className="w-5 h-5 text-purple-600" />
                      ) : (
                        <ChevronRight className="w-5 h-5 text-gray-400" />
                      )}
                      <div>
                        <p className="font-semibold text-gray-800 text-base">
                          {job.position || 'Sin título'} {job.company && `- ${job.company}`}
                        </p>
                        <p className="text-sm text-gray-500">
                          {job.currentlyWorking ? 'Actual' : job.endDate ? 'Finalizado' : 'Sin fechas'}
                          {job.hasRatings && ` • ${job.totalRatings} calificación${job.totalRatings !== 1 ? 'es' : ''}`}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Contenido expandible */}
                  {expandedFreelance === index && (
                    <div className="p-4 pt-0 border-t border-gray-100">
                      {job.hasRatings && (
                        <div className="bg-orange-50 border border-orange-200 rounded-lg p-3 mb-3 flex items-start gap-2">
                          <Lock className="w-5 h-5 text-orange-600 flex-shrink-0 mt-0.5" />
                          <div className="text-sm">
                            <p className="font-semibold text-orange-800 mb-1">
                              Campos bloqueados
                            </p>
                            <p className="text-orange-700">
                              Este trabajo ya tiene calificaciones asociadas. El puesto y la empresa no se pueden modificar.
                            </p>
                          </div>
                        </div>
                      )}
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-3">
                        <input
                          type="text"
                          placeholder="Título profesional (Electricista, diseñador, peluquero, etc)"
                          value={job.position}
                          onChange={(e) => updateFreelanceJob(index, 'position', e.target.value)}
                          disabled={job.hasRatings}
                          className="border-2 border-gray-200 rounded-xl px-3 py-2 focus:border-purple-500 focus:outline-none disabled:bg-gray-100 disabled:cursor-not-allowed text-base"
                        />
                        <input
                          type="text"
                          placeholder="Autónomo"
                          value={job.company}
                          onChange={(e) => updateFreelanceJob(index, 'company', e.target.value)}
                          disabled={job.hasRatings}
                          className="border-2 border-gray-200 rounded-xl px-3 py-2 focus:border-purple-500 focus:outline-none disabled:bg-gray-100 disabled:cursor-not-allowed text-base"
                        />
                        <div>
                          <label className="block text-sm font-medium text-gray-600 mb-1 ml-1">Fecha de inicio</label>
                          <input
                            type="date"
                            value={job.startDate}
                            onChange={(e) => updateFreelanceJob(index, 'startDate', e.target.value)}
                            className="w-full border-2 border-gray-200 rounded-xl px-3 py-2 focus:border-purple-500 focus:outline-none text-base"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-600 mb-1 ml-1">Fecha de finalización</label>
                          <input
                            type="date"
                            value={job.endDate}
                            onChange={(e) => updateFreelanceJob(index, 'endDate', e.target.value)}
                            disabled={job.currentlyWorking}
                            className="w-full border-2 border-gray-200 rounded-xl px-3 py-2 focus:border-purple-500 focus:outline-none disabled:bg-gray-100 disabled:cursor-not-allowed text-base"
                          />
                        </div>
                      </div>

                      <div className="mb-3">
                        <label className="flex items-center cursor-pointer">
                          <input
                            type="checkbox"
                            checked={job.currentlyWorking}
                            onChange={(e) => updateFreelanceJob(index, 'currentlyWorking', e.target.checked)}
                            disabled={countActiveJobs() >= 3 && !job.currentlyWorking}
                            className="w-4 h-4 text-purple-600 border-gray-300 rounded focus:ring-purple-500 disabled:opacity-50 disabled:cursor-not-allowed"
                          />
                          <span className="ml-2 text-base text-gray-700">Aún trabajo aquí</span>
                        </label>
                      </div>

                      <textarea
                        placeholder="Descripción del proyecto / responsabilidades"
                        value={job.description}
                        onChange={(e) => updateFreelanceJob(index, 'description', e.target.value)}
                        className="w-full border-2 border-gray-200 rounded-xl px-3 py-2 mb-3 focus:border-purple-500 focus:outline-none text-base"
                        rows="3"
                      />

                      {/* Botón Guardar Individual */}
                      <button
                        onClick={() => handleSaveWorkExperience(job, true, index)}
                        disabled={savingWorkId === (job.workHistoryId || 'new')}
                        className="w-full bg-gradient-to-r from-green-500 to-teal-600 text-white font-bold py-3 rounded-xl shadow-lg disabled:opacity-50 hover:scale-105 transition-all flex items-center justify-center mb-3 text-base"
                      >
                        {savingWorkId === (job.workHistoryId || 'new') ? (
                          <>
                            <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                            Guardando...
                          </>
                        ) : (
                          <>
                            <Save className="w-5 h-5 mr-2" />
                            Guardar trabajo
                          </>
                        )}
                      </button>

                      <button
                        onClick={() => confirmDeleteFreelanceJob(index)}
                        className="text-red-500 hover:text-red-700 font-semibold text-base"
                      >
                        Eliminar trabajo autónomo
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* TRABAJO EN RELACIÓN DE DEPENDENCIA */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-4 animate-slideUp delay-50">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl roboto-light text-gray-800 flex items-center">
              <span className="text-2xl mr-2">🏢</span>
              Trabajo en Relación de Dependencia
            </h2>
            <button
              onClick={addEmployeeJob}
              className="bg-green-500 text-white p-2 rounded-full hover:bg-green-600 transition-all hover:scale-110"
            >
              <Plus className="w-5 h-5" />
            </button>
          </div>

          {employeeJobs.length === 0 ? (
            <p className="text-gray-500 text-center py-4">
              No hay trabajos en relación de dependencia agregados
            </p>
          ) : (
            <div className="space-y-2">
              {employeeJobs.map((job, index) => (
                <div key={index} className="border-2 border-gray-200 rounded-xl overflow-hidden">
                  {/* Header colapsable */}
                  <div
                    onClick={() => setExpandedEmployee(expandedEmployee === index ? null : index)}
                    className="flex items-center justify-between p-4 cursor-pointer hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      {expandedEmployee === index ? (
                        <ChevronDown className="w-5 h-5 text-purple-600" />
                      ) : (
                        <ChevronRight className="w-5 h-5 text-gray-400" />
                      )}
                      <div>
                        <p className="font-semibold text-gray-800 text-base">
                          {job.position || 'Sin título'} {job.company && `- ${job.company}`}
                        </p>
                        <p className="text-sm text-gray-500">
                          {job.currentlyWorking ? 'Actual' : job.endDate ? 'Finalizado' : 'Sin fechas'}
                          {job.hasRatings && ` • ${job.totalRatings} calificación${job.totalRatings !== 1 ? 'es' : ''}`}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Contenido expandible */}
                  {expandedEmployee === index && (
                    <div className="p-4 pt-0 border-t border-gray-100">
                      {job.hasRatings && (
                        <div className="bg-orange-50 border border-orange-200 rounded-lg p-3 mb-3 flex items-start gap-2">
                          <Lock className="w-5 h-5 text-orange-600 flex-shrink-0 mt-0.5" />
                          <div className="text-sm">
                            <p className="font-semibold text-orange-800 mb-1">
                              Campos bloqueados
                            </p>
                            <p className="text-orange-700">
                              Este trabajo ya tiene calificaciones asociadas. El puesto y la empresa no se pueden modificar para mantener la integridad de las calificaciones recibidas.
                            </p>
                          </div>
                        </div>
                      )}
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-3">
                        <input
                          type="text"
                          placeholder="Empresa"
                          value={job.company}
                          onChange={(e) => updateEmployeeJob(index, 'company', e.target.value)}
                          disabled={job.hasRatings}
                          className="border-2 border-gray-200 rounded-xl px-3 py-2 focus:border-purple-500 focus:outline-none disabled:bg-gray-100 disabled:cursor-not-allowed text-base"
                        />
                        <input
                          type="text"
                          placeholder="Puesto"
                          value={job.position}
                          onChange={(e) => updateEmployeeJob(index, 'position', e.target.value)}
                          disabled={job.hasRatings}
                          className="border-2 border-gray-200 rounded-xl px-3 py-2 focus:border-purple-500 focus:outline-none disabled:bg-gray-100 disabled:cursor-not-allowed text-base"
                        />
                        <div>
                          <label className="block text-sm font-medium text-gray-600 mb-1 ml-1">Fecha de inicio</label>
                          <input
                            type="date"
                            value={job.startDate}
                            onChange={(e) => updateEmployeeJob(index, 'startDate', e.target.value)}
                            className="w-full border-2 border-gray-200 rounded-xl px-3 py-2 focus:border-purple-500 focus:outline-none text-base"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-600 mb-1 ml-1">Fecha de finalización</label>
                          <input
                            type="date"
                            value={job.endDate}
                            onChange={(e) => updateEmployeeJob(index, 'endDate', e.target.value)}
                            disabled={job.currentlyWorking}
                            className="w-full border-2 border-gray-200 rounded-xl px-3 py-2 focus:border-purple-500 focus:outline-none disabled:bg-gray-100 disabled:cursor-not-allowed text-base"
                          />
                        </div>
                      </div>

                      <div className="mb-3">
                        <label className="flex items-center cursor-pointer">
                          <input
                            type="checkbox"
                            checked={job.currentlyWorking}
                            onChange={(e) => updateEmployeeJob(index, 'currentlyWorking', e.target.checked)}
                            disabled={countActiveJobs() >= 3 && !job.currentlyWorking}
                            className="w-4 h-4 text-purple-600 border-gray-300 rounded focus:ring-purple-500 disabled:opacity-50 disabled:cursor-not-allowed"
                          />
                          <span className="ml-2 text-base text-gray-700">Aún trabajo aquí</span>
                        </label>
                      </div>

                      <textarea
                        placeholder="Descripción de responsabilidades"
                        value={job.description}
                        onChange={(e) => updateEmployeeJob(index, 'description', e.target.value)}
                        className="w-full border-2 border-gray-200 rounded-xl px-3 py-2 mb-3 focus:border-purple-500 focus:outline-none text-base"
                        rows="3"
                      />

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-3">
                        <input
                          type="text"
                          placeholder="Nombre de referencia (opcional)"
                          value={job.referenceName}
                          onChange={(e) => updateEmployeeJob(index, 'referenceName', e.target.value)}
                          className="border-2 border-gray-200 rounded-xl px-3 py-2 focus:border-purple-500 focus:outline-none text-base"
                        />
                        <input
                          type="tel"
                          placeholder="Teléfono de referencia (opcional)"
                          value={job.referencePhone}
                          onChange={(e) => updateEmployeeJob(index, 'referencePhone', e.target.value)}
                          className="border-2 border-gray-200 rounded-xl px-3 py-2 focus:border-purple-500 focus:outline-none text-base"
                        />
                      </div>

                      {/* Botón Guardar Individual */}
                      <button
                        onClick={() => handleSaveWorkExperience(job, false, index)}
                        disabled={savingWorkId === (job.workHistoryId || 'new')}
                        className="w-full bg-gradient-to-r from-green-500 to-teal-600 text-white font-bold py-3 rounded-xl shadow-lg disabled:opacity-50 hover:scale-105 transition-all flex items-center justify-center mb-3 text-base"
                      >
                        {savingWorkId === (job.workHistoryId || 'new') ? (
                          <>
                            <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                            Guardando...
                          </>
                        ) : (
                          <>
                            <Save className="w-5 h-5 mr-2" />
                            Guardar trabajo
                          </>
                        )}
                      </button>

                      <button
                        onClick={() => confirmDeleteEmployeeJob(index)}
                        className="text-red-500 hover:text-red-700 font-semibold text-base"
                      >
                        Eliminar trabajo
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Educación */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-4 animate-slideUp delay-100">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl roboto-light text-gray-800 flex items-center">
              <GraduationCap className="w-6 h-6 mr-2 text-purple-600" />
              Educación
            </h2>
            <button
              onClick={addEducation}
              className="bg-green-500 text-white p-2 rounded-full hover:bg-green-600 transition-all hover:scale-110"
            >
              <Plus className="w-5 h-5" />
            </button>
          </div>

          {education.length === 0 ? (
            <p className="text-gray-500 text-center py-4">
              No hay educación agregada
            </p>
          ) : (
            <div className="space-y-2">
              {education.map((edu, index) => (
                <div key={index} className="border-2 border-gray-200 rounded-xl overflow-hidden">
                  <div
                    onClick={() => setExpandedEducation(expandedEducation === index ? null : index)}
                    className="flex items-center justify-between p-4 cursor-pointer hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      {expandedEducation === index ? (
                        <ChevronDown className="w-5 h-5 text-purple-600" />
                      ) : (
                        <ChevronRight className="w-5 h-5 text-gray-400" />
                      )}
                      <div>
                        <p className="font-semibold text-gray-800 text-base">
                          {edu.degree || 'Sin título'} {edu.institution && `- ${edu.institution}`}
                        </p>
                        <p className="text-sm text-gray-500">
                          {edu.currentlyStudying ? 'En curso' : edu.endDate ? 'Finalizado' : 'Sin fechas'}
                        </p>
                      </div>
                    </div>
                  </div>

                  {expandedEducation === index && (
                    <div className="p-4 pt-0 border-t border-gray-100">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-3">
                        <input
                          type="text"
                          placeholder="Institución"
                          value={edu.institution}
                          onChange={(e) => updateEducation(index, 'institution', e.target.value)}
                          className="border-2 border-gray-200 rounded-xl px-3 py-2 focus:border-purple-500 focus:outline-none text-base"
                        />
                        <input
                          type="text"
                          placeholder="Título/Grado"
                          value={edu.degree}
                          onChange={(e) => updateEducation(index, 'degree', e.target.value)}
                          className="border-2 border-gray-200 rounded-xl px-3 py-2 focus:border-purple-500 focus:outline-none text-base"
                        />
                        <div>
                          <label className="block text-sm font-medium text-gray-600 mb-1 ml-1">Fecha de inicio</label>
                          <input
                            type="date"
                            value={edu.startDate}
                            onChange={(e) => updateEducation(index, 'startDate', e.target.value)}
                            className="w-full border-2 border-gray-200 rounded-xl px-3 py-2 focus:border-purple-500 focus:outline-none text-base"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-600 mb-1 ml-1">Fecha de finalización</label>
                          <input
                            type="date"
                            value={edu.endDate}
                            onChange={(e) => updateEducation(index, 'endDate', e.target.value)}
                            disabled={edu.currentlyStudying}
                            className="w-full border-2 border-gray-200 rounded-xl px-3 py-2 focus:border-purple-500 focus:outline-none disabled:bg-gray-100 disabled:cursor-not-allowed text-base"
                          />
                        </div>
                      </div>

                      <div className="mb-3">
                        <label className="flex items-center cursor-pointer">
                          <input
                            type="checkbox"
                            checked={edu.currentlyStudying}
                            onChange={(e) => updateEducation(index, 'currentlyStudying', e.target.checked)}
                            className="w-4 h-4 text-purple-600 border-gray-300 rounded focus:ring-purple-500"
                          />
                          <span className="ml-2 text-base text-gray-700">Actualmente estudio aquí</span>
                        </label>
                      </div>

                      <textarea
                        placeholder="Descripción"
                        value={edu.description}
                        onChange={(e) => updateEducation(index, 'description', e.target.value)}
                        className="w-full border-2 border-gray-200 rounded-xl px-3 py-2 mb-3 focus:border-purple-500 focus:outline-none text-base"
                        rows="2"
                      />

                      <button
                        onClick={() => confirmDeleteEducation(index)}
                        className="text-red-500 hover:text-red-700 font-semibold text-base"
                      >
                        Eliminar educación
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Certificaciones */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-4 animate-slideUp delay-150">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl roboto-light text-gray-800 flex items-center">
              <Award className="w-6 h-6 mr-2 text-purple-600" />
              Certificaciones
            </h2>
            <button
              onClick={addCertification}
              className="bg-green-500 text-white p-2 rounded-full hover:bg-green-600 transition-all hover:scale-110"
            >
              <Plus className="w-5 h-5" />
            </button>
          </div>

          {certifications.length === 0 ? (
            <p className="text-gray-500 text-center py-4">
              No hay certificaciones agregadas
            </p>
          ) : (
            <div className="space-y-2">
              {certifications.map((cert, index) => (
                <div key={index} className="border-2 border-gray-200 rounded-xl overflow-hidden">
                  <div
                    onClick={() => setExpandedCertification(expandedCertification === index ? null : index)}
                    className="flex items-center justify-between p-4 cursor-pointer hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      {expandedCertification === index ? (
                        <ChevronDown className="w-5 h-5 text-purple-600" />
                      ) : (
                        <ChevronRight className="w-5 h-5 text-gray-400" />
                      )}
                      <div>
                        <p className="font-semibold text-gray-800 text-base">
                          {cert.name || 'Sin nombre'} {cert.issuer && `- ${cert.issuer}`}
                        </p>
                        <p className="text-sm text-gray-500">
                          {cert.dateObtained ? new Date(cert.dateObtained).getFullYear() : 'Sin fecha'}
                        </p>
                      </div>
                    </div>
                  </div>

                  {expandedCertification === index && (
                    <div className="p-4 pt-0 border-t border-gray-100">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-3">
                        <input
                          type="text"
                          placeholder="Nombre de la certificación"
                          value={cert.name}
                          onChange={(e) => updateCertification(index, 'name', e.target.value)}
                          className="border-2 border-gray-200 rounded-xl px-3 py-2 focus:border-purple-500 focus:outline-none text-base"
                        />
                        <input
                          type="text"
                          placeholder="Emisor"
                          value={cert.issuer}
                          onChange={(e) => updateCertification(index, 'issuer', e.target.value)}
                          className="border-2 border-gray-200 rounded-xl px-3 py-2 focus:border-purple-500 focus:outline-none text-base"
                        />
                        <div>
                          <label className="block text-sm font-medium text-gray-600 mb-1 ml-1">Fecha obtenida</label>
                          <input
                            type="date"
                            value={cert.dateObtained}
                            onChange={(e) => updateCertification(index, 'dateObtained', e.target.value)}
                            className="w-full border-2 border-gray-200 rounded-xl px-3 py-2 focus:border-purple-500 focus:outline-none text-base"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-600 mb-1 ml-1">Fecha de expiración (opcional)</label>
                          <input
                            type="date"
                            value={cert.expiryDate}
                            onChange={(e) => updateCertification(index, 'expiryDate', e.target.value)}
                            className="w-full border-2 border-gray-200 rounded-xl px-3 py-2 focus:border-purple-500 focus:outline-none text-base"
                          />
                        </div>
                      </div>

                      <button
                        onClick={() => confirmDeleteCertification(index)}
                        className="text-red-500 hover:text-red-700 font-semibold text-base"
                      >
                        Eliminar certificación
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Botón Guardar - Ahora solo para descripción, educación y certificaciones */}
        <button
          onClick={handleSave}
          disabled={saving}
          className="w-full bg-gradient-to-r from-blue-500 to-purple-600 text-white font-bold py-4 rounded-2xl shadow-lg disabled:opacity-50 hover:scale-105 transition-all flex items-center justify-center mb-4 text-lg"
        >
          {saving ? (
            <>
              <Loader2 className="w-5 h-5 mr-2 animate-spin" />
              Guardando...
            </>
          ) : (
            <>
              <Save className="w-5 h-5 mr-2" />
              Confirmar y guardar todos el CV
            </>
          )}
        </button>
      </div>

      {/* Botón Home flotante */}
      <div className="fixed bottom-4 left-0 right-0 flex justify-center z-50 animate-slideUp">
        <button 
          onClick={() => navigate('/professional-dashboard')}
          className="w-14 h-14 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 rounded-full flex items-center justify-center transition-all hover:scale-110 shadow-2xl border-4 border-white"
          aria-label="Volver al inicio"
        >
          <Home className="w-7 h-7 text-white" />
        </button>
      </div>

      {/* Modal de confirmación */}
      {deleteModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 animate-fadeIn">
          <div className="bg-white rounded-3xl p-8 max-w-md w-full mx-4 animate-scaleIn">
            <h2 className="text-2xl roboto-light text-gray-800 mb-4">
              {deleteModal.title}
            </h2>
            <p className="text-gray-600 mb-6 text-base">
              {deleteModal.message}
            </p>
            
            <div className="flex gap-4">
              <button
                onClick={() => setDeleteModal(null)}
                className="flex-1 bg-gray-200 text-gray-800 font-bold py-3 rounded-2xl hover:bg-gray-300 transition-all text-base"
              >
                Cancelar
              </button>
              <button
                onClick={handleConfirmDelete}
                className="flex-1 bg-red-500 text-white font-bold py-3 rounded-2xl hover:bg-red-600 transition-all text-base"
              >
                Eliminar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Toast */}
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}
    </div>
  );
}

export default EditCV;