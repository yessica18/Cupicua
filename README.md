# CAPICÚA · El universo del saber

> **APRENDE. EQUIVÓCATE. COMPRENDE. DOMINA.**
> *Cada error es información.*

Plataforma educativa web, hecha como un videojuego espacial, para estudiar matemáticas, física e ingeniería (bachillerato y primeros años de universidad). Se entrega como **un solo archivo `index.html`** que funciona con doble clic en Chrome y se puede publicar gratis para siempre (ver [`PUBLICAR.md`](PUBLICAR.md)).

## Qué hay dentro

| Área | Qué hace |
|---|---|
| 🌌 **Mapa estelar 3D** | 12 regiones = 12 objetos celestes reales que parpadean (magnetar, Wolf-Rayet, Rectángulo Rojo, estrella de Tabby, nebulosas…). Arrastra, pellizca y toca. |
| ⚔️ **Lecciones = combates cortos** | Respuesta correcta → hiere al enemigo (barra de vida). Error → te hiere a ti, pero CAPIA te explica el error. Curitas 🩹 y vendas 🧻 curan; el enemigo vuelve si pierdes y solo aparece uno nuevo cuando lo derrotas. |
| 🧠 **CAPIA** | Tutora socrática con detección de emociones, voz (síntesis y reconocimiento), lectura de PDF en voz alta, resúmenes, tarjetas, Pomodoro 50/10 y revisión de fotos (con IA conectada). |
| 📚 **Contenido** | 12 materias × 16 niveles (192), 134 generadores de ejercicios **infinitos y verificados**, 10 teoremas con sus 18 etapas, 41 mentores históricos, línea de tiempo de 14 culturas, enciclopedia, laboratorios virtuales. |
| 🎲 **Juegos** | Tablas de multiplicar adaptativas, sudoku (4×4, 6×6, 9×9 con solución única), juego del 24, acertijos, desafío diario, desafíos legendarios, zonas secretas y π. |
| 🐙 **Acuario** | 50 criaturas marinas reales (nudibranquios, pulpos, medusas, peces ángel, pez fango, cangrejo yeti…) como mascotas **solo cosméticas**; probabilidades publicadas, sin dinero real. |
| 📅 **Calendario** | Parciales y entregas; “Preparar mi parcial” arma un plan con repasos espaciados, simulacros y descansos; exporta `.ics` (Google Calendar). |
| 📈 **Aprendizaje** | Dominio por habilidad (precisión, variedad, retención, aplicación, explicación, recuperación), repetición espaciada, intercalado, tarjetas de memoria, 378 logros. |
| 👥 **Comunidad** | Pizarra, Pomodoro, retos por código, misión cooperativa y **llamadas de voz/video entre dos personas sin servidor** (WebRTC con intercambio de códigos). |

## Cómo usarla
1. Abre `index.html` en Google Chrome (doble clic).
2. Crea tu cuenta (se guarda en el dispositivo; sin correo: recuperas con un código), elige materia, avatar y mentor.
3. Un tutorial deslizable aparece solo la primera vez. ¡A combatir!

## Desarrollo
```bash
npm install
npm run dev      # servidor de desarrollo (abre /index.dev.html)
npm test         # 151 pruebas: motor matemático, 134 generadores, contenido y motor de progreso
npm run build    # compila todo en UN index.html en la raíz
```

Estructura: `shared/` (motor matemático, generadores de ejercicios, contenido, motor de progreso y logros — sin dependencias de navegador y probado con Node), `src/` (interfaz, 3D, arte SVG, audio), `tools/publish.mjs`.

### Calidad matemática
Cada generador se ejecuta con cientos de semillas en las pruebas: se comprueba que acepte su respuesta correcta, rechace una incorrecta y, cuando aplica, verifique la solución de forma **independiente** (sustitución, derivación numérica, integración numérica…). Las respuestas se comparan por equivalencia matemática, no por texto.

## Lo que NO hace (todavía) y por qué
- **Salas multiusuario en tiempo real, foro moderado, rankings entre desconocidos, cuentas en la nube**: necesitan un servidor con moderación. Esta versión no depende de ninguno para que nunca caduque.
- **Fine-tuning de un modelo**: no se entrena ningún modelo aquí. CAPIA usa un *prompt de sistema* pedagógico (`src/lib/tutor.js`, `SYSTEM_PROMPT`) y, si cada persona pega su clave de IA (Perfil → Ajustes), conversa con Claude directamente desde su navegador.
- **Biblioteca de libros y repositorio de exámenes de las mejores universidades**: no se pueden copiar ni redistribuir materiales protegidos. CAPICÚA lista los textos de referencia, enlaza recursos abiertos (p. ej. MIT OpenCourseWare) y genera problemas ilimitados del mismo estilo.
- **Fotos de ejercicios**: la lectura de imágenes requiere la IA conectada; sin ella CAPIA pide escribir el enunciado y guía paso a paso.
- Las criaturas marinas son una selección curada (50), no “todas las especies”.

## Privacidad y seguridad
Sin correo ni datos personales; contraseñas con PBKDF2-SHA256 + sal; recuperación por código; CSP estricta; cuentas, progreso y documentos solo en el dispositivo; exportar y borrar desde Perfil → Datos. Menores de edad: sin contacto con desconocidos (las funciones sociales requieren compartir un código con alguien conocido).
