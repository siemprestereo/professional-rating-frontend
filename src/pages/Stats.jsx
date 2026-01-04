import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, TrendingUp, Calendar, Briefcase, Loader2 , Home } from 'lucide-react';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

function Stats() {
  const navigate = useNavigate();
  const [professional, setProfessional] = useState(null);
  const [byMonth, setByMonth] = useState([]);
  const [byBusiness, setByBusiness] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      // Obtener profesional actual
      const meResponse = await fetch('/api/auth/me', { credentials: 'include' });
      if (!meResponse.ok) {
        navigate('/professional-login');
        return;
      }
      const meData = await meResponse.json();
      setProfessional(meData);

      // Obtener stats por mes
      const monthResponse = await fetch(`/api/stats/professional/${meData.id}/by-month`, {
        credentials: 'include'
      });
      if (monthResponse.ok) {
        const monthData = await monthResponse.json();
        setByMonth(monthData);
      }

      // Obtener stats por lugar de trabajo
      const businessResponse = await fetch(`/api/stats/professional/${meData.id}/by-business`, {
        credentials: 'include'
      });
      if (businessResponse.ok) {
        const businessData = await businessResponse.json();
        setByBusiness(businessData);
      }
    } catch (error) {
      console.error('Error loading stats:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center animate-fadeIn">
        <div className="text-center">
          <Loader2 className="w-16 h-16 text-white animate-spin mx-auto mb-4" />
          <p className="text-white text-xl font-light">Cargando estadísticas...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 animate-fadeIn">
      {/* Header */}
      <div className="bg-gradient-to-br from-blue-500 to-purple-600 px-4 py-6 animate-slideDown">
        <button
          onClick={() => navigate('/dashboard')}
          className="text-white mb-4 flex items-center hover:translate-x-[-4px] transition-transform duration-300"
        >
          <ArrowLeft className="w-5 h-5 mr-2" />
          Volver al Dashboard
        </button>
        <h1 className="text-2xl font-bold text-white flex items-center">
          <TrendingUp className="w-6 h-6 mr-2" />
          Mis Estadísticas
        </h1>
      </div>

      <div className="px-4 py-6 max-w-6xl mx-auto">
        {/* Resumen */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="bg-white rounded-2xl shadow-lg p-6 text-center animate-slideUp">
            <TrendingUp className="w-10 h-10 text-green-500 mx-auto mb-2" />
            <p className="text-3xl font-bold text-gray-800">{professional.reputationScore.toFixed(1)}</p>
            <p className="text-gray-600">Promedio General</p>
          </div>
          
          <div className="bg-white rounded-2xl shadow-lg p-6 text-center animate-slideUp delay-100">
            <Calendar className="w-10 h-10 text-blue-500 mx-auto mb-2" />
            <p className="text-3xl font-bold text-gray-800">{professional.totalRatings}</p>
            <p className="text-gray-600">Total Calificaciones</p>
          </div>
          
          <div className="bg-white rounded-2xl shadow-lg p-6 text-center animate-slideUp delay-200">
            <Briefcase className="w-10 h-10 text-purple-500 mx-auto mb-2" />
            <p className="text-3xl font-bold text-gray-800">{byBusiness.length}</p>
            <p className="text-gray-600">Lugares de Trabajo</p>
          </div>
        </div>

        {/* Gráfico por mes */}
        {byMonth.length > 0 && (
          <div className="bg-white rounded-2xl shadow-lg p-6 mb-6 animate-slideUp delay-300">
            <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center">
              <Calendar className="w-5 h-5 mr-2 text-blue-500" />
              Evolución por Mes
            </h2>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={byMonth}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis domain={[0, 5]} />
                <Tooltip />
                <Legend />
                <Line 
                  type="monotone" 
                  dataKey="average" 
                  stroke="#8b5cf6" 
                  strokeWidth={3}
                  name="Promedio"
                  dot={{ fill: '#8b5cf6', r: 6 }}
                />
              </LineChart>
            </ResponsiveContainer>
            <p className="text-sm text-gray-500 text-center mt-4">
              Tu promedio de calificaciones mes a mes
            </p>
          </div>
        )}

        {/* Gráfico por lugar de trabajo */}
        {byBusiness.length > 0 && (
          <div className="bg-white rounded-2xl shadow-lg p-6 mb-6 animate-slideUp delay-400">
            <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center">
              <Briefcase className="w-5 h-5 mr-2 text-purple-500" />
              Promedio por Lugar de Trabajo
            </h2>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={byBusiness}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="business" />
                <YAxis domain={[0, 5]} />
                <Tooltip />
                <Legend />
                <Bar 
                  dataKey="average" 
                  fill="#8b5cf6" 
                  name="Promedio"
                  radius={[8, 8, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
            <p className="text-sm text-gray-500 text-center mt-4">
              Comparación de tu desempeño en cada lugar de trabajo
            </p>
          </div>
        )}

        {/* Sin datos */}
        {byMonth.length === 0 && byBusiness.length === 0 && (
          <div className="bg-white rounded-2xl shadow-lg p-12 text-center animate-scaleIn">
            <TrendingUp className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-gray-800 mb-2">
              Aún no tenés estadísticas
            </h3>
            <p className="text-gray-600">
              Empezá a recibir calificaciones para ver tus estadísticas aquí
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

export default Stats;