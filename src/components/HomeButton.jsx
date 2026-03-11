import { useNavigate } from 'react-router-dom';
import { Home } from 'lucide-react';

function HomeButton() {
  const navigate = useNavigate();
  const handleHome = () => {
    const userType = localStorage.getItem('userType');
    if (userType === 'PROFESSIONAL') navigate('/professional-dashboard');
    else if (userType === 'CLIENT') navigate('/client-dashboard');
    else navigate('/');
  };
  return (
    <div className="fixed bottom-4 left-0 right-0 flex justify-center z-50 pointer-events-none">
      <button onClick={handleHome} className="w-14 h-14 bg-gradient-to-r from-teal-500 to-teal-600 rounded-full flex items-center justify-center shadow-2xl border-4 border-white pointer-events-auto active:scale-95 transition-transform">
        <Home className="w-7 h-7 text-white" />
      </button>
    </div>
  );
}

export default HomeButton;