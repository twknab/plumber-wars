// Leaderboard rules: only sane entries reach Firestore.
import test from 'node:test';
import assert from 'node:assert/strict';
import { validateEntry, JOBS, MAX_JOB } from '../server/scores.mjs';

const bests = Array.from({ length: JOBS }, (_, i) => (i < 5 ? 3000 : 0));

test('a normal entry: score is the sum of per-job bests, jobs cleared counted', () => {
  const v = validateEntry({ initials: 'tjk', hero: 'milan', bests });
  assert.deepEqual(v, { initials: 'TJK', score: 15000, cleared: 5, hero: 'milan' });
});

test('rejects bad initials, hateful initials and impossible scores', () => {
  assert.ok(validateEntry({ initials: 'AB', bests }).error);
  assert.ok(validateEntry({ initials: 'KKK', bests }).error);
  assert.ok(validateEntry({ initials: 'ABC', bests: bests.slice(1) }).error);
  assert.ok(validateEntry({ initials: 'ABC', bests: bests.map((n, i) => (i ? n : MAX_JOB + 1)) }).error);
  assert.ok(validateEntry({ initials: 'ABC', bests: bests.map(() => 0) }).error, 'needs at least one job');
  assert.ok(validateEntry({ initials: 'ABC', bests: bests.map(n => n + 0.5) }).error);
  assert.equal(validateEntry({ initials: 'ABC', hero: '<script>', bests }).hero, '');
});
