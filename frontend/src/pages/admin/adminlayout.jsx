import { useState } from 'react';
import { NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { getSession, logout } from '../../services/auth.js';
import './adminlayout.css';

const NAV = [
  ['overview', 'Overview'], ['band-bookings', 'Band bookings'], ['schedules', 'Coach schedules'],
  ['payments', 'Payments'], ['analytics', 'Analytics'], ['coaches', 'Coaches'], ['people', 'Parents & Students']
];

export default function AdminLayout() {
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const [alerts, setAlerts] = useState(0); // pages tell the layout how many things need attention (red dot on the bell)
  const user = getSession()?.user;
  const initials = (user?.name || 'AD').split(' ').map(w => w[0]).slice(0, 2).join('').toUpperCase();
  const title = (NAV.find(([to]) => pathname.startsWith(`/admin/${to}`)) || NAV[0])[1];

  return (
    <div className="adm">
      <aside className="adm__side">
        <div className="adm__brand">
          <span className="adm__logo"><svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#1c2456" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M9 18V5l12-2v13" /><circle cx="6" cy="18" r="3" /><circle cx="18" cy="16" r="3" /></svg></span>
          RemDrumStudio
        </div>
        <div className="adm__label">ADMIN WORKSPACE</div>
        <nav aria-label="Admin">
          {NAV.map(([to, label]) => <NavLink key={to} to={`/admin/${to}`} className={({ isActive }) => `adm__link ${isActive ? 'on' : ''}`}>{label}</NavLink>)}
        </nav>
        <div className="adm__user">
          <div className="adm__who"><span className="adm__avatar">{initials}</span><span><b>{user?.name || 'Admin'}</b><small>Owner</small></span></div>
          <button className="adm__logout" onClick={() => { logout(); navigate('/login'); }}>Log out</button>
        </div>
      </aside>
      <div className="adm__main">
        <header className="adm__top">
          <b className="adm__title">{title}</b>
          <div className="adm__topright">
            <span>Signed in as {user?.name || 'Admin'}</span>
            <button className="adm__bell" aria-label={alerts ? `Notifications, ${alerts} need attention` : 'Notifications'}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#1c2456" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9M10 21h4" /></svg>
              {alerts > 0 && <span className="adm__dot" />}
            </button>
          </div>
        </header>
        <main className="adm__content"><Outlet context={{ setAlerts }} /></main>
      </div>
    </div>
  );
}