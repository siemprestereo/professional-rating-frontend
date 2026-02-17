/**
 * Utilidades centralizadas de autenticación
 * Usadas por ClientLogin y ProfessionalLogin
 */

const BACKEND_URL = 'https://professional-rating-backend-production.up.railway.app';

/**
 * ✅ Decodifica JWT de forma segura con soporte Unicode
 * @param {string} token - JWT token
 * @returns {object|null} - Payload decodificado o null si falla
 */
export const decodeToken = (token) => {
  try {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );
    return JSON.parse(jsonPayload);
  } catch (error) {
    console.error('Error decodificando token:', error);
    return null;
  }
};

/**
 * ✅ Intercambia un código temporal OAuth por un JWT real
 * @param {string} code - Código temporal recibido en la URL
 * @returns {object|null} - { token, id, email, name, userType, ... } o null si falla
 */
export const exchangeOAuthCode = async (code) => {
  try {
    const response = await fetch(`${BACKEND_URL}/api/auth/exchange-code`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ code }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error('Error intercambiando código OAuth:', errorData.error || response.status);
      return null;
    }

    return await response.json();
  } catch (error) {
    console.error('Error de red al intercambiar código OAuth:', error);
    return null;
  }
};

/**
 * ✅ Formatea nombre: limpia caracteres y capitaliza
 * @param {string} input - Nombre a formatear
 * @returns {string} - Nombre formateado
 */
export const formatName = (input) => {
  // Eliminar todo lo que no sea letra o espacio
  const cleaned = input.replace(/[^a-zA-ZáéíóúÁÉÍÓÚñÑ\s]/g, '');
  
  // Capitalizar primera letra de cada palabra
  return cleaned
    .split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ');
};

/**
 * ✅ Maneja la redirección post-login
 * @param {string} defaultPath - Ruta por defecto si no hay redirect pendiente
 * @param {function} navigate - Función navigate de React Router
 * @param {boolean} useWindowLocation - Si true, usa window.location.href (para recarga completa)
 */
export const handlePostLoginRedirect = (defaultPath, navigate, useWindowLocation = true) => {
  const redirectPath = localStorage.getItem('redirectAfterLogin');
  
  if (redirectPath) {
    localStorage.removeItem('redirectAfterLogin');
    
    if (useWindowLocation) {
      window.location.href = `https://www.calificalo.com.ar${redirectPath}`;
    } else {
      navigate(redirectPath, { replace: true });
    }
  } else {
    if (useWindowLocation) {
      window.location.href = `https://www.calificalo.com.ar${defaultPath}`;
    } else {
      navigate(defaultPath, { replace: true });
    }
  }
};

/**
 * ✅ Guarda datos del usuario en localStorage
 * @param {string} userType - 'CLIENT' o 'PROFESSIONAL'
 * @param {string} token - JWT token
 * @param {object} userData - Datos del usuario (id, email, name)
 */
export const saveAuthData = (userType, token, userData) => {
  localStorage.setItem('authToken', token);
  localStorage.setItem('userType', userType);
  
  const storageKey = userType === 'CLIENT' ? 'client' : 'professional';
  localStorage.setItem(storageKey, JSON.stringify(userData));
};

/**
 * ✅ Limpia todos los datos de autenticación
 */
export const clearAuthData = () => {
  localStorage.removeItem('authToken');
  localStorage.removeItem('userType');
  localStorage.removeItem('client');
  localStorage.removeItem('professional');
  localStorage.removeItem('redirectAfterLogin');
};

/**
 * ✅ Maneja errores de login con mensajes específicos
 * @param {Response} response - Response del fetch
 * @returns {string} - Mensaje de error apropiado
 */
export const getLoginErrorMessage = async (response) => {
  try {
    const data = await response.json();
    
    // Mensajes específicos según el código de error
    if (response.status === 401) {
      return 'Email o contraseña incorrectos';
    }
    
    if (response.status === 403) {
      if (data.message?.includes('pending') || data.message?.includes('validation')) {
        return 'Tu cuenta está pendiente de validación. Revisá tu email.';
      }
      if (data.message?.includes('suspended') || data.message?.includes('blocked')) {
        return 'Tu cuenta ha sido suspendida. Contactá a soporte.';
      }
      return data.message || 'Acceso denegado';
    }
    
    if (response.status === 404) {
      return 'Email no registrado';
    }
    
    return data.message || 'Error al iniciar sesión';
    
  } catch (error) {
    return 'Email o contraseña incorrectos';
  }
};