import Phaser from 'phaser';
import { W, H, txt, setTxt, button, wipeTo, wipeIn, panel, isTouch } from '../core/ui.js';
import { audio } from '../core/audio.js';
import { progress, store } from '../core/save.js';
import { C, hex } from '../core/palette.js';
import { HEROES, ORDER } from '../data/content.js';
import { portrait } from '../art/people.js';

// Leaderboard. Anyone can post their running total (best score per job, added up); beating the game
// earns a crown. Arcade-style three-letter initials. Scores live in Firestore via /api/scores.
const fmt = n => n.toLocaleString('en-US');
// A random id for this device, so each player keeps one row that replays can improve.
const playerId = () => { let id = store.get('playerId', null); if (!id) { id = Array.from(crypto.getRandomValues(new Uint8Array(12)), b => (b % 36).toString(36)).join(''); store.set('playerId', id); } return id; };
const A = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';

export class Scores extends Phaser.Scene {
  constructor() { super('Scores'); }
  init({ enter = false, from = 'Title' } = {}) { this.enterMode = enter; this.from = from; this.mine = null; this.busy = false; this.slot = 0; }
  create() {
    wipeIn(this);
    this.add.rectangle(0, 0, W, H, hex(C.ink)).setOrigin(0);
    for (let y = 0; y < H; y += 4) this.add.rectangle(0, y, W, 1, hex(C.night), 0.6).setOrigin(0);
    this.add.image(W / 2, 20, 'badge');
    txt(this, W / 2, 38, 'HIGH SCORES', { ox: 0.5, size: 2, color: C.gold });
    txt(this, W / 2, 58, 'TOTAL = YOUR BEST SCORE ON EVERY JOB, ADDED UP', { ox: 0.5, color: C.silver, maxW: W - 20, align: 1 });
    this.list = this.add.container(0, 0);
    this.status = txt(this, W / 2, 150, 'CALLING DISPATCH...', { ox: 0.5, color: C.silver });
    // your score
    const total = progress.totalScore(), cleared = progress.jobsCleared();
    const yy = H - 130;
    panel(this, 8, yy, W - 16, 64);
    txt(this, 18, yy + 9, 'YOUR TOTAL', { color: C.lime });
    txt(this, W - 18, yy + 7, fmt(total), { ox: 1, size: 2, color: C.white });
    txt(this, 18, yy + 22, `${cleared}/${ORDER.length} JOBS CLEARED` + (progress.isDone(14) ? '  ` GAME BEATEN' : ''), { color: C.silver });
    const canPost = total > 0 && total > store.get('postedScore', 0);
    this.postBtn = button(this, W / 2, yy + 46, 170, 22, total <= 0 ? 'FINISH A JOB TO GET ON THE BOARD' : canPost ? 'POST MY SCORE' : 'POSTED! BEAT IT TO POST AGAIN', () => this.openEntry(), { color: canPost ? 'btnGold' : 'btnGrey', textColor: canPost ? C.ink : C.white });
    this.postBtn.setEnabled(canPost);
    button(this, W / 2, H - 22, 150, 26, isTouch ? '< BACK' : '< BACK [ESC]', () => this.leave(), { color: 'btnGrey', textColor: C.white, key: ['ESC'] });
    this.fetchTop();
    if (this.enterMode && canPost) this.time.delayedCall(350, () => this.openEntry());
  }
  leave() { if (this.entry) return this.closeEntry(); audio.sfx('select'); wipeTo(this, this.from); }

  async fetchTop() {
    try { const r = await fetch('/api/scores'); if (!r.ok) throw new Error(r.status); this.show((await r.json()).top); }
    catch (e) { if (this.status.active) setTxt(this.status, 'LEADERBOARD OFFLINE. TRY AGAIN LATER.'); }
  }
  show(top) {
    if (!this.list.active) return;
    this.list.removeAll(true);
    setTxt(this.status, top.length ? '' : 'NOBODY YET. BE THE FIRST!');
    const y0 = 76, rowH = Math.min(20, Math.floor((H - 140 - y0) / 10));
    top.forEach((e, i) => {
      const y = y0 + i * rowH, me = this.mine && e.initials === this.mine.initials && e.score === this.mine.score;
      if (me) this.list.add(this.add.rectangle(8, y - 2, W - 16, rowH - 2, hex(C.forest)).setOrigin(0));
      const col = i === 0 ? C.gold : i < 3 ? C.yellow : C.white;
      this.list.add(txt(this, 26, y + 2, `${i + 1}.`, { ox: 1, color: col }));
      const h = HEROES.find(x => x.id === e.hero);
      if (h) this.list.add(this.add.image(40, y + 6, portrait(this, h.id, h.look, 'happy')).setScale(0.3));
      this.list.add(txt(this, 54, y, e.initials, { size: 2, color: col }));
      this.list.add(txt(this, 106, y + 3, e.cleared >= ORDER.length ? '` CHAMP' : `${e.cleared || 0}/${ORDER.length} JOBS`, { color: e.cleared >= ORDER.length ? C.gold : C.slate }));
      this.list.add(txt(this, W - 16, y + 2, fmt(e.score), { ox: 1, color: col }));
    });
  }

  // --- arcade initials --------------------------------------------------------------------------
  openEntry() {
    if (this.entry || this.busy) return;
    const last = store.get('initials', 'AAA');
    this.letters = last.split('').map(ch => Math.max(0, A.indexOf(ch))); this.slot = 0;
    const c = this.entry = this.add.container(0, 0).setDepth(150);
    c.add(this.add.rectangle(0, 0, W, H, hex(C.ink), 0.9).setOrigin(0).setInteractive());
    const py = H * 0.28;
    c.add(panel(this, 14, py, W - 28, 214));
    c.add(txt(this, W / 2, py + 12, 'ENTER YOUR INITIALS', { ox: 0.5, size: 2, color: C.gold }));
    c.add(txt(this, W / 2, py + 34, `TOTAL ${fmt(progress.totalScore())}`, { ox: 0.5, color: C.lime }));
    this.slots = [0, 1, 2].map(k => {
      const x = W / 2 + (k - 1) * 56, y = py + 104;
      const box = this.add.rectangle(x, y, 40, 44, hex(C.night)).setStrokeStyle(2, hex(C.storm));
      const t = txt(this, x, y, 'A', { ox: 0.5, oy: 0.5, size: 4, color: C.white });
      const up = button(this, x, y - 38, 40, 22, '+', () => this.bump(k, -1), { color: 'btnGrey', textColor: C.white, depth: 151, sound: 'blip' });
      const dn = button(this, x, y + 38, 40, 22, '-', () => this.bump(k, 1), { color: 'btnGrey', textColor: C.white, depth: 151, sound: 'blip' });
      box.setInteractive().on('pointerup', () => { this.slot = k; this.paint(); });
      c.add([box, t]); this.entryBtns = (this.entryBtns || []).concat([up, dn]);
      return { box, t };
    });
    this.hint = txt(this, W / 2, py + 160, isTouch ? 'TAP + / - TO PICK LETTERS' : 'TYPE, OR ARROWS + ENTER', { ox: 0.5, color: C.silver }); c.add(this.hint);
    this.entryBtns.push(button(this, W / 2 + 46, py + 190, 84, 24, 'SUBMIT', () => this.submit(), { color: 'btnGreen', textColor: C.white, depth: 151 }));
    this.entryBtns.push(button(this, W / 2 - 46, py + 190, 84, 24, 'CANCEL', () => this.closeEntry(), { color: 'btnGrey', textColor: C.white, depth: 151 }));
    this.keyFn = e => {
      if (!this.entry || this.busy) return;
      const k = e.key.toUpperCase();
      if (/^[A-Z]$/.test(k)) { this.letters[this.slot] = A.indexOf(k); this.slot = Math.min(2, this.slot + 1); audio.sfx('blip'); }
      else if (e.key === 'ArrowUp') this.bump(this.slot, -1);
      else if (e.key === 'ArrowDown') this.bump(this.slot, 1);
      else if (e.key === 'ArrowLeft' || e.key === 'Backspace') this.slot = Math.max(0, this.slot - 1);
      else if (e.key === 'ArrowRight') this.slot = Math.min(2, this.slot + 1);
      else if (e.key === 'Enter') return this.submit();
      this.paint();
    };
    this.input.keyboard.on('keydown', this.keyFn);
    this.paint();
  }
  bump(k, d) { this.slot = k; this.letters[k] = (this.letters[k] + d + 26) % 26; this.paint(); }
  paint() {
    this.slots.forEach((s, k) => { setTxt(s.t, A[this.letters[k]]); s.box.setStrokeStyle(2, hex(k === this.slot ? C.gold : C.storm)); });
  }
  closeEntry() {
    if (!this.entry) return;
    this.input.keyboard.off('keydown', this.keyFn);
    (this.entryBtns || []).forEach(b => b.destroy()); this.entryBtns = [];
    this.entry.destroy(); this.entry = null;
  }
  async submit() {
    if (this.busy) return; this.busy = true;
    const initials = this.letters.map(i => A[i]).join('');
    setTxt(this.hint, 'POSTING...');
    try {
      const r = await fetch('/api/scores', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ initials, hero: progress.hero, bests: progress.bests(), player: playerId() }) });
      const j = await r.json();
      if (!r.ok) throw new Error(j.error || r.status);
      store.set('initials', initials); store.set('postedScore', progress.totalScore());
      this.mine = { initials, score: progress.totalScore() };
      audio.sfx('star'); this.closeEntry(); this.show(j.top);
      this.postBtn.setEnabled(false); setTxt(this.postBtn.label, `YOU'RE #${j.rank}!`);
    } catch (e) {
      if (this.hint.active) setTxt(this.hint, String(e.message || 'OFFLINE').toUpperCase().slice(0, 36));
      audio.sfx('wrong');
    }
    this.busy = false;
  }
}
