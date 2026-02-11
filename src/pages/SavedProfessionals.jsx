import { useState, useEffect, useMemo, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Home, ArrowLeft, Trash2, Eye } from 'lucide-react';
import LoadingScreen from '../components/LoadingScreen';
import Toast from '../components/Toast';
import { getProfessionalBadge } from '../utils/professionalBadge';
import { translateProfession, RenderStars } from '../utils/professionalUtils';
import { Home, ArrowLeft, Trash2, Eye, TrendingUp, Check } from 'lucide-react';

function SavedProfessionals() {
    const navigate = useNavigate();
    const backendUrl = 'https://professional-rating-backend-production.up.railway.app';

    const [professionals, setProfessionals] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedIds, setSelectedIds] = useState([]);
    const [toast, setToast] = useState(null);

    useEffect(() => {
        loadFavorites();
    }, []);

    const loadFavorites = async () => {
        try {
            const token = localStorage.getItem('authToken');
            if (!token) {
                navigate('/client-login');
                return;
            }

            const response = await fetch(`${backendUrl}/api/clients/me/favorites`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });

            if (response.ok) {
                const data = await response.json();
                setProfessionals(data);
            } else {
                throw new Error('Error al cargar favoritos');
            }
        } catch (error) {
            console.error('Error loading favorites:', error);
            setToast({ type: 'error', message: 'Error al cargar profesionales guardados' });
        } finally {
            setLoading(false);
        }
    };

    const toggleSelection = useCallback((professionalId) => {
        setSelectedIds(prev =>
            prev.includes(professionalId)
                ? prev.filter(id => id !== professionalId)
                : [...prev, professionalId]
        );
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

    const handleViewCV = useCallback((e, professionalId) => {
        e.stopPropagation();
        navigate(`/public-cv/${professionalId}`);
    }, [navigate]);

    const handleRemoveFavorite = useCallback(async (e, professionalId) => {
        e.stopPropagation();
        try {
            const token = localStorage.getItem('authToken');
            const response = await fetch(
                `${backendUrl}/api/clients/me/favorites/${professionalId}`,
                {
                    method: 'DELETE',
                    headers: { 'Authorization': `Bearer ${token}` }
                }
            );

            if (response.ok) {
                setToast({ type: 'success', message: 'Profesional eliminado' });
                setProfessionals(prev => prev.filter(p => p.professionalId !== professionalId));
                setSelectedIds(prev => prev.filter(id => id !== professionalId));
            } else {
                throw new Error('Error al eliminar');
            }
        } catch (error) {
            setToast({ type: 'error', message: 'Error al eliminar profesional' });
        }
    }, [backendUrl]);

    const canCompare = useMemo(() => selectedIds.length >= 2, [selectedIds.length]);

    if (loading) return <LoadingScreen message="Cargando profesionales..." />;

    return (
        <div className="min-h-screen bg-gray-50 pb-24">
            {/* Header */}
            <div className="bg-gradient-to-br from-blue-500 to-purple-600 px-4 py-8">
                <div className="max-w-4xl mx-auto">
                    <button onClick={() => navigate('/client-dashboard')} className="flex items-center text-white mb-4 hover:opacity-80 transition-opacity">
                        <ArrowLeft className="w-5 h-5 mr-2" />
                        Volver
                    </button>
                    <h1 className="text-3xl roboto-light text-white mb-3">Profesionales guardados</h1>
                    <p className="text-white/90 text-sm mb-4">Seleccioná a los Profesionales para comparar su desempeño</p>
                    <button
                        onClick={handleCompare}
                        disabled={!canCompare}
                        className={`w-full font-bold py-4 px-6 rounded-xl transition-all flex items-center justify-center gap-2 ${canCompare
                            ? 'bg-gradient-to-r from-green-500 to-teal-600 text-white shadow-lg hover:scale-105'
                            : 'bg-white/20 text-white/50 cursor-not-allowed'
                            }`}
                    >
                        <TrendingUp className="w-6 h-6" />
                        {canCompare ? `Comparar (${selectedIds.length})` : 'Seleccioná al menos 2'}
                    </button>
                </div>
            </div>

            {/* Contenido */}
            <div className="max-w-4xl mx-auto px-4 -mt-4 pb-8">
                {professionals.length === 0 ? (
                    <div className="bg-white rounded-2xl shadow-lg p-8 text-center">
                        <h2 className="text-xl roboto-light text-gray-800 mb-2">No hay profesionales guardados</h2>
                        <button onClick={() => navigate('/search')} className="bg-purple-600 text-white px-6 py-3 rounded-xl font-semibold hover:bg-purple-700 mt-4">Buscar profesionales</button>
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
                                    <div className="flex gap-4">
                                        {/* Checkbox */}
                                        <div className={`w-6 h-6 rounded-md border-2 flex-shrink-0 mt-1 flex items-center justify-center ${isSelected ? 'bg-green-500 border-green-500' : 'border-gray-300'}`}>
                                            {isSelected && <Check className="w-4 h-4 text-white" strokeWidth={4} />}
                                        </div>

                                        {/* Avatar */}
                                        <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center text-2xl font-bold text-purple-600 flex-shrink-0">
                                            {prof.professionalName.charAt(0)}
                                        </div>

                                        {/* Info Principal */}
                                        <div className="flex-1 min-w-0">
                                            <div className="flex justify-between items-start">
                                                <div className="min-w-0 flex-1">
                                                    <h3 className="text-lg font-bold text-gray-800 truncate">{prof.professionalName}</h3>
                                                    <p className="text-sm text-purple-600 font-medium mb-2">{translateProfession(prof.professionType)}</p>
                                                    
                                                    {/* Medalla ajustada */}
                                                    <div className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold mb-3 ${badge.bgColor} ${badge.borderColor} border`}>
                                                        <span>{badge.emoji}</span>
                                                        <span className={badge.color}>{badge.name}</span>
                                                    </div>
                                                </div>

                                                {/* Botones movidos a una columna fija a la derecha con margen */}
                                                <div className="flex flex-col gap-2 ml-4">
                                                    <button
                                                        onClick={(e) => handleViewCV(e, prof.professionalId)}
                                                        className="bg-purple-50 text-purple-600 px-4 py-2 rounded-xl hover:bg-purple-100 transition-all text-xs font-bold flex items-center gap-2 border border-purple-100"
                                                    >
                                                        <Eye className="w-4 h-4" /> Ver CV
                                                    </button>
                                                    <button
                                                        onClick={(e) => handleRemoveFavorite(e, prof.professionalId)}
                                                        className="bg-red-50 text-red-600 px-4 py-2 rounded-xl hover:bg-red-100 transition-all text-xs font-bold flex items-center gap-2 border border-red-100"
                                                    >
                                                        <Trash2 className="w-4 h-4" /> Eliminar
                                                    </button>
                                                </div>
                                            </div>

                                            {/* Rating y Notas abajo */}
                                            <div className="flex items-center gap-3 mt-1">
                                                <RenderStars score={prof.reputationScore || 0} />
                                                <span className="text-sm font-bold text-gray-600">
                                                    {(prof.reputationScore || 0).toFixed(1)} <span className="font-normal text-gray-400">({prof.totalRatings})</span>
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

            {/* Home flotante */}
            <div className="fixed bottom-6 left-0 right-0 flex justify-center z-50">
                <button onClick={() => navigate(-1)} className="w-14 h-14 bg-white text-gray-800 rounded-full flex items-center justify-center shadow-2xl border-4 border-white hover:scale-110 transition-all">
                    <Home className="w-7 h-7" />
                </button>
            </div>

            {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
        </div>
    );
}

export default SavedProfessionals;