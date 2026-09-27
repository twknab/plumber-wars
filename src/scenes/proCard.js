import { W, H, txt, button, panel, isTouch } from '../core/ui.js';
import { audio } from '../core/audio.js';
import { C, hex } from '../core/palette.js';
import { JOBS } from '../data/jobs.js';
import { STANDARDS, STANDARDS_NOTE } from '../data/standards.js';

// "How pros do it": the real standard behind a repair, as an overlay card. Returns a close() function.
export function showProCard(scene, ji, { depth = 400, onClose } = {}) {
  const c = scene.add.container(0, 0).setDepth(depth);
  let closed = false;
  const close = () => { if (closed) return; closed = true; scene.input.keyboard && scene.input.keyboard.off('keydown-ESC', close); if (c.active) c.destroy(); btn.destroy(); onClose && onClose(); };
  c.add(scene.add.rectangle(0, 0, W, H, hex(C.ink), 1).setOrigin(0).setInteractive().on('pointerup', close));
  const top = 30;
  c.add(txt(scene, W / 2, top - 18, 'HOW PROS DO IT', { ox: 0.5, size: 2, color: C.gold }));
  c.add(txt(scene, W / 2, top + 2, JOBS[ji].title, { ox: 0.5, color: C.lime }));
  let y = top + 20;
  const card = panel(scene, 8, y, W - 16, 10); c.add(card);
  y += 10;
  for (const line of STANDARDS[ji] || []) {
    c.add(scene.add.rectangle(18, y + 4, 4, 4, hex(C.gold)).setOrigin(0));
    const t = txt(scene, 28, y, line, { maxW: W - 46, color: C.white }); c.add(t);
    y += t.height + 9;
  }
  card.setSize(W - 16, y - card.y + 2);
  y += 10;
  c.add(txt(scene, W / 2, y, STANDARDS_NOTE, { ox: 0.5, maxW: W - 30, align: 1, color: C.slate, outline: false }));
  const btn = button(scene, W / 2, H - 26, 150, 26, isTouch ? 'GOT IT' : 'GOT IT [ESC]', close, { color: 'btnGreen', textColor: C.white, depth: depth + 1 });
  scene.input.keyboard && scene.input.keyboard.on('keydown-ESC', close);
  audio.sfx('blip');
  return close;
}
