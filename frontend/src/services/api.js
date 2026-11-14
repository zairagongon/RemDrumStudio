import { getSession, logout } from './auth.js';

async function request(method, path, body) {
  const session = getSession();
  let res;
  try {
    res = await fetch(`/api${path}`, {
      method,
      headers: { 'Content-Type': 'application/json', ...(session?.token ? { Authorization: `Bearer ${session.token}` } : {}) },
      body: body === undefined ? undefined : JSON.stringify(body)
    });
  } catch {
    throw new Error('Cannot reach the server. Please try again later.');
  }
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    if (res.status === 401 && session) { logout(); window.location.assign('/login'); } // session expired
    const err = new Error(data.message || `Request failed (error ${res.status}).`);
    err.status = res.status;
    throw err;
  }
  return data;
}

export const api = {
  get: path => request('GET', path),
  post: (path, body = {}) => request('POST', path, body),
  patch: (path, body) => request('PATCH', path, body)
};
