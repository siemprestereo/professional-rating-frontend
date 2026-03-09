import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';

function BackButton({ to, className = '' }) {
  const navigate = useNavigate();

  const handleBack = () => {
    if (to) {
      navigate(to);
    } else {
      navigate(-1);
    }
  };

  return (
    <button
      onClick={handleBack}
      className={`flex items-center gap-1 text-white/80 hover:text-white transition-colors py-2 pr-2 ${className}`}
    >
      <ArrowLeft className="w-5 h-5" />
      <span className="text-sm font-medium">Volver</span>
    </button>
  );
}

export default BackButton;