import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Users, Star, BarChart2, LogOut, ShieldAlert,
  ChevronDown, ChevronUp, Trash2, Ban, CheckCircle,
  Loader2, RefreshCw
} from 'lucide-react';
import { BACKEND_URL } from '../config';
import { clearAuthData } from '../utils/authUtils';

const getToken = () => localStorage.getItem('authToken');

const authHeader = () => ({
  'Content-Type': 'application/json',
  Authorization: `Bearer ${getToken()}`
});

function AdminDashboard() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('stats');
  const [stats, setStats] = useState(null);
  const [users, setUsers] = useState([]);
  const [ratings, setRatings] = useState([]);
  const [loading, setLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState(null);
  const [error, setError] = useState(null);
  const [expandedUser, setExpandedUser] = useState(null);
  const [confirmDelete, setConfirmDelete] = useState(null);

  useEffect(() => {
    if (activeTab === 'stats') fetchStats();
    if (activeTab === 'users') fetchUsers();
    if (activeTab === 'ratings') fetchRatings();
  }, [activeTab]);

  const fetchStats = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`${BACKEND_URL}/api/admin/stats`, { headers: authHeader() });
      if (!res.ok) throw new Error('Error cargando estadísticas');
      setStats(await res.json());
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchUsers = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`${BACKEND_URL}/api/admin/users`, { headers: authHeader() });
      if (!res.ok) throw new Error('Error cargando usuarios');
      setUsers(await res.json());
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchRatings = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`${BACKEND_URL}/api/admin/ratings`, { headers: authHeader() });
      if (!res.ok) throw new Error('Error cargando calificaciones');
      setRatings(await res.json());
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  const toggleSuspend = async (userId) => {
    setActionLoading(userId);
    try {
      const res = await fetch(`${BACKEND_URL}/api/admin/users/${userId}/suspend`, {
        method: 'PATCH',
        headers: authHeader()
      });
      if (!res.ok) throw new Error('Error al suspender usuario');
      setUsers(prev =>
        prev.map(u => u.id === userId ? { ...u, suspended: !u.suspended } : u)
      );
    } catch (e) {
      setError(e.message);
    } finally {
      setActionLoading(null);
    }
  };

  const deleteRating = async (ratingId) => {
    setActionLoading(ratingId);
    try {
      const res = await fetch(`${BACKEND_URL}/api/admin/ratings/${ratingId}`, {
        method: 'DELETE',
        headers: authHeader()
      });
      if (!res.ok) throw new Error('Error al eliminar calificación');
      setRatings(prev => prev.filter(r => r.id !== ratingId));
      setConfirmDelete(null);
    } catch (e) {
      setError(e.message);
    } finally {
      setActionLoading(null);
    }
  };

  const handleLogout = () => {
    clearAuthData();
    navigate('/professional-login');
  };

  const tabs = [
    { id: 'stats', label: 'Estadísticas', icon: BarChart2 },
    { id: 'users', label: 'Usuarios', icon: Users },
    { id: 'ratings', label: 'Calificaciones', icon: Star }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-700 text-white px-4 py-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <ShieldAlert className="w-6 h-6" />
          <span className="font-bold text-lg">Panel Admin</span>
        </div>
        <button
          onClick={handleLogout}
          className="flex items-center gap-1 text-white/80 hover:text-white text-sm transition-colors"
        >
          <LogOut className="w-4 h-4" />
          Salir
        </button>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-gray-200 bg-white sticky top-0 z-10">
        {tabs.map(tab => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex-1 flex flex-col items-center py-3 text-xs font-semibold transition-colors gap-1 ${
                activeTab === tab.id
                  ? 'text-blue-600 border-b-2 border-blue-600'
                  : 'text-gray-500'
              }`}
            >
              <Icon className="w-5 h-5" />
              {tab.label}
            </button>
          );
        })}
      </div>

      <div className="p-4 max-w-2xl mx-auto">
        {/* Error */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl px-4 py-3 mb-4 flex items-center justify-between text-sm">
            <span>{error}</span>
            <button onClick={() => setError(null)} className="text-red-400 hover:text-red-600">✕</button>
          </div>
        )}

        {/* Loading */}
        {loading && (
          <div className="flex justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
          </div>
        )}

        {/* ── STATS ── */}
        {!loading && activeTab === 'stats' && stats && (
          <div className="space-y-4">
            <div className="flex justify-end">
              <button onClick={fetchStats} className="flex items-center gap-1 text-sm text-blue-600">
                <RefreshCw className="w-4 h-4" /> Actualizar
              </button>
            </div>
            <div className="grid grid-cols-2 gap-3">
              {[
                { label: 'Usuarios totales', value: stats.totalUsers, color: 'blue' },
                { label: 'Profesionales', value: stats.totalProfessionals, color: 'purple' },
                { label: 'Clientes', value: stats.totalClients, color: 'green' },
                { label: 'Suspendidos', value: stats.suspendedUsers, color: 'red' },
                { label: 'Calificaciones', value: stats.totalRatings, color: 'yellow' },
                { label: 'Promedio score', value: stats.averageScore?.toFixed(2), color: 'indigo' }
              ].map(item => (
                <div key={item.label} className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
                  <p className="text-xs text-gray-500 mb-1">{item.label}</p>
                  <p className={`text-3xl font-bold text-${item.color}-600`}>{item.value}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── USERS ── */}
        {!loading && activeTab === 'users' && (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <p className="text-sm text-gray-500">{users.length} usuarios</p>
              <button onClick={fetchUsers} className="flex items-center gap-1 text-sm text-blue-600">
                <RefreshCw className="w-4 h-4" /> Actualizar
              </button>
            </div>
            {users.map(user => (
              <div key={user.id} className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                <button
                  className="w-full flex items-center justify-between px-4 py-3"
                  onClick={() => setExpandedUser(expandedUser === user.id ? null : user.id)}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className={`w-2 h-2 rounded-full flex-shrink-0 ${user.suspended ? 'bg-red-500' : 'bg-green-500'}`} />
                    <div className="text-left min-w-0">
                      <p className="font-semibold text-gray-800 text-sm truncate">{user.name}</p>
                      <p className="text-xs text-gray-500 truncate">{user.email}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                      user.activeRole === 'PROFESSIONAL'
                        ? 'bg-purple-100 text-purple-700'
                        : 'bg-green-100 text-green-700'
                    }`}>
                      {user.activeRole === 'PROFESSIONAL' ? 'Prof.' : 'Cliente'}
                    </span>
                    {expandedUser === user.id
                      ? <ChevronUp className="w-4 h-4 text-gray-400" />
                      : <ChevronDown className="w-4 h-4 text-gray-400" />
                    }
                  </div>
                </button>

                {expandedUser === user.id && (
                  <div className="border-t border-gray-100 px-4 py-3 space-y-2">
                    <div className="grid grid-cols-2 gap-2 text-xs text-gray-600">
                      <span>ID: {user.id}</span>
                      <span>Ratings: {user.totalRatings}</span>
                      <span>Email verificado: {user.emailVerified ? '✅' : '❌'}</span>
                      <span>Auth: {user.authProvider}</span>
                    </div>
                    <button
                      onClick={() => toggleSuspend(user.id)}
                      disabled={actionLoading === user.id}
                      className={`w-full flex items-center justify-center gap-2 py-2 rounded-xl text-sm font-semibold transition-colors ${
                        user.suspended
                          ? 'bg-green-50 text-green-700 hover:bg-green-100'
                          : 'bg-red-50 text-red-700 hover:bg-red-100'
                      }`}
                    >
                      {actionLoading === user.id
                        ? <Loader2 className="w-4 h-4 animate-spin" />
                        : user.suspended
                          ? <><CheckCircle className="w-4 h-4" /> Reactivar cuenta</>
                          : <><Ban className="w-4 h-4" /> Suspender cuenta</>
                      }
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* ── RATINGS ── */}
        {!loading && activeTab === 'ratings' && (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <p className="text-sm text-gray-500">{ratings.length} calificaciones</p>
              <button onClick={fetchRatings} className="flex items-center gap-1 text-sm text-blue-600">
                <RefreshCw className="w-4 h-4" /> Actualizar
              </button>
            </div>
            {ratings.map(rating => (
              <div key={rating.id} className="bg-white rounded-2xl shadow-sm border border-gray-100 px-4 py-3">
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-yellow-500 font-bold text-sm">{'★'.repeat(rating.score)}</span>
                      <span className="text-xs text-gray-400">#{rating.id}</span>
                    </div>
                    <p className="text-xs text-gray-500">
                      <span className="font-medium text-gray-700">{rating.clientName}</span>
                      {' → '}
                      <span className="font-medium text-gray-700">{rating.professionalName}</span>
                    </p>
                    {rating.comment && (
                      <p className="text-xs text-gray-600 mt-1 italic">"{rating.comment}"</p>
                    )}
                  </div>
                  <button
                    onClick={() => setConfirmDelete(rating.id)}
                    className="flex-shrink-0 text-red-400 hover:text-red-600 transition-colors p-1"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modal confirmar eliminación */}
      {confirmDelete && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 max-w-sm w-full shadow-xl">
            <h3 className="font-bold text-gray-800 mb-2">¿Eliminar calificación?</h3>
            <p className="text-sm text-gray-600 mb-5">Esta acción no se puede deshacer.</p>
            <div className="flex gap-3">
              <button
                onClick={() => setConfirmDelete(null)}
                className="flex-1 py-2.5 rounded-xl border border-gray-200 text-gray-700 font-semibold text-sm"
              >
                Cancelar
              </button>
              <button
                onClick={() => deleteRating(confirmDelete)}
                disabled={actionLoading === confirmDelete}
                className="flex-1 py-2.5 rounded-xl bg-red-600 text-white font-semibold text-sm flex items-center justify-center gap-2"
              >
                {actionLoading === confirmDelete
                  ? <Loader2 className="w-4 h-4 animate-spin" />
                  : 'Eliminar'
                }
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default AdminDashboard;