import { Star } from 'lucide-react';

// Traducciones de profesiones
export const translateProfession = (type) => {
  const translations = {
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
    'RECEPTIONIST': 'Recepcionista '
  };
  return translations[type] || type;
};

// Componente de estrellas
export const renderStars = (score, size = 'w-4 h-4') => {
  return [...Array(5)].map((_, i) => (
    <Star
      key={i}
      className={`${size} ${i < Math.round(score) ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'}`}
    />
  ));
};