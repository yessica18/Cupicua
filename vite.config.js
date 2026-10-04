import { defineConfig } from 'vite';

// Todo el sitio se empaqueta en UN SOLO index.html (JS, CSS, fuentes e imágenes embebidos)
// para que funcione abriéndolo con doble clic en Chrome y se pueda publicar en cualquier hosting estático.
function katexLite() {
  return { name: 'katex-lite', enforce: 'pre', transform(code, id) {
    if (!id.includes('katex.min.css')) return null;
    return { code: code.replace(/,url\([^)]*?\.woff\) format\("woff"\),url\([^)]*?\.ttf\) format\("truetype"\)/g, ''), map: null };
  } };
}
function singleFile() {
  return { name: 'single-file', enforce: 'post', generateBundle(_, bundle) {
    const html = Object.values(bundle).find((f) => f.fileName.endsWith('.html'));
    if (!html) return;
    let src = html.source.toString();
    for (const [name, f] of Object.entries(bundle)) {
      if (f.type === 'chunk' && name.endsWith('.js')) {
        const code = f.code.replace(/<\/script/gi, '<\\/script');
        src = src.replace(new RegExp(`<script[^>]*src="[^"]*${name.split('/').pop()}"[^>]*></script>`), () => '');
        src = src.replace('</body>', () => `<script type="module">${code}</script></body>`);
        delete bundle[name];
      } else if (f.type === 'asset' && name.endsWith('.css')) {
        src = src.replace(new RegExp(`<link[^>]*href="[^"]*${name.split('/').pop()}"[^>]*>`), () => `<style>${f.source}</style>`);
        delete bundle[name];
      }
    }
    html.source = src;
  } };
}

export default defineConfig({
  base: './',
  plugins: [katexLite(), singleFile()],
  build: { rollupOptions: { input: 'index.dev.html', output: { inlineDynamicImports: true } }, assetsInlineLimit: 100_000_000, cssCodeSplit: false, chunkSizeWarningLimit: 6000 },
  server: { host: true },
});
