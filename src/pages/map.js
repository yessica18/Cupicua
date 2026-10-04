// Mapa estelar 3D + región con árbol de habilidades (nodos con hover y detalles).
import { h, mount, toast, modal, pick } from '../lib/dom.js';
import { rich, richEl } from '../lib/rich.js';
import { state, save } from '../lib/store.js';
import { showMap, focus, OBJECTS, REGION_OBJECT } from '../three/space.js';
import { REGIONS, REGION_BY_ID, LEVEL_BY_ID } from '../../shared/content/regions.js';
import { regionProgress, masteryOf, nodeStatus, prereqGaps, regionUnlockedFor, requirementsOf, levelsMasteredCount, secretUnlocked } from '../../shared/engine/game.js';
import { WEAPONS, CURIOSITIES, SECRETS, PI_FRAGMENTS, ENEMIES, SIDE_MISSIONS } from '../../shared/content/game.js';
import { STATUS, stageOf } from '../../shared/engine/mastery.js';
import { startMusic, sfx } from '../lib/sound.js';
import { hud } from '../lib/game-ui.js';
import { navigate } from '../router.js';
import { speak } from '../lib/voice.js';

export function mapPage(root) {
  const S = state(); startMusic('space');
  const regions = REGIONS.map((r) => ({ id: r.id, name: r.name, icon: r.icon, color: r.color, pct: regionProgress(S, r.id), status: regionUnlockedFor(S, r.id) ? 'open' : 'far' }));
  const sheet = h('div.map-sheet', { hidden: true });
  mount(root, h('section.page.map-page', hud(), h('div.map-hint', '🖐️ Arrastra para girar · pellizca o usa la rueda para acercar · toca una estrella'), sheet));
  const info = (id) => {
    const r = REGION_BY_ID[id]; const pct = regionProgress(S, id); const gaps = r.prereq?.filter((p) => masteryOf(S, `${p.r}.${p.n}`).pct < 25) || [];
    sheet.hidden = false; focus(id); sfx.star();
    sheet.replaceChildren(h('button.x', { onclick: () => { sheet.hidden = true; } }, '✕'), h('div.sheet-row', h('div.ico-big', { style: { background: r.color + '33' } }, r.icon), h('div', h('h2', r.name), h('small', `${r.subject} · ${OBJECTS[REGION_OBJECT[id]].label}`), h('div.bar', h('i', { style: { width: pct + '%' } })), h('small', `${pct}% · ${levelsMasteredCount(S, id)}/16 niveles dominados`))),
      h('p', r.story.slice(0, 190) + '…'), gaps.length ? h('p.soft', `Sugerencia: fortalece primero ${gaps.map((g) => LEVEL_BY_ID[`${g.r}.${g.n}`].name).join(', ')}.`) : null,
      h('div.btn-row', h('button.btn.primary', { onclick: () => navigate('/region/' + id) }, 'Entrar a la región ➜')));
  };
  showMap(regions, { onPick: info, focusId: S.game.subject && !history.state?.focused ? null : null });
  if (S.game.subject) setTimeout(() => focus(S.game.subject), 400);
}

/* ───── Región: árbol de habilidades ───── */
const ROW_H = 17;
function layout(region) {
  const depth = {}; region.levels.forEach((l) => { depth[l.id] = l.req.filter((q) => q.startsWith(region.id)).reduce((m, q) => Math.max(m, depth[q] + 1), 0); });
  const rows = {}; region.levels.forEach((l) => (rows[depth[l.id]] ||= []).push(l));
  const pos = {}; const W = 100; const nRows = Object.keys(rows).length;
  Object.entries(rows).forEach(([d, list]) => list.forEach((l, i) => {
    // las filas de un solo nodo serpentean para que el camino se vea como un sendero
    const x = list.length === 1 ? 50 + Math.sin(Number(d) * 1.25) * 24 : ((i + 1) / (list.length + 1)) * W;
    pos[l.id] = { x, y: 10 + Number(d) * ROW_H };
  }));
  pos.__h = 20 + (nRows - 1) * ROW_H;
  return pos;
}
const STATUS_INFO = { [STATUS.MASTERED]: ['🟣', 'Dominado', '#a855f7'], [STATUS.PROGRESS]: ['🟡', 'En progreso', '#fbbf24'], [STATUS.DISCOVERED]: ['🔵', 'Descubierto', '#38bdf8'], [STATUS.LOCKED]: ['🔒', 'Bloqueado', '#64748b'] };

export function regionPage(root, id) {
  const S = state(); const r = REGION_BY_ID[id]; if (!r) { navigate('/map'); return; }
  startMusic(r.music);
  const pos = layout(r); const pct = regionProgress(S, id);
  const tip = h('div.tooltip', { hidden: true }); const panel = h('aside.node-panel');
  const svgNS = 'http://www.w3.org/2000/svg';
  const svg = document.createElementNS(svgNS, 'svg'); svg.setAttribute('viewBox', `0 0 100 ${pos.__h}`); svg.setAttribute('class', 'tree'); svg.setAttribute('preserveAspectRatio', 'xMidYMid meet'); svg.setAttribute('role', 'group'); svg.setAttribute('aria-label', `Árbol de habilidades de ${r.subject}`);
  const mk = (tag, attrs) => { const e = document.createElementNS(svgNS, tag); for (const [k, v] of Object.entries(attrs)) e.setAttribute(k, v); return e; };
  r.levels.forEach((l) => l.req.filter((q) => q.startsWith(id)).forEach((q) => { const a = pos[q]; const b = pos[l.id]; svg.append(mk('path', { d: `M${a.x} ${a.y} C${a.x} ${(a.y + b.y) / 2} ${b.x} ${(a.y + b.y) / 2} ${b.x} ${b.y}`, class: 'edge' + (masteryOf(S, q).pct >= 40 ? ' lit' : ''), fill: 'none' })); }));
  const select = (l) => {
    const st = nodeStatus(S, l.id); const m = masteryOf(S, l.id); const [ico, stName] = STATUS_INFO[st];
    const reqs = requirementsOf(l.id).filter((x) => !x.soft); const unlocks = r.levels.filter((x) => x.req.includes(l.id));
    const gaps = prereqGaps(S, l.id, 40);
    panel.replaceChildren(h('div.np-head', h('span.badge', `${ico} ${stName}`), h('h3', l.name), h('small', `Nivel ${l.n} · ${m.stage.icon} ${m.stage.name} · ${m.pct}%`)),
      h('div.bar', h('i', { style: { width: m.pct + '%' } })), richEl(l.idea),
      reqs.length ? h('p', h('b', 'Necesitas: '), reqs.map((x) => LEVEL_BY_ID[x.id].name).join(', ')) : null,
      unlocks.length ? h('p', h('b', 'Desbloquea: '), unlocks.map((x) => x.name).join(', ')) : null,
      h('p', h('b', 'Recompensa: '), l.boss ? '+100 PI, +500 XP, la región restaurada y 3 conchas' : '+10 PI · XP · 1 concha del acuario'),
      gaps.length ? h('p.soft', `💡 Para completar esta misión conviene fortalecer: ${gaps.map((g) => g.level.name).join(', ')}.`) : null,
      h('button.btn.primary.big', { onclick: () => navigate('/lesson/' + l.id) }, l.boss ? '⚔️ Enfrentar al jefe' : '⚔️ Empezar la lección'));
    sfx.click();
  };
  const nodes = r.levels.map((l) => {
    const st = nodeStatus(S, l.id); const p = pos[l.id]; const [ico, , col] = STATUS_INFO[st];
    const g = mk('g', { class: 'node ' + st + (l.boss ? ' boss' : ''), transform: `translate(${p.x} ${p.y})`, tabindex: 0, role: 'button', 'aria-label': `${l.name}, ${STATUS_INFO[st][1]}, ${masteryOf(S, l.id).pct}%` });
    g.append(mk('circle', { r: l.boss ? 6.2 : 4.4, fill: col, 'fill-opacity': st === STATUS.LOCKED ? 0.25 : 0.9, stroke: '#fff', 'stroke-opacity': 0.8, 'stroke-width': 0.5 }));
    const t = mk('text', { 'text-anchor': 'middle', y: 1.5, 'font-size': l.boss ? 5 : 3.6, fill: '#fff' }); t.textContent = l.boss ? '👑' : st === STATUS.LOCKED ? '🔒' : l.n; g.append(t);
    const lab = mk('text', { 'text-anchor': 'middle', y: l.boss ? 10 : 8.2, 'font-size': 2.5, class: 'nlabel' }); lab.textContent = l.name.replace('JEFE · ', '').slice(0, 22); g.append(lab);
    const show = (e) => { const m = masteryOf(S, l.id); const ps = e.clientX ? { x: e.clientX, y: e.clientY } : (() => { const b = g.getBoundingClientRect(); return { x: b.x + b.width / 2, y: b.y }; })();
      tip.hidden = false; tip.style.left = Math.min(innerWidth - 270, ps.x + 14) + 'px'; tip.style.top = Math.min(innerHeight - 190, ps.y + 12) + 'px';
      const reqs = requirementsOf(l.id).filter((x) => !x.soft); const unl = r.levels.filter((x) => x.req.includes(l.id));
      tip.replaceChildren(h('b', l.name), h('small', `Nivel ${l.n} · ${STATUS_INFO[nodeStatus(S, l.id)][1]} · ${m.pct}%`), h('p', l.idea.slice(0, 110) + (l.idea.length > 110 ? '…' : '')), h('small', `Requiere: ${reqs.map((x) => LEVEL_BY_ID[x.id].name).join(', ') || '—'}`), h('small', `Recompensa: ${l.boss ? '100 PI' : '10 PI'} · Desbloquea: ${unl.map((x) => x.name).join(', ') || '—'}`)); };
    g.addEventListener('pointerenter', show); g.addEventListener('pointermove', show); g.addEventListener('pointerleave', () => { tip.hidden = true; }); g.addEventListener('focus', show); g.addEventListener('blur', () => { tip.hidden = true; });
    g.addEventListener('click', () => select(l)); g.addEventListener('keydown', (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); select(l); } });
    return g;
  });
  nodes.forEach((n) => svg.append(n));

  const weapon = WEAPONS.find((w) => w.id === r.weapon); const wOwned = masteryOf(S, `${weapon.unlock.r}.${weapon.unlock.n}`).pct >= 30;
  const curios = CURIOSITIES.filter((c) => c.region === id);
  const secrets = SECRETS.filter((s) => s.region === id); const pis = PI_FRAGMENTS.filter((p) => p.region === id);
  const objects = h('div.world-objs', curios.map((c, i) => h('button.wobj', { style: { '--d': i * 0.7 + 's' }, title: c.title, 'aria-label': `Curiosidad: ${c.title}`, onclick: () => curiosity(c) }, c.icon)),
    secrets.map((s) => { const open = secretUnlocked(S, s) || S.secrets[s.id]?.unlocked; return h('button.wobj.secret' + (open ? '' : '.locked'), { title: open ? s.name : '🔐 Zona secreta', onclick: () => secret(s, open) }, open ? s.icon : '🔐'); }),
    pis.map((p) => { const ok = masteryOf(S, `${p.region}.${p.n}`).pct >= 20; return ok ? h('button.wobj.pi', { title: 'π te observa…', onclick: () => piFragment(p) }, S.piFound[p.id] ? 'π' : '✨') : null; }));

  mount(root, h('section.page.region', hud(),
    h('div.region-head', { style: { '--c': r.color } }, h('div.ico-big', r.icon), h('div', h('h1', r.name), h('p', `${r.subject} · ${OBJECTS[REGION_OBJECT[id]].label}`), h('div.bar', h('i', { style: { width: pct + '%' } })), h('small', `${pct}% de la región restaurada · ${levelsMasteredCount(S, id)}/16 dominados`)), h('button.btn.ghost', { onclick: () => speak(r.story, { force: true }) }, '🔊 Historia')),
    h('p.story', r.story),
    h('div.region-body', h('div.tree-wrap', svg, tip), panel),
    objects,
    h('div.grid.region-cards',
      h('div.card', h('h3', '⚔️ Jefe final'), h('b', r.boss.name), h('p', r.boss.lore), h('small', `Enemigo: ${ENEMIES[r.boss.enemy].name}`), S.bosses[id] ? h('p.ok', '👑 ¡Derrotado!') : null),
      h('div.card', h('h3', `${weapon.icon} Arma de la región`), h('b', weapon.name), h('code', weapon.symbol), h('p', weapon.power), h('small', wOwned ? '✅ Desbloqueada' : `🔒 Domina el nivel ${weapon.unlock.n} de ${REGION_BY_ID[weapon.unlock.r].subject}`)),
      h('div.card', h('h3', '📜 Misiones'), SIDE_MISSIONS.filter((m) => m.region === id).map((m) => h('a.mission-link', { href: '#/missions' }, `${m.icon} ${m.title}`)), SIDE_MISSIONS.every((m) => m.region !== id) ? h('small', 'Pronto más misiones.') : null))));
  // Primera selección útil
  const recommended = r.levels.find((l) => masteryOf(S, l.id).pct < 81 && prereqGaps(S, l.id, 25).length === 0) || r.levels[0]; select(recommended);
}

function curiosity(c) {
  const S = state(); const first = !S.curiosities[c.id]; S.curiosities[c.id] = Date.now(); if (first) { S.xp += 10; S.pi += 2; } save(); sfx.star();
  modal(h('div.stack', h('div.big-ico', c.icon), h('p.know', h('b', '¿SABÍAS QUE…? '), c.text), h('small', c.era === 'actual' ? '📰 Información actual: usa 🌐 Buscar para verificar novedades.' : '📜 Información histórica'), first ? h('small.ok', '+10 XP · +2 π por descubrirla') : null, h('button.btn.ghost', { onclick: () => speak(c.text, { force: true }) }, '🔊 Escuchar')), { title: c.title });
}
function secret(s, open) {
  const S = state();
  if (!open) { modal(h('div.stack', h('p', s.lore), h('p.soft', `Para abrir esta zona domina el nivel ${s.need.n} de ${REGION_BY_ID[s.need.r].subject} (${s.need.mastery}%).`)), { title: '🔐 Zona secreta' }); return; }
  S.secrets[s.id] = S.secrets[s.id] || { unlocked: Date.now(), done: false }; save();
  modal(h('div.stack', h('p', s.lore), h('p', S.secrets[s.id].done ? '✅ Ya completaste este desafío.' : 'Desafío secreto: resuelve un ejercicio para llevarte el tesoro.'), S.secrets[s.id].done ? null : h('button.btn.primary', { onclick: () => navigate('/games/secret-' + s.id) }, 'Aceptar desafío')), { title: `${s.icon} ${s.name}` });
}
function piFragment(p) {
  const S = state(); const found = !!S.piFound[p.id];
  modal(h('div.stack', h('p', p.text), h('b', p.q.prompt), h('div.choices', p.q.choices.map((c, i) => h('button.choice', { onclick: (e) => { const ok = i === p.q.answer; e.target.classList.add(ok ? 'right' : 'wrongc'); if (ok && !found) { S.piFound[p.id] = Date.now(); S.xp += 30; S.pi += 5; save(); toast('Fragmento de π encontrado (+30 XP, +5 π)', { icon: 'π' }); sfx.levelup(); } h('p'); e.target.parentElement.after(h('p', ok ? p.q.explain : 'Casi. ' + p.q.explain)); } }, c)))), { title: `π · ${p.title}` });
}
