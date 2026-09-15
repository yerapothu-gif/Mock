
export default function PlatformHighlight({ onOpenSignIn }) {
  return (
    <section
      style={{
        padding: '120px 0 100px',
        backgroundColor: 'var(--brand-bg)',
      }}
    >
      <div className="container">
        {/* Main Highlight Card (Igsas "news-caption card-hover green-1") */}
        <div
          style={{
            backgroundColor: 'var(--brand-green)',
            color: '#ffffff',
            borderRadius: '4px',
            padding: '54px 60px',
            marginBottom: '48px',
            boxShadow: '0 16px 40px rgba(4, 114, 77, 0.2)',
            display: 'flex',
            flexDirection: 'column',
            gap: '24px',
            position: 'relative',
            overflow: 'hidden',
          }}
        >
          {/* Subtle background motif */}
          <div
            style={{
              position: 'absolute',
              right: '-80px',
              bottom: '-80px',
              width: '320px',
              height: '320px',
              borderRadius: '50%',
              background: 'radial-gradient(circle, rgba(255,255,255,0.12) 0%, transparent 70%)',
              pointerEvents: 'none',
            }}
          />

          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              flexWrap: 'wrap',
              gap: '12px',
            }}
          >
            <span
              style={{
                fontFamily: 'var(--font-heading)',
                fontSize: '0.85rem',
                fontWeight: 700,
                letterSpacing: '0.12em',
                color: 'var(--brand-orange)',
                textTransform: 'uppercase',
                backgroundColor: 'rgba(0, 0, 0, 0.25)',
                padding: '4px 14px',
                borderRadius: '2px',
              }}
            >
              CODE FOR GOOD • TECH FOR SOCIAL GOOD PROGRAM
            </span>

            <span
              style={{
                fontSize: '0.9rem',
                color: 'rgba(255, 255, 255, 0.75)',
                fontFamily: 'var(--font-heading)',
              }}
            >
              Bhopal & Ratapani Sanctuary Corridor
            </span>
          </div>

          <h3
            style={{
              color: '#ffffff',
              fontSize: 'clamp(1.8rem, 3.2vw, 2.7rem)',
              fontWeight: 800,
              lineHeight: 1.18,
              maxWidth: '920px',
            }}
          >
            A Unified Offline-First Architecture for Zero-Connectivity Rural Operations.
          </h3>

          <p
            style={{
              color: 'rgba(255, 255, 255, 0.88)',
              fontSize: '1.15rem',
              lineHeight: 1.7,
              maxWidth: '820px',
            }}
          >
            Replacing manual paper registers and fragmented spreadsheets with a mission-critical
            MERN stack platform. Field volunteers capture GPS pins and farming bottlenecks offline,
            while VLEs track daily machinery utilization and admins leverage AI-generated demand reports.
          </p>

          <div style={{ marginTop: '10px' }}>
            <button
              onClick={onOpenSignIn}
              className="btn"
              style={{
                backgroundColor: '#ffffff',
                color: 'var(--brand-green-dark)',
                fontWeight: 800,
              }}
            >
              <span>ACCESS ROLE PORTALS</span>
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                <path
                  d="M14 7.3466L13.4268 6.61513L8.7769 0.693149L7.20269 2.15609L10.3915 6.21861L0.235849 6.21861L0.235849 8.47461L10.3915 8.47461L7.20269 12.5371L8.7769 14L13.4268 8.07803L14 7.3466Z"
                  fill="currentColor"
                />
              </svg>
            </button>
          </div>
        </div>

        {/* 3 Secondary Capability Cards (Igsas "other-news row" style) */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
            gap: '28px',
          }}
        >
          {/* Card 1 */}
          <div
            style={{
              backgroundColor: '#ffffff',
              border: '1px solid var(--brand-border)',
              borderRadius: '4px',
              padding: '36px 30px',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              transition: 'transform 0.3s ease, border-color 0.3s ease',
            }}
            className="capability-card"
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-4px)';
              e.currentTarget.style.borderColor = 'var(--brand-green)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.borderColor = 'var(--brand-border)';
            }}
          >
            <div>
              <div
                style={{
                  color: 'var(--brand-slate)',
                  fontSize: '0.8rem',
                  fontWeight: 700,
                  letterSpacing: '0.1em',
                  textTransform: 'uppercase',
                  marginBottom: '12px',
                }}
              >
                ROLE: FIELD VOLUNTEER
              </div>
              <h4
                style={{
                  fontSize: '1.35rem',
                  fontWeight: 700,
                  color: 'var(--brand-charcoal)',
                  marginBottom: '14px',
                }}
              >
                Offline Village Survey & Proximity Checks
              </h4>
              <p style={{ fontSize: '0.95rem', color: 'var(--brand-charcoal-muted)' }}>
                Auto-captures GPS coordinates, crops, water sources, and farmers. Pre-cached tiles
                prevent duplicate village entries in dense canopy forests.
              </p>
            </div>
            <div style={{ marginTop: '24px' }}>
              <button
                onClick={onOpenSignIn}
                style={{
                  color: 'var(--brand-green)',
                  fontWeight: 700,
                  fontSize: '0.85rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                }}
              >
                <span>VOLUNTEER VIEW</span>
                <span>→</span>
              </button>
            </div>
          </div>

          {/* Card 2 */}
          <div
            style={{
              backgroundColor: '#ffffff',
              border: '1px solid var(--brand-border)',
              borderRadius: '4px',
              padding: '36px 30px',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              transition: 'transform 0.3s ease, border-color 0.3s ease',
            }}
            className="capability-card"
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-4px)';
              e.currentTarget.style.borderColor = 'var(--brand-green)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.borderColor = 'var(--brand-border)';
            }}
          >
            <div>
              <div
                style={{
                  color: 'var(--brand-orange)',
                  fontSize: '0.8rem',
                  fontWeight: 700,
                  letterSpacing: '0.1em',
                  textTransform: 'uppercase',
                  marginBottom: '12px',
                }}
              >
                ROLE: VILLAGE ENTREPRENEUR (VLE)
              </div>
              <h4
                style={{
                  fontSize: '1.35rem',
                  fontWeight: 700,
                  color: 'var(--brand-charcoal)',
                  marginBottom: '14px',
                }}
              >
                Rental Transactions & Real-time Earnings
              </h4>
              <p style={{ fontSize: '0.95rem', color: 'var(--brand-charcoal-muted)' }}>
                Log farm hours, acres covered, and rental fees per farmer. Auto-calculates running
                weekly earnings and machinery fleet utilization metrics.
              </p>
            </div>
            <div style={{ marginTop: '24px' }}>
              <button
                onClick={onOpenSignIn}
                style={{
                  color: 'var(--brand-orange)',
                  fontWeight: 700,
                  fontSize: '0.85rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                }}
              >
                <span>ENTREPRENEUR VIEW</span>
                <span>→</span>
              </button>
            </div>
          </div>

          {/* Card 3 */}
          <div
            style={{
              backgroundColor: '#ffffff',
              border: '1px solid var(--brand-border)',
              borderRadius: '4px',
              padding: '36px 30px',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              transition: 'transform 0.3s ease, border-color 0.3s ease',
            }}
            className="capability-card"
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-4px)';
              e.currentTarget.style.borderColor = 'var(--brand-green)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.borderColor = 'var(--brand-border)';
            }}
          >
            <div>
              <div
                style={{
                  color: 'var(--brand-green)',
                  fontSize: '0.8rem',
                  fontWeight: 700,
                  letterSpacing: '0.1em',
                  textTransform: 'uppercase',
                  marginBottom: '12px',
                }}
              >
                ROLE: NGO ADMIN & LEADERSHIP
              </div>
              <h4
                style={{
                  fontSize: '1.35rem',
                  fontWeight: 700,
                  color: 'var(--brand-charcoal)',
                  marginBottom: '14px',
                }}
              >
                Readiness Maps & AI-Aggregated Demand
              </h4>
              <p style={{ fontSize: '0.95rem', color: 'var(--brand-charcoal-muted)' }}>
                View regional villages color-coded by readiness stage. OpenAI pipelines summarize
                unmet equipment requests across hundreds of farmers into plain insights.
              </p>
            </div>
            <div style={{ marginTop: '24px' }}>
              <button
                onClick={onOpenSignIn}
                style={{
                  color: 'var(--brand-green)',
                  fontWeight: 700,
                  fontSize: '0.85rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                }}
              >
                <span>ADMIN VIEW</span>
                <span>→</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
