import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Eye, EyeOff, ArrowRight } from 'lucide-react';

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

// ─── FLOATING LABEL INPUT (FIXED LABEL & EYE ICON) ────────────────────
function FloatInput({ label, name, type = 'text', value, onChange }) {
  const [focused, setFocused] = useState(false);
  const [visible, setVisible] = useState(false);
  const isPass = type === 'password';
  const active = focused || value.length > 0;
  const inputType = isPass ? (visible ? 'text' : 'password') : type;

  return (
    <div style={{ position: 'relative', marginBottom: '18px' }}>
      <label style={{
        position: 'absolute',
        left: '12px',
        top: active ? '0px' : '50%',
        padding: active ? '0 5px' : '0',
        transform: 'translateY(-50%)',
        // แก้ไข: ให้พื้นหลัง Label บังเส้นขอบเวลาลอยขึ้น
        backgroundColor: active ? (focused ? '#16140F' : C.surface) : 'transparent',
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
          padding: active ? '26px 48px 10px 16px' : '18px 48px 18px 16px',
          outline: 'none',
          transition: 'all 0.22s ease',
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
            color: focused ? C.gold : C.muted,
            display: 'flex',
            alignItems: 'center',
            padding: '4px',
            transition: 'color 0.2s',
            zIndex: 3
          }}
        >
          {visible ? <EyeOff size={18} /> : <Eye size={18} />}
        </button>
      )}
    </div>
  );
}

// ─── DIVIDER ───
function Divider({ label }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', margin: '22px 0' }}>
      <div style={{ flex: 1, height: '1px', background: C.border }} />
      <span style={{ fontSize: '10px', color: C.muted, fontFamily: C.mono, letterSpacing: '0.1em' }}>{label}</span>
      <div style={{ flex: 1, height: '1px', background: C.border }} />
    </div>
  );
}

// ─── MAIN LOGIN PAGE ───
export default function Login() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setForm(f => ({ ...f, [e.target.name]: e.target.value }));
    if (error) setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.email || !form.password) { setError('กรุณากรอกข้อมูลให้ครบถ้วน'); return; }
    
    setLoading(true);
    
    // จำลองการเชื่อมต่อ Backend
    await new Promise(r => setTimeout(r, 1200));
    
    // 🚀 จุดสำคัญ: เก็บสถานะเข้าสู่ระบบลงใน localStorage
    localStorage.setItem('gt_api_key', 'gt_live_mock_token_2026');
    localStorage.setItem('gt_user_email', form.email);
    
    setLoading(false);
    
    // นำทางไปหน้า Dashboard
    navigate('/dashboard');
    
    // บังคับ Refresh เล็กน้อยเพื่อให้ Navbar เห็นสถานะใหม่
    window.location.reload();
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,400;0,600;1,400;1,600&family=DM+Sans:wght@400;500;600;700&family=DM+Mono:wght@400;500&display=swap');
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        body { background: ${C.bg}; }
        input:-webkit-autofill { -webkit-box-shadow: 0 0 0 100px #110F0B inset !important; -webkit-text-fill-color: ${C.text} !important; }
        @keyframes fadeUp { from { opacity: 0; transform: translateY(16px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes shimmer { 0%,100% { opacity: 0.5; } 50% { opacity: 1; } }
        @keyframes spin { to { transform: rotate(360deg); } }
        .login-card { animation: fadeUp 0.45s ease both; }
        .submit-btn:hover:not(:disabled) { filter: brightness(1.1); transform: translateY(-1px); box-shadow: 0 8px 28px rgba(196,154,60,0.32); }
      `}</style>

      <div style={{
        minHeight: '100vh', background: C.bg, display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontFamily: C.sans, padding: '24px', position: 'relative', overflow: 'hidden',
      }}>

        {/* Background Decorative Glow */}
        <div style={{ position: 'fixed', top: '15%', left: '8%', width: '420px', height: '420px', background: 'radial-gradient(circle, rgba(196,154,60,0.07) 0%, transparent 65%)', filter: 'blur(70px)', pointerEvents: 'none' }} />

        <div className="login-card" style={{ width: '100%', maxWidth: '400px', position: 'relative', zIndex: 1 }}>

          <div style={{ textAlign: 'center', marginBottom: '28px' }}>
             <h1 style={{ fontFamily: C.serif, fontSize: '36px', fontStyle: 'italic', color: C.text, lineHeight: 1.1, marginBottom: '6px' }}>
              Welcome <span style={{ color: C.goldLt, fontWeight: 600 }}>back</span>
            </h1>
            <p style={{ color: C.muted, fontSize: '13px' }}>เข้าสู่ระบบเพื่อจัดการ API Key ของคุณ</p>
          </div>

          <div style={{
            background: C.surface, borderRadius: '20px', border: `1px solid ${C.border}`,
            overflow: 'hidden', boxShadow: '0 24px 64px rgba(0,0,0,0.5)',
          }}>
            <div style={{ background: 'rgba(196,154,60,0.05)', borderBottom: `1px solid ${C.border}`, padding: '10px 20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#6ecf84' }} />
              <span style={{ fontSize: '11px', color: C.muted, fontFamily: C.mono }}>GOLD VAULT — SECURE SESSION</span>
            </div>

            <div style={{ padding: '28px 24px' }}>
              <form onSubmit={handleSubmit}>
                <FloatInput label="Email address" name="email" type="email" value={form.email} onChange={handleChange} />
                <FloatInput label="Password" name="password" type="password" value={form.password} onChange={handleChange} />

                <div style={{ textAlign: 'right', marginTop: '-10px', marginBottom: '22px' }}>
                  <a href="#" style={{ fontSize: '11px', color: C.muted, textDecoration: 'none' }}>Forgot password?</a>
                </div>

                {error && <div style={{ color: '#e85d5d', fontSize: '12px', textAlign: 'center', marginBottom: '15px' }}>{error}</div>}

                <button
                  type="submit"
                  disabled={loading}
                  className="submit-btn"
                  style={{
                    width: '100%', padding: '14px', borderRadius: '12px', border: 'none',
                    background: `linear-gradient(130deg, ${C.goldDk} 0%, ${C.gold} 50%, ${C.goldLt} 100%)`,
                    color: '#0A0906', fontWeight: 700, fontSize: '13px', letterSpacing: '0.08em',
                    textTransform: 'uppercase', cursor: loading ? 'wait' : 'pointer',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px'
                  }}
                >
                  {loading ? "Signing in..." : "Sign In"} <ArrowRight size={16} />
                </button>

                <Divider label="OR" />

                <button
                  type="button"
                  onClick={() => navigate('/signup')}
                  style={{
                    width: '100%', padding: '13px', borderRadius: '12px',
                    border: `1px solid ${C.border}`, background: 'transparent',
                    color: C.muted, fontWeight: 600, fontSize: '13px', cursor: 'pointer'
                  }}
                >
                  สร้างบัญชีใหม่ฟรี
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}