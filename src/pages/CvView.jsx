import { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Star, Briefcase, GraduationCap, ChevronRight, Search, AlertTriangle, MapPin, User, ChevronDown, LogOut, HelpCircle, ClipboardList } from 'lucide-react';
import ShareModal from '../components/ShareModal';
import LoadingScreen from '../components/LoadingScreen';
import BackButton from '../components/BackButton';
import HomeButton from '../components/HomeButton';
import { translateProfession } from '../utils/professionalUtils';
import { BACKEND_URL } from '../config';
import HelpSupportModal from '../components/HelpSupportModal';

function CvView() {
  const navigate = useNavigate();
  const { professionalId } = useParams();
  const [cv, setCv] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showShareModal, setShowShareModal] = useState(false);
  const [isSearchable, setIsSearchable] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);
  const [showFaq, setShowFaq] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    loadCv();
    loadSearchableStatus();
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) setShowUserMenu(false);
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [professionalId]);

  const handleLogout = () => {
    localStorage.removeItem('authToken');
    localStorage.removeItem('professional');
    localStorage.removeItem('userType');
    navigate('/');
  };

  const loadCv = async () => {
    try {
      const token = localStorage.getItem('authToken');
      const professional = (() => {
        try { return JSON.parse(localStorage.getItem('professional')); }
        catch { return null; }
      })();

      if (!professional && !professionalId) {
        navigate('/professional-login');
        return;
      }

      const idToLoad = professionalId || professional?.id;
      const response = await fetch(`${BACKEND_URL}/api/cv/professional/${idToLoad}`, {
        headers: token ? { 'Authorization': `Bearer ${token}` } : {}
      });

      if (response.ok) {
        setCv(await response.json());
      } else if (response.status === 400 || response.status === 404) {
        // Sin CV — redirigir a crearlo solo si es el propio perfil
        if (!professionalId) {
          navigate('/edit-cv', { replace: true });
        }
      } else {
        throw new Error('Error al cargar C.V');
      }
    } catch (error) {
      // silencioso
    } finally {
      setLoading(false);
    }
  };
  const loadSearchableStatus = async () => {
    try {
      const token = localStorage.getItem('authToken');
      if (!token) return;
      const response = await fetch(`${BACKEND_URL}/api/professionals/me/searchable-status`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.ok) {
        const data = await response.json();
        setIsSearchable(data.searchable);
      }
    } catch (error) {
      console.error('Error loading searchable status:', error);
    }
  };

  const toggleSearchable = async () => {
    if (isAnimating) return;
    setIsAnimating(true);
    try {
      const token = localStorage.getItem('authToken');
      if (!token) return;
      const response = await fetch(`${BACKEND_URL}/api/professionals/me/searchable`, {
        method: 'PUT',
        headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ searchable: !isSearchable })
      });
      if (response.ok) setIsSearchable(prev => !prev);
    } catch (error) {
      console.error('Error toggling searchable:', error);
    } finally {
      setTimeout(() => setIsAnimating(false), 300);
    }
  };

  const renderStars = (score) =>
    [...Array(5)].map((_, i) => (
      <Star key={i} className={`w-5 h-5 ${i < score ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'}`} />
    ));

  const formatDate = (dateStr) => {
    if (!dateStr) return '';
    return new Date(dateStr).toLocaleDateString('es-AR', { month: 'short', year: 'numeric' });
  };

  const handleWorkClick = (workHistoryId) => {
    navigate(`/ratings-history?workHistoryId=${workHistoryId}`);
  };

  if (loading) return <LoadingScreen message="Cargando CV..." />;

  if (!cv) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p className="text-gray-600">No se pudo cargar el CV</p>
      </div>
    );
  }

  const freelanceActive = (cv.workHistory || []).filter(w => w.isFreelance && w.isActive);
  const employeeActive = (cv.workHistory || []).filter(w => !w.isFreelance && w.isActive);
  const pastJobs = (cv.workHistory || []).filter(w => !w.isActive);

  return (
    <div className="min-h-screen bg-gray-50 animate-fadeIn pb-24">
      <div className="bg-gradient-to-br from-blue-500 to-purple-600 px-4 pt-6 pb-24">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center justify-between mb-2">
            <BackButton />
            <div className="relative" ref={dropdownRef}>
              <button
                onClick={() => setShowUserMenu(!showUserMenu)}
                className="bg-white/20 hover:bg-white/30 text-white px-3 sm:px-4 py-2 rounded-full font-semibold flex items-center gap-2 transition-all text-sm sm:text-base"
              >
                <User className="w-4 h-4" />
                <span>{cv?.professionalName?.split(' ')[0] || ''}</span>
                <ChevronDown className={`w-4 h-4 transition-transform ${showUserMenu ? 'rotate-180' : ''}`} />
              </button>
              {showUserMenu && (
                <div className="absolute right-0 mt-2 w-48 sm:w-56 bg-white rounded-2xl shadow-2xl overflow-hidden z-50 animate-slideDown">
                  <div className="py-2">
                    <button onClick={() => { setShowUserMenu(false); navigate('/my-profile'); }} className="w-full px-4 py-3 text-left text-gray-700 hover:bg-purple-50 transition-colors flex items-center gap-3">
                      <User className="w-5 h-5 text-purple-600" />
                      <span className="font-medium text-sm sm:text-base">Mi perfil</span>
                    </button>
                    <button onClick={() => { setShowUserMenu(false); navigate('/ratings-history'); }} className="w-full px-4 py-3 text-left text-gray-700 hover:bg-purple-50 transition-colors flex items-center gap-3">
                      <ClipboardList className="w-5 h-5 text-purple-600" />
                      <span className="font-medium text-sm sm:text-base">Mis calificaciones</span>
                    </button>
                    <button onClick={() => { setShowUserMenu(false); setShowFaq(true); }} className="w-full px-4 py-3 text-left text-gray-700 hover:bg-purple-50 transition-colors flex items-center gap-3">
                      <HelpCircle className="w-5 h-5 text-purple-600" />
                      <span className="font-medium text-sm sm:text-base">Ayuda y soporte</span>
                    </button>
                    <div className="border-t border-gray-200 my-2" />
                    <button onClick={handleLogout} className="w-full px-4 py-3 text-left text-red-600 hover:bg-red-50 transition-colors flex items-center gap-3">
                      <LogOut className="w-5 h-5" />
                      <span className="font-medium text-sm sm:text-base">Cerrar sesión</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
          <div className="text-center">
            <button onClick={() => navigate('/my-profile')} className="w-full hover:opacity-90 transition-opacity focus:outline-none">
              <div className="w-24 h-24 rounded-full mx-auto mb-4 overflow-hidden bg-white flex items-center justify-center text-4xl font-bold text-purple-600 animate-scaleIn border-4 border-white shadow-lg">
                {cv.profilePicture
                  ? <img src={cv.profilePicture} alt="Foto de perfil" className="w-full h-full object-cover" />
                  : cv.professionalName.charAt(0)
                }
              </div>
              <h1 className="text-3xl roboto-light text-white mb-2 animate-slideUp">{cv.professionalName}</h1>
              {cv.professionalTitle && (
                <p className="text-white font-semibold text-lg mb-1 animate-slideUp">{cv.professionalTitle}</p>
              )}
              {cv.professionType && (
                <p className={`text-white/80 text-base mb-4 animate-slideUp ${cv.professionalTitle ? 'text-sm' : 'text-lg'}`}>{translateProfession(cv.professionType)}</p>
              )}
            </button>
            <button onClick={() => navigate('/stats')} className="w-full hover:opacity-90 transition-opacity focus:outline-none">
              <div className="flex items-center justify-center mb-2 animate-slideUp delay-100">
                {renderStars(Math.round(cv.reputationScore || 0))}
                <span className="ml-2 text-white font-semibold text-lg">{(cv.reputationScore || 0).toFixed(1)}</span>
              </div>
              <p className="text-white/90 animate-slideUp delay-200">{cv.totalRatings || 0} calificaciones</p>
            </button>
            <button
              onClick={() => setShowFaq(true)}
              className="mt-3 text-white/80 hover:text-white text-sm underline underline-offset-2 transition-colors"
            >
              ¿Tenés dudas? Ver preguntas frecuentes
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 -mt-16 pb-8">

        {/* Visibilidad */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-4 animate-slideUp">
          <div className="flex items-center justify-center mb-4">
            <Search className="w-6 h-6 text-purple-600 mr-2" />
            <h2 className="text-xl roboto-light text-gray-800">Visibilidad en Búsquedas</h2>
          </div>
          <div className="flex items-center justify-center">
            <button
              onClick={toggleSearchable}
              disabled={isAnimating}
              className={`relative w-20 h-10 rounded-full transition-all duration-300 ease-in-out ${isSearchable ? 'bg-green-500' : 'bg-gray-300'} ${isAnimating ? 'opacity-50' : 'hover:opacity-90'} focus:outline-none focus:ring-4 focus:ring-purple-300`}
            >
              <span className={`absolute top-1 left-1 w-8 h-8 bg-white rounded-full shadow-md transition-transform duration-300 ease-in-out flex items-center justify-center ${isSearchable ? 'translate-x-10' : 'translate-x-0'}`}>
                <Search className={`w-4 h-4 transition-colors duration-300 ${isSearchable ? 'text-green-500' : 'text-gray-400'}`} />
              </span>
            </button>
          </div>
          <p className="text-center text-sm text-gray-600 mt-4">
            {isSearchable ? '✅ Tu perfil es visible en búsquedas de clientes' : '🔒 Tu perfil está oculto de las búsquedas'}
          </p>
        </div>

        {/* Botones de acción */}
        <div className="grid grid-cols-3 gap-3 mb-4 animate-slideUp delay-50">
          <button onClick={() => navigate('/edit-cv')} className="bg-white rounded-2xl shadow-lg p-4 text-center hover-lift cursor-pointer">
            <Briefcase className="w-6 h-6 text-purple-600 mx-auto mb-2" />
            <p className="font-semibold text-gray-800 text-sm">Editar CV</p>
          </button>
          <button onClick={() => setShowShareModal(true)} className="bg-white rounded-2xl shadow-lg p-4 text-center hover-lift cursor-pointer">
            <svg className="w-6 h-6 text-green-600 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
            </svg>
            <p className="font-semibold text-gray-800 text-sm">Compartir CV</p>
          </button>
          <button onClick={() => navigate('/generate-pdf')} className="bg-white rounded-2xl shadow-lg p-4 text-center hover-lift cursor-pointer">
            <svg className="w-6 h-6 text-blue-600 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
            </svg>
            <p className="font-semibold text-gray-800 text-sm">Generar CV para imprimir</p>
          </button>
        </div>

        {/* Banner sin trabajos activos */}
        {[...freelanceActive, ...employeeActive].length === 0 && (
          <div className="bg-orange-50 border-2 border-orange-200 rounded-2xl p-4 shadow-lg mb-4 animate-slideUp delay-100">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center flex-shrink-0">
                <AlertTriangle className="w-5 h-5 text-orange-600" />
              </div>
              <div className="flex-1">
                <h3 className="text-base roboto-light text-orange-900 mb-1">⚠️ No podés recibir calificaciones todavía</h3>
                <p className="text-sm text-orange-800">Para que los clientes puedan calificarte, necesitás tener al menos un trabajo activo en tu CV. Agregalo desde Editar CV.</p>
              </div>
            </div>
          </div>
        )}

        {/* Trabajo Autónomo Actual */}
        {freelanceActive.length > 0 && (
          <div className="bg-white rounded-2xl shadow-lg p-6 mb-4 animate-slideUp delay-150">
            <h2 className="text-xl roboto-light text-gray-800 mb-4 flex items-center">
              <span className="text-2xl mr-2">💼</span>Trabajo Autónomo Actual
            </h2>
            <div className="space-y-2">
              {freelanceActive.map((work) => (
                <div key={work.workHistoryId} onClick={() => handleWorkClick(work.workHistoryId)} className="border-2 border-purple-200 rounded-xl p-4 cursor-pointer hover:bg-purple-50 hover:border-purple-400 transition-all group">
                  <div className="flex items-center gap-2">
                    <ChevronRight className="w-5 h-5 text-purple-600 group-hover:translate-x-1 transition-transform" />
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <p className="font-bold text-gray-800 text-lg">{work.position}</p>
                        <span className="bg-purple-100 text-purple-700 text-xs font-semibold px-2 py-1 rounded-full">Autónomo</span>
                      </div>
                      {work.businessName && work.businessName !== 'Autónomo' && (
                        <p className="text-purple-600 font-semibold">{work.businessName}</p>
                      )}
                      <p className="text-sm text-gray-500">📅 {formatDate(work.startDate)} - Presente</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Trabajos Actuales */}
        {employeeActive.length > 0 && (
          <div className="bg-white rounded-2xl shadow-lg p-6 mb-4 animate-slideUp delay-200">
            <h2 className="text-xl roboto-light text-gray-800 mb-4 flex items-center">
              <span className="text-2xl mr-2">🏢</span>Trabajos Actuales
            </h2>
            <div className="space-y-2">
              {employeeActive.map((work) => (
                <div key={work.workHistoryId} onClick={() => handleWorkClick(work.workHistoryId)} className="border-2 border-blue-200 rounded-xl p-4 cursor-pointer hover:bg-blue-50 hover:border-blue-400 transition-all group">
                  <div className="flex items-center gap-2">
                    <ChevronRight className="w-5 h-5 text-blue-600 group-hover:translate-x-1 transition-transform" />
                    <div>
                      <p className="font-bold text-gray-800 text-lg">{work.position}</p>
                      <p className="text-blue-600 font-semibold">{work.businessName}</p>
                      <p className="text-sm text-gray-500">📅 {formatDate(work.startDate)} - Presente</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Experiencias Pasadas */}
        {pastJobs.length > 0 && (
          <div className="bg-white rounded-2xl shadow-lg p-6 mb-4 animate-slideUp delay-250">
            <h2 className="text-xl roboto-light text-gray-800 mb-4 flex items-center">
              <span className="text-2xl mr-2">📋</span>Experiencias Laborales Pasadas
            </h2>
            <div className="space-y-2">
              {pastJobs.map((work) => (
                <div key={work.workHistoryId} onClick={() => handleWorkClick(work.workHistoryId)} className="border-2 border-gray-200 rounded-xl p-4 cursor-pointer hover:bg-gray-50 hover:border-gray-400 transition-all group">
                  <div className="flex items-center gap-2">
                    <ChevronRight className="w-5 h-5 text-gray-600 group-hover:translate-x-1 transition-transform" />
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <p className="font-bold text-gray-800 text-lg">{work.position}</p>
                        {work.isFreelance && <span className="bg-gray-200 text-gray-700 text-xs font-semibold px-2 py-1 rounded-full">Autónomo</span>}
                      </div>
                      <p className="text-gray-600 font-semibold">{work.businessName}</p>
                      <p className="text-sm text-gray-500">📅 {formatDate(work.startDate)} - {formatDate(work.endDate)}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Educación */}
        {cv.education && cv.education.length > 0 && (
          <div className="bg-white rounded-2xl shadow-lg p-6 mb-4 animate-slideUp delay-300">
            <h2 className="text-xl roboto-light text-gray-800 mb-4 flex items-center">
              <GraduationCap className="w-6 h-6 mr-2 text-purple-600" />Educación y capacitaciones
            </h2>
            <div className="space-y-4">
              {cv.education.map((edu, index) => (
                <div key={index} className="border-l-4 border-purple-600 pl-4">
                  <p className="font-bold text-gray-800">{edu.degree}</p>
                  <p className="text-purple-600">{edu.institution}</p>
                  <p className="text-sm text-gray-500">
                    {formatDate(edu.startDate)} - {edu.currentlyStudying ? 'Presente' : formatDate(edu.endDate)}
                  </p>
                  {edu.description && <p className="text-gray-600 mt-2 text-sm">{edu.description}</p>}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Aptitudes */}
        {cv.skills && cv.skills.trim() && (
          <div className="bg-white rounded-2xl shadow-lg p-6 mb-4 animate-slideUp delay-300">
            <h2 className="text-xl roboto-light text-gray-800 mb-4 flex items-center">
              <span className="text-xl mr-2">🏷️</span>Aptitudes y habilidades
            </h2>
            <div className="flex flex-wrap gap-2">
              {cv.skills.split(',').map(s => s.trim()).filter(Boolean).map((skill, i) => (
                <span key={i} className="bg-purple-50 border border-purple-200 text-purple-800 text-sm font-medium px-3 py-1.5 rounded-full">
                  {skill}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Zonas de trabajo */}
        {cv.zones && cv.zones.length > 0 && (
          <div className="bg-white rounded-2xl shadow-lg p-6 mb-4 animate-slideUp delay-300">
            <h2 className="text-xl roboto-light text-gray-800 mb-4 flex items-center">
              <MapPin className="w-6 h-6 mr-2 text-purple-600" />Zonas de trabajo
            </h2>
            <div className="flex flex-wrap gap-2">
              {cv.zones.map(zone => (
                <span key={zone.id} className="bg-purple-50 border border-purple-200 text-purple-800 text-sm font-medium px-3 py-1.5 rounded-full">
                  📍 {zone.zona}, {zone.provincia}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>

      <HomeButton />

      {showShareModal && (
        <ShareModal professionalId={cv.publicSlug} professionalName={cv.professionalName} onClose={() => setShowShareModal(false)} />
      )}
      {showFaq && <HelpSupportModal onClose={() => setShowFaq(false)} professionalName={cv?.professionalName} />}
    </div>
  );
}

export default CvView;