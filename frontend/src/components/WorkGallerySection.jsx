import CircularGallery from './CircularGallery';

const PROJECT_GALLERY_ITEMS = [
  {
    image: '/images/roots_field1.jpg',
    text: 'Khapli Wheat Harvest',
  },
  {
    image: '/images/roots_field2.jpg',
    text: 'VLE Machinery Deployment',
  },
  {
    image: '/images/roots_field3.jpg',
    text: 'Bioresource Processing',
  },
  {
    image: '/images/roots_field4.jpg',
    text: 'Farmer Training Assembly',
  },
  {
    image: '/images/roots_field5.jpg',
    text: 'Indigenous Millet Crops',
  },
  {
    image: '/images/roots_field6.jpg',
    text: 'Women SHG Enterprises',
  },
  {
    image: '/images/roots_field7.jpg',
    text: 'Ratapani Belt Survey',
  },
  {
    image: '/images/roots_auth.jpg',
    text: 'Mechanized Sowing Hub',
  },
  {
    image: '/images/roots_field8.png',
    text: 'Decentralized Farm Logistics',
  },
  {
    image: '/images/roots_field9.png',
    text: 'Community Value Chains',
  },
  {
    image: '/images/roots_field10.png',
    text: 'Farmer Machinery Request Desk',
  },
  {
    image: '/images/roots_field11.png',
    text: 'Soil Health Ecosystems',
  },
];

export default function WorkGallerySection() {
  return (
    <section
      id="album"
      style={{
        width: '100%',
        padding: '80px 0 60px',
        backgroundColor: 'var(--brand-bg)',
        overflow: 'hidden',
      }}
    >
      <div className="container" style={{ textAlign: 'center', marginBottom: '32px' }}>
        <h2
          style={{
            fontSize: 'clamp(2.4rem, 4vw, 3.4rem)',
            fontWeight: 800,
            color: 'var(--brand-charcoal)',
            letterSpacing: '-0.03em',
            margin: 0,
            fontFamily: 'var(--font-heading)',
          }}
        >
          Album
        </h2>
        <div
          style={{
            width: '48px',
            height: '3px',
            backgroundColor: 'var(--brand-green)',
            margin: '12px auto 0',
            borderRadius: '2px',
          }}
        />
      </div>

      <div
        style={{
          width: '100%',
          height: '560px',
          position: 'relative',
        }}
      >
        <CircularGallery
          items={PROJECT_GALLERY_ITEMS}
          bend={3}
          textColor="#1c1c1c"
          borderRadius={0.06}
          scrollSpeed={2}
          scrollEase={0.04}
          font="bold 26px 'DM Sans', sans-serif"
        />
      </div>
    </section>
  );
}
