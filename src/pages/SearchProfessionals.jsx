import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Star, MapPin, User, Loader2, Home, Zap, Wrench, UtensilsCrossed, Hammer, Scissors, Paintbrush } from 'lucide-react';
import LoginRequiredModal from '../components/LoginRequiredModal';
import { getProfessionalBadge } from '../utils/professionalBadge';
import { BACKEND_URL } from '../config';

function SearchProfessionals() {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [professionals, setProfessionals] = useState([]);
  const [loading, setLoading] = useState(false);
  const [placeholder, setPlaceholder] = useState('');
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [modalContent, setModalContent] = useState({ title: '', message: '' });
  const inputRef = useRef(null);

  const checkAuthAndExecute = (action, type) => {
    const token = localStorage.getItem('authToken');
    if (!token) {
      if (type === 'profile') {
        setModalContent({
          title: "¡Conocé a tu profesional!",
          message: "Iniciá sesión para ver su CV completo, calificaciones de otros clientes y contactarlo."
        });
      } else if (type === 'category') {
        setModalContent({
          title: "Explorá todas las opciones",
          message: "Registrate para filtrar por rubros y descubrir a los mejores expertos puntuados por la comunidad."
        });
      } else {
        setModalContent({
          title: "¡Hola!",
          message: "Iniciá sesión para acceder a tu panel y gestionar tus búsquedas o calificaciones."
        });
      }
      setShowLoginModal(true);
      return;
    }
    action();
  };

  const placeholderWords = ['Electricista', 'Personal trainer', 'Peluquero', 'Plomero', 'Carpintero', 'Mozo', 'Chef', 'Mecánico', 'Pintor', 'Jardinero'];

  const popularCategories = [
    { name: 'Electricista', emoji: '⚡', color: 'from-blue-500 to-blue-600', icon: Zap },
    { name: 'Plomero', emoji: '🔧', color: 'from-orange-500 to-orange-600', icon: Wrench },
    { name: 'Mozo', emoji: '🍽️', color: 'from-purple-500 to-purple-600', icon: UtensilsCrossed },
    { name: 'Carpintero', emoji: '🪚', color: 'from-green-500 to-teal-600', icon: Hammer },
    { name: 'Peluquero', emoji: '💇', color: 'from-pink-500 to-rose-600', icon: Scissors },
    { name: 'Pintor', emoji: '🖌️', color: 'from-yellow-400 to-orange-500', icon: Paintbrush }
  ];

  useEffect(() => {
    let wordIndex = 0; let charIndex = 0; let isDeleting = false; let timeoutId;
    const type = () => {
      if (searchTerm.length > 0) { setPlaceholder(''); return; }
      const currentWord = placeholderWords[wordIndex];
      if (isDeleting) { setPlaceholder(currentWord.substring(0, charIndex - 1)); charIndex--; }
      else { setPlaceholder(currentWord.substring(0, charIndex + 1)); charIndex++; }
      let typeSpeed = isDeleting ? 50 : 100;
      if (!isDeleting && charIndex === currentWord.length) { typeSpeed = 2000; isDeleting = true; }
      else if (isDeleting && charIndex === 0) { isDeleting = false; wordIndex = (wordIndex + 1) % placeholderWords.length; typeSpeed = 500; }
      timeoutId = setTimeout(type, typeSpeed);
    };
    type();
    return () => clearTimeout(timeoutId);
  }, [searchTerm]);

  useEffect(() => {
    if (searchTerm.trim()) {
      const delayDebounceFn = setTimeout(() => { handleSearch(); }, 300);
      return () => clearTimeout(delayDebounceFn);
    } else { setProfessionals([]); }
  }, [searchTerm]);

  const handleSearch = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${BACKEND_URL}/api/professionals/search?query=${encodeURIComponent(searchTerm)}`);
      if (response.ok) {
        const data = await response.json();
        setProfessionals(data);
      }
    } catch (error) { console.error('Error searching:', error); } finally { setLoading(false); }
  };

  const translateProfession = (type) => {
    if (!type) return '';
    const translations = { 'WAITER': 'Mozo', 'ELECTRICIAN': 'Electricista', 'PAINTER': 'Pintor', 'HAIRDRESSER': 'Peluquero', 'PLUMBER': 'Plomero', 'CARPENTER': 'Carpintero', 'MECHANIC': 'Mecánico', 'CHEF': 'Chef', 'BARISTA': 'Barista', 'BARTENDER': 'Bartender', 'CLEANER': 'Personal de limpieza', 'GARDENER': 'Jardinero', 'DRIVER': 'Conductor', 'SECURITY': 'Seguridad', 'RECEPTIONIST': 'Recepcionista', 'OTHER': 'Otro' };
    return translations[type.toUpperCase()] || type;
  };

  const renderStars = (score) => {
    return [...Array(5)].map((_, i) => (
      <Star key={i} className={`w-4 h-4 ${i < Math.round(score) ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'}`} />
    ));
  };

  const renderProfessionalCard = (professional, index = 0) => {
    const badge = getProfessionalBadge(professional.totalRatings);
    const professionDisplay = translateProfession(professional.professionType || professional.profession);

    return (
      <div
        key={professional.id}
        onClick={() => checkAuthAndExecute(() => navigate(`/public-cv/${professional.id}`), 'profile')}
        className="bg-white rounded-2xl shadow-md p-4 mb-3 cursor-pointer hover:shadow-xl transition-all animate-slideUp border border-gray-100"
        style={{ animationDelay: `${index * 50}ms` }}
      >
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-xl font-bold text-white flex-shrink-0">
            {professional.name.charAt(0)}
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="text-base font-bold text-gray-800 truncate">{professional.name}</h3>
            <p className="text-xs text-purple-600 font-semibold mb-1">{professionDisplay}</p>
            <div className="flex items-center gap-2">
              <div className="flex">{renderStars(professional.reputationScore || 0)}</div>
              <span className="text-xs font-bold text-gray-700">{(professional.reputationScore || 0).toFixed(1)}</span>
            </div>
          </div>
          <div className={`${badge.bgColor} p-2 rounded-lg border ${badge.borderColor} flex-shrink-0`}>
            <span className="text-lg">{badge.emoji}</span>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50 relative">
      {/* CONTENEDOR DE FONDO: 
          Aquí es donde aplicamos el blur. El modal queda afuera de este div.
      */}
      <div className={`transition-all duration-300 ${showLoginModal ? 'blur-md grayscale-[0.2] pointer-events-none' : ''}`}>
        <div className="bg-gradient-to-br from-blue-500 to-purple-600 px-4 pt-10 pb-16 shadow-lg">
          <div className="max-w-4xl mx-auto">
            <h1 className="text-2xl roboto-light text-white mb-6">¿Qué profesional buscás hoy?</h1>
            <div className="relative">
              <input
                ref={inputRef}
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder={placeholder}
                className="w-full bg-white/95 backdrop-blur-sm px-6 py-4 rounded-2xl focus:outline-none shadow-xl transition-all text-gray-800 text-lg"
              />
              <div className="absolute right-4 top-1/2 -translate-y-1/2">
                {loading ? <Loader2 className="w-6 h-6 text-purple-600 animate-spin" /> : <Search className="w-6 h-6 text-gray-300" />}
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-4xl mx-auto px-4 -mt-8 relative z-10 pb-24">
          {searchTerm.trim() ? (
            <div className="animate-fadeIn">
              {professionals.length > 0 ? (
                professionals.map((p, i) => renderProfessionalCard(p, i))
              ) : !loading && (
                <div className="bg-white rounded-3xl p-10 text-center shadow-lg border border-gray-100">
                  <User className="w-16 h-16 text-gray-200 mx-auto mb-4" />
                  <p className="text-gray-500">No encontramos resultados para "{searchTerm}"</p>
                </div>
              )}
            </div>
          ) : (
            <div className="animate-fadeIn">
              <div className="grid grid-cols-2 gap-4">
                {popularCategories.map((cat, i) => (
                  <button
                    key={i}
                    onClick={() => checkAuthAndExecute(() => setSearchTerm(cat.name), 'category')}
                    className={`bg-gradient-to-br ${cat.color} p-6 rounded-3xl shadow-md hover:scale-[1.03] active:scale-95 transition-all text-left relative overflow-hidden group h-32`}
                  >
                    <div className="absolute -right-2 -bottom-2 opacity-20 group-hover:scale-110 transition-transform text-white">
                      <cat.icon size={80} />
                    </div>
                    <span className="text-3xl mb-2 block">{cat.emoji}</span>
                    <span className="text-white font-bold text-lg leading-tight">{cat.name}</span>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="fixed bottom-6 left-0 right-0 flex justify-center z-30">
          <button
            onClick={() => navigate(-1)}
            className="w-14 h-14 bg-gradient-to-r from-green-500 to-teal-600 rounded-full flex items-center justify-center shadow-2xl border-4 border-white hover:scale-110 transition-all"
          >
            <Home className="w-7 h-7 text-white" />
          </button>
        </div>
      </div>

      {/* MODAL: 
          Al estar fuera del div anterior, no recibe el blur. 
      */}
      {showLoginModal && (
        <LoginRequiredModal
          title={modalContent.title}
          message={modalContent.message}
          onClose={() => setShowLoginModal(false)}
        />
      )}
    </div>
  );
}

export default SearchProfessionals;