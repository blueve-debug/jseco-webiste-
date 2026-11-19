'use client';

import React, { useState } from 'react';
import { X, Check, MessageCircle, Phone, Calendar, PhoneCall } from 'lucide-react';

export interface ValuationModalData {
  inquiryId?: string;
  reference?: string;
  vehicleType: string;
  regNumber: string;
  name: string;
  email?: string;
  phone: string;
  estimate: { min: string; max: string; concession: string };
}

interface ValuationModalProps {
  isOpen: boolean;
  onClose: () => void;
  data: ValuationModalData | null;
}

export default function ValuationModal({ isOpen, onClose, data }: ValuationModalProps) {
  const [preferredSlot, setPreferredSlot] = useState('Tomorrow (Morning 9 AM - 1 PM)');
  const [slotUpdating, setSlotUpdating] = useState(false);
  const [slotSaved, setSlotSaved] = useState(false);

  if (!isOpen || !data) return null;

  const handleSlotChange = async (slot: string) => {
    setPreferredSlot(slot);
    if (!data.inquiryId) return;
    setSlotUpdating(true);
    try {
      await fetch(`/api/inquiries/${data.inquiryId}`, {
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
      console.error('Failed to update slot:', e);
    } finally {
      setSlotUpdating(false);
    }
  };

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(2, 26, 10, 0.75)',
        backdropFilter: 'blur(6px)',
        zIndex: 9999,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '16px',
      }}
      onClick={onClose}
    >
      <div
        style={{
          background: '#ffffff',
          borderRadius: '16px',
          maxWidth: '520px',
          width: '100%',
          padding: '28px 24px',
          boxShadow: '0 20px 40px rgba(0, 0, 0, 0.2)',
          position: 'relative',
          maxHeight: '90vh',
          overflowY: 'auto',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* CLOSE BUTTON */}
        <button
          type="button"
          onClick={onClose}
          aria-label="Close modal"
          style={{
            position: 'absolute',
            top: '18px',
            right: '18px',
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            color: '#666',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <X size={20} />
        </button>

        {/* HEADER */}
        <div style={{ textAlign: 'center', marginBottom: '16px' }}>
          <span
            style={{
              display: 'inline-block',
              background: '#e8f5e9',
              color: '#1b5e20',
              fontSize: '11px',
              fontWeight: 800,
              padding: '4px 12px',
              borderRadius: '999px',
              textTransform: 'uppercase',
              letterSpacing: '0.6px',
              marginBottom: '8px',
            }}
          >
            Inquiry Received &bull; Official RVSF
          </span>
          <h3 style={{ fontSize: '22px', fontWeight: 800, color: '#111', margin: '4px 0' }}>
            Request Submitted Successfully
          </h3>
          {data.regNumber && (
            <p style={{ fontSize: '13px', color: '#666', marginTop: '4px' }}>
              Vehicle: <strong>{data.regNumber}</strong> ({data.vehicleType})
            </p>
          )}
          {data.reference && (
            <div
              style={{
                display: 'inline-block',
                background: '#f0fdf4',
                color: '#15803d',
                border: '1px solid #bbf7d0',
                padding: '4px 12px',
                borderRadius: '6px',
                fontSize: '12px',
                fontWeight: 600,
                marginTop: '6px',
              }}
            >
              Inquiry Ref: {data.reference}
            </div>
          )}
          {data.email && (
            <p style={{ fontSize: '12px', color: '#15803d', marginTop: '6px' }}>
              Confirmation details sent to <strong>{data.email}</strong>
            </p>
          )}
        </div>

        {/* TEAM CONNECT NOTICE CARD */}
        <div
          style={{
            background: 'linear-gradient(135deg, #052e16 0%, #14532d 100%)',
            color: '#ffffff',
            borderRadius: '14px',
            padding: '22px 20px',
            textAlign: 'center',
            marginBottom: '18px',
            boxShadow: '0 8px 24px rgba(22, 101, 52, 0.22)',
          }}
        >
          <div
            style={{
              width: '46px',
              height: '46px',
              borderRadius: '50%',
              background: 'rgba(74, 222, 128, 0.18)',
              border: '1px solid rgba(74, 222, 128, 0.35)',
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: '10px',
              color: '#4ade80',
            }}
          >
            <PhoneCall size={22} />
          </div>
          <div
            style={{
              fontSize: '18px',
              fontWeight: 800,
              color: '#ffffff',
              marginBottom: '6px',
              letterSpacing: '-0.2px',
            }}
          >
            Our Team Will Connect With You Shortly
          </div>
          <p style={{ fontSize: '13px', color: '#bbf7d0', margin: 0, lineHeight: 1.55 }}>
            Our authorized RVSF valuation specialists are reviewing your vehicle details to provide you with the best government-compliant valuation offer and Certificate of Deposit benefits.
          </p>
        </div>

        {/* DOORSTEP TOWING WINDOW PICKER */}
        <div style={{ marginBottom: '18px', background: '#f8fafc', padding: '12px 14px', borderRadius: '10px', border: '1px solid #e2e8f0' }}>
          <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12.5px', fontWeight: 600, color: '#334155', marginBottom: '6px' }}>
            <Calendar size={14} color="#16a34a" />
            <span>Select Preferred Inspection / Towing Slot:</span>
          </label>
          <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
            <select
              value={preferredSlot}
              onChange={(e) => handleSlotChange(e.target.value)}
              style={{
                flex: 1,
                padding: '8px 10px',
                borderRadius: '6px',
                border: '1px solid #cbd5e1',
                background: 'white',
                fontSize: '13px',
              }}
            >
              <option value="Tomorrow (Morning 9 AM - 1 PM)">Tomorrow (Morning 9 AM - 1 PM)</option>
              <option value="Tomorrow (Afternoon 2 PM - 6 PM)">Tomorrow (Afternoon 2 PM - 6 PM)</option>
              <option value="This Weekend (Saturday / Sunday)">This Weekend (Saturday / Sunday)</option>
              <option value="Call me to confirm date">Call me to confirm date</option>
            </select>
            {slotSaved && (
              <span style={{ color: '#16a34a', fontSize: '12px', fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: '3px' }}>
                <Check size={14} /> Saved
              </span>
            )}
            {slotUpdating && <span style={{ color: '#64748b', fontSize: '11px' }}>Updating...</span>}
          </div>
        </div>

        {/* HIGHLIGHTS */}
        <ul
          style={{
            listStyle: 'none',
            display: 'grid',
            gap: '8px',
            fontSize: '12.5px',
            color: '#475569',
            marginBottom: '20px',
            padding: 0,
          }}
        >
          <li style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Check size={15} color="#16a34a" strokeWidth={2.5} />
            <span>100% Free Doorstep Flatbed Towing (Within 24 Hours)</span>
          </li>
          <li style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Check size={15} color="#16a34a" strokeWidth={2.5} />
            <span>Immediate On-Spot Handover &amp; Formal Deposit Certificate</span>
          </li>
          <li style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Check size={15} color="#16a34a" strokeWidth={2.5} />
            <span>Direct Legal VAHAN De-registration Support</span>
          </li>
        </ul>

        {/* ACTIONS */}
        <div style={{ display: 'grid', gap: '10px' }}>
          <a
            href={`https://wa.me/919310856385?text=${encodeURIComponent(
              `Hi JSECO, I want to scrap my ${data.vehicleType} (${data.regNumber || 'Vehicle'}). ${
                data.reference ? `My Inquiry Ref is ${data.reference}. ` : ''
              }My mobile is ${data.phone}. Please connect with me regarding valuation and pickup.`
            )}`}
            target="_blank"
            rel="noopener noreferrer"
            style={{
              padding: '13px 18px',
              fontSize: '14.5px',
              fontWeight: 700,
              backgroundColor: '#25D366',
              color: 'white',
              borderRadius: '9px',
              textDecoration: 'none',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '9px',
              boxShadow: '0 4px 14px rgba(37, 211, 102, 0.35)',
            }}
          >
            <MessageCircle size={20} /> Connect on WhatsApp
          </a>

          <a
            href="tel:+919310856385"
            style={{
              width: '100%',
              padding: '11px',
              fontSize: '13.5px',
              fontWeight: 600,
              backgroundColor: '#f8fafc',
              color: '#1e293b',
              borderRadius: '9px',
              textDecoration: 'none',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '7px',
              border: '1px solid #cbd5e1',
            }}
          >
            <Phone size={15} /> Call: +91 93108 56385
          </a>
        </div>
      </div>
    </div>
  );
}
