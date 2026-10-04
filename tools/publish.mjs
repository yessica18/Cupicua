// Copia el sitio compilado (un único archivo) a la raíz como index.html, listo para publicar.
import { copyFileSync, writeFileSync, statSync } from 'node:fs';
copyFileSync('dist/index.dev.html', 'index.html');
writeFileSync('.nojekyll', '');
console.log(`✔ index.html generado (${(statSync('index.html').size / 1048576).toFixed(2)} MB). Ábrelo con doble clic en Chrome o súbelo a GitHub.`);
