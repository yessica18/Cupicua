// Preguntas conceptuales escritas a mano (comprensión, no cuentas).
// Cada elemento: { q, choices[], answer(índice), explain, why?, hints? }
export const CONCEPT_BANK = {
  zero: [
    { q: '¿Por qué fue tan importante inventar el **cero** como número (y no solo como un espacio vacío)?', choices: ['Permite que la posición de un dígito tenga sentido y que se pueda calcular con “nada”', 'Porque los antiguos no sabían contar', 'Porque hace los números más cortos', 'Solo sirve para decorar'], answer: 0, explain: 'El cero como marcador de posición y como número permitió el sistema posicional y el cálculo moderno (incluida la computación binaria).' },
  ],
  vector_space: [
    { q: 'Un **espacio vectorial** es un conjunto donde…', choices: ['se puede sumar elementos y multiplicarlos por escalares, y el resultado sigue en el conjunto', 'solo hay flechas dibujadas', 'todos los elementos son positivos', 'solo se puede multiplicar por 2'], answer: 0, explain: 'La cerradura bajo suma y multiplicación por escalares (más algunos axiomas) define un espacio vectorial.' },
    { q: '¿Cuál de estos es un subespacio de $\\mathbb{R}^2$?', choices: ['Una recta que pasa por el origen', 'Una recta que NO pasa por el origen', 'El primer cuadrante', 'Un círculo'], answer: 0, explain: 'Un subespacio debe contener al vector cero y ser cerrado bajo suma y escalares; la recta por el origen lo cumple.' },
    { q: 'La **dimensión** de $\\mathbb{R}^3$ es…', choices: ['3', '2', '1', 'Infinita'], answer: 0, explain: 'Una base de R³ tiene 3 vectores (por ejemplo i, j, k).' },
  ],
  continuity: [
    { q: 'Una función es **continua** en $x=a$ cuando…', choices: ['el límite en a existe y es igual a f(a)', 'f(a) no existe', 'su gráfica tiene un salto en a', 'f(a) = 0'], answer: 0, explain: 'Continuidad = no hay saltos: lím f(x) = f(a).' },
    { q: '¿Cuál de estas funciones NO es continua en $x=0$?', choices: ['$1/x$', '$x^2$', '$\\sin x$', '$e^x$'], answer: 0, explain: '1/x no está definida en 0 y se dispara hacia ±∞.' },
  ],
  inference: [
    { q: 'Un intervalo de confianza al 95% significa que…', choices: ['si repitiéramos el muestreo muchas veces, ~95% de los intervalos contendrían el valor real', 'hay 95% de probabilidad de que la media muestral sea exacta', 'el 95% de los datos están en el intervalo', 'el parámetro cambia 95% de las veces'], answer: 0, explain: 'La confianza describe el método, no un valor particular.' },
    { q: 'Al aumentar el tamaño de la muestra, el margen de error…', choices: ['disminuye', 'aumenta', 'se queda igual siempre', 'se vuelve negativo'], answer: 0, explain: 'El error estándar es σ/√n: más datos, más precisión.' },
  ],
  data_viz: [
    { q: '¿Cuál gráfico es mejor para comparar el tamaño de varias categorías?', choices: ['Barras', 'Un diagrama de caja de una sola variable', 'Una línea de tiempo', 'Un mapa de calor sin ejes'], answer: 0, explain: 'Las barras facilitan comparar longitudes.' },
    { q: 'Un valor muy alejado del resto de los datos se llama…', choices: ['Valor atípico (outlier)', 'Moda', 'Rango', 'Constante'], answer: 0, explain: 'Los atípicos pueden distorsionar la media; la mediana es más robusta.' },
  ],
  eng_modeling: [
    { q: 'Un **modelo matemático** es…', choices: ['una representación simplificada de una situación real con la que podemos hacer predicciones', 'una maqueta de plástico', 'una fórmula que siempre es exacta', 'un examen'], answer: 0, explain: 'Los modelos simplifican (supuestos) para poder calcular y predecir.' },
    { q: 'En ingeniería, ¿por qué se declaran los **supuestos** de un modelo?', choices: ['Porque determinan cuándo el resultado es confiable', 'Para hacer el informe más largo', 'No se declaran', 'Solo para exámenes'], answer: 0, explain: 'Un resultado sin supuestos no se puede evaluar.' },
  ],
  congruence_ctx: [
    { q: 'Dos figuras **congruentes** son…', choices: ['idénticas en forma y tamaño', 'iguales en forma pero distinto tamaño', 'del mismo color', 'siempre triángulos'], answer: 0, explain: 'Congruentes = se pueden superponer exactamente.' },
  ],
  infinity: [
    { q: 'La suma $1 + \\tfrac12 + \\tfrac14 + \\tfrac18 + \\cdots$ (infinitos términos)…', choices: ['converge a 2', 'crece sin límite', 'vale 1', 'no tiene sentido'], answer: 0, explain: 'Es una serie geométrica con a=1, r=1/2: S = 1/(1−1/2) = 2.' },
    { q: '¿Todos los infinitos son del mismo tamaño?', choices: ['No: Cantor mostró que hay infinitos “más grandes” (los reales vs. los naturales)', 'Sí, infinito es infinito', 'El infinito no existe', 'Solo en física'], answer: 0, explain: 'La cardinalidad de los reales es mayor que la de los naturales (argumento diagonal de Cantor).' },
  ],
  domain_range: [
    { q: 'El **dominio** de una función es…', choices: ['el conjunto de entradas permitidas', 'el conjunto de salidas', 'el valor máximo', 'la pendiente'], answer: 0, explain: 'Dominio: valores de x donde la función está definida.' },
  ],
  physics_models: [
    { q: 'Una **magnitud vectorial** (como la fuerza) se caracteriza por tener…', choices: ['módulo y dirección', 'solo módulo', 'solo dirección', 'signo únicamente'], answer: 0, explain: 'Los vectores combinan cuánto y hacia dónde.' },
    { q: 'La **masa** de un objeto…', choices: ['no cambia con el lugar; el peso sí', 'es igual al peso', 'depende del color', 'solo existe en la Tierra'], answer: 0, explain: 'Peso = m·g, y g cambia según el planeta.' },
  ],
};
