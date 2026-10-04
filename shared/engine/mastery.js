// Maestría por habilidad: NO depende del tiempo conectado ni de la rapidez.
// Combina precisión, variedad, retención (repasos tras tiempo), aplicación, explicación y recuperación tras errores.

export const STAGES = [
  { max: 20, name: 'Descubriendo', icon: '🔵' },
  { max: 40, name: 'Practicando', icon: '🟦' },
  { max: 60, name: 'Comprendiendo', icon: '🟡' },
  { max: 80, name: 'Competente', icon: '🟠' },
  { max: 95, name: 'Dominado', icon: '🟣' },
  { max: 100, name: 'Maestro', icon: '👑' },
];

export const stageOf = (pct) => STAGES.find((s) => pct <= s.max) || STAGES[STAGES.length - 1];

export function newLevelState() {
  return {
    att: 0, cor: 0, recent: [], variety: [], types: {}, gens: {},
    ret: { ok: 0, tot: 0 }, app: 0, explain: 0, recov: 0, errs: 0, pending: {},
    lessons: 0, firstTs: 0, lastTs: 0, placed: 0, bestStreak: 0, streak: 0,
  };
}

/** Promedio ponderado: los intentos más recientes pesan más (se puede mejorar con práctica). */
function recentAcc(recent) {
  if (!recent.length) return 0;
  let num = 0; let den = 0;
  recent.forEach((v, i) => { const w = 1 + i * 0.25; num += v * w; den += w; });
  return num / den;
}

export function levelMastery(ls) {
  if (!ls || (!ls.att && !ls.placed)) return { pct: 0, stage: STAGES[0], parts: {}, capped: null };
  const acc = recentAcc(ls.recent || []);
  const conf = Math.min(1, ls.att / 14);
  const variety = Math.min(1, (ls.variety?.length || 0) / 6);
  const retention = ls.ret?.tot ? Math.min(1, ls.ret.ok / 3) * (ls.ret.ok / ls.ret.tot) : 0;
  const app = Math.min(1, (ls.app || 0) / 2);
  const expl = Math.min(1, (ls.explain || 0) / 2);
  const recov = ls.errs ? Math.min(1, (ls.recov || 0) / Math.min(ls.errs, 3)) : ls.att >= 6 ? 0.6 : 0;
  let raw = 0.38 * acc * conf + 0.14 * variety + 0.2 * retention + 0.1 * app + 0.08 * expl + 0.1 * recov;
  let capped = null;
  if ((ls.ret?.ok || 0) < 1 && raw > 0.8) { raw = 0.8; capped = 'Falta un repaso exitoso tras unos días para pasar de Competente.'; }
  if (((ls.ret?.ok || 0) < 2 || (ls.app || 0) < 1) && raw > 0.95) { raw = 0.95; capped = 'Para llegar a Maestro: dos repasos exitosos y una aplicación.'; }
  if ((ls.explain || 0) < 1 && raw > 0.97) raw = 0.97;
  if (ls.placed) raw = Math.max(raw, (ls.placed / 100) * 0.8);
  const pct = Math.max(0, Math.min(100, Math.round(raw * 100)));
  return { pct, stage: stageOf(pct), parts: { acc, conf, variety, retention, app, expl, recov }, capped };
}

/** Qué le falta a la habilidad para subir (mensaje para el estudiante). */
export function masteryAdvice(ls) {
  const m = levelMastery(ls);
  const p = m.parts;
  if (!ls || !ls.att) return 'Empieza con una lección para descubrir esta habilidad.';
  if (p.conf < 1) return 'Practica más ejercicios para que tu precisión sea confiable.';
  if (p.acc < 0.75) return 'Tus últimos intentos tienen errores: repasa la explicación y vuelve a intentarlo.';
  if (p.variety < 1) return 'Prueba otros tipos y dificultades de ejercicios para demostrar variedad.';
  if (p.retention < 0.6) return 'Haz un repaso espaciado dentro de unos días: la memoria a largo plazo cuenta.';
  if (p.app < 1) return 'Aplica la habilidad en una misión, un laboratorio o un proyecto.';
  if (p.expl < 1) return 'Explícaselo a CAPIA con tus propias palabras.';
  return '¡Casi maestro! Sigue repasando de vez en cuando.';
}

export const STATUS = { MASTERED: 'mastered', PROGRESS: 'progress', DISCOVERED: 'discovered', LOCKED: 'locked' };
