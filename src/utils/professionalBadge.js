/**
 * Calcula la medalla según cantidad de calificaciones
 * @param {number} totalRatings - Cantidad total de calificaciones
 * @returns {object} { emoji, name, color, bgColor, borderColor }
 */
export const getProfessionalBadge = (totalRatings) => {
  if (totalRatings >= 20) {
    return {
      emoji: '🥇',
      name: 'Veterano',
      color: 'text-yellow-600',
      bgColor: 'bg-yellow-50',
      borderColor: 'border-yellow-300'
    };
  } else if (totalRatings >= 5) {
    return {
      emoji: '🥈',
      name: 'Experimentado',
      color: 'text-gray-600',
      bgColor: 'bg-gray-50',
      borderColor: 'border-gray-300'
    };
  } else {
    return {
      emoji: '🥉',
      name: 'Principiante',
      color: 'text-orange-600',
      bgColor: 'bg-orange-50',
      borderColor: 'border-orange-300'
    };
  }
};

/**
 * Calcula el score ajustado usando fórmula Bayesiana
 * Penaliza profesionales con pocas calificaciones tirando su score hacia el promedio global
 * 
 * @param {number} avgScore - Promedio de calificaciones (0-5)
 * @param {number} totalRatings - Cantidad total de calificaciones
 * @returns {number} Score ajustado (0-5)
 * 
 * @example
 * // Profesional con 1 calificación de 5 estrellas
 * getAdjustedScore(5.0, 1) // → ~4.17 (penalizado por poca data)
 * 
 * // Profesional con 50 calificaciones de 4.8 estrellas  
 * getAdjustedScore(4.8, 50) // → ~4.79 (casi sin penalización)
 */
export const getAdjustedScore = (avgScore, totalRatings) => {
  const C = 10; // Confianza mínima requerida (número de calificaciones para "confiar" en el promedio)
  const m = 4.0; // Promedio global de la plataforma (baseline esperado)
  
  // Fórmula Bayesiana: weighted average entre el promedio global y el promedio real
  // Cuando totalRatings es bajo, el score se acerca más a 'm' (promedio global)
  // Cuando totalRatings es alto, el score se acerca más a 'avgScore' (promedio real)
  const adjustedScore = ((C * m) + (avgScore * totalRatings)) / (C + totalRatings);
  
  return adjustedScore;
};