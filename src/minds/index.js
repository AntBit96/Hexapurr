import line from './line.js';
import fur from './fur.js';
import form from './form.js';
import motion from './motion.js';
import glyph from './glyph.js';
import light from './light.js';

export { defineMind } from './mind.js';

// Relay order: OpenAI -> Grok -> Claude -> Gemini -> Meta AI -> NVIDIA
export const MINDS = Object.freeze([line, fur, form, motion, glyph, light]);

export function findMind(query) {
  const q = String(query).toLowerCase();
  return MINDS.find(
    (m) => String(m.step) === q || m.key === q || m.mind.toLowerCase() === q
      || m.company.toLowerCase() === q || m.family.toLowerCase() === q,
  );
}
