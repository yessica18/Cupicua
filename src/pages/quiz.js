// Quizzes y simulacros: rápido, normal, desafío, adaptativo, intercalado, repaso espaciado, simulacro y examen universitario.
import { h, mount, toast } from '../lib/dom.js';
import { rich } from '../lib/rich.js';
import { state, save } from '../lib/store.js';
import { REGIONS, ALL_LEVELS, LEVEL_BY_ID, REGION_BY_ID } from '../../shared/content/regions.js';
import { makeQuestion } from '../../shared/content/generators.js';
import { questionView } from '../components/question.js';
import { recordAttempt, recordRetention, pendingReviews, weaknesses, masteryOf, addXP, addPI, adaptiveDifficulty, nextSeed, completeLesson } from '../../shared/engine/game.js';
import { checkAchievements } from '../../shared/engine/achievements.js';
import { answerText } from '../../shared/math/check.js';
import { sfx, startMusic } from '../lib/sound.js';
import { navigate, queryParams } from '../router.js';
import { hud } from '../lib/game-ui.js';

const MODES = {
  rapido: ['⚡ Quiz rápido', '5 preguntas fáciles para calentar', { n: 5, d: 1 }], normal: ['📚 Quiz normal', '10 preguntas de tu nivel', { n: 10, d: 0 }], desafio: ['🔥 Desafío', '8 preguntas difíciles', { n: 8, d: 3 }],
  adaptativo: ['🧠 Adaptativo', 'La dificultad se ajusta a tus respuestas', { n: 10, d: 0, adapt: true }], intercalado: ['🔀 Ruta intercalada', 'Alterna temas distintos: mejora la retención', { n: 12, d: 0, mix: true }],
  repaso: ['🔁 Repaso espaciado', 'Lo que empieza a olvidarse', { n: 8, d: 0, review: true }], simulacro: ['🎓 Simulacro', '20 preguntas mezcladas, como un parcial', { n: 20, d: 0, mix: true, timed: 45 }], universitario: ['🏫 Examen universitario', '12 problemas tipo ingeniero (nivel avanzado)', { n: 12, d: 3, mix: true, timed: 60 }],
};
export function quizPage(root) {
  startMusic('tech'); const S = state(); const qp = queryParams().get('mode'); let mode = MODES[qp] ? qp : 'normal'; let topics = new Set(); let timer = null;
  const cfg = h('div.card.stack'); const draw = () => {
    const due = pendingReviews(S);
    cfg.replaceChildren(h('h3', 'Elige tu quiz'), h('div.mode-grid', Object.entries(MODES).map(([k, [t, d]]) => h('button.mode' + (k === mode ? '.on' : ''), { onclick: () => { mode = k; draw(); } }, h('b', t), h('small', d)))),
      MODES[mode][2].review ? h('p.soft', due.length ? `Tienes ${due.length} habilidad(es) por repasar.` : 'No hay repasos pendientes; haremos un repaso general de lo que ya practicaste.') : h('div.stack', h('b', 'Temas (si no eliges, uso tu mezcla):'), h('div.topic-regions', REGIONS.map((r) => h('details', h('summary', `${r.icon} ${r.subject}`), r.levels.filter((l) => !l.boss && !l.gens[0].startsWith('project')).map((l) => h('label.check', h('input', { type: 'checkbox', checked: topics.has(l.id), onchange: (e) => (e.target.checked ? topics.add(l.id) : topics.delete(l.id)) }), ` ${l.n}. ${l.name}`)))))),
      h('button.btn.primary.big', { onclick: () => run() }, '▶ Comenzar'));
  };
  mount(root, h('section.page.quiz', hud(), h('h1', '🎓 Quizzes y simulacros'), cfg)); draw();

  function pool() {
    const m = MODES[mode][2];
    if (m.review) { const due = pendingReviews(S).map((r) => r.level); return (due.length ? due : ALL_LEVELS.filter((l) => S.levels[l.id]?.att)).filter((l) => !l.gens[0].startsWith('project')); }
    let lv = topics.size ? [...topics].map((id) => LEVEL_BY_ID[id]) : ALL_LEVELS.filter((l) => S.levels[l.id]?.att && !l.gens[0].startsWith('project'));
    if (!lv.length) lv = REGIONS.filter((r) => r.id === (S.game.subject || 'aritmetica'))[0].levels.slice(0, 8);
    return lv;
  }
  function run() {
    const m = MODES[mode][2]; let lv = pool(); if (!lv.length) lv = REGION_BY_ID.aritmetica.levels.slice(0, 5);
    let order = [];
    if (m.mix) { const byRegion = {}; lv.forEach((l) => (byRegion[l.region] ||= []).push(l)); const groups = Object.values(byRegion).sort(() => Math.random() - 0.5); for (let i = 0; order.length < m.n; i++) { const g = groups[i % groups.length]; order.push(g[Math.floor(Math.random() * g.length)]); } }
    else { for (let i = 0; i < m.n; i++) order.push(lv[Math.floor(Math.random() * lv.length)]); }
    let i = 0; const res = []; const area = h('div.card'); const bar = h('div.bar', h('i')); const clock = h('b.clock', '');
    mount(root, h('section.page.quiz', hud(), h('div.qhead', h('h2', MODES[mode][0]), clock), bar, area));
    if (m.timed) { let left = m.timed * 60; clock.textContent = `⏱ ${m.timed}:00`; timer = setInterval(() => { left -= 1; clock.textContent = `⏱ ${Math.floor(left / 60)}:${String(left % 60).padStart(2, '0')}`; if (left <= 0) { clearInterval(timer); finish(); } if (!document.body.contains(clock)) clearInterval(timer); }, 1000); }
    const next = () => {
      bar.firstChild.style.width = (i / order.length) * 100 + '%'; if (i >= order.length) return finish();
      const level = order[i]; const spec = level.gens.filter((g) => !g.startsWith('project:'))[Math.floor(Math.random() * level.gens.filter((g) => !g.startsWith('project:')).length)] || 'basic_ops';
      const d = m.adapt ? adaptiveDifficulty(S, level.id) : m.d || level.baseDiff; const q = makeQuestion(spec, nextSeed(S, level.id), d); let hints = 0;
      const view = questionView(q, { onSubmit: (v, r) => { view.lock(true); recordAttempt(S, { levelId: level.id, spec: q.gen, seed: q.seed, difficulty: q.difficulty, correct: r.ok, hints, mode: 'quiz', qType: q.type, input: typeof v === 'object' ? JSON.stringify(v) : String(v), msg: r.diag?.msg || '' }); if (m.review) recordRetention(S, level.id, r.ok); res.push({ level, q, ok: r.ok, diag: r.diag }); sfx[r.ok ? 'correct' : 'wrong'](); view.feedback(h('div.fb.' + (r.ok ? 'ok' : 'bad'), r.ok ? '✔ ¡Correcto!' : h('span', 'Respuesta: ', h('b', answerText(q)), r.diag?.msg ? h('p', { html: rich(r.diag.msg) }) : null), h('div.btn-row', h('button.btn.primary.sm', { onclick: () => { i += 1; next(); } }, i + 1 >= order.length ? 'Ver resultados' : 'Siguiente ➜')))); save(); } });
      area.replaceChildren(h('div.qmeta', h('span.pill', `${i + 1}/${order.length}`), h('span.pill', `${REGION_BY_ID[level.region].icon} ${level.name}`)), view.el, h('div.hint-row', [1, 2, 3].map((n) => h('button.btn.ghost.sm', { onclick: (e) => { hints = n; e.target.replaceWith(h('div.hint', h('b', `Pista ${n}: `), h('span', { html: rich(q.hints[n - 1]) }))); } }, `💡 Pista ${n}`)))); view.focus(); };
    function finish() {
      clearInterval(timer); const ok = res.filter((r) => r.ok).length; const pct = Math.round((ok / Math.max(1, res.length)) * 100);
      S.stats.quizzes += 1; addXP(S, 30 + ok * 8); addPI(S, ok >= res.length * 0.7 ? 15 : 5); S.stats.minutes += Math.max(1, Math.round(res.length * 0.7)); const fresh = checkAchievements(S); save(); sfx[pct >= 70 ? 'victory' : 'coin']();
      const wrong = res.filter((r) => !r.ok); const byRegion = {}; res.forEach((r) => { const k = REGION_BY_ID[r.level.region].subject; (byRegion[k] ||= { ok: 0, n: 0 }).n += 1; if (r.ok) byRegion[k].ok += 1; });
      mount(root, h('section.page.quiz', hud(), h('div.card.stack', h('h1', pct >= 70 ? '🎉 ¡Muy bien!' : '💙 Buen intento'), h('p.big', `${ok} de ${res.length} correctas (${pct}%)`), h('div.bar.big', h('i', { style: { width: pct + '%' } })), h('p', `+${30 + ok * 8} XP`), fresh.map((a) => h('p.hl', `${a.icon} ${a.name}`)),
        h('h3', 'Por tema'), h('ul', Object.entries(byRegion).map(([k, v]) => h('li', `${k}: ${v.ok}/${v.n}`))),
        wrong.length ? h('div', h('h3', 'Para repasar (tu error es información)'), wrong.map((w) => h('details.card', h('summary', `${w.level.name}`), h('div', { html: rich(w.q.prompt) }), h('ol.steps', w.q.steps.map((s) => h('li', { html: rich(s) }))), h('b', 'Respuesta: ' + answerText(w.q))))) : h('p.ok', '¡Sin errores! Impecable.'),
        h('div.btn-row', h('button.btn.primary', { onclick: () => quizPage(root) }, 'Otro quiz'), h('button.btn.ghost', { onclick: () => navigate('/progress') }, '📈 Ver mi progreso')))));
    }
    next();
  }
}
