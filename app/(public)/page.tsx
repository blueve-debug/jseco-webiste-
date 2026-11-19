'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import ValuationModal, { ValuationModalData } from '@/components/ValuationModal';
import CircularEcosystemAnimation from '@/components/CircularEcosystemAnimation';
import {
  Car,
  Bike,
  Truck,
  Recycle,
  Leaf,
  Coins,
  BatteryCharging,
  Factory,
  FileCheck,
  FileText,
  IndianRupee,
  ShieldCheck,
  Award,
  Star,
  Check,
} from 'lucide-react';

const AutoRickshawIcon = ({ size = 20, color = 'currentColor' }: { size?: number; color?: string }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M19 17h2c.6 0 1-.4 1-1v-3c0-.9-.7-1.7-1.5-1.9C18.7 10.6 16 10 16 10l-2-4H7L4 12v5h2" />
    <circle cx="7" cy="17" r="2" />
    <circle cx="17" cy="17" r="2" />
    <path d="M14 6v8" />
    <path d="M4 12h10" />
  </svg>
);

export default function HomePage() {
  const [vehicleType, setVehicleType] = useState('Car');
  const [vehicleNo, setVehicleNo] = useState('');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [pincode, setPincode] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [modalData, setModalData] = useState<ValuationModalData | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState('');

  // Refs for comparison road animations
  const roadOldRef = useRef<SVGPathElement>(null);
  const carOldRef = useRef<SVGGElement>(null);
  const roadNewRef = useRef<SVGPathElement>(null);
  const carNewRef = useRef<SVGGElement>(null);

  // Ref for canvas particle background
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Particle background animation
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let width = (canvas.width = canvas.offsetWidth);
    let height = (canvas.height = canvas.offsetHeight);

    const particles: Array<{
      x: number;
      y: number;
      vx: number;
      vy: number;
      radius: number;
    }> = [];

    // Create particles based on screen size
    const particleCount = Math.min(Math.floor((width * height) / 15000), 60);
    for (let i = 0; i < particleCount; i++) {
      particles.push({
        x: Math.random() * width,
        y: Math.random() * height,
        vx: (Math.random() - 0.5) * 0.4,
        vy: (Math.random() - 0.5) * 0.4,
        radius: Math.random() * 2 + 1,
      });
    }

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = canvas.offsetWidth;
      height = canvas.height = canvas.offsetHeight;
    };
    window.addEventListener('resize', handleResize);

    const animate = () => {
      ctx.clearRect(0, 0, width, height);

      // Draw and update particles
      particles.forEach((p) => {
        p.x += p.vx;
        p.y += p.vy;

        // Boundary collision
        if (p.x < 0 || p.x > width) p.vx *= -1;
        if (p.y < 0 || p.y > height) p.vy *= -1;

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(47, 143, 87, 0.18)';
        ctx.fill();
      });

      // Draw connections
      ctx.strokeStyle = 'rgba(47, 143, 87, 0.08)';
      ctx.lineWidth = 0.8;
      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const dx = particles[i].x - particles[j].x;
          const dy = particles[i].y - particles[j].y;
          const dist = Math.sqrt(dx * dx + dy * dy);

          if (dist < 120) {
            ctx.beginPath();
            ctx.moveTo(particles[i].x, particles[i].y);
            ctx.lineTo(particles[j].x, particles[j].y);
            ctx.stroke();
          }
        }
      }

      animationFrameId = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  // Road car animations
  useEffect(() => {
    const roadOld = roadOldRef.current;
    const carOld = carOldRef.current;
    const roadNew = roadNewRef.current;
    const carNew = carNewRef.current;

    let animOldCleanup: (() => void) | undefined;
    let animNewCleanup: (() => void) | undefined;

    const animateAlongPath = (
      pathEl: SVGPathElement,
      carEl: SVGElement,
      duration = 4500,
      loop = true,
      offset = 0
    ) => {
      const pathLength = pathEl.getTotalLength();
      let start: number | null = null;
      let animationFrameId: number;

      const step = (ts: number) => {
        if (!start) start = ts;
        const elapsed = ts - start + offset;
        let t = Math.min(elapsed / duration, 1);
        const dist = t * pathLength;
        const pt = pathEl.getPointAtLength(dist);
        const ahead = Math.min(dist + 2, pathLength);
        const pt2 = pathEl.getPointAtLength(ahead);
        const angle = (Math.atan2(pt2.y - pt.y, pt2.x - pt.x) * 180) / Math.PI;

        carEl.setAttribute('transform', `translate(${pt.x}, ${pt.y}) rotate(${angle})`);

        if (t < 1) {
          animationFrameId = requestAnimationFrame(step);
        } else if (loop) {
          start = null;
          animationFrameId = requestAnimationFrame(step);
        }
      };

      animationFrameId = requestAnimationFrame(step);
      return () => cancelAnimationFrame(animationFrameId);
    };

    if (roadOld && carOld) {
      carOld.setAttribute('transform', 'translate(60,95)');
      animOldCleanup = animateAlongPath(roadOld, carOld, 4200, true, 0);
    }

    if (roadNew && carNew) {
      carNew.setAttribute('transform', 'translate(60,95)');
      animNewCleanup = animateAlongPath(roadNew, carNew, 2800, true, 600);
    }

    return () => {
      if (animOldCleanup) animOldCleanup();
      if (animNewCleanup) animNewCleanup();
    };
  }, []);

  const handleQuoteSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!phone || phone.replace(/\D/g, '').length < 10) {
      setFormError('Please enter a valid 10-digit mobile number');
      return;
    }
    const cleanEmail = email.trim().toLowerCase();
    if (!cleanEmail || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleanEmail)) {
      setFormError('Please enter a valid email address to receive your estimate');
      return;
    }
    setFormError('');

    const estimates: Record<string, { min: string; max: string; concession: string }> = {
      Car: { min: '₹28,000', max: '₹46,000', concession: 'Up to 25% Motor Vehicle Tax Rebate' },
      'Two-wheeler': { min: '₹4,500', max: '₹8,500', concession: 'Up to 25% Motor Vehicle Tax Rebate' },
      '3-wheeler': { min: '₹14,000', max: '₹24,000', concession: 'Up to 25% Motor Vehicle Tax Rebate' },
      Commercial: { min: '₹85,000', max: '₹1,95,000', concession: 'Up to 15% Commercial Vehicle Tax Rebate' },
    };
    const est = estimates[vehicleType] || estimates.Car;

    let apiVehicleType = 'car';
    if (vehicleType === 'Two-wheeler') apiVehicleType = '2-wheeler';
    else if (vehicleType === '3-wheeler') apiVehicleType = '3-wheeler';
    else if (vehicleType === 'Commercial') apiVehicleType = 'commercial';

    setSubmitting(true);
    let inquiryId = '';
    let reference = '';

    try {
      const res = await fetch('/api/inquiries', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          vehicleType: apiVehicleType,
          regNumber: vehicleNo,
          name: name || 'Valued Vehicle Owner',
          email: cleanEmail,
          phone,
          pincode,
          estimate: {
            min: est.min,
            max: est.max,
            label: `${est.min} – ${est.max}`,
            concession: est.concession,
          },
          source: 'homepage_hero_estimate_form',
        }),
      });

      const resData = await res.json();
      if (res.ok && resData.id) {
        inquiryId = resData.id;
        reference = resData.reference;
      } else {
        setFormError(resData.error || 'Failed to submit estimate. Please check your details.');
        setSubmitting(false);
        return;
      }
    } catch (err) {
      console.error('Failed to submit inquiry:', err);
      setFormError('Network connection issue. Please try again.');
      setSubmitting(false);
      return;
    } finally {
      setSubmitting(false);
    }

    setModalData({
      inquiryId,
      reference,
      vehicleType,
      regNumber: vehicleNo,
      name: name || 'Valued Vehicle Owner',
      email: cleanEmail,
      phone,
      estimate: est,
    });
    setModalOpen(true);
  };

  return (
    <>
      {/* ======= HERO ======= */}
      <section className="hero">
        <canvas ref={canvasRef} className="hero-three-canvas" aria-hidden="true"></canvas>
        <div className="hero-bg-text">JSECO</div>
        <div className="hero-overlay"></div>
        <div className="container hero-grid" style={{ position: 'relative', zIndex: 2 }}>
          <div className="hero-copy hero-copy-left">
            <div className="hero-badge">Registered Vehicle Scrapping Facility (RVSF)</div>
            <h1 className="hero-title hero-title-small">
              Responsible
              <br />
              <span style={{ color: '#16a34a' }}>Vehicle Scrapping</span>
            </h1>
            <p className="hero-sub hero-sub-left">
              JSECO is committed to building a cleaner, greener and more sustainable future through responsible vehicle scrapping, recycling and resource recovery. As an authorized Registered Vehicle Scrapping Facility (RVSF), we help reduce carbon footprint, promote green practices, and support India’s transition towards a circular economy.
            </p>
            <div className="hero-stats hero-stats-row">
              <div className="mini-meta">
                <strong>30,000</strong>
                <span>Vehicles / Year<br />Processing Capacity</span>
              </div>
              <div className="stat-v-divider" aria-hidden="true" />
              <div className="mini-meta">
                <strong className="mini-meta-iso">ISO 9001, ISO 14001, ISO 45001</strong>
                <span>Certified Standards</span>
              </div>
              <div className="stat-v-divider" aria-hidden="true" />
              <div className="mini-meta">
                <strong>1HR</strong>
                <span>Response Time</span>
              </div>
            </div>
          </div>
          {/* ======= ESTIMATE HERO CARD ======= */}
          <div className="estimate-card">
            <div className="estimate-top-badge">Get an estimate</div>
            <div className="estimate-card-body">
              <h3 className="estimate-title">What is your vehicle worth?</h3>
              <form onSubmit={handleQuoteSubmit}>
                {/* Vehicle Type */}
                <label className="estimate-section-label">VEHICLE TYPE</label>
                <div className="estimate-type-grid">
                  {[
                    { label: 'Car', icon: <Car size={22} /> },
                    { label: 'Two-wheeler', icon: <Bike size={22} /> },
                    { label: '3-wheeler', icon: <AutoRickshawIcon size={22} /> },
                    { label: 'Commercial', icon: <Truck size={22} /> },
                  ].map((item) => (
                    <button
                      key={item.label}
                      type="button"
                      className={`estimate-type-card ${vehicleType === item.label ? 'active' : ''}`}
                      onClick={() => setVehicleType(item.label)}
                    >
                      <span className="estimate-type-icon">{item.icon}</span>
                      <span className="estimate-type-text">{item.label}</span>
                    </button>
                  ))}
                </div>

                {/* Registration Number */}
                <label htmlFor="vehicleNo" className="estimate-input-label">
                  Registration number
                </label>
                <div className="estimate-plate-box">
                  <div className="plate-ind-pill">IND</div>
                  <input
                    id="vehicleNo"
                    type="text"
                    className="plate-input-field"
                    placeholder="DL 3C AB 1234"
                    value={vehicleNo}
                    onChange={(e) => setVehicleNo(e.target.value.toUpperCase())}
                    required
                  />
                </div>
                <p className="estimate-sub-help">
                  We use this only to look up vehicle make, model and year on official registers.
                </p>

                {/* 2-Column Row 1: Name + Phone */}
                <div className="estimate-row-2col">
                  <div className="estimate-field-col">
                    <label htmlFor="name" className="estimate-input-label">
                      Name <span className="estimate-label-hi">/ नाम</span>
                    </label>
                    <input
                      id="name"
                      type="text"
                      className="estimate-standard-input"
                      placeholder="Your full name"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      required
                    />
                  </div>
                  <div className="estimate-field-col">
                    <label htmlFor="phone" className="estimate-input-label">
                      Phone <span className="estimate-label-hi">/ फ़ोन</span>
                    </label>
                    <div className="estimate-phone-box">
                      <div className="phone-prefix-pill">+91</div>
                      <input
                        id="phone"
                        type="tel"
                        className="phone-input-field"
                        placeholder="10-digit mobile"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value.replace(/\D/g, '').slice(0, 10))}
                        required
                      />
                    </div>
                  </div>
                </div>

                {/* 2-Column Row 2: Email + Pickup Pincode */}
                <div className="estimate-row-2col">
                  <div className="estimate-field-col">
                    <label htmlFor="email" className="estimate-input-label">
                      Email address <span className="estimate-label-hi">/ ईमेल</span>
                    </label>
                    <input
                      id="email"
                      type="email"
                      className="estimate-standard-input"
                      placeholder="name@email.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                    />
                  </div>
                  <div className="estimate-field-col">
                    <label htmlFor="pincode" className="estimate-input-label">
                      Pickup Pincode <span className="estimate-label-hi">/ पिनकोड</span>
                    </label>
                    <input
                      id="pincode"
                      type="text"
                      className="estimate-standard-input"
                      placeholder="e.g. 110001"
                      value={pincode}
                      onChange={(e) => setPincode(e.target.value)}
                    />
                  </div>
                </div>

                {formError && (
                  <div style={{ color: '#dc2626', fontSize: '13px', marginBottom: '10px', background: '#fee2e2', padding: '8px 12px', borderRadius: '8px' }}>
                    {formError}
                  </div>
                )}

                {/* Submit button */}
                <button
                  type="submit"
                  className="estimate-submit-btn"
                  disabled={submitting}
                >
                  {submitting ? 'Calculating Estimate...' : 'Show my estimate →'}
                </button>

                {/* Disclaimer */}
                <p className="estimate-disclaimer-text">
                  Your contact details are used strictly to share the valuation estimate and arrange free doorstep pickup.
                </p>
              </form>
            </div>
          </div>
        </div>

        <div className="hero-wave">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 120" preserveAspectRatio="none">
            <path
              d="M321.39,56.44c58-10.79,114.16-30.13,172-41.86,82.39-16.72,168.19-17.73,250.45-.39C823.78,31,906.67,72,985.66,92.83c70.05,18.48,146.53,26.09,214.34,3V120H0V95.8C59.71,118.11,140.83,94.17,208.18,70.56Z"
              fill="#ffffff"
            ></path>
          </svg>
        </div>
      </section>

      {/* ======= MARQUEE ======= */}
      <div className="marquee-wrap">
        <div className="marquee-track">
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}><Car size={16} /> ELV Recycling</span>
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}><Recycle size={16} /> Circular Economy</span>
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}><Leaf size={16} /> ESG Compliance</span>
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}><Coins size={16} /> Material Recovery</span>
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}><BatteryCharging size={16} /> Battery Recovery</span>
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}><Factory size={16} /> Industrial Assets</span>
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}><FileCheck size={16} /> Traceable Documentation</span>
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}><Car size={16} /> ELV Recycling</span>
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}><Recycle size={16} /> Circular Economy</span>
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}><Leaf size={16} /> ESG Compliance</span>
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}><Coins size={16} /> Material Recovery</span>
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}><BatteryCharging size={16} /> Battery Recovery</span>
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}><Factory size={16} /> Industrial Assets</span>
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}><FileCheck size={16} /> Traceable Documentation</span>
        </div>
      </div>

      {/* ======= PROCESS ======= */}
      <section className="section process-section">
        <div className="section-title center-title">
          <h2>Simple 4-Step Process</h2>
          <p>We handle everything from pickup to paperwork.</p>
        </div>
        <div className="process-timeline">
          <div className="process-step">
            <div className="step-circle">1</div>
            <div>
              <h3>Request a Scrap Quote</h3>
              <p>
                Contact JSECO with your vehicle details — we’ll provide a transparent, documented quote and explain the next steps.
              </p>
            </div>
          </div>
          <div className="process-step">
            <div className="step-circle">2</div>
            <div>
              <h3>Free Vehicle Pickup</h3>
              <p>We arrange pickup and safe transport to our RVSF facility for processing and material recovery.</p>
            </div>
          </div>
          <div className="process-step">
            <div className="step-circle">3</div>
            <div>
              <h3>Documentation & Scrapping</h3>
              <p>JSECO handles de-registration, regulatory paperwork, and environmentally compliant dismantling.</p>
            </div>
          </div>
          <div className="process-step">
            <div className="step-circle">4</div>
            <div>
              <h3>Payment & Certificates</h3>
              <p>Receive fair payment and formal certificates confirming the responsible disposal of your vehicle.</p>
            </div>
          </div>
        </div>
      </section>

      {/* ======= THEME-RELATED CIRCULAR ECOSYSTEM ANIMATION (SVG CLOSED-LOOP) ======= */}
      <CircularEcosystemAnimation />

      {/* ======= WHY CHOOSE ======= */}
      <section className="section compare-section">
        <div className="section-title center-title">
          <h2>
            Why Choose <span className="accent-text">JSECO</span>
          </h2>
          <p>Understanding the difference between an authorized RVSF and indirect scrapping routes.</p>
        </div>
        <div className="compare-grid">
          <div className="compare-card compare-old">
            <div className="compare-head">
              <h3>The Old Way</h3>
              <span className="compare-badge compare-bad">Not Recommended</span>
            </div>
            <p>Indirect route via third-party agents and unclear handoffs.</p>
            <div className="compare-graphic compare-graphic-old" aria-hidden="true">
              <svg viewBox="0 0 560 190" role="img" aria-label="Indirect route mapping">
                <path
                  ref={roadOldRef}
                  id="roadOld"
                  d="M60 95 C120 95, 135 55, 190 55 S255 95, 310 95 S390 55, 445 55 S500 95, 520 95"
                  fill="none"
                  stroke="#f4a3a3"
                  strokeWidth="14"
                  strokeLinecap="round"
                />
                <path
                  d="M60 95 C120 95, 135 55, 190 55 S255 95, 310 95 S390 55, 445 55 S500 95, 520 95"
                  fill="none"
                  stroke="#ff6b6b"
                  strokeWidth="4"
                  strokeLinecap="round"
                />
                <circle cx="190" cy="55" r="20" fill="#fff1f1" stroke="#ffb1b1" strokeWidth="2" />
                <circle cx="310" cy="95" r="20" fill="#fff1f1" stroke="#ffb1b1" strokeWidth="2" />
                <circle cx="445" cy="55" r="20" fill="#fff1f1" stroke="#ffb1b1" strokeWidth="2" />
                <rect x="150" y="16" width="80" height="40" rx="8" fill="#ffffff" stroke="#f2c2c2" />
                <rect x="270" y="115" width="80" height="40" rx="8" fill="#ffffff" stroke="#f2c2c2" />
                <rect x="400" y="16" width="80" height="40" rx="8" fill="#ffffff" stroke="#f2c2c2" />
                <text x="190" y="32" textAnchor="middle" fontSize="12" fill="#aa5555">
                  Dealer /<tspan x="190" dy="14">Third-party websites</tspan>
                </text>
                <text x="310" y="138" textAnchor="middle" fontSize="12" fill="#aa5555">
                  Agents
                </text>
                <text x="440" y="32" textAnchor="middle" fontSize="12" fill="#aa5555">
                  Unknown<tspan x="440" dy="14">Yard</tspan>
                </text>

                {/* Animated old car */}
                <g ref={carOldRef} id="carOld" style={{ filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.3))' }}>
                  <path
                    d="M -16 2 L -16 -1 C -16 -3 -14 -5 -11 -5 L -5 -5 L -1 -10 C 0 -11 3 -12 6 -12 L 11 -12 C 13 -12 15 -9 17 -5 L 19 -4 C 20 -3 20 -1 20 2 L 16 2 C 16 0 13 0 13 2 L -6 2 C -6 0 -9 0 -9 2 Z"
                    fill="#52525b"
                  />
                  <path d="M -4 -5 L 0 -10 L 5 -10 L 5 -5 Z" fill="#a1a1aa" />
                  <path d="M 6 -5 L 6 -10 L 10 -10 L 14 -5 Z" fill="#cbd5e1" />
                  <rect x="-16" y="-3" width="1.5" height="2.5" rx="0.5" fill="#ef4444" />
                  <rect x="18.5" y="-3" width="1.5" height="2.5" rx="0.5" fill="#fef08a" />
                  <circle cx="-7.5" cy="2.5" r="3.2" fill="#18181b" />
                  <circle cx="-7.5" cy="2.5" r="1.3" fill="#a1a1aa" />
                  <circle cx="14.5" cy="2.5" r="3.2" fill="#18181b" />
                  <circle cx="14.5" cy="2.5" r="1.3" fill="#a1a1aa" />
                </g>
                <text x="250" y="100" textAnchor="middle" fontSize="28" fill="#ff5f5f">
                  !
                </text>
                <text x="370" y="100" textAnchor="middle" fontSize="28" fill="#ff5f5f">
                  !
                </text>
              </svg>
            </div>
            <ul className="compare-list">
              <li>Vehicle moves through multiple hands</li>
              <li>Unclear communication and value cuts</li>
              <li>Slower paperwork and handover</li>
              <li>Less confidence in final outcome</li>
            </ul>
          </div>
          <div className="compare-card compare-new">
            <div className="compare-head">
              <h3>The Smart Way</h3>
              <span className="compare-badge compare-good">Recommended</span>
            </div>
            <p>Direct legal scrapping with one accountable team.</p>
            <div className="compare-graphic compare-graphic-new" aria-hidden="true">
              <svg viewBox="0 0 560 190" role="img" aria-label="Direct route mapping">
                <path
                  ref={roadNewRef}
                  id="roadNew"
                  d="M60 95 L170 95 L230 95 L350 95 L460 95"
                  fill="none"
                  stroke="#9be7a7"
                  strokeWidth="14"
                  strokeLinecap="round"
                />
                <path
                  d="M60 95 L170 95 L230 95 L350 95 L460 95"
                  fill="none"
                  stroke="#48bf63"
                  strokeWidth="4"
                  strokeLinecap="round"
                />
                <circle cx="170" cy="95" r="20" fill="#f0fff3" stroke="#8dd89c" strokeWidth="2" />
                <circle cx="350" cy="95" r="20" fill="#f0fff3" stroke="#8dd89c" strokeWidth="2" />
                <rect x="220" y="48" width="100" height="94" rx="12" fill="#ffffff" stroke="#48bf63" strokeWidth="3" />
                <rect x="410" y="34" width="88" height="120" rx="10" fill="#ffffff" stroke="#48bf63" strokeWidth="3" />
                <text x="270" y="84" textAnchor="middle" fontSize="14" fontWeight="700" fill="#2f8f57">
                  JSECO
                </text>
                <text x="270" y="103" textAnchor="middle" fontSize="12" fill="#4d4d4d">
                  Authorized RVSF
                </text>
                <text x="454" y="70" textAnchor="middle" fontSize="13" fill="#4d4d4d">
                  Certificate
                </text>
                <line x1="432" y1="84" x2="476" y2="84" stroke="#6a6a6a" strokeWidth="2" />
                <line x1="432" y1="98" x2="476" y2="98" stroke="#6a6a6a" strokeWidth="2" />
                <line x1="432" y1="112" x2="476" y2="112" stroke="#6a6a6a" strokeWidth="2" />

                {/* Animated new car */}
                <g ref={carNewRef} id="carNew" style={{ filter: 'drop-shadow(0 2px 6px rgba(22,163,74,0.4))' }}>
                  <path
                    d="M -16 2 L -16 -1 C -16 -3 -14 -5 -11 -5 L -5 -5 L 0 -11 C 1 -12 4 -12 8 -12 L 12 -12 C 14 -12 17 -9 18 -5 L 20 -4 C 21 -3 21 -1 21 2 L 16 2 C 16 0 13 0 13 2 L -6 2 C -6 0 -9 0 -9 2 Z"
                    fill="#16a34a"
                  />
                  <path d="M -4 -5 L 0 -10 L 6 -10 L 6 -5 Z" fill="#dcfce7" />
                  <path d="M 7 -5 L 7 -10 L 11 -10 L 15 -5 Z" fill="#bbf7d0" />
                  <rect x="-16" y="-3" width="1.5" height="2.5" rx="0.5" fill="#ef4444" />
                  <rect x="19.5" y="-3" width="1.5" height="2.5" rx="0.5" fill="#38bdf8" />
                  <circle cx="-7.5" cy="2.5" r="3.2" fill="#0f172a" />
                  <circle cx="-7.5" cy="2.5" r="1.5" fill="#4ade80" />
                  <circle cx="14.5" cy="2.5" r="3.2" fill="#0f172a" />
                  <circle cx="14.5" cy="2.5" r="1.5" fill="#4ade80" />
                </g>
                <g transform="translate(154, 62)">
                  <path d="M -8 0 L -2 6 L 8 -4" stroke="#32b45c" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" fill="none" />
                </g>
                <g transform="translate(372, 62)">
                  <path d="M -8 0 L -2 6 L 8 -4" stroke="#32b45c" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" fill="none" />
                </g>
                <g transform="translate(472, 124)">
                  <path d="M -7 0 L -2 5 L 7 -4" stroke="#32b45c" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" fill="none" />
                </g>
              </svg>
            </div>
            <ul className="compare-list">
              <li>Direct process with one accountable team</li>
              <li>Faster valuation and easy coordination</li>
              <li>Clear documents and settlement</li>
              <li>Responsible and compliant recycling</li>
            </ul>
          </div>
        </div>
      </section>

      {/* ======= BENEFITS ======= */}
      <section className="section benefits-section">
        <div className="section-title center-title">
          <h2>Financial & Legal Benefits</h2>
          <p>Scrapping your vehicle with a proper workflow gives more than just a payout.</p>
        </div>
        <div className="benefits-grid">
          <div className="benefit-card-simple">
            <div className="proof-icon"><IndianRupee size={28} /></div>
            <h3>Monetary Benefit</h3>
            <p>Recover fair value for your old vehicle without hidden intermediary cuts.</p>
          </div>
          <div className="benefit-card-simple">
            <div className="proof-icon"><ShieldCheck size={28} /></div>
            <h3>Legal Protection</h3>
            <p>Close the vehicle lifecycle with documentation that supports proper handover.</p>
          </div>
          <div className="benefit-card-simple">
            <div className="proof-icon"><Leaf size={28} /></div>
            <h3>Environmental Benefit</h3>
            <p>Keep reusable material in circulation and reduce avoidable waste.</p>
          </div>
        </div>
      </section>

      {/* ======= CERTIFICATES ======= */}
      <section className="section certificates-section">
        <div className="section-title center-title">
          <h2>Official Certificates You&apos;ll Receive</h2>
          <p>The paperwork that closes the process cleanly.</p>
        </div>
        <div className="certificates-grid">
          <div className="proof-card">
            <div className="proof-icon"><FileText size={28} /></div>
            <h3>Certificate of Deposit</h3>
            <p>Issued as part of the formal handover and intake process where applicable.</p>
          </div>
          <div className="proof-card">
            <div className="proof-icon"><Award size={28} /></div>
            <h3>Scrapping Closure Record</h3>
            <p>Supports the final closure and helps document the end-of-life vehicle journey.</p>
          </div>
        </div>
      </section>

      
      {/* ======= ALERT BANNER ======= */}
      <section className="alert-banner">
        <div className="alert-copy">
          <span className="alert-tag">Urgent Reminder</span>
          <h2>Retire your vehicle responsibly, recover its true value.</h2>
          <p>
            We help you recycle your vehicle responsibly through our ESG-driven RVSF process, ensuring maximum value recovery with environmentally compliant scrapping.
          </p>
          <Link href="/sell" className="btn-primary">
            Scrap Now
          </Link>
        </div>
        <div className="alert-visual">
          <img
            src="/images/car-scrappage-yard.jpg"
            alt="Vehicle scrapping and recycling facility"
          />
        </div>
      </section>

      {/* ======= FAQ ======= */}
      <section className="section faq-section">
        <div className="section-title center-title">
          <h2>Frequently Asked Questions</h2>
          <p>Everything you need to know before you scrap a vehicle.</p>
        </div>
        <div className="faq-list">
          <details>
            <summary>What documents do I need to scrap my vehicle?</summary>
            <p>Aadhar Card, Pan Card, Cancelled Cheque or Passbook and RC copy.</p>
          </details>
          <details>
            <summary>How much will I get for my old vehicle?</summary>
            <p>The final value depends on vehicle type, weight, condition, and current market rates.</p>
          </details>
          <details>
            <summary>Do you pick up non-running vehicles?</summary>
            <p>Yes. We can arrange pickup for non-running and damaged vehicles depending on location and access.</p>
          </details>
          <details>
            <summary>How long does the scrapping process take?</summary>
            <p>
              The vehicle scrapping process is typically completed within 24 hours or as per the convenient time slot assigned to our team by you, ensuring a smooth and hassle-free experience.
            </p>
          </details>
        </div>
      </section>

      {/* ======= CTA BANNER ======= */}
      <section className="cta-banner">
        <div className="cta-inner cta-split">
          <div className="cta-copy" style={{ textAlign: 'left' }}>
            <h2>Ready to scrap your vehicle legally?</h2>
            <p>Get a fair quote, simple handover, and a cleaner closure in one direct process.</p>
            <div className="cta-actions">
              <Link href="/sell" className="btn-primary">
                Get Free Quote
              </Link>
              <a href="tel:+919310856385" className="btn-outline cta-phone">
                Call: +91 93108 56385
              </a>
            </div>
          </div>
          <div className="cta-info-card">
            <h3>Why Choose Us?</h3>
            <span className="compare-badge compare-good">Government Certified</span>
            <p style={{ color: 'black', fontSize: '13px', margin: '12px 0', textAlign: 'left', lineHeight: '1.5' }}>
              • Fast, transparent, and hassle-free process<br />
              • Vehicle pickup within 24 hours*<br />
              • Best value realization for end-of-life vehicles<br />
              • Complete documentation and compliance support<br />
              • Proper deregistration and documentation assistance.
            </p>
            <div className="cta-stars" style={{ display: 'flex', alignItems: 'center', gap: '3px' }}>
              {[...Array(5)].map((_, i) => (
                <Star key={i} size={15} fill="#eab308" color="#eab308" />
              ))}
              <span style={{ marginLeft: '6px' }}>Trusted by 1000+ customers</span>
            </div>
          </div>
        </div>
      </section>


      <ValuationModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        data={modalData}
      />
    </>
  );
}
