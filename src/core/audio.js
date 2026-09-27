// Chiptune synth: pulse/triangle/noise channels, a lookahead tracker for music, procedural SFX,
// an engine drone, and (optional) speech-synth yelling for the Northwest crew.
import { store } from './save.js';

const NOTE = { C: 0, 'C#': 1, D: 2, 'D#': 3, E: 4, F: 5, 'F#': 6, G: 7, 'G#': 8, A: 9, 'A#': 10, B: 11 };
const freq = n => { const m = /^([A-G]#?)(\d)$/.exec(n); return 440 * Math.pow(2, (NOTE[m[1]] + (+m[2] + 1) * 12 - 69) / 12); };

// --- Music ---------------------------------------------------------------------------------
// Each channel is bars of 16 steps. Tokens: note (C4, F#5), '-' hold, '.' rest. Drums: k s h o(open hat) c(crash).
const bar = s => s.trim().split(/\s+/);
const rep = (arr, n) => Array.from({ length: n }, () => arr).flat();
const arp = (notes, n = 4) => rep(notes, n).slice(0, 16);
const pump = (lo, hi) => [lo, '.', hi, '.', lo, '.', hi, '.', lo, '.', hi, '.', lo, '.', hi, '.'];

const TRACKS = {
  title: { bpm: 132, bars: 8,
    lead: [...bar('A4 - . C5 . E5 - . A5 - - . G5 . E5 .'), ...bar('F5 - - . E5 . C5 . A4 - - - . . C5 .'), ...bar('D5 - - . C5 . B4 . G4 - . B4 . D5 - .'), ...bar('E5 - - - - - - - G#4 - - - B4 - - -'),
      ...bar('A4 - . C5 . E5 - . A5 - - . B5 . C6 .'), ...bar('B5 - - . A5 . F5 . C5 - - - A4 . C5 .'), ...bar('D5 - . E5 . F5 - . G5 - . F5 . E5 .'), ...bar('E5 - - - - - - - . . . . . . . .')],
    harm: [...arp(['A3', 'C4', 'E4', 'C4']), ...arp(['F3', 'A3', 'C4', 'A3']), ...arp(['G3', 'B3', 'D4', 'B3']), ...arp(['E3', 'G#3', 'B3', 'G#3']),
      ...arp(['A3', 'C4', 'E4', 'C4']), ...arp(['F3', 'A3', 'C4', 'A3']), ...arp(['G3', 'B3', 'D4', 'B3']), ...arp(['E3', 'G#3', 'B3', 'D4'])],
    bass: [...pump('A2', 'A3'), ...pump('F2', 'F3'), ...pump('G2', 'G3'), ...pump('E2', 'E3'), ...pump('A2', 'A3'), ...pump('F2', 'F3'), ...pump('G2', 'G3'), ...pump('E2', 'E3')],
    drums: rep(bar('k . h . s . h . k k h . s . h o'), 7).concat(bar('k . s . s . s s k . s s c . . .')) },
  drive: { bpm: 164, bars: 8,
    lead: [...bar('B4 - - . G4 . B4 . E5 - - . D5 . B4 .'), ...bar('C5 - - . B4 . G4 . E4 - - - - - . .'), ...bar('D5 - - . C5 . B4 . A4 - - . B4 . C5 .'), ...bar('B4 - - - - - D#5 - - - F#5 - - - . .'),
      ...bar('E5 . E5 . G5 - E5 . B5 - - . A5 . G5 .'), ...bar('G5 - - . F#5 . E5 . C5 - - - E5 - G5 -'), ...bar('F#5 - - . E5 . D5 . A4 - - . D5 . F#5 .'), ...bar('D#5 - - - F#5 - - - B5 - - - A5 . F#5 .')],
    harm: [...arp(['E4', 'G4', 'B4', 'G4']), ...arp(['C4', 'E4', 'G4', 'E4']), ...arp(['D4', 'F#4', 'A4', 'F#4']), ...arp(['B3', 'D#4', 'F#4', 'D#4']),
      ...arp(['E4', 'G4', 'B4', 'E5']), ...arp(['C4', 'E4', 'G4', 'C5']), ...arp(['D4', 'F#4', 'A4', 'D5']), ...arp(['B3', 'D#4', 'F#4', 'B4'])],
    bass: [...pump('E2', 'E3'), ...pump('C2', 'C3'), ...pump('D2', 'D3'), ...pump('B1', 'B2'), ...pump('E2', 'E3'), ...pump('C2', 'C3'), ...pump('D2', 'D3'), ...pump('B1', 'B2')],
    drums: rep(bar('k . h k s . h . k k h . s . h h'), 3).concat(bar('k . h k s . h . k . s s s s s s')) },
  repair: { bpm: 116, bars: 4,
    lead: [...bar('. . . . D5 . F5 . . A5 . G5 - F5 D5 .'), ...bar('. . . . C5 . D5 . . F5 - D5 . C5 A4 .'), ...bar('. . . . D5 . F5 . . A5 . C6 - A5 G5 .'), ...bar('F5 - E5 - D5 - C5 - D5 - - - . . . .')],
    harm: [...bar('. . D4 . . . F4 . . . D4 . F4 . A4 .'), ...bar('. . C4 . . . E4 . . . C4 . E4 . G4 .'), ...bar('. . D4 . . . F4 . . . D4 . F4 . A4 .'), ...bar('. . A3 . . . C4 . . . E4 . G4 . A4 .')],
    bass: [...bar('D2 . . D3 . . C3 . D2 . . F2 . G2 . A2'), ...bar('C2 . . C3 . . A2 . C2 . . E2 . G2 . A2'), ...bar('D2 . . D3 . . C3 . D2 . . F2 . G2 . A2'), ...bar('A1 . . A2 . . G2 . A1 . . C2 . E2 . G2')],
    drums: rep(bar('k . h . s . h k . k h . s . h h'), 3).concat(bar('k . h . s . h k . k s . s s s s')) },
  map: { bpm: 104, bars: 4,
    lead: [...bar('B4 - - - D5 - - - G5 - - - F#5 - E5 -'), ...bar('D5 - - - B4 - - - G4 - - - A4 - B4 -'), ...bar('C5 - - - E5 - - - G5 - - - A5 - G5 -'), ...bar('F#5 - - - E5 - D5 - A4 - - - - - - -')],
    harm: [...arp(['G3', 'B3', 'D4', 'B3']), ...arp(['E3', 'G3', 'B3', 'G3']), ...arp(['C4', 'E4', 'G4', 'E4']), ...arp(['D4', 'F#4', 'A4', 'F#4'])],
    bass: [...bar('G2 - - - . . G2 . D2 - - - . . D2 .'), ...bar('E2 - - - . . E2 . B1 - - - . . B1 .'), ...bar('C2 - - - . . C2 . G2 - - - . . G2 .'), ...bar('D2 - - - . . D2 . A2 - - - F#2 - - -')],
    drums: rep(bar('k . . h s . . h k . k h s . . h'), 4) },
  win: { bpm: 180, bars: 2, once: true,
    lead: bar('C5 E5 G5 C6 - - G5 C6 - - - - . . . . D6 - E6 - - - G6 - - - - - - - . .'),
    harm: bar('E4 G4 C5 E5 - - C5 E5 - - - - . . . . F5 - G5 - - - B5 - - - - - - - . .'),
    bass: bar('C3 . C3 . C3 . G2 . C3 . . . . . . . G2 - A2 - - - B2 - - - C3 - - - . .'),
    drums: bar('k . h . k . h . k . . . . . . . s s s s k . . . c . . . . . . .') },
  lose: { bpm: 120, bars: 2, once: true,
    lead: bar('G4 - F#4 - F4 - E4 - - - - - . . . . D#4 - - - D4 - - - C#4 - - - - - - -'),
    harm: bar('. . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . .'),
    bass: bar('C3 - B2 - A#2 - A2 - - - - - . . . . G#2 - - - G2 - - - F#2 - - - - - - -'),
    drums: bar('k . . . . . . . k . . . . . . . s . . . . . . . s . . . . . . .') },
  finale: { bpm: 150, bars: 4,
    lead: [...bar('C5 - E5 - G5 - C6 - B5 - G5 - E5 - G5 -'), ...bar('A5 - - - F5 - A5 - C6 - - - A5 - F5 -'), ...bar('G5 - - - E5 - G5 - B5 - - - D6 - B5 -'), ...bar('C6 - - - - - - - G5 - E5 - C5 - - -')],
    harm: [...arp(['C4', 'E4', 'G4', 'E4']), ...arp(['F4', 'A4', 'C5', 'A4']), ...arp(['G4', 'B4', 'D5', 'B4']), ...arp(['C4', 'E4', 'G4', 'C5'])],
    bass: [...pump('C2', 'C3'), ...pump('F2', 'F3'), ...pump('G2', 'G3'), ...pump('C2', 'C3')],
    drums: rep(bar('k . h . s . h . k k h . s . h o'), 3).concat(bar('k . s . s . s s k s s s c . . .')) },
};

class Chip {
  constructor() {
    this.ctx = null; this.enabled = store.get('sound', true); this.voices = store.get('voicesOn', true); // new key: resets any old 'off' so voices start on
    this.track = null; this.timer = null; this.engine = null;
  }
  unlock() {
    if (!this.ctx) {
      const AC = window.AudioContext || window.webkitAudioContext; if (!AC) return;
      this.ctx = new AC();
      this.master = this.ctx.createGain(); this.master.gain.value = this.enabled ? 0.55 : 0; this.master.connect(this.ctx.destination);
      this.musicBus = this.ctx.createGain(); this.musicBus.gain.value = 0.42; this.musicBus.connect(this.master);
      this.sfxBus = this.ctx.createGain(); this.sfxBus.gain.value = 0.8; this.sfxBus.connect(this.master);
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
    if (this.voices && window.speechSynthesis && !this._spoke) { try { const u = new SpeechSynthesisUtterance(' '); u.volume = 0; speechSynthesis.speak(u); this._spoke = true; } catch (e) { /* no speech */ } }
  }
  get now() { return this.ctx ? this.ctx.currentTime : 0; }
  setSound(on) { this.enabled = on; store.set('sound', on); if (this.master) this.master.gain.setTargetAtTime(on ? 0.55 : 0, this.now, 0.02); }
  setVoices(on) { this.voices = on; store.set('voicesOn', on); if (!on && window.speechSynthesis) speechSynthesis.cancel(); }

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

  // --- music -------------------------------------------------------------------------------
  music(name) {
    if (!this.ctx) { this.pending = name; return; }
    if (this.track && this.track.name === name) return;
    this.stopMusic();
    const tr = TRACKS[name]; if (!tr) return;
    const stepDur = 60 / tr.bpm / 4; const len = Math.max(tr.lead.length, tr.bass.length, tr.drums.length);
    this.track = { name, tr, step: 0, next: this.now + 0.06, stepDur, len };
    this.timer = setInterval(() => this.pump(), 25);
  }
  stopMusic() { clearInterval(this.timer); this.timer = null; this.track = null; }
  pump() {
    const T = this.track; if (!T || !this.ctx) return;
    while (T.next < this.now + 0.12) {
      const i = T.step % T.len; const at = T.next - this.now;
      if (T.tr.once && T.step >= T.len) { this.stopMusic(); return; }
      this.chan(T.tr.lead, i, at, T.stepDur, { duty: 0.25, vol: 0.11 });
      this.chan(T.tr.harm, i, at, T.stepDur, { duty: 0.125, vol: 0.05 });
      this.chan(T.tr.bass, i, at, T.stepDur, { type: 'triangle', vol: 0.22 });
      const d = T.tr.drums[i % T.tr.drums.length];
      if (d === 'k') this.tone({ type: 'sine', f: 150, f2: 38, t: at, dur: 0.14, vol: 0.5, bus: this.musicBus });
      if (d === 's') { this.hiss({ t: at, dur: 0.12, vol: 0.22, filter: 'bandpass', fq: 1800, q: 0.7, bus: this.musicBus }); this.tone({ type: 'triangle', f: 220, f2: 120, t: at, dur: 0.06, vol: 0.18, bus: this.musicBus }); }
      if (d === 'h') this.hiss({ t: at, dur: 0.03, vol: 0.08, fq: 7000, bus: this.musicBus });
      if (d === 'o') this.hiss({ t: at, dur: 0.14, vol: 0.07, fq: 6000, bus: this.musicBus });
      if (d === 'c') this.hiss({ t: at, dur: 0.7, vol: 0.12, fq: 4000, bus: this.musicBus });
      T.step++; T.next += T.stepDur;
    }
  }
  chan(pat, i, at, sd, v) {
    const n = pat[i % pat.length]; if (!n || n === '.' || n === '-') return;
    let hold = 1; while (pat[(i + hold) % pat.length] === '-' && hold < 16) hold++;
    this.tone({ ...v, f: freq(n), t: at, dur: hold * sd * 0.95, release: Math.min(0.08, hold * sd * 0.4), bus: this.musicBus });
  }

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
  say(text, { pitch = 0.6, rate = 1.15 } = {}) {
    if (!this.enabled || !this.voices || !window.speechSynthesis) { this.sfx('grunt'); return; }
    try {
      speechSynthesis.cancel();
      const u = new SpeechSynthesisUtterance(text.replace(/[#$%&@*]{2,}/g, ' bleep ')); u.pitch = pitch; u.rate = rate; u.volume = 0.9;
      const v = speechSynthesis.getVoices().filter(v => /^en/i.test(v.lang)); const pick = v.find(v => /Fred|Daniel|Alex|Google UK English Male|Aaron|Rocko|Grandpa|Ralph/i.test(v.name)) || v[0];
      if (pick) u.voice = pick; speechSynthesis.speak(u);
    } catch (e) { this.sfx('grunt'); }
  }
  hush() { if (window.speechSynthesis) speechSynthesis.cancel(); }
}
export const audio = new Chip();
