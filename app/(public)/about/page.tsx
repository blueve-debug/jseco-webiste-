'use client';

import React, { useRef, useEffect } from 'react';
import Link from 'next/link';
import { Target, Eye, ShieldCheck, CheckCircle2, HeartHandshake } from 'lucide-react';

export default function AboutPage() {
  const aboutHeroRef = useRef<HTMLDivElement>(null);
  const sphereRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const aboutHero = aboutHeroRef.current;
    const rotatingSphere = sphereRef.current;

    if (!aboutHero || !rotatingSphere) return;

    const handleMouseMove = (e: MouseEvent) => {
      const rect = aboutHero.getBoundingClientRect();
      const x = (e.clientX - rect.left) / rect.width - 0.5;
      const y = (e.clientY - rect.top) / rect.height - 0.5;
      const rotateX = (-y * 8).toFixed(2);
      const rotateY = (x * 8).toFixed(2);
      rotatingSphere.style.transform = `rotateX(${rotateX}deg) rotateY(${rotateY}deg)`;
    };

    const handleMouseLeave = () => {
      rotatingSphere.style.transform = 'rotateX(0deg) rotateY(0deg)';
    };

    aboutHero.addEventListener('mousemove', handleMouseMove);
    aboutHero.addEventListener('mouseleave', handleMouseLeave);

    return () => {
      aboutHero.removeEventListener('mousemove', handleMouseMove);
      aboutHero.removeEventListener('mouseleave', handleMouseLeave);
    };
  }, []);

  return (
    <>
      {/* ======= ABOUT HERO ======= */}
      <section ref={aboutHeroRef} className="about-hero" style={{ perspective: '1000px' }}>
        <div className="sphere-container">
          <div ref={sphereRef} className="rotating-sphere" id="rotatingSphere">
            <div className="dot-layer"></div>
          </div>
        </div>
        <div className="about-hero-inner">
          <div className="hero-badge hero-badge-soft" style={{ margin: '0 auto 24px' }}>
            About JSECO
          </div>
          <h1>Driving a Sustainable Future Through Responsible Vehicle Recycling</h1>
          <p>
            JSECO is committed to building a cleaner, greener and more sustainable future through responsible vehicle scrapping, recycling and resource recovery.
          </p>
          <div className="about-stats">
            <div className="about-stat">
              <strong>30,000+</strong>
              <span>Vehicles/Year Processing Capacity</span>
            </div>
            <div className="about-stat">
              <strong>98%</strong>
              <span>Materials Reclaimed &amp; Reused</span>
            </div>
            <div className="about-stat">
              <strong>100%</strong>
              <span>Deregistration &amp; Legal Compliance</span>
            </div>
          </div>
        </div>
      </section>

      {/* ======= INTRODUCTION / WHO WE ARE ======= */}
      <section className="section about-intro">
        <div className="about-intro-grid">
          <div className="about-intro-copy">
            <div className="section-label">Who We Are</div>
            <h2 className="section-title" style={{ textAlign: 'left', margin: '12px 0 20px' }}>
              Transforming Discarded Vehicles into Valuable Resources
            </h2>
            <p>
              We believe that every End-of-Life Vehicle (ELV) represents an opportunity to create value, conserve natural resources and reduce environmental impact. Through environmentally responsible vehicle recycling practices, we aim to transform discarded vehicles into valuable resources while supporting India&apos;s transition towards a circular economy.
            </p>
            <p>
              Our approach combines responsible operations, regulatory compliance, efficient resource recovery and a strong commitment to environmental sustainability.
            </p>
            <div className="about-mini-grid">
              <div className="about-mini-card">
                <strong>Government Certified</strong>
                <span>Fully approved Registered Vehicle Scrapping Facility under India&apos;s Vehicle Scrappage Policy.</span>
              </div>
              <div className="about-mini-card">
                <strong>Eco-Friendly Operations</strong>
                <span>Scientific depollution and zero-landfill resource recovery protocols.</span>
              </div>
            </div>
          </div>
          <div className="about-intro-visual">
            <img
              src="/images/industrial-recycling-facility.jpg"
              alt="JSECO Industrial recycling facility"
            />
          </div>
        </div>
      </section>

      {/* ======= MISSION & VISION ======= */}
      <section className="section about-panel-section">
        <div className="section-title center-title">
          <h2>Our Vision &amp; Mission</h2>
          <p>Guided by circular economy and sustainable principles.</p>
        </div>
        <div className="mission-grid about-mission-grid">
          {/* VISION */}
          <div className="mission-card">
            <span className="mission-icon"><Eye size={30} /></span>
            <h3>Our Vision</h3>
            <p style={{ fontSize: '16px', lineHeight: '1.8' }}>
              To become a trusted name in India&apos;s vehicle recycling ecosystem by promoting sustainable mobility, responsible resource utilisation and environmentally conscious industrial practices.
            </p>
          </div>

          {/* MISSION */}
          <div className="mission-card highlight">
            <span className="mission-icon"><Target size={30} /></span>
            <h3>Our Mission</h3>
            <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <li style={{ display: 'flex', alignItems: 'flex-start', gap: '10px', fontSize: '15px', color: '#4f5f57', lineHeight: '1.6' }}>
                <CheckCircle2 size={18} color="#16a34a" style={{ flexShrink: 0, marginTop: '3px' }} />
                <span>Promote scientific and environmentally responsible vehicle scrapping.</span>
              </li>
              <li style={{ display: 'flex', alignItems: 'flex-start', gap: '10px', fontSize: '15px', color: '#4f5f57', lineHeight: '1.6' }}>
                <CheckCircle2 size={18} color="#16a34a" style={{ flexShrink: 0, marginTop: '3px' }} />
                <span>Maximise the recovery and recycling of reusable materials.</span>
              </li>
              <li style={{ display: 'flex', alignItems: 'flex-start', gap: '10px', fontSize: '15px', color: '#4f5f57', lineHeight: '1.6' }}>
                <CheckCircle2 size={18} color="#16a34a" style={{ flexShrink: 0, marginTop: '3px' }} />
                <span>Support India&apos;s circular economy and green growth initiatives.</span>
              </li>
              <li style={{ display: 'flex', alignItems: 'flex-start', gap: '10px', fontSize: '15px', color: '#4f5f57', lineHeight: '1.6' }}>
                <CheckCircle2 size={18} color="#16a34a" style={{ flexShrink: 0, marginTop: '3px' }} />
                <span>Maintain transparency, operational efficiency and regulatory compliance.</span>
              </li>
              <li style={{ display: 'flex', alignItems: 'flex-start', gap: '10px', fontSize: '15px', color: '#4f5f57', lineHeight: '1.6' }}>
                <CheckCircle2 size={18} color="#16a34a" style={{ flexShrink: 0, marginTop: '3px' }} />
                <span>Create long-term value for customers, partners and the environment.</span>
              </li>
            </ul>
          </div>
        </div>
      </section>

      {/* ======= OUR COMMITMENT ======= */}
      <section className="section" style={{ background: '#f7fbf8', padding: '70px 0' }}>
        <div className="container" style={{ maxWidth: '980px', margin: '0 auto', textAlign: 'center' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', background: '#eaf7ed', color: '#15803d', padding: '6px 16px', borderRadius: '50px', fontWeight: 600, fontSize: '14px', marginBottom: '18px' }}>
            <HeartHandshake size={18} />
            <span>Our Commitment</span>
          </div>
          <h2 style={{ fontSize: '32px', fontWeight: 700, color: '#0f291e', marginBottom: '20px' }}>
            Responsibility Beyond Business
          </h2>
          <div style={{ background: '#ffffff', borderRadius: '16px', padding: '40px 36px', border: '1px solid #dceede', boxShadow: '0 4px 20px rgba(0,0,0,0.03)' }}>
            <p style={{ fontSize: '18px', color: '#334155', lineHeight: '1.8', marginBottom: '24px' }}>
              At <strong>JSECO</strong>, sustainability is not just a business objective; it is a responsibility. We strive to ensure that vehicles reaching the end of their useful life are processed responsibly, with a focus on safety, resource conservation and environmental protection.
            </p>
            <div style={{ height: '2px', width: '80px', background: 'linear-gradient(90deg, #16a34a, #22c55e)', margin: '0 auto 24px' }}></div>
            <p style={{ fontSize: '20px', fontWeight: 700, color: '#16a34a', letterSpacing: '0.3px', margin: 0 }}>
              JSECO – Transforming End-of-Life Vehicles into Opportunities for a Greener Tomorrow.
            </p>
          </div>
        </div>
      </section>

      {/* ======= CORE VALUES ======= */}
      <section className="section about-values-section">
        <div className="section-title center-title">
          <h2>Our Core Values</h2>
          <p>The principles that define how we work, dismantle, and build trust.</p>
        </div>
        <div className="values-grid">
          <div className="value-card">
            <h3>Compliance</h3>
            <p>Strict adherence to environmental rules and state policies.</p>
          </div>
          <div className="value-card">
            <h3>Safety</h3>
            <p>Safe processing zones for hazardous fluids, bags, and hybrid batteries.</p>
          </div>
          <div className="value-card">
            <h3>Resource Recovery</h3>
            <p>Max recovery of steel, copper, aluminum, and rubber back to manufacturing.</p>
          </div>
          <div className="value-card">
            <h3>Transparency</h3>
            <p>Verifiable certificates and fair scrap valuations for every owner.</p>
          </div>
          <div className="value-card">
            <h3>Innovation</h3>
            <p>Adopting cutting-edge technology for efficient and clean dismantling.</p>
          </div>
        </div>
      </section>

      {/* ======= CERTIFICATIONS & LICENSES ======= */}
      <section className="section about-cert-section">
        <div className="section-title center-title">
          <h2>Licenses &amp; Standards</h2>
          <p>Official compliance and green standards we maintain at JSECO.</p>
        </div>
        <div className="about-certificate-grid">
          <div className="certificate-card">
            <h3 style={{ fontSize: '18px' }}>RVSF Approval</h3>
            <p>Officially licensed Registered Vehicle Scrapping Facility authorized by the Ministry of Road Transport and Highways (MoRTH).</p>
          </div>
          <div className="certificate-card">
            <h3 style={{ fontSize: '18px' }}>ISO 9001, ISO 14001, ISO 45001</h3>
            <p>International standards for Quality Management, Environmental Management, and Occupational Health &amp; Safety.</p>
          </div>
          <div className="certificate-card">
            <h3 style={{ fontSize: '18px' }}>State PCB Consent</h3>
            <p>Licensed by State Pollution Control Board for processing batteries, tires, fluids, and e-waste responsibly.</p>
          </div>
        </div>
      </section>

      {/* ======= FACILITY SHOWCASE ======= */}
      <section className="section about-facility-section">
        <div className="section-title center-title">
          <h2>Our Infrastructure</h2>
          <p>Scientific dismantling equipment, storage setups, and processing zones.</p>
        </div>
        <div className="about-facility-grid">
          <div className="about-facility-card">
            <img
              src="https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=800&q=80"
              alt="Scientific depollution machinery"
            />
            <h3>Scientific Depollution</h3>
            <p>
              Pre-scrapping starts with safe extraction of oils, fuel, coolant, and brake fluids using vacuum machinery to ensure no toxic liquids touch the ground.
            </p>
          </div>
          <div className="about-facility-card">
            <img
              src="https://images.unsplash.com/photo-1504917595217-d4dc5ebe6122?auto=format&fit=crop&w=800&q=80"
              alt="Steel baling press zone"
            />
            <h3>Heavy Baling &amp; Shear</h3>
            <p>
              Once cleaned, vehicles are dismantled to segregate materials. Steel bodies are processed through heavy baling presses, ready to feed local steel furnaces.
            </p>
          </div>
        </div>
        <div className="about-gallery">
          <img
            src="https://images.unsplash.com/photo-1563770660941-20978e870e26?auto=format&fit=crop&w=600&q=80"
            alt="Materials storage zone"
          />
          <img
            src="https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?auto=format&fit=crop&w=600&q=80"
            alt="Safety check inspection"
          />
          <img
            src="https://images.unsplash.com/photo-1616401784845-180882ba9ba8?auto=format&fit=crop&w=600&q=80"
            alt="Final recycled raw materials"
          />
        </div>
      </section>
    </>
  );
}
