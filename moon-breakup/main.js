// "The Moon Is Slowly Breaking Up With Us" — flat-vector explainer, vertical 1080×1920, canvas 2D, deterministic in t.
// Lineless shapes, two-tone cel shading, soft glows, sparkle stars; Earth and the Moon are characters. Our own designs.
import { clamp, lerp, seg, ss, eio, eo, mulberry, TAU } from '/core/lib.js';

const W = 1080, H = 1920, CX = W / 2;
const cv = document.getElementById('c'), g = cv.getContext('2d');
await document.fonts.load('900 80px NU'); await document.fonts.load('800 40px NU');
const words = await (await fetch('voices/words.json')).json();
const lines = await (await fetch('lines.json')).json();

// ───────── timeline
const VO = { v01: .6, v02: 3.9, v03: 10.9, v04: 16.4, v05: 24.35, v06: 29.5, v07: 33.8, v08: 41.7, v09: 49.5, v10: 56.2, v11: 62.0 };
const DUR = 70.0;
const nrm = s => s.toLowerCase().replace(/[^a-z0-9]/g, '');
const at = (id, w, k = 0, e = 1) => { let n = 0; for (const x of words[id]) if (nrm(x[0]).startsWith(nrm(w)) && n++ === k) return VO[id] + Math.max(0, x[e]); throw new Error(`${w} in ${id}`); };
const S = [0, VO.v02 - .2, VO.v03 - .25, VO.v04 - .25, VO.v06 - .2, VO.v07 - .3, VO.v08 - .3, VO.v09 - .3, VO.v10 - .3, VO.v11 - .3, DUR];   // scene starts
const T = {
  slowly: at('v01', 'slowly'), cm: at('v02', '3'), nail: at('v02', 'fingernails'), mirrors: at('v03', 'mirrors'), lasers: at('v03', 'lasers'),
  spins: at('v04', 'spins'), bulge: at('v04', 'bulge'), dragged: at('v04', 'dragged'), tugs: at('v05', 'tugs'), higher: at('v05', 'higher'),
  pullsBack: at('v06', 'pulls'), brakes: at('v06', 'brakes'), young: at('v07', 'young'), bigger: at('v07', 'bigger'), tenH: at('v07', 'less'),
  dino: at('v08', 'dinosaurs'), d235: at('v08', '23'), d372: at('v08', '372'), m600: at('v09', '600'), small: at('v09', 'small'), noMore: at('v09', 'no'),
  never: at('v10', 'never'), swallow: at('v10', 'swallow'), enjoy: at('v11', 'enjoy'), perfect: at('v11', 'perfectly'),
};
const sceneAt = t => { let i = 0; while (i < S.length - 2 && t >= S[i + 1]) i++; return i; };

// ───────── palette and drawing kit
const P = { bg0: '#0a0626', bg1: '#1d1152', star: '#b9a8ff', spark: '#ece6ff', navy: '#17163f', gold: '#ffc73a', red: '#ff4d6d', cyan: '#3fe0ff', white: '#ffffff',
  ocean: '#3d8be8', oceanD: '#2a63b8', land: '#5fcf7a', landD: '#3fa35e', moon: '#cfd4ea', moonD: '#a3a9c9', crater: '#b4b9d6', blush: '#ff9fb8', sun: '#ffcf4a', sunD: '#ff9a2e' };
const R0 = mulberry(5), STARS = Array.from({ length: 110 }, () => ({ x: R0() * W, y: R0() * H, k: R0(), r: R0(), tw: R0() * 6 }));
function bg(t, top = P.bg0, bot = P.bg1, a = 1) {
  g.save(); g.globalAlpha = a; const gr = g.createLinearGradient(0, 0, 0, H); gr.addColorStop(0, top); gr.addColorStop(1, bot); g.fillStyle = gr; g.fillRect(0, 0, W, H);
  for (const [x, y, r, c] of [[200, 520, 420, 'rgba(120,60,200,.16)'], [900, 1250, 520, 'rgba(70,40,180,.14)'], [420, 1700, 480, 'rgba(160,70,200,.10)']]) { const n = g.createRadialGradient(x, y, 0, x, y, r); n.addColorStop(0, c); n.addColorStop(1, 'rgba(0,0,0,0)'); g.fillStyle = n; g.fillRect(x - r, y - r, 2 * r, 2 * r); }
  for (const s of STARS) { const y = s.y, tw = .55 + .45 * Math.sin(t * 2 + s.tw); if (s.k < .13) sparkle(s.x, y, (10 + s.r * 14) * (.8 + .2 * tw), P.spark, .9 * a); else { g.globalAlpha = (.3 + .5 * s.r) * tw * a; g.fillStyle = P.star; g.beginPath(); g.arc(s.x, y, 1.4 + s.r * 2.6, 0, TAU); g.fill(); } }
  g.restore();
}
function sparkle(x, y, r, col = P.spark, a = 1) { g.save(); g.globalAlpha *= a; g.fillStyle = col; g.beginPath(); g.moveTo(x, y - r); g.quadraticCurveTo(x + r * .14, y - r * .14, x + r, y); g.quadraticCurveTo(x + r * .14, y + r * .14, x, y + r); g.quadraticCurveTo(x - r * .14, y + r * .14, x - r, y); g.quadraticCurveTo(x - r * .14, y - r * .14, x, y - r); g.fill(); g.restore(); }
function glow(x, y, r, rgb, a = .6) { const gr = g.createRadialGradient(x, y, 0, x, y, r); gr.addColorStop(0, `rgba(${rgb},${a})`); gr.addColorStop(1, `rgba(${rgb},0)`); g.fillStyle = gr; g.fillRect(x - r, y - r, 2 * r, 2 * r); }
function text(s, x, y, px, col = P.white, wt = 900, outline = P.navy, ow = 14, align = 'center', a = 1) {
  if (a <= 0) return; g.save(); g.globalAlpha *= a; g.font = `${wt} ${px}px NU`; g.textAlign = align; g.textBaseline = 'alphabetic'; g.lineJoin = 'round';
  if (outline) { g.lineWidth = ow; g.strokeStyle = outline; g.strokeText(s, x, y); } g.fillStyle = col; g.fillText(s, x, y); g.restore();
}
const pop = (t, t0, d = .35) => { const u = clamp((t - t0) / d); return u <= 0 ? 0 : 1 + Math.sin(u * Math.PI) * .18 * (1 - u) - (1 - eo(u)) * .9; };   // scale-in with a little overshoot
function arrow(x0, y0, x1, y1, col, w = 16, a = 1) {
  if (a <= 0) return; g.save(); g.globalAlpha *= a; g.strokeStyle = g.fillStyle = col; g.lineWidth = w; g.lineCap = 'round';
  const ang = Math.atan2(y1 - y0, x1 - x0), hl = w * 2.2; g.beginPath(); g.moveTo(x0, y0); g.lineTo(x1 - Math.cos(ang) * hl * .6, y1 - Math.sin(ang) * hl * .6); g.stroke();
  g.beginPath(); g.moveTo(x1, y1); g.lineTo(x1 - Math.cos(ang - .5) * hl, y1 - Math.sin(ang - .5) * hl); g.lineTo(x1 - Math.cos(ang + .5) * hl, y1 - Math.sin(ang + .5) * hl); g.closePath(); g.fill(); g.restore();
}

// ───────── the characters
// face: mood = 'happy' | 'worried' | 'annoyed' | 'sad' | 'guilty' | 'scared' | 'love'; look = eye offset (-1..1)
function face(r, mood, t, look = 0, blinkSeed = 0) {
  const ex = r * .3, ey = -r * .05, ew = r * .11, eh = r * .15;
  const bl = ((t + blinkSeed) % 3.7) < .12 ? .12 : 1;                      // blink
  g.fillStyle = P.navy;
  for (const s of [-1, 1]) {
    g.save(); g.translate(s * ex + look * r * .06, ey);
    if (mood === 'annoyed') { g.beginPath(); g.ellipse(0, 0, ew, eh * .55, 0, 0, TAU); g.fill(); g.lineWidth = r * .045; g.strokeStyle = P.navy; g.lineCap = 'round'; g.beginPath(); g.moveTo(-ew * 1.2, -eh * (s > 0 ? .9 : 1.5)); g.lineTo(ew * 1.2, -eh * (s > 0 ? 1.5 : .9)); g.stroke(); }
    else if (mood === 'love') { g.fillStyle = P.red; g.beginPath(); g.moveTo(0, eh * .6); g.bezierCurveTo(-ew * 1.6, -eh * .2, -ew * .5, -eh * 1.2, 0, -eh * .3); g.bezierCurveTo(ew * .5, -eh * 1.2, ew * 1.6, -eh * .2, 0, eh * .6); g.fill(); g.fillStyle = P.navy; }
    else { g.beginPath(); g.ellipse(0, 0, ew, eh * bl, 0, 0, TAU); g.fill(); if (bl > .5) { g.fillStyle = P.white; g.beginPath(); g.arc(-ew * .3, -eh * .35, ew * .38, 0, TAU); g.fill(); g.fillStyle = P.navy; } }
    if (mood === 'worried' || mood === 'scared' || mood === 'sad') { g.lineWidth = r * .04; g.strokeStyle = P.navy; g.lineCap = 'round'; g.beginPath(); g.moveTo(-ew * 1.1, -eh * (s > 0 ? 1.7 : 1.2)); g.lineTo(ew * 1.1, -eh * (s > 0 ? 1.2 : 1.7)); g.stroke(); }
    g.restore();
  }
  g.fillStyle = 'rgba(255,140,170,.55)'; for (const s of [-1, 1]) { g.beginPath(); g.ellipse(s * r * .5, r * .17, r * .1, r * .06, 0, 0, TAU); g.fill(); }
  g.strokeStyle = P.navy; g.lineWidth = r * .045; g.lineCap = 'round'; g.beginPath();
  const my = r * .22;
  if (mood === 'happy' || mood === 'love') g.arc(0, my - r * .08, r * .14, Math.PI * .15, Math.PI * .85);
  else if (mood === 'guilty') { g.moveTo(-r * .12, my); g.quadraticCurveTo(0, my + r * .04, r * .12, my - r * .04); }
  else if (mood === 'annoyed') { g.moveTo(-r * .1, my + r * .02); g.lineTo(r * .1, my - r * .01); }
  else if (mood === 'scared') { g.stroke(); g.fillStyle = P.navy; g.beginPath(); g.ellipse(0, my + r * .02, r * .07, r * .09, 0, 0, TAU); g.fill(); return; }
  else g.arc(0, my + r * .1, r * .12, Math.PI * 1.15, Math.PI * 1.85);   // sad / worried
  g.stroke();
}
function earth(x, y, r, t, mood = 'happy', o = {}) {
  g.save(); g.translate(x, y); if (o.squash) g.scale(1 + o.squash, 1 - o.squash);
  glow(0, 0, r * 1.45, '90,170,255', .28);
  g.beginPath(); g.arc(0, 0, r, 0, TAU); g.save(); g.clip();
  g.fillStyle = P.ocean; g.fillRect(-r, -r, 2 * r, 2 * r);
  const rot = (o.rot ?? t * .25) % TAU;                                     // continents slide across as it spins
  for (const [u, v, s] of [[.2, -.35, .42], [.75, .15, .5], [1.3, -.1, .36], [1.85, .4, .3], [2.6, -.3, .45], [3.4, .25, .4], [4.2, -.2, .5], [5.0, .3, .35], [5.7, -.45, .3]]) {
    const a = u + rot, cx = Math.sin(a) * r, vis = Math.cos(a); if (vis < -.1) continue;
    g.fillStyle = P.land; g.beginPath(); g.ellipse(cx, v * r, r * s * .55 * Math.max(.2, vis), r * s * .36, 0, 0, TAU); g.ellipse(cx + r * s * .25 * vis, v * r + r * s * .2, r * s * .35 * Math.max(.2, vis), r * s * .25, 0, 0, TAU); g.fill();
  }
  g.fillStyle = 'rgba(255,255,255,.9)'; g.beginPath(); g.ellipse(0, -r * .93, r * .45, r * .12, 0, 0, TAU); g.fill();   // ice cap
  g.fillStyle = 'rgba(20,30,90,.28)'; g.beginPath(); g.arc(r * .35, r * .1, r * 1.1, 0, TAU); g.arc(-r * .15, -r * .08, r * 1.02, 0, TAU, true); g.fill('evenodd');   // cel shadow
  g.restore();
  if (!o.noFace) face(r, mood, t, o.look || 0, 0);
  g.restore();
}
function moon(x, y, r, t, mood = 'happy', o = {}) {
  g.save(); g.translate(x, y); g.rotate(o.tilt || 0);
  glow(0, 0, r * 1.5, '200,200,255', .22);
  g.beginPath(); g.arc(0, 0, r, 0, TAU); g.save(); g.clip();
  g.fillStyle = P.moon; g.fillRect(-r, -r, 2 * r, 2 * r);
  for (const [cx, cy, s] of [[-.45, -.45, .2], [.4, -.55, .13], [.55, .35, .18], [-.55, .4, .12], [.05, .65, .1], [-.1, -.75, .08]]) { g.fillStyle = P.crater; g.beginPath(); g.arc(cx * r, cy * r, s * r, 0, TAU); g.fill(); g.fillStyle = P.moonD; g.beginPath(); g.arc(cx * r + s * r * .2, cy * r + s * r * .2, s * r * .75, 0, TAU); g.fill(); }
  g.fillStyle = 'rgba(40,30,100,.3)'; g.beginPath(); g.arc(r * .35, r * .1, r * 1.1, 0, TAU); g.arc(-r * .15, -r * .08, r * 1.02, 0, TAU, true); g.fill('evenodd');
  g.restore();
  if (!o.noFace) face(r, mood, t, o.look || 0, 1.3);
  g.restore();
}
function sun(x, y, r, t, o = {}) {
  const red = o.red || 0;
  glow(x, y, r * (2.2 + .1 * Math.sin(t * 2)), red ? '255,90,60' : '255,200,80', .5);
  g.save(); g.translate(x, y);
  const N = 14; g.fillStyle = red ? '#ff7a4a' : P.sunD; g.beginPath(); for (let i = 0; i <= N * 2; i++) { const a = i / (N * 2) * TAU + t * .15, rr = r * (i % 2 ? 1.12 : 1.24); g.lineTo(Math.cos(a) * rr, Math.sin(a) * rr); } g.fill();
  g.fillStyle = red ? '#ff5a3c' : P.sun; g.beginPath(); g.arc(0, 0, r, 0, TAU); g.fill();
  g.fillStyle = red ? 'rgba(160,30,30,.3)' : 'rgba(255,140,40,.35)'; g.beginPath(); g.arc(r * .3, r * .15, r * 1.05, 0, TAU); g.arc(-r * .12, -r * .06, r, 0, TAU, true); g.fill('evenodd');
  g.restore();
}
function hand(x0, y0, x1, y1, col, w) { g.save(); g.strokeStyle = col; g.lineWidth = w; g.lineCap = 'round'; g.beginPath(); g.moveTo(x0, y0); g.quadraticCurveTo((x0 + x1) / 2, Math.min(y0, y1) - w, x1, y1); g.stroke(); g.restore(); }
function card(x, y, w, h, a = 1) { g.save(); g.globalAlpha *= a; g.fillStyle = 'rgba(12,10,44,.72)'; g.beginPath(); g.roundRect(x - w / 2, y - h / 2, w, h, 24); g.fill(); g.strokeStyle = 'rgba(185,168,255,.4)'; g.lineWidth = 3; g.stroke(); g.restore(); }

// ───────── scenes (each gets local time u from its start)
const SC = [];
// 0 · the couple; the Moon starts to drift
SC[0] = (t) => {
  bg(t);
  const gap = ss(seg(t, T.slowly - .2, T.slowly + 1.2)) * 70;
  earth(CX - 170 - gap * .3, 1000, 190, t, t > T.slowly ? 'worried' : 'happy', { look: t > T.slowly ? 1 : .6 });
  moon(CX + 230 + gap, 960 - gap * .2, 120, t, t > T.slowly - .2 ? 'guilty' : 'happy', { look: t > T.slowly ? 1 : -.8, tilt: Math.sin(t * 1.4) * .05 });
  if (t > T.slowly) { const a = ss(seg(t, T.slowly, T.slowly + .3)); g.save(); g.globalAlpha = a; for (let i = 0; i < 3; i++) { g.strokeStyle = P.spark; g.lineWidth = 6; g.lineCap = 'round'; g.beginPath(); g.moveTo(CX + 370 + gap + i * 26, 900 + i * 40); g.lineTo(CX + 420 + gap + i * 26, 900 + i * 40); g.stroke(); } g.restore(); }
  const k = pop(t, .15, .5); if (k > 0) { g.save(); g.translate(CX, 330); g.scale(k, k); text('The Moon', 0, -10, 110); text('Is Leaving', 0, 100, 110, P.gold); g.restore(); }
};
// 1 · 3.8 cm a year; fingernails
SC[1] = (t) => {
  bg(t);
  const d = 40 + ss(seg(t, T.cm - .3, T.cm + 1.2)) * 60;
  earth(CX - 230 - d * .5, 820, 150, t, 'worried', { look: 1 });
  moon(CX + 250 + d * .5, 800, 95, t, 'guilty', { look: -.4 });
  // the ruler between them
  const a = ss(seg(t, S[1] + .2, S[1] + .6)), x0 = CX - 70 - d * .5, x1 = CX + 150 + d * .5, y = 1010;
  g.save(); g.globalAlpha = a; g.fillStyle = P.gold; g.beginPath(); g.roundRect(x0, y - 22, x1 - x0, 44, 12); g.fill(); g.fillStyle = '#c98f12';
  for (let x = x0 + 18; x < x1 - 8; x += 22) g.fillRect(x, y - 22, 4, (Math.round((x - x0) / 22) % 5 === 0) ? 26 : 14);
  g.restore();
  const k = pop(t, T.cm - .1); if (k > 0) { g.save(); g.translate(CX - 130, 1150); g.scale(k, k); text('+3.8 cm', 0, 0, 110, P.gold); text('every year', 0, 64, 46, P.white, 800); g.restore(); }
  // fingernail
  const kn = pop(t, T.nail - .3, .5);
  if (kn > 0) {
    g.save(); g.translate(CX + 260, 1170); g.scale(kn * .8, kn * .8);
    g.fillStyle = '#e8a77f'; g.beginPath(); g.roundRect(-70, -40, 140, 280, 70); g.fill();          // finger
    g.fillStyle = '#d68e66'; g.beginPath(); g.roundRect(20, -40, 50, 280, [0, 70, 70, 0]); g.fill();
    const grow = ss(seg(t, T.nail, T.nail + 1.4)) * 34;
    g.fillStyle = '#ffe3d6'; g.beginPath(); g.roundRect(-46, -26 - grow, 92, 100 + grow, 40); g.fill();
    g.fillStyle = '#fff6f0'; g.beginPath(); g.roundRect(-46, -26 - grow, 92, 22 + grow * .7, 30); g.fill();
    g.restore(); text('same speed!', CX + 260, 1090, 44, P.cyan, 900, P.navy, 10, 'center', ss(seg(t, T.nail + .6, T.nail + 1)));
  }
};
// 2 · the mirrors and the laser
SC[2] = (t) => {
  bg(t, '#08051f', '#140c3a');
  earth(220, 360, 120, t, 'happy', { look: 1 });
  // lunar ground
  g.fillStyle = P.moonD; g.beginPath(); g.moveTo(0, 1150); for (let x = 0; x <= W; x += 30) g.lineTo(x, 1150 + Math.sin(x / 140) * 30 + Math.sin(x / 47) * 8); g.lineTo(W, H); g.lineTo(0, H); g.fill();
  g.fillStyle = P.moon; g.beginPath(); g.moveTo(0, 1240); for (let x = 0; x <= W; x += 30) g.lineTo(x, 1240 + Math.sin(x / 170 + 1) * 26); g.lineTo(W, H); g.lineTo(0, H); g.fill();
  for (const [x, y, rx] of [[180, 1500, 90], [760, 1420, 60], [900, 1650, 110], [420, 1760, 70]]) { g.fillStyle = P.crater; g.beginPath(); g.ellipse(x, y, rx, rx * .3, 0, 0, TAU); g.fill(); g.fillStyle = P.moonD; g.beginPath(); g.ellipse(x + 8, y + 4, rx * .75, rx * .2, 0, 0, TAU); g.fill(); }
  // the mirror panel and a flag
  const km = pop(t, T.mirrors - .3, .5), mx = 620, my = 1200;
  if (km > 0) { g.save(); g.translate(mx, my); g.scale(km, km);
    g.fillStyle = '#6f7690'; g.fillRect(-6, 0, 12, 90); g.fillStyle = '#3a3f66'; g.save(); g.rotate(-.35); g.fillRect(-110, -70, 220, 120);
    g.fillStyle = '#9fe9ff'; for (let i = 0; i < 4; i++) for (let j = 0; j < 2; j++) g.fillRect(-100 + i * 52, -60 + j * 56, 44, 48); g.restore(); g.restore();
    g.fillStyle = '#6f7690'; g.fillRect(860, 1000, 8, 200); g.fillStyle = P.white; g.fillRect(868, 1000, 120, 76); g.fillStyle = P.red; for (let k = 0; k < 4; k++) g.fillRect(868, 1008 + k * 18, 120, 8); g.fillStyle = '#3a63c8'; g.fillRect(868, 1000, 48, 40); }
  // the laser: up from Earth, back again
  const l0 = T.lasers - .4, u = clamp((t - l0) / .9), ex = 260, ey = 430;
  if (t > l0) {
    const hit = Math.min(1, u * 2), back = Math.max(0, u * 2 - 1), px = lerp(ex, mx, hit), py = lerp(ey, my - 20, hit);
    g.save(); g.strokeStyle = '#5dff9a'; g.lineCap = 'round'; g.shadowColor = '#5dff9a'; g.shadowBlur = 30; g.lineWidth = 10;
    g.beginPath(); g.moveTo(ex, ey); g.lineTo(px, py); g.stroke();
    if (back > 0) { g.globalAlpha = .7; g.beginPath(); g.moveTo(mx, my - 20); g.lineTo(lerp(mx, ex + 40, back), lerp(my - 20, ey + 10, back)); g.stroke(); }
    g.restore();
    if (hit >= 1) { const f = 1 - seg(t, l0 + .45, l0 + .9); glow(mx, my - 20, 160, '120,255,170', .6 * f); }
    const ks = pop(t, l0 + .9); if (ks > 0) { card(CX + 150, 680, 380, 150, ks); text('2.5 s', CX + 150, 700, 74, P.gold, 900, null, 0, 'center', ks); text('there & back', CX + 150, 742, 32, P.white, 800, null, 0, 'center', ks); }
  }
};
// 3 · the tide bulge runs ahead and tugs the Moon (top-down view)
SC[3] = (t) => {
  bg(t);
  const ex = CX, ey = 1040, er = 165;
  const orbitR = 470 + ss(seg(t, T.higher - .4, T.higher + 1)) * 60, ma = -Math.PI / 2 + .25 + (t - S[3]) * .05;
  // orbit ring
  g.save(); g.strokeStyle = 'rgba(185,168,255,.35)'; g.setLineDash([18, 16]); g.lineWidth = 4; g.beginPath(); g.arc(ex, ey, orbitR, 0, TAU); g.stroke(); g.setLineDash([]);
  if (t > T.higher - .4) { g.globalAlpha = 1 - ss(seg(t, T.higher - .4, T.higher + 1)); g.beginPath(); g.arc(ex, ey, 470, 0, TAU); g.stroke(); } g.restore();
  // the ocean bulge: an ellipse around Earth, aligned with the Moon at first, then dragged ahead by the spin
  const lead = ss(seg(t, T.dragged - .5, T.dragged + .5)) * .55 * (1 - .5 * ss(seg(t, T.pullsBack, T.brakes))), ba = ma + lead;
  const bk = ss(seg(t, T.bulge - .5, T.bulge + .3));
  if (bk > 0) { g.save(); g.translate(ex, ey); g.rotate(ba); g.fillStyle = 'rgba(80,170,255,.55)'; g.beginPath(); g.ellipse(0, 0, er * (1 + .42 * bk), er * (1 + .06 * bk), 0, 0, TAU); g.fill(); g.restore(); }
  earth(ex, ey, er, t, t > T.brakes ? 'annoyed' : 'happy', { rot: (t - S[3]) * (t > T.brakes ? .6 : 1.6), look: 0 });
  // spin arrows
  const sa = ss(seg(t, T.spins - .3, T.spins + .2)); if (sa > 0) { g.save(); g.globalAlpha = sa; g.strokeStyle = P.cyan; g.lineWidth = 12; g.lineCap = 'round'; const sp = (t - S[3]) * (t > T.brakes ? .8 : 2.2); for (const k of [0, Math.PI]) { g.beginPath(); g.arc(ex, ey, er + 50, k + sp, k + sp + 1.0); g.stroke(); const a2 = k + sp + 1.0; arrow(ex + Math.cos(a2 - .1) * (er + 50), ey + Math.sin(a2 - .1) * (er + 50), ex + Math.cos(a2 + .05) * (er + 50), ey + Math.sin(a2 + .05) * (er + 50), P.cyan, 12); } g.restore(); }
  const mx = ex + Math.cos(ma) * orbitR, my = ey + Math.sin(ma) * orbitR;
  moon(mx, my, 85, t, t > T.pullsBack ? 'guilty' : 'worried', { look: -.5 });
  // tug: bulge → Moon (forward), then Moon → bulge (back)
  const tip = [ex + Math.cos(ba) * er * 1.42, ey + Math.sin(ba) * er * 1.42];
  const ta = ss(seg(t, T.tugs - .2, T.tugs + .3)) * (1 - seg(t, T.pullsBack - .3, T.pullsBack));
  if (ta > 0) { arrow(tip[0], tip[1], mx + Math.cos(ma + Math.PI / 2) * 120 - Math.cos(ma) * 60, my + Math.sin(ma + Math.PI / 2) * 120 - Math.sin(ma) * 60, P.gold, 18, ta); text('tug!', mx + 140, my + 120, 54, P.gold, 900, P.navy, 12, 'center', ta); }
  const pb = ss(seg(t, T.pullsBack - .1, T.pullsBack + .4));
  if (pb > 0) { arrow(mx - Math.cos(ma) * 100, my - Math.sin(ma) * 100, tip[0] - Math.cos(ba + Math.PI / 2) * 40 + Math.cos(ba) * 20, tip[1] - Math.sin(ba + Math.PI / 2) * 40 + Math.sin(ba) * 20, P.red, 16, pb); }
  if (t > T.brakes) { const k = pop(t, T.brakes); g.save(); g.translate(ex + 250, ey + 300); g.scale(k, k); g.fillStyle = P.white; g.beginPath(); g.roundRect(-110, -55, 220, 110, 40); g.fill(); g.beginPath(); g.moveTo(-60, -50); g.lineTo(-100, -100); g.lineTo(-20, -50); g.fill(); text('hey!', 0, 22, 64, P.navy, 1000, null, 0); g.restore(); }
  // labels
  text('ocean bulge', tip[0] + 10, tip[1] - 40, 40, P.cyan, 900, P.navy, 10, 'center', bk * (1 - seg(t, T.tugs - .5, T.tugs)));
};
// 4 · flashback: the young Moon, huge in the sky (S[5] start)
SC[4] = (t) => {
  // the sky of the young Earth
  const gr = g.createLinearGradient(0, 0, 0, H); gr.addColorStop(0, '#2b0d3a'); gr.addColorStop(.6, '#7a2a3a'); gr.addColorStop(1, '#d4553a'); g.fillStyle = gr; g.fillRect(0, 0, W, H);
  for (const s of STARS) { if (s.y > 900) continue; g.globalAlpha = .5 * s.r; g.fillStyle = P.spark; g.beginPath(); g.arc(s.x, s.y, 1.5 + s.r * 2, 0, TAU); g.fill(); } g.globalAlpha = 1;
  const big = lerp(160, 560, ss(seg(t, T.bigger - 1.2, T.bigger + .3)));
  moon(CX + 60, 640, big, t, 'happy', { look: 0, noFace: big > 400 });
  if (big > 400) { g.save(); g.translate(CX + 60, 640); face(big, 'happy', t, 0, 1.3); g.restore(); }
  // molten ground with lava cracks
  g.fillStyle = '#3a1820'; g.beginPath(); g.moveTo(0, 1350); for (let x = 0; x <= W; x += 40) g.lineTo(x, 1350 + Math.sin(x / 120) * 40 + Math.sin(x / 33) * 10); g.lineTo(W, H); g.lineTo(0, H); g.fill();
  g.strokeStyle = '#ff8a3c'; g.lineWidth = 10; g.lineCap = 'round'; g.shadowColor = '#ff6a2a'; g.shadowBlur = 24; const R = mulberry(9);
  for (let i = 0; i < 6; i++) { let x = R() * W, y = 1450 + R() * 380; g.beginPath(); g.moveTo(x, y); for (let k = 0; k < 4; k++) { x += (R() - .5) * 160; y += (R() - .3) * 60; g.lineTo(x, y); } g.stroke(); } g.shadowBlur = 0;
  // fast clock
  const kc = pop(t, T.tenH - .3); if (kc > 0) { g.save(); g.translate(250, 1040); g.scale(kc, kc); g.fillStyle = P.white; g.beginPath(); g.arc(0, 0, 110, 0, TAU); g.fill(); g.strokeStyle = P.navy; g.lineWidth = 10; g.lineCap = 'round'; const a = t * 9; g.beginPath(); g.moveTo(0, 0); g.lineTo(Math.cos(a) * 80, Math.sin(a) * 80); g.moveTo(0, 0); g.lineTo(Math.cos(a / 12) * 55, Math.sin(a / 12) * 55); g.stroke(); g.restore(); text('day < 10 h', 250, 1230, 60, P.gold, 900, P.navy, 12, 'center', kc); }
  text('4.5 billion years ago', CX, 240, 56, P.white, 900, P.navy, 12, 'center', ss(seg(t, S[5] + .2, S[5] + .6)));
};
// 5 · dinosaurs: 23.5 h days, 372 days a year
SC[5] = (t) => {
  const gr = g.createLinearGradient(0, 0, 0, H); gr.addColorStop(0, '#1b2a6a'); gr.addColorStop(1, '#5ab0d8'); g.fillStyle = gr; g.fillRect(0, 0, W, H);
  moon(220, 400, 80, t, 'happy', { look: 1 });
  g.fillStyle = '#3f8f5a'; g.beginPath(); g.moveTo(0, 1320); for (let x = 0; x <= W; x += 40) g.lineTo(x, 1320 + Math.sin(x / 200) * 40); g.lineTo(W, H); g.lineTo(0, H); g.fill();
  g.fillStyle = '#2f7a4a'; g.beginPath(); g.moveTo(0, 1460); for (let x = 0; x <= W; x += 40) g.lineTo(x, 1460 + Math.sin(x / 150 + 2) * 30); g.lineTo(W, H); g.lineTo(0, H); g.fill();
  // a cute long-necked dinosaur
  const kd = pop(t, T.dino - .2, .5), bob = Math.sin(t * 3) * 6;
  if (kd > 0) { g.save(); g.translate(330, 1290 + bob); g.scale(kd, kd);
    g.fillStyle = '#ff9a5c'; g.beginPath(); g.ellipse(0, 0, 200, 110, 0, 0, TAU); g.fill();
    g.beginPath(); g.moveTo(120, -40); g.quadraticCurveTo(220, -250, 260, -430); g.lineTo(320, -420); g.quadraticCurveTo(250, -200, 180, 20); g.fill();
    g.beginPath(); g.ellipse(300, -440, 70, 46, -.2, 0, TAU); g.fill();
    g.beginPath(); g.moveTo(-180, -20); g.quadraticCurveTo(-320, 20, -380, 90); g.quadraticCurveTo(-300, 40, -170, 50); g.fill();
    for (const lx of [-120, -40, 60, 140]) { g.fillRect(lx - 24, 60, 48, 110); }
    g.fillStyle = '#e57a3e'; for (const [sx, sy] of [[-60, -40], [10, -70], [80, -40], [-20, 20]]) { g.beginPath(); g.arc(sx, sy, 22, 0, TAU); g.fill(); }
    g.save(); g.translate(318, -450); g.fillStyle = P.navy; g.beginPath(); g.ellipse(0, 0, 9, 13, 0, 0, TAU); g.fill(); g.fillStyle = P.white; g.beginPath(); g.arc(-3, -4, 4, 0, TAU); g.fill(); g.restore();
    g.strokeStyle = P.navy; g.lineWidth = 6; g.lineCap = 'round'; g.beginPath(); g.arc(330, -430, 20, .2, 1.2); g.stroke(); g.restore(); }
  // a wall calendar flipping, and a clock
  const kk = pop(t, T.d372 - .3);
  if (kk > 0) { g.save(); g.translate(790, 960); g.scale(kk, kk); g.fillStyle = P.white; g.beginPath(); g.roundRect(-150, -170, 300, 340, 24); g.fill(); g.fillStyle = P.red; g.beginPath(); g.roundRect(-150, -170, 300, 90, [24, 24, 0, 0]); g.fill();
    const flips = Math.floor(clamp((t - T.d372 + .3) * 6, 0, 8)); text(['365', '366', '367', '368', '369', '370', '371', '372', '372'][flips], 0, 70, 120, P.navy, 1000, null, 0); text('DAYS', 0, -110, 44, P.white, 1000, null, 0); g.restore(); }
  const kh = pop(t, T.d235 - .3);
  if (kh > 0) { g.save(); g.translate(790, 560); g.scale(kh, kh); card(0, 0, 320, 150); text('23.5 h', 0, 20, 84, P.gold, 900, null, 0); text('a day', 0, 62, 34, P.white, 800, null, 0); g.restore(); }
  text('70 million years ago', CX, 240, 56, P.white, 900, P.navy, 12, 'center', ss(seg(t, S[6] + .2, S[6] + .6)));
};
// 6 · the last total eclipse
SC[6] = (t) => {
  bg(t, '#05041a', '#100a30');
  const sx = CX, sy = 860, sr = 260;
  const shrink = ss(seg(t, T.small - .6, T.small + 1.0)), mr = lerp(sr * 1.03, sr * .78, shrink);
  const cor = 1 - shrink * .7;                                                // the corona is only seen in totality
  glow(sx, sy, sr * 2.4, '200,220,255', .5 * cor);
  sun(sx, sy, sr, t);
  g.fillStyle = '#0b0a24'; g.beginPath(); g.arc(sx + 6, sy - 4, mr, 0, TAU); g.fill();
  g.save(); g.beginPath(); g.arc(sx + 6, sy - 4, mr, 0, TAU); g.clip(); g.translate(sx + 6, sy - 4); face(mr * .9, shrink > .5 ? 'sad' : 'worried', t, 0, 1.3); g.restore();
  const kc = pop(t, T.m600 - .2); if (kc > 0) { g.save(); g.translate(CX, 1310); g.scale(kc, kc); text('600,000,000', 0, 0, 104, P.gold); text('years from now', 0, 60, 44, P.white, 800); g.restore(); }
  const kn = pop(t, T.noMore - .1); if (kn > 0) { g.save(); g.translate(CX, 300); g.scale(kn, kn); card(0, 0, 760, 130); text('No more total eclipses', 0, 18, 56, P.red, 1000, null, 0); g.restore(); }
};
// 7 · the far future: the Sun swells
SC[7] = (t) => {
  bg(t, '#1a0510', '#3a0a14');
  const sw = ss(seg(t, T.swallow - 1.2, T.swallow + 1.2));
  sun(CX, 560 - sw * 140, lerp(220, 760, sw), t, { red: 1 });
  const shake = sw * 6 * Math.sin(t * 40);
  earth(CX - 150 + shake, 1300, 140, t, sw > .2 ? 'scared' : 'happy', { look: -.3 });
  moon(CX + 150 - shake, 1300, 95, t, sw > .2 ? 'scared' : 'happy', { look: .3 });
  hand(CX - 30, 1330, CX + 70, 1330, '#e8e4ff', 18);                         // holding hands
  text('in ~5 billion years', CX, 240, 56, P.white, 900, P.navy, 12, 'center', ss(seg(t, T.swallow - 1.4, T.swallow - 1)));
  const kn = pop(t, T.never - .2); if (kn > 0 && t < T.swallow - .4) { g.save(); g.translate(CX + 120, 1110); g.scale(kn, kn); g.fillStyle = P.white; g.beginPath(); g.roundRect(-190, -50, 380, 100, 40); g.fill(); text('not going anywhere', 0, 16, 40, P.navy, 1000, null, 0); g.restore(); }
};
// 8 · today: the perfect eclipse
SC[8] = (t) => {
  bg(t, '#05041a', '#140b38');
  const sx = CX, sy = 820, sr = 230;
  glow(sx, sy, sr * 2.6, '210,225,255', .6); for (let i = 0; i < 18; i++) { const a = i / 18 * TAU + t * .05, l = sr * (1.5 + .35 * Math.sin(i * 2.3 + t)); g.save(); g.strokeStyle = 'rgba(230,240,255,.35)'; g.lineWidth = 10; g.lineCap = 'round'; g.beginPath(); g.moveTo(sx + Math.cos(a) * sr * 1.05, sy + Math.sin(a) * sr * 1.05); g.lineTo(sx + Math.cos(a) * l, sy + Math.sin(a) * l); g.stroke(); g.restore(); }
  g.fillStyle = '#fff6dc'; g.beginPath(); g.arc(sx, sy, sr * 1.02, 0, TAU); g.fill();
  g.fillStyle = '#0b0a24'; g.beginPath(); g.arc(sx, sy, sr, 0, TAU); g.fill();
  g.save(); g.translate(sx, sy); face(sr * .9, 'love', t, 0, 1.3); g.restore();
  earth(CX - 230, 1240, 140, t, 'love', { look: 1 });
  sparkle(CX + 300, 520, 34, P.spark, .9); sparkle(CX - 320, 1120, 26, P.spark, .8);
  const kp = pop(t, T.perfect - .2); if (kp > 0) { g.save(); g.translate(CX + 170, 1210); g.scale(kp, kp); text('a perfect fit', 0, 0, 64, P.gold); g.restore(); }
};
const SCENE_FOR = [0, 1, 2, 3, 3, 4, 5, 6, 7, 8];

// ───────── captions: word-pops, key words in gold (lower middle, above the Shorts UI)
const KEY = new Set(['moon', 'slowly', '3', '8', 'cm', 'fingernails', 'mirrors', 'lasers', 'fault', 'bulge', 'ahead', 'tugs', 'higher', 'brakes', 'young', 'ten', 'bigger', 'hours', 'dinosaurs', '23', 'half', '372', '600', 'million', 'small', 'eclipses', 'never', 'swallow', 'enjoy', 'perfectly']);
const CAP = [];
for (const [id, ws] of Object.entries(words)) {
  const toks = []; for (const w of ws) { if (/^[,.]/.test(w[0]) && toks.length) { const p = toks[toks.length - 1]; p.w += w[0]; p.t1 = w[2]; } else toks.push({ w: w[0], t0: Math.max(0, w[1]), t1: w[2] }); }
  let line = [], n = 0; const flush = () => { if (line.length) CAP.push({ words: line.map(x => ({ ...x, t0: VO[id] + x.t0, t1: VO[id] + x.t1 })) }); line = []; n = 0; };
  for (const tk of toks) { line.push(tk); n += tk.w.length + 1; if (n > 18 || /[.?!,]$/.test(tk.w) && n > 9) flush(); }
  flush();
}
for (let i = 0; i < CAP.length; i++) { const c = CAP[i], e = c.words[c.words.length - 1].t1; c.t0 = c.words[0].t0 - .05; c.t1 = i + 1 < CAP.length ? Math.min(CAP[i + 1].words[0].t0 - .02, e + .7) : e + .8; }
function captions(t) {
  const c = CAP.find(c => t >= c.t0 && t < c.t1); if (!c) return;
  g.save(); g.font = '900 74px NU';
  const ws = c.words.map(w => ({ ...w, s: w.w.replace(/[,]$/, ''), wd: g.measureText(w.w.replace(/[,]$/, '') + ' ').width }));
  const rows = [[]]; let rw = 0; for (const w of ws) { if (rw + w.wd > 900 && rows[rows.length - 1].length) { rows.push([]); rw = 0; } rows[rows.length - 1].push(w); rw += w.wd; }
  rows.forEach((row, ri) => { const tot = row.reduce((p, w) => p + w.wd, 0); let x = CX - tot / 2; const y = 1500 + ri * 88;
    for (const w of row) { const k = clamp((t - w.t0) / .1); if (k > 0) { g.save(); g.globalAlpha = k; g.translate(x, y); const s = .85 + .15 * eo(k); g.scale(s, s); g.lineJoin = 'round'; g.lineWidth = 16; g.strokeStyle = P.navy; g.textAlign = 'left'; g.strokeText(w.s, 0, 0); g.fillStyle = KEY.has(nrm(w.w)) ? P.gold : P.white; g.fillText(w.s, 0, 0); g.restore(); } x += w.wd; } });
  g.restore();
}

// ───────── frame: scenes with a zoom-and-fade transition between them
function render(t) {
  g.setTransform(1, 0, 0, 1, 0, 0); g.globalAlpha = 1;
  const i = sceneAt(t), s0 = S[i], tr = .45;
  const draw = (k, tt, z, a) => { g.save(); g.globalAlpha = a; g.translate(CX, H / 2); g.scale(z, z); g.translate(-CX, -H / 2); SC[SCENE_FOR[k]](tt); g.restore(); };
  const u = clamp((t - s0) / tr);
  if (i > 0 && u < 1 && SCENE_FOR[i] !== SCENE_FOR[i - 1]) { draw(i - 1, t, 1 + .12 * eio(u), 1); draw(i, t, .9 + .1 * eo(u), eo(u)); }
  else draw(i, t, 1 + (t - s0) * .004, 1);                                   // a slow push inside each scene
  g.setTransform(1, 0, 0, 1, 0, 0); g.globalAlpha = 1;
  captions(t);
  const fi = 1 - seg(t, 0, .3), fo = seg(t, DUR - .6, DUR); if (fi > 0 || fo > 0) { g.fillStyle = `rgba(0,0,0,${Math.max(fi, fo)})`; g.fillRect(0, 0, W, H); }
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
