import Phaser from 'phaser';
import { W, H, txt, button, wipeTo, wipeIn, bubble } from '../core/ui.js';
import { audio } from '../core/audio.js';
import { progress, store } from '../core/save.js';
import { C, hex } from '../core/palette.js';
import { HEROES, RIVALS } from '../data/content.js';
import { portrait, body } from '../art/people.js';
import { skyline } from '../art/brand.js';
import { shareScore } from '../core/share.js';

// Victory: fireworks over the Sound, Northwest goes out of business, credits roll.
export class Finale extends Phaser.Scene {
  constructor() { super('Finale'); }
  create() {
    wipeIn(this); audio.music('finale');
    if (!this.textures.exists('nightSky')) skyline(this, 'nightSky', W, H, { mood: 'night' });
    this.add.image(0, 0, 'nightSky').setOrigin(0);
    // fireworks
    const cols = [0xfee761, 0xe43b44, 0x63c74d, 0x2ce8f5, 0xf6757a, 0xfeae34];
    this.time.addEvent({ delay: 450, loop: true, callback: () => {
      const x = Phaser.Math.Between(30, W - 30), y = Phaser.Math.Between(40, H * 0.4), c = Phaser.Utils.Array.GetRandom(cols);
      audio.sfx('crack');
      for (let i = 0; i < 18; i++) { const a = i / 18 * Math.PI * 2; const s = this.add.image(x, y, 'dot').setTint(c); this.tweens.add({ targets: s, x: x + Math.cos(a) * 34, y: y + Math.sin(a) * 34 + 10, alpha: 0, duration: 900, ease: 'Quad.out', onComplete: () => s.destroy() }); }
    } });
    const logo = this.add.image(W / 2, 40, 'badgeBig');
    this.tweens.add({ targets: logo, scale: 1.1, yoyo: true, repeat: -1, duration: 400 });
    txt(this, W / 2, 84, "THE SOUND IS G'S COUNTRY!", { ox: 0.5, size: 2, color: C.gold });
    txt(this, W / 2, 104, 'ALL 16 JOBS. ALL 6 NEIGHBORHOODS. ZERO FLOODS (MOSTLY).', { ox: 0.5, color: C.white, maxW: 250, align: 1 });
    // crew on stage
    const gy = H * 0.64;
    HEROES.forEach((h, i) => {
      const x = W / 2 + (i - 1) * 70;
      this.add.image(x, gy - 30, portrait(this, h.id, h.look, 'happy'));
      txt(this, x, gy - 62, h.name, { ox: 0.5, color: h.color });
      const b = this.add.sprite(x, gy + 40, body(this, h.id, h.look), 1).setOrigin(0.5, 1).setScale(1.5);
      this.tweens.add({ targets: b, y: gy + 30, yoyo: true, repeat: -1, duration: 260 + i * 40 });
    });
    // Northwest's sad exit
    // (drives off to the right: flipping the sprite would mirror the NORTHWEST lettering)
    const tr = this.add.sprite(-120, H - 64, 'sideTruck').setOrigin(0.5, 1);
    this.tweens.add({ targets: tr, x: W + 120, duration: 6000, delay: 1500, repeat: -1, repeatDelay: 3000 });
    this.add.image(40, H - 110, portrait(this, 'randy', RIVALS.randy.look, 'worried')).setScale(0.8);
    this.time.delayedCall(2200, () => bubble(this, 70, H - 136, 'FINE! WE\'RE MOVING TO TACOMA! YOU WIN, YOU BEAUTIFUL BASTARDS!', { dur: 3500, maxW: 170 }));
    this.time.delayedCall(2600, () => audio.say("FINE! WE'RE MOVING TO TACOMA! YOU WIN, YOU BEAUTIFUL BASTARDS!"));
    txt(this, W / 2, 128, `TOTAL SCORE ${progress.totalScore().toLocaleString('en-US')}   \` ${progress.totalStars()}/48`, { ox: 0.5, color: C.yellow });
    // champions go on the board
    const post = button(this, W / 2 - 36, H - 62, 150, 28, 'POST YOUR SCORE!', () => wipeTo(this, 'Scores', { enter: true, from: 'Finale' }), { color: 'btnGold', key: 'ENTER' });
    this.tweens.add({ targets: post, scale: 1.06, yoyo: true, repeat: -1, duration: 450 });
    // once the credits roll off, take a new champion straight to the initials screen (first time only)
    if (!store.get('finalePosted', false) && progress.totalScore() > store.get('postedScore', 0)) this.time.delayedCall(11500, () => { if (this.sys.isActive()) { store.set('finalePosted', true); wipeTo(this, 'Scores', { enter: true, from: 'Finale' }); } });
    button(this, W / 2 + 80, H - 62, 66, 28, 'SHARE', () => shareScore(this, `I beat Plumber Wars! All 16 jobs, total score ${progress.totalScore().toLocaleString('en-US')}. Think you can beat the homies?`), { color: 'btnBlue', textColor: C.white, key: 'S' });
    button(this, W / 2, H - 26, 170, 24, 'BACK TO DISPATCH', () => wipeTo(this, 'Map'), { color: 'btnGreen', textColor: C.white, key: 'M' });
    // credits crawl
    const cr = txt(this, W / 2, H + 10, "G'S PLUMBING PRESENTS\nPLUMBER WARS\n\nSTARRING\nDALTON - MILAN - JARED\n\nAND BIG RANDY AS HIMSELF\n\nNO TOILETS WERE HARMED\n(SOME WERE HARMED)", { ox: 0.5, align: 1, color: C.silver, depth: 5 });
    cr.setAlpha(0.8); this.tweens.add({ targets: cr, y: H * 0.42, duration: 9000, delay: 1000, onComplete: () => this.tweens.add({ targets: cr, alpha: 0, duration: 800 }) });
  }
}
