import { useState, useEffect } from 'react';
import { Search } from 'lucide-react';

function SearchableToggle() {
  const backendUrl = 'https://professional-rating-backend-production.up.railway.app';
  const [isSearchable, setIsSearchable] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    loadSearchableStatus();
  }, []);

  const loadSearchableStatus = async () => {
    try {
      const token = localStorage.getItem('authToken');
      const professional = JSON.parse(localStorage.getItem('professional'));
      
      if (!token || !professional?.id) return;

      const response = await fetch(
        `${backendUrl}/api/professionals/${professional.id}/searchable-status`,
        {
          headers: { 'Authorization': `Bearer ${token}` }
        }
      );

      if (response.ok) {
        const data = await response.json();
        setIsSearchable(data.searchable);
      }
    } catch (error) {
      console.error('Error loading searchable status:', error);
    }
  };

  const toggleSearchable = async () => {
    try {
      setIsAnimating(true);
      const token = localStorage.getItem('authToken');
      const professional = JSON.parse(localStorage.getItem('professional'));
      
      if (!token || !professional?.id) return;

      const response = await fetch(
        `${backendUrl}/api/professionals/${professional.id}/searchable`,
        {
          method: 'PUT',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ searchable: !isSearchable })
        }
      );

      if (response.ok) {
        setIsSearchable(!isSearchable);
      }
    } catch (error) {
      console.error('Error toggling searchable:', error);
    } finally {
      setTimeout(() => setIsAnimating(false), 300);
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-lg p-6 mb-4 animate-slideUp">
      {/* Header centrado */}
      <div className="flex items-center justify-center mb-4">
        <Search className="w-6 h-6 text-purple-600 mr-2" />
        <h2 className="text-xl font-bold text-gray-800">
          Visibilidad en Búsquedas
        </h2>
      </div>

      {/* Toggle centrado */}
      <div className="flex items-center justify-center">
        <button
          onClick={toggleSearchable}
          disabled={isAnimating}
          className={`
            relative w-20 h-10 rounded-full transition-all duration-300 ease-in-out
            ${isSearchable ? 'bg-green-500' : 'bg-gray-300'}
            ${isAnimating ? 'opacity-50' : 'hover:opacity-90'}
            focus:outline-none focus:ring-4 focus:ring-purple-300
          `}
        >
          <span
            className={`
              absolute top-1 left-1 w-8 h-8 bg-white rounded-full shadow-md
              transition-transform duration-300 ease-in-out
              flex items-center justify-center
              ${isSearchable ? 'translate-x-10' : 'translate-x-0'}
            `}
          >
            <Search className={`w-4 h-4 transition-colors duration-300 ${
              isSearchable ? 'text-green-500' : 'text-gray-400'
            }`} />
          </span>
        </button>
      </div>

      {/* Texto descriptivo centrado */}
      <p className="text-center text-sm text-gray-600 mt-4">
        {isSearchable 
          ? '✅ Tu perfil es visible en búsquedas de clientes' 
          : '🔒 Tu perfil está oculto de las búsquedas'}
      </p>
    </div>
  );
}

export default SearchableToggle;