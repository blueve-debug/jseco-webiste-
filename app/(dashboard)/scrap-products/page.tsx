'use client';

import { useEffect, useState } from 'react';
import Header from '@/components/Header';
import Modal from '@/components/Modal';
import { LoadingPage } from '@/components/LoadingSpinner';
import { useToast } from '@/components/Toast';
import { Pencil, Trash2, Car, Package } from 'lucide-react';

interface ScrapCategory {
  id: string;
  label: string;
}

interface ScrapProduct {
  id: string;
  name: string;
  categoryId: string;
  icon: string;
  desc: string;
  badge: string;
  badgeText: string;
  rate: string;
  unit: string;
  hot: boolean;
  active: boolean;
}

export default function ScrapProductsPage() {
  const { showToast } = useToast();
  const [products, setProducts] = useState<ScrapProduct[]>([]);
  const [categories, setCategories] = useState<ScrapCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState<ScrapProduct | null>(null);
  
  const [form, setForm] = useState({
    name: '', categoryId: '', icon: 'Car', desc: '', 
    badge: 'auto-badge', badgeText: 'Automotive', rate: '', unit: 'per unit', hot: false, active: true
  });

  const fetchData = async () => {
    try {
      const [prodRes, catRes] = await Promise.all([
        fetch('/api/scrap-products').then(res => res.json()),
        fetch('/api/scrap-categories').then(res => res.json())
      ]);
      setProducts(prodRes.products || []);
      setCategories(catRes.categories || []);
    } catch { showToast('Failed to load data', 'error'); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchData(); }, []);

  const openCreate = () => { 
    setEditing(null); 
    setForm({ name: '', categoryId: categories[0]?.id || '', icon: 'Car', desc: '', badge: 'auto-badge', badgeText: 'Automotive', rate: '', unit: 'per unit', hot: false, active: true }); 
    setShowModal(true); 
  };
  
  const openEdit = (prod: ScrapProduct) => { 
    setEditing(prod); 
    setForm({ name: prod.name, categoryId: prod.categoryId, icon: prod.icon, desc: prod.desc, badge: prod.badge, badgeText: prod.badgeText, rate: prod.rate, unit: prod.unit, hot: prod.hot, active: prod.active }); 
    setShowModal(true); 
  };

  const handleSave = async () => {
    try {
      if (editing) {
        await fetch('/api/scrap-products', { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id: editing.id, ...form }) });
        showToast('Scrap Product updated!');
      } else {
        await fetch('/api/scrap-products', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form) });
        showToast('Scrap Product created!');
      }
      setShowModal(false);
      fetchData();
    } catch { showToast('Failed to save scrap product', 'error'); }
  };

  const handleDelete = async (id: string) => {
    try {
      const res = await fetch(`/api/scrap-products?id=${id}`, { method: 'DELETE' });
      const data = await res.json();
      if (!res.ok) { showToast(data.error || 'Failed to delete', 'error'); return; }
      showToast('Scrap Product deleted');
      fetchData();
    } catch { showToast('Failed to delete', 'error'); }
  };

  if (loading) return <LoadingPage />;

  return (
    <>
      <Header title="Scrap Products" breadcrumbs={[{ label: 'Dashboard', href: '/' }, { label: 'Scrap Products' }]} />
      <div className="page-content">
        <div className="page-header">
          <div><h1>Scrap Products</h1><p className="page-header-subtitle">Manage pricing for scrap items</p></div>
          <div className="page-actions"><button className="btn btn-primary" onClick={openCreate}>+ Add Product</button></div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '20px' }}>
          {products.map(prod => (
            <div key={prod.id} className="card" style={{ padding: '16px', display: 'flex', flexDirection: 'column' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 700, fontSize: '18px' }}>
                  <Car size={18} color="var(--brand, #3aa253)" />
                  <span>{prod.name}</span>
                </div>
                <span className={`badge ${prod.active ? 'badge-delivered' : 'badge-cancelled'}`}>{prod.active ? 'Active' : 'Inactive'}</span>
              </div>
              <p style={{ fontSize: '13px', color: 'var(--text-secondary)', marginBottom: '8px' }}>{prod.desc}</p>
              <p style={{ fontSize: '13px', fontWeight: 'bold' }}>Rate: {prod.rate} {prod.unit}</p>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '12px' }}>
                <span className={`badge ${prod.hot ? 'badge-processing' : 'badge-pending'}`}>{prod.hot ? 'Hot Demand' : 'Normal'}</span>
                <div style={{ display: 'flex', gap: '4px' }}>
                  <button className="btn btn-ghost btn-sm" onClick={() => openEdit(prod)} title="Edit product">
                    <Pencil size={14} />
                  </button>
                  <button className="btn btn-ghost btn-sm" onClick={() => handleDelete(prod.id)} title="Delete product">
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            </div>
          ))}
          {products.length === 0 && (
            <div className="card" style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '60px' }}>
              <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '16px' }}>
                <Car size={48} color="var(--text-tertiary)" />
              </div>
              <div style={{ fontWeight: 700, marginBottom: '8px' }}>No scrap products yet</div>
              <button className="btn btn-primary" onClick={openCreate}>+ Add Product</button>
            </div>
          )}
        </div>
      </div>

      <Modal isOpen={showModal} onClose={() => setShowModal(false)} title={editing ? 'Edit Product' : 'New Product'} footer={
        <><button className="btn btn-secondary" onClick={() => setShowModal(false)}>Cancel</button><button className="btn btn-primary" onClick={handleSave}>{editing ? 'Save Changes' : 'Create Product'}</button></>
      }>
        <div className="form-group"><label className="form-label">Name *</label><input className="form-input" value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} placeholder="e.g. End-of-Life Cars" /></div>
        
        <div className="form-group">
          <label className="form-label">Category</label>
          <select className="form-input" value={form.categoryId} onChange={e => setForm(p => ({ ...p, categoryId: e.target.value }))}>
            <option value="">Select Category</option>
            {categories.map(c => <option key={c.id} value={c.id}>{c.label}</option>)}
          </select>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
          <div className="form-group"><label className="form-label">Icon (Emoji)</label><input className="form-input" value={form.icon} onChange={e => setForm(p => ({ ...p, icon: e.target.value }))} /></div>
          <div className="form-group"><label className="form-label">Badge Class</label><input className="form-input" value={form.badge} onChange={e => setForm(p => ({ ...p, badge: e.target.value }))} placeholder="auto-badge" /></div>
        </div>

        <div className="form-group"><label className="form-label">Badge Text</label><input className="form-input" value={form.badgeText} onChange={e => setForm(p => ({ ...p, badgeText: e.target.value }))} placeholder="Automotive" /></div>
        <div className="form-group"><label className="form-label">Description</label><textarea className="form-textarea" value={form.desc} onChange={e => setForm(p => ({ ...p, desc: e.target.value }))} rows={2} /></div>
        
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
          <div className="form-group"><label className="form-label">Rate Range</label><input className="form-input" value={form.rate} onChange={e => setForm(p => ({ ...p, rate: e.target.value }))} placeholder="₹18,000 - ₹35,000" /></div>
          <div className="form-group"><label className="form-label">Unit</label><input className="form-input" value={form.unit} onChange={e => setForm(p => ({ ...p, unit: e.target.value }))} placeholder="per unit" /></div>
        </div>

        <div style={{ display: 'flex', gap: '24px' }}>
          <div className="toggle-wrapper"><label className="toggle"><input type="checkbox" checked={form.hot} onChange={e => setForm(p => ({ ...p, hot: e.target.checked }))} /><span className="toggle-slider"></span></label><span className="form-label" style={{ marginBottom: 0 }}>High Demand (Hot)</span></div>
          <div className="toggle-wrapper"><label className="toggle"><input type="checkbox" checked={form.active} onChange={e => setForm(p => ({ ...p, active: e.target.checked }))} /><span className="toggle-slider"></span></label><span className="form-label" style={{ marginBottom: 0 }}>Active</span></div>
        </div>
      </Modal>
    </>
  );
}
