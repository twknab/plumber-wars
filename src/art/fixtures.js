// Repair close-up scenes (270x300). Each builder paints a background plus separately animated parts,
// and publishes anchors (touch targets) that job steps refer to by name.
import { PX } from '../core/pixel.js';
import { C, RAMP } from '../core/palette.js';

export const SW = 270, SH = 300;

const part = (scene, key, w, h, fn, outline = C.ink) => { const p = new PX(w, h); fn(p); if (outline) p.outline(outline); p.toTexture(scene, key); return key; };
const pipeH = (p, x, y, len, t, ramp = RAMP.copper) => { p.cylH(x, y, len, t, ramp, 0.3); p.hline(x, y - 1, len, C.ink); p.hline(x, y + t, len, C.ink); };
const pipeV = (p, x, y, len, t, ramp = RAMP.copper) => { p.cylV(x, y, t, len, ramp, 0.3); p.vline(x - 1, y, len, C.ink); p.vline(x + t, y, len, C.ink); };
const nut = (p, x, y, w, h, ramp = RAMP.chrome) => { p.bevel(x, y, w, h, ramp); for (let i = x + 2; i < x + w - 1; i += 3) p.vline(i, y + 1, h - 2, ramp[1]); };
function tiles(p, x, y, w, h, tw, th, base, grout, alt) {
  p.rect(x, y, w, h, base);
  for (let j = y; j < y + h; j += th) { p.hline(x, j, w, grout); const off = alt ? ((j - y) / th) % 2 * (tw >> 1) : 0; for (let i = x + off; i < x + w; i += tw) p.vline(i, j, th, grout); }
  for (let j = y + 1; j < y + h; j += th) for (let i = x + 1; i < x + w; i += tw) p.px(i + 1, j + 1, '#ffffff');
}
function checker(p, x, y, w, h, s, a, b) { for (let j = 0; j < h; j++) for (let i = 0; i < w; i++) p.px(x + i, y + j, ((Math.floor(i / s) + Math.floor(j / s)) % 2) ? a : b); }
function valveOval(p, cx, cy, col = RAMP.chrome) { p.blob(cx, cy, 8, 5, col); p.ellipse(cx, cy, 2, 2, C.night); p.px(cx - 4, cy - 2, C.white); }
function wheel(p, cx, cy, r, ramp = RAMP.red) { p.ring(cx, cy, r, r, ramp[1]); p.ring(cx, cy, r - 1, r - 1, ramp[2]); p.thick(cx - r + 1, cy, cx + r - 1, cy, 2, ramp[1]); p.thick(cx, cy - r + 1, cx, cy + r - 1, 2, ramp[1]); p.ellipse(cx, cy, 2.5, 2.5, ramp[3] || ramp[2]); }
function concrete(p, x, y, w, h) { p.rect(x, y, w, h, C.slate); p.dither(x, y, w, h, C.steel, 0.15); p.dither(x, y, w, h, C.storm, 0.12); }
function blocks(p, x, y, w, h) { concrete(p, x, y, w, h); for (let j = y; j < y + h; j += 16) { p.hline(x, j, w, C.storm); for (let i = x + ((j - y) / 16 % 2) * 16; i < x + w; i += 32) p.vline(i, j, 16, C.storm); } }

// ------------------------------------------------------------------ TOILET
function toilet(scene, v) {
  const bg = new PX(SW, SH);
  const wall = v === 'tank' ? [C.plum, C.mauve] : v === 'base' ? [C.silver, C.steel] : [C.cyan, C.blue];
  tiles(bg, 0, 0, SW, 250, 15, 15, wall[0], wall[1], false);
  if (v === 'tank') { for (let i = 0; i < 6; i++) bg.ellipse(20 + i * 48, 30 + (i % 2) * 20, 10, 10, [C.yellow, C.lime, C.cyan][i % 3]); } // Fremont hippie mural
  bg.rect(0, 244, SW, 6, C.white); bg.hline(0, 244, SW, C.silver); bg.hline(0, 249, SW, C.steel);
  checker(bg, 0, 250, SW, 50, 10, C.ink, C.silver);
  // flange + old wax (hidden under the toilet until it's lifted)
  if (v === 'base') { bg.ellipse(135, 244, 26, 8, C.storm); bg.ellipse(135, 244, 22, 6.5, C.slate); bg.ellipse(135, 244, 13, 4, C.ink); bg.rect(107, 240, 4, 6, C.gold); bg.rect(159, 240, 4, 6, C.gold); }
  // valve on wall + pipe stub
  bg.rect(76, 242, 16, 8, C.silver); bg.box(76, 242, 16, 8, C.steel);
  bg.cylH(84, 232, 10, 6, RAMP.chrome); nut(bg, 90, 230, 6, 10);
  bg.outline(C.ink);
  bg.toTexture(scene, 'fx_toilet_' + v);

  const parts = {};
  // whole toilet
  part(scene, 'p_toilet', 120, 220, p => {
    const ox = 60, P = RAMP.porcelain;
    // tank
    p.bevel(ox - 44, 12, 88, 78, P, null); p.cylH(ox - 44, 12, 88, 78, P, 0.25);
    p.rect(ox - 44, 12, 88, 2, C.white); p.rect(ox - 46, 4, 92, 10, C.silver); p.hline(ox - 46, 4, 92, C.white); p.hline(ox - 46, 13, 92, C.steel);
    if (v === 'tank') { // x-ray cutaway
      p.rect(ox - 38, 18, 76, 66, C.navy); p.box(ox - 38, 18, 76, 66, C.steel);
      p.rect(ox + 14, 30, 6, 54, C.steel); p.vline(ox + 14, 30, 54, C.silver); // overflow tube
      p.rect(ox - 30, 24, 8, 60, C.slate); p.rect(ox - 33, 22, 14, 6, C.steel); p.rect(ox - 28, 40, 4, 6, C.silver); // fill valve
      p.ellipse(ox, 82, 12, 3, C.ink); // flush valve seat
      p.thick(ox - 36, 24, ox + 2, 24, 2, C.silver); // flush arm
    }
    // bowl rim + seat
    p.blob(ox, 158, 46, 34, P); p.poly([[ox - 26, 170], [ox + 26, 170], [ox + 22, 212], [ox - 22, 212]], C.silver);
    p.cylH(ox - 26, 175, 52, 37, P, 0.3); p.blob(ox, 212, 32, 6, P);
    p.ellipse(ox, 112, 50, 20, C.white); p.ring(ox, 112, 50, 20, C.steel); p.ellipse(ox, 113, 38, 13, C.silver); p.ellipse(ox, 114, 32, 10, C.steel);
    // bolt caps
    p.blob(ox - 32, 210, 5, 4, P); p.blob(ox + 32, 210, 5, 4, P);
    // sheen
    p.line(ox - 36, 136, ox - 30, 150, C.white); p.line(ox - 36, 28, ox - 36, 80, C.white);
  });
  parts.toilet = { key: 'p_toilet', x: 135, y: 30, ox: 0.5, oy: 0 };
  part(scene, 'p_handle', 18, 8, p => { p.ellipse(4, 4, 3.5, 3.5, C.silver); p.px(3, 3, C.white); p.rect(6, 3, 11, 3, C.silver); p.hline(6, 3, 11, C.white); });
  parts.handle = { key: 'p_handle', x: 85, y: 56, ox: 0.2, oy: 0.5, depth: 3 };
  part(scene, 'p_valve', 20, 12, p => valveOval(p, 10, 6));
  parts.valve = { key: 'p_valve', x: 88, y: 235, ox: 0.5, oy: 0.5, depth: 3 };
  part(scene, 'p_supplyLine', 12, 110, p => { p.rect(4, 0, 4, 110, C.silver); for (let j = 0; j < 110; j += 3) p.px(5 + (j / 3) % 2, j, C.steel); nut(p, 2, 0, 8, 6); nut(p, 2, 102, 8, 7); });
  parts.supplyLine = { key: 'p_supplyLine', x: 92, y: 120, ox: 0.5, oy: 0, depth: 2 };
  // bowl water
  part(scene, 'p_bowlwater', 64, 20, p => { p.ellipse(32, 10, 30, 9, v === 'clog' ? C.brown : C.blue); p.dither(6, 4, 52, 8, v === 'clog' ? C.clay : C.cyan, 0.3); if (v === 'clog') { p.ellipse(22, 9, 3, 2, C.umber); p.ellipse(40, 11, 4, 2, C.umber); p.rect(30, 6, 6, 3, C.white); } }, null);
  parts.bowlwater = { key: 'p_bowlwater', x: 135, y: 145, ox: 0.5, oy: 0.5, depth: 2 };
  if (v === 'tank') {
    part(scene, 'p_tankwater', 74, 60, p => { p.rect(0, 0, 74, 60, '#0099db90'); p.hline(0, 0, 74, C.cyan); }, null);
    parts.tankwater = { key: 'p_tankwater', x: 135, y: 113, ox: 0.5, oy: 1, depth: 2 };
    part(scene, 'p_flapper', 30, 12, p => { p.ellipse(15, 7, 13, 4.5, C.crimson); p.ellipse(15, 6, 10, 3, C.clay); p.px(9, 5, C.tan); p.rect(1, 4, 4, 3, C.crimson); p.rect(25, 4, 4, 3, C.crimson); p.dither(4, 4, 22, 6, C.umber, 0.3); });
    parts.flapper = { key: 'p_flapper', x: 135, y: 108, ox: 0.5, oy: 0.5, depth: 3 };
    part(scene, 'p_flapperNew', 30, 12, p => { p.ellipse(15, 7, 13, 4.5, C.red); p.ellipse(15, 6, 10, 3, C.pink); p.rect(1, 4, 4, 3, C.red); p.rect(25, 4, 4, 3, C.red); });
    parts.flapperNew = { key: 'p_flapperNew', x: 135, y: 108, ox: 0.5, oy: 0.5, depth: 3, hidden: true };
    part(scene, 'p_chain', 4, 50, p => { for (let j = 0; j < 50; j += 3) { p.px(1, j, C.silver); p.px(2, j + 1, C.steel); } }, null);
    parts.chain = { key: 'p_chain', x: 137, y: 56, ox: 0.5, oy: 0, depth: 4 };
  }
  if (v === 'base') {
    part(scene, 'p_wax', 50, 16, p => { p.ellipse(25, 8, 24, 7, C.gold); p.dither(2, 2, 46, 12, C.brown, 0.45); p.ellipse(25, 8, 11, 3.5, C.ink); p.dither(2, 2, 46, 12, C.umber, 0.2); }, null);
    parts.wax = { key: 'p_wax', x: 135, y: 244, ox: 0.5, oy: 0.5, depth: 1 };
    part(scene, 'p_waxNew', 40, 12, p => { p.ellipse(20, 6, 18, 5, C.gold); p.ring(20, 6, 15, 4, C.yellow); p.ellipse(20, 6, 8, 2.5, C.ink); });
    parts.waxNew = { key: 'p_waxNew', x: 135, y: 244, ox: 0.5, oy: 0.5, depth: 1, hidden: true };
    part(scene, 'p_puddle', 120, 20, p => { p.ellipse(60, 10, 58, 8, '#124e89a0'); p.dither(10, 4, 100, 10, '#733e39', 0.2); p.hline(30, 6, 20, C.cyan); }, null);
    parts.puddle = { key: 'p_puddle', x: 135, y: 266, ox: 0.5, oy: 0.5, depth: 5 };
  }
  const anchors = {
    valve: { x: 88, y: 235, r: 26 }, handle: { x: 88, y: 56, r: 22 }, bowl: { x: 135, y: 146, r: 40 },
    flapper: { x: 135, y: 108, r: 24 }, chain: { x: 137, y: 72, r: 24 }, supplyNut: { x: 92, y: 124, r: 22 },
    bolts: { x: 103, y: 240, r: 24 }, toilet: { x: 135, y: 150, r: 60 }, wax: { x: 135, y: 244, r: 32 }, flange: { x: 135, y: 244, r: 30 },
  };
  return { bg: 'fx_toilet_' + v, parts, anchors };
}

// ------------------------------------------------------------------ SINK / CABINET
function sink(scene, v) {
  const bg = new PX(SW, SH);
  const vanity = v === 'vanity' || v === 'alki', alki = v === 'alki';
  // backsplash
  if (vanity) tiles(bg, 0, 0, SW, 70, 12, 12, C.sand, C.tan, false); else tiles(bg, 0, 0, SW, 70, 16, 8, C.white, C.silver, true);
  if (!vanity) { bg.rect(190, 6, 64, 44, C.sand); bg.vgrad(194, 10, 56, 36, [C.cyan, C.blue]); bg.vline(222, 10, 36, C.sand); bg.hline(194, 28, 56, C.sand); bg.box(189, 5, 66, 46, C.ink); for (let i = 0; i < 4; i++) bg.px(200 + i * 12, 40 - i * 3, C.white); }
  if (alki) alkiWall(bg);
  if (vanity && !alki) { bg.rect(80, 2, 110, 50, C.silver); bg.vgrad(84, 6, 102, 42, [C.steel, C.silver, C.white]); bg.box(79, 1, 112, 52, C.ink); bg.line(96, 12, 110, 40, C.white); }
  // counter
  bg.rect(0, 64, SW, 16, vanity ? C.white : C.clay); bg.hline(0, 64, SW, vanity ? C.white : C.tan); bg.rect(0, 76, SW, 4, vanity ? C.silver : C.brown);
  if (!vanity) for (let i = 0; i < SW; i += 9) bg.vline(i, 66, 10, C.brown);
  bg.ellipse(135, 69, 50, 5, C.steel); bg.ellipse(135, 68, 46, 3.5, C.slate);
  // cabinet interior
  bg.rect(0, 80, SW, 220, C.umber); bg.rect(26, 84, 218, 206, C.ink); bg.vgrad(28, 86, 214, 200, [C.night, C.storm]);
  bg.rect(26, 270, 218, 20, C.brown); bg.hline(26, 270, 218, C.clay);
  // cabinet doors open
  bg.poly([[0, 84], [26, 84], [26, 290], [0, 298]], C.clay); bg.rect(4, 170, 3, 20, C.silver);
  bg.poly([[244, 84], [270, 84], [270, 298], [244, 290]], C.clay); bg.rect(263, 170, 3, 20, C.silver);
  for (const x of [8, 250]) bg.box(x, 100, 12, 170, C.brown);
  // basin bottom + tailpiece
  bg.blob(135, 86, 56, 12, RAMP.chrome); bg.rect(79, 80, 112, 6, C.steel);
  // drain line into wall
  const trapY = 204;
  pipeH(bg, 168, trapY - 3, 76, 10, RAMP.pvc); bg.rect(236, trapY - 8, 8, 20, C.steel);
  // angle stops + risers
  for (const [x, col] of [[80, RAMP.red], [190, RAMP.blue]]) {
    pipeH(bg, x - 6, 175, 60, 6, RAMP.copper); bg.rect(x - 6, 168, 12, 18, C.silver); bg.box(x - 6, 168, 12, 18, C.ink); // escutcheon
    if (!(v === 'vanity' && x === 190)) { bg.rect(x + 1, 90, 3, 62, C.silver); for (let j = 90; j < 152; j += 3) bg.px(x + 2, j, C.steel); }
    nut(bg, x - 2, 150, 8, 7);
  }
  // clutter: dish soap, sponge bucket
  bg.rect(34, 252, 12, 18, C.lime); bg.rect(37, 247, 6, 5, C.white); bg.rect(34, 258, 12, 5, C.yellow);
  bg.rect(212, 256, 22, 14, C.cyan); bg.rect(214, 252, 18, 4, C.yellow);
  if (v === 'disposal') { bg.rect(30, 236, 16, 22, C.silver); bg.box(30, 236, 16, 22, C.steel); bg.rect(35, 240, 2, 4, C.ink); bg.rect(40, 240, 2, 4, C.ink); bg.rect(35, 250, 2, 4, C.ink); bg.rect(40, 250, 2, 4, C.ink); }
  bg.outline(C.ink);
  bg.toTexture(scene, 'fx_sink_' + v);

  const parts = {};
  // faucet
  part(scene, 'p_faucet', 60, 60, p => {
    p.bevel(20, 44, 20, 12, RAMP.chrome, null); p.cylV(24, 20, 12, 26, RAMP.chrome);
    p.cylH(24, 10, 34, 8, RAMP.chrome); p.blob(30, 14, 8, 6, RAMP.chrome); p.rect(52, 16, 6, 6, C.steel); p.rect(53, 22, 4, 2, C.slate);
  });
  parts.faucet = { key: 'p_faucet', x: 110, y: 6, ox: 0, oy: 0, depth: 2 };
  part(scene, 'p_fhandle', 28, 14, p => { p.blob(8, 7, 7, 6, RAMP.chrome); p.rect(12, 4, 15, 5, C.silver); p.hline(12, 4, 15, C.white); p.ellipse(8, 7, 2, 2, C.red); });
  parts.fhandle = { key: 'p_fhandle', x: 140, y: 44, ox: 0.3, oy: 0.5, depth: 4 };
  part(scene, 'p_fnut', 18, 8, p => nut(p, 1, 1, 16, 6, RAMP.brass));
  parts.fnut = { key: 'p_fnut', x: 140, y: 50, ox: 0.5, oy: 0.5, depth: 3 };
  part(scene, 'p_cart', 10, 28, p => { p.rect(2, 0, 6, 28, C.white); p.vline(2, 0, 28, C.silver); p.rect(1, 18, 8, 3, C.ink); p.rect(3, 0, 4, 3, C.gold); p.dither(2, 6, 6, 10, C.clay, 0.3); });
  parts.cart = { key: 'p_cart', x: 140, y: 44, ox: 0.5, oy: 0.5, depth: 2 };
  part(scene, 'p_cartNew', 10, 28, p => { p.rect(2, 0, 6, 28, C.white); p.vline(2, 0, 28, C.silver); p.rect(1, 18, 8, 3, C.ink); p.rect(3, 0, 4, 3, C.gold); p.rect(1, 8, 8, 1, C.blue); p.rect(1, 11, 8, 1, C.red); });
  parts.cartNew = { key: 'p_cartNew', x: 140, y: 44, ox: 0.5, oy: 0.5, depth: 2, hidden: true };
  part(scene, 'p_stopper', 18, 6, p => { p.ellipse(9, 3, 8, 2.5, C.ink); p.hline(4, 2, 10, C.storm); });
  parts.stopper = { key: 'p_stopper', x: 135, y: 69, ox: 0.5, oy: 0.5, depth: 2, hidden: true };
  part(scene, 'p_fscrew', 6, 6, p => { p.ellipse(3, 3, 2.5, 2.5, C.silver); p.hline(1, 3, 5, C.slate); });
  parts.fscrew = { key: 'p_fscrew', x: 136, y: 42, ox: 0.5, oy: 0.5, depth: 5 };
  for (const [k, x, col] of [['stopH', 80, RAMP.chrome], ['stopC', 190, RAMP.chrome]]) {
    part(scene, 'p_' + k, 20, 12, p => valveOval(p, 10, 6, col));
    parts[k] = { key: 'p_' + k, x: x + 26, y: 178, ox: 0.5, oy: 0.5, depth: 3 };
  }
  // tailpiece / disposal
  if (v === 'disposal') {
    part(scene, 'p_disp', 56, 76, p => {
      p.cylV(4, 8, 48, 60, [C.night, C.storm, C.slate, C.steel]); p.rect(2, 0, 52, 10, C.steel); p.hline(2, 0, 52, C.silver);
      p.rect(10, 26, 36, 14, C.navy); p.art(14, 29, ['###.###.###', '#...#.#.#.#', '#.#.###.###', '###.#.#.#..'], { '#': C.cyan });
      p.ellipse(28, 68, 22, 6, C.night); p.ellipse(28, 70, 4, 3, C.ink); p.rect(38, 64, 5, 4, C.red);
    });
    parts.disp = { key: 'p_disp', x: 135, y: 92, ox: 0.5, oy: 0, depth: 2 };
    part(scene, 'p_junk', 16, 22, p => { p.rect(4, 0, 8, 22, C.ink); p.rect(2, 7, 12, 10, C.storm); p.rect(4, 9, 8, 6, C.navy); p.px(6, 11, C.cyan); p.px(8, 12, C.lime); p.rect(3, 18, 10, 3, C.gold); });
    parts.junk = { key: 'p_junk', x: 135, y: 64, ox: 0.5, oy: 0.5, depth: 1 };
    part(scene, 'p_cord', 110, 70, p => { for (let i = 0; i < 100; i++) { const t = i / 99; p.rect(Math.round(100 - t * 88 + Math.sin(t * 6) * 4), Math.round(t * 62), 2, 2, C.ink); } }, null);
    parts.cord = { key: 'p_cord', x: 50, y: 176, ox: 0, oy: 0, depth: 1 };
    part(scene, 'p_plug', 14, 16, p => { p.rect(2, 2, 10, 12, C.ink); p.rect(3, 3, 8, 10, C.storm); p.rect(4, 0, 2, 3, C.silver); p.rect(8, 0, 2, 3, C.silver); });
    parts.plug = { key: 'p_plug', x: 44, y: 244, ox: 0.5, oy: 0.5, depth: 4 };
    pipeTrap(scene, parts, 135, 168);
  } else {
    part(scene, 'p_tail', 14, 90, p => { p.cylV(3, 0, 8, 90, RAMP.chrome); nut(p, 0, 80, 14, 8, RAMP.pvc); });
    parts.tail = { key: 'p_tail', x: 135, y: 96, ox: 0.5, oy: 0, depth: 2 };
    pipeTrap(scene, parts, 135, 186);
  }
  if (alki) alkiParts(scene, parts);
  if (v === 'vanity') {
    part(scene, 'p_line', 44, 100, p => { p.thick(4, 96, 30, 50, 4, C.white); p.thick(30, 50, 26, 4, 4, C.white); p.line(5, 94, 29, 50, C.silver); nut(p, 20, 0, 12, 7, RAMP.pvc); nut(p, 0, 92, 12, 7, RAMP.pvc); p.ellipse(28, 60, 3, 2, C.cyan); });
    parts.line = { key: 'p_line', x: 190, y: 82, ox: 0.5, oy: 0, depth: 2 };
    part(scene, 'p_lineNew', 44, 100, p => { p.thick(4, 96, 30, 50, 4, C.silver); p.thick(30, 50, 26, 4, 4, C.silver); for (let j = 4; j < 96; j += 3) p.px(27 + Math.round((j - 50) * -0.05), j, C.steel); nut(p, 20, 0, 12, 7); nut(p, 0, 92, 12, 7); });
    parts.lineNew = { key: 'p_lineNew', x: 190, y: 82, ox: 0.5, oy: 0, depth: 2, hidden: true };
  }
  const anchors = {
    fhandle: { x: 146, y: 44, r: 22 }, fscrew: { x: 138, y: 42, r: 22 }, fnut: { x: 140, y: 50, r: 22 }, cart: { x: 140, y: 42, r: 22 }, drain: { x: 135, y: 69, r: 22 },
    stopC: { x: 216, y: 178, r: 24 }, stopH: { x: 106, y: 178, r: 24 }, stopNut: { x: 190, y: 172, r: 22 }, tail: { x: 190, y: 88, r: 22 }, lineSpot: { x: 190, y: 130, r: 34 },
    slip: { x: 135, y: v === 'disposal' ? 172 : 190, r: 24 }, trap: { x: 150, y: 222, r: 32 }, under: { x: 150, y: 262, r: 34 }, arm: { x: 205, y: 204, r: 26 }, grime: { x: 150, y: 262, r: 34 },
    pivot: { x: 148, y: 126, r: 22 }, rod: { x: 166, y: 126, r: 24 }, popup: { x: 135, y: 64, r: 22 }, popGrime: { x: 135, y: 34, r: 24 }, hairS: { x: 135, y: 66, r: 22 },
    hex: { x: 135, y: 162, r: 26 }, reset: { x: 150, y: 158, r: 18 }, junk: { x: 135, y: 64, r: 22 }, plug: { x: 44, y: 244, r: 22 }, outlet: { x: 38, y: 247, r: 24 },
  };
  return { bg: 'fx_sink_' + v, parts, anchors };
}
// Jimmy's Alki apartment wall: kayak on the wall, an electric guitar, an amanita, and Boy the squirrel.
function alkiWall(bg) {
  bg.rect(0, 0, SW, 64, C.cyan); bg.dither(0, 0, SW, 64, C.blue, 0.12); for (let i = 0; i < SW; i += 30) bg.vline(i, 0, 64, C.blue);
  // kayak on wall hooks
  bg.poly([[8, 16], [30, 9], [170, 9], [196, 16], [170, 23], [30, 23]], C.gold); bg.hline(30, 9, 140, C.yellow); bg.hline(30, 22, 140, C.flame);
  bg.ellipse(100, 16, 22, 4, C.ink); bg.ellipse(100, 15, 20, 2.5, C.night); bg.hline(12, 16, 184, C.flame);
  bg.art(52, 13, ['#.#.#.#', '###.###', '#.#.#.#'], { '#': C.ink }); // "HI" sticker, obviously
  for (const x of [40, 160]) { bg.rect(x, 5, 3, 6, C.slate); bg.rect(x, 23, 3, 4, C.slate); }
  // paddle
  bg.line(20, 30, 70, 58, C.brown); bg.ellipse(20, 30, 5, 3, C.forest); bg.ellipse(70, 58, 5, 3, C.forest);
  // electric guitar leaning against the wall (clear of the customer portrait)
  bg.thick(212, 2, 203, 42, 2, C.brown); bg.rect(210, 0, 6, 5, C.ink); for (let j = 8; j < 40; j += 6) bg.px(208 - (j - 8) * 0.22, j, C.silver);
  bg.blob(200, 52, 12, 10, [C.umber, C.crimson, C.red, C.pink]); bg.blob(195, 44, 7, 6, [C.umber, C.crimson, C.red]);
  bg.rect(195, 50, 10, 2, C.ink); bg.rect(197, 55, 6, 2, C.white); for (const x of [199, 203]) bg.px(x, 60, C.silver);
  // amanita mushroom terrarium on the counter
  bg.rect(26, 48, 20, 16, '#c0cbdc60'); bg.box(26, 48, 20, 16, C.silver); bg.rect(27, 60, 18, 3, C.brown);
  bg.rect(34, 54, 4, 6, C.white); bg.ellipse(36, 53, 7, 4, C.red); bg.px(33, 51, C.white); bg.px(38, 52, C.white); bg.px(36, 50, C.white);
  // Boy the squirrel on the counter, guarding an acorn
  const sq = 178;
  bg.ellipse(sq, 57, 5, 5, C.clay); bg.ellipse(sq - 6, 52, 5, 8, C.brown); bg.ellipse(sq + 3, 51, 3.5, 3, C.clay);
  bg.px(sq + 4, 50, C.ink); bg.px(sq, 48, C.clay); bg.px(sq + 5, 53, C.brown); bg.rect(sq - 1, 60, 3, 2, C.umber); bg.ellipse(sq + 8, 60, 2, 2, C.brown); bg.px(sq + 8, 58, C.umber);
}
function alkiParts(scene, parts) {
  part(scene, 'p_popup', 14, 30, p => { p.ellipse(7, 3, 6, 2.5, C.silver); p.px(4, 2, C.white); p.rect(6, 4, 2, 22, C.steel); p.rect(5, 24, 4, 4, C.slate); });
  parts.popup = { key: 'p_popup', x: 135, y: 66, ox: 0.5, oy: 0.1, depth: 3 };
  part(scene, 'p_popGrime', 18, 26, p => { p.rect(4, 2, 10, 22, C.brown); p.dither(2, 0, 14, 26, C.umber, 0.4); for (let j = 0; j < 26; j += 3) p.hline(1, j, 16, j % 2 ? C.ink : C.clay); }, null);
  parts.popGrime = { key: 'p_popGrime', x: 135, y: 44, ox: 0.5, oy: 0.5, depth: 4, hidden: true };
  part(scene, 'p_hairS', 20, 60, p => { for (let k = 0; k < 7; k++) { let x = 10 + (k - 3) * 1.4; for (let y = 0; y < 60; y++) { x += Math.sin(y / 5 + k) * 0.6; p.px(x, y, [C.umber, C.brown, C.clay][k % 3]); } } p.ellipse(10, 54, 5, 4, C.brown); p.ellipse(10, 53, 3, 2.5, C.clay); p.rect(8, 49, 4, 2, C.umber); }, null);
  parts.hairS = { key: 'p_hairS', x: 135, y: 70, ox: 0.5, oy: 1, depth: 2, hidden: true };
  part(scene, 'p_pivot', 10, 10, p => { p.bevel(1, 1, 8, 8, RAMP.chrome, null); p.px(3, 3, C.white); });
  parts.pivot = { key: 'p_pivot', x: 148, y: 126, ox: 0.5, oy: 0.5, depth: 4 };
  part(scene, 'p_rod', 34, 6, p => { p.cylH(0, 1, 30, 4, RAMP.chrome); p.rect(28, 0, 6, 6, C.steel); for (let i = 6; i < 28; i += 5) p.vline(i, 1, 4, C.slate); });
  parts.rod = { key: 'p_rod', x: 150, y: 126, ox: 0, oy: 0.5, depth: 3 };
}

function pipeTrap(scene, parts, x, y) {
  part(scene, 'p_trap', 80, 50, p => {
    p.cylV(4, 0, 12, 36, RAMP.pvc); p.blob(24, 36, 20, 12, RAMP.pvc); p.ellipse(24, 32, 10, 6, 0); p.cylV(36, 12, 12, 26, RAMP.pvc); p.cylH(36, 12, 40, 12, RAMP.pvc);
    nut(p, 1, 0, 18, 7, RAMP.pvc); nut(p, 33, 10, 7, 16, RAMP.pvc);
  });
  parts.trap = { key: 'p_trap', x: x - 10, y, ox: 0, oy: 0, depth: 2 };
  part(scene, 'p_grime', 44, 20, p => { p.ellipse(22, 10, 20, 8, C.brown); p.dither(2, 2, 40, 16, C.clay, 0.3); p.dither(2, 2, 40, 16, C.sand, 0.12); p.ellipse(15, 8, 4, 3, C.tan); }, null);
  parts.grime = { key: 'p_grime', x: 150, y: 256, ox: 0.5, oy: 0.5, depth: 6, hidden: true };
  part(scene, 'p_bucket', 44, 34, p => { p.poly([[2, 4], [42, 4], [37, 33], [7, 33]], C.flame); p.poly([[2, 4], [10, 4], [10, 33], [7, 33]], C.gold); p.ellipse(22, 5, 20, 4, C.brown); p.ring(22, 5, 20, 4, C.gold); p.rect(12, 14, 20, 7, C.white); });
  parts.bucket = { key: 'p_bucket', x: 150, y: 272, ox: 0.5, oy: 0.5, depth: 5, hidden: true };
}

// ------------------------------------------------------------------ SHOWER (top-down)
function shower(scene) {
  const bg = new PX(SW, SH);
  tiles(bg, 0, 0, SW, SH, 18, 18, C.white, C.silver, false);
  for (let j = 0; j < SH; j += 18) for (let i = 0; i < SW; i += 18) if (((i + j) / 18) % 5 === 0) bg.rect(i + 1, j + 1, 17, 17, C.cyan);
  bg.rect(0, 0, SW, 14, C.steel); bg.hline(0, 14, SW, C.slate); // curb
  bg.dither(0, 0, SW, SH, C.silver, 0.08);
  bg.ellipse(135, 160, 26, 26, C.slate); bg.ellipse(135, 160, 20, 20, C.ink); bg.ellipse(135, 160, 12, 12, C.night);
  // shampoo army
  [[20, 30, C.hot], [34, 26, C.lime], [48, 32, C.gold], [230, 260, C.mauve]].forEach(([x, y, c]) => { bg.rect(x, y, 10, 14, c); bg.rect(x + 3, y - 3, 4, 3, C.white); });
  bg.ellipse(240, 40, 12, 8, C.yellow); bg.px(236, 37, C.white); // rubber duck-ish
  bg.outline(C.ink);
  bg.toTexture(scene, 'fx_shower');
  const parts = {};
  part(scene, 'p_pool', 220, 150, p => { p.ellipse(110, 75, 108, 72, '#0099db70'); p.ring(110, 75, 108, 72, '#2ce8f5a0'); for (let i = 0; i < 16; i++) p.hline(20 + (i * 37) % 170, 20 + (i * 23) % 110, 8, '#ffffff80'); }, null);
  parts.pool = { key: 'p_pool', x: 135, y: 160, ox: 0.5, oy: 0.5, depth: 5 };
  part(scene, 'p_cover', 44, 44, p => { p.blob(22, 22, 20, 20, RAMP.chrome); for (let a = 0; a < 12; a++) { const r = 6 + (a % 2) * 7; p.ellipse(22 + Math.cos(a) * r, 22 + Math.sin(a) * r, 1.5, 1.5, C.ink); } p.ellipse(22, 22, 3, 3, C.slate); p.hline(20, 22, 5, C.ink); });
  parts.cover = { key: 'p_cover', x: 135, y: 160, ox: 0.5, oy: 0.5, depth: 4 };
  part(scene, 'p_hair', 30, 80, p => { for (let k = 0; k < 9; k++) { let x = 15 + (k - 4) * 1.5; for (let y = 0; y < 80; y++) { x += Math.sin(y / 5 + k) * 0.7; p.px(x, y, [C.umber, C.brown, C.gold, C.ink][k % 4]); } } p.blob(15, 70, 10, 8, [C.umber, C.brown, C.clay]); p.dither(6, 64, 18, 14, C.sand, 0.2); }, null);
  parts.hair = { key: 'p_hair', x: 135, y: 170, ox: 0.5, oy: 1, depth: 3 };
  part(scene, 'p_grime', 36, 36, p => { p.ellipse(18, 18, 16, 16, C.brown); p.ellipse(18, 18, 8, 8, 0); p.dither(0, 0, 36, 36, C.clay, 0.3); p.dither(0, 0, 36, 36, C.white, 0.08); }, null);
  parts.grime = { key: 'p_grime', x: 135, y: 160, ox: 0.5, oy: 0.5, depth: 2, hidden: true };
  return { bg: 'fx_shower', parts, anchors: { cover: { x: 135, y: 160, r: 30 }, hair: { x: 135, y: 150, r: 30 }, grime: { x: 135, y: 160, r: 30 }, pool: { x: 135, y: 160, r: 60 } } };
}

// ------------------------------------------------------------------ BASEMENT (PRV / main)
function basement(scene, v) {
  const bg = new PX(SW, SH);
  blocks(bg, 0, 0, SW, 250); concrete(bg, 0, 250, SW, 50); bg.hline(0, 250, SW, C.storm); bg.dither(0, 250, SW, 6, C.night, 0.4);
  // joists
  bg.rect(0, 0, SW, 10, C.brown); for (let i = 0; i < SW; i += 40) bg.rect(i, 0, 10, 16, C.clay);
  // main line up from floor, across the top
  pipeV(bg, 56, 110, 150, 10); pipeH(bg, 56, 100, 214, 10);
  bg.blob(61, 105, 7, 7, RAMP.copper);
  // hose bib drop
  pipeV(bg, 216, 110, 70, 8); bg.rect(210, 180, 20, 10, C.gold); bg.rect(222, 186, 8, 12, C.gold); bg.box(210, 180, 20, 10, C.ink);
  // water meter
  bg.blob(61, 238, 12, 10, RAMP.brass); bg.ellipse(61, 236, 7, 5, C.white); bg.line(61, 236, 64, 233, C.red);
  // shelf w/ paint cans
  bg.rect(150, 208, 50, 4, C.clay); for (let i = 0; i < 3; i++) { bg.cylV(154 + i * 15, 190, 12, 18, [C.slate, C.steel, C.silver]); bg.rect(154 + i * 15, 196, 12, 6, [C.red, C.lime, C.cyan][i]); }
  if (v === 'main') {
    bg.rect(180, 24, 84, 60, C.forest); bg.box(180, 24, 84, 60, C.ink); bg.rect(184, 28, 76, 52, C.umber); bg.dither(184, 28, 76, 52, C.brown, 0.4);
    pipeH(bg, 184, 60, 76, 6); bg.rect(186, 18, 40, 9, C.ink);
    // laundry sink
    bg.rect(226, 128, 44, 30, C.silver); bg.box(226, 128, 44, 30, C.ink); bg.rect(240, 122, 4, 8, C.silver);
  }
  bg.outline(C.ink);
  bg.toTexture(scene, 'fx_basement_' + v);
  const parts = {};
  if (v === 'prv') {
    part(scene, 'p_prv', 40, 50, p => { p.blob(20, 34, 16, 14, RAMP.brass); p.cylV(12, 6, 16, 22, RAMP.brass); p.rect(10, 4, 20, 4, C.gold); p.art(10, 36, ['###.###.#.#', '#.#.#.#.#.#', '###.##..#.#', '#...#.#..#.'], { '#': C.brown }); });
    parts.prv = { key: 'p_prv', x: 140, y: 82, ox: 0.5, oy: 0, depth: 2 };
    part(scene, 'p_prvnut', 18, 8, p => nut(p, 1, 1, 16, 6, RAMP.chrome));
    parts.prvnut = { key: 'p_prvnut', x: 140, y: 82, ox: 0.5, oy: 0.5, depth: 3 };
    part(scene, 'p_prvscrew', 8, 18, p => { p.cylV(1, 0, 6, 18, RAMP.chrome); for (let j = 1; j < 18; j += 2) p.hline(1, j, 6, C.slate); p.hline(1, 0, 6, C.ink); });
    parts.prvscrew = { key: 'p_prvscrew', x: 140, y: 70, ox: 0.5, oy: 0.5, depth: 3 };
  } else {
    part(scene, 'p_main', 34, 34, p => { p.cylV(12, 0, 10, 34, RAMP.brass); p.blob(17, 17, 12, 10, RAMP.brass); p.dither(4, 6, 26, 22, C.forest, 0.35); p.rect(15, 0, 4, 6, C.slate); p.px(13, 3, C.red); p.px(20, 1, C.crimson); });
    parts.main = { key: 'p_main', x: 61, y: 170, ox: 0.5, oy: 0.5, depth: 2 };
    part(scene, 'p_ballvalve', 30, 36, p => { p.cylV(10, 0, 10, 36, RAMP.brass); p.blob(15, 18, 10, 9, RAMP.brass); p.rect(15, 14, 15, 5, C.red); p.hline(15, 14, 15, C.pink); p.rect(13, 12, 4, 6, C.steel); });
    parts.ballvalve = { key: 'p_ballvalve', x: 61, y: 170, ox: 0.5, oy: 0.5, depth: 2, hidden: true };
    part(scene, 'p_curb', 20, 12, p => { p.rect(2, 3, 16, 6, C.slate); p.rect(8, 0, 4, 12, C.steel); p.hline(2, 3, 16, C.steel); });
    parts.curb = { key: 'p_curb', x: 222, y: 63, ox: 0.5, oy: 0.5, depth: 2 };
    part(scene, 'p_lowtap', 16, 14, p => { p.cylH(0, 4, 14, 5, RAMP.chrome); p.rect(11, 8, 4, 5, C.silver); p.blob(5, 3, 4, 3, RAMP.red); });
    parts.lowtap = { key: 'p_lowtap', x: 242, y: 124, ox: 0.5, oy: 0.5, depth: 3 };
  }
  part(scene, 'p_gauge', 26, 30, p => { p.blob(13, 12, 11, 11, RAMP.chrome); p.ellipse(13, 12, 8, 8, C.white); p.art(8, 6, ['.#.#.#.', '#.....#'], { '#': C.ink }); p.rect(10, 22, 6, 8, C.gold); });
  parts.gauge = { key: 'p_gauge', x: 226, y: 208, ox: 0.5, oy: 0.5, depth: 4, hidden: true };
  part(scene, 'p_needle', 10, 2, p => { p.hline(0, 0, 9, C.red); p.hline(0, 1, 5, C.crimson); }, null);
  parts.needle = { key: 'p_needle', x: 226, y: 204, ox: 0.1, oy: 0.5, depth: 5, hidden: true, angle: 150 };
  const anchors = {
    prvnut: { x: 140, y: 82, r: 22 }, prvscrew: { x: 140, y: 70, r: 22 }, bibg: { x: 226, y: 196, r: 26 }, main: { x: 61, y: 170, r: 26 },
    curb: { x: 222, y: 63, r: 24 }, lowtap: { x: 242, y: 124, r: 22 }, ends: { x: 61, y: 170, r: 26 },
    faucets: { spots: [[242, 124], [120, 150], [30, 60]] },
  };
  return { bg: 'fx_basement_' + v, parts, anchors };
}

// ------------------------------------------------------------------ WATER HEATER
function heater(scene) {
  const bg = new PX(SW, SH);
  bg.rect(0, 0, SW, 262, C.sand); bg.dither(0, 0, SW, 262, C.tan, 0.15);
  bg.rect(196, 40, 70, 90, C.clay); for (let j = 44; j < 128; j += 8) for (let i = 200; i < 262; i += 8) bg.px(i, j, C.brown); // pegboard
  [[206, 60, C.red], [222, 56, C.steel], [240, 64, C.gold]].forEach(([x, y, c]) => { bg.rect(x, y, 3, 22, c); });
  concrete(bg, 0, 262, SW, 38); bg.hline(0, 262, SW, C.storm);
  bg.ellipse(230, 284, 12, 4, C.storm); for (let i = 222; i < 240; i += 3) bg.vline(i, 282, 4, C.ink); // floor drain
  // stand + tank
  bg.rect(80, 250, 110, 12, C.slate); bg.hline(80, 250, 110, C.steel);
  bg.cylV(86, 30, 98, 222, [C.clay, C.tan, C.sand, C.white], 0.3); bg.blob(135, 30, 49, 12, [C.tan, C.sand, C.white]);
  bg.rect(100, 90, 70, 40, C.white); bg.box(100, 90, 70, 40, C.steel); bg.art(108, 96, ['#..#.###.###.#...#.##.', '#..#.#.#.#...#..#..#.#', '####.#.#.###.#.#..##..', '#..#.#.#...#.#....#..#', '#..#.###.###.#....#..#'], { '#': C.red });
  bg.hline(106, 116, 56, C.ink); bg.hline(106, 121, 40, C.steel);
  // flue + pipes on top
  bg.cylV(128, 0, 14, 22, RAMP.galv); pipeV(bg, 104, 0, 22, 8); pipeV(bg, 160, 0, 22, 8);
  bg.rect(102, 22, 12, 4, C.blue); bg.rect(158, 22, 12, 4, C.red);
  // T&P valve & discharge
  bg.rect(184, 50, 10, 8, C.gold); pipeV(bg, 188, 58, 180, 6);
  // burner panel
  bg.rect(112, 222, 46, 22, C.storm); bg.box(112, 222, 46, 22, C.ink); bg.rect(118, 228, 34, 10, C.ink);
  bg.outline(C.ink);
  bg.toTexture(scene, 'fx_heater');
  const parts = {};
  part(scene, 'p_gasbox', 36, 26, p => { p.bevel(1, 1, 34, 24, [C.storm, C.slate, C.steel, C.silver], null); p.art(4, 4, ['###.###.###', '#.#.#.#..#.'], { '#': C.white }); });
  parts.gasbox = { key: 'p_gasbox', x: 135, y: 196, ox: 0.5, oy: 0.5, depth: 2 };
  part(scene, 'p_gas', 16, 16, p => { p.blob(8, 8, 7, 7, RAMP.red); p.rect(7, 1, 2, 14, C.crimson); p.px(7, 2, C.white); });
  parts.gas = { key: 'p_gas', x: 128, y: 200, ox: 0.5, oy: 0.5, depth: 3 };
  part(scene, 'p_ignite', 8, 8, p => { p.blob(4, 4, 3, 3, RAMP.chrome); p.px(3, 3, C.white); });
  parts.ignite = { key: 'p_ignite', x: 146, y: 200, ox: 0.5, oy: 0.5, depth: 3 };
  part(scene, 'p_cold', 20, 12, p => valveOval(p, 10, 6, RAMP.blue));
  parts.cold = { key: 'p_cold', x: 108, y: 12, ox: 0.5, oy: 0.5, depth: 3 };
  part(scene, 'p_drain', 14, 12, p => { p.cylH(0, 3, 10, 6, RAMP.brass); p.rect(8, 1, 5, 10, C.gold); p.rect(2, 0, 4, 3, C.gold); });
  parts.drain = { key: 'p_drain', x: 168, y: 242, ox: 0.5, oy: 0.5, depth: 3 };
  part(scene, 'p_hose', 70, 50, p => { for (let i = 0; i < 60; i++) { const t = i / 59; p.rect(Math.round(t * 60), Math.round(Math.sin(t * Math.PI) * 30 + t * 12), 4, 4, C.green); p.px(Math.round(t * 60) + 1, Math.round(Math.sin(t * Math.PI) * 30 + t * 12), C.lime); } });
  parts.hose = { key: 'p_hose', x: 172, y: 240, ox: 0, oy: 0, depth: 2, hidden: true };
  part(scene, 'p_flame', 20, 10, p => { for (let i = 0; i < 5; i++) { p.poly([[2 + i * 4, 10], [5 + i * 4, 10], [3.5 + i * 4, 2 + (i % 2) * 2]], C.blue); p.px(3 + i * 4, 8, C.cyan); } }, null);
  parts.flame = { key: 'p_flame', x: 135, y: 232, ox: 0.5, oy: 0.5, depth: 3, hidden: true };
  return { bg: 'fx_heater', parts, anchors: { gas: { x: 128, y: 200, r: 22 }, cold: { x: 108, y: 12, r: 24 }, drain: { x: 168, y: 242, r: 24 }, ignite: { x: 146, y: 200, r: 20 } } };
}

// ------------------------------------------------------------------ SUMP PIT
function sump(scene) {
  const bg = new PX(SW, SH);
  blocks(bg, 0, 0, SW, 150); concrete(bg, 0, 150, SW, 150);
  // basement window with rain
  bg.rect(20, 20, 70, 40, C.slate); bg.vgrad(24, 24, 62, 32, [C.night, C.storm]); for (let i = 0; i < 16; i++) bg.vline(26 + (i * 7) % 58, 24 + (i * 5) % 20, 6, C.steel); bg.box(19, 19, 72, 42, C.ink);
  // pit
  bg.rect(76, 150, 118, 146, C.ink); bg.rect(80, 150, 110, 140, C.night); bg.dither(80, 150, 110, 140, C.storm, 0.15);
  bg.rect(70, 148, 130, 5, C.steel); bg.hline(70, 148, 130, C.silver);
  // outlet on wall
  bg.rect(222, 96, 20, 28, C.white); bg.box(222, 96, 20, 28, C.steel); for (const y of [102, 114]) { bg.rect(228, y, 2, 4, C.ink); bg.rect(234, y, 2, 4, C.ink); }
  // floating drum kit (flavor)
  bg.ellipse(240, 200, 18, 12, C.red); bg.ring(240, 200, 18, 12, C.silver); bg.ellipse(240, 196, 16, 6, C.white);
  bg.outline(C.ink);
  bg.toTexture(scene, 'fx_sump');
  const parts = {};
  part(scene, 'p_sumpwater', 110, 140, p => { p.rect(0, 0, 110, 140, '#124e89c0'); p.hline(0, 0, 110, C.cyan); p.dither(0, 1, 110, 3, C.blue, 0.5); }, null);
  parts.sumpwater = { key: 'p_sumpwater', x: 135, y: 290, ox: 0.5, oy: 1, depth: 4, scaleY: 0.45 };
  part(scene, 'p_pump', 50, 150, p => {
    p.cylV(20, 0, 10, 110, RAMP.pvc); p.rect(18, 60, 14, 12, C.ink); p.rect(19, 62, 12, 3, C.storm); // pipe + check valve
    p.cylV(6, 108, 38, 34, [C.night, C.storm, C.slate, C.steel]); p.rect(4, 104, 42, 6, C.storm); p.hline(4, 104, 42, C.slate);
    for (let i = 8; i < 44; i += 3) p.vline(i, 138, 4, C.ink); // intake screen
    p.rect(42, 118, 8, 3, C.steel); p.rect(46, 114, 4, 10, C.gold); // float arm
  });
  parts.pump = { key: 'p_pump', x: 135, y: 142, ox: 0.5, oy: 0, depth: 3 };
  part(scene, 'p_screen', 40, 10, p => { p.rect(0, 0, 40, 10, C.brown); p.dither(0, 0, 40, 10, C.green, 0.4); p.dither(0, 0, 40, 10, C.clay, 0.2); }, null);
  parts.screen = { key: 'p_screen', x: 135, y: 182, ox: 0.5, oy: 0.5, depth: 4, hidden: true };
  part(scene, 'p_plug', 14, 16, p => { p.rect(2, 2, 10, 12, C.ink); p.rect(3, 3, 8, 10, C.storm); p.rect(4, 0, 2, 3, C.silver); p.rect(8, 0, 2, 3, C.silver); });
  parts.plug = { key: 'p_plug', x: 232, y: 110, ox: 0.5, oy: 0.5, depth: 4, angle: -90 };
  part(scene, 'p_cord', 90, 150, p => { for (let i = 0; i < 120; i++) { const t = i / 119; p.rect(Math.round(t * 80), Math.round(t * t * 140), 2, 2, C.ink); } }, null);
  parts.cord = { key: 'p_cord', x: 150, y: 110, ox: 0, oy: 0, depth: 2 };
  return { bg: 'fx_sump', parts, anchors: { plug: { x: 232, y: 110, r: 24 }, outlet: { x: 232, y: 110, r: 26 }, pump: { x: 135, y: 220, r: 40 }, pit: { x: 135, y: 250, r: 50, area: [88, 200, 94, 80] }, screen: { x: 135, y: 182, r: 34 } } };
}

// ------------------------------------------------------------------ CRAWLSPACE
function crawl(scene) {
  const bg = new PX(SW, SH);
  bg.rect(0, 0, SW, SH, C.ink);
  for (let i = 0; i < SW; i += 44) { bg.rect(i, 0, 16, 60, C.brown); bg.vline(i, 0, 60, C.clay); } bg.rect(0, 0, SW, 12, C.umber);
  bg.rect(0, 60, SW, 120, C.night); bg.dither(0, 60, SW, 120, C.ink, 0.3);
  bg.rect(0, 180, SW, 120, C.umber); bg.dither(0, 180, SW, 120, C.brown, 0.35); bg.dither(0, 180, SW, 30, C.ink, 0.4);
  bg.rect(0, 200, SW, 10, '#3a4466a0'); // vapor barrier
  // Derek's beans
  for (let r = 0; r < 3; r++) for (let i = 0; i < 5 - r; i++) { const x = 186 + i * 14 + r * 7, y = 262 - r * 16; bg.cylV(x, y, 12, 15, RAMP.chrome); bg.rect(x, y + 4, 12, 7, [C.red, C.gold, C.lime][r]); }
  pipeH(bg, 0, 146, SW, 10);
  for (let x = 20; x < SW; x += 70) { bg.rect(x, 60, 2, 86, C.steel); bg.rect(x - 3, 144, 8, 2, C.steel); }
  bg.outline(C.ink);
  bg.toTexture(scene, 'fx_crawl');
  const parts = {};
  part(scene, 'p_main', 30, 34, p => { p.blob(15, 20, 10, 9, RAMP.brass); p.rect(13, 4, 4, 10, C.slate); wheel(p, 15, 6, 6, RAMP.red); });
  parts.main = { key: 'p_main', x: 44, y: 142, ox: 0.5, oy: 0.5, depth: 3 };
  part(scene, 'p_split', 30, 14, p => { p.cylH(0, 2, 30, 10, RAMP.copper); p.line(8, 6, 20, 8, C.ink); p.line(9, 5, 19, 9, C.umber); p.px(14, 7, C.cyan); });
  parts.split = { key: 'p_split', x: 160, y: 151, ox: 0.5, oy: 0.5, depth: 3 };
  part(scene, 'p_coupling', 34, 16, p => { p.rect(0, 1, 34, 14, C.gold); p.hline(0, 1, 34, C.yellow); p.hline(0, 14, 34, C.brown); p.rect(0, 0, 6, 16, C.silver); p.rect(28, 0, 6, 16, C.silver); p.rect(16, 1, 2, 14, C.flame); });
  parts.coupling = { key: 'p_coupling', x: 160, y: 151, ox: 0.5, oy: 0.5, depth: 4, hidden: true };
  part(scene, 'p_foam', 150, 18, p => { p.rect(0, 1, 150, 16, C.slate); p.hline(0, 1, 150, C.steel); p.hline(0, 12, 150, C.storm); for (let i = 20; i < 150; i += 30) p.vline(i, 1, 16, C.storm); });
  parts.foam = { key: 'p_foam', x: 170, y: 151, ox: 0.5, oy: 0.5, depth: 5, hidden: true };
  part(scene, 'p_light', 270, 300, p => { for (let y = 0; y < 300; y++) for (let x = 0; x < 270; x++) { const d = Math.hypot((x - 140) / 150, (y - 160) / 130); if (d > 0.8) p.px(x, y, d > 1.05 ? '#181425d0' : '#18142580'); } }, null);
  parts.light = { key: 'p_light', x: 0, y: 0, ox: 0, oy: 0, depth: 8 };
  return { bg: 'fx_crawl', parts, anchors: { main: { x: 44, y: 142, r: 26 }, split: { x: 160, y: 151, r: 28 }, ends: { x: 160, y: 151, r: 28 } } };
}

// ------------------------------------------------------------------ YARD / SEWER CLEANOUT
function yard(scene) {
  const bg = new PX(SW, SH);
  bg.rect(0, 0, SW, 120, C.sand); for (let j = 2; j < 120; j += 5) { bg.hline(0, j, SW, C.tan); bg.hline(0, j + 1, SW, C.white); }
  bg.rect(0, 116, SW, 8, C.slate); bg.rect(160, 20, 60, 50, C.forest); bg.vgrad(164, 24, 52, 42, [C.cyan, C.blue]); bg.box(159, 19, 62, 52, C.ink);
  bg.rect(0, 124, SW, 176, C.forest); bg.dither(0, 124, SW, 176, C.green, 0.3); for (let i = 0; i < 160; i++) bg.px((i * 53) % SW, 126 + (i * 37) % 170, i % 3 ? C.lime : C.deep);
  // cedar trunk & roots
  bg.cylV(0, 0, 48, 220, [C.umber, C.brown, C.clay, C.tan], 0.4); for (let j = 0; j < 220; j += 6) bg.hline(4 + (j % 12), j, 20, C.umber);
  for (const [x1, y1] of [[90, 240], [120, 200], [70, 280]]) bg.thick(40, 200, x1, y1, 5, C.brown);
  // cleanout stub
  bg.ellipse(140, 232, 22, 8, C.brown);
  bg.cylV(126, 196, 28, 36, RAMP.pvc); bg.ellipse(140, 196, 14, 4, C.white);
  bg.outline(C.ink);
  bg.toTexture(scene, 'fx_yard');
  const parts = {};
  part(scene, 'p_cap', 32, 20, p => { p.ellipse(16, 12, 15, 6, C.silver); p.ellipse(16, 11, 14, 5, C.white); p.bevel(10, 3, 12, 8, RAMP.pvc, null); });
  parts.cap = { key: 'p_cap', x: 140, y: 192, ox: 0.5, oy: 0.5, depth: 3 };
  return { bg: 'fx_yard', parts, anchors: { cap: { x: 140, y: 192, r: 28 }, screen: { x: 135, y: 110, r: 70, area: [50, 50, 170, 110] } } };
}

// ------------------------------------------------------------------ HOSE BIB (exterior)
function bib(scene) {
  const bg = new PX(SW, SH);
  bg.rect(0, 0, SW, 240, C.clay); for (let j = 0; j < 240; j += 8) { bg.hline(0, j, SW, C.brown); for (let i = (j / 8 % 2) * 12; i < SW; i += 24) bg.vline(i, j, 8, C.brown); }
  bg.dither(0, 0, SW, 240, C.rust, 0.1);
  bg.rect(0, 240, SW, 60, C.forest); bg.dither(0, 240, SW, 60, C.green, 0.3); for (let i = 0; i < SW; i += 12) bg.blob(i + 6, 244, 8, 7, RAMP.green);
  // inset: inside basement
  bg.rect(10, 20, 100, 90, C.ink); bg.rect(14, 24, 92, 82, C.slate); bg.dither(14, 24, 92, 82, C.storm, 0.3); pipeH(bg, 14, 62, 92, 8);
  bg.rect(12, 12, 70, 10, C.ink);
  // bib body protruding
  bg.rect(128, 134, 24, 24, C.silver); bg.box(128, 134, 24, 24, C.steel); bg.cylH(146, 140, 34, 12, RAMP.brass); bg.cylV(172, 146, 12, 24, RAMP.brass); bg.rect(170, 168, 16, 6, C.gold);
  bg.outline(C.ink);
  bg.toTexture(scene, 'fx_bib');
  const parts = {};
  part(scene, 'p_inside', 24, 24, p => wheel(p, 12, 12, 10, RAMP.red));
  parts.inside = { key: 'p_inside', x: 60, y: 66, ox: 0.5, oy: 0.5, depth: 3 };
  part(scene, 'p_bibhandle', 22, 22, p => wheel(p, 11, 11, 9, RAMP.chrome));
  parts.bibhandle = { key: 'p_bibhandle', x: 176, y: 128, ox: 0.5, oy: 0.5, depth: 4 };
  part(scene, 'p_packing', 16, 10, p => nut(p, 1, 1, 14, 8, RAMP.brass));
  parts.packing = { key: 'p_packing', x: 176, y: 140, ox: 0.5, oy: 0.5, depth: 3 };
  part(scene, 'p_stem', 90, 8, p => { p.cylH(0, 1, 84, 6, RAMP.chrome); p.rect(84, 0, 6, 8, C.ink); for (let i = 4; i < 80; i += 6) p.vline(i, 1, 6, C.steel); });
  parts.stem = { key: 'p_stem', x: 176, y: 138, ox: 0.05, oy: 0.5, depth: 2, angle: 0, hidden: true };
  return { bg: 'fx_bib', parts, anchors: { inside: { x: 60, y: 66, r: 26 }, bibhandle: { x: 176, y: 128, r: 24 }, packing: { x: 176, y: 140, r: 22 }, stem: { x: 180, y: 138, r: 26 }, stemTip: { x: 250, y: 138, r: 26 } } };
}

const BUILDERS = { toilet, sink, shower, basement, heater, sump, crawl, yard, bib };
export function buildFixture(scene, name, variant) { return BUILDERS[name](scene, variant); }
