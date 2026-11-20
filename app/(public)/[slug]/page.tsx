import React from 'react';
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { SEO_PAGES } from '@/lib/seo-data';
import AboutPage from '../about/page';
import {
  Phone,
  MessageCircle,
  MapPin,
  Car,
  Award,
  Zap,
  Star,
  Check,
  FileText,
  Truck,
  IndianRupee,
  Leaf,
  Tag,
  ShieldCheck,
  ShieldAlert,
  FlaskConical,
  BatteryCharging,
  Factory,
  Laptop,
  Landmark,
  TrendingUp,
  Handshake,
  Trees,
  TrendingDown,
  Briefcase,
  Snowflake,
  Recycle,
  Droplet,
  Building2,
  Lock,
  Smartphone,
  RefreshCw,
  Ticket,
  Camera,
  Search,
  Wrench,
  Disc,
} from 'lucide-react';

function renderSeoIcon(iconKey: string, size = 28) {
  switch (iconKey) {
    case 'file-text':
      return <FileText size={size} />;
    case 'truck':
      return <Truck size={size} />;
    case 'rupee':
      return <IndianRupee size={size} />;
    case 'leaf':
      return <Leaf size={size} />;
    case 'tag':
      return <Tag size={size} />;
    case 'shield-alert':
      return <ShieldAlert size={size} />;
    case 'shield-check':
      return <ShieldCheck size={size} />;
    case 'flask':
      return <FlaskConical size={size} />;
    case 'battery':
      return <BatteryCharging size={size} />;
    case 'factory':
      return <Factory size={size} />;
    case 'laptop':
      return <Laptop size={size} />;
    case 'building':
      return <Building2 size={size} />;
    case 'trending-up':
      return <TrendingUp size={size} />;
    case 'car':
      return <Car size={size} />;
    case 'handshake':
      return <Handshake size={size} />;
    case 'map-pin':
      return <MapPin size={size} />;
    case 'trees':
      return <Trees size={size} />;
    case 'trending-down':
      return <TrendingDown size={size} />;
    case 'briefcase':
      return <Briefcase size={size} />;
    case 'snowflake':
      return <Snowflake size={size} />;
    case 'recycle':
      return <Recycle size={size} />;
    case 'droplet':
      return <Droplet size={size} />;
    case 'lock':
      return <Lock size={size} />;
    case 'smartphone':
      return <Smartphone size={size} />;
    case 'refresh':
      return <RefreshCw size={size} />;
    case 'ticket':
      return <Ticket size={size} />;
    case 'landmark':
      return <Landmark size={size} />;
    case 'camera':
      return <Camera size={size} />;
    case 'search':
      return <Search size={size} />;
    case 'wrench':
      return <Wrench size={size} />;
    case 'zap':
      return <Zap size={size} />;
    case 'disc':
      return <Disc size={size} />;
    default:
      return <ShieldCheck size={size} />;
  }
}

export const dynamicParams = false;

interface PageProps {
  params: Promise<{ slug: string }>;
}

export function generateStaticParams() {
  return Object.keys(SEO_PAGES).map((slug) => ({
    slug,
  }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  if (slug === 'about') {
    return {
      title: 'About Us | JSECO - Registered Vehicle Scrapping Facility',
      description: 'Learn about JSECO, India’s premier government-certified Registered Vehicle Scrapping Facility (RVSF).',
    };
  }

  const page = SEO_PAGES[slug];

  if (!page) {
    return {
      title: 'Page Not Found | JSECO',
      description: 'The requested page could not be found.',
    };
  }

  return {
    title: page.metaTitle,
    description: page.metaDescription,
    keywords: page.keywords,
    alternates: {
      canonical: page.canonicalUrl,
    },
    openGraph: {
      title: page.metaTitle,
      description: page.metaDescription,
      url: page.canonicalUrl,
      siteName: 'JSECO',
      locale: 'en_IN',
      type: 'website',
      images: [
        {
          url: '/logo.jpeg',
          width: 800,
          height: 600,
          alt: page.metaTitle || 'JSECO RVSF',
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title: page.metaTitle,
      description: page.metaDescription,
      images: ['/logo.jpeg'],
    },
  };
}

export default async function SeoLandingPage({ params }: PageProps) {
  const { slug } = await params;

  if (slug === 'about') {
    return <AboutPage />;
  }

  const page = SEO_PAGES[slug];

  if (!page) {
    notFound();
  }

  // Schema.org structured data (LocalBusiness & FAQPage)
  const jsonLd = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'LocalBusiness',
        '@id': 'https://goodecosolutions.in/#organization',
        name: 'JSECO',
        alternateName: 'JSECO RVSF Baghpat',
        url: page.canonicalUrl,
        logo: 'https://goodecosolutions.in/logo.jpeg',
        image: 'https://goodecosolutions.in/logo.jpeg',
        description: page.metaDescription,
        telephone: '+919310856385',
        email: 'care@jseco.in',
        priceRange: '₹₹',
        address: {
          '@type': 'PostalAddress',
          streetAddress: 'Baghpat',
          addressLocality: 'Baghpat',
          addressRegion: 'Uttar Pradesh',
          postalCode: '201003',
          addressCountry: 'IN',
        },
        geo: {
          '@type': 'GeoCoordinates',
          latitude: '28.7238',
          longitude: '77.4589',
        },
        openingHoursSpecification: {
          '@type': 'OpeningHoursSpecification',
          dayOfWeek: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
          opens: '08:00',
          closes: '19:00',
        },
      },
      {
        '@type': 'FAQPage',
        mainEntity: page.faqs.map((faq) => ({
          '@type': 'Question',
          name: faq.q,
          acceptedAnswer: {
            '@type': 'Answer',
            text: faq.a,
          },
        })),
      },
    ],
  };

  return (
    <>
      {/* Inject Structured Data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      {/* ======= LANDING HERO ======= */}
      <section className="landing-hero" style={{
        background: 'linear-gradient(180deg, #f0fdf4 0%, #ffffff 100%)',
        padding: '120px 0 60px',
        borderBottom: '1px solid #e2ece5'
      }}>
        <div className="container">
          <div style={{ maxWidth: '880px', margin: '0 auto', textAlign: 'center' }}>
            <span className="hero-badge hero-badge-soft" style={{ display: 'inline-block', marginBottom: '18px' }}>
              {page.badge}
            </span>
            <h1 style={{
              fontSize: 'clamp(32px, 5vw, 56px)',
              fontWeight: 800,
              lineHeight: 1.15,
              color: '#0f291e',
              marginBottom: '20px',
              fontFamily: 'var(--font-serif)'
            }}>
              {page.h1} <span style={{ color: '#16a34a' }}>{page.h1Highlight}</span>
            </h1>
            <p style={{
              fontSize: '18px',
              color: '#475569',
              lineHeight: 1.7,
              marginBottom: '32px'
            }}>
              {page.heroSub}
            </p>

            {/* Quick Action Buttons */}
            <div style={{
              display: 'flex',
              gap: '16px',
              justifyContent: 'center',
              flexWrap: 'wrap',
              marginBottom: '40px'
            }}>
              <Link href="/sell" className="btn-primary" style={{ padding: '14px 32px', fontSize: '16px' }}>
                Get Scrap Valuation
              </Link>
              <a
                href="tel:+919310856385"
                className="btn-outline"
                style={{ padding: '14px 28px', fontSize: '16px', display: 'inline-flex', alignItems: 'center', gap: '8px' }}
              >
                <Phone size={16} /> Call: +91 93108 56385
              </a>
              <a
                href={`https://wa.me/919310856385?text=Hi%2C%20I%20want%20information%20about%20${encodeURIComponent(page.h1)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-whatsapp"
                style={{ padding: '14px 28px', fontSize: '16px', display: 'inline-flex', alignItems: 'center', gap: '8px' }}
              >
                <MessageCircle size={16} /> WhatsApp Chat
              </a>
            </div>

            {/* Key Stats Bar */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
              gap: '20px',
              background: '#ffffff',
              padding: '24px',
              borderRadius: '16px',
              border: '1px solid #e2ece5',
              boxShadow: '0 8px 24px rgba(15, 41, 30, 0.05)',
              textAlign: 'center'
            }}>
              {page.stats.map((st, i) => (
                <div key={i}>
                  <strong style={{
                    display: 'block',
                    fontSize: '28px',
                    fontFamily: 'var(--font-display)',
                    color: '#16a34a',
                    lineHeight: 1.1
                  }}>
                    {st.value}
                  </strong>
                  <span style={{ fontSize: '12px', color: '#64748b', textTransform: 'uppercase', letterSpacing: '1px' }}>
                    {st.label}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ======= HIGHLIGHTS & KEY POINTS ======= */}
      <section className="section" style={{ padding: '70px 0', background: '#ffffff' }}>
        <div className="container">
          <div style={{ maxWidth: '900px', margin: '0 auto' }}>
            <h2 style={{
              fontSize: '32px',
              fontWeight: 700,
              color: '#0f291e',
              marginBottom: '24px',
              fontFamily: 'var(--font-serif)',
              textAlign: 'center'
            }}>
              {page.section1Title}
            </h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginBottom: '40px' }}>
              {page.section1Content.map((paragraph, idx) => (
                <p key={idx} style={{ fontSize: '16px', color: '#334155', lineHeight: '1.8' }}>
                  {paragraph}
                </p>
              ))}
            </div>

            {/* Key Bullet Points */}
            <div style={{
              background: '#f8faf8',
              borderRadius: '16px',
              padding: '28px 32px',
              border: '1px solid #e2ece5'
            }}>
              <h3 style={{ fontSize: '18px', fontWeight: 700, color: '#0f291e', marginBottom: '16px' }}>
                Key Highlights:
              </h3>
              <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {page.keyPoints.map((point, index) => (
                  <li key={index} style={{ display: 'flex', alignItems: 'flex-start', gap: '12px', fontSize: '15px', color: '#1e293b' }}>
                    <Check size={18} color="#16a34a" style={{ flexShrink: 0, marginTop: '2px' }} />
                    <span>{point}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* ======= CORE FEATURES GRID ======= */}
      <section className="section" style={{ padding: '70px 0', background: '#f8faf8' }}>
        <div className="container">
          <div className="section-title center-title">
            <h2>{page.featuresTitle}</h2>
            <p>Built for complete compliance, maximum financial recovery, and environmental safety.</p>
          </div>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
            gap: '24px',
            marginTop: '36px'
          }}>
            {page.features.map((feat, i) => (
              <div
                key={i}
                style={{
                  background: '#ffffff',
                  padding: '28px 24px',
                  borderRadius: '16px',
                  border: '1px solid #e2ece5',
                  boxShadow: '0 4px 12px rgba(0,0,0,0.03)'
                }}
              >
                <div style={{ marginBottom: '14px', color: '#16a34a' }}>{renderSeoIcon(feat.icon, 30)}</div>
                <h3 style={{ fontSize: '18px', fontWeight: 700, color: '#0f291e', marginBottom: '8px' }}>
                  {feat.title}
                </h3>
                <p style={{ fontSize: '14px', color: '#475569', lineHeight: 1.6 }}>
                  {feat.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ======= 4-STEP PROCESS ======= */}
      <section className="section process-section">
        <div className="container">
          <div className="section-title center-title">
            <h2>{page.processTitle}</h2>
            <p>From initial contact to VAHAN portal de-registration, we handle everything.</p>
          </div>
          <div className="process-timeline" style={{ marginTop: '36px' }}>
            {page.processSteps.map((step, idx) => (
              <div key={idx} className="process-step">
                <div className="step-circle">{step.step}</div>
                <div>
                  <h3>{step.title}</h3>
                  <p>{step.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ======= BENEFITS SECTION ======= */}
      <section className="section benefits-section" style={{ background: '#f0fdf4' }}>
        <div className="container">
          <div className="section-title center-title">
            <h2>{page.benefitsTitle}</h2>
            <p>Guaranteed advantages when scrapping through an authorized facility.</p>
          </div>
          <div className="benefits-grid" style={{ marginTop: '36px' }}>
            {page.benefits.map((b, idx) => (
              <div key={idx} className="benefit-card-simple">
                <div className="proof-icon" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#16a34a' }}>
                  {renderSeoIcon(b.icon, 28)}
                </div>
                <h3>{b.title}</h3>
                <p>{b.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ======= LOCALITY COVERAGE (IF APPLICABLE) ======= */}
      {page.coverageAreas && page.coverageAreas.length > 0 && (
        <section className="section" style={{ padding: '60px 0', background: '#ffffff' }}>
          <div className="container">
            <div className="section-title center-title">
              <h2>Doorstep Vehicle Pickup Localities</h2>
              <p>Free recovery and towing service across all major sectors and nearby regions.</p>
            </div>
            <div style={{
              display: 'flex',
              flexWrap: 'wrap',
              gap: '12px',
              justifyContent: 'center',
              maxWidth: '900px',
              margin: '28px auto 0'
            }}>
              {page.coverageAreas.map((loc, idx) => (
                <span
                  key={idx}
                  style={{
                    background: '#f0fdf4',
                    border: '1px solid #bbf7d0',
                    color: '#15803d',
                    padding: '8px 18px',
                    borderRadius: '24px',
                    fontSize: '14px',
                    fontWeight: 600,
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '6px'
                  }}
                >
                  <MapPin size={13} /> {loc}
                </span>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ======= FAQS ACCORDION ======= */}
      <section className="section faq-section">
        <div className="container">
          <div className="section-title center-title">
            <h2>Frequently Asked Questions</h2>
            <p>Everything you need to know about our services, paperwork, and compliance.</p>
          </div>
          <div className="faq-list" style={{ maxWidth: '800px', margin: '36px auto 0' }}>
            {page.faqs.map((faq, i) => (
              <details key={i} open={i === 0}>
                <summary>{faq.q}</summary>
                <p>{faq.a}</p>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* ======= CTA BANNER ======= */}
      <section className="cta-banner">
        <div className="container">
          <div className="cta-inner cta-split">
            <div className="cta-copy" style={{ textAlign: 'left' }}>
              <h2>Ready to scrap your vehicle legally?</h2>
              <p>
                Get fair value, doorstep pickup, and official Parivahan Certificate of Deposit from JSECO RVSF.
              </p>
              <div className="cta-actions">
                <Link href="/sell" className="btn-primary">
                  Get Free Scrap Quote
                </Link>
                <a href="tel:+919310856385" className="btn-outline cta-phone">
                  Call: +91 93108 56385
                </a>
              </div>
            </div>
            <div className="cta-info-card">
              <h3>JSECO</h3>
              <span className="compare-badge compare-good">MoRTH Authorized RVSF</span>
              <div style={{ color: '#1e293b', fontSize: '13px', margin: '14px 0', textAlign: 'left', lineHeight: '1.8', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                  <MapPin size={14} color="#16a34a" /> Baghpat, Uttar Pradesh
                </span>
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                  <Car size={14} color="#16a34a" /> Annual Processing Capacity: 30,000 Vehicles
                </span>
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                  <Award size={14} color="#16a34a" /> ISO 9001, ISO 14001, ISO 45001 Certified
                </span>
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                  <Zap size={14} color="#16a34a" /> Complete VAHAN De-registration &amp; COD Support
                </span>
              </div>
              <div className="cta-stars" style={{ display: 'flex', alignItems: 'center', gap: '3px' }}>
                {[...Array(5)].map((_, i) => (
                  <Star key={i} size={15} fill="#eab308" color="#eab308" />
                ))}
                <span style={{ marginLeft: '6px' }}>Trusted by 1000+ Vehicle Owners</span>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
