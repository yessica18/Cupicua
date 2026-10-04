// Logros basados en datos: más de 300, generados por plantillas + algunos especiales con nombre propio.
// Premian constancia, comprensión, recuperación y aplicación, no solo rapidez ni cantidad.
import { REGIONS, REGION_BY_ID } from '../content/regions.js';
import { MENTORS } from '../content/mentors.js';
import { SECRETS } from '../content/game.js';
import { masteryOf, levelsMasteredCount, regionProgress } from './game.js';

const A = (id, icon, name, desc, metric, goal, extra = {}) => ({ id, icon, name, desc, metric, goal, xp: extra.xp ?? 30, pi: extra.pi ?? 5, secret: !!extra.secret, group: extra.group || 'general' });

export const ACHIEVEMENTS = [];
const add = (...a) => ACHIEVEMENTS.push(A(...a));

/* Especiales (nombres del diseño original) */
add('no-me-rendi', '🧠', 'NO ME RENDÍ', 'Resolver correctamente después de 3 errores seguidos.', 'persevered', 1, { xp: 60, pi: 15, group: 'carácter' });
add('no-me-rendi-10', '🧠', 'NO ME RENDÍ ×10', 'Lograr esa recuperación 10 veces.', 'persevered', 10, { xp: 150, pi: 40, group: 'carácter' });
add('detective', '🔍', 'DETECTIVE MATEMÁTICO', 'Encontrar y corregir tu propio error sin pistas.', 'selfFixed', 1, { xp: 60, pi: 15, group: 'carácter' });
add('detective-25', '🔍', 'DETECTIVE EXPERTO', 'Corregir 25 errores propios.', 'selfFixed', 25, { xp: 200, pi: 50, group: 'carácter' });
add('constante', '📚', 'APRENDIZ CONSTANTE', 'Mantener una racha de 7 días (descansos incluidos).', 'streakBest', 7, { xp: 80, pi: 20, group: 'constancia' });
add('matematico-papel', '✍️', 'MATEMÁTICO DE PAPEL', 'Completar 10 ejercicios escritos en el cuaderno (Modo Papel).', 'paper', 10, { xp: 80, pi: 20, group: 'hábitos' });
add('desafio-aceptado', '⚡', 'DESAFÍO ACEPTADO', 'Resolver un problema avanzado.', 'hard', 1, { xp: 60, pi: 15, group: 'desafíos' });
add('ingeniero-entrenamiento', '🔬', 'INGENIERO EN ENTRENAMIENTO', 'Completar un proyecto que combine matemáticas y física.', 'projects', 1, { xp: 100, pi: 30, group: 'aplicación' });
add('mas-alla-infinito', '🌌', 'MÁS ALLÁ DEL INFINITO', 'Derrotar al Guardián del Infinito (Cálculo avanzado).', 'boss:calculo', 1, { xp: 300, pi: 100, group: 'jefes' });
add('primera-pregunta', '🌱', 'PRIMER PASO', 'Responder tu primera pregunta.', 'solved', 1, { group: 'inicio' });
add('rey-despues', '😴', 'EL REY DEL DESPUÉS DERROTADO', 'Empezar una misión el mismo día en que decidiste hacerlo.', 'lessons', 1, { xp: 40, group: 'inicio' });
add('explicador', '🎤', 'EXPLÍCASELO A CAPIA', 'Explicar con tus palabras un concepto.', 'explains', 1, { xp: 60, pi: 15, group: 'comprensión' });
add('explicador-10', '🎤', 'MAESTRO EXPLICADOR', 'Explicar 10 conceptos.', 'explains', 10, { xp: 200, pi: 50, group: 'comprensión' });
add('sin-pistas-50', '🧩', 'SOLO Y SIN PISTAS', 'Resolver 50 ejercicios sin pistas.', 'noHint', 50, { xp: 120, pi: 30, group: 'comprensión' });
add('secreto-1', '🔐', 'CURIOSIDAD PREMIADA', 'Desbloquear tu primera zona secreta.', 'secrets', 1, { xp: 100, pi: 30, group: 'exploración', secret: true });
add('descubre-pi', 'π', 'EL CÍRCULO COMPLETO', 'Encuentra los 8 fragmentos de π.', 'piFound', 8, { xp: 250, pi: 80, group: 'exploración', secret: true });
add('mision-cero', '0', 'EL CERO DESCUBIERTO', 'Completa la misión histórica “El misterio del cero”.', 'zeroMission', 1, { xp: 150, pi: 60, group: 'historia' });
add('diagnostico', '🧭', 'DESCUBRIENDO DESDE DÓNDE COMENZAR', 'Completar el diagnóstico.', 'diagnostic', 1, { group: 'inicio' });

const tiers = (id, icon, name, descFn, metric, goals, group, scale = 1) => goals.forEach((g, i) => add(`${id}-${g}`, icon, `${name} ${['I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII', 'IX', 'X', 'XI', 'XII'][i]}`, descFn(g), metric, g, { xp: Math.round(20 * (i + 1) * scale), pi: 5 * (i + 1), group }));

tiers('solved', '🎯', 'Solucionador', (g) => `Resolver ${g} ejercicios correctamente.`, 'correct', [10, 25, 50, 100, 250, 500, 1000, 2500, 5000], 'práctica');
tiers('lessons', '📘', 'Aprendiz', (g) => `Completar ${g} lecciones.`, 'lessons', [1, 5, 10, 25, 50, 100, 200, 400], 'lecciones');
tiers('streak', '🔥', 'Constancia', (g) => `Racha de estudio de ${g} días.`, 'streakBest', [3, 7, 14, 30, 60, 100, 200, 365], 'constancia');
tiers('xp', '⭐', 'Estrella', (g) => `Reunir ${g} XP.`, 'xp', [100, 500, 1000, 2500, 5000, 10000, 25000, 50000], 'progreso');
tiers('pi', '💰', 'Coleccionista de PI', (g) => `Reunir ${g} PI en total.`, 'piEarned', [50, 150, 400, 1000, 2500], 'progreso');
tiers('errors', '💙', 'El error es información', (g) => `Superar ${g} errores (acertar después de fallar).`, 'errorsOvercome', [5, 15, 30, 60, 120, 250, 500], 'carácter');
tiers('perfect', '💎', 'Lección perfecta', (g) => `Completar ${g} lecciones sin errores.`, 'perfect', [1, 5, 10, 25, 50], 'lecciones');
tiers('paper', '📝', 'Cuaderno', (g) => `Escribir ${g} procedimientos en papel.`, 'paper', [5, 25, 50, 100, 250], 'hábitos');
tiers('reviews', '🔁', 'Memoria larga', (g) => `Superar ${g} repasos espaciados.`, 'reviewsOk', [1, 5, 15, 30, 60, 120], 'retención');
tiers('hours', '⏱️', 'Horas de estudio', (g) => `Estudiar ${g} horas en total.`, 'hours', [1, 5, 10, 25, 50, 100], 'constancia');
tiers('daily', '⚡', 'Desafío del día', (g) => `Completar ${g} desafíos diarios.`, 'daily', [1, 5, 10, 25, 50, 100], 'desafíos');
tiers('mastered', '🟣', 'Dominio', (g) => `Dominar ${g} habilidades (≥ 81%).`, 'mastered', [1, 5, 10, 25, 50, 100, 150], 'dominio');
tiers('boss', '⚔️', 'Cazador de jefes', (g) => `Derrotar ${g} jefes de región.`, 'bosses', [1, 3, 6, 9, 12], 'jefes');
tiers('mentors', '🧙', 'Círculo de mentores', (g) => `Conocer a ${g} mentores.`, 'mentors', [1, 5, 10, 20, 30, MENTORS.length], 'historia');
tiers('codex', '📚', 'Códice', (g) => `Descubrir ${g} entradas del códice.`, 'codex', [5, 25, 50, 100, 200], 'exploración');
tiers('curio', '🔭', 'Curiosidad', (g) => `Encontrar ${g} curiosidades en el mapa.`, 'curiosities', [1, 5, 10, 20, SECRETS.length * 3], 'exploración');
tiers('explain', '🎤', 'Explicador', (g) => `Explicar ${g} conceptos a CAPIA.`, 'explains', [3, 25, 50], 'comprensión');
tiers('hints', '🪄', 'Pistas con sabiduría', (g) => `Resolver ${g} ejercicios sin pistas.`, 'noHint', [10, 100, 250, 500, 1000], 'comprensión');
tiers('first', '☝️', 'A la primera', (g) => `Acertar ${g} ejercicios al primer intento y sin pistas.`, 'firstTry', [10, 50, 150, 400, 1000], 'comprensión');
tiers('labs', '🧪', 'Laboratorista', (g) => `Experimentar en ${g} laboratorios distintos.`, 'labs', [1, 3, 5, 7], 'laboratorios');
tiers('projects', '🏗️', 'Ingeniería', (g) => `Completar ${g} proyectos.`, 'projects', [1, 2, 4, 6], 'aplicación');
tiers('searches', '🌐', 'Investigador', (g) => `Hacer ${g} búsquedas en Internet con fuentes.`, 'searches', [1, 10, 30], 'investigación');
tiers('docs', '📄', 'Lector', (g) => `Estudiar ${g} documentos PDF con CAPIA.`, 'pdfs', [1, 5, 15], 'investigación');
tiers('social', '👥', 'Estudiar juntos', (g) => `Estudiar con ${g} amigos.`, 'friends', [1, 3, 10], 'comunidad');
tiers('rooms', '🏫', 'Sala de estudio', (g) => `Participar en ${g} salas de estudio.`, 'rooms', [1, 5, 20], 'comunidad');
tiers('boards', '📝', 'Pizarra', (g) => `Usar la pizarra en ${g} sesiones.`, 'boards', [1, 5, 20], 'comunidad');
tiers('quizzes', '🎓', 'Quizzes', (g) => `Completar ${g} quizzes.`, 'quizzes', [1, 5, 15, 40, 100], 'práctica');
tiers('duels', '⚔️', 'Duelo sano', (g) => `Participar en ${g} duelos matemáticos.`, 'duels', [1, 5, 20], 'comunidad');
tiers('hard', '🌋', 'Retos avanzados', (g) => `Resolver ${g} problemas avanzados.`, 'hard', [5, 25, 100, 250], 'desafíos');
tiers('voice', '🎙️', 'Hablando con CAPIA', (g) => `Conversar ${g} veces por voz con CAPIA.`, 'voice', [1, 10, 50], 'comprensión');
tiers('photos', '📷', 'Del cuaderno a CAPIA', (g) => `Subir ${g} fotos de ejercicios.`, 'photos', [1, 5, 25], 'investigación');

/* Por región: 12 × 12 logros */
for (const r of REGIONS) {
  const n = r.name;
  add(`r-${r.id}-first`, r.icon, `Primer paso en ${n}`, `Completa tu primera lección en ${n}.`, `region:${r.id}:lessons`, 1, { group: r.subject });
  add(`r-${r.id}-5`, r.icon, `${r.subject}: 5 lecciones`, `Completa 5 lecciones en ${n}.`, `region:${r.id}:lessons`, 5, { xp: 50, pi: 10, group: r.subject });
  add(`r-${r.id}-16`, r.icon, `${r.subject}: viaje completo`, `Completa 16 lecciones en ${n}.`, `region:${r.id}:lessons`, 16, { xp: 100, pi: 20, group: r.subject });
  [25, 50, 75, 100].forEach((p) => add(`r-${r.id}-m${p}`, r.icon, `${r.subject} al ${p}%`, `Alcanza ${p}% de progreso en ${n}.`, `region:${r.id}:mastery`, p, { xp: p, pi: Math.round(p / 5), group: r.subject }));
  add(`r-${r.id}-3m`, r.icon, `${r.subject}: tres dominios`, `Domina 3 habilidades de ${n}.`, `region:${r.id}:mastered`, 3, { xp: 70, pi: 15, group: r.subject });
  add(`r-${r.id}-8m`, r.icon, `${r.subject}: ocho dominios`, `Domina 8 habilidades de ${n}.`, `region:${r.id}:mastered`, 8, { xp: 150, pi: 35, group: r.subject });
  add(`r-${r.id}-boss`, '⚔️', `Jefe: ${r.boss.name}`, `Derrota a ${r.boss.name}.`, `boss:${r.id}`, 1, { xp: 200, pi: 50, group: r.subject });
  add(`r-${r.id}-weapon`, '🗡️', `Arma de ${r.subject}`, `Desbloquea el arma asociada a ${n}.`, `region:${r.id}:mastery`, 15, { xp: 40, pi: 10, group: r.subject });
  add(`r-${r.id}-acc`, '🎯', `${r.subject}: precisión`, `Logra 85% de precisión reciente en ${n} con 30 intentos.`, `region:${r.id}:precise`, 1, { xp: 120, pi: 25, group: r.subject });
  add(`r-${r.id}-ret`, '🔁', `${r.subject}: sin olvidar`, `Supera un repaso espaciado en ${n}.`, `region:${r.id}:retained`, 1, { xp: 60, pi: 15, group: r.subject });
}
MENTORS.forEach((m) => add(`mentor-${m.id}`, '🧙', `Conociste a ${m.name.split(' ')[0]}`, `Desbloquea a ${m.name} como mentor.`, `mentor:${m.id}`, 1, { xp: 20, pi: 5, group: 'historia', secret: false }));
SECRETS.forEach((s) => add(`secret-${s.id}`, s.icon, `Secreto: ${s.name}`, `Resuelve el desafío de ${s.name}.`, `secretDone:${s.id}`, 1, { xp: 100, pi: 30, group: 'exploración', secret: true }));

export const ACHIEVEMENT_BY_ID = Object.fromEntries(ACHIEVEMENTS.map((a) => [a.id, a]));

/** Valor actual de una métrica para un estado. */
export function metricValue(state, metric) {
  const s = state.stats;
  switch (metric) {
    case 'correct': return s.correct; case 'solved': return s.solved;
    case 'streakBest': return state.streak.best; case 'xp': return state.xp;
    case 'piEarned': return state.piEarned || 0; case 'hours': return Math.floor(s.minutes / 60);
    case 'errorsOvercome': return s.errorsOvercome || 0; case 'bosses': return s.bosses;
    case 'mastered': return Object.keys(state.levels).filter((id) => masteryOf(state, id).pct >= 81).length;
    case 'mentors': return Object.keys(state.mentors).length; case 'codex': return Object.keys(state.codex).length;
    case 'curiosities': return Object.keys(state.curiosities).length; case 'labs': return Object.keys(state.labs).length;
    case 'secrets': return Object.keys(state.secrets).length; case 'piFound': return Object.keys(state.piFound).length;
    case 'projects': return Object.keys(state.projects).length || s.projects;
    case 'zeroMission': return state.missions.cero ? 1 : 0; case 'diagnostic': return state.diagnostic?.done ? 1 : 0;
    default: break;
  }
  if (metric in s) return s[metric];
  const [kind, a, b] = metric.split(':');
  if (kind === 'region') {
    const reg = REGION_BY_ID[a]; if (!reg) return 0;
    if (b === 'lessons') return reg.levels.reduce((t, l) => t + (state.levels[l.id]?.lessons || 0), 0);
    if (b === 'mastery') return regionProgress(state, a);
    if (b === 'mastered') return levelsMasteredCount(state, a);
    if (b === 'precise') { const att = reg.levels.reduce((t, l) => t + (state.levels[l.id]?.att || 0), 0); const ok = reg.levels.reduce((t, l) => t + (state.levels[l.id]?.cor || 0), 0); return att >= 30 && ok / att >= 0.85 ? 1 : 0; }
    if (b === 'retained') return reg.levels.some((l) => (state.levels[l.id]?.ret?.ok || 0) > 0) ? 1 : 0;
  }
  if (kind === 'boss') return state.bosses[a] ? 1 : 0;
  if (kind === 'mentor') return state.mentors[a] ? 1 : 0;
  if (kind === 'secretDone') return state.secrets[a]?.done ? 1 : 0;
  return 0;
}

/** Revisa y concede logros nuevos; devuelve los recién obtenidos. */
export function checkAchievements(state) {
  const fresh = [];
  for (const a of ACHIEVEMENTS) {
    if (state.achievements[a.id]) continue;
    if (metricValue(state, a.metric) >= a.goal) {
      state.achievements[a.id] = Date.now();
      state.xp += a.xp; state.pi += a.pi; state.piEarned = (state.piEarned || 0) + a.pi;
      fresh.push(a);
    }
  }
  return fresh;
}
