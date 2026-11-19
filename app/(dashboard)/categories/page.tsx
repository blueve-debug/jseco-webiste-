'use client';

import { useEffect, useState } from 'react';
import Header from '@/components/Header';
import Modal from '@/components/Modal';
import { LoadingPage } from '@/components/LoadingSpinner';
import { useToast } from '@/components/Toast';
import { Pencil, Trash2, FolderTree, Package, Upload } from 'lucide-react';

interface Category {
  id: string;
  name: string;
  description: string;
  icon: string;
  imageUrl: string;
  order: number;
  active: boolean;
  productCount: number;
}

export default function CategoriesPage() {
  const { showToast } = useToast();
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState<Category | null>(null);
  const [form, setForm] = useState({ name: '', description: '', icon: '', imageUrl: '', order: 0, active: true });

  const fetchCategories = async () => {
    try {
      const res = await fetch('/api/categories');
      const data = await res.json();
      setCategories(data.categories || []);
    } catch { showToast('Failed to load categories', 'error'); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchCategories(); }, []);

  const openCreate = () => { setEditing(null); setForm({ name: '', description: '', icon: '', imageUrl: '', order: categories.length, active: true }); setShowModal(true); };
  const openEdit = (cat: Category) => { setEditing(cat); setForm({ name: cat.name, description: cat.description, icon: cat.icon, imageUrl: cat.imageUrl, order: cat.order, active: cat.active }); setShowModal(true); };

  const handleSave = async () => {
    try {
      const submitData = {
        ...form,
        icon: form.imageUrl, // Ensure the app icon uses the image URL
      };
      if (editing) {
        await fetch('/api/categories', { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id: editing.id, ...submitData }) });
        showToast('Category updated!');
      } else {
        await fetch('/api/categories', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(submitData) });
        showToast('Category created!');
      }
      setShowModal(false);
      fetchCategories();
    } catch { showToast('Failed to save category', 'error'); }
  };

  const handleDelete = async (id: string) => {
    try {
      const res = await fetch(`/api/categories?id=${id}`, { method: 'DELETE' });
      const data = await res.json();
      if (!res.ok) { showToast(data.error || 'Failed to delete', 'error'); return; }
      showToast('Category deleted');
      fetchCategories();
    } catch { showToast('Failed to delete', 'error'); }
  };

  if (loading) return <LoadingPage />;

  return (
    <>
      <Header title="Categories" breadcrumbs={[{ label: 'Dashboard', href: '/' }, { label: 'Categories' }]} />
      <div className="page-content">
        <div className="page-header">
          <div><h1>Categories</h1><p className="page-header-subtitle">Organize your parts inventory</p></div>
          <div className="page-actions"><button className="btn btn-primary" onClick={openCreate}>+ Add Category</button></div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '20px' }}>
          {categories.map(cat => (
            <div key={cat.id} className="card" style={{ padding: 0, overflow: 'hidden' }}>
              {cat.imageUrl || (cat.icon && cat.icon.startsWith('http')) ? (
                <img src={cat.imageUrl || cat.icon} alt={cat.name} style={{ width: '100%', height: '140px', objectFit: 'cover' }} />
              ) : (
                <div style={{ width: '100%', height: '140px', background: 'var(--bg-elevated)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Package size={42} color="var(--text-tertiary)" />
                </div>
              )}
              <div style={{ padding: '16px' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                  <div style={{ fontWeight: 700, fontSize: '16px' }}>{cat.name}</div>
                  <span className={`badge ${cat.active ? 'badge-delivered' : 'badge-cancelled'}`}>{cat.active ? 'Active' : 'Inactive'}</span>
                </div>
                {cat.description && <p style={{ fontSize: '13px', color: 'var(--text-secondary)', marginBottom: '12px' }}>{cat.description}</p>}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span className="badge badge-info">{cat.productCount} products</span>
                  <div style={{ display: 'flex', gap: '4px' }}>
                    <button className="btn btn-ghost btn-sm" onClick={() => openEdit(cat)} title="Edit category">
                      <Pencil size={14} />
                    </button>
                    <button className="btn btn-ghost btn-sm" onClick={() => handleDelete(cat.id)} title="Delete category">
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
          {categories.length === 0 && (
            <div className="card" style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '60px' }}>
              <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '16px' }}>
                <FolderTree size={48} color="var(--text-tertiary)" />
              </div>
              <div style={{ fontWeight: 700, marginBottom: '8px' }}>No categories yet</div>
              <p style={{ color: 'var(--text-secondary)', marginBottom: '16px' }}>Create categories to organize your inventory</p>
              <button className="btn btn-primary" onClick={openCreate}>+ Add Category</button>
            </div>
          )}
        </div>
      </div>

      <Modal isOpen={showModal} onClose={() => setShowModal(false)} title={editing ? 'Edit Category' : 'New Category'} footer={
        <><button className="btn btn-secondary" onClick={() => setShowModal(false)}>Cancel</button><button className="btn btn-primary" onClick={handleSave}>{editing ? 'Save Changes' : 'Create Category'}</button></>
      }>
        <div className="form-group"><label className="form-label">Name *</label><input className="form-input" value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} placeholder="e.g. Engines" /></div>
        <div className="form-group"><label className="form-label">Description</label><textarea className="form-textarea" value={form.description} onChange={e => setForm(p => ({ ...p, description: e.target.value }))} placeholder="Short description" rows={2} /></div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }} className="form-group">
          <div>
            <label className="form-label">Option A: Image / Icon URL</label>
            <input className="form-input" value={form.imageUrl} onChange={e => setForm(p => ({ ...p, imageUrl: e.target.value }))} placeholder="https://..." />
          </div>
          <div>
            <label className="form-label">Option B: Upload File</label>
            <input
              type="file"
              accept="image/*"
              id="category-file-upload"
              style={{ display: 'none' }}
              onChange={async (e) => {
                const file = e.target.files?.[0];
                if (!file) return;
                
                const formData = new FormData();
                formData.append('file', file);
                
                showToast('Uploading image...', 'info');
                
                try {
                  const res = await fetch('/api/upload', {
                    method: 'POST',
                    body: formData,
                  });
                  if (!res.ok) throw new Error('Upload failed');
                  const data = await res.json();
                  setForm(p => ({ ...p, imageUrl: data.url }));
                  showToast('Image uploaded successfully!');
                } catch (err) {
                  console.error(err);
                  showToast('Failed to upload image', 'error');
                }
              }}
            />
            <label
              htmlFor="category-file-upload"
              className="btn btn-outline"
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                cursor: 'pointer',
                width: '100%',
                height: '42px',
                boxSizing: 'border-box',
                border: '1.5px dashed var(--border)',
                borderRadius: '8px',
                color: 'var(--text-secondary)',
                fontSize: '13px',
                fontWeight: 500,
              }}
            >
              <Upload size={14} />
              <span>Choose Image File</span>
            </label>
          </div>
          <p style={{ gridColumn: '1 / -1', fontSize: '11px', color: 'var(--text-secondary)', marginTop: '4px', marginBottom: 0 }}>
            This image is used as both the category banner and the icon inside the mobile app.
          </p>
        </div>
        <div className="form-group"><label className="form-label">Display Order</label><input type="number" className="form-input" value={form.order} onChange={e => setForm(p => ({ ...p, order: parseInt(e.target.value) || 0 }))} /></div>
        <div className="toggle-wrapper"><label className="toggle"><input type="checkbox" checked={form.active} onChange={e => setForm(p => ({ ...p, active: e.target.checked }))} /><span className="toggle-slider"></span></label><span className="form-label" style={{ marginBottom: 0 }}>Active</span></div>
      </Modal>
    </>
  );
}
