import { BODY, CHEST, PAWS, SPIRAL, tailAt } from '../anatomy.js';
import { tailFurChar } from '../texture.js';
import { defineMind } from './mind.js';

const TOES = '\\_(_(_(_/';

export default defineMind({
  step: 4,
  key: 'motion',
  mind: 'Motion',
  company: 'Google',
  family: 'Gemini',
  role: 'the tail',
  lives: 'the great curling tail',
  question: 'What makes it unique?',
  answer: 'A giant curled question-mark tail',

  draw(pen, { rng }) {
    // The thin tail grows into a plume taller than the head.
    for (let y = 0; y < pen.height; y++) {
      for (let x = 0; x < pen.width; x++) {
        const tail = tailAt(x, y);
        if (tail) pen.put(x, y, tailFurChar(tail, rng.next()));
      }
    }

    // A small spiral in tiny characters curling at the base of the tail.
    const steps = Math.round(SPIRAL.turns * 40);
    for (let i = 0; i <= steps; i++) {
      const theta = (i / 40) * Math.PI * 2;
      const r = (SPIRAL.radius * i) / steps;
      const x = SPIRAL.cx + r * 2 * Math.cos(theta);
      const y = SPIRAL.cy + r * Math.sin(theta);
      pen.fill(x, y, i % 3 === 0 ? ':' : '.');
    }

    // Striped collar: \\\\ | ////
    for (let y = CHEST.y0; y <= CHEST.y1; y++) {
      for (let dx = 1; dx <= CHEST.halfWidth; dx++) {
        pen.put(BODY.cx - dx, y, '\\');
        pen.put(BODY.cx + dx, y, '/');
      }
      pen.put(BODY.cx, y, '|');
    }

    for (let y = BODY.bottom - 4; y <= BODY.bottom; y++) pen.put(BODY.cx, y, '|');

    for (const paw of PAWS) pen.text(paw.x0, paw.y1, TOES);
  },
});
