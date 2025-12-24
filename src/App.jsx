import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import LandingPage from './pages/LandingPage';
import ProfessionalProfile from './pages/ProfessionalProfile.jsx/index.js';
import RatingForm from './pages/RatingForm';
import QRResolve from './pages/QRResolve.jsx';
import ProfessionalDashboard from './pages/ProfessionalDashboard';
import ClientDashboard from './pages/ClientDashboard';
import SearchProfessionals from './pages/SearchProfessionals';
import ProfessionalLogin from './pages/ProfessionalLogin';
import ProfessionalRegister from './pages/ProfessionalRegister2';
import EditCV from './pages/EditCV';
import Stats from './pages/Stats';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/professional/:professionalId" element={<ProfessionalProfile />} />
        <Route path="/rate/:code" element={<QRResolve />} />
        <Route path="/rate-professional/:professionalId" element={<RatingForm />} />
        <Route path="/dashboard" element={<ProfessionalDashboard />} />
        <Route path="/professional-dashboard" element={<ProfessionalDashboard />} />
        <Route path="/client-dashboard" element={<ClientDashboard />} />
        <Route path="/search" element={<SearchProfessionals />} />
        <Route path="/professional-login" element={<ProfessionalLogin />} />
        <Route path="/professional-register" element={<ProfessionalRegister />} />
        <Route path="/edit-cv" element={<EditCV />} />
        <Route path="/stats" element={<Stats />} />
      </Routes>
    </Router>
  );
}

export default App;