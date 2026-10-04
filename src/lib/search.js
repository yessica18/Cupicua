// Búsqueda web con fuentes visibles. Usa las APIs públicas de Wikipedia/Wikinoticias (permiten CORS, sin clave).
// Distingue 📜 información enciclopédica/histórica de 📰 información actual. Solo busca cuando el usuario lo pide.
const API = (host) => `https://${host}/w/api.php?action=query&format=json&origin=*&generator=search&gsrlimit=5&prop=extracts|info&exintro=1&explaintext=1&exsentences=2&inprop=url`;
const cache = new Map();

async function query(host, q, sort = 'relevance') {
  const key = host + q + sort; if (cache.has(key) && Date.now() - cache.get(key).t < 600000) return cache.get(key).v;
  const ctl = new AbortController(); const to = setTimeout(() => ctl.abort(), 9000);
  try {
    const r = await fetch(`${API(host)}&gsrsearch=${encodeURIComponent(q)}&gsrsort=${sort}`, { signal: ctl.signal });
    if (!r.ok) throw new Error('El servicio de búsqueda respondió ' + r.status);
    const j = await r.json(); const pages = Object.values(j.query?.pages || {}).sort((a, b) => a.index - b.index);
    const out = pages.map((p) => ({ title: p.title, url: p.fullurl, snippet: (p.extract || '').slice(0, 260), source: host.startsWith('es.wikinews') ? 'Wikinoticias' : 'Wikipedia', date: p.touched }));
    cache.set(key, { t: Date.now(), v: out }); return out;
  } catch (e) { throw new Error(e.name === 'AbortError' ? 'Se agotó el tiempo de espera.' : /fetch/i.test(e.message) ? 'No hay conexión a internet.' : e.message); } finally { clearTimeout(to); }
}

export async function webSearch(q) {
  const current = /noticia|hoy|reciente|actual|último|ultimo|2024|2025|2026|descubr/i.test(q);
  const [wiki, news] = await Promise.allSettled([query('es.wikipedia.org', q), current ? query('es.wikinews.org', q, 'create_timestamp_desc') : Promise.resolve([])]);
  const out = [];
  if (news.status === 'fulfilled') out.push(...news.value.map((x) => ({ ...x, kind: 'actual' })));
  if (wiki.status === 'fulfilled') out.push(...wiki.value.map((x) => ({ ...x, kind: 'historica' })));
  if (!out.length) { if (wiki.status === 'rejected') throw wiki.reason; throw new Error('No encontré resultados. Prueba con otras palabras.'); }
  return out;
}

export async function fetchNews(topic) {
  const r = await query('es.wikinews.org', topic, 'create_timestamp_desc');
  return r.map((x) => ({ ...x, kind: 'actual' }));
}
