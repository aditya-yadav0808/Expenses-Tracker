// File-based persistence for dev/preview. Everything (accounts, transactions, ...) is saved in server/db.json,
// which travels with the project, so anyone you share it with sees the same accounts and data.
// Passwords are stored as salted scrypt hashes, never in plain text.
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { fileURLToPath } from 'node:url';
import { buildInitialData, STARTER_ACCOUNTS } from '../src/services/seedData.js';

const FILE = path.join(path.dirname(fileURLToPath(import.meta.url)), 'db.json');

const hash = (pw) => { const salt = crypto.randomBytes(16).toString('hex'); return `${salt}:${crypto.scryptSync(pw, salt, 64).toString('hex')}`; };
const check = (pw, stored) => {
  if (!stored) return false;
  const [salt, h] = stored.split(':');
  const a = Buffer.from(h, 'hex'); const b = crypto.scryptSync(pw, salt, 64);
  return a.length === b.length && crypto.timingSafeEqual(a, b);
};

function read() {
  if (!fs.existsSync(FILE)) {
    const creds = Object.fromEntries(Object.values(STARTER_ACCOUNTS).map((a) => [a.id, hash(a.password)]));
    write({ data: buildInitialData(), creds });
  }
  return JSON.parse(fs.readFileSync(FILE, 'utf8'));
}
function write(db) { const tmp = `${FILE}.tmp`; fs.writeFileSync(tmp, JSON.stringify(db, null, 2)); fs.renameSync(tmp, FILE); }

const body = (req) => new Promise((resolve, reject) => {
  let s = ''; req.on('data', (c) => { s += c; if (s.length > 20e6) { reject(new Error('too large')); req.destroy(); } });
  req.on('end', () => { try { resolve(s ? JSON.parse(s) : {}); } catch (e) { reject(e); } });
  req.on('error', reject);
});
const send = (res, code, obj) => { res.statusCode = code; res.setHeader('Content-Type', 'application/json'); res.end(JSON.stringify(obj)); };

async function handler(req, res, next) {
  const url = (req.url || '').split('?')[0];
  if (!url.startsWith('/local-db/')) return next();
  try {
    if (url === '/local-db/data' && req.method === 'GET') return send(res, 200, read().data);
    if (url === '/local-db/data' && (req.method === 'PUT' || req.method === 'POST')) {
      const data = await body(req);
      if (!data || !Array.isArray(data.users)) return send(res, 400, { error: 'Invalid data' });
      const db = read(); db.data = data; write(db); return send(res, 200, { ok: true });
    }
    if (url === '/local-db/verify' && req.method === 'POST') {
      const { userId, password } = await body(req);
      return send(res, 200, { ok: !!password && check(password, read().creds[userId]) });
    }
    if (url === '/local-db/password' && req.method === 'POST') {
      const { userId, current, password } = await body(req);
      const db = read();
      if (!userId || !password) return send(res, 400, { ok: false, error: 'Missing fields' });
      if (db.creds[userId] && !check(current || '', db.creds[userId])) return send(res, 200, { ok: false, error: 'Current password is incorrect.' });
      db.creds[userId] = hash(password); write(db); return send(res, 200, { ok: true });
    }
    return send(res, 404, { error: 'Not found' });
  } catch (e) { return send(res, 500, { error: String(e.message || e) }); }
}

export default function dbPlugin() {
  return {
    name: 'mm-file-db',
    configureServer(server) { server.middlewares.use(handler); },
    configurePreviewServer(server) { server.middlewares.use(handler); },
  };
}
