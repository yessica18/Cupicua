# Publicar CAPICÚA con su propio enlace (gratis y sin fecha de vencimiento)

CAPICÚA es **un solo archivo**: `index.html`. No tiene servidor ni base de datos que se apaguen o caduquen.
Cada persona guarda su progreso en su propio navegador, así que puede estar publicada para siempre sin costo.

> **Probarla ya:** haz doble clic en `index.html` y se abre en Google Chrome. Todo funciona sin instalar nada.

---

## La verdad sobre el dominio (léelo antes de elegir)

| Quiero… | ¿Es posible gratis y para siempre? |
|---|---|
| Un enlace con mi nombre tipo `capicua.pages.dev` o `usuario.github.io/capicua` | ✅ **Sí.** Sin costo, sin renovación, con HTTPS incluido. |
| Un dominio propio de verdad, tipo `capicua.com` | ❌ **No existe gratis y permanente.** Todo dominio propio se paga cada año (aprox. 10–15 USD el `.com`). |

La recomendación: **empieza con el enlace gratuito** (funciona igual, nunca vence) y, cuando quieras, compra un `.com` y lo conectas sin cambiar nada de la página (ver Paso 4).

Opciones gratuitas permanentes (elige una):

1. **GitHub Pages** → `https://TU-USUARIO.github.io/NOMBRE-DEL-REPOSITORIO/` (la más sencilla si ya tienes el repositorio).
2. **Cloudflare Pages** → `https://capicua.pages.dev` (si el nombre está libre; si no, `capicua-saber.pages.dev`). Muy rápida en todo el mundo.
3. **Netlify** → `https://capicua.netlify.app` (arrastras el archivo y listo).

---

## Paso 1 · Subir CAPICÚA a GitHub (si aún no está)

Ya tienes el repositorio **Cupiua** y el trabajo está en la rama `claude/capicua-educational-platform-2h23oz`.

**Forma A: pasar los cambios a la rama principal (recomendada)**
1. Entra a `https://github.com/yessica18/Cupiua`.
2. Toca la pestaña **Pull requests → New pull request**.
3. En *base* elige `main` y en *compare* elige `claude/capicua-educational-platform-2h23oz`.
4. Toca **Create pull request** y luego **Merge pull request → Confirm merge**.

**Forma B: subir el archivo a mano (sin comandos)**
1. En GitHub toca **+ → New repository**. Nombre: `capicua`. Público. **Create repository**.
2. Toca **uploading an existing file**.
3. Arrastra `index.html` y el archivo `.nojekyll` (si no lo ves, no importa).
4. Abajo toca **Commit changes**.

## Paso 2 · Encenderlo con GitHub Pages (gratis)
1. En el repositorio entra a **Settings → Pages**.
2. En *Build and deployment → Source* elige **Deploy from a branch**.
3. En *Branch* elige `main` y la carpeta **/ (root)**. Toca **Save**.
4. Espera 1–2 minutos y recarga. Arriba aparece tu enlace, por ejemplo `https://yessica18.github.io/Cupiua/`.
5. (Opcional) Para que el enlace diga **capicua**: en **Settings → General → Repository name** cámbialo a `capicua`; el enlace pasará a ser `https://yessica18.github.io/capicua/`.

Listo: no hay nada que renovar. Mientras el repositorio exista, la página existe.

## Paso 2b · Alternativa: Cloudflare Pages (con nombre `capicua.pages.dev`)
1. Crea una cuenta gratis en `dash.cloudflare.com`.
2. **Workers & Pages → Create → Pages → Upload assets**.
3. Nombre del proyecto: `capicua` → **Create project**.
4. Arrastra una carpeta que contenga `index.html` → **Deploy site**.
5. Tu enlace: `https://capicua.pages.dev`. Para actualizar, repite la subida con el archivo nuevo.

## Paso 2c · Alternativa: Netlify (todavía más fácil)
1. Entra a `app.netlify.com/drop`.
2. Arrastra la carpeta con `index.html`.
3. Te da un enlace `https://algo.netlify.app`; en **Site configuration → Change site name** lo cambias a `capicua`.

---

## Paso 2d · Publicación automática (opcional, recomendada)
El repositorio ya trae `.github/workflows/pages.yml`. Cuando la rama `main` cambie, GitHub prueba, compila y publica solo:
1. **Settings → Pages → Build and deployment → Source: GitHub Actions**.
2. Haz el *merge* de la PR a `main`. En la pestaña **Actions** verás «Publicar en GitHub Pages»; al terminar, tu enlace queda actualizado.

## Paso 3 · Compartirlo
Una vez publicada en `https://`, CAPICÚA se puede **instalar como app** (Chrome: menú ⋮ → *Instalar CAPICÚA*) y **abre sin conexión** después de la primera visita.
Comparte el enlace por WhatsApp o genera un QR (por ejemplo con `qr-code-generator.com`). En celulares también se puede **añadir a la pantalla de inicio** desde el menú de Chrome.

## Paso 4 · (Opcional, de pago) Tu propio `capicua.com`
1. Compra el dominio en un registrador de confianza (Cloudflare Registrar, Porkbun o Namecheap). Activa **renovación automática** y la **protección de privacidad WHOIS** (en la mayoría es gratuita).
2. En GitHub Pages: **Settings → Pages → Custom domain** → escribe `capicua.com` → **Save** → marca **Enforce HTTPS**.
3. En el DNS del dominio crea:
   - 4 registros **A** para `@` hacia `185.199.108.153`, `185.199.109.153`, `185.199.110.153`, `185.199.111.153`
   - 1 registro **CNAME** para `www` hacia `TU-USUARIO.github.io`
4. Espera entre minutos y unas horas. Si cambias de enlace en el futuro, deja una redirección 301 desde el anterior.

---

## Cómo mantenerla segura, rápida y respaldada
- **HTTPS:** lo dan GitHub, Cloudflare y Netlify automáticamente (certificado SSL gratis).
- **Rápida:** es un solo archivo (~2 MB, ~0,9 MB comprimido) sin servidores que procesar. Los CDN la sirven desde cerca de cada persona.
- **Sin contraseñas de administrador:** no hay panel que hackear. Activa la verificación en dos pasos en tu cuenta de GitHub.
- **Copias de seguridad:** cada versión queda guardada en el historial de Git. Cada estudiante puede exportar su progreso desde **Perfil → Datos y cuenta**.
- **Datos personales:** CAPICÚA no pide correo, ubicación ni documentos; todo vive en el dispositivo de cada persona.

## ¿Y las salas con amigos en tiempo real, cuentas en la nube y la IA para todos?
Esas funciones necesitan un **servidor**. Los servidores gratuitos suelen dormirse o vencer (por ejemplo, bases de datos gratuitas que caducan a los 30 días), por eso esta versión no depende de ninguno. Lo que sí funciona hoy sin servidor: cuentas locales, retos por código, llamadas de voz/video entre dos personas con un código, pizarra compartida, Pomodoro, calendario, juegos y CAPIA en modo local. Cuando quieras crecer, se agrega un backend (por ejemplo Supabase o el servidor que ya preparaste en la carpeta `CAPICUA_2`) sin cambiar el diseño.

**IA de CAPIA:** en **Perfil → Ajustes** cada persona puede pegar su propia clave de Anthropic. No pongas tu clave en el archivo ni en un repositorio público.

## Actualizar la página cuando cambies algo
Si usas el código fuente: `npm install` y `npm run build` generan un nuevo `index.html`. Súbelo a GitHub junto con `manifest.webmanifest`, `sw.js` y la carpeta `marca` (Add file → Upload files) y en 1–2 minutos la página se actualiza sola.
