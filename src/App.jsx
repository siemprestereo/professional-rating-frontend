import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
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
import CvView from './pages/CvView';
import PublicCvView from './pages/PublicCvView';
import RatingsHistory from './pages/RatingsHistory';
import StatsPublic from './pages/StatsPublic';
import ClientStats from './pages/ClientStats';
import SavedProfessionals from './pages/SavedProfessionals';
import CompareProfessionals from './pages/CompareProfessionals';
import ClientRatingsHistory from './pages/ClientRatingsHistory';
import EditRatingForm from './pages/EditRatingForm';
import NetworkStatus from './components/NetworkStatus';
import AcceptTerms from './pages/AcceptTerms';
import TermsPage from './pages/TermsPage';
import AdminDashboard from './pages/AdminDashboard';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
import VerifyEmail from './pages/VerifyEmail';

function App() {
  return (
    <>
      <NetworkStatus />

      <Router>
        <Routes>
          {/* Rutas públicas */}
          <Route path="/" element={<LandingPage />} />
          <Route path="/terms" element={<TermsPage />} />
          <Route path="/accept-terms" element={<AcceptTerms />} />

          <Route path="/professional/:professionalId" element={<PublicCvView />} />
          <Route path="/public-cv/:professionalId" element={<PublicCvView />} />
          <Route path="/rate/:code" element={<QRResolve />} />
          <Route path="/rate-professional/:professionalId" element={<RatingForm />} />
          <Route path="/search" element={<SearchProfessionals />} />
          <Route path="/professional-login" element={<ProfessionalLogin />} />
          <Route path="/professional-register" element={<ProfessionalRegister />} />
          <Route path="/client-login" element={<ClientLogin />} />
          <Route path="/client-register" element={<ClientRegister />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password" element={<ResetPassword />} />
          <Route path="/verify-email" element={<VerifyEmail />} />
          <Route path="/stats-public/:professionalId" element={<StatsPublic />} />
          <Route path="/ratings-history" element={<RatingsHistory />} />

          {/* Rutas protegidas — PROFESIONALES */}
          <Route path="/dashboard" element={<ProtectedRoute userType="PROFESSIONAL"><ProfessionalDashboard /></ProtectedRoute>} />
          <Route path="/professional-dashboard" element={<ProtectedRoute userType="PROFESSIONAL"><ProfessionalDashboard /></ProtectedRoute>} />
          <Route path="/edit-cv" element={<ProtectedRoute userType="PROFESSIONAL"><EditCV /></ProtectedRoute>} />
          <Route path="/stats" element={<ProtectedRoute userType="PROFESSIONAL"><Stats /></ProtectedRoute>} />
          <Route path="/my-profile" element={<ProtectedRoute userType="PROFESSIONAL"><MyProfile /></ProtectedRoute>} />
          <Route path="/edit-profile-professional" element={<ProtectedRoute userType="PROFESSIONAL"><EditProfileProfessional /></ProtectedRoute>} />
          <Route path="/cv-view" element={<ProtectedRoute userType="PROFESSIONAL"><CvView /></ProtectedRoute>} />

          {/* Rutas protegidas — CLIENTES */}
          <Route path="/client-dashboard" element={<ProtectedRoute userType="CLIENT"><ClientDashboard /></ProtectedRoute>} />
          <Route path="/client-stats" element={<ProtectedRoute userType="CLIENT"><ClientStats /></ProtectedRoute>} />
          <Route path="/edit-profile" element={<ProtectedRoute userType="CLIENT"><EditProfile /></ProtectedRoute>} />

          {/* Rutas mixtas */}
          <Route path="/edit-rating/:ratingId" element={<EditRatingForm />} />
          <Route path="/saved-professionals" element={<SavedProfessionals />} />
          <Route path="/compare-professionals" element={<CompareProfessionals />} />
          <Route path="/client-ratings-history" element={<ClientRatingsHistory />} />
          {/* Admin */}
          <Route path="/admin" element={<ProtectedRoute userType="ADMIN"><AdminDashboard /></ProtectedRoute>} />

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Router>
    </>
  );
}

export default App;