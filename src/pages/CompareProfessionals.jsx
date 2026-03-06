import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Home, ArrowLeft, Calendar, ChevronDown, ChevronUp, Trash2, Eye, MapPin } from 'lucide-react';
import LoadingScreen from '../components/LoadingScreen';
import Toast from '../components/Toast';
import { getProfessionalBadge } from '../utils/professionalBadge';
import { translateProfession, RenderStars } from '../utils/professionalUtils';
import { BACKEND_URL } from '../config';

function CompareProfessionals() {
  const navigate = useNavigate();
  const location = useLocation();
  const [professionals, setProfessionals] = useState([]);
  const [allProfessionals, setAllProfessionals] = useState([]);
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState(null);

  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [sortBy, setSortBy] = useState('top-seniority');
  const [showDateFilter, setShowDateFilter] = useState(false);
  const [showZonaFilter, setShowZonaFilter] = useState(false);
  const [quickFilter, setQuickFilter] = useState('');

  const [zonaFilter, setZonaFilter] = useState([]);
  const [selectedWorks, setSelectedWorks] = useState({});

  useEffect(() => {
    if (!location.state?.professionals) {
      navigate('/saved-professionals');
      return;
    }
    setProfessionals(location.state.professionals);
    setAllProfessionals(location.state.professionals);

    const initialWorks = {};
    location.state.professionals.forEach(prof => {
      initialWorks[prof.professionalId] = 'all';
    });
    setSelectedWorks(initialWorks);
  }, [location.state, navigate]);

  const allZones = [...new Map(
    allProfessionals
      .flatMap(p => p.zones || [])
      .map(z => [`${z.zona}-${z.provincia}`, z])
  ).values()];

  useEffect(() => {
    if (zonaFilter.length === 0) {
      setProfessionals(allProfessionals);
    } else {
      const filtered = allProfessionals.filter(p =>
        (p.zones || []).some(z =>
          zonaFilter.includes(`${z.zona}, ${z.provincia}`)
        )
      );
      setProfessionals(filtered);
    }
  }, [zonaFilter, allProfessionals]);

  const handleSortChange = (e) => {
    const newSort = e.target.value;
    setSortBy(newSort);
    setToast({ type: 'success', message: `Lista ordenada por ${e.target.options[e.target.selectedIndex].text}` });
  };

  const handleQuickFilterChange = async (filterType) => {
    let sDate = '';
    let eDate = '';

    if (quickFilter === filterType) {
      setQuickFilter('');
      setStartDate('');
      setEndDate('');
      await clearFilters();
      return;
    }

    setQuickFilter(filterType);
    const today = new Date();
    eDate = today.toISOString().split('T')[0];

    switch (filterType) {
      case 'last30':
        const d30 = new Date(today); d30.setDate(d30.getDate() - 30);
        sDate = d30.toISOString().split('T')[0]; break;
      case 'last3m':
        const d3m = new Date(today); d3m.setMonth(d3m.getMonth() - 3);
        sDate = d3m.toISOString().split('T')[0]; break;
      case 'last6m':
        const d6m = new Date(today); d6m.setMonth(d6m.getMonth() - 6);
        sDate = d6m.toISOString().split('T')[0]; break;
      case 'last12m':
        const d12m = new Date(today); d12m.setFullYear(d12m.getFullYear() - 1);
        sDate = d12m.toISOString().split('T')[0]; break;
      default: break;
    }

    setStartDate(sDate);
    setEndDate(eDate);
    applyQuickFilters(sDate, eDate);
  };

  const applyQuickFilters = async (sDate, eDate) => {
    setLoading(true);
    try {
      const token = localStorage.getItem('authToken');
      const response = await fetch(
        `${BACKEND_URL}/api/clients/me/favorites?startDate=${sDate}&endDate=${eDate}`,
        { headers: { 'Authorization': `Bearer ${token}` } }
      );
      if (response.ok) {
        const allData = await response.json();
        const selectedIds = allProfessionals.map(p => p.professionalId);
        const filtered = allData.filter(p => selectedIds.includes(p.professionalId));
        setAllProfessionals(filtered);
        setToast({ type: 'success', message: 'Filtro temporal aplicado' });
      }
    } catch (error) {
      setToast({ type: 'error', message: 'Error al aplicar filtros' });
    } finally {
      setLoading(false);
    }
  };

  const clearFilters = async () => {
    setStartDate(''); setEndDate(''); setQuickFilter('');
    try {
      const token = localStorage.getItem('authToken');
      const response = await fetch(`${BACKEND_URL}/api/clients/me/favorites`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.ok) {
        const allData = await response.json();
        const selectedIds = allProfessionals.map(p => p.professionalId);
        const filtered = allData.filter(p => selectedIds.includes(p.professionalId));
        setAllProfessionals(filtered);
        setToast({ type: 'success', message: 'Filtros de tiempo eliminados' });
      }
    } catch (error) {
      console.error(error);
    }
  };

  const handleWorkChange = (professionalId, workHistoryId) => {
    setSelectedWorks(prev => ({ ...prev, [professionalId]: workHistoryId }));
  };

  const removeProfessional = (professionalId) => {
    const updatedAll = allProfessionals.filter(p => p.professionalId !== professionalId);
    if (updatedAll.length === 0) { navigate('/saved-professionals'); return; }
    setAllProfessionals(updatedAll);
    setToast({ type: 'success', message: 'Profesional quitado de la lista' });
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
      case 'rating-desc': return sorted.sort((a, b) => getDisplayedStats(b).avgScore - getDisplayedStats(a).avgScore);
      case 'rating-asc': return sorted.sort((a, b) => getDisplayedStats(a).avgScore - getDisplayedStats(b).avgScore);
      case 'total-ratings': return sorted.sort((a, b) => getDisplayedStats(b).totalRatings - getDisplayedStats(a).totalRatings);
      case 'seniority': return sorted.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
      case 'top-seniority': return sorted.sort((a, b) => {
        const yearA = new Date(a.createdAt).getFullYear();
        const yearB = new Date(b.createdAt).getFullYear();
        if (yearA === yearB) return getDisplayedStats(b).avgScore - getDisplayedStats(a).avgScore;
        return yearA - yearB;
      });
      default: return sorted;
    }
  };

  if (loading) return <LoadingScreen message="Actualizando datos..." />;

  const sortedProfessionals = getSortedProfessionals();

  return (
    <div className="min-h-screen bg-gray-50 pb-24">
      {/* Header */}
      <div className="bg-gradient-to-br from-purple-500 to-pink-600 px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <button onClick={() => navigate('/saved-professionals')} className="flex items-center text-white mb-4 hover:opacity-80 transition-opacity">
            <ArrowLeft className="w-5 h-5 mr-2" /> Volver a la lista
          </button>
          <h1 className="text-3xl roboto-light text-white mb-2">Comparar Profesionales</h1>
          <p className="text-white/90">
            {sortedProfessionals.length} de {allProfessionals.length} {allProfessionals.length === 1 ? 'profesional' : 'profesionales'}
            {zonaFilter.length > 0 && ` · ${zonaFilter.length} ${zonaFilter.length === 1 ? 'zona' : 'zonas'} seleccionadas`}
          </p>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 -mt-8 pb-4">

        {/* Ordenar por */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-4">
          <label className="block text-sm font-medium text-gray-600 mb-2">Ordenar por</label>
          <select
            value={sortBy}
            onChange={handleSortChange}
            className="w-full border-2 border-gray-200 rounded-xl px-3 py-2 focus:border-purple-500 focus:outline-none"
          >
            <option value="top-seniority">Trayectoria y Mejor Promedio ⭐</option>
            <option value="rating-desc">Calificación promedio (mayor a menor)</option>
            <option value="rating-asc">Calificación promedio (menor a mayor)</option>
            <option value="total-ratings">Cantidad de calificaciones</option>
            <option value="seniority">Más antiguos en la plataforma</option>
          </select>
        </div>

        {/* Filtro por zona — fuelle */}
        {allZones.length > 0 && (
          <div className="bg-white rounded-2xl shadow-lg mb-4">
            <button
              onClick={() => setShowZonaFilter(!showZonaFilter)}
              className="w-full p-6 flex items-center justify-between hover:bg-gray-50 transition-colors rounded-2xl"
            >
              <div className="flex items-center gap-2">
                <MapPin className="w-5 h-5 text-purple-600" />
                <div className="text-left">
                  <span className="text-lg roboto-light text-gray-800 block">Filtrar por zona de trabajo</span>
                  <span className="text-xs text-gray-400">
                    {zonaFilter.length === 0
                      ? 'Podés seleccionar más de una zona'
                      : `${zonaFilter.length} ${zonaFilter.length === 1 ? 'zona seleccionada' : 'zonas seleccionadas'}`}
                  </span>
                </div>
              </div>
              {showZonaFilter
                ? <ChevronUp className="w-5 h-5 text-gray-600 flex-shrink-0" />
                : <ChevronDown className="w-5 h-5 text-gray-600 flex-shrink-0" />}
            </button>

            {showZonaFilter && (
              <div className="px-6 pb-6">
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => setZonaFilter([])}
                    className={`col-span-2 py-2.5 rounded-xl text-sm font-semibold transition-all text-center ${zonaFilter.length === 0
                      ? 'bg-purple-600 text-white shadow-md'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                      }`}
                  >
                    Todas las áreas
                  </button>

                  {allZones.map((zone, i) => {
                    const key = `${zone.zona}, ${zone.provincia}`;
                    const isActive = zonaFilter.includes(key);
                    const isCaba = zone.zona === 'Ciudad Autónoma de Buenos Aires';
                    return (
                      <button
                        key={i}
                        onClick={() => {
                          if (isActive) {
                            setZonaFilter(zonaFilter.filter(z => z !== key));
                          } else {
                            setZonaFilter([...zonaFilter, key]);
                          }
                        }}
                        className={`py-2.5 px-3 rounded-xl text-sm font-semibold transition-all text-center leading-tight ${isActive
                          ? 'bg-purple-600 text-white shadow-md'
                          : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                          }`}
                      >
                        📍 {isCaba ? 'CABA' : zone.zona}
                        {!isCaba && (
                          <span className="block text-xs font-normal opacity-75">{zone.provincia}</span>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Filtro por período */}
        <div className="bg-white rounded-2xl shadow-lg mb-4">
          <button onClick={() => setShowDateFilter(!showDateFilter)} className="w-full p-6 flex items-center justify-between hover:bg-gray-50 transition-colors rounded-2xl">
            <div className="flex items-center">
              <Calendar className="w-5 h-5 mr-2 text-purple-600 flex-shrink-0" />
              <div className="text-left">
                <span className="text-lg roboto-light text-gray-800 block">Filtrar por período</span>
                <span className="text-xs text-gray-400">Solo calificaciones recibidas en el período elegido</span>
              </div>
            </div>
            {showDateFilter ? <ChevronUp className="w-5 h-5 text-gray-600" /> : <ChevronDown className="w-5 h-5 text-gray-600" />}
          </button>

          {showDateFilter && (
            <div className="px-6 pb-6 text-center">
              <div className="flex flex-wrap gap-2 justify-center">
                {[
                  { id: 'last30', label: '30 días' },
                  { id: 'last3m', label: '3 meses' },
                  { id: 'last6m', label: '6 meses' },
                  { id: 'last12m', label: '12 meses' }
                ].map((f) => (
                  <button
                    key={f.id}
                    onClick={() => handleQuickFilterChange(f.id)}
                    className={`px-6 py-2 rounded-xl font-semibold text-sm transition-all ${quickFilter === f.id ? 'bg-purple-600 text-white shadow-md' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                  >
                    {f.label}
                  </button>
                ))}
              </div>
              {quickFilter && (
                <button onClick={clearFilters} className="mt-4 text-sm text-purple-600 font-bold hover:underline">
                  Quitar filtro de tiempo
                </button>
              )}
            </div>
          )}
        </div>

        {/* Sin resultados tras filtrar */}
        {sortedProfessionals.length === 0 && (
          <div className="bg-white rounded-2xl shadow-lg p-8 text-center mb-4">
            <MapPin className="w-12 h-12 text-gray-200 mx-auto mb-3" />
            <p className="text-gray-600 font-semibold mb-1">Sin resultados</p>
            <p className="text-gray-400 text-sm mb-3">
              Ningún profesional trabaja en {zonaFilter.join(' o ')}
            </p>
            <button onClick={() => setZonaFilter([])} className="text-purple-600 font-semibold text-sm hover:underline">
              Ver todos
            </button>
          </div>
        )}

        {/* Lista de profesionales */}
        <div className="space-y-3">
          {sortedProfessionals.map((prof) => {
            const stats = getDisplayedStats(prof);
            const hasMultipleWorks = prof.workHistory && prof.workHistory.length > 1;
            const badge = getProfessionalBadge(stats.totalRatings);
            const zones = prof.zones || [];

            return (
              <div key={prof.professionalId} className="bg-white rounded-2xl shadow-lg p-4 hover:shadow-xl transition-all overflow-hidden border border-transparent">
                <div className="flex items-start gap-3">
                  <div className="w-14 h-14 bg-purple-100 rounded-full flex items-center justify-center text-xl font-bold text-purple-600 flex-shrink-0">
                    {prof.professionalName.charAt(0)}
                  </div>

                  <div className="flex-1 min-w-0">
                    <h3 className="text-base font-bold text-gray-800 break-words">{prof.professionalName}</h3>
                    <p className="text-sm text-purple-600 mb-1 break-words">{translateProfession(prof.professionType)}</p>

                    <div className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold mb-2 ${badge.bgColor} ${badge.borderColor} border`}>
                      <span className="text-sm">{badge.emoji}</span>
                      <span className={badge.color}>{badge.name}</span>
                    </div>

                    {/* Zonas — resalta las activas en el filtro */}
                    {zones.length > 0 && (
                      <div className="flex flex-wrap gap-1 mb-2">
                        {zones.slice(0, 3).map(zone => {
                          const isFiltered = zonaFilter.includes(`${zone.zona}, ${zone.provincia}`);
                          return (
                            <span
                              key={zone.id}
                              className={`text-xs px-2 py-0.5 rounded-full border font-medium transition-all ${isFiltered
                                ? 'bg-purple-600 text-white border-purple-600'
                                : 'bg-purple-50 border-purple-200 text-purple-700'
                                }`}
                            >
                              📍 {zone.zona}
                            </span>
                          );
                        })}
                        {zones.length > 3 && (
                          <span className="bg-gray-100 text-gray-500 text-xs px-2 py-0.5 rounded-full">
                            +{zones.length - 3} más
                          </span>
                        )}
                      </div>
                    )}

                    {hasMultipleWorks && (
                      <div className="mb-2 relative">
                        <select
                          value={selectedWorks[prof.professionalId] || 'all'}
                          onChange={(e) => handleWorkChange(prof.professionalId, e.target.value)}
                          className="w-full appearance-none border-2 border-gray-200 rounded-xl px-3 py-1.5 pr-8 focus:border-purple-500 focus:outline-none bg-white cursor-pointer text-xs"
                        >
                          <option value="all">📍 Todos los trabajos</option>
                          {prof.workHistory.map((work) => (
                            <option key={work.id} value={work.id}>
                              {work.businessName} - {work.position}
                            </option>
                          ))}
                        </select>
                        <ChevronDown className="w-4 h-4 text-gray-400 absolute right-2 top-1/2 transform -translate-y-1/2 pointer-events-none" />
                      </div>
                    )}

                    <div className="flex items-center gap-2 flex-wrap">
                      <RenderStars score={stats.avgScore || 0} size="w-4 h-4" />
                      <span className="text-xs text-gray-600">{(stats.avgScore || 0).toFixed(1)} ({stats.totalRatings || 0})</span>
                    </div>

                    {prof.notes && (
                      <p className="text-sm text-gray-500 italic break-words mt-2">📝 {prof.notes}</p>
                    )}
                  </div>

                  <div className="flex flex-col gap-2 flex-shrink-0">
                    <button
                      onClick={() => navigate(`/public-cv/${prof.professionalId}`)}
                      className="bg-purple-100 text-purple-600 px-3 py-2 rounded-xl hover:bg-purple-200 transition-all text-xs font-semibold flex items-center gap-1 whitespace-nowrap"
                    >
                      <Eye className="w-4 h-4" /> Ver CV
                    </button>
                    <button
                      onClick={() => removeProfessional(prof.professionalId)}
                      className="bg-red-100 text-red-600 px-3 py-2 rounded-xl hover:bg-red-200 transition-all text-xs font-semibold flex items-center gap-1 whitespace-nowrap"
                    >
                      <Trash2 className="w-4 h-4" /> Quitar
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="fixed bottom-4 left-0 right-0 flex justify-center z-40">
        <button
          onClick={() => navigate('/client-dashboard')}
          className="w-14 h-14 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center transition-all hover:scale-110 shadow-2xl border-4 border-white text-white"
        >
          <Home className="w-7 h-7" />
        </button>
      </div>

      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
    </div>
  );
}

export default CompareProfessionals;