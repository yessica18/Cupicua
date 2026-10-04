// Comunidad y salas de estudio. Funciona sin servidor: retos por código, pizarra, Pomodoro y llamadas WebRTC entre dos personas
// intercambiando un código (así no hay desconocidos). Las salas multiusuario en tiempo real requieren un servidor (ver LEEME).
import { h, mount, toast, modal } from '../lib/dom.js';
import { rich, richEl } from '../lib/rich.js';
import { state, save } from '../lib/store.js';
import { pomodoroPanel } from '../lib/pomodoro.js';
import { createBoard } from '../components/board.js';
import { makeQuestion, makeProject } from '../../shared/content/generators.js';
import { ALL_LEVELS, LEVEL_BY_ID, REGION_BY_ID } from '../../shared/content/regions.js';
import { questionView } from '../components/question.js';
import { recordAttempt, addXP } from '../../shared/engine/game.js';
import { personPortrait } from './capia-portrait.js';
import { sfx, startMusic } from '../lib/sound.js';
import { navigate } from '../router.js';

let tab = 'sala';
export function communityPage(root) {
  startMusic('calm'); const S = state();
  const body = h('div.comm-body');
  const tabs = h('div.tabs', [['sala', '🏫 Mi sala de estudio'], ['reto', '⚔️ Retos con amigos'], ['llamada', '📞 Llamada y pizarra'], ['seguridad', '🛡️ Seguridad']].map(([k, t]) => h('button.chip' + (k === tab ? '.on' : ''), { onclick: (e) => { tab = k; [...tabs.children].forEach((x) => x.classList.toggle('on', x === e.currentTarget)); show(); } }, t)));
  const show = () => body.replaceChildren(({ sala, reto, llamada, seguridad })[tab]());
  mount(root, h('section.page.comm', h('h1', '👥 Comunidad y salas'), h('p.sub', 'Estudiar acompañado rinde más. Aquí el foco es aprender juntos, no competir por popularidad.'), tabs, body)); show();
}

/* ───── Sala personal ───── */
function sala() {
  const S = state(); const board = createBoard(); const note = h('textarea', { rows: 6, placeholder: 'Notas de la sesión…', value: S.game.notes || '', oninput: (e) => { S.game.notes = e.target.value; save(); }, 'aria-label': 'Notas' });
  return h('div.grid.two', h('div.card', h('h3', '🍅 Pomodoro con CAPIA'), pomodoroPanel(), h('div.capia-say', personPortrait('capia', { size: 100, expr: 'happy', outfit: S.profile.capiaOutfit }), h('div.bubble.small', 'Estudio contigo en silencio. Si me necesitas, solo di “CAPIA”… o abre el chat.')), h('button.btn.ghost', { onclick: () => navigate('/capia') }, '🧠 Abrir chat con CAPIA')), h('div.card', h('h3', '📝 Notas'), note, h('small', 'Se guardan en tu dispositivo.')), h('div.card.span2', h('h3', '🖊️ Pizarra CAPICÚA'), board.el));
}

/* ───── Retos por código ───── */
const enc = (o) => btoa(unescape(encodeURIComponent(JSON.stringify(o)))).replace(/=+$/, '');
const dec = (s) => JSON.parse(decodeURIComponent(escape(atob(s.trim()))));
function reto() {
  const S = state(); const out = h('div.stack'); const lvlSel = h('select', ALL_LEVELS.filter((l) => !l.boss && !l.gens[0].startsWith('project')).map((l) => h('option', { value: l.id, selected: l.id === 'algebra.10' }, `${REGION_BY_ID[l.region].icon} ${REGION_BY_ID[l.region].subject} · ${l.name}`)));
  const nSel = h('select', [5, 8, 10].map((n) => h('option', { value: n }, `${n} preguntas`)));
  const code = h('textarea', { rows: 2, placeholder: 'Pega aquí el código de reto de tu amigo/a', 'aria-label': 'Código de reto' });
  const play = (c, me) => {
    const lv = LEVEL_BY_ID[c.l]; let i = 0; let ok = 0; const area = h('div.card');
    const next = () => { if (i >= c.n) { const msg = `${S.profile.name}: ${ok}/${c.n} en “${lv.name}” (reto ${c.s})`; area.replaceChildren(h('h2', '🏁 ¡Reto terminado!'), h('p', `Acertaste ${ok} de ${c.n}.`), h('p.soft', 'Compara con tu amigo/a y comenten qué errores aprendieron. Aquí no hay perdedores: hay estudio compartido.'), h('div.code', msg), h('div.btn-row', h('button.btn.ghost', { onclick: () => { navigator.clipboard?.writeText(msg); toast('Resultado copiado', { icon: '📋' }); } }, '📋 Copiar resultado'), h('button.btn.primary', { onclick: () => { addXP(S, 20 + ok * 5); S.stats.duels = (S.stats.duels || 0) + 1; S.stats.friends = Math.max(S.stats.friends, 1); save(); navigate('/community'); } }, 'Cobrar XP'))); return; }
      const spec = lv.gens.find((g) => !g.startsWith('project:')) || 'basic_ops'; const q = makeQuestion(spec, c.s * 31 + i * 7, lv.baseDiff);
      const view = questionView(q, { onSubmit: (v, res) => { view.lock(true); recordAttempt(S, { levelId: lv.id, spec: q.gen, seed: q.seed, difficulty: q.difficulty, correct: res.ok, mode: 'quiz', qType: q.type, input: String(v), msg: res.diag?.msg || '' }); if (res.ok) { ok += 1; sfx.correct(); } else sfx.wrong(); view.feedback(h('div.fb.' + (res.ok ? 'ok' : 'bad'), res.ok ? '✔ ¡Correcto!' : h('span', 'Veamos: ', h('ol.steps', q.steps.map((s) => h('li', { html: rich(s) })))))); i += 1; setTimeout(next, res.ok ? 900 : 2800); } });
      area.replaceChildren(h('div.qmeta', h('span.pill', `${i + 1}/${c.n}`), h('span.pill', lv.name)), view.el); view.focus(); };
    out.replaceChildren(area); next();
  };
  return h('div.grid.two',
    h('div.card', h('h3', '⚔️ Crear un reto'), h('p', 'Elige el tema y comparte el código con tu amigo/a: ambos resuelven las MISMAS preguntas y comparan lo que aprendieron.'), h('label.field', h('span', 'Tema'), lvlSel), h('label.field', h('span', 'Cantidad'), nSel),
      h('button.btn.primary', { onclick: () => { const c = { l: lvlSel.value, n: +nSel.value, s: Math.floor(Math.random() * 9000) + 100 }; const cd = enc(c); out.replaceChildren(h('div.card', h('p', 'Tu código de reto:'), h('div.code', cd), h('div.btn-row', h('button.btn.ghost', { onclick: () => { navigator.clipboard?.writeText(cd); toast('Código copiado', { icon: '📋' }); } }, '📋 Copiar'), h('button.btn.primary', { onclick: () => play(c, true) }, '▶ Jugar yo ahora')))); } }, 'Generar código')),
    h('div.card', h('h3', '🔑 Unirme a un reto'), code, h('button.btn.good', { onclick: () => { try { const c = dec(code.value); if (!LEVEL_BY_ID[c.l] || !(c.n > 0 && c.n <= 20)) throw new Error('x'); play(c); } catch { toast('Ese código no es válido', { icon: '⚠️' }); } } }, 'Empezar')),
    h('div.card', h('h3', '👥 Misión cooperativa: puente a cuatro manos'), h('p', 'Una persona calcula la **geometría** y la otra las **fuerzas**. Para resolver su parte, necesitan el resultado de la otra: ¡hay que compartir conocimiento!'), coop()),
    h('div.span2', out));
}
function coop() {
  const S = state(); const box = h('div.stack');
  const start = (role, seed) => {
    const p = makeProject('bridge', seed); const mine = role === 'A' ? [0, 1] : [2]; const area = h('div.stack');
    area.append(h('div.scenario', { html: rich('**' + p.title + '.** ' + p.scenario) }), h('b', role === 'A' ? 'Tu parte: geometría (cable y ángulo). Al terminar, dile a tu compañero/a el ángulo.' : 'Tu parte: fuerzas. Pídele a tu compañero/a el ángulo que calculó (o cálculalo tú con el cable) y halla la tensión.'));
    mine.forEach((idx) => { const q = p.parts[idx]; const view = questionView(q, { onSubmit: (v, res) => { view.lock(true); view.feedback(h('div.fb.' + (res.ok ? 'ok' : 'bad'), res.ok ? '✔ ¡Correcto! Compártelo con tu compañero/a.' : h('span', 'Revisa: ', h('ol.steps', q.steps.map((s) => h('li', { html: rich(s) })))))); if (res.ok) { sfx.coin(); S.stats.projects += 0; } } }); area.append(h('div.card', view.el)); });
    box.replaceChildren(area);
  };
  const codeIn = h('input', { placeholder: 'Código de la misión' });
  return h('div.stack', h('div.btn-row', h('button.btn.primary', { onclick: () => { const seed = Math.floor(Math.random() * 9000) + 100; box.replaceChildren(h('p', 'Tu código (pásaselo a tu compañero/a):'), h('div.code', 'PUENTE-' + seed), h('p.soft', 'Tú eres la persona A (geometría).'), h('button.btn.good', { onclick: () => start('A', seed) }, 'Empezar como A')); } }, 'Crear misión (A)'), codeIn, h('button.btn.ghost', { onclick: () => { const m = codeIn.value.match(/PUENTE-(\d+)/i); if (!m) { toast('Código no válido', { icon: '⚠️' }); return; } start('B', +m[1]); } }, 'Unirme como B')), box);
}

/* ───── Llamada WebRTC sin servidor (señalización manual) ───── */
function llamada() {
  const S = state(); let pc = null; let dc = null; let stream = null; const board = createBoard({ onEvent: (e) => dc?.readyState === 'open' && dc.send(JSON.stringify({ k: 'b', e })) });
  const chat = h('div.chat-mini'); const status = h('p.soft', 'Sin conexión.'); const remoteV = h('video', { autoplay: true, playsInline: true }); const localV = h('video', { autoplay: true, muted: true, playsInline: true });
  const sig = h('textarea', { rows: 4, placeholder: 'Aquí aparecerá / pega el código…', 'aria-label': 'Código de conexión' });
  const mk = () => { pc = new RTCPeerConnection({ iceServers: [{ urls: 'stun:stun.l.google.com:19302' }] }); pc.ontrack = (e) => { remoteV.srcObject = e.streams[0]; }; pc.onconnectionstatechange = () => { status.textContent = { connected: '🟢 Conectados', connecting: '🟡 Conectando…', failed: '🔴 No se pudo conectar (¿red o firewall?)', disconnected: '🟠 Desconectado' }[pc.connectionState] || pc.connectionState; if (pc.connectionState === 'connected') { sfx.levelup(); S.stats.rooms = (S.stats.rooms || 0) + 1; S.stats.friends = Math.max(S.stats.friends, 1); save(); } }; };
  const wire = (ch) => { dc = ch; ch.onmessage = (m) => { const d = JSON.parse(m.data); if (d.k === 'c') chat.append(h('div.cm.them', d.t)); if (d.k === 'b') board.remote(d.e); chat.scrollTop = chat.scrollHeight; }; };
  const gather = () => new Promise((r) => { if (pc.iceGatheringState === 'complete') r(); else pc.addEventListener('icegatheringstatechange', () => pc.iceGatheringState === 'complete' && r()); setTimeout(r, 4000); });
  const media = async (video) => { try { stream = await navigator.mediaDevices.getUserMedia({ audio: true, video }); stream.getTracks().forEach((t) => pc.addTrack(t, stream)); localV.srcObject = stream; } catch { toast('Sin micrófono/cámara: seguiremos con chat y pizarra', { icon: '🎙️' }); } };
  const enc2 = (d) => btoa(unescape(encodeURIComponent(JSON.stringify(d))));
  const steps = h('div.stack');
  const home = () => steps.replaceChildren(h('div.btn-row', h('button.btn.primary', { onclick: () => host() }, '📞 Crear llamada'), h('button.btn.good', { onclick: () => guest() }, '🔗 Unirme con código')), h('small', 'No pasa por ningún servidor: tú y tu amigo/a intercambian dos códigos (por WhatsApp, por ejemplo). Micrófono y cámara empiezan apagados hasta que los actives.'));
  async function host() { mk(); wire(pc.createDataChannel('capicua')); await media(videoOn.checked); await pc.setLocalDescription(await pc.createOffer()); await gather(); sig.value = enc2(pc.localDescription);
    const ans = h('textarea', { rows: 3, placeholder: 'Pega aquí la RESPUESTA de tu amigo/a' });
    steps.replaceChildren(h('b', '1. Copia este código y envíaselo a tu amigo/a:'), sig, h('button.btn.ghost.sm', { onclick: () => { navigator.clipboard?.writeText(sig.value); toast('Copiado', { icon: '📋' }); } }, '📋 Copiar'), h('b', '2. Cuando te devuelva su respuesta, pégala aquí:'), ans, h('button.btn.primary', { onclick: async () => { try { await pc.setRemoteDescription(JSON.parse(decodeURIComponent(escape(atob(ans.value.trim()))))); } catch { toast('Código de respuesta no válido', { icon: '⚠️' }); } } }, 'Conectar')); }
  async function guest() { const inp = h('textarea', { rows: 3, placeholder: 'Pega aquí el código de tu amigo/a' }); const out = h('textarea', { rows: 3, readonly: true, placeholder: 'Tu respuesta aparecerá aquí' });
    steps.replaceChildren(h('b', '1. Pega el código que te envió:'), inp, h('button.btn.primary', { onclick: async () => { try { mk(); pc.ondatachannel = (e) => wire(e.channel); await media(videoOn.checked); await pc.setRemoteDescription(JSON.parse(decodeURIComponent(escape(atob(inp.value.trim()))))); await pc.setLocalDescription(await pc.createAnswer()); await gather(); out.value = enc2(pc.localDescription); } catch { toast('Código no válido', { icon: '⚠️' }); } } }, 'Generar respuesta'), h('b', '2. Envía esta respuesta a tu amigo/a:'), out, h('button.btn.ghost.sm', { onclick: () => { navigator.clipboard?.writeText(out.value); toast('Copiado', { icon: '📋' }); } }, '📋 Copiar')); }
  const videoOn = h('input', { type: 'checkbox' });
  const msg = h('input', { placeholder: 'Escribe un mensaje…', onkeydown: (e) => { if (e.key === 'Enter') sendMsg(); } });
  const sendMsg = () => { if (!msg.value.trim() || dc?.readyState !== 'open') return; const t = msg.value.trim().slice(0, 300); dc.send(JSON.stringify({ k: 'c', t })); chat.append(h('div.cm.me', t)); msg.value = ''; S.stats.messages += 1; };
  home();
  return h('div.grid.two', h('div.card', h('h3', '📞 Llamada de voz o video'), h('label.check', videoOn, ' Activar también cámara (opcional)'), steps, status,
    h('div.btn-row', h('button.btn.ghost.sm', { onclick: () => { const t = stream?.getAudioTracks()[0]; if (t) { t.enabled = !t.enabled; toast(t.enabled ? '🎙️ Micrófono activado' : '🔇 Micrófono silenciado', { icon: '🎙️' }); } } }, '🎙️ Micrófono'), h('button.btn.ghost.sm', { onclick: () => { const t = stream?.getVideoTracks()[0]; if (t) { t.enabled = !t.enabled; toast(t.enabled ? '📷 Cámara activada' : '📷 Cámara apagada', { icon: '📷' }); } } }, '📷 Cámara'), h('button.btn.ghost.sm', { onclick: () => { pc?.close(); stream?.getTracks().forEach((t) => t.stop()); pc = null; stream = null; status.textContent = 'Llamada terminada.'; home(); } }, '⛔ Colgar')), h('div.videos', remoteV, localV)),
    h('div.card', h('h3', '💬 Chat'), chat, h('div.composer', msg, h('button.btn.primary', { onclick: sendMsg }, '➤')), h('small', 'Los mensajes viajan directo entre ustedes y no se guardan.')),
    h('div.card.span2', h('h3', '🖊️ Pizarra compartida'), h('small', 'Lo que dibujes aparece también en la pizarra de tu amigo/a mientras estén conectados.'), board.el));
}

/* ───── Seguridad y privacidad ───── */
function seguridad() {
  return h('div.card.stack', h('h3', '🛡️ Seguridad y privacidad por diseño'),
    h('ul.checks', ['Sin cuentas públicas ni perfiles que desconocidos puedan buscar: los retos y las llamadas se hacen compartiendo un código con alguien que ya conoces.', 'El micrófono y la cámara empiezan apagados; tú decides cuándo activarlos y puedes silenciarlos o colgar en cualquier momento.', 'Los mensajes y la pizarra viajan directamente entre dispositivos (WebRTC) y no se almacenan en un servidor.', 'Tu progreso, documentos y calendario se guardan solo en tu dispositivo. Puedes exportarlos o borrarlos desde Perfil → Datos.', 'Para menores de edad: no se piden datos personales, no hay mensajes con desconocidos y las funciones sociales requieren un adulto que comparta el código.', 'Si alguien te hace sentir incómodo/a: cuelga, no compartas más códigos y avisa a un adulto de confianza.'].map((t) => h('li', t))),
    richEl('**Salas multiusuario en tiempo real, moderación, bloqueo y reportes** requieren un servidor de verdad (cuentas, base de datos y moderadores). El proyecto incluye la guía para conectar un backend; mientras tanto, todo lo de esta página funciona sin él.'));
}
