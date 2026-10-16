import { BODY, PAWS, THIN_TAIL_END, bodyEdgeX, tailSamples } from '../anatomy.js';
import { slopeChar } from '../geometry.js';
import { defineMind } from './mind.js';

function firstBlank(canvas, x, y, dir) {
  while (!canvas.isBlank(x, y)) x += dir;
  return x;
}

export default defineMind({
  step: 3,
  key: 'form',
  mind: 'Form',
  company: 'Anthropic',
  family: 'Claude',
  role: 'the body',
  lives: 'the seated body and paws',
  question: 'What is it doing?',
  answer: 'Sitting calmly, tail on the right',

  draw(pen) {
    // Haunches: the bell becomes a cat that is sitting down.
    for (let y = BODY.bottom - 4; y <= BODY.bottom; y++) {
      pen.fill(firstBlank(pen.canvas, bodyEdgeX(y, -1), y, -1), y, '(');
      pen.fill(firstBlank(pen.canvas, bodyEdgeX(y, 1), y, 1), y, ')');
    }

    for (const paw of PAWS) {
      for (let y = paw.y0; y <= paw.y1; y++) {
        pen.put(paw.x0, y, '-');
        pen.put(paw.x1, y, '-');
        for (let x = paw.x0 + 1; x < paw.x1; x++) pen.put(x, y, '#');
      }
    }

    // A thin S-shaped tail, joined to the body by a dashed line.
    const thin = tailSamples.filter((s) => s.t <= THIN_TAIL_END);
    for (let i = 1; i < thin.length; i++) {
      const a = thin[i - 1];
      const b = thin[i];
      pen.put(b.x, b.y, slopeChar(b.x - a.x, b.y - a.y));
    }
    const start = thin[0];
    for (let x = bodyEdgeX(Math.round(start.y), 1) + 2; x < Math.round(start.x); x++) {
      pen.fill(x, Math.round(start.y), '-');
    }
  },
});
