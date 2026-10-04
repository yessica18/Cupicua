// Copia el sitio compilado a la raíz, listo para publicar: index.html (un único archivo) + extras de la app instalable (PWA).
import { copyFileSync, writeFileSync, statSync, cpSync } from 'node:fs';
copyFileSync('dist/index.dev.html', 'index.html');
for (const f of ['manifest.webmanifest', 'sw.js']) copyFileSync(`dist/${f}`, f);
cpSync('dist/marca', 'marca', { recursive: true });
writeFileSync('.nojekyll', '');
console.log(`✔ index.html generado (${(statSync('index.html').size / 1048576).toFixed(2)} MB). Ábrelo con doble clic en Chrome o súbelo a GitHub.`);
