import { useState, useEffect, useMemo, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Home, ArrowLeft, Trash2, Eye } from 'lucide-react';
import LoadingScreen from '../components/LoadingScreen';
import Toast from '../components/Toast';
import { getProfessionalBadge } from '../utils/professionalBadge';
import { translateProfession, RenderStars } from '../utils/professionalUtils';

function SavedProfessionals() {
    const navigate = useNavigate();
    const backendUrl = 'https://professional-rating-backend-production.up.railway.app';

    const [professionals, setProfessionals] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedIds, setSelectedIds] = useState([]);
    const [toast, setToast] = useState(null);

    useEffect(() => {
        loadFavorites();
        // eslint-disable-next-line react-hooks/exhaustive-deps
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
                setToast({ type: 'success', message: 'Profesional eliminado de guardados' });
                setProfessionals(prev => prev.filter(p => p.professionalId !== professionalId));
                setSelectedIds(prev => prev.filter(id => id !== professionalId));
            } else {
                throw new Error('Error al eliminar');
            }
        } catch (error) {
            console.error('Error removing favorite:', error);
            setToast({ type: 'error', message: 'Error al eliminar profesional' });
        }
    }, [backendUrl]);

    // ✅ Memoizar canCompare
    const canCompare = useMemo(() => selectedIds.length >= 2, [selectedIds.length]);

    if (loading) {
        return <LoadingScreen message="Cargando profesionales..." />;
    }

    return (
        <div className="min-h-screen bg-gray-50 pb-24">
            {/* Header */}
            <div className="bg-gradient-to-br from-blue-500 to-purple-600 px-4 py-8">
                <div className="max-w-4xl mx-auto">
                    <button
                        onClick={() => navigate('/client-dashboard')}
                        className="flex items-center text-white mb-4 hover:opacity-80 transition-opacity"
                    >
                        <ArrowLeft className="w-5 h-5 mr-2" />
                        Volver
                    </button>
                    <h1 className="text-3xl roboto-light text-white mb-3">
                        Profesionales guardados
                    </h1>
                    <p className="text-white/90 text-sm mb-4">
                        Seleccioná a los Profesionales para comparar su desempeño
                    </p>

                    {/* Botón Comparar (fijo en el header) */}
                    <button
                        onClick={handleCompare}
                        disabled={!canCompare}
                        className={`w-full font-bold py-4 px-6 rounded-xl transition-all flex items-center justify-center gap-2 ${canCompare
                            ? 'bg-gradient-to-r from-green-500 to-teal-600 text-white shadow-lg hover:scale-105'
                            : 'bg-white/20 text-white/50 cursor-not-allowed'
                            }`}
                    >
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 4 0 01-2 2h-2a2 2 0 01-2-2z" />
                        </svg>
                        {canCompare ? `Comparar (${selectedIds.length})` : 'Seleccioná al menos 2'}
                    </button>
                </div>
            </div>

            {/* Contenido */}
            <div className="max-w-4xl mx-auto px-4 -mt-4 pb-8">
                {professionals.length === 0 ? (
                    <div className="bg-white rounded-2xl shadow-lg p-8 text-center">
                        <div className="w-16 h-16 bg-gray-100 rounded-full mx-auto mb-4 flex items-center justify-center">
                            <svg className="w-8 h-8 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" clipRule="evenodd" />
                            </svg>
                        </div>
                        <h2 className="text-xl roboto-light text-gray-800 mb-2">
                            No hay profesionales guardados
                        </h2>
                        <p className="text-gray-600 mb-6">
                            Guardá profesionales desde su CV para tenerlos siempre a mano
                        </p>
                        <button
                            onClick={() => navigate('/search')}
                            className="bg-purple-600 text-white px-6 py-3 rounded-xl font-semibold hover:bg-purple-700 transition-all"
                        >
                            Buscar profesionales
                        </button>
                    </div>
                ) : (
                    <div className="space-y-3">
                        {professionals.map((prof) => {
                            const badge = getProfessionalBadge(prof.totalRatings);
                            const isSelected = selectedIds.includes(prof.professionalId);

                            return (
                                <div
                                    key={prof.professionalId}
                                    onClick={(e) => handleCardClick(e, prof.professionalId)}
                                    className={`bg-white rounded-2xl shadow-lg p-4 cursor-pointer hover:shadow-xl transition-all overflow-hidden border-2 ${isSelected
                                            ? 'border-green-500 bg-green-50'
                                            : 'border-transparent hover:border-gray-200'
                                        }`}
                                >
                                    <div className="flex items-start gap-3">
                                        {/* Checkbox visual */}
                                        <div className="flex-shrink-0 pt-1">
                                            <div className={`w-6 h-6 rounded-md border-2 flex items-center justify-center transition-all ${isSelected
                                                    ? 'bg-green-500 border-green-500'
                                                    : 'border-gray-300 bg-white'
                                                }`}>
                                                {isSelected && (
                                                    <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                                                    </svg>
                                                )}
                                            </div>
                                        </div>

                                        {/* Avatar */}
                                        <div className="w-14 h-14 bg-purple-100 rounded-full flex items-center justify-center text-xl font-bold text-purple-600 flex-shrink-0">
                                            {prof.professionalName.charAt(0)}
                                        </div>

                                        {/* Info central */}
                                        <div className="flex-1 min-w-0">
                                            <h3 className="text-base font-bold text-gray-800 break-words">
                                                {prof.professionalName}
                                            </h3>
                                            <p className="text-sm text-purple-600 mb-2 break-words">
                                                {translateProfession(prof.professionType)}
                                            </p>

                                            {/* Medalla */}
                                            <div className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold mb-2 ${badge.bgColor} ${badge.borderColor} border`}>
                                                <span className="text-sm">{badge.emoji}</span>
                                                <span className={badge.color}>{badge.name}</span>
                                            </div>

                                            <div className="flex items-center gap-2 flex-wrap mb-3">
                                                <div className="flex flex-shrink-0">
                                                    <RenderStars score={prof.reputationScore || 0} />
                                                </div>
                                                <span className="text-xs text-gray-600">
                                                    {(prof.reputationScore || 0).toFixed(1)} ({prof.totalRatings || 0})
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

                                        {/* Botones de acción - alineados arriba */}
                                        <div className="flex flex-col gap-2 flex-shrink-0 pt-1">
                                            <button
                                                onClick={(e) => handleViewCV(e, prof.professionalId)}
                                                className="bg-purple-100 text-purple-600 px-3 py-2 rounded-xl hover:bg-purple-200 transition-all text-xs font-semibold flex items-center gap-1 whitespace-nowrap"
                                            >
                                                <Eye className="w-4 h-4" />
                                                Ver CV
                                            </button>
                                            <button
                                                onClick={(e) => handleRemoveFavorite(e, prof.professionalId)}
                                                className="bg-red-100 text-red-600 px-3 py-2 rounded-xl hover:bg-red-200 transition-all text-xs font-semibold flex items-center gap-1 whitespace-nowrap"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                                Eliminar
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>

            {/* Botón Home flotante */}
            <div className="fixed bottom-4 left-0 right-0 flex justify-center z-50 animate-slideUp">
                <button
                    onClick={() => navigate(-1)}
                    className="w-14 h-14 bg-gradient-to-r from-green-500 to-teal-600 hover:from-green-600 hover:to-teal-700 rounded-full flex items-center justify-center transition-all hover:scale-110 shadow-2xl border-4 border-white"
                    aria-label="Volver atrás"
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

export default SavedProfessionals;