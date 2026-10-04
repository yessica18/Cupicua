// Enrutador por hash: #/ruta/parametro
const routes = []; let current = null; let handler = null;
export const route = (pattern, fn) => { const keys = []; const rx = new RegExp('^' + pattern.replace(/:([a-z]+)/gi, (_, k) => { keys.push(k); return '([^/]+)'; }) + '/?$'); routes.push({ rx, keys, fn, pattern }); };
export const navigate = (path) => { const target = '#' + (path.startsWith('/') ? path : '/' + path); if (location.hash === target) resolve(); else location.hash = target; };
export const currentPath = () => (location.hash.slice(1) || '/');
export const queryParams = () => new URLSearchParams((currentPath().split('?')[1]) || '');
export function onRoute(fn) { handler = fn; }
export function resolve() {
  const path = currentPath().split('?')[0];
  for (const r of routes) { const m = r.rx.exec(path); if (m) { const params = Object.fromEntries(r.keys.map((k, i) => [k, decodeURIComponent(m[i + 1])])); current = { path, pattern: r.pattern, params }; handler?.(r.fn, params, path); return; } }
  navigate('/');
}
addEventListener('hashchange', resolve);
export const currentRoute = () => current;
