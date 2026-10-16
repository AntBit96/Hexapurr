# HEXAPURR engine: architecture

The `hexapurr` package re-runs the six-model relay as code. Six small agents ("minds") take turns drawing on one shared ASCII canvas, in the same order as the original run. Each one sees only the canvas it is handed and the part of the body plan it is responsible for.

The minds are deterministic programs named after the models that drew each step. They do **not** call any AI API. The original relay images in [`images/`](../images/) were made by the real models; the engine is a reproducible tribute to that run.

## Flow

```text
             ┌────────────────────── shared Canvas (78 x 38 cells) ──────────────────────┐
 seed ──► runRelay ──► Line ──► Fur ──► Form ──► Motion ──► Glyph ──► Light ──► final frame
             │         OpenAI   Grok    Claude   Gemini    Meta AI   NVIDIA
             │           │        │       │        │         │         │
             └──── audit() after every step: count added/restyled cells, reject erasures,
                   hash the frame (SHA-256), append to the ledger
```

## Modules

| Path | Role |
| --- | --- |
| `src/canvas.js` | `Canvas` (characters, owner per cell, glow flags) and `Pen`, a handle that signs every stroke with the step number of the mind holding it |
| `src/anatomy.js` | The body plan: head ellipse, ears, whiskers, bell body, paws, tail path and the precomputed tail field |
| `src/geometry.js` | Ellipse/polygon tests, Bresenham lines, Catmull-Rom curves, outline extraction with outward normals |
| `src/texture.js` | The fur language (`@ # %`), the rune set, and the functions that pick a character from depth inside a shape |
| `src/random.js` | Seeded PRNG so a given seed always produces the same cat |
| `src/minds/*.js` | One file per mind, each a `defineMind({...})` with metadata and a `draw(pen, ctx)` function |
| `src/relay.js` | `runRelay()`, the relay rule (`audit`) and the per-step ledger |
| `src/render/terminal.js` | Plain and ANSI terminal output, the blame view, progress bars |
| `src/render/svg.js` | SVG output, optionally coloured by mind |
| `bin/hexapurr.js` | The CLI |

## The relay rule

The original prompt said each model must keep what was already drawn and add to it. The engine enforces this in `audit()`:

- A cell that was **blank** and is now filled counts as **added**.
- A cell that was **filled** and now holds a different character counts as **restyled**. This is allowed, because Meta AI's step rewrote the texture and NVIDIA's step brought the fur back.
- A cell that was **filled** and is now **blank** is an **erasure**. Any erasure throws `RelayViolation` and stops the relay.

The silhouette can only grow. `test/relay.test.js` checks this for every pair of consecutive frames and includes a deliberately rogue mind to prove the guard works.

## The ledger

Every step records:

| Field | Meaning |
| --- | --- |
| `added` | Cells this mind filled for the first time |
| `restyled` | Filled cells this mind changed |
| `filled` | Total filled cells after this step |
| `sha256` | Hash of the frame's text, so any change to a mind shows up as a new hash |
| `owns` / `ownedShare` | Cells this mind still owns in the **final** frame |

Every mind's nominal share is 16.6%. The measured `ownedShare` is usually different, because later minds restyle earlier work. Grok's fur, for example, is partly overwritten by Meta AI's runes and NVIDIA's eyes. The ledger reports the measured number as it is.

## Writing a mind

```js
import { defineMind } from 'hexapurr';

export default defineMind({
  step: 7,
  key: 'echo',
  mind: 'Echo',
  company: 'You',
  family: 'Your model',
  role: 'the echo',
  lives: 'the reflection on the ground',
  question: 'What does it leave behind?',
  answer: 'A reflection',
  draw(pen, { rng, before }) {
    pen.fill(10, 35, '~');
  },
});
```

Pass it with the others: `runRelay({ minds: [...MINDS, echo] })`. Use `pen.fill` to draw only on blank cells, or `pen.put` to restyle. The relay rejects any stroke that leaves a previously filled cell blank.
