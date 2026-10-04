// Línea de tiempo de las matemáticas: un desarrollo COLECTIVO de muchas culturas.
// Las fechas son aproximadas cuando se indica "c." Los textos evitan atribuir a una sola persona
// lo que fue una construcción de generaciones.

export const NEEDS = [
  ['🛒', 'Comercio', 'contar, pesar y llevar cuentas'], ['📏', 'Medición', 'repartir tierras y construir'], ['🔭', 'Astronomía', 'predecir estaciones y eclipses'],
  ['🧭', 'Navegación', 'cruzar mares y desiertos'], ['🏛️', 'Arquitectura', 'levantar templos y puentes'], ['🌾', 'Agricultura', 'calendarios y cosechas'],
  ['⚙️', 'Ingeniería', 'máquinas y estructuras'], ['🔬', 'Física', 'explicar el movimiento'], ['💻', 'Computación', 'algoritmos y datos'],
];

export const ERAS = [
  {
    id: 'mesopotamia', icon: '🌍', name: 'Mesopotamia', span: 'c. 3000 – 500 a. C.', color: '#f59e0b', needs: ['🛒', '🌾', '🔭'],
    intro: 'Entre los ríos Tigris y Éufrates, los escribas anotaban en tablillas de arcilla cuentas de granos, impuestos y estrellas. Su sistema sexagesimal (base 60) sobrevive en nuestras horas, minutos y grados.',
    events: [
      { year: 'c. 3000 a. C.', title: 'Numeración y escritura cuneiforme', text: 'Sumerios y acadios registran cantidades con signos de cuña en arcilla para llevar cuentas de cebada y rebaños.' },
      { year: 'c. 2000 a. C.', title: 'Sistema posicional en base 60', text: 'Los escribas usan un sistema posicional: el valor de un signo depende de su lugar. Por eso 1 hora = 60 minutos y 1 círculo = 360°.' },
      { year: 'c. 1800 a. C.', title: 'Plimpton 322', text: 'Una tablilla lista ternas como (3, 4, 5) o (5 12 13) y muestra que ya conocían la relación pitagórica mucho antes de Pitágoras.' },
      { year: 'c. 1800 – 1600 a. C.', title: 'YBC 7289 y la raíz de 2', text: 'Una tablilla escolar da √2 ≈ 1;24,51,10 en base 60 (≈ 1,41421296): precisión de seis cifras decimales.' },
    ],
    quest: { name: 'El escriba de las cuentas', gen: 'basic_ops@2' },
  },
  {
    id: 'egipto', icon: '🇪🇬', name: 'Egipto', span: 'c. 3000 – 300 a. C.', color: '#eab308', needs: ['📏', '🏛️', '🌾'],
    intro: 'Cada año el Nilo borraba los linderos: había que volver a medir los campos. Los escribas egipcios desarrollaron geometría práctica, fracciones unitarias y métodos para repartir y construir.',
    events: [
      { year: 'c. 1850 a. C.', title: 'Papiro de Moscú', text: 'Contiene 25 problemas, entre ellos el cálculo del volumen de un tronco de pirámide.' },
      { year: 'c. 1550 a. C.', title: 'Papiro Rhind (Ahmes)', text: 'Copiado por el escriba Ahmes de una obra anterior: 84 problemas con fracciones unitarias, ecuaciones y áreas. Aproxima π con (16/9)² ≈ 3,16.' },
      { year: 'c. 2500 a. C.', title: 'Geometría para construir', text: 'Las grandes pirámides exigían nivelación, ángulos y proporciones muy precisos.' },
    ],
    quest: { name: 'El reparto del Nilo', gen: 'frac_ops@2' },
  },
  {
    id: 'grecia', icon: '🇬🇷', name: 'Grecia', span: 'c. 600 a. C. – 600 d. C.', color: '#38bdf8', needs: ['🏛️', '🔭', '📏'],
    intro: 'Los matemáticos griegos y helenísticos (en Atenas, Alejandría y Siracusa) pusieron el acento en la demostración lógica: no basta que algo funcione, hay que explicar por qué.',
    events: [
      { year: 'c. 600 a. C.', title: 'Tales de Mileto', text: 'Se le atribuyen razonamientos geométricos sobre semejanza; la tradición cuenta que midió la altura de una pirámide con su sombra.' },
      { year: 'c. 300 a. C.', title: 'Los Elementos de Euclides', text: 'Compila y organiza la geometría con definiciones, postulados y demostraciones: un modelo del método matemático durante más de dos mil años.' },
      { year: 'c. 250 a. C.', title: 'Arquímedes de Siracusa', text: 'Acota π entre 3 10/71 y 3 1/7 con polígonos de 96 lados; calcula áreas y volúmenes con un método precursor del cálculo integral.' },
      { year: 'c. 240 a. C.', title: 'Eratóstenes mide la Tierra', text: 'Con la sombra de un palo en Alejandría y un pozo en Siena estima la circunferencia terrestre con un error de pocos por ciento.' },
      { year: 'c. 250 d. C.', title: 'Diofanto de Alejandría', text: 'Su Aritmética estudia ecuaciones con soluciones enteras o racionales y usa abreviaturas para las incógnitas.' },
      { year: 'c. 400 d. C.', title: 'Hipatia de Alejandría', text: 'Matemática y astrónoma, enseñó y comentó obras de Diofanto y Apolonio. Fue asesinada en 415 en un contexto de violencia política.' },
    ],
    quest: { name: 'La sombra de Eratóstenes', gen: 'elevation' },
  },
  {
    id: 'india', icon: '🇮🇳', name: 'India', span: 'c. 800 a. C. – 1600 d. C.', color: '#f472b6', needs: ['🔭', '🛒', '🏛️'],
    intro: 'Matemáticos indios perfeccionaron la numeración decimal posicional, trataron el cero como un número con reglas propias y desarrollaron trigonometría y series infinitas siglos antes de su llegada a Europa.',
    events: [
      { year: 'c. 800 – 500 a. C.', title: 'Sulba Sutras', text: 'Manuales de construcción de altares con geometría: describen la relación del teorema de Pitágoras y aproximaciones de √2.' },
      { year: 'c. 499', title: 'Aryabhata', text: 'Escribe el Aryabhatiya: tabla de senos, aproximación π ≈ 3,1416 y métodos astronómicos.' },
      { year: '628', title: 'Brahmagupta y el cero', text: 'En el Brahmasphutasiddhanta formula reglas para operar con cero y números negativos (deudas y fortunas) y resuelve ecuaciones cuadráticas.' },
      { year: 'c. 1350 – 1425', title: 'Escuela de Kerala (Madhava)', text: 'Madhava y sus seguidores hallaron series infinitas para seno, coseno y arcotangente, siglos antes de Newton y Leibniz.' },
    ],
    quest: { name: 'El misterio del cero', gen: 'concept:zero', mission: 'cero' },
  },
  {
    id: 'china', icon: '🇨🇳', name: 'China', span: 'c. 1000 a. C. – 1300 d. C.', color: '#ef4444', needs: ['🌾', '🏛️', '🔭'],
    intro: 'Con varillas de cálculo sobre un tablero, los matemáticos chinos resolvían sistemas de ecuaciones y problemas de reparto. Su tradición escrita incluye textos de gran influencia para la administración y la astronomía.',
    events: [
      { year: 'c. siglo I a. C. – I d. C.', title: 'Los nueve capítulos', text: 'Texto con 246 problemas: áreas, volúmenes y un método de eliminación para sistemas lineales (fangcheng), antecedente del que hoy llamamos gaussiano.' },
      { year: 'c. 263', title: 'Liu Hui', text: 'Comenta los nueve capítulos y aproxima π ≈ 3,1416 con un polígono de 3072 lados.' },
      { year: 'c. 480', title: 'Zu Chongzhi', text: 'Obtiene 355/113 como aproximación de π, precisa hasta seis decimales: récord durante casi mil años.' },
      { year: 'c. siglo III–V', title: 'Teorema chino del resto', text: 'El texto de Sunzi plantea un problema de congruencias que hoy es herramienta de la criptografía y la computación.' },
    ],
    quest: { name: 'Los sistemas de las varillas', gen: 'system_2x2' },
  },
  {
    id: 'islam', icon: '🌙', name: 'Mundo islámico', span: 'siglos VIII – XV', color: '#14b8a6', needs: ['🧭', '🔭', '🛒'],
    intro: 'En Bagdad, El Cairo, Samarcanda y Al-Ándalus, sabios de distintas lenguas y religiones tradujeron, criticaron y ampliaron el saber griego, indio y persa. El álgebra y los numerales que usamos pasaron por sus manos.',
    events: [
      { year: 'c. 820', title: 'Al-Juarismi y el álgebra', text: 'Su libro Al-kitāb al-mukhtaṣar fī ḥisāb al-jabr wa-l-muqābala da métodos sistemáticos para resolver ecuaciones. “Álgebra” viene de al-jabr; “algoritmo”, de su nombre latinizado.' },
      { year: 'c. 1000', title: 'Al-Karaji', text: 'Desarrolla el cálculo algebraico con polinomios y una forma temprana de inducción.' },
      { year: 'c. 1070', title: 'Omar Jayyam', text: 'Clasifica y resuelve ecuaciones cúbicas con cónicas; también reformó el calendario persa.' },
      { year: 'c. 1424', title: 'Al-Kashi', text: 'Calcula π con 16 decimales y la ley de cosenos en su forma trigonométrica.' },
    ],
    quest: { name: 'La balanza de Al-Juarismi', gen: 'linear_eq@2' },
  },
  {
    id: 'africa', icon: '🌍', name: 'África y su saber', span: 'c. 40 000 años – hoy', color: '#84cc16', needs: ['🛒', '📏', '🏛️'],
    intro: 'Algunos de los registros de conteo más antiguos conocidos vienen de África, y su tradición matemática sigue viva en patrones, calendarios y comercio. Mucho se perdió o no se escribió: el silencio de las fuentes no es ausencia de saber.',
    events: [
      { year: 'c. 40 000 a. C.', title: 'Hueso de Lebombo (Suazilandia)', text: 'Un peroné de babuino con 29 muescas, uno de los objetos de conteo más antiguos conocidos (su interpretación sigue en debate).' },
      { year: 'c. 20 000 a. C.', title: 'Hueso de Ishango (Congo)', text: 'Hueso con grupos de marcas que podrían indicar conteo, aritmética sencilla o un calendario lunar; los expertos discrepan sobre su función.' },
      { year: 'tradición', title: 'Patrones Sona (Angola)', text: 'Los pueblos Chokwe trazan dibujos con una sola línea continua en la arena, geometría que hoy estudia la teoría de grafos.' },
      { year: 'siglos XIII–XVI', title: 'Tombuctú', text: 'Bibliotecas privadas conservaron miles de manuscritos de astronomía, matemáticas y derecho.' },
    ],
    quest: { name: 'Marcas en el hueso', gen: 'basic_ops' },
  },
  {
    id: 'america', icon: '🌎', name: 'América indígena', span: 'c. 1000 a. C. – 1500 d. C.', color: '#fb923c', needs: ['🌾', '🔭', '🏛️'],
    intro: 'Mayas, mexicas, incas y otros pueblos construyeron sistemas numéricos y calendarios sofisticados, adaptados a su agricultura, su astronomía y su administración.',
    events: [
      { year: 'c. 36 a. C.', title: 'El cero maya', text: 'Los mayas usaron un sistema de base 20 con un símbolo para el cero (una concha), de forma independiente a otras culturas.' },
      { year: 'siglos I–XVI', title: 'Calendarios mayas', text: 'Combinaron ciclos de 260 y 365 días y registraron ciclos de Venus con gran precisión.' },
      { year: 'siglos XIV–XVI', title: 'Quipus incas', text: 'Cuerdas con nudos que guardaban datos numéricos en base 10 para impuestos y censos.' },
      { year: 'siglos XIV–XVI', title: 'Yupana', text: 'Tablero de cálculo andino cuyo uso exacto aún se investiga.' },
    ],
    quest: { name: 'Nudos que cuentan', gen: 'place_value' },
  },
  {
    id: 'medieval', icon: '🏰', name: 'Europa medieval', span: 'siglos XII – XIV', color: '#a78bfa', needs: ['🛒', '🧭'],
    intro: 'Las universidades y el comercio mediterráneo trajeron a Europa el saber árabe, indio y griego. Los numerales indoarábigos desplazaron lentamente a los romanos.',
    events: [
      { year: '1202', title: 'Liber Abaci (Fibonacci)', text: 'Leonardo de Pisa explica los numerales indoarábigos para comerciantes europeos. Su sucesión 1, 1, 2, 3, 5, 8… ya era conocida en la India.' },
      { year: 'c. 1350', title: 'Nicole Oresme', text: 'Introduce representaciones gráficas de cantidades variables y estudia series: antecedentes de las gráficas modernas.' },
    ],
    quest: { name: 'Los conejos de Fibonacci', gen: 'basic_ops@2' },
  },
  {
    id: 'renacimiento', icon: '🎨', name: 'Renacimiento', span: 'siglos XV – XVI', color: '#f43f5e', needs: ['🏛️', '🧭', '🔭'],
    intro: 'La imprenta, la perspectiva en pintura y la navegación oceánica revitalizaron las matemáticas. Se resolvieron ecuaciones de tercer y cuarto grado y se creó la notación simbólica.',
    events: [
      { year: '1494', title: 'Summa de Luca Pacioli', text: 'Libro de aritmética, álgebra y contabilidad por partida doble.' },
      { year: '1545', title: 'Ecuaciones cúbicas y cuárticas', text: 'Tartaglia, del Ferro, Cardano y Ferrari obtienen métodos de solución; la polémica sobre la prioridad es célebre.' },
      { year: '1557', title: 'El signo igual', text: 'Robert Recorde propone “=” porque “dos cosas no pueden ser más iguales que dos rectas paralelas”.' },
      { year: '1591', title: 'Viète y las letras', text: 'François Viète usa letras para parámetros y incógnitas: nace el álgebra simbólica moderna.' },
    ],
    quest: { name: 'El duelo de las cúbicas', gen: 'quadratic_eq@2' },
  },
  {
    id: 'cientifica', icon: '🔬', name: 'Revolución científica', span: 'siglo XVII – XVIII', color: '#6366f1', needs: ['🔬', '🔭', '⚙️'],
    intro: 'Descartes unió álgebra y geometría; Fermat y Pascal fundaron la probabilidad; Newton y Leibniz, trabajando de forma independiente, construyeron el cálculo; Euler organizó gran parte de la matemática moderna.',
    events: [
      { year: '1614', title: 'Logaritmos (Napier)', text: 'John Napier publica tablas que reducen multiplicaciones a sumas.' },
      { year: '1637', title: 'La Géométrie (Descartes)', text: 'Descartes (y Fermat de forma independiente) vinculan álgebra y geometría: nacen las coordenadas cartesianas.' },
      { year: '1654', title: 'Pascal y Fermat: probabilidad', text: 'Su correspondencia sobre un juego de azar inaugura la teoría de la probabilidad.' },
      { year: '1684 – 1687', title: 'Leibniz y Newton: cálculo', text: 'Leibniz publica su cálculo (notación dy/dx y ∫); Newton publica los Principia en 1687. Hubo una larga disputa de prioridad, hoy se reconoce la independencia de ambos.' },
      { year: '1748', title: 'Euler y Agnesi', text: 'Euler publica Introductio in analysin infinitorum. Ese mismo año, María Gaetana Agnesi publica Instituzioni analitiche, uno de los primeros textos completos de cálculo.' },
    ],
    quest: { name: 'La curva de Agnesi', gen: 'deriv_poly@2' },
  },
  {
    id: 'industrial', icon: '🏭', name: 'Revolución industrial', span: 'siglo XIX', color: '#64748b', needs: ['⚙️', '🧭', '💻'],
    intro: 'El vapor, el telégrafo y la electricidad pidieron matemáticas nuevas. Se exigió rigor, se descubrieron geometrías no euclidianas y se imaginaron las primeras máquinas programables.',
    events: [
      { year: '1801', title: 'Disquisitiones Arithmeticae (Gauss)', text: 'Gauss funda la teoría de números moderna con solo 24 años.' },
      { year: '1832', title: 'Évariste Galois', text: 'Muere con 20 años, pero sus ideas sobre simetrías de ecuaciones dieron origen a la teoría de grupos.' },
      { year: '1843', title: 'Ada Lovelace', text: 'Sus notas sobre la Máquina Analítica de Babbage incluyen lo que se considera el primer algoritmo publicado destinado a una máquina.' },
      { year: '1854', title: 'George Boole', text: 'Publica Las leyes del pensamiento: la lógica se escribe en forma algebraica, base de la computación.' },
      { year: '1874', title: 'Georg Cantor', text: 'Demuestra que hay infinitos de distinto tamaño: los reales son “más” que los naturales.' },
    ],
    quest: { name: 'La máquina de Ada', gen: 'basic_ops@3' },
  },
  {
    id: 'moderna', icon: '💻', name: 'Siglos XX y XXI', span: '1900 – hoy', color: '#0ea5e9', needs: ['💻', '🔬', '⚙️'],
    intro: 'Hilbert planteó 23 problemas en 1900; Gödel mostró los límites de las demostraciones; Turing definió qué significa calcular; Shannon midió la información. Hoy las matemáticas sostienen la criptografía, la IA y la ciencia de datos.',
    events: [
      { year: '1918', title: 'Teorema de Noether', text: 'Emmy Noether relaciona simetrías con leyes de conservación en física.' },
      { year: '1931', title: 'Gödel', text: 'Los teoremas de incompletitud muestran que en todo sistema formal suficientemente rico hay verdades que no se pueden demostrar dentro de él.' },
      { year: '1936', title: 'Alan Turing', text: 'Define la máquina de Turing: un modelo matemático de lo que es un algoritmo.' },
      { year: '1948', title: 'Claude Shannon', text: 'Fundamenta la teoría de la información: cada mensaje se mide en bits.' },
      { year: '1994 – 1995', title: 'Último teorema de Fermat', text: 'Andrew Wiles (con Richard Taylor) demuestra una conjetura de más de 350 años.' },
      { year: '2014', title: 'Maryam Mirzakhani', text: 'Primera mujer en ganar la Medalla Fields, por sus trabajos en geometría de superficies de Riemann.' },
    ],
    quest: { name: 'Bits y binario', gen: 'basic_ops@2' },
  },
  {
    id: 'contemporanea', icon: '🚀', name: 'Matemáticas contemporáneas', span: 'hoy', color: '#d946ef', needs: ['💻', '🔬'],
    intro: 'Cada año aparecen nuevos resultados: pruebas verificadas por computadora, algoritmos de aprendizaje, criptografía poscuántica. Para saber qué es noticia HOY usa 🌐 Buscar en Internet: aquí no inventamos información actual.',
    events: [
      { year: '1976', title: 'El teorema de los cuatro colores', text: 'Appel y Haken lo demuestran con ayuda de computadora: primera gran prueba asistida por ordenador.' },
      { year: '2003', title: 'Conjetura de Poincaré', text: 'Grigori Perelman publica la demostración; rechazó la Medalla Fields y el premio del milenio.' },
      { year: '2019', title: 'Karen Uhlenbeck', text: 'Primera mujer en recibir el Premio Abel.' },
      { year: '2022', title: 'Medallas Fields', text: 'Entre los premiados: Maryna Viazovska (empaquetamiento de esferas en dimensión 8) y June Huh (combinatoria).' },
    ],
    quest: { name: 'Frontera abierta', gen: 'quadratic_eq@3', web: true },
  },
];

export const ERA_BY_ID = Object.fromEntries(ERAS.map((e) => [e.id, e]));

/** Misión histórica: EL MISTERIO DEL CERO */
export const ZERO_MISSION = {
  id: 'cero', title: 'El misterio del cero', region: 'aritmetica',
  chapters: [
    { place: 'Mesopotamia · c. 2000 a. C.', text: 'Los escribas babilonios escribían 3 y 3 0 de formas parecidas: sin un signo para “vacío”, 36 podía ser 36 o 306. Primero usaron un espacio; siglos después, un símbolo de dos cuñas inclinadas como marcador.',
      q: { prompt: 'Sin cero, ¿qué problema aparece al escribir 306 y 36 con un sistema posicional?', choices: ['Se confunden: no se sabe cuántas posiciones hay vacías', 'Los números son demasiado grandes', 'No se puede sumar', 'No hay problema'], answer: 0, explain: 'Un marcador de posición evita confundir 306 con 36 (o con 3 06).' } },
    { place: 'Mayas · c. 36 a. C. en adelante', text: 'Los mayas escribían números en base 20 y usaron un signo en forma de concha para el cero, para sus calendarios de largo conteo. Fue una invención independiente.',
      q: { prompt: 'Los mayas usaban base 20. Si un “lugar” vale 20 veces el anterior, ¿cuánto vale el tercer lugar (20 × 20)?', choices: ['400', '40', '200', '8000'], answer: 0, explain: '20 × 20 = 400.' } },
    { place: 'India · siglo VII', text: 'En 628, Brahmagupta escribió reglas para operar con el cero como número: “un número menos sí mismo es cero”, y también reglas para sumar y multiplicar con él (aunque dividir entre cero le dio problemas). El manuscrito Bakhshali ya usaba un punto como cero; su datación es discutida.',
      q: { prompt: 'Calcula $7 - 7$, $7\\cdot 0$ y $0 + 5$. ¿Cuál es la suma de los tres resultados?', choices: ['5', '7', '12', '0'], answer: 0, explain: '0 + 0 + 5 = 5.' } },
    { place: 'Bagdad y Pisa · siglos IX–XIII', text: 'Al-Juarismi describió el sistema decimal posicional con cero en un tratado que, traducido al latín, difundió estos “numerales indios” (“algoritmi” = Al-Juarismi). En 1202, Fibonacci los explicó a los mercaderes italianos en el Liber Abaci.',
      q: { prompt: '¿Qué palabra moderna viene del nombre de Al-Juarismi?', choices: ['Algoritmo', 'Algebra únicamente', 'Aritmética', 'Número'], answer: 0, explain: '“Algoritmo” deriva de “Algoritmi”, la latinización de Al-Juarismi (“álgebra” viene de al-jabr).' } },
    { place: 'Hoy · computación', text: 'Un computador solo entiende dos símbolos: 0 y 1. El cero, que costó siglos de aceptar, es la mitad del alfabeto de todas las máquinas. Sin él no habría sistema binario, ni programas, ni CAPICÚA.',
      q: { prompt: 'En binario, 101 representa ¿qué número decimal?', choices: ['5', '3', '6', '101'], answer: 0, explain: '1·4 + 0·2 + 1·1 = 5.' } },
  ],
  reward: { xp: 150, pi: 60, codex: 'cero' },
};
