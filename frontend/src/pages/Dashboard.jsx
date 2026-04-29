import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom'; // เพิ่มการใช้ navigate
import { 
  BarChart3, Download, Lock, RefreshCw, 
  TrendingUp, TrendingDown, Zap, Key, Activity
} from 'lucide-react';
import {
  AreaChart, Area, XAxis, YAxis,
  CartesianGrid, Tooltip, ResponsiveContainer,
} from 'recharts';

// ─── DESIGN TOKENS (ห้ามแก้ - เดิมเป๊ะ) ────────────────────────────────
const C = {
  bg:       '#080604', surface:  '#0F0D09', card:     '#141109', cardHi:   '#1A1610',
  border:   'rgba(184,135,42,0.12)', borderHi: 'rgba(184,135,42,0.28)',
  gold:     '#B8872A', goldLt:   '#E8C56A', goldPale: 'rgba(184,135,42,0.08)', goldGlow: 'rgba(184,135,42,0.18)',
  text:     '#EDE8DC', muted:    '#6B6255', fog:      '#9E9080',
  up:       '#4ade80', down:     '#f87171', upBg:     'rgba(74,222,128,0.08)', downBg:   'rgba(248,113,113,0.08)',
  serif:    "'Cormorant Garamond', serif", sans:     "'Syne', sans-serif", mono:     "'DM Mono', monospace",
};

const MOCK_HISTORY = [
  { time: '09:00', price: 40500 }, { time: '10:00', price: 40650 },
  { time: '11:00', price: 40580 }, { time: '12:00', price: 40820 },
  { time: '13:00', price: 40950 }, { time: '14:00', price: 40880 },
  { time: '15:00', price: 41050 }, { time: '16:00', price: 40990 },
];

export default function Dashboard() {
  const navigate = useNavigate();

  // 🚀 LOGIC: ดึงข้อมูลจากสิทธิ์การใช้งานจริง (JWT/LocalStorage)
  const [user] = useState({
    name: localStorage.getItem('gt_user_name') || 'Sopita J.', // อ้างอิงจากข้อมูลผู้ใช้
    plan: localStorage.getItem('gt_user_plan') || 'basic',     // 'basic', 'silver', 'gold'
    apiKey: localStorage.getItem('gt_api_key') || '',
  });

  // 🚀 LOGIC: กำหนด Rate Limit ตาม Tier (5/10/20)
  const getUsageLimit = (plan) => {
    if (plan === 'gold') return 20;   //
    if (plan === 'silver') return 10; //
    return 5;                        //
  };

  const [goldData] = useState({ sellPrice: 40850, buyPrice: 40750 });
  const [history]  = useState(MOCK_HISTORY);
  const [loading, setLoading] = useState(false);
  const [usage]    = useState({ current: 2, limit: getUsageLimit(user.plan) });
  const [pulse, setPulse] = useState(false);

  // 🚀 LOGIC: เตรียมฟังก์ชันดึงข้อมูลพร้อมส่ง API Key & JWT
  const fetchData = useCallback(async () => {
    if (!user.apiKey) {
      navigate('/login');
      return;
    }
    
    setLoading(true);
    setPulse(true);
    
    try {
      // ตัวอย่างการเตรียมยิง API จริง
      // const token = localStorage.getItem('token');
      // await axios.get('/api/prices/latest', { 
      //   headers: { 'x-api-key': user.apiKey, 'Authorization': `Bearer ${token}` } 
      // });
      await new Promise(r => setTimeout(r, 800)); 
    } finally {
      setLoading(false);
      setTimeout(() => setPulse(false), 1200);
    }
  }, [user.apiKey, navigate]);

  useEffect(() => { 
    if (!localStorage.getItem('gt_api_key')) {
      navigate('/login'); // ถ้าไม่ได้ Login ให้ดีดออก
    } else {
      fetchData(); 
    }
  }, [fetchData, navigate]);

  const isBasic = user.plan === 'basic';
  const usagePct = (usage.current / usage.limit) * 100;

  // ─── JSX RENDER (ห้ามแก้ดีไซน์ - ทุกอย่างคงเดิม) ──────────────────
  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,600;1,300;1,400;1,600&family=Syne:wght@400;500;700;800&family=DM+Mono:wght@400;500&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        body { background: ${C.bg}; }
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes pulse-ring { 0% { box-shadow: 0 0 0 0 rgba(184,135,42,0.4); } 70% { box-shadow: 0 0 0 12px rgba(184,135,42,0); } 100% { box-shadow: 0 0 0 0 rgba(184,135,42,0); } }
        @keyframes fadeUp { from { opacity: 0; transform: translateY(16px); } to { opacity: 1; transform: translateY(0); } }
        .card-anim { animation: fadeUp 0.5s ease both; }
        .card-anim:nth-child(1) { animation-delay: 0.05s; }
        .card-anim:nth-child(2) { animation-delay: 0.12s; }
        .card-anim:nth-child(3) { animation-delay: 0.19s; }
        .card-anim:nth-child(4) { animation-delay: 0.26s; }
        .hover-lift { transition: transform 0.2s ease, border-color 0.2s ease; }
        .hover-lift:hover { transform: translateY(-2px); border-color: ${C.borderHi} !important; }
        .btn-refresh:hover { opacity: 0.85; }
        .btn-upgrade:hover { background: ${C.goldLt} !important; }
        ::-webkit-scrollbar { width: 4px; }
        ::-webkit-scrollbar-track { background: ${C.bg}; }
        ::-webkit-scrollbar-thumb { background: #2a2010; border-radius: 2px; }
      `}</style>

      <div style={{
        background: C.bg, minHeight: '100vh',
        fontFamily: C.sans, color: C.text,
        backgroundImage: `linear-gradient(rgba(184,135,42,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(184,135,42,0.03) 1px, transparent 1px)`,
        backgroundSize: '48px 48px',
      }}>
        <div style={{ maxWidth: '1280px', margin: '0 auto', padding: '32px 40px' }}>

          <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '36px', paddingBottom: '28px', borderBottom: `1px solid ${C.border}` }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '10px' }}>
                <div style={{ width: '36px', height: '36px', borderRadius: '8px', background: `linear-gradient(135deg, ${C.gold}, #7A5510)`, display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: `0 4px 16px rgba(184,135,42,0.3)` }}>
                  <div style={{ width: '14px', height: '14px', borderRadius: '3px', background: 'rgba(255,255,255,0.9)' }} />
                </div>
                <span style={{ fontFamily: C.sans, fontWeight: 800, fontSize: '13px', letterSpacing: '0.12em', color: C.fog, textTransform: 'uppercase' }}>Gold Tracker</span>
              </div>
              <h1 style={{ fontFamily: C.serif, fontStyle: 'italic', fontWeight: 300, fontSize: '46px', color: C.text, lineHeight: 1, letterSpacing: '-0.01em' }}>Terminal Dashboard</h1>
              <p style={{ fontFamily: C.sans, fontSize: '13px', color: C.muted, marginTop: '8px' }}>
                Welcome back, <span style={{ color: C.text, fontWeight: 600 }}>{user.name}</span>
                <span style={{ margin: '0 10px', color: C.muted, opacity: 0.4 }}>·</span>
                <span style={{ color: C.goldLt, fontWeight: 800, fontSize: '11px', letterSpacing: '0.12em', textTransform: 'uppercase', background: C.goldPale, padding: '2px 8px', borderRadius: '4px', border: `1px solid ${C.border}` }}>{user.plan}</span>
              </p>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                  <span style={{ fontFamily: C.sans, fontSize: '10px', fontWeight: 700, letterSpacing: '0.1em', color: C.muted, textTransform: 'uppercase' }}>API Usage</span>
                  <span style={{ fontFamily: C.mono, fontSize: '10px', color: C.fog }}>{usage.current}/{usage.limit}</span>
                </div>
                <div style={{ width: '120px', height: '4px', background: '#1a1610', borderRadius: '2px', overflow: 'hidden' }}>
                  <div style={{ width: `${usagePct}%`, height: '100%', background: `linear-gradient(90deg, ${C.gold}, ${C.goldLt})`, borderRadius: '2px', transition: 'width 0.6s ease' }} />
                </div>
              </div>
              <button onClick={fetchData} className="btn-refresh" style={{ background: C.card, color: C.text, border: `1px solid ${C.border}`, padding: '10px 20px', borderRadius: '10px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', fontFamily: C.sans, fontWeight: 700, transition: 'opacity 0.2s' }}>
                <RefreshCw size={14} color={C.gold} style={loading ? { animation: 'spin 1s linear infinite' } : {}} />
                Refresh
              </button>
            </div>
          </header>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 300px', gap: '24px' }}>
            <main style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <MetricCard label="ราคาขาย (Sell)" value={goldData.sellPrice} trend="up" delta="+0.37%" pulse={pulse} />
                <MetricCard label="ราคารับซื้อ (Buy)" value={goldData.buyPrice} trend="down" delta="-0.12%" pulse={false} />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', background: C.card, borderRadius: '14px', border: `1px solid ${C.border}`, overflow: 'hidden' }}>
                {[ { label: 'High (24h)', val: '฿41,200' }, { label: 'Low (24h)', val: '฿40,100' }, { label: 'Volume', val: '2,841 oz' } ].map(({ label, val }, i) => (
                  <div key={label} style={{ padding: '16px 20px', borderRight: i < 2 ? `1px solid ${C.border}` : 'none' }}>
                    <p style={{ fontFamily: C.sans, fontSize: '10px', fontWeight: 700, color: C.muted, letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: '6px' }}>{label}</p>
                    <p style={{ fontFamily: C.mono, fontSize: '16px', fontWeight: 500, color: C.text }}>{val}</p>
                  </div>
                ))}
              </div>

              <div className="hover-lift" style={{ background: C.card, borderRadius: '20px', padding: '24px', border: `1px solid ${C.border}`, position: 'relative', minHeight: '320px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: C.goldPale, border: `1px solid ${C.border}`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <BarChart3 size={16} color={C.gold} />
                    </div>
                    <div>
                      <h3 style={{ fontFamily: C.sans, fontSize: '15px', fontWeight: 800, color: C.text }}>Market Analysis</h3>
                      <p style={{ fontFamily: C.mono, fontSize: '10px', color: C.muted }}>Today · Intraday</p>
                    </div>
                  </div>
                  {!isBasic && (
                    <button style={{ background: 'none', border: `1px solid ${C.border}`, color: C.fog, padding: '7px 14px', borderRadius: '8px', fontSize: '11px', fontWeight: 700, cursor: 'pointer', fontFamily: C.sans, display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <Download size={11} /> Export CSV
                    </button>
                  )}
                </div>

                {isBasic ? (
                  <LockedOverlay tier="Silver" />
                ) : (
                  <div style={{ height: '220px' }}>
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={history} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                        <defs><linearGradient id="goldGrad" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor={C.gold} stopOpacity={0.25} /><stop offset="100%" stopColor={C.gold} stopOpacity={0} /></linearGradient></defs>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.03)" />
                        <XAxis dataKey="time" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: C.muted, fontFamily: C.mono }} />
                        <YAxis hide domain={['dataMin - 200', 'dataMax + 200']} />
                        <Tooltip content={<ChartTooltip />} />
                        <Area type="monotone" dataKey="price" stroke={C.gold} strokeWidth={2} fillOpacity={1} fill="url(#goldGrad)" dot={false} activeDot={{ r: 4, fill: C.gold, stroke: C.bg, strokeWidth: 2 }} />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                )}
              </div>
            </main>

            <aside style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div style={{ background: `linear-gradient(135deg, #1a1508 0%, #0f0d06 100%)`, borderRadius: '20px', padding: '24px', border: `1px solid ${C.borderHi}`, boxShadow: `0 0 40px rgba(184,135,42,0.06)` }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '20px' }}>
                  <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: C.up, animation: 'pulse-ring 2s ease-out infinite' }} />
                  <span style={{ fontFamily: C.sans, fontSize: '10px', fontWeight: 800, letterSpacing: '0.14em', color: C.fog, textTransform: 'uppercase' }}>Live Market</span>
                </div>
                <p style={{ fontFamily: C.mono, fontSize: '11px', color: C.muted, marginBottom: '4px' }}>Spot Price (USD)</p>
                <div style={{ display: 'flex', alignItems: 'baseline', gap: '10px', marginBottom: '16px' }}>
                  <span style={{ fontFamily: C.serif, fontStyle: 'italic', fontSize: '38px', fontWeight: 300, color: C.goldLt, lineHeight: 1 }}>$3,312</span>
                  <span style={{ fontFamily: C.mono, fontSize: '11px', color: C.up }}>.50 ↑</span>
                </div>
                <div style={{ width: '100%', height: '1px', background: C.border, marginBottom: '16px' }} />
                <div style={{ display: 'flex', gap: '12px' }}>
                  {[ { label: '1D', val: '+0.37%', pos: true }, { label: '1W', val: '+2.1%', pos: true }, { label: '1M', val: '-0.8%', pos: false } ].map(({ label, val, pos }) => (
                    <div key={label} style={{ flex: 1, textAlign: 'center' }}>
                      <p style={{ fontFamily: C.mono, fontSize: '9px', color: C.muted, marginBottom: '4px' }}>{label}</p>
                      <p style={{ fontFamily: C.mono, fontSize: '11px', fontWeight: 500, color: pos ? C.up : C.down }}>{val}</p>
                    </div>
                  ))}
                </div>
              </div>

              <div style={{ background: C.card, borderRadius: '20px', padding: '20px', border: `1px solid ${C.border}` }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
                  <Key size={14} color={C.gold} />
                  <span style={{ fontFamily: C.sans, fontSize: '10px', fontWeight: 800, letterSpacing: '0.1em', color: C.fog, textTransform: 'uppercase' }}>API Key</span>
                </div>
                <div style={{ background: C.bg, border: `1px solid ${C.border}`, borderRadius: '8px', padding: '10px 14px', fontFamily: C.mono, fontSize: '11px', color: C.fog, letterSpacing: '0.04em', marginBottom: '14px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {user.apiKey ? `${user.apiKey.slice(0, 8)}••••••••••••` : 'ล็อคอินเพื่อรับ Key'}
                </div>
                <button onClick={() => navigate('/docs')} style={{ width: '100%', background: C.gold, border: 'none', padding: '10px', borderRadius: '8px', color: '#0A0806', fontFamily: C.sans, fontWeight: 800, fontSize: '11px', cursor: 'pointer', letterSpacing: '0.08em', textTransform: 'uppercase' }}>
                  Manage Keys
                </button>
              </div>

              <div style={{ background: C.card, borderRadius: '20px', padding: '20px', border: `1px solid ${C.border}`, position: 'relative', overflow: 'hidden' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
                  <Activity size={14} color={C.gold} />
                  <span style={{ fontFamily: C.sans, fontSize: '10px', fontWeight: 800, letterSpacing: '0.1em', color: C.fog, textTransform: 'uppercase' }}>Advanced Stats</span>
                </div>
                {user.plan !== 'gold' ? (
                  <div style={{ padding: '16px 0', textAlign: 'center' }}>
                    <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: C.goldPale, border: `1px solid ${C.border}`, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 12px' }}>
                      <Lock size={16} color={C.gold} />
                    </div>
                    <p style={{ fontFamily: C.sans, fontSize: '12px', color: C.muted, marginBottom: '14px' }}>เฉพาะแผน Gold เท่านั้น</p>
                    <button onClick={() => navigate('/pricing')} className="btn-upgrade" style={{ background: C.gold, border: 'none', color: C.bg, padding: '8px 20px', borderRadius: '8px', fontFamily: C.sans, fontSize: '11px', fontWeight: 800, cursor: 'pointer', letterSpacing: '0.08em', textTransform: 'uppercase' }}>Upgrade</button>
                  </div>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    {[ { label: 'Volatility', value: '1.24%' }, { label: 'Moving Avg', value: '40,720' }, { label: 'Market RSI', value: '62.5' } ].map(({ label, value }) => (
                      <div key={label} style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '10px', borderBottom: `1px solid ${C.border}` }}><span style={{ fontFamily: C.sans, fontSize: '12px', color: C.muted }}>{label}</span><span style={{ fontFamily: C.mono, fontSize: '12px', fontWeight: 500, color: C.text }}>{value}</span></div>
                    ))}
                  </div>
                )}
              </div>
            </aside>
          </div>
        </div>
      </div>
    </>
  );
}

// ─── HELPER COMPONENTS (ห้ามแก้ดีไซน์ - คงเดิม) ───────────────────
function MetricCard({ label, value, trend, delta, pulse }) {
  const isUp = trend === 'up';
  return (
    <div className="card-anim hover-lift" style={{ background: C.card, borderRadius: '20px', padding: '24px', border: `1px solid ${C.border}` }}>
      <p style={{ fontFamily: C.sans, fontSize: '10px', fontWeight: 700, color: C.muted, textTransform: 'uppercase', letterSpacing: '0.12em', marginBottom: '16px' }}>{label}</p>
      <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between' }}>
        <div>
          <p style={{ fontFamily: C.mono, fontSize: '30px', fontWeight: 500, color: C.goldLt, lineHeight: 1, marginBottom: '8px', textShadow: pulse ? `0 0 20px rgba(232,197,106,0.4)` : 'none', transition: 'text-shadow 0.4s ease' }}>฿{value.toLocaleString()}</p>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '5px', background: isUp ? C.upBg : C.downBg, border: `1px solid ${isUp ? 'rgba(74,222,128,0.2)' : 'rgba(248,113,113,0.2)'}`, padding: '3px 10px', borderRadius: '20px' }}>
            {isUp ? <TrendingUp size={12} color={C.up} /> : <TrendingDown size={12} color={C.down} />}
            <span style={{ fontFamily: C.mono, fontSize: '11px', fontWeight: 500, color: isUp ? C.up : C.down }}>{delta}</span>
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'flex-end', gap: '3px', paddingBottom: '4px' }}>
          {[40, 60, 45, 80, 65, 90, 75].map((h, i) => (
            <div key={i} style={{ width: '3px', height: `${h * 0.5}px`, background: isUp ? `rgba(184,135,42,${0.3 + (i / 7) * 0.7})` : `rgba(158,144,128,${0.2 + (i / 7) * 0.5})`, borderRadius: '2px' }} />
          ))}
        </div>
      </div>
    </div>
  );
}

function LockedOverlay({ tier }) {
  const navigate = useNavigate();
  return (
    <div style={{ position: 'absolute', inset: 0, background: 'rgba(15,13,9,0.75)', backdropFilter: 'blur(6px)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', borderRadius: '20px', zIndex: 10 }}>
      <div style={{ width: '52px', height: '52px', borderRadius: '50%', background: C.goldPale, border: `1px solid ${C.borderHi}`, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '14px', boxShadow: `0 0 32px rgba(184,135,42,0.2)` }}>
        <Lock size={20} color={C.gold} />
      </div>
      <h4 style={{ fontFamily: C.sans, fontSize: '16px', fontWeight: 800, color: C.text, marginBottom: '6px' }}>Feature Locked</h4>
      <p style={{ fontFamily: C.sans, fontSize: '12px', color: C.fog, marginBottom: '20px' }}>อัปเกรดเป็น {tier} เพื่อปลดล็อก</p>
      <button onClick={() => navigate('/pricing')} style={{ background: 'none', border: `1px solid ${C.gold}`, color: C.gold, padding: '8px 22px', borderRadius: '8px', fontFamily: C.sans, fontSize: '11px', fontWeight: 800, cursor: 'pointer', letterSpacing: '0.1em', textTransform: 'uppercase' }}>Upgrade Now</button>
    </div>
  );
}

const ChartTooltip = ({ active, payload }) => {
  if (!active || !payload?.length) return null;
  return (
    <div style={{ background: '#1a1508', border: `1px solid ${C.border}`, borderRadius: '10px', padding: '10px 14px' }}>
      <p style={{ fontFamily: C.mono, fontSize: '10px', color: C.muted, marginBottom: '4px' }}>{payload[0].payload.time}</p>
      <p style={{ fontFamily: C.mono, fontSize: '14px', fontWeight: 500, color: C.goldLt }}>฿{payload[0].value.toLocaleString()}</p>
    </div>
  );
};