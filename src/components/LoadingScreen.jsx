import React from 'react';

function LoadingScreen({ 
  message = 'Cargando...', 
  gradient = 'from-blue-500 to-purple-600' 
}) {
  return (
    <div className={`min-h-screen bg-gradient-to-br ${gradient} flex flex-col items-center justify-center animate-fadeIn`}>
      <img 
        src="/Logo-calificalo.png" 
        alt="Calificalo" 
        className="h-32 w-auto mb-6 logo-breathe"
      />
      <p className="text-white text-xl font-light">{message}</p>
    </div>
  );
}

export default LoadingScreen;