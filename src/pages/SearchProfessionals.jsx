import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Star, MapPin, User, Loader2, Home, Zap, Wrench, UtensilsCrossed, Hammer, Scissors, Paintbrush } from 'lucide-react';
import LoginRequiredModal from '../components/LoginRequiredModal';
import { getProfessionalBadge } from '../utils/professionalBadge';

function SearchProfessionals() {
  const navigate = useNavigate();
  const backendUrl = 'https://professional-rating-backend-production.up.railway.app';
  
  const [searchTerm, setSearchTerm] = useState('');
  const [professionals, setProfessionals] = useState([]);
  const [loading, setLoading] = useState(false);
  const [placeholder, setPlaceholder] = useState('');
  const [activeTab, setActiveTab] = useState('buscar');
  const [topProfessionals, setTopProfessionals] = useState([]);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const inputRef = useRef(null);

  // Palabras para el placeholder animado
  const placeholderWords = [
    'Electricista',
    'Personal trainer',
    'Peluquero',
    'Plomero',
    'Carpintero',
    'Mozo',
    'Chef',
    'Mecánico',
    'Pintor',
    'Jardinero'
  ];

  // Categorías populares
  const popularCategories = [
    { name: 'Electricista', emoji: '⚡', color: 'blue', icon: Zap },
    { name: 'Plomero', emoji: '🔧', color: 'orange', icon: Wrench },
    { name: 'Mozo', emoji: '🍽️', color: 'purple', icon: UtensilsCrossed },
    { name: 'Carpintero', emoji: '🪚', color: 'green', icon: Hammer },
    { name: 'Peluquero', emoji: '💇', color: 'pink', icon: Scissors },
    { name: 'Pintor', emoji: '🖌️', color: 'yellow', icon: Paintbrush }
  ];

  // Efecto para placeholder animado
  useEffect(() => {
    let wordIndex = 0;
    let charIndex = 0;
    let isDeleting = false;
    let timeoutId;

    const type = () => {
      if (searchTerm.length > 0) {
        setPlaceholder('');
        return;
      }

      const currentWord = placeholderWords[wordIndex];
      
      if (isDeleting) {
        setPlaceholder(currentWord.substring(0, charIndex - 1));
        charIndex--;
      } else {
        setPlaceholder(currentWord.substring(0, charIndex + 1));
        charIndex++;
      }

      let typeSpeed = isDeleting ? 50 : 100;

      if (!isDeleting && charIndex === currentWord.length) {
        typeSpeed = 2000;
        isDeleting = true;
      } else if (isDeleting && charIndex === 0) {
        isDeleting = false;
        wordIndex = (wordIndex + 1) % placeholderWords.length;
        typeSpeed = 500;
      }

      timeoutId = setTimeout(type, typeSpeed);
    };

    type();

    return () => {
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
    };
  }, [searchTerm]);

  // Cargar top profesionales cuando se abre el tab "Explorar"
  useEffect(() => {
    if (activeTab === 'explorar' && topProfessionals.length === 0) {
      loadTopProfessionals();
    }
  }, [activeTab]);

  // Auto-ejecutar búsqueda cuando cambia searchTerm
  useEffect(() => {
    if (searchTerm.trim() && activeTab === 'buscar') {
      handleSearch();
    }
  }, [searchTerm]);

  // Manejar el botón "atrás" del navegador
  useEffect(() => {
    const handlePopState = (event) => {
      if (event.state?.category) {
        setSearchTerm(event.state.category);
        setActiveTab('buscar');
      } else {
        setSearchTerm('');
        setActiveTab('buscar');
      }
    };

    window.addEventListener('popstate', handlePopState);
    
    return () => {
      window.removeEventListener('popstate', handlePopState);
    };
  }, []);

  const loadTopProfessionals = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${backendUrl}/api/professionals/search/top`);
      
      if (response.ok) {
        const data = await response.json();
        console.log('✅ Top profesionales cargados:', data);
        setTopProfessionals(data);
      } else {
        console.error('❌ Error cargando top profesionales');
        setTopProfessionals([]);
      }
    } catch (error) {
      console.error('Error loading top professionals:', error);
      setTopProfessionals([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async () => {
    if (!searchTerm.trim()) {
      setProfessionals([]);
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(
        `${backendUrl}/api/professionals/search?query=${encodeURIComponent(searchTerm)}`
      );
      
      if (response.ok) {
        const data = await response.json();
        console.log('✅ Búsqueda exitosa:', data);
        setProfessionals(data);
      } else {
        console.error('❌ Error en búsqueda');
        setProfessionals([]);
      }
    } catch (error) {
      console.error('Error searching:', error);
      setProfessionals([]);
    } finally {
      setLoading(false);
    }
  };

  const handleCategoryClick = (categoryName) => {
    setSearchTerm(categoryName);
    setActiveTab('buscar');
    
    // Agregar al historial del navegador
    window.history.pushState(
      { category: categoryName }, 
      '', 
      `/search?q=${encodeURIComponent(categoryName)}`
    );
  };

  const checkLoginAndNavigate = (professionalId) => {
    const token = localStorage.getItem('authToken');
    
    if (!token) {
      setShowLoginModal(true);
      return;
    }
    
    navigate(`/professional/${professionalId}`);
  };

  const renderStars = (score) => {
    return [...Array(5)].map((_, i) => (
      <Star
        key={i}
        className={`w-4 h-4 transition-all duration-300 ${i < Math.round(score) ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'}`}
      />
    ));
  };

  const getColorClasses = (color) => {
    const colors = {
      blue: 'bg-blue-50 hover:bg-blue-100 border-blue-200',
      orange: 'bg-orange-50 hover:bg-orange-100 border-orange-200',
      purple: 'bg-purple-50 hover:bg-purple-100 border-purple-200',
      green: 'bg-green-50 hover:bg-green-100 border-green-200',
      pink: 'bg-pink-50 hover:bg-pink-100 border-pink-200',
      yellow: 'bg-yellow-50 hover:bg-yellow-100 border-yellow-200'
    };
    return colors[color] || colors.blue;
  };

  const translateProfession = (type) => {
    const translations = {
      'WAITER': 'Mozo',
      'ELECTRICIAN': 'Electricista',
      'PAINTER': 'Pintor',
      'HAIRDRESSER': 'Peluquero',
      'PLUMBER': 'Plomero',
      'CARPENTER': 'Carpintero',
      'MECHANIC': 'Mecánico',
      'CHEF': 'Chef',
      'BARISTA': 'Barista',
      'BARTENDER': 'Bartender',
      'CLEANER': 'Personal de limpieza',
      'GARDENER': 'Jardinero',
      'DRIVER': 'Conductor',
      'SECURITY': 'Seguridad',
      'RECEPTIONIST': 'Recepcionista'
    };
    return translations[type] || type;
  };

  const renderProfessionalCard = (professional, index = 0) => {
    const badge = getProfessionalBadge(professional.totalRatings);
    
    return (
      <div
        key={professional.id}
        onClick={() => checkLoginAndNavigate(professional.id)}
        className="bg-white rounded-2xl shadow-lg p-4 cursor-pointer hover:shadow-xl transition-all duration-300 animate-slideUp hover-lift"
        style={{ animationDelay: `${index * 0.1}s` }}
      >
        <div className="flex items-start">
          <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-2xl font-bold text-white mr-4 transition-transform duration-300 hover:scale-110">
            {professional.name.charAt(0)}
          </div>
          
          <div className="flex-1">
            <h3 className="text-lg font-bold text-gray-800 mb-1">
              {professional.name}
            </h3>
            
            {professional.professionType && (
              <p className="text-sm text-purple-600 font-semibold mb-2">
                {translateProfession(professional.professionType)}
              </p>
            )}
            
            {/* Medalla */}
            <div className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold mb-2 ${badge.bgColor} ${badge.borderColor} border`}>
              <span className="text-sm">{badge.emoji}</span>
              <span className={badge.color}>{badge.name}</span>
            </div>
            
            <div className="flex items-center mb-2">
              {renderStars(professional.reputationScore || 0)}
              <span className="ml-2 text-sm font-semibold text-gray-700">
                {(professional.reputationScore || 0).toFixed(1)}
              </span>
              <span className="ml-2 text-sm text-gray-500">
                ({professional.totalRatings || 0})
              </span>
            </div>
            
            {professional.location && (
              <div className="flex items-center text-sm text-gray-600">
                <MapPin className="w-4 h-4 mr-1 text-purple-600" />
                {professional.location}
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-24 animate-fadeIn">
      {/* Header */}
      <div className="bg-gradient-to-br from-blue-500 to-purple-600 px-4 pt-4 pb-6 md:pt-6 animate-slideDown">
        <h1 className="text-2xl md:text-3xl roboto-light text-white mb-3 md:mb-4">Buscar profesionales</h1>
        
        {/* Buscador */}
        <div className="relative animate-slideUp">
          <input
            ref={inputRef}
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
            placeholder={placeholder}
            className="w-full px-4 py-3 rounded-full focus:outline-none focus:ring-2 focus:ring-white transition-all duration-300 text-base"
            style={{ paddingRight: '3.5rem' }}
          />
          <button
            onClick={handleSearch}
            className="bg-purple-600 text-white p-2 rounded-full hover:bg-purple-700 hover:scale-110 transition-all duration-300 ripple"
            style={{
              position: 'absolute',
              right: '0.5rem',
              top: '50%',
              transform: 'translateY(-50%)'
            }}
          >
            <Search className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* TABS */}
      <div className="bg-white border-b sticky top-0 z-10 shadow-sm">
        <div className="flex">
          <button
            onClick={() => setActiveTab('buscar')}
            className={`flex-1 py-4 px-6 font-semibold transition-all border-b-2 text-base ${
              activeTab === 'buscar'
                ? 'text-purple-600 border-purple-600'
                : 'text-gray-500 border-transparent hover:text-purple-600'
            }`}
          >
            🔍 Buscar
          </button>
          <button
            onClick={() => setActiveTab('explorar')}
            className={`flex-1 py-4 px-6 font-semibold transition-all border-b-2 text-base ${
              activeTab === 'explorar'
                ? 'text-purple-600 border-purple-600'
                : 'text-gray-500 border-transparent hover:text-purple-600'
            }`}
          >
            🌟 Explorar
          </button>
        </div>
      </div>

      {/* Contenido */}
      <div className="px-4 py-6">
        {/* TAB: BUSCAR */}
        {activeTab === 'buscar' && (
          <div className="animate-fadeIn">
            {loading ? (
              <div className="text-center py-12">
                <Loader2 className="w-16 h-16 text-purple-600 animate-spin mx-auto mb-4" />
                <div className="text-gray-600 text-base">Buscando...</div>
              </div>
            ) : professionals.length > 0 ? (
              <div className="space-y-4">
                {professionals.map((professional, index) => 
                  renderProfessionalCard(professional, index)
                )}
              </div>
            ) : (
              <>
                {/* Categorías populares */}
                <div className="mb-6">
                  <h3 className="text-xl roboto-light text-gray-800 mb-4">¿Qué estás buscando?</h3>
                  <div className="grid grid-cols-3 gap-3">
                    {popularCategories.map((category) => (
                      <button
                        key={category.name}
                        onClick={() => handleCategoryClick(category.name)}
                        className={`${getColorClasses(category.color)} border-2 rounded-xl p-4 transition-all hover:scale-105 active:scale-95`}
                      >
                        <div className="text-3xl mb-2">{category.emoji}</div>
                        <div className="text-sm font-semibold text-gray-700">{category.name}</div>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Mensaje cuando no hay búsqueda */}
                {!searchTerm && (
                  <div className="text-center py-6 animate-scaleIn">
                    <Search className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-600 text-base">Buscá la profesión que necesites</p>
                    <p className="text-sm text-gray-500 mt-2">
                      O elegí una categoría popular
                    </p>
                  </div>
                )}

                {/* Mensaje cuando no hay resultados */}
                {searchTerm && professionals.length === 0 && !loading && (
                  <div className="text-center py-12 animate-scaleIn">
                    <User className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-600 text-base">No se encontraron profesionales</p>
                    <p className="text-sm text-gray-500 mt-2">
                      Probá con otra profesión
                    </p>
                  </div>
                )}
              </>
            )}
          </div>
        )}

        {/* TAB: EXPLORAR */}
        {activeTab === 'explorar' && (
          <div className="animate-fadeIn">
            {loading ? (
              <div className="text-center py-12">
                <Loader2 className="w-16 h-16 text-purple-600 animate-spin mx-auto mb-4" />
                <div className="text-gray-600 text-base">Cargando...</div>
              </div>
            ) : (
              <>
                {/* Top profesionales */}
                <div className="mb-6">
                  <h3 className="text-xl roboto-light text-gray-800 mb-4">🌟 Top Profesionales</h3>
                  {topProfessionals.length > 0 ? (
                    <div className="space-y-3">
                      {topProfessionals.map((professional, index) => 
                        renderProfessionalCard(professional, index)
                      )}
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <User className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                      <p className="text-gray-600 text-base">No hay profesionales disponibles</p>
                    </div>
                  )}
                </div>

                {/* Por categoría */}
                <div>
                  <h4 className="text-base font-semibold text-gray-700 mb-3">Por categoría</h4>
                  <div className="space-y-2">
                    {popularCategories.slice(0, 3).map((category) => (
                      <button
                        key={category.name}
                        onClick={() => handleCategoryClick(category.name)}
                        className="w-full bg-white hover:bg-gray-50 p-4 rounded-xl flex items-center justify-between transition-all shadow-sm hover:shadow-md"
                      >
                        <span className="font-semibold text-gray-700 text-base">
                          {category.emoji} {category.name}
                        </span>
                        <span className="text-sm text-purple-600">Ver →</span>
                      </button>
                    ))}
                  </div>
                </div>
              </>
            )}
          </div>
        )}
      </div>

      {/* Botón Home flotante */}
      <div className="fixed bottom-4 left-0 right-0 flex justify-center z-50 animate-slideUp">
        <button 
          onClick={() => navigate(-1)}
          className="w-14 h-14 bg-gradient-to-r from-green-500 to-teal-600 hover:from-green-600 hover:to-teal-700 rounded-full flex items-center justify-center transition-all hover:scale-110 shadow-2xl border-4 border-white"
          aria-label="Volver atrás"
        >
          <Home className="w-7 h-7 text-white" />
        </button>
      </div>

      {showLoginModal && (
        <LoginRequiredModal onClose={() => setShowLoginModal(false)} />
      )}
    </div>
  );
}

export default SearchProfessionals;