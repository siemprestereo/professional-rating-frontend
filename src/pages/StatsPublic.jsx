import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts';
import { TrendingUp, Award, Calendar, Building2, ArrowLeft, Loader2 } from 'lucide-react';

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

  const COLORS = ['#8B5CF6', '#EC4899', '#F59E0B', '#10B981', '#3B82F6'];

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
          <button
            onClick={() => navigate(-1)}
            className="flex items-center text-white hover:text-white/80 transition-colors mb-4"
          >
            <ArrowLeft className="w-5 h-5 mr-2" />
            <span className="font-semibold">Volver al CV</span>
          </button>
          <h1 className="text-3xl font-bold text-white mb-2">Estadísticas Profesionales</h1>
          <p className="text-white/90">Métricas y desempeño</p>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 -mt-8">
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
                <p className="text-2xl font-bold text-green-600">{professionData.professionType}</p>
              </div>
            </div>
          </div>
        )}

        {/* Evolución Mensual */}
        {monthlyData.length > 0 && (
          <div className="bg-white rounded-2xl shadow-lg p-6 mb-4 animate-slideUp delay-50">
            <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center">
              <Calendar className="w-6 h-6 mr-2 text-purple-600" />
              Evolución Mensual
            </h2>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={monthlyData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis domain={[0, 5]} />
                <Tooltip 
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      return (
                        <div className="bg-white p-3 rounded-lg shadow-lg border border-gray-200">
                          <p className="font-semibold">{payload[0].payload.month}</p>
                          <p className="text-purple-600">Promedio: {payload[0].value} ⭐</p>
                          <p className="text-gray-600 text-sm">{payload[0].payload.count} calificaciones</p>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Bar dataKey="average" fill="#8B5CF6" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}

        {/* Por Lugar de Trabajo */}
        {businessData.length > 0 && (
          <div className="bg-white rounded-2xl shadow-lg p-6 mb-4 animate-slideUp delay-100">
            <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center">
              <Building2 className="w-6 h-6 mr-2 text-purple-600" />
              Desempeño por Lugar de Trabajo
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
    </div>
  );
}

export default StatsPublic;