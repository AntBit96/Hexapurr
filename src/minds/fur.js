import { BODY, EYES, HEAD, bodyHalfWidth, inBody, inHead } from '../anatomy.js';
import { furChar } from '../texture.js';
import { defineMind } from './mind.js';

function headDepth(x, y) {
  const dx = (x - HEAD.cx) / HEAD.rx;
  const dy = (y - HEAD.cy) / HEAD.ry;
  return Math.min(1, Math.sqrt(dx * dx + dy * dy));
}

function bodyDepth(x, y) {
  const across = Math.abs(x - BODY.cx) / bodyHalfWidth(y);
  const down = (y - BODY.top) / (BODY.bottom - BODY.top);
  return Math.min(1, Math.max(across, down * 0.6));
}

function isEyeSocket(x, y) {
  return EYES.some(([ex, ey]) => Math.abs(x - ex) <= 1 && y >= ey && y <= ey + 1);
}

export default defineMind({
  step: 2,
  key: 'fur',
  mind: 'Fur',
  company: 'xAI',
  family: 'Grok',
  role: 'the fur',
  lives: 'the dense @# coat',
  question: 'What is it made of?',
  answer: 'Dense @ # % ASCII fur',

  draw(pen, { rng }) {
    // Hollow block eyes: a blank, unreadable stare.
    for (const [ex, ey] of EYES) {
      pen.put(ex - 1, ey, '0');
      pen.put(ex + 1, ey, '0');
      pen.put(ex - 1, ey + 1, '0');
      pen.put(ex + 1, ey + 1, '0');
    }

    for (let y = 0; y < pen.height; y++) {
      for (let x = 0; x < pen.width; x++) {
        if (isEyeSocket(x, y)) continue;
        if (inHead(x, y)) pen.fill(x, y, furChar(headDepth(x, y), rng.next()));
        else if (inBody(x, y)) pen.fill(x, y, furChar(bodyDepth(x, y), rng.next()));
      }
    }
  },
});
