import { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

function ProtectedRoute({ children, userType }) {
  const navigate = useNavigate();
  const location = useLocation();
  
  const urlParams = new URLSearchParams(location.search);
  const hasOAuthCode = urlParams.get('code') !== null;
  
  const token = localStorage.getItem('authToken');

  useEffect(() => {
    if (hasOAuthCode) return;

    if (!token) {
      if (userType === 'CLIENT') {
        navigate('/client-login', { replace: true });
      } else {
        navigate('/professional-login', { replace: true });
      }
      return;
    }

    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      
      if (payload.userType !== userType) {
        if (userType === 'CLIENT') {
          navigate('/client-login', { replace: true });
        } else {
          navigate('/professional-login', { replace: true });
        }
        return;
      }

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

      // Chequear termsAccepted
      const key = userType === 'PROFESSIONAL' ? 'professional' : 'client';
      try {
        const stored = JSON.parse(localStorage.getItem(key) || '{}');
        if (stored.termsAccepted === false) {
          navigate('/accept-terms', { replace: true });
          return;
        }
      } catch {
        // si falla el parse, dejar pasar
      }

    } catch (e) {
      localStorage.removeItem('authToken');
      if (userType === 'CLIENT') {
        navigate('/client-login', { replace: true });
      } else {
        navigate('/professional-login', { replace: true });
      }
    }
  }, [token, navigate, userType, hasOAuthCode]);

  return (token || hasOAuthCode) ? children : null;
}

export default ProtectedRoute;