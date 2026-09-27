import Phaser from 'phaser';
import { W, H, txt, button, wipeTo, wipeIn, bubble, banner, floatText, panel } from '../core/ui.js';
import { audio } from '../core/audio.js';
import { progress } from '../core/save.js';
import { C, hex } from '../core/palette.js';
import { HEROES, difficulty, pick } from '../data/content.js';
import { JOBS, TOOL_INFO, trayFor } from '../data/jobs.js';
import { portrait } from '../art/people.js';
import { buildFixture, SH } from '../art/fixtures.js';

const SY = 32; // scene box top
const DRAG_SHOWS = { cartridge: 'cartNew', flapper: 'flapperNew', waxring: 'waxNew', supply: 'lineNew', coupling: 'coupling', foam: 'foam', ballvalve: 'ballvalve', gauge: 'gauge', hose: 'hose', bucket: 'bucket', plugIn: 'plug', pumpIn: 'pump' };
const HOW = {
  turn: s => (s.dir > 0 ? 'CIRCLE CLOCKWISE  >>' : '<<  CIRCLE COUNTER-CLOCKWISE'), crank: () => 'CRANK CLOCKWISE. EASE OFF WHEN IT BINDS!', dial: () => 'TURN TO SET THE NEEDLE IN THE GREEN, THEN HOLD',
  rhythm: () => 'TAP WHEN THE MARKER IS IN THE GREEN', hold: s => `HOLD... RELEASE IN THE GREEN (${s.label || 'POWER'})`, drag: () => 'DRAG IT ONTO THE GLOWING SPOT',
  pull: () => 'DRAG ALONG THE ARROW. DON\'T LET GO!', scrub: () => 'SCRUB BACK AND FORTH!', taps: () => 'TAP EVERY ONE!', tap: () => 'TAP IT!',
};
const BAD_IDEAS = ['POUR DRAIN-O-MATIC IN IT', 'HIT IT WITH A HAMMER', 'CALL NORTHWEST FOR ADVICE', 'WIGGLE IT AND PRAY', 'DUCT TAPE THE WHOLE THING', 'SEND JARED FOR COFFEE'];
const GRIPES = ['ARE YOU SURE YOU\'RE A PLUMBER?', 'MY CAT COULD DO THAT BETTER.', 'IS THAT... SUPPOSED TO HAPPEN?', 'I\'M TIMING YOU, YOU KNOW.', 'NORTHWEST DID THAT TOO. BAD SIGN.', 'OH GOD. OH NO.', 'WHAT WAS THAT NOISE?!'];

export class Repair extends Phaser.Scene {
  constructor() { super('Repair'); }
  init({ job = 0, secs = 60, drive }) {
    this.ji = +job; this.job = JOBS[this.ji]; this.df = difficulty(this.ji); this.total = this.left = secs; this.drive = drive || { hp: 4, maxHp: 4 };
    this.hero = HEROES.find(h => h.id === progress.hero) || HEROES[0];
    this.milan = this.hero.id === 'milan';
    this.win = this.df.window * (this.milan ? 1.35 : 1);
    this.si = 0; this.mistakes = 0; this.phase = 'idle'; this.tool = null; this.over = false;
  }
  create() {
    wipeIn(this); audio.music('repair');
    const fx = this.fix = buildFixture(this, this.job.scene, this.job.variant);
    this.add.rectangle(0, 0, W, H, hex(C.ink)).setOrigin(0);
    this.add.image(0, SY, fx.bg).setOrigin(0);
    this.parts = {};
    for (const [k, p] of Object.entries(fx.parts)) {
      const im = this.add.image(p.x, SY + p.y, p.key).setOrigin(p.ox, p.oy).setDepth(p.depth || 1);
      if (p.angle) im.setAngle(p.angle); if (p.scaleY) im.setScale(1, p.scaleY); if (p.hidden) im.setVisible(false);
      im.home = { x: im.x, y: im.y, angle: im.angle, sx: im.scaleX, sy: im.scaleY };
      this.parts[k] = im;
    }
    if (this.parts.needle) this.parts.needle.setAngle(150);
    this.fxLayer = this.add.container(0, 0).setDepth(40);
    this.gfx = this.add.graphics().setDepth(45);
    this.ui = this.add.container(0, 0).setDepth(60);
    this.buildHud(); this.buildTray(); this.setupInput();
    this.startLeak();
    if (this.job.rising) this.tweens.add({ targets: this.parts[this.job.rising], scaleY: 0.85, duration: this.total * 1000, ease: 'Linear' });
    this.events.on('app-hidden', () => this.pause());
    this.time.delayedCall(300, () => this.beginStep());
  }

  // ------------------------------------------------------------------ HUD
  buildHud() {
    const d = 80;
    this.add.rectangle(0, 0, W, SY, hex(C.ink)).setOrigin(0).setDepth(d);
    this.add.image(12, 12, 'badge').setScale(0.55).setDepth(d);
    txt(this, 24, 4, this.job.title, { color: C.gold, depth: d });
    this.stepTxt = txt(this, 24, 14, '', { color: C.silver, depth: d });
    this.clock = txt(this, W - 26, 5, '', { color: C.white, size: 2, ox: 1, depth: d });
    this.add.image(W - 12, 12, 'iPause').setScale(1.5).setDepth(d).setInteractive({ useHandCursor: true }).on('pointerup', () => this.pause());
    this.barBg = this.add.rectangle(0, SY - 4, W, 4, hex(C.storm)).setOrigin(0).setDepth(d);
    this.bar = this.add.rectangle(0, SY - 4, W, 4, hex(C.lime)).setOrigin(0).setDepth(d);
    // customer mood
    this.custFrame = this.add.rectangle(W - 30, SY + 30, 52, 52, hex(C.storm)).setStrokeStyle(2, hex(C.cyan)).setDepth(d);
    this.cust = this.add.image(W - 30, SY + 30, portrait(this, 'job' + this.ji, this.job.look, 'neutral')).setDepth(d);
    this.mood = 'neutral';
    // instruction strip
    const iy = SY + SH; this.iy = iy;
    this.add.rectangle(0, iy, W, 30, hex(C.night)).setOrigin(0).setDepth(d);
    this.add.rectangle(0, iy, W, 1, hex(C.gold)).setOrigin(0).setDepth(d);
    this.instr = txt(this, 6, iy + 4, '', { color: C.yellow, depth: d, maxW: W - 12 });
    this.how = txt(this, 6, iy + 16, '', { color: C.silver, depth: d, maxW: W - 12 });
  }
  buildTray() {
    const items = trayFor(this.job);
    // deterministic shuffle so the tray differs per job
    for (let i = items.length - 1; i > 0; i--) { const j = (i * 7 + this.ji * 3) % (i + 1); [items[i], items[j]] = [items[j], items[i]]; }
    const ty = this.iy + 31, avail = H - ty; const assistH = 22; const rows = 2;
    const sh = Math.min(48, Math.floor((avail - assistH - 4) / rows)), sw = Math.floor((W - 8) / 5);
    this.add.rectangle(0, ty, W, avail, hex(C.umber)).setOrigin(0).setDepth(70);
    for (let x = 0; x < W; x += 12) this.add.rectangle(x, ty, 1, avail, hex(C.brown)).setOrigin(0).setDepth(70);
    this.slots = items.map((k, i) => {
      const x = 4 + (i % 5) * sw + sw / 2, y = ty + 3 + Math.floor(i / 5) * sh + sh / 2;
      const bg = this.add.rectangle(x, y, sw - 4, sh - 4, hex(C.night)).setStrokeStyle(1, hex(C.ink)).setDepth(71).setInteractive({ useHandCursor: true });
      const ic = this.add.image(x, y, 'tool_' + k).setScale(Math.min(2, (sh - 8) / 20)).setDepth(72);
      bg.on('pointerup', () => this.pickTool(k, bg));
      return { k, bg, ic };
    });
    // homie assists (the two crew members who aren't lead)
    const ay = H - assistH / 2 - 2;
    this.assists = [];
    if (this.hero.id !== 'milan') this.assists.push(button(this, this.hero.id === 'jared' ? W / 2 : W / 4 + 2, ay, W / 2 - 12, assistH - 4, 'MILAN: AUTO-FIX', () => this.useAssist('milan'), { color: 'btnGreen', textColor: C.white, depth: 90, sound: null }));
    if (this.hero.id !== 'jared') this.assists.push(button(this, this.hero.id === 'milan' ? W / 2 : 3 * W / 4 - 2, ay, W / 2 - 12, assistH - 4, 'JARED: +12 SEC', () => this.useAssist('jared'), { color: 'btnBlue', textColor: C.white, depth: 90, sound: null }));
  }

  // ------------------------------------------------------------------ flow
  get step() { return this.job.steps[this.si]; }
  beginStep() {
    if (this.over) return;
    const s = this.step;
    (s.pre || []).forEach(f => this.applyFx(f));
    this.stepTxt.setText(`STEP ${this.si + 1}/${this.job.steps.length}`);
    this.tool = null; this.slots.forEach(sl => sl.bg.setStrokeStyle(1, hex(C.ink)));
    if (this.df.stepChoice) { this.phase = 'choose'; this.instr.setText('WHAT\'S THE NEXT STEP, BOSS?'); this.how.setText(''); this.showChoices(); return; }
    this.phase = 'tool'; this.instr.setText(s.t); this.how.setText('GRAB THE RIGHT TOOL FROM THE TRUCK TRAY'); this.hintTool();
  }
  hintTool() {
    if (!this.df.toolHints) return;
    const sl = this.slots.find(x => x.k === this.step.tool);
    if (sl) { sl.bg.setStrokeStyle(2, hex(C.gold)); this.tweens.add({ targets: sl.ic, scale: sl.ic.scale * 1.15, yoyo: true, repeat: 3, duration: 200 }); }
  }
  showChoices() {
    const s = this.step; const later = this.job.steps.slice(this.si + 1).map(x => x.t);
    const wrong = Phaser.Utils.Array.Shuffle([...later]).slice(0, 1).concat(Phaser.Utils.Array.Shuffle([...BAD_IDEAS]).slice(0, later.length ? 1 : 2));
    const opts = Phaser.Utils.Array.Shuffle([s.t, ...wrong]);
    const c = this.choice = this.add.container(0, 0).setDepth(150);
    c.add(this.add.rectangle(0, SY, W, SH, hex(C.ink), 0.78).setOrigin(0).setInteractive());
    c.add(txt(this, W / 2, SY + 40, "WHAT'S NEXT?", { ox: 0.5, size: 2, color: C.gold }));
    opts.forEach((o, i) => {
      const b = button(this, W / 2, SY + 90 + i * 50, W - 30, 40, o, () => this.choose(o, later.includes(o)), { color: 'btnGrey', textColor: C.white, depth: 151 });
      b.label.setMaxWidth((W - 44)); c.add(b);
    });
  }
  choose(o, isLater) {
    const s = this.step;
    if (o === s.t) { this.choice.destroy(); this.choice = null; audio.sfx('select'); this.phase = 'tool'; this.instr.setText(s.t); this.how.setText('GRAB THE RIGHT TOOL FROM THE TRUCK TRAY'); return; }
    const msg = isLater && s.early ? s.early : isLater ? 'WRONG ORDER! THAT COMES LATER, ROOKIE.' : pick(['THAT IS... NOT PLUMBING.', 'THE CUSTOMER SAW THAT. THE CUSTOMER IS UPSET.', 'NORTHWEST ENERGY. DON\'T.']);
    this.oops(msg, true);
  }
  pickTool(k, bg) {
    if (this.phase !== 'tool' || this.over) return;
    const s = this.step, info = TOOL_INFO[k] || { name: k };
    if (k === s.tool) {
      this.tool = k; audio.sfx('select'); bg.setStrokeStyle(2, hex(C.lime));
      this.instr.setText(s.t); this.how.setText(HOW[s.type](s));
      this.startInteraction();
    } else {
      audio.sfx('wrong');
      this.oops(info.decoy || `${info.name}? ${info.desc}. NOT FOR THIS.`, false);
      bg.setStrokeStyle(2, hex(C.red)); this.time.delayedCall(500, () => bg.active && bg.setStrokeStyle(1, hex(C.ink)));
    }
  }
  oops(msg, big) {
    this.mistakes++; const pen = this.df.penalty * (big ? 1.2 : 0.8);
    this.left -= pen; audio.sfx('wrong'); this.cameras.main.shake(180, 0.008);
    floatText(this, W / 2, SY + 60, `-${Math.round(pen)} SEC`, C.red, 160);
    const m = txt(this, W / 2, SY + SH / 2, msg, { ox: 0.5, oy: 0.5, maxW: W - 30, color: C.white, depth: 170, align: 1 });
    const bgm = this.add.rectangle(W / 2, SY + SH / 2, W - 16, m.height + 16, hex(C.crimson), 0.95).setStrokeStyle(2, hex(C.ink)).setDepth(169);
    this.time.delayedCall(big ? 1900 : 1300, () => { m.destroy(); bgm.destroy(); });
    if (big && this.job.leak == null) this.splash(W / 2, SY + SH / 2, 14);
    this.gripe();
  }
  gripe() { bubble(this, W - 60, SY + 60, pick(GRIPES), { dur: 1600, tail: 'up', maxW: 150 }); this.setMood('angry', 1200); }
  setMood(m, revert) { this.cust.setTexture(portrait(this, 'job' + this.ji, this.job.look, m)); if (revert) this.time.delayedCall(revert, () => this.updateMood(true)); }
  updateMood(force) {
    const f = this.left / this.total; const m = f > 0.55 ? 'neutral' : f > 0.25 ? 'worried' : f > 0.1 ? 'angry' : 'yell';
    if (m !== this.mood || force) { this.mood = m; this.cust.setTexture(portrait(this, 'job' + this.ji, this.job.look, m)); if (!force && m === 'angry') bubble(this, W - 60, SY + 60, pick(['HURRY UP!!', 'I SHOULD HAVE CALLED NORTHWEST.', 'TICK. TOCK.']), { dur: 1400, tail: 'up' }); if (!force && m === 'yell') { audio.sfx('alarm'); bubble(this, W - 60, SY + 60, "THAT'S IT, I'M CALLING NORTHWEST!", { dur: 1500, tail: 'up' }); } }
  }
  completeStep(auto) {
    if (this.over) return;
    this.clearInteraction();
    const s = this.step;
    audio.sfx('step');
    (s.fx || []).forEach(f => this.applyFx(f));
    if (this.job.leak && this.job.leak.until === this.si) this.stopLeak();
    this.left = Math.min(this.total, this.left + 1.5);
    floatText(this, W / 2, SY + 40, auto ? 'MILAN GOT IT!' : pick(['NICE!', 'CLEAN!', 'PRO MOVE!', 'SMOOTH!', 'HOMIE-GRADE!']), C.lime, 160);
    // pro tip
    const tip = this.add.container(0, 0).setDepth(160);
    tip.add(this.add.rectangle(W / 2, SY + SH - 26, W - 12, 42, hex(C.forest), 0.95).setStrokeStyle(1, hex(C.lime)));
    tip.add(txt(this, 12, SY + SH - 44, 'PRO TIP:', { color: C.yellow }));
    tip.add(txt(this, 12, SY + SH - 34, s.tip, { maxW: W - 24 }));
    this.phase = 'tip';
    const next = () => { if (tip.active) tip.destroy(); this.si++; if (this.si >= this.job.steps.length) this.success(); else this.beginStep(); };
    this.tipTimer = this.time.delayedCall(Math.min(2600, 900 + s.tip.length * 22), next);
    const skip = this.add.zone(0, SY, W, SH).setOrigin(0).setInteractive().setDepth(161);
    skip.once('pointerup', () => { skip.destroy(); if (this.tipTimer) this.tipTimer.remove(); next(); });
    this.time.delayedCall(2700, () => skip.active && skip.destroy());
  }
  useAssist(who) {
    if (this.over || (this.used || {})[who]) return;
    if (who === 'milan' && !['tool', 'act', 'choose'].includes(this.phase)) return;
    this.used = { ...(this.used || {}), [who]: true };
    const b = this.assists.find(a => a.label.text.startsWith(who.toUpperCase())); b && b.setEnabled(false);
    const h = HEROES.find(x => x.id === who);
    audio.sfx('coin');
    bubble(this, W / 2, SY + 110, who === 'milan' ? 'MILAN: SCOOT OVER. I GOT THIS.' : `JARED: ${this.job.who.split(' ')[0]}, HAVE YOU BEEN WORKING OUT?`, { dur: 1600, maxW: 200 });
    if (who === 'jared') { this.left = Math.min(this.total + 12, this.left + 12); this.total = Math.max(this.total, this.left); this.setMood('happy', 2000); floatText(this, W - 30, SY + 70, '+12 SEC', C.cyan, 160); }
    else { if (this.choice) { this.choice.destroy(); this.choice = null; } this.completeStep(true); }
  }

  // ------------------------------------------------------------------ interactions
  anchor(name) { const a = this.fix.anchors[name] || { x: W / 2, y: SH / 2, r: 30 }; return { ...a, x: a.x, y: SY + a.y, r: a.r || 26 }; }
  setupInput() {
    this.input.on('pointerdown', p => this.onDown(p));
    this.input.on('pointermove', p => this.onMove(p));
    this.input.on('pointerup', p => this.onUp(p));
  }
  startInteraction() {
    const s = this.step; this.phase = 'act'; this.act = { type: s.type, prog: 0 };
    const a = this.anchor(s.target || s.to);
    this.ring = this.add.circle(a.x, a.y, a.r, 0xffffff, 0).setStrokeStyle(2, hex(C.yellow)).setDepth(46);
    this.tweens.add({ targets: this.ring, scale: 1.25, alpha: 0.4, yoyo: true, repeat: -1, duration: 400 });
    const toolKey = 'tool_' + (s.item || this.tool);
    this.cursor = this.add.image(a.x + 18, a.y - 18, toolKey).setScale(1.5).setDepth(47);
    const A = this.act;
    if (s.type === 'rhythm') { A.m = 0; A.dir = 1; A.speed = 0.9 + this.df.t * 1.2; A.zw = 0.22 * this.win; A.z = 0.3 + Math.random() * 0.4; A.hits = 0; this.cursor.setPosition(a.x, a.y - 12); }
    if (s.type === 'hold') { A.v = 0; A.holding = false; }
    if (s.type === 'dial') { A.v = 0.25; A.stable = 0; }
    if (s.type === 'drag') { const it = s.item || this.tool; this.cursor.destroy(); this.cursor = this.add.image(W / 2, SY + SH - 34, 'tool_' + it).setScale(2).setDepth(47); A.home = { x: this.cursor.x, y: this.cursor.y }; this.tweens.add({ targets: this.cursor, y: this.cursor.y - 4, yoyo: true, repeat: -1, duration: 300 }); }
    if (s.type === 'pull') { A.part = this.parts[s.target]; A.base = A.part ? { x: A.part.x, y: A.part.y } : { x: a.x, y: a.y }; }
    if (s.type === 'scrub') { A.lastX = null; A.target = this.parts[s.target] || null; if (A.target) A.target.setVisible(true).setAlpha(1); }
    if (s.type === 'taps') this.spawnSpots(s);
    if (s.type === 'turn' || s.type === 'crank') { A.need = s.turns * 360 * (this.milan ? 0.8 : 1); A.wrong = 0; A.jamAt = []; if (s.type === 'crank') for (let j = 1; j <= s.jams; j++) A.jamAt.push(A.need * j / (s.jams + 1)); A.strain = 0; A.cable = 0; }
    if (s.type === 'tap') { /* just tap the anchor */ }
  }
  clearInteraction() {
    this.phase = 'done';
    [this.ring, this.cursor, this.gauge].forEach(o => o && o.destroy()); this.ring = this.cursor = this.gauge = null;
    (this.spots || []).forEach(sp => sp.destroy()); this.spots = [];
    if (this.monitor) { this.monitor.destroy(); this.monitor = null; }
    this.gfx.clear(); this.act = null; this.dragging = false;
  }
  near(p, a, extra = 20) { return Phaser.Math.Distance.Between(p.x, p.y, a.x, a.y) < a.r + extra; }
  onDown(p) {
    if (this.phase !== 'act' || !this.act || p.y > this.iy || p.y < SY) return;
    const s = this.step, A = this.act, a = this.anchor(s.target || s.to);
    A.pid = p.id;
    if (s.type === 'turn' || s.type === 'crank' || s.type === 'dial') { A.ang = Math.atan2(p.y - a.y, p.x - a.x); A.active = true; if (A.jam && this.time.now - A.lastMove > 450) { A.jam = false; audio.sfx('ding'); floatText(this, W / 2, SY + 80, 'NOW PUSH THROUGH!', C.lime, 160); } A.lastMove = this.time.now; }
    if (s.type === 'rhythm') this.rhythmTap();
    if (s.type === 'hold') { A.holding = true; }
    if (s.type === 'drag' && Phaser.Math.Distance.Between(p.x, p.y, this.cursor.x, this.cursor.y) < 36) { this.dragging = true; this.tweens.killTweensOf(this.cursor); }
    if (s.type === 'pull' && this.near(p, a, 30)) { A.start = { x: p.x, y: p.y }; A.active = true; }
    if (s.type === 'scrub') { A.lastX = p.x; A.lastY = p.y; }
    if (s.type === 'tap' && this.near(p, a, 14)) { const pt = this.parts[s.target]; if (pt) this.tweens.add({ targets: pt, y: pt.y + 3, yoyo: true, duration: 90 }); if (s.fx && s.fx.includes('flush')) audio.sfx('flush'); else audio.sfx('click'); this.completeStep(); }
  }
  onMove(p) {
    if (this.phase !== 'act' || !this.act || !p.isDown) return;
    const s = this.step, A = this.act, a = this.anchor(s.target || s.to);
    if ((s.type === 'turn' || s.type === 'crank' || s.type === 'dial') && A.active) {
      const ang = Math.atan2(p.y - a.y, p.x - a.x); let d = Phaser.Math.Angle.Wrap(ang - A.ang); A.ang = ang;
      if (Phaser.Math.Distance.Between(p.x, p.y, a.x, a.y) < 8) return;
      const deg = Phaser.Math.RadToDeg(d); A.lastMove = this.time.now; A.moving = Math.abs(deg);
      this.turnMove(deg);
    }
    if (s.type === 'drag' && this.dragging) { this.cursor.setPosition(p.x, p.y - 10); }
    if (s.type === 'pull' && A.active) {
      const [dx, dy] = s.dir; const proj = (p.x - A.start.x) * dx + (p.y - A.start.y) * dy;
      A.prog = Phaser.Math.Clamp(Math.max(A.prog, proj / s.dist), 0, 1);
      if (A.part) A.part.setPosition(A.base.x + dx * s.dist * A.prog, A.base.y + dy * s.dist * A.prog);
      if (A.prog >= 1) this.finishPull();
      if (Math.random() < 0.15) audio.sfx(s.target === 'hair' || s.target === 'junk' ? 'squelch' : 'scrub');
    }
    if (s.type === 'scrub' && A.lastX != null) {
      const d = Math.hypot(p.x - A.lastX, p.y - A.lastY); A.lastX = p.x; A.lastY = p.y;
      if (!this.near(p, a, 30)) return;
      A.prog += d / (700 * s.amount); if (Math.random() < 0.3) audio.sfx('scrub', 0.8);
      if (A.target) A.target.setAlpha(1 - A.prog * 0.9);
      if (Math.random() < 0.25) this.crumb(p.x, p.y);
      if (A.prog >= 1) { if (A.target) this.tweens.add({ targets: A.target, alpha: 0, duration: 200, onComplete: () => A.target.setVisible(false) }); this.sparkle(a.x, a.y); this.completeStep(); }
    }
  }
  onUp(p) {
    if (this.phase !== 'act' || !this.act) return;
    const s = this.step, A = this.act, a = this.anchor(s.target || s.to);
    A.active = false;
    if (s.type === 'hold' && A.holding) {
      A.holding = false; const [lo, hi] = this.zone();
      if (A.v >= lo && A.v <= hi) { audio.sfx('ding'); this.completeStep(); }
      else if (A.v > 0.05) { this.oops(A.v < lo ? 'NOT ENOUGH! TRY AGAIN.' : 'TOO MUCH!', false); A.v = 0; }
    }
    if (s.type === 'drag' && this.dragging) {
      this.dragging = false;
      if (Phaser.Math.Distance.Between(this.cursor.x, this.cursor.y, a.x, a.y) < a.r + 14) {
        const show = DRAG_SHOWS[s.item || this.tool];
        if (show) this.applyFx((s.item ? 'restore:' : 'show:') + show);
        audio.sfx('plop'); this.sparkle(a.x, a.y); this.completeStep();
      } else { this.tweens.add({ targets: this.cursor, x: A.home.x, y: A.home.y, duration: 200 }); }
    }
    if (s.type === 'pull' && A.prog < 1 && A.prog > 0.05) {
      A.prog *= 0.4; audio.sfx('back'); floatText(this, a.x, a.y - 20, 'IT SLIPPED BACK!', C.red, 160);
      if (A.part) this.tweens.add({ targets: A.part, x: A.base.x + s.dir[0] * s.dist * A.prog, y: A.base.y + s.dir[1] * s.dist * A.prog, duration: 180 });
    }
    if (s.type === 'scrub') A.lastX = null;
  }
  zone() { const s = this.step; const [lo, hi] = s.zone; const c = (lo + hi) / 2, h = (hi - lo) / 2 * this.win; return [Math.max(0.05, c - h), Math.min(0.99, c + h)]; }
  turnMove(deg) {
    const s = this.step, A = this.act, pt = this.parts[s.target];
    if (s.type === 'dial') {
      A.v = Phaser.Math.Clamp(A.v + deg / 540, 0, 1);
      if (pt) pt.angle += deg; if (Math.abs(deg) > 2 && Math.random() < 0.3) audio.sfx('ratchet', 0.6);
      if (A.v > 0.9) { this.oops('WHOA! 90 PSI! PIPES ARE BANGING!', false); A.v = 0.6; }
      return;
    }
    const want = s.dir || 1; const good = deg * want;
    if (good > 0) {
      if (s.type === 'crank' && A.jam) { A.strain += good; if (A.strain > 160) { this.oops('YOU KINKED THE CABLE! EASE OFF WHEN IT BINDS!', false); A.strain = 0; } return; }
      A.prog += good; A.tick = (A.tick || 0) + good; if (A.tick > 30) { A.tick = 0; audio.sfx('ratchet'); }
      if (pt && this.canSpin(pt)) pt.angle += deg * 0.5;
      if (this.cursor) this.cursor.angle += deg;
      if (s.type === 'crank' && A.jamAt.length && A.prog >= A.jamAt[0]) { A.jamAt.shift(); A.jam = true; A.jamT = 0; A.jamAt0 = this.time.now; audio.sfx('buzz'); floatText(this, W / 2, SY + 80, 'IT\'S BINDING! LET GO...', C.red, 160); }
      if (A.prog >= A.need) this.completeStep();
    } else {
      A.wrong += -good; A.prog = Math.max(0, A.prog + good * 0.5);
      if (pt && this.canSpin(pt)) pt.angle += deg * 0.5;
      if (A.wrong > 120) { A.wrong = 0; this.oops(want > 0 ? 'RIGHTY-TIGHTY! CLOCKWISE!' : 'LEFTY-LOOSEY! COUNTER-CLOCKWISE!', false); }
    }
  }
  canSpin(pt) { return pt.width <= 40 && pt.height <= 40; }
  rhythmTap() {
    const A = this.act, s = this.step; const inZone = Math.abs(A.m - A.z) < A.zw / 2;
    const a = this.anchor(s.target);
    if (this.cursor) this.tweens.add({ targets: this.cursor, y: a.y + 6, yoyo: true, duration: 80 });
    if (inZone) {
      A.hits++; audio.sfx(s.tool === 'plunger' ? 'plunge' : s.tool === 'lighter' ? 'click' : s.tool === 'jetter' ? 'spray' : 'crack'); this.cameras.main.shake(80, 0.004);
      floatText(this, a.x, a.y - 30, `${A.hits}/${s.hits}`, C.lime, 160); A.z = 0.2 + Math.random() * 0.6;
      if (s.tool === 'lighter') this.sparkle(a.x, a.y);
      if (s.tool === 'jetter') this.splash(a.x, a.y, 8);
      if (A.hits >= s.hits) this.completeStep();
    } else { audio.sfx('back'); floatText(this, a.x, a.y - 30, 'MISSED', C.red, 160); this.left -= 1.5; A.misses = (A.misses || 0) + 1; if (A.misses % 3 === 0) this.gripe(); }
  }
  finishPull() {
    const s = this.step, A = this.act; A.active = false;
    audio.sfx('plop');
    if (A.part && !s.keep) this.tweens.add({ targets: A.part, alpha: 0, x: A.part.x + s.dir[0] * 60, y: A.part.y + s.dir[1] * 60, duration: 350, onComplete: () => A.part.setVisible(false) });
    if (s.target === 'hair') bubble(this, W - 60, SY + 60, pick(['OH MY GOD.', 'IS THAT... ALIVE?', "I'M GONNA BE SICK."]), { dur: 1400, tail: 'up' });
    if (s.target === 'junk') floatText(this, W / 2, SY + 100, 'ONE SMARTWATCH. 12,000 STEPS.', C.cyan, 160);
    this.completeStep();
  }
  spawnSpots(s) {
    this.spots = [];
    const a = this.fix.anchors[s.target] || {};
    if (s.target === 'screen') { // sewer camera monitor
      const m = this.monitor = this.add.container(0, 0).setDepth(44);
      m.add(this.add.rectangle(W / 2, SY + 110, 200, 130, hex(C.ink)).setStrokeStyle(3, hex(C.slate)));
      for (let r = 60; r > 4; r -= 8) m.add(this.add.ellipse(W / 2, SY + 110, r * 1.6, r * 1.1, [hex(C.umber), hex(C.brown), hex(C.clay)][(r / 8) % 3]));
      m.add(this.add.ellipse(W / 2, SY + 110, 16, 11, hex(C.ink)));
      m.add(txt(this, W / 2 - 96, SY + 48, 'CAM 1  REC *  32 FT', { color: C.lime }));
    }
    const pts = a.spots ? a.spots.map(([x, y]) => [x, SY + y]) : Array.from({ length: s.count }, (_, i) => {
      const ar = a.area || [W / 2 - 80, 60, 160, 120];
      return [ar[0] + 10 + ((i * 37 + this.ji * 13) % (ar[2] - 20)), SY + ar[1] + 10 + ((i * 53 + 7) % (ar[3] - 20))];
    });
    this.need = pts.length;
    pts.forEach(([x, y], i) => {
      let sp;
      if (s.target === 'screen') { sp = this.add.container(x, y); for (let k = 0; k < 5; k++) sp.add(this.add.rectangle(Phaser.Math.Between(-7, 7), Phaser.Math.Between(-7, 7), 2, Phaser.Math.Between(6, 14), hex(C.tan)).setAngle(Phaser.Math.Between(-60, 60))); }
      else if (s.target === 'pit') { sp = this.add.image(x, y, pick(['gunk', 'tp', 'bush', 'turd'])).setScale(1.3); }
      else { sp = this.add.image(x, y, 'drop').setScale(2); this.tweens.add({ targets: sp, y: y + 4, yoyo: true, repeat: -1, duration: 250 }); }
      sp.setDepth(48).setSize(30, 30).setInteractive(new Phaser.Geom.Circle(0, 0, 18), Phaser.Geom.Circle.Contains);
      if (sp.setInteractive && sp.input) sp.input.cursor = 'pointer';
      sp.on('pointerdown', () => { if (this.phase !== 'act') return; audio.sfx(s.target === 'screen' ? 'crack' : 'plop'); this.sparkle(x, y); sp.destroy(); this.need--; if (this.need <= 0) this.completeStep(); });
      if (s.target === 'screen') this.tweens.add({ targets: sp, angle: 10, yoyo: true, repeat: -1, duration: 300 + i * 50 });
      this.spots.push(sp);
    });
  }

  // ------------------------------------------------------------------ effects
  applyFx(f) {
    const [op, name] = f.split(':'); const pt = this.parts[name];
    if (op === 'show' && pt) { pt.setVisible(true).setAlpha(0); this.tweens.add({ targets: pt, alpha: 1, duration: 200 }); }
    if (op === 'hide' && pt) pt.setVisible(false);
    if (op === 'away' && pt) this.tweens.add({ targets: pt, alpha: 0, y: pt.y - 16, duration: 300, onComplete: () => pt.setVisible(false) });
    if (op === 'fade' && pt) this.tweens.add({ targets: pt, alpha: 0, scale: 0.6, duration: 900, onComplete: () => pt.setVisible(false) });
    if (op === 'restore' && pt) { this.tweens.killTweensOf(pt); pt.setVisible(true).setAlpha(1).setPosition(pt.home.x, pt.home.y).setAngle(pt.home.angle).setScale(pt.home.sx, pt.home.sy); }
    if (op === 'clean' && pt) { this.tweens.add({ targets: pt, scaleX: 0.3, scaleY: 0.3, duration: 500, yoyo: true, onYoyo: () => pt.setTint(0x2ce8f5) }); audio.sfx('flush'); }
    if (op === 'lower' && pt) { this.tweens.killTweensOf(pt); this.tweens.add({ targets: pt, scaleY: 0.08, duration: 900 }); audio.sfx('flush'); }
    if (op === 'raise' && pt) this.tweens.add({ targets: pt, scaleY: 1, duration: 1400 });
    if (op === 'flush') { const bw = this.parts.bowlwater; if (bw) this.tweens.add({ targets: bw, angle: 360, scale: 0.4, yoyo: true, duration: 700 }); }
    if (op === 'motor') audio.sfx('motor');
    if (op === 'splashsfx') audio.sfx('spray');
  }
  startLeak() {
    const L = this.job.leak; if (!L) return;
    const x = L.x, y = SY + L.y;
    if (L.kind === 'drip') this.leakEv = this.time.addEvent({ delay: 650, loop: true, callback: () => { const d = this.add.image(x, y, 'drop').setDepth(30); audio.sfx('drip'); this.tweens.add({ targets: d, y: y + 40, alpha: 0, duration: 450, ease: 'Quad.in', onComplete: () => d.destroy() }); } });
    if (L.kind === 'spray') { this.leakEv = this.add.particles(x, y, 'drop', { speed: { min: 60, max: 160 }, angle: { min: 200, max: 340 }, gravityY: 300, lifespan: 700, frequency: 30, quantity: 2, scale: { start: 1.2, end: 0.6 } }).setDepth(30); audio.sfx('spray'); this.sprayEv = this.time.addEvent({ delay: 800, loop: true, callback: () => audio.sfx('spray') }); }
    if (L.kind === 'bubble') this.leakEv = this.time.addEvent({ delay: 250, loop: true, callback: () => { const d = this.add.image(x + Phaser.Math.Between(-6, 6), y, 'dot').setDepth(30).setTint(0x2ce8f5); this.tweens.add({ targets: d, y: y - 40, alpha: 0, duration: 700, onComplete: () => d.destroy() }); } });
  }
  stopLeak() { if (this.leakEv) { this.leakEv.destroy ? this.leakEv.destroy() : this.leakEv.remove(); this.leakEv = null; } if (this.sprayEv) this.sprayEv.remove(); floatText(this, W / 2, SY + 70, 'LEAK STOPPED', C.cyan, 160); }
  sparkle(x, y) { for (let i = 0; i < 6; i++) { const s = this.add.image(x, y, 'spark').setDepth(50); this.tweens.add({ targets: s, x: x + Phaser.Math.Between(-24, 24), y: y + Phaser.Math.Between(-24, 24), alpha: 0, duration: 400, onComplete: () => s.destroy() }); } }
  splash(x, y, n = 10) { for (let i = 0; i < n; i++) { const s = this.add.image(x, y, 'drop').setDepth(50); this.tweens.add({ targets: s, x: x + Phaser.Math.Between(-50, 50), y: y + Phaser.Math.Between(-40, 30), alpha: 0, duration: 500, onComplete: () => s.destroy() }); } }
  crumb(x, y) { const s = this.add.image(x, y, 'gunk').setDepth(50); this.tweens.add({ targets: s, y: y + 30, x: x + Phaser.Math.Between(-10, 10), alpha: 0, duration: 400, onComplete: () => s.destroy() }); }

  // ------------------------------------------------------------------ loop
  update(t, dms) {
    if (this.over) return;
    const dt = Math.min(0.05, dms / 1000);
    if (this.phase !== 'tip') this.left -= dt;
    const f = Math.max(0, this.left / this.total);
    this.bar.width = W * f; this.bar.fillColor = f > 0.5 ? hex(C.lime) : f > 0.25 ? hex(C.gold) : hex(C.red);
    const sec = Math.max(0, Math.ceil(this.left)); this.clock.setText(`${Math.floor(sec / 60)}:${String(sec % 60).padStart(2, '0')}`).setTint(f < 0.25 ? hex(C.red) : 0xffffff);
    if (f < 0.25 && Math.floor(this.left * 2) !== this.lastTick) { this.lastTick = Math.floor(this.left * 2); if (this.lastTick % 2 === 0) audio.sfx('tick'); }
    this.updateMood();
    if (this.left <= 0) { this.fail(); return; }
    // interaction visuals
    const g = this.gfx; g.clear();
    const A = this.act; if (!A || this.phase !== 'act') return;
    const s = this.step, a = this.anchor(s.target || s.to);
    if (s.type === 'turn' || s.type === 'crank') {
      const p = Math.min(1, A.prog / A.need);
      g.lineStyle(4, hex(C.ink), 0.8).strokeCircle(a.x, a.y, a.r + 10);
      g.lineStyle(4, A.jam ? hex(C.red) : hex(C.lime), 1).beginPath();
      const st = -Math.PI / 2; const want = s.dir || 1;
      g.arc(a.x, a.y, a.r + 10, st, st + want * p * Math.PI * 2, want < 0); g.strokePath();
      // direction chevrons
      const ang = (t / 300) * want; for (let k = 0; k < 3; k++) { const q = ang + k * 2.09; const cx = a.x + Math.cos(q) * (a.r + 10), cy = a.y + Math.sin(q) * (a.r + 10); g.fillStyle(hex(C.yellow), 1).fillTriangle(cx + Math.cos(q + want * 1.57) * 5, cy + Math.sin(q + want * 1.57) * 5, cx + Math.cos(q) * 4, cy + Math.sin(q) * 4, cx - Math.cos(q) * 4, cy - Math.sin(q) * 4); }
      if (s.type === 'crank') {
        if (A.jam) { A.jamT += (this.time.now - (A.lastMove || 0) > 120) ? dt : 0; A.strain = Math.max(0, A.strain - 60 * dt); if (A.jamT > 0.5) { A.jam = false; audio.sfx('ding'); floatText(this, W / 2, SY + 80, 'NOW PUSH THROUGH!', C.lime, 160); } }
        const len = 20 + p * 60; g.lineStyle(2, hex(C.steel)).beginPath(); g.moveTo(a.x, a.y); for (let k = 0; k < 10; k++) g.lineTo(a.x + Math.sin(k + t / 80) * (A.jam ? 6 : 2), a.y + k * len / 10); g.strokePath();
      }
    }
    if (s.type === 'dial' || s.type === 'hold' || s.type === 'rhythm') {
      // meter bar
      const bx = 20, by = SY + SH - 22, bw = W - 40, bh = 12;
      g.fillStyle(hex(C.ink), 0.9).fillRect(bx - 3, by - 3, bw + 6, bh + 6);
      g.fillStyle(hex(C.storm), 1).fillRect(bx, by, bw, bh);
      let zl, zh, v;
      if (s.type === 'rhythm') { A.m += A.dir * A.speed * dt; if (A.m > 1) { A.m = 1; A.dir = -1; } if (A.m < 0) { A.m = 0; A.dir = 1; } zl = A.z - A.zw / 2; zh = A.z + A.zw / 2; v = A.m; }
      if (s.type === 'hold') { if (A.holding) { A.v += dt * (0.45 + A.v * 0.9) * (1 + this.df.t * 0.6); if (A.v >= 1) { A.holding = false; audio.sfx('crack'); this.oops(s.label === 'TORQUE' ? 'CRACK! OVER-TIGHTENED!' : 'WAY TOO MUCH!', false); A.v = 0; } } [zl, zh] = this.zone(); v = A.v; }
      if (s.type === 'dial') { [zl, zh] = this.zone(); v = A.v; const inz = v >= zl && v <= zh; A.stable = inz ? A.stable + dt : 0; if (inz && A.stable > 0.9) { audio.sfx('ding'); this.completeStep(); return; } const nd = this.parts.needle; if (nd) nd.setAngle(150 + v * 240); }
      g.fillStyle(hex(C.green), 1).fillRect(bx + bw * zl, by, bw * (zh - zl), bh);
      g.fillStyle(hex(C.lime), 1).fillRect(bx + bw * zl, by, bw * (zh - zl), 2);
      if (s.type === 'hold' || s.type === 'dial') g.fillStyle(hex(C.gold), 1).fillRect(bx, by + 4, bw * v, bh - 8);
      g.fillStyle(0xffffff, 1).fillRect(bx + bw * v - 2, by - 4, 4, bh + 8);
      if (s.type === 'dial') { const psi = Math.round(v * 100); g.fillStyle(hex(C.ink), 0.9).fillRect(W / 2 - 34, by - 26, 68, 18); if (!this.psiTxt) this.psiTxt = txt(this, W / 2, by - 22, '', { ox: 0.5, depth: 46 }); this.psiTxt.setText(psi + ' PSI'); }
      if (s.type === 'rhythm' && this.cursor) { this.cursor.setScale(Phaser.Math.Clamp(1.5 + (0.5 - Math.abs(A.m - A.z)) * 0.6, 1.4, 2)); }
    } else if (this.psiTxt) { this.psiTxt.destroy(); this.psiTxt = null; }
    if (s.type === 'pull' && A) {
      const [dx, dy] = s.dir; const sx = a.x + dx * 18, sy = a.y + dy * 18;
      g.lineStyle(3, hex(C.yellow), 0.9).lineBetween(sx, sy, sx + dx * 40, sy + dy * 40);
      g.fillStyle(hex(C.yellow), 1).fillTriangle(sx + dx * 48, sy + dy * 48, sx + dx * 38 - dy * 7, sy + dy * 38 + dx * 7, sx + dx * 38 + dy * 7, sy + dy * 38 - dx * 7);
      g.fillStyle(hex(C.ink), 0.8).fillRect(20, SY + SH - 18, W - 40, 8); g.fillStyle(hex(C.lime), 1).fillRect(20, SY + SH - 18, (W - 40) * A.prog, 8);
    }
    if (s.type === 'scrub') { g.fillStyle(hex(C.ink), 0.8).fillRect(20, SY + SH - 18, W - 40, 8); g.fillStyle(hex(C.cyan), 1).fillRect(20, SY + SH - 18, (W - 40) * Math.min(1, A.prog), 8); }
    if (s.type === 'drag') { g.lineStyle(2, hex(C.lime), 0.5 + Math.sin(t / 100) * 0.4).strokeCircle(a.x, a.y, a.r); }
  }

  // ------------------------------------------------------------------ endings
  success() {
    if (this.over) return; this.over = true; this.clearInteraction();
    audio.stopMusic(); audio.music('win');
    this.cust.setTexture(portrait(this, 'job' + this.ji, this.job.look, 'happy'));
    banner(this, 'FIXED!', { color: C.lime, size: 4, y: SY + SH / 2 });
    const ratio = Math.max(0, this.left / this.total);
    const stars = 1 + (ratio > 0.3 ? 1 : 0) + (ratio > 0.5 && this.mistakes <= 1 && this.drive.hp >= this.drive.maxHp - 1 ? 1 : 0);
    const score = Math.round(1000 + ratio * 2000 - this.mistakes * 150 + this.drive.hp * 100 + (this.drive.cash || 0));
    this.time.delayedCall(1600, () => wipeTo(this, 'Result', { job: this.ji, ok: true, stars, score, secsLeft: Math.ceil(this.left), mistakes: this.mistakes }));
  }
  fail() {
    if (this.over) return; this.over = true; this.clearInteraction();
    audio.stopMusic(); audio.music('lose');
    this.cust.setTexture(portrait(this, 'job' + this.ji, this.job.look, 'yell'));
    banner(this, 'TIME!', { color: C.red, size: 4, y: SY + SH / 2 });
    this.time.delayedCall(1500, () => wipeTo(this, 'Result', { job: this.ji, ok: false, mistakes: this.mistakes }));
  }
  pause() {
    if (this.over) return;
    this.scene.pause(); this.scene.launch('Pause', { from: 'Repair', job: this.ji });
  }
}
