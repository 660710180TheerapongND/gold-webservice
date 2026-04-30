import { useState } from "react";
import { useNavigate } from 'react-router-dom';
import { 
  Code2, Terminal, BookOpen, ChevronLeft, Key, 
  Clock, BarChart2, AlertCircle, Copy, Check, Hash, Globe 
} from "lucide-react";

// ─── DESIGN TOKENS (ใช้ตามสไตล์พรีเมียมของหัวหน้า) ───────────────────────
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
  serif:    "'Cormorant Garamond', serif",
  sans:     "'Syne', sans-serif",
  mono:     "'DM Mono', monospace",
};

const NAV_ITEMS = [
  { id: 'introduction',  label: 'Introduction',      icon: BookOpen },
  { id: 'authentication',label: 'Authentication',      icon: Key },
  { id: 'latest',        label: 'Endpoint: Latest',    icon: Clock },
  { id: 'history',       label: 'Endpoint: History',   icon: BarChart2 },
  { id: 'upgrade',       label: 'Admin: Upgrade',      icon: Hash },
  { id: 'errors',        label: 'Error Codes',          icon: AlertCircle },
];

const ENDPOINTS = [
  {
    id: 'latest',
    method: 'GET',
    url: '/prices/latest', // 🚀 ปรับตาม app.js
    badge: 'Public / All Tiers',
    description: 'ดึงข้อมูลราคาทองคำล่าสุดแบบ Real-time ข้อมูลอัปเดตทุก 10 วินาทีจากระบบจำลองราคาหลังบ้าน ไม่จำเป็นต้องใช้ API Key สำหรับการเข้าถึงพื้นฐาน',
    params: [],
    response: `{
  "status": "success",
  "data": {
    "price": 32500,
    "timestamp": "2026-04-30T10:00:00Z"
  }
}`,
  },
  {
    id: 'history',
    method: 'GET',
    url: '/prices/history', // 🚀 ปรับตาม app.js
    badge: 'Silver & Gold Only',
    description: 'ดึงข้อมูลประวัติราคาทองคำทั้งหมดที่ถูกบันทึกไว้ในระบบ (JSON Storage) เหมาะสำหรับการนำไปพล็อตพิกัดกราฟหรือทำ Data Analysis ย้อนหลัง',
    params: [],
    response: `{
  "status": "success",
  "data": [
    { "price": 32450, "timestamp": "2026-04-30T09:00:00Z" },
    { "price": 32500, "timestamp": "2026-04-30T09:10:00Z" }
  ]
}`,
  },
  {
    id: 'upgrade',
    method: 'POST',
    url: '/api/upgrade', // 🚀 ปรับตาม app.js
    badge: 'Private / Admin',
    description: 'Endpoint สำหรับการจัดการสิทธิ์สมาชิก ใช้สำหรับการอัปเกรดแผนสมาชิกของผู้ใช้ผ่านระบบจัดการหลังบ้าน',
    params: [
      { name: 'email', type: 'string', required: true,  desc: 'อีเมลของผู้ใช้งานที่ต้องการอัปเกรด' },
      { name: 'plan',  type: 'string', required: true,  desc: '"basic" | "silver" | "gold"' },
    ],
    response: `{
  "status": "success",
  "message": "Plan upgraded successfully"
}`,
  },
];

const ERROR_CODES = [
  { code: '401', title: 'Unauthorized',       desc: 'ข้อมูลการยืนยันตัวตน (Token/API Key) ไม่ถูกต้องหรือไม่พบในระบบ' },
  { code: '404', title: 'Not Found',          desc: 'ไม่พบข้อมูลที่ต้องการ หรือส่ง Parameter (เช่น Email) ไม่ถูกต้อง' },
  { code: '429', title: 'Too Many Requests',  desc: 'คุณเรียกใช้งานเกินโควตาต่อนาทีที่กำหนดไว้ตามแผนสมาชิกของคุณ' },
  { code: '500', title: 'Internal Error',     desc: 'เกิดข้อผิดพลาดที่ไฟล์ Storage (users.json/gold_data.json) หรือระบบจำลองราคา' },
];

// ─── HELPER COMPONENTS ───────────────────────────────────────────
function CopyButton({ text }) {
  const [copied, setCopied] = useState(false);
  const handle = () => { navigator.clipboard.writeText(text); setCopied(true); setTimeout(() => setCopied(false), 2000); };
  return (
    <button onClick={handle} style={{ background: 'none', border: 'none', cursor: 'pointer', color: copied ? '#5ABF7E' : C.fog, display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', fontFamily: C.sans, fontWeight: 700, padding: '4px 8px' }}>
      {copied ? <Check size={14} /> : <Copy size={14} />} {copied ? 'Copied!' : 'Copy'}
    </button>
  );
}

function CodeBlock({ label, code }) {
  return (
    <div style={{ background: C.ink, borderRadius: '12px', overflow: 'hidden', border: `1px solid #2a2318`, marginTop: '16px' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 20px', borderBottom: '1px solid #1f1a12' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <Terminal size={14} color={C.gold} />
          <span style={{ fontFamily: C.sans, fontSize: '11px', fontWeight: 700, color: C.fog, letterSpacing: '0.1em', textTransform: 'uppercase' }}>{label}</span>
        </div>
        <CopyButton text={code} />
      </div>
      <pre style={{ margin: 0, padding: '20px', fontFamily: C.mono, fontSize: '13px', lineHeight: 1.75, color: C.goldLt, overflowX: 'auto', whiteSpace: 'pre' }}>{code}</pre>
    </div>
  );
}

export default function Docs() {
  const navigate = useNavigate();
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
      `}</style>

      <div style={{ fontFamily: C.sans, background: C.paper, minHeight: '100vh', display: 'flex' }}>
        {/* SIDEBAR */}
        <aside style={{ width: '260px', flexShrink: 0, borderRight: `1px solid ${C.mist}`, position: 'sticky', top: 0, height: '100vh', overflowY: 'auto', background: C.paper }}>
          <div style={{ padding: '32px 28px 24px', borderBottom: `1px solid ${C.mist}` }}>
            <button onClick={() => navigate('/dashboard')} style={{ background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '6px' }}>
              <div style={{ width: '28px', height: '28px', borderRadius: '6px', background: C.ink, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <div style={{ width: '12px', height: '12px', borderRadius: '2px', background: C.gold }} />
              </div>
              <span style={{ fontWeight: 800, fontSize: '15px', color: C.ink }}>Gold Tracker</span>
            </button>
            <p style={{ fontFamily: C.mono, fontSize: '10px', color: C.fog }}>Back to Dashboard</p>
          </div>
          <nav style={{ padding: '20px 16px' }}>
            <p style={{ fontSize: '10px', fontWeight: 800, color: C.fog, padding: '0 12px', marginBottom: '12px', textTransform: 'uppercase' }}>Navigation</p>
            {NAV_ITEMS.map(({ id, label, icon: Icon }) => (
              <button key={id} onClick={() => scrollTo(id)} style={{ width: '100%', background: active === id ? C.goldPale : 'none', border: 'none', borderRadius: '8px', padding: '10px 12px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '10px', color: active === id ? C.goldDk : '#555', fontSize: '13px', fontWeight: active === id ? 700 : 500, borderLeft: active === id ? `3px solid ${C.gold}` : '3px solid transparent', marginBottom: '2px' }}>
                <Icon size={14} color={active === id ? C.gold : C.fog} /> {label}
              </button>
            ))}
          </nav>
        </aside>

        {/* MAIN CONTENT */}
        <main style={{ flex: 1, padding: '64px 72px', maxWidth: '900px' }}>
          <section id="introduction" style={{ marginBottom: '80px' }}>
            <p style={{ fontSize: '11px', fontWeight: 700, letterSpacing: '0.18em', color: C.gold, marginBottom: '14px', textTransform: 'uppercase' }}>Developer Documentation</p>
            <h1 style={{ fontFamily: C.serif, fontStyle: 'italic', fontSize: '60px', color: C.ink, lineHeight: 1.1, marginBottom: '24px' }}>Gold Web Service<br />API Reference</h1>
            <p style={{ fontSize: '16px', color: '#555', lineHeight: 1.7 }}>
              ยินดีต้อนรับสู่คู่มือนักพัฒนาสำหรับ Gold Tracker Web Service ระบบของเราให้บริการข้อมูลราคาทองคำจำลองแบบ Real-time ผ่าน RESTful API ที่พัฒนาด้วย Node.js และ Express
            </p>
          </section>

          <section id="authentication" style={{ marginBottom: '80px' }}>
            <h2 style={{ fontFamily: C.serif, fontStyle: 'italic', fontSize: '40px', marginBottom: '20px' }}>Authentication</h2>
            <p style={{ fontSize: '15px', color: '#444', lineHeight: 1.75, marginBottom: '28px' }}>
              สำหรับการเข้าถึงข้อมูลระดับสูง (Silver/Gold) คุณต้องใช้ <strong>x-api-key</strong> ที่ได้รับจากการสมัครสมาชิกแนบไปใน Header ของทุกคำขอ
            </p>
            <CodeBlock label="Header Format" code={`x-api-key: YOUR_GENERATED_API_KEY`} />
          </section>

          {ENDPOINTS.map((ep) => (
            <section key={ep.id} id={ep.id} style={{ marginBottom: '80px' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
                <h3 style={{ fontFamily: C.serif, fontStyle: 'italic', fontSize: '32px' }}>{ep.id.toUpperCase()}</h3>
                <span style={{ fontSize: '10px', fontWeight: 800, color: C.gold, border: `1px solid ${C.gold}`, padding: '3px 10px', borderRadius: '20px' }}>{ep.badge}</span>
              </div>
              <div style={{ background: C.ink, borderRadius: '12px', padding: '16px 20px', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '12px' }}>
                <span style={{ background: ep.method === 'GET' ? 'rgba(74, 222, 128, 0.2)' : 'rgba(96, 165, 250, 0.2)', color: ep.method === 'GET' ? '#4ade80' : '#60a5fa', padding: '2px 8px', borderRadius: '4px', fontSize: '11px', fontWeight: 900 }}>{ep.method}</span>
                <code style={{ color: '#fff', fontFamily: C.mono }}>{ep.url}</code>
              </div>
              <p style={{ fontSize: '14px', color: '#555', marginBottom: '24px' }}>{ep.description}</p>
              <CodeBlock label="Response Example" code={ep.response} />
            </section>
          ))}

          <section id="errors">
            <h2 style={{ fontFamily: C.serif, fontStyle: 'italic', fontSize: '40px', marginBottom: '32px' }}>Error Handling</h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {ERROR_CODES.map(({ code, title, desc }) => (
                <div key={code} style={{ display: 'flex', gap: '20px', padding: '16px', background: '#fff', border: `1px solid ${C.mist}`, borderRadius: '10px', borderLeft: `4px solid ${C.gold}` }}>
                  <span style={{ fontFamily: C.mono, fontWeight: 700, minWidth: '40px' }}>{code}</span>
                  <div>
                    <p style={{ fontWeight: 700, fontSize: '14px' }}>{title}</p>
                    <p style={{ fontSize: '13px', color: C.fog }}>{desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </section>

          <footer style={{ borderTop: `1px solid ${C.mist}`, paddingTop: '40px', marginTop: '60px', opacity: 0.5, fontSize: '12px' }}>
            © 2026 Gold Tracker Web Service Project - Built for SE Students.
          </footer>
        </main>
      </div>
    </>
  );
}