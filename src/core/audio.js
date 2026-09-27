// Audio: procedural chiptune SFX, the engine drone, recorded voice clips, and the electronic
// soundtrack (see music.js).
import { store } from './save.js';
import { voiceKey } from './voicekey.js';
import { DJ } from './music.js';

const NOTE = { C: 0, 'C#': 1, D: 2, 'D#': 3, E: 4, F: 5, 'F#': 6, G: 7, 'G#': 8, A: 9, 'A#': 10, B: 11 };
const freq = n => { const m = /^([A-G]#?)(\d)$/.exec(n); return 440 * Math.pow(2, (NOTE[m[1]] + (+m[2] + 1) * 12 - 69) / 12); };

// Music lives in ./music.js (electronic tracks); this file keeps SFX, the engine drone and voices.

class Chip {
  constructor() {
    this.ctx = null; this.enabled = store.get('sound', true); this.voices = store.get('voicesOn', true); // new key: resets any old 'off' so voices start on
    this.track = null; this.timer = null; this.engine = null;
    this.clips = new Map(); this.raw = new Map();
    this.voiceReady = this.loadVoices();
  }
  unlock() {
    if (!this.ctx) {
      const AC = window.AudioContext || window.webkitAudioContext; if (!AC) return;
      this.ctx = new AC();
      this.master = this.ctx.createGain(); this.master.gain.value = this.enabled ? 0.55 : 0; this.master.connect(this.ctx.destination);
      this.musicBus = this.ctx.createGain(); this.musicBus.gain.value = 0.5; this.musicBus.connect(this.master);
      this.sfxBus = this.ctx.createGain(); this.sfxBus.gain.value = 0.8; this.sfxBus.connect(this.master);
      this.voiceBus = this.ctx.createGain(); this.voiceBus.gain.value = 1.6; this.voiceBus.connect(this.master);
      const len = this.ctx.sampleRate; const b = this.ctx.createBuffer(1, len, len); const d = b.getChannelData(0);
      for (let i = 0; i < len; i++) d[i] = Math.random() * 2 - 1; this.noise = b;
      this.pulse = {};
      for (const duty of [0.125, 0.25, 0.5]) {
        const n = 32, re = new Float32Array(n), im = new Float32Array(n);
        for (let k = 1; k < n; k++) im[k] = (2 / (k * Math.PI)) * Math.sin(k * Math.PI * duty) * 1;
        for (let k = 1; k < n; k++) { re[k] = im[k] * Math.sin(k * Math.PI * duty); im[k] = im[k] * Math.cos(k * Math.PI * duty); }
        this.pulse[duty] = this.ctx.createPeriodicWave(re, im);
      }
    }
    if (this.ctx.state === 'suspended') this.ctx.resume();
  }
  get now() { return this.ctx ? this.ctx.currentTime : 0; }
  setSound(on) { this.enabled = on; store.set('sound', on); if (this.master) this.master.gain.setTargetAtTime(on ? 0.55 : 0, this.now, 0.02); }
  setVoices(on) { this.voices = on; store.set('voicesOn', on); if (!on) this.hush(); }

  tone({ type = 'square', duty, f = 440, f2, t = 0, dur = 0.1, vol = 0.2, attack = 0.002, release = 0.05, bus, slide = 'exp' }) {
    if (!this.ctx) return;
    const at = this.now + t; const o = this.ctx.createOscillator(); const g = this.ctx.createGain();
    if (duty) o.setPeriodicWave(this.pulse[duty]); else o.type = type;
    o.frequency.setValueAtTime(f, at);
    if (f2) slide === 'exp' ? o.frequency.exponentialRampToValueAtTime(Math.max(1, f2), at + dur) : o.frequency.linearRampToValueAtTime(f2, at + dur);
    g.gain.setValueAtTime(0.0001, at); g.gain.exponentialRampToValueAtTime(vol, at + attack);
    g.gain.setValueAtTime(vol, at + Math.max(attack, dur - release)); g.gain.exponentialRampToValueAtTime(0.0001, at + dur);
    o.connect(g); g.connect(bus || this.sfxBus); o.start(at); o.stop(at + dur + 0.02);
  }
  hiss({ t = 0, dur = 0.1, vol = 0.2, filter = 'highpass', fq = 3000, fq2, q = 1, bus }) {
    if (!this.ctx) return;
    const at = this.now + t; const s = this.ctx.createBufferSource(); s.buffer = this.noise; s.loop = true;
    const fl = this.ctx.createBiquadFilter(); fl.type = filter; fl.frequency.setValueAtTime(fq, at); fl.Q.value = q;
    if (fq2) fl.frequency.exponentialRampToValueAtTime(fq2, at + dur);
    const g = this.ctx.createGain(); g.gain.setValueAtTime(vol, at); g.gain.exponentialRampToValueAtTime(0.0001, at + dur);
    s.connect(fl); fl.connect(g); g.connect(bus || this.sfxBus); s.start(at, Math.random()); s.stop(at + dur + 0.02);
  }

  // --- music (electronic soundtrack, see music.js) -----------------------------------------
  music(name) { if (!this.ctx) return; (this.dj = this.dj || new DJ(this)).play(name); }
  stopMusic() { if (this.dj) this.dj.stop(); }

  // --- engine ------------------------------------------------------------------------------
  engineOn() {
    if (!this.ctx || this.engine) return;
    const o = this.ctx.createOscillator(); o.type = 'sawtooth'; o.frequency.value = 40;
    const o2 = this.ctx.createOscillator(); o2.setPeriodicWave(this.pulse[0.25]); o2.frequency.value = 20;
    const f = this.ctx.createBiquadFilter(); f.type = 'lowpass'; f.frequency.value = 420;
    const g = this.ctx.createGain(); g.gain.value = 0.0001; g.gain.setTargetAtTime(0.09, this.now, 0.2);
    o.connect(f); o2.connect(f); f.connect(g); g.connect(this.sfxBus); o.start(); o2.start();
    this.engine = { o, o2, g, f };
  }
  engineSet(speed01) { if (!this.engine) return; const f = 38 + speed01 * 70; this.engine.o.frequency.setTargetAtTime(f, this.now, 0.08); this.engine.o2.frequency.setTargetAtTime(f / 2, this.now, 0.08); this.engine.f.frequency.setTargetAtTime(300 + speed01 * 700, this.now, 0.1); }
  engineOff() { if (!this.engine) return; const e = this.engine; e.g.gain.setTargetAtTime(0.0001, this.now, 0.1); setTimeout(() => { try { e.o.stop(); e.o2.stop(); } catch (x) { /* already */ } }, 400); this.engine = null; }

  // --- sfx ---------------------------------------------------------------------------------
  sfx(name, k = 1) {
    if (!this.ctx) return;
    const T = (o) => this.tone(o), N = (o) => this.hiss(o);
    switch (name) {
      case 'blip': T({ duty: 0.5, f: 880, dur: 0.04, vol: 0.12 }); break;
      case 'select': T({ duty: 0.25, f: 660, dur: 0.05, vol: 0.14 }); T({ duty: 0.25, f: 990, t: 0.05, dur: 0.08, vol: 0.14 }); break;
      case 'back': T({ duty: 0.25, f: 520, f2: 260, dur: 0.1, vol: 0.12 }); break;
      case 'coin': T({ duty: 0.5, f: 988, dur: 0.06, vol: 0.13 }); T({ duty: 0.5, f: 1319, t: 0.06, dur: 0.18, vol: 0.13 }); break;
      case 'boost': T({ type: 'sawtooth', f: 120, f2: 900, dur: 0.5, vol: 0.14 }); N({ dur: 0.6, vol: 0.12, filter: 'bandpass', fq: 600, fq2: 3000 }); break;
      case 'crash': N({ dur: 0.45, vol: 0.5, filter: 'lowpass', fq: 2400, fq2: 200 }); T({ type: 'square', f: 110, f2: 30, dur: 0.35, vol: 0.25 }); T({ duty: 0.125, f: 1600, f2: 400, dur: 0.12, vol: 0.08 }); break;
      case 'bump': N({ dur: 0.15, vol: 0.35, filter: 'lowpass', fq: 900, fq2: 150 }); T({ type: 'square', f: 90, f2: 40, dur: 0.12, vol: 0.2 }); break;
      case 'skid': N({ dur: 0.5, vol: 0.12, filter: 'bandpass', fq: 2600, q: 8 }); break;
      case 'splash': N({ dur: 0.35, vol: 0.25, filter: 'bandpass', fq: 1800, fq2: 500, q: 1.5 }); break;
      case 'honk': T({ duty: 0.5, f: 392, dur: 0.28, vol: 0.12 }); T({ duty: 0.5, f: 494, dur: 0.28, vol: 0.12 }); T({ duty: 0.5, f: 392, t: 0.32, dur: 0.22, vol: 0.12 }); T({ duty: 0.5, f: 494, t: 0.32, dur: 0.22, vol: 0.12 }); break;
      case 'nwhonk': T({ type: 'sawtooth', f: 180, dur: 0.5, vol: 0.12 }); T({ type: 'sawtooth', f: 190, dur: 0.5, vol: 0.12 }); break;
      case 'ding': T({ type: 'triangle', f: 1568, dur: 0.3, vol: 0.2 }); T({ type: 'sine', f: 3136, dur: 0.2, vol: 0.06 }); break;
      case 'step': T({ duty: 0.25, f: 784, dur: 0.07, vol: 0.14 }); T({ duty: 0.25, f: 1047, t: 0.07, dur: 0.07, vol: 0.14 }); T({ duty: 0.25, f: 1568, t: 0.14, dur: 0.16, vol: 0.14 }); break;
      case 'wrong': T({ duty: 0.5, f: 180, dur: 0.12, vol: 0.18 }); T({ duty: 0.5, f: 150, t: 0.13, dur: 0.22, vol: 0.18 }); break;
      case 'ratchet': N({ dur: 0.02, vol: 0.2 * k, filter: 'bandpass', fq: 3500, q: 3 }); T({ duty: 0.125, f: 2200, dur: 0.015, vol: 0.05 }); break;
      case 'plunge': T({ type: 'sine', f: 220, f2: 70, dur: 0.18, vol: 0.4 }); N({ dur: 0.15, vol: 0.12, filter: 'lowpass', fq: 600 }); break;
      case 'plop': T({ type: 'sine', f: 300, f2: 900, dur: 0.08, vol: 0.25 }); break;
      case 'drip': T({ type: 'sine', f: 1800, f2: 600, dur: 0.09, vol: 0.15 }); break;
      case 'flush': N({ dur: 1.6, vol: 0.3, filter: 'lowpass', fq: 1400, fq2: 200, q: 0.5 }); T({ type: 'sine', f: 140, f2: 60, dur: 1.2, vol: 0.12 }); break;
      case 'spray': N({ dur: 0.8, vol: 0.2, filter: 'highpass', fq: 2000 }); break;
      case 'scrub': N({ dur: 0.06, vol: 0.12 * k, filter: 'bandpass', fq: 1200 + Math.random() * 800, q: 2 }); break;
      case 'squelch': T({ type: 'sine', f: 120, f2: 260, dur: 0.12, vol: 0.3 }); N({ dur: 0.1, vol: 0.12, filter: 'lowpass', fq: 500 }); break;
      case 'click': T({ duty: 0.125, f: 1200, dur: 0.02, vol: 0.12 }); break;
      case 'buzz': T({ type: 'sawtooth', f: 60, dur: 0.3, vol: 0.15 }); break;
      case 'motor': T({ type: 'sawtooth', f: 50, f2: 120, dur: 0.6, vol: 0.14 }); N({ dur: 0.6, vol: 0.08, filter: 'bandpass', fq: 400 }); break;
      case 'crack': N({ dur: 0.18, vol: 0.45, fq: 1500 }); T({ duty: 0.125, f: 3000, f2: 200, dur: 0.15, vol: 0.12 }); break;
      case 'throw': T({ duty: 0.25, f: 400, f2: 1400, dur: 0.12, vol: 0.08 }); break;
      case 'fart': T({ type: 'sawtooth', f: 90, f2: 60, dur: 0.35, vol: 0.25 }); T({ duty: 0.125, f: 95, f2: 70, dur: 0.35, vol: 0.15 }); break;
      case 'go': T({ duty: 0.5, f: 523, dur: 0.12, vol: 0.14 }); T({ duty: 0.5, f: 1047, t: 0.12, dur: 0.3, vol: 0.16 }); break;
      case 'tick': T({ duty: 0.5, f: 1400, dur: 0.03, vol: 0.07 }); break;
      case 'alarm': T({ duty: 0.5, f: 880, dur: 0.1, vol: 0.1 }); T({ duty: 0.5, f: 660, t: 0.12, dur: 0.1, vol: 0.1 }); break;
      case 'star': T({ duty: 0.25, f: 1319, dur: 0.06, vol: 0.12 }); T({ duty: 0.25, f: 1760, t: 0.06, dur: 0.06, vol: 0.12 }); T({ duty: 0.25, f: 2637, t: 0.12, dur: 0.2, vol: 0.12 }); break;
      case 'grunt': T({ duty: 0.5, f: 110 + Math.random() * 40, f2: 70, dur: 0.12, vol: 0.14 }); break;
      default: T({ duty: 0.5, f: 440, dur: 0.05, vol: 0.1 });
    }
  }
  // Typewriter voice blip — each speaker has a base pitch.
  voice(pitch = 1) { if (!this.ctx) return; this.tone({ duty: 0.5, f: (160 + Math.random() * 60) * pitch, dur: 0.035, vol: 0.06 }); }

  // Speech synthesis "yelling". Falls back to grunts.
  // --- voices: pre-rendered Chirp 3 HD clips (public/voice), browser speech only as a fallback ---
  // Voice list + clip bytes download at page load; decoding waits for the AudioContext (first tap).
  loadVoices() {
    return fetch('/voice/manifest.json').then(r => (r.ok ? r.json() : {})).then(m => {
      this.voiceMan = m;
      const keys = Object.keys(m); let i = 0;
      const next = () => { if (i >= keys.length) return; const k = keys[i++]; this.bytes(k).finally(() => setTimeout(next, 30)); };
      for (let n = 0; n < 4; n++) next();
      return m;
    }).catch(() => (this.voiceMan = {}));
  }
  bytes(key) {
    if (!this.raw.has(key)) this.raw.set(key, fetch('/voice/' + this.voiceMan[key].f).then(r => r.arrayBuffer()).catch(() => null));
    return this.raw.get(key);
  }
  clip(key) {
    if (!this.clips.has(key)) this.clips.set(key, this.bytes(key).then(b => (b ? new Promise((ok, no) => this.ctx.decodeAudioData(b.slice(0), ok, no)) : null)).catch(() => null));
    return this.clips.get(key);
  }
  duck(on) { if (this.musicBus) this.musicBus.gain.setTargetAtTime(on ? 0.14 : 0.5, this.now, on ? 0.05 : 0.3); }
  // say(text) or say([line1, line2]) - plays the recorded clip for each line in order.
  say(text, opts = {}) {
    if (!this.enabled || !this.voices) { this.sfx('grunt'); return; }
    const lines = [].concat(text); const token = (this.sayToken = (this.sayToken || 0) + 1);
    this.hush(true);
    const playNext = async (i) => {
      if (i >= lines.length || token !== this.sayToken) { this.duck(false); return; }
      const key = voiceKey(lines[i]);
      if (!this.voiceMan) await this.voiceReady;
      if (token !== this.sayToken) return;
      if (this.ctx && this.voiceMan && this.voiceMan[key]) {
        const buf = await this.clip(key);
        if (token !== this.sayToken) return;
        if (buf) {
          const src = this.ctx.createBufferSource(); src.buffer = buf; src.connect(this.voiceBus);
          this.duck(true); src.onended = () => playNext(i + 1); src.start(); this.voiceSrc = src; return;
        }
      }
      this.speakFallback(lines[i], opts, () => playNext(i + 1));
    };
    playNext(0);
  }
  // No browser speech at all any more: it sounded like 1985 and was often silent on phones. A line with
  // no playable recording gets a grunt instead.
  speakFallback(text, opts, done) { this.sfx('grunt'); done && done(); }
  hush(keepToken) { if (!keepToken) this.sayToken = (this.sayToken || 0) + 1; if (this.voiceSrc) { try { this.voiceSrc.onended = null; this.voiceSrc.stop(); } catch (e) { /* done */ } this.voiceSrc = null; } if (window.speechSynthesis) speechSynthesis.cancel(); this.duck(false); }
}
export const audio = new Chip();
