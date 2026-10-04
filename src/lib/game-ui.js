// Piezas reutilizables del juego: HUD, barras de vida, mascota activa, retratos de personajes.
import { h } from './dom.js';
import { state, save } from './store.js';
import { playerLevel, regionProgress } from '../../shared/engine/game.js';
import { portrait, buildPerson } from '../three/people.js';
import { petSVG } from '../art/pets.js';
import { ENEMIES } from '../../shared/content/game.js';
import { monsterSVG } from '../art/monsters.js';
import { sfx } from './sound.js';
import { REGION_BY_ID } from '../../shared/content/regions.js';

export const MAX_HP = 100;
/** Regeneración natural lenta: 1 PV cada 30 s (también puedes curarte con curitas y vendas). */
export function syncHP() {
  const g = state().game; const now = Date.now();
  if (g.hp < MAX_HP) { const gain = Math.floor((now - g.hpAt) / 30000); if (gain > 0) { g.hp = Math.min(MAX_HP, g.hp + gain); g.hpAt = now; } } else g.hpAt = now;
  return g.hp;
}
export function setHP(v) { const g = state().game; g.hp = Math.max(0, Math.min(MAX_HP, Math.round(v))); g.hpAt = Date.now(); save(); }

export const hpBar = (cur, max, { label = '', cls = '', id } = {}) => {
  const pct = Math.max(0, Math.min(100, (cur / max) * 100));
  return h('div.hpbar' + (cls ? '.' + cls : ''), { id, 'data-pct': pct }, label && h('span.hp-l', label), h('div.hp-track', { role: 'progressbar', 'aria-valuemin': 0, 'aria-valuemax': max, 'aria-valuenow': Math.round(cur) }, h('i.hp-fill', { style: { width: pct + '%' } }), h('i.hp-ghost', { style: { width: pct + '%' } })), h('b.hp-n', `${Math.round(cur)}/${max}`));
};
export function setBar(bar, cur, max) {
  const pct = Math.max(0, Math.min(100, (cur / max) * 100));
  bar.querySelector('.hp-fill').style.width = pct + '%'; setTimeout(() => { const g = bar.querySelector('.hp-ghost'); if (g) g.style.width = pct + '%'; }, 450);
  bar.querySelector('.hp-n').textContent = `${Math.round(cur)}/${max}`; bar.querySelector('.hp-track').setAttribute('aria-valuenow', Math.round(cur));
  bar.classList.toggle('low', pct < 30);
}

export function avatarPerson(extra = {}) {
  const s = state(); const a = s.profile.avatar;
  return buildPerson({ skin: a.skin, hair: a.hair, hairColor: a.hairColor, top: a.top, topColor: a.topColor, accessory: a.accessory, shoes: a.shoes, backpack: a.backpack, effect: a.effect, ...extra });
}
export function avatarCanvas({ size = 160, frame = 'bust', spin = false, drag = false, expr = 'happy' } = {}) {
  const c = h('canvas.portrait', { 'aria-label': 'Tu avatar 3D', role: 'img' });
  portrait(c, () => avatarPerson({ expr }), { frame, size, spin, drag });
  return c;
}
export function petBadge(size = 64) {
  const id = state().game.activePet; if (!id) return null;
  return h('div.pet-buddy', { style: { width: size + 'px', height: size + 'px' }, html: petSVG(id, { glow: false }), title: 'Tu mascota' });
}

/** Barra superior con HP, nivel, XP, PI, racha e inventario */
export function hud() {
  const s = state(); const pl = playerLevel(s.xp);
  syncHP();
  const items = s.game.items;
  const el = h('div.hud',
    h('div.hud-chip.lv', { title: 'Nivel de aventurero' }, h('b', 'Nv ' + pl.level), h('div.xpbar', h('i', { style: { width: pl.pct + '%' } }))),
    h('div.hud-chip.hp', { title: 'Tu vida' }, '❤️', hpBar(s.game.hp, MAX_HP, { cls: 'mini' })),
    h('div.hud-chip', { title: 'Racha de estudio (con descansos y protección)' }, '🔥 ', h('b', s.streak.count)),
    h('div.hud-chip', { title: 'Monedas PI: solo para cosméticos' }, 'π ', h('b', s.pi)),
    h('div.hud-chip', { title: 'Curitas y vendas' }, '🩹 ', h('b', items.curita), ' · 🧻 ', h('b', items.venda)),
    h('div.hud-chip', { title: 'Conchas del acuario' }, '🐚 ', h('b', s.game.shells)));
  return el;
}

export function useItem(kind) {
  const g = state().game;
  if (g.items[kind] <= 0) return { ok: false, msg: 'No tienes ese objeto.' };
  syncHP(); if (g.hp >= MAX_HP) return { ok: false, msg: 'Tu vida ya está al máximo.' };
  const heal = kind === 'curita' ? 15 : 35; g.items[kind] -= 1; setHP(g.hp + heal); sfx.heal();
  return { ok: true, heal };
}

export function enemyFor(levelId, level) {
  const g = state().game;
  if (!g.enemies[levelId]) {
    const pool = ['procrastinacion', 'frustracion', 'desidia', 'caos', 'miedo', 'distraccion', 'confusion', 'tiempo', 'duda', 'bloqueo', 'olvido'];
    let id;
    if (level.boss) id = REGION_BY_ID[level.region].boss.enemy || 'caos';
    else id = pool[(level.n * 7 + levelId.length * 3 + (g.seedSpawn = (g.seedSpawn || 0) + 1)) % pool.length];
    const max = level.boss ? 200 : 100;
    g.enemies[levelId] = { id, hp: max, max, rank: level.boss ? (level.n === 16 && level.region === 'ingenieria' ? 2 : 1) : 0 };
    save();
  }
  return g.enemies[levelId];
}
export const monsterEl = (e) => h('div.monster-wrap', { html: monsterSVG(e.id, e.rank), title: ENEMIES[e.id]?.name });
