import { useEffect, useState, useRef, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Star, LogOut, Calendar, MessageSquare, User, BarChart3, Search, ChevronDown, Heart, Edit2, Trash2, Clock, X } from 'lucide-react';
import LoadingScreen from '../components/LoadingScreen';
import DeleteConfirmModal from '../components/DeleteConfirmModal';
import Toast from '../components/Toast';
import api from '../services/api';
import { exchangeOAuthCode, saveAuthData } from '../utils/authUtils';
import { BACKEND_URL } from '../config';

function ClientDashboard() {
  const navigate = useNavigate();
  const [client, setClient] = useState(null);
  const [myRatings, setMyRatings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingRatings, setLoadingRatings] = useState(true);
  const [stats, setStats] = useState(null);
  const [topBadges, setTopBadges] = useState([]);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [deleteModal, setDeleteModal] = useState(null);
  const [toast, setToast] = useState(null);
  const [showPhotoModal, setShowPhotoModal] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const codeFromUrl = urlParams.get('code');

    if (codeFromUrl) {
      window.history.replaceState({}, document.title, window.location.pathname);

      exchangeOAuthCode(codeFromUrl).then((data) => {
        if (data) {
          saveAuthData('CLIENT', data.token, {
            id: data.id,
            email: data.email,
            name: data.name,
            termsAccepted: data.data?.termsAccepted ?? false
          });
          if (!data.data?.termsAccepted) {
            navigate('/accept-terms', { replace: true });
            return;
          }
        }
        loadClientData();
      });
    } else {
      loadClientData();
    }

    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowUserMenu(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const loadClientData = useCallback(async () => {
    const token = localStorage.getItem('authToken');
    const cachedClient = localStorage.getItem('client');

    if (!token) {
      navigate('/client-login');
      setLoading(false);
      return;
    }

    try {
      if (cachedClient) {
        const clientData = JSON.parse(cachedClient);
        setClient(clientData);
        setLoading(false);

        const [profileResponse, ratingsResponse] = await Promise.all([
          fetch(`${BACKEND_URL}/api/auth/me/client`, {
            headers: { 'Authorization': `Bearer ${token}` }
          }),
          fetch(`${BACKEND_URL}/api/ratings/client/${clientData.id}`, {
            headers: { 'Authorization': `Bearer ${token}` }
          })
        ]);

        if (profileResponse.ok) {
          const newClientData = await profileResponse.json();
          setClient(newClientData);
          localStorage.setItem('client', JSON.stringify(newClientData));
        }

        if (ratingsResponse.ok) {
          const allRatings = await ratingsResponse.json();
          processRatings(allRatings);
        } else {
          setMyRatings([]);
          setStats({ total: 0, average: 0, categories: 0 });
        }

        setLoadingRatings(false);

      } else {
        const clientResponse = await fetch(`${BACKEND_URL}/api/auth/me/client`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });

        if (!clientResponse.ok) {
          if (clientResponse.status === 401) {
            localStorage.removeItem('authToken');
            localStorage.removeItem('client');
            navigate('/client-login');
          }
          throw new Error('Error al cargar datos del cliente');
        }

        const clientData = await clientResponse.json();
        setClient(clientData);
        localStorage.setItem('client', JSON.stringify(clientData));
        setLoading(false);

        const ratingsResponse = await fetch(`${BACKEND_URL}/api/ratings/client/${clientData.id}`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });

        if (ratingsResponse.ok) {
          const allRatings = await ratingsResponse.json();
          processRatings(allRatings);
        } else {
          setMyRatings([]);
          setStats({ total: 0, average: 0, categories: 0 });
        }

        setLoadingRatings(false);
      }

    } catch (error) {
      navigate('/client-login');
    } finally {
      setLoading(false);
      setLoadingRatings(false);
    }
  }, [BACKEND_URL, navigate]);

  const processRatings = useCallback((allRatings) => {
    const sorted = allRatings.sort((a, b) =>
      new Date(b.createdAt) - new Date(a.createdAt)
    );
    setMyRatings(sorted);
    calculateQuickStats(sorted);
    calculateTopBadges(sorted);
  }, []);

  const calculateQuickStats = useCallback((ratingsData) => {
    if (ratingsData.length === 0) {
      setStats({ total: 0, average: 0, categories: 0 });
      return;
    }
    const total = ratingsData.length;
    const average = ratingsData.reduce((sum, r) => sum + r.score, 0) / total;
    const categories = new Set(ratingsData.map(r => r.professionalType || 'general')).size;
    setStats({ total, average: average.toFixed(1), categories });
  }, []);

  const calculateTopBadges = useCallback((ratingsData) => {
    const badges = [];
    const total = ratingsData.length;

    if (total >= 100) badges.push({ icon: '⭐', name: 'Legendario' });
    else if (total >= 50) badges.push({ icon: '👑', name: 'Maestro' });
    else if (total >= 25) badges.push({ icon: '💎', name: 'Experto' });
    else if (total >= 10) badges.push({ icon: '🥇', name: 'Experimentado' });
    else if (total >= 5) badges.push({ icon: '🥈', name: 'Activo' });
    else if (total >= 1) badges.push({ icon: '🥉', name: 'Primera' });

    const withComment = ratingsData.filter(r => r.comment && r.comment.trim().length > 0).length;
    const commentPercentage = total > 0 ? (withComment / total) * 100 : 0;
    if (commentPercentage >= 80) badges.push({ icon: '💬', name: 'Comunicador' });

    const average = total > 0 ? ratingsData.reduce((sum, r) => sum + r.score, 0) / total : 0;
    if (average >= 4.5) badges.push({ icon: '🌟', name: 'Generoso' });

    setTopBadges(badges.slice(0, 3));
  }, []);

  const handleLogout = useCallback(() => {
    localStorage.removeItem('authToken');
    localStorage.removeItem('client');
    setShowUserMenu(false);
    navigate('/');
  }, [navigate]);

  const handleEditRating = useCallback((rating) => {
    navigate(`/edit-rating/${rating.id}`);
  }, [navigate]);

  const handleDeleteClick = useCallback((rating) => {
    setDeleteModal({ ratingId: rating.id, professionalName: rating.professionalName });
  }, []);

  const handleDeleteConfirm = useCallback(async () => {
    if (!deleteModal) return;

    const ratingIdToDelete = deleteModal.ratingId;

    setMyRatings(prev => {
      const updated = prev.filter(r => r.id !== ratingIdToDelete);
      calculateQuickStats(updated);
      calculateTopBadges(updated);
      return updated;
    });

    setDeleteModal(null);

    try {
      await api.deleteRating(ratingIdToDelete);
      setToast({ type: 'success', message: 'Calificación eliminada exitosamente' });
    } catch (error) {
      setToast({ type: 'error', message: error.response?.data?.message || 'Error al eliminar la calificación' });
      loadClientData();
    }
  }, [deleteModal, calculateQuickStats, calculateTopBadges, loadClientData]);

  const getTimeRemaining = useCallback((createdAt) => {
    try {
      const now = Date.now();
      let dateString = createdAt;
      if (typeof createdAt === 'string' && createdAt.includes('T') && !createdAt.includes('Z') && !createdAt.includes('+')) {
        dateString = createdAt + 'Z';
      }
      const created = new Date(dateString).getTime();
      if (isNaN(created)) return null;
      const diffMinutes = Math.floor((now - created) / (1000 * 60));
      if (diffMinutes >= 30 || diffMinutes < 0) return null;
      return `${30 - diffMinutes} min`;
    } catch (error) {
      return null;
    }
  }, []);

  const renderStars = useCallback((score) => {
    return [...Array(5)].map((_, i) => (
      <Star key={i} className={`w-4 h-4 ${i < score ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'}`} />
    ));
  }, []);

  const firstName = useMemo(() =>
    client?.name ? client.name.trim().split(' ')[0] : 'Usuario',
    [client?.name]
  );

  const recentRatings = useMemo(() => myRatings.slice(0, 3), [myRatings]);

  if (loading) return <LoadingScreen />;
  if (!client) return null;

  return (
    <div className="min-h-screen bg-gray-50 animate-fadeIn">

      {/* Modal foto grande */}
      {showPhotoModal && client.profilePicture && (
        <div
          className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center"
          onClick={() => setShowPhotoModal(false)}
        >
          <div className="relative" onClick={e => e.stopPropagation()}>
            <img
              src={client.profilePicture}
              alt="Foto de perfil"
              className="w-72 h-72 rounded-full object-cover shadow-2xl border-4 border-white"
            />
            <button
              onClick={() => setShowPhotoModal(false)}
              className="absolute -top-3 -right-3 w-8 h-8 bg-white rounded-full flex items-center justify-center shadow-lg"
            >
              <X className="w-4 h-4 text-gray-700" />
            </button>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="bg-gradient-to-br from-green-500 to-teal-600 px-4 pt-6 pb-24 animate-slideDown">
        <div className="flex justify-between items-center mb-6">
          <button
            onClick={() => window.location.href = 'https://www.calificalo.com.ar/'}
            className="text-white text-2xl hover:scale-105 transition-transform logo-pulse"
            style={{ fontFamily: 'Playball, cursive' }}
          >
            Calificalo
          </button>

          <div className="relative" ref={dropdownRef}>
            <button
              onClick={() => setShowUserMenu(!showUserMenu)}
              className="bg-white/20 hover:bg-white/30 text-white px-3 sm:px-4 py-2 rounded-full font-semibold flex items-center gap-2 transition-all hover-lift text-sm sm:text-base"
            >
              <User className="w-4 h-4" />
              <span>{firstName}</span>
              <ChevronDown className={`w-4 h-4 transition-transform ${showUserMenu ? 'rotate-180' : ''}`} />
            </button>

            {showUserMenu && (
              <div className="absolute right-0 mt-2 w-48 sm:w-56 bg-white rounded-2xl shadow-2xl overflow-hidden z-50 animate-slideDown">
                <div className="py-2">
                  <button
                    onClick={() => { setShowUserMenu(false); navigate('/edit-profile'); }}
                    className="w-full px-4 py-3 text-left text-gray-700 hover:bg-green-50 transition-colors flex items-center gap-3"
                  >
                    <User className="w-5 h-5 text-green-600" />
                    <span className="font-medium text-sm sm:text-base">Mi perfil</span>
                  </button>

                  <button
                    onClick={() => { setShowUserMenu(false); navigate('/client-stats'); }}
                    className="w-full px-4 py-3 text-left text-gray-700 hover:bg-teal-50 transition-colors flex items-center gap-3"
                  >
                    <BarChart3 className="w-5 h-5 text-teal-600" />
                    <span className="font-medium text-sm sm:text-base">Mis estadísticas</span>
                  </button>

                  <div className="border-t border-gray-200 my-2"></div>

                  <button
                    onClick={handleLogout}
                    className="w-full px-4 py-3 text-left text-red-600 hover:bg-red-50 transition-colors flex items-center gap-3"
                  >
                    <LogOut className="w-5 h-5" />
                    <span className="font-medium text-sm sm:text-base">Cerrar sesión</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="text-center">
          <div
            className="w-20 h-20 rounded-full mx-auto mb-3 overflow-hidden bg-white flex items-center justify-center text-3xl font-bold text-teal-600 animate-scaleIn border-4 border-white shadow-lg cursor-pointer active:scale-95 transition-transform"
            onClick={() => client.profilePicture ? setShowPhotoModal(true) : navigate('/edit-profile')}
          >
            {client.profilePicture
              ? <img src={client.profilePicture} alt="Foto de perfil" className="w-full h-full object-cover" />
              : (client.name ? client.name.charAt(0) : 'U')
            }
          </div>
          <h2 className="text-xl roboto-light text-white mb-2 animate-slideUp">{client.name || 'Usuario'}</h2>
          {topBadges.length > 0 && (
            <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm px-3 py-1 rounded-full animate-slideUp delay-100">
              <span className="text-2xl">{topBadges[0].icon}</span>
              <span className="text-white text-sm font-semibold">{topBadges[0].name}</span>
            </div>
          )}
        </div>
      </div>

      <div className="px-4 -mt-16">
        <div className="grid grid-cols-2 gap-3 mb-4 animate-slideUp">
          <button
            onClick={() => navigate('/search')}
            className="bg-gradient-to-br from-blue-500 to-cyan-600 rounded-2xl shadow-xl p-6 text-center hover:scale-105 transition-all"
          >
            <Search className="w-10 h-10 text-white mx-auto mb-3" />
            <p className="text-sm font-bold text-white">Buscar Profesional</p>
          </button>

          <button
            onClick={() => navigate('/saved-professionals')}
            className="bg-gradient-to-br from-pink-500 to-fuchsia-600 rounded-2xl shadow-xl p-6 text-center hover:scale-105 transition-all relative overflow-hidden"
          >
            <Heart className="w-10 h-10 text-white mx-auto mb-3" />
            <p className="text-sm font-bold text-white">Mis Profesionales</p>
          </button>
        </div>

        {loadingRatings ? (
          <div className="w-full bg-white rounded-2xl shadow-md p-4 mb-4 animate-slideUp delay-100 animate-pulse">
            <div className="flex items-center justify-around">
              <div className="text-center">
                <div className="h-8 bg-gray-200 rounded w-12 mx-auto mb-1"></div>
                <div className="h-3 bg-gray-200 rounded w-20 mx-auto"></div>
              </div>
              <div className="h-12 w-px bg-gray-200"></div>
              <div className="text-center">
                <div className="h-8 bg-gray-200 rounded w-12 mx-auto mb-1"></div>
                <div className="h-3 bg-gray-200 rounded w-16 mx-auto"></div>
              </div>
            </div>
          </div>
        ) : stats && stats.total > 0 ? (
          <button
            onClick={() => navigate('/client-stats')}
            className="w-full bg-white rounded-2xl shadow-md p-4 mb-4 animate-slideUp delay-100 hover:shadow-lg transition-all"
          >
            <div className="flex items-center justify-around">
              <div className="text-center">
                <p className="text-2xl font-bold text-blue-600">{stats.total}</p>
                <p className="text-xs text-gray-500">Calificaciones</p>
              </div>
              <div className="h-12 w-px bg-gray-200"></div>
              <div className="text-center">
                <p className="text-2xl font-bold text-orange-500">{stats.average}</p>
                <p className="text-xs text-gray-500">Promedio</p>
              </div>
            </div>
          </button>
        ) : (
          <div className="w-full bg-white rounded-2xl shadow-md p-4 mb-4 animate-slideUp delay-100 opacity-50">
            <div className="flex items-center justify-around">
              <div className="text-center">
                <p className="text-2xl font-bold text-blue-600">0</p>
                <p className="text-xs text-gray-500">Calificaciones</p>
              </div>
              <div className="h-12 w-px bg-gray-200"></div>
              <div className="text-center">
                <p className="text-2xl font-bold text-orange-500">0</p>
                <p className="text-xs text-gray-500">Promedio</p>
              </div>
            </div>
          </div>
        )}

        <div className="bg-white rounded-2xl shadow-lg p-6 mb-4 animate-slideUp delay-150">
          <h3 className="text-xl roboto-light text-gray-800 mb-2">¡Hola, {firstName}! 👋</h3>
          <p className="text-gray-600 text-base">Para calificar a un profesional, pídele que te muestre su código QR.</p>
        </div>

        <div className="bg-white rounded-2xl shadow-lg p-6 mb-4 animate-slideUp delay-200">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xl roboto-light text-gray-800 flex items-center">
              <Star className="w-5 h-5 mr-2 text-yellow-500" />
              Calificaciones recientes
            </h3>
            {myRatings.length > 3 && (
              <button onClick={() => navigate('/client-ratings-history')} className="text-teal-600 text-sm font-semibold hover:text-teal-700">
                Ver todas →
              </button>
            )}
          </div>

          {myRatings.length === 0 && !loadingRatings ? (
            <div className="text-center py-8">
              <MessageSquare className="w-16 h-16 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500 mb-4 text-base">Aún no has calificado a ningún profesional</p>
              <p className="text-sm text-gray-400">Escaneá un código QR para comenzar</p>
            </div>
          ) : (
            <div className="space-y-3">
              {recentRatings.map((rating) => {
                const timeRemaining = getTimeRemaining(rating.createdAt);
                const canEdit = rating.canEdit;

                return (
                  <div
                    key={rating.id}
                    className={`rounded-xl p-4 hover:shadow-md transition-all ${canEdit && timeRemaining ? 'border-2 border-blue-400 bg-blue-50/30' : 'border border-gray-100'}`}
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex-1 min-w-0">
                        <h4 className="font-semibold text-gray-800 text-base break-words">{rating.professionalName}</h4>
                        <p className="text-sm text-gray-500 break-words">{rating.businessName}</p>
                      </div>
                      <div className="flex items-center gap-1 flex-shrink-0">
                        {renderStars(rating.score)}
                      </div>
                    </div>

                    {rating.comment && (
                      <p className="text-gray-600 text-sm mb-2 italic break-words">"{rating.comment}"</p>
                    )}

                    <div className="flex items-center justify-between flex-wrap gap-2">
                      <div className="flex items-center text-xs text-gray-400">
                        <Calendar className="w-3 h-3 mr-1 flex-shrink-0" />
                        {new Date(rating.createdAt).toLocaleDateString('es-AR', { day: '2-digit', month: 'long', year: 'numeric' })}
                      </div>

                      {canEdit && timeRemaining && (
                        <div className="flex items-center gap-2">
                          <div className="flex items-center gap-1 text-xs text-blue-600 bg-blue-100 px-2 py-1 rounded-lg font-semibold">
                            <Clock className="w-3 h-3" />
                            <span>{timeRemaining}</span>
                          </div>
                          <button onClick={() => handleEditRating(rating)} className="p-2 text-blue-600 hover:bg-blue-100 rounded-lg transition-colors">
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button onClick={() => handleDeleteClick(rating)} className="p-2 text-red-600 hover:bg-red-100 rounded-lg transition-colors">
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      <DeleteConfirmModal
        isOpen={deleteModal !== null}
        onClose={() => setDeleteModal(null)}
        onConfirm={handleDeleteConfirm}
        professionalName={deleteModal?.professionalName}
      />

      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
    </div>
  );
}

export default ClientDashboard;