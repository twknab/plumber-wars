// Fingerprint of everything that affects the sprite sheet / README images: the art code plus the
// visual bits of the data (character looks, houses, which jobs exist). Dialogue edits don't count.
// Written to docs/sprites.hash when the images are regenerated (/?docs=1); checked by tests.
import { createHash } from 'node:crypto';
import { readFileSync, readdirSync } from 'node:fs';
import { HEROES, RIVALS, DISTRICTS } from './src/data/content.js';
import { JOBS, TOOL_INFO } from './src/data/jobs.js';

const ART_FILES = [...readdirSync('src/art').map(f => 'src/art/' + f), 'src/core/pixel.js', 'src/core/palette.js'].sort();
export function artHash() {
  const h = createHash('sha256');
  for (const f of ART_FILES) h.update(f + '\n' + readFileSync(f, 'utf8'));
  h.update(JSON.stringify({ heroes: HEROES.map(x => x.look), rivals: RIVALS, districts: DISTRICTS.map(d => d.name), jobs: JOBS.map(j => [j.title, j.scene, j.variant, j.look, j.house]), tools: Object.keys(TOOL_INFO) }));
  return h.digest('hex').slice(0, 16);
}
