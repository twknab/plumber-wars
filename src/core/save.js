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
export const progress = {
  get hero() { return store.get('hero', null); },
  set hero(v) { store.set('hero', v); },
  get unlocked() { const u = store.get('unlocked', 0); return Number.isInteger(u) && u >= 0 && u <= 15 ? u : 0; },
  stars(i) { return (store.get('stars', {}))[i] || 0; },
  totalStars() { return Object.values(store.get('stars', {})).reduce((a, b) => a + b, 0); },
  complete(i, stars) {
    const s = { ...store.get('stars', {}) }; s[i] = Math.max(s[i] || 0, stars); store.set('stars', s);
    if (i === this.unlocked && i < 15) store.set('unlocked', i + 1); // bonus job (15) never advances the campaign
  },
  best(i) { return (store.get('best', {}))[i] || 0; },
  setBest(i, score) { const b = { ...store.get('best', {}) }; if (score > (b[i] || 0)) { b[i] = score; store.set('best', b); return true; } return false; },
  reset() { store.set('unlocked', 0); store.set('stars', {}); store.set('best', {}); store.set('hero', null); },
};
