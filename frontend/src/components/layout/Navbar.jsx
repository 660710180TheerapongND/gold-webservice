import { Link, useNavigate, useLocation } from 'react-router-dom';

// ─── DESIGN TOKENS ───────────────────────────────────────────────────
const C = {
  ink:    '#0A0806',
  gold:   '#B8872A',
  goldLt: '#E8C56A',
  paper:  '#FAF7F0',
  mist:   'rgba(184, 135, 42, 0.15)',
  serif:  "'Cormorant Garamond', serif",
  sans:   "'Syne', sans-serif",
};

export default function Navbar() {
  const navigate  = useNavigate();
  const location  = useLocation();

  // ✅ เช็ก login ด้วย token + gt_user_email (เหมือนกับ Pricing / Dashboard)
  const token     = localStorage.getItem('token');
  const userEmail = localStorage.getItem('gt_user_email');
  const isLoggedIn = !!(token && token !== 'undefined' && userEmail && userEmail !== 'undefined');

  const isActive = (path) => location.pathname === path;

  // ✅ ล้างทุก key ที่เกี่ยวกับ user แล้วกลับหน้าแรก
  const handleLogout = () => {
    ['token', 'gt_user_email', 'gt_user_name', 'gt_user_plan', 'gt_api_key'].forEach(
      (key) => localStorage.removeItem(key)
    );
    navigate('/');
    window.location.reload();
  };

  return (
    <nav style={{
      display: 'flex', justifyContent: 'space-between', alignItems: 'center',
      padding: '0.75rem 3rem',
      background: 'rgba(10, 8, 6, 0.95)',
      backdropFilter: 'blur(10px)',
      color: '#fff',
      position: 'sticky', top: 0, zIndex: 1000,
      borderBottom: `1px solid ${C.mist}`,
    }}>

      {/* ── LOGO ── */}
      <Link to="/" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '10px' }}>
        <div style={{
          width: '24px', height: '24px', background: C.gold, borderRadius: '4px',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <div style={{ width: '10px', height: '10px', background: C.ink, borderRadius: '1px' }}/>
        </div>
        <span style={{ fontFamily: C.serif, fontSize: '20px', fontWeight: 600, fontStyle: 'italic', color: '#fff', letterSpacing: '0.05em' }}>
          Gold{' '}
          <span style={{ fontFamily: C.sans, fontWeight: 800, fontStyle: 'normal', fontSize: '15px', color: C.goldLt }}>
            TRACKER
          </span>
        </span>
      </Link>

      {/* ── NAV LINKS ── */}
      <div style={{
        display: 'flex', gap: '2.5rem', alignItems: 'center',
        fontSize: '11px', fontWeight: 700, textTransform: 'uppercase',
        letterSpacing: '0.15em', fontFamily: C.sans,
      }}>
        {[
          { name: 'Dashboard', path: '/dashboard' },
          { name: 'API Docs',  path: '/docs'      },
          { name: 'Pricing',   path: '/pricing'   },
        ].map((item) => (
          <Link
            key={item.name}
            to={item.path}
            style={{
              color: isActive(item.path) ? C.goldLt : 'rgba(255,255,255,0.6)',
              textDecoration: 'none', transition: 'all 0.3s',
              borderBottom: isActive(item.path) ? `1px solid ${C.goldLt}` : '1px solid transparent',
              paddingBottom: '4px',
            }}
          >
            {item.name}
          </Link>
        ))}

        {/* ── AUTH BUTTON ── */}
        <div style={{ marginLeft: '1rem' }}>
          {isLoggedIn ? (
            <button
              onClick={handleLogout}
              style={{
                background: 'none',
                border: '1px solid rgba(255,107,107,0.3)',
                color: '#ff6b6b',
                fontSize: '10px', fontWeight: 800, fontFamily: C.sans,
                cursor: 'pointer', padding: '6px 16px',
                borderRadius: '20px', transition: 'all 0.2s',
              }}
              onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,107,107,0.1)'}
              onMouseLeave={e => e.currentTarget.style.background = 'none'}
            >
              LOGOUT
            </button>
          ) : (
            <Link to="/login" style={{ textDecoration: 'none' }}>
              <button style={{
                background: `linear-gradient(135deg,${C.gold},${C.goldLt})`,
                border: 'none', padding: '8px 20px', borderRadius: '6px',
                fontFamily: C.sans, fontSize: '10px', fontWeight: 800,
                color: C.ink, cursor: 'pointer',
                boxShadow: '0 4px 15px rgba(184,135,42,0.2)',
              }}>
                GET STARTED
              </button>
            </Link>
          )}
        </div>
      </div>
    </nav>
  );
}