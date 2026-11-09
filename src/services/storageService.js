// Persistence layer. Data and password hashes live in server/db.json (via the /local-db endpoints in
// server/dbPlugin.js), so accounts survive browser changes and travel with the project.
// Only the login session stays in the browser. Replace with real API calls when a backend exists.
const J = { 'Content-Type': 'application/json' };
const post = (url, payload) => fetch(url, { method: 'POST', headers: J, body: JSON.stringify(payload) }).then((r) => r.json());

export const SESSION = 'mm_session_v1';
let cache = null; let timer = null;

export async function initStorage() {
  const r = await fetch('/local-db/data');
  if (!r.ok) throw new Error('Data server not reachable');
  cache = await r.json();
}
export const loadData = () => cache;

const flush = () => { timer = null; return fetch('/local-db/data', { method: 'PUT', headers: J, body: JSON.stringify(cache) }).catch((e) => console.error('Save failed', e)); };
export const saveData = (d) => { cache = d; clearTimeout(timer); timer = setTimeout(flush, 150); };
if (typeof window !== 'undefined') window.addEventListener('pagehide', () => { if (timer && cache) navigator.sendBeacon('/local-db/data', new Blob([JSON.stringify(cache)], { type: 'application/json' })); });

export const verifyPassword = (userId, password) => post('/local-db/verify', { userId, password }).then((r) => r.ok).catch(() => false);
export const setPassword = (userId, password, current) => post('/local-db/password', { userId, password, current }).catch(() => ({ ok: false, error: 'Could not reach the data server.' }));

export const loadSession = () => { try { return JSON.parse(localStorage.getItem(SESSION) || sessionStorage.getItem(SESSION)); } catch { return null; } };
export const clearSession = () => { localStorage.removeItem(SESSION); sessionStorage.removeItem(SESSION); };
export const saveSession = (s, remember) => { clearSession(); (remember ? localStorage : sessionStorage).setItem(SESSION, JSON.stringify(s)); };
