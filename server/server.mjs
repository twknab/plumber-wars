// Production server: serves the built game (dist/) and a tiny leaderboard API backed by Firestore.
// Zero dependencies: Firestore is called over REST with the Cloud Run service account's token.
//   GET  /api/scores          -> { top: [{ initials, score, hero, cleared, at }] }
//   POST /api/scores          -> { rank, top }   body: { initials, hero, bests: [16 job scores] }
import http from 'node:http';
import { stat } from 'node:fs/promises';
import { createGzip } from 'node:zlib';
import { createReadStream } from 'node:fs';
import path from 'node:path';
import { validateEntry, TOP_N } from './scores.mjs';

const PORT = +process.env.PORT || 8080;
const ROOT = path.resolve(process.env.STATIC_DIR || 'dist');
const PROJECT = process.env.GOOGLE_CLOUD_PROJECT || 'twk-experiments';
const FS = `https://firestore.googleapis.com/v1/projects/${PROJECT}/databases/(default)/documents`;
const TYPES = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript', '.css': 'text/css', '.json': 'application/json', '.png': 'image/png', '.mp3': 'audio/mpeg', '.svg': 'image/svg+xml', '.ico': 'image/x-icon', '.txt': 'text/plain', '.webmanifest': 'application/manifest+json' };
const ZIP = new Set(['.html', '.js', '.css', '.json', '.svg', '.txt']);

// --- Firestore over REST -----------------------------------------------------------------------
let tok = { v: null, exp: 0 };
async function token() {
  if (tok.v && Date.now() < tok.exp - 60000) return tok.v;
  const r = await fetch('http://metadata.google.internal/computeMetadata/v1/instance/service-accounts/default/token', { headers: { 'Metadata-Flavor': 'Google' } });
  const j = await r.json(); tok = { v: j.access_token, exp: Date.now() + j.expires_in * 1000 }; return tok.v;
}
async function fs(pathPart, body) {
  const r = await fetch(FS + pathPart, { method: 'POST', headers: { Authorization: 'Bearer ' + await token(), 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
  if (!r.ok) throw new Error('firestore ' + r.status + ' ' + (await r.text()).slice(0, 200));
  return r.json();
}
const fromDoc = d => ({ initials: d.fields.initials.stringValue, score: +d.fields.score.integerValue, hero: d.fields.hero?.stringValue || '', cleared: +(d.fields.cleared?.integerValue || 0), at: d.fields.at?.timestampValue || '' });
let cache = { at: 0, top: null };
async function topScores(force) {
  if (!force && cache.top && Date.now() - cache.at < 15000) return cache.top;
  const rows = await fs(':runQuery', { structuredQuery: { from: [{ collectionId: 'scores' }], orderBy: [{ field: { fieldPath: 'score' }, direction: 'DESCENDING' }], limit: TOP_N + 10 } });
  // ties go to whoever got there first (single-field order, so no composite index needed)
  cache = { at: Date.now(), top: rows.filter(r => r.document).map(r => fromDoc(r.document)).sort((a, b) => b.score - a.score || a.at.localeCompare(b.at)).slice(0, TOP_N) };
  return cache.top;
}
async function rankOf(score) {
  const r = await fs(':runAggregationQuery', { structuredAggregationQuery: { structuredQuery: { from: [{ collectionId: 'scores' }], where: { fieldFilter: { field: { fieldPath: 'score' }, op: 'GREATER_THAN', value: { integerValue: String(score) } } } }, aggregations: [{ alias: 'n', count: {} }] } });
  return +(r[0]?.result?.aggregateFields?.n?.integerValue || 0) + 1;
}
async function addScore(e) {
  await fs('/scores', { fields: { initials: { stringValue: e.initials }, score: { integerValue: String(e.score) }, hero: { stringValue: e.hero }, cleared: { integerValue: String(e.cleared) }, at: { timestampValue: new Date().toISOString() } } });
}

// --- API ---------------------------------------------------------------------------------------
const recent = new Map(); // ip -> last submit time (one entry per 20s per client)
function json(res, code, obj) { res.writeHead(code, { 'Content-Type': 'application/json', 'Cache-Control': 'no-store' }); res.end(JSON.stringify(obj)); }
async function api(req, res) {
  try {
    if (req.method === 'GET') return json(res, 200, { top: await topScores() });
    if (req.method !== 'POST') return json(res, 405, { error: 'method' });
    const ip = (req.headers['x-forwarded-for'] || req.socket.remoteAddress || '').split(',')[0].trim();
    if (Date.now() - (recent.get(ip) || 0) < 20000) return json(res, 429, { error: 'slow down' });
    let raw = ''; for await (const c of req) { raw += c; if (raw.length > 4000) return json(res, 413, { error: 'too big' }); }
    let body; try { body = JSON.parse(raw); } catch { return json(res, 400, { error: 'bad json' }); }
    const v = validateEntry(body); if (v.error) return json(res, 400, v);
    recent.set(ip, Date.now()); if (recent.size > 5000) recent.clear();
    await addScore(v);
    const top = await topScores(true);
    return json(res, 200, { rank: await rankOf(v.score), top });
  } catch (e) { console.error(e); return json(res, 503, { error: 'leaderboard unavailable' }); }
}

// --- static files --------------------------------------------------------------------------------
async function serveStatic(req, res) {
  let p = decodeURIComponent(new URL(req.url, 'http://x').pathname);
  let file = path.join(ROOT, p);
  if (!file.startsWith(ROOT)) { res.writeHead(403); return res.end(); }
  let st = await stat(file).catch(() => null);
  if (!st || st.isDirectory()) { file = path.join(ROOT, 'index.html'); st = await stat(file); }
  const ext = path.extname(file);
  const headers = { 'Content-Type': TYPES[ext] || 'application/octet-stream', 'X-Content-Type-Options': 'nosniff', 'Referrer-Policy': 'strict-origin-when-cross-origin',
    'Cache-Control': p.startsWith('/assets/') ? 'public, max-age=31536000, immutable' : 'no-cache' };
  if (ZIP.has(ext) && st.size > 1024 && /\bgzip\b/.test(req.headers['accept-encoding'] || '')) {
    res.writeHead(200, { ...headers, 'Content-Encoding': 'gzip', Vary: 'Accept-Encoding' });
    return createReadStream(file).pipe(createGzip()).pipe(res);
  }
  res.writeHead(200, { ...headers, 'Content-Length': st.size });
  if (req.method === 'HEAD') return res.end();
  createReadStream(file).pipe(res);
}

http.createServer((req, res) => {
  if (req.url === '/health') { res.writeHead(200, { 'Content-Type': 'text/plain' }); return res.end('ok'); }
  if (req.url.split('?')[0] === '/api/scores') return api(req, res);
  if (req.method !== 'GET' && req.method !== 'HEAD') { res.writeHead(405); return res.end(); }
  serveStatic(req, res).catch(e => { console.error(e); res.writeHead(500); res.end(); });
}).listen(PORT, () => console.log('plumber-wars on :' + PORT));
