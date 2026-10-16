export const FUR = ['@', '#', '%'];
export const RUNES = ['ᚠ', '┣', '╋', '~', 'ᚱ', 'ᛟ', '╬', '┫', 'ᚷ', '┳'];
export const ARCANE_MARKS = ['*', ';', ':'];

export function isFur(ch) {
  return FUR.includes(ch);
}

export function isRune(ch) {
  return RUNES.includes(ch);
}

// Dense at the core, lighter at the rim; noise keeps it from looking like a gradient.
export function furChar(depth, noise = 0) {
  const d = depth + (noise - 0.5) * 0.25;
  if (d < 0.55) return '@';
  if (d < 0.86) return '#';
  return '%';
}

// The step-4 plume is banded along its length, which is what makes it read as a curl.
export function tailFurChar(tail, noise = 0) {
  const band = Math.floor(tail.along * 34) % 3;
  if (tail.depth > 0.86) return '%';
  if (band === 2) return tail.depth < 0.45 ? '#' : '%';
  return furChar(tail.depth, noise);
}
