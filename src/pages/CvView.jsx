import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Loader2, Home, Share2, Edit, Briefcase, GraduationCap, Award, Calendar, Download } from 'lucide-react';
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
  const [downloadingPDF, setDownloadingPDF] = useState(false);
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

  const handleDownloadPDF = async () => {
    const token = localStorage.getItem('authToken');
    if (!token) {
      navigate('/professional-login');
      return;
    }

    setDownloadingPDF(true);
    try {
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
    <div className="min-h-screen bg-gray-50 animate-fadeIn pb-24">
      {/* Header sin navbar */}
      <div className="bg-gradient-to-br from-blue-500 to-purple-600 px-4 pt-8 pb-24">
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
        
        {/* Botones de acción - Grid 3 columnas */}
        <div className="mb-4">
          <div className="grid grid-cols-3 gap-3 max-w-2xl mx-auto">
            <button
              onClick={() => navigate('/edit-cv')}
              className="bg-white rounded-2xl shadow-lg p-6 text-center animate-slideUp hover-lift"
            >
              <Edit className="w-10 h-10 text-purple-600 mx-auto mb-3" />
              <p className="font-semibold text-gray-800 text-sm">Editar CV</p>
            </button>

            <button
              onClick={() => setShowShareModal(true)}
              className="bg-gradient-to-r from-green-500 to-teal-600 rounded-2xl shadow-lg p-6 text-center animate-slideUp hover-lift"
            >
              <Share2 className="w-10 h-10 text-white mx-auto mb-3" />
              <p className="font-semibold text-white text-sm">Compartir</p>
            </button>

            <button
              onClick={handleDownloadPDF}
              disabled={downloadingPDF}
              className="bg-gradient-to-r from-blue-500 to-indigo-600 rounded-2xl shadow-lg p-6 text-center animate-slideUp hover-lift disabled:opacity-50"
            >
              {downloadingPDF ? (
                <>
                  <Loader2 className="w-10 h-10 text-white mx-auto mb-3 animate-spin" />
                  <p className="font-semibold text-white text-sm">Generando...</p>
                </>
              ) : (
                <>
                  <Download className="w-10 h-10 text-white mx-auto mb-3" />
                  <p className="font-semibold text-white text-sm">Descargar PDF</p>
                </>
              )}
            </button>
          </div>
        </div>
       
        {/* Experiencia Laboral */}
        {workExperiences.length > 0 && (
          <div className="bg-white rounded-2xl shadow-lg p-6 mb-4 animate-slideUp delay-200 hover-lift">
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
          <div className="bg-white rounded-2xl shadow-lg p-6 mb-4 animate-slideUp delay-250 hover-lift">
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
          <div className="bg-white rounded-2xl shadow-lg p-6 mb-4 animate-slideUp delay-300 hover-lift">
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

     {/* Botón Home flotante fijo abajo centrado */}
<div className="fixed bottom-4 left-0 right-0 flex justify-center z-50 animate-slideUp">
  <button 
    onClick={() => navigate('/professional-dashboard')}
    className="w-14 h-14 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 rounded-full flex items-center justify-center transition-all hover:scale-110 shadow-2xl border-4 border-white"
    aria-label="Volver al inicio"
  >
    <Home className="w-7 h-7 text-white" />
  </button>
</div>

      {/* Toast */}
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}

      {/* Modal de compartir */}
      {showShareModal && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 animate-fadeIn"
          onClick={() => setShowShareModal(false)}
        >
          <div 
            className="bg-white rounded-3xl p-8 max-w-md w-full animate-scaleIn"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-gray-800">Compartir CV</h2>
              <button
                onClick={() => setShowShareModal(false)}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <p className="text-gray-600 mb-6">
              Compartí tu CV profesional con clientes o empleadores
            </p>

            {/* Opción 1: Copiar URL */}
            <div className="bg-gray-50 rounded-2xl p-4 mb-4">
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-semibold text-gray-800">Link directo</h3>
                <button
                  onClick={async () => {
                    const cvUrl = `${window.location.origin}/cv/${professional?.id}`;
                    try {
                      await navigator.clipboard.writeText(cvUrl);
                      setToast({ type: 'success', message: 'Link copiado al portapapeles' });
                    } catch (error) {
                      setToast({ type: 'error', message: 'Error al copiar URL' });
                    }
                  }}
                  className="bg-gradient-to-r from-green-500 to-teal-600 text-white px-4 py-2 rounded-xl text-sm font-semibold hover:from-green-600 hover:to-teal-700 transition-all hover:scale-105"
                >
                  Copiar link
                </button>
              </div>
              <p className="text-xs text-gray-500 break-all">
                {window.location.origin}/cv/{professional?.id}
              </p>
            </div>

            {/* Opción 2: Mostrar QR */}
            <div className="bg-gradient-to-br from-green-50 to-teal-50 rounded-2xl p-4">
              <h3 className="font-semibold text-gray-800 mb-3 text-center">
                Código QR
              </h3>
              <div className="bg-white rounded-xl p-4 flex justify-center">
                <img
                  src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(window.location.origin + '/cv/' + professional?.id)}`}
                  alt="QR Code del CV"
                  className="w-48 h-48"
                />
              </div>
              <p className="text-xs text-gray-600 text-center mt-3">
                Desde este QR podrán ver tu CV
              </p>
            </div>

            {/* Botón cerrar */}
            <button
              onClick={() => setShowShareModal(false)}
              className="w-full bg-gradient-to-r from-red-500 to-rose-600 text-white font-bold py-3 rounded-2xl mt-6 hover:from-red-600 hover:to-rose-700 transition-all hover:scale-105"
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