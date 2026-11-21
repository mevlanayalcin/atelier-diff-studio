// The screenshot scenes behind ?shot=cover|loupe|urgency|gallery. Each plays the real rules
// forward through the same calls a player's clicks make (finds, misses, time passing, a hint,
// the loupe), then freezes the clock so the frame shows exactly that moment of play.
import { useMemoryStorage } from './gameState.js';

function centerOf(api, id) {
  const d = api.diffs().find((x) => x.id === id);
  return { x: d.box[0] + d.box[2] / 2, y: d.box[1] + d.box[3] / 2 };
}

/** Finds the named differences in order, letting `gaps[i]` seconds pass before each. */
function play(api, ids, gaps, sides = ['right', 'left']) {
  ids.forEach((id, i) => {
    api.advance(gaps[i % gaps.length]);
    const c = centerOf(api, id);
    api.inspectAt(c.x + 3, c.y - 2, sides[i % sides.length]);
  });
}

const SHOTS = {
  cover(api) {
    api.startScene(0, 'classic');
    play(api, ['needle', 'transom', 'koi', 'can'], [24, 19, 17, 18]);
  },
  loupe(api) {
    api.startScene(1, 'classic');
    play(api, ['hands', 'gear', 'lampshade', 'moon', 'watchchain'], [14, 12, 16, 11, 17]);
    api.ensureZoomArt();
    api.toggleLoupe();
    api.aim(642, 563);
  },
  urgency(api) {
    api.startScene(4, 'classic');
    play(api, ['shutter', 'window', 'flowerbox', 'keystone', 'pigeon'], [21, 19, 24, 18, 22]);
    api.inspectAt(600, 640, 'right');
    play(api, ['paperlantern', 'cushion', 'ferro', 'awning', 'citrus'], [23, 20, 19, 22, 17]);
    const s = api.state();
    api.advance(s.timeLeft - 18);
    api.useHint();
    api.holdHint(true);
  },
  gallery(api) {
    useMemoryStorage();
    const runs = [[0, 'classic', 9, []], [1, 'classic', 12, [[300, 600]]], [2, 'relaxed', 14, [[120, 620], [700, 640]]]];
    for (const [index, mode, gap, misses] of runs) {
      api.startScene(index, mode);
      for (const [x, y] of misses) api.inspectAt(x, y, 'left');
      play(api, api.diffs().map((d) => d.id), [gap, gap + 3, gap - 4]);
    }
    api.startScene(3, 'classic');
    api.showGallery();
  },
};

export function stageShot(name, api) {
  const shot = SHOTS[name];
  if (!shot) return;
  shot(api);
  api.freeze(true);
  document.body.dataset.shotReady = name;
}
