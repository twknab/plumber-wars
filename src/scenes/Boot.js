import Phaser from 'phaser';
import { buildFonts } from '../core/font.js';
import { buildDriveSprites, buildUI } from '../art/sprites.js';
import { buildToolIcons } from '../art/tools.js';
import { buildBrand } from '../art/brand.js';

export class Boot extends Phaser.Scene {
  constructor() { super('Boot'); }
  preload() {
    // Optional real-crew art (public/crew). Missing files just fall back to generated pixel art.
    this.load.json('crewManifest', 'crew/manifest.json');
    this.load.once('filecomplete-json-crewManifest', (k, t, data) => {
      for (const [id, spec] of Object.entries(data || {})) {
        if (!spec || typeof spec !== 'object') continue;
        for (const mood of spec.portraits || []) this.load.image(`photo_${id}_${mood}`, `crew/${id}_${mood}.png`);
        if (spec.body) this.load.spritesheet(`photo_body_${id}`, `crew/${id}_body.png`, { frameWidth: 16, frameHeight: 30 });
      }
    });
  }
  create() {
    buildFonts(this);
    buildUI(this);
    buildDriveSprites(this);
    buildToolIcons(this);
    buildBrand(this);
    const q = new URLSearchParams(location.search);
    const start = q.get('scene') || 'Title';
    const data = Object.fromEntries(q); if (data.job) data.job = +data.job;
    this.scene.start(this.scene.get(start) ? start : 'Title', data);
  }
}
