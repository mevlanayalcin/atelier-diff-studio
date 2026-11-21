// Shared painterly brushwork for every plate: seeded randomness, gradients, inked shapes,
// soft contact shadows, light pools and shafts, paper grain. Every helper is deterministic,
// so the Original and Altered plates paint identically wherever no difference is registered.

export const PLATE_W = 800;
export const PLATE_H = 680;
export const INK = 'rgba(40,24,14,0.82)';
export const SERIF = 'Georgia, "Liberation Serif", "DejaVu Serif", serif';
const TAU = Math.PI * 2;

/** Mulberry32: a tiny seeded generator, so every brush dab lands in the same place on both plates. */
export function seeded(seed) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = Math.imul(a ^ (a >>> 15), a | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export function linear(ctx, x0, y0, x1, y1, stops) {
  const g = ctx.createLinearGradient(x0, y0, x1, y1);
  stops.forEach((c, i) => g.addColorStop(i / (stops.length - 1), c));
  return g;
}

export function radial(ctx, x, y, r, stops, r0 = 0) {
  const g = ctx.createRadialGradient(x, y, r0, x, y, r);
  stops.forEach((c, i) => g.addColorStop(i / (stops.length - 1), c));
  return g;
}

function finish(ctx, fill, ink, lw) {
  if (fill) { ctx.fillStyle = fill; ctx.fill(); }
  if (ink) {
    ctx.strokeStyle = ink === true ? INK : ink;
    ctx.lineWidth = lw;
    ctx.lineJoin = 'round';
    ctx.lineCap = 'round';
    ctx.stroke();
  }
}

export function rect(ctx, x, y, w, h, fill, ink, lw = 1.4) {
  ctx.beginPath(); ctx.rect(x, y, w, h); finish(ctx, fill, ink, lw);
}

export function rrect(ctx, x, y, w, h, r, fill, ink, lw = 1.4) {
  ctx.beginPath(); ctx.roundRect(x, y, w, h, r); finish(ctx, fill, ink, lw);
}

export function oval(ctx, x, y, rx, ry, fill, ink, lw = 1.4, rot = 0) {
  ctx.beginPath(); ctx.ellipse(x, y, rx, ry, rot, 0, TAU); finish(ctx, fill, ink, lw);
}

/** A closed polygon from a flat [x0, y0, x1, y1, ...] list. */
export function poly(ctx, pts, fill, ink, lw = 1.4, open = false) {
  ctx.beginPath();
  ctx.moveTo(pts[0], pts[1]);
  for (let i = 2; i < pts.length; i += 2) ctx.lineTo(pts[i], pts[i + 1]);
  if (!open) ctx.closePath();
  finish(ctx, fill, ink, lw);
}

export function line(ctx, pts, color, lw = 1.4) { poly(ctx, pts, null, color, lw, true); }

/** Any custom outline: `build` traces the path, then it is filled and inked. */
export function shape(ctx, build, fill, ink, lw = 1.4) {
  ctx.beginPath(); build(ctx); finish(ctx, fill, ink, lw);
}

/** A ring segment between two radii: stained-glass panes, arches, awnings. */
export function arcBand(ctx, x, y, r0, r1, a0, a1, fill, ink, lw = 1.4) {
  ctx.beginPath();
  ctx.arc(x, y, r1, a0, a1);
  ctx.arc(x, y, r0, a1, a0, true);
  ctx.closePath();
  finish(ctx, fill, ink, lw);
}

/** Soft elliptical contact shadow that anchors a prop to its surface. */
export function contactShadow(ctx, x, y, rx, ry, alpha = 0.34) {
  ctx.save();
  ctx.translate(x, y);
  ctx.scale(1, ry / rx);
  ctx.fillStyle = radial(ctx, 0, 0, rx, [`rgba(24,12,6,${alpha})`, `rgba(24,12,6,${alpha * 0.5})`, 'rgba(24,12,6,0)']);
  ctx.beginPath(); ctx.arc(0, 0, rx, 0, TAU); ctx.fill();
  ctx.restore();
}

/** Additive pool of light: lamp halos, window glow, lantern bloom. */
export function glow(ctx, x, y, r, rgb, alpha = 0.5) {
  ctx.save();
  ctx.globalCompositeOperation = 'lighter';
  ctx.fillStyle = radial(ctx, x, y, r, [`rgba(${rgb},${alpha})`, `rgba(${rgb},${alpha * 0.35})`, `rgba(${rgb},0)`]);
  ctx.fillRect(x - r, y - r, r * 2, r * 2);
  ctx.restore();
}

/** Slanted god-rays: each shaft is [topX, topWidth, bottomX, bottomWidth]. */
export function lightShafts(ctx, shafts, rgb, alpha, top, bottom) {
  ctx.save();
  ctx.globalCompositeOperation = 'screen';
  for (const [tx, tw, bx, bw] of shafts) {
    ctx.fillStyle = linear(ctx, 0, top, 0, bottom, [`rgba(${rgb},${alpha})`, `rgba(${rgb},${alpha * 0.4})`, `rgba(${rgb},0)`]);
    poly(ctx, [tx, top, tx + tw, top, bx + bw, bottom, bx, bottom], ctx.fillStyle);
  }
  ctx.restore();
}

/** Painterly dabs: short seeded strokes that give flat fills a brushed surface. */
export function brushwork(ctx, x, y, w, h, colors, seed, count, len = 14, alpha = 0.18, width = 3) {
  const rnd = seeded(seed);
  ctx.save();
  ctx.lineCap = 'round';
  ctx.globalAlpha = alpha;
  for (let i = 0; i < count; i++) {
    const px = x + rnd() * w, py = y + rnd() * h, a = (rnd() - 0.5) * 0.9, l = len * (0.5 + rnd());
    ctx.strokeStyle = colors[Math.floor(rnd() * colors.length)];
    ctx.lineWidth = width * (0.6 + rnd() * 0.8);
    ctx.beginPath();
    ctx.moveTo(px, py);
    ctx.quadraticCurveTo(px + l * 0.5, py + Math.sin(a) * l * 0.4 - 2, px + Math.cos(a) * l, py + Math.sin(a) * l);
    ctx.stroke();
  }
  ctx.restore();
}

/** Fine speckle of light: dust motes, snow, stars, spray. */
export function motes(ctx, x, y, w, h, n, seed, color, rMax = 1.6) {
  const rnd = seeded(seed);
  ctx.fillStyle = color;
  for (let i = 0; i < n; i++) {
    ctx.beginPath();
    ctx.arc(x + rnd() * w, y + rnd() * h, 0.4 + rnd() * rMax, 0, TAU);
    ctx.fill();
  }
}

/** A pointed leaf with a centre vein, `ang` in radians from its base. */
export function leaf(ctx, x, y, len, wid, ang, fill, ink = true, vein = true) {
  ctx.save();
  ctx.translate(x, y); ctx.rotate(ang);
  shape(ctx, (c) => {
    c.moveTo(0, 0);
    c.quadraticCurveTo(len * 0.45, -wid, len, 0);
    c.quadraticCurveTo(len * 0.45, wid, 0, 0);
  }, fill, ink, 1.1);
  if (vein) line(ctx, [2, 0, len * 0.9, 0], 'rgba(20,40,20,0.45)', 0.9);
  ctx.restore();
}

/** A round blossom of `n` petals around a coloured heart. */
export function blossom(ctx, x, y, r, n, fill, heart, rot = 0) {
  for (let i = 0; i < n; i++) {
    const a = rot + (i / n) * TAU;
    oval(ctx, x + Math.cos(a) * r * 0.55, y + Math.sin(a) * r * 0.55, r * 0.55, r * 0.32, fill, INK, 0.8, a);
  }
  oval(ctx, x, y, r * 0.28, r * 0.28, heart, INK, 0.7);
}

export function star(ctx, x, y, r, n, inner, fill, rot = -Math.PI / 2, ink = null) {
  const pts = [];
  for (let i = 0; i < n * 2; i++) {
    const a = rot + (i / (n * 2)) * TAU, rr = i % 2 ? r * inner : r;
    pts.push(x + Math.cos(a) * rr, y + Math.sin(a) * rr);
  }
  poly(ctx, pts, fill, ink, 1);
}

/** A toothed gear with a hub and spokes. */
export function gear(ctx, x, y, r, teeth, fill, rot = 0, ink = true) {
  const pts = [];
  for (let i = 0; i < teeth * 4; i++) {
    const a = rot + (i / (teeth * 4)) * TAU, rr = (i % 4 < 2) ? r : r * 0.84;
    pts.push(x + Math.cos(a) * rr, y + Math.sin(a) * rr);
  }
  poly(ctx, pts, fill, ink, 1.2);
  oval(ctx, x, y, r * 0.62, r * 0.62, 'rgba(0,0,0,0.12)', INK, 0.8);
  for (let s = 0; s < 4; s++) {
    const a = rot + (s / 4) * TAU;
    line(ctx, [x, y, x + Math.cos(a) * r * 0.62, y + Math.sin(a) * r * 0.62], 'rgba(60,36,10,0.6)', r * 0.12);
  }
  oval(ctx, x, y, r * 0.16, r * 0.16, '#3a2a18', INK, 0.8);
}

/** A dial with tick marks and hands at hour:minute; `skip` drops one hour mark. */
export function clockFace(ctx, x, y, r, hour, minute, { face = '#f4ead2', rim = '#b8872f', skip = -1, roman = false } = {}) {
  oval(ctx, x, y, r + r * 0.14, r + r * 0.14, rim, INK, 1.4);
  oval(ctx, x, y, r, r, face, INK, 1);
  ctx.fillStyle = INK;
  for (let i = 0; i < 12; i++) {
    if (i === skip) continue;
    const a = (i / 12) * TAU - Math.PI / 2;
    if (roman && r > 20) {
      text(ctx, ROMAN[i], x + Math.cos(a) * r * 0.76, y + Math.sin(a) * r * 0.76 + r * 0.06, r * 0.2, INK);
    } else {
      line(ctx, [x + Math.cos(a) * r * 0.78, y + Math.sin(a) * r * 0.78, x + Math.cos(a) * r * 0.92, y + Math.sin(a) * r * 0.92], INK, i % 3 ? 1 : 2);
    }
  }
  const ha = ((hour % 12) + minute / 60) / 12 * TAU - Math.PI / 2, ma = minute / 60 * TAU - Math.PI / 2;
  line(ctx, [x, y, x + Math.cos(ha) * r * 0.5, y + Math.sin(ha) * r * 0.5], '#1c120a', Math.max(1.6, r * 0.08));
  line(ctx, [x, y, x + Math.cos(ma) * r * 0.78, y + Math.sin(ma) * r * 0.78], '#1c120a', Math.max(1.1, r * 0.05));
  oval(ctx, x, y, r * 0.07 + 1, r * 0.07 + 1, '#1c120a');
}
const ROMAN = ['XII', 'I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII', 'IX', 'X', 'XI'];

export function text(ctx, str, x, y, size, color, align = 'center', weight = '600', font = SERIF) {
  ctx.font = `${weight} ${size}px ${font}`;
  ctx.textAlign = align;
  ctx.textBaseline = 'middle';
  ctx.fillStyle = color;
  ctx.fillText(str, x, y);
}

/** Diagonal ink hatching inside a rectangle: engraved shade on wood, stone and cloth. */
export function hatch(ctx, x, y, w, h, gap, color, lw = 0.7) {
  ctx.save();
  ctx.beginPath(); ctx.rect(x, y, w, h); ctx.clip();
  ctx.strokeStyle = color; ctx.lineWidth = lw;
  ctx.beginPath();
  for (let d = -h; d < w; d += gap) { ctx.moveTo(x + d, y + h); ctx.lineTo(x + d + h, y); }
  ctx.stroke();
  ctx.restore();
}

/** Wood planks with seeded grain lines. */
export function planks(ctx, x, y, w, h, n, base, grain, seed, vertical = false) {
  rect(ctx, x, y, w, h, base);
  const rnd = seeded(seed);
  ctx.save();
  ctx.beginPath(); ctx.rect(x, y, w, h); ctx.clip();
  for (let i = 0; i < n; i++) {
    const t = i / n;
    const s = vertical ? [x + w * t, y, x + w * t, y + h] : [x, y + h * t, x + w, y + h * t];
    line(ctx, s, 'rgba(30,14,6,0.45)', 1.2);
    for (let k = 0; k < 3; k++) {
      const o = (rnd() * 0.8 + 0.1) / n;
      const g = vertical ? [x + w * (t + o), y, x + w * (t + o) + 3, y + h] : [x, y + h * (t + o), x + w, y + h * (t + o) + 2];
      line(ctx, g, grain, 0.6);
    }
  }
  ctx.restore();
}

let grainTile = null;
/** Warm paper grain laid over the whole plate, the same tile on both plates. */
export function paperGrain(ctx, w, h, alpha = 0.09) {
  if (!grainTile) {
    grainTile = document.createElement('canvas');
    grainTile.width = grainTile.height = 160;
    const g = grainTile.getContext('2d');
    const img = g.createImageData(160, 160), rnd = seeded(4242);
    for (let i = 0; i < img.data.length; i += 4) {
      const v = 120 + rnd() * 120;
      img.data[i] = v; img.data[i + 1] = v * 0.94; img.data[i + 2] = v * 0.82; img.data[i + 3] = 255;
    }
    g.putImageData(img, 0, 0);
  }
  ctx.save();
  ctx.globalAlpha = alpha;
  ctx.globalCompositeOperation = 'overlay';
  ctx.fillStyle = ctx.createPattern(grainTile, 'repeat');
  ctx.fillRect(0, 0, w, h);
  ctx.restore();
}

/** Darkened corners that pull the eye into the plate. */
export function vignette(ctx, w, h, alpha = 0.4, rgb = '20,10,4') {
  ctx.fillStyle = radial(ctx, w / 2, h / 2, Math.hypot(w, h) * 0.58, [`rgba(${rgb},0)`, `rgba(${rgb},0)`, `rgba(${rgb},${alpha})`], 0);
  ctx.fillRect(0, 0, w, h);
}

/** Drifting motes drawn live over both plates alike: dust in sunbeams, sparks, snow, spray. */
export function ambientMotes(ctx, t, seed, rgb, count = 22) {
  const rnd = seeded(seed);
  for (let i = 0; i < count; i++) {
    const bx = rnd() * PLATE_W, by = rnd() * PLATE_H, sp = 6 + rnd() * 10, ph = rnd() * TAU, r = 0.8 + rnd() * 1.6;
    const x = (bx + Math.sin(t * 0.3 + ph) * 24 + t * sp * 0.4) % PLATE_W;
    const y = (by + Math.cos(t * 0.25 + ph) * 18 - t * sp * 0.3 + PLATE_H * 4) % PLATE_H;
    ctx.fillStyle = `rgba(${rgb},${0.18 + 0.22 * (0.5 + 0.5 * Math.sin(t * 1.4 + ph))})`;
    ctx.beginPath(); ctx.arc(x, y, r, 0, TAU); ctx.fill();
  }
}
