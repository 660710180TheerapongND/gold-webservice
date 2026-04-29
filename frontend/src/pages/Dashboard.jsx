import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios'; 
import { 
  BarChart3, Lock, RefreshCw, Activity, Shield
} from 'lucide-react';
import {
  AreaChart, Area, XAxis, YAxis,
  CartesianGrid, Tooltip, ResponsiveContainer,
} from 'recharts';

// ─── DESIGN TOKENS (คงเดิมตามดีไซน์ของหัวหน้า) ────────────────────────────────
const C = {
  bg:       '#080604', surface:  '#0F0D09', card:     '#141109', cardHi:   '#1A1610',
  border:   'rgba(184,135,42,0.12)', borderHi: 'rgba(184,135,42,0.28)',
  gold:     '#B8872A', goldLt:   '#E8C56A', goldPale: 'rgba(184,135,42,0.08)', goldGlow: 'rgba(184,135,42,0.18)',
  text:     '#EDE8DC', muted:    '#6B6255', fog:      '#9E9080',
  up:       '#4ade80', down:     '#f87171', upBg:     'rgba(74,222,128,0.08)', downBg:   'rgba(248,113,113,0.08)',
  serif:    "'Cormorant Garamond', serif", sans:     "'Syne', sans-serif", mono:     "'DM Mono', monospace",
};

export default function Dashboard() {
  const navigate = useNavigate();

  // 🚀 ดึงข้อมูลแผนจาก LocalStorage เพื่อใช้ในการล็อกฟีเจอร์
  const [user] = useState({
    name: localStorage.getItem('gt_user_name') || 'User',
    plan: localStorage.getItem('gt_user_plan') || 'basic',
  });

  const [goldData, setGoldData] = useState({ sellPrice: 0, buyPrice: 0 });
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // 🚀 ฟังก์ชันดึงข้อมูลแบบไม่ต้องใช้ API Key
  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      // 1. ดึงราคาทองล่าสุด (ตัด /api ออก และไม่ส่ง Header Key)
      const response = await axios.get('http://localhost:3000/prices/latest');
      const latestPrice = response.data.data.price; 
      
      setGoldData({
        sellPrice: latestPrice,
        buyPrice: latestPrice - 100 // จำลองส่วนต่างราคารับซื้อ
      });

      // 2. ดึงข้อมูลประวัติแยกต่างหาก
      const historyRes = await axios.get('http://localhost:3000/prices/history');
      
      // แปลงข้อมูลให้ Recharts อ่านได้
      const formattedHistory = historyRes.data.data.map(item => ({
        time: new Date(item.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        price: item.price
      }));
      
      setHistory(formattedHistory);

    } catch (err) {
      console.error("Fetch Error:", err);
      setError("ไม่สามารถดึงข้อมูลจาก Server ได้");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 60000); // ดึงข้อมูลใหม่ทุกนาที
    return () => clearInterval(interval);
  }, [fetchData]);

  const isBasic = user.plan === 'basic';

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,600;1,300;1,400;1,600&family=Syne:wght@400;500;700;800&family=DM+Mono:wght@400;500&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        body { background: ${C.bg}; }
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes fadeUp { from { opacity: 0; transform: translateY(16px); } to { opacity: 1; transform: translateY(0); } }
        .card-anim { animation: fadeUp 0.5s ease both; }
        .hover-lift { transition: transform 0.2s ease, border-color 0.2s ease; }
        .hover-lift:hover { transform: translateY(-2px); border-color: ${C.borderHi} !important; }
      `}</style>

      <div style={{ background: C.bg, minHeight: '100vh', fontFamily: C.sans, color: C.text, padding: '32px 40px' }}>
        <div style={{ maxWidth: '1280px', margin: '0 auto' }}>

          <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '36px', paddingBottom: '28px', borderBottom: `1px solid ${C.border}` }}>
            <div>
              <h1 style={{ fontFamily: C.serif, fontStyle: 'italic', fontWeight: 300, fontSize: '46px', color: C.text, lineHeight: 1 }}>Terminal Dashboard</h1>
              <p style={{ fontSize: '13px', color: C.muted, marginTop: '8px' }}>
                Welcome, <span style={{ color: C.text, fontWeight: 600 }}>{user.name}</span>
                <span style={{ margin: '0 10px', opacity: 0.4 }}>·</span>
                <span style={{ color: C.goldLt, fontWeight: 800, fontSize: '11px', textTransform: 'uppercase', background: C.goldPale, padding: '2px 8px', borderRadius: '4px', border: `1px solid ${C.border}` }}>{user.plan} account</span>
              </p>
            </div>
            <button onClick={fetchData} style={{ background: C.card, color: C.text, border: `1px solid ${C.border}`, padding: '10px 20px', borderRadius: '10px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', fontWeight: 700 }}>
              <RefreshCw size={14} color={C.gold} style={loading ? { animation: 'spin 1s linear infinite' } : {}} />
              {loading ? 'Updating...' : 'Refresh Data'}
            </button>
          </header>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 300px', gap: '24px' }}>
            <main style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <MetricCard label="ราคาขาย (Sell)" value={goldData.sellPrice} trend="up" delta="+0.37%" />
                <MetricCard label="ราคารับซื้อ (Buy)" value={goldData.buyPrice} trend="down" delta="-0.12%" />
              </div>

              <div className="hover-lift" style={{ background: C.card, borderRadius: '20px', padding: '24px', border: `1px solid ${C.border}`, position: 'relative', minHeight: '320px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                   <h3 style={{ fontFamily: C.sans, fontSize: '15px', fontWeight: 800 }}>Market Analysis</h3>
                   {error && <span style={{ color: C.down, fontSize: '12px' }}>{error}</span>}
                </div>

                {/* 🚀 ล็อกฟีเจอร์สำหรับ Basic Plan */}
                {isBasic ? (
                  <LockedOverlay tier="Silver" />
                ) : (
                  <div style={{ height: '220px' }}>
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={history}>
                        <defs><linearGradient id="goldGrad" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor={C.gold} stopOpacity={0.25} /><stop offset="100%" stopColor={C.gold} stopOpacity={0} /></linearGradient></defs>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.03)" />
                        <XAxis dataKey="time" stroke={C.muted} fontSize={10} />
                        <YAxis hide domain={['auto', 'auto']} />
                        <Tooltip content={<ChartTooltip />} />
                        <Area type="monotone" dataKey="price" stroke={C.gold} strokeWidth={2} fill="url(#goldGrad)" dot={false} />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                )}
              </div>
            </main>

            <aside style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div style={{ background: C.card, borderRadius: '20px', padding: '20px', border: `1px solid ${C.border}` }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
                   <Shield size={14} color={C.gold} />
                   <span style={{ fontSize: '10px', fontWeight: 800, color: C.fog, textTransform: 'uppercase' }}>Account Security</span>
                </div>
                <p style={{ fontSize: '11px', color: C.muted, lineHeight: 1.5 }}>
                  เซสชันของคุณได้รับการป้องกันผ่าน Token-based Authentication
                </p>
              </div>

              <div style={{ background: C.card, borderRadius: '20px', padding: '20px', border: `1px solid ${C.border}`, textAlign: 'center' }}>
                <Activity size={14} color={C.gold} style={{ marginBottom: 10 }} />
                <p style={{ fontSize: '10px', fontWeight: 800, color: C.fog, textTransform: 'uppercase', marginBottom: 10 }}>Advanced Analytics</p>
                
                {/* 🚀 ล็อกฟีเจอร์ระดับสูง */}
                {user.plan !== 'gold' ? (
                  <button onClick={() => navigate('/pricing')} style={{ width: '100%', background: C.gold, border: 'none', padding: '8px', borderRadius: '6px', color: C.bg, fontWeight: 800, fontSize: '10px', cursor: 'pointer' }}>UPGRADE TO GOLD</button>
                ) : (
                  <div style={{ textAlign: 'left' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', marginBottom: 5 }}><span>Volatility:</span> 1.24%</div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px' }}><span>RSI:</span> 62.5</div>
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

// ─── HELPER COMPONENTS (คงเดิม) ───────────────────────────────────
function MetricCard({ label, value, trend, delta }) {
  const isUp = trend === 'up';
  return (
    <div className="card-anim hover-lift" style={{ background: C.card, borderRadius: '20px', padding: '24px', border: `1px solid ${C.border}` }}>
      <p style={{ fontSize: '10px', fontWeight: 700, color: C.muted, textTransform: 'uppercase', marginBottom: '16px' }}>{label}</p>
      <p style={{ fontFamily: C.mono, fontSize: '30px', fontWeight: 500, color: C.goldLt }}>฿{value.toLocaleString()}</p>
      <div style={{ display: 'inline-flex', alignItems: 'center', gap: '5px', background: isUp ? C.upBg : C.downBg, padding: '3px 10px', borderRadius: '20px', marginTop: 10 }}>
        <span style={{ fontSize: '11px', color: isUp ? C.up : C.down }}>{isUp ? '▲' : '▼'} {delta}</span>
      </div>
    </div>
  );
}

function LockedOverlay({ tier }) {
  const navigate = useNavigate();
  return (
    <div style={{ position: 'absolute', inset: 0, background: 'rgba(15,13,9,0.85)', backdropFilter: 'blur(6px)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', borderRadius: '20px', zIndex: 10 }}>
      <Lock size={24} color={C.gold} style={{ marginBottom: 15 }} />
      <h4 style={{ fontSize: '16px', fontWeight: 800, color: C.text }}>Feature Locked</h4>
      <p style={{ fontSize: '12px', color: C.fog, marginBottom: '20px' }}>อัปเกรดเป็น {tier} เพื่อดูข้อมูลย้อนหลัง</p>
      <button onClick={() => navigate('/pricing')} style={{ background: 'none', border: `1px solid ${C.gold}`, color: C.gold, padding: '8px 22px', borderRadius: '8px', fontWeight: 800, cursor: 'pointer' }}>Upgrade Now</button>
    </div>
  );
}

const ChartTooltip = ({ active, payload }) => {
  if (!active || !payload?.length) return null;
  return (
    <div style={{ background: '#1a1508', border: `1px solid ${C.border}`, borderRadius: '10px', padding: '10px' }}>
      <p style={{ fontFamily: C.mono, fontSize: '14px', fontWeight: 500, color: C.goldLt }}>฿{payload[0].value.toLocaleString()}</p>
    </div>
  );
};