import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { mkdtempSync, readFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { test } from 'node:test';
import { fileURLToPath } from 'node:url';

const BIN = fileURLToPath(new URL('../bin/hexapurr.js', import.meta.url));

function run(...args) {
  return spawnSync(process.execPath, [BIN, ...args, '--no-color'], { encoding: 'utf8' });
}

test('draw prints the finished cat', () => {
  const r = run('draw');
  assert.equal(r.status, 0, r.stderr);
  assert.match(r.stdout, /H E X A P U R R/);
});

test('draw --step claude stops before the tail and the name', () => {
  const r = run('draw', '--step', 'claude');
  assert.equal(r.status, 0, r.stderr);
  assert.doesNotMatch(r.stdout, /H E X A P U R R/);
});

test('minds --json lists all six', () => {
  const r = run('minds', '--json');
  assert.equal(r.status, 0, r.stderr);
  const minds = JSON.parse(r.stdout);
  assert.deepEqual(minds.map((m) => m.family), ['ChatGPT / GPT image', 'Grok', 'Claude', 'Gemini', 'Meta AI', 'NVIDIA']);
});

test('ledger --json has a hash per step', () => {
  const r = run('ledger', '--json', '--seed', '7');
  assert.equal(r.status, 0, r.stderr);
  const { seed, steps } = JSON.parse(r.stdout);
  assert.equal(seed, 7);
  assert.equal(steps.length, 6);
  for (const s of steps) assert.match(s.sha256, /^[0-9a-f]{64}$/);
});

test('svg writes a file', () => {
  const dir = mkdtempSync(join(tmpdir(), 'hexapurr-'));
  try {
    const out = join(dir, 'cat.svg');
    const r = run('svg', '--out', out, '--blame');
    assert.equal(r.status, 0, r.stderr);
    assert.ok(readFileSync(out, 'utf8').startsWith('<svg '));
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
});

test('bad input fails cleanly', () => {
  assert.equal(run('purr').status, 1);
  assert.equal(run('draw', '--step', '9').status, 1);
  assert.equal(run('draw', '--seed', '-1').status, 1);
});
