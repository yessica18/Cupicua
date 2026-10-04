// Motor de expresiones de CAPICÚA.
// Analiza, evalúa, compara (equivalencia numérica), deriva simbólicamente y convierte a LaTeX.
// Es compartido por el navegador (comprobar respuestas) y el servidor (verificar ejercicios de la IA).

const FUNCS = ['asin', 'acos', 'atan', 'sinh', 'cosh', 'tanh', 'sqrt', 'cbrt', 'sin', 'cos', 'tan', 'ln', 'log', 'exp', 'abs'];
const CONSTS = { pi: Math.PI, e: Math.E };

/** Normaliza la entrada humana (π, ², ×, ÷, coma decimal...) a una cadena analizable. */
export function normalizeInput(s) {
  return String(s)
    .replace(/−|–|—/g, '-')
    .replace(/[×·⋅∙]/g, '*')
    .replace(/÷/g, '/')
    .replace(/π/g, ' pi ')
    .replace(/√\s*\(/g, ' sqrt(')
    .replace(/√\s*([0-9a-zA-Z.]+)/g, ' sqrt($1)')
    .replace(/∛\s*([0-9a-zA-Z.]+)/g, ' cbrt($1)')
    .replace(/²/g, '^2').replace(/³/g, '^3').replace(/⁴/g, '^4')
    .replace(/(\d),(\d)/g, '$1.$2')
    .replace(/\[/g, '(').replace(/\]/g, ')')
    .replace(/\{/g, '(').replace(/\}/g, ')')
    .replace(/\s+/g, ' ')
    .trim();
}

function tokenize(src) {
  const s = normalizeInput(src);
  const out = [];
  let i = 0;
  while (i < s.length) {
    const c = s[i];
    if (c === ' ') { i++; continue; }
    if (/[0-9.]/.test(c)) {
      let j = i;
      while (j < s.length && /[0-9.]/.test(s[j])) j++;
      // notación científica: 2.5e-4, 3E8
      const sci = s.slice(j).match(/^[eE]([+-]?\d+)/);
      const txt = s.slice(i, j);
      if (txt.split('.').length > 2) throw new Error('Número mal escrito');
      if (sci) { out.push({ k: 'num', v: parseFloat(txt + 'e' + sci[1]) }); i = j + sci[0].length; continue; }
      out.push({ k: 'num', v: parseFloat(txt) });
      i = j; continue;
    }
    if (/[a-zA-Z_]/.test(c)) {
      let j = i;
      while (j < s.length && /[a-zA-Z_]/.test(s[j])) j++;
      let word = s.slice(i, j);
      // Reparte "xy", "2xsin" etc. en funciones/constantes/variables de una letra.
      while (word.length) {
        const f = FUNCS.find((fn) => word.startsWith(fn));
        if (f) { out.push({ k: 'fn', v: f }); word = word.slice(f.length); continue; }
        if (word.startsWith('pi')) { out.push({ k: 'const', v: 'pi' }); word = word.slice(2); continue; }
        out.push({ k: 'id', v: word[0] }); word = word.slice(1);
      }
      i = j; continue;
    }
    if ('+-*/^(),='.includes(c)) { out.push({ k: 'op', v: c }); i++; continue; }
    if (c === '!') { out.push({ k: 'op', v: '!' }); i++; continue; }
    throw new Error(`Símbolo no reconocido: ${c}`);
  }
  return out;
}

/** Devuelve un AST: {t:'num',v} {t:'var',v} {t:'bin',op,a,b} {t:'neg',a} {t:'fn',f,a} */
export function parse(src, opts = {}) {
  const toks = tokenize(src);
  let p = 0;
  const peek = () => toks[p];
  const isAtomStart = (t) => t && (t.k === 'num' || t.k === 'id' || t.k === 'const' || t.k === 'fn' || (t.k === 'op' && t.v === '('));
  const eatOp = (v) => { if (peek() && peek().k === 'op' && peek().v === v) { p++; return true; } return false; };

  function expr() {
    let a = term();
    while (peek() && peek().k === 'op' && (peek().v === '+' || peek().v === '-')) {
      const op = toks[p++].v;
      a = { t: 'bin', op, a, b: term() };
    }
    return a;
  }
  function term() {
    let a = unary();
    for (;;) {
      const t = peek();
      if (t && t.k === 'op' && (t.v === '*' || t.v === '/')) { p++; a = { t: 'bin', op: t.v, a, b: unary() }; continue; }
      if (isAtomStart(t)) { a = { t: 'bin', op: '*', a, b: unary(), implicit: true }; continue; }
      break;
    }
    return a;
  }
  function unary() {
    if (eatOp('-')) return { t: 'neg', a: unary() };
    if (eatOp('+')) return unary();
    return power();
  }
  function power() {
    const base = postfix();
    if (eatOp('^')) {
      const ex = unary();
      return { t: 'bin', op: '^', a: base, b: ex };
    }
    return base;
  }
  function postfix() {
    let a = atom();
    while (peek() && peek().k === 'op' && peek().v === '!') { p++; a = { t: 'fn', f: 'fact', a }; }
    return a;
  }
  function atom() {
    const t = toks[p++];
    if (!t) throw new Error('Expresión incompleta');
    if (t.k === 'num') return { t: 'num', v: t.v };
    if (t.k === 'const') return { t: 'num', v: CONSTS[t.v], sym: t.v };
    if (t.k === 'id') {
      if (t.v === 'e' && !(opts.vars && opts.vars.includes('e'))) return { t: 'num', v: Math.E, sym: 'e' };
      return { t: 'var', v: t.v };
    }
    if (t.k === 'fn') {
      let arg;
      if (peek() && peek().k === 'op' && peek().v === '(') {
        p++; arg = expr();
        if (!eatOp(')')) throw new Error('Falta un paréntesis');
      } else {
        // sin x, sin 2x → argumento sin paréntesis (potencia tipo sin^2 no soportada)
        arg = power();
      }
      return { t: 'fn', f: t.v, a: arg };
    }
    if (t.k === 'op' && t.v === '(') {
      const a = expr();
      if (!eatOp(')')) throw new Error('Falta un paréntesis');
      return { t: 'group', a };
    }
    throw new Error('Expresión no válida');
  }

  const ast = expr();
  if (p < toks.length) throw new Error('No entiendo la expresión');
  return strip(ast);
}

// Quita nodos 'group' (solo útiles para saber que hubo paréntesis; los marcamos)
function strip(n) {
  if (n.t === 'group') { const a = strip(n.a); a.paren = true; return a; }
  if (n.t === 'bin') return { ...n, a: strip(n.a), b: strip(n.b) };
  if (n.t === 'neg' || n.t === 'fn') return { ...n, a: strip(n.a) };
  return n;
}

const fact = (n) => { if (n < 0 || !Number.isInteger(n) || n > 170) return NaN; let r = 1; for (let i = 2; i <= n; i++) r *= i; return r; };

export function evaluate(n, env = {}) {
  switch (n.t) {
    case 'num': return n.v;
    case 'var': { if (!(n.v in env)) throw new Error(`Variable sin valor: ${n.v}`); return env[n.v]; }
    case 'neg': return -evaluate(n.a, env);
    case 'bin': {
      const a = evaluate(n.a, env); const b = evaluate(n.b, env);
      switch (n.op) {
        case '+': return a + b; case '-': return a - b; case '*': return a * b;
        case '/': return a / b;
        case '^': return Math.pow(a, b);
      }
      break;
    }
    case 'fn': {
      const x = evaluate(n.a, env);
      switch (n.f) {
        case 'sin': return Math.sin(x); case 'cos': return Math.cos(x); case 'tan': return Math.tan(x);
        case 'asin': return Math.asin(x); case 'acos': return Math.acos(x); case 'atan': return Math.atan(x);
        case 'sinh': return Math.sinh(x); case 'cosh': return Math.cosh(x); case 'tanh': return Math.tanh(x);
        case 'sqrt': return Math.sqrt(x); case 'cbrt': return Math.cbrt(x);
        case 'ln': return Math.log(x); case 'log': return Math.log10(x);
        case 'exp': return Math.exp(x); case 'abs': return Math.abs(x);
        case 'fact': return fact(x);
      }
    }
  }
  throw new Error('Nodo desconocido');
}

export function freeVars(n, set = new Set()) {
  if (n.t === 'var') set.add(n.v);
  else if (n.t === 'bin') { freeVars(n.a, set); freeVars(n.b, set); }
  else if (n.a) freeVars(n.a, set);
  return set;
}

/** Evalúa una expresión sin variables (para respuestas numéricas: 3/4, sqrt(2), 2pi...). */
export function evalNumber(src) {
  let s = String(src).trim().replace(/^[a-zA-Zθλμ_]\w*\s*=\s*/, '').replace(/%$/, '');
  s = s.replace(/\s*(°|grados|deg)\s*$/i, '');
  const ast = parse(s);
  if (freeVars(ast).size) throw new Error('Escribe solo números');
  return evaluate(ast, {});
}

function mulberry(seed) {
  let a = seed >>> 0;
  return () => { a = (a + 0x6d2b79f5) >>> 0; let t = a; t = Math.imul(t ^ (t >>> 15), t | 1); t ^= t + Math.imul(t ^ (t >>> 7), t | 61); return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };
}

function sampleEnvs(vars, count = 14) {
  const r = mulberry(1234567);
  const envs = [];
  for (let i = 0; i < count; i++) {
    const env = {};
    for (const v of vars) env[v] = +(r() * 5.4 + 0.35).toFixed(4) * (i % 4 === 3 ? -1 : 1);
    envs.push(env);
  }
  return envs;
}

const close = (a, b) => Math.abs(a - b) <= 1e-7 * Math.max(1, Math.abs(a), Math.abs(b));

/** ¿Dos expresiones son equivalentes (mismos valores en muchos puntos)? */
export function equivalent(a, b) {
  const A = typeof a === 'string' ? parse(a) : a;
  const B = typeof b === 'string' ? parse(b) : b;
  const vars = [...new Set([...freeVars(A), ...freeVars(B)])];
  let ok = 0;
  for (const env of sampleEnvs(vars)) {
    let x; let y;
    try { x = evaluate(A, env); y = evaluate(B, env); } catch { continue; }
    if (!Number.isFinite(x) && !Number.isFinite(y)) continue;
    if (!Number.isFinite(x) || !Number.isFinite(y)) return false;
    if (!close(x, y)) return false;
    ok++;
  }
  return ok >= 4;
}

/** Equivalencia salvo constante aditiva (antiderivadas: + C). */
export function equivalentUpToConstant(a, b) {
  const A = typeof a === 'string' ? parse(a) : a;
  const B = typeof b === 'string' ? parse(b) : b;
  const vars = [...new Set([...freeVars(A), ...freeVars(B)])];
  let diff = null; let ok = 0;
  for (const env of sampleEnvs(vars)) {
    let d;
    try { d = evaluate(A, env) - evaluate(B, env); } catch { continue; }
    if (!Number.isFinite(d)) continue;
    if (diff === null) diff = d; else if (!close(diff, d)) return false;
    ok++;
  }
  return ok >= 4;
}

/** Derivada numérica (diferencias centrales) de una función JS. */
export const numDeriv = (f, x, h = 1e-5) => (f(x + h) - f(x - h)) / (2 * h);

// ───────── Estructura de la expresión (para exigir "expandido" o "factorizado") ─────────
const isSum = (n) => n.t === 'bin' && (n.op === '+' || n.op === '-');
export function isExpanded(ast) {
  let bad = false;
  (function walk(n) {
    if (n.t === 'bin' && n.op === '*' && (isSum(n.a) || isSum(n.b))) bad = true;
    if (n.t === 'bin' && n.op === '^' && isSum(n.a) && n.b.t === 'num' && n.b.v > 1) bad = true;
    if (n.t === 'neg' && n.a.t === 'bin' && n.a.op === '*' && (isSum(n.a.a) || isSum(n.a.b))) bad = true;
    if (n.t === 'bin') { walk(n.a); walk(n.b); } else if (n.a) walk(n.a);
  })(ast);
  return !bad;
}
export function isFactored(ast) {
  let n = ast;
  while (n.t === 'neg') n = n.a;
  if (n.t === 'bin' && n.op === '*') return true;
  if (n.t === 'bin' && n.op === '^' && isSum(n.a)) return true;
  return false;
}

// ───────── Derivación simbólica ─────────
const N = (v) => ({ t: 'num', v });
const bin = (op, a, b) => ({ t: 'bin', op, a, b });
const isNum = (n, v) => n.t === 'num' && (v === undefined || n.v === v);

export function simplify(n) {
  if (n.t === 'num' || n.t === 'var') return n;
  if (n.t === 'neg') {
    const a = simplify(n.a);
    if (isNum(a)) return N(-a.v);
    if (a.t === 'neg') return a.a;
    return { t: 'neg', a };
  }
  if (n.t === 'fn') return { ...n, a: simplify(n.a) };
  const a = simplify(n.a); const b = simplify(n.b);
  const { op } = n;
  if (isNum(a) && isNum(b)) {
    const v = evaluate({ t: 'bin', op, a, b }, {});
    if (Number.isFinite(v) && (Number.isInteger(v) || op !== '/' )) return N(v);
    if (op === '/' ) return bin(op, a, b);
  }
  if (op === '+') { if (isNum(a, 0)) return b; if (isNum(b, 0)) return a; }
  if (op === '-') { if (isNum(b, 0)) return a; if (isNum(a, 0)) return simplify({ t: 'neg', a: b }); }
  if (op === '*') {
    if (isNum(a, 0) || isNum(b, 0)) return N(0);
    if (isNum(a, 1)) return b; if (isNum(b, 1)) return a;
    if (isNum(a, -1)) return simplify({ t: 'neg', a: b });
    if (isNum(b, -1)) return simplify({ t: 'neg', a });
    if (isNum(b) && !isNum(a)) return bin('*', b, a);
  }
  if (op === '/') { if (isNum(b, 1)) return a; if (isNum(a, 0)) return N(0); }
  if (op === '^') { if (isNum(b, 1)) return a; if (isNum(b, 0)) return N(1); }
  return bin(op, a, b);
}

export function diff(n, v = 'x') {
  switch (n.t) {
    case 'num': return N(0);
    case 'var': return N(n.v === v ? 1 : 0);
    case 'neg': return { t: 'neg', a: diff(n.a, v) };
    case 'bin': {
      const { op, a, b } = n;
      if (op === '+' || op === '-') return bin(op, diff(a, v), diff(b, v));
      if (op === '*') return bin('+', bin('*', diff(a, v), b), bin('*', a, diff(b, v)));
      if (op === '/') return bin('/', bin('-', bin('*', diff(a, v), b), bin('*', a, diff(b, v))), bin('^', b, N(2)));
      if (op === '^') {
        if (!freeVars(b).has(v)) return bin('*', bin('*', b, bin('^', a, bin('-', b, N(1)))), diff(a, v));
        if (!freeVars(a).has(v)) return bin('*', bin('*', n, { t: 'fn', f: 'ln', a }), diff(b, v));
        // a^b = e^(b ln a)
        return bin('*', n, diff(bin('*', b, { t: 'fn', f: 'ln', a }), v));
      }
      break;
    }
    case 'fn': {
      const u = n.a; const du = diff(u, v);
      let d;
      switch (n.f) {
        case 'sin': d = { t: 'fn', f: 'cos', a: u }; break;
        case 'cos': d = { t: 'neg', a: { t: 'fn', f: 'sin', a: u } }; break;
        case 'tan': d = bin('/', N(1), bin('^', { t: 'fn', f: 'cos', a: u }, N(2))); break;
        case 'exp': d = n; break;
        case 'ln': d = bin('/', N(1), u); break;
        case 'sqrt': d = bin('/', N(1), bin('*', N(2), n)); break;
        case 'atan': d = bin('/', N(1), bin('+', N(1), bin('^', u, N(2)))); break;
        default: throw new Error('No sé derivar esa función todavía');
      }
      return bin('*', d, du);
    }
  }
  throw new Error('No se puede derivar');
}

const prec = (n) => (n.t === 'bin' ? ({ '+': 1, '-': 1, '*': 2, '/': 2, '^': 3 })[n.op] : n.t === 'neg' ? 2 : 4);
export function toString(n, parentPrec = 0, right = false) {
  let s;
  switch (n.t) {
    case 'num': s = n.sym === 'pi' ? 'π' : Number.isInteger(n.v) ? String(n.v) : String(+n.v.toFixed(6)); break;
    case 'var': s = n.v; break;
    case 'neg': s = '-' + toString(n.a, 2); break;
    case 'fn': s = `${n.f}(${toString(n.a)})`; break;
    case 'bin': {
      const p = prec(n);
      const l = toString(n.a, p, false); const r = toString(n.b, p, true);
      if (n.op === '*') {
        const simple = (n.a.t === 'num' && (n.b.t === 'var' || n.b.t === 'fn' || (n.b.t === 'bin' && n.b.op === '^'))) || (n.a.t === 'var' && n.b.t === 'var');
        s = simple ? `${l}${r}` : `${l}·${r}`;
      } else s = `${l} ${n.op === '^' ? '^' : n.op} ${r}`.replace(' ^ ', '^');
      break;
    }
  }
  const p = n.t === 'bin' ? prec(n) : n.t === 'neg' ? 2 : 4;
  const need = p < parentPrec || (right && p === parentPrec && n.t === 'bin' && (n.op === '-' || n.op === '/' ));
  return need ? `(${s})` : s;
}

export function toTex(n, parentPrec = 0, right = false) {
  let s;
  switch (n.t) {
    case 'num': s = n.sym === 'pi' ? '\\pi' : n.sym === 'e' ? 'e' : Number.isInteger(n.v) ? String(n.v) : String(+n.v.toFixed(6)); break;
    case 'var': s = n.v; break;
    case 'neg': s = '-' + toTex(n.a, 2); break;
    case 'fn': s = n.f === 'sqrt' ? `\\sqrt{${toTex(n.a)}}` : n.f === 'abs' ? `\\left|${toTex(n.a)}\\right|` : n.f === 'fact' ? `${toTex(n.a, 4)}!` : `\\${['sin', 'cos', 'tan', 'ln', 'log', 'exp', 'sinh', 'cosh', 'tanh'].includes(n.f) ? n.f : 'operatorname{' + n.f + '}'}\\left(${toTex(n.a)}\\right)`; break;
    case 'bin': {
      const p = prec(n);
      if (n.op === '/') { return `\\frac{${toTex(n.a)}}{${toTex(n.b)}}`; }
      if (n.op === '^') { s = `${toTex(n.a, 3.5)}^{${toTex(n.b)}}`; break; }
      const l = toTex(n.a, p, false); const r = toTex(n.b, p, true);
      if (n.op === '*') {
        const simple = n.implicit || (n.a.t === 'num' && n.b.t !== 'num');
        s = simple ? `${l}${r}` : `${l}\\cdot ${r}`;
      } else s = `${l} ${n.op} ${r}`;
      break;
    }
  }
  const p = n.t === 'bin' ? (n.op === '/' ? 5 : prec(n)) : n.t === 'neg' ? 2 : 4;
  const need = p < parentPrec || (right && p === parentPrec && n.t === 'bin' && n.op === '-');
  return need ? `\\left(${s}\\right)` : s;
}

/** Previsualización en LaTeX de lo que escribe el estudiante; null si no se entiende. */
export function previewTex(src) {
  try { return toTex(parse(src)); } catch { return null; }
}
