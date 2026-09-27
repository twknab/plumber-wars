// Procedural 16-bit portraits (48x48) with moods, plus tiny full-body sprites for scenes.
import { PX } from '../core/pixel.js';
import { C } from '../core/palette.js';

const SKIN = {
  fair: [C.clay, C.tan, C.peach, C.sand], light: [C.brown, C.skin, C.tan, C.peach], ruddy: [C.rust, C.clay, C.pink, C.peach],
  tan: [C.brown, C.clay, C.skin, C.tan], brown: [C.umber, C.brown, C.clay, C.skin], dark: [C.ink, C.umber, C.brown, C.clay],
};
const HAIR = {
  brown: [C.umber, C.brown, C.clay], black: [C.ink, C.night, C.storm], blond: [C.flame, C.gold, C.yellow], ginger: [C.brown, C.rust, C.orange],
  white: [C.steel, C.silver, C.white], grey: [C.slate, C.steel, C.silver], salt: [C.storm, C.steel, C.silver], beach: [C.umber, C.brown, C.clay], purple: [C.plum, C.mauve, C.pink], pink: [C.crimson, C.hot, C.pink],
};
const shade = (hex, k) => { const n = parseInt(hex.slice(1), 16); const f = c => Math.max(0, Math.min(255, Math.round(c * k))); return '#' + [n >> 16, (n >> 8) & 255, n & 255].map(f).map(v => v.toString(16).padStart(2, '0')).join(''); };

export function drawPortrait(look, mood = 'happy') {
  const S = 48, p = new PX(S, S);
  const sk = SKIN[look.skin] || SKIN.light, hr = HAIR[look.hair] || HAIR.brown;
  const shirt = look.shirt || C.blue; const sh = [shade(shirt, 0.55), shade(shirt, 0.8), shirt, shade(shirt, 1.25)];
  const cx = 24, cy = 22;
  const style = look.style;
  // back hair (long styles)
  if (['long', 'mullet', 'bighair', 'afro', 'bob'].includes(style)) {
    if (style === 'long') p.rect(12, 14, 24, 26, hr[1]);
    if (style === 'mullet') { p.rect(14, 22, 20, 14, hr[1]); p.dither(14, 30, 20, 6, hr[2], 0.3); }
    if (style === 'bighair') { p.blob(24, 18, 18, 17, hr); }
    if (style === 'afro') { p.blob(24, 15, 17, 15, hr); for (let i = 0; i < 40; i++) p.px(8 + (i * 7) % 32, 2 + (i * 5) % 26, hr[0]); }
    if (style === 'bob') p.rect(13, 12, 22, 20, hr[1]);
  }
  if (style === 'perm') for (let i = 0; i < 30; i++) p.blob(12 + (i * 5) % 25, 6 + Math.floor(i / 5) * 3 - (i % 5 === 2 ? 1 : 0), 3.2, 3.2, hr);
  // shoulders / shirt
  if (look.jacked) { // huge delts + tank top
    p.poly([[0, 48], [2, 36], [10, 30], [20, 31], [28, 31], [38, 30], [46, 36], [48, 48]], sk[1]);
    p.blob(8, 38, 8, 8, sk); p.blob(40, 38, 8, 8, sk); p.shade(0, 42, 48, 6, sk[0], 0.4);
    if (look.shirtless) { // pecs, chest hair, and a fir-tree tattoo on the arm
      p.hline(16, 43, 7, sk[0]); p.hline(26, 43, 7, sk[0]); p.px(15, 42, sk[0]); p.px(33, 42, sk[0]); p.vline(24, 38, 6, sk[0]);
      for (let i = 0; i < 22; i++) { const h = Math.sin(i * 12.9898) * 43758.5453, r1 = h - Math.floor(h), h2 = Math.sin(i * 78.233) * 12543.21, r2 = h2 - Math.floor(h2); p.px(18 + Math.floor(r1 * 13), 37 + Math.floor(r2 * 10), i % 3 ? sk[0] : hr[0]); }
      p.px(16, 44, sk[0]); p.px(32, 44, sk[0]);
      p.px(42, 37, C.forest); p.hline(41, 38, 3, C.forest); p.hline(40, 39, 5, C.deep); p.hline(41, 40, 3, C.forest); p.hline(40, 41, 5, C.deep); p.px(42, 42, C.brown);
    } else {
      p.poly([[14, 48], [16, 34], [20, 32], [28, 32], [32, 34], [34, 48]], look.shirt); p.rect(16, 30, 3, 6, look.shirt); p.rect(29, 30, 3, 6, look.shirt);
      p.line(19, 40, 29, 40, sh[1]); p.vline(24, 40, 8, sh[1]);
    }
  } else {
  p.poly([[4, 48], [9, 36], [18, 32], [30, 32], [39, 36], [44, 48]], sh[2]);
  p.poly([[4, 48], [9, 36], [14, 34], [12, 48]], sh[1]); p.poly([[44, 48], [39, 36], [36, 35], [37, 48]], sh[1]);
  p.hline(18, 32, 12, sh[3]);
  if (look.vest) { p.poly([[9, 48], [12, 36], [19, 33], [20, 48]], C.storm); p.poly([[39, 48], [36, 36], [29, 33], [28, 48]], C.storm); }
  if (look.camo) { for (let i = 0; i < 18; i++) p.ellipse(6 + (i * 13) % 36, 36 + (i * 7) % 11, 2, 1.5, i % 2 ? C.forest : C.brown); }
  }
  if (style === 'wavy') { // long wavy salt-and-pepper hair past the shoulders
    for (const side of [-1, 1]) {
      const x0 = side < 0 ? 9 : 31;
      const xin = side < 0 ? 16 : 32; // inner edge hugs the jaw
      for (let y = 12; y < 44; y++) { const wave = Math.round(Math.sin(y / 2.6 + (side < 0 ? 0 : 1.3)) * 1.5); const outer = side < 0 ? 9 + wave : 39 + wave; const a = Math.min(outer, xin), b = Math.max(outer, xin); p.hline(a, y, b - a, hr[1]); }
      for (let k = 0; k < 3; k++) { let x = (side < 0 ? 11 : 34) + k * 2; for (let y = 13; y < 43; y++) { x += Math.sin(y / 3 + k) * 0.4; p.px(x, y, (k + y) % 6 === 0 ? hr[0] : k === 1 ? C.tan : hr[2]); } }
    }
  }
  // neck
  p.rect(20, 28, 8, 6, sk[1]); p.hline(20, 33, 8, sk[0]);
  // collar / workwear name patch
  if (!look.vest && !look.bowtie && !look.pearls && !look.jacked) { p.poly([[18, 32], [24, 38], [22, 32]], sh[3]); p.poly([[30, 32], [24, 38], [26, 32]], sh[3]); }
  if (look.bowtie) { p.poly([[19, 34], [24, 36], [19, 38]], C.red); p.poly([[29, 34], [24, 36], [29, 38]], C.red); p.rect(23, 35, 2, 2, C.crimson); p.poly([[18, 32], [24, 35], [22, 32]], C.white); p.poly([[30, 32], [24, 35], [26, 32]], C.white); }
  if (look.pearls) for (let i = 0; i < 7; i++) p.px(19 + i * 1.6, 34 + Math.sin(i / 6 * Math.PI) * 2, C.white);
  if (look.patch) { p.ellipse(33, 41, 5, 4, C.ink); p.ellipse(33, 41, 4, 3, C.forest); p.ring(33, 41, 4, 3, C.gold); p.art(32, 39, ['##', '#.', '##'], { '#': C.yellow }); p.px(33, 40, C.yellow); }
  // head
  p.blob(cx, cy, 10.5, 12, sk, -0.35, -0.3);
  p.ellipse(13.5, 22, 2, 3, sk[1]); p.ellipse(34.5, 22, 2, 3, sk[1]); p.px(13, 22, sk[0]); p.px(35, 22, sk[0]);
  // jaw shadow
  p.shade(16, 30, 16, 4, sk[0], 0.35);
  // eyes
  const angry = mood === 'angry' || mood === 'yell', worried = mood === 'worried', happy = mood === 'happy' || mood === 'smug';
  const ey = 21;
  for (const ex of [19, 28]) {
    if (happy && mood === 'happy') { p.hline(ex, ey + 1, 3, C.ink); p.px(ex - 1, ey + 2, C.ink); p.px(ex + 3, ey + 2, C.ink); }
    else { p.rect(ex, ey, 3, 3, C.white); p.rect(ex + (ex < 24 ? 1 : 0), ey + 1, 2, 2, C.ink); if (mood === 'yell') p.rect(ex + 1, ey + 1, 1, 1, C.ink); }
  }
  // brows
  const bc = look.hair === 'white' || look.hair === 'grey' ? C.slate : hr[0];
  if (angry) { p.line(18, 17, 22, 19, bc); p.line(18, 18, 22, 20, bc); p.line(30, 17, 26, 19, bc); p.line(30, 18, 26, 20, bc); }
  else if (worried) { p.line(18, 19, 22, 17, bc); p.line(30, 19, 26, 17, bc); }
  else { p.hline(18, 18, 5, bc); p.hline(26, 18, 5, bc); }
  // nose
  p.vline(24, 22, 4, sk[1]); p.px(23, 26, sk[0]); p.px(25, 26, sk[0]); p.px(22, 23, sk[3]);
  // cheeks
  if (happy) { p.px(17, 25, C.pink); p.px(31, 25, C.pink); }
  if (look.skin === 'ruddy' || angry) { p.dither(16, 24, 3, 2, C.red, 0.5); p.dither(30, 24, 3, 2, C.red, 0.5); p.px(24, 25, C.red); }
  // mouth
  const my = 29, lip = look.lipstick ? C.hot : C.umber;
  if (mood === 'happy') { p.hline(21, my, 7, lip); p.rect(22, my + 1, 5, 1, C.white); p.hline(22, my + 2, 5, lip); p.px(20, my - 1, lip); p.px(28, my - 1, lip); }
  else if (mood === 'smug') { p.hline(22, my, 5, lip); p.px(27, my - 1, lip); p.px(28, my - 2, lip); }
  else if (mood === 'neutral') { p.hline(22, my, 5, lip); }
  else if (mood === 'worried') { p.hline(22, my + 1, 5, lip); p.px(21, my + 2, lip); p.px(27, my + 2, lip); p.px(22, my, lip); }
  else if (mood === 'angry') { p.rect(21, my - 1, 7, 3, C.ink); p.hline(22, my - 1, 5, C.white); p.hline(22, my + 1, 5, C.white); p.px(24, my, C.ink); }
  else if (mood === 'yell') { p.ellipse(24.5, my + 1, 4, 3.2, C.ink); p.hline(22, my - 2, 6, C.white); p.ellipse(24.5, my + 2.5, 2, 1, C.red); }
  // beard
  const bd = look.beard;
  if (bd === 'stubble') p.dither(16, 26, 17, 8, hr[0], 0.3);
  if (bd === 'scruff') { // grey scruff + mustache
    for (let i = 0; i < 46; i++) { const h = Math.sin(i * 91.7) * 43758.5453, r1 = h - Math.floor(h), h2 = Math.sin(i * 17.3) * 24634.6345, r2 = h2 - Math.floor(h2); const x = 16 + Math.floor(r1 * 17), y = 27 + Math.floor(r2 * 7); if (Math.abs(x - 24.5) > 3 || y > 30) p.px(x, y, i % 3 ? hr[1] : hr[2]); }
    p.hline(20, 27, 9, hr[1]); p.px(19, 28, hr[1]); p.px(29, 28, hr[1]); p.hline(21, 26, 7, hr[2]);
    p.hline(23, 32, 3, hr[1]); p.px(24, 33, hr[1]);
  }
  if (bd === 'full' || bd === 'lumber' || bd === 'viking') {
    const len = bd === 'viking' ? 12 : bd === 'lumber' ? 9 : 6;
    p.poly([[14, 22], [16, 30], [20, 34 + len * 0.3], [24, 34 + len * 0.6], [28, 34 + len * 0.3], [32, 30], [34, 22], [32, 27], [28, 28], [20, 28], [16, 27]], hr[1]);
    for (let k = 0; k < 7; k++) { const bx = 17 + k * 2.3; p.vline(bx, 29 + (k % 2), 3 + len * 0.4, hr[0]); } p.hline(18, 27, 12, hr[2]); p.px(16, 25, hr[2]); p.px(32, 25, hr[0]);
    if (bd === 'viking') { p.rect(20, 40, 2, 5, hr[1]); p.rect(26, 40, 2, 5, hr[1]); p.px(20, 42, C.gold); p.px(26, 42, C.gold); }
    // reopen mouth
    if (mood === 'yell') { p.ellipse(24.5, my + 1, 4, 3.2, C.ink); p.hline(22, my - 2, 6, C.white); p.ellipse(24.5, my + 2.5, 2, 1, C.red); }
    else if (mood === 'angry') { p.rect(21, my - 1, 7, 3, C.ink); p.hline(22, my - 1, 5, C.white); p.hline(22, my + 1, 5, C.white); }
    else p.hline(22, my, 5, C.umber);
  }
  if (bd === 'stache') { p.poly([[18, 28], [21, 26], [24, 27], [27, 26], [30, 28], [29, 29], [24, 28], [19, 29]], hr[1]); p.hline(20, 26, 8, hr[2]); p.px(18, 29, hr[0]); p.px(30, 29, hr[0]); }
  if (bd === 'goatee') { p.rect(22, my + 2, 5, 4, hr[1]); p.hline(21, my - 2, 7, hr[1]); p.px(23, my + 5, hr[0]); }
  // hair / hats
  const H = (pts, c) => p.poly(pts, c);
  switch (style) {
    case 'cap': H([[12, 16], [14, 8], [22, 5], [30, 6], [36, 12], [36, 16]], look.shirt || C.gold); p.rect(12, 15, 25, 2, shade(look.shirt || C.gold, 0.6)); H([[12, 15], [4, 18], [6, 19], [14, 17]], shade(look.shirt || C.gold, 0.7)); p.px(22, 9, C.white); p.rect(13, 17, 2, 5, hr[1]); p.rect(34, 17, 2, 4, hr[1]); break;
    case 'backcap': H([[13, 16], [14, 8], [22, 5], [30, 6], [35, 12], [35, 16]], C.red); p.rect(34, 12, 6, 3, C.crimson); p.rect(13, 15, 23, 1, C.crimson); break;
    case 'trucker': H([[12, 16], [13, 6], [24, 3], [35, 6], [36, 16]], C.white); H([[12, 16], [13, 6], [18, 5], [18, 16]], C.red); H([[31, 5], [35, 6], [36, 16], [31, 16]], C.red); p.rect(11, 15, 27, 2, C.crimson); H([[12, 16], [22, 19], [34, 16]], C.crimson); p.art(20, 8, ['#.#.#.#', '##..#.#', '#.#.###'], { '#': C.red }); p.rect(13, 17, 2, 6, hr[1]); p.rect(33, 17, 2, 6, hr[1]); break;
    case 'beanie': p.blob(24, 13, 12, 9, [shade(look.shirt, 0.5), shade(look.shirt, 0.7), look.shirt]); p.rect(12, 14, 24, 4, shade(look.shirt, 0.6)); for (let i = 13; i < 36; i += 2) p.vline(i, 14, 4, shade(look.shirt, 0.45)); p.ellipse(24, 4, 3, 2, C.white); break;
    case 'swoop': H([[13, 20], [13, 11], [18, 6], [28, 5], [35, 9], [36, 18], [33, 13], [26, 12], [20, 14], [15, 18]], hr[1]); p.dither(15, 6, 18, 6, hr[2], 0.4); H([[20, 6], [34, 6], [37, 11], [30, 9]], hr[2]); break;
    case 'manbun': H([[13, 20], [13, 11], [20, 7], [30, 7], [35, 11], [35, 20], [32, 13], [16, 13]], hr[1]); p.blob(24, 5, 4, 3.5, hr); break;
    case 'bald': p.ellipse(21, 12, 3, 1.5, sk[3]); p.px(20, 11, C.white); p.rect(13, 17, 2, 6, hr[1]); p.rect(34, 17, 2, 6, hr[1]); break;
    case 'buzz': p.dither(14, 9, 20, 9, hr[1], 0.65); p.hline(15, 9, 18, hr[1]); break;
    case 'bun': H([[13, 19], [14, 11], [20, 8], [29, 8], [34, 11], [35, 19], [31, 13], [17, 13]], hr[1]); p.blob(24, 6, 5, 4, hr); p.dither(16, 9, 16, 4, hr[2], 0.4); break;
    case 'perm': for (let i = 0; i < 7; i++) p.blob(15 + i * 3, 11 - (i % 2), 2.6, 2.6, hr); break;
    case 'updo': H([[13, 19], [14, 11], [20, 7], [29, 7], [34, 11], [35, 19], [31, 12], [17, 12]], hr[1]); p.blob(24, 4, 7, 4, hr); p.dither(16, 8, 16, 4, hr[2], 0.4); break;
    case 'wavy': H([[12, 22], [13, 10], [18, 5], [26, 4], [33, 6], [37, 12], [36, 24], [33, 15], [27, 10], [20, 11], [15, 16]], hr[1]);
      p.line(17, 8, 30, 6, hr[2]); p.line(15, 11, 23, 8, hr[2]); p.line(26, 9, 34, 13, hr[0]); p.px(21, 6, C.white); p.px(29, 5, C.tan); p.dither(13, 5, 24, 8, C.tan, 0.12); break;
    case 'long': H([[12, 24], [13, 10], [20, 6], [30, 6], [35, 10], [36, 24], [33, 14], [24, 12], [15, 14]], hr[1]); p.dither(14, 7, 20, 6, hr[2], 0.35); break;
    case 'mullet': H([[13, 18], [14, 9], [22, 6], [30, 7], [35, 11], [35, 18], [30, 12], [17, 12]], hr[1]); p.dither(15, 7, 18, 5, hr[2], 0.4); break;
    case 'bighair': H([[12, 20], [13, 9], [20, 5], [30, 5], [36, 10], [37, 20], [33, 13], [26, 11], [18, 12]], hr[1]); p.dither(15, 5, 20, 6, hr[2], 0.4); p.px(20, 7, C.white); break;
    case 'afro': p.ellipse(24, 10, 12, 4, hr[1]); break;
    case 'bob': H([[12, 30], [12, 12], [20, 7], [30, 7], [36, 12], [36, 30], [33, 16], [26, 11], [15, 16]], hr[1]); p.hline(16, 14, 16, hr[2]); break;
    case 'chef': p.blob(24, 5, 12, 6, [C.steel, C.silver, C.white]); p.rect(14, 8, 20, 7, C.white); p.hline(14, 14, 20, C.silver); p.rect(14, 15, 2, 5, hr[1]); p.rect(32, 15, 2, 5, hr[1]); break;
    case 'slick': H([[13, 18], [14, 9], [22, 6], [31, 7], [35, 12], [35, 18], [31, 11], [18, 12]], hr[1]); p.line(18, 9, 32, 9, hr[2]); p.line(17, 11, 30, 10, hr[2]); break;
    default: H([[13, 18], [14, 9], [22, 6], [31, 7], [35, 12], [35, 18]], hr[1]);
  }
  if (look.glasses) { p.box(17, 20, 6, 5, C.ink); p.box(26, 20, 6, 5, C.ink); p.hline(23, 21, 3, C.ink); p.px(18, 21, C.white); p.px(27, 21, C.white); }
  if (look.sunnies) { p.rect(17, 20, 6, 4, C.ink); p.rect(26, 20, 6, 4, C.ink); p.hline(23, 21, 3, C.ink); p.px(18, 21, C.blue); p.px(27, 21, C.blue); }
  if (look.cat) { p.blob(40, 40, 6, 6, [C.brown, C.flame, C.gold]); p.poly([[35, 36], [36, 31], [39, 35]], C.flame); p.poly([[41, 35], [44, 31], [45, 36]], C.flame); p.px(38, 39, C.ink); p.px(42, 39, C.ink); p.px(40, 41, C.pink); }
  if (mood === 'yell') { p.px(10, 10, C.white); p.px(38, 8, C.white); p.line(6, 18, 9, 18, C.white); p.line(39, 18, 42, 17, C.white); p.line(8, 12, 10, 14, C.white); p.line(40, 12, 38, 14, C.white); }
  if (mood === 'angry') { p.art(35, 6, ['#.#', '.#.', '#.#'], { '#': C.red }); }
  if (mood === 'worried') { p.art(36, 12, ['.#', '##', '##'], { '#': C.cyan }); }
  p.outline(C.ink);
  return p;
}

export function portrait(scene, id, look, mood = 'happy') {
  // Real-crew art override (see public/crew/README.md)
  if (scene.textures.exists(`photo_${id}_${mood}`)) return `photo_${id}_${mood}`;
  if (scene.textures.exists(`photo_${id}_happy`)) return `photo_${id}_happy`;
  const key = `por_${id}_${mood}`;
  if (!scene.textures.exists(key)) drawPortrait(look, mood).toTexture(scene, key);
  return key;
}

// Tiny full-body sprite 16x30, 2 frames (idle / wave-or-walk).
export function body(scene, id, look) {
  if (scene.textures.exists(`photo_body_${id}`)) return `photo_body_${id}`;
  const key = `body_${id}`; if (scene.textures.exists(key)) return key;
  const sk = SKIN[look.skin] || SKIN.light, hr = HAIR[look.hair] || HAIR.brown, sh = look.shirtless ? sk[2] : (look.shirt || C.blue);
  const p = new PX(32, 30);
  for (let f = 0; f < 2; f++) {
    const q = new PX(16, 30);
    q.rect(5, 20, 3, 9, C.navy); q.rect(9, 20, 3, 9, C.navy); q.rect(4, 28, 4, 2, C.ink); q.rect(9, 28, 4, 2, C.ink);
    q.rect(4, 11, 9, 10, sh); q.vline(4, 11, 10, shade(sh, 1.2)); q.vline(12, 11, 10, shade(sh, 0.7));
    if (f === 1) { q.rect(13, 5, 2, 7, sh); q.rect(13, 3, 2, 2, sk[2]); } else { q.rect(13, 12, 2, 7, sh); q.rect(13, 19, 2, 2, sk[2]); }
    q.rect(2, 12, 2, 7, sh); q.rect(2, 19, 2, 2, sk[2]);
    q.blob(8.5, 6, 4, 4.5, sk); q.px(7, 6, C.ink); q.px(10, 6, C.ink);
    const s = look.style;
    if (['cap', 'trucker', 'backcap'].includes(s)) { q.rect(4, 1, 9, 3, s === 'cap' ? sh : C.red); q.rect(s === 'backcap' ? 12 : 1, 3, 4, 1, C.crimson); }
    else if (s === 'beanie') { q.rect(4, 0, 9, 4, sh); q.hline(4, 3, 9, shade(sh, 0.6)); }
    else if (s === 'bald') { q.px(5, 5, hr[1]); q.px(12, 5, hr[1]); }
    else if (s === 'chef') { q.rect(4, -1, 9, 4, C.white); }
    else { q.rect(4, 1, 9, 3, hr[1]); if (['long', 'bighair', 'afro', 'perm', 'bob', 'wavy'].includes(s)) { const len = s === 'wavy' ? 11 : 8; q.rect(3, 2, 2, len, hr[1]); q.rect(12, 2, 2, len, hr[1]); if (s === 'wavy') { q.px(3, 6, hr[2]); q.px(13, 8, hr[2]); } } }
    if (['full', 'lumber', 'viking'].includes(look.beard)) q.rect(6, 8, 5, 3, hr[1]);
    if (look.beard === 'stache' || look.beard === 'scruff') q.hline(7, 8, 4, hr[1]);
    if (look.beard === 'scruff') q.hline(7, 9, 3, hr[2]);
    q.outline(C.ink); p.stamp(q, f * 16, 0);
  }
  p.toTexture(scene, key, 16, 30);
  return key;
}
