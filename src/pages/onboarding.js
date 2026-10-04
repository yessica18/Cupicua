// Primera experiencia: asignatura → avatar → mentor → CAPIA → diagnóstico (opcional) → primera misión → tutorial rápido.
import { h, mount } from '../lib/dom.js';
import { rich } from '../lib/rich.js';
import { state, save } from '../lib/store.js';
import { REGIONS } from '../../shared/content/regions.js';
import { MENTORS } from '../../shared/content/mentors.js';
import { CAPIA_SAYS, STORY } from '../../shared/content/game.js';
import { OBJECTS, REGION_OBJECT } from '../three/space.js';
import { avatarEditor } from './avatar-editor.js';
import { personPortrait } from './capia-portrait.js';
import { speak } from '../lib/voice.js';
import { sfx } from '../lib/sound.js';
import { navigate } from '../router.js';
import { tutorial } from './tutorial.js';

const START_MENTORS = ['pitagoras', 'euclides', 'alkhwarizmi', 'hipatia', 'lovelace', 'newton', 'mirzakhani', 'katherine', 'ramanujan', 'quipucamayoc', 'mayas', 'galileo'];

export function onboarding(root, done) {
  const S = state(); let step = 0;
  const steps = ['Asignatura', 'Avatar', 'Mentor', 'CAPIA'];
  const bar = () => h('div.steps', steps.map((t, i) => h('span' + (i === step ? '.on' : i < step ? '.done' : ''), `${i + 1}. ${t}`)));
  const frame = (title, sub, content, nextLabel, onNext, canNext = () => true) => {
    const btn = h('button.btn.primary.big', { onclick: () => { if (canNext()) onNext(); } }, nextLabel);
    mount(root, h('section.page.onb', bar(), h('h1', title), h('p.sub', sub), content, h('div.btn-row.sticky', step > 0 ? h('button.btn.ghost', { onclick: () => { step -= 1; render(); } }, '← Atrás') : null, btn)));
    window.scrollTo(0, 0);
  };
  const render = () => [subjectStep, avatarStep, mentorStep, capiaStep][step]();

  function subjectStep() {
    const grid = h('div.subj-grid', REGIONS.map((r) => h('button.subj' + (S.game.subject === r.id ? '.sel' : ''), { style: { '--c': r.color }, onclick: () => { S.game.subject = r.id; save(); sfx.click(); render(); } },
      h('span.ico', r.icon), h('b', r.subject), h('small', OBJECTS[REGION_OBJECT[r.id]].label), h('em', r.name))));
    frame('¿Qué quieres dominar primero?', 'Todo comienza desde donde estés. Podrás explorar todas las materias después.', grid, 'Continuar ➜', () => { step = 1; render(); }, () => !!S.game.subject || (alert('Elige una asignatura para empezar'), false));
  }
  function avatarStep() { frame('Crea tu avatar', 'Arrastra el modelo 3D para girarlo. Todo se puede cambiar luego; con PI desbloquearás más cosas.', avatarEditor(), 'Continuar ➜', () => { step = 2; render(); }); }
  function mentorStep() {
    const list = START_MENTORS.map((id) => MENTORS.find((m) => m.id === id));
    const cards = h('div.mentor-grid', list.map((m) => h('button.mentor' + (S.profile.mentor === m.id ? '.sel' : ''), { onclick: () => { S.profile.mentor = m.id; S.mentors[m.id] = S.mentors[m.id] || Date.now(); save(); sfx.click(); render(); } },
      personPortrait(m.id, { size: 150, expr: 'happy' }), h('b', m.name), h('small', `${m.years}`), h('small.sp', m.specialty), h('p', m.dialog[0]))));
    frame('Elige a tu mentor', 'Los mentores son personas reales de la historia. Te presentan sus ideas, te ponen desafíos y desbloqueas a más al avanzar.', cards, 'Continuar ➜', () => { step = 3; render(); }, () => !!S.profile.mentor || (alert('Elige un mentor'), false));
  }
  function capiaStep() {
    const m = MENTORS.find((x) => x.id === S.profile.mentor);
    const content = h('div.capia-intro', personPortrait('capia', { size: 280, expr: 'happy', drag: true }), h('div.stack',
      h('div.bubble.big', CAPIA_SAYS.intro), h('p', { html: rich(STORY.prologue) }), h('p.fine', `${m ? m.name + ' será tu mentor. ' : ''}Tu primera misión: **El misterio de los números**.`.replace(/\*\*/g, '')),
      h('div.btn-row', h('button.btn.ghost', { onclick: () => speak(CAPIA_SAYS.intro + ' ' + STORY.prologue, { force: true }) }, '🔊 Escuchar a CAPIA'), h('button.btn.good', { onclick: () => finish('/diagnostic') }, '🧭 Hacer diagnóstico (3 min)'))));
    frame('¡Conoce a CAPIA!', 'Tu compañera de estudio. Nunca te juzga: cada error es información.', content, '🚀 Empezar aventura', () => finish('/lesson/aritmetica.1'));
    setTimeout(() => { root.querySelector('.capia-intro canvas')?.__ctl?.anim('wave'); speak(CAPIA_SAYS.intro); }, 500);
  }
  function finish(route) {
    S.onboarded = true; save(); sfx.levelup();
    const go = () => { done(); navigate(route); };
    if (!S.game.tutorial) tutorial(go); else go();
  }
  render();
}
