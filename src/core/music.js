// Electronic soundtrack engine: four-on-the-floor house, psytrance and big-room tracks built from
// Web Audio primitives — punchy sine kicks with sidechain pumping, noise claps/hats, detuned
// "supersaw" chord stabs and pads, resonant acid lines, rolling basslines and arpeggios.
// A lookahead scheduler (setInterval + AudioContext time) keeps it tight.

const NOTE = { C: 0, 'C#': 1, D: 2, 'D#': 3, E: 4, F: 5, 'F#': 6, G: 7, 'G#': 8, A: 9, 'A#': 10, B: 11 };
const midi = n => { const m = /^([A-G]#?)(\d)$/.exec(n); return NOTE[m[1]] + (+m[2] + 1) * 12; };
const hz = n => 440 * Math.pow(2, (midi(n) - 69) / 12);
const up = (n, oct) => { const m = /^([A-G]#?)(\d)$/.exec(n); return m[1] + (+m[2] + oct); };

// ---- pattern helpers --------------------------------------------------------------------------
const bar = s => s.trim().split(/\s+/);
const bars = (...xs) => xs.flatMap(bar);
const rests = n => Array(n).fill('.');
// house bass: root on every offbeat 8th, a pickup into the next bar
const offbeat = roots => roots.flatMap(r => ['.', '.', r, '.', '.', '.', r, '.', '.', '.', r, '.', '.', '.', r, up(r, 1)]);
// psytrance roll: the bass fills the three 16ths between kicks
const roll = roots => roots.flatMap(r => ['.', r, r, r, '.', r, r, r, '.', r, r, r, '.', r, r, r]);

// ---- the tracks ---------------------------------------------------------------------------------
const Am = ['A3', 'C4', 'E4'], F = ['F3', 'A3', 'C4'], Cmaj = ['C4', 'E4', 'G4'], G = ['G3', 'B3', 'D4'];
const Em = ['E3', 'G3', 'B3'], Cm = ['C3', 'E3', 'G3'], Dm = ['D3', 'F#3', 'A3'], B7 = ['B2', 'D#3', 'F#3'];

export const TRACKS = {
  // Progressive house for the title screen.
  title: {
    bpm: 124, bars: 8, chords: [Am, F, Cmaj, G, Am, F, Cmaj, G],
    kick: 'x...x...x...x...', clap: '....x.......x...', hatO: '..x...x...x...x.', hatC: 'x.xxx.xxx.xxx.xx',
    bass: { notes: offbeat(['A1', 'F1', 'C2', 'G1', 'A1', 'F1', 'C2', 'G1']), cutoff: [900, 260], q: 2, vol: 0.34, sub: true },
    stab: { rhythm: '...x..x....x..x.', cutoff: [3200, 700], vol: 0.12, lfo: [0.25, 1] },
    pad: { vol: 0.045, cutoff: 1400 },
    lead: { notes: bars('A4 - . C5 . E5 - . A5 - - . G5 . E5 .', 'F5 - - . E5 . C5 . A4 - - - . . C5 .', 'D5 - - . C5 . B4 . G4 - . B4 . D5 - .', 'E5 - - - - - - - G#4 - - - B4 - - -',
      'A4 - . C5 . E5 - . A5 - - . B5 . C6 .', 'B5 - - . A5 . F5 . C5 - - - A4 . C5 .', 'D5 - . E5 . F5 - . G5 - . F5 . E5 .', 'E5 - - - - - - - . . . . . . . .'), wave: 'sawtooth', detune: [-9, 9], cutoff: 3600, vol: 0.07 },
  },
  // Psytrance for the race: rolling bass, acid, trippy arp, snare roll every 8 bars.
  drive: {
    bpm: 142, bars: 8, chords: [Em, Em, Em, Em, Cm, Cm, Dm, B7],
    kick: 'x...x...x...x...', clap: '....x.......x...', clapVol: 0.35, hatO: '..x...x...x...x.', hatC: 'xxxxxxxxxxxxxxxx', roll: [7],
    bass: { notes: roll(['E2', 'E2', 'E2', 'E2', 'C2', 'C2', 'D2', 'B1']), cutoff: [1400, 260], q: 4, vol: 0.3, short: true },
    acid: { notes: [...Array(4)].flatMap(() => bar('E3 . E4 E3 G3 . A#3 E3 . F3 E3 E4 . G3 B3 E3')).concat([...Array(4)].flatMap(() => bar('E3 E3 . E4 . G3 A#3 . B3 . E4 . F3 E3 . D4'))), sweep: [280, 3400], period: 4, q: 13, vol: 0.085 },
    arp: { rhythm: 'x.xxx.xxx.xxx.xx', oct: 1, cutoff: 2400, vol: 0.035, wave: 'square' },
    lead: { notes: [...rests(64), ...bars('E5 . E5 . G5 - E5 . B5 - - . A5 . G5 .', 'G5 - - . F#5 . E5 . C5 - - - E5 - G5 -', 'F#5 - - . E5 . D5 . A4 - - . D5 . F#5 .', 'D#5 - - - F#5 - - - B5 - - - A5 . F#5 .')], wave: 'sawtooth', detune: [-7, 7], cutoff: 4200, vol: 0.06 },
  },
  // Tech house for repairs: shuffled hats, rimshots, Dm7 plucks, a funky bassline.
  repair: {
    bpm: 122, bars: 4, chords: [['D4', 'F4', 'A4', 'C5'], ['D4', 'F4', 'A4', 'C5'], ['A#3', 'D4', 'F4', 'A4'], ['C4', 'E4', 'G4', 'A#4']],
    kick: 'x...x...x...x...', clap: '....x.......x...', hatO: '..x...x...x...x.', hatC: '.x.xx.x..x.xx.x.', rim: '...x......x....x',
    bass: { notes: bars('D2 . . D2 . . D3 . . D2 . F2 . G2 A2 .', 'D2 . . D2 . . D3 . . D2 . C3 . A2 F2 .', 'A#1 . . A#1 . . A#2 . . A#1 . D2 . F2 A#1 .', 'C2 . . C2 . . C3 . . C2 . E2 . G2 A#2 .'), cutoff: [1100, 300], q: 5, vol: 0.3 },
    stab: { rhythm: '..x.....x..x....', cutoff: [3600, 500], vol: 0.09, short: true },
    lead: { notes: bars('. . . . D5 . F5 . . A5 . G5 - F5 D5 .', '. . . . C5 . D5 . . F5 - D5 . C5 A4 .', '. . . . D5 . F5 . . A5 . C6 - A5 G5 .', 'F5 - E5 - D5 - C5 - D5 - - - . . . .'), wave: 'square', cutoff: 2200, vol: 0.045 },
  },
  // Chill deep house for the map: warm 7th-chord pads, plucked arp, soft groove.
  map: {
    bpm: 116, bars: 4, chords: [['G3', 'B3', 'D4', 'F#4'], ['E3', 'G3', 'B3', 'D4'], ['C3', 'E3', 'G3', 'B3'], ['D3', 'F#3', 'A3', 'C4']],
    kick: 'x...x...x...x...', kickVol: 0.6, clap: '....x.......x...', clapVol: 0.3, hatO: '..x...x...x...x.',
    bass: { notes: bars('G1 - - . . . G2 . . . G1 . . . D2 .', 'E1 - - . . . E2 . . . E1 . . . B1 .', 'C2 - - . . . C3 . . . C2 . . . G2 .', 'D2 - - . . . D3 . . . D2 . . . A2 .'), cutoff: [700, 250], q: 1, vol: 0.3, sub: true },
    pad: { vol: 0.06, cutoff: 1600 },
    arp: { rhythm: 'x.x.x.x.x.x.x.x.', oct: 1, cutoff: 3000, vol: 0.04, wave: 'triangle', updown: true },
    lead: { notes: bars('B4 - - - D5 - - - G5 - - - F#5 - E5 -', 'D5 - - - B4 - - - G4 - - - A4 - B4 -', 'C5 - - - E5 - - - G5 - - - A5 - G5 -', 'F#5 - - - E5 - D5 - A4 - - - - - - -'), wave: 'triangle', cutoff: 3000, vol: 0.07 },
  },
  // Job won: a riser into a festival drop hit.
  win: {
    bpm: 128, bars: 2, once: true, chords: [Cmaj, ['C4', 'E4', 'G4', 'C5']],
    kick: ['................', 'x...x...........'], snare: ['x...x...x.x.xxxx', '................'], riser: [0], crash: [1],
    stab: { rhythm: ['................', 'x.......x.......'], cutoff: [6000, 1200], vol: 0.16, hold: 6 },
    lead: { notes: bars('. . . . . . . . . . . . . . . .', 'C5 - E5 - G5 - C6 - - - - - - - . .'), wave: 'sawtooth', detune: [-10, 10], cutoff: 5000, vol: 0.09 },
  },
  // Fired: the filter closes on a sad descending wobble.
  lose: {
    bpm: 100, bars: 2, once: true, chords: [Am, Am],
    kick: ['x.......x.......', 'x...............'],
    bass: { notes: bars('G2 - - - F#2 - - - F2 - - - E2 - - -', 'D#2 - - - - - - - - - - - . . . .'), cutoff: [900, 120], q: 9, vol: 0.34 },
  },
  // Finale: big-room anthem.
  finale: {
    bpm: 128, bars: 4, chords: [Cmaj, ['F3', 'A3', 'C4'], ['G3', 'B3', 'D4'], Cmaj],
    kick: 'x...x...x...x...', clap: '....x.......x...', hatO: '..x...x...x...x.', hatC: 'x.x.x.x.x.x.x.x.', roll: [3], crashEvery: 4,
    bass: { notes: offbeat(['C2', 'F1', 'G1', 'C2']), cutoff: [1000, 300], q: 3, vol: 0.32, sub: true },
    stab: { rhythm: '..x...x...x...x.', cutoff: [4200, 900], vol: 0.13 },
    lead: { notes: bars('C5 - E5 - G5 - C6 - B5 - G5 - E5 - G5 -', 'A5 - - - F5 - A5 - C6 - - - A5 - F5 -', 'G5 - - - E5 - G5 - B5 - - - D6 - B5 -', 'C6 - - - - - - - G5 - E5 - C5 - - -'), wave: 'sawtooth', detune: [-12, 0, 12], cutoff: 5200, vol: 0.075 },
  },
};

// ---- the engine -----------------------------------------------------------------------------------
export class DJ {
  constructor(chip) { this.chip = chip; this.track = null; this.timer = null; }
  get ctx() { return this.chip.ctx; }
  ensureBus() {
    if (this.duck) return;
    const c = this.ctx;
    this.duck = c.createGain(); this.duck.connect(this.chip.musicBus); // everything but the kick pumps through this
    this.drums = c.createGain(); this.drums.gain.value = 1; this.drums.connect(this.chip.musicBus);
  }
  play(name) {
    if (!this.ctx) return;
    if (this.track && this.track.name === name) return;
    this.stop();
    const tr = TRACKS[name]; if (!tr) return;
    this.ensureBus();
    this.track = { name, tr, step: 0, next: this.ctx.currentTime + 0.06, sd: 60 / tr.bpm / 4, len: tr.bars * 16 };
    this.timer = setInterval(() => this.schedule(), 25);
  }
  stop() { clearInterval(this.timer); this.timer = null; this.track = null; }
  schedule() {
    const T = this.track; if (!T || !this.ctx) return;
    while (T.next < this.ctx.currentTime + 0.14) {
      if (T.tr.once && T.step >= T.len) { this.stop(); return; }
      this.step(T.tr, T.step % T.len, T.next, T.sd);
      T.step++; T.next += T.sd;
    }
  }
  pat(p, b) { return Array.isArray(p) ? p[b % p.length] : p; }
  step(tr, i, t, sd) {
    const b = Math.floor(i / 16), s = i % 16, chord = tr.chords[b % tr.chords.length];
    const hit = p => p && this.pat(p, b)[s] === 'x';
    if (hit(tr.kick)) this.kick(t, tr.kickVol || 0.95);
    if (hit(tr.clap)) this.clap(t, tr.clapVol || 0.5);
    if (hit(tr.snare)) this.snare(t, 0.35 + s / 40);
    if (hit(tr.hatC)) this.hat(t, false, s % 4 === 2 ? 0.14 : 0.08);
    if (hit(tr.hatO)) this.hat(t, true, 0.13);
    if (hit(tr.rim)) this.rim(t);
    if (tr.roll && tr.roll.includes(b) && s >= 8) this.snare(t, 0.12 + (s - 8) * 0.04);
    if (tr.riser && tr.riser.includes(b) && s === 0) this.riser(t, sd * 16);
    if ((tr.crash && tr.crash.includes(b) && s === 0) || (tr.crashEvery && s === 0 && b % tr.crashEvery === 0 && i > 0)) this.crash(t);
    // melodic parts
    const note = (part, fn) => { if (!part) return; const n = part.notes[i % part.notes.length]; if (!n || n === '.' || n === '-') return; let hold = 1; while (part.notes[(i + hold) % part.notes.length] === '-' && hold < 16) hold++; fn(n, hold * sd); };
    note(tr.bass, (n, d) => { const p = tr.bass; this.synth([hz(n)], t, p.short ? sd * 0.9 : d * 0.92, { wave: 'sawtooth', cutoff: p.cutoff, q: p.q, vol: p.vol, release: 0.03 }); if (p.sub) this.synth([hz(n) / 2], t, d * 0.9, { wave: 'sine', vol: p.vol * 0.9, release: 0.03 }); });
    note(tr.acid, (n, d) => { const p = tr.acid; const ph = ((b % p.period) * 16 + s) / (p.period * 16); const lfo = 0.5 - 0.5 * Math.cos(ph * Math.PI * 2); const top = p.sweep[0] + (p.sweep[1] - p.sweep[0]) * lfo; this.synth([hz(n)], t, Math.min(d, sd * 1.4), { wave: 'sawtooth', cutoff: [top * 1.6, top * 0.45], q: p.q, vol: p.vol, release: 0.02 }); });
    note(tr.lead, (n, d) => { const p = tr.lead; this.synth([hz(n)], t, d * 0.95, { wave: p.wave, detune: p.detune, cutoff: [p.cutoff, p.cutoff * 0.7], q: 1, vol: p.vol, attack: 0.01, release: 0.08 }); });
    if (tr.stab && this.pat(tr.stab.rhythm, b)[s] === 'x') {
      const p = tr.stab; const lfo = p.lfo ? p.lfo[0] + (p.lfo[1] - p.lfo[0]) * (0.5 - 0.5 * Math.cos((i / (tr.bars * 16)) * Math.PI * 2)) : 1;
      this.synth(chord.map(n => hz(up(n, 1))), t, p.short ? sd * 0.8 : sd * (p.hold || 1.6), { wave: 'sawtooth', detune: [-14, 0, 14], cutoff: [p.cutoff[0] * lfo + 300, p.cutoff[1]], q: 2, vol: p.vol, release: 0.06 });
    }
    if (tr.pad && s === 0) this.synth(chord.map(hz), t, sd * 16, { wave: 'sawtooth', detune: [-10, 10], cutoff: [tr.pad.cutoff, tr.pad.cutoff], q: 0.7, vol: tr.pad.vol, attack: sd * 3, release: sd * 3 });
    if (tr.arp && this.pat(tr.arp.rhythm, b)[s] === 'x') {
      const p = tr.arp; const tones = [...chord, ...chord.map(n => up(n, 1))]; const seq = p.updown ? [...tones, ...tones.slice(1, -1).reverse()] : tones;
      const n = up(seq[i % seq.length], p.oct);
      this.synth([hz(n)], t, sd * 0.8, { wave: p.wave, cutoff: [p.cutoff, p.cutoff * 0.4], q: 3, vol: p.vol, release: 0.03 });
    }
  }

  // ---- instruments ------------------------------------------------------------------------------
  synth(freqs, t, dur, { wave = 'sawtooth', detune = [0], cutoff = [4000, 4000], q = 1, vol = 0.1, attack = 0.004, release = 0.06, dest } = {}) {
    const c = this.ctx; const f = c.createBiquadFilter(); f.type = 'lowpass'; f.Q.value = q;
    f.frequency.setValueAtTime(Math.max(40, cutoff[0]), t); f.frequency.exponentialRampToValueAtTime(Math.max(40, cutoff[1]), t + Math.max(0.03, dur * 0.85));
    const g = c.createGain(); const peak = vol / Math.sqrt(freqs.length * detune.length);
    g.gain.setValueAtTime(0.0001, t); g.gain.linearRampToValueAtTime(peak, t + attack);
    g.gain.setValueAtTime(peak, t + Math.max(attack, dur - release)); g.gain.exponentialRampToValueAtTime(0.0001, t + dur + 0.001);
    f.connect(g); g.connect(dest || this.duck);
    for (const fr of freqs) for (const dt of detune) { const o = c.createOscillator(); o.type = wave; o.frequency.value = fr; o.detune.value = dt; o.connect(f); o.start(t); o.stop(t + dur + 0.05); }
  }
  noise(t, dur, { type = 'highpass', freq = 7000, q = 0.7, vol = 0.2, freq2, dest, attack = 0.001 } = {}) {
    const c = this.ctx; const s = c.createBufferSource(); s.buffer = this.chip.noise; s.loop = true;
    const f = c.createBiquadFilter(); f.type = type; f.frequency.setValueAtTime(freq, t); f.Q.value = q; if (freq2) f.frequency.exponentialRampToValueAtTime(freq2, t + dur);
    const g = c.createGain(); g.gain.setValueAtTime(0.0001, t); g.gain.linearRampToValueAtTime(vol, t + attack); g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    s.connect(f); f.connect(g); g.connect(dest || this.drums); s.start(t, Math.random()); s.stop(t + dur + 0.02);
    return g;
  }
  kick(t, vol) {
    const c = this.ctx; const o = c.createOscillator(); o.type = 'sine';
    o.frequency.setValueAtTime(165, t); o.frequency.exponentialRampToValueAtTime(44, t + 0.11);
    const g = c.createGain(); g.gain.setValueAtTime(vol, t); g.gain.exponentialRampToValueAtTime(0.0001, t + 0.34);
    o.connect(g); g.connect(this.drums); o.start(t); o.stop(t + 0.36);
    this.noise(t, 0.012, { freq: 3000, vol: 0.2 }); // beater click
    // sidechain pump: duck everything else under the kick
    const d = this.duck.gain; d.cancelScheduledValues(t); d.setValueAtTime(0.32, t); d.linearRampToValueAtTime(1, t + 0.2);
  }
  clap(t, vol) {
    for (const k of [0, 0.011, 0.022]) this.noise(t + k, 0.02, { type: 'bandpass', freq: 1300, q: 0.9, vol });
    this.noise(t + 0.03, 0.2, { type: 'bandpass', freq: 1150, q: 0.8, vol: vol * 0.55 });
  }
  snare(t, vol) { this.noise(t, 0.13, { type: 'bandpass', freq: 1900, q: 0.6, vol }); this.synth([190], t, 0.06, { wave: 'triangle', vol: vol * 0.5, dest: this.drums }); }
  hat(t, open, vol) { this.noise(t, open ? 0.2 : 0.035, { freq: open ? 6500 : 8500, vol }); }
  rim(t) { this.synth([820], t, 0.03, { wave: 'square', cutoff: [3000, 1500], vol: 0.06, dest: this.drums }); }
  crash(t) { this.noise(t, 1.4, { freq: 4500, vol: 0.16 }); }
  riser(t, dur) { this.noise(t, dur, { type: 'bandpass', freq: 300, freq2: 9000, q: 2, vol: 0.28, attack: dur * 0.9 }); }
}
