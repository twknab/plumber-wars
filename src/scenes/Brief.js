import Phaser from 'phaser';
import { W, H, txt, button, wipeTo, wipeIn, dialog, panel } from '../core/ui.js';
import { audio } from '../core/audio.js';
import { progress } from '../core/save.js';
import { C, hex } from '../core/palette.js';
import { HEROES, RIVALS, DISTRICTS, TRASH, pick, ORDER, jobNo } from '../data/content.js';
import { JOBS } from '../data/jobs.js';
import { portrait } from '../art/people.js';
import { houseTextures } from '../art/houses.js';

// Dispatch: the customer calls, Northwest cuts in on the radio, then GO.
export class Brief extends Phaser.Scene {
  constructor() { super('Brief'); }
  async create({ job: ji = 0 }) {
    this.left = false; // scenes are reused between jobs
    wipeIn(this);
    audio.music('brief');
    const job = JOBS[ji], D = DISTRICTS[job.district], hero = HEROES.find(h => h.id === progress.hero) || HEROES[0];
    this.add.rectangle(0, 0, W, H, hex(C.night)).setOrigin(0);
    for (let y = 0; y < H; y += 4) this.add.rectangle(0, y, W, 1, hex(C.ink), 0.5).setOrigin(0);
    this.add.image(W / 2, 22, 'badge');
    txt(this, W / 2, 44, `JOB ${jobNo(ji)} OF ${ORDER.length} - ${D.name}`, { ox: 0.5, color: C.gold, size: 2 });
    // work order card
    const cy = 64; panel(this, 10, cy, W - 20, 150, 'panelLight');
    txt(this, 18, cy + 8, 'WORK ORDER #' + (4100 + ji * 37), { outline: false, color: C.brown });
    txt(this, 18, cy + 20, job.title, { outline: false, color: C.crimson, size: 2 });
    txt(this, 18, cy + 40, job.who, { outline: false, color: C.ink });
    txt(this, 18, cy + 50, job.address, { outline: false, color: C.storm });
    const hk = houseTextures(this, job, D.time === 'night');
    this.add.image(W / 2, cy + 64, hk + 's').setOrigin(0.5, 0);
    this.add.image(W / 2 + 60, cy + 70, 'iPin').setScale(2);
    const stamp = txt(this, W - 26, cy + 10, 'URGENT', { outline: false, color: C.red, size: 2, ox: 1 }); stamp.setAngle(8);
    // phone ring
    const ring = txt(this, W / 2, cy + 162, 'RING RING RING...', { ox: 0.5, color: C.yellow });
    this.tweens.add({ targets: ring, alpha: 0.2, yoyo: true, repeat: 5, duration: 120 });
    for (let i = 0; i < 3; i++) this.time.delayedCall(i * 450, () => audio.sfx('alarm'));
    const skip = button(this, W - 36, H - 16, 64, 24, 'SKIP >>', () => this.go(ji), { color: 'btnGrey', textColor: C.white, depth: 200, key: 'ESC' });
    await this.wait(1200); if (this.left) return; ring.destroy();
    const dy = cy + 170;
    await dialog(this, { portrait: portrait(this, 'job' + ji, job.look, 'worried'), name: job.who, text: job.call, color: C.cyan, pitch: 1.1, y: dy });
    if (this.left) return;
    await dialog(this, { portrait: portrait(this, hero.id, hero.look, 'smug'), name: hero.name, text: pick(["SAY LESS. THE HOMIES ARE ON THE WAY.", "G'S PLUMBING, WE'RE ROLLING. KEEP IT CALM, WE GOT YOU.", "FIFTEEN MINUTES. PUT THE KETTLE ON."]), color: hero.color, pitch: hero.pitch, y: dy });
    if (this.left) return;
    audio.sfx('buzz');
    const line = pick(TRASH.steal);
    audio.say(line);
    await dialog(this, { portrait: portrait(this, 'randy', RIVALS.randy.look, 'yell'), name: 'NORTHWEST (ON YOUR RADIO)', text: 'BREAKER BREAKER, HOMIES. ' + line + ' THIS ONE IS OURS!', color: C.red, pitch: 0.6, y: dy });
    if (this.left) return;
    this.go(ji);
  }
  wait(ms) { return new Promise(r => this.time.delayedCall(ms, r)); }
  go(ji) { if (this.left) return; this.left = true; audio.sfx('go'); wipeTo(this, 'Drive', { job: ji }); }
}
