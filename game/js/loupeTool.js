// The twin magnifying loupe: one aim point in plate coordinates, drawn as a 2.2x brass-rimmed
// lens on both plates at once, so the same patch of each picture can be compared side by side.

export const LOUPE_ZOOM = 2.2;
export const LOUPE_RADIUS = 78;

export function createLoupe() {
  return { toggled: false, held: false, x: 400, y: 340, hasAim: false };
}

export function loupeActive(loupe) {
  return (loupe.toggled || loupe.held) && loupe.hasAim;
}

export function aimLoupe(loupe, x, y) {
  loupe.x = Math.max(0, Math.min(800, x));
  loupe.y = Math.max(0, Math.min(680, y));
  loupe.hasAim = true;
}

/**
 * Draws the lens on a plate context already scaled to plate units. `art` is that plate's
 * high-resolution painting; `k` is plate units per screen pixel, for crisp rim widths.
 */
export function drawLoupe(ctx, art, loupe, k) {
  const { x, y } = loupe;
  const R = LOUPE_RADIUS;
  const s = art.width / 800;
  const half = R / LOUPE_ZOOM;
  // handle first, angled away from the nearest plate edge
  const ang = (x > 560 ? Math.PI * 0.75 : Math.PI * 0.25) * (y > 470 ? -1 : 1);
  ctx.save();
  ctx.translate(x, y); ctx.rotate(ang);
  const hg = ctx.createLinearGradient(0, -8, 0, 8);
  hg.addColorStop(0, '#8a4a22'); hg.addColorStop(0.5, '#c27a44'); hg.addColorStop(1, '#5a2c12');
  ctx.fillStyle = hg; ctx.strokeStyle = 'rgba(30,14,4,0.9)'; ctx.lineWidth = 1.4 * k;
  ctx.beginPath(); ctx.roundRect(R + 4, -8, 64, 16, 7); ctx.fill(); ctx.stroke();
  ctx.fillStyle = '#d9a943';
  ctx.beginPath(); ctx.roundRect(R - 2, -10, 16, 20, 3); ctx.fill(); ctx.stroke();
  ctx.restore();
  // magnified view
  ctx.save();
  ctx.beginPath(); ctx.arc(x, y, R, 0, Math.PI * 2); ctx.clip();
  ctx.fillStyle = '#1a120c'; ctx.fillRect(x - R, y - R, R * 2, R * 2);
  ctx.imageSmoothingQuality = 'high';
  ctx.drawImage(art, (x - half) * s, (y - half) * s, half * 2 * s, half * 2 * s, x - R, y - R, R * 2, R * 2);
  const glare = ctx.createRadialGradient(x - R * 0.45, y - R * 0.5, 2, x - R * 0.2, y - R * 0.2, R * 1.2);
  glare.addColorStop(0, 'rgba(255,255,255,0.32)'); glare.addColorStop(0.35, 'rgba(255,255,255,0.05)'); glare.addColorStop(1, 'rgba(30,10,0,0.28)');
  ctx.fillStyle = glare; ctx.fillRect(x - R, y - R, R * 2, R * 2);
  ctx.strokeStyle = 'rgba(255,240,200,0.45)'; ctx.lineWidth = 1 * k;
  ctx.beginPath(); ctx.moveTo(x - 7 * k, y); ctx.lineTo(x + 7 * k, y); ctx.moveTo(x, y - 7 * k); ctx.lineTo(x, y + 7 * k); ctx.stroke();
  ctx.restore();
  // brass rim
  const rim = ctx.createLinearGradient(x - R, y - R, x + R, y + R);
  rim.addColorStop(0, '#fff0b8'); rim.addColorStop(0.35, '#d9a943'); rim.addColorStop(0.7, '#8a5c18'); rim.addColorStop(1, '#f2cf72');
  ctx.strokeStyle = rim; ctx.lineWidth = 9 * k;
  ctx.beginPath(); ctx.arc(x, y, R + 4 * k, 0, Math.PI * 2); ctx.stroke();
  ctx.strokeStyle = 'rgba(30,14,4,0.85)'; ctx.lineWidth = 1.3 * k;
  ctx.beginPath(); ctx.arc(x, y, R, 0, Math.PI * 2); ctx.stroke();
  ctx.beginPath(); ctx.arc(x, y, R + 8.5 * k, 0, Math.PI * 2); ctx.stroke();
  for (let i = 0; i < 36; i++) {
    const a = (i / 36) * Math.PI * 2;
    ctx.beginPath();
    ctx.moveTo(x + Math.cos(a) * (R + 6.5 * k), y + Math.sin(a) * (R + 6.5 * k));
    ctx.lineTo(x + Math.cos(a) * (R + 8.5 * k), y + Math.sin(a) * (R + 8.5 * k));
    ctx.stroke();
  }
  ctx.fillStyle = '#2a1a0a';
  ctx.font = `700 ${9 * k}px Georgia, serif`;
  ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
  ctx.fillText('2.2×', x, y + R + 18 * k);
}
