// Plate I: a sunlit Victorian glasshouse. Ironwork arch and stained-glass transom behind,
// hanging ferns and a brass barometer in the middle ground, monstera, koi pond and the
// potting bench in front. `alt(id)` is true on the Altered Plate for each changed detail.
import {
  arcBand, blossom, brushwork, contactShadow, glow, leaf, lightShafts, line, linear, motes,
  oval, paperGrain, poly, radial, rect, rrect, shape, text, vignette, INK,
} from '../artPrimitives.js';

const IRON = '#27402f';
const IRON_HI = 'rgba(150,190,150,0.55)';
const TERRA = '#b9643a';

function iron(ctx, pts, w) {
  line(ctx, pts, IRON, w);
  line(ctx, pts, IRON_HI, Math.max(1, w * 0.25));
}

function glassWall(ctx) {
  rect(ctx, 0, 0, 800, 480, linear(ctx, 0, 0, 0, 470, ['#9ccbd8', '#cfe6e4', '#f6eecf']));
  for (const [x, y, r, c] of [[40, 410, 120, '#8bb496'], [230, 425, 130, '#9cc4a1'], [430, 418, 140, '#86b192'], [640, 428, 130, '#95bd9d'], [790, 410, 110, '#88b491']]) oval(ctx, x, y, r, r * 0.42, c);
  rect(ctx, 0, 418, 800, 62, '#7fa785');
  brushwork(ctx, 0, 0, 800, 440, ['#ffffff', '#e4f4ef'], 11, 80, 46, 0.12, 7);
  // garden path beyond the doors
  poly(ctx, [372, 470, 428, 470, 412, 420, 388, 420], '#e7d6ad');
  // the great arch and its radiating ribs
  for (let k = 1; k < 8; k++) {
    const a = Math.PI + (k * Math.PI) / 8;
    iron(ctx, [400 + Math.cos(a) * 62, 250 + Math.sin(a) * 62, 400 + Math.cos(a) * 230, 250 + Math.sin(a) * 230], 4);
  }
  for (const r of [150, 230]) {
    shape(ctx, (c) => c.arc(400, 250, r, Math.PI, 0), null, IRON, r > 200 ? 11 : 5);
    shape(ctx, (c) => c.arc(400, 250, r, Math.PI, 0), null, IRON_HI, 1.4);
  }
  for (const x of [30, 100]) { iron(ctx, [x, 0, x, 470], 5); iron(ctx, [800 - x, 0, 800 - x, 470], 5); }
  iron(ctx, [0, 120, 212, 120], 5); iron(ctx, [588, 120, 800, 120], 5);
  iron(ctx, [0, 250, 800, 250], 8);
  for (const x of [170, 240, 310, 490, 560, 630]) iron(ctx, [x, 250, x, 470], x === 170 || x === 630 ? 10 : 5);
  iron(ctx, [0, 470, 800, 470], 6);
}

function palm(ctx, bx, by, tx, ty, flip) {
  shape(ctx, (c) => { c.moveTo(bx, by); c.quadraticCurveTo(bx + flip * 30, (by + ty) / 2, tx, ty); }, null, '#6a4a2a', 11);
  for (let t = 0.1; t < 0.95; t += 0.08) {
    const u = 1 - t, x = u * u * bx + 2 * u * t * (bx + flip * 30) + t * t * tx, y = u * u * by + 2 * u * t * ((by + ty) / 2) + t * t * ty;
    line(ctx, [x - 5, y, x + 5, y - 2], 'rgba(40,24,10,0.6)', 1.4);
  }
  for (const [dx, dy, cx, cy] of [[-95, 40, -50, -30], [95, 44, 50, -28], [-70, 70, -40, 10], [70, 76, 40, 12], [-20, -70, -30, -50], [30, -64, 30, -48], [-110, -6, -60, -46], [108, -2, 60, -44]]) {
    frond(ctx, tx, ty, tx + cx, ty + cy, tx + dx, ty + dy, '#3f7d3a');
  }
}

function ivyArch(ctx) {
  for (let a = Math.PI * 1.02; a < Math.PI * 1.98; a += 0.055) {
    const x = 400 + Math.cos(a) * 236, y = 250 + Math.sin(a) * 236;
    leaf(ctx, x, y, 12, 5, a + 1.9, '#4f8a3c', 'rgba(30,60,25,0.7)', false);
    leaf(ctx, x, y, 10, 4, a - 1.2, '#5f9a48', 'rgba(30,60,25,0.7)', false);
  }
  for (const x of [8, 792]) for (let y = 20; y < 460; y += 16) leaf(ctx, x + Math.sin(y / 30) * 6, y, 11, 4.5, y % 32 ? 0.6 : 2.5, '#4c8a3a', 'rgba(30,60,25,0.7)', false);
}

function transom(ctx, alt) {
  const panes = ['#b8323a', '#2f5fa8', '#3f9a63', '#e0a73a', '#2f5fa8', '#b8323a'];
  if (alt('transom')) panes[3] = '#7b3ea6';
  oval(ctx, 400, 250, 66, 66, IRON);
  panes.forEach((c, i) => arcBand(ctx, 400, 250, 24, 60, Math.PI + (i * Math.PI) / 6, Math.PI + ((i + 1) * Math.PI) / 6, c, INK, 2));
  arcBand(ctx, 400, 250, 0, 24, Math.PI, Math.PI * 2, '#f1cf62', INK, 2);
  glow(ctx, 400, 228, 60, '255,230,170', 0.28);
  // the double glass doors
  rect(ctx, 343, 250, 114, 222, IRON);
  for (const x of [349, 403]) {
    rect(ctx, x, 256, 48, 208, 'rgba(210,236,232,0.55)', INK, 1);
    for (let y = 256; y < 464; y += 52) rect(ctx, x, y, 48, 52, null, 'rgba(30,50,40,0.9)', 2);
  }
  oval(ctx, 397, 372, 3, 3, '#d9a943', INK, 0.8); oval(ctx, 407, 372, 3, 3, '#d9a943', INK, 0.8);
}

function planterBeds(ctx) {
  for (const [x0, x1, seed] of [[176, 336, 3], [464, 624, 9]]) {
    for (let x = x0; x < x1; x += 22) oval(ctx, x + 10, 446 - ((x * 7) % 9), 20, 18, ((x / 22) | 0) % 2 ? '#3f7a3f' : '#4f8c46');
    motes(ctx, x0, 430, x1 - x0, 24, 18, seed, '#f2a0b4', 2.6);
    rect(ctx, x0 - 4, 458, x1 - x0 + 8, 14, '#8a5a3c', INK, 1.2);
  }
}

function pillar(ctx, x) {
  rect(ctx, x - 15, 0, 30, 478, linear(ctx, x - 15, 0, x + 15, 0, ['#1e3326', '#47664f', '#1c2f23']), INK, 1.2);
  for (const dx of [-7, 0, 7]) line(ctx, [x + dx, 160, x + dx, 450], 'rgba(10,20,12,0.5)', 1);
  for (const y of [138, 452]) rect(ctx, x - 22, y, 44, 16, linear(ctx, x - 22, 0, x + 22, 0, ['#8a6a2a', '#e2bd62', '#8a6a2a']), INK, 1.2);
}

function barometer(ctx, alt) {
  const x = 110, y = 300;
  ctx.save();
  ctx.translate(x, y); ctx.scale(1.25, 1.25); ctx.translate(-x, -y);
  contactShadow(ctx, x + 5, y + 8, 40, 40, 0.3);
  oval(ctx, x, y, 34, 34, radial(ctx, x - 10, y - 12, 44, ['#f6d68a', '#c08e33', '#6e4a16']), INK, 1.5);
  oval(ctx, x, y, 26, 26, '#f5ecd6', INK, 1);
  for (let i = 0; i <= 10; i++) {
    const a = Math.PI * 0.75 + (i / 10) * Math.PI * 1.5;
    line(ctx, [x + Math.cos(a) * 19, y + Math.sin(a) * 19, x + Math.cos(a) * 24, y + Math.sin(a) * 24], INK, i % 5 ? 0.8 : 1.6);
  }
  text(ctx, 'RAIN', x - 11, y + 13, 5.5, '#5a3a20');
  text(ctx, 'FAIR', x + 11, y + 13, 5.5, '#5a3a20');
  if (!alt('needle')) {
    const a = -Math.PI / 3;
    poly(ctx, [x - Math.cos(a) * 6 - 1.6, y - Math.sin(a) * 6, x + Math.cos(a) * 22, y + Math.sin(a) * 22, x - Math.cos(a) * 6 + 1.6, y - Math.sin(a) * 6 + 1.6], '#1f2b44', INK, 0.8);
  }
  oval(ctx, x, y, 3.2, 3.2, '#c9973d', INK, 0.8);
  ctx.restore();
}

function frond(ctx, sx, sy, cx, cy, ex, ey, color) {
  shape(ctx, (c) => { c.moveTo(sx, sy); c.quadraticCurveTo(cx, cy, ex, ey); }, null, '#2f5a26', 1.6);
  for (let t = 0.12; t < 0.98; t += 0.09) {
    const u = 1 - t, px = u * u * sx + 2 * u * t * cx + t * t * ex, py = u * u * sy + 2 * u * t * cy + t * t * ey;
    const dx = 2 * u * (cx - sx) + 2 * t * (ex - cx), dy = 2 * u * (cy - sy) + 2 * t * (ey - cy), a = Math.atan2(dy, dx), l = 13 * (1.1 - t * 0.6);
    leaf(ctx, px, py, l, 3.4, a - 1.1, color, 'rgba(30,60,25,0.7)', false);
    leaf(ctx, px, py, l, 3.4, a + 1.1, color, 'rgba(30,60,25,0.7)', false);
  }
}

function hangingFern(ctx, x, alt, which) {
  for (let y = 4; y < 140; y += 9) oval(ctx, x, y, 2.4, 4.2, null, '#5b4a2c', 1.3);
  const fronds = [[-16, 150, -60, 170, -62, 236], [16, 150, 60, 170, 64, 238], [-6, 152, -28, 200, -26, 262], [6, 152, 30, 196, 30, 256], [0, 148, -40, 130, -78, 168], [0, 148, 40, 128, 80, 170]];
  fronds.forEach(([a, b, c, d, e, f], i) => {
    if (which === 'left' && i === 0 && alt('fern')) return;
    frond(ctx, x + a, b, x + c, d, x + e, f, i % 2 ? '#5c9a43' : '#4c8a3a');
  });
  shape(ctx, (c) => { c.moveTo(x - 30, 140); c.quadraticCurveTo(x, 182, x + 30, 140); c.closePath(); }, '#8a6436', INK, 1.4);
  for (let k = -24; k <= 24; k += 8) line(ctx, [x + k, 142, x + k * 0.7, 156 - Math.abs(k) * 0.2], 'rgba(40,22,8,0.5)', 1);
}

function monsteraLeaf(ctx, x, y, r, ang, holes) {
  ctx.save();
  ctx.translate(x, y); ctx.rotate(ang);
  shape(ctx, (c) => {
    c.moveTo(0, r * 0.75);
    c.bezierCurveTo(-r * 1.1, r * 0.6, -r * 1.05, -r * 0.85, 0, -r * 0.62);
    c.bezierCurveTo(r * 1.05, -r * 0.85, r * 1.1, r * 0.6, 0, r * 0.75);
  }, radial(ctx, -r * 0.3, -r * 0.3, r * 1.3, ['#5aa25a', '#2f7039', '#1d4d28']), INK, 1.3);
  line(ctx, [0, r * 0.7, 0, -r * 0.55], 'rgba(190,230,170,0.55)', 1.6);
  if (holes) {
    for (const s of [-1, 1]) for (let k = 0; k < 3; k++) {
      const yy = -r * 0.35 + k * r * 0.33;
      shape(ctx, (c) => { c.moveTo(s * r * 0.95, yy - 2); c.lineTo(s * r * 0.48, yy + 4); c.lineTo(s * r * 0.95, yy + 8); }, '#163a1e', null);
      oval(ctx, s * r * 0.3, yy + 6, 3.5, 6, '#163a1e', null, 1, s * 0.6);
    }
  }
  ctx.restore();
}

function monstera(ctx, alt) {
  const leaves = [[130, 512, 46, -1.1], [262, 508, 44, 1.0], [140, 410, 52, -0.55], [250, 404, 54, 0.5], [196, 338, 50, 0.05]];
  for (const [lx, ly] of leaves) line(ctx, [196, 566, (lx + 196) / 2, (ly + 566) / 2 + 10, lx, ly + 20], '#3f6a2c', 3);
  leaves.forEach(([lx, ly, r, a], i) => monsteraLeaf(ctx, lx, ly, r, a, !(i === 3 && alt('monstera'))));
  contactShadow(ctx, 196, 646, 70, 14, 0.4);
  poly(ctx, [140, 568, 252, 568, 236, 646, 156, 646], linear(ctx, 140, 0, 252, 0, ['#8e4626', TERRA, '#7a3a1e']), INK, 1.5);
  rect(ctx, 134, 560, 124, 16, '#c87447', INK, 1.4);
}

function koi(ctx, x, y, ang, body, spot) {
  ctx.save();
  ctx.translate(x, y); ctx.rotate(ang);
  poly(ctx, [-16, 0, -28, -8, -25, 0, -28, 8], body, INK, 0.9);
  oval(ctx, 0, 0, 18, 6.5, body, INK, 1);
  oval(ctx, -2, -6, 5, 2.5, body, null, 1, -0.6); oval(ctx, -2, 6, 5, 2.5, body, null, 1, 0.6);
  if (spot) { oval(ctx, 4, -1, 6, 3.5, spot); oval(ctx, -8, 1, 4, 2.6, spot); }
  oval(ctx, 12, -2.5, 1.2, 1.2, '#111');
  ctx.restore();
}

function lilyPad(ctx, x, y, r) {
  shape(ctx, (c) => { c.moveTo(x, y); c.ellipse(x, y, r, r * 0.45, 0, 0.35, Math.PI * 2 - 0.1); c.closePath(); }, '#4f8f45', INK, 1);
  line(ctx, [x, y, x - r * 0.6, y - r * 0.12], 'rgba(20,50,20,0.5)', 0.8);
}

function koiPond(ctx, alt) {
  oval(ctx, 420, 616, 184, 56, '#8f8a7d', INK, 1.4);
  brushwork(ctx, 240, 562, 360, 110, ['#bdb6a3', '#6d675a', '#a59f8e'], 21, 60, 10, 0.5, 5);
  oval(ctx, 420, 616, 164, 42, radial(ctx, 420, 606, 170, ['#3f8c8f', '#22585e', '#143a40']), INK, 1.2);
  ctx.save();
  ctx.beginPath(); ctx.ellipse(420, 616, 162, 40, 0, 0, Math.PI * 2); ctx.clip();
  koi(ctx, 378, 622, 0.25, alt('koi') ? '#1e1e24' : '#ee7a2c', alt('koi') ? '#e8c35a' : '#fff0d8');
  koi(ctx, 462, 600, -2.7, '#fbf3e8', '#d8402a');
  koi(ctx, 540, 630, 3.05, '#f2b632', null);
  for (let i = 0; i < 6; i++) line(ctx, [300 + i * 50, 596 + (i % 3) * 12, 330 + i * 50, 596 + (i % 3) * 12], 'rgba(220,250,245,0.35)', 1.2);
  ctx.restore();
  lilyPad(ctx, 330, 604, 20); lilyPad(ctx, 500, 628, 22); lilyPad(ctx, 566, 602, 16);
  blossom(ctx, 504, 622, 9, 7, '#f6b7c8', '#f4d46b');
}

function butterfly(ctx, x, y, s, wing, vein) {
  ctx.save();
  ctx.translate(x, y); ctx.scale(s, s);
  for (const d of [-1, 1]) {
    shape(ctx, (c) => { c.moveTo(0, 0); c.bezierCurveTo(d * 8, -16, d * 22, -14, d * 18, -2); c.closePath(); }, wing, INK, 1);
    shape(ctx, (c) => { c.moveTo(0, 1); c.bezierCurveTo(d * 16, 2, d * 16, 14, d * 6, 12); c.closePath(); }, wing, INK, 1);
    line(ctx, [0, 0, d * 14, -9], vein, 0.8);
    oval(ctx, d * 14, -8, 2, 2, '#fff8e8');
  }
  line(ctx, [0, -6, 0, 10], '#24170e', 2.4);
  line(ctx, [0, -6, -4, -13], '#24170e', 0.8); line(ctx, [0, -6, 4, -13], '#24170e', 0.8);
  ctx.restore();
}

function orchid(ctx, alt) {
  leaf(ctx, 552, 436, 38, 9, -2.8, '#3e7a3c'); leaf(ctx, 556, 436, 36, 8, -0.3, '#4a8a42');
  shape(ctx, (c) => { c.moveTo(554, 434); c.bezierCurveTo(552, 380, 580, 352, 612, 372); }, null, '#4a5a2a', 2);
  [[566, 384, 0], [582, 366, 0.4], [598, 370, 0.9], [612, 384, 1.3]].forEach(([x, y, r], i) => {
    blossom(ctx, x, y, 11, 5, i === 2 && alt('orchid') ? '#f2cf3c' : '#c4468e', '#f7e07a', r);
  });
  contactShadow(ctx, 552, 470, 26, 6);
  rrect(ctx, 534, 432, 38, 36, 5, linear(ctx, 534, 0, 572, 0, ['#e9eef4', '#ffffff', '#c9d3df']), INK, 1.3);
  for (let k = 0; k < 3; k++) line(ctx, [538, 442 + k * 9, 568, 442 + k * 9], '#3b5d9c', 1.2);
}

function sketchbook(ctx, alt) {
  poly(ctx, [580, 466, 620, 470, 622, 450, 586, 446], '#fbf4e2', INK, 1.1);
  poly(ctx, [620, 470, 662, 466, 656, 446, 622, 450], '#f8efda', INK, 1.1);
  for (let k = 0; k < 4; k++) line(ctx, [590, 452 + k * 4, 614, 455 + k * 4], 'rgba(60,40,20,0.55)', 0.7);
  if (alt('sketch')) {
    for (let i = 0; i < 6; i++) { const a = (i / 6) * Math.PI * 2; oval(ctx, 640 + Math.cos(a) * 4, 457 + Math.sin(a) * 3, 3.5, 2, null, '#4a3018', 0.8, a); }
    line(ctx, [640, 460, 638, 468], '#4a3018', 0.8);
  } else {
    leaf(ctx, 628, 466, 26, 6, -0.9, null, '#4a3018', true);
  }
}

function wateringCan(ctx, alt) {
  ctx.save();
  if (alt('can')) { ctx.translate(1440, 0); ctx.scale(-1, 1); }
  contactShadow(ctx, 720, 466, 34, 6);
  shape(ctx, (c) => { c.moveTo(704, 440); c.lineTo(672, 404); }, null, '#3f7468', 6);
  oval(ctx, 670, 402, 6, 4, '#4f8a7a', INK, 1, -0.8);
  rrect(ctx, 698, 426, 46, 40, 8, linear(ctx, 698, 0, 744, 0, ['#2f6656', '#5fa08a', '#2a5a4c']), INK, 1.4);
  shape(ctx, (c) => c.arc(724, 424, 16, Math.PI * 1.05, Math.PI * 1.95), null, '#2a5a4c', 4);
  line(ctx, [704, 440, 740, 440], 'rgba(255,255,255,0.35)', 1.4);
  ctx.restore();
}

function pottingBench(ctx, alt) {
  contactShadow(ctx, 645, 646, 150, 16, 0.4);
  for (const x of [516, 766]) rect(ctx, x, 476, 12, 170, '#6e4224', INK, 1.2);
  poly(ctx, [515, 438, 775, 438, 787, 468, 503, 468], linear(ctx, 0, 438, 0, 468, ['#a8784a', '#8a5a32']), INK, 1.3);
  rect(ctx, 503, 468, 284, 14, '#6e4224', INK, 1.3);
  rect(ctx, 516, 592, 262, 10, '#7c4c2a', INK, 1.2);
  // lower shelf: a garden trowel and stacked pots
  poly(ctx, [552, 588, 590, 582, 604, 586, 590, 592], linear(ctx, 552, 0, 604, 0, ['#9aa3a8', '#e2e6e8', '#8a9398']), INK, 1);
  rrect(ctx, 604, 582, 34, 8, 4, alt('trowel') ? '#2f63b0' : '#b8382c', INK, 1);
  for (const [x, w] of [[690, 44], [694, 36], [698, 28]]) poly(ctx, [x, 592 - (44 - w) * 1.1, x + w, 592 - (44 - w) * 1.1, x + w - 4, 568 - (44 - w) * 1.1, x + 4, 568 - (44 - w) * 1.1], TERRA, INK, 1.1);
  orchid(ctx, alt);
  sketchbook(ctx, alt);
  wateringCan(ctx, alt);
}

function floor(ctx) {
  rect(ctx, 0, 474, 800, 206, linear(ctx, 0, 474, 0, 680, ['#d4a07a', '#c27a50', '#a35a36']));
  ctx.save();
  ctx.beginPath(); ctx.rect(0, 474, 800, 206); ctx.clip();
  for (let x = -800; x <= 1600; x += 110) line(ctx, [400, 250, x, 680], 'rgba(90,40,20,0.35)', 1.2);
  for (const y of [484, 500, 522, 550, 586, 632]) line(ctx, [0, y, 800, y], 'rgba(90,40,20,0.35)', 1.2);
  ctx.restore();
  brushwork(ctx, 0, 480, 800, 200, ['#e6b48c', '#9a5434'], 31, 90, 22, 0.14, 6);
}

export const conservatoryScene = {
  id: 'conservatory',
  title: 'Grand Botanica Conservatory',
  tier: 'Classic',
  baseTime: 180,
  moteTint: '255,246,214',
  diffs: [
    { id: 'transom', name: 'Violet Transom Pane', box: [398, 186, 40, 66] },
    { id: 'needle', name: 'Missing Barometer Needle', box: [96, 268, 40, 44] },
    { id: 'fern', name: 'Lost Hanging Fern Frond', box: [176, 140, 76, 108] },
    { id: 'monstera', name: 'Uncut Monstera Leaf', box: [188, 346, 118, 116] },
    { id: 'koi', name: 'Black Koi', box: [348, 606, 58, 32] },
    { id: 'orchid', name: 'Golden Orchid Bloom', box: [584, 356, 30, 30] },
    { id: 'sketch', name: 'Flower Sketch', box: [620, 446, 40, 26] },
    { id: 'can', name: 'Reversed Watering Can', box: [660, 394, 120, 80] },
    { id: 'trowel', name: 'Blue Trowel Handle', box: [600, 578, 42, 16] },
    { id: 'butterfly', name: 'Monarch Butterfly', box: [286, 280, 48, 42] },
  ],
  paint(ctx, alt) {
    glassWall(ctx);
    palm(ctx, 30, 470, 52, 170, 1); palm(ctx, 772, 470, 746, 176, -1);
    ivyArch(ctx);
    transom(ctx, alt);
    planterBeds(ctx);
    floor(ctx);
    pillar(ctx, 110); pillar(ctx, 690);
    barometer(ctx, alt);
    hangingFern(ctx, 250, alt, 'left'); hangingFern(ctx, 560, alt, 'right');
    lightShafts(ctx, [[60, 70, 250, 150], [250, 50, 470, 120], [520, 60, 720, 130]], '255,244,210', 0.2, 0, 680);
    koiPond(ctx, alt);
    monstera(ctx, alt);
    pottingBench(ctx, alt);
    butterfly(ctx, 310, 300, 1, alt('butterfly') ? '#ea8a26' : '#3d7fd6', '#1a1208');
    butterfly(ctx, 652, 318, 0.8, '#f4e27c', '#6a5520');
    motes(ctx, 0, 40, 800, 520, 70, 77, 'rgba(255,250,228,0.5)');
    vignette(ctx, 800, 680, 0.34);
    paperGrain(ctx, 800, 680);
  },
};
