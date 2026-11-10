// "What If Earth Had Rings?" v3 — the long version in 2.5D (about 3 min): the flat kit drawn into a small 3D world (perspective camera,
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
  ring1: at('e01', 'ring'), spot: at('e02', 'spot'), newW: at('e02', 'new'), earth3: at('e03', 'earth'), y466: at('e03', '466'),
  where: at('e04', 'where'), go: at('e04', 'go'), rock4: at('e04', 'rock'), hitting: at('e05', 'hitting'), flew: at('e06', 'flew'),
  line7: at('e07', 'line'), roche: at('e07', 'roche'), near8: at('e08', 'near'), rip: at('e08', 'rip'), shatter: at('e09', 'shattered'), spread: at('e09', 'spread'),
  small: at('e10', 'small'), started: at('e10', 'started'), ground11: at('e11', 'ground'), depends: at('e11', 'depends'), thin: at('e12', 'thin'),
  arch13: at('e13', 'arch'), mountain: at('e14', 'mountain'), drops: at('e14', 'drops'), catch: at('e15', 'catch'), brighter: at('e15', 'brighter'),
  shadows: at('e16', 'shadows'), winter: at('e16', 'winter'), colder: at('e16', 'colder'), m20: at('e17', '20'), coldest: at('e17', 'coldest'),
  ice: at('e18', 'ice'), p85: at('e18', '85'), shadow19: at('e19', 'shadow'), idea: at('e19', 'idea'), photo: at('e20', 'photo'),
  mapped: at('e21', 'map'), normally: at('e21', 'normally'), c21: at('e22', '21'), band: at('e22', 'band'), exactly: at('e22', 'exactly'),
  bit: at('e23', 'bit'), rained: at('e23', 'rained'), forever: at('e24', 'forever'), sat24: at('e24', 'saturn'), y2017: at('e25', '2017'), raining: at('e25', 'raining'),
  lose: at('e26', 'lose'), problem: at('e27', 'problem'), smash: at('e27', 'smash'), again: at('e28', 'again'), line28: at('e28', 'line'), moon28: at('e28', 'moon'),
  brk: at('e29', 'break'), worry: at('e29', 'worry'), drift: at('e29', 'drifting'), four: at('e29', 'four'),
  look: at('e30', 'look'), plain: at('e30', 'plain'), pieces: at('e30', 'pieces'), groundE: at('e30', 'ground'),
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
// 0–2: one continuous camera (orbit → crane up over the Sun and the habitable zone → swoop back), as in the 2.5D test
const E0 = v3(12, 0, 0), tgtE0 = add(E0, v3(0, .25, 0));
function camOpen(t) {
  const A = { t: tgtE0, d: 11.5, az: lerp(-.75, -.35, t / 4), el: lerp(.12, .2, t / 4) };
  const B = { t: v3(7.6, 0, 0), d: 31, az: Math.PI / 2 - .12, el: 1.02 };
  const C = { t: tgtE0, d: lerp(10.5, 9.2, ss(seg(t, 9, S[3]))), az: lerp(-.25, .2, seg(t, 8.6, S[3])), el: .2 };
  const k1 = eio(seg(t, 3.4, 6.2)), k2 = eio(seg(t, 8.3, 10.2));
  const m = (a, b, k) => ({ t: mix3(a.t, b.t, k), d: lerp(a.d, b.d, k), az: lerp(a.az, b.az, k), el: lerp(a.el, b.el, k) });
  const c = k2 > 0 ? m(m(A, B, k1), C, k2) : m(A, B, k1); setCam(c.t, c.d, c.az, c.el);
}
function opening(t) {
  camOpen(t); stars(t);
  const zone = ss(seg(t, Math.max(T.spot, 5.4) - .5, Math.max(T.spot, 5.4) + .4)) * (1 - ss(seg(t, 8.4, 9.6)));
  if (zone > 0) annulus3(O, 10.2, 13.8, `rgba(95,207,122,${.26 * zone * GA})`);
  const orb = ss(seg(t, 3.8, 5.2)) * (1 - ss(seg(t, 8.4, 9.6))); if (orb > 0) annulus3(O, 11.96, 12.04, `rgba(255,255,255,${.4 * orb * GA})`, 240);
  const face = ss(seg(t, T.earth3 - .25, T.earth3 + .15));
  world([sunB(O, 1.25, t), earthB(E0, t, 'wink', { ring: ROCK3, noFace: face < .5, rot: t * .35, look: -.2 })], t);
  nearRocks(t, 1 - ss(seg(t, 3.6, 5)) + ss(seg(t, 9.5, 11)));
  const pe = pr(E0), aA = 1 - ss(seg(t, 3.2, 3.9));
  if (aA > 0) {
    const sc = .5 + .5 * Math.sin(t * 3), R = 300; g.save(); g.globalAlpha = aA * GA; g.strokeStyle = `rgba(63,224,255,${.5 + .3 * sc})`; g.lineWidth = 6;
    for (const [sx, sy] of [[-1, -1], [1, -1], [1, 1], [-1, 1]]) { g.beginPath(); g.moveTo(pe.x + sx * R, pe.y + sy * (R - 80)); g.lineTo(pe.x + sx * R, pe.y + sy * R); g.lineTo(pe.x + sx * (R - 80), pe.y + sy * R); g.stroke(); } g.restore();
    text('SCANNING…', pe.x, pe.y + 380, 40, P.cyan, 1000, P.navy, 8, 'center', aA * (.6 + .4 * sc));
    g.save(); g.globalAlpha = aA * GA; g.translate(CX, 330); text('WHAT IS', 0, -20, 92, P.white, 1000, P.navy, 16); text('THIS PLANET?', 0, 110, 120, P.gold, 1000, P.navy, 18); g.restore();
  }
  const aB = ss(seg(t, Math.max(T.spot, 5.6) - .3, Math.max(T.spot, 5.6) + .2)) * (1 - ss(seg(t, 8.2, 8.8)));
  if (aB > 0) { text('habitable zone', CX, pe.y - 440, 56, '#8af0a6', 1000, P.navy, 10, 'center', aB); text('just right for life', CX, pe.y - 380, 42, P.white, 900, P.navy, 8, 'center', aB); }
  const ks = pop(t, T.newW) * (1 - ss(seg(t, 8.2, 8.8)));
  if (ks > 0) { g.save(); g.translate(CX, pe.y - 230); g.rotate(-.12); g.scale(ks, ks); g.strokeStyle = P.red; g.lineWidth = 10; g.beginPath(); g.roundRect(-230, -60, 460, 120, 20); g.stroke(); text('NEW WORLD?', 0, 22, 70, P.red, 1000, null, 0); g.restore(); }
  const ke = pop(t, T.earth3); if (ke > 0) { g.save(); g.translate(CX, 380); g.scale(ke, ke); text("IT'S EARTH", 0, 40, 130, P.gold, 1000, P.navy, 18); g.restore(); }
  const ky = pop(t, T.y466 - .1); if (ky > 0) { g.save(); g.translate(CX, 1400); g.scale(ky, ky); card(0, 0, 760, 170, 1); text('466 MILLION', 0, -5, 84, P.gold, 1000, null, 0); text('YEARS AGO', 0, 58, 46, P.white, 1000, null, 0); g.restore(); }
}
SC[0] = SC[1] = SC[2] = opening;

SC[3] = (t) => {                                                   // where from, where to? a rock that got too close
  const u = lt(3, t); setCam(v3(0, .15, 0), 10.5, lerp(-.6, -.3, u), .18); stars(t);
  const ka = ss(seg(t, T.rock4 - .4, T.rock4 + .9));
  world([earthB(O, t, 'worried', { ring: ROCK3, look: .6 }), ka > 0 && rockB(mix3(v3(10, 3, -16), v3(4.2, 1.6, -3), eo(ka)), .5, t, 'smug', { look: -1 })], t);
  const pe = pr(O), k1 = pop(t, T.where), k2 = pop(t, T.go);
  if (k1 > 0) bubble(pe.x - 220, pe.y - 470, 330, 100, 'where from?', k1, P.navy, 1);
  if (k2 > 0) bubble(pe.x + 230, pe.y - 360, 380, 100, 'where to?', k2, P.navy, 1);
  nearRocks(t);
};
const METS = Array.from({ length: 12 }, (_, i) => { const R = mulberry(i + 200), d = nz(v3(R() - .3, (R() - .5) * 1.2, R() * .8 + .2)); return { d, ph: R(), sp: .55 + R() * .3 }; });
SC[4] = (t) => {                                                   // heavy bombardment
  const u = lt(4, t); setCam(v3(0, .2, 0), lerp(10, 8.6, u), lerp(.15, .45, u), .15); stars(t);
  const hit = t > T.hitting;
  world([earthB(O, t, hit ? 'scared' : 'worried', { look: -.3, lookY: -.4, after: () => {
    if (t < VO.e05 + .2) return;
    for (const m of METS) { const ph = ((t - VO.e05) * m.sp + m.ph) % 1, p1 = m.d, p0 = mul(m.d, 9); streak3(p0, p1, ph * 1.05);
      if (ph > .93 && dot3(m.d, mul(CAM.f, -1)) > .1) { const q = pr(p1); burst(q.x, q.y, (ph - .93) / .07, 40); } }
  } })], t);
  const kc = pop(t, T.hitting + .3); if (kc > 0) { g.save(); g.translate(CX, 420); g.scale(kc, kc); card(0, 0, 640, 120, 1); text('IMPACTS: WAY UP', 0, 20, 62, P.gold, 1000, null, 0); g.restore(); }
};
const flyP = u => v3(lerp(10, -10, u), lerp(3, -1.2, u), 2.4 + 3 * (u - .5) ** 2);
SC[5] = (t) => {                                                   // one asteroid flies past, very close
  const u = seg(t, VO.e06 - .2, VO.e06 + dur.e06 + .4), ap = flyP(u);
  setCam(mix3(v3(0, .3, 0), ap, .3), 12, lerp(-.15, .1, lt(5, t)), .1); stars(t);
  dashed3(Array.from({ length: 41 }, (_, k) => flyP(k / 40)), 'rgba(255,255,255,.35)', 5);
  world([earthB(O, t, 'scared', { look: .8 }), rockB(ap, .5, t, 'wink', { rot: t * .8, look: -1 })], t);
  const kc = pop(t, T.flew + .3); if (kc > 0) { const q = pr(ap); bubble(clamp(q.x, 200, 880), q.y - 150, 260, 90, 'missed!', kc, P.navy, -1); }
  nearRocks(t);
};
SC[6] = (t) => {                                                   // the Roche limit
  const u = lt(6, t); setCam(v3(.8, .2, 0), 11, lerp(-.45, -.2, u), .32); stars(t);
  const kr = ss(seg(t, T.line7 - .3, T.roche + .3)), R = Ring(O, 0);
  dashed3(circle3(R, 2.7), P.gold, 7, kr);
  const top = pr(rpt(R, 2.7, -Math.PI / 2 + .0)); if (kr > 0) text('ROCHE LIMIT', CX, pr(O).y - 2.7 * pr(O).s - 40, 54, P.gold, 1000, P.navy, 10, 'center', kr);
  const ua = seg(t, VO.e07, VO.e07 + dur.e07 + .3);
  world([earthB(O, t, 'keen', { look: .8 }), rockB(mix3(v3(9, 1.6, -6), v3(3.4, .5, -1.6), eo(ua)), .45, t, 'worried', { look: -1 })], t);
};
SC[7] = (t) => {                                                   // near side pulled harder → rip apart
  const A = v3(3, 0, 0); setCam(add(A, v3(-.9, 0, 0)), 5.4, lerp(.35, .5, lt(7, t)), .08); stars(t);
  const st = ss(seg(t, VO.e08, T.rip)), rp = seg(t, T.rip, T.rip + 1.1);
  const qa = pr(A), qe = pr(O), ang = Math.atan2(qe.y - qa.y, qe.x - qa.x);
  world([earthB(O, t, 'keen', { look: 1 }), rp < 1 && { p: A, draw: q => asteroid(q.x, q.y, .42 * q.s, t, rp > 0 ? 'scared' : 'worried', { rot: ang, sx: 1 + .5 * st, sy: 1 - .2 * st, crack: rp > 0 ? 1 : st > .7 ? st : 0, look: -1 }) }], t);
  const ka = ss(seg(t, T.near8 - .3, T.near8 + .2)) * (1 - ss(rp * 3)), dx = Math.cos(ang), dy = Math.sin(ang);
  if (ka > 0) { K.arrow(qa.x + dx * 170, qa.y + dy * 170 - 120, qa.x + dx * 420, qa.y + dy * 420 - 120, P.gold, 22, ka * GA); text('pulled harder', qa.x + dx * 300, qa.y - 190, 44, P.gold, 1000, P.navy, 10, 'center', ka);
    K.arrow(qa.x - dx * 280, qa.y - dy * 280 + 190, qa.x - dx * 180, qa.y - dy * 180 + 190, '#9ad7ff', 12, ka * GA); text('weaker', qa.x - dx * 230, qa.y + 260, 40, '#9ad7ff', 1000, P.navy, 8, 'center', ka); }
  if (rp > 0) { burst(qa.x, qa.y, rp, 220); const L = []; for (let i = 0; i < 16; i++) { const R = mulberry(i + 300), d = nz(v3(R() - .5, (R() - .5) * .5, R() - .5)), p = add(A, mul(d, rp * (.6 + R() * 1.2))); L.push({ p, draw: q => rock2(q.x, q.y, (.05 + R() * .06) * q.s, t * 2 + i, '#9b8f84') }); } world(L, t); }
};
SC[8] = (t) => {                                                   // the pieces spread into a ring
  const u = lt(8, t), sp = ss(seg(t, VO.e09 + .3, T.spread + 2.4)); setCam(v3(0, .2, 0), 10.5, lerp(-.75, -.2, u), lerp(.32, .22, u)); stars(t);
  const a0 = .4, span = Math.max(.05, TAU * sp);
  world([earthB(O, t, 'happy', { ring: ROCK3, from: a0 - span / 2, span, look: .3 })], t);
  nearRocks(t, .8);
};
SC[9] = (t) => {                                                   // a small Saturn; Saturn's rings may have started the same way
  const u = lt(9, t), ks = ss(seg(t, T.small - .5, T.small + 1)); setCam(mix3(v3(0, .2, 0), v3(4.2, -2.2, -7), eio(ks) * .45), lerp(10, 15, ks), lerp(-.35, -.15, u), .16); stars(t);
  world([earthB(O, t, 'smug', { ring: ROCK3, look: 1 }), saturnB(v3(10.5, -5, -16), 2.8, t, t > T.started ? 'happy' : 'annoyed', { look: -1 })], t);
  const kb = pop(t, T.started + .2); if (kb > 0) { const q = pr(v3(10.5, -5, -16)); bubble(clamp(q.x, 230, 850), q.y - 2.8 * q.s - 90, 300, 100, 'same way?', kb, P.navy, -1); }
};
SC[10] = (t) => {                                                  // it depends where you stand: pins on the globe
  const u = lt(10, t); setCam(v3(0, .1, 0), 7.6, lerp(-.5, -.25, u), .14); stars(t);
  world([earthB(O, t, 'happy', { ring: ROCK3, tilt: .38 })], t);
  const R = Ring(O, .38), toC = nz(mul(CAM.f, -1)), fd = nz(sub(toC, mul(R.n, dot3(toC, R.n)))), side = nz(crs(R.n, fd));
  for (const [k, lat, lab, col] of [[0, 0, 'equator', P.gold], [1, .7, 'further north', P.cyan], [2, 1.25, 'near the poles', P.white]]) {
    const kp = pop(t, T.depends - .2 + k * .35); if (kp <= 0) continue; const dir = nz(add(mul(add(mul(fd, .8), mul(side, -.6)), Math.cos(lat)), mul(R.n, Math.sin(lat)))), q = pr(dir);
    dot(q.x, q.y, 16 * kp, col, GA); g.save(); g.globalAlpha = kp * GA; g.strokeStyle = col; g.lineWidth = 5; g.beginPath(); g.moveTo(q.x, q.y); g.lineTo(150, q.y - 60 - k * 40); g.stroke(); g.restore(); text(lab, 170, q.y - 75 - k * 40, 42, col, 1000, P.navy, 8, 'left', kp);
  }
};
SC[11] = (t) => yard(t, 11, { sand: 1, sun: [880, 330, 60], mood: 'annoyed', label: 'THE EQUATOR', arch: () => archSky(1700, 1100, 1450, eio(seg(t, T.thin - .6, T.thin + .8)), .12, 0),
  mid: () => { palm(160, 1330, .9); palm(940, 1300, .75); }, near: () => { const kb = pop(t, T.thin + .8); if (kb > 0) bubble(830, 1000, 230, 90, 'that’s it?', kb, P.navy, -1); } });
SC[12] = (t) => yard(t, 12, { sun: [900, 300, 70], mood: t > T.arch13 + .3 ? 'love' : 'happy', label: 'FURTHER NORTH', arch: () => archSky(1700, 1050, 1300, eio(seg(t, T.arch13 - .4, T.arch13 + 1.2)), 1, 0),
  near: () => { const kb = pop(t, T.arch13 + 1); if (kb > 0) bubble(830, 1000, 230, 90, 'whoa', kb, P.navy, -1); } });
SC[13] = (t) => { const dn = ss(seg(t, T.drops - .2, T.drops + 1.2)); yard(t, 13, { polar: 1, snow: 1, mood: dn > .5 ? 'sad' : 'happy', label: 'NEAR THE POLES', arch: () => archSky(1520 + dn * 420, 900, 420, 1, 1.2, 0, 1),
  peaks: () => { g.fillStyle = '#ffffff'; for (const [x, w, h] of [[150, 260, 160], [900, 320, 200]]) { g.beginPath(); g.moveTo(x - w, 1300); g.lineTo(x, 1300 - h); g.lineTo(x + w, 1300); g.fill(); } },
  near: () => { for (let i = 0; i < 16; i++) { const R = mulberry(i + 500), y = (R() * H + t * 90) % 1300; snowflake(R() * W, y, 8 + R() * 6, .7); } const kb = pop(t, T.drops + 1); if (kb > 0) bubble(830, 1000, 230, 90, 'gone', kb, P.navy, -1); } }); };
SC[14] = (t) => { const lit = ss(seg(t, T.catch - .2, T.brighter + .4)); yard(t, 14, { night: 1, moon: 1, lit, mood: lit > .7 ? 'sleepy' : 'happy', arch: () => archSky(1700, 1050, 1300, 1, 1, 1, .4 + .6 * lit),
  near: () => { if (lit > 0) glow(CX - 60, 1050, 420, '255,240,200', .25 * lit * GA); const kb = pop(t, T.brighter + .3); if (kb > 0) bubble(800, 1010, 330, 100, 'too bright!', kb, P.navy, -1); } }); };
SC[15] = (t) => {                                                  // the ring shadow, a colder winter
  const u = lt(15, t); setCam(v3(0, .1, 0), 8.6, lerp(.95, .75, u), .16); stars(t);
  const sp = pr(v3(-40, 9, 2)); glow(sp.x, sp.y, 520, '255,210,120', .18 * GA); K.sunChar(sp.x, sp.y, 150, t, { mood: 'happy' });
  const sh = ss(seg(t, T.shadows - .2, T.shadows + .6)), cold = ss(seg(t, T.winter - .2, T.colder + .3)), R = Ring(O, .38);
  world([earthB(O, t, cold > .5 ? 'worried' : 'happy', { ring: ROCK3, look: -.5, after: q => {
    if (sh <= 0) return; const qu = pr(R.u), ang = Math.atan2(qu.y - q.y, qu.x - q.x), r = q.s;
    g.save(); g.beginPath(); g.arc(q.x, q.y, r, 0, TAU); g.clip(); g.translate(q.x, q.y); g.rotate(ang); g.fillStyle = `rgba(8,6,40,${.7 * sh * GA})`; g.fillRect(-r * 1.2, r * .35, r * 2.4, r * .5); g.restore();
    for (let i = 0; i < 7; i++) { const RR = mulberry(i + 11), fy = (RR() + t * .25) % 1; snowflake(q.x - r * .7 + RR() * r * 1.4, q.y + r * .3 + fy * r * .5, 10 + RR() * 6, cold * .9 * GA); }
  } })], t);
  const pe = pr(O), kl = ss(seg(t, T.shadows, T.shadows + .3)); if (kl > 0) { K.arrow(250, 1380, pe.x - 40, pe.y + 160, P.gold, 10, kl * GA); text('ring shadow', 250, 1430, 50, P.gold, 1000, P.navy, 10, 'center', kl); }
  const kw = pop(t, T.colder); if (kw > 0) { g.save(); g.translate(860, 600); g.scale(kw, kw); card(0, 0, 300, 110, 1); text('COLDER', 0, 20, 60, P.cyan, 1000, null, 0); g.restore(); }
};
SC[16] = (t) => {                                                  // +20 million years: the big freeze
  const u = lt(16, t); setCam(v3(-.7, .1, 0), 9, lerp(-.2, .15, u), .2); stars(t, '#0b1840', '#1d2f66');
  const cool = ss(seg(t, T.coldest - .4, T.coldest + 1.4)), R = Ring(O, .38);
  world([earthB(O, t, cool > .5 ? 'sleepy' : 'worried', { ring: ROCK3, ra: .75, after: q => {
    g.save(); g.beginPath(); g.arc(q.x, q.y, q.s, 0, TAU); g.clip(); g.fillStyle = `rgba(255,255,255,${.95 * GA})`;
    for (const sgn of [1, -1]) { const pp = pr(mul(R.n, sgn)); g.beginPath(); g.ellipse(pp.x, pp.y, q.s * (.6 + .5 * cool), q.s * (.2 + .45 * cool), 0, 0, TAU); g.fill(); } g.restore();
  } })], t);
  thermo(170, 1050, cool, ss(seg(t, T.coldest - .5, T.coldest)) * GA);
  const kc = pop(t, T.m20 - .1); if (kc > 0) { g.save(); g.translate(CX, 400); g.scale(kc, kc); card(0, 0, 780, 130, 1); text('+20 MILLION YEARS', 0, 22, 66, P.gold, 1000, null, 0); g.restore(); }
};
const SEA = (() => { const R = mulberry(61), a = []; for (let i = 0; i < 20; i++) { const lay = i < 8 ? 0 : i < 16 ? 1 : 2; a.push({ lay, x: 80 + R() * 920, y: 520 + R() * 820, kind: i % 2, keep: i === 3 || i === 11 || i === 18, o: R() }); } return a; })();
SC[17] = (t) => {                                                  // ice sheets; ~85% of sea species gone (three depth layers)
  const u = lt(17, t), px = lerp(60, -60, u);
  const gr = g.createLinearGradient(0, 0, 0, H); gr.addColorStop(0, '#1d6fb8'); gr.addColorStop(1, '#0b2a5a'); g.fillStyle = gr; g.fillRect(0, 0, W, H);
  const ki = ss(seg(t, T.ice - .2, T.ice + 1.2)); g.save(); g.translate(px * .4, 0); g.fillStyle = '#eef5ff'; g.beginPath(); g.moveTo(-100, 0); g.lineTo(W + 100, 0); for (let x = W + 100; x >= -100; x -= 60) g.lineTo(x, 120 + 220 * ki + Math.sin(x * .05) * 20); g.fill(); g.restore();
  for (let i = 0; i < 30; i++) { const R = mulberry(i + 650), y = H - ((R() * H + t * (40 + R() * 60)) % H); dot(R() * W + px * .7, y, 3 + R() * 5, 'rgba(255,255,255,.25)', GA); }
  const gone = seg(t, T.p85 - .2, T.p85 + 1.6); let n = 0;
  for (const lay of [0, 1, 2]) for (const [i, c] of SEA.entries()) { if (c.lay !== lay) continue; const f = [.3, .7, 1.3][lay], s = [.55, .95, 1.6][lay]; const grey = !c.keep && gone * 17 > (n++ % 17);
    g.save(); if (lay === 2) g.filter = 'blur(4px)'; g.globalAlpha = GA * [.6, 1, .95][lay]; creature(c.x + px * f, c.y, s, c.kind, grey, t + c.o); g.restore(); }
  const kp = pop(t, T.p85); if (kp > 0) { g.save(); g.translate(CX, 1420); g.scale(kp, kp); card(0, 0, 600, 140, 1); text('~85% GONE', 0, 25, 84, P.red, 1000, null, 0); g.restore(); }
};
SC[18] = (t) => {                                                  // a new idea; not everyone agrees (Earth far, scientists near)
  const u = lt(18, t), px = lerp(40, -40, u); setCam(v3(0, -2.2, 0), 14, lerp(-.3, .1, u), .1); stars(t);
  world([earthB(O, t, 'sleepy', { ring: ROCK3, ra: .8 })], t);
  g.save(); g.translate(px, 0); head(300, 1100, 110, t, 'keen', P.hair, { glasses: 1 }); head(790, 1100, 110, t, t > T.idea + .3 ? 'annoyed' : 'happy', '#c47a3a', { seed: 7.1 });
  const k1 = pop(t, T.shadow19), k2 = pop(t, T.idea + .3); if (k1 > 0) bubble(330, 900, 360, 100, 'the shadow!', k1, P.navy, -1); if (k2 > 0) bubble(760, 900, 300, 100, 'hmm…', k2, P.navy, 1); g.restore();
  const kc = pop(t, T.idea); if (kc > 0) { g.save(); g.translate(CX, 1420); g.scale(kc, kc); card(0, 0, 520, 110, 1); text('STILL DEBATED', 0, 20, 58, P.gold, 1000, null, 0); g.restore(); }
};
SC[19] = (t) => {                                                  // nobody took a photo
  const u = lt(19, t); setCam(v3(0, .9, 0), 10, lerp(-.4, -.1, u), .2); stars(t);
  world([earthB(O, t, 'wink', { ring: ROCK3 })], t);
  const fy = Math.sin(t * 1.4) * 10; camera(CX + lerp(30, -30, u), 520 + fy, 1.2, GA); cross(CX + lerp(30, -30, u), 525 + fy, 110, ss(seg(t, T.photo - .2, T.photo + .2)) * GA);
};
SC[20] = (t) => {                                                  // normally, craters land everywhere (the Moon, slowly turning)
  const u = lt(20, t); setCam(O, lerp(7.2, 6.2, u), lerp(-.2, .2, u), .1); stars(t);
  const q = pr(O), r = q.s; K.moon(q.x, q.y, r, t, 'happy', { look: 0 });
  const kr = seg(t, T.normally - .3, T.normally + 1.6), spin = (t - S[20]) * .12;
  for (let i = 0; i < 26; i++) { const R = mulberry(i + 700), lon = R() * TAU + spin, la = (R() - .5) * 2.6, x = Math.sin(lon) * Math.cos(la), y = Math.sin(la), z = Math.cos(lon) * Math.cos(la), k = clamp((kr * 26 - i) / 1.5);
    if (k <= 0 || z < .05) continue; const cr = (10 + R() * 14) * k * r / 300; g.save(); g.translate(q.x + x * r * .92, q.y - y * r * .92); g.scale(Math.max(.2, z), 1); dot(0, 0, cr, '#7b7f9c', GA); dot(-2, -2, cr * .6, '#a3a9c9', GA); g.restore(); }
  const kl = pop(t, T.normally + .6); if (kl > 0) { g.save(); g.translate(CX, 430); g.scale(kl, kl); card(0, 0, 560, 110, 1); text('RANDOM. EVERYWHERE.', 0, 20, 52, P.white, 1000, null, 0); g.restore(); }
  const km = pop(t, T.mapped); if (km > 0 && t < T.normally) { g.save(); g.translate(CX, 430); g.scale(km, km); card(0, 0, 560, 110, 1); text('CRATER MAP', 0, 20, 58, P.gold, 1000, null, 0); g.restore(); }
};
SC[21] = (t) => {                                                  // the crater map, tilted like a table in perspective
  const u = lt(21, t); setCam(v3(0, 0, .2), 10.5, lerp(-.18, .18, u), lerp(.75, .6, u)); stars(t);
  const MW = 4.2, MH = 2.6, M = (x, y) => v3(x * MW / 2, 0, -y * MH / 2);
  const poly = (pts, fill) => { g.fillStyle = fill; g.beginPath(); pts.forEach((p, i) => { const q = pr(p); i ? g.lineTo(q.x, q.y) : g.moveTo(q.x, q.y); }); g.closePath(); g.fill(); };
  g.globalAlpha = GA; poly([M(-1, -1), M(1, -1), M(1, 1), M(-1, 1)], '#3d8be8');
  for (const [x, y, s, sd] of [[-.3, -.1, .9, 1], [.2, .15, 1.1, 2], [.35, -.3, .5, 3]]) { const R = mulberry(sd), pts = []; for (let i = 0; i < 12; i++) { const a = i / 12 * TAU, rr = .23 * s * (.7 + .3 * R()); pts.push(M(clamp(x + Math.cos(a) * rr * .8, -1, 1), clamp(y + Math.sin(a) * rr * 1.4, -1, 1))); } poly(pts, P.land); }
  const kb = ss(seg(t, T.band - .3, T.band + .4)); if (kb > 0) poly([M(-1, -.42), M(1, -.42), M(1, .42), M(-1, .42)], `rgba(255,199,58,${.32 * kb * GA})`);
  dashed3([M(-1, 0), M(1, 0)], 'rgba(255,255,255,.85)', 5); const qe = pr(M(.72, .06)); text('old equator', qe.x, qe.y, 34, P.white, 1000, P.navy, 6, 'center', 1);
  const t0 = VO.e22 + .1, t1 = T.c21 + 1.7;
  for (let i = 0; i < 21; i++) { const R = mulberry(i + 800), p = M(-.92 + R() * 1.84, (R() - .5) * .72), k = pop(t, t0 + i / 21 * (t1 - t0)); if (k <= 0) continue; const q = pr(p), rr = .09 * q.s * k, fl = Math.abs(dot3(nz(sub(CAM.pos, p)), v3(0, 1, 0)));
    g.save(); g.globalAlpha = GA; g.fillStyle = '#ff6a3a'; g.beginPath(); g.ellipse(q.x, q.y, rr, rr * fl, 0, 0, TAU); g.fill(); g.fillStyle = '#c94a24'; g.beginPath(); g.ellipse(q.x, q.y + rr * fl * .15, rr * .55, rr * .55 * fl, 0, 0, TAU); g.fill(); g.restore(); }
  const kn = pop(t, T.c21); if (kn > 0) { g.save(); g.translate(CX, 470); g.scale(kn, kn); card(0, 0, 520, 120, 1); text('21 CRATERS', 0, 22, 70, '#ff8a5a', 1000, null, 0); g.restore(); }
  const ke = ss(seg(t, T.exactly - .2, T.exactly + .3)); if (ke > 0) { g.save(); g.globalAlpha = GA; ringedEarth(CX, 1390, 90, t, 'smug', { bands: ROCK, seed: 9, ws: .4, ra: ke }); g.restore(); }
};
SC[22] = (t) => {                                                  // bit by bit, the ring rains down
  const u = lt(22, t), rn = ss(seg(t, T.bit - .2, T.rained + 2)); setCam(v3(0, .15, 0), 9.6, lerp(.3, -.05, u), .2); stars(t);
  const R = Ring(O, .38);
  world([earthB(O, t, 'scared', { ring: ROCK3, ra: 1 - rn * .85, look: 0, lookY: -.4 })], t);
  if (t > T.bit) for (let i = 0; i < 12; i++) { const RR = mulberry(i + 900), ph = ((t - T.bit) * .9 + RR()) % 1, a = RR() * TAU, p0 = rpt(R, 1.5 + RR() * .9, a), p1 = nz(add(rpt(R, 1, a), mul(R.n, (RR() - .5) * .5))); if (dot3(sub(p0, CAM.pos), CAM.f) > dot3(sub(O, CAM.pos), CAM.f) + .5) continue; streak3(p0, p1, ph); }
};
SC[23] = (t) => {                                                  // rings don't last; even Saturn's
  const u = lt(23, t); setCam(v3(0, .4, 0), 21, lerp(-.45, -.1, u), .2); stars(t);
  world([saturnB(O, 2.3, t, t > T.sat24 + .4 ? 'worried' : 'happy')], t);
  const kn = pop(t, T.forever - .2); if (kn > 0) { g.save(); g.translate(CX, 430); g.scale(kn, kn); card(0, 0, 520, 120, 1); text('NOT FOREVER', 0, 22, 66, P.gold, 1000, null, 0); g.restore(); }
};
SC[24] = (t) => {                                                  // Cassini, 2017: it dives between Saturn and the rings; ring rain
  const u = lt(24, t); setCam(v3(0, .3, 0), lerp(19, 16, u), lerp(-.1, .25, u), .16); stars(t);
  const R = Ring(O, .45), rn = ss(seg(t, T.raining - .5, T.raining + .3)), uc = seg(t, VO.e25, VO.e25 + dur.e25);
  const cp = add(rpt(R, 2.3 * 1.22, lerp(.9, -.4, uc)), mul(R.n, .1));
  const rain = { p: O, draw: () => {} };
  world([saturnB(O, 2.3, t, 'worried'), { p: cp, draw: q => cassini(q.x, q.y, .0023 * q.s, -.4) }], t);
  for (let i = 0; i < 30; i++) { const RR = mulberry(i + 1000), ph = ((t - VO.e25) * .5 + RR()) % 1, a = RR() * TAU, p0 = rpt(R, 2.3 * 1.47, a), up = RR() < .5 ? 1 : -1, p1 = add(mul(nz(rpt(R, 1, a)), 2.3 * .75), mul(R.n, up * 2.3 * .62));
    const p = add(mix3(p0, p1, ph), mul(R.n, up * Math.sin(ph * Math.PI) * .6)); const q = pr(p); if (dot3(sub(p, CAM.pos), CAM.f) > dot3(sub(O, CAM.pos), CAM.f) + 1) continue; dot(q.x, q.y, 5, '#fff2d0', rn * Math.sin(ph * Math.PI) * GA); }
  const kc = pop(t, T.y2017); if (kc > 0) { const q = pr(cp); text('CASSINI · 2017', clamp(q.x, 220, 860), q.y - 90, 46, P.gold, 1000, P.navy, 10, 'center', kc); }
  const kr = pop(t, T.raining + .2); if (kr > 0) { g.save(); g.translate(CX, 1420); g.scale(kr, kr); card(0, 0, 480, 110, 1); text('RING RAIN', 0, 20, 64, '#fff2d0', 1000, null, 0); g.restore(); }
};
SC[25] = (t) => {                                                  // a few hundred million years: a bare Saturn
  const u = lt(25, t), fd = ss(seg(t, T.lose - .3, T.lose + 1.6)); setCam(v3(0, .4, 0), lerp(19, 23, u), lerp(.2, .4, u), .22); stars(t);
  world([saturnB(O, 2.3, t, fd > .5 ? 'sad' : 'worried', { ra: 1 - fd * .92 })], t);
  const kc = pop(t, VO.e26 + .1); if (kc > 0) { g.save(); g.translate(CX, 430); g.scale(kc, kc); card(0, 0, 820, 120, 1); text('A FEW 100 MILLION YEARS', 0, 20, 52, P.gold, 1000, null, 0); g.restore(); }
};
SC[26] = (t) => {                                                  // today: a satellite crosses the ring and gets hit
  const u = lt(26, t), R = Ring(O, .38), aH = 2.2, P0 = rpt(R, 1.95, aH); setCam(mix3(v3(0, .2, 0), P0, .35), 7.4, lerp(-.75, -.55, u), .14); stars(t);
  const hit = T.smash + .15, us = seg(t, VO.e27, hit), after = Math.max(0, t - hit), D = nz(add(R.n, mul(R.u, .3)));
  const sp = after > 0 ? add(P0, add(mul(D, -after * .6), mul(R.w, after * .5))) : add(P0, mul(D, (1 - us) * 2.6));
  world([earthB(O, t, t > T.smash ? 'scared' : 'worried', { ring: ICE3, look: -.6, lookY: -.4 }), { p: sp, draw: q => satellite(q.x, q.y, .0022 * q.s, after > 0 ? -after * 6 : .35, t, after > 0 ? 'scared' : 'happy') }], t);
  const qh = pr(P0); burst(qh.x, qh.y, seg(t, hit, hit + .8), 110);
  const kc = pop(t, hit); if (kc > 0) { g.save(); g.translate(CX + 120, 560); g.scale(kc, kc); g.rotate(-.12); text('CRASH!', 0, 0, 120, P.red, 1000, P.white, 14); g.restore(); }
  const kt = pop(t, VO.e27 + .1) * (1 - ss(seg(t, T.smash - .4, T.smash))); if (kt > 0) { g.save(); g.translate(CX, 400); g.scale(kt, kt); card(0, 0, 400, 110, 1); text('TODAY', 0, 20, 64, P.gold, 1000, null, 0); g.restore(); }
  nearRocks(t, .7);
};
const MOON0 = v3(7, 1.6, -4.5);
SC[27] = (t) => {                                                  // rings again? only if something crossed that line — like the Moon
  const u = lt(27, t); setCam(v3(1.6, .3, -.9), 16, lerp(-.3, -.12, u), .3); stars(t);
  dashed3(circle3(Ring(O, 0), 2.7), P.gold, 7, ss(seg(t, T.line28 - .3, T.line28 + .3)));
  const kl = ss(seg(t, T.line28 - .3, T.line28 + .3)); if (kl > 0) { const q = pr(O); text('ROCHE LIMIT', clamp(q.x, 260, 820), q.y - 2.7 * q.s * .5 - 60, 48, P.gold, 1000, P.navy, 10, 'center', kl); }
  const km = ss(seg(t, T.moon28 - .3, T.moon28 + .3));
  world([earthB(O, t, 'happy', { look: 1 }), km > 0 && moonB(MOON0, .55, t, 'worried', { look: -1 })], t);
};
SC[28] = (t) => {                                                  // the Moon would break into a ring… but it's drifting away
  const wr = T.worry - .2;
  if (t < wr) {
    const ap = ss(seg(t, VO.e29, T.brk)), br = seg(t, T.brk, wr), mp = mix3(MOON0, v3(2.7, .5, -1.4), ap); setCam(v3(.8, .3, -.4), 11, lerp(-.3, -.1, seg(t, VO.e29, wr)), .3); stars(t);
    dashed3(circle3(Ring(O, 0), 2.7), P.gold, 6, .7);
    const span = Math.max(.05, TAU * ss(br)), am = Math.atan2(-1.4, 2.7);
    world([earthB(O, t, 'scared', { ring: br > 0 ? ROCK3 : null, tilt: 0, from: am - span / 2, span, look: 1 }), br < .25 && moonB(mp, .55, t, 'scared', { look: -1 })], t);
    if (br > 0 && br < 1) { const q = pr(mp); burst(q.x, q.y, br, 170); }
    text('WHAT IF…', CX, 380, 70, P.cyan, 1000, P.navy, 12, 'center', 1 - ss(seg(t, T.brk + .6, T.brk + 1)));
  } else {
    const dr = ss(seg(t, T.drift - .3, T.drift + 2.5)); setCam(v3(4.2, .3, 0), 24, lerp(-.05, .08, seg(t, wr, S[29])), .18); stars(t);
    const mp = mix3(v3(5.2, 1, 0), v3(7.6, 1.4, 0), dr);
    world([earthB(O, t, 'happy', { look: 1 }), moonB(mp, .7, t, 'wink', { look: -1 })], t);
    const kn = pop(t, wr); if (kn > 0) { g.save(); g.translate(CX, 380); g.scale(kn, kn); card(0, 0, 560, 120, 1); text('NOT HAPPENING', 0, 22, 64, P.gold, 1000, null, 0); g.restore(); }
    const kf = ss(seg(t, T.four - .2, T.four + .3)); if (kf > 0) { const q = pr(mp); K.arrow(q.x + 80, q.y, q.x + 220, q.y, P.gold, 14, kf * GA); text('≈ 4 cm / year', clamp(q.x + 60, 260, 820), q.y + 130, 52, P.gold, 1000, P.navy, 10, 'center', kf); }
    const fl = 1 - seg(t, wr, wr + .25); if (fl > 0) { g.fillStyle = `rgba(255,255,255,${.6 * fl * GA})`; g.fillRect(0, 0, W, H); }
  }
};
SC[29] = (t) => {                                                  // tonight: a plain sky, the ghost of the ring, a piece of it in the ground
  const gh = ss(seg(t, T.plain - .2, T.plain + .8)), kg = ss(seg(t, T.groundE - .4, T.groundE + .3));
  yard(t, 29, { night: 1, moon: 1, mood: gh > .5 ? 'wink' : 'happy',
    arch: () => { if (gh > 0) { g.save(); g.globalAlpha = gh * .8 * GA; g.setLineDash([26, 22]); g.strokeStyle = 'rgba(255,240,200,.8)'; g.lineWidth = 10; g.beginPath(); g.ellipse(CX, 1700, 1050, 1300, 0, Math.PI, TAU); g.stroke(); g.restore(); } },
    mid: () => { if (kg > 0) { glow(250, 1480, 120, '255,200,120', .7 * kg * GA); rock(250, 1480, 34, .4, '#b39a7a'); text('466 million years old?', 250, 1400, 34, P.gold, 1000, P.navy, 8, 'center', kg); } } });
};
const CONT = new Set([1, 2]);                                      // scenes that continue the previous camera (no crossfade)

// ───────── captions: word-pops, key words in gold (lower middle, above the Shorts UI)
const FIX = { 'earth': 'Earth', 'moon': 'Moon', 'map': 'mapped', 'centimeters': 'centimetres', 'limit': 'limit' };
const KEY = new Set(['planet', 'oceans', 'ring', 'rings', 'saturn', 'life', 'earth', '466', 'million', 'rock', 'close', 'asteroid', 'roche', 'limit', 'rip', 'shattered', 'equator', 'ground', 'thin', 'line', 'north', 'arch', 'poles', 'mountain', 'light', 'horizon', 'night', 'sunlight', 'brighter', 'shadows', 'winter', 'colder', '20', 'coldest', 'ice', '85', 'shadow', 'new', 'idea', 'photo', 'craters', '21', 'band', 'rained', 'forever', 'cassini', '2017', 'raining', 'lose', 'problem', 'satellite', 'smash', 'moon', 'drifting', 'four', 'tonight', 'look', 'up', 'pieces', 'feet']);
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
