import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Star, Home, TrendingUp, Award, Calendar } from 'lucide-react';
import LoadingScreen from '../components/LoadingScreen';

function ClientStats() {
  const navigate = useNavigate();
  const backendUrl = 'https://professional-rating-backend-production.up.railway.app';
  
  const [client, setClient] = useState(null);
  const [ratings, setRatings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState(null);
  const [badges, setBadges] = useState([]);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    const token = localStorage.getItem('authToken');
    const savedClient = localStorage.getItem('client');
    
    if (!token || !savedClient) {
      navigate('/client-login');
      return;
    }

    const clientData = JSON.parse(savedClient);
    setClient(clientData);

    try {
      const response = await fetch(`${backendUrl}/api/ratings/client/${clientData.id}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (response.ok) {
        const data = await response.json();
        setRatings(data);
        calculateStats(data);
        calculateBadges(data);
      }
    } catch (error) {
      console.error('Error loading ratings:', error);
    } finally {
      setLoading(false);
    }
  };

  const calculateStats = (ratingsData) => {
    if (ratingsData.length === 0) {
      setStats({
        total: 0,
        average: 0,
        monthlyActivity: [],
        categoriesCount: 0,
        withCommentPercentage: 0
      });
      return;
    }

    const total = ratingsData.length;
    const average = ratingsData.reduce((sum, r) => sum + r.score, 0) / total;

    const now = new Date();
    const monthlyData = [];
    
    for (let i = 5; i >= 0; i--) {
      const month = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const monthName = month.toLocaleDateString('es-AR', { month: 'short' });
      
      const count = ratingsData.filter(r => {
        const ratingDate = new Date(r.createdAt);
        return ratingDate.getMonth() === month.getMonth() && 
               ratingDate.getFullYear() === month.getFullYear();
      }).length;
      
      monthlyData.push({ month: monthName, count });
    }

    const categories = new Set(ratingsData.map(r => r.professionalType || 'general'));
    const withComment = ratingsData.filter(r => r.comment && r.comment.trim().length > 0).length;
    const withCommentPercentage = (withComment / total) * 100;

    setStats({
      total,
      average: average.toFixed(1),
      monthlyActivity: monthlyData,
      categoriesCount: categories.size,
      withCommentPercentage: Math.round(withCommentPercentage)
    });
  };

  const calculateBadges = (ratingsData) => {
    const earnedBadges = [];
    const total = ratingsData.length;

    // Medallas por cantidad (RESTAURADAS)
    if (total >= 1) earnedBadges.push({ icon: '🥉', name: 'Primera calificación', description: 'Has dado tu primera calificación', unlocked: true });
    if (total >= 5) earnedBadges.push({ icon: '🥈', name: 'Calificador activo', description: '5 calificaciones otorgadas', unlocked: true });
    if (total >= 10) earnedBadges.push({ icon: '🥇', name: 'Calificador experimentado', description: '10 calificaciones otorgadas', unlocked: true });
    if (total >= 25) earnedBadges.push({ icon: '💎', name: 'Calificador Experto', description: '25 calificaciones otorgadas', unlocked: true });
    if (total >= 50) earnedBadges.push({ icon: '👑', name: 'Calificador Maestro', description: '50 calificaciones otorgadas', unlocked: true });
    if (total >= 100) earnedBadges.push({ icon: '⭐', name: 'Calificador Legendario', description: '100 calificaciones otorgadas', unlocked: true });

    // Medallas especiales (RESTAURADAS)
    const withComment = ratingsData.filter(r => r.comment && r.comment.trim().length > 0).length;
    const commentPercentage = total > 0 ? (withComment / total) * 100 : 0;
    
    if (commentPercentage >= 80) {
      earnedBadges.push({ icon: '💬', name: 'Comunicador', description: '80% de tus calificaciones incluyen comentario', unlocked: true, special: true });
    }

    const average = total > 0 ? ratingsData.reduce((sum, r) => sum + r.score, 0) / total : 0;
    if (average >= 4.5) {
      earnedBadges.push({ icon: '🌟', name: 'Generoso', description: 'Promedio mayor a 4.5 estrellas', unlocked: true, special: true });
    }
    if (average >= 3.5 && average <= 4.5) {
      earnedBadges.push({ icon: '🎯', name: 'Preciso', description: 'Calificaciones equilibradas', unlocked: true, special: true });
    }

    const categories = new Set(ratingsData.map(r => r.professionalType || 'general'));
    if (categories.size >= 5) {
      earnedBadges.push({ icon: '🔍', name: 'Explorador', description: 'Has calificado 5+ categorías diferentes', unlocked: true, special: true });
    }

    // Medallas bloqueadas (RESTAURADAS)
    if (total < 5) earnedBadges.push({ icon: '🥈', name: 'Calificador Activo', description: `${5 - total} calificaciones más`, unlocked: false });
    if (total < 10 && total >= 5) earnedBadges.push({ icon: '🥇', name: 'Calificador Experimentado', description: `${10 - total} calificaciones más`, unlocked: false });
    if (total < 25 && total >= 10) earnedBadges.push({ icon: '💎', name: 'Calificador Experto', description: `${25 - total} calificaciones más`, unlocked: false });

    setBadges(earnedBadges);
  };

  const renderStars = (score) => {
    return [...Array(5)].map((_, i) => (
      <Star
        key={i}
        className={`w-4 h-4 ${i < score ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'}`}
      />
    ));
  };

  if (loading) {
    return <LoadingScreen gradient="from-green-500 to-teal-600" />;
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-24 animate-fadeIn">
      {/* Header */}
      <div className="bg-gradient-to-br from-green-500 to-teal-600 px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl roboto-light text-white mb-2 animate-slideUp">
            📊 Mis Estadísticas
          </h1>
          <p className="text-white/90 animate-slideUp delay-100">
            Tu actividad y tus logros como calificador
          </p>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 -mt-4">
        {/* Quick Stats - Los dos cuadrados con separación corregida */}
        <div className="grid grid-cols-2 gap-3 mb-4">
          <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl p-4 text-white shadow-lg animate-slideUp">
            <p className="text-3xl font-bold mb-1">{stats?.total || 0}</p>
            <p className="text-sm opacity-90">Calificaciones</p>
          </div>
          <div className="bg-gradient-to-br from-yellow-500 to-orange-600 rounded-2xl p-4 text-white shadow-lg animate-slideUp delay-50">
            <p className="text-3xl font-bold mb-1">{stats?.average || 0}</p>
            <p className="text-sm opacity-90">Tu Promedio</p>
          </div>
        </div>

        {/* Gráfico de Actividad */}
        {stats && stats.monthlyActivity.length > 0 && stats.total > 0 && (
          <div className="bg-white rounded-2xl shadow-lg p-6 mb-4 animate-slideUp delay-150">
            <h3 className="text-lg font-bold text-gray-800 mb-6 flex items-center">
              <TrendingUp className="w-5 h-5 mr-2 text-green-600" />
              Actividad (últimos 6 meses)
            </h3>
            
            <div className="relative h-48 mt-4">
              <div className="absolute left-0 top-0 bottom-10 w-8 flex flex-col justify-between text-xs text-gray-500">
                {[...Array(6)].map((_, i) => {
                  const maxCount = Math.max(...stats.monthlyActivity.map(m => m.count), 1);
                  const value = Math.ceil(maxCount * (5 - i) / 5);
                  return <span key={i}>{value}</span>;
                })}
              </div>

              <div className="absolute left-10 top-0 right-2 bottom-10 overflow-hidden">
                <svg className="w-full h-full" viewBox="0 0 500 160" preserveAspectRatio="none">
                  {[...Array(6)].map((_, i) => (
                    <line key={i} x1="0" y1={i * 32} x2="500" y2={i * 32} stroke="#e5e7eb" strokeWidth="1" />
                  ))}

                  {stats.monthlyActivity.filter(m => m.count > 0).length > 1 && (
                    <polyline
                      points={stats.monthlyActivity.map((m, i) => {
                        const maxCount = Math.max(...stats.monthlyActivity.map(m => m.count), 1);
                        const x = (i * 500) / (stats.monthlyActivity.length - 1);
                        const y = 10 + ((maxCount - m.count) / maxCount) * 140;
                        return `${x},${y}`;
                      }).join(' ')}
                      fill="none"
                      stroke="url(#gradient)"
                      strokeWidth="3"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  )}

                  {stats.monthlyActivity.map((m, i) => {
                    const maxCount = Math.max(...stats.monthlyActivity.map(m => m.count), 1);
                    const x = (i * 500) / (stats.monthlyActivity.length - 1);
                    const y = 10 + ((maxCount - m.count) / maxCount) * 140;
                    return <circle key={i} cx={x} cy={y} r="5" fill="#10b981" stroke="white" strokeWidth="2" />;
                  })}

                  <defs>
                    <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="0%">
                      <stop offset="0%" stopColor="#10b981" />
                      <stop offset="100%" stopColor="#14b8a6" />
                    </linearGradient>
                  </defs>
                </svg>
              </div>

              <div className="absolute left-10 right-2 bottom-0 flex justify-between text-xs text-gray-500">
                {stats.monthlyActivity.map((m, i) => (
                  <span key={i} className="capitalize">{m.month}</span>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Medallas */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-4 animate-slideUp delay-200">
          <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center">
            <Award className="w-5 h-5 mr-2 text-purple-600" />
            Medallas ({badges.filter(b => b.unlocked).length}/{badges.length})
          </h3>
          
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {badges.map((badge, index) => (
              <div
                key={index}
                className={`border-2 rounded-xl p-4 text-center transition-all ${
                  badge.unlocked 
                    ? badge.special ? 'border-purple-300 bg-purple-50' : 'border-green-300 bg-green-50'
                    : 'border-gray-200 bg-gray-50 opacity-50'
                }`}
              >
                <div className="text-4xl mb-2">{badge.icon}</div>
                <p className="font-bold text-gray-800 text-sm mb-1">{badge.name}</p>
                <p className="text-xs text-gray-600">{badge.description}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Historial Completo */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-4 animate-slideUp delay-250">
          <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center">
            <Calendar className="w-5 h-5 mr-2 text-teal-600" />
            Historial Completo ({ratings.length})
          </h3>
          
          {ratings.length === 0 ? (
            <p className="text-center text-gray-500 py-8">Aún no has dado calificaciones</p>
          ) : (
            <div className="space-y-3">
              {ratings.map((rating) => (
                <div key={rating.id} className="border border-gray-100 rounded-xl p-4 hover:shadow-md transition-all">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <h4 className="font-semibold text-gray-800">{rating.professionalName}</h4>
                      <p className="text-sm text-gray-500">{rating.businessName}</p>
                    </div>
                    <div className="flex items-center gap-1">{renderStars(rating.score)}</div>
                  </div>
                  {rating.comment && <p className="text-gray-600 text-sm mb-2 italic">"{rating.comment}"</p>}
                  <div className="flex items-center text-xs text-gray-400">
                    <Calendar className="w-3 h-3 mr-1" />
                    {new Date(rating.createdAt).toLocaleDateString('es-AR', { day: '2-digit', month: 'long', year: 'numeric' })}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="fixed bottom-4 left-0 right-0 flex justify-center z-50 animate-slideUp">
        <button 
          onClick={() => navigate('/client-dashboard')}
          className="w-14 h-14 bg-gradient-to-r from-green-500 to-teal-600 hover:from-green-600 hover:to-teal-700 rounded-full flex items-center justify-center transition-all hover:scale-110 shadow-2xl border-4 border-white"
        >
          <Home className="w-7 h-7 text-white" />
        </button>
      </div>
    </div>
  );
}

export default ClientStats;