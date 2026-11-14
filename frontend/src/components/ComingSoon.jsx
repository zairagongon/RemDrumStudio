import { useNavigate } from 'react-router-dom';
import { getSession, logout } from '../services/auth.js';

// Stand-in for pages that are not built yet
export default function ComingSoon({ title, standalone = false }) {
  const navigate = useNavigate();
  const session = getSession();
  const box = (
    <div style={{ background: '#fff', border: '1px solid #e4e7f0', borderRadius: 14, padding: 28, maxWidth: 520 }}>
      <h1 style={{ margin: 0, fontSize: 26, color: '#1c2456' }}>{title}</h1>
      <p style={{ color: '#5d6385', margin: '8px 0 0' }}>This page isn’t built yet.</p>
      {standalone && (
        <p style={{ margin: '16px 0 0' }}>
          {session ? `Signed in as ${session.user.name} (${session.user.role}). ` : ''}
          <button onClick={() => { logout(); navigate('/login'); }} style={{ padding: '8px 14px', borderRadius: 10, border: '1px solid #cfd4e6', background: '#fff', cursor: 'pointer' }}>Log out</button>
        </p>
      )}
    </div>
  );
  return standalone ? <main style={{ padding: 40, fontFamily: 'Inter, system-ui, sans-serif' }}>{box}</main> : box;
}
