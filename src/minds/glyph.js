import { inHead, inTail } from '../anatomy.js';
import { RUNES, isFur } from '../texture.js';
import { defineMind } from './mind.js';

const HEAD_MARKS = [';', '/', ';', '\\'];

function nextToTail(x, y) {
  return inTail(x - 1, y) || inTail(x + 1, y) || inTail(x, y - 1) || inTail(x, y + 1);
}

export default defineMind({
  step: 5,
  key: 'glyph',
  mind: 'Glyph',
  company: 'Meta',
  family: 'Meta AI',
  role: 'the glyphs',
  lives: 'the runes hidden in its fur',
  question: 'What is it, really?',
  answer: 'Something arcane, written in glyphs',

  // Shape stays exactly as it is; only the texture is rewritten.
  draw(pen, { rng }) {
    const canvas = pen.canvas;
    const markSpots = [];

    for (let y = 0; y < pen.height; y++) {
      for (let x = 0; x < pen.width; x++) {
        const ch = canvas.get(x, y);
        if (inTail(x, y)) {
          if (isFur(ch)) pen.put(x, y, rng.pick(RUNES));
        } else if (inHead(x, y) && isFur(ch) && rng.chance(0.12)) {
          pen.put(x, y, rng.pick(HEAD_MARKS));
        } else if (canvas.isBlank(x, y) && nextToTail(x, y)) {
          markSpots.push([x, y]);
        }
      }
    }

    for (let i = 0; i < 5 && markSpots.length > 0; i++) {
      const [x, y] = markSpots.splice(rng.int(markSpots.length), 1)[0];
      pen.put(x, y, '▷');
    }
  },
});
