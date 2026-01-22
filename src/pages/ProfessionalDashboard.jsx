import { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Star, QrCode, LogOut, User, Loader2, ClipboardList, TrendingUp, ChevronDown, FileText } from 'lucide-react';
import Toast from '../components/Toast';
import ErrorModal from '../components/ErrorModal';
import LoadingScreen from '../components/LoadingScreen';

function ProfessionalDashboard() {
  const backendUrl = 'https://professional-rating-backend-production.up.railway.app';
  const navigate = useNavigate();
  const [professional, setProfessional] = useState(null);
  const [ratings, setRatings] = useState([]);
  const [qrCode, setQrCode] = useState(null);
  const [loading, setLoading] = useState(true);
  const [generatingQR, setGeneratingQR] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const dropdownRef = useRef(null);
  
  // Toast y ErrorModal
  const [toast, setToast] = useState(null);
  const [errorModal, setErrorModal] = useState(null);

  useEffect(() => {
    // Primero verificar si hay token en la URL (OAuth redirect)
    const urlParams = new URLSearchParams(window.location.search);
    const tokenFromUrl = urlParams.get('token');
    
    if (tokenFromUrl) {
      console.log('✅ Token recibido de OAuth en dashboard:', tokenFromUrl);
      localStorage.setItem('authToken', tokenFromUrl);
      
      // Limpiar la URL (quitar el ?token=xxx)
      window.history.replaceState({}, document.title, window.location.pathname);
    }
    
    loadDashboardData();
    
    // Auto-refresh cada 5 minutos
    const refreshInterval = setInterval(() => {
      console.log('🔄 Auto-refresh: actualizando datos...');
      refreshDashboardData();
    }, 300000); // 300000 ms = 5 minutos
    
    // Refresh cuando el usuario vuelve al tab
    const handleVisibilityChange = () => {
      if (!document.hidden) {
        console.log('👁️ Usuario volvió al tab, refrescando...');
        refreshDashboardData();
      }
    };
    
    document.addEventListener('visibilitychange', handleVisibilityChange);

    // Cerrar dropdown al hacer click fuera
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowUserMenu(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    
    // Limpiar todos al desmontar
    return () => {
      clearInterval(refreshInterval);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Nueva función para refresh silencioso
  const refreshDashboardData = async () => {
    const token = localStorage.getItem('authToken');
    if (!token) return;

    try {
      // 1. Actualizar datos del profesional (reputación)
      const response = await fetch(`${backendUrl}/api/auth/me`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      if (response.ok) {
        const professionalData = await response.json();
        setProfessional(professionalData);
        localStorage.setItem('professional', JSON.stringify(professionalData));
        
        // 2. Actualizar ratings
        const ratingsResponse = await fetch(`${backendUrl}/api/ratings/professional/${professionalData.id}`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        
        if (ratingsResponse.ok) {
          const ratingsData = await ratingsResponse.json();
          setRatings(ratingsData);
        }
      }
    } catch (error) {
      console.error('Error en auto-refresh:', error);
      // No mostramos error al usuario para no interrumpir la experiencia
    }
  };

  const loadDashboardData = async () => {
    const token = localStorage.getItem('authToken');
    
    if (!token) {
      console.log('No hay token, redirigiendo al login');
      navigate('/professional-login');
      setLoading(false);
      return;
    }

    try {
      // 1. Cargar datos del profesional
      const response = await fetch(`${backendUrl}/api/auth/me`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (response.ok) {
        const professionalData = await response.json();
        console.log('✅ Datos del profesional:', professionalData);
        
        setProfessional(professionalData);
        localStorage.setItem('professional', JSON.stringify(professionalData));
        
        // 2. Cargar ratings del profesional
        try {
          const ratingsResponse = await fetch(`${backendUrl}/api/ratings/professional/${professionalData.id}`, {
            headers: {
              'Authorization': `Bearer ${token}`
            }
          });
          
          if (ratingsResponse.ok) {
            const ratingsData = await ratingsResponse.json();
            console.log('✅ Ratings cargados:', ratingsData);
            setRatings(ratingsData);
          } else {
            console.error('Error al cargar ratings:', ratingsResponse.status);
            setRatings([]);
          }
        } catch (error) {
          console.error('Error al cargar ratings:', error);
          setRatings([]);
        }
        
      } else if (response.status === 401) {
        console.log('Token inválido, redirigiendo al login');
        localStorage.removeItem('authToken');
        localStorage.removeItem('professional');
        navigate('/professional-login');
      } else {
        throw new Error('Error al cargar datos del profesional');
      }
      
    } catch (error) {
      console.error('Error loading dashboard:', error);
      navigate('/professional-login');
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateQR = async () => {
    const token = localStorage.getItem('authToken');
    if (!token) {
      navigate('/professional-login');
      return;
    }

    setGeneratingQR(true);
    try {
      const response = await fetch(`${backendUrl}/api/qr/generate?ttlMinutes=3`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (!response.ok) {
        console.error('Error response:', response.status);
        
        if (response.status === 409) {
          setToast({ 
            type: 'warning', 
            message: 'Para poder generar un QR debes agregar un trabajo activo en Editar CV'
          });
        } else {
          const errorData = await response.json();
          setToast({ 
            type: 'error', 
            message: `Error al generar QR: ${errorData.message || 'Código ' + response.status}`
          });
        }
        return;
      }
      
      const data = await response.json();
      console.log('✅ QR generado:', data);
      
      if (!data.qrPngBase64) {
        console.error('⚠️ qrPngBase64 está vacío:', data);
        setToast({ type: 'error', message: 'El backend no devolvió la imagen del QR' });
        return;
      }
      
      setQrCode(data);
      
    } catch (error) {
      console.error('❌ Error generating QR:', error);
      setToast({ type: 'error', message: 'Error al generar QR. Intentá nuevamente.' });
    } finally {
      setGeneratingQR(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('authToken');
    localStorage.removeItem('professional');
    setShowUserMenu(false);
    navigate('/');
  };

  const handleCV = async () => {
    setShowUserMenu(false);
    
    const token = localStorage.getItem('authToken');
    if (!token) return;

    try {
      // Verificar si el CV existe
      const response = await fetch(`${backendUrl}/api/cv/professional/${professional.id}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        // CV existe, ir a verlo
        navigate('/cv-view');
      } else if (response.status === 400 || response.status === 404) {
        // CV no existe, ir a crearlo
        navigate('/edit-cv');
      } else {
        console.error('Error al verificar CV:', response.status);
        navigate('/edit-cv'); // Por defecto ir a editar
      }
    } catch (error) {
      console.error('Error al verificar CV:', error);
      navigate('/edit-cv'); // Por defecto ir a editar
    }
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
  return <LoadingScreen />;
}

  if (!professional) {
    return null;
  }

  // Extraer solo el primer nombre con capitalización
  const getFirstName = (fullName) => {
    if (!fullName) return 'Usuario';
    const name = fullName.trim().split(' ')[0];
    return name.charAt(0).toUpperCase() + name.slice(1).toLowerCase();
  };

  const firstName = getFirstName(professional.name);

  return (
    <div className="min-h-screen bg-gray-50 animate-fadeIn">
      {/* Header */}
      <div className="bg-gradient-to-br from-blue-500 to-purple-600 px-4 pt-6 pb-24 animate-slideDown">
        <div className="flex justify-between items-center mb-6">
          <button
            onClick={() => window.location.href = 'https://professional-rating-frontend.vercel.app/'}
            className="text-white text-2xl hover:scale-105 transition-transform logo-pulse"
            style={{ fontFamily: 'Playball, cursive' }}
          >
            Calificalo
          </button>
          
          {/* Menú desplegable */}
          <div className="relative" ref={dropdownRef}>
            <button
              onClick={() => setShowUserMenu(!showUserMenu)}
              className="bg-white/20 hover:bg-white/30 text-white px-3 sm:px-4 py-2 rounded-full font-semibold flex items-center gap-2 transition-all hover-lift text-sm sm:text-base"
            >
              <User className="w-4 h-4" />
              <span>{firstName}</span>
              <ChevronDown className={`w-4 h-4 transition-transform ${showUserMenu ? 'rotate-180' : ''}`} />
            </button>

            {/* Dropdown Menu */}
            {showUserMenu && (
              <div className="absolute right-0 mt-2 w-48 sm:w-56 bg-white rounded-2xl shadow-2xl overflow-hidden z-50 animate-slideDown">
                <div className="py-2">
                  <button
                    onClick={handleCV}
                    className="w-full px-4 py-3 text-left text-gray-700 hover:bg-purple-50 transition-colors flex items-center gap-3"
                  >
                    <FileText className="w-5 h-5 text-purple-600" />
                    <span className="font-medium text-sm sm:text-base">Mi CV</span>
                  </button>
                  
                  <div className="border-t border-gray-200 my-2"></div>
                  
                  <button
                    onClick={handleLogout}
                    className="w-full px-4 py-3 text-left text-red-600 hover:bg-red-50 transition-colors flex items-center gap-3"
                  >
                    <LogOut className="w-5 h-5" />
                    <span className="font-medium text-sm sm:text-base">Cerrar sesión</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
        
        <div className="text-center">
          <div className="w-20 h-20 bg-white rounded-full mx-auto mb-3 flex items-center justify-center text-3xl font-bold text-purple-600 animate-scaleIn">
            {professional.name.charAt(0).toUpperCase()}
          </div>
          <h2 className="text-xl font-bold text-white mb-2 animate-slideUp">{professional.name}</h2>
          <div className="flex items-center justify-center mb-2 animate-slideUp delay-100">
            {renderStars(Math.round(professional.reputationScore || 0))}
            <span className="ml-2 text-white font-semibold">
              {(professional.reputationScore || 0).toFixed(1)}
            </span>
          </div>
          <p className="text-white/90 text-sm animate-slideUp delay-200">
            {professional.totalRatings || 0} calificaciones
          </p>
        </div>
      </div>

      {/* Contenido*/}
      <div className="px-4 -mt-16">

        {/* 🔥 GENERAR QR - PRIMERO Y MÁS DESTACADO */}
        <div 
          className="bg-gradient-to-br from-yellow-400 via-orange-500 to-red-500 rounded-2xl shadow-2xl p-4 md:p-6 mb-4 animate-slideUp hover-lift relative overflow-hidden"
          onClick={(e) => {
            // Cerrar QR si se hace click fuera del contenido del QR
            if (qrCode && e.target === e.currentTarget) {
              setQrCode(null);
            }
          }}
        >
          {/* Efecto de brillo animado */}
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-shimmer"></div>
          
          <div className="relative z-10">
            {/* Botón X para cerrar (solo visible cuando hay QR) */}
            {qrCode && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setQrCode(null);
                }}
                className="absolute -top-1 -right-1 md:top-0 md:right-0 bg-white/20 hover:bg-white/30 backdrop-blur-sm text-white rounded-full p-2 transition-all duration-200 hover:scale-110"
                aria-label="Cerrar QR"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            )}

            <div className="flex items-center justify-center mb-2 md:mb-3">
              <div className="bg-white/20 backdrop-blur-sm rounded-full p-2 md:p-3 animate-pulse-slow">
                <QrCode className="w-6 h-6 md:w-8 md:h-8 text-white drop-shadow-lg" />
              </div>
            </div>
            
            <h3 className="text-lg md:text-xl font-bold text-white text-center mb-1 md:mb-2 drop-shadow-md px-2">
              🎯 Código QR para Calificaciones
            </h3>
            <p className="text-white/90 text-center text-xs md:text-sm mb-3 md:mb-4 px-2">
              Generá tu QR y recibí calificaciones en tiempo real
            </p>
            
            {!qrCode ? (
              <button
                onClick={handleGenerateQR}
                disabled={generatingQR}
                className="w-full bg-white text-orange-600 font-bold py-3 md:py-4 rounded-xl shadow-xl disabled:opacity-50 hover:scale-105 transition-all duration-300 ripple hover:shadow-2xl text-sm md:text-base"
              >
                {generatingQR ? (
                  <span className="flex items-center justify-center">
                    <Loader2 className="w-4 h-4 md:w-5 md:h-5 mr-2 animate-spin" />
                    Generando...
                  </span>
                ) : (
                  <span className="flex items-center justify-center gap-2">
                    <QrCode className="w-4 h-4 md:w-5 md:h-5" />
                    Generar QR (Estará activo por 3 min)
                  </span>
                )}
              </button>
            ) : (
              <div 
                className="text-center animate-scaleIn"
                onClick={(e) => e.stopPropagation()}
              >
                {qrCode.qrPngBase64 ? (
                  <>
                    <div className="bg-white rounded-xl p-3 md:p-4 mb-2 md:mb-3 mx-auto inline-block max-w-full">
                      <img
                        src={`data:image/png;base64,${qrCode.qrPngBase64}`}
                        alt="QR Code"
                        className="mx-auto border-2 border-orange-200 rounded-lg w-full max-w-[240px] md:max-w-xs animate-pulseGlow"
                      />
                    </div>
                    <p className="text-xs md:text-sm text-white/90 mb-1 px-2">
                      <span className="font-semibold">Código:</span> {qrCode.code}
                    </p>
                    <p className="text-xs md:text-sm text-white/90 mb-2 md:mb-3 px-2">
                      <span className="font-semibold">Válido hasta las </span>
                      {qrCode.expiresAt ? 
                        new Date(qrCode.expiresAt).toLocaleTimeString('es-AR', {
                          hour: '2-digit',
                          minute: '2-digit',
                          hour12: false,
                          timeZone: 'America/Argentina/Buenos_Aires'
                        }) + ' hs'
                        : 'Fecha inválida'}
                    </p>
                    <button
                      onClick={handleGenerateQR}
                      className="bg-white text-orange-600 px-4 md:px-6 py-2 rounded-full font-semibold hover:scale-105 transition-all duration-300 ripple shadow-lg text-sm md:text-base"
                    >
                      Generar nuevo QR
                    </button>
                  </>
                ) : (
                  <p className="text-white animate-shake text-sm">Error: No se pudo generar la imagen del QR</p>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Ver estadísticas - SEGUNDO */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-4 animate-slideUp delay-50 hover-lift">
          <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center">
            <TrendingUp className="w-5 h-5 mr-2 text-green-600" />
            Más información sobre mi reputación
          </h3>
          
          <button
            onClick={() => navigate('/stats')}
            className="w-full bg-gradient-to-r from-green-500 to-teal-600 text-white font-bold py-4 rounded-2xl shadow-lg hover:scale-105 transition-all duration-300 ripple"
          >
            Ver estadísticas detalladas
          </button>
        </div>

        {/* Calificaciones recientes */}
        <div 
          onClick={() => {
            console.log('🔍 Click detectado en calificaciones recientes');
            navigate('/ratings-history');
          }}
          className="bg-white rounded-2xl shadow-lg p-6 mb-4 animate-slideUp delay-100 hover-lift cursor-pointer"
        >
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-bold text-gray-800 flex items-center">
              <Star className="w-5 h-5 mr-2 text-yellow-500" />
              Calificaciones Recientes
            </h3>
            {ratings.length > 0 && (
              <span className="text-sm text-purple-600 font-semibold">
                Ver todas →
              </span>
            )}
          </div>
          
          {ratings.length === 0 ? (
            <p className="text-gray-500 text-center py-4">
              Aún no tenés calificaciones
            </p>
          ) : (
            <div className="space-y-3">
              {ratings.slice(0, 5).map((rating, index) => (
                <div 
                  key={rating.id} 
                  className="border-b border-gray-100 pb-3 last:border-0 animate-slideUp"
                  style={{ animationDelay: `${(index + 4) * 0.1}s` }}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      {renderStars(rating.score)}
                    </div>
                    <span className="text-xs text-gray-500">
                      {new Date(rating.createdAt).toLocaleDateString('es-AR')}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 mt-1">
                    {rating.clientName?.trim() || 'Anónimo'}
                  </p>
                </div>
              ))}
              
              {ratings.length > 5 && (
                <p className="text-sm text-gray-500 text-center pt-2">
                  + {ratings.length - 5} calificaciones más
                </p>
              )}
            </div>
          )}
        </div>

        {/* Acciones rápidas - MODIFICADO: 2 botones en fila */}
        <div className="grid grid-cols-2 gap-3 mb-6">
          <button
            onClick={() => navigate('/my-profile')}
            className="bg-white rounded-2xl shadow-lg p-5 text-center animate-slideUp delay-150 hover-lift"
          >
            <User className="w-7 h-7 text-blue-600 mx-auto mb-2" />
            <p className="font-semibold text-gray-800 text-sm">Mi perfil</p>
          </button>

          <button
            onClick={handleCV}
            className="bg-white rounded-2xl shadow-lg p-5 text-center animate-slideUp delay-200 hover-lift"
          >
            <ClipboardList className="w-7 h-7 text-purple-600 mx-auto mb-2" />
            <p className="font-semibold text-gray-800 text-sm">Mi CV</p>
          </button>
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
    </div>
  );
}

export default ProfessionalDashboard;