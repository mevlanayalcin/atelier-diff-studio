// What a find and a miss look like on the plates: the gold-and-emerald double ring with its
// numbered pin and pulse ripple, the spark burst, the crisp red X, the keyboard reticle and
// the crimson reveal of whatever was left unfound when time ran out.
import { diffCenter } from './diffEngine.js';
import { seeded } from './artPrimitives.js';

export function createFx() {
  return { bursts: [], misses: [] };
}

export function spawnFindBurst(fx, x, y, now) {
  const rnd = seeded(Math.floor(x * 31 + y * 17));
  const sparks = Array.from({ length: 28 }, () => ({ a: rnd() * Math.PI * 2, v: 40 + rnd() * 90, s: 1.4 + rnd() * 2.4, gold: rnd() > 0.35 }));
  fx.bursts.push({ x, y, at: now, sparks });
}

export function spawnMissMark(fx, x, y, now, side) {
  fx.misses.push({ x, y, at: now, side });
}

export function pruneFx(fx, now) {
  fx.bursts = fx.bursts.filter((b) => now - b.at < 1.1);
  fx.misses = fx.misses.filter((m) => now - m.at < 0.9);
}

function ring(ctx, x, y, r, color, width) {
  ctx.strokeStyle = color; ctx.lineWidth = width;
  ctx.beginPath(); ctx.arc(x, y, r, 0, Math.PI * 2); ctx.stroke();
}

/** A found difference: glowing gold outer ring, emerald inner ring, ripple, and a numbered pin. */
export function drawFoundMarker(ctx, diff, number, foundAt, now, k) {
  const { x, y, r } = diffCenter(diff);
  const R = Math.max(18, r + 8);
  const age = now - foundAt;
  const pop = age < 0.35 ? 1 + (1 - age / 0.35) * 0.35 : 1;
  const breathe = 0.8 + Math.sin(now * 2.4 + number) * 0.2;
  ctx.save();
  if (age < 1.2) {
    const p = age / 1.2;
    ring(ctx, x, y, R * (1 + p * 1.2), `rgba(255,226,140,${(1 - p) * 0.9})`, 3 * k * (1 - p) + 0.5 * k);
  }
  ring(ctx, x, y, R * pop + 3 * k, `rgba(255,214,110,${0.25 * breathe})`, 9 * k);
  ring(ctx, x, y, R * pop, '#f3c552', 3.2 * k);
  ring(ctx, x, y, R * pop, 'rgba(60,30,4,0.55)', 0.8 * k);
  ring(ctx, x, y, R * pop - 5 * k, `rgba(46,190,128,${0.95 * breathe + 0.05})`, 2.4 * k);
  const bx = x + R * pop * 0.72, by = y - R * pop * 0.72, br = 10 * k;
  ctx.fillStyle = '#1f6e4c';
  ctx.beginPath(); ctx.arc(bx, by, br + 2 * k, 0, Math.PI * 2); ctx.fill();
  const g = ctx.createLinearGradient(bx, by - br, bx, by + br);
  g.addColorStop(0, '#fff0b0'); g.addColorStop(1, '#d39a2e');
  ctx.fillStyle = g;
  ctx.beginPath(); ctx.arc(bx, by, br, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = '#2a1606';
  ctx.font = `800 ${11.5 * k}px Georgia, "Liberation Serif", serif`;
  ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
  ctx.fillText(String(number), bx, by + 0.5 * k);
  ctx.restore();
}

/** Dashed crimson ring over a difference that was never found (shown after a timeout). */
export function drawRevealMarker(ctx, diff, now, k) {
  const { x, y, r } = diffCenter(diff);
  ctx.save();
  ctx.setLineDash([6 * k, 5 * k]);
  ctx.lineDashOffset = now * 20 * k;
  ring(ctx, x, y, Math.max(18, r + 8), 'rgba(230,60,60,0.95)', 2.6 * k);
  ctx.restore();
}

export function drawFx(ctx, fx, now, k, side) {
  for (const b of fx.bursts) {
    const t = now - b.at;
    for (const s of b.sparks) {
      const d = s.v * t * (1 - t * 0.35);
      ctx.fillStyle = s.gold ? `rgba(255,214,110,${1 - t})` : `rgba(80,220,160,${1 - t})`;
      ctx.beginPath(); ctx.arc(b.x + Math.cos(s.a) * d, b.y + Math.sin(s.a) * d + t * t * 30, s.s * k * (1 - t * 0.6), 0, Math.PI * 2); ctx.fill();
    }
  }
  for (const m of fx.misses) {
    const t = (now - m.at) / 0.9, size = (11 + (1 - Math.min(1, t * 4)) * 6) * k, alpha = m.side === side ? 1 - t : (1 - t) * 0.55;
    ctx.save();
    ctx.lineCap = 'round';
    for (const [w, c] of [[6.5 * k, `rgba(40,0,0,${alpha * 0.6})`], [3.6 * k, `rgba(232,52,52,${alpha})`]]) {
      ctx.strokeStyle = c; ctx.lineWidth = w;
      ctx.beginPath();
      ctx.moveTo(m.x - size, m.y - size); ctx.lineTo(m.x + size, m.y + size);
      ctx.moveTo(m.x + size, m.y - size); ctx.lineTo(m.x - size, m.y + size);
      ctx.stroke();
    }
    ctx.restore();
  }
}

/** The keyboard precision reticle. */
export function drawReticle(ctx, x, y, now, k) {
  const r = (16 + Math.sin(now * 5) * 1.5) * k;
  ctx.save();
  ctx.strokeStyle = 'rgba(255,248,225,0.95)'; ctx.lineWidth = 2 * k;
  ctx.shadowColor = 'rgba(0,0,0,0.6)'; ctx.shadowBlur = 4;
  ctx.beginPath(); ctx.arc(x, y, r, 0, Math.PI * 2); ctx.stroke();
  ctx.beginPath();
  for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) { ctx.moveTo(x + dx * r * 0.5, y + dy * r * 0.5); ctx.lineTo(x + dx * r * 1.5, y + dy * r * 1.5); }
  ctx.stroke();
  ctx.restore();
}
