// Cerebro local de CAPIA: detecta emoción, resuelve con método socrático y responde con el contenido de CAPICÚA.
// Si el usuario configura una clave de IA, las respuestas abiertas se delegan a Claude (ver askClaude).
import { parse, evaluate, freeVars, diff, simplify, toString, toTex, evalNumber, equivalent } from '../../shared/math/expr.js';
import { searchAll, encyclopedia } from '../../shared/content/encyclopedia.js';
import { ALL_LEVELS, LEVEL_BY_ID } from '../../shared/content/regions.js';
import { makeQuestion } from '../../shared/content/generators.js';

/* ───── Emociones (análisis de sentimiento léxico, local y privado) ───── */
const LEX = {
  frustracion: ['no entiendo', 'no puedo', 'me rindo', 'odio', 'imposible', 'estoy harto', 'harta', 'frustr', 'otra vez mal', 'no me sale', 'soy malo', 'soy mala', 'qué asco', 'detesto', 'no sirvo', 'tonto', 'torpe', 'me cuesta mucho', 'no logro'],
  ansiedad: ['parcial', 'examen', 'mañana', 'no alcanzo', 'no me da tiempo', 'nervios', 'nervios', 'ansios', 'miedo', 'me voy a rajar', 'perder', 'reprobar', 'estresad', 'estrés', 'agobi', 'preocup', 'pánico'],
  motivacion: ['quiero aprender', 'quiero mejorar', 'vamos', 'listo', 'lista', 'motivad', 'ganas', 'reto', 'desafío', 'empecemos', 'practicar', 'me gustaría'],
  alegria: ['gracias', 'genial', 'lo logré', 'lo hice', 'entendí', 'por fin', 'feliz', 'me encanta', 'excelente', 'bien!', 'jaja', '😊', '😄', '🎉'],
  tristeza: ['triste', 'solo', 'sola', 'cansad', 'agotad', 'sin ganas', 'desanim', 'no vale la pena', 'llorar'],
};
export function detectEmotion(text) {
  const t = text.toLowerCase(); const score = {};
  for (const [k, words] of Object.entries(LEX)) score[k] = words.reduce((s, w) => s + (t.includes(w) ? 1 : 0), 0);
  const best = Object.entries(score).sort((a, b) => b[1] - a[1])[0];
  return best[1] > 0 ? best[0] : 'neutral';
}
const TONE = {
  frustracion: ['Respiremos un momento. Equivocarse es parte de aprender; no significa que no puedas. Vamos paso a paso, tú y yo.', 'Te entiendo: cuando algo no sale, cansa. Divide el problema: ¿qué sí sabes hacer de esto?'],
  ansiedad: ['Tranquilo/a: con un plan, un parcial se vuelve una lista de tareas pequeñas. Empecemos por lo más importante y dejamos descansos.', 'Es normal sentir nervios antes de un examen. Vamos a convertirlos en estrategia: ¿cuántos días faltan y qué temas entran?'],
  tristeza: ['Gracias por contármelo. Hoy puedes hacer algo pequeño, aunque sea 10 minutos; yo me quedo contigo.', 'Si estás agotado/a, descansar también es avanzar. ¿Quieres una pausa activa o un ejercicio muy fácil para sumar una victoria?'],
  alegria: ['¡Qué bien! Celebro contigo: eso que lograste es fruto de tu esfuerzo.', '¡Me encanta verte así! Aprovechemos la racha con un reto un poco más difícil.'],
  motivacion: ['¡Esa energía me gusta! Vamos a aprovecharla.', '¡Perfecto! Empecemos.'],
  neutral: [''],
};
export const toneFor = (emo) => TONE[emo][Math.floor(Math.random() * TONE[emo].length)];

/* ───── Resolución socrática de problemas escritos ───── */
function polyFit(ast) {
  // coeficientes de grado ≤ 3 por interpolación; verifica que realmente sea polinomio
  const f = (x) => evaluate(ast, { x });
  const f0 = f(0); const f1 = f(1); const fm1 = f(-1); const f2 = f(2);
  const c2 = (f1 + fm1) / 2 - f0; const c1 = (f1 - fm1) / 2;
  const c0 = f0; const test3 = f(3); const guess = c0 + c1 * 3 + c2 * 9;
  if (Math.abs(test3 - guess) > 1e-6 * Math.max(1, Math.abs(guess)) || Math.abs(f(-2) - (c0 - 2 * c1 + 4 * c2)) > 1e-6 * Math.max(1, Math.abs(guess))) return null;
  return [c2, c1, c0].map((v) => Math.round(v * 1e9) / 1e9);
}
const fmtN = (v) => String(Math.round(v * 1e6) / 1e6).replace('-', '−');

export function analyzeProblem(text) {
  const raw = text.replace(/^(resuelve|resolver|calcula|calcular|halla|hallar|encuentra|despeja|ayúdame con|ayudame con|ayuda con|ejercicio|problema)[:\s]+/i, '').trim();
  // Solo expresiones matemáticas: si hay palabras sueltas, es lenguaje natural
  if (/[a-záéíóúñü]{3,}/i.test(raw.replace(/\b(sin|cos|tan|ln|log|sqrt|exp|abs|asin|acos|atan|pi)\b/gi, ''))) return null;
  try {
    if (/=/.test(raw)) {
      const [l, r] = raw.split('='); const ast = parse(`(${l}) - (${r})`);
      const vars = [...freeVars(ast)]; if (vars.length === 1 && vars[0] === 'x') {
        const c = polyFit(ast);
        if (c) {
          const [a, b, k] = c;
          if (Math.abs(a) < 1e-9) {
            if (Math.abs(b) < 1e-9) return { kind: 'degenerate' };
            const sol = -k / b;
            return { kind: 'linear', answer: [sol], steps: [`Pasa todo a un lado: $${fmtN(b)}x + ${fmtN(k)} = 0$ (ya simplificado).`, `Deshaz el término suelto: $${fmtN(b)}x = ${fmtN(-k)}$.`, `Divide entre ${fmtN(b)}: $x = ${fmtN(sol)}$.`, `Comprueba: sustituye x = ${fmtN(sol)} en la ecuación original.`],
              guide: ['¿Qué tiene la ecuación de un lado y del otro? Piensa en una balanza: ¿cómo dejarías sola a la x?', 'Mira el número que está sumando o restando junto a la x: ¿qué operación lo deshace?', 'Después de dejar el término con x solo, ¿entre qué número divides?'], ask: 'Intenta el primer paso y cuéntame qué hiciste.' };
          }
          const D = b * b - 4 * a * k;
          const roots = D < 0 ? [] : D === 0 ? [-b / (2 * a)] : [(-b + Math.sqrt(D)) / (2 * a), (-b - Math.sqrt(D)) / (2 * a)];
          return { kind: 'quadratic', answer: roots, steps: [`Llévala a la forma $ax^2+bx+c=0$: $${fmtN(a)}x^2 + ${fmtN(b)}x + ${fmtN(k)} = 0$.`, `Discriminante: $b^2-4ac = ${fmtN(D)}$.`, D < 0 ? 'Es negativo: no hay soluciones reales.' : `$x = \\frac{-b\\pm\\sqrt{\\Delta}}{2a}$ → $x = ${roots.map(fmtN).join(',\; x = ')}$.`],
            guide: ['¿Qué grado tiene la ecuación? ¿Qué métodos conoces para ese grado?', '¿Puedes factorizarla? ¿Qué dos números multiplican a c y suman b?', 'Si no se factoriza, ¿recuerdas la fórmula general? ¿Cuánto vale el discriminante?'], ask: '¿Qué valores tienen a, b y c?' };
        }
      }
    } else {
      const ast = parse(raw); const vars = [...freeVars(ast)];
      if (!vars.length) { const v = evaluate(ast, {}); return { kind: 'calc', answer: [v], steps: [`Resuelve respetando el orden: paréntesis, potencias, × ÷, + −.`, `Resultado: $${fmtN(v)}$.`], guide: ['¿Qué operación va primero? Recuerda el orden: paréntesis, potencias, multiplicación y división, suma y resta.', 'Resuelve primero lo que está entre paréntesis.'], ask: '¿Cuánto te da?' }; }
      return { kind: 'expr', ast, vars };
    }
  } catch { /* no es una expresión matemática simple */ }
  return null;
}

export function derive(text) {
  const m = text.match(/(?:deriva|derivada de|derivar)\s*(?:de)?\s*:?\s*(.+)/i); if (!m) return null;
  try { const ast = parse(m[1].replace(/^f\(x\)\s*=\s*/i, '')); const d = simplify(diff(ast, 'x')); return { f: toTex(ast), d: toTex(d), plain: toString(d) }; } catch { return null; }
}
export function factorQuadratic(text) {
  const m = text.match(/factoriz\w*\s*:?\s*(.+)/i); if (!m) return null;
  try {
    const ast = parse(m[1]); const c = polyFit(ast); if (!c) return null; const [a, b, k] = c; if (!a) return null;
    const D = b * b - 4 * a * k; if (D < 0 || !Number.isInteger(Math.sqrt(D))) return { none: true, a, b, k, D };
    const r1 = (-b + Math.sqrt(D)) / (2 * a); const r2 = (-b - Math.sqrt(D)) / (2 * a);
    return { a, b, k, r1, r2, tex: `${a === 1 ? '' : a}(x ${r1 > 0 ? '-' : '+'} ${fmtN(Math.abs(r1))})(x ${r2 > 0 ? '-' : '+'} ${fmtN(Math.abs(r2))})` };
  } catch { return null; }
}

/* ───── Entiende lo que pide el usuario ───── */
export function bestLevelFor(text) {
  const hits = searchAll(text.replace(/practic\w+|ejercicios?|quiero|de|sobre|con|el|la|los|las|un|una/gi, ' '), 5).filter((r) => r.ref.type === 'codex');
  for (const h of hits) { const id = h.ref.id; if (LEVEL_BY_ID[id]) return LEVEL_BY_ID[id]; const e = encyclopedia().find((x) => x.id === id); if (e?.ejercicio) { const lv = ALL_LEVELS.find((l) => l.gens.includes(e.ejercicio) || l.gens.some((g) => g.split(/[#@]/)[0] === e.ejercicio.split(/[#@]/)[0])); if (lv) return lv; } }
  return null;
}
export function explainEntry(text) {
  const q = text.replace(/^(explícame|explicame|explica|explicar|qué es|que es|qué son|que son|defin\w+|cuéntame sobre|háblame de)\s*(la|el|los|las|un|una)?\s*/i, '');
  const hit = searchAll(q, 3).find((r) => r.ref.type === 'codex'); if (!hit) return null;
  return encyclopedia().find((e) => e.id === hit.ref.id);
}

export const SYSTEM_PROMPT = `Eres CAPIA, la compañera de estudio de la plataforma CAPICÚA ("El universo del saber"). Hablas en español, con voz cálida, paciente, curiosa y ligeramente divertida. NUNCA humillas ni juzgas; cada error es información.
Reglas pedagógicas:
- Método socrático: no entregues la respuesta final de un ejercicio de inmediato. Haz 1–2 preguntas guía, pide que lo intenten y da pistas graduales (pista 1, 2, 3). Solo da el procedimiento completo si lo piden después de intentarlo.
- Detecta el estado emocional (frustración, ansiedad, motivación, alegría, tristeza) y ajusta el tono: paciente si hay frustración, calmante y estratégica si hay ansiedad por un parcial, celebratoria si hay logro.
- Explica por qué funcionan las fórmulas (intuición + símbolos + ejemplo). Fomenta resolver en papel.
- Rigor: no inventes teoremas, fórmulas, datos históricos ni referencias. Si no estás segura, dilo. En historia evita llamar "creador" a una sola persona cuando fue un desarrollo colectivo.
- Usa LaTeX entre $...$ para fórmulas. Respuestas breves (máx. ~150 palabras) salvo que pidan más.
- Sugiere pausas (Pomodoro 50/10) si el estudiante lleva mucho rato, y recuerda sus metas con cariño.
- Si analizas una foto de un ejercicio: 1) transcribe, 2) identifica el tema, 3) lista datos, 4) guía paso a paso explicando la lógica de cada fórmula, 5) propón un ejercicio similar.`;

/** Llama a Claude directamente desde el navegador con la clave del usuario (se guarda solo en su dispositivo). */
export async function askClaude({ key, model, messages, emotion, context, image }) {
  const sys = `${SYSTEM_PROMPT}\nEstado emocional detectado: ${emotion}.\nContexto del estudiante: ${context}`;
  const msgs = messages.slice(-12).map((m) => ({ role: m.role === 'capia' ? 'assistant' : 'user', content: m.text }));
  if (image) { const last = msgs[msgs.length - 1]; last.content = [{ type: 'image', source: { type: 'base64', media_type: image.type, data: image.data } }, { type: 'text', text: last.content }]; }
  const res = await fetch('https://api.anthropic.com/v1/messages', { method: 'POST', headers: { 'content-type': 'application/json', 'x-api-key': key, 'anthropic-version': '2023-06-01', 'anthropic-dangerous-direct-browser-access': 'true' }, body: JSON.stringify({ model: model || 'claude-sonnet-5-5', max_tokens: 900, system: sys, messages: msgs }) });
  if (!res.ok) { const t = await res.text().catch(() => ''); throw new Error(res.status === 401 ? 'La clave de IA no es válida.' : `La IA respondió con error ${res.status}. ${t.slice(0, 120)}`); }
  const data = await res.json(); return data.content.map((c) => c.text || '').join('\n').trim();
}

/* ───── Resumen y tarjetas a partir de un texto (PDF) — heurístico y local ───── */
const STOP = new Set('de la que el en y a los del se las por un para con no una su al lo como más pero sus le ya o este sí porque esta entre cuando muy sin sobre también me hasta hay donde quien desde todo nos durante todos uno les ni contra otros ese eso ante ellos e esto mí antes algunos qué unos yo otro otras otra él tanto esa estos mucho quienes nada muchos cual poco ella estar estas algunas algo nosotros mi mis tú te ti tu tus ellas nosotras vosotros vosotras os mío mía míos mías tuyo tuya suyo suya nuestro nuestra es son fue ser the of and to in is for on that with as are by this be from or an at which'.split(' '));
export function summarize(text, n = 5) {
  const sents = (text.replace(/\s+/g, ' ').match(/[^.!?]{25,300}[.!?]/g) || []).map((s) => s.trim());
  if (!sents.length) return [];
  const freq = {}; text.toLowerCase().replace(/[^a-záéíóúñü\s]/g, ' ').split(/\s+/).forEach((w) => { if (w.length > 3 && !STOP.has(w)) freq[w] = (freq[w] || 0) + 1; });
  const scored = sents.map((s, i) => ({ s, i, sc: s.toLowerCase().split(/\W+/).reduce((a, w) => a + (freq[w] || 0), 0) / Math.sqrt(s.length) }));
  return scored.sort((a, b) => b.sc - a.sc).slice(0, n).sort((a, b) => a.i - b.i).map((x) => x.s);
}
export function keywordsOf(text, n = 10) {
  const freq = {}; text.toLowerCase().replace(/[^a-záéíóúñü\s]/g, ' ').split(/\s+/).forEach((w) => { if (w.length > 4 && !STOP.has(w)) freq[w] = (freq[w] || 0) + 1; });
  return Object.entries(freq).sort((a, b) => b[1] - a[1]).slice(0, n).map(([w]) => w);
}
export function cardsFrom(text, n = 8) {
  const out = []; const sents = text.replace(/\s+/g, ' ').match(/[^.!?]{25,220}[.!?]/g) || []; const kws = keywordsOf(text, 20);
  for (const s of sents) { const k = kws.find((w) => s.toLowerCase().includes(w)); if (k) { out.push({ front: s.replace(new RegExp(k, 'i'), '_____'), back: k }); } if (out.length >= n) break; }
  return out;
}
export const detectTopics = (text) => { const hits = new Map(); keywordsOf(text, 30).forEach((w) => searchAll(w, 3).filter((r) => r.ref.type === 'codex' && LEVEL_BY_ID[r.ref.id]).forEach((r) => hits.set(r.ref.id, (hits.get(r.ref.id) || 0) + r.score))); return [...hits.entries()].sort((a, b) => b[1] - a[1]).slice(0, 4).map(([id]) => LEVEL_BY_ID[id]); };
