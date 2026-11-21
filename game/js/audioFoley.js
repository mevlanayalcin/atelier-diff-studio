// Procedural Web Audio foley. Silent until the first click or key (browsers require a gesture);
// then a marimba-and-harp find chime that climbs with the streak, a soft wooden tap on a miss,
// a warm brass ping for hints, a low heartbeat in the final seconds and a completion fanfare.

const PENTATONIC = [0, 2, 4, 7, 9, 12, 14, 16, 19, 21, 24];
const midiHz = (m) => 440 * 2 ** ((m - 69) / 12);

export function createFoley() {
  let ctx = null;
  let master = null;
  let muted = false;
  let noise = null;

  function unlock() {
    if (!ctx) {
      const Ctor = window.AudioContext || window.webkitAudioContext;
      if (!Ctor) return;
      ctx = new Ctor();
      master = ctx.createGain();
      master.gain.value = muted ? 0 : 0.55;
      const comp = ctx.createDynamicsCompressor();
      master.connect(comp).connect(ctx.destination);
      noise = ctx.createBuffer(1, ctx.sampleRate * 0.4, ctx.sampleRate);
      const data = noise.getChannelData(0);
      for (let i = 0; i < data.length; i++) data[i] = Math.random() * 2 - 1;
    }
    if (ctx.state === 'suspended') ctx.resume();
  }

  const ready = () => ctx && ctx.state === 'running' && !muted;

  /** One enveloped oscillator voice. */
  function voice(freq, at, dur, type = 'sine', gain = 0.3, attack = 0.005, dest = master) {
    const o = ctx.createOscillator(), g = ctx.createGain();
    o.type = type; o.frequency.setValueAtTime(freq, at);
    g.gain.setValueAtTime(0.0001, at);
    g.gain.exponentialRampToValueAtTime(gain, at + attack);
    g.gain.exponentialRampToValueAtTime(0.0001, at + dur);
    o.connect(g).connect(dest);
    o.start(at); o.stop(at + dur + 0.05);
  }

  function marimba(freq, at, gain = 0.32) {
    voice(freq, at, 0.9, 'sine', gain);
    voice(freq * 4, at, 0.12, 'sine', gain * 0.35);
    voice(freq * 10, at, 0.04, 'sine', gain * 0.12);
  }

  function harp(freq, at, gain = 0.16) {
    voice(freq, at, 1.4, 'triangle', gain, 0.003);
    voice(freq * 2, at, 0.6, 'sine', gain * 0.4, 0.003);
  }

  function findChime(streak) {
    if (!ready()) return;
    const t = ctx.currentTime, step = Math.min(PENTATONIC.length - 3, Math.max(0, streak - 1));
    const root = 72 + PENTATONIC[step];
    marimba(midiHz(root), t);
    harp(midiHz(root + 7), t + 0.07);
    harp(midiHz(root + 12), t + 0.14, 0.12);
  }

  function missTap() {
    if (!ready()) return;
    const t = ctx.currentTime, src = ctx.createBufferSource(), bp = ctx.createBiquadFilter(), g = ctx.createGain();
    src.buffer = noise; bp.type = 'bandpass'; bp.frequency.value = 900; bp.Q.value = 3;
    g.gain.setValueAtTime(0.5, t); g.gain.exponentialRampToValueAtTime(0.0001, t + 0.07);
    src.connect(bp).connect(g).connect(master); src.start(t); src.stop(t + 0.1);
    voice(170, t, 0.12, 'sine', 0.35);
    voice(120, t + 0.05, 0.14, 'sine', 0.2);
  }

  function hintPing() {
    if (!ready()) return;
    const t = ctx.currentTime, lp = ctx.createBiquadFilter();
    lp.type = 'lowpass'; lp.frequency.value = 1800; lp.connect(master);
    voice(midiHz(67), t, 1.1, 'sawtooth', 0.09, 0.02, lp);
    voice(midiHz(74), t + 0.02, 1.0, 'sawtooth', 0.06, 0.02, lp);
    voice(midiHz(79), t, 1.6, 'sine', 0.12);
  }

  function heartbeat() {
    if (!ready()) return;
    const t = ctx.currentTime;
    voice(58, t, 0.16, 'sine', 0.55, 0.004);
    voice(50, t + 0.17, 0.2, 'sine', 0.4, 0.004);
  }

  function fanfare() {
    if (!ready()) return;
    const t = ctx.currentTime;
    [60, 64, 67, 72].forEach((m, i) => { voice(midiHz(m), t + i * 0.13, 0.5, 'sawtooth', 0.07, 0.02); marimba(midiHz(m + 12), t + i * 0.13, 0.18); });
    for (const m of [72, 76, 79, 84]) { voice(midiHz(m), t + 0.6, 1.6, 'triangle', 0.1, 0.03); }
    harp(midiHz(96), t + 0.9, 0.1);
  }

  function uiClick() {
    if (!ready()) return;
    voice(midiHz(88), ctx.currentTime, 0.06, 'sine', 0.08);
  }

  function setMuted(value) {
    muted = value;
    if (master) master.gain.setTargetAtTime(muted ? 0 : 0.55, ctx.currentTime, 0.02);
  }

  return { unlock, findChime, missTap, hintPing, heartbeat, fanfare, uiClick, setMuted, isMuted: () => muted };
}
