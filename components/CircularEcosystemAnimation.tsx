'use client';

import React, { useState, useEffect } from 'react';
import { 
  Car, 
  Droplets, 
  Cog, 
  Recycle, 
  ShieldCheck, 
  Zap, 
  ArrowRight, 
  Activity, 
  Layers, 
  CheckCircle2 
} from 'lucide-react';

interface Stage {
  id: number;
  title: string;
  tag: string;
  desc: string;
  metric: string;
  metricLabel: string;
  compliance: string;
  highlights: string[];
}

const STAGES: Stage[] = [
  {
    id: 1,
    title: 'Digital Inward & VAHAN De-linking',
    tag: 'Stage 01: Intake & Verification',
    desc: 'The end-of-life vehicle enters our facility under automated biometric inspection. Chassis number is scanned and cross-verified with the national Parivahan VAHAN database to instantly sever all future legal, tax, and insurance liabilities.',
    metric: '100%',
    metricLabel: 'Legal Liability Severed',
    compliance: 'MoRTH Rule 11 Verified',
    highlights: ['Direct Parivahan database de-registration', 'Chassis & engine imprint authentication', 'Instant Certificate of Deposit (COD) generation'],
  },
  {
    id: 2,
    title: 'Closed-Loop Scientific Depollution',
    tag: 'Stage 02: Zero-Discharge Extraction',
    desc: 'Before any structural dismantling begins, sealed vacuum pumps extract all hazardous automotive fluids into dedicated double-walled containers. Batteries, airbag gas generators, and catalytic converters are isolated in sealed safe zones.',
    metric: '0.0%',
    metricLabel: 'Soil or Groundwater Discharge',
    compliance: 'State Pollution Board Certified',
    highlights: ['Pneumatic extraction of oils, fuel, coolant & refrigerant', 'Lithium & Lead-acid battery quarantine', 'Precious metal recovery from exhaust filters'],
  },
  {
    id: 3,
    title: 'Precision Dismantling & Hydraulic Baling',
    tag: 'Stage 03: Mechanical Recovery',
    desc: 'Mechanical shear arms and robotic disassemblers systematically segregate tires, copper harnesses, aluminum alloys, and high-strength plastics. Clean chassis shells are compacted by our 200-ton hydraulic baler into uniform dense cubes.',
    metric: '200 Ton',
    metricLabel: 'High-Density Hydraulic Press',
    compliance: 'ISO 9001 & ISO 14001 Standards',
    highlights: ['Pure ferrous & non-ferrous material sorting', 'Heavy-duty steel baling for domestic electric arc furnaces', 'Re-usable component inspection & cataloging'],
  },
  {
    id: 4,
    title: 'Circular Resource Integration',
    tag: 'Stage 04: Industrial Closed-Loop',
    desc: 'Recovered materials are reintroduced directly into Indian manufacturing. Clean steel feeds green steel mills; recovered copper and aluminum are sent to EV components factories; rubber is processed into crumb rubber for sustainable highways.',
    metric: '98.2%',
    metricLabel: 'Total Material Reclamation Rate',
    compliance: 'National Circular Economy Charter',
    highlights: ['Zero landfill dispatch goal', 'Direct feeder to domestic green steelmakers', 'Massive reduction in virgin ore mining emissions'],
  },
];

export default function CircularEcosystemAnimation() {
  const [activeStage, setActiveStage] = useState(1);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);

  // Auto cycle through stages every 6 seconds unless paused by user interaction
  useEffect(() => {
    if (!isAutoPlaying) return;
    const interval = setInterval(() => {
      setActiveStage((prev) => (prev >= 4 ? 1 : prev + 1));
    }, 6000);
    return () => clearInterval(interval);
  }, [isAutoPlaying]);

  const current = STAGES.find((s) => s.id === activeStage) || STAGES[0];

  return (
    <section className="jseco-ecosystem-section">
      <div className="container">
        {/* Section Header */}
        <div className="ecosystem-header text-center">
          <div className="ecosystem-badge">
            <span className="live-dot" />
            <span>Interactive Industrial Architecture</span>
          </div>
          <h2 className="ecosystem-title">
            The JSECO Closed-Loop <span className="accent-gradient">Recycling Ecosystem</span>
          </h2>
          <p className="ecosystem-subtitle">
            Explore how an End-of-Life Vehicle (ELV) is scientifically processed, de-polluted, and transformed into high-purity industrial raw materials under authorized RVSF protocols.
          </p>
        </div>

        {/* Stage Selector Pills */}
        <div className="stage-selector-bar">
          {STAGES.map((s) => {
            const isActive = s.id === activeStage;
            return (
              <button
                key={s.id}
                type="button"
                className={`stage-pill ${isActive ? 'active' : ''}`}
                onClick={() => {
                  setActiveStage(s.id);
                  setIsAutoPlaying(false);
                }}
              >
                <span className="stage-num">0{s.id}</span>
                <span className="stage-name">{s.title.split('&')[0].trim()}</span>
                {isActive && <span className="active-glow" />}
              </button>
            );
          })}
        </div>

        {/* Visual Engine Container */}
        <div 
          className="ecosystem-canvas-card"
          onMouseEnter={() => setIsAutoPlaying(false)}
          onMouseLeave={() => setIsAutoPlaying(true)}
        >
          {/* Top Real-time Telemetry Bar */}
          <div className="canvas-telemetry-bar">
            <div className="telemetry-item">
              <Activity size={14} className="telemetry-icon pulse" />
              <span>FACILITY STATUS: <strong>ACTIVE PIPELINE</strong></span>
            </div>
            <div className="telemetry-item">
              <ShieldCheck size={14} className="telemetry-icon" />
              <span>COMPLIANCE: <strong>{current.compliance}</strong></span>
            </div>
            <div className="telemetry-item hide-mobile">
              <Zap size={14} className="telemetry-icon" />
              <span>CIRCULAR EFFICIENCY: <strong>98.2% RECOVERY</strong></span>
            </div>
          </div>

          {/* SVG Industrial Process Map */}
          <div className="svg-flow-wrapper">
            <svg
              viewBox="0 0 1000 380"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              className="ecosystem-svg"
            >
              <defs>
                {/* Gradients */}
                <linearGradient id="pipeGlow" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#22c55e" stopOpacity="0.8" />
                  <stop offset="50%" stopColor="#10b981" stopOpacity="1" />
                  <stop offset="100%" stopColor="#059669" stopOpacity="0.8" />
                </linearGradient>

                <linearGradient id="returnLoopGrad" x1="100%" y1="0%" x2="0%" y2="0%">
                  <stop offset="0%" stopColor="#10b981" stopOpacity="0.6" />
                  <stop offset="50%" stopColor="#3b82f6" stopOpacity="0.4" />
                  <stop offset="100%" stopColor="#10b981" stopOpacity="0.6" />
                </linearGradient>

                <radialGradient id="nodeActiveGlow" cx="50%" cy="50%" r="50%">
                  <stop offset="0%" stopColor="#22c55e" stopOpacity="0.35" />
                  <stop offset="70%" stopColor="#22c55e" stopOpacity="0.08" />
                  <stop offset="100%" stopColor="#22c55e" stopOpacity="0" />
                </radialGradient>

                <filter id="dropShadowGlow" x="-20%" y="-20%" width="140%" height="140%">
                  <feDropShadow dx="0" dy="4" stdDeviation="6" floodColor="#16a34a" floodOpacity="0.25" />
                </filter>
              </defs>

              {/* Grid Background Lines (Blueprint feel) */}
              <g className="blueprint-grid" opacity="0.12">
                {[50, 100, 150, 200, 250, 300, 350].map((y) => (
                  <line key={`h-${y}`} x1="40" y1={y} x2="960" y2={y} stroke="#10b981" strokeWidth="1" strokeDasharray="4 6" />
                ))}
                {[120, 240, 360, 480, 600, 720, 840].map((x) => (
                  <line key={`v-${x}`} x1={x} y1="40" x2={x} y2="340" stroke="#10b981" strokeWidth="1" strokeDasharray="4 6" />
                ))}
              </g>

              {/* Main Circular Return Loop (Upper Pipeline) */}
              <path
                d="M 850 180 C 850 70, 700 45, 500 45 C 300 45, 150 70, 150 180"
                stroke="url(#returnLoopGrad)"
                strokeWidth="3"
                strokeDasharray="6 8"
                className="animated-flow-reverse"
                fill="none"
              />
              <g transform="translate(500, 45)">
                <rect x="-110" y="-14" width="220" height="28" rx="14" fill="#0f291e" stroke="#10b981" strokeWidth="1.5" />
                <text x="0" y="4" textAnchor="middle" fill="#86efac" fontSize="11" fontWeight="600" letterSpacing="0.8">
                  ↺ CLOSED-LOOP CIRCULAR MATERIAL RETURN
                </text>
              </g>

              {/* Forward Processing Conduit (Main Spine) */}
              {/* Backing Track */}
              <path
                d="M 150 200 L 380 200 L 620 200 L 850 200"
                stroke="#d1fae5"
                strokeWidth="10"
                strokeLinecap="round"
                fill="none"
              />
              {/* Animated Core Energy Line */}
              <path
                d="M 150 200 L 380 200 L 620 200 L 850 200"
                stroke="url(#pipeGlow)"
                strokeWidth="4"
                strokeLinecap="round"
                strokeDasharray="12 12"
                className="animated-flow-forward"
                fill="none"
              />

              {/* ================= STATION 1: INTAKE ================= */}
              <g 
                className={`station-node ${activeStage === 1 ? 'selected' : ''}`}
                onClick={() => { setActiveStage(1); setIsAutoPlaying(false); }}
                style={{ cursor: 'pointer' }}
              >
                {activeStage === 1 && (
                  <circle cx="150" cy="200" r="68" fill="url(#nodeActiveGlow)" className="radar-pulse" />
                )}
                <circle cx="150" cy="200" r="48" fill="#ffffff" stroke={activeStage === 1 ? '#16a34a' : '#cbd5e1'} strokeWidth="3" filter="url(#dropShadowGlow)" />
                <circle cx="150" cy="200" r="38" fill={activeStage === 1 ? '#f0fdf4' : '#f8fafc'} />
                
                {/* Car Silhouette Icon */}
                <g transform="translate(132, 185) scale(0.9)">
                  <path d="M 4 22 L 4 19 C 4 17 6 15 9 15 L 15 15 L 20 8 C 21 7 24 6 28 6 L 33 6 C 35 6 38 9 39 13 L 42 14 C 43 15 44 17 44 20 L 40 20 C 40 18 37 18 37 20 L 15 20 C 15 18 12 18 12 20 Z" fill={activeStage === 1 ? '#15803d' : '#64748b'} />
                  <circle cx="13" cy="22" r="3.5" fill="#1e293b" />
                  <circle cx="35" cy="22" r="3.5" fill="#1e293b" />
                </g>

                {/* Status Badge */}
                <rect x="95" y="260" width="110" height="26" rx="6" fill="#0f291e" stroke={activeStage === 1 ? '#4ade80' : '#475569'} strokeWidth="1" />
                <text x="150" y="277" textAnchor="middle" fill="#ffffff" fontSize="11" fontWeight="700">
                  01. INTAKE / RC
                </text>
                <text x="150" y="298" textAnchor="middle" fill="#15803d" fontSize="10" fontWeight="600">
                  VAHAN De-linked
                </text>
              </g>

              {/* ================= STATION 2: DEPOLLUTION ================= */}
              <g 
                className={`station-node ${activeStage === 2 ? 'selected' : ''}`}
                onClick={() => { setActiveStage(2); setIsAutoPlaying(false); }}
                style={{ cursor: 'pointer' }}
              >
                {activeStage === 2 && (
                  <circle cx="380" cy="200" r="68" fill="url(#nodeActiveGlow)" className="radar-pulse" />
                )}
                <circle cx="380" cy="200" r="48" fill="#ffffff" stroke={activeStage === 2 ? '#16a34a' : '#cbd5e1'} strokeWidth="3" filter="url(#dropShadowGlow)" />
                <circle cx="380" cy="200" r="38" fill={activeStage === 2 ? '#f0fdf4' : '#f8fafc'} />

                {/* Droplets / Vacuum Flask Icon */}
                <g transform="translate(366, 185) scale(1.15)">
                  <path d="M12 2.69l5.66 5.66a8 8 0 1 1-11.31 0z" fill={activeStage === 2 ? '#0284c7' : '#94a3b8'} opacity="0.3" />
                  <path d="M12 2.69l5.66 5.66a8 8 0 1 1-11.31 0z" stroke={activeStage === 2 ? '#0284c7' : '#64748b'} strokeWidth="1.8" fill="none" />
                  <path d="M12 9v4m0 3h.01" stroke={activeStage === 2 ? '#0284c7' : '#64748b'} strokeWidth="2" strokeLinecap="round" />
                </g>

                {/* Status Badge */}
                <rect x="320" y="260" width="120" height="26" rx="6" fill="#0f291e" stroke={activeStage === 2 ? '#4ade80' : '#475569'} strokeWidth="1" />
                <text x="380" y="277" textAnchor="middle" fill="#ffffff" fontSize="11" fontWeight="700">
                  02. DEPOLLUTION
                </text>
                <text x="380" y="298" textAnchor="middle" fill="#0284c7" fontSize="10" fontWeight="600">
                  Zero Ground Leakage
                </text>
              </g>

              {/* ================= STATION 3: DISMANTLING & BALING ================= */}
              <g 
                className={`station-node ${activeStage === 3 ? 'selected' : ''}`}
                onClick={() => { setActiveStage(3); setIsAutoPlaying(false); }}
                style={{ cursor: 'pointer' }}
              >
                {activeStage === 3 && (
                  <circle cx="620" cy="200" r="68" fill="url(#nodeActiveGlow)" className="radar-pulse" />
                )}
                <circle cx="620" cy="200" r="48" fill="#ffffff" stroke={activeStage === 3 ? '#16a34a' : '#cbd5e1'} strokeWidth="3" filter="url(#dropShadowGlow)" />
                <circle cx="620" cy="200" r="38" fill={activeStage === 3 ? '#f0fdf4' : '#f8fafc'} />

                {/* Industrial Gear / Baler Icon */}
                <g transform="translate(606, 185) scale(1.15)">
                  <path 
                    d="M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z" 
                    fill={activeStage === 3 ? '#16a34a' : '#94a3b8'} 
                  />
                  <path 
                    d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1Z" 
                    stroke={activeStage === 3 ? '#16a34a' : '#64748b'} 
                    strokeWidth="1.6" 
                    fill="none"
                    className={activeStage === 3 ? 'spin-slow' : ''}
                    style={{ transformOrigin: '12px 12px' }}
                  />
                </g>

                {/* Status Badge */}
                <rect x="560" y="260" width="120" height="26" rx="6" fill="#0f291e" stroke={activeStage === 3 ? '#4ade80' : '#475569'} strokeWidth="1" />
                <text x="620" y="277" textAnchor="middle" fill="#ffffff" fontSize="11" fontWeight="700">
                  03. BALING PRESS
                </text>
                <text x="620" y="298" textAnchor="middle" fill="#16a34a" fontSize="10" fontWeight="600">
                  200T Hydraulic Shear
                </text>
              </g>

              {/* ================= STATION 4: RAW MATERIALS ================= */}
              <g 
                className={`station-node ${activeStage === 4 ? 'selected' : ''}`}
                onClick={() => { setActiveStage(4); setIsAutoPlaying(false); }}
                style={{ cursor: 'pointer' }}
              >
                {activeStage === 4 && (
                  <circle cx="850" cy="200" r="68" fill="url(#nodeActiveGlow)" className="radar-pulse" />
                )}
                <circle cx="850" cy="200" r="48" fill="#ffffff" stroke={activeStage === 4 ? '#16a34a' : '#cbd5e1'} strokeWidth="3" filter="url(#dropShadowGlow)" />
                <circle cx="850" cy="200" r="38" fill={activeStage === 4 ? '#f0fdf4' : '#f8fafc'} />

                {/* Circular Eco Cycle Icon */}
                <g transform="translate(836, 185) scale(1.15)">
                  <path d="M7 19H4.815a1.83 1.83 0 0 1-1.57-.881 1.785 1.785 0 0 1-.004-1.784L7.196 9.5" stroke={activeStage === 4 ? '#16a34a' : '#64748b'} strokeWidth="1.8" strokeLinecap="round" />
                  <path d="M11 19h8.2a1.8 1.8 0 0 0 1.56-2.655L17.2 9.5" stroke={activeStage === 4 ? '#16a34a' : '#64748b'} strokeWidth="1.8" strokeLinecap="round" />
                  <path d="m14 16 3 3-3 3" stroke={activeStage === 4 ? '#16a34a' : '#64748b'} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                  <path d="M8.7 3.5a1.8 1.8 0 0 1 3.12 0l3.58 6H8.6z" stroke={activeStage === 4 ? '#16a34a' : '#64748b'} strokeWidth="1.8" strokeLinecap="round" fill={activeStage === 4 ? '#bbf7d0' : 'none'} />
                </g>

                {/* Status Badge */}
                <rect x="795" y="260" width="110" height="26" rx="6" fill="#0f291e" stroke={activeStage === 4 ? '#4ade80' : '#475569'} strokeWidth="1" />
                <text x="850" y="277" textAnchor="middle" fill="#ffffff" fontSize="11" fontWeight="700">
                  04. GREEN OUTPUT
                </text>
                <text x="850" y="298" textAnchor="middle" fill="#16a34a" fontSize="10" fontWeight="600">
                  98.2% Direct Reuse
                </text>
              </g>
            </svg>
          </div>

          {/* Bottom Live Specification Drawer */}
          <div className="stage-spec-drawer">
            <div className="spec-left">
              <span className="spec-tag">{current.tag}</span>
              <h3 className="spec-heading">{current.title}</h3>
              <p className="spec-body">{current.desc}</p>
              
              <div className="spec-bullets">
                {current.highlights.map((h, i) => (
                  <div key={i} className="spec-bullet-item">
                    <CheckCircle2 size={15} className="bullet-icon" />
                    <span>{h}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="spec-metric-card">
              <div className="metric-badge">JSECO CERTIFIED</div>
              <div className="metric-large">{current.metric}</div>
              <div className="metric-label">{current.metricLabel}</div>
              <div className="metric-footer">
                <span className="live-status-pill">
                  <span className="blink-dot" /> Operational Metric
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        .jseco-ecosystem-section {
          padding: 80px 0 60px;
          background: #f9fcf9;
          border-top: 1px solid #e5ede7;
          border-bottom: 1px solid #e5ede7;
          position: relative;
          overflow: hidden;
        }

        .ecosystem-badge {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          background: #eaf7ed;
          border: 1px solid #bbf7d0;
          color: #15803d;
          font-size: 13px;
          font-weight: 600;
          padding: 6px 16px;
          border-radius: 50px;
          margin-bottom: 16px;
        }

        .live-dot {
          width: 8px;
          height: 8px;
          border-radius: 50%;
          background: #22c55e;
          box-shadow: 0 0 8px #22c55e;
          animation: pulse-dot 2s infinite ease-in-out;
        }

        .ecosystem-title {
          font-family: var(--font-body);
          font-size: 34px;
          font-weight: 800;
          color: #0f291e;
          letter-spacing: -0.5px;
          margin-bottom: 14px;
        }

        .accent-gradient {
          background: linear-gradient(135deg, #16a34a, #059669);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
        }

        .ecosystem-subtitle {
          max-width: 680px;
          margin: 0 auto 36px;
          font-size: 15.5px;
          color: #475569;
          line-height: 1.65;
        }

        .stage-selector-bar {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 12px;
          max-width: 960px;
          margin: 0 auto 20px;
        }

        .stage-pill {
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 14px 18px;
          background: #ffffff;
          border: 1px solid #e2e8f0;
          border-radius: 12px;
          cursor: pointer;
          transition: all 0.25s ease;
          position: relative;
          text-align: left;
        }

        .stage-pill:hover {
          border-color: #86efac;
          background: #f0fdf4;
        }

        .stage-pill.active {
          border-color: #16a34a;
          background: #0f291e;
          box-shadow: 0 8px 24px rgba(15, 41, 30, 0.15);
        }

        .stage-num {
          font-family: var(--font-display, sans-serif);
          font-size: 18px;
          font-weight: 700;
          color: #16a34a;
        }

        .stage-pill.active .stage-num {
          color: #4ade80;
        }

        .stage-name {
          font-size: 13.5px;
          font-weight: 600;
          color: #334155;
          line-height: 1.25;
        }

        .stage-pill.active .stage-name {
          color: #ffffff;
        }

        .ecosystem-canvas-card {
          max-width: 1000px;
          margin: 0 auto;
          background: #ffffff;
          border: 1px solid #dceede;
          border-radius: 20px;
          box-shadow: 0 12px 40px rgba(15, 41, 30, 0.06);
          overflow: hidden;
        }

        .canvas-telemetry-bar {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 12px 24px;
          background: #0f291e;
          color: #94a3b8;
          font-size: 12px;
          border-bottom: 1px solid #1e3a2f;
          letter-spacing: 0.5px;
        }

        .telemetry-item {
          display: flex;
          align-items: center;
          gap: 7px;
        }

        .telemetry-item strong {
          color: #4ade80;
          font-weight: 700;
        }

        .pulse {
          color: #22c55e;
          animation: pulse-dot 1.5s infinite ease-in-out;
        }

        .svg-flow-wrapper {
          padding: 24px 20px 10px;
          background: radial-gradient(circle at 50% 50%, #f7fdf9 0%, #ffffff 80%);
        }

        .ecosystem-svg {
          width: 100%;
          height: auto;
          display: block;
        }

        .animated-flow-forward {
          animation: flow-forward 1.2s linear infinite;
        }

        .animated-flow-reverse {
          animation: flow-reverse 2s linear infinite;
        }

        .radar-pulse {
          animation: pulse-radar 2.4s ease-out infinite;
          transform-origin: center;
        }

        .spin-slow {
          animation: spin-gear 12s linear infinite;
        }

        .station-node {
          transition: transform 0.2s ease;
        }

        .station-node:hover {
          transform: translateY(-2px);
        }

        .stage-spec-drawer {
          display: grid;
          grid-template-columns: 1fr 280px;
          gap: 24px;
          padding: 28px 32px;
          background: #fafdfa;
          border-top: 1px solid #eef5ef;
          align-items: center;
        }

        .spec-tag {
          display: inline-block;
          font-size: 12px;
          font-weight: 700;
          text-transform: uppercase;
          color: #16a34a;
          letter-spacing: 0.5px;
          margin-bottom: 6px;
        }

        .spec-heading {
          font-size: 22px;
          font-weight: 800;
          color: #0f291e;
          margin-bottom: 10px;
        }

        .spec-body {
          font-size: 14.5px;
          color: #475569;
          line-height: 1.65;
          margin-bottom: 16px;
        }

        .spec-bullets {
          display: flex;
          flex-direction: column;
          gap: 7px;
        }

        .spec-bullet-item {
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 13.5px;
          color: #1e293b;
          font-weight: 500;
        }

        .bullet-icon {
          color: #16a34a;
          flex-shrink: 0;
        }

        .spec-metric-card {
          background: #ffffff;
          border: 1px solid #dceede;
          border-radius: 16px;
          padding: 24px 20px;
          text-align: center;
          box-shadow: 0 4px 16px rgba(15, 41, 30, 0.04);
        }

        .metric-badge {
          display: inline-block;
          font-size: 11px;
          font-weight: 700;
          color: #64748b;
          letter-spacing: 0.8px;
          margin-bottom: 8px;
        }

        .metric-large {
          font-family: var(--font-display, sans-serif);
          font-size: 38px;
          font-weight: 800;
          color: #16a34a;
          line-height: 1;
          margin-bottom: 6px;
        }

        .metric-label {
          font-size: 12.5px;
          font-weight: 600;
          color: #334155;
          margin-bottom: 12px;
        }

        .live-status-pill {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          background: #f0fdf4;
          color: #15803d;
          border: 1px solid #bbf7d0;
          font-size: 11.5px;
          font-weight: 600;
          padding: 4px 10px;
          border-radius: 20px;
        }

        .blink-dot {
          width: 6px;
          height: 6px;
          border-radius: 50%;
          background: #16a34a;
          animation: pulse-dot 1.5s infinite ease-in-out;
        }

        @keyframes flow-forward {
          from { stroke-dashoffset: 24; }
          to { stroke-dashoffset: 0; }
        }

        @keyframes flow-reverse {
          from { stroke-dashoffset: 0; }
          to { stroke-dashoffset: 28; }
        }

        @keyframes pulse-radar {
          0% { transform: scale(0.9); opacity: 0.8; }
          70% { transform: scale(1.15); opacity: 0.2; }
          100% { transform: scale(0.9); opacity: 0.8; }
        }

        @keyframes spin-gear {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }

        @keyframes pulse-dot {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.4; }
        }

        @media (max-width: 900px) {
          .stage-selector-bar {
            grid-template-columns: repeat(2, 1fr);
          }
          .stage-spec-drawer {
            grid-template-columns: 1fr;
          }
          .hide-mobile {
            display: none;
          }
        }

        @media (max-width: 600px) {
          .stage-selector-bar {
            grid-template-columns: 1fr;
          }
          .ecosystem-title {
            font-size: 26px;
          }
          .canvas-telemetry-bar {
            font-size: 11px;
            padding: 10px 14px;
          }
        }
      `}</style>
    </section>
  );
}
