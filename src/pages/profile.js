// Perfil: avatar, estadísticas, mentor, logros y ajustes (accesibilidad, audio, IA, privacidad y datos).
import { h, mount, toast, modal } from '../lib/dom.js';
import { state, save, applySettings, getUser, accounts, logout, exportData, resetProgress } from '../lib/store.js';
import { playerLevel, accuracy, unlockedOutfits, regionProgress } from '../../shared/engine/game.js';
import { ACHIEVEMENTS } from '../../shared/engine/achievements.js';
import { TITLES, CAPIA_OUTFITS } from '../../shared/content/game.js';
import { MENTOR_BY_ID } from '../../shared/content/mentors.js';
import { REGIONS } from '../../shared/content/regions.js';
import { avatarEditor } from './avatar-editor.js';
import { avatarCanvas, petBadge } from '../lib/game-ui.js';
import { personPortrait } from './capia-portrait.js';
import { setAudio, startMusic } from '../lib/sound.js';
import { setVoice, speak } from '../lib/voice.js';
import { navigate } from '../router.js';

let tab = 'avatar';
export function profilePage(root) {
  startMusic('calm'); const S = state(); const pl = playerLevel(S.xp); const body = h('div.profile-body');
  const tabs = h('div.tabs', [['avatar', '🧑‍🚀 Avatar'], ['logros', '🏅 Logros'], ['ajustes', '⚙️ Ajustes'], ['datos', '🔒 Datos y cuenta']].map(([k, t]) => h('button.chip' + (k === tab ? '.on' : ''), { onclick: (e) => { tab = k; [...tabs.children].forEach((x) => x.classList.toggle('on', x === e.currentTarget)); show(); } }, t)));
  const views = { avatar, logros, ajustes, datos };
  const show = () => body.replaceChildren(views[tab]());
  const m = MENTOR_BY_ID[S.profile.mentor];
  mount(root, h('section.page.profile',
    h('div.card.pf-head', h('div.pf-avatar', avatarCanvas({ size: 200, frame: 'bust', drag: true }), petBadge(60)), h('div.pf-info', h('h1', S.profile.name), h('small', `@${S.profile.username}`),
      h('label.field.inline', 'Título', h('select', { onchange: (e) => { S.profile.title = e.target.value; save(); } }, TITLES.map((t) => h('option', { selected: S.profile.title === t }, t)))),
      h('div.pf-stats', [['Nivel', pl.level], ['XP', S.xp], ['π', S.pi], ['🔥 Racha', S.streak.count], ['Mejor racha', S.streak.best], ['Precisión', accuracy(S) + '%'], ['Horas', Math.round(S.stats.minutes / 6) / 10], ['Errores superados', S.stats.errorsOvercome || 0], ['Logros', Object.keys(S.achievements).length + '/' + ACHIEVEMENTS.length]].map(([k, v]) => h('div.st', h('b', v), h('small', k)))),
      h('div.xpbar.big', h('i', { style: { width: pl.pct + '%' } })), h('small', `${pl.pct}% hacia el nivel ${pl.level + 1}`)),
      h('div.pf-mentor', m ? [personPortrait(m.id, { size: 110 }), h('b', m.name), h('small', 'Tu mentor')] : null, h('a.btn.ghost.sm', { href: '#/codex' }, 'Cambiar mentor'))),
    h('div.card.pf-capia', h('h3', '👗 Vestuario de CAPIA'), h('p.soft', 'CAPIA cambia de ropa según el mundo; desbloquéalos avanzando.'), h('div.outfits', CAPIA_OUTFITS.map((o) => { const ok = unlockedOutfits(S).some((x) => x.id === o.id); return h('button.outfit' + (S.profile.capiaOutfit === o.id ? '.sel' : '') + (ok ? '' : '.locked'), { onclick: () => { if (!ok) { toast('🔒 Se desbloquea al avanzar en las regiones', { icon: '🔒' }); return; } S.profile.capiaOutfit = o.id; save(); profilePage(root); } }, personPortrait('capia', { size: 90, outfit: o.id }), h('small', o.name)); }))),
    tabs, body)); show();
}
const avatar = () => avatarEditor({ onChange: () => {} });

function logros() {
  const S = state(); let f = 'todos'; const list = h('div.ach-grid');
  const draw = () => list.replaceChildren(...ACHIEVEMENTS.filter((a) => f === 'todos' || (f === 'ganados' ? S.achievements[a.id] : !S.achievements[a.id])).filter((a) => !(a.secret && !S.achievements[a.id])).slice(0, 400).map((a) => h('div.ach' + (S.achievements[a.id] ? '.got' : ''), { title: a.desc }, h('span.ai', S.achievements[a.id] ? a.icon : '🔒'), h('div', h('b', a.name), h('small', a.desc), h('em', `${a.xp} XP · ${a.pi} π`)))));
  const chips = h('div.chips', ['todos', 'ganados', 'pendientes'].map((k) => h('button.chip' + (k === f ? '.on' : ''), { onclick: (e) => { f = k; [...chips.children].forEach((x) => x.classList.toggle('on', x === e.currentTarget)); draw(); } }, k[0].toUpperCase() + k.slice(1))));
  draw(); return h('div.stack', h('p.sub', `${Object.keys(S.achievements).length} de ${ACHIEVEMENTS.length} logros. Se premian la constancia, la comprensión y la recuperación después de errores.`), chips, list);
}

function ajustes() {
  const S = state(); const st = S.settings; const apply = () => { applySettings(); setAudio({ music: st.music, sfx: st.sfx, volume: st.volume }); setVoice({ on: st.voice, rate: st.rate, volume: st.volume }); save(); };
  const sw = (label, key, extra) => h('label.switch', h('input', { type: 'checkbox', checked: st[key], onchange: (e) => { st[key] = e.target.checked; apply(); extra?.(e.target.checked); } }), h('span', label));
  const key = h('input', { type: 'password', placeholder: 'sk-ant-… (opcional)', value: S.game.apiKey || '', 'aria-label': 'Clave de IA', autocomplete: 'off' });
  return h('div.grid.two',
    h('div.card.stack', h('h3', '🎨 Apariencia y accesibilidad'), sw('Modo oscuro', 'theme', null) && h('div.btn-row', h('button.btn' + (st.theme === 'light' ? '.primary' : '.ghost'), { onclick: () => { st.theme = 'light'; apply(); } }, '☀️ Claro'), h('button.btn' + (st.theme === 'dark' ? '.primary' : '.ghost'), { onclick: () => { st.theme = 'dark'; apply(); } }, '🌙 Oscuro')),
      h('label.field', h('span', `Tamaño del texto: ${st.textSize}%`), h('input', { type: 'range', min: 85, max: 150, step: 5, value: st.textSize, oninput: (e) => { st.textSize = +e.target.value; apply(); e.target.previousSibling.textContent = `Tamaño del texto: ${st.textSize}%`; } })),
      sw('Alto contraste', 'contrast'), sw('Reducir movimiento y animaciones', 'reduceMotion'), sw('Subtítulos y texto de lo que dice CAPIA', 'captions'), h('small', 'Todo el sitio se puede usar con teclado (Tab, Enter, flechas) y tiene etiquetas para lectores de pantalla.')),
    h('div.card.stack', h('h3', '🔊 Sonido y voz'), sw('🎵 Música', 'music', (on) => { on ? startMusic('space') : null; }), sw('🔔 Efectos de sonido', 'sfx'), sw('🩷 Voz de CAPIA', 'voice'),
      h('label.field', h('span', 'Volumen'), h('input', { type: 'range', min: 0, max: 1, step: 0.05, value: st.volume, oninput: (e) => { st.volume = +e.target.value; apply(); } })),
      h('div.btn-row', [['🐢 Lenta', 0.8], ['▶ Normal', 1], ['⚡ Rápida', 1.25]].map(([t, v]) => h('button.btn' + (st.rate === v ? '.primary' : '.ghost') + '.sm', { onclick: () => { st.rate = v; apply(); speak('Así sonará mi voz.', { force: true }); } }, t))), h('button.btn.ghost.sm', { onclick: () => speak('Hola, soy CAPIA. Cada error es información.', { force: true }) }, '▶ Probar voz')),
    h('div.card.stack', h('h3', '🤖 IA de CAPIA (opcional)'), h('p.soft', 'Sin clave, CAPIA funciona en modo local (explica, guía, genera ejercicios verificados). Con una clave de Anthropic, conversa de forma abierta y puede leer fotos de ejercicios.'), key,
      h('div.btn-row', h('button.btn.primary.sm', { onclick: () => { S.game.apiKey = key.value.trim(); save(); toast(S.game.apiKey ? 'Clave guardada en este dispositivo' : 'Clave eliminada', { icon: '🔑' }); } }, 'Guardar'), h('button.btn.ghost.sm', { onclick: () => { key.value = ''; S.game.apiKey = ''; save(); } }, 'Quitar')),
      h('small.fine', '⚠️ La clave se guarda solo en tu navegador y se envía únicamente a api.anthropic.com. Úsala solo en dispositivos tuyos y con un límite de gasto; para uso público, ponla en un servidor.')),
    h('div.card.stack', h('h3', '🔒 Privacidad'), h('p', 'Minimizamos datos: no pedimos correo, ubicación ni documentos. Todo vive en tu dispositivo.'), sw('Permitir micrófono para hablar con CAPIA', 'mic', null) && null, h('small', 'El micrófono y la cámara solo se activan cuando tú los usas y el navegador te lo pide.')));
}

function datos() {
  const S = state(); const u = getUser();
  const dl = (name, text) => { const a = h('a', { href: URL.createObjectURL(new Blob([text], { type: 'application/json' })), download: name }); document.body.append(a); a.click(); a.remove(); };
  const imp = h('input', { type: 'file', accept: 'application/json', hidden: true, onchange: async (e) => { try { const j = JSON.parse(await e.target.files[0].text()); if (!j.state || j.state.v !== 1) throw new Error(); Object.assign(S, j.state); save(); toast('Progreso importado', { icon: '📥' }); location.reload(); } catch { toast('Archivo no válido', { icon: '⚠️' }); } } });
  const pw = () => { const o = h('input', { type: 'password', placeholder: 'Contraseña actual' }); const n = h('input', { type: 'password', placeholder: 'Nueva contraseña (8+)' }); const m = modal(h('form.stack', { onsubmit: async (e) => { e.preventDefault(); try { await accounts.changePassword(u.username, o.value, n.value); toast('Contraseña cambiada', { icon: '🔑' }); m.close(); } catch (x) { toast(x.message, { icon: '⚠️' }); } } }, o, n, h('button.btn.primary', { type: 'submit' }, 'Cambiar')), { title: 'Cambiar contraseña' }); };
  return h('div.grid.two',
    h('div.card.stack', h('h3', '💾 Tus datos'), h('p', 'Tu progreso es tuyo. Expórtalo para llevarlo a otro dispositivo o como copia de seguridad.'), h('div.btn-row', h('button.btn.primary.sm', { onclick: () => dl(`capicua-${u.username}.json`, exportData()) }, '📤 Exportar'), h('button.btn.ghost.sm', { onclick: () => imp.click() }, '📥 Importar'), imp), h('small', 'Haz copias de seguridad regularmente: si borras los datos del navegador, se pierde el progreso.')),
    h('div.card.stack', h('h3', '👤 Cuenta'), h('p', `Usuario: @${u.username} · Edad: ${S.profile.ageBand}`), h('div.btn-row', h('button.btn.ghost.sm', { onclick: pw }, '🔑 Cambiar contraseña'), h('button.btn.ghost.sm', { onclick: () => { logout(); location.hash = '#/'; location.reload(); } }, '🚪 Cerrar sesión'))),
    h('div.card.stack.danger', h('h3', '⚠️ Zona delicada'), h('div.btn-row', h('button.btn.warn.sm', { onclick: () => { if (confirm('¿Reiniciar todo tu progreso? Se conservan tu cuenta y avatar.')) { resetProgress(); location.reload(); } } }, '↺ Reiniciar progreso'), h('button.btn.warn.sm', { onclick: () => { if (confirm('¿Eliminar esta cuenta y TODOS sus datos de este dispositivo?')) { accounts.remove(u.username); logout(); location.reload(); } } }, '🗑️ Eliminar cuenta'))));
}
