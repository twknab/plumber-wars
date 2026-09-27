# Plumber Wars — G's Plumbing vs Northwest

A mobile-first, portrait, 16-bit-style arcade game built with Phaser 3. The Cool Homies of **G's Plumbing**
(Dalton, Milan, Jared) race the foul-mouthed **Northwest** crew across Seattle, then fix real plumbing
problems before the customer loses it and calls the competition.

> NSFW: the Northwest guys swear. A lot. (Voices can be switched off on the title screen.)

## The game

- **Pick a lead homie.** Dalton (wheelman: sharper handling, +1 armor), Milan (pipe whisperer: wider timing
  windows, fewer turns), Jared (people person: 30% more customer patience). The other two ride along as
  one-shot assists: *Dalton clears the road*, *Milan auto-fixes a step*, *Jared sweet-talks +12s*.
- **Dispatch.** The customer calls, Northwest cuts in on the CB radio to claim the job.
- **The race** (top-down, Spy Hunter style). Drag anywhere to steer. Beat the Northwest box truck to the house.
  They ram you (watch for the red flash), throw turds / TP / plungers / wrenches at you, and yell obscenities
  over the radio (speech synth). Shove them into curbs and traffic. Grab espresso for BOOST, honk to clear
  your lane. Oncoming traffic from Fremont on; potholes, puddles, oil, cyclists, raccoons, road work.
  You pull up to the actual house at the end.
- **The repair.** Each job is the real sequence a plumber follows. Every step: grab the right tool from the
  truck tray, then do the gesture (circle to turn valves — righty-tighty matters — plunge in rhythm,
  hold for torque, drag parts, pull, scrub, tap leaks). Wrong tools and wrong order cost time and make the
  customer madder. A pro tip explains each real step.
- **15 jobs / 5 districts** — Ballard, Fremont, Capitol Hill, West Seattle, Queen Anne — with rising difficulty:
  longer, faster races; a meaner, faster rival; tighter repair clocks and timing windows; tool hints only in
  Ballard; from Capitol Hill on you must pick the next step yourself.

### The 15 jobs (common Seattle-area calls)

| District | Jobs |
|---|---|
| Ballard | Clogged toilet · Dripping faucet (cartridge) · Slow shower drain (hair) |
| Fremont | Running toilet (flapper) · Grease-clogged kitchen sink (P-trap) · Jammed disposal |
| Capitol Hill | Low water pressure (PRV) · Leaky supply line · Rocking toilet / wax ring |
| West Seattle | No hot water (flush + relight) · Sump pump dead in a storm · Burst pipe from a freeze |
| Queen Anne | Roots in the sewer line · Leaky frost-free hose bib · Seized main shutoff (finale) |

## Art & sound

Everything is generated in code at boot — no image or audio files:

- `src/core/pixel.js` — tiny pixel painter (dithered gradients, lit spheres/cylinders, auto-outlines) on the
  ENDESGA-32 palette.
- `src/art/*` — vehicles, roadside scenery, houses (craftsman, bungalow, victorian, tudor, mansion…),
  repair close-ups, tools, portraits with moods, the G's badge, logo lettering, the Seattle skyline.
- `src/core/audio.js` — chiptune synth (pulse/triangle/noise), 7 music tracks, ~40 SFX, engine drone,
  speech-synth trash talk.

### Real-crew sprites

Drop photo-derived pixel art for Dalton, Milan and Jared into `public/crew/` and list it in
`public/crew/manifest.json` — it replaces the generated portraits with no code changes.
Sizes, file names and a ready-made Gemini/Venice prompt are in [`public/crew/README.md`](public/crew/README.md).

## Develop

```bash
npm install
npm run dev        # http://localhost:5173 — open on your phone via your LAN IP
npm test           # content integrity tests
npm run build
```

Dev helpers: `/?scene=Gallery` (sprite sheets, tap to page), `/?scene=Drive&job=6`, `/?scene=Repair&job=9`,
`/?smoke=1` (auto-plays every repair step of all 15 jobs; results in `window.__smoke`).

## Deploy (Google Cloud Run, project `twk-experiments`)

```bash
gcloud auth login
bash deploy/deploy.sh twk-experiments us-west1
```

Builds the nginx container with Cloud Build, deploys a public, scale-to-zero Cloud Run service, prints the URL
and writes a QR code to `deploy/plumber-wars-qr.png`. (A Terraform alternative lives in `infra/`.)
