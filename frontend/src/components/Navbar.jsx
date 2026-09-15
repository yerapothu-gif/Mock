import { useState, useEffect } from 'react';

export default function Navbar({ onOpenSignIn, onNavigateAdmin }) {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 40) {
        setScrolled(true);
      } else {
        setScrolled(false);
      }
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <>
      <header
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          zIndex: 1000,
          transition: 'all 0.35s cubic-bezier(0.16, 1, 0.3, 1)',
          backgroundColor: scrolled
            ? 'rgba(252, 250, 248, 0.94)'
            : 'rgba(252, 250, 248, 0.75)',
          backdropFilter: 'blur(16px)',
          WebkitBackdropFilter: 'blur(16px)',
          borderBottom: scrolled
            ? '1px solid rgba(28, 28, 28, 0.08)'
            : '1px solid rgba(28, 28, 28, 0.04)',
          boxShadow: scrolled ? '0 4px 20px rgba(0, 0, 0, 0.04)' : 'none',
        }}
      >
        <div
          className="container"
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            height: scrolled ? '74px' : '88px',
            transition: 'height 0.3s ease',
          }}
        >
          {/* Logo with official Reaching Roots site image */}
          <a
            href="/"
            style={{
              display: 'flex',
              alignItems: 'center',
              textDecoration: 'none',
            }}
          >
            <img
              src="/images/logo.png"
              onError={(e) => {
                e.target.onerror = null;
                e.target.src = 'https://framerusercontent.com/images/cN8Y0VLU8UWjo1mrNrSz9L1IuWU.png';
              }}
              alt="Reaching Roots Foundation"
              style={{
                height: scrolled ? '42px' : '48px',
                width: 'auto',
                transition: 'height 0.3s ease',
                objectFit: 'contain',
              }}
            />
          </a>

          {/* Desktop Navigation: Logo, About, Work, Sign In */}
          <nav
            style={{
              display: 'none',
              alignItems: 'center',
              gap: '40px',
            }}
            className="desktop-nav"
          >
            <a
              href="#about"
              style={{
                fontFamily: 'var(--font-heading)',
                fontSize: '0.95rem',
                fontWeight: 600,
                color: 'var(--brand-charcoal)',
                textTransform: 'uppercase',
                letterSpacing: '0.06em',
                transition: 'color 0.2s ease',
                position: 'relative',
              }}
              onMouseEnter={(e) => (e.target.style.color = 'var(--brand-green)')}
              onMouseLeave={(e) => (e.target.style.color = 'var(--brand-charcoal)')}
            >
              About
            </a>

            <a
              href="#work"
              style={{
                fontFamily: 'var(--font-heading)',
                fontSize: '0.95rem',
                fontWeight: 600,
                color: 'var(--brand-charcoal)',
                textTransform: 'uppercase',
                letterSpacing: '0.06em',
                transition: 'color 0.2s ease',
              }}
              onMouseEnter={(e) => (e.target.style.color = 'var(--brand-green)')}
              onMouseLeave={(e) => (e.target.style.color = 'var(--brand-charcoal)')}
            >
              Work
            </a>

            {/* Connect / Sign In (Igsas pill button aesthetic) */}
            <button
              onClick={onOpenSignIn}
              className="btn-connect"
              style={{
                border: 'none',
                cursor: 'pointer',
              }}
            >
              <span>Sign In</span>
              <svg
                width="14"
                height="14"
                viewBox="0 0 14 14"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M14 7.3466L13.4268 6.61513L8.7769 0.693149L7.20269 2.15609L10.3915 6.21861L0.235849 6.21861L0.235849 8.47461L10.3915 8.47461L7.20269 12.5371L8.7769 14L13.4268 8.07803L14 7.3466Z"
                  fill="white"
                />
              </svg>
            </button>
          </nav>

          {/* Mobile Hamburger Toggle (igsas style) */}
          <div
            className="mobile-toggle"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
            }}
          >
            <button
              onClick={onOpenSignIn}
              className="btn-connect mobile-signin-btn"
              style={{
                fontSize: '0.75rem',
                padding: '8px 16px',
              }}
            >
              Sign In
            </button>

            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              style={{
                background: 'transparent',
                border: '1px solid rgba(28, 28, 28, 0.2)',
                borderRadius: '4px',
                padding: '8px 12px',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                color: 'var(--brand-charcoal)',
                fontWeight: 600,
                fontSize: '0.85rem',
              }}
              aria-label="Toggle Menu"
            >
              <span>{mobileMenuOpen ? 'CLOSE' : 'MENU'}</span>
              <div
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '4px',
                  width: '18px',
                }}
              >
                <span
                  style={{
                    height: '2px',
                    width: '100%',
                    background: 'var(--brand-charcoal)',
                    transition: 'all 0.3s ease',
                    transform: mobileMenuOpen ? 'rotate(45deg) translate(2px, 4px)' : 'none',
                  }}
                />
                <span
                  style={{
                    height: '2px',
                    width: '100%',
                    background: 'var(--brand-charcoal)',
                    transition: 'all 0.3s ease',
                    transform: mobileMenuOpen ? 'rotate(-45deg) translate(2px, -4px)' : 'none',
                  }}
                />
              </div>
            </button>
          </div>
        </div>

        {/* Mobile Dropdown Panel */}
        {mobileMenuOpen && (
          <div
            style={{
              backgroundColor: 'var(--brand-bg)',
              borderBottom: '1px solid rgba(28, 28, 28, 0.1)',
              padding: '20px 24px 28px',
              display: 'flex',
              flexDirection: 'column',
              gap: '18px',
            }}
          >
            <a
              href="#about"
              onClick={() => setMobileMenuOpen(false)}
              style={{
                fontFamily: 'var(--font-heading)',
                fontSize: '1.1rem',
                fontWeight: 700,
                color: 'var(--brand-charcoal)',
                textTransform: 'uppercase',
                borderBottom: '1px solid rgba(28, 28, 28, 0.05)',
                paddingBottom: '8px',
              }}
            >
              About
            </a>
            <a
              href="#work"
              onClick={() => setMobileMenuOpen(false)}
              style={{
                fontFamily: 'var(--font-heading)',
                fontSize: '1.1rem',
                fontWeight: 700,
                color: 'var(--brand-charcoal)',
                textTransform: 'uppercase',
                borderBottom: '1px solid rgba(28, 28, 28, 0.05)',
                paddingBottom: '8px',
              }}
            >
              Work
            </a>
            <button
              onClick={() => {
                setMobileMenuOpen(false);
                onOpenSignIn();
              }}
              className="btn btn-primary"
              style={{
                marginTop: '10px',
                width: '100%',
                justifyContent: 'center',
              }}
            >
              Sign In to Platform
            </button>
          </div>
        )}
      </header>

      {/* Responsive media query helper */}
      <style>{`
        @media (min-width: 769px) {
          .desktop-nav {
            display: flex !important;
          }
          .mobile-toggle {
            display: none !important;
          }
        }
      `}</style>
    </>
  );
}
