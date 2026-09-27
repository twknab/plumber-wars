// Dev-only: auto-plays every repair job step-by-step to catch broken anchors/gestures.
// Open /?smoke=1 then read window.__smoke.
const sleep = ms => new Promise(res => setTimeout(res, ms));
export async function runSmoke(g, from = 0, to = 15) {
  const out = window.__smoke = [];
  window.addEventListener('error', e => out.push('WINDOW ERROR ' + e.message));
  for (let i = from; i <= to; i++) {
    try { out.push(await playJob(g, i)); } catch (e) { out.push(i + ' THROW ' + e.message); }
  }
  out.push('DONE');
}
async function playJob(g, i) {
  g.scene.getScenes(true).forEach(s => g.scene.stop(s.sys.settings.key));
  g.scene.start('Repair', { job: i, secs: 999 });
  await sleep(300);
  const r = g.scene.getScene('Repair'); r.time.timeScale = 10; r.tweens.timeScale = 10;
  const log = [];
  for (let guard = 0; guard < 300 && !r.over; guard++) {
    await sleep(30);
    if (r.phase === 'choose') { r.choose(r.step.t, false); continue; }
    if (r.phase !== 'tool') continue;
    const s = r.step; const slot = r.slots.find(x => x.k === s.tool);
    if (!slot) { log.push('NO SLOT ' + s.tool); break; }
    r.pickTool(s.tool, slot.bg);
    const a = r.anchor(s.target || s.to); const P = ang => ({ id: 1, isDown: true, x: a.x + Math.cos(ang) * 30, y: a.y + Math.sin(ang) * 30 });
    const t0 = r.si;
    try {
      if (s.type === 'turn' || s.type === 'crank') { let ang = 0; r.onDown(P(0)); for (let k = 0; k < 800 && r.phase === 'act'; k++) { if (r.act && r.act.jam) { await sleep(80); r.onDown(P(ang)); continue; } ang += (s.dir || 1) * 0.2; r.onMove(P(ang)); } }
      if (s.type === 'dial') { let ang = 0; r.onDown(P(0)); const [lo, hi] = r.zone(); for (let k = 0; k < 300 && r.phase === 'act' && r.act.v < (lo + hi) / 2; k++) { ang += 0.1; r.onMove(P(ang)); } for (let k = 0; k < 100 && r.phase === 'act'; k++) await sleep(20); }
      if (s.type === 'rhythm') { for (let k = 0; k < 400 && r.phase === 'act'; k++) { await sleep(8); const A = r.act; if (A && Math.abs(A.m - A.z) < A.zw / 2 * 0.5) r.onDown({ id: 1, x: a.x, y: a.y }); } }
      if (s.type === 'hold') { r.onDown({ id: 1, x: a.x, y: a.y }); const [lo, hi] = r.zone(); for (let k = 0; k < 400 && r.act && r.act.v < (lo + hi) / 2; k++) await sleep(4); r.onUp({ id: 1 }); }
      if (s.type === 'drag') { const c = r.cursor; r.onDown({ id: 1, x: c.x, y: c.y }); r.onMove({ id: 1, isDown: true, x: a.x, y: a.y + 10 }); r.onUp({ id: 1 }); }
      if (s.type === 'pull') { r.onDown({ id: 1, x: a.x, y: a.y }); for (let k = 1; k <= 12 && r.phase === 'act'; k++) r.onMove({ id: 1, isDown: true, x: a.x + s.dir[0] * s.dist * k / 10, y: a.y + s.dir[1] * s.dist * k / 10 }); }
      if (s.type === 'scrub') { r.onDown({ id: 1, x: a.x - 10, y: a.y }); for (let k = 0; k < 600 && r.phase === 'act'; k++) r.onMove({ id: 1, isDown: true, x: a.x + (k % 2 ? 12 : -12), y: a.y }); }
      if (s.type === 'taps') { for (const sp of [...r.spots]) sp.emit('pointerdown'); }
      if (s.type === 'tap') r.onDown({ id: 1, x: a.x, y: a.y });
    } catch (e) { log.push('ERR step ' + t0 + ' ' + s.type + ': ' + e.message); break; }
    await sleep(40);
    if (r.phase === 'act') { log.push(`STUCK ${t0} ${s.type} ${s.t}`); r.completeStep(); }
  }
  return `${i} ${r.job.title}: over=${r.over} si=${r.si}/${r.job.steps.length} mist=${r.mistakes} ${log.join(' | ')}`;
}
