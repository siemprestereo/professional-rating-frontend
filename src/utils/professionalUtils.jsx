import { Star } from 'lucide-react';

// ✅ Diccionario fuera de la función para mejor performance
const PROFESSION_TRANSLATIONS = {
  'WAITER': 'Mozo',
  'ELECTRICIAN': 'Electricista',
  'PAINTER': 'Pintor',
  'HAIRDRESSER': 'Peluquero',
  'PLUMBER': 'Plomero',
  'CARPENTER': 'Carpintero',
  'MECHANIC': 'Mecánico',
  'CHEF': 'Chef',
  'BARISTA': 'Barista',
  'BARTENDER': 'Bartender',
  'CLEANER': 'Personal de limpieza',
  'GARDENER': 'Jardinero',
  'DRIVER': 'Conductor',
  'SECURITY': 'Seguridad',
  'RECEPTIONIST': 'Recepcionista'
};

/**
 * Traduce el tipo de profesión del inglés al español
 * @param {string} type - Tipo de profesión en inglés (ej: 'WAITER', 'ELECTRICIAN')
 * @returns {string} Traducción en español o el tipo original si no existe
 */
export const translateProfession = (type) => {
  return PROFESSION_TRANSLATIONS[type] || type;
};

/**
 * Componente que renderiza estrellas de calificación
 * Nota: Usa Math.round() para el redondeo estándar (4.5+ → 5 estrellas, <4.5 → 4 estrellas)
 * @param {number} score - Puntuación de 0 a 5
 * @param {string} size - Clases de Tailwind para el tamaño (default: 'w-4 h-4')
 */
export const RenderStars = ({ score, size = 'w-4 h-4' }) => {
  const filledStars = Math.round(score);
  
  return (
    <>
      {[...Array(5)].map((_, i) => (
        <Star
          key={`star-${i}`}
          className={`${size} ${i < filledStars ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'}`}
        />
      ))}
    </>
  );
};