// Hints: choose one unfound difference, show it as a pulsing amber radar ring with a floating
// pointer on both plates for a few seconds, then hold the button on a short cooldown.
import { diffCenter, unfoundDiffs } from './diffEngine.js';

export const HINT_DURATION = 5.5;
export const HINT_COOLDOWN = 7;

export function createHintSystem() {
  return { active: null, startedAt: 0, cooldownUntil: 0, offered: new Set(), hold: false };
}

export function hintCooldownLeft(hints, now) {
  return Math.max(0, hints.cooldownUntil - now);
}

/** Why a hint cannot be given right now, or null when it can. */
export function hintBlocker(hints, round, now) {
  if (round.status !== 'play') return 'round over';
  if (round.hintsLeft <= 0) return 'no hints left';
  if (hintCooldownLeft(hints, now) > 0) return 'cooling down';
  return null;
}

const EDGE = 40;
const clearOfEdges = (d) => d.box[0] >= EDGE && d.box[1] >= EDGE && d.box[0] + d.box[2] <= 800 - EDGE && d.box[1] + d.box[3] <= 680 - EDGE;

/**
 * Spends a hint on an unfound difference never hinted before, in the plate's order, preferring
 * ones clear of the plate's edges so the radar ring and pointer show whole.
 */
export function requestHint(hints, round, scene, now) {
  if (hintBlocker(hints, round, now)) return null;
  const open = unfoundDiffs(round, scene);
  const fresh = open.filter((d) => !hints.offered.has(d.id));
  const pool = fresh.length ? fresh : open;
  const pick = pool.find(clearOfEdges) ?? pool[0];
  if (!pick) return null;
  round.hintsLeft -= 1;
  hints.offered.add(pick.id);
  hints.active = pick;
  hints.startedAt = now;
  hints.cooldownUntil = now + HINT_COOLDOWN;
  return pick;
}

/** Drops the hint once its difference is found or its time is up. */
export function updateHint(hints, round, now) {
  if (!hints.active) return;
  if (round.found.includes(hints.active.id) || (!hints.hold && now - hints.startedAt > HINT_DURATION)) hints.active = null;
}

export function resetHints(hints) {
  hints.active = null; hints.cooldownUntil = 0; hints.offered.clear();
}

/** The amber radar: soft glow, rippling rings, a rotating dashed sweep and a bobbing pointer. */
export function drawHintRadar(ctx, hints, now, k) {
  const diff = hints.active;
  if (!diff) return;
  const { x, y, r } = diffCenter(diff);
  const R = Math.max(30, r + 16);
  const age = now - hints.startedAt;
  const fade = Math.min(1, age * 3) * (hints.hold ? 1 : Math.min(1, Math.max(0, (HINT_DURATION - age) * 2)));
  ctx.save();
  ctx.globalAlpha = fade;
  const g = ctx.createRadialGradient(x, y, 0, x, y, R * 1.4);
  g.addColorStop(0, 'rgba(255,190,80,0.28)'); g.addColorStop(1, 'rgba(255,170,60,0)');
  ctx.fillStyle = g; ctx.beginPath(); ctx.arc(x, y, R * 1.4, 0, Math.PI * 2); ctx.fill();
  for (let i = 0; i < 3; i++) {
    const p = (now * 0.7 + i / 3) % 1;
    ctx.strokeStyle = `rgba(255,184,64,${(1 - p) * 0.9})`;
    ctx.lineWidth = 2.6 * k;
    ctx.beginPath(); ctx.arc(x, y, R * (0.55 + p * 0.9), 0, Math.PI * 2); ctx.stroke();
  }
  ctx.setLineDash([9 * k, 7 * k]);
  ctx.lineDashOffset = -now * 30 * k;
  ctx.strokeStyle = 'rgba(255,214,120,0.95)';
  ctx.lineWidth = 2.2 * k;
  ctx.beginPath(); ctx.arc(x, y, R, 0, Math.PI * 2); ctx.stroke();
  ctx.setLineDash([]);
  const above = y - R - 40 * k > 0;
  const bob = Math.sin(now * 4) * 5 * k;
  const tip = above ? y - R - 6 * k + bob : y + R + 6 * k - bob;
  const dir = above ? -1 : 1;
  ctx.fillStyle = '#ffc861';
  ctx.strokeStyle = 'rgba(70,36,6,0.9)';
  ctx.lineWidth = 1.6 * k;
  ctx.beginPath();
  ctx.moveTo(x, tip);
  ctx.lineTo(x - 11 * k, tip + dir * 14 * k);
  ctx.lineTo(x - 4.5 * k, tip + dir * 14 * k);
  ctx.lineTo(x - 4.5 * k, tip + dir * 28 * k);
  ctx.lineTo(x + 4.5 * k, tip + dir * 28 * k);
  ctx.lineTo(x + 4.5 * k, tip + dir * 14 * k);
  ctx.lineTo(x + 11 * k, tip + dir * 14 * k);
  ctx.closePath(); ctx.fill(); ctx.stroke();
  ctx.restore();
}
