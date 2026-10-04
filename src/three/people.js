// Avatares 3D estilo chibi construidos con primitivas (sin modelos externos): jugador, mentores y CAPIA.
import * as THREE from 'three';

const toonGrad = (() => { const d = new Uint8Array([120, 120, 120, 255, 175, 175, 175, 255, 225, 225, 225, 255, 255, 255, 255, 255]); const t = new THREE.DataTexture(d, 4, 1, THREE.RGBAFormat); t.minFilter = t.magFilter = THREE.NearestFilter; t.needsUpdate = true; return t; })();
const toon = (color, extra = {}) => new THREE.MeshToonMaterial({ color, gradientMap: toonGrad, ...extra });
const mesh = (geo, mat, pos = [0, 0, 0], scale = [1, 1, 1], rot = [0, 0, 0]) => { const m = new THREE.Mesh(geo, mat); m.position.set(...pos); m.scale.set(...scale); m.rotation.set(...rot); return m; };
const SPH = new THREE.SphereGeometry(1, 28, 20);
const CAP = (r, l) => new THREE.CapsuleGeometry(r, l, 6, 14);
const HCAP = new THREE.SphereGeometry(1, 32, 18, 0, Math.PI * 2, 0, Math.PI * 0.6);

function textTexture(text, { size = 128, color = '#ffc83a', bg = 'transparent', font = 'bold 70px Fraunces, serif' } = {}) {
  const c = document.createElement('canvas'); c.width = c.height = size; const x = c.getContext('2d');
  if (bg !== 'transparent') { x.fillStyle = bg; x.beginPath(); x.roundRect(4, 4, size - 8, size - 8, 22); x.fill(); }
  x.fillStyle = color; x.font = font; x.textAlign = 'center'; x.textBaseline = 'middle'; x.fillText(text, size / 2, size / 2 + 4);
  const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; return t;
}

function hairMeshes(style, color, g, { bangs = true, long = false } = {}) {
  const mat = toon(color); const grp = new THREE.Group();
  const cap = mesh(HCAP, mat, [0, 0.0, -0.04], [0.6, 0.575, 0.6], [-0.38, 0, 0]); grp.add(cap);
  const add = (...a) => grp.add(mesh(...a));
  switch (style) {
    case 'long': case 'wig': case 'braids': add(CAP(0.42, 0.55), mat, [0, -0.28, -0.3], [1.1, 1, 0.6]); add(CAP(0.14, 0.7), mat, [-0.5, -0.25, 0.05]); add(CAP(0.14, 0.7), mat, [0.5, -0.25, 0.05]); if (style === 'braids') { add(CAP(0.11, 0.7), mat, [-0.45, -0.55, 0.3], [1, 1, 1], [0, 0, 0.2]); add(CAP(0.11, 0.7), mat, [0.45, -0.55, 0.3], [1, 1, 1], [0, 0, -0.2]); } break;
    case 'bun': case 'updo': add(SPH, mat, [0, 0.72, -0.1], [0.24, 0.24, 0.24]); break;
    case 'topknot': add(SPH, mat, [0, 0.78, 0], [0.18, 0.2, 0.18]); break;
    case 'pony': add(CAP(0.12, 0.65), mat, [0, 0.05, -0.62], [1, 1, 1], [-0.7, 0, 0]); add(SPH, mat, [0, 0.58, -0.4], [0.14, 0.14, 0.14]); break;
    case 'curly': case 'short-curly': for (let i = 0; i < 14; i++) { const a = (i / 14) * 6.283; add(SPH, mat, [Math.cos(a) * 0.5, 0.2 + Math.sin(i * 1.7) * 0.15, Math.sin(a) * 0.5 - 0.05], [0.18, 0.18, 0.18]); } for (let i = 0; i < 6; i++) add(SPH, mat, [R2(0.35), 0.62 + R2(0.05), R2(0.35)], [0.17, 0.17, 0.17]); break;
    case 'afro': add(SPH, mat, [0, 0.28, -0.05], [0.82, 0.78, 0.8]); break;
    case 'spiky': for (let i = 0; i < 9; i++) { const a = (i / 9) * 6.283; add(new THREE.ConeGeometry(0.13, 0.4, 8), mat, [Math.cos(a) * 0.35, 0.62, Math.sin(a) * 0.35], [1, 1, 1], [Math.sin(a) * 0.5, 0, -Math.cos(a) * 0.5]); } break;
    case 'beard': add(new THREE.ConeGeometry(0.34, 0.65, 14), mat, [0, -0.62, 0.22], [1, 1, 0.7], [Math.PI, 0, 0]); break;
    case 'turban': add(new THREE.TorusGeometry(0.5, 0.17, 10, 24), mat, [0, 0.36, 0], [1, 1, 0.9], [Math.PI / 2, 0, 0]); add(SPH, mat, [0, 0.62, 0], [0.4, 0.28, 0.4]); break;
    default: break; // 'short'
  }
  if (bangs && !['turban', 'afro'].includes(style)) { for (let i = -2; i <= 2; i++) add(CAP(0.095, 0.2), mat, [i * 0.17, 0.4 - Math.abs(i) * 0.05, 0.4 - Math.abs(i) * 0.09], [1, 1, 0.7], [0.5, 0, i * 0.2]); }
  return grp;
}
const R2 = (a) => (Math.random() * 2 - 1) * a;

/**
 * Construye un personaje. opts: {skin, hair, hairColor, top, topColor, accessory, shoes, backpack, effect, pet, capia, outfit, eyeColor, badge}
 */
export function buildPerson(o = {}) {
  const root = new THREE.Group(); const body = new THREE.Group(); root.add(body);
  const skin = toon(o.skin || '#e8b998');
  // Cabeza
  const head = new THREE.Group(); head.position.y = 1.18; body.add(head);
  head.add(mesh(SPH, skin, [0, 0, 0], [0.56, 0.52, 0.54]));
  // Ojos grandes expresivos
  const eyeCol = o.eyeColor || '#2a1f3d'; const eyes = new THREE.Group(); head.add(eyes);
  const eyeParts = [];
  [-1, 1].forEach((s) => {
    const e = new THREE.Group(); e.position.set(s * 0.2, 0.0, 0.49);
    e.add(mesh(SPH, toon('#ffffff'), [0, 0, 0], [0.13, 0.17, 0.05]));
    e.add(mesh(SPH, toon(eyeCol), [0, -0.01, 0.03], [0.1, 0.14, 0.04]));
    e.add(mesh(SPH, toon('#140c24'), [0, -0.01, 0.055], [0.055, 0.085, 0.03]));
    e.add(mesh(SPH, new THREE.MeshBasicMaterial({ color: '#fff' }), [0.03, 0.05, 0.075], [0.03, 0.03, 0.02]));
    e.add(mesh(SPH, new THREE.MeshBasicMaterial({ color: '#fff' }), [-0.03, -0.04, 0.075], [0.015, 0.015, 0.01]));
    eyes.add(e); eyeParts.push(e);
  });
  // Mejillas
  [-1, 1].forEach((s) => head.add(mesh(new THREE.CircleGeometry(1, 20), new THREE.MeshBasicMaterial({ color: '#ff7fa8', transparent: true, opacity: 0.55 }), [s * 0.3, -0.12, 0.465], [0.09, 0.055, 1], [0, s * 0.35, 0])));
  // Boca (sonrisa / O / triste)
  const smile = mesh(new THREE.TorusGeometry(0.07, 0.014, 6, 16, Math.PI), new THREE.MeshBasicMaterial({ color: '#7a2d3a' }), [0, -0.17, 0.515], [1, 1, 1], [0, 0, Math.PI]); head.add(smile);
  const mouthO = mesh(SPH, new THREE.MeshBasicMaterial({ color: '#7a2d3a' }), [0, -0.19, 0.515], [0.04, 0.05, 0.02]); mouthO.visible = false; head.add(mouthO);
  // Cejas
  const brows = [-1, 1].map((s) => { const b = mesh(CAP(0.012, 0.09), new THREE.MeshBasicMaterial({ color: o.hairColor || '#3b2418' }), [s * 0.2, 0.2, 0.49], [1, 1, 1], [0, 0, Math.PI / 2 + s * 0.08]); head.add(b); return b; });
  // Pelo
  const hair = hairMeshes(o.hair || 'short', o.hairColor || '#2b2118', head, { bangs: o.bangs !== false }); head.add(hair);
  // Torso, brazos y piernas
  const topMat = toon(o.topColor || '#7c3aed');
  body.add(mesh(CAP(0.3, 0.32), topMat, [0, 0.55, 0], [1, 1, 0.78]));
  const arms = [-1, 1].map((s) => { const a = new THREE.Group(); a.position.set(s * 0.42, 0.78, 0); a.add(mesh(CAP(0.09, 0.3), topMat, [0, -0.2, 0])); a.add(mesh(SPH, skin, [0, -0.45, 0], [0.1, 0.1, 0.1])); body.add(a); return a; });
  const legs = [-1, 1].map((s) => { const l = new THREE.Group(); l.position.set(s * 0.15, 0.25, 0); l.add(mesh(CAP(0.1, 0.18), toon('#2b2a4a'), [0, -0.08, 0])); const shoeCol = { boots: '#5b3a29', rocket: '#ff2d7a', sneakers: '#ffffff' }[o.shoes || 'sneakers']; l.add(mesh(SPH, toon(shoeCol), [0, -0.3, 0.05], [0.13, 0.08, 0.18])); body.add(l); return l; });
  // Prendas
  if (o.top === 'labcoat' || o.outfit === 'lab') body.add(mesh(CAP(0.33, 0.42), toon('#f4f6ff'), [0, 0.5, 0], [1.02, 1.04, 0.84]));
  if (o.top === 'explorer' || o.outfit === 'explorer') body.add(mesh(CAP(0.325, 0.3), toon('#a98a4d'), [0, 0.55, 0.02], [1.03, 0.95, 0.82]));
  if (o.top === 'cape') { const c = mesh(new THREE.ConeGeometry(0.5, 0.95, 18, 1, true), toon('#4b1fd1', { side: THREE.DoubleSide }), [0, 0.45, -0.25], [1, 1, 0.5]); body.add(c); }
  if (o.top === 'hoodie') body.add(mesh(new THREE.TorusGeometry(0.2, 0.08, 8, 18), topMat, [0, 0.9, -0.15], [1, 1, 1], [1.2, 0, 0]));
  if (o.badge) { const b = mesh(new THREE.PlaneGeometry(0.28, 0.2), new THREE.MeshBasicMaterial({ map: textTexture(o.badge, { size: 128, color: '#fff', bg: '#1a1150', font: 'bold 52px "Press Start 2P", monospace' }), transparent: true }), [0.12, 0.62, 0.245]); body.add(b); }
  // Accesorios
  const accGroup = new THREE.Group(); head.add(accGroup);
  const ac = o.accessory || 'none';
  if (ac === 'glasses') { [-1, 1].forEach((s) => accGroup.add(mesh(new THREE.TorusGeometry(0.115, 0.014, 8, 20), new THREE.MeshBasicMaterial({ color: '#2b2118' }), [s * 0.2, 0, 0.52]))); accGroup.add(mesh(CAP(0.01, 0.1), new THREE.MeshBasicMaterial({ color: '#2b2118' }), [0, 0.02, 0.52], [1, 1, 1], [0, 0, Math.PI / 2])); }
  if (ac === 'goggles') { [-1, 1].forEach((s) => accGroup.add(mesh(new THREE.TorusGeometry(0.12, 0.035, 8, 20), toon('#f59e0b'), [s * 0.2, 0.34, 0.45], [1, 1, 1], [0.3, 0, 0]))); accGroup.add(mesh(new THREE.TorusGeometry(0.58, 0.02, 6, 28), toon('#333'), [0, 0.15, 0], [1, 0.95, 1], [Math.PI / 2, 0, 0])); }
  if (ac === 'headphones') { accGroup.add(mesh(new THREE.TorusGeometry(0.58, 0.03, 8, 28, Math.PI), toon('#ff2d7a'), [0, 0.05, 0], [1, 1, 1], [0, 0, 0])); [-1, 1].forEach((s) => accGroup.add(mesh(new THREE.CylinderGeometry(0.14, 0.14, 0.1, 18), toon('#ff2d7a'), [s * 0.58, 0.02, 0], [1, 1, 1], [0, 0, Math.PI / 2]))); }
  if (ac === 'hat') { accGroup.add(mesh(new THREE.CylinderGeometry(0.62, 0.62, 0.03, 24), toon('#a98a4d'), [0, 0.46, 0])); accGroup.add(mesh(new THREE.CylinderGeometry(0.36, 0.42, 0.28, 20), toon('#a98a4d'), [0, 0.62, 0])); }
  if (ac === 'crown') { for (let i = 0; i < 5; i++) { const a = (i / 5) * 6.283; accGroup.add(mesh(new THREE.ConeGeometry(0.08, 0.22, 6), toon('#ffc83a'), [Math.cos(a) * 0.26, 0.68, Math.sin(a) * 0.26])); } accGroup.add(mesh(new THREE.TorusGeometry(0.26, 0.04, 6, 20), toon('#ffc83a'), [0, 0.6, 0], [1, 1, 1], [Math.PI / 2, 0, 0])); accGroup.add(mesh(new THREE.PlaneGeometry(0.18, 0.18), new THREE.MeshBasicMaterial({ map: textTexture('π', { color: '#fff' }), transparent: true }), [0, 0.7, 0.28])); }
  if (ac === 'antenna') { accGroup.add(mesh(CAP(0.012, 0.3), toon('#aaa'), [0.1, 0.78, 0])); accGroup.add(mesh(SPH, new THREE.MeshBasicMaterial({ color: '#5fd3f0' }), [0.1, 0.98, 0], [0.045, 0.045, 0.045])); }
  if (ac === 'halo') accGroup.add(mesh(new THREE.TorusGeometry(0.3, 0.025, 8, 28), new THREE.MeshBasicMaterial({ color: '#ffe27a' }), [0, 0.85, 0], [1, 1, 1], [Math.PI / 2, 0, 0]));
  if (o.outfit === 'engineer') { accGroup.add(mesh(new THREE.SphereGeometry(0.58, 20, 12, 0, 6.283, 0, 1.2), toon('#ffcf33'), [0, 0.12, 0])); accGroup.add(mesh(new THREE.CylinderGeometry(0.64, 0.64, 0.03, 24), toon('#ffcf33'), [0, 0.15, 0.04])); }
  if (o.outfit === 'astro') { accGroup.add(mesh(new THREE.SphereGeometry(0.72, 24, 18), new THREE.MeshPhysicalMaterial({ color: '#bfe9ff', transparent: true, opacity: 0.22, roughness: 0.05, metalness: 0.1 }), [0, 0, 0])); }
  if (o.outfit === 'pilot') { accGroup.add(mesh(new THREE.TorusGeometry(0.58, 0.04, 6, 28), toon('#6b4423'), [0, 0.22, 0], [1, 0.95, 1], [Math.PI / 2, 0, 0])); [-1, 1].forEach((s) => accGroup.add(mesh(new THREE.TorusGeometry(0.12, 0.03, 8, 20), toon('#8a8a8a'), [s * 0.2, 0.36, 0.45]))); }
  if (o.outfit === 'mathematician') accGroup.add(mesh(new THREE.CylinderGeometry(0.4, 0.45, 0.1, 22), toon('#4b1fd1'), [0, 0.56, -0.02], [1, 1, 1], [0.1, 0, 0]));
  if (o.outfit === 'adventurer') body.add(mesh(new THREE.TorusGeometry(0.28, 0.07, 8, 20), toon('#ff7a1a'), [0, 0.92, 0], [1, 1, 1], [Math.PI / 2, 0, 0]));
  if (o.outfit === 'robotist') { accGroup.add(mesh(CAP(0.012, 0.25), toon('#aaa'), [-0.2, 0.78, 0], [1, 1, 1], [0, 0, 0.2])); accGroup.add(mesh(SPH, new THREE.MeshBasicMaterial({ color: '#ff2d7a' }), [-0.24, 0.93, 0], [0.04, 0.04, 0.04])); }
  // Mochila
  const bp = o.backpack || 'none';
  if (bp === 'school') body.add(mesh(new THREE.BoxGeometry(0.4, 0.5, 0.2), toon('#ff7a1a'), [0, 0.6, -0.3]));
  if (bp === 'jet') { [-1, 1].forEach((s) => { body.add(mesh(new THREE.CylinderGeometry(0.1, 0.1, 0.5, 14), toon('#9aa6c0'), [s * 0.16, 0.6, -0.32])); body.add(mesh(new THREE.ConeGeometry(0.08, 0.3, 10), new THREE.MeshBasicMaterial({ color: '#ff9a3a' }), [s * 0.16, 0.2, -0.32], [1, 1, 1], [Math.PI, 0, 0])); }); }
  if (bp === 'scroll') body.add(mesh(new THREE.CylinderGeometry(0.1, 0.1, 0.65, 14), toon('#a98a4d'), [0.15, 0.62, -0.3], [1, 1, 1], [0, 0, 0.4]));
  // Efectos
  const fx = new THREE.Group(); root.add(fx); const ef = o.effect || 'none'; const orbit = [];
  if (ef !== 'none') {
    const n = ef === 'sparkles' ? 14 : ef === 'nebula' ? 40 : ef === 'pi-orbit' ? 5 : 0;
    for (let i = 0; i < n; i++) {
      let m;
      if (ef === 'pi-orbit') m = new THREE.Sprite(new THREE.SpriteMaterial({ map: textTexture(['π', '∞', '√', 'Σ', '∫'][i % 5], { color: '#ffc83a' }), transparent: true })), m.scale.setScalar(0.3);
      else m = mesh(SPH, new THREE.MeshBasicMaterial({ color: ef === 'nebula' ? ['#ff2d7a', '#7b3cf0', '#5fd3f0'][i % 3] : '#fff6b0' }), [0, 0, 0], [0.025, 0.025, 0.025]);
      m.userData = { a: (i / n) * 6.283, r: 0.7 + (i % 3) * 0.12, y: 0.2 + Math.random() * 1.4, sp: 0.5 + Math.random() }; fx.add(m); orbit.push(m);
    }
    if (ef === 'aura') fx.add(mesh(SPH, new THREE.MeshBasicMaterial({ color: '#5fd3f0', transparent: true, opacity: 0.12, blending: THREE.AdditiveBlending, depthWrite: false }), [0, 0.8, 0], [0.95, 1.3, 0.95]));
  }
  const ctl = { root, head, eyes: eyeParts, arms, legs, smile, mouthO, brows, hair, orbit, t: 0, expr: 'happy', anim: 'idle', animT: 0, blinkT: 2, base: body };
  setExpression(ctl, o.expr || 'happy');
  return ctl;
}

export function setExpression(c, e) {
  c.expr = e; const { smile, mouthO, brows, eyes } = c;
  smile.visible = true; mouthO.visible = false; smile.rotation.z = Math.PI; smile.scale.set(1, 1, 1); brows.forEach((b, i) => { b.rotation.z = Math.PI / 2 + (i ? 1 : -1) * 0.08; b.position.y = 0.2; });
  eyes.forEach((x) => x.scale.set(1, 1, 1));
  if (e === 'sad') { smile.rotation.z = 0; smile.position.y = -0.2; brows.forEach((b, i) => { b.rotation.z = Math.PI / 2 + (i ? -1 : 1) * 0.35; }); }
  else { smile.position.y = -0.17; }
  if (e === 'surprised') { smile.visible = false; mouthO.visible = true; mouthO.scale.set(0.05, 0.065, 0.02); brows.forEach((b) => { b.position.y = 0.27; }); eyes.forEach((x) => x.scale.set(1.1, 1.15, 1)); }
  if (e === 'think') { smile.scale.set(0.5, 0.4, 1); smile.rotation.z = Math.PI + 0.2; brows[0].rotation.z = Math.PI / 2 - 0.3; }
  if (e === 'proud') { smile.scale.set(1.5, 1.4, 1); eyes.forEach((x) => x.scale.set(1, 0.7, 1)); }
  if (e === 'wow') { smile.visible = false; mouthO.visible = true; mouthO.scale.set(0.07, 0.09, 0.02); eyes.forEach((x) => x.scale.set(1.2, 1.25, 1)); }
}
export function playAnim(c, name) { c.anim = name; c.animT = 0; }

export function updatePerson(c, dt, reduce = false) {
  c.t += dt; c.animT += dt; const t = c.t;
  const { base, head, arms, legs } = c;
  const breathe = reduce ? 0 : Math.sin(t * 2) * 0.012;
  base.scale.y = 1 + breathe; head.rotation.z = reduce ? 0 : Math.sin(t * 0.9) * 0.04; head.rotation.x = 0;
  arms[0].rotation.z = 0.15 + (reduce ? 0 : Math.sin(t * 1.6) * 0.04); arms[1].rotation.z = -0.15 - (reduce ? 0 : Math.sin(t * 1.6 + 1) * 0.04);
  arms.forEach((a) => { a.rotation.x = 0; }); c.root.position.y = 0; c.root.rotation.z = 0;
  if (!reduce) { c.blinkT -= dt; if (c.blinkT < 0) { c.blinkT = 2 + Math.random() * 3; c.blinking = 0.12; } }
  c.blinking = Math.max(0, (c.blinking || 0) - dt); const bl = c.blinking > 0 ? 0.1 : 1;
  c.eyes.forEach((e) => { e.scale.y = (c.expr === 'proud' ? 0.7 : 1) * bl; });
  switch (c.anim) {
    case 'wave': arms[1].rotation.z = -2.4 + Math.sin(c.animT * 12) * 0.35; head.rotation.z = 0.1; if (c.animT > 2.2) c.anim = 'idle'; break;
    case 'cheer': c.root.position.y = Math.abs(Math.sin(c.animT * 7)) * 0.25; arms[0].rotation.z = 2.5; arms[1].rotation.z = -2.5; if (c.animT > 1.6) c.anim = 'idle'; break;
    case 'spin': c.root.rotation.y = c.animT * 8; if (c.animT > 0.8) { c.root.rotation.y = 0; c.anim = 'idle'; } break;
    case 'sad': head.rotation.x = 0.25; arms[0].rotation.z = 0.05; arms[1].rotation.z = -0.05; base.scale.y = 0.97; break;
    case 'hit': c.root.position.x = Math.sin(c.animT * 50) * 0.06 * Math.max(0, 1 - c.animT * 3); if (c.animT > 0.4) c.anim = 'idle'; break;
    case 'think': arms[1].rotation.z = -1.0; arms[1].rotation.x = -1.2; head.rotation.z = -0.12; break;
    case 'attack': arms[1].rotation.z = -1.6; arms[1].rotation.x = -1.5 + Math.sin(c.animT * 20) * 0.4; c.root.position.z = Math.sin(Math.min(1, c.animT * 3) * Math.PI) * 0.4; if (c.animT > 0.5) { c.anim = 'idle'; c.root.position.z = 0; } break;
    default: break;
  }
  legs.forEach((l, i) => { l.rotation.x = 0; });
  c.orbit.forEach((m) => { const u = m.userData; const a = u.a + t * u.sp; m.position.set(Math.cos(a) * u.r, u.y + Math.sin(t * 2 + u.a) * 0.08, Math.sin(a) * u.r); });
}

/* ───── Retratos: un único renderer WebGL compartido que pinta en <canvas> 2D ───── */
let pr; let prCanvas; const ports = new Set(); let prLast = 0; let prRaf = 0;
function ensureRenderer() {
  if (pr) return;
  prCanvas = document.createElement('canvas'); prCanvas.width = prCanvas.height = 512;
  pr = new THREE.WebGLRenderer({ canvas: prCanvas, alpha: true, antialias: true, preserveDrawingBuffer: true }); pr.setPixelRatio(1); pr.setSize(512, 512, false); pr.setClearColor(0x000000, 0);
}
export function portrait(target, makePerson, { frame = 'bust', spin = false, drag = true, size = 256, pet } = {}) {
  ensureRenderer();
  const scene = new THREE.Scene(); const cam = new THREE.PerspectiveCamera(28, 1, 0.1, 50);
  scene.add(new THREE.AmbientLight('#cdb8ff', 1.6)); const key = new THREE.DirectionalLight('#ffffff', 2.2); key.position.set(2, 3, 4); scene.add(key); const rim = new THREE.DirectionalLight('#ff7ac8', 1.6); rim.position.set(-3, 2, -3); scene.add(rim);
  let ctl = makePerson(); scene.add(ctl.root);
  const fr = { bust: [0, 1.12, 3.9, 1.05], full: [0, 0.9, 6.4, 0.78], head: [0, 1.2, 2.9, 1.15] }[frame];
  cam.position.set(fr[0], fr[1], fr[2]); cam.lookAt(0, fr[3], 0);
  target.width = size; target.height = size; target.style.setProperty('--ps', size + 'px'); const g = target.getContext('2d');
  const port = { scene, ctl, target, g, spin, rotY: 0.25, visible: true, replace(newCtl) { scene.remove(ctl.root); ctl = newCtl; port.ctl = newCtl; scene.add(ctl.root); }, dispose() { ports.delete(port); } };
  if (drag) { let down = false; let lx = 0; target.style.touchAction = 'pan-y'; target.addEventListener('pointerdown', (e) => { down = true; lx = e.clientX; target.setPointerCapture(e.pointerId); }); target.addEventListener('pointermove', (e) => { if (down) { port.rotY += (e.clientX - lx) * 0.012; lx = e.clientX; } }); target.addEventListener('pointerup', () => { down = false; }); }
  const io = new IntersectionObserver((en) => { port.visible = en[0].isIntersecting; }); io.observe(target); port.io = io;
  port.cam = cam; ports.add(port);
  if (!prRaf) prRaf = requestAnimationFrame(portLoop);
  return port;
}
let prReduce = false; export const setPortraitReduce = (v) => { prReduce = v; };
function portLoop(ts) {
  prRaf = requestAnimationFrame(portLoop);
  const dt = Math.min(0.05, (ts - prLast) / 1000 || 0.016); prLast = ts;
  if (document.hidden) return;
  for (const p of ports) {
    if (!p.target.isConnected) { p.io.disconnect(); ports.delete(p); continue; }
    if (!p.visible) continue;
    updatePerson(p.ctl, dt, prReduce);
    p.ctl.root.rotation.y = p.spin && !prReduce ? p.ctl.root.rotation.y + dt * 0.8 : (p.ctl.anim === 'spin' ? p.ctl.root.rotation.y : p.rotY);
    pr.render(p.scene, p.cam);
    p.g.clearRect(0, 0, p.target.width, p.target.height); p.g.drawImage(prCanvas, 0, 0, p.target.width, p.target.height);
  }
}
