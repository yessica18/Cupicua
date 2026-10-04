// Vista de una pregunta: enunciado, gráfico, entrada según el tipo, vista previa de la fórmula y comprobación.
import { h } from '../lib/dom.js';
import { rich, tex } from '../lib/rich.js';
import { checkAnswer, answerText } from '../../shared/math/check.js';
import { previewTex } from '../../shared/math/expr.js';

const PLACEHOLDER = { numeric: 'Escribe un número (o 3/4, sqrt(2)…)', frac: 'Escribe a/b o un número', expr: 'Escribe la expresión (ej. 2x+3, (x+1)(x-2))', set: 'Ej.: 2, -3', tuple: 'Ej.: 3, -1', direction: 'Ej.: 1, 2', primefac: 'Ej.: 2^2 * 3 * 5', complex: 'Ej.: 3+2i' };

function bars(viz) {
  const max = Math.max(...viz.values, 1); const w = 36; const gap = 14; const H = 120; const W = viz.values.length * (w + gap) + gap;
  return h('figure.viz', { html: `<svg viewBox="0 0 ${W} ${H + 36}" role="img" aria-label="${viz.title}"><g>${viz.values.map((v, i) => { const bh = (v / max) * H; const x = gap + i * (w + gap); return `<rect x="${x}" y="${H - bh + 6}" width="${w}" height="${bh}" rx="6" fill="url(#vg)"/><text x="${x + w / 2}" y="${H - bh}" text-anchor="middle" class="vv">${v}</text><text x="${x + w / 2}" y="${H + 24}" text-anchor="middle" class="vl">${viz.labels[i]}</text>`; }).join('')}</g><defs><linearGradient id="vg" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#7b3cf0"/><stop offset="1" stop-color="#5fd3f0"/></linearGradient></defs></svg><figcaption>${viz.title}</figcaption>` });
}

/**
 * onSubmit(input, result) se llama al enviar. Devuelve {el, focus(), reveal(ok), disable()}
 */
export function questionView(q, { onSubmit, compact = false } = {}) {
  let value = ''; let locked = false; const root = h('div.qv');
  root.append(h('div.q-prompt', { html: rich(q.prompt) }));
  if (q.viz?.kind === 'bars') root.append(bars(q.viz));
  const fb = h('div.q-feedback', { 'aria-live': 'polite' });
  let inputEl; let getValue;
  const submit = () => {
    if (locked) return;
    const v = getValue();
    if (v === '' || v == null || (Array.isArray(v) && v.flat().some((x) => x === ''))) { inputEl?.focus?.(); fb.replaceChildren(h('div.fb.warn', 'Escribe una respuesta primero.')); return; }
    const res = checkAnswer(q, v);
    if (res.error) { fb.replaceChildren(h('div.fb.warn', { html: rich(res.error) })); return; }
    onSubmit?.(v, res);
  };
  const submitBtn = h('button.btn.primary.big', { onclick: submit }, 'Comprobar ⚔️');
  if (q.type === 'choice') {
    const box = h('div.choices', { role: 'radiogroup' });
    q.choices.forEach((c, i) => box.append(h('button.choice', { role: 'radio', 'aria-checked': 'false', onclick: () => { if (locked) return; value = i; [...box.children].forEach((b, j) => { b.classList.toggle('sel', j === i); b.setAttribute('aria-checked', String(j === i)); }); submit(); }, html: rich(c) })));
    inputEl = box; getValue = () => value; root.append(box);
  } else if (q.type === 'tf') {
    const box = h('div.choices'); [['Verdadero', true], ['Falso', false]].forEach(([t, v]) => box.append(h('button.choice', { onclick: () => { value = v; if (!locked) submit(); } }, t))); inputEl = box; getValue = () => value; root.append(box);
  } else if (q.type === 'matrix') {
    const [rr, cc] = q.shape; const cells = []; const grid = h('div.mat', { style: { gridTemplateColumns: `repeat(${cc}, 64px)` } });
    for (let i = 0; i < rr; i++) for (let j = 0; j < cc; j++) { const c = h('input', { type: 'text', inputMode: 'decimal', 'aria-label': `fila ${i + 1} columna ${j + 1}`, onkeydown: (e) => { if (e.key === 'Enter') submit(); } }); cells.push(c); grid.append(c); }
    inputEl = cells[0]; getValue = () => Array.from({ length: rr }, (_, i) => cells.slice(i * cc, i * cc + cc).map((c) => c.value.trim()));
    root.append(h('div.mat-wrap', h('span.mb'), grid), submitBtn);
  } else {
    const prev = h('div.preview', { 'aria-hidden': 'true' });
    inputEl = h('input.ans', { type: 'text', autocomplete: 'off', autocapitalize: 'off', spellcheck: false, inputMode: ['numeric', 'frac'].includes(q.type) ? 'decimal' : 'text', placeholder: PLACEHOLDER[q.type] || 'Tu respuesta', 'aria-label': 'Tu respuesta', onkeydown: (e) => { if (e.key === 'Enter') submit(); },
      oninput: () => { const t = previewTex(inputEl.value); prev.innerHTML = t && inputEl.value.trim() ? tex(t) : ''; } });
    getValue = () => inputEl.value.trim();
    root.append(h('div.ans-row', inputEl, submitBtn), prev);
  }
  root.append(fb);
  return {
    el: root,
    focus() { (inputEl?.focus || (() => {})).call(inputEl); },
    lock(on = true) { locked = on; root.classList.toggle('locked', on); if (inputEl?.disabled !== undefined) inputEl.disabled = on; submitBtn.disabled = on; },
    feedback(node) { fb.replaceChildren(node); },
    reveal(q2 = q) { return answerText(q2); },
    clearInput() { if (inputEl && 'value' in inputEl) inputEl.value = ''; },
  };
}
