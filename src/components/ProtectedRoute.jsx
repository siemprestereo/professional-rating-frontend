import { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

function ProtectedRoute({ children, userType }) {
  const navigate = useNavigate();
  const location = useLocation();
  
  // Si hay un code OAuth en la URL, dejar pasar para que el dashboard lo procese
  const urlParams = new URLSearchParams(location.search);
  const hasOAuthCode = urlParams.get('code') !== null;
  
  const token = localStorage.getItem('authToken');

  useEffect(() => {
    // Si hay código OAuth pendiente, no redirigir — el dashboard lo va a intercambiar
    if (hasOAuthCode) return;

    // Si no hay token, redirigir al login correspondiente
    if (!token) {
      if (userType === 'CLIENT') {
        navigate('/client-login', { replace: true });
      } else {
        navigate('/professional-login', { replace: true });
      }
      return;
    }

    // Verificar que el token sea válido y del tipo correcto
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      
      // Verificar tipo de usuario
      if (payload.userType !== userType) {
        if (userType === 'CLIENT') {
          navigate('/client-login', { replace: true });
        } else {
          navigate('/professional-login', { replace: true });
        }
        return;
      }

      // Verificar si el token expiró
      const now = Date.now();
      if (payload.exp && payload.exp * 1000 < now) {
        localStorage.removeItem('authToken');
        localStorage.removeItem('client');
        localStorage.removeItem('professional');
        
        if (userType === 'CLIENT') {
          navigate('/client-login', { replace: true });
        } else {
          navigate('/professional-login', { replace: true });
        }
        return;
      }
    } catch (e) {
      console.error('Token inválido:', e);
      localStorage.removeItem('authToken');
      
      if (userType === 'CLIENT') {
        navigate('/client-login', { replace: true });
      } else {
        navigate('/professional-login', { replace: true });
      }
    }
  }, [token, navigate, userType, hasOAuthCode]);

  // Renderizar si hay token válido O si hay código OAuth pendiente
  return (token || hasOAuthCode) ? children : null;
}

export default ProtectedRoute;