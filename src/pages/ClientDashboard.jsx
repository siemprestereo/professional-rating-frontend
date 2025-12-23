import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Star, LogOut, Loader2, Calendar, MessageSquare } from 'lucide-react';

function ClientDashboard() {
  const navigate = useNavigate();
  const [client, setClient] = useState(null);
  const [myRatings, setMyRatings] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadClientData();
  }, []);

  const loadClientData = async () => {
    try {
      // Obtener datos del cliente logueado
      const response = await fetch('/api/auth/me', {
        credentials: 'include'
      });
      
      if (!response.ok) {
        navigate('/');
        return;
      }
      
      const clientData = await response.json();
      console.log('✅ Cliente:', clientData);
      
      setClient(clientData);
      
      // TODO: Obtener calificaciones que el cliente ha dado
      // const ratingsResponse = await fetch(`/api/ratings/client/${clientData.id}`, {
      //   credentials: 'include'
      // });
      // const ratingsData = await ratingsResponse.json();
      // setMyRatings(ratingsData);
      
      setMyRatings([]);
      
    } catch (error) {
      console.error('Error loading client data:', error);
      navigate('/');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    window.location.href = '/logout';
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
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center animate-fadeIn">
        <div className="text-center">
          <Loader2 className="w-16 h-16 text-white animate-spin mx-auto mb-4" />
          <p className="text-white text-xl">Cargando...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 animate-fadeIn">
      {/* Header */}
      <div className="bg-gradient-to-br from-blue-500 to-purple-600 px-4 pt-6 pb-24 animate-slideDown">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-white">Mi Dashboard</h1>
          <button
            onClick={handleLogout}
            className="text-white flex items-center hover:scale-110 transition-transform"
          >
            <LogOut className="w-5 h-5" />
          </button>
        </div>
        
        <div className="text-center">
          <div className="w-20 h-20 bg-white rounded-full mx-auto mb-3 flex items-center justify-center text-3xl font-bold text-purple-600 animate-scaleIn">
            {client.name.charAt(0)}
          </div>
          <h2 className="text-xl font-bold text-white mb-2 animate-slideUp">{client.name}</h2>
          <p className="text-white/90 text-sm animate-slideUp delay-100">
            {myRatings.length} {myRatings.length === 1 ? 'calificación dada' : 'calificaciones dadas'}
          </p>
        </div>
      </div>

      {/* Contenido */}
      <div className="px-4 -mt-16 max-w-4xl mx-auto">
        {/* Mensaje de bienvenida */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-4 animate-slideUp">
          <h3 className="text-lg font-bold text-gray-800 mb-2">
            ¡Hola {client.name.split(' ')[0]}! 👋
          </h3>
          <p className="text-gray-600">
            Para calificar a un profesional, escaneá su código QR o accedé directamente desde su perfil.
          </p>
        </div>

        {/* Mis calificaciones */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-6 animate-slideUp delay-100">
          <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center">
            <Star className="w-5 h-5 mr-2 text-yellow-500" />
            Mis Calificaciones
          </h3>
          
          {myRatings.length === 0 ? (
            <div className="text-center py-8">
              <MessageSquare className="w-16 h-16 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500 mb-4">
                Aún no has calificado a ningún profesional
              </p>
              <p className="text-sm text-gray-400">
                Escaneá un código QR para comenzar
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {myRatings.map((rating, index) => (
                <div 
                  key={rating.id} 
                  className="border border-gray-100 rounded-xl p-4 hover:shadow-md transition-all animate-slideUp"
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <h4 className="font-semibold text-gray-800">{rating.professionalName}</h4>
                      <p className="text-sm text-gray-500">{rating.businessName}</p>
                    </div>
                    <div className="flex items-center gap-1">
                      {renderStars(rating.score)}
                    </div>
                  </div>
                  
                  {rating.comment && (
                    <p className="text-gray-600 text-sm mb-2 italic">"{rating.comment}"</p>
                  )}
                  
                  <div className="flex items-center text-xs text-gray-400">
                    <Calendar className="w-3 h-3 mr-1" />
                    {new Date(rating.createdAt).toLocaleDateString('es-AR', {
                      day: '2-digit',
                      month: 'long',
                      year: 'numeric'
                    })}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Botón volver al inicio */}
        <button
          onClick={() => navigate('/')}
          className="w-full bg-purple-600 text-white font-bold py-3 rounded-2xl shadow-lg hover:bg-purple-700 transition-all animate-slideUp delay-200"
        >
          Volver al inicio
        </button>
      </div>
    </div>
  );
}

export default ClientDashboard;