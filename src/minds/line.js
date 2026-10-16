import { EYES, HEAD, WHISKERS, BODY, bodyEdgeX, inHead } from '../anatomy.js';
import { linePoints, outline, slopeChar } from '../geometry.js';
import { defineMind } from './mind.js';

function edgeChar({ x, y, nx, ny }) {
  if ((x + y) % 4 === 3) return '.';
  const ch = slopeChar(-ny, nx);
  if (ch === '-') return ny > 0 ? '_' : '-';
  if (ch === '|') return ':';
  return ch;
}

export default defineMind({
  step: 1,
  key: 'line',
  mind: 'Line',
  company: 'OpenAI',
  family: 'ChatGPT / GPT image',
  role: 'the outline',
  lives: 'the ears and whiskers',
  question: 'What is it?',
  answer: 'A cat, drawn only in outline',

  draw(pen) {
    for (const edge of outline(inHead, pen.width, pen.height)) {
      pen.put(edge.x, edge.y, edgeChar(edge));
    }

    for (const [[x0, y0], [x1, y1]] of WHISKERS) {
      const ch = slopeChar(x1 - x0, y1 - y0);
      for (const [x, y] of linePoints(x0, y0, x1, y1)) pen.put(x, y, ch);
    }

    for (const [x, y] of EYES) pen.put(x, y, '.');

    // Two short strokes trailing down from the jaw: the only hint that a body will follow.
    const jawTop = Math.ceil(HEAD.cy + HEAD.ry);
    for (let y = jawTop; y <= BODY.top + 2; y++) {
      pen.put(bodyEdgeX(y, -1), y, '/');
      pen.put(bodyEdgeX(y, 1), y, '\\');
    }
  },
});
