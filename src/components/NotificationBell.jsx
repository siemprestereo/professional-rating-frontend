import { useState, useEffect, useRef } from 'react';
import { Bell, X, CheckCheck } from 'lucide-react';
import { BACKEND_URL } from '../config';

function timeAgo(dateStr) {
  const diff = Math.floor((Date.now() - new Date(dateStr)) / 1000);
  if (diff < 60) return 'Ahora';
  if (diff < 3600) return `Hace ${Math.floor(diff / 60)} min`;
  if (diff < 86400) return `Hace ${Math.floor(diff / 3600)} h`;
  return `Hace ${Math.floor(diff / 86400)} d`;
}

function NotificationBell() {
  const [open, setOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unread, setUnread] = useState(0);
  const ref = useRef(null);
  const token = localStorage.getItem('authToken');
  const headers = { 'Authorization': `Bearer ${token}` };

  useEffect(() => {
    fetchUnreadCount();
    const interval = setInterval(fetchUnreadCount, 30000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const handleClick = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  const fetchUnreadCount = async () => {
    try {
      const res = await fetch(`${BACKEND_URL}/api/notifications/unread-count`, { headers });
      if (res.ok) { const data = await res.json(); setUnread(data.count); }
    } catch {}
  };

  const fetchNotifications = async () => {
    try {
      const res = await fetch(`${BACKEND_URL}/api/notifications`, { headers });
      if (res.ok) setNotifications(await res.json());
    } catch {}
  };

  const handleOpen = () => {
    setOpen(true);
    fetchNotifications();
  };

  const markAllRead = async () => {
    await fetch(`${BACKEND_URL}/api/notifications/read-all`, { method: 'PATCH', headers });
    setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
    setUnread(0);
  };

  const markOneRead = async (id) => {
    await fetch(`${BACKEND_URL}/api/notifications/${id}/read`, { method: 'PATCH', headers });
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, isRead: true } : n));
    setUnread(prev => Math.max(0, prev - 1));
  };

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={handleOpen}
        className="relative p-2 rounded-full hover:bg-white/20 transition-colors"
      >
        <Bell className="w-6 h-6 text-white" />
        {unread > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
            {unread > 9 ? '9+' : unread}
          </span>
        )}
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
          <div className="absolute right-0 mt-2 w-80 z-50">
          <div className="w-80 bg-white rounded-2xl shadow-2xl overflow-hidden animate-slideUp">
          <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
            <h3 className="font-semibold text-gray-800">Notificaciones</h3>
            <div className="flex items-center gap-2">
              {unread > 0 && (
                <button onClick={markAllRead} className="text-xs text-blue-600 hover:text-blue-800 flex items-center gap-1">
                  <CheckCheck className="w-3.5 h-3.5" /> Marcar todas
                </button>
              )}
              <button onClick={() => setOpen(false)} className="text-gray-400 hover:text-gray-600">
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          <div className="max-h-96 overflow-y-auto">
            {notifications.length === 0 ? (
              <div className="text-center py-8 text-gray-400">
                <Bell className="w-8 h-8 mx-auto mb-2 opacity-30" />
                <p className="text-sm">No hay notificaciones</p>
              </div>
            ) : (
              notifications.map(n => (
                <div
                  key={n.id}
                  onClick={() => !n.isRead && markOneRead(n.id)}
                  className={`px-4 py-3 border-b border-gray-50 cursor-pointer hover:bg-gray-50 transition-colors ${!n.isRead ? 'bg-blue-50' : ''}`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1">
                      <p className={`text-sm font-semibold ${!n.isRead ? 'text-blue-800' : 'text-gray-800'}`}>{n.title}</p>
                      <p className="text-xs text-gray-600 mt-0.5 leading-relaxed">{n.message}</p>
                    </div>
                    {!n.isRead && <div className="w-2 h-2 bg-blue-500 rounded-full flex-shrink-0 mt-1.5" />}
                  </div>
                  <p className="text-xs text-gray-400 mt-1">{timeAgo(n.createdAt)}</p>
                </div>
              ))
            )}
          </div>
          </div>
          </div>
        </>
      )}
    </div>
  );
}

export default NotificationBell;
