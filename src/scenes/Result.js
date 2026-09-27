import Phaser from 'phaser';
import { W, H, txt, button, wipeTo, wipeIn, panel, stars as drawStars, banner, bubble } from '../core/ui.js';
import { audio } from '../core/audio.js';
import { progress } from '../core/save.js';
import { C, hex } from '../core/palette.js';
import { HEROES, RIVALS, DISTRICTS, TRASH, pick } from '../data/content.js';
import { JOBS } from '../data/jobs.js';
import { portrait } from '../art/people.js';
import { skyTex } from './Arrival.js';
import { houseTextures } from '../art/houses.js';

const REVIEWS = [
  'SHOWED UP BEFORE NORTHWEST, FIXED IT, DIDN\'T JUDGE MY BATHROOM. 10/10.',
  'THESE GUYS ARE LEGENDS. ALSO THEY SWEAR A LOT. LOVED IT.',
  'EXPLAINED EVERYTHING. NOW I KNOW WHAT A P-TRAP IS. I CANNOT UNKNOW IT.',
  'THE HOMIES ARE, IN FACT, THE HOMIES. TRUST.',
  'FAST, FAIR, AND THEY WIPED THEIR BOOTS. MARRY ME, G\'S.',
  'NORTHWEST SHOWED UP AFTER AND I TURNED THE HOSE ON THEM. THANK YOU G\'S!',
  'WOULD CLOG AGAIN.',
];

export class Result extends Phaser.Scene {
  constructor() { super('Result'); }
  create({ job: ji = 0, ok, stars = 0, score = 0, secsLeft = 0, mistakes = 0 }) {
    wipeIn(this);
    const job = JOBS[ji], D = DISTRICTS[job.district], hero = HEROES.find(h => h.id === progress.hero) || HEROES[0];
    this.add.image(0, 0, skyTex(this, job.district)).setOrigin(0);
    this.add.image(W / 2, H * 0.42, houseTextures(this, job, D.time === 'night')).setOrigin(0.5, 1).setAlpha(0.9);
    this.add.rectangle(0, H * 0.42, W, H, hex(C.ink), 0.9).setOrigin(0);
    if (ok) this.win(ji, job, D, hero, stars, score, secsLeft, mistakes); else this.lose(ji, job, hero);
  }
  win(ji, job, D, hero, stars, score, secsLeft, mistakes) {
    const first = ji === progress.unlocked;
    progress.complete(ji, stars); const best = progress.setBest(ji, score);
    txt(this, W / 2, 20, 'JOB DONE!', { ox: 0.5, size: 3, color: C.lime });
    txt(this, W / 2, 44, job.title + ' - ' + job.who, { ox: 0.5, color: C.white });
    const st = drawStars(this, W / 2, 70, stars, 3, 2.5);
    st.forEach((s, i) => { s.setScale(0); this.tweens.add({ targets: s, scale: 2.5, delay: 300 + i * 250, duration: 250, ease: 'Back.out', onStart: () => i < stars && audio.sfx('star') }); });
    // review card
    const cy = H * 0.42 + 8;
    panel(this, 10, cy, W - 20, 104, 'panelLight');
    this.add.image(40, cy + 34, portrait(this, 'job' + ji, job.look, 'happy'));
    txt(this, 72, cy + 8, job.who, { outline: false, color: C.ink });
    for (let i = 0; i < 5; i++) this.add.image(76 + i * 10, cy + 22, 'iStar');
    txt(this, 72, cy + 32, '"' + pick(REVIEWS) + '"', { outline: false, color: C.storm, maxW: W - 92 });
    const rows = [['TIME LEFT', secsLeft + ' SEC'], ['MISTAKES', mistakes], ['SCORE', score + (best ? '  NEW BEST!' : '')]];
    rows.forEach(([k, v], i) => { txt(this, 20, cy + 114 + i * 12, k, { color: C.silver }); txt(this, W - 20, cy + 114 + i * 12, String(v), { color: i === 2 && best ? C.gold : C.white, ox: 1 }); });
    // district conquered?
    const districtDone = (ji + 1) % 3 === 0 && first;
    if (districtDone) {
      this.time.delayedCall(900, () => {
        banner(this, `${D.name}`, { color: C.gold, size: 2, y: H * 0.3, dur: 2600, sub: "IS NOW G'S COUNTRY!" });
        audio.sfx('star'); audio.say(pick(TRASH.lose), { pitch: 0.5 });
      });
    }
    const last = ji === 14, bonus = ji === 15;
    const by = H - 70;
    if (last) button(this, W / 2, by, 190, 30, 'FINALE!', () => wipeTo(this, 'Finale'), { color: 'btnGold', key: 'ENTER' });
    else if (bonus) button(this, W / 2, by, 190, 30, 'BACK TO DISPATCH', () => wipeTo(this, 'Map'), { color: 'btnGreen', textColor: C.white, key: 'ENTER' });
    else button(this, W / 2, by, 190, 30, 'NEXT CALL >>', () => wipeTo(this, 'Brief', { job: ji + 1 }), { color: 'btnGreen', textColor: C.white, key: 'ENTER' });
    button(this, W / 2 - 50, by + 38, 90, 26, 'MAP', () => wipeTo(this, 'Map'), { color: 'btnGrey', textColor: C.white, key: 'M' });
    button(this, W / 2 + 50, by + 38, 90, 26, 'REPLAY', () => wipeTo(this, 'Brief', { job: ji }), { color: 'btnGrey', textColor: C.white, key: 'R' });
    this.time.delayedCall(700, () => bubble(this, W / 2, 110, pick(hero.barks), { dur: 1800, color: C.forest }));
  }
  lose(ji, job, hero) {
    txt(this, W / 2, 20, "YOU'RE FIRED!", { ox: 0.5, size: 3, color: C.red });
    txt(this, W / 2, 44, job.who + ' CALLED NORTHWEST.', { ox: 0.5, color: C.white });
    const cy = H * 0.42 + 8;
    this.add.image(W / 2 - 60, cy + 40, portrait(this, 'job' + ji, job.look, 'yell')).setScale(1.2);
    this.add.image(W / 2 + 60, cy + 40, portrait(this, 'randy', RIVALS.randy.look, 'smug')).setScale(1.2);
    const line = pick(TRASH.win);
    txt(this, W / 2, cy + 82, '"' + line + '"', { ox: 0.5, maxW: W - 30, color: C.pink, align: 1 });
    this.time.delayedCall(300, () => audio.say(line, { pitch: 0.5 }));
    txt(this, W / 2, cy + 120, 'TIP: WRONG TOOLS AND WRONG STEPS EAT THE CLOCK. USE YOUR HOMIES!', { ox: 0.5, maxW: W - 30, color: C.silver, align: 1 });
    const by = H - 84;
    button(this, W / 2, by, 190, 30, 'RETRY REPAIR', () => wipeTo(this, 'Arrival', { job: ji }), { color: 'btnGreen', textColor: C.white, key: 'ENTER' });
    button(this, W / 2, by + 36, 190, 26, 'RETRY FROM THE RACE', () => wipeTo(this, 'Brief', { job: ji }), { color: 'btnGold', key: 'R' });
    button(this, W / 2, by + 68, 190, 24, 'MAP', () => wipeTo(this, 'Map'), { color: 'btnGrey', textColor: C.white, key: 'M' });
  }
}
