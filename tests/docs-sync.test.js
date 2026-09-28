// Keeps the README, About screen and generated images honest as the game design changes.
import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, existsSync } from 'node:fs';
import { JOBS } from '../src/data/jobs.js';
import { DISTRICTS } from '../src/data/content.js';
import { artHash } from '../art-hash.js';

const readme = readFileSync('README.md', 'utf8');
const about = readFileSync('src/scenes/About.js', 'utf8');

test('README job count and job table match the game', () => {
  assert.match(readme, new RegExp(`\\*\\*${JOBS.length} jobs\\*\\*`), `README should say **${JOBS.length} jobs**`);
  for (const d of DISTRICTS) {
    const name = d.name.split(' ').map(w => w[0] + w.slice(1).toLowerCase()).join(' ');
    assert.ok(readme.includes(name), `README job table is missing district ${name}`);
  }
  const names = DISTRICTS.map(d => d.name.split(' ').map(w => w[0] + w.slice(1).toLowerCase()).join(' '));
  const jobsTable = readme.split(/### The \d+ jobs/)[1].split('\n## ')[0]; // only the jobs table, not the photo credits
  const rows = jobsTable.split('\n').filter(l => names.some(n => l.startsWith('| ' + n)));
  const listed = rows.reduce((n, r) => n + r.split('|')[2].split('·').length, 0);
  assert.equal(listed, JOBS.length, 'README job table should list every job');
});

test('About screen job count matches the game', () => {
  assert.ok(about.includes(`FIX ${JOBS.length} REAL`), `About.js should say "FIX ${JOBS.length} REAL ..."`);
});

test('README images exist', () => {
  for (const f of ['docs/logo.png', 'docs/sprites.png', 'docs/shot-title.png', 'docs/shot-drive.png', 'docs/shot-repair.png', 'docs/shot-alki.png', 'docs/homies.png', 'docs/district-intros.png', 'public/og.png']) assert.ok(existsSync(f), f + ' missing');
});

test('sprite sheet is regenerated whenever art or characters change', () => {
  const stamp = existsSync('docs/sprites.hash') ? readFileSync('docs/sprites.hash', 'utf8').trim() : '(none)';
  assert.equal(stamp, artHash(), 'Art/characters changed since docs/sprites.png was made. Run the dev server and open /?docs=1 (and /?og=1).');
});

test('every spoken line has a recorded voice clip', async () => {
  const { TRASH, HEROES, VOICE_EXTRA } = await import('../src/data/content.js');
  const { voiceKey } = await import('../src/core/voicekey.js');
  const man = JSON.parse(readFileSync('public/voice/manifest.json', 'utf8'));
  const lines = [...Object.values(TRASH).flat(), ...HEROES.flatMap(h => h.barks), ...Object.values(VOICE_EXTRA).flat()];
  const missing = lines.filter(t => !man[voiceKey(t)] || !existsSync('public/voice/' + man[voiceKey(t)].f));
  assert.deepEqual(missing, [], 'Record new lines with: node scripts/voices.mjs (project from .env)');
});
