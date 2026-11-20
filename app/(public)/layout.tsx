'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Bebas_Neue, DM_Sans, Playfair_Display } from 'next/font/google';
import './public.css';
import RvsfFloatingBadge from '@/components/RvsfFloatingBadge';
import { MapPin, Phone, Mail, Clock, Menu, X } from 'lucide-react';

const bebasNeue = Bebas_Neue({
  weight: '400',
  subsets: ['latin'],
  variable: '--font-display',
  display: 'swap',
});

const dmSans = DM_Sans({
  subsets: ['latin'],
  variable: '--font-body',
  display: 'swap',
});

const playfairDisplay = Playfair_Display({
  subsets: ['latin'],
  variable: '--font-serif',
  display: 'swap',
});

export default function PublicLayout({ children }: { children: React.ReactNode }) {
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 50) {
        setScrolled(true);
      } else {
        setScrolled(false);
      }
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close mobile nav on route change
  useEffect(() => {
    setMobileNavOpen(false);
  }, [pathname]);

  return (
    <div className={`${bebasNeue.variable} ${dmSans.variable} ${playfairDisplay.variable} public-root`}>
      {/* ======= HEADER ======= */}
      <header id="header" className={scrolled ? 'scrolled' : ''}>
        <div className="header-inner">
          <Link href="/" className="logo">
            <img src="/logo.jpeg" alt="JSECO Logo" className="logo-img" />
            <span className="logo-text">JSECO</span>
          </Link>
          <nav className="nav-links">
            <Link href="/" className={pathname === '/' ? 'active' : ''}>Home</Link>
            <Link href="/about" className={pathname === '/about' ? 'active' : ''}>About Us</Link>
            {/* <Link href="/sell" className={pathname === '/sell' ? 'active' : ''}>Sell Scrap</Link> */}
            <a href="#contact-footer">Contact</a>
          </nav>
          <button 
            className="hamburger" 
            onClick={() => setMobileNavOpen(!mobileNavOpen)} 
            aria-label="Toggle menu"
          >
            {mobileNavOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
        <div className={`mobile-nav ${mobileNavOpen ? 'open' : ''}`}>
          <Link href="/">Home</Link>
          <Link href="/about">About Us</Link>
          {/* <Link href="/sell">Sell Scrap</Link> */}
          <a href="#contact-footer" onClick={() => setMobileNavOpen(false)}>Contact</a>
        </div>
      </header>

      {/* Main Content Area */}
      <main style={{ minHeight: '80vh' }}>
        {children}
      </main>

      {/* ======= FOOTER / CONTACT ======= */}
      <footer id="contact-footer">
        <div className="footer-top">
          <div className="footer-brand">
            <div className="logo footer-logo">
              <img src="/logo.jpeg" alt="JSECO Logo" className="logo-img" />
              <span className="logo-text">JSECO</span>
            </div>
            <p>
              is committed to building a cleaner, greener and more sustainable future through responsible 
              vehicle scrapping, recycling and resource recovery. Transforming End-of-Life Vehicles into 
              Opportunities for a Greener Tomorrow.
            </p>
            <div className="social-links">
              <a href="https://wa.me/919310856385" target="_blank" rel="noopener noreferrer" title="WhatsApp">
                <svg width="18" height="18" viewBox="0 0 32 32" fill="currentColor">
                  <path d="M16 0C7.164 0 0 7.163 0 16c0 2.822.736 5.476 2.027 7.782L0 32l8.418-2.003A15.93 15.93 0 0016 32c8.836 0 16-7.163 16-16S24.836 0 16 0zm0 29.333a13.27 13.27 0 01-6.78-1.853l-.487-.29-5.004 1.191 1.23-4.869-.317-.5A13.254 13.254 0 012.667 16C2.667 8.636 8.636 2.667 16 2.667S29.333 8.636 29.333 16 23.364 29.333 16 29.333zm7.27-9.965c-.398-.2-2.355-1.163-2.72-1.295-.366-.133-.632-.2-.898.2-.266.4-1.032 1.295-1.265 1.562-.233.266-.466.3-.864.1-.398-.2-1.681-.62-3.202-1.978-1.183-1.057-1.982-2.362-2.214-2.762-.233-.4-.025-.616.175-.815.18-.18.398-.466.598-.7.2-.233.266-.4.398-.666.133-.266.067-.5-.033-.7-.1-.2-.898-2.163-1.23-2.962-.325-.779-.655-.673-.898-.685-.233-.012-.5-.015-.765-.015-.266 0-.7.1-1.065.5-.366.4-1.398 1.366-1.398 3.33 0 1.963 1.432 3.862 1.632 4.129.2.266 2.82 4.308 6.832 6.036.955.413 1.7.659 2.28.844.958.305 1.83.262 2.52.159.769-.115 2.355-.963 2.688-1.893.333-.93.333-1.727.233-1.893-.1-.166-.366-.266-.765-.466z"/>
                </svg>
              </a>
            </div>
          </div>
          <div className="footer-links">
            <h4>Quick Links</h4>
            <Link href="/">Home</Link>
            <Link href="/about">About Us</Link>
            <Link href="/sell">Sell Scrap</Link>
          </div>
          <div className="footer-contact-info">
            <h4>Contact Us</h4>
            <p style={{ display: 'flex', alignItems: 'flex-start', gap: '8px' }}>
              <MapPin size={16} style={{ color: '#16a34a', flexShrink: 0, marginTop: '3px' }} />
              <span>Baghpat, Uttar Pradesh</span>
            </p>
            <p style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Phone size={16} style={{ color: '#16a34a', flexShrink: 0 }} />
              <span>
                <a href="tel:+919310856385">+91 93108 56385</a> &bull;{' '}
                <a href="tel:+917827257887">+91 78272 57887</a>
              </span>
            </p>
            <p style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Mail size={16} style={{ color: '#16a34a', flexShrink: 0 }} />
              <span>
                <a href="mailto:care@jseco.in">care@jseco.in</a> &bull;{' '}
                <a href="mailto:imran@jseco.in">imran@jseco.in</a>
              </span>
            </p>
            <p style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Clock size={16} style={{ color: '#16a34a', flexShrink: 0 }} />
              <span>Mon – Sat: 8AM – 7PM</span>
            </p>
          </div>
          <div className="footer-whatsapp">
            <h4>Quick Inquiry</h4>
            <p>Need ELV pickup or circular recovery support? Message us instantly.</p>
            <a 
              href="https://wa.me/919310856385?text=Hi%2C%20I%20want%20to%20sell%20scrap" 
              target="_blank" 
              rel="noopener noreferrer" 
              className="btn-whatsapp small"
            >
              <svg width="16" height="16" viewBox="0 0 32 32" fill="white">
                <path d="M16 0C7.164 0 0 7.163 0 16c0 2.822.736 5.476 2.027 7.782L0 32l8.418-2.003A15.93 15.93 0 0016 32c8.836 0 16-7.163 16-16S24.836 0 16 0zm0 29.333a13.27 13.27 0 01-6.78-1.853l-.487-.29-5.004 1.191 1.23-4.869-.317-.5A13.254 13.254 0 012.667 16C2.667 8.636 8.636 2.667 16 2.667S29.333 8.636 29.333 16 23.364 29.333 16 29.333zm7.27-9.965c-.398-.2-2.355-1.163-2.72-1.295-.366-.133-.632-.2-.898.2-.266.4-1.032 1.295-1.265 1.562-.233.266-.466.3-.864.1-.398-.2-1.681-.62-3.202-1.978-1.183-1.057-1.982-2.362-2.214-2.762-.233-.4-.025-.616.175-.815.18-.18.398-.466.598-.7.2-.233.266-.4.398-.666.133-.266.067-.5-.033-.7-.1-.2-.898-2.163-1.23-2.962-.325-.779-.655-.673-.898-.685-.233-.012-.5-.015-.765-.015-.266 0-.7.1-1.065.5-.366.4-1.398 1.366-1.398 3.33 0 1.963 1.432 3.862 1.632 4.129.2.266 2.82 4.308 6.832 6.036.955.413 1.7.659 2.28.844.958.305 1.83.262 2.52.159.769-.115 2.355-.963 2.688-1.893.333-.93.333-1.727.233-1.893-.1-.166-.366-.266-.765-.466z"/>
              </svg>
              Chat on WhatsApp
            </a>
          </div>
        </div>
        <div className="footer-bottom">
          <p>&copy; {new Date().getFullYear()} JSECO. M/S Royal Motors Facility.</p>
        </div>
      </footer>
      <RvsfFloatingBadge />
    </div>
  );
}
