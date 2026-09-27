// Dev-only: turns the Commons photos in tools/district-src/ (see scripts/districts.mjs) into
// 270x170 pixel art on the game palette with ordered dithering -> public/districts/<key>.png.
// Open /?districts=1 on the dev server (or /?districts=<key> for one district).
import { C } from '../core/palette.js';

const W = 270, H = 170;
const PAL = Object.values(C).map(h => [parseInt(h.slice(1, 3), 16), parseInt(h.slice(3, 5), 16), parseInt(h.slice(5, 7), 16)]);
const BAYER = [0, 8, 2, 10, 12, 4, 14, 6, 3, 11, 1, 9, 15, 7, 13, 5].map(v => v / 16 - 0.5);
const nearest = (r, g, b) => { // "redmean" perceptual distance
  let best = 0, bd = Infinity;
  for (let i = 0; i < PAL.length; i++) { const [pr, pg, pb] = PAL[i]; const rm = (r + pr) / 2, dr = r - pr, dg = g - pg, db = b - pb;
    const d = (2 + rm / 256) * dr * dr + 4 * dg * dg + (2 + (255 - rm) / 256) * db * db; if (d < bd) { bd = d; best = i; } }
  return PAL[best];
};

// Per-photo color grading on top of the default (an overcast photo needs more push to read as sunny).
const GRADE = { ballard: 'hue-rotate(22deg) saturate(1.7) contrast(1.12) brightness(1.04)', westseattle: 'saturate(1.5) contrast(1.12) brightness(1.05)' };

async function convert(key, crop) {
  const img = new Image(); await new Promise((ok, no) => { img.onload = ok; img.onerror = no; img.src = `/tools/district-src/${key}.jpg`; }); // (decode() stalls in hidden tabs)
  const [cx, cy, cw, ch] = crop; const sx = cx * img.width, sy = cy * img.height, sw = cw * img.width, sh = ch * img.height;
  // fit the crop to 270x170 (cover), downscale in two steps for clean averaging
  const scale = Math.max(W / sw, H / sh); const dw = sw * scale, dh = sh * scale;
  const mid = document.createElement('canvas'); mid.width = W * 2; mid.height = H * 2;
  const mx = mid.getContext('2d'); mx.imageSmoothingQuality = 'high'; mx.drawImage(img, sx + (sw - W / scale) / 2, sy + (sh - H / scale) / 2, W / scale, H / scale, 0, 0, W * 2, H * 2);
  const out = document.createElement('canvas'); out.width = W; out.height = H;
  const ox = out.getContext('2d'); ox.imageSmoothingQuality = 'high'; ox.filter = GRADE[key] || 'saturate(1.25) contrast(1.12)'; ox.drawImage(mid, 0, 0, W, H);
  const id = ox.getImageData(0, 0, W, H), d = id.data;
  for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) {
    const i = (y * W + x) * 4, t = BAYER[(y & 3) * 4 + (x & 3)] * 34;
    const [r, g, b] = nearest(d[i] + t, d[i + 1] + t, d[i + 2] + t); d[i] = r; d[i + 1] = g; d[i + 2] = b; d[i + 3] = 255;
  }
  ox.filter = 'none'; ox.putImageData(id, 0, 0);
  const blob = await new Promise(r => out.toBlob(r, 'image/png'));
  return (await fetch(`/__save?path=public/districts/${key}.png`, { method: 'POST', body: blob })).text();
}

export async function makeDistrictArt() {
  const credits = await (await fetch('/districts/credits.json')).json();
  const out = [];
  const only = new URLSearchParams(location.search).get('districts'); // /?districts=ballard redoes just one
  for (const [key, c] of Object.entries(credits)) if (!only || only === '1' || only === key) out.push(await convert(key, c.crop));
  window.__districts = out; return out;
}
