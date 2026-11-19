'use client';

import { useState } from 'react';

interface ChartDataPoint {
  label: string;
  revenue: number;
  orders: number;
  date: string;
}

interface AnalyticsChartProps {
  data: ChartDataPoint[];
}

export default function AnalyticsChart({ data }: AnalyticsChartProps) {
  const [metric, setMetric] = useState<'revenue' | 'orders'>('revenue');
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  if (!data || data.length === 0) {
    return (
      <div style={{ height: '220px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-secondary)' }}>
        No analytics data available
      </div>
    );
  }

  const values = data.map((d) => (metric === 'revenue' ? d.revenue : d.orders));
  const maxValue = Math.max(...values, 1);

  // SVG dimensions
  const width = 500;
  const height = 180;
  const padding = { top: 20, right: 20, bottom: 30, left: 45 };

  const chartWidth = width - padding.left - padding.right;
  const chartHeight = height - padding.top - padding.bottom;

  // Calculate coordinates
  const points = data.map((d, index) => {
    const val = metric === 'revenue' ? d.revenue : d.orders;
    const x = padding.left + (index / (data.length - 1)) * chartWidth;
    const y = padding.top + chartHeight - (val / maxValue) * chartHeight;
    return { x, y, value: val, label: d.label, orders: d.orders, revenue: d.revenue };
  });

  // Generate SVG path for line chart
  const pathD = points.reduce((acc, p, i) => {
    return i === 0 ? `M ${p.x} ${p.y}` : `${acc} L ${p.x} ${p.y}`;
  }, '');

  // Generate area path for line fill
  const areaD = points.length > 0 
    ? `${pathD} L ${points[points.length - 1].x} ${padding.top + chartHeight} L ${points[0].x} ${padding.top + chartHeight} Z`
    : '';

  // Formatter helpers
  const formatValue = (val: number) => {
    if (metric === 'revenue') {
      return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(val);
    }
    return `${val} order${val !== 1 ? 's' : ''}`;
  };

  return (
    <div className="card" style={{ position: 'relative' }}>
      <div className="card-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
        <div>
          <div className="card-title">Analytics Overview</div>
          <div className="card-subtitle">Last 7 days</div>
        </div>
        <div style={{ display: 'flex', gap: '4px', background: 'var(--bg-input)', padding: '2px', borderRadius: '6px', border: '1px solid var(--border)' }}>
          <button
            onClick={() => setMetric('revenue')}
            style={{
              padding: '4px 10px',
              fontSize: '12px',
              fontWeight: 600,
              borderRadius: '4px',
              border: 0,
              background: metric === 'revenue' ? 'var(--sp-primary)' : 'transparent',
              color: metric === 'revenue' ? '#fff' : 'var(--text-secondary)',
              cursor: 'pointer',
              transition: 'all 0.2s',
            }}
          >
            Revenue
          </button>
          <button
            onClick={() => setMetric('orders')}
            style={{
              padding: '4px 10px',
              fontSize: '12px',
              fontWeight: 600,
              borderRadius: '4px',
              border: 0,
              background: metric === 'orders' ? 'var(--sp-primary)' : 'transparent',
              color: metric === 'orders' ? '#fff' : 'var(--text-secondary)',
              cursor: 'pointer',
              transition: 'all 0.2s',
            }}
          >
            Orders
          </button>
        </div>
      </div>

      <div style={{ position: 'relative', width: '100%', height: `${height}px` }}>
        <svg viewBox={`0 0 ${width} ${height}`} width="100%" height="100%" style={{ overflow: 'visible' }}>
          <defs>
            <linearGradient id="chartGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="var(--sp-primary-light)" stopOpacity="0.25" />
              <stop offset="100%" stopColor="var(--sp-primary-light)" stopOpacity="0.0" />
            </linearGradient>
          </defs>

          {/* Grid lines */}
          {[0, 0.25, 0.5, 0.75, 1].map((ratio, i) => {
            const y = padding.top + ratio * chartHeight;
            const gridVal = maxValue - ratio * maxValue;
            return (
              <g key={i}>
                <line
                  x1={padding.left}
                  y1={y}
                  x2={width - padding.right}
                  y2={y}
                  stroke="var(--border)"
                  strokeWidth="1"
                  strokeDasharray="4 4"
                />
                <text
                  x={padding.left - 8}
                  y={y + 4}
                  fill="var(--text-secondary)"
                  fontSize="10"
                  textAnchor="end"
                  fontFamily="inherit"
                >
                  {metric === 'revenue' ? `₹${Math.round(gridVal)}` : Math.round(gridVal)}
                </text>
              </g>
            );
          })}

          {metric === 'revenue' ? (
            /* Line Chart */
            <>
              {points.length > 1 && (
                <>
                  <path
                    d={areaD}
                    fill="url(#chartGradient)"
                  />
                  <path
                    d={pathD}
                    fill="none"
                    stroke="var(--sp-primary-light)"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    style={{
                      strokeDasharray: 800,
                      strokeDashoffset: 0,
                      animation: 'drawPath 1.2s ease-out forwards',
                    }}
                  />
                </>
              )}

              {/* Data points */}
              {points.map((p, i) => (
                <circle
                  key={i}
                  cx={p.x}
                  cy={p.y}
                  r={hoveredIndex === i ? 5 : 3.5}
                  fill="var(--bg-card)"
                  stroke="var(--sp-primary-light)"
                  strokeWidth="2"
                  style={{ transition: 'all 0.15s' }}
                />
              ))}
            </>
          ) : (
            /* Bar Chart */
            points.map((p, i) => {
              const barWidth = Math.min(24, chartWidth / data.length - 12);
              const barHeight = chartHeight - (p.y - padding.top);
              return (
                <rect
                  key={i}
                  x={p.x - barWidth / 2}
                  y={p.y}
                  width={barWidth}
                  height={Math.max(barHeight, 3)}
                  rx="3"
                  fill={hoveredIndex === i ? 'var(--sp-primary-light)' : 'var(--sp-primary)'}
                  opacity={hoveredIndex === i ? 1 : 0.8}
                  style={{ transition: 'all 0.15s' }}
                />
              );
            })
          )}

          {/* X Axis Labels */}
          {points.map((p, i) => (
            <text
              key={i}
              x={p.x}
              y={height - 10}
              fill={hoveredIndex === i ? 'var(--text-primary)' : 'var(--text-secondary)'}
              fontSize="11"
              fontWeight={hoveredIndex === i ? 600 : 400}
              textAnchor="middle"
              style={{ transition: 'all 0.15s' }}
            >
              {p.label}
            </text>
          ))}

          {/* Hover tracker line */}
          {hoveredIndex !== null && points[hoveredIndex] && (
            <line
              x1={points[hoveredIndex].x}
              y1={padding.top}
              x2={points[hoveredIndex].x}
              y2={padding.top + chartHeight}
              stroke="var(--sp-primary-light)"
              strokeOpacity="0.4"
              strokeWidth="1.5"
              strokeDasharray="2 2"
              style={{ pointerEvents: 'none' }}
            />
          )}

          {/* Interactive mouse capture rects */}
          {points.map((p, i) => {
            const colWidth = chartWidth / data.length;
            return (
              <rect
                key={i}
                x={p.x - colWidth / 2}
                y={padding.top}
                width={colWidth}
                height={chartHeight}
                fill="transparent"
                style={{ cursor: 'pointer' }}
                onMouseEnter={() => setHoveredIndex(i)}
                onMouseLeave={() => setHoveredIndex(null)}
              />
            );
          })}
        </svg>

        {/* Hover Tooltip Overlay */}
        {hoveredIndex !== null && points[hoveredIndex] && (
          <div
            style={{
              position: 'absolute',
              top: `${Math.max(10, points[hoveredIndex].y - 65)}px`,
              left: `${points[hoveredIndex].x - (points[hoveredIndex].x > width / 2 ? 140 : -10)}px`,
              background: 'var(--bg-input)',
              border: '1px solid var(--border)',
              borderRadius: '8px',
              padding: '8px 12px',
              boxShadow: '0 4px 12px rgba(0,0,0,0.35)',
              zIndex: 10,
              pointerEvents: 'none',
              transition: 'top 0.15s ease-out, left 0.15s ease-out',
              minWidth: '120px',
            }}
          >
            <div style={{ fontSize: '10px', color: 'var(--text-secondary)', fontWeight: 600, marginBottom: '2px' }}>
              {data[hoveredIndex].date} ({points[hoveredIndex].label})
            </div>
            <div style={{ fontSize: '14px', fontWeight: 700, color: 'var(--text-primary)' }}>
              {formatValue(points[hoveredIndex].value)}
            </div>
            {metric === 'revenue' && (
              <div style={{ fontSize: '11px', color: 'var(--sp-primary-light)', marginTop: '2px' }}>
                {points[hoveredIndex].orders} order{points[hoveredIndex].orders !== 1 ? 's' : ''}
              </div>
            )}
          </div>
        )}
      </div>

      <style jsx global>{`
        @keyframes drawPath {
          from {
            stroke-dashoffset: 800;
          }
          to {
            stroke-dashoffset: 0;
          }
        }
      `}</style>
    </div>
  );
}
