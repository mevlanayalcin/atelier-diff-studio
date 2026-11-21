// Plate IV: an alpine observatory terrace at twilight. Indigo sky with an aurora ribbon and
// inked constellations, snow-capped ridges and a lit cabin, a stone balustrade, a brass
// refractor on its tripod, and a table with a star map, a lantern and a mug of cocoa.
import {
  brushwork, contactShadow, glow, line, linear, motes, oval, paperGrain, poly, radial, rect, rrect, shape,
  star, vignette, INK,
} from '../artPrimitives.js';

const STONE = '#8d8cab';

function twilightSky(ctx, alt) {
  const sky = linear(ctx, 0, 0, 0, 420, ['#060924', '#17205a', '#4a3a7e', '#b8708a']);
  rect(ctx, 0, 0, 800, 420, sky);
  glow(ctx, 330, 150, 80, '190,200,255', 0.22);
  oval(ctx, 330, 150, 22, 22, '#f4eed0');
  oval(ctx, 341, 143, 19, 19, sky);
  motes(ctx, 0, 0, 800, 300, 150, 404, 'rgba(255,252,236,0.85)', 1.1);
  ctx.save();
  ctx.translate(400, 190); ctx.rotate(-0.42);
  ctx.fillStyle = linear(ctx, 0, -46, 0, 46, ['rgba(200,190,255,0)', 'rgba(210,200,255,0.13)', 'rgba(200,190,255,0)']);
  ctx.fillRect(-520, -46, 1040, 92);
  motes(ctx, -520, -30, 1040, 60, 300, 41, 'rgba(255,255,255,0.5)', 0.7);
  ctx.restore();
  for (const [x, y] of [[40, 186], [250, 36], [392, 206], [528, 128], [764, 64], [586, 214], [176, 236]]) {
    glow(ctx, x, y, 12, '230,235,255', 0.6);
    star(ctx, x, y, 8, 4, 0.12, 'rgba(255,255,240,0.95)');
  }
  ctx.save();
  ctx.globalCompositeOperation = 'lighter';
  for (let k = 0; k < 6; k++) {
    shape(ctx, (c) => {
      for (let x = -20; x <= 820; x += 20) c.lineTo(x, 104 + 28 * Math.sin(x / 120 + k * 0.45) + k * 6 - x * 0.05);
    }, null, k % 2 ? 'rgba(90,255,180,0.09)' : 'rgba(120,200,255,0.07)', 22 - k * 2);
  }
  ctx.restore();
  const constellations = [
    [[70, 60], [112, 46], [152, 70], [132, 110], [86, 104]],
    [[580, 70], [630, 46], [680, 76], [630, 128], [702, 152]],
  ];
  constellations.forEach((pts, ci) => {
    const shown = ci === 1 && alt('constellation') ? pts.slice(0, 4) : pts;
    for (let i = 1; i < shown.length; i++) line(ctx, [...shown[i - 1], ...shown[i]], 'rgba(220,230,255,0.45)', 1);
    if (ci === 0) line(ctx, [...pts[4], ...pts[0]], 'rgba(220,230,255,0.45)', 1);
    for (const [x, y] of shown) { glow(ctx, x, y, 11, '255,240,200', 0.5); star(ctx, x, y, 5, 4, 0.32, '#fff6d8'); }
  });
  if (alt('comet')) {
    line(ctx, [424, 84, 466, 60], 'rgba(255,255,255,0.75)', 2);
    glow(ctx, 468, 59, 9, '255,255,255', 0.9);
  }
  const tilt = alt('saturn') ? 0.4 : -0.4;
  shape(ctx, (c) => c.ellipse(690, 214, 19, 5.5, tilt, 0, Math.PI * 2), null, '#f0d8a8', 1.6);
  oval(ctx, 690, 214, 9, 9, radial(ctx, 687, 211, 11, ['#fbe6b8', '#c89a5a']), INK, 0.8);
  shape(ctx, (c) => c.ellipse(690, 214, 19, 5.5, tilt, 0, Math.PI), null, '#f0d8a8', 1.6);
}

function pine(ctx, x, base, h) {
  for (let k = 0; k < 3; k++) {
    const w = (h * 0.32) * (1 - k * 0.22), y = base - k * h * 0.28;
    poly(ctx, [x - w, y, x + w, y, x, y - h * 0.5], '#121832', 'rgba(150,170,230,0.35)', 0.8);
  }
}

function ridges(ctx, alt) {
  poly(ctx, [0, 330, 70, 270, 130, 300, 210, 230, 300, 300, 380, 250, 470, 310, 560, 240, 640, 290, 720, 250, 800, 300, 800, 420, 0, 420], linear(ctx, 0, 230, 0, 420, ['#6a6aa8', '#3a3f72']), 'rgba(20,20,50,0.6)', 1.2);
  for (const [px, py] of [[210, 230], [380, 250], [560, 240], [720, 250]]) {
    if (px === 380 && alt('snowcap')) continue;
    poly(ctx, [px - 28, py + 24, px, py, px + 30, py + 26, px + 14, py + 20, px + 4, py + 28, px - 10, py + 20], '#ecebf8', 'rgba(60,60,110,0.6)', 1);
  }
  poly(ctx, [0, 370, 90, 330, 180, 350, 280, 320, 400, 360, 520, 330, 640, 360, 800, 330, 800, 420, 0, 420], '#1f2448', 'rgba(140,150,220,0.4)', 1);
  for (const [x, b, h] of [[228, 330, 34], [246, 330, 44], [262, 328, 30], [462, 346, 36], [482, 342, 44], [540, 336, 34], [700, 346, 40], [722, 344, 32], [746, 340, 44]]) {
    if (x === 482 && alt('pine')) continue;
    pine(ctx, x, b, h);
  }
}

function cabin(ctx, alt) {
  const smoke = alt('smoke') ? 1 : -1;
  for (let k = 0; k < 6; k++) oval(ctx, 132 + smoke * k * 5.5, 272 - k * 10, 5 + k * 1.6, 4 + k * 1.2, `rgba(200,200,230,${0.32 - k * 0.04})`);
  rect(ctx, 127, 280, 9, 18, '#3a2a2a', INK, 1);
  rect(ctx, 80, 300, 60, 36, '#3a2a2e', INK, 1.2);
  poly(ctx, [72, 303, 110, 276, 148, 303], '#2a2026', INK, 1.2);
  line(ctx, [74, 301, 110, 278, 146, 301], '#e6e4f4', 3);
  if (alt('cabinwindow')) rect(ctx, 96, 312, 16, 14, '#1a1a2e', INK, 1);
  else {
    glow(ctx, 104, 319, 26, '255,190,100', 0.7);
    rect(ctx, 96, 312, 16, 14, '#ffcf7a', INK, 1);
  }
  line(ctx, [104, 312, 104, 326], '#2a1a14', 1.2); line(ctx, [96, 319, 112, 319], '#2a1a14', 1.2);
}

function baluster(ctx, x) {
  shape(ctx, (c) => {
    c.moveTo(x - 6, 414); c.lineTo(x + 6, 414);
    c.bezierCurveTo(x + 14, 432, x + 4, 440, x + 8, 458); c.lineTo(x - 8, 458);
    c.bezierCurveTo(x - 4, 440, x - 14, 432, x - 6, 414);
  }, linear(ctx, x - 12, 0, x + 12, 0, ['#5a5a7a', STONE, '#4a4a68']), INK, 1);
}

function balustrade(ctx, alt) {
  rect(ctx, 0, 410, 800, 62, '#141936');
  for (let i = 0; i < 22; i++) {
    const x = 18 + i * 36;
    if (i === 12 && alt('baluster')) continue;
    baluster(ctx, x);
  }
  rect(ctx, 0, 398, 800, 16, linear(ctx, 0, 398, 0, 414, ['#b4b4cc', STONE, '#5a5a7a']), INK, 1.2);
  rect(ctx, 0, 458, 800, 12, '#6a6a88', INK, 1.2);
  for (let x = 6; x < 800; x += 23) oval(ctx, x + (x % 7), 397, 9 + (x % 5), 3.2, '#eeeefa');
  // a striped scarf left over the rail
  const stripes = alt('scarf') ? ['#2f8a5a', '#f2ead6'] : ['#c0353a', '#f2ead6'];
  for (let k = 0; k < 7; k++) rect(ctx, 252 + (k % 2) * 0, 396 + k * 8, 36, 8, stripes[k % 2]);
  rect(ctx, 252, 396, 36, 56, null, INK, 1.2);
  for (let x = 254; x < 288; x += 5) line(ctx, [x, 452, x, 458], '#f2ead6', 1.2);
}

function terrace(ctx, alt) {
  rect(ctx, 0, 470, 800, 210, linear(ctx, 0, 470, 0, 680, ['#5c5c86', '#38385a']));
  brushwork(ctx, 0, 474, 800, 206, ['#7a7aa8', '#26263e', '#9a9ac0'], 909, 160, 26, 0.22, 5);
  ctx.save();
  ctx.beginPath(); ctx.rect(0, 470, 800, 210); ctx.clip();
  for (let x = -600; x <= 1400; x += 120) line(ctx, [400, 300, x, 680], 'rgba(20,20,40,0.45)', 1.2);
  for (const y of [482, 502, 530, 568, 620]) line(ctx, [0, y, 800, y], 'rgba(20,20,40,0.45)', 1.2);
  ctx.restore();
  ctx.save();
  ctx.translate(430, 612); ctx.scale(1, 0.32);
  oval(ctx, 0, 0, 120, 120, '#6a6a90', INK, 2);
  oval(ctx, 0, 0, 100, 100, '#e2d8c0', INK, 1.6);
  for (let i = 0; i < 8; i++) {
    const a = (i / 8) * Math.PI * 2 - Math.PI / 2, r = i % 2 ? 60 : 98, b = a + Math.PI / 2;
    const fill = i === 0 ? (alt('compass') ? '#2f9a9a' : '#c0353a') : i % 2 ? '#8a7a5a' : '#3a3f72';
    poly(ctx, [Math.cos(a) * r, Math.sin(a) * r, Math.cos(b) * 14, Math.sin(b) * 14, -Math.cos(b) * 14, -Math.sin(b) * 14], fill, INK, 1.6);
  }
  oval(ctx, 0, 0, 12, 12, '#c9973d', INK, 1.6);
  ctx.restore();
}

function telescope(ctx, alt) {
  contactShadow(ctx, 630, 672, 90, 10, 0.45);
  for (const [x, y] of [[556, 668], [700, 666], [640, 678]]) {
    line(ctx, [620, 440, x, y], '#3a2414', 10);
    line(ctx, [620, 440, x, y], '#7a5232', 7);
  }
  rect(ctx, 606, 426, 28, 24, '#3a3428', INK, 1.2);
  ctx.save();
  ctx.translate(620, 430); ctx.rotate(-0.55);
  const tube = linear(ctx, 0, -15, 0, 15, ['#fbe3a0', '#c9973d', '#6a4614']);
  poly(ctx, [-92, -11, 128, -14, 128, 14, -92, 11], tube, INK, 1.3);
  rect(ctx, 124, -18, 38, 36, tube, INK, 1.3);
  rect(ctx, -110, -6, 18, 12, '#2a2420', INK, 1);
  for (const x of [-40, 40, 100]) line(ctx, [x, -13, x, 13], '#7a5a1a', 2);
  if (!alt('finder')) {
    for (const x of [-4, 40]) line(ctx, [x, -12, x, -19], '#5a4214', 3);
    rect(ctx, -22, -27, 84, 9, tube, INK, 1);
    rect(ctx, 60, -29, 6, 13, '#2a2420', INK, 0.8);
  }
  ctx.restore();
}

function tableProps(ctx, alt) {
  for (const x of [98, 378]) rect(ctx, x, 520, 12, 140, '#4a2e22', INK, 1.2);
  poly(ctx, [110, 470, 380, 470, 404, 520, 86, 520], linear(ctx, 0, 470, 0, 520, ['#5a3e30', '#7a5442']), INK, 1.3);
  rect(ctx, 86, 520, 318, 12, '#4a2e22', INK, 1.2);
  poly(ctx, [158, 476, 300, 476, 312, 512, 148, 512], '#efe0b8', INK, 1.1);
  oval(ctx, 228, 494, 52, 13, null, 'rgba(90,60,30,0.6)', 0.9);
  for (const [x, y] of [[190, 488], [214, 500], [236, 486], [252, 502], [206, 482]]) star(ctx, x, y, 3, 4, 0.4, '#5a3a1a');
  line(ctx, [190, 488, 206, 482, 236, 486, 252, 502], 'rgba(90,60,30,0.7)', 0.8);
  if (!alt('starmap')) { oval(ctx, 276, 494, 7, 7, '#3a5a8a'); oval(ctx, 279, 491, 6, 6, '#efe0b8'); }
  // the cabin lantern
  const blue = alt('lantern');
  glow(ctx, 130, 470, 40, blue ? '110,190,255' : '255,180,90', 0.65);
  rect(ctx, 116, 492, 28, 8, '#7a5a20', INK, 1);
  rrect(ctx, 118, 450, 24, 42, 4, 'rgba(255,230,180,0.2)', '#7a5a20', 2);
  oval(ctx, 130, 474, 4, 8, blue ? '#9ad8ff' : '#ffd77a', blue ? 'rgba(60,140,255,0.8)' : 'rgba(255,140,40,0.8)', 1);
  poly(ctx, [114, 452, 130, 438, 146, 452], '#5a4214', INK, 1);
  shape(ctx, (c) => c.arc(130, 436, 6, Math.PI, 0), null, '#5a4214', 1.6);
  // cocoa
  if (!alt('steam')) for (const dx of [-6, 4]) shape(ctx, (c) => { c.moveTo(350 + dx, 466); c.bezierCurveTo(342 + dx, 450, 360 + dx, 440, 350 + dx, 420); }, null, 'rgba(255,255,255,0.45)', 3);
  contactShadow(ctx, 352, 500, 22, 5);
  shape(ctx, (c) => c.arc(366, 484, 7, -Math.PI / 2, Math.PI / 2), null, '#a8282e', 4);
  rrect(ctx, 336, 470, 30, 30, 4, linear(ctx, 336, 0, 366, 0, ['#7a1a20', '#c8383e', '#7a1a20']), INK, 1.2);
  oval(ctx, 351, 470, 15, 4, '#5a3020', INK, 1);
  oval(ctx, 346, 469, 3, 2, '#fbf4ea'); oval(ctx, 355, 470, 3, 2, '#fbf4ea');
}

export const observatoryScene = {
  id: 'observatory',
  title: 'Alpine Observatory Terrace',
  tier: 'Expert',
  baseTime: 230,
  moteTint: '235,240,255',
  diffs: [
    { id: 'constellation', name: 'Kite Constellation Lost a Star', box: [624, 122, 90, 42] },
    { id: 'comet', name: 'Extra Shooting Star', box: [418, 48, 62, 42] },
    { id: 'saturn', name: 'Ringed Planet Tilts Right', box: [668, 200, 44, 28] },
    { id: 'snowcap', name: 'Bare Mountain Peak', box: [348, 246, 66, 34] },
    { id: 'pine', name: 'Missing Ridge Pine', box: [466, 294, 32, 52] },
    { id: 'smoke', name: 'Chimney Smoke Drifts East', box: [92, 210, 84, 70] },
    { id: 'cabinwindow', name: 'Dark Cabin Window', box: [76, 290, 58, 58] },
    { id: 'baluster', name: 'Missing Baluster', box: [434, 412, 30, 48] },
    { id: 'scarf', name: 'Green-Striped Scarf', box: [250, 394, 40, 58] },
    { id: 'finder', name: 'Telescope Finder Scope Gone', box: [578, 360, 96, 72] },
    { id: 'starmap', name: 'Star Map Lost Its Moon', box: [266, 484, 20, 20] },
    { id: 'lantern', name: 'Blue Lantern Flame', box: [88, 428, 84, 84] },
    { id: 'steam', name: 'Cocoa Stopped Steaming', box: [334, 416, 32, 54] },
    { id: 'compass', name: 'Teal Compass North', box: [412, 574, 36, 34] },
  ],
  paint(ctx, alt) {
    twilightSky(ctx, alt);
    ridges(ctx, alt);
    cabin(ctx, alt);
    balustrade(ctx, alt);
    terrace(ctx, alt);
    tableProps(ctx, alt);
    telescope(ctx, alt);
    motes(ctx, 0, 0, 800, 680, 70, 515, 'rgba(255,255,255,0.45)', 1.2);
    vignette(ctx, 800, 680, 0.36, '6,4,20');
    paperGrain(ctx, 800, 680, 0.07);
  },
};
