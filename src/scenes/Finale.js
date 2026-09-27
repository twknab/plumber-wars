import Phaser from 'phaser';
import { W, H, txt, button, wipeTo, wipeIn, bubble } from '../core/ui.js';
import { audio } from '../core/audio.js';
import { progress } from '../core/save.js';
import { C, hex } from '../core/palette.js';
import { HEROES, RIVALS } from '../data/content.js';
import { portrait, body } from '../art/people.js';
import { skyline } from '../art/brand.js';

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
    txt(this, W / 2, 104, 'ALL 15 JOBS. ALL 5 DISTRICTS. ZERO FLOODS (MOSTLY).', { ox: 0.5, color: C.white, maxW: 250, align: 1 });
    // crew on stage
    const gy = H * 0.64;
    HEROES.forEach((h, i) => {
      const x = W / 2 + (i - 1) * 70;
      this.add.image(x, gy - 30, portrait(this, h.id, h.look, 'happy'));
      txt(this, x, gy, h.name, { ox: 0.5, color: h.color });
      const b = this.add.sprite(x, gy + 40, body(this, h.id, h.look), 1).setOrigin(0.5, 1).setScale(1.5);
      this.tweens.add({ targets: b, y: gy + 30, yoyo: true, repeat: -1, duration: 260 + i * 40 });
    });
    // Northwest's sad exit
    const tr = this.add.sprite(W + 100, H - 64, 'sideTruck').setOrigin(0.5, 1).setFlipX(true);
    this.tweens.add({ targets: tr, x: -120, duration: 6000, delay: 1500, repeat: -1, repeatDelay: 3000 });
    this.add.image(40, H - 110, portrait(this, 'randy', RIVALS.randy.look, 'worried')).setScale(0.8);
    this.time.delayedCall(2200, () => bubble(this, 70, H - 136, 'FINE! WE\'RE MOVING TO TACOMA! YOU WIN, YOU BEAUTIFUL BASTARDS!', { dur: 3500, maxW: 170 }));
    this.time.delayedCall(2600, () => audio.say("Fine! We're moving to Tacoma!", { pitch: 0.5 }));
    const total = progress.totalStars();
    txt(this, W / 2, H - 48, `TOTAL STARS: ${total}/45`, { ox: 0.5, color: C.yellow });
    button(this, W / 2, H - 22, 170, 24, 'BACK TO DISPATCH', () => wipeTo(this, 'Map'), { color: 'btnGreen', textColor: C.white });
    // credits crawl
    const cr = txt(this, W / 2, H + 10, "G'S PLUMBING PRESENTS\nPLUMBER WARS\n\nSTARRING\nDALTON - MILAN - JARED\n\nAND BIG RANDY AS HIMSELF\n\nNO TOILETS WERE HARMED\n(SOME WERE HARMED)", { ox: 0.5, align: 1, color: C.silver, depth: 5 });
    cr.setAlpha(0.8); this.tweens.add({ targets: cr, y: H * 0.42, duration: 9000, delay: 1000, onComplete: () => this.tweens.add({ targets: cr, alpha: 0, duration: 800 }) });
  }
}
