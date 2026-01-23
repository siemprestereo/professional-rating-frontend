import { useState, useEffect } from 'react';
import { Search, Loader2 } from 'lucide-react';

function SearchableToggle() {
  const backendUrl = 'https://professional-rating-backend-production.up.railway.app';
  const [searchable, setSearchable] = useState(false);
  const [loading, setLoading] = useState(true);
  const [toggling, setToggling] = useState(false);

  useEffect(() => {
    loadSearchableStatus();
  }, []);

  const loadSearchableStatus = async () => {
    try {
      const token = localStorage.getItem('authToken');
      const response = await fetch(`${backendUrl}/api/professionals/searchable-status`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setSearchable(data.searchable);
      }
    } catch (error) {
      console.error('Error loading searchable status:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleToggle = async () => {
    setToggling(true);
    try {
      const token = localStorage.getItem('authToken');
      const response = await fetch(`${backendUrl}/api/professionals/toggle-searchable`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setSearchable(data.searchable);
      }
    } catch (error) {
      console.error('Error toggling searchable:', error);
    } finally {
      setToggling(false);
    }
  };

  if (loading) {
    return (
      <div className="bg-white rounded-2xl shadow-lg p-6 mb-4 animate-slideUp">
        <div className="flex justify-center py-4">
          <Loader2 className="w-6 h-6 text-blue-600 animate-spin" />
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl shadow-lg p-6 mb-4 animate-slideUp">
      <div className="flex items-start">
        <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mr-4 flex-shrink-0">
          <Search className="w-6 h-6 text-blue-600" />
        </div>
        
        <div className="flex-1">
          <h3 className="text-lg roboto-light text-gray-800 mb-2">
            ¿Estás buscando trabajo?
          </h3>
          <p className="text-sm text-gray-600 mb-4">
            {searchable 
              ? 'Tu perfil está visible en el buscador. Los clientes pueden encontrarte y contactarte.'
              : 'Habilitá tu aparición en el buscador para que más clientes puedan encontrarte y contactarte.'
            }
          </p>
          
          <div className="flex items-center justify-between bg-gray-50 rounded-xl p-3">
            <span className="text-sm font-semibold text-gray-700">
              Visible en búsquedas
            </span>
            
            <button 
              onClick={handleToggle}
              disabled={toggling}
              className={`relative w-14 h-7 rounded-full transition-all duration-300 ${
                toggling ? 'opacity-50 cursor-not-allowed' : ''
              } ${
                searchable ? 'bg-green-500' : 'bg-gray-300'
              }`}
            >
              <div className={`absolute top-1 w-5 h-5 bg-white rounded-full shadow-md transition-transform duration-300 ${
                searchable ? 'translate-x-8' : 'translate-x-1'
              }`} />
            </button>
          </div>

          {searchable && (
            <div className="mt-3 flex items-center gap-2 text-xs text-green-600 bg-green-50 px-3 py-2 rounded-lg animate-fadeIn">
              <span className="font-semibold">✓</span>
              <span>Tu perfil aparece en todos los resultados de búsqueda</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default SearchableToggle;