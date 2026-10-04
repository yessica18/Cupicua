// Generadores — 📐 Templo de la Geometría y 🔺 Montañas Trigonométricas
import { Q, choiceQ, gcd, fmt, par, sgn, round, rad, deg, frac, fracTex, fracStr, polyStr } from './gen-core.js';

const TRIPLES = [[3, 4, 5], [5, 12, 13], [8, 15, 17], [7, 24, 25], [6, 8, 10], [9, 12, 15], [20, 21, 29], [12, 16, 20]];

export const geometry = {
  geo_distance(r, d) {
    const t = r.pick(TRIPLES.slice(0, d === 1 ? 2 : 6)); const x1 = r.int(-5, 5); const y1 = r.int(-5, 5);
    const sx = r.chance() ? 1 : -1; const sy = r.chance() ? 1 : -1;
    const x2 = x1 + sx * t[0]; const y2 = y1 + sy * t[1];
    return Q({
      type: 'numeric', answer: t[2],
      prompt: `Calcula la distancia entre $A(${x1}, ${y1})$ y $B(${x2}, ${y2})$.`,
      hints: ['La distancia es la hipotenusa de un triángulo rectángulo imaginario.', '$d = \\sqrt{(x_2-x_1)^2 + (y_2-y_1)^2}$', `Diferencias: Δx = ${x2 - x1}, Δy = ${y2 - y1}.`],
      steps: [`$\\Delta x = ${x2 - x1},\\; \\Delta y = ${y2 - y1}$`, `$d = \\sqrt{${(x2 - x1) ** 2} + ${(y2 - y1) ** 2}} = \\sqrt{${t[2] ** 2}} = ${t[2]}$`],
      why: 'Pitágoras en el plano da la distancia entre dos puntos cualesquiera.',
      selfcheck: () => Math.hypot(x2 - x1, y2 - y1) === t[2],
    });
  },

  midpoint(r) {
    const x1 = r.int(-8, 8); const y1 = r.int(-8, 8); const x2 = x1 + 2 * r.nz(-5, 5); const y2 = y1 + 2 * r.nz(-5, 5);
    const ans = [(x1 + x2) / 2, (y1 + y2) / 2];
    return Q({ type: 'tuple', answer: ans, answerText: `(${ans[0]}, ${ans[1]})`, prompt: `Halla el **punto medio** del segmento de extremos $(${x1}, ${y1})$ y $(${x2}, ${y2})$. Escribe \`x, y\`.`, hints: ['El punto medio está a la misma distancia de los dos extremos.', 'Promedia las coordenadas.', '$M = \\left(\\frac{x_1+x_2}{2}, \\frac{y_1+y_2}{2}\\right)$'], steps: [`$x_M = \\frac{${x1}+${par(x2)}}{2} = ${ans[0]}$`, `$y_M = \\frac{${y1}+${par(y2)}}{2} = ${ans[1]}$`], why: 'El promedio de coordenadas es el centro.' });
  },

  angles(r, d) {
    const a = r.int(20, 80);
    const k = r.int(1, d === 1 ? 2 : 3);
    if (k === 1) return Q({ type: 'numeric', answer: 90 - a, prompt: `El complemento de un ángulo de $${a}^\\circ$ mide… (en grados)`, hints: ['Ángulos complementarios suman 90°.', `90 − ${a}`, 'Dibuja una esquina de 90° dividida en dos.'], steps: [`$90^\\circ - ${a}^\\circ = ${90 - a}^\\circ$`], why: 'Los ángulos son la base de la trigonometría.' });
    if (k === 2) return Q({ type: 'numeric', answer: 180 - a, prompt: `El suplemento de un ángulo de $${a}^\\circ$ mide… (en grados)`, hints: ['Ángulos suplementarios suman 180° (un ángulo llano).', `180 − ${a}`, 'Piensa en una recta con un ángulo y su vecino.'], steps: [`$180^\\circ - ${a}^\\circ = ${180 - a}^\\circ$`], why: 'Una recta forma 180°.' });
    return Q({ type: 'numeric', answer: 180 - a, prompt: `Dos rectas se cruzan. Un ángulo mide $${180 - a}^\\circ$. ¿Cuánto mide el ángulo **opuesto por el vértice** a él?`, hints: ['Los ángulos opuestos por el vértice son iguales.', 'Los vecinos suman 180°, pero el opuesto es “el de enfrente”.', `El de enfrente mide lo mismo que ${180 - a}°.`], steps: [`El opuesto mide lo mismo: $${180 - a}^\\circ$.`], why: 'Los ángulos opuestos por el vértice son congruentes.' });
  },

  triangle_angle(r, d) {
    const a = r.int(30, 80); const b = r.int(30, 100 - (a > 60 ? 20 : 0));
    const c = 180 - a - b;
    if (d >= 2 && r.chance()) {
      const base = r.int(40, 80);
      return Q({ type: 'numeric', answer: 180 - 2 * base, prompt: `En un triángulo isósceles los ángulos de la base miden $${base}^\\circ$. ¿Cuánto mide el ángulo del vértice?`, hints: ['Los ángulos de un triángulo suman 180°.', 'Los dos ángulos de la base son iguales.', `180 − ${base} − ${base}`], steps: [`$180^\\circ - ${base}^\\circ - ${base}^\\circ = ${180 - 2 * base}^\\circ$`], why: 'La suma de ángulos interiores de un triángulo es siempre 180°.' });
    }
    return Q({ type: 'numeric', answer: c, prompt: `Dos ángulos de un triángulo miden $${a}^\\circ$ y $${b}^\\circ$. ¿Cuánto mide el tercero?`, hints: ['Los ángulos interiores de un triángulo suman 180°.', 'Resta los dos que conoces.', `180 − ${a} − ${b}`], steps: [`$180^\\circ - ${a}^\\circ - ${b}^\\circ = ${c}^\\circ$`], why: 'La suma de ángulos de un triángulo no depende de su forma.' });
  },

  pythag(r, d) {
    const t = r.pick(TRIPLES.slice(0, d === 1 ? 2 : 8)); const hyp = d > 1 && r.chance();
    const shortLeg = t[0]; const longLeg = t[1];
    if (!hyp) return Q({ type: 'numeric', answer: t[2], prompt: `Un triángulo rectángulo tiene catetos de $${shortLeg}$ y $${longLeg}$. ¿Cuánto mide la **hipotenusa**?`, hints: ['La hipotenusa es el lado opuesto al ángulo recto.', '$a^2 + b^2 = c^2$', `${shortLeg}² + ${longLeg}² = ${shortLeg ** 2 + longLeg ** 2}`], steps: [`$c^2 = ${shortLeg}^2 + ${longLeg}^2 = ${shortLeg ** 2} + ${longLeg ** 2} = ${t[2] ** 2}$`, `$c = ${t[2]}$`], why: 'El teorema de Pitágoras vincula los tres lados de todo triángulo rectángulo.', diagnose: (v) => (Math.abs(v - (shortLeg + longLeg)) < 1e-9 ? { msg: 'Sumaste los catetos directamente. Pitágoras suma sus CUADRADOS y luego saca la raíz.' } : null), selfcheck: () => shortLeg ** 2 + longLeg ** 2 === t[2] ** 2 });
    return Q({ type: 'numeric', answer: longLeg, prompt: `En un triángulo rectángulo la hipotenusa mide $${t[2]}$ y un cateto mide $${shortLeg}$. ¿Cuánto mide el otro cateto?`, hints: ['La hipotenusa es siempre el lado más largo.', '$a^2 = c^2 - b^2$', `${t[2]}² − ${shortLeg}²`], steps: [`$b^2 = ${t[2]}^2 - ${shortLeg}^2 = ${t[2] ** 2 - shortLeg ** 2}$`, `$b = ${longLeg}$`], why: 'Pitágoras también sirve para hallar un lado que no puedes medir.', selfcheck: () => t[2] ** 2 - shortLeg ** 2 === longLeg ** 2 });
  },

  quad_area(r, d) {
    const kind = r.int(1, d === 1 ? 2 : 4);
    const l = r.int(4, 15); const w = r.int(3, 12);
    if (kind === 1) return Q({ type: 'numeric', answer: l * w, prompt: `Un rectángulo mide $${l}$ m de largo y $${w}$ m de ancho. ¿Cuál es su **área** en m²?`, hints: ['Área = cuántos cuadrados de 1 m² caben.', 'base × altura', `${l} × ${w}`], steps: [`$A = ${l}\\cdot ${w} = ${l * w}\\ \\text{m}^2$`], why: 'El área mide superficie: pisos, pinturas, terrenos.' });
    if (kind === 2) return Q({ type: 'numeric', answer: 2 * (l + w), prompt: `¿Cuál es el **perímetro** de un rectángulo de $${l}$ m por $${w}$ m?`, hints: ['El perímetro es la suma de todos los lados.', 'Hay dos lados de cada medida.', `2(${l} + ${w})`], steps: [`$P = 2(${l}+${w}) = ${2 * (l + w)}$ m`], why: 'El perímetro mide el borde: cercas, marcos.' });
    if (kind === 3) { const b1 = r.int(4, 12); const b2 = b1 + r.int(2, 8); const h = r.int(3, 9); return Q({ type: 'numeric', answer: ((b1 + b2) * h) / 2, prompt: `Un trapecio tiene bases de $${b1}$ y $${b2}$ y altura $${h}$. Halla su área.`, hints: ['Promedia las dos bases y multiplica por la altura.', '$A = \\frac{(B+b)\\,h}{2}$', `(${b1} + ${b2}) · ${h} ÷ 2`], steps: [`$A = \\frac{(${b1}+${b2})\\cdot ${h}}{2} = ${((b1 + b2) * h) / 2}$`], why: 'El trapecio se puede ver como un rectángulo de base promedio.' }); }
    const d1 = 2 * r.int(3, 9); const d2 = 2 * r.int(2, 8);
    return Q({ type: 'numeric', answer: (d1 * d2) / 2, prompt: `Un rombo tiene diagonales de $${d1}$ y $${d2}$. ¿Cuál es su área?`, hints: ['Las diagonales de un rombo son perpendiculares.', '$A = \\frac{D\\cdot d}{2}$', `${d1} · ${d2} ÷ 2`], steps: [`$A = \\frac{${d1}\\cdot ${d2}}{2} = ${(d1 * d2) / 2}$`], why: 'Las diagonales revelan el área de rombos y cometas.' });
  },

  polygon_angles(r, d) {
    const n = r.int(5, 12);
    const k = r.int(1, d === 1 ? 1 : 3);
    if (k === 1) return Q({ type: 'numeric', answer: (n - 2) * 180, prompt: `¿Cuánto suman los ángulos interiores de un polígono de **${n} lados**? (en grados)`, hints: ['Divide el polígono en triángulos desde un vértice.', `Salen ${n - 2} triángulos.`, 'Cada triángulo suma 180°.'], steps: [`$(n-2)\\cdot 180^\\circ = ${n - 2}\\cdot 180^\\circ = ${(n - 2) * 180}^\\circ$`], why: 'Todo polígono se arma con triángulos.' });
    if (k === 2) { const m = r.pick([5, 6, 8, 9, 10, 12, 15]); return Q({ type: 'numeric', answer: ((m - 2) * 180) / m, prompt: `¿Cuánto mide cada ángulo interior de un polígono **regular** de ${m} lados? (grados)`, hints: ['Suma total ÷ número de ángulos.', `Suma: (${m}−2)·180.`, 'En un polígono regular todos los ángulos son iguales.'], steps: [`$\\frac{(${m}-2)\\cdot 180}{${m}} = ${((m - 2) * 180) / m}^\\circ$`], why: 'Los polígonos regulares teselan (o no) el plano según su ángulo.' }); }
    return Q({ type: 'numeric', answer: (n * (n - 3)) / 2, prompt: `¿Cuántas **diagonales** tiene un polígono de ${n} lados?`, hints: ['Desde cada vértice salen diagonales a todos menos a sí mismo y a sus 2 vecinos.', `Desde cada vértice: ${n - 3}.`, 'Cada diagonal se contó dos veces.'], steps: [`$\\frac{n(n-3)}{2} = \\frac{${n}\\cdot ${n - 3}}{2} = ${(n * (n - 3)) / 2}$`], why: 'Contar con estructura evita listar todo.' });
  },

  circle(r, d) {
    const rr = r.int(2, 12); const kind = r.int(1, 3);
    if (kind === 1) return Q({ type: 'numeric', answer: 2 * Math.PI * rr, relTol: 0.01, prompt: `Calcula la **circunferencia** de un círculo de radio $${rr}$. (Usa π ≈ 3,14; se acepta 1% de error.)`, hints: ['La circunferencia es la longitud del borde.', '$C = 2\\pi r$', `2 · π · ${rr}`], steps: [`$C = 2\\pi\\cdot ${rr} = ${fmt(2 * Math.PI * rr, 2)}$`], why: 'π es la razón entre la circunferencia y el diámetro de CUALQUIER círculo.' });
    if (kind === 2) return Q({ type: 'numeric', answer: Math.PI * rr * rr, relTol: 0.01, prompt: `Calcula el **área** de un círculo de radio $${rr}$. (π ≈ 3,14; se acepta 1% de error.)`, hints: ['El área mide la superficie interior.', '$A = \\pi r^2$', `π · ${rr}²`], steps: [`$A = \\pi\\cdot ${rr}^2 = ${fmt(Math.PI * rr * rr, 2)}$`], why: 'El área crece con el cuadrado del radio.', diagnose: (v) => (Math.abs(v - 2 * Math.PI * rr) / (2 * Math.PI * rr) < 0.02 ? { msg: 'Calculaste la circunferencia (2πr). El área usa $\\pi r^2$.' } : null) });
    const dm = 2 * rr; return Q({ type: 'numeric', answer: rr, prompt: `Un círculo tiene **diámetro** $${dm}$. ¿Cuánto mide su radio?`, hints: ['El diámetro atraviesa el círculo por el centro.', 'Radio = diámetro ÷ 2', `${dm} ÷ 2`], steps: [`$r = \\frac{${dm}}{2} = ${rr}$`], why: 'Radio y diámetro son lo primero que se identifica.' });
  },

  volume(r, d) {
    const kind = r.int(1, d === 1 ? 2 : 5);
    const a = r.int(2, 9); const b = r.int(2, 9); const h = r.int(3, 12);
    if (kind === 1) return Q({ type: 'numeric', answer: a * b * h, prompt: `Un prisma rectangular mide $${a}\\times ${b}\\times ${h}$ cm. ¿Cuál es su **volumen** en cm³?`, hints: ['Volumen = área de la base × altura.', `Base: ${a} × ${b}.`, `Multiplica por ${h}.`], steps: [`$V = ${a}\\cdot ${b}\\cdot ${h} = ${a * b * h}$`], why: 'El volumen cuenta cubitos de 1 cm³.' });
    if (kind === 2) return Q({ type: 'numeric', answer: a ** 3, prompt: `¿Cuál es el volumen de un cubo de arista $${a}$ cm?`, hints: ['Un cubo tiene tres medidas iguales.', '$V = a^3$', `${a}·${a}·${a}`], steps: [`$V = ${a}^3 = ${a ** 3}$`], why: 'Si duplicas la arista, el volumen se multiplica por 8.' });
    if (kind === 3) return Q({ type: 'numeric', answer: Math.PI * a * a * h, relTol: 0.01, prompt: `Un cilindro tiene radio $${a}$ y altura $${h}$. Halla su volumen. (π ≈ 3,14; 1% de error)`, hints: ['Volumen = área de la base × altura.', 'La base es un círculo: $\\pi r^2$.', `π · ${a}² · ${h}`], steps: [`$V = \\pi r^2 h = \\pi\\cdot ${a * a}\\cdot ${h} = ${fmt(Math.PI * a * a * h, 1)}$`], why: 'Tanques, latas y tuberías son cilindros.' });
    if (kind === 4) return Q({ type: 'numeric', answer: (Math.PI * a * a * h) / 3, relTol: 0.01, prompt: `Un cono tiene radio $${a}$ y altura $${h}$. Halla su volumen. (π ≈ 3,14; 1% de error)`, hints: ['Un cono es un tercio del cilindro con la misma base y altura.', '$V = \\frac{1}{3}\\pi r^2 h$', `π · ${a}² · ${h} ÷ 3`], steps: [`$V = \\frac{\\pi\\cdot ${a * a}\\cdot ${h}}{3} = ${fmt((Math.PI * a * a * h) / 3, 1)}$`], why: 'Arquímedes descubrió estas razones entre cono, esfera y cilindro.' });
    return Q({ type: 'numeric', answer: (4 / 3) * Math.PI * a ** 3, relTol: 0.01, prompt: `Halla el volumen de una esfera de radio $${a}$. (π ≈ 3,14; 1% de error)`, hints: ['Volumen de esfera: $\\frac{4}{3}\\pi r^3$.', `${a}³ = ${a ** 3}`, 'Multiplica por 4π/3.'], steps: [`$V = \\frac{4}{3}\\pi\\cdot ${a ** 3} = ${fmt((4 / 3) * Math.PI * a ** 3, 1)}$`], why: 'La esfera encierra el mayor volumen con la menor superficie.' });
  },

  similar(r, d) {
    const k = r.pick([2, 3, 1.5, 2.5, 4]); const s = r.int(3, 10);
    if (d === 1 || r.chance(0.6)) return Q({ type: 'numeric', answer: s * k, prompt: `Dos triángulos son **semejantes**. Un lado del primero mide $${s}$ y su correspondiente en el segundo, que está ampliado con razón $${k}$. ¿Cuánto mide ese lado del segundo?`, hints: ['Semejantes: misma forma, distinto tamaño.', 'Todos los lados se multiplican por la misma razón.', `${s} × ${k}`], steps: [`$${s}\\cdot ${k} = ${s * k}$`], why: 'La semejanza permite medir alturas inaccesibles con sombras.' });
    return Q({ type: 'numeric', answer: k * k, prompt: `Dos figuras semejantes tienen razón de semejanza $${k}$. ¿Por qué factor se multiplica su **área**?`, hints: ['Longitudes ×k; áreas ×k²; volúmenes ×k³.', `${k}²`, 'El área es de dos dimensiones.'], steps: [`Área × $k^2 = ${k}^2 = ${k * k}$`], why: 'Por eso los animales grandes no pueden ser simplemente copias ampliadas de los pequeños.' });
  },

  congruence() {
    return Q({ ...choiceQ({ shuffle: (a) => a, sample: (a, n) => a.slice(0, n) }, { correct: 'LAL (lado–ángulo–lado)', wrong: ['AAA (ángulo–ángulo–ángulo)', 'LLA (dos lados y un ángulo no comprendido)', 'Ninguno basta'], prompt: 'Dos triángulos tienen dos lados iguales y el **ángulo comprendido entre ellos** igual. ¿Qué criterio garantiza que son congruentes?' }), hints: ['Congruentes = idénticos en forma y tamaño.', 'Recuerda los criterios: LLL, LAL, ALA.', 'El ángulo está “entre” los dos lados.'], steps: ['Criterio LAL: dos lados y el ángulo que forman bastan.', 'AAA solo garantiza semejanza, no igualdad de tamaño.'], why: 'La congruencia es la base de las demostraciones geométricas.' });
  },

  transform(r, d) {
    const x = r.nz(-6, 6); const y = r.nz(-6, 6);
    const kind = r.int(1, d === 1 ? 2 : 4);
    if (kind === 1) { const a = r.nz(-4, 5); const b = r.nz(-4, 5); return Q({ type: 'tuple', answer: [x + a, y + b], prompt: `Traslada el punto $(${x}, ${y})$ con el vector $(${a}, ${b})$. Escribe \`x, y\`.`, hints: ['Trasladar es mover sin girar ni deformar.', 'Suma el vector a las coordenadas.', `(${x}+${par(a)}, ${y}+${par(b)})`], steps: [`$(${x}+${par(a)},\\ ${y}+${par(b)}) = (${x + a}, ${y + b})$`], why: 'Las traslaciones mueven objetos en gráficos y videojuegos.' }); }
    if (kind === 2) return Q({ type: 'tuple', answer: [x, -y], prompt: `Refleja el punto $(${x}, ${y})$ respecto al **eje x**. Escribe \`x, y\`.`, hints: ['Reflejar es como mirarse en un espejo.', 'El espejo es el eje x: x se mantiene.', 'Solo cambia el signo de y.'], steps: [`$(x, y)\\to(x, -y) = (${x}, ${-y})$`], why: 'Los espejos conservan distancias pero invierten orientación.' });
    if (kind === 3) return Q({ type: 'tuple', answer: [-y, x], prompt: `Gira el punto $(${x}, ${y})$ **90° en sentido antihorario** alrededor del origen. Escribe \`x, y\`.`, hints: ['Un giro de 90° intercambia coordenadas.', '$(x, y)\\to(-y, x)$', `Usa x=${x}, y=${y}.`], steps: [`$(${x}, ${y})\\to(-${par(y)}, ${x}) = (${-y}, ${x})$`], why: 'Las rotaciones se escriben con matrices en álgebra lineal.' });
    const k = r.pick([2, 3, -1, 0.5]);
    return Q({ type: 'tuple', answer: [x * k, y * k], prompt: `Aplica una **homotecia** de razón $${k}$ con centro en el origen al punto $(${x}, ${y})$. Escribe \`x, y\`.`, hints: ['La homotecia amplía o reduce desde el centro.', 'Multiplica ambas coordenadas por la razón.', `${k}·${par(x)} y ${k}·${par(y)}`], steps: [`$(${k}\\cdot ${par(x)},\\ ${k}\\cdot ${par(y)}) = (${fmt(x * k)}, ${fmt(y * k)})$`], why: 'Escalar es la base de la semejanza.' });
  },

  /* ───────────── TRIGONOMETRÍA ───────────── */
  angle_class(r) {
    const a = r.pick([25, 40, 60, 90, 110, 135, 170, 180, 200, 300]);
    const name = a < 90 ? 'agudo' : a === 90 ? 'recto' : a < 180 ? 'obtuso' : a === 180 ? 'llano' : 'cóncavo (reflejo)';
    return Q({ ...choiceQ({ shuffle: (x) => x, sample: (x, n) => x.slice(0, n) }, { correct: name, wrong: ['agudo', 'recto', 'obtuso', 'llano', 'cóncavo (reflejo)'].filter((x) => x !== name), prompt: `Un ángulo de $${a}^\\circ$ es…` }), hints: ['Compara con 90° y 180°.', 'Agudo < 90°, recto = 90°, obtuso entre 90° y 180°.', 'Llano = 180°; más de 180° es cóncavo.'], steps: [`${a}° es ${name}.`], why: 'Clasificar ángulos ayuda a estimar antes de calcular.' });
  },

  deg_rad(r, d) {
    const opts = [30, 45, 60, 90, 120, 135, 150, 180, 210, 225, 240, 270, 300, 315, 330, 360];
    const dg = r.pick(opts.slice(0, d === 1 ? 7 : 16));
    const f = frac(dg, 180);
    const ans = f.d === 1 ? (f.n === 1 ? 'pi' : `${f.n}pi`) : `${f.n === 1 ? '' : f.n}pi/${f.d}`;
    const radTex = f.d === 1 ? `${f.n === 1 ? '' : f.n}\\pi` : `\\frac{${f.n === 1 ? '' : f.n}\\pi}{${f.d}}`;
    const radText = ans.replace('pi', 'π');
    if (r.chance(0.35)) {
      return Q({ type: 'numeric', answer: dg, prompt: `Convierte $${radTex}$ radianes a **grados**.`, hints: ['π radianes = 180°.', 'Multiplica por 180/π.', 'Sustituye π por 180°.'], steps: [`$${radTex}\\cdot \\frac{180^\\circ}{\\pi} = ${dg}^\\circ$`], why: 'Los radianes miden el ángulo por la longitud del arco: son el idioma natural del cálculo.' });
    }
    return Q({ type: 'expr', vars: [], answer: ans, answerText: radText, prompt: `Convierte $${dg}^\\circ$ a **radianes** (en función de π; escribe por ejemplo \`5pi/6\`).`, hints: ['π radianes = 180°.', 'Multiplica por π/180 y simplifica.', `${dg}/180 se reduce a ${fracStr(f)}.`], steps: [`$${dg}^\\circ\\cdot \\frac{\\pi}{180^\\circ} = ${radTex}$`], why: 'Cambiar de grados a radianes es un cambio de unidades como de metros a km.' });
  },

  trig_ratio(r, d) {
    const t = r.pick(TRIPLES.slice(0, 4)); const fn = r.pick(['\\sin', '\\cos', '\\tan']);
    const [op, ad, hy] = t;
    const f = fn === '\\sin' ? frac(op, hy) : fn === '\\cos' ? frac(ad, hy) : frac(op, ad);
    const def = fn === '\\sin' ? 'cateto opuesto / hipotenusa' : fn === '\\cos' ? 'cateto adyacente / hipotenusa' : 'cateto opuesto / cateto adyacente';
    return Q({
      type: 'frac', answer: f.n / f.d, answerText: fracStr(f),
      prompt: `En un triángulo rectángulo, el cateto **opuesto** a $\\theta$ mide $${op}$, el **adyacente** mide $${ad}$ y la hipotenusa $${hy}$. Calcula $${fn}\\,\\theta$. (Escribe \`a/b\`.)`,
      hints: ['SOH-CAH-TOA: seno = opuesto/hipotenusa, coseno = adyacente/hipotenusa, tangente = opuesto/adyacente.', `Aquí piden ${def}.`, 'Simplifica la fracción.'],
      steps: [`$${fn}\\,\\theta = \\frac{\\text{${def.split(' / ')[0]}}}{\\text{${def.split(' / ')[1]}}}$`, `$= ${fracTex(f)}$`],
      why: 'Las razones trigonométricas conectan ángulos con longitudes.',
      selfcheck: () => op ** 2 + ad ** 2 === hy ** 2,
    });
  },

  right_solve(r, d) {
    const ang = r.pick([30, 37, 45, 53, 60]); const h = r.int(8, 40);
    const useSin = r.chance();
    const ans = useSin ? h * Math.sin(rad(ang)) : h * Math.cos(rad(ang));
    return Q({
      type: 'numeric', answer: ans, relTol: 0.015, tol: 0.06,
      prompt: `En un triángulo rectángulo la hipotenusa mide $${h}$ y uno de los ángulos agudos mide $${ang}^\\circ$. ¿Cuánto mide el cateto **${useSin ? 'opuesto' : 'adyacente'}** a ese ángulo? (2 decimales; se acepta 1,5% de error)`,
      hints: [useSin ? 'Opuesto e hipotenusa se relacionan con el seno.' : 'Adyacente e hipotenusa se relacionan con el coseno.', useSin ? '$\\text{opuesto} = h\\cdot\\sin\\theta$' : '$\\text{adyacente} = h\\cdot\\cos\\theta$', 'Calculadora en modo GRADOS.'],
      steps: [useSin ? `$\\text{op} = ${h}\\sin ${ang}^\\circ = ${fmt(ans, 2)}$` : `$\\text{ady} = ${h}\\cos ${ang}^\\circ = ${fmt(ans, 2)}$`],
      why: 'Así se calculan alturas de edificios, pendientes y distancias sin medirlas.',
    });
  },

  special_angles(r, d) {
    const table = { '\\sin 30^\\circ': ['1/2', 0.5], '\\cos 60^\\circ': ['1/2', 0.5], '\\sin 45^\\circ': ['sqrt(2)/2', Math.SQRT2 / 2], '\\cos 45^\\circ': ['sqrt(2)/2', Math.SQRT2 / 2], '\\sin 60^\\circ': ['sqrt(3)/2', Math.sqrt(3) / 2], '\\cos 30^\\circ': ['sqrt(3)/2', Math.sqrt(3) / 2], '\\tan 45^\\circ': ['1', 1], '\\tan 30^\\circ': ['sqrt(3)/3', Math.sqrt(3) / 3], '\\tan 60^\\circ': ['sqrt(3)', Math.sqrt(3)], '\\sin 90^\\circ': ['1', 1], '\\cos 0^\\circ': ['1', 1], '\\cos 90^\\circ': ['0', 0] };
    const keys = Object.keys(table); const k = r.pick(keys.slice(0, d === 1 ? 6 : keys.length));
    const [txt, val] = table[k];
    return Q({ type: 'numeric', answer: val, tol: 0.006, answerText: txt.replace('sqrt', '√'), prompt: `Calcula $${k}$. (Puedes escribir \`sqrt(3)/2\` o el decimal con 2–3 cifras.)`, hints: ['Estos ángulos salen de triángulos especiales (30-60-90 y 45-45-90).', 'Recuerda la tabla: 1/2, √2/2, √3/2.', 'Dibuja el triángulo y aplica SOH-CAH-TOA.'], steps: [`$${k} = ${txt.replace('sqrt(3)', '\\sqrt{3}').replace('sqrt(2)', '\\sqrt{2}').replace(/(\S+)\/(\S+)/, '\\frac{$1}{$2}')}\\approx ${fmt(val, 3)}$`], why: 'Los ángulos notables aparecen en estructuras, óptica y señales.' });
  },

  unit_circle(r, d) {
    const angs = [120, 135, 150, 210, 225, 240, 300, 315, 330];
    const a = r.pick(angs); const useSin = r.chance();
    const ref = a < 180 ? 180 - a : a < 270 ? a - 180 : 360 - a;
    const base = { 30: 0.5, 45: Math.SQRT2 / 2, 60: Math.sqrt(3) / 2 };
    const sinV = (a > 180 ? -1 : 1) * (ref === 30 ? 0.5 : ref === 45 ? base[45] : base[60]);
    const cosB = ref === 30 ? base[60] : ref === 45 ? base[45] : 0.5;
    const cosV = (a > 90 && a < 270 ? -1 : 1) * cosB;
    const ans = useSin ? sinV : cosV;
    return Q({ type: 'numeric', answer: ans, tol: 0.006, prompt: `Usando el **círculo unitario**, calcula $${useSin ? '\\sin' : '\\cos'}\\,${a}^\\circ$ (decimal con 2–3 cifras, o \`-sqrt(3)/2\`).`, hints: ['Busca el ángulo de referencia (la distancia al eje x).', `El ángulo de referencia de ${a}° es ${ref}°.`, `Signo: en este cuadrante ${useSin ? 'sen' : 'cos'} es ${ans < 0 ? 'negativo' : 'positivo'}.`], steps: [`Referencia: $${ref}^\\circ$`, `Valor absoluto: ${fmt(Math.abs(ans), 3)}; signo ${ans < 0 ? '−' : '+'}.`, `$${useSin ? '\\sin' : '\\cos'}\\,${a}^\\circ = ${fmt(ans, 3)}$`], why: 'El círculo unitario convierte la trigonometría en un dibujo.', selfcheck: () => Math.abs(ans - (useSin ? Math.sin(rad(a)) : Math.cos(rad(a)))) < 1e-9 });
  },

  quadrant_signs(r) {
    const q = r.int(1, 4); const fn = r.pick(['sen', 'cos', 'tan']);
    const sign = { sen: [1, 1, -1, -1], cos: [1, -1, -1, 1], tan: [1, -1, 1, -1] }[fn][q - 1];
    return Q({ ...choiceQ({ shuffle: (a) => a, sample: (a, n) => a.slice(0, n) }, { correct: sign > 0 ? 'Positivo' : 'Negativo', wrong: [sign > 0 ? 'Negativo' : 'Positivo', 'Cero', 'No está definido'], prompt: `Un ángulo está en el cuadrante **${['I', 'II', 'III', 'IV'][q - 1]}**. ¿Cuál es el signo de su **${fn === 'sen' ? 'seno' : fn === 'cos' ? 'coseno' : 'tangente'}**?` }), hints: ['sen ~ coordenada y; cos ~ coordenada x.', 'La tangente es sen/cos.', 'Cuadrantes: I (+,+), II (−,+), III (−,−), IV (+,−).'], steps: [`En el cuadrante ${['I', 'II', 'III', 'IV'][q - 1]}: x ${[1, -1, -1, 1][q - 1] > 0 ? '>' : '<'} 0 y y ${[1, 1, -1, -1][q - 1] > 0 ? '>' : '<'} 0.`], why: 'Los signos te dicen hacia dónde apunta el ángulo.' });
  },

  identity(r, d) {
    const t = r.pick([[3, 4, 5], [5, 12, 13], [8, 15, 17]]);
    const f = frac(t[1], t[2]);
    return Q({ type: 'frac', answer: f.n / f.d, answerText: fracStr(f), prompt: `Si $\\sin\\theta = \\frac{${t[0]}}{${t[2]}}$ y $\\theta$ está en el **primer cuadrante**, calcula $\\cos\\theta$. (Escribe \`a/b\`.)`, hints: ['Identidad pitagórica: $\\sin^2\\theta + \\cos^2\\theta = 1$.', '$\\cos\\theta = \\sqrt{1-\\sin^2\\theta}$', 'En el cuadrante I el coseno es positivo.'], steps: [`$\\cos^2\\theta = 1 - \\left(\\frac{${t[0]}}{${t[2]}}\\right)^2 = \\frac{${t[1] ** 2}}{${t[2] ** 2}}$`, `$\\cos\\theta = ${fracTex(f)}$`], why: 'Esta identidad es el teorema de Pitágoras en el círculo unitario.' });
  },

  law_sines(r) {
    const A = r.pick([30, 40, 45, 50]); const B = r.pick([60, 70, 80, 75]); const a = r.int(6, 20);
    const b = (a * Math.sin(rad(B))) / Math.sin(rad(A));
    return Q({ type: 'numeric', answer: b, relTol: 0.015, prompt: `En un triángulo, $A = ${A}^\\circ$, $B = ${B}^\\circ$ y el lado $a = ${a}$ (opuesto a A). Halla el lado $b$ (opuesto a B). (2 decimales; 1,5% de error)`, hints: ['Ley de senos: cada lado es proporcional al seno de su ángulo opuesto.', '$\\frac{a}{\\sin A} = \\frac{b}{\\sin B}$', `$b = \\frac{a\\sin B}{\\sin A}$`], steps: [`$b = \\frac{${a}\\sin ${B}^\\circ}{\\sin ${A}^\\circ} = ${fmt(b, 2)}$`], why: 'La ley de senos sirve en topografía y navegación (triangulación).' });
  },

  law_cosines(r) {
    const a = r.int(5, 15); const b = r.int(5, 15); const C = r.pick([40, 60, 75, 120]);
    const c = Math.sqrt(a * a + b * b - 2 * a * b * Math.cos(rad(C)));
    return Q({ type: 'numeric', answer: c, relTol: 0.015, prompt: `Dos lados de un triángulo miden $${a}$ y $${b}$ y el ángulo entre ellos mide $${C}^\\circ$. ¿Cuánto mide el tercer lado? (2 decimales; 1,5% de error)`, hints: ['Es como Pitágoras con un término de corrección.', '$c^2 = a^2 + b^2 - 2ab\\cos C$', 'Calcula con cuidado el signo del coseno.'], steps: [`$c^2 = ${a}^2 + ${b}^2 - 2\\cdot ${a}\\cdot ${b}\\cos ${C}^\\circ = ${fmt(c * c, 2)}$`, `$c = ${fmt(c, 2)}$`], why: 'Generaliza Pitágoras a cualquier triángulo (si C=90°, cos C=0).' });
  },

  trig_graph(r) {
    const A = r.int(2, 6); const B = r.pick([2, 3, 4, 0.5, 1]);
    const kind = r.chance();
    return Q({ type: 'numeric', answer: kind ? A : (2 * Math.PI) / B, tol: 0.02, prompt: kind ? `¿Cuál es la **amplitud** de $y = ${A}\\sin(${B === 1 ? '' : B}x)$?` : `¿Cuál es el **periodo** de $y = ${A}\\sin(${B === 1 ? '' : B}x)$? (decimal; π ≈ 3,14)`, hints: kind ? ['La amplitud es la altura máxima de la onda.', 'En $y=A\\sin(Bx)$ es |A|.', 'El seno oscila entre −1 y 1.'] : ['El periodo es lo que tarda en repetirse.', 'Periodo = $\\frac{2\\pi}{|B|}$', `B = ${B}`], steps: [kind ? `Amplitud $=|A| = ${A}$` : `$T = \\frac{2\\pi}{${B}} \\approx ${fmt((2 * Math.PI) / B, 2)}$`], why: 'Amplitud y periodo describen sonido, luz y señales.' });
  },

  trig_eq(r) {
    const k = r.pick([[0.5, [30, 150], '\\sin x = \\tfrac12'], [Math.SQRT2 / 2, [45, 135], '\\sin x = \\tfrac{\\sqrt2}{2}'], [0.5, [60, 300], '\\cos x = \\tfrac12']]);
    return Q({ type: 'set', answer: k[1], prompt: `Resuelve $${k[2]}$ para $0^\\circ \\le x < 360^\\circ$. Escribe las soluciones separadas por coma (en grados).`, hints: ['Hay dos soluciones en una vuelta.', 'Busca el ángulo de referencia y refléjalo según el cuadrante.', 'Seno positivo: cuadrantes I y II. Coseno positivo: I y IV.'], steps: [`Soluciones: $x = ${k[1][0]}^\\circ$ y $x = ${k[1][1]}^\\circ$.`], why: 'Resolver ecuaciones trigonométricas es encontrar todos los ángulos que cumplen una condición.' });
  },

  elevation(r) {
    const h = r.int(15, 80); const ang = r.pick([30, 40, 45, 60]);
    const dist = h / Math.tan(rad(ang));
    return Q({ type: 'numeric', answer: dist, relTol: 0.02, prompt: `Desde un punto del suelo, el ángulo de elevación a la cima de una torre de $${h}$ m es $${ang}^\\circ$. ¿A qué distancia horizontal está de la base? (1 decimal; 2% de error)`, hints: ['Dibuja el triángulo rectángulo: altura (opuesto), distancia (adyacente).', 'Opuesto y adyacente se relacionan con la tangente.', '$\\tan\\theta = \\frac{h}{d}$'], steps: [`$d = \\frac{h}{\\tan\\theta} = \\frac{${h}}{\\tan ${ang}^\\circ} = ${fmt(dist, 1)}$ m`], why: 'Así se mide lo que no se puede alcanzar.' });
  },
};
