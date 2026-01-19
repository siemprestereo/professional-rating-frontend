import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { TrendingUp, Award, Calendar, Building2, Home, Loader2 } from 'lucide-react';

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

  const loadAllStats = async () => {
    try {
      const [monthlyRes, businessRes, professionRes] = await Promise.all([
        fetch(`${backendUrl}/api/stats/professional/${professionalId}/by-month`),
        fetch(`${backendUrl}/api/stats/professional/${professionalId}/by-business`),
        fetch(`${backendUrl}/api/stats/professional/${professionalId}/by-profession-type`)
      ]);

      if (monthlyRes.ok) {
        const data = await monthlyRes.json();
        setMonthlyData(data.map(item => ({
          month: item.month,
          average: parseFloat(item.average.toFixed(2)),
          count: item.count
        })));
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
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-16 h-16 text-white animate-spin mx-auto mb-4" />
          <p className="text-white text-xl font-light">Cargando estadísticas...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-8">
      {/* Header */}
      <div className="bg-gradient-to-br from-blue-500 to-purple-600 px-4 py-6">
        <div className="max-w-6xl mx-auto">
          <h1 className="text-3xl font-bold text-white mb-2">Estadísticas Profesionales</h1>
          <p className="text-white/90">Métricas, análisis y desempeño</p>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 mt-4">
        {/* Resumen General */}
        {professionData && (
          <div className="bg-white rounded-2xl shadow-lg p-6 mb-4 animate-slideUp">
            <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center">
              <Award className="w-6 h-6 mr-2 text-purple-600" />
              Resumen General
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-gradient-to-br from-purple-50 to-pink-50 p-4 rounded-xl">
                <p className="text-sm text-gray-600 mb-1">Total de Calificaciones</p>
                <p className="text-3xl font-bold text-purple-600">{professionData.totalRatings}</p>
              </div>
              <div className="bg-gradient-to-br from-blue-50 to-cyan-50 p-4 rounded-xl">
                <p className="text-sm text-gray-600 mb-1">Promedio General</p>
                <p className="text-3xl font-bold text-blue-600">{professionData.averageScore.toFixed(1)} ⭐</p>
              </div>
              <div className="bg-gradient-to-br from-green-50 to-teal-50 p-4 rounded-xl">
                <p className="text-sm text-gray-600 mb-1">Tipo de Profesión</p>
                <p className="text-2xl font-bold text-green-600">{translateProfession(professionData.professionType)}</p>
              </div>
            </div>
          </div>
        )}

        {/* Evolución Mensual */}
        {monthlyData.length > 0 && (
          <div className="bg-white rounded-2xl shadow-lg p-6 mb-4 animate-slideUp delay-50">
            <h2 className="text-xl font-bold text-gray-800 mb-6 flex items-center">
              <TrendingUp className="w-6 h-6 mr-2 text-purple-600" />
              Evolución Mensual
            </h2>
            
            <div className="relative h-64 mt-4">
              {/* Eje Y */}
              <div className="absolute left-0 top-0 bottom-10 w-10 flex flex-col justify-between text-xs text-gray-500">
                {[5, 4, 3, 2, 1, 0].map((value) => (
                  <span key={value}>{value}</span>
                ))}
              </div>

              {/* Contenedor del gráfico con overflow hidden */}
              <div className="absolute left-12 top-0 right-2 bottom-10 overflow-hidden">
                <svg className="w-full h-full" viewBox="0 0 500 200" preserveAspectRatio="none">
                  {/* Líneas de cuadrícula */}
                  {[0, 1, 2, 3, 4, 5].map((i) => (
                    <line
                      key={i}
                      x1="0"
                      y1={i * 40}
                      x2="500"
                      y2={i * 40}
                      stroke="#e5e7eb"
                      strokeWidth="1"
                    />
                  ))}

                  {/* Línea del gráfico */}
                  <polyline
                    points={monthlyData.map((m, i) => {
                      const x = monthlyData.length > 1 ? (i * 500) / (monthlyData.length - 1) : 250;
                      const y = 10 + ((5 - m.average) / 5) * 180; // Escala de 0-5
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
                    const x = monthlyData.length > 1 ? (i * 500) / (monthlyData.length - 1) : 250;
                    const y = 10 + ((5 - m.average) / 5) * 180;
                    return (
                      <g key={i}>
                        <circle
                          cx={x}
                          cy={y}
                          r="6"
                          fill="#8B5CF6"
                          stroke="white"
                          strokeWidth="2"
                        />
                        {/* Tooltip en hover */}
                        <title>{`${m.month}: ${m.average} ⭐ (${m.count} calificaciones)`}</title>
                      </g>
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
              <div className="absolute left-12 right-2 bottom-0 flex justify-between text-xs text-gray-500">
                {monthlyData.map((m, i) => (
                  <span key={i} className="capitalize">{m.month}</span>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Por Lugar de Trabajo */}
        {businessData.length > 0 && (
          <div className="bg-white rounded-2xl shadow-lg p-6 mb-4 animate-slideUp delay-100">
            <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center">
              <Building2 className="w-6 h-6 mr-2 text-purple-600" />
              Desempeño en cada uno de los sitios de trabajo
            </h2>
            <div className="space-y-3">
              {businessData.map((business, index) => (
                <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors">
                  <div className="flex-1">
                    <p className="font-semibold text-gray-800">{business.business}</p>
                    <p className="text-sm text-gray-600">{business.count} calificaciones</p>
                  </div>
                  <div className="flex items-center gap-2">
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
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
      {/* Botón Home flotante fijo abajo centrado */}
      <div className="fixed bottom-4 left-0 right-0 flex justify-center z-50 animate-slideUp">
        <button 
          onClick={() => navigate(-1)}
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