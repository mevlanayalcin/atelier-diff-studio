// Plate V: a Venetian-style canal market at dusk. A clock tower against the evening sky,
// terracotta and ochre palazzi with shutters and flower boxes, an arched limestone bridge with
// lamps mirrored in the water, a moored gondola and its striped poles, paper lantern garlands,
// and citrus and spice stalls under striped awnings on both banks.
import {
  brushwork, contactShadow, glow, line, linear, motes, oval, paperGrain, poly, rect, rrect,
  seeded, shape, text, vignette, INK,
} from '../artPrimitives.js';

/** Paper lanterns along a sagging garland, computed once for painting and for the boxes. */
const LANTERNS = Array.from({ length: 10 }, (_, i) => {
  const t = (i + 0.5) / 10, x = 214 + t * 372;
  return { x, y: 156 - t * 20 + Math.sin(Math.PI * t) * 64 };
});
const ODD_LANTERN = LANTERNS[4];
const BRIDGE_Y = (x) => { const t = (x - 170) / 460; return 340 - 156 * t * (1 - t); };

function duskSky(ctx, alt) {
  rect(ctx, 0, 0, 800, 450, linear(ctx, 0, 0, 0, 450, ['#272050', '#7a4a7e', '#e89a72', '#f8d4a2']));
  motes(ctx, 0, 0, 800, 120, 40, 505, 'rgba(255,245,230,0.7)', 0.9);
  for (const [x, y, w] of [[120, 196, 110], [330, 170, 140], [640, 210, 120], [470, 236, 90], [250, 228, 80]]) oval(ctx, x, y, w, 7, 'rgba(255,200,190,0.35)');
  for (const [x, y, s] of [[300, 80, 1], [322, 92, 0.8], [344, 76, 0.7], [640, 120, 0.9], [662, 110, 0.7]]) {
    shape(ctx, (c) => { c.moveTo(x - 8 * s, y - 3 * s); c.quadraticCurveTo(x - 3 * s, y - 5 * s, x, y); c.quadraticCurveTo(x + 3 * s, y - 5 * s, x + 8 * s, y - 3 * s); }, null, '#3a2440', 1.6);
  }
  glow(ctx, 400, 330, 220, '255,190,140', 0.35);
  for (const [x, w, h] of [[196, 60, 70], [250, 50, 96], [296, 70, 60], [356, 44, 84], [520, 60, 74], [574, 40, 90]]) {
    rect(ctx, x, 340 - h, w, h + 100, '#5a3a5e');
    const rnd = seeded(x);
    for (let k = 0; k < 4; k++) rect(ctx, x + 6 + rnd() * (w - 14), 350 - h + rnd() * (h - 20), 4, 6, 'rgba(255,214,140,0.85)');
  }
  // the clock tower
  rect(ctx, 470, 70, 40, 280, '#3e2a4c', 'rgba(20,10,30,0.6)', 1);
  poly(ctx, [464, 72, 516, 72, 490, 30], '#33223f', 'rgba(20,10,30,0.6)', 1);
  if (!alt('spire')) { line(ctx, [490, 30, 490, 16], '#33223f', 2.4); oval(ctx, 490, 14, 4, 4, '#33223f'); }
  glow(ctx, 490, 112, 22, '255,230,170', 0.4);
  oval(ctx, 490, 112, 11, 11, '#f6e6bc', INK, 1);
  line(ctx, [490, 112, 490, 104], INK, 1.4); line(ctx, [490, 112, 496, 115], INK, 1.4);
  for (const x of [476, 494]) rrect(ctx, x, 140, 10, 22, 5, '#1e1426');
}

function shutteredWindow(ctx, x, y, color, closed, lit, rightColor = color) {
  rrect(ctx, x - 17, y, 34, 60, [17, 17, 0, 0], lit ? '#f4c070' : '#2a1a24', INK, 1.2);
  if (lit) glow(ctx, x, y + 34, 26, '255,190,110', 0.35);
  if (closed) {
    for (const dx of [-17, 0]) {
      rect(ctx, x + dx, y + 8, 17, 52, color, INK, 1);
      for (let k = 0; k < 6; k++) line(ctx, [x + dx + 2, y + 14 + k * 8, x + dx + 15, y + 14 + k * 8], 'rgba(0,0,0,0.35)', 1);
    }
  } else {
    for (const dx of [-33, 17]) {
      rect(ctx, x + dx, y + 6, 16, 56, dx > 0 ? rightColor : color, INK, 1);
      for (let k = 0; k < 6; k++) line(ctx, [x + dx + 2, y + 12 + k * 8, x + dx + 14, y + 12 + k * 8], 'rgba(0,0,0,0.35)', 1);
    }
  }
  rect(ctx, x - 20, y + 60, 40, 5, '#efe2c8', INK, 1);
}

function leftPalazzo(ctx, alt) {
  rect(ctx, 0, 70, 212, 380, linear(ctx, 0, 0, 212, 0, ['#a84a2c', '#d0703e', '#b05430']), INK, 1.3);
  brushwork(ctx, 0, 70, 212, 380, ['#e08a56', '#8a3a20'], 72, 80, 26, 0.18, 6);
  rect(ctx, 0, 62, 220, 12, '#efe2c8', INK, 1.2);
  const green = '#3d6a4a';
  [[60, 110], [150, 110], [60, 210], [150, 210], [60, 310], [150, 310]].forEach(([x, y], i) => {
    shutteredWindow(ctx, x, y, green, i === 5 && alt('window'), i === 2 || i === 5, i === 1 && alt('shutter') ? '#2f5fa8' : green);
  });
  for (const [x, y, flower] of [[60, 270, alt('flowerbox') ? '#f2c43a' : '#e0352e'], [150, 270, '#e0352e']]) {
    for (let k = 0; k < 6; k++) { oval(ctx, x - 18 + k * 7, y - 6 - (k % 2) * 3, 5, 4, '#3f7a3a'); oval(ctx, x - 18 + k * 7, y - 9 - (k % 2) * 3, 3.4, 3.4, flower, INK, 0.6); }
    rect(ctx, x - 24, y, 48, 10, '#7a4a2a', INK, 1);
  }
}

function rightPalazzo(ctx, alt) {
  rect(ctx, 590, 50, 210, 400, linear(ctx, 590, 0, 800, 0, ['#b8862e', '#e0ae52', '#c89238']), INK, 1.3);
  brushwork(ctx, 590, 50, 210, 400, ['#f0c070', '#9a6a20'], 88, 80, 26, 0.18, 6);
  rect(ctx, 582, 42, 218, 12, '#efe2c8', INK, 1.2);
  [[650, 84], [740, 84], [650, 196], [740, 196], [650, 310], [740, 310]].forEach(([x, y], i) => shutteredWindow(ctx, x, y, '#5a6a3a', i === 4, i === 1 || i === 3 || i === 4));
  rect(ctx, 620, 258, 150, 6, '#2a2026', INK, 1);
  for (let x = 624; x <= 766; x += 9) line(ctx, [x, 258, x, 238], '#2a2026', 1.4);
  line(ctx, [620, 238, 770, 238], '#2a2026', 2);
  // laundry strung under the top windows
  line(ctx, [590, 166, 690, 180, 800, 170], '#3a2a20', 1);
  poly(ctx, [628, 172, 648, 174, 652, 184, 646, 184, 646, 202, 630, 200, 630, 184, 624, 184], '#f4f0e6', INK, 1);
  rect(ctx, 692, 179, 26, 30, '#5a8ac0', INK, 1);
  for (let y = 184; y < 208; y += 6) line(ctx, [694, y, 716, y], '#f4f0e6', 1.2);
  if (!alt('laundry')) poly(ctx, [756, 175, 764, 175, 764, 192, 772, 196, 770, 202, 756, 198], '#d8402e', INK, 1);
}

function bridge(ctx, alt) {
  const top = (x) => BRIDGE_Y(x);
  const stone = linear(ctx, 170, 0, 630, 0, ['#f2e4c6', '#e4d2ae', '#c4ae8a']);
  ctx.beginPath();
  ctx.moveTo(170, 340);
  for (let x = 170; x <= 630; x += 10) ctx.lineTo(x, top(x));
  ctx.lineTo(630, 450); ctx.lineTo(170, 450); ctx.closePath();
  ctx.moveTo(550, 450);
  ctx.ellipse(400, 450, 150, 104, 0, 0, Math.PI, true);
  ctx.closePath();
  ctx.fillStyle = stone; ctx.fill('evenodd');
  ctx.strokeStyle = INK; ctx.lineWidth = 1.3; ctx.stroke();
  for (let i = 1; i < 12; i++) {
    const a = Math.PI + (i / 12) * Math.PI;
    line(ctx, [400 + Math.cos(a) * 150, 450 + Math.sin(a) * 104, 400 + Math.cos(a) * 176, 450 + Math.sin(a) * 128], 'rgba(90,60,40,0.5)', 1);
  }
  for (const y of [372, 400, 428]) line(ctx, [176, y, 254, y], 'rgba(90,60,40,0.4)', 1), line(ctx, [546, y, 624, y], 'rgba(90,60,40,0.4)', 1);
  // parapet and posts
  shape(ctx, (c) => { for (let x = 170; x <= 630; x += 10) c.lineTo(x, top(x) - 18); }, null, '#e8d8b8', 5);
  for (let x = 180; x <= 620; x += 20) line(ctx, [x, top(x), x, top(x) - 18], '#d8c6a2', 3.4);
  shape(ctx, (c) => { for (let x = 170; x <= 630; x += 10) c.lineTo(x, top(x) - 18); }, null, INK, 1);
  if (!alt('keystone')) {
    poly(ctx, [388, 340, 412, 340, 408, 366, 392, 366], '#f6ead2', INK, 1.2);
    oval(ctx, 400, 352, 5, 6, '#c8b490', INK, 0.8);
  }
  for (const x of [290, 510]) {
    line(ctx, [x, top(x) - 18, x, top(x) - 60], '#2a2026', 3);
    glow(ctx, x, top(x) - 70, 30, '255,200,120', 0.6);
    rrect(ctx, x - 7, top(x) - 80, 14, 18, 3, '#ffd88a', INK, 1.2);
    poly(ctx, [x - 9, top(x) - 80, x + 9, top(x) - 80, x, top(x) - 88], '#2a2026');
  }
  if (alt('pigeon')) {
    const y = top(350) - 22;
    oval(ctx, 350, y - 4, 8, 5, '#8a8a9a', INK, 1); oval(ctx, 357, y - 9, 3.4, 3.4, '#7a7a8a', INK, 0.8);
    poly(ctx, [342, y - 5, 336, y - 2, 343, y - 1], '#6a6a7a'); poly(ctx, [360, y - 9, 363, y - 8, 360, y - 7], '#e0a040');
  }
}

function canalWater(ctx, alt) {
  rect(ctx, 0, 450, 800, 230, linear(ctx, 0, 450, 0, 680, ['#e8a882', '#9a6a8a', '#3a3266', '#221e44']));
  ctx.save();
  ctx.globalAlpha = 0.35;
  for (let y = 452; y < 520; y += 6) line(ctx, [176 + (y % 12), y, 250 + (y % 9), y], '#f2e4c6', 3), line(ctx, [550 - (y % 9), y, 624 - (y % 12), y], '#f2e4c6', 3);
  ctx.restore();
  for (const x of [290, 510]) {
    if (x === 510 && alt('reflection')) continue;
    for (let k = 0; k < 12; k++) line(ctx, [x - 8 + (k % 3) * 3, 456 + k * 7, x + 6 + (k % 3) * 3, 456 + k * 7], `rgba(255,214,140,${0.75 - k * 0.05})`, 2.4);
  }
  const rnd = seeded(66);
  for (let i = 0; i < 180; i++) {
    const x = rnd() * 800, y = 456 + rnd() * 224, w = 8 + rnd() * 30, c = rnd() > 0.5 ? 'rgba(255,220,200,0.24)' : 'rgba(40,30,80,0.3)';
    if (x > 486 && x < 536 && y < 544) continue;
    line(ctx, [x, y, x + w, y], c, 1.2);
  }
}

function pole(ctx, x, stripe) {
  line(ctx, [x + 2, 620, x - 2, 680], 'rgba(20,10,30,0.4)', 7);
  rect(ctx, x - 4, 450, 8, 172, '#f4ece0', INK, 1);
  ctx.save(); ctx.beginPath(); ctx.rect(x - 4, 450, 8, 172); ctx.clip();
  for (let y = 444; y < 630; y += 16) poly(ctx, [x - 4, y, x + 4, y - 6, x + 4, y + 2, x - 4, y + 8], stripe);
  ctx.restore();
  oval(ctx, x, 446, 6, 6, '#d8a548', INK, 1);
}

function gondola(ctx, alt) {
  for (const x of [200, 588]) pole(ctx, x, '#c8323a');
  pole(ctx, 230, alt('pole') ? '#2f5fb0' : '#c8323a');
  oval(ctx, 350, 612, 210, 10, 'rgba(10,6,20,0.45)');
  shape(ctx, (c) => {
    c.moveTo(140, 566); c.quadraticCurveTo(160, 604, 260, 606); c.lineTo(470, 600);
    c.quadraticCurveTo(540, 594, 566, 550); c.lineTo(556, 552); c.quadraticCurveTo(522, 582, 460, 586);
    c.lineTo(250, 590); c.quadraticCurveTo(172, 588, 150, 560); c.closePath();
  }, '#141018', INK, 1.2);
  line(ctx, [190, 594, 470, 592], 'rgba(255,220,180,0.4)', 1.4);
  rrect(ctx, 330, 574, 72, 13, 4, alt('cushion') ? '#2f5fb0' : '#b8282e', INK, 1);
  line(ctx, [332, 576, 400, 576], '#e8c070', 1.4);
  rrect(ctx, 250, 578, 40, 10, 3, '#3a2a20', INK, 1);
  if (!alt('ferro')) {
    poly(ctx, [560, 554, 566, 524, 576, 520, 572, 556], '#d8dce0', INK, 1);
    for (let k = 0; k < 5; k++) line(ctx, [566 - (k * 0.3), 530 + k * 5, 556 - (k * 0.3), 530 + k * 5], '#d8dce0', 2);
  }
}

function awning(ctx, x0, x1, colors, odd, oddColor) {
  for (let x = x0, i = 0; x < x1; x += 20, i++) {
    const c = i === odd ? oddColor : colors[i % 2];
    rect(ctx, x, 470, 20, 26, c);
    shape(ctx, (k) => k.arc(x + 10, 496, 10, 0, Math.PI), c, INK, 1);
  }
  rect(ctx, x0, 466, x1 - x0, 6, '#5a3a24', INK, 1);
  rect(ctx, x0, 470, x1 - x0, 26, null, INK, 1);
}

function fruitPile(ctx, x, y, color, odd) {
  const rows = [[0, 0], [-12, 0], [12, 0], [-24, 0], [24, 0], [-6, -10], [6, -10], [-18, -10], [18, -10], [0, -20]];
  rows.forEach(([dx, dy], i) => oval(ctx, x + dx, y + dy, 6.5, 6, i === rows.length - 1 && odd ? odd : color, INK, 0.8));
}

function citrusStall(ctx, alt) {
  poly(ctx, [0, 470, 196, 470, 170, 680, 0, 680], '#8e7e70', INK, 1.2);
  for (const y of [520, 580, 640]) line(ctx, [0, y, 190 - (y - 470) * 0.12, y], 'rgba(40,30,30,0.4)', 1);
  for (const x of [8, 176]) line(ctx, [x, 470, x, 600], '#4a3020', 4);
  awning(ctx, 0, 190, ['#c8323a', '#f4ead4'], -1, null);
  contactShadow(ctx, 90, 620, 90, 10, 0.4);
  rect(ctx, 10, 566, 162, 12, '#7a5232', INK, 1.2);
  rect(ctx, 16, 578, 150, 40, '#e8dcc4', INK, 1.2);
  for (let x = 16; x < 166; x += 15) line(ctx, [x, 578, x, 618], 'rgba(160,60,50,0.5)', 3);
  rect(ctx, 22, 548, 64, 20, '#9a6a3a', INK, 1); rect(ctx, 94, 548, 64, 20, '#9a6a3a', INK, 1);
  fruitPile(ctx, 54, 540, '#f2d43a', alt('citrus') ? '#f08a20' : null);
  fruitPile(ctx, 126, 540, '#f08a20', null);
  line(ctx, [150, 566, 150, 520], '#4a3020', 2);
  rect(ctx, 126, 502, 48, 22, '#2b302c', '#7a5232', 2);
  text(ctx, 'LIMONI', 142, 513, 7.5, '#f6f0e0', 'center', '700');
  text(ctx, alt('pricesign') ? '8' : '3', 166, 513, 14, '#f7d27a', 'center', '700');
}

function spiceStall(ctx, alt) {
  poly(ctx, [606, 470, 800, 470, 800, 680, 636, 680], '#8e7e70', INK, 1.2);
  for (const x of [618, 792]) line(ctx, [x, 470, x, 600], '#4a3020', 4);
  awning(ctx, 610, 800, ['#3d7a4a', '#f4ead4'], 5, alt('awning') ? '#2f5fb0' : '#f4ead4');
  contactShadow(ctx, 712, 624, 96, 10, 0.4);
  rect(ctx, 624, 572, 172, 12, '#7a5232', INK, 1.2);
  rect(ctx, 632, 584, 158, 36, '#5a3a5e', INK, 1.2);
  ['#e8902a', '#c0352a', alt('spice') ? '#3a4aa8' : '#f0c02a', '#6a8a3a'].forEach((c, i) => {
    const x = 654 + i * 40;
    poly(ctx, [x - 14, 562, x + 14, 562, x, 540], c, INK, 1);
    shape(ctx, (k) => k.ellipse(x, 562, 17, 8, 0, 0, Math.PI), '#c8b490', INK, 1);
  });
}

function lanternGarland(ctx, alt) {
  shape(ctx, (c) => { c.moveTo(212, 156); for (const l of LANTERNS) c.lineTo(l.x, l.y - 10); c.lineTo(590, 136); }, null, '#2a2026', 1.2);
  LANTERNS.forEach((l, i) => {
    glow(ctx, l.x, l.y, 26, '255,190,110', 0.45);
    const c = l === ODD_LANTERN && alt('paperlantern') ? '#3aa88a' : ['#e0442e', '#f08a2a', '#f2c440'][i % 3];
    oval(ctx, l.x, l.y, 9, 11, c, INK, 1);
    for (const dy of [-5, 0, 5]) line(ctx, [l.x - 8, l.y + dy, l.x + 8, l.y + dy], 'rgba(90,30,10,0.35)', 0.8);
    rect(ctx, l.x - 4, l.y - 13, 8, 3, '#2a2026'); rect(ctx, l.x - 4, l.y + 10, 8, 3, '#2a2026');
  });
}

export const canalMarketScene = {
  id: 'canal',
  title: 'Venetian Canal Twilight Market',
  tier: 'Master',
  baseTime: 250,
  moteTint: '255,214,160',
  diffs: [
    { id: 'spire', name: 'Clock Tower Lost Its Finial', box: [482, 6, 16, 26] },
    { id: 'shutter', name: 'Blue Shutter', box: [164, 112, 24, 64] },
    { id: 'window', name: 'Shutters Closed Tight', box: [112, 306, 76, 70] },
    { id: 'flowerbox', name: 'Yellow Geraniums', box: [34, 252, 52, 20] },
    { id: 'laundry', name: 'Missing Red Sock', box: [752, 172, 24, 34] },
    { id: 'keystone', name: 'Missing Bridge Keystone', box: [384, 336, 32, 34] },
    { id: 'pigeon', name: 'Pigeon on the Parapet', box: [332, 262, 36, 22] },
    { id: 'reflection', name: 'Lamp Reflection Vanished', box: [498, 452, 26, 86] },
    { id: 'paperlantern', name: 'Jade Paper Lantern', box: [ODD_LANTERN.x - 12, ODD_LANTERN.y - 14, 24, 28] },
    { id: 'pole', name: 'Blue-Striped Mooring Pole', box: [224, 446, 12, 178] },
    { id: 'ferro', name: 'Gondola Without Its Ferro', box: [552, 516, 28, 42] },
    { id: 'cushion', name: 'Blue Gondola Cushion', box: [326, 570, 80, 20] },
    { id: 'citrus', name: 'Orange Among the Lemons', box: [46, 512, 16, 16] },
    { id: 'pricesign', name: 'Lemons Now Cost 8', box: [158, 502, 16, 22] },
    { id: 'awning', name: 'Blue Awning Stripe', box: [710, 466, 20, 42] },
    { id: 'spice', name: 'Indigo Spice Mound', box: [720, 538, 32, 34] },
  ],
  paint(ctx, alt) {
    duskSky(ctx, alt);
    canalWater(ctx, alt);
    bridge(ctx, alt);
    leftPalazzo(ctx, alt);
    rightPalazzo(ctx, alt);
    lanternGarland(ctx, alt);
    gondola(ctx, alt);
    citrusStall(ctx, alt);
    spiceStall(ctx, alt);
    motes(ctx, 200, 140, 400, 300, 40, 707, 'rgba(255,220,160,0.5)', 1.2);
    vignette(ctx, 800, 680, 0.42, '20,8,24');
    paperGrain(ctx, 800, 680, 0.08);
  },
};
