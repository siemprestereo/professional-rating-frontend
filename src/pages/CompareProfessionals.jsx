import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Star, Home, ArrowLeft, Calendar, ChevronDown, ChevronUp, Trash2 } from 'lucide-react';
import LoadingScreen from '../components/LoadingScreen';
import Toast from '../components/Toast';

function CompareProfessionals() {
  const navigate = useNavigate();
  const location = useLocation();
  const backendUrl = 'https://professional-rating-backend-production.up.railway.app';
  
  const [professionals, setProfessionals] = useState([]);
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState(null);
  
  // Filtros
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [sortBy, setSortBy] = useState('rating-desc');
  const [showDateFilter, setShowDateFilter] = useState(false);
  
  // Estado para el trabajo seleccionado de cada profesional
  const [selectedWorks, setSelectedWorks] = useState({});

  useEffect(() => {
    if (!location.state?.professionals) {
      navigate('/saved-professionals');
      return;
    }
    
    setProfessionals(location.state.professionals);
    
    // Inicializar selectedWorks con "all" para cada profesional
    const initialWorks = {};
    location.state.professionals.forEach(prof => {
      initialWorks[prof.professionalId] = 'all';
    });
    setSelectedWorks(initialWorks);
  }, [location.state, navigate]);

  const applyFilters = async () => {
    if (!startDate || !endDate) {
      setToast({ type: 'warning', message: 'Seleccioná ambas fechas' });
      return;
    }

    setLoading(true);
    try {
      const token = localStorage.getItem('authToken');
      
      const response = await fetch(
        `${backendUrl}/api/clients/me/favorites?startDate=${startDate}&endDate=${endDate}`,
        {
          headers: { 'Authorization': `Bearer ${token}` }
        }
      );

      if (response.ok) {
        const allData = await response.json();
        const selectedIds = professionals.map(p => p.professionalId);
        const filtered = allData.filter(p => selectedIds.includes(p.professionalId));
        setProfessionals(filtered);
        setToast({ type: 'success', message: 'Filtros aplicados' });
      }
    } catch (error) {
      console.error('Error applying filters:', error);
      setToast({ type: 'error', message: 'Error al aplicar filtros' });
    } finally {
      setLoading(false);
    }
  };

  const clearFilters = async () => {
    setStartDate('');
    setEndDate('');
    
    // Recargar datos originales sin filtro
    try {
      const token = localStorage.getItem('authToken');
      
      const response = await fetch(
        `${backendUrl}/api/clients/me/favorites`,
        {
          headers: { 'Authorization': `Bearer ${token}` }
        }
      );

      if (response.ok) {
        const allData = await response.json();
        const selectedIds = professionals.map(p => p.professionalId);
        const filtered = allData.filter(p => selectedIds.includes(p.professionalId));
        setProfessionals(filtered);
        setToast({ type: 'success', message: 'Filtros limpiados' });
      }
    } catch (error) {
      console.error('Error clearing filters:', error);
    }
  };

  const handleWorkChange = (professionalId, workHistoryId) => {
    setSelectedWorks(prev => ({
      ...prev,
      [professionalId]: workHistoryId
    }));
  };

  const removeProfessional = (professionalId) => {
    const updated = professionals.filter(p => p.professionalId !== professionalId);
    
    if (updated.length === 0) {
      navigate('/saved-professionals');
      return;
    }
    
    setProfessionals(updated);
    setToast({ type: 'success', message: 'Profesional eliminado de la comparación' });
  };

  const getDisplayedStats = (prof) => {
    const selectedWork = selectedWorks[prof.professionalId];
    
    if (!selectedWork || selectedWork === 'all') {
      // Mostrar estadísticas generales
      return {
        avgScore: prof.reputationScore,
        totalRatings: prof.totalRatings
      };
    }
    
    // Buscar el trabajo específico
    const work = prof.workHistory?.find(w => w.id.toString() === selectedWork);
    
    if (work) {
      return {
        avgScore: work.avgScoreInPeriod,
        totalRatings: work.ratingsCountInPeriod
      };
    }
    
    return {
      avgScore: 0,
      totalRatings: 0
    };
  };

  const getSortedProfessionals = () => {
    const sorted = [...professionals];
    
    switch (sortBy) {
      case 'rating-desc':
        return sorted.sort((a, b) => {
          const statsA = getDisplayedStats(a);
          const statsB = getDisplayedStats(b);
          return statsB.avgScore - statsA.avgScore;
        });
      case 'rating-asc':
        return sorted.sort((a, b) => {
          const statsA = getDisplayedStats(a);
          const statsB = getDisplayedStats(b);
          return statsA.avgScore - statsB.avgScore;
        });
      case 'seniority':
        return sorted.sort((a, b) => {
          const dateA = new Date(a.savedAt);
          const dateB = new Date(b.savedAt);
          return dateA - dateB; // Más antiguo primero
        });
      default:
        return sorted;
    }
  };

  const renderStars = (score) => {
    return [...Array(5)].map((_, i) => (
      <Star
        key={i}
        className={`w-5 h-5 ${i < Math.round(score) ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'}`}
      />
    ));
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

  if (loading) {
    return <LoadingScreen message="Aplicando filtros..." />;
  }

  const sortedProfessionals = getSortedProfessionals();

  return (
    <div className="min-h-screen bg-gray-50 pb-24">
      {/* Header */}
      <div className="bg-gradient-to-br from-purple-500 to-pink-600 px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <button
            onClick={() => navigate('/saved-professionals')}
            className="flex items-center text-white mb-4 hover:opacity-80 transition-opacity"
          >
            <ArrowLeft className="w-5 h-5 mr-2" />
            Volver a la lista
          </button>
          <h1 className="text-3xl roboto-light text-white mb-2">
            Comparar Profesionales
          </h1>
          <p className="text-white/90">
            {professionals.length} {professionals.length === 1 ? 'profesional seleccionado' : 'profesionales seleccionados'}
          </p>
        </div>
      </div>

      {/* Contenido */}
      <div className="max-w-4xl mx-auto px-4 -mt-8 pb-4">
        
        {/* Ordenar por */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-4">
          <label className="block text-sm font-medium text-gray-600 mb-2">Ordenar por</label>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="w-full border-2 border-gray-200 rounded-xl px-3 py-2 focus:border-purple-500 focus:outline-none"
          >
            <option value="rating-desc">Calificación (mayor a menor)</option>
            <option value="rating-asc">Calificación (menor a mayor)</option>
            <option value="seniority">Antigüedad en la plataforma</option>
          </select>
        </div>

        {/* Filtro por período (colapsable) */}
        <div className="bg-white rounded-2xl shadow-lg mb-4">
          <button
            onClick={() => setShowDateFilter(!showDateFilter)}
            className="w-full p-6 flex items-center justify-between hover:bg-gray-50 transition-colors rounded-2xl"
          >
            <div className="flex items-center">
              <Calendar className="w-5 h-5 mr-2 text-purple-600" />
              <span className="text-lg roboto-light text-gray-800">Filtrar por período</span>
            </div>
            {showDateFilter ? (
              <ChevronUp className="w-5 h-5 text-gray-600" />
            ) : (
              <ChevronDown className="w-5 h-5 text-gray-600" />
            )}
          </button>

          {showDateFilter && (
            <div className="px-6 pb-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-600 mb-1">Desde</label>
                  <input
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="w-full border-2 border-gray-200 rounded-xl px-3 py-2 focus:border-purple-500 focus:outline-none"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-600 mb-1">Hasta</label>
                  <input
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="w-full border-2 border-gray-200 rounded-xl px-3 py-2 focus:border-purple-500 focus:outline-none"
                  />
                </div>
                
                <div className="flex items-end gap-2">
                  <button
                    onClick={applyFilters}
                    className="flex-1 bg-purple-600 text-white px-4 py-2 rounded-xl font-semibold hover:bg-purple-700 transition-all"
                  >
                    Aplicar
                  </button>
                  <button
                    onClick={clearFilters}
                    className="flex-1 bg-gray-200 text-gray-800 px-4 py-2 rounded-xl font-semibold hover:bg-gray-300 transition-all"
                  >
                    Limpiar
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Lista de profesionales */}
        <div className="space-y-3">
          {sortedProfessionals.map((prof) => {
            const stats = getDisplayedStats(prof);
            const hasMultipleWorks = prof.workHistory && prof.workHistory.length > 1;

            return (
              <div
                key={prof.professionalId}
                className="bg-white rounded-2xl shadow-lg p-6 hover:shadow-xl transition-all"
              >
                <div className="flex items-start gap-4">
                  {/* Avatar */}
                  <div className="w-20 h-20 bg-purple-100 rounded-full flex items-center justify-center text-3xl font-bold text-purple-600 flex-shrink-0">
                    {prof.professionalName.charAt(0)}
                  </div>

                  {/* Info */}
                  <div className="flex-1">
                    <h3 className="text-xl font-bold text-gray-800">
                      {prof.professionalName}
                    </h3>
                    <p className="text-purple-600 mb-3">
                      {translateProfession(prof.professionType)}
                    </p>

                    {/* Dropdown de trabajos */}
                    {hasMultipleWorks && (
                      <div className="mb-3">
                        <label className="block text-sm font-medium text-gray-600 mb-1">
                          📍 Lugar de trabajo
                        </label>
                        <div className="relative">
                          <select
                            value={selectedWorks[prof.professionalId] || 'all'}
                            onChange={(e) => handleWorkChange(prof.professionalId, e.target.value)}
                            className="w-full appearance-none border-2 border-gray-200 rounded-xl px-3 py-2 pr-10 focus:border-purple-500 focus:outline-none bg-white cursor-pointer text-sm"
                          >
                            <option value="all">Todos los trabajos</option>
                            {prof.workHistory.map((work) => (
                              <option key={work.id} value={work.id}>
                                {work.businessName} - {work.position}
                                {work.isActive ? ' (Actual)' : ' (Pasado)'}
                              </option>
                            ))}
                          </select>
                          <ChevronDown className="w-5 h-5 text-gray-400 absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none" />
                        </div>
                      </div>
                    )}

                    {/* Estadísticas */}
                    <div className="flex items-center gap-2 mt-2">
                      <div className="flex">
                        {renderStars(stats.avgScore || 0)}
                      </div>
                      <span className="text-lg font-bold text-gray-800">
                        {(stats.avgScore || 0).toFixed(1)}
                      </span>
                      <span className="text-sm text-gray-600">
                        ({stats.totalRatings || 0} calificaciones)
                      </span>
                    </div>

                    {prof.notes && (
                      <p className="text-sm text-gray-500 mt-2 italic">
                        📝 {prof.notes}
                      </p>
                    )}

                    {/* Botones */}
                    <div className="flex gap-2 mt-3">
                      <button
                        onClick={() => removeProfessional(prof.professionalId)}
                        className="bg-red-100 text-red-600 px-4 py-2 rounded-xl font-semibold hover:bg-red-200 transition-all text-sm flex items-center gap-2"
                      >
                        <Trash2 className="w-4 h-4" />
                        Eliminar de la lista
                      </button>
                      <button
                        onClick={() => navigate(`/public-cv/${prof.professionalId}`)}
                        className="bg-purple-100 text-purple-600 px-4 py-2 rounded-xl font-semibold hover:bg-purple-200 transition-all text-sm"
                      >
                        Ver CV
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Botón Home (centrado) */}
      <div className="fixed bottom-4 left-0 right-0 flex justify-center z-40">
        <button
          onClick={() => navigate('/client-dashboard')}
          className="w-14 h-14 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 rounded-full flex items-center justify-center transition-all hover:scale-110 shadow-2xl border-4 border-white"
        >
          <Home className="w-7 h-7 text-white" />
        </button>
      </div>

      {/* Toast */}
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}
    </div>
  );
}

export default CompareProfessionals;