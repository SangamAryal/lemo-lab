// "What If Our Sun Was Replaced by Alpha Centauri?" — one narrator, mostly on Earth's surface: the 8-minute delay, the new star,
// 50% more sunlight, heatwaves, a slightly oval orbit (10.5-month year, 2× light at the closest point), oceans, reefs, storms,
// ice, Mars warming, the long road toward Venus. Flat Beyond Everything kit art in 2.5D layers, 1080×1920, deterministic in t.
// ?thumb=1 draws the thumbnail.
import * as K from './kit.js';
import { clamp, lerp, seg, ss, eio, eo, mulberry, TAU } from '/core/lib.js';
const { P, text, glow } = K;
const W = 1080, H = 1920, CX = W / 2;
const main = document.getElementById('c'), G0 = main.getContext('2d');
const off = document.createElement('canvas'); off.width = W; off.height = H; const G1 = off.getContext('2d');
let g = G0; const use = c => { g = c; K.setup(c, W, H); }; use(G0); K.makeStars(130, 17);
await document.fonts.load('900 80px NU'); await document.fonts.load('800 40px NU');
const TL = await (await fetch('timeline.json')).json();
const LN = Object.fromEntries(TL.lines.map(l => [l.id, l])), DUR = TL.dur;
const at = id => LN[id].t, end = id => LN[id].t + LN[id].d, mid = id => LN[id].t + LN[id].d / 2;
const dot = (x, y, r, c, a = 1) => { const o = g.globalAlpha; g.globalAlpha = o * a; g.fillStyle = c; g.beginPath(); g.arc(x, y, r, 0, TAU); g.fill(); g.globalAlpha = o; };
const pop = (t, t0, d = .35) => { const u = clamp((t - t0) / d); return u <= 0 ? 0 : 1 + Math.sin(u * Math.PI) * .2 * (1 - u); };
const fadeIO = (t, a, b, d = .25) => ss(seg(t, a, a + d)) * (1 - ss(seg(t, b - d, b)));
const card = (x, y, w, h, col, a = 1, k = 1) => { g.save(); g.globalAlpha *= a; g.translate(x, y); g.scale(k, k); g.fillStyle = 'rgba(12,10,44,.86)'; g.beginPath(); g.roundRect(-w / 2, -h / 2, w, h, Math.min(h / 2, 40)); g.fill(); if (col) { g.strokeStyle = col; g.lineWidth = 5; g.stroke(); } g.restore(); };
const label = (s, x, y, px, col, t, t0, a = 1) => { const k = pop(t, t0); if (k <= 0) return; g.save(); g.globalAlpha *= a; g.translate(x, y); g.scale(k, k); g.font = `1000 ${px}px NU`; const ww = g.measureText(s).width + px * 1.4; card(0, 0, ww, px * 1.9, col); text(s, 0, px * .36, px, col || P.white, 1000, null, 0); g.restore(); };
function stamp(s, col, t, t0, x = CX, y = 1330) { const k = pop(t, t0, .3); if (k <= 0) return; const z = t < t0 + .15 ? 1 + 1.5 * (1 - (t - t0) / .15) : 1; g.save(); g.translate(x, y); g.rotate(-.1); g.scale(z * k, z * k); g.font = '1000 64px NU'; const w = g.measureText(s).width + 80; g.strokeStyle = col; g.lineWidth = 10; g.beginPath(); g.roundRect(-w / 2, -58, w, 116, 18); g.stroke(); text(s, 0, 23, 64, col, 1000, null, 0); g.restore(); }
function heat(x, y, w, h, t, a = .5) { g.save(); g.globalAlpha *= a; g.strokeStyle = 'rgba(255,255,255,.6)'; g.lineWidth = 4; for (let i = 0; i < 7; i++) { const xx = x + i * w / 6, ph = (t * .8 + i * .3) % 1; g.beginPath(); for (let k = 0; k <= 10; k++) { const yy = y + h - ph * h * .5 - k * h / 20; g.lineTo(xx + Math.sin(k * 1.3 + t * 6 + i) * 8, yy); } g.stroke(); } g.restore(); }
function arrowDown(x, y, len, col, a = 1) { g.save(); g.globalAlpha *= a; g.strokeStyle = col; g.fillStyle = col; g.lineWidth = 8; g.lineCap = 'round'; g.beginPath(); g.moveTo(x, y); g.lineTo(x, y + len); g.stroke(); g.beginPath(); g.moveTo(x - 16, y + len - 6); g.lineTo(x + 16, y + len - 6); g.lineTo(x, y + len + 18); g.fill(); g.restore(); }

// ───────── people, animals, trees
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
function dog(x, y, s, t, pant = 0) { g.save(); g.translate(x, y); g.scale(s, s); g.fillStyle = '#c98d5a'; g.beginPath(); g.roundRect(-40, -40, 80, 34, 16); g.fill(); g.fillRect(-36, -10, 10, 24); g.fillRect(24, -10, 10, 24); g.beginPath(); g.arc(46, -48, 20, 0, TAU); g.fill(); g.fillStyle = '#8a5a3c'; g.beginPath(); g.ellipse(38, -62, 8, 14, -.4, 0, TAU); g.fill(); dot(52, -52, 3, P.navy); if (pant) { g.fillStyle = '#ff6b8a'; g.beginPath(); g.ellipse(60, -36 + Math.sin(t * 12) * 2, 6, 10, 0, 0, TAU); g.fill(); } g.strokeStyle = '#c98d5a'; g.lineWidth = 8; g.lineCap = 'round'; g.beginPath(); g.moveTo(-40, -32); g.lineTo(-58, -50 + Math.sin(t * 8) * 6 * (1 - pant)); g.stroke(); g.restore(); }
function tree(x, y, s, dry = 0) { g.save(); g.translate(x, y); g.scale(s, s); g.fillStyle = '#6a4428'; g.fillRect(-12, -80, 24, 80); const c = `rgb(${lerp(80, 170, dry)},${lerp(190, 130, dry)},${lerp(110, 60, dry)})`; for (const [dx, dy, r] of [[0, -150, 70], [-50, -110, 50], [50, -110, 50]]) dot(dx, dy, r, c); g.restore(); }

// ───────── skies and stars
function sky(t, top, bot) { const gr = g.createLinearGradient(0, 0, 0, 1300); gr.addColorStop(0, top); gr.addColorStop(1, bot); g.fillStyle = gr; g.fillRect(0, 0, W, H); }
function sunDisc(x, y, r, t, bright = 0) { glow(x, y, r * (3 + bright * 1.5), '255,236,170', .55 + .25 * bright); g.save(); g.globalAlpha *= .35 + .3 * bright; g.strokeStyle = '#fff6d0'; g.lineWidth = 8; for (let i = 0; i < 12; i++) { const a = i / 12 * TAU + t * .1; g.beginPath(); g.moveTo(x + Math.cos(a) * r * 1.4, y + Math.sin(a) * r * 1.4); g.lineTo(x + Math.cos(a) * r * (2 + bright), y + Math.sin(a) * r * (2 + bright)); g.stroke(); } g.restore(); dot(x, y, r, '#fff8dc'); }
function starChar(x, y, r, t, mood, a = 1) { g.save(); g.globalAlpha *= a; K.sunBody(x, y, r, t); g.translate(x, y); K.face(r, mood, t, 0, 1.7); g.restore(); }
function ground(y0, col0, col1) { const gr = g.createLinearGradient(0, y0, 0, H); gr.addColorStop(0, col0); gr.addColorStop(1, col1); g.fillStyle = gr; g.fillRect(0, y0, W, H - y0); }

// the countdown: 8:19 → 0:00 between line 02 and line 08
function timer(t, x = CX, y = 520) {
  const u = clamp((t - at('02')) / (at('08') - at('02'))), s = Math.round(499 * (1 - u)), str = `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;
  card(x, y, 460, 116, s === 0 ? P.red : '#ffd34a'); text('LIGHT ARRIVES IN', x, y - 14, 26, '#d9d4ff', 1000, null, 0); text(str, x, y + 38, 54, s === 0 ? P.red : P.white, 1000, null, 0);
}

// ───────── scenes
function sHook(t) {                                                // 01: the swap, seen from space
  K.bg(t); const sw = ss(seg(t, 1.2, 1.7)), fl = fadeIO(t, 1.3, 2.0, .2);
  if (sw < 1) starChar(CX, 880, 170 * (1 - sw), t, 'happy');
  if (sw > 0) { starChar(CX, 880, 205 * sw, t, 'smug'); label('ALPHA CENTAURI A', CX, 1180, 40, P.gold, t, 1.8); }
  if (fl > 0) { g.fillStyle = `rgba(255,255,255,${fl * .8})`; g.fillRect(0, 0, W, H); }
  K.earth(930, 1330, 46, t, sw > .5 ? 'worried' : 'happy', { rot: t * .3, look: -1 });
}
function park(t, o = {}) {                                         // the park: o.r (sun radius), o.bright, o.squint, o.dry
  sky(t, o.bright > .5 ? '#9ed2ff' : '#5fb4f5', '#cfeaff');
  sunDisc(800, 380, o.r || 70, t, o.bright || 0);
  for (const [x, y, s] of [[180, 420, 1], [520, 300, .8]]) { g.save(); g.globalAlpha *= .9 - .4 * (o.bright || 0); for (const [dx, dy, r] of [[0, 0, 50], [50, -15, 40], [-50, -5, 38], [90, 10, 30]]) dot(x + dx + (t * 10) % 40, y + dy, r * s, '#ffffff'); g.restore(); }
  ground(1160, o.dry ? '#b8b060' : '#6fcf6a', o.dry ? '#8a7a40' : '#3f9a4a');
  g.fillStyle = 'rgba(30,40,60,.2)'; g.beginPath(); g.ellipse(CX, 1500, 600, 60, 0, 0, TAU); g.fill();
  tree(120, 1240, 1, o.dry || 0); tree(960, 1220, .9, o.dry || 0);
  person(300, 1440, 1.3, '#ff7a5c', SKIN[0], { squint: o.squint, sweat: o.squint, icecream: 1, melt: o.squint });
  person(520, 1420, 1.2, '#4f7dff', SKIN[2], { shade: o.squint, sweat: o.squint });
  person(760, 1450, 1.35, '#ffc73a', SKIN[1], { squint: o.squint });
  dog(900, 1470, 1.1, t, o.squint ? 1 : 0);
  if (o.bright) heat(0, 1100, W, 300, t, o.bright * .5);
}
function sCountdown(t) { park(t); timer(t); }                       // 02
function sWave(t) {                                                // 03: light and gravity race at the same speed
  K.bg(t); starChar(160, 900, 110, t, 'smug'); K.earth(940, 900, 60, t, 'keen', { rot: t * .3, look: -1 });
  const u = clamp((t - at('03')) / (end('03') - at('03'))), x = lerp(260, 870, u);
  g.save(); for (let k = 0; k < 4; k++) { const xx = x - k * 50; if (xx < 260) continue; g.globalAlpha = .7 - k * .15; g.strokeStyle = P.gold; g.lineWidth = 8; g.beginPath(); g.arc(160, 900, xx - 160, -.35, .35); g.stroke(); g.strokeStyle = '#9fd0ff'; g.setLineDash([16, 12]); g.beginPath(); g.arc(160, 900, xx - 160 - 22, -.3, .3); g.stroke(); g.setLineDash([]); } g.restore();
  text('LIGHT', x, 720, 40, P.gold, 1000, P.navy, 10); text('GRAVITY', x, 1090, 40, '#9fd0ff', 1000, P.navy, 10);
  label('SAME SPEED', CX, 1330, 46, P.white, t, mid('03'));
  timer(t);
}
function sMeet(t) {                                                // 04–06: meet Alpha Centauri A; the spec sheet
  K.bg(t); glow(CX, 780, 520, '255,220,140', .3);
  const k = pop(t, at('04') - .3, .5); starChar(CX, 780, 215 * Math.max(.01, k), t, 'happy');
  label('ALPHA CENTAURI A', CX, 1080, 46, P.gold, t, at('04'));
  label('4.4 LIGHT-YEARS AWAY', CX, 520, 38, '#d9d4ff', t, at('05') + .5);
  const sp = ss(seg(t, at('06') - .2, at('06') + .3)); if (sp > 0) { g.save(); g.globalAlpha *= sp; card(CX, 1290, 860, 330, '#ffd34a');
    text('SUN', CX + 120, 1170, 34, '#ffd34a', 1000, null, 0); text('ALPHA CEN A', CX + 300, 1170, 30, '#ffd34a', 1000, null, 0);
    const rows = [['COLOR', 'same', 'same ✓', at('06') + .1], ['WIDTH', '1×', '1.2×', at('06') + 1.2], ['MASS', '1×', '1.1×', at('06') + 2.4]];
    rows.forEach(([n, a, b, t0], i) => { const kk = pop(t, t0); if (kk <= 0) return; const y = 1240 + i * 70; text(n, CX - 330, y, 38, P.white, 1000, null, 0, 'left'); text(a, CX + 120, y, 38, '#d9d4ff', 1000, null, 0); text(b, CX + 300, y, 38, i ? '#ffb066' : '#7fe0a0', 1000, null, 0); });
    g.restore(); }
}
function sZero(t) {                                                // 07–08: the timer hits zero
  const z = at('08'), b = ss(seg(t, z - .1, z + .6));
  park(t, { r: lerp(70, 86, b), bright: b, squint: b > .5 });
  timer(t); const fl = fadeIO(t, z - .05, z + .5, .1); if (fl > 0) { g.fillStyle = `rgba(255,250,230,${fl * .7})`; g.fillRect(0, 0, W, H); }
}
function sNoon(t) {                                                // 09–10: 50% more sunlight, every day
  park(t, { r: 86, bright: 1, squint: 1 });
  label('+50% SUNLIGHT', CX, 520, 52, '#ffb066', t, at('09') + 1.2);
  const a = ss(seg(t, at('10'), at('10') + .5)); if (a > 0) { for (let i = 0; i < 9; i++) { const x = 80 + i * 115, ph = ((t - at('10')) * 1.2 + i * .37) % 1; arrowDown(x, 700 + ph * 300, 110, 'rgba(255,190,90,.9)', a * (1 - ph * .6)); } label('MORE ENERGY · EVERY DAY', CX, 640, 38, P.gold, t, at('10') + .6); }
}
function sHeat(t) {                                                // 11: record heatwaves, ecosystems struggling
  sky(t, '#ffb36b', '#ffe2b0'); sunDisc(820, 360, 86, t, 1);
  const R = mulberry(6); g.fillStyle = '#c7764a';
  for (let i = 0; i < 6; i++) { const x = i * 190 - 20, h = 360 + R() * 280, y = 1250 - h; g.fillStyle = ['#d98a5a', '#c7764a', '#e0a070'][i % 3]; g.fillRect(x, y, 175, h); g.fillStyle = 'rgba(255,255,255,.35)'; for (let wy = y + 40; wy < 1200; wy += 90) for (let wx = x + 25; wx < x + 160; wx += 55) g.fillRect(wx, wy, 32, 44); g.fillStyle = '#8a8a9a'; g.fillRect(x + 60, y + 120, 50, 34); }
  ground(1250, '#9a9080', '#6a6458'); heat(0, 1000, W, 400, t, .7);
  person(260, 1520, 1.3, '#ff7a5c', SKIN[3], { squint: 1, sweat: 1, shade: 1 }); dog(820, 1560, 1.1, t, 1); tree(560, 1530, .8, ss(seg(t, at('11'), at('11') + 4)));
  const v = Math.round(lerp(38, 50, clamp((t - at('11')) / 3))); card(870, 760, 230, 300, '#ff5a3c'); g.fillStyle = '#ff5a3c'; g.fillRect(845, 660, 22, 170 * (v - 30) / 20); dot(856, 850, 26, '#ff5a3c'); text(`${v}°C`, 920, 790, 46, P.white, 1000, null, 0);
  label('RECORD HEATWAVES', CX, 520, 46, '#ffb066', t, at('11') + 1.5);
}
const OAU = 400, OCX = 560, OCY = 980, OSQ = .55, A = .932, E = .073;
function kepler(Mn) { let Ea = Mn; for (let i = 0; i < 8; i++) Ea -= (Ea - E * Math.sin(Ea) - Mn) / (1 - E * Math.cos(Ea)); return Ea; }
function sOrbit(t) {                                               // 12–15: heavier → slightly oval orbit, 10.5-month year, 2× light up close
  K.bg(t);
  if (t < at('13')) { const tilt = .12 * ss(seg(t, at('12') + .2, at('12') + .8)); g.save(); g.translate(CX, 1000); g.fillStyle = '#c9cbe0'; g.beginPath(); g.moveTo(-30, 100); g.lineTo(30, 100); g.lineTo(0, 10); g.fill(); g.rotate(-tilt); g.fillRect(-320, 0, 640, 16); starChar(-260, -110, 100, t, 'happy'); starChar(260, -100, 108, t, 'smug'); text('SUN · 1×', -260, 60, 34, P.gold, 1000, P.navy, 8); text('ALPHA CEN A · 1.1×', 260, 60, 34, '#ffb066', 1000, P.navy, 8); g.restore(); label('HEAVIER', CX, 520, 46, '#ffb066', t, at('12') + .4); return; }
  const m = ss(seg(t, at('13') + .8, at('13') + 2));
  g.save(); g.setLineDash([12, 12]); g.lineWidth = 3; g.strokeStyle = 'rgba(90,170,255,.7)'; g.beginPath(); g.ellipse(OCX, OCY, OAU, OAU * OSQ, 0, 0, TAU); g.stroke(); g.restore();
  const a = lerp(1, A, m) * OAU, b = lerp(1, A * Math.sqrt(1 - E * E), m) * OAU, c = lerp(0, A * E, m) * OAU;
  g.save(); g.strokeStyle = P.gold; g.lineWidth = 6; g.beginPath(); g.ellipse(OCX - c, OCY, a, b * OSQ, 0, 0, TAU); g.stroke(); g.restore();
  starChar(OCX, OCY, 60, t, 'smug');
  text('OLD ORBIT', OCX - 250, OCY - OAU * OSQ - 16, 30, '#7fb8ff', 1000, P.navy, 8); text('NEW ORBIT', OCX + 200, OCY + b * OSQ + 50, 30, P.gold, 1000, P.navy, 8, 'center', m);
  let ex = OCX - OAU, ey = OCY, rr = 1;
  if (t > at('13') + 2) { const Mn = Math.PI + (t - at('13') - 2) / 4 * TAU, Ea = kepler(Mn); const xx = A * (Math.cos(Ea) - E), yy = A * Math.sqrt(1 - E * E) * Math.sin(Ea); ex = OCX + xx * OAU; ey = OCY + yy * OAU * OSQ; rr = Math.hypot(xx, yy); }
  glow(ex, ey, 50, '255,240,200', .3 * (1.52 / rr / rr) / 2); K.earth(ex, ey, 34, t, rr < .9 ? 'scared' : 'worried', { rot: t, look: -1 });
  label('YEAR ≈ 10.5 MONTHS', CX, 520, 46, P.gold, t, at('14') + 3.5);
  if (t > at('14') + 3.5) { const k = clamp((t - at('14') - 3.5) / 1.5); for (let i = 0; i < 2; i++) { g.save(); g.globalAlpha *= (1 - k) * (i ? .6 : 1); g.translate(CX + (i - .5) * 120 + k * (i - .5) * 200, 640 - k * 220); g.rotate(k * (i - .5) * 2); g.fillStyle = '#fff'; g.fillRect(-30, -36, 60, 72); g.fillStyle = P.red; g.fillRect(-30, -36, 60, 16); g.restore(); } }
  if (t > at('15')) { const px = OCX + (A * (1 - E)) * OAU; g.save(); g.globalAlpha *= ss(seg(t, at('15'), at('15') + .4)); g.strokeStyle = '#ffb066'; g.lineWidth = 4; g.setLineDash([6, 6]); g.beginPath(); g.moveTo(OCX, OCY + 60); g.lineTo(px, OCY + 60); g.stroke(); g.setLineDash([]); text('CLOSEST', px - 30, OCY + 110, 30, '#ffb066', 1000, P.navy, 8); g.restore(); label('2× TODAY\'S SUNLIGHT', CX, 1400, 46, '#ffb066', t, at('15') + 1.6); }
}
function sea(t, y0, warm = 0) { const gr = g.createLinearGradient(0, y0, 0, H); gr.addColorStop(0, `rgb(${lerp(63, 90, warm)},${lerp(166, 150, warm)},${lerp(216, 170, warm)})`); gr.addColorStop(1, '#1d5a8a'); g.fillStyle = gr; g.fillRect(0, y0, W, H - y0); g.strokeStyle = 'rgba(255,255,255,.4)'; g.lineWidth = 4; for (let i = 0; i < 8; i++) { const y = y0 + 40 + i * 60, o = (t * 40 + i * 70) % 160; g.beginPath(); for (let x = -o; x < W + 160; x += 160) { g.moveTo(x, y); g.quadraticCurveTo(x + 40, y - 10, x + 80, y); } g.stroke(); } }
function sOcean(t) {                                               // 16–17: oceans soak up the heat
  sky(t, '#9ed2ff', '#e0f2ff'); sunDisc(820, 360, 86, t, 1);
  const warm = ss(seg(t, at('17'), at('17') + 2)); sea(t, 1000, warm);
  g.fillStyle = '#f2d49a'; g.beginPath(); g.moveTo(0, 1500); g.quadraticCurveTo(400, 1420, W, 1560); g.lineTo(W, H); g.lineTo(0, H); g.fill();
  if (t > at('17')) for (let i = 0; i < 8; i++) { const x = 90 + i * 125, ph = ((t - at('17')) * 1.1 + i * .29) % 1; arrowDown(x, 650 + ph * 320, 100, 'rgba(255,150,80,.9)', (1 - ph) * ss(seg(t, at('17'), at('17') + .4))); }
  person(220, 1700, 1.2, '#ff7a5c', SKIN[1], { squint: 1, sweat: 1 });
  label('THE OCEANS SOAK IT UP', CX, 520, 42, '#7fd3ff', t, at('17') + .3);
}
function sReef(t) {                                                // 18a: the reef bleaches
  const gr = g.createLinearGradient(0, 0, 0, H); gr.addColorStop(0, '#2f8fd0'); gr.addColorStop(1, '#0b2f5a'); g.fillStyle = gr; g.fillRect(0, 0, W, H);
  for (let i = 0; i < 6; i++) { g.save(); g.globalAlpha *= .12; g.fillStyle = '#fff'; g.beginPath(); g.moveTo(100 + i * 180, 0); g.lineTo(160 + i * 180, 0); g.lineTo(60 + i * 200, 1300); g.lineTo(20 + i * 200, 1300); g.fill(); g.restore(); }
  const bl = ss(seg(t, at('18'), at('18') + 2.4)), cols = ['#ff6b8a', '#ffb066', '#b07aff', '#4fd1a0', '#ff8ac0', '#ffd34a'];
  g.fillStyle = '#c9a56a'; g.fillRect(0, 1380, W, H - 1380);
  const R = mulberry(21); for (let i = 0; i < 14; i++) { const x = 40 + i * 76 + R() * 30, h = 120 + R() * 200, c = cols[i % 6]; const mix = (a, b) => `rgb(${[0, 2, 4].map(k => Math.round(lerp(parseInt(a.substr(1 + k, 2), 16), parseInt(b.substr(1 + k, 2), 16), bl))).join(',')})`; g.fillStyle = mix(c, '#f4f2ee'); g.strokeStyle = mix(c, '#f4f2ee'); g.lineWidth = 18; g.lineCap = 'round'; g.beginPath(); g.moveTo(x, 1400); g.lineTo(x, 1400 - h); g.moveTo(x, 1400 - h * .5); g.lineTo(x + 40, 1400 - h * .8); g.moveTo(x, 1400 - h * .35); g.lineTo(x - 36, 1400 - h * .65); g.stroke(); dot(x, 1400 - h, 20, mix(c, '#f4f2ee')); }
  for (let i = 0; i < 6; i++) { const x = (i * 210 + t * 70) % (W + 200) - 100, y = 800 + i * 70; g.fillStyle = cols[(i + 2) % 6]; g.beginPath(); g.ellipse(x, y, 34, 18, 0, 0, TAU); g.fill(); g.beginPath(); g.moveTo(x - 30, y); g.lineTo(x - 54, y - 16); g.lineTo(x - 54, y + 16); g.fill(); dot(x + 18, y - 4, 4, P.navy); }
  label('CORAL REEFS BLEACH', CX, 520, 44, '#f4f2ee', t, at('18') + .4);
}
function sStorm(t) {                                               // 18b: stronger storms
  K.bg(t); const ex = CX, ey = 960, r = 380;
  g.save(); g.beginPath(); g.arc(ex, ey, r, 0, TAU); g.clip(); g.fillStyle = '#3d8be8'; g.fillRect(ex - r, ey - r, 2 * r, 2 * r); glow(ex - 60, ey + 60, 260, '255,120,80', .35);
  g.fillStyle = '#5fcf7a'; g.beginPath(); g.ellipse(ex + 200, ey - 160, 140, 90, .4, 0, TAU); g.fill();
  const s = 1 + .5 * ss(seg(t, mid('18') - .2, end('18') + .3)), rot = t * 1.4; g.translate(ex - 60, ey + 60);
  for (let k = 0; k < 4; k++) { g.save(); g.rotate(rot + k * TAU / 4); g.strokeStyle = 'rgba(255,255,255,.85)'; g.lineWidth = 34 * s; g.lineCap = 'round'; g.beginPath(); for (let a = 0; a < 3.2; a += .1) { const rr = (20 + a * 34) * s; g.lineTo(Math.cos(a) * rr, Math.sin(a) * rr); } g.stroke(); g.restore(); }
  dot(0, 0, 16 * s, '#3d8be8'); g.restore();
  g.fillStyle = 'rgba(20,30,90,.28)'; g.beginPath(); g.arc(ex + r * .35, ey + r * .1, r * 1.1, 0, TAU); g.arc(ex - r * .15, ey - r * .08, r * 1.02, 0, TAU, true); g.fill('evenodd');
  label('STRONGER STORMS', CX, 1430, 44, P.white, t, mid('18') + .3);
}
function sIce(t) {                                                 // 19: ice sheets melt, seas rise
  sky(t, '#9ed2ff', '#e8f6ff'); sunDisc(880, 300, 70, t, 1);
  const cr = ss(seg(t, at('19'), at('19') + 2));
  g.fillStyle = '#eaf6ff'; g.beginPath(); g.moveTo(0, 620); g.lineTo(620, 600); g.lineTo(700, 760); g.lineTo(0, 780); g.fill(); g.fillStyle = '#bfe0f5'; g.fillRect(0, 760, 700, 50);
  g.strokeStyle = '#7ab8e0'; g.lineWidth = 5; for (const [x0, y0] of [[200, 620], [420, 610], [560, 605]]) { g.beginPath(); g.moveTo(x0, y0); g.lineTo(x0 + 20 * cr, y0 + 80 * cr); g.lineTo(x0 - 10 * cr, y0 + 150 * cr); g.stroke(); }
  for (let i = 0; i < 3; i++) { const u = clamp((t - at('19') - .6 - i * .5) / 2); if (u <= 0) continue; g.save(); g.translate(720 + u * 160 + i * 40, 760 + u * 60); g.rotate(u * .4); g.fillStyle = '#eaf6ff'; g.fillRect(-50, -40, 100, 60); g.restore(); }
  sea(t, 800, 0);
  // a coastal house with a rising water mark
  const rise = ss(seg(t, at('19') + 1.2, end('19') + .3)); const hx = 760, hy = 1500;
  g.fillStyle = '#f2d49a'; g.fillRect(0, 1380, W, H - 1380); g.fillStyle = '#e8e0d0'; g.fillRect(hx - 160, hy - 260, 320, 260); g.fillStyle = '#c84d3a'; g.beginPath(); g.moveTo(hx - 190, hy - 260); g.lineTo(hx, hy - 380); g.lineTo(hx + 190, hy - 260); g.fill();
  g.fillStyle = '#7fb8e0'; for (const [dx, dy] of [[-100, -200], [40, -200], [-100, -100], [40, -100]]) g.fillRect(hx + dx, hy + dy, 60, 60);
  g.fillStyle = 'rgba(40,120,200,.75)'; g.fillRect(0, hy - 220 * rise, W, H); g.strokeStyle = 'rgba(255,255,255,.7)'; g.lineWidth = 5; g.beginPath(); for (let x = 0; x <= W; x += 40) g.lineTo(x, hy - 220 * rise + Math.sin(x * .03 + t * 3) * 6); g.stroke();
  label('ICE MELTS · SEAS RISE', CX, 520, 44, '#7fd3ff', t, at('19') + .4);
}
function marsGround(t, frost) {
  sky(t, '#c98a6a', '#f0c8a0'); sunDisc(780, 380, 46, t, .6);
  ground(1150, '#c2522e', '#7a2a14');
  const R = mulberry(13); for (let i = 0; i < 16; i++) { const d = .2 + R() * .8, x = R() * W, y = 1170 + d * 600, s = 18 + d * 70; g.fillStyle = '#7a2e16'; g.beginPath(); g.ellipse(x, y, s * 1.4, s * .7, 0, Math.PI, TAU); g.fill(); if (frost > 0) { g.fillStyle = `rgba(255,255,255,${.85 * frost})`; g.beginPath(); g.ellipse(x, y - s * .5, s * 1.1, s * .25, 0, Math.PI, TAU); g.fill(); } }
  g.fillStyle = '#5a1c0c'; g.beginPath(); g.moveTo(0, 1160); for (let x = 0; x <= W; x += 80) g.lineTo(x, 1110 - Math.abs(Math.sin(x * .01)) * 90); g.lineTo(W, 1160); g.fill();
}
function sMars(t) {                                                // 20–22: Mars warms up
  const fr = 1 - ss(seg(t, at('22') + 2, end('22')));
  marsGround(t, fr);
  if (t > at('22') + 2) for (let i = 0; i < 8; i++) { const x = 100 + i * 120, ph = ((t - at('22') - 2) * .8 + i * .31) % 1; g.save(); g.globalAlpha *= .5 * (1 - ph); g.strokeStyle = '#fff'; g.lineWidth = 10; g.lineCap = 'round'; g.beginPath(); g.moveTo(x, 1300 - ph * 300); g.quadraticCurveTo(x + 30, 1250 - ph * 300, x, 1200 - ph * 300); g.stroke(); g.restore(); }
  // rover in sunglasses
  const rx = 640 + Math.sin(t * .5) * 30, ry = 1480; g.fillStyle = '#d9dbe8'; g.fillRect(rx - 90, ry - 70, 180, 60); g.fillStyle = '#5a5f8a'; for (const dx of [-60, 0, 60]) dot(rx + dx, ry, 24, '#3a3a4a'); g.fillRect(rx - 6, ry - 150, 12, 80); g.fillStyle = '#d9dbe8'; g.fillRect(rx - 40, ry - 190, 80, 46); g.fillStyle = '#16122e'; dot(rx - 16, ry - 168, 12, '#16122e'); dot(rx + 16, ry - 168, 12, '#16122e'); g.fillRect(rx - 6, ry - 172, 12, 5);
  label('MARS', CX, 520, 50, '#ff8a5c', t, at('20') + .1);
  label('MORE SUNLIGHT', CX, 640, 40, P.gold, t, at('21') + .3);
  if (t > at('22')) label("~88% OF EARTH'S SUNLIGHT", CX, 760, 38, P.white, t, at('22') + 1.2);
  if (t > at('22') + 3) label('FROZEN WATER → VAPOR', CX, 1690 - 300, 36, '#cfe6ff', t, at('22') + 3.5);
}
function sPack(t) {                                                // 23–24: don't pack for Mars yet
  if (t < at('24')) { sky(t, '#5fb4f5', '#cfeaff'); ground(1160, '#6fcf6a', '#3f9a4a'); g.fillStyle = '#e8e0d0'; g.fillRect(560, 820, 420, 340); g.fillStyle = '#c84d3a'; g.beginPath(); g.moveTo(530, 820); g.lineTo(770, 680); g.lineTo(1010, 820); g.fill();
    person(360, 1440, 1.5, '#4f7dff', SKIN[0], { bag: 1 }); stamp('NOT YET', P.red, t, at('23') + 1.4, CX, 640); return; }
  marsGround(t, .6); g.fillStyle = 'rgba(10,8,30,.35)'; g.fillRect(0, 0, W, H);
  stamp('NOT A CLIMATE UPGRADE', '#ffd34a', t, at('24') + 1.6, CX, 760);
}
function sVenus(t) {                                               // 25: not overnight… but the loop pushes us there
  K.bg(t); const turn = ss(seg(t, mid('25'), end('25') + .2));
  const ex = CX, ey = 900, r = 260; glow(ex, ey, r * 1.5, '255,200,120', .3 * turn);
  K.earth(ex, ey, r, t, turn > .5 ? 'scared' : 'worried', { rot: t * .2 }); if (turn > 0) { g.save(); g.globalAlpha *= turn * .85; g.beginPath(); g.arc(ex, ey, r, 0, TAU); g.clip(); const gr = g.createLinearGradient(ex, ey - r, ex, ey + r); gr.addColorStop(0, '#f2d48a'); gr.addColorStop(1, '#d9a050'); g.fillStyle = gr; g.fillRect(ex - r, ey - r, 2 * r, 2 * r); for (const [v, c] of [[-.4, '#e8c070'], [.1, '#fbe3a8'], [.5, '#e3b664']]) { g.fillStyle = c; g.beginPath(); g.ellipse(ex, ey + v * r, r * 1.2, r * .12, 0, 0, TAU); g.fill(); } g.restore(); g.save(); g.translate(ex, ey); K.face(r, 'scared', t, 0, 1); g.restore(); }
  // the loop
  const la = ss(seg(t, at('25') + 2.4, at('25') + 3)); if (la > 0) { g.save(); g.globalAlpha *= la; const cy = 1360, items = [['HOT OCEANS', -300], ['MORE VAPOR', 0], ['TRAPPED HEAT', 300]]; items.forEach(([s, dx], i) => { card(CX + dx, cy, 270, 80, ['#7fd3ff', '#d9d4ff', '#ffb066'][i]); text(s, CX + dx, cy + 12, 30, P.white, 1000, null, 0); }); g.strokeStyle = P.gold; g.lineWidth = 6; g.beginPath(); g.ellipse(CX, cy, 330, 90, 0, Math.PI * 1.05 + t * 2 % TAU, Math.PI * 1.05 + t * 2 % TAU + 1.2); g.stroke(); g.restore(); }
  label('NOT OVERNIGHT…', CX, 520, 46, P.white, t, at('25') + .3); if (t > mid('25')) label('…BUT GIVEN TIME', CX, 640, 46, '#ffb066', t, mid('25') + .2);
}
function sOutro(t) {                                               // 26–27: back to our Sun
  park(t, { r: 70 });
  const k = pop(t, at('27') + .3, .5); if (k > 0) { g.save(); g.translate(CX, 720); g.scale(k, k); card(0, 0, 900, 190, P.gold); text('A SMALL DIFFERENCE', 0, -14, 56, P.white, 1000, null, 0); text('CHANGES EVERYTHING', 0, 56, 56, P.gold, 1000, null, 0); g.restore(); }
  label('OUR SUN · JUST RIGHT ☀️', CX, 930, 36, '#ffd34a', t, at('26') + 1.5);
  const ca = pop(t, end('27') + .1, .4); if (ca > 0) { g.save(); g.translate(CX, 450); g.scale(ca, ca); card(0, 0, 860, 110, '#7fd3ff'); text('Which star should we try next? ↓', 0, 14, 42, P.white, 1000, null, 0); g.restore(); }
}
const SC = [
  [0, sHook], [at('02') - .3, sCountdown], [at('03') - .25, sWave], [at('04') - .4, sMeet], [at('07') - .3, sZero], [at('09') - .3, sNoon], [at('11') - .3, sHeat],
  [at('12') - .3, sOrbit], [at('16') - .35, sOcean], [at('18') - .25, sReef], [mid('18') - .1, sStorm], [at('19') - .25, sIce], [at('20') - .35, sMars], [at('23') - .3, sPack], [at('25') - .3, sVenus], [at('26') - .35, sOutro],
];
const XF = .35;

// ───────── pinned title + narrator captions (word-by-word reveal, keywords in gold)
function hud(t) {
  g.fillStyle = 'rgba(8,6,30,.55)'; g.fillRect(0, 0, W, 300);
  text('WHAT IF OUR SUN WAS', CX, 125, 62, P.white, 1000, P.navy, 14);
  text('REPLACED BY ALPHA CENTAURI?', CX, 212, 54, P.gold, 1000, P.navy, 12);
}
const KEYW = /^(Alpha|Centauri\??|A\.?|eight|minutes|gravity|same|speed\.?|closest|similar|color,?|bigger,?|10%|massive\.?|replacement,?|not|50%\.?|huge|energy|heatwaves|continent,?|ecosystems|problem\.?|heavier|orbit|oval|stretched-out|year|ten|half|months\.?|twice|oceans|heat\.?|bleach,?|storms\.?|Ice|sea|levels|Mars|sunlight|almost|frozen|melt|Venus|overnight\.?|time,?|vapor|small|difference|everything\.?)/i;
// captions: each line is split into short chunks (at most 2 rows); only the current chunk is on screen,
// timed by its share of the line's characters, words lighting up as they're spoken
const CAP_W = 900, CAP_PX = 62;
function chunks(l) {
  g.save(); g.font = `1000 ${CAP_PX}px NU`; const words = l.text.split(' '), out = []; let cur = [], rows = 1, rw = 0;
  const flush = () => { if (cur.length) out.push(cur); cur = []; rows = 1; rw = 0; };
  for (const w of words) {
    const ww = g.measureText(w + ' ').width;
    if (rw + ww > CAP_W && cur.length) { if (rows === 2) flush(); else { rows = 2; rw = 0; } }
    cur.push(w); rw += ww;
    if (/[.?!]$/.test(w) && cur.length >= 3) flush();                 // prefer to break at the end of a sentence
  }
  flush(); g.restore();
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

// ───────── thumbnail (?thumb=1): Earth sweating under a bigger, hotter sun
function thumb() {
  use(G0); g.setTransform(1, 0, 0, 1, 0, 0);
  sky(0, '#ff9a4a', '#ffd9a0'); glow(CX, 1000, 700, '255,230,150', .6); starChar(CX, 960, 300, 1, 'smug');
  ground(1380, '#c8a050', '#8a6a30'); heat(0, 1250, W, 300, 1, .7);
  person(230, 1700, 1.7, '#ff7a5c', SKIN[0], { squint: 1, sweat: 1, shade: 1 }); dog(860, 1720, 1.4, 1, 1);
  text('WHAT IF THIS', CX, 230, 104, P.white, 1000, P.navy, 20); text('REPLACED', CX, 350, 110, P.white, 1000, P.navy, 20); text('OUR SUN?', CX, 490, 140, P.gold, 1000, P.navy, 24);
  g.save(); g.translate(CX, 1250); g.rotate(-.05); g.fillStyle = P.red; g.beginPath(); g.roundRect(-290, -66, 580, 132, 66); g.fill(); text('+50% SUNLIGHT', 0, 26, 70, P.white, 1000, null, 0); g.restore();
}
const TH = new URLSearchParams(location.search).get('thumb');
window.EV = TL.lines.map(l => ({ type: 'vo', id: l.id, t: l.t })); window.DUR = DUR;
window.SUBS = TL.lines.map(l => ({ t0: l.t, t1: l.t + l.d + .3, text: l.text }));
if (TH) { window.render = () => thumb(); thumb(); } else { window.render = render; render(+(new URLSearchParams(location.search).get('t') ?? 1.0)); }
window.READY = true;
