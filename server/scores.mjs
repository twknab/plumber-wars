// Leaderboard rules, shared by the server and the tests.
// A score is the sum of the player's best score on each of the 16 jobs (see progress.totalScore()).
export const TOP_N = 10;
export const JOBS = 16;
export const MAX_JOB = 5000; // a perfect job lands around 3,500-4,000; anything above this is not a real run
const HEROES = ['dalton', 'milan', 'jared'];
// Arcade initials: three letters. The game is crude on purpose, but nothing hateful goes on the board.
const BLOCK = new Set(['KKK', 'NIG', 'NGR', 'FAG', 'FGT', 'KYK', 'KIK', 'SPK', 'CHK', 'JAP', 'WOP', 'GOK', 'COC', 'RAP', 'NAZ', 'SS1', 'HTL']);

export function cleanInitials(s) { return String(s || '').toUpperCase().replace(/[^A-Z]/g, '').slice(0, 3); }

export function validateEntry(body) {
  if (!body || typeof body !== 'object') return { error: 'bad entry' };
  const initials = cleanInitials(body.initials);
  if (initials.length !== 3) return { error: 'initials must be 3 letters' };
  if (BLOCK.has(initials)) return { error: 'pick different initials' };
  const bests = body.bests;
  if (!Array.isArray(bests) || bests.length !== JOBS || !bests.every(n => Number.isInteger(n) && n >= 0 && n <= MAX_JOB)) return { error: 'bad scores' };
  const score = bests.reduce((a, b) => a + b, 0);
  if (score <= 0) return { error: 'finish a job first' };
  const cleared = bests.filter(n => n > 0).length;
  const hero = HEROES.includes(body.hero) ? body.hero : '';
  // one row per player: a random id the game keeps in local storage (replays update your row, not add rows)
  const player = typeof body.player === 'string' && /^[a-z0-9]{12,40}$/.test(body.player) ? body.player : null;
  return { initials, score, cleared, hero, player };
}
