import Phaser from 'phaser';
import { W, H, txt, button, wipeTo, wipeIn, panel, isTouch } from '../core/ui.js';
import { audio } from '../core/audio.js';
import { C, hex } from '../core/palette.js';
import { HEROES } from '../data/content.js';
import { portrait } from '../art/people.js';

const SITE = 'https://timknab.dev';

export class About extends Phaser.Scene {
  constructor() { super('About'); }
  create() {
    wipeIn(this);
    this.add.rectangle(0, 0, W, H, hex(C.ink)).setOrigin(0);
    for (let y = 0; y < H; y += 4) this.add.rectangle(0, y, W, 1, hex(C.night), 0.6).setOrigin(0);
    this.add.image(W / 2, 30, 'badgeBig');
    txt(this, W / 2, 70, 'ABOUT', { ox: 0.5, size: 3, color: C.gold });

    const y0 = 98;
    panel(this, 8, y0, W - 16, 138);
    txt(this, 18, y0 + 10, "G'S PLUMBING - THE HOMIES", { color: C.lime });
    txt(this, 18, y0 + 24, "A LOVE LETTER TO SEATTLE'S HARDEST-WORKING (AND FUNNIEST) PLUMBING CREW. RACE NORTHWEST ACROSS TOWN, THEN FIX 16 REAL PUGET SOUND PLUMBING JOBS THE WAY A PRO WOULD - RIGHT TOOL, RIGHT ORDER, RIGHTY-TIGHTY. 5 DISTRICTS + AN ALKI BEACH BONUS AT JIMMY'S.", { maxW: W - 36 });
    txt(this, 18, y0 + 108, 'NORTHWEST IS FICTIONAL. THEIR MOUTHS ARE FILTHY.', { color: C.pink, maxW: W - 36 });

    // the crew
    const cy = y0 + 142;
    HEROES.forEach((h, i) => {
      const x = W / 2 + (i - 1) * 84;
      this.add.rectangle(x, cy + 26, 52, 52, hex(C.storm)).setStrokeStyle(2, hex(h.color));
      this.add.image(x, cy + 26, portrait(this, h.id, h.look, 'happy'));
      txt(this, x, cy + 56, h.name, { ox: 0.5, color: h.color });
    });

    const ay = cy + 76;
    txt(this, W / 2, ay, 'GAME BY', { ox: 0.5, color: C.silver });
    txt(this, W / 2, ay + 12, 'TIM KNAB', { ox: 0.5, size: 2, color: C.white });
    const open = () => { audio.sfx('select'); window.open(SITE, '_blank', 'noopener'); };
    button(this, W / 2, ay + 44, 170, 28, 'TIMKNAB.DEV  >', open, { color: 'btnBlue', textColor: C.white, sound: null, key: 'T' });
    txt(this, W / 2, ay + 66, 'PIXELS, CHIPTUNES & TRASH TALK ALL MADE IN CODE WITH PHASER.', { ox: 0.5, color: C.steel, maxW: W - 30, align: 1 });

    button(this, W / 2, H - 22, 150, 26, isTouch ? '< BACK' : '< BACK [ESC]', () => wipeTo(this, 'Title'), { color: 'btnGrey', textColor: C.white, key: ['ESC', 'BACKSPACE'] });
  }
}
