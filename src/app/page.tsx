'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import Logo from '@/components/Logo';
import { WHITELISTED_PINCODES, calculateSolarDetails } from '@/lib/utils/solarConstants';
import { 
  Sun, 
  Building2, 
  ChevronRight, 
  Zap, 
  Moon, 
  MessageSquareCode,
  Check,
  Star,
  Phone,
  MapPin,
  Sparkles,
  ChevronLeft,
  Wrench,
  Briefcase,
  X,
  Menu
} from 'lucide-react';

function CallbackMicroForm() {
  const [phone, setPhone] = useState('');
  const [status, setStatus] = useState<'idle' | 'submitting' | 'success' | 'error'>('idle');
  const [error, setError] = useState('');
  const [leadId, setLeadId] = useState('');
  const [timeLeft, setTimeLeft] = useState(60);

  useEffect(() => {
    if (status !== 'success') return;
    if (timeLeft <= 0) return;
    const timer = setTimeout(() => {
      setTimeLeft(prev => prev - 1);
    }, 1000);
    return () => clearTimeout(timer);
  }, [status, timeLeft]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (phone.length < 10) {
      setError('Please enter a valid 10-digit phone number.');
      return;
    }

    setStatus('submitting');

    try {
      const response = await fetch('/api/booking', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: "Callback Request",
          email: `callback-${phone}@prisha-lead.in`,
          phone: phone,
          pincode: "400710", // Whitelisted HQ pincode
          exclusiveRooftop: true,
          sufficientArea: true,
          billAmount: 3000,
          systemSize: 2.5,
          estimatedCost: 150000,
          subsidy: 69000,
          netCost: 81000
        })
      });

      const data = await response.json();
      if (response.ok) {
        setLeadId(data.leadId || `PE-${Math.floor(100000 + Math.random() * 900000)}`);
        setStatus('success');
        setTimeLeft(60);
      } else {
        console.warn("API error response, running fallback WhatsApp concierge redirect:", data.error);
        triggerWhatsAppFallback();
      }
    } catch (err) {
      console.error("Fetch/Database offline, running fallback WhatsApp concierge redirect:", err);
      triggerWhatsAppFallback();
    }
  };

  const triggerWhatsAppFallback = () => {
    setStatus('success');
    setTimeLeft(60);
    setTimeout(() => {
      window.open(
        `https://wa.me/918879422548?text=Hi%20Prisha%20Enterprises,%20I%20am%20requesting%20an%20immediate%20callback%20in%2060%20seconds.%20Phone:%20%2B91%20${phone}.`,
        '_blank'
      );
    }, 1000);
  };

  if (status === 'success') {
    return (
      <div style={{ background: 'var(--primary-light)', border: '1.5px solid var(--secondary)', padding: '20px', borderRadius: '12px', maxWidth: '500px', margin: '0 auto', textAlign: 'center' }}>
        <h4 style={{ fontSize: '18px', fontWeight: 800, color: 'var(--primary)', marginBottom: '8px' }}>
          ☎️ Callback Requested!
        </h4>
        <p style={{ fontSize: '13.5px', color: 'var(--text-muted)', lineHeight: 1.5, marginBottom: '14px' }}>
          Your phone has been secured. Lead ID: <strong>{leadId || 'PE-CALLBACK'}</strong>. Our automated system has notified Parag Yadav.
        </p>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', background: '#FFFFFF', padding: '8px 16px', borderRadius: '30px', border: '1px solid var(--border)', fontSize: '14px', fontWeight: 700, color: 'var(--primary)' }}>
          <span>Calling you in:</span>
          <span style={{ color: '#EF4444', minWidth: '30px' }}>{timeLeft}s</span>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} style={{ maxWidth: '500px', margin: '0 auto' }}>
      <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
        <div style={{ flex: 1, minWidth: '240px', position: 'relative' }}>
          <span style={{ position: 'absolute', left: '16px', top: '13px', color: 'var(--text-muted)', fontSize: '14px', fontWeight: 600 }}>+91</span>
          <input 
            type="tel" 
            className="form-input" 
            style={{ paddingLeft: '50px', height: '46px' }}
            placeholder="98765 43210"
            value={phone}
            onChange={(e) => setPhone(e.target.value.replace(/\D/g, '').slice(0, 10))}
            required
            disabled={status === 'submitting'}
          />
        </div>
        <button 
          type="submit" 
          className="btn btn-primary" 
          style={{ height: '46px', padding: '0 24px', fontSize: '14px', fontWeight: 700 }}
          disabled={status === 'submitting' || phone.length < 10}
        >
          {status === 'submitting' ? 'Requesting...' : 'Callback in 60s'}
        </button>
      </div>
      {error && (
        <div style={{ color: '#EF4444', fontSize: '12.5px', marginTop: '8px', fontWeight: 500, textAlign: 'left', paddingLeft: '4px' }}>
          {error}
        </div>
      )}
    </form>
  );
}

export default function Home() {
  const [theme, setTheme] = useState<'light' | 'dark'>('light');
  const [billRange, setBillRange] = useState('2500-4000');
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  
  // Before & After Slider State
  const [sliderPosition, setSliderPosition] = useState(50);
  const [isDragging, setIsDragging] = useState(false);
  const sliderContainerRef = useRef<HTMLDivElement>(null);

  // Stepper State
  const [activeStep, setActiveStep] = useState(1);

  const handleSliderMove = (clientX: number) => {
    if (!sliderContainerRef.current) return;
    const rect = sliderContainerRef.current.getBoundingClientRect();
    const x = clientX - rect.left;
    const percentage = Math.max(0, Math.min(100, (x / rect.width) * 100));
    setSliderPosition(percentage);
  };

  useEffect(() => {
    if (!isDragging) return;
    
    const handleMouseMove = (e: MouseEvent) => {
      handleSliderMove(e.clientX);
    };
    
    const handleTouchMove = (e: TouchEvent) => {
      if (e.touches.length > 0) {
        handleSliderMove(e.touches[0].clientX);
      }
    };
    
    const handleUp = () => {
      setIsDragging(false);
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('touchmove', handleTouchMove);
    window.addEventListener('mouseup', handleUp);
    window.addEventListener('touchend', handleUp);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('touchmove', handleTouchMove);
      window.removeEventListener('mouseup', handleUp);
      window.removeEventListener('touchend', handleUp);
    };
  }, [isDragging]);

  const steps = [
    {
      id: 1,
      label: 'Site Survey',
      title: 'Free Site Audit & Solar Capacity Evaluation',
      desc: 'Our certified engineers visit your property in Navi Mumbai or Thane to perform a physical roof audit. We assess roof load capabilities, shadow profiles, and evaluate your historical electricity billing data to design the optimal solar generation system.',
      duration: 'Duration: 1 - 2 Days',
      action: 'Schedule Free Visit',
      link: '/residential',
      icon: <MapPin size={24} />
    },
    {
      id: 2,
      label: 'Engineering & Design',
      title: 'Custom Engineering & Cyclone-Proof 3D CAD Layouts',
      desc: 'We design your custom system. Using professional CAD software, we map panel coordinates and engineer heavy-duty hot-dip galvanized steel mounting structures certified to withstand coastal wind speeds up to 150+ km/h.',
      duration: 'Engineering Phase',
      action: 'View Commercial Formats',
      link: '/commercial',
      icon: <Wrench size={24} />
    },
    {
      id: 3,
      label: 'NOC & Subsidy Lock',
      title: 'MNRE/DISCOM NOC Clearances & Government Subsidy Lock',
      desc: 'We manage the complete administrative pipeline. We submit net-metering approvals to MSEDCL/DISCOM and secure your PM Surya Ghar Muft Bijli Yojana subsidy allocation (up to ₹78,000) directly to your account.',
      duration: 'Hassle-Free Processing',
      action: 'Calculate Savings',
      link: '/residential',
      icon: <Building2 size={24} />
    },
    {
      id: 4,
      label: 'Procurement & Install',
      title: 'BIS & MNRE Approved Procurement & Physical Installation',
      desc: 'Prisha Enterprises procures high-generation ALMM-listed monocrystalline solar modules and Tier-1 smart grid-tie inverters. Our certified in-house engineering team carries out complete structural assembly and safety integration.',
      duration: 'Duration: 3 - 5 Days',
      action: 'Read Customer Reviews',
      link: '#testimonials',
      icon: <Zap size={24} />
    },
    {
      id: 5,
      label: 'Grid Sync & Handover',
      title: 'Net-Meter Synchronization, Safety Auditing, & Go-Live',
      desc: 'Following DISCOM inspection, we install the bi-directional net meter, run complete safety tests, and synchronize your solar grid. We hand over generation tracking logins, lifetime warranties, and start your support cycle.',
      duration: 'Go-Live Day',
      action: 'Contact Concierge Support',
      link: 'https://wa.me/918879422548',
      icon: <Sparkles size={24} />
    }
  ];
  
  // Lead popup states
  const [showPopup, setShowPopup] = useState(false);
  const [popupName, setPopupName] = useState('');
  const [popupPincode, setPopupPincode] = useState('');
  const [popupPhone, setPopupPhone] = useState('');
  const [popupBill, setPopupBill] = useState('2500-4000');
  const [popupPinError, setPopupPinError] = useState('');
  const [popupPhoneError, setPopupPhoneError] = useState('');
  const [popupAlert, setPopupAlert] = useState<{ type: 'error' | 'success' | 'info'; text: string } | null>(null);
  const [popupStep, setPopupStep] = useState(1);
  const [popupLeadId, setPopupLeadId] = useState('');
  const [isPopupSubmitting, setIsPopupSubmitting] = useState(false);
  
  // Carousel States
  const [activeSlide, setActiveSlide] = useState(0);
  const slides = [
    {
      type: 'form',
      title: 'Book a FREE Consultation',
      desc: 'Get custom system appraisals and learn about the ₹78,000 subsidy.'
    },
    {
      type: 'image',
      src: '/solar_panel_home.png',
      alt: 'Residential Solar Installation',
      caption: 'Secured Premium Residential Solar System'
    },
    {
      type: 'image',
      src: '/commercial_solar_grid.png',
      alt: 'Commercial Solar Installation',
      caption: 'High-Load Commercial Industrial Solar Arrays'
    }
  ];

  // Target Audience Carousel State
  const [activeAudience, setActiveAudience] = useState(0);
  const audienceSlides = [
    {
      title: 'Urban Homeowners & Bungalows',
      tagline: 'Slash high-tier residential bills to zero under PM Surya Ghar',
      desc: 'Specifically designed for families in Navi Mumbai & Thane living in independent homes or row-houses. With residential electricity rates reaching peak slabs, our custom-engineered systems completely offset your utility bills. Government subsidies cover the system setup, and your savings cover any EMI financing.',
      src: '/happy_family_solar.png',
      link: '/residential',
      btnText: 'Calculate Residential Savings',
      metrics: [
        { label: 'Direct Government Subsidy', val: '₹78,000' },
        { label: 'Average Payback Period', val: '4.2 Years' },
        { label: 'Reduction in Monthly Bills', val: 'Up to 100%' },
        { label: 'Structural Wind Certification', val: '150+ km/h' }
      ]
    },
    {
      title: 'Cooperative Housing Societies',
      tagline: 'Reduce common area maintenance charges for all residents',
      desc: 'Ideal for multi-family apartment buildings with shared rooftops. Power lifts, water pumps, corridor lighting, and common security systems using clean solar grids. Prisha Enterprises manages the complete DISCOM synchronization, net-metering approvals, and society NOC compliance in-house.',
      src: '/society_solar_roof.png',
      link: '/commercial?mode=society',
      btnText: 'Propose Housing Society Grid',
      metrics: [
        { label: 'Common Area Savings', val: '40% - 60%' },
        { label: 'Government Subsidy Allowance', val: '₹18,000 / kW' },
        { label: 'Financing Infrastructure Option', val: 'OPEX / RESCO' },
        { label: 'Engineering Blueprints Included', val: '100% Free' }
      ]
    },
    {
      title: 'SMEs & Commercial Operations',
      tagline: 'Write off 40% accelerated tax depreciation & cut peak tariffs',
      desc: 'Enable your business, workshop, warehouse, or office to hedge against commercial electricity tariffs. Commercial solar grids provide substantial operational cost savings, absolute security against utility power hikes, and significant corporate tax advantages through accelerated depreciation rules.',
      src: '/commercial_solar_grid.png',
      link: '/commercial',
      btnText: 'Request Commercial Solar Bid',
      metrics: [
        { label: 'Accelerated Tax Depreciation', val: '40% Year 1' },
        { label: 'Peak Commercial Tariff Hedge', val: '100% Secure' },
        { label: 'Financing Models Supported', val: 'CAPEX & OPEX' },
        { label: 'DISCOM NOC Clearance Time', val: '14 Days' }
      ]
    }
  ];

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  // Autoplay audience benefits carousel (every 8 seconds)
  useEffect(() => {
    const timer = setInterval(() => {
      setActiveAudience((prev) => (prev + 1) % audienceSlides.length);
    }, 8000);
    return () => clearInterval(timer);
  }, [audienceSlides.length]);

  // Autoplay carousel slides (every 6 seconds)
  useEffect(() => {
    const timer = setInterval(() => {
      setActiveSlide((prev) => (prev + 1) % slides.length);
    }, 6000);
    return () => clearInterval(timer);
  }, [slides.length]);

  // Scroll + Timer Trigger for Consultation Lead Popup
  useEffect(() => {
    const dismissed = sessionStorage.getItem('lead_popup_dismissed');
    if (dismissed === 'true') return;

    let hasScrolled = false;
    let timeElapsed = false;

    const showIfReady = () => {
      if (hasScrolled && timeElapsed) {
        setShowPopup(true);
        window.removeEventListener('scroll', handleScroll);
      }
    };

    const handleScroll = () => {
      if (window.scrollY > 200) {
        hasScrolled = true;
        showIfReady();
      }
    };

    const timer = setTimeout(() => {
      timeElapsed = true;
      showIfReady();
    }, 5000); // Trigger after 5 seconds of page mount once scrolled

    window.addEventListener('scroll', handleScroll, { passive: true });

    return () => {
      window.removeEventListener('scroll', handleScroll);
      clearTimeout(timer);
    };
  }, []);

  const handlePopupSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!popupName || !popupPhone || !popupPincode) return;

    if (!WHITELISTED_PINCODES.includes(popupPincode)) {
      setPopupPinError('Sorry! We do not currently serve this area. Whitelisted Navi Mumbai/Thane only.');
      return;
    }

    if (popupPhone.length < 10) {
      setPopupPhoneError('Phone number must be exactly 10 digits.');
      return;
    }

    setIsPopupSubmitting(true);
    setPopupAlert(null);

    // Map bill to numeric amount
    let billAmount = 3000;
    switch (popupBill) {
      case '<1500': billAmount = 1000; break;
      case '1500-2500': billAmount = 2000; break;
      case '2500-4000': billAmount = 3000; break;
      case '4000-8000': billAmount = 6000; break;
      case '>8000': billAmount = 10000; break;
    }

    const calc = calculateSolarDetails(billAmount);

    try {
      const response = await fetch('/api/booking', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: popupName,
          email: `${popupName.replace(/[^a-zA-Z0-9]/g, '').toLowerCase() || 'user'}@prisha-lead.in`,
          phone: popupPhone,
          pincode: popupPincode,
          exclusiveRooftop: true,
          sufficientArea: true,
          billAmount,
          systemSize: calc.recommendedCapacitykW,
          estimatedCost: calc.estimatedCost,
          subsidy: calc.subsidy,
          netCost: calc.netCost
        })
      });

      const data = await response.json();
      if (response.ok) {
        setPopupLeadId(data.leadId || `PE-${Math.floor(100000 + Math.random() * 900000)}`);
        setPopupStep(2);
        sessionStorage.setItem('lead_popup_dismissed', 'true');
      } else {
        setPopupAlert({
          type: 'error',
          text: data.error || "Submission failed. Please try again."
        });
      }
    } catch (err) {
      console.error(err);
      setPopupAlert({
        type: 'info',
        text: "Database offline. Re-routing directly to verified Concierge WhatsApp..."
      });
      setTimeout(() => {
        window.location.href = `https://wa.me/918879422548?text=Hi%20Prisha%20Enterprises,%20I'd%20like%20to%20book%20a%20free%20solar%20consultation.%20Name:%20${popupName},%20Phone:%20${popupPhone},%20PIN:%20${popupPincode},%20Bill:%20${popupBill}`;
      }, 3000);
    } finally {
      setIsPopupSubmitting(false);
    }
  };

  const toggleTheme = () => {
    setTheme(prev => prev === 'light' ? 'dark' : 'light');
  };

  const handlePrevSlide = () => {
    setActiveSlide((prev) => (prev - 1 + slides.length) % slides.length);
  };

  const handleNextSlide = () => {
    setActiveSlide((prev) => (prev + 1) % slides.length);
  };

  return (
    <div className="min-h-screen flex flex-col" style={{ background: 'var(--background)', color: 'var(--foreground)', overflowX: 'hidden' }}>
      {/* Premium Header */}
      <header className="sticky top-0 z-50 animate-fade-in-up" style={{ background: 'rgba(255, 255, 255, 0.9)', backdropFilter: 'blur(12px)', borderBottom: '1px solid var(--border)', padding: '14px 0', position: 'sticky', top: 0 }}>
        <div className="container" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Link href="/" style={{ textDecoration: 'none', display: 'block' }}>
            <Logo lightMode={theme === 'light'} size="sm" />
          </Link>
          
          <nav style={{ display: 'flex', alignItems: 'center', gap: '20px' }} className="nav-desktop-only">
            <Link href="/residential" className="header-nav-link">Residential Solar</Link>
            <Link href="/commercial" className="header-nav-link">Commercial B2B</Link>
            <Link href="/admin" className="header-nav-link">Admin Panel</Link>
          </nav>

          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <button 
              onClick={toggleTheme}
              className="btn btn-secondary" 
              style={{ padding: '8px', borderRadius: '50%', width: '38px', height: '38px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
              aria-label="Toggle theme"
            >
              {theme === 'light' ? <Moon size={18} /> : <Sun size={18} />}
            </button>
            <Link href="/residential" className="btn btn-primary nav-desktop-only" style={{ fontSize: '13px', padding: '10px 20px' }}>
              Schedule Free Visit
            </Link>
            <button 
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="btn btn-secondary nav-mobile-toggle-btn"
              style={{ padding: '8px', borderRadius: '50%', width: '38px', height: '38px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
              aria-label="Toggle mobile menu"
            >
              {isMobileMenuOpen ? <X size={18} /> : <Menu size={18} />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation Dropdown Menu */}
        {isMobileMenuOpen && (
          <div 
            style={{ 
              background: 'var(--card-bg)', 
              borderTop: '1px solid var(--border)', 
              padding: '16px 24px 8px 24px', 
              display: 'flex', 
              flexDirection: 'column', 
              gap: '4px',
              marginTop: '14px'
            }}
            className="animate-fade-in-up"
          >
            <Link href="/residential" className="header-nav-link" style={{ padding: '12px', fontSize: '14.5px', fontWeight: 600, display: 'block', borderBottom: '1px solid var(--border)' }} onClick={() => setIsMobileMenuOpen(false)}>Residential Solar</Link>
            <Link href="/commercial" className="header-nav-link" style={{ padding: '12px', fontSize: '14.5px', fontWeight: 600, display: 'block', borderBottom: '1px solid var(--border)' }} onClick={() => setIsMobileMenuOpen(false)}>Commercial B2B</Link>
            <Link href="/admin" className="header-nav-link" style={{ padding: '12px', fontSize: '14.5px', fontWeight: 600, display: 'block' }} onClick={() => setIsMobileMenuOpen(false)}>Admin Panel</Link>
          </div>
        )}
      </header>

      {/* Split Hero Section */}
      <section style={{ padding: '80px 0 100px 0', position: 'relative' }}>
        <div className="container hero-split-grid" style={{ display: 'grid', gridTemplateColumns: '1.1fr 0.9fr', gap: '60px', alignItems: 'center' }}>
          
          {/* Left Column: Value Proposition */}
          <div className="animate-fade-in-up delay-100" style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', background: 'var(--primary-light)', color: 'var(--primary)', padding: '6px 16px', borderRadius: '9999px', fontSize: '13px', fontWeight: 700, width: 'fit-content' }}>
              <Star size={14} fill="currentColor" style={{ color: '#F2A900' }} />
              <span>Rated ★ 4.8 on Google | Whitelisted Navi Mumbai Partner</span>
            </div>
            
            <h1 style={{ fontSize: 'clamp(2.5rem, 4.5vw, 3.8rem)', lineHeight: 1.15, fontWeight: 800 }}>
              Power Your Home with Solar at <span style={{ color: '#C5A55A', textDecoration: 'underline' }}>Zero Investment</span>
            </h1>
            
            <p style={{ fontSize: '17px', color: 'var(--text-muted)', maxWidth: '580px', lineHeight: 1.6 }}>
              Acquire up to <strong>₹78,000</strong> in direct subsidies under PM Surya Ghar Yojana. We manage engineering, licensing, and net-metering.
            </p>

            {/* Checkmark List */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', margin: '8px 0' }}>
              {[
                '10+ Years of Certified Engineering Excellence',
                'BIS & MNRE Approved Materials Only',
                'Secure Field-Level Encrypted DPDP Data Compliance',
                'Database Outage Failover Protection'
              ].map((text, idx) => (
                <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '14px', fontWeight: 600 }}>
                  <div style={{ width: '20px', height: '20px', borderRadius: '50%', background: '#F0F5F3', color: '#0F3B2E', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <Check size={12} strokeWidth={3} />
                  </div>
                  <span>{text}</span>
                </div>
              ))}
            </div>

            <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap', marginTop: '12px' }}>
              <Link href="/residential" className="btn btn-primary" style={{ padding: '14px 32px' }}>
                Calculate Savings <ChevronRight size={16} />
              </Link>
              <Link href="/commercial" className="btn btn-secondary" style={{ padding: '14px 32px' }}>
                Propose Society Grid
              </Link>
            </div>
          </div>

          {/* Right Column: Premium Auto-Play Carousel */}
          <div className="animate-fade-in-up delay-200" style={{ position: 'relative', width: '100%', height: '420px' }}>
            {/* Nav Arrows */}
            <button 
              onClick={handlePrevSlide} 
              style={{ position: 'absolute', left: '-20px', top: '50%', transform: 'translateY(-50%)', zIndex: 10, width: '40px', height: '40px', borderRadius: '50%', background: '#FFFFFF', border: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', boxShadow: 'var(--shadow-sm)' }}
              aria-label="Previous slide"
            >
              <ChevronLeft size={20} />
            </button>
            <button 
              onClick={handleNextSlide} 
              style={{ position: 'absolute', right: '-20px', top: '50%', transform: 'translateY(-50%)', zIndex: 10, width: '40px', height: '40px', borderRadius: '50%', background: '#FFFFFF', border: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', boxShadow: 'var(--shadow-sm)' }}
              aria-label="Next slide"
            >
              <ChevronRight size={20} />
            </button>

            {/* Slide Container */}
            <div style={{ width: '100%', height: '100%', overflow: 'hidden', borderRadius: 'var(--radius)', border: '1px solid var(--border)', boxShadow: 'var(--shadow-xl)', background: '#FFFFFF', position: 'relative' }}>
              {slides.map((slide, idx) => {
                const isActive = idx === activeSlide;
                return (
                  <div 
                    key={idx} 
                    style={{ 
                      position: 'absolute', 
                      top: 0, 
                      left: 0, 
                      width: '100%', 
                      height: '100%', 
                      opacity: isActive ? 1 : 0, 
                      transform: isActive ? 'scale(1)' : 'scale(0.98)',
                      transition: 'opacity 0.6s cubic-bezier(0.16, 1, 0.3, 1), transform 0.6s cubic-bezier(0.16, 1, 0.3, 1)',
                      zIndex: isActive ? 2 : 1,
                      pointerEvents: isActive ? 'all' : 'none'
                    }}
                  >
                    {slide.type === 'form' ? (
                      <div style={{ padding: '36px', display: 'flex', flexDirection: 'column', height: '100%', justifyContent: 'center' }}>
                        <h3 style={{ fontSize: '20px', fontWeight: 700, marginBottom: '8px', color: 'var(--primary)' }}>{slide.title}</h3>
                        <p style={{ fontSize: '13.5px', color: 'var(--text-muted)', marginBottom: '24px' }}>{slide.desc}</p>
                        
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                          <div>
                            <label style={{ fontSize: '12px', fontWeight: 700, textTransform: 'uppercase', color: 'var(--foreground)', display: 'block', marginBottom: '8px' }}>
                              Average Monthly Electricity Bill
                            </label>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                              {[
                                { value: '<1500', label: 'Less than ₹1,500' },
                                { value: '1500-2500', label: '₹1,500 - ₹2,500' },
                                { value: '2500-4000', label: '₹2,500 - ₹4,000' },
                                { value: '4000-8000', label: '₹4,000 - ₹8,000' }
                              ].map((opt) => (
                                <button
                                  key={opt.value}
                                  type="button"
                                  className={`grid-select-button ${billRange === opt.value ? 'active' : ''}`}
                                  onClick={() => setBillRange(opt.value)}
                                >
                                  {opt.label}
                                </button>
                              ))}
                            </div>
                          </div>
                          <Link href={`/residential?billRange=${billRange}`} className="btn btn-gold" style={{ width: '100%', padding: '14px', fontSize: '14px' }}>
                            Verify & Calculate Savings
                          </Link>
                        </div>
                      </div>
                    ) : (
                      <div style={{ position: 'relative', width: '100%', height: '100%' }}>
                        <Image 
                          src={slide.src || ''} 
                          alt={slide.alt || ''} 
                          fill
                          sizes="(max-width: 768px) 100vw, 50vw"
                          style={{ objectFit: 'cover' }}
                          priority={idx === 1}
                        />
                        {/* Caption Overlay */}
                        <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, padding: '20px', background: 'linear-gradient(transparent, rgba(9, 46, 32, 0.8))', color: '#FFFFFF' }}>
                          <span className="gold-badge" style={{ marginBottom: '8px', color: '#FFFFFF', borderColor: 'var(--secondary)' }}>Project Portfolio</span>
                          <p style={{ fontSize: '14px', fontWeight: 600 }}>{slide.caption}</p>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Slide Dots Indicator */}
            <div style={{ display: 'flex', justifyContent: 'center', gap: '8px', marginTop: '16px' }}>
              {slides.map((_, idx) => (
                <button
                  key={idx}
                  onClick={() => setActiveSlide(idx)}
                  style={{
                    width: '8px',
                    height: '8px',
                    borderRadius: '50%',
                    background: idx === activeSlide ? 'var(--primary)' : 'var(--border)',
                    border: 'none',
                    cursor: 'pointer',
                    transition: 'background-color 0.2s ease'
                  }}
                  aria-label={`Go to slide ${idx + 1}`}
                />
              ))}
            </div>
          </div>

        </div>
      </section>

      {/* Services Section */}
      <section className="animate-fade-in-up delay-300" style={{ padding: '80px 0', borderTop: '1px solid var(--border)', background: '#FFFFFF' }}>
        <div className="container">
          <div style={{ textAlign: 'center', marginBottom: '50px' }}>
            <h2 style={{ fontSize: '30px', fontWeight: 700, marginBottom: '8px' }}>Our Core Competencies</h2>
            <div style={{ fontSize: '14px', color: 'var(--secondary)', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: '12px' }}>
              Innovative Solutions &bull; Sustainable Growth &bull; Reliable Support
            </div>
            <p style={{ color: 'var(--text-muted)', maxWidth: '650px', margin: '0 auto', fontSize: '14.5px' }}>Secured electrical, solar, and industrial contracting solutions designed to yield maximum lifetime output.</p>
          </div>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
            gap: '24px'
          }}>
            {[
              { title: 'Solar Solutions', icon: <Sun size={24} />, desc: 'Expert on-grid net-metering and PM Surya Ghar setups.' },
              { title: 'Electrical Contracting', icon: <Zap size={24} />, desc: 'High-voltage systems, panels, industrial utility cabling.' },
              { title: 'Project Management', icon: <Building2 size={24} />, desc: 'A-to-Z execution from topography study to DISCOM clearance.' },
              { title: 'Operations & Maintenance', icon: <Wrench size={24} />, desc: 'Predictive performance audits, thermal imaging, automated panel cleaning.' },
              { title: 'Business Solutions', icon: <Briefcase size={24} />, desc: 'Commercial energy audits, custom PPA modeling, and CAPEX/OPEX consulting.' }
            ].map((s, idx) => (
              <div key={idx} className="card" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div style={{ color: 'var(--primary)', width: '48px', height: '48px', borderRadius: '8px', background: 'var(--primary-light)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  {s.icon}
                </div>
                <h3 style={{ fontSize: '18px', fontWeight: 700 }}>{s.title}</h3>
                <p style={{ fontSize: '13.5px', color: 'var(--text-muted)', lineHeight: 1.5 }}>{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Who Benefits the Most Carousel Section */}
      <section style={{ padding: '80px 0', background: 'var(--background)', borderTop: '1px solid var(--border)' }} className="animate-fade-in-up delay-300">
        <div className="container">
          
          <div style={{ textAlign: 'center', marginBottom: '45px' }}>
            <h2 style={{ fontSize: '30px', fontWeight: 700, marginBottom: '8px' }}>Who Benefits the Most?</h2>
            <div style={{ fontSize: '14px', color: 'var(--secondary)', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: '12px' }}>
              Tailored Solutions &bull; Maximum Savings &bull; ROI-Driven Design
            </div>
            <p style={{ color: 'var(--text-muted)', maxWidth: '650px', margin: '0 auto', fontSize: '14.5px' }}>
              Rooftop solar yields the highest financial return for specific high-tariff segments in Navi Mumbai & Thane. Select a category below to see your benefit.
            </p>
          </div>

          {/* Interactive Tabs Header */}
          <div style={{ 
            display: 'flex', 
            justifyContent: 'center', 
            gap: '12px', 
            marginBottom: '40px',
            flexWrap: 'wrap'
          }}>
            {audienceSlides.map((slide, idx) => (
              <button
                key={idx}
                onClick={() => setActiveAudience(idx)}
                style={{
                  padding: '12px 24px',
                  borderRadius: '30px',
                  fontWeight: 700,
                  fontSize: '14px',
                  border: '1px solid var(--border)',
                  background: activeAudience === idx ? 'var(--primary)' : '#FFFFFF',
                  color: activeAudience === idx ? '#FFFFFF' : 'var(--text-muted)',
                  cursor: 'pointer',
                  boxShadow: activeAudience === idx ? 'var(--shadow-md)' : 'none',
                  transition: 'all 0.3s cubic-bezier(0.16, 1, 0.3, 1)'
                }}
                className={activeAudience === idx ? '' : 'tab-inactive-hover'}
              >
                {idx === 0 ? '🏡 Homeowners' : idx === 1 ? '🏢 Housing Societies' : '🏭 Commercial/SMEs'}
              </button>
            ))}
          </div>

          {/* Tab Content Card (Interactive Carousel) */}
          <div className="card hero-split-grid" style={{ 
            padding: '0', 
            overflow: 'hidden', 
            display: 'grid', 
            gridTemplateColumns: '1.2fr 1fr',
            minHeight: '440px',
            border: '1px solid var(--border)'
          }}>
            
            {/* Left Column: Image with smooth cross-fade transition */}
            <div style={{ position: 'relative', width: '100%', minHeight: '320px', background: '#e5e7eb' }}>
              {audienceSlides.map((slide, idx) => {
                const isActive = idx === activeAudience;
                return (
                  <div
                    key={idx}
                    style={{
                      position: 'absolute',
                      top: 0,
                      left: 0,
                      width: '100%',
                      height: '100%',
                      opacity: isActive ? 1 : 0,
                      transition: 'opacity 0.6s cubic-bezier(0.16, 1, 0.3, 1)',
                      zIndex: isActive ? 2 : 1,
                      pointerEvents: isActive ? 'all' : 'none'
                    }}
                  >
                    <img 
                      src={slide.src} 
                      alt={slide.title} 
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                    />
                    <div style={{
                      position: 'absolute',
                      top: 0, left: 0, right: 0, bottom: 0,
                      background: 'linear-gradient(transparent, rgba(9, 46, 32, 0.2))'
                    }} />
                  </div>
                );
              })}
            </div>

            {/* Right Column: Detailed Value Proposition */}
            <div style={{ padding: '40px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', gap: '24px' }}>
              {audienceSlides.map((slide, idx) => {
                const isActive = idx === activeAudience;
                return (
                  <div
                    key={idx}
                    style={{
                      display: isActive ? 'flex' : 'none',
                      flexDirection: 'column',
                      gap: '20px'
                    }}
                  >
                    <div>
                      <span style={{ 
                        fontSize: '11px', 
                        fontWeight: 800, 
                        color: 'var(--secondary)', 
                        textTransform: 'uppercase', 
                        letterSpacing: '0.15em',
                        display: 'block',
                        marginBottom: '6px'
                      }}>
                        Target Audience Profile
                      </span>
                      <h3 style={{ fontSize: '24px', fontWeight: 800, color: 'var(--primary)', lineHeight: 1.2 }}>{slide.title}</h3>
                      <p style={{ fontSize: '14px', fontWeight: 600, color: '#C5A55A', marginTop: '6px' }}>{slide.tagline}</p>
                    </div>

                    <p style={{ fontSize: '13.5px', color: 'var(--text-muted)', lineHeight: 1.6 }}>{slide.desc}</p>

                    {/* Metrics Grid */}
                    <div style={{
                      display: 'grid',
                      gridTemplateColumns: '1fr 1fr',
                      gap: '16px',
                      marginTop: '8px'
                    }}>
                      {slide.metrics.map((metric, mIdx) => (
                        <div key={mIdx} style={{ 
                          borderLeft: '2px solid var(--secondary)', 
                          paddingLeft: '10px' 
                        }}>
                          <div style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                            {metric.label}
                          </div>
                          <div style={{ fontSize: '18px', fontWeight: 800, color: 'var(--primary)', marginTop: '2px' }}>
                            {metric.val}
                          </div>
                        </div>
                      ))}
                    </div>

                    <div style={{ marginTop: '12px' }}>
                      <Link href={slide.link} className="btn btn-primary" style={{ padding: '12px 24px' }}>
                        {slide.btnText} <ChevronRight size={16} />
                      </Link>
                    </div>
                  </div>
                );
              })}
            </div>

          </div>

        </div>
      </section>

      {/* Before & After Interactive Slider Section */}
      <section className="animate-fade-in-up delay-300" style={{ padding: '80px 0', background: 'var(--background)', borderTop: '1px solid var(--border)' }}>
        <div className="container">
          <div style={{ textAlign: 'center', marginBottom: '45px' }}>
            <span style={{ fontSize: '11px', fontWeight: 800, color: 'var(--secondary)', textTransform: 'uppercase', letterSpacing: '0.15em', display: 'block', marginBottom: '6px' }}>
              Interactive Rooftop Preview
            </span>
            <h2 style={{ fontSize: '30px', fontWeight: 700, marginBottom: '12px' }}>
              Visualize Your Solar Transformation
            </h2>
            <p style={{ color: 'var(--text-muted)', maxWidth: '650px', margin: '0 auto', fontSize: '14.5px' }}>
              Drag the slider to see how Prisha Enterprises converts an empty rooftop into a high-yield solar generator.
            </p>
          </div>

          <div 
            ref={sliderContainerRef}
            style={{ 
              position: 'relative', 
              width: '100%', 
              maxWidth: '800px', 
              aspectRatio: '16/9', 
              margin: '0 auto', 
              borderRadius: '16px', 
              overflow: 'hidden', 
              boxShadow: 'var(--shadow-xl)', 
              border: '1px solid var(--border)',
              cursor: 'ew-resize',
              userSelect: 'none'
            }}
            onMouseDown={(e) => {
              e.preventDefault();
              setIsDragging(true);
              handleSliderMove(e.clientX);
            }}
            onTouchStart={(e) => {
              setIsDragging(true);
              if (e.touches.length > 0) {
                handleSliderMove(e.touches[0].clientX);
              }
            }}
          >
            {/* Before Image (Base) */}
            <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', pointerEvents: 'none' }}>
              <img 
                src="/empty_rooftop.png" 
                alt="Empty Rooftop Before Solar" 
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
              />
              <div style={{
                position: 'absolute',
                top: '20px',
                left: '20px',
                background: 'rgba(15, 59, 46, 0.95)',
                color: '#FFFFFF',
                padding: '6px 14px',
                borderRadius: '6px',
                fontSize: '12px',
                fontWeight: 700,
                backdropFilter: 'blur(4px)',
                border: '1px solid rgba(255,255,255,0.15)'
              }}>
                BEFORE (Empty Rooftop)
              </div>
            </div>

            {/* After Image Overlay with clip-path */}
            <div style={{ 
              position: 'absolute', 
              top: 0, 
              left: 0, 
              width: '100%', 
              height: '100%', 
              pointerEvents: 'none',
              clipPath: `inset(0 ${100 - sliderPosition}% 0 0)`,
              transition: isDragging ? 'none' : 'clip-path 0.2s cubic-bezier(0.16, 1, 0.3, 1)'
            }}>
              <img 
                src="/solar_installed_rooftop.png" 
                alt="Rooftop with Solar Installed After" 
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
              />
              <div style={{
                position: 'absolute',
                top: '20px',
                right: '20px',
                background: 'rgba(197, 165, 90, 0.95)',
                color: '#FFFFFF',
                padding: '6px 14px',
                borderRadius: '6px',
                fontSize: '12px',
                fontWeight: 700,
                backdropFilter: 'blur(4px)',
                border: '1px solid rgba(255,255,255,0.15)'
              }}>
                AFTER (Solar Installed)
              </div>
            </div>

            {/* Slider Drag Handle */}
            <div style={{
              position: 'absolute',
              top: 0,
              bottom: 0,
              left: `${sliderPosition}%`,
              width: '2px',
              background: '#FFFFFF',
              boxShadow: '0 0 10px rgba(0,0,0,0.5)',
              transform: 'translateX(-50%)',
              pointerEvents: 'none',
              transition: isDragging ? 'none' : 'left 0.2s cubic-bezier(0.16, 1, 0.3, 1)',
              zIndex: 10
            }}>
              <div style={{
                position: 'absolute',
                top: '50%',
                left: '50%',
                transform: 'translate(-50%, -50%)',
                width: '44px',
                height: '44px',
                borderRadius: '50%',
                background: '#FFFFFF',
                border: '3px solid var(--primary)',
                boxShadow: '0 4px 10px rgba(15, 59, 46, 0.25)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'var(--primary)',
                fontWeight: 700,
                fontSize: '18px'
              }}>
                ↔
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 5-Step Solar Installation Stepper Section */}
      <section className="animate-fade-in-up delay-300" style={{ padding: '80px 0', background: 'var(--secondary-light)', borderTop: '1px solid var(--border)' }}>
        <div className="container" style={{ maxWidth: '900px' }}>
          <div style={{ textAlign: 'center', marginBottom: '45px' }}>
            <span style={{ fontSize: '11px', fontWeight: 800, color: 'var(--secondary)', textTransform: 'uppercase', letterSpacing: '0.15em', display: 'block', marginBottom: '6px' }}>
              Step-by-Step Process
            </span>
            <h2 style={{ fontSize: '30px', fontWeight: 700, marginBottom: '12px' }}>
              Your Journey to Free Solar Power
            </h2>
            <p style={{ color: 'var(--text-muted)', maxWidth: '600px', margin: '0 auto', fontSize: '14.5px' }}>
              Click on each step below to understand how Prisha Enterprises manages your complete solar installation.
            </p>
          </div>

          {/* Stepper Progress Bar */}
          <div className="stepper-wrapper" style={{ position: 'relative', margin: '40px 0' }}>
            <div className="stepper-container">
              {/* Desktop background line */}
              <div className="stepper-line nav-desktop-only"></div>
              {/* Desktop active line */}
              <div 
                className="stepper-line-active nav-desktop-only" 
                style={{ width: `calc((100% - 50px) * ${(activeStep - 1) / 4})` }}
              ></div>

              {/* Mobile background line */}
              <div className="stepper-line-mobile mobile-only" style={{ display: 'none' }}></div>
              {/* Mobile active line */}
              <div 
                className="stepper-line-active-mobile mobile-only" 
                style={{ 
                  display: 'none',
                  height: `calc((100% - 50px) * ${(activeStep - 1) / 4})`
                }}
              ></div>

              {steps.map((s) => {
                const isActive = activeStep === s.id;
                const isCompleted = activeStep > s.id;
                return (
                  <div 
                    key={s.id} 
                    className={`step-item ${isActive ? 'active' : ''} ${isCompleted ? 'completed' : ''}`}
                    onClick={() => setActiveStep(s.id)}
                  >
                    <div className="step-circle">
                      {s.id}
                    </div>
                    <div className="step-label">
                      {s.label}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Stepper Step Details Card */}
          {steps.map((s) => {
            const isActive = activeStep === s.id;
            if (!isActive) return null;
            return (
              <div 
                key={s.id} 
                className="card animate-fade-in-up" 
                style={{ 
                  display: 'flex', 
                  flexDirection: 'column', 
                  gap: '24px', 
                  border: '1px solid var(--border)',
                  boxShadow: 'var(--shadow-lg)',
                  background: '#FFFFFF',
                  animationDuration: '0.4s'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                    <div style={{ 
                      color: 'var(--primary)', 
                      width: '56px', 
                      height: '56px', 
                      borderRadius: '12px', 
                      background: 'var(--primary-light)', 
                      display: 'flex', 
                      alignItems: 'center', 
                      justifyContent: 'center',
                      border: '1px solid var(--border)'
                    }}>
                      {s.icon}
                    </div>
                    <div>
                      <span className="gold-badge" style={{ fontSize: '11px', padding: '3px 8px', marginBottom: '4px' }}>
                        Step {s.id} of 5
                      </span>
                      <h3 style={{ fontSize: '20px', fontWeight: 800, color: 'var(--primary)', marginTop: '4px' }}>
                        {s.title}
                      </h3>
                    </div>
                  </div>
                  <span style={{ fontSize: '12.5px', fontWeight: 700, color: '#C5A55A', background: 'var(--secondary-light)', padding: '6px 14px', borderRadius: '20px', border: '1px solid rgba(197, 165, 90, 0.2)' }}>
                    {s.duration}
                  </span>
                </div>

                <p style={{ fontSize: '14.5px', color: 'var(--text-muted)', lineHeight: 1.6 }}>
                  {s.desc}
                </p>

                <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', borderTop: '1px solid var(--border)', paddingTop: '20px', marginTop: '4px' }}>
                  <Link href={s.link} className="btn btn-primary" style={{ padding: '10px 24px', fontSize: '13px' }}>
                    {s.action} <ChevronRight size={14} />
                  </Link>
                  {s.id < 5 ? (
                    <button onClick={() => setActiveStep(prev => prev + 1)} className="btn btn-secondary" style={{ padding: '10px 24px', fontSize: '13px' }}>
                      Next Step
                    </button>
                  ) : (
                    <button onClick={() => setActiveStep(1)} className="btn btn-secondary" style={{ padding: '10px 24px', fontSize: '13px' }}>
                      Restart Tour
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Why Trust Us Section */}
      <section className="animate-fade-in-up delay-400" style={{ padding: '80px 0', background: 'var(--secondary-light)', borderTop: '1px solid var(--border)' }}>
        <div className="container">
          <div style={{ textAlign: 'center', marginBottom: '50px' }}>
            <h2 style={{ fontSize: '30px', fontWeight: 700, marginBottom: '12px' }}>
              Why Homeowners Trust Prisha Enterprises
            </h2>
            <p style={{ color: 'var(--text-muted)', maxWidth: '600px', margin: '0 auto', fontSize: '14.5px' }}>
              We deliver visual transparency, engineering precision, and a seamless transition to clean solar energy.
            </p>
          </div>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
            gap: '30px'
          }}>
            {[
              {
                title: 'Guaranteed Subsidies',
                src: '/customer_consultation.png',
                desc: 'Direct integration with the PM Surya Ghar Yojana ensuring up to ₹78,000 in immediate government subsidy savings.'
              },
              {
                title: 'Zero Middlemen',
                src: '/installation_process.png',
                desc: 'We handle engineering blueprints, local discom licensing, grid net-metering, and testing in-house with zero subcontractors.'
              },
              {
                title: 'Cyclone-Proof Mounts',
                src: '/mount_structure.png',
                desc: 'Heavy-duty hot-dip galvanized steel mounting structures built and tested to withstand high coastal wind forces up to 150+ kmph.'
              },
              {
                title: 'Reliable Support',
                src: '/panel_maintenance.png',
                desc: 'Scheduled annual performance sweeps, thermal grid auditing, and 24/7 proprietor priority support for long-term generation.'
              }
            ].map((item, idx) => (
              <div key={idx} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}>
                <div style={{
                  width: '100%',
                  height: '180px',
                  position: 'relative',
                  borderRadius: '12px',
                  overflow: 'hidden',
                  boxShadow: 'var(--shadow-md)',
                  marginBottom: '16px',
                  border: '1px solid var(--border)'
                }}>
                  <img 
                    src={item.src} 
                    alt={item.title} 
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  />
                </div>
                <h3 style={{ fontSize: '18px', fontWeight: 700, marginBottom: '8px', color: 'var(--primary)' }}>
                  {item.title}
                </h3>
                <p style={{ fontSize: '13.5px', color: 'var(--text-muted)', lineHeight: 1.5, maxWidth: '280px' }}>
                  {item.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Case Studies Section */}
      <section className="animate-fade-in-up delay-400" style={{ padding: '80px 0', background: '#F9FAFB', borderTop: '1px solid var(--border)' }}>
        <div className="container">
          <div style={{ textAlign: 'center', marginBottom: '50px' }}>
            <h2 style={{ fontSize: '30px', fontWeight: 700, marginBottom: '12px' }}>
              Proven Savings: Case Studies in Navi Mumbai & Thane
            </h2>
            <div style={{ fontSize: '14px', color: 'var(--secondary)', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: '12px' }}>
              Real Results &bull; Verified Synchronization &bull; Guaranteed ROI
            </div>
            <p style={{ color: 'var(--text-muted)', maxWidth: '600px', margin: '0 auto', fontSize: '14.5px' }}>
              See how we've helped homeowners, societies, and businesses slash their monthly grid overhead.
            </p>
          </div>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
            gap: '30px'
          }}>
            {[
              {
                title: 'The Kulkarni Bungalow',
                location: 'Sector 8, Vashi',
                tag: 'Residential Solar',
                system: '5 kW On-Grid System',
                beforeBill: 6200,
                afterBill: 250,
                reduction: '96%',
                desc: 'Complete rooftop engineering with 10 high-efficiency mono-perc panels. Offset high-tier domestic slabs including 3 split AC units. Synchronized with MSEDCL net-metering in 14 days.'
              },
              {
                title: 'Ghansoli Heights CHS',
                location: 'Thane-Belapur Road, Ghansoli',
                tag: 'Society Grid',
                system: '15 kW Society Grid',
                beforeBill: 18500,
                afterBill: 4100,
                reduction: '78%',
                desc: 'Powering elevator motors, heavy water-booster pumps, and corridor safety lighting. Structured under a society OPEX model. Zero downtime during the transition process.'
              },
              {
                title: 'Mehta & Sons Warehouse',
                location: 'Kalwa Industrial Zone, Thane',
                tag: 'Commercial CAPEX',
                system: '12 kW Commercial Array',
                beforeBill: 14800,
                afterBill: 1200,
                reduction: '92%',
                desc: 'Hedged against commercial peak-tariff hours. Qualified for 40% accelerated tax depreciation benefits in Year 1. Solid structural wind load certified to 150+ km/h.'
              }
            ].map((cs, idx) => (
              <div key={idx} className="card" style={{ display: 'flex', flexDirection: 'column', gap: '16px', background: '#FFFFFF', border: '1px solid var(--border)', borderRadius: '12px', padding: '24px', transition: 'all 0.3s ease' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '11px', fontWeight: 800, color: 'var(--secondary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                    {cs.tag}
                  </span>
                  <span style={{ fontSize: '12px', fontWeight: 700, padding: '4px 8px', borderRadius: '4px', background: '#E6F4EA', color: '#137333' }}>
                    {cs.reduction} Reduction
                  </span>
                </div>
                <div>
                  <h3 style={{ fontSize: '19px', fontWeight: 800, color: 'var(--primary)', margin: 0 }}>{cs.title}</h3>
                  <div style={{ fontSize: '12.5px', color: 'var(--text-muted)', marginTop: '2px' }}>{cs.location}</div>
                </div>

                <div style={{ background: 'var(--primary-light)', padding: '6px 12px', borderRadius: '6px', fontSize: '13px', fontWeight: 700, color: 'var(--primary)', width: 'fit-content' }}>
                  ⚡ {cs.system}
                </div>

                {/* Before/After Bill Counter Visualizer */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', margin: '8px 0' }}>
                  {/* Before Box */}
                  <div style={{ background: '#FFF5F5', border: '1.5px solid #FEB2B2', borderRadius: '8px', padding: '12px', textAlign: 'center' }}>
                    <div style={{ fontSize: '10px', fontWeight: 700, color: '#C53030', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                      BEFORE BILL
                    </div>
                    <div style={{ fontSize: '18px', fontWeight: 800, color: '#C53030', textDecoration: 'line-through', marginTop: '2px' }}>
                      ₹{cs.beforeBill.toLocaleString('en-IN')}
                    </div>
                    <span style={{ fontSize: '10px', color: '#9B2C2C', fontWeight: 600 }}>per month</span>
                  </div>

                  {/* After Box */}
                  <div style={{ background: '#E6F4EA', border: '1.5px solid #9AE6B4', borderRadius: '8px', padding: '12px', textAlign: 'center' }}>
                    <div style={{ fontSize: '10px', fontWeight: 700, color: '#22543D', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                      AFTER SOLAR
                    </div>
                    <div style={{ fontSize: '18px', fontWeight: 800, color: '#22543D', marginTop: '2px' }}>
                      ₹{cs.afterBill.toLocaleString('en-IN')}
                    </div>
                    <span style={{ fontSize: '10px', color: '#276749', fontWeight: 600 }}>per month</span>
                  </div>
                </div>

                <p style={{ fontSize: '13.5px', color: 'var(--text-muted)', lineHeight: 1.5, flex: 1 }}>
                  {cs.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials (Happy Customers) Section */}
      <section id="testimonials" className="animate-fade-in-up delay-400" style={{ padding: '80px 0', background: '#FFFFFF', borderTop: '1px solid var(--border)' }}>
        <div className="container">
          <div style={{ textAlign: 'center', marginBottom: '50px' }}>
            <h2 style={{ fontSize: '30px', fontWeight: 700, marginBottom: '12px' }}>
              Trusted by Happy Homeowners
            </h2>
            <p style={{ color: 'var(--text-muted)', maxWidth: '600px', margin: '0 auto', fontSize: '14.5px' }}>
              Read genuine reviews from families across Navi Mumbai and Thane who switched to solar with us.
            </p>
          </div>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
            gap: '24px'
          }}>
            {[
              {
                name: 'Ramesh Shah',
                location: 'Ghansoli, Navi Mumbai',
                stars: 5,
                review: 'Prisha Enterprises made the subsidy process incredibly easy. I received my ₹78,000 central subsidy directly in my account within 30 days of grid synchronization. Mr. Parag and his team were highly professional!'
              },
              {
                name: 'Anjali Patil',
                location: 'Thane West',
                stars: 5,
                review: 'Excellent service and complete clarity. The cyclone-proof galvanized structures they installed are extremely robust and survived the recent monsoon heavy winds without a scratch. Highly satisfied.'
              },
              {
                name: 'Sunil Mehta',
                location: 'Vashi, Sector 17',
                stars: 5,
                review: 'Zero hassle, zero delays. They handled the entire net-metering coordination with MSEDCL in-house. My average monthly electricity bill dropped from ₹4,500 to almost zero. Best solar firm!'
              }
            ].map((t, idx) => (
              <div key={idx} className="card" style={{ display: 'flex', flexDirection: 'column', gap: '16px', border: '1px solid var(--border)' }}>
                <div style={{ display: 'flex', gap: '4px', color: '#F2A900' }}>
                  {[...Array(t.stars)].map((_, i) => (
                    <Star key={i} size={16} fill="currentColor" />
                  ))}
                </div>
                <p style={{ fontSize: '14px', color: 'var(--text-muted)', lineHeight: 1.6, fontStyle: 'italic', flex: 1 }}>
                  &ldquo;{t.review}&rdquo;
                </p>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', borderTop: '1px solid var(--border)', paddingTop: '12px', marginTop: '8px' }}>
                  <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: 'var(--primary-light)', color: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: '14px' }}>
                    {t.name.split(' ').map(n => n[0]).join('')}
                  </div>
                  <div>
                    <h4 style={{ fontSize: '15px', fontWeight: 700, margin: 0, color: 'var(--foreground)' }}>{t.name}</h4>
                    <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{t.location}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="animate-fade-in-up delay-500" style={{ padding: '80px 0', background: 'var(--secondary-light)', borderTop: '1px solid var(--border)', borderBottom: '1px solid var(--border)' }}>
        <div className="container" style={{ maxWidth: '800px' }}>
          <div style={{ textAlign: 'center', marginBottom: '50px' }}>
            <h2 style={{ fontSize: '30px', fontWeight: 700, marginBottom: '12px' }}>
              Frequently Asked Questions
            </h2>
            <p style={{ color: 'var(--text-muted)', fontSize: '14.5px' }}>
              Got questions? We have answers. Learn about solar installations, government subsidies, and savings.
            </p>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {[
              {
                q: 'How much central subsidy can I get under the PM Surya Ghar Yojana?',
                a: 'For residential systems, you can get a direct central subsidy of ₹30,000 per kW for the first 2 kW, and an additional ₹18,000 for the 3rd kW, totaling up to ₹78,000. Prisha Enterprises manages the entire subsidy locking and documentation process in-house.'
              },
              {
                q: 'What is the average payback period for a residential solar setup?',
                a: 'With Navi Mumbai and Thane solar generation averages, most homeowners recover their initial net investment in 3.5 to 5 years. After that, you enjoy free green electricity for the remaining 20+ years of the panel warranty lifespan.'
              },
              {
                q: 'Do I need a strong roof structure to handle the panels?',
                a: 'Yes. Solar panel arrays and wind-resistant mounting frames exert a static load. Our engineers conduct a thorough structural evaluation during our site visit. We construct heavy-duty, hot-dip galvanized steel mounts certified to withstand high coastal wind forces up to 150+ kmph.'
              },
              {
                q: 'How does the net-metering connection process work?',
                a: 'After physical installation, we submit connection requests to MSEDCL/DISCOM, install a bi-directional net meter, and synchronize the solar system with the grid. Any excess solar energy exported is credited to your monthly bill.'
              }
            ].map((faq, idx) => {
              const isOpen = openFaq === idx;
              return (
                <div 
                  key={idx} 
                  style={{ 
                    background: '#FFFFFF', 
                    borderRadius: '8px', 
                    border: '1px solid var(--border)',
                    overflow: 'hidden',
                    transition: 'all 0.3s ease'
                  }}
                >
                  <button
                    onClick={() => setOpenFaq(isOpen ? null : idx)}
                    style={{
                      width: '100%',
                      padding: '20px 24px',
                      background: 'none',
                      border: 'none',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      textAlign: 'left',
                      cursor: 'pointer',
                      fontWeight: 700,
                      fontSize: '15px',
                      color: isOpen ? 'var(--primary)' : 'var(--foreground)',
                      transition: 'color 0.2s ease'
                    }}
                  >
                    <span>{faq.q}</span>
                    <span style={{ 
                      fontSize: '20px', 
                      transform: isOpen ? 'rotate(45deg)' : 'rotate(0deg)', 
                      transition: 'transform 0.2s ease',
                      display: 'inline-block',
                      lineHeight: 1,
                      color: isOpen ? 'var(--secondary)' : 'var(--text-muted)'
                    }}>
                      +
                    </span>
                  </button>
                  <div style={{
                    maxHeight: isOpen ? '200px' : '0',
                    opacity: isOpen ? 1 : 0,
                    overflow: 'hidden',
                    transition: 'max-height 0.3s ease, opacity 0.3s ease, padding 0.3s ease',
                    padding: isOpen ? '0 24px 20px 24px' : '0 24px',
                    fontSize: '14px',
                    color: 'var(--text-muted)',
                    lineHeight: 1.6
                  }}>
                    {faq.a}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Callback in 60 Seconds Footer Micro-form */}
      <section className="animate-fade-in-up delay-500" style={{ padding: '60px 0', background: '#FFFFFF', borderBottom: '1px solid var(--border)' }}>
        <div className="container" style={{ maxWidth: '700px', textAlign: 'center' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', alignItems: 'center' }}>
            <div style={{ width: '48px', height: '48px', borderRadius: '50%', background: 'var(--primary-light)', color: 'var(--primary)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}>
              <Phone size={22} />
            </div>
            <h2 style={{ fontSize: '28px', fontWeight: 800, color: 'var(--primary)', margin: 0 }}>
              Get a Call Back in 60 Seconds
            </h2>
            <p style={{ color: 'var(--text-muted)', fontSize: '14px', maxWidth: '500px', lineHeight: 1.5, margin: '0 auto' }}>
              Enter your WhatsApp number. Our automated gateway will notify Mr. Parag Yadav for an immediate manual callback.
            </p>
          </div>

          <div style={{ marginTop: '24px' }}>
            <CallbackMicroForm />
          </div>
        </div>
      </section>

      {/* Proprietor & Address Bar */}
      <section className="animate-fade-in-up delay-500" style={{ background: 'var(--primary)', color: '#FFFFFF', padding: '60px 0', borderTop: '2px solid var(--secondary)' }}>
        <div className="container">
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '40px', alignItems: 'center' }} className="hero-split-grid">
            <div>
              <Logo lightMode={false} size="md" />
              <p style={{ marginTop: '20px', fontSize: '14px', opacity: 0.8, lineHeight: 1.6 }}>
                Prisha Enterprises is a licensed engineering contractor specializing in rooftop solar installations, electrical grids, and commercial clean energy transitions across Navi Mumbai.
              </p>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <Phone size={18} style={{ color: 'var(--secondary)' }} />
                <div>
                  <div style={{ fontSize: '11px', opacity: 0.6 }}>PROPRIETOR & INQUIRIES</div>
                  <div style={{ fontSize: '16px', fontWeight: 700 }}>Parag Yadav | +91 8879422548</div>
                </div>
              </div>
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
                <MapPin size={18} style={{ color: 'var(--secondary)', marginTop: '4px' }} />
                <div>
                  <div style={{ fontSize: '11px', opacity: 0.6 }}>OFFICE</div>
                  <div style={{ fontSize: '13.5px', opacity: 0.9, lineHeight: 1.4 }}>
                    R2-605, Q-residences, Plot no:- Gen 4/1, Thane-Belapur road, Ghansoli, Navi Mumbai - 400710
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Slogan Footer */}
      <footer style={{ background: '#0a271e', color: '#9CA3AF', padding: '40px 0', borderTop: '1px solid #144e3d', textAlign: 'center', fontSize: '12.5px' }}>
        <div className="container" style={{ display: 'flex', flexDirection: 'column', gap: '16px', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--secondary)', fontWeight: 700, letterSpacing: '0.15em' }}>
            <Sparkles size={14} />
            BUILDING SOLUTIONS. POWERING FUTURE.
            <Sparkles size={14} />
          </div>
          <div>
            &copy; {new Date().getFullYear()} Prisha Enterprises. All Rights Reserved. | DPDP Act Compliant | PE-EST-2026-V1
          </div>
        </div>
      </footer>

      {/* Floating WhatsApp */}
      <a 
        href="https://wa.me/918879422548" 
        target="_blank" 
        rel="noopener noreferrer" 
        className="whatsapp-float"
        aria-label="Chat on WhatsApp"
      >
        <svg viewBox="0 0 448 512" width="28" height="28" fill="currentColor">
          <path d="M380.9 97.1C339 55.1 283.2 32 223.9 32c-122.4 0-222 99.6-222 222 0 39.1 10.2 77.3 29.6 111L0 480l117.7-30.9c32.4 17.7 68.9 27 106.1 27h.1c122.3 0 224.1-99.6 224.1-222 0-59.3-25.2-115-67.1-157zm-157 341.6c-33.2 0-65.7-8.9-94-25.7l-6.7-4-69.8 18.3L72 359.2l-4.4-7c-18.5-29.4-28.2-63.3-28.2-98.2 0-101.7 82.8-184.5 184.6-184.5 49.3 0 95.6 19.2 130.4 54.1 34.8 34.9 56.2 81.2 56.1 130.5 0 101.8-84.9 184.6-186.6 184.6zm101.2-138.2c-5.5-2.8-32.8-16.2-37.9-18-5.1-1.9-8.8-2.8-12.5 2.8-3.7 5.6-14.3 18-17.6 21.8-3.2 3.7-6.5 4.2-12 1.4-32.6-16.3-54-29.1-75.5-66-5.7-9.8 5.7-9.1 16.3-30.3 1.8-3.7.9-6.9-.5-9.7-1.4-2.8-12.5-30.1-17.1-41.2-4.5-10.8-9.1-9.3-12.5-9.5-3.2-.2-6.9-.2-10.6-.2-3.7 0-9.7 1.4-14.8 6.9-5.1 5.6-19.4 19-19.4 46.3 0 27.3 19.9 53.7 22.6 57.4 2.8 3.7 39.1 59.7 94.8 83.8 35.2 15.2 49 16.5 66.6 13.9 10.7-1.6 32.8-13.4 37.4-26.4 4.6-13 4.6-24.1 3.2-26.4-1.3-2.5-5-3.9-10.5-6.6z"/>
        </svg>
      </a>

      {/* Scroll Triggered Consultation Popup Modal */}
      {showPopup && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(9, 15, 12, 0.7)',
          backdropFilter: 'blur(6px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 10000,
          padding: '20px'
        }} className="animate-fade-in-up">
          <div className="popup-modal-card" style={{
            background: 'var(--card-bg)',
            border: '1px solid var(--border)',
            borderRadius: '16px',
            maxWidth: '820px',
            width: '100%',
            display: 'grid',
            gridTemplateColumns: '1.2fr 1fr',
            overflow: 'hidden',
            boxShadow: '0 25px 50px -12px rgba(15, 59, 46, 0.25)',
            position: 'relative'
          }}>
            {/* Close Button */}
            <button 
              onClick={() => {
                setShowPopup(false);
                sessionStorage.setItem('lead_popup_dismissed', 'true');
              }}
              style={{
                position: 'absolute',
                top: '16px',
                right: '16px',
                background: 'rgba(255, 255, 255, 0.9)',
                border: '1px solid var(--border)',
                borderRadius: '50%',
                width: '32px',
                height: '32px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                zIndex: 10,
                color: 'var(--text-muted)'
              }}
              aria-label="Close modal"
              className="close-button-hover"
            >
              <X size={16} />
            </button>

            {/* Left Side: Generated Premium Family Image */}
            <div className="popup-modal-image-side" style={{ position: 'relative', width: '100%', minHeight: '380px' }}>
              <img 
                src="/happy_family_solar.png" 
                alt="Happy Indian Family Solar" 
                style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
              />
              <div style={{
                position: 'absolute',
                bottom: 0,
                left: 0,
                right: 0,
                padding: '24px',
                background: 'linear-gradient(transparent, rgba(15, 59, 46, 0.95))',
                color: '#FFFFFF'
              }}>
                <span className="gold-badge" style={{ marginBottom: '8px', color: '#FFFFFF', borderColor: 'var(--secondary)' }}>Concierge Solar</span>
                <p style={{ fontSize: '13px', fontWeight: 600, opacity: 0.95, lineHeight: 1.4 }}>Join 500+ Navi Mumbai homes powered by Prisha Enterprises.</p>
              </div>
            </div>

            {/* Right Side: Consultation Lead Capture Form */}
            <div style={{ padding: '36px', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
              {popupStep === 1 ? (
                <form onSubmit={handlePopupSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                  <div>
                    <h3 style={{ fontSize: '24px', fontWeight: 800, color: 'var(--primary)', lineHeight: 1.2 }}>
                      Switch to solar at <span style={{ color: '#C5A55A' }}>₹0 Investment</span>
                    </h3>
                    <p style={{ fontSize: '13px', color: 'var(--text-muted)', marginTop: '4px', lineHeight: 1.4 }}>
                      Govt. subsidy covers your down payment, savings cover EMIs
                    </p>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', background: 'var(--primary-light)', padding: '6px 12px', borderRadius: '6px', fontSize: '12px', fontWeight: 700, color: 'var(--primary)', width: 'fit-content' }}>
                    <Sparkles size={14} style={{ color: '#C5A55A' }} />
                    <span>Book a free consultation & save up to ₹78,000</span>
                  </div>

                  {popupAlert && (
                    <div style={{
                      background: popupAlert.type === 'error' ? '#fde8e8' : '#def7ec',
                      color: popupAlert.type === 'error' ? '#9b1c1c' : '#03543f',
                      padding: '8px 12px',
                      borderRadius: '6px',
                      fontSize: '12.5px',
                      fontWeight: 600,
                      border: `1px solid ${popupAlert.type === 'error' ? '#f8b4b4' : '#bcf0da'}`
                    }}>
                      {popupAlert.text}
                    </div>
                  )}

                  <div className="form-group" style={{ margin: 0 }}>
                    <label className="form-label" style={{ fontSize: '12.5px', marginBottom: '6px' }}>Full Name *</label>
                    <input 
                      type="text" 
                      className="form-input" 
                      placeholder="Enter full name"
                      value={popupName}
                      onChange={(e) => setPopupName(e.target.value)}
                      style={{ padding: '10px 14px' }}
                      required
                    />
                  </div>

                  <div className="form-group" style={{ margin: 0 }}>
                    <label className="form-label" style={{ fontSize: '12.5px', marginBottom: '6px' }}>Postal PIN Code *</label>
                    <input 
                      type="text" 
                      className="form-input" 
                      placeholder="e.g. 400710"
                      value={popupPincode}
                      onChange={(e) => {
                        const val = e.target.value.replace(/\D/g, '').slice(0, 6);
                        setPopupPincode(val);
                        if (val.length === 6 && !WHITELISTED_PINCODES.includes(val)) {
                          setPopupPinError('Sorry! We do not currently serve this area. Whitelisted Navi Mumbai/Thane only.');
                        } else {
                          setPopupPinError('');
                        }
                      }}
                      style={{ padding: '10px 14px' }}
                      required
                    />
                    {popupPinError && (
                      <div style={{ color: '#EF4444', fontSize: '11.5px', marginTop: '4px', fontWeight: 500 }}>{popupPinError}</div>
                    )}
                  </div>

                  <div className="form-group" style={{ margin: 0 }}>
                    <label className="form-label" style={{ fontSize: '12.5px', marginBottom: '6px' }}>WhatsApp Number *</label>
                    <div style={{ position: 'relative' }}>
                      <span style={{ position: 'absolute', left: '14px', top: '11px', color: 'var(--text-muted)', fontSize: '13.5px', fontWeight: 600 }}>+91</span>
                      <input 
                        type="tel" 
                        className="form-input" 
                        style={{ paddingLeft: '48px', paddingRight: '14px', paddingTop: '10px', paddingBottom: '10px' }}
                        placeholder="98765 43210"
                        value={popupPhone}
                        onChange={(e) => {
                          const val = e.target.value.replace(/\D/g, '').slice(0, 10);
                          setPopupPhone(val);
                          if (val.length > 0 && val.length < 10) {
                            setPopupPhoneError('Phone number must be exactly 10 digits.');
                          } else {
                            setPopupPhoneError('');
                          }
                        }}
                        required
                      />
                    </div>
                    {popupPhoneError && (
                      <div style={{ color: '#EF4444', fontSize: '11.5px', marginTop: '4px', fontWeight: 500 }}>{popupPhoneError}</div>
                    )}
                  </div>

                  <div className="form-group" style={{ margin: 0 }}>
                    <label className="form-label" style={{ fontSize: '12.5px', marginBottom: '6px' }}>Monthly Electricity Bill *</label>
                    <select
                      className="form-input"
                      value={popupBill}
                      onChange={(e) => setPopupBill(e.target.value)}
                      style={{ padding: '10px 14px', appearance: 'none', background: 'var(--card-bg) url("data:image/svg+xml;charset=utf-8,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' viewBox=\'0 0 20 20\' fill=\'none\'%3E%3Cpath d=\'M7 9l3 3 3-3\' stroke=\'%234B5563\' stroke-width=\'1.5\' stroke-linecap=\'round\' stroke-linejoin=\'round\'/%3E%3C/svg%3E") no-repeat right 12px center', backgroundSize: '20px' }}
                      required
                    >
                      <option value="<1500">Less than ₹1,500</option>
                      <option value="1500-2500">₹1,500 - ₹2,500</option>
                      <option value="2500-4000">₹2,500 - ₹4,000</option>
                      <option value="4000-8000">₹4,000 - ₹8,000</option>
                      <option value=">8000">More than ₹8,000</option>
                    </select>
                  </div>

                  <button 
                    type="submit" 
                    className="btn btn-primary" 
                    style={{ width: '100%', marginTop: '8px', padding: '12px', fontSize: '14.5px' }}
                    disabled={isPopupSubmitting || !!popupPinError || !!popupPhoneError || !popupName || !popupPhone || !popupPincode}
                  >
                    {isPopupSubmitting ? 'Registering...' : 'Book a FREE Consultation'}
                  </button>
                </form>
              ) : (
                <div style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', gap: '20px', alignItems: 'center' }}>
                  <div style={{ width: '56px', height: '56px', borderRadius: '50%', background: 'var(--primary-light)', color: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '2px solid var(--secondary)' }}>
                    <Sparkles size={26} />
                  </div>
                  <div>
                    <h3 style={{ fontSize: '22px', fontWeight: 800, color: 'var(--primary)' }}>Consultation Booked</h3>
                    <p style={{ fontSize: '13.5px', color: 'var(--text-muted)', marginTop: '6px', lineHeight: 1.5 }}>
                      Thank you, <strong>{popupName}</strong>. Your dynamic solar savings profile has been secured.
                    </p>
                  </div>
                  <div style={{ background: 'var(--primary-light)', padding: '16px', borderRadius: '8px', border: '1px solid var(--border)', textAlign: 'left', width: '100%', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    <div style={{ fontSize: '13px' }}><strong>Ref ID:</strong> {popupLeadId}</div>
                    <div style={{ fontSize: '13px' }}><strong>Region Verification:</strong> whitelisted ({popupPincode})</div>
                    <div style={{ fontSize: '13px' }}><strong>WhatsApp Sync:</strong> Active</div>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', width: '100%' }}>
                    <a 
                      href={`https://wa.me/918879422548?text=Hello%20Prisha%20Enterprises,%20I've%20booked%20a%20free%20solar%20consultation.%20Reference:%20${popupLeadId}.`} 
                      target="_blank" 
                      rel="noopener noreferrer" 
                      className="btn btn-primary"
                      style={{ width: '100%' }}
                    >
                      Connect on WhatsApp
                    </a>
                    <button 
                      onClick={() => setShowPopup(false)} 
                      className="btn btn-secondary"
                      style={{ width: '100%' }}
                    >
                      Close Window
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Styling adjustments */}
      <style jsx global>{`
        .stepper-container {
          display: flex;
          justify-content: space-between;
          position: relative;
          width: 100%;
        }
        
        .stepper-line {
          position: absolute;
          top: 25px;
          left: 25px;
          right: 25px;
          height: 3px;
          background: var(--border);
          z-index: 1;
        }
        
        .stepper-line-active {
          position: absolute;
          top: 25px;
          left: 25px;
          height: 3px;
          background: var(--primary);
          z-index: 2;
          transition: width 0.4s cubic-bezier(0.16, 1, 0.3, 1);
        }
        
        .step-item {
          display: flex;
          flex-direction: column;
          align-items: center;
          position: relative;
          z-index: 3;
          cursor: pointer;
          flex: 1;
        }
        
        .step-circle {
          width: 50px;
          height: 50px;
          border-radius: 50%;
          background: #FFFFFF;
          border: 3px solid var(--border);
          color: var(--text-muted);
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: 700;
          font-size: 16px;
          transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
        }
        
        .step-item.active .step-circle {
          background: var(--primary);
          border-color: var(--primary);
          color: #FFFFFF;
          transform: scale(1.1);
          box-shadow: 0 4px 10px rgba(15, 59, 46, 0.2);
        }

        .step-item.completed .step-circle {
          background: var(--primary-light);
          border-color: var(--primary);
          color: var(--primary);
        }
        
        .step-label {
          margin-top: 12px;
          font-size: 13.5px;
          font-weight: 700;
          color: var(--text-muted);
          text-align: center;
          transition: color 0.3s ease;
        }
        
        .step-item.active .step-label {
          color: var(--primary);
        }

        @media (min-width: 769px) {
          .mobile-only {
            display: none !important;
          }
        }

        @media (max-width: 768px) {
          .mobile-only {
            display: block !important;
          }
          .stepper-container {
            flex-direction: column;
            align-items: flex-start;
            gap: 24px;
            padding-left: 20px;
            margin: 30px 0;
          }
          
          .stepper-line-mobile {
            position: absolute;
            top: 25px;
            bottom: 25px;
            left: 45px;
            width: 3px;
            background: var(--border);
            z-index: 1;
            display: block !important;
          }
          
          .stepper-line-active-mobile {
            position: absolute;
            top: 25px;
            left: 45px;
            width: 3px;
            background: var(--primary);
            z-index: 2;
            transition: height 0.4s cubic-bezier(0.16, 1, 0.3, 1);
            display: block !important;
          }
          
          .step-item {
            flex-direction: row;
            align-items: center;
            width: 100%;
            gap: 16px;
          }
          
          .step-label {
            margin-top: 0;
            text-align: left;
          }
        }

        .nav-mobile-toggle-btn {
          display: none !important;
        }

        @media (max-width: 768px) {
          .hero-split-grid {
            grid-template-columns: 1fr !important;
            gap: 32px !important;
          }
          .nav-desktop-only {
            display: none !important;
          }
          .nav-mobile-toggle-btn {
            display: flex !important;
          }
          .popup-modal-card {
            grid-template-columns: 1fr !important;
          }
          .popup-modal-image-side {
            display: none !important;
          }
        }
        
        .close-button-hover:hover {
          background: #C5A55A !important;
          color: #FFFFFF !important;
          border-color: #C5A55A !important;
          transform: rotate(90deg);
        }
        
        .close-button-hover {
          transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1) !important;
        }

        .tab-inactive-hover:hover {
          background: var(--primary-light) !important;
          color: var(--primary) !important;
          border-color: var(--primary) !important;
        }
      `}</style>
    </div>
  );
}
