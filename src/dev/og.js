// Dev-only: composes the 1200x630 link-preview card from in-game art and saves it to public/og.png.
// Open /?og=1 on the dev server.
import { PX } from '../core/pixel.js';
import { C } from '../core/palette.js';
import { skyline, logoText, logoWidth } from '../art/brand.js';

export async function makeOg(game) {
  const scene = game.scene.getScenes(true)[0] || game.scene.getScene('Boot');
  const w = 600, h = 315, skyH = 371;
  skyline(scene, 'ogSky', w, skyH, { mood: 'sunset' });
  const c = document.createElement('canvas'); c.width = w; c.height = h;
  const x = c.getContext('2d'); x.imageSmoothingEnabled = false;
  const img = k => scene.textures.get(k).getSourceImage();
  x.drawImage(img('ogSky'), 0, skyH - h, w, h, 0, 0, w, h);
  // darken the water a touch so the title pops
  x.fillStyle = 'rgba(24,20,37,0.35)'; x.fillRect(0, 176, w, h - 176);
  x.drawImage(img('badgeBig'), 44, 184);
  x.drawImage(img('logo'), Math.round((w - 262) / 2), 176);
  const vanSheet = img('sideVan'); x.drawImage(vanSheet, 0, 0, 128, 62, 454, 206, 128, 62);
  const tag = new PX(w, 22); const str = 'THE HOMIES VS NORTHWEST';
  logoText(tag, Math.round((w - logoWidth(str, 2)) / 2), 2, str, 2, [C.brown, C.gold, C.yellow], { shadow: C.ink });
  x.drawImage(tag.commit(), 0, 272);
  const sub = new PX(w, 12); const s2 = "G'S PLUMBING";
  logoText(sub, Math.round((w - logoWidth(s2, 1)) / 2), 1, s2, 1, [C.deep, C.green, C.lime], { shadow: C.ink });
  x.drawImage(sub.commit(), 0, 296);
  // upscale 2x with hard pixels
  const big = document.createElement('canvas'); big.width = 1200; big.height = 630;
  const bx = big.getContext('2d'); bx.imageSmoothingEnabled = false; bx.drawImage(c, 0, 0, 1200, 630);
  const blob = await new Promise(r => big.toBlob(r, 'image/png'));
  const res = await fetch('/__save?path=public/og.png', { method: 'POST', body: blob });
  return (await res.text()) + ' ' + blob.size + ' bytes';
}
