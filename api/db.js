// STRATOS Finance Tracker API: password-protected JSON storage on Vercel Blob.
const { put, del, head } = require('@vercel/blob');
const crypto = require('crypto');
const SEED0 = require('./_seed.json');
const AIR = { pilots: '', cabin: '', instructors: '', admins: '', signMonth: '', goLiveMonth: '', implOverride: '', notes: '', discount: 0, growth: 0, include: true, billing: 'annual', status: 'Pipeline', product: 'bundle' };
const SEED = Object.assign({}, SEED0, { airlines: SEED0.airlines.map(a => Object.assign({}, AIR, a)) });
const TOKEN = process.env.BLOB_READ_WRITE_TOKEN || '';
const SECRET = process.env.DB_SECRET || 'dev';
const STORE = (TOKEN.split('_')[3] || '').toLowerCase();
let BASE = `https://${STORE}.public.blob.vercel-storage.com`;
const P = name => `db/${SECRET}/${name}.json`;
const HIST_KEEP = 60;

function eq(a, b) { const x = Buffer.from(String(a || '')), y = Buffer.from(String(b || '')); return x.length === y.length && crypto.timingSafeEqual(x, y); }
function roleOf(req) {
  const k = req.headers['x-app-key'];
  const u = String(req.headers['x-app-user'] || '').trim().toLowerCase();
  const userOk = !process.env.APP_USER || eq(u, String(process.env.APP_USER).trim().toLowerCase());
  if (process.env.APP_PASSWORD && userOk && eq(k, process.env.APP_PASSWORD)) return 'admin';
  if (process.env.CONTRIBUTOR_PASSWORD && eq(k, process.env.CONTRIBUTOR_PASSWORD)) return 'interact';
  return null;
}
async function readJSON(name) {
  let r;
  try { r = await fetch(BASE + '/' + P(name), { cache: 'no-store' }); }
  catch (e) { try { const h = await head(P(name), { token: TOKEN }); BASE = new URL(h.url).origin; r = await fetch(h.url, { cache: 'no-store' }); } catch (e2) { if (String(e2 && e2.message).match(/not found|does not exist/i)) return null; throw e2; } }
  if (r.status === 404 || r.status === 403) return null;
  if (!r.ok) throw new Error('read ' + r.status);
  return r.json();
}
async function writeJSON(name, obj) {
  const r = await put(P(name), JSON.stringify(obj), { access: 'public', addRandomSuffix: false, allowOverwrite: true, contentType: 'application/json', cacheControlMaxAge: 60, token: TOKEN });
  try { BASE = new URL(r.url).origin; } catch (e) {}
}
async function body(req) {
  if (req.body && typeof req.body === 'object') return req.body;
  const chunks = []; for await (const c of req) chunks.push(c);
  return JSON.parse(Buffer.concat(chunks).toString('utf8') || '{}');
}
const DOCS = new Set(['core', 'ops']);

module.exports = async (req, res) => {
  res.setHeader('Cache-Control', 'no-store');
  res.setHeader('X-Robots-Tag', 'noindex');
  try {
    const role = roleOf(req);
    if (!role) return res.status(401).json({ error: 'unauthorized' });
    if (!STORE) return res.status(500).json({ error: 'Blob store not connected' });
    const q = req.query || {};
    if (q.auth !== undefined) return res.json({ role });
    if (q.bootstrap !== undefined) {
      const [core, ops] = await Promise.all([readJSON('core'), readJSON('ops')]);
      const state = Object.assign({}, SEED, core && core.state, ops && ops.state);
      return res.json({ role, state });
    }
    if (q.doc) {
      if (!DOCS.has(q.doc)) return res.status(400).json({ error: 'bad doc' });
      if (req.method === 'GET') { const d = await readJSON(q.doc); return res.json(d ? { exists: true, data: d } : { exists: false }); }
      if (req.method === 'PUT') {
        if (q.doc === 'core' && role !== 'admin') return res.status(403).json({ error: 'forbidden', code: 'invalid_argument' });
        const b = await body(req);
        if (!b || typeof b.state !== 'object') return res.status(400).json({ error: 'bad body', code: 'invalid_argument' });
        const s = JSON.stringify(b); if (s.length > 2e6) return res.status(413).json({ error: 'too large', code: 'quota_exceeded' });
        await writeJSON(q.doc, b); return res.json({ ok: true });
      }
      return res.status(405).end();
    }
    if (q.history !== undefined) {
      if (req.method === 'GET' && q.history === '') { const idx = (await readJSON('history-index')) || { items: [] }; return res.json(idx); }
      if (req.method === 'GET') { if (!/^[a-z0-9-]+$/i.test(q.history)) return res.status(400).end(); const d = await readJSON('history/' + q.history); return res.json(d ? { exists: true, data: d } : { exists: false }); }
      if (req.method === 'POST') {
        const b = await body(req);
        const id = String(Date.now()).padStart(14, '0') + '-' + crypto.randomBytes(3).toString('hex');
        await writeJSON('history/' + id, b);
        const idx = (await readJSON('history-index')) || { items: [] };
        idx.items = [{ id, savedAt: b.savedAt || '', savedBy: b.savedBy || '', summary: b.summary || [] }, ...idx.items.filter(x => x.id !== id)];
        const drop = idx.items.slice(HIST_KEEP); idx.items = idx.items.slice(0, HIST_KEEP);
        await writeJSON('history-index', idx);
        if (drop.length) { try { await del(drop.map(x => BASE + '/' + P('history/' + x.id)), { token: TOKEN }); } catch (e) {} }
        return res.json({ id });
      }
      return res.status(405).end();
    }
    return res.status(400).json({ error: 'bad request' });
  } catch (e) {
    return res.status(500).json({ error: String(e && e.message || e), code: 'unavailable' });
  }
};
