import Phaser from 'phaser';
import { W, H, txt, button, wipeTo, wipeIn, panel, soundToggle, stars } from '../core/ui.js';
import { audio } from '../core/audio.js';
import { progress } from '../core/save.js';
import { C, hex } from '../core/palette.js';
import { DISTRICTS, HEROES, ORDER, districtJobs } from '../data/content.js';
import { JOBS } from '../data/jobs.js';
import { PX } from '../core/pixel.js';
import { portrait } from '../art/people.js';
import { goToJob } from './District.js';

// Pin positions, projected from real coordinates (lon -122.44..-122.215, lat 47.69..47.555; north up).
const NODES = [[68, 30], [112, 56], [150, 116], [72, 222], [98, 100], [40, 182]];
const PIN_ICONS = ['pin_ballard', 'pin_fremont', 'pin_capitol', 'pin_westseattle', 'pin_queenanne', 'pin_alki'];
const DORDER = [0, 1, 2, 3, 5, 4]; // district play order: Alki comes before the Queen Anne showdown

function drawMap(scene) {
  if (scene.textures.exists('seattleMap')) return;
  const w = W, h = 240, p = new PX(w, h);
  // water everywhere (Puget Sound, Elliott Bay), then the land on top
  p.rect(0, 0, w, h, C.navy);
  for (let j = 0; j < h; j += 5) for (let i = (j * 3) % 11; i < w; i += 11) p.hline(i, j, 3, C.blue);
  // the city: Shilshole, Discovery Park / Magnolia, Interbay, Elliott Bay waterfront, down to the Duwamish,
  // and the Lake Washington shoreline (Sand Point, Union Bay, Madison Park, Leschi, Seward Park) on the east
  p.poly([[42, 0], [46, 32], [30, 44], [8, 48], [6, 56], [18, 70], [34, 90], [46, 106], [66, 112], [84, 116], [100, 132], [118, 150], [124, 166],
    [118, 178], [108, 184], [104, 200], [108, 240], [220, 240], [214, 222], [200, 206], [188, 176], [186, 150], [192, 118], [194, 96], [190, 76],
    [198, 60], [214, 44], [226, 28], [214, 12], [206, 0]], C.forest);
  // West Seattle: Duwamish Head, Alki Beach, Alki Point, down the west side
  p.poly([[64, 168], [50, 176], [36, 184], [24, 194], [20, 210], [28, 226], [34, 240], [98, 240], [96, 214], [88, 198], [80, 182], [72, 172]], C.forest);
  // Harbor Island at the mouth of the Duwamish
  p.rect(98, 186, 8, 14, C.slate);
  // the far shore of Lake Washington and Mercer Island
  p.poly([[256, 0], [270, 0], [270, 240], [252, 240], [258, 180], [252, 120], [260, 60]], C.forest);
  p.poly([[236, 176], [246, 172], [250, 200], [246, 240], [232, 240], [230, 210]], C.forest);
  p.dither(0, 0, w, h, C.green, 0.08);
  // Salmon Bay + the Ship Canal from the Locks to Lake Union, then the Montlake Cut to Lake Washington
  const canal = [[40, 42], [56, 42], [72, 48], [92, 58], [106, 68], [116, 76]];
  for (let i = 1; i < canal.length; i++) p.thick(canal[i - 1][0], canal[i - 1][1], canal[i][0], canal[i][1], 5, C.navy);
  p.ellipse(126, 94, 11, 20, C.navy); p.ellipse(125, 93, 8, 16, C.blue);                    // Lake Union
  for (const [a, b] of [[[132, 80], [152, 78]], [[152, 78], [170, 76]], [[170, 76], [194, 72]]]) p.thick(a[0], a[1], b[0], b[1], 4, C.navy); // Portage Bay, Montlake Cut, Union Bay
  p.ellipse(132, 18, 7, 9, C.navy); p.ellipse(132, 17, 5, 7, C.blue);                        // Green Lake
  // the Duwamish between West Seattle and SoDo
  p.thick(100, 202, 102, 240, 4, C.navy);
  // I-5, the West Seattle Bridge, and Aurora (99)
  for (const [a, b] of [[[142, 0], [142, 72]], [[142, 72], [132, 124]], [[132, 124], [138, 160]], [[138, 160], [144, 240]]]) p.thick(a[0], a[1], b[0], b[1], 1, C.gold);
  p.thick(84, 212, 138, 210, 2, C.gold);
  for (const [a, b] of [[[112, 0], [110, 74]], [[110, 74], [108, 120]], [[108, 120], [120, 148]]]) p.thick(a[0], a[1], b[0], b[1], 1, C.sand);
  // downtown towers, the stadiums, and a ferry crossing Elliott Bay
  for (let i = 0; i < 6; i++) p.rect(120 + i * 3, 146 - (i % 3) * 3, 2, 6 + (i % 3) * 3, C.silver);
  p.ellipse(128, 176, 4, 3, C.silver); p.ellipse(126, 184, 4, 3, C.steel);
  p.rect(76, 140, 8, 3, C.white); p.rect(78, 138, 4, 2, C.white); for (let i = 0; i < 12; i += 2) p.px(86 + i, 142 + (i >> 2), C.cyan);
  p.outline(C.ink);
  p.toTexture(scene, 'seattleMap');

  // one little icon per neighborhood, drawn inside its pin
  const icon = (key, fn) => { const q = new PX(14, 14); fn(q); q.toTexture(scene, key); };
  icon('pin_ballard', q => { q.poly([[1, 8], [13, 8], [11, 12], [3, 12]], C.red); q.rect(6, 2, 1, 6, C.white); q.poly([[7, 2], [11, 7], [7, 7]], C.white); q.hline(0, 12, 14, C.blue); });            // fishing boat
  icon('pin_fremont', q => { q.blob(7, 8, 6, 5, [C.steel, C.silver, C.white]); q.px(5, 7, C.ink); q.px(9, 7, C.ink); q.rect(9, 10, 5, 3, C.blue); q.hline(3, 5, 8, C.steel); });              // the Troll (and his VW)
  icon('pin_capitol', q => { [C.red, C.flame, C.yellow, C.lime, C.blue, C.plum].forEach((c, i) => q.rect(1, 1 + i * 2, 12, 2, c)); });                                                        // rainbow crosswalk
  icon('pin_westseattle', q => { q.rect(0, 5, 14, 2, C.silver); for (const x of [2, 7, 12]) q.rect(x - 1, 7, 2, 6, C.steel); q.hline(0, 12, 14, C.blue); });                                // West Seattle Bridge
  icon('pin_queenanne', q => { q.rect(6, 5, 2, 9, C.silver); q.ellipse(7, 4, 5, 2, C.white); q.rect(6, 0, 2, 3, C.silver); q.line(3, 13, 6, 7, C.steel); q.line(10, 13, 8, 7, C.steel); });  // Space Needle
  icon('pin_alki', q => { q.rect(5, 4, 4, 9, C.white); q.rect(5, 7, 4, 2, C.red); q.rect(4, 2, 6, 2, C.ink); q.rect(6, 1, 2, 1, C.yellow); q.rect(1, 13, 12, 1, C.sand); });                 // Alki Point lighthouse
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
    const curD = JOBS[ORDER[Math.min(unlocked, ORDER.length - 1)]].district;
    // Northwest market share meter
    const share = Math.max(0, 100 - Math.round(unlocked / ORDER.length * 100));
    this.add.rectangle(W - 86, top + 6, 80, 16, hex(C.ink), 0.85).setOrigin(0).setStrokeStyle(1, hex(C.red));
    txt(this, W - 83, top + 8, `NW TURF ${share}%`, { color: C.red });
    this.add.rectangle(W - 83, top + 17, 74, 2, hex(C.storm)).setOrigin(0); this.add.rectangle(W - 83, top + 17, 74 * share / 100, 2, hex(C.red)).setOrigin(0);
    // nodes
    NODES.forEach(([x, y], d) => {
      const js = districtJobs(d); const done = js.every(i => progress.isDone(i)), open = progress.isOpen(js[0]);
      const col = done ? C.lime : open ? C.gold : C.red;
      const ring = this.add.circle(x, top + y, 10, hex(C.ink)).setStrokeStyle(2, hex(col));
      this.add.image(x, top + y, PIN_ICONS[d]).setAlpha(open ? 1 : 0.35);
      if (done) this.add.image(x + 8, top + y - 8, 'iStar'); else if (!open) this.add.image(x + 8, top + y - 8, 'iLock');
      txt(this, x + (d === 5 ? 12 : 0), top + y + 12, d === 5 ? 'ALKI' : DISTRICTS[d].name, { ox: 0.5, color: col });
      if (d === curD && !done) this.tweens.add({ targets: ring, scale: 1.5, alpha: 0.3, yoyo: true, repeat: -1, duration: 500 });
      ring.setInteractive({ useHandCursor: true }).on('pointerup', () => { if (open) { audio.sfx('select'); this.showDistrict(d); } else audio.sfx('wrong'); });
    });
    this.listY = top + 244;
    this.list = this.add.container(0, 0);
    this.showDistrict(curD);
    const kb = this.input.keyboard; this.curD = curD;
    kb.on('keydown-ENTER', () => { if (this.enterJob != null) this.play(this.enterJob); });
    kb.on('keydown-SPACE', () => { if (this.enterJob != null) this.play(this.enterJob); });
    const step = d => { const n = DORDER[DORDER.indexOf(this.curD) + d]; if (n != null && progress.isOpen(districtJobs(n)[0])) { this.curD = n; audio.sfx('select'); this.showDistrict(n); } };
    kb.on('keydown-LEFT', () => step(-1)); kb.on('keydown-RIGHT', () => step(1)); kb.on('keydown-UP', () => step(-1)); kb.on('keydown-DOWN', () => step(1));
    kb.on('keydown-ESC', () => wipeTo(this, 'Title'));
  }
  showDistrict(d) {
    this.list.removeAll(true);
    const y0 = this.listY, D = DISTRICTS[d];
    this.list.add(panel(this, 4, y0, W - 8, H - y0 - 4));
    this.list.add(txt(this, 12, y0 + 7, `${DORDER.indexOf(d) + 1}. ${D.name}`, { size: 2, color: C.gold }));
    this.list.add(txt(this, 12, y0 + 24, D.tag, { color: C.silver, maxW: W - 24 }));
    const rowH = Math.min(46, Math.floor((H - y0 - 80) / 3));
    let firstOpen = null;
    const js = districtJobs(d);
    for (let k = 0; k < js.length; k++) {
      const i = js[k], job = JOBS[i]; const y = y0 + 40 + k * (rowH + 3);
      const open = progress.isOpen(i), done = progress.isDone(i);
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
  play(i) { audio.sfx('go'); goToJob(this, i); } // district intro first when the job opens a new district
}
