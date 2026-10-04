// Acuario: conchas que se ganan aprendiendo, criaturas marinas reales como mascotas cosméticas y una pecera viva.
import { h, mount, modal, toast, wait } from '../lib/dom.js';
import { state, save } from '../lib/store.js';
import { SPECIES, SPECIES_BY_ID, RARITY, RARITY_ODDS, petSVG, rollPet } from '../art/pets.js';
import { sfx, startMusic } from '../lib/sound.js';
import { hud } from '../lib/game-ui.js';
import { speak } from '../lib/voice.js';
import { checkAchievements } from '../../shared/engine/achievements.js';

const DUP_PI = { comun: 3, rara: 8, epica: 20, legendaria: 60 };

export function aquariumPage(root) {
  const S = state(); startMusic('calm'); let filter = 'todas';
  const shellBtn = h('button.btn.primary.big', { onclick: () => openShell() }); const grid = h('div.pet-grid'); const tank = h('div.tank', { 'aria-label': 'Tu pecera' });
  const upd = () => { shellBtn.textContent = `🐚 Abrir concha (${S.game.shells})`; shellBtn.disabled = S.game.shells <= 0; };
  const draw = () => {
    const owned = Object.keys(S.game.pets).length;
    grid.replaceChildren(...SPECIES.filter((s) => filter === 'todas' || s.rarity === filter || (filter === 'tengo' && S.game.pets[s.id])).map((s) => {
      const has = S.game.pets[s.id];
      return h('button.pet-card.r-' + s.rarity + (has ? '' : '.locked') + (S.game.activePet === s.id ? '.active' : ''), { onclick: () => detail(s), 'aria-label': has ? s.name : 'Criatura sin descubrir' }, h('div.pet-art', { html: petSVG(s.id, { glow: !!has }) }), h('b', has ? s.name : '???'), h('small', has ? s.sci : RARITY[s.rarity].name));
    }));
    count.textContent = `${owned} / ${SPECIES.length} criaturas`; drawTank(); upd();
  };
  const count = h('span.count');
  const drawTank = () => {
    const ids = Object.keys(S.game.pets).slice(0, 12);
    tank.replaceChildren(h('div.bubbles', [...Array(10)].map((_, i) => h('i', { style: { left: (i * 11 + 4) + '%', animationDelay: i * 0.7 + 's' } }))), ...ids.map((id, i) => h('button.swimmer', { style: { '--y': 8 + (i * 29) % 70 + '%', '--d': 18 + (i % 5) * 4 + 's', '--s': -i * 3 + 's', width: 70 + (i % 3) * 14 + 'px' }, onclick: () => { sfx.star(); const sp = SPECIES_BY_ID[id]; toast(`${sp.name}: ${sp.fact.slice(0, 80)}…`, { icon: '🐠' }); }, 'aria-label': SPECIES_BY_ID[id].name, html: petSVG(id, { glow: false }) })), !ids.length ? h('p.empty', 'Tu pecera está vacía. ¡Gana combates para conseguir conchas!') : null);
  };
  function detail(s) {
    const has = S.game.pets[s.id];
    modal(h('div.stack.pet-detail', h('div.pet-art.big', { html: petSVG(s.id) }), has ? h('div', h('span.rar.r-' + s.rarity, RARITY[s.rarity].name), h('h3', s.name), h('i', s.sci), h('p', h('b', 'Dato real: '), s.fact), h('p', h('b', '✨ Poder de fantasía: '), s.power, h('small', ' (solo cosmético: no cambia tus resultados)')), h('small', `Tienes ${has} ejemplar${has > 1 ? 'es' : ''}.`),
      h('div.btn-row', h('button.btn.primary', { onclick: () => { S.game.activePet = s.id; save(); sfx.click(); toast(`${s.name} te acompañará`, { icon: '🐠' }); draw(); } }, 'Elegir como mascota'), h('button.btn.ghost', { onclick: () => speak(`${s.name}. ${s.fact}`, { force: true }) }, '🔊'))) : h('p', 'Aún no has descubierto esta criatura. Gana combates, abre conchas y aparecerá. Rareza: ' + RARITY[s.rarity].name)), { title: has ? s.name : 'Criatura misteriosa' });
  }
  async function openShell() {
    if (S.game.shells <= 0) return; S.game.shells -= 1; const sp = rollPet(); const dup = !!S.game.pets[sp.id]; S.game.pets[sp.id] = (S.game.pets[sp.id] || 0) + 1;
    if (dup) { S.pi += DUP_PI[sp.rarity]; S.piEarned = (S.piEarned || 0) + DUP_PI[sp.rarity]; } save();
    const shell = h('div.shell-open', h('div.shell-ico', '🐚')); const m = modal(shell, { title: '' }); sfx.open(); await wait(1100);
    shell.replaceChildren(h('div.reveal.r-' + sp.rarity, h('span.rar.r-' + sp.rarity, RARITY[sp.rarity].name), h('div.pet-art.big', { html: petSVG(sp.id) }), h('h2', dup ? `¡${sp.name} otra vez!` : `¡Nueva criatura: ${sp.name}!`), h('i', sp.sci), h('p', sp.fact), dup ? h('p.ok', `Ejemplar repetido: +${DUP_PI[sp.rarity]} π`) : h('p.ok', '¡Se añadió a tu colección!'), h('div.btn-row', h('button.btn.primary', { onclick: () => { S.game.activePet = sp.id; save(); m.close(); draw(); } }, 'Elegir como mascota'), h('button.btn.ghost', { onclick: () => { m.close(); draw(); } }, 'Seguir'))));
    if (sp.rarity !== 'comun') sfx.levelup(); else sfx.coin();
    const fresh = checkAchievements(S); fresh.forEach((a) => toast(`${a.icon} ${a.name}`, { icon: '🏅' })); draw();
  }
  mount(root, h('section.page.aqua', hud(),
    h('div.aq-head', h('div', h('h1', '🐙 Acuario CAPICÚA'), h('p.sub', 'Criaturas marinas reales que te acompañan. Son solo cosméticas: no dan ventajas académicas.'), count), shellBtn),
    tank,
    h('details.odds', h('summary', '🎲 Probabilidades publicadas'), h('p', 'No se paga con dinero real: las conchas se ganan aprendiendo.'), h('ul', RARITY_ODDS.map((o) => h('li', `${o.name}: ${o.pct}%`))), h('small', 'Si sale un ejemplar repetido, recibes π.')),
    h('div.filters', ['todas', 'tengo', 'comun', 'rara', 'epica', 'legendaria'].map((f) => h('button.chip' + (f === filter ? '.on' : ''), { onclick: () => { filter = f; draw(); [...document.querySelectorAll('.filters .chip')].forEach((c) => c.classList.toggle('on', c.dataset.f === f)); }, 'data-f': f }, { todas: 'Todas', tengo: 'Mis criaturas', comun: 'Comunes', rara: 'Raras', epica: 'Épicas', legendaria: 'Legendarias' }[f]))),
    grid));
  draw();
}
