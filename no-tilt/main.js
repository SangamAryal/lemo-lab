// "What If Earth Stood Up Straight?" — four quests (problem → solution → payoff), one narrator (Ryan).
// Earth Rings style: a perspective camera that pans through depth-sorted flat kit art, a crossfade + push-in between scenes,
// and word-pop subtitles on real spoken timing. 1080×1920, deterministic in t. ?thumb=1 draws the thumbnail.
import * as K from './kit.js';
import { clamp, lerp, seg, ss, eio, eo, mulberry, TAU } from '/core/lib.js';
const { P, text, glow } = K;
const W = 1080, H = 1920, CX = W / 2, CY = H / 2;
const main = document.getElementById('c'), G0 = main.getContext('2d');
const off = document.createElement('canvas'); off.width = W; off.height = H; const G1 = off.getContext('2d');
let g = G0; const use = c => { g = c; K.setup(c, W, H); }; use(G0); K.makeStars(120, 31);
await document.fonts.load('900 80px NU'); await document.fonts.load('800 40px NU');
const TL = await (await fetch('timeline.json')).json(), words = await (await fetch('words.json')).json();
const LN = Object.fromEntries(TL.lines.map(l => [l.id, l])), DUR = TL.dur, VO = Object.fromEntries(TL.lines.map(l => [l.id, l.t]));
const A = n => LN['l' + String(n).padStart(2, '0')].t, E = n => { const l = LN['l' + String(n).padStart(2, '0')]; return l.t + l.d; };
const nrm = s => s.toLowerCase().replace(/[^a-z0-9]/g, '');
const at = (n, w, k = 0) => { const id = 'l' + String(n).padStart(2, '0'); let c = 0; for (const x of words[id]) if (nrm(x[0]).startsWith(nrm(w)) && c++ === k) return VO[id] + Math.max(0, x[1]); return VO[id]; };
const dot = (x, y, r, c, a = 1) => { const o = g.globalAlpha; g.globalAlpha = o * a; g.fillStyle = c; g.beginPath(); g.arc(x, y, r, 0, TAU); g.fill(); g.globalAlpha = o; };
const pop = (t, t0, d = .35) => { const u = clamp((t - t0) / d); return u <= 0 ? 0 : 1 + Math.sin(u * Math.PI) * .2 * (1 - u); };
const lt = (t, a, b) => clamp((t - a) / (b - a));
const card = (x, y, w, h, col) => { g.save(); g.translate(x, y); g.fillStyle = 'rgba(12,10,44,.86)'; g.beginPath(); g.roundRect(-w / 2, -h / 2, w, h, Math.min(h / 2, 36)); g.fill(); if (col) { g.strokeStyle = col; g.lineWidth = 5; g.stroke(); } g.restore(); };
const label = (s, x, y, px, col, t, t0) => { const k = pop(t, t0); if (k <= 0) return; g.save(); g.translate(x, y); g.scale(k, k); g.font = `1000 ${px}px NU`; card(0, 0, g.measureText(s).width + px * 1.4, px * 1.9, col); text(s, 0, px * .36, px, col || P.white, 1000, null, 0); g.restore(); };

function stamp(s, col, t, t0, x = CX, y = 1330) { const k = pop(t, t0, .25); if (k <= 0) return; const z = t < t0 + .13 ? 1 + 1.4 * (1 - (t - t0) / .13) : 1; g.save(); g.translate(x, y); g.rotate(-.08); g.scale(z * k, z * k); g.font = '1000 92px NU'; const w = g.measureText(s).width + 90; g.fillStyle = 'rgba(12,10,44,.82)'; g.beginPath(); g.roundRect(-w / 2, -76, w, 152, 20); g.fill(); g.strokeStyle = col; g.lineWidth = 12; g.stroke(); text(s, 0, 33, 92, col, 1000, null, 0); g.restore(); }

// ───────── the 2.5D camera (from Earth Rings)
const v3 = (x, y, z) => ({ x, y, z }), sub = (a, b) => v3(a.x - b.x, a.y - b.y, a.z - b.z), add = (a, b) => v3(a.x + b.x, a.y + b.y, a.z + b.z), d3 = (a, b) => a.x * b.x + a.y * b.y + a.z * b.z, crs = (a, b) => v3(a.y * b.z - a.z * b.y, a.z * b.x - a.x * b.z, a.x * b.y - a.y * b.x), nz = a => { const l = Math.hypot(a.x, a.y, a.z) || 1; return v3(a.x / l, a.y / l, a.z / l); };
let CAM;
function setCam(tgt, dist, az, el, fov = 40) { const pos = add(tgt, v3(dist * Math.cos(el) * Math.sin(az), dist * Math.sin(el), dist * Math.cos(el) * Math.cos(az))); const f = nz(sub(tgt, pos)), r = nz(crs(f, v3(0, 1, 0))), u = crs(r, f); CAM = { pos, f, r, u, F: (H / 2) / Math.tan(fov / 2 * Math.PI / 180), az, el }; }
function pr(p) { const d = sub(p, CAM.pos), z = Math.max(.05, d3(d, CAM.f)); return { x: CX + d3(d, CAM.r) / z * CAM.F, y: CY - d3(d, CAM.u) / z * CAM.F, z, s: CAM.F / z }; }
const world = items => items.map(it => ({ ...it, q: pr(it.p) })).filter(it => it.q.z > .4).sort((a, b) => b.q.z - a.q.z).forEach(it => it.draw(it.q));
const STAR2 = (() => { const R = mulberry(8); return Array.from({ length: 170 }, () => ({ x: R(), y: R(), r: R(), k: R() < .12 })); })();
function space(t) {                                               // stars with parallax, so a camera pan reads
  K.bg(t); const sx = (CAM ? CAM.az : 0) * 900, sy = (CAM ? CAM.el : 0) * 900;
  for (const [i, s] of STAR2.entries()) { const f = i % 2 ? .9 : .45, x = ((s.x * W * 1.6 - sx * f) % (W * 1.6) + W * 1.6) % (W * 1.6) - W * .3, y = ((s.y * H * 1.4 + sy * f) % (H * 1.4) + H * 1.4) % (H * 1.4) - H * .2; if (s.k) K.sparkle(x, y, 8 + s.r * 14, P.spark, .8); else dot(x, y, 1.2 + s.r * 2.6, P.star, .4 + .4 * s.r); }
}

const hex = c => [1, 3, 5].map(i => parseInt(c.slice(i, i + 2), 16));
const mixc = (a, b, k) => { const x = hex(a), y = hex(b); return `rgb(${x.map((v, i) => Math.round(v + (y[i] - v) * clamp(k))).join(',')})`; };
const chip = (s, x, y, px, col) => label(s, x, y, px, col, 1, 0);
const TILT = -.41, AX = '#ffe9a8';

// ───────── ground: sky, parallax hills, a ground plane, depth-sorted trees and people
const PAL = {
  park: { s0: '#7fc4f0', s1: '#e6f6ff', hill: '#7fc08a', g0: '#8fd46a', g1: '#4f9a4a' },
  spring: { s0: '#8fd0f5', s1: '#ffeef2', hill: '#8fcf9a', g0: '#9be07a', g1: '#55a850' },
};
function land(t, pal, mid) {
  const c = PAL[pal], hz = pr(v3(0, 0, -400)).y, gr = g.createLinearGradient(0, 0, 0, hz); gr.addColorStop(0, c.s0); gr.addColorStop(1, c.s1); g.fillStyle = gr; g.fillRect(-100, -100, W + 200, hz + 110);
  if (mid) mid(hz);
  const px = CAM.az * 900; g.fillStyle = c.hill; g.beginPath(); g.moveTo(-100, hz + 4); for (let x = -100; x <= W + 100; x += 40) g.lineTo(x, hz - 50 - Math.abs(Math.sin((x + px * .3) * .006)) * 120 - Math.abs(Math.sin((x + px * .3) * .017)) * 30); g.lineTo(W + 100, hz + 4); g.fill();
  const gg = g.createLinearGradient(0, hz, 0, H); gg.addColorStop(0, c.g0); gg.addColorStop(1, c.g1); g.fillStyle = gg; g.fillRect(-100, hz, W + 200, H - hz + 100);
}
function treeQ(q, k, leaf, o = {}) { const s = q.s / 264 * k; g.save(); g.translate(q.x, q.y); g.scale(s, s);
  g.fillStyle = 'rgba(0,0,0,.14)'; g.beginPath(); g.ellipse(0, 4, 120, 22, 0, 0, TAU); g.fill();
  g.fillStyle = o.trunk || '#7a4a2a'; g.beginPath(); g.roundRect(-17, -200, 34, 208, 10); g.fill();
  g.fillStyle = leaf; for (const [x, y, r] of [[0, -310, 122], [-96, -236, 92], [96, -236, 92], [0, -214, 104]]) { g.beginPath(); g.arc(x, y, r, 0, TAU); g.fill(); }
  g.fillStyle = o.hi || 'rgba(255,255,255,.16)'; for (const [x, y, r] of [[-34, -344, 62], [-104, -256, 42], [70, -262, 40]]) { g.beginPath(); g.arc(x, y, r, 0, TAU); g.fill(); }
  g.restore(); }
const TREES = [[-5, -5, 1.5], [4.6, -3, 1.7], [-8.5, -9, 1.4], [8, -8, 1.5], [-2.5, -11, 1.3], [11, -2, 1.6], [-11.5, -1, 1.6], [1.5, -7, 1.2]];
const trees = (leaf, o) => TREES.map(([x, z, k], i) => ({ p: v3(x, 0, z), draw: q => treeQ(q, k, Array.isArray(leaf) ? leaf[i % leaf.length] : leaf, o) }));
const SKIN = '#c98d64';
function person(x, y, s, shirt = '#4f7dff') { g.save(); g.translate(x, y); g.scale(s, s); g.fillStyle = '#2d2f5e'; g.fillRect(-16, 0, 13, 70); g.fillRect(3, 0, 13, 70); g.fillStyle = shirt; g.beginPath(); g.roundRect(-26, -78, 52, 84, 18); g.fill(); g.fillStyle = SKIN; g.beginPath(); g.arc(0, -104, 28, 0, TAU); g.fill(); g.fillStyle = '#2b2140'; g.beginPath(); g.arc(0, -112, 28, Math.PI, TAU); g.fill(); dot(10, -102, 3.5, P.navy); dot(20, -102, 3.5, P.navy); g.strokeStyle = SKIN; g.lineWidth = 11; g.lineCap = 'round'; g.beginPath(); g.moveTo(-26, -60); g.lineTo(-34, -10); g.moveTo(26, -60); g.lineTo(38, -14); g.stroke(); g.restore(); }
const personQ = (q, k = 2.6, shirt) => { const s = q.s / 264 * k; person(q.x, q.y - 70 * s, s, shirt); };
function bird(x, y, s, t, col = '#4a4f6a', ph = 0) { g.save(); g.translate(x, y + Math.sin(t * 3 + ph) * 2); g.scale(s, s); g.strokeStyle = '#e08a6a'; g.lineWidth = 5; g.beginPath(); g.moveTo(-8, 30); g.lineTo(-8, 46); g.moveTo(8, 30); g.lineTo(8, 46); g.stroke();
  g.fillStyle = col; g.beginPath(); g.ellipse(0, 6, 36, 30, 0, 0, TAU); g.fill(); g.beginPath(); g.moveTo(-30, 0); g.lineTo(-64, 20); g.lineTo(-26, 24); g.fill(); g.beginPath(); g.arc(26, -26, 21, 0, TAU); g.fill();
  g.fillStyle = '#ffb040'; g.beginPath(); g.moveTo(44, -30); g.lineTo(62, -24); g.lineTo(44, -18); g.fill(); dot(32, -30, 4.5, '#fff'); dot(33, -30, 2.4, P.navy); g.fillStyle = 'rgba(255,255,255,.2)'; g.beginPath(); g.ellipse(-2, 10, 20, 15, .3, 0, TAU); g.fill(); g.restore(); }
function cloud(x, y, s, col = '#fff', a = 1) { g.save(); g.globalAlpha *= a; g.translate(x, y); g.scale(s, s); g.fillStyle = col; for (const [cx, cy, r] of [[-80, 10, 50], [-30, -24, 64], [40, -16, 58], [92, 12, 46]]) { g.beginPath(); g.arc(cx, cy, r, 0, TAU); g.fill(); } g.beginPath(); g.roundRect(-128, 6, 266, 56, 28); g.fill(); g.restore(); }
function rain(t, a, x0 = -50, x1 = W + 50, y0 = 380, y1 = 1900, n = 110) { if (a <= 0) return; const R = mulberry(4); g.save(); g.globalAlpha *= a; g.strokeStyle = 'rgba(200,225,255,.75)'; g.lineWidth = 4; g.lineCap = 'round'; g.beginPath(); for (let i = 0; i < n; i++) { const x = x0 + R() * (x1 - x0), y = y0 + ((R() * (y1 - y0) + t * (900 + R() * 500)) % (y1 - y0)); g.moveTo(x, y); g.lineTo(x - 10, y + 44); } g.stroke(); g.restore(); }

// ───────── Earth with its axis pole. tilt < 0 leans the north pole to the left.
function axisEarth(x, y, R, t, tilt, mood, o = {}) {
  g.save(); g.translate(x, y); if (o.flip) g.scale(-1, 1); g.rotate(o.flip ? -tilt : tilt);
  g.strokeStyle = AX; g.lineWidth = Math.max(5, R * .05); g.lineCap = 'round'; g.beginPath(); g.moveTo(0, -R * 1.42); g.lineTo(0, R * 1.42); g.stroke();
  K.earth(0, 0, R, t, mood, o); if (o.over) o.over(R);
  g.strokeStyle = AX; g.beginPath(); g.moveTo(0, -R * 1.42); g.lineTo(0, -R * .99); g.stroke(); dot(0, -R * 1.42, Math.max(6, R * .06), AX);
  g.restore();
}
const springy = u => u <= 0 ? 0 : u >= 1 ? 1 : 1 + Math.sin(u * Math.PI * 2.5) * .28 * (1 - u) - (1 - u) ** 3;
function ghostAxis(x, y, R, tilt, a = .7) { g.save(); g.globalAlpha *= a; g.translate(x, y); g.rotate(tilt); g.strokeStyle = '#ffffff'; g.lineWidth = 5; g.setLineDash([16, 14]); g.beginPath(); g.moveTo(0, -R * 1.42); g.lineTo(0, R * 1.42); g.stroke(); g.setLineDash([]); g.restore(); }
// ice caps, drawn inside Earth's disc (call from axisEarth's o.over)
const caps = k => R => { g.save(); g.beginPath(); g.arc(0, 0, R, 0, TAU); g.clip(); g.fillStyle = '#f4faff'; for (const s of [-1, 1]) { g.beginPath(); g.ellipse(0, s * R * 1.02, R * (.5 + .75 * k), R * (.14 + .5 * k), 0, 0, TAU); g.fill(); } g.fillStyle = 'rgba(20,30,90,.2)'; g.beginPath(); g.arc(R * .35, R * .1, R * 1.1, 0, TAU); g.arc(-R * .15, -R * .08, R * 1.02, 0, TAU, true); g.fill('evenodd'); g.restore(); };
function youngEarth(x, y, R, t, tilt, mood, a = 1) { if (a <= 0) return; g.save(); g.globalAlpha *= a; g.translate(x, y); g.rotate(tilt);
  g.strokeStyle = AX; g.lineWidth = Math.max(5, R * .05); g.lineCap = 'round'; g.beginPath(); g.moveTo(0, -R * 1.42); g.lineTo(0, R * 1.42); g.stroke(); dot(0, -R * 1.42, Math.max(6, R * .06), AX);
  glow(0, 0, R * 1.5, '255,120,60', .32); g.save(); g.beginPath(); g.arc(0, 0, R, 0, TAU); g.clip(); g.fillStyle = '#b8502e'; g.fillRect(-R, -R, 2 * R, 2 * R);
  const Rn = mulberry(5); for (let i = 0; i < 12; i++) { g.fillStyle = i % 3 ? '#8a3420' : '#ffb040'; g.beginPath(); g.ellipse((Rn() * 2 - 1) * R * .8, (Rn() * 2 - 1) * R * .8, R * (.08 + Rn() * .16), R * (.05 + Rn() * .1), Rn() * 3, 0, TAU); g.fill(); }
  g.fillStyle = 'rgba(60,10,20,.3)'; g.beginPath(); g.arc(R * .35, R * .1, R * 1.1, 0, TAU); g.arc(-R * .15, -R * .08, R * 1.02, 0, TAU, true); g.fill('evenodd'); g.restore(); K.face(R, mood, t, 0, .7); g.restore(); }

// ───────── scenes
// hook: Earth leaning, then standing straight; the plate empties
function plate(x, y, s, k) { g.save(); g.translate(x, y); g.scale(s, s); g.fillStyle = 'rgba(0,0,0,.25)'; g.beginPath(); g.ellipse(0, 26, 210, 50, 0, 0, TAU); g.fill(); g.fillStyle = '#f4f1ea'; g.beginPath(); g.ellipse(0, 0, 210, 70, 0, 0, TAU); g.fill(); g.fillStyle = '#dcd6c8'; g.beginPath(); g.ellipse(0, 2, 150, 46, 0, 0, TAU); g.fill();
  if (k > 0) { g.save(); g.scale(k, k); g.fillStyle = '#fffaf0'; g.beginPath(); g.ellipse(-70, -34, 70, 46, 0, Math.PI, TAU); g.fill(); g.fillStyle = '#d99a4a'; g.beginPath(); g.roundRect(-10, -70, 120, 62, 26); g.fill(); g.fillStyle = '#ff4d6d'; g.beginPath(); g.arc(34, -10, 34, 0, TAU); g.fill(); g.strokeStyle = '#5a3418'; g.lineWidth = 6; g.beginPath(); g.moveTo(34, -44); g.lineTo(40, -60); g.stroke(); g.fillStyle = '#5fcf7a'; g.beginPath(); g.ellipse(-104, -6, 34, 20, -.4, 0, TAU); g.fill(); g.restore(); }
  g.restore(); }
function s01(t) { const u = lt(t, 0, A(2)); setCam(v3(0, 0, 0), 9, lerp(.25, -.15, u), .08); space(t);
  const st = at(1, 'stood'), k = springy(lt(t, st, st + .9)), fd = at(1, 'food'), gone = lt(t, fd, fd + .35);
  if (k > 0) ghostAxis(CX, 800, 300, TILT, .5 * Math.min(1, k));
  axisEarth(CX, 800, 300, t, TILT * (1 - k), t < st ? 'happy' : t < fd ? 'keen' : 'worried', { rot: .8 + t * .12 });
  if (t < st) label('TILTED 23°', CX, 300, 48, P.gold, t, at(1, 'leaning')); else label('TILT 0°', CX, 300, 48, '#7fd3ff', t, st + .25);
  const pk = pop(t, at(1, "you'd") - .1); if (pk > 0) { plate(CX, 1330, .9 * Math.min(1.05, pk), 1 - eo(gone)); if (gone >= 1) { text('?', CX, 1345, 110, P.red, 1000, P.navy, 14, 'center', Math.min(1, pop(t, fd + .35))); } } }
// Q1 — why is summer hot? a beach
function s02(t) { const u = lt(t, A(2) - .3, E(2) + .3), px = lerp(-40, 40, u); const sk = g.createLinearGradient(0, 0, 0, 1100); sk.addColorStop(0, '#4fb0f0'); sk.addColorStop(1, '#ffe9b8'); g.fillStyle = sk; g.fillRect(-100, -100, W + 200, 1300);
  K.sunBody(800 - px * .2, 520, 120, t, { glow: 1.2 }); glow(800 - px * .2, 520, 700, '255,170,60', .28 + .06 * Math.sin(t * 3));
  g.fillStyle = '#2f8fd8'; g.fillRect(-100, 1040, W + 200, 240); g.strokeStyle = 'rgba(255,255,255,.6)'; g.lineWidth = 7; g.lineCap = 'round'; for (let i = 0; i < 9; i++) { const y = 1070 + (i % 3) * 56, x = ((i * 260 + t * 40 * (1 + i % 2) - px) % (W + 300)) - 150; g.beginPath(); g.moveTo(x, y); g.quadraticCurveTo(x + 40, y - 14, x + 80, y); g.stroke(); }
  g.fillStyle = '#f2d490'; g.beginPath(); g.moveTo(-100, 1230); g.quadraticCurveTo(CX - px, 1170, W + 100, 1250); g.lineTo(W + 100, H + 100); g.lineTo(-100, H + 100); g.fill(); g.fillStyle = '#e6c276'; g.fillRect(-100, 1500, W + 200, 500);
  g.save(); g.translate(720 - px, 1420); g.strokeStyle = '#8a5a3a'; g.lineWidth = 14; g.beginPath(); g.moveTo(0, 0); g.lineTo(-40, -420); g.stroke(); g.translate(-40, -420); g.rotate(-.1); for (let i = 0; i < 6; i++) { g.fillStyle = i % 2 ? '#fff' : P.red; g.beginPath(); g.moveTo(0, -20); g.arc(0, 40, 250, Math.PI + i * Math.PI / 6, Math.PI + (i + 1) * Math.PI / 6); g.fill(); } g.restore();
  g.fillStyle = '#3fb0c8'; g.beginPath(); g.roundRect(160 - px, 1470, 330, 60, 20); g.fill();
  person(330 - px, 1330, 2.5, '#ffb040'); const sw = (t * .9) % 1; g.fillStyle = '#7fd3ff'; g.beginPath(); g.ellipse(418 - px, 1060 + sw * 60, 9, 14, 0, 0, TAU); g.globalAlpha = 1 - sw; g.fill(); g.globalAlpha = 1;
  const cl = at(2, 'Most'); if (t < cl) label('WHY IS SUMMER HOT?', CX, 300, 50, P.gold, t, at(2, 'Why')); else label('"WE GET CLOSER TO THE SUN"', CX, 300, 40, P.white, t, cl + .1); }
// the orbit, seen from above: closest in January
function s03(t) { const u = lt(t, A(3) - .3, E(3) + .3); setCam(v3(0, 0, 0), 9, lerp(-.2, .2, u), .1); space(t);
  const sx = CX - 70, cy = 840, rx = 400, ry = 320, cj = at(3, 'January'), a = lerp(.9, Math.PI, eio(lt(t, A(3) - .3, cj))) + Math.max(0, t - cj) * .04;
  g.strokeStyle = 'rgba(255,255,255,.3)'; g.lineWidth = 5; g.setLineDash([14, 14]); g.beginPath(); g.ellipse(CX, cy, rx, ry, 0, 0, TAU); g.stroke(); g.setLineDash([]);
  K.sunChar(sx, cy, 92, t, {}); const ex = CX + Math.cos(a) * rx, ey = cy - Math.sin(a) * ry * .98;
  const far = pop(t, at(3, 'northern')); if (far > 0) { g.save(); g.globalAlpha = .5; K.earth(CX + rx, cy, 44, t, 'happy', { noFace: true }); g.restore(); text('JULY: FARTHEST', CX + rx - 130, cy + 110, 32, '#b9c4ff', 900, P.navy, 8); text('152 million km', CX + rx - 130, cy + 152, 30, '#b9c4ff', 800, P.navy, 8); }
  const k = pop(t, cj); if (k > 0) { g.strokeStyle = P.gold; g.lineWidth = 6; g.beginPath(); g.moveTo(sx - 100, cy); g.lineTo(ex + 70, ey); g.stroke(); text('JANUARY: CLOSEST', 250, cy + 130, 36, P.gold, 1000, P.navy, 10); text('147 million km', 250, cy + 176, 32, P.white, 800, P.navy, 8); }
  K.earth(ex, ey, 60, t, k > 0 ? 'scared' : 'happy', { rot: t * .5 }); const sn = at(3, 'winter');
  if (t > sn - .4) { const R = mulberry(3); for (let i = 0; i < 26; i++) { const x = ex - 150 + R() * 300, y = ey - 260 + ((R() * 240 + t * 60) % 240); dot(x, y, 4 + R() * 4, '#fff', .9 * lt(t, sn - .4, sn)); } }
  if (t < sn + .3) label('NOT TO SCALE', CX, 300, 32, '#b9c4ff', t, A(3)); stamp('CLOSEST IN WINTER', P.red, t, sn + .3, CX, 330); }
// the lean: half the year your half leans in, half the year it leans away
function s04(t) { const u = lt(t, A(4) - .3, E(4) + .3); setCam(v3(0, 0, 0), 9, lerp(.25, -.25, u), .08); space(t);
  const so = at(4, 'So'), m = eio(lt(t, so - .1, so + .8)), oh = at(4, 'other'), k2 = pop(t, oh - .1), li = at(4, 'leans');
  const ex = lerp(CX, 850, m), ey = lerp(820, 760, m), R = lerp(300, 150, m);
  if (m > 0) { g.save(); g.globalAlpha = m; K.sunChar(CX, 760, 118, t, {}); g.restore(); if (t > li) { g.strokeStyle = `rgba(255,220,110,${.6 * lt(t, li, li + .4)})`; g.lineWidth = 8; g.setLineDash([22, 16]); g.lineDashOffset = -t * 60; for (const dy of [-70, -20]) { g.beginPath(); g.moveTo(CX + 140, 760 + dy * .5); g.lineTo(850 - 150, 760 + dy); g.stroke(); } g.setLineDash([]); } }
  if (k2 > 0) { g.save(); g.translate(230, 760); g.scale(Math.min(1, k2), Math.min(1, k2)); axisEarth(0, 0, 150, t, TILT, 'sleepy', { flip: 1, rot: 2 }); dot(22, -84, 13, P.red); g.restore(); text('DECEMBER', 230, 1040, 40, P.white, 1000, P.navy, 10); text('LEANS AWAY', 230, 1100, 36, '#7fd3ff', 900, P.navy, 10); if (t > at(4, 'away')) stamp('WINTER', '#7fd3ff', t, at(4, 'away'), 250, 1240); }
  if (t > li && m >= 1) glow(ex - 60, ey - 80, 150, '255,220,110', .5 * lt(t, li, li + .4));
  axisEarth(ex, ey, R, t, TILT, m < 1 ? 'happy' : 'love', { rot: 1.2 }); if (m >= 1) { const c = Math.cos(TILT), s = Math.sin(TILT), lx = -R * .1, ly = -R * .56; dot(ex + lx * c - ly * s, ey + lx * s + ly * c, 13, P.red); }
  if (m <= 0) { const dg = at(4, '23'); if (t > dg) { g.strokeStyle = P.gold; g.lineWidth = 8; g.beginPath(); g.arc(CX, 820, 470, -Math.PI / 2 + TILT, -Math.PI / 2); g.stroke(); ghostAxis(CX, 820, 300, 0, .5); } label(t > dg ? 'TILTED 23°' : 'THE LEAN', CX, 270, 50, P.gold, t, t > dg ? dg : at(4, 'lean')); }
  if (m >= 1) { text('JUNE', 850, 1040, 40, P.white, 1000, P.navy, 10); if (t > li) { text('LEANS IN', 850, 1100, 36, P.gold, 900, P.navy, 10); stamp('SUMMER', P.gold, t, at(4, 'sunlight'), 830, 1240); } label('● = YOUR HALF OF THE PLANET', CX, 300, 36, P.white, t, at(4, 'your')); } }
// stand it up straight
function s05(t) { const u = lt(t, A(5) - .3, E(5) + .6); setCam(v3(0, 0, 0), 9, lerp(-.2, .15, u), .08); space(t);
  const st = at(5, 'stand'), k = springy(lt(t, st + .1, st + 1.1)); ghostAxis(CX, 820, 320, TILT, .55);
  axisEarth(CX, 820, 320, t, TILT * (1 - k), k < .9 ? 'keen' : 'smug', { rot: 1.2 + t * .1 }); label('TILT 0°', CX, 290, 56, '#7fd3ff', t, at(5, 'straight') + .1); }
// every day the same: a park where the sun and the calendar keep going but nothing changes
function calendar(x, y, s, txt, col = P.red) { g.save(); g.translate(x, y); g.scale(s, s); g.fillStyle = 'rgba(0,0,0,.2)'; g.beginPath(); g.roundRect(-142, -112, 300, 250, 26); g.fill(); g.fillStyle = '#fff'; g.beginPath(); g.roundRect(-150, -125, 300, 250, 26); g.fill(); g.fillStyle = col; g.beginPath(); g.roundRect(-150, -125, 300, 84, [26, 26, 0, 0]); g.fill(); dot(-80, -125, 13, P.navy); dot(80, -125, 13, P.navy); text(txt, 0, 76, 104, P.navy, 1000, null, 0); g.restore(); }
const MON = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'];
function s06(t) { const end = at(7, 'But'), u = lt(t, A(6) - .3, end); setCam(v3(0, 1.1, 0), 11, lerp(-.32, .22, u), .1);
  const cyc = (((t - A(6)) / 1.7) % 1 + 1) % 1, night = clamp(-Math.sin(cyc * TAU) * 2.5);
  land(t, 'park', hz => { const a = (cyc % .5) / .5, x = lerp(60, 1020, a), y = hz - 60 - Math.sin(a * Math.PI) * 560; if (cyc < .5) K.sunBody(x, y, 62, t, { glow: .7 }); else K.moon(x, y, 46, t, 'sleepy'); });
  world([...trees('#4fa85a'), { p: v3(-1.2, 0, 3), draw: q => personQ(q) }]);
  if (night > 0) { g.fillStyle = `rgba(10,8,60,${night * .55})`; g.fillRect(-100, -100, W + 200, H + 200); }
  const mi = Math.floor(Math.max(0, t - A(6)) / .42) % 12, fl = (Math.max(0, t - A(6)) / .42) % 1; calendar(CX, 330, .8 + .06 * (1 - Math.min(1, fl * 4)), MON[mi]);
  const n1 = at(6, 'No', 0), n2 = at(6, 'No', 1); if (t < n1 - .1) label('12 H LIGHT  ·  12 H DARK', CX, 1330, 42, P.gold, t, at(6, '12')); stamp('NO SUMMER', P.gold, t, n1 + .1, CX, 720); stamp('NO WINTER', '#7fd3ff', t, n2 + .1, CX, 920); }
// the problem: the rain belt follows the seasons
function s07(t) { const t0 = at(7, 'But'), u = lt(t, t0 - .3, E(7) + .3); setCam(v3(0, 0, 0), 9, lerp(.3, -.2, u), .08); space(t);
  const sw = at(7, 'Seasons'), ph = Math.max(0, t - sw) * 2.1, lat = -Math.sin(ph) * 120, R = 330;
  axisEarth(CX, 860, R, t, TILT, 'happy', { rot: .6 + u * .5, noFace: true, over: R => { g.save(); g.beginPath(); g.arc(0, 0, R, 0, TAU); g.clip(); for (let i = -4; i <= 4; i++) { const x = i * R * .25 + Math.sin(t + i) * 8, y = lat + (i * .25) ** 2 * R * .16 * (lat < 0 ? 1 : -1) * Math.min(1, Math.abs(lat) / 60); cloud(x, y, .42, '#fff', .95); g.strokeStyle = 'rgba(150,210,255,.9)'; g.lineWidth = 4; for (const dx of [-26, 0, 26]) { const o = (t * 60 + i * 9 + dx) % 30; g.beginPath(); g.moveTo(x + dx, y + 32 + o); g.lineTo(x + dx - 4, y + 46 + o); g.stroke(); } } g.restore(); } });
  if (t > sw) { const m = Math.cos(ph) > 0 ? (Math.sin(ph) > 0 ? 'JULY' : 'JANUARY') : (Math.sin(ph) > 0 ? 'JULY' : 'JANUARY'); chip(m, CX, 1330, 44, Math.sin(ph) > 0 ? P.gold : '#7fd3ff'); }
  const rn = at(7, 'rain'); if (t < rn) label('THE PROBLEM', CX, 290, 54, P.red, t, at(7, 'problem')); else label('RAIN FOLLOWS THE SEASONS', CX, 290, 42, P.gold, t, rn); }
// the monsoon: rice terraces, the rain arrives, then never comes
function s08(t) { const u = lt(t, A(8) - .3, E(8) + .3), px = lerp(-36, 36, u), nv = at(8, 'never'), wi = at(8, 'With'), mo = at(8, 'monsoon');
  const dry = ss(lt(t, nv - .1, nv + 1.2)), cin = ss(lt(t, at(8, 'pulls'), at(8, 'Asia') + .4)) * (1 - ss(lt(t, wi, nv + .5))), wet = ss(lt(t, mo - .3, mo + .5)) * (1 - ss(lt(t, wi - .1, nv)));
  const sk = g.createLinearGradient(0, 0, 0, 1000); sk.addColorStop(0, mixc(mixc('#6fbdf0', '#56687f', cin * .85), '#f2a850', dry)); sk.addColorStop(1, mixc(mixc('#ffeccc', '#aebccb', cin * .85), '#ffe2a8', dry)); g.fillStyle = sk; g.fillRect(-100, -100, W + 200, 1200);
  g.save(); g.globalAlpha = 1 - cin * .85; K.sunBody(850, 380, 86, t, { glow: .8 + dry }); g.restore();
  g.fillStyle = mixc('#8f9fc4', '#b89a7a', dry); g.beginPath(); g.moveTo(-100, 1010); for (const [x, y] of [[40, 760], [190, 900], [360, 640], [520, 880], [700, 700], [860, 900], [1010, 770], [1180, 1010]]) g.lineTo(x - px * .3, y); g.fill();
  g.fillStyle = mixc('#ffffff', '#e8d8c0', dry); for (const [x, y] of [[40, 760], [360, 640], [700, 700], [1010, 770]]) { g.beginPath(); g.moveTo(x - px * .3, y); g.lineTo(x - px * .3 - 50, y + 76); g.lineTo(x - px * .3 - 14, y + 58); g.lineTo(x - px * .3 + 12, y + 80); g.lineTo(x - px * .3 + 48, y + 70); g.fill(); }
  const Rn = mulberry(21); for (let i = 0; i < 6; i++) { const y0 = 990 + i * 150, f = x => y0 + Math.sin((x + px * (.5 + i * .2)) * .0042 + i * 1.7) * 44;
    g.fillStyle = mixc(i % 2 ? '#5fbf5a' : '#4fae52', i % 2 ? '#c9a468' : '#b8915a', dry); g.beginPath(); g.moveTo(-100, H + 100); for (let x = -100; x <= W + 100; x += 40) g.lineTo(x, f(x)); g.lineTo(W + 100, H + 100); g.fill();
    g.strokeStyle = mixc('#2f7a3a', '#8a6a3a', dry); g.lineWidth = 12; g.beginPath(); for (let x = -100; x <= W + 100; x += 40) g.lineTo(x, f(x)); g.stroke();
    if (wet > 0) { g.strokeStyle = `rgba(210,240,255,${.5 * wet})`; g.lineWidth = 6; for (let j = 0; j < 4; j++) { const x = Rn() * W; g.beginPath(); g.moveTo(x, f(x) + 60); g.lineTo(x + 90, f(x + 90) + 60); g.stroke(); } } else for (let j = 0; j < 4; j++) Rn();
    g.strokeStyle = mixc('#256f30', '#a8884a', dry); g.lineWidth = 6; g.lineCap = 'round'; for (let j = 0; j < 16; j++) { const x = Rn() * (W + 100) - 50, y = f(x) + 50 + Rn() * 70, h = 30 * (1 - .45 * dry); g.beginPath(); for (const dx of [-12, 0, 12]) { g.moveTo(x, y); g.lineTo(x + dx, y - h); } g.stroke(); }
    if (dry > .2) { g.strokeStyle = `rgba(80,50,20,${(dry - .2) * .7})`; g.lineWidth = 4; for (let j = 0; j < 5; j++) { const x = Rn() * W, y = f(x) + 40 + Rn() * 80; g.beginPath(); g.moveTo(x, y); g.lineTo(x + 26, y + 16); g.lineTo(x + 16, y + 40); g.moveTo(x + 26, y + 16); g.lineTo(x + 60, y + 12); g.stroke(); } } else for (let j = 0; j < 10; j++) Rn(); }
  const fx = 300 - px, fy = 1168; person(fx, fy, 1.9, '#e0603a'); g.fillStyle = '#e8c878'; g.beginPath(); g.moveTo(fx - 78, fy - 232); g.lineTo(fx, fy - 292); g.lineTo(fx + 78, fy - 232); g.fill();
  const ht = at(8, 'hot'); if (t > ht && t < mo) { g.strokeStyle = `rgba(255,110,70,${.7 * (1 - lt(t, mo - .5, mo))})`; g.lineWidth = 8; g.lineCap = 'round'; for (const x0 of [520, 680, 840]) { g.beginPath(); for (let k = 0; k <= 8; k++) { const y = 1180 - k * 30 - ((t * 80) % 30); g.lineTo(x0 + Math.sin(k * 1.2 + t * 4) * 14, y); } g.stroke(); } }
  for (const [tx, y, s, d] of [[150, 330, 1.5, 0], [520, 250, 1.8, .1], [880, 360, 1.5, .2], [330, 500, 1.3, .15], [760, 540, 1.4, .25]]) cloud(lerp(-900 + tx * .3, tx, clamp(cin * 1.2 - d)) + Math.sin(t * .5 + tx) * 12, y, s, mixc('#ffffff', '#566078', .25 + wet * .6), Math.min(1, cin * 2));
  rain(t, wet);
  if (dry > 0) { g.fillStyle = `rgba(255,170,60,${dry * .14})`; g.fillRect(-100, -100, W + 200, H + 200); }
  if (t < mo - .1) label('WET OCEAN AIR  →', CX, 690, 40, '#7fd3ff', t, at(8, 'wet')); else if (t < wi) label('THE MONSOON', CX, 690, 52, '#7fd3ff', t, mo);
  if (t < wi) label('FOOD FOR 1 BILLION+ PEOPLE', CX, 1330, 40, P.gold, t, at(8, 'billion')); stamp('NEVER COMES', P.red, t, nv + .15, CX, 700); }
// the poles: the ice only grows
function s09(t) { const u = lt(t, A(9) - .3, E(9) + .4); setCam(v3(0, 0, 0), 9, lerp(-.25, .2, u), .1); space(t); const gk = ss(lt(t, at(9, 'ice') - .3, E(9) + .5));
  const sh = Math.sin(t * 34) * 5 * gk; axisEarth(CX + sh, 840, 320, t, 0, 'scared', { rot: 2 + t * .1, noFace: true, over: R => { caps(gk * .55)(R); K.face(R, gk > .3 ? 'scared' : 'worried', t, 0, .7); } });
  const R = mulberry(6); for (let i = 0; i < 30; i++) dot(R() * W, ((R() * 1300 + t * (50 + R() * 60)) % 1300) + 150, 3 + R() * 4, '#fff', .7 * gk);
  if (t < at(9, 'So')) label('NO POLAR SUMMER', CX, 290, 46, '#7fd3ff', t, at(9, 'never')); else label('THE ICE ONLY GROWS', CX, 290, 46, '#ffffff', t, at(9, 'ice')); }
// living things lose their calendar
function s10(t) { const u = lt(t, A(10) - .3, E(10) + .5); setCam(v3(0, 1.3, 0), 8.2, lerp(.3, -.15, u), .1); land(t, 'park', hz => K.sunBody(860, hz - 420, 60, t, { glow: .7 }));
  world([...trees('#4fa85a'), { p: v3(-2.6, 0, 2.5), draw: q => personQ(q, 2.4, '#e0603a') }]);
  const c = at(10, 'calendar'), k = pop(t, at(10, 'Their') - .1), q = t > c; if (k > 0) { const sh = q ? Math.sin(t * 30) * 8 * (1 - lt(t, c, c + .5)) : 0; calendar(CX + sh, 660, 1.5 * Math.min(1.06, k), q ? '?' : MON[Math.floor(t / .16) % 12], q ? '#8a8fa8' : P.red); bird(CX + 120, 660 - 232, 1.5, t, '#4a6fd0'); }
  label('NO SEASONS = NO CALENDAR', CX, 1330, 40, P.gold, t, c + .2); }
// wheat, apple trees and birds wait for a signal that never arrives
function s11(t) { const u = lt(t, A(11) - .3, E(11) + .3), px = lerp(-36, 36, u); const sk = g.createLinearGradient(0, 0, 0, 1100); sk.addColorStop(0, '#7fc4f0'); sk.addColorStop(1, '#eaf6ff'); g.fillStyle = sk; g.fillRect(-100, -100, W + 200, 1300);
  K.sunBody(880 - px * .2, 330, 70, t, { glow: .7 }); g.fillStyle = '#7fc08a'; g.beginPath(); g.moveTo(-100, 1100); for (let x = -100; x <= W + 100; x += 40) g.lineTo(x, 1000 - Math.abs(Math.sin((x + px * .4) * .005)) * 110); g.lineTo(W + 100, 1100); g.fill();
  const wy = 600; g.fillStyle = '#6a5040'; g.fillRect(40 - px * .6, wy - 40, 22, 600); g.fillRect(1010 - px * .6, wy - 40, 22, 600); g.strokeStyle = '#3a3040'; g.lineWidth = 6; g.beginPath(); g.moveTo(50 - px * .6, wy - 30); g.quadraticCurveTo(CX - px * .6, wy + 50, 1020 - px * .6, wy - 30); g.stroke();
  const bw = at(11, 'Birds'); for (const [i, bx] of [400, 530, 660, 790].entries()) { const x = bx - px * .6, dx = (x - (CX - px * .6)) / 485; bird(x, wy + 46 * (1 - dx * dx) - 68, 1.05, t, ['#4a6fd0', '#d05a4a', '#4a6fd0', '#7a5ad0'][i], i); }
  g.fillStyle = '#8fbf5a'; g.fillRect(-100, 1090, W + 200, H); const Rn = mulberry(9);
  treeQ({ x: 220 - px, y: 1330, s: 264 }, 2.2, '#4f9a4a');
  for (let r = 0; r < 5; r++) { const y0 = 1260 + r * 130; g.strokeStyle = r % 2 ? '#6fa846' : '#7fb850'; g.lineWidth = 7; g.lineCap = 'round'; for (let i = 0; i < 26; i++) { const x = -60 + i * 46 + Rn() * 24 - px * (1 + r * .15), swy = Math.sin(t * 1.6 + i * .5 + r) * 10; g.beginPath(); g.moveTo(x, y0 + 130); g.quadraticCurveTo(x, y0 + 40, x + swy, y0); g.stroke(); g.fillStyle = '#9fc85a'; g.beginPath(); g.ellipse(x + swy, y0 - 12, 9, 24, swy * .01, 0, TAU); g.fill(); } g.fillStyle = 'rgba(40,90,40,.12)'; g.fillRect(-100, y0 + 100, W + 200, 40); }
  const nv = at(11, 'never'); if (t < bw - .1) label('WAITING FOR A COLD WINTER...', CX, 1330, 40, '#7fd3ff', t, at(11, 'wait')); else if (t < nv) { label('WAITING FOR LONGER DAYS...', CX, 330, 40, P.gold, t, at(11, 'wait', 1)); text('?', 600 - px * .6, 470, 120, P.gold, 1000, P.navy, 14, 'center', Math.min(1, pop(t, at(11, 'longer')))); }
  stamp('NO SIGNAL', P.red, t, nv + .1, CX, 380); }
// a few narrow strips
function s12(t) { const u = lt(t, A(12) - .3, E(12) + .4); setCam(v3(0, 0, 0), 9, lerp(.25, -.2, u), .1); space(t); const nr = at(12, 'narrow'), k = lt(t, nr - .2, nr + .4);
  axisEarth(CX, 860, 340, t, 0, 'worried', { rot: 3 + t * .1, noFace: true, over: R => { g.save(); g.beginPath(); g.arc(0, 0, R, 0, TAU); g.clip(); g.fillStyle = 'rgba(210,120,40,.6)'; g.fillRect(-R, -R * .3, 2 * R, R * .6); g.fillStyle = 'rgba(90,100,120,.45)'; g.fillRect(-R, -R * .62, 2 * R, R * .16); g.fillRect(-R, R * .46, 2 * R, R * .16); g.restore(); caps(.42)(R);
    g.save(); g.beginPath(); g.arc(0, 0, R, 0, TAU); g.clip(); const p = .6 + .4 * Math.sin(t * 5); for (const s of [-1, 1]) { g.fillStyle = `rgba(110,255,130,${k * (.55 + .3 * p)})`; g.fillRect(-R, s * R * .38 - R * .08, 2 * R, R * .16); } g.restore(); } });
  if (k > 0) for (const s of [-1, 1]) { K.arrow(120, 860 + s * 130, 240, 860 + s * 130, '#7dff8a', 14, k); K.arrow(960, 860 + s * 130, 840, 860 + s * 130, '#7dff8a', 14, k); }
  label('NARROW STRIPS OF FARMLAND', CX, 290, 42, '#7dff8a', t, nr); if (t > A(12)) { text('TOO COLD', CX, 560, 30, '#ffffff', 900, P.navy, 8, 'center', k); text('TOO HOT', CX, 872, 30, '#ffe0b0', 900, P.navy, 8, 'center', k); } }
// where did the lean come from?
function s13(t) { const u = lt(t, A(13) - .3, E(13) + .3); setCam(v3(0, 0, 0), 9, lerp(-.3, .1, u), .08); space(t); const ac = at(13, 'accident'), k = lt(t, ac, ac + .5);
  if (k > 0) glow(1000, 200, 900, '255,90,50', .35 * k); axisEarth(CX, 860, 300, t, TILT, t > ac ? 'scared' : 'keen', { rot: 1 + t * .1, look: t > ac ? 1 : 0 });
  const q = at(13, 'from'); text('?', CX + 330, 520, 220, P.gold, 1000, P.navy, 20, 'center', Math.min(1, pop(t, q)) * (1 - k));
  if (t < ac) label('WHO TILTED EARTH?', CX, 290, 48, P.gold, t, at(13, 'where')); else label('AN ACCIDENT', CX, 290, 54, P.red, t, ac); }
// the crash
function s14(t) { const u = lt(t, A(14) - .3, E(14) + .3); setCam(v3(0, 0, 0), 9, lerp(.3, -.15, u), .08); space(t);
  const cr = at(14, 'crashed'), kn = at(14, 'knocked'), w0 = at(14, 'world'), f = eio(lt(t, w0 - .2, cr)) ** 1.6, R = 250, x = CX - 40, y = 900, sh = t > cr ? Math.sin(t * 60) * 22 * (1 - lt(t, cr, cr + .6)) : 0;
  const tl = TILT * springy(lt(t, kn - .05, kn + .9));
  youngEarth(x + sh, y - sh * .5, R, t, tl, t < w0 ? 'happy' : t < cr ? 'scared' : 'worried');
  const hx = x + R * .68, hy = y - R * .68; if (t > w0 - .2 && t < cr) { const tx = lerp(1250, hx + 95, f), ty = lerp(120, hy - 95, f); g.save(); glow(tx, ty, 260, '255,110,60', .35); g.beginPath(); g.arc(tx, ty, 135, 0, TAU); g.clip(); g.fillStyle = '#8f4a3a'; g.fillRect(tx - 140, ty - 140, 280, 280); g.fillStyle = '#6f3428'; for (const [a, b, r] of [[-40, -30, 36], [50, 20, 30], [-10, 60, 24]]) { g.beginPath(); g.arc(tx + a, ty + b, r, 0, TAU); g.fill(); } g.restore(); g.save(); g.translate(tx, ty); K.face(135, 'smug', t, -1, .2); g.restore(); if (t < cr - .5) text('MARS-SIZED', Math.min(tx, 820), ty + 200, 34, '#ffb38a', 900, P.navy, 8); }
  if (t > cr) { const d = t - cr, Rn = mulberry(14); for (let i = 0; i < 46; i++) { const a = -Math.PI * .25 + (Rn() - .5) * 3.4, v = 240 + Rn() * 620, px = hx + Math.cos(a) * v * (1 - Math.exp(-d * 1.6)), py = hy + Math.sin(a) * v * (1 - Math.exp(-d * 1.6)); dot(px, py, 6 + Rn() * 16, i % 3 ? '#b8502e' : '#ffb040', clamp(1.6 - d * .25)); } glow(hx, hy, 700, '255,200,120', .8 * (1 - lt(t, cr, cr + 1.2)));
    const fl = 1 - lt(t, cr, cr + .45); if (fl > 0) { g.fillStyle = `rgba(255,245,220,${fl})`; g.fillRect(-100, -100, W + 200, H + 200); } }
  if (t < kn) label('4.5 BILLION YEARS AGO', CX, 290, 44, P.gold, t, A(14) + .1); else label('KNOCKED SIDEWAYS', CX, 290, 48, P.red, t, kn + .1); }
// the wreckage becomes the Moon, and the Moon steadies the tilt
function s15(t) { const u = lt(t, A(15) - .3, E(15) + .4); setCam(v3(0, 0, 0), 9, lerp(-.2, .2, u), .08); space(t);
  const mt = at(15, 'Moon'), gv = at(15, 'gravity'), hd = at(15, 'steady'), cv = ss(lt(t, A(15) + .2, mt + .1)), cool = ss(lt(t, A(15), mt + .6)), wob = Math.sin(t * 7) * .1 * (1 - ss(lt(t, gv, hd + .2))) * cool;
  const x = CX, y = 880, R = 220, rx = 400, ry = 120, am = 2.4 + (t - A(15)) * .32, c = Math.cos(TILT), s = Math.sin(TILT), P2 = a => { const px = Math.cos(a) * rx, py = Math.sin(a) * ry; return { x: x + px * c - py * s, y: y + px * s + py * c, f: Math.sin(a) > 0 }; };
  const Rn = mulberry(17), deb = Array.from({ length: 60 }, () => ({ a: Rn() * TAU, r: 5 + Rn() * 13, w: .5 + Rn() * .4, j: (Rn() - .5) * 40 })), mp = P2(am);
  const drawDeb = front => { if (cv >= 1) return; for (const d of deb) { let da = ((d.a + t * d.w - am) % TAU + TAU) % TAU; if (da > Math.PI) da -= TAU; const a = am + da * (1 - cv), p = P2(a); if (p.f === front) dot(p.x, p.y + d.j * (1 - cv), d.r, d.r > 12 ? '#ffb040' : '#b8704e', 1 - cv * .5); } };
  const mk = pop(t, mt - .15), drawMoon = () => { if (mk > 0) K.moon(mp.x, mp.y, 66 * Math.min(1.08, mk), t, t > hd ? 'smug' : 'happy'); };
  drawDeb(false); if (!mp.f) drawMoon();
  if (t > gv) { const p = lt(t, gv, gv + .4); g.strokeStyle = `rgba(190,200,255,${.8 * p})`; g.lineWidth = 7; g.setLineDash([16, 14]); g.lineDashOffset = -t * 50; g.beginPath(); g.moveTo(mp.x, mp.y); g.lineTo(x, y); g.stroke(); g.setLineDash([]); }
  youngEarth(x, y, R, t, TILT + wob, 'worried', 1 - cool); if (cool > 0) { g.save(); g.globalAlpha = cool; axisEarth(x, y, R, t, TILT + wob, t > hd ? 'love' : 'worried', { rot: 1 + t * .15 }); g.restore(); }
  drawDeb(true); if (mp.f) drawMoon();
  if (t < gv) label('THE WRECKAGE BECAME THE MOON', CX, 290, 38, P.white, t, mt); else label('THE MOON HOLDS THE TILT STEADY', CX, 290, 38, P.gold, t, at(15, 'held')); }
// spring: the payoff
function s16(t) { const u = lt(t, A(16) - .3, DUR); setCam(v3(0, 1.1, 0), 10.5, lerp(.3, -.2, u), .1); land(t, 'spring', hz => { K.sunBody(820, hz - 470, 74, t, { glow: 1 }); glow(820, hz - 470, 620, '255,220,160', .3); });
  const rm = at(16, 'remember'), ek = pop(t, rm); if (ek > 0) { g.save(); g.globalAlpha = .92; axisEarth(230, 520, 96 * Math.min(1.06, ek), t, TILT, 'love', { rot: t * .2 }); g.restore(); }
  world([...trees(['#ffb3cf', '#ffc8dc', '#ff9fc2'], { hi: 'rgba(255,255,255,.3)', trunk: '#6a4030' }), { p: v3(.6, 0, 3), draw: q => personQ(q, 2.6, '#4f7dff') }, ...[[-3, 4], [3.5, 5], [-5, 1], [5.5, 2], [2, 6.5], [-1.5, 6]].map(([fx, fz], i) => ({ p: v3(fx, 0, fz), draw: q => { const s = q.s / 264; dot(q.x, q.y - 16 * s, 16 * s, ['#ffe08a', '#ff8fb0', '#ffffff'][i % 3]); dot(q.x, q.y - 16 * s, 6 * s, '#ffb040'); g.strokeStyle = '#3f8a4a'; g.lineWidth = 5 * s; g.beginPath(); g.moveTo(q.x, q.y); g.lineTo(q.x, q.y - 10 * s); g.stroke(); } }))]);
  const R = mulberry(11); for (let i = 0; i < 40; i++) { const x = ((R() * W + t * 30 * (.5 + R()) + Math.sin(t * 1.4 + i) * 30) % (W + 40)) - 20, y = (R() * H + t * 90 * (.5 + R())) % 1500; g.fillStyle = `rgba(255,${180 + R() * 50},${205 + R() * 40},.9)`; g.beginPath(); g.ellipse(x, y, 10, 6, t * 2 + i, 0, TAU); g.fill(); }
  const cr = at(16, 'crash'); if (t > cr) { const f = 1 - lt(t, cr, cr + .5); if (f > 0) { g.fillStyle = `rgba(255,245,220,${f * .5})`; g.fillRect(-100, -100, W + 200, H + 200); } }
  const ca = pop(t, E(16) + .5, .4); if (ca <= 0) label('THE CRASH THAT GAVE US SPRING', CX, 290, 38, P.gold, t, cr);
  if (ca > 0) { g.save(); g.translate(CX, 290); g.scale(ca, ca); card(0, 0, 880, 110, '#7fd3ff'); text('Which season would you miss most? ↓', 0, 14, 40, P.white, 1000, null, 0); g.restore(); } }
const SC = [[0, s01], [A(2) - .3, s02], [A(3) - .3, s03], [A(4) - .3, s04], [A(5) - .35, s05], [A(6) - .3, s06], [at(7, 'But') - .25, s07], [A(8) - .3, s08], [A(9) - .3, s09], [A(10) - .35, s10], [A(11) - .3, s11], [A(12) - .3, s12], [A(13) - .35, s13], [A(14) - .3, s14], [A(15) - .3, s15], [A(16) - .35, s16]];
const XF = .45;

// ───────── subtitles: word-pops on real spoken timing, key words in gold (Earth Rings)
const KEY = new Set(['leaning', 'straight', 'food', 'puzzle', 'summer', 'hot', 'closer', 'closest', 'january', 'winter', 'lean', '23', 'degrees', 'sunlight', 'away', 'same', '12', 'forever', 'problem', 'rain', 'monsoon', 'billion', 'never', 'poles', 'ice', 'grows', 'calendar', 'wheat', 'apple', 'cold', 'birds', 'longer', 'signal', 'narrow', 'strips', 'lucky', 'accident', 'mars', 'crashed', 'sideways', 'wreckage', 'moon', 'gravity', 'steady', 'spring', 'crash', 'four']);
const CAP = [];
for (const [id, ws] of Object.entries(words)) {
  let line = [], n = 0; const flush = () => { if (line.length) CAP.push({ words: line.map(x => ({ w: x[0], t0: VO[id] + Math.max(0, x[1]), t1: VO[id] + x[2] })) }); line = []; n = 0; };
  g.font = '900 74px NU'; const wide = a => g.measureText(a.map(x => x[0]).join(' ')).width;
  for (const x of ws) { if (line.length && wide([...line, x]) > 930) flush(); line.push(x); n += x[0].length + 1; if (n > 18 || (/[.?!,:]$/.test(x[0]) && n > 9)) flush(); }
  flush();
}
for (let i = 0; i < CAP.length; i++) { const c = CAP[i], e = c.words[c.words.length - 1].t1; c.t0 = c.words[0].t0 - .05; c.t1 = i + 1 < CAP.length ? Math.min(CAP[i + 1].words[0].t0 - .02, e + .7) : e + .8; }
function captions(t) {
  const c = CAP.find(c => t >= c.t0 && t < c.t1); if (!c) return;
  g.save(); g.font = '900 74px NU';
  const ws = c.words.map(w => ({ ...w, s: w.w.replace(/,$/, ''), wd: g.measureText(w.w.replace(/,$/, '') + ' ').width })), tot = ws.reduce((p, w) => p + w.wd, 0); let x = CX - tot / 2; const y = 1600;
  for (const w of ws) { const k = clamp((t - w.t0) / .1); if (k > 0) { g.save(); g.globalAlpha = k; g.translate(x, y); const s = .85 + .15 * eo(k); g.scale(s, s); g.lineJoin = 'round'; g.lineWidth = 16; g.strokeStyle = P.navy; g.textAlign = 'left'; g.strokeText(w.s, 0, 0); g.fillStyle = KEY.has(nrm(w.s)) ? P.gold : P.white; g.fillText(w.s, 0, 0); g.restore(); } x += w.wd; }
  g.restore();
}

// ───────── frame: a crossfade + push-in between scenes, a slow drift inside each one
const zoom = (c, z) => { c.translate(CX, 1000); c.scale(z, z); c.translate(-CX, -1000); };
function render(t) {
  use(G0); g.setTransform(1, 0, 0, 1, 0, 0); g.globalAlpha = 1;
  let i = 0; while (i < SC.length - 1 && t >= SC[i + 1][0]) i++;
  const s0 = SC[i][0], u = clamp((t - s0) / XF);
  if (i > 0 && u < 1) {
    g.save(); zoom(g, 1 + .08 * eio(u)); SC[i - 1][1](t); g.restore();
    use(G1); g.setTransform(1, 0, 0, 1, 0, 0); g.globalAlpha = 1; g.clearRect(0, 0, W, H); g.save(); zoom(g, 1.06 - .06 * eo(u)); SC[i][1](t); g.restore(); use(G0);
    g.globalAlpha = ss(u); g.drawImage(off, 0, 0); g.globalAlpha = 1;
  } else { g.save(); zoom(g, 1 + (t - s0) * .006); SC[i][1](t); g.restore(); }
  g.setTransform(1, 0, 0, 1, 0, 0); g.globalAlpha = 1; g.filter = 'none'; captions(t);
  const fo = seg(t, DUR - .6, DUR); if (fo > 0) { g.fillStyle = `rgba(0,0,0,${fo})`; g.fillRect(0, 0, W, H); }
}

// ───────── thumbnail (?thumb=1): Earth standing straight and freezing, with its old lean as a dashed ghost
function thumb() {
  use(G0); g.setTransform(1, 0, 0, 1, 0, 0); setCam(v3(0, 0, 0), 9, .3, .1); space(1);
  const ex = CX, ey = 1180, R = 360; ghostAxis(ex, ey, R, TILT, .8);
  g.strokeStyle = P.gold; g.lineWidth = 12; g.beginPath(); g.arc(ex, ey, R * 1.5, -Math.PI / 2 + TILT + .03, -Math.PI / 2 - .05); g.stroke(); g.fillStyle = P.gold; g.beginPath(); g.moveTo(ex + 6, ey - R * 1.5 - 30); g.lineTo(ex + 6, ey - R * 1.5 + 30); g.lineTo(ex + 50, ey - R * 1.5 + 2); g.fill();
  axisEarth(ex, ey, R, 1, 0, 'scared', { rot: 1.1, noFace: true, over: R => { caps(.3)(R); K.face(R, 'scared', 1, 0, .7); } });
  g.fillStyle = '#7fd3ff'; for (const [x, y, k] of [[ex + 330, ey - 190, 1.5], [ex - 340, ey - 150, 1.2]]) { g.beginPath(); g.moveTo(x, y - 34 * k); g.quadraticCurveTo(x + 22 * k, y + 6 * k, x, y + 18 * k); g.quadraticCurveTo(x - 22 * k, y + 6 * k, x, y - 34 * k); g.fill(); }
  text('WHAT IF EARTH', CX, 200, 104, P.white, 1000, P.navy, 20); text('STOOD UP', CX, 350, 150, P.gold, 1000, P.navy, 26); text('STRAIGHT?', CX, 500, 150, P.gold, 1000, P.navy, 26);
  g.save(); g.translate(CX, 1770); g.rotate(-.04); g.fillStyle = P.red; g.beginPath(); g.roundRect(-330, -66, 660, 132, 66); g.fill(); text('NO SEASONS', 0, 28, 84, P.white, 1000, null, 0); g.restore();
}
const TH = new URLSearchParams(location.search).get('thumb');
window.EV = TL.lines.map(l => ({ type: 'vo', id: l.id, t: l.t })); window.DUR = DUR;
window.SUBS = TL.lines.map(l => ({ t0: l.t, t1: l.t + l.d + .3, text: l.id }));
if (TH) { window.render = () => thumb(); thumb(); } else { window.render = render; render(+(new URLSearchParams(location.search).get('t') ?? 1.0)); }
window.READY = true;
