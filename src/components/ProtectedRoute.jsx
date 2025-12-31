import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

function ProtectedRoute({ children, userType }) {
  const navigate = useNavigate();
  const token = localStorage.getItem('authToken');

  useEffect(() => {
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
        // Token de tipo incorrecto, redirigir al login correcto
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
        // Token expirado
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
      // Token inválido
      console.error('Token inválido:', e);
      localStorage.removeItem('authToken');
      
      if (userType === 'CLIENT') {
        navigate('/client-login', { replace: true });
      } else {
        navigate('/professional-login', { replace: true });
      }
    }
  }, [token, navigate, userType]);

  // Solo renderizar si hay token válido
  return token ? children : null;
}

export default ProtectedRoute;