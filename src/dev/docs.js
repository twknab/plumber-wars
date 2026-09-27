// Dev-only: regenerates the README images in docs/ straight from the game's art.
// Open /?docs=1 on the dev server; results land in window.__docs.
//   docs/logo.png        - title logo + badge
//   docs/sprites.png     - sprite sheet of every character, vehicle, tool and house
//   docs/shot-*.png      - screenshots of key screens
//   docs/district-intros.png - every "Welcome to <district>" intro screen, in play order
//   docs/homies.png      - character sheet for the crew (every mood, body sprite, stats, perks)
import { PX } from '../core/pixel.js';
import { C } from '../core/palette.js';
import { logoText, logoWidth } from '../art/brand.js';
import { HEROES, RIVALS, DISTRICTS, ORDER, districtJobs } from '../data/content.js';
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

// Shared layout helpers for the big share sheets (drawn at final size, crisp pixel art).
const FONT = 'bold {n}px ui-monospace, Menlo, monospace';
function wrap(x, text, px, y, maxW, lh) {
  let line = '';
  for (const w of text.split(' ')) { const t = line ? line + ' ' + w : w; if (x.measureText(t).width > maxW && line) { x.fillText(line, px, y); y += lh; line = w; } else line = t; }
  if (line) { x.fillText(line, px, y); y += lh; }
  return y;
}
function heading(canvasW, title, sub) {
  const p = new PX(Math.ceil(canvasW / 3), 16); logoText(p, 4, 2, title, 1, [C.brown, C.gold, C.yellow], { shadow: C.ink });
  return { img: p.commit(), sub };
}

// Every district intro screen, in the order you play them.
async function introSheet(game) {
  const shots = [];
  const seen = new Set();
  for (const ji of ORDER) {
    const d = JOBS[ji].district; if (seen.has(d)) continue; seen.add(d);
    game.scene.getScenes(true).forEach(s => game.scene.stop(s.sys.settings.key));
    game.scene.start('District', { job: districtJobs(d)[0] });
    await sleep(2200);
    const s = game.scene.getScene('District'); s.time.removeAllEvents(); s.tweens.killAll(); await sleep(200);
    shots.push([await new Promise(r => game.renderer.snapshot(r)), `${shots.length + 1}. ${DISTRICTS[d].name}`]);
  }
  game.scene.getScenes(true).forEach(s => game.scene.stop(s.sys.settings.key));
  const w = 270, h = Math.round(game.scale.height), S = 2, pad = 24, lab = 40, cols = 3, rows = Math.ceil(shots.length / cols);
  const cv = document.createElement('canvas'); cv.width = cols * (w * S + pad) + pad; cv.height = rows * (h * S + pad + lab) + pad + 90;
  const x = cv.getContext('2d'); x.imageSmoothingEnabled = false; x.fillStyle = C.ink; x.fillRect(0, 0, cv.width, cv.height);
  const hd = heading(cv.width, 'WELCOME TO THE NEIGHBORHOOD'); x.drawImage(hd.img, pad - 12, 16, hd.img.width * 3, hd.img.height * 3);
  shots.forEach(([img, label], i) => {
    const px = pad + (i % cols) * (w * S + pad), py = 90 + Math.floor(i / cols) * (h * S + pad + lab);
    x.fillStyle = C.lime; x.font = FONT.replace('{n}', 26); x.fillText(label, px, py + 28);
    x.drawImage(img, 0, 0, img.width, img.height, px, py + lab, w * S, h * S); x.strokeStyle = C.storm; x.lineWidth = 2; x.strokeRect(px, py + lab, w * S, h * S);
  });
  return cv;
}

// Character sheet for The Homies: every mood, the full-body sprite, stats, perk and assist.
function homiesSheet(scene) {
  const moods = ['happy', 'smug', 'neutral', 'worried', 'angry', 'yell'];
  const colW = 420, pad = 30, W = HEROES.length * colW + pad * 2, H = 1070;
  const cv = document.createElement('canvas'); cv.width = W; cv.height = H;
  const x = cv.getContext('2d'); x.imageSmoothingEnabled = false; x.fillStyle = C.ink; x.fillRect(0, 0, W, H);
  const draw = (key, frame, dx, dy, k) => { const t = scene.textures.get(key); const fr = t.get(frame ?? '__BASE'); x.drawImage(t.getSourceImage(), fr.cutX, fr.cutY, fr.width, fr.height, dx, dy, fr.width * k, fr.height * k); return fr; };
  const hd = heading(W, "THE HOMIES"); x.drawImage(hd.img, pad - 12, 18, hd.img.width * 3, hd.img.height * 3);
  x.fillStyle = C.silver; x.font = FONT.replace('{n}', 20); x.fillText("G'S PLUMBING - PLUMBER WARS", pad, 92);
  HEROES.forEach((h, i) => {
    const cx = pad + i * colW, w = colW - 24; let y = 120;
    x.fillStyle = C.night; x.fillRect(cx, y, w, H - y - pad); x.strokeStyle = h.color; x.lineWidth = 3; x.strokeRect(cx, y, w, H - y - pad);
    y += 16;
    const nm = new PX(120, 16); logoText(nm, 2, 2, h.name, 1, [C.brown, C.gold, C.yellow], { shadow: C.ink }); x.drawImage(nm.commit(), cx + 14, y, 360, 48); y += 58;
    x.fillStyle = h.color; x.font = FONT.replace('{n}', 22); x.fillText(h.role, cx + 18, y); y += 22;
    // six moods, 3 x 2
    moods.forEach((m, k) => { const px = cx + 18 + (k % 3) * 128, py = y + Math.floor(k / 3) * 150; draw(portrait(scene, h.id, h.look, m), undefined, px, py, 2.5); x.fillStyle = C.slate; x.font = FONT.replace('{n}', 15); x.fillText(m.toUpperCase(), px + 4, py + 136); });
    y += 310;
    // full body, big
    const bk = body(scene, h.id, h.look); const fr = scene.textures.get(bk).get(0); const k = 8;
    x.fillStyle = C.storm; x.fillRect(cx + 18, y, w - 36, fr.height * k + 24);
    draw(bk, 0, cx + (w - fr.width * k) / 2, y + 12, k); y += fr.height * k + 44;
    // stats
    x.font = FONT.replace('{n}', 18);
    for (const [label, v] of Object.entries(h.stats)) {
      x.fillStyle = C.silver; x.fillText(label.toUpperCase(), cx + 18, y + 16);
      for (let p = 0; p < 5; p++) { x.fillStyle = p < v ? h.color : C.storm; x.fillRect(cx + 110 + p * 30, y + 2, 24, 16); }
      y += 28;
    }
    y += 12;
    x.fillStyle = C.gold; x.font = FONT.replace('{n}', 18); x.fillText('PERK', cx + 18, y); y += 24;
    x.fillStyle = C.white; x.font = FONT.replace('{n}', 17); y = wrap(x, h.perk, cx + 18, y, w - 36, 22) + 10;
    x.fillStyle = C.gold; x.font = FONT.replace('{n}', 18); x.fillText('ASSIST', cx + 18, y); y += 24;
    x.fillStyle = C.white; x.font = FONT.replace('{n}', 17); y = wrap(x, h.assist, cx + 18, y, w - 36, 22);
  });
  return cv;
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
  out.push(await save('docs/homies.png', homiesSheet(scene)));
  out.push(await save('docs/district-intros.png', await introSheet(game)));
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
