'use client';

import { useEffect, useState } from 'react';
import Header from '@/components/Header';
import StatsCard from '@/components/StatsCard';
import StatusBadge from '@/components/StatusBadge';
import { LoadingPage } from '@/components/LoadingSpinner';
import AnalyticsChart from '@/components/AnalyticsChart';
import { Coins, Package, Users, Tag, Plus, ClipboardList, Palette, FolderTree, Mail } from 'lucide-react';

interface InquirySummary {
  id: string;
  reference?: string;
  vehicleType: string;
  regNumber?: string;
  name?: string;
  email?: string;
  phone: string;
  status: string;
  estimate?: { min?: number | string; max?: number | string };
  createdAt?: string;
}

interface DashboardData {
  stats: {
    totalRevenue: number;
    totalOrders: number;
    totalCustomers: number;
    totalProducts: number;
  };
  recentOrders: Array<{
    id: string;
    customerName?: string;
    customerPhone?: string;
    total?: number;
    status?: string;
    createdAt?: { _seconds: number };
    items?: Array<{ name: string }>;
  }>;
  revenueByDay: Array<{
    label: string;
    revenue: number;
    orders: number;
    date: string;
  }>;
}

export default function DashboardPage() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [recentInquiries, setRecentInquiries] = useState<InquirySummary[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      fetch('/api/dashboard').then((res) => res.json()).catch(() => null),
      fetch('/api/inquiries?page=1&limit=5').then((res) => res.json()).catch(() => null),
    ])
      .then(([dashData, inqData]) => {
        if (dashData) setData(dashData);
        if (inqData?.inquiries) setRecentInquiries(inqData.inquiries);
      })
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <LoadingPage />;

  const stats = data?.stats || { totalRevenue: 0, totalOrders: 0, totalCustomers: 0, totalProducts: 0 };
  const recentOrders = data?.recentOrders || [];
  const revenueByDay = data?.revenueByDay || [];
  const maxRevenue = Math.max(...revenueByDay.map(d => d.revenue), 1);

  const formatCurrency = (n: number) => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', minimumFractionDigits: 0 }).format(n);

  return (
    <>
      <Header
        title="Dashboard"
        subtitle="Welcome back, Admin"
        breadcrumbs={[{ label: 'Dashboard' }]}
      />

      <div className="page-content">
        {/* Stats Grid */}
        <div className="stats-grid">
          <StatsCard
            icon={<Coins size={22} />}
            iconClass="revenue"
            label="Total Revenue"
            value={formatCurrency(stats.totalRevenue)}
            trend={{ value: '12.5%', direction: 'up' }}
          />
          <StatsCard
            icon={<Package size={22} />}
            iconClass="orders"
            label="Total Orders"
            value={stats.totalOrders.toLocaleString()}
            trend={{ value: '8.2%', direction: 'up' }}
          />
          <StatsCard
            icon={<Users size={22} />}
            iconClass="customers"
            label="Customers"
            value={stats.totalCustomers.toLocaleString()}
            trend={{ value: '4.1%', direction: 'up' }}
          />
          <StatsCard
            icon={<Tag size={22} />}
            iconClass="products"
            label="Products"
            value={stats.totalProducts.toLocaleString()}
          />
        </div>

        {/* Main Grid: Chart + Recent Orders */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
          {/* Interactive Analytics Chart */}
          <AnalyticsChart data={revenueByDay} />

          {/* Recent Orders */}
          <div className="card" style={{ padding: 0 }}>
            <div className="card-header" style={{ padding: '20px 24px 16px' }}>
              <div>
                <div className="card-title">Recent Orders</div>
                <div className="card-subtitle">{recentOrders.length} latest orders</div>
              </div>
              <a href="/orders" className="btn btn-sm btn-secondary">View All</a>
            </div>

            {recentOrders.length === 0 ? (
              <div style={{ padding: '40px', textAlign: 'center', color: 'var(--text-tertiary)' }}>
                No orders yet
              </div>
            ) : (
              <div style={{ overflowX: 'auto' }}>
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Order</th>
                      <th>Customer</th>
                      <th>Total</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {recentOrders.slice(0, 6).map((order) => (
                      <tr key={order.id}>
                        <td>
                          <a href={`/orders/${order.id}`} style={{ fontWeight: 600, fontFamily: 'var(--font-mono)', fontSize: '12px' }}>
                            #{order.id.slice(0, 8)}
                          </a>
                        </td>
                        <td style={{ color: 'var(--text-secondary)', fontSize: '13px' }}>
                          {order.customerName || order.customerPhone || 'Guest'}
                        </td>
                        <td style={{ fontWeight: 600 }}>
                          {order.total ? formatCurrency(order.total) : '₹0'}
                        </td>
                        <td>
                          <StatusBadge status={order.status || 'pending'} />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>

        {/* Recent Inquiry Form Submissions */}
        <div style={{ marginTop: '24px' }}>
          <div className="card" style={{ padding: 0 }}>
            <div className="card-header" style={{ padding: '20px 24px 16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <div className="card-title">Recent Inquiry Form Submissions</div>
                <div className="card-subtitle">Website vehicle scrap estimates &amp; towing requests</div>
              </div>
              <a href="/inquiries" className="btn btn-sm btn-primary" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                <Mail size={14} /> View All Inquiries
              </a>
            </div>

            {recentInquiries.length === 0 ? (
              <div style={{ padding: '36px', textAlign: 'center', color: 'var(--text-tertiary)' }}>
                No inquiries submitted yet
              </div>
            ) : (
              <div style={{ overflowX: 'auto' }}>
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Ref</th>
                      <th>Customer</th>
                      <th>Vehicle</th>
                      <th>Plate</th>
                      <th>Est. Value</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {recentInquiries.slice(0, 5).map((inq) => (
                      <tr key={inq.id}>
                        <td>
                          <a href="/inquiries" style={{ fontWeight: 700, fontFamily: 'var(--font-mono)', fontSize: '12px' }}>
                            {inq.reference || `#${inq.id.slice(0, 8)}`}
                          </a>
                        </td>
                        <td>
                          <div style={{ fontWeight: 600, fontSize: '13px' }}>{inq.name || 'Valued Vehicle Owner'}</div>
                          <div style={{ fontSize: '12px', color: 'var(--text-tertiary)' }}>{inq.phone}</div>
                        </td>
                        <td style={{ textTransform: 'capitalize', fontSize: '13px' }}>
                          {inq.vehicleType}
                        </td>
                        <td style={{ fontFamily: 'monospace', fontWeight: 700, fontSize: '12px' }}>
                          {inq.regNumber || '—'}
                        </td>
                        <td style={{ fontWeight: 700, color: '#10b981', fontSize: '13px' }}>
                          {inq.estimate ? (typeof inq.estimate.min === 'number' ? `₹${inq.estimate.min} – ₹${inq.estimate.max}` : `${inq.estimate.min} – ${inq.estimate.max}`) : '—'}
                        </td>
                        <td>
                          <StatusBadge status={inq.status || 'new'} />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>

        {/* Quick Actions */}
        <div style={{ marginTop: '24px' }}>
          <div className="card">
            <div className="card-header">
              <div className="card-title">Quick Actions</div>
            </div>
            <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
              <a href="/inquiries" className="btn btn-primary" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                <Mail size={15} />
                <span>Inquiry Form</span>
              </a>
              <a href="/products/new" className="btn btn-secondary" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                <Plus size={15} />
                <span>Add Product</span>
              </a>
              <a href="/orders" className="btn btn-secondary" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                <ClipboardList size={15} />
                <span>View Orders</span>
              </a>
              <a href="/content" className="btn btn-secondary" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                <Palette size={15} />
                <span>Manage Content</span>
              </a>
              <a href="/categories" className="btn btn-secondary" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                <FolderTree size={15} />
                <span>Categories</span>
              </a>
              <a href="/customers" className="btn btn-secondary" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                <Users size={15} />
                <span>Customers</span>
              </a>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
