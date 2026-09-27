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
    // Unlock on the first real gesture anywhere, straight from the browser event (not via Phaser), and
    // keep listening: iOS suspends audio after a call or app switch, and the next tap must revive it.
    // Only these events count as a gesture on phones - touchstart/pointerdown do NOT.
    if (typeof document !== 'undefined') for (const ev of ['pointerup', 'touchend', 'mousedown', 'keydown', 'click']) document.addEventListener(ev, () => this.unlock(), { capture: true, passive: true });
    // iPhone: let game audio play even with the ring/silent switch on (Safari 17+).
    try { if (typeof navigator !== 'undefined' && navigator.audioSession) navigator.audioSession.type = 'playback'; } catch (e) { /* older Safari */ }
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
    if (this.ctx.state !== 'running' && this.ctx.state !== 'closed') this.ctx.resume().catch(() => {});
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
  // after = true waits for a playing sting (win/lose) to finish before starting the loop.
  music(name, { after } = {}) { if (!this.ctx) return; const dj = (this.dj = this.dj || new DJ(this)); after ? dj.after(name) : dj.play(name); }
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
    const T = (o) => this.tone(o), N = (o) => this.hiss(o), P = (n, t, dur, vol, o) => this.pluck(n, t, dur, vol, o);
    switch (name) {
      // UI sounds: short supersaw plucks (see pluck()) so the menus sit with the EDM soundtrack
      case 'blip': P(['A5'], 0, 0.06, 0.09); break;
      case 'select': P(['E5', 'A5'], 0, 0.07, 0.1); P(['A5', 'E6'], 0.06, 0.14, 0.1); break;
      case 'back': P(['A5', 'E5'], 0, 0.14, 0.09, { cutoff: [2500, 200] }); break;
      case 'coin': P(['B5'], 0, 0.06, 0.1); P(['E6'], 0.06, 0.2, 0.1); break;
      case 'boost': T({ type: 'sawtooth', f: 120, f2: 900, dur: 0.5, vol: 0.14 }); N({ dur: 0.6, vol: 0.12, filter: 'bandpass', fq: 600, fq2: 3000 }); break;
      case 'crash': N({ dur: 0.45, vol: 0.5, filter: 'lowpass', fq: 2400, fq2: 200 }); T({ type: 'square', f: 110, f2: 30, dur: 0.35, vol: 0.25 }); T({ duty: 0.125, f: 1600, f2: 400, dur: 0.12, vol: 0.08 }); break;
      case 'bump': N({ dur: 0.15, vol: 0.35, filter: 'lowpass', fq: 900, fq2: 150 }); T({ type: 'square', f: 90, f2: 40, dur: 0.12, vol: 0.2 }); break;
      case 'skid': N({ dur: 0.5, vol: 0.12, filter: 'bandpass', fq: 2600, q: 8 }); break;
      case 'splash': N({ dur: 0.35, vol: 0.25, filter: 'bandpass', fq: 1800, fq2: 500, q: 1.5 }); break;
      case 'honk': T({ duty: 0.5, f: 392, dur: 0.28, vol: 0.12 }); T({ duty: 0.5, f: 494, dur: 0.28, vol: 0.12 }); T({ duty: 0.5, f: 392, t: 0.32, dur: 0.22, vol: 0.12 }); T({ duty: 0.5, f: 494, t: 0.32, dur: 0.22, vol: 0.12 }); break;
      case 'nwhonk': T({ type: 'sawtooth', f: 180, dur: 0.5, vol: 0.12 }); T({ type: 'sawtooth', f: 190, dur: 0.5, vol: 0.12 }); break;
      case 'ding': P(['G6', 'D7'], 0, 0.35, 0.12, { cutoff: [9000, 2500] }); break;
      case 'step': P(['C5', 'G5'], 0, 0.08, 0.1); P(['E5', 'C6'], 0.07, 0.08, 0.1); P(['G5', 'E6'], 0.14, 0.2, 0.11); break;
      case 'wrong': this.wub(0, 0.32, 55); break;
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
      // "GO!": a drop hit — sub boom, noise burst and a wide major stab
      case 'go': this.boom(0.55); N({ dur: 0.5, vol: 0.2, filter: 'lowpass', fq: 6000, fq2: 400 }); P(['C5', 'E5', 'G5', 'C6'], 0, 0.45, 0.14, { cutoff: [7000, 900] }); break;
      // countdown: a driven kick plus a short upward noise swoosh
      case 'tick': this.boom(0.35, 0.3); N({ dur: 0.35, vol: 0.1, filter: 'bandpass', fq: 600, fq2: 5000, q: 2 }); break;
      // phone ring as an EDM siren lead
      case 'alarm': T({ type: 'sawtooth', f: 880, f2: 1320, dur: 0.1, vol: 0.06, slide: 'lin' }); T({ type: 'sawtooth', f: 1320, f2: 880, t: 0.1, dur: 0.12, vol: 0.06, slide: 'lin' }); break;
      case 'star': P(['E6'], 0, 0.07, 0.1); P(['A6'], 0.06, 0.07, 0.1); P(['E7'], 0.12, 0.25, 0.1, { cutoff: [9000, 2000] }); break;
      case 'grunt': T({ duty: 0.5, f: 110 + Math.random() * 40, f2: 70, dur: 0.12, vol: 0.14 }); break;
      default: T({ duty: 0.5, f: 440, dur: 0.05, vol: 0.1 });
    }
  }
  // Supersaw pluck: detuned saws through a snappy low-pass envelope.
  pluck(notes, t = 0, dur = 0.1, vol = 0.1, { cutoff = [6000, 700] } = {}) {
    const at = this.now + t, c = this.ctx, f = c.createBiquadFilter(), g = c.createGain();
    f.type = 'lowpass'; f.Q.value = 2; f.frequency.setValueAtTime(cutoff[0], at); f.frequency.exponentialRampToValueAtTime(cutoff[1], at + dur);
    const peak = vol / Math.sqrt(notes.length * 3); g.gain.setValueAtTime(0.0001, at); g.gain.linearRampToValueAtTime(peak, at + 0.004); g.gain.exponentialRampToValueAtTime(0.0001, at + dur);
    f.connect(g); g.connect(this.sfxBus);
    for (const n of notes) for (const dt of [-12, 0, 12]) { const o = c.createOscillator(); o.type = 'sawtooth'; o.frequency.value = freq(n); o.detune.value = dt; o.connect(f); o.start(at); o.stop(at + dur + 0.02); }
  }
  // Kick-style sub boom (tick / GO!).
  boom(vol = 0.5, dur = 0.5) {
    const at = this.now, o = this.ctx.createOscillator(), g = this.ctx.createGain(); o.type = 'sine';
    o.frequency.setValueAtTime(180, at); o.frequency.exponentialRampToValueAtTime(40, at + dur * 0.5);
    g.gain.setValueAtTime(vol, at); g.gain.exponentialRampToValueAtTime(0.0001, at + dur);
    o.connect(g); g.connect(this.sfxBus); o.start(at); o.stop(at + dur + 0.02);
  }
  // Dubstep "wub": a detuned saw bass with a wobbling low-pass (the wrong-tool buzzer).
  wub(t, dur, f0) {
    const at = this.now + t, c = this.ctx, fl = c.createBiquadFilter(), g = c.createGain(), lfo = c.createOscillator(), depth = c.createGain();
    fl.type = 'lowpass'; fl.Q.value = 8; fl.frequency.value = 500; lfo.frequency.value = 9; depth.gain.value = 420; lfo.connect(depth); depth.connect(fl.frequency);
    g.gain.setValueAtTime(0.2, at); g.gain.setValueAtTime(0.2, at + dur - 0.05); g.gain.exponentialRampToValueAtTime(0.0001, at + dur);
    fl.connect(g); g.connect(this.sfxBus); lfo.start(at); lfo.stop(at + dur + 0.02);
    for (const dt of [-15, 15]) { const o = c.createOscillator(); o.type = 'sawtooth'; o.frequency.setValueAtTime(f0, at); o.frequency.exponentialRampToValueAtTime(f0 * 0.8, at + dur); o.detune.value = dt; o.connect(fl); o.start(at); o.stop(at + dur + 0.02); }
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
        if (buf && this.ctx.state !== 'running') await Promise.race([this.ctx.resume().catch(() => {}), new Promise(r => setTimeout(r, 400))]);
        if (token !== this.sayToken) return;
        // still locked (no real gesture yet): drop the line instead of letting it blurt out minutes later
        if (buf && this.ctx.state !== 'running') { this.duck(false); return; }
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
