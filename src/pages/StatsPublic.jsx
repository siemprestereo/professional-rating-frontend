import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { TrendingUp, Building2, Home, Loader2, ChevronRight } from 'lucide-react';
import LoadingScreen from '../components/LoadingScreen';

function StatsPublic() {
  const { professionalId } = useParams();
  const navigate = useNavigate();
  const backendUrl = 'https://professional-rating-backend-production.up.railway.app';

  const [loading, setLoading] = useState(true);
  const [monthlyData, setMonthlyData] = useState([]);
  const [businessData, setBusinessData] = useState([]);
  const [professionData, setProfessionData] = useState(null);

  useEffect(() => {
    loadAllStats();
  }, [professionalId]);

  const translateProfession = (type) => {
    const translations = {
      'WAITER': 'Mozo',
      'ELECTRICIAN': 'Electricista',
      'PAINTER': 'Pintor',
      'HAIRDRESSER': 'Peluquero',
      'PLUMBER': 'Plomero',
      'CARPENTER': 'Carpintero',
      'MECHANIC': 'Mecánico',
      'CHEF': 'Chef',
      'BARISTA': 'Barista',
      'BARTENDER': 'Bartender',
      'CLEANER': 'Personal de limpieza',
      'GARDENER': 'Jardinero',
      'DRIVER': 'Conductor',
      'SECURITY': 'Seguridad',
      'RECEPTIONIST': 'Recepcionista'
    };
    return translations[type] || type;
  };

  const fillLast6Months = (data) => {
    const now = new Date();
    const monthlyMap = new Map();
    
    // Crear mapa con los datos existentes
    data.forEach(item => {
      monthlyMap.set(item.month, item.average);
    });
    
    // Generar últimos 6 meses
    const result = [];
    for (let i = 5; i >= 0; i--) {
      const month = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const monthKey = month.toLocaleDateString('es-AR', { year: 'numeric', month: '2-digit' }); // Formato YYYY-MM
      const monthName = month.toLocaleDateString('es-AR', { month: 'short' });
      
      result.push({
        month: monthName,
        average: monthlyMap.get(monthKey) || 0,
        count: monthlyMap.get(monthKey) ? 1 : 0
      });
    }
    
    return result;
  };

  const loadAllStats = async () => {
    try {
      const [monthlyRes, businessRes, professionRes] = await Promise.all([
        fetch(`${backendUrl}/api/stats/professional/${professionalId}/by-month`),
        fetch(`${backendUrl}/api/stats/professional/${professionalId}/by-business`),
        fetch(`${backendUrl}/api/stats/professional/${professionalId}/by-profession-type`)
      ]);

      if (monthlyRes.ok) {
        const data = await monthlyRes.json();
        const mappedData = data.map(item => ({
          month: item.month,
          average: parseFloat(item.average.toFixed(2))
        }));
        
        // Rellenar con los últimos 6 meses
        const filledData = fillLast6Months(mappedData);
        setMonthlyData(filledData);
      } else {
        // Si no hay datos, mostrar últimos 6 meses en 0
        setMonthlyData(fillLast6Months([]));
      }

      if (businessRes.ok) {
        const data = await businessRes.json();
        setBusinessData(data);
      }

      if (professionRes.ok) {
        const data = await professionRes.json();
        setProfessionData(data);
      }

    } catch (error) {
      console.error('Error loading stats:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <LoadingScreen />;
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-8">
      {/* Header */}
      <div className="bg-gradient-to-br from-blue-500 to-purple-600 px-4 py-6">
        <div className="max-w-6xl mx-auto">
          <h1 className="text-3xl roboto-light text-white mb-2">Estadísticas Profesionales</h1>
          <p className="text-white/90 roboto-regular">Métricas, análisis y desempeño</p>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 mt-4">
        {/* Stats compactas estilo ClientDashboard */}
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

        {/* Desempeño por lugar - Ahora como botones clickeables */}
        {businessData.length > 0 && (
          <div className="bg-white rounded-2xl shadow-lg p-6 mb-4 animate-slideUp delay-50">
            <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center">
              <Building2 className="w-6 h-6 mr-2 text-purple-600" />
              Desempeño en cada sitio de trabajo
            </h2>
            <div className="space-y-3">
              {businessData.map((business, index) => (
                <button
                  key={index}
                  onClick={() => navigate(`/ratings-history?workHistoryId=${business.workHistoryId}`)}
                  className="w-full flex items-center justify-between p-4 bg-gray-50 rounded-xl hover:bg-purple-50 hover:border-purple-400 border-2 border-transparent transition-all group"
                >
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
                        <span key={i} className={i < Math.round(business.average) ? 'text-yellow-400' : 'text-gray-300'}>
                          ⭐
                        </span>
                      ))}
                    </div>
                    <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-purple-600 group-hover:translate-x-1 transition-all flex-shrink-0" />
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Evolución Mensual - Ahora al final */}
        {monthlyData.length > 0 && (
          <div className="bg-white rounded-2xl shadow-lg p-6 mb-4 animate-slideUp delay-100">
            <h2 className="text-xl font-bold text-gray-800 mb-6 flex items-center">
              <TrendingUp className="w-6 h-6 mr-2 text-purple-600" />
              Evolución Mensual (últimos 6 meses)
            </h2>
            
            <div className="relative h-48 mt-4">
              {/* Eje Y */}
              <div className="absolute left-0 top-0 bottom-10 w-8 flex flex-col justify-between text-xs text-gray-500">
                {[...Array(6)].map((_, i) => {
                  const maxCount = Math.max(...monthlyData.map(m => m.average), 1);
                  const value = Math.ceil(maxCount * (5 - i) / 5);
                  return <span key={i}>{value}</span>;
                })}
              </div>

              {/* Contenedor del gráfico con overflow hidden */}
              <div className="absolute left-10 top-0 right-2 bottom-10 overflow-hidden">
                <svg className="w-full h-full" viewBox="0 0 500 160" preserveAspectRatio="none">
                  {/* Líneas de cuadrícula */}
                  {[...Array(6)].map((_, i) => (
                    <line
                      key={i}
                      x1="0"
                      y1={i * 32}
                      x2="500"
                      y2={i * 32}
                      stroke="#e5e7eb"
                      strokeWidth="1"
                    />
                  ))}

                  {/* Línea del gráfico */}
                  <polyline
                    points={monthlyData.map((m, i) => {
                      const maxCount = Math.max(...monthlyData.map(m => m.average), 1);
                      const x = (i * 500) / (monthlyData.length - 1);
                      const y = 10 + ((maxCount - m.average) / maxCount) * 140; // Invertido y con margen
                      return `${x},${y}`;
                    }).join(' ')}
                    fill="none"
                    stroke="url(#gradient)"
                    strokeWidth="3"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />

                  {/* Puntos */}
                  {monthlyData.map((m, i) => {
                    const maxCount = Math.max(...monthlyData.map(m => m.average), 1);
                    const x = (i * 500) / (monthlyData.length - 1);
                    const y = 10 + ((maxCount - m.average) / maxCount) * 140;
                    return (
                      <circle
                        key={i}
                        cx={x}
                        cy={y}
                        r="5"
                        fill="#8B5CF6"
                        stroke="white"
                        strokeWidth="2"
                      />
                    );
                  })}

                  <defs>
                    <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="0%">
                      <stop offset="0%" stopColor="#8B5CF6" />
                      <stop offset="100%" stopColor="#EC4899" />
                    </linearGradient>
                  </defs>
                </svg>
              </div>

              {/* Eje X */}
              <div className="absolute left-10 right-2 bottom-0 flex justify-between text-xs text-gray-500">
                {monthlyData.map((m, i) => (
                  <span key={i} className="capitalize">{m.month}</span>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Botón Home flotante fijo abajo centrado */}
      <div className="fixed bottom-4 left-0 right-0 flex justify-center z-50 animate-slideUp">
        <button 
          onClick={() => navigate('/client-dashboard')}
          className="w-14 h-14 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 rounded-full flex items-center justify-center transition-all hover:scale-110 shadow-2xl border-4 border-white"
          aria-label="Volver"
        >
          <Home className="w-7 h-7 text-white" />
        </button>
      </div>
    </div>
  );
}

export default StatsPublic;