// Inicio: saludo, objetivo diario, continuar aventura, repasos, desafío diario, parcial y CAPIA.
import { h, mount, toast } from '../lib/dom.js';
import { rich, richEl } from '../lib/rich.js';
import { state, save } from '../lib/store.js';
import { hud, avatarCanvas, petBadge } from '../lib/game-ui.js';
import { recommendNext, pendingReviews, dailyChallenge, dayKey, completeDaily, playerLevel, masteryOf, totalMastery, regionProgress } from '../../shared/engine/game.js';
import { REGIONS, LEVEL_BY_ID, REGION_BY_ID } from '../../shared/content/regions.js';
import { IDENTITY, STORY } from '../../shared/content/game.js';
import { navigate } from '../router.js';
import { personPortrait } from './capia-portrait.js';
import { speak } from '../lib/voice.js';
import { sfx } from '../lib/sound.js';

export function homePage(root) {
  const S = state(); const name = S.profile.name || 'aventurero';
  const rec = recommendNext(S); const reviews = pendingReviews(S); const daily = dailyChallenge(); const doneDaily = S.daily[daily.key]?.done;
  const today = S.days[dayKey()] || { q: 0, lessons: 0 };
  const goal = 5; const goalPct = Math.min(100, Math.round((today.q / goal) * 100));
  const nextExam = S.game.events.filter((e) => e.type === 'parcial' && e.date >= dayKey()).sort((a, b) => a.date.localeCompare(b.date))[0];
  const hour = new Date().getHours(); const hello = hour < 12 ? 'Buenos días' : hour < 19 ? 'Buenas tardes' : 'Buenas noches';
  const lv = rec.level; const reg = REGION_BY_ID[lv.region];
  const card = (cls, ...k) => h('div.card.hcard' + cls, ...k);

  mount(root, h('section.page.home',
    hud(),
    h('div.hero',
      h('div.hero-txt', h('p.eyebrow', `${hello}, ${name}`), h('h1', '¿Qué quieres aprender hoy?'), h('p.sub', IDENTITY[(new Date().getDate()) % IDENTITY.length]),
        h('div.btn-row', h('button.btn.primary.big', { onclick: () => navigate('/lesson/' + lv.id) }, `🚀 ${rec.kind === 'continue' ? 'Continuar aventura' : 'Comenzar misión'}`), h('button.btn.ghost', { onclick: () => navigate('/map') }, '🌌 Abrir mapa estelar'))),
      h('div.hero-chars', personPortrait('capia', { size: 230, expr: 'happy', outfit: S.profile.capiaOutfit, drag: true }), h('div.me-box', avatarCanvas({ size: 180, frame: 'bust' }), petBadge(56)))),
    h('div.grid.home-grid',
      card('.cont', h('h3', '🗺️ Continuar aventura'), h('div.cont-body', h('div.ico-big', { style: { background: reg.color + '33' } }, reg.icon), h('div', h('b', lv.name), h('small', `${reg.name} · Nivel ${lv.n}`), h('div.bar', h('i', { style: { width: masteryOf(S, lv.id).pct + '%' } })), h('small', `${masteryOf(S, lv.id).stage.name}`))), h('button.btn.primary', { onclick: () => navigate('/lesson/' + lv.id) }, 'Entrar')),
      card('.goal', h('h3', '🎯 Objetivo de hoy'), h('p', `${Math.min(today.q, goal)} / ${goal} ejercicios`), h('div.bar.big', h('i', { style: { width: goalPct + '%' } })), h('small', goalPct >= 100 ? '¡Objetivo cumplido! Eso es constancia.' : 'Cinco ejercicios bastan para mantener tu racha.'), h('small', `🔥 Racha: ${S.streak.count} día(s). Los descansos no la rompen.`)),
      card('.rev', h('h3', '🧠 Repasos pendientes'), reviews.length ? h('div.stack', reviews.slice(0, 3).map((r) => h('div.rev-item', h('b', r.level.name), h('small', r.days ? `Hace ${r.days} día${r.days > 1 ? 's' : ''} lo aprendiste. ¿Lo recuerdas?` : 'Repaso de hoy')))).concat([h('button.btn.good', { onclick: () => navigate('/quiz?mode=repaso') }, 'Repasar ahora')]) : h('p', 'Todo al día. Los repasos aparecen cuando algo empieza a olvidarse.')),
      card('.daily', h('h3', '⚡ Desafío del día'), h('p', daily.kind), h('small', doneDaily ? '✅ ¡Completado hoy!' : 'Recompensa: XP, PI y una sorpresa'), h('button.btn.primary', { disabled: doneDaily, onclick: () => navigate('/games/daily') }, doneDaily ? 'Hecho' : 'Aceptar reto')),
      card('.exam', h('h3', '📅 Preparar mi parcial'), nextExam ? h('div', h('b', nextExam.title), h('p', `Faltan ${Math.max(0, Math.round((new Date(nextExam.date + 'T12:00') - new Date(dayKey() + 'T12:00')) / 86400000))} días`)) : h('p', 'Pon la fecha y CAPIA arma tu plan con repasos, simulacros y descansos.'), h('button.btn.ghost', { onclick: () => navigate('/calendar') }, 'Abrir calendario')),
      card('.capia-c', h('h3', '🩷 Estudiar con CAPIA'), h('p', 'Pregúntale lo que sea, sube una foto de tu ejercicio o un PDF, o estudien juntos con Pomodoro.'), h('button.btn.primary', { onclick: () => navigate('/capia') }, 'Hablar con CAPIA')),
      card('.games', h('h3', '🎲 Juegos'), h('p', 'Tablas de multiplicar, sudokus, acertijos y 24. Aprende jugando.'), h('button.btn.ghost', { onclick: () => navigate('/games') }, 'Jugar')),
      card('.flashc', h('h3', '🃏 Tarjetas de memoria'), h('p', 'Recuperación activa y repaso espaciado de fórmulas y de tus propios errores.'), h('button.btn.ghost', { onclick: () => navigate('/flash') }, 'Repasar tarjetas')),
      card('.pets', h('h3', '🐚 Acuario'), h('p', `Tienes ${S.game.shells} concha${S.game.shells === 1 ? '' : 's'} sin abrir.`), h('button.btn.ghost', { onclick: () => navigate('/aquarium') }, 'Abrir conchas'))),
    h('div.card.universe', h('h3', '🌎 El Universo CAPICÚA'), h('p', { html: rich(STORY.prologue) }), h('div.mini-prog', REGIONS.map((r) => h('a.mp', { href: '#/region/' + r.id, style: { '--c': r.color }, title: `${r.name}: ${regionProgress(S, r.id)}%` }, h('span', r.icon), h('i', h('u', { style: { width: regionProgress(S, r.id) + '%' } }))))), h('small', `Dominio total: ${totalMastery(S)}%`))));
  setTimeout(() => root.querySelector('.hero-chars canvas')?.__ctl?.anim('wave'), 500);
}
