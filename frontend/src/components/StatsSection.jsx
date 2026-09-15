const STATS_DATA = [
  { target: 10000, suffix: '+', label: 'VILLAGE ENTREPRENEURS (VLE)' },
  { target: 10, suffix: ' LAKH+', label: 'FARMERS TARGET IMPACT' },
  { target: 150, suffix: '+', label: 'VILLAGES DIGITIZED' },
  { target: 100, suffix: '%', label: 'OFFLINE SYNC CAPABILITY' },
];

export default function StatsSection({ onOpenSignIn }) {

  return (
    <section
      style={{
        backgroundColor: 'var(--brand-green-dark)',
        color: '#ffffff',
        padding: '110px 0',
        position: 'relative',
        overflow: 'hidden',
      }}
      className="pattern-grid"
    >
      {/* Background glow accent (deep forest & amber tone) */}
      <div
        style={{
          position: 'absolute',
          top: '-20%',
          right: '-10%',
          width: '600px',
          height: '600px',
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(4, 114, 77, 0.4) 0%, transparent 70%)',
          pointerEvents: 'none',
        }}
      />
      <div
        style={{
          position: 'absolute',
          bottom: '-20%',
          left: '-10%',
          width: '500px',
          height: '500px',
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(252, 111, 15, 0.15) 0%, transparent 70%)',
          pointerEvents: 'none',
        }}
      />

      <div className="container" style={{ position: 'relative', zIndex: 10 }}>
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
            gap: '60px',
            alignItems: 'center',
          }}
        >
          {/* Left Side: Headings & Number Metrics (Igsas "stats-caption") */}
          <div>
            <div
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                color: 'var(--brand-orange)',
                fontWeight: 700,
                fontSize: '0.85rem',
                letterSpacing: '0.12em',
                textTransform: 'uppercase',
                fontFamily: 'var(--font-heading)',
                marginBottom: '16px',
              }}
            >
              <span>By the Numbers:</span>
            </div>

            <h2
              style={{
                color: '#ffffff',
                fontSize: 'clamp(2rem, 3.6vw, 3rem)',
                fontWeight: 800,
                lineHeight: 1.15,
                letterSpacing: '-0.025em',
                marginBottom: '18px',
              }}
            >
              Measuring real change on the ground across rural Bhopal.
            </h2>

            <p
              style={{
                color: 'rgba(255, 255, 255, 0.82)',
                fontSize: '1.1rem',
                lineHeight: 1.65,
                marginBottom: '48px',
                maxWidth: '560px',
              }}
            >
              Every rental transaction logged, every village mapped, and every crop cycle evaluated
              translates into measurable self-reliance and dignified income for our rural partners.
            </p>

            {/* Numerical Grid (4 Big Stats) */}
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(2, 1fr)',
                gap: '36px 24px',
              }}
            >
              {STATS_DATA.map((item, index) => (
                <div
                  key={index}
                  style={{
                    borderLeft: '2px solid rgba(255, 255, 255, 0.25)',
                    paddingLeft: '18px',
                  }}
                >
                  <div
                    style={{
                      fontFamily: 'var(--font-heading)',
                      fontSize: 'clamp(2.4rem, 4vw, 3.4rem)',
                      fontWeight: 900,
                      color: index === 0 ? 'var(--brand-orange)' : '#ffffff',
                      lineHeight: 1,
                      marginBottom: '8px',
                    }}
                  >
                    {item.target.toLocaleString()}
                    {item.suffix}
                  </div>
                  <small
                    style={{
                      fontFamily: 'var(--font-heading)',
                      fontSize: '0.78rem',
                      fontWeight: 700,
                      letterSpacing: '0.1em',
                      textTransform: 'uppercase',
                      color: 'rgba(255, 255, 255, 0.72)',
                      display: 'block',
                    }}
                  >
                    {item.label}
                  </small>
                </div>
              ))}
            </div>
          </div>

          {/* Right Side: Visual Card Showcase (Igsas "stats-animation") */}
          <div
            style={{
              position: 'relative',
              borderRadius: '4px',
              overflow: 'hidden',
              boxShadow: '0 24px 60px rgba(0, 0, 0, 0.35)',
              border: '1px solid rgba(255, 255, 255, 0.15)',
            }}
          >
            <img
              src="/images/roots_field7.jpg"
              alt="Rural farmer in field"
              style={{
                width: '100%',
                height: '480px',
                objectFit: 'cover',
                display: 'block',
              }}
            />

            {/* Floating Live Telemetry Badge */}
            <div
              style={{
                position: 'absolute',
                bottom: '24px',
                left: '24px',
                right: '24px',
                padding: '20px',
                backgroundColor: 'rgba(28, 28, 28, 0.88)',
                backdropFilter: 'blur(12px)',
                borderRadius: '4px',
                border: '1px solid rgba(255, 255, 255, 0.15)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
              }}
            >
              <div>
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    marginBottom: '4px',
                  }}
                >
                  <span
                    style={{
                      width: '8px',
                      height: '8px',
                      borderRadius: '50%',
                      backgroundColor: '#22c55e',
                      boxShadow: '0 0 8px #22c55e',
                    }}
                  />
                  <span
                    style={{
                      fontSize: '0.78rem',
                      fontWeight: 700,
                      color: 'rgba(255, 255, 255, 0.75)',
                      letterSpacing: '0.08em',
                      textTransform: 'uppercase',
                    }}
                  >
                    LIVE PLATFORM PULSE
                  </span>
                </div>
                <div
                  style={{
                    fontSize: '1.05rem',
                    fontWeight: 700,
                    color: '#ffffff',
                    fontFamily: 'var(--font-heading)',
                  }}
                >
                  Ratapani Sanctuary Operational Belt
                </div>
              </div>

              <button
                onClick={onOpenSignIn}
                className="btn btn-primary"
                style={{
                  padding: '10px 18px',
                  fontSize: '0.75rem',
                  backgroundColor: 'var(--brand-green)',
                }}
              >
                <span>OPEN MAP</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
