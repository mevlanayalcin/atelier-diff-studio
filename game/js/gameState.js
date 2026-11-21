// Round rules: difficulty modes, the pressure timer, streak multiplier, scoring, accuracy,
// star rating, and the best-time records kept in localStorage.

export const MODES = {
  relaxed: { key: 'relaxed', label: 'Relaxed', timed: false, penalty: 0, hints: 5, tolerance: 18, timeScale: 1 },
  classic: { key: 'classic', label: 'Classic Timed', timed: true, penalty: 5, hints: 3, tolerance: 12, timeScale: 1 },
  master: { key: 'master', label: 'Master Precision', timed: true, penalty: 5, hints: 1, tolerance: 6, timeScale: 0.72 },
};

const STORE_KEY = 'atelier-meridian.records.v1';
let memoryStore = null;

/** Screenshot staging keeps its records in memory, never touching a player's saved bests. */
export function useMemoryStorage() { memoryStore = {}; }

export function createRound(scene, modeKey) {
  const mode = MODES[modeKey] ?? MODES.classic;
  const limit = mode.timed ? Math.round(scene.baseTime * mode.timeScale) : Infinity;
  return {
    sceneId: scene.id, mode: mode.key, total: scene.diffs.length,
    found: [], misses: 0, streak: 0, bestStreak: 0, score: 0,
    timeLimit: limit, timeLeft: limit, elapsed: 0,
    hintsLeft: mode.hints, hintsMax: mode.hints, status: 'play',
  };
}

export function streakMultiplier(streak) { return Math.max(1, Math.min(5, streak)); }

/** Advances the clock; returns 'timeout' when the timer runs dry, 'tick' on each whole second of the final 15. */
export function tickRound(round, dt) {
  if (round.status !== 'play') return null;
  round.elapsed += dt;
  if (!Number.isFinite(round.timeLimit)) return null;
  const before = Math.ceil(round.timeLeft);
  round.timeLeft = Math.max(0, round.timeLeft - dt);
  if (round.timeLeft <= 0) { round.status = 'timeout'; return 'timeout'; }
  return Math.ceil(round.timeLeft) < before && round.timeLeft <= 15 ? 'tick' : null;
}

export function recordFind(round, diffId) {
  round.found.push(diffId);
  round.streak += 1;
  round.bestStreak = Math.max(round.bestStreak, round.streak);
  const multiplier = streakMultiplier(round.streak);
  const points = 100 * multiplier;
  round.score += points;
  if (round.found.length >= round.total) round.status = 'complete';
  return { multiplier, points };
}

/** A wrong click: breaks the streak and, in timed modes, costs seconds. Returns the seconds lost. */
export function recordMiss(round) {
  round.misses += 1;
  round.streak = 0;
  const penalty = MODES[round.mode].penalty;
  if (penalty && Number.isFinite(round.timeLimit)) round.timeLeft = Math.max(0.5, round.timeLeft - penalty);
  return penalty;
}

export function accuracy(round) {
  const clicks = round.found.length + round.misses;
  return clicks ? Math.round((round.found.length / clicks) * 100) : 100;
}

export function starRating(round) {
  if (round.status !== 'complete') return 0;
  const acc = accuracy(round);
  const spare = Number.isFinite(round.timeLimit) ? round.timeLeft / round.timeLimit : 1;
  const hintsUsed = round.hintsMax - round.hintsLeft;
  if (acc >= 85 && spare >= 0.3 && hintsUsed <= 1) return 3;
  if (acc >= 65 && hintsUsed <= 2) return 2;
  return 1;
}

/** Final tally: time bonus for seconds to spare, accuracy bonus. */
export function finishRound(round) {
  const timeBonus = Number.isFinite(round.timeLimit) ? Math.round(round.timeLeft * 10) : 0;
  const accBonus = accuracy(round) * 5;
  round.score += timeBonus + accBonus;
  return { stars: starRating(round), accuracy: accuracy(round), timeBonus, accBonus, score: round.score, time: round.elapsed };
}

/** Heat runs 0 to 1 as the timer drains: calm, warm in the last minute, critical at 25 seconds. */
export function urgencyOf(round) {
  if (!Number.isFinite(round.timeLimit)) return { level: 'calm', heat: 0 };
  const heat = Math.min(1, Math.max(0, 1 - round.timeLeft / round.timeLimit));
  return { level: round.timeLeft <= 25 ? 'critical' : round.timeLeft <= 60 ? 'warm' : 'calm', heat: round.timeLeft <= 25 ? 1 : heat };
}

export function formatClock(seconds) {
  if (!Number.isFinite(seconds)) return '∞';
  const s = Math.max(0, Math.ceil(seconds - 1e-6));
  return `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`;
}

export function loadRecords() {
  if (memoryStore) return memoryStore;
  try { return JSON.parse(localStorage.getItem(STORE_KEY)) || {}; } catch { return {}; }
}

/** Keeps the best stars, time and accuracy per scene and mode. */
export function saveRecord(round, summary) {
  const records = loadRecords();
  const key = `${round.sceneId}:${round.mode}`;
  const prev = records[key] || {};
  records[key] = {
    stars: Math.max(prev.stars || 0, summary.stars),
    bestTime: Math.min(prev.bestTime ?? Infinity, summary.time),
    accuracy: Math.max(prev.accuracy || 0, summary.accuracy),
    score: Math.max(prev.score || 0, summary.score),
  };
  if (memoryStore) memoryStore = records;
  else try { localStorage.setItem(STORE_KEY, JSON.stringify(records)); } catch { /* storage unavailable */ }
  return records[key];
}

/** Best record of a scene across all modes, for the gallery card. */
export function bestForScene(records, sceneId) {
  let best = null;
  for (const [key, rec] of Object.entries(records)) {
    if (!key.startsWith(`${sceneId}:`)) continue;
    if (!best || rec.stars > best.stars || (rec.stars === best.stars && rec.bestTime < best.bestTime)) best = { ...rec, mode: key.split(':')[1] };
  }
  return best;
}
