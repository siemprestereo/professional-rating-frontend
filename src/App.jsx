import { lazy, Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import NetworkStatus from './components/NetworkStatus';
import ProtectedRoute from './components/ProtectedRoute';

// Eager — needed immediately on first load
import LandingPage from './pages/LandingPage';
import ProfessionalLogin from './pages/ProfessionalLogin';
import ClientLogin from './pages/ClientLogin';
import QRResolve from './pages/QRResolve.jsx';

// Lazy — loaded on demand
const ProfessionalRegister   = lazy(() => import('./pages/ProfessionalRegister'));
const ClientRegister         = lazy(() => import('./pages/ClientRegister'));
const ForgotPassword         = lazy(() => import('./pages/ForgotPassword'));
const ResetPassword          = lazy(() => import('./pages/ResetPassword'));
const VerifyEmail            = lazy(() => import('./pages/VerifyEmail'));
const AcceptTerms            = lazy(() => import('./pages/AcceptTerms'));
const TermsPage              = lazy(() => import('./pages/TermsPage'));
const PublicCvView           = lazy(() => import('./pages/PublicCvView'));
const RatingForm             = lazy(() => import('./pages/RatingForm'));
const SearchProfessionals    = lazy(() => import('./pages/SearchProfessionals'));
const RatingsHistory         = lazy(() => import('./pages/RatingsHistory'));
const StatsPublic            = lazy(() => import('./pages/StatsPublic'));
const ProfessionalProfile    = lazy(() => import('./pages/ProfessionalProfile'));
const ProfessionalDashboard  = lazy(() => import('./pages/ProfessionalDashboard'));
const EditCV                 = lazy(() => import('./pages/EditCV'));
const Stats                  = lazy(() => import('./pages/Stats'));
const MyProfile              = lazy(() => import('./pages/MyProfile'));
const EditProfileProfessional = lazy(() => import('./pages/EditProfileProfessional'));
const CvView                 = lazy(() => import('./pages/CvView'));
const ClientDashboard        = lazy(() => import('./pages/ClientDashboard'));
const ClientStats            = lazy(() => import('./pages/ClientStats'));
const EditProfile            = lazy(() => import('./pages/EditProfile'));
const EditRatingForm         = lazy(() => import('./pages/EditRatingForm'));
const SavedProfessionals     = lazy(() => import('./pages/SavedProfessionals'));
const CompareProfessionals   = lazy(() => import('./pages/CompareProfessionals'));
const ClientRatingsHistory   = lazy(() => import('./pages/ClientRatingsHistory'));
const AdminDashboard         = lazy(() => import('./pages/AdminDashboard'));
const PendingVerification    = lazy(() => import('./pages/PendingVerification'));

function App() {
  return (
    <>
      <NetworkStatus />
      <Router>
        <Suspense fallback={null}>
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
            <Route path="/pending-verification" element={<PendingVerification />} />
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
        </Suspense>
      </Router>
    </>
  );
}

export default App;
