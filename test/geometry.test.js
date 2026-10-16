import assert from 'node:assert/strict';
import { test } from 'node:test';
import { catmullRom, inEllipse, inPolygon, linePoints, outline, slopeChar } from '../src/geometry.js';

test('inEllipse', () => {
  const e = { cx: 10, cy: 5, rx: 4, ry: 2 };
  assert.equal(inEllipse(10, 5, e), true);
  assert.equal(inEllipse(14, 5, e), true);
  assert.equal(inEllipse(15, 5, e), false);
  assert.equal(inEllipse(10, 8, e), false);
});

test('inPolygon', () => {
  const tri = [[0, 0], [10, 0], [0, 10]];
  assert.equal(inPolygon(2, 2, tri), true);
  assert.equal(inPolygon(8, 8, tri), false);
});

test('linePoints includes both endpoints and is contiguous', () => {
  const pts = linePoints(0, 0, 5, 3);
  assert.deepEqual(pts[0], [0, 0]);
  assert.deepEqual(pts.at(-1), [5, 3]);
  for (let i = 1; i < pts.length; i++) {
    assert.ok(Math.abs(pts[i][0] - pts[i - 1][0]) <= 1);
    assert.ok(Math.abs(pts[i][1] - pts[i - 1][1]) <= 1);
  }
});

test('slopeChar picks the glyph that matches the direction (y grows down)', () => {
  assert.equal(slopeChar(1, 0), '-');
  assert.equal(slopeChar(0, 1), '|');
  assert.equal(slopeChar(1, 1), '\\');
  assert.equal(slopeChar(1, -1), '/');
  assert.equal(slopeChar(-1, -1), '\\');
});

test('catmullRom passes through every control point', () => {
  const pts = [[0, 0], [4, 2], [8, 0]];
  const samples = catmullRom(pts, 8);
  assert.deepEqual([samples[0].x, samples[0].y], [0, 0]);
  assert.deepEqual([samples[8].x, samples[8].y], [4, 2]);
  assert.deepEqual([samples.at(-1).x, samples.at(-1).y, samples.at(-1).t], [8, 0, 1]);
});

test('outline returns only boundary cells, with outward normals', () => {
  const square = (x, y) => x >= 1 && x <= 3 && y >= 1 && y <= 3;
  const edges = outline(square, 5, 5);
  assert.equal(edges.length, 8);
  assert.ok(!edges.some((e) => e.x === 2 && e.y === 2));
  const top = edges.find((e) => e.x === 2 && e.y === 1);
  assert.ok(top.ny < 0);
});
