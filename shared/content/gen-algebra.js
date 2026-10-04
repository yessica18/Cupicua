// Generadores — 🏰 Castillo del Álgebra
import { Q, choiceQ, gcd, fmt, par, sgn, polyTex, polyStr, polyEval, polyMul, polyAdd, binTex, frac, fracTex, fracStr } from './gen-core.js';

const bi = (a, v = 'x') => `(${v}${a >= 0 ? '+' : '-'}${Math.abs(a)})`;

export const algebra = {
  var_eval(r, d) {
    const x = r.int(-4, 7); const a = r.nz(2, 9); const b = r.int(-9, 12);
    if (d === 1) {
      const ans = a * x + b;
      return Q({ type: 'numeric', answer: ans, prompt: `Si $x = ${x}$, ¿cuánto vale $${a}x ${sgn(b)}$?`, hints: ['Una variable es una “caja” que guarda un número.', `Reemplaza x por ${par(x)}.`, `${a}·${par(x)} ${sgn(b)}`], steps: [`$${a}\\cdot ${par(x)} ${sgn(b)} = ${a * x} ${sgn(b)} = ${ans}$`], why: 'Sustituir valores es la forma de “probar” una expresión.' });
    }
    if (d === 2) {
      const ans = a * x * x + b;
      return Q({ type: 'numeric', answer: ans, prompt: `Si $x = ${x}$, ¿cuánto vale $${a}x^{2} ${sgn(b)}$?`, hints: ['El exponente se aplica solo a x, no al coeficiente.', `Primero ${par(x)}², luego multiplica por ${a}.`, 'Recuerda: (−3)² = 9, pero −3² = −9.'], steps: [`$x^2 = ${par(x)}^2 = ${x * x}$`, `$${a}\\cdot ${x * x} ${sgn(b)} = ${ans}$`], why: 'El orden de las operaciones decide el resultado.', diagnose: (v) => (x < 0 && v === -a * x * x + b ? { msg: `Calculaste $-${Math.abs(x)}^2$ en lugar de $(${x})^2$: el cuadrado de un negativo es positivo.` } : null) });
    }
    const y = r.int(-3, 5); const k = Math.abs(b) || 2; const ans = a * x - k * y;
    return Q({ type: 'numeric', answer: ans, prompt: `Si $x = ${x}$ y $y = ${y}$, calcula $${a}x - ${k}y$.`, hints: ['Sustituye cada letra por su valor.', 'Usa paréntesis al sustituir negativos.', 'Primero multiplica, luego resta.'], steps: [`$${a}\\cdot ${par(x)} - ${k}\\cdot ${par(y)} = ${a * x} - ${par(k * y)} = ${ans}$`], why: 'Con varias variables se modelan situaciones de más de una cantidad.' });
  },

  const_vs_var(r) {
    const a = r.int(2, 9); const b = r.int(2, 9);
    const mode = r.int(1, 2);
    if (mode === 1) return Q({ ...choiceQ(r, { correct: `$${b}$`, wrong: [`$${a}$`, '$x$', `$${a}x$`], prompt: `En la expresión $${a}x + ${b}$, ¿cuál es el **término constante**?` }), hints: ['Una constante no cambia cuando cambia x.', 'La variable viene acompañada de la letra.', 'El término sin letra es la constante.'], steps: [`${a}x cambia con x (término variable); ${b} siempre vale ${b}: constante.`], why: 'Distinguir lo que cambia de lo que no cambia es la base del modelado.' });
    return Q({ ...choiceQ(r, { correct: `$${a}$`, wrong: [`$${b}$`, '$x$', `$${a}x$`], prompt: `En $${a}x + ${b}$, ¿cuál es el **coeficiente** de $x$?` }), hints: ['El coeficiente es el número que multiplica a la variable.', `Mira lo que está pegado a x.`, 'No es el término suelto.'], steps: [`${a}x = ${a}·x: el coeficiente es ${a}.`], why: 'Los coeficientes indican “cuánto” de cada variable.' });
  },

  like_terms(r, d) {
    const a = r.nz(-6, 8); const c = r.nz(-6, 8); const b = r.int(-9, 9); const e = r.int(-9, 9);
    const tx = a + c; const tc = b + e;
    const ans = polyStr([tx, tc]);
    const expr = `${polyTex([a, 0]).replace(/^$/, '')}`; // no usado
    const parts = [`${a === 1 ? '' : a === -1 ? '-' : a}x`, b === 0 ? '' : sgn(b), `${c < 0 ? '- ' : '+ '}${Math.abs(c) === 1 ? '' : Math.abs(c)}x`, e === 0 ? '' : sgn(e)].filter(Boolean);
    const shown = parts.join(' ');
    return Q({
      type: 'expr', vars: ['x'], answer: ans || '0', answerText: ans, form: 'expanded',
      prompt: `Simplifica reduciendo términos semejantes: $${shown}$`,
      hints: ['Términos semejantes tienen la misma parte literal (x con x, números con números).', 'Agrupa: los x juntos y los números juntos.', `Suma los coeficientes de x: ${a} y ${c}.`],
      steps: [`Términos con x: $${a}x ${sgn(c)}x = ${tx}x$`, `Constantes: $${b} ${sgn(e)} = ${tc}$`, `Resultado: $${ans.replace(/\^(\d)/g, '^{$1}')}$`],
      why: 'Simplificar mantiene el valor, pero hace la expresión manejable.',
    });
  },

  alg_distribute(r, d) {
    const k = r.nz(-6, 7, true); const a = r.nz(-8, 8); const b = r.nz(-6, 6);
    const inner = d === 1 ? [1, a] : [b, a];
    const ans = polyStr(inner.map((v) => k * v));
    return Q({
      type: 'expr', vars: ['x'], answer: ans, form: 'expanded', answerText: ans,
      prompt: `Desarrolla: $${k}\\left(${polyTex(inner)}\\right)$`,
      hints: ['La propiedad distributiva: el factor de afuera multiplica CADA término de adentro.', 'No olvides multiplicar también el término sin letra.', `${k}·${inner[0] === 1 ? 'x' : inner[0] + 'x'} y ${k}·${par(inner[1])}.`],
      steps: [`$${k}\\cdot (${polyTex(inner)}) = ${polyTex(inner.map((v) => k * v))}$`],
      why: 'La distributiva conecta la multiplicación con la suma: es la herramienta clave del álgebra.',
      diagnose: () => ({ msg: 'Revisa que el factor exterior haya multiplicado a TODOS los términos del paréntesis, incluido el último.', step: 0 }),
    });
  },

  monomial_ops(r, d) {
    const a = r.nz(-5, 6); const b = r.nz(-5, 6); const m = r.int(1, 4); const n = r.int(1, 4);
    if (d === 1 || r.chance(0.6)) {
      const ans = `${a * b}x^${m + n}`;
      return Q({ type: 'expr', vars: ['x'], answer: ans, form: 'expanded', answerText: ans, prompt: `Multiplica los monomios: $(${a}x^{${m}})(${par(b)}x^{${n}})$`, hints: ['Multiplica los coeficientes entre sí.', 'Multiplica las partes literales sumando exponentes.', `${a}·${par(b)} y x^${m}·x^${n}.`], steps: [`Coeficientes: $${a}\\cdot ${par(b)} = ${a * b}$`, `Letras: $x^{${m}}\\cdot x^{${n}} = x^{${m + n}}$`, `$${a * b}x^{${m + n}}$`], why: 'Los monomios son los ladrillos de los polinomios.' });
    }
    const q = a * b; const e1 = m + n;
    return Q({ type: 'expr', vars: ['x'], answer: `${b}x^${n}`, form: 'expanded', answerText: `${b}x^${n}`, prompt: `Divide: $\\dfrac{${q}x^{${e1}}}{${a}x^{${m}}}$`, hints: ['Divide los coeficientes.', 'En la división de potencias de igual base, los exponentes se restan.', `${q}÷${a} y x^${e1} ÷ x^${m}.`], steps: [`$\\frac{${q}}{${a}} = ${b}$ y $x^{${e1}-${m}} = x^{${n}}$`, `$${b}x^{${n}}$`], why: 'Dividir monomios es simplificar fracciones algebraicas.' });
  },

  poly_add(r, d) {
    const A = [r.nz(-4, 5), r.int(-6, 6), r.int(-8, 8)]; const B = [r.nz(-4, 5), r.int(-6, 6), r.int(-8, 8)];
    const sub = d > 1 && r.chance();
    const res = sub ? A.map((v, i) => v - B[i]) : A.map((v, i) => v + B[i]);
    const ans = polyStr(res);
    return Q({
      type: 'expr', vars: ['x'], answer: ans === '' ? '0' : ans, form: 'expanded', answerText: ans,
      prompt: `Calcula: $\\left(${polyTex(A)}\\right) ${sub ? '-' : '+'} \\left(${polyTex(B)}\\right)$`,
      hints: [sub ? 'Restar un polinomio cambia el signo de TODOS sus términos.' : 'Suma términos del mismo grado.', 'Agrupa por potencias de x: x², x y números.', 'Hazlo término a término.'],
      steps: [sub ? `Cambia el signo del segundo polinomio: $-(${polyTex(B)}) = ${polyTex(B.map((v) => -v))}$` : 'Suma coeficientes del mismo grado.', `Resultado: $${polyTex(res)}$`],
      why: 'Los polinomios modelan trayectorias, costos y áreas.',
    });
  },

  notable_prod(r, d) {
    const a = r.int(1, 9); const b = r.nz(-7, 7);
    const kind = r.int(1, d === 1 ? 2 : 3);
    let coefs; let shown;
    if (kind === 1) { coefs = polyMul([1, a], [1, a]); shown = `(x+${a})^{2}`; }
    else if (kind === 2) { coefs = polyMul([1, a], [1, -a]); shown = `(x+${a})(x-${a})`; }
    else { coefs = polyMul([1, a], [1, b]); shown = `(x+${a})(x${sgn(b)})`; }
    const ans = polyStr(coefs);
    return Q({
      type: 'expr', vars: ['x'], answer: ans, form: 'expanded', answerText: ans,
      prompt: `Desarrolla: $${shown}$`,
      hints: [kind === 1 ? 'Cuadrado de un binomio: $(a+b)^2 = a^2 + 2ab + b^2$.' : kind === 2 ? 'Suma por diferencia: $(a+b)(a-b)=a^2-b^2$.' : 'Multiplica cada término del primero por cada término del segundo.', 'Puedes dibujarlo como un rectángulo de lados (x+a) y (x+b).', 'Cuidado con el término del medio (2ab).'],
      steps: [kind === 1 ? `$(x+${a})^2 = x^2 + 2\\cdot ${a}x + ${a * a}$` : kind === 2 ? `$(x+${a})(x-${a}) = x^2 - ${a * a}$` : `$x\\cdot x + x\\cdot ${b} + ${a}x + ${a * b}$`, `$${polyTex(coefs)}$`],
      why: 'Los productos notables son atajos que aparecen una y otra vez (áreas de cuadrados, distancias, varianza).',
      diagnose: () => (kind === 1 ? { msg: 'Cuidado: $(x+a)^2$ NO es $x^2+a^2$. Falta el término doble producto $2ax$.' } : null),
    });
  },

  factor(r, d) {
    const kind = r.int(1, d === 1 ? 1 : 3);
    if (kind === 1) { const g = r.int(2, 7); const a = r.nz(-6, 6); const b = r.nz(-6, 6); const ans = `${g}(${polyStr([a, b])})`; return Q({ type: 'expr', vars: ['x'], answer: ans, form: 'factored', answerText: ans, prompt: `Factoriza (saca factor común): $${polyTex([g * a, g * b])}$`, hints: ['Busca el mayor número que divida a todos los términos.', `MCD(${Math.abs(g * a)}, ${Math.abs(g * b)}) ≥ ${g}.`, 'Escribe: factor × (lo que queda).'], steps: [`El factor común es $${g}$.`, `$${polyTex([g * a, g * b])} = ${g}\\left(${polyTex([a, b])}\\right)$`], why: 'Factorizar es “deshacer” la multiplicación: revela la estructura.', selfcheck: () => gcd(Math.abs(g * a), Math.abs(g * b)) % g === 0 }); }
    if (kind === 2) { const a = r.int(1, 9); const b = r.nz(-8, 8); const ans = `(x+${a})(x${b >= 0 ? '+' : '-'}${Math.abs(b)})`; return Q({ type: 'expr', vars: ['x'], answer: ans, form: 'factored', answerText: ans, prompt: `Factoriza: $${polyTex(polyMul([1, a], [1, b]))}$`, hints: ['Busca dos números que multiplicados den el término independiente…', '…y que sumados den el coeficiente de x.', `Producto = ${a * b}, suma = ${a + b}.`], steps: [`Necesito $p\\cdot q = ${a * b}$ y $p + q = ${a + b}$.`, `Sirven $p=${a}$ y $q=${b}$.`, `$${polyTex(polyMul([1, a], [1, b]))} = (x+${a})(x${sgn(b)})$`], why: 'Factorizar permite resolver ecuaciones cuadráticas sin fórmula.' }); }
    const a = r.int(2, 11); const ans = `(x+${a})(x-${a})`;
    return Q({ type: 'expr', vars: ['x'], answer: ans, form: 'factored', answerText: ans, prompt: `Factoriza: $x^{2} - ${a * a}$`, hints: ['Es una diferencia de cuadrados.', `${a * a} = ${a}².`, '$a^2-b^2=(a+b)(a-b)$.'], steps: [`$x^2-${a * a} = x^2-${a}^2 = (x+${a})(x-${a})$`], why: 'La diferencia de cuadrados aparece en geometría y en física.' });
  },

  linear_eq(r, d) {
    const x0 = r.int(-8, 10);
    if (d === 1) {
      const a = r.nz(2, 9); const b = r.nz(-12, 12); const c = a * x0 + b;
      return Q({
        type: 'numeric', answer: x0,
        prompt: `Resuelve: $${a}x ${sgn(b)} = ${c}$`,
        hints: ['El objetivo es dejar la x sola, deshaciendo lo que le hicieron (en orden inverso).', 'A x primero la multiplicaron por ' + a + ' y luego le sumaron ' + b + '. Deshaz primero la suma/resta.', `Resta ${b} en ambos lados.`],
        steps: [`$${a}x ${sgn(b)} = ${c}$`, `$${a}x = ${c} ${b >= 0 ? '-' : '+'} ${Math.abs(b)} = ${c - b}$`, `$x = \\frac{${c - b}}{${a}} = ${x0}$`, `Comprobación: $${a}\\cdot ${par(x0)} ${sgn(b)} = ${c}$ ✓`],
        why: 'Una ecuación es una balanza: lo que haces de un lado lo haces del otro.',
        diagnose: (v) => {
          if (Math.abs(v - c / a) < 1e-9) return { msg: `Encontramos el problema en el aislamiento de x: dividiste ${c} entre ${a} sin antes mover el ${b >= 0 ? '+' : ''}${b}.`, step: 1 };
          if (Math.abs(v - (c + b) / a) < 1e-9) return { msg: `Casi: al pasar ${b} al otro lado, su signo debe CAMBIAR (${b >= 0 ? 'restar' : 'sumar'} ${Math.abs(b)}).`, step: 1 };
          if (Math.abs(v - (c - b) * a) < 1e-9) return { msg: `Multiplicaste en lugar de dividir: si x estaba multiplicada por ${a}, se deshace dividiendo entre ${a}.`, step: 2 };
          return null;
        },
        selfcheck: () => a * x0 + b === c,
      });
    }
    if (d === 2) {
      const a = r.nz(2, 8); let c = r.nz(-6, 8); while (c === a) c = r.nz(-6, 8); const b = r.int(-10, 10); const dd = (a - c) * x0 + b;
      return Q({
        type: 'numeric', answer: x0,
        prompt: `Resuelve: $${a}x ${sgn(b)} = ${c}x ${sgn(dd)}$`,
        hints: ['Hay x en los dos lados: junta las x en uno y los números en el otro.', `Resta ${c}x en ambos lados.`, 'Luego mueve el término constante.'],
        steps: [`$${a}x - ${par(c)}x = ${dd} - ${par(b)}$`, `$${a - c}x = ${dd - b}$`, `$x = \\frac{${dd - b}}{${a - c}} = ${x0}$`],
        why: 'Muchas situaciones comparan dos planes: ¿cuándo valen lo mismo?',
        selfcheck: () => a * x0 + b === c * x0 + dd,
      });
    }
    const a = r.nz(2, 6); const b = r.nz(-6, 6); const k = r.nz(2, 5);
    const rhs = k * (a * x0 + b) + r.int(-5, 5); const e = r.int(-5, 5);
    // k(ax+b) + e = rhs  → x0 puede no ser entero; resolvemos con fracción
    const num = rhs - e - k * b; const den = k * a; const f = frac(num, den);
    return Q({
      type: 'frac', answer: f.n / f.d, answerText: fracStr(f),
      prompt: `Resuelve: $${k}(${a}x ${sgn(b)}) ${sgn(e)} = ${rhs}$. (Si no es entero, escribe \`a/b\`.)`,
      hints: ['Primero elimina el paréntesis con la distributiva.', 'Luego trata la ecuación como la de siempre.', `${k}·${a}x = ${k * a}x.`],
      steps: [`$${k * a}x ${sgn(k * b)} ${sgn(e)} = ${rhs}$`, `$${k * a}x = ${num}$`, `$x = ${fracTex(f)}$`],
      why: 'Los paréntesis agrupan; la distributiva los abre.',
      selfcheck: () => Math.abs(k * (a * (f.n / f.d) + b) + e - rhs) < 1e-9,
    });
  },

  spot_error(r) {
    const x0 = r.int(2, 9); const a = r.int(2, 6); const b = r.int(2, 9); const c = a * x0 + b;
    const wrongLine = r.int(2, 3);
    const l2 = wrongLine === 2 ? `${a}x = ${c} + ${b}` : `${a}x = ${c - b}`;
    const l3 = wrongLine === 3 ? `x = ${a} \\div ${c - b}`.replace('\\div', '/') : `x = ${c - b} / ${a}`;
    const lines = [`${a}x + ${b} = ${c}`, l2, l3, `x = ${x0}`];
    return Q({
      type: 'choice',
      prompt: `Una estudiante resolvió así. **¿En qué línea está el primer error?**\n\n1. $${lines[0]}$\n2. $${lines[1]}$\n3. $${lines[2].replace(' / ', ' / ')}$\n4. $${lines[3]}$`,
      choices: ['Línea 1', 'Línea 2', 'Línea 3', 'No hay error'], answer: wrongLine - 1,
      hints: ['Comprueba cada línea con la anterior.', 'Pregúntate: ¿qué operación se hizo y es correcta?', wrongLine === 2 ? 'Mira cómo pasó el +' + b + ' al otro lado.' : 'Mira cómo se despejó x al final.'],
      steps: [wrongLine === 2 ? `El +${b} debe RESTARSE al otro lado: $${a}x = ${c} - ${b}$.` : `Para despejar x hay que dividir ${c - b} entre ${a}, no al revés: $x = \\frac{${c - b}}{${a}}$.`],
      why: 'Encontrar un error ajeno entrena el ojo para encontrar los propios.',
    });
  },

  solve_for(r) {
    const bank = [
      { eq: 'd = vt', v: 'v', ans: 'd/t', vars: ['d', 't'], steps: 'Divide ambos lados entre $t$.' },
      { eq: 'F = ma', v: 'a', ans: 'F/m', vars: ['F', 'm'], steps: 'Divide ambos lados entre $m$.' },
      { eq: 'V = IR', v: 'R', ans: 'V/I', vars: ['V', 'I'], steps: 'Divide ambos lados entre $I$.' },
      { eq: 'A = \\tfrac{1}{2}bh', v: 'h', ans: '2A/b', vars: ['A', 'b'], steps: 'Multiplica por 2 y divide entre $b$.' },
      { eq: 'P = 2l + 2w', v: 'w', ans: '(P-2l)/2', vars: ['P', 'l'], steps: 'Resta $2l$ y luego divide entre 2.' },
      { eq: 'y = mx + b', v: 'x', ans: '(y-b)/m', vars: ['y', 'b', 'm'], steps: 'Resta $b$ y divide entre $m$.' },
      { eq: 'K = \\tfrac{1}{2}mv^{2}', v: 'm', ans: '2K/v^2', vars: ['K', 'v'], steps: 'Multiplica por 2 y divide entre $v^2$.' },
      { eq: 'C = 2\\pi r', v: 'r', ans: 'C/(2pi)', vars: ['C'], steps: 'Divide ambos lados entre $2\\pi$.' },
    ];
    const it = r.pick(bank);
    return Q({
      type: 'expr', vars: it.vars, answer: it.ans, answerText: it.ans,
      prompt: `Despeja **$${it.v}$** en la fórmula $${it.eq}$. (Escribe la expresión, por ejemplo \`a/b\`.)`,
      hints: ['Despejar es deshacer, paso a paso, lo que le hicieron a la letra.', 'Aplica la misma operación en los dos lados.', it.steps],
      steps: [it.steps, `$${it.v} = ${it.ans.replace(/pi/g, '\\pi')}$`],
      why: 'Despejar permite usar una misma fórmula para hallar cualquiera de sus magnitudes.',
    });
  },

  system_2x2(r, d) {
    let x0; let y0; let a1; let b1; let a2; let b2;
    do { x0 = r.int(-4, 6); y0 = r.int(-4, 6); a1 = r.nz(-4, 5); b1 = r.nz(-4, 5); a2 = r.nz(-4, 5); b2 = r.nz(-4, 5); } while (a1 * b2 - a2 * b1 === 0 || (d === 1 && (Math.abs(a1) > 1 || Math.abs(b2) > 1)));
    const c1 = a1 * x0 + b1 * y0; const c2 = a2 * x0 + b2 * y0;
    const eq = (a, b, c) => `${a === 1 ? '' : a === -1 ? '-' : a}x ${b < 0 ? '-' : '+'} ${Math.abs(b) === 1 ? '' : Math.abs(b)}y = ${c}`;
    return Q({
      type: 'tuple', answer: [x0, y0], answerText: `x = ${x0}, y = ${y0}`,
      prompt: `Resuelve el sistema y escribe \`x, y\`:\n\n$$\\begin{cases}${eq(a1, b1, c1)} \\\\ ${eq(a2, b2, c2)}\\end{cases}$$`,
      hints: ['Dos ecuaciones, dos incógnitas: busca el punto donde se cruzan las dos rectas.', 'Usa sustitución o eliminación.', 'Elimina una variable multiplicando las ecuaciones por números adecuados.'],
      steps: [`Elimina $y$: multiplica la 1.ª por $${b2}$ y la 2.ª por $${b1}$ y resta.`, `Obtienes $x = ${x0}$.`, `Sustituye en una ecuación: $y = ${y0}$.`, `Comprobación: $${a1}\\cdot ${par(x0)} + ${par(b1)}\\cdot ${par(y0)} = ${c1}$ ✓`],
      why: 'Los sistemas aparecen cuando varias condiciones deben cumplirse a la vez (mezclas, redes, circuitos).',
      diagnose: (v) => (v && v[0] === y0 && v[1] === x0 ? { msg: 'Tus valores están al revés: escribe primero x y luego y.' } : null),
      selfcheck: () => a1 * x0 + b1 * y0 === c1 && a2 * x0 + b2 * y0 === c2 && a1 * b2 - a2 * b1 !== 0,
    });
  },

  func_eval(r, d) {
    const coefs = d === 1 ? [0, r.nz(-5, 6), r.int(-6, 9)] : [r.nz(-3, 4), r.int(-6, 6), r.int(-7, 9)];
    const k = r.int(-3, 5);
    const f = coefs[0] === 0 ? coefs.slice(1) : coefs;
    return Q({
      type: 'numeric', answer: polyEval(f, k),
      prompt: `Sea $f(x) = ${polyTex(f)}$. Calcula $f(${k})$.`,
      hints: ['Una función es una máquina: entra x, sale f(x).', `Sustituye x por ${par(k)} en TODA la expresión.`, 'Respeta el orden: potencias, luego productos, luego sumas.'],
      steps: [`$f(${k}) = ${polyTex(f).replace(/x/g, `(${k})`)}$`, `$= ${polyEval(f, k)}$`],
      why: 'Las funciones describen cómo una cantidad depende de otra.',
    });
  },

  line_graph(r, d) {
    const x1 = r.int(-4, 3); const y1 = r.int(-5, 5); const dx = r.nz(1, 4); const m = r.nz(-4, 4); const x2 = x1 + dx; const y2 = y1 + m * dx;
    if (d === 1) return Q({ type: 'numeric', answer: m, prompt: `Una recta pasa por $(${x1}, ${y1})$ y $(${x2}, ${y2})$. ¿Cuál es su **pendiente**?`, hints: ['Pendiente = cuánto sube (o baja) por cada paso a la derecha.', '$m = \\frac{y_2-y_1}{x_2-x_1}$', `Cambio en y: ${y2 - y1}. Cambio en x: ${x2 - x1}.`], steps: [`$m = \\frac{${y2} - ${par(y1)}}{${x2} - ${par(x1)}} = \\frac{${y2 - y1}}{${dx}} = ${m}$`], why: 'La pendiente es la “razón de cambio”: velocidad, crecimiento, inclinación.', diagnose: (v) => (Math.abs(v + m) < 1e-9 ? { msg: 'El valor absoluto es correcto pero el signo no: revisa el orden (y₂−y₁)/(x₂−x₁).' } : Math.abs(v - 1 / m) < 1e-9 ? { msg: 'Invertiste la razón: la pendiente es Δy/Δx, no Δx/Δy.' } : null) });
    const b = y1 - m * x1;
    return Q({ type: 'expr', vars: ['x'], answer: polyStr([m, b]), answerText: `y = ${polyStr([m, b])}`, prompt: `Halla la ecuación de la recta que pasa por $(${x1}, ${y1})$ y $(${x2}, ${y2})$. Escribe solo la parte derecha de $y = \\dots$`, hints: ['Forma pendiente–ordenada: $y = mx + b$.', 'Calcula m y luego despeja b con uno de los puntos.', `m = ${m}.`], steps: [`$m = \\frac{${y2 - y1}}{${dx}} = ${m}$`, `$b = y_1 - m x_1 = ${y1} - ${par(m)}\\cdot ${par(x1)} = ${b}$`, `$y = ${polyTex([m, b])}$`], why: 'Una recta resume una relación lineal completa con dos números.', selfcheck: () => m * x1 + b === y1 && m * x2 + b === y2 });
  },

  quadratic_eq(r, d) {
    const r1 = r.int(-7, 7); let r2 = r.int(-7, 7); if (d > 1) while (r2 === r1) r2 = r.int(-7, 7);
    const lead = d === 3 ? r.pick([2, 3, -1]) : 1;
    const coefs = polyMul([lead], polyMul([1, -r1], [1, -r2]));
    const roots = [...new Set([r1, r2])];
    const D = coefs[1] ** 2 - 4 * coefs[0] * coefs[2];
    return Q({
      type: 'set', answer: roots, answerText: roots.join(' y '),
      prompt: `Resuelve $${polyTex(coefs)} = 0$. Escribe todas las soluciones separadas por coma.`,
      hints: ['Si un producto vale cero, uno de los factores vale cero.', 'Factoriza o usa la fórmula general.', `Fórmula: $x=\\frac{-b\\pm\\sqrt{b^2-4ac}}{2a}$ con a=${coefs[0]}, b=${coefs[1]}, c=${coefs[2]}.`],
      steps: [`Discriminante: $\\Delta = b^2-4ac = ${coefs[1]}^2 - 4\\cdot ${par(coefs[0])}\\cdot ${par(coefs[2])} = ${D}$`, `$x = \\frac{${-coefs[1]} \\pm ${Math.sqrt(D)}}{${2 * coefs[0]}}$`, `Soluciones: $x = ${roots.join(',\\; x = ')}$`],
      why: 'Las cuadráticas describen trayectorias, áreas y optimización.',
      selfcheck: () => roots.every((x) => polyEval(coefs, x) === 0),
    });
  },

  inequality(r) {
    const a = r.nz(-5, 5, true); const x0 = r.int(-5, 6); const b = r.int(-8, 8);
    const c = a * x0 + b;
    const lt = r.chance();
    const flipped = a < 0 ? !lt : lt;
    const sol = `x ${flipped ? '<' : '>'} ${x0}`;
    const wrong = [`x ${flipped ? '>' : '<'} ${x0}`, `x ${flipped ? '<' : '>'} ${-x0}`, `x ${flipped ? '>' : '<'} ${-x0}`];
    return Q({
      ...choiceQ(r, { correct: sol, wrong, prompt: `Resuelve: $${a}x ${sgn(b)} ${lt ? '<' : '>'} ${c}$` }),
      hints: ['Se resuelve como una ecuación…', '…pero si multiplicas o divides por un NEGATIVO, el sentido de la desigualdad se invierte.', `Aquí divides entre ${a}${a < 0 ? ' (negativo → invierte)' : ''}.`],
      steps: [`$${a}x ${lt ? '<' : '>'} ${c - b}$`, a < 0 ? `Divide entre $${a}$ (negativo): se invierte el signo.` : `Divide entre $${a}$ (positivo): el signo se mantiene.`, `$${sol}$`],
      why: 'Las desigualdades describen rangos permitidos: presupuestos, tolerancias, seguridad.',
    });
  },
};
