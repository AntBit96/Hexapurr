const REQUIRED = ['step', 'key', 'mind', 'company', 'family', 'role', 'lives', 'question', 'answer', 'draw'];

export function defineMind(spec) {
  for (const field of REQUIRED) {
    if (spec[field] === undefined) throw new TypeError(`Mind is missing "${field}"`);
  }
  if (typeof spec.draw !== 'function') throw new TypeError(`Mind "${spec.mind}" must have a draw(pen, ctx) function`);
  return Object.freeze({ ...spec, share: 1 / 6 });
}
