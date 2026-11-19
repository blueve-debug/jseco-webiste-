'use client';

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { LoadingPage } from '@/components/LoadingSpinner';
import { Flame } from 'lucide-react';

export default function ScrapProductDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const [product, setProduct] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!params.id) return;
    fetch(`/api/scrap-products/${params.id}`)
      .then(res => res.json())
      .then(data => {
        if (data.product) {
          setProduct(data.product);
        }
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setLoading(false);
      });
  }, [params.id]);

  if (loading) return <LoadingPage />;

  if (!product) {
    return (
      <div className="container" style={{ padding: '80px 20px', textAlign: 'center' }}>
        <h2>Product not found</h2>
        <button className="btn btn-primary" onClick={() => router.push('/sell')} style={{ marginTop: '20px' }}>
          Back to Sell Scrap
        </button>
      </div>
    );
  }

  return (
    <>
      <section className="page-hero" style={{ minHeight: '30vh', display: 'flex', alignItems: 'center' }}>
        <div className="page-hero-bg-text">DETAILS</div>
        <div className="page-hero-content container" style={{ position: 'relative', zIndex: 2 }}>
          <button className="btn btn-outline" style={{ border: 'none', color: '#fff', padding: 0, marginBottom: '20px' }} onClick={() => router.push('/sell')}>
            &larr; Back to Catalog
          </button>
          {product.image ? (
            <div style={{ width: '120px', height: '120px', borderRadius: '50%', overflow: 'hidden', marginBottom: '16px', border: '4px solid white', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}>
              <img src={product.image} alt={product.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            </div>
          ) : (
            <div style={{ fontSize: '64px', marginBottom: '16px' }}>{product.icon}</div>
          )}
          <h1>{product.name}</h1>
          <div className="section-label" style={{ marginTop: '10px' }}>{product.badgeText}</div>
        </div>
      </section>

      <section className="section">
        <div className="container" style={{ maxWidth: '800px' }}>
          <div className="card" style={{ padding: '40px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '24px' }}>
              <div>
                <h2 style={{ fontSize: '28px', marginBottom: '8px' }}>Product Overview</h2>
                <p style={{ color: 'var(--text-secondary)', fontSize: '16px' }}>{product.desc}</p>
              </div>
              {product.hot && (
                <span className="prod-badge hot-badge" style={{ fontSize: '14px', padding: '8px 16px', display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                  <Flame size={15} />
                  <span>High Demand</span>
                </span>
              )}
            </div>

            <div style={{ background: 'var(--bg-elevated)', padding: '24px', borderRadius: '12px', marginBottom: '32px' }}>
              <div style={{ fontSize: '14px', color: 'var(--text-secondary)', marginBottom: '8px' }}>Estimated Rate</div>
              <div style={{ fontSize: '32px', fontWeight: 'bold', color: 'var(--text)' }}>
                {product.rate} <span style={{ fontSize: '16px', fontWeight: 'normal', color: 'var(--text-secondary)' }}>{product.unit}</span>
              </div>
            </div>

            <h3 style={{ fontSize: '20px', marginBottom: '16px' }}>How to sell?</h3>
            <p style={{ color: 'var(--text-secondary)', marginBottom: '24px', lineHeight: 1.6 }}>
              If you have <strong>{product.name}</strong> to scrap, our RVSF authorized facility provides the best market rates. Click the button below to directly chat with our team on WhatsApp to finalize the valuation and arrange pickup.
            </p>

            <a
              href={`https://wa.me/919310856385?text=Hi%2C%20I%20am%20interested%20in%20selling%20my%20${encodeURIComponent(product.name)}.%20Please%20share%20more%20details.`}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-whatsapp"
              style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', padding: '16px 32px', fontSize: '18px', width: '100%' }}
            >
              Sell {product.name} via WhatsApp
            </a>
          </div>
        </div>
      </section>
    </>
  );
}
