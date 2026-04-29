import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
// เพิ่มการนำเข้า Eye และ EyeOff
import { Eye, EyeOff, ShieldCheck, ArrowRight } from 'lucide-react';

// ─── DESIGN TOKENS ───────────────────────────────────────────────────
const C = {
  bg:      '#0A0906',
  surface: '#110F0B',
  gold:    '#C49A3C',
  goldLt:  '#F0C96E',
  goldDk:  '#7A5C1A',
  smoke:   'rgba(240, 201, 110, 0.06)',
  border:  'rgba(196, 154, 60, 0.18)',
  muted:   'rgba(255,255,255,0.28)',
  text:    '#F5EDD6',
  serif:    "'Cormorant Garamond', serif",
  sans:     "'DM Sans', sans-serif",
  mono:     "'DM Mono', monospace",
};

const PLANS = {
  basic:   { label: 'Basic',    price: 0,    color: '#888',    perks: ['Real-time gold feed', '3 alerts/day'] },
  silver:  { label: 'Silver',   price: 499,  color: '#C0C0C0', perks: ['Advanced charts', 'Unlimited alerts', 'Priority support'] },
  gold:    { label: 'Gold',     price: 999,  color: C.goldLt,  perks: ['Full institution access', 'API access', 'White-glove onboarding'] },
};

// ─── SUB-COMPONENTS ──────────────────────────────────────────────────
function FloatInput({ label, name, type = 'text', value, onChange }) {
  const [focused, setFocused] = useState(false);
  const [visible, setVisible] = useState(false);
  const isPass = name.toLowerCase().includes('password');
  const filled = value.length > 0;
  const active = focused || filled;
  const inputType = isPass ? (visible ? 'text' : 'password') : type;

  return (
    <div style={{ position: 'relative', marginBottom: '18px' }}>
      <label style={{
        position: 'absolute',
        left: '12px',
        // แก้ไข: ให้ Label ลอยสูงขึ้นและมีพื้นหลังเพื่อไม่ให้เส้นขอบบัง
        top: active ? '0px' : '50%',
        transform: 'translateY(-50%)',
        backgroundColor: active ? (focused ? '#16140F' : C.surface) : 'transparent',
        padding: active ? '0 6px' : '0',
        
        fontSize: active ? '10px' : '14px',
        fontFamily: C.sans,
        fontWeight: 600,
        letterSpacing: active ? '0.12em' : '0.02em',
        textTransform: active ? 'uppercase' : 'none',
        color: focused ? C.goldLt : C.muted,
        transition: 'all 0.22s cubic-bezier(0.4,0,0.2,1)',
        pointerEvents: 'none',
        zIndex: 2,
      }}>
        {label}
      </label>

      <input
        name={name}
        type={inputType}
        value={value}
        onChange={onChange}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        required
        style={{
          width: '100%',
          background: focused ? 'rgba(196,154,60,0.05)' : C.smoke,
          border: `1px solid ${focused ? C.gold : C.border}`,
          borderRadius: '10px',
          color: C.text,
          fontFamily: C.sans,
          fontSize: '15px',
          padding: active ? '22px 48px 10px 16px' : '16px 48px 16px 16px',
          outline: 'none',
          transition: 'all 0.2s ease',
          boxSizing: 'border-box',
          caretColor: C.goldLt,
        }}
      />

      {isPass && (
        <button
          type="button"
          onClick={() => setVisible(v => !v)}
          style={{
            position: 'absolute',
            right: '14px',
            top: '50%',
            transform: 'translateY(-50%)',
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            color: focused ? C.goldLt : C.muted,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '4px',
            transition: 'color 0.2s',
            zIndex: 3
          }}
        >
          {/* เปลี่ยนจากตัวหนังสือเป็นไอคอน */}
          {visible ? <EyeOff size={18} /> : <Eye size={18} />}
        </button>
      )}
    </div>
  );
}

// ─── PLAN PILL ───
function PlanPill({ planKey, plan, selected, isYearly, onClick }) {
  const active = selected === planKey;
  const displayPrice = plan.price === 0 
    ? 'Free' 
    : isYearly 
      ? `฿${Math.round(plan.price * 12 * 0.8).toLocaleString()}` 
      : `฿${plan.price}`;

  return (
    <button type="button" onClick={() => onClick(planKey)} style={{
      flex: 1, padding: '10px 8px', borderRadius: '10px',
      border: `1px solid ${active ? plan.color : C.border}`,
      background: active ? `rgba(196,154,60, 0.1)` : 'transparent',
      cursor: 'pointer', transition: 'all 0.2s', display: 'flex',
      flexDirection: 'column', alignItems: 'center', gap: '4px',
    }}>
      <span style={{ fontSize: '11px', fontWeight: 700, color: active ? plan.color : C.muted, fontFamily: C.sans }}>{plan.label}</span>
      <span style={{ fontSize: '9px', color: active ? plan.color : 'rgba(255,255,255,0.2)', fontFamily: C.mono }}>{displayPrice}</span>
    </button>
  );
}

// ─── MAIN SIGNUP ───
export default function Signup() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const selectedPlan = searchParams.get('plan') || 'basic';
  const period = searchParams.get('period') || 'monthly';
  const isYearly = period === 'yearly';

  const [form, setForm] = useState({ username: '', email: '', password: '', confirmPassword: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);

  const handleChange = (e) => {
    setForm(f => ({ ...f, [e.target.name]: e.target.value }));
    if (error) setError('');
  };

  const plan = PLANS[selectedPlan] || PLANS.basic;
  const finalPriceLabel = plan.price === 0 
    ? 'Free' 
    : isYearly 
      ? `฿${Math.round(plan.price * 12 * 0.8).toLocaleString()} / yr` 
      : `฿${plan.price} / mo`;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (form.password !== form.confirmPassword) { setError('Passwords do not match.'); return; }
    setLoading(true);
    await new Promise(r => setTimeout(r, 1400));
    setLoading(false);
    setDone(true);
    setTimeout(() => navigate('/login'), 1800);
  };

  return (
    <div style={{ minHeight: '100vh', background: C.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: C.sans, padding: '24px' }}>
      <div style={{ width: '100%', maxWidth: '440px', position: 'relative', zIndex: 1 }}>
        
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <h1 style={{ fontFamily: C.serif, fontSize: '38px', fontStyle: 'italic', color: C.text, lineHeight: 1.1, marginBottom: '8px' }}>
            Open your <span style={{ color: C.goldLt, fontWeight: 600 }}>Vault</span>
          </h1>
          <p style={{ color: C.muted, fontSize: '13px' }}>เริ่มต้นการวิเคราะห์ทองคำระดับสถาบัน</p>
        </div>

        <div style={{ background: C.surface, borderRadius: '20px', border: `1px solid ${C.border}`, overflow: 'hidden', boxShadow: '0 24px 64px rgba(0,0,0,0.5)' }}>
          
          <div style={{ background: 'rgba(196,154,60,0.05)', borderBottom: `1px solid ${C.border}`, padding: '16px 20px 12px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px' }}>
              <div>
                <div style={{ fontSize: '9px', fontWeight: 700, color: C.gold, letterSpacing: '0.15em', textTransform: 'uppercase' }}>Selected Tier</div>
                <div style={{ fontSize: '18px', fontWeight: 700, color: plan.color }}>{plan.label} {isYearly && '(Yearly)'}</div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: '14px', fontWeight: 700, color: C.text }}>{finalPriceLabel}</div>
              </div>
            </div>
            <div style={{ display: 'flex', gap: '8px' }}>
              {Object.entries(PLANS).map(([key, p]) => (
                <PlanPill key={key} planKey={key} plan={p} selected={selectedPlan} isYearly={isYearly} onClick={(k) => navigate(`/signup?plan=${k}&period=${period}`)} />
              ))}
            </div>
          </div>

          <div style={{ padding: '28px 24px' }}>
            {done ? (
              <div style={{ textAlign: 'center', padding: '20px 0' }}>
                <p style={{ color: C.text, fontFamily: C.serif, fontSize: '22px', fontStyle: 'italic' }}>Welcome Aboard</p>
                <p style={{ color: C.muted, fontSize: '12px' }}>Redirecting to login…</p>
              </div>
            ) : (
              <form onSubmit={handleSubmit}>
                <FloatInput label="Username" name="username" value={form.username} onChange={handleChange} />
                <FloatInput label="Email address" name="email" type="email" value={form.email} onChange={handleChange} />
                <FloatInput label="Password" name="password" value={form.password} onChange={handleChange} />
                <FloatInput label="Confirm password" name="confirmPassword" value={form.confirmPassword} onChange={handleChange} />

                {error && <div style={{ color: '#e85d5d', fontSize: '12px', textAlign: 'center', marginBottom: '15px' }}>{error}</div>}

                <button type="submit" disabled={loading} style={{
                  width: '100%', padding: '15px', borderRadius: '12px', border: 'none',
                  background: `linear-gradient(130deg, ${C.goldDk} 0%, ${C.gold} 50%, ${C.goldLt} 100%)`,
                  color: '#0A0906', fontWeight: 800, fontSize: '13px', letterSpacing: '0.1em', textTransform: 'uppercase',
                  cursor: loading ? 'wait' : 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px'
                }}>
                  {loading ? "Processing..." : "Create Account"} <ArrowRight size={16} />
                </button>
              </form>
            )}
          </div>
        </div>
        
        <p style={{ textAlign: 'center', marginTop: '24px', color: 'rgba(255,255,255,0.3)', fontSize: '13px' }}>
          มีบัญชีอยู่แล้ว? <a href="/login" style={{ color: C.goldLt, fontWeight: 600, textDecoration: 'none' }}>Sign In</a>
        </p>
      </div>
    </div>
  );
}