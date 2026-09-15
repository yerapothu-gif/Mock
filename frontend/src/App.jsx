import { useState } from 'react';
import Navbar from './components/Navbar';
import HeroSlider from './components/HeroSlider';
import PillarsSection from './components/PillarsSection';
import StatsSection from './components/StatsSection';
import ImpactStoriesSlider from './components/ImpactStoriesSlider';
import WorkGallerySection from './components/WorkGallerySection';
import Footer from './components/Footer';
import SignInModal from './components/SignInModal';
import AdminDashboard from './components/admin/AdminDashboard';

export default function App() {
  const [currentView, setCurrentView] = useState('landing'); // 'landing' | 'admin'
  const [isSignInOpen, setIsSignInOpen] = useState(false);

  const handleOpenSignIn = () => {
    setIsSignInOpen(true);
  };

  const handleCloseSignIn = () => {
    setIsSignInOpen(false);
  };

  const handleEnterAdmin = () => {
    setCurrentView('admin');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleExitToLanding = () => {
    setCurrentView('landing');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  if (currentView === 'admin') {
    return <AdminDashboard onExitToLanding={handleExitToLanding} />;
  }

  return (
    <div id="top" style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      {/* Navigation Bar: Logo, About, Work, Admin Portal, Sign In */}
      <Navbar
        onOpenSignIn={handleOpenSignIn}
        onNavigateAdmin={handleEnterAdmin}
      />

      {/* Main Landing Flow */}
      <main style={{ flex: 1 }}>
        {/* Fullscreen Hero Slider (igsas.com.tr Start-Slider layout) */}
        <HeroSlider onOpenSignIn={handleOpenSignIn} />

        {/* About & Core Model (igsas 2-column feature cards) */}
        <PillarsSection onOpenSignIn={handleOpenSignIn} />

        {/* Dynamic Key Stats & Metrics (igsas "Rakamlarla..." pattern section) */}
        <StatsSection onOpenSignIn={handleOpenSignIn} />

        {/* Work & Impact Stories (igsas "Toprağın İzinde" slider) */}
        <ImpactStoriesSlider onOpenSignIn={handleOpenSignIn} />

        {/* Album Section (React Bits CircularGallery) */}
        <WorkGallerySection />
      </main>

      {/* Global Rich Footer */}
      <Footer
        onOpenSignIn={handleOpenSignIn}
        onNavigateAdmin={handleEnterAdmin}
      />

      {/* Role Sign In Modal */}
      <SignInModal
        isOpen={isSignInOpen}
        onClose={handleCloseSignIn}
        onEnterAdmin={handleEnterAdmin}
      />
    </div>
  );
}
