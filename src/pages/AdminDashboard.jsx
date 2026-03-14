import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Users, Star, BarChart2, LogOut, ShieldAlert,
  ChevronDown, ChevronUp, Trash2, Ban, CheckCircle,
  Loader2, RefreshCw, Search, AlertTriangle
} from 'lucide-react';
import { BACKEND_URL } from '../config';
import { clearAuthData } from '../utils/authUtils';

const getToken = () => localStorage.getItem('authToken');

const authHeader = () => ({
  'Content-Type': 'application/json',
  Authorization: `Bearer ${getToken()}`
});

function ConfirmModal({ title, message, confirmLabel, confirmColor = 'red', onConfirm, onCancel, loading }) {
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl p-6 max-w-sm w-full shadow-xl">
        <div className="flex items-center gap-3 mb-3">
          <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${
            confirmColor === 'red' ? 'bg-red-100' : 'bg-yellow-100'
          }`}>
            <AlertTriangle className={`w-5 h-5 ${confirmColor === 'red' ? 'text-red-600' : 'text-yellow-600'}`} />
          </div>
          <h3 className="font-bold text-gray-800">{title}</h3>
        </div>
        <p className="text-sm text-gray-600 mb-5">{message}</p>
        <div className="flex gap-3">
          <button
            onClick={onCancel}
            disabled={loading}
            className="flex-1 py-2.5 rounded-xl border border-gray-200 text-gray-700 font-semibold text-sm hover:bg-gray-50 transition-colors"
          >
            Cancelar
          </button>
          <button
            onClick={onConfirm}
            disabled={loading}
            className={`flex-1 py-2.5 rounded-xl text-white font-semibold text-sm flex items-center justify-center gap-2 transition-colors ${
              confirmColor === 'red'
                ? 'bg-red-600 hover:bg-red-700'
                : 'bg-yellow-500 hover:bg-yellow-600'
            }`}
          >
            {loading
              ? <Loader2 className="w-4 h-4 animate-spin" />
              : confirmLabel
            }
          </button>
        </div>
      </div>
    </div>
  );
}

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
  const [userSearch, setUserSearch] = useState('');
  const [userRoleFilter, setUserRoleFilter] = useState('ALL');

  // Modales
  const [confirmSuspend, setConfirmSuspend] = useState(null);   // { id, name, suspended }
  const [confirmDeleteUser, setConfirmDeleteUser] = useState(null); // { id, name }
  const [confirmDeleteRating, setConfirmDeleteRating] = useState(null); // id

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

  const handleToggleSuspend = async () => {
    if (!confirmSuspend) return;
    setActionLoading(confirmSuspend.id);
    try {
      const res = await fetch(`${BACKEND_URL}/api/admin/users/${confirmSuspend.id}/suspend`, {
        method: 'PATCH',
        headers: authHeader()
      });
      if (!res.ok) throw new Error('Error al modificar usuario');
      setUsers(prev =>
        prev.map(u => u.id === confirmSuspend.id ? { ...u, suspended: !u.suspended } : u)
      );
      setConfirmSuspend(null);
    } catch (e) {
      setError(e.message);
    } finally {
      setActionLoading(null);
    }
  };

  const handleDeleteUser = async () => {
    if (!confirmDeleteUser) return;
    setActionLoading(confirmDeleteUser.id);
    try {
      const res = await fetch(`${BACKEND_URL}/api/admin/users/${confirmDeleteUser.id}`, {
        method: 'DELETE',
        headers: authHeader()
      });
      if (!res.ok) throw new Error('Error al eliminar usuario');
      setUsers(prev => prev.filter(u => u.id !== confirmDeleteUser.id));
      setExpandedUser(null);
      setConfirmDeleteUser(null);
    } catch (e) {
      setError(e.message);
    } finally {
      setActionLoading(null);
    }
  };

  const handleDeleteRating = async () => {
    if (!confirmDeleteRating) return;
    setActionLoading(confirmDeleteRating);
    try {
      const res = await fetch(`${BACKEND_URL}/api/admin/ratings/${confirmDeleteRating}`, {
        method: 'DELETE',
        headers: authHeader()
      });
      if (!res.ok) throw new Error('Error al eliminar calificación');
      setRatings(prev => prev.filter(r => r.id !== confirmDeleteRating));
      setConfirmDeleteRating(null);
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

  const filteredUsers = users.filter(user => {
    const matchesSearch =
      user.name.toLowerCase().includes(userSearch.toLowerCase()) ||
      user.email.toLowerCase().includes(userSearch.toLowerCase());
    const matchesRole =
      userRoleFilter === 'ALL' || user.activeRole === userRoleFilter;
    return matchesSearch && matchesRole;
  });

  const tabs = [
    { id: 'stats', label: 'Estadísticas', icon: BarChart2 },
    { id: 'users', label: 'Usuarios', icon: Users },
    { id: 'ratings', label: 'Calificaciones', icon: Star }
  ];

  const roleFilters = [
    { id: 'ALL', label: 'Todos' },
    { id: 'PROFESSIONAL', label: 'Profesionales' },
    { id: 'CLIENT', label: 'Clientes' }
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

            {/* Buscador */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                value={userSearch}
                onChange={e => setUserSearch(e.target.value)}
                placeholder="Buscar por nombre o email..."
                className="w-full pl-9 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-blue-400 bg-white"
              />
            </div>

            {/* Filtros de rol */}
            <div className="flex gap-2">
              {roleFilters.map(filter => (
                <button
                  key={filter.id}
                  onClick={() => setUserRoleFilter(filter.id)}
                  className={`flex-1 py-2 rounded-xl text-xs font-semibold transition-colors ${
                    userRoleFilter === filter.id
                      ? 'bg-blue-600 text-white'
                      : 'bg-white border border-gray-200 text-gray-600 hover:border-blue-300'
                  }`}
                >
                  {filter.label}
                </button>
              ))}
            </div>

            {/* Contador y refresh */}
            <div className="flex items-center justify-between">
              <p className="text-sm text-gray-500">
                {filteredUsers.length} de {users.length} usuarios
              </p>
              <button onClick={fetchUsers} className="flex items-center gap-1 text-sm text-blue-600">
                <RefreshCw className="w-4 h-4" /> Actualizar
              </button>
            </div>

            {/* Lista vacía */}
            {filteredUsers.length === 0 && (
              <div className="text-center py-8 text-gray-400 text-sm">
                No se encontraron usuarios
              </div>
            )}

            {/* Lista */}
            {filteredUsers.map(user => (
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

                    {/* Suspender / Reactivar */}
                    <button
                      onClick={() => setConfirmSuspend({ id: user.id, name: user.name, suspended: user.suspended })}
                      className={`w-full flex items-center justify-center gap-2 py-2 rounded-xl text-sm font-semibold transition-colors ${
                        user.suspended
                          ? 'bg-green-50 text-green-700 hover:bg-green-100'
                          : 'bg-yellow-50 text-yellow-700 hover:bg-yellow-100'
                      }`}
                    >
                      {user.suspended
                        ? <><CheckCircle className="w-4 h-4" /> Reactivar cuenta</>
                        : <><Ban className="w-4 h-4" /> Suspender cuenta</>
                      }
                    </button>

                    {/* Eliminar */}
                    <button
                      onClick={() => setConfirmDeleteUser({ id: user.id, name: user.name })}
                      className="w-full flex items-center justify-center gap-2 py-2 rounded-xl text-sm font-semibold bg-red-50 text-red-700 hover:bg-red-100 transition-colors"
                    >
                      <Trash2 className="w-4 h-4" /> Eliminar cuenta
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
                    onClick={() => setConfirmDeleteRating(rating.id)}
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

      {/* Modal — Suspender / Reactivar usuario */}
      {confirmSuspend && (
        <ConfirmModal
          title={confirmSuspend.suspended ? 'Reactivar cuenta' : 'Suspender cuenta'}
          message={
            confirmSuspend.suspended
              ? `¿Querés reactivar la cuenta de ${confirmSuspend.name}? El usuario podrá volver a iniciar sesión.`
              : `¿Querés suspender la cuenta de ${confirmSuspend.name}? El usuario no podrá iniciar sesión hasta que la reactives.`
          }
          confirmLabel={confirmSuspend.suspended ? 'Reactivar' : 'Suspender'}
          confirmColor={confirmSuspend.suspended ? 'yellow' : 'yellow'}
          onConfirm={handleToggleSuspend}
          onCancel={() => setConfirmSuspend(null)}
          loading={actionLoading === confirmSuspend.id}
        />
      )}

      {/* Modal — Eliminar usuario */}
      {confirmDeleteUser && (
        <ConfirmModal
          title="Eliminar cuenta"
          message={`¿Estás seguro de que querés eliminar la cuenta de ${confirmDeleteUser.name}? Se borrarán todos sus datos y esta acción no se puede deshacer.`}
          confirmLabel="Eliminar"
          confirmColor="red"
          onConfirm={handleDeleteUser}
          onCancel={() => setConfirmDeleteUser(null)}
          loading={actionLoading === confirmDeleteUser.id}
        />
      )}

      {/* Modal — Eliminar calificación */}
      {confirmDeleteRating && (
        <ConfirmModal
          title="Eliminar calificación"
          message="¿Estás seguro de que querés eliminar esta calificación? Esta acción no se puede deshacer."
          confirmLabel="Eliminar"
          confirmColor="red"
          onConfirm={handleDeleteRating}
          onCancel={() => setConfirmDeleteRating(null)}
          loading={actionLoading === confirmDeleteRating}
        />
      )}
    </div>
  );
}

export default AdminDashboard;