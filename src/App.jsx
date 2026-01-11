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
import EditProfileProfessional from './pages/EditProfileProfessional';
import ProtectedRoute from './components/ProtectedRoute';
import FontWeightTest from './pages/FontWeightTest';
import CvView from './pages/CvView';
import PublicCvView from './pages/PublicCvView';
import RatingsHistory from './pages/RatingsHistory';

function App() {
  return (
    <Router>
      <Routes>
        {/* Rutas públicas */}
        <Route path="/" element={<LandingPage />} />
        <Route path="/professional/:professionalId" element={<ProfessionalProfile />} />
        <Route path="/rate/:code" element={<QRResolve />} />
        <Route path="/rate-professional/:professionalId" element={<RatingForm />} />
        <Route path="/search" element={<SearchProfessionals />} />
        <Route path="/professional-login" element={<ProfessionalLogin />} />
        <Route path="/professional-register" element={<ProfessionalRegister />} />
        <Route path="/client-login" element={<ClientLogin />} />
        <Route path="/client-register" element={<ClientRegister />} />
        <Route path="/font-test" element={<FontWeightTest />} />
        <Route path="/cv/:professionalId" element={<PublicCvView />} />

        {/* Rutas protegidas -- PROFESIONALES */}
        <Route 
          path="/dashboard" 
          element={
            <ProtectedRoute userType="PROFESSIONAL">
              <ProfessionalDashboard />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/professional-dashboard" 
          element={
            <ProtectedRoute userType="PROFESSIONAL">
              <ProfessionalDashboard />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/edit-cv" 
          element={
            <ProtectedRoute userType="PROFESSIONAL">
              <EditCV />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/stats" 
          element={
            <ProtectedRoute userType="PROFESSIONAL">
              <Stats />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/my-profile" 
          element={
            <ProtectedRoute userType="PROFESSIONAL">
              <MyProfile />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/edit-profile-professional" 
          element={
            <ProtectedRoute userType="PROFESSIONAL">
              <EditProfileProfessional />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/cv-view" 
          element={
            <ProtectedRoute userType="PROFESSIONAL">
              <CvView />
            </ProtectedRoute>
          } 
        />
        {/* *** MOVER ESTA RUTA AQUÍ *** */}
        <Route 
          path="/ratings-history" 
          element={
            <ProtectedRoute userType="PROFESSIONAL">
              <RatingsHistory />
            </ProtectedRoute>
          } 
        />

        {/* Rutas protegidas - CLIENTES */}
        <Route 
          path="/client-dashboard" 
          element={
            <ProtectedRoute userType="CLIENT">
              <ClientDashboard />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/edit-profile" 
          element={
            <ProtectedRoute userType="CLIENT">
              <EditProfile />
            </ProtectedRoute>
          } 
        />
      </Routes>
    </Router>
  );
}

export default App;