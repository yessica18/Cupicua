// Cuentas y progreso guardados en este dispositivo (localStorage).
// Contraseñas: PBKDF2-SHA256 con sal aleatoria (nunca en texto plano). Sin correo: la recuperación usa un código.
import { newState, STATE_VERSION } from '../../shared/engine/game.js';

const K = 'capicua.v1';
const read = (k, d) => { try { return JSON.parse(localStorage.getItem(`${K}.${k}`)) ?? d; } catch { return d; } };
const write = (k, v) => { try { localStorage.setItem(`${K}.${k}`, JSON.stringify(v)); return true; } catch { return false; } };

/* ───── Hash ───── */
const enc = new TextEncoder();
const hex = (buf) => [...new Uint8Array(buf)].map((b) => b.toString(16).padStart(2, '0')).join('');
const rnd = (n = 16) => hex(crypto.getRandomValues(new Uint8Array(n)));

// Respaldo SHA-256 en JS puro (por si el navegador no ofrece crypto.subtle)
function sha256js(str) {
  const K256 = [...Array(64)].map((_, i) => { let n = 0; const p = []; for (let c = 2; p.length <= i; c++) if (!p.some((q) => c % q === 0)) p.push(c); return (Math.cbrt(p[i]) % 1) * 2 ** 32 | 0; });
  let H = [2, 3, 5, 7, 11, 13, 17, 19].map((p) => (Math.sqrt(p) % 1) * 2 ** 32 | 0);
  const bytes = [...enc.encode(str)]; const l = bytes.length * 8; bytes.push(0x80);
  while (bytes.length % 64 !== 56) bytes.push(0);
  for (let i = 7; i >= 0; i--) bytes.push(i > 3 ? 0 : (l >>> (i * 8)) & 255);
  const rotr = (x, n) => (x >>> n) | (x << (32 - n));
  for (let o = 0; o < bytes.length; o += 64) {
    const w = []; for (let i = 0; i < 16; i++) w[i] = (bytes[o + i * 4] << 24) | (bytes[o + i * 4 + 1] << 16) | (bytes[o + i * 4 + 2] << 8) | bytes[o + i * 4 + 3];
    for (let i = 16; i < 64; i++) { const s0 = rotr(w[i - 15], 7) ^ rotr(w[i - 15], 18) ^ (w[i - 15] >>> 3); const s1 = rotr(w[i - 2], 17) ^ rotr(w[i - 2], 19) ^ (w[i - 2] >>> 10); w[i] = (w[i - 16] + s0 + w[i - 7] + s1) | 0; }
    let [a, b, c, d, e, f, g, hh] = H;
    for (let i = 0; i < 64; i++) { const S1 = rotr(e, 6) ^ rotr(e, 11) ^ rotr(e, 25); const ch = (e & f) ^ (~e & g); const t1 = (hh + S1 + ch + K256[i] + w[i]) | 0; const S0 = rotr(a, 2) ^ rotr(a, 13) ^ rotr(a, 22); const mj = (a & b) ^ (a & c) ^ (b & c); const t2 = (S0 + mj) | 0; hh = g; g = f; f = e; e = (d + t1) | 0; d = c; c = b; b = a; a = (t1 + t2) | 0; }
    H = [a, b, c, d, e, f, g, hh].map((v, i) => (H[i] + v) | 0);
  }
  return H.map((v) => (v >>> 0).toString(16).padStart(8, '0')).join('');
}
async function hashSecret(secret, salt) {
  if (crypto?.subtle) {
    const key = await crypto.subtle.importKey('raw', enc.encode(secret), 'PBKDF2', false, ['deriveBits']);
    return 'p' + hex(await crypto.subtle.deriveBits({ name: 'PBKDF2', hash: 'SHA-256', salt: enc.encode(salt), iterations: 150000 }, key, 256));
  }
  let d = secret + salt; for (let i = 0; i < 2000; i++) d = sha256js(d + salt);
  return 's' + d;
}
const safeEq = (a, b) => a.length === b.length && [...a].reduce((r, c, i) => r | (c.charCodeAt(0) ^ b.charCodeAt(i)), 0) === 0;

function recoveryCode() {
  const al = 'ABCDEFGHJKMNPQRSTUVWXYZ23456789'; const b = crypto.getRandomValues(new Uint8Array(12));
  const s = [...b].map((x) => al[x % al.length]).join(''); return `${s.slice(0, 4)}-${s.slice(4, 8)}-${s.slice(8, 12)}`;
}

/* ───── Cuentas ───── */
export const accounts = {
  list: () => Object.values(read('accounts', {})).map((a) => ({ username: a.username, name: a.name, last: a.last })),
  get: (u) => read('accounts', {})[u.toLowerCase()],
  async create({ username, password, name, ageBand }) {
    username = username.trim();
    if (!/^[a-zA-Z0-9_]{3,20}$/.test(username)) throw new Error('El usuario debe tener 3–20 letras, números o _.');
    if (password.length < 8) throw new Error('La contraseña debe tener al menos 8 caracteres.');
    if (password.toLowerCase() === username.toLowerCase()) throw new Error('La contraseña no puede ser igual al usuario.');
    const all = read('accounts', {});
    if (all[username.toLowerCase()]) throw new Error('Ese usuario ya existe en este dispositivo.');
    const salt = rnd(); const rsalt = rnd(); const code = recoveryCode();
    all[username.toLowerCase()] = { username, name: name.trim() || username, ageBand, salt, hash: await hashSecret(password, salt), rsalt, rhash: await hashSecret(code.replace(/-/g, ''), rsalt), created: Date.now(), last: Date.now() };
    write('accounts', all);
    return { code };
  },
  async verify(username, password) {
    const a = this.get(username.trim());
    const h = await hashSecret(password, a?.salt || 'x'.repeat(32));
    if (!a || !safeEq(h, a.hash)) throw new Error('Usuario o contraseña incorrectos.');
    const all = read('accounts', {}); all[a.username.toLowerCase()].last = Date.now(); write('accounts', all);
    return a;
  },
  async recover(username, code, newPassword) {
    const a = this.get(username.trim());
    const ok = a && safeEq(await hashSecret(code.toUpperCase().replace(/[^A-Z0-9]/g, ''), a.rsalt), a.rhash);
    if (!ok) throw new Error('Usuario o código de recuperación incorrectos.');
    if (newPassword.length < 8) throw new Error('La contraseña debe tener al menos 8 caracteres.');
    const all = read('accounts', {}); const x = all[a.username.toLowerCase()];
    const nc = recoveryCode(); x.salt = rnd(); x.hash = await hashSecret(newPassword, x.salt); x.rsalt = rnd(); x.rhash = await hashSecret(nc.replace(/-/g, ''), x.rsalt);
    write('accounts', all); return { code: nc };
  },
  async changePassword(username, oldPw, newPw) { await this.verify(username, oldPw); if (newPw.length < 8) throw new Error('Mínimo 8 caracteres.'); const all = read('accounts', {}); const x = all[username.toLowerCase()]; x.salt = rnd(); x.hash = await hashSecret(newPw, x.salt); write('accounts', all); },
  remove(username) { const all = read('accounts', {}); delete all[username.toLowerCase()]; write('accounts', all); localStorage.removeItem(`${K}.state.${username.toLowerCase()}`); },
};

/* ───── Estado del jugador ───── */
let user = null; let S = null; let timer = null; const listeners = new Set();
export const session = { get: () => read('session', null), set: (u) => (u ? write('session', { u }) : localStorage.removeItem(`${K}.session`)) };

function migrate(s) {
  const base = newState();
  s = { ...base, ...s, profile: { ...base.profile, ...s.profile, avatar: { ...base.profile.avatar, ...(s.profile?.avatar || {}) } }, stats: { ...base.stats, ...s.stats }, streak: { ...base.streak, ...s.streak }, settings: { ...base.settings, ...s.settings, privacy: { ...base.settings.privacy, ...(s.settings?.privacy || {}) } } };
  // Extensiones del juego
  s.game = { hp: 100, hpAt: Date.now(), items: { curita: 2, venda: 1 }, enemies: {}, shells: 1, pets: {}, activePet: null, subject: null, tutorial: false, events: [], tasks: [], cards: {}, stars: {}, apiKey: '', lastDaily: null, ...(s.game || {}) };
  if (!s.settings._init) { s.settings._init = true; try { s.settings.reduceMotion = !!matchMedia('(prefers-reduced-motion: reduce)').matches; } catch { /* sin matchMedia */ } }
  s.v = STATE_VERSION; return s;
}

export function login(account) {
  user = account;
  S = migrate(read(`state.${account.username.toLowerCase()}`, {}));
  if (!S.profile.name) { S.profile.name = account.name; S.profile.username = account.username; S.profile.ageBand = account.ageBand; }
  session.set(account.username);
  document.documentElement.dataset.theme = S.settings.theme;
  applySettings();
  return S;
}
export function logout() { flush(); user = null; S = null; session.set(null); }
export const getUser = () => user;
export const state = () => S;
export function save() { clearTimeout(timer); timer = setTimeout(flush, 350); listeners.forEach((f) => f(S)); }
export function flush() { if (user && S) write(`state.${user.username.toLowerCase()}`, S); }
export const onChange = (f) => { listeners.add(f); return () => listeners.delete(f); };
addEventListener('beforeunload', flush);
document.addEventListener('visibilitychange', () => { if (document.hidden) flush(); });

export function applySettings() {
  if (!S) return;
  const r = document.documentElement;
  r.dataset.theme = S.settings.theme;
  r.style.setProperty('--text-scale', S.settings.textSize / 100);
  r.classList.toggle('hc', !!S.settings.contrast);
  r.classList.toggle('reduce', !!S.settings.reduceMotion);
}
export function resetProgress() { const p = S.profile; const set = S.settings; S = migrate({ profile: p, settings: set, onboarded: true }); S.game.tutorial = true; flush(); }
export const exportData = () => JSON.stringify({ account: { username: user.username, name: user.name }, state: S }, null, 2);
