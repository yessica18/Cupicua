// Generadores — 🔬 Laboratorio de Mecánica, ⚡ Central Electromagnética, 🎓 Academia de Ingeniería
import { Q, choiceQ, fmt, par, round, rad, frac, fracStr } from './gen-core.js';

const g = 9.8;

export const physics = {
  unit_conv(r, d) {
    const kind = r.int(1, d === 1 ? 2 : 4);
    if (kind === 1) { const v = r.pick([36, 72, 90, 108, 54, 18]); return Q({ type: 'numeric', answer: v / 3.6, tol: 0.01, prompt: `Convierte $${v}$ km/h a **m/s**.`, hints: ['1 km = 1000 m y 1 h = 3600 s.', 'Multiplica por 1000/3600 (= dividir entre 3,6).', `${v} ÷ 3,6`], steps: [`$${v}\\,\\frac{\\text{km}}{\\text{h}}\\cdot\\frac{1000\\text{ m}}{1\\text{ km}}\\cdot\\frac{1\\text{ h}}{3600\\text{ s}} = ${fmt(v / 3.6, 2)}$ m/s`], why: 'Las unidades se cancelan como fracciones: el análisis dimensional evita errores.' }); }
    if (kind === 2) { const cm = r.pick([250, 340, 1250, 75]); return Q({ type: 'numeric', answer: cm / 100, tol: 0.001, prompt: `Convierte $${cm}$ cm a **metros**.`, hints: ['100 cm = 1 m.', 'Divide entre 100.', 'Mueve la coma dos lugares a la izquierda.'], steps: [`$${cm}\\text{ cm}\\cdot\\frac{1\\text{ m}}{100\\text{ cm}} = ${cm / 100}$ m`], why: 'En ciencia siempre se trabaja en unidades coherentes (SI).' }); }
    if (kind === 3) { const t = r.pick([2, 3, 5, 7]); return Q({ type: 'numeric', answer: t * 60, prompt: `Convierte $${t}$ minutos a **segundos**.`, hints: ['1 min = 60 s.', 'Multiplica.', `${t} × 60`], steps: [`$${t}\\cdot 60 = ${t * 60}$ s`], why: 'El tiempo en física se mide en segundos.' }); }
    const gr = r.pick([250, 1500, 3200]); return Q({ type: 'numeric', answer: gr / 1000, tol: 0.001, prompt: `Convierte $${gr}$ g a **kilogramos**.`, hints: ['1 kg = 1000 g.', 'Divide entre 1000.', ''].filter(Boolean), steps: [`$${gr}\\text{ g}\\div 1000 = ${gr / 1000}$ kg`], why: 'La masa en el SI se expresa en kg.' });
  },

  vec_comp(r) {
    const F = r.int(10, 60); const th = r.pick([30, 37, 45, 53, 60]); const useX = r.chance();
    const ans = useX ? F * Math.cos(rad(th)) : F * Math.sin(rad(th));
    return Q({ type: 'numeric', answer: ans, relTol: 0.015, tol: 0.06, prompt: `Una fuerza de $${F}$ N forma $${th}^\\circ$ con la horizontal. ¿Cuánto vale su componente **${useX ? 'horizontal' : 'vertical'}**? (N, 2 decimales)`, hints: ['Descompón la fuerza en un triángulo rectángulo.', useX ? '$F_x = F\\cos\\theta$' : '$F_y = F\\sin\\theta$', 'Calculadora en grados.'], steps: [useX ? `$F_x = ${F}\\cos ${th}^\\circ = ${fmt(ans, 2)}$ N` : `$F_y = ${F}\\sin ${th}^\\circ = ${fmt(ans, 2)}$ N`], why: 'Descomponer vectores permite aplicar las leyes de Newton eje por eje.' });
  },

  kinematics(r, d) {
    const v0 = r.int(0, 15); const a = r.int(1, 6); const t = r.int(2, 8);
    const kind = r.int(1, d === 1 ? 1 : 3);
    if (kind === 1) return Q({ type: 'numeric', answer: v0 + a * t, prompt: `Un móvil parte con $v_0=${v0}$ m/s y acelera a $a=${a}$ m/s². ¿Qué velocidad tiene tras $${t}$ s?`, hints: ['Aceleración = cambio de velocidad por segundo.', '$v = v_0 + at$', `${v0} + ${a}·${t}`], steps: [`$v = ${v0} + ${a}\\cdot ${t} = ${v0 + a * t}$ m/s`], why: 'La cinemática describe el movimiento sin preguntar por sus causas.' });
    if (kind === 2) return Q({ type: 'numeric', answer: v0 * t + 0.5 * a * t * t, prompt: `Con $v_0=${v0}$ m/s y $a=${a}$ m/s², ¿qué **distancia** recorre en $${t}$ s?`, hints: ['Hay dos aportes: el de la velocidad inicial y el de acelerar.', '$x = v_0t + \\tfrac12 at^2$', `${v0}·${t} + ½·${a}·${t}²`], steps: [`$x = ${v0}\\cdot ${t} + \\frac12\\cdot ${a}\\cdot ${t}^2 = ${v0 * t + 0.5 * a * t * t}$ m`], why: 'El área bajo la gráfica v–t es el desplazamiento.', diagnose: (v) => (Math.abs(v - (v0 + a * t) * t) < 1e-6 ? { msg: 'Usaste la velocidad FINAL como si fuera constante. Como la velocidad cambia, usa $x=v_0t+\\frac12at^2$.' } : null) });
    const v = v0 + a * t; return Q({ type: 'numeric', answer: (v * v - v0 * v0) / (2 * a), prompt: `Un cuerpo con $v_0=${v0}$ m/s acelera a $${a}$ m/s² hasta alcanzar $${v}$ m/s. ¿Qué distancia recorrió?`, hints: ['No conoces el tiempo: usa la relación sin t.', '$v^2 = v_0^2 + 2a\\,\\Delta x$', 'Despeja Δx.'], steps: [`$\\Delta x = \\frac{${v}^2-${v0}^2}{2\\cdot ${a}} = ${(v * v - v0 * v0) / (2 * a)}$ m`], why: 'Elegir la ecuación adecuada ahorra pasos.' });
  },

  free_fall(r) {
    const t = r.pick([1, 2, 3, 4]); const useH = r.chance();
    if (useH) return Q({ type: 'numeric', answer: 0.5 * g * t * t, relTol: 0.01, prompt: `Se suelta una piedra desde el reposo. ¿Qué altura cae en $${t}$ s? ($g=9{,}8$ m/s², sin aire; 1 decimal)`, hints: ['Caída libre: aceleración constante g hacia abajo.', '$h = \\tfrac12 g t^2$', `½·9,8·${t}²`], steps: [`$h = \\frac12\\cdot 9{,}8\\cdot ${t}^2 = ${fmt(0.5 * g * t * t, 2)}$ m`], why: 'Galileo mostró que todos los cuerpos caen igual (sin aire).' });
    const h = r.pick([20, 45, 80, 125]); const tt = Math.sqrt((2 * h) / g);
    return Q({ type: 'numeric', answer: tt, relTol: 0.015, prompt: `¿Cuánto tarda en caer un objeto soltado desde $${h}$ m? ($g=9{,}8$; 2 decimales)`, hints: ['Despeja t de $h = \\tfrac12 g t^2$.', '$t = \\sqrt{2h/g}$', `√(2·${h}/9,8)`], steps: [`$t = \\sqrt{\\frac{2\\cdot ${h}}{9{,}8}} = ${fmt(tt, 2)}$ s`], why: 'La misma fórmula sirve para estimar profundidades de pozos.' });
  },

  projectile(r) {
    const v0 = r.pick([10, 15, 20, 30]); const th = r.pick([30, 45, 60]);
    const R = (v0 * v0 * Math.sin(2 * rad(th))) / g;
    return Q({ type: 'numeric', answer: R, relTol: 0.02, prompt: `Se lanza un proyectil a $${v0}$ m/s con ángulo $${th}^\\circ$ sobre terreno plano. ¿Cuál es su **alcance** horizontal? ($g=9{,}8$; 1 decimal; 2% de error)`, hints: ['El movimiento horizontal es uniforme; el vertical, uniformemente acelerado.', '$R = \\frac{v_0^2\\sin 2\\theta}{g}$', 'Prueba el laboratorio de mecánica para ver la trayectoria.'], steps: [`$R = \\frac{${v0}^2\\sin(${2 * th}^\\circ)}{9{,}8} = ${fmt(R, 2)}$ m`], why: 'La trayectoria parabólica combina álgebra, trigonometría y física.' });
  },

  newton(r, d) {
    const m = r.int(2, 20); const a = r.int(1, 8); const F = m * a;
    const kind = r.int(1, d === 1 ? 1 : 3);
    if (kind === 1) return Q({ type: 'numeric', answer: F, prompt: `¿Qué fuerza neta se necesita para acelerar una masa de $${m}$ kg a $${a}$ m/s²?`, hints: ['Segunda ley de Newton.', '$F = ma$', `${m}·${a}`], steps: [`$F = ${m}\\cdot ${a} = ${F}$ N`], why: 'La fuerza neta determina cómo cambia el movimiento.' });
    if (kind === 2) return Q({ type: 'numeric', answer: a, prompt: `Una fuerza neta de $${F}$ N actúa sobre una masa de $${m}$ kg. ¿Cuál es su aceleración?`, hints: ['$a = F/m$', 'Más masa, menos aceleración.', `${F} ÷ ${m}`], steps: [`$a = \\frac{${F}}{${m}} = ${a}$ m/s²`], why: 'Inercia: la masa se resiste a cambiar su movimiento.' });
    const mu = r.pick([0.1, 0.2, 0.3]); const Fa = r.int(30, 80); const mm = r.int(5, 15);
    const net = Fa - mu * mm * g;
    return Q({ type: 'numeric', answer: net / mm, relTol: 0.02, tol: 0.03, prompt: `Un bloque de $${mm}$ kg es empujado con $${Fa}$ N sobre una superficie con rozamiento $\\mu=${mu}$. ¿Cuál es su aceleración? ($g=9{,}8$; 2 decimales)`, hints: ['Dibuja las fuerzas: empuje, rozamiento, peso, normal.', 'Rozamiento: $f=\\mu N=\\mu mg$.', '$a = (F - f)/m$'], steps: [`$f = ${mu}\\cdot ${mm}\\cdot 9{,}8 = ${fmt(mu * mm * g, 2)}$ N`, `$a = \\frac{${Fa} - ${fmt(mu * mm * g, 2)}}{${mm}} = ${fmt(net / mm, 2)}$ m/s²`], why: 'Los diagramas de cuerpo libre son la herramienta central de la mecánica.' });
  },

  incline(r) {
    const th = r.pick([20, 30, 37, 45]); const a = g * Math.sin(rad(th));
    return Q({ type: 'numeric', answer: a, relTol: 0.015, prompt: `Un bloque desliza **sin rozamiento** por un plano inclinado $${th}^\\circ$. ¿Cuál es su aceleración? ($g=9{,}8$; 2 decimales)`, hints: ['Solo la componente del peso paralela al plano acelera el bloque.', '$a = g\\sin\\theta$', `9,8·sen ${th}°`], steps: [`$a = 9{,}8\\sin ${th}^\\circ = ${fmt(a, 2)}$ m/s²`], why: 'Rampas y pendientes: la trigonometría decide la fuerza.' });
  },

  work_energy(r, d) {
    const kind = r.int(1, d === 1 ? 2 : 4);
    const m = r.int(2, 10); const v = r.int(3, 12); const h = r.int(2, 20); const F = r.int(10, 50); const dist = r.int(2, 10);
    if (kind === 1) return Q({ type: 'numeric', answer: 0.5 * m * v * v, prompt: `Calcula la **energía cinética** de $${m}$ kg moviéndose a $${v}$ m/s. (J)`, hints: ['La energía cinética depende de la masa y del CUADRADO de la velocidad.', '$K=\\tfrac12 mv^2$', `½·${m}·${v}²`], steps: [`$K = \\frac12\\cdot ${m}\\cdot ${v}^2 = ${0.5 * m * v * v}$ J`], why: 'Duplicar la velocidad cuadruplica la energía: por eso importa tanto en la seguridad vial.' });
    if (kind === 2) return Q({ type: 'numeric', answer: F * dist, prompt: `Una fuerza de $${F}$ N empuja un objeto $${dist}$ m en su misma dirección. ¿Cuánto **trabajo** realiza? (J)`, hints: ['Trabajo = fuerza × distancia (en la dirección de la fuerza).', '$W = Fd\\cos\\theta$ con θ = 0°.', `${F}·${dist}`], steps: [`$W = ${F}\\cdot ${dist} = ${F * dist}$ J`], why: 'El trabajo es la energía transferida por una fuerza.' });
    if (kind === 3) return Q({ type: 'numeric', answer: m * g * h, relTol: 0.01, prompt: `Calcula la **energía potencial gravitatoria** de $${m}$ kg a $${h}$ m de altura. ($g=9{,}8$; J)`, hints: ['Depende de la altura sobre el nivel de referencia.', '$U = mgh$', `${m}·9,8·${h}`], steps: [`$U = ${m}\\cdot 9{,}8\\cdot ${h} = ${fmt(m * g * h, 1)}$ J`], why: 'La energía almacenada se puede convertir en movimiento.' });
    return Q({ type: 'numeric', answer: Math.sqrt(2 * g * h), relTol: 0.015, prompt: `Un objeto cae desde $${h}$ m (sin aire). ¿Con qué velocidad llega al suelo? (m/s; $g=9{,}8$)`, hints: ['Conservación de la energía: $U\\to K$.', '$mgh = \\tfrac12mv^2$ → la masa se cancela.', '$v=\\sqrt{2gh}$'], steps: [`$v = \\sqrt{2\\cdot 9{,}8\\cdot ${h}} = ${fmt(Math.sqrt(2 * g * h), 2)}$ m/s`], why: 'La conservación de la energía simplifica problemas muy complejos.' });
  },

  momentum(r, d) {
    const m1 = r.int(1, 6); const v1 = r.int(2, 10); const m2 = r.int(1, 6);
    const v = (m1 * v1) / (m1 + m2);
    if (d === 1) return Q({ type: 'numeric', answer: m1 * v1, prompt: `Calcula la **cantidad de movimiento** de $${m1}$ kg a $${v1}$ m/s. (kg·m/s)`, hints: ['Es “cuánto movimiento” lleva un cuerpo.', '$p = mv$', `${m1}·${v1}`], steps: [`$p = ${m1}\\cdot ${v1} = ${m1 * v1}$`], why: 'El momento se conserva en choques y explosiones.' });
    return Q({ type: 'numeric', answer: v, tol: 0.02, prompt: `Un carrito de $${m1}$ kg a $${v1}$ m/s choca y se **pega** con otro de $${m2}$ kg en reposo. ¿Con qué velocidad se mueven juntos? (2 decimales)`, hints: ['En un choque se conserva la cantidad de movimiento total.', '$m_1v_1 = (m_1+m_2)v$', `${m1}·${v1} = ${m1 + m2}·v`], steps: [`$v = \\frac{${m1}\\cdot ${v1}}{${m1 + m2}} = ${fmt(v, 2)}$ m/s`], why: 'La conservación del momento explica choques, cohetes y billar.' });
  },

  rotation(r) {
    const rr = r.pick([0.2, 0.3, 0.5, 1]); const F = r.int(10, 60); const th = r.pick([30, 90, 90, 60]);
    return Q({ type: 'numeric', answer: rr * F * Math.sin(rad(th)), relTol: 0.015, tol: 0.03, prompt: `Una fuerza de $${F}$ N se aplica a $${rr}$ m del eje, formando $${th}^\\circ$ con el brazo. ¿Cuál es el **torque**? (N·m)`, hints: ['El torque mide la capacidad de girar algo.', '$\\tau = rF\\sin\\theta$', `${rr}·${F}·sen ${th}°`], steps: [`$\\tau = ${rr}\\cdot ${F}\\cdot\\sin ${th}^\\circ = ${fmt(rr * F * Math.sin(rad(th)), 2)}$ N·m`], why: 'Llaves, puertas y motores funcionan con torques.' });
  },

  fluids_heat_waves(r, d) {
    const kind = r.int(1, 4);
    if (kind === 1) { const h = r.int(2, 30); return Q({ type: 'numeric', answer: 1000 * g * h, relTol: 0.01, prompt: `¿Qué **presión** (manométrica) hay a $${h}$ m de profundidad en agua ($\\rho=1000$ kg/m³, $g=9{,}8$)? (Pa)`, hints: ['La presión crece con la profundidad.', '$P=\\rho g h$', `1000·9,8·${h}`], steps: [`$P = 1000\\cdot 9{,}8\\cdot ${h} = ${fmt(1000 * g * h, 0)}$ Pa`], why: 'Presas, submarinos y buceo dependen de la presión hidrostática.' }); }
    if (kind === 2) { const m = r.int(1, 5); const dT = r.int(10, 60); return Q({ type: 'numeric', answer: m * 4186 * dT, relTol: 0.01, prompt: `¿Cuánto calor (J) hace falta para calentar $${m}$ kg de agua $${dT}$ °C? ($c=4186$ J/kg·°C)`, hints: ['Más masa o más ΔT, más energía.', '$Q = mc\\Delta T$', `${m}·4186·${dT}`], steps: [`$Q = ${m}\\cdot 4186\\cdot ${dT} = ${m * 4186 * dT}$ J`], why: 'La termodinámica cuantifica el calor.' }); }
    if (kind === 3) { const f = r.pick([2, 5, 10, 20, 50]); const lam = r.pick([0.5, 1, 2, 4]); return Q({ type: 'numeric', answer: f * lam, prompt: `Una onda tiene frecuencia $${f}$ Hz y longitud de onda $${lam}$ m. ¿Cuál es su **velocidad**? (m/s)`, hints: ['Velocidad = cuántas crestas por segundo × distancia entre crestas.', '$v = f\\lambda$', `${f}·${lam}`], steps: [`$v = ${f}\\cdot ${lam} = ${f * lam}$ m/s`], why: 'La relación v=fλ vale para ondas de sonido, luz y agua.' }); }
    const k = r.pick([100, 200, 400]); const x = r.pick([0.05, 0.1, 0.2]);
    return Q({ type: 'numeric', answer: k * x, tol: 0.01, prompt: `Un resorte de $k=${k}$ N/m se estira $${x}$ m. ¿Qué fuerza ejerce? (N)`, hints: ['Ley de Hooke.', '$F = kx$', `${k}·${x}`], steps: [`$F = ${k}\\cdot ${x} = ${k * x}$ N`], why: 'Los resortes son el modelo básico de elasticidad.' });
  },

  centripetal(r) {
    const v = r.pick([4, 6, 8, 10, 12]); const rr = r.pick([2, 4, 5, 8, 10]);
    return Q({ type: 'numeric', answer: (v * v) / rr, tol: 0.01, prompt: `Un auto toma una curva de radio $${rr}$ m a $${v}$ m/s. ¿Cuál es su aceleración centrípeta? (m/s²)`, hints: ['Al girar, la velocidad cambia de dirección: hay aceleración.', '$a_c = v^2/r$', `${v}²/${rr}`], steps: [`$a_c = \\frac{${v}^2}{${rr}} = ${fmt((v * v) / rr, 2)}$ m/s²`], why: 'Curvas, satélites y centrifugadoras comparten esta fórmula.' });
  },
};

const k = 8.99e9;
const sci = (v) => { const e = Math.floor(Math.log10(Math.abs(v))); return `${fmt(v / 10 ** e, 3)}\\times 10^{${e}}`; };

export const electro = {
  coulomb(r) {
    const q1 = r.int(1, 9); const q2 = r.int(1, 9); const d = r.pick([0.1, 0.2, 0.5, 1]);
    const F = (k * q1 * 1e-6 * q2 * 1e-6) / (d * d);
    return Q({ type: 'numeric', answer: F, relTol: 0.02, prompt: `Dos cargas de $${q1}\\ \\mu$C y $${q2}\\ \\mu$C están separadas $${d}$ m. ¿Qué fuerza eléctrica se ejercen? (N; $k=8{,}99\\times10^9$; acepto 2% de error)`, hints: ['Ley de Coulomb: la fuerza depende del producto de cargas y del inverso del cuadrado de la distancia.', '$F = k\\frac{q_1q_2}{r^2}$', 'Pasa μC a C: 1 μC = 10⁻⁶ C.'], steps: [`$F = 8{,}99\\times10^9\\cdot\\frac{${q1}\\times10^{-6}\\cdot ${q2}\\times10^{-6}}{${d}^2} = ${sci(F)}$ N`], why: 'La fuerza eléctrica mantiene unidos a los átomos.' });
  },

  efield(r) {
    const q = r.int(1, 9); const d = r.pick([0.1, 0.2, 0.5, 1]);
    const E = (k * q * 1e-6) / (d * d);
    return Q({ type: 'numeric', answer: E, relTol: 0.02, prompt: `¿Qué **campo eléctrico** crea una carga de $${q}\\ \\mu$C a $${d}$ m de distancia? (N/C; $k=8{,}99\\times10^9$; 2% de error)`, hints: ['El campo es la fuerza por unidad de carga.', '$E = k\\frac{q}{r^2}$', '1 μC = 10⁻⁶ C.'], steps: [`$E = 8{,}99\\times10^9\\cdot\\frac{${q}\\times10^{-6}}{${d}^2} = ${sci(E)}$ N/C`], why: 'El campo es una “propiedad del espacio” creada por la carga.' });
  },

  ohm(r, d) {
    const V = r.pick([6, 9, 12, 24]); const R = r.pick([2, 3, 4, 6, 8, 12]);
    const kind = r.int(1, 3);
    if (kind === 1) return Q({ type: 'numeric', answer: V / R, tol: 0.01, prompt: `Una batería de $${V}$ V alimenta una resistencia de $${R}\\ \\Omega$. ¿Qué **corriente** circula? (A)`, hints: ['Ley de Ohm.', '$V = IR \\Rightarrow I = V/R$', `${V} ÷ ${R}`], steps: [`$I = \\frac{${V}}{${R}} = ${fmt(V / R, 3)}$ A`], why: 'Voltaje, corriente y resistencia son las tres variables básicas de un circuito.' });
    if (kind === 2) return Q({ type: 'numeric', answer: (V * V) / R, tol: 0.01, prompt: `¿Qué **potencia** disipa una resistencia de $${R}\\ \\Omega$ conectada a $${V}$ V? (W)`, hints: ['Potencia = voltaje × corriente.', '$P = V^2/R$', `${V}²/${R}`], steps: [`$P = \\frac{${V}^2}{${R}} = ${fmt((V * V) / R, 2)}$ W`], why: 'La potencia dice cuánto calor genera un componente.' });
    const R2 = r.pick([3, 6, 12]);
    return Q({ type: 'numeric', answer: (R * R2) / (R + R2), tol: 0.02, prompt: `Dos resistencias de $${R}\\ \\Omega$ y $${R2}\\ \\Omega$ se conectan en **paralelo**. ¿Cuál es la resistencia equivalente? (Ω, 2 decimales)`, hints: ['En paralelo la corriente tiene más caminos: la resistencia total baja.', '$\\frac{1}{R_{eq}} = \\frac1{R_1}+\\frac1{R_2}$', 'Para dos: $R_{eq} = \\frac{R_1R_2}{R_1+R_2}$.'], steps: [`$R_{eq} = \\frac{${R}\\cdot ${R2}}{${R}+${R2}} = ${fmt((R * R2) / (R + R2), 3)}\\ \\Omega$`], why: 'Así se combinan resistencias en circuitos reales.', diagnose: (v) => (Math.abs(v - (R + R2)) < 1e-6 ? { msg: 'Sumaste las resistencias: eso es para conexiones en SERIE. En paralelo se suman los inversos.' } : null) });
  },

  capacitor(r) {
    const C = r.pick([2, 5, 10, 47]); const V = r.pick([5, 9, 12]);
    return Q({ type: 'numeric', answer: 0.5 * C * 1e-6 * V * V, relTol: 0.02, prompt: `Un capacitor de $${C}\\ \\mu$F está cargado a $${V}$ V. ¿Qué energía almacena? (J; escribe por ejemplo \`2.5e-4\`)`, hints: ['La energía se guarda en el campo eléctrico.', '$U=\\tfrac12CV^2$', '1 μF = 10⁻⁶ F.'], steps: [`$U = \\frac12\\cdot ${C}\\times10^{-6}\\cdot ${V}^2 = ${sci(0.5 * C * 1e-6 * V * V)}$ J`], why: 'Los capacitores almacenan energía en flashes de cámara y electrónica.' });
  },

  magnetic(r) {
    const q = r.pick([1, 2, 5]); const v = r.pick([1e5, 2e5, 5e5]); const B = r.pick([0.1, 0.5, 1]);
    const F = q * 1e-6 * v * B;
    return Q({ type: 'numeric', answer: F, relTol: 0.02, prompt: `Una carga de $${q}\\ \\mu$C se mueve a $${(v / 1e5) * 1}\\times10^5$ m/s perpendicular a un campo magnético de $${B}$ T. ¿Qué fuerza siente? (N; escribe p. ej. \`1e-3\`)`, hints: ['El campo magnético desvía cargas en movimiento.', '$F = qvB\\sin\\theta$ con θ = 90°.', '1 μC = 10⁻⁶ C.'], steps: [`$F = ${q}\\times10^{-6}\\cdot ${v}\\cdot ${B} = ${sci(F)}$ N`], why: 'Así funcionan motores eléctricos y espectrómetros de masas.' });
  },

  faraday(r) {
    const N = r.pick([10, 50, 100, 200]); const dPhi = r.pick([0.02, 0.05, 0.1]); const dt = r.pick([0.1, 0.5, 2]);
    const emf = N * (dPhi / dt);
    return Q({ type: 'numeric', answer: emf, relTol: 0.02, prompt: `El flujo magnético a través de una bobina de $${N}$ vueltas cambia $${dPhi}$ Wb en $${dt}$ s. ¿Cuál es la magnitud de la **fem inducida**? (V)`, hints: ['Ley de Faraday: un flujo que cambia induce voltaje.', '$|\\varepsilon| = N\\frac{\\Delta\\Phi}{\\Delta t}$', `${N}·${dPhi}/${dt}`], steps: [`$\\varepsilon = ${N}\\cdot\\frac{${dPhi}}{${dt}} = ${fmt(emf, 3)}$ V`], why: 'Generadores, transformadores y cargadores inalámbricos usan la inducción.' });
  },

  em_wave(r) {
    const f = r.pick([[100, 'MHz', 1e8], [2.4, 'GHz', 2.4e9], [5, 'GHz', 5e9], [900, 'MHz', 9e8]]);
    const lam = 3e8 / f[2];
    return Q({ type: 'numeric', answer: lam, relTol: 0.02, prompt: `Una señal de $${f[0]}$ ${f[1]} viaja a $c = 3\\times10^8$ m/s. ¿Cuál es su **longitud de onda**? (m, 3 decimales)`, hints: ['Las ondas electromagnéticas cumplen $c = f\\lambda$.', '$\\lambda = c/f$', `Pasa ${f[1]} a Hz.`], steps: [`$\\lambda = \\frac{3\\times10^8}{${f[2]}} = ${fmt(lam, 4)}$ m`], why: 'La longitud de onda define el tamaño de las antenas.' });
  },

  elec_potential(r) {
    const q = r.int(1, 9); const d = r.pick([0.1, 0.5, 1, 2]);
    const V = (k * q * 1e-6) / d;
    return Q({ type: 'numeric', answer: V, relTol: 0.02, prompt: `¿Qué **potencial eléctrico** crea una carga de $${q}\\ \\mu$C a $${d}$ m? (V; $k=8{,}99\\times10^9$)`, hints: ['El potencial es energía por unidad de carga.', '$V = k\\frac{q}{r}$', '1 μC = 10⁻⁶ C.'], steps: [`$V = 8{,}99\\times10^9\\cdot\\frac{${q}\\times10^{-6}}{${d}} = ${sci(V)}$ V`], why: 'Voltaje es una diferencia de potencial: lo que impulsa la corriente.' });
  },
};

/** Proyectos de ingeniería multi-parte (cada parte reutiliza datos del escenario). */
export const projects = {
  bridge(r) {
    const half = r.pick([3, 4, 6, 8, 5]); const rise = r.pick([4, 3, 8, 12, 12]);
    const hyp = Math.hypot(half, rise);
    const load = r.pick([2000, 3000, 4000, 5000]); // N total en el centro
    const th = (Math.atan2(rise, half) * 180) / Math.PI;
    const T = load / 2 / Math.sin(Math.atan2(rise, half));
    return {
      multipart: true, title: 'El puente colgante',
      scenario: `Debes diseñar un **puente tirante**: dos cables parten desde la cima de una torre de **${rise} m** y llegan a puntos en la calzada a **${half} m** de la torre (uno a cada lado). En el centro actúa una carga de **${load} N**.`,
      parts: [
        Q({ type: 'numeric', answer: hyp, tol: 0.01, relTol: 0.005, prompt: `**Parte 1 · Geometría.** ¿Cuánto mide cada cable? (m, 2 decimales)`, hints: ['Cable, torre y calzada forman un triángulo rectángulo.', 'Usa Pitágoras.', `√(${half}² + ${rise}²)`], steps: [`$L = \\sqrt{${half}^2+${rise}^2} = ${fmt(hyp, 3)}$ m`], why: 'Primero modelamos la forma.' }),
        Q({ type: 'numeric', answer: th, tol: 0.5, prompt: `**Parte 2 · Trigonometría.** ¿Qué ángulo forma cada cable con la horizontal? (grados, 1 decimal)`, hints: ['Tangente = opuesto/adyacente.', `tan θ = ${rise}/${half}`, 'Usa arctan.'], steps: [`$\\theta = \\arctan\\frac{${rise}}{${half}} = ${fmt(th, 1)}^\\circ$`], why: 'El ángulo determina cómo se reparte la fuerza.' }),
        Q({ type: 'numeric', answer: T, relTol: 0.02, prompt: `**Parte 3 · Física.** La carga de ${load} N se reparte entre los dos cables. ¿Qué **tensión** soporta cada uno? (N) (Equilibrio vertical: $2T\\sin\\theta = ${load}$)`, hints: ['En equilibrio, la suma de fuerzas verticales es 0.', '$T = \\frac{W}{2\\sin\\theta}$', `sen θ = ${rise}/${fmt(hyp, 3)}`], steps: [`$\\sin\\theta = \\frac{${rise}}{${fmt(hyp, 3)}} = ${fmt(rise / hyp, 3)}$`, `$T = \\frac{${load}}{2\\cdot ${fmt(rise / hyp, 3)}} = ${fmt(T, 1)}$ N`], why: 'Álgebra + geometría + trigonometría + estática = ingeniería civil.' }),
      ],
    };
  },
  trajectory(r) {
    const v0 = r.pick([20, 30, 40]); const th = r.pick([30, 45, 60]);
    const T = (2 * v0 * Math.sin(rad(th))) / g; const R = v0 * Math.cos(rad(th)) * T; const H = (v0 * Math.sin(rad(th))) ** 2 / (2 * g);
    return {
      multipart: true, title: 'Trayectoria de un dron de rescate',
      scenario: `Un cañón de rescate lanza un paquete a **${v0} m/s** con un ángulo de **${th}°** (g = 9,8 m/s²; sin aire).`,
      parts: [
        Q({ type: 'numeric', answer: v0 * Math.cos(rad(th)), relTol: 0.015, prompt: '**Parte 1.** ¿Cuál es la componente horizontal de la velocidad? (m/s)', hints: ['Descompón el vector.', '$v_x=v_0\\cos\\theta$', 'Calculadora en grados.'], steps: [`$v_x = ${v0}\\cos ${th}^\\circ = ${fmt(v0 * Math.cos(rad(th)), 2)}$`], why: 'Descomponer vectores.' }),
        Q({ type: 'numeric', answer: T, relTol: 0.02, prompt: '**Parte 2.** ¿Cuánto tiempo está en el aire? (s)', hints: ['Sube y baja: tiempo total = 2·(tiempo de subida).', '$T = \\frac{2v_0\\sin\\theta}{g}$', 'Usa v_y inicial.'], steps: [`$T = \\frac{2\\cdot ${v0}\\sin ${th}^\\circ}{9{,}8} = ${fmt(T, 2)}$ s`], why: 'Cinemática vertical.' }),
        Q({ type: 'numeric', answer: R, relTol: 0.02, prompt: '**Parte 3.** ¿Qué distancia horizontal recorre? (m)', hints: ['Movimiento horizontal uniforme.', '$R = v_x\\cdot T$', 'Usa tus resultados anteriores.'], steps: [`$R = ${fmt(v0 * Math.cos(rad(th)), 2)}\\cdot ${fmt(T, 2)} = ${fmt(R, 1)}$ m`], why: 'Combinar las dos direcciones.' }),
        Q({ type: 'numeric', answer: H, relTol: 0.02, prompt: '**Parte 4.** ¿Qué altura máxima alcanza? (m)', hints: ['En el punto más alto, $v_y = 0$.', '$H = \\frac{(v_0\\sin\\theta)^2}{2g}$', 'Es como una caída libre invertida.'], steps: [`$H = \\frac{(${fmt(v0 * Math.sin(rad(th)), 2)})^2}{19{,}6} = ${fmt(H, 2)}$ m`], why: 'Energía y cinemática dan lo mismo.' }),
      ],
    };
  },
  circuit(r) {
    const V = r.pick([12, 24]); const R1 = r.pick([4, 6, 8]); const R2 = r.pick([12, 6, 4]); const R3 = r.pick([3, 6, 9]);
    const Rp = (R1 * R2) / (R1 + R2); const Rt = Rp + R3; const I = V / Rt; const Vp = I * Rp;
    return {
      multipart: true, title: 'Tu primer circuito',
      scenario: `Una fuente de **${V} V** alimenta un circuito: R₁ = ${R1} Ω y R₂ = ${R2} Ω están **en paralelo**, y esa pareja está **en serie** con R₃ = ${R3} Ω.`,
      parts: [
        Q({ type: 'numeric', answer: Rp, tol: 0.02, prompt: '**Parte 1.** ¿Cuál es la resistencia equivalente de R₁ y R₂ en paralelo? (Ω)', hints: ['En paralelo se suman los inversos.', '$R_p = \\frac{R_1R_2}{R_1+R_2}$', 'Álgebra de fracciones.'], steps: [`$R_p = \\frac{${R1}\\cdot ${R2}}{${R1 + R2}} = ${fmt(Rp, 3)}$ Ω`], why: 'Fracciones en acción.' }),
        Q({ type: 'numeric', answer: Rt, tol: 0.02, prompt: '**Parte 2.** ¿Cuál es la resistencia total del circuito? (Ω)', hints: ['En serie, las resistencias se suman.', '$R_t = R_p + R_3$', ''].filter(Boolean), steps: [`$R_t = ${fmt(Rp, 3)} + ${R3} = ${fmt(Rt, 3)}$ Ω`], why: 'Serie + paralelo.' }),
        Q({ type: 'numeric', answer: I, tol: 0.02, prompt: '**Parte 3.** ¿Qué corriente entrega la fuente? (A, 2 decimales)', hints: ['Ley de Ohm con la resistencia total.', '$I = V/R_t$', ''].filter(Boolean), steps: [`$I = \\frac{${V}}{${fmt(Rt, 3)}} = ${fmt(I, 3)}$ A`], why: 'Ley de Ohm.' }),
        Q({ type: 'numeric', answer: Vp, tol: 0.05, prompt: '**Parte 4.** ¿Qué voltaje cae sobre el par R₁‖R₂? (V)', hints: ['Esa corriente I pasa por R_p.', '$V_p = I\\cdot R_p$', ''].filter(Boolean), steps: [`$V_p = ${fmt(I, 3)}\\cdot ${fmt(Rp, 3)} = ${fmt(Vp, 2)}$ V`], why: 'Divisor de voltaje.' }),
      ],
    };
  },
  data(r) {
    const n = 6; const data = Array.from({ length: n }, () => r.int(20, 60));
    const m = data.reduce((s, v) => s + v, 0) / n; const sd = Math.sqrt(data.reduce((s, v) => s + (v - m) ** 2, 0) / n);
    return {
      multipart: true, title: 'Analiza datos reales de un sensor',
      scenario: `Un sensor de temperatura de un laboratorio registró estas ${n} mediciones (°C): **${data.join(', ')}**.`,
      parts: [
        Q({ type: 'numeric', answer: m, tol: 0.02, prompt: '**Parte 1.** ¿Cuál es la media? (2 decimales)', hints: ['Suma y divide.', 'Suma de datos ÷ 6.', ''].filter(Boolean), steps: [`$\\bar x = ${fmt(m, 3)}$`], why: 'Estadística básica.' }),
        Q({ type: 'numeric', answer: sd, tol: 0.03, prompt: '**Parte 2.** ¿Cuál es la desviación estándar poblacional? (2 decimales)', hints: ['Raíz del promedio de (dato − media)².', 'Usa la media de la parte 1.', ''].filter(Boolean), steps: [`$\\sigma = ${fmt(sd, 3)}$`], why: 'Dispersión.' }),
        Q({ type: 'numeric', answer: (data[0] - m) / sd, tol: 0.03, prompt: `**Parte 3.** ¿Cuál es el puntaje z de la primera medición (${data[0]})? (2 decimales)`, hints: ['$z=(x-\\bar x)/\\sigma$', 'Usa las partes 1 y 2.', ''].filter(Boolean), steps: [`$z = \\frac{${data[0]} - ${fmt(m, 2)}}{${fmt(sd, 2)}} = ${fmt((data[0] - m) / sd, 2)}$`], why: 'Detectar valores atípicos.' }),
      ],
    };
  },
};
