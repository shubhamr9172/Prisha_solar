'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Logo from '@/components/Logo';
import { WHITELISTED_PINCODES } from '@/lib/utils/solarConstants';
import { 
  Building2, 
  ArrowLeft, 
  TrendingUp, 
  Layers, 
  MapPin, 
  Phone, 
  Mail, 
  FileCheck2,
  Sparkles,
  Sun
} from 'lucide-react';

export default function CommercialPage() {
  const [step, setStep] = useState(1);
  const [societyName, setSocietyName] = useState('');
  const [contactName, setContactName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [pincode, setPincode] = useState('');
  const [pinError, setPinError] = useState('');
  const [area, setArea] = useState('');
  const [load, setLoad] = useState('');
  
  // Verification States
  const [otpSent, setOtpSent] = useState(false);
  const [otpCode, setOtpCode] = useState('');
  const [otpError, setOtpError] = useState('');
  const [dpdpConsent, setDpdpConsent] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [proposalId, setProposalId] = useState('');
  const [formAlert, setFormAlert] = useState<{ type: 'error' | 'success' | 'info'; text: string } | null>(null);

  // Check if we came from residential redirect due to roof checks
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const urlParams = new URLSearchParams(window.location.search);
      if (urlParams.get('mode') === 'society') {
        // Set indicator or focus
      }
    }
  }, []);

  const handlePincodeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value.replace(/\D/g, '').slice(0, 6);
    setPincode(val);
    if (val.length === 6) {
      if (WHITELISTED_PINCODES.includes(val)) {
        setPinError('');
      } else {
        setPinError('Sorry! We do not currently serve this area. Whitelisted Navi Mumbai/Thane area only.');
      }
    } else {
      setPinError('');
    }
  };

  const handleStep1Submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!societyName || !contactName || !email || !phone || !pincode || !area || !load) return;
    if (!WHITELISTED_PINCODES.includes(pincode)) {
      setPinError('Please enter a valid whitelisted PIN code.');
      return;
    }
    setStep(2);
  };

  const triggerOTP = () => {
    if (phone.length < 10) {
      setOtpError('Please enter a valid 10-digit phone number.');
      return;
    }
    setOtpSent(true);
    setOtpError('');
    setFormAlert({
      type: 'success',
      text: `Mock Firebase OTP: 123456 has been sent to ${phone}.`
    });
  };

  const handleFinalSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!dpdpConsent) {
      setFormAlert({
        type: 'error',
        text: "Please accept the DPDP data processing consent to proceed."
      });
      return;
    }
    if (otpCode !== '123456') {
      setOtpError('Invalid OTP code. Please use code 123456.');
      return;
    }

    setIsSubmitting(true);
    setFormAlert(null);
    try {
      const response = await fetch('/api/commercial-booking', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          societyName,
          contactName,
          email,
          phone,
          pincode,
          area: Number(area),
          load: Number(load)
        })
      });

      const data = await response.json();
      if (response.ok) {
        setProposalId(data.proposalId || `PE-COM-${Math.floor(100000 + Math.random() * 900000)}`);
        setStep(3);
      } else {
        setFormAlert({
          type: 'error',
          text: data.error || "Submission failed. Please try again."
        });
      }
    } catch (err) {
      console.error(err);
      // Failover to Mr. Yadav's WhatsApp
      setFormAlert({
        type: 'info',
        text: "Notice: Server/Database is currently busy. We are connecting you directly to Mr. Parag Yadav's Business WhatsApp for priority booking."
      });
      setTimeout(() => {
        window.location.href = `https://wa.me/918879422548?text=Hi%20Prisha%20Enterprises,%20I'm%20submitting%20a%20B2B%20Commercial/Society%20Solar%20proposal%20for%20${societyName}.%20Load:%20${load}kW,%20Area:%20${area}sqft.`;
      }, 3000);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col" style={{ background: 'var(--background)', color: 'var(--foreground)' }}>
      {/* Header */}
      <header className="sticky top-0 z-50 glass" style={{ borderBottom: '1px solid var(--border)', padding: '16px 0' }}>
        <div className="container flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/" className="btn btn-secondary" style={{ padding: '8px 16px', fontSize: '13px' }}>
              <ArrowLeft size={16} /> Back
            </Link>
            <Logo />
          </div>
          <span className="gold-badge" style={{ background: '#fef3c7', color: '#b45309', borderColor: 'rgba(180, 83, 9, 0.15)' }}>Commercial B2B</span>
        </div>
      </header>

      <main className="container" style={{ padding: '40px 24px', flex: 1 }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: '40px' }}>
          
          {/* LEFT COLUMN: Business case / Investment parameters */}
          <div>
            <div className="card card-secondary-accent" style={{ marginBottom: '30px' }}>
              <h2 style={{ fontSize: '24px', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Building2 size={24} style={{ color: 'var(--secondary)' }} />
                Commercial Solar Grids
              </h2>
              <p style={{ color: 'var(--text-muted)', marginBottom: '24px', fontSize: '15px', lineHeight: 1.6 }}>
                Prisha Enterprises designs high-performance commercial and housing society solar systems tailored for heavy utility loads, compliance requirements, and peak efficiency.
              </p>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div style={{ display: 'flex', gap: '12px', background: '#fcfbf7', padding: '16px', borderRadius: '8px' }}>
                  <TrendingUp size={24} style={{ color: 'var(--secondary)', flexShrink: 0 }} />
                  <div>
                    <h3 style={{ fontSize: '16px', fontWeight: 600, marginBottom: '4px' }}>40% Corporate Tax Depreciation</h3>
                    <p style={{ fontSize: '13px', color: 'var(--text-muted)' }}>
                      Accelerate capital recovery by utilizing maximum tax write-offs for green energy investments.
                    </p>
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '12px', background: '#fcfbf7', padding: '16px', borderRadius: '8px' }}>
                  <Layers size={24} style={{ color: 'var(--secondary)', flexShrink: 0 }} />
                  <div>
                    <h3 style={{ fontSize: '16px', fontWeight: 600, marginBottom: '4px' }}>CAPEX & OPEX Financing Models</h3>
                    <p style={{ fontSize: '13px', color: 'var(--text-muted)' }}>
                      Select direct asset ownership (CAPEX) or power purchase agreements (OPEX/RESCO) with zero upfront cost.
                    </p>
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '12px', background: '#fcfbf7', padding: '16px', borderRadius: '8px' }}>
                  <Sun size={24} style={{ color: 'var(--secondary)', flexShrink: 0 }} />
                  <div>
                    <h3 style={{ fontSize: '16px', fontWeight: 600, marginBottom: '4px' }}>Net Metering & Open Access</h3>
                    <p style={{ fontSize: '13px', color: 'var(--text-muted)' }}>
                      Export surplus solar energy back to the grid and adjust against night-time usage tariffs automatically.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="card" style={{ fontSize: '12px', color: 'var(--text-muted)', lineHeight: 1.6 }}>
              <strong>Notice:</strong> Commercial, industrial, and housing society project estimations require detailed electricity bills for the last 12 months and engineering site layout blueprints. Contact our office directly for customized financial modeling.
            </div>
          </div>

          {/* RIGHT COLUMN: Proposal Form */}
          <div className="card">
            {formAlert && (
              <div style={{
                background: formAlert.type === 'error' ? '#fde8e8' : formAlert.type === 'success' ? '#def7ec' : '#e1effe',
                color: formAlert.type === 'error' ? '#9b1c1c' : formAlert.type === 'success' ? '#03543f' : '#1e429f',
                padding: '12px 16px',
                borderRadius: '8px',
                fontSize: '13px',
                fontWeight: 600,
                marginBottom: '20px',
                border: `1px solid ${formAlert.type === 'error' ? '#f8b4b4' : formAlert.type === 'success' ? '#bcf0da' : '#a4cafe'}`
              }}>
                {formAlert.text}
              </div>
            )}

            {step === 1 && (
              <form onSubmit={handleStep1Submit}>
                <h3 style={{ fontSize: '20px', marginBottom: '8px' }}>Society / Corporate Booking</h3>
                <p style={{ fontSize: '14px', color: 'var(--text-muted)', marginBottom: '24px' }}>
                  Propose a grid installation for validation by Prisha Enterprises engineers.
                </p>

                <div className="form-group">
                  <label className="form-label">Society / Corporate Name</label>
                  <input 
                    type="text" 
                    className="form-input" 
                    placeholder="Enter official registered name"
                    value={societyName}
                    onChange={(e) => setSocietyName(e.target.value)}
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Authorized Contact Person</label>
                  <input 
                    type="text" 
                    className="form-input" 
                    placeholder="Representative full name"
                    value={contactName}
                    onChange={(e) => setContactName(e.target.value)}
                    required
                  />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                  <div className="form-group">
                    <label className="form-label">Email</label>
                    <input 
                      type="email" 
                      className="form-input" 
                      placeholder="corporate@email.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Phone</label>
                    <input 
                      type="tel" 
                      className="form-input" 
                      placeholder="Phone number"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value.replace(/\D/g, '').slice(0, 10))}
                      required
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">Installation PIN Code</label>
                  <input 
                    type="text" 
                    className="form-input" 
                    placeholder="6-digit code"
                    value={pincode}
                    onChange={handlePincodeChange}
                    required
                  />
                  {pinError && (
                    <div style={{ color: '#ef4444', fontSize: '13px', marginTop: '6px' }}>{pinError}</div>
                  )}
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                  <div className="form-group">
                    <label className="form-label">Sanctioned Load (kW)</label>
                    <input 
                      type="number" 
                      className="form-input" 
                      placeholder="e.g. 25"
                      value={load}
                      onChange={(e) => setLoad(e.target.value)}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Roofed Area (sq. ft.)</label>
                    <input 
                      type="number" 
                      className="form-input" 
                      placeholder="e.g. 1500"
                      value={area}
                      onChange={(e) => setArea(e.target.value)}
                      required
                    />
                  </div>
                </div>

                <button 
                  type="submit" 
                  className="btn btn-gold" 
                  style={{ width: '100%', marginTop: '10px' }}
                  disabled={!!pinError || !societyName || !contactName || !email || !phone}
                >
                  Verify Proposal Details
                </button>
              </form>
            )}

            {step === 2 && (
              <form onSubmit={handleFinalSubmit}>
                <h3 style={{ fontSize: '20px', marginBottom: '8px' }}>Security & DPDP Consent</h3>
                <p style={{ fontSize: '14px', color: 'var(--text-muted)', marginBottom: '24px' }}>
                  Finalize B2B credentials to enter the validation pipeline.
                </p>

                <div className="form-group" style={{ background: '#f8fafc', padding: '16px', borderRadius: '8px', border: '1px solid var(--border)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
                    <span style={{ fontSize: '14px', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <Phone size={16} /> Phone Verification
                    </span>
                    {!otpSent ? (
                      <button type="button" className="btn btn-gold" style={{ padding: '6px 12px', fontSize: '12px' }} onClick={triggerOTP}>
                        Send OTP
                      </button>
                    ) : (
                      <span style={{ fontSize: '12px', color: 'var(--secondary)', fontWeight: 600 }}>OTP Sent!</span>
                    )}
                  </div>
                  {otpSent && (
                    <div>
                      <input 
                        type="text" 
                        className="form-input" 
                        placeholder="Enter OTP (123456)" 
                        value={otpCode}
                        onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, ''))}
                        style={{ letterSpacing: '0.25em', textAlign: 'center', fontSize: '16px' }}
                      />
                    </div>
                  )}
                  {otpError && (
                    <div style={{ color: '#ef4444', fontSize: '13px', marginTop: '6px' }}>{otpError}</div>
                  )}
                </div>

                <div className="form-group" style={{ display: 'flex', gap: '10px', alignItems: 'flex-start' }}>
                  <input 
                    type="checkbox" 
                    id="dpdp" 
                    checked={dpdpConsent}
                    onChange={(e) => setDpdpConsent(e.target.checked)}
                    style={{ marginTop: '4px', cursor: 'pointer' }}
                    required
                  />
                  <label htmlFor="dpdp" style={{ fontSize: '12px', color: 'var(--text-muted)', lineHeight: 1.5, cursor: 'pointer' }}>
                    I explicitly consent to Prisha Enterprises storing and processing this corporate installation query in accordance with India&apos;s **Digital Personal Data Protection (DPDP) Act**. All transmission is secured.
                  </label>
                </div>

                <div style={{ display: 'flex', gap: '12px' }}>
                  <button type="button" className="btn btn-secondary" style={{ flex: 1 }} onClick={() => setStep(1)}>
                    Back
                  </button>
                  <button 
                    type="submit" 
                    className="btn btn-gold" 
                    style={{ flex: 2 }}
                    disabled={isSubmitting || !dpdpConsent || !otpCode}
                  >
                    {isSubmitting ? 'Submitting...' : 'Register Corporate Lead'}
                  </button>
                </div>
              </form>
            )}

            {step === 3 && (
              <div style={{ textAlign: 'center', padding: '20px 0' }}>
                <div style={{ width: '64px', height: '64px', borderRadius: '50%', background: 'var(--secondary-light)', color: 'var(--secondary)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px auto' }}>
                  <Sparkles size={32} />
                </div>
                <h3 style={{ fontSize: '24px', marginBottom: '8px' }}>Proposal Lodged!</h3>
                <p style={{ fontSize: '14px', color: 'var(--text-muted)', marginBottom: '24px' }}>
                  Thank you, **{contactName}**. The B2B solar grid installation request for **{societyName}** has been successfully registered.
                </p>
                <div style={{ background: '#f8fafc', padding: '16px', borderRadius: '8px', border: '1px solid var(--border)', marginBottom: '30px', textAlign: 'left' }}>
                  <div style={{ fontSize: '13px', marginBottom: '4px' }}><strong>Proposal Ref:</strong> {proposalId}</div>
                  <div style={{ fontSize: '13px', marginBottom: '4px' }}><strong>Nominal Area:</strong> {area} sq. ft.</div>
                  <div style={{ fontSize: '13px' }}><strong>Sanctioned Load:</strong> {load} kW</div>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  <Link href="/" className="btn btn-gold">
                    Return to Home
                  </Link>
                  <a href={`https://wa.me/918879422548?text=Hi%20Prisha%20Enterprises,%20I've%20submitted%20a%20society%20proposal.%20Proposal%20ID:%20${proposalId}.`} target="_blank" rel="noopener noreferrer" className="btn btn-secondary">
                    Chat with Concierge
                  </a>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer style={{ background: '#111827', color: '#9ca3af', padding: '30px 0', borderTop: '1px solid #1f2937', fontSize: '12px' }}>
        <div className="container" style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: '15px' }}>
          <div>
            &copy; {new Date().getFullYear()} Prisha Enterprises. All Rights Reserved.
          </div>
          <div>
            PE-EST-2026-V1 [Price variables subject to DISCOM policy variations]
          </div>
        </div>
      </footer>
    </div>
  );
}
