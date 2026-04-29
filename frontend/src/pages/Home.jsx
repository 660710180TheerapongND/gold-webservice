import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowRight, TrendingUp, Zap, ShieldCheck, Globe,
  RefreshCw, BarChart3, Code2, CheckCircle2, ChevronDown,
  Activity, Lock, MousePointerClick,
} from 'lucide-react';

// ─── Tokens ──────────────────────────────────────────────────────────────────
const C = {
  ink:       '#0A0806',
  paper:     '#FAF7F0',
  cream:     '#F2EDE0',
  mist:      '#E8E2D4',
  fog:       '#9E9080',
  gold:      '#B8872A',
  goldLt:    '#E8C56A',
  goldPale:  '#F7E9C3',
  goldDk:    '#7A5510',
  serif:     "'Cormorant Garamond', serif",
  sans:      "'Syne', sans-serif",
  mono:      "'DM Mono', monospace",
};

// ─── Inject global CSS ────────────────────────────────────────────────────────
const globalCss = `
  @keyframes fadeUp   { from{opacity:0;transform:translateY(24px)} to{opacity:1;transform:translateY(0)} }
  @keyframes pingGold { 0%,100%{opacity:.8;transform:scale(1)} 50%{opacity:0;transform:scale(2.2)} }
  @keyframes ticker   { from{transform:translateX(0)} to{transform:translateX(-50%)} }
  @keyframes drawLine { from{stroke-dashoffset:600} to{stroke-dashoffset:0} }

  .fade-up { opacity:0; animation: fadeUp 0.7s ease forwards; }
  .fade-up-1 { animation-delay: 0.1s; }
  .fade-up-2 { animation-delay: 0.22s; }
  .fade-up-3 { animation-delay: 0.36s; }
  .fade-up-4 { animation-delay: 0.5s; }
  .fade-up-5 { animation-delay: 0.64s; }

  .gt-nav-link { font-family:'Syne',sans-serif; font-size:11px; font-weight:700; letter-spacing:.12em; text-transform:uppercase; color:rgba(255,255,255,.45); text-decoration:none; transition:color .2s; }
  .gt-nav-link:hover { color:rgba(255,255,255,.9); }

  .gt-btn-gold {
    display:inline-flex; align-items:center; gap:8px;
    background:linear-gradient(135deg,#B8872A,#E8C56A);
    color:#0A0806; border:none; border-radius:8px;
    font-family:'Syne',sans-serif; font-size:11px; font-weight:800;
    letter-spacing:.12em; text-transform:uppercase;
    padding:14px 28px; cursor:pointer;
    transition:all .25s; box-shadow:0 8px 24px rgba(184,135,42,.3);
  }
  .gt-btn-gold:hover { transform:translateY(-2px); box-shadow:0 16px 32px rgba(184,135,42,.4); filter:brightness(1.05); }
  .gt-btn-gold:active { transform:translateY(0) scale(.98); }

  .gt-btn-ghost {
    display:inline-flex; align-items:center; gap:8px;
    background:transparent; color:rgba(255,255,255,.6);
    border:1px solid rgba(255,255,255,.12); border-radius:8px;
    font-family:'Syne',sans-serif; font-size:11px; font-weight:700;
    letter-spacing:.12em; text-transform:uppercase;
    padding:14px 28px; cursor:pointer;
    transition:all .25s;
  }
  .gt-btn-ghost:hover { background:rgba(255,255,255,.06); color:#fff; border-color:rgba(255,255,255,.25); }

  .feat-card {
    background:rgba(255,255,255,.03); border:1px solid rgba(255,255,255,.07);
    border-radius:16px; padding:2rem; transition:all .3s;
  }
  .feat-card:hover { background:rgba(255,255,255,.055); border-color:rgba(184,135,42,.25); transform:translateY(-4px); }

  .api-block {
    background:#080604; border:1px solid rgba(184,135,42,.15);
    border-radius:12px; padding:1.5rem;
    font-family:'DM Mono',monospace; font-size:12px; line-height:1.8;
    overflow-x:auto; text-align: left;
  }

  .ticker-wrap { overflow:hidden; mask-image:linear-gradient(90deg,transparent,black 12%,black 88%,transparent); }
  .ticker-track { display:flex; width:max-content; animation:ticker 30s linear infinite; }
  .ticker-item  { white-space:nowrap; padding:0 2rem; font-family:'DM Mono',monospace; font-size:12px; }

  .faq-item { border-bottom:1px solid rgba(14,11,6,.08); }
  .faq-q { width:100%; display:flex; justify-content:space-between; align-items:center; padding:1.25rem 0; background:none; border:none; cursor:pointer; text-align:left; }
  .faq-q:hover .faq-icon { color:${C.gold}; }

  .ping-dot { position:relative; display:inline-flex; }
  .ping-dot::before { content:''; position:absolute; inset:0; border-radius:50%; background:${C.gold}; animation:pingGold 1.8s cubic-bezier(0,0,.2,1) infinite; }

  .chart-line { stroke-dasharray:600; stroke-dashoffset:600; animation:drawLine 2.5s ease forwards; animation-delay:.5s; }

  .gold-text { background:linear-gradient(135deg,${C.gold},${C.goldLt}); -webkit-background-clip:text; -webkit-text-fill-color:transparent; background-clip:text; }
`;

// ─── Animated mini chart ─────────────────────────────────────────────────────
function MiniChart() {
  const pts = [0,40,25,55,30,20,50,10,35,15,60,5];
  const W = 280, H = 80, pad = 10;
  const xs = pts.filter((_,i) => i%2===0).map((x,i) => pad + (i/(pts.length/2-1))*(W-2*pad));
  const ys = pts.filter((_,i) => i%2!==0).map(y => H - pad - (y/70)*(H-2*pad));
  const path = xs.map((x,i) => (i===0?`M${x},${ys[i]}`:`L${x},${ys[i]}`)).join(' ');
  const area = path + ` L${xs[xs.length-1]},${H} L${xs[0]},${H} Z`;
  return (
    <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} style={{ display:'block' }}>
      <defs>
        <linearGradient id="cg" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={C.gold} stopOpacity=".3"/>
          <stop offset="100%" stopColor={C.gold} stopOpacity="0"/>
        </linearGradient>
      </defs>
      <path d={area} fill="url(#cg)" />
      <path d={path} fill="none" stroke={C.goldLt} strokeWidth="2" strokeLinecap="round" className="chart-line" />
      {xs.map((x,i) => <circle key={i} cx={x} cy={ys[i]} r="3" fill={C.gold} opacity=".7" />)}
    </svg>
  );
}

// ─── Ticker Data ─────────────────────────────────────────────────────────────
const TICKER_ITEMS = [
  { label: 'ทอง 96.5%', val: '฿41,150', up: true },
  { label: 'ทอง 99.99%', val: '฿41,400', up: true },
  { label: 'ทองรูปพรรณ', val: '฿42,550', up: true },
  { label: 'ราคารับซื้อคืน', val: '฿40,950', up: true },
  { label: 'Gold Spot USD', val: '$3,245.50', up: true },
  { label: 'ค่าเงิน THB/USD', val: '฿35.80', up: false },
];

function TickerBar() {
  const items = [...TICKER_ITEMS, ...TICKER_ITEMS]; 
  return (
    <div style={{ background: C.ink, borderTop:`1px solid rgba(184,135,42,.15)`, borderBottom:`1px solid rgba(184,135,42,.15)`, padding:'10px 0' }}>
      <div className="ticker-wrap">
        <div className="ticker-track">
          {items.map((item, i) => (
            <span key={i} className="ticker-item" style={{ color: item.up ? C.goldLt : '#E07070' }}>
              <span style={{ color:'rgba(255,255,255,.3)', marginRight:8 }}>{item.label}</span>
              {item.val}
              <span style={{ marginLeft:6, fontSize:10 }}>{item.up ? '▲' : '▼'}</span>
              <span style={{ color:'rgba(255,255,255,.1)', marginLeft:24 }}>·</span>
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── Section wrapper ──────────────────────────────────────────────────────────
function Section({ children, style, id }) {
  return (
    <section id={id} style={{ padding:'3rem 1.5rem', ...style }}>
      <div style={{ maxWidth:1100, margin:'0 auto' }}>
        {children}
      </div>
    </section>
  );
}

function SectionLabel({ children }) {
  return (
    <div style={{ display:'flex', alignItems:'center', gap:12, marginBottom:'1rem' }}>
      <div style={{ width:28, height:1, background:C.gold }} />
      <span style={{ fontFamily:C.sans, fontSize:10, fontWeight:700, letterSpacing:'.3em', textTransform:'uppercase', color:C.gold }}>
        {children}
      </span>
    </div>
  );
}

// ─── FAQ ──────────────────────────────────────────────────────────────────────
const FAQS = [
  { q:'API Key สามารถใช้งานได้ทันทีหลังสมัครหรือไม่?', a:'ใช่ ระบบจะสร้าง API Key (Live/Test) ให้ทันทีหลังจากยืนยันบัญชีสำเร็จ คุณสามารถเริ่มดึงข้อมูลผ่านเครื่องมืออย่าง Postman หรือ Axios ได้ทันที' },
  { q:'รองรับการแจ้งเตือนราคาผ่าน Webhook หรือไม่?', a:'สมาชิกระดับ Gold สามารถตั้งค่า Webhook URL เพื่อรับข้อมูลราคาแบบ Push เมื่อเกิดการเปลี่ยนแปลงเกินกว่า threshold ที่กำหนดไว้ในระบบ' },
  { q:'ข้อมูลราคามีความแม่นยำแค่ไหน?', a:'เราดึงข้อมูลจากสมาคมค้าทองคำแห่งประเทศไทยโดยตรง เสริมด้วยข้อมูล Spot Gold จากตลาดสากล (LBM) เพื่อให้ครอบคลุมทั้งราคาในไทยและค่าเงินบาท' },
  { q:'ระบบมีขีดจำกัดการเรียกใช้งาน (Rate Limit) อย่างไร?', a:'จำกัดการเรียกใช้งานตามแผนสมาชิก (Basic: 5 req/min, Silver: 10, Gold: 20) เพื่อรักษาเสถียรภาพของระบบ API โดยรวม' },
  { q:'SLA และความเสถียรของระบบเป็นอย่างไร?', a:'เรามีระบบ Redundancy 2 ชั้นพร้อม Global CDN การันตี Uptime 99.9% เหมาะสำหรับการนำไปใช้ในเชิงธุรกิจที่ต้องการความเชื่อถือสูง' },
];

function FaqSection() {
  const [open, setOpen] = useState(null);
  return (
    <div>
      {FAQS.map((faq, i) => (
        <div key={i} className="faq-item">
          <button className="faq-q" onClick={() => setOpen(open === i ? null : i)}>
            <span style={{ fontFamily:C.sans, fontSize:14, fontWeight:700, color:C.ink, paddingRight:16 }}>
              {faq.q}
            </span>
            <ChevronDown
              size={16}
              className="faq-icon"
              style={{
                color: open===i ? C.gold : C.fog,
                flexShrink:0,
                transform: open===i ? 'rotate(180deg)' : 'rotate(0)',
                transition: 'transform .25s, color .2s',
              }}
            />
          </button>
          {open === i && (
            <p style={{ fontFamily:C.sans, fontSize:13, color:C.fog, lineHeight:1.7, paddingBottom:'1.25rem', maxWidth:620 }}>
              {faq.a}
            </p>
          )}
        </div>
      ))}
    </div>
  );
}

// ─── Dashboard mockup ─────────────────────────────────────────────────────────
function DashboardMockup() {
  const rows = [
    { time:'08:00', sell:40100, buy:40000, trend:'up' },
    { time:'10:00', sell:40380, buy:40280, trend:'up' },
    { time:'12:00', sell:40300, buy:40200, trend:'down' },
    { time:'15:00', sell:40620, buy:40520, trend:'up' },
    { time:'17:00', sell:40850, buy:40750, trend:'up' },
  ];
  return (
    <div style={{ background:'#0E0B06', borderRadius:20, padding:'1.5rem', border:`1px solid rgba(184,135,42,.15)` }}>
      <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:'1.25rem' }}>
        <div style={{ display:'flex', alignItems:'center', gap:8 }}>
          <span style={{ width:8, height:8, borderRadius:'50%', background:C.gold, display:'inline-block' }} className="ping-dot" />
          <span style={{ fontFamily:C.sans, fontSize:11, fontWeight:700, color:C.gold, letterSpacing:'.15em' }}>GOLD TRACKER LIVE</span>
        </div>
        <span style={{ fontFamily:C.mono, fontSize:10, color:'rgba(255,255,255,.2)' }}>อัปเดตล่าสุด 17:04:33</span>
      </div>
      <div style={{ marginBottom:'1.25rem', paddingBottom:'1.25rem', borderBottom:'1px solid rgba(255,255,255,.06)' }}>
        <p style={{ fontFamily:C.sans, fontSize:9, letterSpacing:'.2em', textTransform:'uppercase', color:'rgba(232,197,106,.5)', marginBottom:6 }}>
          ราคาขายออก · บาท
        </p>
        <div style={{ display:'flex', alignItems:'flex-end', gap:12, marginBottom:10 }}>
          <span style={{ fontFamily:C.serif, fontSize:44, fontWeight:600, color:C.goldLt, lineHeight:1 }}>40,850</span>
          <span style={{ background:'rgba(45,122,74,.2)', color:'#5ABF7E', fontSize:10, fontWeight:700, padding:'3px 8px', borderRadius:4, marginBottom:6 }}>▲ UP</span>
        </div>
        <MiniChart />
      </div>
      <table style={{ width:'100%', borderCollapse:'collapse', fontSize:11 }}>
        <thead>
          <tr>
            {['เวลา','ขายออก','รับซื้อ','แนวโน้ม'].map(h => (
              <th key={h} style={{ fontFamily:C.sans, fontSize:9, letterSpacing:'.15em', textTransform:'uppercase', color:'rgba(255,255,255,.2)', fontWeight:700, padding:'6px 0', textAlign:h==='แนวโน้ม'?'center':'left', borderBottom:'1px solid rgba(255,255,255,.05)' }}>{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((r, i) => (
            <tr key={i}>
              <td style={{ fontFamily:C.mono, color:'rgba(255,255,255,.3)', padding:'7px 0' }}>{r.time}</td>
              <td style={{ fontFamily:C.mono, color:C.goldLt, padding:'7px 0' }}>{r.sell.toLocaleString()}</td>
              <td style={{ fontFamily:C.mono, color:'#5ABF7E', padding:'7px 0' }}>{r.buy.toLocaleString()}</td>
              <td style={{ textAlign:'center', padding:'7px 0' }}>
                <span style={{ display:'inline-block', padding:'1px 8px', borderRadius:3, fontSize:9, fontWeight:700, letterSpacing:'.1em',
                  background: r.trend==='up'?'rgba(45,122,74,.2)':'rgba(160,48,48,.2)',
                  color: r.trend==='up'?'#5ABF7E':'#E07070',
                }}>
                  {r.trend==='up'?'▲ UP':'▼ DOWN'}
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

// ─── Features data ────────────────────────────────────────────────────────────
const FEATURES = [
  { icon: Activity, title: 'Real-time Price Feed', desc: 'เชื่อมต่อตรงกับ API ตลาดทองคำ อัปเดตข้อมูลทุกความเคลื่อนไหว ครอบคลุมทั้งราคาขายออกและรับซื้อตามมาตรฐานสากล' },
  { icon: BarChart3, title: 'Intelligent Analytics', desc: 'วิเคราะห์แนวโน้มกำไรด้วยข้อมูลทางสถิติ Min / Max รายวัน พร้อม Dashboard แสดงภาพรวมการลงทุนที่อ่านง่าย' },
  { icon: Code2, title: 'Developer-first API', desc: 'REST API ประสิทธิภาพสูง ออกแบบมาเพื่อให้นักพัฒนานำข้อมูลราคาทองไปใช้ต่อได้ทันทีในทุกภาษาโปรแกรม' },
  { icon: RefreshCw, title: 'Automated Sync', desc: 'ลบภาระการดึงข้อมูลด้วยตัวเอง ระบบของเราจัดการซิงค์ข้อมูลล่าสุดให้คุณอัตโนมัติ พร้อมรองรับการทำ Webhook' },
  { icon: ShieldCheck, title: 'Secure Infrastructure', desc: 'มั่นใจด้วยระบบยืนยันตัวตน JWT มาตรฐานเดียวกับสถาบันการเงิน พร้อมการจัดการ API Key ที่รัดกุมและปลอดภัย' },
  { icon: Globe, title: 'Gold Spot Global Data', desc: 'เปรียบเทียบราคาทองคำในไทยกับตลาด Spot Gold โลก และการเคลื่อนไหวของค่าเงินบาทแบบ Real-time' },
];

// ─── MAIN PAGE ────────────────────────────────────────────────────────────────
export default function Home() {
  const navigate = useNavigate();

  useEffect(() => {
    const style = document.createElement('style');
    style.textContent = globalCss;
    document.head.appendChild(style);
    return () => document.head.removeChild(style);
  }, []);

  return (
    <div style={{ fontFamily:C.sans, background:C.paper, color:C.ink, overflowX:'hidden' }}>

      {/* ── NAVBAR ───────────────────────────────────────────────────────── */}
      <nav style={{
        position:'sticky', top:0, zIndex:50,
        background:'rgba(10,8,6,.92)', backdropFilter:'blur(12px)',
        borderBottom:`1px solid rgba(184,135,42,.12)`,
        padding:'0 1.5rem',
        display:'flex', alignItems:'center', justifyContent:'space-between', height:60,
      }}>
        <span style={{ fontFamily:C.serif, fontSize:18, fontWeight:600, fontStyle:'italic', color:C.goldLt, letterSpacing:'.05em', cursor:'pointer' }} onClick={() => navigate('/')}>
          Gold Tracker
        </span>

        

        <div style={{ display: 'flex', alignItems: 'center', gap: 24 }}>
          <button 
            className="gt-nav-link" 
            style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}
            onClick={() => navigate('/login')}
          >
            เข้าสู่ระบบ
          </button>
          <button className="gt-btn-gold" style={{ padding:'9px 20px', fontSize:10 }} onClick={() => navigate('/pricing')}>
            เริ่มใช้งาน <ArrowRight size={13} />
          </button>
        </div>
      </nav>

      <TickerBar />

      {/* ── HERO ─────────────────────────────────────────────────────────── */}
      <section style={{
        background:`linear-gradient(175deg, ${C.ink} 0%, #1C1408 55%, #0A0806 100%)`,
        padding:'3rem 1.5rem', position:'relative', overflow:'hidden',
      }}>
        <div style={{
          position:'absolute', inset:0, pointerEvents:'none', opacity:.04,
          backgroundImage:`linear-gradient(rgba(184,135,42,.5) 1px, transparent 1px), linear-gradient(90deg, rgba(184,135,42,.5) 1px, transparent 1px)`,
          backgroundSize:'60px 60px',
        }} />

        <div style={{ maxWidth:1100, margin:'0 auto', display:'grid', gridTemplateColumns:'1fr 1fr', gap:'3rem', alignItems:'center', position:'relative' }}>
          <div style={{ textAlign: 'left' }}>
            <div className="fade-up fade-up-1" style={{ display:'inline-flex', alignItems:'center', gap:8, marginBottom:'1.5rem', background:'rgba(184,135,42,.08)', border:`1px solid rgba(184,135,42,.2)`, borderRadius:20, padding:'6px 14px' }}>
              <span className="ping-dot" style={{ width:7, height:7, borderRadius:'50%', background:C.gold, display:'inline-block', flexShrink:0 }} />
              <span style={{ fontFamily:C.sans, fontSize:10, fontWeight:700, letterSpacing:'.2em', textTransform:'uppercase', color:C.gold }}>
                Live: Market Open
              </span>
            </div>

            <h1 className="fade-up fade-up-2" style={{ fontFamily:C.serif, fontSize:'clamp(42px,5vw,68px)', fontWeight:300, fontStyle:'italic', color:'#fff', lineHeight:1.05, marginBottom:'1.5rem' }}>
              Master the <span className="font-sans font-black not-italic text-[#B8872A]">GOLD</span> Market.
            </h1>

            <p className="fade-up fade-up-3" style={{ fontSize:15, color:'rgba(255,255,255,.45)', lineHeight:1.75, marginBottom:'2.5rem', maxWidth:480 }}>
              แพลตฟอร์มวิเคราะห์ราคาทองคำระดับสถาบัน พร้อม REST API ประสิทธิภาพสูง 
              ออกแบบโดยเน้นความแม่นยำเพื่อนักลงทุนและนักพัฒนายุคดิจิทัล
            </p>

            <div className="fade-up fade-up-4" style={{ display:'flex', alignItems:'center', gap:16, flexWrap:'wrap' }}>
              <button className="gt-btn-gold" onClick={() => navigate('/pricing')}>
                ดูแผนสมาชิก <ArrowRight size={15} />
              </button>
              <button className="gt-btn-ghost" onClick={() => navigate('/docs')}>
                <Code2 size={16} /> Developer Docs
              </button>
            </div>

            <div className="fade-up fade-up-5" style={{ display:'flex', alignItems:'center', gap:20, marginTop:'2rem' }}>
              {[
                { val:'5K+', label:'Active Keys' },
                { val:'99.9%', label:'Uptime SLA' },
                { val:'<50ms', label:'Latency' },
              ].map((s,i) => (
                <div key={i} style={{ paddingLeft: i>0?20:0, borderLeft: i>0?`1px solid rgba(255,255,255,.08)`:'' }}>
                  <div style={{ fontFamily:C.serif, fontSize:22, fontWeight:600, fontStyle:'italic', color:C.goldLt }}>{s.val}</div>
                  <div style={{ fontFamily:C.sans, fontSize:12, fontWeight:700, letterSpacing:'.15em', textTransform:'uppercase', color:'rgba(255,255,255,.25)' }}>{s.label}</div>
                </div>
              ))}
            </div>
          </div>
          <div className="fade-up fade-up-3" style={{ position:'relative' }}>
            <DashboardMockup />
          </div>
        </div>
      </section>

      {/* ── HOW IT WORKS ─────────────────────────────────────────────────── */}
      <Section id="features" style={{ background:C.paper, borderBottom:`1px solid ${C.mist}` }}>
        <SectionLabel>How It Works</SectionLabel>
        <h2 style={{ fontFamily:C.serif, fontSize:'clamp(28px,4vw,42px)', fontWeight:300, fontStyle:'italic', color:C.ink, marginBottom:'3rem', maxWidth:480, textAlign:'left' }}>
          เริ่มต้นใช้งานใน 3 ขั้นตอน
        </h2>
        <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:0, textAlign: 'left' }}>
          {[
            { icon:MousePointerClick, step:'01', title:'เลือกแผนสมาชิก', desc:'เลือกแผนที่เหมาะสมกับการใช้งานของคุณ เริ่มต้นด้วย Basic Plan ฟรี หรืออัปเกรดเพื่อรับฟีเจอร์ขั้นสูง' },
            { icon:CheckCircle2, step:'02', title:'รับ API Key ทันที', desc:'สมัครสมาชิกและรับ API Key (JWT) เพื่อเข้าถึงระบบวิเคราะห์ข้อมูล และ Sandbox สำหรับการทดสอบ' },
            { icon:Code2, step:'03', title:'เริ่มการเชื่อมต่อ', desc:'ส่ง header x-api-key เข้าสู่ระบบของเราเพื่อรับ Payload ข้อมูลราคาทองคำ JSON พร้อมใช้งานได้ทันที' },
          ].map((item, i) => (
            <div key={i} style={{ padding:'2rem 2.5rem', position:'relative', borderRight: i<2?`1px solid ${C.mist}`:'' }}>
              <span style={{ fontFamily:C.serif, fontSize:80, fontWeight:600, fontStyle:'italic', color:C.gold, opacity:.07, position:'absolute', top:-10, left:16, lineHeight:1 }}>{item.step}</span>
              <div style={{ width:44, height:44, borderRadius:12, background:C.goldPale, border:`1px solid rgba(184,135,42,.2)`, display:'flex', alignItems:'center', justifyContent:'center', marginBottom:'1.25rem' }}>
                <item.icon size={20} color={C.gold} />
              </div>
              <h4 style={{ fontFamily:C.sans, fontSize:20, fontWeight:700, marginBottom:'.5rem', color:C.ink }}>{item.title}</h4>
              <p style={{ fontFamily:C.sans, fontSize:15, color:C.fog, lineHeight:1.65 }}>{item.desc}</p>
            </div>
          ))}
        </div>
      </Section>

      {/* ── FEATURES GRID ─────────────────────────────────────────────────── */}
      <Section style={{ background:C.ink }}>
        <SectionLabel>Features</SectionLabel>
        <h2 style={{ fontFamily:C.serif, fontSize:'clamp(28px,4vw,42px)', fontWeight:300, fontStyle:'italic', color:'#fff', marginBottom:'3rem', maxWidth:480, textAlign:'left' }}>
          ทุกเครื่องมือวิเคราะห์<br/>รวมไว้ที่นี่
        </h2>
        <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:12, textAlign:'left' }}>
          {FEATURES.map((f, i) => (
            <div key={i} className="feat-card">
              <div style={{ width:40, height:40, borderRadius:10, background:'rgba(184,135,42,.1)', border:`1px solid rgba(184,135,42,.2)`, display:'flex', alignItems:'center', justifyContent:'center', marginBottom:'1.25rem' }}>
                <f.icon size={20} color={C.gold} />
              </div>
              <h4 style={{ fontFamily:C.sans, fontSize:20, fontWeight:700, color:'rgba(255,255,255,.85)', marginBottom:'.5rem' }}>{f.title}</h4>
              <p style={{ fontFamily:C.sans, fontSize:15, color:'rgba(255,255,255,.35)', lineHeight:1.65 }}>{f.desc}</p>
            </div>
          ))}
        </div>
      </Section>

      {/* ── API PREVIEW (Fixed Syntax) ─────────────────────────────────────── */}
      <Section id="docs" style={{ background:'#080604', borderTop:`1px solid rgba(184,135,42,.08)` }}>
        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'4rem', alignItems:'center', textAlign:'left' }}>
          <div>
            <SectionLabel>Developer Center</SectionLabel>
            <h2 style={{ fontFamily:C.serif, fontSize:'clamp(28px,4vw,40px)', fontWeight:300, fontStyle:'italic', color:'#fff', marginBottom:'1rem' }}>
              เชื่อมต่อง่ายดาย<br/>ผ่าน REST API
            </h2>
            <p style={{ fontFamily:C.sans, fontSize:15, color:'rgba(255,255,255,.4)', lineHeight:1.7, marginBottom:'2rem' }}>
              ออกแบบมาเพื่อ Developer โดยเฉพาะ ด้วยโครงสร้าง JSON ที่เข้าใจง่าย 
              รองรับทั้งการดึงราคา Real-time และข้อมูลสถิติย้อนหลัง
            </p>
            <div style={{ display:'flex', flexDirection:'column', gap:10 }}>
              {/* 🚀 ปรับ Path ให้ตรงกับ app.js (ตัด /api ออก) */}
              {['/prices/latest','/prices/history','/api/gold'].map((ep, i) => (
                <div key={i} style={{ display:'flex', alignItems:'center', gap:10 }}>
                  <span style={{ fontFamily:C.mono, fontSize:13, color:C.gold, background:'rgba(184,135,42,.08)', padding:'2px 8px', borderRadius:4 }}>GET</span>
                  <span style={{ fontFamily:C.mono, fontSize:15, color:'rgba(255,255,255,.5)' }}>{ep}</span>
                </div>
              ))}
            </div>
          </div>
          <div>
            <div className="api-block">
              <span style={{ color:'rgba(255,255,255,.2)' }}>{'// Get real-time gold price'}</span>{'\n'}
              <span style={{ color:'#5ABF7E' }}>const</span>
              <span style={{ color:'rgba(255,255,255,.7)' }}> res </span>
              <span style={{ color:'rgba(255,255,255,.4)' }}>= await </span>
              <span style={{ color:C.goldLt }}>fetch</span>
              <span style={{ color:'rgba(255,255,255,.7)' }}>({'\n'}
              {'  '}</span>
              {/* 🚀 ปรับ URL ให้ตรงกับ Localhost */}
              <span style={{ color:'#E07070' }}>'http://localhost:3000/prices/latest'</span>
              <span style={{ color:'rgba(255,255,255,.7)' }}>,{'\n'}
              {'  '}{'{'}{'\n'}
              {'    '}headers: {'{'}{'\n'}
              {'      '}</span>
              <span style={{ color:C.goldLt }}>'x-api-key'</span>
              <span style={{ color:'rgba(255,255,255,.7)' }}>: </span>
              <span style={{ color:'#E07070' }}>'gt_live_sk_xxxx'</span>
              <span style={{ color:'rgba(255,255,255,.7)' }}>{'\n'}
              {'    '}{'}'}{'\n'}
              {'  '}{'}'}{'\n'}
              ){'\n\n'}</span>
              <span style={{ color:'rgba(255,255,255,.2)' }}>{'// Data Payload'}</span>{'\n'}
              <span style={{ color:'rgba(255,255,255,.5)' }}>{'{'}{'\n'}
              {'  '}</span>
              <span style={{ color:C.goldLt }}>"status"</span>
              <span style={{ color:'rgba(255,255,255,.5)' }}>: </span>
              <span style={{ color:'#E07070' }}>"success"</span>
              <span style={{ color:'rgba(255,255,255,.5)' }}>,{'\n'}
              {'  '}</span>
              <span style={{ color:C.goldLt }}>"data"</span>
              <span style={{ color:'rgba(255,255,255,.5)' }}>: {'{'}{'\n'}
              {'    '}</span>
              {/* 🚀 ปรับตัวแปรให้ตรงกับ Backend (ใช้ price แทน sellPrice) */}
              <span style={{ color:C.goldLt }}>"price"</span>
              <span style={{ color:'rgba(255,255,255,.5)' }}>: </span>
              <span style={{ color:'#B5D4F4' }}>41150</span>
              <span style={{ color:'rgba(255,255,255,.5)' }}>,{'\n'}
              {'    '}</span>
              <span style={{ color:C.goldLt }}>"trend"</span>
              <span style={{ color:'rgba(255,255,255,.5)' }}>: </span>
              <span style={{ color:'#E07070' }}>"up"</span>
              <span style={{ color:'rgba(255,255,255,.5)' }}>{'\n'}
              {'  '}{'}'}{'\n'}
              {'}'}</span>
            </div>
          </div>
        </div>
      </Section>

      {/* ── STATS BAND ─────────────────────────────────────────────────────── */}
      <div style={{ background:C.cream, borderTop:`1px solid ${C.mist}`, borderBottom:`1px solid ${C.mist}`, padding:'3rem 1.5rem' }}>
        <div style={{ maxWidth:1100, margin:'0 auto', display:'grid', gridTemplateColumns:'repeat(4,1fr)' }}>
          {[
            { val:'99.9%', label:'Uptime SLA', sub:'ความเสถียรระดับ Enterprise' },
            { val:'<50ms', label:'API Latency', sub:'ความเร็วการตอบสนองสูงสุด' },
            { val:'5K+',  label:'Developer Keys', sub:'เหล่านักพัฒนาที่ไว้วางใจ' },
            { val:'24/7', label:'Market Sync', sub:'อัปเดตราคาแบบนาทีต่อนาที' },
          ].map((s, i) => (
            <div key={i} style={{ textAlign:'center', padding:'0 1rem', borderRight: i<3?`1px solid ${C.mist}`:'' }}>
              <div style={{ fontFamily:C.serif, fontSize:42, fontWeight:600, fontStyle:'italic', color:C.gold, lineHeight:1.1 }}>{s.val}</div>
              <div style={{ fontFamily:C.sans, fontSize:13, fontWeight:700, letterSpacing:'.15em', textTransform:'uppercase', color:C.ink, marginTop:4 }}>{s.label}</div>
              <div style={{ fontFamily:C.sans, fontSize:13, color:C.fog, marginTop:2 }}>{s.sub}</div>
            </div>
          ))}
        </div>
      </div>

      <Section style={{ background:C.paper }}>
        <div style={{ display:'grid', gridTemplateColumns:'1fr 2fr', gap:'4rem', textAlign:'left' }}>
          <div>
            <SectionLabel>FAQ</SectionLabel>
            <h2 style={{ fontFamily:C.serif, fontSize:'clamp(28px,3.5vw,40px)', fontWeight:300, fontStyle:'italic', color:C.ink }}>
              คำถามที่พบบ่อย
            </h2>
            <p style={{ fontFamily:C.sans, fontSize:13, color:C.fog, lineHeight:1.65, marginTop:'1rem' }}>
              มีข้อสงสัยเพิ่มเติมเกี่ยวกับระบบ API หรือเงื่อนไขการใช้งาน? ติดต่อทีมสนับสนุนของเราได้ตลอดเวลา
            </p>
            <a href="mailto:support@goldtracker.th" style={{ display:'inline-flex', alignItems:'center', gap:6, marginTop:'1.5rem', fontFamily:C.sans, fontSize:11, fontWeight:700, letterSpacing:'.1em', textTransform:'uppercase', color:C.gold, textDecoration:'none' }}>
              Contact Support <ArrowRight size={13} />
            </a>
          </div>
          <FaqSection />
        </div>
      </Section>

      {/* ── FINAL CTA ──────────────────────────────────────────────────────── */}
      <section style={{ background:`linear-gradient(160deg, #1C1408 0%, ${C.ink} 100%)`, padding:'4rem 1.5rem', textAlign:'center', position:'relative', overflow:'hidden' }}>
        <div style={{ position:'relative', maxWidth:600, margin:'0 auto' }}>
          <div style={{ fontFamily:C.sans, fontSize:10, fontWeight:700, letterSpacing:'.3em', textTransform:'uppercase', color:C.gold, marginBottom:'1.5rem' }}>
            — พร้อมเริ่มต้นหรือยัง? —
          </div>
          <h2 style={{ fontFamily:C.serif, fontSize:'clamp(32px,5vw,56px)', fontWeight:300, fontStyle:'italic', color:'#fff', lineHeight:1.1, marginBottom:'1rem' }}>
            ยกระดับการลงทุน<br/><span className="gold-text"> ด้วยข้อมูลที่เหนือกว่า </span>
          </h2>
          <p style={{ fontFamily:C.sans, fontSize:14, color:'rgba(255,255,255,.35)', lineHeight:1.7, marginBottom:'2.5rem' }}>
            สมัครสมาชิกฟรีวันนี้ · ไม่ต้องผูกบัตรเครดิต · รับสิทธิ์เข้าถึง API ได้ทันที
          </p>
          <div style={{ display:'flex', justifyContent:'center', gap:16, flexWrap:'wrap' }}>
            <button className="gt-btn-gold" style={{ fontSize:12, padding:'16px 36px' }} onClick={() => navigate('/pricing')}>
              เลือกแผนสมาชิกของคุณ <ArrowRight size={15} />
            </button>
            <button className="gt-btn-ghost" style={{ fontSize:12, padding:'16px 36px' }} onClick={() => navigate('/docs')}>
              <Lock size={13} /> ดู API Documentation
            </button>
          </div>
        </div>
      </section>

      {/* ── FOOTER ─────────────────────────────────────────────────────────── */}
      <footer style={{ background:C.ink, borderTop:`1px solid rgba(184,135,42,.1)`, padding:'2rem 1.5rem' }}>
        <div style={{ maxWidth:1100, margin:'0 auto', display:'flex', alignItems:'center', justifyContent:'space-between', flexWrap:'wrap', gap:12 }}>
          <span style={{ fontFamily:C.serif, fontSize:16, fontWeight:600, fontStyle:'italic', color:C.goldLt }}>Gold Tracker</span>
          <span style={{ fontFamily:C.sans, fontSize:10, color:'rgba(255,255,255,.2)', letterSpacing:'.08em' }}>
            © 2026 Gold Tracker Web Service Project · Silpakorn University SE
          </span>
          <div style={{ display:'flex', gap:20 }}>
            {['Privacy Policy','Terms of Service','Contact'].map(l => (
              <a key={l} href="#" className="gt-nav-link" style={{ fontSize:10 }}>{l}</a>
            ))}
          </div>
        </div>
      </footer>

    </div>
  );
}