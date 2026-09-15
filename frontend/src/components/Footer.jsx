
export default function Footer({ onOpenSignIn, onNavigateAdmin }) {
  return (
    <footer
      style={{
        backgroundColor: 'var(--brand-charcoal)',
        color: '#ffffff',
        padding: '90px 0 40px',
        borderTop: '1px solid rgba(255, 255, 255, 0.1)',
      }}
    >
      <div className="container">
        {/* Top Footer Grid */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
            gap: '50px',
            marginBottom: '70px',
          }}
        >
          {/* Column 1: Brand & Mission */}
          <div style={{ maxWidth: '360px' }}>
            <img
              src="/images/logo.png"
              onError={(e) => {
                e.target.onerror = null;
                e.target.src = 'https://framerusercontent.com/images/cN8Y0VLU8UWjo1mrNrSz9L1IuWU.png';
              }}
              alt="Reaching Roots Foundation"
              style={{
                height: '46px',
                marginBottom: '20px',
                filter: 'brightness(0) invert(1)',
                objectFit: 'contain',
              }}
            />
            <p
              style={{
                color: 'rgba(255, 255, 255, 0.7)',
                fontSize: '0.95rem',
                lineHeight: 1.65,
                marginBottom: '24px',
              }}
            >
              Reaching Roots Foundation strengthens rural communities through sustainable
              livelihoods, local entrepreneurship, and indigenous agricultural ecosystems.
            </p>
            <div
              style={{
                color: 'var(--brand-orange)',
                fontFamily: 'var(--font-heading)',
                fontSize: '0.85rem',
                fontWeight: 700,
                letterSpacing: '0.06em',
              }}
            >
              ROOTED IN PURPOSE, GROWING TOGETHER.
            </div>
          </div>

          {/* Column 2: Navigation Links */}
          <div>
            <h4
              style={{
                color: '#ffffff',
                fontSize: '0.9rem',
                fontWeight: 700,
                letterSpacing: '0.1em',
                textTransform: 'uppercase',
                fontFamily: 'var(--font-heading)',
                marginBottom: '22px',
                borderLeft: '2px solid var(--brand-orange)',
                paddingLeft: '10px',
              }}
            >
              Our Model
            </h4>
            <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <li>
                <a
                  href="#about"
                  style={{ color: 'rgba(255, 255, 255, 0.75)', fontSize: '0.9rem', transition: 'color 0.2s' }}
                  onMouseEnter={(e) => (e.target.style.color = '#ffffff')}
                  onMouseLeave={(e) => (e.target.style.color = 'rgba(255, 255, 255, 0.75)')}
                >
                  Indigenous Cropping
                </a>
              </li>
              <li>
                <a
                  href="#about"
                  style={{ color: 'rgba(255, 255, 255, 0.75)', fontSize: '0.9rem', transition: 'color 0.2s' }}
                  onMouseEnter={(e) => (e.target.style.color = '#ffffff')}
                  onMouseLeave={(e) => (e.target.style.color = 'rgba(255, 255, 255, 0.75)')}
                >
                  VLE Machinery Hubs
                </a>
              </li>
              <li>
                <a
                  href="#about"
                  style={{ color: 'rgba(255, 255, 255, 0.75)', fontSize: '0.9rem', transition: 'color 0.2s' }}
                  onMouseEnter={(e) => (e.target.style.color = '#ffffff')}
                  onMouseLeave={(e) => (e.target.style.color = 'rgba(255, 255, 255, 0.75)')}
                >
                  Bioresource Centers
                </a>
              </li>
              <li>
                <a
                  href="#about"
                  style={{ color: 'rgba(255, 255, 255, 0.75)', fontSize: '0.9rem', transition: 'color 0.2s' }}
                  onMouseEnter={(e) => (e.target.style.color = '#ffffff')}
                  onMouseLeave={(e) => (e.target.style.color = 'rgba(255, 255, 255, 0.75)')}
                >
                  Value Chain Linkages
                </a>
              </li>
            </ul>
          </div>

          {/* Column 3: Platform Portals */}
          <div>
            <h4
              style={{
                color: '#ffffff',
                fontSize: '0.9rem',
                fontWeight: 700,
                letterSpacing: '0.1em',
                textTransform: 'uppercase',
                fontFamily: 'var(--font-heading)',
                marginBottom: '22px',
                borderLeft: '2px solid var(--brand-green)',
                paddingLeft: '10px',
              }}
            >
              Platform Portals
            </h4>
            <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <li>
                <button
                  onClick={onOpenSignIn}
                  style={{
                    color: 'rgba(255, 255, 255, 0.75)',
                    fontSize: '0.9rem',
                    textAlign: 'left',
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    padding: 0,
                  }}
                  onMouseEnter={(e) => (e.target.style.color = '#ffffff')}
                  onMouseLeave={(e) => (e.target.style.color = 'rgba(255, 255, 255, 0.75)')}
                >
                  Field Volunteer Survey
                </button>
              </li>
              <li>
                <button
                  onClick={() => onOpenSignIn('admin')}
                  style={{
                    color: 'rgba(255, 255, 255, 0.75)',
                    fontSize: '0.9rem',
                    textAlign: 'left',
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    padding: 0,
                  }}
                  onMouseEnter={(e) => (e.target.style.color = '#ffffff')}
                  onMouseLeave={(e) => (e.target.style.color = 'rgba(255, 255, 255, 0.75)')}
                >
                  NGO Admin Dashboard
                </button>
              </li>
              <li>
                <button
                  onClick={onOpenSignIn}
                  style={{
                    color: 'rgba(255, 255, 255, 0.75)',
                    fontSize: '0.9rem',
                    textAlign: 'left',
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    padding: 0,
                  }}
                  onMouseEnter={(e) => (e.target.style.color = '#ffffff')}
                  onMouseLeave={(e) => (e.target.style.color = 'rgba(255, 255, 255, 0.75)')}
                >
                  VLE Entrepreneur Console
                </button>
              </li>
              <li>
                <button
                  onClick={onOpenSignIn}
                  style={{
                    color: 'rgba(255, 255, 255, 0.75)',
                    fontSize: '0.9rem',
                    textAlign: 'left',
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    padding: 0,
                  }}
                  onMouseEnter={(e) => (e.target.style.color = '#ffffff')}
                  onMouseLeave={(e) => (e.target.style.color = 'rgba(255, 255, 255, 0.75)')}
                >
                  AI Demand Reports
                </button>
              </li>
            </ul>
          </div>

          {/* Column 4: Operational Sanctuary Belt */}
          <div>
            <h4
              style={{
                color: '#ffffff',
                fontSize: '0.9rem',
                fontWeight: 700,
                letterSpacing: '0.1em',
                textTransform: 'uppercase',
                fontFamily: 'var(--font-heading)',
                marginBottom: '22px',
                borderLeft: '2px solid var(--brand-slate)',
                paddingLeft: '10px',
              }}
            >
              Operations & Reach
            </h4>
            <p
              style={{
                color: 'rgba(255, 255, 255, 0.7)',
                fontSize: '0.9rem',
                lineHeight: 1.6,
                marginBottom: '16px',
              }}
            >
              Bhopal Rural District & Ratapani Wildlife Sanctuary Belt, Madhya Pradesh, India.
            </p>
            <div
              style={{
                padding: '12px',
                backgroundColor: 'rgba(255, 255, 255, 0.06)',
                borderRadius: '4px',
                border: '1px solid rgba(255, 255, 255, 0.12)',
                fontSize: '0.82rem',
                color: 'rgba(255, 255, 255, 0.85)',
              }}
            >
              Partnership: Code for Good Hackathon 2026
            </div>
          </div>
        </div>

        {/* Bottom Bar (Copyright & Socials like Igsas) */}
        <div
          style={{
            borderTop: '1px solid rgba(255, 255, 255, 0.1)',
            paddingTop: '32px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '16px',
          }}
        >
          <div
            style={{
              fontSize: '0.85rem',
              color: 'rgba(255, 255, 255, 0.6)',
            }}
          >
            © {new Date().getFullYear()} Reaching Roots Foundation. All rights reserved.
          </div>

          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '24px',
            }}
          >
            <a
              href="https://reachingroots.org/"
              target="_blank"
              rel="noopener noreferrer"
              style={{
                color: 'rgba(255, 255, 255, 0.7)',
                fontSize: '0.85rem',
                transition: 'color 0.2s',
              }}
              onMouseEnter={(e) => (e.target.style.color = '#ffffff')}
              onMouseLeave={(e) => (e.target.style.color = 'rgba(255, 255, 255, 0.7)')}
            >
              Official Website ↗
            </a>
            <a
              href="#top"
              style={{
                color: 'var(--brand-orange)',
                fontSize: '0.85rem',
                fontWeight: 700,
                textTransform: 'uppercase',
              }}
            >
              Back to Top ↑
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
