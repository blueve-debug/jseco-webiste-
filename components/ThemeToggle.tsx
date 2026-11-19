'use client';

import React from 'react';
import { Sun, Moon } from 'lucide-react';
import { useAdminTheme } from './AdminThemeProvider';

interface ThemeToggleProps {
  variant?: 'header' | 'sidebar' | 'compact';
  className?: string;
}

export default function ThemeToggle({ variant = 'header', className = '' }: ThemeToggleProps) {
  const { theme, toggleTheme } = useAdminTheme();
  const isLight = theme === 'light';

  if (variant === 'sidebar') {
    return (
      <button
        type="button"
        onClick={toggleTheme}
        className={`theme-toggle-sidebar ${className}`}
        aria-label={`Switch to ${isLight ? 'Dark' : 'Light'} Mode`}
        title={`Switch to ${isLight ? 'Dark' : 'Light'} Mode`}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
          width: '100%',
          padding: '8px 12px',
          background: 'transparent',
          border: '1px solid var(--border-default)',
          borderRadius: 'var(--radius-md)',
          color: 'var(--text-secondary)',
          cursor: 'pointer',
          fontSize: '13px',
          fontWeight: 500,
          transition: 'all var(--transition-fast)',
        }}
      >
        <span
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: '24px',
            height: '24px',
            borderRadius: '6px',
            background: isLight ? '#f1f5f9' : 'rgba(255, 255, 255, 0.08)',
            color: isLight ? '#6366f1' : '#f59e0b',
          }}
        >
          {isLight ? <Moon size={15} /> : <Sun size={15} />}
        </span>
        <span style={{ flex: 1, textAlign: 'left', color: 'var(--text-primary)', fontWeight: 600 }}>
          {isLight ? 'Dark Mode' : 'White Mode'}
        </span>
        <span
          style={{
            fontSize: '11px',
            textTransform: 'uppercase',
            fontWeight: 700,
            padding: '2px 6px',
            borderRadius: '4px',
            background: isLight ? '#e2e8f0' : 'rgba(255, 255, 255, 0.12)',
            color: 'var(--text-secondary)',
          }}
        >
          Toggle
        </span>
      </button>
    );
  }

  // Header variant (compact icon pill button)
  return (
    <button
      type="button"
      onClick={toggleTheme}
      className={`theme-toggle-header ${className}`}
      aria-label={`Switch to ${isLight ? 'Dark' : 'White'} Mode`}
      title={`Switch to ${isLight ? 'Dark' : 'White'} Mode`}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '7px',
        height: '36px',
        padding: '0 12px',
        background: 'var(--bg-card)',
        border: '1px solid var(--border-default)',
        borderRadius: 'var(--radius-md)',
        color: 'var(--text-primary)',
        cursor: 'pointer',
        fontSize: '12.5px',
        fontWeight: 600,
        transition: 'all var(--transition-fast)',
        userSelect: 'none',
      }}
    >
      <span
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: isLight ? '#6366f1' : '#f59e0b',
        }}
      >
        {isLight ? <Moon size={15} /> : <Sun size={15} />}
      </span>
      <span>{isLight ? 'Dark' : 'White'}</span>
    </button>
  );
}
