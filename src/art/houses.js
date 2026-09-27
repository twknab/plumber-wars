// Procedural Seattle house facades: craftsman, bungalow, victorian, modern boxes, ramblers, tudors, mansions.
import { PX, rng } from '../core/pixel.js';
import { C } from '../core/palette.js';

const sh = (hex, k) => { const n = parseInt(hex.slice(1), 16); const f = c => Math.max(0, Math.min(255, Math.round(c * k))); return '#' + [n >> 16, (n >> 8) & 255, n & 255].map(f).map(v => v.toString(16).padStart(2, '0')).join(''); };

function siding(p, x, y, w, h, base, kind = 'lap') {
  const lo = sh(base, 0.78), hi = sh(base, 1.12);
  p.rect(x, y, w, h, base);
  if (kind === 'lap') for (let j = y + 2; j < y + h; j += 4) { p.hline(x, j, w, lo); p.hline(x, j + 1, w, hi); }
  if (kind === 'shingle') for (let j = y; j < y + h; j += 4) { p.hline(x, j + 3, w, lo); for (let i = x + ((j / 4) % 2) * 3; i < x + w; i += 6) p.vline(i, j, 3, lo); }
  if (kind === 'batten') for (let i = x + 2; i < x + w; i += 6) { p.vline(i, y, h, lo); p.vline(i + 1, y, h, hi); }
  if (kind === 'brick') for (let j = y; j < y + h; j += 4) { p.hline(x, j + 3, w, lo); for (let i = x + ((j / 4) % 2) * 4; i < x + w; i += 8) p.vline(i, j, 3, lo); }
  if (kind === 'stucco') p.dither(x, y, w, h, lo, 0.18);
  if (kind === 'fish') for (let j = y; j < y + h; j += 4) for (let i = x + ((j / 4) % 2) * 3; i < x + w; i += 6) { p.px(i, j + 3, lo); p.px(i + 1, j + 3, lo); p.px(i + 2, j + 2, lo); p.px(i - 1, j + 2, lo); }
}

function roofTex(p, pts, base) {
  p.poly(pts, base);
  const ys = pts.map(q => q[1]); const y0 = Math.floor(Math.min(...ys)), y1 = Math.ceil(Math.max(...ys));
  const xs = pts.map(q => q[0]); const x0 = Math.floor(Math.min(...xs)), x1 = Math.ceil(Math.max(...xs));
  const lo = sh(base, 0.72), hi = sh(base, 1.18);
  const target = p.get(Math.round(xs.reduce((a, b) => a + b) / xs.length), Math.round(ys.reduce((a, b) => a + b) / ys.length));
  for (let y = y0; y <= y1; y++) for (let x = x0; x <= x1; x++) {
    if (p.get(x, y) !== target) continue;
    const row = Math.floor((y - y0) / 4);
    if ((y - y0) % 4 === 3) p.px(x, y, lo);
    else if ((x + row * 3) % 6 === 0) p.px(x, y, lo);
    else if ((y - y0) % 4 === 0 && (x + row) % 5 === 0) p.px(x, y, hi);
  }
  return { lo, hi };
}

function windowAt(p, x, y, w, h, trim, { grid = '1', lit = false, curtain, cat, box = false, rng: R } = {}) {
  p.rect(x - 2, y - 2, w + 4, h + 4, trim); p.hline(x - 3, y + h + 1, w + 6, sh(trim, 0.8)); p.hline(x - 3, y - 3, w + 6, sh(trim, 1.1));
  if (lit) p.vgrad(x, y, w, h, [C.yellow, C.gold, C.flame]);
  else p.vgrad(x, y, w, h, [C.cyan, C.blue, C.navy]);
  if (!lit) for (let j = 0; j < h; j++) for (let i = 0; i < w; i++) { const d = (i + j) % 13; if (d === 5 || d === 6 || d === 9) p.px(x + i, y + j, d === 9 ? '#2ce8f5' : '#ffffff'); }
  if (curtain) { p.rect(x, y, 2, h, curtain); p.rect(x + w - 2, y, 2, h, curtain); p.hline(x, y, w, sh(curtain, 0.7)); }
  if (grid === '4') { p.vline(x + (w >> 1), y, h, trim); p.hline(x, y + (h >> 1), w, trim); }
  if (grid === '3/1') { p.hline(x, y + Math.floor(h * 0.38), w, trim); p.vline(x + Math.floor(w / 3), y, Math.floor(h * 0.38), trim); p.vline(x + Math.floor(2 * w / 3), y, Math.floor(h * 0.38), trim); }
  if (grid === '6') { for (let i = 1; i < 3; i++) p.vline(x + Math.floor(w * i / 3), y, h, trim); p.hline(x, y + (h >> 1), w, trim); }
  if (cat) { const cx = x + w - 6, cy = y + h - 5; p.ellipse(cx + 2, cy + 2, 3, 3, C.ink); p.px(cx, cy - 1, C.ink); p.px(cx + 4, cy - 1, C.ink); p.px(cx + 1, cy + 1, C.yellow); p.px(cx + 3, cy + 1, C.yellow); }
  if (box) { p.rect(x - 2, y + h + 2, w + 4, 4, C.brown); p.hline(x - 2, y + h + 2, w + 4, C.clay); for (let i = 0; i < w; i += 3) p.px(x + i, y + h + 1, [C.red, C.pink, C.yellow][(i / 3) % 3]); }
}

function door(p, x, y, w, h, col, trim, lit) {
  p.rect(x - 2, y - 3, w + 4, h + 3, trim); p.rect(x, y, w, h, col);
  p.vline(x, y, h, sh(col, 1.2)); p.vline(x + w - 1, y, h, sh(col, 0.7));
  p.rect(x + 2, y + 3, w - 4, Math.floor(h * 0.3), lit ? C.gold : C.cyan); p.rect(x + 2, y + Math.floor(h * 0.5), w - 4, Math.floor(h * 0.4), sh(col, 0.85));
  p.px(x + w - 3, y + (h >> 1) + 1, C.gold); p.rect(x + w + 3, y + 1, 2, 3, C.yellow);
}

function fir(p, x, y, h, dark = false) {
  const cols = dark ? [C.ink, C.deep, C.forest] : [C.deep, C.forest, C.green];
  p.rect(x - 1, y + h - 4, 3, 4, C.umber);
  for (let k = 0; k < h - 4; k += 3) { const w = 2 + Math.floor(k * 0.45); p.hline(x - w, y + k + 2, w * 2 + 1, cols[0]); p.hline(x - w + 1, y + k + 1, w * 2 - 1, cols[1]); p.hline(x - w + 2, y + k, Math.max(1, w - 1), cols[2]); }
}

export function drawHouse(h, { W = 220, H = 170, night = false, seed = 1 } = {}) {
  const p = new PX(W, H); const R = rng(seed);
  const gY = H - 22; // ground line
  const lit = night;
  // background firs
  for (let i = 0; i < 7; i++) fir(p, 6 + i * 36 + Math.floor(R() * 10), gY - 70 - Math.floor(R() * 25), 70 + Math.floor(R() * 25), true);
  // lawn
  p.rect(0, gY, W, H - gY, C.forest); p.dither(0, gY, W, 4, C.green, 0.5); p.dither(0, gY + 6, W, H - gY - 6, C.deep, 0.25);
  for (let i = 0; i < 40; i++) p.px(Math.floor(R() * W), gY + 2 + Math.floor(R() * (H - gY - 2)), C.lime);
  const st = h.style; const body = h.body, trim = h.trim, roof = h.roof;
  const cx = W >> 1;
  let bx, bw, by, bh, doorX, porch = false, roofKind = 'gable', sidingKind = 'lap', floors = 1;
  switch (st) {
    case 'craftsman': bw = 150; bh = 62; porch = true; sidingKind = 'lap'; break;
    case 'bungalow': bw = 132; bh = 52; porch = true; break;
    case 'modern': bw = 150; bh = 86; roofKind = 'shed'; sidingKind = 'batten'; floors = 2; break;
    case 'townhouse': bw = 100; bh = 110; roofKind = 'flat'; sidingKind = 'batten'; floors = 3; break;
    case 'funky': bw = 136; bh = 66; sidingKind = 'shingle'; porch = true; break;
    case 'victorian': bw = 120; bh = 92; sidingKind = 'fish'; floors = 2; roofKind = 'steep'; porch = true; break;
    case 'foursquare': bw = 136; bh = 90; roofKind = 'hip'; floors = 2; porch = true; break;
    case 'rambler': bw = 180; bh = 50; roofKind = 'low'; sidingKind = 'lap'; break;
    case 'tudor': bw = 150; bh = 88; roofKind = 'steep'; sidingKind = 'stucco'; floors = 2; break;
    case 'mansion': bw = 196; bh = 96; roofKind = 'hip'; sidingKind = 'lap'; floors = 2; porch = true; break;
    default: bw = 140; bh = 64;
  }
  bx = cx - (bw >> 1); by = gY - bh;
  // foundation
  p.rect(bx - 2, gY - 6, bw + 4, 8, C.slate); p.hline(bx - 2, gY - 6, bw + 4, C.steel); p.dither(bx - 2, gY - 4, bw + 4, 5, C.storm, 0.3);
  siding(p, bx, by, bw, bh - 6, body, sidingKind);
  if (st === 'tudor') { // half-timbering
    for (let i = bx + 8; i < bx + bw; i += 18) p.rect(i, by, 3, bh - 6, C.umber);
    p.rect(bx, by + 40, bw, 3, C.umber); for (let i = bx + 8; i < bx + bw - 18; i += 18) p.line(i + 3, by + 40, i + 18, by + 4, C.umber);
    siding(p, bx, by + 50, bw, bh - 56, C.clay, 'brick');
  }
  if (st === 'funky') { // murals, polka dots
    for (let i = 0; i < 9; i++) p.ellipse(bx + 10 + R() * (bw - 20), by + 8 + R() * (bh - 26), 3 + R() * 4, 3 + R() * 4, [C.yellow, C.cyan, C.lime, C.flame, C.pink][i % 5]);
  }
  // corner boards
  p.rect(bx, by, 3, bh - 6, trim); p.rect(bx + bw - 3, by, 3, bh - 6, trim);
  if (floors >= 2) p.rect(bx, by + Math.floor((bh - 6) / floors), bw, 3, trim);
  // roof
  const ov = 10;
  if (roofKind === 'gable' || roofKind === 'steep' || roofKind === 'low') {
    const rh = roofKind === 'steep' ? 58 : roofKind === 'low' ? 24 : 44;
    const pts = [[bx - ov, by + 2], [bx + bw + ov, by + 2], [cx, by - rh]];
    roofTex(p, pts, roof);
    p.line(bx - ov, by + 2, cx, by - rh, sh(roof, 1.3)); p.line(bx - ov, by + 3, cx, by - rh + 1, trim);
    p.line(bx + bw + ov, by + 2, cx, by - rh, trim);
    p.hline(bx - ov, by + 2, bw + ov * 2, sh(roof, 0.6)); p.dither(bx, by + 3, bw, 3, C.ink, 0.5);
    if (st === 'craftsman' || st === 'bungalow' || st === 'funky') { // gable window + brackets
      const gw = 26, gy = by - Math.floor(rh * 0.55);
      siding(p, cx - 22, gy - 2, 44, Math.floor(rh * 0.5), sh(body, 0.95), 'shingle');
      p.poly([[bx - ov, by + 2], [cx - 60, by + 2], [cx, by - rh + 8], [cx, by - rh]], roof);
      p.poly([[bx + bw + ov, by + 2], [cx + 60, by + 2], [cx, by - rh + 8], [cx, by - rh]], roof);
      roofTex(p, [[bx - ov, by + 2], [bx + bw + ov, by + 2], [cx, by - rh]], roof);
      windowAt(p, cx - gw / 2, gy + 4, gw, 12, trim, { grid: '6', lit });
      for (const kx of [bx - ov + 6, bx + bw + ov - 9]) p.rect(kx, by + 2, 3, 6, trim);
    }
    if (st === 'victorian' || st === 'tudor') { // turret / dormer
      const tx = bx + bw - 34; p.rect(tx, by - 30, 26, 36, sh(body, 0.9)); siding(p, tx, by - 30, 26, 36, body, sidingKind === 'stucco' ? 'stucco' : 'fish');
      p.poly([[tx - 4, by - 29], [tx + 30, by - 29], [tx + 13, by - 70]], roof); p.line(tx - 4, by - 29, tx + 13, by - 70, sh(roof, 1.3));
      p.rect(tx + 12, by - 76, 2, 7, C.steel); windowAt(p, tx + 7, by - 22, 12, 18, trim, { grid: '4', lit });
    }
  } else if (roofKind === 'hip') {
    const rh = 30; const pts = [[bx - ov, by + 2], [bx + bw + ov, by + 2], [bx + bw - 30, by - rh], [bx + 30, by - rh]];
    roofTex(p, pts, roof); p.line(bx + 30, by - rh, bx + bw - 30, by - rh, sh(roof, 1.3)); p.hline(bx - ov, by + 2, bw + ov * 2, sh(roof, 0.6)); p.dither(bx, by + 3, bw, 3, C.ink, 0.5);
    // dormer
    p.rect(cx - 14, by - 22, 28, 20, body); p.poly([[cx - 18, by - 21], [cx + 18, by - 21], [cx, by - 34]], roof); windowAt(p, cx - 9, by - 17, 18, 11, trim, { grid: '4', lit });
  } else if (roofKind === 'shed') {
    p.poly([[bx - ov, by + 2], [bx + bw + ov, by - 14], [bx + bw + ov, by - 10], [bx - ov, by + 6]], roof); p.line(bx - ov, by + 2, bx + bw + ov, by - 14, sh(roof, 1.4));
    p.poly([[bx, by + 5], [bx + bw, by - 10], [bx + bw, by]], body);
  } else if (roofKind === 'flat') {
    p.rect(bx - 4, by - 4, bw + 8, 5, roof); p.hline(bx - 4, by - 4, bw + 8, sh(roof, 1.4));
    p.rect(bx + bw - 20, by - 14, 12, 10, C.slate); // rooftop deck box
  }
  // chimney
  if (['craftsman', 'bungalow', 'foursquare', 'tudor', 'mansion', 'rambler'].includes(st)) {
    const chx = bx + bw - 30; p.rect(chx, by - 40, 12, 44, C.rust); siding(p, chx, by - 40, 12, 40, C.rust, 'brick'); p.rect(chx - 1, by - 42, 14, 3, C.slate);
    p.ellipse(chx + 6, by - 48, 4, 3, '#c0cbdc90'); p.ellipse(chx + 9, by - 56, 5, 3.5, '#c0cbdc60');
  }
  // windows + door layout
  const doorW = 14, doorH = 26; doorX = cx - 7; if (st === 'rambler' || st === 'modern') doorX = bx + 26;
  const rowY = floors >= 2 ? [by + 8, by + Math.floor((bh - 6) / floors) + 10] : [by + 12];
  if (floors === 3) rowY.splice(0, 2, by + 6, by + 40, by + 74);
  const grid = st === 'craftsman' || st === 'bungalow' ? '3/1' : st === 'modern' || st === 'townhouse' ? '1' : '4';
  rowY.forEach((wy, ri) => {
    const isGround = ri === rowY.length - 1; const n = st === 'townhouse' ? 2 : st === 'mansion' ? 5 : st === 'rambler' ? 4 : 3;
    for (let i = 0; i < n; i++) {
      const wx = bx + 14 + Math.floor(i * (bw - 28) / n) + 4; const ww = st === 'modern' ? 30 : 16, wh = st === 'modern' ? 20 : 18;
      if (isGround && Math.abs(wx + ww / 2 - (doorX + 7)) < 16) continue;
      windowAt(p, wx, wy, ww, wh, trim, { grid, lit: lit && R() > 0.3, curtain: R() > 0.5 ? [C.red, C.gold, C.cream, C.pink][i % 4] || C.sand : null, cat: h.extra === 'cats' && R() > 0.3, box: isGround && (st === 'craftsman' || st === 'tudor' || h.extra === 'garden') });
    }
  });
  door(p, doorX, gY - 6 - doorH, doorW, doorH, h.door, trim, lit);
  // steps & path
  p.rect(doorX - 4, gY - 6, doorW + 8, 3, C.steel); p.rect(doorX - 6, gY - 3, doorW + 12, 3, C.slate);
  p.poly([[doorX - 4, gY], [doorX + doorW + 4, gY], [doorX + doorW + 14, H], [doorX - 14, H]], C.silver); p.dither(doorX - 14, gY, doorW + 28, H - gY, C.steel, 0.25);
  if (porch) { // porch roof + tapered columns
    const px0 = doorX - 26, pw = doorW + 52, py = gY - 6 - doorH - 12;
    p.poly([[px0 - 4, py + 4], [px0 + pw + 4, py + 4], [px0 + pw - 6, py - 6], [px0 + 6, py - 6]], roof); p.hline(px0 - 4, py + 4, pw + 8, trim); p.dither(px0, py + 5, pw, 2, C.ink, 0.6);
    for (const cxx of [px0 + 2, px0 + pw - 8]) { p.poly([[cxx, py + 5], [cxx + 6, py + 5], [cxx + 7, gY - 14], [cxx - 1, gY - 14]], trim); p.rect(cxx - 3, gY - 14, 12, 9, C.steel); siding(p, cxx - 3, gY - 14, 12, 9, C.slate, 'brick'); }
    p.rect(px0, gY - 8, pw, 2, sh(trim, 0.8));
  }
  // extras
  const ex = h.extra;
  if (ex === 'flag') { p.vline(bx + 10, by - 10, 30, C.steel); p.rect(bx + 11, by - 10, 16, 10, C.navy); p.rect(bx + 11, by - 3, 16, 3, C.lime); p.art(bx + 15, by - 9, ['#.###', '#...#', '#.###', '#.#..', '#.###'], { '#': C.white }); }
  if (ex === 'anchor') { p.art(doorX + doorW + 10, gY - 30, ['.#.', '###', '.#.', '.#.', '#.#', '###'], { '#': C.gold }); for (let i = 0; i < 4; i++) p.ellipse(bx + 20 + i * 8, gY + 2, 3, 2, [C.red, C.flame][i % 2]); }
  if (ex === 'bikes') for (let i = 0; i < 2; i++) { const x0 = bx + bw - 30 + i * 14, y0 = gY - 8; p.ring(x0, y0, 3, 3, C.ink); p.ring(x0 + 8, y0, 3, 3, C.ink); p.line(x0, y0, x0 + 4, y0 - 4, i ? C.hot : C.cyan); p.line(x0 + 4, y0 - 4, x0 + 8, y0, i ? C.hot : C.cyan); }
  if (ex === 'art') { p.ellipse(bx + bw + 8, gY - 8, 7, 8, C.slate); p.px(bx + bw + 6, gY - 11, C.cyan); p.hline(bx + bw + 4, gY - 5, 6, C.ink); /* the troll's cousin */ }
  if (ex === 'lights' || ex === 'gala') for (let i = 0; i < bw; i += 5) { p.px(bx + i, by + 4 + Math.round(Math.sin(i / 12) * 3), [C.yellow, C.pink, C.cyan, C.lime][(i / 5) % 4]); }
  if (ex === 'pride') { p.vline(bx + bw - 8, by - 24, 30, C.steel); ['#e43b44', '#f77622', '#fee761', '#63c74d', '#0099db', '#68386c'].forEach((c, i) => p.rect(bx + bw - 7, by - 24 + i * 2, 18, 2, c)); }
  if (ex === 'couch') { p.rect(bx + bw - 44, gY - 16, 26, 10, C.mauve); p.rect(bx + bw - 44, gY - 20, 26, 5, C.plum); for (let i = 0; i < 3; i++) p.rect(bx + bw - 60 + i * 5, gY - 10, 3, 4, C.red); }
  if (ex === 'garden') for (let i = 0; i < 5; i++) { p.rect(bx + 6 + i * 9, gY + 2, 7, 5, C.brown); p.px(bx + 8 + i * 9, gY + 1, C.lime); p.px(bx + 10 + i * 9, gY, C.green); }
  if (ex === 'drums') { p.ellipse(bx + bw - 20, gY - 10, 6, 5, C.red); p.ring(bx + bw - 20, gY - 10, 6, 5, C.silver); p.ellipse(bx + bw - 20, gY - 12, 5, 2, C.white); }
  if (ex === 'bunker') for (let i = 0; i < 5; i++) { p.ellipse(bx - 8 + i * 9, gY - 3, 5, 3, C.tan); p.ellipse(bx - 4 + i * 9, gY - 8, 5, 3, C.sand); }
  if (ex === 'cedar') { fir(p, 14, gY - 110, 112); fir(p, W - 16, gY - 96, 98); }
  if (ex === 'hedge') for (let i = 0; i < W; i += 10) p.blob(i + 5, gY + 6, 7, 6, [C.deep, C.forest, C.green, C.lime]);
  if (ex === 'cyber') { p.rect(bx + bw - 26, by + 6, 18, 6, C.ink); p.art(bx + bw - 25, by + 7, ['#.#.###.###', '###.#...#.#'], { '#': C.cyan }); }
  if (ex === 'gala') { for (let i = 0; i < 6; i++) { const x0 = bx + 10 + i * 34; p.line(x0, gY - 30, x0, gY - 50, C.silver); p.blob(x0, gY - 54, 4, 5, [C.crimson, C.red, C.pink]); } p.rect(cx - 30, by - 8, 60, 9, C.gold); p.art(cx - 9, by - 6, ['.##..#..#...#.', '#...#.#.#..#.#', '#.#.###.#..###', '.##.#.#.##.#.#'], { '#': C.ink }); }
  // mailbox with house number
  p.rect(doorX + doorW + 26, gY - 14, 2, 14, C.brown); p.rect(doorX + doorW + 22, gY - 20, 10, 6, C.storm); p.hline(doorX + doorW + 22, gY - 20, 10, C.slate); p.px(doorX + doorW + 32, gY - 22, C.red); p.px(doorX + doorW + 32, gY - 21, C.red);
  // night: dim everything a touch
  p.outline(C.ink);
  return p;
}

// Majority-vote 2x downscale for small in-game versions.
export function half(src) {
  const p = new PX(src.w >> 1, src.h >> 1);
  for (let y = 0; y < p.h; y++) for (let x = 0; x < p.w; x++) {
    const v = [src.get(2 * x, 2 * y), src.get(2 * x + 1, 2 * y), src.get(2 * x, 2 * y + 1), src.get(2 * x + 1, 2 * y + 1)];
    const op = v.filter(c => c >>> 24); if (op.length < 2) continue;
    const cnt = {}; let best = op[0]; for (const c of op) { cnt[c] = (cnt[c] || 0) + 1; if (cnt[c] > cnt[best]) best = c; }
    p.buf[y * p.w + x] = best;
  }
  return p;
}

export function houseTextures(scene, job, night) {
  const key = 'house' + job.id;
  if (!scene.textures.exists(key)) {
    const big = drawHouse(job.house, { night, seed: job.id + 7 });
    const small = half(big);
    big.toTexture(scene, key); small.toTexture(scene, key + 's');
  }
  return key;
}
