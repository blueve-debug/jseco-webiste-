'use client';

import { Search, ExternalLink } from 'lucide-react';
import ThemeToggle from './ThemeToggle';

interface HeaderProps {
  title: string;
  subtitle?: string;
  breadcrumbs?: { label: string; href?: string }[];
}

export default function Header({ title, subtitle, breadcrumbs }: HeaderProps) {
  return (
    <header className="admin-header">
      <div className="admin-header-title-col">
        {breadcrumbs && breadcrumbs.length > 0 && (
          <div className="header-breadcrumb">
            {breadcrumbs.map((crumb, i) => (
              <span key={i} className="header-breadcrumb-item">
                {i > 0 && <span className="header-breadcrumb-separator">/</span>}
                {crumb.href ? (
                  <a href={crumb.href}>{crumb.label}</a>
                ) : (
                  <span className="header-breadcrumb-current">{crumb.label}</span>
                )}
              </span>
            ))}
          </div>
        )}
        <div style={{ display: 'flex', alignItems: 'baseline', gap: '12px', flexWrap: 'wrap' }}>
          <h1 style={{ fontSize: '18px', fontWeight: 700, color: 'var(--text-primary)', margin: 0 }}>
            {title}
          </h1>
          {subtitle && (
            <span style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>{subtitle}</span>
          )}
        </div>
      </div>

      <div className="header-actions" style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
        <div className="header-search">
          <span className="header-search-icon" style={{ display: 'flex', alignItems: 'center' }}>
            <Search size={16} />
          </span>
          <input
            type="text"
            className="header-search-input"
            placeholder="Search anything..."
            id="global-search"
          />
        </div>

        <a
          href="/"
          target="_blank"
          rel="noopener noreferrer"
          title="Open Public Website in new tab"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px',
            fontSize: '12.5px',
            fontWeight: 600,
            color: 'var(--text-secondary)',
            textDecoration: 'none',
            padding: '0 12px',
            height: '36px',
            borderRadius: 'var(--radius-md)',
            border: '1px solid var(--border-default)',
            background: 'var(--bg-card)',
            transition: 'all var(--transition-fast)',
            whiteSpace: 'nowrap',
          }}
        >
          <span>Website</span>
          <ExternalLink size={13} />
        </a>

        <ThemeToggle variant="header" />
      </div>
    </header>
  );
}
