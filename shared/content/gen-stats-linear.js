// Generadores — 📊 Ciudad de los Datos y 🤖 Laboratorio Matricial
import { Q, choiceQ, gcd, fact, nCr, nPr, mean, sum, fmt, par, round, frac, fracTex, fracStr, matTex, vecTex } from './gen-core.js';

const listTex = (a) => a.join(',\\; ');

export const stats = {
  freq_table(r) {
    const cats = r.sample(['Pizza', 'Sushi', 'Tacos', 'Pasta', 'Ensalada'], 3);
    const counts = [r.int(4, 15), r.int(4, 15), r.int(4, 15)]; const total = sum(counts);
    const i = r.int(0, 2);
    return Q({ type: 'numeric', answer: (counts[i] / total) * 100, tol: 0.1, viz: { kind: 'bars', labels: cats, values: counts, title: 'Comida favorita (votos)' }, prompt: `En una encuesta votaron así: ${cats.map((c, k) => `${c}: ${counts[k]}`).join(', ')}. ¿Qué **porcentaje** votó por ${cats[i]}? (1 decimal)`, hints: ['Frecuencia relativa = frecuencia ÷ total.', `Total de votos: ${total}.`, 'Multiplica por 100 para el porcentaje.'], steps: [`Total $= ${counts.join('+')} = ${total}$`, `$\\frac{${counts[i]}}{${total}}\\cdot 100 = ${fmt((counts[i] / total) * 100, 1)}\\%$`], why: 'Las tablas de frecuencia resumen datos para poder interpretarlos.' });
  },

  stat_central(r, d) {
    const n = d === 1 ? 5 : d === 2 ? 7 : 8;
    const kind = r.pick(['media', 'mediana', 'moda', 'rango']);
    let data;
    if (kind === 'moda') {
      // moda única: un valor aparece 3 veces y los demás son distintos entre sí
      const pool = r.shuffle(Array.from({ length: 19 }, (_, i) => i + 2));
      const m = pool[0];
      data = r.shuffle([m, m, m, ...pool.slice(1, n - 2)]);
    } else data = Array.from({ length: n }, () => r.int(2, 20));
    const sorted = [...data].sort((a, b) => a - b);
    let ans; let steps; let hints;
    if (kind === 'media') {
      ans = mean(data);
      steps = [`Suma $= ${sum(data)}$`, `Media $= \\frac{${sum(data)}}{${n}} = ${fmt(ans, 3)}$`];
      hints = ['La media es el “reparto equitativo”.', 'Suma todos los datos.', `Divide entre ${n}.`];
    } else if (kind === 'mediana') {
      ans = n % 2 ? sorted[(n - 1) / 2] : (sorted[n / 2 - 1] + sorted[n / 2]) / 2;
      steps = [`Ordenados: $${listTex(sorted)}$`, n % 2 ? `El dato central es $${ans}$.` : `Promedio de los dos centrales: $${ans}$.`];
      hints = ['La mediana es el dato del medio.', 'Primero ordena de menor a mayor.', n % 2 ? 'Toma el del centro.' : 'Hay dos del centro: promédialos.'];
    } else if (kind === 'moda') {
      const cnt = {}; data.forEach((v) => { cnt[v] = (cnt[v] || 0) + 1; });
      ans = Number(Object.keys(cnt).find((k) => cnt[k] === 3));
      steps = [`El dato que más se repite es $${ans}$ (aparece 3 veces).`];
      hints = ['La moda es el valor más frecuente.', 'Cuenta cuántas veces aparece cada uno.', 'Ordenar los datos ayuda a verlos juntos.'];
    } else {
      ans = sorted[n - 1] - sorted[0];
      steps = [`Máximo $= ${sorted[n - 1]}$, mínimo $= ${sorted[0]}$`, `Rango $= ${sorted[n - 1]} - ${sorted[0]} = ${ans}$`];
      hints = ['El rango mide qué tan dispersos están los datos.', 'Máximo − mínimo.', 'Ordena para hallar los extremos.'];
    }
    return Q({ type: 'numeric', answer: ans, tol: kind === 'media' ? 0.01 : 0, prompt: `Para los datos $${listTex(data)}$, calcula la **${kind}**.${kind === 'media' ? ' (hasta 2 decimales)' : ''}`, hints, steps, why: 'Resumir muchos datos con un número es el primer paso de la estadística.' });
  },

  variance(r, d) {
    const n = 4 + d;
    const base = r.int(4, 12); const data = Array.from({ length: n }, () => base + r.int(-4, 4));
    const m = mean(data); const v = sum(data.map((x) => (x - m) ** 2)) / n; const sd = Math.sqrt(v);
    const useSd = d > 1 && r.chance();
    return Q({ type: 'numeric', answer: useSd ? sd : v, tol: 0.02, prompt: `Datos (población completa): $${listTex(data)}$. Calcula la **${useSd ? 'desviación estándar' : 'varianza'}** poblacional. (2 decimales)`, hints: ['Mide qué tanto se alejan los datos de la media.', 'Calcula la media, luego (dato − media)² para cada uno.', useSd ? 'Promedia esos cuadrados y saca la raíz.' : 'Promedia esos cuadrados.'], steps: [`Media $\\mu = ${fmt(m, 3)}$`, `Desviaciones² : ${data.map((x) => fmt((x - m) ** 2, 2)).join(', ')}`, `Varianza $\\sigma^2 = ${fmt(v, 3)}$${useSd ? `; $\\sigma = ${fmt(sd, 3)}$` : ''}`], why: 'Dos grupos con la misma media pueden ser muy distintos: la dispersión lo revela.' });
  },

  probability(r, d) {
    const kind = r.int(1, d === 1 ? 2 : 3);
    if (kind === 1) { const red = r.int(2, 7); const blue = r.int(2, 7); const f = frac(red, red + blue); return Q({ type: 'frac', answer: f.n / f.d, answerText: fracStr(f), prompt: `Una bolsa tiene $${red}$ bolas rojas y $${blue}$ azules. Sacas una al azar. ¿Cuál es la probabilidad de que sea **roja**? (Escribe \`a/b\`.)`, hints: ['Probabilidad = casos favorables ÷ casos posibles.', `Favorables: ${red}. Posibles: ${red + blue}.`, 'Simplifica.'], steps: [`$P = \\frac{${red}}{${red + blue}} = ${fracTex(f)}$`], why: 'La probabilidad cuantifica la incertidumbre.' }); }
    if (kind === 2) { const f = frac(1, 6); return Q({ type: 'numeric', answer: 1 / 36, tol: 0.0005, prompt: 'Lanzas dos dados justos. ¿Cuál es la probabilidad de obtener **dos seises**? (decimal con 3–4 cifras, o \`1/36\`)', hints: ['Eventos independientes: multiplica probabilidades.', 'P(6) en un dado = 1/6.', '1/6 × 1/6'], steps: ['$P = \\frac16\\cdot\\frac16 = \\frac{1}{36}\\approx 0{,}028$'], why: 'La independencia permite multiplicar.' }); }
    const n = r.int(10, 20); const a = r.int(3, 6); const b = r.int(3, 6);
    const f = frac(a * (a - 1), n * (n - 1));
    return Q({ type: 'frac', answer: f.n / f.d, answerText: fracStr(f), prompt: `En una caja hay ${n} fichas y ${a} son doradas. Sacas **dos sin devolver**. ¿Probabilidad de que ambas sean doradas? (\`a/b\`)`, hints: ['Sin reposición: la segunda probabilidad cambia.', `Primera: ${a}/${n}. Segunda: ${a - 1}/${n - 1}.`, 'Multiplica.'], steps: [`$\\frac{${a}}{${n}}\\cdot\\frac{${a - 1}}{${n - 1}} = ${fracTex(f)}$`], why: 'La probabilidad condicional modela situaciones donde lo anterior influye.' });
  },

  combinatorics(r, d) {
    const n = r.int(5, 9); const k = r.int(2, 4);
    const kind = r.int(1, 3);
    if (kind === 1) return Q({ type: 'numeric', answer: fact(k + 1), prompt: `¿De cuántas maneras se pueden ordenar $${k + 1}$ libros distintos en una estantería?`, hints: ['Importa el orden.', 'Para la primera posición hay k+1 opciones, luego una menos…', `${k + 1}!`], steps: [`$${k + 1}! = ${fact(k + 1)}$`], why: 'Los factoriales cuentan ordenaciones.' });
    if (kind === 2) return Q({ type: 'numeric', answer: nCr(n, k), prompt: `¿Cuántos equipos de $${k}$ personas se pueden formar con $${n}$ estudiantes? (el orden no importa)`, hints: ['Es una combinación: no importa el orden.', '$\\binom{n}{k} = \\frac{n!}{k!(n-k)!}$', `n = ${n}, k = ${k}`], steps: [`$\\binom{${n}}{${k}} = \\frac{${n}!}{${k}!\\,${n - k}!} = ${nCr(n, k)}$`], why: 'Las combinaciones cuentan selecciones.' });
    return Q({ type: 'numeric', answer: nPr(n, k), prompt: `En una carrera de $${n}$ corredores, ¿de cuántas formas pueden repartirse los **${k} primeros lugares** (oro, plata, ...)?`, hints: ['El orden SÍ importa (permutación).', `Primer lugar: ${n} opciones; segundo: ${n - 1}…`, `${n}·${n - 1}…`], steps: [`$${Array.from({ length: k }, (_, i) => n - i).join('\\cdot ')} = ${nPr(n, k)}$`], why: 'Contar sin listar es la clave de la combinatoria.' });
  },

  binomial(r) {
    const n = r.int(4, 6); const k = r.int(1, n - 1); const p = 0.5;
    const ans = nCr(n, k) * p ** n;
    return Q({ type: 'numeric', answer: ans, tol: 0.002, prompt: `Lanzas una moneda justa ${n} veces. ¿Cuál es la probabilidad de obtener **exactamente ${k} caras**? (decimal, 3 cifras)`, hints: ['Distribución binomial.', '$P = \\binom{n}{k}p^k(1-p)^{n-k}$', 'Con p = 1/2 queda $\\binom{n}{k}/2^n$.'], steps: [`$\\binom{${n}}{${k}}\\cdot \\left(\\frac12\\right)^{${n}} = \\frac{${nCr(n, k)}}{${2 ** n}} = ${fmt(ans, 4)}$`], why: 'La binomial modela éxitos en intentos repetidos.' });
  },

  zscore(r) {
    const mu = r.int(60, 80); const sd = r.int(4, 10); const x = mu + sd * r.pick([-2, -1, 1, 1.5, 2]);
    return Q({ type: 'numeric', answer: (x - mu) / sd, tol: 0.01, prompt: `Las notas de un examen tienen media $\\mu=${mu}$ y desviación estándar $\\sigma=${sd}$. ¿Cuál es el **puntaje z** de una nota de $${fmt(x)}$?`, hints: ['El puntaje z dice cuántas desviaciones está el dato de la media.', '$z = \\frac{x-\\mu}{\\sigma}$', `(${fmt(x)} − ${mu}) / ${sd}`], steps: [`$z = \\frac{${fmt(x)}-${mu}}{${sd}} = ${fmt((x - mu) / sd, 2)}$`], why: 'z permite comparar datos de escalas diferentes.' });
  },

  conf_int(r) {
    const s = r.pick([10, 12, 15, 20]); const n = r.pick([25, 36, 64, 100]);
    const me = (1.96 * s) / Math.sqrt(n);
    return Q({ type: 'numeric', answer: me, tol: 0.03, prompt: `Una muestra de $n=${n}$ datos tiene desviación $\\sigma=${s}$. ¿Cuál es el **margen de error** al 95% de confianza? (usa 1,96; 2 decimales)`, hints: ['Margen de error = z · σ/√n.', 'Para 95%, z ≈ 1,96.', `√${n} = ${Math.sqrt(n)}`], steps: [`$ME = 1{,}96\\cdot\\frac{${s}}{\\sqrt{${n}}} = ${fmt(me, 2)}$`], why: 'La inferencia dice cuánto confiar en una estimación.' });
  },

  chart_read(r) {
    const labels = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie']; const vals = labels.map(() => r.int(2, 9));
    const i = r.int(0, 4); const j = r.int(0, 4);
    return Q({ type: 'numeric', answer: vals[i] - vals[j], viz: { kind: 'bars', labels, values: vals, title: 'Horas de estudio por día' }, prompt: `Observa la gráfica. ¿Cuántas horas **más** (o menos, con signo) se estudió el ${labels[i]} que el ${labels[j]}?`, hints: ['Lee la altura de cada barra.', `${labels[i]}: ${vals[i]}; ${labels[j]}: ${vals[j]}.`, 'Resta (primero − segundo).'], steps: [`${labels[i]} = ${vals[i]} h; ${labels[j]} = ${vals[j]} h.`, `Diferencia $= ${vals[i] - vals[j]}$`], why: 'Leer gráficas es leer el mundo.' });
  },
};

const det2 = ([[a, b], [c, d]]) => a * d - b * c;
const matMul = (A, B) => A.map((row) => B[0].map((_, j) => row.reduce((s, v, k) => s + v * B[k][j], 0)));

export const linear = {
  vec_ops(r, d) {
    const a = [r.int(-5, 6), r.int(-5, 6)]; const b = [r.int(-5, 6), r.int(-5, 6)]; const k = r.nz(-3, 4);
    const kind = r.int(1, d === 1 ? 2 : 3);
    if (kind === 1) return Q({ type: 'tuple', answer: [a[0] + b[0], a[1] + b[1]], prompt: `Si $\\vec a = (${a})$ y $\\vec b = (${b})$, calcula $\\vec a + \\vec b$. Escribe \`x, y\`.`, hints: ['Los vectores se suman componente a componente.', 'Imagina colocar uno a continuación del otro.', `(${a[0]}+${par(b[0])}, ${a[1]}+${par(b[1])})`], steps: [`$(${a[0]}+${par(b[0])},\\; ${a[1]}+${par(b[1])}) = (${a[0] + b[0]}, ${a[1] + b[1]})$`], why: 'Los vectores combinan magnitud y dirección.' });
    if (kind === 2) return Q({ type: 'tuple', answer: [k * a[0], k * a[1]], prompt: `Calcula $${k}\\vec a$ si $\\vec a = (${a})$. Escribe \`x, y\`.`, hints: ['Multiplicar por un escalar estira o encoge el vector.', 'Un escalar negativo invierte el sentido.', `${k}·${par(a[0])} y ${k}·${par(a[1])}`], steps: [`$(${k}\\cdot ${par(a[0])},\\; ${k}\\cdot ${par(a[1])}) = (${k * a[0]}, ${k * a[1]})$`], why: 'Escalar es cambiar la “intensidad” de un vector.' });
    const t = r.pick([[3, 4, 5], [5, 12, 13], [6, 8, 10]]);
    return Q({ type: 'numeric', answer: t[2], prompt: `Calcula la **norma** (longitud) de $\\vec v = (${t[0]}, ${t[1]})$.`, hints: ['La norma es la distancia del origen a la punta.', '$\\|\\vec v\\| = \\sqrt{x^2+y^2}$', 'Es Pitágoras.'], steps: [`$\\sqrt{${t[0]}^2+${t[1]}^2} = \\sqrt{${t[2] ** 2}} = ${t[2]}$`], why: 'La norma generaliza la longitud.' });
  },

  dot_prod(r, d) {
    const n = d === 1 ? 2 : 3; const a = Array.from({ length: n }, () => r.int(-4, 5)); const b = Array.from({ length: n }, () => r.int(-4, 5));
    const ans = a.reduce((s, v, i) => s + v * b[i], 0);
    return Q({ type: 'numeric', answer: ans, prompt: `Calcula el **producto punto** $\\vec a\\cdot\\vec b$ con $\\vec a = (${a})$ y $\\vec b = (${b})$.`, hints: ['Multiplica componente a componente y suma.', 'El resultado es un NÚMERO, no un vector.', a.map((v, i) => `${par(v)}·${par(b[i])}`).join(' + ')], steps: [`$${a.map((v, i) => `${par(v)}\\cdot ${par(b[i])}`).join(' + ')} = ${ans}$`, ans === 0 ? 'Como vale 0, los vectores son perpendiculares.' : ''], why: 'El producto punto mide qué tanto apuntan en la misma dirección (trabajo, proyecciones).' });
  },

  mat_ops(r, d) {
    const A = [[r.int(-3, 4), r.int(-3, 4)], [r.int(-3, 4), r.int(-3, 4)]]; const B = [[r.int(-3, 4), r.int(-3, 4)], [r.int(-3, 4), r.int(-3, 4)]];
    const mul = d > 1 && r.chance();
    const ans = mul ? matMul(A, B) : A.map((row, i) => row.map((v, j) => v + B[i][j]));
    return Q({ type: 'matrix', shape: [2, 2], answer: ans, answerText: ans.map((x) => x.join(' ')).join(' | '), prompt: `Calcula $A ${mul ? '\\cdot' : '+'} B$ con $$A=${matTex(A)},\\quad B=${matTex(B)}$$`, hints: [mul ? 'Cada entrada es fila × columna (producto punto).' : 'Suma entrada a entrada.', mul ? 'Entrada (1,1): fila 1 de A por columna 1 de B.' : 'Deben tener el mismo tamaño.', mul ? 'El producto de matrices NO es conmutativo.' : 'Hazlo posición por posición.'], steps: [`$A${mul ? '\\cdot' : '+'}B = ${matTex(ans)}$`], why: 'Las matrices codifican transformaciones; multiplicarlas es componerlas.', selfcheck: () => (mul ? ans[0][0] === A[0][0] * B[0][0] + A[0][1] * B[1][0] : ans[1][1] === A[1][1] + B[1][1]) });
  },

  det2(r, d) {
    const M = [[r.int(-4, 6), r.int(-4, 6)], [r.int(-4, 6), r.int(-4, 6)]];
    if (d < 3) return Q({ type: 'numeric', answer: det2(M), prompt: `Calcula el **determinante** de $${matTex(M, 'vmatrix')}$.`, hints: ['Para 2×2: diagonal principal menos diagonal secundaria.', '$ad - bc$', `${M[0][0]}·${par(M[1][1])} − ${par(M[0][1])}·${par(M[1][0])}`], steps: [`$${M[0][0]}\\cdot ${par(M[1][1])} - ${par(M[0][1])}\\cdot ${par(M[1][0])} = ${det2(M)}$`], why: 'El determinante mide cuánto cambia el área bajo la transformación.' });
    const A = Array.from({ length: 3 }, () => Array.from({ length: 3 }, () => r.int(-3, 4)));
    const dt = A[0][0] * (A[1][1] * A[2][2] - A[1][2] * A[2][1]) - A[0][1] * (A[1][0] * A[2][2] - A[1][2] * A[2][0]) + A[0][2] * (A[1][0] * A[2][1] - A[1][1] * A[2][0]);
    return Q({ type: 'numeric', answer: dt, prompt: `Calcula el determinante de $${matTex(A, 'vmatrix')}$.`, hints: ['Expande por cofactores a lo largo de una fila.', 'Signos alternados + − +.', 'Cada cofactor es un determinante 2×2.'], steps: [`Expansión por la primera fila: $a_{11}M_{11} - a_{12}M_{12} + a_{13}M_{13} = ${dt}$`], why: 'En 3×3 el determinante da el volumen escalado.' });
  },

  inv2(r) {
    let M; do { M = [[r.int(1, 5), r.int(-3, 4)], [r.int(-3, 4), r.int(1, 5)]]; } while (Math.abs(det2(M)) !== 1);
    const dt = det2(M); const inv = [[M[1][1] / dt, -M[0][1] / dt], [-M[1][0] / dt, M[0][0] / dt]].map((row) => row.map((v) => (v === 0 ? 0 : v)));
    return Q({ type: 'matrix', shape: [2, 2], answer: inv, answerText: inv.map((x) => x.join(' ')).join(' | '), prompt: `Halla la **inversa** de $A = ${matTex(M)}$ (su determinante vale $${dt}$).`, hints: ['$A^{-1} = \\frac{1}{\\det A}\\begin{pmatrix} d & -b \\\\ -c & a\\end{pmatrix}$', 'Intercambia la diagonal principal y cambia el signo de la secundaria.', `Divide todo entre ${dt}.`], steps: [`$A^{-1} = \\frac{1}{${dt}}${matTex([[M[1][1], -M[0][1]], [-M[1][0], M[0][0]]])} = ${matTex(inv)}$`, 'Comprobación: $A\\cdot A^{-1} = I$.'], why: 'La inversa deshace la transformación.', selfcheck: () => { const P = matMul(M, inv); return P[0][0] === 1 && P[1][1] === 1 && P[0][1] === 0 && P[1][0] === 0; } });
  },

  system_3x3(r) {
    const sol = [r.int(-3, 4), r.int(-3, 4), r.int(-3, 4)];
    let A; do { A = Array.from({ length: 3 }, () => Array.from({ length: 3 }, () => r.int(-2, 3))); } while (Math.abs(A[0][0] * (A[1][1] * A[2][2] - A[1][2] * A[2][1]) - A[0][1] * (A[1][0] * A[2][2] - A[1][2] * A[2][0]) + A[0][2] * (A[1][0] * A[2][1] - A[1][1] * A[2][0])) < 1);
    const bvec = A.map((row) => row.reduce((s, v, i) => s + v * sol[i], 0));
    const L = (row, bb) => `${row[0]}x ${row[1] < 0 ? '-' : '+'} ${Math.abs(row[1])}y ${row[2] < 0 ? '-' : '+'} ${Math.abs(row[2])}z = ${bb}`;
    return Q({ type: 'tuple', answer: sol, answerText: `x=${sol[0]}, y=${sol[1]}, z=${sol[2]}`, prompt: `Resuelve y escribe \`x, y, z\`:\n\n$$\\begin{cases}${L(A[0], bvec[0])}\\\\${L(A[1], bvec[1])}\\\\${L(A[2], bvec[2])}\\end{cases}$$`, hints: ['Usa eliminación gaussiana: elimina x de las ecuaciones 2 y 3.', 'Luego elimina y de la 3.ª y sustituye hacia atrás.', 'Comprueba en las tres ecuaciones.'], steps: ['Eliminación gaussiana → forma escalonada.', `Solución: $(${sol.join(', ')})$`], why: 'Los sistemas grandes se resuelven con matrices: es lo que hacen las computadoras.', selfcheck: () => A.every((row, i) => row.reduce((s, v, k) => s + v * sol[k], 0) === bvec[i]) });
  },

  lin_indep(r) {
    const dep = r.chance(); const u = [r.nz(-3, 4), r.nz(-3, 4)]; const k = r.nz(-3, 3);
    const v = dep ? [k * u[0], k * u[1]] : [u[1] + r.nz(1, 3), -u[0] + r.nz(1, 3)];
    const dt = det2([u, v]);
    return Q({ ...choiceQ({ shuffle: (a) => a, sample: (a, n) => a.slice(0, n) }, { correct: dt === 0 ? 'Linealmente dependientes' : 'Linealmente independientes', wrong: [dt === 0 ? 'Linealmente independientes' : 'Linealmente dependientes'], prompt: `Los vectores $(${u})$ y $(${v})$ en $\\mathbb{R}^2$ son…` }), hints: ['Dependientes: uno es múltiplo del otro.', 'Calcula el determinante de la matriz con ellos como filas.', 'Si el determinante es 0, son dependientes.'], steps: [`$\\det = ${u[0]}\\cdot ${par(v[1])} - ${par(u[1])}\\cdot ${par(v[0])} = ${dt}$`, dt === 0 ? 'Det 0 → dependientes.' : 'Det ≠ 0 → independientes.'], why: 'Independencia lineal = información no redundante.' });
  },

  mat_vec(r) {
    const M = [[r.int(-3, 4), r.int(-3, 4)], [r.int(-3, 4), r.int(-3, 4)]]; const v = [r.int(-3, 4), r.int(-3, 4)];
    const ans = [M[0][0] * v[0] + M[0][1] * v[1], M[1][0] * v[0] + M[1][1] * v[1]];
    return Q({ type: 'tuple', answer: ans, prompt: `La transformación $T(\\vec v) = M\\vec v$ con $M=${matTex(M)}$. Calcula $T(${vecTex(v)})$. Escribe \`x, y\`.`, hints: ['Cada componente del resultado es (fila de M)·(v).', 'Primera fila por v, luego segunda fila por v.', `${M[0][0]}·${par(v[0])} + ${par(M[0][1])}·${par(v[1])}`], steps: [`$${vecTex(ans)}$`], why: 'Girar, escalar y reflejar imágenes son multiplicaciones matriz–vector.' });
  },

  eig2(r, d) {
    const l1 = r.int(-3, 6); let l2 = r.int(-3, 6); while (l2 === l1) l2 = r.int(-3, 6);
    const off = r.int(-3, 3);
    const M = [[l1, off], [0, l2]];
    return Q({ type: 'set', answer: [l1, l2], prompt: `Halla los **valores propios** de $M = ${matTex(M)}$. Escribe separados por coma.`, hints: ['Resuelve $\\det(M - \\lambda I) = 0$.', 'En una matriz triangular, los valores propios son los de la diagonal.', `${l1} y ${l2}.`], steps: [`$\\det\\begin{pmatrix}${l1}-\\lambda & ${off}\\\\ 0 & ${l2}-\\lambda\\end{pmatrix} = (${l1}-\\lambda)(${l2}-\\lambda)=0$`, `$\\lambda = ${l1},\\ ${l2}$`], why: 'Los valores propios marcan las direcciones que una transformación solo estira.' });
  },

  eigvec(r) {
    const l1 = r.int(1, 5); const l2 = l1 + r.int(1, 4); const off = r.int(1, 4);
    const M = [[l1, off], [0, l2]];
    const v = [off, l2 - l1];
    return Q({ type: 'direction', answer: v, answerText: `(${v[0]}, ${v[1]}) o cualquier múltiplo`, prompt: `Un valor propio de $M=${matTex(M)}$ es $\\lambda=${l2}$. Halla un **vector propio** asociado. Escribe \`x, y\` (vale cualquier múltiplo).`, hints: ['Resuelve $(M-\\lambda I)\\vec v = \\vec 0$.', `$M - ${l2}I = ${matTex([[l1 - l2, off], [0, 0]])}$`, `Ecuación: ${l1 - l2}x + ${off}y = 0.`], steps: [`$(${l1 - l2})x + ${off}y = 0 \\Rightarrow y = ${(l2 - l1) / off}x$`, `Un vector: $(${v[0]}, ${v[1]})$`], why: 'Los vectores propios son los ejes naturales de la transformación.', selfcheck: () => (M[0][0] - l2) * v[0] + M[0][1] * v[1] === 0 });
  },
};

export const _helpers = { det2, matMul };
