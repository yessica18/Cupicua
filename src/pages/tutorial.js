// Tutorial rápido (solo la primera vez): desliza para conocer mapa, herramientas, combate, CAPIA, acuario, calendario y salas.
import { h } from '../lib/dom.js';
import { state, save } from '../lib/store.js';
import { sfx } from '../lib/sound.js';
import { petSVG } from '../art/pets.js';
import { monsterSVG } from '../art/monsters.js';
import { personPortrait } from './capia-portrait.js';

const SLIDES = [
  { t: '🌌 El mapa estelar', d: 'Cada materia es un objeto real del cielo: nebulosas, un magnetar, una estrella Wolf-Rayet, el Rectángulo Rojo y la misteriosa estrella de Tabby. Arrastra para girar, pellizca para acercar y toca una estrella para entrar.', art: () => h('div.tut-art.stars', h('i', '✦'), h('i', '✧'), h('i', '★'), h('b', '🔭')) },
  { t: '🧭 Tu materia, tu camino', d: 'Elige una asignatura para dominar. Cada una tiene niveles propios (1 al 16), un árbol de habilidades y un jefe final. Si algo te cuesta, CAPIA te devuelve a las bases sin juzgarte.', art: () => h('div.tut-art', h('b', '🌳')) },
  { t: '⚔️ Lecciones cortas = combates', d: 'Cada respuesta correcta hiere al enemigo. Si fallas, el enemigo te hiere a ti… pero tu error te da una pista. Si pierdes, el mismo enemigo vuelve; solo aparece uno nuevo cuando derrotas al actual.', art: () => h('div.tut-art', { html: monsterSVG('procrastinacion', 0) }) },
  { t: '🩹 Vida, curitas y vendas', d: 'Tu barra de vida se regenera sola poco a poco. Ganas curitas con rachas de aciertos y vendas con combates sin errores. Úsalas cuando las necesites.', art: () => h('div.tut-art', h('b', '🩹 🧻 ❤️')) },
  { t: '🧠 Conoce a CAPIA', d: 'Tu compañera de estudio: corrige tus errores con preguntas (nunca te da la respuesta de golpe), lee textos en voz alta, revisa tus ejercicios por foto, te acompaña con Pomodoro y se adapta a cómo te sientes.', art: () => personPortrait('capia', { size: 190, expr: 'happy', drag: true }) },
  { t: '🐙 Acuario de mascotas', d: 'Ganas conchas al ganar combates. Ábrelas y colecciona pulpos, babosas marinas, medusas, peces ángel, el cangrejo yeti y muchos más. Son cosméticas: no dan ventajas en las lecciones.', art: () => h('div.tut-art', { html: petSVG('mimic') }) },
  { t: '📅 Calendario y parciales', d: 'Anota parciales y entregas como en un calendario. CAPIA arma tu plan de estudio, con repasos espaciados, simulacros y días de descanso.', art: () => h('div.tut-art', h('b', '📅')) },
  { t: '🎮 Juegos, retos y salas', d: 'Tablas, sudokus, acertijos, desafío diario, quizzes y duelos. Crea salas para estudiar con amigos con pizarra, Pomodoro y llamadas de voz o video.', art: () => h('div.tut-art', h('b', '🎲 🧩 👥')) },
];

export function tutorial(onDone) {
  let i = 0;
  const track = h('div.tut-track', { tabindex: 0 }, SLIDES.map((s, k) => h('article.tut-slide', { 'aria-label': `Diapositiva ${k + 1} de ${SLIDES.length}` }, s.art(), h('h2', s.t), h('p', s.d))));
  const dots = h('div.dots', SLIDES.map((_, k) => h('i' + (k ? '' : '.on'))));
  const next = h('button.btn.primary.big', { onclick: () => go(i + 1) }, 'Siguiente ➜');
  const finish = () => { state().game.tutorial = true; save(); sfx.levelup(); el.remove(); onDone?.(); };
  const go = (n) => { if (n >= SLIDES.length) return finish(); i = Math.max(0, n); track.scrollTo({ left: track.clientWidth * i, behavior: 'smooth' }); upd(); sfx.click(); };
  const upd = () => { [...dots.children].forEach((d, k) => d.classList.toggle('on', k === i)); next.textContent = i === SLIDES.length - 1 ? '🚀 ¡Empezar la aventura!' : 'Siguiente ➜'; };
  track.addEventListener('scroll', () => { const n = Math.round(track.scrollLeft / track.clientWidth); if (n !== i) { i = n; upd(); } });
  const el = h('div.tutorial', { role: 'dialog', 'aria-modal': 'true', 'aria-label': 'Tutorial rápido' }, h('button.skip', { onclick: finish }, 'Saltar'), track, dots, h('div.tut-nav', h('button.btn.ghost', { onclick: () => go(i - 1) }, '← Atrás'), next));
  document.body.append(el);
  addEventListener('keydown', function k(e) { if (!document.body.contains(el)) { removeEventListener('keydown', k); return; } if (e.key === 'ArrowRight') go(i + 1); if (e.key === 'ArrowLeft') go(i - 1); });
}
