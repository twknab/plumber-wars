// Sprites for the driving game, pickups, effects and UI chrome. All procedurally pixel-painted.
import { PX, rng } from '../core/pixel.js';
import { C, RAMP } from '../core/palette.js';

export function mk(scene, key, w, h, fn, { outline = C.ink, frames } = {}) {
  const p = new PX(w * (frames || 1), h);
  if (frames) { for (let f = 0; f < frames; f++) { const q = new PX(w, h); fn(q, f); if (outline) q.outline(outline); p.stamp(q, f * w, 0); } }
  else { fn(p); if (outline) p.outline(outline); }
  p.toTexture(scene, key, frames ? w : 0, frames ? h : 0);
  return p;
}

// ---------------------------------------------------------------- vehicles (top-down, facing up)
function carBody(p, x, y, w, h, ramp, { glass = RAMP.blue, roofLen = 0.36, hood = 0.26, lights = true, stripe } = {}) {
  // wheels
  const wy = [y + Math.round(h * 0.16), y + Math.round(h * 0.7)];
  for (const yy of wy) { p.rect(x - 1, yy, 2, Math.round(h * 0.16), C.ink); p.rect(x + w - 1, yy, 2, Math.round(h * 0.16), C.ink); }
  // body with cut corners
  p.cylV(x, y + 1, w, h - 2, ramp, 0.35); p.cylV(x + 1, y, w - 2, h, ramp, 0.35);
  if (stripe) { p.rect(x + Math.floor(w / 2) - 2, y, 1, h, stripe); p.rect(x + Math.floor(w / 2) + 1, y, 1, h, stripe); }
  // windshield
  const wsY = y + Math.round(h * hood), wsH = Math.max(3, Math.round(h * 0.12));
  p.poly([[x + 2, wsY + wsH], [x + w - 2, wsY + wsH], [x + w - 3, wsY], [x + 3, wsY]], glass[1]);
  p.dither(x + 2, wsY, w - 4, 2, glass[2], 0.6); p.px(x + 4, wsY + 1, C.white); p.px(x + 5, wsY + 1, glass[3]);
  // roof
  const rY = wsY + wsH, rH = Math.round(h * roofLen);
  p.cylV(x + 2, rY, w - 4, rH, ramp.slice(1), 0.35);
  // rear window
  p.rect(x + 3, rY + rH, w - 6, Math.max(2, Math.round(h * 0.07)), glass[0]);
  p.hline(x + 3, rY + rH, w - 6, glass[1]);
  if (lights) { p.rect(x + 1, y, 3, 2, C.yellow); p.rect(x + w - 4, y, 3, 2, C.yellow); p.rect(x + 1, y + h - 2, 3, 2, C.red); p.rect(x + w - 4, y + h - 2, 3, 2, C.red); }
  // mirrors
  p.rect(x - 2, wsY + 1, 2, 2, ramp[1]); p.rect(x + w, wsY + 1, 2, 2, ramp[1]);
  return { rY, rH };
}

function drawVan(p) { // G's Plumbing van 24x40
  const x = 3, y = 1, w = 18, h = 38;
  const r = carBody(p, x, y, w, h, [C.deep, C.forest, C.green, C.lime], { roofLen: 0.52, hood: 0.14, glass: RAMP.blue });
  // roof rack w/ ladder & pipes
  p.rect(x + 3, r.rY + 1, 1, r.rH - 2, C.silver); p.rect(x + w - 4, r.rY + 1, 1, r.rH - 2, C.silver);
  for (let j = r.rY + 2; j < r.rY + r.rH - 2; j += 3) p.hline(x + 3, j, w - 6, C.steel);
  p.rect(x + 6, r.rY + 2, 2, r.rH - 5, C.orange); p.vline(x + 6, r.rY + 2, r.rH - 5, C.tan);
  p.rect(x + 10, r.rY + 3, 2, r.rH - 7, C.white); p.vline(x + 11, r.rY + 3, r.rH - 7, C.silver);
  // gold side stripes
  p.vline(x, y + 6, h - 12, C.gold); p.vline(x + w - 1, y + 6, h - 12, C.gold);
  // "G" emblem on hood
  p.art(x + 7, y + 2, ['.###', '#...', '#.##', '#..#', '.###'], { '#': C.yellow });
}

function drawTruck(p) { // Northwest box truck 30x50
  const x = 3, y = 2, w = 24, h = 47;
  const ramp = [C.umber, C.crimson, C.red, C.pink];
  // cab
  for (const yy of [y + 6, y + 36]) { p.rect(x - 1, yy, 2, 8, C.ink); p.rect(x + w - 1, yy, 2, 8, C.ink); }
  p.cylV(x + 1, y, w - 2, 14, ramp, 0.35);
  p.poly([[x + 3, y + 10], [x + w - 3, y + 10], [x + w - 4, y + 5], [x + 4, y + 5]], C.navy);
  p.dither(x + 3, y + 5, w - 6, 2, C.blue, 0.6); p.px(x + 6, y + 6, C.white);
  p.rect(x + 1, y, 4, 2, C.yellow); p.rect(x + w - 5, y, 4, 2, C.yellow);
  p.rect(x - 2, y + 6, 2, 2, C.crimson); p.rect(x + w, y + 6, 2, 2, C.crimson);
  // box
  p.rect(x, y + 14, w, h - 14, C.ink);
  p.cylV(x, y + 15, w, h - 15, [C.slate, C.steel, C.silver, C.white], 0.35);
  // stripes + dents
  p.rect(x, y + 17, w, 2, C.red); p.rect(x, y + h - 5, w, 2, C.red);
  p.px(x + 4, y + 24, C.steel); p.px(x + 5, y + 25, C.slate); p.px(x + 17, y + 33, C.slate); p.px(x + 18, y + 32, C.steel);
  // giant fake plunger on the roof, lol
  p.ellipse(x + w / 2, y + 30, 6, 5, C.crimson); p.ellipse(x + w / 2 - 1, y + 29, 4, 3, C.red); p.px(x + w / 2 - 3, y + 27, C.pink);
  p.rect(x + w / 2 - 1, y + 20, 2, 9, C.clay); p.vline(x + w / 2 - 1, y + 20, 9, C.tan);
  p.rect(x + 1, y + h - 2, 4, 2, C.red); p.rect(x + w - 5, y + h - 2, 4, 2, C.red);
  // rust
  p.dither(x + 2, y + h - 10, 5, 4, C.clay, 0.3); p.dither(x + w - 7, y + 38, 4, 5, C.clay, 0.3);
}

const CAR_COLORS = [
  [C.navy, C.blue, C.cyan, C.white], [C.umber, C.crimson, C.red, C.pink], [C.brown, C.flame, C.gold, C.yellow],
  [C.night, C.storm, C.slate, C.steel], [C.slate, C.steel, C.silver, C.white], [C.plum, C.mauve, C.pink, C.peach], [C.deep, C.forest, C.green, C.lime],
];

export function buildDriveSprites(scene) {
  mk(scene, 'van', 24, 40, drawVan);
  mk(scene, 'truck', 30, 51, drawTruck);
  CAR_COLORS.forEach((ramp, i) => {
    mk(scene, 'car' + i, 20, 34, p => { carBody(p, 2, 1, 16, 32, ramp, {}); });
  });
  // Subaru wagon w/ roof box (very Seattle)
  mk(scene, 'wagon', 20, 38, p => { const r = carBody(p, 2, 1, 16, 36, [C.deep, C.forest, C.green, C.lime], { roofLen: 0.46 }); p.rect(5, r.rY + 3, 10, r.rH - 6, C.night); p.rect(6, r.rY + 4, 8, 2, C.storm); });
  // Metro-style articulated bus
  mk(scene, 'bus', 30, 84, p => {
    const x = 2, w = 26;
    for (const yy of [8, 36, 66]) { p.rect(x - 1, yy, 2, 9, C.ink); p.rect(x + w - 1, yy, 2, 9, C.ink); }
    p.cylV(x, 1, w, 40, [C.brown, C.flame, C.gold, C.yellow], 0.35); p.cylV(x, 44, w, 39, [C.brown, C.flame, C.gold, C.yellow], 0.35);
    p.rect(x + 3, 40, w - 6, 5, C.ink); for (let i = 0; i < 5; i++) p.hline(x + 3, 40 + i, w - 6, i % 2 ? C.night : C.storm);
    p.rect(x + 2, 2, w - 4, 4, C.navy); p.dither(x + 2, 2, w - 4, 2, C.blue, 0.6);
    for (let j = 10; j < 80; j += 8) { if (j > 36 && j < 48) continue; p.rect(x + 4, j, w - 8, 4, [C.silver, C.white][j % 16 ? 0 : 1]); p.rect(x + 4, j + 3, w - 8, 1, C.steel); }
    p.rect(x + 3, 16, w - 6, 3, C.storm); p.rect(x + 3, 60, w - 6, 3, C.storm);
    p.rect(x + 1, 0, 4, 2, C.white); p.rect(x + w - 5, 0, 4, 2, C.white); p.rect(x + 1, 82, 4, 2, C.red); p.rect(x + w - 5, 82, 4, 2, C.red);
  });
  // cyclist (2 frames)
  mk(scene, 'cyclist', 12, 22, (p, f) => {
    p.vline(6, 1, 5, C.ink); p.vline(6, 15, 6, C.ink); p.rect(5, 1, 3, 1, C.slate); p.rect(5, 20, 3, 1, C.slate);
    p.rect(2, 6, 9, 1, C.steel); // handlebar
    p.ellipse(6.5, 11, 3, 4, C.lime); p.dither(4, 9, 5, 5, C.green, 0.4); // jersey (neon, of course)
    p.ellipse(6.5, 8, 2.2, 2.2, C.hot); p.px(6, 7, C.pink); // helmet
    p.px(3, 7, C.peach); p.px(10, 7, C.peach); p.line(3, 7, 4, 10, C.lime); p.line(10, 7, 9, 10, C.lime);
    if (f) { p.rect(4, 14, 2, 3, C.ink); p.rect(8, 13, 2, 2, C.ink); } else { p.rect(4, 13, 2, 2, C.ink); p.rect(8, 14, 2, 3, C.ink); }
  }, { frames: 2 });
  // scooter rider
  mk(scene, 'scooter', 10, 20, (p, f) => { p.vline(5, 1, 18, C.storm); p.rect(3, 2, 5, 1, C.slate); p.rect(4, 8, 3, 8, C.gold); p.ellipse(5.5, 8, 2.5, 3, C.navy); p.ellipse(5.5, 6, 2, 2, C.brown); p.px(3 + f, 3, C.peach); }, { frames: 2 });
  // raccoon (2 frames)
  mk(scene, 'raccoon', 16, 10, (p, f) => {
    p.ellipse(8, 5, 5, 3.5, C.slate); p.dither(4, 3, 8, 4, C.steel, 0.35);
    p.ellipse(13, 4, 2.5, 2.5, C.steel); p.px(13, 4, C.ink); p.px(14, 4, C.ink); p.px(15, 4, C.ink);
    for (let i = 0; i < 4; i++) p.px(1 + i, 5 + (i % 2), i % 2 ? C.ink : C.steel); p.px(0, 5, C.ink);
    const k = f ? 1 : 0; p.px(5 + k, 8, C.ink); p.px(10 - k, 8, C.ink); p.px(5 - k, 2, C.ink); p.px(10 + k, 2, C.ink);
  }, { frames: 2 });

  // hazards
  mk(scene, 'pothole', 22, 14, p => { p.ellipse(11, 7, 10, 6, C.storm); p.ellipse(11, 7.5, 8, 4.5, C.ink); p.ellipse(10, 8, 5, 2.5, C.night); p.px(4, 4, C.slate); p.px(16, 11, C.slate); p.px(18, 5, C.steel); }, { outline: null });
  mk(scene, 'puddle', 30, 16, p => { p.ellipse(15, 8, 14, 7, C.navy); p.ellipse(14, 7.5, 12, 5.5, C.blue); p.dither(6, 4, 16, 5, C.cyan, 0.35); p.hline(9, 5, 6, C.white); p.hline(18, 10, 4, C.cyan); }, { outline: null });
  mk(scene, 'oil', 26, 16, p => { p.ellipse(13, 8, 12, 7, C.ink); p.ring(12, 8, 8, 4, C.plum); p.ring(12, 8, 6, 3, C.navy); p.ring(12, 8, 4, 2, C.forest); p.px(9, 6, C.mauve); }, { outline: null });
  mk(scene, 'cone', 12, 12, p => { p.rect(1, 1, 10, 10, C.flame); p.blob(6, 6, 4.5, 4.5, [C.rust, C.flame, C.gold]); p.ring(6, 6, 3, 3, C.white); p.px(6, 6, C.white); p.px(5, 5, C.yellow); });
  mk(scene, 'barrier', 44, 12, p => {
    p.rect(1, 3, 42, 6, C.white); for (let i = 0; i < 42; i += 8) p.poly([[1 + i, 9], [5 + i, 9], [9 + i, 3], [5 + i, 3]], C.flame);
    p.hline(1, 3, 42, C.silver); p.hline(1, 8, 42, C.steel); p.rect(2, 9, 3, 2, C.storm); p.rect(39, 9, 3, 2, C.storm);
    p.ellipse(4, 2, 2, 2, C.yellow); p.ellipse(40, 2, 2, 2, C.yellow);
  });
  mk(scene, 'manhole', 16, 16, p => { p.ellipse(8, 8, 7, 7, C.storm); p.ring(8, 8, 7, 7, C.night); for (let j = 3; j < 14; j += 2) p.hline(4, j, 8, C.night); p.ring(8, 8, 5, 5, C.slate); }, { outline: null });
  // thrown junk
  mk(scene, 'turd', 12, 11, p => { p.ellipse(6, 8.5, 5, 2.5, C.brown); p.ellipse(6, 6, 3.8, 2, C.clay); p.ellipse(6, 3.5, 2.5, 1.8, C.brown); p.px(6, 1, C.clay); p.px(4, 5, C.tan); p.px(3, 8, C.tan); p.px(5, 7, C.umber); p.px(7, 7, C.umber); });
  mk(scene, 'tp', 12, 12, p => { p.blob(6, 6, 5, 5, RAMP.porcelain); p.ellipse(6, 6, 1.8, 1.8, C.clay); p.ring(6, 6, 3.2, 3.2, C.silver); });
  mk(scene, 'plungerJunk', 12, 16, p => { p.rect(5, 0, 2, 9, C.clay); p.vline(5, 0, 9, C.tan); p.blob(6, 11, 5, 4, RAMP.red); });
  mk(scene, 'wrenchJunk', 14, 14, p => { p.thick(3, 11, 10, 4, 2, C.steel); p.ellipse(11, 3, 2.5, 2.5, C.silver); p.px(12, 2, C.night); p.ellipse(3, 11, 2, 2, C.silver); });
  // pickups
  mk(scene, 'coffee', 12, 16, p => {
    p.poly([[2, 4], [10, 4], [9, 15], [3, 15]], C.white); p.poly([[2, 4], [5, 4], [4.5, 15], [3, 15]], C.silver);
    p.rect(2, 8, 8, 4, C.clay); p.hline(2, 8, 8, C.tan); p.rect(1, 2, 10, 2, C.umber); p.hline(1, 2, 10, C.brown);
    p.px(5, 0, C.silver); p.px(7, 1, C.silver); p.px(6, 1, C.white);
  });
  mk(scene, 'kit', 16, 12, p => { p.bevel(1, 3, 14, 8, RAMP.red, null); p.rect(5, 1, 6, 2, C.crimson); p.rect(7, 5, 2, 5, C.white); p.rect(5, 6, 6, 2, C.white); });
  mk(scene, 'cash', 16, 10, p => { p.rect(1, 1, 14, 8, C.green); p.box(1, 1, 14, 8, C.forest); p.ellipse(8, 5, 2.5, 2.5, C.lime); p.px(8, 5, C.forest); p.px(3, 3, C.lime); p.px(12, 6, C.lime); });

  // effects
  mk(scene, 'puff', 10, 10, (p, f) => { const r = 2 + f; p.blob(5, 5, r, r, [C.steel, C.silver, C.white]); }, { frames: 4, outline: null });
  mk(scene, 'spark', 6, 6, p => { p.px(3, 0, C.yellow); p.px(3, 5, C.yellow); p.px(0, 3, C.yellow); p.px(5, 3, C.yellow); p.rect(2, 2, 2, 2, C.white); }, { outline: null });
  mk(scene, 'drop', 4, 6, p => { p.px(1, 0, C.cyan); p.rect(1, 1, 2, 2, C.cyan); p.rect(0, 3, 4, 2, C.blue); p.px(1, 3, C.white); p.rect(1, 5, 2, 1, C.navy); }, { outline: null });
  mk(scene, 'rain', 2, 8, p => { p.vline(1, 0, 8, C.silver); p.vline(0, 2, 5, C.steel); }, { outline: null });
  mk(scene, 'dot', 2, 2, p => p.rect(0, 0, 2, 2, C.white), { outline: null });
  mk(scene, 'gunk', 4, 4, p => { p.rect(0, 0, 4, 4, C.brown); p.px(0, 0, C.clay); p.px(3, 3, C.umber); }, { outline: null });
  mk(scene, 'headlight', 60, 90, p => { for (let j = 0; j < 90; j++) { const w = 6 + j * 0.55; for (let i = 0; i < 60; i++) { const d = Math.abs(i - 30); if (d < w / 2) p.px(i, 89 - j, (j + i) % 3 ? '#fee76130' : '#fee76120'); } } }, { outline: null });
  mk(scene, 'shadow', 30, 50, p => { p.rect(2, 2, 26, 46, '#18142560'); }, { outline: null });

  buildRoadside(scene);
}

// ---------------------------------------------------------------- roadside scenery (top-down)
function buildRoadside(scene) {
  // evergreen (Douglas fir) from above
  [0, 1, 2].forEach(v => mk(scene, 'fir' + v, 34, 34, p => {
    const R = rng(v + 3); const cx = 17, cy = 17;
    for (let k = 0; k < 3; k++) {
      const r = 15 - k * 4.5; const pts = [];
      for (let a = 0; a < 16; a++) { const ang = a / 16 * Math.PI * 2; const rr = a % 2 ? r * (0.62 + R() * 0.1) : r; pts.push([cx + Math.cos(ang + k * 0.3) * rr, cy + Math.sin(ang + k * 0.3) * rr]); }
      p.poly(pts, [C.deep, C.forest, C.green][k]);
    }
    p.dither(6, 6, 14, 12, C.green, 0.18); p.ellipse(cx - 2, cy - 2, 2, 2, C.lime); p.px(cx, cy, C.lime);
  }));
  mk(scene, 'maple', 30, 30, p => { p.blob(15, 15, 13, 13, [C.deep, C.forest, C.green, C.lime]); for (let i = 0; i < 12; i++) { const a = i * 0.52; p.ellipse(15 + Math.cos(a) * 11, 15 + Math.sin(a) * 11, 3, 3, C.forest); } p.blob(12, 12, 6, 6, [C.forest, C.green, C.lime]); });
  mk(scene, 'mapleFall', 30, 30, p => { p.blob(15, 15, 13, 13, [C.brown, C.rust, C.flame, C.gold]); for (let i = 0; i < 12; i++) { const a = i * 0.52; p.ellipse(15 + Math.cos(a) * 11, 15 + Math.sin(a) * 11, 3, 3, C.rust); } p.blob(12, 12, 6, 6, [C.flame, C.gold, C.yellow]); });
  mk(scene, 'bush', 16, 14, p => { p.blob(8, 7, 7, 6, RAMP.green); p.px(5, 4, C.lime); p.px(10, 6, C.pink); p.px(6, 9, C.pink); });
  mk(scene, 'lamp', 14, 6, p => { p.rect(0, 2, 11, 2, C.slate); p.ellipse(11, 3, 2.5, 2.5, C.yellow); p.ellipse(1, 3, 1.5, 1.5, C.storm); });
  mk(scene, 'hydrant', 8, 8, p => { p.blob(4, 4, 3.5, 3.5, RAMP.red); p.px(3, 3, C.pink); });
  mk(scene, 'bench', 8, 18, p => { p.bevel(1, 1, 6, 16, RAMP.wood, null); for (let j = 3; j < 16; j += 3) p.hline(1, j, 6, C.brown); });
  // rooftops (gabled, from above) in several colours
  const ROOFS = [[C.umber, C.brown, C.clay], [C.night, C.storm, C.slate], [C.deep, C.forest, C.green], [C.umber, C.crimson, C.red], [C.ink, C.night, C.storm]];
  ROOFS.forEach((r, i) => mk(scene, 'roof' + i, 46, 56, p => {
    p.rect(2, 2, 42, 52, r[0]);
    for (let j = 2; j < 54; j++) { p.rect(3, j, 20, 1, j % 3 ? r[2] : r[1]); p.rect(23, j, 20, 1, j % 3 ? r[1] : r[0]); }
    p.vline(22, 2, 52, r[2]); p.vline(23, 2, 52, r[0]); p.rect(30, 12, 6, 6, C.clay); p.box(30, 12, 6, 6, C.brown); p.rect(31, 13, 4, 2, C.ink);
    p.dither(3, 2, 20, 52, C.forest, 0.06); // moss. it's Seattle.
  }));
  mk(scene, 'espresso', 34, 26, p => {
    p.rect(2, 4, 30, 20, C.brown); p.bevel(3, 5, 28, 18, RAMP.wood, null);
    for (let i = 3; i < 31; i += 4) p.rect(i, 2, 2, 4, i % 8 === 3 ? C.red : C.white);
    p.rect(8, 10, 18, 6, C.ink); p.art(9, 11, ['#..#.###.###.###', '#..#.#.#.#.#.#..', '###..###.###.###'], { '#': C.gold });
  });
  mk(scene, 'fence', 8, 32, p => { p.rect(2, 0, 4, 32, C.clay); for (let j = 0; j < 32; j += 4) p.hline(2, j, 4, C.brown); p.vline(2, 0, 32, C.tan); });
  mk(scene, 'house_top_dest', 56, 60, p => { p.rect(2, 2, 52, 56, C.clay); });
}

// ---------------------------------------------------------------- UI chrome
export function buildUI(scene) {
  // 9-slice panel (24x24, 8px corners) — dark steel with gold rivets
  mk(scene, 'panel', 24, 24, p => {
    p.rect(0, 0, 24, 24, C.ink); p.rect(1, 1, 22, 22, C.night); p.rect(2, 2, 20, 20, C.night);
    p.hline(1, 1, 22, C.storm); p.vline(1, 1, 22, C.storm); p.hline(1, 22, 22, C.ink); p.vline(22, 1, 22, C.ink);
    for (const [x, y] of [[3, 3], [19, 3], [3, 19], [19, 19]]) { p.rect(x, y, 2, 2, C.gold); p.px(x, y, C.yellow); }
  }, { outline: null });
  mk(scene, 'panelLight', 24, 24, p => {
    p.rect(0, 0, 24, 24, C.ink); p.rect(1, 1, 22, 22, C.sand); p.hline(1, 1, 22, C.white); p.vline(1, 1, 22, C.white); p.hline(1, 22, 22, C.tan); p.vline(22, 1, 22, C.tan);
  }, { outline: null });
  const btn = (key, ramp) => mk(scene, key, 24, 24, p => {
    p.rect(0, 0, 24, 24, C.ink); p.rect(1, 1, 22, 21, ramp[2]); p.rect(1, 21, 22, 2, ramp[0]);
    p.hline(2, 1, 20, ramp[3]); p.vline(1, 2, 18, ramp[3]); p.vline(22, 2, 19, ramp[1]); p.hline(2, 20, 20, ramp[1]);
  }, { outline: null });
  btn('btnGold', [C.brown, C.flame, C.gold, C.yellow]); btn('btnRed', [C.umber, C.crimson, C.red, C.pink]);
  btn('btnGreen', [C.deep, C.forest, C.green, C.lime]); btn('btnBlue', [C.night, C.navy, C.blue, C.cyan]); btn('btnGrey', [C.night, C.storm, C.slate, C.steel]);
  mk(scene, 'bubble', 24, 24, p => { p.rect(1, 1, 22, 22, C.white); p.rect(0, 2, 24, 20, C.white); p.rect(2, 0, 20, 24, C.white); p.hline(2, 22, 20, C.silver); }, { outline: C.ink });
  // icons 9x9
  const ic = (key, rows, map) => mk(scene, key, rows[0].length + 2, rows.length + 2, p => p.art(1, 1, rows, map));
  ic('iHeart', ['.##.##.', '#######', '#######', '.#####.', '..###..', '...#...'], { '#': C.red });
  ic('iHeartE', ['.##.##.', '#######', '#######', '.#####.', '..###..', '...#...'], { '#': C.storm });
  ic('iStar', ['...#...', '..###..', '#######', '.#####.', '.##.##.', '#.....#'], { '#': C.gold });
  ic('iStarE', ['...#...', '..###..', '#######', '.#####.', '.##.##.', '#.....#'], { '#': C.storm });
  ic('iClock', ['.#####.', '#..#..#', '#..#..#', '#..##.#', '#.....#', '.#####.'], { '#': C.white });
  ic('iCup', ['.#.#..', '######', '#ww#.#', '#ww###', '.##...'], { '#': C.white, w: C.clay });
  ic('iPause', ['##.##', '##.##', '##.##', '##.##', '##.##'], { '#': C.white });
  ic('iSound', ['...#...', '..##.#.', '####..#', '####..#', '..##.#.', '...#...'], { '#': C.white });
  ic('iMute', ['...#....', '..##....', '####.#.#', '####..#.', '..##.#.#', '...#....'], { '#': C.steel });
  ic('iLock', ['.###.', '#...#', '#####', '##.##', '#####'], { '#': C.steel });
  ic('iPin', ['.###.', '#####', '##.##', '#####', '.###.', '..#..'], { '#': C.red });
  ic('iVan', ['.#####..', '########', '#.####.#', '.#....#.'], { '#': C.lime });
  ic('iTruck', ['######..', '########', '#.####.#', '.#....#.'], { '#': C.red });
  ic('iHouse', ['...#...', '..###..', '.#####.', '#######', '.##.##.', '.##.##.'], { '#': C.gold });
  ic('iArrowU', ['..#..', '.###.', '#####', '..#..', '..#..'], { '#': C.white });
  ic('iWrench', ['.#.#', '.###', '..#.', '.#..', '#...'], { '#': C.silver });
}
