import { useState } from 'react';

const STORIES = [
  {
    id: 1,
    tag: 'STORIES FROM THE SOIL',
    title: 'AI-Powered Machinery Demand Forecasting for Forest Villages',
    excerpt:
      'In dense canopy zones where cellular reception fails, our offline PWA collects individual farmer requests during sowing and harvesting gaps. Express aggregation pipes feed OpenAI to generate high-clarity demand forecasts for NGO planners.',
    image: '/images/roots_field4.jpg',
    date: 'Ratapani Wildlife Belt',
    author: 'Field Volunteer Intelligence',
  },
  {
    id: 2,
    tag: 'VLE SUCCESS SPOTLIGHT',
    title: 'How Mahesh Became a Certified VLE Operating Multi-Village Rentals',
    excerpt:
      'Once dependent on migrant labor during dry seasons, 26-year-old Mahesh completed foundation machinery training. Today, his assigned power weeder and seed drill serve 4 adjacent hamlets, earning reliable weekly rental fees.',
    image: '/images/roots_field2.jpg',
    date: 'Bhopal Rural District',
    author: 'Entrepreneur Case Study',
  },
  {
    id: 3,
    tag: 'INDIGENOUS CROPPING',
    title: 'Restoring Indigenous Khapli Wheat & Millet Biodiversity',
    excerpt:
      'By pairing indigenous seed varieties with subsidized machinery rental access, smallholder farmers have decreased chemical fertilizer expenses by 42% while improving organic soil matter.',
    image: '/images/roots_field1.jpg',
    date: 'Community Agricultural Center',
    author: 'Sustainable Farming Program',
  },
];

export default function ImpactStoriesSlider({ onOpenSignIn }) {
  const [current, setCurrent] = useState(0);

  const prevStory = () => {
    setCurrent((prev) => (prev - 1 + STORIES.length) % STORIES.length);
  };

  const nextStory = () => {
    setCurrent((prev) => (prev + 1) % STORIES.length);
  };

  const story = STORIES[current];

  return (
    <section
      id="work"
      style={{
        padding: '120px 0',
        backgroundColor: '#ffffff',
        borderBottom: '1px solid var(--brand-border)',
      }}
    >
      <div className="container">
        {/* Header */}
        <div
          style={{
            display: 'flex',
            alignItems: 'flex-end',
            justifyContent: 'space-between',
            marginBottom: '48px',
            flexWrap: 'wrap',
            gap: '20px',
          }}
        >
          <div>
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
                marginBottom: '10px',
              }}
            >
              <span
                style={{
                  width: '24px',
                  height: '2px',
                  backgroundColor: 'var(--brand-orange)',
                }}
              />
              OUR WORK IN MOTION
            </div>
            <h2
              style={{
                fontSize: 'clamp(2rem, 3.5vw, 2.8rem)',
                fontWeight: 800,
                color: 'var(--brand-charcoal)',
                letterSpacing: '-0.025em',
              }}
            >
              Stories from the soil & field operations.
            </h2>
          </div>

          {/* Slider Controls (Igsas swiper-button-prev / next) */}
          <div style={{ display: 'flex', gap: '10px' }}>
            <button
              onClick={prevStory}
              style={{
                width: '48px',
                height: '48px',
                border: '1.5px solid var(--brand-charcoal)',
                backgroundColor: 'transparent',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'var(--brand-charcoal)',
                transition: 'all 0.2s ease',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = 'var(--brand-green)';
                e.currentTarget.style.borderColor = 'var(--brand-green)';
                e.currentTarget.style.color = '#ffffff';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'transparent';
                e.currentTarget.style.borderColor = 'var(--brand-charcoal)';
                e.currentTarget.style.color = 'var(--brand-charcoal)';
              }}
              aria-label="Previous story"
            >
              <svg width="20" height="16" viewBox="0 0 99 88" fill="none">
                <path
                  d="M0 43.5948L4.09955 48.3875L37.3587 87.1899L48.6183 77.6044L25.8104 50.9857L98.4492 50.9857V36.2037L25.8104 36.2037L48.6183 9.58525L37.3587 -6.10352e-05L4.09955 38.8022L0 43.5948Z"
                  fill="currentColor"
                />
              </svg>
            </button>

            <button
              onClick={nextStory}
              style={{
                width: '48px',
                height: '48px',
                border: '1.5px solid var(--brand-charcoal)',
                backgroundColor: 'transparent',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'var(--brand-charcoal)',
                transition: 'all 0.2s ease',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = 'var(--brand-green)';
                e.currentTarget.style.borderColor = 'var(--brand-green)';
                e.currentTarget.style.color = '#ffffff';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'transparent';
                e.currentTarget.style.borderColor = 'var(--brand-charcoal)';
                e.currentTarget.style.color = 'var(--brand-charcoal)';
              }}
              aria-label="Next story"
            >
              <svg width="20" height="16" viewBox="0 0 99 88" fill="none">
                <path
                  d="M98.4492 43.5951L94.3497 38.8023L61.0905 -5.77692e-05L49.8309 9.58548L72.6389 36.2042L-1.20867e-05 36.2042L-1.07944e-05 50.9861L72.6389 50.9861L49.8309 77.6046L61.0906 87.1899L94.3497 48.3877L98.4492 43.5951Z"
                  fill="currentColor"
                />
              </svg>
            </button>
          </div>
        </div>

        {/* Featured Story Split Banner (Igsas content-cards style) */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
            gap: '40px',
            alignItems: 'center',
            backgroundColor: 'var(--brand-surface-card)',
            border: '1px solid var(--brand-border)',
            borderRadius: '4px',
            overflow: 'hidden',
          }}
        >
          {/* Image */}
          <div style={{ position: 'relative', height: '100%', minHeight: '380px' }}>
            <img
              src={story.image}
              alt={story.title}
              style={{
                width: '100%',
                height: '100%',
                objectFit: 'cover',
                display: 'block',
              }}
            />
            <div
              style={{
                position: 'absolute',
                top: '20px',
                left: '20px',
                backgroundColor: 'var(--brand-green)',
                color: '#ffffff',
                padding: '6px 14px',
                fontSize: '0.75rem',
                fontWeight: 700,
                letterSpacing: '0.1em',
                textTransform: 'uppercase',
                borderRadius: '2px',
              }}
            >
              {story.tag}
            </div>
          </div>

          {/* Caption / Text */}
          <div style={{ padding: '40px 48px 40px 20px' }}>
            <div
              style={{
                fontSize: '0.85rem',
                color: 'var(--brand-slate)',
                fontWeight: 600,
                marginBottom: '12px',
              }}
            >
              {story.date} • {story.author}
            </div>

            <h3
              style={{
                fontSize: 'clamp(1.5rem, 2.2vw, 2rem)',
                fontWeight: 700,
                color: 'var(--brand-charcoal)',
                lineHeight: 1.25,
                marginBottom: '18px',
              }}
            >
              {story.title}
            </h3>

            <p
              style={{
                fontSize: '1.05rem',
                color: 'var(--brand-charcoal-muted)',
                lineHeight: 1.7,
                marginBottom: '32px',
              }}
            >
              {story.excerpt}
            </p>

            <button
              onClick={onOpenSignIn}
              className="btn btn-primary"
              style={{
                backgroundColor: 'var(--brand-green)',
              }}
            >
              <span>READ STORY & DATA</span>
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                <path
                  d="M14 7.3466L13.4268 6.61513L8.7769 0.693149L7.20269 2.15609L10.3915 6.21861L0.235849 6.21861L0.235849 8.47461L10.3915 8.47461L7.20269 12.5371L8.7769 14L13.4268 8.07803L14 7.3466Z"
                  fill="currentColor"
                />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
