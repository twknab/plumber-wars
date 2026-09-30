// The shareable score card: a 1080x1350 (4:5, feed-friendly) pixel poster of your leaderboard score,
// drawn from the game's own sprites and logo font, with a QR code back to the game.
import { PX } from './pixel.js';
import { C, RAMP } from './palette.js';
import { logoText } from '../art/brand.js';
import { portrait } from '../art/people.js';
import { HEROES, RIVALS, ORDER, SHARE_TAUNT } from '../data/content.js';
import { GAME_QR } from '../data/qr.js';

export const CARD_W = 1080, CARD_H = 1350;
export const CARD_TAUNT = SHARE_TAUNT;

// logo-font text as a crisp canvas, scaled by k
function pixelText(str, k, ramp) {
  const p = new PX(str.length * 8 + 4, 11);
  logoText(p, 1, 1, str, 1, ramp, { shadow: C.ink });
  const src = p.commit(), out = document.createElement('canvas');
  out.width = src.width * k; out.height = src.height * k;
  const x = out.getContext('2d'); x.imageSmoothingEnabled = false; x.drawImage(src, 0, 0, out.width, out.height);
  // trim the unused right edge so the text centers properly
  let w = src.width; const d = src.getContext('2d').getImageData(0, 0, src.width, src.height).data;
  while (w > 1) { let empty = true; for (let yy = 0; yy < src.height; yy++) if (d[(yy * src.width + w - 1) * 4 + 3]) { empty = false; break; } if (!empty) break; w--; }
  return { canvas: out, w: (w + 1) * k, h: src.height * k };
}

export function makeScoreCard(scene, { initials = '???', score = 0, rank = null, cleared = 0, hero = 'dalton' }) {
  const cv = document.createElement('canvas'); cv.width = CARD_W; cv.height = CARD_H;
  const x = cv.getContext('2d'); x.imageSmoothingEnabled = false;
  const tex = key => { const t = scene.textures.get(key); return { img: t.getSourceImage(), fr: t.get() }; };
  const blit = (key, cx, y, k) => { const { img, fr } = tex(key); x.drawImage(img, fr.cutX, fr.cutY, fr.width, fr.height, cx - fr.width * k / 2, y, fr.width * k, fr.height * k); return fr.height * k; };
  const center = (t, y) => x.drawImage(t.canvas, 0, 0, t.w, t.h, (CARD_W - t.w) / 2, y, t.w, t.h);

  // night-shift background with a gold frame
  x.fillStyle = C.ink; x.fillRect(0, 0, CARD_W, CARD_H);
  x.fillStyle = C.gold; x.fillRect(24, 24, CARD_W - 48, 10); x.fillRect(24, CARD_H - 34, CARD_W - 48, 10); x.fillRect(24, 24, 10, CARD_H - 48); x.fillRect(CARD_W - 34, 24, 10, CARD_H - 48);

  // logo
  const lf = tex('logo').fr, lk = Math.max(1, Math.floor(620 / lf.width));
  const logoH = blit('logo', CARD_W / 2, 60, lk);

  // title, initials, score, rank
  const champ = rank === 1;
  let y = 60 + logoH + 40;
  if (champ) { // pixel crown
    x.fillStyle = C.gold; const cx = CARD_W / 2, s = 6;
    x.fillRect(cx - 9 * s, y + 4 * s, 18 * s, 5 * s);
    for (const [a, b] of [[-9, -5], [-3, 3], [5, 9]]) { x.beginPath(); x.moveTo(cx + a * s, y + 4 * s); x.lineTo(cx + ((a + b) / 2) * s, y - 4 * s); x.lineTo(cx + b * s, y + 4 * s); x.fill(); }
    x.fillStyle = C.red; x.fillRect(cx - s, y + 5 * s, 2 * s, 2 * s);
    y += 70;
  }
  const title = pixelText(champ ? 'THE CHAMP' : 'HIGH SCORE', 7, RAMP.brass);
  center(title, y); y += title.h + 20;
  const ini = pixelText(initials, 16, RAMP.chrome);
  center(ini, y); y += ini.h + 16;
  const sc = pixelText(String(score), 10, [C.brown, C.clay, C.gold, C.yellow]);
  center(sc, y); y += sc.h + 16;
  const line = [rank ? `RANK ${rank}` : null, `${cleared} OF ${ORDER.length} JOBS`].filter(Boolean).join(' - ');
  const meta = pixelText(line, 5, [C.forest, C.green, C.lime]);
  center(meta, y); y += meta.h + 24;

  // the homies: the lead in the middle, bigger
  const lead = HEROES.find(h => h.id === hero) || HEROES[0], others = HEROES.filter(h => h !== lead);
  const py = y;
  blit(portrait(scene, others[0].id, others[0].look, 'happy'), CARD_W / 2 - 230, py + 44, 3);
  blit(portrait(scene, others[1].id, others[1].look, 'happy'), CARD_W / 2 + 230, py + 44, 3);
  blit(portrait(scene, lead.id, lead.look, 'happy'), CARD_W / 2, py, 4);

  // bottom band: Randy's taunt + QR back to the game
  const by = CARD_H - 290;
  x.fillStyle = '#262b44'; x.fillRect(50, by, CARD_W - 100, 190);
  const randy = portrait(scene, 'randy', RIVALS.randy.look, 'yell');
  blit(randy, 130, by + 30, 2.6);
  x.fillStyle = C.red; x.font = 'bold 26px ui-monospace, Menlo, monospace'; x.fillText('BIG RANDY (NORTHWEST):', 210, by + 52);
  x.fillStyle = C.white; x.font = 'bold 34px ui-monospace, Menlo, monospace';
  const words = CARD_TAUNT.split(' '); let ln = '', ly = by + 100;
  for (const w of words) { const t = ln ? ln + ' ' + w : w; if (x.measureText(t).width > 520) { x.fillText(ln, 210, ly); ly += 42; ln = w; } else ln = t; }
  x.fillText(ln, 210, ly);
  // QR on sand
  const n = GAME_QR.length, m = 4, qs = (n + 4) * m, qx = CARD_W - 70 - qs, qy = by + (190 - qs) / 2;
  x.fillStyle = C.sand; x.fillRect(qx, qy, qs, qs); x.fillStyle = C.ink;
  GAME_QR.forEach((row, r) => { for (let c = 0; c < n; c++) if (row[c] === '1') x.fillRect(qx + (c + 2) * m, qy + (r + 2) * m, m, m); });
  x.fillStyle = C.gold; x.font = 'bold 30px ui-monospace, Menlo, monospace'; x.textAlign = 'center';
  x.fillText('PLUMBERWARS.TIMKNAB.DEV', CARD_W / 2, CARD_H - 60);
  x.textAlign = 'left';
  return cv;
}
