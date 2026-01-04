import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Loader2, Plus, Trash2, Save, Briefcase, GraduationCap, Award, Home } from 'lucide-react';
import Toast from '../components/Toast';

function EditCV() {
  const navigate = useNavigate();
  const backendUrl = 'https://professional-rating-backend-production.up.railway.app';
  
  const [cv, setCv] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  
  // Estados para el formulario
  const [workExperiences, setWorkExperiences] = useState([]);
  const [education, setEducation] = useState([]);
  const [certifications, setCertifications] = useState([]);
  
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
      const response = await fetch(`${backendUrl}/api/cv/professional/${professional.id}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setCv(data);
        setWorkExperiences(data.workExperiences || []);
        setEducation(data.education || []);
        setCertifications(data.certifications || []);
      }
    } catch (error) {
      console.error('Error loading CV:', error);
      setToast({ type: 'error', message: 'Error al cargar CV' });
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const token = localStorage.getItem('authToken');
      const response = await fetch(`${backendUrl}/api/cv/${cv.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          workExperiences,
          education,
          certifications
        })
      });

      if (response.ok) {
        setToast({ type: 'success', message: 'CV actualizado correctamente' });
      } else {
        throw new Error('Error al guardar CV');
      }
    } catch (error) {
      console.error('Error saving CV:', error);
      setToast({ type: 'error', message: 'Error al guardar CV' });
    } finally {
      setSaving(false);
    }
  };

  // Work Experience handlers
  const addWorkExperience = () => {
    setWorkExperiences([...workExperiences, {
      company: '',
      position: '',
      startDate: '',
      endDate: '',
      description: ''
    }]);
  };

  const updateWorkExperience = (index, field, value) => {
    const updated = [...workExperiences];
    updated[index][field] = value;
    setWorkExperiences(updated);
  };

  const removeWorkExperience = (index) => {
    setWorkExperiences(workExperiences.filter((_, i) => i !== index));
  };

  // Education handlers
  const addEducation = () => {
    setEducation([...education, {
      institution: '',
      degree: '',
      startDate: '',
      endDate: '',
      description: ''
    }]);
  };

  const updateEducation = (index, field, value) => {
    const updated = [...education];
    updated[index][field] = value;
    setEducation(updated);
  };

  const removeEducation = (index) => {
    setEducation(education.filter((_, i) => i !== index));
  };

  // Certification handlers
  const addCertification = () => {
    setCertifications([...certifications, {
      name: '',
      issuer: '',
      dateObtained: '',
      expiryDate: ''
    }]);
  };

  const updateCertification = (index, field, value) => {
    const updated = [...certifications];
    updated[index][field] = value;
    setCertifications(updated);
  };

  const removeCertification = (index) => {
    setCertifications(certifications.filter((_, i) => i !== index));
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center animate-fadeIn">
        <div className="text-center">
          <Loader2 className="w-16 h-16 text-white animate-spin mx-auto mb-4" />
          <p className="text-white text-xl font-light">Cargando...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 animate-fadeIn">
      {/* Navbar */}
      <nav className="bg-gradient-to-r from-blue-500 to-purple-600 px-4 py-4 animate-slideDown">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <button 
            onClick={() => navigate('/professional-dashboard')}
            className="w-12 h-12 bg-white/10 hover:bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center transition-all hover:scale-110 border border-white/20"
            aria-label="Volver al inicio"
          >
            <Home className="w-6 h-6 text-white" />
          </button>
        </div>
      </nav>

      {/* Header */}
      <div className="bg-gradient-to-br from-blue-500 to-purple-600 px-4 pt-6 pb-24">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-3xl font-bold text-white mb-2 animate-slideUp">
            Editar CV
          </h1>
          <p className="text-white/90 animate-slideUp delay-100">
            Agregá tu experiencia, educación y certificaciones
          </p>
        </div>
      </div>

      {/* Contenido */}
      <div className="max-w-4xl mx-auto px-4 -mt-16 pb-8">
        {/* Experiencia Laboral */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-4 animate-slideUp">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-gray-800 flex items-center">
              <Briefcase className="w-6 h-6 mr-2 text-purple-600" />
              Experiencia Laboral
            </h2>
            <button
              onClick={addWorkExperience}
              className="bg-purple-500 text-white p-2 rounded-full hover:bg-purple-600 transition-all hover:scale-110"
            >
              <Plus className="w-5 h-5" />
            </button>
          </div>

          {workExperiences.length === 0 ? (
            <p className="text-gray-500 text-center py-4">
              No hay experiencia laboral agregada
            </p>
          ) : (
            <div className="space-y-4">
              {workExperiences.map((exp, index) => (
                <div key={index} className="border-2 border-gray-200 rounded-2xl p-4">
                  <div className="flex justify-between items-start mb-3">
                    <span className="text-sm font-semibold text-purple-600">
                      Experiencia #{index + 1}
                    </span>
                    <button
                      onClick={() => removeWorkExperience(index)}
                      className="text-red-500 hover:text-red-700"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <input
                      type="text"
                      placeholder="Empresa"
                      value={exp.company}
                      onChange={(e) => updateWorkExperience(index, 'company', e.target.value)}
                      className="border-2 border-gray-200 rounded-xl px-3 py-2 focus:border-purple-500 focus:outline-none"
                    />
                    <input
                      type="text"
                      placeholder="Puesto"
                      value={exp.position}
                      onChange={(e) => updateWorkExperience(index, 'position', e.target.value)}
                      className="border-2 border-gray-200 rounded-xl px-3 py-2 focus:border-purple-500 focus:outline-none"
                    />
                    <input
                      type="date"
                      placeholder="Fecha inicio"
                      value={exp.startDate}
                      onChange={(e) => updateWorkExperience(index, 'startDate', e.target.value)}
                      className="border-2 border-gray-200 rounded-xl px-3 py-2 focus:border-purple-500 focus:outline-none"
                    />
                    <input
                      type="date"
                      placeholder="Fecha fin"
                      value={exp.endDate}
                      onChange={(e) => updateWorkExperience(index, 'endDate', e.target.value)}
                      className="border-2 border-gray-200 rounded-xl px-3 py-2 focus:border-purple-500 focus:outline-none"
                    />
                  </div>
                  <textarea
                    placeholder="Descripción de responsabilidades"
                    value={exp.description}
                    onChange={(e) => updateWorkExperience(index, 'description', e.target.value)}
                    className="w-full border-2 border-gray-200 rounded-xl px-3 py-2 mt-3 focus:border-purple-500 focus:outline-none"
                    rows="3"
                  />
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Educación */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-4 animate-slideUp delay-100">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-gray-800 flex items-center">
              <GraduationCap className="w-6 h-6 mr-2 text-purple-600" />
              Educación
            </h2>
            <button
              onClick={addEducation}
              className="bg-purple-500 text-white p-2 rounded-full hover:bg-purple-600 transition-all hover:scale-110"
            >
              <Plus className="w-5 h-5" />
            </button>
          </div>

          {education.length === 0 ? (
            <p className="text-gray-500 text-center py-4">
              No hay educación agregada
            </p>
          ) : (
            <div className="space-y-4">
              {education.map((edu, index) => (
                <div key={index} className="border-2 border-gray-200 rounded-2xl p-4">
                  <div className="flex justify-between items-start mb-3">
                    <span className="text-sm font-semibold text-purple-600">
                      Educación #{index + 1}
                    </span>
                    <button
                      onClick={() => removeEducation(index)}
                      className="text-red-500 hover:text-red-700"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <input
                      type="text"
                      placeholder="Institución"
                      value={edu.institution}
                      onChange={(e) => updateEducation(index, 'institution', e.target.value)}
                      className="border-2 border-gray-200 rounded-xl px-3 py-2 focus:border-purple-500 focus:outline-none"
                    />
                    <input
                      type="text"
                      placeholder="Título/Grado"
                      value={edu.degree}
                      onChange={(e) => updateEducation(index, 'degree', e.target.value)}
                      className="border-2 border-gray-200 rounded-xl px-3 py-2 focus:border-purple-500 focus:outline-none"
                    />
                    <input
                      type="date"
                      placeholder="Fecha inicio"
                      value={edu.startDate}
                      onChange={(e) => updateEducation(index, 'startDate', e.target.value)}
                      className="border-2 border-gray-200 rounded-xl px-3 py-2 focus:border-purple-500 focus:outline-none"
                    />
                    <input
                      type="date"
                      placeholder="Fecha fin"
                      value={edu.endDate}
                      onChange={(e) => updateEducation(index, 'endDate', e.target.value)}
                      className="border-2 border-gray-200 rounded-xl px-3 py-2 focus:border-purple-500 focus:outline-none"
                    />
                  </div>
                  <textarea
                    placeholder="Descripción"
                    value={edu.description}
                    onChange={(e) => updateEducation(index, 'description', e.target.value)}
                    className="w-full border-2 border-gray-200 rounded-xl px-3 py-2 mt-3 focus:border-purple-500 focus:outline-none"
                    rows="2"
                  />
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Certificaciones */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-4 animate-slideUp delay-200">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-gray-800 flex items-center">
              <Award className="w-6 h-6 mr-2 text-purple-600" />
              Certificaciones
            </h2>
            <button
              onClick={addCertification}
              className="bg-purple-500 text-white p-2 rounded-full hover:bg-purple-600 transition-all hover:scale-110"
            >
              <Plus className="w-5 h-5" />
            </button>
          </div>

          {certifications.length === 0 ? (
            <p className="text-gray-500 text-center py-4">
              No hay certificaciones agregadas
            </p>
          ) : (
            <div className="space-y-4">
              {certifications.map((cert, index) => (
                <div key={index} className="border-2 border-gray-200 rounded-2xl p-4">
                  <div className="flex justify-between items-start mb-3">
                    <span className="text-sm font-semibold text-purple-600">
                      Certificación #{index + 1}
                    </span>
                    <button
                      onClick={() => removeCertification(index)}
                      className="text-red-500 hover:text-red-700"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <input
                      type="text"
                      placeholder="Nombre de la certificación"
                      value={cert.name}
                      onChange={(e) => updateCertification(index, 'name', e.target.value)}
                      className="border-2 border-gray-200 rounded-xl px-3 py-2 focus:border-purple-500 focus:outline-none"
                    />
                    <input
                      type="text"
                      placeholder="Emisor"
                      value={cert.issuer}
                      onChange={(e) => updateCertification(index, 'issuer', e.target.value)}
                      className="border-2 border-gray-200 rounded-xl px-3 py-2 focus:border-purple-500 focus:outline-none"
                    />
                    <input
                      type="date"
                      placeholder="Fecha obtenida"
                      value={cert.dateObtained}
                      onChange={(e) => updateCertification(index, 'dateObtained', e.target.value)}
                      className="border-2 border-gray-200 rounded-xl px-3 py-2 focus:border-purple-500 focus:outline-none"
                    />
                    <input
                      type="date"
                      placeholder="Fecha de expiración (opcional)"
                      value={cert.expiryDate}
                      onChange={(e) => updateCertification(index, 'expiryDate', e.target.value)}
                      className="border-2 border-gray-200 rounded-xl px-3 py-2 focus:border-purple-500 focus:outline-none"
                    />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Botón Guardar */}
        <button
          onClick={handleSave}
          disabled={saving}
          className="w-full bg-gradient-to-r from-blue-500 to-purple-600 text-white font-bold py-4 rounded-2xl shadow-lg disabled:opacity-50 hover:scale-105 transition-all flex items-center justify-center"
        >
          {saving ? (
            <>
              <Loader2 className="w-5 h-5 mr-2 animate-spin" />
              Guardando...
            </>
          ) : (
            <>
              <Save className="w-5 h-5 mr-2" />
              Guardar CV
            </>
          )}
        </button>
      </div>

      {/* Toast notification */}
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