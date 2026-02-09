import { useEffect, useState, useRef, useMemo, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Star, LogOut, User, ClipboardList, TrendingUp, ChevronDown, FileText, Search } from 'lucide-react';
import Toast from '../components/Toast';
import ErrorModal from '../components/ErrorModal';
import LoadingScreen from '../components/LoadingScreen';
import QRCodeCard from '../components/QRCodeCard';
import { capitalizeName, getFirstName } from '../utils/formatName';
import { getProfessionalBadge } from '../utils/professionalBadge';

function ProfessionalDashboard() {
  const backendUrl = 'https://professional-rating-backend-production.up.railway.app';
  const navigate = useNavigate();
  const [professional, setProfessional] = useState(null);
  const [ratings, setRatings] = useState([]);
  const [qrCode, setQrCode] = useState(null);
  const [loading, setLoading] = useState(true);
  const [generatingQR, setGeneratingQR] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [hasWorkExperiences, setHasWorkExperiences] = useState(true);
  const [timeLeft, setTimeLeft] = useState(null);
  const dropdownRef = useRef(null);
  
  const [toast, setToast] = useState(null);
  const [errorModal, setErrorModal] = useState(null);

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const tokenFromUrl = urlParams.get('token');
    
    if (tokenFromUrl) {
      console.log('✅ Token recibido de OAuth en dashboard:', tokenFromUrl);
      localStorage.setItem('authToken', tokenFromUrl);
      window.history.replaceState({}, document.title, window.location.pathname);
    }
    
    loadDashboardData();
    
    const refreshInterval = setInterval(() => {
      console.log('🔄 Auto-refresh: actualizando datos...');
      refreshDashboardData();
    }, 300000);
    
    const handleVisibilityChange = () => {
      if (!document.hidden) {
        console.log('👁️ Usuario volvió al tab, refrescando...');
        refreshDashboardData();
      }
    };
    
    document.addEventListener('visibilitychange', handleVisibilityChange);

    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowUserMenu(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    
    return () => {
      clearInterval(refreshInterval);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      document.removeEventListener('mousedown', handleClickOutside);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!qrCode?.expiresAt) {
      setTimeLeft(null);
      return;
    }

    const calculateTimeLeft = () => {
      const now = new Date().getTime();
      const expiry = new Date(qrCode.expiresAt).getTime();
      const diff = Math.max(0, expiry - now);
      
      const minutes = Math.floor(diff / 60000);
      const seconds = Math.floor((diff % 60000) / 1000);
      
      return diff > 0 ? { minutes, seconds, expired: false } : { minutes: 0, seconds: 0, expired: true };
    };

    setTimeLeft(calculateTimeLeft());

    const interval = setInterval(() => {
      const time = calculateTimeLeft();
      setTimeLeft(time);
      
      if (time.expired) {
        clearInterval(interval);
        setQrCode(null);
        setToast({ type: 'warning', message: 'El QR expiró. Generá uno nuevo.' });
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [qrCode]);

  // ✅ OPTIMIZACIÓN 1 y 2: Eliminar petición redundante + Evitar cascada
  const refreshDashboardData = useCallback(async () => {
    const token = localStorage.getItem('authToken');
    const cachedProfessional = localStorage.getItem('professional');
    
    if (!token) return;

    try {
      // ✅ Si tenemos el ID en caché, disparar las 3 peticiones EN PARALELO
      if (cachedProfessional) {
        const professionalData = JSON.parse(cachedProfessional);
        
        const [meResponse, ratingsResponse, cvResponse] = await Promise.all([
          fetch(`${backendUrl}/api/auth/me`, {
            headers: { 'Authorization': `Bearer ${token}` }
          }),
          fetch(`${backendUrl}/api/ratings/professional/${professionalData.id}`, {
            headers: { 'Authorization': `Bearer ${token}` }
          }),
          fetch(`${backendUrl}/api/cv/professional/${professionalData.id}`, {
            headers: { 'Authorization': `Bearer ${token}` }
          })
        ]);
        
        // Procesar profesional
        if (meResponse.ok) {
          const newProfessionalData = await meResponse.json();
          setProfessional(newProfessionalData);
          localStorage.setItem('professional', JSON.stringify(newProfessionalData));
        }
        
        // Procesar ratings
        if (ratingsResponse.ok) {
          const ratingsData = await ratingsResponse.json();
          setRatings(ratingsData);
        }

        // Procesar experiencias laborales
        if (cvResponse.ok) {
          const cvData = await cvResponse.json();
          const hasExperiences = cvData.workExperiences && cvData.workExperiences.length > 0;
          setHasWorkExperiences(hasExperiences);
        } else {
          setHasWorkExperiences(false);
        }
      } else {
        // Si no hay caché, hacer la petición secuencial
        const meResponse = await fetch(`${backendUrl}/api/auth/me`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        
        if (meResponse.ok) {
          const professionalData = await meResponse.json();
          setProfessional(professionalData);
          localStorage.setItem('professional', JSON.stringify(professionalData));
          
          const [ratingsResponse, cvResponse] = await Promise.all([
            fetch(`${backendUrl}/api/ratings/professional/${professionalData.id}`, {
              headers: { 'Authorization': `Bearer ${token}` }
            }),
            fetch(`${backendUrl}/api/cv/professional/${professionalData.id}`, {
              headers: { 'Authorization': `Bearer ${token}` }
            })
          ]);
          
          if (ratingsResponse.ok) {
            const ratingsData = await ratingsResponse.json();
            setRatings(ratingsData);
          }

          if (cvResponse.ok) {
            const cvData = await cvResponse.json();
            const hasExperiences = cvData.workExperiences && cvData.workExperiences.length > 0;
            setHasWorkExperiences(hasExperiences);
          } else {
            setHasWorkExperiences(false);
          }
        }
      }
    } catch (error) {
      console.error('Error en auto-refresh:', error);
    }
  }, [backendUrl]);

  // ✅ OPTIMIZACIÓN 2: Carga inicial optimizada
  const loadDashboardData = useCallback(async () => {
    const token = localStorage.getItem('authToken');
    const cachedProfessional = localStorage.getItem('professional');
    
    if (!token) {
      console.log('No hay token, redirigiendo al login');
      navigate('/professional-login');
      setLoading(false);
      return;
    }

    try {
      // ✅ Si ya tenemos el ID del profesional, disparar todas las peticiones EN PARALELO
      if (cachedProfessional) {
        const professionalData = JSON.parse(cachedProfessional);
        console.log('✅ Usando professional.id del localStorage:', professionalData.id);
        
        const [meResponse, ratingsResponse, cvResponse] = await Promise.all([
          fetch(`${backendUrl}/api/auth/me`, {
            headers: { 'Authorization': `Bearer ${token}` }
          }),
          fetch(`${backendUrl}/api/ratings/professional/${professionalData.id}`, {
            headers: { 'Authorization': `Bearer ${token}` }
          }),
          fetch(`${backendUrl}/api/cv/professional/${professionalData.id}`, {
            headers: { 'Authorization': `Bearer ${token}` }
          })
        ]);
        
        // Procesar profesional
        if (meResponse.ok) {
          const newProfessionalData = await meResponse.json();
          console.log('✅ Datos del profesional actualizados:', newProfessionalData);
          setProfessional(newProfessionalData);
          localStorage.setItem('professional', JSON.stringify(newProfessionalData));
        } else if (meResponse.status === 401) {
          console.log('Token inválido, redirigiendo al login');
          localStorage.removeItem('authToken');
          localStorage.removeItem('professional');
          navigate('/professional-login');
          return;
        }
        
        // Procesar ratings
        if (ratingsResponse.ok) {
          const ratingsData = await ratingsResponse.json();
          console.log('✅ Ratings cargados:', ratingsData);
          setRatings(ratingsData);
        } else {
          setRatings([]);
        }

        // Procesar experiencias laborales
        if (cvResponse.ok) {
          const cvData = await cvResponse.json();
          const hasExperiences = cvData.workExperiences && cvData.workExperiences.length > 0;
          setHasWorkExperiences(hasExperiences);
          console.log('✅ Tiene experiencias laborales:', hasExperiences);
        } else {
          setHasWorkExperiences(false);
        }
        
      } else {
        // Sin caché: hacer la petición secuencial
        const meResponse = await fetch(`${backendUrl}/api/auth/me`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        
        if (meResponse.ok) {
          const professionalData = await meResponse.json();
          console.log('✅ Datos del profesional:', professionalData);
          
          setProfessional(professionalData);
          localStorage.setItem('professional', JSON.stringify(professionalData));
          
          const [ratingsResponse, cvResponse] = await Promise.all([
            fetch(`${backendUrl}/api/ratings/professional/${professionalData.id}`, {
              headers: { 'Authorization': `Bearer ${token}` }
            }),
            fetch(`${backendUrl}/api/cv/professional/${professionalData.id}`, {
              headers: { 'Authorization': `Bearer ${token}` }
            })
          ]);
          
          if (ratingsResponse.ok) {
            const ratingsData = await ratingsResponse.json();
            console.log('✅ Ratings cargados:', ratingsData);
            setRatings(ratingsData);
          } else {
            setRatings([]);
          }

          if (cvResponse.ok) {
            const cvData = await cvResponse.json();
            const hasExperiences = cvData.workExperiences && cvData.workExperiences.length > 0;
            setHasWorkExperiences(hasExperiences);
            console.log('✅ Tiene experiencias laborales:', hasExperiences);
          } else {
            setHasWorkExperiences(false);
          }
          
        } else if (meResponse.status === 401) {
          console.log('Token inválido, redirigiendo al login');
          localStorage.removeItem('authToken');
          localStorage.removeItem('professional');
          navigate('/professional-login');
        } else {
          throw new Error('Error al cargar datos del profesional');
        }
      }
      
    } catch (error) {
      console.error('Error loading dashboard:', error);
      navigate('/professional-login');
    } finally {
      setLoading(false);
    }
  }, [backendUrl, navigate]);

  const handleGenerateQR = useCallback(async () => {
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
  }, [backendUrl, navigate]);

  const handleLogout = useCallback(() => {
    localStorage.removeItem('authToken');
    localStorage.removeItem('professional');
    setShowUserMenu(false);
    navigate('/');
  }, [navigate]);

  const handleCV = useCallback(async () => {
    setShowUserMenu(false);
    
    const token = localStorage.getItem('authToken');
    if (!token || !professional) return;

    try {
      const response = await fetch(`${backendUrl}/api/cv/professional/${professional.id}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        navigate('/cv-view');
      } else if (response.status === 400 || response.status === 404) {
        navigate('/edit-cv');
      } else {
        console.error('Error al verificar CV:', response.status);
        navigate('/edit-cv');
      }
    } catch (error) {
      console.error('Error al verificar CV:', error);
      navigate('/edit-cv');
    }
  }, [professional, backendUrl, navigate]);

  const renderStars = useCallback((score) => {
    return [...Array(5)].map((_, i) => (
      <Star
        key={i}
        className={`w-4 h-4 transition-all duration-300 ${i < score ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'}`}
      />
    ));
  }, []);

  // ✅ Memoizar valores derivados
  const firstName = useMemo(() => 
    professional ? getFirstName(professional.name) : '', 
    [professional]
  );
  
  const fullName = useMemo(() => 
    professional ? capitalizeName(professional.name) : '', 
    [professional]
  );
  
  const badge = useMemo(() => 
    getProfessionalBadge(professional?.totalRatings || 0), 
    [professional?.totalRatings]
  );

  if (loading) {
    return <LoadingScreen />;
  }

  if (!professional) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50 animate-fadeIn">
      {/* Header */}
      <div className="bg-gradient-to-br from-blue-500 to-purple-600 px-4 pt-6 pb-24 animate-slideDown">
        <div className="flex justify-between items-center mb-6">
          <button
            onClick={() => window.location.href = 'https://www.calificalo.com.ar/'}
            className="text-white text-2xl hover:scale-105 transition-transform logo-pulse"
            style={{ fontFamily: 'Playball, cursive' }}
          >
            Calificalo
          </button>
          
          <div className="relative" ref={dropdownRef}>
            <button
              onClick={() => setShowUserMenu(!showUserMenu)}
              className="bg-white/20 hover:bg-white/30 text-white px-3 sm:px-4 py-2 rounded-full font-semibold flex items-center gap-2 transition-all hover-lift text-sm sm:text-base"
            >
              <User className="w-4 h-4" />
              <span>{firstName}</span>
              <ChevronDown className={`w-4 h-4 transition-transform ${showUserMenu ? 'rotate-180' : ''}`} />
            </button>

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
            {fullName.charAt(0).toUpperCase()}
          </div>
          <h2 className="text-2xl roboto-light text-white mb-3 animate-slideUp">{fullName}</h2>
          
          <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold mb-3 ${badge.bgColor} ${badge.borderColor} border-2 animate-slideUp delay-50`}>
            <span className="text-xl">{badge.emoji}</span>
            <span className={badge.color}>{badge.name}</span>
          </div>
          
          <div className="flex items-center justify-center mb-2 animate-slideUp delay-100">
            {renderStars(Math.round(professional.reputationScore || 0))}
            <span className="ml-2 text-white font-semibold text-lg">
              {(professional.reputationScore || 0).toFixed(1)}
            </span>
          </div>
          <p className="text-white/90 animate-slideUp delay-200">
            {professional.totalRatings || 0} calificaciones
          </p>
        </div>
      </div>

      <div className="px-4 -mt-16">
        {/* ✅ OPTIMIZACIÓN 3: Componente QR memoizado */}
        <QRCodeCard
          qrCode={qrCode}
          generatingQR={generatingQR}
          timeLeft={timeLeft}
          onGenerate={handleGenerateQR}
          onClose={() => setQrCode(null)}
        />

        <div className="bg-white rounded-2xl shadow-lg p-6 mb-4 animate-slideUp delay-50 hover-lift">
          <h3 className="text-xl roboto-light text-gray-800 mb-4 flex items-center">
            <TrendingUp className="w-6 h-6 mr-2 text-green-600" />
            Más información sobre mi reputación
          </h3>
          
          <button
            onClick={() => navigate('/stats')}
            className="w-full bg-gradient-to-r from-green-500 to-teal-600 text-white font-bold py-4 rounded-2xl shadow-lg hover:scale-105 transition-all duration-300 ripple text-base"
          >
            Ver estadísticas detalladas
          </button>
        </div>

        <div 
          onClick={() => {
            console.log('🔍 Click detectado en calificaciones recientes');
            navigate('/ratings-history');
          }}
          className="bg-white rounded-2xl shadow-lg p-6 mb-4 animate-slideUp delay-100 hover-lift cursor-pointer"
        >
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-xl roboto-light text-gray-800 flex items-center">
              <Star className="w-6 h-6 mr-2 text-yellow-500" />
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
              {ratings.slice(0, 2).map((rating, index) => (
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
              
              {ratings.length > 2 && (
                <p className="text-sm text-gray-500 text-center pt-2">
                  + {ratings.length - 2} calificaciones más
                </p>
              )}
            </div>
          )}
        </div>

        <div className="bg-gradient-to-r from-indigo-500 to-purple-600 rounded-2xl shadow-lg p-6 mb-4 animate-slideUp delay-150 hover-lift">
          <h3 className="text-xl roboto-light text-white mb-2 flex items-center">
            <Search className="w-6 h-6 mr-2" />
            Explorá otros profesionales
          </h3>
          <p className="text-white/90 text-sm mb-4">
            Descubrí y conectá con otros profesionales en la plataforma
          </p>
          
          <button
            onClick={() => navigate('/search')}
            className="w-full bg-white text-purple-600 font-bold py-4 rounded-2xl shadow-lg hover:scale-105 transition-all duration-300 ripple text-base"
          >
            🔍 Buscar Profesionales
          </button>
        </div>

        <div className="grid grid-cols-2 gap-3 mb-6">
          <button
            onClick={() => navigate('/my-profile')}
            className="bg-white rounded-2xl shadow-lg p-5 text-center animate-slideUp delay-200 hover-lift"
          >
            <User className="w-7 h-7 text-blue-600 mx-auto mb-2" />
            <p className="font-semibold text-gray-800">Mi perfil</p>
          </button>

          <button
            onClick={handleCV}
            className={`bg-white rounded-2xl shadow-lg p-5 text-center animate-slideUp delay-250 hover-lift relative overflow-hidden ${
              !hasWorkExperiences ? 'cv-glow-animation' : ''
            }`}
          >
            {!hasWorkExperiences && (
              <>
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-purple-300/30 to-transparent animate-shimmer-fast"></div>
                <div className="absolute top-1 right-1 w-2 h-2 bg-purple-500 rounded-full animate-ping"></div>
              </>
            )}
            <ClipboardList className={`w-7 h-7 mx-auto mb-2 relative z-10 ${
              !hasWorkExperiences ? 'text-purple-600 animate-bounce-subtle' : 'text-purple-600'
            }`} />
            <p className={`font-semibold text-gray-800 relative z-10 ${
              !hasWorkExperiences ? 'animate-pulse-text' : ''
            }`}>
              Mi CV
              {!hasWorkExperiences && <span className="text-purple-600 ml-1">✨</span>}
            </p>
          </button>
        </div>
      </div>

      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}
      
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