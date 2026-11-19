import { Timestamp } from 'firebase-admin/firestore';

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
  }).format(amount);
}

export function formatDate(date: Date | Timestamp | string | number): string {
  let d: Date;
  if (date instanceof Timestamp) {
    d = date.toDate();
  } else if (typeof date === 'string' || typeof date === 'number') {
    d = new Date(date);
  } else {
    d = date;
  }
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(d);
}

export function formatDateShort(date: Date | Timestamp | string | number): string {
  let d: Date;
  if (date instanceof Timestamp) {
    d = date.toDate();
  } else if (typeof date === 'string' || typeof date === 'number') {
    d = new Date(date);
  } else {
    d = date;
  }
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
  }).format(d);
}

export function generateSKU(category: string, index?: number): string {
  const prefixMap: Record<string, string> = {
    engines: 'ENG',
    tires: 'TIR',
    lights: 'LGT',
    interior: 'INT',
    gearbox: 'GBX',
    transmission: 'TRN',
    brakes: 'BRK',
    body: 'BDY',
    electrical: 'ELC',
    exhaust: 'EXH',
  };

  const prefix = prefixMap[category.toLowerCase()] || category.substring(0, 3).toUpperCase();
  const random = Math.random().toString(36).substring(2, 6).toUpperCase();
  const suffix = index ? String(index).padStart(3, '0') : random;

  return `${prefix}-${suffix}`;
}

export function slugify(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

export function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength).trim() + '...';
}

export function getStatusColor(status: string): string {
  const colors: Record<string, string> = {
    pending: 'pending',
    processing: 'processing',
    shipped: 'shipped',
    delivered: 'delivered',
    cancelled: 'cancelled',
  };
  return colors[status.toLowerCase()] || 'pending';
}

export function getGradeColor(grade: string): string {
  const colors: Record<string, string> = {
    a: 'grade-a',
    b: 'grade-b',
    c: 'grade-c',
  };
  return colors[grade.toLowerCase()] || 'grade-b';
}

export interface PaginationParams {
  page: number;
  limit: number;
}

export function parsePagination(searchParams: URLSearchParams): PaginationParams {
  const page = Math.max(1, parseInt(searchParams.get('page') || '1'));
  const limit = Math.min(100, Math.max(1, parseInt(searchParams.get('limit') || '20')));
  return { page, limit };
}

export function paginationMeta(total: number, page: number, limit: number) {
  return {
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit),
    hasNext: page * limit < total,
    hasPrev: page > 1,
  };
}
