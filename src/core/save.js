import { ORDER } from '../data/content.js';
// Local persistence that never throws (private mode / blocked storage just means no saving).
const KEY = 'plumber-wars-v2';
let mem = {};
function load() { try { const raw = localStorage.getItem(KEY); if (raw) { const v = JSON.parse(raw); if (v && typeof v === 'object') mem = v; } } catch (e) { mem = {}; } }
function persist() { try { localStorage.setItem(KEY, JSON.stringify(mem)); } catch (e) { /* storage unavailable */ } }
load();

export const store = {
  get(k, d) { return k in mem ? mem[k] : d; },
  set(k, v) { mem[k] = v; persist(); },
};

// Campaign progress: which job is unlocked, stars earned per job, chosen hero.
// A finished job is always worth something, even a rough one (a score <= 0 used to go unrecorded, so the
// leaderboard counted that job as not cleared while the game counted it as done).
export const MIN_JOB_SCORE = 100;

export const progress = {
  get hero() { return store.get('hero', null); },
  set hero(v) { store.set('hero', v); },
  // How many campaign jobs are cleared, counted along ORDER (Alki sits between West Seattle and Queen Anne).
  // Older saves counted job indexes with Alki optional; they carry over, but Alki must be cleared first.
  get unlocked() {
    let u = store.get('cleared', null);
    if (u == null) { const old = store.get('unlocked', 0); u = Number.isInteger(old) && old >= 0 && old <= 15 ? old : 0; if (u > 12 && !this.stars(15)) u = 12; else if (u > 12) u++; while (u < ORDER.length && this.stars(ORDER[u]) > 0) u++; store.set('cleared', u); }
    return Number.isInteger(u) && u >= 0 && u <= ORDER.length ? u : 0;
  },
  isOpen(i) { return ORDER.indexOf(i) <= this.unlocked; },
  isDone(i) { return this.stars(i) > 0; },
  stars(i) { return (store.get('stars', {}))[i] || 0; },
  totalStars() { return Object.values(store.get('stars', {})).reduce((a, b) => a + b, 0); },
  complete(i, stars) {
    const s = { ...store.get('stars', {}) }; s[i] = Math.max(s[i] || 0, stars); store.set('stars', s);
    let u = this.unlocked;
    if (ORDER.indexOf(i) === u) { u++; while (u < ORDER.length && this.stars(ORDER[u]) > 0) u++; store.set('cleared', u); } // skip jobs an old save already starred
  },
  best(i) { return (store.get('best', {}))[i] || 0; },
  // Leaderboard total: your best score on every job, added up (replay a job to raise it).
  bests() { return ORDER.map((_, i) => Math.max(this.best(i), this.stars(i) > 0 ? MIN_JOB_SCORE : 0)); }, // starred = cleared
  totalScore() { return this.bests().reduce((a, b) => a + b, 0); },
  jobsCleared() { return this.bests().filter(n => n > 0).length; },
  setBest(i, score) { const b = { ...store.get('best', {}) }; if (score > (b[i] || 0)) { b[i] = score; store.set('best', b); return true; } return false; },
  reset() { store.set('cleared', 0); store.set('unlocked', 0); store.set('stars', {}); store.set('best', {}); store.set('hero', null); },
};
