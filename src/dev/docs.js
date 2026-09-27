// Dev-only: regenerates the README images in docs/ straight from the game's art.
// Open /?docs=1 on the dev server; results land in window.__docs.
//   docs/logo.png        - title logo + badge
//   docs/sprites.png     - sprite sheet of every character, vehicle, tool and house
//   docs/shot-*.png      - screenshots of key screens
import { PX } from '../core/pixel.js';
import { C } from '../core/palette.js';
import { logoText, logoWidth } from '../art/brand.js';
import { HEROES, RIVALS } from '../data/content.js';
import { JOBS, TOOL_INFO } from '../data/jobs.js';
import { portrait, body } from '../art/people.js';
import { houseTextures } from '../art/houses.js';

const sleep = ms => new Promise(r => setTimeout(r, ms));
async function save(path, canvas) {
  const blob = await new Promise(r => canvas.toBlob(r, 'image/png'));
  return (await fetch('/__save?path=' + path, { method: 'POST', body: blob })).text();
}
const up = (src, k) => { const c = document.createElement('canvas'); c.width = src.width * k; c.height = src.height * k; const x = c.getContext('2d'); x.imageSmoothingEnabled = false; x.drawImage(src, 0, 0, c.width, c.height); return c; };

function logo(scene) {
  const c = document.createElement('canvas'); c.width = 300; c.height = 150; const x = c.getContext('2d'); x.imageSmoothingEnabled = false;
  const img = k => scene.textures.get(k).getSourceImage();
  x.drawImage(img('badgeBig'), 114, 0); x.drawImage(img('logo'), 19, 62);
  return up(c, 2);
}

function sheet(scene) {
  const W = 480, rows = []; let y = 4;
  const c = document.createElement('canvas'); c.width = W; c.height = 2400; const x = c.getContext('2d'); x.imageSmoothingEnabled = false;
  x.fillStyle = '#262b44'; x.fillRect(0, 0, W, 2400);
  const img = (k, f) => { const t = scene.textures.get(k); const fr = t.get(f ?? '__BASE'); return { src: t.getSourceImage(), fr }; };
  const label = (s) => { const p = new PX(W, 12); logoText(p, 6, 2, s, 1, [C.brown, C.gold, C.yellow], { shadow: C.ink }); x.drawImage(p.commit(), 0, y); y += 16; };
  const row = (keys, gap = 6) => { let cx = 6, h = 0; for (const [k, f] of keys) { const { src, fr } = img(k, f); if (cx + fr.width > W - 4) { cx = 6; y += h + gap; h = 0; } x.drawImage(src, fr.cutX, fr.cutY, fr.width, fr.height, cx, y, fr.width, fr.height); cx += fr.width + gap; h = Math.max(h, fr.height); } y += h + 10; };
  label('THE HOMIES');
  row(HEROES.flatMap(h => ['happy', 'smug', 'yell'].map(m => [portrait(scene, h.id, h.look, m)])).concat(HEROES.map(h => [body(scene, h.id, h.look), 0])));
  label('NORTHWEST');
  row([...['yell', 'angry', 'smug', 'worried'].map(m => [portrait(scene, 'randy', RIVALS.randy.look, m)]), ...['yell', 'smug'].map(m => [portrait(scene, 'skeeter', RIVALS.skeeter.look, m)])]);
  label('CUSTOMERS');
  row(JOBS.map((j, i) => [portrait(scene, 'job' + i, j.look, 'worried')]), 4);
  label('ON THE ROAD');
  row([['van'], ['truck'], ...[0, 1, 2, 3, 4, 5, 6].map(i => ['car' + i]), ['wagon'], ['bus'], ['cyclist', 0], ['scooter', 0], ['raccoon', 0], ['pothole'], ['puddle'], ['oil'], ['cone'], ['barrier'], ['turd'], ['tp'], ['plungerJunk'], ['wrenchJunk'], ['coffee'], ['kit'], ['cash'], ['fir0'], ['maple'], ['espresso'], ['sideVan', 0], ['sideTruck', 0], ['orca']]);
  label('THE TRUCK TRAY');
  row(Object.keys(TOOL_INFO).map(k => ['tool_' + k]), 4);
  label('HOUSE CALLS');
  row(JOBS.map(j => [houseTextures(scene, j, false) + 's']), 4);
  const out = document.createElement('canvas'); out.width = W; out.height = y; out.getContext('2d').drawImage(c, 0, 0);
  return up(out, 2);
}

async function shot(game, key, data, wait = 2500, prep) {
  game.scene.getScenes(true).forEach(s => game.scene.stop(s.sys.settings.key));
  game.scene.start(key, data); await sleep(wait);
  if (prep) await prep(game.scene.getScene(key));
  const snap = await new Promise(r => game.renderer.snapshot(r));
  const c = document.createElement('canvas'); c.width = snap.width; c.height = snap.height; c.getContext('2d').drawImage(snap, 0, 0);
  // normalise to the game's native pixels x2
  const n = document.createElement('canvas'); n.width = 270 * 2; n.height = Math.round(game.scale.height * 2); const nx = n.getContext('2d'); nx.imageSmoothingEnabled = false; nx.drawImage(c, 0, 0, n.width, n.height);
  return n;
}

export async function makeDocs(game) {
  const out = [];
  const scene = game.scene.getScenes(true)[0] || game.scene.getScene('Boot');
  out.push(await save('docs/logo.png', logo(scene)));
  out.push(await save('docs/sprites.png', sheet(scene)));
  out.push(await save('docs/shot-title.png', await shot(game, 'Title', {}, 3500)));
  out.push(await save('docs/shot-drive.png', await shot(game, 'Drive', { job: 7 }, 9000)));
  out.push(await save('docs/shot-repair.png', await shot(game, 'Repair', { job: 4, secs: 70 }, 3000, async s => { s.pickTool('bucket', s.slots.find(x => x.k === 'bucket').bg); await sleep(300); })));
  out.push(await save('docs/shot-alki.png', await shot(game, 'Arrival', { job: 15 }, 5500)));
  window.__docs = out; return out;
}

// Individual character/house images for the asset review page (docs/assets/*.png, 4x scale).
export async function makeAssets(game) {
  const scene = game.scene.getScenes(true)[0] || game.scene.getScene('Boot');
  const out = [];
  const exp = async (name, key, frame, k = 4) => {
    const t = scene.textures.get(key); const fr = t.get(frame ?? '__BASE'); const c = document.createElement('canvas'); c.width = fr.width; c.height = fr.height;
    c.getContext('2d').drawImage(t.getSourceImage(), fr.cutX, fr.cutY, fr.width, fr.height, 0, 0, fr.width, fr.height);
    out.push(await save(`docs/assets/${name}.png`, up(c, k)));
  };
  const moods = ['happy', 'smug', 'neutral', 'worried', 'angry', 'yell'];
  for (const h of HEROES) { for (const m of moods) await exp(`${h.id}-${m}`, portrait(scene, h.id, h.look, m)); await exp(`${h.id}-body`, body(scene, h.id, h.look), 0, 6); }
  for (const [id, r] of Object.entries(RIVALS)) { for (const m of moods) await exp(`${id}-${m}`, portrait(scene, id, r.look, m)); await exp(`${id}-body`, body(scene, id, r.look), 0, 6); }
  for (let i = 0; i < JOBS.length; i++) { const j = JOBS[i]; for (const m of ['happy', 'worried', 'yell']) await exp(`job${i}-${m}`, portrait(scene, 'job' + i, j.look, m)); await exp(`house${i}`, houseTextures(scene, j, false), undefined, 2); }
  window.__assets = out.length; return out.length;
}
