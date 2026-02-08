import { useState, useEffect, useMemo, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Home, ArrowLeft, Calendar, ChevronDown, ChevronUp, Trash2, Eye } from 'lucide-react';
import LoadingScreen from '../components/LoadingScreen';
import Toast from '../components/Toast';
import { getProfessionalBadge, getAdjustedScore } from '../utils/professionalBadge';
import { translateProfession, renderStars } from '../utils/professionalUtils';

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
  const [sortBy, setSortBy] = useState('rating-adjusted-desc');
  const [showDateFilter, setShowDateFilter] = useState(false);
  const [quickFilter, setQuickFilter] = useState(''); // 'last30', 'last3m', 'last6m', ''
  
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

  const handleQuickFilterChange = (filterType) => {
    // Si ya está seleccionado, deseleccionar
    if (quickFilter === filterType) {
      setQuickFilter('');
      setStartDate('');
      setEndDate('');
      return;
    }

    setQuickFilter(filterType);
    
    const today = new Date();
    const endDateStr = today.toISOString().split('T')[0];
    let startDateStr = '';

    switch (filterType) {
      case 'last30':
        const date30 = new Date(today);
        date30.setDate(date30.getDate() - 30);
        startDateStr = date30.toISOString().split('T')[0];
        break;
      case 'last3m':
        const date3m = new Date(today);
        date3m.setMonth(date3m.getMonth() - 3);
        startDateStr = date3m.toISOString().split('T')[0];
        break;
      case 'last6m':
        const date6m = new Date(today);
        date6m.setMonth(date6m.getMonth() - 6);
        startDateStr = date6m.toISOString().split('T')[0];
        break;
      default:
        break;
    }

    setStartDate(startDateStr);
    setEndDate(endDateStr);
  };

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
    setQuickFilter('');
    
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
        // Promedio simple (mayor a menor)
        return sorted.sort((a, b) => {
          const statsA = getDisplayedStats(a);
          const statsB = getDisplayedStats(b);
          return statsB.avgScore - statsA.avgScore;
        });
      case 'rating-asc':
        // Promedio simple (menor a mayor)
        return sorted.sort((a, b) => {
          const statsA = getDisplayedStats(a);
          const statsB = getDisplayedStats(b);
          return statsA.avgScore - statsB.avgScore;
        });
      case 'rating-adjusted-desc':
        // Score bayesiano (mayor a menor) - RECOMENDADO
        return sorted.sort((a, b) => {
          const statsA = getDisplayedStats(a);
          const statsB = getDisplayedStats(b);
          const adjustedA = getAdjustedScore(statsA.avgScore, statsA.totalRatings);
          const adjustedB = getAdjustedScore(statsB.avgScore, statsB.totalRatings);
          return adjustedB - adjustedA;
        });
      case 'rating-adjusted-asc':
        // Score bayesiano (menor a mayor)
        return sorted.sort((a, b) => {
          const statsA = getDisplayedStats(a);
          const statsB = getDisplayedStats(b);
          const adjustedA = getAdjustedScore(statsA.avgScore, statsA.totalRatings);
          const adjustedB = getAdjustedScore(statsB.avgScore, statsB.totalRatings);
          return adjustedA - adjustedB;
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
            <option value="rating-adjusted-desc">Calificación ajustada (mayor a menor) ⭐ Recomendado</option>
            <option value="rating-adjusted-asc">Calificación ajustada (menor a mayor)</option>
            <option value="rating-desc">Calificación promedio (mayor a menor)</option>
            <option value="rating-asc">Calificación promedio (menor a mayor)</option>
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
              {/* Filtros rápidos */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-600 mb-2">Filtros rápidos</label>
                <div className="flex flex-wrap gap-2">
                  <button
                    onClick={() => handleQuickFilterChange('last30')}
                    className={`px-4 py-2 rounded-xl font-semibold text-sm transition-all ${
                      quickFilter === 'last30'
                        ? 'bg-purple-600 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    Últimos 30 días
                  </button>
                  <button
                    onClick={() => handleQuickFilterChange('last3m')}
                    className={`px-4 py-2 rounded-xl font-semibold text-sm transition-all ${
                      quickFilter === 'last3m'
                        ? 'bg-purple-600 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    Últimos 3 meses
                  </button>
                  <button
                    onClick={() => handleQuickFilterChange('last6m')}
                    className={`px-4 py-2 rounded-xl font-semibold text-sm transition-all ${
                      quickFilter === 'last6m'
                        ? 'bg-purple-600 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    Últimos 6 meses
                  </button>
                </div>
              </div>

              {/* Selectores de fecha */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-600 mb-1">Desde</label>
                  <input
                    type="date"
                    value={startDate}
                    onChange={(e) => {
                      setStartDate(e.target.value);
                      setQuickFilter(''); // Limpiar filtro rápido si se modifica manualmente
                    }}
                    className="w-full border-2 border-gray-200 rounded-xl px-3 py-2 focus:border-purple-500 focus:outline-none"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-600 mb-1">Hasta</label>
                  <input
                    type="date"
                    value={endDate}
                    onChange={(e) => {
                      setEndDate(e.target.value);
                      setQuickFilter(''); // Limpiar filtro rápido si se modifica manualmente
                    }}
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
            const badge = getProfessionalBadge(stats.totalRatings);

            return (
              <div
                key={prof.professionalId}
                className="bg-white rounded-2xl shadow-lg p-4 hover:shadow-xl transition-all overflow-hidden"
              >
                <div className="flex items-start gap-3">
                  {/* Avatar */}
                  <div className="w-14 h-14 bg-purple-100 rounded-full flex items-center justify-center text-xl font-bold text-purple-600 flex-shrink-0">
                    {prof.professionalName.charAt(0)}
                  </div>

                  {/* Info central */}
                  <div className="flex-1 min-w-0">
                    <h3 className="text-base font-bold text-gray-800 break-words">
                      {prof.professionalName}
                    </h3>
                    <p className="text-sm text-purple-600 mb-1 break-words">
                      {translateProfession(prof.professionType)}
                    </p>

                    {/* Medalla */}
                    <div className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold mb-1 ${badge.bgColor} ${badge.borderColor} border`}>
                      <span className="text-sm">{badge.emoji}</span>
                      <span className={badge.color}>{badge.name}</span>
                    </div>

                    {/* Dropdown de trabajos */}
                    {hasMultipleWorks && (
                      <div className="mb-2">
                        <div className="relative">
                          <select
                            value={selectedWorks[prof.professionalId] || 'all'}
                            onChange={(e) => handleWorkChange(prof.professionalId, e.target.value)}
                            className="w-full appearance-none border-2 border-gray-200 rounded-xl px-3 py-1.5 pr-8 focus:border-purple-500 focus:outline-none bg-white cursor-pointer text-xs"
                          >
                            <option value="all">📍 Todos los trabajos</option>
                            {prof.workHistory.map((work) => (
                              <option key={work.id} value={work.id}>
                                {work.businessName} - {work.position}
                                {work.isActive ? ' (Actual)' : ''}
                              </option>
                            ))}
                          </select>
                          <ChevronDown className="w-4 h-4 text-gray-400 absolute right-2 top-1/2 transform -translate-y-1/2 pointer-events-none" />
                        </div>
                      </div>
                    )}

                    {/* Estrellas - última línea */}
                    <div className="flex items-center gap-2 flex-wrap">
                      <div className="flex flex-shrink-0">
                        {renderStars(stats.avgScore || 0, 'w-4 h-4')}
                      </div>
                      <span className="text-xs text-gray-600">
                        {(stats.avgScore || 0).toFixed(1)} ({stats.totalRatings || 0})
                      </span>
                    </div>

                    {/* Notas (si existen) */}
                    {prof.notes && (
                      <div className="mt-2">
                        <p className="text-sm text-gray-500 italic break-words">
                          📝 {prof.notes}
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Botones de acción - AL LADO DERECHO */}
                  <div className="flex flex-col gap-2 flex-shrink-0">
                    <button
                      onClick={() => navigate(`/public-cv/${prof.professionalId}`)}
                      className="bg-purple-100 text-purple-600 px-3 py-2 rounded-xl hover:bg-purple-200 transition-all text-xs font-semibold flex items-center gap-1 whitespace-nowrap"
                    >
                      <Eye className="w-4 h-4" />
                      Ver CV
                    </button>
                    <button
                      onClick={() => removeProfessional(prof.professionalId)}
                      className="bg-red-100 text-red-600 px-3 py-2 rounded-xl hover:bg-red-200 transition-all text-xs font-semibold flex items-center gap-1 whitespace-nowrap"
                    >
                      <Trash2 className="w-4 h-4" />
                      Quitar
                    </button>
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