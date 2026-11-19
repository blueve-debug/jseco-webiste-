'use client';

import { useEffect, useState } from 'react';
import Header from '@/components/Header';
import { LoadingPage, EmptyState } from '@/components/LoadingSpinner';
import { useToast } from '@/components/Toast';
import { useAdminTheme } from '@/components/AdminThemeProvider';
import {
  Download,
  RefreshCw,
  Search,
  Mail,
  Phone,
  Calendar,
  Eye,
  Trash2,
  X,
  Save,
  MessageCircle,
  Bike,
  Truck,
  Car,
  ChevronLeft,
  ChevronRight,
  Check,
} from 'lucide-react';

const AutoRickshawIcon = ({ size = 14, color = "currentColor" }: { size?: number; color?: string }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M19 17h2c.6 0 1-.4 1-1v-3c0-.9-.7-1.7-1.5-1.9C18.7 10.6 16 10 16 10l-2-4H7L4 12v5h2" />
    <circle cx="7" cy="17" r="2" />
    <circle cx="17" cy="17" r="2" />
    <path d="M14 6v8" />
    <path d="M4 12h10" />
  </svg>
);

interface Inquiry {
  id: string;
  reference?: string;
  vehicleType: string;
  regNumber?: string;
  name?: string;
  email?: string;
  phone: string;
  pincode?: string;
  estimate?: {
    min?: number | string;
    max?: number | string;
    label?: string;
    concession?: string;
  };
  preferredSlot?: string;
  status: 'new' | 'contacted' | 'scheduled' | 'completed' | 'cancelled';
  source?: string;
  notes?: string;
  createdAt?: string;
  updatedAt?: string;
}

const STATUS_TABS = [
  { key: 'all', label: 'All Inquiries' },
  { key: 'new', label: 'New' },
  { key: 'contacted', label: 'Contacted' },
  { key: 'scheduled', label: 'Scheduled' },
  { key: 'completed', label: 'Completed' },
  { key: 'cancelled', label: 'Cancelled' },
];

export default function InquiriesPage() {
  const { showToast } = useToast();
  const { theme } = useAdminTheme();
  const isLight = theme === 'light';
  const [inquiries, setInquiries] = useState<Inquiry[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('all');
  const [vehicleFilter, setVehicleFilter] = useState('all');
  const [search, setSearch] = useState('');
  const [statusCounts, setStatusCounts] = useState<Record<string, number>>({});
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);

  // Selected inquiry for detailed modal
  const [selectedInquiry, setSelectedInquiry] = useState<Inquiry | null>(null);
  const [modalNotes, setModalNotes] = useState('');
  const [updatingStatus, setUpdatingStatus] = useState(false);
  const [adminNotificationEmails, setAdminNotificationEmails] = useState<string>('care@jseco.in, imran@jseco.in');
  const [resendingEmail, setResendingEmail] = useState(false);

  useEffect(() => {
    fetch('/api/settings')
      .then((r) => r.json())
      .then((data) => {
        if (data?.inquiryNotificationEmails) {
          setAdminNotificationEmails(data.inquiryNotificationEmails);
        }
      })
      .catch(() => null);
  }, []);

  const handleResendEmail = async (id: string, target: 'both' | 'admin' | 'customer' = 'both') => {
    setResendingEmail(true);
    try {
      const res = await fetch(`/api/inquiries/${id}/resend-email`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ target }),
      });
      const data = await res.json();
      if (res.ok) {
        showToast(data.message || 'Notification email sent successfully');
      } else {
        showToast(data.error || 'Failed to dispatch email', 'error');
      }
    } catch {
      showToast('Error sending email', 'error');
    } finally {
      setResendingEmail(false);
    }
  };

  const fetchInquiries = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: String(page),
        limit: '20',
      });
      if (activeTab !== 'all') params.set('status', activeTab);
      if (vehicleFilter !== 'all') params.set('vehicleType', vehicleFilter);
      if (search) params.set('search', search);

      const res = await fetch(`/api/inquiries?${params}`);
      const data = await res.json();
      setInquiries(data.inquiries || []);
      setStatusCounts(data.statusCounts || {});
      setTotalPages(data.pagination?.totalPages || 1);
      setTotalCount(data.pagination?.total || 0);
    } catch {
      showToast('Failed to load inquiries', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInquiries();
  }, [page, activeTab, vehicleFilter]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    fetchInquiries();
  };

  const handleStatusChange = async (id: string, newStatus: string) => {
    setUpdatingStatus(true);
    try {
      const res = await fetch(`/api/inquiries/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });

      if (res.ok) {
        showToast(`Inquiry status updated to ${newStatus}`);
        setInquiries((prev) =>
          prev.map((item) => (item.id === id ? { ...item, status: newStatus as Inquiry['status'] } : item))
        );
        if (selectedInquiry && selectedInquiry.id === id) {
          setSelectedInquiry({ ...selectedInquiry, status: newStatus as Inquiry['status'] });
        }
        fetchInquiries();
      } else {
        showToast('Failed to update status', 'error');
      }
    } catch {
      showToast('Error updating status', 'error');
    } finally {
      setUpdatingStatus(false);
    }
  };

  const handleSaveNotes = async () => {
    if (!selectedInquiry) return;
    try {
      const res = await fetch(`/api/inquiries/${selectedInquiry.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ notes: modalNotes }),
      });
      if (res.ok) {
        showToast('Internal notes saved');
        setSelectedInquiry({ ...selectedInquiry, notes: modalNotes });
        setInquiries((prev) =>
          prev.map((item) => (item.id === selectedInquiry.id ? { ...item, notes: modalNotes } : item))
        );
      }
    } catch {
      showToast('Failed to save notes', 'error');
    }
  };

  const handleDeleteInquiry = async (id: string) => {
    if (!confirm('Are you sure you want to delete this inquiry?')) return;
    try {
      const res = await fetch(`/api/inquiries/${id}`, { method: 'DELETE' });
      if (res.ok) {
        showToast('Inquiry deleted');
        if (selectedInquiry?.id === id) setSelectedInquiry(null);
        fetchInquiries();
      }
    } catch {
      showToast('Failed to delete inquiry', 'error');
    }
  };

  const exportCSV = () => {
    if (inquiries.length === 0) {
      showToast('No inquiries to export', 'info');
      return;
    }
    const headers = [
      'Reference',
      'Date',
      'Vehicle Type',
      'Reg Number',
      'Customer Name',
      'Phone',
      'Pincode',
      'Estimated Value',
      'Preferred Slot',
      'Status',
      'Notes',
    ];
    const rows = inquiries.map((inq) => [
      `"${inq.reference || inq.id}"`,
      `"${inq.createdAt ? new Date(inq.createdAt).toLocaleString() : ''}"`,
      `"${inq.vehicleType}"`,
      `"${inq.regNumber || ''}"`,
      `"${inq.name || ''}"`,
      `"+91 ${inq.phone}"`,
      `"${inq.pincode || ''}"`,
      `"${inq.estimate ? (typeof inq.estimate.min === 'number' ? `₹${inq.estimate.min} - ₹${inq.estimate.max}` : `${inq.estimate.min} - ${inq.estimate.max}`) : ''}"`,
      `"${inq.preferredSlot || ''}"`,
      `"${inq.status}"`,
      `"${(inq.notes || '').replace(/"/g, '""')}"`,
    ]);
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `vehicle_inquiries_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const getVehicleBadge = (type: string): { icon: React.ReactNode; label: string; bg: string; text: string; border: string } => {
    switch (type?.toLowerCase()) {
      case 'bike':
      case '2-wheeler':
      case 'two-wheeler':
        return {
          icon: <Bike size={14} />,
          label: 'Two-Wheeler',
          bg: isLight ? '#fffbeb' : 'rgba(245, 158, 11, 0.14)',
          text: isLight ? '#b45309' : '#fbbf24',
          border: isLight ? '#fde68a' : 'rgba(245, 158, 11, 0.3)',
        };
      case 'truck':
      case 'commercial':
        return {
          icon: <Truck size={14} />,
          label: 'Commercial',
          bg: isLight ? '#eef2ff' : 'rgba(99, 102, 241, 0.15)',
          text: isLight ? '#4338ca' : '#818cf8',
          border: isLight ? '#c7d2fe' : 'rgba(99, 102, 241, 0.3)',
        };
      case '3-wheeler':
      case 'three-wheeler':
        return {
          icon: <AutoRickshawIcon size={14} />,
          label: '3-Wheeler',
          bg: isLight ? '#faf5ff' : 'rgba(168, 85, 247, 0.15)',
          text: isLight ? '#7e22ce' : '#c084fc',
          border: isLight ? '#e9d5ff' : 'rgba(168, 85, 247, 0.3)',
        };
      default:
        return {
          icon: <Car size={14} />,
          label: 'Car',
          bg: isLight ? '#ecfdf5' : 'rgba(16, 185, 129, 0.14)',
          text: isLight ? '#047857' : '#34d399',
          border: isLight ? '#a7f3d0' : 'rgba(16, 185, 129, 0.3)',
        };
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'new':
        return {
          label: 'New Lead',
          bg: isLight ? '#ecfdf5' : 'rgba(16, 185, 129, 0.16)',
          text: isLight ? '#047857' : '#34d399',
          border: isLight ? '#a7f3d0' : 'rgba(16, 185, 129, 0.35)',
        };
      case 'contacted':
        return {
          label: 'Contacted',
          bg: isLight ? '#eff6ff' : 'rgba(56, 139, 253, 0.16)',
          text: isLight ? '#1d4ed8' : '#58a6ff',
          border: isLight ? '#bfdbfe' : 'rgba(56, 139, 253, 0.35)',
        };
      case 'scheduled':
        return {
          label: 'Scheduled',
          bg: isLight ? '#fffbeb' : 'rgba(210, 153, 34, 0.16)',
          text: isLight ? '#b45309' : '#d29922',
          border: isLight ? '#fde68a' : 'rgba(210, 153, 34, 0.35)',
        };
      case 'completed':
        return {
          label: 'Completed',
          bg: isLight ? '#f5f3ff' : 'rgba(163, 113, 247, 0.16)',
          text: isLight ? '#6d28d9' : '#a371f7',
          border: isLight ? '#ddd6fe' : 'rgba(163, 113, 247, 0.35)',
        };
      case 'cancelled':
        return {
          label: 'Cancelled',
          bg: isLight ? '#fef2f2' : 'rgba(248, 81, 73, 0.16)',
          text: isLight ? '#b91c1c' : '#f85149',
          border: isLight ? '#fecaca' : 'rgba(248, 81, 73, 0.35)',
        };
      default:
        return {
          label: status,
          bg: 'var(--bg-elevated)',
          text: 'var(--text-secondary)',
          border: 'var(--border-default)',
        };
    }
  };

  return (
    <>
      <Header
        title="Inquiry Form Responses"
        breadcrumbs={[{ label: 'Dashboard', href: '/admin' }, { label: 'Inquiry Form' }]}
      />

      <div className="page-content">
        {/* Page Header */}
        <div className="page-header">
          <div>
            <h1>Inquiry Form Responses &amp; Leads</h1>
            <p className="page-header-subtitle">
              Customer valuation estimates submitted on the website with dual email notifications to customer and management
            </p>
          </div>
          <div className="page-actions" style={{ display: 'flex', gap: '10px' }}>
            <button className="btn btn-secondary" onClick={exportCSV} title="Export CSV file" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
              <Download size={15} /> Export CSV
            </button>
            <button className="btn btn-primary" onClick={fetchInquiries} disabled={loading} style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
              <RefreshCw size={15} className={loading ? 'animate-spin' : ''} /> Refresh
            </button>
          </div>
        </div>

        {/* Dual Email Notification Configuration Status Banner */}
        <div
          style={{
            background: isLight ? '#f0fdf4' : 'rgba(16, 185, 129, 0.08)',
            border: isLight ? '1px solid #bbf7d0' : '1px solid rgba(16, 185, 129, 0.25)',
            borderRadius: '10px',
            padding: '14px 18px',
            marginBottom: '20px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '12px',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <span
              style={{
                width: '36px',
                height: '36px',
                borderRadius: '8px',
                background: isLight ? '#dcfce7' : 'rgba(16, 185, 129, 0.16)',
                color: isLight ? '#047857' : '#10b981',
                display: 'grid',
                placeItems: 'center',
                flexShrink: 0,
              }}
            >
              <Mail size={18} />
            </span>
            <div>
              <div style={{ fontSize: '13px', fontWeight: 700, color: 'var(--text-primary)' }}>
                Dual Email Notifications Active
              </div>
              <div style={{ fontSize: '12px', color: 'var(--text-secondary)', marginTop: '2px' }}>
                Every website inquiry automatically alerts configured Admins (<strong>{adminNotificationEmails}</strong>) and sends official valuation confirmation to the customer.
              </div>
            </div>
          </div>
          <a
            href="/settings"
            className="btn btn-secondary btn-sm"
            style={{ fontSize: '12px', padding: '6px 14px' }}
          >
            Configure Admin Emails
          </a>
        </div>

        {/* 4 Summary Stat Cards */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: '16px',
            marginBottom: '24px',
          }}
        >
          <div className="card" style={{ padding: '18px 20px' }}>
            <div style={{ fontSize: '12px', fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase' }}>
              Total Inquiries
            </div>
            <div style={{ fontSize: '28px', fontWeight: 800, color: 'var(--text-primary)', marginTop: '4px' }}>
              {statusCounts.all || 0}
            </div>
            <div style={{ fontSize: '12px', color: 'var(--sp-primary-light)', marginTop: '4px' }}>Website estimate submissions</div>
          </div>

          <div className="card" style={{ padding: '18px 20px', borderLeft: '4px solid #10b981' }}>
            <div style={{ fontSize: '12px', fontWeight: 700, color: '#10b981', textTransform: 'uppercase' }}>
              New Leads (Uncontacted)
            </div>
            <div style={{ fontSize: '28px', fontWeight: 800, color: '#10b981', marginTop: '4px' }}>
              {statusCounts.new || 0}
            </div>
            <div style={{ fontSize: '12px', color: 'var(--text-secondary)', marginTop: '4px' }}>Requires immediate follow-up</div>
          </div>

          <div className="card" style={{ padding: '18px 20px', borderLeft: '4px solid #f59e0b' }}>
            <div style={{ fontSize: '12px', fontWeight: 700, color: '#f59e0b', textTransform: 'uppercase' }}>
              Inspection Scheduled
            </div>
            <div style={{ fontSize: '28px', fontWeight: 800, color: '#f59e0b', marginTop: '4px' }}>
              {statusCounts.scheduled || 0}
            </div>
            <div style={{ fontSize: '12px', color: 'var(--text-secondary)', marginTop: '4px' }}>Towing slot confirmed</div>
          </div>

          <div className="card" style={{ padding: '18px 20px', borderLeft: '4px solid #3b82f6' }}>
            <div style={{ fontSize: '12px', fontWeight: 700, color: '#3b82f6', textTransform: 'uppercase' }}>
              Completed Scraps
            </div>
            <div style={{ fontSize: '28px', fontWeight: 800, color: '#3b82f6', marginTop: '4px' }}>
              {statusCounts.completed || 0}
            </div>
            <div style={{ fontSize: '12px', color: 'var(--text-secondary)', marginTop: '4px' }}>Certificate &amp; payout issued</div>
          </div>
        </div>

        {/* Status Tabs */}
        <div className="tabs" style={{ marginBottom: '16px' }}>
          {STATUS_TABS.map((tab) => (
            <button
              key={tab.key}
              className={`tab ${activeTab === tab.key ? 'active' : ''}`}
              onClick={() => {
                setActiveTab(tab.key);
                setPage(1);
              }}
            >
              {tab.label}
              <span className="tab-count">{statusCounts[tab.key] ?? 0}</span>
            </button>
          ))}
        </div>

        {/* Table Toolbar: Search & Vehicle Type Filter */}
        <div className="data-table-wrapper">
          <div
            className="table-toolbar"
            style={{ display: 'flex', gap: '14px', flexWrap: 'wrap', alignItems: 'center' }}
          >
            <form className="table-search" onSubmit={handleSearch} style={{ flex: '1 1 260px' }}>
              <span className="table-search-icon"><Search size={15} /></span>
              <input
                type="text"
                placeholder="Search by name, mobile, registration, pincode..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </form>

            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-secondary)' }}>
                Vehicle:
              </span>
              <select
                className="form-select"
                style={{ width: 'auto', padding: '6px 12px', fontSize: '13px' }}
                value={vehicleFilter}
                onChange={(e) => {
                  setVehicleFilter(e.target.value);
                  setPage(1);
                }}
              >
                <option value="all">All Vehicles</option>
                <option value="car">Cars</option>
                <option value="2-wheeler">Two-Wheelers</option>
                <option value="3-wheeler">3-Wheelers</option>
                <option value="commercial">Commercial</option>
              </select>
            </div>
          </div>

          {/* Table Content */}
          {loading ? (
            <LoadingPage />
          ) : inquiries.length === 0 ? (
            <EmptyState
              icon={<Mail size={36} color="var(--primary)" />}
              title="No Inquiries Found"
              text={
                search
                  ? `No inquiries matching "${search}"`
                  : activeTab !== 'all'
                  ? `No inquiries currently marked as ${activeTab}.`
                  : 'Customer estimate submissions will appear here once submitted on the website.'
              }
            />
          ) : (
            <>
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Ref / Date</th>
                    <th>Vehicle</th>
                    <th>Reg. Plate</th>
                    <th>Customer Contact</th>
                    <th>Pickup Area</th>
                    <th>Valuation Range</th>
                    <th>Slot / Status</th>
                    <th style={{ textAlign: 'right' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {inquiries.map((inq) => {
                    const vBadge = getVehicleBadge(inq.vehicleType);
                    const sBadge = getStatusBadge(inq.status);
                    const cleanPhone = (inq.phone || '').replace(/\D/g, '');
                    const formattedDate = inq.createdAt
                      ? new Date(inq.createdAt).toLocaleDateString('en-IN', {
                          day: 'numeric',
                          month: 'short',
                          hour: '2-digit',
                          minute: '2-digit',
                        })
                      : '—';

                    return (
                      <tr key={inq.id}>
                        {/* Reference & Date */}
                        <td>
                          <div style={{ fontWeight: 700, fontSize: '13px', color: 'var(--text-primary)' }}>
                            {inq.reference || `#${inq.id.slice(0, 8)}`}
                          </div>
                          <div style={{ fontSize: '11.5px', color: 'var(--text-tertiary)', marginTop: '2px' }}>
                            {formattedDate}
                          </div>
                        </td>

                        {/* Vehicle Type */}
                        <td>
                          <span
                            style={{
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '6px',
                              padding: '4px 8px',
                              borderRadius: '6px',
                              fontSize: '12px',
                              fontWeight: 700,
                              background: vBadge.bg,
                              color: vBadge.text,
                              border: `1px solid ${vBadge.border}`,
                            }}
                          >
                            <span>{vBadge.icon}</span>
                            <span>{vBadge.label}</span>
                          </span>
                        </td>

                        {/* Registration Number */}
                        <td>
                          {inq.regNumber ? (
                            <span
                              style={{
                                fontFamily: 'monospace',
                                fontWeight: 800,
                                fontSize: '12.5px',
                                letterSpacing: '0.04em',
                                background: 'var(--bg-elevated)',
                                border: '1px solid var(--border-default)',
                                padding: '3px 8px',
                                borderRadius: '4px',
                                color: 'var(--text-primary)',
                              }}
                            >
                              {inq.regNumber}
                            </span>
                          ) : (
                            <span style={{ color: 'var(--text-tertiary)', fontSize: '12px' }}>—</span>
                          )}
                        </td>

                        {/* Customer Info & Direct Action Links */}
                        <td>
                          <div style={{ fontWeight: 600, fontSize: '13.5px', color: 'var(--text-primary)' }}>
                            {inq.name || 'Valued Vehicle Owner'}
                          </div>
                          <div
                            style={{
                              display: 'flex',
                              alignItems: 'center',
                              gap: '8px',
                              marginTop: '3px',
                              flexWrap: 'wrap',
                            }}
                          >
                            <a
                              href={`tel:${cleanPhone}`}
                              style={{
                                color: 'var(--sp-primary-light)',
                                fontWeight: 700,
                                fontSize: '12.5px',
                                textDecoration: 'none',
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '4px',
                              }}
                              title="Click to Call"
                            >
                              <Phone size={12} /> +91 {cleanPhone}
                            </a>
                            <a
                              href={`https://wa.me/91${cleanPhone}?text=${encodeURIComponent(
                                `Hello ${inq.name || ''}, this is regarding your vehicle scrap inquiry with Good Eco Solutions.`
                              )}`}
                              target="_blank"
                              rel="noreferrer"
                              style={{
                                fontSize: '11px',
                                background: '#25D366',
                                color: '#ffffff',
                                padding: '1px 6px',
                                borderRadius: '4px',
                                textDecoration: 'none',
                                fontWeight: 700,
                              }}
                              title="Chat on WhatsApp"
                            >
                              WhatsApp
                            </a>
                          </div>
                          {inq.email && (
                            <div style={{ marginTop: '3px' }}>
                              <a
                                href={`mailto:${inq.email}`}
                                style={{
                                  color: '#38bdf8',
                                  fontSize: '12px',
                                  textDecoration: 'none',
                                  display: 'inline-flex',
                                  alignItems: 'center',
                                  gap: '4px',
                                }}
                                title="Send Email"
                              >
                                <Mail size={11} /> {inq.email}
                              </a>
                            </div>
                          )}
                        </td>

                        {/* Pickup Location */}
                        <td>
                          <div style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-primary)' }}>
                            {inq.pincode ? `PIN: ${inq.pincode}` : 'Delhi NCR'}
                          </div>
                        </td>

                        {/* Valuation Range */}
                        <td>
                          <div style={{ fontWeight: 700, fontSize: '13px', color: '#10b981' }}>
                            {inq.estimate
                              ? typeof inq.estimate.min === 'number'
                                ? `₹${inq.estimate.min.toLocaleString('en-IN')} – ₹${inq.estimate.max?.toLocaleString('en-IN')}`
                                : `${inq.estimate.min} – ${inq.estimate.max}`
                              : 'Pending Spec'}
                          </div>
                        </td>

                        {/* Status Dropdown */}
                        <td>
                          <div style={{ marginBottom: inq.preferredSlot ? '4px' : '0' }}>
                            <select
                              value={inq.status}
                              disabled={updatingStatus}
                              onChange={(e) => handleStatusChange(inq.id, e.target.value)}
                              style={{
                                padding: '4px 8px',
                                borderRadius: '6px',
                                border: `1px solid ${sBadge.border}`,
                                background: sBadge.bg,
                                color: sBadge.text,
                                fontWeight: 700,
                                fontSize: '12px',
                                cursor: 'pointer',
                                outline: 'none',
                              }}
                            >
                              <option value="new" style={{ background: 'var(--bg-card)', color: 'var(--text-primary)' }}>New Lead</option>
                              <option value="contacted" style={{ background: 'var(--bg-card)', color: 'var(--text-primary)' }}>Contacted</option>
                              <option value="scheduled" style={{ background: 'var(--bg-card)', color: 'var(--text-primary)' }}>Scheduled</option>
                              <option value="completed" style={{ background: 'var(--bg-card)', color: 'var(--text-primary)' }}>Completed</option>
                              <option value="cancelled" style={{ background: 'var(--bg-card)', color: 'var(--text-primary)' }}>Cancelled</option>
                            </select>
                          </div>
                          {inq.preferredSlot && (
                            <div
                              style={{
                                fontSize: '11px',
                                color: '#fbbf24',
                                fontWeight: 600,
                                background: 'rgba(245, 158, 11, 0.12)',
                                border: '1px solid rgba(245, 158, 11, 0.25)',
                                padding: '2px 6px',
                                borderRadius: '4px',
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '4px',
                              }}
                            >
                              <Calendar size={12} /> {inq.preferredSlot}
                            </div>
                          )}
                        </td>

                        {/* Actions */}
                        <td style={{ textAlign: 'right' }}>
                          <button
                            type="button"
                            className="btn btn-ghost btn-sm"
                            style={{ marginRight: '6px', display: 'inline-flex', alignItems: 'center', gap: '4px' }}
                            onClick={() => {
                              setSelectedInquiry(inq);
                              setModalNotes(inq.notes || '');
                            }}
                            title="View Full Details"
                          >
                            <Eye size={14} /> View
                          </button>
                          <button
                            type="button"
                            className="btn btn-ghost btn-sm"
                            style={{ color: 'var(--sp-error)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}
                            onClick={() => handleDeleteInquiry(inq.id)}
                            title="Delete Inquiry"
                          >
                            <Trash2 size={14} />
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>

              {/* Pagination */}
              <div className="table-pagination">
                <span style={{ color: 'var(--text-secondary)' }}>
                  Showing {inquiries.length} of {totalCount} inquiries (Page {page} of {totalPages})
                </span>
                <div className="table-pagination-controls">
                  <button
                    className="btn btn-ghost btn-sm"
                    disabled={page <= 1}
                    onClick={() => setPage(page - 1)}
                    style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}
                  >
                    <ChevronLeft size={14} /> Previous
                  </button>
                  <button
                    className="btn btn-ghost btn-sm"
                    disabled={page >= totalPages}
                    onClick={() => setPage(page + 1)}
                    style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}
                  >
                    Next <ChevronRight size={14} />
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Inquiry Detail & Notes Modal */}
      {selectedInquiry && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0, 0, 0, 0.75)',
            backdropFilter: 'blur(6px)',
            zIndex: 1000,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '20px',
          }}
          onClick={() => setSelectedInquiry(null)}
        >
          <div
            style={{
              background: 'var(--bg-card)',
              border: '1px solid var(--border-default)',
              borderRadius: '16px',
              maxWidth: '640px',
              width: '100%',
              maxHeight: '90vh',
              overflowY: 'auto',
              padding: '28px',
              boxShadow: '0 25px 60px rgba(0, 0, 0, 0.7), 0 0 0 1px rgba(255, 255, 255, 0.05)',
              position: 'relative',
              color: 'var(--text-primary)',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close Button */}
            <button
              type="button"
              onClick={() => setSelectedInquiry(null)}
              style={{
                position: 'absolute',
                top: '18px',
                right: '18px',
                width: '32px',
                height: '32px',
                borderRadius: '50%',
                background: 'var(--bg-elevated)',
                border: '1px solid var(--border-default)',
                cursor: 'pointer',
                display: 'grid',
                placeItems: 'center',
                color: 'var(--text-secondary)',
                transition: 'all 0.15s ease',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.color = 'var(--text-primary)';
                e.currentTarget.style.background = 'var(--border-muted)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.color = 'var(--text-secondary)';
                e.currentTarget.style.background = 'var(--bg-elevated)';
              }}
              title="Close"
            >
              <X size={16} />
            </button>

            {/* Header Badge & Ref */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
              <span
                style={{
                  fontSize: '11px',
                  fontWeight: 800,
                  letterSpacing: '0.06em',
                  textTransform: 'uppercase',
                  color: '#10b981',
                  background: 'rgba(16, 185, 129, 0.14)',
                  border: '1px solid rgba(16, 185, 129, 0.3)',
                  padding: '3px 8px',
                  borderRadius: '6px',
                }}
              >
                Inquiry Details
              </span>
              <span style={{ fontSize: '13px', color: 'var(--text-tertiary)', fontFamily: 'monospace' }}>
                Ref: {selectedInquiry.reference || selectedInquiry.id}
              </span>
            </div>

            {/* Customer Title */}
            <h2 style={{ fontSize: '22px', fontWeight: 800, margin: '6px 0 18px', color: 'var(--text-primary)' }}>
              {selectedInquiry.name || 'Valued Vehicle Owner'}
            </h2>

            {/* Grid Breakdown */}
            {(() => {
              const modalVBadge = getVehicleBadge(selectedInquiry.vehicleType);
              return (
                <div
                  style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(2, 1fr)',
                    gap: '14px',
                    background: 'var(--bg-elevated)',
                    border: '1px solid var(--border-default)',
                    padding: '18px',
                    borderRadius: '12px',
                    marginBottom: '20px',
                    fontSize: '13.5px',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{ color: 'var(--text-secondary)', fontWeight: 600 }}>Vehicle:</span>
                    <span
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '5px',
                        padding: '2px 8px',
                        borderRadius: '6px',
                        background: modalVBadge.bg,
                        color: modalVBadge.text,
                        border: `1px solid ${modalVBadge.border}`,
                        fontSize: '12px',
                        fontWeight: 700,
                      }}
                    >
                      {modalVBadge.icon}
                      {modalVBadge.label}
                    </span>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{ color: 'var(--text-secondary)', fontWeight: 600 }}>Reg Plate:</span>
                    <span
                      style={{
                        fontFamily: 'monospace',
                        fontWeight: 800,
                        background: 'rgba(255, 255, 255, 0.06)',
                        border: '1px solid var(--border-default)',
                        padding: '2px 8px',
                        borderRadius: '6px',
                        color: 'var(--text-primary)',
                        letterSpacing: '0.06em',
                        fontSize: '12.5px',
                      }}
                    >
                      {selectedInquiry.regNumber || 'Not specified'}
                    </span>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{ color: 'var(--text-secondary)', fontWeight: 600 }}>Mobile:</span>
                    <a
                      href={`tel:${selectedInquiry.phone}`}
                      style={{
                        color: 'var(--sp-primary-light)',
                        fontWeight: 700,
                        textDecoration: 'none',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '4px',
                      }}
                    >
                      <Phone size={13} /> +91 {selectedInquiry.phone}
                    </a>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{ color: 'var(--text-secondary)', fontWeight: 600 }}>Pincode:</span>
                    <span style={{ color: 'var(--text-primary)', fontWeight: 600 }}>
                      {selectedInquiry.pincode || 'Delhi NCR'}
                    </span>
                  </div>

                  {selectedInquiry.email && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', gridColumn: '1 / -1' }}>
                      <span style={{ color: 'var(--text-secondary)', fontWeight: 600 }}>Email:</span>
                      <a
                        href={`mailto:${selectedInquiry.email}`}
                        style={{
                          color: '#38bdf8',
                          fontWeight: 600,
                          textDecoration: 'none',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '5px',
                        }}
                      >
                        <Mail size={13} /> {selectedInquiry.email}
                      </a>
                    </div>
                  )}

                  <div style={{ gridColumn: '1 / -1', paddingTop: '6px', borderTop: '1px solid var(--border-subtle)' }}>
                    <span style={{ color: 'var(--text-secondary)', fontWeight: 600 }}>Valuation Estimate:</span>{' '}
                    <span style={{ color: '#10b981', fontWeight: 800, fontSize: '15px' }}>
                      {selectedInquiry.estimate
                        ? typeof selectedInquiry.estimate.min === 'number'
                          ? `₹${selectedInquiry.estimate.min.toLocaleString('en-IN')} – ₹${selectedInquiry.estimate.max?.toLocaleString('en-IN')}`
                          : `${selectedInquiry.estimate.min} – ${selectedInquiry.estimate.max}`
                        : 'N/A'}
                    </span>
                    {selectedInquiry.estimate?.concession && (
                      <span style={{ color: '#34d399', fontSize: '12px', marginLeft: '8px' }}>
                        ({selectedInquiry.estimate.concession})
                      </span>
                    )}
                  </div>

                  {selectedInquiry.preferredSlot && (
                    <div style={{ gridColumn: '1 / -1' }}>
                      <span style={{ color: 'var(--text-secondary)', fontWeight: 600 }}>Preferred Inspection Slot:</span>{' '}
                      <span
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '5px',
                          fontWeight: 700,
                          color: '#fbbf24',
                          background: 'rgba(245, 158, 11, 0.12)',
                          border: '1px solid rgba(245, 158, 11, 0.25)',
                          padding: '2px 8px',
                          borderRadius: '6px',
                          fontSize: '12px',
                          marginLeft: '6px',
                        }}
                      >
                        <Calendar size={13} /> {selectedInquiry.preferredSlot}
                      </span>
                    </div>
                  )}

                  <div style={{ gridColumn: '1 / -1', fontSize: '12px', color: 'var(--text-tertiary)', paddingTop: '6px', borderTop: '1px solid var(--border-subtle)' }}>
                    <span style={{ fontWeight: 600, color: 'var(--text-secondary)' }}>Submitted:</span>{' '}
                    {selectedInquiry.createdAt ? new Date(selectedInquiry.createdAt).toLocaleString() : '—'}
                  </div>
                </div>
              );
            })()}

            {/* Quick Status Buttons */}
            <div style={{ marginBottom: '20px' }}>
              <label style={{ display: 'block', fontSize: '12.5px', fontWeight: 700, marginBottom: '8px', color: 'var(--text-secondary)' }}>
                Update Lead Status:
              </label>
              <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                {(['new', 'contacted', 'scheduled', 'completed', 'cancelled'] as const).map((st) => {
                  const isActive = selectedInquiry.status === st;
                  const badgeInfo = getStatusBadge(st);
                  return (
                    <button
                      key={st}
                      type="button"
                      onClick={() => handleStatusChange(selectedInquiry.id, st)}
                      style={{
                        padding: '6px 14px',
                        borderRadius: '8px',
                        fontSize: '12.5px',
                        fontWeight: 700,
                        cursor: 'pointer',
                        transition: 'all 0.15s ease',
                        border: isActive ? `1px solid ${badgeInfo.border}` : '1px solid var(--border-default)',
                        background: isActive ? badgeInfo.bg : 'var(--bg-elevated)',
                        color: isActive ? badgeInfo.text : 'var(--text-secondary)',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '5px',
                      }}
                    >
                      {isActive && <Check size={13} strokeWidth={3} />}
                      {st.charAt(0).toUpperCase() + st.slice(1)}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Internal Staff Notes */}
            <div style={{ marginBottom: '22px' }}>
              <label style={{ display: 'block', fontSize: '12.5px', fontWeight: 700, marginBottom: '6px', color: 'var(--text-secondary)' }}>
                Internal Notes &amp; Follow-up Comments:
              </label>
              <textarea
                rows={3}
                placeholder="Add notes about customer call, agreed price, vehicle condition, or pickup schedule..."
                value={modalNotes}
                onChange={(e) => setModalNotes(e.target.value)}
                style={{
                  width: '100%',
                  marginBottom: '10px',
                  background: 'var(--bg-elevated)',
                  border: '1px solid var(--border-default)',
                  color: 'var(--text-primary)',
                  borderRadius: '8px',
                  padding: '10px 12px',
                  fontSize: '13px',
                  lineHeight: 1.5,
                  fontFamily: 'inherit',
                  resize: 'vertical',
                  outline: 'none',
                }}
                onFocus={(e) => (e.target.style.borderColor = 'var(--sp-primary-light)')}
                onBlur={(e) => (e.target.style.borderColor = 'var(--border-default)')}
              />
              <button
                type="button"
                className="btn btn-secondary btn-sm"
                onClick={handleSaveNotes}
                style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}
              >
                <Save size={14} /> Save Notes
              </button>
            </div>

            {/* Email Notification Actions */}
            <div
              style={{
                background: 'var(--bg-elevated)',
                border: '1px solid var(--border-default)',
                padding: '14px 16px',
                borderRadius: '10px',
                marginBottom: '20px',
              }}
            >
              <div style={{ fontSize: '12px', fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase', marginBottom: '8px' }}>
                Email Notifications (Hostinger Mail API)
              </div>
              <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                <button
                  type="button"
                  className="btn btn-secondary btn-sm"
                  disabled={resendingEmail}
                  onClick={() => handleResendEmail(selectedInquiry.id, 'admin')}
                  style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}
                >
                  <Mail size={13} />
                  {resendingEmail ? 'Sending...' : 'Resend Admin Alert'}
                </button>
                {selectedInquiry.email && (
                  <button
                    type="button"
                    className="btn btn-secondary btn-sm"
                    disabled={resendingEmail}
                    onClick={() => handleResendEmail(selectedInquiry.id, 'customer')}
                    style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}
                  >
                    <Mail size={13} />
                    {resendingEmail ? 'Sending...' : 'Resend Customer Confirmation'}
                  </button>
                )}
              </div>
            </div>

            {/* Direct Contact Actions */}
            <div style={{ display: 'flex', gap: '12px' }}>
              <a
                href={`tel:${selectedInquiry.phone.replace(/\D/g, '')}`}
                className="btn btn-primary"
                style={{
                  flex: 1,
                  textAlign: 'center',
                  textDecoration: 'none',
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  padding: '12px',
                  fontWeight: 700,
                  fontSize: '14px',
                  borderRadius: '8px',
                }}
              >
                <Phone size={16} /> Call Customer
              </a>
              <a
                href={`https://wa.me/91${selectedInquiry.phone.replace(/\D/g, '')}?text=${encodeURIComponent(
                  `Hello ${selectedInquiry.name || ''}, this is regarding your vehicle scrap inquiry with Good Eco Solutions.`
                )}`}
                target="_blank"
                rel="noreferrer"
                style={{
                  flex: 1,
                  textAlign: 'center',
                  background: '#25D366',
                  color: '#ffffff',
                  border: 'none',
                  textDecoration: 'none',
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  padding: '12px',
                  fontWeight: 700,
                  fontSize: '14px',
                  borderRadius: '8px',
                  boxShadow: '0 2px 8px rgba(37, 211, 102, 0.3)',
                }}
              >
                <MessageCircle size={16} /> WhatsApp Chat
              </a>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
