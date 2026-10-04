// CAPIA: compañera de estudio con inteligencia emocional. Socrática, por voz y texto, lee documentos, revisa fotos y acompaña.
import { h, mount, toast, modal, wait } from '../lib/dom.js';
import { rich, richEl, tex } from '../lib/rich.js';
import { state, save } from '../lib/store.js';
import { detectEmotion, toneFor, analyzeProblem, derive, factorQuadratic, bestLevelFor, explainEntry, askClaude, summarize, cardsFrom, keywordsOf, detectTopics } from '../lib/tutor.js';
import { makeQuestion } from '../../shared/content/generators.js';
import { equivalent, evalNumber, parse } from '../../shared/math/expr.js';
import { questionView } from '../components/question.js';
import { recordAttempt, dayKey } from '../../shared/engine/game.js';
import { personPortrait } from './capia-portrait.js';
import { speak, stopSpeaking, listen, listenAvailable, pauseSpeaking, resumeSpeaking, setVoice, isSpeaking, voiceAvailable, clean } from '../lib/voice.js';
import { pomodoroPanel } from '../lib/pomodoro.js';
import { navigate } from '../router.js';
import { sfx, startMusic } from '../lib/sound.js';
import { LEVEL_BY_ID, REGION_BY_ID } from '../../shared/content/regions.js';
import { webSearch } from '../lib/search.js';
import { extractPdf } from '../lib/pdf.js';

const MEM = { msgs: [], problem: null, doc: null, image: null };

export function capiaPage(root) {
  const S = state(); const name = S.profile.name || 'amig@'; startMusic('calm');
  const face = personPortrait('capia', { size: 300, expr: 'happy', outfit: S.profile.capiaOutfit, drag: true });
  const emoChip = h('span.emo', '😌 Tranquila'); const log = h('div.chat-log', { 'aria-live': 'polite' });
  const input = h('textarea', { rows: 1, placeholder: 'Escríbele a CAPIA… (Enter para enviar)', 'aria-label': 'Mensaje para CAPIA', onkeydown: (e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send(); } }, oninput: () => { input.style.height = 'auto'; input.style.height = Math.min(120, input.scrollHeight) + 'px'; } });
  const socratic = h('input', { type: 'checkbox', checked: true, id: 'soc' });
  const voiceOn = h('input', { type: 'checkbox', checked: S.settings.voice, onchange: (e) => { S.settings.voice = e.target.checked; setVoice({ on: e.target.checked }); if (!e.target.checked) stopSpeaking(); save(); } });
  const docPanel = h('div.doc-panel', { hidden: true });
  let micRec = null;

  const add = (who, html, { node, speakText } = {}) => {
    const m = h('div.msg.' + who, who === 'capia' ? h('div.mface', '🩷') : null, h('div.mbody', node || h('div', { html: rich(html) })));
    log.append(m); log.scrollTop = log.scrollHeight; m.scrollIntoView({ block: 'end', behavior: 'smooth' });
    MEM.msgs.push({ role: who, text: html });
    if (who === 'capia' && (speakText ?? html)) speak(speakText ?? html);
    return m;
  };
  const setFace = (emo) => { const map = { frustracion: ['sad', '🫂 Te acompaño'], ansiedad: ['think', '🌿 Con calma'], tristeza: ['sad', '🫂 Aquí contigo'], alegria: ['wow', '🎉 ¡Qué alegría!'], motivacion: ['proud', '🔥 ¡Vamos!'], neutral: ['happy', '😌 Tranquila'] }; const [e, t] = map[emo] || map.neutral; face.__ctl?.setExpr(e); emoChip.textContent = t; if (emo === 'alegria') face.__ctl?.anim('cheer'); };

  /* ───── Ejercicio dentro del chat ───── */
  function inlineExercise(spec, levelId) {
    const q = makeQuestion(spec, Math.floor(Math.random() * 99999) + 1, 1);
    let hints = 0; let tries = 0;
    const view = questionView(q, { onSubmit: (v, res) => {
      tries += 1; view.lock(true); recordAttempt(S, { levelId: levelId || 'aritmetica.1', spec: q.gen, seed: q.seed, difficulty: q.difficulty, correct: res.ok, hints, mode: 'practice', qType: q.type, input: String(v), msg: res.diag?.msg || '' }); save();
      if (res.ok) { sfx.correct(); setFace('alegria'); view.feedback(h('div.fb.ok', '✔ ¡Exacto! Mira cómo encajan todas las piezas.', h('details', h('summary', 'Ver procedimiento'), h('ol.steps', q.steps.map((s) => h('li', { html: rich(s) })))))); }
      else { sfx.wrong(); setFace('frustracion'); view.feedback(h('div.fb.bad', h('b', '¡Espera! Acabamos de encontrar una pista. '), res.diag?.msg ? h('span', { html: rich(res.diag.msg) }) : 'Revisa el procedimiento.', h('ol.steps', q.steps.map((s) => h('li', { html: rich(s) }))), h('button.btn.ghost.sm', { onclick: () => { view.lock(false); view.clearInput(); view.feedback(''); } }, '↻ Reintentar'))); }
    } });
    const hintBtns = h('div.hint-row', [1, 2, 3].map((n) => h('button.btn.ghost.sm', { onclick: (e) => { hints = Math.max(hints, n); e.target.replaceWith(h('div.hint', h('b', `Pista ${n}: `), h('span', { html: rich(q.hints[n - 1]) }))); } }, `💡 Pista ${n}`)));
    return h('div.inline-ex', h('b', '🎯 Ejercicio para ti'), view.el, hintBtns);
  }

  /* ───── Procesamiento del mensaje ───── */
  async function respond(text, image) {
    const emo = detectEmotion(text); setFace(emo); const tone = toneFor(emo);
    const lc = text.toLowerCase().trim();
    // 1) respuesta a un problema socrático en curso
    if (MEM.problem && !/^(no sé|no se|pista|ayuda|solución|solucion)/.test(lc)) {
      const P = MEM.problem; let val = null; try { val = evalNumber(text.replace(/^x\s*=\s*/i, '').replace(/^[a-z]\s*=\s*/i, '')); } catch { /* no es un número */ }
      if (val !== null) {
        P.attempts += 1; const ok = P.answer.some((a) => Math.abs(a - val) < 1e-6);
        if (ok) { MEM.problem = null; S.stats.selfFixed += P.attempts > 1 ? 1 : 0; save(); setFace('alegria'); return { text: `¡Exactamente! **${text.trim()}** es correcto. Mira cómo encajan todas las piezas. ¿Puedes comprobarlo sustituyendo?\n\n¿Quieres que te ponga uno parecido?`, actions: [['Sí, uno parecido', () => send('uno parecido')]] }; }
        const g = P.guide[Math.min(P.attempts - 1, P.guide.length - 1)];
        return { text: `${P.attempts >= 2 ? 'Tu error nos está mostrando qué practicar. ' : 'Casi. Acabamos de encontrar una pista. '}${g}`, actions: P.attempts >= 2 ? [['Mostrar procedimiento', () => showSolution()]] : [] };
      }
    }
    if (/^(solución|solucion|muéstrame|muestrame|dame la respuesta)/.test(lc) && MEM.problem) return { text: '', actions: [], run: () => showSolution() };
    // 2) con clave de IA, las preguntas abiertas van a Claude
    const key = S.game.apiKey;
    const local = routeLocal(text, lc);
    if (key && !local?.final) {
      try { const ctx = `Nombre: ${name}. Nivel ${S.xp} XP. Mentor: ${S.profile.mentor}. Materia elegida: ${S.game.subject}. Modo socrático: ${socratic.checked ? 'sí' : 'no'}.`; const out = await askClaude({ key, messages: MEM.msgs.concat([{ role: 'user', text }]), emotion: emo, context: ctx, image }); return { text: out, source: 'ia' }; }
      catch (e) { toast(e.message, { icon: '⚠️', ms: 5000 }); }
    }
    if (image && !key) return { text: 'Veo que subiste una foto 📷. Para **leer** ejercicios en imágenes necesito la IA conectada (Perfil → Ajustes → clave de IA). Mientras tanto, **escríbeme el enunciado** y lo resolvemos paso a paso: yo te guío con preguntas.', final: true };
    const r = await local;
    return { ...r, text: (tone ? tone + '\n\n' : '') + (r?.text || '') };
  }

  function routeLocal(text, lc) {
    return (async () => {
      if (/^(hola|buenas|hey|holi)/.test(lc)) return { text: `¡Hola, ${name}! Soy CAPIA. Podemos practicar un tema, resolver un ejercicio paso a paso, preparar tu parcial o simplemente estudiar juntas. ¿Por dónde empezamos?`, final: true };
      if (/gracias|genial|excelente/.test(lc) && lc.length < 40) return { text: '¡Con gusto! Estoy orgullosa de tu esfuerzo. ¿Seguimos con la siguiente?', final: true };
      if (/pomodoro|pausa activa|descansar|cansad/.test(lc)) { setTimeout(() => modal(pomodoroPanel(), { title: '🍅 Pomodoro con CAPIA' }), 300); return { text: 'Te propongo la técnica Pomodoro: 50 minutos de estudio y 10 de descanso con una pausa activa. Te abro el temporizador.', final: true }; }
      if (/\b(buscar|busca|internet|noticias?|última|reciente)\b/.test(lc)) { const q = text.replace(/^(busca|buscar|búscame|buscame)\s*(en internet)?\s*/i, ''); return { text: 'Buscando… 🌐', search: q, final: true }; }
      if (/plan|parcial|examen|entrega|tarea/.test(lc) && /(estudi|prepar|plan|calendario|cuando|fecha)/.test(lc)) return { text: 'Cuéntame **qué materia**, **qué temas** entran y **para cuándo** es el parcial; yo armo el plan con repasos espaciados, simulacros y días de descanso. Lo puedes hacer en el 📅 calendario.', actions: [['📅 Abrir calendario', () => navigate('/calendar')]], final: true };
      if (/(leer|lee).*(voz|alto)|en voz alta/.test(lc)) return MEM.doc ? { text: 'Claro, empiezo a leer tu documento.', run: () => readDoc(0), final: true } : { text: 'Sube un PDF con el botón 📄 y lo leo en voz alta con controles de pausa y velocidad.', final: true };
      if (/^(deriva|derivada de|derivar)/.test(lc)) { const d = derive(text); if (d) return { text: `Te guío: la derivada de $${d.f}$ se obtiene con la **regla de la potencia** y las reglas del producto/cadena que correspondan.\n\nPrimero intenta tú: ¿qué regla aplicas a cada término? Cuando lo tengas, comprueba con la mía:\n\n$$\\frac{d}{dx}\\left(${d.f}\\right) = ${d.d}$$`, final: true }; }
      if (/^factoriz/.test(lc)) { const f = factorQuadratic(text); if (f && !f.none) return { text: `Pista socrática: busca dos números que **multipliquen** a ${f.k / f.a} y **sumen** ${f.b / f.a}. ¿Cuáles son?\n\nSi ya lo intentaste, esta es la factorización: $${f.tex}$ (raíces ${f.r1} y ${f.r2}).`, final: true }; if (f?.none) return { text: 'Esa expresión no se factoriza con enteros; usaría la fórmula general. ¿Calculamos el discriminante juntas?', final: true }; }
      if (/^(explica|explícame|explicame|qué es|que es|qué son|que son|defin|cuéntame|háblame)/.test(lc)) { const e = explainEntry(text); if (e) return { text: explain(e), actions: [['📖 Ver en el códice', () => navigate('/codex/' + e.id)], e.ejercicio ? ['🎯 Practicar', () => { const lv = bestLevelFor(e.title); lv ? navigate('/lesson/' + lv.id) : add('capia', '', { node: inlineExercise(e.ejercicio) }); }] : null].filter(Boolean), final: true }; }
      if (/practic|ejercicio|quiz|pregúntame|preguntame|ponme|dame (uno|ejercicios)|uno parecido/.test(lc)) {
        const lv = /parecido|pregúntame|preguntame|quiz/.test(lc) && MEM.lastLevel ? MEM.lastLevel : bestLevelFor(text);
        if (lv) { MEM.lastLevel = lv; const spec = lv.gens.find((g) => !g.startsWith('project:')); return { text: `Vamos con **${lv.name}**. Intenta este y dime qué te pareció; si quieres una pista, pídela sin pena.`, node: spec ? inlineExercise(spec, lv.id) : null, actions: [['⚔️ Combatir en la lección', () => navigate('/lesson/' + lv.id)]], final: true }; }
        return { text: '¿De qué tema quieres practicar? Por ejemplo: “quiero practicar factorización”, “fracciones” o “derivadas”.', final: true };
      }
      const prob = analyzeProblem(text);
      if (prob && prob.guide) {
        MEM.problem = { ...prob, attempts: 0 };
        return { text: socratic.checked ? `Resolvámoslo juntas. No te daré la respuesta de golpe: tú llegas a ella.\n\n**${prob.guide[0]}**\n\n${prob.ask}` : `Procedimiento:\n${prob.steps.map((s, i) => `${i + 1}. ${s}`).join('\n')}`, final: true };
      }
      if (prob?.kind === 'expr') return { text: `Tengo una expresión con ${prob.vars.join(', ')}. ¿Qué quieres hacer con ella: **simplificar**, **derivar**, **evaluar** en un valor o **factorizar**? Cuéntame y vamos paso a paso.`, final: true };
      if (/estoy (frustrad|ansios|nervios)|no entiendo|no puedo/.test(lc)) return { text: 'Cuéntame en qué punto exacto te perdiste: ¿es el enunciado, el método o los cálculos? Con eso te doy una pista pequeña.', final: true };
      return { text: 'Puedo ayudarte con eso, pero no estoy segura de haber entendido. Prueba con:\n• “Explícame la derivada”\n• “Quiero practicar fracciones”\n• “Resuelve 3x + 5 = 20”\n• “Busca en internet agujeros negros”\n\n💡 Si conectas una clave de IA en Perfil → Ajustes, podré conversar de forma abierta sobre cualquier tema.', final: false };
    })();
  }
  const explain = (e) => `**${e.title}**\n${e.def}\n${e.intuicion ? '\n💡 ' + e.intuicion : ''}${e.formula ? `\n\n$$${e.formula}$$` : ''}${(e.simbolos || []).length ? '\n' + e.simbolos.map(([s, m]) => `• **${s}**: ${m}`).join('\n') : ''}${e.aplicaciones?.[0] ? `\n\n🌍 Aplicación: ${e.aplicaciones[0]}` : ''}`;
  function showSolution() { const P = MEM.problem; if (!P) return; MEM.problem = null; add('capia', `Este es el procedimiento (compáralo con lo que intentaste):\n${P.steps.map((s, i) => `${i + 1}. ${s}`).join('\n')}\n\nAhora intenta uno parecido tú solo/a. ✍️`); }

  async function send(forced) {
    const text = (forced ?? input.value).trim(); if (!text && !MEM.image) return; input.value = ''; input.style.height = 'auto';
    if (text) add('user', text.replace(/</g, '&lt;'), { speakText: '' });
    const typing = h('div.msg.capia.typing', h('div.mface', '🩷'), h('div.mbody', '…')); log.append(typing); log.scrollTop = log.scrollHeight;
    const img = MEM.image; MEM.image = null; photoPrev.replaceChildren();
    await wait(350);
    let r; try { r = await respond(text || 'Revisa este ejercicio de mi foto', img); } catch (e) { r = { text: 'Ups, algo falló: ' + e.message }; }
    typing.remove();
    if (r.search !== undefined) { const m = add('capia', 'Buscando en internet… 🌐', { speakText: '' }); try { const res = await webSearch(r.search); S.stats.searches += 1; save(); m.querySelector('.mbody').replaceChildren(searchResults(r.search, res)); } catch (e) { m.querySelector('.mbody').textContent = 'No pude conectarme a internet: ' + e.message; } return; }
    if (r.text) { const m = add('capia', r.text, { node: undefined }); const body = m.querySelector('.mbody'); if (r.node) body.append(r.node); if (r.actions?.length) body.append(h('div.btn-row', r.actions.map(([t, fn]) => h('button.btn.ghost.sm', { onclick: fn }, t)))); if (r.source === 'ia') body.append(h('small.src', '🤖 Respuesta de la IA conectada')); }
    r.run?.();
  }
  function searchResults(q, res) {
    return h('div.stack', h('b', `🌐 Resultados para “${q}”`), h('small', '📜 = enciclopédica/histórica (Wikipedia) · 📰 = actual. Verifica siempre las fuentes.'), res.map((x) => h('a.src-card', { href: x.url, target: '_blank', rel: 'noopener noreferrer' }, h('b', `${x.kind === 'actual' ? '📰' : '📜'} ${x.title}`), h('small', x.snippet), h('em', x.source))));
  }

  /* ───── Foto de ejercicio ───── */
  const photoPrev = h('div.photo-prev');
  const fileImg = h('input', { type: 'file', accept: 'image/*', hidden: true, onchange: async (e) => { const f = e.target.files[0]; if (!f) return; const data = await new Promise((r) => { const fr = new FileReader(); fr.onload = () => r(fr.result); fr.readAsDataURL(f); }); MEM.image = { type: f.type || 'image/jpeg', data: data.split(',')[1] }; S.stats.photos += 1; save(); photoPrev.replaceChildren(h('img', { src: data, alt: 'Foto del ejercicio' }), h('button.x', { onclick: () => { MEM.image = null; photoPrev.replaceChildren(); } }, '✕')); input.focus(); toast('Foto lista: escribe tu pregunta o toca enviar', { icon: '📷' }); } });
  const filePdf = h('input', { type: 'file', accept: 'application/pdf', hidden: true, onchange: (e) => e.target.files[0] && loadPdf(e.target.files[0]) });

  /* ───── PDF: resumen, tarjetas, preguntas y lectura en voz alta ───── */
  async function loadPdf(file) {
    add('capia', `Estoy leyendo **${file.name}**… 📄`, { speakText: '' });
    try {
      const doc = await extractPdf(file); MEM.doc = doc; S.stats.pdfs += 1; save();
      const topics = detectTopics(doc.text); const kws = keywordsOf(doc.text, 8);
      docPanel.hidden = false;
      docPanel.replaceChildren(h('div.doc-head', h('b', `📄 ${file.name}`), h('small', `${doc.pages} páginas · ${doc.text.length.toLocaleString('es')} caracteres`), h('button.x', { onclick: () => { MEM.doc = null; docPanel.hidden = true; stopSpeaking(); } }, '✕')),
        topics.length ? h('small', 'Temas detectados: ' + topics.map((t) => t.name).join(', ')) : null,
        h('div.btn-row', h('button.btn.ghost.sm', { onclick: () => docSummary() }, '📝 Resumir'), h('button.btn.ghost.sm', { onclick: () => docCards() }, '🃏 Tarjetas'), h('button.btn.ghost.sm', { onclick: () => docQuiz() }, '❓ Preguntas'), h('button.btn.ghost.sm', { onclick: () => docMap(kws) }, '🕸️ Mapa de ideas'), h('button.btn.primary.sm', { onclick: () => readDoc(0) }, '▶ Leer en voz alta')),
        h('small.fine', 'Tu documento se procesa en tu dispositivo y no se comparte. Respeta los derechos de autor: no redistribuyas material protegido.'));
      add('capia', `Listo. **${file.name}** tiene ${doc.pages} páginas. Pídeme un resumen, tarjetas, preguntas o que te lo lea en voz alta mientras tomas notas.`);
    } catch (e) { add('capia', 'No pude leer ese PDF: ' + e.message, { speakText: '' }); }
  }
  const docSummary = () => { const s = summarize(MEM.doc.text, 6); add('capia', s.length ? '**Resumen de tu documento:**\n' + s.map((x) => '• ' + x).join('\n') : 'No encontré suficiente texto para resumir (¿es un PDF escaneado?).'); };
  const docCards = () => { const c = cardsFrom(MEM.doc.text, 10); c.forEach((k, i) => { S.game.cards['doc:' + Date.now() + i] = { front: k.front, back: k.back, srs: null, src: 'PDF' }; }); save(); add('capia', c.length ? `Creé **${c.length} tarjetas** de memoria (recuperación activa). Las encuentras en 📖 Códice → Tarjetas.` : 'No pude generar tarjetas de ese texto.', { node: undefined }); };
  const docQuiz = () => { const c = cardsFrom(MEM.doc.text, 5); if (!c.length) { add('capia', 'No hay suficiente texto para preguntas.'); return; } let i = 0; const box = h('div.inline-ex'); const nextQ = () => { if (i >= c.length) { box.replaceChildren(h('b', '¡Terminaste! 🎉')); return; } const k = c[i]; const inp = h('input', { placeholder: 'Completa el espacio' }); const out = h('div'); box.replaceChildren(h('b', `Pregunta ${i + 1}/${c.length}`), h('p', k.front), inp, h('button.btn.primary.sm', { onclick: () => { const ok = inp.value.trim().toLowerCase() === k.back; out.replaceChildren(h('div.fb.' + (ok ? 'ok' : 'bad'), ok ? '¡Correcto!' : `La palabra era: ${k.back}`)); setTimeout(() => { i += 1; nextQ(); }, 1300); } }, 'Comprobar'), out); }; nextQ(); add('capia', 'Completa las ideas clave de tu documento:', { node: box, speakText: '' }); };
  const docMap = (kws) => add('capia', '', { node: h('div.conceptmap', h('div.cm-center', MEM.doc ? 'Tu documento' : ''), kws.map((k, i) => h('span.cm-node', { style: { '--a': (i / kws.length) * 360 + 'deg' } }, k))), speakText: '' });

  /* Lector en voz alta con controles */
  const reader = { chunks: [], i: 0, playing: false };
  function readDoc(from = 0) {
    if (!MEM.doc) return; if (!reader.chunks.length || from === 0) reader.chunks = MEM.doc.text.replace(/\s+/g, ' ').match(/[^.!?]{1,260}[.!?]?/g) || [];
    reader.i = from; reader.playing = true; renderReader(); readNext();
  }
  function readNext() {
    if (!reader.playing || reader.i >= reader.chunks.length) { reader.playing = false; renderReader(); return; }
    speak(reader.chunks[reader.i], { force: true, onend: () => { if (reader.playing) { reader.i += 1; readNext(); } } }); renderReader();
  }
  function renderReader() {
    const el = h('div.reader', h('small', `Leyendo ${Math.min(reader.i + 1, reader.chunks.length)} / ${reader.chunks.length}`), h('p.rtext', reader.chunks[reader.i] || ''),
      h('div.btn-row', h('button.btn.ghost.sm', { onclick: () => { stopSpeaking(); reader.playing = true; reader.i = Math.max(0, reader.i - 3); readNext(); } }, '⏪'), h('button.btn.primary.sm', { onclick: () => { if (reader.playing) { reader.playing = false; stopSpeaking(); } else { reader.playing = true; readNext(); } renderReader(); } }, reader.playing ? '⏸ Pausa' : '▶ Seguir'), h('button.btn.ghost.sm', { onclick: () => { stopSpeaking(); reader.playing = true; reader.i = Math.min(reader.chunks.length - 1, reader.i + 3); readNext(); } }, '⏩'),
        h('label.field.inline', '🐢⚡', h('select', { onchange: (e) => { setVoice({ rate: +e.target.value }); S.settings.rate = +e.target.value; save(); } }, [0.7, 0.85, 1, 1.2, 1.5].map((v) => h('option', { value: v, selected: v === (S.settings.rate || 1) }, v + '×')))),
        h('label.field.inline', '🔊', h('input', { type: 'range', min: 0, max: 1, step: 0.1, value: S.settings.volume, oninput: (e) => { setVoice({ volume: +e.target.value }); } }))));
    const old = docPanel.querySelector('.reader'); old ? old.replaceWith(el) : docPanel.append(el);
  }

  /* ───── Micrófono: toque único o conversación continua ───── */
  const FATAL = ['not-allowed', 'service-not-allowed', 'audio-capture', 'network', 'unsupported'];
  let talking = false;
  const endTalk = (msg) => { talking = false; talkBtn.classList.remove('rec'); talkBtn.textContent = '🎧 Conversar'; micBtn.classList.remove('rec'); try { micRec?.abort?.(); } catch { /* ya cerrado */ } micRec = null; if (msg) toast(msg, { icon: '🎧' }); };
  const waitSilence = () => new Promise((res) => { let quiet = 0; const t = setInterval(() => { quiet = isSpeaking() ? 0 : quiet + 1; if (quiet >= 2 || !talking || !root.isConnected) { clearInterval(t); res(); } }, 250); });
  async function turn(retries = 0) {
    if (!talking || !root.isConnected) { endTalk(); return; }
    if (!listenAvailable()) { endTalk('Tu navegador no ofrece reconocimiento de voz. Usa Chrome.'); return; }
    micBtn.classList.add('rec'); let heard = '';
    micRec = listen({
      onresult: (t) => { heard = t; input.value = t; },
      onend: async () => {
        micRec = null; micBtn.classList.remove('rec'); if (!talking) return;
        const said = heard.trim(); input.value = '';
        if (!said) { if (retries >= 3) { endTalk('Pausé la conversación porque no te escuché. Toca 🎧 para seguir.'); return; } turn(retries + 1); return; }
        if (/^(para|detente|detén|basta|terminar|adiós|chao)\b/i.test(said)) { endTalk('Conversación terminada. ¡Aquí estaré!'); add('capia', '¡Hasta pronto! 🩷 Cuando quieras, seguimos.'); return; }
        S.stats.voice += 1; await send(said); await waitSilence(); if (talking) turn(0);
      },
      onerror: (e) => { micRec = null; micBtn.classList.remove('rec'); if (FATAL.includes(e.code)) endTalk(e.message); else if (e.code !== 'aborted') toast(e.message, { icon: '🎙️' }); },
    });
  }
  addEventListener('hashchange', () => { if (talking && !root.isConnected) { stopSpeaking(); endTalk(); } });
  const talkBtn = h('button.btn.primary.sm', { title: 'Habla y CAPIA te escucha y responde enseguida, sin tocar nada', 'aria-label': 'Conversar por voz', onclick: () => {
    if (talking) { stopSpeaking(); endTalk('Conversación terminada'); return; }
    if (!listenAvailable() || !voiceAvailable()) { toast('Tu navegador no ofrece voz. Usa Chrome o Edge.', { icon: '🎙️' }); return; }
    talking = true; setVoice({ on: true }); talkBtn.classList.add('rec'); talkBtn.textContent = '⏹ Terminar'; stopSpeaking();
    toast('Te escucho. Habla con normalidad; di “para” para terminar.', { icon: '🎧' }); turn(0);
  } }, '🎧 Conversar');
  const micBtn = h('button.btn.ghost.sm', { title: 'Dictar un mensaje (puedes interrumpir a CAPIA)', 'aria-label': 'Dictar', onclick: () => {
    if (talking) return;
    if (micRec) { micRec.stop(); return; }
    micBtn.classList.add('rec'); S.stats.voice += 1;
    micRec = listen({ onresult: (t, fin) => { input.value = t; if (fin) { micRec = null; micBtn.classList.remove('rec'); send(); } }, onend: () => { micRec = null; micBtn.classList.remove('rec'); }, onerror: (e) => { micRec = null; micBtn.classList.remove('rec'); toast(e.message, { icon: '🎙️' }); } });
  } }, '🎙️');

  const chips = ['Explícame la derivada', 'Quiero practicar factorización', 'Resuelve 3x + 5 = 20', 'Estoy nervioso por mi parcial', 'Pregúntame algo', 'Dame una pausa activa'];
  mount(root, h('section.page.capia-page',
    h('aside.capia-side', h('div.card.capia-card', face, h('h2', 'CAPIA'), emoChip, h('p.sub', 'Tu compañera de estudio. Nunca te juzga.'),
      h('label.check', socratic, ' Modo socrático (te guía, no te da la respuesta)'), h('label.check', voiceOn, ' Voz de CAPIA'),
      h('div.btn-row', talkBtn, micBtn, h('button.btn.ghost.sm', { onclick: () => fileImg.click(), title: 'Subir foto de un ejercicio' }, '📷 Foto'), h('button.btn.ghost.sm', { onclick: () => filePdf.click(), title: 'Subir PDF' }, '📄 PDF'), h('button.btn.ghost.sm', { onclick: () => modal(pomodoroPanel(), { title: '🍅 Pomodoro con CAPIA' }) }, '🍅'), h('button.btn.ghost.sm', { onclick: () => stopSpeaking() }, '🔇')),
      !S.game.apiKey ? h('small.fine', '🤖 Modo local activo. Para conversación abierta y lectura de fotos, añade tu clave de IA en Perfil → Ajustes.') : h('small.ok', '🤖 IA conectada'), fileImg, filePdf)),
    h('div.chat', docPanel, log, photoPrev, h('div.chips', chips.map((c) => h('button.chip', { onclick: () => send(c) }, c))), h('div.composer', input, h('button.btn.primary', { onclick: () => send(), 'aria-label': 'Enviar' }, '➤')))));

  if (!MEM.msgs.length) {
    const goals = S.game.subject ? `Veo que quieres dominar **${REGION_BY_ID[S.game.subject].subject}**. Recuerda tu porqué: cada paso pequeño te acerca a ser quien quieres ser.` : '';
    add('capia', `¡Hola, ${name}! Soy CAPIA 🩷 Estoy aquí para estudiar contigo, sin prisa y sin juzgar. ${goals}\n\nPuedo explicarte conceptos, guiarte paso a paso en un ejercicio (con preguntas, no con respuestas regaladas), leer tus PDF en voz alta y acompañarte con Pomodoro. ¿Qué hacemos hoy?`);
  } else MEM.msgs.forEach((m) => log.append(h('div.msg.' + m.role, m.role === 'capia' ? h('div.mface', '🩷') : null, h('div.mbody', { html: rich(m.text) }))));
  setTimeout(() => face.__ctl?.anim('wave'), 400);
}
