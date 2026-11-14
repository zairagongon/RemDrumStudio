import { useEffect, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { login, signup, saveSession, ROLE_HOME } from '../../services/auth.js';
import './authpage.css';

const BG_IMAGE = '/images/loginsignupimage.png';          
const PANEL_IMAGE = '/images/forloginpage.jpg';  

const ROLES = [['student', 'Student'], ['parent', 'Parent']];
const EMPTY = { firstName: '', lastName: '', email: '', password: '', confirm: '' };

const ICONS = {
  mail: <><rect x="3" y="5" width="18" height="14" rx="2" /><path d="M3 7l9 6 9-6" /></>,
  lock: <><rect x="5" y="11" width="14" height="9" rx="2" /><path d="M8 11V8a4 4 0 0 1 8 0v3" /></>,
  user: <><circle cx="12" cy="8" r="4" /><path d="M4 20c1-4 4-6 8-6s7 2 8 6" /></>,
  eye: <><path d="M2 12s4-7 10-7 10 7 10 7-4 7-10 7S2 12 2 12z" /><circle cx="12" cy="12" r="3" /></>,
  eyeoff: <><path d="M3 3l18 18" /><path d="M6.6 6.7C3.9 8.4 2 12 2 12s4 7 10 7c1.4 0 2.7-.3 3.8-.8M10.6 5.1A9.8 9.8 0 0 1 12 5c6 0 10 7 10 7a17 17 0 0 1-3.2 3.9" /><path d="M9.9 10a3 3 0 0 0 4.1 4.1" /></>
};

function Icon({ name, className = 'auth__ico' }) {
  return (
    <svg className={className} width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      {ICONS[name]}
    </svg>
  );
}

function Field({ id, label, type = 'text', icon, value, onChange, auto, error }) {
  const [show, setShow] = useState(false);
  const isPassword = type === 'password';
  return (
    <div className={`auth__field ${error ? 'bad' : ''}`}>
      <label htmlFor={id}>{label}</label>
      <div className="auth__input">
        <Icon name={icon} />
        <input id={id} type={isPassword && show ? 'text' : type} autoComplete={auto} value={value} onChange={onChange} />
        {isPassword && (
          <button type="button" className="auth__eye" onClick={() => setShow(s => !s)} aria-label={show ? 'Hide password' : 'Show password'}>
            <Icon name={show ? 'eyeoff' : 'eye'} className="" />
          </button>
        )}
      </div>
      {error && <p className="auth__err">{error}</p>}
    </div>
  );
}

function Logo() {
  const [imgOk, setImgOk] = useState(true);
  return (
    <Link to="/" className="auth__logo" aria-label="Back to the RemDrumStudio home page">
      {imgOk ? <img src="/images/RemDrumStudiologo.png" alt="" onError={() => setImgOk(false)} /> : <span className="auth__badge">&#9835;</span>}
      <span><b className="l1">Rem</b><b className="l2">Drum</b><b className="l3">Studio</b></span>
    </Link>
  );
}

const validateSignup = f => {
  const e = {};
  if (!f.firstName.trim()) e.firstName = 'Required.';
  if (!f.lastName.trim()) e.lastName = 'Required.';
  if (!/^\S+@\S+\.\S+$/.test(f.email.trim())) e.email = 'Please enter a valid email.';
  if (f.password.length < 8) e.password = 'Use at least 8 characters.';
  if (f.confirm !== f.password) e.confirm = 'Passwords do not match.';
  return e;
};

// Hands the image paths above to the CSS
const imageVars = {
  '--auth-bg': BG_IMAGE
    ? `linear-gradient(rgba(18,23,53,.35),rgba(18,23,53,.35)), url("${BG_IMAGE}") center/cover no-repeat`
    : 'none',
  '--panel-img': `url("${PANEL_IMAGE}")`
};

export default function AuthPage() {
  const { pathname, state } = useLocation();
  const navigate = useNavigate();
  const mode = pathname === '/signup' ? 'signup' : 'login';
  const booking = state?.intent === 'booking'; // came from a "Book a Session" button
  const go = to => navigate(to, { state });
  const home = res => navigate(ROLE_HOME[res.user.role] || '/', { replace: true, state: booking ? { openBooking: true } : undefined });

  useEffect(() => {
    document.title = mode === 'signup' ? 'Sign Up · RemDrumStudio' : 'Log In · RemDrumStudio';
  }, [mode]);

  // ---- Log in ----
  const [lf, setLf] = useState({ email: '', password: '' });
  const [remember, setRemember] = useState(true);
  const [lError, setLError] = useState('');
  const [notice, setNotice] = useState('');
  const [lBusy, setLBusy] = useState(false);

  const submitLogin = async e => {
    e.preventDefault();
    setLError(''); setNotice('');
    if (!lf.email.trim() || !lf.password) return setLError('Please enter your email and password.');
    setLBusy(true);
    try {
      const res = await login(lf.email, lf.password);
      saveSession(res, remember);
      home(res);
    } catch (err) {
      setLError(err.message);
    } finally {
      setLBusy(false);
    }
  };

  // ---- Sign up ----
  const [role, setRole] = useState('student');
  const [sf, setSf] = useState(EMPTY);
  const [sErrors, setSErrors] = useState({});
  const [sError, setSError] = useState('');
  const [sBusy, setSBusy] = useState(false);
  const set = name => e => setSf(f => ({ ...f, [name]: e.target.value }));

  const submitSignup = async e => {
    e.preventDefault();
    const found = validateSignup(sf);
    setSErrors(found); setSError('');
    if (Object.keys(found).length) return;
    setSBusy(true);
    try {
      const res = await signup({
        role,
        firstName: sf.firstName.trim(),
        lastName: sf.lastName.trim(),
        name: `${sf.firstName.trim()} ${sf.lastName.trim()}`,
        email: sf.email.trim(),
        password: sf.password
      });
      saveSession(res, true);
      home(res);
    } catch (err) {
      setSError(err.message);
    } finally {
      setSBusy(false);
    }
  };

  return (
    <main className="auth" style={imageVars}>
      <div className={`auth__card ${mode === 'signup' ? 'is-signup' : ''}`}>
        {/* Log in form (left) */}
        <section className={`auth__pane auth__pane--login ${mode === 'login' ? 'on' : ''}`}>
          <Logo />
          <h1 className="auth__title">Welcome back!</h1>
          <p className="auth__sub">{booking ? 'Log in to book your lesson.' : 'Log in to see your lessons and schedule.'}</p>
          <form className="auth__form" onSubmit={submitLogin} noValidate>
            <Field id="l-email" label="Email Address" type="email" icon="mail" auto="email" value={lf.email} onChange={e => setLf(f => ({ ...f, email: e.target.value }))} />
            <Field id="l-password" label="Password" type="password" icon="lock" auto="current-password" value={lf.password} onChange={e => setLf(f => ({ ...f, password: e.target.value }))} />
            <div className="auth__opts">
              <label className="auth__check"><input type="checkbox" checked={remember} onChange={e => setRemember(e.target.checked)} /> Remember me</label>
              <button type="button" className="auth__link" onClick={() => setNotice('Password reset is not set up yet. Please ask the studio for help.')}>Forgot password?</button>
            </div>
            {lError && <p className="auth__alert" role="alert">{lError}</p>}
            {notice && <p className="auth__notice" role="status">{notice}</p>}
            <button type="submit" className="auth__btn" disabled={lBusy}>{lBusy ? 'Logging in...' : 'Log In →'}</button>
          </form>
          <p className="auth__switch">New to the studio? <button type="button" onClick={() => go('/signup')}>Create an account</button></p>
        </section>

        {/* Sign up form (right) */}
        <section className={`auth__pane auth__pane--signup ${mode === 'signup' ? 'on' : ''}`}>
          <h1 className="auth__title">Create your account</h1>
          <p className="auth__sub">Join RemDrumStudio and start your musical journey.</p>
          <form className="auth__form" onSubmit={submitSignup} noValidate>
            <div className="auth__field">
              <span className="auth__label" id="role-label">Pick a role:</span>
              <div className="auth__roles" role="radiogroup" aria-labelledby="role-label">
                {ROLES.map(([key, label]) => (
                  <button key={key} type="button" role="radio" aria-checked={role === key} className={role === key ? 'on' : ''} onClick={() => setRole(key)}>{label}</button>
                ))}
              </div>
            </div>
            <div className="auth__names">
              <Field id="s-first" label="First Name" icon="user" auto="given-name" value={sf.firstName} onChange={set('firstName')} error={sErrors.firstName} />
              <Field id="s-last" label="Last Name" icon="user" auto="family-name" value={sf.lastName} onChange={set('lastName')} error={sErrors.lastName} />
            </div>
            <Field id="s-email" label="Email" type="email" icon="mail" auto="email" value={sf.email} onChange={set('email')} error={sErrors.email} />
            <Field id="s-password" label="Password" type="password" icon="lock" auto="new-password" value={sf.password} onChange={set('password')} error={sErrors.password} />
            <Field id="s-confirm" label="Confirm Password" type="password" icon="lock" auto="new-password" value={sf.confirm} onChange={set('confirm')} error={sErrors.confirm} />
            {sError && <p className="auth__alert" role="alert">{sError}</p>}
            <button type="submit" className="auth__btn" disabled={sBusy}>{sBusy ? 'Creating account...' : 'Create Account →'}</button>
          </form>
          <p className="auth__switch">Already have an account? <button type="button" onClick={() => go('/login')}>Log In</button></p>
        </section>

        {/* Gliding navy panel */}
        <aside className="auth__panel">
          <div className={`auth__ptxt ${mode === 'login' ? 'on' : ''}`}>
            <h2>New to the studio?</h2>
            <p>Create an account and book your first lesson today.</p>
            <button type="button" onClick={() => go('/signup')}>Sign Up</button>
          </div>
          <div className={`auth__ptxt ${mode === 'signup' ? 'on' : ''}`}>
            <h2>Welcome back!</h2>
            <p>Already have an account? Log in to pick up where you left off.</p>
            <button type="button" onClick={() => go('/login')}>Log In</button>
          </div>
        </aside>
      </div>
    </main>
  );
}