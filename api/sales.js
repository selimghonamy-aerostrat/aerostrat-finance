// AeroStrat Leads & Sales API: its own JSON document on Vercel Blob, kept apart from the finance data.
// Every save is a new version file under db/<secret>/sales/ ; the newest one is the current data.
const { put, del, list } = require('@vercel/blob');
const crypto = require('crypto');
const SECRET = process.env.DB_SECRET || 'dev';
const PREFIX = `db/${SECRET}/sales/`;
const KEEP = 40;
const BACKUP = `db/${SECRET}/sales-backup/`; // outside PREFIX, so versions() never lists or prunes it

function eq(a, b) { const x = Buffer.from(String(a || '')), y = Buffer.from(String(b || '')); return x.length === y.length && crypto.timingSafeEqual(x, y); }
function roleOf(req) {
  const k = req.headers['x-app-key'];
  const u = String(req.headers['x-app-user'] || '').trim().toLowerCase();
  const userOk = !process.env.APP_USER || eq(u, String(process.env.APP_USER).trim().toLowerCase());
  if (process.env.APP_PASSWORD && userOk && eq(k, process.env.APP_PASSWORD)) return 'admin';
  if (process.env.CONTRIBUTOR_PASSWORD && eq(k, process.env.CONTRIBUTOR_PASSWORD)) return 'interact';
  return null;
}
async function versions() {
  let cursor, all = [];
  do {
    const r = await list({ prefix: PREFIX, cursor, limit: 1000 });
    all = all.concat(r.blobs || []);
    cursor = r.hasMore ? r.cursor : undefined;
  } while (cursor);
  all.sort((a, b) => (a.pathname < b.pathname ? 1 : a.pathname > b.pathname ? -1 : 0));
  return all;
}
async function readBlob(b) {
  const r = await fetch(b.url + (b.url.includes('?') ? '&' : '?') + 'n=' + Date.now(), { cache: 'no-store' });
  if (!r.ok) throw new Error('read failed ' + r.status);
  return r.json();
}
function bodyOf(req) {
  if (req.body && typeof req.body === 'object') return req.body;
  try { return JSON.parse(req.body || '{}'); } catch (e) { return {}; }
}

module.exports = async (req, res) => {
  res.setHeader('cache-control', 'no-store');
  const role = roleOf(req);
  if (!role) { res.status(401).json({ error: 'Sign in again.' }); return; }
  try {
    if (req.method === 'GET') {
      const all = await versions();
      if (!all.length) { res.status(200).json({ exists: false, role }); return; }
      const d = await readBlob(all[0]);
      res.status(200).json({ exists: true, data: d, savedAt: d.savedAt || '', role, versions: all.length });
      return;
    }
    if (req.method === 'PUT') {
      const body = bodyOf(req);
      const data = body.data;
      if (!data || typeof data !== 'object' || !Array.isArray(data.leads)) { res.status(400).json({ error: 'Nothing to save.' }); return; }
      const all = await versions();
      const cur = all.length ? await readBlob(all[0]).catch(e => { if (!body.force) throw e; return null; }) : null;
      if (cur && !body.force) {
        if ((cur.savedAt || '') !== (body.base || '')) {
          res.status(409).json({ code: 'conflict', data: cur, savedAt: cur.savedAt || '', savedBy: cur.savedBy || '' });
          return;
        }
      }
      const now = new Date().toISOString();
      // Growth module (schema 3): before the first save that adds its collections, keep a copy of the data as it was.
      let backup = '';
      if (cur && Number(data.schema_version || 0) >= 3 && !(Number(cur.schema_version || 0) >= 3)) {
        backup = 'pre-growth-' + now.replace(/[:.]/g, '-') + '.json';
        await put(BACKUP + backup, JSON.stringify(cur), { access: 'public', contentType: 'application/json', addRandomSuffix: false });
      }
      data.savedAt = now;
      data.savedBy = String(req.headers['x-app-user'] || '').trim() || 'Someone';
      const s = JSON.stringify(data);
      if (s.length > 4000000) { res.status(413).json({ error: 'The leads data is too large to save.' }); return; }
      const name = PREFIX + now.replace(/[:.]/g, '-') + '-' + crypto.randomBytes(3).toString('hex') + '.json';
      await put(name, s, { access: 'public', contentType: 'application/json', addRandomSuffix: false, cacheControlMaxAge: 60 });
      const old = all.slice(KEEP - 1);
      if (old.length) { try { await del(old.map(b => b.url)); } catch (e) { /* old versions can wait */ } }
      res.status(200).json(Object.assign({ ok: true, savedAt: now, savedBy: data.savedBy }, backup ? { backup } : {}));
      return;
    }
    res.status(405).json({ error: 'Method not allowed' });
  } catch (e) {
    res.status(500).json({ error: String((e && e.message) || e) });
  }
};
