// Hit testing and verification of differences: which registered difference a click lands on,
// whether a scene's set of differences is well formed, when a round is complete, and a pixel
// audit proving each registered difference is really painted and nothing else differs.
import { PLATE_W, PLATE_H } from './artPrimitives.js';

export function diffCenter(diff) {
  const [x, y, w, h] = diff.box;
  return { x: x + w / 2, y: y + h / 2, r: (w + h) / 4 + 2 };
}

/** Distance from a point to a difference's box (0 inside it). */
function boxDistance(diff, x, y) {
  const [bx, by, bw, bh] = diff.box;
  const dx = Math.max(bx - x, 0, x - (bx + bw));
  const dy = Math.max(by - y, 0, y - (by + bh));
  return Math.hypot(dx, dy);
}

/**
 * Classifies a click at plate coordinates: a new find, a repeat of one already found, or a miss.
 * `tolerance` widens every box (fair, generous hit area; tighter in Master Precision).
 */
export function classifyClick(scene, foundIds, x, y, tolerance) {
  let best = null;
  let bestScore = Infinity;
  for (const diff of scene.diffs) {
    const d = boxDistance(diff, x, y);
    if (d > tolerance) continue;
    const c = diffCenter(diff);
    const score = d * 4 + Math.hypot(c.x - x, c.y - y) * 0.1;
    if (score < bestScore) { bestScore = score; best = diff; }
  }
  if (!best) return { kind: 'miss', diff: null };
  return { kind: foundIds.includes(best.id) ? 'repeat' : 'find', diff: best };
}

/** Structural checks on a scene's differences: unique ids, names, boxes inside the plate, no overlap. */
export function validateDiffSet(scene) {
  const problems = [];
  const ids = new Set();
  scene.diffs.forEach((d, i) => {
    if (ids.has(d.id)) problems.push(`duplicate id ${d.id}`);
    ids.add(d.id);
    if (!d.name) problems.push(`unnamed ${d.id}`);
    const [x, y, w, h] = d.box;
    if (x < 0 || y < 0 || x + w > PLATE_W || y + h > PLATE_H) problems.push(`${d.id} outside plate`);
    for (const e of scene.diffs.slice(i + 1)) {
      const [ex, ey, ew, eh] = e.box;
      if (x < ex + ew && ex < x + w && y < ey + eh && ey < y + h) problems.push(`${d.id} overlaps ${e.id}`);
    }
  });
  return problems;
}

export function isRoundComplete(round, scene) {
  return round.found.length >= scene.diffs.length;
}

export function unfoundDiffs(round, scene) {
  return scene.diffs.filter((d) => !round.found.includes(d.id));
}

/**
 * Paints both plates at 1:1 and compares them pixel by pixel. Every changed pixel must fall in a
 * registered box (2px margin for antialiasing) and every box must hold a clearly visible change.
 */
export function auditPlatePixels(scene, paintPlate, minPixels = 40) {
  const a = paintPlate(scene, false, 1, true).getContext('2d').getImageData(0, 0, PLATE_W, PLATE_H).data;
  const b = paintPlate(scene, true, 1, true).getContext('2d').getImageData(0, 0, PLATE_W, PLATE_H).data;
  const perDiff = Object.fromEntries(scene.diffs.map((d) => [d.id, 0]));
  let stray = 0;
  const strayBox = [Infinity, Infinity, -Infinity, -Infinity];
  for (let y = 0; y < PLATE_H; y++) {
    for (let x = 0; x < PLATE_W; x++) {
      const i = (y * PLATE_W + x) * 4;
      const delta = Math.max(Math.abs(a[i] - b[i]), Math.abs(a[i + 1] - b[i + 1]), Math.abs(a[i + 2] - b[i + 2]));
      if (delta < 12) continue;
      const owner = scene.diffs.find((d) => {
        const [bx, by, bw, bh] = d.box;
        return x >= bx - 2 && x <= bx + bw + 2 && y >= by - 2 && y <= by + bh + 2;
      });
      if (owner) perDiff[owner.id] += 1;
      else {
        stray += 1;
        strayBox[0] = Math.min(strayBox[0], x); strayBox[1] = Math.min(strayBox[1], y);
        strayBox[2] = Math.max(strayBox[2], x); strayBox[3] = Math.max(strayBox[3], y);
      }
    }
  }
  const faint = Object.entries(perDiff).filter(([, n]) => n < minPixels).map(([id]) => id);
  return { scene: scene.id, ok: stray === 0 && faint.length === 0, stray, strayBox: stray ? strayBox : null, faint, perDiff };
}
