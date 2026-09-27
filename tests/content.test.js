import test from 'node:test';
import assert from 'node:assert/strict';
import { JOBS, TOOL_INFO, trayFor } from '../src/data/jobs.js';
import { HEROES, DISTRICTS, difficulty } from '../src/data/content.js';

const TYPES = ['turn', 'crank', 'dial', 'rhythm', 'hold', 'drag', 'pull', 'scrub', 'taps', 'tap'];

test('15 jobs, 3 per district, 5 districts', () => {
  assert.equal(JOBS.length, 15);
  assert.equal(DISTRICTS.length, 5);
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
