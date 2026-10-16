#!/usr/bin/env node
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname } from 'node:path';
import { setTimeout as sleep } from 'node:timers/promises';
import {
  DEFAULT_SEED, MINDS, MIND_COLORS, findMind, percent, progressBar, renderBlame, renderSvg, renderTerminal, runRelay,
} from '../src/index.js';

const { version } = JSON.parse(readFileSync(new URL('../package.json', import.meta.url), 'utf8'));

const HELP = `hexapurr ${version}: the cat of six minds

Usage: hexapurr <command> [options]

Commands:
  draw              Run the relay and print the finished cat (default)
  relay             Replay the six steps one by one
  blame             Show which mind drew every character
  minds             List the six minds and what each one gave the cat
  ledger            Per-step audit: cells added, restyled, owned, frame SHA-256
  svg               Write the cat as an SVG image

Options:
  --step <n|name>   Stop after this step (1-6, or e.g. "claude", "gemini")
  --seed <n>        Texture seed (default ${DEFAULT_SEED})
  --delay <ms>      Pause between steps for "relay" (default 900)
  --out <file>      Output path for "svg" (default hexapurr.svg)
  --blame           Colour the SVG by mind
  --json            Machine-readable output for "minds" and "ledger"
  --no-color        Disable ANSI colours
  -h, --help        Show this help
  -v, --version     Show the version
`;

function parseArgs(argv) {
  const flags = {};
  const positional = [];
  for (let i = 0; i < argv.length; i++) {
    const arg = argv[i];
    if (arg === '-h') flags.help = true;
    else if (arg === '-v') flags.version = true;
    else if (arg.startsWith('--')) {
      const [key, value] = arg.slice(2).split('=', 2);
      if (value !== undefined) flags[key] = value;
      else if (['step', 'seed', 'delay', 'out'].includes(key) && argv[i + 1] !== undefined) flags[key] = argv[++i];
      else flags[key] = true;
    } else positional.push(arg);
  }
  return { command: positional[0] ?? 'draw', flags };
}

function fail(message) {
  process.stderr.write(`hexapurr: ${message}\n`);
  process.exit(1);
}

function resolveStep(value) {
  if (value === undefined) return MINDS.length;
  const mind = findMind(value);
  if (!mind) fail(`unknown step "${value}"`);
  return mind.step;
}

function resolveSeed(value) {
  if (value === undefined) return DEFAULT_SEED;
  const seed = Number(value);
  if (!Number.isInteger(seed) || seed < 0) fail(`--seed must be a non-negative integer, got "${value}"`);
  return seed;
}

function stepHeader(mind, color) {
  const name = `STEP ${mind.step}  ${mind.company.toUpperCase()}  (${mind.family})`;
  const head = color ? `${MIND_COLORS[mind.step]}${name}\x1b[0m` : name;
  return `${head}  ${progressBar(mind.step)} ${percent(mind.step)}  ${mind.role}`;
}

function pad(value, width) {
  return String(value).padEnd(width);
}

async function main() {
  const { command, flags } = parseArgs(process.argv.slice(2));
  const color = !flags['no-color'] && process.stdout.isTTY && !process.env.NO_COLOR;

  if (flags.version) return console.log(version);
  if (flags.help || command === 'help') return console.log(HELP);

  const seed = resolveSeed(flags.seed);
  const upTo = resolveStep(flags.step);

  switch (command) {
    case 'draw': {
      const { canvas } = runRelay({ seed, upTo });
      console.log(renderTerminal(canvas, { color }));
      return;
    }

    case 'relay': {
      const delay = flags.delay === undefined ? 900 : Number(flags.delay);
      if (!Number.isFinite(delay) || delay < 0) fail(`--delay must be a non-negative number, got "${flags.delay}"`);
      const steps = [];
      runRelay({ seed, upTo, onStep: (frame, entry, mind) => steps.push({ frame, entry, mind }) });
      for (const [i, { frame, entry, mind }] of steps.entries()) {
        if (process.stdout.isTTY) process.stdout.write('\x1b[2J\x1b[H');
        console.log(stepHeader(mind, color));
        console.log(`"${mind.question}"  ${mind.answer}\n`);
        console.log(renderTerminal(frame, { color }));
        console.log(`\n+${entry.added} cells added, ${entry.restyled} restyled  sha256 ${entry.sha256.slice(0, 16)}\n`);
        if (i < steps.length - 1) await sleep(delay);
      }
      return;
    }

    case 'blame': {
      const { canvas } = runRelay({ seed, upTo });
      console.log(renderBlame(canvas, { color }));
      console.log();
      for (const mind of MINDS.slice(0, upTo)) {
        const swatch = color ? `${MIND_COLORS[mind.step]}${mind.step}\x1b[0m` : String(mind.step);
        console.log(`  ${swatch}  Mind of ${pad(mind.mind, 7)} ${pad(mind.company, 10)} ${mind.lives}`);
      }
      return;
    }

    case 'minds': {
      if (flags.json) {
        const plain = MINDS.map(({ draw, ...meta }) => meta);
        return console.log(JSON.stringify(plain, null, 2));
      }
      for (const mind of MINDS) {
        console.log(`${mind.step}. The Mind of ${mind.mind}  ${mind.company} / ${mind.family}`);
        console.log(`   ${mind.role}, lives in ${mind.lives}`);
        console.log(`   "${mind.question}"  ${mind.answer}\n`);
      }
      return;
    }

    case 'ledger': {
      const { ledger } = runRelay({ seed, upTo });
      if (flags.json) return console.log(JSON.stringify({ seed, steps: ledger }, null, 2));
      console.log(`${pad('STEP', 6)}${pad('MIND', 8)}${pad('COMPANY', 11)}${pad('ADDED', 7)}${pad('RESTYLED', 10)}${pad('OWNS', 6)}${pad('SHARE', 8)}FRAME SHA-256`);
      for (const e of ledger) {
        const share = `${(e.ownedShare * 100).toFixed(1)}%`;
        console.log(`${pad(e.step, 6)}${pad(e.mind, 8)}${pad(e.company, 11)}${pad(e.added, 7)}${pad(e.restyled, 10)}${pad(e.owns, 6)}${pad(share, 8)}${e.sha256.slice(0, 16)}`);
      }
      console.log('\nSHARE = cells each mind still owns in the final frame (nominal share is 16.6% each).');
      return;
    }

    case 'svg': {
      const out = typeof flags.out === 'string' ? flags.out : 'hexapurr.svg';
      const { canvas } = runRelay({ seed, upTo });
      mkdirSync(dirname(out), { recursive: true });
      writeFileSync(out, renderSvg(canvas, { blame: Boolean(flags.blame) }));
      console.log(`Wrote ${out}`);
      return;
    }

    default:
      fail(`unknown command "${command}". Run "hexapurr --help".`);
  }
}

main().catch((err) => fail(err.stack ?? String(err)));
