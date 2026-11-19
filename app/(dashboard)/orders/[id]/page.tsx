'use client';

import { useEffect, useState, use } from 'react';
import { useRouter } from 'next/navigation';
import Header from '@/components/Header';
import StatusBadge from '@/components/StatusBadge';
import { LoadingPage } from '@/components/LoadingSpinner';
import { useToast } from '@/components/Toast';
import { Package, User, Phone, CreditCard, ArrowLeft } from 'lucide-react';

interface OrderDetail {
  id: string;
  customerName?: string;
  customerPhone?: string;
  shippingAddress?: { name?: string; address?: string; city?: string; state?: string; zip?: string; phone?: string };
  items?: Array<{ name: string; quantity: number; price: number; imageUrl?: string; sku?: string }>;
  subtotal?: number;
  shipping?: number;
  tax?: number;
  total?: number;
  status?: string;
  paymentMethod?: string;
  trackingNumber?: string;
  statusHistory?: Array<{ status: string; timestamp: string; note?: string }>;
  createdAt?: { _seconds: number };
}

const STATUSES = ['pending', 'processing', 'shipped', 'delivered', 'cancelled'];

export default function OrderDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const { showToast } = useToast();
  const [order, setOrder] = useState<OrderDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [newStatus, setNewStatus] = useState('');
  const [trackingNumber, setTrackingNumber] = useState('');
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    fetch(`/api/orders/${id}`)
      .then(r => r.json())
      .then(data => { if (data.error) { router.push('/orders'); return; } setOrder(data); setNewStatus(data.status || 'pending'); setTrackingNumber(data.trackingNumber || ''); })
      .catch(() => showToast('Failed to load order', 'error'))
      .finally(() => setLoading(false));
  }, [id]);

  const handleUpdateStatus = async () => {
    setUpdating(true);
    try {
      const body: Record<string, string> = { status: newStatus };
      if (trackingNumber) body.trackingNumber = trackingNumber;
      const res = await fetch(`/api/orders/${id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
      if (!res.ok) throw new Error();
      showToast('Order updated!');
      // Refresh
      const updated = await fetch(`/api/orders/${id}`).then(r => r.json());
      setOrder(updated);
    } catch { showToast('Failed to update', 'error'); }
    finally { setUpdating(false); }
  };

  const formatCurrency = (n: number) => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(n);

  if (loading) return <LoadingPage />;
  if (!order) return null;

  return (
    <>
      <Header title={`Order #${id.slice(0, 8)}`} breadcrumbs={[{ label: 'Dashboard', href: '/' }, { label: 'Orders', href: '/orders' }, { label: `#${id.slice(0, 8)}` }]} />
      <div className="page-content">
        <div className="page-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <h1>Order #{id.slice(0, 8)}</h1>
            <StatusBadge status={order.status || 'pending'} />
          </div>
          <div className="page-actions">
            <button className="btn btn-secondary" onClick={() => router.push('/orders')} style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}><ArrowLeft size={15} /> Back to Orders</button>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '24px' }}>
          {/* Left */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            {/* Items */}
            <div className="card">
              <div className="card-title" style={{ marginBottom: '20px' }}>Order Items ({order.items?.length || 0})</div>
              {(order.items || []).map((item, i) => (
                <div key={i} style={{ display: 'flex', gap: '12px', padding: '12px 0', borderBottom: i < (order.items?.length || 0) - 1 ? '1px solid var(--border-default)' : 'none', alignItems: 'center' }}>
                  <div style={{ width: 48, height: 48, borderRadius: '8px', background: 'var(--bg-elevated)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    {item.imageUrl ? <img src={item.imageUrl} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '8px' }} /> : <Package size={20} color="var(--text-tertiary)" />}
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 600 }}>{item.name}</div>
                    {item.sku && <div style={{ fontSize: '12px', color: 'var(--text-tertiary)', fontFamily: 'var(--font-mono)' }}>{item.sku}</div>}
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontWeight: 600 }}>{formatCurrency(item.price)}</div>
                    <div style={{ fontSize: '12px', color: 'var(--text-tertiary)' }}>Qty: {item.quantity}</div>
                  </div>
                </div>
              ))}
              {(!order.items || order.items.length === 0) && <p style={{ color: 'var(--text-tertiary)' }}>No items</p>}
            </div>

            {/* Pricing */}
            <div className="card">
              <div className="card-title" style={{ marginBottom: '16px' }}>Pricing Summary</div>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', color: 'var(--text-secondary)' }}><span>Subtotal</span><span>{formatCurrency(order.subtotal || 0)}</span></div>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', color: 'var(--text-secondary)' }}><span>Shipping</span><span>{formatCurrency(order.shipping || 0)}</span></div>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', color: 'var(--text-secondary)' }}><span>Tax</span><span>{formatCurrency(order.tax || 0)}</span></div>
              <div style={{ borderTop: '1px solid var(--border-default)', marginTop: '8px', paddingTop: '12px', display: 'flex', justifyContent: 'space-between', fontWeight: 700, fontSize: '18px' }}><span>Total</span><span>{formatCurrency(order.total || 0)}</span></div>
            </div>

            {/* Timeline */}
            {order.statusHistory && order.statusHistory.length > 0 && (
              <div className="card">
                <div className="card-title" style={{ marginBottom: '20px' }}>Order Timeline</div>
                <div className="timeline">
                  {order.statusHistory.map((entry, i) => (
                    <div key={i} className="timeline-item">
                      <div className={`timeline-dot ${i === 0 ? 'active' : ''}`} />
                      <div className="timeline-content">
                        <div className="timeline-time">{new Date(entry.timestamp).toLocaleString()}</div>
                        <div className="timeline-text">Status changed to <strong>{entry.status}</strong></div>
                        {entry.note && <div style={{ fontSize: '13px', color: 'var(--text-tertiary)', marginTop: '4px' }}>{entry.note}</div>}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Right */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            {/* Update Status */}
            <div className="card">
              <div className="card-title" style={{ marginBottom: '16px' }}>Update Status</div>
              <div className="form-group">
                <label className="form-label">Status</label>
                <select className="form-select" value={newStatus} onChange={e => setNewStatus(e.target.value)}>
                  {STATUSES.map(s => <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>)}
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Tracking Number</label>
                <input className="form-input" placeholder="Enter tracking number" value={trackingNumber} onChange={e => setTrackingNumber(e.target.value)} />
              </div>
              <button className="btn btn-primary w-full" onClick={handleUpdateStatus} disabled={updating}>{updating ? 'Updating...' : 'Update Order'}</button>
            </div>

            {/* Customer */}
            <div className="card">
              <div className="card-title" style={{ marginBottom: '16px' }}>Customer</div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
                <div className="sidebar-avatar" style={{ width: 40, height: 40, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <User size={20} />
                </div>
                <div>
                  <div style={{ fontWeight: 600 }}>{order.customerName || 'Guest'}</div>
                  <div style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>{order.customerPhone || 'No phone'}</div>
                </div>
              </div>
            </div>

            {/* Shipping Address */}
            {order.shippingAddress && (
              <div className="card">
                <div className="card-title" style={{ marginBottom: '16px' }}>Shipping Address</div>
                <div style={{ fontSize: '14px', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
                  {order.shippingAddress.name && <div style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{order.shippingAddress.name}</div>}
                  <div>{order.shippingAddress.address}</div>
                  <div>{order.shippingAddress.city}, {order.shippingAddress.state} {order.shippingAddress.zip}</div>
                  {order.shippingAddress.phone && (
                    <div style={{ marginTop: '8px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <Phone size={14} />
                      <span>{order.shippingAddress.phone}</span>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Payment */}
            <div className="card">
              <div className="card-title" style={{ marginBottom: '12px' }}>Payment</div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <CreditCard size={18} color="var(--text-secondary)" />
                <span style={{ color: 'var(--text-secondary)' }}>{order.paymentMethod || 'Not specified'}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
