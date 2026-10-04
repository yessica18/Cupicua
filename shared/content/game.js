// Mundo de juego: enemigos conceptuales, armas, zonas secretas, curiosidades, π, acertijos,
// misiones secundarias, cosméticos y frases de CAPIA. Todo el combate es abstracto y educativo.

export const ENEMIES = {
  procrastinacion: { id: 'procrastinacion', icon: '😴', name: 'El Rey del Después', tagline: '“Lo hago después.”', hp: 100, color: '#a78bfa', weakness: 'Se combate empezando una misión: el primer paso le quita la mitad de su energía.', taunt: ['Mañana lo haces con más ganas…', 'Cinco minutos más de descanso.'], defeat: 'Empezaste. Ese era el único truco.' },
  frustracion: { id: 'frustracion', icon: '😤', name: 'La Bestia del No Puedo', tagline: '“No puedo.”', hp: 100, color: '#fb7185', weakness: 'Se combate comprendiendo los errores: cada error entendido le quita energía.', taunt: ['Ya fallaste otra vez…', 'Esto no es para ti.'], defeat: 'Entendiste tu error. Un error entendido ya no es un enemigo.' },
  desidia: { id: 'desidia', icon: '🦥', name: 'El Devorador del Esfuerzo', tagline: '“Para qué esforzarse.”', hp: 120, color: '#84cc16', weakness: 'Se combate practicando: cada ejercicio resuelto le quita fuerza.', taunt: ['Ya sabes suficiente.', 'Total, nadie lo nota.'], defeat: 'La práctica constante es su kryptonita.' },
  caos: { id: 'caos', icon: '🌀', name: 'El Caos', tagline: '“Todo está desordenado.”', hp: 150, color: '#f472b6', weakness: 'Se combate creando hábitos y siguiendo progresiones: el orden lo debilita.', taunt: ['¿Por dónde empiezo?', 'Hay demasiadas cosas.'], defeat: 'Con un plan y un paso a la vez, el Caos se calma.' },
  miedo: { id: 'miedo', icon: '😨', name: 'Miedo a Equivocarse', tagline: '“¿Y si me equivoco?”', hp: 80, color: '#fbbf24', weakness: 'Equivocarte a propósito (¡y aprender!) lo disuelve.', taunt: ['Mejor no lo intentes.'], defeat: 'Cada error es información. Ya no te asusta.' },
  distraccion: { id: 'distraccion', icon: '📱', name: 'La Distracción', tagline: '“Solo un vistazo…”', hp: 80, color: '#38bdf8', weakness: 'Se vence con bloques cortos de enfoque: 10 minutos sin interrupciones.', taunt: ['Una notificación más…'], defeat: 'Tu atención vuelve a ser tuya.' },
  confusion: { id: 'confusion', icon: '🧠', name: 'La Confusión', tagline: '“No entiendo nada.”', hp: 90, color: '#a3e635', weakness: 'Se vence dividiendo el problema: ¿qué sé? ¿qué necesito?', taunt: ['Todo se ve igual…'], defeat: 'Una pregunta clara disipa la niebla.' },
  tiempo: { id: 'tiempo', icon: '⌛', name: 'La Falta de Tiempo', tagline: '“No tengo tiempo.”', hp: 80, color: '#fb923c', weakness: 'Se vence con un plan realista: 10 minutos al día suman.', taunt: ['Ya es muy tarde.'], defeat: 'Con constancia, poco tiempo alcanza.' },
  duda: { id: 'duda', icon: '🌫️', name: 'La Duda', tagline: '“¿Estará bien?”', hp: 80, color: '#94a3b8', weakness: 'Se vence comprobando: sustituye y verifica.', taunt: ['No estás seguro…'], defeat: 'Comprobar es más poderoso que dudar.' },
  bloqueo: { id: 'bloqueo', icon: '🧩', name: 'El Bloqueo', tagline: '“No sé cómo seguir.”', hp: 90, color: '#c084fc', weakness: 'Se vence con una pista y un primer paso pequeño.', taunt: ['Estás atascado.'], defeat: 'Un paso pequeño abrió el camino.' },
  olvido: { id: 'olvido', icon: '👻', name: 'El Olvido', tagline: '“Ya no me acuerdo.”', hp: 80, color: '#e2e8f0', weakness: 'Se vence con repasos espaciados.', taunt: ['Eso ya se te olvidó.'], defeat: 'Repasar a tiempo mantiene vivo el conocimiento.' },
};

export const WEAPONS = [
  { id: 'espada', icon: '⚔️', name: 'Espada de los Números', symbol: '1, 2, 3, 4…', power: 'Daño base alto contra enemigos de aritmética.', unlock: { r: 'aritmetica', n: 6 }, color: '#5eead4' },
  { id: 'baculo', icon: '🔮', name: 'Báculo del Infinito', symbol: '∞', power: 'Hace daño continuo: cada acierto seguido suma +1.', unlock: { r: 'calculo', n: 15 }, color: '#818cf8' },
  { id: 'arco', icon: '🏹', name: 'Arco Trigonométrico', symbol: 'sin θ · cos θ · tan θ', power: 'Ataques a distancia: ignoran la defensa de “Duda”.', unlock: { r: 'trigonometria', n: 6 }, color: '#fb923c' },
  { id: 'escudo', icon: '🛡️', name: 'Escudo de Pitágoras', symbol: 'a² + b² = c²', power: 'Un error por combate no hiere tu racha.', unlock: { r: 'geometria', n: 5 }, color: '#fbbf24' },
  { id: 'libro', icon: '🧙', name: 'Libro del Álgebra', symbol: 'x · y · z', power: 'Revela una pista gratis por combate.', unlock: { r: 'algebra', n: 10 }, color: '#a78bfa' },
  { id: 'martillo', icon: '⚡', name: 'Martillo de la Derivada', symbol: 'd/dx', power: 'Golpe crítico en preguntas de cambio y razón.', unlock: { r: 'calculo', n: 7 }, color: '#f59e0b' },
  { id: 'lanza', icon: '🌀', name: 'Lanza Vectorial', symbol: '→v', power: 'Siempre acierta la dirección: daño constante.', unlock: { r: 'algebralineal', n: 2 }, color: '#f472b6' },
  { id: 'orbe', icon: '💠', name: 'Orbe de los Complejos', symbol: 'a + bi', power: 'Convierte un error en información extra (+XP).', unlock: { r: 'aritmetica', n: 15 }, color: '#22d3ee' },
];

export const SECRETS = [
  { id: 'cero', icon: '0', name: 'Cámara del Cero', region: 'aritmetica', need: { r: 'aritmetica', n: 3, mastery: 40 }, lore: 'Una sala vacía con una única puerta. Para abrirla hay que decir qué significa “nada” en matemáticas.', challenge: 'int_ops@3', reward: { pi: 25, codex: 'camara-cero' } },
  { id: 'infinito', icon: '∞', name: 'Santuario del Infinito', region: 'calculo', need: { r: 'calculo', n: 15, mastery: 40 }, lore: 'Una escalera que no termina. En cada escalón, la mitad de la distancia que quedaba.', challenge: 'series_geom', reward: { pi: 60, codex: 'santuario-infinito' } },
  { id: 'pi', icon: 'π', name: 'Jardín de Pi', region: 'geometria', need: { r: 'geometria', n: 9, mastery: 40 }, lore: 'Jardín circular donde cada flor tiene un número de pétalos que es un decimal de π.', challenge: 'circle@2', reward: { pi: 40, codex: 'jardin-pi' } },
  { id: 'raices', icon: '√', name: 'Bosque de las Raíces', region: 'aritmetica', need: { r: 'aritmetica', n: 13, mastery: 40 }, lore: 'Árboles que crecen hacia abajo: sus raíces cuadradas son enteras… excepto las irracionales.', challenge: 'roots@3', reward: { pi: 30, codex: 'bosque-raices' } },
  { id: 'imaginaria', icon: 'i', name: 'Dimensión Imaginaria', region: 'aritmetica', need: { r: 'aritmetica', n: 15, mastery: 40 }, lore: 'Un plano donde los números tienen dos ejes. Todo gira.', challenge: 'complex_ops@2', reward: { pi: 50, codex: 'dimension-imaginaria' } },
  { id: 'sumatorias', icon: 'Σ', name: 'Torre de las Sumatorias', region: 'estadistica', need: { r: 'estadistica', n: 3, mastery: 40 }, lore: 'Cada piso suma al anterior. En la cima está el promedio.', challenge: 'stat_central#media@3', reward: { pi: 30, codex: 'torre-sumatorias' } },
  { id: 'integrales', icon: '∫', name: 'Templo de las Integrales', region: 'calculo', need: { r: 'calculo', n: 12, mastery: 40 }, lore: 'Un templo que se construye acumulando franjas finas.', challenge: 'definite_integral@3', reward: { pi: 50, codex: 'templo-integrales' } },
  { id: 'nabla', icon: '∇', name: 'Valle Vectorial', region: 'vectorial', need: { r: 'vectorial', n: 4, mastery: 40 }, lore: 'Un valle donde cada punto señala hacia la cumbre más cercana.', challenge: 'gradient', reward: { pi: 50, codex: 'valle-vectorial' } },
];

export const PI_FRAGMENTS = [
  { id: 'pi-1', region: 'geometria', n: 8, title: 'π, el cociente que no cambia', text: 'En todo círculo, circunferencia ÷ diámetro es el mismo número: π ≈ 3,14159. Ese número no depende del tamaño del círculo.', q: { prompt: 'Una rueda tiene diámetro 1 m. ¿Cuánto avanza (aprox.) en una vuelta completa?', choices: ['≈ 3,14 m', '≈ 1 m', '≈ 6,28 m', '≈ 0,5 m'], answer: 0, explain: 'Avanza una circunferencia: π·d ≈ 3,14 m.' } },
  { id: 'pi-2', region: 'aritmetica', n: 15, title: 'π es irracional', text: 'No puede escribirse como fracción de enteros. Sus decimales no terminan ni se repiten. Lambert lo demostró en 1761.', q: { prompt: '¿Qué significa que π sea irracional?', choices: ['No es una fracción de enteros', 'Es un número negativo', 'No existe', 'Es igual a 22/7'], answer: 0, explain: '22/7 es solo una aproximación (≈ 3,142857).' } },
  { id: 'pi-3', region: 'geometria', n: 9, title: 'π y el área del círculo', text: 'Arquímedes demostró que el área del círculo es la de un triángulo con base la circunferencia y altura el radio: ½·(2πr)·r = πr².', q: { prompt: 'Un círculo de radio 2: ¿área aproximada (π ≈ 3,14)?', choices: ['≈ 12,56', '≈ 6,28', '≈ 25,12', '≈ 4'], answer: 0, explain: 'π·2² = 4π ≈ 12,56.' } },
  { id: 'pi-4', region: 'trigonometria', n: 2, title: 'π en los radianes', text: 'Medio giro mide π radianes. Por eso π aparece en senos, cosenos y todas las ondas.', q: { prompt: '¿Cuántos radianes mide un giro completo?', choices: ['2π', 'π', 'π/2', '4π'], answer: 0, explain: 'Un giro completo es 360° = 2π rad.' } },
  { id: 'pi-5', region: 'estadistica', n: 12, title: 'π en la campana', text: 'La distribución normal incluye √(2π) en su fórmula: π aparece incluso en el azar.', q: { prompt: '¿En cuál de estos contextos aparece π?', choices: ['Ondas, círculos y la distribución normal', 'Solo en círculos', 'Solo en la historia', 'En ninguna'], answer: 0, explain: 'π es universal: geometría, física, probabilidad y teoría de números.' } },
  { id: 'pi-6', region: 'calculo', n: 15, title: 'π como serie infinita', text: 'Madhava (y luego Leibniz y Gregory) encontró: π/4 = 1 − 1/3 + 1/5 − 1/7 + … Cada término acerca el resultado.', q: { prompt: 'Si sumas 4·(1 − 1/3 + 1/5), ¿obtienes algo cercano a 3,14?', choices: ['Sí, ≈ 3,47: se acerca despacio', 'No, da 1', 'Da exactamente π', 'Da 0'], answer: 0, explain: '4·(1 − 0,333 + 0,2) = 3,466…; con más términos converge a π, aunque lentamente.' } },
  { id: 'pi-7', region: 'fisica', n: 12, title: 'π en la física', text: 'Periodo del péndulo y del resorte, ondas, gravitación: T = 2π√(m/k).', q: { prompt: 'En T = 2π√(m/k), ¿qué magnitud describe T?', choices: ['El periodo de oscilación', 'La masa', 'La fuerza', 'La energía'], answer: 0, explain: 'T es el tiempo de una oscilación completa.' } },
  { id: 'pi-8', region: 'fisica2', n: 13, title: 'π en las ondas EM', text: 'La frecuencia angular ω = 2πf conecta ciclos por segundo con radianes por segundo.', q: { prompt: 'Una señal de 50 Hz tiene ω = …', choices: ['100π rad/s', '50π rad/s', '25π rad/s', '200π rad/s'], answer: 0, explain: 'ω = 2π·50 = 100π.' } },
];

export const PI_PROFILE = {
  name: 'π', epithet: 'la criatura de los decimales infinitos',
  aproximaciones: [['3', 'Antigua Mesopotamia / Biblia (aprox. práctica)'], ['256/81 ≈ 3,1605', 'Papiro Rhind (Egipto)'], ['22/7 ≈ 3,142857', 'Arquímedes (cota superior)'], ['3,1416', 'Aryabhata / Liu Hui'], ['355/113 ≈ 3,1415929', 'Zu Chongzhi'], ['3,14159265358979…', 'Madhava, Al-Kashi y siglos de cálculo']],
};

export const CURIOSITIES = [
  { id: 'c-abaco', icon: '🧮', kind: 'abaco', region: 'aritmetica', title: 'El ábaco', text: 'Los ábacos (suanpan chino, soroban japonés, schoty ruso) se usaron durante siglos. Un operador experto puede calcular con ellos casi tan rápido como con una calculadora.', era: 'historica' },
  { id: 'c-ishango', icon: '🦴', kind: 'pergamino', region: 'aritmetica', title: 'Marcas de hace 20 000 años', text: 'El hueso de Ishango (Congo) tiene grupos de muescas. No sabemos con certeza si era un calendario o un registro de conteo, pero demuestra que la gente contaba desde hace muchísimo.', era: 'historica' },
  { id: 'c-papiro', icon: '📜', kind: 'pergamino', region: 'aritmetica', title: 'El papiro de Ahmes', text: 'El papiro Rhind (c. 1550 a. C.) comienza con “Método para alcanzar un conocimiento de todas las cosas oscuras”: 84 problemas de fracciones, ecuaciones y áreas.', era: 'historica' },
  { id: 'c-primos', icon: '🔢', kind: 'libro', region: 'aritmetica', title: 'Primos gigantes', text: 'El mayor primo conocido tiene decenas de millones de dígitos y se encuentra con proyectos colaborativos como GIMPS. Para datos actuales, usa 🌐 Buscar en Internet.', era: 'actual' },
  { id: 'c-balanza', icon: '⚖️', kind: 'instrumento', region: 'algebra', title: 'La balanza del álgebra', text: 'La idea de resolver ecuaciones “manteniendo el equilibrio” viene de los tratados de Al-Juarismi (siglo IX).', era: 'historica' },
  { id: 'c-igual', icon: '＝', kind: 'libro', region: 'algebra', title: 'El signo igual', text: 'Robert Recorde lo introdujo en 1557 porque “dos cosas no pueden ser más iguales que dos rectas paralelas”.', era: 'historica' },
  { id: 'c-escuadra', icon: '📐', kind: 'instrumento', region: 'geometria', title: 'La cuerda de 12 nudos', text: 'Se dice que constructores antiguos formaban ángulos rectos con una cuerda de 12 nudos haciendo un triángulo 3-4-5.', era: 'historica' },
  { id: 'c-a4', icon: '📄', kind: 'libro', region: 'geometria', title: 'La razón del papel A4', text: 'Las hojas A4, A3… tienen lados en razón √2: al doblar una por la mitad se obtiene otra semejante.', era: 'historica' },
  { id: 'c-tierra', icon: '🌍', kind: 'observatorio', region: 'trigonometria', title: 'Medir la Tierra con una sombra', text: 'Eratóstenes (c. 240 a. C.) comparó el ángulo del Sol en Siena y Alejandría y estimó la circunferencia terrestre.', era: 'historica' },
  { id: 'c-gps', icon: '🛰️', kind: 'satelite', region: 'trigonometria', title: 'GPS y triángulos', text: 'Un receptor GPS calcula su posición midiendo distancias a varios satélites: es trilateración, una aplicación de geometría y trigonometría (con relatividad corrigiendo los relojes).', era: 'actual' },
  { id: 'c-galton', icon: '🎯', kind: 'maquina', region: 'estadistica', title: 'El tablero de Galton', text: 'Una máquina con clavijas donde las bolitas caen y forman una campana: muestra cómo muchos azares pequeños producen una distribución normal.', era: 'historica' },
  { id: 'c-cumple', icon: '🎂', kind: 'libro', region: 'estadistica', title: 'La paradoja del cumpleaños', text: 'En un grupo de solo 23 personas, hay más de 50% de probabilidad de que dos cumplan años el mismo día.', era: 'historica' },
  { id: 'c-pixel', icon: '🖼️', kind: 'robot', region: 'algebralineal', title: 'Imágenes = matrices', text: 'Una imagen digital es una matriz de números; rotarla o desenfocarla es multiplicarla por otras matrices.', era: 'actual' },
  { id: 'c-pagerank', icon: '🔍', kind: 'maquina', region: 'algebralineal', title: 'Valores propios en buscadores', text: 'El algoritmo original de PageRank de Google usa el vector propio de una matriz gigante que describe los enlaces de la web.', era: 'actual' },
  { id: 'c-newton', icon: '🍎', kind: 'libro', region: 'calculo', title: 'Dos caminos al cálculo', text: 'Newton y Leibniz desarrollaron el cálculo de forma independiente (Leibniz publicó primero, 1684). La disputa de prioridad fue amarga pero hoy se reconoce el mérito de ambos.', era: 'historica' },
  { id: 'c-zenon', icon: '🐢', kind: 'pergamino', region: 'calculo', title: 'La paradoja de Zenón', text: 'Aquiles nunca alcanza a la tortuga… pero la suma infinita 1 + ½ + ¼ + … vale 2. Las series resuelven la paradoja.', era: 'historica' },
  { id: 'c-nabla', icon: '🌪️', kind: 'maquina', region: 'vectorial', title: 'El clima en vectores', text: 'Los modelos meteorológicos dividen la atmósfera en celdas y calculan campos vectoriales de viento: divergencia y rotacional describen tormentas.', era: 'actual' },
  { id: 'c-poblacion', icon: '🦠', kind: 'laboratorio', region: 'edo', title: 'Epidemias con ecuaciones', text: 'Los modelos SIR de epidemias son sistemas de ecuaciones diferenciales: cuántas personas están susceptibles, infectadas y recuperadas.', era: 'actual' },
  { id: 'c-tacoma', icon: '🌉', kind: 'maquina', region: 'edo', title: 'El puente de Tacoma', text: 'El puente Tacoma Narrows (1940) se rompió por oscilaciones inducidas por el viento: un caso de estudio sobre resonancia y flameo aeroelástico.', era: 'historica' },
  { id: 'c-torre', icon: '🗼', kind: 'observatorio', region: 'fisica', title: 'La caída de los cuerpos', text: 'Galileo estudió la caída con planos inclinados (más lentos, más fáciles de medir). La historia de la Torre de Pisa es más leyenda que dato.', era: 'historica' },
  { id: 'c-apollo', icon: '🚀', kind: 'satelite', region: 'fisica', title: 'Cálculo de trayectorias', text: 'Matemáticas como Katherine Johnson calcularon a mano trayectorias de las primeras misiones espaciales de la NASA, y los astronautas pedían que ella verificara las máquinas.', era: 'historica' },
  { id: 'c-circuito', icon: '🔌', kind: 'laboratorio', region: 'fisica2', title: 'Ley de Ohm', text: 'Georg Ohm (1827) publicó que la corriente en un conductor es proporcional al voltaje. Al principio fue criticado.', era: 'historica' },
  { id: 'c-wifi', icon: '📶', kind: 'satelite', region: 'fisica2', title: 'Tu Wi-Fi son ondas', text: 'Tu router emite ondas electromagnéticas a 2,4 o 5 GHz: longitudes de onda de 12 cm y 6 cm.', era: 'actual' },
  { id: 'c-robot', icon: '🤖', kind: 'robot', region: 'ingenieria', title: 'Robots y matrices', text: 'Los brazos robóticos calculan su posición multiplicando matrices de rotación y traslación para cada articulación.', era: 'actual' },
  { id: 'c-ia', icon: '🧠', kind: 'maquina', region: 'ingenieria', title: 'IA: álgebra lineal + cálculo', text: 'Las redes neuronales aprenden multiplicando matrices y ajustando parámetros con derivadas (descenso de gradiente).', era: 'actual' },
];

export const PUZZLES = [
  { id: 'p1', kind: 'acertijo', prompt: 'Un nenúfar duplica su tamaño cada día. En 30 días cubre todo el estanque. ¿En qué día cubre **la mitad** del estanque?', type: 'numeric', answer: 29, hints: ['Si hoy está a la mitad, mañana duplica…', 'El último día ocupa todo el estanque.', 'Un día antes, tiene la mitad.'], explain: 'Como duplica cada día, un día antes de cubrirlo todo estaba a la mitad: día 29.' },
  { id: 'p2', kind: 'lógica', prompt: 'Si 5 máquinas hacen 5 piezas en 5 minutos, ¿cuántos minutos tardan 100 máquinas en hacer 100 piezas?', type: 'numeric', answer: 5, hints: ['Calcula cuánto produce UNA máquina en 5 minutos.', 'Cada máquina hace 1 pieza en 5 minutos.', '100 máquinas hacen 100 piezas a la vez.'], explain: 'Cada máquina hace 1 pieza en 5 minutos; 100 máquinas hacen 100 piezas en 5 minutos.' },
  { id: 'p3', kind: 'acertijo', prompt: 'Si un ladrillo pesa 1 kg más medio ladrillo, ¿cuántos kg pesa un ladrillo?', type: 'numeric', answer: 2, hints: ['Sea x el peso: x = 1 + x/2.', 'Resta x/2 en ambos lados.', 'x/2 = 1.'], explain: 'x = 1 + x/2 → x/2 = 1 → x = 2 kg.' },
  { id: 'p4', kind: 'lógica', prompt: 'En una fiesta hay 6 personas y todas se estrechan la mano una vez con cada una de las demás. ¿Cuántos apretones hay?', type: 'numeric', answer: 15, hints: ['Cada par de personas se saluda una vez.', 'Es una combinación de 6 tomadas de 2 en 2.', '6·5/2'], explain: 'C(6,2) = 15.' },
  { id: 'p5', kind: 'acertijo', prompt: 'Un caracol sube 3 m cada día y resbala 2 m cada noche. Un pozo tiene 10 m. ¿En qué día sale?', type: 'numeric', answer: 8, hints: ['Avanza 1 m neto por día…', 'Hasta que un día llega arriba sin resbalar.', 'Al inicio del día 8 está a 7 m: sube 3 → sale.'], explain: 'Tras 7 días está a 7 m; el día 8 sube 3 m y llega a 10 m.' },
  { id: 'p6', kind: 'capicúa', prompt: 'Un **capicúa** se lee igual al derecho y al revés (como 12321). ¿Cuántos capicúas de **3 cifras** hay?', type: 'numeric', answer: 90, hints: ['Una vez elegidas las dos primeras cifras, la tercera está decidida.', 'La primera cifra: 1–9 (9 opciones). La del medio: 0–9 (10).', '9 × 10'], explain: '9 opciones para la 1.ª cifra y 10 para la del medio: 90.' },
  { id: 'p7', kind: 'capicúa', prompt: 'Toma 57, inviértelo (75) y súmalos: 132. Invierte 132 (231) y suma: 363. ¡Capicúa! Con 68, ¿cuántos pasos de “invertir y sumar” necesitas para obtener un capicúa?', type: 'numeric', answer: 3, hints: ['68 + 86 = 154.', '154 + 451 = 605.', '605 + 506 = 1111.'], explain: '68 → 154 → 605 → 1111 (capicúa) en 3 pasos.' },
  { id: 'p8', kind: 'física', prompt: 'Un coche viaja 60 km/h durante 30 minutos y luego 90 km/h durante 20 minutos. ¿Qué distancia total recorre (km)?', type: 'numeric', answer: 60, hints: ['Convierte minutos a horas.', 'Distancia = velocidad × tiempo.', '60·0,5 + 90·(1/3).'], explain: '30 + 30 = 60 km.' },
  { id: 'p9', kind: 'ingeniería', prompt: 'Una viga debe cubrir un hueco de 4 m con una carga y soporta 500 N por metro. ¿Cuántos newtons soporta en total?', type: 'numeric', answer: 2000, hints: ['Carga total = capacidad por metro × longitud.', '500 × 4', ''].filter(Boolean), explain: '500 N/m × 4 m = 2000 N.' },
  { id: 'p10', kind: 'histórico', prompt: 'Arquímedes acotó π entre 223/71 y 22/7. ¿Cuál es el valor aproximado de 22/7 con 2 decimales?', type: 'numeric', answer: 3.14, tol: 0.006, hints: ['Divide 22 entre 7.', '7·3 = 21; sobra 1.', '1/7 ≈ 0,142857…'], explain: '22/7 = 3,142857… ≈ 3,14.' },
  { id: 'p11', kind: 'lógica', prompt: 'Una cuerda se corta por la mitad, luego una de las mitades se corta por la mitad otra vez, y así 5 veces seguidas con el trozo más corto. Si la cuerda original medía 64 cm, ¿cuánto mide el trozo más corto?', type: 'numeric', answer: 2, hints: ['Cada corte divide entre 2 el trozo.', '64 → 32 → 16 → …', '64/2⁵'], explain: '64/2⁵ = 2 cm.' },
  { id: 'p12', kind: 'acertijo', prompt: 'La suma de tres números consecutivos es 75. ¿Cuál es el menor?', type: 'numeric', answer: 24, hints: ['Sean n, n+1, n+2.', '3n + 3 = 75', 'n = 24'], explain: '3n + 3 = 75 → n = 24 (24 + 25 + 26).' },
  { id: 'p13', kind: 'lógica', prompt: '¿Cuántos cuadrados (de cualquier tamaño) hay en un tablero de ajedrez 8×8?', type: 'numeric', answer: 204, hints: ['Hay 64 de 1×1, 49 de 2×2…', 'Suma de cuadrados 1² + 2² + … + 8².', '64 + 49 + 36 + 25 + 16 + 9 + 4 + 1'], explain: 'Σ k² de 1 a 8 = 204.' },
  { id: 'p14', kind: 'capicúa', prompt: 'El año 2002 fue capicúa. ¿Cuál es el próximo año capicúa después de 2002?', type: 'numeric', answer: 2112, hints: ['Debe empezar en 2 y terminar en 2.', '2 _ _ 2 con las cifras del medio iguales (a b b a invertido).', '2112'], explain: 'Los capicúas de 4 cifras son de la forma abba: tras 2002 viene 2112.' },
  { id: 'p15', kind: 'ingeniería', prompt: 'Para reducir la resistencia de un cable a la mitad, ¿por qué factor debes multiplicar su sección (área)? (R = ρL/A)', type: 'numeric', answer: 2, hints: ['R es inversamente proporcional a A.', 'Si A se duplica…', 'R se reduce a la mitad.'], explain: 'R ∝ 1/A: duplicar A reduce R a la mitad.' },
];

export const SIDE_MISSIONS = [
  { id: 'puente-pitagoras', type: 'principal', icon: '🏛️', title: 'El Puente de Pitágoras', region: 'geometria', story: 'Un río separa dos aldeas. Debes construir un puente en diagonal y calcular el largo de los cables.', project: 'bridge', steps: 'Cables · ángulo · tensión' },
  { id: 'euclides-primos', type: 'histórica', icon: '📜', title: 'Los primos de Euclides', region: 'aritmetica', story: 'Euclides promete que siempre habrá un primo nuevo. Ayúdalo a encontrarlo.', gen: 'prime_factors@3' },
  { id: 'esfera-cilindro', type: 'científica', icon: '🔬', title: 'La esfera en el cilindro', region: 'geometria', story: 'Arquímedes quiere que su tumba lleve una esfera dentro de un cilindro. ¿Qué fracción del cilindro llena la esfera?', gen: 'volume@3' },
  { id: 'dia-de-sombra', type: 'científica', icon: '☀️', title: 'La sombra de Eratóstenes', region: 'trigonometria', story: 'Mide la altura de una torre usando solo su sombra y un ángulo.', gen: 'elevation' },
  { id: 'el-colapso-datos', type: 'secundaria', icon: '📊', title: 'El Colapso de los Datos', region: 'estadistica', story: 'Un sensor falló. Ayuda a reconstruir la media y detectar el valor atípico.', project: 'data' },
  { id: 'robot-perdido', type: 'ingeniería', icon: '🤖', title: 'El robot perdido', region: 'algebralineal', story: 'Un robot se desorientó. Aplica una transformación para devolverlo a su posición.', gen: 'mat_vec' },
  { id: 'paracaidas', type: 'científica', icon: '🪂', title: 'Salto de fe', region: 'edo', story: 'Un paracaidista salta. ¿Qué velocidad terminal alcanzará?', gen: 'terminal' },
  { id: 'circuito-luz', type: 'ingeniería', icon: '💡', title: 'Que se haga la luz', region: 'fisica2', story: 'Un pueblo sin energía necesita un circuito mixto serie-paralelo.', project: 'circuit' },
  { id: 'cero', type: 'histórica', icon: '0️⃣', title: 'El misterio del cero', region: 'aritmetica', story: 'Un viaje de 4000 años por Mesopotamia, los mayas, la India y Bagdad.', special: 'cero' },
  { id: 'infinito', type: 'razonamiento', icon: '♾️', title: 'La dimensión del infinito', region: 'calculo', story: 'Zenón, Cantor y un hotel infinito te esperan.', special: 'infinito' },
  { id: 'coop-puente', type: 'cooperativa', icon: '👥', title: 'Puente a cuatro manos', region: 'ingenieria', story: 'Uno calcula la geometría y la otra las fuerzas. Solo juntos cruzan el río.', special: 'coop' },
  { id: 'rey-del-despues', type: 'jefe', icon: '😴', title: 'El Rey del Después', region: 'aritmetica', story: 'Empieza ahora una misión de 5 minutos. Eso es todo lo que hace falta.', enemy: 'procrastinacion', gen: 'basic_ops@2' },
  { id: 'bestia-no-puedo', type: 'jefe', icon: '😤', title: 'La Bestia del No Puedo', region: 'algebra', story: 'Equivócate a propósito, entiende el error y conviértelo en fuerza.', enemy: 'frustracion', gen: 'spot_error' },
];

export const MISSION_TYPES = [
  ['principal', '📘', 'Misión principal'], ['secundaria', '🧩', 'Misión secundaria'], ['científica', '🔬', 'Misión científica'], ['histórica', '📜', 'Misión histórica'],
  ['jefe', '⚔️', 'Misión de jefe'], ['razonamiento', '🧠', 'Misión de razonamiento'], ['ingeniería', '🤖', 'Misión de ingeniería'], ['cooperativa', '👥', 'Misión cooperativa'],
  ['diaria', '⚡', 'Misión diaria'], ['secreta', '🔐', 'Misión secreta'],
];

export const LEGENDARY = [
  { id: 'l1', title: 'El árbol de Fibonacci', prompt: 'Un árbol tiene 1 rama en el mes 1, 1 rama en el mes 2 y, a partir del mes 3, tantas ramas como los dos meses anteriores juntos. ¿Cuántas ramas tiene en el mes 9?', type: 'numeric', answer: 34, hints: ['Escribe la secuencia: 1, 1, 2, 3, 5…', 'Cada término es la suma de los dos anteriores.', 'Continúa hasta el noveno término.'], paths: ['Contar mes a mes', 'Usar la relación F(n) = F(n−1) + F(n−2)'], regions: ['aritmetica', 'algebra'] },
  { id: 'l2', title: 'El corral junto al río', prompt: 'Un granjero tiene 100 m de cerca y quiere un corral rectangular junto a un río recto (el lado del río no necesita cerca). ¿Cuál es el área máxima que puede encerrar (m²)?', type: 'numeric', answer: 1250, hints: ['Sean x los dos lados perpendiculares al río; el lado paralelo es 100 − 2x.', 'Área = x(100 − 2x). Es una parábola que abre hacia abajo.', 'El máximo está en x = 25 (derivada cero o vértice).'], paths: ['Completar el cuadrado', 'Vértice de la parábola', 'Derivada'], regions: ['algebra', 'calculo'] },
  { id: 'l3', title: 'El cuadrado mágico', prompt: 'En un cuadrado mágico 3×3 con los números del 1 al 9 todas las filas, columnas y diagonales suman lo mismo. ¿Cuánto suman?', type: 'numeric', answer: 15, hints: ['Suma todos los números del 1 al 9.', 'Esa suma se reparte en 3 filas iguales.', '45 ÷ 3.'], paths: ['Álgebra', 'Lógica', 'Ensayo y error'], regions: ['aritmetica', 'algebra'] },
];

export const COSMETICS = {
  hair: [
    { id: 'short', name: 'Corto', price: 0 }, { id: 'long', name: 'Largo', price: 0 }, { id: 'bun', name: 'Moño', price: 0 }, { id: 'curly', name: 'Rizado', price: 0 },
    { id: 'spiky', name: 'Puntas', price: 20 }, { id: 'braids', name: 'Trenzas', price: 20 }, { id: 'pony', name: 'Cola alta', price: 20 }, { id: 'afro', name: 'Afro', price: 20 },
  ],
  hairColor: ['#2b2118', '#6b4423', '#c68642', '#e8c26a', '#d1d5db', '#ef4444', '#a855f7', '#22d3ee', '#ec4899', '#22c55e'],
  skin: ['#f6d5b8', '#e8b998', '#d29b74', '#b97c55', '#8d5a3a', '#6b4128', '#4a2c1c', '#f3c7a5'],
  top: [{ id: 'tee', name: 'Camiseta', price: 0 }, { id: 'hoodie', name: 'Sudadera', price: 0 }, { id: 'labcoat', name: 'Bata de laboratorio', price: 0 }, { id: 'explorer', name: 'Chaleco explorador', price: 30 }, { id: 'cape', name: 'Capa estelar', price: 60, unlock: 'Completa Álgebra' }],
  topColor: ['#7c3aed', '#38bdf8', '#14b8a6', '#fb7185', '#fbbf24', '#e2e8f0', '#1e293b', '#22c55e'],
  accessory: [
    { id: 'none', name: 'Ninguno', price: 0 }, { id: 'glasses', name: 'Gafas redondas', price: 0 }, { id: 'headphones', name: 'Audífonos', price: 25 },
    { id: 'goggles', name: 'Gafas de laboratorio', price: 35 }, { id: 'hat', name: 'Gorro de explorador', price: 35 }, { id: 'crown', name: 'Corona de π', price: 120, unlock: 'Derrota 3 jefes' },
    { id: 'antenna', name: 'Antena', price: 30 }, { id: 'halo', name: 'Halo de comprensión', price: 80, unlock: 'Logro: No me rendí' },
  ],
  shoes: [{ id: 'sneakers', name: 'Zapatillas', price: 0 }, { id: 'boots', name: 'Botas', price: 25 }, { id: 'rocket', name: 'Botas cohete', price: 90 }],
  backpack: [{ id: 'none', name: 'Sin mochila', price: 0 }, { id: 'school', name: 'Mochila', price: 0 }, { id: 'jet', name: 'Jetpack', price: 120 }, { id: 'scroll', name: 'Carcaj de pergaminos', price: 40 }],
  effect: [{ id: 'none', name: 'Sin efecto', price: 0 }, { id: 'sparkles', name: 'Destellos', price: 40 }, { id: 'aura', name: 'Aura turquesa', price: 70 }, { id: 'pi-orbit', name: 'Órbita de π', price: 150, unlock: 'Jardín de Pi' }, { id: 'nebula', name: 'Nebulosa', price: 100 }],
  pet: [{ id: 'none', name: 'Sin mascota', price: 0 }, { id: 'pi', name: 'Mini-π', price: 0, unlock: 'Descubre a π' }, { id: 'bot', name: 'Robot', price: 80 }, { id: 'owl', name: 'Búho sabio', price: 80 }, { id: 'capy', name: 'Capi-bebé', price: 100 }, { id: 'star', name: 'Estrella', price: 60 }],
};

export const CAPIA_OUTFITS = [
  { id: 'base', name: 'Capia clásica', unlock: null }, { id: 'lab', name: 'Bata de laboratorio', unlock: { r: 'fisica', n: 1 } },
  { id: 'explorer', name: 'Exploradora', unlock: { r: 'geometria', n: 1 } }, { id: 'astro', name: 'Astrónoma', unlock: { r: 'trigonometria', n: 8 } },
  { id: 'engineer', name: 'Ingeniera', unlock: { r: 'ingenieria', n: 2 } }, { id: 'scientist', name: 'Científica', unlock: { r: 'estadistica', n: 5 } },
  { id: 'mathematician', name: 'Matemática', unlock: { r: 'algebra', n: 8 } }, { id: 'adventurer', name: 'Aventurera', unlock: { r: 'aritmetica', n: 8 } },
  { id: 'pilot', name: 'Piloto', unlock: { r: 'fisica', n: 6 } }, { id: 'robotist', name: 'Robotista', unlock: { r: 'algebralineal', n: 8 } },
];

export const TITLES = ['Aventurero curioso', 'Explorador de números', 'Detective del error', 'Constructor de ecuaciones', 'Domador de funciones', 'Ingeniero en entrenamiento', 'Guardián del infinito', 'Restauradora del Universo'];

/** Diálogos de CAPIA. {name} se sustituye por el nombre del usuario. */
export const CAPIA_SAYS = {
  intro: '¡Hola, aventurero! Soy CAPIA. No importa cuánto sepas de matemáticas. Aquí comenzaremos exactamente desde donde estés.',
  wrong: ['¡Espera! No hemos perdido. Acabamos de encontrar una pista.', 'Interesante… tu error nos muestra por dónde mirar.', 'Casi. Veamos juntos qué pasó en el camino.'],
  right: ['¡Exactamente! Mira cómo encajan todas las piezas.', '¡Eso es! Lo razonaste muy bien.', '¡Bien! Tu cerebro acaba de hacer una conexión nueva.'],
  manyErrors: 'Tu error nos está mostrando qué necesitamos practicar.',
  mastered: 'Ya no necesitas que te lleve de la mano en este tema. Ahora puedes utilizarlo por tu cuenta.',
  hintAsk: '¿Quieres una pista o quieres intentarlo solo?',
  lessonDone: '¡Buen trabajo, {name}! Has aprendido algo que ayer todavía no dominabas.',
  lessonDoneCapia: 'Estoy orgullosa de tu esfuerzo. ¿Seguimos con la siguiente misión?',
  stillNot: 'Es normal equivocarse. No significa que no puedas aprenderlo. Vamos a descubrir qué necesitas practicar.',
  stillNotCapia: 'Puedes hacerlo mejor la próxima vez. Volvamos a intentarlo juntos.',
  streakLost: 'Tu racha terminó, pero tu conocimiento sigue contigo.',
  finale: 'Cuando llegaste aquí, algunos números parecían enemigos. Ahora sabes que no necesitabas derrotarlos. Necesitabas entenderlos. Y cada vez que entendiste algo difícil, tu mundo se hizo un poco más grande. Esto apenas comienza.',
  paper: 'Antes de mirar la respuesta, intenta escribir el procedimiento en tu cuaderno.',
  diag: 'Estamos descubriendo desde dónde comenzar.',
};

export const IDENTITY = [
  'Cada error es información.', 'Comprender vale más que memorizar.', 'No tienes que ser un genio para comenzar.', 'Todo requiere práctica.',
  'Las matemáticas no son el enemigo. Son una herramienta.', 'Convierte los problemas en poderes.',
];

export const STORY = {
  prologue: 'El Universo CAPICÚA era un lugar donde cada número tenía su sitio. Hasta que llegó EL CAOS: no una fuerza malvada, sino confusión, miedo, desorden y falta de práctica. Los números se mezclaron, las fórmulas perdieron su sentido. CAPIA te necesita: cada región que restaures es una habilidad que aprendes.',
};
