import { defineConfig } from 'vite';
import { writeFileSync, mkdirSync } from 'node:fs';
import { dirname } from 'node:path';
import { artHash } from './art-hash.js';
import { execSync } from 'node:child_process';

import { readFileSync as readIfAny } from 'node:fs';
// Cloud Build has no .git, so deploy.sh writes the commit to .build-id first.
const sha = (() => { try { return execSync('git rev-parse --short HEAD', { stdio: ['ignore', 'pipe', 'ignore'] }).toString().trim(); } catch { try { return readIfAny('.build-id', 'utf8').trim(); } catch { return 'dev'; } } })();
const BUILD = `${new Date().toISOString().slice(0, 10)} ${sha}`;

// Dev-only endpoint used by src/dev/og.js and src/dev/docs.js to write generated images
// (share card, README logo/screenshots/sprite sheet) into the repo.
const ALLOWED = /^(public\/og\.png|docs\/[a-z0-9-]+\.png|docs\/assets\/[a-z0-9-]+\.png|preview\/[a-z0-9-]+\.(wav|json))$/;
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

export default defineConfig({ plugins: [saveImages], define: { __BUILD__: JSON.stringify(BUILD) } });
