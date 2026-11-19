'use client';

import { useEffect, useState } from 'react';
import Header from '@/components/Header';
import { LoadingPage, EmptyState } from '@/components/LoadingSpinner';
import { Search, Users, ChevronLeft, ChevronRight } from 'lucide-react';

interface Customer {
  uid: string;
  phoneNumber: string;
  email: string;
  displayName: string;
  disabled: boolean;
  createdAt: string;
  lastSignIn: string;
  orderCount: number;
  profile: Record<string, unknown>;
}

export default function CustomersPage() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const fetchCustomers = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page: String(page), limit: '20' });
      if (search) params.set('search', search);
      const res = await fetch(`/api/customers?${params}`);
      const data = await res.json();
      setCustomers(data.customers || []);
      setTotalPages(data.pagination?.totalPages || 1);
    } catch { console.error('Failed to fetch customers'); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchCustomers(); }, [page]);

  const handleSearch = (e: React.FormEvent) => { e.preventDefault(); setPage(1); fetchCustomers(); };

  return (
    <>
      <Header title="Customers" breadcrumbs={[{ label: 'Dashboard', href: '/' }, { label: 'Customers' }]} />
      <div className="page-content">
        <div className="page-header">
          <div><h1>Customers</h1><p className="page-header-subtitle">Manage your user base</p></div>
        </div>

        <div className="data-table-wrapper">
          <div className="table-toolbar">
            <form className="table-search" onSubmit={handleSearch}>
              <Search size={16} className="table-search-icon" />
              <input type="text" placeholder="Search by phone, name, UID..." value={search} onChange={e => setSearch(e.target.value)} />
            </form>
          </div>

          {loading ? <LoadingPage /> : customers.length === 0 ? (
            <EmptyState icon={<Users size={36} color="var(--text-tertiary)" />} title="No customers found" text="Customers will appear here when they sign up in the app." />
          ) : (
            <>
              <table className="data-table">
                <thead><tr><th>Customer</th><th>Phone</th><th>UID</th><th>Orders</th><th>Joined</th><th>Last Active</th><th>Status</th></tr></thead>
                <tbody>
                  {customers.map(c => (
                    <tr key={c.uid}>
                      <td>
                        <div className="table-product-cell">
                          <div className="sidebar-avatar" style={{ width: 32, height: 32, fontSize: '12px' }}>
                            {(c.displayName || c.phoneNumber || '?').charAt(0).toUpperCase()}
                          </div>
                          <div><div className="table-product-name">{c.displayName || 'Unnamed'}</div></div>
                        </div>
                      </td>
                      <td style={{ fontFamily: 'var(--font-mono)', fontSize: '13px' }}>{c.phoneNumber || '—'}</td>
                      <td><span style={{ fontSize: '11px', color: 'var(--text-tertiary)', fontFamily: 'var(--font-mono)' }}>{c.uid.slice(0, 12)}...</span></td>
                      <td><span className="badge badge-info">{c.orderCount}</span></td>
                      <td style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>{c.createdAt ? new Date(c.createdAt).toLocaleDateString() : '—'}</td>
                      <td style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>{c.lastSignIn ? new Date(c.lastSignIn).toLocaleDateString() : '—'}</td>
                      <td><span className={`badge ${c.disabled ? 'badge-cancelled' : 'badge-delivered'}`}>{c.disabled ? 'Disabled' : 'Active'}</span></td>
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
