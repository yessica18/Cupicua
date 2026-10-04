// Utilidades para los generadores de ejercicios: azar con semilla, formato, álgebra de coeficientes.

export class RNG {
  constructor(seed = 1) { this.a = (seed >>> 0) || 1; }
  next() {
    this.a = (this.a + 0x6d2b79f5) >>> 0;
    let t = this.a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  }
  int(a, b) { return a + Math.floor(this.next() * (b - a + 1)); }
  /** entero distinto de cero (y, opcionalmente, distinto de ±1) */
  nz(a, b, notOne = false) {
    for (let i = 0; i < 50; i++) { const v = this.int(a, b); if (v !== 0 && !(notOne && Math.abs(v) === 1)) return v; }
    return a === 0 ? 1 : a;
  }
  pick(arr) { return arr[this.int(0, arr.length - 1)]; }
  chance(p = 0.5) { return this.next() < p; }
  shuffle(arr) { const a = [...arr]; for (let i = a.length - 1; i > 0; i--) { const j = this.int(0, i); [a[i], a[j]] = [a[j], a[i]]; } return a; }
  sample(arr, n) { return this.shuffle(arr).slice(0, n); }
}

export const gcd = (a, b) => (b ? gcd(b, a % b) : Math.abs(a));
export const lcm = (a, b) => Math.abs(a * b) / gcd(a, b);
export const isPrime = (n) => { if (n < 2) return false; for (let i = 2; i * i <= n; i++) if (n % i === 0) return false; return true; };
export const primeFactors = (n) => { const f = []; for (let p = 2; p * p <= n; p++) while (n % p === 0) { f.push(p); n /= p; } if (n > 1) f.push(n); return f; };
export const fact = (n) => (n <= 1 ? 1 : n * fact(n - 1));
export const nCr = (n, k) => { let r = 1; for (let i = 1; i <= k; i++) r = (r * (n - k + i)) / i; return Math.round(r); };
export const nPr = (n, k) => { let r = 1; for (let i = 0; i < k; i++) r *= n - i; return r; };
export const sum = (a) => a.reduce((s, v) => s + v, 0);
export const mean = (a) => sum(a) / a.length;
export const rad = (d) => (d * Math.PI) / 180;
export const deg = (r) => (r * 180) / Math.PI;
export const round = (v, d = 2) => Math.round(v * 10 ** d) / 10 ** d;

/** Número a texto: sin ceros inútiles y con signo menos tipográfico. */
export const fmt = (v, d = 4) => String(+Number(v).toFixed(d)).replace('-', '−');
/** Número negativo entre paréntesis para usar dentro de operaciones. */
export const par = (v) => (v < 0 ? `(${fmt(v)})` : fmt(v));
/** Texto (para LaTeX) del número con signo explícito: "+ 5", "- 3". */
export const sgn = (v) => (v < 0 ? `- ${fmt(-v)}` : `+ ${fmt(v)}`);

/** Fracción reducida como objeto y LaTeX. */
export function frac(n, d) {
  if (d < 0) { n = -n; d = -d; }
  const g = gcd(n, d) || 1;
  return { n: n / g, d: d / g };
}
export const fracTex = ({ n, d }) => (d === 1 ? String(n) : `${n < 0 ? '-' : ''}\\frac{${Math.abs(n)}}{${d}}`);
export const fracStr = ({ n, d }) => (d === 1 ? String(n) : `${n}/${d}`);

/** Término monomio "3x^2" con signo, para armar polinomios. */
function term(c, p, v, first) {
  if (c === 0) return '';
  const ab = Math.abs(c);
  const coef = ab === 1 && p !== 0 ? '' : String(ab);
  const body = p === 0 ? '' : p === 1 ? v : `${v}^{${p}}`;
  const sign = c < 0 ? (first ? '-' : ' - ') : first ? '' : ' + ';
  return `${sign}${coef}${body}`;
}
/** coefs en orden DESCENDENTE: [1,-3,2] → x^2 - 3x + 2 (LaTeX) */
export function polyTex(coefs, v = 'x') {
  const n = coefs.length - 1;
  let out = '';
  coefs.forEach((c, i) => { out += term(c, n - i, v, out === ''); });
  return out || '0';
}
/** versión texto plano para respuestas (x^2 - 3x + 2) */
export function polyStr(coefs, v = 'x') {
  return polyTex(coefs, v).replace(/\^\{(\d+)\}/g, '^$1');
}
export const polyEval = (coefs, x) => coefs.reduce((s, c) => s * x + c, 0);
export const polyMul = (a, b) => { const r = Array(a.length + b.length - 1).fill(0); a.forEach((x, i) => b.forEach((y, j) => { r[i + j] += x * y; })); return r; };
export const polyAdd = (a, b) => { const n = Math.max(a.length, b.length); const A = [...Array(n - a.length).fill(0), ...a]; const B = [...Array(n - b.length).fill(0), ...b]; return A.map((v, i) => v + B[i]); };
export const polyDeriv = (c) => c.slice(0, -1).map((v, i) => v * (c.length - 1 - i));
export const polyInteg = (c) => [...c.map((v, i) => v / (c.length - i)), 0];

/** (x + a) como texto, útil para binomios. */
export const binTex = (a, v = 'x') => (a === 0 ? v : `${v} ${sgn(a)}`);

/** Matriz LaTeX */
export const matTex = (m, br = 'bmatrix') => `\\begin{${br}}${m.map((r) => r.map((c) => fmt(c)).join(' & ')).join(' \\\\ ')}\\end{${br}}`;
export const vecTex = (v) => `\\begin{pmatrix}${v.map((c) => fmt(c)).join(' \\\\ ')}\\end{pmatrix}`;

/** Construye las opciones de una pregunta de elección con un único acierto. */
export function choiceQ(r, { correct, wrong, prompt, ...rest }) {
  const pool = [...new Set(wrong.map(String))].filter((w) => w !== String(correct));
  const picked = r.sample(pool, Math.min(3, pool.length));
  const choices = r.shuffle([String(correct), ...picked]);
  return { type: 'choice', prompt, choices, answer: choices.indexOf(String(correct)), ...rest };
}

/** Distractores numéricos plausibles alrededor de la respuesta. */
export function numDistractors(r, ans, ...extra) {
  const set = new Set(extra.filter((v) => Number.isFinite(v) && v !== ans).map((v) => fmt(v)));
  let guard = 0;
  while (set.size < 5 && guard++ < 40) {
    const d = r.pick([1, -1, 2, -2, 10, -10, 0.5]);
    const v = Number.isInteger(ans) ? ans + d * r.int(1, 3) : ans + d * 0.1 * r.int(1, 4);
    if (Math.abs(v - ans) > 1e-9) set.add(fmt(v));
  }
  return [...set];
}

/** Nombre de dificultades */
export const DIFFS = { 1: 'fácil', 2: 'media', 3: 'difícil' };

/** Añade metadatos comunes y comprobaciones por defecto. */
export function Q(base) {
  return {
    difficulty: 1,
    hints: [],
    steps: [],
    ...base,
  };
}
