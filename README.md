<p align="center"><img src="docs/logo.png" alt="Plumber Wars - G's Plumbing" width="420"></p>

<p align="center"><b>A mobile-first 16-bit arcade game about Seattle's finest plumbers and their filthy-mouthed rivals.</b><br>
<a href="https://plumber-wars-980128349276.us-west1.run.app">Play it in your browser</a> · built with Phaser 3 · every pixel and chiptune generated in code</p>

<p align="center">
  <img src="docs/shot-title.png" width="200" alt="Title screen: pixel Seattle skyline at sunset with the Space Needle, Mt. Rainier and the G's van">
  <img src="docs/shot-drive.png" width="200" alt="Top-down race against the Northwest truck in the rain">
  <img src="docs/shot-repair.png" width="200" alt="Repair screen: grease-clogged kitchen sink with the truck tool tray">
  <img src="docs/shot-alki.png" width="200" alt="Arriving at Jimmy's Alki Beach apartment">
</p>

The Homies of **G's Plumbing** (Dalton, Milan, Jared) race the foul-mouthed **Northwest** crew across Seattle,
then fix real plumbing problems before the customer loses it and calls the competition.

> **NSFW:** the Northwest guys swear. A lot. Voices can be switched off on the title screen.

## The game

- **Pick a lead homie.** Dalton (wheelman: sharper handling, +1 armor), Milan (pipe whisperer: wider timing
  windows, fewer turns), Jared (people person: 30% more customer patience). The other two ride along as
  one-shot assists: *Dalton clears the road*, *Milan auto-fixes a step*, *Jared sweet-talks +12s*.
- **New here?** Tap **HOW TO PLAY** on the title screen (first-time players see it automatically).
  Progress **saves automatically** after every finished job (lead homie, unlocked jobs, stars) in your browser;
  hit **CONTINUE** to pick up where you left off.
- **Dispatch.** The customer calls, Northwest cuts in on the CB radio to claim the job.
- **The race** (top-down, Spy Hunter style). Beat the Northwest box truck to the house. They ram you (watch for the
  red flash), throw turds / TP / plungers / wrenches, and yell obscenities over the radio (speech synth; the music
  ducks so you hear every word). Shove them into curbs and traffic, grab espresso for BOOST, honk to clear your lane.
  Oncoming traffic from Fremont on; potholes, puddles, oil, cyclists, raccoons, road work. You pull up to the
  actual house at the end.
- **The repair.** Each job is the real sequence a plumber follows. Every step: grab the right tool from the truck
  tray, then do the gesture (circle to turn valves — righty-tighty matters — plunge in rhythm, hold for torque,
  drag parts, pull, scrub, tap leaks). Wrong tools and wrong order cost time and make the customer madder.
  A pro tip explains each real step.
- **16 jobs** — a 15-job campaign across 5 districts (Ballard, Fremont, Capitol Hill, West Seattle, Queen Anne) plus an
  **Alki Beach bonus** at Jimmy's (unlocks with West Seattle). Rising difficulty: longer, faster races; a meaner,
  faster rival; tighter repair clocks and timing windows; tool hints only in Ballard; from Capitol Hill on you
  pick the next step yourself.

### The 16 jobs (common Seattle-area calls)

| District | Jobs |
|---|---|
| Ballard | Clogged toilet · Dripping faucet (cartridge) · Slow shower drain (hair) |
| Fremont | Running toilet (flapper) · Grease-clogged kitchen sink (P-trap) · Jammed disposal |
| Capitol Hill | Low water pressure (PRV) · Leaky supply line · Rocking toilet / wax ring |
| West Seattle | No hot water (flush + relight) · Sump pump dead in a storm · Burst pipe from a freeze |
| Queen Anne | Roots in the sewer line · Leaky frost-free hose bib · Seized main shutoff (finale) |
| Alki Beach (bonus) | Hair-clogged bathroom sink at Jimmy's: pivot nut, pop-up stopper, zip-it, one squirrel acorn |

## Controls (touch or keyboard)

| | Touch | Keyboard |
|---|---|---|
| Menus / dialogs | Tap | Enter / Space (Esc = back/skip) |
| Steer | Drag anywhere | Arrows or A / D |
| Boost | BOOST | Space, W or Up |
| Honk | HONK | H, Shift, S or Down |
| Dalton assist | CLEAR | C |
| Pick tool | Tap tray | 1–0 |
| Pick next step | Tap card | 1–3 |
| Milan / Jared assist | Buttons | Q / E |
| Repair gestures | Finger | Mouse |
| Pause · Sound · Voices | Icons | Esc/P · M · V |

## Art & sound

<p align="center"><img src="docs/sprites.png" width="480" alt="Sprite sheet: the Homies, Northwest, every customer, vehicles, tools and houses"></p>

Everything is generated in code at boot — there are no image or audio asset files:

- `src/core/pixel.js` — a tiny pixel painter (dithered gradients, lit spheres/cylinders, auto-outlines) on the
  ENDESGA-32 palette.
- `src/art/*` — vehicles, roadside scenery, Seattle houses, repair close-ups, tools, portraits with moods, the
  G's badge, logo lettering, the Kerry Park skyline (and an orca).
- `src/core/audio.js` — chiptune synth (pulse/triangle/noise), 7 music tracks, ~40 SFX, engine drone.
- **Voices** — every spoken line is pre-recorded with Google Cloud Text-to-Speech (Chirp 3 HD voices: Big Randy,
  Skeeter and each Homie get their own) into `public/voice/`. Render new/changed lines with
  `node scripts/voices.mjs twk-experiments`; the browser's built-in speech is only a fallback.
  (Browsers never allow sound before the first tap, so the game opens on a TAP TO START screen.)

### Real-crew sprites

Drop photo-derived pixel art for Dalton, Milan and Jared into `public/crew/` and list it in
`public/crew/manifest.json`; it replaces the generated portraits with no code changes.
Sizes, file names and a ready-made Gemini/Venice prompt are in [`public/crew/README.md`](public/crew/README.md).

## Develop

```bash
npm install
npm run dev        # open on your phone via your LAN IP
npm test           # content + docs-sync checks
npm run build
```

Dev helpers (dev server only):

| URL | What it does |
|---|---|
| `/?scene=Gallery` | Browse every sprite (tap to page) |
| `/?scene=Drive&job=6`, `/?scene=Repair&job=9` | Jump straight to a race or repair |
| `/?smoke=1` | Auto-plays every repair step of all 16 jobs (results in `window.__smoke`) |
| `/?docs=1` | Regenerates `docs/` (logo, sprite sheet, screenshots); run it in a phone-sized window |
| `/?og=1` | Regenerates the 1200×630 link-preview card `public/og.png` |
| `/?assets=1` | Exports every character (all moods) and house to `docs/assets/` for the cast page |

`npm test` fails if the README, the About screen, the sprite sheet or the recorded voices drift from the game; see [CLAUDE.md](CLAUDE.md).

## Deploy (Google Cloud Run)

```bash
gcloud auth login
bash deploy/deploy.sh twk-experiments us-west1
```

Builds the nginx container with Cloud Build, deploys a public, scale-to-zero Cloud Run service, prints the URL
and writes a QR code to `deploy/plumber-wars-qr.png`. A Terraform alternative lives in `infra/`.

## Credits & license

Game by [Tim Knab](https://timknab.dev). G's Plumbing and The Homies are a real crew; Northwest is fictional.
The code is MIT licensed; the G's Plumbing name, branding and the crew's names and likenesses are not (see
[LICENSE](LICENSE)).
