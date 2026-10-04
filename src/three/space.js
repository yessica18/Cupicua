// Fondo espacial 3D que parpadea + mapa matemático-astronómico interactivo.
// Cada región es un objeto celeste raro y real: magnetar, Wolf-Rayet, Rectángulo Rojo, estrella de Tabby y nebulosas.
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';

/* ───── Material de partículas con parpadeo ───── */
const VERT = `
attribute float size; attribute float phase; attribute float speed; attribute vec3 col;
uniform float uTime; uniform float uScale; uniform float uTwinkle;
varying vec3 vCol; varying float vA;
void main(){
  vCol = col;
  float tw = 1.0 - uTwinkle + uTwinkle * (0.55 + 0.45 * sin(uTime * speed + phase));
  vA = tw;
  vec4 mv = modelViewMatrix * vec4(position, 1.0);
  gl_PointSize = size * tw * uScale / max(1.0, -mv.z) ;
  gl_Position = projectionMatrix * mv;
}`;
const FRAG = `
varying vec3 vCol; varying float vA;
void main(){
  vec2 c = gl_PointCoord - 0.5; float d = length(c);
  if (d > 0.5) discard;
  float core = smoothstep(0.5, 0.0, d);
  float a = pow(core, 1.8) * vA * 0.7;
  gl_FragColor = vec4(vCol * (0.6 + 0.8 * core), a);
}`;
const mkMat = (twinkle = 1, scale = 130) => new THREE.ShaderMaterial({ vertexShader: VERT, fragmentShader: FRAG, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, uniforms: { uTime: { value: 0 }, uScale: { value: scale }, uTwinkle: { value: twinkle } } });
const materials = [];

function cloud(n, fn, { twinkle = 1, scale = 130 } = {}) {
  const pos = new Float32Array(n * 3); const col = new Float32Array(n * 3); const size = new Float32Array(n); const phase = new Float32Array(n); const speed = new Float32Array(n);
  const c = new THREE.Color();
  for (let i = 0; i < n; i++) {
    const r = fn(i, n);
    pos.set([r.x, r.y, r.z], i * 3); c.set(r.c || '#ffffff'); col.set([c.r, c.g, c.b], i * 3);
    size[i] = r.s ?? 1; phase[i] = Math.random() * 6.28; speed[i] = r.sp ?? 0.8 + Math.random() * 2.2;
  }
  const g = new THREE.BufferGeometry();
  g.setAttribute('position', new THREE.BufferAttribute(pos, 3)); g.setAttribute('col', new THREE.BufferAttribute(col, 3));
  g.setAttribute('size', new THREE.BufferAttribute(size, 1)); g.setAttribute('phase', new THREE.BufferAttribute(phase, 1)); g.setAttribute('speed', new THREE.BufferAttribute(speed, 1));
  const m = mkMat(twinkle, scale); materials.push(m);
  const p = new THREE.Points(g, m); p.frustumCulled = false; return p;
}
const R = (a = 1) => (Math.random() * 2 - 1) * a;
const gauss = () => (Math.random() + Math.random() + Math.random() + Math.random() - 2) * 0.9;
const sph = (r) => { const u = Math.random() * 2 - 1; const t = Math.random() * 6.283; const s = Math.sqrt(1 - u * u); return [r * s * Math.cos(t), r * u, r * s * Math.sin(t)]; };
const pickc = (arr) => arr[Math.floor(Math.random() * arr.length)];

/* ───── Objetos celestes (cada uno con su forma real aproximada) ───── */
export const OBJECTS = {
  catseye: { label: 'Nebulosa Ojo de Gato', make() {
    const g = new THREE.Group();
    g.add(cloud(1800, () => { const shell = pickc([1.2, 1.9, 2.5, 3.1, 3.7]); const [x, y, z] = sph(shell + R(0.12)); return { x, y: y * 0.9, z, c: pickc(['#5ef2e0', '#7affc8', '#9be7ff', '#c8fff0']), s: 1 + Math.random() * 1.6 }; }));
    g.add(cloud(60, () => ({ x: R(0.35), y: R(0.35), z: R(0.35), c: '#ffffff', s: 5 + Math.random() * 4, sp: 3 })));
    g.add(cloud(300, () => { const t = Math.random() * 6.28; const r = 4.4 + R(0.4); return { x: Math.cos(t) * r, y: R(0.5), z: Math.sin(t) * r * 0.55, c: '#ff8fb8', s: 1.2 }; }));
    return g;
  } },
  pillars: { label: 'Pilares de la Creación', make() {
    const g = new THREE.Group();
    [[-2.4, 3.6, 0.2], [0, 4.8, 0], [2.4, 3.2, -0.2]].forEach(([x0, h, z0]) => {
      g.add(cloud(750, () => { const y = Math.random() * h - 2.4; const w = 0.7 + (1 - (y + 2.4) / h) * 0.5; return { x: x0 + gauss() * w * 0.5, y, z: z0 + gauss() * w * 0.4, c: pickc(['#d98a3d', '#c4642b', '#e9b46a', '#8d4a2a']), s: 1.2 + Math.random() * 1.8 }; }, { twinkle: 0.5 }));
      g.add(cloud(14, () => ({ x: x0 + R(0.5), y: h - 2.2 + R(0.3), z: z0 + R(0.4), c: '#bfe7ff', s: 5 })));
    });
    g.add(cloud(500, () => ({ x: R(5), y: R(3.5), z: R(1.5) - 1.8, c: pickc(['#3aa6a0', '#5fd3f0', '#7b3cf0']), s: 1 + Math.random() })));
    return g;
  } },
  redrect: { label: 'Rectángulo Rojo (HD 44179)', make() {
    const g = new THREE.Group();
    g.add(cloud(40, () => ({ x: R(0.25), y: R(0.25), z: R(0.25), c: '#fff1b8', s: 7, sp: 2.5 })));
    // Dos conos en X + peldaños: el rectángulo rojo visto de lado
    const rungs = []; for (let k = 0; k < 7; k++) rungs.push(-3 + k);
    g.add(cloud(1200, () => { const side = Math.random() < 0.5 ? -1 : 1; const t = Math.random(); const rung = rungs[Math.floor(Math.random() * rungs.length)] * 0.55; const kind = Math.random();
      if (kind < 0.6) { const x = side * 2.3 + R(0.07); const y = (t * 2 - 1) * 3.2; return { x, y, z: R(0.1), c: pickc(['#ff4a3a', '#ff7a2f', '#ff9a5a']), s: 1.3 }; }
      return { x: (t * 2 - 1) * 2.3, y: rung * 1.1, z: R(0.1), c: pickc(['#ff3d3d', '#ff7040']), s: 1.1 }; }));
    g.add(cloud(380, () => ({ x: gauss() * 1.6, y: gauss() * 2.2, z: gauss() * 0.9, c: '#ff5a3a', s: 1 + Math.random() * 1.5 }), { twinkle: 0.4 }));
    return g;
  } },
  helix: { label: 'Nebulosa de la Hélice', make() {
    const g = new THREE.Group(); const ring = new THREE.Group();
    ring.add(cloud(2200, () => { const t = Math.random() * 6.283; const r = 3 + gauss() * 0.35; const f = (r - 2.4) / 1.2; return { x: Math.cos(t) * r, y: gauss() * 0.4, z: Math.sin(t) * r, c: new THREE.Color().lerpColors(new THREE.Color('#4fd0ff'), new THREE.Color('#ff5a4a'), Math.min(1, Math.max(0, f + 0.2))).getStyle(), s: 1 + Math.random() * 1.6 }; }));
    ring.rotation.x = 1.0; ring.rotation.z = 0.4; g.add(ring);
    g.add(cloud(10, () => ({ x: R(0.2), y: R(0.2), z: R(0.2), c: '#ffffff', s: 8 })));
    return g;
  } },
  tabby: { label: 'Estrella de Tabby (KIC 8462852)', make() {
    const g = new THREE.Group(); const star = cloud(60, () => ({ x: R(0.3), y: R(0.3), z: R(0.3), c: '#fff6d0', s: 8, sp: 1.2 }), { twinkle: 0.6 }); g.add(star);
    const debris = new THREE.Group();
    for (let k = 0; k < 7; k++) { const c = cloud(80, () => ({ x: gauss() * 0.4, y: gauss() * 0.2, z: gauss() * 0.3, c: '#a78bfa', s: 2.5 }), { twinkle: 0.2 }); const a = (k / 7) * 6.28; const r = 2.2 + Math.random() * 1.8; c.position.set(Math.cos(a) * r, R(0.4), Math.sin(a) * r); c.userData = { a, r, sp: 0.15 + Math.random() * 0.4 }; debris.add(c); }
    g.add(debris); g.userData.update = (t) => debris.children.forEach((c) => { const u = c.userData; const a = u.a + t * u.sp; c.position.set(Math.cos(a) * u.r, c.position.y, Math.sin(a) * u.r); });
    g.add(cloud(500, () => { const t = Math.random() * 6.28; const r = 2 + Math.random() * 2.6; return { x: Math.cos(t) * r, y: R(0.12), z: Math.sin(t) * r, c: '#6b5bd6', s: 0.9 }; }, { twinkle: 0.7 }));
    return g;
  } },
  tarantula: { label: 'Nebulosa de la Tarántula', make() {
    const g = new THREE.Group();
    for (let k = 0; k < 9; k++) { let p = new THREE.Vector3(); const dir = new THREE.Vector3(...sph(1)); const pts = [];
      for (let s = 0; s < 70; s++) { dir.add(new THREE.Vector3(R(0.35), R(0.35), R(0.35))).normalize(); p = p.clone().addScaledVector(dir, 0.1 + s * 0.006); pts.push(p.clone()); }
      g.add(cloud(pts.length * 4, (i) => { const q = pts[Math.floor(i / 4)]; return { x: q.x + R(0.12), y: q.y + R(0.12), z: q.z + R(0.12), c: pickc(['#ff6fa3', '#d36bff', '#ffa1c9']), s: 1.2 }; })); }
    g.add(cloud(120, () => { const [x, y, z] = sph(Math.random() * 0.7); return { x, y, z, c: '#bfe0ff', s: 3 + Math.random() * 4, sp: 3 }; }));
    return g;
  } },
  magnetar: { label: 'Magnetar SGR 1806-20', make() {
    const g = new THREE.Group();
    g.add(cloud(24, () => ({ x: R(0.12), y: R(0.12), z: R(0.12), c: '#d8f4ff', s: 12, sp: 6 })));
    const loops = new THREE.Group();
    for (let k = 0; k < 9; k++) { const L = 1.6 + k * 0.36; const az = (k / 9) * 6.283; const pts = cloud(260, (i, n) => { const th = (i / n) * 6.283 * 0.5 + 0.15; const r = L * Math.sin(th) ** 2 * 1.4; return { x: Math.cos(az) * r * Math.sin(th), y: r * Math.cos(th) * 1.5, z: Math.sin(az) * r * Math.sin(th), c: k % 2 ? '#ff4fd8' : '#4fd0ff', s: 1.3, sp: 3 }; }); loops.add(pts); const mirror = pts.clone(); mirror.scale.y = -1; loops.add(mirror); }
    g.add(loops);
    const flare = cloud(150, () => { const [x, y, z] = sph(1); return { x, y, z, c: '#ffffff', s: 2 }; }, { twinkle: 0.3 }); g.add(flare);
    g.userData.update = (t) => { loops.rotation.y = t * 0.3; const k = (t % 4) / 4; flare.scale.setScalar(0.3 + k * 4); flare.material.uniforms.uTwinkle.value = 0.3; flare.visible = k < 0.9; };
    return g;
  } },
  orion: { label: 'Nebulosa de Orión', make() {
    const g = new THREE.Group();
    g.add(cloud(2000, () => { const [x, y, z] = sph(Math.pow(Math.random(), 0.6) * 3.6); return { x: x * 1.3, y: y * 0.9, z: z * 0.8, c: pickc(['#ff7ab8', '#9d6bff', '#5fd3f0', '#ffb3d9', '#7a8cff']), s: 1 + Math.random() * 2 }; }, { twinkle: 0.45 }));
    g.add(cloud(4, (i) => ({ x: [0.3, -0.3, 0.1, -0.15][i], y: [0.2, 0.1, -0.3, 0.3][i], z: 0, c: '#ffffff', s: 9, sp: 3 })));
    return g;
  } },
  eta: { label: 'Eta Carinae', make() {
    const g = new THREE.Group();
    [1, -1].forEach((s) => g.add(cloud(900, () => { const t = Math.random(); const y = s * (0.3 + t * 3.8); const r = Math.sin(Math.min(1, t) * 3.0) * 1.7 + 0.15; const a = Math.random() * 6.283; return { x: Math.cos(a) * r, y, z: Math.sin(a) * r, c: pickc(['#ff9d3d', '#ffc36b', '#ff6a2f']), s: 1.2 + Math.random() * 1.4 }; }, { twinkle: 0.5 })));
    g.add(cloud(400, () => { const t = Math.random() * 6.283; const r = 0.4 + Math.random() * 3.4; return { x: Math.cos(t) * r, y: R(0.1), z: Math.sin(t) * r, c: '#ffd2a0', s: 1 }; }));
    g.add(cloud(10, () => ({ x: R(0.1), y: R(0.1), z: R(0.1), c: '#ffffff', s: 11, sp: 5 })));
    return g;
  } },
  wolfrayet: { label: 'Wolf-Rayet WR 104', make() {
    const g = new THREE.Group(); const arms = new THREE.Group();
    arms.add(cloud(2400, (i) => { const arm = i % 2; const t = Math.random(); const a = t * 9 + arm * Math.PI; const r = 0.25 + t * 3.8; return { x: Math.cos(a) * r + R(0.08), y: R(0.1), z: Math.sin(a) * r + R(0.08), c: new THREE.Color().lerpColors(new THREE.Color('#d8f0ff'), new THREE.Color('#ff9a4a'), t).getStyle(), s: 1.1 + (1 - t) * 1.6 }; }));
    arms.rotation.x = 1.15; g.add(arms);
    g.add(cloud(30, () => ({ x: R(0.18), y: R(0.18), z: R(0.18), c: '#c8e8ff', s: 11, sp: 4 })));
    g.userData.update = (t) => { arms.rotation.y = t * 0.25; };
    return g;
  } },
  crab: { label: 'Nebulosa del Cangrejo', make() {
    const g = new THREE.Group();
    g.add(cloud(1900, () => { const [x, y, z] = sph(2.2 + gauss() * 0.9); const f = Math.random(); return { x: x * 1.2, y: y * 0.9, z, c: f < 0.55 ? pickc(['#ff8c3a', '#ffb066', '#e5602c']) : pickc(['#6bb8ff', '#8fd0ff']), s: 1 + Math.random() * 1.6 }; }, { twinkle: 0.4 }));
    const pulsar = cloud(8, () => ({ x: R(0.08), y: R(0.08), z: R(0.08), c: '#ffffff', s: 12, sp: 18 })); g.add(pulsar);
    g.add(cloud(200, (i) => { const s = i % 2 ? 1 : -1; return { x: R(0.1), y: s * Math.random() * 3.6, z: R(0.1), c: '#9bd4ff', s: 1.2 }; }));
    return g;
  } },
  galaxy: { label: 'Centro Galáctico', make() {
    const g = new THREE.Group(); const disc = new THREE.Group();
    disc.add(cloud(3200, (i) => { const arm = i % 3; const t = Math.pow(Math.random(), 0.7); const a = t * 8 + arm * 2.094; const r = 0.4 + t * 4.6; return { x: Math.cos(a) * r + gauss() * 0.25, y: gauss() * 0.12, z: Math.sin(a) * r + gauss() * 0.25, c: t < 0.3 ? '#ffe9a8' : pickc(['#9db8ff', '#c8a8ff', '#ffffff']), s: 1 + Math.random() * 1.4 }; }));
    disc.rotation.x = 0.9; g.add(disc);
    g.add(cloud(70, () => { const [x, y, z] = sph(Math.random() * 0.6); return { x, y, z, c: '#ffe9a8', s: 4 + Math.random() * 5 }; }));
    g.userData.update = (t) => { disc.rotation.y = t * 0.12; };
    return g;
  } },
};

/* Asignación región → objeto celeste */
export const REGION_OBJECT = {
  aritmetica: 'catseye', algebra: 'pillars', geometria: 'redrect', trigonometria: 'helix', estadistica: 'tabby', algebralineal: 'tarantula',
  fisica2: 'magnetar', fisica: 'orion', calculo: 'eta', vectorial: 'wolfrayet', edo: 'crab', ingenieria: 'galaxy',
};

/* ───── Escena principal ───── */
let renderer; let scene; let camera; let controls; let clock; let raf; let canvas;
let starfield; let nebulae = []; let mapGroup = null; let objs = []; let labelsEl = null;
let mode = 'ambient'; let throttle = 1; let frame = 0; let reduce = false; let pointer = { x: 0, y: 0 };
const tween = { active: false };

function nebulaTexture(color) {
  const c = document.createElement('canvas'); c.width = c.height = 256; const x = c.getContext('2d');
  const g = x.createRadialGradient(128, 128, 0, 128, 128, 128); g.addColorStop(0, color + 'aa'); g.addColorStop(0.45, color + '33'); g.addColorStop(1, color + '00');
  x.fillStyle = g; x.fillRect(0, 0, 256, 256); return new THREE.CanvasTexture(c);
}

export function initSpace(el) {
  canvas = el;
  renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: false, powerPreference: 'high-performance' });
  renderer.setPixelRatio(Math.min(2, devicePixelRatio || 1)); renderer.setClearColor(0x0b0720, 1);
  scene = new THREE.Scene(); scene.fog = new THREE.FogExp2(0x0b0720, 0.0016);
  camera = new THREE.PerspectiveCamera(55, 1, 0.1, 1500); camera.position.set(0, 6, 34);
  clock = new THREE.Clock();
  // Estrellas lejanas que parpadean
  starfield = cloud(5200, () => { const [x, y, z] = sph(250 + Math.random() * 450); return { x, y, z, c: pickc(['#ffffff', '#cfe3ff', '#ffe7c4', '#b9a6ff', '#9ff3ff']), s: 0.9 + Math.pow(Math.random(), 4) * 4, sp: 0.6 + Math.random() * 3.4 }; }, { twinkle: 0.9, scale: 900 });
  scene.add(starfield);
  [['#7b3cf0', -120, 40, -260, 260], ['#ff2d7a', 160, -60, -300, 230], ['#5fd3f0', 20, 100, -340, 300], ['#ffc83a', -200, -90, -320, 160]].forEach(([col, x, y, z, s]) => {
    const sp = new THREE.Sprite(new THREE.SpriteMaterial({ map: nebulaTexture(col), transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, opacity: 0.55 }));
    sp.position.set(x, y, z); sp.scale.setScalar(s); scene.add(sp); nebulae.push(sp);
  });
  controls = new OrbitControls(camera, canvas); controls.enableDamping = true; controls.dampingFactor = 0.06; controls.enablePan = false; controls.minDistance = 12; controls.maxDistance = 140; controls.enabled = false; controls.autoRotate = false;
  controls.touches = { ONE: THREE.TOUCH.ROTATE, TWO: THREE.TOUCH.DOLLY_ROTATE };
  addEventListener('resize', resize); resize();
  addEventListener('pointermove', (e) => { pointer.x = (e.clientX / innerWidth - 0.5); pointer.y = (e.clientY / innerHeight - 0.5); });
  document.addEventListener('visibilitychange', () => { if (document.hidden) cancelAnimationFrame(raf); else loop(); });
  loop();
}

function resize() {
  if (!renderer) return;
  const w = innerWidth; const h = innerHeight; renderer.setSize(w, h, false); camera.aspect = w / h; camera.updateProjectionMatrix();
  materials.forEach((m) => { m.uniforms.uScale.value = m === starfield?.material ? 900 * (h / 800) : 130 * (h / 800); });
}

export const setReduceMotion = (v) => { reduce = v; materials.forEach((m) => { m.uniforms.uTwinkle.value = v ? 0 : m.uniforms.uTwinkle.value || 0.6; }); };
export const setThrottle = (n) => { throttle = n; };

function loop() {
  raf = requestAnimationFrame(loop);
  frame += 1; if (frame % throttle) return;
  const t = clock.getElapsedTime();
  materials.forEach((m) => { m.uniforms.uTime.value = reduce ? 0 : t; });
  if (!reduce) starfield.rotation.y = t * 0.004;
  if (mode === 'map' && mapGroup) {
    controls.update();
    objs.forEach((o) => { if (!reduce) o.group.rotation.y += 0.0015; o.group.userData.update?.(reduce ? 0 : t); o.group.children.forEach((c) => c.userData?.update?.()); });
    objs.forEach((o) => o.group.userData?.update && o.group.userData.update(reduce ? 0 : t));
    if (tween.active) {
      tween.k = Math.min(1, tween.k + 0.035); const e = 1 - (1 - tween.k) ** 3;
      controls.target.lerpVectors(tween.fromT, tween.toT, e); camera.position.lerpVectors(tween.fromP, tween.toP, e); if (tween.k >= 1) tween.active = false;
    }
    updateLabels();
  } else if (!reduce) {
    camera.position.x += (pointer.x * 8 - camera.position.x) * 0.02; camera.position.y += (6 - pointer.y * 5 - camera.position.y) * 0.02; camera.lookAt(0, 0, 0);
    nebulae.forEach((n, i) => { n.material.rotation = t * 0.01 * (i % 2 ? 1 : -1); });
  }
  renderer.render(scene, camera);
}

/* ───── Modo mapa ───── */
const layout = (i, n) => { const a = i * 0.62 + 0.4; const r = 11 + i * 2.3; return new THREE.Vector3(Math.cos(a) * r, Math.sin(i * 1.4) * 3.2, Math.sin(a) * r - 4); };

/**
 * regions: [{id, name, icon, color, pct, status}] ; onPick(id)
 */
export function showMap(regions, { onPick, focusId } = {}) {
  hideMap();
  mode = 'map'; mapGroup = new THREE.Group(); scene.add(mapGroup); objs = [];
  labelsEl = document.createElement('div'); labelsEl.className = 'map-labels'; document.getElementById('app').append(labelsEl);
  regions.forEach((r, i) => {
    const def = OBJECTS[REGION_OBJECT[r.id]]; const group = def.make(); const wrap = new THREE.Group();
    const p = layout(i, regions.length); wrap.position.copy(p); group.scale.setScalar(0.9); wrap.add(group); mapGroup.add(wrap);
    const btn = document.createElement('button'); btn.className = 'star-label'; btn.dataset.id = r.id; btn.style.setProperty('--c', r.color);
    btn.innerHTML = `<span class="sl-ico">${r.icon}</span><span class="sl-txt"><b>${r.name}</b><small>${def.label} · ${r.pct}%</small></span><i class="sl-bar"><u style="width:${r.pct}%"></u></i>`;
    btn.setAttribute('aria-label', `${r.name}, ${def.label}, progreso ${r.pct}%`);
    btn.addEventListener('click', () => onPick?.(r.id)); labelsEl.append(btn);
    objs.push({ id: r.id, group, wrap, btn, pos: p });
  });
  controls.enabled = true; controls.target.set(0, 0, -6); const k = innerWidth < innerHeight ? 1.8 : 1; camera.position.set(14 * k, 34 * k, 88 * k); controls.update();
  if (focusId) focus(focusId);
}
export function hideMap() {
  if (mapGroup) { scene.remove(mapGroup); mapGroup.traverse((o) => { o.geometry?.dispose?.(); }); }
  mapGroup = null; objs = []; labelsEl?.remove(); labelsEl = null; mode = 'ambient'; if (controls) controls.enabled = false;
  if (camera) camera.position.set(0, 6, 34);
}
export function focus(id) {
  const o = objs.find((x) => x.id === id); if (!o) return;
  const dir = camera.position.clone().sub(controls.target).normalize();
  Object.assign(tween, { active: true, k: 0, fromT: controls.target.clone(), toT: o.pos.clone(), fromP: camera.position.clone(), toP: o.pos.clone().addScaledVector(dir, 20) });
}
const v3 = new THREE.Vector3();
function updateLabels() {
  const w = innerWidth; const h = innerHeight;
  for (const o of objs) {
    v3.copy(o.pos).project(camera);
    const vis = v3.z < 1 && Math.abs(v3.x) < 1.15 && Math.abs(v3.y) < 1.15;
    o.btn.style.opacity = vis ? '1' : '0'; o.btn.style.pointerEvents = vis ? 'auto' : 'none';
    o.btn.style.transform = `translate(${(v3.x * 0.5 + 0.5) * w}px, ${(-v3.y * 0.5 + 0.5) * h}px) translate(-50%, 36px)`;
    const d = camera.position.distanceTo(o.pos); o.btn.style.scale = String(Math.max(0.6, Math.min(1.05, 48 / d)));
    o.btn.style.zIndex = String(Math.round(1000 - d));
  }
}
export const spaceMode = () => mode;
