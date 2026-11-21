// Bootstrap and game loop: lays out the twin plates, paints them, routes mouse and keyboard
// input to the rules, and draws markers, hints, effects and the loupe on both plates each frame.
import { PLATE_W, PLATE_H, ambientMotes } from './artPrimitives.js';
import { SCENES, NUMERALS, getScene, sceneManifest, paintPlate, paintThumbnail } from './sceneRegistry.js';
import { classifyClick, auditPlatePixels, validateDiffSet, unfoundDiffs } from './diffEngine.js';
import {
  MODES, createRound, tickRound, recordFind, recordMiss, finishRound, saveRecord, loadRecords, urgencyOf,
} from './gameState.js';
import { createHintSystem, requestHint, updateHint, resetHints, hintCooldownLeft, drawHintRadar } from './hintSystem.js';
import { createLoupe, loupeActive, aimLoupe, drawLoupe, LOUPE_ZOOM } from './loupeTool.js';
import { createFoley } from './audioFoley.js';
import { createFx, spawnFindBurst, spawnMissMark, pruneFx, drawFoundMarker, drawRevealMarker, drawFx, drawReticle } from './markerFx.js';
import {
  bindHudControls, renderHud, renderDiscoveryStrip, flashPenalty, shakePlate, announce, openGallery, closeGallery,
  showResults, hideResults, showPause, isModalOpen, isGalleryOpen,
} from './hudView.js';
import { stageShot } from './shotStaging.js';

const SIDES = ['left', 'right'];
const canvases = { left: document.getElementById('canvas-left'), right: document.getElementById('canvas-right') };

const app = {
  sceneIndex: 0, scene: SCENES[0], mode: 'classic', round: createRound(SCENES[0], 'classic'),
  hints: createHintSystem(), loupe: createLoupe(), fx: createFx(), foley: createFoley(),
  art: {}, cssW: 0, dpr: 1, foundAt: {}, reticle: { x: 400, y: 340, shown: false },
  paused: false, frozen: false, clock: 0, last: performance.now(), space: null, thumbs: [],
};

const now = () => app.clock;

/** Fits both framed plates into the space between the HUD and the discovery strip. */
function layoutPlates() {
  const W = window.innerWidth, H = window.innerHeight;
  const hud = 62, strip = 58, frame = 24, gap = 16;
  const w = Math.floor(Math.min((W - gap * 3) / 2 - frame, (H - hud - strip - gap * 1.6 - frame) * (PLATE_W / PLATE_H)));
  const h = Math.round(w * (PLATE_H / PLATE_W));
  app.dpr = Math.min(2, window.devicePixelRatio || 1);
  app.cssW = w;
  for (const side of SIDES) {
    const c = canvases[side];
    c.style.width = `${w}px`; c.style.height = `${h}px`;
    c.width = Math.round(w * app.dpr); c.height = Math.round(h * app.dpr);
  }
  paintArt();
}

/** Paints the Original and Altered plates at screen resolution, then the loupe's sharper copies. */
function paintArt() {
  const scale = (app.cssW * app.dpr) / PLATE_W;
  app.art = { left: paintPlate(app.scene, false, scale), right: paintPlate(app.scene, true, scale), zoom: null };
  const scene = app.scene;
  setTimeout(() => ensureZoomArt(scene), 30);
}

function ensureZoomArt(scene = app.scene) {
  if (scene !== app.scene || app.art.zoom) return;
  const scale = Math.min(3.2, (app.cssW * app.dpr * LOUPE_ZOOM) / PLATE_W);
  app.art.zoom = { left: paintPlate(scene, false, scale), right: paintPlate(scene, true, scale) };
}

export function startScene(index, mode = app.mode) {
  app.sceneIndex = Math.max(0, Math.min(SCENES.length - 1, index));
  app.scene = getScene(app.sceneIndex);
  app.mode = mode;
  app.round = createRound(app.scene, mode);
  app.foundAt = {};
  app.fx = createFx();
  resetHints(app.hints);
  app.paused = false;
  showPause(false); hideResults(); closeGallery();
  paintArt();
  renderDiscoveryStrip(app.scene, app.round);
  announce(`Plate ${NUMERALS[app.sceneIndex]}: ${app.scene.title}. ${app.round.total} differences to find.`);
}

/** Converts a pointer event to plate coordinates. */
function platePoint(e, canvas) {
  const r = canvas.getBoundingClientRect();
  return { x: ((e.clientX - r.left) / r.width) * PLATE_W, y: ((e.clientY - r.top) / r.height) * PLATE_H };
}

/** Inspects a point on either plate: a find, a repeat (ignored) or a miss. */
export function inspectAt(x, y, side = 'right') {
  const round = app.round;
  if (round.status !== 'play' || app.paused || isModalOpen()) return 'blocked';
  const result = classifyClick(app.scene, round.found, x, y, MODES[app.mode].tolerance);
  if (result.kind === 'find') {
    const { multiplier } = recordFind(round, result.diff.id);
    app.foundAt[result.diff.id] = now();
    const c = { x: result.diff.box[0] + result.diff.box[2] / 2, y: result.diff.box[1] + result.diff.box[3] / 2 };
    spawnFindBurst(app.fx, c.x, c.y, now());
    app.foley.findChime(round.streak);
    renderDiscoveryStrip(app.scene, round);
    announce(`Found ${result.diff.name}. ${round.total - round.found.length} remaining. Streak times ${multiplier}.`);
    if (round.status === 'complete') completeRound();
  } else if (result.kind === 'miss') {
    const lost = recordMiss(round);
    spawnMissMark(app.fx, x, y, now(), side);
    shakePlate(side);
    app.foley.missTap();
    if (lost) flashPenalty(lost);
  }
  return result.kind;
}

function completeRound() {
  const summary = finishRound(app.round);
  saveRecord(app.round, summary);
  app.foley.fanfare();
  setTimeout(() => {
    if (app.round.status !== 'complete') return;
    showResults({ won: true, summary, round: app.round, scene: app.scene, hasNext: app.sceneIndex < SCENES.length - 1 }, resultHandlers);
  }, 900);
}

const resultHandlers = {
  next: () => startScene(app.sceneIndex + 1),
  retry: () => startScene(app.sceneIndex),
  gallery: () => showGallery(),
};

export function useHint() {
  const pick = requestHint(app.hints, app.round, app.scene, now());
  if (pick) { app.foley.hintPing(); announce('A hint glows on both plates.'); }
  return pick;
}

export function toggleLoupe() {
  app.loupe.toggled = !app.loupe.toggled;
  if (app.loupe.toggled) { ensureZoomArt(); if (!app.loupe.hasAim) aimLoupe(app.loupe, app.reticle.x, app.reticle.y); }
}

function togglePause() {
  if (app.round.status !== 'play' || isGalleryOpen()) return;
  app.paused = !app.paused;
  showPause(app.paused);
}

function toggleMute() { app.foley.setMuted(!app.foley.isMuted()); }

function thumbnails() {
  if (!app.thumbs.length) app.thumbs = SCENES.map((s) => paintThumbnail(s, 420));
  return app.thumbs;
}

export function showGallery() {
  hideResults(); showPause(false); app.paused = false;
  openGallery({
    manifest: sceneManifest(), records: loadRecords(), mode: app.mode, current: app.sceneIndex, thumbnails: thumbnails(),
    onPick: (i) => { app.foley.uiClick(); startScene(i, app.mode); },
    onMode: (m) => { app.mode = m; app.foley.uiClick(); showGallery(); },
  });
}

function drawPlate(side, t) {
  const canvas = canvases[side], ctx = canvas.getContext('2d');
  const s = canvas.width / PLATE_W, k = PLATE_W / app.cssW;
  ctx.setTransform(1, 0, 0, 1, 0, 0);
  ctx.drawImage(app.art[side], 0, 0);
  ctx.setTransform(s, 0, 0, s, 0, 0);
  ambientMotes(ctx, t, 900 + app.sceneIndex, app.scene.moteTint || '255,240,200');
  const round = app.round;
  if (round.status === 'timeout') for (const d of unfoundDiffs(round, app.scene)) drawRevealMarker(ctx, d, t, k);
  round.found.forEach((id, i) => drawFoundMarker(ctx, app.scene.diffs.find((d) => d.id === id), i + 1, app.foundAt[id] ?? -9, t, k));
  drawHintRadar(ctx, app.hints, t, k);
  drawFx(ctx, app.fx, t, k, side);
  if (app.reticle.shown) drawReticle(ctx, app.reticle.x, app.reticle.y, t, k);
  if (loupeActive(app.loupe) && app.art.zoom) drawLoupe(ctx, app.art.zoom[side], app.loupe, k);
}

/** Runs the round's clock forward: heartbeat ticks in the final seconds, Time's Up at zero. */
function advanceClock(dt) {
  const event = tickRound(app.round, dt);
  if (event === 'tick') app.foley.heartbeat();
  if (event === 'timeout') {
    app.hints.active = null;
    app.loupe.toggled = false;
    showResults({ won: false, round: app.round, scene: app.scene }, resultHandlers);
  }
}

function frame(stamp) {
  const dt = Math.min(0.1, (stamp - app.last) / 1000);
  app.last = stamp;
  app.clock += dt;
  const round = app.round;
  if (!app.paused && !app.frozen && !isModalOpen()) advanceClock(dt);
  if (app.space && !app.loupe.held && app.clock - app.space.at > 0.18) { app.loupe.held = true; ensureZoomArt(); }
  updateHint(app.hints, round, app.clock);
  pruneFx(app.fx, app.clock);
  for (const side of SIDES) drawPlate(side, app.clock);
  renderHud({
    scene: app.scene, numeral: NUMERALS[app.sceneIndex], round, hintCooldown: hintCooldownLeft(app.hints, app.clock),
    loupeOn: loupeActive(app.loupe) || app.loupe.toggled, muted: app.foley.isMuted(), urgency: urgencyOf(round),
  });
  requestAnimationFrame(frame);
}

function moveReticle(dx, dy) {
  app.reticle.shown = true;
  app.reticle.x = Math.max(0, Math.min(PLATE_W, app.reticle.x + dx));
  app.reticle.y = Math.max(0, Math.min(PLATE_H, app.reticle.y + dy));
  aimLoupe(app.loupe, app.reticle.x, app.reticle.y);
}

const MOVES = { ArrowLeft: [-1, 0], KeyA: [-1, 0], ArrowRight: [1, 0], KeyD: [1, 0], ArrowUp: [0, -1], KeyW: [0, -1], ArrowDown: [0, 1], KeyS: [0, 1] };

function onKeyDown(e) {
  app.foley.unlock();
  if (e.code === 'Escape') { if (isGalleryOpen()) closeGallery(); else if (app.paused) togglePause(); return; }
  if (e.code === 'KeyG') { if (isGalleryOpen()) closeGallery(); else showGallery(); return; }
  if (/^Digit[1-5]$/.test(e.code)) { startScene(Number(e.code.slice(5)) - 1); return; }
  if (e.code === 'KeyM') { toggleMute(); return; }
  if (e.code === 'KeyP') { togglePause(); return; }
  if (isModalOpen()) return;
  const move = MOVES[e.code];
  if (move) { e.preventDefault(); const step = e.shiftKey ? 30 : 10; moveReticle(move[0] * step, move[1] * step); return; }
  if (e.code === 'KeyH') useHint();
  else if (e.code === 'KeyZ') toggleLoupe();
  else if (e.code === 'Enter') { app.reticle.shown = true; inspectAt(app.reticle.x, app.reticle.y, 'right'); }
  else if (e.code === 'Space') { e.preventDefault(); if (!e.repeat && !app.space) app.space = { at: app.clock }; }
}

function onKeyUp(e) {
  if (e.code !== 'Space' || !app.space) return;
  const tapped = !app.loupe.held;
  app.space = null;
  app.loupe.held = false;
  if (tapped && app.reticle.shown) inspectAt(app.reticle.x, app.reticle.y, 'right');
}

function bindPlates() {
  for (const side of SIDES) {
    const c = canvases[side];
    c.addEventListener('pointermove', (e) => { const p = platePoint(e, c); aimLoupe(app.loupe, p.x, p.y); app.reticle.x = p.x; app.reticle.y = p.y; app.reticle.shown = false; });
    c.addEventListener('pointerdown', (e) => { app.foley.unlock(); const p = platePoint(e, c); inspectAt(p.x, p.y, side); });
  }
  document.getElementById('pause').addEventListener('click', (e) => { if (e.target.id === 'pause') togglePause(); });
}

/** Test and staging hooks: the same calls a player's clicks and keys make. */
const api = {
  startScene, inspectAt, useHint, toggleLoupe, showGallery,
  aim: (x, y) => aimLoupe(app.loupe, x, y),
  advance: (seconds) => { for (let left = seconds; left > 1e-9; left -= 0.1) advanceClock(Math.min(0.1, left)); },
  freeze: (on = true) => { app.frozen = on; },
  holdHint: (on = true) => { app.hints.hold = on; },
  ensureZoomArt,
  state: () => ({ scene: app.scene.id, sceneIndex: app.sceneIndex, mode: app.mode, ...app.round, found: [...app.round.found], loupe: loupeActive(app.loupe), hint: app.hints.active?.id ?? null, modal: isModalOpen() }),
  diffs: () => app.scene.diffs.map((d) => ({ ...d })),
  audit: () => SCENES.map((s) => ({ ...auditPlatePixels(s, paintPlate), problems: validateDiffSet(s) })),
  manifest: sceneManifest,
};

function boot() {
  bindHudControls({ onHint: useHint, onLoupe: toggleLoupe, onMute: toggleMute, onPause: togglePause, onGallery: () => (isGalleryOpen() ? closeGallery() : showGallery()) });
  bindPlates();
  window.addEventListener('keydown', onKeyDown);
  window.addEventListener('keyup', onKeyUp);
  window.addEventListener('resize', layoutPlates);
  window.addEventListener('pointerdown', () => app.foley.unlock(), { capture: true });
  layoutPlates();
  startScene(0, 'classic');
  window.atelier = api;
  const params = new URLSearchParams(location.search);
  if (params.has('shot')) stageShot(params.get('shot'), api);
  else showGallery();
  requestAnimationFrame(frame);
}

boot();
