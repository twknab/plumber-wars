import Phaser from 'phaser';
import { W, H, txt, button, wipeTo, wipeIn, panel, isTouch } from '../core/ui.js';
import { audio } from '../core/audio.js';
import { C, hex } from '../core/palette.js';

// Four-page primer. Opened from the title screen, and automatically before a brand-new game.
const PAGES = [
  { title: 'THE GIG', art: [['van'], ['iArrowU'], ['truck']],
    lines: [
      "YOU'RE THE HOMIES OF G'S PLUMBING. NORTHWEST WANTS YOUR CUSTOMERS.",
      'EVERY JOB HAS TWO HALVES:',
      '1. RACE NORTHWEST TO THE HOUSE. GET THERE FIRST OR THEY STEAL THE JOB.',
      '2. FIX THE PROBLEM FOR REAL, STEP BY STEP, BEFORE THE CUSTOMER LOSES IT.',
      '15 JOBS ACROSS 5 SEATTLE DISTRICTS, PLUS A BONUS AT ALKI BEACH. IT GETS HARDER AS YOU GO.',
    ] },
  { title: 'THE RACE', art: [['coffee'], ['cone'], ['pothole'], ['turd'], ['cyclist', 0]],
    lines: [
      isTouch ? 'DRAG ANYWHERE TO STEER.' : 'ARROWS / A-D TO STEER.',
      isTouch ? 'BOOST: BURN AN ESPRESSO. HONK: CLEAR YOUR LANE.' : 'SPACE = BOOST (ESPRESSO). H = HONK TO CLEAR YOUR LANE.',
      'GRAB COFFEE CUPS FOR BOOSTS AND RED KITS TO FIX THE VAN.',
      'DODGE CARS, CYCLISTS, POTHOLES, PUDDLES, OIL AND WHATEVER SKEETER THROWS.',
      'WHEN THE TRUCK FLASHES RED IT\'S ABOUT TO RAM YOU. SWERVE! STEER INTO IT TO SHOVE IT INTO THE CURB.',
      'LOSE ALL YOUR ARMOR OR GET BEAT TO THE HOUSE = RETRY.',
    ] },
  { title: 'THE REPAIR', art: [['tool_hand'], ['tool_wrench'], ['tool_plunger'], ['tool_driver'], ['tool_bucket']],
    lines: [
      'EACH STEP: 1) PICK THE RIGHT TOOL FROM THE TRUCK TRAY, 2) DO THE MOVE.',
      'CIRCLE YOUR FINGER TO TURN. RIGHTY-TIGHTY (CLOCKWISE) CLOSES, LEFTY-LOOSEY OPENS.',
      'TAP IN THE GREEN, HOLD AND RELEASE IN THE GREEN, DRAG PARTS, PULL ALONG THE ARROW, SCRUB, TAP LEAKS.',
      'WRONG TOOL OR WRONG ORDER COSTS TIME AND PISSES OFF THE CUSTOMER.',
      'FROM CAPITOL HILL ON YOU PICK THE NEXT STEP YOURSELF. READ THE PRO TIPS!',
    ] },
  { title: 'HOMIES & SAVING', art: [['badge'], ['iStar'], ['iStar'], ['iStar']],
    lines: [
      'PICK A LEAD: DALTON DRIVES, MILAN FIXES, JARED CHARMS.',
      'THE OTHER TWO EACH HELP ONCE PER JOB. IN THE RACE, THE GOLD CLEAR ROAD BUTTON IS DALTON WIPING OUT THE TRAFFIC AHEAD. IN REPAIRS: MILAN AUTO-FIXES A STEP, JARED BUYS +12 SECONDS.',
      'STARS: FINISH FAST, MAKE FEW MISTAKES, KEEP THE VAN IN ONE PIECE.',
      'YOUR GAME SAVES AUTOMATICALLY AFTER EVERY FINISHED JOB. HIT CONTINUE ON THE TITLE SCREEN TO PICK UP WHERE YOU LEFT OFF.',
      'SAVES LIVE IN THIS BROWSER ON THIS DEVICE. IN THE MIDDLE OF A JOB? PAUSE, THEN RESUME.',
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
    const top = 66; this.body.add(panel(this, 8, top, W - 16, H - top - 78));
    this.body.add(txt(this, W / 2, top + 10, `${this.page + 1}. ${P.title}`, { ox: 0.5, color: C.lime, size: 2 }));
    // sprite strip
    const n = P.art.length; P.art.forEach(([k, f], i) => { const im = this.add.image(W / 2 + (i - (n - 1) / 2) * 46, top + 52, k, f).setScale(k.startsWith('tool_') ? 1.6 : ['van', 'truck'].includes(k) ? 1.2 : 2); this.body.add(im); });
    let y = top + 84;
    for (const ln of P.lines) { const t = txt(this, 20, y, ln, { maxW: W - 40, color: C.white }); this.body.add(t); y += t.height + 7; }
    this.dots.forEach((d, i) => d.setFillStyle(i === this.page ? hex(C.gold) : hex(C.storm)));
    this.prev.label.setText(this.page === 0 ? '< EXIT' : '< BACK');
    this.nextBtn.label.setText(this.page === PAGES.length - 1 ? (this.next === 'Title' ? 'GOT IT!' : "LET'S GO!") : 'NEXT >');
  }
}
