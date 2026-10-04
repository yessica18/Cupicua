// Repetición espaciada (variante de SM-2) por habilidad.
const DAY = 86400000;

export function newSrs() { return { ease: 2.5, interval: 0, due: 0, reps: 0, last: 0, lapses: 0 }; }

/** q: calidad 0–5 (5 = respuesta perfecta sin pistas). Devuelve la nueva programación. */
export function reviewSrs(prev, q, now = Date.now()) {
  const s = { ...(prev || newSrs()) };
  if (q < 3) { s.reps = 0; s.interval = 1; s.lapses += 1; s.ease = Math.max(1.3, s.ease - 0.2); }
  else {
    s.reps += 1;
    s.interval = s.reps === 1 ? 1 : s.reps === 2 ? 3 : Math.round(s.interval * s.ease);
    s.ease = Math.max(1.3, s.ease + (0.1 - (5 - q) * (0.08 + (5 - q) * 0.02)));
  }
  s.last = now; s.due = now + s.interval * DAY;
  return s;
}

/** Probabilidad estimada de recordar (curva del olvido) */
export function retrievability(s, now = Date.now()) {
  if (!s || !s.last) return 0;
  const days = (now - s.last) / DAY;
  const stability = Math.max(0.5, (s.interval || 1) * (s.ease || 2.5));
  return Math.exp(-days / stability);
}

/** Habilidades que empiezan a olvidarse, de más a menos urgentes. */
export function dueReviews(srs, now = Date.now()) {
  return Object.entries(srs || {})
    .filter(([, s]) => s.last && s.due <= now + DAY / 4)
    .map(([id, s]) => ({ id, s, urgency: (now - s.due) / DAY + (1 - retrievability(s, now)) }))
    .sort((a, b) => b.urgency - a.urgency);
}

export const daysSince = (ts, now = Date.now()) => Math.floor((now - ts) / DAY);
export const DAY_MS = DAY;
