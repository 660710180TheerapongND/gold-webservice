import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Eye, EyeOff, ShieldCheck, ArrowRight, Check } from 'lucide-react';
import axios from 'axios';

// ─── DESIGN TOKENS (Dark Luxury Finance) ────────────────────────────────────
const C = {
  bg:       '#0A0806',
  surface:  '#100D0A',
  surfaceHi:'#161209',
  gold:     '#B8872A',
  goldLt:   '#E8C56A',
  goldDk:   '#7A5510',
  border:   'rgba(184,135,42,0.15)',
  borderHi: 'rgba(184,135,42,0.35)',
  text:     '#FAF7F0',
  muted:    'rgba(250,247,240,0.35)',
  subtle:   'rgba(250,247,240,0.08)',
  serif:    "'Cormorant Garamond', serif",
  sans:     "'Syne', sans-serif",
  mono:     "'DM Mono', monospace",
};

const PLANS = {
  basic:   { label: 'Basic',   price: 0,   color: C.muted,  perks: ['Real-time gold feed', '3 alerts/day'] },
  silver:  { label: 'Silver',  price: 99, color: '#A8A8A8', perks: ['Advanced charts', 'Unlimited alerts'] },
  gold:    { label: 'Gold',    price: 199, color: C.goldLt, perks: ['Full API access', 'White-glove onboarding'] },
};

// ─── FloatInput (นอก component หลัก ป้องกัน focus loss) ─────────────────────
function FloatInput({ label, name, type = 'text', value, onChange }) {
  const [focused, setFocused] = useState(false);
  const [visible, setVisible] = useState(false);
  const isPass = name.toLowerCase().includes('password');
  const filled = value.length > 0;
  const active = focused || filled;
  const inputType = isPass ? (visible ? 'text' : 'password') : type;

  return (
    <div style={{ position: 'relative', marginBottom: 14 }}>
      {/* floating label */}
      <label style={{
        position: 'absolute', left: 14,
        top: active ? 0 : '50%',
        transform: 'translateY(-50%)',
        background: active ? C.surface : 'transparent',
        padding: active ? '0 5px' : '0',
        fontSize: active ? 9 : 13,
        fontFamily: C.sans,
        fontWeight: 700,
        letterSpacing: active ? '.2em' : '.02em',
        textTransform: active ? 'uppercase' : 'none',
        color: focused ? C.goldLt : C.muted,
        transition: 'all .2s cubic-bezier(.4,0,.2,1)',
        pointerEvents: 'none', zIndex: 2,
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
          background: focused ? 'rgba(184,135,42,0.05)' : C.subtle,
          border: `1px solid ${focused ? C.gold : C.border}`,
          borderRadius: 10,
          color: C.text,
          fontFamily: C.sans,
          fontSize: 14,
          padding: active ? '20px 44px 8px 14px' : '14px 44px 14px 14px',
          outline: 'none',
          boxShadow: focused ? '0 0 0 3px rgba(184,135,42,.08)' : 'none',
          transition: 'all .2s ease',
          boxSizing: 'border-box',
        }}
      />

      {isPass && (
        <button
          type="button"
          onClick={() => setVisible(v => !v)}
          style={{
            position: 'absolute', right: 13, top: '50%', transform: 'translateY(-50%)',
            background: 'none', border: 'none', cursor: 'pointer',
            color: focused ? C.goldLt : C.muted,
            display: 'flex', alignItems: 'center', padding: 4, zIndex: 3,
            transition: 'color .2s',
          }}
        >
          {visible ? <EyeOff size={16} /> : <Eye size={16} />}
        </button>
      )}
    </div>
  );
}

// ─── PlanPill ────────────────────────────────────────────────────────────────
function PlanPill({ planKey, plan, selected, isYearly, onClick }) {
  const active = selected === planKey;
  const price  = plan.price === 0 ? 'Free'
    : isYearly ? `฿${Math.round(plan.price * 12 * 0.8).toLocaleString()}`
    : `฿${plan.price}`;

  return (
    <button
      type="button"
      onClick={() => onClick(planKey)}
      style={{
        flex: 1, padding: '10px 6px', borderRadius: 10,
        border: `1px solid ${active ? C.gold : C.border}`,
        background: active ? 'rgba(184,135,42,0.1)' : 'transparent',
        cursor: 'pointer', transition: 'all .2s',
        display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3,
        boxShadow: active ? '0 0 0 1px rgba(184,135,42,.15)' : 'none',
      }}
    >
      <span style={{
        fontSize: 10, fontWeight: 800, fontFamily: C.sans,
        letterSpacing: '.1em', textTransform: 'uppercase',
        color: active ? plan.color : C.muted,
      }}>
        {plan.label}
      </span>
      <span style={{
        fontSize: 9, fontFamily: C.mono,
        color: active ? C.goldLt : C.muted, opacity: active ? 1 : .6,
      }}>
        {price}
      </span>
    </button>
  );
}

// ─── MAIN ────────────────────────────────────────────────────────────────────
export default function Signup() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const selectedPlan = searchParams.get('plan') || 'basic';
  const period       = searchParams.get('period') || 'monthly';
  const isYearly     = period === 'yearly';

  const [form,    setForm]    = useState({ username: '', email: '', password: '', confirmPassword: '' });
  const [error,   setError]   = useState('');
  const [loading, setLoading] = useState(false);
  const [done,    setDone]    = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const link = document.createElement('link');
    link.rel  = 'stylesheet';
    link.href = 'https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,600;1,300;1,400;1,600&family=Syne:wght@400;500;700;800&family=DM+Mono:wght@400;500&display=swap';
    document.head.appendChild(link);

    const style = document.createElement('style');
    style.innerHTML = `
      *,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
      body{background:#0A0806}
      @keyframes fadeUp{from{opacity:0;transform:translateY(20px)}to{opacity:1;transform:translateY(0)}}
      @keyframes spin{to{transform:rotate(360deg)}}
      @keyframes pulseGold{0%,100%{box-shadow:0 0 0 0 rgba(184,135,42,.4)}50%{box-shadow:0 0 0 8px rgba(184,135,42,0)}}
      .su-in{opacity:0;animation:fadeUp .5s cubic-bezier(.22,1,.36,1) forwards}
      .d1{animation-delay:.05s}.d2{animation-delay:.12s}.d3{animation-delay:.2s}
      .d4{animation-delay:.28s}.d5{animation-delay:.36s}.d6{animation-delay:.44s}
    `;
    document.head.appendChild(style);

    setTimeout(() => setMounted(true), 40);
    return () => { document.head.removeChild(link); document.head.removeChild(style); };
  }, []);

  const plan = PLANS[selectedPlan] || PLANS.basic;
  const finalPriceLabel = plan.price === 0 ? 'Free'
    : isYearly ? `฿${Math.round(plan.price * 12 * 0.8).toLocaleString()} / yr`
    : `฿${plan.price} / mo`;

  const handleChange = (e) => {
    setForm(f => ({ ...f, [e.target.name]: e.target.value }));
    if (error) setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (form.password !== form.confirmPassword) {
      setError('รหัสผ่านไม่ตรงกัน กรุณาตรวจสอบอีกครั้ง');
      return;
    }
    setLoading(true);
    try {
      await axios.post('http://localhost:3000/api/signup', {
        username: form.username,
        email:    form.email,
        password: form.password,
        plan:     selectedPlan,
      });
      setDone(true);
      setTimeout(() => navigate('/login'), 1800);
    } catch (err) {
      setError(err.response?.data?.message || 'การสมัครสมาชิกขัดข้อง กรุณาลองใหม่');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      background: C.bg,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontFamily: C.sans, padding: 24,
    }}>

      {/* ambient glow */}
      <div style={{
        position: 'fixed', top: '10%', left: '50%', transform: 'translateX(-50%)',
        width: 600, height: 300, borderRadius: '50%',
        background: 'radial-gradient(ellipse, rgba(184,135,42,.07) 0%, transparent 70%)',
        filter: 'blur(40px)', pointerEvents: 'none',
      }}/>

      <div style={{
        width: '100%', maxWidth: 420, position: 'relative',
        opacity: mounted ? 1 : 0,
        transform: mounted ? 'translateY(0)' : 'translateY(20px)',
        transition: 'opacity .55s ease, transform .55s cubic-bezier(.22,1,.36,1)',
      }}>

        {/* ── Header ── */}
        <div className={mounted ? 'su-in d1' : ''} style={{ textAlign: 'center', marginBottom: 28 }}>
          <div style={{
            width: 48, height: 48,
            background: 'linear-gradient(135deg,#B8872A,#E8C56A)',
            borderRadius: 14, margin: '0 auto 16px',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: '0 8px 24px rgba(184,135,42,.25)',
            animation: done ? 'pulseGold 1.5s ease infinite' : 'none',
          }}>
            <ShieldCheck color="#0A0806" size={24} />
          </div>
          <h1 style={{
            fontFamily: C.serif, fontSize: 34, fontStyle: 'italic',
            fontWeight: 300, color: C.text, margin: 0, lineHeight: 1.15,
          }}>
            Gold Tracker{' '}
            <span style={{
              background: 'linear-gradient(135deg,#B8872A,#E8C56A)',
              WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
            }}>
              Vault
            </span>
          </h1>
          <p style={{ color: C.muted, fontSize: 12, marginTop: 6, fontFamily: C.sans, letterSpacing: '.02em' }}>
            เริ่มต้นการลงทุนระดับสถาบันด้วยข้อมูลที่แม่นยำ
          </p>
        </div>

        {/* ── Card ── */}
        <div className={mounted ? 'su-in d2' : ''} style={{
          background: C.surface,
          borderRadius: 20,
          border: `1px solid ${C.border}`,
          overflow: 'hidden',
          boxShadow: '0 24px 64px rgba(0,0,0,.5), 0 0 0 1px rgba(184,135,42,.06)',
        }}>

          {/* Plan selector header */}
          <div style={{
            background: C.surfaceHi,
            borderBottom: `1px solid ${C.border}`,
            padding: '16px 20px 14px',
          }}>
            <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom: 12 }}>
              <div>
                <div style={{
                  fontSize: 8, fontWeight: 800, fontFamily: C.sans,
                  letterSpacing: '.22em', textTransform: 'uppercase',
                  color: C.gold, marginBottom: 3,
                }}>
                  Selected Plan
                </div>
                <div style={{
                  fontSize: 17, fontWeight: 800, fontFamily: C.sans,
                  color: plan.color === C.muted ? C.text : plan.color,
                }}>
                  {plan.label}{isYearly && ' (Yearly)'}
                </div>
              </div>
              <div style={{
                fontFamily: C.mono, fontSize: 13, fontWeight: 500,
                color: C.goldLt,
                background: 'rgba(184,135,42,.1)',
                border: '1px solid rgba(184,135,42,.2)',
                borderRadius: 8, padding: '4px 12px',
              }}>
                {finalPriceLabel}
              </div>
            </div>

            {/* plan pills */}
            <div style={{ display:'flex', gap: 6 }}>
              {Object.entries(PLANS).map(([key, p]) => (
                <PlanPill
                  key={key} planKey={key} plan={p}
                  selected={selectedPlan} isYearly={isYearly}
                  onClick={(k) => navigate(`/signup?plan=${k}&period=${period}`)}
                />
              ))}
            </div>

            {/* perks row */}
            <div style={{ display:'flex', flexWrap:'wrap', gap: '4px 14px', marginTop: 12 }}>
              {plan.perks.map(perk => (
                <span key={perk} style={{
                  display: 'flex', alignItems: 'center', gap: 5,
                  fontSize: 10, fontFamily: C.sans, color: C.muted,
                }}>
                  <Check size={10} color={C.gold} strokeWidth={3}/> {perk}
                </span>
              ))}
            </div>
          </div>

          {/* Form body */}
          <div style={{ padding: '24px 22px' }}>
            {done ? (
              // Success state
              <div style={{ textAlign:'center', padding: '16px 0' }}>
                <div style={{
                  width: 52, height: 52, borderRadius: '50%', margin: '0 auto 14px',
                  background: 'rgba(90,191,126,.1)', border: '1px solid rgba(90,191,126,.3)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                  <Check size={24} color="#5ABF7E" strokeWidth={2.5}/>
                </div>
                <p style={{ fontFamily: C.serif, fontSize: 24, fontStyle: 'italic', color: C.text, marginBottom: 8 }}>
                  สมัครสำเร็จ!
                </p>
                <p style={{ color: C.muted, fontSize: 12, lineHeight: 1.6 }}>
                  ยินดีต้อนรับสู่ Gold Tracker<br/>กำลังพาคุณไปหน้าเข้าสู่ระบบ...
                </p>
              </div>
            ) : (
              <form onSubmit={handleSubmit}>
                <FloatInput label="Username"         name="username"        value={form.username}        onChange={handleChange} />
                <FloatInput label="Email Address"    name="email"           type="email" value={form.email} onChange={handleChange} />
                <FloatInput label="Password"         name="password"        value={form.password}        onChange={handleChange} />
                <FloatInput label="Confirm Password" name="confirmPassword" value={form.confirmPassword} onChange={handleChange} />

                {/* error */}
                {error && (
                  <div style={{
                    display:'flex', alignItems:'center', gap: 8,
                    background: 'rgba(160,48,48,.15)', border: '1px solid rgba(224,112,112,.2)',
                    borderRadius: 8, padding: '10px 14px', marginBottom: 14,
                  }}>
                    <span style={{ fontFamily: C.sans, fontSize: 11, color: '#E07070' }}>{error}</span>
                  </div>
                )}

                {/* divider */}
                <div style={{ height: 1, background: C.border, margin: '6px 0 16px' }}/>

                {/* submit */}
                <button
                  type="submit"
                  disabled={loading}
                  style={{
                    width: '100%', padding: '14px',
                    borderRadius: 12, border: 'none',
                    background: loading
                      ? 'rgba(184,135,42,.3)'
                      : 'linear-gradient(135deg,#B8872A,#E8C56A)',
                    color: loading ? C.muted : '#0A0806',
                    fontFamily: C.sans, fontWeight: 800, fontSize: 11,
                    letterSpacing: '.14em', textTransform: 'uppercase',
                    cursor: loading ? 'wait' : 'pointer',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10,
                    boxShadow: loading ? 'none' : '0 6px 24px rgba(184,135,42,.3)',
                    transition: 'all .25s',
                  }}
                  onMouseEnter={e => { if (!loading) { e.currentTarget.style.transform='translateY(-2px)'; e.currentTarget.style.boxShadow='0 10px 32px rgba(184,135,42,.4)'; }}}
                  onMouseLeave={e => { e.currentTarget.style.transform='translateY(0)'; e.currentTarget.style.boxShadow='0 6px 24px rgba(184,135,42,.3)'; }}
                >
                  {loading ? (
                    <>
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"
                        style={{ animation:'spin .8s linear infinite' }}>
                        <path d="M21 12a9 9 0 1 1-6.219-8.56"/>
                      </svg>
                      Registering...
                    </>
                  ) : (
                    <> Create Account <ArrowRight size={15}/> </>
                  )}
                </button>
              </form>
            )}
          </div>
        </div>

        {/* login link */}
        <p className={mounted ? 'su-in d6' : ''} style={{
          textAlign: 'center', marginTop: 22,
          color: C.muted, fontSize: 12, fontFamily: C.sans,
        }}>
          เป็นสมาชิกอยู่แล้ว?{' '}
          <a href="/login" style={{ color: C.goldLt, fontWeight: 700, textDecoration: 'none' }}>
            เข้าสู่ระบบที่นี่
          </a>
        </p>
      </div>
    </div>
  );
}