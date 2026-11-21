// The DOM around the plates: HUD bar (title, remaining counter and pips, pressure timer,
// streak, tools), the urgency frame glow, the discovery strip, and the gallery, results and
// pause cards.
import { formatClock, MODES, accuracy, bestForScene } from './gameState.js';

const $ = (id) => document.getElementById(id);
const cache = new Map();

/** Sets text only when it changed, so a per-frame render stays cheap. */
function put(id, value, prop = 'textContent') {
  const key = `${id}.${prop}`;
  if (cache.get(key) === value) return;
  cache.set(key, value);
  $(id)[prop] = value;
}

export function bindHudControls(handlers) {
  const map = { 'btn-hint': 'onHint', 'btn-loupe': 'onLoupe', 'btn-mute': 'onMute', 'btn-pause': 'onPause', 'btn-gallery': 'onGallery', 'btn-resume': 'onPause' };
  for (const [id, name] of Object.entries(map)) {
    $(id).addEventListener('click', (e) => { e.currentTarget.blur(); handlers[name](); });
  }
}

const mix = (a, b, t) => a.map((v, i) => Math.round(v + (b[i] - v) * t));
/** Brass, warming to amber, then crimson as the heat rises. */
function timerColor(heat) {
  const brass = [217, 173, 79], amber = [240, 150, 46], crimson = [220, 44, 52];
  const c = heat < 0.7 ? mix(brass, amber, heat / 0.7) : mix(amber, crimson, Math.min(1, (heat - 0.7) / 0.3));
  return `rgb(${c.join(',')})`;
}

export function renderHud({ scene, numeral, round, hintCooldown, loupeOn, muted, urgency }) {
  put('scene-title', scene.title);
  put('plate-numeral', `Plate ${numeral}`);
  put('tier-badge', scene.tier);
  $('tier-badge').dataset.tier = scene.tier;
  const found = round.found.length;
  put('found-count', String(found));
  put('total-count', String(round.total));
  put('remaining-count', String(round.total - found));
  const pipKey = `${found}/${round.total}`;
  if (cache.get('pips') !== pipKey) {
    cache.set('pips', pipKey);
    $('pips').innerHTML = Array.from({ length: round.total }, (_, i) => `<span class="pip${i < found ? ' on' : ''}"></span>`).join('');
  }
  const timed = Number.isFinite(round.timeLimit);
  put('timer-digits', timed ? formatClock(round.timeLeft) : 'RELAXED');
  const fill = $('timer-fill');
  fill.style.width = timed ? `${(round.timeLeft / round.timeLimit) * 100}%` : '100%';
  fill.style.backgroundColor = timed ? timerColor(urgency.heat) : '#6aa88a';
  $('timer').classList.toggle('urgent', urgency.level === 'critical');
  $('timer').classList.toggle('relaxed', !timed);
  put('streak-value', `×${Math.max(1, Math.min(5, round.streak))}`);
  $('streak').classList.toggle('hot', round.streak >= 3);
  put('hint-count', `${round.hintsLeft}/${round.hintsMax}`);
  $('btn-hint').classList.toggle('cooling', hintCooldown > 0 || round.hintsLeft <= 0);
  $('btn-loupe').classList.toggle('active', loupeOn);
  $('btn-mute').classList.toggle('active', !muted);
  put('mute-glyph', muted ? '✕' : '♪');
  setUrgencyFrame(urgency);
}

export function setUrgencyFrame(urgency) {
  const frame = $('urgency-frame');
  frame.classList.toggle('warm', urgency.level === 'warm');
  frame.classList.toggle('critical', urgency.level === 'critical');
  document.body.classList.toggle('critical-plates', urgency.level === 'critical');
}

/** Named pills for every find, in order, then a dashed ghost pill per difference still out there. */
export function renderDiscoveryStrip(scene, round) {
  const byId = Object.fromEntries(scene.diffs.map((d) => [d.id, d]));
  const found = round.found.map((id, i) => `<li class="${i === round.found.length - 1 ? 'fresh' : ''}"><b>${i + 1}</b>${byId[id].name}</li>`);
  const ghosts = Array.from({ length: round.total - round.found.length }, (_, i) => `<li class="ghost">#${round.found.length + i + 1} ?</li>`);
  $('discovery-list').innerHTML = found.concat(ghosts).join('');
}

export function flashPenalty(seconds) {
  const el = $('penalty-float');
  el.textContent = `−${seconds}s`;
  el.classList.remove('show');
  void el.offsetWidth;
  el.classList.add('show');
}

export function shakePlate(side) {
  const el = $(`plate-${side}`);
  el.classList.remove('shake');
  void el.offsetWidth;
  el.classList.add('shake');
}

export function announce(text) { $('status').textContent = text; }

const starRow = (n, cls = '') => `<span class="${cls}">${[0, 1, 2].map((i) => `<span class="${i < n ? '' : 'off'}">★</span>`).join('')}</span>`;

/** The World Gallery: live thumbnails, tier and count per plate, stars and bests, mode selector. */
export function openGallery({ manifest, records, mode, current, thumbnails, onPick, onMode }) {
  const select = $('mode-select');
  select.innerHTML = Object.values(MODES).map((m) => `<button role="radio" aria-checked="${m.key === mode}" data-mode="${m.key}" class="${m.key === mode ? 'on' : ''}">${m.label}<small>${m.timed ? `−${m.penalty}s a miss · ${m.hints} hint${m.hints > 1 ? 's' : ''}` : `untimed · ${m.hints} hints`}</small></button>`).join('');
  select.onclick = (e) => { const b = e.target.closest('button'); if (b) onMode(b.dataset.mode); };
  const grid = $('gallery-grid');
  grid.innerHTML = '';
  manifest.forEach((s) => {
    const best = bestForScene(records, s.id);
    const card = document.createElement('button');
    card.className = `scene-card${s.index === current ? ' current' : ''}`;
    card.innerHTML = `<div class="thumb"></div><span class="num">PLATE ${s.numeral}</span><h3>${s.title}</h3>
      <div class="card-meta"><span class="badge" data-tier="${s.tier}">${s.tier}</span><span>${s.count} differences</span></div>
      ${starRow(best ? best.stars : 0, 'card-stars')}
      <div class="card-best">${best ? `Best ${formatClock(best.bestTime)} · ${best.accuracy}% accuracy` : 'Not yet restored'}</div>`;
    card.querySelector('.thumb').replaceWith(thumbnails[s.index]);
    card.addEventListener('click', () => onPick(s.index));
    grid.appendChild(card);
  });
  $('gallery').hidden = false;
}

export function closeGallery() { $('gallery').hidden = true; }

export function showResults({ won, summary, round, scene, hasNext }, handlers) {
  const card = $('results-card');
  card.innerHTML = won
    ? `<span class="brand">Plate restored</span><h2>${scene.title}</h2><div class="stars">${starRow(summary.stars)}</div>
       <div class="stat-grid"><div><small>TIME</small><b>${formatClock(summary.time)}</b></div><div><small>ACCURACY</small><b>${summary.accuracy}%</b></div>
       <div><small>BEST STREAK</small><b>×${round.bestStreak}</b></div><div><small>SCORE</small><b>${summary.score}</b></div></div>
       ${hasNext ? '<button class="cta" data-act="next">Next Plate</button>' : ''}<button class="cta ghost" data-act="retry">Replay</button><button class="cta ghost" data-act="gallery">Gallery</button>`
    : `<span class="brand">The gallery closes</span><h2>Time's Up</h2><p>${round.found.length} of ${round.total} found · ${accuracy(round)}% accuracy. The crimson rings show what the forger slipped past you.</p>
       <button class="cta" data-act="retry">Try Again</button><button class="cta ghost" data-act="gallery">Gallery</button>`;
  card.onclick = (e) => { const b = e.target.closest('button'); if (b) handlers[b.dataset.act](); };
  $('results').hidden = false;
}

export function hideResults() { $('results').hidden = true; }

export function showPause(on) {
  $('pause').hidden = !on;
  $('stage').classList.toggle('dimmed', on);
}

export function isModalOpen() {
  return !$('gallery').hidden || !$('results').hidden || !$('pause').hidden;
}

export function isGalleryOpen() { return !$('gallery').hidden; }
