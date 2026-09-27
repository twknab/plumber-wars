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
     `docs/shot-*.png`, and `docs/sprites.hash`.
   - `/?og=1` → `public/og.png` (link-preview card).
   New characters/sprites must also be added to the sprite sheet in `src/dev/docs.js`.

4. **Voices**: any new or edited spoken line (`TRASH`, hero `barks`, `VOICE_EXTRA` in `src/data/content.js`) must be
   recorded: `node scripts/voices.mjs twk-experiments` (Google Cloud TTS, Chirp 3 HD; only renders missing lines).
5. **Cast assets**: `/?assets=1` re-exports every character/house to `docs/assets/` (used by the cast review page).
6. **How to Play** (`src/scenes/HowTo.js`): update it when controls, mechanics or saving change.

`npm test` enforces this (`tests/docs-sync.test.js`): it fails if the README/About job counts or job table drift
from `JOBS`, if art/character sources changed since `docs/sprites.png` was last generated, or if any spoken line
has no recorded clip.

## Other conventions

- Keyboard *and* touch for every action; key hints only on non-touch devices (`isTouch`).
- Trash talk is deliberately NSFW (crude, profane, plumbing/bathroom humor) — no slurs or hate.
- Real-crew photo sprites drop into `public/crew/` (see its README); don't hardcode around them.
- Deploy: `bash deploy/deploy.sh twk-experiments us-west1` (Cloud Run, public, scale-to-zero).
