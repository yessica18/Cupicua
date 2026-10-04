import './styles/app.css';
import '@fontsource-variable/fraunces/index.css';
import '@fontsource-variable/quicksand/index.css';
import '@fontsource/press-start-2p/400.css';
import { h, mount, toast, $ } from './lib/dom.js';
import { initSpace, hideMap, setReduceMotion, setThrottle } from './three/space.js';
import { setPortraitReduce } from './three/people.js';
import { accounts, login, logout, session, state, save, applySettings, onChange } from './lib/store.js';
import { setAudio, startMusic, stopMusic, sfx } from './lib/sound.js';
import { setVoice, stopSpeaking } from './lib/voice.js';
import { route, resolve, onRoute, navigate, currentPath } from './router.js';
import { syncUnlocks } from '../shared/engine/game.js';
import { checkAchievements } from '../shared/engine/achievements.js';
import { authPage } from './pages/auth.js';
import { onboarding } from './pages/onboarding.js';
import { homePage } from './pages/home.js';
import { mapPage, regionPage } from './pages/map.js';
import { lessonPage } from './pages/lesson.js';
import { diagnosticPage } from './pages/diagnostic.js';
import { capiaPage } from './pages/capia.js';
import { calendarPage } from './pages/calendar.js';
import { aquariumPage } from './pages/aquarium.js';
import { labsPage } from './pages/labs.js';
import { gamesPage } from './pages/games.js';
import { communityPage } from './pages/community.js';
import { codexPage } from './pages/codex.js';
import { profilePage } from './pages/profile.js';
import { missionsPage } from './pages/missions.js';
import { quizPage } from './pages/quiz.js';
import { progressPage } from './pages/progress.js';
import { flashPage } from './pages/flash.js';
import { pomodoroChip } from './lib/pomodoro.js';
import logoH from '../public/marca/capicua-monograma.svg';

const app = document.getElementById('app');
initSpace(document.getElementById('space'));

const NAV = [
  ['/', '🏠', 'Inicio'], ['/map', '🌌', 'Mapa'], ['/missions', '⚔️', 'Misiones'], ['/capia', '🧠', 'CAPIA'], ['/calendar', '📅', 'Calendario'],
  ['/labs', '🔬', 'Labs'], ['/games', '🎲', 'Juegos'], ['/aquarium', '🐙', 'Acuario'], ['/community', '👥', 'Salas'], ['/codex', '📖', 'Códice'], ['/progress', '📈', 'Progreso'], ['/profile', '👤', 'Perfil'],
];

let shell; let view;
function ensureShell() {
  if (shell && document.body.contains(shell)) return;
  view = h('main#view', { tabindex: -1 });
  const nav = h('nav.nav', { 'aria-label': 'Navegación principal' }, NAV.map(([p, i, t]) => h('a', { href: '#' + p, 'data-p': p }, h('span.ni', i), h('span.nt', t))));
  shell = h('div.shell',
    h('header.top', h('a.brand', { href: '#/', 'aria-label': 'CAPICÚA, inicio' }, h('img', { src: logoH, alt: '' }), h('span', h('b', 'CAPICÚA'), h('small', 'El universo del saber'))), pomodoroChip(), h('div.top-actions',
      h('button.icon-btn', { title: 'Música', 'aria-label': 'Música', onclick: () => { const s = state(); s.settings.music = !s.settings.music; setAudio({ music: s.settings.music }); s.settings.music ? startMusic('space') : stopMusic(); save(); toast(s.settings.music ? 'Música activada' : 'Música apagada', { icon: s.settings.music ? '🎵' : '🔇' }); } }, '🎵'),
      h('button.icon-btn', { title: 'Tema claro/oscuro', 'aria-label': 'Cambiar tema', onclick: () => { const s = state(); s.settings.theme = s.settings.theme === 'dark' ? 'light' : 'dark'; applySettings(); save(); } }, '🌗'),
      h('button.icon-btn', { title: 'Buscar (Ctrl+K)', 'aria-label': 'Buscar', onclick: () => navigate('/codex?q=') }, '🔎'))),
    nav, view);
  app.replaceChildren(shell);
}
function markNav(path) { $$nav(path); }
function $$nav(path) { document.querySelectorAll('.nav a').forEach((a) => { const p = a.dataset.p; a.classList.toggle('on', p === '/' ? path === '/' : path.startsWith(p)); }); }

function gate(fn) {
  return (params, path) => {
    const user = session.get();
    if (!state()) { const u = user && accounts.get(user.u); if (u) { login(u); } else { stopMusic(); hideMap(); mount(app, h('div')); authPage(app, () => { app.replaceChildren(); resolve(); }); return; } }
    if (!state().onboarded) { hideMap(); mount(app, h('div')); onboarding(app, () => { app.replaceChildren(); }); return; }
    ensureShell(); hideMap(); stopSpeaking();
    shell.classList.toggle('immersive', path.startsWith('/lesson') || path.startsWith('/diagnostic'));
    markNav(path.split('?')[0]);
    fn(view, params, path);
    view.scrollTo?.(0, 0); window.scrollTo(0, 0);
    // desbloqueos silenciosos y logros
    const fresh = checkAchievements(state()); syncUnlocks(state());
    fresh.slice(0, 3).forEach((a, i) => setTimeout(() => { toast(`${a.icon} ${a.name}`, { icon: '🏅', ms: 3600 }); sfx.levelup(); }, 600 + i * 900));
    if (fresh.length > 3) setTimeout(() => toast(`🏅 …y ${fresh.length - 3} insignias más en tu perfil`, { icon: '🏅' }), 600 + 3 * 900);
    if (fresh.length) save();
  };
}
onRoute((fn, params, path) => gate(fn)(params, path));

route('/', (v) => homePage(v));
route('/map', (v) => mapPage(v));
route('/region/:id', (v, p) => regionPage(v, p.id));
route('/lesson/:id', (v, p) => lessonPage(v, p.id));
route('/diagnostic', (v) => diagnosticPage(v));
route('/capia', (v) => capiaPage(v));
route('/calendar', (v) => calendarPage(v));
route('/aquarium', (v) => aquariumPage(v));
route('/labs', (v) => labsPage(v));
route('/labs/:id', (v, p) => labsPage(v, p.id));
route('/games', (v) => gamesPage(v));
route('/games/:id', (v, p) => gamesPage(v, p.id));
route('/community', (v) => communityPage(v));
route('/codex', (v) => codexPage(v));
route('/codex/:id', (v, p) => codexPage(v, p.id));
route('/profile', (v) => profilePage(v));
route('/missions', (v) => missionsPage(v));
route('/quiz', (v) => quizPage(v));
route('/progress', (v) => progressPage(v));
route('/flash', (v) => flashPage(v));

// Ajustes globales (audio, voz, movimiento) cuando cambia el estado
onChange((s) => { setAudio({ music: s.settings.music, sfx: s.settings.sfx, volume: s.settings.volume }); setVoice({ on: s.settings.voice, rate: s.settings.rate, volume: s.settings.volume }); setReduceMotion(!!s.settings.reduceMotion); setPortraitReduce(!!s.settings.reduceMotion); });
// Menos trabajo para la GPU mientras se estudia (lecciones y diagnóstico)
addEventListener('hashchange', () => setThrottle(/#\/(lesson|diagnostic|capia|calendar)/.test(location.hash) ? 2 : 1));
addEventListener('keydown', (e) => { if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') { e.preventDefault(); navigate('/codex?q='); } });
if ('serviceWorker' in navigator && location.protocol.startsWith('http')) { /* modo sin conexión: se añade al publicar */ }

if (!location.hash) location.hash = '#/';
resolve();
window.__capicua = { state, navigate, logout: () => { logout(); location.hash = '#/'; location.reload(); } };
