// Pricing.jsx
// Dependencies: npm install react-router-dom lucide-react
// Google Fonts — เพิ่มใน index.html:
//   <link href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,400;0,600;0,700;1,400&family=Syne:wght@400;700;800&display=swap" rel="stylesheet" />

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Check, ArrowRight, Star, Zap, Crown, Shield, Plus, Minus } from 'lucide-react'; // เพิ่ม Plus, Minus

// ─── Design tokens ─────────────────────────────────────────────────────────────
const T = {
  ink:    '#0E0B06',
  paper:  '#FAF7F0',
  gold:   '#B8872A',
  goldLt: '#E8C56A',
  goldDk: '#7A5510',
  mist:   '#E8E2D4',
  fog:    '#C8C0AA',
  cream:  '#F2EDE0',
  serif:  "'Cormorant Garamond', serif",
  sans:   "'Syne', sans-serif",
};

// ─── Plan data ──────────────────────────────────────────────────────────────────
const PLANS = [
  {
    id: 'basic',
    tier: '01',
    name: 'Basic',
    badge: 'ฟรีตลอดกาล',
    badgeVariant: 'free',
    monthlyPrice: null,
    icon: Zap,
    features: [
      'API 5 requests / minute',
      'ราคาทองคำ Real-time',
      'Auto sync ทุก 1 นาที',
    ],
    cta: 'เริ่มใช้งานฟรี',
    variant: 'basic',
  },
  {
    id: 'silver',
    tier: '02',
    name: 'Silver',
    badge: 'Most Popular',
    badgeVariant: 'popular',
    monthlyPrice: 499,
    icon: Crown,
    features: [
      'API 10 requests / minute',
      'สถิติ Min / Max / Average',
      'กราฟย้อนหลัง 24 ชั่วโมง',
      'Dashboard แบบ Pro',
    ],
    cta: 'เลือกแผน Silver',
    variant: 'silver',
  },
  {
    id: 'gold',
    tier: '03',
    name: 'Gold',
    badge: 'Best Value',
    badgeVariant: 'best',
    monthlyPrice: 999,
    icon: Shield,
    features: [
      'API 20 requests / minute',
      'Technical Analysis เต็มรูปแบบ',
      'Export CSV ไม่จำกัด',
      'Priority Support 24/7',
      'Custom Webhook & Alerts',
    ],
    cta: 'เลือกแผน Gold',
    variant: 'gold',
  },
];

const TRUST_ITEMS = [
  { icon: '🔐', label: 'SSL Encrypted' },
  { icon: '⚡', label: 'เปิดใช้ทันที' },
  { icon: '↩️', label: 'ยกเลิกได้ตลอดเวลา' },
  { icon: '🇹🇭', label: 'รองรับ PromptPay' },
];

// ─── [ส่วนที่เพิ่มใหม่: Data สำหรับตารางและ FAQ] ─────────────────────────────────────────
const COMPARISON_DATA = [
  { feature: 'API Rate Limit', basic: '5 req/min', silver: '10 req/min', gold: '20 req/min' },
  { feature: 'Historical Data', basic: '1 Hour', silver: '24 Hours', gold: 'Unlimited' },
  { feature: 'Technical Analysis', basic: '—', silver: 'Basic', gold: 'Advanced' },
  { feature: 'CSV Export', basic: '❌', silver: '10 / day', gold: 'Unlimited' },
  { feature: 'Support', basic: 'Community', silver: 'Email', gold: '24/7 Priority' },
];

const FAQ_DATA = [
  { q: "เปลี่ยนแพ็กเกจภายหลังได้ไหม?", a: "ได้แน่นอน คุณสามารถอัปเกรดหรือลดระดับสมาชิกได้ตลอดเวลาผ่านหน้า Dashboard โดยระบบจะคำนวณส่วนต่างราคาให้โดยอัตโนมัติ" },
  { q: "API Key จะได้รับทันทีหรือไม่?", a: "ทันทีที่การสมัครสมาชิกสำเร็จ ระบบจะทำการออก API Key ให้คุณเริ่มใช้งานผ่านหน้า Profile ได้ทันที" },
  { q: "รองรับการชำระเงินช่องทางใดบ้าง?", a: "เราเตอร์รองรับ PromptPay และ Mobile Banking ทุกธนาคารในประเทศไทย" },
];

// ─── Badge styles ───────────────────────────────────────────────────────────────
const badgeStyles = {
  free: {
    background: 'rgba(14,11,6,0.06)',
    color: T.fog,
    border: `1px solid ${T.mist}`,
  },
  popular: {
    background: 'rgba(184,135,42,0.12)',
    color: T.goldDk,
    border: '1px solid rgba(184,135,42,0.25)',
  },
  best: {
    background: 'rgba(184,135,42,0.2)',
    color: T.goldLt,
    border: '1px solid rgba(184,135,42,0.4)',
  },
};

// ─── Card theme styles ─────────────────────────────────────────────────────────
const cardThemes = {
  basic: {
    card: {
      background: T.cream,
      border: `1px solid ${T.mist}`,
    },
    planName: { color: T.fog },
    priceMain: { color: T.ink },
    priceUnit: { color: T.fog },
    priceAlt: { color: 'rgba(14,11,6,0.2)' },
    divider: { background: T.mist },
    checkBg: { background: 'rgba(14,11,6,0.06)', border: `1px solid ${T.mist}` },
    checkColor: '#9E8A6E',
    featureText: { color: '#6B6050' },
    cta: {
      background: 'transparent',
      border: `1px solid ${T.mist}`,
      color: T.ink,
    },
    ctaHover: { background: 'rgba(14,11,6,0.05)' },
    watermark: { color: T.ink },
  },
  silver: {
    card: {
      background: T.ink,
      border: '1px solid rgba(232,197,106,0.2)',
    },
    planName: { color: 'rgba(255,255,255,0.4)' },
    priceMain: { color: '#fff' },
    priceUnit: { color: 'rgba(255,255,255,0.3)' },
    priceAlt: { color: 'rgba(255,255,255,0.2)' },
    divider: { background: 'rgba(255,255,255,0.08)' },
    checkBg: { background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.12)' },
    checkColor: 'rgba(255,255,255,0.5)',
    featureText: { color: 'rgba(255,255,255,0.55)' },
    cta: {
      background: '#fff',
      border: 'none',
      color: T.ink,
    },
    ctaHover: { background: 'rgba(255,255,255,0.9)' },
    watermark: { color: '#fff' },
  },
  gold: {
    card: {
      background: 'linear-gradient(145deg,#1C1408 0%,#0E0B06 100%)',
      border: `1px solid ${T.gold}`,
      boxShadow: '0 0 0 1px rgba(184,135,42,0.1),inset 0 1px 0 rgba(232,197,106,0.15)',
    },
    planName: { color: T.gold },
    priceMain: { color: T.goldLt },
    priceUnit: { color: 'rgba(232,197,106,0.4)' },
    priceAlt: { color: 'rgba(232,197,106,0.25)' },
    divider: { background: 'rgba(184,135,42,0.25)' },
    checkBg: { background: 'rgba(184,135,42,0.15)', border: '1px solid rgba(184,135,42,0.3)' },
    checkColor: T.gold,
    featureText: { color: 'rgba(232,197,106,0.7)' },
    cta: {
      background: `linear-gradient(135deg, ${T.gold}, ${T.goldLt})`,
      border: 'none',
      color: T.ink,
    },
    ctaHover: { background: 'linear-gradient(135deg,#D4A030,#F0D070)' },
    watermark: { color: '#fff' },
  },
};

// ─── Sub-components ─────────────────────────────────────────────────────────────
function CheckIcon({ color }) {
  return (
    <svg width="8" height="8" viewBox="0 0 8 8" aria-hidden="true">
      <polyline
        points="1,4 3,6 7,2"
        fill="none"
        stroke={color}
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function StarIcon({ color }) {
  return (
    <svg width="7" height="7" viewBox="0 0 7 7" aria-hidden="true">
      <polygon
        points="3.5,0.5 4.5,2.5 6.5,2.8 5,4.2 5.4,6.2 3.5,5.2 1.6,6.2 2,4.2 0.5,2.8 2.5,2.5"
        fill={color}
      />
    </svg>
  );
}

// ─── [ส่วนที่เพิ่มใหม่: FAQ Item Sub-component] ─────────────────────────────────────────
function FAQItem({ q, a }) {
  const [open, setOpen] = useState(false);
  return (
    <div style={{ borderBottom: `1px solid ${T.mist}`, padding: '1.5rem 0' }}>
      <button 
        onClick={() => setOpen(!open)}
        style={{ width: '100%', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'none', border: 'none', cursor: 'pointer', padding: 0, textAlign: 'left' }}
      >
        <span style={{ fontFamily: T.sans, fontWeight: 700, fontSize: 14, color: T.ink }}>{q}</span>
        {open ? <Minus size={16} color={T.gold} /> : <Plus size={16} color={T.gold} />}
      </button>
      {open && (
        <div style={{ marginTop: '1rem', fontSize: 13, color: '#6B6050', lineHeight: 1.6, fontFamily: T.sans, animation: 'fadeIn 0.3s ease' }}>
          {a}
        </div>
      )}
    </div>
  );
}

function PriceDisplay({ plan, yearly }) {
  const fmt = (n) => n.toLocaleString('th-TH');
  const theme = cardThemes[plan.variant];

  if (!plan.monthlyPrice) {
    return (
      <div style={{ marginBottom: '1.5rem' }}>
        <div style={{ fontFamily: T.serif, fontSize: 56, fontWeight: 600, lineHeight: 1, ...theme.priceMain }}>
          Free
        </div>
        <div style={{ fontSize: 11, fontWeight: 400, marginTop: 4, ...theme.priceUnit }}>
          ไม่มีค่าใช้จ่าย
        </div>
      </div>
    );
  }

  const monthly = yearly
    ? Math.round(plan.monthlyPrice * 12 * 0.8)
    : plan.monthlyPrice;

  const altText = yearly
    ? `ประหยัด ฿${fmt(Math.round(plan.monthlyPrice * 12 * 0.2))} / ปี`
    : `฿${fmt(plan.monthlyPrice * 12)} / ปี`;

  return (
    <div style={{ marginBottom: '1.5rem' }}>
      <div style={{ fontFamily: T.serif, fontSize: 56, fontWeight: 600, lineHeight: 1, ...theme.priceMain }}>
        ฿{fmt(monthly)}
      </div>
      <div style={{ fontSize: 11, fontWeight: 400, marginTop: 4, ...theme.priceUnit }}>
        {yearly ? 'ต่อปี' : 'ต่อเดือน'}
      </div>
      <div style={{ fontSize: 12, fontWeight: 700, marginTop: 3, ...theme.priceAlt }}>
        {altText}
      </div>
    </div>
  );
}

function PlanCard({ plan, yearly, onSelect }) {
  const [hovered, setHovered] = useState(false);
  const [ctaHovered, setCtaHovered] = useState(false);
  const theme = cardThemes[plan.variant];
  const badge = badgeStyles[plan.badgeVariant];
  const Icon = plan.icon;

  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        borderRadius: 16,
        padding: '1.25rem 1.5rem', // ลด Padding แนวตั้งจาก 1.75 เป็น 1.25
        position: 'relative',
        overflow: 'hidden',
        cursor: 'default',
        transition: 'transform 0.25s, box-shadow 0.25s',
        transform: hovered ? 'translateY(-3px)' : 'translateY(0)',
        ...theme.card,
      }}
    >
      {/* Badge - ลด margin-bottom */}
      <div style={{
        display: 'inline-flex', alignItems: 'center', gap: 4,
        fontSize: 9, fontWeight: 700, letterSpacing: '0.2em', textTransform: 'uppercase',
        padding: '3px 10px', borderRadius: 20, marginBottom: '0.75rem', // ลดลงเหลือ 0.75
        ...badge,
      }}>
        <StarIcon color={plan.badgeVariant === 'best' ? T.goldLt : plan.badgeVariant === 'popular' ? T.gold : T.fog} />
        {plan.badge}
      </div>

      {/* Plan Name - ลด margin-bottom */}
      <p style={{
        fontFamily: T.sans, fontSize: 11, fontWeight: 700,
        letterSpacing: '0.2em', textTransform: 'uppercase', marginBottom: '0.5rem', // ลดลงเหลือ 0.5
        ...theme.planName,
      }}>
        {plan.name}
      </p>

      {/* PriceDisplay - ภายในคอมโพเนนต์นี้ควรลด margin เช่นกัน */}
      <PriceDisplay plan={plan} yearly={yearly} />

      <div style={{ height: 1, marginBottom: '1rem', ...theme.divider }} />

      {/* List - ลดช่องว่างระหว่างข้อความ */}
      <ul style={{ listStyle: 'none', marginBottom: '1.25rem', display: 'flex', flexDirection: 'column', gap: 6 }}> 
        {/* ลด gap จาก 10 เหลือ 6 */}
        {plan.features.map((f, i) => (
          <li key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 9, fontSize: 12, lineHeight: 1.2 }}>
            <span style={{
              width: 14, height: 14, borderRadius: '50%', flexShrink: 0,
              display: 'flex', alignItems: 'center', justifyContent: 'center', marginTop: 1,
              ...theme.checkBg,
            }}>
              <CheckIcon color={theme.checkColor} />
            </span>
            <span style={theme.featureText}>{f}</span>
          </li>
        ))}
      </ul>

      <button
        onClick={() => onSelect(plan.id)}
        onMouseEnter={() => setCtaHovered(true)}
        onMouseLeave={() => setCtaHovered(false)}
        style={{
          width: '100%', padding: '10px', // ลด padding ปุ่มจาก 12 เป็น 10
          borderRadius: 10, fontFamily: T.sans,
          fontSize: 11, fontWeight: 700,
          letterSpacing: '0.12em', textTransform: 'uppercase',
          cursor: 'pointer',
          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
          transition: 'all 0.2s', transform: ctaHovered ? 'scale(0.98)' : 'scale(1)',
          ...(ctaHovered ? { ...theme.cta, ...theme.ctaHover } : theme.cta),
        }}
      >
        {plan.cta}
        <ArrowRight size={14} />
      </button>
    </div>
  );
}

function BillingToggle({ yearly, onToggle }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 12, marginBottom: '2.5rem' }}>
      <span style={{
        fontFamily: T.sans, fontSize: 11, fontWeight: 700, letterSpacing: '0.08em',
        color: yearly ? T.fog : T.ink, transition: 'color 0.2s',
      }}>
        รายเดือน
      </span>

      <button
        onClick={onToggle}
        aria-label="สลับรอบชำระ"
        aria-checked={yearly}
        role="switch"
        style={{
          width: 40, height: 22, borderRadius: 11,
          background: T.ink, border: 'none', cursor: 'pointer',
          position: 'relative', transition: 'background 0.2s', flexShrink: 0,
        }}
      >
        <div style={{
          position: 'absolute', top: 3, left: 3,
          width: 16, height: 16, borderRadius: '50%',
          background: T.goldLt,
          transition: 'transform 0.25s',
          transform: yearly ? 'translateX(18px)' : 'translateX(0)',
        }} />
      </button>

      <span style={{
        fontFamily: T.sans, fontSize: 11, fontWeight: 700, letterSpacing: '0.08em',
        color: yearly ? T.ink : T.fog, transition: 'color 0.2s',
      }}>
        รายปี
      </span>

      <span style={{
        fontFamily: T.sans, fontSize: 10, fontWeight: 700,
        background: 'rgba(184,135,42,0.12)', color: T.goldDk,
        border: '1px solid rgba(184,135,42,0.25)',
        borderRadius: 20, padding: '2px 8px', letterSpacing: '0.05em',
      }}>
        ประหยัด 20%
      </span>
    </div>
  );
}

// ─── Main page ─────────────────────────────────────────────────────────────────
export default function Pricing() {
  const navigate = useNavigate();
  const [yearly, setYearly] = useState(false);

  const handleSelect = (planId) => {
    navigate(`/signup?plan=${planId}`);
  };

  return (
    <div style={{
      fontFamily: T.sans,
      background: T.paper,
      color: T.ink,
      minHeight: '100vh',
      padding: '3rem 1.5rem 4rem',
      position: 'relative',
      overflow: 'hidden',
    }}>

      <div style={{
        position: 'fixed', top: 0, left: '50%', transform: 'translateX(-50%)',
        width: 700, height: 280, pointerEvents: 'none',
        background: 'radial-gradient(ellipse, rgba(184,135,42,0.08) 0%, transparent 70%)',
      }} />

      <div style={{ position: 'relative', maxWidth: 820, margin: '0 auto' }}>

        {/* Eyebrow */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 12, marginBottom: '2rem' }}>
          <div style={{ width: 32, height: 1, background: T.gold }} />
          <span style={{
            fontFamily: T.sans, fontSize: 10, fontWeight: 700,
            letterSpacing: '0.3em', textTransform: 'uppercase', color: T.gold,
          }}>
            เลือกแผนของคุณ
          </span>
          <div style={{ width: 32, height: 1, background: T.gold }} />
        </div>

        {/* Headline */}
        <div style={{ textAlign: 'center', marginBottom: '0.5rem' }}>
          <span style={{
            display: 'block',
            fontFamily: T.serif,
            fontSize: 'clamp(36px, 6vw, 54px)',
            fontWeight: 400,
            fontStyle: 'italic',
            lineHeight: 1,
            color: T.ink,
          }}>
            ลงทุนใน
          </span>
          <span style={{
            display: 'block',
            fontFamily: T.sans,
            fontSize: 'clamp(36px, 6vw, 54px)',
            fontWeight: 800,
            lineHeight: 1,
            letterSpacing: '-0.03em',
            color: T.ink,
          }}>
            ข้อมูลที่ดีที่สุด
          </span>
        </div>

        {/* Subheading */}
        <p style={{
          textAlign: 'center', fontSize: 13, color: T.fog,
          lineHeight: 1.6, maxWidth: 360, margin: '1rem auto 2.5rem',
        }}>
          ราคาทองคำ Real-time พร้อม Analytics ระดับมืออาชีพ
        </p>

        {/* Billing toggle */}
        <BillingToggle yearly={yearly} onToggle={() => setYearly(y => !y)} />

        {/* Plan cards */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
          gap: 12,
        }}>
          {PLANS.map(plan => (
            <PlanCard
              key={plan.id}
              plan={plan}
              yearly={yearly}
              onSelect={handleSelect}
            />
          ))}
        </div>

        <div style={{ marginTop: '6rem', textAlign: 'center' }}>
          <h3 style={{ fontFamily: T.serif, fontSize: 32, marginBottom: '2.5rem', fontWeight: 600 }}>Compare Features</h3>
          <div style={{ overflowX: 'auto', borderRadius: 12, border: `1px solid ${T.mist}`, background: '#FFF' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12, textAlign: 'left' }}>
              <thead>
                <tr style={{ background: T.cream, color: T.goldDk, textTransform: 'uppercase', letterSpacing: '0.1em' }}>
                  <th style={{ padding: '16px 20px' }}>Capabilities</th>
                  <th>Basic</th>
                  <th>Silver</th>
                  <th>Gold</th>
                </tr>
              </thead>
              <tbody style={{ fontFamily: T.sans }}>
                {COMPARISON_DATA.map((row, i) => (
                  <tr key={i} style={{ borderBottom: `1px solid ${T.paper}` }}>
                    <td style={{ padding: '16px 20px', fontWeight: 700, color: T.ink }}>{row.feature}</td>
                    <td style={{ color: T.fog }}>{row.basic}</td>
                    <td style={{ color: T.gold, fontWeight: 700 }}>{row.silver}</td>
                    <td style={{ color: T.ink }}>{row.gold}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div style={{ marginTop: '6rem', maxWidth: 600, margin: '6rem auto 0' }}>
          <h3 style={{ fontFamily: T.serif, fontSize: 32, marginBottom: '2.5rem', textAlign: 'center', fontWeight: 600 }}>Common Questions</h3>
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            {FAQ_DATA.map((faq, i) => (
              <FAQItem key={i} q={faq.q} a={faq.a} />
            ))}
          </div>
        </div>

        {/* Trust strip */}
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          flexWrap: 'wrap', marginTop: '5rem',
        }}>
          {TRUST_ITEMS.map((item, i) => (
            <div key={i} style={{
              display: 'flex', alignItems: 'center', gap: 6,
              padding: '0 16px',
              borderLeft: i > 0 ? `1px solid ${T.mist}` : 'none',
              fontSize: 10, fontWeight: 600,
              letterSpacing: '0.1em', textTransform: 'uppercase',
              color: T.fog,
            }}>
              <span style={{
                width: 5, height: 5, borderRadius: '50%',
                background: T.gold, opacity: 0.5, flexShrink: 0,
              }} />
              {item.label}
            </div>
          ))}
        </div>

        {/* Footer note */}
        <p style={{
          textAlign: 'center', fontSize: 12, color: 'rgba(14,11,6,0.25)',
          marginTop: '1.5rem',
        }}>
          ต้องการ Enterprise Plan?{' '}
          <a
            href="#"
            style={{ color: 'rgba(184,135,42,0.7)', textDecoration: 'underline', textUnderlineOffset: 4 }}
          >
            ติดต่อทีมของเรา →
          </a>
        </p>

      </div>
    </div>
  );
}