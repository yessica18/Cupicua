// Motor de progreso y gamificación de CAPICÚA. Funciones puras sobre un objeto de estado JSON.
import { REGIONS, REGION_BY_ID, LEVEL_BY_ID, ALL_LEVELS } from '../content/regions.js';
import { MENTORS } from '../content/mentors.js';
import { WEAPONS, CAPIA_OUTFITS, PUZZLES, SECRETS, COSMETICS } from '../content/game.js';
import { levelMastery, newLevelState, STATUS } from './mastery.js';
import { newSrs, reviewSrs, dueReviews, DAY_MS } from './srs.js';
import { parseGenSpec } from '../content/generators.js';

export const STATE_VERSION = 1;

export const dayKey = (d = new Date()) => {
  const x = new Date(d);
  return `${x.getFullYear()}-${String(x.getMonth() + 1).padStart(2, '0')}-${String(x.getDate()).padStart(2, '0')}`;
};
const dayDiff = (a, b) => Math.round((new Date(b + 'T12:00:00') - new Date(a + 'T12:00:00')) / DAY_MS);
const addDays = (key, n) => dayKey(new Date(new Date(key + 'T12:00:00').getTime() + n * DAY_MS));

export function newState() {
  return {
    v: STATE_VERSION, createdAt: Date.now(), onboarded: false,
    profile: { name: '', username: '', ageBand: '13-17', mentor: 'pitagoras', title: 'Aventurero curioso', capiaOutfit: 'base', bio: '',
      avatar: { skin: '#e8b998', hair: 'short', hairColor: '#2b2118', top: 'hoodie', topColor: '#7c3aed', accessory: 'none', shoes: 'sneakers', backpack: 'school', effect: 'none', pet: 'none' } },
    xp: 0, pi: 0,
    stats: { solved: 0, correct: 0, firstTry: 0, lessons: 0, challenges: 0, hints: 0, minutes: 0, paper: 0, explains: 0, quizzes: 0, bosses: 0, daily: 0, perfect: 0, reviews: 0, reviewsOk: 0, persevered: 0, selfFixed: 0, hard: 0, noHint: 0, searches: 0, pdfs: 0, photos: 0, voice: 0, friends: 0, messages: 0, shared: 0, rooms: 0, boards: 0, projects: 0, duels: 0 },
    streak: { count: 0, best: 0, lastDay: null, freezes: 1, rest: [], frozen: [], lost: null, recoverable: null, sinceLoss: 0 },
    days: {}, // dayKey → { q, c, lessons, minutes }
    levels: {}, srs: {}, errors: [], recentActs: [],
    bosses: {}, achievements: {}, owned: ['sneakers', 'short', 'long', 'bun', 'curly', 'tee', 'hoodie', 'labcoat', 'school', 'none'], mentors: {}, codex: {}, curiosities: {}, secrets: {}, piFound: {}, missions: {}, daily: {}, labs: {}, projects: {}, plans: [], docs: [],
    seedCtr: 1, diagnostic: null, seenIntro: false,
    settings: { theme: 'dark', music: true, sfx: true, voice: true, volume: 0.7, rate: 1, textSize: 100, contrast: false, reduceMotion: false, captions: true, privacy: { profile: 'friends', progress: 'friends', dms: 'friends', cam: false, mic: false } },
  };
}

export function ensureLevel(state, id) {
  if (!state.levels[id]) state.levels[id] = newLevelState();
  return state.levels[id];
}

/* ───────────── Nivel de jugador ───────────── */
export const xpForLevel = (lv) => Math.round(120 * (lv - 1) ** 2);
export function playerLevel(xp) {
  const lv = Math.floor(Math.sqrt(Math.max(0, xp) / 120)) + 1;
  const cur = xpForLevel(lv); const next = xpForLevel(lv + 1);
  return { level: lv, cur, next, pct: Math.round(((xp - cur) / (next - cur)) * 100) };
}

/* ───────────── Maestría y estado de nodos ───────────── */
export const masteryOf = (state, id) => levelMastery(state.levels[id]);

export function regionProgress(state, regionId) {
  const lv = REGION_BY_ID[regionId].levels;
  const sum = lv.reduce((s, l) => s + masteryOf(state, l.id).pct, 0);
  return Math.round(sum / lv.length);
}

export function levelsMasteredCount(state, regionId) {
  return REGION_BY_ID[regionId].levels.filter((l) => masteryOf(state, l.id).pct >= 81).length;
}

/** Requisitos de un nivel, incluidos los de otras regiones para el nivel 1 de cada región. */
export function requirementsOf(levelId) {
  const lv = LEVEL_BY_ID[levelId];
  const reqs = lv.req.map((id) => ({ id, soft: false }));
  if (lv.n === 1) {
    const pre = REGION_BY_ID[lv.region].prereq || [];
    pre.forEach((p) => reqs.push({ id: `${p.r}.${p.n}`, soft: true }));
  }
  return reqs;
}

/** Prerrequisitos todavía débiles (<40%) → recomendación amable, nunca bloqueo agresivo. */
export function prereqGaps(state, levelId, threshold = 40) {
  return requirementsOf(levelId)
    .map((r) => ({ ...r, level: LEVEL_BY_ID[r.id], pct: masteryOf(state, r.id).pct }))
    .filter((r) => r.pct < threshold);
}

export function nodeStatus(state, levelId) {
  const pct = masteryOf(state, levelId).pct;
  const ls = state.levels[levelId];
  if (pct >= 81) return STATUS.MASTERED;
  if (ls && (ls.att > 0 || ls.placed)) return STATUS.PROGRESS;
  const gaps = prereqGaps(state, levelId, 25);
  return gaps.length ? STATUS.LOCKED : STATUS.DISCOVERED;
}

export const regionUnlockedFor = (state, regionId) => {
  const pre = REGION_BY_ID[regionId].prereq || [];
  return pre.every((p) => masteryOf(state, `${p.r}.${p.n}`).pct >= 25);
};

/* ───────────── Racha amable ───────────── */
export function touchStreak(state, now = new Date()) {
  const s = state.streak; const today = dayKey(now);
  if (s.lastDay === today) return { changed: false };
  const events = [];
  if (!s.lastDay) { s.count = 1; }
  else {
    const gap = dayDiff(s.lastDay, today) - 1; // días completos sin estudiar
    let broken = false;
    for (let i = 1; i <= gap; i++) {
      const d = addDays(s.lastDay, i);
      if (s.rest.includes(d)) continue; // día de descanso declarado
      if (s.freezes > 0) { s.freezes -= 1; s.frozen.push(d); events.push({ type: 'freeze', day: d }); continue; }
      broken = true;
    }
    if (broken) {
      s.recoverable = s.count >= 3 ? { count: s.count, deadline: addDays(today, 1) } : null;
      s.lost = { count: s.count, at: today };
      s.count = 1; s.sinceLoss = 0;
      events.push({ type: 'lost' });
    } else s.count += 1;
  }
  s.lastDay = today; s.best = Math.max(s.best, s.count);
  if (s.count > 0 && s.count % 7 === 0) { s.freezes = Math.min(2, s.freezes + 1); events.push({ type: 'freeze-earned' }); }
  return { changed: true, events };
}

/** Recuperar la racha: completar 2 lecciones el día siguiente a perderla. */
export function tryRecoverStreak(state, now = new Date()) {
  const s = state.streak; const today = dayKey(now);
  if (!s.recoverable || today > s.recoverable.deadline || s.sinceLoss < 2) return false;
  s.count = s.recoverable.count + 1; s.best = Math.max(s.best, s.count); s.recoverable = null; s.lost = null;
  return true;
}

export function setRestDay(state, key) {
  const week = state.streak.rest.filter((d) => Math.abs(dayDiff(d, key)) < 7);
  if (week.length >= 2 && !state.streak.rest.includes(key)) return false;
  if (!state.streak.rest.includes(key)) state.streak.rest.push(key);
  return true;
}

/* ───────────── Recompensas ───────────── */
export function addXP(state, n) {
  const before = playerLevel(state.xp).level;
  state.xp += n;
  const after = playerLevel(state.xp).level;
  return after > before ? { levelUp: after } : null;
}
export const addPI = (state, n) => { state.pi += n; state.piEarned = (state.piEarned || 0) + n; };

const day = (state, key = dayKey()) => (state.days[key] ||= { q: 0, c: 0, lessons: 0, minutes: 0 });

/**
 * Registra un intento. Devuelve {xp, events} para microinteracciones.
 * mode: 'lesson' | 'practice' | 'review' | 'quiz' | 'boss' | 'daily'
 */
export function recordAttempt(state, a) {
  const { levelId, spec, seed, difficulty = 1, correct, hints = 0, mode = 'practice', qType = 'numeric', input = '', msg = '', firstTry = true } = a;
  const events = [];
  const ls = ensureLevel(state, levelId);
  const now = Date.now();
  if (!ls.firstTs) ls.firstTs = now;
  ls.lastTs = now; ls.att += 1; state.stats.solved += 1;
  const credit = correct ? (hints === 0 ? 1 : hints === 1 ? 0.85 : hints === 2 ? 0.65 : 0.45) : 0;
  ls.recent.push(credit); if (ls.recent.length > 12) ls.recent.shift();
  const g = (ls.gens[spec] ||= { att: 0, cor: 0 }); g.att += 1;
  const vkey = `${spec}|${difficulty}|${qType}`;
  const d = day(state); d.q += 1;
  const act = { t: now, l: levelId, s: spec, k: seed, d: difficulty, ok: correct ? 1 : 0, h: hints, m: mode };
  state.recentActs.push(act); if (state.recentActs.length > 400) state.recentActs.shift();

  let xp = 0;
  if (mode === 'review') { state.stats.reviews += 1; }
  if (correct) {
    ls.cor += 1; g.cor += 1; state.stats.correct += 1; d.c += 1; ls.streak += 1; ls.bestStreak = Math.max(ls.bestStreak, ls.streak);
    if (!ls.variety.includes(vkey)) ls.variety.push(vkey);
    ls.types[qType] = (ls.types[qType] || 0) + 1;
    xp = 10 * difficulty + (hints === 0 && firstTry ? 5 : 0);
    if (hints === 0) state.stats.noHint += 1;
    if (hints === 0 && firstTry) state.stats.firstTry += 1;
    if (difficulty >= 3) state.stats.hard += 1;
    if (ls.pending[spec]) { // recuperación después de un error
      ls.recov += 1; delete ls.pending[spec]; state.stats.errorsOvercome += 0; state.stats.selfFixed += hints === 0 ? 1 : 0;
      events.push({ type: 'recovered' });
      state.stats.errorsOvercome = (state.stats.errorsOvercome || 0) + 1;
    }
    if (ls.errsInRow >= 3) { state.stats.persevered += 1; events.push({ type: 'persevered' }); }
    ls.errsInRow = 0;
  } else {
    ls.errs += 1; ls.streak = 0; ls.pending[spec] = true; ls.errsInRow = (ls.errsInRow || 0) + 1;
    xp = 2; // intentar también suma: el error es información
    state.errors.push({ t: now, l: levelId, s: spec, k: seed, d: difficulty, in: String(input).slice(0, 60), msg: msg.slice(0, 140) });
    if (state.errors.length > 300) state.errors.shift();
  }
  if (hints) state.stats.hints += hints;
  const lu = addXP(state, xp);
  if (lu) events.push({ type: 'levelup', level: lu.levelUp });
  const sr = touchStreak(state); if (sr.events) events.push(...sr.events);
  return { xp, events };
}

/** Programa el siguiente repaso de la habilidad según qué tan bien salió. */
export function scheduleReview(state, levelId, accuracy, hintsAvg = 0) {
  const q = Math.max(0, Math.min(5, Math.round(accuracy * 5 - hintsAvg * 0.6)));
  state.srs[levelId] = reviewSrs(state.srs[levelId], q);
  return state.srs[levelId];
}

/** Repaso espaciado: acierto tras al menos 1 día cuenta como retención. */
export function recordRetention(state, levelId, ok) {
  const ls = ensureLevel(state, levelId);
  ls.ret.tot += 1; if (ok) { ls.ret.ok += 1; state.stats.reviewsOk += 1; }
  scheduleReview(state, levelId, ok ? 0.9 : 0.2);
}

/**
 * Cierra una lección: recompensas, racha, repaso futuro, dominio.
 * summary: {correct, total, errors, hints, kind}
 */
export function completeLesson(state, levelId, summary) {
  const lv = LEVEL_BY_ID[levelId]; const ls = ensureLevel(state, levelId);
  const before = masteryOf(state, levelId).pct;
  ls.lessons += 1; state.stats.lessons += 1;
  const d = day(state); d.lessons += 1;
  const events = [];
  const isChallenge = summary.kind === 'challenge' || summary.kind === 'boss';
  if (isChallenge) state.stats.challenges += 1;
  const total = Math.max(1, summary.total || 1);
  const acc = (summary.correct || 0) / total;
  if (acc === 1 && total >= 4 && !summary.errors) { state.stats.perfect += 1; events.push({ type: 'perfect' }); }
  let xp = 50 + 10 * (summary.correct || 0);
  let pi = 0;
  const todayLessons = d.lessons;
  if (todayLessons <= 6) pi += isChallenge ? 20 : 10; // evita “farmear” PI repitiendo
  scheduleReview(state, levelId, acc, (summary.hints || 0) / total);
  const lu = addXP(state, xp);
  if (lu) events.push({ type: 'levelup', level: lu.levelUp });
  state.streak.sinceLoss = (state.streak.sinceLoss || 0) + 1;
  if (tryRecoverStreak(state)) events.push({ type: 'streak-recovered' });
  const sr = touchStreak(state); if (sr.events) events.push(...sr.events);
  const after = masteryOf(state, levelId).pct;
  if (before < 81 && after >= 81) {
    pi += 50; xp += 200; addXP(state, 200); events.push({ type: 'mastered', levelId });
  }
  if (lv.boss && acc >= 0.7 && !state.bosses[lv.region]) {
    state.bosses[lv.region] = Date.now(); state.stats.bosses += 1; pi += 100; xp += 500; addXP(state, 500);
    events.push({ type: 'boss', region: lv.region });
  }
  addPI(state, pi);
  return { xp, pi, events, before, after };
}

/* ───────────── Selección adaptativa de ejercicios ───────────── */
function hash(str) { let h = 2166136261; for (let i = 0; i < str.length; i++) { h ^= str.charCodeAt(i); h = Math.imul(h, 16777619); } return h >>> 0; }

export function nextSeed(state, levelId) {
  const seed = (state.seedCtr++ * 7919 + (hash(levelId) % 9973)) % 1000003;
  return seed || 1;
}

export function adaptiveDifficulty(state, levelId) {
  const lv = LEVEL_BY_ID[levelId]; const ls = state.levels[levelId];
  let d = lv.baseDiff;
  if (ls && ls.recent.length >= 4) {
    const r = ls.recent.slice(-6); const acc = r.reduce((s, v) => s + v, 0) / r.length;
    if (acc >= 0.85 && ls.att >= 8) d += 1; else if (acc <= 0.4) d -= 1;
  }
  return Math.max(1, Math.min(3, d));
}

/** Elige el siguiente generador: más peso a donde hay más errores. */
export function nextExercise(state, levelId, rnd = Math.random) {
  const lv = LEVEL_BY_ID[levelId]; const ls = state.levels[levelId];
  const pool = lv.gens.filter((g) => !g.startsWith('project:'));
  const specs = pool.length ? pool : lv.gens;
  const weights = specs.map((spec) => {
    const g = ls?.gens?.[spec];
    const errRate = g && g.att ? 1 - g.cor / g.att : 0.3;
    const novelty = g ? 0 : 0.5;
    return 1 + 2.5 * errRate + novelty;
  });
  let r = rnd() * weights.reduce((a, b) => a + b, 0); let idx = 0;
  while (r > weights[idx] && idx < weights.length - 1) { r -= weights[idx]; idx += 1; }
  const spec = specs[idx];
  return { spec, seed: nextSeed(state, levelId), difficulty: adaptiveDifficulty(state, levelId) };
}

/* ───────────── Análisis del aprendizaje ───────────── */
export function weaknesses(state, n = 5) {
  const rows = Object.entries(state.levels).map(([id, ls]) => {
    const recentErr = state.recentActs.filter((a) => a.l === id).slice(-12);
    const miss = recentErr.filter((a) => !a.ok).length;
    return { id, level: LEVEL_BY_ID[id], miss, att: ls.att, pct: masteryOf(state, id).pct, rate: recentErr.length ? miss / recentErr.length : 0 };
  }).filter((r) => r.level && r.att >= 3 && r.rate > 0.25);
  return rows.sort((a, b) => b.rate * Math.log(1 + b.att) - a.rate * Math.log(1 + a.att)).slice(0, n);
}

export function strengths(state, n = 5) {
  return Object.keys(state.levels).map((id) => ({ id, level: LEVEL_BY_ID[id], pct: masteryOf(state, id).pct })).filter((r) => r.level && r.pct >= 60).sort((a, b) => b.pct - a.pct).slice(0, n);
}

export function frequentMistakes(state, n = 5) {
  const c = {};
  state.errors.forEach((e) => { const k = e.msg || 'Sin diagnóstico'; (c[k] ||= { msg: k, n: 0, l: e.l }).n += 1; });
  return Object.values(c).sort((a, b) => b.n - a.n).slice(0, n);
}

export function pendingReviews(state, now = Date.now()) {
  return dueReviews(state.srs, now).map((r) => ({ ...r, level: LEVEL_BY_ID[r.id], days: Math.floor((now - r.s.last) / DAY_MS) })).filter((r) => r.level);
}

export function accuracy(state) { return state.stats.solved ? Math.round((state.stats.correct / state.stats.solved) * 100) : 0; }

export function totalMastery(state) {
  return Math.round(REGIONS.reduce((s, r) => s + regionProgress(state, r.id), 0) / REGIONS.length);
}

/** Siguiente misión recomendada: continuar donde estás; si hay brechas, sugerir fortalecer. */
export function recommendNext(state) {
  const due = pendingReviews(state)[0];
  const inProgress = ALL_LEVELS.filter((l) => state.levels[l.id]?.att && masteryOf(state, l.id).pct < 81).sort((a, b) => (state.levels[b.id].lastTs || 0) - (state.levels[a.id].lastTs || 0))[0];
  if (inProgress) return { kind: 'continue', level: inProgress };
  // primer nivel sin dominar con prerrequisitos razonables
  for (const r of REGIONS) {
    if (!regionUnlockedFor(state, r.id)) continue;
    const cand = r.levels.find((l) => masteryOf(state, l.id).pct < 81 && prereqGaps(state, l.id, 25).length === 0);
    if (cand) return { kind: 'new', level: cand, due };
  }
  return { kind: 'free', level: ALL_LEVELS[0], due };
}

/* ───────────── Desbloqueos ───────────── */
const reached = (state, u) => masteryOf(state, `${u.r}.${u.n}`).pct >= 30 || (state.levels[`${u.r}.${u.n}`]?.lessons || 0) > 0;
export const unlockedWeapons = (state) => WEAPONS.filter((w) => reached(state, w.unlock));
export const unlockedMentors = (state) => MENTORS.filter((m) => reached(state, m.unlock));
export const unlockedOutfits = (state) => CAPIA_OUTFITS.filter((o) => !o.unlock || reached(state, o.unlock));
export const secretUnlocked = (state, s) => masteryOf(state, `${s.need.r}.${s.need.n}`).pct >= s.need.mastery;

export function syncUnlocks(state) {
  const fresh = [];
  unlockedMentors(state).forEach((m) => { if (!state.mentors[m.id]) { state.mentors[m.id] = Date.now(); fresh.push({ type: 'mentor', id: m.id }); } });
  SECRETS.forEach((s) => { if (secretUnlocked(state, s) && !state.secrets[s.id]) { state.secrets[s.id] = { unlocked: Date.now(), done: false }; fresh.push({ type: 'secret', id: s.id }); } });
  return fresh;
}

/* ───────────── Tienda cosmética (solo cosmética, nada académico) ───────────── */
export function cosmeticCatalog() {
  const items = [];
  const add = (slot, list) => list.forEach((it) => items.push({ slot, ...it }));
  add('hair', COSMETICS.hair); add('top', COSMETICS.top); add('accessory', COSMETICS.accessory); add('shoes', COSMETICS.shoes);
  add('backpack', COSMETICS.backpack); add('effect', COSMETICS.effect); add('pet', COSMETICS.pet);
  return items;
}
export function buyCosmetic(state, id) {
  const it = cosmeticCatalog().find((c) => c.id === id);
  if (!it) return { ok: false, msg: 'Objeto desconocido' };
  if (state.owned.includes(id)) return { ok: false, msg: 'Ya lo tienes' };
  if (it.unlock && !state.owned.includes('unlock:' + id)) return { ok: false, msg: `Se desbloquea al lograr: ${it.unlock}` };
  if (state.pi < it.price) return { ok: false, msg: `Te faltan ${it.price - state.pi} PI` };
  state.pi -= it.price; state.owned.push(id);
  return { ok: true };
}

/* ───────────── Desafío diario (determinista por fecha) ───────────── */
export function dailyChallenge(key = dayKey()) {
  const h = hash(key);
  const kinds = ['puzzle', 'math', 'puzzle', 'physics', 'history', 'engineering', 'puzzle'];
  const wd = new Date(key + 'T12:00:00').getDay();
  const kind = kinds[wd];
  if (kind === 'puzzle') return { key, kind: 'acertijo', puzzle: PUZZLES[h % PUZZLES.length] };
  if (kind === 'math') { const lv = ALL_LEVELS.filter((l) => l.region === 'algebra' || l.region === 'aritmetica' || l.region === 'geometria'); const level = lv[h % lv.length]; return { key, kind: 'problema matemático', spec: level.gens.find((g) => !g.startsWith('project:')) || 'linear_eq', seed: (h % 99991) + 1, d: 2, levelId: level.id }; }
  if (kind === 'physics') { const lv = ALL_LEVELS.filter((l) => l.region === 'fisica' || l.region === 'fisica2').filter((l) => !l.gens[0].startsWith('project')); const level = lv[h % lv.length]; return { key, kind: 'problema físico', spec: level.gens.find((g) => !g.startsWith('project:')), seed: (h % 99991) + 1, d: 2, levelId: level.id }; }
  if (kind === 'history') return { key, kind: 'desafío histórico', puzzle: PUZZLES.find((p) => p.kind === 'histórico') || PUZZLES[9], hist: true };
  return { key, kind: 'desafío de ingeniería', puzzle: PUZZLES.find((p) => p.kind === 'ingeniería') || PUZZLES[8] };
}

export function completeDaily(state, key = dayKey()) {
  if (state.daily[key]?.done) return null;
  state.daily[key] = { done: true, t: Date.now() };
  state.stats.daily += 1;
  addXP(state, 40); addPI(state, 20);
  const sr = touchStreak(state);
  return { xp: 40, pi: 20, events: sr.events || [] };
}

/* ───────────── Diagnóstico adaptativo ───────────── */
export const DIAG_AREAS = [
  { id: 'arit', name: 'Aritmética', items: ['basic_ops@1', 'frac_ops@2', 'percent@2'], fallback: ['int_ops@1', 'frac_simplify@1'], region: 'aritmetica', levels: [3, 8, 11] },
  { id: 'prop', name: 'Proporcionalidad', items: ['ratio_prop@2'], fallback: ['basic_ops@2'], region: 'aritmetica', levels: [11] },
  { id: 'alg', name: 'Álgebra', items: ['linear_eq@1', 'like_terms@1', 'linear_eq@2'], fallback: ['var_eval@1', 'const_vs_var'], region: 'algebra', levels: [3, 5, 10] },
  { id: 'func', name: 'Funciones', items: ['func_eval@2', 'line_graph@1'], fallback: ['var_eval@2'], region: 'algebra', levels: [13, 14] },
  { id: 'geo', name: 'Geometría', items: ['triangle_angle@1', 'pythag@1'], fallback: ['angles@1'], region: 'geometria', levels: [4, 5] },
  { id: 'graph', name: 'Lectura de gráficos', items: ['chart_read@1'], fallback: [], region: 'estadistica', levels: [2] },
  { id: 'logic', name: 'Razonamiento', items: ['p1', 'p4'], fallback: [], region: null, levels: [], puzzle: true },
  { id: 'phys', name: 'Fundamentos de física', items: ['unit_conv@1', 'kinematics#1@1'], fallback: ['basic_ops@1'], region: 'fisica', levels: [1, 3] },
];

/** Resultado del diagnóstico → mapa personalizado: marca niveles como “ubicados” (a verificar con repasos). */
export function applyDiagnostic(state, results) {
  const placements = {};
  for (const area of DIAG_AREAS) {
    const r = results[area.id];
    if (!r || !area.region) continue;
    const ratio = r.total ? r.correct / r.total : 0;
    placements[area.id] = { ratio, usedFallback: r.fallback || 0 };
    if (ratio >= 0.66 && !r.fallback) {
      const reg = REGION_BY_ID[area.region];
      const maxN = Math.max(...area.levels);
      reg.levels.filter((l) => l.n <= maxN).forEach((l) => { const ls = ensureLevel(state, l.id); ls.placed = Math.max(ls.placed, 45); });
    }
  }
  state.diagnostic = { done: true, t: Date.now(), results, placements };
  return placements;
}

/* ───────────── Plan de estudio para parciales ───────────── */
export function planExam({ subject, topics, date, today = dayKey() }) {
  const days = Math.max(1, dayDiff(today, date));
  const study = days > 3 ? days - 2 : Math.max(1, days - 1);
  const plan = [];
  const per = Math.max(1, Math.ceil(topics.length / Math.max(1, study)));
  let ti = 0;
  for (let i = 0; i < days; i++) {
    const d = addDays(today, i);
    const left = days - i;
    const items = [];
    if (left === 1) { items.push({ type: 'rest', text: 'Día de descanso activo: repaso ligero de fórmulas y buen sueño.', min: 20 }); }
    else if (left === 2 && days > 2) { items.push({ type: 'simulacro', text: `Simulacro completo de ${subject}`, min: 60 }, { type: 'review', text: 'Revisa tus errores del simulacro', min: 30 }); }
    else if (i > 0 && i % 6 === 5 && left > 3) { items.push({ type: 'rest', text: 'Día de descanso: el cerebro consolida lo estudiado.', min: 0 }); }
    else if (ti < topics.length) {
      const chunk = topics.slice(ti, ti + per); ti += per;
      items.push({ type: 'study', text: `Estudio: ${chunk.map((t) => t.name).join(' + ')}`, topics: chunk, min: 45 }, { type: 'quiz', text: `Quiz de práctica (${chunk.map((t) => t.name).join(', ')})`, topics: chunk, min: 20 });
      if (i > 1) items.push({ type: 'review', text: 'Repaso espaciado de temas anteriores', topics: topics.slice(0, Math.max(0, ti - per)).slice(-2), min: 15 });
    } else {
      items.push({ type: 'review', text: `Repaso general de ${subject}`, topics: topics.slice(0, 3), min: 40 }, { type: 'quiz', text: 'Quiz adaptativo con tus puntos débiles', min: 20 });
    }
    plan.push({ date: d, in: left, items });
  }
  return { subject, date, days, plan };
}

export { dayDiff, addDays, hash };
