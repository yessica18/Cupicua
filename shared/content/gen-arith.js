// Generadores — 🏠 Aldea de los Números (aritmética)
import { Q, choiceQ, numDistractors, gcd, lcm, isPrime, primeFactors, frac, fracTex, fracStr, fmt, par, round } from './gen-core.js';

const th = (n) => String(n).replace(/\B(?=(\d{3})+(?!\d))/g, ' ');

export const arith = {
  place_value(r, d) {
    const len = 4 + d;
    const digits = [];
    // dígitos todos distintos para que la pregunta no sea ambigua
    const pool = r.shuffle([1, 2, 3, 4, 5, 6, 7, 8, 9, 0]);
    while (pool[0] === 0) pool.push(pool.shift());
    for (let i = 0; i < len; i++) digits.push(pool[i]);
    const n = Number(digits.join(''));
    const names = ['unidades', 'decenas', 'centenas', 'unidades de mil', 'decenas de mil', 'centenas de mil', 'unidades de millón'];
    const pos = r.int(0, len - 1);
    const dig = digits[len - 1 - pos];
    const ans = dig * 10 ** pos;
    return Q({
      type: 'numeric', answer: ans,
      prompt: `En el número **${th(n)}**, ¿qué valor representa el dígito que está en la posición de las **${names[pos]}**?`,
      hints: ['Cada posición vale diez veces más que la de su derecha.', `Busca el dígito en la posición de ${names[pos]}: es el ${dig}.`, `El valor es el dígito multiplicado por $10^{${pos}}$.`],
      steps: [`La posición de ${names[pos]} corresponde a $10^{${pos}}$.`, `El dígito ahí es $${dig}$.`, `Valor: $${dig}\\cdot 10^{${pos}} = ${ans}$.`],
      why: 'El sistema posicional hace que la posición de un dígito cambie su valor.',
    });
  },

  basic_ops(r, d) {
    const kind = r.pick(d === 1 ? ['+', '-'] : d === 2 ? ['+', '-', '×'] : ['×', '÷', '+-']);
    let prompt; let ans; let steps; let hints;
    if (kind === '+') { const a = r.int(20 * d, 90 * d + 80); const b = r.int(20 * d, 90 * d + 80); ans = a + b; prompt = `Calcula $${a} + ${b}$.`; steps = [`Suma unidades, luego decenas, luego centenas llevando cuando haga falta.`, `$${a}+${b}=${ans}$`]; hints = ['Alinea los números por posición.', 'Suma de derecha a izquierda.', 'Si una columna pasa de 9, “llevas” 1.']; }
    else if (kind === '-') { const b = r.int(20, 90 * d); const a = b + r.int(15, 400 * d); ans = a - b; prompt = `Calcula $${a} - ${b}$.`; steps = [`Resta por columnas; si no alcanza, “pides prestado”.`, `$${a}-${b}=${ans}$`]; hints = ['Comprueba: ¿qué número sumado a ' + b + ' da ' + a + '?', 'Resta unidades con unidades.', 'Si el dígito de arriba es menor, pide prestado a la columna vecina.']; }
    else if (kind === '×') { const a = r.int(12, d === 2 ? 40 : 99); const b = r.int(6, d === 2 ? 15 : 49); ans = a * b; prompt = `Calcula $${a} \\times ${b}$.`; steps = [`Descompón: $${a}\\times ${b} = ${a}\\times ${Math.floor(b / 10) * 10} + ${a}\\times ${b % 10}$`, `$= ${a * Math.floor(b / 10) * 10} + ${a * (b % 10)} = ${ans}$`]; hints = ['Descompón uno de los factores en decenas y unidades.', 'Multiplica por separado y suma.', `Prueba con ${a}×${Math.floor(b / 10) * 10} primero.`]; }
    else if (kind === '÷') { const b = r.int(4, 19); const q = r.int(12, 95); ans = q; prompt = `Calcula $${b * q} \\div ${b}$.`; steps = [`Pregunta: ¿qué número multiplicado por ${b} da ${b * q}?`, `$${b}\\times ${q}=${b * q}$, así que el resultado es $${q}$.`]; hints = ['La división deshace la multiplicación.', `Busca q tal que ${b}×q = ${b * q}.`, 'Estima: ¿cuántas decenas caben?']; }
    else { const a = r.int(300, 900); const b = r.int(100, 299); const c = r.int(20, 99); ans = a - b + c; prompt = `Calcula $${a} - ${b} + ${c}$.`; steps = ['Se resuelve de izquierda a derecha.', `$${a}-${b}=${a - b}$`, `$${a - b}+${c}=${ans}$`]; hints = ['Suma y resta tienen la misma prioridad.', 'Ve de izquierda a derecha.', `Primero ${a}−${b}.`]; }
    return Q({ type: 'numeric', answer: ans, prompt, hints, steps, why: 'Las operaciones básicas son la base de todo lo demás.' });
  },

  int_ops(r, d) {
    const a = r.int(-12 * d, 12 * d); const b = r.nz(-9 * d, 9 * d);
    const op = r.pick(d === 1 ? ['+', '-'] : ['+', '-', '×']);
    const ans = op === '+' ? a + b : op === '-' ? a - b : a * b;
    const sym = op === '×' ? '\\cdot' : op;
    return Q({
      type: 'numeric', answer: ans,
      prompt: `Calcula $${par(a)} ${sym} ${par(b)}$.`,
      hints: ['Piensa en una recta numérica: sumar mueve a la derecha, restar a la izquierda.', op === '-' ? 'Restar un número es sumar su opuesto.' : op === '×' ? 'Signos iguales dan +, signos distintos dan −.' : 'Si los signos son distintos, resta los valores absolutos y conserva el signo del mayor.', `Reescribe: $${par(a)} ${op === '-' ? '+ ' + par(-b) : sym + ' ' + par(b)}$.`],
      steps: op === '-' ? [`Restar $${par(b)}$ equivale a sumar su opuesto $${par(-b)}$.`, `$${par(a)} + ${par(-b)} = ${fmt(ans)}$`] : [`$${par(a)} ${sym} ${par(b)} = ${fmt(ans)}$`],
      why: 'Los negativos modelan deudas, temperaturas, alturas bajo el nivel del mar…',
      diagnose: (v) => (v === -ans && ans !== 0 ? { msg: 'Casi: el valor absoluto es correcto, pero el signo no. Revisa la regla de los signos.' } : null),
    });
  },

  divisibility(r, d) {
    const k = r.pick(d === 1 ? [2, 3, 5] : [3, 4, 6, 9]);
    const mult = k * r.int(30, 220);
    const wrong = new Set();
    while (wrong.size < 3) { const w = mult + r.int(1, 6 * k) * (r.chance() ? 1 : -1); if (w % k !== 0 && w > 0) wrong.add(w); }
    const rules = { 2: 'termina en cifra par', 3: 'la suma de sus cifras es múltiplo de 3', 4: 'sus dos últimas cifras forman un múltiplo de 4', 5: 'termina en 0 o 5', 6: 'es par y divisible entre 3', 9: 'la suma de sus cifras es múltiplo de 9' };
    return Q({
      ...choiceQ(r, { correct: mult, wrong: [...wrong], prompt: `¿Cuál de estos números es divisible entre **${k}**?` }),
      hints: [`Un número es divisible entre ${k} si ${rules[k]}.`, 'No hace falta dividir: aplica el criterio a cada opción.', 'Descarta las que no cumplan el criterio.'],
      steps: [`Criterio del ${k}: ${rules[k]}.`, `${mult} lo cumple; las demás no.`, `Comprobación: $${mult} \\div ${k} = ${mult / k}$ (exacto).`],
      why: 'Los criterios de divisibilidad ahorran cuentas y revelan la estructura de los números.',
    });
  },

  prime_factors(r, d) {
    const ps = [2, 3, 5, 7, 11, 13];
    const nf = 2 + d;
    const f = [];
    for (let i = 0; i < nf; i++) f.push(r.pick(ps.slice(0, d === 1 ? 3 : 6)));
    const n = f.reduce((a, b) => a * b, 1);
    const fs = f.sort((a, b) => a - b);
    const ans = primeFactors(n);
    const grouped = [...new Set(ans)].map((p) => { const k = ans.filter((x) => x === p).length; return k > 1 ? `${p}^{${k}}` : `${p}`; }).join(' \\cdot ');
    return Q({
      type: 'primefac', answer: ans, answerText: ans.join(' · '),
      prompt: `Descompón **${n}** en factores primos. (Escríbelo como \`2^2 * 3 * 5\`.)`,
      hints: ['Un número primo solo se divide entre 1 y entre sí mismo.', 'Divide entre 2 mientras puedas, luego entre 3, entre 5…', `Empieza probando ${ans[0]}.`],
      steps: [`Divide sucesivamente por primos hasta llegar a 1.`, `$${n} = ${grouped}$`],
      why: 'Todo número tiene una única “huella dactilar” de primos (Teorema Fundamental de la Aritmética).',
      selfcheck: () => ans.reduce((a, b) => a * b, 1) === n && ans.every(isPrime) && fs.length === ans.length,
    });
  },

  gcd_lcm(r, d) {
    const g = r.int(2, 6 + d * 2); let a = r.int(2, 5 + d); let b = r.int(2, 6 + d);
    while (gcd(a, b) !== 1 || a === b) { b = r.int(2, 8 + d); }
    const A = g * a; const B = g * b;
    const useGcd = r.chance();
    const ans = useGcd ? gcd(A, B) : lcm(A, B);
    return Q({
      type: 'numeric', answer: ans,
      prompt: useGcd ? `Calcula el **MCD** (máximo común divisor) de $${A}$ y $${B}$.` : `Calcula el **MCM** (mínimo común múltiplo) de $${A}$ y $${B}$.`,
      hints: [useGcd ? 'El MCD es el mayor número que divide a ambos.' : 'El MCM es el menor número que ambos dividen.', 'Descompón ambos en factores primos.', useGcd ? 'Toma los primos comunes con el menor exponente.' : 'Toma todos los primos con el mayor exponente.'],
      steps: [`$${A} = ${primeFactors(A).join('\\cdot ')}$ y $${B} = ${primeFactors(B).join('\\cdot ')}$`, useGcd ? `Primos comunes con menor exponente → $${ans}$.` : `Todos los primos con mayor exponente → $${ans}$.`, `Relación útil: MCD·MCM = ${A}·${B}`],
      why: 'Sirven para simplificar fracciones y para sincronizar ciclos.',
      selfcheck: () => (useGcd ? A % ans === 0 && B % ans === 0 && gcd(A / ans, B / ans) === 1 : ans % A === 0 && ans % B === 0 && gcd(ans / A, ans / B) === 1),
    });
  },

  frac_simplify(r, d) {
    const g = r.int(2, 4 + d * 2); const a = r.int(1, 9 + d * 3); let b = r.int(2, 12 + d * 3);
    while (gcd(a, b) !== 1 || a >= b) { b = r.int(3, 14 + d * 3); if (a >= b) { b = a + r.int(1, 5); } }
    const f = frac(a * g, b * g);
    return Q({
      type: 'frac', answer: f.n / f.d, answerText: fracStr(f),
      prompt: `Simplifica la fracción $\\frac{${a * g}}{${b * g}}$ hasta su forma irreducible. (Escribe \`a/b\`.)`,
      hints: ['Simplificar es dividir numerador y denominador entre el mismo número.', 'Busca un divisor común (el MCD hace todo de una vez).', `Prueba con ${g}.`],
      steps: [`MCD(${a * g}, ${b * g}) = ${g}`, `$\\frac{${a * g}\\div ${g}}{${b * g}\\div ${g}} = ${fracTex(f)}$`],
      why: 'Una fracción tiene infinitas formas equivalentes; la irreducible es la más clara.',
    });
  },

  frac_ops(r, d) {
    const op = r.pick(d === 1 ? ['+'] : d === 2 ? ['+', '-'] : ['+', '-', '×', '÷']);
    let b = r.int(2, 8); let n1 = r.int(1, b - 1 || 1);
    let dd = d === 1 ? b : r.int(2, 9); while (d > 1 && dd === b) dd = r.int(2, 9);
    let n2 = r.int(1, Math.max(1, dd - 1));
    if (op === '-') { const x = n1 / b; const y = n2 / dd; if (x < y) { [n1, n2] = [n2, n1]; [b, dd] = [dd, b]; } }
    let res; let steps; const A = `\\frac{${n1}}{${b}}`; const B = `\\frac{${n2}}{${dd}}`;
    const L = lcm(b, dd);
    if (op === '+' || op === '-') {
      const nn = (op === '+' ? 1 : -1) * 1;
      const top = (n1 * L) / b + nn * ((n2 * L) / dd);
      res = frac(top, L);
      steps = [`Denominador común: mcm(${b},${dd}) = ${L}`, `$${A} ${op} ${B} = \\frac{${(n1 * L) / b}}{${L}} ${op} \\frac{${(n2 * L) / dd}}{${L}} = \\frac{${top}}{${L}}$`, `Simplificando: $${fracTex(res)}$`];
    } else if (op === '×') { res = frac(n1 * n2, b * dd); steps = [`Se multiplica numerador con numerador y denominador con denominador.`, `$${A}\\cdot ${B} = \\frac{${n1 * n2}}{${b * dd}} = ${fracTex(res)}$`]; }
    else { res = frac(n1 * dd, b * n2); steps = [`Dividir es multiplicar por el inverso.`, `$${A}\\div ${B} = ${A}\\cdot \\frac{${dd}}{${n2}} = ${fracTex(res)}$`]; }
    const sym = op === '×' ? '\\cdot' : op === '÷' ? '\\div' : op;
    const naive = op === '+' ? frac(n1 + n2, b + dd) : null;
    return Q({
      type: 'frac', answer: res.n / res.d, answerText: fracStr(res),
      prompt: `Calcula $${A} ${sym} ${B}$ y simplifica. (Escribe \`a/b\`.)`,
      hints: [op === '+' || op === '-' ? 'Para sumar o restar fracciones necesitas el mismo denominador.' : op === '×' ? 'Multiplicar fracciones es directo: arriba con arriba, abajo con abajo.' : 'Dividir entre una fracción es multiplicar por su inverso.', op === '+' || op === '-' ? `Busca el mcm de ${b} y ${dd}.` : 'Simplifica al final (o antes, cruzando).', 'Reduce el resultado hasta que no se pueda más.'],
      steps,
      why: 'Las fracciones están en recetas, descuentos, probabilidades y todo el álgebra.',
      diagnose: (v) => (naive && Math.abs(v - naive.n / naive.d) < 1e-9 ? { msg: 'Sumaste numeradores con numeradores y denominadores con denominadores. Con fracciones, primero hay que igualar los denominadores.', step: 0 } : null),
    });
  },

  decimal_ops(r, d) {
    const sc = d === 1 ? 10 : 100;
    const a = r.int(11, 99 * d + 20) / sc; const b = r.int(11, 60 * d + 20) / sc;
    const op = r.pick(d === 1 ? ['+', '-'] : ['+', '-', '×']);
    const hi = Math.max(a, b); const lo = Math.min(a, b);
    const ans = op === '+' ? round(a + b, 4) : op === '-' ? round(hi - lo, 4) : round(a * b, 4);
    return Q({
      type: 'numeric', answer: ans, tol: 1e-6,
      prompt: op === '-' ? `Calcula $${fmt(hi)} - ${fmt(lo)}$.` : `Calcula $${fmt(a)} ${op === '×' ? '\\times' : op} ${fmt(b)}$.`,
      hints: [op === '×' ? 'Multiplica como si no hubiera coma y luego coloca la coma.' : 'Alinea las comas, una bajo otra.', op === '×' ? `Cuenta los decimales de ambos factores: ${(String(a).split('.')[1] || '').length + (String(b).split('.')[1] || '').length}.` : 'Completa con ceros si hace falta.', 'Opera como con enteros y baja la coma.'],
      steps: [op === '×' ? 'Multiplica sin comas y luego devuelve la coma contando decimales.' : 'Alinea las comas y opera por columnas.', `Resultado: $${fmt(ans)}$`],
      why: 'Los decimales aparecen en dinero, medidas y mediciones científicas.',
    });
  },

  percent(r, d, opts) {
    const kind = Number(opts?.kind) || r.int(1, d === 1 ? 2 : 4);
    if (kind === 1) {
      const p = r.pick([10, 20, 25, 50, 15, 5, 30, 40]); const base = r.pick([40, 60, 80, 120, 200, 240, 360]);
      return Q({ type: 'numeric', answer: (p * base) / 100, prompt: `¿Cuánto es el **${p}%** de $${base}$?`, hints: ['“Por ciento” significa “por cada cien”.', `${p}% = ${p}/100.`, `Multiplica ${base} por ${p}/100.`], steps: [`$${p}\\% = \\frac{${p}}{100}$`, `$${base}\\cdot \\frac{${p}}{100} = ${(p * base) / 100}$`], why: 'Descuentos, impuestos, propinas, intereses.' });
    }
    if (kind === 2) {
      const price = r.pick([50, 80, 120, 150, 200, 250]); const p = r.pick([10, 20, 25, 30, 40]);
      const ans = price * (1 - p / 100);
      return Q({ type: 'numeric', answer: ans, prompt: `Un artículo cuesta $${price}$ y tiene un descuento del **${p}%**. ¿Cuánto pagas?`, hints: ['Pagas el 100% − descuento.', `Pagas el ${100 - p}% del precio.`, `Calcula ${100 - p}% de ${price}.`], steps: [`Pagas $${100 - p}\\%$ del precio.`, `$${price}\\cdot ${(100 - p) / 100} = ${ans}$`], why: 'Comparar ofertas requiere entender porcentajes.', diagnose: (v) => (Math.abs(v - price * p / 100) < 1e-6 ? { msg: `Calculaste el descuento (${price * p / 100}), pero la pregunta es cuánto PAGAS: resta ese descuento al precio.` } : null) });
    }
    if (kind === 3) {
      const base = r.pick([20, 40, 50, 80, 200]); const part = base * r.pick([0.1, 0.25, 0.5, 0.75, 0.3]);
      const ans = (part / base) * 100;
      return Q({ type: 'numeric', answer: ans, prompt: `¿Qué porcentaje de $${base}$ es $${fmt(part)}$? (Responde solo el número, sin %)`, hints: ['Porcentaje = parte ÷ total × 100.', `Divide ${fmt(part)} entre ${base}.`, 'Multiplica el resultado por 100.'], steps: [`$\\frac{${fmt(part)}}{${base}} = ${fmt(part / base)}$`, `$${fmt(part / base)}\\cdot 100 = ${fmt(ans)}\\%$`], why: 'Interpretar proporciones como porcentajes facilita compararlas.' });
    }
    const p = r.pick([20, 25, 10, 50]); const orig = r.pick([40, 80, 120, 200]);
    const fin = orig * (1 + p / 100);
    return Q({ type: 'numeric', answer: orig, prompt: `Después de un aumento del **${p}%**, un precio quedó en $${fmt(fin)}$. ¿Cuál era el precio original?`, hints: ['Precio final = precio original × (1 + aumento).', `El factor es ${1 + p / 100}.`, 'Divide el precio final entre ese factor.'], steps: [`$P\\cdot ${1 + p / 100} = ${fmt(fin)}$`, `$P = \\frac{${fmt(fin)}}{${1 + p / 100}} = ${orig}$`], why: 'Los cambios porcentuales se “deshacen” dividiendo, no restando el mismo porcentaje.', diagnose: (v) => (Math.abs(v - fin * (1 - p / 100)) < 1e-6 ? { msg: `Restaste el ${p}% del precio final. Pero el ${p}% se calculó sobre el precio ORIGINAL, así que hay que dividir entre ${1 + p / 100}.` } : null) });
  },

  ratio_prop(r, d) {
    const kind = r.int(1, d === 1 ? 1 : 3);
    if (kind === 1) {
      const a = r.int(2, 6); const price = a * r.int(3, 9); const b = a + r.int(2, 6);
      return Q({ type: 'numeric', answer: (price / a) * b, prompt: `Si $${a}$ cuadernos cuestan $${price}$, ¿cuánto cuestan $${b}$ cuadernos?`, hints: ['Es una relación directa: más cuadernos, más dinero.', 'Calcula primero el precio de UN cuaderno.', `${price} ÷ ${a}.`], steps: [`Precio por cuaderno: $\\frac{${price}}{${a}} = ${price / a}$`, `$${b}\\cdot ${price / a} = ${(price / a) * b}$`], why: 'La proporcionalidad directa modela precios, recetas y escalas.' });
    }
    if (kind === 2) {
      const w = r.pick([2, 3, 4, 6]); const days = r.pick([6, 8, 12, 9]); const w2 = r.pick([x => x * 2, x => x * 3])(w);
      return Q({ type: 'numeric', answer: (w * days) / w2, prompt: `$${w}$ obreros terminan una obra en $${days}$ días. ¿En cuántos días la terminarían $${w2}$ obreros (al mismo ritmo)?`, hints: ['Más obreros → menos días: relación inversa.', 'El trabajo total (obreros × días) no cambia.', `${w}·${days} = ${w2}·x.`], steps: [`Trabajo total: $${w}\\cdot ${days} = ${w * days}$`, `$${w2}\\cdot x = ${w * days} \\Rightarrow x = ${(w * days) / w2}$`], why: 'En la proporcionalidad inversa el producto se mantiene constante.', diagnose: (v) => (Math.abs(v - (days * w2) / w) < 1e-6 ? { msg: 'Usaste una regla de tres directa, pero con más obreros el trabajo termina antes (relación inversa).' } : null) });
    }
    const scale = r.pick([50000, 100000, 25000]); const cm = r.int(3, 12);
    return Q({ type: 'numeric', answer: (cm * scale) / 100000, prompt: `En un mapa a escala $1:${scale}$, dos ciudades están a $${cm}$ cm. ¿Cuántos **kilómetros** las separan?`, hints: ['1 cm del mapa son "escala" cm reales.', 'Pasa cm a km: 100 000 cm = 1 km.', `${cm} × ${scale} cm → km.`], steps: [`Distancia real: $${cm}\\cdot ${scale} = ${cm * scale}$ cm`, `$${cm * scale} \\div 100000 = ${(cm * scale) / 100000}$ km`], why: 'Los mapas y los planos usan proporciones.' });
  },

  powers(r, d) {
    const kind = r.int(1, d === 1 ? 2 : 4);
    if (kind === 1) { const a = r.int(2, 6); const n = r.int(2, 4); return Q({ type: 'numeric', answer: a ** n, prompt: `Calcula $${a}^{${n}}$.`, hints: [`$a^n$ significa multiplicar a por sí mismo n veces.`, `Hay ${n} factores iguales a ${a}.`, `${Array(n).fill(a).join(' × ')}`], steps: [`$${a}^{${n}} = ${Array(n).fill(a).join('\\cdot ')} = ${a ** n}$`], why: 'Las potencias describen crecimiento repetido.' }); }
    if (kind === 2) { const a = r.int(2, 9); const m = r.int(2, 6); const n = r.int(2, 6); return Q({ type: 'numeric', answer: m + n, prompt: `Si $${a}^{${m}} \\cdot ${a}^{${n}} = ${a}^{k}$, ¿cuánto vale $k$?`, hints: ['Misma base: puedes combinar los exponentes.', 'Al multiplicar potencias de igual base, los exponentes se suman.', `${m} + ${n}`], steps: [`$a^m\\cdot a^n = a^{m+n}$`, `$k = ${m}+${n} = ${m + n}$`], why: 'Las leyes de exponentes simplifican cuentas enormes.', diagnose: (v) => (v === m * n ? { msg: 'Multiplicaste los exponentes. Eso se hace cuando una potencia se eleva a otra potencia. Aquí (mismas bases multiplicándose) se suman.' } : null) }); }
    if (kind === 3) { const a = r.pick([2, 3, 5, 10]); const n = r.int(1, 3); const f = frac(1, a ** n); return Q({ type: 'frac', answer: f.n / f.d, answerText: fracStr(f), prompt: `Calcula $${a}^{-${n}}$. (Escribe \`a/b\`.)`, hints: ['Un exponente negativo significa “el inverso”.', `$a^{-n} = \\frac{1}{a^n}$`, `Calcula primero $${a}^{${n}}$.`], steps: [`$${a}^{-${n}} = \\frac{1}{${a}^{${n}}} = \\frac{1}{${a ** n}}$`], why: 'Los exponentes negativos describen decrecimiento y escalas pequeñas.' }); }
    const a = r.int(2, 9); return Q({ type: 'numeric', answer: 1, prompt: `¿Cuánto vale $${a}^{0}$?`, hints: ['Usa la ley: $a^m / a^m = a^{m-m}$.', `Cualquier número entre sí mismo es 1.`, '$a^0 = 1$ si $a\\neq 0$.'], steps: [`$\\frac{${a}^3}{${a}^3} = 1$ y también $= ${a}^{3-3} = ${a}^0$`, `Por eso $${a}^0 = 1$.`], why: 'El cero como exponente mantiene coherentes las leyes.' });
  },

  roots(r, d) {
    const kind = r.int(1, d === 1 ? 1 : 3);
    if (kind === 1) { const n = r.int(3, 15); return Q({ type: 'numeric', answer: n, prompt: `Calcula $\\sqrt{${n * n}}$.`, hints: ['Busca un número que multiplicado por sí mismo dé el radicando.', `¿Qué número al cuadrado es ${n * n}?`, `Prueba cerca de ${n}.`], steps: [`$${n}^2 = ${n * n}$, por tanto $\\sqrt{${n * n}} = ${n}$.`], why: 'La raíz es la operación inversa de la potencia.' }); }
    if (kind === 2) { const k = r.int(2, 6); const m = r.pick([2, 3, 5, 6, 7]); return Q({ type: 'numeric', answer: k, prompt: `Simplifica $\\sqrt{${k * k * m}} = a\\sqrt{${m}}$. ¿Cuánto vale $a$?`, hints: ['Busca un cuadrado perfecto que divida a ' + k * k * m + '.', `${k * k * m} = ${k * k} · ${m}`, '$\\sqrt{ab}=\\sqrt a\\sqrt b$'], steps: [`$${k * k * m} = ${k * k}\\cdot ${m}$`, `$\\sqrt{${k * k}\\cdot ${m}} = \\sqrt{${k * k}}\\sqrt{${m}} = ${k}\\sqrt{${m}}$`], why: 'Extraer cuadrados perfectos da la forma más simple de un radical.' }); }
    const n = r.pick([2, 3, 5, 7, 10, 20, 50]); const ans = Math.sqrt(n);
    return Q({ type: 'numeric', answer: ans, tol: 0.06, prompt: `Estima $\\sqrt{${n}}$ con un decimal. (Se acepta un error de 0.05.)`, hints: ['Encuentra entre qué cuadrados perfectos está.', `Está entre $\\sqrt{${Math.floor(ans) ** 2}}$ y $\\sqrt{${(Math.floor(ans) + 1) ** 2}}$.`, 'Prueba valores intermedios: elévalos al cuadrado.'], steps: [`$${Math.floor(ans)}^2 = ${Math.floor(ans) ** 2} < ${n} < ${(Math.floor(ans) + 1) ** 2}$`, `Probando decimales: $\\sqrt{${n}}\\approx ${fmt(ans, 2)}$`], why: 'Estimar antes de usar calculadora detecta errores.' });
  },

  sci_not(r, d) {
    const m = r.int(11, 99) / 10; const e = r.int(2, 8) * (r.chance(0.4) && d > 1 ? -1 : 1);
    const val = +(m * 10 ** e).toPrecision(12);
    const shown = e >= 0 ? val.toLocaleString('en-US').replace(/,/g, ' ') : String(val);
    return Q({ type: 'numeric', answer: e, prompt: `Escribe $${shown}$ como $a\\times 10^{n}$ con $1\\le a<10$. ¿Cuánto vale $n$?`, hints: ['Mueve la coma hasta que quede una sola cifra distinta de cero a la izquierda.', 'Cada lugar que mueves a la izquierda suma 1 al exponente (a la derecha, resta 1).', `Debe quedar ${m} × 10^n.`], steps: [`$${shown} = ${fmt(m)}\\times 10^{${e}}$`, `Entonces $n = ${e}$.`], why: 'La notación científica permite escribir desde átomos hasta galaxias.' });
  },

  classify_number(r) {
    const irr = ['\\sqrt{2}', '\\pi', '\\sqrt{3}', '\\sqrt{5}', 'e'];
    const rat = ['\\frac{22}{7}', '0{,}75', '\\sqrt{49}', '-5', '0{,}\\overline{3}', '\\sqrt{81}', '3{,}14'];
    const c = r.pick(irr);
    return Q({ ...choiceQ(r, { correct: `$${c}$`, wrong: r.sample(rat, 3).map((x) => `$${x}$`), prompt: '¿Cuál de estos números es **irracional** (no se puede escribir como fracción de enteros)?' }), hints: ['Racional = fracción de enteros; sus decimales terminan o se repiten.', 'Una raíz exacta (√49 = 7) es un entero, por lo tanto racional.', 'Los irracionales tienen decimales infinitos que NO se repiten.'], steps: [`$${c}$ tiene un desarrollo decimal infinito sin patrón.`, 'Los demás son enteros, decimales finitos, periódicos o raíces exactas: racionales.'], why: 'Los reales incluyen racionales e irracionales; los complejos amplían aún más el universo.' });
  },

  complex_ops(r, d) {
    const a = r.int(-5, 6); const b = r.nz(-5, 6); const c = r.int(-5, 6); const e = r.nz(-5, 6);
    const kind = d === 1 ? '+' : r.pick(['+', '×']);
    const zs = (re, im) => `${re}${im >= 0 ? '+' : '-'}${Math.abs(im)}i`.replace('+1i', '+i').replace('-1i', '-i');
    const z1 = `(${zs(a, b)})`; const z2 = `(${zs(c, e)})`;
    const ans = kind === '+' ? { re: a + c, im: b + e } : { re: a * c - b * e, im: a * e + b * c };
    return Q({
      type: 'complex', answer: ans, answerText: zs(ans.re, ans.im),
      prompt: `Calcula $${z1} ${kind === '+' ? '+' : '\\cdot'} ${z2}$ y escribe el resultado como \`a+bi\`.`,
      hints: ['Recuerda: $i^2=-1$.', kind === '+' ? 'Suma partes reales con reales e imaginarias con imaginarias.' : 'Distribuye como en un producto de binomios.', kind === '+' ? '' : 'El término $bi\\cdot ei = be\\,i^2 = -be$ pasa a la parte real.'].filter(Boolean),
      steps: kind === '+' ? [`Parte real: ${a}+${par(c)} = ${a + c}`, `Parte imaginaria: ${b}+${par(e)} = ${b + e}`] : [`$(${a}+${b}i)(${c}+${e}i) = ${a * c} + ${a * e}i + ${b * c}i + ${b * e}i^2$`, `Como $i^2=-1$: parte real $= ${a * c} - ${b * e} = ${ans.re}$`, `Parte imaginaria $= ${a * e}+${b * c} = ${ans.im}$`],
      why: 'Los números complejos describen rotaciones, ondas y circuitos de corriente alterna.',
      selfcheck: () => { const re = a * c - b * e; const im = a * e + b * c; return kind === '+' ? ans.re === a + c && ans.im === b + e : ans.re === re && ans.im === im; },
    });
  },
};
