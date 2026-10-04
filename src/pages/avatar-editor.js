// Editor de avatar 3D: cabello, rostro, ropa, accesorios, colores, zapatos, mochila, efectos y mascota.
import { h, toast } from '../lib/dom.js';
import { state, save } from '../lib/store.js';
import { COSMETICS } from '../../shared/content/game.js';
import { buyCosmetic, regionProgress } from '../../shared/engine/game.js';
import { portrait, buildPerson } from '../three/people.js';
import { petSVG, SPECIES_BY_ID } from '../art/pets.js';
import { sfx } from '../lib/sound.js';

const UNLOCK = {
  crown: (s) => s.stats.bosses >= 3, halo: (s) => !!s.achievements['no-me-rendi'], cape: (s) => regionProgress(s, 'algebra') >= 30,
  'pi-orbit': (s) => !!s.secrets?.pi?.unlocked, pi: (s) => Object.keys(s.piFound || {}).length >= 1,
};
const owned = (s, id) => s.owned.includes(id) || s.game.pets[id];

export function avatarEditor({ onChange } = {}) {
  const S = state(); const a = S.profile.avatar;
  const canvas = h('canvas.portrait.big', { 'aria-label': 'Vista previa 3D de tu avatar. Arrastra para girarlo.' });
  const mk = () => buildPerson({ skin: a.skin, hair: a.hair, hairColor: a.hairColor, top: a.top, topColor: a.topColor, accessory: a.accessory, shoes: a.shoes, backpack: a.backpack, effect: a.effect, expr: 'happy' });
  const port = portrait(canvas, mk, { frame: 'full', size: 360, drag: true });
  const petBox = h('div.pet-preview');
  const refresh = () => { port.replace(mk()); S.game.activePet && (petBox.innerHTML = petSVG(S.game.activePet, { glow: false })); if (!S.game.activePet) petBox.innerHTML = ''; save(); onChange?.(); };

  const swatches = (key, list, extra) => h('div.swatches', list.map((c) => h('button.sw' + (a[key] === c ? '.sel' : ''), { style: { background: c }, 'aria-label': c, onclick: () => { a[key] = c; sfx.click(); redraw(); refresh(); } })), extra);
  const options = (slot, list, key = slot) => h('div.opts', list.map((it) => {
    const own = owned(S, it.id) || it.price === 0; const unl = !UNLOCK[it.id] || UNLOCK[it.id](S);
    const sel = a[key] === it.id;
    return h('button.opt' + (sel ? '.sel' : '') + (own && unl ? '' : '.locked'), { title: it.unlock && !unl ? `Se desbloquea: ${it.unlock}` : it.name, onclick: () => {
      if (!unl) { toast(`🔒 ${it.name}: ${it.unlock}`, { icon: '🔒' }); return; }
      if (!own) { const r = buyCosmetic(S, it.id); if (!r.ok) { if (it.unlock) S.owned.push('unlock:' + it.id); const rr = buyCosmetic(S, it.id); if (!rr.ok) { toast(rr.msg, { icon: 'π' }); return; } } toast(`¡Compraste ${it.name}!`, { icon: '🛍️' }); sfx.coin(); }
      a[key] = it.id; sfx.click(); redraw(); refresh();
    } }, h('span', it.name), !own ? h('small', it.price + ' π') : null);
  }));
  const section = (title, node) => h('details.ed-sec', { open: ['Cabello', 'Ropa'].includes(title) }, h('summary', title), node);
  let panel = h('div.ed-panel'); const redraw = () => { const open = [...panel.querySelectorAll('details')].map((d) => d.open); const np = build(); np.querySelectorAll('details').forEach((d, i) => { d.open = open[i] ?? d.open; }); panel.replaceWith(np); panel = np; };
  function build() {
    return h('div.ed-panel',
      section('Cabello', h('div', options('hair', COSMETICS.hair), h('label.lab', 'Color de cabello'), swatches('hairColor', COSMETICS.hairColor))),
      section('Rostro', h('div', h('label.lab', 'Tono de piel'), swatches('skin', COSMETICS.skin))),
      section('Ropa', h('div', options('top', COSMETICS.top), h('label.lab', 'Color'), swatches('topColor', COSMETICS.topColor))),
      section('Accesorios', options('accessory', COSMETICS.accessory)), section('Zapatos', options('shoes', COSMETICS.shoes)), section('Mochila', options('backpack', COSMETICS.backpack)), section('Efectos', options('effect', COSMETICS.effect)),
      section('Mascota', h('div.opts', COSMETICS.pet.map((it) => {
        const own = it.id === 'none' || owned(S, it.id) || Object.keys(S.game.pets).length && S.game.activePet === it.id;
        return h('button.opt' + (S.game.activePet === it.id || (!S.game.activePet && it.id === 'none') ? '.sel' : ''), { onclick: () => { S.game.activePet = it.id === 'none' ? null : it.id; redraw(); refresh(); } }, h('span', it.name));
      }).concat(Object.keys(S.game.pets).filter((id) => SPECIES_BY_ID[id]).map((id) => h('button.opt' + (S.game.activePet === id ? '.sel' : ''), { onclick: () => { S.game.activePet = id; redraw(); refresh(); } }, h('span', SPECIES_BY_ID[id].name)))))));
  }
  panel = build(); refresh();
  return h('div.avatar-editor', h('div.ed-stage', canvas, petBox, h('div.row', h('button.btn.ghost.sm', { onclick: () => { Object.assign(a, { hair: pickOne(['short', 'long', 'bun', 'curly']), hairColor: pickOne(COSMETICS.hairColor), skin: pickOne(COSMETICS.skin), topColor: pickOne(COSMETICS.topColor) }); redraw(); refresh(); sfx.click(); } }, '🎲 Sorpréndeme'))), panel);
}
const pickOne = (a) => a[Math.floor(Math.random() * a.length)];
