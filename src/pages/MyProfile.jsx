import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { User, Mail, Phone, MapPin, Edit, Home, ChevronDown, FileText, LogOut } from 'lucide-react';
import LoadingScreen from '../components/LoadingScreen';
import BackButton from '../components/BackButton';
import { BACKEND_URL } from '../config';

function MyProfile() {
  const navigate = useNavigate();
  const [professional, setProfessional] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    loadMyProfile();

    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowUserMenu(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const loadMyProfile = async () => {
    const savedData = localStorage.getItem('professional');
    const token = localStorage.getItem('authToken');

    if (!savedData || !token) {
      navigate('/professional-login');
      setLoading(false);
      return;
    }

    const localData = JSON.parse(savedData);
    setProfessional(localData);

    try {
      const response = await fetch(`${BACKEND_URL}/api/professionals/${localData.id}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (response.ok) {
        const updatedData = await response.json();
        setProfessional(updatedData);
        localStorage.setItem('professional', JSON.stringify(updatedData));
      }
    } catch {
      // silencioso
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('authToken');
    localStorage.removeItem('professional');
    setShowUserMenu(false);
    navigate('/');
  };

  const handleCV = () => {
    setShowUserMenu(false);
    navigate('/cv-view');
  };

  if (loading) return <LoadingScreen />;

  if (!professional) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center p-4 animate-fadeIn">
        <div className="bg-white rounded-2xl p-8 text-center animate-scaleIn">
          <p className="text-gray-600 mb-4 text-base">No se pudo cargar tu perfil</p>
          <button
            onClick={() => navigate('/professional-dashboard')}
            className="bg-blue-500 text-white px-6 py-2 rounded-full hover:bg-blue-600 transition-all ripple text-base"
          >
            Volver al panel principal
          </button>
        </div>
      </div>
    );
  }

  const professionalName = professional.name || professional.professionalName || 'Mi Perfil';
  const firstName = professionalName.split(' ')[0];

  return (
    <div className="min-h-screen bg-gray-50 animate-fadeIn pb-24">

      {/* Header */}
      <div className="bg-gradient-to-br from-blue-500 to-purple-600 px-4 pt-6 pb-24 animate-slideDown">
        <div className="flex justify-between items-center mb-6">
          {/* Botón volver igual que CvView */}
          <BackButton to="/professional-dashboard" />

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

        <div className="max-w-4xl mx-auto text-center">
          <div className="w-24 h-24 rounded-full mx-auto mb-4 overflow-hidden bg-white flex items-center justify-center text-4xl font-bold text-purple-600 animate-scaleIn border-4 border-white shadow-lg">
            {professional.profilePicture
              ? <img src={professional.profilePicture} alt="Foto de perfil" className="w-full h-full object-cover" />
              : professionalName.charAt(0)
            }
          </div>
          <h1 className="text-3xl roboto-light text-white mb-1 animate-slideUp">
            {professionalName}
          </h1>
          <p className="text-white/70 text-sm animate-slideUp delay-100">Mi Perfil</p>
        </div>
      </div>

      {/* Contenido */}
      <div className="max-w-4xl mx-auto px-4 -mt-16">

        {/* Información Personal */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-4 animate-slideUp">
          <h2 className="text-xl roboto-light text-gray-800 mb-5 flex items-center">
            <User className="w-6 h-6 mr-2 text-blue-600" />
            Información Personal
          </h2>

          <div className="space-y-5">
            <div>
              <div className="flex items-center text-gray-400 text-sm mb-1">
                <User className="w-4 h-4 mr-2" />
                <span>Nombre completo</span>
              </div>
              <p className="text-gray-800 text-base font-medium ml-6">{professionalName}</p>
            </div>

            <div>
              <div className="flex items-center text-gray-400 text-sm mb-1">
                <Mail className="w-4 h-4 mr-2" />
                <span>Email</span>
              </div>
              <p className="text-gray-800 text-base font-medium ml-6">{professional.email || 'No especificado'}</p>
            </div>

            <div>
              <div className="flex items-center text-gray-400 text-sm mb-1">
                <Phone className="w-4 h-4 mr-2" />
                <span>Teléfono</span>
              </div>
              <p className="text-gray-800 text-base font-medium ml-6">{professional.phone || 'No especificado'}</p>
            </div>

            <div>
              <div className="flex items-center text-gray-400 text-sm mb-1">
                <MapPin className="w-4 h-4 mr-2" />
                <span>Ubicación</span>
              </div>
              <p className="text-gray-800 text-base font-medium ml-6">{professional.location || 'No especificada'}</p>
            </div>
          </div>
        </div>

        {/* Botón Editar */}
        <div className="mb-6">
          <button
            onClick={() => navigate('/edit-profile-professional')}
            className="w-full bg-gradient-to-r from-blue-500 to-purple-600 text-white font-bold py-4 rounded-2xl shadow-lg hover:scale-105 transition-all flex items-center justify-center gap-2 animate-slideUp delay-50"
          >
            <Edit className="w-5 h-5" />
            Editar Perfil
          </button>
        </div>
      </div>

      {/* Botón Home flotante */}
      <div className="fixed bottom-4 left-0 right-0 flex justify-center z-50 animate-slideUp pointer-events-none">
        <button
          onClick={() => navigate('/professional-dashboard')}
          className="w-14 h-14 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 rounded-full flex items-center justify-center transition-all hover:scale-110 shadow-2xl border-4 border-white pointer-events-auto"
          aria-label="Volver al inicio"
        >
          <Home className="w-7 h-7 text-white" />
        </button>
      </div>
    </div>
  );
}

export default MyProfile;