import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { TrendingUp, Building2, ChevronRight } from 'lucide-react';
import LoadingScreen from '../components/LoadingScreen';
import HomeButton from '../components/HomeButton';
import { BACKEND_URL } from '../config';

function StatsPublic() {
  const { professionalId } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [monthlyData, setMonthlyData] = useState([]);
  const [businessData, setBusinessData] = useState([]);
  const [professionData, setProfessionData] = useState(null);

  useEffect(() => { loadAllStats(); }, [professionalId]);

  const fillLast6Months = (data) => {
    const now = new Date();
    const monthlyMap = new Map(data.map(item => [item.month, item.average]));
    const result = [];
    for (let i = 5; i >= 0; i--) {
      const month = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const monthKey = month.toLocaleDateString('es-AR', { year: 'numeric', month: '2-digit' });
      const monthName = month.toLocaleDateString('es-AR', { month: 'short' });
      result.push({ month: monthName, average: monthlyMap.get(monthKey) || 0 });
    }
    return result;
  };

  const loadAllStats = async () => {
    try {
      const [monthlyRes, businessRes, professionRes] = await Promise.all([
        fetch(`${BACKEND_URL}/api/stats/professional/${professionalId}/by-month`),
        fetch(`${BACKEND_URL}/api/stats/professional/${professionalId}/by-business`),
        fetch(`${BACKEND_URL}/api/stats/professional/${professionalId}/by-profession-type`)
      ]);

      if (monthlyRes.ok) {
        const data = await monthlyRes.json();
        setMonthlyData(fillLast6Months(data.map(item => ({ month: item.month, average: parseFloat(item.average.toFixed(2)) }))));
      } else {
        setMonthlyData(fillLast6Months([]));
      }

      if (businessRes.ok) setBusinessData(await businessRes.json());
      if (professionRes.ok) setProfessionData(await professionRes.json());
    } catch (error) {
      console.error('Error loading stats:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <LoadingScreen />;

  return (
    <div className="min-h-screen bg-gray-50 pb-24">
      <div className="bg-gradient-to-br from-blue-500 to-purple-600 px-4 py-6">
        <div className="max-w-6xl mx-auto">
          <h1 className="text-3xl roboto-light text-white mb-2">Estadísticas Profesionales</h1>
          <p className="text-white/90">Métricas, análisis y desempeño</p>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 mt-4">
        {professionData && (
          <div className="w-full bg-white rounded-2xl shadow-md p-4 mb-4 animate-slideUp">
            <div className="flex items-center justify-around">
              <div className="text-center">
                <p className="text-2xl font-bold text-blue-600">{professionData.totalRatings}</p>
                <p className="text-xs text-gray-500">Calificaciones recibidas</p>
              </div>
              <div className="h-12 w-px bg-gray-200"></div>
              <div className="text-center">
                <p className="text-2xl font-bold text-orange-500">{professionData.averageScore.toFixed(1)}</p>
                <p className="text-xs text-gray-500">Promedio</p>
              </div>
            </div>
          </div>
        )}

        {businessData.length > 0 && (
          <div className="bg-white rounded-2xl shadow-lg p-6 mb-4 animate-slideUp delay-50">
            <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center">
              <Building2 className="w-6 h-6 mr-2 text-purple-600" />
              Desempeño en cada sitio de trabajo
            </h2>
            <div className="space-y-3">
              {businessData.map((business, index) => (
                <button key={index}
                  onClick={() => navigate(`/ratings-history?workHistoryId=${business.workHistoryId}`)}
                  className="w-full flex items-center justify-between p-4 bg-gray-50 rounded-xl hover:bg-purple-50 hover:border-purple-400 border-2 border-transparent transition-all group">
                  <div className="flex-1 text-left">
                    <p className="font-semibold text-gray-800 group-hover:text-purple-600 transition-colors">{business.business}</p>
                    <p className="text-sm text-gray-600">{business.count} calificaciones</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="text-right">
                      <p className="text-2xl font-bold text-purple-600">{business.average.toFixed(1)}</p>
                      <p className="text-xs text-gray-500">promedio</p>
                    </div>
                    <div className="flex">
                      {[...Array(5)].map((_, i) => (
                        <span key={i} className={i < Math.round(business.average) ? 'text-yellow-400' : 'text-gray-300'}>⭐</span>
                      ))}
                    </div>
                    <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-purple-600 group-hover:translate-x-1 transition-all flex-shrink-0" />
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        {monthlyData.length > 0 && (
          <div className="bg-white rounded-2xl shadow-lg p-6 mb-4 animate-slideUp delay-100">
            <h2 className="text-xl font-bold text-gray-800 mb-6 flex items-center">
              <TrendingUp className="w-6 h-6 mr-2 text-purple-600" />
              Evolución Mensual (últimos 6 meses)
            </h2>
            <div className="relative h-48 mt-4">
              <div className="absolute left-0 top-0 bottom-10 w-8 flex flex-col justify-between text-xs text-gray-500">
                {[...Array(6)].map((_, i) => {
                  const maxVal = Math.max(...monthlyData.map(m => m.average), 1);
                  return <span key={i}>{Math.ceil(maxVal * (5 - i) / 5)}</span>;
                })}
              </div>
              <div className="absolute left-10 top-0 right-2 bottom-10 overflow-hidden">
                <svg className="w-full h-full" viewBox="0 0 500 160" preserveAspectRatio="none">
                  {[...Array(6)].map((_, i) => (
                    <line key={i} x1="0" y1={i * 32} x2="500" y2={i * 32} stroke="#e5e7eb" strokeWidth="1" />
                  ))}
                  <polyline
                    points={monthlyData.map((m, i) => {
                      const maxVal = Math.max(...monthlyData.map(m => m.average), 1);
                      const x = (i * 500) / (monthlyData.length - 1);
                      const y = 10 + ((maxVal - m.average) / maxVal) * 140;
                      return `${x},${y}`;
                    }).join(' ')}
                    fill="none" stroke="url(#gradient)" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"
                  />
                  {monthlyData.map((m, i) => {
                    const maxVal = Math.max(...monthlyData.map(m => m.average), 1);
                    const x = (i * 500) / (monthlyData.length - 1);
                    const y = 10 + ((maxVal - m.average) / maxVal) * 140;
                    return <circle key={i} cx={x} cy={y} r="5" fill="#8B5CF6" stroke="white" strokeWidth="2" />;
                  })}
                  <defs>
                    <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="0%">
                      <stop offset="0%" stopColor="#8B5CF6" />
                      <stop offset="100%" stopColor="#EC4899" />
                    </linearGradient>
                  </defs>
                </svg>
              </div>
              <div className="absolute left-10 right-2 bottom-0 flex justify-between text-xs text-gray-500">
                {monthlyData.map((m, i) => <span key={i} className="capitalize">{m.month}</span>)}
              </div>
            </div>
          </div>
        )}
      </div>

      <HomeButton />
    </div>
  );
}

export default StatsPublic;