// Utilidades mínimas de DOM (sin framework).
// append/prepend/replaceChildren ignoran null/false (evita que aparezca el texto "null").
for (const m of ['append', 'prepend', 'replaceChildren']) {
  const orig = Element.prototype[m];
  Element.prototype[m] = function patched(...k) { return orig.apply(this, k.flat(Infinity).filter((x) => x != null && x !== false)); };
}
export const $ = (sel, root = document) => root.querySelector(sel);
export const $$ = (sel, root = document) => [...root.querySelectorAll(sel)];

/** h('div.clase#id', {onclick, style:{}}, hijos...) */
export function h(tag, attrs, ...kids) {
  const m = String(tag).match(/^([a-z0-9]+)?((?:[.#][\w-]+)*)$/i);
  const el = document.createElement(m?.[1] || 'div');
  (m?.[2] || '').replace(/([.#])([\w-]+)/g, (_, k, v) => { if (k === '.') el.classList.add(v); else el.id = v; });
  if (attrs != null && (typeof attrs !== 'object' || attrs.nodeType || Array.isArray(attrs))) { kids.unshift(attrs); attrs = null; }
  for (const [k, v] of Object.entries(attrs || {})) {
    if (v == null || v === false) continue;
    if (k.startsWith('on') && typeof v === 'function') el.addEventListener(k.slice(2).toLowerCase(), v);
    else if (k === 'style' && typeof v === 'object') Object.assign(el.style, v);
    else if (k === 'html') el.innerHTML = v;
    else if (k === 'class') el.classList.add(...String(v).split(' ').filter(Boolean));
    else if (k in el && !k.startsWith('aria') && k !== 'list') { try { el[k] = v; } catch { el.setAttribute(k, v); } }
    else el.setAttribute(k, v === true ? '' : v);
  }
  const add = (k) => {
    if (k == null || k === false) return;
    if (Array.isArray(k)) k.forEach(add);
    else el.append(k.nodeType ? k : document.createTextNode(String(k)));
  };
  kids.forEach(add);
  return el;
}

export function mount(root, ...kids) { root.replaceChildren(...kids.flat().filter(Boolean)); return root; }

let toastBox;
export function toast(msg, { icon = '✨', ms = 2600, kind = '' } = {}) {
  if (!toastBox) { toastBox = h('div.toasts', { 'aria-live': 'polite' }); document.body.append(toastBox); }
  const t = h('div.toast' + (kind ? '.' + kind : ''), h('span.ti', icon), h('span', msg));
  toastBox.append(t);
  setTimeout(() => { t.classList.add('out'); setTimeout(() => t.remove(), 400); }, ms);
}

export function modal(content, { title = '', wide = false, onClose } = {}) {
  const close = () => { back.remove(); onClose?.(); document.removeEventListener('keydown', esc); };
  const esc = (e) => { if (e.key === 'Escape') close(); };
  const back = h('div.modal-back', { onclick: (e) => { if (e.target === back) close(); } },
    h('div.modal' + (wide ? '.wide' : ''), { role: 'dialog', 'aria-modal': 'true', 'aria-label': title },
      h('button.x', { onclick: close, 'aria-label': 'Cerrar' }, '✕'), title && h('h2', title), content));
  document.body.append(back);
  document.addEventListener('keydown', esc);
  return { close, el: back };
}

export const wait = (ms) => new Promise((r) => setTimeout(r, ms));
export const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
export const pick = (arr) => arr[Math.floor(Math.random() * arr.length)];
export const fmtDate = (d) => new Date(d).toLocaleDateString('es', { weekday: 'long', day: 'numeric', month: 'long' });

/** Animación de número flotante (+XP, -HP) */
export function floatText(anchor, text, cls = '') {
  const r = anchor.getBoundingClientRect();
  const f = h('div.floaty' + (cls ? '.' + cls : ''), text);
  f.style.left = r.left + r.width / 2 + 'px'; f.style.top = r.top + 'px';
  document.body.append(f);
  setTimeout(() => f.remove(), 1300);
}
