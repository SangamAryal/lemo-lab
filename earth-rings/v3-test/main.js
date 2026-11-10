// "What If Earth Had Rings?" — 3D look test (lines 1–3 of v2, about 15 s). three.js r170, toon (cel) shading + ink outlines,
// so the planets keep the flat Beyond Everything look; faces, type and captions stay 2D (kit.js) on a canvas over the 3D stage.
// One continuous camera: orbit the mystery planet → crane up to a top-down view of the Sun and the habitable zone → swoop back in
// for the reveal. Deterministic in t.
import * as THREE from 'three';
import * as K from './kit.js';
import { clamp, lerp, seg, ss, eio, eo, mulberry, TAU } from '/core/lib.js';
const { P, text, card, pop } = K;

const W = 1080, H = 1920, CX = W / 2;
const ov = document.getElementById('c').getContext('2d'), bgc = document.getElementById('bg').getContext('2d');
await document.fonts.load('900 80px NU'); await document.fonts.load('800 40px NU');
const words = await (await fetch('voices/words.json')).json();
const lines = await (await fetch('lines.json')).json();
const dur = await (await fetch('voices/dur.json')).json();
const IDS = lines.map(l => l.id), VO = {};
{ let t = .2; for (const id of IDS) { VO[id] = +t.toFixed(3); t += dur[id] + .45; } }
const LAST = IDS[IDS.length - 1], DUR = +(VO[LAST] + dur[LAST] + 1.8).toFixed(2);
const nrm = s => s.toLowerCase().replace(/[^a-z0-9]/g, '');
const at = (id, w, k = 0, e = 1) => { let n = 0; for (const x of words[id]) if (nrm(x[0]).startsWith(nrm(w)) && n++ === k) return VO[id] + Math.max(0, x[e]); throw new Error(`${w} in ${id}`); };
const T = { ring1: at('e01', 'ring'), spot: at('e02', 'spot'), newW: at('e02', 'new'), earth3: at('e03', 'earth'), y466: at('e03', '466') };
const S = [0, VO.e02 - .3, VO.e03 - .3, DUR];

// ───────── renderer, scene, light
const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, preserveDrawingBuffer: true, powerPreference: 'high-performance' });
renderer.setPixelRatio(1); renderer.setSize(W, H); renderer.setClearColor(0x000000, 0);
renderer.outputColorSpace = THREE.SRGBColorSpace; renderer.shadowMap.enabled = true; renderer.shadowMap.type = THREE.PCFShadowMap;
document.getElementById('stage').appendChild(renderer.domElement);
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(40, W / H, .1, 400);
const SUN = new THREE.Vector3(0, 0, 0), E = new THREE.Vector3(12, 0, 0);
const sunLight = new THREE.DirectionalLight(0xfff2dc, 2.6); sunLight.position.copy(E).add(new THREE.Vector3(-10, 0, 0)); sunLight.target.position.copy(E);
sunLight.castShadow = true; Object.assign(sunLight.shadow.camera, { left: -3.5, right: 3.5, top: 3.5, bottom: -3.5, near: 1, far: 20 }); sunLight.shadow.mapSize.set(2048, 2048); sunLight.shadow.bias = -.0008;
scene.add(sunLight, sunLight.target, new THREE.AmbientLight(0x8a80ff, .55));

// two-tone cel ramp: a lit side and one shadow tone, hard edge, like the 2D planets' crescent shadow
const ramp = new THREE.DataTexture(new Uint8Array([120, 120, 120, 255, 255, 255, 255, 255]), 2, 1); ramp.minFilter = ramp.magFilter = THREE.NearestFilter; ramp.needsUpdate = true;
const toon = (o) => new THREE.MeshToonMaterial({ gradientMap: ramp, ...o });
const INK = new THREE.MeshBasicMaterial({ color: P.navy, side: THREE.BackSide });
const canvasTex = (w, h, draw) => { const c = document.createElement('canvas'); c.width = w; c.height = h; const x = c.getContext('2d'); draw(x, w, h); const tx = new THREE.CanvasTexture(c); tx.colorSpace = THREE.SRGBColorSpace; tx.anisotropy = 8; return Object.assign(tx, { cvs: c, ctx: x }); };

// ───────── Earth (466 Ma: odd continents), ink outline, glow, a 2D face on a billboard
const earthTex = canvasTex(2048, 1024, (x, w, h) => {
  x.fillStyle = P.ocean; x.fillRect(0, 0, w, h);
  const R = mulberry(17); x.fillStyle = P.land;
  for (let i = 0; i < 9; i++) { const cx = R() * w, cy = h * (.3 + R() * .45), s = 90 + R() * 170; for (const dx of [-w, 0, w]) { x.beginPath(); for (let k = 0; k <= 40; k++) { const a = k / 40 * TAU, rr = s * (.75 + .15 * Math.sin(a * 3 + i) + .1 * Math.sin(a * 5 + i * 2)); x.lineTo(cx + dx + Math.cos(a) * rr * 1.5, cy + Math.sin(a) * rr); } x.fill(); } }
  x.fillStyle = 'rgba(255,255,255,.95)'; x.fillRect(0, 0, w, 70); x.fillRect(0, h - 60, w, 60);
});
const earth = new THREE.Group(); earth.position.copy(E); scene.add(earth);
const globe = new THREE.Mesh(new THREE.SphereGeometry(1, 96, 64), toon({ map: earthTex })); globe.castShadow = true; globe.receiveShadow = true; earth.add(globe);
const hull = new THREE.Mesh(new THREE.SphereGeometry(1.035, 64, 48), INK); earth.add(hull);
const glowTex = (rgb) => canvasTex(256, 256, (x, w) => { const gr = x.createRadialGradient(w / 2, w / 2, 0, w / 2, w / 2, w / 2); gr.addColorStop(0, `rgba(${rgb},.55)`); gr.addColorStop(.45, `rgba(${rgb},.2)`); gr.addColorStop(1, `rgba(${rgb},0)`); x.fillStyle = gr; x.fillRect(0, 0, w, w); });
const eGlow = new THREE.Sprite(new THREE.SpriteMaterial({ map: glowTex('90,170,255'), depthWrite: false, transparent: true })); eGlow.scale.set(3.4, 3.4, 1); earth.add(eGlow);
const faceTex = canvasTex(512, 512, () => {});
const facePlane = new THREE.Mesh(new THREE.PlaneGeometry(2, 2), new THREE.MeshBasicMaterial({ map: faceTex, transparent: true, depthWrite: false })); scene.add(facePlane);

// ───────── the ring: banded rock (planar UVs of RingGeometry map a square texture of circles), real shadows both ways, + orbiting rocks
const RIN = 1.45, ROUT = 2.45, ringTex = canvasTex(2048, 2048, (x, w) => {
  const c = w / 2, px = r => r / ROUT * c;
  for (const [r0, r1, col] of [[1.45, 1.62, 'rgba(154,147,168,.45)'], [1.62, 1.68, 'rgba(0,0,0,0)'], [1.68, 1.98, 'rgba(190,183,202,.85)'], [1.98, 2.05, 'rgba(93,86,112,.25)'], [2.05, 2.32, 'rgba(165,157,182,.7)'], [2.32, 2.45, 'rgba(111,104,128,.35)']]) {
    x.beginPath(); x.arc(c, c, px(r1), 0, TAU); x.arc(c, c, px(r0), 0, TAU, true); x.fillStyle = col; x.fill('evenodd');
  }
  const R = mulberry(5); for (let i = 0; i < 2600; i++) { const a = R() * TAU, r = px(RIN + R() * (ROUT - RIN)); x.fillStyle = R() < .5 ? 'rgba(255,255,255,.5)' : 'rgba(60,54,80,.35)'; x.beginPath(); x.arc(c + Math.cos(a) * r, c + Math.sin(a) * r, 1 + R() * 2.5, 0, TAU); x.fill(); }
});
const ringGroup = new THREE.Group(); ringGroup.rotation.z = .32; ringGroup.rotation.x = .05; earth.add(ringGroup);
const ringMat = toon({ map: ringTex, transparent: true, alphaTest: .15, side: THREE.DoubleSide });
const ringMesh = new THREE.Mesh(new THREE.RingGeometry(RIN, ROUT, 256, 1), ringMat); ringMesh.rotation.x = -Math.PI / 2; ringMesh.castShadow = true; ringMesh.receiveShadow = true;
ringMesh.customDepthMaterial = new THREE.MeshDepthMaterial({ depthPacking: THREE.RGBADepthPacking, map: ringTex, alphaTest: .15 }); ringGroup.add(ringMesh);
const NR = 450, rocks = new THREE.InstancedMesh(new THREE.IcosahedronGeometry(1, 0), toon({ color: '#a89fb6', flatShading: true }), NR); rocks.castShadow = true;
{ const R = mulberry(9), m = new THREE.Matrix4(), q = new THREE.Quaternion(), e = new THREE.Euler();
  for (let i = 0; i < NR; i++) { const a = R() * TAU, r = RIN + R() * (ROUT - RIN), s = .012 + R() * R() * .05; e.set(R() * 6, R() * 6, R() * 6); q.setFromEuler(e); m.compose(new THREE.Vector3(Math.cos(a) * r, (R() - .5) * .05, Math.sin(a) * r), q, new THREE.Vector3(s, s * .8, s)); rocks.setMatrixAt(i, m); } }
ringGroup.add(rocks);

// ───────── the Sun (the 2D Sun character as a billboard, so it stays on-brand) and the habitable zone
const sunTex = canvasTex(1024, 1024, () => {});
const sunSprite = new THREE.Sprite(new THREE.SpriteMaterial({ map: sunTex, transparent: true, depthWrite: false })); sunSprite.position.copy(SUN); sunSprite.scale.set(9, 9, 1); scene.add(sunSprite);
const hzMat = new THREE.MeshBasicMaterial({ color: '#5fcf7a', transparent: true, opacity: 0, side: THREE.DoubleSide, depthWrite: false });
const hz = new THREE.Mesh(new THREE.RingGeometry(10.2, 13.8, 180, 1), hzMat); hz.rotation.x = -Math.PI / 2; scene.add(hz);
const orbitMat = new THREE.MeshBasicMaterial({ color: '#ffffff', transparent: true, opacity: 0, side: THREE.DoubleSide, depthWrite: false });
const orbit = new THREE.Mesh(new THREE.RingGeometry(11.96, 12.04, 256, 1), orbitMat); orbit.rotation.x = -Math.PI / 2; scene.add(orbit);

// ───────── camera: orbit → crane up (top-down, Sun at the top of frame) → swoop back in
const V = (x, y, z) => new THREE.Vector3(x, y, z);
function orbitCam(r, az, el, tgt) { return { p: V(tgt.x + r * Math.cos(el) * Math.sin(az), tgt.y + r * Math.sin(el), tgt.z + r * Math.cos(el) * Math.cos(az)), t: tgt.clone(), u: V(0, 1, 0) }; }
const tgtE = E.clone().add(V(0, .25, 0));
function camAt(t) {
  const A = orbitCam(11.5, lerp(-.75, -.35, t / 4), .13, tgtE);
  const B = { p: V(8.4, 31, 3), t: V(7.6, 0, 0), u: V(-1, 0, -.15).normalize() };
  const C = orbitCam(lerp(10.5, 9.2, ss(seg(t, 9, DUR))), lerp(-.25, .2, seg(t, 8.6, DUR)), .12, tgtE);
  const k1 = eio(seg(t, 3.4, 6.2)), k2 = eio(seg(t, 8.3, 10.2));
  const mix = (a, b, k) => ({ p: a.p.clone().lerp(b.p, k), t: a.t.clone().lerp(b.t, k), u: a.u.clone().lerp(b.u, k).normalize() });
  return k2 > 0 ? mix(mix(A, B, k1), C, k2) : mix(A, B, k1);
}

// ───────── 2D layers: the star field (parallax with the camera) and the overlay (type, brackets, captions)
function stars(t, yaw) {
  K.setup(bgc, W, H); bgc.setTransform(1, 0, 0, 1, 0, 0); const dx = ((yaw * 900) % W + W) % W;
  for (const ox of [dx - W, dx]) { bgc.save(); bgc.translate(ox, 0); K.bg(t); bgc.restore(); }
}
const proj = (v) => { const p = v.clone().project(camera); return { x: (p.x + 1) / 2 * W, y: (1 - p.y) / 2 * H }; };
function drawFace(t, k, mood) {
  const x = faceTex.ctx; x.clearRect(0, 0, 512, 512); if (k <= 0) { faceTex.needsUpdate = true; return; }
  K.setup(x, 512, 512); x.save(); x.globalAlpha = k; x.translate(256, 256); K.face(250, mood, t, -.2, .7); x.restore(); faceTex.needsUpdate = true;
}
function drawSun(t) { const x = sunTex.ctx; x.clearRect(0, 0, 1024, 1024); K.setup(x, 1024, 1024); K.sunChar(512, 512, 210, t, { mood: 'happy' }); sunTex.needsUpdate = true; }

// captions (same as the 2D films)
const FIX = { 'earth': 'Earth' };
const KEY = new Set(['planet', 'oceans', 'ring', 'saturn', 'life', 'earth', '466', 'million', 'new', 'world']);
const CAP = [];
for (const [id, ws] of Object.entries(words)) {
  const toks = []; for (const w of ws) { const b = w[0].toLowerCase().replace(/[.,?]$/, ''), s = FIX[b] ? FIX[b] + (w[0].match(/[.,?]$/)?.[0] || '') : w[0]; if (/^[,.\-]/.test(s) && toks.length) { const p = toks[toks.length - 1]; p.w += s.replace(/^-/, ' '); p.t1 = w[2]; } else toks.push({ w: s, k: w[0], t0: Math.max(0, w[1]), t1: w[2] }); }
  let line = [], n = 0; const flush = () => { if (line.length) CAP.push({ words: line.map(x => ({ ...x, t0: VO[id] + x.t0, t1: VO[id] + x.t1 })) }); line = []; n = 0; };
  for (const tk of toks) { line.push(tk); n += tk.w.length + 1; if (n > 18 || /[.?!,:]$/.test(tk.w) && n > 9) flush(); }
  flush();
}
for (let i = 0; i < CAP.length; i++) { const c = CAP[i], e = c.words[c.words.length - 1].t1; c.t0 = c.words[0].t0 - .05; c.t1 = i + 1 < CAP.length ? Math.min(CAP[i + 1].words[0].t0 - .02, e + .7) : e + .8; }
function captions(g, t) {
  const c = CAP.find(c => t >= c.t0 && t < c.t1); if (!c) return;
  g.save(); g.font = '900 74px NU';
  const ws = c.words.map(w => ({ ...w, s: w.w.replace(/[,]$/, ''), wd: g.measureText(w.w.replace(/[,]$/, '') + ' ').width }));
  const rows = [[]]; let rw = 0; for (const w of ws) { if (rw + w.wd > 900 && rows[rows.length - 1].length) { rows.push([]); rw = 0; } rows[rows.length - 1].push(w); rw += w.wd; }
  rows.forEach((row, ri) => { const tot = row.reduce((p, w) => p + w.wd, 0); let x = CX - tot / 2; const y = 1600 + ri * 88;
    for (const w of row) { const k = clamp((t - w.t0) / .1); if (k > 0) { g.save(); g.globalAlpha = k; g.translate(x, y); const s = .85 + .15 * eo(k); g.scale(s, s); g.lineJoin = 'round'; g.lineWidth = 16; g.strokeStyle = P.navy; g.textAlign = 'left'; g.strokeText(w.s, 0, 0); g.fillStyle = KEY.has(nrm(w.k)) ? P.gold : P.white; g.fillText(w.s, 0, 0); g.restore(); } x += w.wd; } });
  g.restore();
}

function overlay(t) {
  K.setup(ov, W, H); const g = ov; g.setTransform(1, 0, 0, 1, 0, 0); g.clearRect(0, 0, W, H);
  const pe = proj(E), aA = 1 - ss(seg(t, 3.2, 3.9));
  if (aA > 0) {                                                    // scanning brackets around the planet + the title
    const sc = .5 + .5 * Math.sin(t * 3), R = 300; g.save(); g.globalAlpha = aA; g.strokeStyle = `rgba(63,224,255,${.5 + .3 * sc})`; g.lineWidth = 6;
    for (const [sx, sy] of [[-1, -1], [1, -1], [1, 1], [-1, 1]]) { g.beginPath(); g.moveTo(pe.x + sx * R, pe.y + sy * (R - 80)); g.lineTo(pe.x + sx * R, pe.y + sy * R); g.lineTo(pe.x + sx * (R - 80), pe.y + sy * R); g.stroke(); } g.restore();
    text('SCANNING…', pe.x, pe.y + 380, 40, P.cyan, 1000, P.navy, 8, 'center', aA * (.6 + .4 * sc));
    g.save(); g.globalAlpha = aA; g.translate(CX, 330); text('WHAT IS', 0, -20, 92, P.white, 1000, P.navy, 16); text('THIS PLANET?', 0, 110, 120, P.gold, 1000, P.navy, 18); g.restore();
  }
  const aB = ss(seg(t, Math.max(T.spot, 5.6) - .3, Math.max(T.spot, 5.6) + .2)) * (1 - ss(seg(t, 8.2, 8.8)));
  if (aB > 0) { const ph = proj(E); text('habitable zone', CX, ph.y - 440, 56, '#8af0a6', 1000, P.navy, 10, 'center', aB); text('just right for life', CX, ph.y - 380, 42, P.white, 900, P.navy, 8, 'center', aB); }
  const ks = pop(t, T.newW) * (1 - ss(seg(t, 8.2, 8.8)));
  if (ks > 0) { g.save(); g.translate(CX, pe.y - 230); g.rotate(-.12); g.scale(ks, ks); g.strokeStyle = P.red; g.lineWidth = 10; g.beginPath(); g.roundRect(-230, -60, 460, 120, 20); g.stroke(); text('NEW WORLD?', 0, 22, 70, P.red, 1000, null, 0); g.restore(); }
  const ke = pop(t, T.earth3); if (ke > 0) { g.save(); g.translate(CX, 380); g.scale(ke, ke); text("IT'S EARTH", 0, 40, 130, P.gold, 1000, P.navy, 18); g.restore(); }
  const ky = pop(t, T.y466 - .1); if (ky > 0) { g.save(); g.translate(CX, 1400); g.scale(ky, ky); card(0, 0, 760, 170, 1); text('466 MILLION', 0, -5, 84, P.gold, 1000, null, 0); text('YEARS AGO', 0, 58, 46, P.white, 1000, null, 0); g.restore(); }
  captions(g, t);
  const fo = seg(t, DUR - .6, DUR); if (fo > 0) { g.fillStyle = `rgba(0,0,0,${fo})`; g.fillRect(0, 0, W, H); }
}

// ───────── frame
function render(t) {
  const c = camAt(t); camera.position.copy(c.p); camera.up.copy(c.u); camera.lookAt(c.t); camera.updateMatrixWorld();
  globe.rotation.y = t * .25; ringGroup.rotation.y = t * .05; rocks.rotation.y = t * .08;
  const zone = ss(seg(t, T.spot - .4, T.spot + .5)) * (1 - ss(seg(t, 8.4, 9.6))); hzMat.opacity = .26 * zone; orbitMat.opacity = .35 * ss(seg(t, 3.8, 5.2)) * (1 - ss(seg(t, 8.4, 9.6)));
  const toCam = camera.position.clone().sub(E).normalize(); facePlane.position.copy(E).addScaledVector(toCam, 1.02); facePlane.quaternion.copy(camera.quaternion);
  drawFace(t, ss(seg(t, T.earth3 - .25, T.earth3 + .15)), 'wink'); drawSun(t);
  const sph = new THREE.Spherical().setFromVector3(camera.position.clone().sub(c.t)); stars(t, -sph.theta);
  renderer.render(scene, camera);
  overlay(t);
}

// ───────── events for the score and the mix
const EV = [];
for (const [id, t] of Object.entries(VO)) EV.push({ type: 'vo', id, t });
for (const [k, v] of Object.entries(T)) EV.push({ type: 'cue', name: k, t: +v.toFixed(3) });
S.forEach((s, i) => { if (i > 0 && i < S.length - 1) EV.push({ type: 'scene', i, t: +s.toFixed(3) }); });
EV.sort((a, b) => a.t - b.t);
window.EV = EV; window.DUR = DUR; window.render = render;
window.SUBS = lines.map((l, i) => { const ws = words[l.id], t0 = VO[l.id] - .05, nx = lines[i + 1] ? VO[lines[i + 1].id] - .05 : DUR; return { t0, t1: Math.max(Math.min(VO[l.id] + ws[ws.length - 1][2] + .6, nx), t0 + 1.8), text: l.sub || l.text }; });
K.setup(bgc, W, H); K.makeStars(110, 5);
render(+(new URLSearchParams(location.search).get('t') ?? 1.5));
window.READY = true;
