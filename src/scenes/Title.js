import Phaser from 'phaser';
import { W, H, txt, button, wipeTo, wipeIn, soundToggle, bubble, hitZone, isTouch } from '../core/ui.js';
import { audio } from '../core/audio.js';
import { progress } from '../core/save.js';
import { C, hex } from '../core/palette.js';
import { skyline } from '../art/brand.js';
import { TRASH, pick } from '../data/content.js';

export class Title extends Phaser.Scene {
  constructor() { super('Title'); }
  create() {
    wipeIn(this);
    if (!this.textures.exists('titleSky')) skyline(this, 'titleSky', W, H, { mood: 'sunset' });
    this.add.image(0, 0, 'titleSky').setOrigin(0);
    // twinkle
    for (let i = 0; i < 14; i++) { const s = this.add.image(Phaser.Math.Between(4, W - 4), Phaser.Math.Between(4, H * 0.25), 'dot').setAlpha(0.6).setScale(0.5); this.tweens.add({ targets: s, alpha: 0.1, yoyo: true, repeat: -1, duration: 600 + i * 90 }); }
    // road strip at the bottom
    const roadY = H - 58;
    this.add.rectangle(0, roadY, W, 58, hex(C.night)).setOrigin(0);
    this.add.rectangle(0, roadY, W, 3, hex(C.slate)).setOrigin(0);
    for (let x = 0; x < W; x += 24) this.add.rectangle(x, roadY + 30, 12, 2, hex(C.gold)).setOrigin(0);
    // logo block
    const badge = this.add.image(W / 2, 40, 'badgeBig');
    this.tweens.add({ targets: badge, angle: { from: -6, to: 6 }, yoyo: true, repeat: -1, duration: 1400, ease: 'Sine.inOut' });
    this.add.image(W / 2, 86, 'logoSub');
    const logo = this.add.image(W / 2, 98, 'logo').setOrigin(0.5, 0);
    logo.y = -120; this.tweens.add({ targets: logo, y: 98, duration: 700, ease: 'Bounce.out', delay: 200 });
    const vs = txt(this, W / 2, 190, "THE COOL HOMIES  VS  NORTHWEST", { ox: 0.5, color: C.yellow });
    this.tweens.add({ targets: vs, alpha: 0.4, yoyo: true, repeat: -1, duration: 500 });
    txt(this, W / 2, 202, 'A PUGET SOUND PLUMBING TURF WAR', { ox: 0.5, color: C.silver });

    // van rolls in, truck tears past
    this.anims.create({ key: 'vanroll', frames: this.anims.generateFrameNumbers('sideVan'), frameRate: 12, repeat: -1 });
    this.anims.create({ key: 'truckroll', frames: this.anims.generateFrameNumbers('sideTruck'), frameRate: 14, repeat: -1 });
    const truck = this.add.sprite(-200, roadY + 2, 'sideTruck').setOrigin(0.5, 1).play('truckroll');
    const van = this.add.sprite(-150, roadY + 24, 'sideVan').setOrigin(0.5, 1).play('vanroll');
    this.tweens.add({ targets: van, x: W / 2 - 40, duration: 1600, ease: 'Cubic.out', delay: 500, onComplete: () => van.anims.pause() });
    this.time.addEvent({ delay: 5200, loop: true, callback: () => {
      truck.x = -100; this.tweens.add({ targets: truck, x: W + 120, duration: 1500, ease: 'Linear' });
      audio.sfx('nwhonk');
      this.time.delayedCall(550, () => bubble(this, W / 2 + 20, roadY - 70, pick(TRASH.taunt), { dur: 1800, maxW: 160 }));
    } });
    // puffs from van exhaust
    this.time.addEvent({ delay: 260, loop: true, callback: () => { const p = this.add.image(van.x - 62, van.y - 10, 'puff', 0).setAlpha(0.7); this.tweens.add({ targets: p, x: p.x - 16, y: p.y - 6, alpha: 0, scale: 2, duration: 700, onComplete: () => p.destroy() }); } });

    // menu
    const has = progress.unlocked > 0 && progress.hero;
    const by = H - 150;
    if (has) {
      button(this, W / 2, by, 150, 26, 'CONTINUE', () => this.go('Map'), { size: 1, key: 'ENTER' });
      button(this, W / 2, by + 32, 150, 22, 'NEW GAME', () => this.confirmNew(), { color: 'btnGrey', textColor: C.white, key: 'N' });
    } else {
      const b = button(this, W / 2, by + 10, 170, 30, isTouch ? 'TAP TO START' : 'PRESS ENTER', () => this.go('Crew'), { size: 1, key: ['ENTER', 'SPACE'] });
      this.tweens.add({ targets: b, scale: 1.06, yoyo: true, repeat: -1, duration: 500 });
    }
    soundToggle(this);
    const vo = txt(this, 10, 10, '', { color: C.white });
    const vlabel = () => vo.setText((audio.voices ? 'VOICES: ON' : 'VOICES: OFF') + (isTouch ? '' : ' [V]'));
    vlabel();
    const vt = () => { audio.unlock(); audio.setVoices(!audio.voices); vlabel(); if (audio.voices) audio.say("Get out of our lane, homies!"); };
    this.add.rectangle(4, 4, 76, 20, 0x181425, 0.6).setOrigin(0).setStrokeStyle(1, 0x5a6988);
    hitZone(this, 44, 14, 88, 32, vt, 96);
    this.input.keyboard.on('keydown-V', vt);
    txt(this, W / 2, H - 10, 'NSFW: PLUMBERS SWEAR. A LOT.', { ox: 0.5, color: C.silver });
    this.input.once('pointerdown', () => { audio.unlock(); audio.music('title'); });
    if (audio.ctx) audio.music('title');
  }
  confirmNew() {
    const c = this.add.container(0, 0).setDepth(200);
    c.add(this.add.rectangle(0, 0, W, H, 0x000000, 0.7).setOrigin(0).setInteractive());
    c.add(txt(this, W / 2, H / 2 - 40, 'WIPE ALL PROGRESS?', { ox: 0.5, color: C.red, size: 2 }));
    c.add(button(this, W / 2 - 55, H / 2, 90, 24, 'YES, WIPE', () => { progress.reset(); this.go('Crew'); }, { color: 'btnRed', textColor: C.white, depth: 201, key: 'Y' }));
    c.add(button(this, W / 2 + 55, H / 2, 90, 24, 'NO', () => c.destroy(), { color: 'btnGrey', textColor: C.white, depth: 201, key: 'ESC' }));
  }
  go(k) { audio.unlock(); wipeTo(this, k); }
}
