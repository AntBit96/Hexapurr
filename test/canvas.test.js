import assert from 'node:assert/strict';
import { test } from 'node:test';
import { BLANK, Canvas } from '../src/canvas.js';

test('set/get round-trips and records the owner', () => {
  const c = new Canvas(4, 3);
  assert.equal(c.set(1, 2, '@', 5), true);
  assert.equal(c.get(1, 2), '@');
  assert.equal(c.ownerAt(1, 2), 5);
  assert.equal(c.filledCount(), 1);
});

test('out-of-bounds writes are ignored and reads are blank', () => {
  const c = new Canvas(2, 2);
  assert.equal(c.set(-1, 0, '#'), false);
  assert.equal(c.set(0, 2, '#'), false);
  assert.equal(c.get(9, 9), BLANK);
  assert.equal(c.filledCount(), 0);
});

test('coordinates are rounded to the nearest cell', () => {
  const c = new Canvas(3, 3);
  c.set(1.4, 0.6, 'x');
  assert.equal(c.get(1, 1), 'x');
});

test('writing a blank clears ownership and glow', () => {
  const c = new Canvas(2, 1);
  c.set(0, 0, '█', 6, { glow: true });
  assert.equal(c.glowsAt(0, 0), true);
  c.set(0, 0, BLANK, 6, { glow: true });
  assert.equal(c.ownerAt(0, 0), 0);
  assert.equal(c.glowsAt(0, 0), false);
});

test('clone is independent of the original', () => {
  const c = new Canvas(2, 1);
  c.set(0, 0, 'a', 1);
  const copy = c.clone();
  copy.set(1, 0, 'b', 2);
  assert.equal(c.get(1, 0), BLANK);
  assert.equal(copy.toString(), 'ab');
});

test('pen signs strokes and fill() never overwrites', () => {
  const c = new Canvas(5, 1);
  const pen = c.pen(3);
  pen.text(0, 0, 'a b');
  assert.equal(c.toString(), 'a b  ');
  assert.equal(pen.fill(0, 0, 'z'), false);
  assert.equal(pen.fill(1, 0, 'z'), true);
  assert.equal(c.ownerAt(1, 0), 3);
  assert.equal(c.get(0, 0), 'a');
});

test('textCentered centres on the given column', () => {
  const c = new Canvas(9, 1);
  c.pen(1).textCentered(4.5, 0, 'cat');
  assert.equal(c.toString(), '   cat   ');
});
