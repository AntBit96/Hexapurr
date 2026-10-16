import {
  COMPASS, EYES, HORIZON_Y, MOUTH, SIGIL, STARS, TITLE_CX, TITLE_Y, tailAt,
} from '../anatomy.js';
import { ARCANE_MARKS, isRune, tailFurChar } from '../texture.js';
import { defineMind } from './mind.js';

export const TITLE = '-+-  H E X A P U R R  -+-';
export const SUBTITLE = 'the cat of six minds';

const SIGIL_ROWS = ['\\|/', '-✦-', '/|\\'];

export default defineMind({
  step: 6,
  key: 'light',
  mind: 'Light',
  company: 'NVIDIA',
  family: 'NVIDIA',
  role: 'the soul',
  lives: 'the glowing eyes and the stars',
  question: 'Who is it?',
  answer: 'HEXAPURR, the cat of six minds',

  draw(pen, { rng }) {
    const canvas = pen.canvas;

    // The fur comes back; the runes survive only as small arcane marks.
    for (let y = 0; y < pen.height; y++) {
      for (let x = 0; x < pen.width; x++) {
        if (!isRune(canvas.get(x, y))) continue;
        const tail = tailAt(x, y);
        pen.put(x, y, rng.chance(0.15) || !tail ? rng.pick(ARCANE_MARKS) : tailFurChar(tail, rng.next()));
      }
    }

    // Glowing vertical slits: the only colour in its world.
    for (const [ex, ey] of EYES) {
      pen.put(ex, ey - 1, '|', { glow: true });
      pen.put(ex, ey, '█', { glow: true });
      pen.put(ex, ey + 1, '|', { glow: true });
      pen.put(ex - 1, ey, '(');
      pen.put(ex + 1, ey, ')');
    }

    pen.put(MOUTH[0], MOUTH[1], 'ω');

    SIGIL_ROWS.forEach((row, i) => pen.text(SIGIL[0] - 1, SIGIL[1] - 1 + i, row));

    for (const [x, y, ch] of STARS) pen.fill(x, y, ch);
    pen.text(COMPASS[0] - 1, COMPASS[1], '-◇-');

    for (let x = 6; x < pen.width - 6; x += 2) pen.fill(x, HORIZON_Y, '.');

    pen.textCentered(TITLE_CX, TITLE_Y, TITLE);
    pen.textCentered(TITLE_CX, TITLE_Y + 1, SUBTITLE);
  },
});
