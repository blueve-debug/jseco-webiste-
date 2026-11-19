'use client';

import { useEffect, useState } from 'react';
import Header from '@/components/Header';
import Modal from '@/components/Modal';
import { LoadingPage } from '@/components/LoadingSpinner';
import { useToast } from '@/components/Toast';
import { Pencil, Trash2, FolderTree } from 'lucide-react';

interface ScrapCategory {
  id: string;
  label: string;
  order: number;
  active: boolean;
}

export default function ScrapCategoriesPage() {
  const { showToast } = useToast();
  const [categories, setCategories] = useState<ScrapCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState<ScrapCategory | null>(null);
  const [form, setForm] = useState({ label: '', order: 0, active: true });

  const fetchCategories = async () => {
    try {
      const res = await fetch('/api/scrap-categories');
      const data = await res.json();
      setCategories(data.categories || []);
    } catch { showToast('Failed to load scrap categories', 'error'); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchCategories(); }, []);

  const openCreate = () => { setEditing(null); setForm({ label: '', order: categories.length, active: true }); setShowModal(true); };
  const openEdit = (cat: ScrapCategory) => { setEditing(cat); setForm({ label: cat.label, order: cat.order, active: cat.active }); setShowModal(true); };

  const handleSave = async () => {
    try {
      if (editing) {
        await fetch('/api/scrap-categories', { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id: editing.id, ...form }) });
        showToast('Scrap Category updated!');
      } else {
        await fetch('/api/scrap-categories', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form) });
        showToast('Scrap Category created!');
      }
      setShowModal(false);
      fetchCategories();
    } catch { showToast('Failed to save scrap category', 'error'); }
  };

  const handleDelete = async (id: string) => {
    try {
      const res = await fetch(`/api/scrap-categories?id=${id}`, { method: 'DELETE' });
      const data = await res.json();
      if (!res.ok) { showToast(data.error || 'Failed to delete', 'error'); return; }
      showToast('Scrap Category deleted');
      fetchCategories();
    } catch { showToast('Failed to delete', 'error'); }
  };

  if (loading) return <LoadingPage />;

  return (
    <>
      <Header title="Scrap Categories" breadcrumbs={[{ label: 'Dashboard', href: '/' }, { label: 'Scrap Categories' }]} />
      <div className="page-content">
        <div className="page-header">
          <div><h1>Scrap Categories</h1><p className="page-header-subtitle">Manage categories for vehicle scrapping</p></div>
          <div className="page-actions"><button className="btn btn-primary" onClick={openCreate}>+ Add Category</button></div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '20px' }}>
          {categories.map(cat => (
            <div key={cat.id} className="card" style={{ padding: '16px', display: 'flex', flexDirection: 'column' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                <div style={{ fontWeight: 700, fontSize: '18px' }}>{cat.label}</div>
                <span className={`badge ${cat.active ? 'badge-delivered' : 'badge-cancelled'}`}>{cat.active ? 'Active' : 'Inactive'}</span>
              </div>
              <p style={{ fontSize: '13px', color: 'var(--text-secondary)', marginBottom: '12px' }}>Order: {cat.order}</p>
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '4px' }}>
                <button className="btn btn-ghost btn-sm" onClick={() => openEdit(cat)} title="Edit category">
                  <Pencil size={14} />
                </button>
                <button className="btn btn-ghost btn-sm" onClick={() => handleDelete(cat.id)} title="Delete category">
                  <Trash2 size={14} />
                </button>
              </div>
            </div>
          ))}
          {categories.length === 0 && (
            <div className="card" style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '60px' }}>
              <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '16px' }}>
                <FolderTree size={48} color="var(--text-tertiary)" />
              </div>
              <div style={{ fontWeight: 700, marginBottom: '8px' }}>No scrap categories yet</div>
              <button className="btn btn-primary" onClick={openCreate}>+ Add Category</button>
            </div>
          )}
        </div>
      </div>

      <Modal isOpen={showModal} onClose={() => setShowModal(false)} title={editing ? 'Edit Category' : 'New Category'} footer={
        <><button className="btn btn-secondary" onClick={() => setShowModal(false)}>Cancel</button><button className="btn btn-primary" onClick={handleSave}>{editing ? 'Save Changes' : 'Create Category'}</button></>
      }>
        <div className="form-group"><label className="form-label">Label *</label><input className="form-input" value={form.label} onChange={e => setForm(p => ({ ...p, label: e.target.value }))} placeholder="e.g. Automotive" /></div>
        <div className="form-group"><label className="form-label">Display Order</label><input type="number" className="form-input" value={form.order} onChange={e => setForm(p => ({ ...p, order: parseInt(e.target.value) || 0 }))} /></div>
        <div className="toggle-wrapper"><label className="toggle"><input type="checkbox" checked={form.active} onChange={e => setForm(p => ({ ...p, active: e.target.checked }))} /><span className="toggle-slider"></span></label><span className="form-label" style={{ marginBottom: 0 }}>Active</span></div>
      </Modal>
    </>
  );
}
