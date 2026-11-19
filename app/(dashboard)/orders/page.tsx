'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Header from '@/components/Header';
import StatusBadge from '@/components/StatusBadge';
import { LoadingPage, EmptyState } from '@/components/LoadingSpinner';
import { Search, ClipboardList, ChevronLeft, ChevronRight } from 'lucide-react';

interface Order {
  id: string;
  customerName?: string;
  customerPhone?: string;
  total?: number;
  status?: string;
  items?: Array<{ name: string; quantity: number }>;
  createdAt?: { _seconds: number };
}

const STATUS_TABS = ['all', 'pending', 'processing', 'shipped', 'delivered', 'cancelled'];

export default function OrdersPage() {
  const router = useRouter();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('all');
  const [search, setSearch] = useState('');
  const [statusCounts, setStatusCounts] = useState<Record<string, number>>({});
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page: String(page), limit: '20' });
      if (activeTab !== 'all') params.set('status', activeTab);
      if (search) params.set('search', search);
      const res = await fetch(`/api/orders?${params}`);
      const data = await res.json();
      setOrders(data.orders || []);
      setStatusCounts(data.statusCounts || {});
      setTotalPages(data.pagination?.totalPages || 1);
    } catch { console.error('Failed to fetch orders'); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchOrders(); }, [page, activeTab]);

  const handleSearch = (e: React.FormEvent) => { e.preventDefault(); setPage(1); fetchOrders(); };
  const formatCurrency = (n: number) => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(n);

  return (
    <>
      <Header title="Orders" breadcrumbs={[{ label: 'Dashboard', href: '/' }, { label: 'Orders' }]} />
      <div className="page-content">
        <div className="page-header">
          <div><h1>Orders</h1><p className="page-header-subtitle">Manage and track customer orders</p></div>
        </div>

        {/* Status Tabs */}
        <div className="tabs">
          {STATUS_TABS.map(tab => (
            <button key={tab} className={`tab ${activeTab === tab ? 'active' : ''}`} onClick={() => { setActiveTab(tab); setPage(1); }}>
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
              <span className="tab-count">{statusCounts[tab] ?? 0}</span>
            </button>
          ))}
        </div>

        <div className="data-table-wrapper">
          <div className="table-toolbar">
            <form className="table-search" onSubmit={handleSearch}>
              <Search size={16} className="table-search-icon" />
              <input type="text" placeholder="Search by order ID, customer..." value={search} onChange={e => setSearch(e.target.value)} />
            </form>
          </div>

          {loading ? <LoadingPage /> : orders.length === 0 ? (
            <EmptyState icon={<ClipboardList size={36} color="var(--text-tertiary)" />} title="No orders found" text={activeTab !== 'all' ? `No ${activeTab} orders` : 'No orders have been placed yet.'} />
          ) : (
            <>
              <table className="data-table">
                <thead><tr><th>Order ID</th><th>Customer</th><th>Items</th><th>Total</th><th>Status</th><th>Date</th></tr></thead>
                <tbody>
                  {orders.map(order => (
                    <tr key={order.id} style={{ cursor: 'pointer' }} onClick={() => router.push(`/orders/${order.id}`)}>
                      <td><span style={{ fontFamily: 'var(--font-mono)', fontSize: '12px', fontWeight: 600 }}>#{order.id.slice(0, 8)}</span></td>
                      <td style={{ color: 'var(--text-secondary)' }}>{order.customerName || order.customerPhone || 'Guest'}</td>
                      <td><span className="badge badge-info">{order.items?.length || 0} items</span></td>
                      <td style={{ fontWeight: 600 }}>{formatCurrency(order.total || 0)}</td>
                      <td><StatusBadge status={order.status || 'pending'} /></td>
                      <td style={{ color: 'var(--text-tertiary)', fontSize: '13px' }}>
                        {order.createdAt?._seconds ? new Date(order.createdAt._seconds * 1000).toLocaleDateString() : '—'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <div className="table-pagination">
                <span>Page {page} of {totalPages}</span>
                <div className="table-pagination-controls">
                  <button className="table-pagination-btn" disabled={page <= 1} onClick={() => setPage(p => p - 1)} style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}><ChevronLeft size={14} /></button>
                  <button className="table-pagination-btn" disabled={page >= totalPages} onClick={() => setPage(p => p + 1)} style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}><ChevronRight size={14} /></button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </>
  );
}
