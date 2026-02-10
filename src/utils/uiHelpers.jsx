import { Star } from 'lucide-react';

export const renderStars = (score = 0, size = 'md') => {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-5 h-5',
    lg: 'w-6 h-6'
  };
  
  const sizeClass = sizeClasses[size] || sizeClasses.md;
  const roundedScore = Math.round(score);

  return [...Array(5)].map((_, i) => (
    <Star
      key={`star-${i}`} // Mejor una key más descriptiva
      className={`${sizeClass} ${
        i < roundedScore 
          ? 'text-yellow-400 fill-yellow-400' 
          : 'text-gray-300'
      }`}
    />
  ));
};

export const formatCvDate = (dateString) => {
  if (!dateString) return 'Presente';
  
  const date = new Date(dateString);
  
  // Verificamos si la fecha es válida para evitar "Invalid Date" en el render
  if (isNaN(date.getTime())) return 'Fecha inválida';

  const formattedDate = date.toLocaleDateString('es-AR', { 
    month: 'short', 
    year: 'numeric' 
  });

  // Quitamos el punto final que pone toLocaleDateString en 'short' (opcional)
  return formattedDate.replace('.', '');
};