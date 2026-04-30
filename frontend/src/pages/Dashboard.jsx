import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import {
  BarChart3, Lock, RefreshCw, Activity, Shield
} from 'lucide-react';
import {
  ComposedChart, Area, Line, XAxis, YAxis,
  CartesianGrid, Tooltip, ResponsiveContainer,
} from 'recharts';

// ─── DESIGN TOKENS ───────────────────────────────────────────────────
const C = {
  bg: '#080604', surface: '#0F0D09', card: '#141109', cardHi: '#1A1610',
  border: 'rgba(184,135,42,0.12)', borderHi: 'rgba(184,135,42,0.28)',
  gold: '#B8872A', goldLt: '#E8C56A', goldPale: 'rgba(184,135,42,0.08)', goldGlow: 'rgba(184,135,42,0.18)',
  text: '#EDE8DC', muted: '#6B6255', fog: '#9E9080',
  up: '#4ade80', down: '#f87171', upBg: 'rgba(74,222,128,0.08)', downBg: 'rgba(248,113,113,0.08)',
  serif: "'Cormorant Garamond', serif", sans: "'Syne', sans-serif", mono: "'DM Mono', monospace",
};

export default function Dashboard() {
  const navigate = useNavigate();

  // ดึงข้อมูลผู้ใช้จาก LocalStorage
  const [user] = useState({
    name: localStorage.getItem('gt_user_name') || 'User',
    plan: localStorage.getItem('gt_user_plan') || 'basic',
  });

  const [goldData, setGoldData] = useState({ sellPrice: 0, buyPrice: 0 });
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const token = localStorage.getItem('token');
      // 1. ดึงราคาล่าสุด
      const response = await axios.get('http://localhost:3000/prices/latest', {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      const latestPrice = response.data.data.price;
      setGoldData({
        sellPrice: latestPrice,
        buyPrice: latestPrice - 100
      });

      // 2. ดึงประวัติราคาทอง
      const historyRes = await axios.get('http://localhost:3000/prices/history', {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      const formattedHistory = historyRes.data.data.map(item => ({
        time: new Date(item.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        ts: new Date(item.timestamp).getTime(),
        price: item.price
      }));

      setHistory(formattedHistory);

    } catch (err) {
      console.error("Fetch Error:", err);
      setError("ไม่สามารถดึงข้อมูลได้ โปรดตรวจสอบการเชื่อมต่อเซิร์ฟเวอร์");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 60000);
    return () => clearInterval(interval);
  }, [fetchData]);

  const isBasic = user.plan === 'basic';

  // ── Time range filter ──────────────────────────────────────────────
  const [timeRange, setTimeRange] = useState('24H');

  const filteredHistory = (() => {
    if (!history.length) return [];
    const now = Date.now();
    const cutoff = { '1H': 60, '6H': 360, '24H': 1440 }[timeRange] * 60 * 1000;
    const slice = history.filter(d => now - (d.ts || 0) <= cutoff);
    return slice.length >= 2 ? slice : history;
  })();

  // ── Moving Average (window = 5) ────────────────────────────────────
  const chartData = filteredHistory.map((d, i, arr) => {
    const window = arr.slice(Math.max(0, i - 4), i + 1);
    const ma = window.reduce((s, x) => s + x.price, 0) / window.length;
    return { ...d, ma: parseFloat(ma.toFixed(2)) };
  });

  const prices = chartData.map(d => d.price);
  const priceHi = prices.length ? Math.max(...prices) : 0;
  const priceLo = prices.length ? Math.min(...prices) : 0;

  const exportToCSV = () => {
    if (history.length === 0) return;
    const avgPrice = chartData.reduce((s, x) => s + x.price, 0) / chartData.length;
    const reportDate = new Date().toLocaleString('th-TH');

    const reportHeader = [
      ["GOLD TRACKER - PREMIUM REPORT"],
      [`Export Date: ${reportDate}`],
      [`Account: ${user.name} (${user.plan.toUpperCase()} Plan)`],
      [""],
      ["MARKET SUMMARY"],
      [`Highest Price: ฿${priceHi.toLocaleString()}`],
      [`Lowest Price: ฿${priceLo.toLocaleString()}`],
      [`Average Price: ฿${avgPrice.toFixed(2)}`],
      [""]
    ];

    const dataHeaders = ["No.", "Date", "Time", "Price (THB)", "MA(5)"];
    const dataRows = chartData.map((item, index) => {
      const dt = new Date(item.ts);
      return [
        index + 1,
        dt.toLocaleDateString('th-TH'),
        dt.toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' }),
        item.price,
        item.ma || "N/A"
      ];
    });

    const allContent = [
      ...reportHeader,
      dataHeaders,
      ...dataRows
    ].map(row => row.join(",")).join("\n");

    const csvContent = "data:text/csv;charset=utf-8,\uFEFF" + allContent;
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `Gold_Report_${user.name}_${new Date().getTime()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

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
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                  <div>
                    <h3 style={{ fontFamily: C.sans, fontSize: '15px', fontWeight: 800 }}>Market Analysis</h3>
                    {!isBasic && prices.length > 0 && (
                      <div style={{ display: 'flex', gap: 16, marginTop: 6 }}>
                        <span style={{ fontSize: 10, fontFamily: C.mono, color: C.up }}>
                          H: ฿{priceHi.toLocaleString()}
                        </span>
                        <span style={{ fontSize: 10, fontFamily: C.mono, color: C.down }}>
                          L: ฿{priceLo.toLocaleString()}
                        </span>
                        <span style={{ fontSize: 10, fontFamily: C.mono, color: C.fog }}>
                          Δ: ฿{(priceHi - priceLo).toLocaleString()}
                        </span>
                      </div>
                    )}
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    {error && <span style={{ color: C.down, fontSize: '12px' }}>{error}</span>}
                    {!isBasic && (
                      <div style={{ display: 'flex', background: C.surface, border: `1px solid ${C.border}`, borderRadius: 8, overflow: 'hidden' }}>
                        {['1H', '6H', '24H'].map(r => (
                          <button
                            key={r}
                            onClick={() => setTimeRange(r)}
                            style={{
                              padding: '5px 12px', border: 'none', cursor: 'pointer',
                              fontFamily: C.sans, fontSize: 10, fontWeight: 700,
                              background: timeRange === r ? C.gold : 'transparent',
                              color: timeRange === r ? C.bg : C.fog,
                              transition: 'all .2s',
                            }}
                          >{r}</button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                {isBasic ? (
                  <LockedOverlay tier="Silver" />
                ) : (
                  <>
                    <div style={{ display: 'flex', gap: 16, marginBottom: 12 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                        <div style={{ width: 20, height: 2, background: C.gold, borderRadius: 1 }} />
                        <span style={{ fontSize: 9, fontFamily: C.sans, fontWeight: 700, color: C.fog, textTransform: 'uppercase' }}>Price</span>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                        <div style={{ width: 20, height: 2, background: '#7ABFE0', borderRadius: 1, borderTop: '1px dashed #7ABFE0' }} />
                        <span style={{ fontSize: 9, fontFamily: C.sans, fontWeight: 700, color: C.fog, textTransform: 'uppercase' }}>MA(5)</span>
                      </div>
                    </div>

                    <div style={{ height: '240px' }}>
                      <ResponsiveContainer width="100%" height="100%">
                        <ComposedChart data={chartData} margin={{ top: 4, right: 4, left: 0, bottom: 0 }}>
                          <defs>
                            <linearGradient id="goldGrad" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="0%" stopColor={C.gold} stopOpacity={0.22} />
                              <stop offset="100%" stopColor={C.gold} stopOpacity={0} />
                            </linearGradient>
                          </defs>
                          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.03)" />
                          <XAxis dataKey="time" stroke="transparent" tick={{ fill: C.muted, fontSize: 9, fontFamily: C.mono }} tickLine={false} interval="preserveStartEnd" />
                          <YAxis orientation="right" stroke="transparent" tick={{ fill: C.muted, fontSize: 9, fontFamily: C.mono }} tickLine={false} tickFormatter={v => `฿${(v / 1000).toFixed(0)}k`} domain={['auto', 'auto']} width={48} />
                          <Tooltip content={<ChartTooltip />} cursor={{ stroke: 'rgba(184,135,42,0.3)', strokeWidth: 1, strokeDasharray: '4 3' }} />
                          <Area type="monotone" dataKey="price" stroke={C.gold} strokeWidth={2} fill="url(#goldGrad)" dot={false} activeDot={{ r: 4, fill: C.gold, stroke: C.bg, strokeWidth: 2 }} />
                          <Line type="monotone" dataKey="ma" stroke="#7ABFE0" strokeWidth={1.5} strokeDasharray="5 3" dot={false} activeDot={false} />
                        </ComposedChart>
                      </ResponsiveContainer>
                    </div>
                  </>
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

              <div style={{ background: C.card, borderRadius: '20px', padding: '20px', border: `1px solid ${C.border}`, position: 'relative' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
                  <BarChart3 size={14} color={C.gold} />
                  <span style={{ fontSize: '10px', fontWeight: 800, color: C.fog, textTransform: 'uppercase' }}>Data Management</span>
                </div>
                <p style={{ fontSize: '11px', color: C.muted, marginBottom: 16, lineHeight: 1.4 }}>
                  ดาวน์โหลดข้อมูลประวัติราคาทองคำเพื่อนำไปวิเคราะห์ต่อในรูปแบบไฟล์ CSV
                </p>
                <button
                  onClick={exportToCSV}
                  disabled={isBasic}
                  style={{
                    width: '100%', padding: '10px', borderRadius: '8px',
                    background: isBasic ? 'rgba(255,255,255,0.05)' : C.goldPale,
                    border: `1px solid ${isBasic ? 'rgba(255,255,255,0.05)' : C.gold}`,
                    color: isBasic ? C.muted : C.goldLt,
                    fontSize: '11px', fontWeight: 700, cursor: isBasic ? 'not-allowed' : 'pointer',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8
                  }}
                >
                  {isBasic ? <Lock size={12} /> : <Activity size={12} />}
                  {isBasic ? 'LOCKED FOR BASIC' : 'EXPORT TO CSV'}
                </button>
              </div>

              <div style={{ background: C.card, borderRadius: '20px', padding: '20px', border: `1px solid ${C.border}`, textAlign: 'center' }}>
                <Activity size={14} color={C.gold} style={{ marginBottom: 10 }} />
                <p style={{ fontSize: '10px', fontWeight: 800, color: C.fog, textTransform: 'uppercase', marginBottom: 10 }}>Advanced Analytics</p>
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

// ─── HELPER COMPONENTS ───────────────────────────────────────────
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

const ChartTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  const price = payload.find(p => p.dataKey === 'price')?.value;
  const ma = payload.find(p => p.dataKey === 'ma')?.value;
  return (
    <div style={{ background: '#1a1508', border: `1px solid ${C.borderHi}`, borderRadius: 12, padding: '12px 16px', minWidth: 160 }}>
      <div style={{ fontFamily: C.mono, fontSize: 9, color: C.fog, textTransform: 'uppercase', marginBottom: 8 }}>{label}</div>
      {price != null && (
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
          <span style={{ fontSize: 10, color: C.fog }}>Price</span>
          <span style={{ fontFamily: C.mono, fontSize: 15, color: C.goldLt }}>฿{price.toLocaleString()}</span>
        </div>
      )}
      {ma != null && (
        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
          <span style={{ fontSize: 10, color: C.fog }}>MA(5)</span>
          <span style={{ fontFamily: C.mono, fontSize: 13, color: '#7ABFE0' }}>฿{ma.toLocaleString()}</span>
        </div>
      )}
    </div>
  );
};