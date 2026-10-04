// Extracción de texto de PDF en el navegador con pdf.js (se descarga solo cuando se sube un PDF).
const VER = '4.10.38'; const BASE = `https://cdn.jsdelivr.net/npm/pdfjs-dist@${VER}/build`;
let lib;
async function load() {
  if (lib) return lib;
  try {
    lib = await import(/* @vite-ignore */ `${BASE}/pdf.min.mjs`);
    const blob = new Blob([`import "${BASE}/pdf.worker.min.mjs";`], { type: 'text/javascript' });
    lib.GlobalWorkerOptions.workerPort = new Worker(URL.createObjectURL(blob), { type: 'module' });
    return lib;
  } catch { throw new Error('Para leer PDF necesito descargar el lector (pdf.js): revisa tu conexión a internet.'); }
}
export async function extractPdf(file) {
  if (file.size > 25 * 1024 * 1024) throw new Error('El archivo supera 25 MB.');
  const pdfjs = await load(); const doc = await pdfjs.getDocument({ data: await file.arrayBuffer() }).promise; let text = '';
  for (let i = 1; i <= Math.min(doc.numPages, 200); i++) { const pg = await doc.getPage(i); const c = await pg.getTextContent(); text += c.items.map((x) => x.str).join(' ') + '\n'; }
  if (text.replace(/\s/g, '').length < 40) throw new Error('El PDF parece escaneado (sin texto). Sube una foto de la página para que CAPIA la mire.');
  return { name: file.name, pages: doc.numPages, text };
}
