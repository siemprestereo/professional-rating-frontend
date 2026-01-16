import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Star, MapPin, User, Loader2 } from 'lucide-react';

function SearchProfessionals() {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [professionals, setProfessionals] = useState([]);
  const [loading, setLoading] = useState(false);

  // Mock data - en producción esto vendría del backend
  const mockProfessionals = [
    {
      id: 5,
      name: 'Pedro González',
      reputationScore: 4.5,
      totalRatings: 12,
      currentBusiness: 'La Parrilla'
    },
    {
      id: 2,
      name: 'Carlos López',
      reputationScore: 4.8,
      totalRatings: 25,
      currentBusiness: 'El Buen Sabor'
    }
  ];

  const handleSearch = async () => {
    setLoading(true);
    try {
      // Simulación de búsqueda
      await new Promise(resolve => setTimeout(resolve, 500));
      
      const filtered = mockProfessionals.filter(p => 
        p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.currentBusiness.toLowerCase().includes(searchTerm.toLowerCase())
      );
      
      setProfessionals(filtered);
    } catch (error) {
      console.error('Error searching:', error);
    } finally {
      setLoading(false);
    }
  };

  const renderStars = (score) => {
    return [...Array(5)].map((_, i) => (
      <Star
        key={i}
        className={`w-4 h-4 transition-all duration-300 ${i < Math.round(score) ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'}`}
      />
    ));
  };

  return (
    <div className="min-h-screen bg-gray-50 animate-fadeIn">
      {/* Header */}
      <div className="bg-gradient-to-br from-blue-500 to-purple-600 px-4 py-6 animate-slideDown">
        <h1 className="text-2xl font-bold text-white mb-4">Buscar Profesionales</h1>
        
        {/* Buscador */}
        <div className="relative animate-slideUp">
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
            placeholder="Buscar por profesión u oficio..."
            className="w-full px-4 py-3 pr-12 rounded-full focus:outline-none focus:ring-2 focus:ring-white transition-all duration-300"
          />
          <button
            onClick={handleSearch}
            className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-purple-600 text-white p-2 rounded-full hover:bg-purple-700 hover:scale-110 transition-all duration-300 ripple"
          >
            <Search className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Resultados */}
      <div className="px-4 py-6">
        {loading ? (
          <div className="text-center py-12 animate-fadeIn">
            <Loader2 className="w-16 h-16 text-purple-600 animate-spin mx-auto mb-4" />
            <div className="text-gray-600">Buscando...</div>
          </div>
        ) : professionals.length === 0 && searchTerm ? (
          <div className="text-center py-12 animate-scaleIn">
            <User className="w-16 h-16 text-gray-400 mx-auto mb-4 animate-slideUp" />
            <p className="text-gray-600 animate-slideUp delay-100">No se encontraron profesionales</p>
            <p className="text-sm text-gray-500 mt-2 animate-slideUp delay-200">
              Probá con otro nombre o lugar de trabajo
            </p>
          </div>
        ) : professionals.length === 0 ? (
          <div className="text-center py-12 animate-scaleIn">
            <Search className="w-16 h-16 text-gray-400 mx-auto mb-4 animate-slideUp" />
            <p className="text-gray-600 animate-slideUp delay-100">¿Necesitas alguna clase de servicio?</p>
            <p className="text-sm text-gray-500 mt-2 animate-slideUp delay-200">
              Buscá según la profesión que necesites.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {professionals.map((professional, index) => (
              <div
                key={professional.id}
                onClick={() => navigate(`/professional/${professional.id}`)}
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
                    
                    <div className="flex items-center mb-2">
                      {renderStars(professional.reputationScore)}
                      <span className="ml-2 text-sm font-semibold text-gray-700">
                        {professional.reputationScore.toFixed(1)}
                      </span>
                      <span className="ml-2 text-sm text-gray-500">
                        ({professional.totalRatings} {professional.totalRatings === 1 ? 'calificación' : 'calificaciones'})
                      </span>
                    </div>
                    
                    {professional.currentBusiness && (
                      <div className="flex items-center text-sm text-gray-600">
                        <MapPin className="w-4 h-4 mr-1 text-purple-600" />
                        {professional.currentBusiness}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default SearchProfessionals;