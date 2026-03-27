import { useEffect, useState, useRef, useMemo, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Star, LogOut, User, ClipboardList, TrendingUp, ChevronDown, FileText, Search, X, HelpCircle } from 'lucide-react';
import Toast from '../components/Toast';
import ErrorModal from '../components/ErrorModal';
import LoadingScreen from '../components/LoadingScreen';
import QRCodeCard from '../components/QRCodeCard';
import { capitalizeName, getFirstName } from '../utils/formatName';
import { getProfessionalBadge } from '../utils/professionalBadge';
import { exchangeOAuthCode, saveAuthData } from '../utils/authUtils';
import { BACKEND_URL } from '../config';
import NotificationBell from '../components/NotificationBell';

function ProfessionalDashboard() {
  const navigate = useNavigate();
  const [professional, setProfessional] = useState(null);
  const [ratings, setRatings] = useState([]);
  const [qrCode, setQrCode] = useState(null);
  const [loading, setLoading] = useState(true);
  const [generatingQR, setGeneratingQR] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [hasWorkExperiences, setHasWorkExperiences] = useState(true);
  const [timeLeft, setTimeLeft] = useState(null);
  const [showPhotoModal, setShowPhotoModal] = useState(false);
  const [showBadgeModal, setShowBadgeModal] = useState(false);
  const dropdownRef = useRef(null);

  const [showHelpModal, setShowHelpModal] = useState(false);
  const [supportMessage, setSupportMessage] = useState('');
  const [supportSending, setSupportSending] = useState(false);
  const [supportSent, setSupportSent] = useState(false);
  const [toast, setToast] = useState(null);
  const [errorModal, setErrorModal] = useState(null);

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const codeFromUrl = urlParams.get('code');

    if (codeFromUrl) {
      window.history.replaceState({}, document.title, window.location.pathname);
      exchangeOAuthCode(codeFromUrl).then((data) => {
        if (data) {
          saveAuthData('PROFESSIONAL', data.token, {
            id: data.id,
            email: data.email,
            name: data.name,
            termsAccepted: data.data?.termsAccepted ?? false
          });
          if (!data.data?.termsAccepted) {
            navigate('/accept-terms', { replace: true });
            return;
          }
        }
        loadDashboardData();
      });
    } else {
      loadDashboardData();
    }

    const refreshInterval = setInterval(() => {
      refreshDashboardData();
    }, 300000);

    const handleVisibilityChange = () => {
      if (!document.hidden) refreshDashboardData();
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
    if (!qrCode?.expiresAt) { setTimeLeft(null); return; }

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

  const refreshDashboardData = useCallback(async () => {
    const token = localStorage.getItem('authToken');
    const cachedProfessional = localStorage.getItem('professional');
    if (!token) return;

    try {
      const professionalData = cachedProfessional ? JSON.parse(cachedProfessional) : null;
      const ratingsUrl = professionalData
        ? `${BACKEND_URL}/api/ratings/professional/${professionalData.id}`
        : null;

      const requests = [
        fetch(`${BACKEND_URL}/api/auth/me`, { headers: { 'Authorization': `Bearer ${token}` } }),
        fetch(`${BACKEND_URL}/api/cv/me/full`, { headers: { 'Authorization': `Bearer ${token}` } }),
      ];
      if (ratingsUrl) requests.push(fetch(ratingsUrl, { headers: { 'Authorization': `Bearer ${token}` } }));

      const [meResponse, cvResponse, ratingsResponse] = await Promise.all(requests);

      if (meResponse.status === 401) {
        localStorage.removeItem('authToken');
        localStorage.removeItem('professional');
        navigate('/professional-login');
        return;
      }
      if (meResponse.ok) {
        const newProfessionalData = await meResponse.json();
        setProfessional(newProfessionalData);
        localStorage.setItem('professional', JSON.stringify(newProfessionalData));

        if (!ratingsUrl) {
          const rRes = await fetch(`${BACKEND_URL}/api/ratings/professional/${newProfessionalData.id}`, { headers: { 'Authorization': `Bearer ${token}` } });
          if (rRes.ok) setRatings(await rRes.json());
        }
      }
      if (ratingsResponse?.ok) setRatings(await ratingsResponse.json());
      if (cvResponse.ok) {
        const cvData = await cvResponse.json();
        setHasWorkExperiences((cvData.workExperiences?.length ?? 0) > 0);
      } else {
        setHasWorkExperiences(false);
      }
    } catch (error) {
      console.error('Error en auto-refresh:', error);
    }
  }, [BACKEND_URL, navigate]);

  const loadDashboardData = useCallback(async () => {
    const token = localStorage.getItem('authToken');
    const cachedProfessional = localStorage.getItem('professional');

    if (!token) {
      navigate('/professional-login');
      setLoading(false);
      return;
    }

    try {
      const meResponse = await fetch(`${BACKEND_URL}/api/auth/me`, { headers: { 'Authorization': `Bearer ${token}` } });

      if (!meResponse.ok) {
        localStorage.removeItem('authToken');
        localStorage.removeItem('professional');
        navigate('/professional-login');
        return;
      }

      const professionalData = await meResponse.json();

      if (!professionalData.emailVerified) {
        navigate('/pending-verification', { state: { email: professionalData.email } });
        return;
      }

      setProfessional(professionalData);
      localStorage.setItem('professional', JSON.stringify(professionalData));

      const [ratingsResponse, cvResponse] = await Promise.all([
        fetch(`${BACKEND_URL}/api/ratings/professional/${professionalData.id}`, { headers: { 'Authorization': `Bearer ${token}` } }),
        fetch(`${BACKEND_URL}/api/cv/me/full`, { headers: { 'Authorization': `Bearer ${token}` } })
      ]);

      if (ratingsResponse.ok) setRatings(await ratingsResponse.json());
      else setRatings([]);

      if (cvResponse.ok) {
        const cvData = await cvResponse.json();
        setHasWorkExperiences((cvData.workExperiences?.length ?? 0) > 0);
      } else {
        setHasWorkExperiences(false);
      }
    } catch (error) {
      console.error('Error loading dashboard:', error);
      navigate('/professional-login');
    } finally {
      setLoading(false);
    }
  }, [BACKEND_URL, navigate]);

  const handleGenerateQR = useCallback(async () => {
    const token = localStorage.getItem('authToken');
    if (!token) { navigate('/professional-login'); return; }

    setGeneratingQR(true);
    try {
      const response = await fetch(`${BACKEND_URL}/api/qr/generate?ttlMinutes=3`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (!response.ok) {
        if (response.status === 409) {
          setToast({ type: 'warning', message: 'Para poder generar un QR debes agregar un trabajo activo en Editar CV' });
        } else {
          const errorData = await response.json();
          setToast({ type: 'error', message: `Error al generar QR: ${errorData.message || 'Código ' + response.status}` });
        }
        return;
      }

      const data = await response.json();
      if (!data.qrPngBase64) {
        setToast({ type: 'error', message: 'El backend no devolvió la imagen del QR' });
        return;
      }
      setQrCode(data);
    } catch (error) {
      setToast({ type: 'error', message: 'Error al generar QR. Intentá nuevamente.' });
    } finally {
      setGeneratingQR(false);
    }
  }, [BACKEND_URL, navigate]);

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
      const response = await fetch(`${BACKEND_URL}/api/cv/professional/${professional.id}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      navigate(response.ok ? '/cv-view' : '/edit-cv');
    } catch (error) {
      navigate('/edit-cv');
    }
  }, [professional, BACKEND_URL, navigate]);

  const renderStars = useCallback((score) => {
    return [...Array(5)].map((_, i) => (
      <Star key={i} className={`w-4 h-4 transition-all duration-300 ${i < score ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'}`} />
    ));
  }, []);

  const getBadgeDescription = useCallback((totalRatings) => {
    if (totalRatings >= 20) {
      return '¡Nivel máximo alcanzado! ¡Seguí así!';
    } else if (totalRatings >= 5) {
      const remaining = 20 - totalRatings;
      return `Te ${remaining === 1 ? 'falta' : 'faltan'} ${remaining} calificación${remaining !== 1 ? 'es' : ''} para llegar al nivel Veterano 🥇`;
    } else {
      const remaining = 5 - totalRatings;
      return `Te ${remaining === 1 ? 'falta' : 'faltan'} ${remaining} calificación${remaining !== 1 ? 'es' : ''} para llegar al nivel Experimentado 🥈`;
    }
  }, []);

  const firstName = useMemo(() => professional ? getFirstName(professional.name) : '', [professional]);
  const fullName = useMemo(() => professional ? capitalizeName(professional.name) : '', [professional]);
  const badge = useMemo(() => getProfessionalBadge(professional?.totalRatings || 0), [professional?.totalRatings]);

  if (loading) return <LoadingScreen />;
  if (!professional) return null;

  return (
    <div className="min-h-screen bg-gray-50 animate-fadeIn">

      {showPhotoModal && professional.profilePicture && (
        <div
          className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center"
          onClick={() => setShowPhotoModal(false)}
        >
          <div className="relative" onClick={e => e.stopPropagation()}>
            <img
              src={professional.profilePicture}
              alt="Foto de perfil"
              className="w-72 h-72 rounded-full object-cover shadow-2xl border-4 border-white"
            />
            <button
              onClick={() => setShowPhotoModal(false)}
              className="absolute -top-3 -right-3 w-8 h-8 bg-white rounded-full flex items-center justify-center shadow-lg"
            >
              <X className="w-4 h-4 text-gray-700" />
            </button>
          </div>
        </div>
      )}

      {showBadgeModal && (
        <div
          className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center px-6"
          onClick={() => setShowBadgeModal(false)}
        >
          <div
            className="bg-white rounded-3xl p-6 max-w-sm w-full animate-scaleIn"
            onClick={e => e.stopPropagation()}
          >
            <div className="text-center mb-4">
              <span className="text-5xl">{badge.emoji}</span>
              <h2 className="text-xl font-semibold text-gray-800 mt-2">{badge.name}</h2>
            </div>
            <p className="text-gray-600 text-base text-center leading-relaxed">
              {getBadgeDescription(professional.totalRatings || 0)}
            </p>
            <button
              onClick={() => setShowBadgeModal(false)}
              className="mt-5 w-full bg-gradient-to-r from-blue-500 to-purple-600 text-white font-bold py-3 rounded-2xl hover:scale-105 transition-all"
            >
              Entendido
            </button>
          </div>
        </div>
      )}

      <div className="bg-gradient-to-br from-blue-500 to-purple-600 px-4 pt-6 pb-24 animate-slideDown">
        <div className="flex justify-between items-center mb-6">
          <button
            onClick={() => window.location.href = 'https://www.calificalo.com.ar/'}
            className="text-white text-2xl hover:scale-105 transition-transform logo-pulse"
            style={{ fontFamily: 'Playball, cursive' }}
          >
            Calificalo
          </button>

          <div className="flex items-center gap-2">
          <NotificationBell />
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
                  <button onClick={handleCV} className="w-full px-4 py-3 text-left text-gray-700 hover:bg-purple-50 transition-colors flex items-center gap-3">
                    <FileText className="w-5 h-5 text-purple-600" />
                    <span className="font-medium text-sm sm:text-base">Mi CV</span>
                  </button>
                  <button onClick={() => { setShowUserMenu(false); setShowHelpModal(true); }} className="w-full px-4 py-3 text-left text-gray-700 hover:bg-purple-50 transition-colors flex items-center gap-3">
                    <HelpCircle className="w-5 h-5 text-purple-600" />
                    <span className="font-medium text-sm sm:text-base">Ayuda y soporte</span>
                  </button>
                  <div className="border-t border-gray-200 my-2"></div>
                  <button onClick={handleLogout} className="w-full px-4 py-3 text-left text-red-600 hover:bg-red-50 transition-colors flex items-center gap-3">
                    <LogOut className="w-5 h-5" />
                    <span className="font-medium text-sm sm:text-base">Cerrar sesión</span>
                  </button>
                </div>
              </div>
            )}
          </div>
          </div>
        </div>

        <div className="text-center">
          <div
            className="w-20 h-20 rounded-full mx-auto mb-3 overflow-hidden bg-white flex items-center justify-center text-3xl font-bold text-purple-600 animate-scaleIn border-4 border-white shadow-lg cursor-pointer active:scale-95 transition-transform"
            onClick={() => professional.profilePicture ? setShowPhotoModal(true) : navigate('/edit-profile-professional')}
          >
            {professional.profilePicture
              ? <img src={professional.profilePicture} alt="Foto de perfil" className="w-full h-full object-cover" />
              : fullName.charAt(0).toUpperCase()
            }
          </div>
          <h2 className="text-2xl roboto-light text-white mb-3 animate-slideUp">{fullName}</h2>

          <button
            onClick={() => setShowBadgeModal(true)}
            className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold mb-3 ${badge.bgColor} ${badge.borderColor} border-2 animate-slideUp delay-50 active:scale-95 transition-transform`}
          >
            <span className="text-xl">{badge.emoji}</span>
            <span className={badge.color}>{badge.name}</span>
          </button>

          {/* Estrellas y calificaciones — tappable → stats */}
          <button
            onClick={() => navigate('/stats')}
            className="flex flex-col items-center w-full active:scale-95 transition-transform"
          >
            <div className="flex items-center justify-center mb-2 animate-slideUp delay-100">
              {renderStars(Math.round(professional.reputationScore || 0))}
              <span className="ml-2 text-white font-semibold text-lg">
                {(professional.reputationScore || 0).toFixed(1)}
              </span>
            </div>
            <p className="text-white/90 animate-slideUp delay-200">{professional.totalRatings || 0} calificaciones</p>
          </button>
        </div>
      </div>

      <div className="px-4 -mt-16">
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
          onClick={() => navigate('/ratings-history')}
          className="bg-white rounded-2xl shadow-lg p-6 mb-4 animate-slideUp delay-100 hover-lift cursor-pointer"
        >
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-xl roboto-light text-gray-800 flex items-center">
              <Star className="w-6 h-6 mr-2 text-yellow-500" />
              Calificaciones Recientes
            </h3>
            {ratings.length > 0 && <span className="text-sm text-purple-600 font-semibold">Ver todas →</span>}
          </div>

          {ratings.length === 0 ? (
            <p className="text-gray-500 text-center py-4">Aún no tenés calificaciones</p>
          ) : (
            <div className="space-y-3">
              {ratings.slice(0, 2).map((rating, index) => (
                <div key={rating.id} className="border-b border-gray-100 pb-3 last:border-0 animate-slideUp" style={{ animationDelay: `${(index + 4) * 0.1}s` }}>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">{renderStars(rating.score)}</div>
                    <span className="text-xs text-gray-500">{new Date(rating.createdAt).toLocaleDateString('es-AR')}</span>
                  </div>
                  <p className="text-sm text-gray-600 mt-1">{rating.clientName?.trim() || 'Anónimo'}</p>
                </div>
              ))}
              {ratings.length > 2 && (
                <p className="text-sm text-gray-500 text-center pt-2">+ {ratings.length - 2} calificaciones más</p>
              )}
            </div>
          )}
        </div>

        <div className="bg-gradient-to-r from-indigo-500 to-purple-600 rounded-2xl shadow-lg p-6 mb-4 animate-slideUp delay-150 hover-lift">
          <h3 className="text-xl roboto-light text-white mb-2 flex items-center">
            <Search className="w-6 h-6 mr-2" />
            Explorá otros profesionales
          </h3>
          <p className="text-white/90 text-sm mb-4">Descubrí y conectá con otros profesionales en la plataforma</p>
          <button
            onClick={() => navigate('/search')}
            className="w-full bg-white text-purple-600 font-bold py-4 rounded-2xl shadow-lg hover:scale-105 transition-all duration-300 ripple text-base"
          >
            🔍 Buscar Profesionales
          </button>
        </div>

        <div className="grid grid-cols-2 gap-3 mb-6">
          <button onClick={() => navigate('/my-profile')} className="bg-white rounded-2xl shadow-lg p-5 text-center animate-slideUp delay-200 hover-lift">
            <User className="w-7 h-7 text-blue-600 mx-auto mb-2" />
            <p className="font-semibold text-gray-800">Mi perfil</p>
          </button>

          <button
            onClick={handleCV}
            className={`bg-white rounded-2xl shadow-lg p-5 text-center animate-slideUp delay-250 hover-lift relative overflow-hidden ${!hasWorkExperiences ? 'cv-glow-animation' : ''}`}
          >
            {!hasWorkExperiences && (
              <>
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-purple-300/30 to-transparent animate-shimmer-fast"></div>
                <div className="absolute top-1 right-1 w-2 h-2 bg-purple-500 rounded-full animate-ping"></div>
              </>
            )}
            <ClipboardList className={`w-7 h-7 mx-auto mb-2 relative z-10 ${!hasWorkExperiences ? 'text-purple-600 animate-bounce-subtle' : 'text-purple-600'}`} />
            <p className={`font-semibold text-gray-800 relative z-10 ${!hasWorkExperiences ? 'animate-pulse-text' : ''}`}>
              Mi CV
              {!hasWorkExperiences && <span className="text-purple-600 ml-1">✨</span>}
            </p>
          </button>
        </div>
      </div>

      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
      {errorModal && <ErrorModal title={errorModal.title} message={errorModal.message} onClose={() => setErrorModal(null)} />}

      {showHelpModal && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4 animate-fadeIn" onClick={() => { setShowHelpModal(false); setSupportMessage(''); setSupportSent(false); }}>
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md p-6 animate-scaleIn max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-5">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                  <HelpCircle className="w-5 h-5 text-white" />
                </div>
                <h2 className="text-xl font-semibold text-gray-800">Ayuda y soporte</h2>
              </div>
              <button onClick={() => { setShowHelpModal(false); setSupportMessage(''); setSupportSent(false); }} className="text-gray-400 hover:text-gray-600 transition-colors">
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="space-y-4 mb-6">
              <h3 className="text-base font-bold text-gray-700">Preguntas frecuentes</h3>

              {[
                { q: '¿Cómo recibo calificaciones?', a: 'Compartí tu QR con tus clientes. Ellos lo escanean, inician sesión y pueden calificarte.' },
                { q: '¿Cómo genero mi QR?', a: 'Desde el panel principal, tocá el botón "Generar QR"' },
                { q: '¿Quién puede ver mi perfil?', a: 'Cualquier persona puede ver tu perfil público y tus calificaciones.' },
                { q: '¿Cómo edito mi CV?', a: 'Desde el menú superior o en la pantalla principal, ingresá a "Mi CV" -> "Editar CV" para agregar experiencia, educación y zonas de trabajo.' },
                { q: '¿Cómo cambio mi foto de perfil?', a: 'Tocá tu foto en "Mi perfil" para editarla.' },
                { q: '¿Puedo eliminar una calificación?', a: 'No podés eliminar calificaciones recibidas. Si creés que hay una calificación inapropiada, podés denunciarla y pasará a revisión.' },
              ].map((item, i) => (
                <div key={i} className="border border-gray-200 rounded-xl p-4">
                  <p className="font-semibold text-gray-800 text-sm mb-1">{item.q}</p>
                  <p className="text-gray-600 text-sm">{item.a}</p>
                </div>
              ))}
            </div>

            <div className="border-t border-gray-200 pt-4">
              <p className="text-gray-600 text-sm mb-3">¿No encontraste lo que buscabas? Escribinos:</p>
              {supportSent ? (
                <div className="bg-green-50 border border-green-200 rounded-2xl px-4 py-3 text-green-700 text-sm font-medium text-center">
                  ¡Mensaje enviado! Te responderemos a tu email registrado.
                </div>
              ) : (
                <div className="space-y-3">
                  <textarea
                    value={supportMessage}
                    onChange={e => setSupportMessage(e.target.value)}
                    placeholder="Describí tu consulta o problema..."
                    rows={4}
                    className="w-full border border-gray-200 rounded-2xl px-4 py-3 text-sm focus:outline-none focus:border-blue-400 resize-none"
                  />
                  <button
                    disabled={supportSending || !supportMessage.trim()}
                    onClick={async () => {
                      setSupportSending(true);
                      try {
                        const token = localStorage.getItem('authToken');
                        const res = await fetch(`${BACKEND_URL}/api/contact/support`, {
                          method: 'POST',
                          headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                          body: JSON.stringify({ message: supportMessage, senderName: professional?.name })
                        });
                        if (res.ok) {
                          setSupportSent(true);
                          setSupportMessage('');
                        }
                      } finally {
                        setSupportSending(false);
                      }
                    }}
                    className="w-full bg-gradient-to-r from-blue-500 to-purple-600 text-white font-bold py-3 rounded-2xl shadow-lg hover:scale-105 transition-all flex items-center justify-center gap-2 text-base disabled:opacity-50 disabled:hover:scale-100"
                  >
                    {supportSending ? (
                      <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <HelpCircle className="w-5 h-5" />
                    )}
                    Enviar mensaje
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default ProfessionalDashboard;