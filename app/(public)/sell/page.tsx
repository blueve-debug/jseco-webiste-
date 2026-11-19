'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { CheckCircle2, Car, Bike, Truck, Check, PhoneCall, MessageCircle } from 'lucide-react';

const AutoRickshawIcon = ({ size = 20, color = 'currentColor' }: { size?: number; color?: string }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M19 17h2c.6 0 1-.4 1-1v-3c0-.9-.7-1.7-1.5-1.9C18.7 10.6 16 10 16 10l-2-4H7L4 12v5h2" />
    <circle cx="7" cy="17" r="2" />
    <circle cx="17" cy="17" r="2" />
    <path d="M14 6v8" />
    <path d="M4 12h10" />
  </svg>
);

// Dynamic data states will be used instead of static arrays

function SellScrapForm() {
  const searchParams = useSearchParams();

  const [activeCategory, setActiveCategory] = useState('all');
  const [vehicleType, setVehicleType] = useState('Car');
  const [vehicleNo, setVehicleNo] = useState('');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [pincode, setPincode] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');
  const [inquiryResult, setInquiryResult] = useState<{
    id?: string;
    reference?: string;
    estimate?: { min: string; max: string; concession: string };
  } | null>(null);
  const [preferredSlot, setPreferredSlot] = useState('Tomorrow (Morning 9 AM - 1 PM)');
  const [slotUpdating, setSlotUpdating] = useState(false);
  const [slotSaved, setSlotSaved] = useState(false);
  const [categories, setCategories] = useState<any[]>([]);
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Parse query parameters on load
  useEffect(() => {
    const typeParam = searchParams.get('type');
    const noParam = searchParams.get('vehicleNo');
    const nameParam = searchParams.get('name');
    const phoneParam = searchParams.get('phone');

    if (typeParam) setVehicleType(typeParam);
    if (noParam) setVehicleNo(noParam);
    if (nameParam) setName(nameParam);
    if (phoneParam) setPhone(phoneParam);
    
    // Fetch dynamic data
    const fetchData = async () => {
      try {
        const [catRes, prodRes] = await Promise.all([
          fetch('/api/scrap-categories').then(res => res.json()),
          fetch('/api/scrap-products').then(res => res.json())
        ]);
        
        if (catRes.categories) {
          // Prepend "All Scrap"
          setCategories([{ id: 'all', label: 'All Scrap' }, ...catRes.categories]);
        }
        if (prodRes.products) setProducts(prodRes.products);
      } catch (err) {
        console.error('Failed to fetch data', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [searchParams]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!phone || phone.replace(/\D/g, '').length < 10) {
      setSubmitError('Please enter a valid 10-digit mobile number');
      return;
    }
    const cleanEmail = email.trim().toLowerCase();
    if (!cleanEmail || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleanEmail)) {
      setSubmitError('Please enter a valid email address to receive your estimate');
      return;
    }
    setSubmitError('');
    setSubmitting(true);

    const estimates: Record<string, { min: string; max: string; concession: string }> = {
      Car: { min: '₹28,000', max: '₹46,000', concession: 'Up to 25% Motor Vehicle Tax Rebate' },
      'Two-wheeler': { min: '₹4,500', max: '₹8,500', concession: 'Up to 25% Motor Vehicle Tax Rebate' },
      '3-wheeler': { min: '₹14,000', max: '₹24,000', concession: 'Up to 25% Motor Vehicle Tax Rebate' },
      Commercial: { min: '₹85,000', max: '₹1,95,000', concession: 'Up to 15% Commercial Vehicle Tax Rebate' },
    };
    const est = estimates[vehicleType] || estimates.Car;

    let apiVehicleType = 'car';
    if (vehicleType === 'Two-wheeler') apiVehicleType = '2-wheeler';
    else if (vehicleType === '3-wheeler') apiVehicleType = '3-wheeler';
    else if (vehicleType === 'Commercial') apiVehicleType = 'commercial';

    try {
      const res = await fetch('/api/inquiries', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          vehicleType: apiVehicleType,
          regNumber: vehicleNo,
          name: name || 'Valued Vehicle Owner',
          email: cleanEmail,
          phone,
          pincode,
          estimate: {
            min: est.min,
            max: est.max,
            label: `${est.min} – ${est.max}`,
            concession: est.concession,
          },
          source: 'sell_scrap_portal_sidebar',
        }),
      });

      const resData = await res.json();
      if (res.ok) {
        setInquiryResult({
          id: resData.id,
          reference: resData.reference,
          estimate: est,
        });
        setSubmitted(true);
      } else {
        setSubmitError(resData.error || 'Failed to submit valuation inquiry. Please try again.');
      }
    } catch (err) {
      console.error('Failed to submit inquiry:', err);
      setSubmitError('Network error. Please check connection and try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleSlotChange = async (slot: string) => {
    setPreferredSlot(slot);
    if (!inquiryResult?.id) return;
    setSlotUpdating(true);
    try {
      await fetch(`/api/inquiries/${inquiryResult.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          preferredSlot: slot,
          status: 'scheduled',
        }),
      });
      setSlotSaved(true);
      setTimeout(() => setSlotSaved(false), 3000);
    } catch (e) {
      console.error('Failed to save preferred slot', e);
    } finally {
      setSlotUpdating(false);
    }
  };

  const filteredProducts =
    activeCategory === 'all'
      ? products
      : products.filter((p) => p.categoryId === activeCategory);

  return (
    <>
      {/* ======= PAGE HERO ======= */}
      <section className="page-hero">
        <div className="page-hero-bg-text">SELL SCRAP</div>
        <div className="page-hero-content container" style={{ position: 'relative', zIndex: 2 }}>
          <div className="section-label">Valuation & Recovery</div>
          <h1>Get Top Value for Your Scrap Vehicle</h1>
          <p>
            Retire your vehicle legally, clear the road tax liability, and earn standard eco-valuations with our authorized RVSF facility.
          </p>
        </div>
      </section>

      {/* ======= SELL / FORM SECTION ======= */}
      <section className="section sell-section">
        <div
          className="container"
          style={{ display: 'grid', gridTemplateColumns: submitted ? '1fr' : '1.4fr 1fr', gap: '48px', alignItems: 'start' }}
        >
          {submitted ? (
            <div className="card" style={{ padding: '40px', textAlign: 'center', border: '1px solid var(--border)', borderRadius: '16px' }}>
              <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '16px', color: '#16a34a' }}>
                <CheckCircle2 size={54} strokeWidth={2} />
              </div>
              <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: '28px', color: 'var(--text)', marginBottom: '8px' }}>
                Quote Request Received Successfully!
              </h2>
              {inquiryResult?.reference && (
                <div style={{
                  display: 'inline-block',
                  background: '#e8f5e9',
                  color: '#1b5e20',
                  padding: '6px 16px',
                  borderRadius: '20px',
                  fontSize: '14px',
                  fontWeight: 600,
                  marginBottom: '16px'
                }}>
                  Inquiry Reference ID: {inquiryResult.reference}
                </div>
              )}
              <div style={{
                background: '#f0fdf4',
                border: '1px solid #bbf7d0',
                borderRadius: '12px',
                padding: '20px',
                maxWidth: '480px',
                margin: '0 auto 20px',
                textAlign: 'center'
              }}>
                <div style={{
                  width: '44px',
                  height: '44px',
                  borderRadius: '50%',
                  background: '#dcfce7',
                  border: '1px solid #86efac',
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginBottom: '10px',
                  color: '#16a34a',
                }}>
                  <PhoneCall size={22} />
                </div>
                <div style={{ fontSize: '17px', fontWeight: 700, color: '#15803d', marginBottom: '4px' }}>
                  Our Team Will Connect With You Shortly
                </div>
                <p style={{ fontSize: '13px', color: '#166534', margin: 0, lineHeight: 1.55 }}>
                  Our authorized RVSF valuation experts are reviewing your vehicle details to provide you with the best government-authorized valuation offer and Certificate of Deposit benefits.
                </p>
              </div>
              <p style={{ color: 'var(--text-muted)', marginBottom: '24px', maxWidth: '600px', margin: '0 auto 24px' }}>
                Thank you, <strong>{name}</strong>. Our RVSF operations team will evaluate the details for vehicle number{' '}
                <strong>{vehicleNo}</strong> ({vehicleType}) and contact you within 24 hours at <strong>{phone}</strong> with a formal valuation.
              </p>

              {/* Free Inspection & Towing Window */}
              <div style={{ maxWidth: '480px', margin: '0 auto 24px', textAlign: 'left' }}>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, marginBottom: '6px', color: 'var(--text)' }}>
                  Preferred Doorstep Inspection &amp; Towing Window:
                </label>
                <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                  <select
                    value={preferredSlot}
                    onChange={(e) => handleSlotChange(e.target.value)}
                    style={{
                      flex: 1,
                      padding: '10px 12px',
                      borderRadius: '8px',
                      border: '1px solid var(--border)',
                      background: 'white',
                      fontSize: '14px'
                    }}
                  >
                    <option value="Tomorrow (Morning 9 AM - 1 PM)">Tomorrow (Morning 9 AM - 1 PM)</option>
                    <option value="Tomorrow (Afternoon 2 PM - 6 PM)">Tomorrow (Afternoon 2 PM - 6 PM)</option>
                    <option value="This Weekend (Saturday / Sunday)">This Weekend (Saturday / Sunday)</option>
                    <option value="Call me to confirm date">Call me to confirm date</option>
                  </select>
                  {slotSaved && (
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', color: '#16a34a', fontSize: '13px', fontWeight: 600 }}>
                      <Check size={14} /> Saved
                    </span>
                  )}
                  {slotUpdating && (
                    <span style={{ display: 'inline-flex', alignItems: 'center', color: '#666', fontSize: '12px' }}>
                      Updating...
                    </span>
                  )}
                </div>
              </div>

              <div style={{ display: 'flex', gap: '14px', justifyContent: 'center', flexWrap: 'wrap' }}>
                <a
                  href={`https://wa.me/919310856385?text=${encodeURIComponent(
                    `Hi JSECO, I have submitted a scrappage inquiry for my ${vehicleType} (${vehicleNo})${
                      inquiryResult?.reference ? ` with Reference ID: ${inquiryResult.reference}` : ''
                    }. Please connect with me regarding valuation and pickup.`
                  )}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn-whatsapp"
                  style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}
                >
                  <MessageCircle size={18} /> Connect on WhatsApp
                </a>
                <button
                  onClick={() => {
                    setSubmitted(false);
                    setInquiryResult(null);
                  }}
                  className="btn-outline"
                >
                  Submit Another Request
                </button>
              </div>
            </div>
          ) : (
            <>
              {/* Product Catalog */}
              <div>
                <div className="section-label" style={{ marginBottom: '8px' }}>
                  Live Rate Card
                </div>
                <h2 className="section-title" style={{ textAlign: 'left', marginBottom: '24px' }}>
                  Scrap Category Pricing
                </h2>

                {loading ? (
                  <div style={{ textAlign: 'center', padding: '40px' }}>Loading...</div>
                ) : (
                  <>
                    {/* Filter buttons */}
                    <div className="filter-bar">
                      {categories.map((cat) => (
                        <button
                          key={cat.id}
                          className={`filter-btn ${activeCategory === cat.id ? 'active' : ''}`}
                          onClick={() => setActiveCategory(cat.id)}
                        >
                          {cat.label}
                        </button>
                      ))}
                    </div>

                    <div className="products-grid">
                    {filteredProducts.map((p) => (
                      <div key={p.id} className={`product-card ${p.hot ? 'hot' : ''}`}>
                        <div className="prod-badge-row" style={{ display: 'flex', justifyContent: 'space-between' }}>
                          <span className={`prod-badge ${p.badge}`}>{p.badgeText}</span>
                          {p.hot && <span className="prod-badge hot-badge">High Demand</span>}
                        </div>
                        {p.image ? (
                          <div style={{ width: '100%', height: '180px', marginBottom: '16px', borderRadius: '12px', overflow: 'hidden', background: '#f0f0f0' }}>
                            <img src={p.image} alt={p.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                          </div>
                        ) : (
                          <div className="prod-icon">{p.icon}</div>
                        )}
                        <h3>{p.name}</h3>
                        <p>{p.desc}</p>
                        <div className="prod-rate">
                          Estimated Rate: <br />
                          <span>{p.rate}</span> {p.unit}
                        </div>
                        <div style={{ marginTop: '16px' }}>
                          <a
                            href={`https://wa.me/919310856385?text=Hi%2C%20I%20am%20interested%20in%20selling%20my%20${encodeURIComponent(p.name)}.%20Please%20share%20more%20details.`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="btn-whatsapp"
                            style={{ display: 'block', width: '100%', textAlign: 'center', fontSize: '14px', padding: '8px' }}
                          >
                            Sell via WhatsApp
                          </a>
                        </div>
                      </div>
                    ))}
                  </div>
                </>
                )}

                <div className="rate-note">
                  * Note: All rates listed are indicative market benchmarks. Actual payout depends on weight, metal purity,
                  battery type, model age, dynamic market values, and pickup geography.
                </div>
              </div>

              {/* Form Sidebar */}
              <div
                className="estimate-card"
                style={{
                  position: 'sticky',
                  top: '96px',
                  width: '100%',
                  maxWidth: '100%',
                }}
              >
                <div className="estimate-top-badge">Get an estimate</div>
                <div className="estimate-card-body">
                  <h3 className="estimate-title">What is your vehicle worth?</h3>
                  <form onSubmit={handleSubmit}>
                    {/* Vehicle Type */}
                    <label className="estimate-section-label">VEHICLE TYPE</label>
                    <div className="estimate-type-grid">
                      {[
                        { label: 'Car', icon: <Car size={20} /> },
                        { label: 'Two-wheeler', icon: <Bike size={20} /> },
                        { label: '3-wheeler', icon: <AutoRickshawIcon size={20} /> },
                        { label: 'Commercial', icon: <Truck size={20} /> },
                      ].map((item) => (
                        <button
                          key={item.label}
                          type="button"
                          className={`estimate-type-card ${vehicleType === item.label ? 'active' : ''}`}
                          onClick={() => setVehicleType(item.label)}
                        >
                          <span className="estimate-type-icon">{item.icon}</span>
                          <span className="estimate-type-text">{item.label}</span>
                        </button>
                      ))}
                    </div>

                    {/* Registration Number */}
                    <label htmlFor="sellVehicleNo" className="estimate-input-label">
                      Registration number
                    </label>
                    <div className="estimate-plate-box">
                      <div className="plate-ind-pill">IND</div>
                      <input
                        id="sellVehicleNo"
                        type="text"
                        className="plate-input-field"
                        placeholder="DL 3C AB 1234"
                        value={vehicleNo}
                        onChange={(e) => setVehicleNo(e.target.value.toUpperCase())}
                        required
                      />
                    </div>
                    <p className="estimate-sub-help">
                      We use this only to look up your vehicle&apos;s make, model and year on the public register.
                    </p>

                    {/* Name */}
                    <label htmlFor="sellName" className="estimate-input-label">
                      Name <span className="estimate-label-hi">/ नाम</span>
                    </label>
                    <input
                      id="sellName"
                      type="text"
                      className="estimate-standard-input"
                      placeholder="Your full name"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      required
                    />

                    {/* Email */}
                    <label htmlFor="sellEmail" className="estimate-input-label">
                      Email address <span className="estimate-label-hi">/ ईमेल</span>
                    </label>
                    <input
                      id="sellEmail"
                      type="email"
                      className="estimate-standard-input"
                      placeholder="your.email@example.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                    />
                    <p className="estimate-sub-help" style={{ marginTop: '-4px', marginBottom: '12px' }}>
                      Estimate breakdown and official receipt will be sent here.
                    </p>

                    {/* Phone Number */}
                    <label htmlFor="sellPhone" className="estimate-input-label">
                      Phone number <span className="estimate-label-hi">/ फ़ोन नंबर</span>
                    </label>
                    <div className="estimate-phone-box">
                      <div className="phone-prefix-pill">+91</div>
                      <input
                        id="sellPhone"
                        type="tel"
                        className="phone-input-field"
                        placeholder="10-DIGIT MOBILE"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value.replace(/\D/g, '').slice(0, 10))}
                        required
                      />
                    </div>

                    {/* Pickup Location */}
                    <label htmlFor="sellPincode" className="estimate-input-label">
                      Pickup Location of Vehicle <span className="estimate-label-hi">/ वाहन का पिकअप स्थान</span>
                    </label>
                    <input
                      id="sellPincode"
                      type="text"
                      className="estimate-standard-input"
                      placeholder="Pincode — 110001"
                      value={pincode}
                      onChange={(e) => setPincode(e.target.value)}
                      style={{ marginBottom: '20px' }}
                    />

                    {submitError && (
                      <div style={{ color: '#dc2626', fontSize: '13px', marginBottom: '14px', background: '#fee2e2', padding: '8px 12px', borderRadius: '8px' }}>
                        {submitError}
                      </div>
                    )}

                    {/* Submit button */}
                    <button
                      type="submit"
                      className="estimate-submit-btn"
                      disabled={submitting}
                    >
                      {submitting ? 'Calculating Estimate...' : 'Show my estimate →'}
                    </button>

                    {/* Disclaimer */}
                    <p className="estimate-disclaimer-text">
                      Your name and number are used only to confirm the estimate and arrange pickup. Identity documents are collected later, only when you choose to proceed.
                    </p>
                  </form>
                </div>
              </div>
            </>
          )}
        </div>
      </section>
    </>
  );
}

export default function SellScrapPage() {
  return (
    <Suspense fallback={
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '80vh' }}>
        Loading Scrappage Calculator...
      </div>
    }>
      <SellScrapForm />
    </Suspense>
  );
}
