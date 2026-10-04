// Misiones: principal, secundaria, científica, histórica, jefe, razonamiento, ingeniería, cooperativa, diaria y secreta.
import { h, mount, modal, toast } from '../lib/dom.js';
import { rich, richEl } from '../lib/rich.js';
import { state, save } from '../lib/store.js';
import { SIDE_MISSIONS, MISSION_TYPES, ENEMIES } from '../../shared/content/game.js';
import { ZERO_MISSION } from '../../shared/content/history.js';
import { REGION_BY_ID } from '../../shared/content/regions.js';
import { makeQuestion, makeProject } from '../../shared/content/generators.js';
import { CONCEPT_BANK } from '../../shared/content/concept-bank.js';
import { questionView } from '../components/question.js';
import { navigate } from '../router.js';
import { sfx, startMusic } from '../lib/sound.js';
import { speak } from '../lib/voice.js';
import { checkAchievements } from '../../shared/engine/achievements.js';
import { addXP, addPI, masteryOf } from '../../shared/engine/game.js';
import { personPortrait } from './capia-portrait.js';

let filter = 'todas';
export function missionsPage(root) {
  startMusic('adventure'); const S = state(); const list = h('div.grid');
  const draw = () => list.replaceChildren(...SIDE_MISSIONS.filter((m) => filter === 'todas' || m.type === filter).map((m) => { const done = S.missions[m.id]; const r = REGION_BY_ID[m.region];
    return h('button.card.mission' + (done ? '.done' : ''), { onclick: () => start(m) }, h('div.m-top', h('span.ico-big', m.icon), h('span.pill', MISSION_TYPES.find((t) => t[0] === m.type)?.[2] || m.type)), h('b', m.title), h('small', `${r.icon} ${r.name}`), h('p', m.story), done ? h('em.ok', '✅ Completada') : m.steps ? h('small', m.steps) : null); }));
  const chips = h('div.chips.scroll', [['todas', 'Todas']].concat(MISSION_TYPES.map((t) => [t[0], `${t[1]} ${t[2].replace('Misión ', '')}`])).map(([k, t]) => h('button.chip' + (k === filter ? '.on' : ''), { onclick: (e) => { filter = k; [...chips.children].forEach((x) => x.classList.toggle('on', x === e.currentTarget)); draw(); } }, t)));
  mount(root, h('section.page', h('h1', '⚔️ Misiones'), h('p.sub', 'Cada concepto puede convertirse en una aventura. El Caos amenaza el Universo; cada misión restaura algo.'), chips, list)); draw();
}
function done(m, xp = 80, pi = 20) { const S = state(); if (S.missions[m.id]) return; S.missions[m.id] = Date.now(); addXP(S, xp); addPI(S, pi); S.game.shells += 1; if (m.project) S.projects[m.project] = Date.now(); if (m.id === 'cero') S.codex.cero = Date.now(); const fresh = checkAchievements(S); save(); sfx.levelup(); toast(`Misión completada: +${xp} XP · +${pi} π · +1 🐚`, { icon: '🎉' }); fresh.forEach((a) => toast(`${a.icon} ${a.name}`, { icon: '🏅' })); }

function start(m) {
  if (m.special === 'cero') return zero(m); if (m.special === 'infinito') return infinito(m); if (m.special === 'coop') return navigate('/community');
  if (m.enemy) { const lv = REGION_BY_ID[m.region].levels[0]; return navigate('/lesson/' + lv.id); }
  if (m.project) return project(m);
  if (m.gen) return single(m);
}
function single(m) {
  const q = makeQuestion(m.gen, Math.floor(Math.random() * 9999) + 1, 2); let tries = 0;
  const view = questionView(q, { onSubmit: (v, res) => { tries += 1; view.lock(true); if (res.ok) { sfx.correct(); view.feedback(h('div.fb.ok', '✔ ¡Misión cumplida!')); done(m); } else { sfx.wrong(); view.feedback(h('div.fb.bad', h('b', 'Aún no. '), h('ol.steps', q.steps.map((s) => h('li', { html: rich(s) }))), h('button.btn.ghost.sm', { onclick: () => { view.lock(false); view.clearInput(); view.feedback(''); } }, '↻ Reintentar'))); } } });
  modal(h('div.stack', h('p', m.story), view.el), { title: `${m.icon} ${m.title}`, wide: true });
}
function project(m) {
  const p = makeProject(m.project, Math.floor(Math.random() * 9999) + 1); let i = 0; const box = h('div.stack');
  const next = () => { if (i >= p.parts.length) { box.replaceChildren(h('h3', '🎉 ¡Proyecto terminado!'), h('p', 'Combinaste varias ramas para resolver un problema real: eso es ingeniería.'), h('button.btn.primary', { onclick: () => { done(m, 120, 30); document.querySelector('.modal-back')?.remove(); missionsPage(document.getElementById('view')); } }, 'Reclamar recompensa')); return; }
    const q = p.parts[i]; const view = questionView(q, { onSubmit: (v, res) => { view.lock(true); sfx[res.ok ? 'correct' : 'wrong'](); view.feedback(h('div.fb.' + (res.ok ? 'ok' : 'bad'), res.ok ? '✔ Correcto' : h('span', 'Revisa: ', h('ol.steps', q.steps.map((s) => h('li', { html: rich(s) })))), h('div.btn-row', !res.ok ? h('button.btn.ghost.sm', { onclick: () => { view.lock(false); view.clearInput(); view.feedback(''); } }, '↻ Reintentar') : null, res.ok || true ? h('button.btn.primary.sm', { onclick: () => { i += 1; next(); } }, res.ok ? 'Siguiente parte ➜' : 'Ver siguiente') : null))); } });
    box.replaceChildren(i === 0 ? h('div.scenario', { html: rich('**' + p.title + '.** ' + p.scenario) }) : null, h('div.qmeta', h('span.pill', `Parte ${i + 1}/${p.parts.length}`)), view.el); view.focus(); };
  modal(box, { title: `${m.icon} ${m.title}`, wide: true }); next();
}

/* ───── EL MISTERIO DEL CERO ───── */
function zero(m) {
  let i = 0; const box = h('div.stack');
  const step = () => { if (i >= ZERO_MISSION.chapters.length) { box.replaceChildren(h('div.big-ico', '0️⃣'), h('h3', '¡Resolviste el misterio del cero!'), h('p', 'Un solo símbolo —“nada”— cambió el cálculo, el comercio y las máquinas. Lo construyeron muchas culturas, durante siglos.'), h('button.btn.primary', { onclick: () => { done(m, ZERO_MISSION.reward.xp, ZERO_MISSION.reward.pi); document.querySelector('.modal-back')?.remove(); } }, 'Reclamar recompensa')); return; }
    const c = ZERO_MISSION.chapters[i]; const q = { ...c.q, type: 'choice', hints: [], steps: [c.q.explain] };
    const view = questionView(q, { onSubmit: (v, res) => { view.lock(true); sfx[res.ok ? 'correct' : 'wrong'](); view.feedback(h('div.fb.' + (res.ok ? 'ok' : 'bad'), res.ok ? '✔ ' : 'Casi. ', c.q.explain, h('div.btn-row', h('button.btn.primary.sm', { onclick: () => { i += 1; step(); } }, 'Siguiente capítulo ➜')))); } });
    box.replaceChildren(h('div.pill', `Capítulo ${i + 1}/${ZERO_MISSION.chapters.length} · ${c.place}`), h('p.story', c.text), h('button.btn.ghost.sm', { onclick: () => speak(c.text, { force: true }) }, '🔊 Escuchar'), view.el); };
  modal(box, { title: '0️⃣ El misterio del cero', wide: true }); step();
}

/* ───── LA DIMENSIÓN DEL INFINITO ───── */
function infinito(m) {
  let i = 0; const box = h('div.stack');
  const bank = CONCEPT_BANK.infinity;
  const zeno = () => { const bar = h('div.zeno', h('i')); let n = 0; const lbl = h('b', 'Distancia recorrida: 0'); const btn = h('button.btn.primary', { onclick: () => { n += 1; const d = 1 - 0.5 ** n; bar.firstChild.style.width = d * 100 + '%'; lbl.textContent = `Después de ${n} pasos: ${(d).toFixed(4)} del camino`; sfx.click(); if (n >= 5) next.hidden = false; } }, 'Avanzar la mitad de lo que falta');
    const next = h('button.btn.good', { hidden: true, onclick: () => { i = 1; draw(); } }, 'Siguiente ➜');
    return h('div.stack', h('p', '**Paradoja de Zenón:** para llegar a la meta debes recorrer la mitad, luego la mitad de lo que queda, y así sin fin. ¿Llegas alguna vez?'.replace(/\*\*/g, '')), bar, lbl, btn, h('p.soft', '1/2 + 1/4 + 1/8 + … = 1. ¡Infinitos pasos, distancia finita!'), next); };
  const quiz = (k) => { const item = bank[k]; const q = { type: 'choice', prompt: item.q, choices: item.choices, answer: item.answer, steps: [item.explain], hints: [] }; const view = questionView(q, { onSubmit: (v, res) => { view.lock(true); sfx[res.ok ? 'correct' : 'wrong'](); view.feedback(h('div.fb.' + (res.ok ? 'ok' : 'bad'), res.ok ? '✔ ' : 'Casi. ', item.explain, h('div.btn-row', h('button.btn.primary.sm', { onclick: () => { i += 1; draw(); } }, 'Siguiente ➜')))); } }); return view.el; };
  const draw = () => { if (i === 0) box.replaceChildren(h('h3', '1 · Zenón y la tortuga'), zeno()); else if (i === 1) box.replaceChildren(h('h3', '2 · Series que suman un número finito'), quiz(0)); else if (i === 2) box.replaceChildren(h('h3', '3 · Cantor: infinitos de distinto tamaño'), quiz(1)); else box.replaceChildren(h('div.big-ico', '♾️'), h('h3', '¡Cruzaste la Dimensión del Infinito!'), h('p', 'Aprendiste que el infinito no es un número gigante, sino una idea con reglas.'), h('button.btn.primary', { onclick: () => { done(m, 120, 35); document.querySelector('.modal-back')?.remove(); } }, 'Reclamar recompensa')); };
  modal(box, { title: '♾️ La dimensión del infinito', wide: true }); draw();
}
