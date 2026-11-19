'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Header from '@/components/Header';
import { useToast } from '@/components/Toast';
import { Upload, X } from 'lucide-react';

export default function NewProductPage() {
  const router = useRouter();
  const { showToast } = useToast();
  const [saving, setSaving] = useState(false);
  const [imageUrl, setImageUrl] = useState('');
  const [form, setForm] = useState({
    name: '',
    description: '',
    price: '',
    originalPrice: '',
    sku: '',
    grade: 'A',
    category: 'Engines',
    condition: 'Used',
    mileage: '',
    warranty: '6 Months',
    availability: true,
    images: [] as string[],
    compatibility: '',
    supplier: '',
    featured: false,
  });

  const updateField = (field: string, value: unknown) => {
    setForm(prev => ({ ...prev, [field]: value }));
  };

  const addImage = () => {
    if (imageUrl.trim()) {
      updateField('images', [...form.images, imageUrl.trim()]);
      setImageUrl('');
    }
  };

  const removeImage = (index: number) => {
    updateField('images', form.images.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.price) {
      showToast('Name and price are required', 'error');
      return;
    }
    setSaving(true);

    try {
      const res = await fetch('/api/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });

      if (!res.ok) throw new Error('Failed to create product');

      showToast('Product created successfully!');
      router.push('/products');
    } catch {
      showToast('Failed to create product', 'error');
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
      <Header
        title="Add New Product"
        breadcrumbs={[
          { label: 'Dashboard', href: '/' },
          { label: 'Products', href: '/products' },
          { label: 'New Product' },
        ]}
      />

      <div className="page-content">
        <div className="page-header">
          <div>
            <h1>Add New Product</h1>
            <p className="page-header-subtitle">Add a new scrap part to your inventory</p>
          </div>
          <div className="page-actions">
            <button className="btn btn-secondary" onClick={() => router.push('/products')}>Cancel</button>
            <button className="btn btn-primary" onClick={handleSubmit} disabled={saving}>
              {saving ? 'Saving...' : 'Save Product'}
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit}>
          <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '24px' }}>
            {/* Left Column — Main Info */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
              {/* Basic Info */}
              <div className="card">
                <div className="card-title" style={{ marginBottom: '20px' }}>Basic Information</div>
                <div className="form-group">
                  <label className="form-label" htmlFor="product-name">Product Name *</label>
                  <input id="product-name" className="form-input" placeholder="e.g. Used V6 Engine 3.5L Assembly" value={form.name} onChange={e => updateField('name', e.target.value)} required />
                </div>
                <div className="form-group">
                  <label className="form-label" htmlFor="product-desc">Description</label>
                  <textarea id="product-desc" className="form-textarea" placeholder="Quality inspected, professionally dismantled..." value={form.description} onChange={e => updateField('description', e.target.value)} rows={4} />
                </div>
                <div className="form-group">
                  <label className="form-label" htmlFor="product-compat">Vehicle Compatibility</label>
                  <input id="product-compat" className="form-input" placeholder="e.g. Fits 08-12 Honda Civic" value={form.compatibility} onChange={e => updateField('compatibility', e.target.value)} />
                </div>
              </div>

              {/* Media */}
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
                        <img src={url} alt={`Product ${i + 1}`} onError={(e) => { (e.target as HTMLImageElement).src = ''; }} />
                        <button type="button" className="image-preview-remove" onClick={() => removeImage(i)}><X size={12} /></button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Right Column — Metadata */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
              {/* Pricing */}
              <div className="card">
                <div className="card-title" style={{ marginBottom: '20px' }}>Pricing</div>
                <div className="form-group">
                  <label className="form-label" htmlFor="product-price">Sale Price (₹) *</label>
                  <input id="product-price" type="number" className="form-input" placeholder="850.00" value={form.price} onChange={e => updateField('price', e.target.value)} required min="0" step="0.01" />
                </div>
                <div className="form-group">
                  <label className="form-label" htmlFor="product-original-price">Original Price (₹)</label>
                  <input id="product-original-price" type="number" className="form-input" placeholder="1200.00" value={form.originalPrice} onChange={e => updateField('originalPrice', e.target.value)} min="0" step="0.01" />
                  <div className="form-hint">Shown as strikethrough price</div>
                </div>
              </div>

              {/* Classification */}
              <div className="card">
                <div className="card-title" style={{ marginBottom: '20px' }}>Classification</div>
                <div className="form-group">
                  <label className="form-label" htmlFor="product-category">Category</label>
                  <select id="product-category" className="form-select" value={form.category} onChange={e => updateField('category', e.target.value)}>
                    <option value="Engines">Engines</option>
                    <option value="Tires">Tires</option>
                    <option value="Lights">Lights</option>
                    <option value="Interior">Interior</option>
                    <option value="Transmission">Transmission</option>
                    <option value="Gearbox">Gearbox</option>
                    <option value="Brakes">Brakes</option>
                    <option value="Body">Body</option>
                    <option value="Electrical">Electrical</option>
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Grade</label>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    {['A', 'B', 'C'].map(g => (
                      <button key={g} type="button" className={`btn ${form.grade === g ? 'btn-primary' : 'btn-secondary'}`} onClick={() => updateField('grade', g)} style={{ flex: 1 }}>
                        Grade {g}
                      </button>
                    ))}
                  </div>
                </div>
                <div className="form-group">
                  <label className="form-label" htmlFor="product-sku">SKU</label>
                  <input id="product-sku" className="form-input" placeholder="ENG-V6-3847" value={form.sku} onChange={e => updateField('sku', e.target.value)} />
                </div>
              </div>

              {/* Specifications */}
              <div className="card">
                <div className="card-title" style={{ marginBottom: '20px' }}>Specifications</div>
                <div className="form-group">
                  <label className="form-label" htmlFor="product-condition">Condition</label>
                  <select id="product-condition" className="form-select" value={form.condition} onChange={e => updateField('condition', e.target.value)}>
                    <option value="New">New</option>
                    <option value="Used">Used</option>
                    <option value="Refurbished">Refurbished</option>
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label" htmlFor="product-mileage">Mileage</label>
                  <input id="product-mileage" className="form-input" placeholder="84k miles" value={form.mileage} onChange={e => updateField('mileage', e.target.value)} />
                </div>
                <div className="form-group">
                  <label className="form-label" htmlFor="product-warranty">Warranty</label>
                  <select id="product-warranty" className="form-select" value={form.warranty} onChange={e => updateField('warranty', e.target.value)}>
                    <option value="None">No Warranty</option>
                    <option value="30 Days">30 Days</option>
                    <option value="90 Days">90 Days</option>
                    <option value="6 Months">6 Months</option>
                    <option value="1 Year">1 Year</option>
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label" htmlFor="product-supplier">Supplier</label>
                  <input id="product-supplier" className="form-input" placeholder="Midwest Auto Recyclers" value={form.supplier} onChange={e => updateField('supplier', e.target.value)} />
                </div>

                <div className="toggle-wrapper" style={{ marginTop: '8px' }}>
                  <label className="toggle">
                    <input type="checkbox" checked={form.availability} onChange={e => updateField('availability', e.target.checked)} />
                    <span className="toggle-slider"></span>
                  </label>
                  <span className="form-label" style={{ marginBottom: 0 }}>In Stock</span>
                </div>

                <div className="toggle-wrapper" style={{ marginTop: '12px' }}>
                  <label className="toggle">
                    <input type="checkbox" checked={form.featured} onChange={e => updateField('featured', e.target.checked)} />
                    <span className="toggle-slider"></span>
                  </label>
                  <span className="form-label" style={{ marginBottom: 0 }}>Featured Product</span>
                </div>
              </div>
            </div>
          </div>
        </form>
      </div>
    </>
  );
}
