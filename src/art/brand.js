// G's Plumbing branding + big set pieces: chunky logo lettering, the G's badge, side-view vans,
// the Seattle skyline title backdrop.
import { PX, bayer } from '../core/pixel.js';
import { C, RAMP } from '../core/palette.js';
import { mk } from './sprites.js';

// 5x7 glyphs reused for logo lettering (subset).
const L = {
  A: '.###.|#...#|#...#|#####|#...#|#...#|#...#', B: '####.|#...#|#...#|####.|#...#|#...#|####.', E: '#####|#....|#....|####.|#....|#....|#####',
  G: '.###.|#...#|#....|#.###|#...#|#...#|.###.', I: '###|.#.|.#.|.#.|.#.|.#.|###', L: '#....|#....|#....|#....|#....|#....|#####',
  M: '#...#|##.##|#.#.#|#.#.#|#...#|#...#|#...#', N: '#...#|#...#|##..#|#.#.#|#..##|#...#|#...#', P: '####.|#...#|#...#|####.|#....|#....|#....',
  R: '####.|#...#|#...#|####.|#.#..|#..#.|#...#', S: '.####|#....|#....|.###.|....#|....#|####.', U: '#...#|#...#|#...#|#...#|#...#|#...#|.###.',
  W: '#...#|#...#|#...#|#.#.#|#.#.#|#.#.#|.#.#.', O: '.###.|#...#|#...#|#...#|#...#|#...#|.###.', H: '#...#|#...#|#...#|#####|#...#|#...#|#...#',
  T: '#####|..#..|..#..|..#..|..#..|..#..|..#..', C: '.###.|#...#|#....|#....|#....|#...#|.###.', "'": '#|#|.|.|.|.|.', ' ': '..|..|..|..|..|..|..',
  '#': '.#.#.|.#.#.|#####|.#.#.|#####|.#.#.|.#.#.', 2: '.###.|#...#|....#|...#.|..#..|.#...|#####', V: '#...#|#...#|#...#|#...#|#...#|.#.#.|..#..', Y: '#...#|#...#|.#.#.|..#..|..#..|..#..|..#..',
};
export function logoWidth(str, s) { return str.split('').reduce((w, ch) => w + ((L[ch] || L[' ']).split('|')[0].length + 1) * s, 0) - s; }
// Chunky bevelled lettering: gradient face, light top edge, thick outline + drop shadow.
export function logoText(p, x, y, str, s, ramp = RAMP.gold, { shadow = C.ink, outline = C.ink } = {}) {
  const q = new PX(p.w, p.h);
  let cx = x;
  for (const ch of str) {
    const rows = (L[ch] || L[' ']).split('|'); const gw = rows[0].length;
    rows.forEach((r, j) => { for (let i = 0; i < gw; i++) if (r[i] === '#') {
      for (let yy = 0; yy < s; yy++) for (let xx = 0; xx < s; xx++) {
        const t = (j * s + yy) / (7 * s); const k = Math.min(ramp.length - 1, Math.floor((1 - t) * ramp.length * 0.999 + (bayer(cx + i * s + xx, y + j * s + yy) - 0.5) * 0.6));
        q.px(cx + i * s + xx, y + j * s + yy, ramp[Math.max(0, k)]);
      }
      if (j === 0 || r[i] !== '#' || (rows[j - 1] && rows[j - 1][i] !== '#')) q.hline(cx + i * s, y + j * s, s, C.white);
    } });
    cx += (gw + 1) * s;
  }
  q.outline(outline, true); q.outline(outline);
  if (shadow) { for (let j = q.h - 1; j >= 0; j--) for (let i = q.w - 1; i >= 0; i--) if ((q.get(i, j) >>> 24) && !(q.get(i + 2, j + 3) >>> 24)) p.px(i + 2, j + 3, shadow); }
  p.stamp(q, 0, 0);
}

function badge(p, cx, cy, r) {
  p.ellipse(cx, cy, r, r, C.ink); p.blob(cx, cy, r - 2, r - 2, [C.deep, C.forest, C.green, C.lime]);
  p.ring(cx, cy, r - 3, r - 3, C.gold); p.ring(cx, cy, r - 4, r - 4, C.yellow);
  // crossed wrench + plunger behind the G
  p.thick(cx - r * 0.6, cy + r * 0.6, cx + r * 0.6, cy - r * 0.6, 3, C.silver); p.ellipse(cx + r * 0.62, cy - r * 0.62, 4, 4, C.silver); p.ellipse(cx + r * 0.65, cy - r * 0.65, 2, 2, C.forest);
  p.thick(cx + r * 0.55, cy + r * 0.55, cx - r * 0.45, cy - r * 0.45, 2, C.clay); p.blob(cx - r * 0.55, cy - r * 0.55, 5, 4, RAMP.red);
  const str = r >= 17 ? "G'S" : 'G', sc = r >= 30 ? 3 : 2;
  logoText(p, Math.round(cx - logoWidth(str, sc) / 2) - 1, Math.round(cy - 3.5 * sc) - 1, str, sc, RAMP.gold, { shadow: C.deep });
}

// Side-view G's van, 128x60, 2 frames (wheel spin).
function drawSideVan(p, f) {
  const G = [C.deep, C.forest, C.green, C.lime];
  // body
  p.rect(4, 14, 116, 34, G[2]); p.poly([[96, 14], [110, 14], [124, 30], [124, 48], [96, 48]], G[2]);
  p.cylH(4, 12, 112, 36, G, 0.25); p.poly([[100, 16], [110, 16], [121, 30], [100, 30]], C.navy); p.dither(101, 17, 18, 5, C.blue, 0.5); p.line(104, 18, 110, 28, C.cyan);
  p.rect(118, 36, 8, 8, G[1]); p.rect(122, 32, 4, 4, C.yellow); // bumper + headlight
  p.rect(2, 40, 6, 8, G[0]); p.rect(3, 26, 3, 6, C.red);
  // gold racing stripe
  p.rect(4, 36, 116, 4, C.gold); p.hline(4, 36, 116, C.yellow); p.hline(4, 39, 116, C.flame);
  // roof rack, ladder & pipes
  p.rect(10, 8, 84, 2, C.silver); for (let x = 12; x < 94; x += 20) p.rect(x, 8, 2, 5, C.steel);
  p.rect(14, 4, 72, 3, C.silver); for (let x = 16; x < 86; x += 5) p.vline(x, 4, 3, C.steel);
  p.cylH(20, 0, 60, 4, RAMP.copper); p.cylH(30, 5, 50, 3, RAMP.pvc);
  // lettering
  badge(p, 19, 25, 13);
  logoText(p, 38, 16, 'PLUMBING', 1, [C.brown, C.gold, C.yellow], { shadow: C.deep });
  logoText(p, 36, 27, 'COOL HOMIES', 1, [C.silver, C.white], { shadow: C.deep });
  // door seam, handle
  p.rect(104, 32, 4, 2, C.silver);
  // wheels
  for (const wx of [26, 100]) { p.ellipse(wx, 50, 10, 10, C.ink); p.ellipse(wx, 50, 7, 7, C.night); p.blob(wx, 50, 4.5, 4.5, RAMP.chrome); const a = f * Math.PI / 4; p.px(wx + Math.round(Math.cos(a) * 3), 50 + Math.round(Math.sin(a) * 3), C.ink); p.px(wx - Math.round(Math.cos(a) * 3), 50 - Math.round(Math.sin(a) * 3), C.ink); }
  p.dither(4, 44, 116, 4, G[0], 0.5);
}

// Side-view Northwest box truck, 150x70.
function drawSideTruck(p, f) {
  const R = [C.umber, C.crimson, C.red, C.pink];
  p.cylH(2, 4, 104, 54, [C.slate, C.steel, C.silver, C.white], 0.3); p.box(2, 4, 104, 54, C.ink);
  p.rect(2, 44, 104, 5, C.red); p.hline(2, 44, 104, C.pink);
  logoText(p, 8, 10, 'NORTHWEST', 1, [C.crimson, C.red, C.pink], { shadow: C.umber });
  logoText(p, 8, 26, "WE'RE #2 AT #2", 1, [C.crimson, C.red], { shadow: null });
  p.px(40, 16, C.clay); p.px(80, 30, C.slate); p.dither(70, 38, 12, 6, C.clay, 0.35); // dents & rust
  // cab
  p.poly([[106, 18], [128, 18], [146, 36], [146, 58], [106, 58]], R[2]); p.cylH(106, 18, 40, 40, R, 0.25);
  p.poly([[112, 22], [126, 22], [140, 36], [112, 36]], C.navy); p.dither(113, 23, 16, 5, C.blue, 0.5);
  // Randy's arm hanging out the window, flipping you off
  p.rect(116, 36, 10, 4, C.pink); p.rect(124, 30 - f, 3, 6 + f, C.pink); p.rect(123, 35, 5, 3, C.pink);
  p.rect(144, 44, 6, 8, R[1]); p.rect(144, 40, 4, 4, C.yellow); p.dither(106, 50, 40, 8, R[0], 0.4);
  for (const wx of [26, 88, 126]) { p.ellipse(wx, 60, 10, 10, C.ink); p.ellipse(wx, 60, 7, 7, C.night); p.blob(wx, 60, 4, 4, RAMP.galv); const a = f * Math.PI / 4; p.px(wx + Math.round(Math.cos(a) * 3), 60 + Math.round(Math.sin(a) * 3), C.ink); }
  // exhaust
  p.rect(0, 50, 4, 3, C.slate);
}

export function buildBrand(scene) {
  mk(scene, 'badge', 36, 36, p => badge(p, 18, 18, 17), { outline: null });
  mk(scene, 'badgeBig', 72, 72, p => badge(p, 36, 36, 34), { outline: null });
  mk(scene, 'sideVan', 128, 62, drawSideVan, { frames: 2 });
  mk(scene, 'sideTruck', 152, 72, drawSideTruck, { frames: 2 });
  // Title logo
  const W = 262, lp = new PX(W, 86);
  logoText(lp, Math.round((W - logoWidth('PLUMBER', 5)) / 2), 2, 'PLUMBER', 5, [C.brown, C.rust, C.flame, C.gold, C.yellow]);
  logoText(lp, Math.round((W - logoWidth('WARS', 6)) / 2), 40, 'WARS', 6, [C.umber, C.crimson, C.red, C.pink]);
  lp.toTexture(scene, 'logo');
  const sub = new PX(200, 18); logoText(sub, Math.round((200 - logoWidth("G'S PLUMBING", 2)) / 2), 1, "G'S PLUMBING", 2, [C.deep, C.green, C.lime]); sub.toTexture(scene, 'logoSub');
}

// Title / map backdrop: dithered sunset, Rainier, skyline + Space Needle, Elliott Bay.
export function skyline(scene, key, W, H, { mood = 'sunset' } = {}) {
  const p = new PX(W, H);
  const skies = { sunset: [C.night, C.plum, C.mauve, C.pink, C.flame, C.gold], night: [C.ink, C.night, C.storm, C.plum], day: [C.navy, C.blue, C.cyan, C.silver] };
  const hy = Math.round(H * 0.62);
  p.vgrad(0, 0, W, hy, skies[mood]);
  if (mood !== 'day') for (let i = 0; i < 60; i++) { const x = (i * 97) % W, y = (i * 53) % Math.round(hy * 0.45); p.px(x, y, i % 5 ? C.silver : C.white); }
  // sun
  if (mood === 'sunset') { p.ellipse(W * 0.28, hy - 18, 18, 18, C.gold); p.ellipse(W * 0.28, hy - 18, 14, 14, C.yellow); for (let j = hy - 26; j < hy; j += 4) p.hline(W * 0.28 - 20, j, 40, C.flame); }
  // Mt Rainier
  const mx = W * 0.72;
  p.poly([[mx - 110, hy], [mx - 30, hy - 58], [mx - 12, hy - 72], [mx + 8, hy - 66], [mx + 34, hy - 50], [mx + 120, hy]], mood === 'night' ? C.storm : C.mauve);
  p.poly([[mx - 30, hy - 58], [mx - 12, hy - 72], [mx + 8, hy - 66], [mx + 34, hy - 50], [mx + 20, hy - 44], [mx + 6, hy - 52], [mx - 6, hy - 46], [mx - 18, hy - 54]], mood === 'night' ? C.steel : C.pink);
  p.line(mx - 12, hy - 71, mx - 22, hy - 58, C.white); p.line(mx - 10, hy - 70, mx - 4, hy - 50, C.white); p.line(mx + 6, hy - 65, mx + 18, hy - 50, C.white);
  // Olympics silhouette (far left)
  p.poly([[0, hy], [0, hy - 20], [22, hy - 32], [40, hy - 22], [62, hy - 36], [90, hy - 18], [110, hy]], C.plum);
  // skyline
  const R = (i) => ((i * 9301 + 49297) % 233280) / 233280;
  const bx0 = W * 0.36;
  for (let i = 0; i < 16; i++) {
    const bw = 8 + Math.floor(R(i) * 12), bh = 16 + Math.floor(R(i + 40) * 52); const x = Math.round(bx0 + i * 9 - 10);
    p.rect(x, hy - bh, bw, bh, C.ink); p.rect(x + 1, hy - bh + 1, bw - 2, bh - 1, C.night);
    for (let yy = hy - bh + 4; yy < hy - 2; yy += 4) for (let xx = x + 2; xx < x + bw - 2; xx += 3) if (R(xx * 7 + yy) > 0.45) p.px(xx, yy, R(xx + yy) > 0.7 ? C.yellow : C.gold);
  }
  // Space Needle
  const nx = Math.round(W * 0.2), ny = hy;
  p.poly([[nx - 6, ny], [nx - 2, ny - 50], [nx + 2, ny - 50], [nx + 6, ny]], C.ink); p.vline(nx, ny - 50, 50, C.night);
  p.poly([[nx - 16, ny - 56], [nx + 16, ny - 56], [nx + 8, ny - 62], [nx - 8, ny - 62]], C.ink); p.hline(nx - 15, ny - 57, 30, C.gold);
  p.poly([[nx - 8, ny - 62], [nx + 8, ny - 62], [nx + 2, ny - 70], [nx - 2, ny - 70]], C.ink); p.vline(nx, ny - 82, 12, C.ink); p.px(nx, ny - 83, C.red);
  p.hline(nx - 4, ny - 30, 9, C.ink);
  // water
  p.vgrad(0, hy, W, H - hy, mood === 'night' ? [C.night, C.ink] : [C.plum, C.navy, C.night]);
  for (let j = hy + 2; j < H; j += 3) for (let i = 0; i < W; i += 1) if (bayer(i, j) > 0.93) p.px(i, j, mood === 'sunset' ? C.gold : C.slate);
  if (mood === 'sunset') for (let j = hy + 1; j < hy + 40; j += 2) p.hline(W * 0.28 - 18 + (j % 5) * 3, j, 36 - (j - hy) * 0.7, C.gold);
  // ferry
  p.rect(W * 0.55, hy + 12, 30, 5, C.white); p.rect(W * 0.55 + 4, hy + 8, 20, 4, C.silver); p.rect(W * 0.55 + 12, hy + 4, 4, 4, C.forest); p.hline(W * 0.55, hy + 17, 30, C.forest);
  p.toTexture(scene, key);
  return key;
}
