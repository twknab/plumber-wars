import Phaser from 'phaser';
import { W, H, txt, isTouch } from '../core/ui.js';
import { audio } from '../core/audio.js';
import { C, hex } from '../core/palette.js';
import { TRASH, pick } from '../data/content.js';

// "Press start" gate. Browsers block all audio until the player taps or presses a key, so the very
// first interaction happens here - and the music + a Northwest insult fire right on it.
// Start on pointerUP: phone browsers only unlock sound on touch-end, never on touch-start.
export class Splash extends Phaser.Scene {
  constructor() { super('Splash'); }
  create() {
    this.add.rectangle(0, 0, W, H, hex(C.ink)).setOrigin(0);
    for (let y = 0; y < H; y += 4) this.add.rectangle(0, y, W, 1, hex(C.night), 0.6).setOrigin(0);
    const b = this.add.image(W / 2, H * 0.34, 'badgeBig').setScale(1.5);
    this.tweens.add({ targets: b, angle: { from: -5, to: 5 }, yoyo: true, repeat: -1, duration: 900, ease: 'Sine.inOut' });
    txt(this, W / 2, H * 0.34 + 66, "G'S PLUMBING PRESENTS", { ox: 0.5, color: C.lime });
    const go = txt(this, W / 2, H * 0.62, isTouch ? 'TAP TO START' : 'CLICK OR PRESS ANY KEY', { ox: 0.5, size: 2, color: C.gold });
    this.tweens.add({ targets: go, alpha: 0.2, yoyo: true, repeat: -1, duration: 450 });
    txt(this, W / 2, H * 0.62 + 26, 'SOUND ON. PLUMBERS SWEAR.', { ox: 0.5, color: C.silver });
    let started = false;
    const start = () => {
      if (started) return; started = true;
      audio.unlock(); audio.sfx('go'); audio.music('title');
      const line = pick(TRASH.taunt);
      audio.say(['WELCOME TO PLUMBER WARS!', line]);
      this.cameras.main.flash(120, 254, 174, 52);
      this.time.delayedCall(180, () => this.scene.start('Title'));
    };
    this.input.once('pointerup', start);
    this.input.keyboard.once('keydown', start);
  }
}
