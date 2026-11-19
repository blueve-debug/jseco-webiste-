'use client';

import { useEffect, useState } from 'react';
import Header from '@/components/Header';
import { LoadingPage } from '@/components/LoadingSpinner';
import { useToast } from '@/components/Toast';
import { Image, Zap, Flame, FolderTree, Save, Trash2, X, Plus } from 'lucide-react';

interface HeroBanner {
  title: string; subtitle: string; ctaText: string; ctaLink: string; imageUrl: string; badge: string; active: boolean;
}

interface FlashSale {
  productName: string; sku: string; grade: string; price: number; originalPrice: number; imageUrl: string; endTime: string; active: boolean;
}

interface ContentData {
  heroBanners: HeroBanner[];
  flashSale: FlashSale;
  trendingSearches: string[];
  featuredCategories: string[];
}

export default function ContentPage() {
  const { showToast } = useToast();
  const [data, setData] = useState<ContentData | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeSection, setActiveSection] = useState('banners');

  useEffect(() => {
    fetch('/api/content').then(r => r.json()).then(setData).catch(() => showToast('Failed to load', 'error')).finally(() => setLoading(false));
  }, []);

  const save = async () => {
    if (!data) return;
    setSaving(true);
    try {
      await fetch('/api/content', { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) });
      showToast('Content saved!');
    } catch { showToast('Failed to save', 'error'); }
    finally { setSaving(false); }
  };

  const updateBanner = (i: number, field: string, value: unknown) => {
    if (!data) return;
    const banners = [...data.heroBanners];
    banners[i] = { ...banners[i], [field]: value };
    setData({ ...data, heroBanners: banners });
  };

  const addBanner = () => {
    if (!data) return;
    setData({ ...data, heroBanners: [...data.heroBanners, { title: '', subtitle: '', ctaText: 'Shop Now', ctaLink: '/', imageUrl: '', badge: '', active: true }] });
  };

  const removeBanner = (i: number) => {
    if (!data) return;
    setData({ ...data, heroBanners: data.heroBanners.filter((_, idx) => idx !== i) });
  };

  const updateFlashSale = (field: string, value: unknown) => {
    if (!data) return;
    setData({ ...data, flashSale: { ...data.flashSale, [field]: value } });
  };

  const updateTrending = (i: number, value: string) => {
    if (!data) return;
    const ts = [...data.trendingSearches];
    ts[i] = value;
    setData({ ...data, trendingSearches: ts });
  };

  const addTrending = () => {
    if (!data) return;
    setData({ ...data, trendingSearches: [...data.trendingSearches, ''] });
  };

  const removeTrending = (i: number) => {
    if (!data) return;
    setData({ ...data, trendingSearches: data.trendingSearches.filter((_, idx) => idx !== i) });
  };

  if (loading) return <LoadingPage />;
  if (!data) return null;

  const sections = [
    { key: 'banners', label: 'Hero Banners', icon: <Image size={16} /> },
    { key: 'flash', label: 'Flash Sale', icon: <Zap size={16} /> },
    { key: 'trending', label: 'Trending', icon: <Flame size={16} /> },
    { key: 'categories', label: 'Categories', icon: <FolderTree size={16} /> },
  ];

  return (
    <>
      <Header title="App Content" breadcrumbs={[{ label: 'Dashboard', href: '/' }, { label: 'Content' }]} />
      <div className="page-content">
        <div className="page-header">
          <div><h1>App Content</h1><p className="page-header-subtitle">Customize your Flutter app&apos;s homepage and content</p></div>
          <div className="page-actions">
            <button className="btn btn-primary" onClick={save} disabled={saving} style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
              <Save size={16} /> {saving ? 'Saving...' : 'Save All Changes'}
            </button>
          </div>
        </div>

        <div className="tabs">
          {sections.map(s => (
            <button key={s.key} className={`tab ${activeSection === s.key ? 'active' : ''}`} onClick={() => setActiveSection(s.key)} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              {s.icon} <span>{s.label}</span>
            </button>
          ))}
        </div>

        {/* Hero Banners */}
        {activeSection === 'banners' && (
          <div>
            {data.heroBanners.map((banner, i) => (
              <div key={i} className="card" style={{ marginBottom: '16px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '16px' }}>
                  <div className="card-title">Banner {i + 1}</div>
                  <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                    <div className="toggle-wrapper"><label className="toggle"><input type="checkbox" checked={banner.active} onChange={e => updateBanner(i, 'active', e.target.checked)} /><span className="toggle-slider"></span></label></div>
                    <button className="btn btn-ghost btn-sm" onClick={() => removeBanner(i)} title="Delete Banner" style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}><Trash2 size={16} /></button>
                  </div>
                </div>
                <div className="form-row">
                  <div className="form-group"><label className="form-label">Title</label><input className="form-input" value={banner.title} onChange={e => updateBanner(i, 'title', e.target.value)} /></div>
                  <div className="form-group"><label className="form-label">Badge</label><input className="form-input" value={banner.badge} onChange={e => updateBanner(i, 'badge', e.target.value)} placeholder="PREMIUM SALVAGE" /></div>
                </div>
                <div className="form-group"><label className="form-label">Subtitle</label><input className="form-input" value={banner.subtitle} onChange={e => updateBanner(i, 'subtitle', e.target.value)} /></div>
                <div className="form-row">
                  <div className="form-group"><label className="form-label">CTA Text</label><input className="form-input" value={banner.ctaText} onChange={e => updateBanner(i, 'ctaText', e.target.value)} /></div>
                  <div className="form-group"><label className="form-label">Image URL</label><input className="form-input" value={banner.imageUrl} onChange={e => updateBanner(i, 'imageUrl', e.target.value)} /></div>
                </div>
                {banner.imageUrl && <img src={banner.imageUrl} alt="" style={{ height: '80px', objectFit: 'cover', borderRadius: '8px', marginTop: '8px' }} />}
              </div>
            ))}
            <button className="btn btn-secondary" onClick={addBanner}>+ Add Banner</button>
          </div>
        )}

        {/* Flash Sale */}
        {activeSection === 'flash' && (
          <div className="card">
            <div className="card-title" style={{ marginBottom: '20px' }}>Deal of the Day / Flash Sale</div>
            <div className="toggle-wrapper" style={{ marginBottom: '20px' }}><label className="toggle"><input type="checkbox" checked={data.flashSale.active} onChange={e => updateFlashSale('active', e.target.checked)} /><span className="toggle-slider"></span></label><span className="form-label" style={{ marginBottom: 0 }}>Active</span></div>
            <div className="form-row">
              <div className="form-group"><label className="form-label">Product Name</label><input className="form-input" value={data.flashSale.productName} onChange={e => updateFlashSale('productName', e.target.value)} /></div>
              <div className="form-group"><label className="form-label">SKU</label><input className="form-input" value={data.flashSale.sku} onChange={e => updateFlashSale('sku', e.target.value)} /></div>
            </div>
            <div className="form-row-3">
              <div className="form-group"><label className="form-label">Sale Price (₹)</label><input type="number" className="form-input" value={data.flashSale.price} onChange={e => updateFlashSale('price', parseFloat(e.target.value))} /></div>
              <div className="form-group"><label className="form-label">Original Price (₹)</label><input type="number" className="form-input" value={data.flashSale.originalPrice} onChange={e => updateFlashSale('originalPrice', parseFloat(e.target.value))} /></div>
              <div className="form-group"><label className="form-label">Grade</label><select className="form-select" value={data.flashSale.grade} onChange={e => updateFlashSale('grade', e.target.value)}><option>A</option><option>B</option><option>C</option></select></div>
            </div>
            <div className="form-row">
              <div className="form-group"><label className="form-label">Image URL</label><input className="form-input" value={data.flashSale.imageUrl} onChange={e => updateFlashSale('imageUrl', e.target.value)} /></div>
              <div className="form-group"><label className="form-label">End Time</label><input type="datetime-local" className="form-input" value={data.flashSale.endTime?.slice(0, 16) || ''} onChange={e => updateFlashSale('endTime', new Date(e.target.value).toISOString())} /></div>
            </div>
          </div>
        )}

        {/* Trending */}
        {activeSection === 'trending' && (
          <div className="card">
            <div className="card-title" style={{ marginBottom: '20px' }}>Trending Searches</div>
            <p style={{ color: 'var(--text-secondary)', fontSize: '13px', marginBottom: '16px' }}>These appear in the search page of your Flutter app</p>
            {data.trendingSearches.map((term, i) => (
              <div key={i} style={{ display: 'flex', gap: '8px', marginBottom: '8px' }}>
                <input className="form-input" value={term} onChange={e => updateTrending(i, e.target.value)} style={{ flex: 1 }} />
                <button className="btn btn-ghost" onClick={() => removeTrending(i)} style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}><X size={16} /></button>
              </div>
            ))}
            <button className="btn btn-secondary btn-sm" onClick={addTrending}>+ Add Search Term</button>
          </div>
        )}

        {/* Featured Categories */}
        {activeSection === 'categories' && (
          <div className="card">
            <div className="card-title" style={{ marginBottom: '20px' }}>Featured Categories</div>
            <p style={{ color: 'var(--text-secondary)', fontSize: '13px', marginBottom: '16px' }}>Categories displayed on the homepage carousel</p>
            {data.featuredCategories.map((cat, i) => (
              <div key={i} style={{ display: 'flex', gap: '8px', marginBottom: '8px' }}>
                <input className="form-input" value={cat} onChange={e => {
                  const cats = [...data.featuredCategories]; cats[i] = e.target.value;
                  setData({ ...data, featuredCategories: cats });
                }} style={{ flex: 1 }} />
                <button className="btn btn-ghost" onClick={() => setData({ ...data, featuredCategories: data.featuredCategories.filter((_, idx) => idx !== i) })} style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}><X size={16} /></button>
              </div>
            ))}
            <button className="btn btn-secondary btn-sm" onClick={() => setData({ ...data, featuredCategories: [...data.featuredCategories, ''] })}>+ Add Category</button>
          </div>
        )}
      </div>
    </>
  );
}
