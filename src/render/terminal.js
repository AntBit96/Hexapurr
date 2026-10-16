import { BLANK } from '../canvas.js';

const RESET = '\x1b[0m';
const BASE = '\x1b[38;5;255m';
const GLOW = '\x1b[1;38;5;229m';

export const MIND_COLORS = {
  1: '\x1b[38;5;114m',
  2: '\x1b[38;5;203m',
  3: '\x1b[38;5;215m',
  4: '\x1b[38;5;75m',
  5: '\x1b[38;5;141m',
  6: '\x1b[38;5;229m',
};

function paint(canvas, styleOf) {
  const lines = [];
  for (let y = 0; y < canvas.height; y++) {
    let line = '';
    let current = null;
    for (let x = 0; x < canvas.width; x++) {
      const ch = canvas.get(x, y);
      const style = ch === BLANK ? null : styleOf(x, y);
      if (style !== current) {
        line += style ?? RESET;
        current = style;
      }
      line += ch;
    }
    lines.push((line + RESET).replace(/\s+\x1b\[0m$/, RESET).trimEnd());
  }
  return lines.join('\n');
}

export function renderTerminal(canvas, { color = false } = {}) {
  if (!color) return canvas.rows().map((r) => r.trimEnd()).join('\n');
  return paint(canvas, (x, y) => (canvas.glowsAt(x, y) ? GLOW : BASE));
}

// Every cell, coloured (or numbered) by the mind that drew it last.
export function renderBlame(canvas, { color = false } = {}) {
  if (color) return paint(canvas, (x, y) => MIND_COLORS[canvas.ownerAt(x, y)] ?? BASE);
  const rows = [];
  for (let y = 0; y < canvas.height; y++) {
    let row = '';
    for (let x = 0; x < canvas.width; x++) {
      const owner = canvas.ownerAt(x, y);
      row += owner === 0 ? BLANK : String(owner);
    }
    rows.push(row.trimEnd());
  }
  return rows.join('\n');
}

export function progressBar(step, total = 6) {
  return `[${'█'.repeat(step)}${'░'.repeat(total - step)}]`;
}

export function percent(step, total = 6) {
  if (step === total) return '100%';
  return `${(Math.floor((step / total) * 1000) / 10).toFixed(1)}%`;
}
