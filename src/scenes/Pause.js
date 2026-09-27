import Phaser from 'phaser';
import { W, H, txt, button, hitZone } from '../core/ui.js';
import { audio } from '../core/audio.js';
import { C, hex } from '../core/palette.js';

export class Pause extends Phaser.Scene {
  constructor() { super('Pause'); }
  create({ from, job }) {
    this.add.rectangle(0, 0, W, H, hex(C.ink), 0.82).setOrigin(0).setInteractive();
    this.add.image(W / 2, H * 0.24, 'badgeBig');
    txt(this, W / 2, H * 0.34, 'PAUSED', { ox: 0.5, size: 3, color: C.gold });
    txt(this, W / 2, H * 0.34 + 28, 'COFFEE BREAK. UNION RULES.', { ox: 0.5, color: C.silver });
    const back = () => { const s = this.scene.get(from); this.scene.stop(); this.scene.resume(from); s.resumeFromPause && s.resumeFromPause(); };
    button(this, W / 2, H * 0.5, 160, 30, 'RESUME', back, { color: 'btnGreen', textColor: C.white, key: 'ENTER' });
    button(this, W / 2, H * 0.5 + 40, 160, 24, 'RESTART JOB', () => { this.scene.stop(from); this.scene.stop(); this.scene.start('Brief', { job }); }, { color: 'btnGold' });
    button(this, W / 2, H * 0.5 + 72, 160, 24, 'QUIT TO MAP', () => { audio.stopMusic(); audio.engineOff(); this.scene.stop(from); this.scene.start('Map'); }, { color: 'btnGrey', textColor: C.white });
    const snd = button(this, W / 2 - 42, H * 0.5 + 112, 78, 26, audio.enabled ? 'SOUND ON' : 'SOUND OFF', () => { audio.setSound(!audio.enabled); snd.label.setText(audio.enabled ? 'SOUND ON' : 'SOUND OFF'); }, { color: 'btnGrey', textColor: C.white, key: 'M' });
    const vo = button(this, W / 2 + 42, H * 0.5 + 112, 78, 26, audio.voices ? 'VOICES ON' : 'VOICES OFF', () => { audio.setVoices(!audio.voices); vo.label.setText(audio.voices ? 'VOICES ON' : 'VOICES OFF'); }, { color: 'btnGrey', textColor: C.white, key: 'V' });
    this.input.keyboard.once('keydown-ESC', back);
  }
}
