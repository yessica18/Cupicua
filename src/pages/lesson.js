// Lección corta = combate educativo: cada respuesta correcta hiere al enemigo; cada error te hiere a ti (y aprendes de él).
// El enemigo permanece hasta que lo derrotas; solo entonces aparece uno nuevo.
import { h, mount, toast, modal, wait, floatText, pick } from '../lib/dom.js';
import { rich, richEl } from '../lib/rich.js';
import { state, save } from '../lib/store.js';
import { LEVEL_BY_ID, REGION_BY_ID } from '../../shared/content/regions.js';
import { makeQuestion, makeProject } from '../../shared/content/generators.js';
import { THEOREMS_FOR_LEVEL } from '../../shared/content/theorems.js';
import { ENEMIES, CAPIA_SAYS, WEAPONS } from '../../shared/content/game.js';
import { recordAttempt, completeLesson, nextExercise, masteryOf, prereqGaps, syncUnlocks, unlockedWeapons, nextSeed, adaptiveDifficulty } from '../../shared/engine/game.js';
import { checkAchievements, ACHIEVEMENT_BY_ID } from '../../shared/engine/achievements.js';
import { answerText } from '../../shared/math/check.js';
import { questionView } from '../components/question.js';
import { hud, hpBar, setBar, setHP, syncHP, useItem, enemyFor, monsterEl, avatarCanvas, petBadge, MAX_HP } from '../lib/game-ui.js';
import { sfx, startMusic } from '../lib/sound.js';
import { speak, stopSpeaking } from '../lib/voice.js';
import { navigate } from '../router.js';
import { personPortrait } from './capia-portrait.js';

const RUN = { n: 0 };

export async function lessonPage(root, levelId) {
  const level = LEVEL_BY_ID[levelId]; if (!level) { navigate('/map'); return; }
  const region = REGION_BY_ID[level.region]; const S = state();
  startMusic(region.music);
  const gaps = prereqGaps(S, levelId, 40);
  if (gaps.length && !S.game.skipGap?.[levelId]) { gapScreen(root, level, gaps); return; }
  intro(root, level, region);
}

/* ───── Aviso amable de prerrequisitos (nunca un bloqueo) ───── */
function gapScreen(root, level, gaps) {
  const g = gaps[0];
  mount(root, h('section.page.center', h('div.card.gap-card',
    h('div.capia-say', personPortrait('capia', { size: 150, expr: 'think' }), h('div.bubble', `Para completar esta misión necesitas fortalecer **${g.level.name}** (${g.pct}%).`.replace(/\*\*(.*?)\*\*/, '$1'))),
    h('div.btn-row',
      h('button.btn.good', { onclick: () => navigate('/lesson/' + g.id) }, '🟢 Practicar ahora'),
      h('button.btn.warn', { onclick: () => { (state().game.skipGap ||= {})[level.id] = true; save(); intro(root, level, REGION_BY_ID[level.region]); } }, '🟡 Continuar de todas formas'),
      h('button.btn.info', { onclick: () => explainModal(g.level) }, '🔵 Ver explicación')))));
}
function explainModal(level) {
  const body = h('div.stack', richEl(level.idea), level.formula && h('div.formula', { html: rich(`$$${level.formula.tex}$$`) }), level.formula && h('ul.symlist', level.formula.sym.map(([s, m]) => h('li', h('b', s), ' — ', m))));
  modal(body, { title: level.name });
}

/* ───── 1 · Descubre (teoría mínima + ejemplo) ───── */
function intro(root, level, region) {
  const th = THEOREMS_FOR_LEVEL(level.id)[0];
  const sample = level.gens[0].startsWith('project:') ? null : makeQuestion(level.gens[0], 7, 1);
  const exampleBox = h('div.example', sample && h('button.btn.ghost', { onclick: (e) => { e.target.replaceWith(h('div.stack', h('b', '📘 Ejemplo paso a paso'), richEl(sample.prompt), h('ol.steps', sample.steps.map((s) => h('li', { html: rich(s) }))), h('small', 'Ahora tú: en el combate cada ejercicio es nuevo.'))); sfx.click(); } }, '📘 Ver un ejemplo resuelto'));
  const enemy = enemyFor(level.id, level);
  const lines = [`${level.name}.`, level.idea, level.why || ''].filter(Boolean).join(' ');
  mount(root, h('section.page.lesson-intro',
    h('div.crumb', h('a', { href: '#/region/' + region.id }, `${region.icon} ${region.name}`), ' › ', `Nivel ${level.n}`),
    h('div.card.intro-card',
      h('div.intro-head', h('div', h('div.tag', level.boss ? '⚔️ JEFE' : `Nivel ${level.n} · ${region.subject}`), h('h1', level.name)), personPortrait('capia', { size: 120, expr: 'happy', outfit: state().profile.capiaOutfit })),
      h('div.sec', h('h3', '🎯 Objetivo'), richEl(level.idea)),
      level.why && h('div.sec', h('h3', '💡 ¿Por qué importa?'), richEl(level.why)),
      level.formula && h('div.sec', h('h3', '🧩 La pieza clave'), h('div.formula', { html: rich(`$$${level.formula.tex}$$`) }), level.formula.sym.length ? h('ul.symlist', level.formula.sym.map(([s, m]) => h('li', h('b', s), ' — ', m))) : null),
      exampleBox,
      th && h('button.btn.ghost', { onclick: () => theoremModal(th) }, `📜 Teorema: ${th.name}`),
      h('div.enemy-teaser', h('div.mini-m', monsterEl(enemy)), h('div', h('b', ENEMIES[enemy.id].name), h('p', `“${ENEMIES[enemy.id].tagline}”`), h('small', ENEMIES[enemy.id].weakness), enemy.hp < enemy.max && h('p.hurt', `Todavía le quedan ${enemy.hp}/${enemy.max} PV: te estaba esperando.`))),
      h('div.btn-row', h('button.btn.ghost', { onclick: () => speak(lines, { force: true }) }, '🔊 Escuchar'), h('button.btn.primary.big', { onclick: () => { stopSpeaking(); battle(root, level, region); } }, '⚔️ ¡A combatir!')))));
}
function theoremModal(t) {
  const body = h('div.stack.theorem',
    h('div.formula', { html: rich(`$$${t.formula}$$`) }),
    h('p', h('b', 'Historia: '), t.historia), h('p', h('b', 'Qué problema resuelve: '), t.problema), h('p', h('b', 'Intuición: '), t.intuicion),
    h('ul.symlist', t.simbolos.map(([s, m]) => h('li', h('b', s), ' — ', m))),
    h('h4', 'Demostración (adaptada)'), h('ol.steps', t.demostracion.map((x) => h('li', { html: rich(x) }))),
    h('p', h('b', 'Ejemplo: '), t.ejemplo), h('p', h('b', 'En ingeniería: '), t.ingenieria), h('p', h('b', 'Errores frecuentes:')), h('ul', t.errores.map((x) => h('li', x))));
  modal(body, { title: t.name, wide: true });
}

/* ───── 2 · Batalla ───── */
const WEAPON_NOTE = { espada: '+10% de daño', baculo: 'daño extra por racha', arco: 'extra contra la Duda', escudo: 'el primer error del combate no te hiere', libro: 'revela la pista 1 gratis', martillo: 'golpes críticos en cálculo y EDO', lanza: 'daño constante', orbe: '+5 XP al equivocarte' };

function battle(root, level, region) {
  const S = state(); const G = S.game;
  const enemy = enemyFor(level.id, level); const info = ENEMIES[enemy.id];
  const weapons = unlockedWeapons(S).map((w) => w.id);
  const run = { asked: 0, correct: 0, errors: 0, hints: 0, streak: 0, shield: weapons.includes('escudo'), q: null, proj: null, partIdx: 0, hintsUsed: 0, attempts: 0, full: false, paper: false, gen: null, start: Date.now(), bestStreak: 0, before: masteryOf(S, level.id).pct };
  const onlyProject = level.gens.every((g) => g.startsWith('project:'));
  const maxQ = level.boss ? 16 : 11;
  const dmgPer = Math.ceil(enemy.max / (level.boss ? 9 : 5));

  const enemyBar = hpBar(enemy.hp, enemy.max, { label: info.name, cls: 'enemy' });
  const meBar = hpBar(syncHP(), MAX_HP, { label: S.profile.name || 'Tú', cls: 'me' });
  const monster = monsterEl(enemy); const meC = avatarCanvas({ size: 220, frame: 'bust' });
  const bubble = h('div.bubble.small'); const capiaFace = personPortrait('capia', { size: 84, expr: 'happy', outfit: S.profile.capiaOutfit });
  const qBox = h('div.qpanel'); const actions = h('div.actions'); const hintBox = h('div.hintbox'); let hudEl = hud();
  const itemsEl = h('div.items');
  const say = (t, expr) => { bubble.innerHTML = rich(t); if (expr) capiaFace.__ctl?.setExpr?.(expr); };

  const renderItems = () => itemsEl.replaceChildren(
    h('button.item', { title: 'Curita: +15 de vida', disabled: G.items.curita <= 0, onclick: () => heal('curita') }, '🩹', h('b', G.items.curita)),
    h('button.item', { title: 'Venda: +35 de vida', disabled: G.items.venda <= 0, onclick: () => heal('venda') }, '🧻', h('b', G.items.venda)));
  function heal(kind) { const r = useItem(kind); if (!r.ok) { toast(r.msg, { icon: 'ℹ️' }); return; } setBar(meBar, G.hp, MAX_HP); floatText(meC, '+' + r.heal, 'heal'); renderItems(); refreshHud(); say('¡Mejor! Un poco de cuidado también es parte de estudiar.'); save(); }
  function refreshHud() { const n = hud(); hudEl.replaceWith(n); hudEl = n; }

  mount(root, h('section.page.arena-page',
    h('div.crumb', h('a', { href: '#/region/' + region.id }, `${region.icon} ${region.name}`), ' › ', level.name, level.boss ? ' · JEFE' : ''),
    hudEl,
    h('div.arena' + (level.boss ? '.boss' : ''), { style: { '--enemy': info.color } },
      h('div.side.foe', monster, enemyBar, h('p.taunt', `“${pick(info.taunt)}”`)),
      h('div.vs', 'VS'),
      h('div.side.me', h('div.me-stage', meC, petBadge(70)), meBar, h('div.weapons', weapons.slice(0, 4).map((w) => h('span.wp', { title: WEAPON_NOTE[w] }, WEAPONS.find((x) => x.id === w).icon))), itemsEl)),
    h('div.capia-line', capiaFace, bubble),
    qBox, hintBox, actions));
  renderItems();
  say(`**${info.name}** bloquea el camino. ¡Cada respuesta correcta lo debilita! ${CAPIA_SAYS.hintAsk}`);
  sfx.spawn();

  const hit = async (dmg, crit) => {
    monster.classList.add('hit'); sfx[crit ? 'crit' : 'hit'](); floatText(monster, '-' + dmg + (crit ? ' ¡CRÍTICO!' : ''), crit ? 'crit' : 'dmg');
    enemy.hp = Math.max(0, enemy.hp - dmg); setBar(enemyBar, enemy.hp, enemy.max); save();
    await wait(450); monster.classList.remove('hit');
  };
  const hurt = async (dmg) => {
    meC.classList.add('hurt'); sfx.hurt(); floatText(meC, '-' + dmg, 'dmg'); setHP(G.hp - dmg); setBar(meBar, G.hp, MAX_HP); refreshHud();
    await wait(450); meC.classList.remove('hurt');
  };

  function newQuestion(similarTo) {
    run.hintsUsed = 0; run.attempts = 0; run.full = false; run.paper = false; hintBox.replaceChildren(); run.asked += 1;
    let q; let seed;
    if (onlyProject) {
      if (!run.proj || run.partIdx >= run.proj.parts.length) { run.proj = makeProject(level.gens[(run.asked) % level.gens.length].slice(8), nextSeed(S, level.id)); run.partIdx = 0; }
      q = run.proj.parts[run.partIdx]; seed = run.proj.seed;
    } else {
      const ex = similarTo ? { spec: similarTo, seed: nextSeed(S, level.id), difficulty: adaptiveDifficulty(S, level.id) } : nextExercise(S, level.id);
      // los primeros ejercicios de cada combate son más amables
      const d = run.asked <= 2 ? Math.min(ex.difficulty, level.baseDiff) : ex.difficulty;
      q = makeQuestion(ex.spec, ex.seed, d); seed = ex.seed;
    }
    run.q = q; run.gen = q.gen; globalThis.__cap_q = q; // (depuración y pruebas automáticas)
    const view = questionView(q, { onSubmit: (v, res) => submit(view, q, v, res) });
    qBox.replaceChildren(
      run.proj && onlyProject && run.partIdx === 0 ? h('div.scenario', { html: rich('**' + run.proj.title + '.** ' + run.proj.scenario) }) : null,
      h('div.qmeta', h('span.pill', `Pregunta ${run.asked}`), q.difficulty ? h('span.pill.d' + q.difficulty, ['', 'Fácil', 'Media', 'Difícil'][q.difficulty]) : null),
      view.el);
    if (weapons.includes('libro') && run.hintsUsed === 0) { /* pista 1 gratuita disponible */ }
    renderActions(view, q); view.focus();
  }

  function renderActions(view, q) {
    const hintBtn = (n) => h('button.btn.ghost.sm', { onclick: () => showHint(n, q), disabled: n > run.hintsUsed + 1 }, `💡 Pista ${n}`);
    const paper = h('label.paper', h('input', { type: 'checkbox', onchange: (e) => { run.paper = e.target.checked; if (run.paper) say(CAPIA_SAYS.paper, 'think'); } }), ' ✍️ Resuélvelo en papel');
    actions.replaceChildren(
      h('div.hint-row', h('span.hl', CAPIA_SAYS.hintAsk), hintBtn(1), hintBtn(2), hintBtn(3), h('button.btn.ghost.sm', { onclick: () => showFull(view, q) }, '📖 Explicación completa')),
      h('div.hint-row', paper, h('button.btn.ghost.sm', { onclick: () => speak(q.prompt, { force: true }) }, '🔊 Leer'), h('button.btn.ghost.sm', { onclick: () => navigate('/capia') }, '🧠 Hablar con CAPIA')));
  }

  function showHint(n, q) {
    if (n > run.hintsUsed + 1) return;
    run.hintsUsed = Math.max(run.hintsUsed, n); run.hints += 1; sfx.click();
    const txt = q.hints[n - 1]; hintBox.append(h('div.hint', h('b', `Pista ${n}: `), h('span', { html: rich(txt) }))); say(txt, 'think'); speak(txt);
    renderActions(null, q);
  }
  function showFull(view, q) {
    run.full = true; run.hintsUsed = 3; sfx.click();
    hintBox.append(h('div.hint.full', h('b', '📖 Procedimiento'), h('ol.steps', q.steps.map((st) => h('li', { html: rich(st) }))), h('small', 'Ahora intenta uno parecido: así comprobamos que lo entendiste.'), h('button.btn.primary.sm', { onclick: () => newQuestion(q.gen) }, 'Probar uno parecido →')));
  }

  async function submit(view, q, value, res) {
    if (run.paper && !view.el.dataset.paperOk) {
      const ok = confirm('¿Ya escribiste el procedimiento en tu cuaderno?'); if (!ok) return; view.el.dataset.paperOk = '1';
    }
    view.lock(true); run.attempts += 1;
    const diag = res.diag;
    recordAttempt(S, { levelId: level.id, spec: q.gen, seed: q.seed, difficulty: q.difficulty, correct: res.ok, hints: run.hintsUsed, mode: level.boss ? 'boss' : 'lesson', qType: q.type, input: typeof value === 'object' ? JSON.stringify(value) : value, msg: diag?.msg || '', firstTry: run.attempts === 1 });
    if (res.ok) {
      run.correct += 1; run.streak += 1; run.bestStreak = Math.max(run.bestStreak, run.streak);
      if (run.paper) { S.stats.paper += 1; }
      let dmg = dmgPer; if (weapons.includes('espada')) dmg = Math.round(dmg * 1.1); if (weapons.includes('baculo')) dmg += run.streak * 2;
      if (run.hintsUsed >= 3) dmg = Math.round(dmg * 0.6); else if (run.hintsUsed === 2) dmg = Math.round(dmg * 0.8);
      const crit = run.streak >= 3 || (weapons.includes('martillo') && ['calculo', 'edo'].includes(level.region) && Math.random() < 0.25);
      if (crit) dmg = Math.round(dmg * 1.5); if (weapons.includes('arco') && enemy.id === 'duda') dmg += 8;
      sfx.correct(); capiaFace.__ctl?.anim?.('cheer');
      say(pick(CAPIA_SAYS.right), 'proud');
      view.feedback(h('div.fb.ok', h('b', '✔ ¡Correcto!'), res.note ? h('p', res.note) : null, h('details', h('summary', 'Ver el procedimiento'), h('ol.steps', q.steps.map((st) => h('li', { html: rich(st) }))))));
      await hit(dmg, crit);
      if (run.streak % 3 === 0) { G.items.curita += 1; toast('¡Racha! +1 curita 🩹', { icon: '🩹' }); sfx.coin(); renderItems(); save(); }
      refreshHud();
      if (enemy.hp <= 0) return victory();
      if (run.asked >= maxQ) return paused();
      if (onlyProject && run.proj) run.partIdx += 1;
      actions.replaceChildren(h('div.hint-row', h('button.btn.primary.big', { onclick: () => newQuestion() }, 'Siguiente ➜')));
    } else {
      run.errors += 1; run.streak = 0; capiaFace.__ctl?.anim?.('sad');
      sfx.wrong(); say(run.errors >= 3 ? CAPIA_SAYS.manyErrors : pick(CAPIA_SAYS.wrong), 'sad');
      let dmg = [20, 16, 12][Math.min(2, run.attempts - 1)]; if (S.profile.ageBand === 'under13') dmg = Math.round(dmg * 0.7);
      if (run.shield) { dmg = 0; run.shield = false; toast('🛡️ El Escudo de Pitágoras absorbió el golpe', { icon: '🛡️' }); }
      if (weapons.includes('orbe')) { S.xp += 5; }
      const stepsBlock = h('div.diag',
        h('b', diag?.msg ? '🔎 Encontramos el problema: ' : '🔎 Veamos qué pasó: '), diag?.msg ? h('span', { html: rich(diag.msg) }) : h('span', 'Tu respuesta no coincide. Revisa el procedimiento paso a paso.'),
        h('ol.steps', q.steps.map((st, i) => h('li', { class: diag?.step === i ? 'focus' : '', html: rich(st) }))),
        h('p.sol', h('b', 'Respuesta: '), answerText(q)),
        h('div.btn-row', h('button.btn.primary', { onclick: () => newQuestion(q.gen) }, 'Probar uno parecido →')));
      view.feedback(h('div.fb.bad', stepsBlock));
      if (dmg) await hurt(dmg); else refreshHud();
      if (G.hp <= 0) return defeat();
      if (run.errors >= 4) { say(CAPIA_SAYS.manyErrors + ' ¿Quieres que repasemos la explicación?', 'think'); }
      if (run.asked >= maxQ) return paused();
      if (run.attempts < 2) { const retry = h('button.btn.ghost', { onclick: () => { view.lock(false); view.clearInput(); view.feedback(''); view.focus(); } }, '↻ Reintentar esta'); stepsBlock.querySelector('.btn-row').prepend(retry); }
    }
  }

  async function victory() {
    sfx.victory(); monster.classList.add('dead'); say(`¡Derrotaste a ${info.name}! ${info.defeat}`, 'wow'); await wait(900);
    const sum = completeLesson(S, level.id, { correct: run.correct, total: run.asked, errors: run.errors, hints: run.hints, kind: level.boss ? 'boss' : 'lesson' });
    delete G.enemies[level.id];
    const shells = (level.boss ? 3 : 1) + (run.errors === 0 ? 1 : 0); G.shells += shells;
    const lootVenda = run.errors === 0 && run.asked >= 4; if (lootVenda) G.items.venda += 1;
    S.stats.minutes += Math.max(1, Math.round((Date.now() - run.start) / 60000));
    const fresh = checkAchievements(S); const unlocks = syncUnlocks(S);
    if (unlocks.length) fresh.push(...[]);
    save();
    results(root, level, region, { win: true, run, sum, shells, lootVenda, fresh, unlocks, enemy: info });
  }
  async function defeat() {
    sfx.defeat(); say(CAPIA_SAYS.stillNotCapia, 'sad'); await wait(700);
    enemy.hp = Math.min(enemy.max, enemy.hp + 10); G.items.curita += 1; setHP(30); save();
    S.stats.minutes += Math.max(1, Math.round((Date.now() - run.start) / 60000));
    results(root, level, region, { win: false, run, enemy: info, reason: 'hp' });
  }
  function paused() { enemy.hp = Math.min(enemy.max, enemy.hp + 5); save(); results(root, level, region, { win: false, run, enemy: info, reason: 'long' }); }

  newQuestion();
}

/* ───── 3 · Resultados ───── */
function results(root, level, region, r) {
  const S = state(); const name = S.profile.name || 'aventurero';
  const after = masteryOf(S, level.id);
  const next = region.levels[level.n] || null;
  const head = r.win
    ? h('div.res-head.win', h('div.confetti'), h('h1', '🎉 ¡LECCIÓN COMPLETADA!'), h('p.big', `¡Buen trabajo, ${name}!`), h('p', CAPIA_SAYS.lessonDone.replace('{name}', name).split('! ').slice(1).join('! ')))
    : h('div.res-head.lose', h('h1', '💙 TODAVÍA NO'), h('p', 'Es normal equivocarse.'), h('p', 'No significa que no puedas aprenderlo.'), h('p', 'Vamos a descubrir qué necesitas practicar.'));
  const wrong = S.errors.filter((e) => e.l === level.id).slice(-3);
  const list = h('ul.rewards');
  if (r.win) {
    list.append(h('li', `⭐ +${r.sum.xp} XP`), r.sum.pi ? h('li', `π +${r.sum.pi} PI`) : null, h('li', `🐚 +${r.shells} concha${r.shells > 1 ? 's' : ''} del acuario`), r.lootVenda ? h('li', '🧻 +1 venda por un combate sin errores') : null);
    r.sum.events.forEach((e) => { if (e.type === 'levelup') list.append(h('li.hl', `🚀 ¡Subiste al nivel ${e.level}!`)); if (e.type === 'mastered') list.append(h('li.hl', '🟣 ¡Habilidad dominada!')); if (e.type === 'boss') list.append(h('li.hl', `👑 ¡Región restaurada: ${region.name}!`)); if (e.type === 'perfect') list.append(h('li.hl', '💎 Lección perfecta')); });
    r.fresh.slice(0, 4).forEach((a) => list.append(h('li.hl', `${a.icon} Insignia: ${a.name}`))); if (r.fresh.length > 4) list.append(h('li.hl', `🏅 …y ${r.fresh.length - 4} insignias más (míralas en tu perfil)`));
    r.unlocks.forEach((u) => list.append(h('li.hl', u.type === 'mentor' ? '🧙 Nuevo mentor desbloqueado' : '🔐 ¡Zona secreta descubierta!')));
  } else list.append(h('li', r.reason === 'hp' ? 'Tu vida llegó a 0: recuperaste 30 PV y 1 curita.' : 'Combate largo: descansa y vuelve.'), h('li', `${r.enemy.name} sigue ahí con sus PV; no aparece otro hasta que lo derrotes.`));
  mount(root, h('section.page.results',
    h('div.card', head,
      h('div.res-grid',
        h('div', h('h3', 'Resumen'), h('p', `✅ ${r.run.correct} correctas · ❌ ${r.run.errors} errores · 💡 ${r.run.hints} pistas · 🔥 mejor racha ${r.run.bestStreak}`), list),
        h('div', h('h3', 'Tu dominio'), h('div.mastery', h('b', `${after.stage.icon} ${after.stage.name}`), h('div.bar', h('i', { style: { width: after.pct + '%' } })), h('small', `${r.run.before}% → ${after.pct}%`)), after.capped ? h('small', after.capped) : null,
          wrong.length ? h('div', h('h4', 'Para repasar'), h('ul', wrong.map((e) => h('li', e.msg || 'Revisa el procedimiento paso a paso.')))) : null)),
      h('div.capia-say', personPortrait('capia', { size: 130, expr: r.win ? 'proud' : 'sad', outfit: S.profile.capiaOutfit }), h('div.bubble', r.win ? CAPIA_SAYS.lessonDoneCapia : CAPIA_SAYS.stillNotCapia)),
      h('div.btn-row',
        r.win && next ? h('button.btn.primary.big', { onclick: () => navigate('/lesson/' + next.id) }, 'Siguiente misión ➜') : null,
        h('button.btn.good', { onclick: () => navigate('/lesson/' + level.id) }, r.win ? '↻ Otra vez' : '⚔️ Volver a intentarlo'),
        S.game.shells > 0 ? h('button.btn.warn', { onclick: () => navigate('/aquarium') }, `🐚 Abrir concha (${S.game.shells})`) : null, h('button.btn.ghost', { onclick: () => navigate('/region/' + region.id) }, '🌌 Volver a la región')))));
  if (r.win) { speak(CAPIA_SAYS.lessonDoneCapia); if (r.sum.events.some((e) => e.type === 'levelup')) sfx.levelup(); } else speak(CAPIA_SAYS.stillNotCapia);
}
