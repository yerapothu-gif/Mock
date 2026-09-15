import { useState } from 'react';
import Navbar from './components/Navbar';
import HeroSlider from './components/HeroSlider';
import PillarsSection from './components/PillarsSection';
import StatsSection from './components/StatsSection';
import ImpactStoriesSlider from './components/ImpactStoriesSlider';
import WorkGallerySection from './components/WorkGallerySection';
import Footer from './components/Footer';
import SignInModal from './components/SignInModal';

export default function App() {
  const [isSignInOpen, setIsSignInOpen] = useState(false);

  const handleOpenSignIn = () => {
    setIsSignInOpen(true);
  };

  const handleCloseSignIn = () => {
    setIsSignInOpen(false);
  };

  return (
    <div id="top" style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      {/* Navigation Bar: Logo, About, Work, Sign In */}
      <Navbar onOpenSignIn={handleOpenSignIn} />

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
      <Footer onOpenSignIn={handleOpenSignIn} />

      {/* Role Sign In Modal */}
      <SignInModal isOpen={isSignInOpen} onClose={handleCloseSignIn} />
    </div>
  );
}
