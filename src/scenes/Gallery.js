import Phaser from 'phaser';
import { txt, W, H } from '../core/ui.js';
import { portrait, body } from '../art/people.js';
import { HEROES, RIVALS } from '../data/content.js';
import { JOBS, TOOL_INFO } from '../data/jobs.js';
import { houseTextures } from '../art/houses.js';
import { buildFixture } from '../art/fixtures.js';

// Dev-only sprite sheet viewer: ?scene=Gallery&page=0
export class Gallery extends Phaser.Scene {
  constructor() { super('Gallery'); }
  create(data) {
    const page = +(data.page || 0);
    this.cameras.main.setBackgroundColor('#5a6988');
    if (page === 0) {
      const keys = ['van', 'truck', 'car0', 'car1', 'car2', 'car3', 'car4', 'car5', 'car6', 'wagon', 'bus', 'cyclist', 'scooter', 'raccoon', 'pothole', 'puddle', 'oil', 'cone', 'barrier', 'manhole', 'turd', 'tp', 'plungerJunk', 'wrenchJunk', 'coffee', 'kit', 'cash', 'fir0', 'fir1', 'maple', 'mapleFall', 'bush', 'lamp', 'hydrant', 'bench', 'roof0', 'roof1', 'roof3', 'espresso'];
      let x = 6, y = 6, rowH = 0;
      for (const k of keys) { const im = this.add.image(x, y, k, 0).setOrigin(0); if (x + im.width > W - 4) { x = 6; y += rowH + 4; rowH = 0; im.setPosition(x, y); } x += im.width + 4; rowH = Math.max(rowH, im.height); }
      y += rowH + 8;
      txt(this, 6, y, 'THE QUICK BROWN FOX: 0123456789 !?$#%&*~`', { maxW: 258 });
      txt(this, 6, y + 12, 'plain font sample - GS PLUMBING', { outline: false, color: '#fee761' });
      txt(this, 6, y + 24, 'BIG', { size: 3, color: '#feae34' });
    } else if (page === 1) {
      const all = [...HEROES.map(h => [h.id, h.look]), ...Object.entries(RIVALS).map(([k, r]) => [k, r.look]), ...JOBS.map((j, i) => ['job' + i, j.look])];
      all.forEach(([id, look], i) => { const x = 4 + (i % 5) * 53, y = 4 + Math.floor(i / 5) * 52; this.add.image(x, y, portrait(this, id, look, ['happy', 'angry', 'yell', 'worried', 'neutral', 'smug'][i % 6])).setOrigin(0); });
      all.slice(0, 12).forEach(([id, look], i) => this.add.image(6 + i * 20, H - 40, body(this, id, look), i % 2).setOrigin(0));
    } else if (page === 2) {
      Object.keys(TOOL_INFO).concat(['plugIn', 'pumpIn']).forEach((k, i) => { const x = 6 + (i % 6) * 44, y = 6 + Math.floor(i / 6) * 44; this.add.image(x, y, 'tool_' + k).setOrigin(0).setScale(2); });
    }
    else if (page >= 3 && page < 8) {
      const i0 = (page - 3) * 3;
      for (let k = 0; k < 3; k++) { const j = JOBS[i0 + k]; if (!j) continue; this.add.image(W / 2, 4 + k * 172, houseTextures(this, j, k === 2)).setOrigin(0.5, 0); txt(this, 4, 4 + k * 172, j.house.style); }
    }
    else if (page >= 8) {
      const list = [['toilet', 'clog'], ['toilet', 'tank'], ['toilet', 'base'], ['sink', 'kitchen'], ['sink', 'disposal'], ['sink', 'vanity'], ['shower'], ['basement', 'prv'], ['basement', 'main'], ['heater'], ['sump'], ['crawl'], ['yard'], ['bib']];
      const [n, v] = list[page - 8]; const f = buildFixture(this, n, v);
      this.add.image(0, 20, f.bg).setOrigin(0);
      for (const [k, pt] of Object.entries(f.parts)) { if (pt.hidden) continue; const im = this.add.image(pt.x, 20 + pt.y, pt.key).setOrigin(pt.ox, pt.oy).setDepth(pt.depth || 1); if (pt.angle) im.setAngle(pt.angle); if (pt.scaleY) im.setScale(1, pt.scaleY); }
      for (const [k, a] of Object.entries(f.anchors)) if (a.x) { this.add.circle(a.x, 20 + a.y, 2, 0xff0044).setDepth(20); txt(this, a.x + 3, 20 + a.y, k, { depth: 20 }); }
      txt(this, 4, 4, n + ' ' + (v || ''));
    }
    this.input.on('pointerup', () => this.scene.restart({ page: (page + 1) % 22 }));
  }
}
