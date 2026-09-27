import Phaser from 'phaser';
import { W, H, txt, button, wipeTo, wipeIn, bubble, banner, floatText, panel, hitZone, isTouch } from '../core/ui.js';
import { audio } from '../core/audio.js';
import { progress } from '../core/save.js';
import { C, hex } from '../core/palette.js';
import { PX } from '../core/pixel.js';
import { HEROES, RIVALS, DISTRICTS, TRASH, difficulty, pick } from '../data/content.js';
import { JOBS } from '../data/jobs.js';
import { portrait } from '../art/people.js';
import { houseTextures } from '../art/houses.js';

const LANES = [66, 112, 158, 204];
const ROAD_L = 46, ROAD_R = 224;
const TOP_SPEED = 330;
const MI = 8000;

function roadTexture(scene, d) {
  const key = 'road' + d; if (scene.textures.exists(key)) return key;
  const D = DISTRICTS[d]; const wet = D.rain > 0.3; const TH = 512; const p = new PX(W, TH);
  const R = (i) => ((i * 9301 + 49297 + d * 131) % 233280) / 233280;
  const grass = D.time === 'night' ? [C.deep, C.ink] : [C.forest, C.deep];
  p.rect(0, 0, W, TH, grass[0]); p.dither(0, 0, W, TH, grass[1], 0.3); p.dither(0, 0, W, TH, C.green, 0.06);
  for (let i = 0; i < 90; i++) p.px(Math.floor(R(i) * 26) + (i % 2 ? 244 : 0), Math.floor(R(i + 99) * TH), i % 3 ? C.lime : C.deep);
  // sidewalks with driveways
  for (const x of [26, 226]) { p.rect(x, 0, 18, TH, C.steel); for (let y = 0; y < TH; y += 16) p.hline(x, y, 18, C.slate); p.dither(x, 0, 18, TH, C.silver, 0.12); }
  for (let k = 0; k < 5; k++) { const y = Math.floor(R(k + 7) * (TH - 40)); const x = k % 2 ? 226 : 26; p.rect(x, y, 18, 30, C.silver); p.hline(x, y, 18, C.white); }
  p.rect(43, 0, 3, TH, C.silver); p.rect(224, 0, 3, TH, C.silver);
  // asphalt
  p.rect(46, 0, 178, TH, wet ? C.ink : C.night); p.dither(46, 0, 178, TH, wet ? C.night : C.storm, 0.22); p.dither(46, 0, 178, TH, C.slate, 0.04);
  if (wet) for (let i = 0; i < 60; i++) p.vline(50 + Math.floor(R(i + 300) * 170), Math.floor(R(i + 400) * TH), 5 + (i % 4) * 3, C.storm);
  // cracks, patches, skid marks (Seattle roads, baby)
  for (let i = 0; i < 7; i++) { let x = 50 + Math.floor(R(i + 11) * 165), y = Math.floor(R(i + 23) * TH); for (let k = 0; k < 6; k++) { const nx = x + Math.floor(R(i * 7 + k) * 7) - 3, ny = y + 5; p.line(x, y, nx, ny, C.ink); x = nx; y = ny; } }
  for (let i = 0; i < 3; i++) { const x = 60 + Math.floor(R(i + 50) * 130), y = Math.floor(R(i + 60) * (TH - 30)), w = 16 + Math.floor(R(i + 70) * 20); p.rect(x, y, w, 12 + i * 4, wet ? C.night : C.storm); p.box(x, y, w, 12 + i * 4, C.ink); }
  for (let i = 0; i < 2; i++) { const x = 150 + i * 30, y = Math.floor(R(i + 80) * (TH - 80)); for (let k = 0; k < 60; k++) { p.px(x + Math.round(Math.sin(k / 12) * 4), y + k, C.ink); p.px(x + 8 + Math.round(Math.sin(k / 12) * 4), y + k, C.ink); } }
  // bike lane markings on the right edge
  p.rect(212, 0, 2, TH, C.silver); for (let y = 40; y < TH; y += 256) { p.rect(214, y, 10, 40, C.forest); p.ring(219, y + 26, 3, 3, C.white); p.ring(219, y + 14, 3, 3, C.white); p.line(219, y + 14, 219, y + 26, C.white); }
  // lane dashes + double yellow
  for (let y = 0; y < TH; y += 32) { p.rect(88, y, 2, 16, C.silver); p.rect(180, y, 2, 16, C.silver); }
  p.rect(132, 0, 2, TH, C.gold); p.rect(136, 0, 2, TH, C.gold);
  p.toTexture(scene, key);
  return key;
}

export class Drive extends Phaser.Scene {
  constructor() { super('Drive'); }
  init({ job = 0 }) {
    this.ji = +job; this.job = JOBS[this.ji]; this.D = DISTRICTS[this.job.district]; this.diff = difficulty(this.ji);
    this.hero = HEROES.find(h => h.id === progress.hero) || HEROES[0];
    this.dalton = this.hero.id === 'dalton';
  }
  create() {
    wipeIn(this);
    const PY = this.PY = Math.round(H * 0.7);
    this.dist = 0; this.speed = 0; this.L = this.diff.raceLength;
    this.maxSpeed = TOP_SPEED * (this.dalton ? 1.06 : 1);
    this.hp = this.maxHp = this.dalton ? 5 : 4; this.coffee = 1; this.cash = 0;
    this.px = LANES[2]; this.vx = 0; this.targetX = this.px; this.inv = 0; this.boost = 0; this.slide = 0; this.spin = 0; this.splat = 0;
    this.state = 'countdown'; this.objs = []; this.decor = []; this.nextSpawn = 380; this.nextDecorL = 0; this.nextDecorR = 40; this.hornCd = 0; this.assistUsed = false;
    this.t = 0;
    // road
    this.road = this.add.tileSprite(0, 0, W, H, roadTexture(this, this.job.district)).setOrigin(0).setDepth(0);
    // destination house
    const hk = houseTextures(this, this.job, this.D.time === 'night');
    this.house = this.add.image(W + 10, -200, hk + 's').setOrigin(1, 1).setDepth(7);
    this.pin = this.add.image(0, 0, 'iPin').setScale(2).setDepth(8);
    this.driveway = this.add.rectangle(0, 0, 44, 30, hex(C.steel)).setOrigin(0.5, 1).setDepth(1);
    // vehicles
    this.van = this.add.image(this.px, PY, 'van').setDepth(6);
    this.vanShadow = this.add.rectangle(this.px + 3, PY + 3, 20, 36, hex(C.ink), 0.35).setDepth(5);
    const rv = this.rival = { d: 20, x: LANES[3], vx: 0, speed: 0, state: 'cruise', t: 0, ramT: 3.5, throwT: 4, tauntT: 1.2, spin: 0, target: LANES[3] };
    this.truck = this.add.image(rv.x, PY, 'truck').setDepth(6);
    this.truckShadow = this.add.rectangle(rv.x + 3, PY + 3, 26, 46, hex(C.ink), 0.35).setDepth(5);
    this.alert = txt(this, 0, 0, '!', { size: 2, color: C.red, ox: 0.5, oy: 1, depth: 9 }).setVisible(false);
    this.offArrow = this.add.container(0, 0).setDepth(99).setVisible(false);
    this.offArrow.add([this.add.rectangle(0, 0, 58, 13, hex(C.crimson)).setStrokeStyle(1, hex(C.ink)), txt(this, 0, 0, '', { ox: 0.5, oy: 0.5 })]);
    // atmosphere
    if (this.D.time === 'dusk' || this.D.time === 'night') {
      this.add.rectangle(0, 0, W, H, hex(C.ink), this.D.time === 'night' ? 0.5 : 0.28).setOrigin(0).setDepth(20);
      this.beam = this.add.image(this.px, PY - 18, 'headlight').setOrigin(0.5, 1).setDepth(21).setBlendMode(Phaser.BlendModes.ADD);
      this.rbeam = this.add.image(0, 0, 'headlight').setOrigin(0.5, 1).setDepth(21).setBlendMode(Phaser.BlendModes.ADD).setScale(1.1);
    }
    if (this.D.rain > 0) {
      this.rain = this.add.particles(0, 0, 'rain', { x: { min: -40, max: W }, y: -10, lifespan: 700, speedY: { min: 520, max: 640 }, speedX: 90, quantity: Math.ceil(this.D.rain * 3), frequency: 30, alpha: { start: 0.7, end: 0.3 } }).setDepth(22);
    }
    this.splatLayer = this.add.container(0, 0).setDepth(30);
    this.speedLines = this.add.graphics().setDepth(19);
    this.buildHud();
    this.buildControls();
    // radio comms box
    this.comms = this.add.container(0, 32).setDepth(98).setVisible(false);
    this.comms.add(panel(this, 4, 0, W - 8, 54));
    this.commsPor = this.add.image(32, 27, portrait(this, 'randy', RIVALS.randy.look, 'yell')); this.comms.add(this.commsPor);
    this.commsName = txt(this, 60, 6, 'BIG RANDY', { color: C.red }); this.comms.add(this.commsName);
    this.commsText = txt(this, 60, 17, '', { maxW: W - 74 }); this.comms.add(this.commsText);
    this.events.on('app-hidden', () => this.pause(true));
    this.startCountdown();
  }

  // ------------------------------------------------------------------ HUD & controls
  buildHud() {
    const d = 100;
    this.add.rectangle(0, 0, W, 30, hex(C.ink), 0.92).setOrigin(0).setDepth(d);
    this.add.rectangle(0, 30, W, 1, hex(C.gold)).setOrigin(0).setDepth(d);
    this.hearts = []; for (let i = 0; i < this.maxHp; i++) this.hearts.push(this.add.image(8 + i * 9, 9, 'iHeart').setDepth(d));
    this.cupTxt = txt(this, 8, 18, '', { color: C.sand, depth: d });
    // race track
    const x0 = 64, x1 = W - 40; this.trackX0 = x0; this.trackX1 = x1;
    this.add.rectangle(x0, 14, x1 - x0, 3, hex(C.storm)).setOrigin(0, 0.5).setDepth(d);
    for (let i = 0; i <= 10; i++) this.add.rectangle(x0 + (x1 - x0) * i / 10, 14, 1, 5, hex(C.slate)).setDepth(d);
    this.add.image(x1 + 6, 12, 'iHouse').setDepth(d);
    this.tRival = this.add.image(x0, 9, 'iTruck').setDepth(d + 1);
    this.tVan = this.add.image(x0, 19, 'iVan').setDepth(d + 2);
    this.distTxt = txt(this, x0, 21, '', { color: C.silver, depth: d });
    this.leadTxt = txt(this, x1 - 2, 21, '', { color: C.lime, ox: 1, depth: d });
    this.add.image(W - 12, 15, 'iPause').setScale(1.6).setDepth(d);
    hitZone(this, W - 16, 15, 34, 30, () => this.pause(true), d + 5);
  }
  buildControls() {
    const by = H - 26;
    this.hornBtn = button(this, 36, by, 60, 34, isTouch ? 'HONK' : 'HONK [H]', () => this.honk(), { color: 'btnBlue', textColor: C.white, depth: 101, sound: null });
    this.boostBtn = button(this, W - 38, by, 64, 34, isTouch ? 'BOOST' : 'BOOST [SPC]', () => this.useBoost(), { color: 'btnRed', textColor: C.white, depth: 101, sound: null });
    this.boostCount = txt(this, W - 12, by - 20, '', { color: C.yellow, depth: 102, ox: 1 });
    if (!this.dalton) this.assistBtn = button(this, W / 2, by + 4, 74, 22, isTouch ? 'DALTON:CLEAR' : 'CLEAR [C]', () => this.assist(), { color: 'btnGold', depth: 101, sound: null });
    // steering: relative drag anywhere else
    this.input.on('pointerdown', p => { if (p.y > H - 46 && (p.x < 70 || p.x > W - 74 || (this.assistBtn && Math.abs(p.x - W / 2) < 40))) return; this.drag = { id: p.id, x0: p.x, v0: this.targetX }; });
    this.input.on('pointermove', p => { if (this.drag && this.drag.id === p.id && p.isDown) this.targetX = Phaser.Math.Clamp(this.drag.v0 + (p.x - this.drag.x0) * 1.35, ROAD_L + 10, ROAD_R - 10); });
    this.input.on('pointerup', p => { if (this.drag && this.drag.id === p.id) this.drag = null; });
    this.keys = this.input.keyboard.addKeys('LEFT,RIGHT,A,D,SPACE,H,SHIFT,DOWN,S,C,UP,W,ESC,P');
    this.keys.SPACE.on('down', () => this.useBoost()); this.keys.UP.on('down', () => this.useBoost()); this.keys.H.on('down', () => this.honk()); this.keys.SHIFT.on('down', () => this.honk()); this.keys.DOWN.on('down', () => this.honk()); this.keys.S.on('down', () => this.honk()); this.keys.W.on('down', () => this.useBoost()); this.keys.C.on('down', () => this.assist());
    this.keys.ESC.on('down', () => this.pause(true)); this.keys.P.on('down', () => this.pause(true));
    const hint = txt(this, W / 2, this.PY + 34, isTouch ? 'DRAG ANYWHERE TO STEER' : 'ARROWS/A-D STEER  SPACE BOOST  H HONK', { ox: 0.5, color: C.white, depth: 97 });
    this.tweens.add({ targets: hint, alpha: 0, delay: 3500, duration: 800 });
  }
  startCountdown() {
    let n = 3; audio.engineOn();
    const tick = () => {
      if (n > 0) { banner(this, String(n), { size: 5, dur: 500, color: C.gold }); audio.sfx('tick'); n--; this.time.delayedCall(650, tick); }
      else { banner(this, 'GO!', { size: 5, dur: 600, color: C.lime }); audio.sfx('go'); this.state = 'race'; audio.music('drive'); this.say(pick(TRASH.taunt), 'randy'); }
    };
    this.time.delayedCall(400, tick);
  }

  // ------------------------------------------------------------------ actions
  honk() {
    if (this.state !== 'race' || this.hornCd > 0) return;
    this.hornCd = 3.5; audio.sfx('honk');
    this.hornBtn.setEnabled(false); this.time.delayedCall(3500, () => this.hornBtn.setEnabled(true));
    // traffic ahead in your lane dodges
    for (const o of this.objs) if (o.kind === 'car' && o.d > this.dist && o.d - this.dist < 260 && Math.abs(o.x - this.px) < 26 && !o.oncoming) {
      const free = LANES.filter(l => l > 135 || !this.diff.oncoming).filter(l => Math.abs(l - o.x) > 20 && !this.objs.some(q => q !== o && Math.abs(q.x - l) < 22 && Math.abs(q.d - o.d) < 60));
      if (free.length) o.tx = free.sort((a, b) => Math.abs(a - o.x) - Math.abs(b - o.x))[0];
    }
    if (Math.abs(this.rival.d - this.dist) < 200) { const b = pick(this.hero.barks); bubble(this, this.px, this.PY - 26, b, { dur: 1500, maxW: 140, color: C.forest }); audio.say(b, { pitch: this.hero.pitch, rate: 1.25 }); }
    else floatText(this, this.px, this.PY - 28, 'HONK!', C.yellow);
  }
  useBoost() {
    if (this.state !== 'race' || this.coffee <= 0 || this.boost > 0) return;
    this.coffee--; this.boost = 2.4; audio.sfx('boost'); this.cameras.main.shake(200, 0.004);
    floatText(this, this.px, this.PY - 30, 'CAFFEINE!', C.gold);
  }
  assist() {
    if (!this.assistBtn || this.assistUsed || this.state !== 'race') return;
    this.assistUsed = true; this.assistBtn.setEnabled(false); audio.sfx('honk');
    const d = HEROES[0];
    bubble(this, W / 2, this.PY - 40, "DALTON: MOVE IT OR LOSE IT!", { dur: 1500, color: C.flame });
    for (const o of this.objs) if (o.d > this.dist - 40 && o.d - this.dist < H && !o.pickup) { this.tweens.add({ targets: o.spr, alpha: 0, x: o.x < 135 ? -40 : W + 40, duration: 500 }); o.dead = true; }
    this.inv = Math.max(this.inv, 2.5);
  }
  pause(on) {
    if (this.state === 'done' || this.paused === on) return;
    if (!on) return;
    this.paused = true; this.scene.pause(); audio.engineOff();
    this.scene.launch('Pause', { from: 'Drive', job: this.ji });
  }
  resumeFromPause() { this.paused = false; audio.engineOn(); }

  say(text, who = 'randy', dur = 2300) {
    if (!text) return;
    const R = who === 'skeeter' ? RIVALS.skeeter : RIVALS.randy;
    this.commsPor.setTexture(portrait(this, who, R.look, 'yell'));
    this.commsName.setText(R.name + ' (NORTHWEST)');
    this.commsText.setText(text.toUpperCase().replace(/[^A-Z0-9 .,!?'#$%&@*-]/g, ''));
    this.comms.setVisible(true); this.comms.alpha = 1; this.comms.x = -W; this.tweens.add({ targets: this.comms, x: 0, duration: 140 });
    if (this.commsTimer) this.commsTimer.remove();
    this.commsTimer = this.time.delayedCall(dur, () => this.tweens.add({ targets: this.comms, alpha: 0, duration: 200, onComplete: () => this.comms.setVisible(false) }));
    audio.sfx('buzz'); audio.say(text);
  }

  // ------------------------------------------------------------------ spawning
  spawnRow() {
    const df = this.diff, R = Math.random;
    const ahead = this.dist + H + 60 + R() * 80;
    const lanesSame = df.oncoming ? [2, 3] : [0, 1, 2, 3];
    const roll = R();
    const used = new Set();
    const add = (o) => { this.objs.push(o); used.add(o.lane); return o; };
    const lanePick = (arr) => { const f = arr.filter(l => !used.has(l)); return f.length ? f[Math.floor(R() * f.length)] : null; };
    // traffic
    const nCars = roll < 0.55 ? 1 : roll < 0.8 + df.t * 0.1 ? 2 : 0;
    for (let i = 0; i < nCars; i++) {
      const lane = lanePick(lanesSame); if (lane == null) break;
      const big = R() < 0.12;
      add(this.mkObj(big ? 'bus' : (R() < 0.15 ? 'wagon' : 'car' + Math.floor(R() * 7)), lane, ahead + i * 40, { kind: 'car', vd: big ? 95 : 120 + R() * 90, hp: 1, w: big ? 22 : 15, h: big ? 80 : 30 }));
    }
    if (df.oncoming && R() < 0.45 + df.t * 0.4) {
      const lane = R() < 0.5 ? 0 : 1;
      add(this.mkObj('car' + Math.floor(R() * 7), lane, ahead + 200 + R() * 200, { kind: 'car', vd: -(130 + R() * 110), oncoming: true, w: 15, h: 30, flip: true }));
    }
    // hazards
    if (R() < df.hazards * 0.6) {
      const lane = lanePick([0, 1, 2, 3]); if (lane != null) {
        const pool = ['pothole', 'pothole', 'cone', 'manhole'];
        if (this.D.rain > 0) pool.push('puddle', 'puddle');
        if (df.t > 0.25) pool.push('oil', 'barrier');
        const k = pick(pool);
        const o = this.mkObj(k, lane, ahead + 90, { kind: k, vd: 0, w: k === 'barrier' ? 40 : k === 'puddle' ? 24 : k === 'cone' ? 8 : 16, h: k === 'barrier' ? 8 : 10, flat: k !== 'cone' && k !== 'barrier' });
        add(o);
        if (k === 'barrier') { for (let c = 1; c <= 3; c++) this.objs.push(this.mkObj('cone', lane, ahead + 90 - c * 26, { kind: 'cone', vd: 0, w: 8, h: 8, xo: (c % 2 ? -12 : 12) })); }
      }
    }
    if (R() < 0.18 + df.t * 0.2) add(this.mkObj('cyclist', 3, ahead + 140, { kind: 'cyclist', vd: 80, w: 8, h: 16, xo: 12, anim: true }));
    if (R() < 0.08 + df.t * 0.08) { const o = add(this.mkObj('raccoon', 0, ahead + 180, { kind: 'raccoon', vd: 0, w: 12, h: 8, anim: true })); o.x = ROAD_L - 10; o.vx = 55; }
    // pickups
    if (R() < 0.22) { const lane = lanePick([0, 1, 2, 3]); if (lane != null) { const k = R() < 0.6 ? 'coffee' : R() < 0.5 ? 'kit' : 'cash'; add(this.mkObj(k, lane, ahead + 60, { kind: k, pickup: true, vd: 0, w: 12, h: 12 })); } }
    this.nextSpawn = this.dist + (150 + R() * 130) / df.traffic;
  }
  mkObj(key, lane, d, o = {}) {
    const x = LANES[lane] + (o.xo || 0);
    const spr = this.add.sprite(x, -100, key, 0).setDepth(o.flat ? 2 : 4);
    if (o.flip) spr.setFlipY(true);
    if (o.anim) { this.time.addEvent({ delay: 180, loop: true, callback: () => spr.active && spr.setFrame((spr.frame.name + 1) % 2) }); }
    if (key === 'raccoon') spr.setAngle(0);
    return { spr, key, lane, x, d, ...o, tx: x };
  }
  spawnDecor(side) {
    const R = Math.random; const d = this.dist + H + 60;
    const pool = ['fir0', 'fir1', 'fir2', 'fir0', 'maple', 'bush', 'lamp', 'roof0', 'roof1', 'roof2', 'roof3', 'roof4', 'hydrant'];
    if (this.D.time !== 'day') pool.push('mapleFall');
    if (R() < 0.08) pool.push('espresso', 'espresso');
    const k = pick(pool);
    const isRoof = k.startsWith('roof'), isLamp = k === 'lamp';
    const x = side < 0 ? (isRoof ? -4 : isLamp ? 36 : k === 'hydrant' ? 38 : 10) : (isRoof ? W + 4 : isLamp ? W - 36 : k === 'hydrant' ? W - 38 : W - 10);
    const spr = this.add.image(x, -100, k).setDepth(isRoof ? 1 : 3);
    if (isLamp && side > 0) spr.setFlipX(true);
    if (k === 'espresso') { spr.x = side < 0 ? 14 : W - 14; }
    this.decor.push({ spr, d });
    return (isRoof ? 70 : 34) + R() * 40;
  }

  // ------------------------------------------------------------------ main loop
  update(time, dms) {
    const dt = Math.min(0.05, dms / 1000); this.t += dt;
    if (this.state === 'countdown') { this.render(dt); return; }
    if (this.state === 'finish') { this.finishUpdate(dt); this.render(dt); return; }
    if (this.state !== 'race') { this.render(dt); return; }
    const df = this.diff;
    // input
    const k = this.keys; const kdir = (k.LEFT.isDown || k.A.isDown ? -1 : 0) + (k.RIGHT.isDown || k.D.isDown ? 1 : 0);
    if (kdir) this.targetX = Phaser.Math.Clamp(this.px + kdir * 60, ROAD_L + 10, ROAD_R - 10);
    // speed
    const top = this.maxSpeed * (this.boost > 0 ? 1.55 : 1);
    this.speed += (top - this.speed) * (this.speed < top ? 0.9 : 3) * dt;
    this.boost = Math.max(0, this.boost - dt); this.inv = Math.max(0, this.inv - dt); this.hornCd = Math.max(0, this.hornCd - dt);
    this.dist += this.speed * dt;
    // lateral
    const steer = this.dalton ? 11 : 8.5;
    let desired = (this.targetX - this.px) * steer;
    if (this.spin > 0) { this.spin -= dt; desired = Math.sin(this.t * 30) * 120; }
    if (this.slide > 0) { this.slide -= dt; desired = this.vx; }
    this.vx += (Phaser.Math.Clamp(desired, -260, 260) - this.vx) * Math.min(1, 12 * dt);
    this.px = Phaser.Math.Clamp(this.px + this.vx * dt, ROAD_L + 8, ROAD_R - 8);
    if (this.px <= ROAD_L + 8 || this.px >= ROAD_R - 8) { if (this.speed > 150 && Math.random() < 0.1) { audio.sfx('skid'); } this.speed *= 1 - 1.5 * dt; }
    // spawn
    if (this.dist > this.nextSpawn && this.dist < this.L - 500) this.spawnRow();
    if (this.dist > this.nextDecorL) this.nextDecorL = this.dist + this.spawnDecor(-1);
    if (this.dist > this.nextDecorR) this.nextDecorR = this.dist + this.spawnDecor(1);
    // objects
    for (const o of this.objs) {
      if (o.dead) continue;
      o.d += (o.vd || 0) * dt;
      if (o.vx) o.x += o.vx * dt;
      if (o.tx !== o.x && !o.vx) o.x += Phaser.Math.Clamp(o.tx - o.x, -70 * dt, 70 * dt);
      if (o.thrown) { o.air -= dt; }
      const dy = o.d - this.dist;
      if (dy < -120 || dy > H + 400 || o.x < -60 || o.x > W + 60) { o.dead = true; continue; }
      // player collision
      if (!o.thrown || o.air <= 0) if (Math.abs(dy) < (o.h / 2 + 16) && Math.abs(o.x - this.px) < (o.w / 2 + 8)) this.hit(o);
      // rival collision w/ traffic
      const rdy = o.d - this.rival.d;
      if (!o.pickup && !o.flat && Math.abs(rdy) < (o.h / 2 + 22) && Math.abs(o.x - this.rival.x) < (o.w / 2 + 11) && this.rival.spin <= 0 && o.kind !== 'junk') {
        this.rivalCrash(o);
      }
    }
    this.objs = this.objs.filter(o => { if (o.dead) { o.spr.destroy(); return false; } return true; });
    this.decor = this.decor.filter(o => { if (o.d - this.dist < -100) { o.spr.destroy(); return false; } return true; });
    this.rivalUpdate(dt);
    // van vs rival
    const r = this.rival, rdy = r.d - this.dist;
    if (Math.abs(rdy) < 38 && Math.abs(r.x - this.px) < 22) this.vehicleClash();
    // audio
    audio.engineSet(this.speed / (TOP_SPEED * 1.55));
    // end conditions
    if (this.dist >= this.L) this.win();
    else if (r.d >= this.L) this.lose('rival');
    this.render(dt);
  }

  hit(o) {
    if (o.pickup) {
      o.dead = true; audio.sfx('coin');
      if (o.kind === 'coffee') { this.coffee = Math.min(3, this.coffee + 1); floatText(this, o.x, this.PY - 20, '+ESPRESSO', C.gold); }
      if (o.kind === 'kit') { this.hp = Math.min(this.maxHp, this.hp + 1); floatText(this, o.x, this.PY - 20, '+REPAIR', C.red); }
      if (o.kind === 'cash') { this.cash += 50; floatText(this, o.x, this.PY - 20, '+$50 TIP', C.lime); }
      return;
    }
    if (o.kind === 'manhole') return;
    if (o.hitOnce) return; o.hitOnce = true;
    if (o.kind === 'puddle') { audio.sfx('splash'); this.slide = 0.45; this.vx = (Math.random() < 0.5 ? -1 : 1) * 170; this.speed *= 0.85; this.splash(o.x, this.PY); return; }
    if (o.kind === 'oil') { audio.sfx('skid'); this.spin = 0.8; this.speed *= 0.75; floatText(this, this.px, this.PY - 30, 'OIL SLICK!', C.mauve); return; }
    if (o.kind === 'pothole') { audio.sfx('bump'); this.speed *= 0.55; this.cameras.main.shake(160, 0.01); if (this.diff.district >= 2) this.damage(1, 'POTHOLE!'); else floatText(this, this.px, this.PY - 30, 'POTHOLE!', C.silver); return; }
    if (o.kind === 'junk') {
      o.dead = true;
      if (o.key === 'turd') { audio.sfx('fart'); this.addSplat(); floatText(this, this.px, this.PY - 30, 'EWWW!', C.clay); this.speed *= 0.8; }
      else { audio.sfx('bump'); this.speed *= 0.6; this.damage(o.key === 'wrenchJunk' ? 1 : 0, o.key === 'tp' ? 'TP!' : 'OOF!'); }
      return;
    }
    if (this.inv > 0 || this.boost > 0 && o.kind === 'cone') { if (o.kind === 'cone') { this.knock(o); } return; }
    if (o.kind === 'cone') { audio.sfx('bump'); this.speed *= 0.75; this.knock(o); return; }
    if (o.kind === 'raccoon') { audio.sfx('squelch'); this.speed *= 0.6; o.spr.setFlipY(true); floatText(this, this.px, this.PY - 30, 'SORRY, TRASH PANDA!', C.silver); return; }
    if (o.kind === 'cyclist') { audio.sfx('crash'); this.speed *= 0.3; this.damage(1); bubble(this, o.x, this.PY - 50, pick(['WATCH IT, VAN BOY!', 'I HAVE A GOPRO!!', 'SHARE THE ROAD, A-HOLE!']), { dur: 1500 }); this.knock(o); return; }
    // cars, bus, barrier
    audio.sfx('crash'); this.speed *= o.kind === 'barrier' ? 0.35 : 0.3; this.damage(1); this.knock(o);
    this.vx = (this.px < o.x ? -1 : 1) * 200; this.slide = 0.25;
  }
  knock(o) { o.dead = false; o.vx = (o.x < this.px ? -1 : 1) * 160; o.vd = (o.vd || 0) + this.speed * 0.5; this.tweens.add({ targets: o.spr, angle: 200, duration: 600 }); this.sparks(o.x, this.PY - 10); }
  damage(n, label) {
    if (n <= 0) { if (label) floatText(this, this.px, this.PY - 30, label, C.silver); return; }
    this.hp -= n; this.inv = 1.3; this.cameras.main.shake(260, 0.018); this.cameras.main.flash(90, 255, 60, 60);
    floatText(this, this.px, this.PY - 30, label || '-1 ARMOR', C.red);
    if (this.hp <= 0) this.lose('wreck');
  }
  addSplat() {
    this.splat = 3.2;
    for (let i = 0; i < 6; i++) {
      const s = this.add.image(Phaser.Math.Between(20, W - 20), Phaser.Math.Between(60, H - 80), 'turd').setScale(4 + Math.random() * 4).setAngle(Math.random() * 360).setAlpha(0.95).setTint(0x733e39);
      this.splatLayer.add(s); this.tweens.add({ targets: s, alpha: 0, y: s.y + 40, delay: 2000, duration: 1200, onComplete: () => s.destroy() });
    }
  }
  sparks(x, y) { for (let i = 0; i < 8; i++) { const s = this.add.image(x, y, 'spark').setDepth(9); this.tweens.add({ targets: s, x: x + Phaser.Math.Between(-30, 30), y: y + Phaser.Math.Between(-30, 20), alpha: 0, duration: 400, onComplete: () => s.destroy() }); } }
  splash(x, y) { for (let i = 0; i < 10; i++) { const s = this.add.image(x, y, 'drop').setDepth(9); this.tweens.add({ targets: s, x: x + Phaser.Math.Between(-40, 40), y: y + Phaser.Math.Between(-40, 10), alpha: 0, duration: 450, onComplete: () => s.destroy() }); } }

  // ------------------------------------------------------------------ the Northwest truck
  rivalUpdate(dt) {
    const r = this.rival, df = this.diff;
    const gap = r.d - this.dist;
    let base = TOP_SPEED * df.rivalSpeed;
    if (gap < -350) base *= 1.18; else if (gap > 700) base *= 0.9; else if (gap > 350) base *= 0.96;
    if (r.spin > 0) { r.spin -= dt; base *= 0.25; r.x += Math.sin(this.t * 25) * 40 * dt; }
    r.speed += (base - r.speed) * 1.2 * dt;
    r.d += r.speed * dt;
    // lane AI: dodge obstacles ahead
    r.t -= dt;
    if (r.state === 'cruise') {
      const blocker = this.objs.find(o => !o.pickup && !o.flat && o.kind !== 'junk' && o.d > r.d && o.d - r.d < 140 && Math.abs(o.x - r.target) < 24);
      if (blocker && Math.random() < 0.55 + (1 - df.t) * 0.1 + df.t * 0.35) {
        const opts = LANES.filter(l => !this.objs.some(o => !o.pickup && !o.flat && o.d > r.d - 30 && o.d - r.d < 160 && Math.abs(o.x - l) < 26));
        if (opts.length) r.target = opts.sort((a, b) => Math.abs(a - r.x) - Math.abs(b - r.x))[0];
      }
      r.ramT -= dt; r.throwT -= dt; r.tauntT -= dt;
      if (Math.abs(gap) < 60 && r.ramT <= 0 && r.spin <= 0) { r.state = 'tele'; r.t = 0.65 - df.t * 0.2; this.say(pick(TRASH.ram), 'randy', 1500); audio.sfx('nwhonk'); }
      else if (gap > 70 && gap < 320 && r.throwT <= 0) { r.throwT = df.rivalThrowEvery * (0.7 + Math.random() * 0.6); this.throwJunk(); }
      else if (r.tauntT <= 0 && Math.abs(gap) < 400) { r.tauntT = 5 + Math.random() * 4; this.say(pick(TRASH.taunt), Math.random() < 0.3 ? 'skeeter' : 'randy'); }
      if (Math.abs(gap) < 120 && Math.random() < dt * 0.5) r.target = Phaser.Math.Clamp(this.px + (r.x < this.px ? -40 : 40), LANES[0], LANES[3]); // jockey
    } else if (r.state === 'tele') {
      if (r.t <= 0) { r.state = 'ram'; r.t = 0.55; r.target = Phaser.Math.Clamp(this.px + (this.px > r.x ? 18 : -18), ROAD_L + 12, ROAD_R - 12); }
    } else if (r.state === 'ram') {
      if (r.t <= 0) { r.state = 'cruise'; r.ramT = df.rivalRamEvery * (0.7 + Math.random() * 0.6); r.target = LANES.reduce((a, b) => Math.abs(b - r.x) < Math.abs(a - r.x) ? b : a); }
    }
    const lat = r.state === 'ram' ? 230 : 70;
    r.vx = Phaser.Math.Clamp((r.target - r.x) * 5, -lat, lat);
    r.x = Phaser.Math.Clamp(r.x + r.vx * dt, ROAD_L + 11, ROAD_R - 11);
    if ((r.x <= ROAD_L + 11 || r.x >= ROAD_R - 11) && r.pushed > 0 && r.spin <= 0) this.rivalCrash(null);
    r.pushed = Math.max(0, (r.pushed || 0) - dt);
  }
  throwJunk() {
    const r = this.rival; const k = pick(['turd', 'turd', 'tp', 'plungerJunk', 'wrenchJunk']);
    const o = this.mkObj(k, 0, r.d - 10, { kind: 'junk', vd: r.speed * 0.25, w: 10, h: 10, thrown: true, air: 0.6 });
    o.x = r.x; o.tx = Phaser.Math.Clamp(this.px + Phaser.Math.Between(-20, 20), ROAD_L + 10, ROAD_R - 10); o.vx = 0;
    o.spr.setDepth(8); this.objs.push(o);
    this.tweens.add({ targets: o.spr, angle: 720, scale: { from: 1.8, to: 1 }, duration: 600 });
    this.tweens.add({ targets: o, x: o.tx, duration: 600 });
    audio.sfx('throw'); this.say(pick(TRASH.throw), 'skeeter', 1500);
  }
  rivalCrash(o) {
    const r = this.rival; if (r.spin > 0) return;
    r.spin = 1.4; r.speed *= 0.35; audio.sfx('crash'); this.sparks(r.x, this.PY - (r.d - this.dist));
    if (o) { o.vx = (o.x < r.x ? -1 : 1) * 140; this.tweens.add({ targets: o.spr, angle: 180, duration: 500 }); }
    if (Math.abs(r.d - this.dist) < 400) { this.say(pick(TRASH.hurt), 'randy', 1600); floatText(this, r.x, this.PY - (r.d - this.dist) - 30, 'WRECKED!', C.lime); }
    r.state = 'cruise'; r.ramT = 2;
  }
  vehicleClash() {
    const r = this.rival; if (this.clashCd > this.t) return; this.clashCd = this.t + 0.5;
    const dir = this.px < r.x ? 1 : -1; // direction from van toward truck
    const vanPush = this.vx * dir; // how hard the van is shoving toward the truck
    audio.sfx('bump'); this.sparks((this.px + r.x) / 2, this.PY - (r.d - this.dist) / 2);
    if (r.state === 'ram' && vanPush < 120 && this.boost <= 0) {
      // Northwest lands the hit
      this.vx = -dir * 260; this.slide = 0.35; this.speed *= 0.55; this.damage(this.inv > 0 ? 0 : 1, 'RAMMED!');
      this.say(pick(TRASH.taunt), 'randy', 1500);
      r.state = 'cruise'; r.ramT = this.diff.rivalRamEvery;
    } else if (vanPush > 60 || this.boost > 0) {
      // you shoved them
      r.target = Phaser.Math.Clamp(r.x + dir * 70, ROAD_L, ROAD_R); r.pushed = 0.8; r.speed *= 0.7; r.x += dir * 10;
      floatText(this, r.x, this.PY - (r.d - this.dist) - 26, 'SHOVE!', C.lime); this.cameras.main.shake(120, 0.006);
      if (Math.random() < 0.6) this.say(pick(TRASH.hurt), 'randy', 1400);
      this.vx = -dir * 80;
    } else { this.vx = -dir * 140; r.x += dir * 8; }
  }

  // ------------------------------------------------------------------ rendering
  render(dt) {
    const PY = this.PY;
    this.road.tilePositionY = -this.dist;
    this.van.setPosition(Math.round(this.px), PY).setAngle(this.spin > 0 ? this.t * 900 : Phaser.Math.Clamp(this.vx / 22, -12, 12));
    this.van.setAlpha(this.inv > 0 && Math.floor(this.t * 16) % 2 ? 0.4 : 1);
    this.vanShadow.setPosition(this.px + 3, PY + 3);
    if (this.beam) this.beam.setPosition(this.px, PY - 18).setAngle(this.van.angle);
    const r = this.rival, ry = PY - (r.d - this.dist);
    this.truck.setPosition(Math.round(r.x), Math.round(ry)).setAngle(r.spin > 0 ? r.spin * 500 : Phaser.Math.Clamp(r.vx / 18, -14, 14));
    this.truckShadow.setPosition(r.x + 3, ry + 3);
    if (this.rbeam) this.rbeam.setPosition(r.x, ry - 24);
    const tele = r.state === 'tele';
    this.truck.setTint(tele && Math.floor(this.t * 14) % 2 ? 0xff6666 : 0xffffff);
    this.alert.setVisible(tele).setPosition(r.x, ry - 28);
    // off-screen indicator
    const off = ry < 40 ? 'up' : ry > H - 50 ? 'down' : null;
    this.offArrow.setVisible(!!off && this.state === 'race');
    if (off) { const m = Math.abs(r.d - this.dist) / MI; this.offArrow.setPosition(Phaser.Math.Clamp(r.x, 34, W - 34), off === 'up' ? 44 : H - 56); this.offArrow.list[1].setText((off === 'up' ? '^ NW +' : 'NW -') + m.toFixed(2) + 'MI'); }
    for (const o of this.objs) { o.spr.setPosition(Math.round(o.x), Math.round(PY - (o.d - this.dist))); if (o.thrown && o.air > 0) o.spr.y -= Math.sin((0.6 - o.air) / 0.6 * Math.PI) * 30; }
    for (const o of this.decor) o.spr.y = Math.round(PY - (o.d - this.dist));
    // destination
    const hy = PY - (this.L + 30 - this.dist);
    this.house.setPosition(W + 10, hy + 20); this.pin.setPosition(W - 52, hy - 70 + Math.sin(this.t * 6) * 3); this.driveway.setPosition(ROAD_R - 2, hy + 20).setSize(10, 30);
    // speed lines
    const g = this.speedLines; g.clear();
    if (this.boost > 0) { g.fillStyle(0xffffff, 0.5); for (let i = 0; i < 10; i++) g.fillRect(ROAD_L + ((i * 37 + this.t * 900) % (ROAD_R - ROAD_L)), (i * 71 + this.t * 1400) % H, 1, 18); }
    // HUD
    this.hearts.forEach((h, i) => h.setTexture(i < this.hp ? 'iHeart' : 'iHeartE'));
    this.cupTxt.setText('`'.repeat(0) + 'COFFEE x' + this.coffee);
    this.boostCount.setText('x' + this.coffee);
    this.boostBtn.setAlpha(this.coffee > 0 && this.boost <= 0 ? 1 : 0.45);
    const fx = v => this.trackX0 + (this.trackX1 - this.trackX0) * Phaser.Math.Clamp(v / this.L, 0, 1);
    this.tVan.x = fx(this.dist); this.tRival.x = fx(r.d);
    const left = Math.max(0, (this.L - this.dist) / MI);
    this.distTxt.setText(left.toFixed(2) + ' MI');
    const lead = this.dist - r.d; this.leadTxt.setText(lead >= 0 ? 'LEAD' : 'BEHIND').setTint(lead >= 0 ? hex(C.lime) : hex(C.red));
  }

  // ------------------------------------------------------------------ endings
  win() {
    this.state = 'finish'; audio.stopMusic(); audio.music('win');
    this.finishT = 0; this.targetX = LANES[3];
    banner(this, 'ARRIVED!', { color: C.lime, size: 3, y: H * 0.3 });
    const lead = this.dist - this.rival.d;
    this.say(pick(TRASH.lose), 'randy', 2000);
    this.result = { hp: this.hp, maxHp: this.maxHp, lead, cash: this.cash };
  }
  finishUpdate(dt) {
    this.finishT += dt;
    this.speed = Math.max(0, this.speed - 260 * dt);
    this.dist += this.speed * dt;
    this.px += (LANES[3] + 10 - this.px) * 3 * dt; this.vx = 0;
    this.rival.d += this.rival.speed * 0.6 * dt; this.rival.x += (LANES[1] - this.rival.x) * dt;
    audio.engineSet(this.speed / TOP_SPEED);
    if (this.finishT > 2.2 && !this.leaving) { this.leaving = true; audio.engineOff(); wipeTo(this, 'Arrival', { job: this.ji, drive: this.result }); }
  }
  lose(why) {
    if (this.state === 'done') return;
    this.state = 'done'; audio.stopMusic(); audio.engineOff(); audio.music('lose');
    const c = this.add.container(0, 0).setDepth(150);
    c.add(this.add.rectangle(0, 0, W, H, hex(C.ink), 0.75).setOrigin(0));
    if (why === 'wreck') {
      for (let i = 0; i < 12; i++) this.time.delayedCall(i * 120, () => { const p = this.add.image(this.px + Phaser.Math.Between(-8, 8), this.PY - 10, 'puff', 1).setDepth(10).setTint(0x3a4466); this.tweens.add({ targets: p, y: p.y - 40, scale: 3, alpha: 0, duration: 900 }); });
      c.add(txt(this, W / 2, 90, 'VAN TOTALED!', { ox: 0.5, size: 3, color: C.red }));
      c.add(txt(this, W / 2, 118, 'THE HOMIES HAD TO CALL A TOW. NORTHWEST TOOK THE JOB.', { ox: 0.5, maxW: 230, align: 1 }));
    } else {
      c.add(txt(this, W / 2, 90, 'TOO SLOW!', { ox: 0.5, size: 3, color: C.red }));
      c.add(txt(this, W / 2, 118, 'NORTHWEST GOT TO ' + this.job.who + "'S HOUSE FIRST.", { ox: 0.5, maxW: 230, align: 1 }));
    }
    c.add(this.add.image(W / 2, 190, portrait(this, 'randy', RIVALS.randy.look, 'smug')).setScale(1.5));
    const line = pick(TRASH.win);
    c.add(txt(this, W / 2, 236, '"' + line + '"', { ox: 0.5, maxW: 230, color: C.pink, align: 1 }));
    this.time.delayedCall(400, () => audio.say(line, { pitch: 0.5 }));
    const tr = this.add.sprite(-100, H * 0.58, 'sideTruck').setDepth(151).setOrigin(0.5, 1); c.add(tr);
    this.tweens.add({ targets: tr, x: W + 100, duration: 2200, delay: 300 });
    c.add(button(this, W / 2, H * 0.68, 160, 30, 'RETRY RACE', () => wipeTo(this, 'Drive', { job: this.ji }), { color: 'btnGreen', textColor: C.white, depth: 152, key: 'ENTER' }));
    c.add(button(this, W / 2, H * 0.68 + 38, 160, 24, 'BACK TO MAP', () => wipeTo(this, 'Map'), { color: 'btnGrey', textColor: C.white, depth: 152, key: 'M' }));
  }
}
