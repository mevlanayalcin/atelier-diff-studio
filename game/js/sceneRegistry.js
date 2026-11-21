// The manifest of the five plates, in rising difficulty (10 to 16 differences), and the one
// place that turns a scene definition into pixels: the Original Plate, the Altered Plate,
// a gallery thumbnail.
import { PLATE_W, PLATE_H } from './artPrimitives.js';
import { conservatoryScene } from './scenes/conservatoryScene.js';
import { clockmakerScene } from './scenes/clockmakerScene.js';
import { bookshopScene } from './scenes/bookshopScene.js';
import { observatoryScene } from './scenes/observatoryScene.js';
import { canalMarketScene } from './scenes/canalMarketScene.js';

export const SCENES = [conservatoryScene, clockmakerScene, bookshopScene, observatoryScene, canalMarketScene];
export const NUMERALS = ['I', 'II', 'III', 'IV', 'V'];

export function getScene(index) {
  return SCENES[Math.max(0, Math.min(SCENES.length - 1, index))];
}

/** What the gallery and HUD show of every scene, without painting any of it. */
export function sceneManifest() {
  return SCENES.map((scene, index) => ({
    index,
    id: scene.id,
    numeral: NUMERALS[index],
    title: scene.title,
    tier: scene.tier,
    count: scene.diffs.length,
    baseTime: scene.baseTime,
  }));
}

/**
 * Paints one plate at `scale` (1 = 800x680) onto a fresh canvas. `altered` is true for the
 * Altered Plate (every difference applied), false for the Original, or a Set of difference ids.
 */
export function paintPlate(scene, altered, scale = 1, readBack = false) {
  const canvas = document.createElement('canvas');
  canvas.width = Math.round(PLATE_W * scale);
  canvas.height = Math.round(PLATE_H * scale);
  const ctx = canvas.getContext('2d', { willReadFrequently: readBack });
  ctx.setTransform(canvas.width / PLATE_W, 0, 0, canvas.height / PLATE_H, 0, 0);
  const applied = altered === true ? new Set(scene.diffs.map((d) => d.id)) : altered || new Set();
  scene.paint(ctx, (id) => applied.has(id));
  return canvas;
}

/** A small Original Plate for the gallery cards. */
export function paintThumbnail(scene, width = 200) {
  return paintPlate(scene, false, width / PLATE_W);
}
