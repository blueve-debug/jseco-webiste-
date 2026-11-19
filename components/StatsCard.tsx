'use client';

import React from 'react';
import { ArrowUpRight, ArrowDownRight } from 'lucide-react';

interface StatsCardProps {
  icon: React.ReactNode;
  iconClass: string;
  label: string;
  value: string;
  trend?: { value: string; direction: 'up' | 'down' };
}

export default function StatsCard({ icon, iconClass, label, value, trend }: StatsCardProps) {
  return (
    <div className="stat-card animate-in">
      <div className={`stat-icon ${iconClass}`}>{icon}</div>
      <div className="stat-value">{value}</div>
      <div className="stat-label">{label}</div>
      {trend && (
        <div className={`stat-trend ${trend.direction}`} style={{ display: 'inline-flex', alignItems: 'center', gap: '3px' }}>
          {trend.direction === 'up' ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />}
          <span>{trend.value}</span>
        </div>
      )}
    </div>
  );
}
