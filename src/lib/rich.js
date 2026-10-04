// Texto enriquecido: **negrita**, `código`, saltos de línea y fórmulas $...$ / $$...$$ con KaTeX.
import katex from 'katex';
import 'katex/dist/katex.min.css';

const esc = (s) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
export function tex(src, display = false) {
  try { return katex.renderToString(src, { displayMode: display, throwOnError: false, trust: false, strict: 'ignore' }); }
  catch { return esc(src); }
}
export function rich(text) {
  const parts = String(text ?? '').split(/(\$\$[\s\S]+?\$\$|\$[^$\n]+?\$)/g);
  return parts.map((p) => {
    if (p.startsWith('$$')) return `<div class="math-block">${tex(p.slice(2, -2), true)}</div>`;
    if (p.startsWith('$')) return tex(p.slice(1, -1));
    return esc(p).replace(/\*\*([^*]+)\*\*/g, '<b>$1</b>').replace(/`([^`]+)`/g, '<code>$1</code>').replace(/\n/g, '<br>');
  }).join('');
}
export const richEl = (text, tag = 'div', cls = '') => { const e = document.createElement(tag); if (cls) e.className = cls; e.innerHTML = rich(text); return e; };
