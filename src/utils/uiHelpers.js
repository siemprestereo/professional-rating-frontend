import { Star } from 'lucide-react';

export const renderStars = (score, size = 'md') => {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-5 h-5',
    lg: 'w-6 h-6'
  };
  
  const sizeClass = sizeClasses[size] || sizeClasses.md;
  
  return [...Array(5)].map((_, i) => (
    <Star
      key={i}
      className={`${sizeClass} ${i < Math.round(score) ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'}`}
    />
  ));
};

export const formatCvDate = (dateString) => {
  if (!dateString) return 'Presente';
  const date = new Date(dateString);
  return date.toLocaleDateString('es-AR', { month: 'short', year: 'numeric' });
};