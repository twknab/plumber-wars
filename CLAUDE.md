# Plumber Wars — working rules

Mobile-first Phaser 3 game (portrait, 270px-wide pixel canvas). All art and audio are generated in code
(`src/art/*`, `src/core/pixel.js`, `src/core/audio.js`); game content lives in `src/data/content.js` and
`src/data/jobs.js`.

## Keep the docs in sync with the game design (always)

Whenever a change touches game design — jobs, districts, levels, characters, controls, mechanics, branding,
art or deploy — update these in the same change:

1. **About screen** (`src/scenes/About.js`): job count ("FIX N REAL …"), districts/bonus levels, crew and credits.
2. **README.md**: feature list, the jobs table (one row per district, jobs separated by ` · `), the "**N jobs**"
   count, controls table, dev helpers.
3. **Generated images** — if anything visual or any character changed, regenerate them on the dev server in a
   phone-sized window (375×812):
   - `/?docs=1` → `docs/logo.png`, `docs/sprites.png` (sprite sheet of every character, vehicle, tool, house),
     `docs/homies.png` (crew character sheet), `docs/district-intros.png` (every intro screen), `docs/shot-*.png`,
     and `docs/sprites.hash`.
   - `/?og=1` → `public/og.png` (link-preview card).
   New characters/sprites must also be added to the sprite sheet in `src/dev/docs.js`.

4. **Voices**: any new or edited spoken line (`TRASH`, hero `barks`, `VOICE_EXTRA` in `src/data/content.js`) must be
   recorded: `node scripts/voices.mjs` (Google Cloud TTS, Chirp 3 HD; only renders missing lines).
5. **Cast assets**: `/?assets=1` re-exports every character/house to `docs/assets/` (used by the cast review page).
6. **How to Play** (`src/scenes/HowTo.js`): update it when controls, mechanics or saving change.
8. **District art**: new/changed district photos go through `scripts/districts.mjs` + `/?districts=1`; keep the
   README credits table in sync with `public/districts/credits.json` (CC licenses require attribution).
7. **Reviews**: every job needs its own lines in `JOB_REVIEWS` (`src/data/reviews.js`); a test enforces it.

`npm test` enforces this (`tests/docs-sync.test.js`): it fails if the README/About job counts or job table drift
from `JOBS`, if art/character sources changed since `docs/sprites.png` was last generated, or if any spoken line
has no recorded clip. `tests/voice.test.js` guards that voices play on the very first tap (no browser-speech
fallback while the voice list is still loading), that audio unlocks on pointerup (phones ignore touch-start),
and that a line spoken while audio is locked is dropped rather than played late. Never unlock on pointerdown.

## Other conventions

- **Phaser reuses scene instances.** Any per-visit flag (`left`, `leaving`, `used`, timers, object refs) must be
  reset in `init()`/`create()`, or the second visit silently breaks (dead buttons, frozen transitions).

- Keyboard *and* touch for every action; key hints only on non-touch devices (`isTouch`).
- Trash talk is deliberately NSFW (crude, profane, plumbing/bathroom humor) — no slurs or hate.
- Roast behaviors and archetypes (tech bros, frat bros, preppers, Northwest), never identity. No jokes about
  wigs, weaves, extensions, dreads, afros or hair texture, or anything that reads as racial. Drain clogs are fine.
- Real-crew photo sprites drop into `public/crew/` (see its README); don't hardcode around them.
- Deploy: `bash deploy/deploy.sh` (Cloud Run, public, scale-to-zero).
- Leaderboard: `server/server.mjs` (static + `/api/scores`, Firestore over REST, no npm deps in the runtime
  image). Validation rules live in `server/scores.mjs` and are tested; the Vite dev server mocks the API.
