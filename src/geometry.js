export function inEllipse(x, y, { cx, cy, rx, ry }) {
  const dx = (x - cx) / rx;
  const dy = (y - cy) / ry;
  return dx * dx + dy * dy <= 1;
}

export function inPolygon(x, y, points) {
  let inside = false;
  for (let i = 0, j = points.length - 1; i < points.length; j = i++) {
    const [xi, yi] = points[i];
    const [xj, yj] = points[j];
    if (yi > y !== yj > y && x < ((xj - xi) * (y - yi)) / (yj - yi) + xi) inside = !inside;
  }
  return inside;
}

export function linePoints(x0, y0, x1, y1) {
  x0 = Math.round(x0);
  y0 = Math.round(y0);
  x1 = Math.round(x1);
  y1 = Math.round(y1);
  const dx = Math.abs(x1 - x0);
  const dy = -Math.abs(y1 - y0);
  const sx = x0 < x1 ? 1 : -1;
  const sy = y0 < y1 ? 1 : -1;
  const points = [];
  let err = dx + dy;
  for (;;) {
    points.push([x0, y0]);
    if (x0 === x1 && y0 === y1) return points;
    const e2 = 2 * err;
    if (e2 >= dy) {
      err += dy;
      x0 += sx;
    }
    if (e2 <= dx) {
      err += dx;
      y0 += sy;
    }
  }
}

// Screen y grows downward, so "right and down" is a backslash.
export function slopeChar(dx, dy) {
  const ax = Math.abs(dx);
  const ay = Math.abs(dy);
  if (ay <= ax * 0.41) return '-';
  if (ax <= ay * 0.41) return '|';
  return dx * dy > 0 ? '\\' : '/';
}

export function catmullRom(points, samplesPerSegment = 32) {
  const out = [];
  const segments = points.length - 1;
  for (let i = 0; i < segments; i++) {
    const p0 = points[i - 1] ?? points[i];
    const p1 = points[i];
    const p2 = points[i + 1];
    const p3 = points[i + 2] ?? points[i + 1];
    for (let s = 0; s < samplesPerSegment; s++) {
      const u = s / samplesPerSegment;
      const u2 = u * u;
      const u3 = u2 * u;
      const at = (a, b, c, d) =>
        0.5 * (2 * b + (-a + c) * u + (2 * a - 5 * b + 4 * c - d) * u2 + (-a + 3 * b - 3 * c + d) * u3);
      out.push({ x: at(p0[0], p1[0], p2[0], p3[0]), y: at(p0[1], p1[1], p2[1], p3[1]), t: (i + u) / segments });
    }
  }
  const last = points[points.length - 1];
  out.push({ x: last[0], y: last[1], t: 1 });
  return out;
}

const NEIGHBOURS_8 = [
  [-1, -1], [0, -1], [1, -1],
  [-1, 0], [1, 0],
  [-1, 1], [0, 1], [1, 1],
];

// Edge cells of a mask, each with an outward normal estimated from its outside neighbours.
export function outline(contains, width, height) {
  const edges = [];
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      if (!contains(x, y)) continue;
      const isEdge = !contains(x - 1, y) || !contains(x + 1, y) || !contains(x, y - 1) || !contains(x, y + 1);
      if (!isEdge) continue;
      let nx = 0;
      let ny = 0;
      for (const [dx, dy] of NEIGHBOURS_8) {
        if (!contains(x + dx, y + dy)) {
          nx += dx;
          ny += dy;
        }
      }
      edges.push({ x, y, nx, ny });
    }
  }
  return edges;
}
