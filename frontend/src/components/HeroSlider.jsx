import { useState, useEffect } from 'react';

const SLIDES = [
  {
    tag: 'REACHING ROOTS FOUNDATION',
    title: 'Rooted in Purpose, Growing Together.',
    description:
      'Creating decentralized village enterprise ecosystems, sustainable rural livelihoods, and climate-positive agriculture across rural Bharat.',
    badge: '10,000 VLEs & 10 Lakh Farmers Target',
    bgImage: '/images/roots_field1.jpg',
    ctaText: 'EXPLORE OUR MODEL',
    ctaLink: '#about',
  },
  {
    tag: 'VILLAGE LEVEL ENTREPRENEURS (VLE)',
    title: 'Dignified Livelihoods in Every Village.',
    description:
      'Putting custom farm machinery in the hands of trained rural entrepreneurs — generating stable daily earnings while powering smallholder crop productivity.',
    badge: 'Machinery Rental Economy',
    bgImage: '/images/roots_auth.jpg',
    ctaText: 'VIEW FIELD WORK',
    ctaLink: '#work',
  },
  {
    tag: 'OFFLINE-FIRST FIELD INTELLIGENCE',
    title: 'Bridging the Forest Divide with Tech.',
    description:
      'From Ratapani sanctuary to remote hamlets: capturing village boundaries, needs assessments, and farmer machinery requests without needing mobile data.',
    badge: '100% Offline PWA & Map Sync',
    bgImage: '/images/roots_field2.jpg',
    ctaText: 'ENTER PLATFORM',
    ctaAction: true,
  },
];

export default function HeroSlider({ onOpenSignIn }) {
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % SLIDES.length);
    }, 7000);
    return () => clearInterval(timer);
  }, []);

  const handlePrev = () => {
    setCurrentIndex((prev) => (prev - 1 + SLIDES.length) % SLIDES.length);
  };

  const handleNext = () => {
    setCurrentIndex((prev) => (prev + 1) % SLIDES.length);
  };

  const currentSlide = SLIDES[currentIndex];

  return (
    <section
      style={{
        position: 'relative',
        height: '92vh',
        minHeight: '680px',
        maxHeight: '940px',
        width: '100%',
        overflow: 'hidden',
        backgroundColor: 'var(--brand-charcoal)',
      }}
    >
      {/* Background Slides with Zoom & Fade transition */}
      {SLIDES.map((slide, index) => {
        const isActive = index === currentIndex;
        return (
          <div
            key={index}
            style={{
              position: 'absolute',
              inset: 0,
              opacity: isActive ? 1 : 0,
              transform: isActive ? 'scale(1)' : 'scale(1.06)',
              transition: 'opacity 1s ease-in-out, transform 8s cubic-bezier(0.25, 1, 0.5, 1)',
              pointerEvents: isActive ? 'auto' : 'none',
              zIndex: 1,
            }}
          >
            {/* Dark agricultural gradient overlay */}
            <div
              style={{
                position: 'absolute',
                inset: 0,
                background:
                  'linear-gradient(180deg, rgba(4, 35, 23, 0.72) 0%, rgba(28, 28, 28, 0.82) 100%), linear-gradient(90deg, rgba(4, 114, 77, 0.4) 0%, transparent 60%)',
                zIndex: 2,
              }}
            />
            <img
              src={slide.bgImage}
              alt={slide.title}
              style={{
                width: '100%',
                height: '100%',
                objectFit: 'cover',
                objectPosition: 'center',
              }}
            />
          </div>
        );
      })}

      {/* Hero Content Container */}
      <div
        className="container"
        style={{
          position: 'relative',
          zIndex: 10,
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          paddingTop: '60px',
        }}
      >
        <div style={{ maxWidth: '840px' }}>
          {/* Pre-title Tag */}
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '10px',
              padding: '6px 14px',
              backgroundColor: 'rgba(255, 255, 255, 0.12)',
              backdropFilter: 'blur(8px)',
              borderRadius: '2px',
              borderLeft: '3px solid var(--brand-orange)',
              marginBottom: '20px',
            }}
          >
            <span
              style={{
                color: '#ffffff',
                fontSize: '0.78rem',
                fontWeight: 700,
                letterSpacing: '0.12em',
                textTransform: 'uppercase',
                fontFamily: 'var(--font-heading)',
              }}
            >
              {currentSlide.tag}
            </span>
          </div>

          {/* Huge Main Headline (igsas typography style) */}
          <h1
            style={{
              color: '#ffffff',
              fontSize: 'clamp(2.5rem, 5.5vw, 4.8rem)',
              fontWeight: 800,
              lineHeight: 1.08,
              letterSpacing: '-0.03em',
              marginBottom: '24px',
              textShadow: '0 2px 20px rgba(0,0,0,0.3)',
            }}
          >
            {currentSlide.title}
          </h1>

          {/* Subtitle Description */}
          <p
            style={{
              color: 'rgba(255, 255, 255, 0.88)',
              fontSize: 'clamp(1.05rem, 1.4vw, 1.3rem)',
              lineHeight: 1.6,
              maxWidth: '680px',
              marginBottom: '36px',
            }}
          >
            {currentSlide.description}
          </p>

          {/* Action CTAs */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '18px',
              flexWrap: 'wrap',
            }}
          >
            {currentSlide.ctaAction ? (
              <button
                onClick={onOpenSignIn}
                className="btn btn-primary"
                style={{
                  padding: '16px 36px',
                  fontSize: '0.9rem',
                }}
              >
                <span>{currentSlide.ctaText}</span>
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                  <path
                    d="M14 7.3466L13.4268 6.61513L8.7769 0.693149L7.20269 2.15609L10.3915 6.21861L0.235849 6.21861L0.235849 8.47461L10.3915 8.47461L7.20269 12.5371L8.7769 14L13.4268 8.07803L14 7.3466Z"
                    fill="currentColor"
                  />
                </svg>
              </button>
            ) : (
              <a
                href={currentSlide.ctaLink}
                className="btn btn-primary"
                style={{
                  padding: '16px 36px',
                  fontSize: '0.9rem',
                }}
              >
                <span>{currentSlide.ctaText}</span>
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                  <path
                    d="M14 7.3466L13.4268 6.61513L8.7769 0.693149L7.20269 2.15609L10.3915 6.21861L0.235849 6.21861L0.235849 8.47461L10.3915 8.47461L7.20269 12.5371L8.7769 14L13.4268 8.07803L14 7.3466Z"
                    fill="currentColor"
                  />
                </svg>
              </a>
            )}

            <button
              onClick={onOpenSignIn}
              className="btn btn-outline-light"
              style={{
                padding: '16px 28px',
                fontSize: '0.9rem',
              }}
            >
              <span>ACCESS PORTAL</span>
            </button>
          </div>
        </div>
      </div>

      {/* Bottom Navigation Controls & Pulsing Arrow Indicator (like Igsas start-slider) */}
      <div
        className="container"
        style={{
          position: 'absolute',
          bottom: '36px',
          left: '50%',
          transform: 'translateX(-50%)',
          zIndex: 20,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        {/* Angular Geometric Prev/Next Buttons (Igsas signature styling) */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          <button
            onClick={handlePrev}
            style={{
              width: '52px',
              height: '46px',
              backgroundColor: 'rgba(255, 255, 255, 0.12)',
              border: '1px solid rgba(255, 255, 255, 0.25)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#ffffff',
              transition: 'all 0.2s ease',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = 'var(--brand-green)';
              e.currentTarget.style.borderColor = 'var(--brand-green)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.12)';
              e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.25)';
            }}
            aria-label="Previous Slide"
          >
            <svg width="22" height="18" viewBox="0 0 99 88" fill="none">
              <path
                d="M0 43.5948L4.09955 48.3875L37.3587 87.1899L48.6183 77.6044L25.8104 50.9857L98.4492 50.9857V36.2037L25.8104 36.2037L48.6183 9.58525L37.3587 -6.10352e-05L4.09955 38.8022L0 43.5948Z"
                fill="currentColor"
              />
            </svg>
          </button>

          <button
            onClick={handleNext}
            style={{
              width: '52px',
              height: '46px',
              backgroundColor: 'rgba(255, 255, 255, 0.12)',
              border: '1px solid rgba(255, 255, 255, 0.25)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#ffffff',
              transition: 'all 0.2s ease',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = 'var(--brand-green)';
              e.currentTarget.style.borderColor = 'var(--brand-green)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.12)';
              e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.25)';
            }}
            aria-label="Next Slide"
          >
            <svg width="22" height="18" viewBox="0 0 99 88" fill="none">
              <path
                d="M98.4492 43.5951L94.3497 38.8023L61.0905 -5.77692e-05L49.8309 9.58548L72.6389 36.2042L-1.20867e-05 36.2042L-1.07944e-05 50.9861L72.6389 50.9861L49.8309 77.6046L61.0906 87.1899L94.3497 48.3877L98.4492 43.5951Z"
                fill="currentColor"
              />
            </svg>
          </button>

          {/* Slide dots */}
          <div style={{ display: 'flex', gap: '8px', marginLeft: '12px' }}>
            {SLIDES.map((_, idx) => (
              <button
                key={idx}
                onClick={() => setCurrentIndex(idx)}
                style={{
                  width: idx === currentIndex ? '28px' : '8px',
                  height: '4px',
                  borderRadius: '2px',
                  backgroundColor:
                    idx === currentIndex ? 'var(--brand-orange)' : 'rgba(255,255,255,0.35)',
                  transition: 'all 0.3s ease',
                  border: 'none',
                  padding: 0,
                }}
                aria-label={`Go to slide ${idx + 1}`}
              />
            ))}
          </div>
        </div>

        {/* Pulsing Down Arrow Indicator (direct igsas aesthetic: <i class="arrow-down">) */}
        <a
          href="#about"
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '8px',
            color: '#ffffff',
            textDecoration: 'none',
            transition: 'color 0.2s ease',
          }}
          className="scroll-hint"
        >
          <span
            style={{
              fontSize: '0.72rem',
              fontWeight: 700,
              letterSpacing: '0.15em',
              textTransform: 'uppercase',
              color: 'rgba(255, 255, 255, 0.7)',
            }}
          >
            SCROLL DOWN
          </span>
          <div
            style={{
              animation: 'pulseArrow 2s infinite ease-in-out',
            }}
          >
            <svg width="22" height="38" viewBox="0 0 36 62" fill="none">
              <path
                d="M18.6895 61.7505L35.6896 45.7504C36.0938 45.3631 36.0967 44.7012 35.7366 44.3283C35.3707 43.9493 34.699 43.9215 34.3145 44.2813L19.0019 58.6877L19.0019 0.999999C19.0019 0.447699 18.5542 -7.6258e-07 18.0019 -7.86722e-07C17.4496 -8.10864e-07 17.0019 0.447699 17.0019 0.999999L17.0019 58.6877L1.6894 44.2813C1.3049 43.9212 0.627279 43.9434 0.267279 44.3283C-0.0927214 44.7129 -0.101624 45.3318 0.314276 45.7504L17.3143 61.7505C17.7823 62.1308 18.3559 62.0308 18.6895 61.7505Z"
                fill="var(--brand-orange)"
              />
            </svg>
          </div>
        </a>
      </div>
    </section>
  );
}
