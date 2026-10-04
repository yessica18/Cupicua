// Diagnóstico adaptativo: si fallas una base, retrocede a prerrequisitos más simples. Sin juzgar.
import { h, mount, wait } from '../lib/dom.js';
import { rich } from '../lib/rich.js';
import { state, save } from '../lib/store.js';
import { DIAG_AREAS, applyDiagnostic } from '../../shared/engine/game.js';
import { makeQuestion } from '../../shared/content/generators.js';
import { PUZZLES, CAPIA_SAYS } from '../../shared/content/game.js';
import { checkAnswer } from '../../shared/math/check.js';
import { questionView } from '../components/question.js';
import { personPortrait } from './capia-portrait.js';
import { navigate } from '../router.js';
import { sfx } from '../lib/sound.js';
import { REGION_BY_ID } from '../../shared/content/regions.js';

export function diagnosticPage(root) {
  const S = state();
  const queue = DIAG_AREAS.flatMap((a) => a.items.map((spec) => ({ area: a.id, spec, fb: a.fallback })));
  const results = Object.fromEntries(DIAG_AREAS.map((a) => [a.id, { correct: 0, total: 0, fallback: 0 }]));
  let idx = 0; let seed = Math.floor(Math.random() * 9000) + 11; const total = queue.length;
  const face = personPortrait('capia', { size: 100, expr: 'happy', outfit: S.profile.capiaOutfit });
  const box = h('div.card.diag-card'); const prog = h('div.bar', h('i'));
  mount(root, h('section.page.diag', h('div.capia-say', face, h('div.bubble', CAPIA_SAYS.diag + ' Responde con calma: si no sabes algo, está bien. Solo estamos buscando por dónde empezar.')), prog, box, h('button.link', { onclick: () => finish() }, 'Terminar ahora')));
  const setProg = () => { prog.firstChild.style.width = Math.round((idx / total) * 100) + '%'; };
  function ask() {
    setProg(); if (idx >= queue.length) return finish();
    const it = queue[idx]; seed += 7;
    let q; const puz = it.spec.match(/^p\d+$/) && PUZZLES.find((p) => p.id === it.spec);
    q = puz ? { prompt: puz.prompt, type: 'numeric', answer: puz.answer, tol: puz.tol || 0, steps: [puz.explain], hints: puz.hints, gen: 'puzzle' } : makeQuestion(it.spec, seed, 1);
    const view = questionView(q, { onSubmit: async (v, res) => {
      view.lock(true); results[it.area].total += 1; if (res.ok) results[it.area].correct += 1; sfx[res.ok ? 'correct' : 'click']();
      face.__ctl?.setExpr(res.ok ? 'happy' : 'think');
      if (!res.ok && it.fb.length && !it.fell) { it.fell = true; results[it.area].fallback += 1; queue.splice(idx + 1, 0, ...it.fb.map((spec) => ({ area: it.area, spec, fb: [], fell: true }))); view.feedback(h('div.fb.info', 'Gracias. Vamos a mirar una base un poco más simple, sin prisa.')); }
      else view.feedback(h('div.fb.info', 'Anotado. ¡Seguimos!'));
      await wait(900); idx += 1; ask();
    } });
    box.replaceChildren(h('div.qmeta', h('span.pill', `Pregunta ${Math.min(idx + 1, total)}`), h('span.pill', DIAG_AREAS.find((a) => a.id === it.area).name)), view.el, h('button.btn.ghost.sm', { onclick: () => { results[it.area].total += 1; idx += 1; ask(); } }, 'No lo sé todavía'));
    view.focus();
  }
  function finish() {
    const placements = applyDiagnostic(S, results); save(); sfx.levelup();
    const rows = DIAG_AREAS.map((a) => { const r = results[a.id]; const ratio = r.total ? r.correct / r.total : 0; const lvl = ratio >= 0.66 && !r.fallback ? 'Bien consolidado' : ratio >= 0.4 ? 'En camino' : 'Para fortalecer'; return h('li', h('b', a.name), h('span.pill' + (ratio >= 0.66 ? '.good' : ratio >= 0.4 ? '.mid' : '.low'), lvl)); });
    const weak = DIAG_AREAS.filter((a) => results[a.id].total && results[a.id].correct / results[a.id].total < 0.5 && a.region);
    const start = weak[0] ? REGION_BY_ID[weak[0].region].levels[Math.max(0, (weak[0].levels[0] || 1) - 1)] : REGION_BY_ID[S.game.subject || 'aritmetica'].levels[0];
    mount(root, h('section.page.center', h('div.card', h('h1', '🧭 Mapa personalizado listo'), h('p', 'Ahora sé desde dónde comenzar. Los niveles que ya dominas aparecen marcados como “En progreso”, y CAPIA te los repasará con el tiempo para confirmarlo.'), h('ul.diag-res', rows),
      h('div.capia-say', personPortrait('capia', { size: 120, expr: 'proud', outfit: S.profile.capiaOutfit }), h('div.bubble', weak.length ? `Te recomiendo empezar por **${start.name}**: ahí construiremos una base firme.`.replace(/\*\*/g, '') : '¡Muy bien! Empieza por donde más te guste.')),
      h('div.btn-row', h('button.btn.primary.big', { onclick: () => navigate('/lesson/' + start.id) }, '🚀 Primera misión'), h('button.btn.ghost', { onclick: () => navigate('/map') }, '🌌 Ver mi mapa')))));
  }
  ask();
}
