import Phaser from 'phaser';
import { W, H, txt, setTxt, button, wipeTo, wipeIn, panel, isTouch } from '../core/ui.js';
import { audio } from '../core/audio.js';
import { progress, store } from '../core/save.js';
import { C, hex } from '../core/palette.js';
import { HEROES, ORDER } from '../data/content.js';
import { portrait } from '../art/people.js';
import { shareCard } from '../core/share.js';
import { makeScoreCard, CARD_W, CARD_H, CARD_TAUNT } from '../core/scorecard.js';

// Leaderboard. Anyone can post their running total (best score per job, added up); beating the game
// earns a crown. Arcade-style three-letter initials. Scores live in Firestore via /api/scores.
const fmt = n => n.toLocaleString('en-US');
// A random id for this device, so each player keeps one row that replays can improve.
const playerId = () => { let id = store.get('playerId', null); if (!id) { id = Array.from(crypto.getRandomValues(new Uint8Array(12)), b => (b % 36).toString(36)).join(''); store.set('playerId', id); } return id; };
const A = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';

export class Scores extends Phaser.Scene {
  constructor() { super('Scores'); }
  init({ enter = false, from = 'Title' } = {}) { this.enterMode = enter; this.from = from; this.mine = null; this.busy = false; this.slot = 0; this.myRank = null; this.myScore = 0; this.cardView = null; this.cardBtns = null; }
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
    // post + share side by side (share only once there's a score to brag about)
    const pw = total > 0 ? 124 : 210, px = total > 0 ? W / 2 - 38 : W / 2;
    this.postBtn = button(this, px, yy + 46, pw, 22, total <= 0 ? 'FINISH A JOB TO GET ON THE BOARD' : canPost ? 'POST MY SCORE' : 'POSTED!', () => this.openEntry(), { color: canPost ? 'btnGold' : 'btnGrey', textColor: canPost ? C.ink : C.white });
    this.postBtn.setEnabled(canPost);
    if (total > 0) button(this, W / 2 + 70, yy + 46, 70, 22, isTouch ? 'SHARE' : 'SHARE [S]', () => this.openCard(), { color: 'btnBlue', textColor: C.white, key: 'S' });
    button(this, W / 2, H - 22, 150, 26, isTouch ? '< BACK' : '< BACK [ESC]', () => this.leave(), { color: 'btnGrey', textColor: C.white, key: ['ESC'] });
    this.fetchTop();
    if (this.enterMode && canPost) this.time.delayedCall(350, () => this.openEntry());
  }
  // The share text: your rank if you're on the board, otherwise your running total.
  brag() {
    const total = progress.totalScore(), cleared = progress.jobsCleared(), jobs = `${cleared}/${ORDER.length} jobs`;
    if (this.myRank) return `I'm #${this.myRank} on the Plumber Wars leaderboard with ${fmt(this.myScore)} points (${jobs})${this.myRank === 1 ? ' and I am THE CHAMP' : ''}. Think you can beat the homies?`;
    return `I've racked up ${fmt(total)} points in Plumber Wars (${jobs}). Think you can beat the homies?`;
  }
  // Score card preview: the picture that gets shared, Randy's dare, and the share button.
  openCard() {
    if (this.cardView || this.entry) return;
    const total = progress.totalScore();
    const canvas = makeScoreCard(this, { initials: store.get('initials', 'YOU'), score: this.myRank ? this.myScore : total, rank: this.myRank, cleared: progress.jobsCleared(), hero: progress.hero });
    if (this.textures.exists('scorecard')) this.textures.remove('scorecard');
    this.textures.addCanvas('scorecard', canvas);
    const c = this.cardView = this.add.container(0, 0).setDepth(200);
    c.add(this.add.rectangle(0, 0, W, H, hex(C.ink), 0.94).setOrigin(0).setInteractive());
    const k = Math.min((W - 24) / CARD_W, (H - 96) / CARD_H);
    const img = this.add.image(W / 2, 12, 'scorecard').setOrigin(0.5, 0).setScale(k * 0.9); c.add(img);
    this.tweens.add({ targets: img, scale: k, duration: 220, ease: 'Back.out' });
    audio.say(CARD_TAUNT);
    const by = 12 + CARD_H * k + 24;
    this.cardBtns = [
      button(this, W / 2 + 46, by, 120, 26, isTouch ? 'SEND IT >' : 'SAVE + COPY LINK', () => shareCard(this, canvas, this.brag()), { color: 'btnGold', depth: 201 }),
      button(this, W / 2 - 70, by, 80, 26, 'CLOSE', () => this.closeCard(), { color: 'btnGrey', textColor: C.white, depth: 201 }),
    ];
  }
  closeCard() {
    if (!this.cardView) return;
    this.cardBtns.forEach(b => b.destroy()); this.cardBtns = null;
    this.cardView.destroy(); this.cardView = null;
  }
  leave() {
    if (this.cardView) return this.closeCard();
    if (this.entry) return this.closeEntry(); audio.sfx('select'); wipeTo(this, this.from); }

  async fetchTop() {
    try { const r = await fetch('/api/scores?me=' + encodeURIComponent(playerId())); if (!r.ok) throw new Error(r.status); this.show((await r.json()).top); }
    catch (e) { if (this.status.active) setTxt(this.status, 'LEADERBOARD OFFLINE. TRY AGAIN LATER.'); }
  }
  show(top) {
    if (!this.list.active) return;
    // find my row (by the initials + score I last posted) so SHARE can brag about my rank
    // my row: flagged by the server (by this device's player id), or matched by what I last posted here
    const mine = this.mine || { initials: store.get('initials', ''), score: store.get('postedScore', 0) };
    const at = top.findIndex(e => e.you || (e.initials === mine.initials && e.score === mine.score));
    if (at >= 0) { this.myRank = at + 1; this.myScore = top[at].score; top[at].you = true; }
    this.tweens.killTweensOf(this.list.list); if (this.champFx) { this.champFx.remove(); this.champFx = null; } if (this.glowTween) { this.glowTween.remove(); this.glowTween = null; }
    this.list.removeAll(true);
    setTxt(this.status, top.length ? '' : 'NOBODY YET. BE THE FIRST!');
    const isMe = e => !!e.you;
    let y0 = 72;
    if (top.length) y0 = this.champCard(top[0], isMe(top[0])) + 8;
    const rest = top.slice(1), rowH = Math.min(20, Math.floor((H - 140 - y0) / Math.max(1, rest.length)));
    rest.forEach((e, k) => {
      const i = k + 1, y = y0 + k * rowH;
      if (isMe(e)) this.list.add(this.add.rectangle(8, y - 2, W - 16, rowH - 2, hex(C.forest)).setOrigin(0));
      const col = i < 3 ? C.yellow : C.white;
      this.list.add(txt(this, 26, y + 2, `${i + 1}.`, { ox: 1, color: col }));
      const h = HEROES.find(x => x.id === e.hero);
      if (h) this.list.add(this.add.image(40, y + 6, portrait(this, h.id, h.look, 'happy')).setScale(0.3));
      this.list.add(txt(this, 54, y, e.initials, { size: 2, color: col }));
      if (isMe(e)) this.youBadge(96, y + 1);
      const beat = e.cleared >= ORDER.length;
      this.list.add(txt(this, isMe(e) ? 130 : 106, y + 3, beat ? 'BEAT IT' : `${e.cleared || 0}/${ORDER.length} JOBS`, { color: beat ? C.silver : C.slate }));
      this.list.add(txt(this, W - 16, y + 2, fmt(e.score), { ox: 1, color: col }));
    });
  }
  // a little 'YOU' chip so players can spot their own row
  youBadge(x, y, label = 'YOU') {
    const w = label.length * 6 + 8;
    const chip = this.add.rectangle(x, y, w, 12, hex(C.red)).setOrigin(0).setStrokeStyle(1, hex(C.white));
    this.list.add(chip); this.list.add(txt(this, x + w / 2, y + 2, label, { ox: 0.5, color: C.white, outline: false }));
    this.tweens.add({ targets: chip, alpha: 0.55, yoyo: true, repeat: -1, duration: 600 });
  }
  // #1 gets the showpiece: a color-cycling card, a crown, sparkles, and the homies cheering them on.
  champCard(e, me) {
    const x0 = 8, y0 = 72, w = W - 16, hgt = 78, L = this.list;
    const card = this.add.rectangle(x0, y0, w, hgt, hex(me ? C.forest : C.night)).setOrigin(0).setStrokeStyle(3, hex(C.gold));
    L.add(card);
    const glow = { t: 0 };
    this.glowTween = this.tweens.add({ targets: glow, t: 1, duration: 2400, repeat: -1, onUpdate: () => { if (card.active) card.setStrokeStyle(3, Phaser.Display.Color.HSVToRGB(glow.t, 0.75, 1).color); } });
    // crown + title
    const crown = this.add.graphics(); crown.fillStyle(hex(C.gold)).fillRect(-9, 2, 18, 5).fillTriangle(-9, 2, -9, -6, -4, 2).fillTriangle(-3, 2, 0, -8, 3, 2).fillTriangle(4, 2, 9, -6, 9, 2);
    crown.fillStyle(hex(C.red)).fillRect(-1, 3, 2, 2); crown.setPosition(x0 + 20, y0 + 16); L.add(crown);
    this.tweens.add({ targets: crown, angle: { from: -8, to: 8 }, yoyo: true, repeat: -1, duration: 700, ease: 'Sine.inOut' });
    L.add(txt(this, x0 + 34, y0 + 8, 'THE CHAMP', { color: C.gold }));
    L.add(txt(this, x0 + 14, y0 + 26, e.initials, { size: 3, color: C.white }));
    if (me) this.youBadge(x0 + 34 + 60, y0 + 7, "THAT'S YOU!");
    L.add(txt(this, x0 + w - 10, y0 + 10, fmt(e.score), { ox: 1, size: 2, color: C.gold }));
    const lead = HEROES.find(h => h.id === e.hero);
    L.add(txt(this, x0 + w - 10, y0 + 30, (lead ? 'LED BY ' + lead.name + ' - ' : '') + `${e.cleared || 0}/${ORDER.length} JOBS`, { ox: 1, color: C.silver }));
    // the homies rally around the champ
    HEROES.forEach((h, k) => {
      const px = x0 + w - 76 + k * 28, py = y0 + hgt - 14;
      const p = this.add.image(px, py, portrait(this, h.id, h.look, 'happy')).setScale(0.42);
      L.add(p);
      this.tweens.add({ targets: p, y: py - 4, yoyo: true, repeat: -1, duration: 260 + k * 70, ease: 'Sine.inOut', delay: k * 90 });
    });
    L.add(txt(this, x0 + 14, y0 + hgt - 14, 'THE HOMIES SALUTE YOU', { color: C.lime }));
    // sparkles drifting up out of the card
    const cols = [C.gold, C.yellow, C.lime, C.cyan, C.pink];
    this.champFx = this.time.addEvent({ delay: 220, loop: true, callback: () => {
      if (!L.active) return;
      const sx = x0 + 6 + Math.random() * (w - 12), sy = y0 + hgt - 4;
      const sp = this.add.rectangle(sx, sy, 2, 2, hex(cols[(Math.random() * cols.length) | 0])); L.add(sp);
      this.tweens.add({ targets: sp, y: sy - 30 - Math.random() * 30, alpha: 0, duration: 900, onComplete: () => sp.destroy() });
    } });
    return y0 + hgt;
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
      this.myRank = j.rank; this.myScore = progress.totalScore();
      this.postBtn.setEnabled(false); setTxt(this.postBtn.label, `YOU'RE #${j.rank}!`);
    } catch (e) {
      if (this.hint.active) setTxt(this.hint, String(e.message || 'OFFLINE').toUpperCase().slice(0, 36));
      audio.sfx('wrong');
    }
    this.busy = false;
  }
}
