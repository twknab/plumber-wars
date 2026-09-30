import Phaser from 'phaser';
import { W, H, txt, button, wipeTo, wipeIn, soundToggle, bubble, hitZone, isTouch } from '../core/ui.js';
import { audio } from '../core/audio.js';
import { shareScore } from '../core/share.js';
import { progress } from '../core/save.js';
import { C, hex } from '../core/palette.js';
import { skyline } from '../art/brand.js';
import { TRASH, pick, ORDER } from '../data/content.js';

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
    const vs = txt(this, W / 2, 190, "THE HOMIES  VS  NORTHWEST", { ox: 0.5, color: C.yellow });
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
      this.time.delayedCall(550, () => { const line = pick(TRASH.taunt); bubble(this, W / 2 + 20, roadY - 70, line, { dur: 1800, maxW: 160 }); if (audio.ctx) audio.say(line); });
    } });
    // an orca cruises Elliott Bay and breaches every so often
    const wy = Math.round(H * 0.62) + 46;
    const fin = this.add.image(-20, wy, 'fin').setOrigin(0.5, 1);
    const orca = this.add.image(0, wy, 'orca').setVisible(false);
    const cruise = () => {
      const x0 = Phaser.Math.Between(20, 60), x1 = Phaser.Math.Between(150, 200);
      fin.setPosition(x0, wy).setVisible(true).setAlpha(1);
      this.tweens.add({ targets: fin, x: (x0 + x1) / 2, duration: 2000, ease: 'Linear', onComplete: () => breach((x0 + x1) / 2, x1) });
    };
    const splash = (x) => { for (let i = 0; i < 10; i++) { const d = this.add.image(x, wy, 'drop').setScale(1.5); this.tweens.add({ targets: d, x: x + Phaser.Math.Between(-16, 16), y: wy - Phaser.Math.Between(6, 20), alpha: 0, duration: 450, yoyo: false, onComplete: () => d.destroy() }); } };
    const breach = (xa, xb) => {
      fin.setVisible(false); splash(xa);
      orca.setPosition(xa, wy).setVisible(true).setAngle(-35);
      this.tweens.add({ targets: orca, x: xa + 70, duration: 1200, ease: 'Linear' });
      this.tweens.add({ targets: orca, y: wy - 44, duration: 600, ease: 'Quad.out', yoyo: true, onComplete: () => { orca.setVisible(false); splash(orca.x); audio.sfx('splash'); } });
      this.tweens.add({ targets: orca, angle: 40, duration: 1200 });
      this.time.delayedCall(Phaser.Math.Between(3500, 6500), cruise);
    };
    this.time.delayedCall(800, cruise);
    // puffs from van exhaust
    this.time.addEvent({ delay: 260, loop: true, callback: () => { const p = this.add.image(van.x - 62, van.y - 10, 'puff', 0).setAlpha(0.7); this.tweens.add({ targets: p, x: p.x - 16, y: p.y - 6, alpha: 0, scale: 2, duration: 700, onComplete: () => p.destroy() }); } });

    // menu
    const has = progress.unlocked > 0 && progress.hero;
    const by = H - 176;
    const k = isTouch ? '' : ' [?]';
    if (has) {
      button(this, W / 2, by, 156, 26, 'CONTINUE', () => this.go('Map'), { size: 1, key: 'ENTER' });
      txt(this, W / 2, by - 22, `AUTO-SAVED: JOB ${Math.min(ORDER.length, progress.unlocked + 1)} OF ${ORDER.length}`, { ox: 0.5, color: C.lime });
      button(this, W / 2 - 40, by + 32, 76, 22, 'NEW GAME', () => this.confirmNew(), { color: 'btnGrey', textColor: C.white, key: 'N' });
      button(this, W / 2 + 40, by + 32, 76, 22, 'ABOUT', () => this.go('About'), { color: 'btnGrey', textColor: C.white, key: 'I' });
      button(this, W / 2 - 40, by + 60, 76, 22, 'HOW TO PLAY', () => this.go('HowTo'), { color: 'btnBlue', textColor: C.white, key: ['H', 'FORWARD_SLASH'] });
      button(this, W / 2 + 40, by + 60, 76, 22, 'HIGH SCORES', () => this.go('Scores'), { color: 'btnGold', key: 'S' });
    } else {
      // brand-new players get the primer first, then crew select
      const b = button(this, W / 2, by + 6, 170, 30, isTouch ? 'TAP TO START' : 'PRESS ENTER', () => { audio.unlock(); wipeTo(this, 'HowTo', { next: 'Crew' }); }, { size: 1, key: ['ENTER', 'SPACE'] });
      this.tweens.add({ targets: b, scale: 1.06, yoyo: true, repeat: -1, duration: 500 });
      button(this, W / 2 - 40, by + 44, 76, 22, 'HOW TO PLAY', () => this.go('HowTo'), { color: 'btnBlue', textColor: C.white, key: ['H', 'FORWARD_SLASH'] });
      button(this, W / 2 + 40, by + 44, 76, 22, 'ABOUT', () => this.go('About'), { color: 'btnGrey', textColor: C.white, key: 'I' });
      button(this, W / 2, by + 72, 156, 22, 'HIGH SCORES', () => this.go('Scores'), { color: 'btnGold', key: 'S' });
    }
    soundToggle(this);
    // invite a friend (no score here; the score card lives on High Scores)
    button(this, W - 52, 14, 50, 18, 'SHARE', () => shareScore(this, 'Race the foul-mouthed Northwest crew across Seattle and fix real plumbing jobs with the homies. Plumber Wars:'), { color: 'btnBlue', textColor: C.white, sound: 'blip' });
    const vo = txt(this, 10, 10, '', { color: C.white });
    const vlabel = () => vo.setText((audio.voices ? 'VOICES: ON' : 'VOICES: OFF') + (isTouch ? '' : ' [V]'));
    vlabel();
    const vt = () => { audio.unlock(); audio.setVoices(!audio.voices); vlabel(); if (audio.voices) audio.say('GET OUT OF OUR LANE, HOMIES!'); };
    this.add.rectangle(4, 4, 76, 20, 0x181425, 0.6).setOrigin(0).setStrokeStyle(1, 0x5a6988);
    hitZone(this, 44, 14, 88, 32, vt, 96);
    this.input.keyboard.on('keydown-V', vt);
    txt(this, W / 2, H - 21, 'NSFW: PLUMBERS SWEAR. A LOT.', { ox: 0.5, color: C.silver });
    // build stamp, so a stale phone tab is easy to spot
    txt(this, W / 2, H - 9, typeof __BUILD__ !== 'undefined' ? __BUILD__ : '', { ox: 0.5, color: C.slate, outline: false });
    this.input.once('pointerup', () => { audio.unlock(); audio.music('title'); });
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
