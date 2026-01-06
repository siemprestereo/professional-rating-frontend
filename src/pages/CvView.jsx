import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Loader2, Home, Share2, Edit, Briefcase, GraduationCap, Award, Calendar } from 'lucide-react';
import Toast from '../components/Toast';

function CvView() {
  const navigate = useNavigate();
  const backendUrl = 'https://professional-rating-backend-production.up.railway.app';
  
  const [cv, setCv] = useState(null);
  const [professional, setProfessional] = useState(null);
  const [workExperiences, setWorkExperiences] = useState([]);
  const [education, setEducation] = useState([]);
  const [certifications, setCertifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showShareModal, setShowShareModal] = useState(false);
  const [toast, setToast] = useState(null);

  useEffect(() => {
    loadCV();
  }, []);

  const loadCV = async () => {
    try {
      const professionalData = JSON.parse(localStorage.getItem('professional'));
      if (!professionalData) {
        navigate('/professional-login');
        return;
      }

      setProfessional(professionalData);

      const token = localStorage.getItem('authToken');
      const response = await fetch(`${backendUrl}/api/cv/me/full`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        console.log('✅ CV cargado:', data);
        
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

  const formatDate = (dateString) => {
    if (!dateString) return 'Presente';
    const date = new Date(dateString);
    return date.toLocaleDateString('es-AR', { month: 'short', year: 'numeric' });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center animate-fadeIn">
        <div className="text-center">
          <Loader2 className="w-16 h-16 text-white animate-spin mx-auto mb-4" />
          <p className="text-white text-xl font-light">Cargando CV...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 animate-fadeIn pb-20">
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
          <div className="w-24 h-24 bg-white rounded-full mx-auto mb-4 flex items-center justify-center text-4xl font-bold text-purple-600 animate-scaleIn">
            {professional?.name?.charAt(0) || 'P'}
          </div>
          <h1 className="text-3xl font-bold text-white mb-2 animate-slideUp">
            {professional?.name || 'Mi CV'}
          </h1>
          {professional?.professionalTitle && (
            <p className="text-white/90 text-lg animate-slideUp delay-100">
              {professional.professionalTitle}
            </p>
          )}
        </div>
      </div>

      {/* Contenido */}
      <div className="max-w-4xl mx-auto px-4 -mt-16">
        
        {/* Experiencia Laboral */}
        {workExperiences.length > 0 && (
          <div className="bg-white rounded-2xl shadow-lg p-6 mb-4 animate-slideUp">
            <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center">
              <Briefcase className="w-6 h-6 mr-2 text-purple-600" />
              Experiencia Laboral
            </h2>
            <div className="space-y-6">
              {workExperiences.map((exp, index) => (
                <div key={index} className="border-l-4 border-purple-500 pl-4">
                  <h3 className="font-bold text-gray-800 text-lg">{exp.position}</h3>
                  <p className="text-purple-600 font-semibold">{exp.businessName}</p>
                  <div className="flex items-center text-sm text-gray-500 mt-1">
                    <Calendar className="w-4 h-4 mr-1" />
                    {formatDate(exp.startDate)} - {exp.isActive ? 'Presente' : formatDate(exp.endDate)}
                  </div>
                  {exp.description && (
                    <p className="text-gray-600 mt-2">{exp.description}</p>
                  )}
                  {exp.referenceContact && (
                    <p className="text-sm text-gray-500 mt-2">
                      📞 Referencia: {exp.referenceContact}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Educación */}
        {education.length > 0 && (
          <div className="bg-white rounded-2xl shadow-lg p-6 mb-4 animate-slideUp delay-100">
            <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center">
              <GraduationCap className="w-6 h-6 mr-2 text-blue-600" />
              Educación
            </h2>
            <div className="space-y-6">
              {education.map((edu, index) => (
                <div key={index} className="border-l-4 border-blue-500 pl-4">
                  <h3 className="font-bold text-gray-800 text-lg">{edu.degree}</h3>
                  <p className="text-blue-600 font-semibold">{edu.institution}</p>
                  <div className="flex items-center text-sm text-gray-500 mt-1">
                    <Calendar className="w-4 h-4 mr-1" />
                    {formatDate(edu.startDate)} - {edu.currentlyStudying ? 'Presente' : formatDate(edu.endDate)}
                  </div>
                  {edu.description && (
                    <p className="text-gray-600 mt-2">{edu.description}</p>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Certificaciones */}
        {certifications.length > 0 && (
          <div className="bg-white rounded-2xl shadow-lg p-6 mb-4 animate-slideUp delay-200">
            <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center">
              <Award className="w-6 h-6 mr-2 text-yellow-600" />
              Certificaciones
            </h2>
            <div className="space-y-4">
              {certifications.map((cert, index) => (
                <div key={index} className="border-l-4 border-yellow-500 pl-4">
                  <h3 className="font-bold text-gray-800">{cert.name}</h3>
                  <p className="text-yellow-600 text-sm">{cert.issuer}</p>
                  <div className="flex items-center text-sm text-gray-500 mt-1">
                    <Calendar className="w-4 h-4 mr-1" />
                    Obtenida: {formatDate(cert.dateObtained)}
                    {cert.expiryDate && ` • Vence: ${formatDate(cert.expiryDate)}`}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Estado vacío */}
        {workExperiences.length === 0 && education.length === 0 && certifications.length === 0 && (
          <div className="bg-white rounded-2xl shadow-lg p-12 text-center animate-slideUp">
            <Briefcase className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-gray-800 mb-2">
              Tu CV está vacío
            </h3>
            <p className="text-gray-600 mb-6">
              Agregá tu experiencia laboral, educación y certificaciones para completar tu perfil profesional
            </p>
            <button
              onClick={() => navigate('/edit-cv')}
              className="bg-gradient-to-r from-blue-500 to-purple-600 text-white font-bold py-3 px-6 rounded-2xl hover:scale-105 transition-all"
            >
              Completar mi CV
            </button>
          </div>
        )}
      </div>

      {/* Botón flotante "Compartir" */}
      <button
        onClick={() => setShowShareModal(true)}
        className="fixed bottom-6 right-6 w-16 h-16 bg-gradient-to-r from-green-500 to-teal-600 text-white rounded-full shadow-2xl flex items-center justify-center hover:scale-110 transition-all z-50"
        aria-label="Compartir CV"
      >
        <Share2 className="w-7 h-7" />
      </button>

      {/* Toast */}
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}

      {/* Modal de compartir (lo haremos en el siguiente paso) */}
      {showShareModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl p-8 max-w-md w-full">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">Compartir CV</h2>
            <p className="text-gray-600 mb-4">Modal de compartir (próximo paso)</p>
            <button
              onClick={() => setShowShareModal(false)}
              className="w-full bg-gray-200 text-gray-800 font-bold py-3 rounded-2xl"
            >
              Cerrar
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default CvView;