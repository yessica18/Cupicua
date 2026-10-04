// Registro, inicio de sesión y recuperación de contraseña (cuentas locales en este dispositivo).
import { h, mount, toast, modal } from '../lib/dom.js';
import { accounts, login, session } from '../lib/store.js';
import { personPortrait } from './capia-portrait.js';
import { IDENTITY } from '../../shared/content/game.js';
import logo from '../../public/marca/capicua-logo-apilado.svg';

const AGES = [['under13', 'Menos de 13 años'], ['13-17', '13 a 17 años'], ['18+', '18 años o más']];

export function authPage(root, onDone, mode = 'login') {
  const existing = accounts.list();
  if (existing.length && mode === 'login' && !authPage.touched) { authPage.touched = true; }
  const msg = h('div.form-msg', { 'aria-live': 'polite' });
  const err = (t) => { msg.className = 'form-msg bad'; msg.textContent = t; };
  const field = (label, attrs) => h('label.field', h('span', label), h('input', attrs));
  let body;

  const loginForm = () => {
    const u = field('Usuario', { name: 'u', autocomplete: 'username', required: true, value: existing[0]?.username || '' });
    const p = field('Contraseña', { name: 'p', type: 'password', autocomplete: 'current-password', required: true });
    const rem = h('label.check', h('input', { type: 'checkbox', checked: true, id: 'rem' }), ' Mantener sesión en este dispositivo');
    return h('form.auth-form', { onsubmit: async (e) => { e.preventDefault(); msg.textContent = ''; try { const a = await accounts.verify(u.querySelector('input').value, p.querySelector('input').value); login(a); if (!rem.querySelector('input').checked) session.set(null); onDone(); } catch (x) { err(x.message); } } },
      h('h2', 'Entrar a CAPICÚA'), existing.length ? h('div.accs', existing.map((a) => h('button.acc', { type: 'button', onclick: () => { u.querySelector('input').value = a.username; p.querySelector('input').focus(); } }, h('b', a.name), h('small', '@' + a.username)))) : null,
      u, p, rem, msg, h('button.btn.primary.big', { type: 'submit' }, '🚀 Entrar'),
      h('div.links', h('button.link', { type: 'button', onclick: () => show(registerForm()) }, 'Crear cuenta nueva'), h('button.link', { type: 'button', onclick: () => show(recoverForm()) }, '¿Olvidaste tu contraseña?')));
  };
  const registerForm = () => {
    const n = field('¿Cómo quieres que te llame CAPIA?', { name: 'n', maxLength: 30, required: true, placeholder: 'Tu nombre o apodo' });
    const u = field('Nombre de usuario', { name: 'u', autocomplete: 'username', required: true, pattern: '[A-Za-z0-9_]{3,20}', placeholder: '3–20 letras, números o _' });
    const p = field('Contraseña (mínimo 8 caracteres)', { name: 'p', type: 'password', autocomplete: 'new-password', required: true, minLength: 8 });
    const age = h('label.field', h('span', 'Tu edad'), h('select', AGES.map(([v, t]) => h('option', { value: v, selected: v === '13-17' }, t))));
    return h('form.auth-form', { onsubmit: async (e) => { e.preventDefault(); msg.textContent = ''; try { const ageBand = age.querySelector('select').value; const r = await accounts.create({ username: u.querySelector('input').value, password: p.querySelector('input').value, name: n.querySelector('input').value, ageBand }); const a = await accounts.verify(u.querySelector('input').value, p.querySelector('input').value); showCode(r.code, () => { login(a); onDone(); }); } catch (x) { err(x.message); } } },
      h('h2', 'Crea tu cuenta'), h('p.hint', 'No pedimos correo. Si olvidas tu contraseña, usarás un código de recuperación que verás una sola vez.'), n, u, p, age, msg,
      h('button.btn.primary.big', { type: 'submit' }, '✨ Crear cuenta'), h('button.link', { type: 'button', onclick: () => show(loginForm()) }, '← Ya tengo cuenta'));
  };
  const recoverForm = () => {
    const u = field('Tu usuario', { name: 'u', required: true }); const c = field('Código de recuperación', { name: 'c', required: true, placeholder: 'XXXX-XXXX-XXXX', autocapitalize: 'characters' }); const p = field('Nueva contraseña', { name: 'p', type: 'password', required: true, minLength: 8 });
    return h('form.auth-form', { onsubmit: async (e) => { e.preventDefault(); msg.textContent = ''; try { const r = await accounts.recover(u.querySelector('input').value, c.querySelector('input').value, p.querySelector('input').value); showCode(r.code, () => show(loginForm()), 'Contraseña restablecida'); } catch (x) { err(x.message); } } },
      h('h2', 'Recuperar contraseña'), h('p.hint', 'Escribe el código de 12 caracteres que guardaste al crear tu cuenta.'), u, c, p, msg, h('button.btn.primary.big', { type: 'submit' }, '🔑 Restablecer'), h('button.link', { type: 'button', onclick: () => show(loginForm()) }, '← Volver'));
  };
  const showCode = (code, next, title = '¡Cuenta creada!') => {
    const m = modal(h('div.stack', h('p', 'Guarda este código en un lugar seguro. Es la única forma de recuperar tu contraseña y no se mostrará otra vez:'), h('div.code', code), h('div.btn-row', h('button.btn.ghost', { onclick: () => { navigator.clipboard?.writeText(code); toast('Código copiado', { icon: '📋' }); } }, '📋 Copiar'), h('button.btn.primary', { onclick: () => { m.close(); } }, 'Ya lo guardé ✔'))), { title, onClose: next });
  };
  const show = (el) => { msg.textContent = ''; body.replaceChildren(el, ); };
  body = h('div.auth-body', existing.length ? loginForm() : registerForm());

  mount(root, h('section.auth',
    h('div.auth-hero', h('img.logo', { src: logo, alt: 'CAPICÚA · El universo del saber' }), h('div.slogan', h('b', 'APRENDE.'), h('b', 'EQUIVÓCATE.'), h('b', 'COMPRENDE.'), h('b', 'DOMINA.')), h('div.capia-wave', personPortrait('capia', { size: 220, expr: 'happy', frame: 'bust', drag: true })), h('p.idn', IDENTITY[Math.floor(Math.random() * IDENTITY.length)])),
    h('div.auth-card', body, h('p.fine', 'Tu progreso se guarda en este dispositivo. Nadie más puede ver tu contraseña: se guarda cifrada.'))));
  // CAPIA saluda al llegar
  setTimeout(() => root.querySelector('.capia-wave canvas')?.__ctl?.anim('wave'), 600);
}
