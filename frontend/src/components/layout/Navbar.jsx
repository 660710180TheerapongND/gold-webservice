import { Link, useNavigate } from 'react-router-dom';
import GoldButton from '../ui/GoldButton';

export default function Navbar() {
  const navigate = useNavigate();
  const apiKey = localStorage.getItem('gt_api_key');

  return (
    <nav style={{ 
      display: 'flex', justifyContent: 'space-between', alignItems: 'center',
      padding: '1rem 2rem', background: '#1A1410', color: '#E8B84B'
    }}>
      <Link to="/" style={{ textDecoration: 'none', color: 'inherit', fontWeight: 900, letterSpacing: '0.2em' }}>
        GOLD TRACKER
      </Link>
      
      <div style={{ display: 'flex', gap: '2rem', fontSize: '11px', fontWeight: 700, textTransform: 'uppercase' }}>
        <Link to="/dashboard" style={{ color: 'inherit', textDecoration: 'none' }}>Dashboard</Link>
        <Link to="/docs" style={{ color: 'inherit', textDecoration: 'none' }}>API Docs</Link>
        {apiKey ? (
          <Link to="/profile" style={{ color: 'inherit', textDecoration: 'none' }}>My Profile</Link>
        ) : (
          <Link to="/login" style={{ color: 'inherit', textDecoration: 'none' }}>Login</Link>
        )}
      </div>
    </nav>
  );
}