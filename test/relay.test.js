import assert from 'node:assert/strict';
import { test } from 'node:test';
import { EYES, HEAD, inTail } from '../src/anatomy.js';
import { BLANK } from '../src/canvas.js';
import { MINDS, RelayViolation, SUBTITLE, defineMind, findMind, runRelay } from '../src/index.js';

test('six minds, in relay order, one per company', () => {
  assert.deepEqual(MINDS.map((m) => m.company), ['OpenAI', 'xAI', 'Anthropic', 'Google', 'Meta', 'NVIDIA']);
  assert.deepEqual(MINDS.map((m) => m.step), [1, 2, 3, 4, 5, 6]);
  assert.equal(new Set(MINDS.map((m) => m.mind)).size, 6);
  for (const m of MINDS) assert.ok(Math.abs(m.share - 1 / 6) < 1e-12);
});

test('findMind accepts step numbers, keys and company or family names', () => {
  assert.equal(findMind(3).company, 'Anthropic');
  assert.equal(findMind('gemini').step, 4);
  assert.equal(findMind('NVIDIA').step, 6);
  assert.equal(findMind('glyph').family, 'Meta AI');
  assert.equal(findMind('nope'), undefined);
});

test('every step changes the drawing, and nothing is ever erased', () => {
  const { frames, ledger } = runRelay();
  assert.equal(frames.length, 6);
  for (const entry of ledger) assert.ok(entry.added + entry.restyled > 0, `${entry.company} did nothing`);
  for (let i = 1; i < frames.length; i++) {
    const prev = frames[i - 1];
    const next = frames[i];
    for (let k = 0; k < prev.chars.length; k++) {
      if (prev.chars[k] !== BLANK) assert.notEqual(next.chars[k], BLANK);
    }
  }
});

test('the relay is deterministic for a seed and textured by it', () => {
  const a = runRelay({ seed: 42 });
  const b = runRelay({ seed: 42 });
  const c = runRelay({ seed: 43 });
  assert.deepEqual(a.ledger.map((e) => e.sha256), b.ledger.map((e) => e.sha256));
  assert.notEqual(a.ledger.at(-1).sha256, c.ledger.at(-1).sha256);
});

test('upTo stops the relay early', () => {
  const { frames, ledger } = runRelay({ upTo: 3 });
  assert.equal(frames.length, 3);
  assert.equal(ledger.at(-1).company, 'Anthropic');
});

test('step 1 is outline only: the inside of the head is empty', () => {
  const [first] = runRelay({ upTo: 1 }).frames;
  assert.equal(first.get(HEAD.cx, HEAD.cy - 2), BLANK);
  assert.equal(first.get(EYES[0][0], EYES[0][1]), '.');
});

test('step 4 grows a tail taller than the head', () => {
  const { frames } = runRelay({ upTo: 4 });
  const headTop = Math.min(...frames[3].rows().map((_, y) => y).filter((y) => frames[3].ownerAt(HEAD.cx, y) !== 0));
  let tailTop = Infinity;
  for (const { x, y, owner } of frames[3].cells()) {
    if (owner === 4 && inTail(x, y)) tailTop = Math.min(tailTop, y);
  }
  assert.ok(tailTop < headTop, `tail top ${tailTop} should be above head top ${headTop}`);
});

test('step 5 changes texture but not shape', () => {
  const { frames } = runRelay({ upTo: 5 });
  const [before, after] = [frames[3], frames[4]];
  let restyled = 0;
  for (let i = 0; i < before.chars.length; i++) {
    if (before.chars[i] !== BLANK && before.chars[i] !== after.chars[i]) restyled++;
  }
  assert.ok(restyled > 100);
});

test('step 6 lights the eyes and names the cat', () => {
  const { canvas } = runRelay();
  for (const [x, y] of EYES) assert.equal(canvas.glowsAt(x, y), true);
  const text = canvas.toString();
  assert.match(text, /H E X A P U R R/);
  assert.ok(text.includes(SUBTITLE));
  assert.ok(text.includes('ω'));
});

test('owned shares cover the whole final frame', () => {
  const { ledger, canvas } = runRelay();
  const owned = ledger.reduce((n, e) => n + e.owns, 0);
  assert.equal(owned, canvas.filledCount());
  const share = ledger.reduce((n, e) => n + e.ownedShare, 0);
  assert.ok(Math.abs(share - 1) < 1e-9);
});

test('a mind that erases earlier work is rejected', () => {
  const vandal = defineMind({
    ...MINDS[1],
    step: 2,
    draw(pen) {
      pen.put(EYES[0][0], EYES[0][1], BLANK);
    },
  });
  assert.throws(() => runRelay({ minds: [MINDS[0], vandal] }), RelayViolation);
});

test('defineMind validates its contract', () => {
  assert.throws(() => defineMind({ step: 7 }), /missing/);
});
