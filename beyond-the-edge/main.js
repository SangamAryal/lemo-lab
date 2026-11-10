// "What Is Beyond the Edge of the Observable Universe?" — one narrator (Ryan). A beam of light crossing stretching space,
// the observable bubble, everyone's own overlapping bubble, "not a wall", galaxies whose light never arrives, infinite or
// curved (an ant on a globe), and the bubble shrinking to a speck. Flat Beyond Everything kit art, 2.5D, 1080×1920,
// deterministic in t. ?thumb=1 draws the thumbnail.
import * as K from './kit.js';
import { clamp, lerp, seg, ss, eio, eo, mulberry, TAU } from '/core/lib.js';
const { P, text, glow } = K;
const W = 1080, H = 1920, CX = W / 2;
const main = document.getElementById('c'), G0 = main.getContext('2d');
const off = document.createElement('canvas'); off.width = W; off.height = H; const G1 = off.getContext('2d');
let g = G0; const use = c => { g = c; K.setup(c, W, H); }; use(G0); K.makeStars(150, 23);
await document.fonts.load('900 80px NU'); await document.fonts.load('800 40px NU');
const TL = await (await fetch('timeline.json')).json();
const LN = Object.fromEntries(TL.lines.map(l => [l.id, l])), DUR = TL.dur;
const at = id => LN[id].t, end = id => LN[id].t + LN[id].d, mid = id => LN[id].t + LN[id].d / 2;
const dot = (x, y, r, c, a = 1) => { const o = g.globalAlpha; g.globalAlpha = o * a; g.fillStyle = c; g.beginPath(); g.arc(x, y, r, 0, TAU); g.fill(); g.globalAlpha = o; };
const pop = (t, t0, d = .35) => { const u = clamp((t - t0) / d); return u <= 0 ? 0 : 1 + Math.sin(u * Math.PI) * .2 * (1 - u); };
const fadeIO = (t, a, b, d = .25) => ss(seg(t, a, a + d)) * (1 - ss(seg(t, b - d, b)));
const card = (x, y, w, h, col, a = 1, k = 1) => { g.save(); g.globalAlpha *= a; g.translate(x, y); g.scale(k, k); g.fillStyle = 'rgba(12,10,44,.86)'; g.beginPath(); g.roundRect(-w / 2, -h / 2, w, h, Math.min(h / 2, 40)); g.fill(); if (col) { g.strokeStyle = col; g.lineWidth = 5; g.stroke(); } g.restore(); };
const label = (s, x, y, px, col, t, t0, a = 1) => { const k = pop(t, t0); if (k <= 0) return; g.save(); g.globalAlpha *= a; g.translate(x, y); g.scale(k, k); g.font = `1000 ${px}px NU`; const ww = g.measureText(s).width + px * 1.4; card(0, 0, ww, px * 1.9, col); text(s, 0, px * .36, px, col || P.white, 1000, null, 0); g.restore(); };
function stamp(s, col, t, t0, x = CX, y = 1330) { const k = pop(t, t0, .3); if (k <= 0) return; const z = t < t0 + .15 ? 1 + 1.5 * (1 - (t - t0) / .15) : 1; g.save(); g.translate(x, y); g.rotate(-.1); g.scale(z * k, z * k); g.font = '1000 72px NU'; const w = g.measureText(s).width + 80; g.fillStyle = 'rgba(12,10,44,.8)'; g.beginPath(); g.roundRect(-w / 2, -62, w, 124, 18); g.fill(); g.strokeStyle = col; g.lineWidth = 10; g.stroke(); text(s, 0, 26, 72, col, 1000, null, 0); g.restore(); }

const SKIN = ['#f2b48c', '#c98d64', '#8a5a3c', '#e8c0a0'];
function person(x, y, s, shirt, skin, o = {}) {                   // standing figure; o.squint, o.sweat, o.icecream, o.shade (hand over eyes), o.bag
  g.save(); g.translate(x, y); g.scale(s, s);
  g.fillStyle = '#2d2f5e'; g.fillRect(-16, 0, 13, 70); g.fillRect(3, 0, 13, 70);
  g.fillStyle = shirt; g.beginPath(); g.roundRect(-26, -78, 52, 84, 18); g.fill();
  g.fillStyle = skin; g.beginPath(); g.arc(0, -104, 28, 0, TAU); g.fill();
  g.fillStyle = '#2b2140'; g.beginPath(); g.arc(0, -112, 28, Math.PI, TAU); g.fill();
  g.fillStyle = P.navy; if (o.squint) { g.lineWidth = 3; g.strokeStyle = P.navy; for (const s2 of [-1, 1]) { g.beginPath(); g.moveTo(s2 * 12 - 6, -102); g.lineTo(s2 * 12 + 6, -102); g.stroke(); } } else for (const s2 of [-1, 1]) { g.beginPath(); g.arc(s2 * 11, -102, 3.5, 0, TAU); g.fill(); }
  g.strokeStyle = P.navy; g.lineWidth = 3; g.beginPath(); if (o.sweat || o.squint) { g.moveTo(-7, -88); g.lineTo(7, -90); } else g.arc(0, -94, 7, .2, Math.PI - .2); g.stroke();
  g.strokeStyle = skin; g.lineWidth = 11; g.lineCap = 'round';
  if (o.shade) { g.beginPath(); g.moveTo(22, -60); g.lineTo(26, -110); g.lineTo(-4, -122); g.stroke(); } else { g.beginPath(); g.moveTo(-26, -60); g.lineTo(-34, -10); g.stroke(); }
  if (o.icecream) { g.beginPath(); g.moveTo(24, -60); g.lineTo(36, -30); g.stroke(); g.fillStyle = '#e8b06a'; g.beginPath(); g.moveTo(30, -36); g.lineTo(46, -36); g.lineTo(38, -6); g.fill(); dot(38, -42, 11, o.melt ? '#ffd0e0' : '#ff9ec0'); if (o.melt) { g.fillStyle = '#ff9ec0'; g.fillRect(36, -34, 4, 40); } }
  else if (!o.shade) { g.beginPath(); g.moveTo(26, -60); g.lineTo(34, -10); g.stroke(); }
  if (o.bag) { g.fillStyle = '#c84d3a'; g.beginPath(); g.roundRect(30, -20, 56, 44, 8); g.fill(); g.fillStyle = '#fff'; g.font = '900 16px NU'; g.textAlign = 'center'; g.fillText('MARS', 58, 8); }
  if (o.sweat) { g.fillStyle = '#7fd3ff'; g.beginPath(); g.ellipse(26, -112, 5, 8, 0, 0, TAU); g.fill(); }
  g.restore();
}

// ───────── galaxies and bubbles
function galaxy(x, y, r, rot, col, a = 1) {
  g.save(); g.globalAlpha *= a; g.translate(x, y); g.rotate(rot); glow(0, 0, r * 2, col, .5); g.scale(1, .62);
  const c = `rgb(${col})`; g.strokeStyle = c; g.lineWidth = Math.max(1.5, r * .16); g.lineCap = 'round';
  for (const s of [0, Math.PI]) { g.beginPath(); for (let u = 0; u < 3.6; u += .25) { const rr = r * (.12 + u * .25); g.lineTo(Math.cos(u + s) * rr, Math.sin(u + s) * rr); } g.stroke(); }
  dot(0, 0, r * .24, '#fff8e0'); g.restore();
}
const GCOL = ['255,220,170', '170,210,255', '255,190,210', '200,190,255'];
const GAL = (() => { const R = mulberry(77), a = []; for (let i = 0; i < 560; i++) { const q = Math.sqrt(R()) * 3600, th = R() * TAU; a.push({ x: Math.cos(th) * q, y: Math.sin(th) * q, r: 9 + R() * 15, rot: R() * TAU, c: GCOL[i % 4] }); } return a; })();
function field(t, cx, cy, z, a = 1) { for (const G of GAL) { const x = cx + G.x * z, y = cy + G.y * z; if (x < -40 || x > W + 40 || y < 300 || y > H + 40) continue; galaxy(x, y, Math.max(3, G.r * Math.sqrt(z)), G.rot + t * .05, G.c, a); } }
function bubble(x, y, R, rgb, a = 1) {
  g.save(); g.globalAlpha *= a; const gr = g.createRadialGradient(x, y, R * .2, x, y, R); gr.addColorStop(0, `rgba(${rgb},.05)`); gr.addColorStop(.8, `rgba(${rgb},.1)`); gr.addColorStop(1, `rgba(${rgb},.32)`); g.fillStyle = gr; g.beginPath(); g.arc(x, y, R, 0, TAU); g.fill();
  g.strokeStyle = `rgba(${rgb},.95)`; g.lineWidth = 5; g.stroke(); g.restore();
}
const CB = { x: CX, y: 960 };

// ───────── a night hill with a radio dish
function hill(t, o = {}) {
  K.bg(t);
  const R = mulberry(9); for (let i = 0; i < 90; i++) { const x = R() * W, y = 300 + R() * 850, r = 1.5 + R() * 3; dot(x, y, r, '#fff', .45 + .45 * Math.sin(t * 2 + i)); }
  const gr = g.createLinearGradient(0, 1200, 0, H); gr.addColorStop(0, '#1b1a4a'); gr.addColorStop(1, '#0a0826'); g.fillStyle = gr; g.beginPath(); g.moveTo(0, 1320); g.quadraticCurveTo(420, 1160, W, 1290); g.lineTo(W, H); g.lineTo(0, H); g.fill();
  // the dish
  g.save(); g.translate(760, 1230); g.fillStyle = '#5a5f8a'; g.beginPath(); g.moveTo(-26, 0); g.lineTo(26, 0); g.lineTo(52, 170); g.lineTo(-52, 170); g.fill(); g.rotate(-.5); g.fillStyle = '#d9dbe8'; g.beginPath(); g.ellipse(0, -30, 190, 74, 0, 0, Math.PI); g.fill(); g.fillStyle = '#aab0cc'; g.beginPath(); g.ellipse(0, -30, 190, 34, 0, 0, TAU); g.fill(); g.strokeStyle = '#d9dbe8'; g.lineWidth = 8; g.beginPath(); g.moveTo(0, -30); g.lineTo(0, -160); g.stroke(); dot(0, -166, 13, P.gold); g.restore();
  person(300, 1370, 1.45, '#4f7dff', SKIN[1], {});
  if (o.waves) for (let i = 0; i < 6; i++) { const u = (t * .55 + i / 6) % 1, y = lerp(330, 1010, u); g.save(); g.globalAlpha *= (o.waves) * Math.sin(u * Math.PI) * .9; g.strokeStyle = '#ffb066'; g.lineWidth = 7; g.beginPath(); g.arc(700, y - 500, 500, 1.3, 1.85); g.stroke(); g.restore(); }
}
function sDish(t) { hill(t, { waves: 1 }); label('THE OLDEST LIGHT', CX, 430, 46, '#ffb066', t, .5); }

// ───────── light crossing stretching space: Earth stays at the bottom, the grid stretches away from it
const EY = 1400, G12 = 12;
const spOf = t => lerp(70, 205, ss(seg(t, at('02') - .2, end('03') - .3)));
function sBeam(t) {
  K.bg(t); const sp = spOf(t), str = (sp - 70) / 135;
  g.save(); g.strokeStyle = 'rgba(150,170,255,.28)'; g.lineWidth = 2; for (let k = 0; k * sp < EY; k++) { const y = EY - k * sp; g.beginPath(); g.moveTo(0, y); g.lineTo(W, y); g.stroke(); } for (let j = -12; j <= 12; j++) { const x = CX + j * sp; g.beginPath(); g.moveTo(x, 0); g.lineTo(x, H); g.stroke(); } g.restore();
  const R = mulberry(4); for (let i = 0; i < 16; i++) { const j = (R() * 2 - 1) * 7, k = 1 + R() * 14, x = CX + j * sp, y = EY - k * sp; if (y > 320 && Math.abs(j) > .7) galaxy(x, y, 16, i, GCOL[i % 4]); }
  const gy = EY - G12 * sp; if (gy > 240) { glow(CX, gy, 240, '255,150,70', .7); for (const [dx, dy, r] of [[0, 0, 80], [-70, 20, 55], [70, 15, 60], [20, -40, 55]]) dot(CX + dx, gy + dy, r, '#ff9a4a', .75); text('GLOWING GAS', CX, gy + 8, 34, P.white, 1000, P.navy, 8); }
  // the light: a wave fixed to the grid, so it stretches with space; it reddens as it goes
  const p = clamp((t - (at('01') + 2.6)) / (end('03') - at('01') - 2.9)), k0 = lerp(G12 - 1, .8, p);
  const col = `rgb(${Math.round(lerp(190, 255, str))},${Math.round(lerp(225, 90, str))},${Math.round(lerp(255, 60, str))})`;
  g.save(); g.strokeStyle = col; g.lineWidth = 9; g.lineCap = 'round'; g.shadowColor = col; g.shadowBlur = 18; g.beginPath(); for (let u = 0; u <= 3; u += .03) { const y = EY - (k0 + u) * sp; g.lineTo(CX + Math.sin(u * TAU * 2.2) * 34, y); } g.stroke(); g.restore();
  K.earth(CX, EY, 74, t, str > .9 ? 'keen' : 'happy', { rot: t * .3, lookY: -1 });
  label('13.8 BILLION YEARS AGO', CX, 430, 40, '#ffb066', t, at('01') + 3.3, 1 - ss(seg(t, at('02') - .2, at('02') + .1)));
  if (t > at('02') + 1) { label('NOW 46 BILLION LIGHT-YEARS AWAY', CX, 430, 36, P.gold, t, at('02') + 1.2, 1 - ss(seg(t, at('03') + .2, at('03') + .5))); const a = ss(seg(t, at('02') + 1, at('02') + 1.5)); g.save(); g.globalAlpha *= a; g.strokeStyle = P.gold; g.fillStyle = P.gold; g.lineWidth = 6; g.setLineDash([14, 12]); g.beginPath(); g.moveTo(CX + 170, EY - 40); g.lineTo(CX + 170, 560); g.stroke(); g.setLineDash([]); g.beginPath(); g.moveTo(CX + 170, 510); g.lineTo(CX + 148, 560); g.lineTo(CX + 192, 560); g.fill(); g.restore(); }
  label('SPACE KEEPS STRETCHING', CX, 430, 42, '#9fd0ff', t, at('03') + .6);
}

// ───────── the bubble
function sBubble(t) {
  K.bg(t); const R = 430 * ss(seg(t, at('04') + .1, at('04') + 1.7));
  field(t, CB.x, CB.y, 1, .22);
  if (R > 2) { g.save(); g.beginPath(); g.arc(CB.x, CB.y, R, 0, TAU); g.clip(); field(t, CB.x, CB.y, 1, 1); g.restore(); bubble(CB.x, CB.y, R, '255,210,120'); }
  K.earth(CB.x, CB.y, 30, t, 'happy', { rot: t * .4 });
  label('THE OBSERVABLE UNIVERSE', CX, 430, 40, P.gold, t, at('04') + .5);
  const a = ss(seg(t, at('04') + 2.2, at('04') + 2.7)); if (a > 0) { g.save(); g.globalAlpha *= a; g.strokeStyle = P.white; g.lineWidth = 5; g.beginPath(); g.moveTo(CB.x - 430, CB.y + 470); g.lineTo(CB.x + 430, CB.y + 470); g.moveTo(CB.x - 430, CB.y + 450); g.lineTo(CB.x - 430, CB.y + 490); g.moveTo(CB.x + 430, CB.y + 450); g.lineTo(CB.x + 430, CB.y + 490); g.stroke(); g.restore(); label('93 BILLION LIGHT-YEARS', CX, CB.y + 470, 36, P.white, t, at('04') + 2.5); }
  if (t > at('04') + 3.6) { label('US', CB.x, CB.y - 66, 30, '#7fd3ff', t, at('04') + 3.8); }
}
function alien(x, y, s, t, col) { g.save(); g.translate(x, y); g.scale(s, s); g.fillStyle = col; g.beginPath(); g.ellipse(0, 0, 22, 26, 0, 0, TAU); g.fill(); dot(-8, -4, 7, '#fff'); dot(8, -4, 7, '#fff'); dot(-8, -4, 3, P.navy); dot(8, -4, 3, P.navy); g.strokeStyle = col; g.lineWidth = 4; g.lineCap = 'round'; g.beginPath(); g.moveTo(-10, -24); g.lineTo(-16, -40); g.moveTo(10, -24); g.lineTo(16, -40); g.stroke(); g.strokeStyle = col; g.lineWidth = 6; g.beginPath(); g.moveTo(22, 2); g.lineTo(38, -14 + Math.sin(t * 8) * 8); g.stroke(); g.restore(); }
function sOverlap(t) {                                             // everyone has their own bubble (overlapping, not a multiverse)
  K.bg(t); const u = ss(seg(t, at('05') - .3, at('05') + .9)), Rr = lerp(430, 270, u), ox = lerp(CX, 420, u), oy = lerp(960, 860, u);
  field(t, CX, 960, lerp(1, .62, u), .55);
  const B = [[730, 790, '140,220,255', at('05') + 1.5, '#7fe0ff'], [640, 1160, '255,150,200', at('05') + 2.4, '#ff9ec8']];
  for (const [x, y, rgb, t0, col] of B) { const k = ss(seg(t, t0, t0 + .7)); if (k > 0) { bubble(x, y, 270 * k, rgb, .9); alien(x, y, 1.1 * k, t, col); } }
  bubble(ox, oy, Rr, '255,210,120'); K.earth(ox, oy, 28, t, 'happy', { rot: t * .4 });
  text('OURS', ox, oy + 72, 34, P.gold, 1000, P.navy, 8, 'center', u);
  text('THEIRS', 730, 700, 34, '#7fe0ff', 1000, P.navy, 8, 'center', ss(seg(t, B[0][3] + .3, B[0][3] + .7)));
  text('THEIRS', 640, 1250, 34, '#ff9ec8', 1000, P.navy, 8, 'center', ss(seg(t, B[1][3] + .3, B[1][3] + .7)));
  label('EVERYONE HAS THEIR OWN', CX, 430, 40, P.white, t, at('05') + 2.6);
}
function sWall(t) {                                                // not a wall: just how far light has travelled
  K.bg(t); const ex = CX, ey = 1430, R = 760;
  field(t, CX, 400, 1, .8);
  g.save(); g.fillStyle = 'rgba(255,210,120,.08)'; g.beginPath(); g.arc(ex, ey, R, 0, TAU); g.fill(); g.strokeStyle = 'rgba(255,210,120,.95)'; g.lineWidth = 5; g.setLineDash([18, 14]); g.beginPath(); g.arc(ex, ey, R, 0, TAU); g.stroke(); g.restore();
  const go = ss(seg(t, at('06') + 1.1, at('06') + 1.7));              // the bricks drop away
  for (let i = -9; i <= 9; i++) for (let row = 0; row < 3; row++) { const a = -Math.PI / 2 + i * .085 + (row % 2) * .04, rr = R + row * 34; const x = ex + Math.cos(a) * rr, y = ey + Math.sin(a) * rr + go * go * (500 + (i * 37 % 200)); g.save(); g.globalAlpha *= (1 - go) * .98; g.translate(x, y); g.rotate(a + Math.PI / 2 + go * i * .1); g.fillStyle = (i + row) % 2 ? '#c9654a' : '#a24a35'; g.fillRect(-32, -15, 62, 29); g.restore(); }
  if (go < .1) label('A WALL?', CX, 420, 46, P.white, t, at('06') + .1); else stamp('NO WALL', P.red, t, at('06') + 1.1, CX, 450);
  K.earth(ex, ey, 62, t, 'happy', { rot: t * .3, lookY: -1 });
  if (t > at('06') + 1.8) { const a = ss(seg(t, at('06') + 1.8, at('06') + 2.2)); for (const [gx, gy, c] of [[230, 380, '#ffb066'], [810, 400, '#9fd0ff'], [CX, 340, '#ffc73a']]) { g.save(); g.globalAlpha *= a; g.strokeStyle = c; g.lineWidth = 7; g.setLineDash([16, 16]); g.lineDashOffset = -t * 90; const tx = lerp(gx, ex, .55), ty = lerp(gy, ey, .55); g.beginPath(); g.moveTo(gx, gy); g.lineTo(tx, ty); g.stroke(); g.restore(); dot(tx, ty, 11, c, a); }
    label('LIGHT STILL ON ITS WAY', CX, 1180, 36, '#ffb066', t, at('06') + 2.1); }
}
function sPast(t) {                                                // zoom out: space keeps going
  K.bg(t); const u = ss(seg(t, at('07') - .2, end('07') + .1)), z = lerp(1, .3, u), R = 430 * z;
  field(t, CB.x, CB.y, z, 1); bubble(CB.x, CB.y, R, '255,210,120');
  label('OUR BUBBLE', CB.x, CB.y + R + 56, 32, P.gold, t, at('07') + .3);
  label('SPACE KEEPS GOING', CX, 430, 44, P.white, t, at('07') + .4);
}
function sNever(t) {                                               // 08–09: light that will never arrive
  K.bg(t); const e = ss(seg(t, at('09') + .2, end('09') + .1)), sp = lerp(70, 240, e * e);
  g.save(); g.strokeStyle = 'rgba(150,170,255,.25)'; g.lineWidth = 2; for (let k = 0; k * sp < EY; k++) { const y = EY - k * sp; g.beginPath(); g.moveTo(0, y); g.lineTo(W, y); g.stroke(); } for (let j = -12; j <= 12; j++) { const x = CX + j * sp; g.beginPath(); g.moveTo(x, 0); g.lineTo(x, H); g.stroke(); } g.restore();
  field(t, CX, 300, .8, .18);
  const gy = EY - 13 * sp; if (gy > 200) galaxy(CX, gy, 90, t * .1, GCOL[1]);
  // the pulse crawls toward Earth along the grid, but the grid grows faster than it can cross
  if (t > at('09')) { const kp = lerp(13, 8, clamp((t - at('09')) / (end('09') - at('09')))), y = EY - kp * sp; if (y > 330) { g.save(); g.strokeStyle = '#9fd0ff'; g.lineWidth = 9; g.shadowColor = '#9fd0ff'; g.shadowBlur = 16; g.beginPath(); for (let u = 0; u <= 1.5; u += .03) g.lineTo(CX + Math.sin(u * TAU * 2) * 30, y - u * sp); g.stroke(); g.restore(); } else { g.fillStyle = '#9fd0ff'; g.beginPath(); g.moveTo(CX, 340); g.lineTo(CX - 26, 390); g.lineTo(CX + 26, 390); g.fill(); text('light', CX, 430, 30, '#9fd0ff', 1000, P.navy, 8); } }
  K.earth(CX, EY, 74, t, t > at('09') + 4 ? 'sad' : 'worried', { rot: t * .3, lookY: -1 });
  if (t < at('09')) label('MOST OF IT', CX, 430, 46, P.white, t, at('08') + .2);
  label('SPACE STRETCHES FASTER', CX, 1150, 38, '#9fd0ff', t, at('09') + 1.4, 1 - ss(seg(t, at('09') + 3.6, at('09') + 3.9)));
  label('A BILLION YEARS LATER…', CX, 1150, 38, P.white, t, at('09') + 3.9, 1 - ss(seg(t, at('09') + 4.8, at('09') + 5)));
  stamp('NEVER', P.red, t, at('09') + 5, CX, 1130);
}
function sInf(t) {                                                 // 10–11: forever?
  K.bg(t); const hy = 800;
  g.save(); g.strokeStyle = 'rgba(150,170,255,.5)'; g.lineWidth = 3; for (let j = -14; j <= 14; j++) { g.beginPath(); g.moveTo(CX + j * 12, hy); g.lineTo(CX + j * 260, H); g.stroke(); } const sh = (t * .5) % 1; for (let k = 0; k < 16; k++) { const d = (k + sh) / 16, y = hy + (H - hy) * d * d; g.beginPath(); g.moveTo(0, y); g.lineTo(W, y); g.stroke(); } g.restore();
  const R = mulberry(5); for (let i = 0; i < 18; i++) { const d = ((R() + t * .1) % 1), x = CX + (R() * 2 - 1) * 1000 * d * d, y = hy - 40 - (R() * 300 + 40) * d; galaxy(x, y, 6 + 34 * d * d, i, GCOL[i % 4], Math.min(1, d * 3)); }
  const q = fadeIO(t, at('10') - .3, at('11') - .1), inf = ss(seg(t, at('11') - .1, at('11') + .3));
  if (q > 0) text('?', CX, 720, 300, P.gold, 1000, P.navy, 24, 'center', q);
  if (inf > 0) { const k = pop(t, at('11') - .1, .4); g.save(); g.translate(CX, 640); g.scale(k * 1.6, k * .95); g.strokeStyle = P.gold; g.lineWidth = 34; g.beginPath(); g.moveTo(0, 0); g.bezierCurveTo(70, -130, 180, -130, 180, 0); g.bezierCurveTo(180, 130, 70, 130, 0, 0); g.bezierCurveTo(-70, -130, -180, -130, -180, 0); g.bezierCurveTo(-180, 130, -70, 130, 0, 0); g.stroke(); g.restore(); }
  label('NOBODY KNOWS', CX, 430, 44, P.white, t, at('10') + 1.6, 1 - inf); label('INFINITE?', CX, 430, 44, P.gold, t, at('11') + .1);
}
function ant(x, y, s, ang, t) { g.save(); g.translate(x, y); g.rotate(ang); g.scale(s, s); g.fillStyle = '#2a1a14'; g.strokeStyle = '#2a1a14'; g.lineWidth = 4; g.lineCap = 'round'; for (const dx of [-12, 0, 12]) for (const sd of [-1, 1]) { const w = Math.sin(t * 16 + dx) * 5; g.beginPath(); g.moveTo(dx, 0); g.lineTo(dx + w, sd * 24); g.stroke(); } g.beginPath(); g.ellipse(-24, 0, 17, 11, 0, 0, TAU); g.fill(); g.beginPath(); g.ellipse(0, 0, 11, 8, 0, 0, TAU); g.fill(); g.beginPath(); g.ellipse(20, 0, 11, 10, 0, 0, TAU); g.fill(); g.beginPath(); g.moveTo(26, -6); g.lineTo(42, -16); g.moveTo(26, 6); g.lineTo(42, 16); g.stroke(); g.restore(); }
function sGlobe(t) {                                               // 12: an ant on a globe never reaches an edge
  K.bg(t); const cx = CX, cy = 920, r = 360; K.earth(cx, cy, r, t, 'happy', { rot: 1.1, noFace: true });
  const u = (t - at('12')) * 1.5;
  const path = q => ({ x: cx + Math.sin(q) * r * .97, y: cy - 30 + Math.cos(q) * 120, z: Math.cos(q) });
  g.save(); g.strokeStyle = 'rgba(255,255,255,.8)'; g.lineWidth = 5; g.setLineDash([10, 12]); g.beginPath(); for (let q = -1.5; q <= 1.5; q += .05) { const p = path(q); g.lineTo(p.x, p.y); } g.stroke(); g.restore();
  const q = ((u + Math.PI) % TAU) - Math.PI, p = path(q);
  if (p.z > 0) ant(p.x, p.y, 1.35 * (.5 + .5 * p.z), Math.atan2(-Math.sin(q) * 120, Math.cos(q) * r * .97), t);
  label('NO EDGE TO FALL OFF', CX, 1370, 42, P.white, t, at('12') + 3);
  label('FINITE', CX, 430, 46, P.gold, t, at('12') + 2.4);
}
function sHillEnd(t) {                                             // 13: every star you've seen
  hill(t); const a = ss(seg(t, at('13') + .6, at('13') + 1.3)); if (a > 0) { g.save(); g.globalAlpha *= a; bubble(CX, 700, 400, '255,210,120', .7); g.restore(); }
  label("EVERY STAR YOU'VE SEEN", CX, 430, 40, P.gold, t, at('13') + .9);
}
function sSpeck(t) {                                               // 14: the bubble shrinks to a speck
  K.bg(t); const u = ss(seg(t, at('14') - .1, end('14') - .1)), R = lerp(400, 9, u), y = lerp(700, 950, u);
  const Rq = mulberry(14); if (u > .2) for (let i = 0; i < 40; i++) { const x = Rq() * W, yy = 330 + Rq() * 1150; if (Math.hypot(x - CX, yy - 950) < 130) continue; text('?', x, yy, 34 + Rq() * 36, 'rgba(200,200,255,.3)', 1000, null, 0, 'center', ss(seg(u, .2 + i * .012, .5 + i * .012))); }
  glow(CX, y, R * 3 + 40, '255,210,120', .5); bubble(CX, y, R, '255,210,120');
  label('OUR BUBBLE', CX, y + Math.max(R, 20) + 60, 34, P.gold, t, end('14') - .4);
  const ca = pop(t, end('14') + .4, .4); if (ca > 0) { g.save(); g.translate(CX, 460); g.scale(ca, ca); card(0, 0, 880, 110, '#7fd3ff'); text('What do you think is out there? ↓', 0, 14, 42, P.white, 1000, null, 0); g.restore(); }
}
const SC = [[0, sDish], [at('01') + 2.4, sBeam], [at('04') - .4, sBubble], [at('05') - .3, sOverlap], [at('06') - .35, sWall], [at('07') - .35, sPast], [at('08') - .3, sNever], [at('10') - .4, sInf], [at('12') - .35, sGlobe], [at('13') - .4, sHillEnd], [at('14') - .25, sSpeck]];
const XF = .35;

// ───────── pinned title
function hud(t) {
  g.fillStyle = 'rgba(8,6,30,.55)'; g.fillRect(0, 0, W, 300);
  text('WHAT IS BEYOND THE EDGE', CX, 125, 60, P.white, 1000, P.navy, 14);
  text('OF THE OBSERVABLE UNIVERSE?', CX, 212, 54, P.gold, 1000, P.navy, 12);
}
const KEYW = /^(oldest|13\.8|billion|46|stretching|edge|observable|bubble|93|special\.?|Anyone,?|anywhere,?|wall\.?|light|travel\.?|galaxies\.?|stars\.?|never|ever\.?|forever\?|Nobody|knows\.?|infinite\.?|finite,?|curve|speck|tiny|whole)/i;
// captions: each line is split into short chunks (one row each); only the current chunk is on screen,
// timed by its share of the line's characters, words lighting up as they're spoken
const CAP_W = 900, CAP_PX = 62;
function chunks(l) {
  g.save(); g.font = `1000 ${CAP_PX}px NU`; const words = l.text.split(' '), out = []; let cur = [], rw = 0;
  const flush = () => { if (cur.length) out.push(cur); cur = []; rw = 0; };
  for (const w of words) {
    const ww = g.measureText(w + ' ').width;
    if (rw + ww > CAP_W && cur.length) flush();
    cur.push(w); rw += ww;
    if (/[.?!]$/.test(w) && cur.length >= 3) flush();                 // prefer to break at the end of a sentence
  }
  flush(); g.restore();
  for (let i = out.length - 1; i > 0; i--) if (out[i].length <= 2 && out[i - 1].length > 3 && !/[.?!]$/.test(out[i - 1][out[i - 1].length - 1])) out[i].unshift(...out[i - 1].splice(-2));   // no one-word leftovers
  const tot = l.text.length; let acc = 0;
  return out.map(ws => { const n = ws.join(' ').length + 1, c = { ws, t0: l.t + acc / tot * l.d, t1: l.t + (acc + n) / tot * l.d }; acc += n; return c; });
}
const CH = {};
function captions(t) {
  const l = TL.lines.find(l => t >= l.t - .05 && t < l.t + l.d + .3); if (!l) return;
  const cs = CH[l.id] || (CH[l.id] = chunks(l));
  let c = cs.find(c => t < c.t1) || cs[cs.length - 1]; if (t < cs[0].t0) c = cs[0];
  const a = c === cs[cs.length - 1] ? 1 - ss(seg(t, l.t + l.d + .15, l.t + l.d + .3)) : 1, k = pop(t, c.t0 - .05, .2);
  g.save(); g.globalAlpha = a; g.translate(CX, 1600); const sc = .94 + .06 * Math.min(1, k); g.scale(sc, sc); g.font = `1000 ${CAP_PX}px NU`;
  const rows = [[]]; let rw = 0; for (const w of c.ws) { const ww = g.measureText(w + ' ').width; if (rw + ww > CAP_W && rows[rows.length - 1].length) { rows.push([]); rw = 0; } rows[rows.length - 1].push([w, ww]); rw += ww; }
  const bw = Math.max(...rows.map(r => r.reduce((p, w) => p + w[1], 0))) + 60; g.fillStyle = 'rgba(10,8,36,.62)'; g.beginPath(); g.roundRect(-bw / 2, -54, bw, rows.length * 78 + 40, 30); g.fill();
  const tot = c.ws.join(' ').length; let acc = 0;
  rows.forEach((row, ri) => { let x = -row.reduce((p, w) => p + w[1], 0) / 2; for (const [w, ww] of row) { const tw = c.t0 + (acc / tot) * (c.t1 - c.t0) * .95; acc += w.length + 1; const kk = clamp((t - tw) / .12); g.save(); g.globalAlpha *= .4 + .6 * kk; text(w, x, 12 + ri * 78, CAP_PX, KEYW.test(w) && kk > 0 ? P.gold : P.white, 1000, P.navy, 13, 'left'); g.restore(); x += ww; } });
  g.restore();
}

// ───────── frame
function render(t) {
  use(G0); g.setTransform(1, 0, 0, 1, 0, 0); g.globalAlpha = 1;
  let i = 0; while (i < SC.length - 1 && t >= SC[i + 1][0]) i++;
  const u = clamp((t - SC[i][0]) / XF);
  if (i > 0 && u < 1) { SC[i - 1][1](t); use(G1); g.setTransform(1, 0, 0, 1, 0, 0); g.globalAlpha = 1; g.clearRect(0, 0, W, H); SC[i][1](t); use(G0); g.globalAlpha = ss(u); g.drawImage(off, 0, 0); g.globalAlpha = 1; }
  else SC[i][1](t);
  g.setTransform(1, 0, 0, 1, 0, 0); g.globalAlpha = 1; hud(t); captions(t);
  const fo = seg(t, DUR - .5, DUR); if (fo > 0) { g.fillStyle = `rgba(0,0,0,${fo})`; g.fillRect(0, 0, W, H); }
}

// ───────── thumbnail (?thumb=1): our glowing bubble, and the dark unknown past its edge
function thumb() {
  use(G0); g.setTransform(1, 0, 0, 1, 0, 0); K.bg(4);
  const Rq = mulberry(14); for (let i = 0; i < 26; i++) { const x = Rq() * W, y = 560 + Rq() * 1250; if (Math.hypot(x - 540, y - 1120) < 480) continue; text('?', x, y, 60 + Rq() * 60, 'rgba(210,210,255,.45)', 1000, null, 0); }
  g.save(); g.beginPath(); g.arc(CX, 1120, 420, 0, TAU); g.clip(); field(2, CX, 1120, 1, 1); g.restore(); glow(CX, 1120, 620, '255,210,120', .25); bubble(CX, 1120, 420, '255,210,120');
  K.earth(CX, 1120, 62, 1, 'scared', { rot: 1, lookY: -1 });
  text("WHAT'S BEYOND", CX, 230, 112, P.white, 1000, P.navy, 20); text('THE EDGE OF', CX, 360, 112, P.white, 1000, P.navy, 20); text('THE UNIVERSE?', CX, 500, 118, P.gold, 1000, P.navy, 22);
  g.save(); g.translate(CX, 1640); g.rotate(-.04); g.fillStyle = P.gold; g.beginPath(); g.roundRect(-330, -60, 660, 120, 60); g.fill(); text('93 BILLION LIGHT-YEARS', 0, 20, 50, P.navy, 1000, null, 0); g.restore();
}
const TH = new URLSearchParams(location.search).get('thumb');
window.EV = TL.lines.map(l => ({ type: 'vo', id: l.id, t: l.t })); window.DUR = DUR;
window.SUBS = TL.lines.map(l => ({ t0: l.t, t1: l.t + l.d + .3, text: l.text }));
if (TH) { window.render = () => thumb(); thumb(); } else { window.render = render; render(+(new URLSearchParams(location.search).get('t') ?? 1.0)); }
window.READY = true;
