import { useState } from 'react';
import { ToastProvider } from './context/ToastContext';
import { AuthProvider, useAuth } from './context/AuthContext';
import { OfflineProvider } from './context/OfflineContext';
import { VLELayout } from './components/layout/VLELayout';
import DashboardPage from './pages/DashboardPage';
import EquipmentPage from './pages/EquipmentPage';
import TransactionsPage from './pages/TransactionsPage';
import SupportPage from './pages/SupportPage';
import ProfilePage from './pages/ProfilePage';
import Navbar from './components/Navbar';
import HeroSlider from './components/HeroSlider';
import PillarsSection from './components/PillarsSection';
import StatsSection from './components/StatsSection';
import ImpactStoriesSlider from './components/ImpactStoriesSlider';
import WorkGallerySection from './components/WorkGallerySection';
import Footer from './components/Footer';
import SignInModal from './components/SignInModal';
import AdminDashboard from './components/admin/AdminDashboard';
import './index.css';

import { VolunteerAuthProvider } from './context/VolunteerAuthContext';
import { VolunteerOfflineProvider } from './context/VolunteerOfflineContext';
import { VolunteerLayout } from './components/layout/VolunteerLayout';

import { VolunteerDashboardPage } from './pages/VolunteerDashboardPage';
import { VillagesPage } from './pages/VillagesPage';
import { FarmersPage } from './pages/FarmersPage';
import { NeedsAssessmentPage } from './pages/NeedsAssessmentPage';
import { CandidatesPage } from './pages/CandidatesPage';
import { OfflineSyncPage } from './pages/OfflineSyncPage';
import { VolunteerProfilePage } from './pages/VolunteerProfilePage';

import './App.css';

function LandingPage({ onOpenSignIn, onNavigateAdmin }) {
  return (
    <div id="top" style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      {/* Navigation Bar: Logo, About, Work, Admin Portal, Sign In */}
      <Navbar onOpenSignIn={onOpenSignIn} onNavigateAdmin={onNavigateAdmin} />

      {/* Main Landing Flow */}
      <main style={{ flex: 1 }}>
        {/* Fullscreen Hero Slider (igsas.com.tr Start-Slider layout) */}
        <HeroSlider onOpenSignIn={onOpenSignIn} />

        {/* About & Core Model (igsas 2-column feature cards) */}
        <PillarsSection onOpenSignIn={onOpenSignIn} />

        {/* Dynamic Key Stats & Metrics (igsas "Rakamlarla..." pattern section) */}
        <StatsSection onOpenSignIn={onOpenSignIn} />

        {/* Work & Impact Stories (igsas "Toprağın İzinde" slider) */}
        <ImpactStoriesSlider onOpenSignIn={onOpenSignIn} />

        {/* Album Section (React Bits CircularGallery) */}
        <WorkGallerySection />
      </main>

      {/* Global Rich Footer */}
      <Footer onOpenSignIn={onOpenSignIn} onNavigateAdmin={onNavigateAdmin} />
    </div>
  );
}

function VLEApp() {
  const [activePage, setActivePage] = useState('dashboard');

  const renderPage = () => {
    switch (activePage) {
      case 'dashboard':    return <DashboardPage onNavigate={setActivePage} />;
      case 'equipment':    return <EquipmentPage />;
      case 'transactions': return <TransactionsPage />;
      case 'support':      return <SupportPage />;
      case 'profile':      return <ProfilePage />;
      default:             return <DashboardPage onNavigate={setActivePage} />;
    }
  };

  return (
    <VLELayout activePage={activePage} onNavigate={setActivePage}>
      {renderPage()}
    </VLELayout>
  );
}

function VolunteerApp() {
  const [activeTab, setActiveTab] = useState('dashboard');

  const renderActivePage = () => {
    switch (activeTab) {
      case 'dashboard':
        return <VolunteerDashboardPage onNavigate={setActiveTab} />;
      case 'villages':
        return <VillagesPage />;
      case 'farmers':
        return <FarmersPage />;
      case 'assessments':
        return <NeedsAssessmentPage />;
      case 'candidates':
        return <CandidatesPage />;
      case 'sync':
        return <OfflineSyncPage />;
      case 'profile':
        return <VolunteerProfilePage />;
      default:
        return <VolunteerDashboardPage onNavigate={setActiveTab} />;
    }
  };

  return (
    <VolunteerLayout activeTab={activeTab} onNavigate={setActiveTab}>
      {renderActivePage()}
    </VolunteerLayout>
  );
}

function AppShell() {
  const { isLoading, isAuthenticated, isVle, isVolunteer } = useAuth();
  const [isSignInOpen, setIsSignInOpen] = useState(false);
  const [isAdminView, setIsAdminView] = useState(false);

  const handleEnterAdmin = () => {
    setIsAdminView(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleExitToLanding = () => {
    setIsAdminView(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  if (isLoading) {
    return (
      <div style={{
        minHeight: '100vh', display: 'flex', alignItems: 'center',
        justifyContent: 'center', background: '#1b4332'
      }}>
        <div style={{ textAlign: 'center', color: '#52b788' }}>
          <div style={{ fontSize: '2.5rem', marginBottom: 16 }}>🌱</div>
          <p style={{ color: '#c9d6cf', fontSize: '0.9rem', fontWeight: 600 }}>
            Loading Reaching Roots...
          </p>
        </div>
      </div>
    );
  }

  if (isAdminView) {
    return <AdminDashboard onExitToLanding={handleExitToLanding} />;
  }

  // Signed-in VLEs go straight to their field-operations portal.
  if (isAuthenticated && isVle) {
    return <VLEApp />;
  }

  // Signed-in Volunteers go to their own field-data-collection portal,
  // which owns its own auth/offline context (auto-loads a simulated
  // profile rather than depending on the shared AuthProvider session).
  if (isAuthenticated && isVolunteer) {
    return (
      <VolunteerAuthProvider>
        <VolunteerOfflineProvider>
          <VolunteerApp />
        </VolunteerOfflineProvider>
      </VolunteerAuthProvider>
    );
  }

  return (
    <>
      <LandingPage onOpenSignIn={() => setIsSignInOpen(true)} onNavigateAdmin={handleEnterAdmin} />
      <SignInModal
        isOpen={isSignInOpen}
        onClose={() => setIsSignInOpen(false)}
        onEnterAdmin={handleEnterAdmin}
      />
    </>
  );
}

export default function App() {
  return (
    <ToastProvider>
      <AuthProvider>
        <OfflineProvider>
          <AppShell />
        </OfflineProvider>
      </AuthProvider>
    </ToastProvider>
  );
}
