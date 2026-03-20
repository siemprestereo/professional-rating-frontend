// src/utils/storage.js

/**
 * Limpia completamente el localStorage de la aplicación
 * Útil para logout, eliminación de cuenta, o cambio de usuario
 */
export const clearAllAppData = () => {
  const keysToRemove = [
    'authToken',
    'client',
    'professional',
    'userType',
    'redirectAfterLogin'
  ];
  
  keysToRemove.forEach(key => localStorage.removeItem(key));
};

/**
 * Valida formato básico de teléfono
 * Acepta: +54 11 1234-5678, +5411 12345678, 11-1234-5678, etc.
 */
export const validatePhone = (phone) => {
  if (!phone || phone.trim() === '') return true; // Opcional
  
  // Regex básico: permite +, espacios, guiones y números
  const phoneRegex = /^[\+]?[(]?[0-9]{1,4}[)]?[-\s\.]?[(]?[0-9]{1,4}[)]?[-\s\.]?[0-9]{1,9}$/;
  return phoneRegex.test(phone.replace(/\s+/g, ''));
};

/**
 * Formatea una fecha ISO a formato legible en español
 * @param {string} isoDate - Fecha en formato ISO (2026-08-15T00:00:00)
 * @returns {string} - Fecha formateada (15 de agosto de 2026)
 */
export const formatDate = (isoDate) => {
  if (!isoDate) return 'Fecha no disponible';
  
  try {
    const date = new Date(isoDate);
    return date.toLocaleDateString('es-AR', { 
      day: 'numeric', 
      month: 'long', 
      year: 'numeric' 
    });
  } catch (error) {
    console.error('Error formateando fecha:', error);
    return isoDate;
  }
};