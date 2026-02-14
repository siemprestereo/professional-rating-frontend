import { useState, useEffect, useMemo, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Home, ArrowLeft, Calendar, ChevronDown, ChevronUp, Trash2, Eye, Award } from 'lucide-react';
import LoadingScreen from '../components/LoadingScreen';
import Toast from '../components/Toast';
import { getProfessionalBadge } from '../utils/professionalBadge';
import { translateProfession, RenderStars } from '../utils/professionalUtils';

function CompareProfessionals() {
  const navigate = useNavigate();
  const location = useLocation();
  const backendUrl = 'https://professional-rating-backend-production.up.railway.app';
  
  const [professionals, setProfessionals] = useState([]);
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState(null);
  
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [sortBy, setSortBy] = useState('top-seniority'); // Default: El nuevo criterio combinado
  const [showDateFilter, setShowDateFilter] = useState(false);
  const [quickFilter, setQuickFilter] = useState('');
  
  const [selectedWorks, setSelectedWorks] = useState({});

  useEffect(() => {
    if (!location.state?.professionals) {
      navigate('/saved-professionals');
      return;
    }
    setProfessionals(location.state.professionals);
    
    const initialWorks = {};
    location.state.professionals.forEach(prof => {
      initialWorks[prof.professionalId] = 'all';
    });
    setSelectedWorks(initialWorks);
  }, [location.state, navigate]);

  // ... (handleQuickFilterChange, applyFilters, clearFilters se mantienen igual que en tu original)
  const handleQuickFilterChange = (filterType) => {
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
      default: break;
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
      const response = await fetch(`${backendUrl}/api/clients/me/favorites?startDate=${startDate}&endDate=${endDate}`, {
          headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.ok) {
        const allData = await response.json();
        const selectedIds = professionals.map(p => p.professionalId);
        const filtered = allData.filter(p => selectedIds.includes(p.professionalId));
        setProfessionals(filtered);
        setToast({ type: 'success', message: 'Filtros aplicados' });
      }
    } catch (error) {
      setToast({ type: 'error', message: 'Error al filtrar' });
    } finally { setLoading(false); }
  };

  const clearFilters = async () => {
    setStartDate(''); setEndDate(''); setQuickFilter('');
    try {
      const token = localStorage.getItem('authToken');
      const response = await fetch(`${backendUrl}/api/clients/me/favorites`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.ok) {
        const allData = await response.json();
        const selectedIds = professionals.map(p => p.professionalId);
        const filtered = allData.filter(p => selectedIds.includes(p.professionalId));
        setProfessionals(filtered);
      }
    } catch (error) { console.error(error); }
  };

  const handleWorkChange = (professionalId, workHistoryId) => {
    setSelectedWorks(prev => ({ ...prev, [professionalId]: workHistoryId }));
  };

  const removeProfessional = (professionalId) => {
    const updated = professionals.filter(p => p.professionalId !== professionalId);
    if (updated.length === 0) { navigate('/saved-professionals'); return; }
    setProfessionals(updated);
  };

  const getDisplayedStats = (prof) => {
    const selectedWork = selectedWorks[prof.professionalId];
    if (!selectedWork || selectedWork === 'all') {
      return { avgScore: prof.reputationScore, totalRatings: prof.totalRatings };
    }
    const work = prof.workHistory?.find(w => w.id.toString() === selectedWork);
    return work ? { avgScore: work.avgScoreInPeriod, totalRatings: work.ratingsCountInPeriod } : { avgScore: 0, totalRatings: 0 };
  };

  const getSortedProfessionals = () => {
    const sorted = [...professionals];
    switch (sortBy) {
      case 'rating-desc':
        return sorted.sort((a, b) => getDisplayedStats(b).avgScore - getDisplayedStats(a).avgScore);
      case 'rating-asc':
        return sorted.sort((a, b) => getDisplayedStats(a).avgScore - getDisplayedStats(b).avgScore);
      case 'total-ratings':
        return sorted.sort((a, b) => getDisplayedStats(b).totalRatings - getDisplayedStats(a).totalRatings);
      case 'seniority':
        // Antigüedad real en la plataforma (createdAt)
        return sorted.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
      case 'top-seniority':
        // Criterio Combinado: Año de ingreso + Mejor Promedio
        return sorted.sort((a, b) => {
          const yearA = new Date(a.createdAt).getFullYear();
          const yearB = new Date(b.createdAt).getFullYear();
          if (yearA === yearB) {
            return getDisplayedStats(b).avgScore - getDisplayedStats(a).avgScore;
          }
          return yearA - yearB;
        });
      default:
        return sorted;
    }
  };

  if (loading) return <LoadingScreen message="Actualizando ranking..." />;

  const sortedProfessionals = getSortedProfessionals();

  return (
    <div className="min-h-screen bg-gray-50 pb-24">
      {/* Header Estilo Ranking */}
      <div className="bg-gradient-to-br from-indigo-600 to-purple-700 px-4 py-10">
        <div className="max-w-4xl mx-auto text-center">
          <button
            onClick={() => navigate('/saved-professionals')}
            className="flex items-center text-white/80 mb-6 hover:text-white transition-colors"
          >
            <ArrowLeft className="w-5 h-5 mr-2" />
            Volver a guardados
          </button>
          <h1 className="text-3xl font-bold text-white mb-2">
            Comparativa de Profesionales
          </h1>
          <p className="text-indigo-100">
            Analizando tus {professionals.length} mejores opciones
          </p>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 -mt-8">
        {/* Selector de Criterio */}
        <div className="bg-white rounded-2xl shadow-xl p-6 mb-6 border border-indigo-50">
          <label className="block text-xs font-bold text-indigo-500 uppercase tracking-wider mb-3">
            Priorizar por:
          </label>
          <div className="relative">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="w-full appearance-none bg-gray-50 border-2 border-gray-100 rounded-xl px-4 py-3 focus:border-indigo-500 focus:outline-none font-semibold text-gray-700"
            >
              <option value="top-seniority">🏆 Trayectoria y Mejor Promedio</option>
              <option value="rating-desc">⭐ Calificación (Mayor a menor)</option>
              <option value="total-ratings">📊 Más Calificaciones</option>
              <option value="seniority">📅 Más antiguos en la plataforma</option>
              <option value="rating-asc">📉 Calificación (Menor a mayor)</option>
            </select>
            <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
          </div>
        </div>

        {/* Lista de Profesionales */}
        <div className="space-y-4">
          {sortedProfessionals.map((prof, index) => {
            const stats = getDisplayedStats(prof);
            const badge = getProfessionalBadge(stats.totalRatings);
            const isFirst = index === 0 && sortBy === 'top-seniority';

            return (
              <div
                key={prof.professionalId}
                className={`bg-white rounded-2xl shadow-md p-5 border-2 transition-all ${
                  isFirst ? 'border-yellow-400 scale-[1.02]' : 'border-transparent'
                }`}
              >
                <div className="flex items-start gap-4">
                  {/* Numero de Ranking */}
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm ${
                    isFirst ? 'bg-yellow-400 text-white' : 'bg-gray-100 text-gray-400'
                  }`}>
                    {index + 1}
                  </div>

                  {/* Avatar */}
                  <div className="w-16 h-16 bg-indigo-50 rounded-2xl flex items-center justify-center text-2xl font-bold text-indigo-600 flex-shrink-0">
                    {prof.professionalName.charAt(0)}
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="text-lg font-bold text-gray-900 truncate">
                          {prof.professionalName}
                        </h3>
                        <p className="text-sm text-indigo-600 font-medium">
                          {translateProfession(prof.professionType)}
                        </p>
                      </div>
                      
                      {/* Badge Antigüedad */}
                      <div className="text-[10px] text-gray-400 font-bold uppercase bg-gray-50 px-2 py-1 rounded">
                        En Calificalo desde {new Date(prof.createdAt).getFullYear()}
                      </div>
                    </div>

                    <div className="mt-2 flex flex-wrap items-center gap-3">
                      <div className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-bold ${badge.bgColor} ${badge.borderColor} border`}>
                        <span>{badge.emoji}</span>
                        <span className={badge.color}>{badge.name}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <RenderStars score={stats.avgScore} size="w-4 h-4" />
                        <span className="text-sm font-bold text-gray-700">
                          {stats.avgScore.toFixed(1)}
                        </span>
                        <span className="text-xs text-gray-400">
                          ({stats.totalRatings} opiniones)
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Acciones */}
                  <div className="flex flex-col gap-2">
                    <button
                      onClick={() => navigate(`/public-cv/${prof.professionalId}`)}
                      className="p-2 text-indigo-600 hover:bg-indigo-50 rounded-xl transition-colors"
                      title="Ver Perfil"
                    >
                      <Eye className="w-5 h-5" />
                    </button>
                    <button
                      onClick={() => removeProfessional(prof.professionalId)}
                      className="p-2 text-red-400 hover:bg-red-50 rounded-xl transition-colors"
                      title="Quitar de la lista"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Footer Nav */}
      <div className="fixed bottom-6 left-0 right-0 flex justify-center pointer-events-none">
        <button
          onClick={() => navigate('/client-dashboard')}
          className="w-14 h-14 bg-gray-900 text-white rounded-full flex items-center justify-center shadow-2xl pointer-events-auto hover:scale-110 transition-transform border-4 border-white"
        >
          <Home className="w-6 h-6" />
        </button>
      </div>

      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
    </div>
  );
}

export default CompareProfessionals;