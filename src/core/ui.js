// Shared UI: pixel text, 9-slice panels, chunky buttons, typewriter dialogs, banners, block-wipe transitions.
import { clean } from './font.js';
import { audio } from './audio.js';
import { C, hex } from './palette.js';

export const W = 270;
export const isTouch = typeof window !== 'undefined' && ('ontouchstart' in window || navigator.maxTouchPoints > 0);
export let H = 480;
export function setH(h) { H = h; }

export function txt(scene, x, y, s, { color, outline = true, size = 1, align = 0, ox = 0, oy = 0, maxW, depth, font } = {}) {
  const t = scene.add.bitmapText(x, y, font || (outline ? (size >= 2 ? 'pxs' : 'pxo') : 'px'), clean(s), 7);
  if (maxW) t.setMaxWidth(maxW / size);
  t.setOrigin(ox, oy); if (align === 1) t.setCenterAlign(); else if (align === 2) t.setRightAlign();
  if (color) t.setTint(hex(color));
  t.setScale(size);
  if (depth != null) t.setDepth(depth);
  return t;
}
export function setTxt(t, s) { t.setText(clean(s)); return t; }

export function panel(scene, x, y, w, h, key = 'panel') {
  return scene.add.nineslice(x, y, key, undefined, w, h, 8, 8, 8, 8).setOrigin(0, 0);
}

export function button(scene, x, y, w, h, label, onTap, { color = 'btnGold', textColor = C.ink, size = 1, icon, depth = 50, sound = 'select', key } = {}) {
  const c = scene.add.container(x, y).setDepth(depth);
  const bg = scene.add.nineslice(0, 0, color, undefined, w, h, 6, 6, 6, 8).setOrigin(0.5);
  const t = txt(scene, icon ? 6 : 0, -1, label, { outline: false, color: textColor, size, ox: 0.5, oy: 0.5 });
  c.add([bg, t]);
  if (icon) { const ic = scene.add.image(-t.width / 2 - 2, -1, icon).setOrigin(0.5); c.add(ic); }
  c.bg = bg; c.label = t; c.enabled = true;
  bg.setInteractive({ useHandCursor: true });
  bg.on('pointerdown', () => { if (!c.enabled) return; c.y = y + 1; bg.setTint(0xdddddd); });
  bg.on('pointerout', () => { c.y = y; bg.clearTint(); });
  bg.on('pointerup', () => { if (!c.enabled) return; c.y = y; bg.clearTint(); audio.unlock(); if (sound) audio.sfx(sound); onTap && onTap(); });
  c.setEnabled = on => { c.enabled = on; c.setAlpha(on ? 1 : 0.45); return c; };
  // Optional keyboard shortcut(s): key: 'ENTER' or ['ENTER','SPACE']
  if (key && scene.input.keyboard) for (const k of [].concat(key)) {
    const fn = () => { if (!c.active || !c.visible || !c.enabled || c.alpha === 0) return; audio.unlock(); if (sound) audio.sfx(sound); onTap && onTap(); };
    scene.input.keyboard.on('keydown-' + k, fn);
    c.once('destroy', () => scene.input.keyboard && scene.input.keyboard.off('keydown-' + k, fn));
  }
  return c;
}

// "Ask your homies": when the player is struggling, make the unused help buttons pulse with a gold glow and
// a bouncing arrow, plus a speech bubble. Stops by itself on each button once it's used (setEnabled(false)).
export function nudgeHelp(scene, buttons, text) {
  const live = buttons.filter(b => b && b.active && b.enabled && !b.nudging);
  if (!live.length) return false;
  for (const b of live) {
    b.nudging = true;
    const w = b.bg.width, h = b.bg.height;
    const glow = scene.add.rectangle(b.x, b.y, w + 8, h + 8).setStrokeStyle(3, hex(C.yellow)).setDepth(b.depth - 1);
    const arrow = scene.add.triangle(b.x, b.y - h / 2 - 12, 0, 0, 12, 0, 6, 8, hex(C.yellow)).setDepth(b.depth + 1);
    const tw = [
      scene.tweens.add({ targets: glow, alpha: 0.15, scaleX: 1.06, scaleY: 1.2, yoyo: true, repeat: -1, duration: 380 }),
      scene.tweens.add({ targets: arrow, y: arrow.y - 6, yoyo: true, repeat: -1, duration: 300, ease: 'Sine.inOut' }),
      scene.tweens.add({ targets: b, scale: 1.06, yoyo: true, repeat: -1, duration: 380 }),
    ];
    const stop = () => { tw.forEach(t => t.remove()); glow.destroy(); arrow.destroy(); if (b.active) b.setScale(1); b.nudging = false; };
    const setEnabled = b.setEnabled; b.setEnabled = on => { if (!on) stop(); b.setEnabled = setEnabled; return setEnabled(on); };
    b.once('destroy', stop);
  }
  const top = Math.min(...live.map(b => b.y - b.bg.height / 2));
  bubble(scene, W / 2, top - 26, text, { dur: 3200, maxW: 200, depth: 120 });
  audio.sfx('ding');
  return true;
}

// Speech/dialog box with portrait and typewriter text. Resolves when dismissed.
export function dialog(scene, { portrait, name, text, color = C.gold, side = 'left', pitch = 1, y, depth = 80, auto } = {}) {
  return new Promise(resolve => {
    const bh = 78, by = y != null ? y : H - bh - 8;
    const c = scene.add.container(0, 0).setDepth(depth);
    const bg = panel(scene, 6, by, W - 12, bh);
    c.add(bg);
    const px = side === 'left' ? 12 : W - 12 - 52;
    if (portrait) {
      const frame = scene.add.rectangle(px + 26, by + 34, 52, 52, hex(C.storm)).setStrokeStyle(2, hex(color));
      const img = scene.add.image(px + 26, by + 34, portrait).setOrigin(0.5);
      c.add([frame, img]);
    }
    const tx = portrait && side === 'left' ? 70 : 14; const tw = portrait ? W - 12 - 70 - 8 : W - 36;
    const nm = txt(scene, tx, by + 7, name || '', { color });
    const body = txt(scene, tx, by + 20, '', { maxW: tw });
    const more = txt(scene, W - 20, by + bh - 12, '>', { color: C.gold });
    c.add([nm, body, more]);
    more.setVisible(false);
    const full = clean(text); let i = 0, done = false;
    const ev = scene.time.addEvent({ delay: 18, loop: true, callback: () => {
      i += 1; body.setText(full.slice(0, i));
      if (i % 2 === 0 && full[i] && full[i] !== ' ') audio.voice(pitch);
      if (i >= full.length) finish();
    } });
    function finish() { if (done) return; done = true; ev.remove(); body.setText(full); more.setVisible(true); scene.tweens.add({ targets: more, x: '+=3', yoyo: true, repeat: -1, duration: 300 });
      if (auto) scene.time.delayedCall(auto, close); }
    function close() { if (!c.active) return; hit.destroy(); c.destroy(); resolve(); }
    const hit = scene.add.zone(0, 0, W, H).setOrigin(0).setInteractive().setDepth(depth + 1);
    const adv = () => { audio.unlock(); if (!done) finish(); else { audio.sfx('blip'); close(); } };
    hit.on('pointerup', adv);
    const kb = scene.input.keyboard; const onKey = e => { if (['Enter', ' ', 'ArrowRight'].includes(e.key)) adv(); };
    if (kb) { kb.on('keydown', onKey); hit.once('destroy', () => kb.off('keydown', onKey)); }
    c.fromY = by; c.alpha = 0; c.y = 10; scene.tweens.add({ targets: c, alpha: 1, y: 0, duration: 150 });
  });
}

// Comic speech bubble attached to a point; auto-destroys.
export function bubble(scene, x, y, s, { dur = 2200, color = C.ink, depth = 60, maxW = 150, tail = 'down' } = {}) {
  const t = txt(scene, 0, 0, s, { outline: false, color, maxW });
  const w = Math.min(maxW, t.width) + 10, h = t.height + 8;
  const bx = Math.max(4, Math.min(W - w - 4, x - w / 2)), by = tail === 'down' ? y - h - 6 : y + 6;
  const c = scene.add.container(bx, by).setDepth(depth);
  const bg = scene.add.nineslice(0, 0, 'bubble', undefined, w, h, 6, 6, 6, 6).setOrigin(0);
  const tl = scene.add.triangle(0, 0, 0, 0, 8, 0, 3, 6, 0xffffff).setOrigin(0);
  tl.x = Math.max(4, Math.min(w - 12, x - bx - 4)); tl.y = tail === 'down' ? h - 1 : -6; if (tail !== 'down') tl.setAngle(180).setPosition(tl.x + 8, 1);
  t.setPosition(5, 4); c.add([bg, tl, t]);
  c.setScale(0.2); scene.tweens.add({ targets: c, scale: 1, duration: 140, ease: 'Back.out' });
  // stay up long enough to read (never shorter than asked), then drift up and fade instead of snapping away
  const hold = Math.min(5000, Math.max(dur, 900 + String(s).length * 45));
  scene.time.delayedCall(hold, () => c.active && scene.tweens.add({ targets: c, alpha: 0, y: c.y - 8, duration: 600, ease: 'Sine.in', onComplete: () => c.destroy() }));
  return c;
}

export function banner(scene, s, { color = C.yellow, size = 3, y = H * 0.4, dur = 1100, depth = 90, sub } = {}) {
  const t = txt(scene, W / 2, y, s, { color, size, ox: 0.5, oy: 0.5, depth });
  t.setScale(size * 3); t.alpha = 0;
  scene.tweens.add({ targets: t, scale: size, alpha: 1, duration: 220, ease: 'Back.out' });
  let st; if (sub) { st = txt(scene, W / 2, y + 7 * size + 4, sub, { ox: 0.5, depth, maxW: 240 }); st.setCenterAlign(); }
  scene.time.delayedCall(dur, () => scene.tweens.add({ targets: [t, st].filter(Boolean), alpha: 0, y: '-=10', duration: 250, onComplete: () => { t.destroy(); st && st.destroy(); } }));
  return t;
}

export function floatText(scene, x, y, s, color = C.white, depth = 70) {
  const t = txt(scene, x, y, s, { color, ox: 0.5, oy: 0.5, depth });
  // hold for a beat, then drift up and fade
  scene.tweens.add({ targets: t, y: y - 26, alpha: 0, delay: 500, duration: 1100, ease: 'Sine.in', onComplete: () => t.destroy() });
  return t;
}

// Block-wipe transitions (16px squares, diagonal sweep).
export function wipeTo(scene, key, data) {
  if (scene._wiping) return; scene._wiping = true;
  scene.events.once('shutdown', () => { scene._wiping = false; });
  const g = []; const s = 18;
  for (let y = 0; y < H + s; y += s) for (let x = 0; x < W + s; x += s) {
    const r = scene.add.rectangle(x + s / 2, y + s / 2, s, s, hex(C.ink)).setScale(0).setDepth(1000).setScrollFactor(0);
    g.push(r); scene.tweens.add({ targets: r, scale: 1.05, duration: 160, delay: (x + y) * 0.55 });
  }
  scene.time.delayedCall((W + H) * 0.55 + 180, () => { audio.hush(); scene.scene.start(key, data); });
}
export function wipeIn(scene) {
  const s = 18;
  for (let y = 0; y < H + s; y += s) for (let x = 0; x < W + s; x += s) {
    const r = scene.add.rectangle(x + s / 2, y + s / 2, s, s, hex(C.ink)).setScale(1.05).setDepth(1000).setScrollFactor(0);
    scene.tweens.add({ targets: r, scale: 0, duration: 160, delay: (x + y) * 0.5, onComplete: () => r.destroy() });
  }
}

// Small corner sound toggle used on menus.
export function soundToggle(scene, x = W - 14, y = 14) {
  const ic = scene.add.image(x, y, audio.enabled ? 'iSound' : 'iMute').setScale(2).setDepth(95);
  const toggle = () => { audio.unlock(); audio.setSound(!audio.enabled); ic.setTexture(audio.enabled ? 'iSound' : 'iMute'); if (audio.enabled) audio.sfx('select'); };
  hitZone(scene, x, y, 34, 30, toggle, 96);
  if (scene.input.keyboard) scene.input.keyboard.on('keydown-M', toggle);
  return ic;
}

// Invisible, generously sized touch target (for small icons).
export function hitZone(scene, x, y, w, h, fn, depth = 100) {
  const z = scene.add.zone(x, y, w, h).setInteractive({ useHandCursor: true }).setDepth(depth);
  z.on('pointerup', fn); return z;
}

export function stars(scene, x, y, n, of = 3, scale = 1, depth = 60) {
  const out = [];
  for (let i = 0; i < of; i++) out.push(scene.add.image(x + (i - (of - 1) / 2) * 11 * scale, y, i < n ? 'iStar' : 'iStarE').setScale(scale).setDepth(depth));
  return out;
}
