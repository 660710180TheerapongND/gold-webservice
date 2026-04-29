import { useState } from "react";
import { Code2, Terminal, BookOpen, ChevronRight, Key, Clock, BarChart2, AlertCircle, Copy, Check, Hash } from "lucide-react";

// ─── DESIGN TOKENS ───────────────────────────────────────────────────
const C = {
  ink:      '#0A0806',
  paper:    '#FAF7F0',
  cream:    '#F2EDE0',
  mist:     '#E8E2D4',
  fog:      '#9E9080',
  gold:     '#B8872A',
  goldLt:   '#E8C56A',
  goldPale: '#F7E9C3',
  goldDk:   '#7A5510',
  serif:    "'Cormorant Garamond', serif", // ฟอนต์หัวข้อ พรีเมียม
  sans:     "'Syne', sans-serif",           // ฟอนต์หลัก ทันสมัย
  mono:     "'DM Mono', monospace",         // ฟอนต์โค้ด อ่านง่าย
};

const NAV_ITEMS = [
  { id: 'introduction',  label: 'Introduction',      icon: BookOpen },
  { id: 'authentication',label: 'Authentication',      icon: Key },
  { id: 'latest',        label: 'Endpoint: Latest',    icon: Clock },
  { id: 'history',       label: 'Endpoint: History',   icon: BarChart2 },
  { id: 'analytics',     label: 'Endpoint: Analytics', icon: Hash },
  { id: 'errors',        label: 'Error Codes',          icon: AlertCircle },
];

const ENDPOINTS = [
  {
    id: 'latest',
    method: 'GET',
    url: '/api/prices/latest',
    badge: 'All Tiers',
    description: 'ดึงข้อมูลราคาทองคำล่าสุด (Real-time) ทั้งในหน่วย USD/oz และ THB/Baht ข้อมูลอัปเดตทุก 1 นาที สำหรับแผนสมาชิกทุกระดับ',
    params: [],
    response: `{
  "status": "success",
  "timestamp": "2026-04-30T10:22:00Z",
  "data": {
    "spot_usd": 2345.50,
    "gold_baht_buy": 40850,
    "gold_baht_sell": 40950,
    "change": +150,
    "currency": "THB"
  }
}`,
  },
  {
    id: 'history',
    method: 'GET',
    url: '/api/prices/history',
    badge: 'Silver & Gold Only',
    description: 'ดึงข้อมูลราคาย้อนหลังแบบ Time-series สามารถเลือกช่วงเวลาและ Interval ได้ เหมาะสำหรับการนำไปสร้างกราฟ (จำกัดเฉพาะสิทธิ์ Silver ขึ้นไป)',
    params: [
      { name: 'start_date', type: 'string', required: true,  desc: 'วันที่เริ่มต้น (ISO 8601) เช่น 2026-01-01' },
      { name: 'end_date',   type: 'string', required: false, desc: 'วันที่สิ้นสุด (Default: ปัจจุบัน)' },
      { name: 'interval',  type: 'string', required: false, desc: '"1h" | "1d" | "1w" (Default: 1d)' },
    ],
    response: `{
  "status": "success",
  "tier": "silver",
  "count": 30,
  "data": [
    { "date": "2026-04-01", "price": 40500 },
    { "date": "2026-04-02", "price": 40650 }
    // ...
  ]
}`,
  },
  {
    id: 'analytics',
    method: 'GET',
    url: '/api/analytics/summary',
    badge: 'Gold Tier Only',
    description: 'ดึงข้อมูลวิเคราะห์เชิงลึก เช่น ค่าเฉลี่ยเคลื่อนที่ (Moving Average) ความผันผวนของราคา และแนวโน้มตลาด (Exclusive สำหรับสมาชิก Gold เท่านั้น)',
    params: [
      { name: 'period', type: 'string', required: false, desc: '"7d" | "30d" | "90d" (Default: 30d)' },
    ],
    response: `{
  "status": "success",
  "tier": "gold",
  "data": {
    "avg_30d": 40720,
    "volatility_index": 1.45,
    "market_trend": "bullish",
    "rsi": 62.5
  }
}`,
  },
];

const ERROR_CODES = [
  { code: '400', title: 'Bad Request',        desc: 'รูปแบบ Parameter ไม่ถูกต้อง หรือข้อมูลที่จำเป็นขาดหายไป' },
  { code: '401', title: 'Unauthorized',       desc: 'API Key ไม่ถูกต้อง หรือไม่มีการส่ง x-api-key มาใน Header' },
  { code: '403', title: 'Forbidden',          desc: 'Package ของคุณ (Basic/Silver) ไม่มีสิทธิ์เข้าถึงฟีเจอร์นี้' },
  { code: '429', title: 'Rate Limited',       desc: 'คุณเรียกใช้งานเกินโควตาต่อนาที (Basic: 5, Silver: 10, Gold: 20)' },
  { code: '500', title: 'Internal Error',     desc: 'เกิดข้อผิดพลาดที่ระบบ Server กรุณาลองใหม่อีกครั้งภายหลัง' },
];

function CopyButton({ text }) {
  const [copied, setCopied] = useState(false);
  const handle = () => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };
  return (
    <button
      onClick={handle}
      style={{
        background: 'none', border: 'none', cursor: 'pointer',
        color: copied ? '#5ABF7E' : C.fog,
        display: 'flex', alignItems: 'center', gap: '6px',
        fontSize: '12px', fontFamily: C.sans, fontWeight: 700,
        transition: 'all 0.2s',
        padding: '4px 8px',
      }}
    >
      {copied ? <Check size={14} /> : <Copy size={14} />}
      {copied ? 'Copied!' : 'Copy'}
    </button>
  );
}

function CodeBlock({ label, code }) {
  return (
    <div style={{
      background: C.ink,
      borderRadius: '12px',
      overflow: 'hidden',
      border: `1px solid #2a2318`,
      marginTop: '16px',
    }}>
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '10px 20px',
        borderBottom: '1px solid #1f1a12',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <Terminal size={14} color={C.gold} />
          <span style={{ fontFamily: C.sans, fontSize: '11px', fontWeight: 700, color: C.fog, letterSpacing: '0.1em', textTransform: 'uppercase' }}>{label}</span>
        </div>
        <CopyButton text={code} />
      </div>
      <pre style={{
        margin: 0, padding: '20px',
        fontFamily: C.mono, fontSize: '13px', lineHeight: 1.75,
        color: C.goldLt, overflowX: 'auto',
        whiteSpace: 'pre',
      }}>{code}</pre>
    </div>
  );
}

function MethodBadge({ method }) {
  const colors = { GET: { bg: 'rgba(74, 222, 128, 0.1)', text: '#4ade80', border: 'rgba(74, 222, 128, 0.2)' } };
  const c = colors[method];
  return (
    <span style={{
      padding: '3px 10px', borderRadius: '4px',
      background: c.bg, color: c.text, border: `1px solid ${c.border}`,
      fontSize: '11px', fontFamily: C.sans, fontWeight: 800, letterSpacing: '0.08em',
    }}>{method}</span>
  );
}

function Section({ id, children }) {
  return (
    <section id={id} style={{ marginBottom: '80px', scrollMarginTop: '40px' }}>
      {children}
    </section>
  );
}

function SectionTitle({ eyebrow, title }) {
  return (
    <div style={{ marginBottom: '32px' }}>
      <p style={{
        fontFamily: C.sans, fontSize: '11px', fontWeight: 700,
        letterSpacing: '0.18em', textTransform: 'uppercase', color: C.gold,
        margin: '0 0 10px',
      }}>{eyebrow}</p>
      <h2 style={{
        fontFamily: C.serif, fontStyle: 'italic', fontWeight: 300,
        fontSize: '40px', color: C.ink, margin: 0, lineHeight: 1.1,
      }}>{title}</h2>
      <div style={{ width: '40px', height: '1px', background: C.gold, marginTop: '18px' }} />
    </div>
  );
}

function ParamRow({ name, type, required, desc }) {
  return (
    <div style={{
      display: 'grid', gridTemplateColumns: '160px 80px 80px 1fr',
      gap: '16px', alignItems: 'start',
      padding: '14px 0', borderBottom: `1px solid ${C.mist}`,
      fontFamily: C.sans, fontSize: '13px',
    }}>
      <code style={{ fontFamily: C.mono, fontSize: '12px', color: C.goldDk, background: C.goldPale, padding: '2px 8px', borderRadius: '4px', display: 'inline-block' }}>{name}</code>
      <span style={{ color: C.fog, fontWeight: 500 }}>{type}</span>
      <span style={{
        fontSize: '9px', fontWeight: 800, letterSpacing: '0.06em',
        color: required ? '#92400e' : C.fog,
        background: required ? '#fef3c7' : C.cream,
        padding: '2px 7px', borderRadius: '3px', display: 'inline-block',
        textAlign: 'center'
      }}>{required ? 'REQUIRED' : 'OPTIONAL'}</span>
      <span style={{ color: '#444', lineHeight: 1.5 }}>{desc}</span>
    </div>
  );
}

export default function Docs() {
  const [active, setActive] = useState('introduction');

  const scrollTo = (id) => {
    setActive(id);
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,600;1,300;1,400;1,600&family=Syne:wght@400;500;700;800&family=DM+Mono:wght@400;500&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        html { scroll-behavior: smooth; }
        ::selection { background: ${C.goldPale}; color: ${C.goldDk}; }
      `}</style>

      <div style={{ fontFamily: C.sans, background: C.paper, minHeight: '100vh', display: 'flex' }}>

        {/* ── SIDEBAR ── */}
        <aside style={{
          width: '260px', flexShrink: 0,
          borderRight: `1px solid ${C.mist}`,
          position: 'sticky', top: 0, height: '100vh', overflowY: 'auto',
          display: 'flex', flexDirection: 'column',
          background: C.paper
        }}>
          <div style={{ padding: '32px 28px 24px', borderBottom: `1px solid ${C.mist}` }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '6px' }}>
              <div style={{ width: '28px', height: '28px', borderRadius: '6px', background: C.ink, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <div style={{ width: '12px', height: '12px', borderRadius: '2px', background: C.gold }} />
              </div>
              <span style={{ fontFamily: C.sans, fontWeight: 800, fontSize: '15px', color: C.ink, letterSpacing: '-0.01em' }}>Gold Tracker</span>
            </div>
            <p style={{ fontFamily: C.mono, fontSize: '10px', color: C.fog, letterSpacing: '0.05em' }}>API Reference v1.0</p>
          </div>

          <nav style={{ padding: '20px 16px', flex: 1 }}>
            <p style={{ fontFamily: C.sans, fontSize: '10px', fontWeight: 800, letterSpacing: '0.14em', textTransform: 'uppercase', color: C.fog, padding: '0 12px', marginBottom: '12px' }}>Contents</p>
            {NAV_ITEMS.map(({ id, label, icon: Icon }) => {
              const isActive = active === id;
              return (
                <button
                  key={id}
                  onClick={() => scrollTo(id)}
                  style={{
                    width: '100%', background: isActive ? C.goldPale : 'none',
                    border: 'none', borderRadius: '8px',
                    padding: '10px 12px', cursor: 'pointer',
                    display: 'flex', alignItems: 'center', gap: '10px',
                    color: isActive ? C.goldDk : '#555',
                    fontFamily: C.sans, fontSize: '13px', fontWeight: isActive ? 700 : 500,
                    textAlign: 'left', transition: 'all 0.15s',
                    borderLeft: isActive ? `3px solid ${C.gold}` : '3px solid transparent',
                    marginBottom: '2px',
                  }}
                >
                  <Icon size={14} color={isActive ? C.gold : C.fog} strokeWidth={isActive ? 2.5 : 2} />
                  {label}
                </button>
              );
            })}
          </nav>

          {/* <div style={{ padding: '20px 20px 28px' }}>
            <div style={{ background: C.ink, borderRadius: '8px', padding: '12px 14px' }}>
              <p style={{ fontFamily: C.mono, fontSize: '10px', color: C.fog, marginBottom: '4px' }}>SERVER</p>
              <code style={{ fontFamily: C.mono, fontSize: '11px', color: C.goldLt }}>localhost:3000</code>
            </div>
          </div> */}
        </aside>

        {/* ── MAIN CONTENT ── */}
        <main style={{ flex: 1, padding: '64px 72px', maxWidth: '900px' }}>

          <Section id="introduction">
            <div style={{ marginBottom: '48px' }}>
              <p style={{ fontFamily: C.sans, fontSize: '11px', fontWeight: 700, letterSpacing: '0.18em', textTransform: 'uppercase', color: C.gold, marginBottom: '14px' }}>Developer Guide</p>
              <h1 style={{ fontFamily: C.serif, fontStyle: 'italic', fontWeight: 300, fontSize: '60px', color: C.ink, lineHeight: 1.0, marginBottom: '24px' }}>Gold Tracker<br />Documentation</h1>
              <p style={{ fontFamily: C.sans, fontSize: '16px', color: '#555', lineHeight: 1.7, maxWidth: '600px' }}>
                RESTful Web Service สำหรับดึงข้อมูลตลาดทองคำแบบ Real-time ออกแบบมาให้นักพัฒนาสามารถนำไปเชื่อมต่อกับระบบเทรด, แอปพลิเคชันการเงิน หรือ Dashboard ส่วนตัวได้อย่างรวดเร็ว
              </p>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px', marginBottom: '48px' }}>
              {[
                { label: 'Endpoints', value: '3' },
                { label: 'Response', value: 'JSON' },
                { label: 'Architecture', value: 'REST' },
              ].map(({ label, value }) => (
                <div key={label} style={{ border: `1px solid ${C.mist}`, borderRadius: '12px', padding: '20px 24px', background: C.cream }}>
                  <p style={{ fontFamily: C.mono, fontSize: '10px', color: C.fog, marginBottom: '8px', letterSpacing: '0.06em' }}>{label}</p>
                  <p style={{ fontFamily: C.sans, fontSize: '22px', fontWeight: 800, color: C.ink }}>{value}</p>
                </div>
              ))}
            </div>
          </Section>

          <Section id="authentication">
            <SectionTitle eyebrow="Security" title="Authentication" />
            <p style={{ fontFamily: C.sans, fontSize: '15px', color: '#444', lineHeight: 1.75, marginBottom: '28px' }}>
              การเรียกใช้งาน API ทุกส่วน (ยกเว้น Public Routes) จะต้องส่ง API Key มาในส่วนของ Header เพื่อยืนยันสิทธิ์ตามแผนสมาชิกที่คุณสมัครไว้
            </p>
            <CodeBlock label="Request Header" code={`x-api-key: gt_live_xxxxxxxxxxxxxxxx`} />
            <div style={{ marginTop: '28px', padding: '16px 20px', background: '#fefce8', border: `1px solid #fde68a`, borderRadius: '10px', display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
              <AlertCircle size={16} color="#b45309" style={{ flexShrink: 0, marginTop: '2px' }} />
              <p style={{ fontFamily: C.sans, fontSize: '13px', color: '#78350f', lineHeight: 1.6 }}>
                <strong>ความปลอดภัย:</strong> ห้ามนำ API Key ไปฝังไว้ในโค้ดฝั่ง Client-side ที่เปิดเผยต่อสาธารณะ ควรเรียกใช้ผ่าน Server-side เท่านั้น
              </p>
            </div>
          </Section>

          {ENDPOINTS.map((ep) => (
            <Section key={ep.id} id={ep.id}>
              <SectionTitle eyebrow="Resource" title={ep.label || ep.id.toUpperCase()} />
              <div style={{ background: C.ink, borderRadius: '12px', padding: '20px 24px', marginBottom: '24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                  <MethodBadge method={ep.method} />
                  <code style={{ fontFamily: C.mono, fontSize: '15px', color: '#fff' }}>{ep.url}</code>
                </div>
                <span style={{ fontFamily: C.sans, fontSize: '10px', fontWeight: 800, color: C.gold, border: `1px solid rgba(184, 135, 42, 0.3)`, padding: '3px 10px', borderRadius: '20px' }}>{ep.badge}</span>
              </div>
              <p style={{ fontFamily: C.sans, fontSize: '15px', color: '#444', lineHeight: 1.7, marginBottom: '28px' }}>{ep.description}</p>
              {ep.params.length > 0 && (
                <div style={{ marginBottom: '28px' }}>
                  <h4 style={{ fontFamily: C.sans, fontSize: '11px', fontWeight: 800, letterSpacing: '0.14em', textTransform: 'uppercase', color: C.fog, marginBottom: '12px' }}>Query Parameters</h4>
                  <div style={{ border: `1px solid ${C.mist}`, borderRadius: '10px', padding: '0 20px' }}>
                    {ep.params.map((p) => <ParamRow key={p.name} {...p} />)}
                  </div>
                </div>
              )}
              <CodeBlock label="Success Response (200 OK)" code={ep.response} />
            </Section>
          ))}

          <Section id="errors">
            <SectionTitle eyebrow="Handling" title="Error Codes" />
            <p style={{ fontFamily: C.sans, fontSize: '15px', color: '#444', lineHeight: 1.75, marginBottom: '28px' }}>ระบบจะตอบกลับด้วยรหัสข้อผิดพลาดมาตรฐาน HTTP Status Codes เพื่อแจ้งปัญหาที่เกิดขึ้น</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {ERROR_CODES.map(({ code, title, desc }) => (
                <div key={code} style={{ display: 'flex', alignItems: 'flex-start', gap: '20px', padding: '16px 20px', border: `1px solid ${C.mist}`, borderRadius: '10px', background: '#fff', borderLeft: `4px solid ${code === '429' ? '#ef4444' : C.gold}` }}>
                  <span style={{ fontFamily: C.mono, fontSize: '15px', fontWeight: 700, color: C.ink, minWidth: '36px' }}>{code}</span>
                  <div>
                    <p style={{ fontFamily: C.sans, fontSize: '14px', fontWeight: 700, color: C.ink, marginBottom: '3px' }}>{title}</p>
                    <p style={{ fontFamily: C.sans, fontSize: '13px', color: C.fog, lineHeight: 1.5 }}>{desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </Section>

          <footer style={{ borderTop: `1px solid ${C.mist}`, paddingTop: '40px', marginTop: '80px', display: 'flex', justifyContent: 'space-between', opacity: 0.6 }}>
            <p style={{ fontSize: '12px' }}>© 2026 Gold Tracker Web Service Project.</p>
            <p style={{ fontFamily: C.mono, fontSize: '11px' }}>Build 1.0.0-STABLE</p>
          </footer>
        </main>
      </div>
    </>
  );
}