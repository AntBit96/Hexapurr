import assert from 'node:assert/strict';
import { test } from 'node:test';
import { percent, progressBar, renderBlame, renderSvg, renderTerminal, runRelay } from '../src/index.js';

const { canvas } = runRelay();

test('plain terminal render is the canvas without trailing spaces', () => {
  const plain = renderTerminal(canvas);
  assert.equal(plain, canvas.rows().map((r) => r.trimEnd()).join('\n'));
  assert.ok(!plain.includes('\x1b['));
});

test('colour render glows the eyes', () => {
  const coloured = renderTerminal(canvas, { color: true });
  assert.ok(coloured.includes('\x1b[1;38;5;229m'));
});

test('plain blame labels every filled cell with its mind', () => {
  const blame = renderBlame(canvas).split('\n');
  const rows = canvas.rows();
  for (let y = 0; y < rows.length; y++) {
    for (let x = 0; x < rows[y].length; x++) {
      const filled = rows[y][x] !== ' ';
      const label = blame[y][x] ?? ' ';
      assert.equal(filled, label !== ' ');
      if (filled) assert.match(label, /[1-6]/);
    }
  }
});

test('svg is a single document with the title and a glow filter', () => {
  const svg = renderSvg(canvas);
  assert.ok(svg.startsWith('<svg '));
  assert.ok(svg.trimEnd().endsWith('</svg>'));
  assert.ok(svg.includes('filter="url(#glow)"'));
  assert.ok(svg.includes('H E X A P U R R'));
  assert.equal((svg.match(/<svg /g) ?? []).length, 1);
});

test('blame svg uses one colour per mind', () => {
  const svg = renderSvg(canvas, { blame: true });
  for (const hex of ['#87d787', '#ff5f5f', '#ffaf5f', '#5fafff', '#af87ff', '#ffffaf']) {
    assert.ok(svg.includes(hex), `missing ${hex}`);
  }
});

test('progress bar and percentages match the README', () => {
  assert.equal(progressBar(1), '[█░░░░░]');
  assert.equal(progressBar(6), '[██████]');
  assert.deepEqual([1, 2, 3, 4, 5, 6].map((s) => percent(s)), ['16.6%', '33.3%', '50.0%', '66.6%', '83.3%', '100%']);
});
