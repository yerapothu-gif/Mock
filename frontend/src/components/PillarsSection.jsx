
const PILLARS = [
  {
    id: 'indigenous',
    title: 'Indigenous Cropping & Farmer Services',
    description:
      'Promoting climate-resilient crops like Khapli wheat and millets that restore soil health, reduce high chemical expenditures, and deliver stable long-term yields rooted in the land.',
    image: '/images/roots_field3.jpg',
    icon: (
      <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
        <path d="M12 2a10 10 0 0 1 10 10c0 5.523-4.477 10-10 10S2 17.523 2 12A10 10 0 0 1 12 2z" />
        <path d="M12 6v12" />
        <path d="M8 10l4-4 4 4" />
        <path d="M7 15c2 1 3 1 5-1" />
      </svg>
    ),
    link: '#work',
  },
  {
    id: 'vle',
    title: 'Village-Level Entrepreneurship (VLE)',
    description:
      'At the core of our model are local rural youth and women onboarded with foundation-owned machinery fleets. They log rentals, earn running income, and unlock mechanization for neighbors.',
    image: '/images/roots_field4.jpg',
    icon: (
      <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
        <rect x="2" y="7" width="20" height="14" rx="2" />
        <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" />
      </svg>
    ),
    link: '#work',
  },
  {
    id: 'value-chain',
    title: 'Decentralized Value Chains & Processing',
    description:
      'Connecting village enterprises directly to collection points, bioresource hubs, and verified urban buyers so maximum economic value remains with the farmers who cultivate it.',
    image: '/images/roots_field5.jpg',
    icon: (
      <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
        <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
        <polyline points="3.27 6.96 12 12.01 20.73 6.96" />
        <line x1="12" y1="22.08" x2="12" y2="12" />
      </svg>
    ),
    link: '#work',
  },
];

export default function PillarsSection({ onOpenSignIn }) {
  return (
    <section
      id="about"
      style={{
        padding: '120px 0 100px',
        backgroundColor: 'var(--brand-bg)',
      }}
    >
      <div className="container">
        {/* Section Header */}
        <div style={{ maxWidth: '820px', marginBottom: '64px' }}>
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              color: 'var(--brand-green)',
              fontWeight: 700,
              fontSize: '0.85rem',
              letterSpacing: '0.1em',
              textTransform: 'uppercase',
              fontFamily: 'var(--font-heading)',
              marginBottom: '14px',
            }}
          >
            <span
              style={{
                width: '24px',
                height: '2px',
                backgroundColor: 'var(--brand-orange)',
              }}
            />
            THE PILLARS OF CHANGE
          </div>

          <h2
            style={{
              fontSize: 'clamp(2rem, 3.8vw, 3.2rem)',
              fontWeight: 800,
              lineHeight: 1.15,
              color: 'var(--brand-charcoal)',
              letterSpacing: '-0.025em',
              marginBottom: '20px',
            }}
          >
            Strengthening rural communities through sustainable livelihoods & enterprise.
          </h2>

          <p
            style={{
              fontSize: '1.15rem',
              color: 'var(--brand-charcoal-muted)',
              lineHeight: 1.7,
            }}
          >
            Reaching Roots aims to create deep societal impact through evidence-based,
            community-driven interventions at the intersection of agriculture, entrepreneurship,
            and climate change.
          </p>
        </div>

        {/* 2-Column Cards Grid (Igsas card-items row style) */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))',
            gap: '32px',
          }}
        >
          {PILLARS.map((pillar) => (
            <div
              key={pillar.id}
              style={{
                position: 'relative',
                borderRadius: '4px',
                overflow: 'hidden',
                minHeight: '440px',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'flex-end',
                padding: '36px',
                backgroundColor: 'var(--brand-charcoal)',
                transition: 'transform 0.4s cubic-bezier(0.16, 1, 0.3, 1), box-shadow 0.4s ease',
                cursor: 'pointer',
              }}
              className="pillar-card"
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-6px)';
                e.currentTarget.style.boxShadow = '0 20px 40px rgba(4, 114, 77, 0.22)';
                const img = e.currentTarget.querySelector('.card-bg-img');
                if (img) img.style.transform = 'scale(1.08)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = 'none';
                const img = e.currentTarget.querySelector('.card-bg-img');
                if (img) img.style.transform = 'scale(1)';
              }}
              onClick={onOpenSignIn}
            >
              {/* Background Image with Zoom */}
              <img
                src={pillar.image}
                alt={pillar.title}
                className="card-bg-img"
                style={{
                  position: 'absolute',
                  inset: 0,
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover',
                  transition: 'transform 0.7s cubic-bezier(0.16, 1, 0.3, 1)',
                  zIndex: 1,
                }}
              />

              {/* Deep Emerald / Charcoal Gradient Overlay */}
              <div
                style={{
                  position: 'absolute',
                  inset: 0,
                  background:
                    'linear-gradient(180deg, rgba(4, 35, 23, 0.25) 0%, rgba(4, 45, 30, 0.82) 45%, rgba(18, 25, 21, 0.96) 100%)',
                  zIndex: 2,
                }}
              />

              {/* Card Content */}
              <div style={{ position: 'relative', zIndex: 3 }}>
                {/* Icon & Category Badge */}
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    marginBottom: '20px',
                  }}
                >
                  <div
                    style={{
                      width: '60px',
                      height: '60px',
                      borderRadius: '4px',
                      backgroundColor: 'rgba(255, 255, 255, 0.12)',
                      backdropFilter: 'blur(8px)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: '#ffffff',
                      border: '1px solid rgba(255, 255, 255, 0.2)',
                    }}
                  >
                    {pillar.icon}
                  </div>

                  <span
                    style={{
                      color: 'var(--brand-orange)',
                      fontFamily: 'var(--font-heading)',
                      fontSize: '0.8rem',
                      fontWeight: 700,
                      letterSpacing: '0.08em',
                      textTransform: 'uppercase',
                    }}
                  >
                    FOUNDATION PILLAR
                  </span>
                </div>

                <h3
                  style={{
                    color: '#ffffff',
                    fontSize: '1.65rem',
                    fontWeight: 700,
                    marginBottom: '14px',
                    lineHeight: 1.25,
                  }}
                >
                  {pillar.title}
                </h3>

                <p
                  style={{
                    color: 'rgba(255, 255, 255, 0.84)',
                    fontSize: '0.98rem',
                    lineHeight: 1.6,
                    marginBottom: '28px',
                  }}
                >
                  {pillar.description}
                </p>

                {/* Explore button with arrow (like igsas <div class="button primary"> İNCELE ) */}
                <div
                  className="btn btn-primary"
                  style={{
                    padding: '12px 24px',
                    fontSize: '0.8rem',
                    backgroundColor: 'var(--brand-green)',
                    display: 'inline-flex',
                  }}
                >
                  <span>EXPLORE MODEL</span>
                  <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                    <path
                      d="M14 7.3466L13.4268 6.61513L8.7769 0.693149L7.20269 2.15609L10.3915 6.21861L0.235849 6.21861L0.235849 8.47461L10.3915 8.47461L7.20269 12.5371L8.7769 14L13.4268 8.07803L14 7.3466Z"
                      fill="currentColor"
                    />
                  </svg>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
