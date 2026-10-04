// Retratos 3D de CAPIA, del jugador y de los mentores (comparten un único renderer WebGL).
import { h } from '../lib/dom.js';
import { portrait, buildPerson, setExpression, playAnim } from '../three/people.js';
import { MENTOR_BY_ID } from '../../shared/content/mentors.js';
import { state } from '../lib/store.js';

/** CAPIA según el kit de marca: pelo naranja con flequillo, ojos dorados, mejillas rosas e insignia 888. */
export function capiaLook(outfit = 'base') {
  const base = { skin: '#ffe2cf', hair: 'long', hairColor: '#ff9a3c', eyeColor: '#f5a623', top: 'tee', topColor: '#6a2fe0', badge: '888', accessory: 'none', shoes: 'sneakers', backpack: 'none', effect: 'sparkles', outfit };
  const o = { lab: { top: 'labcoat' }, explorer: { top: 'explorer', accessory: 'hat' }, astro: { top: 'tee', topColor: '#e6ecff' }, engineer: { topColor: '#f59e0b' }, scientist: { top: 'labcoat', accessory: 'goggles' }, mathematician: { accessory: 'none' }, adventurer: { topColor: '#16a34a' }, pilot: { topColor: '#3b82f6' }, robotist: { topColor: '#14b8a6' } }[outfit] || {};
  return { ...base, ...o };
}
export function mentorLook(id) {
  const m = MENTOR_BY_ID[id]; if (!m) return capiaLook();
  const l = m.look; return { skin: l.skin, hair: l.hairStyle === 'wig' ? 'long' : l.hairStyle, hairColor: l.hair, topColor: l.cloth, top: 'tee', accessory: 'none', bangs: !['beard', 'turban', 'topknot', 'wig'].includes(l.hairStyle) };
}

export function personPortrait(kind, { size = 120, expr = 'happy', outfit = 'base', frame = 'bust', spin = false, drag = false } = {}) {
  const c = h('canvas.portrait', { role: 'img', 'aria-label': kind === 'capia' ? 'CAPIA' : kind === 'me' ? 'Tu avatar' : 'Mentor' });
  let look;
  if (kind === 'capia') look = capiaLook(outfit); else if (kind === 'me') { const a = state().profile.avatar; look = { skin: a.skin, hair: a.hair, hairColor: a.hairColor, top: a.top, topColor: a.topColor, accessory: a.accessory, shoes: a.shoes, backpack: a.backpack, effect: a.effect }; } else look = mentorLook(kind);
  const port = portrait(c, () => buildPerson({ ...look, expr }), { frame, size, spin, drag });
  c.__ctl = { setExpr: (e) => setExpression(port.ctl, e), anim: (a) => playAnim(port.ctl, a), port };
  return c;
}
