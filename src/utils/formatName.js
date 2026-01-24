/**
 * Capitaliza correctamente un nombre completo
 * Convierte "JUAN PÉREZ" o "juan pérez" en "Juan Pérez"
 * @param {string} name - Nombre completo
 * @returns {string} - Nombre formateado
 */
export const capitalizeName = (name) => {
  if (!name) return 'Usuario';
  
  return name
    .trim()
    .toLowerCase()
    .split(' ')
    .filter(word => word.length > 0) // Eliminar espacios dobles
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
};

/**
 * Obtiene solo el primer nombre capitalizado
 * @param {string} fullName - Nombre completo
 * @returns {string} - Primer nombre capitalizado
 */
export const getFirstName = (fullName) => {
  if (!fullName) return 'Usuario';
  
  const firstName = fullName.trim().split(' ')[0];
  return firstName.charAt(0).toUpperCase() + firstName.slice(1).toLowerCase();
};