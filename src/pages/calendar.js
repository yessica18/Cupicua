// Calendario tipo agenda: parciales, entregas de tareas y repasos. CAPIA arma el plan del parcial. Exporta a .ics (Google Calendar).
import { h, mount, toast, modal } from '../lib/dom.js';
import { state, save } from '../lib/store.js';
import { dayKey, planExam, addDays, regionProgress, masteryOf } from '../../shared/engine/game.js';
import { REGIONS, REGION_BY_ID } from '../../shared/content/regions.js';
import { navigate } from '../router.js';
import { sfx } from '../lib/sound.js';
import { speak } from '../lib/voice.js';
import { personPortrait } from './capia-portrait.js';

const TYPES = { parcial: ['📝', '#ff2d7a', 'Parcial / examen'], tarea: ['📚', '#ffc83a', 'Entrega de tarea'], repaso: ['🧠', '#5fd3f0', 'Repaso'], estudio: ['📖', '#7b3cf0', 'Estudio'], descanso: ['🌿', '#34d399', 'Descanso'], otro: ['📌', '#94a3b8', 'Otro'] };
const MONTHS = ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio', 'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'];
let cursor = new Date(); let selected = dayKey();

export function calendarPage(root) {
  const S = state(); const ev = () => S.game.events;
  const grid = h('div.cal-grid'); const dayList = h('div.day-list'); const head = h('h2.cal-title');
  const draw = () => {
    const y = cursor.getFullYear(); const m = cursor.getMonth(); head.textContent = `${MONTHS[m][0].toUpperCase() + MONTHS[m].slice(1)} ${y}`;
    const first = new Date(y, m, 1); const offset = (first.getDay() + 6) % 7; const days = new Date(y, m + 1, 0).getDate();
    const cells = ['L', 'M', 'X', 'J', 'V', 'S', 'D'].map((d) => h('div.dow', d));
    for (let i = 0; i < offset; i++) cells.push(h('div.day.empty'));
    for (let d = 1; d <= days; d++) {
      const key = dayKey(new Date(y, m, d)); const list = ev().filter((e) => e.date === key);
      cells.push(h('button.day' + (key === dayKey() ? '.today' : '') + (key === selected ? '.sel' : ''), { onclick: () => { selected = key; draw(); drawDay(); sfx.click(); }, 'aria-label': `${d} de ${MONTHS[m]}: ${list.length} eventos` }, h('span.dn', d), h('div.dots', list.slice(0, 4).map((e) => h('i', { style: { background: TYPES[e.type]?.[1] } })))));
    }
    grid.replaceChildren(...cells);
  };
  const drawDay = () => {
    const list = ev().filter((e) => e.date === selected).sort((a, b) => (a.time || '').localeCompare(b.time || ''));
    const d = new Date(selected + 'T12:00'); const diff = Math.round((d - new Date(dayKey() + 'T12:00')) / 86400000);
    dayList.replaceChildren(h('h3', d.toLocaleDateString('es', { weekday: 'long', day: 'numeric', month: 'long' }), h('small', diff === 0 ? ' · hoy' : diff > 0 ? ` · en ${diff} día${diff > 1 ? 's' : ''}` : ` · hace ${-diff} día${diff < -1 ? 's' : ''}`)),
      list.length ? list.map((e) => h('div.ev' + (e.done ? '.done' : ''), { style: { '--c': TYPES[e.type]?.[1] } }, h('input', { type: 'checkbox', checked: e.done, 'aria-label': 'Hecho', onchange: (x) => { e.done = x.target.checked; if (e.done) { sfx.coin(); S.xp += 5; } save(); drawDay(); } }), h('div', h('b', `${TYPES[e.type]?.[0] || '📌'} ${e.title}`), e.time ? h('small', e.time) : null, e.notes ? h('small', e.notes) : null), h('button.x', { 'aria-label': 'Eliminar', onclick: () => { S.game.events = ev().filter((z) => z !== e); save(); draw(); drawDay(); } }, '✕'))) : h('p.soft', 'Nada para este día. ¡Buen momento para adelantar algo pequeño!'),
      h('button.btn.primary', { onclick: () => addEvent(selected) }, '＋ Añadir evento'));
  };
  const addEvent = (date) => {
    const title = h('input', { placeholder: 'Ej.: Parcial de Cálculo 1', required: true }); const type = h('select', Object.entries(TYPES).map(([k, v]) => h('option', { value: k }, `${v[0]} ${v[2]}`))); const when = h('input', { type: 'date', value: date }); const time = h('input', { type: 'time' }); const notes = h('input', { placeholder: 'Notas (temas, salón…)' });
    const m = modal(h('form.stack', { onsubmit: (e) => { e.preventDefault(); if (!title.value.trim()) return; ev().push({ id: Date.now() + Math.random(), title: title.value.trim().slice(0, 80), type: type.value, date: when.value, time: time.value, notes: notes.value.slice(0, 120), done: false }); save(); selected = when.value; cursor = new Date(when.value + 'T12:00'); m.close(); draw(); drawDay(); sfx.coin(); if (type.value === 'parcial') toast('Anotado. ¿Quieres que CAPIA arme tu plan de estudio?', { icon: '🩷', ms: 4500 }); } },
      h('label.field', h('span', 'Título'), title), h('label.field', h('span', 'Tipo'), type), h('div.btn-row', h('label.field', h('span', 'Fecha'), when), h('label.field', h('span', 'Hora (opcional)'), time)), h('label.field', h('span', 'Notas'), notes), h('button.btn.primary.big', { type: 'submit' }, 'Guardar')), { title: 'Nuevo evento' });
    title.focus();
  };

  /* ───── Preparar mi parcial ───── */
  const planBtn = h('button.btn.good.big', { onclick: () => examPlanner() }, '📅 PREPARAR MI PARCIAL');
  function examPlanner() {
    const subj = h('select', REGIONS.map((r) => h('option', { value: r.id, selected: r.id === S.game.subject }, `${r.icon} ${r.subject}`)));
    const when = h('input', { type: 'date', min: dayKey(), value: addDays(dayKey(), 12) });
    const topicBox = h('div.topic-pick'); const drawTopics = () => { const r = REGION_BY_ID[subj.value]; topicBox.replaceChildren(...r.levels.filter((l) => !l.boss).map((l) => h('label.check', h('input', { type: 'checkbox', value: l.id, checked: masteryOf(S, l.id).pct < 70 && l.n <= 12 }), ` ${l.n}. ${l.name}`))); }; subj.onchange = drawTopics; drawTopics();
    const out = h('div.plan-out');
    const m = modal(h('div.stack', h('div.capia-say', personPortrait('capia', { size: 90, expr: 'happy', outfit: S.profile.capiaOutfit }), h('div.bubble', 'Dime la materia, los temas y la fecha: yo armo el calendario con sesiones, repasos, simulacros y días de descanso.')),
      h('label.field', h('span', 'Materia'), subj), h('label.field', h('span', 'Fecha del parcial'), when), h('b', 'Temas'), topicBox, out,
      h('button.btn.primary.big', { onclick: () => {
        const topics = [...topicBox.querySelectorAll('input:checked')].map((i) => ({ name: REGION_BY_ID[subj.value].levels.find((l) => l.id === i.value).name, levelId: i.value }));
        if (!topics.length) { toast('Elige al menos un tema', { icon: 'ℹ️' }); return; }
        const plan = planExam({ subject: REGION_BY_ID[subj.value].subject, topics, date: when.value });
        out.replaceChildren(h('p.ok', `Tu parcial es en ${plan.days} días.`), h('div.plan-list', plan.plan.map((d, i) => h('div.plan-day', h('b', i === 0 ? 'Hoy' : i === 1 ? 'Mañana' : `Día ${i + 1}`), h('small', d.date), h('ul', d.items.map((it) => h('li', `${{ study: '📖', quiz: '❓', review: '🧠', simulacro: '🎓', rest: '🌿' }[it.type]} ${it.text}`)))))), h('button.btn.good', { onclick: () => { addPlan(plan, subj.value); m.close(); } }, '✔ Añadir todo a mi calendario'));
        speak(`Tu parcial es en ${plan.days} días. Hoy: ${plan.plan[0].items[0].text}.`);
      } }, 'Crear plan')), { title: '📅 Preparar mi parcial', wide: true });
  }
  function addPlan(plan, regionId) {
    ev().push({ id: Date.now(), title: `Parcial de ${plan.subject}`, type: 'parcial', date: plan.date, notes: 'Plan creado por CAPIA', done: false });
    plan.plan.forEach((d) => d.items.forEach((it, k) => { if (d.in === 0 && false) return; ev().push({ id: Date.now() + Math.random(), title: it.text, type: it.type === 'rest' ? 'descanso' : it.type === 'review' || it.type === 'quiz' ? 'repaso' : 'estudio', date: d.date, notes: `${it.min} min`, done: false, region: regionId }); }));
    save(); selected = plan.date; cursor = new Date(plan.date + 'T12:00'); draw(); drawDay(); sfx.levelup(); toast('Plan añadido al calendario', { icon: '📅' });
  }
  const exportIcs = () => {
    const esc = (s) => String(s).replace(/[,;\\]/g, '\\$&').replace(/\n/g, '\\n'); const stamp = new Date().toISOString().replace(/[-:]/g, '').slice(0, 15) + 'Z';
    const lines = ['BEGIN:VCALENDAR', 'VERSION:2.0', 'PRODID:-//CAPICUA//ES', 'CALSCALE:GREGORIAN', ...ev().flatMap((e) => ['BEGIN:VEVENT', `UID:${String(e.id).replace('.', '')}@capicua`, `DTSTAMP:${stamp}`, e.time ? `DTSTART:${e.date.replace(/-/g, '')}T${e.time.replace(':', '')}00` : `DTSTART;VALUE=DATE:${e.date.replace(/-/g, '')}`, `SUMMARY:${esc((TYPES[e.type]?.[0] || '') + ' ' + e.title)}`, e.notes ? `DESCRIPTION:${esc(e.notes)}` : '', 'END:VEVENT']).filter(Boolean), 'END:VCALENDAR'];
    const a = h('a', { href: URL.createObjectURL(new Blob([lines.join('\r\n')], { type: 'text/calendar' })), download: 'capicua-calendario.ics' }); document.body.append(a); a.click(); a.remove(); toast('Calendario exportado: impórtalo en Google Calendar', { icon: '📤' });
  };

  const upcoming = () => {
    const today = dayKey(); const list = ev().filter((e) => e.date >= today && !e.done && ['parcial', 'tarea'].includes(e.type)).sort((a, b) => a.date.localeCompare(b.date)).slice(0, 6);
    return h('div.card', h('h3', '⏰ Próximos parciales y entregas'), list.length ? list.map((e) => { const d = Math.round((new Date(e.date + 'T12:00') - new Date(today + 'T12:00')) / 86400000); return h('div.up', { style: { '--c': TYPES[e.type][1] } }, h('b', `${TYPES[e.type][0]} ${e.title}`), h('small', d === 0 ? '¡Hoy!' : d === 1 ? 'Mañana' : `En ${d} días`)); }) : h('p.soft', 'Sin fechas próximas. Añade tus parciales para que CAPIA te ayude a prepararlos.'));
  };
  mount(root, h('section.page.cal',
    h('div.cal-top', h('h1', '📅 Calendario'), h('div.btn-row', planBtn, h('button.btn.ghost', { onclick: exportIcs }, '📤 Exportar .ics'))),
    h('div.cal-layout', h('div.card.cal-card', h('div.cal-nav', h('button.btn.ghost.sm', { onclick: () => { cursor = new Date(cursor.getFullYear(), cursor.getMonth() - 1, 1); draw(); } }, '‹'), head, h('button.btn.ghost.sm', { onclick: () => { cursor = new Date(cursor.getFullYear(), cursor.getMonth() + 1, 1); draw(); } }, '›'), h('button.btn.ghost.sm', { onclick: () => { cursor = new Date(); selected = dayKey(); draw(); drawDay(); } }, 'Hoy')), grid, h('div.legend', Object.values(TYPES).map((t) => h('span', h('i', { style: { background: t[1] } }), t[2])))),
      h('div.cal-side', h('div.card', dayList), upcoming()))));
  draw(); drawDay();
}
