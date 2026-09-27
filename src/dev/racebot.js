// Dev-only: a "decent human" bot that races every job at fast-forward to prove each race is beatable.
// Open /?racebot=1 on the dev server (runs muted: no tap, so no AudioContext). Results in window.__race.
const LANES = [66, 112, 158, 204];

// Scores each lane by time-to-impact (so fast oncoming cars count as close), predicting sideways drift.
function pickLane(d) {
  const horizon = 1.1; // seconds a reasonably alert human looks ahead
  const cands = [...LANES, 135];
  let best = d.px, bestScore = -Infinity;
  for (const x of cands) {
    let ttcMin = horizon, bonus = 0;
    for (const o of d.objs) {
      if (o.dead) continue;
      const ahead = o.d - d.dist;
      if (ahead < -24) continue;
      const closing = Math.max(40, d.speed - (o.vd || 0));
      const ttc = Math.max(0, ahead) / closing;
      if (ttc > horizon) continue;
      const xAt = o.x + (o.vx || 0) * ttc + (o.tx !== undefined && o.tx !== o.x ? Math.sign(o.tx - o.x) * Math.min(Math.abs(o.tx - o.x), 70 * ttc) : 0);
      if (Math.abs(xAt - x) >= (o.w / 2 + 15)) continue;
      if (o.pickup) { if (o.kind === 'coffee' || (o.kind === 'kit' && d.hp < d.maxHp)) bonus += 0.25; continue; }
      if (o.kind === 'manhole') continue;
      ttcMin = Math.min(ttcMin, ttc);
    }
    const rg = d.rival.d - d.dist;
    if (Math.abs(rg) < 80 && Math.abs(d.rival.x - x) < 32) ttcMin = Math.min(ttcMin, 0.15);
    const score = ttcMin + bonus - Math.abs(x - d.px) * 0.0015;
    if (score > bestScore) { bestScore = score; best = x; }
  }
  return { x: best };
}

async function race(g, job, stepFrame) {
  g.scene.getScenes(true).forEach(s => g.scene.stop(s.sys.settings.key));
  g.scene.start('Drive', { job });
  for (let i = 0; i < 10; i++) stepFrame();
  const d = g.scene.getScene('Drive');
  d.events.off('app-hidden');
  let frames = 0, decide = 0, hits = 0;
  // Hook the prototype once (the scene instance is reused between races), recording into this run.
  const P = Object.getPrototypeOf(d);
  if (!P.__botHooked) {
    P.__botHooked = true;
    const h = P.hit, dm = P.damage;
    P.hit = function (o) { window.__botKind = o.oncoming ? 'oncoming' : o.kind; const r = h.call(this, o); window.__botKind = null; return r; };
    P.damage = function (n, l) { if (n > 0 && window.__botCauses) { const k = l === 'RAMMED!' ? 'ram' : (window.__botKind || l || '?'); window.__botCauses[k] = (window.__botCauses[k] || 0) + 1; } return dm.call(this, n, l); };
  }
  const causes = window.__botCauses = {};
  while (frames < 20000) {
    stepFrame(); frames++;
    if (d.state === 'race') {
      if (decide-- <= 0) { decide = 6; const { x } = pickLane(d); d.targetX = x; }
      const inLane = d.objs.some(o => !o.dead && !o.pickup && o.kind === 'car' && Math.abs(o.x - d.px) < 22 && o.d - d.dist > 0 && o.d - d.dist < 120);
      if (inLane && d.hornCd <= 0) d.honk();
      const openRoad = !d.objs.some(o => !o.dead && !o.pickup && Math.abs(o.x - d.px) < 24 && o.d - d.dist > 0 && o.d - d.dist < 220);
      if (d.coffee > 0 && d.boost <= 0 && openRoad) d.useBoost();
    }
    if (d.state === 'finish' || d.state === 'done') break;
  }
  const won = d.state === 'finish';
  return { job, won, why: won ? '' : (d.hp <= 0 ? 'wrecked' : 'rival'), secs: Math.round(frames / 60), hits: Object.values(causes).reduce((a, b) => a + b, 0), causes, gap: Math.round(d.dist - d.rival.d) };
}

export async function runRaceBot(g, { jobs = [...Array(16).keys()], tries = 3 } = {}) {
  const q = new URLSearchParams(location.search); if (q.get('jobs')) jobs = q.get('jobs').split(',').map(Number); if (q.get('tries')) tries = +q.get('tries');
  const out = window.__race = [];
  let t = performance.now();
  g.loop.sleep();
  const stepFrame = () => { t += 1000 / 60; g.loop.step(t); };
  for (const job of jobs) {
    const runs = [];
    for (let k = 0; k < tries; k++) { runs.push(await race(g, job, stepFrame)); await new Promise(r => setTimeout(r, 0)); }
    out.push({ job, wins: runs.filter(r => r.won).length, tries, runs });
  }
  out.push('DONE');
  return out;
}
