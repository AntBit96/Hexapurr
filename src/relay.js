import { createHash } from 'node:crypto';
import { HEIGHT, WIDTH } from './anatomy.js';
import { BLANK, Canvas } from './canvas.js';
import { MINDS } from './minds/index.js';
import { createRng } from './random.js';

export const DEFAULT_SEED = 6;

export class RelayViolation extends Error {
  constructor(mind, erased) {
    super(`${mind.company} (${mind.mind}) erased ${erased.length} cell(s) drawn by earlier minds, e.g. at ${erased[0].join(',')}`);
    this.name = 'RelayViolation';
    this.mind = mind;
    this.erased = erased;
  }
}

export function frameHash(canvas) {
  return createHash('sha256').update(canvas.toString()).digest('hex');
}

// Rule of the relay: keep everything already drawn. A mind may restyle a cell, never empty it.
export function audit(before, after, mind) {
  let added = 0;
  let restyled = 0;
  const erased = [];
  for (let i = 0; i < after.chars.length; i++) {
    const was = before.chars[i];
    const now = after.chars[i];
    if (was === now) continue;
    if (was === BLANK) added++;
    else if (now === BLANK) erased.push([i % after.width, Math.floor(i / after.width)]);
    else restyled++;
  }
  if (erased.length > 0) throw new RelayViolation(mind, erased);
  return { added, restyled };
}

export function runRelay({ minds = MINDS, seed = DEFAULT_SEED, upTo = minds.length, width = WIDTH, height = HEIGHT, onStep } = {}) {
  const canvas = new Canvas(width, height);
  const frames = [];
  const ledger = [];

  for (const mind of minds.slice(0, upTo)) {
    const before = canvas.clone();
    mind.draw(canvas.pen(mind.step), { rng: createRng(seed * 1000 + mind.step), before });
    const { added, restyled } = audit(before, canvas, mind);
    const frame = canvas.clone();
    frames.push(frame);
    ledger.push({
      step: mind.step,
      mind: mind.mind,
      company: mind.company,
      family: mind.family,
      role: mind.role,
      added,
      restyled,
      filled: frame.filledCount(),
      sha256: frameHash(frame),
    });
    onStep?.(frame, ledger[ledger.length - 1], mind);
  }

  finaliseOwnership(canvas, ledger);
  return { canvas, frames, ledger, seed };
}

// Nominal share is 1/6 each; this records what each mind actually still owns in the final frame.
function finaliseOwnership(canvas, ledger) {
  const total = canvas.filledCount() || 1;
  for (const entry of ledger) {
    const owns = canvas.owners.reduce((n, o) => (o === entry.step ? n + 1 : n), 0);
    entry.owns = owns;
    entry.ownedShare = owns / total;
  }
}
