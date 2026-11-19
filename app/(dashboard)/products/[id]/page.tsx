'use client';

import { useEffect, useState, use } from 'react';
import { useRouter } from 'next/navigation';
import Header from '@/components/Header';
import { LoadingPage } from '@/components/LoadingSpinner';
import Modal from '@/components/Modal';
import { useToast } from '@/components/Toast';
import { Upload, X } from 'lucide-react';

export default function EditProductPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const { showToast } = useToast();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showDelete, setShowDelete] = useState(false);
  const [imageUrl, setImageUrl] = useState('');
  const [form, setForm] = useState({
    name: '', description: '', price: '', originalPrice: '', sku: '', grade: 'A',
    category: 'Engines', condition: 'Used', mileage: '', warranty: '6 Months',
    availability: true, images: [] as string[], compatibility: '', supplier: '', featured: false,
  });

  useEffect(() => {
    fetch(`/api/products/${id}`)
      .then(r => r.json())
      .then(data => {
        if (data.error) { showToast('Product not found', 'error'); router.push('/products'); return; }
        setForm({
          name: data.name || '', description: data.description || '', price: String(data.price || ''),
          originalPrice: String(data.originalPrice || ''), sku: data.sku || '', grade: data.grade || 'A',
          category: data.category || 'Engines', condition: data.condition || 'Used',
          mileage: data.mileage || '', warranty: data.warranty || '6 Months',
          availability: data.availability !== false, images: data.images || [],
          compatibility: data.compatibility || '', supplier: data.supplier || '',
          featured: data.featured || false,
        });
      })
      .catch(() => showToast('Failed to load product', 'error'))
      .finally(() => setLoading(false));
  }, [id]);

  const updateField = (field: string, value: unknown) => setForm(prev => ({ ...prev, [field]: value }));
  const addImage = () => { if (imageUrl.trim()) { updateField('images', [...form.images, imageUrl.trim()]); setImageUrl(''); } };
  const removeImage = (i: number) => updateField('images', form.images.filter((_, idx) => idx !== i));

  const handleSave = async () => {
    if (!form.name || !form.price) { showToast('Name and price are required', 'error'); return; }
    setSaving(true);
    try {
      const res = await fetch(`/api/products/${id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form) });
      if (!res.ok) throw new Error();
      showToast('Product updated successfully!');
      router.push('/products');
    } catch { showToast('Failed to update product', 'error'); } finally { setSaving(false); }
  };

  const handleDelete = async () => {
    try {
      await fetch(`/api/products/${id}`, { method: 'DELETE' });
      showToast('Product deleted');
      router.push('/products');
    } catch { showToast('Failed to delete', 'error'); }
  };

  if (loading) return <LoadingPage />;

  return (
    <>
      <Header title={`Edit: ${form.name}`} breadcrumbs={[{ label: 'Dashboard', href: '/' }, { label: 'Products', href: '/products' }, { label: form.name || 'Edit' }]} />
      <div className="page-content">
        <div className="page-header">
          <div><h1>Edit Product</h1><p className="page-header-subtitle">Update product details</p></div>
          <div className="page-actions">
            <button className="btn btn-danger" onClick={() => setShowDelete(true)}>Delete</button>
            <button className="btn btn-secondary" onClick={() => router.push('/products')}>Cancel</button>
            <button className="btn btn-primary" onClick={handleSave} disabled={saving}>{saving ? 'Saving...' : 'Save Changes'}</button>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '24px' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            <div className="card">
              <div className="card-title" style={{ marginBottom: '20px' }}>Basic Information</div>
              <div className="form-group"><label className="form-label">Product Name *</label><input className="form-input" value={form.name} onChange={e => updateField('name', e.target.value)} required /></div>
              <div className="form-group"><label className="form-label">Description</label><textarea className="form-textarea" value={form.description} onChange={e => updateField('description', e.target.value)} rows={4} /></div>
              <div className="form-group"><label className="form-label">Vehicle Compatibility</label><input className="form-input" value={form.compatibility} onChange={e => updateField('compatibility', e.target.value)} /></div>
            </div>
            <div className="card">
              <div className="card-title" style={{ marginBottom: '20px' }}>Product Images</div>
              
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '20px' }}>
                {/* Option A: Paste URL */}
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label">Option A: Paste Image URL</label>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <input className="form-input" placeholder="https://..." value={imageUrl} onChange={e => setImageUrl(e.target.value)} style={{ flex: 1 }} />
                    <button type="button" className="btn btn-secondary" onClick={addImage}>Add</button>
                  </div>
                </div>

                {/* Option B: Upload File */}
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label">Option B: Upload File</label>
                  <div>
                    <input
                      type="file"
                      accept="image/*"
                      id="file-upload"
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
                          updateField('images', [...form.images, data.url]);
                          showToast('Image uploaded successfully!');
                        } catch (err) {
                          console.error(err);
                          showToast('Failed to upload image', 'error');
                        }
                      }}
                    />
                    <label
                      htmlFor="file-upload"
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
                      <Upload size={15} /> Choose Image File
                    </label>
                  </div>
                </div>
              </div>

              {form.images.length > 0 && (
                <div className="image-preview-grid">
                  {form.images.map((url, i) => (
                    <div key={i} className="image-preview">
                      <img src={url} alt="" />
                      <button type="button" className="image-preview-remove" onClick={() => removeImage(i)}><X size={12} /></button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            <div className="card">
              <div className="card-title" style={{ marginBottom: '20px' }}>Pricing</div>
              <div className="form-group"><label className="form-label">Sale Price (₹) *</label><input type="number" className="form-input" value={form.price} onChange={e => updateField('price', e.target.value)} required min="0" step="0.01" /></div>
              <div className="form-group"><label className="form-label">Original Price (₹)</label><input type="number" className="form-input" value={form.originalPrice} onChange={e => updateField('originalPrice', e.target.value)} min="0" step="0.01" /></div>
            </div>
            <div className="card">
              <div className="card-title" style={{ marginBottom: '20px' }}>Classification</div>
              <div className="form-group"><label className="form-label">Category</label><select className="form-select" value={form.category} onChange={e => updateField('category', e.target.value)}><option>Engines</option><option>Tires</option><option>Lights</option><option>Interior</option><option>Transmission</option><option>Gearbox</option><option>Brakes</option><option>Body</option><option>Electrical</option></select></div>
              <div className="form-group"><label className="form-label">Grade</label><div style={{ display: 'flex', gap: '8px' }}>{['A','B','C'].map(g => <button key={g} type="button" className={`btn ${form.grade===g?'btn-primary':'btn-secondary'}`} onClick={() => updateField('grade', g)} style={{ flex: 1 }}>Grade {g}</button>)}</div></div>
              <div className="form-group"><label className="form-label">SKU</label><input className="form-input" value={form.sku} onChange={e => updateField('sku', e.target.value)} /></div>
            </div>
            <div className="card">
              <div className="card-title" style={{ marginBottom: '20px' }}>Specs</div>
              <div className="form-group"><label className="form-label">Condition</label><select className="form-select" value={form.condition} onChange={e => updateField('condition', e.target.value)}><option>New</option><option>Used</option><option>Refurbished</option></select></div>
              <div className="form-group"><label className="form-label">Mileage</label><input className="form-input" value={form.mileage} onChange={e => updateField('mileage', e.target.value)} /></div>
              <div className="form-group"><label className="form-label">Warranty</label><select className="form-select" value={form.warranty} onChange={e => updateField('warranty', e.target.value)}><option>None</option><option>30 Days</option><option>90 Days</option><option>6 Months</option><option>1 Year</option></select></div>
              <div className="form-group"><label className="form-label">Supplier</label><input className="form-input" value={form.supplier} onChange={e => updateField('supplier', e.target.value)} /></div>
              <div className="toggle-wrapper" style={{ marginTop: '8px' }}><label className="toggle"><input type="checkbox" checked={form.availability} onChange={e => updateField('availability', e.target.checked)} /><span className="toggle-slider"></span></label><span className="form-label" style={{ marginBottom: 0 }}>In Stock</span></div>
              <div className="toggle-wrapper" style={{ marginTop: '12px' }}><label className="toggle"><input type="checkbox" checked={form.featured} onChange={e => updateField('featured', e.target.checked)} /><span className="toggle-slider"></span></label><span className="form-label" style={{ marginBottom: 0 }}>Featured</span></div>
            </div>
          </div>
        </div>
      </div>

      <Modal isOpen={showDelete} onClose={() => setShowDelete(false)} title="Delete Product" footer={<><button className="btn btn-secondary" onClick={() => setShowDelete(false)}>Cancel</button><button className="btn btn-danger" onClick={handleDelete}>Delete</button></>}>
        <p style={{ color: 'var(--text-secondary)' }}>Are you sure you want to delete <strong style={{ color: 'var(--text-primary)' }}>{form.name}</strong>? This cannot be undone.</p>
      </Modal>
    </>
  );
}
