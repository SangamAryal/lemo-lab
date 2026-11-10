// "What If Earth Had Rings?" v2 — the long version (about 3 min), flat-vector, vertical 1080×1920, canvas 2D, deterministic in t.
// Beyond Everything brand style (kit.js shared with the other films). Thirty beats, one per line: a mystery planet that turns out
// to be Earth 466 million years ago; an asteroid torn apart at the Roche limit; the ring seen from the equator, mid-latitudes and
// the poles; the shadow and the ice age; the crater band; Saturn's ring rain; satellites; the Moon; and the plain sky tonight.
import * as K from './kit.js';
import { clamp, lerp, seg, ss, eio, eo, mulberry, TAU } from '/core/lib.js';
const { P, text, sparkle, glow, card, bubble, pop } = K;

const W = 1080, H = 1920, CX = W / 2;
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

// ───────── scenes, one per line
const SC = [];
const EX = CX, EY = 1020;                                         // where Earth usually sits
SC[0] = (t) => {                                                   // a mystery planet
  K.bg(t);
  ringedEarth(EX, EY, 250, t, 'happy', { noFace: 1, bands: ROCK, seed: 9 });
  const sc = .5 + .5 * Math.sin(t * 3); g.save(); g.strokeStyle = `rgba(63,224,255,${.5 + .3 * sc})`; g.lineWidth = 6; const R = 330;
  for (const [sx, sy] of [[-1, -1], [1, -1], [1, 1], [-1, 1]]) { g.beginPath(); g.moveTo(EX + sx * R, EY + sy * (R - 80)); g.lineTo(EX + sx * R, EY + sy * R); g.lineTo(EX + sx * (R - 80), EY + sy * R); g.stroke(); } g.restore();
  text('SCANNING…', EX, EY + 400, 40, P.cyan, 1000, P.navy, 8, 'center', .6 + .4 * sc);
  g.save(); g.translate(CX, 330); text('WHAT IS', 0, -20, 92, P.white, 1000, P.navy, 16); text('THIS PLANET?', 0, 110, 120, P.gold, 1000, P.navy, 18); g.restore();
};
SC[1] = (t) => {                                                   // in the habitable zone… a new world?
  K.bg(t); K.sunChar(-60, 1020, 170, t, { mood: 'happy' });
  const hz = ss(seg(t, T.spot - .3, T.spot + .4)); if (hz > 0) { g.save(); g.globalAlpha = .28 * hz; g.strokeStyle = '#5fcf7a'; g.lineWidth = 300; g.beginPath(); g.arc(-60, 1020, 760, -1.1, 1.1); g.stroke(); g.restore(); text('just right for life', 560, 520, 46, '#8af0a6', 1000, P.navy, 10, 'center', hz); }
  ringedEarth(700, 1020, 150, t, 'happy', { noFace: 1, bands: ROCK, seed: 9 });
  const ks = pop(t, T.newW); if (ks > 0) { g.save(); g.translate(720, 1330); g.rotate(-.12); g.scale(ks, ks); g.strokeStyle = P.red; g.lineWidth = 10; g.beginPath(); g.roundRect(-230, -60, 460, 120, 20); g.stroke(); text('NEW WORLD?', 0, 22, 70, P.red, 1000, null, 0); g.restore(); }
};
SC[2] = (t) => {                                                   // it's Earth, 466 million years ago
  K.bg(t);
  const kf = ss(seg(t, T.earth3 - .2, T.earth3 + .2));
  ringedEarth(EX, EY + 40, 250, t, 'wink', { noFace: kf < .5, bands: ROCK, seed: 9 });
  const ke = pop(t, T.earth3); if (ke > 0) { g.save(); g.translate(CX, 380); g.scale(ke, ke); text("IT'S EARTH", 0, 40, 130, P.gold, 1000, P.navy, 18); g.restore(); }
  const ky = pop(t, T.y466 - .1); if (ky > 0) { g.save(); g.translate(CX, 1400); g.scale(ky, ky); card(0, 0, 760, 170, 1); text('466 MILLION', 0, -5, 84, P.gold, 1000, null, 0); text('YEARS AGO', 0, 58, 46, P.white, 1000, null, 0); g.restore(); }
};
SC[3] = (t) => {                                                   // where from, where to? a rock that got too close
  K.bg(t);
  ringedEarth(EX - 60, EY, 230, t, 'worried', { bands: ROCK, seed: 9, look: .6 });
  const k1 = pop(t, T.where), k2 = pop(t, T.go);
  if (k1 > 0) bubble(300, 520, 330, 100, 'where from?', k1, P.navy, 1);
  if (k2 > 0) bubble(760, 640, 380, 100, 'where to?', k2, P.navy, 1);
  const ka = ss(seg(t, T.rock4 - .3, T.rock4 + .6)); if (ka > 0) asteroid(lerp(1250, 900, eo(ka)), 1380, 80, t, 'smug', { look: -1, rot: t * .3 });
};
SC[4] = (t) => {                                                   // a time of heavy bombardment
  K.bg(t);
  K.earth(EX, EY + 60, 260, t, t > T.hitting ? 'scared' : 'worried', { look: -.5, lookY: -.5 });
  for (let i = 0; i < 9; i++) { const R = mulberry(i + 200), ph = ((t - VO.e05) * .7 + R()) % 1, a = -2.6 + R() * 2.2, d0 = 1100, x0 = EX + Math.cos(a) * d0, y0 = EY + 60 + Math.sin(a) * d0, x1 = EX + Math.cos(a) * 250, y1 = EY + 60 + Math.sin(a) * 250;
    if (t < VO.e05 + .3) continue; const x = lerp(x0, x1, ph * ph), y = lerp(y0, y1, ph * ph);
    g.save(); g.globalAlpha = .9; g.strokeStyle = '#ffd98a'; g.lineWidth = 8; g.lineCap = 'round'; g.beginPath(); g.moveTo(x + (x0 - x1) * .12, y + (y0 - y1) * .12); g.lineTo(x, y); g.stroke(); g.restore(); glow(x, y, 30, '255,200,120', .9);
    if (ph > .9) burst(x1, y1, (ph - .9) * 10, 40); }
  const kc = pop(t, T.hitting + .3); if (kc > 0) { g.save(); g.translate(CX, 420); g.scale(kc, kc); card(0, 0, 640, 120, 1); text('IMPACTS: WAY UP', 0, 20, 62, P.gold, 1000, null, 0); g.restore(); }
};
SC[5] = (t) => {                                                   // one asteroid flies past, very close
  K.bg(t);
  K.earth(300, EY + 100, 230, t, 'scared', { look: 1 });
  const u = seg(t, VO.e06 - .2, VO.e06 + dur.e06 + .4), ax = lerp(1250, -150, u), ay = 520 + Math.pow(u - .5, 2) * 1400 + 420 * Math.sin(u * Math.PI) * .5;
  g.save(); g.setLineDash([16, 14]); g.strokeStyle = 'rgba(255,255,255,.35)'; g.lineWidth = 5; g.beginPath(); for (let k = 0; k <= 40; k++) { const v = k / 40, xx = lerp(1250, -150, v), yy = 520 + Math.pow(v - .5, 2) * 1400 + 420 * Math.sin(v * Math.PI) * .5; k ? g.lineTo(xx, yy) : g.moveTo(xx, yy); } g.stroke(); g.restore();
  asteroid(ax, ay, 85, t, 'wink', { rot: t * .8, look: -1 });
  const kc = pop(t, T.flew + .3); if (kc > 0) bubble(760, 1350, 260, 90, 'missed!', kc, P.navy, -1);
};
SC[6] = (t) => {                                                   // the Roche limit
  K.bg(t);
  K.earth(EX - 120, EY + 100, 210, t, 'keen', { look: 1 });
  roche(EX - 120, EY + 100, 420, ss(seg(t, T.line7 - .3, T.roche + .3)));
  const u = seg(t, VO.e07, VO.e07 + dur.e07 + .3); asteroid(lerp(1100, 860, eo(u)), lerp(560, 720, eo(u)), 70, t, 'worried', { rot: t * .5, look: -1 });
};
SC[7] = (t) => {                                                   // near side pulled harder than far side → rip
  K.bg(t);
  K.earth(-140, EY + 60, 380, t, 'keen', { look: 1 });
  const st = ss(seg(t, VO.e08, T.rip)), rp = seg(t, T.rip, T.rip + .9), ax = 680;
  if (rp < 1) asteroid(ax, EY + 60, 150, t, rp > 0 ? 'scared' : 'worried', { sx: 1 + .5 * st, sy: 1 - .2 * st, crack: rp > 0 ? 1 : st > .7 ? st : 0, look: -1 });
  const ka = ss(seg(t, T.near8 - .3, T.near8 + .2)) * (1 - ss(rp * 3));
  if (ka > 0) { K.arrow(ax - 160, EY - 140, ax - 420, EY - 140, P.gold, 22, ka); text('pulled harder', ax - 290, EY - 200, 44, P.gold, 1000, P.navy, 10, 'center', ka); K.arrow(ax + 200, EY + 260, ax + 100, EY + 260, '#9ad7ff', 12, ka); text('weaker', ax + 160, EY + 330, 40, '#9ad7ff', 1000, P.navy, 8, 'center', ka); }
  if (rp > 0) { burst(ax, EY + 60, rp, 200); for (let i = 0; i < 14; i++) { const R = mulberry(i + 300), a = R() * TAU, d = rp * (150 + R() * 300); rock(ax + Math.cos(a) * d * 1.4, EY + 60 + Math.sin(a) * d * .7, 18 + R() * 26, t * 2 + i, '#9b8f84'); } }
};
SC[8] = (t) => {                                                   // the pieces spread into a ring
  K.bg(t);
  const sp = ss(seg(t, T.spread - .3, T.spread + 2.2)), sh = ss(seg(t, VO.e09, T.spread));
  ringedEarth(EX, EY, 240, t, 'happy', { bands: ROCK, ra: sp, sweep: sp, seed: 9, look: .3 });
  for (let i = 0; i < 18; i++) { const R = mulberry(i + 400), a = R() * TAU, d = 300 + R() * 250; if (sp < .9) rock(lerp(EX + 520, EX + Math.cos(a) * d * 1.6, sh), lerp(EY - 120, EY + Math.sin(a) * d * .4, sh), 12 + R() * 16, t + i, '#9b8f84'); }
};
SC[9] = (t) => {                                                   // a small Saturn; Saturn's rings may have started the same way
  K.bg(t);
  ringedEarth(330, 760, 170, t, 'smug', { bands: ROCK, seed: 9, look: 1 });
  const ks = ss(seg(t, T.small - .3, T.small + .3)); if (ks > 0) { g.save(); g.globalAlpha = ks; saturn(lerp(1250, 760, eo(ks)), 1240, 140, t, t > T.started ? 'happy' : 'annoyed'); g.restore(); }
  const kb = pop(t, T.started + .2); if (kb > 0) bubble(780, 900, 300, 100, 'same way?', kb, P.navy, -1);
};
SC[10] = (t) => {                                                  // it depends on where you stand: three pins
  K.bg(t);
  ringedEarth(EX, EY, 280, t, 'happy', { tilt: 0, rx: 1.8, ry: .3, bands: ROCK, seed: 9 });
  for (const [k, lat, lab, col] of [[0, 0, 'equator', P.gold], [1, .55, 'further north', P.cyan], [2, .92, 'near the poles', P.white]]) {
    const kp = pop(t, T.depends - .2 + k * .35); if (kp <= 0) continue; const px = EX - 280 * Math.cos(Math.asin(lat)) * .9, py = EY - 280 * lat;
    dot(px, py, 16 * kp, col); g.save(); g.globalAlpha = kp; g.strokeStyle = col; g.lineWidth = 5; g.beginPath(); g.moveTo(px, py); g.lineTo(150, py - 60 - k * 40); g.stroke(); g.restore(); text(lab, 170, py - 75 - k * 40, 42, col, 1000, P.navy, 8, 'left', kp);
  }
};
SC[11] = (t) => {                                                  // at the equator: a thin line straight overhead
  sky(t, 0); K.sunBody(880, 330, 60, t);
  archSky(1700, 1100, 1450, eio(seg(t, T.thin - .6, T.thin + .8)), .12, 0);
  land(0, { sand: 1 }); palm(160, 1330, .9); palm(940, 1300, .75); sitter(t, { mood: 'annoyed' });
  place('THE EQUATOR'); const kb = pop(t, T.thin + .8); if (kb > 0) bubble(830, 1000, 230, 90, 'that’s it?', kb, P.navy, -1);
};
SC[12] = (t) => {                                                  // further north: the giant arch
  sky(t, 0); K.sunBody(900, 300, 70, t);
  archSky(1700, 1050, 1300, eio(seg(t, T.arch13 - .4, T.arch13 + 1.2)), 1, 0);
  land(0); sitter(t, { mood: t > T.arch13 + .3 ? 'love' : 'happy' });
  place('FURTHER NORTH'); const kb = pop(t, T.arch13 + 1); if (kb > 0) bubble(830, 1000, 230, 90, 'whoa', kb, P.navy, -1);
};
SC[13] = (t) => {                                                  // near the poles: a low mountain of light, then gone
  { const gr = g.createLinearGradient(0, 0, 0, 1300); gr.addColorStop(0, '#1f4f9e'); gr.addColorStop(1, '#7fb6e8'); g.fillStyle = gr; g.fillRect(0, 0, W, H); }
  const dn = ss(seg(t, T.drops - .2, T.drops + 1.2));
  archSky(1520 + dn * 420, 900, 420, 1, 1.2, 0, 1);
  g.fillStyle = '#ffffff'; for (const [x, w, h] of [[150, 260, 160], [900, 320, 200]]) { g.beginPath(); g.moveTo(x - w, 1300); g.lineTo(x, 1300 - h); g.lineTo(x + w, 1300); g.fill(); }
  land(0, { snow: 1 }); sitter(t, { mood: dn > .5 ? 'sad' : 'happy' });
  for (let i = 0; i < 16; i++) { const R = mulberry(i + 500), y = (R() * H + t * 90) % 1300; snowflake(R() * W, y, 8 + R() * 6, .7); }
  place('NEAR THE POLES'); const kb = pop(t, T.drops + 1); if (kb > 0) bubble(830, 1000, 230, 90, 'gone', kb, P.navy, -1);
};
SC[14] = (t) => {                                                  // at night, the ring still shines
  const lit = ss(seg(t, T.catch - .2, T.brighter + .4));
  sky(t, 1); archSky(1700, 1050, 1300, 1, 1, 1, .4 + .6 * lit); land(1, { lit });
  if (lit > 0) glow(CX - 60, 1050, 420, '255,240,200', .25 * lit);
  K.moon(880, 830, 55, t, 'happy', { look: -1 }); sitter(t, { mood: lit > .7 ? 'sleepy' : 'happy' });
  const kb = pop(t, T.brighter + .3); if (kb > 0) bubble(800, 1010, 330, 100, 'too bright!', kb, P.navy, -1);
};
SC[15] = (t) => {                                                  // the ring shadow and a colder winter (from v1)
  K.bg(t);
  K.sunChar(-20, 520, 150, t, { mood: 'happy' }); glow(-20, 520, 600, '255,210,120', .15);
  const sh = ss(seg(t, T.shadows - .2, T.shadows + .6)), cold = ss(seg(t, T.winter - .2, T.colder + .3)), shiver = cold * Math.sin(t * 40) * 4;
  ringedEarth(CX + 120 + shiver, 1030, 260, t, cold > .5 ? 'worried' : 'happy', { bands: ROCK, seed: 9, look: -.5, under: () => {
    if (sh <= 0) return; g.save(); g.beginPath(); g.arc(CX + 120 + shiver, 1030, 260, 0, TAU); g.clip(); g.translate(CX + 120 + shiver, 1030); g.rotate(-.32);
    g.fillStyle = `rgba(8,6,40,${.72 * sh})`; g.fillRect(-300, 90, 600, 140); g.restore();
    for (let i = 0; i < 7; i++) { const R = mulberry(i + 11), fy = (R() + t * .25) % 1; snowflake(CX + 120 + shiver - 200 + R() * 400, 1080 + fy * 160 - (R() - .5) * 80, 10 + R() * 6, cold * .9); }
  } });
  const kl = ss(seg(t, T.shadows, T.shadows + .3)); if (kl > 0) { K.arrow(260, 1380, CX + 40, 1200, P.gold, 10, kl); text('ring shadow', 250, 1430, 50, P.gold, 1000, P.navy, 10, 'center', kl); }
  const kw = pop(t, T.colder); if (kw > 0) { g.save(); g.translate(860, 650); g.scale(kw, kw); card(0, 0, 300, 110, 1); text('COLDER', 0, 20, 60, P.cyan, 1000, null, 0); g.restore(); }
};
SC[16] = (t) => {                                                  // 20 million years later: the big freeze
  K.bg(t, '#0b1840', '#1d2f66');
  const cool = ss(seg(t, T.coldest - .4, T.coldest + 1.4));
  ringedEarth(EX + 60, EY, 250, t, cool > .5 ? 'sleepy' : 'worried', { bands: ROCK, ra: .7, seed: 9, under: () => {
    g.save(); g.beginPath(); g.arc(EX + 60, EY, 250, 0, TAU); g.clip(); g.fillStyle = `rgba(255,255,255,${.95})`;
    g.beginPath(); g.ellipse(EX + 60, EY - 250, 270, 50 + 140 * cool, 0, 0, TAU); g.fill(); g.beginPath(); g.ellipse(EX + 60, EY + 250, 270, 40 + 110 * cool, 0, 0, TAU); g.fill(); g.restore();
  } });
  thermo(170, 1050, cool, ss(seg(t, T.coldest - .5, T.coldest)));
  const kc = pop(t, T.m20 - .1); if (kc > 0) { g.save(); g.translate(CX, 400); g.scale(kc, kc); card(0, 0, 780, 130, 1); text('+20 MILLION YEARS', 0, 22, 66, P.gold, 1000, null, 0); g.restore(); }
};
SC[17] = (t) => {                                                  // ice sheets; 85% of sea species gone
  const gr = g.createLinearGradient(0, 0, 0, H); gr.addColorStop(0, '#1d6fb8'); gr.addColorStop(1, '#0b2a5a'); g.fillStyle = gr; g.fillRect(0, 0, W, H);
  const ki = ss(seg(t, T.ice - .2, T.ice + 1.2)); g.fillStyle = '#eef5ff'; g.beginPath(); g.moveTo(0, 0); g.lineTo(W, 0); g.lineTo(W, 120 + 220 * ki); for (let x = W; x >= 0; x -= 60) g.lineTo(x, 120 + 220 * ki + Math.sin(x * .05) * 20); g.fill();
  const gone = seg(t, T.p85 - .2, T.p85 + 1.6);
  for (let i = 0; i < 20; i++) { const cx = 200 + (i % 4) * 230, cy = 560 + Math.floor(i / 4) * 170, R = mulberry(i + 600); creature(cx, cy, .9, i % 2, i < 17 && gone * 17 > i, t + R()); }
  const kp = pop(t, T.p85); if (kp > 0) { g.save(); g.translate(CX, 1420); g.scale(kp, kp); card(0, 0, 600, 140, 1); text('~85% GONE', 0, 25, 84, P.red, 1000, null, 0); g.restore(); }
};
SC[18] = (t) => {                                                  // a new idea; not everyone agrees
  K.bg(t);
  ringedEarth(EX, 620, 150, t, 'sleepy', { bands: ROCK, seed: 9, ra: .8 });
  head(300, 1100, 110, t, 'keen', P.hair, { glasses: 1 }); head(790, 1100, 110, t, t > T.idea + .3 ? 'annoyed' : 'happy', '#c47a3a', { seed: 7.1 });
  const k1 = pop(t, T.shadow19), k2 = pop(t, T.idea + .3);
  if (k1 > 0) bubble(330, 900, 360, 100, 'the shadow!', k1, P.navy, -1);
  if (k2 > 0) bubble(760, 900, 300, 100, 'hmm…', k2, P.navy, 1);
  const kc = pop(t, T.idea); if (kc > 0) { g.save(); g.translate(CX, 1420); g.scale(kc, kc); card(0, 0, 520, 110, 1); text('STILL DEBATED', 0, 20, 58, P.gold, 1000, null, 0); g.restore(); }
};
SC[19] = (t) => {                                                  // nobody took a photo
  K.bg(t);
  ringedEarth(EX, EY + 80, 220, t, 'wink', { bands: ROCK, seed: 9 });
  camera(CX, 520, 1.2); cross(CX, 525, 110, ss(seg(t, T.photo - .2, T.photo + .2)));
};
SC[20] = (t) => {                                                  // normally, craters land everywhere
  K.bg(t);
  K.moon(EX, EY, 300, t, 'happy', { look: 0 });
  const kr = seg(t, T.normally - .3, T.normally + 1.6);
  for (let i = 0; i < 26; i++) { const R = mulberry(i + 700), a = R() * TAU, d = Math.sqrt(R()) * 270, k = clamp((kr * 26 - i) / 1.5); if (k > 0) { dot(EX + Math.cos(a) * d, EY + Math.sin(a) * d, (10 + R() * 14) * k, '#7b7f9c'); dot(EX + Math.cos(a) * d - 3, EY + Math.sin(a) * d - 3, (6 + R() * 8) * k, '#a3a9c9'); } }
  const kl = pop(t, T.normally + .6); if (kl > 0) { g.save(); g.translate(CX, 430); g.scale(kl, kl); card(0, 0, 560, 110, 1); text('RANDOM. EVERYWHERE.', 0, 20, 52, P.white, 1000, null, 0); g.restore(); }
  const km = pop(t, T.mapped); if (km > 0 && t < T.normally) { g.save(); g.translate(CX, 430); g.scale(km, km); card(0, 0, 560, 110, 1); text('CRATER MAP', 0, 20, 58, P.gold, 1000, null, 0); g.restore(); }
};
SC[21] = (t) => {                                                  // but these 21 sit in a band near the old equator
  K.bg(t);
  const mx = CX, my = 960, mw = 920, mh = 520;
  g.save(); g.fillStyle = '#3d8be8'; g.beginPath(); g.roundRect(mx - mw / 2, my - mh / 2, mw, mh, 30); g.fill(); g.clip();
  for (const [x, y, s, sd] of [[-.3, -.1, .9, 1], [.2, .15, 1.1, 2], [.35, -.3, .5, 3]]) { const R = mulberry(sd); g.fillStyle = P.land; g.beginPath(); for (let i = 0; i <= 10; i++) { const a = i / 10 * TAU, rr = 120 * s * (.7 + .3 * R()); g.lineTo(mx + x * mw + Math.cos(a) * rr * 1.5, my + y * mh + Math.sin(a) * rr); } g.fill(); }
  const kb = ss(seg(t, T.band - .3, T.band + .4)); g.fillStyle = `rgba(255,199,58,${.3 * kb})`; g.fillRect(mx - mw / 2, my - 110, mw, 220);
  g.restore(); g.strokeStyle = 'rgba(255,255,255,.8)'; g.lineWidth = 5; g.setLineDash([20, 14]); g.beginPath(); g.moveTo(mx - mw / 2, my); g.lineTo(mx + mw / 2, my); g.stroke(); g.setLineDash([]);
  text('old equator', mx + mw / 2 - 130, my - 18, 34, P.white, 1000, P.navy, 6, 'center', 1);
  const kc = seg(t, VO.e22 + .1, T.c21 + 1.8);
  for (let i = 0; i < 21; i++) { const R = mulberry(i + 800), k = clamp((kc * 21 - i) / 1.2); if (k <= 0) continue; const x = mx - mw / 2 + 50 + R() * (mw - 100), y = my + (R() - .5) * 190; dot(x, y, 18 * pop(t, VO.e22 + .1 + i / 21 * (T.c21 + 1.7 - VO.e22)), '#ff6a3a'); }
  const kn = pop(t, T.c21); if (kn > 0) { g.save(); g.translate(CX, 470); g.scale(kn, kn); card(0, 0, 520, 120, 1); text('21 CRATERS', 0, 22, 70, '#ff8a5a', 1000, null, 0); g.restore(); }
  const ke = ss(seg(t, T.exactly - .2, T.exactly + .3)); if (ke > 0) { ringedEarth(CX, 1390, 90, t, 'smug', { bands: ROCK, seed: 9, ws: .4, ra: ke }); }
};
SC[22] = (t) => {                                                  // bit by bit, the ring rains down
  K.bg(t);
  const rn = ss(seg(t, T.bit - .2, T.rained + 2));
  ringedEarth(EX, EY, 250, t, 'scared', { bands: ROCK, seed: 9, ra: 1 - rn * .85, look: 0, lookY: -.4 });
  for (let i = 0; i < 10; i++) { const R = mulberry(i + 900), ph = ((t - T.bit) * 1.1 + R()) % 1; if (t < T.bit) continue; const x0 = EX + (R() - .5) * 900, y0 = EY - 40 + (R() - .5) * 160, x1 = EX + (R() - .5) * 300, y1 = EY + (R() - .5) * 60;
    const x = lerp(x0, x1, ph), y = lerp(y0, y1, ph); g.save(); g.globalAlpha = Math.sin(ph * Math.PI); g.strokeStyle = '#ffd98a'; g.lineWidth = 6; g.lineCap = 'round'; g.beginPath(); g.moveTo(x - (x1 - x0) * .2, y - (y1 - y0) * .2); g.lineTo(x, y); g.stroke(); g.restore(); glow(x, y, 26, '255,210,130', .8); }
};
SC[23] = (t) => {                                                  // rings don't last; even Saturn's
  K.bg(t);
  saturn(EX, EY, 230, t, t > T.sat24 + .4 ? 'worried' : 'happy');
  const kn = pop(t, T.forever - .2); if (kn > 0) { g.save(); g.translate(CX, 430); g.scale(kn, kn); card(0, 0, 520, 120, 1); text('NOT FOREVER', 0, 22, 66, P.gold, 1000, null, 0); g.restore(); }
};
SC[24] = (t) => {                                                  // Cassini, 2017: ring rain
  K.bg(t);
  saturn(EX - 40, EY + 60, 230, t, 'worried');
  const rn = ss(seg(t, T.raining - .5, T.raining + .3));
  for (let i = 0; i < 26; i++) { const R = mulberry(i + 1000), ph = ((t - VO.e25) * .6 + R()) % 1, side = R() < .5 ? -1 : 1, x0 = EX - 40 + side * (300 + R() * 160), x1 = EX - 40 + side * (120 + R() * 60), y0 = EY + 60 + (R() - .5) * 50, y1 = EY + 60 - 170 - R() * 40;
    dot(lerp(x0, x1, ph), lerp(y0, y1, ph) - Math.sin(ph * Math.PI) * 60, 5, '#fff2d0', rn * Math.sin(ph * Math.PI)); }
  const u = seg(t, VO.e25, VO.e25 + dur.e25); cassini(lerp(1150, 720, eo(u)), lerp(450, 760, eo(u)), .9, -.4);
  const kc = pop(t, T.y2017); if (kc > 0) text('CASSINI · 2017', 820, 560, 46, P.gold, 1000, P.navy, 10, 'center', kc);
  const kr = pop(t, T.raining + .2); if (kr > 0) { g.save(); g.translate(CX, 1420); g.scale(kr, kr); card(0, 0, 480, 110, 1); text('RING RAIN', 0, 20, 64, '#fff2d0', 1000, null, 0); g.restore(); }
};
SC[25] = (t) => {                                                  // a few hundred million years: a bare Saturn
  K.bg(t);
  const fd = ss(seg(t, T.lose - .3, T.lose + 1.6));
  ring(EX, EY, 230 * 2.1, 230 * .5, -.25, 'back', t, 1 - fd * .92, { ws: .45, seed: 3 });
  planetChar(EX, EY, 230, t, '#f0c878', '#d9a85a', fd > .5 ? 'sad' : 'worried', { look: -1 });
  ring(EX, EY, 230 * 2.1, 230 * .5, -.25, 'front', t, 1 - fd * .92, { ws: .45, seed: 3 });
  const kc = pop(t, VO.e26 + .1); if (kc > 0) { g.save(); g.translate(CX, 430); g.scale(kc, kc); card(0, 0, 820, 120, 1); text('A FEW 100 MILLION YEARS', 0, 20, 52, P.gold, 1000, null, 0); g.restore(); }
};
SC[26] = (t) => {                                                  // today: rocks vs a satellite (from v1)
  K.bg(t);
  ringedEarth(CX, 1120, 300, t, t > T.smash ? 'scared' : 'worried', { tilt: -.12, rx: 2.1, ry: .36, look: -.6, lookY: -.4 });
  const hit = T.smash + .15, u = seg(t, VO.e27, hit), after = Math.max(0, t - hit);
  const sx = after > 0 ? lerp(175, -400, ss(clamp(after / 2))) : lerp(-150, 175, u), sy = after > 0 ? 1080 - after * 260 : lerp(600, 1080, u);
  satellite(sx, sy, .8, after > 0 ? -after * 6 : .35, t, after > 0 ? 'scared' : 'happy');
  for (let i = 0; i < 6; i++) { const R = mulberry(i + 70), rx = lerp(560, 205, seg(t, T.smash - .9 + i * .08, hit)) + R() * 60, ry = 1110 + (R() - .5) * 60; if (t < hit + .1) rock(rx, ry, 14 + R() * 14, t * 2 + i); }
  burst(195, 1085, seg(t, hit, hit + .8), 110);
  const kc = pop(t, hit); if (kc > 0) { g.save(); g.translate(CX + 160, 600); g.scale(kc, kc); g.rotate(-.12); text('CRASH!', 0, 0, 120, P.red, 1000, P.white, 14); g.restore(); }
  const kt = pop(t, VO.e27 + .1) * (1 - ss(seg(t, T.smash - .4, T.smash))); if (kt > 0) { g.save(); g.translate(CX, 400); g.scale(kt, kt); card(0, 0, 400, 110, 1); text('TODAY', 0, 20, 64, P.gold, 1000, null, 0); g.restore(); }
};
SC[27] = (t) => {                                                  // rings again? only if something crossed that line, like the Moon
  K.bg(t);
  K.earth(EX - 120, EY + 120, 200, t, 'happy', { look: 1 });
  roche(EX - 120, EY + 120, 400, ss(seg(t, T.line28 - .3, T.line28 + .3)));
  const km = ss(seg(t, T.moon28 - .3, T.moon28 + .3)); if (km > 0) { g.save(); g.globalAlpha = km; K.moon(900, 520, 95, t, 'worried', { look: -1 }); g.restore(); }
};
SC[28] = (t) => {                                                  // the Moon would break into a ring… but it's drifting away
  K.bg(t);
  const wr = T.worry - .2, ap = ss(seg(t, VO.e29, T.brk)), br = seg(t, T.brk, wr);
  if (t < wr) {
    ringedEarth(EX, EY + 80, 200, t, 'scared', { ra: ss(br), sweep: ss(br), bands: ROCK, seed: 5, look: 1 });
    roche(EX, EY + 80, 400, .7, false);
    if (br < .3) K.moon(lerp(900, 640, ap), lerp(520, 780, ap), 95, t, 'scared', { look: -1 });
    if (br > 0 && br < 1) burst(640, 780, br, 160);
    const ks = text('WHAT IF…', CX, 380, 70, P.cyan, 1000, P.navy, 12, 'center', 1 - ss(seg(t, T.brk + .6, T.brk + 1)));
  } else {
    K.earth(EX - 220, EY + 160, 190, t, 'happy', { look: 1 });
    const dr = ss(seg(t, T.drift - .3, T.drift + 2.5)), mx = lerp(700, 900, dr);
    K.moon(mx, 700, 95, t, 'wink', { look: -1 });
    const kn = pop(t, wr); if (kn > 0) { g.save(); g.translate(CX, 380); g.scale(kn, kn); card(0, 0, 560, 120, 1); text("NOT HAPPENING", 0, 22, 64, P.gold, 1000, null, 0); g.restore(); }
    const kf = ss(seg(t, T.four - .2, T.four + .3)); if (kf > 0) { K.arrow(mx + 120, 700, mx + 260, 700, P.gold, 14, kf); text('≈ 4 cm / year', 820, 860, 52, P.gold, 1000, P.navy, 10, 'center', kf); }
  }
};
SC[29] = (t) => {                                                  // tonight: a plain sky; the ghost ring; a piece in the ground
  const gh = ss(seg(t, T.plain - .2, T.plain + .8)), kg = ss(seg(t, T.groundE - .4, T.groundE + .3));
  sky(t, 1);
  if (gh > 0) { g.save(); g.globalAlpha = gh * .8; g.setLineDash([26, 22]); g.strokeStyle = 'rgba(255,240,200,.8)'; g.lineWidth = 10; g.beginPath(); g.ellipse(CX, 1700, 1050, 1300, 0, Math.PI, TAU); g.stroke(); g.restore(); }
  land(1); K.moon(880, 830, 55, t, 'happy', { look: -1 });
  sitter(t, { mood: gh > .5 ? 'wink' : 'happy' });
  if (kg > 0) { glow(250, 1480, 120, '255,200,120', .7 * kg); rock(250, 1480, 34, .4, '#b39a7a'); text('466 million years old?', 250, 1400, 34, P.gold, 1000, P.navy, 8, 'center', kg); }
};

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
  const draw = (k, z, a) => { g.save(); g.globalAlpha = a; g.translate(CX, 1000); g.scale(z, z); g.translate(-CX, -1000); SC[k](t); g.restore(); };
  if (i > 0 && u < 1) { draw(i - 1, 1 + .08 * eio(u), 1); draw(i, 1.06 - .06 * eo(u), ss(u)); }
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
