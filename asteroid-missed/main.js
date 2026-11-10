// "What If the Asteroid Had Missed Earth?" — four quests (problem → solution → payoff), one narrator (Ryan).
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

// ───────── prehistoric ground: sky, parallax hills, a ground plane, depth-sorted plants and animals
const PAL = {
  day: { s0: '#7fc4f0', s1: '#ffe2b0', hill: '#6fa86a', g0: '#7cc46a', g1: '#3f8a4a', fern: '#3f9a5a', trunk: '#7a4a2a' },
  dusk: { s0: '#3a2a4a', s1: '#a8603a', hill: '#4a3a3a', g0: '#6a6a40', g1: '#3a3a28', fern: '#8a7a3a', trunk: '#4a3020' },
  dark: { s0: '#0c0a14', s1: '#2a1c20', hill: '#1a1518', g0: '#2a2620', g1: '#14120e', fern: '#5a4a28', trunk: '#241a14' },
  night: { s0: '#0a0826', s1: '#1d1a52', hill: '#141240', g0: '#1f3a3a', g1: '#0e1c24', fern: '#1f5a4a', trunk: '#2a2040' },
};
function land(t, pal) {
  const c = PAL[pal], hz = pr(v3(0, 0, -400)).y, gr = g.createLinearGradient(0, 0, 0, hz); gr.addColorStop(0, c.s0); gr.addColorStop(1, c.s1); g.fillStyle = gr; g.fillRect(-100, -100, W + 200, hz + 110);
  const px = CAM.az * 900; g.fillStyle = c.hill; g.beginPath(); g.moveTo(-100, hz + 4); for (let x = -100; x <= W + 100; x += 40) g.lineTo(x, hz - 60 - Math.abs(Math.sin((x + px * .3) * .006)) * 150 - Math.abs(Math.sin((x + px * .3) * .017)) * 40); g.lineTo(W + 100, hz + 4); g.fill();
  const gg = g.createLinearGradient(0, hz, 0, H); gg.addColorStop(0, c.g0); gg.addColorStop(1, c.g1); g.fillStyle = gg; g.fillRect(-100, hz, W + 200, H - hz + 100);
}
function palmQ(q, c, k = 1) { const s = q.s / 264 * k; g.save(); g.translate(q.x, q.y); g.scale(s, s); g.strokeStyle = c.trunk; g.lineWidth = 26; g.lineCap = 'round'; g.beginPath(); g.moveTo(0, 0); g.quadraticCurveTo(20, -170, 0, -340); g.stroke(); g.strokeStyle = c.fern; g.lineWidth = 20; for (const a of [-2.7, -2.1, -1.57, -1, -.45]) { g.beginPath(); g.moveTo(0, -340); g.quadraticCurveTo(Math.cos(a) * 110, -340 + Math.sin(a) * 110, Math.cos(a) * 190, -300 + Math.sin(a) * 40); g.stroke(); } g.restore(); }
function fernQ(q, c, k = 1) { const s = q.s / 264 * k; g.save(); g.translate(q.x, q.y); g.scale(s, s); g.strokeStyle = c.fern; g.lineWidth = 12; g.lineCap = 'round'; for (const a of [-2.5, -2, -1.57, -1.1, -.6]) { g.beginPath(); g.moveTo(0, 0); g.quadraticCurveTo(Math.cos(a) * 50, Math.sin(a) * 90, Math.cos(a) * 100, Math.sin(a) * 70); g.stroke(); } g.restore(); }
function dinoQ(q, k, flip, t, tint) { const s = q.s / 264 * k; g.save(); g.translate(q.x, q.y); g.scale(flip ? -s : s, s); if (tint) g.filter = tint; K.dino(0, -170, 1, t); g.filter = 'none'; g.restore(); }
const SCAT = (() => { const R = mulberry(19), a = []; for (let i = 0; i < 46; i++) a.push({ x: (R() * 2 - 1) * 16, z: -10 + R() * 15, k: .6 + R() * .7, palm: i % 5 === 0 }); return a; })();
const plants = (c, fall = 0) => SCAT.map(s => ({ p: v3(s.x, 0, s.z), draw: q => (s.palm ? palmQ(q, c, s.k * 1.5) : fernQ(q, c, s.k)) }));

// ───────── little characters
const SKIN = '#c98d64';
function person(x, y, s, shirt = '#4f7dff') { g.save(); g.translate(x, y); g.scale(s, s); g.fillStyle = '#2d2f5e'; g.fillRect(-16, 0, 13, 70); g.fillRect(3, 0, 13, 70); g.fillStyle = shirt; g.beginPath(); g.roundRect(-26, -78, 52, 84, 18); g.fill(); g.fillStyle = SKIN; g.beginPath(); g.arc(0, -104, 28, 0, TAU); g.fill(); g.fillStyle = '#2b2140'; g.beginPath(); g.arc(0, -112, 28, Math.PI, TAU); g.fill(); dot(10, -102, 3.5, P.navy); dot(20, -102, 3.5, P.navy); g.strokeStyle = SKIN; g.lineWidth = 11; g.lineCap = 'round'; g.beginPath(); g.moveTo(-26, -60); g.lineTo(-34, -10); g.moveTo(26, -60); g.lineTo(38, -14); g.stroke(); g.restore(); }
function mammal(x, y, s, t, o = {}) {                             // a small shrew-like ancestor, facing right
  g.save(); g.translate(x, y); g.scale(o.flip ? -s : s, s); const b = Math.sin(t * 7) * 2;
  g.strokeStyle = '#8a5a3c'; g.lineWidth = 7; g.lineCap = 'round'; g.beginPath(); g.moveTo(-62, 4); g.quadraticCurveTo(-110, 0, -128, -28 + b); g.stroke();
  g.fillStyle = '#9a6a48'; g.beginPath(); g.ellipse(0, 0, 72, 40, 0, 0, TAU); g.fill(); g.fillStyle = '#c8a07a'; g.beginPath(); g.ellipse(6, 16, 46, 20, 0, 0, TAU); g.fill();
  g.fillStyle = '#9a6a48'; g.beginPath(); g.ellipse(70, -14, 40, 30, .1, 0, TAU); g.fill(); g.beginPath(); g.moveTo(96, -22); g.lineTo(136, -6); g.lineTo(98, 6); g.fill(); dot(136, -6, 8, '#3a2a2a');
  dot(52, -44, 15, '#b07a58'); dot(52, -44, 8, '#e8b0a0'); dot(82, -22, 9, P.navy); dot(85, -25, 3, '#fff');
  g.strokeStyle = 'rgba(60,40,30,.7)'; g.lineWidth = 2; for (const a of [-.25, 0, .25]) { g.beginPath(); g.moveTo(118, -8); g.lineTo(118 + Math.cos(a) * 34, -8 + Math.sin(a) * 34); g.stroke(); }
  g.fillStyle = '#7a4a30'; for (const lx of [-40, 34]) g.fillRect(lx, 30, 16, 16); g.restore();
}
function feathered(x, y, s, t, o = {}) {                          // a small feathered dinosaur, wings flapping
  g.save(); g.translate(x, y); g.scale(s, s); const f = Math.sin(t * 9) * .7;
  g.strokeStyle = '#3f9aa8'; g.lineWidth = 16; g.lineCap = 'round'; g.beginPath(); g.moveTo(-60, 4); g.lineTo(-130, 24); g.stroke();
  g.fillStyle = '#4fb8c0'; g.beginPath(); g.ellipse(0, 0, 70, 38, -.1, 0, TAU); g.fill(); g.beginPath(); g.ellipse(72, -34, 32, 26, 0, 0, TAU); g.fill(); g.fillStyle = '#e8a04a'; g.beginPath(); g.moveTo(98, -38); g.lineTo(134, -28); g.lineTo(98, -20); g.fill(); dot(80, -42, 8, P.navy); dot(83, -45, 3, '#fff');
  g.save(); g.translate(-6, -16); g.rotate(-.5 + f); g.fillStyle = '#2f7f90'; g.beginPath(); g.moveTo(0, 0); g.quadraticCurveTo(-60, -120, -130, -110); g.quadraticCurveTo(-100, -40, -50, 14); g.fill(); g.restore(); g.restore();
}
function pigeon(x, y, s, t) { g.save(); g.translate(x, y); g.scale(s, s); const h = Math.sin(t * 3) * 5; g.strokeStyle = '#e08a6a'; g.lineWidth = 7; g.beginPath(); g.moveTo(-12, 48); g.lineTo(-14, 80); g.moveTo(14, 48); g.lineTo(16, 80); g.stroke(); g.fillStyle = '#8f96ae'; g.beginPath(); g.ellipse(0, 10, 70, 50, -.15, 0, TAU); g.fill(); g.beginPath(); g.moveTo(-60, 20); g.lineTo(-128, 44); g.lineTo(-60, 44); g.fill(); g.fillStyle = '#6f7690'; g.beginPath(); g.ellipse(-16, 12, 46, 28, .1, 0, TAU); g.fill(); g.fillStyle = '#5a7f8a'; g.beginPath(); g.ellipse(50, -36 + h, 30, 28, 0, 0, TAU); g.fill(); g.fillStyle = '#8f96ae'; g.beginPath(); g.ellipse(62, -60 + h, 26, 24, 0, 0, TAU); g.fill(); g.fillStyle = '#e8a04a'; g.beginPath(); g.moveTo(84, -62 + h); g.lineTo(106, -56 + h); g.lineTo(84, -50 + h); g.fill(); dot(68, -66 + h, 7, '#e8743a'); dot(69, -66 + h, 3.5, P.navy); g.restore(); }
function asteroid(x, y, r, t, trail = 1) { if (trail) { const gr = g.createLinearGradient(x, y, x + r * 7, y - r * 7); gr.addColorStop(0, 'rgba(255,190,90,.9)'); gr.addColorStop(1, 'rgba(255,120,60,0)'); g.fillStyle = gr; g.beginPath(); g.moveTo(x - r * .8, y - r * .5); g.lineTo(x + r * 7, y - r * 7); g.lineTo(x + r * .5, y + r * .8); g.fill(); } glow(x, y, r * 2.2, '255,180,90', .6); g.fillStyle = '#6a5a52'; g.beginPath(); for (let i = 0; i < 10; i++) { const a = i / 10 * TAU, rr = r * (.82 + .2 * Math.sin(i * 2.7)); g.lineTo(x + Math.cos(a) * rr, y + Math.sin(a) * rr); } g.fill(); dot(x - r * .3, y - r * .2, r * .2, '#4a3e38'); dot(x + r * .3, y + r * .25, r * .14, '#4a3e38'); }

// ───────── today: a window with the same person (opening and ending)
function room(t, pan) {
  g.save(); g.translate(-pan, 0); g.fillStyle = '#e8d8c0'; g.fillRect(-300, -100, W + 700, H + 200);
  const wx = 260, wy = 420, ww = 620, wh = 780; const sk = g.createLinearGradient(0, wy, 0, wy + wh); sk.addColorStop(0, '#7fc4f0'); sk.addColorStop(1, '#e8f6ff'); g.fillStyle = sk; g.fillRect(wx, wy, ww, wh);
  K.sunBody(wx + 480, wy + 150, 46, t, { glow: .5 }); g.save(); g.beginPath(); g.rect(wx, wy, ww, wh); g.clip(); for (let i = 0; i < 7; i++) { g.fillStyle = ['#9fb0c8', '#8a9cb8', '#b0bed0'][i % 3]; const h = 200 + (i * 71 % 240); g.fillRect(wx + i * 100 - pan * .25, wy + wh - h, 92, h); } g.restore();
  g.strokeStyle = '#fff'; g.lineWidth = 26; g.strokeRect(wx, wy, ww, wh); g.lineWidth = 12; g.beginPath(); g.moveTo(wx + ww / 2, wy); g.lineTo(wx + ww / 2, wy + wh); g.stroke();
  g.fillStyle = '#c8a880'; g.fillRect(wx - 40, wy + wh + 10, ww + 80, 34);
  g.restore();
  return { lx: 570 - pan, ly: 1210 };
}

// ───────── scenes
function s01(t) { const u = lt(t, 0, E(1) + .4), r = room(t, lerp(0, 70, u)); person(170 - lerp(0, 40, u), 1420, 2.4); const rw = lt(t, E(1) - .5, E(1) + .3); if (rw > 0) { g.save(); g.globalAlpha *= rw * .35; g.fillStyle = '#fff'; for (let y = (t * 1100) % 26; y < H; y += 26) g.fillRect(-100, y, W + 200, 3); g.restore(); } }
function s02(t) { const u = lt(t, A(2) - .3, E(2)); setCam(v3(0, 1.1, 0), 11, lerp(-.42, -.12, u), .1); land(t, 'day'); const c = PAL.day;
  const hz = pr(v3(0, 0, -400)).y; g.fillStyle = '#3f9ad0'; g.fillRect(-100, hz, W + 200, 60);
  const a = at(2, 'asteroid'), f = lt(t, a, at(2, 'Mexico') + .2);
  world([...plants(c), { p: v3(-2, 0, 0), draw: q => dinoQ(q, .7, 0, t) }, { p: v3(3, 0, -3), draw: q => dinoQ(q, .55, 1, t + 1) }, { p: v3(-6, 0, -6), draw: q => dinoQ(q, .5, 0, t + 2) }]);
  if (f > 0 && f < 1) asteroid(lerp(980, 240, f), lerp(280, hz - 10, f), 34 + 30 * f, t);
  const fl = lt(t, at(2, 'Mexico') + .1, at(2, 'Mexico') + .9); if (fl > 0) { g.fillStyle = `rgba(255,240,210,${Math.sin(Math.min(1, fl) * Math.PI)})`; g.fillRect(-100, -100, W + 200, H + 200); }
  label('66 MILLION YEARS AGO', CX, 300, 44, P.gold, t, A(2) + .1); }
function s03(t) { const u = lt(t, A(3) - .3, E(3)); setCam(v3(0, 0, 0), 9, lerp(.4, -.3, u), lerp(.05, .18, u)); space(t);
  const e = pr(v3(0, 0, 0)); const R = e.s * 1.25; K.earth(e.x, e.y - 40, R, t, 'keen', { rot: 1 + u * 1.2, noFace: true });
  const gn = at(3, 'grain'), k = pop(t, gn - .2); if (k > 0) { const sp = { x: e.x + R * .72, y: e.y - R * .92 }; dot(sp.x, sp.y, 4, '#ffcf8a'); glow(sp.x, sp.y, 40, '255,190,110', .7); g.strokeStyle = P.gold; g.lineWidth = 5; g.beginPath(); g.arc(sp.x, sp.y, 30, 0, TAU); g.stroke(); label('A GRAIN OF SAND', CX, 310, 44, P.gold, t, gn); }
  const q = at(3, 'How'); if (t > q) text('?', e.x, e.y + 40, 300, P.gold, 1000, P.navy, 24, 'center', Math.min(1, pop(t, q))); }
function s04(t) { const u = lt(t, A(4) - .3, E(4)), cy = lerp(0, 1120, ss(lt(t, A(4), at(4, 'packed') + .4))) - lerp(0, 1320, ss(lt(t, at(4, 'impact'), E(4)))), px = Math.sin(u * 2) * 26;  // the camera dives through the layers, then rides the blast up
  g.save(); g.translate(px, -cy); const sky = g.createLinearGradient(0, -700, 0, 700); sky.addColorStop(0, '#4a3a4a'); sky.addColorStop(1, '#ffb066'); g.fillStyle = sky; g.fillRect(-200, -900, W + 400, 1700);
  g.fillStyle = '#3f9ad0'; g.fillRect(-200, 780, W + 400, 300);
  for (const [y, h, c, l] of [[1080, 300, '#c9b38a', ''], [1380, 300, '#d8c860', 'SULFUR'], [1680, 340, '#3a2a24', 'OIL-RICH ROCK'], [2020, 1500, '#6a5a50', '']]) { g.fillStyle = c; g.fillRect(-200, y, W + 400, h); const R = mulberry(y); g.fillStyle = 'rgba(0,0,0,.14)'; for (let i = 0; i < 40; i++) g.fillRect(R() * W, y + R() * h, 30 + R() * 60, 6); if (l && t > at(4, 'packed')) { text(l, CX, y + h / 2 + 20, 62, l === 'SULFUR' ? '#5a4a10' : '#ffd9a0', 1000, null, 0, 'center', ss(lt(t, at(4, 'packed'), at(4, 'packed') + .4))); } }
  const im = lt(t, at(4, 'impact') - .1, E(4) + .3); if (im > 0) { g.fillStyle = 'rgba(20,14,16,.95)'; g.beginPath(); g.moveTo(CX - 90 - 150 * im, 2000); g.quadraticCurveTo(CX - 160 * im, 1000 - 1400 * im, CX - 330 * im, 1200 - 2400 * im); g.lineTo(CX + 330 * im, 1200 - 2400 * im); g.quadraticCurveTo(CX + 160 * im, 1000 - 1400 * im, CX + 90 + 150 * im, 2000); g.fill(); const R = mulberry(3); for (let i = 0; i < 40; i++) { const a = R() * TAU, d = R() * 300 * im; dot(CX + Math.cos(a) * d * 1.6, lerp(1400, -900, R() * im), 20 + R() * 46, ['#2a2024', '#4a3a30', '#8a7a30'][i % 3], .9); } }
  g.restore(); }
function s05(t) { const u = lt(t, A(5) - .3, E(6)), push = ss(lt(t, A(6) - .2, A(6) + 1.6)); setCam(v3(0, 0, 0), lerp(8.4, 6, push), lerp(-.25, .1, u), .12); space(t);
  const e = pr(v3(0, 0, 0)), R = e.s * 1.25; K.earth(e.x, e.y, R, t, 'sad', { rot: lerp(2.2, 2.8, u), noFace: true });
  const dk = ss(lt(t, A(5), at(5, 'months'))); g.save(); g.beginPath(); g.arc(e.x, e.y, R, 0, TAU); g.clip(); g.fillStyle = `rgba(16,12,18,${.72 * dk})`; g.fillRect(e.x - R, e.y - R, 2 * R, 2 * R);
  const st = at(5, 'study'), R2 = mulberry(5), hot = [[.12, .1, .26], [-.45, -.35, .16], [.5, -.5, .13], [-.3, .55, .15], [.55, .4, .12]]; hot.forEach(([dx, dy, r], i) => { const k = ss(lt(t, st + .6 + i * .2, st + 1.1 + i * .2)); if (k > 0) { dot(e.x + dx * R, e.y + dy * R, r * R * k, '#ff5a3c', .75); } }); g.restore();
  const hit = pr(v3(.25, .2, 1.9)); if (t > A(6)) { g.strokeStyle = P.gold; g.lineWidth = 7; g.beginPath(); g.arc(e.x + .12 * R, e.y + .1 * R, .32 * R, 0, TAU); g.stroke(); }
  label('ONLY ~13% OF THE SURFACE', CX, 300, 42, '#ff8a5c', t, at(5, '13')); if (t > A(6) + .4) label('ONE OF THE WORST SPOTS', CX, 1370, 42, P.gold, t, A(6) + 1.6); }
function ash(t, n = 80, a = .7) { const R = mulberry(2); for (let i = 0; i < n; i++) { const x = ((R() * W + t * 24 * (.4 + R())) % (W + 40)) - 20, y = (R() * H + t * 70 * (.5 + R())) % H; dot(x, y, 2 + R() * 4, '#a89a8a', a * (.4 + .6 * R())); } }
function s07(t) { const u = lt(t, A(7) - .3, E(8)); setCam(v3(0, 1, 0), 10.5, lerp(.45, .05, u), .1); land(t, 'dark'); const c = PAL.dark;
  const fall = ss(lt(t, A(8), A(8) + 1.6));
  world([...plants(c), { p: v3(1, 0, 0), draw: q => { g.save(); g.translate(q.x, q.y); g.rotate(fall * .22); g.translate(-q.x, -q.y); dinoQ({ ...q, y: q.y + fall * 34 }, .72, 1, 0, 'brightness(.35) saturate(.5)'); g.restore(); } }, { p: v3(-4, 0, -4), draw: q => dinoQ({ ...q, y: q.y + fall * 20 }, .5, 0, 0, 'brightness(.25) saturate(.4)') }]);
  ash(t);
  if (t > A(7)) label('NO SUNLIGHT', CX, 300, 44, '#cfc8d0', t, at(7, 'No')); if (t > at(7, 'What')) label('WHAT DO YOU EAT?', CX, 420, 44, P.gold, t, at(7, 'What')); if (t > A(8)) { const k = pop(t, at(8, 'large')); if (k > 0) { g.save(); g.translate(CX, 1320); g.scale(k, k); card(0, 0, 520, 100, '#ffb066'); text('DOG-SIZED OR SMALLER', 0, 14, 36, '#ffb066', 1000, null, 0); g.restore(); } } }
function s09(t) { const u = lt(t, A(9) - .3, E(9) + .2), px = lerp(0, 760, eio(u));   // slide along a burrow
  g.fillStyle = '#4a3020'; g.fillRect(-100, -100, W + 200, H + 200); g.save(); g.translate(-px, 0);
  g.fillStyle = '#2a2024'; g.fillRect(-200, -100, 2400, 460); g.fillStyle = '#6a4a30'; g.fillRect(-200, 350, 2400, 30); ash(t, 24, .5);
  g.fillStyle = '#1e140e'; g.beginPath(); g.moveTo(-200, 860); for (let x = -200; x <= 2200; x += 100) g.lineTo(x, 800 + Math.sin(x * .007) * 60); for (let x = 2200; x >= -200; x -= 100) g.lineTo(x, 1190 + Math.sin(x * .007) * 60); g.fill();
  const R = mulberry(6); for (let i = 0; i < 70; i++) dot(R() * 2200 - 100, 420 + R() * 1400, 5 + R() * 14, '#5a3a24', .8);
  mammal(420, 1070, 1.05, t); mammal(1100, 1110, .9, t + 1, { flip: 1 }); mammal(1560, 1060, 1.1, t + 2);
  for (const [x, y, c] of [[700, 1120, '#e8c060'], [760, 1130, '#e8c060'], [1320, 1130, '#7a5a3a'], [1370, 1120, '#3a5a3a']]) dot(x, y, 12, c);
  const bug = at(9, 'insects'), sd = at(9, 'seeds'), rt = at(9, 'rotting'); g.restore();
  label('BURROWS', 300, 300, 44, '#ffd9a0', t, at(9, 'burrows')); label('SEEDS', 260, 420, 38, '#e8c060', t, sd); label('INSECTS', 540, 420, 38, '#9fe0a0', t, bug); label('ROTTING PLANTS', 830, 420, 34, '#c8a070', t, rt); }
function s10(t) { const u = lt(t, A(10) - .3, E(10) + .3); g.fillStyle = '#1e140e'; g.fillRect(-100, -100, W + 200, H + 200); const z = lerp(1.9, 2.5, eio(u)); glow(CX, 960, 500, '255,190,120', .2); mammal(CX - 40, 960, z, t); label('OUR ANCESTOR', CX, 1300, 52, P.gold, t, at(10, 'ancestor')); }
function s11(t) { const u = lt(t, A(11) - .3, E(11) + .3); setCam(v3(0, 0, 0), 9, lerp(-.3, .15, u), .1); space(t); const e = pr(v3(0, 0, 0)); K.earth(e.x, e.y + 120, e.s * 1.5, t, 'keen', { rot: t * .3, look: 1, lookY: -1 }); asteroid(lerp(1200, -160, u), lerp(240, 620, u), 56, t); label('MISSED', CX, 300, 56, '#7fe0a0', t, at(11, 'missed')); }
function s12(t) { const u = lt(t, A(12) - .3, E(12)); setCam(v3(0, .5, 2), 6.2, lerp(-.34, .1, u), .08); land(t, 'night'); const c = PAL.night;
  const hz = pr(v3(0, 0, -400)).y; const R = mulberry(4); for (let i = 0; i < 50; i++) dot(R() * W, R() * hz, 1 + R() * 2.4, '#fff', .7);
  const ft = at(12, 'badger') - .3, st = pop(t, ft, .2);
  world([...plants(c), { p: v3(.1, 0, 3.4), draw: q => { mammal(q.x + 130, q.y - 60, 1.5, t, { flip: st > 0 }); if (st <= 0) return; const dy = (1 - Math.min(1, (t - ft) / .18)) * 1300, fx = q.x - 260, fy = q.y + 10 - dy; g.save(); g.translate(fx, fy); g.fillStyle = '#d0703e'; g.beginPath(); g.moveTo(-130, -1500); g.lineTo(130, -1500); g.lineTo(150, -90); g.quadraticCurveTo(250, -60, 250, 0); g.lineTo(-250, 0); g.quadraticCurveTo(-240, -60, -150, -90); g.fill(); g.fillStyle = '#fff2d8'; for (const x of [-180, -60, 60, 180]) { g.beginPath(); g.moveTo(x - 30, 0); g.lineTo(x, 42); g.lineTo(x + 30, 0); g.fill(); } g.restore(); } }]);
  const tk = at(12, 'Every'); [['HUNTER', 240], ['GRAZER', 540], ['GIANT', 840]].forEach(([s, x], i) => { const k = pop(t, tk + .15 + i * .3); if (k <= 0) return; g.save(); g.translate(x, 310); g.scale(k, k); card(0, 0, 270, 96, P.red); text(s, 0, 8, 34, P.white, 1000, null, 0); text('TAKEN', 0, 38, 22, '#ff9ab0', 1000, null, 0); g.restore(); });
  label('NO BIGGER THAN A BADGER', CX, 1340, 40, P.gold, t, at(12, 'badger')); }
function s13(t) { const u = lt(t, A(13) - .3, E(13) + .2); setCam(v3(0, 1, 0), 9.5, lerp(.36, -.2, u), .1); land(t, 'day'); const c = PAL.day; const gs = ss(lt(t, at(13, 'Within'), E(13)));
  world([...plants(c), { p: v3(.2, 0, 1.2), draw: q => { mammal(q.x, q.y - lerp(14, 150, gs), q.s / 264 * lerp(.3, 2.2, gs), t, {}); } }]);
  if (t < at(13, 'Within')) [['HUNTER', 240], ['GRAZER', 540], ['GIANT', 840]].forEach(([s, x], i) => { const k = pop(t, at(13, 'jobs') + i * .2); if (k <= 0) return; g.save(); g.translate(x, 310); g.scale(k, k); card(0, 0, 270, 96, '#7fe0a0'); text(s, 0, 8, 34, P.white, 1000, null, 0); text('OPEN', 0, 38, 22, '#7fe0a0', 1000, null, 0); g.restore(); });
  else label('WITHIN A MILLION YEARS', CX, 310, 42, P.gold, t, at(13, 'Within')); }
function ape(x, y, s, t, ph = 0) { g.save(); g.translate(x, y + Math.sin(t * 2 + ph) * 4); g.scale(s, s); g.fillStyle = '#3a2c28';
  g.beginPath(); g.ellipse(0, -150, 120, 150, 0, 0, TAU); g.fill(); g.lineCap = 'round'; g.strokeStyle = '#3a2c28'; g.lineWidth = 58; g.beginPath(); g.moveTo(-108, -230); g.quadraticCurveTo(-190, -130, -170, 0); g.moveTo(108, -230); g.quadraticCurveTo(190, -130, 170, 0); g.stroke(); g.lineWidth = 64; g.beginPath(); g.moveTo(-56, -40); g.lineTo(-62, 20); g.moveTo(56, -40); g.lineTo(62, 20); g.stroke();
  dot(0, -320, 92, '#3a2c28'); g.fillStyle = '#b08a70'; g.beginPath(); g.ellipse(0, -300, 66, 58, 0, 0, TAU); g.fill(); dot(-68, -318, 18, '#b08a70'); dot(68, -318, 18, '#b08a70'); dot(-24, -326, 10, P.navy); dot(24, -326, 10, P.navy); dot(-21, -329, 3.5, '#fff'); dot(27, -329, 3.5, '#fff'); dot(-8, -292, 4, '#5a4038'); dot(8, -292, 4, '#5a4038'); g.strokeStyle = '#5a4038'; g.lineWidth = 5; g.beginPath(); g.moveTo(-26, -268); g.quadraticCurveTo(0, -258, 26, -268); g.stroke(); g.restore(); }
function jungle(t) { const px = (t - at(14, 'apes')) * 26; const sk = g.createLinearGradient(0, 0, 0, H); sk.addColorStop(0, '#9fd8a0'); sk.addColorStop(1, '#2f7a4a'); g.fillStyle = sk; g.fillRect(-100, -100, W + 200, H + 200); const c = { trunk: '#3f2a1c', fern: '#2a7a44' };
  for (const [x, k] of [[60, 2.6], [980, 2.9], [320, 1.7], [760, 1.8]]) palmQ({ x: x - px * .4, y: 1560, s: 264 }, c, k); g.fillStyle = '#2a6a3a'; g.fillRect(-100, 1380, W + 200, H);
  ape(CX - 300 + px * .5, 1400, 1.05, t, 1); ape(CX + 300 + px * .5, 1420, 1.15, t, 2); ape(CX + px, 1500, 1.7, t, 0); }
function cityBig(t) { const px = (t - at(14, 'cities')) * 34, R = mulberry(12); const sk = g.createLinearGradient(0, 0, 0, H); sk.addColorStop(0, '#26304f'); sk.addColorStop(1, '#ff9a5c'); g.fillStyle = sk; g.fillRect(-100, -100, W + 200, H + 200);
  for (const [dep, top, cols] of [[.35, 520, ['#5a6288', '#4f5a80']], [.7, 760, ['#3a4068', '#333a60']], [1, 980, ['#232848', '#1c2140']]]) { let x = -200 - px * dep; while (x < W + 200) { const w = 120 + R() * 110, h = 1500 - top - R() * 260; g.fillStyle = cols[Math.floor(R() * 2)]; const y = 1500 - h; g.fillRect(x, y, w, h); for (let wy = y + 22; wy < 1480; wy += 46) for (let wx = x + 14; wx < x + w - 18; wx += 34) if (R() > .35) { g.fillStyle = `rgba(255,216,130,${.45 + .5 * dep})`; g.fillRect(wx, wy, 16, 22); } x += w + 8; } }
  g.fillStyle = '#14162e'; g.fillRect(-100, 1500, W + 200, H); for (let i = 0; i < 6; i++) { const x = ((i * 240 + t * 170) % (W + 240)) - 120; dot(x, 1560, 8, '#ffe08a'); dot(x + 44, 1560, 8, '#ffe08a'); } }
function s14(t) { const u = lt(t, A(14) - .3, E(14) + .3);
  const na = words.l14.filter(w => nrm(w[0]) === 'no').map(w => VO.l14 + Math.max(0, w[1])), b1 = na[na.length - 3], b2 = na[na.length - 2], b3 = na[na.length - 1];
  if (t < b1 - .05) { setCam(v3(0, 1.2, 0), 10, lerp(-.3, .1, u), .1); land(t, 'day'); const c = PAL.day; world([...plants(c), { p: v3(-2, 0, 0), draw: q => dinoQ(q, .75, 0, t) }, { p: v3(3, 0, -2.5), draw: q => dinoQ(q, .6, 1, t + 1) }, { p: v3(.8, 0, 3.2), draw: q => mammal(q.x, q.y - 20, .6, t) }]); return; }
  const flash = tt => { const f = 1 - lt(t, tt - .05, tt + .16); if (f > 0 && f < 1) { g.fillStyle = `rgba(255,255,255,${f * .8})`; g.fillRect(-100, -100, W + 200, H + 200); } };
  const gone = (t0, t1) => { const k = ss(lt(t, t0 + .32, t1 - .1)); if (k > 0) { g.fillStyle = `rgba(8,6,20,${k * .72})`; g.fillRect(-100, -100, W + 200, H + 200); } };
  if (t < b2 - .05) { jungle(t); gone(b1, b2); stamp('NO APES', P.red, t, b1 + .12, CX, 420); flash(b1); return; }
  if (t < b3 - .05) { cityBig(t); gone(b2, b3); stamp('NO CITIES', P.red, t, b2 + .12, CX, 420); flash(b2); return; }
  const v = ss(lt(t, b3 + .55, b3 + 1.1)); setCam(v3(0, 1.2, 0), 9.4, .1, .1); land(t, 'day');
  world([...plants(PAL.day), { p: v3(.1, 0, 3), draw: q => { g.save(); g.globalAlpha *= 1 - v; person(q.x, q.y - 250, 3.1); g.restore(); } }, { p: v3(lerp(9, 1.5, ss(lt(t, b3 + .4, b3 + 1.7))), 0, -.5), draw: q => dinoQ(q, .75, 1, t) }]);
  stamp('NO YOU', P.red, t, b3 + .12, CX, 420); flash(b3); }
function s15(t) { const u = lt(t, A(15) - .3, E(15) + .2), rise = eio(u) * 620; g.fillStyle = '#6a5a4a'; g.fillRect(-100, -100, W + 200, H + 200); g.save(); g.translate(Math.sin(u * 2) * 24, rise - 200);
  g.fillStyle = '#857058'; g.fillRect(-200, 300, W + 400, 300); g.fillStyle = '#6a5642'; g.fillRect(-200, 600, W + 400, 700); g.fillStyle = '#54432f'; g.fillRect(-200, 1300, W + 400, 800);
  const R = mulberry(10); g.fillStyle = 'rgba(0,0,0,.14)'; for (let i = 0; i < 90; i++) g.fillRect(R() * W, 300 + R() * 1700, 30 + R() * 90, 6);
  g.strokeStyle = '#efe6d4'; g.lineWidth = 22; g.lineCap = 'round'; g.beginPath(); g.moveTo(180, 1040); g.quadraticCurveTo(420, 980, 640, 1020); g.quadraticCurveTo(760, 900, 820, 760); g.stroke(); for (let i = 0; i < 7; i++) { const x = 300 + i * 52; g.lineWidth = 12; g.beginPath(); g.moveTo(x, 1000); g.quadraticCurveTo(x + 8, 1080, x - 12, 1130); g.stroke(); } g.fillStyle = '#efe6d4'; g.beginPath(); g.ellipse(860, 720, 84, 50, -.3, 0, TAU); g.fill(); dot(880, 708, 16, '#54432f');
  g.restore(); label('DIED OUT?', CX, 310, 56, P.gold, t, at(15, 'did')); }
function s16(t) { const u = lt(t, A(16) - .3, E(16) + .5), lift = ss(u); g.save(); const sky = g.createLinearGradient(0, 0, 0, H); sky.addColorStop(0, lerp(0, 1, lift) > .5 ? '#ffd9a0' : '#3a2a30'); sky.addColorStop(1, '#2a1c20'); g.fillStyle = sky; g.fillRect(-100, -100, W + 200, H + 200); glow(lerp(300, 820, u), lerp(1000, 380, u), 620, '255,220,150', .15 + .5 * lift); ash(t, 60, .6 * (1 - lift));
  g.fillStyle = '#1c1416'; g.beginPath(); g.moveTo(-100, 1400); for (let x = -100; x <= W + 100; x += 80) g.lineTo(x, 1340 - Math.abs(Math.sin(x * .011)) * 80); g.lineTo(W + 100, H + 100); g.lineTo(-100, H + 100); g.fill(); feathered(lerp(120, 660, u), lerp(1220, 640, u), 1.5, t); g.restore(); label('THEY SURVIVED', CX, 310, 48, '#7fe0d0', t, at(16, 'made')); }
function s17(t) { const u = lt(t, A(17) - .3, DUR), w = room(t, lerp(70, 0, u)), sh = ss(lt(t, at(17, 'dinosaur') - .2, at(17, 'dinosaur') + .5));
  if (sh > 0) { g.save(); g.globalAlpha *= sh * .34; g.filter = 'brightness(0)'; K.dino(w.lx + 150, 1500, .46, t); g.filter = 'none'; g.restore(); }
  pigeon(w.lx + 40, w.ly - 50, 1.25, t); person(170, 1420, 2.4); const ca = pop(t, E(17) + .3, .4); if (ca <= 0) label('A LIVING DINOSAUR', CX, 300, 48, P.gold, t, at(17, 'dinosaur'));
  if (ca > 0) { g.save(); g.translate(CX, 300); g.scale(ca, ca); card(0, 0, 860, 110, '#7fd3ff'); text('What would Earth look like today? ↓', 0, 14, 40, P.white, 1000, null, 0); g.restore(); } }
const SC = [[0, s01], [A(2) - .3, s02], [A(3) - .3, s03], [A(4) - .3, s04], [A(5) - .3, s05], [A(7) - .35, s07], [A(9) - .3, s09], [A(10) - .3, s10], [A(11) - .35, s11], [A(12) - .3, s12], [A(13) - .3, s13], [A(14) - .3, s14], [A(15) - .35, s15], [A(16) - .3, s16], [A(17) - .3, s17]];
const XF = .45;

// ───────── subtitles: word-pops on real spoken timing, key words in gold (Earth Rings)
const KEY = new Set(['rock', 'wrong', 'spot', '66', 'asteroid', 'mexico', 'grain', 'sand', 'problem', 'dinosaurs', 'sea', 'sulfur', 'oil', 'sky', 'soot', 'sun', 'months', '13', 'worst', 'darkness', 'sunlight', 'eat', 'starved', 'dog', 'small', 'burrows', 'seeds', 'insects', 'rotting', 'ancestor', 'missed', 'mammals', '100', 'hundred', 'badger', 'job', 'taken', 'vanished', 'bigger', 'door', 'apes', 'cities', 'you', 'died', 'feathered', 'dark', 'pigeon', 'dinosaur', 'rock', 'possible', 'alive']);
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

// ───────── thumbnail (?thumb=1): the asteroid just skims past Earth, with a tiny dinosaur watching from the top
function thumb() {
  use(G0); g.setTransform(1, 0, 0, 1, 0, 0); setCam(v3(0, 0, 0), 9, .3, .1); space(1);
  const ex = 590, ey = 1250, R = 370; glow(ex, ey, R * 1.5, '90,170,255', .35);
  // a curved flame tail passing just over Earth
  const gr = g.createLinearGradient(170, 780, 1120, 600); gr.addColorStop(0, 'rgba(255,200,100,.95)'); gr.addColorStop(1, 'rgba(255,110,60,0)'); g.fillStyle = gr; g.beginPath(); g.moveTo(150, 720); g.quadraticCurveTo(640, 690, 1120, 590); g.lineTo(1120, 620); g.quadraticCurveTo(640, 800, 170, 860); g.fill();
  K.earth(ex, ey, R, 1, 'scared', { rot: 1.1, look: -1, lookY: -1 }); g.save(); g.translate(ex, ey); g.restore();
  g.fillStyle = '#7fd3ff'; for (const [x, y, k] of [[ex + 300, ey - 210, 1.5], [ex - 320, ey - 170, 1.2]]) { g.beginPath(); g.moveTo(x, y - 34 * k); g.quadraticCurveTo(x + 22 * k, y + 6 * k, x, y + 18 * k); g.quadraticCurveTo(x - 22 * k, y + 6 * k, x, y - 34 * k); g.fill(); }
  g.save(); g.translate(ex + 40, ey - R + 8); g.scale(-1, 1); K.dino(0, -28, .17, 0); g.restore();
  asteroid(170, 790, 104, 1, 0);
  text('WHAT IF IT', CX, 240, 126, P.white, 1000, P.navy, 22); text('MISSED?', CX, 400, 168, P.gold, 1000, P.navy, 26);
  g.save(); g.translate(CX, 1720); g.rotate(-.04); g.fillStyle = P.red; g.beginPath(); g.roundRect(-250, -66, 500, 132, 66); g.fill(); text('NO YOU', 0, 28, 84, P.white, 1000, null, 0); g.restore();
}
const TH = new URLSearchParams(location.search).get('thumb');
window.EV = TL.lines.map(l => ({ type: 'vo', id: l.id, t: l.t })); window.DUR = DUR;
window.SUBS = TL.lines.map(l => ({ t0: l.t, t1: l.t + l.d + .3, text: l.id }));
if (TH) { window.render = () => thumb(); thumb(); } else { window.render = render; render(+(new URLSearchParams(location.search).get('t') ?? 1.0)); }
window.READY = true;
