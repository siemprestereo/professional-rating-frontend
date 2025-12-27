import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Star, QrCode, Users, TrendingUp, LogOut, User, Loader2, Download, Settings } from 'lucide-react';

function ProfessionalDashboard() {
  const backendUrl = 'https://professional-rating-backend-production.up.railway.app';
  const navigate = useNavigate();
  const [professional, setProfessional] = useState(null);
  const [ratings, setRatings] = useState([]);
  const [qrCode, setQrCode] = useState(null);
  const [loading, setLoading] = useState(true);
  const [generatingQR, setGeneratingQR] = useState(false);
  const [downloadingPDF, setDownloadingPDF] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    // Intentar cargar datos guardados del registro
    const savedData = localStorage.getItem('professional');
    if (savedData) {
      setProfessional(JSON.parse(savedData));
      setLoading(false);
      localStorage.removeItem('professional');
      return;
    }

    try {
      const response = await fetch(`${backendUrl}/api/auth/me`, {
        credentials: 'include'
      });
      
      if (!response.ok) {
        navigate('/professional-login');
        return;
      }
      
      const professionalData = await response.json();
      console.log('✅ Datos del profesional:', professionalData);
      
      setProfessional(professionalData);
      setRatings([]);
      
    } catch (error) {
      console.error('Error loading dashboard:', error);
      navigate('/professional-login');
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateQR = async () => {
    setGeneratingQR(true);
    try {
      const response = await fetch(`${backendUrl}/api/qr/generate?ttlMinutes=3`, {
        method: 'POST',
        credentials: 'include'
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('Error response:', errorText);
        throw new Error(`Error ${response.status}`);
      }
      
      const data = await response.json();
      console.log('✅ QR generado:', data);
      
      if (!data.qrPngBase64) {
        console.error('⚠️ qrPngBase64 está vacío:', data);
        alert('El backend no devolvió la imagen del QR');
        return;
      }
      
      setQrCode(data);
      
    } catch (error) {
      console.error('❌ Error generating QR:', error);
      alert('Error al generar QR: ' + error.message);
    } finally {
      setGeneratingQR(false);
    }
  };

  const handleDownloadPDF = async () => {
    setDownloadingPDF(true);
    try {
      const response = await fetch(`${backendUrl}/api/cv/${professional.id}/download-pdf`, {
        credentials: 'include'
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
      
    } catch (error) {
      console.error('Error downloading PDF:', error);
      alert('Error al descargar el CV');
    } finally {
      setDownloadingPDF(false);
    }
  };

  const handleDeleteAccount = async () => {
    setDeleting(true);
    try {
      const response = await fetch(`${backendUrl}/api/auth/delete-account`, {
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

  const handleLogout = () => {
    localStorage.removeItem('professional');
    window.location.href = '/logout';
  };

  const renderStars = (score) => {
    return [...Array(5)].map((_, i) => (
      <Star
        key={i}
        className={`w-4 h-4 transition-all duration-300 ${i < score ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'}`}
      />
    ));
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center animate-fadeIn">
        <div className="text-center">
          <Loader2 className="w-16 h-16 text-white animate-spin mx-auto mb-4" />
          <p className="text-white text-xl">Cargando dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 animate-fadeIn">
      {/* Header */}
      <div className="bg-gradient-to-br from-blue-500 to-purple-600 px-4 pt-6 pb-24 animate-slideDown">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-white">Mi Dashboard</h1>
          <button
            onClick={handleLogout}
            className="text-white flex items-center hover:scale-110 transition-transform duration-300"
          >
            <LogOut className="w-5 h-5" />
          </button>
        </div>
        
        <div className="text-center">
          <div className="w-20 h-20 bg-white rounded-full mx-auto mb-3 flex items-center justify-center text-3xl font-bold text-purple-600 animate-scaleIn">
            {professional.name.charAt(0)}
          </div>
          <h2 className="text-xl font-bold text-white mb-2 animate-slideUp">{professional.name}</h2>
          <div className="flex items-center justify-center mb-2 animate-slideUp delay-100">
            {renderStars(Math.round(professional.reputationScore))}
            <span className="ml-2 text-white font-semibold">
              {professional.reputationScore.toFixed(1)}
            </span>
          </div>
          <p className="text-white/90 text-sm animate-slideUp delay-200">
            {professional.totalRatings} calificaciones
          </p>
        </div>
      </div>

      {/* Contenido */}
      <div className="px-4 -mt-16">
        {/* Estadísticas */}
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div className="bg-white rounded-2xl shadow-lg p-4 text-center animate-slideUp hover-lift">
            <TrendingUp className="w-8 h-8 text-green-500 mx-auto mb-2" />
            <p className="text-2xl font-bold text-gray-800">{professional.reputationScore.toFixed(1)}</p>
            <p className="text-sm text-gray-600">Promedio</p>
          </div>
          
          <div className="bg-white rounded-2xl shadow-lg p-4 text-center animate-slideUp delay-100 hover-lift">
            <Users className="w-8 h-8 text-blue-500 mx-auto mb-2" />
            <p className="text-2xl font-bold text-gray-800">{professional.totalRatings}</p>
            <p className="text-sm text-gray-600">Calificaciones</p>
          </div>
        </div>

        {/* Descargar CV */}
        <div className="bg-gradient-to-r from-green-500 to-emerald-600 rounded-2xl shadow-lg p-6 mb-4 animate-slideUp delay-150 hover-lift">
          <div className="flex items-center justify-between text-white">
            <div className="flex-1">
              <h3 className="text-lg font-bold mb-1 flex items-center">
                <Download className="w-5 h-5 mr-2" />
                Mi CV Profesional
              </h3>
              <p className="text-sm text-white/90">Descargá tu CV en formato PDF</p>
            </div>
            <button
              onClick={handleDownloadPDF}
              disabled={downloadingPDF}
              className="bg-white text-green-600 font-bold px-6 py-3 rounded-xl shadow-lg disabled:opacity-50 hover:scale-105 transition-all duration-300 ripple flex items-center"
            >
              {downloadingPDF ? (
                <>
                  <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                  Generando...
                </>
              ) : (
                <>
                  <Download className="w-5 h-5 mr-2" />
                  Descargar
                </>
              )}
            </button>
          </div>
        </div>

        {/* Generar QR */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-4 animate-slideUp delay-200 hover-lift">
          <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center">
            <QrCode className="w-5 h-5 mr-2 text-purple-600" />
            Código QR
          </h3>
          
          {!qrCode ? (
            <button
              onClick={handleGenerateQR}
              disabled={generatingQR}
              className="w-full bg-gradient-to-r from-yellow-400 to-orange-500 text-white font-bold py-3 rounded-2xl shadow-lg disabled:opacity-50 hover:scale-105 transition-all duration-300 ripple"
            >
              {generatingQR ? (
                <span className="flex items-center justify-center">
                  <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                  Generando...
                </span>
              ) : (
                'Generar QR (3 min)'
              )}
            </button>
          ) : (
            <div className="text-center animate-scaleIn">
              {qrCode.qrPngBase64 ? (
                <>
                  <img
                    src={`data:image/png;base64,${qrCode.qrPngBase64}`}
                    alt="QR Code"
                    className="mx-auto mb-3 border-4 border-gray-200 rounded-lg max-w-xs animate-pulseGlow"
                  />
                  <p className="text-sm text-gray-600 mb-1">
                    <span className="font-semibold">Código:</span> {qrCode.code}
                  </p>
                  <p className="text-sm text-gray-600 mb-3">
                    <span className="font-semibold">Válido por los próximos 3 minutos, hasta </span>{' '}
                    {qrCode.expiresAt ? 
                      new Date(qrCode.expiresAt).toLocaleString('es-AR', {
                        hour: '2-digit',
                        minute: '2-digit',
                        hour12: false
                      }) + ' hs'
                      : 'Fecha inválida'}
                  </p>
                  <button
                    onClick={handleGenerateQR}
                    className="bg-purple-600 text-white px-6 py-2 rounded-full font-semibold hover:bg-purple-700 transition-all duration-300 ripple"
                  >
                    Generar nuevo QR
                  </button>
                </>
              ) : (
                <p className="text-red-500 animate-shake">Error: No se pudo generar la imagen del QR</p>
              )}
            </div>
          )}
        </div>

        {/* Calificaciones recientes */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-6 animate-slideUp delay-300 hover-lift">
          <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center">
            <Star className="w-5 h-5 mr-2 text-yellow-500" />
            Calificaciones Recientes
          </h3>
          
          {ratings.length === 0 ? (
            <p className="text-gray-500 text-center py-4">
              Aún no tenés calificaciones
            </p>
          ) : (
            <div className="space-y-3">
              {ratings.map((rating, index) => (
                <div 
                  key={rating.id} 
                  className="border-b border-gray-100 pb-3 last:border-0 animate-slideUp"
                  style={{ animationDelay: `${(index + 4) * 0.1}s` }}
                >
                  <div className="flex items-center mb-1">
                    {renderStars(rating.score)}
                    <span className="ml-2 text-xs text-gray-500">
                      {new Date(rating.createdAt).toLocaleDateString('es-AR')}
                    </span>
                  </div>
                  {rating.comment && (
                    <p className="text-gray-600 text-sm">{rating.comment}</p>
                  )}
                  <p className="text-xs text-gray-400 mt-1">{rating.businessName}</p>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Acciones rápidas */}
        <div className="grid grid-cols-3 gap-4 mb-6">
         <button
  onClick={() => navigate('/my-profile')}
  className="bg-white rounded-2xl shadow-lg p-4 text-center animate-slideUp delay-400 hover-lift"
>
            <User className="w-8 h-8 text-purple-600 mx-auto mb-2" />
            <p className="text-sm font-semibold text-gray-800">Ver mi perfil</p>
          </button>
          
          <button
            onClick={() => navigate('/edit-cv')}
            className="bg-white rounded-2xl shadow-lg p-4 text-center animate-slideUp delay-400 hover-lift"
          >
            <QrCode className="w-8 h-8 text-blue-600 mx-auto mb-2" />
            <p className="text-sm font-semibold text-gray-800">Editar CV</p>
          </button>

          <button
            onClick={() => navigate('/stats')}
            className="bg-white rounded-2xl shadow-lg p-4 text-center animate-slideUp delay-400 hover-lift"
          >
            <TrendingUp className="w-8 h-8 text-green-600 mx-auto mb-2" />
            <p className="text-sm font-semibold text-gray-800">Estadísticas</p>
          </button>
        </div>

        {/* Configuración - Eliminar cuenta */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-6 animate-slideUp delay-500">
          <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center">
            <Settings className="w-5 h-5 mr-2 text-gray-600" />
            Configuración
          </h3>
          
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

export default ProfessionalDashboard;