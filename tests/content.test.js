import test from 'node:test';
import assert from 'node:assert/strict';
import { JOBS, TOOL_INFO, trayFor } from '../src/data/jobs.js';
import { HEROES, DISTRICTS, difficulty, ORDER } from '../src/data/content.js';

const TYPES = ['turn', 'crank', 'dial', 'rhythm', 'hold', 'drag', 'pull', 'scrub', 'taps', 'tap'];

test('16 jobs in 6 neighborhoods, Alki required before Queen Anne', () => {
  assert.equal(JOBS.length, 16);
  assert.equal(DISTRICTS.length, 6);
  assert.deepEqual([...ORDER].sort((a, b) => a - b), [...JOBS.keys()], 'ORDER plays every job once');
  assert.ok(ORDER.indexOf(15) === ORDER.indexOf(12) - 1, 'Alki comes right before Queen Anne');
  assert.equal(JOBS[15].scene, 'tub');
  JOBS.forEach((j, i) => assert.equal(j.district, Math.floor(i / 3)));
});

test('every step is well formed and its tool is in the tray', () => {
  for (const j of JOBS) {
    const tray = trayFor(j);
    assert.ok(tray.length <= 10, `${j.title} tray too big`);
    for (const s of j.steps) {
      assert.ok(TYPES.includes(s.type), `${j.title}: bad type ${s.type}`);
      assert.ok(TOOL_INFO[s.tool], `${j.title}: unknown tool ${s.tool}`);
      assert.ok(s.item || tray.includes(s.tool), `${j.title}: ${s.tool} missing from tray`);
      assert.ok(s.tip && s.t, `${j.title}: step needs title + tip`);
      if (s.type === 'hold' || s.type === 'dial') assert.ok(s.zone[0] < s.zone[1]);
      if (s.type === 'pull') assert.ok(Array.isArray(s.dir) && s.dist > 0);
      if (s.type === 'drag') assert.ok(s.to);
      else assert.ok(s.target, `${j.title}: ${s.t} needs a target`);
    }
  }
});

test('difficulty ramps up', () => {
  const a = difficulty(0), b = difficulty(14);
  assert.ok(b.raceLength > a.raceLength);
  assert.ok(b.rivalSpeed > a.rivalSpeed);
  assert.ok(b.repairFactor < a.repairFactor);
  assert.ok(b.window < a.window);
  assert.ok(a.toolHints && !b.toolHints);
  assert.ok(!a.stepChoice && b.stepChoice);
});

test('three heroes with unique ids', () => {
  assert.deepEqual(HEROES.map(h => h.id).sort(), ['dalton', 'jared', 'milan']);
});

test('every job has its own customer reviews', async () => {
  const { JOB_REVIEWS, REVIEWS } = await import('../src/data/reviews.js');
  assert.equal(JOB_REVIEWS.length, JOBS.length, 'add JOB_REVIEWS for each job in src/data/reviews.js');
  JOB_REVIEWS.forEach((r, i) => assert.ok(r.length >= 2, `job ${i} needs at least two reviews`));
  assert.ok(REVIEWS.length >= 20);
  assert.equal(new Set([...REVIEWS, ...JOB_REVIEWS.flat()]).size, REVIEWS.length + JOB_REVIEWS.flat().length, 'no duplicate reviews');
});

test('campaign progress: Alki gates Queen Anne, old saves migrate', async () => {
  const { progress, store } = await import('../src/core/save.js');
  progress.reset();
  for (let i = 0; i < 12; i++) progress.complete(i, 2);
  assert.ok(progress.isOpen(15) && !progress.isOpen(12), 'after West Seattle only Alki is open');
  progress.complete(15, 3);
  assert.ok(progress.isOpen(12) && !progress.isOpen(13));
  // an old save (index-based, Alki optional) that skipped Alki gets sent back to it
  store.set('cleared', null); store.set('unlocked', 14); store.set('stars', { 12: 3, 13: 2 });
  assert.equal(progress.unlocked, 12);
  assert.ok(progress.isOpen(15) && !progress.isOpen(12));
  progress.complete(15, 2);
  assert.ok(progress.isOpen(14), 'jobs the old save already starred are skipped');
  progress.reset();
});
