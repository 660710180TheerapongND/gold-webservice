import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Check, ArrowRight, Star, Zap, Crown, Shield, ChevronLeft, Lock } from 'lucide-react';

const T = {
  ink:    '#0A0806',
  paper:  '#FAF7F0',
  gold:   '#B8872A',
  goldLt: '#E8C56A',
  goldDk: '#7A5510',
  mist:   'rgba(184,135,42,0.15)',
  fog:    'rgba(250,247,240,0.35)',
  serif:  "'Cormorant Garamond', serif",
  sans:   "'Syne', sans-serif",
  mono:   "'DM Mono', monospace",
};

const PLANS = [
  { id: 'basic', tier: '01', name: 'Basic', badge: 'ฟรีตลอดกาล', badgeVariant: 'free', monthlyPrice: null, icon: Zap, features: ['API 5 requests / minute', 'ราคาทองคำ Real-time', 'Auto sync ทุก 1 นาที'], cta: 'เริ่มใช้งานฟรี', variant: 'basic' },
  { id: 'silver', tier: '02', name: 'Silver', badge: 'Most Popular', badgeVariant: 'popular', monthlyPrice: 99, icon: Crown, features: ['API 10 requests / minute', 'สถิติ Min / Max / Average', 'กราฟย้อนหลัง 24 ชั่วโมง', 'Dashboard แบบ Pro'], cta: 'เลือกแผน Silver', variant: 'silver' },
  { id: 'gold', tier: '03', name: 'Gold', badge: 'Best Value', badgeVariant: 'best', monthlyPrice: 199, icon: Shield, features: ['API 20 requests / minute', 'Technical Analysis เต็มรูปแบบ', 'Export CSV ไม่จำกัด', 'Priority Support 24/7', 'Custom Webhook & Alerts'], cta: 'เลือกแผน Gold', variant: 'gold' },
];

// ... (KEEP COMPARISON_DATA, badgeStyles, cardThemes, CheckIcon, StarIcon, PriceDisplay unchanged) ...
const COMPARISON_DATA = [
  { feature: 'API Rate Limit',     basic: '5 req/min',  silver: '10 req/min', gold: '20 req/min' },
  { feature: 'Historical Data',    basic: '1 Hour',      silver: '24 Hours',   gold: 'Unlimited'  },
  { feature: 'Technical Analysis', basic: '—',           silver: 'Basic',      gold: 'Advanced'   },
  { feature: 'CSV Export',         basic: '—',           silver: '10 / day',   gold: 'Unlimited'  },
  { feature: 'Support',            basic: 'Community',   silver: 'Email',      gold: '24/7 Priority' },
];

const badgeStyles = {
  free:    { background: 'rgba(250,247,240,0.06)', color: T.fog,    border: '1px solid rgba(250,247,240,0.1)' },
  popular: { background: 'rgba(184,135,42,0.12)',  color: T.goldLt, border: '1px solid rgba(184,135,42,0.3)' },
  best:    { background: 'rgba(184,135,42,0.22)',  color: T.goldLt, border: '1px solid rgba(184,135,42,0.45)' },
};

const cardThemes = {
  basic: {
    card: { background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)' },
    tier: { color: 'rgba(250,247,240,0.08)' }, planName: { color: 'rgba(250,247,240,0.35)' },
    priceMain: { color: '#FAF7F0' }, priceUnit: { color: 'rgba(250,247,240,0.3)' },
    divider: { background: 'rgba(255,255,255,0.06)' }, checkBg: { background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)' },
    checkColor: 'rgba(250,247,240,0.4)', featureText: { color: 'rgba(250,247,240,0.45)' },
    cta: { background: 'transparent', border: '1px solid rgba(255,255,255,0.12)', color: 'rgba(250,247,240,0.7)' },
    ctaHover: { background: 'rgba(255,255,255,0.06)', color: '#FAF7F0' },
  },
  silver: {
    card: { background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.12)' },
    tier: { color: 'rgba(250,247,240,0.1)' }, planName: { color: 'rgba(250,247,240,0.5)' },
    priceMain: { color: '#fff' }, priceUnit: { color: 'rgba(255,255,255,0.3)' },
    divider: { background: 'rgba(255,255,255,0.08)' }, checkBg: { background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.15)' },
    checkColor: 'rgba(255,255,255,0.6)', featureText: { color: 'rgba(255,255,255,0.55)' },
    cta: { background: '#FAF7F0', border: 'none', color: '#0A0806' },
    ctaHover: { background: '#fff', color: '#0A0806' },
  },
  gold: {
    card: { background: 'linear-gradient(145deg,#1C1408 0%,#100C06 100%)', border: `1px solid ${T.gold}`, boxShadow: '0 0 0 1px rgba(184,135,42,0.1), inset 0 1px 0 rgba(232,197,106,0.12), 0 20px 60px rgba(184,135,42,0.12)' },
    tier: { color: 'rgba(184,135,42,0.15)' }, planName: { color: T.gold },
    priceMain: { color: T.goldLt }, priceUnit: { color: 'rgba(232,197,106,0.4)' },
    divider: { background: 'rgba(184,135,42,0.2)' }, checkBg: { background: 'rgba(184,135,42,0.15)', border: '1px solid rgba(184,135,42,0.3)' },
    checkColor: T.gold, featureText: { color: 'rgba(232,197,106,0.65)' },
    cta: { background: `linear-gradient(135deg,${T.gold},${T.goldLt})`, border: 'none', color: '#0A0806' },
    ctaHover: { background: 'linear-gradient(135deg,#D4A030,#F0D070)', color: '#0A0806' },
  },
};

function CheckIcon({ color }) { return (<svg width="8" height="8" viewBox="0 0 8 8"><polyline points="1,4 3,6 7,2" fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>); }
function StarIcon({ color }) { return (<svg width="7" height="7" viewBox="0 0 7 7"><polygon points="3.5,0.5 4.5,2.5 6.5,2.8 5,4.2 5.4,6.2 3.5,5.2 1.6,6.2 2,4.2 0.5,2.8 2.5,2.5" fill={color}/></svg>); }

function PriceDisplay({ plan, yearly }) {
  const fmt = (n) => n.toLocaleString('th-TH');
  const theme = cardThemes[plan.variant];
  if (!plan.monthlyPrice) {
    return (<div style={{ marginBottom: '1.5rem' }}><div style={{ fontFamily: T.serif, fontSize: 52, fontWeight: 600, lineHeight: 1, ...theme.priceMain }}>Free</div><div style={{ fontSize: 11, fontFamily: T.sans, fontWeight: 400, marginTop: 4, ...theme.priceUnit }}>ไม่มีค่าใช้จ่าย</div></div>);
  }
  const price = yearly ? Math.round(plan.monthlyPrice * 12 * 0.8) : plan.monthlyPrice;
  return (<div style={{ marginBottom: '1.5rem' }}><div style={{ fontFamily: T.serif, fontSize: 52, fontWeight: 600, lineHeight: 1, ...theme.priceMain }}>฿{fmt(price)}</div><div style={{ fontSize: 11, fontFamily: T.sans, fontWeight: 400, marginTop: 4, ...theme.priceUnit }}>{yearly ? 'ต่อปี' : 'ต่อเดือน'}</div></div>);
}

function PlanCard({ plan, yearly, onSelect, loading, isLoggedIn, userPlan }) {
  const [hovered, setHovered] = useState(false);
  const theme = cardThemes[plan.variant];
  const badge = badgeStyles[plan.badgeVariant];
  
  // 🚀 Logic เช็กสถานะปุ่ม: แผนปัจจุบัน vs แผนใหม่ vs กำลังโหลด[cite: 4]
  const isCurrentPlan = isLoggedIn && userPlan === plan.id;
  const ctaLabel = loading ? 'โปรดรอ...' : isCurrentPlan ? 'แผนปัจจุบันของคุณ' : isLoggedIn ? 'อัปเกรดเป็นแผนนี้' : plan.cta;

  return (
    <div onMouseEnter={() => setHovered(true)} onMouseLeave={() => setHovered(false)} style={{ borderRadius: 16, padding: '1.25rem 1.5rem', position: 'relative', overflow: 'hidden', transition: 'all 0.25s', transform: hovered ? 'translateY(-4px)' : 'translateY(0)', ...theme.card, opacity: isCurrentPlan ? 0.7 : 1 }}>
      <div style={{ position: 'absolute', top: 14, right: 16, fontFamily: T.serif, fontSize: 48, fontStyle: 'italic', fontWeight: 300, lineHeight: 1, pointerEvents: 'none', userSelect: 'none', ...theme.tier }}>{plan.tier}</div>
      <div style={{ display: 'inline-flex', alignItems: 'center', gap: 5, fontSize: 9, fontFamily: T.sans, fontWeight: 700, letterSpacing: '.2em', textTransform: 'uppercase', padding: '3px 10px', borderRadius: 20, marginBottom: '0.75rem', ...badge }}><StarIcon color={T.goldLt}/> {plan.badge}</div>
      <p style={{ fontFamily: T.sans, fontSize: 11, fontWeight: 700, letterSpacing: '.2em', textTransform: 'uppercase', marginBottom: '0.5rem', ...theme.planName }}>{plan.name}</p>
      <PriceDisplay plan={plan} yearly={yearly}/>
      <div style={{ height: 1, marginBottom: '1rem', ...theme.divider }}/>
      <ul style={{ listStyle: 'none', marginBottom: '1.25rem', display: 'flex', flexDirection: 'column', gap: 8 }}>
        {plan.features.map((f, i) => (<li key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 9, fontSize: 12, lineHeight: 1.3 }}><span style={{ width: 14, height: 14, borderRadius: '50%', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', marginTop: 1, ...theme.checkBg }}><CheckIcon color={theme.checkColor}/></span><span style={theme.featureText}>{f}</span></li>))}
      </ul>
      <button 
        disabled={loading || isCurrentPlan} 
        onClick={() => onSelect(plan.id)} 
        onMouseEnter={e => { if(!isCurrentPlan) Object.assign(e.currentTarget.style, theme.ctaHover); }} 
        onMouseLeave={e => { if(!isCurrentPlan) Object.assign(e.currentTarget.style, { background: theme.cta.background, color: theme.cta.color }); }} 
        style={{ 
          width: '100%', padding: '11px', borderRadius: 10, fontFamily: T.sans, fontSize: 11, fontWeight: 700, letterSpacing: '.12em', textTransform: 'uppercase', 
          cursor: (loading || isCurrentPlan) ? 'default' : 'pointer', 
          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, transition: 'all .2s', 
          opacity: (loading || isCurrentPlan) ? 0.5 : 1,
          ...(isCurrentPlan ? { background: 'rgba(255,255,255,0.05)', color: 'rgba(255,255,255,0.3)', border: '1px solid rgba(255,255,255,0.05)' } : theme.cta)
        }}
      >
        {isCurrentPlan ? <Check size={14}/> : <ArrowRight size={14}/>}
        {ctaLabel}
      </button>
    </div>
  );
}

export default function Pricing() {
  const navigate = useNavigate();
  const [yearly,  setYearly]  = useState(false);
  const [loading, setLoading] = useState(false);

  const token      = localStorage.getItem('token');
  const userEmail  = localStorage.getItem('gt_user_email');
  const userPlan   = localStorage.getItem('gt_user_plan'); // 🚀 ดึงแผนปัจจุบันมาเช็ก[cite: 4]
  
  const isLoggedIn = !!(token && token !== 'undefined' && userEmail && userEmail !== 'undefined');

  const handleSelect = async (planId) => {
    if (isLoggedIn) {
      // ✅ ผู้ใช้ที่ล็อกอินแล้ว: ยิงอัปเกรดแผน[cite: 4]
      setLoading(true);
      try {
        await axios.post('http://localhost:3000/api/upgrade', { email: userEmail, plan: planId });
        localStorage.setItem('gt_user_plan', planId);
        navigate('/dashboard');
        window.location.reload();
      } catch {
        alert('ไม่สามารถอัปเกรดแผนได้ (บัญชีนี้อาจไม่มีในระบบ)');
      } finally {
        setLoading(false);
      }
    } else {
      // 🚀 ผู้ใช้ใหม่: เลือกแผนแล้วไปหน้าสมัครสมาชิก (Signup)[cite: 4]
      navigate(`/signup?plan=${planId}&period=${yearly ? 'yearly' : 'monthly'}`);
    }
  };

  return (
    <div style={{ fontFamily: T.sans, background: T.ink, color: T.paper, minHeight: '100vh', padding: '3rem 1.5rem 5rem', position: 'relative', overflowX: 'hidden' }}>
      {/* ... (UI ส่วน Header และ Comparison เหมือนเดิมเป๊ะ) ... */}
      <div style={{ position: 'fixed', top: 0, left: '50%', transform: 'translateX(-50%)', width: 700, height: 350, borderRadius: '50%', background: 'radial-gradient(ellipse, rgba(184,135,42,.09) 0%, transparent 70%)', filter: 'blur(60px)', pointerEvents: 'none' }}/>
      <button onClick={() => navigate(-1)} style={{ position: 'absolute', top: '2rem', left: '2rem', background: 'rgba(255,255,255,.04)', border: '1px solid rgba(255,255,255,.08)', borderRadius: 8, cursor: 'pointer', color: 'rgba(250,247,240,.5)', fontSize: 11, fontFamily: T.sans, fontWeight: 700, display: 'flex', alignItems: 'center', gap: 4, padding: '7px 14px', transition: 'all .2s' }}> <ChevronLeft size={14}/> Back </button>

      <div style={{ maxWidth: 840, margin: '0 auto', position: 'relative' }}>
        <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10, marginBottom: 16 }}>
            <div style={{ width: 28, height: 1, background: T.gold }}/>
            <span style={{ fontFamily: T.sans, fontSize: 9, fontWeight: 700, letterSpacing: '.3em', textTransform: 'uppercase', color: T.gold }}>Membership Plans</span>
            <div style={{ width: 28, height: 1, background: T.gold }}/>
          </div>
          <h1 style={{ fontFamily: T.serif, fontSize: 'clamp(36px,6vw,56px)', fontStyle: 'italic', fontWeight: 300, color: '#FAF7F0', margin: '0 0 10px', lineHeight: 1.15 }}> เลือกแผนที่ <span style={{ background: 'linear-gradient(135deg,#B8872A,#E8C56A)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>ดีที่สุด</span> </h1>
          <p style={{ color: 'rgba(250,247,240,.35)', fontSize: 13, fontFamily: T.sans }}> ราคาทองคำ Real-time สำหรับทุกระดับการลงทุน </p>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 12, marginTop: 24, background: 'rgba(255,255,255,.04)', border: '1px solid rgba(255,255,255,.08)', borderRadius: 40, padding: '6px 16px' }}>
            <span style={{ fontFamily: T.sans, fontSize: 11, fontWeight: 700, color: !yearly ? '#FAF7F0' : 'rgba(250,247,240,.35)', transition: 'color .2s' }}>รายเดือน</span>
            <div onClick={() => setYearly(y => !y)} style={{ width: 40, height: 22, borderRadius: 11, cursor: 'pointer', background: yearly ? `linear-gradient(135deg,${T.gold},${T.goldLt})` : 'rgba(255,255,255,.1)', position: 'relative', transition: 'background .25s' }}><div style={{ position: 'absolute', top: 3, left: yearly ? 21 : 3, width: 16, height: 16, borderRadius: '50%', background: '#fff', transition: 'left .25s', boxShadow: '0 1px 4px rgba(0,0,0,.3)' }}/></div>
            <span style={{ fontFamily: T.sans, fontSize: 11, fontWeight: 700, color: yearly ? T.goldLt : 'rgba(250,247,240,.35)', transition: 'color .2s' }}>รายปี</span>
            {yearly && (<span style={{ fontFamily: T.sans, fontSize: 9, fontWeight: 800, letterSpacing: '.12em', textTransform: 'uppercase', background: 'rgba(184,135,42,.15)', color: T.gold, border: '1px solid rgba(184,135,42,.3)', borderRadius: 20, padding: '2px 8px' }}>ประหยัด 20%</span>)}
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(240px,1fr))', gap: 12, marginBottom: '5rem' }}>
          {PLANS.map(plan => ( 
            <PlanCard key={plan.id} plan={plan} yearly={yearly} onSelect={handleSelect} loading={loading} isLoggedIn={isLoggedIn} userPlan={userPlan}/> 
          ))}
        </div>

        {/* ... (Table ส่วนล่างเหมือนเดิม) ... */}
        <div>
          <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10, marginBottom: 10 }}> <div style={{ width: 20, height: 1, background: T.gold }}/> <span style={{ fontFamily: T.sans, fontSize: 9, fontWeight: 700, letterSpacing: '.3em', textTransform: 'uppercase', color: T.gold }}>Compare</span> <div style={{ width: 20, height: 1, background: T.gold }}/> </div>
            <h3 style={{ fontFamily: T.serif, fontSize: 32, fontStyle: 'italic', fontWeight: 300, color: '#FAF7F0', margin: 0 }}> Feature Comparison </h3>
          </div>
          <div style={{ borderRadius: 14, border: '1px solid rgba(255,255,255,.07)', overflow: 'hidden' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12 }}>
              <thead>
                <tr style={{ background: 'rgba(255,255,255,.04)', borderBottom: '1px solid rgba(255,255,255,.07)' }}>
                  {['Capabilities', 'Basic', 'Silver', 'Gold'].map((h, i) => ( <th key={h} style={{ padding: '14px 20px', fontFamily: T.sans, fontSize: 9, fontWeight: 700, letterSpacing: '.2em', textTransform: 'uppercase', color: i === 3 ? T.gold : 'rgba(250,247,240,.4)', textAlign: i === 0 ? 'left' : 'center' }}> {h} </th> ))}
                </tr>
              </thead>
              <tbody style={{ fontFamily: T.sans }}>{COMPARISON_DATA.map((row, i) => (
                <tr key={i} style={{ borderBottom: i < COMPARISON_DATA.length - 1 ? '1px solid rgba(255,255,255,.04)' : 'none' }}>
                  <td style={{ padding: '14px 20px', fontFamily: T.sans, fontSize: 12, fontWeight: 700, color: 'rgba(250,247,240,.6)', textAlign: 'left' }}> {row.feature} </td>
                  <td style={{ padding: '14px 20px', fontFamily: T.mono, fontSize: 11, color: 'rgba(250,247,240,.3)', textAlign: 'center' }}> {row.basic} </td>
                  <td style={{ padding: '14px 20px', fontFamily: T.mono, fontSize: 11, color: 'rgba(250,247,240,.55)', textAlign: 'center', fontWeight: 700 }}> {row.silver} </td>
                  <td style={{ padding: '14px 20px', fontFamily: T.mono, fontSize: 11, color: T.goldLt, textAlign: 'center', fontWeight: 700 }}> {row.gold} </td>
                </tr>
              ))}</tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}