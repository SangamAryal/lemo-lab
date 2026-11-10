// Talking Planets #2 (v2) — "What If Another Star Replaced the Sun?" Three replacements, each examined the same way
// (ORBIT · SKY · GROUND · PLANETS): Proxima (too light: every planet escapes), Sirius A (too heavy and bright: a 4.5-month
// oval year, boiling oceans, a warm Jupiter), Betelgeuse (too big: the inner planets are inside it, even Neptune falls in).
// Flat Beyond Everything kit art with 2.5D orbit views and ground-level shots, 1080×1920, deterministic in t.
// Mouths follow each voice line (timeline.json). ?thumb=1 draws the thumbnail.
import * as K from './kit.js';
import { clamp, lerp, seg, ss, eio, eo, mulberry, TAU } from '/core/lib.js';
const { P, text, glow } = K;
const W = 1080, H = 1920, CX = W / 2;
const main = document.getElementById('c'), G0 = main.getContext('2d');
const off = document.createElement('canvas'); off.width = W; off.height = H; const G1 = off.getContext('2d');
let g = G0; const use = c => { g = c; K.setup(c, W, H); }; use(G0); K.makeStars(130, 11);
await document.fonts.load('900 80px NU'); await document.fonts.load('800 40px NU');
const TL = await (await fetch('timeline.json')).json();
const LN = Object.fromEntries(TL.lines.map(l => [l.id, l])), DUR = TL.dur;
const at = id => LN[id].t, end = id => LN[id].t + LN[id].d;
const dot = (x, y, r, c, a = 1) => { const o = g.globalAlpha; g.globalAlpha = o * a; g.fillStyle = c; g.beginPath(); g.arc(x, y, r, 0, TAU); g.fill(); g.globalAlpha = o; };
const pop = (t, t0, d = .35) => { const u = clamp((t - t0) / d); return u <= 0 ? 0 : 1 + Math.sin(u * Math.PI) * .2 * (1 - u); };
const fadeIO = (t, a, b, d = .25) => ss(seg(t, a, a + d)) * (1 - ss(seg(t, b - d, b)));
function mouthOf(who, t) { const l = TL.lines.find(l => l.who === who && t >= l.t && t < l.t + l.d); if (!l) return 0; const k = (t - l.t) * 30, i = Math.floor(k); return lerp(l.mouth[i] || 0, l.mouth[i + 1] || 0, k - i); }
function openMouth(r, o, y = .25) { if (o < .06) return; const w = r * (.1 + .05 * o), h = r * (.03 + .13 * o); g.fillStyle = P.navy; g.beginPath(); g.ellipse(0, r * y, w, h, 0, 0, TAU); g.fill(); g.fillStyle = '#ff6b8a'; g.beginPath(); g.ellipse(0, r * y + h * .5, w * .6, h * .38, 0, 0, TAU); g.fill(); }
const NAME = { earth: 'EARTH', sun: 'SUN', proxima: 'PROXIMA', siriusa: 'SIRIUS A', betelgeuse: 'BETELGEUSE', mars: 'MARS', jupiter: 'JUPITER', neptune: 'NEPTUNE' };
const TAG = { earth: '#4fa3ff', sun: '#ffc73a', proxima: '#ff7a5c', siriusa: '#8fd0ff', betelgeuse: '#ff4d3a', mars: '#ff6a4d', jupiter: '#e8a25a', neptune: '#5b8cff' };
const card = (x, y, w, h, col, a = 1, k = 1) => { g.save(); g.globalAlpha *= a; g.translate(x, y); g.scale(k, k); g.fillStyle = 'rgba(12,10,44,.86)'; g.beginPath(); g.roundRect(-w / 2, -h / 2, w, h, Math.min(h / 2, 40)); g.fill(); if (col) { g.strokeStyle = col; g.lineWidth = 5; g.stroke(); } g.restore(); };
const label = (s, x, y, px, col, t, t0, w) => { const k = pop(t, t0); if (k <= 0) return; g.save(); g.translate(x, y); g.scale(k, k); g.font = `1000 ${px}px NU`; const ww = w || g.measureText(s).width + px * 1.4; card(0, 0, ww, px * 1.9, col); text(s, 0, px * .36, px, col || P.white, 1000, null, 0); g.restore(); };

// ───────── bodies
function bands(x, y, r, col, list, spot, spin = 0) {
  g.save(); g.beginPath(); g.arc(x, y, r, 0, TAU); g.clip(); g.fillStyle = col; g.fillRect(x - r, y - r, 2 * r, 2 * r);
  for (const [v, h, c] of list) { g.fillStyle = c; g.beginPath(); g.ellipse(x, y + v * r, r * 1.2, h * r, 0, 0, TAU); g.fill(); }
  if (spot) { const a = spin % TAU, vis = Math.cos(a); if (vis > -.05) { g.fillStyle = spot; g.beginPath(); g.ellipse(x + Math.sin(a) * r * .7, y + r * .38, r * .22 * Math.max(.15, vis), r * .12, 0, 0, TAU); g.fill(); } }
  g.fillStyle = 'rgba(30,20,60,.3)'; g.beginPath(); g.arc(x + r * .35, y + r * .1, r * 1.1, 0, TAU); g.arc(x - r * .15, y - r * .08, r * 1.02, 0, TAU, true); g.fill('evenodd'); g.restore();
}
const PL = {
  mercury: (x, y, r) => { bands(x, y, r, '#8a7d74', [[-.3, .2, '#776a62'], [.35, .18, '#6f625a']]); },
  venus: (x, y, r) => { bands(x, y, r, '#f2d48a', [[-.4, .12, '#e8c070'], [.2, .14, '#e3b664']]); },
  mars: (x, y, r) => { bands(x, y, r, '#e0623e', [[-.25, .14, '#c24d2e'], [.35, .12, '#c85532']]); dot(x, y - r * .9, r * .3, 'rgba(255,255,255,.85)'); },
  jupiter: (x, y, r, t = 0) => { bands(x, y, r, '#e3b07c', [[-.62, .1, '#c98c5a'], [-.3, .09, '#f3d2a6'], [0, .11, '#c4825a'], [.3, .08, '#f0caa0'], [.6, .1, '#b97a52']], '#c2482e', t * .5); },
  saturn: (x, y, r) => { g.save(); g.strokeStyle = 'rgba(240,215,160,.8)'; g.lineWidth = r * .18; g.beginPath(); g.ellipse(x, y, r * 2, r * .5, -.2, Math.PI, TAU); g.stroke(); g.restore(); bands(x, y, r, '#e8cf94', [[-.3, .12, '#d8b878'], [.3, .1, '#d4b070']]); g.save(); g.strokeStyle = 'rgba(240,215,160,.9)'; g.lineWidth = r * .18; g.beginPath(); g.ellipse(x, y, r * 2, r * .5, -.2, 0, Math.PI); g.stroke(); g.restore(); },
  uranus: (x, y, r) => { bands(x, y, r, '#9fe3ea', [[-.2, .2, '#8fd6de']]); },
  neptune: (x, y, r) => { bands(x, y, r, '#4c7dff', [[-.4, .12, '#3d68e0'], [.15, .1, '#6a96ff'], [.5, .1, '#3a5fd0']], '#23338a'); },
};
function planet(w, x, y, r, t, mood, look = 0, mo = 0) {
  if (w === 'earth') { K.earth(x, y, r, t, mood || 'happy', { rot: t * .4, look }); }
  else { glow(x, y, r * 1.5, '200,200,255', .12); PL[w](x, y, r, t); if (mood) { g.save(); g.translate(x, y); K.face(r, mood, t, look, w.length); g.restore(); } }
  if (mood && mo) { g.save(); g.translate(x, y); openMouth(r, mo); g.restore(); }
}
const STAR = {
  proxima: { body: '#ff7a52', rim: '#d94a2e', glow: '255,110,70' },
  siriusa: { body: '#eaf5ff', rim: '#9cc8ff', glow: '170,210,255' },
  betelgeuse: { body: '#e8452e', rim: '#a8221a', glow: '255,80,50' },
};
function star(k, x, y, r, t, mood, mo = 0, face = 1) {
  const S = STAR[k]; glow(x, y, r * (k === 'siriusa' ? 3 : 2.2), S.glow, k === 'siriusa' ? .55 : .45);
  if (k === 'siriusa') { g.save(); g.globalAlpha *= .45; g.strokeStyle = 'rgba(220,240,255,.8)'; g.lineWidth = Math.max(2, r * .03); for (let i = 0; i < 6; i++) { const a = i / 6 * Math.PI + t * .2; g.beginPath(); g.moveTo(x - Math.cos(a) * r * 2.2, y - Math.sin(a) * r * 2.2); g.lineTo(x + Math.cos(a) * r * 2.2, y + Math.sin(a) * r * 2.2); g.stroke(); } g.restore(); }
  g.save(); g.beginPath(); g.arc(x, y, r, 0, TAU); g.clip();
  const gr = g.createRadialGradient(x - r * .3, y - r * .3, r * .1, x, y, r); gr.addColorStop(0, '#ffffff'); gr.addColorStop(.35, S.body); gr.addColorStop(1, S.rim); g.fillStyle = gr; g.fillRect(x - r, y - r, 2 * r, 2 * r);
  if (k === 'betelgeuse') { const R = mulberry(5); for (let i = 0; i < 22; i++) { g.fillStyle = `rgba(${150 + R() * 80},${30 + R() * 40},20,.35)`; g.beginPath(); g.arc(x + (R() * 2 - 1) * r * .9, y + (R() * 2 - 1) * r * .9, r * (.12 + R() * .2), 0, TAU); g.fill(); } }
  g.restore();
  if (face > 0 && mood) { g.save(); g.globalAlpha *= face; g.translate(x, y); K.face(r, mood, t, 0, k.length); openMouth(r, mo); g.restore(); }
}
function heart(x, y, s, a) { g.save(); g.globalAlpha *= a; g.fillStyle = P.red; g.translate(x, y); g.beginPath(); g.moveTo(0, s * .35); g.bezierCurveTo(-s * 1.1, -s * .3, -s * .4, -s * 1.1, 0, -s * .45); g.bezierCurveTo(s * .4, -s * 1.1, s * 1.1, -s * .3, 0, s * .35); g.fill(); g.restore(); }
function drop(x, y, s = 1) { g.fillStyle = '#7fd3ff'; g.beginPath(); g.moveTo(x, y - 24 * s); g.quadraticCurveTo(x + 16 * s, y + 4 * s, x, y + 12 * s); g.quadraticCurveTo(x - 16 * s, y + 4 * s, x, y - 24 * s); g.fill(); }
function thermo(x, y, val, col, k) { if (k <= 0) return; g.save(); g.translate(x, y); g.scale(k, k); card(0, 0, 640, 130, col); g.fillStyle = col; g.fillRect(-275, -40, 14, 70); dot(-268, 38, 18, col); text(val, 25, 24, 62, col, 1000, null, 0); g.restore(); }

// ───────── shared: a 2.5D solar-system view (not to scale), used for the rules and for Proxima's escape
const SYS = { cx: CX, cy: 950, sq: .42, list: [['mercury', 110, 2.0, 16], ['venus', 175, -.6, 26], ['earth', 250, 1.15, 32], ['mars', 330, -2.3, 26], ['jupiter', 450, .3, 58]] };
function system(t, centre, drift0) {
  K.bg(t);
  for (const [w, R] of SYS.list) { g.save(); g.strokeStyle = 'rgba(170,190,255,.45)'; g.lineWidth = 3; g.setLineDash([12, 12]); g.beginPath(); g.ellipse(SYS.cx, SYS.cy, R, R * SYS.sq, 0, 0, TAU); g.stroke(); g.restore(); }
  centre();
  const items = SYS.list.map(([w, R, a, r], i) => {
    let x = SYS.cx + Math.cos(a) * R, y = SYS.cy + Math.sin(a) * R * SYS.sq; const tx = -Math.sin(a), ty = Math.cos(a) * SYS.sq, n = Math.hypot(tx, ty);
    const d = drift0 ? Math.max(0, t - drift0) : 0, v = 230 / Math.sqrt(i + 1); x += tx / n * d * v; y += ty / n * d * v;
    return { w, x, y, r, tx: tx / n, ty: ty / n };
  }).sort((a, b) => a.y - b.y);
  for (const p of items) {
    const talk = p.w === 'mars' ? mouthOf('mars', t) : p.w === 'jupiter' ? mouthOf('jupiter', t) : 0;
    const mood = drift0 && t > drift0 ? (p.w === 'earth' || p.w === 'mars' || p.w === 'jupiter' ? 'scared' : null) : (p.w === 'earth' || p.w === 'jupiter' || p.w === 'mars' ? 'happy' : null);
    planet(p.w, p.x, p.y, p.r * (p.w === 'jupiter' || p.w === 'mars' ? 1.25 : 1), t, mood, 0, talk);
    if (drift0 && t > drift0) { g.save(); g.globalAlpha *= .6; g.strokeStyle = '#fff'; g.lineWidth = 4; g.lineCap = 'round'; for (let k = 1; k <= 3; k++) { g.beginPath(); g.moveTo(p.x - p.tx * (p.r + 14 * k), p.y - p.ty * (p.r + 14 * k) + (k - 2) * 10); g.lineTo(p.x - p.tx * (p.r + 14 * k + 30), p.y - p.ty * (p.r + 14 * k + 30) + (k - 2) * 10); g.stroke(); } g.restore(); }
    p.at = p;
  }
  return items;
}
function arrow(x, y, dx, dy, len, col) { const ex = x + dx * len, ey = y + dy * len; g.strokeStyle = col; g.fillStyle = col; g.lineWidth = 6; g.lineCap = 'round'; g.beginPath(); g.moveTo(x, y); g.lineTo(ex, ey); g.stroke(); g.beginPath(); g.moveTo(ex + dx * 16, ey + dy * 16); g.lineTo(ex - dy * 11, ey + dx * 11); g.lineTo(ex + dy * 11, ey - dx * 11); g.fill(); }

// ───────── scenes
const EARTH_STAGE = { x: 850, y: 1080, r: 95 };
function stage(t, k, r, mood) {                                    // a star in the Sun's spot, Earth nearby
  K.bg(t);
  g.save(); g.strokeStyle = 'rgba(170,190,255,.5)'; g.lineWidth = 4; g.setLineDash([16, 14]); g.beginPath(); g.ellipse(CX, 900, 430, 150, 0, 0, TAU); g.stroke(); g.restore();
  const kin = pop(t, at(k === 'proxima' ? '03' : '11') - .35, .45);
  star(k, CX, 860, r * Math.max(.01, kin), t, mood, mouthOf(k, t));
  const e = EARTH_STAGE; planet('earth', e.x, e.y, e.r, t, t > at(k === 'proxima' ? '04' : '11') + 1 ? 'worried' : 'keen', -1, mouthOf('earth', t));
}
function sIntro(t) {                                               // 01: the Sun leaves
  K.bg(t);
  g.save(); g.strokeStyle = 'rgba(170,190,255,.5)'; g.lineWidth = 4; g.setLineDash([16, 14]); g.beginPath(); g.ellipse(CX, 900, 430, 150, 0, 0, TAU); g.stroke(); g.restore();
  const out = ss(seg(t, end('01') - .2, end('01') + .5)), sx = CX - 900 * out;
  K.sunChar(sx, 860, 150, t, { mood: 'sleepy', shades: 0 }); g.save(); g.translate(sx, 860); openMouth(150, mouthOf('sun', t), .3); g.restore();
  g.save(); g.translate(sx - 250, 1030); g.rotate(-.12); g.fillStyle = '#fff'; g.beginPath(); g.roundRect(-150, -55, 300, 110, 16); g.fill(); g.strokeStyle = P.red; g.lineWidth = 8; g.stroke(); text('OUT OF', 0, -6, 40, P.red, 1000, null, 0); text('OFFICE', 0, 38, 40, P.red, 1000, null, 0); g.restore();
  planet('earth', EARTH_STAGE.x, EARTH_STAGE.y, EARTH_STAGE.r, t, out > .3 ? 'scared' : 'happy', -1);
}
function sRules(t) {                                               // 02: same spot, same speed
  const items = system(t, () => { text('?', SYS.cx, SYS.cy + 40, 120, 'rgba(255,255,255,.55)', 1000, null, 0); }, 0);
  const a = ss(seg(t, at('02') + 1, at('02') + 1.6));
  if (a > 0) { g.save(); g.globalAlpha *= a; for (const p of items) arrow(p.x + p.tx * (p.r + 10), p.y + p.ty * (p.r + 10), p.tx, p.ty, 50, P.gold); g.restore(); }
  label('INSTANT SWAP', CX, 520, 44, P.gold, t, at('02') + .4); label('SAME SPOT · SAME SPEED', CX, 1400, 40, P.white, t, at('02') + 1.6);
}
function sProxima(t) {                                             // 03–04
  stage(t, 'proxima', 115, t > at('04') + 1.2 ? 'worried' : 'happy');
  const k = ss(seg(t, at('04') + .3, at('04') + .8)); if (k <= 0) return;
  g.save(); g.globalAlpha *= k; const tilt = .32 * ss(seg(t, at('04') + .8, at('04') + 1.6)), bx = CX, by = 1330;   // the balance: 1 Sun vs 0.12
  g.fillStyle = '#c9cbe0'; g.beginPath(); g.moveTo(bx - 30, by + 90); g.lineTo(bx + 30, by + 90); g.lineTo(bx, by); g.fill();
  g.save(); g.translate(bx, by); g.rotate(-tilt); g.fillStyle = '#c9cbe0'; g.fillRect(-300, -8, 600, 16);
  K.sunBody(-250, -70, 55, t); text('1 SUN', -250, 30, 34, P.gold, 1000, P.navy, 8); star('proxima', 250, -40, 26, t, null); text('0.12', 250, 30, 34, '#ff7a52', 1000, P.navy, 8); g.restore(); g.restore();
}
function sDrift(t) {                                               // 05–07: every planet escapes
  system(t, () => star('proxima', SYS.cx, SYS.cy, 40, t, 'worried'), at('05') - .1);
  if (t > at('05')) { g.save(); g.globalAlpha *= ss(seg(t, at('05'), at('05') + .5)); g.strokeStyle = P.red; g.lineWidth = 6; g.setLineDash([]); for (const [w, R] of SYS.list) { g.beginPath(); g.ellipse(SYS.cx, SYS.cy, R, R * SYS.sq, 0, 1.3, 1.5); g.stroke(); } g.restore(); }
  const k = pop(t, at('07') + .9, .4); if (k > 0) { g.save(); g.translate(CX, 1380); g.scale(k, k); card(0, 0, 560, 200, P.red); text('YEAR', -120, -22, 52, P.white, 1000, null, 0); text('SEASONS', -120, 54, 52, P.white, 1000, null, 0); text('✗', 170, -22, 64, P.red, 1000, null, 0); text('✗', 170, 54, 64, P.red, 1000, null, 0); g.restore();
    for (let i = 0; i < 6; i++) { const u = clamp((t - at('07') - .9 - i * .15) / 1.4); if (u <= 0) continue; g.save(); g.globalAlpha *= 1 - u; g.translate(CX + (i - 2.5) * 70 + u * (i - 2.5) * 120, 1240 - u * 400); g.rotate(u * (i - 2.5)); g.fillStyle = '#fff'; g.fillRect(-28, -34, 56, 68); g.fillStyle = P.red; g.fillRect(-28, -34, 56, 16); g.restore(); } }
}
function park(t, sky0, sky1, frost) {                              // a ground-level park/street
  const sky = g.createLinearGradient(0, 0, 0, 1380); sky.addColorStop(0, sky0); sky.addColorStop(1, sky1); g.fillStyle = sky; g.fillRect(0, 0, W, 1380);
  const R = mulberry(4); g.fillStyle = '#0b0f24';
  for (let i = 0; i < 6; i++) { const x = i * 190 - 30, h = 300 + R() * 200, y = 1380 - h; g.fillRect(x, y, 170, h); g.beginPath(); g.moveTo(x - 10, y); g.lineTo(x + 85, y - 80); g.lineTo(x + 180, y); g.fill();
    for (let wy = 0; wy < 2; wy++) for (let wx = 0; wx < 2; wx++) { const fx = x + 30 + wx * 70, fy = y + 50 + wy * 110; g.fillStyle = '#ffd98a'; g.fillRect(fx, fy, 46, 60); g.fillStyle = `rgba(220,240,255,${.2 + .75 * frost})`; g.fillRect(fx, fy, 46, 60 * frost); g.fillStyle = '#0b0f24'; } }
  g.fillStyle = frost > .3 ? '#dfefff' : '#2a3150'; g.fillRect(0, 1380, W, H - 1380);
  g.strokeStyle = 'rgba(160,200,240,.5)'; g.lineWidth = 3; for (let k = -6; k <= 6; k++) { g.beginPath(); g.moveTo(CX + k * 30, 1380); g.lineTo(CX + k * 240, H); g.stroke(); }
  if (frost > 0) { g.save(); g.globalAlpha *= frost * .85; const fr = g.createRadialGradient(CX, 1000, 300, CX, 1000, 1100); fr.addColorStop(0, 'rgba(200,235,255,0)'); fr.addColorStop(1, 'rgba(200,235,255,.75)'); g.fillStyle = fr; g.fillRect(0, 0, W, H); g.restore();
    for (let i = 0; i < 60; i++) { const x = (R() * W + t * 40 * (.5 + R())) % W, y = (R() * H + t * 120 * (.5 + R())) % 1400; dot(x, y, 2 + R() * 4, '#fff', .8 * frost); } }
}
function sGroundP(t) {                                             // 08–09: a dim red dot, then freezing
  const fr = ss(seg(t, at('09'), at('09') + 2.5));
  park(t, '#05040f', '#14102a', fr);
  const sh = 1 - .7 * clamp((t - at('08')) / 4), x = 760, y = 560; glow(x, y, 90 * sh, '255,90,60', .55); dot(x, y, 16 * sh, '#ff6a45');
  label('NOON', 240, 520, 40, P.white, t, at('08') + .1); text('it keeps shrinking', x, y + 120, 32, '#ffb8a8', 900, P.navy, 8, 'center', ss(seg(t, at('08') + 1.2, at('08') + 1.6)) * (1 - fr));
  const wk = pop(t, at('09') + .3), yr = pop(t, at('09') + 2.4);
  if (yr <= 0) thermo(CX, 1180, 'WEEK 1: −18°C', '#9fdcff', wk); else thermo(CX, 1180, 'YEAR 1: −73°C', '#c8ecff', yr);
}
function sWarm(t) {                                                // 10: volcanoes and deep underground
  g.fillStyle = '#07060f'; g.fillRect(0, 0, W, H);
  // top: a volcano's glow on a frozen dark plain
  const vy = 900; g.fillStyle = '#120d1e'; g.fillRect(0, 380, W, vy - 380); glow(CX, vy - 260, 360, '255,110,40', .6);
  g.fillStyle = '#2a1410'; g.beginPath(); g.moveTo(180, vy); g.lineTo(470, vy - 300); g.lineTo(610, vy - 300); g.lineTo(900, vy); g.fill();
  g.fillStyle = '#ff7a2e'; g.beginPath(); g.moveTo(470, vy - 300); g.lineTo(610, vy - 300); g.lineTo(560, vy - 180); g.lineTo(520, vy - 200); g.fill();
  for (let i = 0; i < 5; i++) { const x = 300 + i * 120; g.fillStyle = '#05040a'; g.beginPath(); g.arc(x, vy - 40, 14, 0, TAU); g.fill(); g.fillRect(x - 12, vy - 28, 24, 30); }
  label('NEAR VOLCANOES', CX, 470, 40, '#ffb066', t, at('10') + .3);
  // bottom: a deep tunnel with lights
  const ty = 960; g.fillStyle = '#1a1a26'; g.fillRect(0, ty, W, 520); g.fillStyle = '#2b2b3e'; g.beginPath(); g.ellipse(CX, ty + 270, 420, 200, 0, 0, TAU); g.fill();
  for (let i = 0; i < 6; i++) { const x = 200 + i * 135; glow(x, ty + 150, 60, '255,220,150', .5); dot(x, ty + 150, 8, '#ffe3a0'); }
  for (let i = 0; i < 6; i++) { const x = 290 + i * 100; g.fillStyle = '#0c0b14'; g.beginPath(); g.arc(x, ty + 330, 15, 0, TAU); g.fill(); g.fillRect(x - 13, ty + 343, 26, 40); }
  label('DEEP UNDERGROUND', CX, ty + 470, 40, '#ffe3a0', t, at('10') + 1.1);
}
function sSirius(t) { stage(t, 'siriusa', 205, t > at('11') + 1.5 ? 'smug' : 'happy'); }
// Sirius A orbit: Earth's circle stretches into an oval (a = 0.66 AU, e = 0.515), aphelion on the left at 1 AU
const OAU = 410, OCX = 610, OCY = 960, OSQ = .55, A = .66, E = .515;
function kepler(Mn) { let Ea = Mn; for (let i = 0; i < 8; i++) Ea -= (Ea - E * Math.sin(Ea) - Mn) / (1 - E * Math.cos(Ea)); return Ea; }
function sOrbit(t) {
  K.bg(t);
  const m = ss(seg(t, at('12') + .3, at('12') + 1.6));
  // old orbits
  g.save(); g.setLineDash([12, 12]); g.lineWidth = 3; g.strokeStyle = 'rgba(200,200,220,.55)'; g.beginPath(); g.ellipse(OCX, OCY, .39 * OAU, .39 * OAU * OSQ, 0, 0, TAU); g.stroke();
  g.strokeStyle = 'rgba(90,170,255,.6)'; g.beginPath(); g.ellipse(OCX, OCY, OAU, OAU * OSQ, 0, 0, TAU); g.stroke(); g.restore();
  text("MERCURY'S ORBIT NOW", OCX - 20, OCY - .39 * OAU * OSQ - 70, 26, 'rgba(220,220,240,.85)', 900, P.navy, 6, 'center', ss(seg(t, at('13'), at('13') + .4)));
  text('EARTH NOW', OCX + 250, OCY - OAU * OSQ - 14, 32, '#7fb8ff', 1000, P.navy, 8);
  // the new oval (morphs from the circle), centre shifted toward the aphelion
  const a = lerp(1, A, m) * OAU, b = lerp(1, A * Math.sqrt(1 - E * E), m) * OAU, c = lerp(0, A * E, m) * OAU;
  g.save(); g.strokeStyle = P.gold; g.lineWidth = 6; g.beginPath(); g.ellipse(OCX - c, OCY, a, b * OSQ, 0, 0, TAU); g.stroke(); g.restore();
  star('siriusa', OCX, OCY, 46, t, null);
  // Earth: at the far end until the oval forms, then laps every 3 s
  let ex = OCX - OAU, ey = OCY, rr = 1;
  if (t > at('12') + 1.6) { const Mn = Math.PI + (t - at('12') - 1.6) / 3 * TAU, Ea = kepler(Mn); const xx = A * (Math.cos(Ea) - E), yy = A * Math.sqrt(1 - E * E) * Math.sin(Ea); ex = OCX + xx * OAU; ey = OCY + yy * OAU * OSQ; rr = Math.hypot(xx, yy); }
  const lit = 1 / (rr * rr); glow(ex, ey, 40 + 14 * lit, '255,250,220', Math.min(.8, .15 * lit));
  K.earth(ex, ey, 34, t, rr < .5 ? 'scared' : 'worried', { rot: t, look: -1 });
  label('YEAR ≈ 4.5 MONTHS', CX, 520, 46, P.gold, t, at('13') + 2.2);
  if (t > at('14') - .2) { const k = ss(seg(t, at('14'), at('14') + .4)); g.save(); g.globalAlpha *= k;
    const fx = OCX - OAU + 60, nx = OCX + .32 * OAU; card(fx + 30, OCY + 150, 230, 110, '#7fd3ff'); text('FAR END', fx + 30, OCY + 138, 30, '#7fd3ff', 1000, null, 0); text('1× light', fx + 30, OCY + 180, 34, P.white, 1000, null, 0);
    card(nx + 120, OCY + 150, 230, 110, '#ffb066'); text('CLOSE END', nx + 120, OCY + 138, 30, '#ffb066', 1000, null, 0); text('10× light', nx + 120, OCY + 180, 34, P.white, 1000, null, 0); g.restore(); }
  label('BRUTAL SEASONS', CX, 1400, 44, '#ffb066', t, at('14') + 2.6);
}
function sBeach(t) {                                               // 15: from the ground, 1.7× wider; the sea boils
  const sky = g.createLinearGradient(0, 0, 0, 1050); sky.addColorStop(0, '#ffffff'); sky.addColorStop(1, '#bfe2ff'); g.fillStyle = sky; g.fillRect(0, 0, W, 1050);
  const sx = CX, sy = 640, rs = 75; glow(sx, sy, 520, '255,255,255', .9);
  const b = ss(seg(t, at('15') + .4, at('15') + 1.4)); dot(sx, sy, lerp(rs, rs * 1.71, b), '#f6fbff'); g.save(); g.strokeStyle = 'rgba(255,170,40,.95)'; g.lineWidth = 6; g.setLineDash([10, 8]); g.beginPath(); g.arc(sx, sy, rs, 0, TAU); g.stroke(); g.restore();
  text('OUR SUN', sx, sy + 8, 26, '#c07a10', 1000, null, 0, 'center', ss(seg(t, at('15') + .2, at('15') + .6)));
  label('1.7× WIDER', sx, sy - 210, 40, '#3f8cff', t, at('15') + 1.4);
  const boil = ss(seg(t, at('15') + 2.4, at('15') + 3.2));
  const sea = g.createLinearGradient(0, 1000, 0, 1450); sea.addColorStop(0, '#3fa6d8'); sea.addColorStop(1, '#2a7fb8'); g.fillStyle = sea; g.fillRect(0, 1000, W, 450);
  const R = mulberry(8); for (let i = 0; i < 40 * boil; i++) { const x = R() * W, y0 = 1020 + R() * 420, ph = (t * 1.5 + R()) % 1; g.strokeStyle = `rgba(255,255,255,${.7 * (1 - ph)})`; g.lineWidth = 3; g.beginPath(); g.arc(x, y0 - ph * 30, 5 + R() * 10 + ph * 6, 0, TAU); g.stroke(); }
  g.fillStyle = '#f2d49a'; g.fillRect(0, 1440, W, H - 1440);
  for (let i = 0; i < 9; i++) { const x = 60 + i * 120, ph = (t * .6 + i * .37) % 1; g.save(); g.globalAlpha *= .5 * (1 - ph) * boil; g.strokeStyle = '#fff'; g.lineWidth = 16; g.lineCap = 'round'; g.beginPath(); g.moveTo(x, 1000 - ph * 400); g.bezierCurveTo(x + 40, 920 - ph * 400, x - 40, 860 - ph * 400, x, 780 - ph * 400); g.stroke(); g.restore(); }
  thermo(CX, 1240, '100°C+', '#ff7a52', pop(t, at('15') + 2.6));
}
function sJupiter(t) {                                             // 16–17: Jupiter warms up; Europa's ice cracks
  K.bg(t); glow(-100, 500, 900, '200,225,255', .35);
  planet('jupiter', 380, 820, 230, t, 'happy', 1, mouthOf('jupiter', t));
  g.save(); g.translate(380, 820); const r = 230; g.fillStyle = '#16122e'; for (const s of [-1, 1]) { g.beginPath(); g.ellipse(s * r * .3, -r * .05, r * .2, r * .13, 0, 0, TAU); g.fill(); } g.fillRect(-r * .12, -r * .09, r * .24, r * .05); g.restore();
  const ex = 820, ey = 1180, er = 120; glow(ex, ey, er * 1.5, '230,240,255', .25); dot(ex, ey, er, '#efe6d4');
  g.save(); g.beginPath(); g.arc(ex, ey, er, 0, TAU); g.clip(); const melt = ss(seg(t, at('17'), at('17') + 1.2));
  const R = mulberry(12); for (let i = 0; i < 9; i++) { const x0 = ex + (R() * 2 - 1) * er, y0 = ey + (R() * 2 - 1) * er; g.strokeStyle = melt > 0 ? `rgb(${lerp(168, 60, melt)},${lerp(110, 170, melt)},${lerp(80, 240, melt)})` : '#a86e50'; g.lineWidth = 5 + 10 * melt; g.beginPath(); g.moveTo(x0, y0); g.quadraticCurveTo(x0 + 40, y0 + 30, x0 + 90 * (R() - .3), y0 + 90 * (R() - .2)); g.stroke(); }
  g.fillStyle = 'rgba(30,20,60,.3)'; g.beginPath(); g.arc(ex + er * .35, ey + er * .1, er * 1.1, 0, TAU); g.arc(ex - er * .15, ey - er * .08, er * 1.02, 0, TAU, true); g.fill('evenodd'); g.restore();
  text('EUROPA', ex, ey + er + 50, 34, '#efe6d4', 1000, P.navy, 8);
  label('ICE → WATER?', ex, ey - er - 60, 36, '#7fd3ff', t, at('17') + .8);
}
// Betelgeuse wide view: 18 grows, 19 inner orbits inside, 20 zoom out, the outer planets fall in on long ovals
const ORB = [['mercury', .39, 2.2], ['venus', .72, -2.4], ['earth', 1, .7], ['mars', 1.52, -.6], ['jupiter', 5.2, 2.6], ['saturn', 9.58, -1.2], ['uranus', 19.2, 1.0], ['neptune', 30.07, -2.7]];
function sBetel(t) {
  K.bg(t); const cx = CX, cy = 1000, sq = .38;
  const zo = ss(seg(t, at('20') - .1, at('20') + 1.6)), au = lerp(150, 14, zo);
  const R = lerp(.05, 3.55, ss(seg(t, at('18') - .4, at('18') + 1.2))) * au;
  glow(cx, cy, R * 1.6, '255,80,50', .55);
  star('betelgeuse', cx, cy, R, t, 'sleepy', mouthOf('betelgeuse', t), 1 - ss(seg(t, at('19') - .3, at('19') + .3)));
  const ra = ss(seg(t, at('19') - .2, at('19') + .4));
  for (const [w, d, ang] of ORB) {
    const rr = d * au; if (rr > 700) continue; const outer = d > 2;
    if (!outer && ra <= 0) continue; if (outer && zo < .3) continue;
    g.save(); g.globalAlpha *= outer ? ss(seg(zo, .3, .7)) : ra; g.strokeStyle = 'rgba(255,255,255,.7)'; g.lineWidth = 3; g.setLineDash([8, 8]); g.beginPath(); g.ellipse(cx, cy, rr, rr * sq, 0, 0, TAU); g.stroke(); g.setLineDash([]);
    // outer planets fall inward along a long oval (closest point ~3% of the distance) once the zoom-out lands
    let px = cx + Math.cos(ang) * rr, py = cy + Math.sin(ang) * rr * sq;
    if (outer) { const f = ss(seg(t, at('20') + 1.6, at('22'))); const q = .03 * rr; const k = f; const ux = Math.cos(ang), uy = Math.sin(ang) * sq; const mx = cx + ux * lerp(rr, q, k) + -uy * Math.sin(k * Math.PI) * rr * .25, my = cy + uy * lerp(rr, q, k) + ux * Math.sin(k * Math.PI) * rr * .25; px = mx; py = my;
      g.strokeStyle = 'rgba(255,190,120,.6)'; g.lineWidth = 3; g.setLineDash([6, 10]); g.beginPath(); for (let s = 0; s <= 1.001; s += .05) { const x = cx + ux * lerp(rr, q, s) - uy * Math.sin(s * Math.PI) * rr * .25, y = cy + uy * lerp(rr, q, s) + ux * Math.sin(s * Math.PI) * rr * .25; s === 0 ? g.moveTo(x, y) : g.lineTo(x, y); } g.stroke(); g.setLineDash([]); }
    const inside = Math.hypot((px - cx), (py - cy) / sq) < R;
    if (!(outer && inside)) planet(w, px, py, outer ? 16 : (w === 'earth' ? 12 : 9), t, null);
    if ((w === 'earth' || w === 'mars') && zo < .2) text(w.toUpperCase(), px + 40, py + (w === 'earth' ? 46 : -20), 34, P.white, 1000, P.navy, 10, 'center', ra);
    if (outer && zo > .7) text(w.toUpperCase(), px, py - 30, 28, P.white, 1000, P.navy, 8, 'center', ss(seg(zo, .7, 1)) * clamp((Math.hypot(px - cx, (py - cy) / sq) - 170) / 80));
    g.restore();
  }
  label('~18 SUNS · ~750× WIDER', CX, 520, 40, '#ff7a5c', t, at('18') + .2);
  if (t > at('19') + .6 && zo < .3) label('ALL INSIDE THE STAR', CX, 1420, 40, P.gold, t, at('19') + .8);
  if (zo > .6) label('EVEN NEPTUNE FALLS IN', CX, 1420, 40, P.gold, t, at('20') + 1.8);
}
function sNeptune(t) {                                             // 21: Neptune panics, sliding toward the red glow
  K.bg(t); glow(-200, 900, 900, '255,70,40', .5);
  const s = (t - at('21') + .3) * 30; planet('neptune', 640 - s, 960, 220, t, 'scared', -1, mouthOf('neptune', t));
  g.save(); g.globalAlpha *= .6; g.strokeStyle = '#fff'; g.lineWidth = 6; g.lineCap = 'round'; for (let k = 0; k < 4; k++) { const y = 860 + k * 70; g.beginPath(); g.moveTo(900 - s, y); g.lineTo(980 - s, y); g.stroke(); } g.restore();
  drop(860 - s, 760, 1.4); label('30× FARTHER THAN EARTH', CX, 1380, 40, '#9fb6ff', t, at('21') + .5);
}
function sNepSky(t) {                                              // 22: from Neptune, a red sun 25× wider than ours
  const sky = g.createLinearGradient(0, 0, 0, 1400); sky.addColorStop(0, '#0a0c2a'); sky.addColorStop(1, '#2a1238'); g.fillStyle = sky; g.fillRect(0, 0, W, 1400);
  const sr = 13, cx = CX, cy = 860, R = sr * 25; const k = ss(seg(t, at('22') + .3, at('22') + 1.3));
  glow(cx, cy, R * 1.5 * k + 1, '255,80,50', .55); star('betelgeuse', cx, cy, Math.max(1, R * k), t, null);
  // our Sun for scale, then a row of 25 suns across the diameter
  K.sunBody(170, 470, sr, t); text('OUR SUN FROM EARTH', 170, 520, 22, P.gold, 1000, P.navy, 6);
  const n = Math.floor(clamp((t - at('22') - 1.6) / 1.4) * 25); for (let i = 0; i < n; i++) dot(cx - R + sr + i * 2 * sr, cy, sr * .9, P.sun);
  if (n >= 25) label('25 SUNS WIDE', cx, cy - R - 60, 40, P.gold, t, at('22') + 3.1);
  const cl = g.createLinearGradient(0, 1300, 0, H); cl.addColorStop(0, '#3f6fe8'); cl.addColorStop(1, '#1d3a9a'); g.fillStyle = cl; g.beginPath(); g.moveTo(0, 1320); for (let x = 0; x <= W; x += 40) g.lineTo(x, 1320 + Math.sin(x * .01 + t) * 16); g.lineTo(W, H); g.lineTo(0, H); g.fill();
  text("NEPTUNE'S CLOUD TOPS", CX, 1395, 26, '#cfe0ff', 1000, P.navy, 6);
}
function sEnd(t) {                                                 // 23–25: the Sun returns; recap; the hug
  K.bg(t);
  const back = ss(seg(t, at('23') - .5, at('23') + .2)), hug = ss(seg(t, at('25') - .1, at('25') + .5));
  g.save(); g.strokeStyle = `rgba(255,${200 - 20 * hug},120,${.4 + .4 * hug})`; g.lineWidth = 4 + 3 * hug; g.setLineDash([16, 14]); g.beginPath(); g.ellipse(CX, 900, 430, 150, 0, 0, TAU); g.stroke(); g.restore();
  const sx = CX - 900 * (1 - back), ex = lerp(EARTH_STAGE.x, CX + 240, hug), ey = lerp(EARTH_STAGE.y, 900, hug);
  K.sunChar(sx, 860, 150, t, { mood: hug > .5 ? 'love' : 'smug', shades: hug > .5 ? -1 : 0, mug: 1 }); g.save(); g.translate(sx, 860); openMouth(150, mouthOf('sun', t), .3); g.restore();
  planet('earth', ex, ey, EARTH_STAGE.r, t, hug > .5 ? 'love' : 'keen', -1, mouthOf('earth', t));
  if (hug > 0) for (let i = 0; i < 5; i++) { const u = ((t - at('25')) * .7 + i * .2) % 1; heart(CX + 100 + Math.sin(i * 2.3) * 160, 700 - u * 260, 22 + i * 3, (1 - u) * hug); }
  // recap cards (24)
  const ra = fadeIO(t, at('24') - .1, at('25') + .1, .2);
  if (ra > 0) { const R = [['proxima', 'TOO LIGHT', at('24') + .3], ['siriusa', 'TOO HEAVY\n+ BRIGHT', at('24') + 1.2], ['betelgeuse', 'TOO BIG', at('24') + 2.6]];
    g.save(); g.globalAlpha *= ra; g.fillStyle = 'rgba(5,4,20,.55)'; g.fillRect(0, 0, W, H);
    R.forEach(([k, s, t0], i) => { const kk = pop(t, t0); if (kk <= 0) return; const x = 200 + i * 340, y = 960; g.save(); g.translate(x, y); g.scale(kk, kk); card(0, 0, 300, 380, TAG[k]); star(k, 0, -60, k === 'betelgeuse' ? 95 : k === 'siriusa' ? 80 : 55, t, 'worried'); const ls = s.split('\n'); ls.forEach((l, j) => text(l, 0, 120 + j * 44 - (ls.length - 1) * 20, 38, TAG[k], 1000, null, 0)); g.restore(); });
    g.restore(); }
  const ca = pop(t, at('25') + .9, .4); if (ca > 0) { g.save(); g.translate(CX, 500); g.scale(ca, ca); card(0, 0, 860, 140, P.gold); text('Which star should', 0, -8, 48, P.white, 1000, null, 0); text('we try next? ↓', 0, 48, 48, P.gold, 1000, null, 0); g.restore(); }
  if (t > at('25') + .1) text('JUST RIGHT', CX, 1270, 64, P.gold, 1000, P.navy, 14, 'center', ss(seg(t, at('25') + .1, at('25') + .5)));
}
const SC = [
  [0, sIntro], [at('02') - .25, sRules], [at('03') - .45, sProxima], [at('05') - .25, sDrift], [at('08') - .3, sGroundP], [at('10') - .25, sWarm],
  [at('11') - .5, sSirius], [at('12') - .25, sOrbit], [at('15') - .3, sBeach], [at('16') - .3, sJupiter], [at('18') - .5, sBetel], [at('21') - .25, sNeptune], [at('22') - .2, sNepSky], [at('23') - .5, sEnd],
];
const XF = .35;

// ───────── HUD: pinned title, which star, and the four checks
const CHIPS = ['ORBIT', 'SKY', 'GROUND', 'PLANETS'];
const SECT = [
  { k: 'proxima', n: 'PROXIMA', t0: at('03') - .45, t1: at('11') - .5, on: { ORBIT: at('04'), PLANETS: at('06'), SKY: at('08'), GROUND: at('09') } },
  { k: 'siriusa', n: 'SIRIUS A', t0: at('11') - .5, t1: at('18') - .5, on: { ORBIT: at('12'), SKY: at('15'), GROUND: at('15') + 2.4, PLANETS: at('16') } },
  { k: 'betelgeuse', n: 'BETELGEUSE', t0: at('18') - .5, t1: at('23') - .5, on: { ORBIT: at('19'), PLANETS: at('20'), SKY: at('22') }, x: { GROUND: at('19') + 1.2 } },
];
function hud(t) {
  g.fillStyle = 'rgba(8,6,30,.62)'; g.fillRect(0, 0, W, 380);
  text('WHAT IF ANOTHER STAR', CX, 120, 64, P.white, 1000, P.navy, 14);
  text('REPLACED THE SUN?', CX, 210, 80, P.gold, 1000, P.navy, 16);
  const s = SECT.findIndex(S => t >= S.t0 && t < S.t1);
  if (s < 0) { text(t < SECT[0].t0 ? 'THE RULES' : 'THE VERDICT', CX, 310, 38, '#d9d4ff', 1000, null, 0); return; }
  const S = SECT[s], k = pop(t, S.t0, .4);
  g.save(); g.translate(CX, 290); g.scale(Math.max(.01, k), Math.max(.01, k)); text(`STAR ${s + 1}/3 · ${S.n}`, 0, 0, 38, TAG[S.k], 1000, P.navy, 10); g.restore();
  CHIPS.forEach((c, i) => {
    const x = 165 + i * 250, y = 345, on = S.on[c] && t >= S.on[c], xd = S.x && S.x[c] && t >= S.x[c];
    g.font = '1000 26px NU'; const w = 200; g.fillStyle = on ? TAG[S.k] : xd ? 'rgba(255,77,109,.35)' : 'rgba(255,255,255,.1)'; g.beginPath(); g.roundRect(x - w / 2, y - 22, w, 44, 22); g.fill();
    const kk = on ? pop(t, S.on[c], .3) : 1; g.save(); g.translate(x, y + 9); g.scale(kk, kk); text((on ? '✓ ' : xd ? '✗ ' : '') + c, 0, 0, 26, on ? P.navy : xd ? '#ffb3c0' : 'rgba(255,255,255,.45)', 1000, null, 0); g.restore();
  });
}
function captions(t) {
  const l = TL.lines.find(l => t >= l.t - .05 && t < l.t + l.d + .35); if (!l) return;
  const k = pop(t, l.t - .05, .25), a = 1 - ss(seg(t, l.t + l.d + .2, l.t + l.d + .35));
  g.save(); g.globalAlpha = a; g.translate(CX, 1580); const s = .92 + .08 * Math.min(1, k); g.scale(s, s);
  g.font = '1000 34px NU'; const tw = g.measureText(NAME[l.who]).width + 50;
  g.fillStyle = TAG[l.who]; g.beginPath(); g.roundRect(-tw / 2, -100, tw, 52, 26); g.fill(); text(NAME[l.who], 0, -62, 34, P.navy, 1000, null, 0);
  const KEYW = /^(instant|eighth|hold|drifting|year|seasons\.?|shrinking\.?|freezing\.?|seventy\.?|volcanoes|underground\.?|Two|Twenty-five|oval\.?|Mercury|four|half|months\.?|ten|brutal|twice|boil|warm\.?|melt\.?|Mars\.?|inside|eighteen|Neptune|thirty|red|light\.?|heavy|bright\.?|big\.?|right\.?)/i;
  const words = l.text.replace(/\.\.\./g, '…').split(' '); g.font = '1000 60px NU';
  const rows = [[]]; let rw = 0; for (const w of words) { const ww = g.measureText(w + ' ').width; if (rw + ww > 940 && rows[rows.length - 1].length) { rows.push([]); rw = 0; } rows[rows.length - 1].push([w, ww]); rw += ww; }
  const bw = Math.max(...rows.map(r => r.reduce((p, w) => p + w[1], 0))) + 60; g.fillStyle = 'rgba(10,8,36,.66)'; g.beginPath(); g.roundRect(-bw / 2, -34, bw, rows.length * 74 + 38, 30); g.fill();
  rows.forEach((row, ri) => { let x = -row.reduce((p, w) => p + w[1], 0) / 2; for (const [w, ww] of row) { text(w, x, 26 + ri * 74, 60, KEYW.test(w) ? P.gold : P.white, 1000, P.navy, 13, 'left'); x += ww; } });
  g.restore();
}

// ───────── frame
function render(t) {
  use(G0); g.setTransform(1, 0, 0, 1, 0, 0); g.globalAlpha = 1;
  let i = 0; while (i < SC.length - 1 && t >= SC[i + 1][0]) i++;
  const u = clamp((t - SC[i][0]) / XF);
  if (i > 0 && u < 1) {
    SC[i - 1][1](t);
    use(G1); g.setTransform(1, 0, 0, 1, 0, 0); g.globalAlpha = 1; g.clearRect(0, 0, W, H); SC[i][1](t); use(G0);
    g.globalAlpha = ss(u); g.drawImage(off, 0, 0); g.globalAlpha = 1;
  } else SC[i][1](t);
  g.setTransform(1, 0, 0, 1, 0, 0); g.globalAlpha = 1;
  hud(t); captions(t);
  const fo = seg(t, DUR - .5, DUR); if (fo > 0) { g.fillStyle = `rgba(0,0,0,${fo})`; g.fillRect(0, 0, W, H); }
}

// ───────── thumbnail (?thumb=1)
function thumb() {
  use(G0); g.setTransform(1, 0, 0, 1, 0, 0); K.bg(2);
  star('betelgeuse', 760, 1050, 520, 1, 'smug', 0);
  planet('earth', 250, 1150, 120, 1.2, 'scared', 1, .9); drop(345, 1035); drop(150, 1060);
  K.sunChar(170, 760, 90, 1, { mood: 'worried' }); text('me??', 170, 640, 40, P.white, 1000, P.navy, 10);
  text('WHAT IF THIS', CX, 230, 110, P.white, 1000, P.navy, 20);
  text('REPLACED', CX, 360, 118, P.white, 1000, P.navy, 20);
  text('OUR SUN?!', CX, 500, 140, P.gold, 1000, P.navy, 24);
  g.save(); g.translate(CX + 120, 1480); g.rotate(-.05); g.fillStyle = P.gold; g.beginPath(); g.roundRect(-300, -66, 600, 132, 66); g.fill(); text('PAST MARS', 0, 26, 76, P.navy, 1000, null, 0); g.restore();
}
const TH = new URLSearchParams(location.search).get('thumb');
window.EV = TL.lines.map(l => ({ type: 'vo', id: l.id, t: l.t })); window.DUR = DUR;
window.SUBS = TL.lines.map(l => ({ t0: l.t, t1: l.t + l.d + .3, text: `${NAME[l.who]}: ${l.text}` }));
if (TH) { window.render = () => thumb(); thumb(); } else { window.render = render; render(+(new URLSearchParams(location.search).get('t') ?? 1.2)); }
window.READY = true;
