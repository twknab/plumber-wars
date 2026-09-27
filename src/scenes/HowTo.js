import Phaser from 'phaser';
import { W, H, txt, button, wipeTo, wipeIn, panel, isTouch } from '../core/ui.js';
import { audio } from '../core/audio.js';
import { C, hex } from '../core/palette.js';

// Four-page primer. Opened from the title screen, and automatically before a brand-new game.
// Each line: [gold keyword, the rest]. Keep it to a glance - players won't read paragraphs.
const PAGES = [
  { title: 'THE GIG', art: [['van'], ['iArrowU'], ['truck']],
    lines: [
      ['RACE', 'NORTHWEST TO THE HOUSE.'],
      ['FIX', 'THE JOB BEFORE THE CUSTOMER SNAPS.'],
      ['WIN', 'SEATTLE, ONE TOILET AT A TIME.'],
    ] },
  { title: 'THE RACE', art: [['coffee'], ['cone'], ['turd'], ['cyclist', 0]],
    lines: [
      [isTouch ? 'DRAG' : 'ARROWS', 'TO STEER.'],
      [isTouch ? 'BOOST' : 'SPACE', 'BURNS AN ESPRESSO. GRAB CUPS FOR MORE.'],
      ['RED TRUCK', '= RAM INCOMING. SWERVE!'],
    ] },
  { title: 'THE REPAIR', art: [['tool_hand'], ['tool_wrench'], ['tool_plunger'], ['tool_bucket']],
    lines: [
      ['TAP', 'THE RIGHT TOOL IN THE TRAY.'],
      ['DO', 'THE MOVE. CIRCLE = TURN (RIGHTY-TIGHTY).'],
      ['TOOLS?', 'PAUSES AND NAMES EVERY TOOL. WRONG ONE = LOST TIME.'],
    ] },
  { title: 'THE HOMIES', art: [['badge'], ['iStar'], ['iStar'], ['iStar']],
    lines: [
      ['GOLD', 'BUTTONS = A HOMIE HELPS, ONCE PER JOB.'],
      ['STARS', 'FOR SPEED, FEW MISTAKES, NO DENTS.'],
      ['SAVES', 'AUTOMATICALLY AFTER EVERY JOB.'],
    ] },
];

export class HowTo extends Phaser.Scene {
  constructor() { super('HowTo'); }
  init({ next = 'Title' } = {}) { this.next = next; this.page = 0; }
  create() {
    wipeIn(this);
    this.add.rectangle(0, 0, W, H, hex(C.ink)).setOrigin(0);
    for (let y = 0; y < H; y += 4) this.add.rectangle(0, y, W, 1, hex(C.night), 0.6).setOrigin(0);
    this.add.image(W / 2, 22, 'badge');
    txt(this, W / 2, 44, 'HOW TO PLAY', { ox: 0.5, size: 2, color: C.gold });
    this.body = this.add.container(0, 0);
    this.dots = PAGES.map((_, i) => this.add.circle(W / 2 + (i - 1.5) * 12, H - 62, 3, hex(C.storm)));
    this.prev = button(this, 50, H - 24, 80, 26, '< BACK', () => this.go(-1), { color: 'btnGrey', textColor: C.white, key: 'LEFT', sound: 'blip' });
    this.nextBtn = button(this, W - 60, H - 24, 100, 26, 'NEXT >', () => this.go(1), { color: 'btnGreen', textColor: C.white, key: ['RIGHT', 'ENTER', 'SPACE'], sound: 'blip' });
    this.input.keyboard.on('keydown-ESC', () => this.leave());
    button(this, W - 30, 22, 48, 18, 'SKIP', () => this.leave(), { color: 'btnGrey', textColor: C.white, sound: 'blip' });
    // swipe between pages
    this.input.on('pointerup', p => { const dx = p.upX - p.downX; if (Math.abs(dx) > 50 && Math.abs(p.upY - p.downY) < 60) this.go(dx < 0 ? 1 : -1); });
    this.show();
  }
  go(d) {
    const n = this.page + d;
    if (n < 0) return this.leave();
    if (n >= PAGES.length) return this.leave();
    this.page = n; this.show();
  }
  leave() { audio.sfx('select'); wipeTo(this, this.next); }
  show() {
    const P = PAGES[this.page]; this.body.removeAll(true);
    const top = 66, bottom = H - 78;
    this.body.add(panel(this, 8, top, W - 16, bottom - top));
    const parts = [];
    parts.push(txt(this, W / 2, 0, `${this.page + 1}. ${P.title}`, { ox: 0.5, color: C.lime, size: 2 }));
    // sprite strip
    const n = P.art.length; const artY = 58;
    P.art.forEach(([k, f], i) => parts.push(this.add.image(W / 2 + (i - (n - 1) / 2) * 52, artY, k, f).setScale(k.startsWith('tool_') ? 2 : ['van', 'truck'].includes(k) ? 1.2 : 2.5)));
    let y = artY + 48;
    for (const [key, rest] of P.lines) {
      parts.push(txt(this, W / 2, y, key, { ox: 0.5, color: C.gold, size: 2 }));
      const t = txt(this, W / 2, y + 18, rest, { ox: 0.5, maxW: W - 44, color: C.white, align: 1 }); parts.push(t);
      y += 18 + t.height + 22;
    }
    // centre the whole block in the card
    const dy = top + Math.max(12, Math.round((bottom - top - y) / 2));
    for (const o of parts) { o.y += dy; this.body.add(o); }
    this.dots.forEach((d, i) => d.setFillStyle(i === this.page ? hex(C.gold) : hex(C.storm)));
    this.prev.label.setText(this.page === 0 ? '< EXIT' : '< BACK');
    this.nextBtn.label.setText(this.page === PAGES.length - 1 ? (this.next === 'Title' ? 'GOT IT!' : "LET'S GO!") : 'NEXT >');
  }
}
