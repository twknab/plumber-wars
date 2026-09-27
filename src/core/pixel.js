// A tiny pixel-art painter. Draws into a Uint32 buffer with hard pixels, ordered dithering,
// shaded volumes and automatic outlines, then publishes the result as a Phaser texture.
import { C } from './palette.js';

const BAYER = [0, 8, 2, 10, 12, 4, 14, 6, 3, 11, 1, 9, 15, 7, 13, 5].map(v => (v + 0.5) / 16);
const cache = new Map();
function rgba(c) {
  if (c == null) return 0;
  if (typeof c === 'number') return c;
  let v = cache.get(c);
  if (v === undefined) {
    const n = parseInt(c.slice(1, 7), 16);
    const a = c.length > 7 ? parseInt(c.slice(7, 9), 16) : 255;
    v = ((a << 24) | ((n & 255) << 16) | (n & 0xff00) | (n >> 16)) >>> 0;
    cache.set(c, v);
  }
  return v;
}
export const bayer = (x, y) => BAYER[(y & 3) * 4 + (x & 3)];

export class PX {
  constructor(w, h) {
    this.w = w; this.h = h;
    this.canvas = document.createElement('canvas');
    this.canvas.width = w; this.canvas.height = h;
    this.ctx = this.canvas.getContext('2d');
    this.img = this.ctx.createImageData(w, h);
    this.buf = new Uint32Array(this.img.data.buffer);
  }
  get(x, y) { return (x < 0 || y < 0 || x >= this.w || y >= this.h) ? 0 : this.buf[y * this.w + x]; }
  px(x, y, c) { x |= 0; y |= 0; if (x < 0 || y < 0 || x >= this.w || y >= this.h) return this; this.buf[y * this.w + x] = rgba(c); return this; }
  rect(x, y, w, h, c) { const v = rgba(c); x |= 0; y |= 0; for (let j = Math.max(0, y); j < Math.min(this.h, y + h); j++) for (let i = Math.max(0, x); i < Math.min(this.w, x + w); i++) this.buf[j * this.w + i] = v; return this; }
  clear(x = 0, y = 0, w = this.w, h = this.h) { return this.rect(x, y, w, h, 0); }
  hline(x, y, w, c) { return this.rect(x, y, w, 1, c); }
  vline(x, y, h, c) { return this.rect(x, y, 1, h, c); }
  box(x, y, w, h, c) { this.hline(x, y, w, c); this.hline(x, y + h - 1, w, c); this.vline(x, y, h, c); this.vline(x + w - 1, y, h, c); return this; }
  line(x0, y0, x1, y1, c) {
    x0 |= 0; y0 |= 0; x1 |= 0; y1 |= 0;
    const dx = Math.abs(x1 - x0), dy = -Math.abs(y1 - y0), sx = x0 < x1 ? 1 : -1, sy = y0 < y1 ? 1 : -1; let e = dx + dy;
    for (;;) { this.px(x0, y0, c); if (x0 === x1 && y0 === y1) break; const e2 = 2 * e; if (e2 >= dy) { e += dy; x0 += sx; } if (e2 <= dx) { e += dx; y0 += sy; } }
    return this;
  }
  thick(x0, y0, x1, y1, t, c) { const n = Math.max(Math.abs(x1 - x0), Math.abs(y1 - y0), 1); for (let i = 0; i <= n; i++) { const x = x0 + (x1 - x0) * i / n, y = y0 + (y1 - y0) * i / n; this.ellipse(x, y, t / 2, t / 2, c); } return this; }
  // Checkerboard / ordered dither of colour c over a rect (density 0..1).
  dither(x, y, w, h, c, d = 0.5) { for (let j = y; j < y + h; j++) for (let i = x; i < x + w; i++) if (bayer(i, j) < d) this.px(i, j, c); return this; }
  ellipse(cx, cy, rx, ry, c) {
    for (let y = Math.floor(cy - ry); y <= Math.ceil(cy + ry); y++) for (let x = Math.floor(cx - rx); x <= Math.ceil(cx + rx); x++) {
      const dx = (x + 0.5 - cx) / rx, dy = (y + 0.5 - cy) / ry; if (dx * dx + dy * dy <= 1) this.px(x, y, c);
    }
    return this;
  }
  ring(cx, cy, rx, ry, c) { // 1px ellipse outline
    for (let y = Math.floor(cy - ry) - 1; y <= Math.ceil(cy + ry) + 1; y++) for (let x = Math.floor(cx - rx) - 1; x <= Math.ceil(cx + rx) + 1; x++) {
      const inside = (xx, yy) => { const dx = (xx + 0.5 - cx) / rx, dy = (yy + 0.5 - cy) / ry; return dx * dx + dy * dy <= 1; };
      if (inside(x, y) && (!inside(x + 1, y) || !inside(x - 1, y) || !inside(x, y + 1) || !inside(x, y - 1))) this.px(x, y, c);
    }
    return this;
  }
  poly(pts, c) { // scanline polygon fill; pts = [[x,y],...]
    const ys = pts.map(p => p[1]); const y0 = Math.floor(Math.min(...ys)), y1 = Math.ceil(Math.max(...ys));
    for (let y = y0; y <= y1; y++) {
      const yy = y + 0.5; const xs = [];
      for (let i = 0; i < pts.length; i++) { const a = pts[i], b = pts[(i + 1) % pts.length]; if ((a[1] <= yy && b[1] > yy) || (b[1] <= yy && a[1] > yy)) xs.push(a[0] + (yy - a[1]) / (b[1] - a[1]) * (b[0] - a[0])); }
      xs.sort((a, b) => a - b);
      for (let k = 0; k + 1 < xs.length; k += 2) for (let x = Math.round(xs[k]); x < Math.round(xs[k + 1]); x++) this.px(x, y, c);
    }
    return this;
  }
  // Vertical gradient through colours with ordered dithering between bands.
  vgrad(x, y, w, h, cols) {
    const n = cols.length - 1;
    for (let j = 0; j < h; j++) { const t = (j / Math.max(1, h - 1)) * n; const k = Math.min(n - 1, Math.floor(t)); const f = t - k;
      for (let i = 0; i < w; i++) this.px(x + i, y + j, bayer(x + i, y + j) < f ? cols[k + 1] : cols[k]); }
    return this;
  }
  hgrad(x, y, w, h, cols) {
    const n = cols.length - 1;
    for (let i = 0; i < w; i++) { const t = (i / Math.max(1, w - 1)) * n; const k = Math.min(n - 1, Math.floor(t)); const f = t - k;
      for (let j = 0; j < h; j++) this.px(x + i, y + j, bayer(x + i, y + j) < f ? cols[k + 1] : cols[k]); }
    return this;
  }
  // Lit ellipsoid: classic pixel "sphere" shading from a top-left light.
  blob(cx, cy, rx, ry, ramp, lx = -0.4, ly = -0.45) {
    const n = ramp.length;
    for (let y = Math.floor(cy - ry); y <= Math.ceil(cy + ry); y++) for (let x = Math.floor(cx - rx); x <= Math.ceil(cx + rx); x++) {
      const dx = (x + 0.5 - cx) / rx, dy = (y + 0.5 - cy) / ry; const r2 = dx * dx + dy * dy; if (r2 > 1) continue;
      const d = Math.hypot(dx - lx, dy - ly) / 1.6; let v = (1 - d) * (n - 0.01) + (bayer(x, y) - 0.5) * 0.9;
      this.px(x, y, ramp[Math.max(0, Math.min(n - 1, Math.floor(v)))]);
    }
    return this;
  }
  // Rect shaded as a vertical cylinder (light from the left third).
  cylV(x, y, w, h, ramp, hl = 0.3) {
    const n = ramp.length;
    for (let i = 0; i < w; i++) { const t = (i + 0.5) / w; const v = 1 - Math.min(1, Math.abs(t - hl) / (t < hl ? hl : 1 - hl));
      for (let j = 0; j < h; j++) { const q = v * (n - 0.01) + (bayer(x + i, y + j) - 0.5) * 0.8; this.px(x + i, y + j, ramp[Math.max(0, Math.min(n - 1, Math.floor(q)))]); } }
    return this;
  }
  cylH(x, y, w, h, ramp, hl = 0.3) {
    const n = ramp.length;
    for (let j = 0; j < h; j++) { const t = (j + 0.5) / h; const v = 1 - Math.min(1, Math.abs(t - hl) / (t < hl ? hl : 1 - hl));
      for (let i = 0; i < w; i++) { const q = v * (n - 0.01) + (bayer(x + i, y + j) - 0.5) * 0.8; this.px(x + i, y + j, ramp[Math.max(0, Math.min(n - 1, Math.floor(q)))]); } }
    return this;
  }
  // Bevelled panel: light top/left edge, dark bottom/right edge.
  bevel(x, y, w, h, ramp, o = C.ink) {
    const n = ramp.length;
    this.rect(x, y, w, h, ramp[Math.floor(n / 2)]);
    this.hline(x, y, w, ramp[n - 1]); this.vline(x, y, h, ramp[n - 1]);
    this.hline(x, y + h - 1, w, ramp[0]); this.vline(x + w - 1, y, h, ramp[0]);
    if (o) this.box(x - 1, y - 1, w + 2, h + 2, o);
    return this;
  }
  // Draw a pixel sprite from string art. map: char -> colour. '.' or ' ' = transparent.
  art(x, y, rows, map, flip = false) {
    rows.forEach((r, j) => { for (let i = 0; i < r.length; i++) { const ch = r[flip ? r.length - 1 - i : i]; const c = map[ch]; if (c) this.px(x + i, y + j, c); } });
    return this;
  }
  // Outline every transparent pixel that touches an opaque one.
  outline(c = C.ink, diag = false) {
    const src = this.buf.slice(); const v = rgba(c); const w = this.w, h = this.h;
    const op = (x, y) => x >= 0 && y >= 0 && x < w && y < h && (src[y * w + x] >>> 24) > 0;
    for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) {
      if (op(x, y)) continue;
      if (op(x - 1, y) || op(x + 1, y) || op(x, y - 1) || op(x, y + 1) || (diag && (op(x - 1, y - 1) || op(x + 1, y + 1) || op(x + 1, y - 1) || op(x - 1, y + 1)))) this.buf[y * w + x] = v;
    }
    return this;
  }
  // Recolour: every pixel of colour a becomes b.
  swap(a, b) { const va = rgba(a), vb = rgba(b); for (let i = 0; i < this.buf.length; i++) if (this.buf[i] === va) this.buf[i] = vb; return this; }
  // Stamp another PX onto this one.
  stamp(src, x, y, flip = false) {
    for (let j = 0; j < src.h; j++) for (let i = 0; i < src.w; i++) { const v = src.buf[j * src.w + (flip ? src.w - 1 - i : i)]; if (v >>> 24) this.px(x + i, y + j, v); }
    return this;
  }
  // Darken everything already drawn inside a mask region with a shadow colour at dither density d.
  shade(x, y, w, h, c, d = 0.5) { for (let j = y; j < y + h; j++) for (let i = x; i < x + w; i++) if ((this.get(i, j) >>> 24) && bayer(i, j) < d) this.px(i, j, c); return this; }
  commit() { this.ctx.putImageData(this.img, 0, 0); return this.canvas; }
  // Publish as a Phaser texture (optionally sliced into equal frames).
  toTexture(scene, key, fw, fh) {
    this.commit();
    const tm = scene.textures; if (tm.exists(key)) tm.remove(key);
    const t = tm.addCanvas(key, this.canvas);
    if (fw) { let n = 0; for (let y = 0; y + fh <= this.h; y += fh) for (let x = 0; x + fw <= this.w; x += fw) t.add(n++, 0, x, y, fw, fh); }
    return t;
  }
}

// Seeded RNG so procedural art is stable between runs.
export function rng(seed = 1) { let s = (seed * 9301 + 49297) % 233280 || 1; return () => { s = (s * 16807) % 2147483647; return (s - 1) / 2147483646; }; }
