'use client';

import React, { useState } from 'react';
import { Search, ExternalLink, X } from 'lucide-react';

export default function RvsfFloatingBadge() {
  const [minimized, setMinimized] = useState(false);

  return (
    <aside
      className="rvsf-floating-badge"
      aria-label="Government Authorized RVSF Verification Badge"
    >
      {minimized ? (
        <button
          type="button"
          onClick={() => setMinimized(false)}
          className="rvsf-minimized-btn"
          title="Open Govt. RVSF Verification Badge"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            background: '#ffffff',
            border: '1.5px solid #16a34a',
            borderRadius: '24px',
            padding: '6px 12px',
            boxShadow: '0 4px 14px rgba(0,0,0,0.15)',
            cursor: 'pointer',
            fontWeight: 700,
            fontSize: '12px',
            color: '#15803d',
          }}
        >
          <span className="rvsf-pulse-dot" />
          <span>RVSF Verified</span>
          <Search size={12} style={{ marginLeft: '2px' }} />
        </button>
      ) : (
        <div style={{ position: 'relative' }}>
          <button
            type="button"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              setMinimized(true);
            }}
            aria-label="Minimize RVSF badge"
            style={{
              position: 'absolute',
              top: '-8px',
              right: '-8px',
              zIndex: 10,
              width: '20px',
              height: '20px',
              borderRadius: '50%',
              background: '#0f172a',
              color: '#ffffff',
              border: '2px solid #ffffff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              boxShadow: '0 2px 6px rgba(0,0,0,0.2)',
            }}
            title="Minimize"
          >
            <X size={11} />
          </button>

          <a
            href="https://vscrap.parivahan.gov.in/vehiclescrap/vahan/welcome.xhtml"
            target="_blank"
            rel="noopener noreferrer"
            className="rvsf-badge-card"
            title="Scan QR with camera or click to open official Parivahan RVSF portal"
          >
            <div className="rvsf-badge-header">
              <div className="rvsf-badge-header-left">
                <span className="rvsf-pulse-dot" />
                <span>Govt. Authorized RVSF</span>
              </div>
              <ExternalLink size={13} className="rvsf-badge-ext-icon" />
            </div>

            <div className="rvsf-badge-body">
              <div className="rvsf-logo-box">
                <img
                  src="/ai-rvsf-logo.png"
                  alt="Registered Vehicle Scrapping Facility Logo"
                  className="rvsf-logo-img"
                />
              </div>

              <div className="rvsf-divider-v" />

              <div className="rvsf-qr-box" title="Scan with Phone Camera">
                <img
                  src="/rvsf-parivahan-qr.svg"
                  alt="Parivahan RVSF Portal QR Code"
                  className="rvsf-qr-img"
                />
                <div className="rvsf-scanline" />
              </div>
            </div>

            <div className="rvsf-badge-footer">
              <span className="rvsf-badge-action">
                <svg
                  width="13"
                  height="13"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M3 7V5a2 2 0 0 1 2-2h2" />
                  <path d="M17 3h2a2 2 0 0 1 2 2v2" />
                  <path d="M21 17v2a2 2 0 0 1-2 2h-2" />
                  <path d="M7 21H5a2 2 0 0 1-2-2v-2" />
                  <circle cx="12" cy="12" r="3" />
                </svg>
                Scan QR or Click to Verify
              </span>
              <span className="rvsf-badge-url">vscrap.parivahan.gov.in</span>
            </div>
          </a>
        </div>
      )}
    </aside>
  );
}

