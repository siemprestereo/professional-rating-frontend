import { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Users, Star, BarChart2, LogOut, ShieldAlert,
  ChevronDown, ChevronUp, Trash2, Ban, CheckCircle,
  Loader2, RefreshCw, Search, AlertTriangle, FileText, TrendingUp,
  MessageSquare, Clock, XCircle, Mail, Send, User, Shield, Plus, Inbox, UserX, Settings, Bell
} from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { BACKEND_URL } from '../config';
import { clearAuthData } from '../utils/authUtils';
import ProfessionSelector from '../components/ProfessionSelector';

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
            className="flex-1 py-2.5 rounded-xl border border-gray-200 text-gray-700 font-semibold text-sm hover:bg-gray-50 transition-colors disabled:opacity-50"
          >
            Cancelar
          </button>
          <button
            onClick={onConfirm}
            disabled={loading}
            className={`flex-1 py-2.5 rounded-xl text-white font-semibold text-sm flex items-center justify-center gap-2 transition-colors disabled:opacity-50 ${
              confirmColor === 'red'
                ? 'bg-red-600 hover:bg-red-700'
                : 'bg-yellow-500 hover:bg-yellow-600'
            }`}
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}

function AdminDashboard() {
  const navigate = useNavigate();
  const [toast, setToast] = useState(null);
  const toastTimer = useRef(null);

  const showToast = useCallback((message, type = 'success') => {
    setToast({ message, type });
    clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => setToast(null), 3500);
  }, []);

  const [activeTab, setActiveTab] = useState('stats');
  const [stats, setStats] = useState(null);
  const [users, setUsers] = useState([]);
  const [ratings, setRatings] = useState([]);
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState(null);
  const [error, setError] = useState(null);
  const [expandedUser, setExpandedUser] = useState(null);
  const [userSearch, setUserSearch] = useState('');
  const [userRoleFilter, setUserRoleFilter] = useState('ALL');

  const [ratingSearch, setRatingSearch] = useState('');
  const [ratingScoreFilter, setRatingScoreFilter] = useState(0);
  const [ratingCommentFilter, setRatingCommentFilter] = useState('ALL');
  const [ratingTimeFilter, setRatingTimeFilter] = useState('ALL');
  const [ratingSortOrder, setRatingSortOrder] = useState('DESC');

  const [confirmSuspend, setConfirmSuspend] = useState(null);
  const [confirmDeleteUser, setConfirmDeleteUser] = useState(null);
  const [confirmDeleteRating, setConfirmDeleteRating] = useState(null);
  const [confirmClearComment, setConfirmClearComment] = useState(null);
  const [confirmResolveReport, setConfirmResolveReport] = useState(null);

  // Email
  const [emailMode, setEmailMode] = useState('broadcast'); // 'broadcast' | 'individual'
  const [emailReplyTo, setEmailReplyTo] = useState('hola@calificalo.com.ar');
  const [emailTargetRole, setEmailTargetRole] = useState('ALL');
  const [emailToAddress, setEmailToAddress] = useState('');
  const [emailToName, setEmailToName] = useState('');
  const [emailSubject, setEmailSubject] = useState('');
  const [emailBody, setEmailBody] = useState('');
  const [emailSending, setEmailSending] = useState(false);
  const [emailResult, setEmailResult] = useState(null); // { type: 'success'|'error', message }
  const [confirmBroadcast, setConfirmBroadcast] = useState(false);

  // Email history
  const [emailHistory, setEmailHistory] = useState([]);
  const [emailHistoryLoading, setEmailHistoryLoading] = useState(false);
  const [emailHistorySearch, setEmailHistorySearch] = useState('');

  // Inbox messages
  const [inboxMessages, setInboxMessages] = useState([]);
  const [inboxLoading, setInboxLoading] = useState(false);
  const [inboxSearch, setInboxSearch] = useState('');
  const [unreadCount, setUnreadCount] = useState(0);

  // Notifications
  const [notifTitle, setNotifTitle] = useState('');
  const [notifMessage, setNotifMessage] = useState('');
  const [notifTarget, setNotifTarget] = useState('ALL');
  const [notifUserId, setNotifUserId] = useState('');
  const [notifSending, setNotifSending] = useState(false);
  const [notifResult, setNotifResult] = useState(null);

  // Activity & Trends
  const [activityData, setActivityData] = useState(null);
  const [trendData, setTrendData] = useState([]);

  // User ratings (lazy per user)
  const [userRatings, setUserRatings] = useState({});
  const [userRatingsLoading, setUserRatingsLoading] = useState(new Set());
  const [expandedUserRatings, setExpandedUserRatings] = useState(null);

  // Resolved reports
  const [resolvedReports, setResolvedReports] = useState([]);
  const [resolvedReportsLoading, setResolvedReportsLoading] = useState(false);
  const [showResolvedReports, setShowResolvedReports] = useState(false);

  // Users extra filters
  const [showUnverifiedOnly, setShowUnverifiedOnly] = useState(false);

  // Moderación
  const [bannedWords, setBannedWords] = useState([]);
  const [newWord, setNewWord] = useState('');
  const [wordActionLoading, setWordActionLoading] = useState(false);
  const [wordError, setWordError] = useState('');
  const [wordListOpen, setWordListOpen] = useState(false);
  const [wordSearch, setWordSearch] = useState('');

  // Professions (config tab)
  const [professions, setProfessions] = useState([]);
  const [professionsLoading, setProfessionsLoading] = useState(false);
  const [addingProfession, setAddingProfession] = useState(false);
  const [newProfessionName, setNewProfessionName] = useState('');
  const [newProfessionCategory, setNewProfessionCategory] = useState('');
  const [newCategoryInput, setNewCategoryInput] = useState('');
  const [showPreview, setShowPreview] = useState(false);
  const [selectedProfIds, setSelectedProfIds] = useState(new Set());
  const [editingProf, setEditingProf] = useState(null); // {id, displayName, category}

  // Accept suggestion
  const [acceptingSuggestion, setAcceptingSuggestion] = useState(null); // {msgId, name} | null
  const [suggestionAccepting, setSuggestionAccepting] = useState(false);

  useEffect(() => {
    fetchUnreadCount();
  }, []);

  useEffect(() => {
    if (activeTab === 'stats') { fetchStats(); fetchActivity(); fetchTrends(); }
    if (activeTab === 'users') fetchUsers();
    if (activeTab === 'ratings') fetchRatings();
    if (activeTab === 'reports') { fetchReports(); fetchBannedWords(); }
    if (activeTab === 'config') fetchProfessions();
    if (activeTab === 'emails' && emailMode === 'history') fetchEmailHistory();
    if (activeTab === 'emails' && emailMode === 'messages') fetchInboxMessages();
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
      const data = await res.json();
      setUsers(data.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)));
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

  const fetchReports = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`${BACKEND_URL}/api/reports/admin/pending`, { headers: authHeader() });
      if (!res.ok) throw new Error('Error cargando denuncias');
      setReports(await res.json());
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
      const wasSuspended = confirmSuspend.suspended;
      setUsers(prev =>
        prev.map(u => u.id === confirmSuspend.id ? { ...u, suspended: !u.suspended } : u)
      );
      showToast(wasSuspended ? 'Cuenta reactivada' : 'Cuenta suspendida');
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
      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.error || errData.cause || 'Error al eliminar usuario');
      }
      const deletedName = confirmDeleteUser.name;
      setUsers(prev => prev.filter(u => u.id !== confirmDeleteUser.id));
      setExpandedUser(null);
      setConfirmDeleteUser(null);
      showToast(`Usuario "${deletedName}" eliminado`);
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
      showToast('Calificación eliminada correctamente', 'success');
    } catch (e) {
      setError(e.message);
    } finally {
      setActionLoading(null);
    }
  };

  const handleClearComment = async () => {
    if (!confirmClearComment) return;
    setActionLoading(confirmClearComment);
    try {
      const res = await fetch(`${BACKEND_URL}/api/admin/ratings/${confirmClearComment}/clear-comment`, {
        method: 'PATCH',
        headers: authHeader()
      });
      if (!res.ok) throw new Error('Error al borrar comentario');
      setRatings(prev => prev.map(r => r.id === confirmClearComment ? { ...r, comment: null } : r));
      setConfirmClearComment(null);
      showToast('Comentario eliminado correctamente', 'success');
    } catch (e) {
      setError(e.message);
    } finally {
      setActionLoading(null);
    }
  };

  const handleResolveReport = async () => {
    if (!confirmResolveReport) return;
    setActionLoading(confirmResolveReport.id);
    try {
      const res = await fetch(`${BACKEND_URL}/api/reports/admin/${confirmResolveReport.id}/resolve`, {
        method: 'PATCH',
        headers: authHeader(),
        body: JSON.stringify({
          status: confirmResolveReport.action,
          adminNotes: confirmResolveReport.notes || ''
        })
      });
      if (!res.ok) throw new Error('Error al resolver denuncia');
      setReports(prev => prev.filter(r => r.id !== confirmResolveReport.id));
      setConfirmResolveReport(null);
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
    const matchesRole = userRoleFilter === 'ALL' || user.activeRole === userRoleFilter;
    const matchesVerified = !showUnverifiedOnly || !user.emailVerified;
    return matchesSearch && matchesRole && matchesVerified;
  });

  const getTimeThreshold = () => {
    const now = new Date();
    if (ratingTimeFilter === '1h') return new Date(now - 1 * 60 * 60 * 1000);
    if (ratingTimeFilter === '1d') return new Date(now - 24 * 60 * 60 * 1000);
    if (ratingTimeFilter === '1w') return new Date(now - 7 * 24 * 60 * 60 * 1000);
    if (ratingTimeFilter === '1m') return new Date(now - 30 * 24 * 60 * 60 * 1000);
    return null;
  };

  const filteredRatings = ratings
    .filter(r => {
      const matchesSearch =
        r.clientName?.toLowerCase().includes(ratingSearch.toLowerCase()) ||
        r.professionalName?.toLowerCase().includes(ratingSearch.toLowerCase());
      const matchesScore = ratingScoreFilter === 0 || r.score === ratingScoreFilter;
      const matchesComment =
        ratingCommentFilter === 'ALL' ||
        (ratingCommentFilter === 'WITH' && r.comment && r.comment.trim().length > 0) ||
        (ratingCommentFilter === 'WITHOUT' && (!r.comment || r.comment.trim().length === 0));
      const threshold = getTimeThreshold();
      const matchesTime = !threshold || new Date(r.createdAt) >= threshold;
      return matchesSearch && matchesScore && matchesComment && matchesTime;
    })
    .sort((a, b) => {
      const dateA = new Date(a.createdAt);
      const dateB = new Date(b.createdAt);
      return ratingSortOrder === 'DESC' ? dateB - dateA : dateA - dateB;
    });

  const hasActiveRatingFilters =
    ratingSearch !== '' ||
    ratingScoreFilter !== 0 ||
    ratingCommentFilter !== 'ALL' ||
    ratingTimeFilter !== 'ALL' ||
    ratingSortOrder !== 'DESC';

  const resetRatingFilters = () => {
    setRatingSearch('');
    setRatingScoreFilter(0);
    setRatingCommentFilter('ALL');
    setRatingTimeFilter('ALL');
    setRatingSortOrder('DESC');
  };

  const REASON_LABELS = {
    FAKE_REVIEW: 'Reseña falsa',
    OFFENSIVE_CONTENT: 'Contenido ofensivo',
    WRONG_PERSON: 'Persona equivocada',
    BLACKMAIL: 'Extorsión o amenaza',
    OTHER: 'Otro motivo',
  };

  const fetchEmailHistory = async () => {
    setEmailHistoryLoading(true);
    try {
      const res = await fetch(`${BACKEND_URL}/api/admin/email/log`, { headers: authHeader() });
      if (!res.ok) throw new Error();
      setEmailHistory(await res.json());
    } catch {
      // silent
    } finally {
      setEmailHistoryLoading(false);
    }
  };

  const fetchInboxMessages = async () => {
    setInboxLoading(true);
    try {
      const res = await fetch(`${BACKEND_URL}/api/admin/messages`, { headers: authHeader() });
      if (res.ok) setInboxMessages(await res.json());
    } finally {
      setInboxLoading(false);
    }
  };

  const fetchUnreadCount = async () => {
    try {
      const res = await fetch(`${BACKEND_URL}/api/admin/messages/unread-count`, { headers: authHeader() });
      if (res.ok) {
        const data = await res.json();
        setUnreadCount(data.count);
      }
    } catch {}
  };

  const fetchBannedWords = async () => {
    try {
      const res = await fetch(`${BACKEND_URL}/api/admin/banned-words`, { headers: authHeader() });
      if (!res.ok) throw new Error();
      setBannedWords(await res.json());
    } catch {
      setWordError('Error cargando palabras');
    }
  };

  const fetchProfessions = async () => {
    setProfessionsLoading(true);
    try {
      const res = await fetch(`${BACKEND_URL}/api/admin/professions`, { headers: authHeader() });
      if (res.ok) setProfessions(await res.json());
    } finally {
      setProfessionsLoading(false);
    }
  };

  const fetchActivity = async () => {
    try {
      const res = await fetch(`${BACKEND_URL}/api/admin/stats/activity`, { headers: authHeader() });
      if (!res.ok) throw new Error();
      setActivityData(await res.json());
    } catch { /* silent */ }
  };

  const fetchTrends = async () => {
    try {
      const res = await fetch(`${BACKEND_URL}/api/admin/stats/trends`, { headers: authHeader() });
      if (!res.ok) throw new Error();
      setTrendData(await res.json());
    } catch { /* silent */ }
  };

  const fetchUserRatings = async (userId) => {
    if (userRatings[userId] !== undefined) return;
    setUserRatingsLoading(prev => new Set(prev).add(userId));
    try {
      const res = await fetch(`${BACKEND_URL}/api/admin/users/${userId}/ratings`, { headers: authHeader() });
      if (!res.ok) throw new Error();
      const data = await res.json();
      setUserRatings(prev => ({ ...prev, [userId]: data }));
    } catch {
      setUserRatings(prev => ({ ...prev, [userId]: [] }));
    } finally {
      setUserRatingsLoading(prev => { const s = new Set(prev); s.delete(userId); return s; });
    }
  };

  const fetchResolvedReports = async () => {
    setResolvedReportsLoading(true);
    try {
      const res = await fetch(`${BACKEND_URL}/api/reports/admin`, { headers: authHeader() });
      if (!res.ok) throw new Error();
      const all = await res.json();
      setResolvedReports(all.filter(r => r.status !== 'PENDING'));
    } catch { /* silent */ } finally {
      setResolvedReportsLoading(false);
    }
  };

  const handleAddWord = async () => {
    const word = newWord.trim().toLowerCase();
    if (!word) return;
    setWordActionLoading(true);
    setWordError('');
    try {
      const res = await fetch(`${BACKEND_URL}/api/admin/banned-words`, {
        method: 'POST',
        headers: authHeader(),
        body: JSON.stringify({ word })
      });
      const data = await res.json();
      if (!res.ok) { setWordError(data.error || 'Error'); return; }
      setBannedWords(prev => [...prev, data].sort((a, b) => a.word.localeCompare(b.word)));
      setNewWord('');
    } catch {
      setWordError('Error al agregar');
    } finally {
      setWordActionLoading(false);
    }
  };

  const handleDeleteWord = async (id) => {
    setWordActionLoading(id);
    try {
      await fetch(`${BACKEND_URL}/api/admin/banned-words/${id}`, { method: 'DELETE', headers: authHeader() });
      setBannedWords(prev => prev.filter(w => w.id !== id));
    } catch {
      setWordError('Error al eliminar');
    } finally {
      setWordActionLoading(false);
    }
  };

  const handleAddProfession = async () => {
    if (!newProfessionName.trim()) return;
    const category = newProfessionCategory === '__new__' ? newCategoryInput.trim() : newProfessionCategory.trim();
    setAddingProfession(true);
    try {
      const res = await fetch(`${BACKEND_URL}/api/admin/professions`, {
        method: 'POST',
        headers: { ...authHeader(), 'Content-Type': 'application/json' },
        body: JSON.stringify({ displayName: newProfessionName.trim(), category: category || null })
      });
      if (res.ok) {
        setNewProfessionName('');
        setNewProfessionCategory('');
        setNewCategoryInput('');
        await fetchProfessions();
      }
    } finally {
      setAddingProfession(false);
    }
  };

  const handleToggleProfession = async (id) => {
    const res = await fetch(`${BACKEND_URL}/api/admin/professions/${id}/toggle`, {
      method: 'PATCH',
      headers: authHeader()
    });
    if (res.ok) {
      setProfessions(prev => prev.map(p => p.id === id ? { ...p, active: !p.active } : p));
    }
  };

  const toggleProfSelection = (id) => {
    setSelectedProfIds(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const handleDeleteSelected = async () => {
    if (!window.confirm(`¿Borrar ${selectedProfIds.size} profesión(es)?`)) return;
    await Promise.all([...selectedProfIds].map(id =>
      fetch(`${BACKEND_URL}/api/admin/professions/${id}`, { method: 'DELETE', headers: authHeader() })
    ));
    setSelectedProfIds(new Set());
    fetchProfessions();
  };

  const handleSaveEdit = async () => {
    if (!editingProf || !editingProf.displayName.trim()) return;
    const res = await fetch(`${BACKEND_URL}/api/admin/professions/${editingProf.id}`, {
      method: 'PUT',
      headers: { ...authHeader(), 'Content-Type': 'application/json' },
      body: JSON.stringify({ displayName: editingProf.displayName, category: editingProf.category || null })
    });
    if (res.ok) {
      setEditingProf(null);
      setSelectedProfIds(new Set());
      fetchProfessions();
    }
  };

  const handleAcceptSuggestion = async () => {
    if (!acceptingSuggestion?.name?.trim()) return;
    setSuggestionAccepting(true);
    try {
      const res = await fetch(`${BACKEND_URL}/api/admin/messages/${acceptingSuggestion.msgId}/accept-suggestion`, {
        method: 'POST',
        headers: { ...authHeader(), 'Content-Type': 'application/json' },
        body: JSON.stringify({ displayName: acceptingSuggestion.name.trim() })
      });
      if (res.ok) {
        setInboxMessages(prev => prev.map(m => m.id === acceptingSuggestion.msgId
          ? { ...m, status: 'RESOLVED', read: true }
          : m
        ));
        setUnreadCount(prev => Math.max(0, prev - 1));
        setAcceptingSuggestion(null);
        fetchProfessions(); // refresh profession list if config tab is open
      }
    } finally {
      setSuggestionAccepting(false);
    }
  };

  const tabs = [
    { id: 'stats',   label: 'Stats',    icon: BarChart2 },
    { id: 'users',   label: 'Usuarios', icon: Users },
    { id: 'ratings', label: 'Calif.',   icon: Star },
    { id: 'reports', label: 'Denuncias',icon: ShieldAlert },
    { id: 'emails',  label: 'Emails',   icon: Mail },
    { id: 'config',  label: 'Config.',  icon: Settings },
    { id: 'notifs',  label: 'Notifs.',  icon: Bell },
  ];

  const EMAIL_ALIASES = [
    { value: 'hola@calificalo.com.ar',        label: 'hola@ — General' },
    { value: 'soporte@calificalo.com.ar',      label: 'soporte@ — Soporte' },
    { value: 'noresponder@calificalo.com.ar',  label: 'noresponder@ — Transaccional' },
  ];

  const handleSendIndividual = async () => {
    setEmailSending(true);
    setEmailResult(null);
    try {
      const res = await fetch(`${BACKEND_URL}/api/admin/email/individual`, {
        method: 'POST',
        headers: authHeader(),
        body: JSON.stringify({ toEmail: emailToAddress, toName: emailToName, subject: emailSubject, message: emailBody, replyTo: emailReplyTo })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Error al enviar');
      setEmailToAddress(''); setEmailToName(''); setEmailSubject(''); setEmailBody('');
      setEmailMode('history');
      fetchEmailHistory();
    } catch (e) {
      setEmailResult({ type: 'error', message: e.message });
    } finally {
      setEmailSending(false);
    }
  };

  const handleSendBroadcast = async () => {
    setConfirmBroadcast(false);
    setEmailSending(true);
    setEmailResult(null);
    try {
      const res = await fetch(`${BACKEND_URL}/api/admin/email/broadcast`, {
        method: 'POST',
        headers: authHeader(),
        body: JSON.stringify({ targetRole: emailTargetRole, subject: emailSubject, message: emailBody, replyTo: emailReplyTo })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Error al enviar');
      setEmailSubject(''); setEmailBody('');
      setEmailMode('history');
      fetchEmailHistory();
    } catch (e) {
      setEmailResult({ type: 'error', message: e.message });
    } finally {
      setEmailSending(false);
    }
  };

  const roleFilters = [
    { id: 'ALL',          label: 'Todos' },
    { id: 'PROFESSIONAL', label: 'Profesionales' },
    { id: 'CLIENT',       label: 'Clientes' }
  ];

  const timeFilters = [
    { id: 'ALL', label: 'Todas' },
    { id: '1h',  label: '1 hora' },
    { id: '1d',  label: '1 día' },
    { id: '1w',  label: '1 semana' },
    { id: '1m',  label: '1 mes' },
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
              className={`flex-1 flex flex-col items-center py-3 text-xs font-semibold transition-colors gap-1 relative ${
                activeTab === tab.id
                  ? 'text-blue-600 border-b-2 border-blue-600'
                  : 'text-gray-500'
              }`}
            >
              <Icon className="w-5 h-5" />
              {tab.label}
              {tab.id === 'reports' && reports.length > 0 && activeTab !== 'reports' && (
                <span className="absolute top-1.5 right-3 w-4 h-4 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                  {reports.length}
                </span>
              )}
              {tab.id === 'emails' && unreadCount > 0 && activeTab !== 'emails' && (
                <span className="absolute top-1.5 right-3 w-4 h-4 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                  {unreadCount}
                </span>
              )}
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
                { label: 'Usuarios totales',  value: stats.totalUsers,                color: 'blue' },
                { label: 'Profesionales',     value: stats.totalProfessionals,        color: 'purple' },
                { label: 'Clientes',          value: stats.totalClients,              color: 'green' },
                { label: 'Suspendidos',       value: stats.suspendedUsers,            color: 'red' },
                { label: 'Calificaciones',    value: stats.totalRatings,              color: 'yellow' },
                { label: 'Promedio score',    value: stats.averageScore?.toFixed(2),  color: 'indigo' }
              ].map(item => (
                <div key={item.label} className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
                  <p className="text-xs text-gray-500 mb-1">{item.label}</p>
                  <p className={`text-3xl font-bold text-${item.color}-600`}>{item.value}</p>
                </div>
              ))}
            </div>

            {/* Tendencia */}
            {trendData.length > 0 && (
              <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
                <h3 className="text-sm font-bold text-gray-700 mb-4">Tendencia — últimas 8 semanas</h3>
                <ResponsiveContainer width="100%" height={160}>
                  <BarChart data={trendData} margin={{ top: 5, right: 5, left: -22, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis dataKey="week" tick={{ fontSize: 10 }} />
                    <YAxis tick={{ fontSize: 10 }} allowDecimals={false} />
                    <Tooltip />
                    <Legend iconSize={10} wrapperStyle={{ fontSize: 11 }} />
                    <Bar dataKey="registrations" name="Registros" fill="#3b82f6" radius={[2, 2, 0, 0]} />
                    <Bar dataKey="ratings" name="Calificaciones" fill="#f59e0b" radius={[2, 2, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}

            {/* Actividad reciente */}
            {activityData && (
              <div className="space-y-3">
                <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
                  <h3 className="text-sm font-bold text-gray-700 mb-3">Últimas registraciones</h3>
                  <div className="space-y-2.5">
                    {activityData.recentUsers.map(u => (
                      <div key={u.id} className="flex items-center justify-between text-xs gap-2">
                        <div className="min-w-0">
                          <p className="font-medium text-gray-800 truncate">{u.name}</p>
                          <p className="text-gray-400 truncate">{u.email}</p>
                        </div>
                        <div className="flex items-center gap-2 flex-shrink-0">
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-medium ${
                            u.activeRole === 'PROFESSIONAL' ? 'bg-purple-100 text-purple-700' : 'bg-green-100 text-green-700'
                          }`}>
                            {u.activeRole === 'PROFESSIONAL' ? 'Prof.' : 'Cliente'}
                          </span>
                          <span className="text-gray-400">{u.createdAt ? new Date(u.createdAt).toLocaleDateString('es-AR') : '—'}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
                  <h3 className="text-sm font-bold text-gray-700 mb-3">Últimas calificaciones</h3>
                  <div className="space-y-2.5">
                    {activityData.recentRatings.map(r => (
                      <div key={r.id} className="flex items-center justify-between text-xs gap-2">
                        <div className="min-w-0">
                          <p className="font-medium text-gray-800 truncate">{r.professionalName}</p>
                          <p className="text-gray-400 truncate">por {r.clientName}</p>
                        </div>
                        <div className="flex items-center gap-2 flex-shrink-0">
                          <span className="text-yellow-500 font-bold">{'★'.repeat(r.score)}</span>
                          <span className="text-gray-400">{new Date(r.createdAt).toLocaleDateString('es-AR')}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ── USERS ── */}
        {!loading && activeTab === 'users' && (
          <div className="space-y-3">
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
              <button
                onClick={() => setShowUnverifiedOnly(p => !p)}
                className={`px-3 py-2 rounded-xl text-xs font-semibold transition-colors flex items-center gap-1 ${
                  showUnverifiedOnly
                    ? 'bg-orange-500 text-white'
                    : 'bg-white border border-gray-200 text-gray-600 hover:border-orange-300'
                }`}
              >
                <UserX className="w-3.5 h-3.5" /> Sin verificar
              </button>
            </div>

            <div className="flex items-center justify-between">
              <p className="text-sm text-gray-500">{filteredUsers.length} de {users.length} usuarios</p>
              <button onClick={fetchUsers} className="flex items-center gap-1 text-sm text-blue-600">
                <RefreshCw className="w-4 h-4" /> Actualizar
              </button>
            </div>

            {filteredUsers.length === 0 && (
              <div className="text-center py-8 text-gray-400 text-sm">No se encontraron usuarios</div>
            )}

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
                      <span>Email verificado: {user.emailVerified ? '✅' : '❌'}</span>
                      <span>Auth: {user.authProvider}</span>
                      {user.createdAt && (
                        <span>Registro: {new Date(user.createdAt).toLocaleDateString('es-AR')}</span>
                      )}
                    </div>

                    {user.activeRole === 'PROFESSIONAL' ? (
                      <div className="bg-purple-50 rounded-xl px-3 py-2 grid grid-cols-2 gap-2 text-xs">
                        <div>
                          <p className="text-gray-500">Calificaciones recibidas</p>
                          <p className="font-bold text-purple-700 text-base">{user.totalRatings}</p>
                        </div>
                      </div>
                    ) : (
                      <div className="bg-green-50 rounded-xl px-3 py-2 grid grid-cols-2 gap-2 text-xs">
                        <div>
                          <p className="text-gray-500">Calificaciones emitidas</p>
                          <p className="font-bold text-green-700 text-base">{user.totalRatings}</p>
                        </div>
                        <div>
                          <p className="text-gray-500">Promedio dado</p>
                          <p className="font-bold text-green-700 text-base">
                            {user.averageScoreGiven > 0 ? `${user.averageScoreGiven.toFixed(1)} ★` : '—'}
                          </p>
                        </div>
                      </div>
                    )}

                    {user.activeRole === 'PROFESSIONAL' && (
                      <div className="grid grid-cols-2 gap-2">
                        <button
                          onClick={() => window.open(`/professional/${user.publicSlug || user.id}`, '_blank')}
                          className="flex items-center justify-center gap-1.5 py-2 rounded-xl text-xs font-semibold bg-purple-50 text-purple-700 hover:bg-purple-100 transition-colors"
                        >
                          <FileText className="w-3.5 h-3.5" /> Ver CV
                        </button>
                        <button
                          onClick={() => window.open(`/stats-public/${user.publicSlug || user.id}`, '_blank')}
                          className="flex items-center justify-center gap-1.5 py-2 rounded-xl text-xs font-semibold bg-blue-50 text-blue-700 hover:bg-blue-100 transition-colors"
                        >
                          <TrendingUp className="w-3.5 h-3.5" /> Ver Stats
                        </button>
                      </div>
                    )}

                    <button
                      onClick={() => {
                        setEmailMode('individual');
                        setEmailToAddress(user.email);
                        setEmailToName(user.name);
                        setEmailSubject('');
                        setEmailBody('');
                        setEmailResult(null);
                        setActiveTab('emails');
                      }}
                      className="w-full flex items-center justify-center gap-2 py-2 rounded-xl text-sm font-semibold bg-blue-50 text-blue-700 hover:bg-blue-100 transition-colors"
                    >
                      <Mail className="w-4 h-4" /> Enviar email
                    </button>

                    <button
                      onClick={() => {
                        setNotifTarget('USER');
                        setNotifUserId(String(user.id));
                        setNotifTitle('');
                        setNotifMessage('');
                        setNotifResult(null);
                        setActiveTab('notifs');
                      }}
                      className="w-full flex items-center justify-center gap-2 py-2 rounded-xl text-sm font-semibold bg-purple-50 text-purple-700 hover:bg-purple-100 transition-colors"
                    >
                      <Bell className="w-4 h-4" /> Enviar notificación
                    </button>

                    {!user.emailVerified && (
                      <button
                        onClick={async () => {
                          const res = await fetch(`${BACKEND_URL}/api/admin/users/${user.id}/verify-email`, {
                            method: 'PATCH', headers: authHeader()
                          });
                          if (res.ok) {
                            setUsers(prev => prev.map(u => u.id === user.id ? { ...u, emailVerified: true } : u));
                            showToast('Email verificado correctamente');
                          } else {
                            showToast('Error al verificar email', 'error');
                          }
                        }}
                        className="w-full flex items-center justify-center gap-2 py-2 rounded-xl text-sm font-semibold bg-teal-50 text-teal-700 hover:bg-teal-100 transition-colors"
                      >
                        <CheckCircle className="w-4 h-4" /> Verificar email manualmente
                      </button>
                    )}

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

                    <button
                      onClick={() => setConfirmDeleteUser({ id: user.id, name: user.name })}
                      className="w-full flex items-center justify-center gap-2 py-2 rounded-xl text-sm font-semibold bg-red-50 text-red-700 hover:bg-red-100 transition-colors"
                    >
                      <Trash2 className="w-4 h-4" /> Eliminar cuenta
                    </button>

                    {/* Calificaciones del usuario */}
                    <div className="border-t border-gray-100 pt-2">
                      <button
                        onClick={() => {
                          if (expandedUserRatings === user.id) {
                            setExpandedUserRatings(null);
                          } else {
                            setExpandedUserRatings(user.id);
                            fetchUserRatings(user.id);
                          }
                        }}
                        className="w-full flex items-center justify-between py-1.5 text-xs font-semibold text-gray-600 hover:text-gray-800"
                      >
                        <span className="flex items-center gap-1.5">
                          <Star className="w-3.5 h-3.5 text-yellow-500" />
                          Calificaciones ({user.totalRatings})
                        </span>
                        {expandedUserRatings === user.id ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                      </button>

                      {expandedUserRatings === user.id && (
                        <div className="mt-2 space-y-1.5">
                          {userRatingsLoading.has(user.id) ? (
                            <div className="flex justify-center py-3">
                              <Loader2 className="w-4 h-4 animate-spin text-gray-400" />
                            </div>
                          ) : userRatings[user.id]?.length === 0 ? (
                            <p className="text-xs text-gray-400 text-center py-2">Sin calificaciones</p>
                          ) : userRatings[user.id]?.map(r => (
                            <div key={r.id} className="bg-gray-50 rounded-xl px-3 py-2 text-xs">
                              <div className="flex items-center justify-between gap-2 mb-0.5">
                                <span className="text-yellow-500 font-bold">{'★'.repeat(r.score)}</span>
                                <span className="text-gray-400">{new Date(r.createdAt).toLocaleDateString('es-AR')}</span>
                              </div>
                              <p className="text-gray-600 truncate">
                                {user.activeRole === 'PROFESSIONAL'
                                  ? `por ${r.clientName}`
                                  : `a ${r.professionalName}`}
                              </p>
                              {r.comment && <p className="text-gray-500 italic truncate mt-0.5">"{r.comment}"</p>}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* ── RATINGS ── */}
        {!loading && activeTab === 'ratings' && (
          <div className="space-y-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                value={ratingSearch}
                onChange={e => setRatingSearch(e.target.value)}
                placeholder="Buscar por cliente o profesional..."
                className="w-full pl-9 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-blue-400 bg-white"
              />
            </div>

            <div className="flex gap-1.5">
              {[0, 1, 2, 3, 4, 5].map(score => (
                <button
                  key={score}
                  onClick={() => setRatingScoreFilter(score)}
                  className={`flex-1 py-2 rounded-xl text-xs font-semibold transition-colors ${
                    ratingScoreFilter === score
                      ? 'bg-yellow-500 text-white'
                      : 'bg-white border border-gray-200 text-gray-600 hover:border-yellow-300'
                  }`}
                >
                  {score === 0 ? 'Todos' : `${score}★`}
                </button>
              ))}
            </div>

            <div className="flex gap-2">
              {[
                { id: 'ALL',     label: 'Todos' },
                { id: 'WITH',    label: 'Con comentario' },
                { id: 'WITHOUT', label: 'Sin comentario' }
              ].map(f => (
                <button
                  key={f.id}
                  onClick={() => setRatingCommentFilter(f.id)}
                  className={`flex-1 py-2 rounded-xl text-xs font-semibold transition-colors flex items-center justify-center gap-1 ${
                    ratingCommentFilter === f.id
                      ? 'bg-blue-600 text-white'
                      : 'bg-white border border-gray-200 text-gray-600 hover:border-blue-300'
                  }`}
                >
                  {f.id === 'WITH' && <MessageSquare className="w-3 h-3" />}
                  {f.label}
                </button>
              ))}
            </div>

            <div className="flex gap-1.5">
              {timeFilters.map(f => (
                <button
                  key={f.id}
                  onClick={() => setRatingTimeFilter(f.id)}
                  className={`flex-1 py-1.5 rounded-xl text-xs font-semibold transition-colors flex items-center justify-center gap-1 ${
                    ratingTimeFilter === f.id
                      ? 'bg-purple-600 text-white'
                      : 'bg-white border border-gray-200 text-gray-600 hover:border-purple-300'
                  }`}
                >
                  {f.id !== 'ALL' && <Clock className="w-3 h-3" />}
                  {f.label}
                </button>
              ))}
            </div>

            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <p className="text-sm text-gray-500">
                  {filteredRatings.length} de {ratings.length}
                </p>
                {hasActiveRatingFilters && (
                  <button
                    onClick={resetRatingFilters}
                    className="text-xs text-red-500 hover:text-red-700 font-semibold"
                  >
                    Limpiar filtros
                  </button>
                )}
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setRatingSortOrder(prev => prev === 'DESC' ? 'ASC' : 'DESC')}
                  className="flex items-center gap-1 text-xs font-semibold text-gray-600 bg-white border border-gray-200 px-3 py-1.5 rounded-xl hover:border-gray-400 transition-colors"
                >
                  {ratingSortOrder === 'DESC' ? '↓ Más recientes' : '↑ Más antiguos'}
                </button>
                <button onClick={fetchRatings} className="flex items-center gap-1 text-sm text-blue-600">
                  <RefreshCw className="w-4 h-4" />
                </button>
              </div>
            </div>

            {filteredRatings.length === 0 && (
              <div className="text-center py-8 text-gray-400 text-sm">
                No se encontraron calificaciones
              </div>
            )}

            {filteredRatings.map(rating => (
              <div key={rating.id} className="bg-white rounded-2xl shadow-sm border border-gray-100 px-4 py-3">
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-yellow-500 font-bold text-sm">{'★'.repeat(rating.score)}</span>
                      <span className="text-xs text-gray-400">#{rating.id}</span>
                      {rating.createdAt && (
                        <span className="text-xs text-gray-400">
                          {new Date(rating.createdAt).toLocaleDateString('es-AR')}
                        </span>
                      )}
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
                  <div className="flex items-center gap-1 flex-shrink-0">
                    {rating.comment && (
                      <button
                        onClick={() => setConfirmClearComment(rating.id)}
                        title="Borrar solo el comentario"
                        className="text-orange-400 hover:text-orange-600 transition-colors p-1"
                      >
                        <MessageSquare className="w-4 h-4" />
                      </button>
                    )}
                    <button
                      onClick={() => setConfirmDeleteRating(rating.id)}
                      title="Eliminar calificación completa"
                      className="text-red-400 hover:text-red-600 transition-colors p-1"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* ── REPORTS ── */}
        {!loading && activeTab === 'reports' && (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <p className="text-sm text-gray-500">
                {reports.length} denuncia{reports.length !== 1 ? 's' : ''} pendiente{reports.length !== 1 ? 's' : ''}
              </p>
              <button onClick={fetchReports} className="flex items-center gap-1 text-sm text-blue-600">
                <RefreshCw className="w-4 h-4" /> Actualizar
              </button>
            </div>

            {reports.length === 0 && (
              <div className="text-center py-12">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <CheckCircle className="w-8 h-8 text-green-500" />
                </div>
                <p className="text-gray-500 text-sm font-medium">No hay denuncias pendientes</p>
              </div>
            )}

            {reports.map(report => (
              <div key={report.id} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 space-y-3">

                {/* Encabezado */}
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xs font-bold text-orange-600 bg-orange-50 px-2 py-0.5 rounded-full">
                        {REASON_LABELS[report.reason] ?? report.reason}
                      </span>
                      <span className="text-xs text-gray-400">#{report.id}</span>
                    </div>
                    <p className="text-xs text-gray-500">
                      Denunciante:{' '}
                      <span className="font-medium text-gray-700">
                        {report.reporterName || report.professionalName || `ID ${report.reporterId}`}
                      </span>
                    </p>
                  </div>
                  <span className="text-xs text-gray-400 flex-shrink-0">
                    {new Date(report.createdAt).toLocaleDateString('es-AR')}
                  </span>
                </div>

                {/* Calificación denunciada */}
                <div className="bg-gray-50 rounded-xl p-3 text-xs space-y-1">
                  <p className="text-gray-400 font-medium uppercase tracking-wide text-[10px] mb-1">Calificación denunciada</p>
                  <div className="flex items-center gap-2">
                    <span className="text-yellow-500 font-bold">{'★'.repeat(report.ratingScore)}</span>
                    <span className="text-gray-500">
                      por <span className="font-medium text-gray-700">{report.clientName || 'Anónimo'}</span>
                      {' → '}
                      <span className="font-medium text-gray-700">{report.professionalName}</span>
                    </span>
                  </div>
                  {report.ratingComment && (
                    <p className="text-gray-600 italic">"{report.ratingComment}"</p>
                  )}
                </div>

                {/* Descripción del denunciante */}
                {report.description && (
                  <div className="text-xs text-gray-600 bg-orange-50 rounded-xl px-3 py-2">
                    <p className="font-medium text-orange-700 mb-0.5">Descripción:</p>
                    <p>"{report.description}"</p>
                  </div>
                )}

                {/* Acciones */}
                <div className="flex gap-2 pt-1">
                  <button
                    onClick={() => setConfirmResolveReport({ id: report.id, action: 'APPROVED' })}
                    className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl text-xs font-semibold bg-red-50 text-red-700 hover:bg-red-100 transition-colors"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    Eliminar calificación
                  </button>
                  <button
                    onClick={() => setConfirmResolveReport({ id: report.id, action: 'REJECTED' })}
                    className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl text-xs font-semibold bg-gray-100 text-gray-600 hover:bg-gray-200 transition-colors"
                  >
                    <XCircle className="w-3.5 h-3.5" />
                    Rechazar denuncia
                  </button>
                </div>
              </div>
            ))}

            {/* Denuncias resueltas */}
            <div className="border-t border-gray-100 pt-2">
              <button
                onClick={() => {
                  const next = !showResolvedReports;
                  setShowResolvedReports(next);
                  if (next && resolvedReports.length === 0) fetchResolvedReports();
                }}
                className="w-full flex items-center justify-between py-2 text-sm font-semibold text-gray-500 hover:text-gray-700 transition-colors"
              >
                <span>Denuncias resueltas {resolvedReports.length > 0 ? `(${resolvedReports.length})` : ''}</span>
                {showResolvedReports ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
              </button>

              {showResolvedReports && (
                <div className="space-y-2 mt-1">
                  {resolvedReportsLoading ? (
                    <div className="flex justify-center py-6"><Loader2 className="w-5 h-5 animate-spin text-gray-400" /></div>
                  ) : resolvedReports.length === 0 ? (
                    <p className="text-sm text-gray-400 text-center py-4">No hay denuncias resueltas aún.</p>
                  ) : resolvedReports.map(report => (
                    <div key={report.id} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-3 space-y-1.5">
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-xs font-bold text-gray-500 bg-gray-100 px-2 py-0.5 rounded-full">
                          {REASON_LABELS[report.reason] ?? report.reason}
                        </span>
                        <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
                          report.status === 'APPROVED'
                            ? 'bg-red-100 text-red-700'
                            : 'bg-gray-100 text-gray-600'
                        }`}>
                          {report.status === 'APPROVED' ? 'Aprobada' : 'Rechazada'}
                        </span>
                      </div>
                      <p className="text-xs text-gray-500">
                        <span className="font-medium text-gray-700">{report.reporterName}</span>
                        {' · '}
                        {new Date(report.resolvedAt || report.createdAt).toLocaleDateString('es-AR')}
                      </p>
                      {report.adminNotes && (
                        <p className="text-xs text-gray-400 italic">"{report.adminNotes}"</p>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Moderación — Palabras prohibidas */}
            <div className="border-t-2 border-gray-200 my-6 pt-6">
              <h3 className="text-lg font-semibold text-gray-700 mb-4 flex items-center gap-2">
                <Shield className="w-5 h-5 text-gray-500" />
                Moderación — Palabras prohibidas
              </h3>
              <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
                <p className="text-xs text-gray-500 mb-4">
                  Los comentarios que contengan estas palabras serán removidos automáticamente al enviarse. El puntaje se guarda igual.
                </p>

                {/* Agregar palabra */}
                <div className="flex gap-2 mb-4">
                  <input
                    type="text"
                    value={newWord}
                    onChange={e => { setNewWord(e.target.value); setWordError(''); }}
                    onKeyDown={e => e.key === 'Enter' && handleAddWord()}
                    placeholder="Nueva palabra..."
                    maxLength={100}
                    className="flex-1 border-2 border-gray-200 rounded-xl px-3 py-2 text-sm focus:border-purple-500 focus:outline-none"
                  />
                  <button
                    onClick={handleAddWord}
                    disabled={wordActionLoading === true || !newWord.trim()}
                    className="bg-purple-600 text-white px-4 py-2 rounded-xl text-sm font-semibold flex items-center gap-1 disabled:opacity-50 hover:bg-purple-700 transition-colors"
                  >
                    {wordActionLoading === true ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
                    Agregar
                  </button>
                </div>

                {wordError && <p className="text-red-500 text-xs mb-3">{wordError}</p>}

                {/* Header colapsable */}
                <button
                  onClick={() => setWordListOpen(o => !o)}
                  className="w-full flex items-center justify-between py-2 text-sm font-semibold text-gray-600 hover:text-gray-800 transition-colors"
                >
                  <span>Lista de palabras ({bannedWords.length})</span>
                  {wordListOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                </button>

                {/* Lista colapsable */}
                {wordListOpen && (
                  <div className="mt-2">
                    <input
                      type="text"
                      value={wordSearch}
                      onChange={e => setWordSearch(e.target.value)}
                      placeholder="Buscar palabra..."
                      className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:border-purple-500 focus:outline-none mb-3"
                    />
                    <div className="flex flex-wrap gap-2 max-h-60 overflow-y-auto">
                      {bannedWords
                        .filter(w => w.word.includes(wordSearch.toLowerCase().trim()))
                        .sort((a, b) => a.word.localeCompare(b.word))
                        .map(w => (
                          <div key={w.id} className="flex items-center gap-1.5 bg-gray-100 rounded-full px-3 py-1.5 text-sm">
                            <span className="text-gray-700">{w.word}</span>
                            <button
                              onClick={() => handleDeleteWord(w.id)}
                              disabled={wordActionLoading === w.id}
                              className="text-gray-400 hover:text-red-500 transition-colors"
                            >
                              {wordActionLoading === w.id
                                ? <Loader2 className="w-3 h-3 animate-spin" />
                                : <XCircle className="w-3.5 h-3.5" />}
                            </button>
                          </div>
                        ))}
                      {bannedWords.filter(w => w.word.includes(wordSearch.toLowerCase().trim())).length === 0 && (
                        <p className="text-sm text-gray-400">
                          {wordSearch ? 'Sin resultados.' : 'No hay palabras configuradas.'}
                        </p>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* ===== TAB EMAILS ===== */}
        {activeTab === 'emails' && (
          <div className="space-y-4">

            {/* Modo toggle */}
            <div className="flex bg-white rounded-xl border border-gray-200 overflow-hidden">
              <button
                onClick={() => { setEmailMode('broadcast'); setEmailResult(null); }}
                className={`flex-1 py-3 text-sm font-semibold flex items-center justify-center gap-2 transition-colors ${emailMode === 'broadcast' ? 'bg-blue-600 text-white' : 'text-gray-500 hover:bg-gray-50'}`}
              >
                <Users className="w-4 h-4" /> Masivo
              </button>
              <button
                onClick={() => { setEmailMode('individual'); setEmailResult(null); }}
                className={`flex-1 py-3 text-sm font-semibold flex items-center justify-center gap-2 transition-colors ${emailMode === 'individual' ? 'bg-blue-600 text-white' : 'text-gray-500 hover:bg-gray-50'}`}
              >
                <User className="w-4 h-4" /> Individual
              </button>
              <button
                onClick={() => { setEmailMode('history'); fetchEmailHistory(); }}
                className={`flex-1 py-3 text-sm font-semibold flex items-center justify-center gap-2 transition-colors ${emailMode === 'history' ? 'bg-blue-600 text-white' : 'text-gray-500 hover:bg-gray-50'}`}
              >
                <Inbox className="w-4 h-4" /> Enviados
              </button>
              <button
                onClick={() => { setEmailMode('messages'); setEmailResult(null); fetchInboxMessages(); }}
                className={`flex-1 py-3 text-sm font-semibold flex items-center justify-center gap-2 transition-colors ${emailMode === 'messages' ? 'bg-blue-600 text-white' : 'text-gray-500 hover:bg-gray-50'}`}
              >
                <Mail className="w-4 h-4" />
                Recibidos
                {unreadCount > 0 && (
                  <span className="bg-red-500 text-white text-xs font-bold px-1.5 py-0.5 rounded-full min-w-[18px] text-center">
                    {unreadCount}
                  </span>
                )}
              </button>
            </div>

            {/* ===== HISTORIAL ===== */}
            {emailMode === 'history' && (
              <div className="space-y-3">
                <input
                  type="text"
                  value={emailHistorySearch}
                  onChange={e => setEmailHistorySearch(e.target.value)}
                  placeholder="Buscar por asunto, destinatario..."
                  className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-blue-400"
                />
                <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                  {emailHistoryLoading ? (
                    <div className="flex items-center justify-center py-12 text-gray-400">
                      <Loader2 className="w-5 h-5 animate-spin mr-2" /> Cargando...
                    </div>
                  ) : emailHistory.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-12 text-gray-400">
                      <Inbox className="w-10 h-10 mb-2 opacity-40" />
                      <p className="text-sm">No hay emails enviados aún.</p>
                    </div>
                  ) : (
                    <ul className="divide-y divide-gray-100">
                      {emailHistory
                        .filter(entry => {
                          const q = emailHistorySearch.toLowerCase();
                          return !q || entry.subject?.toLowerCase().includes(q) ||
                            entry.recipientName?.toLowerCase().includes(q) ||
                            entry.recipientEmail?.toLowerCase().includes(q) ||
                            entry.targetRole?.toLowerCase().includes(q);
                        })
                        .map(entry => (
                          <li key={entry.id} className="p-4 hover:bg-gray-50 transition-colors">
                            <div className="flex items-start justify-between gap-3 mb-1">
                              <span className="font-semibold text-gray-800 text-sm leading-tight">{entry.subject}</span>
                              <div className="flex items-center gap-2 shrink-0">
                                <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                                  entry.type === 'BROADCAST' ? 'bg-blue-100 text-blue-700' : 'bg-purple-100 text-purple-700'
                                }`}>
                                  {entry.type === 'BROADCAST' ? `Masivo · ${entry.recipientsCount} dest.` : 'Individual'}
                                </span>
                                <button
                                  onClick={async () => {
                                    await fetch(`${BACKEND_URL}/api/admin/email/log/${entry.id}`, { method: 'DELETE', headers: authHeader() });
                                    setEmailHistory(prev => prev.filter(e => e.id !== entry.id));
                                  }}
                                  className="text-gray-300 hover:text-red-500 transition-colors"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            </div>
                            <p className="text-xs text-gray-500 mb-1.5">
                              {entry.type === 'BROADCAST'
                                ? <>Rol: <span className="font-medium">{entry.targetRole}</span></>
                                : <><span className="font-medium">{entry.recipientName || entry.recipientEmail}</span>{entry.recipientName && <span className="text-gray-400"> · {entry.recipientEmail}</span>}</>
                              }
                              {' · '}de <span className="font-medium">{entry.senderAlias}</span>
                            </p>
                            <p className="text-xs text-gray-400 line-clamp-2">{entry.bodyPreview}</p>
                            <p className="text-xs text-gray-300 mt-1.5">
                              {new Date(entry.sentAt).toLocaleString('es-AR', { dateStyle: 'short', timeStyle: 'short' })}
                            </p>
                          </li>
                        ))}
                    </ul>
                  )}
                </div>
              </div>
            )}

            {/* ===== RECIBIDOS (inbox) ===== */}
            {emailMode === 'messages' && (
              <div className="space-y-3">
                <input
                  type="text"
                  value={inboxSearch}
                  onChange={e => setInboxSearch(e.target.value)}
                  placeholder="Buscar por nombre, email o mensaje..."
                  className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-blue-400"
                />
                {inboxLoading ? (
                  <div className="flex items-center justify-center py-12">
                    <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
                  </div>
                ) : inboxMessages.length === 0 ? (
                  <div className="text-center py-12 text-gray-400">
                    <Inbox className="w-10 h-10 mb-2 opacity-40 mx-auto" />
                    <p className="text-sm">No hay mensajes recibidos</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {inboxMessages
                      .filter(msg => {
                        const q = inboxSearch.toLowerCase();
                        return !q || msg.senderName?.toLowerCase().includes(q) ||
                          msg.senderEmail?.toLowerCase().includes(q) ||
                          msg.message?.toLowerCase().includes(q);
                      })
                      .map(msg => (
                      <div
                        key={msg.id}
                        onClick={async () => {
                          if (!msg.read) {
                            await fetch(`${BACKEND_URL}/api/admin/messages/${msg.id}/read`, { method: 'PATCH', headers: authHeader() });
                            setInboxMessages(prev => prev.map(m => m.id === msg.id ? { ...m, read: true } : m));
                            setUnreadCount(prev => Math.max(0, prev - 1));
                          }
                        }}
                        className={`rounded-2xl border p-4 space-y-2 cursor-pointer transition-colors ${msg.read ? 'bg-white border-gray-200' : 'bg-blue-50 border-blue-200'}`}
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex items-center gap-2 min-w-0">
                            <span className={`w-2 h-2 rounded-full flex-shrink-0 ${msg.read ? 'bg-gray-300' : 'bg-blue-500'}`} />
                            <span className={`text-xs font-bold px-2 py-0.5 rounded-full flex-shrink-0 ${msg.type === 'SUGGESTION' ? 'bg-orange-100 text-orange-700' : 'bg-blue-100 text-blue-700'}`}>
                              {msg.type === 'SUGGESTION' ? 'Sugerencia' : 'Soporte'}
                            </span>
                            {msg.status === 'RESOLVED' && (
                              <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-green-100 text-green-700 flex-shrink-0">
                                Resuelto
                              </span>
                            )}
                          </div>
                          <div className="flex items-center gap-2 flex-shrink-0" onClick={e => e.stopPropagation()}>
                            <span className="text-xs text-gray-400">
                              {new Date(msg.createdAt).toLocaleDateString('es-AR')}
                            </span>
                            <button
                              onClick={async () => {
                                await fetch(`${BACKEND_URL}/api/admin/messages/${msg.id}`, { method: 'DELETE', headers: authHeader() });
                                if (!msg.read) setUnreadCount(prev => Math.max(0, prev - 1));
                                setInboxMessages(prev => prev.filter(m => m.id !== msg.id));
                              }}
                              className="text-gray-300 hover:text-red-500 transition-colors"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>

                        <div className="text-sm">
                          <span className="font-semibold text-gray-800">{msg.senderName}</span>
                          {msg.senderEmail && (
                            <span className="text-gray-400 text-xs ml-2">{msg.senderEmail}</span>
                          )}
                        </div>

                        <p className="text-sm text-gray-700 leading-relaxed">{msg.message}</p>

                        <div className="flex flex-wrap gap-2 pt-1" onClick={e => e.stopPropagation()}>
                          {!msg.read && (
                            <button
                              onClick={async () => {
                                await fetch(`${BACKEND_URL}/api/admin/messages/${msg.id}/read`, { method: 'PATCH', headers: authHeader() });
                                setInboxMessages(prev => prev.map(m => m.id === msg.id ? { ...m, read: true } : m));
                                setUnreadCount(prev => Math.max(0, prev - 1));
                              }}
                              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-blue-50 text-blue-700 hover:bg-blue-100 transition-colors"
                            >
                              <CheckCircle className="w-3.5 h-3.5" /> Marcar leído
                            </button>
                          )}
                          {msg.status === 'OPEN' && (
                            <button
                              onClick={async () => {
                                await fetch(`${BACKEND_URL}/api/admin/messages/${msg.id}/resolve`, { method: 'PATCH', headers: authHeader() });
                                setInboxMessages(prev => prev.map(m => m.id === msg.id ? { ...m, status: 'RESOLVED' } : m));
                              }}
                              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-green-50 text-green-700 hover:bg-green-100 transition-colors"
                            >
                              <CheckCircle className="w-3.5 h-3.5" /> Marcar resuelto
                            </button>
                          )}
                          {msg.senderEmail && (
                            <button
                              onClick={() => {
                                setEmailToAddress(msg.senderEmail);
                                setEmailToName(msg.senderName || '');
                                setEmailSubject('Re: tu mensaje');
                                setEmailBody('');
                                setEmailMode('individual');
                              }}
                              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-indigo-50 text-indigo-700 hover:bg-indigo-100 transition-colors"
                            >
                              <Send className="w-3.5 h-3.5" /> Responder
                            </button>
                          )}
                          {msg.userId && (
                            <button
                              onClick={() => {
                                setNotifTarget('USER');
                                setNotifUserId(String(msg.userId));
                                setNotifTitle('');
                                setNotifMessage('');
                                setActiveTab('notifs');
                              }}
                              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-purple-50 text-purple-700 hover:bg-purple-100 transition-colors"
                            >
                              <Bell className="w-3.5 h-3.5" /> Enviar notificación
                            </button>
                          )}
                        </div>

                        {/* Accept suggestion button */}
                        <div onClick={e => e.stopPropagation()}>
                          {msg.type === 'SUGGESTION' && msg.status === 'OPEN' && (
                            acceptingSuggestion?.msgId === msg.id ? (
                              <div className="mt-3 flex gap-2">
                                <input
                                  type="text"
                                  value={acceptingSuggestion.name}
                                  onChange={e => setAcceptingSuggestion(prev => ({...prev, name: e.target.value}))}
                                  className="flex-1 border border-gray-200 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:border-green-400"
                                  placeholder="Nombre de la profesión..."
                                />
                                <button
                                  onClick={handleAcceptSuggestion}
                                  disabled={suggestionAccepting}
                                  className="bg-green-600 text-white px-3 py-1.5 rounded-lg text-sm font-semibold hover:bg-green-700 disabled:opacity-50 flex items-center gap-1"
                                >
                                  {suggestionAccepting ? <Loader2 className="w-3 h-3 animate-spin" /> : '✓'}
                                  Agregar
                                </button>
                                <button onClick={() => setAcceptingSuggestion(null)} className="text-gray-400 hover:text-gray-600 px-2">✕</button>
                              </div>
                            ) : (
                              <button
                                onClick={() => setAcceptingSuggestion({ msgId: msg.id, name: msg.message })}
                                className="mt-2 text-xs font-semibold text-green-600 hover:text-green-700 bg-green-50 hover:bg-green-100 px-3 py-1.5 rounded-lg transition-colors"
                              >
                                ✓ Agregar a la lista de profesiones
                              </button>
                            )
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* ===== FORMULARIO (broadcast / individual) ===== */}
            <div className={`bg-white rounded-xl border border-gray-200 p-4 space-y-4 ${emailMode === 'history' || emailMode === 'messages' ? 'hidden' : ''}`}>

              {/* Destinatarios (masivo) */}
              {emailMode === 'broadcast' && (
                <div>
                  <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Destinatarios</label>
                  <div className="flex gap-2">
                    {[{v:'ALL',l:'Todos'},{v:'PROFESSIONAL',l:'Profesionales'},{v:'CLIENT',l:'Clientes'}].map(opt => (
                      <button key={opt.v} onClick={() => setEmailTargetRole(opt.v)}
                        className={`flex-1 py-2 rounded-lg text-sm font-medium border transition-colors ${emailTargetRole === opt.v ? 'bg-blue-600 text-white border-blue-600' : 'border-gray-200 text-gray-600 hover:border-blue-400'}`}>
                        {opt.l}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Destinatario (individual) */}
              {emailMode === 'individual' && (
                <div className="space-y-2">
                  <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider">Destinatario</label>
                  <input
                    type="email"
                    placeholder="Email"
                    value={emailToAddress}
                    onChange={e => setEmailToAddress(e.target.value)}
                    className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-blue-400"
                  />
                  <input
                    type="text"
                    placeholder="Nombre (opcional)"
                    value={emailToName}
                    onChange={e => setEmailToName(e.target.value)}
                    className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-blue-400"
                  />
                </div>
              )}

              {/* Remitente */}
              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Remitente</label>
                <select
                  value={emailReplyTo}
                  onChange={e => setEmailReplyTo(e.target.value)}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-blue-400 bg-white"
                >
                  {EMAIL_ALIASES.map(a => <option key={a.value} value={a.value}>{a.label}</option>)}
                </select>
              </div>

              {/* Asunto */}
              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Asunto</label>
                <input
                  type="text"
                  placeholder="Asunto del email"
                  value={emailSubject}
                  onChange={e => setEmailSubject(e.target.value)}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-blue-400"
                />
              </div>

              {/* Mensaje */}
              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Mensaje</label>
                <textarea
                  placeholder="Escribí el mensaje aquí..."
                  value={emailBody}
                  onChange={e => setEmailBody(e.target.value)}
                  rows={6}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-blue-400 resize-none"
                />
              </div>

              {/* Resultado */}
              {emailResult && (
                <div className={`rounded-lg px-4 py-3 text-sm font-medium ${emailResult.type === 'success' ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-red-50 text-red-700 border border-red-200'}`}>
                  {emailResult.message}
                </div>
              )}

              {/* Botón enviar */}
              <button
                onClick={() => {
                  setEmailResult(null);
                  if (emailMode === 'broadcast') setConfirmBroadcast(true);
                  else handleSendIndividual();
                }}
                disabled={emailSending || !emailSubject.trim() || !emailBody.trim() || (emailMode === 'individual' && !emailToAddress.trim())}
                className="w-full py-3 bg-blue-600 text-white rounded-xl font-semibold text-sm flex items-center justify-center gap-2 disabled:opacity-50 active:bg-blue-700 transition-colors"
              >
                {emailSending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                {emailMode === 'broadcast' ? 'Enviar a todos' : 'Enviar'}
              </button>
            </div>
          </div>
        )}

        {/* ===== TAB CONFIG ===== */}
        {activeTab === 'config' && (() => {
          // Derive unique categories from current profession list
          const existingCategories = [...new Set(professions.map(p => p.category).filter(Boolean))].sort((a, b) => a.localeCompare(b, 'es'));

          // Group professions by category for display
          const grouped = professions.reduce((acc, p) => {
            const cat = p.category || 'Sin categoría';
            if (!acc[cat]) acc[cat] = [];
            acc[cat].push(p);
            return acc;
          }, {});
          const cats = Object.keys(grouped).sort((a, b) =>
            a === 'Sin categoría' ? 1 : b === 'Sin categoría' ? -1 : a.localeCompare(b, 'es')
          );

          return (
            <div>
              <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 mb-4">
                <h3 className="text-lg font-semibold text-gray-800 mb-1">Lista de profesiones</h3>
                <p className="text-sm text-gray-500 mb-5">Profesiones disponibles para los profesionales al registrarse.</p>

                {/* Add new profession form */}
                <div className="bg-gray-50 rounded-xl p-4 mb-6 space-y-3">
                  <p className="text-sm font-semibold text-gray-700">Agregar nueva profesión</p>
                  <input
                    type="text"
                    value={newProfessionName}
                    onChange={e => setNewProfessionName(e.target.value)}
                    placeholder="Nombre de la profesión..."
                    className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-blue-400 bg-white"
                    onKeyDown={e => e.key === 'Enter' && handleAddProfession()}
                  />
                  <div className="flex gap-2">
                    <select
                      value={newProfessionCategory}
                      onChange={e => { setNewProfessionCategory(e.target.value); setNewCategoryInput(''); }}
                      className="flex-1 border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-blue-400 bg-white text-gray-700"
                    >
                      <option value="">Sin categoría</option>
                      {existingCategories.map(cat => (
                        <option key={cat} value={cat}>{cat}</option>
                      ))}
                      <option value="__new__">+ Nueva categoría...</option>
                    </select>
                    {newProfessionCategory === '__new__' && (
                      <input
                        type="text"
                        value={newCategoryInput}
                        onChange={e => setNewCategoryInput(e.target.value)}
                        placeholder="Nombre de la categoría"
                        className="flex-1 border border-blue-300 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-blue-500 bg-white"
                      />
                    )}
                  </div>
                  <button
                    onClick={handleAddProfession}
                    disabled={addingProfession || !newProfessionName.trim() || (newProfessionCategory === '__new__' && !newCategoryInput.trim())}
                    className="w-full bg-blue-600 text-white py-2 rounded-xl text-sm font-semibold hover:bg-blue-700 disabled:opacity-50 transition-colors flex items-center justify-center gap-2"
                  >
                    {addingProfession ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
                    Agregar profesión
                  </button>
                </div>

                {/* Profession list grouped by category */}
                {professionsLoading ? (
                  <div className="flex items-center justify-center py-8">
                    <Loader2 className="w-6 h-6 animate-spin text-blue-500" />
                  </div>
                ) : (
                  <>
                    {/* Toolbar */}
                    {selectedProfIds.size > 0 && !editingProf && (
                      <div className="flex items-center gap-2 mb-3 p-3 bg-blue-50 rounded-xl border border-blue-100">
                        <span className="text-sm text-blue-700 font-medium flex-1">{selectedProfIds.size} seleccionada(s)</span>
                        {selectedProfIds.size === 1 && (
                          <button
                            onClick={() => {
                              const prof = professions.find(p => p.id === [...selectedProfIds][0]);
                              setEditingProf({ id: prof.id, displayName: prof.displayName, category: prof.category || '' });
                            }}
                            className="px-3 py-1.5 text-sm font-semibold bg-white border border-blue-300 text-blue-700 rounded-lg hover:bg-blue-50 transition-colors"
                          >
                            Editar
                          </button>
                        )}
                        <button
                          onClick={handleDeleteSelected}
                          className="px-3 py-1.5 text-sm font-semibold bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                        >
                          Borrar
                        </button>
                      </div>
                    )}

                    {/* Edit form */}
                    {editingProf && (
                      <div className="mb-3 p-3 bg-yellow-50 rounded-xl border border-yellow-200 space-y-2">
                        <p className="text-xs font-semibold text-yellow-700">Editar profesión</p>
                        <input
                          type="text"
                          value={editingProf.displayName}
                          onChange={e => setEditingProf(prev => ({ ...prev, displayName: e.target.value }))}
                          className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-400 bg-white"
                        />
                        <select
                          value={editingProf.category}
                          onChange={e => setEditingProf(prev => ({ ...prev, category: e.target.value }))}
                          className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-400 bg-white text-gray-700"
                        >
                          <option value="">Sin categoría</option>
                          {existingCategories.map(cat => (
                            <option key={cat} value={cat}>{cat}</option>
                          ))}
                        </select>
                        <div className="flex gap-2">
                          <button onClick={handleSaveEdit} className="flex-1 py-2 bg-blue-600 text-white text-sm font-semibold rounded-lg hover:bg-blue-700 transition-colors">Guardar</button>
                          <button onClick={() => setEditingProf(null)} className="flex-1 py-2 bg-white border border-gray-200 text-gray-600 text-sm font-semibold rounded-lg hover:bg-gray-50 transition-colors">Cancelar</button>
                        </div>
                      </div>
                    )}

                    <div className="space-y-4">
                      {cats.map(cat => (
                        <div key={cat}>
                          <p className="text-xs font-bold text-gray-400 uppercase tracking-wide mb-2">{cat}</p>
                          <div className="space-y-1.5">
                            {grouped[cat].map(p => (
                              <label key={p.id} className={`flex items-center gap-3 px-4 py-2.5 rounded-xl border cursor-pointer transition-colors ${selectedProfIds.has(p.id) ? 'border-blue-300 bg-blue-50' : p.active ? 'border-gray-200 bg-white hover:bg-gray-50' : 'border-gray-100 bg-gray-50 opacity-60'}`}>
                                <input
                                  type="checkbox"
                                  checked={selectedProfIds.has(p.id)}
                                  onChange={() => toggleProfSelection(p.id)}
                                  className="accent-blue-600 w-4 h-4 flex-shrink-0"
                                />
                                <span className={`text-sm ${p.active ? 'text-gray-800' : 'text-gray-400'}`}>{p.displayName}</span>
                                {!p.active && <span className="ml-auto text-xs text-gray-400">Inactiva</span>}
                              </label>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  </>
                )}
              </div>

              {/* Preview */}
              <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-800">Vista previa del selector</h3>
                    <p className="text-sm text-gray-500">Así ven los profesionales el listado al registrarse.</p>
                  </div>
                  <button
                    onClick={() => setShowPreview(p => !p)}
                    className="text-sm font-semibold text-blue-600 hover:text-blue-700 flex items-center gap-1"
                  >
                    {showPreview ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                    {showPreview ? 'Ocultar' : 'Ver'}
                  </button>
                </div>
                {showPreview && (
                  <div className="max-w-sm">
                    <ProfessionSelector value="" onChange={() => {}} focusColor="blue" />
                  </div>
                )}
              </div>
            </div>
          );
        })()}


      </div>

      {/* Modal — Confirmar broadcast */}
      {confirmBroadcast && (
        <ConfirmModal
          title="Enviar email masivo"
          message={`Se enviará el email a todos los ${emailTargetRole === 'ALL' ? 'usuarios' : emailTargetRole === 'PROFESSIONAL' ? 'profesionales' : 'clientes'} activos. ¿Confirmás?`}
          confirmLabel="Enviar"
          confirmColor="yellow"
          onConfirm={handleSendBroadcast}
          onCancel={() => setConfirmBroadcast(false)}
          loading={emailSending}
        />
      )}

      {/* Modal — Suspender / Reactivar */}
      {confirmSuspend && (
        <ConfirmModal
          title={confirmSuspend.suspended ? 'Reactivar cuenta' : 'Suspender cuenta'}
          message={
            confirmSuspend.suspended
              ? `¿Querés reactivar la cuenta de ${confirmSuspend.name}? El usuario podrá volver a iniciar sesión.`
              : `¿Querés suspender la cuenta de ${confirmSuspend.name}? El usuario no podrá iniciar sesión hasta que la reactives.`
          }
          confirmLabel={confirmSuspend.suspended ? 'Reactivar' : 'Suspender'}
          confirmColor="yellow"
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

      {/* Modal — Borrar comentario */}
      {confirmClearComment && (
        <ConfirmModal
          title="Borrar comentario"
          message="Se eliminará el comentario de esta calificación. La puntuación se mantendrá intacta."
          confirmLabel="Borrar comentario"
          confirmColor="yellow"
          onConfirm={handleClearComment}
          onCancel={() => setConfirmClearComment(null)}
          loading={actionLoading === confirmClearComment}
        />
      )}

      {/* Modal — Resolver denuncia */}
      {confirmResolveReport && (
        <ConfirmModal
          title={confirmResolveReport.action === 'APPROVED' ? 'Eliminar calificación' : 'Rechazar denuncia'}
          message={
            confirmResolveReport.action === 'APPROVED'
              ? 'La calificación será eliminada permanentemente. Esta acción no se puede deshacer.'
              : 'La denuncia será rechazada y la calificación se mantendrá visible.'
          }
          confirmLabel={confirmResolveReport.action === 'APPROVED' ? 'Eliminar' : 'Rechazar'}
          confirmColor={confirmResolveReport.action === 'APPROVED' ? 'red' : 'yellow'}
          onConfirm={handleResolveReport}
          onCancel={() => setConfirmResolveReport(null)}
          loading={actionLoading === confirmResolveReport.id}
        />
      )}

      {/* Toast */}
        {/* ===== TAB NOTIFICACIONES ===== */}
        {activeTab === 'notifs' && (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 space-y-4">
            <h3 className="text-lg font-semibold text-gray-800">Enviar notificación</h3>

            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">Destinatarios</label>
              <div className="flex gap-2 flex-wrap">
                {[
                  { value: 'ALL', label: 'Todos' },
                  { value: 'PROFESSIONAL', label: 'Profesionales' },
                  { value: 'CLIENT', label: 'Clientes' },
                  { value: 'USER', label: 'Usuario específico' },
                ].map(opt => (
                  <button key={opt.value} onClick={() => { setNotifTarget(opt.value); setNotifUserId(''); }}
                    className={`px-4 py-2 rounded-xl text-sm font-medium border transition-colors ${notifTarget === opt.value ? 'bg-blue-600 text-white border-blue-600' : 'border-gray-200 text-gray-600 hover:border-blue-400'}`}>
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>

            {notifTarget === 'USER' && (
              <input
                type="number"
                value={notifUserId}
                onChange={e => setNotifUserId(e.target.value)}
                placeholder="ID del usuario"
                className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-blue-400"
              />
            )}

            <input
              type="text"
              value={notifTitle}
              onChange={e => setNotifTitle(e.target.value)}
              placeholder="Título"
              className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-blue-400"
            />

            <textarea
              value={notifMessage}
              onChange={e => setNotifMessage(e.target.value)}
              placeholder="Mensaje"
              rows={3}
              className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-blue-400 resize-none"
            />

            {notifResult && (
              <div className={`rounded-xl px-4 py-3 text-sm font-medium ${notifResult.type === 'success' ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-red-50 text-red-700 border border-red-200'}`}>
                {notifResult.message}
              </div>
            )}

            <button
              disabled={notifSending || !notifTitle.trim() || !notifMessage.trim() || (notifTarget === 'USER' && !notifUserId)}
              onClick={async () => {
                setNotifSending(true);
                setNotifResult(null);
                try {
                  const target = notifTarget === 'USER' ? `USER:${notifUserId}` : notifTarget;
                  const res = await fetch(`${BACKEND_URL}/api/notifications/admin/send`, {
                    method: 'POST',
                    headers: { ...authHeader(), 'Content-Type': 'application/json' },
                    body: JSON.stringify({ title: notifTitle, message: notifMessage, target })
                  });
                  if (res.ok) {
                    setNotifResult({ type: 'success', message: 'Notificación enviada correctamente' });
                    setNotifTitle(''); setNotifMessage(''); setNotifUserId('');
                  } else {
                    setNotifResult({ type: 'error', message: 'Error al enviar la notificación' });
                  }
                } catch {
                  setNotifResult({ type: 'error', message: 'Error de conexión' });
                } finally {
                  setNotifSending(false);
                }
              }}
              className="w-full bg-blue-600 text-white py-3 rounded-xl font-semibold text-sm hover:bg-blue-700 disabled:opacity-50 transition-colors flex items-center justify-center gap-2"
            >
              {notifSending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Bell className="w-4 h-4" />}
              Enviar notificación
            </button>
          </div>
        )}

      {toast && (
        <div className={`fixed bottom-6 left-1/2 -translate-x-1/2 z-50 px-5 py-3 rounded-2xl shadow-lg text-sm font-semibold flex items-center gap-2 pointer-events-none transition-all ${
          toast.type === 'success'
            ? 'bg-gray-900 text-white'
            : 'bg-red-600 text-white'
        }`}>
          <CheckCircle className="w-4 h-4 flex-shrink-0" />
          {toast.message}
        </div>
      )}

    </div>
  );
}

export default AdminDashboard;