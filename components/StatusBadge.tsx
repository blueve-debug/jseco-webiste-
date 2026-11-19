'use client';

import React from 'react';
import { Clock, Loader2, Truck, CheckCircle2, XCircle } from 'lucide-react';

interface StatusBadgeProps {
  status: string;
  type?: 'order' | 'grade' | 'custom';
}

export default function StatusBadge({ status, type = 'order' }: StatusBadgeProps) {
  let className = 'badge ';

  if (type === 'order') {
    const statusMap: Record<string, { class: string; label: string; icon: React.ReactNode }> = {
      pending: { class: 'badge-pending', label: 'Pending', icon: <Clock size={12} /> },
      processing: { class: 'badge-processing', label: 'Processing', icon: <Loader2 size={12} className="animate-spin" /> },
      shipped: { class: 'badge-shipped', label: 'Shipped', icon: <Truck size={12} /> },
      delivered: { class: 'badge-delivered', label: 'Delivered', icon: <CheckCircle2 size={12} /> },
      cancelled: { class: 'badge-cancelled', label: 'Cancelled', icon: <XCircle size={12} /> },
    };
    const mapped = statusMap[status.toLowerCase()];
    if (mapped) {
      className += mapped.class;
      return (
        <span className={className} style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
          {mapped.icon}
          <span>{mapped.label}</span>
        </span>
      );
    } else {
      className += 'badge-pending';
      return <span className={className}>{status}</span>;
    }
  } else if (type === 'grade') {
    const gradeMap: Record<string, string> = {
      a: 'badge-grade-a',
      b: 'badge-grade-b',
      c: 'badge-grade-c',
    };
    className += gradeMap[status.toLowerCase()] || 'badge-grade-b';
    return <span className={className}>Grade {status.toUpperCase()}</span>;
  } else {
    className += 'badge-primary';
    return <span className={className}>{status}</span>;
  }
}
