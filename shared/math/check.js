// Comprobación de respuestas para todos los tipos de pregunta de CAPICÚA.
import { parse, evaluate, evalNumber, equivalent, equivalentUpToConstant, isExpanded, isFactored, freeVars } from './expr.js';

const gcd = (a, b) => (b ? gcd(b, a % b) : Math.abs(a));

const tolOf = (q) => {
  const abs = q.tol ?? 0;
  const rel = q.relTol ?? 0;
  return (ans) => Math.max(abs, rel * Math.abs(ans), 1e-9);
};

function splitList(s) {
  return String(s)
    .replace(/\by\b/gi, ',').replace(/\band\b/gi, ',')
    .replace(/[()]/g, ' ').replace(/;/g, ',')
    .split(',').map((t) => t.trim()).filter(Boolean);
}

function parseTuple(input) {
  return splitList(input).map((t) => evalNumber(t));
}

function parseFactors(input) {
  const out = [];
  const parts = String(input).replace(/[×·⋅]/g, '*').replace(/x(?=\s*\d)/gi, '*').split(/[*\s,]+/).filter(Boolean);
  for (const part of parts) {
    const m = part.match(/^(\d+)(?:\^(\d+))?$/);
    if (!m) throw new Error('Escribe los factores así: 2^2 * 3 * 7');
    const p = parseInt(m[1], 10); const k = m[2] ? parseInt(m[2], 10) : 1;
    for (let i = 0; i < k; i++) out.push(p);
  }
  return out.sort((a, b) => a - b);
}

export function parseComplex(input) {
  const s = String(input).replace(/\s+/g, '').replace(/−/g, '-').replace(/,/g, '.');
  if (!s) throw new Error('Escribe un complejo, por ejemplo 3+2i');
  const numOf = (t) => (t === '' || t === '+' ? 1 : t === '-' ? -1 : evalNumber(t));
  if (/i$/.test(s)) {
    const body = s.slice(0, -1);
    const m = body.match(/^(.*?)([+-][^+-]*)$/);
    if (m && m[1] !== '') return { re: evalNumber(m[1]), im: numOf(m[2]) };
    return { re: 0, im: numOf(body) };
  }
  return { re: evalNumber(s), im: 0 };
}

/**
 * Comprueba una respuesta.
 * @returns {{ok:boolean, note?:string, diag?:{msg:string, step?:number}, parsed?:any, error?:string}}
 */
export function checkAnswer(q, input) {
  try {
    switch (q.type) {
      case 'choice': return { ok: Number(input) === q.answer };
      case 'tf': return { ok: Boolean(input) === q.answer };
      case 'order': return { ok: Array.isArray(input) && input.length === q.answer.length && input.every((v, i) => v === q.answer[i]) };
      case 'numeric': {
        const v = evalNumber(input);
        const ok = Math.abs(v - q.answer) <= tolOf(q)(q.answer);
        const r = { ok, parsed: v };
        if (!ok && q.diagnose) r.diag = q.diagnose(v, input) || undefined;
        return r;
      }
      case 'frac': {
        const raw = String(input).trim();
        const v = evalNumber(raw);
        const ok = Math.abs(v - q.answer) <= 1e-9;
        const r = { ok, parsed: v };
        if (ok) {
          const m = raw.match(/^(-?\d+)\s*\/\s*(-?\d+)$/);
          if (m && gcd(+m[1], +m[2]) > 1) r.note = 'Es correcto, pero todavía puedes simplificar la fracción.';
          if (!m && !Number.isInteger(q.answer) && q.requireFraction) r.note = 'Intenta escribirlo como fracción a/b.';
        } else if (q.diagnose) r.diag = q.diagnose(v, input) || undefined;
        return r;
      }
      case 'expr': {
        const ast = parse(input);
        const allowed = q.vars ? new Set(q.vars) : null;
        if (allowed) for (const v of freeVars(ast)) if (!allowed.has(v)) return { ok: false, error: `Aquí la variable es ${[...allowed].join(', ')}, no “${v}”.` };
        const same = q.upToConstant ? equivalentUpToConstant(ast, q.answer) : equivalent(ast, q.answer);
        const r = { ok: false, parsed: ast };
        if (same) {
          if (q.form === 'expanded' && !isExpanded(ast)) r.note = 'Es equivalente, pero pide la forma desarrollada (sin paréntesis que multipliquen).';
          else if (q.form === 'factored' && !isFactored(ast)) r.note = 'Es equivalente, pero pide la expresión factorizada (como producto).';
          else r.ok = true;
        } else if (q.diagnose) r.diag = q.diagnose(null, input, ast) || undefined;
        return r;
      }
      case 'set': {
        const vals = splitList(input).map((t) => evalNumber(t)).sort((a, b) => a - b);
        const exp = [...q.answer].sort((a, b) => a - b);
        const ok = vals.length === exp.length && vals.every((v, i) => Math.abs(v - exp[i]) <= Math.max(q.tol ?? 0, 1e-9));
        const r = { ok, parsed: vals };
        if (!ok && q.diagnose) r.diag = q.diagnose(vals, input) || undefined;
        return r;
      }
      case 'tuple': {
        const vals = Array.isArray(input) ? input.map((t) => evalNumber(t)) : parseTuple(input);
        const ok = vals.length === q.answer.length && vals.every((v, i) => Math.abs(v - q.answer[i]) <= Math.max(q.tol ?? 0, q.relTol ? q.relTol * Math.abs(q.answer[i]) : 0, 1e-9));
        const r = { ok, parsed: vals };
        if (!ok && q.diagnose) r.diag = q.diagnose(vals, input) || undefined;
        return r;
      }
      case 'direction': {
        const v = parseTuple(input);
        const a = q.answer;
        if (v.length !== a.length) return { ok: false };
        const nz = v.some((x) => Math.abs(x) > 1e-9);
        // paralelo: matriz de rango 1
        let par = nz;
        for (let i = 0; i < a.length && par; i++) for (let j = i + 1; j < a.length; j++) if (Math.abs(v[i] * a[j] - v[j] * a[i]) > 1e-6) par = false;
        return { ok: par, parsed: v };
      }
      case 'matrix': {
        const rows = input; // array de arrays de strings
        const ok = rows.length === q.answer.length && rows.every((r, i) => r.length === q.answer[i].length && r.every((c, j) => Math.abs(evalNumber(c) - q.answer[i][j]) <= 1e-9));
        return { ok };
      }
      case 'complex': {
        const z = parseComplex(input);
        const ok = Math.abs(z.re - q.answer.re) < 1e-9 && Math.abs(z.im - q.answer.im) < 1e-9;
        const r = { ok, parsed: z };
        if (!ok && q.diagnose) r.diag = q.diagnose(z, input) || undefined;
        return r;
      }
      case 'primefac': {
        const f = parseFactors(input);
        const ok = f.length === q.answer.length && f.every((v, i) => v === q.answer[i]);
        return { ok, parsed: f };
      }
      default:
        return { ok: false, error: 'Tipo de pregunta no soportado' };
    }
  } catch (e) {
    return { ok: false, error: e.message || 'No entendí tu respuesta' };
  }
}

/** Texto de la respuesta correcta para mostrar al estudiante. */
export function answerText(q) {
  switch (q.type) {
    case 'choice': return q.choices[q.answer];
    case 'tf': return q.answer ? 'Verdadero' : 'Falso';
    case 'order': return q.answer.map((i) => q.items[i]).join(' → ');
    case 'numeric': case 'frac': return q.answerText ?? String(+Number(q.answer).toFixed(4));
    case 'expr': return q.answerText ?? q.answer;
    case 'set': return q.answerText ?? q.answer.join(', ');
    case 'tuple': case 'direction': return q.answerText ?? `(${q.answer.join(', ')})`;
    case 'matrix': return q.answerText ?? q.answer.map((r) => r.join(' ')).join(' | ');
    case 'complex': return q.answerText ?? `${q.answer.re}${q.answer.im >= 0 ? '+' : ''}${q.answer.im}i`;
    case 'primefac': return q.answerText ?? q.answer.join(' · ');
    default: return String(q.answer);
  }
}

export { evaluate };
