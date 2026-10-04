// Panel de inteligencia del aprendizaje: dominio, debilidades, errores frecuentes, retención y actividad.
import { h, mount } from '../lib/dom.js';
import { state } from '../lib/store.js';
import { REGIONS, LEVEL_BY_ID } from '../../shared/content/regions.js';
import { regionProgress, weaknesses, strengths, frequentMistakes, pendingReviews, accuracy, totalMastery, masteryOf, dayKey, addDays, levelsMasteredCount } from '../../shared/engine/game.js';
import { masteryAdvice } from '../../shared/engine/mastery.js';
import { personPortrait } from './capia-portrait.js';
import { navigate } from '../router.js';
import { speak } from '../lib/voice.js';

export function progressPage(root) {
  const S = state(); const weak = weaknesses(S, 4); const strong = strengths(S, 4); const mistakes = frequentMistakes(S, 4); const rev = pendingReviews(S);
  const retention = S.stats.reviews ? Math.round((S.stats.reviewsOk / S.stats.reviews) * 100) : null;
  const bar = (pct, col) => h('div.pbar', h('i', { style: { width: pct + '%', background: col } }));
  const heat = []; for (let i = 27; i >= 0; i--) { const k = addDays(dayKey(), -i); const d = S.days[k]; const q = d?.q || 0; heat.push(h('i.hm' + (q > 15 ? '.h3' : q > 6 ? '.h2' : q > 0 ? '.h1' : ''), { title: `${k}: ${q} ejercicios` })); }
  const advice = weak[0] ? `Tu mayor dificultad actualmente es **${weak[0].level.name}**. Te recomiendo practicar 10 minutos antes de continuar.` : strong[0] ? `Vas muy bien en **${strong[0].level.name}**. ¿Probamos un desafío más difícil?` : 'Aún tengo pocos datos tuyos. Resuelve unas lecciones y te diré en qué enfocarte.';
  mount(root, h('section.page.progress', h('h1', '📈 Panel de aprendizaje'),
    h('div.card.capia-say', personPortrait('capia', { size: 110, expr: weak[0] ? 'think' : 'proud', outfit: S.profile.capiaOutfit }), h('div.bubble', advice.replace(/\*\*/g, '')), h('button.btn.ghost.sm', { onclick: () => speak(advice, { force: true }) }, '🔊'), weak[0] ? h('button.btn.primary.sm', { onclick: () => navigate('/lesson/' + weak[0].id) }, 'Practicar ahora') : null),
    h('div.grid.stats', [['Dominio total', totalMastery(S) + '%'], ['Precisión', accuracy(S) + '%'], ['Problemas resueltos', S.stats.correct], ['Horas de estudio', Math.round(S.stats.minutes / 6) / 10], ['Retención', retention === null ? '—' : retention + '%'], ['Habilidades dominadas', Object.keys(S.levels).filter((id) => masteryOf(S, id).pct >= 81).length], ['Proyectos', Object.keys(S.projects).length], ['Desafíos', S.stats.challenges + S.stats.daily]].map(([k, v]) => h('div.card.kpi', h('b', v), h('small', k)))),
    h('div.card', h('h3', '🗺️ Progreso por región'), REGIONS.map((r) => { const p = regionProgress(S, r.id); return h('div.prow', h('span', `${r.icon} ${r.subject}`), bar(p, r.color), h('b', p + '%'), h('small', `${levelsMasteredCount(S, r.id)}/16`)); })),
    h('div.grid.two',
      h('div.card', h('h3', '🔴 Temas débiles'), weak.length ? weak.map((w) => h('div.rowl', h('b', w.level.name), h('small', `${Math.round(w.rate * 100)}% de errores recientes`), h('button.btn.ghost.sm', { onclick: () => navigate('/lesson/' + w.id) }, 'Reforzar'))) : h('p.soft', 'Nada preocupante por ahora.')),
      h('div.card', h('h3', '🟢 Temas fuertes'), strong.length ? strong.map((w) => h('div.rowl', h('b', w.level.name), h('small', `${w.pct}%`))) : h('p.soft', 'Aún no hay temas por encima del 60%.')),
      h('div.card', h('h3', '🔎 Errores frecuentes'), mistakes.length ? mistakes.map((m) => h('div.rowl', h('small', m.msg), h('b', `×${m.n}`))) : h('p.soft', 'Todavía no hay patrones de error.')),
      h('div.card', h('h3', '🧠 Conceptos por repasar'), rev.length ? rev.slice(0, 5).map((r) => h('div.rowl', h('b', r.level.name), h('small', r.days ? `hace ${r.days} día(s)` : 'hoy'))) : h('p.soft', 'Todo al día.'), rev.length ? h('button.btn.good.sm', { onclick: () => navigate('/quiz?mode=repaso') }, 'Repasar') : null)),
    h('div.card', h('h3', '📆 Actividad (últimos 28 días)'), h('div.heat', heat), h('small', `Racha actual: ${S.streak.count} · mejor: ${S.streak.best}. Los días de descanso no rompen tu racha.`)),
    h('div.card', h('h3', '🎯 ¿Qué le falta a cada habilidad?'), Object.keys(S.levels).filter((id) => LEVEL_BY_ID[id] && S.levels[id].att).sort((a, b) => masteryOf(S, b).pct - masteryOf(S, a).pct).slice(0, 8).map((id) => { const m = masteryOf(S, id); return h('div.rowl', h('b', LEVEL_BY_ID[id].name), h('small', `${m.stage.icon} ${m.stage.name} · ${m.pct}%`), h('small.soft', masteryAdvice(S.levels[id]))); }), h('small', 'El dominio no depende del tiempo conectado ni de la rapidez: depende de precisión, variedad, retención, aplicación, explicación y recuperación tras errores.'))));
}
