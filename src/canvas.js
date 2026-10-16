export const BLANK = ' ';

export class Canvas {
  constructor(width, height) {
    this.width = width;
    this.height = height;
    this.chars = new Array(width * height).fill(BLANK);
    this.owners = new Uint8Array(width * height);
    this.glow = new Uint8Array(width * height);
  }

  index(x, y) {
    return y * this.width + x;
  }

  inBounds(x, y) {
    return x >= 0 && y >= 0 && x < this.width && y < this.height;
  }

  get(x, y) {
    return this.inBounds(x, y) ? this.chars[this.index(x, y)] : BLANK;
  }

  ownerAt(x, y) {
    return this.inBounds(x, y) ? this.owners[this.index(x, y)] : 0;
  }

  glowsAt(x, y) {
    return this.inBounds(x, y) && this.glow[this.index(x, y)] === 1;
  }

  isBlank(x, y) {
    return this.get(x, y) === BLANK;
  }

  set(x, y, ch, owner = 0, { glow = false } = {}) {
    x = Math.round(x);
    y = Math.round(y);
    if (!this.inBounds(x, y)) return false;
    const i = this.index(x, y);
    this.chars[i] = ch;
    this.owners[i] = ch === BLANK ? 0 : owner;
    this.glow[i] = glow && ch !== BLANK ? 1 : 0;
    return true;
  }

  pen(owner) {
    return new Pen(this, owner);
  }

  clone() {
    const copy = new Canvas(this.width, this.height);
    copy.chars = this.chars.slice();
    copy.owners = this.owners.slice();
    copy.glow = this.glow.slice();
    return copy;
  }

  *cells() {
    for (let y = 0; y < this.height; y++) {
      for (let x = 0; x < this.width; x++) {
        const i = this.index(x, y);
        yield { x, y, ch: this.chars[i], owner: this.owners[i], glow: this.glow[i] === 1 };
      }
    }
  }

  filledCount() {
    return this.chars.reduce((n, ch) => (ch === BLANK ? n : n + 1), 0);
  }

  rows() {
    const out = [];
    for (let y = 0; y < this.height; y++) {
      out.push(this.chars.slice(y * this.width, (y + 1) * this.width).join(''));
    }
    return out;
  }

  toString() {
    return this.rows().join('\n');
  }
}

// A Pen is a canvas handle that signs every stroke with the mind holding it.
export class Pen {
  constructor(canvas, owner) {
    this.canvas = canvas;
    this.owner = owner;
  }

  get width() {
    return this.canvas.width;
  }

  get height() {
    return this.canvas.height;
  }

  put(x, y, ch, opts) {
    return this.canvas.set(x, y, ch, this.owner, opts);
  }

  fill(x, y, ch, opts) {
    if (!this.canvas.isBlank(Math.round(x), Math.round(y))) return false;
    return this.put(x, y, ch, opts);
  }

  text(x, y, str, opts) {
    [...str].forEach((ch, i) => {
      if (ch !== BLANK) this.put(x + i, y, ch, opts);
    });
  }

  textCentered(cx, y, str, opts) {
    this.text(Math.round(cx - [...str].length / 2), y, str, opts);
  }
}
