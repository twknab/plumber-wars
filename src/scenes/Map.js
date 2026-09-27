import Phaser from 'phaser';
import { W, H, txt, button, wipeTo, wipeIn, panel, soundToggle, stars } from '../core/ui.js';
import { audio } from '../core/audio.js';
import { progress } from '../core/save.js';
import { C, hex } from '../core/palette.js';
import { DISTRICTS, HEROES } from '../data/content.js';
import { JOBS } from '../data/jobs.js';
import { PX } from '../core/pixel.js';
import { portrait } from '../art/people.js';

const NODES = [[62, 52], [118, 62], [182, 128], [60, 204], [104, 108], [26, 176]];
const BONUS_OPEN = 9; // Alki opens once West Seattle does

function drawMap(scene) {
  if (scene.textures.exists('seattleMap')) return;
  const w = W, h = 240, p = new PX(w, h);
  p.rect(0, 0, w, h, C.navy);
  for (let j = 0; j < h; j += 5) for (let i = (j * 3) % 11; i < w; i += 11) p.hline(i, j, 3, C.blue);
  const land = [[40, 0], [228, 0], [226, 40], [214, 90], [222, 140], [216, 200], [226, 240], [100, 240], [96, 180], [84, 158], [66, 150], [72, 130], [60, 100], [36, 80], [30, 40]];
  p.poly(land, C.forest);
  p.poly([[20, 170], [84, 164], [92, 180], [96, 240], [14, 240], [8, 200]], C.forest); // West Seattle
  p.dither(0, 0, w, h, C.green, 0.08);
  // ship canal + Lake Union
  p.thick(34, 72, 130, 74, 5, C.navy); p.ellipse(140, 92, 12, 22, C.navy); p.ellipse(138, 90, 8, 18, C.blue);
  // Duwamish
  p.thick(92, 160, 104, 240, 6, C.navy);
  // Lake Washington
  p.poly([[230, 0], [270, 0], [270, 240], [232, 240], [222, 180], [230, 120], [220, 60]], C.navy); p.dither(234, 0, 36, 240, C.blue, 0.3);
  // I-5 and arterials
  for (let y = 0; y < h; y++) p.px(160 + Math.round(Math.sin(y / 30) * 6), y, C.gold);
  p.thick(60, 52, 118, 62, 1, C.sand); p.thick(118, 62, 104, 108, 1, C.sand); p.thick(104, 108, 182, 128, 1, C.sand); p.thick(104, 108, 90, 150, 1, C.sand); p.thick(90, 150, 60, 204, 1, C.sand);
  // Space Needle marker & Rainier hint
  p.rect(112, 120, 2, 8, C.silver); p.rect(109, 118, 8, 2, C.silver);
  p.outline(C.ink);
  p.toTexture(scene, 'seattleMap');
}

export class MapScene extends Phaser.Scene {
  constructor() { super('Map'); }
  create() {
    wipeIn(this); audio.music('map');
    drawMap(this);
    this.add.rectangle(0, 0, W, H, hex(C.ink)).setOrigin(0);
    const top = 30;
    this.add.image(0, top, 'seattleMap').setOrigin(0);
    const hero = HEROES.find(h => h.id === progress.hero) || HEROES[0];
    // header
    this.add.image(14, 14, 'badge').setScale(0.6);
    txt(this, 28, 5, "G'S PLUMBING DISPATCH", { color: C.lime });
    txt(this, 28, 16, `LEAD: ${hero.name}   ` + '`' + ` ${progress.totalStars()}/48`, { color: C.gold });
    soundToggle(this, W - 12, 12);
    const unlocked = progress.unlocked;
    const curD = Math.min(4, Math.floor(unlocked / 3));
    // Northwest market share meter
    const share = Math.max(0, 100 - Math.round(unlocked / 15 * 100));
    this.add.rectangle(W - 86, top + 6, 80, 16, hex(C.ink), 0.85).setOrigin(0).setStrokeStyle(1, hex(C.red));
    txt(this, W - 83, top + 8, `NW TURF ${share}%`, { color: C.red });
    this.add.rectangle(W - 83, top + 17, 74, 2, hex(C.storm)).setOrigin(0); this.add.rectangle(W - 83, top + 17, 74 * share / 100, 2, hex(C.red)).setOrigin(0);
    // nodes
    NODES.forEach(([x, y], d) => {
      const bonus = d === 5; const done = bonus ? progress.stars(15) > 0 : unlocked >= (d + 1) * 3, open = bonus ? unlocked >= BONUS_OPEN : unlocked >= d * 3;
      const col = done ? C.lime : open ? C.gold : C.red;
      const ring = this.add.circle(x, top + y, 9, hex(C.ink)).setStrokeStyle(2, hex(col));
      if (done) this.add.image(x, top + y, 'badge').setScale(0.4); else this.add.image(x, top + y, open ? 'iPin' : 'iTruck').setScale(open ? 1.4 : 1);
      txt(this, x + (bonus ? 12 : 0), top + y + 12, bonus ? 'ALKI (BONUS)' : DISTRICTS[d].name, { ox: 0.5, color: bonus && open && !done ? C.cyan : col });
      if (d === curD && !done) this.tweens.add({ targets: ring, scale: 1.5, alpha: 0.3, yoyo: true, repeat: -1, duration: 500 });
      ring.setInteractive({ useHandCursor: true }).on('pointerup', () => { if (open) { audio.sfx('select'); this.showDistrict(d); } else audio.sfx('wrong'); });
    });
    this.listY = top + 244;
    this.list = this.add.container(0, 0);
    this.showDistrict(curD);
    const kb = this.input.keyboard; this.curD = curD;
    kb.on('keydown-ENTER', () => { if (this.enterJob != null) this.play(this.enterJob); });
    kb.on('keydown-SPACE', () => { if (this.enterJob != null) this.play(this.enterJob); });
    const step = d => { const n = this.curD + d; if (n >= 0 && n <= 5 && (n === 5 ? progress.unlocked >= BONUS_OPEN : progress.unlocked >= n * 3)) { this.curD = n; audio.sfx('select'); this.showDistrict(n); } };
    kb.on('keydown-LEFT', () => step(-1)); kb.on('keydown-RIGHT', () => step(1)); kb.on('keydown-UP', () => step(-1)); kb.on('keydown-DOWN', () => step(1));
    kb.on('keydown-ESC', () => wipeTo(this, 'Title'));
  }
  showDistrict(d) {
    this.list.removeAll(true);
    const unlocked = progress.unlocked;
    const y0 = this.listY, D = DISTRICTS[d];
    this.list.add(panel(this, 4, y0, W - 8, H - y0 - 4));
    this.list.add(txt(this, 12, y0 + 7, `${d + 1}. ${D.name}`, { size: 2, color: C.gold }));
    this.list.add(txt(this, 12, y0 + 24, D.tag, { color: C.silver, maxW: W - 24 }));
    const rowH = Math.min(46, Math.floor((H - y0 - 80) / 3));
    let firstOpen = null;
    for (let k = 0; k < (d === 5 ? 1 : 3); k++) {
      const i = d * 3 + k, job = JOBS[i]; const y = y0 + 40 + k * (rowH + 3);
      const open = d === 5 ? unlocked >= BONUS_OPEN : (i <= unlocked && i < 15), done = d === 5 ? progress.stars(15) > 0 : i < unlocked;
      const row = this.add.rectangle(10, y, W - 20, rowH, hex(open ? C.storm : C.night)).setOrigin(0).setStrokeStyle(1, hex(done ? C.lime : open ? C.gold : C.storm));
      this.list.add(row);
      if (open) {
        this.list.add(this.add.image(30, y + rowH / 2, portrait(this, 'job' + i, job.look, done ? 'happy' : 'worried')).setScale(Math.min(0.8, rowH / 50)));
        this.list.add(txt(this, 54, y + 5, job.title, { color: done ? C.lime : C.white }));
        this.list.add(txt(this, 54, y + 16, job.who + ' - ' + job.address, { color: C.silver, maxW: W - 136 }));
        if (done) stars(this, W - 42, y + 9, progress.stars(i)).forEach(s => this.list.add(s));
        const b = button(this, W - 42, y + rowH - 12, 56, 16, done ? 'REPLAY' : 'GO!', () => this.play(i), { color: done ? 'btnGrey' : 'btnGreen', textColor: C.white, depth: 60 });
        this.list.add(b);
        if (!done && firstOpen == null) { firstOpen = i; this.tweens.add({ targets: b, scale: 1.1, yoyo: true, repeat: -1, duration: 400 }); }
      } else {
        this.list.add(this.add.image(30, y + rowH / 2, 'iLock').setScale(2));
        this.list.add(txt(this, 54, y + rowH / 2 - 4, '???  (NORTHWEST TERRITORY)', { color: C.steel }));
      }
    }
    if (firstOpen != null) this.enterJob = firstOpen; else this.enterJob = null;
    this.list.add(button(this, 52, H - 18, 84, 22, 'CHANGE LEAD', () => wipeTo(this, 'Crew'), { color: 'btnGrey', textColor: C.white, depth: 60 }));
    this.list.add(button(this, W - 52, H - 18, 84, 22, 'MAIN MENU', () => wipeTo(this, 'Title'), { color: 'btnGrey', textColor: C.white, depth: 60 }));
  }
  play(i) { audio.sfx('go'); wipeTo(this, 'Brief', { job: i }); }
}
