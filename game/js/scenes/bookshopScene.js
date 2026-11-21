// Plate III: a sunlit harbourfront bookshop and cafe. Arched windows onto a harbour with a
// lighthouse and sailboats, a wall of coloured spines, a copper espresso machine under a
// chalkboard menu, pastries under glass and a reading table with a brass globe.
import {
  brushwork, contactShadow, glow, lightShafts, line, linear, motes, oval, paperGrain, planks,
  poly, radial, rect, rrect, seeded, shape, text, vignette, INK,
} from '../artPrimitives.js';

const COPPER = (ctx, x0, x1) => linear(ctx, x0, 0, x1, 0, ['#6a2e14', '#e09a62', '#b8622e', '#5a2410']);
const SPINES = ['#8c2f2f', '#2f5d7c', '#c79a3a', '#3f6e4a', '#6b3f6e', '#d9c9a2', '#a0522d', '#1f3b57', '#c4683d'];
const SHELF_BOTTOMS = [140, 230, 320, 410, 500];

/** Seeded spine layout, computed once so the registered boxes come from the same numbers. */
function layoutShelf() {
  const rnd = seeded(808);
  return SHELF_BOTTOMS.map((bottom) => {
    const row = [];
    for (let x = 28; x < 220;) {
      const w = 9 + Math.floor(rnd() * 10), h = 50 + Math.floor(rnd() * 26);
      if (x + w > 224) break;
      row.push({ x, y: bottom - h, w, h, color: SPINES[Math.floor(rnd() * SPINES.length)], band: rnd() > 0.4 });
      x += w + 1;
    }
    return row;
  });
}
const SHELF = layoutShelf();
const SPINE = SHELF[1][6];
const GAP = SHELF[3][9];
const bookBox = (b) => [b.x - 1, b.y - 1, b.w + 2, b.h + 2];

function wall(ctx) {
  rect(ctx, 0, 0, 800, 560, linear(ctx, 0, 0, 0, 560, ['#f4e8cc', '#ead6ae']));
  brushwork(ctx, 0, 0, 800, 330, ['#fff6e0', '#d9c398'], 3, 90, 40, 0.2, 8);
  rect(ctx, 236, 342, 310, 218, '#4f7f86');
  for (let x = 236; x < 546; x += 26) line(ctx, [x, 342, x, 560], 'rgba(20,40,44,0.45)', 1.2);
  rect(ctx, 236, 340, 310, 8, '#3d6870', INK, 1);
}

function sailboat(ctx, x, y, s, flip) {
  ctx.save();
  ctx.translate(x, y); ctx.scale(flip ? -s : s, s);
  poly(ctx, [-22, 0, 22, 0, 16, 8, -16, 8], '#7a3a22', INK, 1);
  line(ctx, [0, 0, 0, -56], '#3a2a1a', 1.6);
  poly(ctx, [2, -54, 2, -4, 28, -4], '#fbf6ea', INK, 1);
  poly(ctx, [-2, -44, -2, -6, -18, -6], '#f2e3c4', INK, 1);
  ctx.restore();
}

function gull(ctx, x, y, s) {
  shape(ctx, (c) => { c.moveTo(x - 10 * s, y); c.quadraticCurveTo(x - 5 * s, y - 6 * s, x, y); c.quadraticCurveTo(x + 5 * s, y - 6 * s, x + 10 * s, y); }, null, '#2a2a30', 1.6);
}

function harbourView(ctx, alt) {
  rect(ctx, 250, 70, 300, 172, linear(ctx, 0, 70, 0, 242, ['#7ec2e4', '#cbe8f1', '#f7efd6']));
  for (const [x, y, r] of [[300, 120, 26], [326, 112, 20], [470, 96, 30], [500, 104, 22]]) oval(ctx, x, y, r, r * 0.45, 'rgba(255,255,255,0.75)');
  poly(ctx, [250, 244, 250, 214, 290, 206, 334, 222, 372, 244], '#5d7a4a', INK, 1);
  const stripe = alt('lighthouse') ? '#2f5fb0' : '#c8323a';
  poly(ctx, [292, 236, 308, 236, 305, 168, 295, 168], '#f8f4ea', INK, 1);
  const hw = (y) => 5 + ((y - 168) / 68) * 3;
  for (const y of [176, 196, 216]) poly(ctx, [300 - hw(y), y, 300 + hw(y), y, 300 + hw(y + 10), y + 10, 300 - hw(y + 10), y + 10], stripe);
  rect(ctx, 293, 158, 14, 10, '#ffe9a8', INK, 1);
  poly(ctx, [290, 158, 310, 158, 300, 148], '#3a3a40', INK, 1);
  glow(ctx, 300, 162, 22, '255,230,150', 0.5);
  rect(ctx, 250, 242, 300, 90, linear(ctx, 0, 242, 0, 332, ['#3a8aa2', '#1c5a74']));
  for (let i = 0; i < 18; i++) line(ctx, [256 + (i * 53) % 290, 252 + (i * 17) % 76, 270 + (i * 53) % 290, 252 + (i * 17) % 76], 'rgba(255,255,255,0.55)', 1.2);
  sailboat(ctx, 462, 302, 1, alt('sailboat'));
  sailboat(ctx, 520, 290, 0.6, false);
  gull(ctx, 478, 132, 1);
  gull(ctx, 500, 146, 0.7);
  if (alt('gull')) gull(ctx, 352, 112, 1.25);
}

function harbourWindows(ctx, alt) {
  const arch = (c, x0) => { c.moveTo(x0, 332); c.lineTo(x0, 140); c.arc(x0 + 70, 140, 70, Math.PI, 0); c.lineTo(x0 + 140, 332); c.closePath(); };
  ctx.save();
  ctx.beginPath(); arch(ctx, 250); arch(ctx, 410); ctx.clip();
  harbourView(ctx, alt);
  line(ctx, [270, 80, 300, 330], 'rgba(255,255,255,0.18)', 14);
  ctx.restore();
  for (const x0 of [250, 410]) {
    shape(ctx, (c) => arch(c, x0), null, '#f7f1e4', 9);
    shape(ctx, (c) => arch(c, x0), null, INK, 1.2);
    line(ctx, [x0 + 70, 72, x0 + 70, 332], '#f7f1e4', 5);
    line(ctx, [x0, 200, x0 + 140, 200], '#f7f1e4', 5);
  }
  rect(ctx, 240, 330, 320, 12, '#f2ead8', INK, 1.2);
}

function bunting(ctx, alt) {
  const colors = ['#e46a52', '#3f9a9a', '#e4b23a', '#2f4a7a', '#f4ead0'];
  const sag = (x) => 18 + 30 * Math.sin(Math.PI * ((x % 400) / 400));
  shape(ctx, (c) => { c.moveTo(0, 18); for (let x = 0; x <= 800; x += 10) c.lineTo(x, sag(x === 800 ? 799.9 : x)); }, null, '#5a4030', 1.4);
  for (let i = 0; i < 20; i++) {
    const x = 20 + i * 40, y = sag(x);
    poly(ctx, [x - 12, y, x + 12, y, x, y + 28], i === 13 && alt('pennant') ? '#9a72c8' : colors[i % 5], INK, 1);
  }
}

function bookshelf(ctx, alt) {
  rect(ctx, 16, 56, 220, 512, '#6b4528', INK, 1.5);
  rect(ctx, 26, 66, 200, 434, '#3a2414');
  SHELF.forEach((row) => row.forEach((b) => {
    if (b === GAP && alt('gapbook')) return;
    const color = b === SPINE && alt('spine') ? '#2fa36a' : b.color;
    rect(ctx, b.x, b.y, b.w, b.h, linear(ctx, b.x, 0, b.x + b.w, 0, [color, color, 'rgba(0,0,0,0.25)']), INK, 0.9);
    if (b.band) { line(ctx, [b.x + 1, b.y + 8, b.x + b.w - 1, b.y + 8], '#e8c96a', 1.3); line(ctx, [b.x + 1, b.y + b.h - 8, b.x + b.w - 1, b.y + b.h - 8], '#e8c96a', 1.3); }
  }));
  for (const y of SHELF_BOTTOMS) rect(ctx, 20, y, 212, 10, '#8a5a34', INK, 1.1);
  rect(ctx, 26, 510, 200, 50, '#4a2e1a', INK, 1);
  text(ctx, 'MARITIME', 126, 535, 12, '#e8c96a', 'center', '700');
}

function steam(ctx, x, y) {
  for (let k = 0; k < 7; k++) oval(ctx, x + Math.sin(k * 1.3) * 8, y - k * 16, 9 + k * 2.4, 7 + k * 1.6, `rgba(255,255,255,${0.2 - k * 0.022})`);
}

function espressoMachine(ctx, alt) {
  contactShadow(ctx, 616, 402, 70, 8);
  rect(ctx, 555, 394, 122, 7, '#5a3a24', INK, 1);
  shape(ctx, (c) => c.ellipse(615, 282, 50, 26, 0, Math.PI, 0), COPPER(ctx, 565, 665), INK, 1.3);
  oval(ctx, 615, 254, 7, 7, radial(ctx, 612, 250, 9, ['#fbe3a0', '#c9973d', '#6a4614']), INK, 1);
  rrect(ctx, 565, 280, 100, 82, 8, COPPER(ctx, 565, 665), INK, 1.4);
  for (const y of [292, 350]) line(ctx, [567, y, 663, y], '#e8c070', 2);
  oval(ctx, 615, 320, 16, 16, '#c9973d', INK, 1);
  oval(ctx, 615, 320, 12, 12, '#fbf6ea', INK, 0.8);
  shape(ctx, (c) => c.arc(615, 320, 9, -0.6, 0.3), null, '#c8323a', 2.4);
  const a = alt('gauge') ? 0.05 : -2.3;
  line(ctx, [615, 320, 615 + Math.cos(a) * 10, 320 + Math.sin(a) * 10], '#1c120a', 2.4);
  for (const x of [590, 640]) {
    rect(ctx, x - 9, 362, 18, 7, '#2a2a2a', INK, 1);
    line(ctx, [x + 8, 366, x + 26, 370], '#1a1a1a', 4);
  }
  for (const x of [590, 640]) {
    if (x === 640 && alt('cup')) continue;
    poly(ctx, [x - 8, 380, x + 8, 380, x + 6, 394, x - 6, 394], '#fbf8f2', INK, 1);
    shape(ctx, (c) => c.arc(x + 9, 386, 4, -1.4, 1.4), null, INK, 1.4);
  }
  line(ctx, [664, 330, 684, 368], '#c9c9c9', 3);
  steam(ctx, 690, 360);
}

function chalkboard(ctx, alt) {
  line(ctx, [606, 0, 600, 120], '#4a3826', 1.2); line(ctx, [754, 0, 760, 120], '#4a3826', 1.2);
  rect(ctx, 590, 118, 180, 124, '#7a5232', INK, 1.4);
  rect(ctx, 598, 126, 164, 108, '#2b302c');
  brushwork(ctx, 600, 128, 160, 104, ['rgba(255,255,255,0.5)'], 13, 26, 30, 0.06, 6);
  text(ctx, 'HARBOUR  CAFÉ', 680, 140, 13, '#f6f0e0', 'center', '700');
  [['Espresso', '3'], ['Latte', alt('price') ? '6' : '4'], ['Croissant', '2'], ['Macaron', '1']].forEach(([n, p], i) => {
    const y = 162 + i * 19;
    text(ctx, n, 606, y, 12, '#efe8d6', 'left', 'italic 500');
    for (let x = 676; x < 742; x += 6) oval(ctx, x, y + 3, 0.8, 0.8, 'rgba(240,232,214,0.6)');
    text(ctx, p, 756, y, 17, '#f7d27a', 'right', '700');
  });
}

function cakeDome(ctx, alt) {
  contactShadow(ctx, 740, 400, 40, 5);
  oval(ctx, 740, 398, 22, 5, '#d8d2c4', INK, 1); rect(ctx, 736, 388, 8, 10, '#d8d2c4', INK, 1);
  oval(ctx, 740, 388, 42, 7, '#efe9dc', INK, 1.1);
  for (const [x, r] of [[718, 0.3], [740, -0.2]]) {
    ctx.save(); ctx.translate(x, 378); ctx.rotate(r);
    shape(ctx, (c) => { c.arc(0, 0, 11, Math.PI * 0.95, Math.PI * 2.05); c.arc(0, 3, 6, Math.PI * 2.05, Math.PI * 0.95, true); c.closePath(); }, '#d8963c', INK, 1);
    line(ctx, [-4, -9, -2, -2], 'rgba(90,40,10,0.6)', 1); line(ctx, [4, -9, 2, -2], 'rgba(90,40,10,0.6)', 1);
    ctx.restore();
  }
  ['#f2a3b4', '#a8dcbc', '#f4dc7a', alt('macaron') ? '#6a3e24' : '#b9a3dc'].forEach((c, i) => {
    const y = 380 - i * 8;
    oval(ctx, 762, y, 10, 3.6, c, INK, 0.8); line(ctx, [753, y - 2.4, 771, y - 2.4], '#fff6ea', 1.6); oval(ctx, 762, y - 4.4, 10, 3.4, c, INK, 0.8);
  });
  shape(ctx, (c) => { c.moveTo(696, 388); c.lineTo(696, 346); c.ellipse(740, 346, 44, 44, 0, Math.PI, 0); c.lineTo(784, 388); }, 'rgba(220,240,255,0.16)', 'rgba(255,255,255,0.7)', 1.4);
  line(ctx, [706, 380, 708, 340], 'rgba(255,255,255,0.55)', 3);
  oval(ctx, 740, 300, 5, 4, '#d8d2c4', INK, 1);
}

function counter(ctx, alt) {
  rect(ctx, 540, 400, 260, 14, '#ece6da', INK, 1.2);
  rect(ctx, 540, 414, 260, 148, '#7a4a2a', INK, 1.3);
  for (const x of [554, 636, 718]) rrect(ctx, x, 428, 70, 118, 4, '#8a5834', 'rgba(40,20,8,0.7)', 1.2);
  espressoMachine(ctx, alt);
  cakeDome(ctx, alt);
}

function globe(ctx, alt) {
  contactShadow(ctx, 312, 552, 30, 6);
  oval(ctx, 310, 549, 20, 5, '#b88a3a', INK, 1); line(ctx, [310, 546, 310, 532], '#b88a3a', 4);
  oval(ctx, 310, 500, 33, 33, radial(ctx, 298, 488, 40, ['#7fc0dc', '#2f7aa6', '#1c4a6e']), INK, 1.3);
  ctx.save();
  ctx.beginPath(); ctx.arc(310, 500, 33, 0, Math.PI * 2); ctx.clip();
  for (const [x, y, rx, ry, r] of [[298, 486, 14, 9, 0.5], [322, 506, 10, 15, -0.3], [292, 518, 8, 5, 0]]) oval(ctx, x, y, rx, ry, '#c7b07a', 'rgba(60,40,20,0.6)', 0.8, r);
  ctx.restore();
  if (!alt('globe')) {
    shape(ctx, (c) => c.ellipse(310, 500, 40, 40, 0.35, -2.4, 1.6), null, '#8a6020', 4.4);
    shape(ctx, (c) => c.ellipse(310, 500, 40, 40, 0.35, -2.4, 1.6), null, '#e8c070', 1.6);
  }
}

function readingTable(ctx, alt) {
  contactShadow(ctx, 384, 668, 110, 12, 0.4);
  rect(ctx, 374, 590, 20, 76, '#5a3420', INK, 1.2);
  oval(ctx, 384, 668, 52, 9, '#5a3420', INK, 1.2);
  oval(ctx, 384, 568, 152, 34, '#6a3c22', INK, 1.4);
  oval(ctx, 384, 562, 152, 32, linear(ctx, 232, 0, 536, 0, ['#8a5432', '#b07444', '#7a4628']), INK, 1.4);
  globe(ctx, alt);
  poly(ctx, [350, 560, 384, 566, 386, 548, 354, 542], '#fbf4e2', INK, 1);
  poly(ctx, [384, 566, 418, 558, 414, 540, 386, 548], '#f6ecd4', INK, 1);
  for (let k = 0; k < 3; k++) { line(ctx, [358, 548 + k * 5, 380, 553 + k * 5], 'rgba(60,40,20,0.5)', 0.7); line(ctx, [390, 551 + k * 5, 410, 546 + k * 5], 'rgba(60,40,20,0.5)', 0.7); }
  const hx = alt('mug') ? 436 : 466;
  shape(ctx, (c) => c.arc(hx, 534, 8, alt('mug') ? Math.PI * 0.5 : -Math.PI * 0.5, alt('mug') ? Math.PI * 1.5 : Math.PI * 0.5), null, '#f2eadb', 4);
  contactShadow(ctx, 451, 550, 22, 5);
  rrect(ctx, 436, 520, 30, 30, 4, linear(ctx, 436, 0, 466, 0, ['#e6dccb', '#fbf6ee', '#d6ccba']), INK, 1.2);
  rect(ctx, 436, 532, 30, 5, '#3f9a9a');
  oval(ctx, 451, 520, 15, 4, '#8a5a32', INK, 1);
  oval(ctx, 451, 520, 6, 2, '#f2e2c4');
  steam(ctx, 452, 508);
}

export const bookshopScene = {
  id: 'bookshop',
  title: 'Harborfront Bookshop & Cafe',
  tier: 'Challenging',
  baseTime: 200,
  moteTint: '255,248,224',
  diffs: [
    { id: 'lighthouse', name: 'Blue-Striped Lighthouse', box: [286, 164, 28, 76] },
    { id: 'sailboat', name: 'Sail Set on the Other Side', box: [428, 242, 68, 64] },
    { id: 'gull', name: 'Extra Seagull', box: [336, 102, 34, 14] },
    { id: 'pennant', name: 'Lavender Pennant', box: [524, 40, 32, 38] },
    { id: 'spine', name: 'Emerald Book Spine', box: bookBox(SPINE) },
    { id: 'gapbook', name: 'Missing Book', box: bookBox(GAP) },
    { id: 'gauge', name: 'Gauge in the Red', box: [603, 308, 24, 24] },
    { id: 'cup', name: 'Missing Espresso Cup', box: [630, 378, 26, 18] },
    { id: 'price', name: 'Latte Now Costs 6', box: [742, 170, 18, 22] },
    { id: 'macaron', name: 'Chocolate Macaron', box: [750, 350, 24, 14] },
    { id: 'globe', name: 'Globe Lost Its Meridian', box: [268, 458, 86, 86] },
    { id: 'mug', name: 'Mug Handle Switched Sides', box: [424, 524, 54, 22] },
  ],
  paint(ctx, alt) {
    wall(ctx);
    harbourWindows(ctx, alt);
    bunting(ctx, alt);
    bookshelf(ctx, alt);
    chalkboard(ctx, alt);
    planks(ctx, 0, 560, 800, 120, 6, '#b07a4a', 'rgba(90,50,20,0.35)', 44);
    lightShafts(ctx, [[262, 110, 330, 230], [424, 110, 520, 230]], '255,240,200', 0.16, 140, 680);
    counter(ctx, alt);
    readingTable(ctx, alt);
    motes(ctx, 240, 120, 320, 440, 60, 91, 'rgba(255,248,220,0.55)');
    vignette(ctx, 800, 680, 0.3);
    paperGrain(ctx, 800, 680);
  },
};
