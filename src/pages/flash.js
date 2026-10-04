// Tarjetas de memoria (recuperación activa + repetición espaciada tipo Anki).
import { h, mount, toast } from '../lib/dom.js';
import { rich } from '../lib/rich.js';
import { state, save } from '../lib/store.js';
import { encyclopedia } from '../../shared/content/encyclopedia.js';
import { reviewSrs } from '../../shared/engine/srs.js';
import { makeQuestion } from '../../shared/content/generators.js';
import { answerText } from '../../shared/math/check.js';
import { sfx, startMusic } from '../lib/sound.js';
import { addXP } from '../../shared/engine/game.js';

export function flashPage(root) {
  startMusic('calm'); const S = state(); const cards = S.game.cards;
  // tarjetas automáticas: fórmulas de lecciones/teoremas que el estudiante ya conoce + errores propios
  const auto = encyclopedia().filter((e) => e.formula && (e.type === 'teorema' || S.codex[e.id] || S.levels[e.id]?.att)).slice(0, 60).map((e) => ({ id: 'enc:' + e.id, front: `¿Cuál es la fórmula o idea clave de **${e.title}**?`, back: `$$${e.formula}$$\n${e.def}`, src: 'Códice' }));
  const errs = S.errors.slice(-20).map((e, i) => { try { const q = makeQuestion(e.s, e.k, e.d); return { id: `err:${e.l}:${e.k}`, front: q.prompt, back: `**${answerText(q)}**\n${q.steps.join('\n')}`, src: 'Tu error' }; } catch { return null; } }).filter(Boolean);
  const all = [...Object.entries(cards).filter(([, c]) => c.front).map(([id, c]) => ({ id, ...c })), ...auto, ...errs];
  const now = Date.now(); const due = all.filter((c) => !cards[c.id]?.srs || cards[c.id].srs.due <= now);
  const area = h('div.card.flash'); let i = 0;
  const show = () => { if (i >= due.length) { area.replaceChildren(h('h2', '🎉 ¡Al día!'), h('p', all.length ? 'No quedan tarjetas por repasar hoy. La repetición espaciada las traerá de vuelta cuando toque.' : 'Aún no hay tarjetas. Se crean solas con lo que aprendes, tus errores y los PDF que subas a CAPIA.')); return; }
    const c = due[i]; let flipped = false; const back = h('div.fc-back', { hidden: true, html: rich(c.back) }); const rate = h('div.btn-row', { hidden: true }, [['Otra vez', 1, 'warn'], ['Difícil', 3, 'ghost'], ['Bien', 4, 'good'], ['Fácil', 5, 'primary']].map(([t, q, cl]) => h('button.btn.' + cl, { onclick: () => { cards[c.id] = { ...(cards[c.id] || { front: c.front, back: c.back, src: c.src }), srs: reviewSrs(cards[c.id]?.srs, q) }; addXP(S, 2); save(); sfx.click(); i += 1; show(); } }, t)));
    area.replaceChildren(h('small', `${i + 1}/${due.length} · ${c.src}`), h('div.fc-front', { html: rich(c.front) }), h('button.btn.primary', { onclick: (e) => { flipped = true; back.hidden = false; rate.hidden = false; e.target.remove(); } }, 'Mostrar respuesta'), back, rate); };
  mount(root, h('section.page', h('h1', '🃏 Tarjetas de memoria'), h('p.sub', 'Primero intenta recordar; luego mira la respuesta. Cuanto mejor la recuerdes, más tarde vuelve (repetición espaciada).'), area)); show();
}
