// Plate II: a lamplit clockmaker's workshop at midnight. Mahogany panelling, a grandfather
// clock and a wall regulator, a leaded window with a crescent moon, blueprints, bell jars,
// pocket watches on the bench and a tabby asleep on the stool.
import {
  brushwork, clockFace, contactShadow, gear, glow, lightShafts, line, linear, motes, oval,
  paperGrain, planks, poly, radial, rect, rrect, shape, text, vignette, INK,
} from '../artPrimitives.js';

const BRASS = '#c9973d';
const brass = (ctx, x, y, r) => radial(ctx, x - r * 0.3, y - r * 0.4, r * 1.3, ['#fbe3a0', BRASS, '#6a4614']);
const silver = (ctx, x, y, r) => radial(ctx, x - r * 0.3, y - r * 0.4, r * 1.3, ['#ffffff', '#b8c2c8', '#4f5a62']);

function panelledWall(ctx) {
  rect(ctx, 0, 0, 800, 500, linear(ctx, 0, 0, 0, 500, ['#3a2216', '#5e3622', '#7a4628']));
  for (let x = 0; x < 800; x += 160) {
    for (const y of [36, 232]) {
      rrect(ctx, x + 14, y, 132, 172, 4, 'rgba(120,66,36,0.6)', 'rgba(30,12,6,0.8)', 2);
      line(ctx, [x + 16, y + 170, x + 144, y + 170, x + 144, y + 2], 'rgba(200,120,70,0.25)', 1.2);
    }
  }
  brushwork(ctx, 0, 0, 800, 430, ['#6a3a22', '#2a140a'], 5, 120, 30, 0.16, 4);
  rect(ctx, 0, 414, 800, 16, '#6b3a20', INK, 1.2);
}

function ceilingBeam(ctx) {
  rect(ctx, 0, 0, 800, 24, linear(ctx, 0, 0, 0, 24, ['#24120a', '#4e2c18']), INK, 1.4);
  brushwork(ctx, 0, 2, 800, 20, ['#6a3a22', '#1a0c06'], 12, 40, 50, 0.35, 2);
  for (const x of [120, 380, 640]) rect(ctx, x, 22, 18, 6, '#3a2010', INK, 1);
}

/** A gilded sunburst wall clock between the grandfather clock and the regulator. */
function sunburstClock(ctx) {
  for (let i = 0; i < 24; i++) {
    const a = (i / 24) * Math.PI * 2, l = i % 2 ? 30 : 38;
    line(ctx, [222 + Math.cos(a) * 18, 118 + Math.sin(a) * 18, 222 + Math.cos(a) * l, 118 + Math.sin(a) * l], i % 2 ? '#b8862e' : '#e8c060', 2.4);
    if (!(i % 2)) oval(ctx, 222 + Math.cos(a) * l, 118 + Math.sin(a) * l, 2.4, 2.4, '#f2d078');
  }
  clockFace(ctx, 222, 118, 16, 4, 50, { rim: '#d8a548' });
}

function leadedWindow(ctx, alt) {
  const sky = linear(ctx, 0, 45, 0, 290, ['#0a1330', '#1a2b58', '#30457a']);
  const outline = (c) => { c.moveTo(572, 292); c.lineTo(572, 142); c.arc(666, 142, 94, Math.PI, 0); c.lineTo(760, 292); c.closePath(); };
  shape(ctx, outline, sky);
  ctx.save();
  ctx.beginPath(); outline(ctx); ctx.clip();
  motes(ctx, 572, 48, 190, 240, 46, 61, 'rgba(240,240,255,0.85)', 1.1);
  glow(ctx, 700, 116, 64, '170,190,255', 0.22);
  oval(ctx, 700, 116, 24, 24, '#f5edc6');
  oval(ctx, alt('moon') ? 689 : 711, 109, 21, 21, sky);
  for (let d = -300; d < 300; d += 24) {
    line(ctx, [572 + d, 48, 772 + d, 292], 'rgba(30,26,24,0.85)', 1.6);
    line(ctx, [772 - d, 48, 572 - d, 292], 'rgba(30,26,24,0.85)', 1.6);
  }
  ctx.restore();
  shape(ctx, outline, null, '#3b1d0e', 10);
  line(ctx, [666, 50, 666, 292], '#3b1d0e', 6);
  rect(ctx, 560, 290, 212, 12, '#6e3c20', INK, 1.2);
}

function grandfatherClock(ctx, alt) {
  const wood = linear(ctx, 40, 0, 170, 0, ['#341709', '#7a3e20', '#2f1508']);
  contactShadow(ctx, 105, 644, 82, 12, 0.5);
  rect(ctx, 50, 560, 110, 84, wood, INK, 1.4);
  rect(ctx, 64, 256, 82, 306, wood, INK, 1.4);
  rrect(ctx, 76, 286, 58, 248, 26, linear(ctx, 76, 0, 134, 0, ['#120806', '#2c160c', '#120806']), INK, 1.2);
  line(ctx, [105, 288, 105, 468], BRASS, 2.2);
  oval(ctx, 105, 480, 17, 17, alt('bob') ? silver(ctx, 105, 480, 17) : brass(ctx, 105, 480, 17), INK, 1.2);
  line(ctx, [86, 300, 92, 520], 'rgba(255,240,220,0.14)', 5);
  rect(ctx, 48, 132, 114, 126, wood, INK, 1.4);
  poly(ctx, [40, 134, 105, 88, 170, 134], wood, INK, 1.4);
  oval(ctx, 105, 86, 7, 7, brass(ctx, 105, 86, 7), INK, 1);
  const twoFifty = alt('hands');
  clockFace(ctx, 105, 196, 40, twoFifty ? 1 : 10, twoFifty ? 50 : 10, { roman: true });
}

function gearCluster(ctx, alt) {
  const gears = [[226, 282, 34, 12, 0.1, BRASS], [271, 331, 24, 9, 0.32, alt('gear') ? '#9ea9b0' : '#d8a548'], [232, 372, 20, 8, 0.2, '#b8693a']];
  for (const [x, y, r, t, a] of gears) gear(ctx, x + 4, y + 5, r, t, 'rgba(0,0,0,0.35)', a, null);
  for (const [x, y, r, t, a, c] of gears) gear(ctx, x, y, r, t, c, a);
}

function wallRegulator(ctx, alt) {
  rrect(ctx, 300, 60, 80, 272, 10, linear(ctx, 300, 0, 380, 0, ['#3a1a0a', '#83452a', '#3a1a0a']), INK, 1.4);
  rrect(ctx, 312, 158, 56, 160, 6, '#170a05', INK, 1);
  const swing = alt('swing') ? -16 : 16;
  line(ctx, [340, 160, 340 + swing, 284], BRASS, 2);
  oval(ctx, 340 + swing * 1.08, 292, 11, 11, brass(ctx, 340 + swing, 292, 11), INK, 1);
  clockFace(ctx, 340, 110, 32, 7, 25, {});
}

function blueprint(ctx, alt) {
  rect(ctx, 404, 178, 146, 114, '#2a5b98', INK, 1.2);
  ctx.save();
  ctx.beginPath(); ctx.rect(404, 178, 146, 114); ctx.clip();
  for (let k = 0; k < 15; k++) { line(ctx, [404 + k * 10, 178, 404 + k * 10, 292], 'rgba(255,255,255,0.12)', 0.8); line(ctx, [404, 178 + k * 10, 550, 178 + k * 10], 'rgba(255,255,255,0.12)', 0.8); }
  ctx.restore();
  if (alt('blueprint')) rect(ctx, 424, 210, 48, 48, null, '#eaf4ff', 1.6);
  else {
    oval(ctx, 448, 234, 26, 26, null, '#eaf4ff', 1.6);
    for (let i = 0; i < 12; i++) { const a = (i / 12) * Math.PI * 2; line(ctx, [448 + Math.cos(a) * 26, 234 + Math.sin(a) * 26, 448 + Math.cos(a) * 31, 234 + Math.sin(a) * 31], '#eaf4ff', 1.4); }
  }
  oval(ctx, 448, 234, 5, 5, null, '#eaf4ff', 1.2);
  line(ctx, [488, 206, 536, 206], '#eaf4ff', 1); line(ctx, [488, 222, 530, 222], '#eaf4ff', 1);
  oval(ctx, 512, 254, 14, 14, null, '#eaf4ff', 1.2);
  line(ctx, [420, 280, 476, 280], '#eaf4ff', 0.8);
  text(ctx, 'ESCAPEMENT  No.7', 476, 186, 7, '#eaf4ff', 'center', '600');
  rect(ctx, 548, 176, 12, 118, linear(ctx, 548, 0, 560, 0, ['#5b8ac4', '#9dc0e8', '#3d6aa6']), INK, 1);
  for (const [x, y] of [[410, 184], [542, 184], [410, 286]]) oval(ctx, x, y, 3, 3, BRASS, INK, 0.8);
}

function oilLantern(ctx, x, lit) {
  for (let y = 2; y < 62; y += 8) oval(ctx, x, y, 2, 3.6, null, '#1a120a', 1.2);
  poly(ctx, [x - 16, 74, x, 60, x + 16, 74], '#2c2218', INK, 1.2);
  rrect(ctx, x - 13, 74, 26, 42, 6, 'rgba(255,220,160,0.18)', '#3a2c1c', 2);
  if (lit) {
    glow(ctx, x, 96, 34, '255,186,90', 0.6);
    oval(ctx, x, 98, 4.5, 9, '#ffd77a', 'rgba(255,140,40,0.8)', 1);
  }
  line(ctx, [x - 13, 96, x + 13, 96], 'rgba(40,30,20,0.6)', 1.2);
  rect(ctx, x - 16, 116, 32, 8, '#2c2218', INK, 1.2);
}

function bellJar(ctx, x, knob) {
  rect(ctx, x - 32, 310, 64, 9, '#4a2614', INK, 1);
  const dome = (c) => { c.moveTo(x - 26, 311); c.lineTo(x - 26, 270); c.arc(x, 270, 26, Math.PI, 0); c.lineTo(x + 26, 311); };
  shape(ctx, dome, 'rgba(210,230,255,0.14)', 'rgba(220,235,255,0.65)', 1.4);
  line(ctx, [x - 16, 300, x - 16, 268], 'rgba(255,255,255,0.5)', 2.4);
  if (knob) { rect(ctx, x - 2, 238, 4, 6, BRASS, INK, 0.6); oval(ctx, x, 236, 6, 5, brass(ctx, x, 236, 6), INK, 1); }
}

function shelfOfJars(ctx, alt) {
  rect(ctx, 562, 319, 214, 11, '#6e3c20', INK, 1.2);
  bellJar(ctx, 612, true);
  oval(ctx, 612, 292, 10, 7, '#c99a40', INK, 1); oval(ctx, 622, 283, 6, 5, '#c99a40', INK, 1);
  poly(ctx, [627, 283, 634, 285, 627, 287], '#8a5a1a'); line(ctx, [612, 299, 612, 309], INK, 1.4);
  gear(ctx, 706, 286, 15, 9, '#d8a548', 0.2);
  line(ctx, [706, 301, 706, 310], INK, 2);
  bellJar(ctx, 706, !alt('belljar'));
}

function pocketWatch(ctx, x, y, h, m) {
  contactShadow(ctx, x + 2, y + 6, 22, 7);
  oval(ctx, x, y, 19, 12, brass(ctx, x, y, 19), INK, 1.2);
  oval(ctx, x, y, 15, 9, '#f6eedb', INK, 0.8);
  ctx.save(); ctx.translate(x, y); ctx.scale(1, 0.6);
  const ha = (h / 12) * Math.PI * 2 - Math.PI / 2, ma = (m / 60) * Math.PI * 2 - Math.PI / 2;
  line(ctx, [0, 0, Math.cos(ha) * 8, Math.sin(ha) * 8], INK, 1.6); line(ctx, [0, 0, Math.cos(ma) * 12, Math.sin(ma) * 12], INK, 1);
  ctx.restore();
  oval(ctx, x, y - 15, 4, 3, null, BRASS, 1.6);
}

function workbench(ctx, alt) {
  poly(ctx, [196, 430, 800, 430, 800, 472, 180, 472], linear(ctx, 0, 430, 0, 472, ['#6a2f18', '#8a4426']), INK, 1.3);
  brushwork(ctx, 190, 432, 610, 38, ['#a85a34', '#4a1e0c'], 17, 40, 40, 0.3, 2);
  rect(ctx, 180, 472, 620, 22, '#4c200e', INK, 1.3);
  rect(ctx, 180, 494, 620, 152, '#3c1a0c', INK, 1.3);
  for (const x of [196, 400, 600]) { rrect(ctx, x, 508, 184, 56, 3, '#55250f', INK, 1.1); oval(ctx, x + 92, 536, 7, 4, BRASS, INK, 0.8); }
  for (let i = 0; i < 8; i++) {
    const x = 196 + i * 75.5;
    rrect(ctx, x, 574, 70, 62, 3, '#4e220e', INK, 1);
    rect(ctx, x + 20, 588, 30, 12, '#e8d8b0', '#8a6420', 1.2);
    line(ctx, [x + 25, 594, x + 45, 594], 'rgba(60,40,20,0.6)', 0.8);
    oval(ctx, x + 35, 616, 4.5, 4.5, BRASS, INK, 0.8);
  }
  // banker's lamp and its pool of light
  oval(ctx, 250, 462, 26, 7, brass(ctx, 250, 462, 26), INK, 1);
  line(ctx, [250, 460, 250, 398], BRASS, 3);
  poly(ctx, [204, 398, 296, 398, 284, 368, 216, 368], alt('lampshade') ? linear(ctx, 204, 0, 296, 0, ['#4a0c10', '#b8283a', '#4a0c10']) : linear(ctx, 204, 0, 296, 0, ['#0c3a22', '#2f8a56', '#0c3a22']), INK, 1.3);
  line(ctx, [204, 398, 296, 398], BRASS, 2.4);
  pocketWatch(ctx, 342, 452, 3, 40);
  if (!alt('watchchain')) {
    for (let t = 0; t <= 1; t += 0.05) {
      const u = 1 - t, px = u * u * 342 + 2 * u * t * 300 + t * t * 302, py = u * u * 438 + 2 * u * t * 432 + t * t * 462;
      oval(ctx, px, py, 2.2, 1.4, null, '#e2b54e', 1);
    }
  }
  pocketWatch(ctx, 412, 456, 9, 15);
  oval(ctx, 412, 432, 13, 14, brass(ctx, 412, 432, 14), INK, 1);
  // tool tray
  rect(ctx, 478, 444, 90, 22, '#5c2c14', INK, 1.1);
  line(ctx, [486, 452, 520, 448], '#c8ced2', 2); rrect(ctx, 520, 445, 18, 6, 2, '#b8382c', INK, 0.8);
  line(ctx, [488, 462, 540, 458], '#9aa3a8', 2.4);
  if (!alt('tool')) { line(ctx, [544, 449, 562, 461], '#d8dde0', 1.4); line(ctx, [544, 449, 560, 448], '#d8dde0', 1.4); }
  // oil can, books and a candle
  oval(ctx, 610, 454, 14, 6, '#2f3b3f', INK, 1); poly(ctx, [600, 452, 620, 452, 612, 436, 608, 436], '#3f5258', INK, 1); line(ctx, [610, 436, 632, 420], '#3f5258', 2);
  rect(ctx, 668, 438, 104, 16, '#2f4f6e', INK, 1.1); rect(ctx, 674, 424, 92, 14, '#7a2a2a', INK, 1.1);
  line(ctx, [676, 446, 770, 446], '#d8b25a', 1); line(ctx, [680, 431, 762, 431], '#d8b25a', 1);
  rect(ctx, 714, 396, 12, 28, '#efe4c8', INK, 1);
  glow(ctx, 720, 388, 40, '255,190,100', 0.5); oval(ctx, 720, 390, 3, 6, '#ffd77a');
  glow(ctx, 250, 446, 130, '255,196,120', 0.42);
  glow(ctx, 250, 404, 50, '255,230,170', 0.4);
}

function stoolAndCat(ctx, alt) {
  rect(ctx, 0, 644, 800, 36, '#1e0e07');
  planks(ctx, 0, 646, 800, 34, 3, '#2a140a', 'rgba(120,60,30,0.4)', 9);
  contactShadow(ctx, 690, 670, 90, 10, 0.5);
  for (const [x0, x1] of [[630, 616], [750, 764], [668, 664], [712, 718]]) line(ctx, [x0, 596, x1, 680], '#5a2c14', 7);
  oval(ctx, 690, 594, 76, 16, '#7a3c1c', INK, 1.4);
  oval(ctx, 690, 590, 74, 13, '#8e4824');
  // the sleeping tabby
  oval(ctx, 694, 566, 62, 28, radial(ctx, 694, 552, 70, ['#f0a85a', '#d6822f', '#9a5214']), INK, 1.4);
  for (let k = 0; k < 6; k++) shape(ctx, (c) => c.arc(694 + k * 9 - 18, 572, 26, Math.PI * 1.15, Math.PI * 1.45), null, 'rgba(120,56,12,0.8)', 2.6);
  shape(ctx, (c) => { c.moveTo(752, 572); c.bezierCurveTo(760, 600, 700, 604, 652, 592); }, null, '#c26f26', 8);
  shape(ctx, (c) => { c.moveTo(752, 572); c.bezierCurveTo(760, 600, 700, 604, 652, 592); }, null, INK, 1);
  oval(ctx, 636, 568, 22, 19, radial(ctx, 630, 560, 26, ['#f4b066', '#d6822f']), INK, 1.4);
  poly(ctx, [618, 556, 622, 538, 632, 551], '#d6822f', INK, 1.2); poly(ctx, [640, 550, 650, 536, 653, 555], '#d6822f', INK, 1.2);
  shape(ctx, (c) => c.arc(626, 568, 4, 0.2, Math.PI - 0.2), null, INK, 1.3);
  if (alt('cat')) { oval(ctx, 642, 567, 4.4, 3.2, '#9ad04a', INK, 1); oval(ctx, 642, 567, 1, 3, '#111'); }
  else shape(ctx, (c) => c.arc(642, 568, 4, 0.2, Math.PI - 0.2), null, INK, 1.3);
  poly(ctx, [631, 576, 635, 576, 633, 579], '#d46a7a');
}

export const clockmakerScene = {
  id: 'clockmaker',
  title: "Midnight Clockmaker's Workshop",
  tier: 'Challenging',
  baseTime: 200,
  moteTint: '255,206,140',
  diffs: [
    { id: 'moon', name: 'Moon Faces the Other Way', box: [664, 84, 72, 64] },
    { id: 'hands', name: 'Grandfather Clock at 1:50', box: [70, 160, 70, 70] },
    { id: 'bob', name: 'Silver Pendulum Bob', box: [84, 459, 42, 42] },
    { id: 'gear', name: 'Steel Gear Among Brass', box: [244, 304, 54, 54] },
    { id: 'swing', name: 'Regulator Swings Left', box: [312, 162, 56, 146] },
    { id: 'blueprint', name: 'Square Wheel Blueprint', box: [418, 202, 62, 62] },
    { id: 'lantern', name: 'Unlit Oil Lantern', box: [484, 60, 72, 72] },
    { id: 'belljar', name: 'Bell Jar Lost Its Knob', box: [696, 228, 20, 18] },
    { id: 'lampshade', name: 'Crimson Lamp Shade', box: [200, 364, 100, 38] },
    { id: 'watchchain', name: 'Missing Watch Chain', box: [292, 428, 54, 38] },
    { id: 'tool', name: 'Missing Tweezers', box: [540, 444, 26, 20] },
    { id: 'cat', name: 'Tabby Peeks One Eye', box: [634, 560, 16, 14] },
  ],
  paint(ctx, alt) {
    panelledWall(ctx);
    ceilingBeam(ctx);
    sunburstClock(ctx);
    leadedWindow(ctx, alt);
    lightShafts(ctx, [[580, 120, 300, 260]], '150,170,255', 0.08, 120, 680);
    grandfatherClock(ctx, alt);
    gearCluster(ctx, alt);
    wallRegulator(ctx, alt);
    blueprint(ctx, alt);
    oilLantern(ctx, 440, true);
    oilLantern(ctx, 520, !alt('lantern'));
    shelfOfJars(ctx, alt);
    workbench(ctx, alt);
    stoolAndCat(ctx, alt);
    motes(ctx, 160, 330, 200, 140, 24, 33, 'rgba(255,220,160,0.5)');
    glow(ctx, 260, 420, 420, '255,170,90', 0.16);
    vignette(ctx, 800, 680, 0.42);
    paperGrain(ctx, 800, 680);
  },
};
