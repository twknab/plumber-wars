import { defineConfig } from 'vite';
import { writeFileSync, mkdirSync } from 'node:fs';
import { dirname } from 'node:path';
import { artHash } from './art-hash.js';
import { execSync } from 'node:child_process';
import { validateEntry, TOP_N } from './server/scores.mjs';

import { readFileSync as readIfAny } from 'node:fs';
// Cloud Build has no .git, so deploy.sh writes the commit to .build-id first.
// .build-id holds just the commit (older deploys also wrote a date, so only its last word is used).
const sha = (() => { try { return execSync('git rev-parse --short HEAD', { stdio: ['ignore', 'pipe', 'ignore'] }).toString().trim(); } catch { try { return readIfAny('.build-id', 'utf8').trim().split(/\s+/).pop(); } catch { return 'dev'; } } })();
const BUILD = `${new Date().toISOString().slice(0, 16).replace('T', ' ')} UTC ${sha}`; // e.g. 2026-09-28 06:58 UTC 01a15fe

// Dev-only endpoint used by src/dev/og.js and src/dev/docs.js to write generated images
// (share card, README logo/screenshots/sprite sheet) into the repo.
const ALLOWED = /^(public\/og\.png|docs\/[a-z0-9-]+\.png|docs\/assets\/[a-z0-9-]+\.png|preview\/[a-z0-9-]+\.(wav|json)|public\/districts\/[a-z0-9-]+\.png)$/;
const saveImages = {
  name: 'save-images',
  apply: 'serve',
  configureServer(server) {
    server.middlewares.use('/__save', (req, res) => {
      const path = new URL(req.url, 'http://x').searchParams.get('path') || '';
      if (!ALLOWED.test(path)) { res.statusCode = 400; res.end('bad path'); return; }
      const chunks = [];
      req.on('data', c => chunks.push(c));
      req.on('end', () => {
        mkdirSync(dirname(path), { recursive: true }); writeFileSync(path, Buffer.concat(chunks));
        if (path === 'docs/sprites.png') writeFileSync('docs/sprites.hash', artHash() + '\n');
        res.end('saved ' + path);
      });
    });
  },
};

// Dev-only stand-in for the Firestore leaderboard (server/server.mjs in production): same API, kept in memory.
const devScores = {
  name: 'dev-scores',
  apply: 'serve',
  configureServer(server) {
    const rows = [{ initials: 'GGG', score: 41000, hero: 'dalton', cleared: 16, at: '2026-01-01' }, { initials: 'NWR', score: 9000, hero: '', cleared: 5, at: '2026-01-02' }];
    const top = () => [...rows].sort((a, b) => b.score - a.score || a.at.localeCompare(b.at)).slice(0, TOP_N);
    server.middlewares.use('/api/scores', (req, res) => {
      res.setHeader('Content-Type', 'application/json');
      const tag = rows2 => { const me = new URL(req.url, 'http://x').searchParams.get('me'); return rows2.map(({ player, ...e }) => (me && player === me ? { ...e, you: true } : e)); };
      if (req.method === 'GET') return res.end(JSON.stringify({ top: tag(top()) }));
      let raw = ''; req.on('data', c => { raw += c; }); req.on('end', () => {
        let v; try { v = validateEntry(JSON.parse(raw)); } catch { v = { error: 'bad json' }; }
        if (v.error) { res.statusCode = 400; return res.end(JSON.stringify(v)); }
        const old = v.player && rows.find(r => r.player === v.player);
        if (old) { if (v.score > old.score) Object.assign(old, v, { at: new Date().toISOString() }); else old.initials = v.initials; }
        else rows.push({ ...v, at: new Date().toISOString() });
        res.end(JSON.stringify({ rank: rows.filter(r => r.score > v.score).length + 1, top: top().map(({ player, ...e }) => (v.player && player === v.player ? { ...e, you: true } : e)) }));
      });
    });
  },
};

export default defineConfig({ plugins: [saveImages, devScores], define: { __BUILD__: JSON.stringify(BUILD) } });
