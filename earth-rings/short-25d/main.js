// "What If Earth Had Rings?" — the 51 s short in 2.5D: the flat kit drawn into a small 3D world (perspective camera,
// depth-sorted bodies, perspective rings with Earth's shadow, parallax stars, depth-of-field rocks); ground views in parallax layers. Flat-vector, vertical 1080×1920, canvas 2D, deterministic in t.
// Beyond Everything brand style (kit.js shared with the other films). Thirty beats, one per line: a mystery planet that turns out
// to be Earth 466 million years ago; an asteroid torn apart at the Roche limit; the ring seen from the equator, mid-latitudes and
// the poles; the shadow and the ice age; the crater band; Saturn's ring rain; satellites; the Moon; and the plain sky tonight.
import * as K from './kit.js';
import { clamp, lerp, seg, ss, eio, eo, mulberry, TAU } from '/core/lib.js';
const { P, text, sparkle, glow, card, bubble, pop } = K;

const W = 1080, H = 1920, CX = W / 2, CY = H / 2;
const cv = document.getElementById('c'), g = cv.getContext('2d');
K.setup(g, W, H); K.makeStars(110, 5);
await document.fonts.load('900 80px NU'); await document.fonts.load('800 40px NU');
const words = await (await fetch('voices/words.json')).json();
const lines = await (await fetch('lines.json')).json();
const dur = await (await fetch('voices/dur.json')).json();

// ───────── timeline: one scene per line
const IDS = lines.map(l => l.id), VO = {};
{ let t = .2; for (const id of IDS) { VO[id] = +t.toFixed(3); t += dur[id] + .45; } }
const LAST = IDS[IDS.length - 1], DUR = +(VO[LAST] + dur[LAST] + 1.8).toFixed(2);
const nrm = s => s.toLowerCase().replace(/[^a-z0-9]/g, '');
const at = (id, w, k = 0, e = 1) => { let n = 0; for (const x of words[id]) if (nrm(x[0]).startsWith(nrm(w)) && n++ === k) return VO[id] + Math.max(0, x[e]); throw new Error(`${w} in ${id}`); };
const S = [0, ...IDS.slice(1).map(id => VO[id] - .3), DUR];
const sceneAt = t => { let i = 0; while (i < S.length - 2 && t >= S[i + 1]) i++; return i; };
const XF = .45;
const T = {
  saturn: at('r01', 'saturn'),
  step: at('r02', 'step'), arch: at('r02', 'giant'), across: at('r02', 'across'),
  night: VO.r03, catch: at('r03', 'catch'), brighter: at('r03', 'brighter'),
  shadows: at('r04', 'shadows'), winter: at('r04', 'winter'), colder: at('r04', 'colder'),
  space: at('r05', 'space'), rocks: at('r05', 'rocks'), smash: at('r05', 'smash'),
  last: at('r06', 'last'), moon: at('r06', 'moon'), crashing: at('r06', 'crashing'), shooting: at('r06', 'shooting'),
  could: VO.r07, strange: at('r07', 'strange'), already: at('r07', 'already'),
  sci: VO.r08, ring466: at('r08', 'ring'), years: at('r08', '466'), cool: at('r08', 'cool'),
  look: at('r09', 'look'), plain: at('r09', 'plain'), once: at('r09', 'ring'),
};

// ───────── the ring: stroked bands + loose rocks, split into the half behind the planet and the half in front
const ICE = [[1.0, 26, '#f3e6c8', .9], [1.12, 16, '#cdb68c', .75], [1.23, 30, '#fff4dc', .85], [1.36, 12, '#b89f78', .6]];
const ROCK = [[1.0, 24, '#9a93a8', .9], [1.13, 18, '#6f6880', .8], [1.25, 26, '#b2abbe', .8], [1.37, 10, '#5d5670', .6]];
function ring(x, y, rx, ry, tilt, half, t, a = 1, o = {}) {
  if (a <= 0) return;
  const base = g.globalAlpha * a, a0 = half === 'back' ? Math.PI : 0, a1 = half === 'back' ? TAU : Math.PI, sw = o.sweep ?? 1;
  g.save(); g.translate(x, y); g.rotate(tilt);
  for (const [k, w, col, al] of o.bands || ICE) { g.globalAlpha = base * al; g.strokeStyle = col; g.lineWidth = w * (o.ws || 1); g.beginPath(); g.ellipse(0, 0, rx * k, ry * k, 0, a0, a0 + (a1 - a0) * sw); g.stroke(); }
  const R = mulberry(o.seed || 7); g.globalAlpha = base;
  for (let i = 0; i < 70; i++) { const u = (R() + t * .015 * (1 + R())) % 1, th = a0 + u * (a1 - a0), kk = .95 + R() * .45; if (u > sw) continue; g.fillStyle = R() < .5 ? '#ffffff' : (o.bands === ROCK ? '#8a8399' : '#e3cfa4'); g.beginPath(); g.arc(Math.cos(th) * rx * kk, Math.sin(th) * ry * kk, (2 + R() * 4) * (o.ws || 1), 0, TAU); g.fill(); }
  g.restore();
}
function ringedEarth(x, y, r, t, mood, o = {}) {
  const tilt = o.tilt ?? -.32, rx = r * (o.rx ?? 1.9), ry = r * (o.ry ?? .42), ra = o.ra ?? 1, opt = { bands: o.bands, seed: o.seed, ws: o.ws, sweep: o.sweep };
  ring(x, y, rx, ry, tilt, 'back', t, ra, opt);
  K.earth(x, y, r, t, mood, { look: o.look || 0, lookY: o.lookY || 0, noFace: o.noFace });
  if (o.under) o.under();
  ring(x, y, rx, ry, tilt, 'front', t, ra, opt);
}

// ───────── extra characters for this film
function planetChar(x, y, r, t, c1, c2, mood = 'happy', o = {}) {   // Saturn: banded ball, cel shadow, face
  g.save(); g.translate(x, y); glow(0, 0, r * 1.5, '255,210,140', .25);
  g.beginPath(); g.arc(0, 0, r, 0, TAU); g.save(); g.clip(); g.fillStyle = c1; g.fillRect(-r, -r, 2 * r, 2 * r);
  g.fillStyle = c2; for (const [v, h] of [[-.45, .12], [.1, .1], [.5, .12]]) { g.beginPath(); g.ellipse(0, v * r, r * 1.1, h * r, 0, 0, TAU); g.fill(); }
  g.fillStyle = 'rgba(40,20,70,.3)'; g.beginPath(); g.arc(r * .35, r * .1, r * 1.1, 0, TAU); g.arc(-r * .15, -r * .08, r * 1.02, 0, TAU, true); g.fill('evenodd');
  g.restore(); K.face(r, mood, t, o.look || 0, 2.4); g.restore();
}
function saturn(x, y, r, t, mood) {
  ring(x, y, r * 2.1, r * .5, -.25, 'back', t, 1, { ws: .45, seed: 3 });
  planetChar(x, y, r, t, '#f0c878', '#d9a85a', mood, { look: -1 });
  ring(x, y, r * 2.1, r * .5, -.25, 'front', t, 1, { ws: .45, seed: 3 });
}
function satellite(x, y, s, rot, t, mood = 'happy') {
  g.save(); g.translate(x, y); g.rotate(rot); g.scale(s, s);
  for (const dx of [-1, 1]) { g.fillStyle = '#2f5fd0'; g.fillRect(dx * 70 - (dx < 0 ? 120 : 0), -34, 120, 68); g.strokeStyle = '#8fb3ff'; g.lineWidth = 3; for (let k = 1; k < 4; k++) { g.beginPath(); g.moveTo(dx * 70 - (dx < 0 ? 120 : 0) + k * 30, -34); g.lineTo(dx * 70 - (dx < 0 ? 120 : 0) + k * 30, 34); g.stroke(); } }
  g.fillStyle = '#c9ced9'; g.fillRect(-72, -6, 144, 12);
  g.fillStyle = P.gold; g.beginPath(); g.roundRect(-60, -55, 120, 110, 18); g.fill(); g.fillStyle = '#e8a91a'; g.beginPath(); g.roundRect(-60, 20, 120, 35, [0, 0, 18, 18]); g.fill();
  g.strokeStyle = '#c9ced9'; g.lineWidth = 6; g.beginPath(); g.moveTo(0, -55); g.lineTo(0, -95); g.stroke(); g.fillStyle = P.white; g.beginPath(); g.arc(0, -100, 10, 0, TAU); g.fill();
  g.translate(0, -4); K.face(46, mood, t, .5, 3.3); g.restore();
}
function rock(x, y, r, rot, col = '#8a8399') {
  g.save(); g.translate(x, y); g.rotate(rot); g.fillStyle = col; g.beginPath();
  for (let i = 0; i < 7; i++) { const a = i / 7 * TAU, rr = r * (.75 + .25 * Math.sin(i * 2.3)); g.lineTo(Math.cos(a) * rr, Math.sin(a) * rr); }
  g.closePath(); g.fill(); g.fillStyle = 'rgba(30,20,60,.3)'; g.beginPath(); g.arc(r * .2, r * .2, r * .45, 0, TAU); g.fill(); g.restore();
}
function burst(x, y, k, r = 90) {                                  // impact sparks, k = 0..1 progress
  if (k <= 0 || k >= 1) return; glow(x, y, r * 1.6 * (1 - k * .5), '255,220,120', .8 * (1 - k));
  for (let i = 0; i < 10; i++) { const a = i / 10 * TAU + .3, d = r * (.3 + k * 1.2); sparkle(x + Math.cos(a) * d, y + Math.sin(a) * d, 18 * (1 - k) + 4, i % 2 ? P.gold : P.white, 1 - k); }
}
function snowflake(x, y, r, a = 1) {
  g.save(); g.globalAlpha *= a; g.strokeStyle = P.white; g.lineWidth = r * .22; g.lineCap = 'round';
  for (let i = 0; i < 3; i++) { const q = i / 3 * Math.PI; g.beginPath(); g.moveTo(x - Math.cos(q) * r, y - Math.sin(q) * r); g.lineTo(x + Math.cos(q) * r, y + Math.sin(q) * r); g.stroke(); }
  g.restore();
}

// ───────── the backyard: a hill, a deck chair, someone looking up; the arch across the sky
const HILL = '#3fa866', HILLD = '#2d8a52';
function backyard(t, night, archK, o = {}) {
  if (night) K.bg(t, '#090726', '#271a66');
  else { const gr = g.createLinearGradient(0, 0, 0, 1300); gr.addColorStop(0, '#5cc4f2'); gr.addColorStop(1, '#bfe9ff'); g.fillStyle = gr; g.fillRect(0, 0, W, H); K.sunBody(900, 300, 70, t); }
  // the arch: an ellipse from the east horizon to the west one
  if (archK > 0) {
    const ax = CX, ay = 1700, rx = 1050, ry = 1300, a0 = Math.PI, a1 = a0 + Math.PI * archK, bright = night ? 1 : .85;
    if (night) { g.save(); g.globalAlpha = .55 * (o.glow ?? 1); g.strokeStyle = 'rgba(255,240,200,.35)'; g.lineWidth = 260; g.beginPath(); g.ellipse(ax, ay, rx, ry, 0, a0, a1); g.stroke(); g.restore(); }
    for (const [k, w, col, al] of [[1, 70, night ? '#fff6dc' : '#ffffff', .95 * bright], [1.07, 40, night ? '#e9d7b0' : '#f3ecdc', .8 * bright], [1.13, 24, night ? '#fffbe8' : '#ffffff', .75 * bright], [.94, 16, '#d8c49c', .55 * bright]]) {
      g.save(); g.globalAlpha = al * (o.ra ?? 1); g.strokeStyle = col; g.lineWidth = w; g.beginPath(); g.ellipse(ax, ay, rx * k, ry * k, 0, a0, a1); g.stroke(); g.restore();
    }
  }
  if (o.ghost) { g.save(); g.globalAlpha = o.ghost; g.setLineDash([26, 22]); g.strokeStyle = 'rgba(255,240,200,.8)'; g.lineWidth = 10; g.beginPath(); g.ellipse(CX, 1700, 1050, 1300, 0, Math.PI, TAU); g.stroke(); g.restore(); }
  // the ground
  const lit = o.lit || 0;
  g.fillStyle = night ? `rgb(${lerp(22, 60, lit)},${lerp(40, 100, lit)},${lerp(70, 110, lit)})` : HILL;
  g.beginPath(); g.moveTo(0, 1290); g.quadraticCurveTo(CX, 1180, W, 1300); g.lineTo(W, H); g.lineTo(0, H); g.fill();
  g.fillStyle = night ? 'rgba(0,0,0,.3)' : HILLD; g.beginPath(); g.moveTo(0, 1420); g.quadraticCurveTo(CX, 1360, W, 1440); g.lineTo(W, H); g.lineTo(0, H); g.fill();
  K.deckchair(CX - 10, 1275, .95);
  K.person(CX - 60, 1300, .95, t, { mood: o.mood || 'happy', look: o.look ?? .2, lookY: -1, mug: o.mug });
  if (night && lit > 0) glow(CX - 60, 1050, 420, '255,240,200', .25 * lit);
}

// ───────── more characters and props for v2
function asteroid(x, y, r, t, mood = 'happy', o = {}) {             // a lumpy rock with a face; o.sx / o.sy stretch it, o.crack 0..1
  g.save(); g.translate(x, y); g.rotate(o.rot || 0); g.scale(o.sx || 1, o.sy || 1);
  g.fillStyle = '#9b8f84'; g.beginPath(); for (let i = 0; i < 12; i++) { const a = i / 12 * TAU, rr = r * (.86 + .14 * Math.sin(i * 2.7 + 1)); g.lineTo(Math.cos(a) * rr, Math.sin(a) * rr); } g.closePath(); g.fill();
  g.save(); g.clip(); g.fillStyle = '#7d7268'; for (const [cx, cy, s] of [[-.45, -.35, .2], [.5, .3, .16], [-.2, .55, .12], [.35, -.55, .1]]) { g.beginPath(); g.arc(cx * r, cy * r, s * r, 0, TAU); g.fill(); }
  g.fillStyle = 'rgba(30,20,60,.3)'; g.beginPath(); g.arc(r * .35, r * .1, r * 1.1, 0, TAU); g.arc(-r * .15, -r * .08, r * 1.02, 0, TAU, true); g.fill('evenodd'); g.restore();
  if (o.crack) { g.strokeStyle = '#2a2140'; g.lineWidth = r * .06; g.lineCap = 'round'; g.beginPath(); g.moveTo(-r * .1, -r); g.lineTo(r * .1, -r * .4); g.lineTo(-r * .15, 0); g.lineTo(r * .12, r * .5 * o.crack + r * .1); g.stroke(); }
  g.restore(); g.save(); g.translate(x, y); K.face(r * .8, mood, t, o.look || 0, 4.1); g.restore();
}
function roche(x, y, R, a = 1, label = true) {
  if (a <= 0) return; g.save(); g.globalAlpha *= a; g.setLineDash([24, 18]); g.strokeStyle = P.gold; g.lineWidth = 7; g.beginPath(); g.arc(x, y, R, 0, TAU); g.stroke(); g.restore();
  if (label) text('ROCHE LIMIT', x, y - R - 30, 50, P.gold, 1000, P.navy, 10, 'center', a);
}
function head(x, y, r, t, mood, hair = P.hair, o = {}) {
  g.save(); g.translate(x, y); g.fillStyle = o.coat || '#ffffff'; g.beginPath(); g.roundRect(-r * 1.1, r * .85, r * 2.2, r * 1.6, r * .6); g.fill();
  g.fillStyle = P.skin; g.beginPath(); g.arc(0, 0, r, 0, TAU); g.fill(); g.fillStyle = hair; g.beginPath(); g.arc(0, -r * .15, r * 1.02, Math.PI * 1.02, Math.PI * 1.98); g.fill();
  if (o.glasses) { g.strokeStyle = P.navy; g.lineWidth = r * .06; for (const dx of [-.36, .36]) { g.beginPath(); g.arc(dx * r, r * .05, r * .24, 0, TAU); g.stroke(); } }
  g.translate(0, r * .1); K.face(r * .85, mood, t, o.look || 0, o.seed || 5.2); g.restore();
}
function creature(x, y, s, kind, grey, t) {                         // Ordovician sea life: a trilobite or a shelled squid
  g.save(); g.translate(x, y + Math.sin(t * 2 + x) * 4); g.scale(s, s); const c1 = grey ? '#5a5670' : kind ? '#ff9a6e' : '#ffc26e', c2 = grey ? '#46425a' : kind ? '#e87a50' : '#e8a04a';
  if (kind) { g.fillStyle = c1; g.beginPath(); g.moveTo(-60, 0); g.lineTo(40, -22); g.lineTo(40, 22); g.closePath(); g.fill(); g.fillStyle = c2; for (let i = 0; i < 4; i++) g.fillRect(-40 + i * 20, -16 + i * 1, 6, 32 - i * 2); g.strokeStyle = c2; g.lineWidth = 6; for (let i = 0; i < 4; i++) { g.beginPath(); g.moveTo(40, -10 + i * 7); g.lineTo(70, -18 + i * 12); g.stroke(); } }
  else { g.fillStyle = c1; g.beginPath(); g.ellipse(0, 0, 50, 34, 0, 0, TAU); g.fill(); g.fillStyle = c2; for (let i = -2; i <= 2; i++) { g.beginPath(); g.ellipse(i * 16, 0, 5, 30, 0, 0, TAU); g.fill(); } g.beginPath(); g.ellipse(-50, 0, 14, 20, 0, 0, TAU); g.fill(); }
  g.translate(kind ? 10 : -20, -2); K.face(24, grey ? 'sad' : 'happy', t, 0, x * .01); g.restore();
}
function cassini(x, y, s, rot = 0) {
  g.save(); g.translate(x, y); g.rotate(rot); g.scale(s, s);
  g.fillStyle = '#e8e2d0'; g.beginPath(); g.ellipse(0, -60, 70, 22, 0, 0, TAU); g.fill(); g.fillStyle = '#c9c2ae'; g.beginPath(); g.ellipse(0, -55, 54, 14, 0, 0, TAU); g.fill();
  g.fillStyle = P.gold; g.beginPath(); g.roundRect(-30, -45, 60, 90, 12); g.fill(); g.fillStyle = '#e8a91a'; g.fillRect(-30, 15, 60, 12);
  g.strokeStyle = '#c9ced9'; g.lineWidth = 5; g.beginPath(); g.moveTo(30, 0); g.lineTo(110, 30); g.stroke(); g.fillStyle = '#8a8fb0'; g.beginPath(); g.arc(-40, 30, 14, 0, TAU); g.fill();
  g.restore();
}
function camera(x, y, s, a = 1) {
  g.save(); g.globalAlpha *= a; g.translate(x, y); g.scale(s, s); g.fillStyle = '#2a2f55'; g.beginPath(); g.roundRect(-120, -70, 240, 150, 24); g.fill(); g.fillRect(-50, -100, 80, 40);
  g.fillStyle = '#9ad7ff'; g.beginPath(); g.arc(0, 5, 52, 0, TAU); g.fill(); g.fillStyle = '#2a2f55'; g.beginPath(); g.arc(0, 5, 30, 0, TAU); g.fill(); g.restore();
}
function cross(x, y, r, a = 1) { if (a <= 0) return; g.save(); g.globalAlpha *= a; g.strokeStyle = P.red; g.lineWidth = r * .22; g.lineCap = 'round'; g.beginPath(); g.moveTo(x - r, y - r); g.lineTo(x + r, y + r); g.moveTo(x + r, y - r); g.lineTo(x - r, y + r); g.stroke(); g.restore(); }
function palm(x, y, s) {
  g.save(); g.translate(x, y); g.scale(s, s); g.strokeStyle = '#8a5a34'; g.lineWidth = 26; g.lineCap = 'round'; g.beginPath(); g.moveTo(0, 0); g.quadraticCurveTo(30, -180, -10, -330); g.stroke();
  g.fillStyle = '#3fb86a'; for (const a of [-2.6, -2.0, -1.2, -.5, .2]) { g.save(); g.translate(-10, -330); g.rotate(a); g.beginPath(); g.ellipse(80, 0, 90, 22, .25, 0, TAU); g.fill(); g.restore(); } g.restore();
}
function thermo(x, y, k, a = 1) {
  if (a <= 0) return; g.save(); g.globalAlpha *= a; g.fillStyle = P.white; g.beginPath(); g.roundRect(x - 28, y - 200, 56, 220, 28); g.fill(); g.beginPath(); g.arc(x, y + 30, 46, 0, TAU); g.fill();
  const col = '#3fb5ff'; g.fillStyle = col; g.beginPath(); g.arc(x, y + 30, 32, 0, TAU); g.fill(); g.fillRect(x - 12, y - 170 + 150 * k, 24, 200 - 150 * k); g.restore();
}
// the sky from the ground, at three latitudes: the same ring as an overhead line, an arch, or a low hump
function sky(t, night) {
  if (night) { K.bg(t, '#090726', '#271a66'); return; }
  const gr = g.createLinearGradient(0, 0, 0, 1300); gr.addColorStop(0, '#5cc4f2'); gr.addColorStop(1, '#bfe9ff'); g.fillStyle = gr; g.fillRect(0, 0, W, H);
}
function archSky(ay, rx, ry, k, wsc, night, a = 1) {
  if (k <= 0 || a <= 0) return; const a0 = Math.PI, a1 = a0 + Math.PI * k;
  if (night) { g.save(); g.globalAlpha = .45 * a; g.strokeStyle = 'rgba(255,240,200,.35)'; g.lineWidth = 260 * wsc; g.beginPath(); g.ellipse(CX, ay, rx, ry, 0, a0, a1); g.stroke(); g.restore(); }
  for (const [kk, w, col, al] of [[1, 70, night ? '#fff6dc' : '#ffffff', .95], [1.07, 40, night ? '#e9d7b0' : '#f3ecdc', .8], [1.13, 24, night ? '#fffbe8' : '#ffffff', .75], [.94, 16, '#d8c49c', .55]]) {
    g.save(); g.globalAlpha = al * a; g.strokeStyle = col; g.lineWidth = Math.max(3, w * wsc); g.beginPath(); g.ellipse(CX, ay, rx * (1 + (kk - 1) * wsc), ry * (1 + (kk - 1) * wsc), 0, a0, a1); g.stroke(); g.restore();
  }
}
function land(night, o = {}) {
  const lit = o.lit || 0, snow = o.snow;
  g.fillStyle = snow ? '#e8f1ff' : night ? `rgb(${lerp(22, 60, lit)},${lerp(40, 100, lit)},${lerp(70, 110, lit)})` : o.sand ? '#f2d08a' : HILL;
  g.beginPath(); g.moveTo(0, 1290); g.quadraticCurveTo(CX, 1180, W, 1300); g.lineTo(W, H); g.lineTo(0, H); g.fill();
  g.fillStyle = snow ? '#c8d8f2' : night ? 'rgba(0,0,0,.3)' : o.sand ? '#e0b86a' : HILLD; g.beginPath(); g.moveTo(0, 1420); g.quadraticCurveTo(CX, 1360, W, 1440); g.lineTo(W, H); g.lineTo(0, H); g.fill();
}
function sitter(t, o = {}) { K.deckchair(CX - 10, 1275, .95, o.chair); K.person(CX - 60, 1300, .95, t, { mood: o.mood || 'happy', look: o.look ?? .2, lookY: -1, mug: o.mug }); }
function place(label, a = 1) { if (a <= 0) return; g.save(); g.globalAlpha *= a; card(CX, 200, 560, 110, 1); g.restore(); text(label, CX, 222, 58, P.gold, 1000, null, 0, 'center', a); }
const dot = (x, y, r, col, a = 1) => { if (a <= 0) return; g.save(); g.globalAlpha *= a; g.fillStyle = col; g.beginPath(); g.arc(x, y, r, 0, TAU); g.fill(); g.restore(); };

// ───────── 2.5D: a tiny 3D world drawn with the flat kit (perspective camera, depth-sorted bodies, perspective rings)
let GA = 1;                                                          // the alpha of the scene being drawn (crossfades)
const v3 = (x, y, z) => ({ x, y, z }), add = (a, b) => v3(a.x + b.x, a.y + b.y, a.z + b.z), sub = (a, b) => v3(a.x - b.x, a.y - b.y, a.z - b.z), mul = (a, k) => v3(a.x * k, a.y * k, a.z * k);
const dot3 = (a, b) => a.x * b.x + a.y * b.y + a.z * b.z, crs = (a, b) => v3(a.y * b.z - a.z * b.y, a.z * b.x - a.x * b.z, a.x * b.y - a.y * b.x), nz = a => mul(a, 1 / Math.hypot(a.x, a.y, a.z));
const mix3 = (a, b, k) => add(mul(a, 1 - k), mul(b, k));
const rotY = (p, a) => v3(p.x * Math.cos(a) + p.z * Math.sin(a), p.y, -p.x * Math.sin(a) + p.z * Math.cos(a));
const O = v3(0, 0, 0), SUNDIR = v3(-1, 0, 0);
let CAM = null;
function setCam(tgt, dist, az, el, fov = 40) {
  const pos = add(tgt, v3(dist * Math.cos(el) * Math.sin(az), dist * Math.sin(el), dist * Math.cos(el) * Math.cos(az)));
  const f = nz(sub(tgt, pos)), r = nz(crs(f, v3(0, 1, 0))), u = crs(r, f);
  CAM = { pos, f, r, u, F: (H / 2) / Math.tan(fov / 2 * Math.PI / 180), az, el, tgt };
}
function pr(p) { const d = sub(p, CAM.pos), z = Math.max(.05, dot3(d, CAM.f)); return { x: CX + dot3(d, CAM.r) / z * CAM.F, y: CY - dot3(d, CAM.u) / z * CAM.F, z, s: CAM.F / z }; }
function Ring(c, tilt = .38, yaw = 0) { const n = nz(rotY(v3(-Math.sin(tilt), Math.cos(tilt), 0), yaw)), u = nz(crs(n, v3(0, 0, 1))), w = crs(n, u); return { c, n, u, w }; }
const rpt = (R, r, a) => add(R.c, add(mul(R.u, r * Math.cos(a)), mul(R.w, r * Math.sin(a))));
function shadowed(p, c, rad) { const d = sub(p, c), al = dot3(d, SUNDIR); if (al > 0) return false; return Math.hypot(d.x - SUNDIR.x * al, d.y - SUNDIR.y * al, d.z - SUNDIR.z * al) < rad; }
const ROCK3 = [[1.45, 1.62, [154, 147, 168], .55], [1.68, 1.98, [196, 189, 208], .9], [1.98, 2.05, [93, 86, 112], .3], [2.05, 2.32, [170, 162, 186], .8], [2.32, 2.45, [120, 112, 138], .45]];
const ICE3 = [[1.45, 1.62, [205, 182, 140], .6], [1.68, 1.98, [255, 244, 220], .92], [1.98, 2.05, [184, 159, 120], .3], [2.05, 2.32, [243, 230, 200], .85], [2.32, 2.45, [205, 182, 140], .45]];
function ringQuads(R, front, o) {                                  // o: bands, k (body radius), a, from, span, rb (shadowing body radius)
  const a = (o.a ?? 1) * GA; if (a <= 0) return; const ez = pr(R.c).z, k = o.k || 1, n = o.n || 150, a0 = o.from ?? 0, span = o.span ?? TAU;
  for (const [r0, r1, col, al] of o.bands || ROCK3) for (let i = 0; i < n; i++) {
    const aa = a0 + span * i / n, ab = a0 + span * (i + 1.08) / n, pm = rpt(R, (r0 + r1) / 2 * k, (aa + ab) / 2), q = pr(pm);
    if ((q.z < ez) !== front) continue;
    const c = shadowed(pm, R.c, k * (o.rb ?? 1)) ? col.map(v => v * .42) : col;
    const p0 = pr(rpt(R, r0 * k, aa)), p1 = pr(rpt(R, r1 * k, aa)), p2 = pr(rpt(R, r1 * k, ab)), p3 = pr(rpt(R, r0 * k, ab));
    g.globalAlpha = al * a; g.fillStyle = `rgb(${c.map(Math.round).join(',')})`; g.beginPath(); g.moveTo(p0.x, p0.y); g.lineTo(p1.x, p1.y); g.lineTo(p2.x, p2.y); g.lineTo(p3.x, p3.y); g.closePath(); g.fill();
  }
  g.globalAlpha = GA;
}
const ROCKS3 = (() => { const R = mulberry(9), a = []; for (let i = 0; i < 300; i++) a.push({ a: R() * TAU, r: 1.45 + R(), h: (R() - .5) * .05, s: .012 + R() * R() * .045, sp: .05 + R() * .04, c: R() < .5 ? '#ffffff' : '#b2abbe', rot: R() * 6 }); return a; })();
function ringRocks(R, front, t, o) {
  const a = (o.a ?? 1) * GA; if (a <= 0) return; const ez = pr(R.c).z, k = o.k || 1, a0 = o.from ?? 0, span = o.span ?? TAU;
  for (const r of ROCKS3) { let an = r.a + t * r.sp; if (span < TAU) { const rel = ((an - a0) % TAU + TAU) % TAU; if (rel > span) continue; }
    const p = add(rpt(R, r.r * k, an), mul(R.n, r.h * k)), q = pr(p); if ((q.z < ez) !== front) continue; const rr = r.s * k * q.s; if (rr < .6) continue;
    g.globalAlpha = a * (shadowed(p, R.c, k) ? .35 : 1); rock2(q.x, q.y, rr, r.rot + t, o.rockCol || r.c); }
  g.globalAlpha = GA;
}
function rock2(x, y, r, rot, col) { g.save(); g.translate(x, y); g.rotate(rot); g.fillStyle = col; g.beginPath(); for (let i = 0; i < 6; i++) { const a = i / 6 * TAU, rr = r * (.75 + .25 * Math.sin(i * 2.3)); g.lineTo(Math.cos(a) * rr, Math.sin(a) * rr); } g.closePath(); g.fill(); g.restore(); }
// a list of bodies → drawn far to near; a body with a ring draws ring-back, body, ring-front
function world(items, t) {
  const L = items.filter(Boolean).map(it => ({ ...it, q: pr(it.p) })).filter(it => it.q.z > .1).sort((a, b) => b.q.z - a.q.z);
  for (const it of L) {
    if (it.ring) { ringQuads(it.ring.R, false, it.ring); if (it.ring.rocks !== false) ringRocks(it.ring.R, false, t, it.ring); }
    it.draw(it.q);
    if (it.ring) { ringQuads(it.ring.R, true, it.ring); if (it.ring.rocks !== false) ringRocks(it.ring.R, true, t, it.ring); }
  }
}
const earthB = (p, t, mood, o = {}) => ({ p, ring: o.ring ? { R: Ring(p, o.tilt ?? .38), bands: o.ring, k: 1, a: o.ra ?? 1, from: o.from, span: o.span } : null,
  draw: q => { K.earth(q.x, q.y, q.s, t, mood, { rot: (o.rot ?? t * .3) - CAM.az, noFace: o.noFace, look: o.look || 0, lookY: o.lookY || 0 }); if (o.after) o.after(q); } });
const saturnB = (p, r, t, mood, o = {}) => ({ p, ring: { R: Ring(p, o.tilt ?? .45), bands: ICE3, k: r, a: o.ra ?? 1, rocks: false }, draw: q => planetChar(q.x, q.y, r * q.s, t, '#f0c878', '#d9a85a', mood, { look: o.look ?? -1 }) });
const moonB = (p, r, t, mood, o = {}) => ({ p, draw: q => K.moon(q.x, q.y, r * q.s, t, mood, { look: o.look ?? 0 }) });
const rockB = (p, r, t, mood, o = {}) => ({ p, draw: q => asteroid(q.x, q.y, r * q.s, t, mood, { rot: o.rot ?? t * .4, look: o.look ?? 0, sx: o.sx, sy: o.sy, crack: o.crack }) });
const sunB = (p, r, t) => ({ p, draw: q => { glow(q.x, q.y, 2.6 * r * q.s, '255,210,120', .35); K.sunChar(q.x, q.y, r * q.s, t, { mood: 'happy' }); } });
function streak3(p0, p1, ph, col = '#ffd98a', w = 7) { const a = pr(mix3(p0, p1, Math.max(0, ph - .14))), b = pr(mix3(p0, p1, ph)); g.save(); g.globalAlpha = GA * Math.sin(Math.min(1, ph) * Math.PI) ** .5; g.strokeStyle = col; g.lineWidth = w; g.lineCap = 'round'; g.beginPath(); g.moveTo(a.x, a.y); g.lineTo(b.x, b.y); g.stroke(); g.restore(); glow(b.x, b.y, 26, '255,210,130', .8 * GA); }
function dashed3(pts, col, w = 6, a = 1) { if (a <= 0) return; g.save(); g.globalAlpha = GA * a; g.setLineDash([22, 16]); g.strokeStyle = col; g.lineWidth = w; g.beginPath(); pts.forEach((p, i) => { const q = pr(p); i ? g.lineTo(q.x, q.y) : g.moveTo(q.x, q.y); }); g.stroke(); g.restore(); }
const circle3 = (R, r, n = 120) => Array.from({ length: n + 1 }, (_, i) => rpt(R, r, i / n * TAU));
function annulus3(c, r0, r1, fill, n = 160) {
  g.fillStyle = fill; g.beginPath();
  for (let i = 0; i <= n; i++) { const a = i / n * TAU, q = pr(add(c, v3(Math.cos(a) * r1, 0, Math.sin(a) * r1))); i ? g.lineTo(q.x, q.y) : g.moveTo(q.x, q.y); }
  for (let i = n; i >= 0; i--) { const a = i / n * TAU, q = pr(add(c, v3(Math.cos(a) * r0, 0, Math.sin(a) * r0))); g.lineTo(q.x, q.y); }
  g.fill('evenodd');
}
// parallax stars (the kit background + two nearer layers) and depth-of-field rocks near the camera
const STAR2 = Array.from({ length: 90 }, (_, i) => { const R = mulberry(i + 50); return { x: R(), y: R(), r: R(), k: R() < .25 }; });
function stars(t, top, bot) {
  const sx = (CAM ? CAM.az : 0) * 900, sy = (CAM ? CAM.el : 0) * 900;
  g.save(); g.translate(((-sx * .15) % W + W) % W - W, 0); K.bg(t, top, bot, GA); g.translate(W, 0); K.bg(t, top, bot, GA); g.restore();
  for (const [lay, f, sz] of [[0, .45, 1], [1, .9, 1.8]]) for (const [i, s] of STAR2.entries()) { if (i % 2 !== lay) continue;
    const x = ((s.x * W * 1.6 - sx * f) % (W * 1.6) + W * 1.6) % (W * 1.6) - W * .3, y = ((s.y * H * 1.4 + sy * f) % (H * 1.4) + H * 1.4) % (H * 1.4) - H * .2;
    if (s.k) sparkle(x, y, (8 + s.r * 10) * sz, P.spark, .8 * GA); else { g.globalAlpha = (.4 + .4 * s.r) * GA; g.fillStyle = P.star; g.beginPath(); g.arc(x, y, (1.2 + s.r * 2) * sz, 0, TAU); g.fill(); g.globalAlpha = GA; } }
}
const NEAR = (() => { const R = mulberry(31), a = []; for (let i = 0; i < 7; i++) a.push(v3((R() - .5) * 9, (R() - .5) * 5, (R() - .5) * 9)); return a; })();
function nearRocks(t, a = 1) {
  if (a <= 0) return; const fz = pr(CAM.tgt).z;
  for (const [i, o] of NEAR.entries()) { const p = add(mix3(CAM.tgt, CAM.pos, .55), add(o, v3(Math.sin(t * .3 + i) * .4, Math.cos(t * .25 + i) * .3, 0))), q = pr(p); if (q.z < .5) continue; const rr = .07 * q.s; if (rr > 160 || q.x < -300 || q.x > W + 300) continue;
    const blur = Math.min(10, Math.abs(q.z - fz) * 1.4); g.save(); g.filter = `blur(${blur.toFixed(1)}px)`; g.globalAlpha = GA * a * .9; rock2(q.x, q.y, rr, t * .4 + i, '#3a3260'); g.globalAlpha = GA * a * .5; rock2(q.x - rr * .2, q.y - rr * .2, rr * .55, t * .4 + i, '#6a6090'); g.restore(); }
}
const lt = (i, t) => clamp((t - S[i]) / (S[i + 1] - S[i]));     // local 0..1 time of scene i

// ───────── the backyard in parallax layers (sky far, arch, far hills, ground, chair, foreground blades blurred)
function yard(t, i, o) {
  const u = lt(i, t), px = lerp(50, -50, u), py = lerp(-40, 40, eio(u));
  const L = (f, fn) => { g.save(); g.translate(px * f, py * f); fn(); g.restore(); };
  if (o.night) K.bg(t, '#090726', '#271a66', GA); else if (o.polar) { const gr = g.createLinearGradient(0, 0, 0, 1300); gr.addColorStop(0, '#1f4f9e'); gr.addColorStop(1, '#7fb6e8'); g.fillStyle = gr; g.fillRect(0, 0, W, H); } else sky(t, 0);
  L(.15, () => { if (o.sun) K.sunBody(o.sun[0], o.sun[1], o.sun[2], t); if (o.moon) K.moon(880, 760, 55, t, 'happy', { look: -1 }); });
  L(.3, () => o.arch && o.arch());
  L(.55, () => { g.fillStyle = o.snow ? '#d6e4fa' : o.night ? '#1e2a52' : o.sand ? '#9fd4c2' : '#7ccf8a'; g.beginPath(); g.moveTo(-200, 1290); for (let x = -200; x <= W + 200; x += 60) g.lineTo(x, 1250 - 70 * Math.sin(x / 210 + 1) - 40 * Math.sin(x / 90)); g.lineTo(W + 200, 1400); g.lineTo(-200, 1400); g.fill(); if (o.peaks) o.peaks(); });
  L(.85, () => { land(o.night, { lit: o.lit, snow: o.snow, sand: o.sand }); g.fillRect(-200, 1400, 200, 600); g.fillRect(W, 1400, 200, 600); if (o.mid) o.mid(); });
  L(1, () => { sitter(t, { mood: o.mood }); if (o.near) o.near(); });
  L(1.5, () => { g.save(); g.filter = 'blur(5px)'; const col = o.snow ? '#ffffff' : o.night ? '#0f1a38' : o.sand ? '#d9a95a' : '#2d8a52';
    for (const [x, s] of [[-30, 1.3], [90, .9], [1000, 1.2], [1110, .8]]) { g.fillStyle = col; g.beginPath(); g.moveTo(x - 90 * s, 1920); for (let k = 0; k <= 6; k++) g.lineTo(x - 90 * s + k * 30 * s, 1920 - (k % 2 ? 260 : 120) * s); g.lineTo(x + 90 * s, 1920); g.fill(); } g.restore(); });
  if (o.label) place(o.label);
}

// ───────── scenes, one per line
const SC = [];
SC[0] = (t) => {                                                   // hook: a smug ringed Earth; Saturn drifts in, not amused
  const u = lt(0, t), ks = ss(seg(t, T.saturn - .5, T.saturn + .3)); setCam(mix3(v3(0, .15, 0), v3(1.4, -.9, -3), ks * .3), lerp(10.5, 12, ks), lerp(-.6, -.35, u), lerp(.12, .18, u)); stars(t);
  const sp = mix3(v3(18, -7, -14), v3(10.5, -7, -14), eo(ks));
  world([earthB(O, t, 'smug', { ring: ICE3, look: -.4 }), ks > 0 && saturnB(sp, 2.2, t, 'annoyed', { look: -1 })], t);
  if (t > T.saturn + .3) { const q = pr(sp); bubble(clamp(q.x - 40, 200, 880), q.y - 2.2 * q.s - 80, 270, 90, 'copycat.', pop(t, T.saturn + .3), P.navy, 1); }
  nearRocks(t, .8);
  g.save(); g.translate(CX, 330); text('WHAT IF EARTH', 0, -20, 92, P.white, 1000, P.navy, 16); text('HAD RINGS?', 0, 110, 140, P.gold, 1000, P.navy, 18); g.restore();
};
SC[1] = (t) => yard(t, 1, { sun: [900, 300, 70], mood: t > T.arch + .3 ? 'love' : 'happy', arch: () => archSky(1700, 1050, 1300, eio(seg(t, T.arch - .3, T.across + .6)), 1, 0),
  near: () => { const kw = pop(t, T.across + .2); if (kw > 0) bubble(830, 1000, 230, 90, 'whoa', kw, P.navy, -1); } });
SC[2] = (t) => { const lit = ss(seg(t, T.catch - .2, T.brighter + .4)); yard(t, 2, { night: 1, moon: 1, lit, mood: lit > .7 ? 'sleepy' : 'happy', arch: () => archSky(1700, 1050, 1300, 1, 1, 1, .4 + .6 * lit),
  near: () => { if (lit > 0) glow(CX - 60, 1050, 420, '255,240,200', .25 * lit * GA); const kb = pop(t, T.brighter + .3); if (kb > 0) bubble(800, 1010, 330, 100, 'too bright!', kb, P.navy, -1); } }); };
SC[3] = (t) => {                                                   // the ring shadow and a colder winter
  const u = lt(3, t); setCam(v3(0, .1, 0), 8.6, lerp(.95, .75, u), .16); stars(t);
  const sp = pr(v3(-40, 9, 2)); glow(sp.x, sp.y, 520, '255,210,120', .18 * GA); K.sunChar(sp.x, sp.y, 150, t, { mood: 'happy' });
  const sh = ss(seg(t, T.shadows - .2, T.shadows + .6)), cold = ss(seg(t, T.winter - .2, T.colder + .3)), R = Ring(O, .38);
  world([earthB(O, t, cold > .5 ? 'worried' : 'happy', { ring: ICE3, look: -.5, after: q => {
    if (sh <= 0) return; const qu = pr(R.u), ang = Math.atan2(qu.y - q.y, qu.x - q.x), r = q.s;
    g.save(); g.beginPath(); g.arc(q.x, q.y, r, 0, TAU); g.clip(); g.translate(q.x, q.y); g.rotate(ang); g.fillStyle = `rgba(8,6,40,${.7 * sh * GA})`; g.fillRect(-r * 1.2, r * .35, r * 2.4, r * .5); g.restore();
    for (let i = 0; i < 7; i++) { const RR = mulberry(i + 11), fy = (RR() + t * .25) % 1; snowflake(q.x - r * .7 + RR() * r * 1.4, q.y + r * .3 + fy * r * .5, 10 + RR() * 6, cold * .9 * GA); }
  } })], t);
  const pe = pr(O), kl = ss(seg(t, T.shadows, T.shadows + .3)); if (kl > 0) { K.arrow(250, 1380, pe.x - 40, pe.y + 160, P.gold, 10, kl * GA); text('ring shadow', 250, 1430, 50, P.gold, 1000, P.navy, 10, 'center', kl); }
  const kw = pop(t, T.colder); if (kw > 0) { g.save(); g.translate(860, 600); g.scale(kw, kw); card(0, 0, 300, 110, 1); text('COLDER', 0, 20, 60, P.cyan, 1000, null, 0); g.restore(); }
};
SC[4] = (t) => {                                                   // a satellite crosses the ring and gets hit
  const u = lt(4, t), R = Ring(O, .38), aH = 2.2, P0 = rpt(R, 1.95, aH); setCam(mix3(v3(0, .2, 0), P0, .35), 7.4, lerp(-.75, -.55, u), .14); stars(t);
  const hit = T.smash + .15, us = seg(t, VO.r05, hit), after = Math.max(0, t - hit), D = nz(add(R.n, mul(R.u, .3)));
  const sp = after > 0 ? add(P0, add(mul(D, -after * .6), mul(R.w, after * .5))) : add(P0, mul(D, (1 - us) * 2.6));
  world([earthB(O, t, t > T.smash ? 'scared' : 'worried', { ring: ICE3, look: -.6, lookY: -.4 }), { p: sp, draw: q => satellite(q.x, q.y, .0022 * q.s, after > 0 ? -after * 6 : .35, t, after > 0 ? 'scared' : 'happy') }], t);
  const qh = pr(P0); burst(qh.x, qh.y, seg(t, hit, hit + .8), 110);
  const kc = pop(t, hit); if (kc > 0) { g.save(); g.translate(CX + 120, 560); g.scale(kc, kc); g.rotate(-.12); text('CRASH!', 0, 0, 120, P.red, 1000, P.white, 14); g.restore(); }
  nearRocks(t, .7);
};
SC[5] = (t) => {                                                   // not forever: the Moon tugs (the ring wobbles), rocks collide, shooting stars
  const u = lt(5, t), tug = ss(seg(t, T.moon - .3, T.moon + .5)), wob = tug * Math.sin(t * 3.2) * .07; setCam(v3(.9, .4, -.5), 12, lerp(-.5, -.25, u), .22); stars(t);
  const R = Ring(O, .38 + wob), mp = v3(4.2, 2.1, -2.8);
  world([earthB(O, t, t > T.shooting ? 'scared' : 'worried', { ring: ICE3, tilt: .38 + wob, look: .5, lookY: -.4 }), moonB(mp, .5, t, tug > .5 ? 'keen' : 'happy', { look: -.8 })], t);
  if (tug > 0) { const a = pr(mp), b = pr(rpt(R, 2.3, -.6)); g.save(); g.globalAlpha = tug * GA; g.setLineDash([22, 16]); g.strokeStyle = P.gold; g.lineWidth = 8; g.beginPath(); g.moveTo(a.x, a.y); g.quadraticCurveTo((a.x + b.x) / 2 + Math.sin(t * 3.2) * 30, (a.y + b.y) / 2 + 60, b.x, b.y); g.stroke(); g.restore(); }
  if (t > T.crashing - .2) for (let i = 0; i < 5; i++) { const ph = ((t - T.crashing) * 1.2 + i * .23) % 1, RR = mulberry(i + 90), p = rpt(R, 1.6 + RR() * .8, RR() * TAU), q = pr(p); if (q.z > pr(O).z + 1) continue; burst(q.x, q.y, ph, 50); }
  if (t > T.shooting - .2) for (let i = 0; i < 7; i++) { const RR = mulberry(i + 120), ph = ((t - T.shooting) * .9 + RR()) % 1, a = RR() * TAU, p0 = rpt(R, 1.5 + RR() * .8, a), p1 = nz(rpt(R, 1, a)); if (dot3(sub(p0, CAM.pos), CAM.f) > dot3(sub(O, CAM.pos), CAM.f) + .5) continue; streak3(p0, p1, ph); }
  const kn = pop(t, T.last) * (1 - ss(seg(t, T.moon + .5, T.moon + .9))); if (kn > 0) { g.save(); g.translate(CX, 400); g.scale(kn, kn); card(0, 0, 420, 110, 1); text('NOT FOREVER', 0, 20, 56, P.gold, 1000, null, 0); g.restore(); }
};
SC[6] = (t) => {                                                   // the twist: a dark beat, then "it might have had them"
  const u = lt(6, t); setCam(v3(0, 1.1, 0), lerp(12.5, 10.5, eio(u)), lerp(-.2, .15, u), .1); stars(t, '#04030c', '#140c30');
  world([earthB(O, t, t > T.already ? 'scared' : 'worried', { lookY: -.5 })], t);
  const kq = pop(t, VO.r07 + .1), kx = pop(t, T.already);
  if (t < T.already) { g.save(); g.translate(CX, 640); g.scale(kq, kq); text('?', 0, 60, 300, P.gold, 1000, P.navy, 20); g.restore(); }
  if (t > T.strange - .1 && t < T.strange + .5) { g.fillStyle = `rgba(0,0,0,${.5 * GA})`; g.fillRect(0, 0, W, H); }
  if (kx > 0) { g.save(); g.translate(CX, 560); g.scale(kx, kx); text('IT MIGHT HAVE', 0, -40, 80, P.white, 1000, P.navy, 14); text('HAD THEM', 0, 90, 130, P.gold, 1000, P.navy, 18); g.restore(); }
};
SC[7] = (t) => {                                                   // 466 million years ago: a rocky ring sweeps in; the ice caps grow
  const u = lt(7, t), kr = ss(seg(t, T.ring466 - .4, T.ring466 + 1.4)), cool = ss(seg(t, T.cool - .4, T.cool + .8)); setCam(v3(0, .15, 0), 9.8, lerp(-.45, -.05, u), lerp(.3, .2, u)); stars(t, '#120a30', '#2b1650');
  const R = Ring(O, .38), span = Math.max(.05, TAU * kr);
  world([earthB(O, t, cool > .5 ? 'sleepy' : 'happy', { ring: kr > 0 ? ROCK3 : null, from: .4 - span / 2, span, look: .3, after: q => {
    if (cool <= 0) return; g.save(); g.beginPath(); g.arc(q.x, q.y, q.s, 0, TAU); g.clip(); g.fillStyle = `rgba(255,255,255,${.95 * GA})`;
    for (const sgn of [1, -1]) { const pp = pr(mul(R.n, sgn)); g.beginPath(); g.ellipse(pp.x, pp.y, q.s * (.6 + .5 * cool), q.s * (.15 + .4 * cool), 0, 0, TAU); g.fill(); } g.restore();
  } })], t);
  const kd = pop(t, VO.r08 + .05); if (kd > 0) { g.save(); g.translate(CX, 430); g.scale(kd, kd); card(0, 0, 820, 230, 1); text('466 MILLION', 0, -10, 100, P.gold, 1000, null, 0); text('YEARS AGO', 0, 70, 56, P.white, 1000, null, 0); g.restore(); }
  const kn = ss(seg(t, VO.r08 + .8, VO.r08 + 1.2)) * (1 - ss(seg(t, T.ring466 + .1, T.ring466 + .5))); if (kn > 0) text('long before dinosaurs', CX, 620, 44, '#d8d2e6', 900, P.navy, 8, 'center', kn);
  const km = ss(seg(t, T.ring466 + .6, T.ring466 + 1)); if (km > 0) text('a rocky ring?', 790, 1420, 48, '#d8d2e6', 1000, P.navy, 10, 'center', km);
  const kc = ss(seg(t, T.cool - .2, T.cool + .2)); if (kc > 0) text('maybe an ice age', 290, 1420, 48, P.cyan, 1000, P.navy, 10, 'center', kc);
};
SC[8] = (t) => {                                                   // tonight: a plain sky and the ghost of a ring
  const gh = ss(seg(t, T.once - .3, T.once + .6));
  yard(t, 8, { night: 1, moon: 1, mood: gh > .5 ? 'wink' : 'happy',
    arch: () => { if (gh > 0) { g.save(); g.globalAlpha = gh * .8 * GA; g.setLineDash([26, 22]); g.strokeStyle = 'rgba(255,240,200,.8)'; g.lineWidth = 10; g.beginPath(); g.ellipse(CX, 1700, 1050, 1300, 0, Math.PI, TAU); g.stroke(); g.restore(); } } });
};
const CONT = new Set();

// ───────── captions: word-pops, key words in gold (lower middle, above the Shorts UI)
const FIX = { 'earth': 'Earth', 'moon': 'Moon' };
const KEY = new Set(['earth', 'rings', 'saturn', 'giant', 'arch', 'sky', 'night', 'sunlight', 'brighter', 'shadows', 'winter', 'shade', 'colder', 'space', 'rocks', 'smash', 'satellite', 'forever', 'moon', 'crashing', 'shooting', 'stars', 'strange', 'already', 'rocky', 'ring', '466', 'million', 'cool', 'planet', 'tonight', 'look', 'up']);
const CAP = [];
for (const [id, ws] of Object.entries(words)) {
  const toks = []; for (const w of ws) { const b = w[0].toLowerCase().replace(/[.,?]$/, ''), s = FIX[b] ? FIX[b] + (w[0].match(/[.,?]$/)?.[0] || '') : w[0]; if (/^[,.]/.test(s) && toks.length) { const p = toks[toks.length - 1]; p.w += s; p.t1 = w[2]; } else toks.push({ w: s, k: w[0], t0: Math.max(0, w[1]), t1: w[2] }); }
  let line = [], n = 0; const flush = () => { if (line.length) CAP.push({ words: line.map(x => ({ ...x, t0: VO[id] + x.t0, t1: VO[id] + x.t1 })) }); line = []; n = 0; };
  for (const tk of toks) { line.push(tk); n += tk.w.length + 1; if (n > 18 || /[.?!,:]$/.test(tk.w) && n > 9) flush(); }
  flush();
}
for (let i = 0; i < CAP.length; i++) { const c = CAP[i], e = c.words[c.words.length - 1].t1; c.t0 = c.words[0].t0 - .05; c.t1 = i + 1 < CAP.length ? Math.min(CAP[i + 1].words[0].t0 - .02, e + .7) : e + .8; }
function captions(t) {
  const c = CAP.find(c => t >= c.t0 && t < c.t1); if (!c) return;
  g.save(); g.font = '900 74px NU';
  const ws = c.words.map(w => ({ ...w, s: w.w.replace(/[,]$/, ''), wd: g.measureText(w.w.replace(/[,]$/, '') + ' ').width }));
  const rows = [[]]; let rw = 0; for (const w of ws) { if (rw + w.wd > 900 && rows[rows.length - 1].length) { rows.push([]); rw = 0; } rows[rows.length - 1].push(w); rw += w.wd; }
  rows.forEach((row, ri) => { const tot = row.reduce((p, w) => p + w.wd, 0); let x = CX - tot / 2; const y = 1600 + ri * 88;
    for (const w of row) { const k = clamp((t - w.t0) / .1); if (k > 0) { g.save(); g.globalAlpha = k; g.translate(x, y); const s = .85 + .15 * eo(k); g.scale(s, s); g.lineJoin = 'round'; g.lineWidth = 16; g.strokeStyle = P.navy; g.textAlign = 'left'; g.strokeText(w.s, 0, 0); g.fillStyle = KEY.has(nrm(w.k)) ? P.gold : P.white; g.fillText(w.s, 0, 0); g.restore(); } x += w.wd; } });
  g.restore();
}

// ───────── frame: a quick crossfade + push-in between scenes
function render(t) {
  g.setTransform(1, 0, 0, 1, 0, 0); g.globalAlpha = 1;
  const i = sceneAt(t), s0 = S[i], u = clamp((t - s0) / XF);
  const draw = (k, z, a) => { g.save(); GA = a; g.globalAlpha = a; g.translate(CX, 1000); g.scale(z, z); g.translate(-CX, -1000); SC[k](t); g.restore(); GA = 1; g.filter = 'none'; };
  if (i > 0 && u < 1 && !CONT.has(i)) { draw(i - 1, 1 + .08 * eio(u), 1); draw(i, 1.06 - .06 * eo(u), ss(u)); }
  else draw(i, 1 + (t - s0) * .006, 1);
  g.setTransform(1, 0, 0, 1, 0, 0); g.globalAlpha = 1;
  captions(t);
  const fo = seg(t, DUR - .6, DUR); if (fo > 0) { g.fillStyle = `rgba(0,0,0,${fo})`; g.fillRect(0, 0, W, H); }
}

// ───────── events for the score and the mix
const EV = [];
for (const [id, t] of Object.entries(VO)) EV.push({ type: 'vo', id, t });
for (const [k, v] of Object.entries(T)) EV.push({ type: 'cue', name: k, t: +v.toFixed(3) });
S.forEach((s, i) => { if (i > 0 && i < S.length - 1) EV.push({ type: 'scene', i, t: +s.toFixed(3) }); });
EV.sort((a, b) => a.t - b.t);
window.EV = EV; window.DUR = DUR; window.render = render;
window.SUBS = lines.map((l, i) => { const ws = words[l.id], t0 = VO[l.id] - .05, nx = lines[i + 1] ? VO[lines[i + 1].id] - .05 : DUR; return { t0, t1: Math.max(Math.min(VO[l.id] + ws[ws.length - 1][2] + .6, nx), t0 + 1.8), text: l.sub || l.text }; });
render(+(new URLSearchParams(location.search).get('t') ?? 1.5));
window.READY = true;
