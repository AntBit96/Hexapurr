import { BLANK } from '../canvas.js';

const BG = '#080808';
const INK = '#f0f0e8';
const GLOW = '#ffe9b0';

export const MIND_HEX = {
  1: '#87d787',
  2: '#ff5f5f',
  3: '#ffaf5f',
  4: '#5fafff',
  5: '#af87ff',
  6: '#ffffaf',
};

const CELL_W = 8.4;
const CELL_H = 16;
const PAD = 24;

function escape(ch) {
  return ch.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

export function renderSvg(canvas, { blame = false, title = 'HEXAPURR' } = {}) {
  const width = Math.ceil(canvas.width * CELL_W + PAD * 2);
  const height = Math.ceil(canvas.height * CELL_H + PAD * 2);
  const fillOf = (x, y) => {
    if (blame) return MIND_HEX[canvas.ownerAt(x, y)] ?? INK;
    return canvas.glowsAt(x, y) ? GLOW : INK;
  };

  const rows = [];
  for (let y = 0; y < canvas.height; y++) {
    const spans = [];
    let run = [];
    let runFill = null;
    let runX = 0;
    let gap = 0;
    // textLength pins every run to the grid, whatever monospace font the viewer falls back to.
    const flush = () => {
      while (run.at(-1) === BLANK) run.pop();
      if (run.length) {
        const glow = !blame && runFill === GLOW ? ' filter="url(#glow)"' : '';
        const len = (run.length * CELL_W).toFixed(1);
        const x = (PAD + runX * CELL_W).toFixed(1);
        spans.push(`<tspan x="${x}" textLength="${len}" lengthAdjust="spacingAndGlyphs" fill="${runFill}"${glow}>${escape(run.join(''))}</tspan>`);
      }
      run = [];
    };
    for (let x = 0; x < canvas.width; x++) {
      const ch = canvas.get(x, y);
      if (ch === BLANK) {
        if (++gap >= 2) flush();
        else if (run.length) run.push(BLANK);
        continue;
      }
      gap = 0;
      const fill = fillOf(x, y);
      if (fill !== runFill || run.length === 0) {
        flush();
        runFill = fill;
        runX = x;
      }
      run.push(ch);
    }
    flush();
    if (spans.length) rows.push(`  <text y="${(PAD + (y + 0.8) * CELL_H).toFixed(1)}">${spans.join('')}</text>`);
  }

  return [
    `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" role="img">`,
    `  <title>${escape(title)}</title>`,
    '  <defs><filter id="glow" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="2" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter></defs>',
    `  <rect width="100%" height="100%" fill="${BG}"/>`,
    `  <g font-family="Consolas, 'DejaVu Sans Mono', Menlo, monospace" font-size="14" xml:space="preserve">`,
    ...rows,
    '  </g>',
    '</svg>',
    '',
  ].join('\n');
}
