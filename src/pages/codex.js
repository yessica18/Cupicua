// Códice: enciclopedia, personajes (mentores), historia de las matemáticas, teoremas, secretos, biblioteca y novedades.
import { h, mount, modal, toast } from '../lib/dom.js';
import { rich, richEl } from '../lib/rich.js';
import { state, save } from '../lib/store.js';
import { encyclopedia, searchAll } from '../../shared/content/encyclopedia.js';
import { MENTORS } from '../../shared/content/mentors.js';
import { ERAS, NEEDS } from '../../shared/content/history.js';
import { THEOREMS } from '../../shared/content/theorems.js';
import { SECRETS, PI_FRAGMENTS, PI_PROFILE, CURIOSITIES } from '../../shared/content/game.js';
import { REGION_BY_ID, LEVEL_BY_ID, REGIONS } from '../../shared/content/regions.js';
import { masteryOf, unlockedMentors } from '../../shared/engine/game.js';
import { makeQuestion } from '../../shared/content/generators.js';
import { questionView } from '../components/question.js';
import { personPortrait } from './capia-portrait.js';
import { navigate, queryParams } from '../router.js';
import { speak } from '../lib/voice.js';
import { sfx, startMusic } from '../lib/sound.js';
import { fetchNews, webSearch } from '../lib/search.js';

let tab = 'buscar';
const TABS = [['buscar', '🔎 Enciclopedia'], ['personajes', '🧙 Personajes'], ['historia', '🏺 Historia'], ['teoremas', '📜 Teoremas'], ['secretos', '🔐 Secretos y π'], ['biblioteca', '📚 Biblioteca'], ['novedades', '📰 Novedades']];

export function codexPage(root, entryId) {
  startMusic('mystery'); const S = state(); const q = queryParams().get('q');
  if (entryId) { const e = encyclopedia().find((x) => x.id === entryId); if (e) { tab = 'buscar'; } }
  const body = h('div.codex-body');
  const tabs = h('div.tabs.scroll', TABS.map(([k, t]) => h('button.chip' + (k === tab ? '.on' : ''), { onclick: (e) => { tab = k; [...tabs.children].forEach((x) => x.classList.toggle('on', x === e.currentTarget)); show(); } }, t)));
  const views = { buscar: () => buscar(entryId, q), personajes, historia, teoremas, secretos, biblioteca, novedades };
  const show = () => body.replaceChildren(views[tab]());
  mount(root, h('section.page.codex', h('h1', '📖 Códice CAPICÚA'), h('p.sub', `Todo lo que descubres queda aquí. Entradas descubiertas: ${Object.keys(S.codex).length}`), tabs, body)); show();
}

/* ───── Enciclopedia + buscador interno ───── */
function entryView(e) {
  const S = state(); S.codex[e.id] = S.codex[e.id] || Date.now(); save();
  const lv = LEVEL_BY_ID[e.id];
  const rel = (e.relacionados || []).map((id) => encyclopedia().find((x) => x.id === id)).filter(Boolean);
  return h('div.card.entry', h('div.tag', e.type), h('h2', e.title), e.subject ? h('small', `${e.regionName} · Nivel ${e.level}`) : null,
    h('p.def', { html: rich(e.def) }), e.intuicion ? h('p', h('b', '💡 Intuición: '), e.intuicion) : null,
    e.formula ? h('div.formula', { html: rich(`$$${e.formula}$$`) }) : null, (e.simbolos || []).length ? h('ul.symlist', e.simbolos.map(([s, m]) => h('li', h('b', s), ' — ', m))) : null,
    (e.ejemplos || []).length ? h('div', h('b', 'Ejemplos'), h('ul', e.ejemplos.map((x) => h('li', { html: rich(x) })))) : null,
    e.historia ? h('p', h('b', '🏺 Historia: '), e.historia) : null, (e.aplicaciones || []).length ? h('p', h('b', '🌍 Aplicaciones: '), e.aplicaciones.filter(Boolean).join(' · ')) : null,
    h('div.btn-row', e.ejercicio ? h('button.btn.primary', { onclick: () => practice(e) }, '🎯 Ejercicio') : null, lv ? h('button.btn.good', { onclick: () => navigate('/lesson/' + lv.id) }, '⚔️ Ir a la lección') : null, h('button.btn.ghost', { onclick: () => speak(`${e.title}. ${e.def}`, { force: true }) }, '🔊 Escuchar')),
    rel.length ? h('div', h('b', 'Relacionado: '), rel.map((r) => h('a.chip', { href: '#/codex/' + r.id }, r.title))) : null);
}
function practice(e) {
  const spec = e.ejercicio; const q = makeQuestion(spec, Math.floor(Math.random() * 9999) + 1, 1); const view = questionView(q, { onSubmit: (v, res) => { view.lock(true); sfx[res.ok ? 'correct' : 'wrong'](); view.feedback(h('div.fb.' + (res.ok ? 'ok' : 'bad'), res.ok ? '✔ ¡Correcto!' : h('span', 'Veamos: ', h('ol.steps', q.steps.map((s) => h('li', { html: rich(s) })))))); } });
  modal(view.el, { title: `Ejercicio: ${e.title}` });
}
function buscar(entryId, q0) {
  const out = h('div.stack'); const entry = h('div'); const inp = h('input', { type: 'search', placeholder: '🔎 ¿Qué quieres aprender? (derivada, Pitágoras, Hipatia, matrices…)', 'aria-label': 'Buscar', value: q0 || '', oninput: () => run() });
  const run = () => { const q = inp.value; if (!q.trim()) { out.replaceChildren(h('p.soft', 'Prueba: “derivada”, “fracciones”, “Euler”, “laboratorio”, “cero”.'), h('div.chips', ['derivada', 'integral', 'matriz', 'probabilidad', 'π', 'vector', 'Newton', 'cero'].map((k) => h('button.chip', { onclick: () => { inp.value = k; run(); } }, k)))); return; }
    const res = searchAll(q, 24); out.replaceChildren(res.length ? h('div.results', res.map((r) => h('button.result', { onclick: () => open(r) }, h('b', r.title), h('small', `${r.kind} · ${r.sub}`)))) : h('p.soft', 'No encontré nada en el códice. ¿Quieres buscar en internet?', h('button.btn.ghost.sm', { onclick: async () => { out.replaceChildren(h('p', 'Buscando… 🌐')); try { const r2 = await webSearch(q); const S = state(); S.stats.searches += 1; save(); out.replaceChildren(h('small', '📜 enciclopédica · 📰 actual — revisa siempre la fuente'), r2.map((x) => h('a.src-card', { href: x.url, target: '_blank', rel: 'noopener noreferrer' }, h('b', `${x.kind === 'actual' ? '📰' : '📜'} ${x.title}`), h('small', x.snippet), h('em', x.source)))); } catch (e) { out.replaceChildren(h('p.soft', e.message)); } } }, '🌐 Buscar en internet'))); };
  const open = (r) => { const t = r.ref.type; if (t === 'codex') { const e = encyclopedia().find((x) => x.id === r.ref.id); entry.replaceChildren(entryView(e)); entry.scrollIntoView({ behavior: 'smooth' }); } else if (t === 'region') navigate('/region/' + r.ref.id); else if (t === 'mission') navigate('/missions'); else if (t === 'lab') navigate('/labs'); else if (t === 'history') { tab = 'historia'; navigate('/codex'); } };
  const wrap = h('div.stack', h('div.card', inp, out), entry);
  if (entryId) { const e = encyclopedia().find((x) => x.id === entryId); if (e) entry.replaceChildren(entryView(e)); } run();
  return wrap;
}

/* ───── Personajes ───── */
function personajes() {
  const S = state(); const unlocked = new Set(unlockedMentors(S).map((m) => m.id)); Object.keys(S.mentors).forEach((id) => unlocked.add(id));
  return h('div.stack', h('p.sub', `${unlocked.size} de ${MENTORS.length} mentores conocidos. Mantén el rigor: casi ningún descubrimiento fue obra de una sola persona.`), h('div.mentor-grid', MENTORS.map((m) => {
    const open = unlocked.has(m.id);
    return h('button.mentor' + (open ? '' : '.locked') + (S.profile.mentor === m.id ? '.sel' : ''), { onclick: () => open ? detail(m) : toast(`🔒 Domina el nivel ${m.unlock.n} de ${REGION_BY_ID[m.unlock.r].subject} para conocer a ${m.name.split(' ')[0]}`, { icon: '🔒' }) },
      open ? personPortrait(m.id, { size: 140 }) : h('div.silh', '?'), h('b', open ? m.name : '???'), h('small', open ? m.years : ''), h('small.sp', open ? m.specialty : ''));
  })));
}
function detail(m) {
  const S = state(); const q = makeQuestion(m.challenge, Math.floor(Math.random() * 9999) + 1, 1); let done = S.game.mentorChallenges?.[m.id];
  const ch = h('div.card'); const view = questionView(q, { onSubmit: (v, res) => { view.lock(true); if (res.ok) { sfx.levelup(); view.feedback(h('div.fb.ok', `✔ ¡Desafío de ${m.name.split(' ')[0]} superado! +${m.reward.pi} π`)); if (!done) { (S.game.mentorChallenges ||= {})[m.id] = Date.now(); S.pi += m.reward.pi; S.xp += m.reward.xp; save(); } } else { sfx.wrong(); view.feedback(h('div.fb.bad', h('ol.steps', q.steps.map((s) => h('li', { html: rich(s) }))))); } } });
  ch.append(h('b', '🎯 Desafío del mentor'), view.el);
  modal(h('div.stack.mentor-detail', h('div.md-head', personPortrait(m.id, { size: 190, expr: 'happy', drag: true }), h('div', h('small', `${m.years} · ${m.region}`), h('p', m.bio), h('small', h('b', 'Especialidad: '), m.specialty))), h('blockquote', m.dialog.map((l) => h('p', `“${l}”`))), h('h4', 'Curiosidades'), h('ul', m.facts.map((f) => h('li', f))), h('h4', 'Aportes'), h('ul', m.discoveries.map((f) => h('li', f))), h('p.soft', h('b', 'Contexto histórico: '), m.context),
    h('div.btn-row', h('button.btn.primary', { onclick: () => { S.profile.mentor = m.id; save(); toast(`${m.name} es ahora tu mentor`, { icon: '🧙' }); } }, 'Elegir como mentor'), h('button.btn.ghost', { onclick: () => speak(`${m.dialog[0]} ${m.bio}`, { force: true }) }, '🔊')), ch), { title: m.name, wide: true });
}

/* ───── Historia ───── */
function historia() {
  const S = state(); let cur = ERAS[0].id; const out = h('div.stack');
  const bar = h('div.timeline', ERAS.map((e) => h('button.era' + (e.id === cur ? '.on' : ''), { style: { '--c': e.color }, onclick: () => { cur = e.id; [...bar.children].forEach((b, i) => b.classList.toggle('on', ERAS[i].id === cur)); draw(); sfx.click(); } }, h('span', e.icon), h('small', e.name))));
  const draw = () => { const e = ERAS.find((x) => x.id === cur);
    out.replaceChildren(h('div.card', { style: { '--c': e.color } }, h('h2', `${e.icon} ${e.name}`), h('small', e.span), h('p', e.intro), h('div.needs', e.needs.map((n) => { const x = NEEDS.find((y) => y[0] === n); return h('span.need', `${x[0]} ${x[1]}: ${x[2]}`); })), h('div.events', e.events.map((ev) => h('div.ev-h', h('b', ev.year), h('div', h('b', ev.title), h('p', ev.text))))), h('div.btn-row', h('button.btn.ghost', { onclick: () => speak(`${e.name}. ${e.intro}`, { force: true }) }, '🔊 Escuchar'), e.quest.mission ? h('button.btn.primary', { onclick: () => navigate('/missions') }, '🕵️ Misión: El misterio del cero') : null)),
      h('small.soft', 'Las matemáticas fueron desarrolladas por muchas culturas y generaciones. Si ves una atribución a una sola persona, probablemente es una simplificación.')); };
  draw(); return h('div.stack', h('p.sub', 'Una línea de tiempo del saber humano: de las tablillas a la computación.'), bar, out);
}

/* ───── Teoremas ───── */
function teoremas() {
  return h('div.grid', THEOREMS.map((t) => h('button.card.thm', { onclick: () => modal(h('div.stack.theorem', h('div.formula', { html: rich(`$$${t.formula}$$`) }), h('p', h('b', 'Historia: '), t.historia), h('p', h('b', 'Quiénes contribuyeron: '), t.contribuyentes.join(', ')), h('p', h('b', 'Qué problema resuelve: '), t.problema), h('p', h('b', 'Intuición: '), t.intuicion), h('ul.symlist', t.simbolos.map(([s, m]) => h('li', h('b', s), ' — ', m))), h('h4', 'Demostración adaptada'), h('ol.steps', t.demostracion.map((x) => h('li', { html: rich(x) }))), h('p', h('b', 'Ejemplo: '), t.ejemplo), h('p', h('b', 'Aplicación: '), t.aplicacion), h('p', h('b', 'En ingeniería: '), t.ingenieria), h('h4', 'Errores frecuentes'), h('ul', t.errores.map((x) => h('li', x))), h('p.soft', h('b', 'Revisión futura: '), t.revision), h('button.btn.primary', { onclick: () => navigate('/lesson/' + t.level) }, '⚔️ Practicar en la lección')), { title: t.name, wide: true }) }, h('b', t.name), h('small', REGION_BY_ID[t.level.split('.')[0]].name), h('div.mini-f', { html: rich(`$${t.formula}$`) }))));
}

/* ───── Secretos, π y curiosidades ───── */
function secretos() {
  const S = state();
  return h('div.stack', h('div.card', h('h3', 'π · la criatura de los decimales'), h('p', PI_PROFILE.epithet), h('div.pi-row', PI_FRAGMENTS.map((p) => h('span.pi-frag' + (S.piFound[p.id] ? '.on' : ''), S.piFound[p.id] ? 'π' : '·'))), h('small', `Fragmentos encontrados: ${Object.keys(S.piFound).length}/${PI_FRAGMENTS.length}. Búscalos en las regiones (✨).`), h('h4', 'Aproximaciones a lo largo de la historia'), h('ul', PI_PROFILE.aproximaciones.map(([v, w]) => h('li', h('b', v), ' — ', w)))),
    h('div.grid', SECRETS.map((s) => { const st = S.secrets[s.id]; return h('div.card', h('div.big-ico', st?.unlocked ? s.icon : '🔐'), h('b', st?.unlocked ? s.name : 'Zona secreta'), h('small', st?.unlocked ? s.lore : `Domina el nivel ${s.need.n} de ${REGION_BY_ID[s.need.r].subject}.`), st?.unlocked && !st.done ? h('button.btn.primary.sm', { onclick: () => navigate('/games/secret-' + s.id) }, 'Entrar') : st?.done ? h('small.ok', '✅ Completado') : null); })),
    h('div.card', h('h3', `🔭 Curiosidades encontradas (${Object.keys(S.curiosities).length}/${CURIOSITIES.length})`), h('ul', CURIOSITIES.filter((c) => S.curiosities[c.id]).map((c) => h('li', `${c.icon} ${c.title}`))), Object.keys(S.curiosities).length ? null : h('p.soft', 'Explora las regiones y toca los objetos que flotan (📜 🧮 🔭 🛰️).')));
}

/* ───── Biblioteca de referencias ───── */
const REFS = [
  ['Matemáticas · Álgebra lineal', ['Introduction to Linear Algebra — Gilbert Strang', 'Linear Algebra: A Modern Introduction — David Poole'], 'algebralineal'],
  ['Cálculo y vectorial', ['Calculus — James Stewart', 'Thomas’ Calculus — Hass, Heil, Weir'], 'calculo'],
  ['Ecuaciones diferenciales', ['Elementary Differential Equations — Boyce & DiPrima', 'Differential Equations with Boundary-Value Problems — Dennis Zill'], 'edo'],
  ['Matemáticas discretas', ['Discrete Mathematics and Its Applications — Kenneth Rosen'], 'aritmetica'],
  ['Física universitaria', ['Fundamentals of Physics — Halliday, Resnick, Walker', 'University Physics — Sears & Zemansky (Young & Freedman)'], 'fisica'],
  ['Circuitos y electrónica', ['Microelectronic Circuits — Sedra & Smith', 'Introductory Circuit Analysis — Boylestad'], 'fisica2'],
  ['Mecánica (estática y dinámica)', ['Engineering Mechanics: Statics / Dynamics — R. C. Hibbeler'], 'ingenieria'],
];
function biblioteca() {
  const ocw = (q) => `https://ocw.mit.edu/search/?q=${encodeURIComponent(q)}`;
  return h('div.stack', h('div.card', h('h3', '📚 Textos de referencia de las mejores facultades'), h('p.soft', 'Por derechos de autor, CAPICÚA NO copia ni redistribuye estos libros: te dice cuáles son el estándar y los conecta con las lecciones. Búscalos en la biblioteca de tu universidad.'),
    REFS.map(([t, books, r]) => h('div.ref', h('b', t), h('ul', books.map((b) => h('li', b))), h('a.chip', { href: '#/region/' + r }, `Ver ${REGION_BY_ID[r].subject} en CAPICÚA`)))),
    h('div.card', h('h3', '🌐 Recursos abiertos y gratuitos'), h('ul.links', [['MIT OpenCourseWare — Álgebra lineal (Strang)', ocw('18.06 linear algebra')], ['MIT OpenCourseWare — Cálculo multivariable', ocw('multivariable calculus')], ['MIT OpenCourseWare — Ecuaciones diferenciales', ocw('differential equations')], ['MIT OpenCourseWare — Mecánica y electromagnetismo', ocw('classical mechanics electricity magnetism')], ['MIT OpenCourseWare — exámenes con soluciones', ocw('exams solutions')], ['Paul’s Online Math Notes (Lamar University)', 'https://tutorial.math.lamar.edu/']].map(([t, u]) => h('li', h('a', { href: u, target: '_blank', rel: 'noopener noreferrer' }, t)))), h('small', 'Los enlaces abren sitios externos; revisa la licencia de cada material.')),
    h('div.card', h('h3', '📝 Exámenes de años anteriores'), h('p', 'No existe (ni debemos crear) un archivo masivo de exámenes protegidos por derechos de autor. Lo que sí hacemos: generar **problemas ilimitados del mismo estilo y dificultad** (Quiz → Simulacro / Examen universitario) y enlazar a los exámenes que MIT y otras universidades publican con licencia abierta. Pide a tu profesor los de tu curso.'), h('button.btn.primary', { onclick: () => navigate('/quiz') }, '🎓 Hacer un simulacro')));
}

/* ───── Novedades del universo (bajo demanda, con fuente) ───── */
function novedades() {
  const topics = ['matemáticas', 'física', 'ingeniería', 'robótica', 'inteligencia artificial', 'astronomía', 'computación', 'ciencia', 'tecnología']; const out = h('div.stack');
  const load = async (t, btn) => { out.replaceChildren(h('p', 'Buscando noticias… 🌐')); try { const r = await fetchNews(t); const S = state(); S.stats.searches += 1; save(); out.replaceChildren(h('small.soft', '📰 Información actual de Wikinoticias. Verifica en la fuente; no la damos por definitiva.'), r.map((x) => h('a.src-card', { href: x.url, target: '_blank', rel: 'noopener noreferrer' }, h('b', '📰 ' + x.title), h('small', x.snippet), h('em', `${x.source}${x.date ? ' · ' + new Date(x.date).toLocaleDateString('es') : ''}`)))); if (!r.length) out.append(h('p.soft', 'Sin resultados recientes para este tema.')); } catch (e) { out.replaceChildren(h('p.soft', 'No pude conectarme: ' + e.message + ' (necesitas internet).')); } };
  return h('div.stack', h('p.sub', '📰 NOVEDADES DEL UNIVERSO — noticias de ciencia y tecnología con su fuente. Solo se consultan cuando tú lo pides.'), h('div.chips', topics.map((t) => h('button.chip', { onclick: () => load(t) }, t))), out, h('div.card', h('h4', 'Otras fuentes confiables'), h('ul.links', [['NASA', 'https://www.nasa.gov/news/'], ['Quanta Magazine (matemáticas y física)', 'https://www.quantamagazine.org/'], ['MIT News', 'https://news.mit.edu/'], ['ESA', 'https://www.esa.int/']].map(([t, u]) => h('li', h('a', { href: u, target: '_blank', rel: 'noopener noreferrer' }, t))))));
}
