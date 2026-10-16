// Regenerates everything in examples/ from the relay. Usage: npm run examples
import { mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { MINDS, renderBlame, renderSvg, renderTerminal, runRelay } from '../src/index.js';

const out = fileURLToPath(new URL('../examples/', import.meta.url));
mkdirSync(join(out, 'steps'), { recursive: true });

const write = (name, contents) => {
  writeFileSync(join(out, name), contents);
  console.log(`wrote examples/${name}`);
};

const { canvas, frames, ledger, seed } = runRelay();

write('hexapurr.txt', `${renderTerminal(canvas)}\n`);
write('hexapurr.svg', renderSvg(canvas));
write('blame.txt', `${renderBlame(canvas)}\n`);
write('blame.svg', renderSvg(canvas, { blame: true, title: 'HEXAPURR: who drew what' }));
write('ledger.json', `${JSON.stringify({ seed, steps: ledger }, null, 2)}\n`);

frames.forEach((frame, i) => {
  const mind = MINDS[i];
  const name = `step${mind.step}_${mind.key}`;
  write(`steps/${name}.txt`, `${renderTerminal(frame)}\n`);
  write(`steps/${name}.svg`, renderSvg(frame, { title: `HEXAPURR step ${mind.step}: ${mind.company}, ${mind.role}` }));
});
