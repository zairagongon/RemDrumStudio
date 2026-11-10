// Auth service. While the backend/database isn't ready, USE_MOCK = true keeps everything in the browser.
// When the backend has POST /api/auth/login and /api/auth/signup, set USE_MOCK = false.
export const USE_MOCK = false;

const API = '/api/auth';

export const ROLE_HOME = { admin: '/admin', coach: '/coach', parent: '/parent', student: '/student' };

/* ---------- Mock (development only: passwords are NOT safe here) ---------- */
const DEMO_USERS = [
  { id: 1, name: 'Studio Admin', email: 'admin@remdrumstudio.test', phone: '', password: 'demo1234', role: 'admin' },
  { id: 2, name: 'Demo Coach', email: 'coach@remdrumstudio.test', phone: '', password: 'demo1234', role: 'coach' },
  { id: 3, name: 'Demo Parent', email: 'parent@remdrumstudio.test', phone: '', password: 'demo1234', role: 'parent' },
  { id: 4, name: 'Demo Student', email: 'student@remdrumstudio.test', phone: '', password: 'demo1234', role: 'student' }
];

const readUsers = () => {
  try { return JSON.parse(localStorage.getItem('rds_users')) || []; } catch { return []; }
};
const allUsers = () => [...DEMO_USERS, ...readUsers()];
const publicUser = u => ({ id: u.id, name: u.name, email: u.email, role: u.role });
const wait = ms => new Promise(r => setTimeout(r, ms));

async function mockLogin(email, password) {
  await wait(400);
  const u = allUsers().find(x => x.email === email.toLowerCase() && x.password === password);
  if (!u) throw new Error('Incorrect email or password.');
  return { token: 'mock-token', user: publicUser(u) };
}

async function mockSignup(data) {
  await wait(400);
  const email = data.email.toLowerCase();
  if (allUsers().some(x => x.email === email)) throw new Error('An account with this email already exists.');
  const u = { id: Date.now(), name: data.name, email, phone: data.phone, password: data.password, role: data.role };
  localStorage.setItem('rds_users', JSON.stringify([...readUsers(), u]));
  return { token: 'mock-token', user: publicUser(u) };
}

/* ---------- Real backend ---------- */
async function request(path, body) {
  let res;
  try {
    res = await fetch(`${API}${path}`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
  } catch {
    throw new Error('Cannot reach the server. Please try again later.');
  }
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    if (data.message) throw new Error(data.message);
    // No message from the backend: say what the status code means
    if (res.status === 404) throw new Error('Login service not found (404). Check that the backend has the /api/auth routes.');
    if (res.status >= 500) throw new Error(`The server had a problem (error ${res.status}). Check that the backend and MySQL are running.`);
    throw new Error(`Request failed (error ${res.status}).`);
  }
  return data; // expected: { token, user: { id, name, email, role } }
}

export const login = (email, password) =>
  USE_MOCK ? mockLogin(email.trim(), password) : request('/login', { email: email.trim(), password });

export const signup = data =>
  USE_MOCK ? mockSignup(data) : request('/signup', data);

/* ---------- Session ---------- */
// remember = true  -> stays logged in after the browser closes (localStorage)
// remember = false -> logged out when the browser/tab closes (sessionStorage)
export const saveSession = ({ token, user }, remember = true) => {
  localStorage.removeItem('rds_session');
  sessionStorage.removeItem('rds_session');
  (remember ? localStorage : sessionStorage).setItem('rds_session', JSON.stringify({ token, user }));
};
export const getSession = () => {
  try { return JSON.parse(sessionStorage.getItem('rds_session') || localStorage.getItem('rds_session')); } catch { return null; }
};
export const logout = () => {
  localStorage.removeItem('rds_session');
  sessionStorage.removeItem('rds_session');
};