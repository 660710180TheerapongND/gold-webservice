// Dashboard.jsx
// Dependencies: npm install axios recharts
// Google Fonts — เพิ่มใน index.html หรือ index.css:
//   @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;700;900&family=DM+Mono:wght@400;500&family=DM+Sans:wght@300;400;500&display=swap');

import React, { useState, useEffect, useCallback, useRef } from 'react';
import axios from 'axios';
import {
  AreaChart, Area, LineChart, Line, BarChart, Bar,
  XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer,
} from 'recharts';

// ─── CSS ──────────────────────────────────────────────────────────────────────
const css = `
  @keyframes pulse    { 0%,100%{opacity:1} 50%{opacity:.3} }
  @keyframes spin     { from{transform:rotate(0deg)} to{transform:rotate(360deg)} }
  @keyframes slideDown{ from{opacity:0;transform:translateY(-8px)} to{opacity:1;transform:translateY(0)} }

  .gt-wrap { font-family:'DM Sans',sans-serif; background:#FDFAF4; border:1px solid rgba(200,146,42,.2); border-radius:12px; overflow:hidden; padding-bottom:2rem; }

  /* TOPBAR */
  .gt-topbar { background:#1A1410; padding:.6rem 1.5rem; display:flex; align-items:center; justify-content:space-between; gap:8px; }
  .gt-topbar-left { display:flex; align-items:center; gap:10px; }
  .gt-topbar-title { font-family:'Playfair Display',serif; font-size:13px; font-weight:700; color:#E8B84B; letter-spacing:.2em; text-transform:uppercase; }
  .gt-topbar-date  { font-family:'DM Mono',monospace; font-size:11px; color:rgba(255,255,255,.4); }
  .gt-dot { width:7px; height:7px; border-radius:50%; display:inline-block; margin-right:6px; transition:background .4s; }
  .gt-dot-ok     { background:#E8B84B; animation:pulse 2s infinite; }
  .gt-dot-error  { background:#E07070; }
  .gt-dot-offline{ background:#666; }

  /* AUTH BADGE */
  .gt-auth-badge { display:flex; align-items:center; gap:5px; padding:3px 10px; border-radius:4px; font-size:10px; font-weight:500; letter-spacing:.08em; cursor:pointer; transition:all .2s; border:none; font-family:'DM Sans',sans-serif; }
  .gt-auth-ok   { background:rgba(45,122,74,.25); color:#5ABF7E; border:1px solid rgba(45,122,74,.3); }
  .gt-auth-none { background:rgba(160,48,48,.2);  color:#E07070; border:1px solid rgba(160,48,48,.3); }
  .gt-auth-ok:hover   { background:rgba(45,122,74,.4); }
  .gt-auth-none:hover { background:rgba(160,48,48,.35); }

  /* ERROR BANNER */
  .gt-error-banner { animation:slideDown .3s ease; background:#2A1010; border-bottom:1px solid rgba(224,112,112,.25); padding:.6rem 1.5rem; display:flex; align-items:center; justify-content:space-between; gap:10px; }
  .gt-error-text { font-size:12px; color:#E07070; display:flex; align-items:center; gap:7px; }
  .gt-error-dismiss { background:none; border:1px solid rgba(224,112,112,.3); border-radius:4px; color:#E07070; font-size:10px; padding:2px 8px; cursor:pointer; font-family:'DM Sans',sans-serif; }
  .gt-error-dismiss:hover { background:rgba(224,112,112,.1); }

  /* API KEY MODAL */
  .gt-modal-overlay { position:fixed; inset:0; background:rgba(26,20,16,.7); z-index:100; display:flex; align-items:center; justify-content:center; }
  .gt-modal { background:#FDFAF4; border-radius:12px; padding:1.75rem; width:360px; border:1px solid rgba(200,146,42,.2); box-shadow:0 20px 60px rgba(0,0,0,.3); }
  .gt-modal-title { font-family:'Playfair Display',serif; font-size:18px; font-weight:700; color:#1A1410; margin-bottom:.25rem; }
  .gt-modal-sub   { font-size:12px; color:#9E8A6E; margin-bottom:1.25rem; }
  .gt-modal-label { font-size:10px; font-weight:500; letter-spacing:.1em; text-transform:uppercase; color:#8B6210; margin-bottom:6px; display:block; }
  .gt-modal-input { width:100%; background:#F5EDD8; border:1px solid rgba(200,146,42,.3); border-radius:6px; padding:8px 12px; font-family:'DM Mono',monospace; font-size:13px; color:#1A1410; outline:none; box-sizing:border-box; }
  .gt-modal-input:focus { border-color:#C8922A; }
  .gt-modal-hint  { font-size:11px; color:#9E8A6E; margin-top:6px; margin-bottom:1.25rem; }
  .gt-modal-actions { display:flex; gap:8px; justify-content:flex-end; }
  .gt-modal-cancel { background:none; border:1px solid rgba(200,146,42,.3); border-radius:5px; padding:6px 14px; font-size:12px; color:#8B6210; cursor:pointer; font-family:'DM Sans',sans-serif; }
  .gt-modal-cancel:hover { background:#F5EDD8; }
  .gt-modal-save   { background:#C8922A; border:none; border-radius:5px; padding:6px 16px; font-size:12px; color:#fff; cursor:pointer; font-weight:500; font-family:'DM Sans',sans-serif; }
  .gt-modal-save:hover { background:#B07820; }

  /* HERO */
  .gt-hero { background:linear-gradient(135deg,#1A1410 0%,#2E2010 60%,#3D2D12 100%); padding:2rem 1.5rem 1.5rem; position:relative; overflow:hidden; }
  .gt-hero::before { content:''; position:absolute; inset:0; background:repeating-linear-gradient(-45deg,transparent,transparent 40px,rgba(200,146,42,.03) 40px,rgba(200,146,42,.03) 41px); pointer-events:none; }
  .gt-hero-label { font-size:10px; font-weight:500; color:rgba(200,146,42,.6); letter-spacing:.25em; text-transform:uppercase; margin-bottom:.75rem; }
  .gt-hero-prices { display:grid; grid-template-columns:1fr 1fr; gap:10px; margin-bottom:1rem; }
  .gt-hero-price-card { background:rgba(255,255,255,.06); border:1px solid rgba(200,146,42,.2); border-radius:8px; padding:.75rem 1rem; }
  .gt-hero-price-card-label { font-size:9px; letter-spacing:.2em; text-transform:uppercase; margin-bottom:4px; font-weight:500; }
  .gt-hero-price-card-value { font-family:'DM Mono',monospace; font-size:22px; font-weight:500; }
  .gt-sell-label { color:rgba(232,184,75,.6); }
  .gt-sell-value { color:#E8B84B; }
  .gt-buy-label  { color:rgba(90,191,126,.6); }
  .gt-buy-value  { color:#5ABF7E; }

  .gt-badge { display:inline-flex; align-items:center; gap:5px; padding:4px 12px; border-radius:4px; font-size:11px; font-weight:500; letter-spacing:.08em; margin-bottom:1rem; }
  .gt-badge-up   { background:rgba(45,122,74,.2);  color:#5ABF7E; border:1px solid rgba(45,122,74,.3); }
  .gt-badge-down { background:rgba(160,48,48,.2);  color:#E07070; border:1px solid rgba(160,48,48,.3); }

  /* SECTIONS */
  .gt-section { padding:0 1.5rem; margin-top:1.5rem; }
  .gt-section-label { font-size:9px; font-weight:500; letter-spacing:.2em; text-transform:uppercase; color:#8B6210; border-bottom:1px solid rgba(200,146,42,.15); padding-bottom:6px; margin-bottom:1rem; }

  /* STATS */
  .gt-stats { display:grid; grid-template-columns:1fr 1fr 1fr; gap:10px; }
  .gt-stat  { background:#F5EDD8; border:1px solid rgba(200,146,42,.15); border-radius:8px; padding:.75rem 1rem; }
  .gt-stat-label { font-size:10px; color:#8B6210; font-weight:500; letter-spacing:.1em; text-transform:uppercase; margin-bottom:4px; }
  .gt-stat-value { font-family:'DM Mono',monospace; font-size:18px; font-weight:500; }
  .gt-stat-hi  { color:#2D7A4A; }
  .gt-stat-lo  { color:#A03030; }
  .gt-stat-avg { color:#8B6210; }

  /* CHART TABS */
  .gt-chart-tabs { display:flex; gap:6px; margin-bottom:10px; }
  .gt-tab { background:none; border:1px solid rgba(200,146,42,.2); border-radius:5px; padding:4px 12px; font-size:11px; color:#8B6210; cursor:pointer; font-family:'DM Sans',sans-serif; transition:all .2s; }
  .gt-tab-active { background:#C8922A; border-color:#C8922A; color:#fff; }
  .gt-tab:not(.gt-tab-active):hover { background:#F5EDD8; }

  /* LEGEND */
  .gt-legend { display:flex; gap:14px; margin-bottom:8px; }
  .gt-legend-item { display:flex; align-items:center; gap:5px; font-size:11px; color:#9E8A6E; }
  .gt-legend-dot  { width:10px; height:10px; border-radius:2px; flex-shrink:0; }

  /* TABLE */
  .gt-table-wrap { border:1px solid rgba(200,146,42,.12); border-radius:8px; overflow:hidden; }
  .gt-table { width:100%; border-collapse:collapse; font-size:13px; }
  .gt-table thead th { background:#F5EDD8; color:#8B6210; font-size:9px; letter-spacing:.15em; text-transform:uppercase; font-weight:500; padding:8px 14px; text-align:left; border-bottom:1px solid rgba(200,146,42,.15); }
  .gt-table thead th:nth-child(2),
  .gt-table thead th:nth-child(3) { text-align:right; }
  .gt-table thead th:last-child    { text-align:center; }
  .gt-table tbody tr { border-bottom:1px solid rgba(200,146,42,.08); transition:background .15s; }
  .gt-table tbody tr:last-child { border-bottom:none; }
  .gt-table tbody tr:hover { background:#F5EDD8; }
  .gt-table td { padding:9px 14px; color:#3D2F1E; }
  .gt-table td:first-child  { font-family:'DM Mono',monospace; font-size:12px; color:rgba(61,47,30,.5); }
  .gt-table td:nth-child(2),
  .gt-table td:nth-child(3) { text-align:right; font-family:'DM Mono',monospace; font-weight:500; font-size:13px; }
  .gt-table td:last-child   { text-align:center; }
  .gt-pill      { display:inline-block; padding:2px 10px; border-radius:3px; font-size:10px; font-weight:500; letter-spacing:.1em; text-transform:uppercase; }
  .gt-pill-up   { background:#E8F4EC; color:#2D7A4A; }
  .gt-pill-down { background:#F5E8E8; color:#A03030; }

  /* FOOTER */
  .gt-footer { display:flex; align-items:center; justify-content:space-between; padding:0 1.5rem; margin-top:1.5rem; }
  .gt-sync { font-family:'DM Mono',monospace; font-size:10px; color:rgba(61,47,30,.35); }
  .gt-btn  { display:flex; align-items:center; gap:6px; background:transparent; border:1px solid rgba(200,146,42,.4); border-radius:5px; padding:6px 14px; font-size:11px; font-weight:500; color:#C8922A; letter-spacing:.1em; cursor:pointer; transition:all .2s; font-family:'DM Sans',sans-serif; }
  .gt-btn:hover  { background:rgba(200,146,42,.08); border-color:#C8922A; }
  .gt-btn:active { transform:scale(.97); }
  .gt-btn:disabled { opacity:.5; cursor:not-allowed; }
`;

// ─── CONSTANTS ────────────────────────────────────────────────────────────────
const SPREAD = 100; // ส่วนต่างราคารับซื้อ vs ขายออก (บาท)

// ─── MOCK DATA ────────────────────────────────────────────────────────────────
const MOCK_HISTORY = [
  { time: '08:00', sellPrice: 40100, buyPrice: 40000, trend: 'up' },
  { time: '09:00', sellPrice: 40250, buyPrice: 40150, trend: 'up' },
  { time: '10:00', sellPrice: 40200, buyPrice: 40100, trend: 'down' },
  { time: '11:00', sellPrice: 40380, buyPrice: 40280, trend: 'up' },
  { time: '12:00', sellPrice: 40300, buyPrice: 40200, trend: 'down' },
  { time: '13:00', sellPrice: 40500, buyPrice: 40400, trend: 'up' },
  { time: '14:00', sellPrice: 40450, buyPrice: 40350, trend: 'down' },
  { time: '15:00', sellPrice: 40500, buyPrice: 40400, trend: 'up' },
  { time: '16:00', sellPrice: 40620, buyPrice: 40520, trend: 'up' },
  { time: '17:00', sellPrice: 40850, buyPrice: 40750, trend: 'up' },
];

const MOCK_WEEKLY = [
  { day: 'จ',  sell: 40200, buy: 40100 },
  { day: 'อ',  sell: 40450, buy: 40350 },
  { day: 'พ',  sell: 40300, buy: 40200 },
  { day: 'พฤ', sell: 40600, buy: 40500 },
  { day: 'ศ',  sell: 40850, buy: 40750 },
];

// ─── CUSTOM TOOLTIP ───────────────────────────────────────────────────────────
const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div style={{ background: '#1A1410', borderRadius: 8, padding: '8px 12px' }}>
      <p style={{ color: 'rgba(232,184,75,.7)', fontSize: 11, marginBottom: 6 }}>{label}</p>
      {payload.map((p, i) => (
        <p key={i} style={{ color: p.color, fontFamily: "'DM Mono',monospace", fontSize: 13, fontWeight: 500, marginBottom: 2 }}>
          {p.name}: ฿{Number(p.value).toLocaleString('th-TH')}
        </p>
      ))}
    </div>
  );
};

// ─── GRADIENT DEF ─────────────────────────────────────────────────────────────
const GradientDef = () => (
  <defs>
    <linearGradient id="goldGrad" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%"   stopColor="rgba(200,146,42,0.25)" />
      <stop offset="100%" stopColor="rgba(200,146,42,0)" />
    </linearGradient>
  </defs>
);

// ─── API KEY MODAL ────────────────────────────────────────────────────────────
function ApiKeyModal({ currentKey, onSave, onClose }) {
  const [value, setValue] = useState(currentKey || '');
  return (
    <div className="gt-modal-overlay" onClick={onClose}>
      <div className="gt-modal" onClick={e => e.stopPropagation()}>
        <p className="gt-modal-title">API Key Settings</p>
        <p className="gt-modal-sub">ตั้งค่า API Key สำหรับเชื่อมต่อ Backend ของมั้น</p>
        <label className="gt-modal-label">API Key</label>
        <input
          className="gt-modal-input"
          type="password"
          placeholder="gt_live_xxxxxxxxxxxxxxxxxxxx"
          value={value}
          onChange={e => setValue(e.target.value)}
          autoFocus
        />
        <p className="gt-modal-hint">
          Key จะถูกเก็บใน localStorage และส่งเป็น header <code>x-api-key</code> ทุก request
        </p>
        <div className="gt-modal-actions">
          <button className="gt-modal-cancel" onClick={onClose}>ยกเลิก</button>
          <button className="gt-modal-save" onClick={() => onSave(value.trim())}>บันทึก</button>
        </div>
      </div>
    </div>
  );
}

// ─── MAIN COMPONENT ───────────────────────────────────────────────────────────
export default function Dashboard() {
  const fmt     = n => Number(n).toLocaleString('th-TH');
  const nowStr  = () =>
    new Date().toLocaleDateString('th-TH', { weekday: 'short', day: '2-digit', month: 'short' }) +
    ' ' + new Date().toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' });
  const syncStr = () =>
    'Last sync: ' + new Date().toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit', second: '2-digit' });

  const [goldData,   setGoldData]   = useState({ sellPrice: 40850, buyPrice: 40750, trend: 'up', timestamp: new Date().toISOString() });
  const [analytics,  setAnalytics]  = useState({ min: 40000, max: 40850, avg: 40415 });
  const [history,    setHistory]    = useState(MOCK_HISTORY);
  const [weeklyData, setWeeklyData] = useState(MOCK_WEEKLY);
  const [loading,    setLoading]    = useState(false);
  const [error,      setError]      = useState(null);       // ① Error state
  const [syncTime,   setSyncTime]   = useState('');
  const [spinning,   setSpinning]   = useState(false);
  const [chartTab,   setChartTab]   = useState('line');     // ④ 'line' | 'bar'
  const [apiKey,     setApiKey]     = useState(() => localStorage.getItem('gt_api_key') || ''); // ③
  const [showModal,  setShowModal]  = useState(false);
  const intervalRef = useRef(null);

  useEffect(() => {
    const style = document.createElement('style');
    style.textContent = css;
    document.head.appendChild(style);
    return () => document.head.removeChild(style);
  }, []);

  const handleSaveKey = key => {
    setApiKey(key);
    localStorage.setItem('gt_api_key', key);
    setShowModal(false);
    setError(null);
  };

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const headers = apiKey ? { 'x-api-key': apiKey } : {};
      const [resLatest, resHistory, resSummary] = await Promise.all([
        axios.get('http://localhost:3000/api/prices/latest',     { headers }),
        axios.get('http://localhost:3000/api/prices/history',    { headers }),
        axios.get('http://localhost:3000/api/analytics/summary', { headers }),
      ]);
      if (resLatest.data.status  === 'success') setGoldData(resLatest.data.data);
      if (resSummary.data.status === 'success') setAnalytics(resSummary.data.data);
      if (resHistory.data.status === 'success') {
        const formatted = resHistory.data.data.slice(-12).map(item => ({
          time:      new Date(item.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          sellPrice: item.sellPrice ?? item.price,
          buyPrice:  item.buyPrice  ?? item.price - SPREAD,
          trend:     item.trend,
        }));
        setHistory(formatted);
      }
      setError(null); 
    } catch (err) {
      
      const status = err.response?.status;
      if (status === 401 || status === 403) {
        setError('API Key ไม่ถูกต้องหรือหมดอายุ — กด "Auth" เพื่ออัปเดต');
      } else if (err.code === 'ERR_NETWORK' || err.code === 'ECONNREFUSED') {
        setError('เชื่อมต่อ Backend ไม่ได้ — กำลังแสดงข้อมูล Mock');
      } else {
        setError(`เกิดข้อผิดพลาด: ${err.message}`);
      }
    } finally {
      setSyncTime(syncStr());
      setTimeout(() => setLoading(false), 400);
    }
  }, [apiKey]);

  useEffect(() => {
    setSyncTime(syncStr());
    // fetchData();  // ← uncomment เมื่อ Backend พร้อม
    intervalRef.current = setInterval(() => {
      // fetchData(); // ← uncomment เมื่อ Backend พร้อม
    }, 30000);
    return () => clearInterval(intervalRef.current);
  }, [fetchData]);

  const handleRefresh = () => {
    setSpinning(true);
    setTimeout(() => setSpinning(false), 700);

    // fetchData(); // ← uncomment เมื่อ Backend พร้อม

    // Mock simulation — ลบออกเมื่อต่อ Backend จริง ─────────────────
    setHistory(prev => {
      const last     = prev[prev.length - 1];
      const delta    = Math.round((Math.random() - 0.4) * 300);
      const newSell  = last.sellPrice + delta;
      const newBuy   = newSell - SPREAD;
      const newHour  = (parseInt(last.time) + 1).toString().padStart(2, '0') + ':00';
      const next     = [...prev, { time: newHour, sellPrice: newSell, buyPrice: newBuy, trend: delta >= 0 ? 'up' : 'down' }];
      const trimmed  = next.length > 12 ? next.slice(1) : next;
      const sells    = trimmed.map(h => h.sellPrice);
      const buys     = trimmed.map(h => h.buyPrice);
      setGoldData({ sellPrice: newSell, buyPrice: newBuy, trend: delta >= 0 ? 'up' : 'down', timestamp: new Date().toISOString() });
      setAnalytics({
        max: Math.max(...sells),
        min: Math.min(...buys),
        avg: Math.round([...sells, ...buys].reduce((a, b) => a + b, 0) / (sells.length + buys.length)),
      });
      return trimmed;
    });
    setWeeklyData(prev => prev.map(d => ({
      ...d,
      sell: d.sell + Math.round((Math.random() - 0.5) * 200),
      buy:  d.buy  + Math.round((Math.random() - 0.5) * 200),
    })));
    // ─────────────────────────────────────────────────────────────────

    setSyncTime(syncStr());
  };

  // ─── Derived ───────────────────────────────────────────────────────────────
  const dotClass  = error
    ? (error.includes('API Key') ? 'gt-dot gt-dot-error' : 'gt-dot gt-dot-offline')
    : 'gt-dot gt-dot-ok';
  const sparkData = history.map(h => ({ ...h, price: h.sellPrice }));
  const yDomain   = [
    Math.min(...history.map(h => h.buyPrice))  - 150,
    Math.max(...history.map(h => h.sellPrice)) + 150,
  ];

  return (
    <>
      {/* ③ API KEY MODAL */}
      {showModal && (
        <ApiKeyModal currentKey={apiKey} onSave={handleSaveKey} onClose={() => setShowModal(false)} />
      )}

      <div className="gt-wrap">

        {/* TOPBAR */}
        <div className="gt-topbar">
          <span className="gt-topbar-title">
            <span className={dotClass} />
            Gold Tracker
          </span>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            {/* ③ Auth badge */}
            <button
              className={`gt-auth-badge ${apiKey ? 'gt-auth-ok' : 'gt-auth-none'}`}
              onClick={() => setShowModal(true)}
              title="คลิกเพื่อตั้งค่า API Key"
            >
              <svg width="10" height="10" viewBox="0 0 12 12">
                <circle cx="5" cy="5" r="3.5" fill="none" stroke="currentColor" strokeWidth="1.5"/>
                <line x1="7.5" y1="7.5" x2="11" y2="11" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
              </svg>
              {apiKey ? 'Authenticated' : 'No API Key'}
            </button>
            <span className="gt-topbar-date">{nowStr()}</span>
          </div>
        </div>

        {/* ① ERROR BANNER */}
        {error && (
          <div className="gt-error-banner">
            <span className="gt-error-text">
              <svg width="14" height="14" viewBox="0 0 14 14">
                <circle cx="7" cy="7" r="6" fill="none" stroke="#E07070" strokeWidth="1.5"/>
                <line x1="7" y1="4" x2="7" y2="7.5" stroke="#E07070" strokeWidth="1.5" strokeLinecap="round"/>
                <circle cx="7" cy="10" r=".8" fill="#E07070"/>
              </svg>
              {error}
            </span>
            <button className="gt-error-dismiss" onClick={() => setError(null)}>ปิด</button>
          </div>
        )}

        {/* HERO */}
        <div className="gt-hero">
          <div style={{ position: 'relative', zIndex: 1 }}>
            <p className="gt-hero-label">ราคาทองคำ · สมาคมค้าทองคำ</p>

            {/* ② ราคาซื้อ / ขาย */}
            <div className="gt-hero-prices">
              <div className="gt-hero-price-card">
                <p className="gt-hero-price-card-label gt-sell-label">ราคาขายออก</p>
                <p className="gt-hero-price-card-value gt-sell-value">{fmt(goldData.sellPrice)}</p>
              </div>
              <div className="gt-hero-price-card">
                <p className="gt-hero-price-card-label gt-buy-label">ราคารับซื้อ</p>
                <p className="gt-hero-price-card-value gt-buy-value">{fmt(goldData.buyPrice)}</p>
              </div>
            </div>

            <span className={`gt-badge ${goldData.trend === 'up' ? 'gt-badge-up' : 'gt-badge-down'}`}>
              {goldData.trend === 'up'
                ? <svg width="11" height="11" viewBox="0 0 12 12"><polyline points="1,9 5,4 8,7 11,2" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/></svg>
                : <svg width="11" height="11" viewBox="0 0 12 12"><polyline points="1,3 5,8 8,5 11,10" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/></svg>
              }
              {goldData.trend === 'up' ? 'Trending Up' : 'Trending Down'}
            </span>

            {/* Sparkline */}
            <div style={{ height: 60, width: '100%', opacity: 0.65 }}>
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={sparkData} margin={{ top: 4, right: 0, left: 0, bottom: 0 }}>
                  <GradientDef />
                  <Area type="monotone" dataKey="price" stroke="#E8B84B" strokeWidth={2} fill="url(#goldGrad)" dot={false} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* STATS */}
        <div className="gt-section">
          <div className="gt-section-label">สถิติวันนี้</div>
          <div className="gt-stats">
            <div className="gt-stat">
              <p className="gt-stat-label">สูงสุด (ขาย)</p>
              <p className="gt-stat-value gt-stat-hi">{fmt(analytics.max)}</p>
            </div>
            <div className="gt-stat">
              <p className="gt-stat-label">ต่ำสุด (ซื้อ)</p>
              <p className="gt-stat-value gt-stat-lo">{fmt(analytics.min)}</p>
            </div>
            <div className="gt-stat">
              <p className="gt-stat-label">เฉลี่ย</p>
              <p className="gt-stat-value gt-stat-avg">{fmt(analytics.avg)}</p>
            </div>
          </div>
        </div>

        {/* ④ CHART with tabs */}
        <div className="gt-section">
          <div className="gt-section-label">Technical analysis</div>
          <div className="gt-chart-tabs">
            <button className={`gt-tab ${chartTab === 'line' ? 'gt-tab-active' : ''}`} onClick={() => setChartTab('line')}>
              ราคาซื้อ vs ขาย
            </button>
            <button className={`gt-tab ${chartTab === 'bar' ? 'gt-tab-active' : ''}`} onClick={() => setChartTab('bar')}>
              เปรียบเทียบรายวัน
            </button>
          </div>
          <div className="gt-legend">
            <span className="gt-legend-item"><span className="gt-legend-dot" style={{ background: '#E8B84B' }} />ราคาขายออก</span>
            <span className="gt-legend-item"><span className="gt-legend-dot" style={{ background: '#5ABF7E' }} />ราคารับซื้อ</span>
          </div>

          {/* Line chart */}
          {chartTab === 'line' && (
            <div style={{ height: 220, width: '100%' }}>
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={history} margin={{ top: 5, right: 10, left: 0, bottom: 0 }}>
                  <GradientDef />
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(200,146,42,0.08)" />
                  <XAxis dataKey="time" axisLine={{ stroke: 'rgba(200,146,42,0.15)' }} tickLine={false} tick={{ fontFamily: "'DM Mono',monospace", fontSize: 11, fill: '#9E8A6E' }} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fontFamily: "'DM Mono',monospace", fontSize: 11, fill: '#9E8A6E' }} tickFormatter={v => '฿' + v.toLocaleString('th-TH')} domain={yDomain} width={82} />
                  <Tooltip content={<CustomTooltip />} />
                  <Line type="monotone" dataKey="sellPrice" name="ราคาขายออก" stroke="#E8B84B" strokeWidth={2.5} dot={{ r: 3, fill: '#E8B84B', stroke: '#FDFAF4', strokeWidth: 2 }} activeDot={{ r: 5 }} />
                  <Line type="monotone" dataKey="buyPrice"  name="ราคารับซื้อ" stroke="#5ABF7E" strokeWidth={2}   dot={{ r: 3, fill: '#5ABF7E', stroke: '#FDFAF4', strokeWidth: 2 }} activeDot={{ r: 5 }} strokeDasharray="5 3" />
                </LineChart>
              </ResponsiveContainer>
            </div>
          )}

          {/* Bar chart */}
          {chartTab === 'bar' && (
            <div style={{ height: 220, width: '100%' }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={weeklyData} margin={{ top: 5, right: 10, left: 0, bottom: 0 }} barCategoryGap="30%">
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(200,146,42,0.08)" />
                  <XAxis dataKey="day" axisLine={{ stroke: 'rgba(200,146,42,0.15)' }} tickLine={false} tick={{ fontFamily: "'DM Mono',monospace", fontSize: 11, fill: '#9E8A6E' }} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fontFamily: "'DM Mono',monospace", fontSize: 11, fill: '#9E8A6E' }} tickFormatter={v => '฿' + v.toLocaleString('th-TH')} domain={['dataMin - 200', 'dataMax + 100']} width={82} />
                  <Tooltip content={<CustomTooltip />} />
                  <Bar dataKey="sell" name="ราคาขายออก" fill="#C8922A" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="buy"  name="ราคารับซื้อ" fill="#2D7A4A" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>

        {/* HISTORY TABLE */}
        <div className="gt-section">
          <div className="gt-section-label">Market history</div>
          <div className="gt-table-wrap">
            <table className="gt-table">
              <thead>
                <tr>
                  <th>เวลา</th>
                  <th>ขายออก (THB)</th>
                  <th>รับซื้อ (THB)</th>
                  <th>แนวโน้ม</th>
                </tr>
              </thead>
              <tbody>
                {[...history].reverse().map((item, i) => (
                  <tr key={i}>
                    <td>{item.time}</td>
                    <td style={{ color: '#C8922A' }}>{fmt(item.sellPrice)}</td>
                    <td style={{ color: '#2D7A4A' }}>{fmt(item.buyPrice)}</td>
                    <td>
                      <span className={`gt-pill ${item.trend === 'up' ? 'gt-pill-up' : 'gt-pill-down'}`}>
                        {item.trend === 'up' ? '▲ ขึ้น' : '▼ ลง'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* FOOTER */}
        <div className="gt-footer">
          <span className="gt-sync">{error ? '⚠ ' : ''}{syncTime}</span>
          <button className="gt-btn" onClick={handleRefresh} disabled={loading}>
            <svg width="12" height="12" viewBox="0 0 12 12" style={spinning ? { animation: 'spin .7s linear' } : {}}>
              <path d="M10 6A4 4 0 1 1 6 2c1.2 0 2.2.5 3 1.3" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
              <polyline points="9,1 9,4 6,4" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
            </svg>
            {loading ? 'Loading...' : 'Refresh Data'}
          </button>
        </div>

      </div>
    </>
  );
}