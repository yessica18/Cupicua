// Pizarra CAPICÚA: escribir, dibujar, fórmulas y figuras; se puede compartir con un amigo en una llamada.
import { h } from '../lib/dom.js';

export function createBoard({ onEvent } = {}) {
  const c = h('canvas.board', { width: 900, height: 520, 'aria-label': 'Pizarra para dibujar y escribir' });
  const g = c.getContext('2d'); let tool = 'pen'; let color = '#e9e6ff'; let size = 3; let drawing = false; let last = null; let shapeStart = null; let snap = null;
  const reset = () => { g.fillStyle = '#17103f'; g.fillRect(0, 0, c.width, c.height); g.strokeStyle = 'rgba(160,140,255,.12)'; g.lineWidth = 1; for (let x = 0; x < c.width; x += 30) { g.beginPath(); g.moveTo(x, 0); g.lineTo(x, c.height); g.stroke(); } for (let y = 0; y < c.height; y += 30) { g.beginPath(); g.moveTo(0, y); g.lineTo(c.width, y); g.stroke(); } };
  reset();
  const pos = (e) => { const r = c.getBoundingClientRect(); return [((e.clientX - r.left) / r.width) * c.width, ((e.clientY - r.top) / r.height) * c.height]; };
  const seg = (a, b, col, sz, erase) => { g.strokeStyle = erase ? '#17103f' : col; g.lineWidth = erase ? sz * 6 : sz; g.lineCap = 'round'; g.lineJoin = 'round'; g.beginPath(); g.moveTo(a[0], a[1]); g.lineTo(b[0], b[1]); g.stroke(); };
  const shape = (kind, a, b, col, sz) => { g.strokeStyle = col; g.lineWidth = sz; g.beginPath(); if (kind === 'line') { g.moveTo(...a); g.lineTo(...b); } else if (kind === 'rect') g.strokeRect(a[0], a[1], b[0] - a[0], b[1] - a[1]); else if (kind === 'circle') g.arc(a[0], a[1], Math.hypot(b[0] - a[0], b[1] - a[1]), 0, 7); g.stroke(); };
  c.addEventListener('pointerdown', (e) => { c.setPointerCapture(e.pointerId); const p = pos(e); if (tool === 'text') { const t = prompt('Escribe texto o fórmula (ej. x² + 3x = 0):'); if (t) { g.fillStyle = color; g.font = `${14 + size * 3}px Quicksand, sans-serif`; g.fillText(t, p[0], p[1]); onEvent?.({ t: 'text', p, text: t, color, size }); } return; } drawing = true; last = p; shapeStart = p; snap = ['line', 'rect', 'circle'].includes(tool) ? g.getImageData(0, 0, c.width, c.height) : null; });
  c.addEventListener('pointermove', (e) => { if (!drawing) return; const p = pos(e); if (tool === 'pen' || tool === 'eraser') { seg(last, p, color, size, tool === 'eraser'); onEvent?.({ t: 'seg', a: last, b: p, color, size, erase: tool === 'eraser' }); last = p; } else if (snap) { g.putImageData(snap, 0, 0); shape(tool, shapeStart, p, color, size); } });
  const end = (e) => { if (!drawing) return; drawing = false; if (snap) { const p = pos(e); onEvent?.({ t: 'shape', kind: tool, a: shapeStart, b: p, color, size }); snap = null; } };
  c.addEventListener('pointerup', end); c.addEventListener('pointercancel', end);
  const colors = ['#e9e6ff', '#5fd3f0', '#ff2d7a', '#ffc83a', '#34d399', '#a78bfa'];
  const tb = h('div.board-tools', ['pen', 'eraser', 'line', 'rect', 'circle', 'text'].map((t) => h('button.chip' + (t === tool ? '.on' : ''), { onclick: (e) => { tool = t; [...e.currentTarget.parentElement.querySelectorAll('.chip')].forEach((x) => x.classList.toggle('on', x === e.currentTarget)); } }, { pen: '✏️ Lápiz', eraser: '🧽 Borrar', line: '／ Línea', rect: '▭ Rect.', circle: '◯ Círculo', text: '𝑓 Texto' }[t])),
    colors.map((k) => h('button.sw', { style: { background: k }, 'aria-label': k, onclick: () => { color = k; if (tool === 'eraser') tool = 'pen'; } })), h('input', { type: 'range', min: 1, max: 12, value: size, 'aria-label': 'Grosor', oninput: (e) => { size = +e.target.value; } }),
    h('button.chip', { onclick: () => { reset(); onEvent?.({ t: 'clear' }); } }, '🗑️ Limpiar'), h('button.chip', { onclick: () => { const a = h('a', { href: c.toDataURL('image/png'), download: 'pizarra-capicua.png' }); document.body.append(a); a.click(); a.remove(); } }, '💾 Guardar'));
  return {
    el: h('div.board-wrap', tb, c),
    remote(ev) { if (ev.t === 'seg') seg(ev.a, ev.b, ev.color, ev.size, ev.erase); else if (ev.t === 'shape') shape(ev.kind, ev.a, ev.b, ev.color, ev.size); else if (ev.t === 'text') { g.fillStyle = ev.color; g.font = `${14 + ev.size * 3}px Quicksand, sans-serif`; g.fillText(ev.text, ev.p[0], ev.p[1]); } else if (ev.t === 'clear') reset(); },
  };
}
