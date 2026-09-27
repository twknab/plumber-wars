// Electronic soundtrack engine: big-room, house, psytrance and deep-house tracks built from Web Audio
// primitives — punchy sine kicks with sidechain pumping, noise claps/hats/snare builds, stereo
// "supersaw" leads and chord stabs, plucks, resonant acid lines, rolling basslines, risers and impacts,
// all glued through a compressor with reverb + tempo-synced delay sends.
// A lookahead scheduler (setInterval + AudioContext time) keeps it tight.
//
// Track anatomy: `bars` bars of 16ths. `loopFrom` (bar) lets a track play its intro once and then loop
// the rest. Any drum pattern may be a string, a per-bar array, or a function of the bar number; any
// melodic part may carry `on: b => bool` to mute it in some sections. `once` tracks are stings that can
// hand over to a loop (`then`).

const NOTE = { C: 0, 'C#': 1, D: 2, 'D#': 3, E: 4, F: 5, 'F#': 6, G: 7, 'G#': 8, A: 9, 'A#': 10, B: 11 };
const midi = n => { const m = /^([A-G]#?)(\d)$/.exec(n); return NOTE[m[1]] + (+m[2] + 1) * 12; };
const hz = n => 440 * Math.pow(2, (midi(n) - 69) / 12);
const up = (n, oct) => { const m = /^([A-G]#?)(\d)$/.exec(n); return m[1] + (+m[2] + oct); };

// ---- pattern helpers --------------------------------------------------------------------------
const bar = s => s.trim().split(/\s+/);
const bars = (...xs) => xs.flatMap(bar);
const rests = n => Array(n).fill('.');
const times = (n, xs) => [...Array(n)].flatMap(() => xs);
// house bass: root on every offbeat 8th, a pickup into the next bar
const offbeat = roots => roots.flatMap(r => ['.', '.', r, '.', '.', '.', r, '.', '.', '.', r, '.', '.', '.', r, up(r, 1)]);
// psytrance roll: the bass fills the three 16ths between kicks
const roll = roots => roots.flatMap(r => ['.', r, r, r, '.', r, r, r, '.', r, r, r, '.', r, r, r]);
// big-room bass: pumping offbeat 16ths with octave jumps
const pump = roots => roots.flatMap(r => ['.', '.', r, r, '.', '.', r, up(r, 1), '.', '.', r, r, '.', '.', up(r, 1), r]);
const OFF = '................';

// ---- chords ---------------------------------------------------------------------------------------
const Am = ['A3', 'C4', 'E4'], F = ['F3', 'A3', 'C4'], Cmaj = ['C4', 'E4', 'G4'], G = ['G3', 'B3', 'D4'];
const Em = ['E3', 'G3', 'B3'], Cm = ['C3', 'E3', 'G3'], Dm = ['D3', 'F#3', 'A3'], B7 = ['B2', 'D#3', 'F#3'];
const Dmin = ['D3', 'F3', 'A3'], Bb = ['A#2', 'D3', 'F3'], A7 = ['A2', 'C#3', 'E3', 'G3'];

// The title melody (8 bars), the hook of the main theme's drop.
const TITLE_HOOK = bars('A4 - . C5 . E5 - . A5 - - . G5 . E5 .', 'F5 - - . E5 . C5 . A4 - - - . . C5 .', 'D5 - - . C5 . B4 . G4 - . B4 . D5 - .', 'E5 - - - - - - - G#4 - - - B4 - - -',
  'A4 - . C5 . E5 - . A5 - - . B5 . C6 .', 'B5 - - . A5 . F5 . C5 - - - A4 . C5 .', 'D5 - . E5 . F5 - . G5 - . F5 . E5 - .', 'E5 - - - - - - - . . . . . . . .');

export const TRACKS = {
  // Big-room anthem. Starts on an impact with the kick already pumping, a 2-bar snare-roll build with a
  // riser and a rising high-pass, then the DROP: the title hook on a stereo supersaw for 8 bars. A short
  // breakdown and another build loop straight back into the drop.
  title: {
    title: 'Plumber Wars (Main Theme)', genre: 'Big-room house', where: 'Splash, title screen, How to Play',
    bpm: 128, bars: 16, loopFrom: 4, entry: true, chords: [Am, F, Cmaj, G],
    kick: b => (b === 3 || b === 15 ? OFF : b === 12 || b === 13 ? 'x.......x.......' : 'x...x...x...x...'), kickDrive: true,
    clap: b => (b === 0 || b === 3 || b >= 12 ? OFF : '....x.......x...'),
    hatO: b => (b < 3 || (b >= 4 && b <= 11) ? '..x...x...x...x.' : OFF),
    hatC: b => (b >= 4 && b <= 11 ? 'xxxxxxxxxxxxxxxx' : b < 2 ? 'x.x.x.x.x.x.x.x.' : OFF),
    build: [2, 3, 14, 15], riser: [2, 14], riserBars: 2, impact: [4], crash: [4, 8],
    hpf: b => ({ 2: 300, 3: 1500, 14: 300, 15: 1500 })[b] || 20,
    bass: { notes: pump(['A1', 'F1', 'C2', 'G1']), cutoff: [1400, 300], q: 3, vol: 0.3, sub: true, on: b => b !== 3 && b !== 15 && (b < 12 || b > 13) },
    stab: { rhythm: b => (b >= 4 && b <= 11 ? '..x..x..x..x.x..' : '..x...x...x...x.'), cutoff: [5200, 900], vol: 0.13, fx: 0.25, on: b => b < 12 },
    pad: { vol: 0.055, cutoff: 2400, on: b => b >= 12 },
    lead: { notes: [...rests(64), ...TITLE_HOOK, ...TITLE_HOOK.slice(0, 32), ...rests(32)], supersaw: true, octave: true, cutoff: 6000, vol: 0.085, fx: 0.35, on: b => b >= 4 && b <= 13 },
    arp: { rhythm: 'x.xxx.xxx.xxx.xx', oct: 1, cutoff: 2600, vol: 0.03, wave: 'sawtooth', on: b => b < 4 || b >= 12 },
  },
  // A tense minimal tech-house groove under the phone call and the rival's radio trash talk.
  brief: {
    title: 'Dispatch', genre: 'Minimal tech house', where: 'Job briefing (the customer calls, Northwest cuts in)',
    bpm: 126, bars: 4, entry: true, chords: [Dmin, Dmin, Bb, A7],
    kick: 'x...x...x...x...', kickVol: 0.8, clap: '....x.......x...', clapVol: 0.32, hatC: '.xxx.xxx.xxx.xxx', hatO: '..x...x...x...x.', rim: '..x..x.....x..x.',
    bass: { notes: bars('D2 . D2 . . D2 . D3 . D2 . . D2 . F2 .', 'D2 . D2 . . D2 . D3 . D2 . . C3 . A2 .', 'A#1 . A#1 . . A#1 . A#2 . A#1 . . A#1 . D2 .', 'A1 . A1 . . A1 . A2 . A1 . . C#2 . E2 .'), cutoff: [900, 220], q: 7, vol: 0.28 },
    stab: { rhythm: '...x.......x..x.', cutoff: [2200, 400], vol: 0.07, short: true, fx: 0.4 },
    acid: { notes: times(4, bar('D3 . . D4 . . A3 . D3 . F3 . . A3 C4 .')), sweep: [260, 1800], period: 4, q: 11, vol: 0.05 },
  },
  // Psytrance: rolling bass, acid, trippy arp, snare build every 8 bars, supersaw hook in bars 5-8.
  drive: {
    title: 'Van Chase', genre: 'Psytrance', where: 'The race to the job (from GO!)',
    bpm: 142, bars: 8, entry: true, chords: [Em, Em, Em, Em, Cm, Cm, Dm, B7],
    kick: 'x...x...x...x...', kickDrive: true, clap: '....x.......x...', clapVol: 0.35, hatO: '..x...x...x...x.', hatC: 'xxxxxxxxxxxxxxxx', build: [7], crashEvery: 8,
    bass: { notes: roll(['E2', 'E2', 'E2', 'E2', 'C2', 'C2', 'D2', 'B1']), cutoff: [1400, 260], q: 4, vol: 0.3, short: true },
    acid: { notes: times(4, bar('E3 . E4 E3 G3 . A#3 E3 . F3 E3 E4 . G3 B3 E3')).concat(times(4, bar('E3 E3 . E4 . G3 A#3 . B3 . E4 . F3 E3 . D4'))), sweep: [280, 3400], period: 4, q: 13, vol: 0.085 },
    arp: { rhythm: 'x.xxx.xxx.xxx.xx', oct: 1, cutoff: 2400, vol: 0.035, wave: 'sawtooth' },
    lead: { notes: [...rests(64), ...bars('E5 . E5 . G5 - E5 . B5 - - . A5 . G5 .', 'G5 - - . F#5 . E5 . C5 - - - E5 - G5 -', 'F#5 - - . E5 . D5 . A4 - - . D5 . F#5 .', 'D#5 - - - F#5 - - - B5 - - - A5 . F#5 .')], supersaw: true, cutoff: 4600, vol: 0.065, fx: 0.3 },
  },
  // Tech house: shuffled hats, rimshots, Dm7 stabs, a funky bassline and a delayed pluck hook.
  repair: {
    title: 'On the Clock', genre: 'Tech house', where: 'Every repair minigame',
    bpm: 124, bars: 4, chords: [['D4', 'F4', 'A4', 'C5'], ['D4', 'F4', 'A4', 'C5'], ['A#3', 'D4', 'F4', 'A4'], ['C4', 'E4', 'G4', 'A#4']],
    kick: 'x...x...x...x...', clap: '....x.......x...', hatO: '..x...x...x...x.', hatC: '.x.xx.x..x.xx.x.', rim: '...x......x....x', crashEvery: 4,
    bass: { notes: bars('D2 . . D2 . . D3 . . D2 . F2 . G2 A2 .', 'D2 . . D2 . . D3 . . D2 . C3 . A2 F2 .', 'A#1 . . A#1 . . A#2 . . A#1 . D2 . F2 A#1 .', 'C2 . . C2 . . C3 . . C2 . E2 . G2 A#2 .'), cutoff: [1200, 300], q: 6, vol: 0.3 },
    stab: { rhythm: '..x.....x..x....', cutoff: [3800, 500], vol: 0.09, short: true, fx: 0.3 },
    lead: { notes: bars('. . . . D5 . F5 . . A5 . G5 - F5 D5 .', '. . . . C5 . D5 . . F5 - D5 . C5 A4 .', '. . . . D5 . F5 . . A5 . C6 - A5 G5 .', 'F5 - E5 - D5 - C5 - D5 - - - . . . .'), pluck: true, cutoff: 4200, vol: 0.07, fx: 0.45 },
  },
  // Deep house: warm 7th-chord pads, plucked arp, a soft pluck melody, lots of space.
  map: {
    title: 'Dispatch Map', genre: 'Deep house', where: 'District map, crew select, arriving at the house',
    bpm: 118, bars: 4, chords: [['G3', 'B3', 'D4', 'F#4'], ['E3', 'G3', 'B3', 'D4'], ['C3', 'E3', 'G3', 'B3'], ['D3', 'F#3', 'A3', 'C4']],
    kick: 'x...x...x...x...', kickVol: 0.7, clap: '....x.......x...', clapVol: 0.32, hatO: '..x...x...x...x.', hatC: 'x.x.x.x.x.x.x.x.', hatVol: 0.6,
    bass: { notes: bars('G1 - - . . . G2 . . . G1 . . . D2 .', 'E1 - - . . . E2 . . . E1 . . . B1 .', 'C2 - - . . . C3 . . . C2 . . . G2 .', 'D2 - - . . . D3 . . . D2 . . . A2 .'), cutoff: [800, 250], q: 2, vol: 0.3, sub: true },
    pad: { vol: 0.06, cutoff: 1800 },
    stab: { rhythm: '...x.....x....x.', cutoff: [2400, 500], vol: 0.06, short: true, fx: 0.5 },
    arp: { rhythm: 'x.x.x.x.x.x.x.x.', oct: 1, cutoff: 3200, vol: 0.035, wave: 'sawtooth', updown: true, fx: 0.4 },
    lead: { notes: bars('B4 - - - D5 - - - G5 - - - F#5 - E5 -', 'D5 - - - B4 - - - G4 - - - A4 - B4 -', 'C5 - - - E5 - - - G5 - - - A5 - G5 -', 'F#5 - - - E5 - D5 - A4 - - - - - - -'), pluck: true, cutoff: 3200, vol: 0.075, fx: 0.5 },
  },
  // Sting: a one-bar snare build + riser, then the drop hit. Hands over to "victory".
  win: {
    title: 'Fixed! (sting)', genre: 'Festival drop', where: 'Repair finished / race won (plays once)',
    bpm: 128, bars: 2, once: true, then: 'victory', chords: [G, ['C4', 'E4', 'G4', 'C5']],
    kick: [OFF, 'x...............'], kickDrive: true, build: [0], riser: [0], impact: [1], crash: [1],
    hpf: b => (b === 0 ? 1200 : 20),
    stab: { rhythm: [OFF, 'x...............'], cutoff: [7000, 1500], vol: 0.18, hold: 12, fx: 0.5 },
    lead: { notes: [...rests(16), 'C5', ...Array(15).fill('-')], supersaw: true, octave: true, cutoff: 6000, vol: 0.09, fx: 0.6 },
  },
  // Result screen after a win: euphoric piano house.
  victory: {
    title: 'Five Stars', genre: 'Piano house', where: 'Result screen after a fixed job',
    bpm: 124, bars: 4, entry: true, chords: [['C4', 'E4', 'G4'], ['G3', 'B3', 'D4'], ['A3', 'C4', 'E4'], ['F3', 'A3', 'C4']],
    kick: 'x...x...x...x...', clap: '....x.......x...', hatO: '..x...x...x...x.', hatC: 'x.xxx.xxx.xxx.xx', crashEvery: 4,
    bass: { notes: offbeat(['C2', 'G1', 'A1', 'F1']), cutoff: [1100, 280], q: 2, vol: 0.3, sub: true },
    piano: { rhythm: 'x..x..x...x..x..', vol: 0.11, fx: 0.3 },
    lead: { notes: bars('G5 - - . E5 . G5 . C6 - - . B5 . G5 .', 'B5 - - . A5 . G5 . D5 - - - . . . .', 'C6 - - . B5 . A5 . E5 - - . A5 . C6 .', 'A5 - - - G5 - F5 - C5 - - - . . . .'), pluck: true, cutoff: 5200, vol: 0.06, fx: 0.5 },
  },
  // Sting: the drop falls apart — a tape-stop dive, a sub drop and a downlifter. Hands over to "fired".
  lose: {
    title: "You're Fired (sting)", genre: 'Tape-stop downlifter', where: 'Out of time / van totaled (plays once)',
    bpm: 110, bars: 1, once: true, then: 'fired', chords: [Am],
    kick: 'x.....x.........', kickDrive: true, impact: [0], downlift: [0],
    stab: { rhythm: 'x...............', cutoff: [4000, 200], vol: 0.16, hold: 14, glide: 0.25, fx: 0.5 },
    bass: { notes: ['A1', ...Array(12).fill('-'), '.', '.', '.'], cutoff: [1600, 90], q: 8, vol: 0.34, glide: 0.35 },
  },
  // Result screen after a loss: moody minor deep house, filtered and slow.
  fired: {
    title: 'Northwest Got the Job', genre: 'Moody deep house', where: 'Result screen after getting fired, race lost',
    bpm: 114, bars: 4, chords: [['A3', 'C4', 'E4', 'G4'], ['D3', 'F3', 'A3', 'C4'], ['F3', 'A3', 'C4', 'E4'], ['E3', 'G#3', 'B3', 'D4']],
    kick: 'x...x...x...x...', kickVol: 0.6, clap: '....x.......x...', clapVol: 0.26, hatO: '..x...x...x...x.', hatVol: 0.6,
    bass: { notes: bars('A1 - - . . . A2 . . . A1 . . . E2 .', 'D2 - - . . . D3 . . . D2 . . . A2 .', 'F1 - - . . . F2 . . . F1 . . . C2 .', 'E1 - - . . . E2 . . . E1 . . . G#1 .'), cutoff: [600, 200], q: 2, vol: 0.3, sub: true },
    pad: { vol: 0.06, cutoff: 1100 },
    lead: { notes: bars('E5 - - - . . C5 - - - . . . . . .', 'D5 - - - . . A4 - - - . . . . . .', 'C5 - - - . . A4 - - - . . E5 - . .', 'D5 - - - B4 - - - G#4 - - - . . . .'), pluck: true, cutoff: 2000, vol: 0.06, fx: 0.6 },
  },
  // Big-room anthem with a build every 8 bars.
  finale: {
    title: "G's Country (Finale)", genre: 'Big-room anthem', where: 'Finale / credits',
    bpm: 128, bars: 8, entry: true, chords: [Cmaj, F, G, Cmaj, Am, F, G, G],
    kick: b => (b === 7 ? 'x...x...x.......' : 'x...x...x...x...'), kickDrive: true, clap: '....x.......x...', hatO: '..x...x...x...x.', hatC: 'x.x.x.x.x.x.x.x.', build: [7], riser: [7], impact: [0], crashEvery: 4,
    hpf: b => (b === 7 ? 900 : 20),
    bass: { notes: pump(['C2', 'F1', 'G1', 'C2', 'A1', 'F1', 'G1', 'G1']), cutoff: [1300, 300], q: 3, vol: 0.3, sub: true },
    stab: { rhythm: '..x...x...x...x.', cutoff: [4800, 900], vol: 0.12, fx: 0.25 },
    lead: { notes: bars('C5 - E5 - G5 - C6 - B5 - G5 - E5 - G5 -', 'A5 - - - F5 - A5 - C6 - - - A5 - F5 -', 'G5 - - - E5 - G5 - B5 - - - D6 - B5 -', 'C6 - - - - - - - G5 - E5 - C5 - - -',
      'A5 - C6 - E6 - C6 - A5 - - - E5 - A5 -', 'F5 - A5 - C6 - A5 - F5 - - - C6 - A5 -', 'G5 - B5 - D6 - B5 - G5 - - - B5 - D6 -', 'G5 - - - - - - - . . . . . . . .'), supersaw: true, octave: true, cutoff: 6000, vol: 0.08, fx: 0.35 },
  },
};

// Where step n of a track lands in its pattern: the intro plays once, then it loops from `loopFrom`.
export function stepIndex(tr, n) {
  const len = tr.bars * 16; if (n < len || tr.once) return n;
  const from = (tr.loopFrom || 0) * 16; return from + ((n - len) % (len - from));
}

// ---- the engine -----------------------------------------------------------------------------------
export class DJ {
  constructor(chip) { this.chip = chip; this.track = null; this.timer = null; }
  get ctx() { return this.chip.ctx; }
  ensureBus() {
    if (this.duck) return;
    const c = this.ctx;
    // glue compressor on the whole mix
    this.out = c.createDynamicsCompressor();
    this.out.threshold.value = -16; this.out.knee.value = 8; this.out.ratio.value = 3.5; this.out.attack.value = 0.004; this.out.release.value = 0.14;
    const makeup = c.createGain(); makeup.gain.value = 1.2; this.out.connect(makeup); makeup.connect(this.chip.musicBus);
    // everything but the drums pumps through `duck`, then a sweepable high-pass (for builds)
    this.hp = c.createBiquadFilter(); this.hp.type = 'highpass'; this.hp.frequency.value = 20; this.hp.Q.value = 0.9; this.hp.connect(this.out); this.hpAt = 20;
    this.duck = c.createGain(); this.duck.connect(this.hp);
    this.drums = c.createGain(); this.drums.connect(this.out);
    // reverb (generated stereo impulse) and a dotted-8th delay; both returns pump with the kick
    const rate = c.sampleRate, len = Math.floor(rate * 2.4), ir = c.createBuffer(2, len, rate);
    for (let ch = 0; ch < 2; ch++) { const d = ir.getChannelData(ch); for (let i = 0; i < len; i++) d[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / len, 3.2); }
    this.verb = c.createConvolver(); this.verb.buffer = ir;
    this.verbSend = c.createGain(); this.verbSend.gain.value = 0.5; this.verbSend.connect(this.verb);
    const vr = c.createGain(); vr.gain.value = 0.55; this.verb.connect(vr); vr.connect(this.duck);
    this.delay = c.createDelay(2); this.delay.delayTime.value = 0.35;
    const fb = c.createGain(); fb.gain.value = 0.36; const tone = c.createBiquadFilter(); tone.type = 'lowpass'; tone.frequency.value = 3200;
    this.delaySend = c.createGain(); this.delaySend.connect(this.delay); this.delay.connect(tone); tone.connect(fb); fb.connect(this.delay);
    const dr = c.createGain(); dr.gain.value = 0.5; tone.connect(dr);
    if (c.createStereoPanner) { const p = c.createStereoPanner(); p.pan.value = 0.45; dr.connect(p); p.connect(this.duck); } else dr.connect(this.duck);
  }
  // Prime a track at time t0 (used by play() and by the offline preview renderer).
  cue(tr, t0) {
    this.ensureBus();
    const sd = 60 / tr.bpm / 4;
    this.delay.delayTime.setValueAtTime(sd * 3, t0); // dotted 8th
    this.hp.frequency.cancelScheduledValues(t0); this.hp.frequency.setValueAtTime(20, t0); this.hpAt = 20;
    return sd;
  }
  play(name, chained) {
    if (!this.ctx) return;
    if (this.track && this.track.name === name) return;
    this.stop();
    const tr = TRACKS[name]; if (!tr) return;
    const t0 = this.ctx.currentTime + 0.06, sd = this.cue(tr, t0);
    this.track = { name, tr, step: 0, next: t0, sd, len: tr.bars * 16, entry: tr.entry && !chained };
    this.timer = setInterval(() => this.schedule(), 25);
  }
  // Play `name` once the current sting finishes (or right away if no sting is playing).
  after(name) { if (this.track && this.track.tr.once) this.track.then = name; else this.play(name); }
  stop() { clearInterval(this.timer); this.timer = null; this.track = null; }
  schedule() {
    const T = this.track; if (!T || !this.ctx) return;
    while (T.next < this.ctx.currentTime + 0.14) {
      if (T.tr.once && T.step >= T.len) {
        const next = T.then || T.tr.then, at = T.next; this.stop();
        if (next) { this.play(next, true); if (this.track) this.track.next = Math.max(this.track.next, at); }
        return;
      }
      this.step(T.tr, stepIndex(T.tr, T.step), T.next, T.sd, T.step === 0 && T.entry);
      T.step++; T.next += T.sd;
    }
  }
  pat(p, b) { return typeof p === 'function' ? p(b) : Array.isArray(p) ? p[b % p.length] : p; }
  live(part, b) { return !!part && (!part.on || part.on(b)); }
  step(tr, i, t, sd, entry = false) {
    const b = Math.floor(i / 16), s = i % 16, chord = tr.chords[b % tr.chords.length];
    const hit = p => p && this.pat(p, b)[s] === 'x';
    const at = list => list && list.includes(b) && s === 0;
    if (entry || at(tr.impact)) this.impact(t);
    if (entry || at(tr.crash) || (tr.crashEvery && s === 0 && b % tr.crashEvery === 0 && i > 0)) this.crash(t);
    // high-pass sweep: ramps up across build bars, snaps open on the drop
    if (s === 0 && tr.hpf) {
      const f = tr.hpf(b), h = this.hp.frequency;
      if (f > 20) { h.setValueAtTime(this.hpAt, t); h.exponentialRampToValueAtTime(f, t + sd * 16); this.hpAt = f; } else if (this.hpAt !== 20) { h.setValueAtTime(20, t); this.hpAt = 20; }
    }
    if (hit(tr.kick)) this.kick(t, tr.kickVol || 0.95, tr.kickDrive);
    if (hit(tr.clap)) this.clap(t, tr.clapVol || 0.5);
    const hv = tr.hatVol || 1;
    if (hit(tr.hatC)) this.hat(t, false, (s % 4 === 2 ? 0.14 : 0.08) * hv);
    if (hit(tr.hatO)) this.hat(t, true, 0.13 * hv);
    if (hit(tr.rim)) this.rim(t);
    // snare build: quarters -> 8ths -> 16ths -> 32nds, louder as it goes (runs of 1 or 2 bars)
    if (tr.build && tr.build.includes(b)) {
      const k = tr.build.includes(b - 1) ? 1 : 0, run = k || tr.build.includes(b + 1) ? 2 : 1, p = (k * 16 + s) / (run * 16);
      const every = p < 0.25 ? 4 : p < 0.5 ? 2 : 1;
      if (s % every === 0) this.snare(t, 0.1 + p * 0.35);
      if (p >= 0.75) this.snare(t + sd / 2, 0.1 + p * 0.35);
    }
    if (at(tr.riser)) this.riser(t, sd * 16 * (tr.riserBars || 1));
    if (at(tr.downlift)) this.downlift(t, sd * 16);
    // melodic parts
    const note = (part, fn) => { if (!this.live(part, b)) return; const n = part.notes[i % part.notes.length]; if (!n || n === '.' || n === '-') return; let hold = 1; while (part.notes[(i + hold) % part.notes.length] === '-' && hold < 16) hold++; fn(n, hold * sd); };
    note(tr.bass, (n, d) => { const p = tr.bass; this.synth([hz(n)], t, p.short ? sd * 0.9 : d * 0.92, { wave: 'sawtooth', cutoff: p.cutoff, q: p.q, vol: p.vol, release: 0.03, glide: p.glide }); if (p.sub) this.synth([hz(n) / 2], t, d * 0.9, { wave: 'sine', vol: p.vol * 0.9, release: 0.03 }); });
    note(tr.acid, (n, d) => { const p = tr.acid; const ph = ((b % p.period) * 16 + s) / (p.period * 16); const lfo = 0.5 - 0.5 * Math.cos(ph * Math.PI * 2); const top = p.sweep[0] + (p.sweep[1] - p.sweep[0]) * lfo; this.synth([hz(n)], t, Math.min(d, sd * 1.4), { wave: 'sawtooth', cutoff: [top * 1.6, top * 0.45], q: p.q, vol: p.vol, release: 0.02, fx: 0.15 }); });
    note(tr.lead, (n, d) => {
      const p = tr.lead, fs = p.octave ? [hz(n), hz(n) / 2] : [hz(n)];
      if (p.pluck) this.synth(fs, t, Math.min(d, sd * 3), { detune: [-8, 8], cutoff: [p.cutoff, 300], q: 2, vol: p.vol, release: 0.05, fx: p.fx, spread: 0.5 });
      else this.synth(fs, t, d * 0.95, { detune: p.supersaw ? [-24, -14, -6, 0, 6, 14, 24] : [-7, 7], cutoff: [p.cutoff, p.cutoff * 0.7], vol: p.vol, attack: 0.01, release: 0.1, fx: p.fx, spread: 0.9 });
    });
    if (this.live(tr.stab, b) && this.pat(tr.stab.rhythm, b)[s] === 'x') {
      const p = tr.stab;
      this.synth(chord.map(n => hz(up(n, 1))), t, p.short ? sd * 0.8 : sd * (p.hold || 1.6), { detune: [-16, -5, 5, 16], cutoff: [p.cutoff[0] + 300, p.cutoff[1]], q: 2, vol: p.vol, release: 0.06, fx: p.fx, spread: 0.8, glide: p.glide });
    }
    if (this.live(tr.piano, b) && this.pat(tr.piano.rhythm, b)[s] === 'x') this.piano(chord.map(n => hz(up(n, 1))), t, sd * 2.5, tr.piano);
    if (this.live(tr.pad, b) && s === 0) this.synth(chord.map(hz), t, sd * 16, { detune: [-12, 12], cutoff: [tr.pad.cutoff, tr.pad.cutoff], q: 0.7, vol: tr.pad.vol, attack: sd * 3, release: sd * 3, fx: 0.5, spread: 1 });
    if (this.live(tr.arp, b) && this.pat(tr.arp.rhythm, b)[s] === 'x') {
      const p = tr.arp, tones = [...chord, ...chord.map(n => up(n, 1))], seq = p.updown ? [...tones, ...tones.slice(1, -1).reverse()] : tones;
      this.synth([hz(up(seq[i % seq.length], p.oct))], t, sd * 0.8, { wave: p.wave, cutoff: [p.cutoff, p.cutoff * 0.4], q: 3, vol: p.vol, release: 0.03, fx: p.fx || 0.2 });
    }
  }

  // ---- instruments ------------------------------------------------------------------------------
  // fx = reverb/delay send, spread = stereo width of the detuned voices, glide = pitch multiplier reached
  // by the end of the note (tape-stop / dive).
  synth(freqs, t, dur, { wave = 'sawtooth', detune = [0], cutoff = [4000, 4000], q = 1, vol = 0.1, attack = 0.004, release = 0.06, dest, fx = 0, spread = 0, glide } = {}) {
    const c = this.ctx; const f = c.createBiquadFilter(); f.type = 'lowpass'; f.Q.value = q;
    f.frequency.setValueAtTime(Math.max(40, cutoff[0]), t); f.frequency.exponentialRampToValueAtTime(Math.max(40, cutoff[1]), t + Math.max(0.03, dur * 0.85));
    const g = c.createGain(); const peak = vol / Math.sqrt(freqs.length * detune.length) * (detune.length > 2 ? 1.5 : 1);
    g.gain.setValueAtTime(0.0001, t); g.gain.linearRampToValueAtTime(peak, t + attack);
    g.gain.setValueAtTime(peak, t + Math.max(attack, dur - release)); g.gain.exponentialRampToValueAtTime(0.0001, t + dur + 0.001);
    f.connect(g); g.connect(dest || this.duck);
    if (fx && !dest) { const x = c.createGain(); x.gain.value = fx; g.connect(x); x.connect(this.verbSend); x.connect(this.delaySend); }
    const pan = spread && detune.length > 1 && c.createStereoPanner;
    detune.forEach((dt, k) => {
      let into = f;
      if (pan) { const p = c.createStereoPanner(); p.pan.value = (k / (detune.length - 1) * 2 - 1) * spread; p.connect(f); into = p; }
      for (const fr of freqs) {
        const o = c.createOscillator(); o.type = wave; o.frequency.setValueAtTime(fr, t); o.detune.value = dt;
        if (glide) o.frequency.exponentialRampToValueAtTime(fr * glide, t + dur);
        o.connect(into); o.start(t); o.stop(t + dur + 0.05);
      }
    });
  }
  // House piano: a bright struck chord (triangle body + a square "hammer") with a fast decay.
  piano(freqs, t, dur, { vol = 0.1, fx = 0.3 } = {}) {
    this.synth(freqs, t, dur, { wave: 'triangle', detune: [-4, 4], cutoff: [5000, 1200], vol, release: dur * 0.8, fx, spread: 0.4 });
    this.synth(freqs.map(f => f * 2), t, dur * 0.4, { wave: 'square', cutoff: [3500, 800], vol: vol * 0.25, release: 0.05 });
  }
  noise(t, dur, { type = 'highpass', freq = 7000, q = 0.7, vol = 0.2, freq2, dest, attack = 0.001, fx = 0 } = {}) {
    const c = this.ctx; const s = c.createBufferSource(); s.buffer = this.chip.noise; s.loop = true;
    const f = c.createBiquadFilter(); f.type = type; f.frequency.setValueAtTime(freq, t); f.Q.value = q; if (freq2) f.frequency.exponentialRampToValueAtTime(freq2, t + dur);
    const g = c.createGain(); g.gain.setValueAtTime(0.0001, t); g.gain.linearRampToValueAtTime(vol, t + attack); g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    s.connect(f); f.connect(g); g.connect(dest || this.drums); s.start(t, Math.random()); s.stop(t + dur + 0.02);
    if (fx) { const x = c.createGain(); x.gain.value = fx; g.connect(x); x.connect(this.verbSend); }
    return g;
  }
  kick(t, vol, drive) {
    const c = this.ctx; const o = c.createOscillator(); o.type = 'sine';
    o.frequency.setValueAtTime(drive ? 190 : 165, t); o.frequency.exponentialRampToValueAtTime(drive ? 46 : 44, t + (drive ? 0.09 : 0.11));
    const g = c.createGain(); g.gain.setValueAtTime(vol, t); g.gain.exponentialRampToValueAtTime(0.0001, t + (drive ? 0.42 : 0.34));
    o.connect(g); g.connect(this.drums); o.start(t); o.stop(t + 0.45);
    if (drive) { // big-room "tok": a short, bright mid layer on top
      const o2 = c.createOscillator(); o2.type = 'triangle'; o2.frequency.setValueAtTime(420, t); o2.frequency.exponentialRampToValueAtTime(90, t + 0.05);
      const g2 = c.createGain(); g2.gain.setValueAtTime(vol * 0.35, t); g2.gain.exponentialRampToValueAtTime(0.0001, t + 0.07);
      o2.connect(g2); g2.connect(this.drums); o2.start(t); o2.stop(t + 0.08);
    }
    this.noise(t, 0.012, { freq: 3000, vol: 0.2 }); // beater click
    // sidechain pump: duck everything else under the kick
    const d = this.duck.gain; d.cancelScheduledValues(t); d.setValueAtTime(0.3, t); d.linearRampToValueAtTime(1, t + 0.2);
  }
  clap(t, vol) {
    for (const k of [0, 0.011, 0.022]) this.noise(t + k, 0.02, { type: 'bandpass', freq: 1300, q: 0.9, vol });
    this.noise(t + 0.03, 0.2, { type: 'bandpass', freq: 1150, q: 0.8, vol: vol * 0.55, fx: 0.35 });
  }
  snare(t, vol) { this.noise(t, 0.13, { type: 'bandpass', freq: 1900, q: 0.6, vol, fx: 0.2 }); this.synth([190], t, 0.06, { wave: 'triangle', vol: vol * 0.5, dest: this.drums }); }
  hat(t, open, vol) { this.noise(t, open ? 0.2 : 0.035, { freq: open ? 6500 : 8500, vol }); }
  rim(t) { this.synth([820], t, 0.03, { wave: 'square', cutoff: [3000, 1500], vol: 0.06, dest: this.drums }); }
  crash(t) { this.noise(t, 1.6, { freq: 4500, vol: 0.17, fx: 0.4 }); }
  riser(t, dur) { this.noise(t, dur, { type: 'bandpass', freq: 300, freq2: 9000, q: 2, vol: 0.26, attack: dur * 0.9, fx: 0.3 }); }
  downlift(t, dur) { this.noise(t, dur, { type: 'bandpass', freq: 7000, freq2: 200, q: 1.5, vol: 0.22, fx: 0.5 }); }
  // The drop hit: a sub boom diving down plus a wide noise burst.
  impact(t) {
    const c = this.ctx; const o = c.createOscillator(); o.type = 'sine';
    o.frequency.setValueAtTime(110, t); o.frequency.exponentialRampToValueAtTime(32, t + 0.9);
    const g = c.createGain(); g.gain.setValueAtTime(0.7, t); g.gain.exponentialRampToValueAtTime(0.0001, t + 1.1);
    o.connect(g); g.connect(this.drums); o.start(t); o.stop(t + 1.15);
    this.noise(t, 0.6, { type: 'lowpass', freq: 5000, freq2: 300, vol: 0.2, fx: 0.6 });
  }
}
