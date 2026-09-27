import Phaser from 'phaser';
import { W, H, txt, button, wipeTo, wipeIn, panel, soundToggle, isTouch } from '../core/ui.js';
import { audio } from '../core/audio.js';
import { progress } from '../core/save.js';
import { C, hex } from '../core/palette.js';
import { HEROES } from '../data/content.js';
import { portrait } from '../art/people.js';

// Mega Man-style "select your homie" screen.
export class Crew extends Phaser.Scene {
  constructor() { super('Crew'); }
  create() {
    wipeIn(this);
    audio.music('map');
    this.add.rectangle(0, 0, W, H, hex(C.ink)).setOrigin(0);
    // scrolling diagonal stripes backdrop
    const g = this.add.graphics(); this.stripes = g;
    this.add.image(W / 2, 22, 'badge');
    txt(this, W / 2, 46, 'PICK YOUR LEAD HOMIE', { ox: 0.5, size: 2, color: C.gold });
    txt(this, W / 2, 64, 'THE OTHER TWO RIDE SHOTGUN AS BACKUP', { ox: 0.5, color: C.silver });
    this.sel = HEROES.findIndex(h => h.id === progress.hero); if (this.sel < 0) this.sel = 0;
    const cardH = Math.min(118, Math.floor((H - 130) / 3) - 6);
    this.cards = HEROES.map((h, i) => {
      const y = 80 + i * (cardH + 6);
      const c = this.add.container(0, y);
      const bg = panel(this, 8, 0, W - 16, cardH); c.add(bg);
      const fr = this.add.rectangle(38, cardH / 2, 54, 54, hex(C.storm)).setStrokeStyle(2, hex(h.color)); c.add(fr);
      const pimg = this.add.image(38, cardH / 2, portrait(this, h.id, { ...h.look, patch: true }, 'happy')); c.add(pimg);
      c.add(txt(this, 72, 10, h.name, { size: 2, color: h.color }));
      c.add(txt(this, 72, 28, h.role, { color: C.white }));
      ['drive', 'fix', 'charm'].forEach((k, j) => {
        c.add(txt(this, 72, 42 + j * 10, k.toUpperCase(), { color: C.silver }));
        for (let s = 0; s < 5; s++) c.add(this.add.rectangle(112 + s * 9, 45 + j * 10, 7, 5, s < h.stats[k] ? hex(h.color) : hex(C.storm)).setOrigin(0, 0.5));
      });
      c.add(txt(this, 72, 74, h.perk, { color: C.white, maxW: W - 90 }));
      bg.setInteractive({ useHandCursor: true }).on('pointerup', () => { audio.unlock(); this.pick(i); });
      c.frame = fr; c.bgp = bg; c.pimg = pimg;
      return c;
    });
    this.go = button(this, W / 2, H - 22, 180, 30, "LET'S ROLL!", () => { progress.hero = HEROES[this.sel].id; audio.sfx('go'); wipeTo(this, 'Map'); }, { color: 'btnGreen', textColor: C.white, key: ['ENTER', 'SPACE'] });
    const kb = this.input.keyboard;
    kb.on('keydown-UP', () => this.pick((this.sel + 2) % 3)); kb.on('keydown-DOWN', () => this.pick((this.sel + 1) % 3));
    kb.on('keydown-LEFT', () => this.pick((this.sel + 2) % 3)); kb.on('keydown-RIGHT', () => this.pick((this.sel + 1) % 3));
    ['ONE', 'TWO', 'THREE'].forEach((k, i) => kb.on('keydown-' + k, () => this.pick(i)));
    if (!isTouch) txt(this, W / 2, H - 46, 'ARROWS TO PICK - ENTER TO ROLL', { ox: 0.5, color: C.gold });
    soundToggle(this);
    this.pick(this.sel, true);
  }
  pick(i, quiet) {
    this.sel = i;
    this.cards.forEach((c, j) => { c.setAlpha(j === i ? 1 : 0.55); c.x = j === i ? 0 : 6; c.pimg.setTexture(portrait(this, HEROES[j].id, { ...HEROES[j].look, patch: true }, j === i ? 'smug' : 'happy')); });
    if (!quiet) { audio.sfx('select'); audio.say(HEROES[i].barks[0], { pitch: HEROES[i].pitch, rate: 1.2 }); }
  }
  update(t) {
    const g = this.stripes; g.clear(); g.fillStyle(hex(C.night), 1);
    const o = (t / 40) % 40;
    for (let x = -H; x < W + H; x += 40) g.fillPoints([{ x: x + o, y: 0 }, { x: x + o + 18, y: 0 }, { x: x + o + 18 - H, y: H }, { x: x + o - H, y: H }], true);
  }
}
