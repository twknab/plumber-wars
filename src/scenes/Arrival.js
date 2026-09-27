import Phaser from 'phaser';
import { W, H, txt, button, wipeTo, wipeIn, dialog, bubble, panel } from '../core/ui.js';
import { audio } from '../core/audio.js';
import { progress } from '../core/save.js';
import { C, hex } from '../core/palette.js';
import { PX } from '../core/pixel.js';
import { HEROES, DISTRICTS, TRASH, difficulty, pick } from '../data/content.js';
import { JOBS } from '../data/jobs.js';
import { portrait, body } from '../art/people.js';
import { houseTextures } from '../art/houses.js';

const SKY = { day: [C.navy, C.blue, C.cyan, C.silver], overcast: [C.storm, C.slate, C.steel, C.silver], dusk: [C.night, C.plum, C.mauve, C.pink, C.flame], night: [C.ink, C.night, C.storm] };
const WHERE = { alki: 'BATHROOM', tub: 'BATHROOM', toilet: 'BATHROOM', sink: 'KITCHEN', shower: 'BATHROOM', basement: 'BASEMENT', heater: 'GARAGE', sump: 'BASEMENT', crawl: 'CRAWLSPACE', yard: 'SIDE YARD', bib: 'BACK OF THE HOUSE' };

export function skyTex(scene, d) {
  const key = 'sky' + d; if (scene.textures.exists(key)) return key;
  const D = DISTRICTS[d]; const p = new PX(W, H);
  p.vgrad(0, 0, W, H, SKY[D.sky]);
  if (D.sky === 'night' || D.sky === 'dusk') for (let i = 0; i < 50; i++) p.px((i * 97) % W, (i * 41) % (H * 0.4), i % 4 ? C.steel : C.white);
  if (D.sky === 'night') { p.ellipse(W - 50, 50, 14, 14, C.sand); p.ellipse(W - 45, 46, 12, 12, C.ink); }
  if (D.sky !== 'night') for (let i = 0; i < 5; i++) { const cx = (i * 83) % W, cy = 40 + (i * 37) % 90; p.blob(cx, cy, 30, 9, D.sky === 'day' ? [C.silver, C.white] : [C.slate, C.steel, C.silver]); p.blob(cx + 18, cy - 5, 18, 8, D.sky === 'day' ? [C.silver, C.white] : [C.slate, C.steel]); }
  p.toTexture(scene, key); return key;
}

export class Arrival extends Phaser.Scene {
  constructor() { super('Arrival'); }
  async create({ job: ji = 0, drive }) {
    wipeIn(this);
    this.ji = ji; const job = JOBS[ji], D = DISTRICTS[job.district], hero = HEROES.find(h => h.id === progress.hero) || HEROES[0];
    this.drive = drive || { hp: 4, maxHp: 4, lead: 100, cash: 0 };
    this.add.image(0, 0, skyTex(this, job.district)).setOrigin(0);
    const gY = Math.round(H * 0.6);
    this.add.image(W / 2, gY + 22, houseTextures(this, job, D.time === 'night')).setOrigin(0.5, 1);
    // street
    this.add.rectangle(0, gY + 22, W, 10, hex(C.steel)).setOrigin(0);
    this.add.rectangle(0, gY + 32, W, H - gY - 32, hex(C.night)).setOrigin(0);
    for (let x = 0; x < W; x += 28) this.add.rectangle(x, gY + 70, 14, 2, hex(C.gold)).setOrigin(0);
    if (D.time !== 'day') this.add.rectangle(0, 0, W, H, hex(C.ink), D.time === 'night' ? 0.35 : 0.2).setOrigin(0).setDepth(20);
    if (D.rain > 0) this.add.particles(0, 0, 'rain', { x: { min: -40, max: W }, y: -10, lifespan: 900, speedY: 560, speedX: 80, quantity: Math.ceil(D.rain * 2), frequency: 40, alpha: 0.6 }).setDepth(21);
    txt(this, W / 2, 8, job.address, { ox: 0.5, color: C.white, depth: 30 });
    txt(this, W / 2, 20, D.name, { ox: 0.5, color: C.gold, depth: 30 });
    // van pulls up
    const van = this.add.sprite(-80, gY + 60, 'sideVan').setOrigin(0.5, 1).setDepth(10);
    if (!this.anims.exists('vanroll')) this.anims.create({ key: 'vanroll', frames: this.anims.generateFrameNumbers('sideVan'), frameRate: 12, repeat: -1 });
    if (!this.anims.exists('truckroll')) this.anims.create({ key: 'truckroll', frames: this.anims.generateFrameNumbers('sideTruck'), frameRate: 14, repeat: -1 });
    van.play('vanroll');
    audio.music('map');
    this.tweens.add({ targets: van, x: 80, duration: 1200, ease: 'Cubic.out', onComplete: () => { van.anims.stop(); audio.sfx('bump'); } });
    // Northwest drives by, furious
    const truck = this.add.sprite(W + 120, gY + 90, 'sideTruck').setOrigin(0.5, 1).setDepth(11).setFlipX(true).play('truckroll');
    this.time.delayedCall(1300, () => { this.tweens.add({ targets: truck, x: -140, duration: 1700 }); audio.sfx('nwhonk'); bubble(this, W / 2, gY + 20, pick(TRASH.lose), { dur: 1600, depth: 40, maxW: 180 }); });
    // crew hops out, customer comes out
    await this.wait(1500);
    const crew = [hero, ...HEROES.filter(h => h !== hero)];
    crew.forEach((h, i) => { const s = this.add.sprite(96 + i * 16, gY + 58, body(this, h.id, h.look), 0).setOrigin(0.5, 1).setDepth(12).setAlpha(0); this.tweens.add({ targets: s, alpha: 1, x: 150 + i * 18, y: gY + 44, duration: 500, delay: i * 180 }); });
    const cust = this.add.sprite(W / 2, gY - 4, body(this, 'job' + ji, job.look), 1).setOrigin(0.5, 1).setDepth(12);
    this.tweens.add({ targets: cust, y: gY + 44, x: W / 2 + 70, duration: 900 });
    this.time.addEvent({ delay: 300, loop: true, callback: () => cust.active && cust.setFrame(cust.frame.name ? 0 : 1) });
    await this.wait(1000);
    const df = difficulty(ji);
    await dialog(this, { portrait: portrait(this, 'job' + ji, job.look, 'worried'), name: job.who, text: pick(['THANK GOD! NOT THOSE NORTHWEST CREEPS AGAIN!', "OH THANK HEAVENS, IT'S THE HOMIES!", 'FINALLY! THE NORTHWEST GUYS SCARE MY DOG.']) + ` IT'S IN THE ${WHERE[job.variant === 'alki' ? 'alki' : job.scene]}. HURRY!`, color: C.cyan, pitch: 1.1 });
    // job ticket
    const secs = Math.round(job.steps.length * 11 * df.repairFactor * (hero.id === 'jared' ? 1.3 : 1));
    const py = 44; const c = this.add.container(0, 0).setDepth(50);
    c.add(panel(this, 10, py, W - 20, 196, 'panelLight'));
    c.add(txt(this, W / 2, py + 10, 'JOB TICKET', { ox: 0.5, outline: false, color: C.brown }));
    c.add(txt(this, W / 2, py + 24, job.title, { ox: 0.5, outline: false, color: C.crimson, size: 2 }));
    const rows = [['STEPS', job.steps.length], ['CLOCK', secs + ' SEC'], ['VAN ARMOR', this.drive.hp + '/' + this.drive.maxHp], ['HINTS', df.toolHints ? 'TOOLS GLOW' : 'NONE']];
    if (df.stepChoice) rows.push(['ORDER', 'YOU CALL IT']);
    rows.forEach(([k, v], i) => { c.add(txt(this, 26, py + 48 + i * 12, k, { outline: false, color: C.night })); c.add(txt(this, W - 26, py + 48 + i * 12, String(v), { outline: false, color: C.ink, ox: 1 })); });
    const how = df.stepChoice ? 'PICK THE NEXT STEP LIKE A REAL PLUMBER. WRONG ORDER = DISASTER.' : 'EACH STEP: PICK THE RIGHT TOOL FROM THE TRAY, THEN DO THE MOVE.';
    c.add(txt(this, W / 2, py + 120, how, { ox: 0.5, outline: false, color: C.forest, maxW: W - 44, align: 1 }));
    c.add(txt(this, W / 2, py + 150, 'LEFTY-LOOSEY. RIGHTY-TIGHTY.', { ox: 0.5, outline: false, color: C.brown }));
    c.alpha = 0; this.tweens.add({ targets: c, alpha: 1, duration: 250 });
    button(this, W / 2, py + 180, 170, 28, "LET'S FIX IT!", () => { audio.sfx('go'); wipeTo(this, 'Repair', { job: ji, secs, drive: this.drive }); }, { color: 'btnGreen', textColor: C.white, depth: 60, key: ['ENTER', 'SPACE'] });
  }
  wait(ms) { return new Promise(r => this.time.delayedCall(ms, r)); }
}
