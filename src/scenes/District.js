import Phaser from 'phaser';
import { W, H, txt, setTxt, wipeTo, wipeIn, isTouch } from '../core/ui.js';
import { audio } from '../core/audio.js';
import { C, hex } from '../core/palette.js';
import { DISTRICTS, DISTRICT_WELCOME } from '../data/content.js';

// "Welcome to <district>" intro: pixel art of the neighborhood (from an openly licensed photo, see
// public/districts/credits.json), a Northwest-turf stamp, and Big Randy's welcome. Then the briefing.
export const startsDistrict = ji => ji === 15 || ji % 3 === 0;

// Route to a job, showing the district intro first when the job opens a new district.
export function goToJob(scene, ji) { wipeTo(scene, startsDistrict(ji) ? 'District' : 'Brief', { job: ji }); }

export class District extends Phaser.Scene {
  constructor() { super('District'); }
  init({ job = 0 }) { this.ji = +job; this.leaving = false; }
  create() {
    wipeIn(this);
    const d = this.ji === 15 ? 5 : Math.floor(this.ji / 3); const D = DISTRICTS[d];
    this.add.rectangle(0, 0, W, H, hex(C.ink)).setOrigin(0);
    for (let y = 0; y < H; y += 4) this.add.rectangle(0, y, W, 1, hex(C.night), 0.6).setOrigin(0);
    const top = Math.round(H * 0.25);
    txt(this, W / 2, top - 30, 'WELCOME TO', { ox: 0.5, size: 2, color: C.white });
    // the art, framed, revealed with a quick scanline wipe
    const key = 'district_' + D.art;
    const frame = this.add.rectangle(W / 2, top + 85, W - 4, 174, hex(C.gold)).setStrokeStyle(2, hex(C.ink));
    let art;
    if (this.textures.exists(key)) {
      art = this.add.image(W / 2, top + 85, key);
      const mask = this.add.rectangle(0, top, W, 0, 0xffffff).setOrigin(0).setVisible(false);
      art.setMask(mask.createGeometryMask());
      this.tweens.add({ targets: mask, height: 170, duration: 700, ease: 'Sine.out' });
      this.tweens.add({ targets: art, y: art.y - 3, yoyo: true, repeat: -1, duration: 2600, ease: 'Sine.inOut' }); // gentle drift
    } else frame.setFillStyle(hex(C.storm));
    const name = txt(this, W / 2, top + 186, D.name, { ox: 0.5, size: 3, color: C.gold });
    name.setScale(6).setAlpha(0);
    this.tweens.add({ targets: name, scale: 3, alpha: 1, duration: 350, delay: 500, ease: 'Back.out', onComplete: () => this.cameras.main.shake(120, 0.006) });
    txt(this, W / 2, top + 216, this.ji === 15 ? 'BONUS LEVEL' : `JOBS ${this.ji + 1}-${this.ji + 3} OF 15`, { ox: 0.5, color: C.lime });
    txt(this, W / 2, top + 230, D.tag, { ox: 0.5, color: C.silver, maxW: W - 30, align: 1 });
    // Northwest turf stamp slams onto the photo
    const stamp = this.add.container(W - 70, top + 30).setAngle(-12).setAlpha(0);
    stamp.add(this.add.rectangle(0, 0, 112, 24, hex(C.crimson), 0.85).setStrokeStyle(2, hex(C.red)));
    stamp.add(txt(this, 0, 0, 'NORTHWEST TURF', { ox: 0.5, oy: 0.5, color: C.white }));
    this.time.delayedCall(1000, () => { stamp.setAlpha(1).setScale(2.2); this.tweens.add({ targets: stamp, scale: 1, duration: 180, ease: 'Quad.in', onComplete: () => audio.sfx('bump') }); });
    this.time.delayedCall(1300, () => audio.say(DISTRICT_WELCOME[d]));
    audio.sfx('go');
    // photo credit (CC licenses require it)
    this.credit = txt(this, W / 2, H - 30, '', { ox: 0.5, color: C.slate, outline: false, maxW: W - 20, align: 1 });
    fetch('districts/credits.json').then(r => r.json()).then(c => { const x = c[D.art]; if (x && this.credit.active) setTxt(this.credit, `PIXEL ART FROM A PHOTO BY ${x.artist} (${x.license}, WIKIMEDIA COMMONS)`); }).catch(() => {});
    const go = txt(this, W / 2, H - 52, isTouch ? 'TAP TO ROLL IN' : 'PRESS ENTER', { ox: 0.5, color: C.gold });
    this.tweens.add({ targets: go, alpha: 0.2, yoyo: true, repeat: -1, duration: 450 });
    const next = () => { if (this.leaving) return; this.leaving = true; audio.sfx('select'); wipeTo(this, 'Brief', { job: this.ji }); };
    this.time.delayedCall(900, () => { this.input.once('pointerup', next); this.input.keyboard.once('keydown-ENTER', next); this.input.keyboard.once('keydown-SPACE', next); });
    this.time.delayedCall(9000, next);
  }
}
