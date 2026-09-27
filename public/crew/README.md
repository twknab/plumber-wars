# Real-crew sprites (Dalton, Milan, Jared)

The game ships with procedurally drawn pixel portraits. Drop in art generated from real photos
and it replaces them automatically — no code changes.

## Files per person (PNG, transparent background, no anti-aliasing)

| File | Size | What |
|---|---|---|
| `<id>_happy.png` | 48x48 | Head & shoulders, smiling (required — used as fallback for every mood) |
| `<id>_smug.png` | 48x48 | Confident smirk (crew select, briefings) |
| `<id>_neutral.png` | 48x48 | Straight face |
| `<id>_worried.png` | 48x48 | Worried |
| `<id>_angry.png` | 48x48 | Angry |
| `<id>_yell.png` | 48x48 | Mouth open yelling |
| `<id>_body.png` | 32x30 | Tiny full-body sprite sheet: two 16x30 frames side by side (idle, waving) |

`<id>` is `dalton`, `milan`, or `jared`. Then list what you added in `manifest.json`:

```json
{ "dalton": { "portraits": ["happy", "smug", "yell"], "body": true } }
```

## Prompt for Gemini / Venice / etc.

> Convert this photo into a 48x48 pixel-art portrait in the style of a late-90s 16-bit SNES/Genesis
> game (Mega Man X dialog portrait). Head and shoulders, facing slightly left, 3/4 view. Limited
> palette of ~16 colors, 1-pixel dark outline (#181425), hard pixels, no anti-aliasing, no gradients,
> transparent background. Wearing a white t-shirt with a small round green "G'S" patch on the chest, plus <HAT/HAIR DETAILS>.
> Expression: <happy / smug / worried / angry / yelling>.

Outfits so they match the game (all wear white tees with a green G's patch):
- **Dalton**: black cap facing forward, short haircut, short beard, brown eyes, black pants.
- **Milan**: dark red stocking cap, long black hair in a ponytail, clean-shaven, brown eyes, dark red pants.
- **Jared**: navy cap facing forward, smoky blonde hair, blue eyes, navy pants, stockier build.

Generators usually output large images — downscale to exactly 48x48 with **nearest-neighbor**
(e.g. `magick in.png -filter point -resize 48x48 dalton_happy.png`) and check the edges are crisp.
