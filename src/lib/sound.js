// Sonido 100% sintetizado (WebAudio): efectos de recompensa y música ambiental generativa por región.
let ctx; let master; let musicGain; let musicTimer; let musicNodes = [];
const cfg = { music: true, sfx: true, volume: 0.7 };
export function setAudio(o) {
  Object.assign(cfg, o);
  if (master) { master.gain.value = cfg.volume; }
  if (!cfg.music) stopMusic();
}
function ensure() {
  if (!ctx) {
    const AC = window.AudioContext || window.webkitAudioContext; if (!AC) return null;
    ctx = new AC(); master = ctx.createGain(); master.gain.value = cfg.volume; master.connect(ctx.destination);
    musicGain = ctx.createGain(); musicGain.gain.value = 0.16; musicGain.connect(master);
  }
  if (ctx.state === 'suspended') ctx.resume();
  return ctx;
}
export const unlockAudio = () => ensure();
addEventListener('pointerdown', () => ensure(), { once: true });

function tone(freq, t0, dur, { type = 'sine', vol = 0.25, slide = 0, to = master, attack = 0.005 } = {}) {
  const c = ensure(); if (!c) return;
  const o = c.createOscillator(); const g = c.createGain();
  o.type = type; o.frequency.setValueAtTime(freq, t0); if (slide) o.frequency.exponentialRampToValueAtTime(Math.max(30, freq + slide), t0 + dur);
  g.gain.setValueAtTime(0.0001, t0); g.gain.exponentialRampToValueAtTime(vol, t0 + attack); g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
  o.connect(g); g.connect(to); o.start(t0); o.stop(t0 + dur + 0.05);
}
function noise(t0, dur, vol = 0.2, fc = 800) {
  const c = ensure(); if (!c) return;
  const b = c.createBuffer(1, c.sampleRate * dur, c.sampleRate); const d = b.getChannelData(0); for (let i = 0; i < d.length; i++) d[i] = (Math.random() * 2 - 1) * (1 - i / d.length);
  const s = c.createBufferSource(); s.buffer = b; const f = c.createBiquadFilter(); f.type = 'lowpass'; f.frequency.value = fc; const g = c.createGain(); g.gain.value = vol;
  s.connect(f); f.connect(g); g.connect(master); s.start(t0);
}
const N = (n) => 440 * 2 ** ((n - 69) / 12);
const play = (fn) => { if (!cfg.sfx) return; const c = ensure(); if (c) fn(c.currentTime); };

export const sfx = {
  click: () => play((t) => tone(520, t, 0.06, { type: 'triangle', vol: 0.12 })),
  hit: () => play((t) => { tone(220, t, 0.18, { type: 'sawtooth', vol: 0.2, slide: -150 }); noise(t, 0.12, 0.25, 1500); tone(880, t + 0.02, 0.1, { type: 'square', vol: 0.08 }); }),
  crit: () => play((t) => { [76, 83, 88].forEach((n, i) => tone(N(n), t + i * 0.05, 0.2, { type: 'square', vol: 0.12 })); noise(t, 0.2, 0.3, 2500); }),
  correct: () => play((t) => [72, 76, 79, 84].forEach((n, i) => tone(N(n), t + i * 0.07, 0.25, { type: 'triangle', vol: 0.2 }))),
  wrong: () => play((t) => { tone(150, t, 0.3, { type: 'sawtooth', vol: 0.18, slide: -60 }); tone(110, t + 0.1, 0.3, { type: 'square', vol: 0.1 }); }),
  hurt: () => play((t) => { tone(300, t, 0.25, { type: 'sawtooth', vol: 0.2, slide: -220 }); noise(t, 0.15, 0.18, 600); }),
  heal: () => play((t) => [67, 71, 74, 79].forEach((n, i) => tone(N(n), t + i * 0.09, 0.3, { type: 'sine', vol: 0.2 }))),
  coin: () => play((t) => { tone(N(88), t, 0.08, { type: 'square', vol: 0.12 }); tone(N(95), t + 0.07, 0.25, { type: 'square', vol: 0.12 }); }),
  spawn: () => play((t) => { tone(80, t, 0.6, { type: 'sawtooth', vol: 0.18, slide: 120 }); noise(t, 0.4, 0.15, 400); }),
  defeat: () => play((t) => [62, 59, 55, 50].forEach((n, i) => tone(N(n), t + i * 0.18, 0.4, { type: 'triangle', vol: 0.2 }))),
  victory: () => play((t) => { [72, 72, 72, 76, 79, 76, 79, 84].forEach((n, i) => tone(N(n), t + i * 0.12, 0.3, { type: 'square', vol: 0.13 })); [60, 64, 67, 72].forEach((n, i) => tone(N(n), t + 0.9 + i * 0.01, 1, { type: 'triangle', vol: 0.14 })); }),
  levelup: () => play((t) => [60, 64, 67, 72, 76, 79, 84].forEach((n, i) => tone(N(n), t + i * 0.08, 0.35, { type: 'triangle', vol: 0.18 }))),
  open: () => play((t) => { noise(t, 0.3, 0.2, 3000); [79, 83, 86, 91].forEach((n, i) => tone(N(n), t + 0.2 + i * 0.1, 0.35, { type: 'sine', vol: 0.18 })); }),
  star: () => play((t) => tone(N(96 - Math.floor(Math.random() * 6)), t, 0.4, { type: 'sine', vol: 0.1 })),
};

/* Música ambiental generativa: pad + arpegio suave según el estado de ánimo de la región. */
const MOODS = {
  calm: { root: 57, scale: [0, 2, 4, 7, 9], tempo: 0.9, wave: 'sine' }, adventure: { root: 55, scale: [0, 2, 3, 7, 9], tempo: 0.62, wave: 'triangle' },
  mystery: { root: 52, scale: [0, 1, 4, 5, 8], tempo: 1.0, wave: 'sine' }, explore: { root: 59, scale: [0, 2, 5, 7, 9], tempo: 0.7, wave: 'triangle' },
  space: { root: 50, scale: [0, 3, 5, 7, 10], tempo: 1.2, wave: 'sine' }, tech: { root: 57, scale: [0, 2, 4, 7, 11], tempo: 0.5, wave: 'square' },
  future: { root: 60, scale: [0, 4, 7, 11, 14], tempo: 0.7, wave: 'triangle' },
};
export function startMusic(mood = 'space') {
  if (!cfg.music) return; const c = ensure(); if (!c) return; stopMusic();
  const m = MOODS[mood] || MOODS.space; let step = 0;
  const pad = () => { [0, 7, 12].forEach((iv) => { const t = c.currentTime; const o = c.createOscillator(); const g = c.createGain(); o.type = 'sine'; o.frequency.value = N(m.root - 12 + iv); g.gain.setValueAtTime(0.0001, t); g.gain.linearRampToValueAtTime(0.5, t + 2); g.gain.linearRampToValueAtTime(0.0001, t + 6); o.connect(g); g.connect(musicGain); o.start(t); o.stop(t + 6.2); musicNodes.push(o); }); };
  pad();
  musicTimer = setInterval(() => {
    if (!cfg.music || document.hidden) return;
    step += 1; if (step % 12 === 0) pad();
    if (Math.random() < 0.7) { const deg = m.scale[Math.floor(Math.random() * m.scale.length)]; const t = c.currentTime; tone(N(m.root + 12 + deg + (Math.random() < 0.3 ? 12 : 0)), t, 1.4, { type: m.wave, vol: 0.18, to: musicGain, attack: 0.05 }); }
  }, m.tempo * 1000);
}
export function stopMusic() { clearInterval(musicTimer); musicNodes.forEach((o) => { try { o.stop(); } catch { /* ya detenido */ } }); musicNodes = []; }
