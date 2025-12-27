import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import LandingPage from './pages/LandingPage';
import ProfessionalProfile from './pages/ProfessionalProfile';
import RatingForm from './pages/RatingForm';
import QRResolve from './pages/QRResolve.jsx';
import ProfessionalDashboard from './pages/ProfessionalDashboard';
import ClientDashboard from './pages/ClientDashboard';
import SearchProfessionals from './pages/SearchProfessionals';
import ProfessionalLogin from './pages/ProfessionalLogin';
import ProfessionalRegister from './pages/ProfessionalRegister';
import EditCV from './pages/EditCV';
import Stats from './pages/Stats';
import MyProfile from './pages/MyProfile';
import ClientLogin from './pages/ClientLogin';
import ClientRegister from './pages/ClientRegister';
import EditProfile from './pages/EditProfile';



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
        <Route path="/my-profile" element={<MyProfile />} />
        <Route path="/client-login" element={<ClientLogin />} />
        <Route path="/client-register" element={<ClientRegister />} />
        <Route path="/edit-profile" element={<EditProfile />} />
      </Routes>
    </Router>
  );
}

export default App;