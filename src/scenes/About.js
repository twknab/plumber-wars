import Phaser from 'phaser';
import { W, H, txt, setTxt, button, wipeTo, wipeIn, panel, isTouch } from '../core/ui.js';
import { audio } from '../core/audio.js';
import { C, hex } from '../core/palette.js';
import { HEROES, DISTRICTS, districtJobs, jobNo } from '../data/content.js';
import { CREW_BLURB, HOMIE_BIOS, HOMIE_TRIBUTES, HOODS } from '../data/about.js';
import { portrait } from '../art/people.js';

const SITE = 'https://timknab.dev';
const DORDER = [0, 1, 2, 3, 5, 4]; // neighborhoods in play order (Alki before the Queen Anne showdown)
// page 0: about the game, page 1: the homies, then one page per neighborhood
const PAGES = ['about', 'homies', ...DORDER.map(d => d)];

export class About extends Phaser.Scene {
  constructor() { super('About'); }
  init() { this.page = 0; this.credits = null; }
  create() {
    wipeIn(this);
    this.add.rectangle(0, 0, W, H, hex(C.ink)).setOrigin(0);
    for (let y = 0; y < H; y += 4) this.add.rectangle(0, y, W, 1, hex(C.night), 0.6).setOrigin(0);
    this.body = this.add.container(0, 0);
    this.dots = PAGES.map((_, i) => this.add.circle(W / 2 + (i - (PAGES.length - 1) / 2) * 12, H - 50, 3, hex(C.storm)));
    this.prev = button(this, 44, H - 22, 76, 26, '< BACK', () => this.go(-1), { color: 'btnGrey', textColor: C.white, key: 'LEFT', sound: 'blip' });
    this.nextBtn = button(this, W - 50, H - 22, 88, 26, 'NEXT >', () => this.go(1), { color: 'btnGreen', textColor: C.white, key: ['RIGHT', 'ENTER', 'SPACE'], sound: 'blip' });
    this.input.keyboard.on('keydown-ESC', () => this.leave());
    this.input.keyboard.on('keydown-BACKSPACE', () => this.leave());
    this.input.keyboard.on('keydown-T', () => { if (PAGES[this.page] === 'about') this.openSite(); });
    this.input.on('pointerup', p => { const dx = p.upX - p.downX; if (Math.abs(dx) > 50 && Math.abs(p.upY - p.downY) < 60) this.go(dx < 0 ? 1 : -1); });
    fetch('districts/credits.json').then(r => r.json()).then(c => { this.credits = c; if (this.creditTxt && this.creditTxt.active) this.fillCredit(); }).catch(() => {});
    this.show();
  }
  go(d) {
    const n = this.page + d;
    if (n < 0 || n >= PAGES.length) return this.leave();
    this.page = n; this.show();
  }
  leave() { audio.sfx('select'); wipeTo(this, 'Title'); }
  openSite() { audio.sfx('select'); window.open(SITE, '_blank', 'noopener'); }
  add2(o) { this.body.add(o); return o; }
  show() {
    this.body.removeAll(true); this.creditTxt = null;
    const P = PAGES[this.page];
    if (P === 'about') this.aboutPage(); else if (P === 'homies') this.homiesPage(); else this.hoodPage(P);
    this.dots.forEach((d, i) => d.setFillStyle(i === this.page ? hex(C.gold) : hex(C.storm)));
    this.prev.label.setText(this.page === 0 ? '< EXIT' : '< BACK');
    this.nextBtn.label.setText(this.page === PAGES.length - 1 ? 'DONE' : 'NEXT >');
  }

  aboutPage() {
    this.add2(this.add.image(W / 2, 30, 'badgeBig'));
    this.add2(txt(this, W / 2, 70, 'ABOUT', { ox: 0.5, size: 3, color: C.gold }));
    const y0 = 98;
    this.add2(panel(this, 8, y0, W - 16, 138));
    this.add2(txt(this, 18, y0 + 10, "G'S PLUMBING - THE HOMIES", { color: C.lime }));
    this.add2(txt(this, 18, y0 + 24, "A LOVE LETTER TO SEATTLE'S HARDEST-WORKING (AND FUNNIEST) PLUMBING CREW. RACE NORTHWEST ACROSS TOWN, THEN FIX 16 REAL PUGET SOUND PLUMBING JOBS THE WAY A PRO WOULD - RIGHT TOOL, RIGHT ORDER, RIGHTY-TIGHTY. 6 NEIGHBORHOODS, INCLUDING TIMMY'S TUB ON ALKI BEACH.", { maxW: W - 36 }));
    this.add2(txt(this, 18, y0 + 108, 'NORTHWEST IS FICTIONAL. THEIR MOUTHS ARE FILTHY.', { color: C.pink, maxW: W - 36 }));
    const cy = y0 + 142;
    HEROES.forEach((h, i) => {
      const x = W / 2 + (i - 1) * 84;
      this.add2(this.add.rectangle(x, cy + 26, 52, 52, hex(C.storm)).setStrokeStyle(2, hex(h.color)));
      this.add2(this.add.image(x, cy + 26, portrait(this, h.id, h.look, 'happy')));
      this.add2(txt(this, x, cy + 56, h.name, { ox: 0.5, color: h.color }));
    });
    const ay = cy + 76;
    this.add2(txt(this, W / 2, ay, 'GAME BY', { ox: 0.5, color: C.silver }));
    this.add2(txt(this, W / 2, ay + 12, 'TIM KNAB', { ox: 0.5, size: 2, color: C.white }));
    this.add2(button(this, W / 2, ay + 44, 170, 28, isTouch ? 'TIMKNAB.DEV  >' : 'TIMKNAB.DEV [T]', () => this.openSite(), { color: 'btnBlue', textColor: C.white, sound: null }));
    this.add2(txt(this, W / 2, ay + 66, 'PIXELS, BANGERS & TRASH TALK ALL MADE IN CODE WITH PHASER.', { ox: 0.5, color: C.steel, maxW: W - 30, align: 1 }));
    this.add2(txt(this, W / 2, ay + 92, 'NEXT: MEET THE CREW + THE NEIGHBORHOODS >', { ox: 0.5, color: C.lime, maxW: W - 30, align: 1 }));
  }

  homiesPage() {
    this.add2(this.add.image(W / 2, 20, 'badge'));
    this.add2(txt(this, W / 2, 38, 'THE HOMIES', { ox: 0.5, size: 2, color: C.gold }));
    const intro = this.add2(txt(this, W / 2, 58, CREW_BLURB, { ox: 0.5, maxW: W - 40, align: 1, color: C.white }));
    let y = 58 + intro.height + 12;
    const cardH = Math.floor((H - 66 - y) / 3) - 6;
    HEROES.forEach(h => {
      this.add2(panel(this, 6, y, W - 12, cardH));
      this.add2(this.add.rectangle(34, y + 30, 52, 52, hex(C.storm)).setStrokeStyle(2, hex(h.color)));
      this.add2(this.add.image(34, y + 30, portrait(this, h.id, h.look, 'smug')));
      this.add2(txt(this, 66, y + 7, h.name, { color: h.color, size: 2 }));
      this.add2(txt(this, 66, y + 25, h.role, { color: C.gold }));
      const bio = this.add2(txt(this, 66, y + 39, HOMIE_BIOS[h.id], { maxW: W - 80, color: C.white }));
      this.add2(txt(this, 66, y + 45 + bio.height, HOMIE_TRIBUTES[h.id], { maxW: W - 80, color: C.gold }));
      y += cardH + 6;
    });
  }

  hoodPage(d) {
    const D = DISTRICTS[d], info = HOODS[d], n = DORDER.indexOf(d) + 1;
    this.add2(txt(this, W / 2, 8, `THE NEIGHBORHOODS  ${n}/${DORDER.length}`, { ox: 0.5, color: C.lime }));
    // the same pixel art as the district intro, full width and still
    const key = 'district_' + D.art, top = 22;
    this.add2(this.add.rectangle(W / 2, top + 86, W - 4, 174, hex(C.gold)).setStrokeStyle(2, hex(C.ink)));
    if (this.textures.exists(key)) this.add2(this.add.image(W / 2, top + 86, key));
    let y = top + 184;
    this.add2(txt(this, W / 2, y, D.name, { ox: 0.5, size: 2, color: C.gold })); y += 20;
    const jobs = districtJobs(d).map(jobNo);
    this.add2(txt(this, W / 2, y, (jobs.length > 1 ? `JOBS ${jobs[0]}-${jobs.at(-1)}` : `JOB ${jobs[0]}`) + ' - ' + D.road, { ox: 0.5, color: C.lime })); y += 20;
    const b = this.add2(txt(this, W / 2, y, info.blurb, { ox: 0.5, maxW: W - 36, align: 1, color: C.white })); y += b.height + 14;
    this.add2(txt(this, W / 2, y, 'THE PLUMBING', { ox: 0.5, color: C.cyan })); y += 12;
    this.add2(txt(this, W / 2, y, info.pipes, { ox: 0.5, maxW: W - 36, align: 1, color: C.silver }));
    this.creditTxt = this.add2(txt(this, W / 2, H - 62, '', { ox: 0.5, oy: 1, color: C.slate, outline: false, maxW: W - 20, align: 1 }));
    this.creditArt = D.art;
    if (this.credits) this.fillCredit();
  }
  fillCredit() { const x = this.credits[this.creditArt]; if (x) setTxt(this.creditTxt, `ART FROM A PHOTO BY ${x.artist} (${x.license}, WIKIMEDIA COMMONS)`); }
}
