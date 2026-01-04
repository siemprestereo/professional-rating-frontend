import { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

function ProtectedRoute({ children, userType }) {
  const navigate = useNavigate();
  const location = useLocation();
  
  // PRIMERO: Capturar token de la URL si existe
  const urlParams = new URLSearchParams(location.search);
  const tokenFromUrl = urlParams.get('token');
  
  if (tokenFromUrl) {
    console.log('✅ Token detectado en URL, guardando en localStorage');
    localStorage.setItem('authToken', tokenFromUrl);
    
    // Limpiar la URL sin recargar
    window.history.replaceState({}, document.title, location.pathname);
  }
  
  // LUEGO: Verificar token en localStorage
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
      
      console.log('🔍 Token userType:', payload.userType, '- Required:', userType);
      // Verificar tipo de usuario
      if (payload.userType !== userType) {

        console.log('❌ userType mismatch, redirecting...');
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