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
import './index.css';

function LandingPage({ onOpenSignIn }) {
  return (
    <div id="top" style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      {/* Navigation Bar: Logo, About, Work, Sign In */}
      <Navbar onOpenSignIn={onOpenSignIn} />

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
      <Footer onOpenSignIn={onOpenSignIn} />
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

function AppShell() {
  const { isLoading, isAuthenticated, isVle } = useAuth();
  const [isSignInOpen, setIsSignInOpen] = useState(false);

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

  // Signed-in VLEs go straight to their field-operations portal.
  // Everyone else (anonymous visitors, or signed-in Volunteers/Admins —
  // whose dedicated consoles aren't built yet) sees the public site.
  if (isAuthenticated && isVle) {
    return <VLEApp />;
  }

  return (
    <>
      <LandingPage onOpenSignIn={() => setIsSignInOpen(true)} />
      <SignInModal isOpen={isSignInOpen} onClose={() => setIsSignInOpen(false)} />
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
