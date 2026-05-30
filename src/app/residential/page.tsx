'use client';

import React, { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import Logo from '@/components/Logo';
import { 
  calculateSolarDetails, 
  WHITELISTED_PINCODES,
  MIN_BILL,
  MAX_BILL
} from '@/lib/utils/solarConstants';
import { 
  Sun, 
  ArrowLeft, 
  Info, 
  CheckCircle2, 
  MapPin, 
  Home as HomeIcon, 
  Maximize, 
  Phone, 
  Sparkles,
  Zap,
  ShieldAlert,
  TrendingUp
} from 'lucide-react';

interface CumulativeSavingsGraphProps {
  billAmount: number;
  calc: {
    netCost: number;
    monthlySavings: number;
  };
}

function CumulativeSavingsGraph({ billAmount, calc }: CumulativeSavingsGraphProps) {
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null);
  
  const projectionYears = 15;
  const gridRateIncrease = 0.06;
  
  const gridCumulativeData: number[] = [];
  const solarCumulativeData: number[] = [];
  
  let currentYearlyGridBill = billAmount * 12;
  let cumulativeGridCost = 0;
  
  let currentYearlySolarRemainingBill = Math.max(0, billAmount - calc.monthlySavings) * 12;
  let cumulativeSolarCost = calc.netCost;

  for (let year = 1; year <= projectionYears; year++) {
    cumulativeGridCost += currentYearlyGridBill;
    gridCumulativeData.push(Math.round(cumulativeGridCost));
    currentYearlyGridBill *= (1 + gridRateIncrease);

    cumulativeSolarCost += currentYearlySolarRemainingBill;
    solarCumulativeData.push(Math.round(cumulativeSolarCost));
    currentYearlySolarRemainingBill *= (1 + gridRateIncrease);
  }

  const width = 480;
  const height = 260;
  const paddingLeft = 65;
  const paddingRight = 15;
  const paddingTop = 25;
  const paddingBottom = 35;
  
  const chartWidth = width - paddingLeft - paddingRight;
  const chartHeight = height - paddingTop - paddingBottom;
  
  const maxVal = Math.max(gridCumulativeData[14], solarCumulativeData[14]);
  const yMax = maxVal > 0 ? maxVal * 1.05 : 100000;

  const pointsGrid = gridCumulativeData.map((val, i) => {
    const x = paddingLeft + (i / 14) * chartWidth;
    const y = height - paddingBottom - (val / yMax) * chartHeight;
    return `${x},${y}`;
  });

  const pointsSolar = solarCumulativeData.map((val, i) => {
    const x = paddingLeft + (i / 14) * chartWidth;
    const y = height - paddingBottom - (val / yMax) * chartHeight;
    return `${x},${y}`;
  });

  const gridPathD = `M ${pointsGrid.join(' ')}`;
  const solarPathD = `M ${pointsSolar.join(' ')}`;

  const gridAreaD = `M ${paddingLeft},${height - paddingBottom} L ${pointsGrid.join(' ')} L ${paddingLeft + chartWidth},${height - paddingBottom} Z`;
  const solarAreaD = `M ${paddingLeft},${height - paddingBottom} L ${pointsSolar.join(' ')} L ${paddingLeft + chartWidth},${height - paddingBottom} Z`;

  // Get current active index for display
  const activeIdx = hoveredIdx !== null ? hoveredIdx : 14; // Default to final year 15
  const activeYear = activeIdx + 1;
  const activeGrid = gridCumulativeData[activeIdx];
  const activeSolar = solarCumulativeData[activeIdx];
  const activeSavings = activeGrid - activeSolar;

  // Format currency
  const formatINR = (val: number) => {
    if (val >= 100000) {
      return `₹${(val / 100000).toFixed(2)} L`;
    }
    return `₹${val.toLocaleString('en-IN')}`;
  };

  // Generate Y axis ticks (4 ticks)
  const yTicks = [0, yMax * 0.33, yMax * 0.66, yMax];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      {/* Title & Live Info Box */}
      <div style={{ background: '#F9FAFB', padding: '12px 16px', borderRadius: '6px', border: '1px solid var(--border)', fontSize: '13px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
          <span style={{ fontWeight: 700, color: 'var(--foreground)' }}>
            {hoveredIdx !== null ? `Year ${activeYear} Projection:` : `15-Year Cumulative Summary:`}
          </span>
          {hoveredIdx !== null && (
            <span style={{ fontSize: '11px', color: 'var(--text-muted)', fontStyle: 'italic' }}>
              Hovering over graph
            </span>
          )}
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1.2fr', gap: '12px' }}>
          <div>
            <div style={{ fontSize: '11px', color: '#EF4444', fontWeight: 600 }}>CUMULATIVE GRID COST</div>
            <div style={{ fontSize: '15px', fontWeight: 800, color: '#EF4444' }}>{formatINR(activeGrid)}</div>
          </div>
          <div>
            <div style={{ fontSize: '11px', color: '#10B981', fontWeight: 600 }}>CUMULATIVE SOLAR COST</div>
            <div style={{ fontSize: '15px', fontWeight: 800, color: '#10B981' }}>{formatINR(activeSolar)}</div>
          </div>
          <div>
            <div style={{ fontSize: '11px', color: 'var(--primary)', fontWeight: 600 }}>NET ACCUMULATED SAVINGS</div>
            <div style={{ fontSize: '15px', fontWeight: 800, color: 'var(--primary)' }}>
              {activeSavings >= 0 ? formatINR(activeSavings) : `-${formatINR(Math.abs(activeSavings))}`}
            </div>
          </div>
        </div>
      </div>

      {/* SVG Container */}
      <div style={{ position: 'relative', width: '100%', overflowX: 'auto' }}>
        <svg width="100%" height={height} viewBox={`0 0 ${width} ${height}`} style={{ minWidth: '400px', display: 'block', overflow: 'visible' }}>
          <defs>
            <linearGradient id="gridGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#EF4444" stopOpacity="0.15" />
              <stop offset="100%" stopColor="#EF4444" stopOpacity="0.0" />
            </linearGradient>
            <linearGradient id="solarGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#10B981" stopOpacity="0.15" />
              <stop offset="100%" stopColor="#10B981" stopOpacity="0.0" />
            </linearGradient>
          </defs>

          {/* Background Grid Lines */}
          {yTicks.map((tick, idx) => {
            const y = height - paddingBottom - (tick / yMax) * chartHeight;
            return (
              <g key={idx}>
                <line 
                  x1={paddingLeft} 
                  y1={y} 
                  x2={paddingLeft + chartWidth} 
                  y2={y} 
                  stroke="#E5E7EB" 
                  strokeDasharray="4 4" 
                />
                <text 
                  x={paddingLeft - 8} 
                  y={y + 4} 
                  textAnchor="end" 
                  fontSize="10" 
                  fill="#9CA3AF"
                  fontWeight="600"
                >
                  {formatINR(tick)}
                </text>
              </g>
            );
          })}

          {/* X Axis Labels */}
          {[1, 5, 10, 15].map((year) => {
            const x = paddingLeft + ((year - 1) / 14) * chartWidth;
            return (
              <g key={year}>
                <line 
                  x1={x} 
                  y1={height - paddingBottom} 
                  x2={x} 
                  y2={height - paddingBottom + 5} 
                  stroke="#D1D5DB" 
                />
                <text 
                  x={x} 
                  y={height - paddingBottom + 18} 
                  textAnchor="middle" 
                  fontSize="10" 
                  fill="#6B7280"
                  fontWeight="700"
                >
                  Yr {year}
                </text>
              </g>
            );
          })}

          {/* Areas under curves */}
          <path d={gridAreaD} fill="url(#gridGrad)" opacity="0.4" />
          <path d={solarAreaD} fill="url(#solarGrad)" opacity="0.4" />

          {/* Paths */}
          <path 
            d={gridPathD} 
            fill="none" 
            stroke="#EF4444" 
            strokeWidth="2.5" 
            strokeLinecap="round" 
            strokeLinejoin="round" 
          />
          <path 
            d={solarPathD} 
            fill="none" 
            stroke="#10B981" 
            strokeWidth="2.5" 
            strokeLinecap="round" 
            strokeLinejoin="round" 
          />

          {/* Hover indicator line */}
          {hoveredIdx !== null && (
            <line 
              x1={paddingLeft + (hoveredIdx / 14) * chartWidth} 
              y1={paddingTop} 
              x2={paddingLeft + (hoveredIdx / 14) * chartWidth} 
              y2={height - paddingBottom} 
              stroke="#9CA3AF" 
              strokeWidth="1.5" 
              strokeDasharray="2 2" 
            />
          )}

          {/* Dots on Hover */}
          {gridCumulativeData.map((val, i) => {
            const isHovered = hoveredIdx === i;
            const isKeyPoint = i === 0 || i === 4 || i === 9 || i === 14;
            if (!isHovered && !isKeyPoint) return null;

            const x = paddingLeft + (i / 14) * chartWidth;
            const yGrid = height - paddingBottom - (val / yMax) * chartHeight;
            const ySolar = height - paddingBottom - (solarCumulativeData[i] / yMax) * chartHeight;

            return (
              <g key={i}>
                {/* Grid Dot */}
                <circle 
                  cx={x} 
                  cy={yGrid} 
                  r={isHovered ? 6 : 4} 
                  fill="#EF4444" 
                  stroke="#FFFFFF" 
                  strokeWidth="1.5" 
                />
                {/* Solar Dot */}
                <circle 
                  cx={x} 
                  cy={ySolar} 
                  r={isHovered ? 6 : 4} 
                  fill="#10B981" 
                  stroke="#FFFFFF" 
                  strokeWidth="1.5" 
                />
              </g>
            );
          })}

          {/* Interactive Invisible Rects for hover targeting */}
          {[...Array(projectionYears)].map((_, i) => {
            const x = paddingLeft + (i / 14) * chartWidth - (chartWidth / 28);
            const w = chartWidth / 14;
            return (
              <rect
                key={i}
                x={i === 0 ? paddingLeft : x}
                y={paddingTop}
                width={i === 0 ? w + (chartWidth / 28) : i === 14 ? w + (chartWidth / 28) : w}
                height={chartHeight}
                fill="transparent"
                style={{ cursor: 'pointer' }}
                onMouseEnter={() => setHoveredIdx(i)}
                onMouseLeave={() => setHoveredIdx(null)}
              />
            );
          })}
        </svg>
      </div>

      {/* Info Legend Footer */}
      <div style={{ display: 'flex', justifyContent: 'center', gap: '20px', fontSize: '11.5px', color: 'var(--text-muted)', fontWeight: 600, flexWrap: 'wrap' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <div style={{ width: '12px', height: '12px', borderRadius: '2px', background: '#EF4444' }}></div>
          <span>Grid Electricity (Compounding at 6% p.a.)</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <div style={{ width: '12px', height: '12px', borderRadius: '2px', background: '#10B981' }}></div>
          <span>Solar Flat Payoff (Net System Investment)</span>
        </div>
      </div>
    </div>
  );
}

function ResidentialContent() {
  const searchParams = useSearchParams();
  const initialBillRange = searchParams.get('billRange') || '2500-4000';

  // Map bill range to a starting numeric bill
  const getInitialBill = (range: string) => {
    switch (range) {
      case '<1500': return 1000;
      case '1500-2500': return 2000;
      case '2500-4000': return 3000;
      case '4000-8000': return 6000;
      case '>8000': return 10000;
      default: return 3000;
    }
  };

  // Calculator State
  const [billAmount, setBillAmount] = useState<number>(3000);
  const [calc, setCalc] = useState(calculateSolarDetails(3000));
  const [selectedTenure, setSelectedTenure] = useState<number>(36);

  // Set initial bill from query params on mount
  useEffect(() => {
    if (initialBillRange) {
      setBillAmount(getInitialBill(initialBillRange));
    }
  }, [initialBillRange]);

  // Booking Wizard States
  // Steps: 1 = Contact & PIN, 2 = Feasibility Toggles, 3 = OTP & DPDP Consent, 4 = Success
  const [step, setStep] = useState<number>(1);
  
  // Form Fields
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [pincode, setPincode] = useState('');
  const [pinError, setPinError] = useState('');
  
  // Step 2 Toggles
  const [exclusiveRooftop, setExclusiveRooftop] = useState<boolean>(true);
  const [sufficientArea, setSufficientArea] = useState<boolean>(true);

  // Step 3 States
  const [otpSent, setOtpSent] = useState(false);
  const [otpCode, setOtpCode] = useState('');
  const [otpError, setOtpError] = useState('');
  const [dpdpConsent, setDpdpConsent] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [leadId, setLeadId] = useState('');
  const [formAlert, setFormAlert] = useState<{ type: 'error' | 'success' | 'info'; text: string } | null>(null);

  // Update calculator calculations when bill changes
  useEffect(() => {
    setCalc(calculateSolarDetails(billAmount));
  }, [billAmount]);

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
    if (!name || !email || !phone || !pincode) return;
    if (!WHITELISTED_PINCODES.includes(pincode)) {
      setPinError('Please enter a valid whitelisted PIN code.');
      return;
    }
    setFormAlert(null);
    setStep(2);
  };

  const handleStep2Submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!exclusiveRooftop || !sufficientArea) {
      setFormAlert({
        type: 'info',
        text: "Individual residential installation is not feasible without independent rooftop access. Re-routing to Housing Society Proposal..."
      });
      setTimeout(() => {
        window.location.href = "/commercial?mode=society";
      }, 3000);
      return;
    }
    setFormAlert(null);
    setStep(3);
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
      text: `Firebase OTP code sent to ${phone}. Enter 123456 to verify.`
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
      const response = await fetch('/api/booking', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          email,
          phone,
          pincode,
          exclusiveRooftop,
          sufficientArea,
          billAmount,
          systemSize: calc.recommendedCapacitykW,
          estimatedCost: calc.estimatedCost,
          subsidy: calc.subsidy,
          netCost: calc.netCost
        })
      });

      const data = await response.json();
      if (response.ok) {
        setLeadId(data.leadId || `PE-${Math.floor(100000 + Math.random() * 900000)}`);
        setStep(4);
      } else {
        setFormAlert({
          type: 'error',
          text: data.error || "Submission failed. Please try again."
        });
      }
    } catch (err) {
      console.error(err);
      setFormAlert({
        type: 'error',
        text: "Database Offline. Re-routing directly to Parag Yadav's Business WhatsApp for concierge booking..."
      });
      setTimeout(() => {
        window.location.href = `https://wa.me/918879422548?text=Hi%20Prisha%20Enterprises,%20I've%20submitted%20a%20booking%20estimate%20for%20a%20${calc.recommendedCapacitykW}kW%20solar%20system.`;
      }, 3000);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col" style={{ background: 'var(--background)', color: 'var(--foreground)' }}>
      {/* Header */}
      <header className="sticky top-0 z-50 glass" style={{ borderBottom: '1px solid var(--border)', padding: '16px 0', position: 'sticky', top: 0, zIndex: 50 }}>
        <div className="container" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <Link href="/" className="btn btn-secondary" style={{ padding: '8px 16px', fontSize: '13px' }}>
              <ArrowLeft size={16} /> Back
            </Link>
            <Logo size="sm" />
          </div>
          <span className="gold-badge">Residential Portal</span>
        </div>
      </header>

      <main className="container" style={{ padding: '50px 24px', flex: 1 }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1.1fr 0.9fr', gap: '40px' }} className="hero-split-grid">
          
          {/* LEFT COLUMN: Smart Solar Calculator */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            <div className="card" style={{ borderLeft: '4px solid var(--primary)' }}>
              <h2 style={{ fontSize: '22px', fontWeight: 700, marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--primary)' }}>
                <Sun size={24} /> Solar Savings Calculator
              </h2>
              
              <div className="form-group" style={{ marginBottom: '32px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px' }}>
                  <span style={{ fontSize: '14px', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-muted)' }}>Average Monthly Bill</span>
                  <span style={{ fontWeight: 800, color: 'var(--primary)', fontSize: '20px' }}>
                    ₹{billAmount.toLocaleString('en-IN')}
                  </span>
                </div>
                <input 
                  type="range" 
                  min={MIN_BILL} 
                  max={MAX_BILL} 
                  step={500} 
                  value={billAmount} 
                  onChange={(e) => setBillAmount(Number(e.target.value))}
                  style={{ width: '100%', accentColor: 'var(--primary)', cursor: 'pointer', height: '6px', borderRadius: '3px' }}
                />
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', color: 'var(--text-muted)', marginTop: '8px' }}>
                  <span>₹{MIN_BILL.toLocaleString('en-IN')}</span>
                  <span>₹{MAX_BILL.toLocaleString('en-IN')}</span>
                </div>
              </div>

              {/* Calculator Output Grid */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '24px' }}>
                <div style={{ background: 'var(--primary-light)', padding: '20px', borderRadius: '8px', border: '1px solid var(--border)' }}>
                  <span style={{ fontSize: '12px', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-muted)' }}>System Capacity</span>
                  <div style={{ fontSize: '24px', fontWeight: 800, color: 'var(--primary)', marginTop: '4px' }}>
                    {calc.recommendedCapacitykW} kW
                  </div>
                </div>
                <div style={{ background: 'var(--secondary-light)', padding: '20px', borderRadius: '8px', border: '1px solid var(--secondary)' }}>
                  <span style={{ fontSize: '12px', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-muted)' }}>PM Government Subsidy</span>
                  <div style={{ fontSize: '24px', fontWeight: 800, color: '#b45309', marginTop: '4px' }}>
                    ₹{calc.subsidy.toLocaleString('en-IN')}
                  </div>
                </div>
                <div style={{ background: '#FFFFFF', padding: '20px', borderRadius: '8px', border: '1px solid var(--border)' }}>
                  <span style={{ fontSize: '12px', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-muted)' }}>Estimated Cost</span>
                  <div style={{ fontSize: '20px', fontWeight: 700, color: 'var(--foreground)', marginTop: '4px' }}>
                    ₹{calc.estimatedCost.toLocaleString('en-IN')}
                  </div>
                </div>
                <div style={{ background: '#FFFFFF', padding: '20px', borderRadius: '8px', border: '1px solid var(--border)' }}>
                  <span style={{ fontSize: '12px', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-muted)' }}>Net Investment</span>
                  <div style={{ fontSize: '20px', fontWeight: 700, color: 'var(--foreground)', marginTop: '4px' }}>
                    ₹{calc.netCost.toLocaleString('en-IN')}
                  </div>
                </div>
              </div>

              <div style={{ background: '#E6F4EA', border: '1px solid #A3E2B7', borderRadius: '8px', padding: '16px', fontSize: '14px', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '8px', color: '#137333', marginBottom: '24px' }}>
                <Zap size={18} />
                <span>Save approx. ₹{calc.monthlySavings.toLocaleString('en-IN')}/month. Payback in {calc.paybackYears} years.</span>
              </div>

              {/* 15-Year Cumulative Savings Projection Graph */}
              <details className="savings-projection-details" style={{ marginBottom: '24px', border: '1px solid var(--border)', borderRadius: '8px', background: '#FFFFFF', overflow: 'hidden' }}>
                <summary style={{ padding: '14px 16px', background: '#F9FAFB', cursor: 'pointer', fontWeight: 700, fontSize: '14px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', userSelect: 'none' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--primary)' }}>
                    <TrendingUp size={16} />
                    <span>15-Year Cumulative Savings Graph</span>
                  </div>
                  <span style={{ fontSize: '12px', color: 'var(--secondary)', fontWeight: 700 }}>Click to View Projection</span>
                </summary>
                <div style={{ padding: '20px', borderTop: '1px solid var(--border)', background: '#FFFFFF' }}>
                  <CumulativeSavingsGraph billAmount={billAmount} calc={calc} />
                </div>
              </details>

              {/* Legal Notice */}
              <div style={{ display: 'flex', gap: '8px', background: '#F9FAFB', padding: '16px', borderRadius: '8px', borderLeft: '4px solid #D1D5DB', fontSize: '12px', lineHeight: 1.5 }}>
                <Info size={16} style={{ flexShrink: 0, color: '#6B7280', marginTop: '2px' }} />
                <span style={{ color: '#4B5563' }}>
                  All calculations generated are indicative digital appraisals and do not constitute a legally binding commercial quote. Prices are subject to site topography validation.
                </span>
              </div>
            </div>

            {/* EMI Financing options */}
            <div className="card">
              <h3 style={{ fontSize: '18px', fontWeight: 700, marginBottom: '16px' }}>Financing & Low-Cost EMI Options</h3>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '10px', marginBottom: '20px' }}>
                {calc.emiOptions.map((opt) => (
                  <button 
                    key={opt.tenure}
                    onClick={() => setSelectedTenure(opt.tenure)}
                    className={`grid-select-button ${selectedTenure === opt.tenure ? 'active' : ''}`}
                  >
                    {opt.tenure} Months
                  </button>
                ))}
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#F9FAFB', padding: '16px', borderRadius: '8px', border: '1px solid var(--border)' }}>
                <span style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text-muted)' }}>Estimated Monthly EMI</span>
                <span style={{ fontSize: '22px', fontWeight: 800, color: 'var(--primary)' }}>
                  ₹{calc.emiOptions.find(o => o.tenure === selectedTenure)?.emi.toLocaleString('en-IN')}/mo
                </span>
              </div>
            </div>
          </div>

          {/* RIGHT COLUMN: Pre-Qualified Site Booking Engine */}
          <div className="card" style={{ alignSelf: 'start', boxShadow: 'var(--shadow-lg)' }}>
            {/* Step Indicators */}
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '32px', borderBottom: '1px solid var(--border)', paddingBottom: '16px' }}>
              {[1, 2, 3].map((s) => (
                <div key={s} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <div style={{
                    width: '26px',
                    height: '26px',
                    borderRadius: '50%',
                    background: step === s ? 'var(--primary)' : step > s ? '#10B981' : 'var(--border)',
                    color: 'white',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '12px',
                    fontWeight: 700
                  }}>
                    {step > s ? <CheckCircle2 size={16} /> : s}
                  </div>
                  <span style={{ 
                    fontSize: '13px', 
                    fontWeight: step === s ? 700 : 500,
                    color: step === s ? 'var(--foreground)' : 'var(--text-muted)'
                  }}>
                    {s === 1 ? 'Contact' : s === 2 ? 'Rooftop' : 'Verify'}
                  </span>
                </div>
              ))}
            </div>

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

            {/* STEP 1 FORM */}
            {step === 1 && (
              <form onSubmit={handleStep1Submit}>
                <h3 style={{ fontSize: '18px', fontWeight: 700, marginBottom: '8px' }}>Site Visit Pre-Qualification</h3>
                <p style={{ fontSize: '13.5px', color: 'var(--text-muted)', marginBottom: '24px' }}>Provide contact info to verify regional subsidy eligibility.</p>

                <div className="form-group" style={{ marginBottom: '16px' }}>
                  <label className="form-label">Full Name</label>
                  <input 
                    type="text" 
                    className="form-input" 
                    placeholder="Enter full name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                  />
                </div>

                <div className="form-group" style={{ marginBottom: '16px' }}>
                  <label className="form-label">Email Address</label>
                  <input 
                    type="email" 
                    className="form-input" 
                    placeholder="name@email.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>

                <div className="form-group" style={{ marginBottom: '16px' }}>
                  <label className="form-label">Phone Number</label>
                  <div style={{ position: 'relative' }}>
                    <span style={{ position: 'absolute', left: '16px', top: '13px', color: 'var(--text-muted)', fontSize: '14px', fontWeight: 600 }}>+91</span>
                    <input 
                      type="tel" 
                      className="form-input" 
                      style={{ paddingLeft: '50px' }}
                      placeholder="98765 43210"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value.replace(/\D/g, '').slice(0, 10))}
                      required
                    />
                  </div>
                </div>

                <div className="form-group" style={{ marginBottom: '24px' }}>
                  <label className="form-label">Postal PIN Code</label>
                  <input 
                    type="text" 
                    className="form-input" 
                    placeholder="e.g. 400710"
                    value={pincode}
                    onChange={handlePincodeChange}
                    required
                  />
                  {pinError && (
                    <div style={{ color: '#EF4444', fontSize: '12.5px', marginTop: '6px', fontWeight: 500 }}>{pinError}</div>
                  )}
                </div>

                <button 
                  type="submit" 
                  className="btn btn-primary" 
                  style={{ width: '100%' }}
                  disabled={!!pinError || !name || !email || !phone || !pincode}
                >
                  Continue to Rooftop Feasibility
                </button>
              </form>
            )}

            {/* STEP 2 FORM */}
            {step === 2 && (
              <form onSubmit={handleStep2Submit}>
                <h3 style={{ fontSize: '18px', fontWeight: 700, marginBottom: '8px' }}>Rooftop Viability Assessment</h3>
                <p style={{ fontSize: '13.5px', color: 'var(--text-muted)', marginBottom: '24px' }}>Verify structural bounds required for residential solar setups.</p>

                <div className="form-group" style={{ marginBottom: '20px' }}>
                  <div className="form-toggle">
                    <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                      <HomeIcon size={20} style={{ color: 'var(--primary)' }} />
                      <div>
                        <div style={{ fontWeight: 700, fontSize: '14px' }}>Independent Rooftop Access</div>
                        <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Exclusive roof ownership is mandatory</div>
                      </div>
                    </div>
                    <label>
                      <input 
                        type="checkbox" 
                        checked={exclusiveRooftop}
                        onChange={(e) => setExclusiveRooftop(e.target.checked)}
                      />
                      <div className="toggle-switch"></div>
                    </label>
                  </div>
                </div>

                <div className="form-group" style={{ marginBottom: '24px' }}>
                  <div className="form-toggle">
                    <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                      <Maximize size={20} style={{ color: 'var(--primary)' }} />
                      <div>
                        <div style={{ fontWeight: 700, fontSize: '14px' }}>Shadow-Free Space</div>
                        <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Must have at least 150-300+ sq. ft.</div>
                      </div>
                    </div>
                    <label>
                      <input 
                        type="checkbox" 
                        checked={sufficientArea}
                        onChange={(e) => setSufficientArea(e.target.checked)}
                      />
                      <div className="toggle-switch"></div>
                    </label>
                  </div>
                </div>

                <div style={{ background: '#FFFBEB', border: '1px solid #FCD34D', padding: '16px', borderRadius: '8px', fontSize: '13px', display: 'flex', gap: '8px', color: '#B45309', marginBottom: '24px' }}>
                  <ShieldAlert size={18} style={{ flexShrink: 0 }} />
                  <span>Residential systems require roof authorization. Booking will redirect to society grid proposals if toggles are off.</span>
                </div>

                <div style={{ display: 'flex', gap: '12px' }}>
                  <button type="button" className="btn btn-secondary" style={{ flex: 1 }} onClick={() => setStep(1)}>
                    Back
                  </button>
                  <button type="submit" className="btn btn-primary" style={{ flex: 2 }}>
                    Proceed to Verify
                  </button>
                </div>
              </form>
            )}

            {/* STEP 3 FORM */}
            {step === 3 && (
              <form onSubmit={handleFinalSubmit}>
                <h3 style={{ fontSize: '18px', fontWeight: 700, marginBottom: '8px' }}>Security OTP Verification</h3>
                <p style={{ fontSize: '13.5px', color: 'var(--text-muted)', marginBottom: '24px' }}>Submit dynamic OTP code to execute secured data locking.</p>

                <div className="form-group" style={{ background: 'var(--background)', padding: '20px', borderRadius: '8px', border: '1.5px solid var(--border)', marginBottom: '20px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px' }}>
                    <span style={{ fontSize: '14px', fontWeight: 700 }}>OTP Verification</span>
                    {!otpSent ? (
                      <button type="button" className="btn btn-primary" style={{ padding: '6px 14px', fontSize: '12px' }} onClick={triggerOTP}>
                        Send OTP
                      </button>
                    ) : (
                      <span style={{ fontSize: '12.5px', color: '#10B981', fontWeight: 700 }}>OTP Transmitted!</span>
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
                        style={{ letterSpacing: '0.2em', textAlign: 'center', fontSize: '16px', fontWeight: 700 }}
                      />
                    </div>
                  )}
                  {otpError && (
                    <div style={{ color: '#EF4444', fontSize: '13px', marginTop: '6px', fontWeight: 500 }}>{otpError}</div>
                  )}
                </div>

                <div className="form-group" style={{ display: 'flex', gap: '10px', alignItems: 'flex-start', marginBottom: '24px' }}>
                  <input 
                    type="checkbox" 
                    id="dpdp" 
                    checked={dpdpConsent}
                    onChange={(e) => setDpdpConsent(e.target.checked)}
                    style={{ marginTop: '4px', cursor: 'pointer' }}
                    required
                  />
                  <label htmlFor="dpdp" style={{ fontSize: '12px', color: 'var(--text-muted)', lineHeight: 1.5, cursor: 'pointer' }}>
                    I explicitly consent to Prisha Enterprises storing and processing my personal records per <strong>Digital Personal Data Protection (DPDP) Act</strong>. Data is encrypted at rest.
                  </label>
                </div>

                <div style={{ display: 'flex', gap: '12px' }}>
                  <button type="button" className="btn btn-secondary" style={{ flex: 1 }} onClick={() => setStep(2)}>
                    Back
                  </button>
                  <button 
                    type="submit" 
                    className="btn btn-primary" 
                    style={{ flex: 2 }}
                    disabled={isSubmitting || !dpdpConsent || !otpCode}
                  >
                    {isSubmitting ? 'Verifying...' : 'Finalize Booking'}
                  </button>
                </div>
              </form>
            )}

            {/* STEP 4: SUCCESS VIEW */}
            {step === 4 && (
              <div style={{ textAlign: 'center', padding: '10px 0' }}>
                <div style={{ width: '60px', height: '60px', borderRadius: '50%', background: 'var(--primary-light)', color: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px auto', border: '2px solid var(--secondary)' }}>
                  <Sparkles size={28} />
                </div>
                <h3 style={{ fontSize: '22px', fontWeight: 700, marginBottom: '8px' }}>Booking Confirmed</h3>
                <p style={{ fontSize: '13.5px', color: 'var(--text-muted)', marginBottom: '24px' }}>
                  Thank you, <strong>{name}</strong>. Your site survey slot is pre-qualified. An engineer will reach out.
                </p>
                <div style={{ background: 'var(--background)', padding: '20px', borderRadius: '8px', border: '1.5px solid var(--border)', marginBottom: '30px', textAlign: 'left', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <div style={{ fontSize: '13.5px' }}><strong>Lead Reference:</strong> {leadId}</div>
                  <div style={{ fontSize: '13.5px' }}><strong>System Size:</strong> {calc.recommendedCapacitykW} kW</div>
                  <div style={{ fontSize: '13.5px' }}><strong>Net Cost:</strong> ₹{calc.netCost.toLocaleString('en-IN')}</div>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  <Link href="/" className="btn btn-primary">
                    Return to Home
                  </Link>
                  <a href={`https://wa.me/918879422548?text=Hello%20Prisha%20Enterprises,%20I've%20booked%20a%20solar%20site%20visit.%20Lead%20ID:%20${leadId}.`} target="_blank" rel="noopener noreferrer" className="btn btn-secondary">
                    Chat on WhatsApp
                  </a>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer style={{ padding: '30px 0', borderTop: '1px solid var(--border)', textAlign: 'center', fontSize: '12px', color: 'var(--text-muted)' }}>
        &copy; {new Date().getFullYear()} Prisha Enterprises. All Rights Reserved. | PE-EST-2026-V1
      </footer>
    </div>
  );
}

export default function ResidentialPage() {
  return (
    <Suspense fallback={<div className="container" style={{ padding: '100px', textAlign: 'center' }}>Loading calculator...</div>}>
      <ResidentialContent />
    </Suspense>
  );
}
