// Laboratorios virtuales: modifica variables en tiempo real y observa el resultado.
import { h, mount } from '../lib/dom.js';
import { rich, richEl } from '../lib/rich.js';
import { state, save } from '../lib/store.js';
import { navigate } from '../router.js';
import { startMusic, sfx } from '../lib/sound.js';

const LABS = [
  ['mecanica', '🔬', 'Mecánica', 'Proyectiles y F = ma'], ['electricidad', '⚡', 'Electricidad', 'Ley de Ohm, serie y paralelo'], ['estadistica', '📊', 'Estadística', 'Media, dispersión y valores atípicos'],
  ['geometria', '📐', 'Geometría', 'Círculo y teorema de Pitágoras'], ['algebra', '🧮', 'Álgebra', 'Funciones y parábolas'], ['vectorial', '🌀', 'Vectorial', 'Suma, producto punto y campos'],
  ['calculo', '🌌', 'Cálculo', 'Tangente, derivada y sumas de Riemann'], ['matrices', '🤖', 'Matrices', 'Transformaciones lineales'],
];
const COLORS = { bg: '#120b33', grid: 'rgba(160,140,255,.15)', axis: 'rgba(255,255,255,.55)', a: '#5fd3f0', b: '#ff2d7a', c: '#ffc83a', d: '#7b3cf0', e: '#34d399', t: '#e9e6ff' };

function slider(label, min, max, step, val, on, unit = '') {
  const out = h('b.sv', val + unit); const inp = h('input', { type: 'range', min, max, step, value: val, 'aria-label': label, oninput: () => { out.textContent = (+inp.value).toFixed(step < 1 ? 2 : 0).replace(/\.00$/, '') + unit; on(+inp.value); } });
  return h('label.slider', h('span', label), inp, out);
}
function canvas(w = 640, hh = 400) { const c = h('canvas.lab-canvas', { width: w, height: hh, role: 'img' }); return c; }
const ctxOf = (c) => { const g = c.getContext('2d'); g.clearRect(0, 0, c.width, c.height); g.fillStyle = COLORS.bg; g.fillRect(0, 0, c.width, c.height); return g; };
function axes(g, c, sx, sy, ox, oy, step = 1) {
  g.lineWidth = 1; g.strokeStyle = COLORS.grid; g.font = '12px Quicksand, sans-serif'; g.fillStyle = COLORS.t;
  for (let x = Math.ceil(-ox / sx / step) * step; ox + x * sx < c.width; x += step) { g.beginPath(); g.moveTo(ox + x * sx, 0); g.lineTo(ox + x * sx, c.height); g.stroke(); if (x && sx * step > 26) g.fillText(x, ox + x * sx + 2, oy + 12); }
  for (let y = Math.ceil((oy - c.height) / sy / step) * step; oy - y * sy > 0; y += step) { g.beginPath(); g.moveTo(0, oy - y * sy); g.lineTo(c.width, oy - y * sy); g.stroke(); if (y && sy * step > 22) g.fillText(y, ox + 3, oy - y * sy - 2); }
  g.strokeStyle = COLORS.axis; g.lineWidth = 1.6; g.beginPath(); g.moveTo(0, oy); g.lineTo(c.width, oy); g.moveTo(ox, 0); g.lineTo(ox, c.height); g.stroke();
}
const plot = (g, f, sx, sy, ox, oy, c, color, x0 = -50, x1 = 50) => { g.strokeStyle = color; g.lineWidth = 3; g.beginPath(); let on = false; for (let px = 0; px <= c.width; px += 2) { const x = (px - ox) / sx; const y = f(x); if (!Number.isFinite(y) || Math.abs(y) > 1e4) { on = false; continue; } const py = oy - y * sy; if (!on) { g.moveTo(px, py); on = true; } else g.lineTo(px, py); } g.stroke(); };
const readout = (items) => h('div.readouts', items.map(([k, el]) => h('div.ro', h('small', k), el)));
const val = () => h('b', '—');

/* ───────── Laboratorios ───────── */
const IMPL = {
  mecanica() {
    const c = canvas(); let v0 = 25; let ang = 45; let grav = 9.8; let mode = 'proj'; let m = 5; let F = 20; let mu = 0.1; let anim = 0; let x = 0;
    const R = val(); const H = val(); const T = val(); const body = h('div.lab-body');
    const drawProj = () => { const g = ctxOf(c); const th = (ang * Math.PI) / 180; const range = (v0 * v0 * Math.sin(2 * th)) / grav; const hmax = (v0 * Math.sin(th)) ** 2 / (2 * grav); const tt = (2 * v0 * Math.sin(th)) / grav;
      const s = Math.min((c.width - 60) / Math.max(range, 10), (c.height - 60) / Math.max(hmax, 5)); const ox = 30; const oy = c.height - 30; axes(g, c, s, s, ox, oy, Math.max(1, Math.round(range / 8)));
      g.strokeStyle = COLORS.a; g.lineWidth = 3; g.beginPath(); for (let t = 0; t <= tt; t += tt / 80) { const px = ox + v0 * Math.cos(th) * t * s; const py = oy - (v0 * Math.sin(th) * t - 0.5 * grav * t * t) * s; t === 0 ? g.moveTo(px, py) : g.lineTo(px, py); } g.stroke();
      const tp = (anim % 2) / 2 * tt; const bx = ox + v0 * Math.cos(th) * tp * s; const by = oy - (v0 * Math.sin(th) * tp - 0.5 * grav * tp * tp) * s; g.fillStyle = COLORS.c; g.beginPath(); g.arc(bx, by, 8, 0, 7); g.fill();
      g.strokeStyle = COLORS.b; g.lineWidth = 3; g.beginPath(); g.moveTo(ox, oy); g.lineTo(ox + Math.cos(th) * 40, oy - Math.sin(th) * 40); g.stroke();
      R.textContent = range.toFixed(1) + ' m'; H.textContent = hmax.toFixed(1) + ' m'; T.textContent = tt.toFixed(2) + ' s'; };
    const drawNewton = () => { const g = ctxOf(c); const fr = mu * m * 9.8; const net = Math.max(0, F - fr); const a = net / m; x = (x + a * 0.016 * 30) % (c.width + 100); const ox = x - 60;
      g.fillStyle = '#2b2a4a'; g.fillRect(0, 270, c.width, 130); g.fillStyle = COLORS.d; g.fillRect(ox, 220, 60 + m * 2, 50); g.fillStyle = '#fff'; g.font = '16px Quicksand'; g.fillText(m + ' kg', ox + 8, 250);
      g.strokeStyle = COLORS.a; g.lineWidth = 4; g.beginPath(); g.moveTo(ox + 60 + m * 2, 245); g.lineTo(ox + 60 + m * 2 + F * 2, 245); g.stroke(); g.fillStyle = COLORS.a; g.fillText('F = ' + F + ' N', ox + 70 + m * 2, 232);
      g.strokeStyle = COLORS.b; g.beginPath(); g.moveTo(ox, 262); g.lineTo(ox - fr * 2, 262); g.stroke(); g.fillStyle = COLORS.b; g.fillText('roce ' + fr.toFixed(1) + ' N', ox - 90, 285);
      g.fillStyle = COLORS.t; g.font = '18px Quicksand'; g.fillText(`a = (F − μmg)/m = ${a.toFixed(2)} m/s²`, 20, 40); R.textContent = a.toFixed(2) + ' m/s²'; H.textContent = net.toFixed(1) + ' N'; T.textContent = fr.toFixed(1) + ' N'; };
    const tabs = h('div.tabs', [['proj', 'Proyectil'], ['newton', 'F = ma']].map(([k, t]) => h('button.chip' + (k === mode ? '.on' : ''), { onclick: (e) => { mode = k; [...tabs.children].forEach((x) => x.classList.toggle('on', x === e.target)); build(); } }, t)));
    const build = () => { body.replaceChildren(mode === 'proj' ? h('div.controls', slider('Velocidad inicial', 5, 60, 1, v0, (v) => { v0 = v; }, ' m/s'), slider('Ángulo', 5, 85, 1, ang, (v) => { ang = v; }, '°'), slider('Gravedad', 1.6, 24, 0.1, grav, (v) => { grav = v; }, ' m/s²'), h('small', 'Prueba 45°: el alcance máximo en el vacío. En la Luna g = 1,6; en Marte 3,7.')) : h('div.controls', slider('Masa', 1, 40, 1, m, (v) => { m = v; }, ' kg'), slider('Fuerza', 0, 100, 1, F, (v) => { F = v; }, ' N'), slider('Fricción μ', 0, 0.8, 0.01, mu, (v) => { mu = v; }), h('small', 'Si F es menor que el rozamiento, el bloque no se mueve.')), readout(mode === 'proj' ? [['Alcance', R], ['Altura máx.', H], ['Tiempo de vuelo', T]] : [['Aceleración', R], ['Fuerza neta', H], ['Rozamiento', T]])); };
    build(); const loop = () => { if (!c.isConnected) return; anim += 0.016; mode === 'proj' ? drawProj() : drawNewton(); requestAnimationFrame(loop); }; loop();
    return h('div.lab', tabs, c, body, richEl('**Ideas clave:** movimiento horizontal uniforme + vertical acelerado. $R=\\frac{v_0^2\\sin2\\theta}{g}$ · $\\sum F = ma$'));
  },
  electricidad() {
    const c = canvas(); let V = 12; let R1 = 6; let R2 = 12; let par = false; let t = 0; const I = val(); const Req = val(); const P = val();
    const loop = () => { if (!c.isConnected) return; t += 0.03; const g = ctxOf(c); const eq = par ? (R1 * R2) / (R1 + R2) : R1 + R2; const cur = V / eq; I.textContent = cur.toFixed(2) + ' A'; Req.textContent = eq.toFixed(2) + ' Ω'; P.textContent = (V * cur).toFixed(1) + ' W';
      const drawR = (x, y, w, label) => { g.strokeStyle = COLORS.c; g.lineWidth = 4; g.beginPath(); g.moveTo(x, y); for (let i = 0; i < 6; i++) g.lineTo(x + (i + 0.5) * (w / 6), y + (i % 2 ? 14 : -14)); g.lineTo(x + w, y); g.stroke(); g.fillStyle = COLORS.t; g.font = '15px Quicksand'; g.fillText(label, x + w / 2 - 20, y - 24); };
      g.strokeStyle = COLORS.a; g.lineWidth = 4; g.beginPath(); g.moveTo(80, 120); g.lineTo(80, 300); g.moveTo(560, 120); g.lineTo(560, 300); g.moveTo(80, 300); g.lineTo(560, 300); g.stroke();
      g.fillStyle = COLORS.b; g.fillRect(60, 190, 40, 8); g.fillRect(70, 205, 20, 8); g.fillStyle = COLORS.t; g.fillText(V + ' V', 8, 205);
      if (!par) { g.beginPath(); g.moveTo(80, 120); g.lineTo(180, 120); g.moveTo(340, 120); g.lineTo(380, 120); g.moveTo(540, 120); g.lineTo(560, 120); g.stroke(); drawR(180, 120, 160, 'R₁ ' + R1 + ' Ω'); drawR(380, 120, 160, 'R₂ ' + R2 + ' Ω'); }
      else { g.beginPath(); g.moveTo(80, 120); g.lineTo(560, 120); g.moveTo(240, 120); g.lineTo(240, 80); g.moveTo(400, 120); g.lineTo(400, 80); g.stroke(); drawR(200, 80, 80, 'R₁ ' + R1); drawR(360, 80, 80, 'R₂ ' + R2); g.beginPath(); g.moveTo(240, 80); g.lineTo(200, 80); g.moveTo(280, 80); g.lineTo(320, 80); g.stroke(); }
      for (let i = 0; i < 26; i++) { const p = ((i / 26 + t * 0.15 * Math.min(2, cur / 3 + 0.2)) % 1) * 1000; let x; let y; const per = [180, 480, 480, 180]; const side = [[80, 300, 560 - 80, 0], [0, 0, 0, 0]]; const perim = 2 * (480 + 180); const d = p / 1000 * perim; if (d < 480) { x = 80 + d; y = 300; } else if (d < 660) { x = 560; y = 300 - (d - 480); } else if (d < 1140) { x = 560 - (d - 660); y = 120; } else { x = 80; y = 120 + (d - 1140); } g.fillStyle = COLORS.a; g.beginPath(); g.arc(x, y, 3.5, 0, 7); g.fill(); }
      requestAnimationFrame(loop); }; loop();
    const tog = h('div.tabs', [[false, 'Serie'], [true, 'Paralelo']].map(([k, tt]) => h('button.chip' + (k === par ? '.on' : ''), { onclick: (e) => { par = k; [...tog.children].forEach((x) => x.classList.toggle('on', x === e.target)); } }, tt)));
    return h('div.lab', tog, c, h('div.controls', slider('Voltaje', 1, 48, 1, V, (v) => { V = v; }, ' V'), slider('R₁', 1, 50, 1, R1, (v) => { R1 = v; }, ' Ω'), slider('R₂', 1, 50, 1, R2, (v) => { R2 = v; }, ' Ω')), readout([['Corriente', I], ['R equivalente', Req], ['Potencia', P]]), richEl('**Ohm:** $V=IR$. Serie: $R_s=R_1+R_2$. Paralelo: $\\frac1{R_p}=\\frac1{R_1}+\\frac1{R_2}$ (¡siempre menor que la menor!)'));
  },
  estadistica() {
    const c = canvas(); let mu = 50; let sd = 12; let n = 60; let outlier = 0; let seed = 1; const M = val(); const Md = val(); const SD = val();
    const rng = () => { seed = (seed * 16807) % 2147483647; return seed / 2147483647; }; const gauss = () => { let u = 0; let v = 0; while (!u) u = rng(); while (!v) v = rng(); return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v); };
    const draw = () => { seed = 1234; const data = Array.from({ length: n }, () => mu + sd * gauss()); if (outlier) data.push(mu + outlier); const g = ctxOf(c); const mean = data.reduce((a, b) => a + b, 0) / data.length; const sorted = [...data].sort((a, b) => a - b); const med = sorted.length % 2 ? sorted[(sorted.length - 1) / 2] : (sorted[sorted.length / 2 - 1] + sorted[sorted.length / 2]) / 2; const std = Math.sqrt(data.reduce((a, b) => a + (b - mean) ** 2, 0) / data.length);
      const lo = 0; const hi = 160; const bins = 32; const cnt = Array(bins).fill(0); data.forEach((v) => { const b = Math.floor(((v - lo) / (hi - lo)) * bins); if (b >= 0 && b < bins) cnt[b] += 1; }); const mx = Math.max(...cnt, 1); const bw = (c.width - 60) / bins;
      cnt.forEach((k, i) => { const bh = (k / mx) * (c.height - 70); const grd = g.createLinearGradient(0, c.height - 30 - bh, 0, c.height - 30); grd.addColorStop(0, COLORS.d); grd.addColorStop(1, COLORS.a); g.fillStyle = grd; g.fillRect(30 + i * bw + 1, c.height - 30 - bh, bw - 2, bh); });
      const X = (v) => 30 + ((v - lo) / (hi - lo)) * (c.width - 60); g.strokeStyle = COLORS.b; g.lineWidth = 3; g.beginPath(); g.moveTo(X(mean), 20); g.lineTo(X(mean), c.height - 30); g.stroke(); g.strokeStyle = COLORS.c; g.setLineDash([6, 4]); g.beginPath(); g.moveTo(X(med), 20); g.lineTo(X(med), c.height - 30); g.stroke(); g.setLineDash([]);
      g.fillStyle = COLORS.b; g.font = '14px Quicksand'; g.fillText('media', X(mean) + 4, 30); g.fillStyle = COLORS.c; g.fillText('mediana', X(med) + 4, 48); g.fillStyle = COLORS.t; for (let v = 0; v <= 160; v += 20) g.fillText(v, X(v) - 8, c.height - 10);
      M.textContent = mean.toFixed(1); Md.textContent = med.toFixed(1); SD.textContent = std.toFixed(1); };
    draw();
    return h('div.lab', c, h('div.controls', slider('Media real μ', 20, 120, 1, mu, (v) => { mu = v; draw(); }), slider('Desviación σ', 2, 35, 1, sd, (v) => { sd = v; draw(); }), slider('Número de datos', 10, 400, 5, n, (v) => { n = v; draw(); }), slider('Un dato atípico lejano', 0, 90, 1, outlier, (v) => { outlier = v; draw(); })), readout([['Media', M], ['Mediana', Md], ['Desv. estándar', SD]]), richEl('Mueve el dato atípico: **la media se desplaza, la mediana casi no.** Por eso importa elegir bien el resumen.'));
  },
  geometria() {
    const c = canvas(); let mode = 'circ'; let r = 4; let a = 3; let b = 4; const A = val(); const C = val(); const Cc = val(); const body = h('div.lab-body');
    const loop = () => { if (!c.isConnected) return; const g = ctxOf(c);
      if (mode === 'circ') { const s = 30; const cx = c.width / 2; const cy = c.height / 2; g.fillStyle = 'rgba(95,211,240,.25)'; g.strokeStyle = COLORS.a; g.lineWidth = 3; g.beginPath(); g.arc(cx, cy, r * s, 0, 7); g.fill(); g.stroke(); g.strokeStyle = COLORS.b; g.beginPath(); g.moveTo(cx, cy); g.lineTo(cx + r * s, cy); g.stroke(); g.fillStyle = COLORS.t; g.font = '16px Quicksand'; g.fillText('r = ' + r.toFixed(1), cx + (r * s) / 2 - 20, cy - 8);
        const k = Math.floor(r * r * Math.PI); g.fillStyle = COLORS.c; for (let i = 0; i < Math.min(k, 120); i++) { const ang = i * 2.399963; const rad = Math.sqrt(i / Math.max(1, k)) * r * s * 0.95; g.beginPath(); g.arc(cx + Math.cos(ang) * rad, cy + Math.sin(ang) * rad, 2.5, 0, 7); g.fill(); }
        A.textContent = (Math.PI * r * r).toFixed(2); C.textContent = (2 * Math.PI * r).toFixed(2); Cc.textContent = (2 * r).toFixed(1); }
      else { const s = 26; const ox = 120; const oy = 330; const cc = Math.hypot(a, b); g.fillStyle = 'rgba(95,211,240,.3)'; g.strokeStyle = COLORS.a; g.lineWidth = 2.5; g.fillRect(ox, oy - a * s, a * s, a * s); g.strokeRect(ox, oy - a * s, a * s, a * s); g.fillStyle = 'rgba(255,45,122,.3)'; g.strokeStyle = COLORS.b; g.fillRect(ox + a * s, oy, b * s, b * s); g.strokeRect(ox + a * s, oy, b * s, b * s);
        g.beginPath(); g.moveTo(ox, oy); g.lineTo(ox + a * s, oy); g.lineTo(ox + a * s, oy - 0); g.closePath(); g.fillStyle = COLORS.t; g.font = '15px Quicksand'; g.fillText('a² = ' + (a * a).toFixed(1), ox + 6, oy - (a * s) / 2); g.fillText('b² = ' + (b * b).toFixed(1), ox + a * s + 6, oy + (b * s) / 2);
        g.strokeStyle = COLORS.c; g.lineWidth = 4; g.beginPath(); g.moveTo(ox, oy); g.lineTo(ox + a * s, oy); g.lineTo(ox + a * s, oy + b * s); g.closePath(); g.stroke(); g.fillStyle = COLORS.c; g.fillText('c² = ' + (cc * cc).toFixed(1) + '  (c = ' + cc.toFixed(2) + ')', ox + a * s + 20, oy - 14);
        A.textContent = (a * a + b * b).toFixed(1); C.textContent = cc.toFixed(2); Cc.textContent = (a * a + b * b === cc * cc ? 'a² + b² = c² ✓' : '—'); }
      requestAnimationFrame(loop); }; loop();
    const tabs = h('div.tabs', [['circ', 'Círculo'], ['pit', 'Pitágoras']].map(([k, t]) => h('button.chip' + (k === mode ? '.on' : ''), { onclick: (e) => { mode = k; [...tabs.children].forEach((x) => x.classList.toggle('on', x === e.target)); build(); } }, t)));
    const build = () => { body.replaceChildren(mode === 'circ' ? h('div.controls', slider('Radio', 0.5, 7, 0.1, r, (v) => { r = v; })) : h('div.controls', slider('Cateto a', 1, 7, 0.5, a, (v) => { a = v; }), slider('Cateto b', 1, 7, 0.5, b, (v) => { b = v; })), readout(mode === 'circ' ? [['Área πr²', A], ['Circunferencia 2πr', C], ['Diámetro', Cc]] : [['a² + b²', A], ['Hipotenusa c', C], ['Verificación', Cc]])); };
    build(); return h('div.lab', tabs, c, body, richEl('Duplica el radio: el área se multiplica por **4**. En Pitágoras, los dos cuadrados pequeños suman exactamente el grande.'));
  },
  algebra() {
    const c = canvas(); let a = 1; let b = -2; let k = -3; const out = h('div.readouts');
    const draw = () => { const g = ctxOf(c); const s = 30; const ox = c.width / 2; const oy = c.height / 2; axes(g, c, s, s, ox, oy); plot(g, (x) => a * x * x + b * x + k, s, s, ox, oy, c, COLORS.a); const D = b * b - 4 * a * k; const vx = -b / (2 * a); const vy = a * vx * vx + b * vx + k; g.fillStyle = COLORS.c; g.beginPath(); g.arc(ox + vx * s, oy - vy * s, 6, 0, 7); g.fill();
      const roots = a === 0 ? [] : D < 0 ? [] : [(-b + Math.sqrt(D)) / (2 * a), (-b - Math.sqrt(D)) / (2 * a)]; g.fillStyle = COLORS.b; roots.forEach((x) => { g.beginPath(); g.arc(ox + x * s, oy, 6, 0, 7); g.fill(); });
      out.replaceChildren(...readout([['Ecuación', h('b', `y = ${a}x² ${b >= 0 ? '+' : '−'} ${Math.abs(b)}x ${k >= 0 ? '+' : '−'} ${Math.abs(k)}`)], ['Discriminante', h('b', D.toFixed(1))], ['Raíces', h('b', roots.length ? roots.map((x) => x.toFixed(2)).join(' ; ') : 'ninguna real')], ['Vértice', h('b', a ? `(${vx.toFixed(2)}, ${vy.toFixed(2)})` : '—')]]).children); }; draw();
    return h('div.lab', c, h('div.controls', slider('a (apertura)', -3, 3, 0.1, a, (v) => { a = v; draw(); }), slider('b', -8, 8, 0.1, b, (v) => { b = v; draw(); }), slider('c', -8, 8, 0.1, k, (v) => { k = v; draw(); })), out, richEl('Las **raíces** (puntos rosas) son donde la parábola corta el eje x; el **vértice** (punto dorado) es su máximo o mínimo. $x=\\frac{-b\\pm\\sqrt{b^2-4ac}}{2a}$'));
  },
  vectorial() {
    const c = canvas(); let ax = 4; let ay = 2; let bx = -1; let by = 3; let mode = 'vec'; const A = val(); const B = val(); const Cc = val(); const body = h('div.lab-body');
    const arrow = (g, x0, y0, x1, y1, col) => { g.strokeStyle = col; g.fillStyle = col; g.lineWidth = 3; g.beginPath(); g.moveTo(x0, y0); g.lineTo(x1, y1); g.stroke(); const an = Math.atan2(y1 - y0, x1 - x0); g.beginPath(); g.moveTo(x1, y1); g.lineTo(x1 - 10 * Math.cos(an - 0.4), y1 - 10 * Math.sin(an - 0.4)); g.lineTo(x1 - 10 * Math.cos(an + 0.4), y1 - 10 * Math.sin(an + 0.4)); g.fill(); };
    const draw = () => { const g = ctxOf(c); const s = 32; const ox = c.width / 2; const oy = c.height / 2; axes(g, c, s, s, ox, oy);
      if (mode === 'vec') { arrow(g, ox, oy, ox + ax * s, oy - ay * s, COLORS.a); arrow(g, ox, oy, ox + bx * s, oy - by * s, COLORS.b); arrow(g, ox, oy, ox + (ax + bx) * s, oy - (ay + by) * s, COLORS.c); g.setLineDash([5, 5]); g.strokeStyle = 'rgba(255,255,255,.35)'; g.beginPath(); g.moveTo(ox + ax * s, oy - ay * s); g.lineTo(ox + (ax + bx) * s, oy - (ay + by) * s); g.stroke(); g.setLineDash([]); const dot = ax * bx + ay * by; const ang = Math.acos(dot / (Math.hypot(ax, ay) * Math.hypot(bx, by) || 1)) * 180 / Math.PI; A.textContent = `(${ax + bx}, ${ay + by})`; B.textContent = dot.toFixed(1); Cc.textContent = ang.toFixed(1) + '°'; }
      else { for (let x = -9; x <= 9; x += 1.5) for (let y = -6; y <= 6; y += 1.5) { const fx = -y; const fy = x; const m = Math.hypot(fx, fy) || 1; arrow(g, ox + x * s, oy - y * s, ox + (x + (fx / m) * 0.9) * s, oy - (y + (fy / m) * 0.9) * s, `hsl(${200 + m * 12},90%,65%)`); } A.textContent = '0'; B.textContent = '2'; Cc.textContent = 'Rotación pura'; }
    }; draw();
    const tabs = h('div.tabs', [['vec', 'Vectores'], ['field', 'Campo F = (−y, x)']].map(([k, t]) => h('button.chip' + (k === mode ? '.on' : ''), { onclick: (e) => { mode = k; [...tabs.children].forEach((x) => x.classList.toggle('on', x === e.target)); build(); draw(); } }, t)));
    const build = () => { body.replaceChildren(mode === 'vec' ? h('div.controls', slider('a ₓ', -8, 8, 1, ax, (v) => { ax = v; draw(); }), slider('a ᵧ', -6, 6, 1, ay, (v) => { ay = v; draw(); }), slider('b ₓ', -8, 8, 1, bx, (v) => { bx = v; draw(); }), slider('b ᵧ', -6, 6, 1, by, (v) => { by = v; draw(); })) : h('small', 'Campo que gira alrededor del origen: su divergencia es 0 y su rotacional es 2.'), readout(mode === 'vec' ? [['a + b', A], ['a · b', B], ['Ángulo entre a y b', Cc]] : [['Divergencia ∇·F', A], ['Rotacional (z)', B], ['Tipo', Cc]])); };
    build(); return h('div.lab', tabs, c, body, richEl('Si $\\vec a\\cdot\\vec b=0$ los vectores son **perpendiculares**. Prueba a = (3, 0), b = (0, 4).'));
  },
  calculo() {
    const c = canvas(); let x0 = 1; let n = 8; let fn = 'x²'; const D = val(); const T = val(); const I = val();
    const F = { 'x²': [(x) => x * x, (x) => 2 * x, (x) => (x ** 3) / 3], 'sen x': [Math.sin, Math.cos, (x) => -Math.cos(x)], 'x³ − 3x': [(x) => x ** 3 - 3 * x, (x) => 3 * x * x - 3, (x) => (x ** 4) / 4 - 1.5 * x * x] };
    const draw = () => { const g = ctxOf(c); const s = 44; const ox = 90; const oy = c.height - 140; axes(g, c, s, s, ox, oy); const [f, df, F0] = F[fn];
      const a = 0; const b = 3; const w = (b - a) / n; g.fillStyle = 'rgba(123,60,240,.45)'; let sum = 0; for (let i = 0; i < n; i++) { const xi = a + i * w; const h0 = f(xi); sum += h0 * w; g.fillRect(ox + xi * s, h0 >= 0 ? oy - h0 * s : oy, w * s - 1, Math.abs(h0) * s); }
      plot(g, f, s, s, ox, oy, c, COLORS.a); const y0 = f(x0); const m = df(x0); g.strokeStyle = COLORS.b; g.lineWidth = 3; g.beginPath(); g.moveTo(ox + (x0 - 3) * s, oy - (y0 - 3 * m) * s); g.lineTo(ox + (x0 + 3) * s, oy - (y0 + 3 * m) * s); g.stroke(); g.fillStyle = COLORS.c; g.beginPath(); g.arc(ox + x0 * s, oy - y0 * s, 7, 0, 7); g.fill();
      D.textContent = m.toFixed(3); T.textContent = `y = ${m.toFixed(2)}(x − ${x0.toFixed(1)}) + ${y0.toFixed(2)}`; I.textContent = `${sum.toFixed(3)}  (exacto ${(F0(b) - F0(a)).toFixed(3)})`; }; draw();
    const tabs = h('div.tabs', Object.keys(F).map((k) => h('button.chip' + (k === fn ? '.on' : ''), { onclick: (e) => { fn = k; [...tabs.children].forEach((x) => x.classList.toggle('on', x === e.target)); draw(); } }, 'f(x) = ' + k)));
    return h('div.lab', tabs, c, h('div.controls', slider('Punto x₀', -2.5, 3, 0.1, x0, (v) => { x0 = v; draw(); }), slider('Rectángulos de Riemann', 1, 60, 1, n, (v) => { n = v; draw(); })), readout([['f′(x₀) = pendiente', D], ['Tangente', T], ['Área ≈ ∫₀³ f', I]]), richEl('La **derivada** es la pendiente de la recta tangente (rosa). La **integral** se aproxima con rectángulos (violeta): ¡más rectángulos, más exactitud!'));
  },
  matrices() {
    const c = canvas(); let m = [1, 0, 0, 1]; const Dt = val(); const Tr = val(); const body = h('div.lab-body');
    const draw = () => { const g = ctxOf(c); const s = 32; const ox = c.width / 2; const oy = c.height / 2; axes(g, c, s, s, ox, oy); const T = (x, y) => [m[0] * x + m[1] * y, m[2] * x + m[3] * y];
      g.strokeStyle = 'rgba(95,211,240,.5)'; g.lineWidth = 1.5; for (let i = -6; i <= 6; i++) { g.beginPath(); for (let t = -6; t <= 6; t += 0.5) { const [px, py] = T(i, t); t === -6 ? g.moveTo(ox + px * s, oy - py * s) : g.lineTo(ox + px * s, oy - py * s); } g.stroke(); g.beginPath(); for (let t = -6; t <= 6; t += 0.5) { const [px, py] = T(t, i); t === -6 ? g.moveTo(ox + px * s, oy - py * s) : g.lineTo(ox + px * s, oy - py * s); } g.stroke(); }
      const pts = [[0, 0], [1, 0], [1, 1], [0, 1]].map(([x, y]) => T(x, y)); g.fillStyle = 'rgba(255,200,58,.55)'; g.strokeStyle = COLORS.c; g.lineWidth = 3; g.beginPath(); pts.forEach(([x, y], i) => (i ? g.lineTo(ox + x * s, oy - y * s) : g.moveTo(ox + x * s, oy - y * s))); g.closePath(); g.fill(); g.stroke();
      const det = m[0] * m[3] - m[1] * m[2]; Dt.textContent = det.toFixed(2) + (Math.abs(det) < 0.05 ? ' (colapsa)' : det < 0 ? ' (refleja)' : ''); Tr.textContent = (m[0] + m[3]).toFixed(2); };
    draw();
    const preset = (name, mm) => h('button.chip', { onclick: () => { m = [...mm]; build(); draw(); } }, name);
    const build = () => body.replaceChildren(h('div.controls', ['a', 'b', 'c', 'd'].map((l, i) => slider(l, -3, 3, 0.1, m[i], (v) => { m[i] = v; draw(); }))), h('div.chips', preset('Identidad', [1, 0, 0, 1]), preset('Rotar 90°', [0, -1, 1, 0]), preset('Escalar ×2', [2, 0, 0, 2]), preset('Reflejar', [1, 0, 0, -1]), preset('Cizalla', [1, 1, 0, 1]), preset('Colapsar', [1, 1, 1, 1])), readout([['Determinante', Dt], ['Traza', Tr]]));
    build(); return h('div.lab', c, body, richEl('El **determinante** es el factor por el que cambia el área del cuadrado amarillo. Si vale 0, el plano se aplasta en una línea: la matriz no tiene inversa.'));
  },
};

export function labsPage(root, id) {
  const S = state(); startMusic('tech');
  if (id && IMPL[id]) {
    S.labs[id] = (S.labs[id] || 0) + 1; save(); const lab = LABS.find((l) => l[0] === id);
    mount(root, h('section.page.lab-page', h('div.crumb', h('a', { href: '#/labs' }, '🔬 Laboratorios'), ' › ', lab[2]), h('h1', `${lab[1]} Laboratorio de ${lab[2]}`), h('p.sub', lab[3]), IMPL[id]()));
    return;
  }
  mount(root, h('section.page', h('h1', '🔬 Laboratorios virtuales'), h('p.sub', 'Experimenta: cambia las variables en tiempo real y mira qué pasa. Comprender vale más que memorizar.'),
    h('div.lab-grid', LABS.map(([k, ico, name, d]) => h('button.card.lab-card', { onclick: () => { sfx.click(); navigate('/labs/' + k); } }, h('span.ico-big', ico), h('b', name), h('small', d), S.labs[k] ? h('em', '✔ visitado') : null)))));
}
