import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Star, MapPin, User, Loader2, Home, Zap, Wrench, UtensilsCrossed, Hammer, Scissors, Paintbrush, TrendingUp, Sparkles } from 'lucide-react';
import LoginRequiredModal from '../components/LoginRequiredModal';
import { getProfessionalBadge } from '../utils/professionalBadge';

function SearchProfessionals() {
  const navigate = useNavigate();
  const backendUrl = 'https://professional-rating-backend-production.up.railway.app';
  
  const [searchTerm, setSearchTerm] = useState('');
  const [professionals, setProfessionals] = useState([]);
  const [loading, setLoading] = useState(false);
  const [placeholder, setPlaceholder] = useState('');
  const [topProfessionals, setTopProfessionals] = useState([]);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const inputRef = useRef(null);

  const placeholderWords = ['Electricista', 'Peluquero', 'Plomero', 'Carpintero', 'Mozo', 'Chef', 'Mecánico'];

  const popularCategories = [
    { name: 'Electricista', emoji: '⚡', color: 'from-blue-500 to-blue-600', icon: Zap },
    { name: 'Plomero', emoji: '🔧', color: 'from-orange-500 to-orange-600', icon: Wrench },
    { name: 'Mozo', emoji: '🍽️', color: 'from-purple-500 to-purple-600', icon: UtensilsCrossed },
    { name: 'Carpintero', emoji: '🪚', color: 'from-green-500 to-teal-600', icon: Hammer },
    { name: 'Peluquero', emoji: '💇', color: 'from-pink-500 to-rose-600', icon: Scissors },
    { name: 'Pintor', emoji: '🖌️', color: 'from-yellow-400 to-orange-500', icon: Paintbrush }
  ];

  useEffect(() => {
    loadTopProfessionals();
    // Lógica de placeholder animado (se mantiene igual)
  }, []);

  useEffect(() => {
    if (searchTerm.trim()) {
      handleSearch();
    } else {
      setProfessionals([]);
    }
  }, [searchTerm]);

  const loadTopProfessionals = async () => {
    try {
      const response = await fetch(`${backendUrl}/api/professionals/search/top`);
      if (response.ok) {
        const data = await response.json();
        setTopProfessionals(data);
      }
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const handleSearch = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${backendUrl}/api/professionals/search?query=${encodeURIComponent(searchTerm)}`);
      if (response.ok) {
        const data = await response.json();
        setProfessionals(data);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const renderProfessionalCard = (professional, index = 0) => {
    const badge = getProfessionalBadge(professional.totalRatings);
    return (
      <div
        key={professional.id}
        onClick={() => {
          const token = localStorage.getItem('authToken');
          if (!token) { setShowLoginModal(true); return; }
          navigate(`/public-cv/${professional.id}`);
        }}
        className="bg-white rounded-2xl shadow-md p-4 mb-3 border border-gray-100 hover-lift animate-slideUp"
        style={{ animationDelay: `${index * 50}ms` }}
      >
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-xl font-bold text-white flex-shrink-0">
            {professional.name.charAt(0)}
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="font-bold text-gray-800 truncate">{professional.name}</h3>
            <p className="text-xs text-purple-600 font-semibold uppercase">{professional.professionType}</p>
            <div className="flex items-center gap-2 mt-1">
                <div className="flex text-yellow-400">
                    <Star className="w-3 h-3 fill-current" />
                </div>
                <span className="text-xs font-bold text-gray-700">{(professional.reputationScore || 0).toFixed(1)}</span>
                <span className="text-xs text-gray-400">({professional.totalRatings})</span>
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
    <div className="min-h-screen bg-gray-50 pb-24">
      {/* Header Fijo con Buscador */}
      <div className="bg-gradient-to-br from-blue-500 to-purple-600 px-4 pt-8 pb-12 sticky top-0 z-20 shadow-lg">
        <div className="max-w-4xl mx-auto">
            <h1 className="text-2xl roboto-light text-white mb-4">Descubrí profesionales</h1>
            <div className="relative group">
                <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder={placeholder || "Buscar por rubro..."}
                    className="w-full bg-white/95 backdrop-blur-sm px-5 py-4 rounded-2xl focus:outline-none shadow-xl transition-all text-gray-800"
                />
                <div className="absolute right-4 top-1/2 -translate-y-1/2">
                    {loading ? <Loader2 className="w-6 h-6 text-purple-600 animate-spin" /> : <Search className="w-6 h-6 text-gray-400" />}
                </div>
            </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 -mt-6 relative z-10">
        {/* RESULTADOS DE BÚSQUEDA */}
        {searchTerm.trim() ? (
          <div className="animate-fadeIn">
            <h2 className="text-gray-500 text-xs font-bold uppercase tracking-widest mb-4 ml-2">Resultados para "{searchTerm}"</h2>
            {professionals.length > 0 ? (
              professionals.map((p, i) => renderProfessionalCard(p, i))
            ) : !loading && (
              <div className="bg-white rounded-3xl p-10 text-center shadow-lg">
                <User className="w-16 h-16 text-gray-200 mx-auto mb-4" />
                <p className="text-gray-500">No encontramos resultados. Intentá con otro rubro.</p>
              </div>
            )}
          </div>
        ) : (
          /* PANTALLA DE INICIO (EXPLORAR) */
          <div className="animate-fadeIn">
            {/* Categorías en Grilla */}
            <section className="mb-8">
              <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-yellow-500" /> Categorías Populares
              </h3>
              <div className="grid grid-cols-2 gap-3">
                {popularCategories.map((cat, i) => (
                  <button
                    key={i}
                    onClick={() => setSearchTerm(cat.name)}
                    className={`bg-gradient-to-br ${cat.color} p-4 rounded-2xl shadow-md hover:scale-105 transition-all text-left relative overflow-hidden group`}
                  >
                    <div className="absolute -right-2 -bottom-2 opacity-20 group-hover:scale-125 transition-transform">
                        <cat.icon size={64} className="text-white" />
                    </div>
                    <span className="text-2xl mb-1 block">{cat.emoji}</span>
                    <span className="text-white font-bold text-sm">{cat.name}</span>
                  </button>
                ))}
              </div>
            </section>

            {/* Sugerencias de la Comunidad */}
            <section>
              <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-green-500" /> Profesionales Destacados
              </h3>
              <div className="space-y-3">
                {topProfessionals.length > 0 ? (
                  topProfessionals.slice(0, 5).map((p, i) => renderProfessionalCard(p, i))
                ) : (
                    /* Skeleton de carga */
                    [...Array(3)].map((_, i) => (
                        <div key={i} className="h-24 bg-gray-200 rounded-2xl animate-pulse mb-3" />
                    ))
                )}
              </div>
            </section>
          </div>
        )}
      </div>

      {/* Botón Home Flotante */}
      <div className="fixed bottom-6 left-0 right-0 flex justify-center z-30">
        <button 
          onClick={() => navigate('/client-dashboard')}
          className="w-14 h-14 bg-gradient-to-r from-green-500 to-teal-600 rounded-full flex items-center justify-center shadow-2xl border-4 border-white hover:scale-110 transition-all"
        >
          <Home className="w-7 h-7 text-white" />
        </button>
      </div>

      {showLoginModal && <LoginRequiredModal onClose={() => setShowLoginModal(false)} />}
    </div>
  );
}

export default SearchProfessionals;