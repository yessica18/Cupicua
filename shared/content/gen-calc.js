// Generadores — 🌌 Cálculo, 🌀 Cálculo Vectorial, ⚙️ Ecuaciones Diferenciales
import { Q, choiceQ, gcd, fmt, par, sgn, frac, fracTex, fracStr, polyTex, polyStr, polyEval, polyDeriv, polyInteg, polyMul, round } from './gen-core.js';
import { parse, evaluate, numDeriv } from '../math/expr.js';

const fnOf = (src) => { const ast = parse(src); return (x, y, z) => evaluate(ast, { x, y, z, t: x }); };
const derivOk = (fSrc, dSrc) => () => { const f = fnOf(fSrc); const g = fnOf(dSrc); return [0.7, 1.3, 2.1, 0.45].every((x) => Math.abs(numDeriv(f, x) - g(x)) < 1e-4 * Math.max(1, Math.abs(g(x)))); };

const coefStr = (c, v) => (c === 1 ? v : c === -1 ? `-${v}` : `${c}${v}`);

export const calculus = {
  limit_poly(r, d) {
    const a = r.int(-3, 4); const p = [r.nz(-3, 4), r.int(-4, 4), r.int(-5, 6)];
    const ans = polyEval(p, a);
    return Q({ type: 'numeric', answer: ans, prompt: `Calcula $\\displaystyle\\lim_{x\\to ${a}} \\left(${polyTex(p)}\\right)$.`, hints: ['Un límite pregunta: ¿a qué valor se acerca la función cuando x se acerca a ese punto?', 'Para polinomios (continuos) basta sustituir.', `Sustituye x = ${a}.`], steps: [`$${polyTex(p).replace(/x/g, `(${a})`)} = ${ans}$`], why: 'El límite es la idea que hace posible el cálculo.' });
  },

  limit_factor(r) {
    const a = r.int(-4, 5); const b = r.int(-4, 5);
    // (x - a)(x + b) / (x - a)  → a + b  (limit)
    const num = polyMul([1, -a], [1, b]);
    return Q({ type: 'numeric', answer: a + b, prompt: `Calcula $\\displaystyle\\lim_{x\\to ${a}} \\frac{${polyTex(num)}}{x ${sgn(-a)}}$.`, hints: ['Si sustituyes directamente obtienes 0/0: indeterminación.', 'Factoriza el numerador.', `El numerador es (x ${sgn(-a)})(x ${sgn(b)}). Cancela.`], steps: [`$\\frac{(x ${sgn(-a)})(x ${sgn(b)})}{x ${sgn(-a)}} = x ${sgn(b)}$ (para $x\\ne ${a}$)`, `Límite: $${a} ${sgn(b)} = ${a + b}$`], why: 'Muchas indeterminaciones se resuelven simplificando.', selfcheck: () => Math.abs(polyEval(num, a + 1e-6) / 1e-6 - (a + b)) < 1e-2 });
  },

  limit_inf(r) {
    const a = r.nz(1, 6); const b = r.nz(1, 6); const f = frac(a, b);
    return Q({ type: 'frac', answer: f.n / f.d, answerText: fracStr(f), prompt: `Calcula $\\displaystyle\\lim_{x\\to\\infty} \\frac{${a}x^{2} + ${r.int(1, 9)}x + 1}{${b}x^{2} - ${r.int(1, 9)}}$. (Escribe \`a/b\`.)`, hints: ['Cuando x es enorme, manda el término de mayor grado.', 'Divide numerador y denominador entre x².', 'Quedan los coeficientes líderes.'], steps: [`Dominan $${a}x^2$ y $${b}x^2$.`, `Límite $= \\frac{${a}}{${b}} = ${fracTex(f)}$`], why: 'El comportamiento “en el infinito” describe tendencias a largo plazo.' });
  },

  continuity(r) {
    const c = r.int(1, 4);
    const bb = c * r.int(-2, 3); const kk = c + bb / c;
    return Q({ type: 'numeric', answer: kk, prompt: `¿Qué valor de $k$ hace continua en $x=${c}$ a $f(x)=\\begin{cases} x^2 ${sgn(bb)} & x<${c}\\\\ kx & x\\ge ${c}\\end{cases}$?`, hints: ['Continua: el límite por la izquierda = el valor en el punto.', `Iguala $${c}^2 ${sgn(bb)}$ con $k\\cdot ${c}$.`, `${c * c + bb} = ${c}k`], steps: [`Por la izquierda: $${c}^2 ${sgn(bb)} = ${c * c + bb}$`, `Por la derecha: $k\\cdot ${c}$`, `$k = \\frac{${c * c + bb}}{${c}} = ${fmt(kk)}$`], why: 'La continuidad garantiza que la gráfica no “salta”.' });
  },

  deriv_poly(r, d) {
    const n = d === 1 ? 2 : d === 2 ? 3 : 4;
    const c = Array.from({ length: n + 1 }, (_, i) => (i === 0 ? r.nz(-4, 5) : r.int(-6, 7)));
    const dc = polyDeriv(c); const ans = polyStr(dc) || '0';
    return Q({ type: 'expr', vars: ['x'], answer: ans, form: 'expanded', answerText: ans, prompt: `Deriva: $f(x) = ${polyTex(c)}$. Escribe $f'(x)$.`, hints: ['Regla de la potencia: $\\frac{d}{dx}x^n = n x^{n-1}$.', 'Deriva término a término; la derivada de una constante es 0.', c.map((v, i) => (c.length - 1 - i > 0 && v ? `d(${coefStr(v, 'x')}${c.length - 1 - i > 1 ? '^' + (c.length - 1 - i) : ''})` : '')).filter(Boolean).slice(0, 1).join('') + ' → baja el exponente.'], steps: [`$f'(x) = ${polyTex(dc)}$`], why: 'La derivada mide la rapidez de cambio instantánea.', selfcheck: derivOk(polyStr(c), ans), diagnose: () => ({ msg: 'Recuerda: el exponente baja multiplicando y a la potencia se le resta 1.' }) });
  },

  deriv_rules(r, d, opts) {
    const a = r.int(2, 5); const b = r.int(1, 4); const n = r.int(2, 4);
    const bank = [
      { f: `x^${n}*e^x`, df: `${n}x^${n - 1}e^x + x^${n}e^x`, tex: `x^{${n}}e^{x}`, rule: 'producto', hint: '$(uv)\' = u\'v + uv\'$ con $u=x^n$, $v=e^x$.' },
      { f: `x*sin(x)`, df: `sin(x) + x cos(x)`, tex: 'x\\sin x', rule: 'producto', hint: '$(uv)\' = u\'v + uv\'$.' },
      { f: `sin(${a}x)`, df: `${a}cos(${a}x)`, tex: `\\sin(${a}x)`, rule: 'cadena', hint: 'Regla de la cadena: derivada de afuera × derivada de adentro.' },
      { f: `(${a}x+${b})^${n}`, df: `${n * a}(${a}x+${b})^${n - 1}`, tex: `(${a}x+${b})^{${n}}`, rule: 'cadena', hint: 'Cadena: $n(\\text{interior})^{n-1}\\cdot(\\text{interior})\'$.' },
      { f: `e^(${a}x)`, df: `${a}e^(${a}x)`, tex: `e^{${a}x}`, rule: 'cadena', hint: 'La derivada de $e^{u}$ es $e^{u}u\'$.' },
      { f: `ln(${a}x+${b})`, df: `${a}/(${a}x+${b})`, tex: `\\ln(${a}x+${b})`, rule: 'cadena', hint: 'La derivada de $\\ln u$ es $u\'/u$.' },
      { f: `x^2/(x+${b})`, df: `(2x(x+${b}) - x^2)/(x+${b})^2`, tex: `\\frac{x^2}{x+${b}}`, rule: 'cociente', hint: '$\\left(\\frac uv\\right)\' = \\frac{u\'v-uv\'}{v^2}$.' },
      { f: `cos(x^2)`, df: `-2x sin(x^2)`, tex: '\\cos(x^2)', rule: 'cadena', hint: 'Afuera: −sen; adentro: 2x.' },
    ];
    const pool = opts?.kind ? bank.filter((b) => b.rule === opts.kind) : bank.slice(0, d === 1 ? 5 : bank.length);
    const it = r.pick(pool);
    return Q({ type: 'expr', vars: ['x'], answer: it.df, answerText: it.df, prompt: `Deriva: $f(x) = ${it.tex}$. (Regla de la **${it.rule}**.) Escribe $f'(x)$ (usa \`e^x\`, \`sin(x)\`, \`ln(x)\`).`, hints: [`Identifica la regla: ${it.rule}.`, it.hint, 'Simplifica solo si quieres; cualquier forma equivalente vale.'], steps: [it.hint, `$f'(x) = ${it.df.replace(/\*/g, '\\cdot ')}$`], why: 'Estas reglas permiten derivar casi cualquier función real.', selfcheck: derivOk(it.f, it.df) });
  },

  tangent_slope(r) {
    const c = [r.nz(1, 3), r.int(-4, 4), r.int(-3, 5)]; const x0 = r.int(-2, 3);
    const ans = polyEval(polyDeriv(c), x0);
    return Q({ type: 'numeric', answer: ans, prompt: `Halla la **pendiente de la recta tangente** a $f(x) = ${polyTex(c)}$ en $x=${x0}$.`, hints: ['La pendiente de la tangente es la derivada en ese punto.', 'Calcula $f\'(x)$ y evalúa.', `$f'(x) = ${polyTex(polyDeriv(c))}$`], steps: [`$f'(x) = ${polyTex(polyDeriv(c))}$`, `$f'(${x0}) = ${ans}$`], why: 'La tangente es la mejor aproximación lineal de la curva.' });
  },

  optimize(r) {
    const P = 2 * r.int(10, 40);
    return Q({ type: 'numeric', answer: (P / 4) ** 2, prompt: `Un granjero tiene $${P}$ m de cerca para un corral **rectangular**. ¿Cuál es el **área máxima** posible? (m²)`, hints: ['Si un lado es x, el otro es $P/2 - x$.', `Área: $A(x) = x(${P / 2} - x)$. Maximízala derivando.`, '$A\'(x)=0$ cuando $x = P/4$ (¡un cuadrado!).'], steps: [`$A(x) = ${P / 2}x - x^2$, $A'(x) = ${P / 2} - 2x = 0 \\Rightarrow x = ${P / 4}$`, `$A_{\\max} = ${P / 4}^2 = ${(P / 4) ** 2}$`], why: 'Optimizar es la gran aplicación de la derivada en ingeniería.' });
  },

  integral_poly(r, d) {
    const n = d === 1 ? 1 : d === 2 ? 2 : 3;
    const cc = Array.from({ length: n + 1 }, (_, i) => (n - i + 1) * r.nz(-3, 4));
    const F = polyInteg(cc); const ans = polyStr(F.slice(0, -1).concat([0]));
    return Q({ type: 'expr', vars: ['x'], upToConstant: true, answer: ans, form: 'expanded', answerText: ans + ' + C', prompt: `Calcula $\\displaystyle\\int \\left(${polyTex(cc)}\\right)dx$. (Escribe la antiderivada; el $+C$ es opcional.)`, hints: ['La integral deshace la derivada.', '$\\int x^n dx = \\frac{x^{n+1}}{n+1} + C$.', 'Integra término a término.'], steps: [`$${polyTex(F.slice(0, -1))} + C$`], why: 'La integral acumula: de la velocidad a la distancia.', selfcheck: () => { const f = fnOf(polyStr(cc)); const g = fnOf(ans || '0'); return [0.6, 1.4, 2.2].every((x) => Math.abs(numDeriv(g, x) - f(x)) < 1e-4 * Math.max(1, Math.abs(f(x)))); } });
  },

  definite_integral(r) {
    const k = r.int(1, 4); const n = r.int(1, 3); const a = 0; const b = r.int(1, 4);
    const val = (k * b ** (n + 1)) / (n + 1);
    return Q({ type: 'numeric', answer: val, tol: 0.01, prompt: `Calcula $\\displaystyle\\int_{0}^{${b}} ${k === 1 ? '' : k}x^{${n}}\\,dx$. (decimal, 2 cifras)`, hints: ['Teorema fundamental: $\\int_a^b f = F(b)-F(a)$.', `Una antiderivada es $F(x) = \\frac{${k}x^{${n + 1}}}{${n + 1}}$.`, `Evalúa en ${b} y en 0.`], steps: [`$F(x) = \\frac{${k}x^{${n + 1}}}{${n + 1}}$`, `$F(${b}) - F(0) = ${fmt(val, 3)}$`], why: 'La integral definida da áreas, distancias y totales acumulados.' });
  },

  integral_tricks(r) {
    const a = r.int(2, 5); const b = r.int(1, 4); const kind = r.int(1, 3);
    if (kind === 1) return Q({ type: 'expr', vars: ['x'], upToConstant: true, answer: `sin(x^2)`, answerText: 'sin(x²) + C', prompt: 'Calcula $\\displaystyle\\int 2x\\cos(x^2)\\,dx$ por **sustitución**. (Escribe la antiderivada con `sin(x^2)`; $+C$ opcional.)', hints: ['Elige $u$ = lo de adentro del coseno.', '$u = x^2 \\Rightarrow du = 2x\\,dx$.', 'Queda $\\int\\cos u\\,du$.'], steps: ['$u=x^2,\\ du=2x\\,dx$', '$\\int\\cos u\\,du = \\sin u + C = \\sin(x^2) + C$'], why: 'La sustitución deshace la regla de la cadena.' });
    if (kind === 2) return Q({ type: 'expr', vars: ['x'], upToConstant: true, answer: `x e^x - e^x`, answerText: 'x·eˣ − eˣ + C', prompt: 'Calcula $\\displaystyle\\int x e^{x}\\,dx$ **por partes**. (Escribe la antiderivada; $+C$ opcional.)', hints: ['$\\int u\\,dv = uv - \\int v\\,du$.', 'Elige $u = x$ (se simplifica al derivar) y $dv = e^x dx$.', '$du = dx$, $v = e^x$.'], steps: ['$u=x,\\ dv=e^x dx \\Rightarrow du=dx,\\ v=e^x$', '$\\int xe^x dx = xe^x - \\int e^x dx = xe^x - e^x + C$'], why: 'Integración por partes deshace la regla del producto.' });
    return Q({ type: 'expr', vars: ['x'], upToConstant: true, answer: `sin(${a}x)/${a}`, answerText: `sin(${a}x)/${a} + C`, prompt: `Calcula $\\displaystyle\\int \\cos(${a}x)\\,dx$. (Escribe la antiderivada; $+C$ opcional.)`, hints: ['Piensa en la regla de la cadena al revés.', `Si derivas $\\sin(${a}x)$ obtienes $${a}\\cos(${a}x)$.`, `Necesitas dividir entre ${a}.`], steps: [`$u=${a}x \\Rightarrow dx = du/${a}$`, `$\\frac{1}{${a}}\\sin(${a}x) + C$`], why: 'Ajustar constantes es lo más común en las integrales reales.' });
  },

  series_geom(r) {
    const a = r.int(1, 9); const rr = r.pick([[1, 2], [1, 3], [2, 3], [1, 4], [3, 4], [1, 5]]);
    const f = frac(a * rr[1], rr[1] - rr[0]);
    return Q({ type: 'frac', answer: f.n / f.d, answerText: fracStr(f), prompt: `Calcula la suma infinita $${a} + ${a}\\cdot\\frac{${rr[0]}}{${rr[1]}} + ${a}\\cdot\\left(\\frac{${rr[0]}}{${rr[1]}}\\right)^2 + \\cdots$ (Escribe \`a/b\` o entero.)`, hints: ['Es una serie geométrica: cada término es el anterior por una razón fija.', 'Si |r|<1: $S = \\frac{a}{1-r}$.', `a = ${a}, r = ${rr[0]}/${rr[1]}.`], steps: [`$S = \\frac{${a}}{1-\\frac{${rr[0]}}{${rr[1]}}} = \\frac{${a}}{\\frac{${rr[1] - rr[0]}}{${rr[1]}}} = ${fracTex(f)}$`], why: 'Sumar infinitos términos puede dar un valor finito: la paradoja de Zenón resuelta.' });
  },

  /* ───────────── CÁLCULO VECTORIAL ───────────── */
  vec3_ops(r, d) {
    const a = [r.int(-3, 4), r.int(-3, 4), r.int(-3, 4)]; const b = [r.int(-3, 4), r.int(-3, 4), r.int(-3, 4)];
    const cr = [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]];
    return Q({ type: 'tuple', answer: cr, prompt: `Calcula el **producto cruz** $\\vec a\\times\\vec b$ con $\\vec a=(${a})$, $\\vec b=(${b})$. Escribe \`x, y, z\`.`, hints: ['El producto cruz da un vector perpendicular a ambos.', '$\\vec a\\times\\vec b = (a_2b_3 - a_3b_2,\\ a_3b_1 - a_1b_3,\\ a_1b_2 - a_2b_1)$', 'Verifica que el resultado sea perpendicular (producto punto 0).'], steps: [`$(${a[1]}\\cdot ${par(b[2])} - ${par(a[2])}\\cdot ${par(b[1])},\\ \\dots) = (${cr})$`], why: 'El producto cruz da torques, normales a superficies y áreas de paralelogramos.', selfcheck: () => cr.reduce((s, v, i) => s + v * a[i], 0) === 0 && cr.reduce((s, v, i) => s + v * b[i], 0) === 0 });
  },

  partial(r, d) {
    const a = r.int(2, 5); const b = r.int(2, 5); const m = r.int(2, 3);
    const bank = [
      { f: `x^${m}*y + ${a}*y^2`, dx: `${m}x^${m - 1}y`, dy: `x^${m} + ${2 * a}y`, tex: `x^{${m}}y + ${a}y^{2}` },
      { f: `${a}*x*y + sin(x)`, dx: `${a}y + cos(x)`, dy: `${a}x`, tex: `${a}xy + \\sin x` },
      { f: `e^(x*y)`, dx: `y e^(x y)`, dy: `x e^(x y)`, tex: 'e^{xy}' },
      { f: `x^2 + ${b}*x*y + y^3`, dx: `2x + ${b}y`, dy: `${b}x + 3y^2`, tex: `x^{2} + ${b}xy + y^{3}` },
    ];
    const it = r.pick(bank.slice(0, d === 1 ? 2 : 4)); const wrt = r.chance() ? 'x' : 'y';
    const ans = wrt === 'x' ? it.dx : it.dy;
    const sf = (x, y) => evaluate(parse(it.f), { x, y });
    const sa = (x, y) => evaluate(parse(ans), { x, y });
    return Q({ type: 'expr', vars: ['x', 'y'], answer: ans, answerText: ans, prompt: `Calcula $\\dfrac{\\partial f}{\\partial ${wrt}}$ para $f(x,y) = ${it.tex}$.`, hints: [`Deriva respecto a ${wrt} tratando la otra variable como una constante.`, `Piensa que ${wrt === 'x' ? 'y' : 'x'} es solo un número.`, 'Aplica las reglas usuales.'], steps: [`$\\frac{\\partial f}{\\partial ${wrt}} = ${ans.replace(/\*/g, '')}$`], why: 'Las derivadas parciales miden cómo cambia algo al mover una sola variable.', selfcheck: () => { const h = 1e-5; const x = 0.8; const y = 1.3; const num = wrt === 'x' ? (sf(x + h, y) - sf(x - h, y)) / (2 * h) : (sf(x, y + h) - sf(x, y - h)) / (2 * h); return Math.abs(num - sa(x, y)) < 1e-4; } });
  },

  gradient(r) {
    const a = r.int(1, 4); const b = r.int(1, 4); const x0 = r.int(-2, 3); const y0 = r.int(-2, 3);
    const gx = 2 * a * x0 + b * y0; const gy = b * x0 + 2 * y0;
    return Q({ type: 'tuple', answer: [gx, gy], prompt: `Si $f(x,y) = ${a}x^{2} + ${b}xy + y^{2}$, calcula el **gradiente** $\\nabla f(${x0},${y0})$. Escribe \`x, y\`.`, hints: ['El gradiente reúne las derivadas parciales: $\\nabla f = (f_x, f_y)$.', `$f_x = ${2 * a}x + ${b}y$ y $f_y = ${b}x + 2y$.`, `Evalúa en (${x0}, ${y0}).`], steps: [`$\\nabla f = (${2 * a}x + ${b}y,\\ ${b}x + 2y)$`, `$\\nabla f(${x0},${y0}) = (${gx}, ${gy})$`], why: 'El gradiente apunta hacia donde la función crece más rápido.' });
  },

  divergence(r, d) {
    const a = r.int(1, 4); const b = r.int(1, 4); const c = r.int(1, 3);
    const ans = `${a}*y + ${b}*x*z + ${c}`; // dP/dx = a y ; dQ/dy = b x z ; dR/dz = c
    // F = (a x y, b x y z, c z)
    return Q({ type: 'expr', vars: ['x', 'y', 'z'], answer: `${a}y + ${b}xz + ${c}`, answerText: `${a}y + ${b}xz + ${c}`, prompt: `Calcula la **divergencia** $\\nabla\\cdot\\vec F$ de $\\vec F = (${a}xy,\\ ${b}xyz,\\ ${c}z)$.`, hints: ['$\\nabla\\cdot\\vec F = \\frac{\\partial P}{\\partial x}+\\frac{\\partial Q}{\\partial y}+\\frac{\\partial R}{\\partial z}$', 'Cada componente se deriva respecto a “su” variable.', `P=${a}xy, Q=${b}xyz, R=${c}z`], steps: [`$\\partial_x(${a}xy) = ${a}y$`, `$\\partial_y(${b}xyz) = ${b}xz$`, `$\\partial_z(${c}z) = ${c}$`, `Suma: $${a}y + ${b}xz + ${c}$`], why: 'La divergencia dice si un campo “nace” o “muere” en un punto (fuentes y sumideros).' });
  },

  curl2d(r) {
    const a = r.int(1, 4); const b = r.int(1, 4);
    // F = (P,Q) = (-a y, b x)  → rot = b + a
    return Q({ type: 'numeric', answer: a + b, prompt: `Para el campo plano $\\vec F = (-${a}y,\\ ${b}x)$, calcula el **rotacional** (componente z): $\\dfrac{\\partial Q}{\\partial x}-\\dfrac{\\partial P}{\\partial y}$.`, hints: ['P es la primera componente, Q la segunda.', '$\\partial_x Q = ' + b + '$', `$\\partial_y P = -${a}$`], steps: [`$\\partial_x(${b}x) - \\partial_y(-${a}y) = ${b} - (-${a}) = ${a + b}$`], why: 'El rotacional mide cuánto “gira” un campo (remolinos).' });
  },

  double_integral(r) {
    const a = r.int(1, 4); const b = r.int(1, 4); const c = r.int(1, 3); const e = r.int(1, 3);
    const val = (c * a * a * b) / 2 + (e * a * b * b) / 2;
    return Q({ type: 'numeric', answer: val, tol: 0.01, prompt: `Calcula $\\displaystyle\\int_0^{${a}}\\!\\int_0^{${b}} (${c}x + ${e}y)\\,dy\\,dx$. (decimal si hace falta)`, hints: ['Integra primero respecto a y (x se trata como constante).', `$\\int_0^{${b}}(${c}x+${e}y)dy = ${c * b}x + \\frac{${e * b * b}}{2}$`, 'Luego integra respecto a x.'], steps: [`Interior: $${c * b}x + ${(e * b * b) / 2}$`, `Exterior: $\\frac{${c * b}\\cdot ${a * a}}{2} + ${(e * b * b) / 2}\\cdot ${a} = ${fmt(val, 3)}$`], why: 'Las integrales dobles dan volúmenes, masas y probabilidades.', selfcheck: () => { let s = 0; const n = 200; for (let i = 0; i < n; i++) for (let j = 0; j < n; j++) { const x = ((i + 0.5) * a) / n; const y = ((j + 0.5) * b) / n; s += (c * x + e * y) * (a / n) * (b / n); } return Math.abs(s - val) < 0.01; } });
  },

  line_work(r) {
    const F = [r.int(-3, 5), r.int(-3, 5)]; const A = [r.int(-2, 2), r.int(-2, 2)]; const B = [A[0] + r.int(1, 5), A[1] + r.int(-3, 4)];
    const ans = F[0] * (B[0] - A[0]) + F[1] * (B[1] - A[1]);
    return Q({ type: 'numeric', answer: ans, prompt: `Una fuerza constante $\\vec F=(${F})$ N mueve una partícula en línea recta de $A(${A})$ a $B(${B})$ (metros). ¿Cuánto **trabajo** realiza? $W = \\int_C \\vec F\\cdot d\\vec r$ (en J)`, hints: ['Con fuerza constante, la integral de línea es $\\vec F\\cdot\\Delta\\vec r$.', `Desplazamiento: (${B[0] - A[0]}, ${B[1] - A[1]}).`, 'Producto punto.'], steps: [`$\\Delta\\vec r = (${B[0] - A[0]}, ${B[1] - A[1]})$`, `$W = ${F[0]}\\cdot ${B[0] - A[0]} + ${par(F[1])}\\cdot ${par(B[1] - A[1])} = ${ans}$ J`], why: 'La integral de línea generaliza “fuerza × distancia”.' });
  },

  flux(r) {
    const c = r.int(2, 9); const A = r.int(2, 8);
    return Q({ type: 'numeric', answer: c * A, prompt: `El campo constante $\\vec F=(0,0,${c})$ atraviesa perpendicularmente una superficie plana de área $${A}$ m². Calcula el **flujo** $\\iint \\vec F\\cdot\\hat n\\,dS$.`, hints: ['El flujo mide cuánto campo atraviesa la superficie.', 'Si F es constante y perpendicular: $\\Phi = |F|\\cdot A$.', `${c} × ${A}`], steps: [`$\\Phi = ${c}\\cdot ${A} = ${c * A}$`], why: 'El flujo es clave en la ley de Gauss y en fluidos.' });
  },

  dir_deriv(r) {
    const u = r.pick([[3 / 5, 4 / 5], [4 / 5, 3 / 5], [-3 / 5, 4 / 5]]); const a = r.int(1, 4); const x0 = r.int(1, 3); const y0 = r.int(1, 3);
    const g = [2 * a * x0, 2 * y0]; const ans = round(g[0] * u[0] + g[1] * u[1], 9);
    return Q({ type: 'numeric', answer: ans, tol: 0.01, prompt: `Para $f(x,y)=${a}x^2+y^2$ en $(${x0},${y0})$, calcula la **derivada direccional** hacia $\\vec u=(${fmt(u[0], 1)},\\ ${fmt(u[1], 1)})$ (ya es unitario).`, hints: ['$D_{\\vec u}f = \\nabla f\\cdot\\vec u$.', `$\\nabla f = (${2 * a}x,\\ 2y)$`, `En (${x0},${y0}): (${g[0]}, ${g[1]}).`], steps: [`$\\nabla f(${x0},${y0}) = (${g[0]}, ${g[1]})$`, `$D_u f = ${g[0]}\\cdot ${fmt(u[0], 1)} + ${g[1]}\\cdot ${fmt(u[1], 1)} = ${fmt(ans, 2)}$`], why: 'Dice qué tan rápido cambia algo en CUALQUIER dirección.' });
  },

  /* ───────────── ECUACIONES DIFERENCIALES ───────────── */
  ode_sep(r) {
    const k = r.pick([0.5, 1, -1, 2, -0.5]); const y0 = r.int(2, 10); const T = r.pick([1, 2]);
    const ans = y0 * Math.exp(k * T);
    return Q({ type: 'numeric', answer: ans, relTol: 0.01, prompt: `Resuelve $\\dfrac{dy}{dt} = ${fmt(k)}\\,y$ con $y(0) = ${y0}$ y calcula $y(${T})$. (2 decimales; 1% de error)`, hints: ['La rapidez de cambio es proporcional a y: separa variables.', '$\\frac{dy}{y} = k\\,dt \\Rightarrow y = Ce^{kt}$.', `Con y(0)=${y0}: C = ${y0}.`], steps: [`$y(t) = ${y0}e^{${fmt(k)}t}$`, `$y(${T}) = ${y0}e^{${fmt(k * T)}} = ${fmt(ans, 2)}$`], why: 'Describe crecimiento de poblaciones, interés compuesto y desintegración radiactiva.' });
  },

  ode_verify(r) {
    const k = r.int(2, 4);
    return Q({ ...choiceQ(r, { correct: `$y = Ce^{${k}x}$`, wrong: [`$y = Ce^{-${k}x}$`, `$y = ${k}x + C$`, `$y = C\\sin(${k}x)$`], prompt: `¿Cuál es la solución general de $y' = ${k}y$?` }), hints: ['Una solución debe cumplir la ecuación al derivarla.', 'Deriva cada opción y compara con k·y.', `La derivada de $e^{${k}x}$ es $${k}e^{${k}x}$.`], steps: [`$(Ce^{${k}x})' = ${k}\\,Ce^{${k}x} = ${k}y$ ✓`], why: 'Verificar una solución es sustituirla: no necesitas adivinar cómo se halló.' });
  },

  ode_direct(r) {
    const c = [2 * r.nz(1, 3), r.int(-4, 5)]; const y0 = r.int(-3, 6);
    const F = polyInteg(c); F[F.length - 1] = y0;
    const ans = polyStr(F);
    return Q({ type: 'expr', vars: ['x'], answer: ans, form: 'expanded', answerText: ans, prompt: `Resuelve el problema de valor inicial $y' = ${polyTex(c)}$, $y(0) = ${y0}$. Escribe $y(x)$.`, hints: ['Integra ambos lados.', 'Aparece una constante C.', 'Usa y(0) para encontrarla.'], steps: [`$y = \\int(${polyTex(c)})dx = ${polyTex(F.slice(0, -1))} + C$`, `$y(0)=C=${y0}$`, `$y = ${polyTex(F)}$`], why: 'La condición inicial selecciona UNA curva entre infinitas soluciones.' });
  },

  ode2_char(r, d) {
    const r1 = r.int(-4, 3); let r2 = r.int(-4, 3); while (r2 === r1) r2 = r.int(-4, 3);
    const b = -(r1 + r2); const c = r1 * r2;
    return Q({ type: 'set', answer: [r1, r2], prompt: `Para $y'' ${sgn(b)}y' ${sgn(c)}y = 0$, halla las raíces $r$ de la **ecuación característica** $r^2 ${sgn(b)}r ${sgn(c)} = 0$. Escribe separadas por coma.`, hints: ['Prueba soluciones del tipo $y = e^{rx}$.', 'Sustituir da la ecuación característica.', 'Factoriza o usa la fórmula general.'], steps: [`$(r ${sgn(-r1)})(r ${sgn(-r2)}) = 0$`, `$r = ${r1},\\ ${r2}$; solución: $y = C_1e^{${r1}x} + C_2e^{${r2}x}$`], why: 'Así se resuelven vibraciones, circuitos y suspensiones.', selfcheck: () => r1 * r1 + b * r1 + c === 0 && r2 * r2 + b * r2 + c === 0 });
  },

  ode_model(r, d, opts) {
    const k = r.pick([0.05, 0.1, 0.2, 0.3]); const T = round(Math.LN2 / k, 3);
    if (opts?.kind ? opts.kind === 'dup' : r.chance()) return Q({ type: 'numeric', answer: T, tol: 0.05, prompt: `Una población crece según $P(t) = P_0e^{${k}t}$ (t en años). ¿Cuántos años tarda en **duplicarse**? (2 decimales)`, hints: ['Duplicarse: $P(t) = 2P_0$.', `$e^{${k}t} = 2$`, 'Toma logaritmo natural.'], steps: [`$${k}t = \\ln 2 \\Rightarrow t = \\frac{\\ln 2}{${k}} = ${fmt(T, 2)}$`], why: 'El tiempo de duplicación es independiente del tamaño inicial.' });
    const Tenv = r.pick([20, 25]); const T0 = r.pick([90, 95, 100]); const kk = 0.1; const t = r.pick([5, 10, 15]);
    const ans = Tenv + (T0 - Tenv) * Math.exp(-kk * t);
    return Q({ type: 'numeric', answer: ans, tol: 0.2, prompt: `Ley de enfriamiento de Newton: $T(t) = ${Tenv} + (${T0}-${Tenv})e^{-0{,}1t}$ (°C, t en min). ¿Qué temperatura tiene el café a los $${t}$ min? (1 decimal)`, hints: ['Sustituye t en la fórmula.', 'Calcula primero el exponente $-0{,}1\\cdot t$.', 'Luego la exponencial.'], steps: [`$T(${t}) = ${Tenv} + ${T0 - Tenv}e^{-${0.1 * t}} = ${fmt(ans, 1)}$ °C`], why: 'Muchos fenómenos tienden a un equilibrio de forma exponencial.' });
  },

  oscillation(r) {
    const m = r.pick([0.5, 1, 2, 4]); const k = r.pick([16, 25, 50, 100, 200]);
    const T = 2 * Math.PI * Math.sqrt(m / k);
    return Q({ type: 'numeric', answer: T, relTol: 0.02, prompt: `Una masa de $${m}$ kg cuelga de un resorte con $k=${k}$ N/m ($m\\ddot x + kx = 0$). ¿Cuál es el **periodo** de oscilación? (s, 2 decimales)`, hints: ['La frecuencia natural es $\\omega = \\sqrt{k/m}$.', 'Periodo $T = 2\\pi/\\omega$.', `ω = √(${k}/${m}).`], steps: [`$\\omega = \\sqrt{${k}/${m}} = ${fmt(Math.sqrt(k / m), 3)}$ rad/s`, `$T = \\frac{2\\pi}{\\omega} = ${fmt(T, 3)}$ s`], why: 'Resortes, péndulos y circuitos LC siguen la misma ecuación.' });
  },

  terminal(r) {
    const m = r.pick([60, 70, 80]); const b = r.pick([10, 12, 15]);
    return Q({ type: 'numeric', answer: (m * 9.8) / b, relTol: 0.01, prompt: `Un paracaidista de $${m}$ kg cae con resistencia lineal $-bv$, $b=${b}$ kg/s: $m\\,\\dfrac{dv}{dt} = mg - bv$. ¿Cuál es su **velocidad terminal**? (m/s, g = 9,8)`, hints: ['La velocidad terminal es cuando $dv/dt = 0$.', '$0 = mg - bv$', '$v_t = mg/b$.'], steps: [`$v_t = \\frac{${m}\\cdot 9{,}8}{${b}} = ${fmt((m * 9.8) / b, 2)}$ m/s`], why: 'Muestra cómo una EDO predice un equilibrio físico.' });
  },
};
