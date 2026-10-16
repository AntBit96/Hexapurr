// The body plan every mind agrees on. No mind sees the finished cat; each one only
// knows the coordinates of the part it is responsible for.
import { catmullRom, inEllipse, inPolygon } from './geometry.js';

export const WIDTH = 78;
export const HEIGHT = 38;

export const HEAD = { cx: 28, cy: 13, rx: 13, ry: 6.5 };

export const EARS = [
  [[16, 10], [19, 2.5], [25, 7.5]],
  [[31, 7.5], [37, 2.5], [40, 10]],
];

export const EYES = [[22, 13], [34, 13]];
export const MOUTH = [28, 16];

export const WHISKERS = [
  [[14, 13], [8, 12]],
  [[14, 14], [7, 14]],
  [[14, 15], [8, 16]],
  [[42, 13], [48, 12]],
  [[42, 14], [49, 14]],
  [[42, 15], [48, 16]],
];

export const BODY = { cx: 28, top: 19, bottom: 30 };

export const PAWS = [
  { x0: 17, x1: 25, y0: 31, y1: 32 },
  { x0: 31, x1: 39, y0: 31, y1: 32 },
];

export const TAIL_PATH = [
  [43, 29], [50, 27.5], [56, 24], [60, 18], [62, 12.5], [61, 7],
  [57, 3.6], [51, 3.2], [47, 5.5], [47, 9], [50.5, 10.5],
];

// How much of TAIL_PATH the thin step-3 tail covers before step 4 takes over.
export const THIN_TAIL_END = 0.36;

export const SPIRAL = { cx: 46, cy: 22, turns: 2.25, radius: 3.2 };

export const CHEST = { y0: 20, y1: 22, halfWidth: 5 };
export const SIGIL = [28, 24];
export const COMPASS = [28, 0];
export const HORIZON_Y = 34;
export const TITLE_Y = 36;
export const TITLE_CX = 39;

export const STARS = [
  [5, 4, '+'], [11, 9, '✦'], [3, 19, '+'], [9, 25, '✦'], [6, 31, '+'],
  [70, 4, '✦'], [73, 13, '+'], [69, 21, '+'], [72, 28, '✦'], [44, 0, '+'],
  [13, 1, '+'], [51, 16, '✦'], [66, 33, '+'],
];

export function inHead(x, y) {
  return inEllipse(x, y, HEAD) || EARS.some((ear) => inPolygon(x, y, ear));
}

export function bodyHalfWidth(y) {
  const t = Math.min(1, Math.max(0, (y - BODY.top) / (BODY.bottom - BODY.top)));
  return 6 + 7 * t ** 0.8;
}

export function inBody(x, y) {
  return y >= BODY.top && y <= BODY.bottom && Math.abs(x - BODY.cx) <= bodyHalfWidth(y);
}

export function bodyEdgeX(y, side) {
  return Math.round(BODY.cx + side * bodyHalfWidth(y));
}

export function inPaws(x, y) {
  return PAWS.some((p) => x >= p.x0 && x <= p.x1 && y >= p.y0 && y <= p.y1);
}

export const tailSamples = catmullRom(TAIL_PATH, 40);

export function tailRadius(t) {
  return 0.7 + 2.1 * Math.sin(Math.PI * Math.min(t, 0.92));
}

const TAIL_ASPECT = 1.8;

let tailField = null;

// For every cell: how deep inside the plume it sits (0 = centreline, 1 = rim) and how far along it is.
function buildTailField() {
  const depth = new Float32Array(WIDTH * HEIGHT).fill(Infinity);
  const along = new Float32Array(WIDTH * HEIGHT);
  for (const s of tailSamples) {
    const r = tailRadius(s.t);
    const rx = r * TAIL_ASPECT;
    for (let y = Math.floor(s.y - r); y <= Math.ceil(s.y + r); y++) {
      for (let x = Math.floor(s.x - rx); x <= Math.ceil(s.x + rx); x++) {
        if (x < 0 || y < 0 || x >= WIDTH || y >= HEIGHT) continue;
        if (y >= BODY.top - 1 && y <= BODY.bottom + 2 && x <= bodyEdgeX(Math.min(y, BODY.bottom), 1) + 1) continue;
        const dx = (x - s.x) / rx;
        const dy = (y - s.y) / r;
        const d = Math.sqrt(dx * dx + dy * dy);
        const i = y * WIDTH + x;
        if (d <= 1 && d < depth[i]) {
          depth[i] = d;
          along[i] = s.t;
        }
      }
    }
  }
  return { depth, along };
}

export function tailAt(x, y) {
  if (x < 0 || y < 0 || x >= WIDTH || y >= HEIGHT) return null;
  tailField ??= buildTailField();
  const i = y * WIDTH + x;
  const depth = tailField.depth[i];
  return depth === Infinity ? null : { depth, along: tailField.along[i] };
}

export function inTail(x, y) {
  return tailAt(x, y) !== null;
}
