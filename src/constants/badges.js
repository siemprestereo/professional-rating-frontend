export const BADGE_DEFINITIONS = [
  // Medallas por cantidad
  { 
    id: 'first',
    threshold: 1, 
    icon: '🥉', 
    name: 'Primera calificación', 
    description: 'Has dado tu primera calificación',
    type: 'quantity'
  },
  { 
    id: 'active',
    threshold: 5, 
    icon: '🥈', 
    name: 'Calificador activo', 
    description: '5 calificaciones otorgadas',
    type: 'quantity'
  },
  { 
    id: 'experienced',
    threshold: 10, 
    icon: '🥇', 
    name: 'Calificador experimentado', 
    description: '10 calificaciones otorgadas',
    type: 'quantity'
  },
  { 
    id: 'expert',
    threshold: 25, 
    icon: '💎', 
    name: 'Calificador Experto', 
    description: '25 calificaciones otorgadas',
    type: 'quantity'
  },
  { 
    id: 'master',
    threshold: 50, 
    icon: '👑', 
    name: 'Calificador Maestro', 
    description: '50 calificaciones otorgadas',
    type: 'quantity'
  },
  { 
    id: 'legendary',
    threshold: 100, 
    icon: '⭐', 
    name: 'Calificador Legendario', 
    description: '100 calificaciones otorgadas',
    type: 'quantity'
  }
];

export const SPECIAL_BADGES = [
  {
    id: 'communicator',
    icon: '💬',
    name: 'Comunicador',
    description: '80% de tus calificaciones incluyen comentario',
    check: (stats) => stats.commentPercentage >= 80
  },
  {
    id: 'generous',
    icon: '🌟',
    name: 'Generoso',
    description: 'Promedio mayor a 4.5 estrellas',
    check: (stats) => stats.average >= 4.5
  },
  {
    id: 'precise',
    icon: '🎯',
    name: 'Preciso',
    description: 'Calificaciones equilibradas',
    check: (stats) => stats.average >= 3.5 && stats.average <= 4.5
  },
  {
    id: 'explorer',
    icon: '🔍',
    name: 'Explorador',
    description: 'Has calificado 5+ categorías diferentes',
    check: (stats) => stats.categoriesCount >= 5
  }
];