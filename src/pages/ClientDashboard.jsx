import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Star, LogOut, Loader2, Calendar, MessageSquare, Settings, X } from 'lucide-react';

function ClientDashboard() {
  const navigate = useNavigate();
  const backendUrl = 'https://professional-rating-backend-production.up.railway.app';
  const [client, setClient] = useState(null);
  const [myRatings, setMyRatings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    loadClientData();
  }, []);

  const loadClientData = async () => {
    // Cargar datos desde localStorage primero
    const savedData = localStorage.getItem('client');
    if (savedData) {
      const clientData = JSON.parse(savedData);
      setClient(clientData);
      loadRatings(clientData.id);
      setLoading(false);
      return;
    }

    // Si no hay localStorage, intentar cargar desde backend (OAuth)
    try {
      const response = await fetch(`${backendUrl}/api/auth/me/client`, {
        credentials: 'include'
      });

      if (response.ok) {
        const clientData = await response.json();
        setClient(clientData);
        localStorage.setItem('client', JSON.stringify(clientData));
        loadRatings(clientData.id);
        setLoading(false);
        return;
      }
    } catch (error) {
      console.error('Error loading client from session:', error);
    }

    // Si falló todo, redirigir al login
    console.log('No hay datos de sesión, redirigiendo al login');
    navigate('/client-login');
    setLoading(false);
  };

  const loadRatings = async (clientId) => {
    try {
      const response = await fetch(`${backendUrl}/api/ratings/client/${clientId}`, {
        credentials: 'include'
      });

      if (response.ok) {
        const data = await response.json();
        setMyRatings(data);
      }
    } catch (error) {
      console.error('Error loading ratings:', error);
      setMyRatings([]);
    }
  };

  const handleDeleteAccount = async () => {
    setDeleting(true);
    try {
      const response = await fetch(`${backendUrl}/api/auth/delete-account-client/${client.id}`, {
        method: 'DELETE',
        credentials: 'include'
      });

      if (!response.ok) {
        throw new Error('Error al eliminar cuenta');
      }

      localStorage.removeItem('client');
      alert('Tu cuenta ha sido eliminada exitosamente');
      navigate('/');
    } catch (error) {
      console.error('Error deleting account:', error);
      alert('Error al eliminar la cuenta. Intentá nuevamente.');
    } finally {
      setDeleting(false);
      setShowDeleteModal(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('client');
    navigate('/');
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
      <div className="min-h-screen bg-gradient-to-br from-green-500 to-teal-600 flex items-center justify-center animate-fadeIn">
        <div className="text-center">
          <Loader2 className="w-16 h-16 text-white animate-spin mx-auto mb-4" />
          <p className="text-white text-xl">Cargando...</p>
        </div>
      </div>
    );
  }

  if (!client) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50 animate-fadeIn">
      {/* Header */}
      <div className="bg-gradient-to-br from-green-500 to-teal-600 px-4 pt-6 pb-24 animate-slideDown">
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
          <div className="w-20 h-20 bg-white rounded-full mx-auto mb-3 flex items-center justify-center text-3xl font-bold text-teal-600 animate-scaleIn">
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
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-4 animate-slideUp delay-100">
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

        {/* Configuración - Eliminar cuenta */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-4 animate-slideUp delay-200">
          <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center">
            <Settings className="w-5 h-5 mr-2 text-gray-600" />
            Configuración
          </h3>
          
          <button
            onClick={() => setShowDeleteModal(true)}
            className="w-full bg-red-500 text-white font-bold py-3 rounded-2xl shadow-lg hover:bg-red-600 transition-all"
          >
            Eliminar mi cuenta
          </button>
        </div>

        {/* Botón volver al inicio */}
        <button
          onClick={() => navigate('/')}
          className="w-full bg-teal-600 text-white font-bold py-3 rounded-2xl shadow-lg hover:bg-teal-700 transition-all animate-slideUp delay-300"
        >
          Volver al inicio
        </button>
      </div>

      {/* Modal de confirmación */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 animate-fadeIn">
          <div className="bg-white rounded-3xl p-8 max-w-md w-full mx-4 animate-scaleIn">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">
              ¿Eliminar cuenta?
            </h2>
            <p className="text-gray-600 mb-6">
              Esta acción es permanente y eliminará todos tus datos, incluyendo tus calificaciones. 
              <strong> No se puede deshacer.</strong>
            </p>
            
            <div className="flex gap-4">
              <button
                onClick={() => setShowDeleteModal(false)}
                className="flex-1 bg-gray-200 text-gray-800 font-bold py-3 rounded-2xl hover:bg-gray-300 transition-all"
              >
                Cancelar
              </button>
              <button
                onClick={handleDeleteAccount}
                disabled={deleting}
                className="flex-1 bg-red-500 text-white font-bold py-3 rounded-2xl hover:bg-red-600 disabled:opacity-50 transition-all"
              >
                {deleting ? (
                  <span className="flex items-center justify-center">
                    <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                    Eliminando...
                  </span>
                ) : (
                  'Sí, eliminar'
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default ClientDashboard;