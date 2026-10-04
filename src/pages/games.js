// Juegos que enseñan: tablas de multiplicar, sudokus, el juego del 24, acertijos, desafío diario y secretos.
import { h, mount, toast, modal, wait, pick } from '../lib/dom.js';
import { rich, richEl } from '../lib/rich.js';
import { state, save } from '../lib/store.js';
import { PUZZLES, SECRETS, LEGENDARY } from '../../shared/content/game.js';
import { dailyChallenge, completeDaily, dayKey, recordAttempt, addXP, addPI } from '../../shared/engine/game.js';
import { makeQuestion } from '../../shared/content/generators.js';
import { checkAnswer, answerText } from '../../shared/math/check.js';
import { parse, evaluate, freeVars } from '../../shared/math/expr.js';
import { questionView } from '../components/question.js';
import { navigate } from '../router.js';
import { sfx, startMusic } from '../lib/sound.js';
import { personPortrait } from './capia-portrait.js';
import { hud } from '../lib/game-ui.js';
import { checkAchievements } from '../../shared/engine/achievements.js';

const GAMES = [['tablas', '✖️', 'Tablas de multiplicar', 'Practica sin cronómetro y entiéndelas con puntos'], ['sudoku', '🧩', 'Sudoku', '4×4, 6×6 y 9×9: lógica pura'], ['veinticuatro', '2️⃣4️⃣', 'El juego del 24', 'Combina 4 números para obtener 24'], ['acertijos', '🧠', 'Acertijos y lógica', 'Retos para pensar distinto'], ['legendarios', '🌌', 'Desafíos legendarios', 'Varios caminos, una solución'], ['daily', '⚡', 'Desafío del día', 'Un reto nuevo cada día']];

export function gamesPage(root, id) {
  startMusic('adventure');
  if (!id) return hub(root);
  if (id === 'tablas') return tablas(root); if (id === 'sudoku') return sudoku(root); if (id === 'veinticuatro') return veinticuatro(root);
  if (id === 'acertijos') return acertijos(root); if (id === 'daily') return daily(root); if (id === 'legendarios') return legendarios(root);
  if (id.startsWith('secret-')) return secretChallenge(root, id.slice(7));
  navigate('/games');
}
const back = () => h('a.crumb', { href: '#/games' }, '← Juegos');
function hub(root) {
  mount(root, h('section.page', hud(), h('h1', '🎲 Juegos'), h('p.sub', 'Aprender jugando. Sin cronómetros que presionen: lo importante es entender.'),
    h('div.lab-grid', GAMES.map(([k, ico, name, d]) => h('button.card.lab-card', { onclick: () => { sfx.click(); navigate('/games/' + k); } }, h('span.ico-big', ico), h('b', name), h('small', d))))));
}
function reward(xp, pi, msg) { const S = state(); addXP(S, xp); if (pi) addPI(S, pi); const fresh = checkAchievements(S); save(); toast(`${msg} +${xp} XP${pi ? ` · +${pi} π` : ''}`, { icon: '🎉' }); sfx.coin(); fresh.forEach((a) => toast(`${a.icon} ${a.name}`, { icon: '🏅' })); }

/* ───── Tablas de multiplicar ───── */
function tablas(root) {
  const S = state(); const T = (S.game.tables ||= {}); let chosen = 'mix'; let total = 10; let n = 0; let ok = 0; let cur = null; let streak = 0;
  const box = h('div.card.tab-box');
  const menu = () => mount(root, h('section.page', back(), h('h1', '✖️ Tablas de multiplicar'), h('p.sub', 'Cada resultado es un rectángulo de puntos. Entiéndelo y no tendrás que memorizar a ciegas.'),
    h('div.chips', ['mix', ...Array.from({ length: 12 }, (_, i) => i + 1)].map((t) => h('button.chip' + (t === chosen ? '.on' : ''), { onclick: () => { chosen = t; menu(); } }, t === 'mix' ? '🎲 Mezcla (mis puntos débiles)' : `Tabla del ${t}`))),
    h('div.btn-row', h('button.btn.primary.big', { onclick: () => { n = 0; ok = 0; streak = 0; mount(root, h('section.page', back(), h('h1', '✖️ Tablas'), box)); next(); } }, '▶ Empezar (10 preguntas)'))));
  const weak = () => { const facts = []; for (let a = 2; a <= 12; a++) for (let b = 2; b <= 12; b++) { const f = T[`${a}x${b}`]; facts.push({ a, b, w: 1 + (f ? (f.tot - f.ok) * 2 : 1.5) }); } let r = Math.random() * facts.reduce((s, x) => s + x.w, 0); for (const f of facts) { r -= f.w; if (r <= 0) return f; } return facts[0]; };
  function next() {
    if (n >= total) return end(); n += 1;
    let a; let b; if (chosen === 'mix') ({ a, b } = weak()); else { a = chosen; b = 1 + Math.floor(Math.random() * 12); } if (Math.random() < 0.5) [a, b] = [b, a]; cur = { a, b };
    const dots = h('div.dots-grid', { style: { gridTemplateColumns: `repeat(${Math.min(b, 12)}, 14px)` }, 'aria-hidden': 'true' }, Array.from({ length: a * b }, () => h('i')));
    const inp = h('input.ans', { type: 'number', inputMode: 'numeric', 'aria-label': 'Resultado', onkeydown: (e) => { if (e.key === 'Enter') go(); } }); const fb = h('div.q-feedback');
    const go = () => { if (inp.value === '') return; const right = +inp.value === a * b; const k = `${Math.min(a, b)}x${Math.max(a, b)}`; (T[k] ||= { ok: 0, tot: 0 }).tot += 1; if (right) { T[k].ok += 1; ok += 1; streak += 1; sfx.correct(); fb.replaceChildren(h('div.fb.ok', streak >= 3 ? `✔ ¡${streak} seguidas!` : '✔ ¡Correcto!')); } else { streak = 0; sfx.wrong(); fb.replaceChildren(h('div.fb.bad', `${a} × ${b} = ${a * b}. Mira: ${a} filas de ${b} puntos. ${b > 1 ? `También es ${b} × ${a}.` : ''}`)); } inp.disabled = true; save(); setTimeout(next, right ? 700 : 2200); };
    box.replaceChildren(h('div.qmeta', h('span.pill', `${n}/${total}`), h('span.pill', `🔥 ${streak}`)), h('div.tab-q', `${a} × ${b} = ?`), dots, h('div.ans-row', inp, h('button.btn.primary.big', { onclick: go }, 'Comprobar')), fb); inp.focus();
  }
  function end() { const pct = Math.round((ok / total) * 100); reward(10 + ok * 3, ok >= 8 ? 5 : 0, `Tablas: ${ok}/${total}`); box.replaceChildren(h('h2', ok >= 8 ? '🎉 ¡Muy bien!' : '💙 ¡Buen intento!'), h('p', `Acertaste ${ok} de ${total} (${pct}%). Las que fallaste aparecerán más seguido en la mezcla.`), h('div.btn-row', h('button.btn.primary', { onclick: () => { n = 0; ok = 0; streak = 0; next(); } }, 'Otra ronda'), h('button.btn.ghost', { onclick: menu }, 'Cambiar tabla'))); }
  menu();
}

/* ───── Sudoku (con solución única) ───── */
const SPEC = { 4: { r: 2, c: 2, clues: 8 }, 6: { r: 2, c: 3, clues: 20 }, 9: { r: 3, c: 3, clues: 36 } };
function sudokuGen(N, clues) {
  const { r: br, c: bc } = SPEC[N]; const g = Array.from({ length: N }, () => Array(N).fill(0)); const ok = (g, y, x, v) => { for (let i = 0; i < N; i++) if (g[y][i] === v || g[i][x] === v) return false; const y0 = y - (y % br); const x0 = x - (x % bc); for (let i = 0; i < br; i++) for (let j = 0; j < bc; j++) if (g[y0 + i][x0 + j] === v) return false; return true; };
  const shuffle = (a) => { for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; };
  const fill = (k = 0) => { if (k === N * N) return true; const y = Math.floor(k / N); const x = k % N; for (const v of shuffle([...Array(N)].map((_, i) => i + 1))) if (ok(g, y, x, v)) { g[y][x] = v; if (fill(k + 1)) return true; g[y][x] = 0; } return false; }; fill();
  const sol = g.map((r) => [...r]);
  const count = (b, lim = 2) => { let c = 0; const rec = (k) => { if (c >= lim) return; while (k < N * N && b[Math.floor(k / N)][k % N]) k++; if (k === N * N) { c++; return; } const y = Math.floor(k / N); const x = k % N; for (let v = 1; v <= N; v++) if (ok(b, y, x, v)) { b[y][x] = v; rec(k + 1); b[y][x] = 0; } }; rec(0); return c; };
  const cells = shuffle([...Array(N * N)].map((_, i) => i)); let have = N * N;
  for (const k of cells) { if (have <= clues) break; const y = Math.floor(k / N); const x = k % N; const keep = g[y][x]; g[y][x] = 0; if (count(g.map((r) => [...r])) !== 1) g[y][x] = keep; else have--; }
  return { puzzle: g, solution: sol };
}
function sudoku(root) {
  const S = state(); let N = 4; let notesMode = false; let sel = null; let game; let hints = 0; const board = h('div.sudoku'); const pad = h('div.numpad'); const msg = h('div.q-feedback');
  const bc = () => SPEC[N];
  const newGame = () => { const { puzzle, solution } = sudokuGen(N, SPEC[N].clues); game = { puzzle, solution, cur: puzzle.map((r) => [...r]), notes: puzzle.map((r) => r.map(() => new Set())) }; hints = 0; sel = null; draw(); msg.replaceChildren(); };
  const conflicts = (y, x) => { const v = game.cur[y][x]; if (!v) return false; for (let i = 0; i < N; i++) { if (i !== x && game.cur[y][i] === v) return true; if (i !== y && game.cur[i][x] === v) return true; } const { r, c } = bc(); const y0 = y - (y % r); const x0 = x - (x % c); for (let i = 0; i < r; i++) for (let j = 0; j < c; j++) if ((y0 + i !== y || x0 + j !== x) && game.cur[y0 + i][x0 + j] === v) return true; return false; };
  const draw = () => {
    const { r, c } = bc(); board.style.gridTemplateColumns = `repeat(${N}, 1fr)`; board.className = 'sudoku n' + N;
    board.replaceChildren(...game.cur.flatMap((row, y) => row.map((v, x) => { const fixed = game.puzzle[y][x] !== 0; const same = sel && v && game.cur[sel[0]][sel[1]] === v;
      return h('button.cell' + (fixed ? '.fixed' : '') + (sel && sel[0] === y && sel[1] === x ? '.sel' : '') + (same ? '.same' : '') + (conflicts(y, x) ? '.err' : '') + ((x + 1) % c === 0 && x < N - 1 ? '.rb' : '') + ((y + 1) % r === 0 && y < N - 1 ? '.bb' : ''), { 'aria-label': `fila ${y + 1} columna ${x + 1} ${v || 'vacía'}`, onclick: () => { sel = [y, x]; draw(); } }, v ? String(v) : game.notes[y][x].size ? h('span.notes', [...Array(N)].map((_, i) => h('i', game.notes[y][x].has(i + 1) ? i + 1 : ''))) : ''); })));
    pad.replaceChildren(...[...Array(N)].map((_, i) => h('button.btn.ghost', { onclick: () => put(i + 1) }, i + 1)), h('button.btn.ghost', { onclick: () => put(0) }, '⌫'), h('button.btn' + (notesMode ? '.primary' : '.ghost'), { onclick: () => { notesMode = !notesMode; draw(); } }, '✏️ Notas'));
  };
  const put = (v) => { if (!sel) { toast('Toca una casilla primero', { icon: 'ℹ️' }); return; } const [y, x] = sel; if (game.puzzle[y][x]) return; if (notesMode && v) { const s = game.notes[y][x]; s.has(v) ? s.delete(v) : s.add(v); game.cur[y][x] = 0; } else { game.cur[y][x] = v; game.notes[y][x].clear(); sfx.click(); } draw(); check(); };
  const check = () => { if (game.cur.some((r) => r.includes(0))) return; const full = game.cur.every((r, y) => r.every((v, x) => v === game.solution[y][x]) ); const valid = game.cur.every((r, y) => r.every((v, x) => !conflicts(y, x))); if (full || valid) { S.stats.puzzles = (S.stats.puzzles || 0) + 1; reward(15 * (N === 9 ? 3 : N === 6 ? 2 : 1) - hints * 2, N === 9 ? 10 : 3, '¡Sudoku resuelto!'); sfx.victory(); msg.replaceChildren(h('div.fb.ok', '🎉 ¡Completo y correcto! La lógica ganó.')); } };
  mount(root, h('section.page.sudoku-page', back(), h('h1', '🧩 Sudoku'), h('p.sub', 'Cada fila, columna y bloque lleva cada número una sola vez. Piensa: ¿qué número NO puede ir aquí?'),
    h('div.chips', [4, 6, 9].map((n) => h('button.chip' + (n === N ? '.on' : ''), { onclick: (e) => { N = n; [...e.target.parentElement.children].forEach((x) => x.classList.toggle('on', x === e.target)); newGame(); } }, `${n}×${n}`))),
    h('div.sdk-wrap', board, pad), msg, h('div.btn-row', h('button.btn.good', { onclick: () => { if (!sel) { toast('Selecciona una casilla vacía', { icon: 'ℹ️' }); return; } const [y, x] = sel; if (game.puzzle[y][x]) return; game.cur[y][x] = game.solution[y][x]; hints += 1; draw(); check(); } }, '💡 Pista (revela la casilla)'), h('button.btn.ghost', { onclick: () => { const bad = game.cur.flatMap((r, y) => r.map((v, x) => (v && v !== game.solution[y][x] ? 1 : 0))).reduce((a, b) => a + b, 0); msg.replaceChildren(h('div.fb.' + (bad ? 'bad' : 'ok'), bad ? `Hay ${bad} casilla(s) incorrecta(s).` : 'Por ahora todo lo escrito es correcto 👍')); } }, '🔎 Revisar'), h('button.btn.ghost', { onclick: newGame }, '🔄 Nuevo'))));
  newGame();
}

/* ───── Juego del 24 ───── */
function solve24(nums) {
  const ops = ['+', '-', '*', '/']; const rec = (a) => { if (a.length === 1) return Math.abs(a[0].v - 24) < 1e-6 ? a[0].s : null; for (let i = 0; i < a.length; i++) for (let j = 0; j < a.length; j++) { if (i === j) continue; const rest = a.filter((_, k) => k !== i && k !== j); for (const o of ops) { if (o === '/' && Math.abs(a[j].v) < 1e-9) continue; const v = o === '+' ? a[i].v + a[j].v : o === '-' ? a[i].v - a[j].v : o === '*' ? a[i].v * a[j].v : a[i].v / a[j].v; const r = rec([...rest, { v, s: `(${a[i].s}${o}${a[j].s})` }]); if (r) return r; } } return null; };
  return rec(nums.map((n) => ({ v: n, s: String(n) })));
}
function veinticuatro(root) {
  const S = state(); let nums; let hintShown = false; const box = h('div.card');
  const gen = () => { do { nums = Array.from({ length: 4 }, () => 1 + Math.floor(Math.random() * 9)); } while (!solve24(nums)); hintShown = false; draw(); };
  const draw = () => { const inp = h('input.ans', { placeholder: 'Ej.: (8-2)*(3+1)', 'aria-label': 'Tu expresión', onkeydown: (e) => { if (e.key === 'Enter') go(); } }); const fb = h('div.q-feedback');
    const go = () => { try { const ast = parse(inp.value.replace(/x/gi, '*')); if (freeVars(ast).size) throw new Error('Usa solo números'); const used = (inp.value.match(/\d+/g) || []).map(Number).sort(); const need = [...nums].sort(); if (used.join() !== need.join()) { fb.replaceChildren(h('div.fb.warn', `Usa exactamente estos números una vez: ${nums.join(', ')}`)); return; } const v = evaluate(ast, {}); if (Math.abs(v - 24) < 1e-6) { reward(20, 4, '¡24!'); fb.replaceChildren(h('div.fb.ok', '🎉 ¡Exacto, da 24!')); sfx.victory(); setTimeout(gen, 1600); } else fb.replaceChildren(h('div.fb.bad', `Eso da ${+v.toFixed(3)}. ¡Intenta otra combinación!`)); } catch (e) { fb.replaceChildren(h('div.fb.warn', e.message)); } };
    box.replaceChildren(h('div.nums24', nums.map((n) => h('span.n24', n))), h('p', 'Usa + − × ÷ y paréntesis para obtener 24. Cada número una vez.'), h('div.ans-row', inp, h('button.btn.primary.big', { onclick: go }, 'Comprobar')), fb, h('div.btn-row', h('button.btn.ghost', { onclick: () => { fb.replaceChildren(h('div.fb.info', hintShown ? `Solución: ${solve24(nums)}` : 'Pista: piensa en 24 = 3×8, 4×6, 2×12 o 6+18. ¿Cómo fabricas uno de esos pares?')); hintShown = true; } }, '💡 Pista'), h('button.btn.ghost', { onclick: gen }, '🔄 Otro'))); inp.focus(); };
  mount(root, h('section.page', back(), h('h1', '2️⃣4️⃣ El juego del 24'), box)); gen();
}

/* ───── Acertijos, legendarios, diario, secretos ───── */
function puzzleCard(p, onDone) {
  const q = { type: p.type, answer: p.answer, tol: p.tol || 0, prompt: p.prompt, hints: p.hints, steps: [p.explain] }; let hints = 0; const S = state();
  const view = questionView(q, { onSubmit: (v, res) => { view.lock(true); if (res.ok) { sfx.correct(); view.feedback(h('div.fb.ok', '✔ ¡Correcto! ', h('span', { html: rich(p.explain) }))); onDone?.(true); } else { sfx.wrong(); view.feedback(h('div.fb.bad', h('b', 'Todavía no. '), 'Una pista no es rendirse. ', h('button.btn.ghost.sm', { onclick: () => { view.lock(false); view.clearInput(); view.feedback(''); } }, '↻ Reintentar'))); } } });
  return h('div.card.puzzle', view.el, h('div.hint-row', [1, 2, 3].map((n) => h('button.btn.ghost.sm', { onclick: (e) => { hints = n; e.target.replaceWith(h('div.hint', h('b', `Pista ${n}: `), h('span', { html: rich(p.hints[n - 1] || p.hints.at(-1)) }))); } }, `💡 Pista ${n}`))));
}
function acertijos(root) {
  const S = state(); S.game.puzzles ||= {}; const list = h('div.stack');
  mount(root, h('section.page', back(), h('h1', '🧠 Acertijos y lógica'), h('p.sub', 'Cada acertijo se puede resolver de varias maneras. Lo valioso es el camino.'), list));
  PUZZLES.forEach((p) => { const done = S.game.puzzles[p.id]; const c = h('details.card', { open: false }, h('summary', `${done ? '✅' : '🧩'} ${p.kind[0].toUpperCase() + p.kind.slice(1)} · ${p.prompt.slice(0, 54)}…`), puzzleCard(p, (ok) => { if (ok && !S.game.puzzles[p.id]) { S.game.puzzles[p.id] = Date.now(); reward(15, 3, '¡Acertijo!'); } })); list.append(c); });
}
function legendarios(root) {
  const S = state(); S.game.legend ||= {};
  mount(root, h('section.page', back(), h('h1', '🌌 Desafíos legendarios'), h('p.sub', 'Problemas que combinan varias ramas. No hay solución inmediata: usa pistas, experimenta, intenta varias veces. Puede haber múltiples caminos.'),
    LEGENDARY.map((l) => h('div.card', h('h3', `${S.game.legend[l.id] ? '👑' : '🌌'} ${l.title}`), h('p.paths', h('b', 'Caminos posibles: '), l.paths.join(' · ')), puzzleCard({ ...l, kind: 'legendario', explain: `Una de las rutas: ${l.paths[0]}.` }, (ok) => { if (ok && !S.game.legend[l.id]) { S.game.legend[l.id] = Date.now(); reward(80, 25, '¡Desafío legendario!'); S.game.shells += 1; save(); } })))));
}
function daily(root) {
  const S = state(); const d = dailyChallenge(); const done = S.daily[d.key]?.done;
  const body = h('div.card');
  mount(root, h('section.page', back(), h('h1', '⚡ Desafío del día'), h('p.sub', `${d.kind} · ${new Date().toLocaleDateString('es', { weekday: 'long', day: 'numeric', month: 'long' })}`), body));
  const finish = () => { const r = completeDaily(S); if (!r) return; S.game.shells += 1; const fresh = checkAchievements(S); save(); sfx.victory(); body.append(h('div.fb.ok', `🎉 ¡Reto cumplido! +${r.xp} XP · +${r.pi} π · +1 🐚 concha`)); fresh.forEach((a) => toast(`${a.icon} ${a.name}`, { icon: '🏅' })); };
  if (done) { body.append(h('p', '✅ Ya completaste el desafío de hoy. ¡Vuelve mañana por otro!'), h('button.btn.ghost', { onclick: () => navigate('/games') }, 'Ver más juegos')); return; }
  if (d.puzzle) body.append(puzzleCard(d.puzzle, (ok) => ok && finish()));
  else { const q = makeQuestion(d.spec, d.seed, d.d); const view = questionView(q, { onSubmit: (v, res) => { view.lock(true); recordAttempt(S, { levelId: d.levelId, spec: q.gen, seed: q.seed, difficulty: q.difficulty, correct: res.ok, mode: 'daily', qType: q.type, input: String(v) }); if (res.ok) { sfx.correct(); view.feedback(h('div.fb.ok', '✔ ¡Correcto!')); finish(); } else { sfx.wrong(); view.feedback(h('div.fb.bad', h('b', 'Casi. '), h('ol.steps', q.steps.map((s) => h('li', { html: rich(s) }))), h('button.btn.ghost.sm', { onclick: () => { view.lock(false); view.clearInput(); view.feedback(''); } }, '↻ Reintentar'))); } } }); body.append(view.el); }
}
function secretChallenge(root, sid) {
  const S = state(); const sec = SECRETS.find((s) => s.id === sid); if (!sec) return navigate('/games');
  const body = h('div.card'); mount(root, h('section.page', back(), h('h1', `${sec.icon} ${sec.name}`), h('p.sub', sec.lore), body));
  const q = makeQuestion(sec.challenge, Math.floor(Math.random() * 9999) + 1, 2);
  const view = questionView(q, { onSubmit: (v, res) => { view.lock(true); if (res.ok) { S.secrets[sid] = { ...(S.secrets[sid] || {}), unlocked: Date.now(), done: true }; S.pi += sec.reward.pi; S.piEarned = (S.piEarned || 0) + sec.reward.pi; S.codex[sec.reward.codex] = Date.now(); const fresh = checkAchievements(S); save(); sfx.levelup(); view.feedback(h('div.fb.ok', `🔓 ¡Secreto descubierto! +${sec.reward.pi} π y una entrada nueva en el códice.`)); fresh.forEach((a) => toast(`${a.icon} ${a.name}`, { icon: '🏅' })); } else { sfx.wrong(); view.feedback(h('div.fb.bad', h('b', 'La puerta sigue cerrada. '), h('ol.steps', q.steps.map((s) => h('li', { html: rich(s) }))), h('button.btn.ghost.sm', { onclick: () => navigate('/games/secret-' + sid) }, 'Probar otro'))); } } });
  body.append(view.el);
}
