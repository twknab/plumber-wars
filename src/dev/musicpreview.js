// Dev-only: renders each soundtrack offline (no speakers needed) to preview/<track>.wav and reports
// peak/RMS levels so the mix can be checked. Open /?music=1 on the dev server.
import { DJ, TRACKS, stepIndex } from '../core/music.js';

function wav(buf) {
  const ch = buf.numberOfChannels, len = buf.length, rate = buf.sampleRate;
  const out = new DataView(new ArrayBuffer(44 + len * ch * 2));
  const str = (o, s) => [...s].forEach((c, i) => out.setUint8(o + i, c.charCodeAt(0)));
  str(0, 'RIFF'); out.setUint32(4, 36 + len * ch * 2, true); str(8, 'WAVEfmt '); out.setUint32(16, 16, true); out.setUint16(20, 1, true);
  out.setUint16(22, ch, true); out.setUint32(24, rate, true); out.setUint32(28, rate * ch * 2, true); out.setUint16(32, ch * 2, true); out.setUint16(34, 16, true);
  str(36, 'data'); out.setUint32(40, len * ch * 2, true);
  const data = [...Array(ch)].map((_, c) => buf.getChannelData(c));
  let o = 44; for (let i = 0; i < len; i++) for (let c = 0; c < ch; c++) { const v = Math.max(-1, Math.min(1, data[c][i])); out.setInt16(o, v < 0 ? v * 0x8000 : v * 0x7fff, true); o += 2; }
  return new Blob([out], { type: 'audio/wav' });
}

export async function render(name, seconds, save = true) {
  const tr = TRACKS[name]; const rate = 44100; const sd = 60 / tr.bpm / 4;
  const steps = tr.once ? tr.bars * 16 : Math.max(tr.bars * 16, Math.ceil(seconds / sd));
  const len = Math.ceil((steps * sd + 2.5) * rate);
  const ctx = new OfflineAudioContext(2, len, rate);
  const master = ctx.createGain(); master.gain.value = 0.55; master.connect(ctx.destination);
  const musicBus = ctx.createGain(); musicBus.gain.value = 0.5; musicBus.connect(master);
  const nb = ctx.createBuffer(1, rate, rate); const d = nb.getChannelData(0); for (let i = 0; i < rate; i++) d[i] = Math.random() * 2 - 1;
  const dj = new DJ({ ctx, musicBus, noise: nb }); dj.cue(tr, 0.05);
  for (let i = 0; i < steps; i++) dj.step(tr, stepIndex(tr, i), 0.05 + i * sd, sd, i === 0 && tr.entry);
  const buf = await ctx.startRendering();
  let peak = 0, sum = 0, n = 0;
  for (let c = 0; c < 2; c++) { const ch = buf.getChannelData(c); for (let i = 0; i < ch.length; i++) { const a = Math.abs(ch[i]); if (a > peak) peak = a; sum += ch[i] * ch[i]; n++; } }
  const blob = wav(buf);
  if (save) await fetch(`/__save?path=preview/${name}.wav`, { method: 'POST', body: blob });
  return { name, bpm: tr.bpm, seconds: +(buf.length / rate).toFixed(1), peak: +peak.toFixed(3), rms: +Math.sqrt(sum / n).toFixed(3) };
}

export async function renderAll(seconds = 32) {
  const out = [];
  for (const name of Object.keys(TRACKS)) out.push(await render(name, seconds));
  window.__music = out; return out;
}
