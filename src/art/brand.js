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
  '#': '.#.#.|.#.#.|#####|.#.#.|#####|.#.#.|.#.#.',
  D: '####.|#...#|#...#|#...#|#...#|#...#|####.', F: '#####|#....|#....|####.|#....|#....|#....', K: '#...#|#..#.|#.#..|##...|#.#..|#..#.|#...#',
  J: '..###|...#.|...#.|...#.|#..#.|#..#.|.##..', Q: '.###.|#...#|#...#|#...#|#.#.#|#..#.|.##.#', X: '#...#|#...#|.#.#.|..#..|.#.#.|#...#|#...#',
  Z: '#####|....#|...#.|..#..|.#...|#....|#####', '!': '#|#|#|#|#|.|#', '-': '....|....|....|####|....|....|....', '.': '.|.|.|.|.|.|#',
  0: '.###.|#...#|#..##|#.#.#|##..#|#...#|.###.', 1: '.#.|##.|.#.|.#.|.#.|.#.|###', 3: '####.|....#|....#|.###.|....#|....#|####.',
  4: '...#.|..##.|.#.#.|#..#.|#####|...#.|...#.', 5: '#####|#....|####.|....#|....#|#...#|.###.', 6: '..##.|.#...|#....|####.|#...#|#...#|.###.',
  7: '#####|....#|...#.|..#..|.#...|.#...|.#...', 8: '.###.|#...#|#...#|.###.|#...#|#...#|.###.', 9: '.###.|#...#|#...#|.####|....#|...#.|.##..', 2: '.###.|#...#|....#|...#.|..#..|.#...|#####', V: '#...#|#...#|#...#|#...#|#...#|.#.#.|..#..', Y: '#...#|#...#|.#.#.|..#..|..#..|..#..|..#..',
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
  logoText(p, 36, 27, 'THE HOMIES', 1, [C.silver, C.white], { shadow: C.deep });
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
  // Orca (side view, facing right), drawn at 2x detail: black body, white belly + eye patch,
  // grey saddle, tall dorsal fin, flukes and a pectoral fin.
  mk(scene, 'orca', 70, 42, p => {
    p.ellipse(37, 25, 26, 11, C.ink);                                   // body
    p.ellipse(58, 26, 8, 7, C.ink);                                     // rounded head
    p.poly([[14, 25], [2, 13], [0, 16], [6, 25], [0, 34], [2, 37]], C.ink); // tail flukes
    p.poly([[30, 16], [36, 0], [39, 1], [44, 16]], C.ink);              // dorsal fin
    p.line(37, 2, 34, 14, C.night);
    p.poly([[20, 30], [40, 34], [62, 31], [58, 35], [40, 37], [24, 34]], C.white); // belly sweep
    p.ellipse(52, 20, 5, 2.2, C.white);                                 // eye patch
    p.poly([[24, 17], [34, 16], [44, 17], [40, 20], [28, 20]], C.slate); // saddle patch
    p.poly([[42, 31], [50, 32], [40, 41], [38, 40]], C.ink);            // pectoral fin
    p.hline(58, 29, 6, C.night); p.px(64, 28, C.night);                 // mouth line
    p.hline(26, 18, 6, C.storm); p.px(45, 21, C.storm);                 // sheen
  }, { outline: null });
  mk(scene, 'fin', 16, 16, p => { p.poly([[3, 15], [8, 0], [10, 1], [13, 15]], C.ink); p.line(9, 2, 7, 12, C.night); p.hline(0, 14, 16, C.silver); p.px(1, 13, C.white); p.px(14, 13, C.white); }, { outline: null });
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

// Title / finale backdrop: the Kerry Park view — Space Needle up front, downtown towers,
// Mt. Rainier looming behind, Elliott Bay with a ferry. mood: 'sunset' | 'night'.
export function skyline(scene, key, W, H, { mood = 'sunset' } = {}) {
  const p = new PX(W, H); const night = mood === 'night';
  const hy = Math.round(H * 0.62);
  const sky = night ? [C.ink, C.ink, C.night, C.storm, C.plum] : [C.night, C.plum, C.mauve, C.pink, C.flame, C.gold];
  p.vgrad(0, 0, W, hy, sky);
  for (let i = 0; i < 70; i++) { const x = (i * 97 + 13) % W, y = (i * 53) % Math.round(hy * (night ? 0.7 : 0.35)); p.px(x, y, i % 6 ? C.steel : C.white); }
  if (!night) { // low sun + wispy clouds catching light
    const sx = Math.round(W * 0.12), sy = hy - 30; p.ellipse(sx, sy, 16, 16, C.gold); p.ellipse(sx, sy, 12, 12, C.yellow);
    for (const [cx, cy, w] of [[40, hy - 70, 70], [190, hy - 150, 90], [120, hy - 110, 60], [230, hy - 95, 50]]) { p.hline(cx - w / 2, cy, w, C.pink); p.hline(cx - w / 2 + 8, cy + 1, w - 20, C.flame); p.hline(cx - w / 2 + 16, cy - 1, w - 40, C.peach); }
  } else { p.ellipse(W * 0.85, hy - 170, 9, 9, C.sand); p.ellipse(W * 0.85 + 4, hy - 172, 8, 8, C.ink); }

  // --- Mt. Rainier: huge, snow-covered, alpenglow on the left face, hazy base.
  const mx = Math.round(W * 0.7), mt = hy - 112;
  const ridge = [[mx - 150, hy], [mx - 96, hy - 40], [mx - 62, hy - 70], [mx - 38, hy - 92], [mx - 20, mt + 6], [mx - 8, mt], [mx + 10, mt + 2], [mx + 26, mt + 10], [mx + 50, hy - 84], [mx + 80, hy - 58], [mx + 118, hy - 30], [mx + 170, hy]];
  const lit = night ? C.silver : C.sand, shade = night ? C.steel : C.pink, deep = night ? C.slate : C.mauve;
  p.poly(ridge, shade);
  p.poly([[mx - 150, hy], [mx - 96, hy - 40], [mx - 62, hy - 70], [mx - 38, hy - 92], [mx - 20, mt + 6], [mx - 8, mt], [mx - 2, mt + 20], [mx - 16, hy - 60], [mx - 30, hy - 34], [mx - 50, hy]], lit);
  p.poly([[mx - 8, mt], [mx + 10, mt + 2], [mx + 4, mt + 14], [mx - 4, mt + 10]], C.white);
  p.poly([[mx - 20, mt + 6], [mx - 8, mt], [mx - 2, mt + 20], [mx - 16, hy - 60], [mx - 38, hy - 92]], night ? C.white : C.peach);
  // glaciers and ridgelines
  for (const [x0, y0, x1, y1] of [[mx - 6, mt + 4, mx - 26, hy - 60], [mx + 4, mt + 6, mx + 22, hy - 62], [mx + 16, mt + 12, mx + 60, hy - 50], [mx - 14, mt + 10, mx - 56, hy - 44], [mx + 30, hy - 80, mx + 44, hy - 40]]) p.line(x0, y0, x1, y1, deep);
  for (const [x0, y0, x1, y1] of [[mx - 10, mt + 2, mx - 40, hy - 70], [mx - 4, mt + 12, mx - 12, hy - 48]]) p.line(x0, y0, x1, y1, night ? C.silver : C.white);
  // atmospheric haze over the lower slopes
  for (let j = hy - 44; j < hy; j++) { const d = (j - (hy - 44)) / 44; for (let i = 0; i < W; i++) if (p.get(i, j) !== p.get(0, j) && bayer(i, j) < d * 0.8) p.px(i, j, night ? C.night : C.mauve); }
  // distant hills (West Seattle / Beacon Hill) + Olympics hint on the far left
  p.poly([[0, hy], [0, hy - 22], [18, hy - 30], [34, hy - 24], [52, hy - 36], [70, hy - 26], [96, hy - 16], [120, hy]], night ? C.night : C.plum);
  p.poly([[120, hy], [150, hy - 10], [200, hy - 14], [250, hy - 9], [W, hy - 12], [W, hy]], night ? C.ink : C.plum);

  // --- Downtown. Each tower: [x, width, height, style]. Blue-violet glass with lit windows + sunset rim light.
  const glass = night ? [C.ink, C.night, C.storm] : [C.ink, C.night, C.storm];
  const rim = night ? C.slate : C.flame;
  const win = (x, y, w, h, dens = 0.35) => { for (let yy = y + 3; yy < y + h - 1; yy += 3) for (let xx = x + 2; xx < x + w - 1; xx += 2) if (bayer(xx * 3, yy * 5) < dens) p.px(xx, yy, bayer(xx, yy) < 0.4 ? C.yellow : C.gold); };
  const box = (x, w, h, base = glass[1], dens) => { p.rect(x, hy - h, w, h, base); p.vline(x, hy - h, h, rim); p.vline(x + w - 1, hy - h, h, glass[0]); win(x, hy - h, w, h, dens); };
  const bx = Math.round(W * 0.43);
  // back row, hazier
  for (const [dx, w, h] of [[-8, 12, 34], [4, 10, 46], [58, 12, 50], [70, 10, 38], [92, 14, 30], [104, 10, 24]]) { p.rect(bx + dx, hy - h, w, h, night ? C.night : C.storm); win(bx + dx, hy - h, w, h, 0.15); }
  // Two Union Square (notched, curved crown)
  box(bx + 2, 12, 70); p.rect(bx + 2, hy - 74, 8, 4, glass[1]); p.vline(bx + 2, hy - 74, 4, rim);
  // Rainier Square Tower (tapered stilt base)
  p.poly([[bx + 18, hy], [bx + 24, hy], [bx + 28, hy - 26], [bx + 28, hy - 92], [bx + 15, hy - 92], [bx + 15, hy - 26]], C.slate);
  p.vline(bx + 15, hy - 92, 66, night ? C.steel : C.peach); win(bx + 15, hy - 90, 13, 62, 0.25);
  // Columbia Center — tallest, dark, three stepped lobes
  const cx = bx + 36;
  box(cx - 4, 26, 84, glass[0], 0.2); box(cx, 18, 98, glass[1], 0.25); box(cx + 5, 8, 110, glass[1], 0.3);
  p.vline(cx + 9, hy - 110, 110, glass[2]); p.vline(cx + 3, hy - 98, 98, glass[2]);
  p.px(cx + 8, hy - 112, C.red); p.vline(cx + 8, hy - 114, 2, C.slate);
  // Seattle Municipal Tower (sloped top)
  p.poly([[cx + 26, hy], [cx + 26, hy - 76], [cx + 40, hy - 84], [cx + 40, hy]], glass[1]); p.vline(cx + 26, hy - 76, 76, rim); win(cx + 26, hy - 80, 14, 78, 0.3);
  // 1201 Third Ave (pale stone, postmodern crown)
  const tx = cx + 44; p.rect(tx, hy - 78, 14, 78, night ? C.storm : C.clay); p.vline(tx, hy - 78, 78, night ? C.slate : C.tan); win(tx, hy - 78, 14, 78, 0.4);
  p.poly([[tx + 1, hy - 78], [tx + 13, hy - 78], [tx + 7, hy - 88]], night ? C.slate : C.tan); p.rect(tx + 5, hy - 86, 4, 4, C.gold);
  // Wells Fargo Center + filler mid-rises
  box(cx - 16, 12, 60); box(bx - 20, 14, 40); box(bx - 32, 12, 28); box(tx + 16, 12, 52); box(tx + 30, 10, 36);
  // Smith Tower — little white classic with a pyramid top, down in Pioneer Square
  const smx = tx + 44; p.rect(smx, hy - 40, 7, 40, C.silver); p.vline(smx, hy - 40, 40, C.white); win(smx, hy - 40, 7, 40, 0.25);
  p.poly([[smx, hy - 40], [smx + 7, hy - 40], [smx + 3.5, hy - 52]], C.white); p.vline(smx + 3, hy - 56, 4, C.silver);
  // Stadiums: Lumen Field's arches + T-Mobile's roof
  p.rect(smx + 10, hy - 10, 26, 10, night ? C.night : C.storm); for (let i = 0; i < 26; i++) p.px(smx + 10 + i, hy - 12 - Math.round(Math.sin(i / 25 * Math.PI) * 5), C.silver);
  p.poly([[smx + 38, hy], [smx + 40, hy - 14], [W, hy - 16], [W, hy]], night ? C.night : C.storm); p.hline(smx + 40, hy - 15, W - smx - 40, C.steel);
  // Great Wheel on the waterfront
  const gwx = bx - 44, gwy = hy - 16;
  p.ring(gwx, gwy, 13, 13, C.silver); for (let a = 0; a < 12; a++) { const ang = a / 12 * Math.PI * 2; p.line(gwx, gwy, gwx + Math.cos(ang) * 12, gwy + Math.sin(ang) * 12, C.steel); p.px(gwx + Math.cos(ang) * 13, gwy + Math.sin(ang) * 13, a % 2 ? C.cyan : C.pink); }
  p.line(gwx, gwy, gwx - 6, hy, C.slate); p.line(gwx, gwy, gwx + 6, hy, C.slate);
  // waterfront pier line
  p.rect(0, hy - 3, W, 3, C.ink); for (let i = 0; i < W; i += 7) p.px(i, hy - 4, C.gold);

  // --- Space Needle, foreground on Queen Anne. Legs taper to an hourglass waist, flare to the saucer.
  const nx = Math.round(W * 0.2), base = hy - 2, top = hy - 132;
  const Hn = base - top; const dark = C.ink, edge = night ? C.slate : C.flame;
  const legW = t => t < 0.58 ? 11 - t / 0.58 * 8.5 : 2.5 + (t - 0.58) / 0.22 * 7.5; // half-width by height fraction
  for (let j = 0; j <= Math.round(Hn * 0.8); j++) {
    const t = j / Hn, y = base - j, w = legW(t);
    p.px(nx - w, y, edge); p.px(nx - w + 1, y, dark); p.px(nx + w, y, dark); p.px(nx + w - 1, y, dark); // outer legs
    p.px(nx, y, dark); if (t < 0.5) p.px(nx + 1, y, dark); // centre leg
  }
  p.rect(nx - 4, base - Math.round(Hn * 0.58) - 1, 9, 2, dark); // waist ring
  p.rect(nx + 3, base - Math.round(Hn * 0.45), 3, 10, dark); // elevator wing hint
  // saucer (the "halo" + restaurant disc)
  const sy = base - Math.round(Hn * 0.8);
  p.poly([[nx - 11, sy], [nx + 11, sy], [nx + 18, sy - 4], [nx - 18, sy - 4]], dark); p.hline(nx - 18, sy - 4, 37, edge);
  p.rect(nx - 13, sy - 9, 27, 5, dark); for (let i = nx - 12; i < nx + 13; i += 2) p.px(i, sy - 7, i % 4 ? C.gold : C.yellow);
  p.poly([[nx - 20, sy - 10], [nx + 20, sy - 10], [nx + 13, sy - 13], [nx - 13, sy - 13]], dark); p.hline(nx - 20, sy - 10, 41, edge);
  // roof, cap and spire
  p.poly([[nx - 10, sy - 13], [nx + 10, sy - 13], [nx + 4, sy - 19], [nx - 4, sy - 19]], dark);
  p.rect(nx - 2, sy - 23, 5, 4, dark); p.vline(nx, top, sy - 23 - top, dark); p.px(nx, top - 1, C.red); p.px(nx, top, C.hot);
  // Queen Anne hilltop trees in front of the Needle's base
  for (let i = 0; i < 9; i++) { const tx0 = nx - 40 + i * 10 + (i % 2) * 3, th = 12 + (i * 7) % 10; p.poly([[tx0 - 6, base + 2], [tx0 + 6, base + 2], [tx0, base - th]], C.ink); }

  // --- Elliott Bay
  p.vgrad(0, hy, W, H - hy, night ? [C.night, C.ink] : [C.plum, C.navy, C.night]);
  for (let j = hy + 2; j < H; j += 2) for (let i = 0; i < W; i++) if (bayer(i * 2, j) > 0.94) p.px(i, j, night ? C.storm : C.mauve);
  // tower light reflections
  for (let i = Math.round(W * 0.4); i < W - 20; i += 3) if (bayer(i, 1) > 0.4) for (let j = hy + 3; j < hy + 40; j += 2) if (bayer(i, j) > (j - hy) / 44) p.px(i, j, j % 4 ? C.gold : C.flame);
  if (!night) for (let j = hy + 2; j < hy + 50; j += 2) { const w = 30 - (j - hy) * 0.45; p.hline(W * 0.12 - w / 2 + ((j * 7) % 5), j, w, j % 4 ? C.gold : C.yellow); }
  // Washington State-style ferry: white hull, green stripe, stacked decks
  const fx = Math.round(W * 0.52), fy = hy + 18;
  p.poly([[fx, fy], [fx + 46, fy], [fx + 42, fy + 6], [fx + 4, fy + 6]], C.white); p.hline(fx + 3, fy + 4, 40, C.forest);
  p.rect(fx + 6, fy - 5, 34, 5, C.silver); for (let i = fx + 8; i < fx + 38; i += 3) p.px(i, fy - 3, C.gold);
  p.rect(fx + 12, fy - 9, 22, 4, C.white); p.rect(fx + 21, fy - 14, 4, 5, C.forest); p.hline(fx + 21, fy - 14, 4, C.ink);
  p.hline(fx - 6, fy + 7, 56, C.silver); // wake
  p.toTexture(scene, key);
  return key;
}
