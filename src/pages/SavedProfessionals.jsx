import { useState, useEffect, useMemo, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Trash2, Eye, TrendingUp, Check } from 'lucide-react';
import LoadingScreen from '../components/LoadingScreen';
import Toast from '../components/Toast';
import BackButton from '../components/BackButton';
import HomeButton from '../components/HomeButton';
import { getProfessionalBadge } from '../utils/professionalBadge';
import { translateProfession, RenderStars } from '../utils/professionalUtils';
import { BACKEND_URL } from '../config';

function SavedProfessionals() {
  const navigate = useNavigate();
  const [professionals, setProfessionals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedIds, setSelectedIds] = useState([]);
  const [toast, setToast] = useState(null);

  useEffect(() => { loadFavorites(); }, []);

  const loadFavorites = async () => {
    try {
      const token = localStorage.getItem('authToken');
      if (!token) { navigate('/client-login'); return; }
      const response = await fetch(`${BACKEND_URL}/api/clients/me/favorites`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.ok) setProfessionals(await response.json());
      else throw new Error('Error al cargar favoritos');
    } catch (error) {
      console.error('Error loading favorites:', error);
    } finally {
      setLoading(false);
    }
  };

  const toggleSelection = useCallback((professionalId) => {
    setSelectedIds(prev => prev.includes(professionalId) ? prev.filter(id => id !== professionalId) : [...prev, professionalId]);
  }, []);

  const handleCompare = useCallback(() => {
    if (selectedIds.length < 2) return;
    const selected = professionals.filter(p => selectedIds.includes(p.professionalId));
    navigate('/compare-professionals', { state: { professionals: selected } });
  }, [selectedIds, professionals, navigate]);

  const handleCardClick = useCallback((e, professionalId) => {
    if (e.target.closest('button')) return;
    toggleSelection(professionalId);
  }, [toggleSelection]);

  const handleViewCV = useCallback((e, prof) => {
    e.stopPropagation();
    navigate(`/public-cv/${prof.publicSlug || prof.professionalId}`);
  }, [navigate]);

  const handleRemoveFavorite = useCallback(async (e, professionalId) => {
    e.stopPropagation();
    try {
      const token = localStorage.getItem('authToken');
      const response = await fetch(`${BACKEND_URL}/api/clients/me/favorites/${professionalId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.ok) {
        setToast({ type: 'success', message: 'Profesional eliminado' });
        setProfessionals(prev => prev.filter(p => p.professionalId !== professionalId));
        setSelectedIds(prev => prev.filter(id => id !== professionalId));
      }
    } catch (error) {
      setToast({ type: 'error', message: 'Error al eliminar profesional' });
    }
  }, [BACKEND_URL]);

  const canCompare = useMemo(() => selectedIds.length >= 2, [selectedIds.length]);

  if (loading) return <LoadingScreen message="Cargando profesionales..." />;

  return (
    <div className="min-h-screen bg-gray-50 pb-24">
      <div className="bg-gradient-to-br from-blue-500 to-purple-600 px-4 pt-6 pb-8">
        <div className="max-w-4xl mx-auto">
          <BackButton />
          <h1 className="text-3xl roboto-light text-white mb-3 mt-2">Profesionales guardados</h1>
          <button
            onClick={handleCompare}
            disabled={!canCompare}
            className={`w-full font-bold py-4 px-6 rounded-xl transition-all flex items-center justify-center gap-2 ${canCompare ? 'bg-gradient-to-r from-green-500 to-teal-600 text-white shadow-lg hover:scale-105' : 'bg-white/20 text-white/50 cursor-not-allowed'}`}
          >
            <TrendingUp className="w-6 h-6" />
            {canCompare ? `Comparar (${selectedIds.length})` : 'Seleccioná al menos 2 para poder compararlos'}
          </button>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 -mt-4 pb-8">
        {professionals.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-lg p-8 text-center">
            <h2 className="text-xl roboto-light text-gray-800 mb-2">No hay profesionales guardados</h2>
          </div>
        ) : (
          <div className="space-y-4">
            {professionals.map((prof) => {
              const badge = getProfessionalBadge(prof.totalRatings);
              const isSelected = selectedIds.includes(prof.professionalId);
              return (
                <div
                  key={prof.professionalId}
                  onClick={(e) => handleCardClick(e, prof.professionalId)}
                  className={`bg-white rounded-2xl shadow-md p-4 cursor-pointer border-2 transition-all ${isSelected ? 'border-green-500 bg-green-50' : 'border-transparent'}`}
                >
                  <div className="flex gap-3 sm:gap-4">
                    <div className={`w-6 h-6 rounded-md border-2 flex-shrink-0 mt-1 flex items-center justify-center ${isSelected ? 'bg-green-500 border-green-500' : 'border-gray-300'}`}>
                      {isSelected && <Check className="w-4 h-4 text-white" strokeWidth={4} />}
                    </div>
                    <div className="w-14 h-14 sm:w-16 sm:h-16 bg-purple-100 rounded-full flex items-center justify-center text-xl sm:text-2xl font-bold text-purple-600 flex-shrink-0">
                      {prof.professionalName.charAt(0)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-start gap-2">
                        <div className="min-w-0 flex-1">
                          <h3 className="text-base sm:text-lg font-bold text-gray-800 truncate">{prof.professionalName}</h3>
                          <p className="text-xs sm:text-sm text-purple-600 font-medium truncate">
                            {prof.professionTypes?.length > 0
                              ? prof.professionTypes.map(translateProfession).join(' · ')
                              : translateProfession(prof.professionType)}
                          </p>
                        </div>
                        <div className="flex flex-col gap-1.5 flex-shrink-0">
                          <button onClick={(e) => handleViewCV(e, prof)} className="bg-purple-50 text-purple-600 px-3 py-1.5 rounded-lg hover:bg-purple-100 transition-all text-[10px] font-bold flex items-center justify-center gap-1 border border-purple-100">
                            <Eye className="w-3 h-3" /> CV
                          </button>
                          <button onClick={(e) => handleRemoveFavorite(e, prof.professionalId)} className="bg-red-50 text-red-600 px-3 py-1.5 rounded-lg hover:bg-red-100 transition-all text-[10px] font-bold flex items-center justify-center gap-1 border border-red-100">
                            <Trash2 className="w-3 h-3" /> Borrar
                          </button>
                        </div>
                      </div>
                      <div className="mt-2 mb-2">
                        <div className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold ${badge.bgColor} ${badge.borderColor} border`}>
                          <span>{badge.emoji}</span>
                          <span className={badge.color}>{badge.name}</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <RenderStars score={prof.reputationScore || 0} />
                        <span className="text-xs font-bold text-gray-600">
                          {(prof.reputationScore || 0).toFixed(1)}
                          <span className="font-normal text-gray-400 ml-1">({prof.totalRatings})</span>
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <HomeButton />
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
    </div>
  );
}

export default SavedProfessionals;