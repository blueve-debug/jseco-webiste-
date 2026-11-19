import React from 'react';
import { Inbox } from 'lucide-react';

export function LoadingSpinner({ size = 'md' }: { size?: 'sm' | 'md' | 'lg' }) {
  return <div className={`loading-spinner ${size === 'lg' ? 'lg' : ''}`} />;
}

export function LoadingPage() {
  return (
    <div className="loading-page">
      <LoadingSpinner size="lg" />
    </div>
  );
}

export function EmptyState({
  icon,
  title = 'No data found',
  text = 'There are no items to display.',
  action,
}: {
  icon?: React.ReactNode;
  title?: string;
  text?: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="empty-state">
      <div className="empty-state-icon" style={{ display: 'flex', justifyContent: 'center' }}>
        {icon || <Inbox size={36} color="var(--text-tertiary)" />}
      </div>
      <div className="empty-state-title">{title}</div>
      <div className="empty-state-text">{text}</div>
      {action}
    </div>
  );
}
