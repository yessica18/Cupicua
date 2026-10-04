// Técnica Pomodoro con CAPIA: 50 min de estudio / 10 de descanso (configurable) y pausas activas.
import { h, toast, modal } from './dom.js';
import { state, save } from './store.js';
import { speak } from './voice.js';
import { sfx } from './sound.js';

const STRETCH = ['Levántate y estira los brazos hacia el techo 20 segundos.', 'Gira lentamente el cuello a cada lado, sin forzar.', 'Mira por la ventana a un punto lejano durante 20 segundos para descansar la vista.', 'Toma un vaso de agua.', 'Camina un minuto por la habitación y respira hondo cuatro veces.', 'Abre y cierra las manos y mueve las muñecas en círculos.', 'Haz 10 sentadillas suaves para activar la circulación.'];
const P = { phase: 'idle', endsAt: 0, remain: 0, focus: 50, rest: 10, timer: null, cycles: 0 };
const subs = new Set(); const emit = () => subs.forEach((f) => f());
const fmt = (ms) => { const s = Math.max(0, Math.round(ms / 1000)); return `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`; };

export const pomodoro = {
  get: () => P,
  start(phase = 'focus') { P.phase = phase; P.endsAt = Date.now() + (phase === 'focus' ? P.focus : P.rest) * 60000; clearInterval(P.timer); P.timer = setInterval(tick, 500); emit(); },
  pause() { if (P.phase === 'idle') return; P.remain = P.endsAt - Date.now(); P.paused = true; clearInterval(P.timer); emit(); },
  resume() { if (!P.paused) return; P.endsAt = Date.now() + P.remain; P.paused = false; P.timer = setInterval(tick, 500); emit(); },
  stop() { clearInterval(P.timer); P.phase = 'idle'; P.paused = false; emit(); },
  setLengths(f, r) { P.focus = f; P.rest = r; emit(); },
  sub(f) { subs.add(f); return () => subs.delete(f); },
};
function tick() {
  if (Date.now() < P.endsAt) { emit(); return; }
  clearInterval(P.timer);
  if (P.phase === 'focus') {
    P.cycles += 1; try { const S = state(); S.stats.minutes += P.focus; save(); } catch { /* sin sesión */ }
    const tip = STRETCH[Math.floor(Math.random() * STRETCH.length)]; sfx.victory();
    toast(`¡Terminaste un bloque de ${P.focus} min! Descansa ${P.rest}: ${tip}`, { icon: '🍅', ms: 7000 }); speak(`Excelente trabajo. Descansa ${P.rest} minutos. ${tip}`);
    notify('CAPICÚA · ¡A descansar!', tip); P.phase = 'break'; P.endsAt = Date.now() + P.rest * 60000; P.timer = setInterval(tick, 500);
  } else { sfx.coin(); toast('Descanso terminado. ¿Otro bloque de estudio?', { icon: '📚', ms: 5000 }); speak('Descanso terminado. Cuando quieras, empezamos otro bloque.'); notify('CAPICÚA', 'Descanso terminado'); P.phase = 'idle'; }
  emit();
}
function notify(t, b) { try { if ('Notification' in window && Notification.permission === 'granted') new Notification(t, { body: b }); } catch { /* ignorar */ } }

export function pomodoroChip() {
  const chip = h('button.pomo-chip', { title: 'Pomodoro con CAPIA', 'aria-label': 'Pomodoro', onclick: openPanel }, '🍅 ', h('span.pt', 'Pomodoro'));
  const upd = () => { const t = chip.querySelector('.pt'); chip.classList.toggle('run', P.phase !== 'idle'); t.textContent = P.phase === 'idle' ? 'Pomodoro' : `${P.phase === 'focus' ? 'Estudio' : 'Descanso'} ${fmt(P.paused ? P.remain : P.endsAt - Date.now())}`; };
  pomodoro.sub(upd); upd(); return chip;
}
export function pomodoroPanel() {
  const out = h('div.pomo-big', '00:00'); const state$ = h('p.sub', '');
  const upd = () => { out.textContent = P.phase === 'idle' ? `${String(P.focus).padStart(2, '0')}:00` : fmt(P.paused ? P.remain : P.endsAt - Date.now()); state$.textContent = P.phase === 'focus' ? '🧠 Concéntrate: CAPIA te acompaña.' : P.phase === 'break' ? '🌿 Descanso activo: ' + STRETCH[P.cycles % STRETCH.length] : 'Elige cuánto quieres estudiar.'; };
  pomodoro.sub(upd); upd();
  const sel = (label, key, opts) => h('label.field.inline', label, h('select', { onchange: (e) => { P[key] = +e.target.value; pomodoro.setLengths(P.focus, P.rest); } }, opts.map((o) => h('option', { value: o, selected: P[key] === o }, o + ' min'))));
  return h('div.stack', out, state$, h('div.btn-row', h('button.btn.primary', { onclick: () => { Notification?.requestPermission?.(); P.paused ? pomodoro.resume() : pomodoro.start('focus'); } }, P.paused ? '▶ Continuar' : '▶ Iniciar estudio'), h('button.btn.ghost', { onclick: () => pomodoro.pause() }, '⏸ Pausa'), h('button.btn.ghost', { onclick: () => pomodoro.stop() }, '⏹ Parar'), h('button.btn.ghost', { onclick: () => pomodoro.start('break') }, '🌿 Descanso')),
    h('div.btn-row', sel('Estudio', 'focus', [15, 25, 30, 50, 60]), sel('Descanso', 'rest', [5, 10, 15])), h('small', `Bloques completados hoy: ${P.cycles}. Descansar también es estudiar.`));
}
function openPanel() { modal(pomodoroPanel(), { title: '🍅 Pomodoro con CAPIA' }); }
