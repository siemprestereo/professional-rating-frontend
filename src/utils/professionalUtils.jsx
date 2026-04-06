import { Star } from 'lucide-react';

// ✅ Diccionario fuera de la función para mejor performance
const PROFESSION_TRANSLATIONS = {
  'WAITER': 'Mozo/Camarero',
  'CHEF': 'Chef/Cocinero',
  'BARISTA': 'Barista',
  'BARTENDER': 'Bartender',
  'ELECTRICIAN': 'Electricista',
  'PLUMBER': 'Plomero/a',
  'PAINTER': 'Pintor/a',
  'CARPENTER': 'Carpintero/a',
  'CONSTRUCTION_WORKER': 'Obrero de construcción',
  'GARDENER': 'Jardinero/a',
  'AIR_CONDITIONING_TECHNICIAN': 'Instalador de A/A',
  'GENERAL_MAINTENANCE': 'Mantenimiento general',
  'CLEANER': 'Personal de limpieza',
  'HAIRDRESSER': 'Peluquero/a',
  'PILATES': 'Instructor/a de Pilates',
  'MECHANIC': 'Mecánico/a',
  'DRIVER': 'Conductor',
  'SECURITY': 'Personal de seguridad',
  'RECEPTIONIST': 'Recepcionista',
  'TUTORING_GENERAL': 'Clases particulares',
  'MATH_TUTOR': 'Docente de matemáticas',
  'ENGLISH_TUTOR': 'Docente de inglés',
  'OTHER_TUTOR': 'Docente de otras materias',
  'OTHER': 'Otro',
  // legacy codes
  'MOZO_A': 'Mozo/Camarero',
  'MOZO': 'Mozo/Camarero',
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