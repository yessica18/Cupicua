// Enemigos conceptuales dibujados en SVG (sin violencia gráfica: son ideas que se derrotan con conocimiento).
import { ENEMIES } from '../../shared/content/game.js';

const eyes = (x1, x2, y, r = 9, angry = true, col = '#fff') => `
  <g class="m-eyes"><ellipse cx="${x1}" cy="${y}" rx="${r}" ry="${r * 1.15}" fill="${col}"/><ellipse cx="${x2}" cy="${y}" rx="${r}" ry="${r * 1.15}" fill="${col}"/>
  <circle cx="${x1 + 1.5}" cy="${y + 1}" r="${r * 0.5}" fill="#1a1150"/><circle cx="${x2 + 1.5}" cy="${y + 1}" r="${r * 0.5}" fill="#1a1150"/>
  <circle cx="${x1 + 3}" cy="${y - 2}" r="2" fill="#fff"/><circle cx="${x2 + 3}" cy="${y - 2}" r="2" fill="#fff"/></g>
  ${angry ? `<path d="M${x1 - r - 3} ${y - r - 3} L${x1 + r} ${y - r + 3}" stroke="#1a1150" stroke-width="4" stroke-linecap="round"/><path d="M${x2 + r + 3} ${y - r - 3} L${x2 - r} ${y - r + 3}" stroke="#1a1150" stroke-width="4" stroke-linecap="round"/>` : ''}`;
const teeth = (x, y, w = 36) => `<path d="M${x - w / 2} ${y} Q${x} ${y + 14} ${x + w / 2} ${y} Z" fill="#1a1150"/><path d="M${x - w / 4} ${y} l3 7 l3 -7 M${x + w / 8} ${y} l3 7 l3 -7" stroke="#fff" fill="#fff" stroke-width="1"/>`;
const blob = (col, dark) => `<defs><radialGradient id="mg" cx=".4" cy=".3" r=".8"><stop offset="0" stop-color="${col}"/><stop offset="1" stop-color="${dark}"/></radialGradient></defs>`;
const horns = (col) => `<path d="M62 52 L48 14 L84 44 Z M138 52 L152 14 L116 44 Z" fill="${col}" stroke="#1a1150" stroke-width="3" stroke-linejoin="round"/>`;
const crown = `<path d="M70 38 L76 14 L90 30 L100 8 L110 30 L124 14 L130 38 Z" fill="#ffc83a" stroke="#1a1150" stroke-width="3" stroke-linejoin="round"/><circle cx="100" cy="22" r="4" fill="#ff2d7a"/>`;

const ART = {
  procrastinacion: (c) => `${blob(c, '#3b2a8c')}<ellipse cx="100" cy="118" rx="62" ry="58" fill="url(#mg)" stroke="#1a1150" stroke-width="4"/>
    <path d="M60 78 Q100 20 142 70 L150 52 Q168 56 164 74 Q130 54 100 62 Q74 60 60 78Z" fill="#6d4bd8" stroke="#1a1150" stroke-width="3"/><circle cx="162" cy="58" r="8" fill="#fff"/>
    <path d="M72 110 q10 8 22 0 M108 110 q10 8 22 0" stroke="#1a1150" stroke-width="5" fill="none" stroke-linecap="round"/><ellipse cx="100" cy="140" rx="16" ry="9" fill="#1a1150"/>
    <text x="150" y="50" font-size="22" fill="#fff" font-weight="800" class="zzz">Z</text><text x="166" y="34" font-size="16" fill="#fff" font-weight="800" class="zzz">z</text>
    <circle cx="68" cy="132" r="8" fill="#ff7fa8" opacity=".5"/><circle cx="132" cy="132" r="8" fill="#ff7fa8" opacity=".5"/>`,
  frustracion: (c) => `${blob(c, '#8a1c3d')}<path d="M100 30 L116 50 L140 40 L140 70 L166 80 L148 104 L162 134 L132 140 L120 168 L100 150 L80 168 L68 140 L38 134 L52 104 L34 80 L60 70 L60 40 L84 50 Z" fill="url(#mg)" stroke="#1a1150" stroke-width="4" stroke-linejoin="round"/>
    ${eyes(80, 120, 92, 10)}${teeth(100, 122, 46)}<g class="steam" stroke="#fff" stroke-width="4" fill="none" stroke-linecap="round" opacity=".8"><path d="M36 60 q-8 -10 0 -20"/><path d="M164 60 q8 -10 0 -20"/></g>`,
  desidia: (c) => `${blob(c, '#4c7a0d')}<ellipse cx="100" cy="122" rx="66" ry="52" fill="url(#mg)" stroke="#1a1150" stroke-width="4"/><path d="M30 120 q-20 20 -2 48 M170 120 q20 20 2 48" stroke="#1a1150" stroke-width="12" stroke-linecap="round" fill="none"/>
    <ellipse cx="78" cy="106" rx="18" ry="14" fill="#e9f5c4" stroke="#1a1150" stroke-width="3"/><ellipse cx="122" cy="106" rx="18" ry="14" fill="#e9f5c4" stroke="#1a1150" stroke-width="3"/><path d="M60 104 h36 M104 104 h36" stroke="#1a1150" stroke-width="7"/><circle cx="82" cy="110" r="4" fill="#1a1150"/><circle cx="118" cy="110" r="4" fill="#1a1150"/>
    <path d="M86 138 q14 8 28 0" stroke="#1a1150" stroke-width="4" fill="none" stroke-linecap="round"/>`,
  caos: (c) => `${blob(c, '#8f1d68')}<g class="swirl"><path d="M100 30 C160 30 170 100 120 108 C80 114 78 76 108 76 C130 76 128 100 110 98" fill="none" stroke="url(#mg)" stroke-width="22" stroke-linecap="round"/><path d="M100 170 C40 170 30 100 80 92 C120 86 122 124 92 124" fill="none" stroke="${c}" stroke-width="22" stroke-linecap="round" opacity=".85"/></g>
    <circle cx="100" cy="100" r="30" fill="#1a1150"/>${eyes(90, 110, 98, 6, false, '#ffc83a')}<rect x="40" y="40" width="16" height="16" fill="#ffc83a" transform="rotate(20 48 48)"/><circle cx="160" cy="150" r="9" fill="#5fd3f0"/><path d="M150 40 l10 18 h-20z" fill="#ff2d7a"/>`,
  miedo: (c) => `${blob(c, '#b57a00')}<path d="M44 150 V88 Q44 34 100 34 Q156 34 156 88 V150 L136 136 L118 152 L100 136 L82 152 L64 136 Z" fill="url(#mg)" stroke="#1a1150" stroke-width="4" stroke-linejoin="round" class="tremble"/>
    ${eyes(80, 120, 84, 11, false)}<ellipse cx="100" cy="116" rx="12" ry="16" fill="#1a1150"/><path d="M52 60 q-10 6 -6 18 M148 60 q10 6 6 18" stroke="#5fd3f0" stroke-width="4" fill="none" stroke-linecap="round"/>`,
  distraccion: (c) => `${blob(c, '#136fa8')}<rect x="56" y="22" width="88" height="152" rx="18" fill="#1a1150" stroke="#1a1150" stroke-width="4"/><rect x="62" y="34" width="76" height="120" rx="8" fill="url(#mg)"/>
    <g class="notif"><circle cx="140" cy="30" r="14" fill="#ff2d7a" stroke="#fff" stroke-width="3"/><text x="140" y="36" font-size="16" text-anchor="middle" fill="#fff" font-weight="800">9</text></g>${eyes(84, 116, 84, 9)}<path d="M84 118 Q100 104 116 118" stroke="#1a1150" stroke-width="5" fill="none" stroke-linecap="round"/><circle cx="100" cy="164" r="6" fill="#5fd3f0"/>`,
  confusion: (c) => `${blob(c, '#5a8a12')}<circle cx="100" cy="110" r="64" fill="url(#mg)" stroke="#1a1150" stroke-width="4"/><text x="70" y="108" font-size="40" font-weight="800" fill="#1a1150">?</text><text x="108" y="132" font-size="46" font-weight="800" fill="#1a1150">?</text><text x="92" y="76" font-size="28" font-weight="800" fill="#fff">?</text>
    <path d="M60 60 q-14 -4 -16 -18 M140 60 q14 -4 16 -18" stroke="#1a1150" stroke-width="4" fill="none"/>`,
  tiempo: (c) => `${blob(c, '#b34a00')}<circle cx="100" cy="106" r="66" fill="url(#mg)" stroke="#1a1150" stroke-width="5"/><circle cx="100" cy="106" r="52" fill="#fff7e8" stroke="#1a1150" stroke-width="3"/>
    <g stroke="#1a1150" stroke-width="3">${[...Array(12)].map((_, i) => `<line x1="${100 + 44 * Math.cos(i * 0.5236)}" y1="${106 + 44 * Math.sin(i * 0.5236)}" x2="${100 + 50 * Math.cos(i * 0.5236)}" y2="${106 + 50 * Math.sin(i * 0.5236)}"/>`).join('')}</g>
    <path d="M100 106 L100 70 M100 106 L126 118" stroke="#1a1150" stroke-width="6" stroke-linecap="round"/><circle cx="100" cy="106" r="6" fill="#ff2d7a"/><path d="M70 40 l-12 -14 M130 40 l12 -14" stroke="#1a1150" stroke-width="8" stroke-linecap="round"/>`,
  duda: (c) => `${blob(c, '#5b6a7e')}<g class="fog"><ellipse cx="70" cy="110" rx="40" ry="32" fill="url(#mg)"/><ellipse cx="134" cy="104" rx="42" ry="34" fill="url(#mg)"/><ellipse cx="100" cy="86" rx="46" ry="36" fill="url(#mg)"/><ellipse cx="100" cy="132" rx="62" ry="26" fill="url(#mg)"/></g><path d="M40 150 Q100 170 160 150" stroke="#1a1150" stroke-width="4" fill="none" opacity=".4"/>
    ${eyes(84, 118, 104, 8, false)}<path d="M86 128 q16 -8 30 0" stroke="#1a1150" stroke-width="4" fill="none" stroke-linecap="round"/>`,
  bloqueo: (c) => `${blob(c, '#6a3aa8')}<path d="M44 60 H80 a16 16 0 1 1 40 0 H156 V96 a16 16 0 1 1 0 40 V172 H44 Z" fill="url(#mg)" stroke="#1a1150" stroke-width="4" stroke-linejoin="round"/>${eyes(78, 122, 112, 9)}<rect x="82" y="138" width="36" height="8" rx="4" fill="#1a1150"/>`,
  olvido: (c) => `${blob(c, '#8ea0b8')}<path d="M40 150 V92 Q40 30 100 30 Q160 30 160 92 V150 Q146 134 132 150 Q116 166 100 150 Q84 134 68 150 Q54 164 40 150Z" fill="url(#mg)" stroke="#1a1150" stroke-width="4" opacity=".92" class="fadey"/>
    <ellipse cx="80" cy="88" rx="10" ry="14" fill="#1a1150"/><ellipse cx="120" cy="88" rx="10" ry="14" fill="#1a1150"/><ellipse cx="100" cy="118" rx="10" ry="7" fill="#1a1150"/>`,
};

/** rank: 0 normal, 1 jefe (cuernos), 2 final (corona) */
let uid = 0;
export function monsterSVG(id, rank = 0) {
  const e = ENEMIES[id] || ENEMIES.caos; const art = ART[id] || ART.caos; const u = `mg${++uid}`;
  return `<svg class="monster rank${rank}" viewBox="0 0 200 200" role="img" aria-label="${e.name}" xmlns="http://www.w3.org/2000/svg">
    <ellipse cx="100" cy="186" rx="52" ry="8" fill="#000" opacity=".25"/>${art(e.color).replaceAll('mg', u)}${rank >= 1 ? horns('#2a1a6e') : ''}${rank >= 2 ? crown : ''}</svg>`;
}
export const ENEMY_IDS = Object.keys(ART);
