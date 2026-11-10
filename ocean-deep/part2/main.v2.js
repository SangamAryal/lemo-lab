// "Journey to the Bottom of the Ocean" — Part 1 / Part 2 (story-first), flat-vector, vertical 1080×1920, canvas 2D, deterministic in t.
// One continuous dive: the yellow sub sinks, the depth gauge counts metres and feet, the water darkens zone by zone, the headlight
// switches on at 1,000 m. Beyond Everything brand style (kit.js shared with the other films).
import * as K from './kit.js';
import { clamp, lerp, seg, ss, eio, eo, mulberry, TAU } from '/core/lib.js';
const { P, text, sparkle, glow, card, bubble, face, pop } = K;
const PART = 2;

const W = 1080, H = 1920, CX = W / 2;
const cv = document.getElementById('c'), g = cv.getContext('2d');
K.setup(g, W, H); K.makeStars(80, 5);
await document.fonts.load('900 80px NU'); await document.fonts.load('800 40px NU');
const words = await (await fetch('voices/words.json')).json();
const lines = await (await fetch('lines.json')).json();
const dur = await (await fetch('voices/dur.json')).json();
const IDS = lines.map(l => l.id), VO = {};
{ let t = .2; for (const id of IDS) { VO[id] = +t.toFixed(3); t += dur[id] + .45; } }
const DUR = +(VO[IDS[IDS.length - 1]] + dur[IDS[IDS.length - 1]] + 1.6).toFixed(2);
const nrm = s => s.toLowerCase().replace(/[^a-z0-9]/g, '');
const at = (id, w, k = 0, e = 1) => { let n = 0; for (const x of words[id]) if (nrm(x[0]).startsWith(nrm(w)) && n++ === k) return VO[id] + Math.max(0, x[e]); throw new Error(`${w} in ${id}`); };
const S = [0, ...IDS.slice(1).map(id => VO[id] - .3), DUR];
const sceneAt = t => { let i = 0; while (i < S.length - 2 && t >= S[i + 1]) i++; return i; };
const DIVE = .8;                                                   // seconds the gauge takes to reach a new stop

// ───────── the water
const WC = [[0, [92, 200, 240]], [100, [52, 150, 220]], [250, [32, 112, 190]], [500, [22, 82, 160]], [800, [14, 52, 118]], [1000, [8, 28, 66]], [2500, [6, 20, 50]], [5000, [4, 14, 36]], [8000, [3, 10, 26]], [11000, [2, 6, 16]]];
function wcol(d) { for (let i = 1; i < WC.length; i++) if (d <= WC[i][0]) { const u = (d - WC[i - 1][0]) / (WC[i][0] - WC[i - 1][0]); return WC[i - 1][1].map((c, k) => lerp(c, WC[i][1][k], u)); } return WC[WC.length - 1][1]; }
const rgb = (c, a = 1) => `rgba(${c.map(Math.round).join(',')},${a})`;
const SNOW = Array.from({ length: 140 }, (_, i) => { const R = mulberry(i + 9); return { x: R() * W, y: R() * H, r: 1.5 + R() * 3.5, k: R() }; });
function water(t, d, travel) {
  const top = wcol(Math.max(0, d - 150)), bot = wcol(d + 250);
  const gr = g.createLinearGradient(0, 0, 0, H); gr.addColorStop(0, rgb(top)); gr.addColorStop(1, rgb(bot)); g.fillStyle = gr; g.fillRect(0, 0, W, H);
  const ray = clamp(1 - d / 300);
  if (ray > 0) { g.save(); g.globalAlpha = .16 * ray; g.fillStyle = '#ffffff'; for (let i = 0; i < 6; i++) { const x = 80 + i * 190 + Math.sin(t * .4 + i) * 30; g.beginPath(); g.moveTo(x, 0); g.lineTo(x + 90, 0); g.lineTo(x - 140, H); g.lineTo(x - 260, H); g.fill(); } g.restore(); }
  for (const s of SNOW) { const y = ((s.y - travel * (.6 + s.k)) % H + H) % H, a = (d > 200 ? .5 : .25) * (.4 + .6 * s.k); g.fillStyle = `rgba(220,235,255,${a})`; g.beginPath(); g.arc(s.x + Math.sin(t + s.k * 9) * 6, y, s.r, 0, TAU); g.fill(); }
}
function sea(t, a = 1) { g.save(); g.globalAlpha = a; const gr = g.createLinearGradient(0, 0, 0, H); gr.addColorStop(0, '#7fd2ff'); gr.addColorStop(.42, '#c9ecff'); gr.addColorStop(.43, '#3fb5e8'); gr.addColorStop(1, '#1b6db8'); g.fillStyle = gr; g.fillRect(0, 0, W, H); g.restore(); }

// ───────── characters and props
function sub(x, y, s, t, o = {}) {                                 // our yellow sub: porthole face, tower, propeller, headlight
  g.save(); g.translate(x, y + Math.sin(t * 2) * 6); g.scale(s, s); g.rotate(o.tilt || 0);
  if (o.light) { g.save(); g.globalAlpha = .55 * o.light; const gr = g.createLinearGradient(120, 0, 900, 0); gr.addColorStop(0, 'rgba(255,250,200,.9)'); gr.addColorStop(1, 'rgba(255,250,200,0)'); g.fillStyle = gr; g.beginPath(); g.moveTo(120, -20); g.lineTo(900, -260); g.lineTo(900, 260); g.lineTo(120, 20); g.fill(); g.restore(); }
  g.fillStyle = '#e8a91a'; g.beginPath(); g.roundRect(-30, -150, 90, 70, 18); g.fill(); g.fillRect(10, -190, 12, 50);
  g.fillStyle = '#ffc73a'; g.beginPath(); g.ellipse(0, 0, 160, 100, 0, 0, TAU); g.fill();
  g.fillStyle = 'rgba(200,120,0,.35)'; g.beginPath(); g.ellipse(10, 30, 150, 70, 0, 0, Math.PI); g.fill();
  const pr = t * 14; g.fillStyle = '#c98f12'; g.beginPath(); g.ellipse(-182, 0, 14, 60 * Math.abs(Math.cos(pr)), 0, 0, TAU); g.fill(); g.fillRect(-175, -8, 25, 16);
  g.fillStyle = '#ffe58a'; g.beginPath(); g.arc(150, 0, 16, 0, TAU); g.fill();
  g.fillStyle = '#c98f12'; g.beginPath(); g.arc(30, -5, 70, 0, TAU); g.fill(); g.fillStyle = '#bfe8ff'; g.beginPath(); g.arc(30, -5, 58, 0, TAU); g.fill();
  g.save(); g.translate(30, 0); face(52, o.mood || 'happy', t, o.look ?? .5, 1.2, o.lookY || 0); g.restore();
  if (o.sweat) { g.fillStyle = '#7fd4ff'; g.beginPath(); g.ellipse(100, -70, 10, 16, 0, 0, TAU); g.fill(); g.beginPath(); g.ellipse(-50, -60, 8, 13, 0, 0, TAU); g.fill(); }
  g.restore();
}
function whale(x, y, s, t, o = {}) {                               // blue whale (or sperm/beaked with o.kind)
  const kind = o.kind || 'blue', c1 = { blue: '#5a7fc8', sperm: '#6f7488', beaked: '#8b8fa8' }[kind], c2 = { blue: '#bcd0f0', sperm: '#a5a9bb', beaked: '#c8cada' }[kind];
  g.save(); g.translate(x, y + Math.sin(t * 1.3 + (o.ph || 0)) * 10); g.scale(s * (o.flip ? -1 : 1), s); g.rotate(o.tilt || 0);
  const tail = Math.sin(t * 2.2 + (o.ph || 0)) * 20;
  g.fillStyle = c1; g.beginPath();
  if (kind === 'sperm') { g.moveTo(-300, -90); g.lineTo(-60, -110); g.quadraticCurveTo(200, -80, 330, -10 + tail * .3); g.lineTo(330, 10 + tail * .3); g.quadraticCurveTo(150, 80, -60, 70); g.lineTo(-300, 70); g.closePath(); }
  else { g.moveTo(-320, 0); g.quadraticCurveTo(-300, -80, -120, -85); g.quadraticCurveTo(150, -70, 330, -8 + tail * .3); g.lineTo(330, 8 + tail * .3); g.quadraticCurveTo(150, 60, -120, 70); g.quadraticCurveTo(-300, 70, -320, 0); }
  g.fill();
  g.beginPath(); g.moveTo(330, tail * .3); g.lineTo(400, -60 + tail); g.lineTo(380, tail * .3); g.lineTo(400, 60 + tail); g.closePath(); g.fill();
  g.beginPath(); g.moveTo(120, -70); g.lineTo(170, -110); g.lineTo(190, -66); g.fill();
  g.fillStyle = c2; g.beginPath(); g.ellipse(-80, 40, 210, 30, 0, 0, TAU); g.fill();
  if (kind === 'beaked') { g.fillStyle = c1; g.beginPath(); g.moveTo(-320, -5); g.lineTo(-380, 5); g.lineTo(-320, 15); g.fill(); }
  g.save(); g.translate(kind === 'sperm' ? -200 : -230, -10); face(44, o.mood || 'happy', t, -1, 2.2); g.restore();
  g.restore();
}
function squid(x, y, s, t) { g.save(); g.translate(x, y); g.scale(s, s); g.fillStyle = '#e2603a'; g.beginPath(); g.ellipse(0, 0, 120, 40, 0, 0, TAU); g.fill(); g.beginPath(); g.moveTo(100, -10); g.lineTo(190, -50); g.lineTo(170, 0); g.lineTo(190, 50); g.lineTo(100, 10); g.fill(); g.strokeStyle = '#e2603a'; g.lineWidth = 10; g.lineCap = 'round'; for (let i = 0; i < 6; i++) { g.beginPath(); g.moveTo(-110, -20 + i * 8); g.quadraticCurveTo(-200, -40 + i * 16 + Math.sin(t * 4 + i) * 20, -280, -50 + i * 20); g.stroke(); } g.fillStyle = P.white; g.beginPath(); g.arc(-60, -8, 12, 0, TAU); g.fill(); g.fillStyle = P.navy; g.beginPath(); g.arc(-62, -8, 6, 0, TAU); g.fill(); g.restore(); }
function milSub(x, y, s, label, o = {}) { g.save(); g.translate(x, y); g.scale(s, s); g.fillStyle = o.col || '#2a3150'; g.beginPath(); g.roundRect(-320, -55, 640, 110, 55); g.fill(); g.beginPath(); g.roundRect(-60, -115, 120, 70, 14); g.fill(); g.fillRect(-10, -150, 10, 40); g.beginPath(); g.moveTo(320, 0); g.lineTo(380, -50); g.lineTo(380, 50); g.fill(); g.fillStyle = 'rgba(255,255,255,.15)'; g.fillRect(-280, -40, 560, 14); if (label) text(label, 0, 18, 46, P.white, 1000, null, 0); g.restore(); }
function diver(x, y, s, t, cheeks = 1) { g.save(); g.translate(x, y); g.scale(s, s); g.fillStyle = '#1f2238'; g.beginPath(); g.roundRect(-34, -40, 68, 170, 30); g.fill(); g.fillStyle = '#ff4d6d'; g.beginPath(); g.moveTo(-34, 120); g.lineTo(-70, 230 + Math.sin(t * 5) * 10); g.lineTo(-4, 130); g.fill(); g.beginPath(); g.moveTo(34, 120); g.lineTo(70, 230 - Math.sin(t * 5) * 10); g.lineTo(4, 130); g.fill(); g.fillStyle = P.skin; g.beginPath(); g.arc(0, -80, 46, 0, TAU); g.fill(); g.fillStyle = 'rgba(255,140,170,.8)'; for (const sd of [-1, 1]) { g.beginPath(); g.arc(sd * 30 * cheeks, -70, 16 * cheeks, 0, TAU); g.fill(); } g.fillStyle = '#9fe9ff'; g.beginPath(); g.roundRect(-34, -110, 68, 30, 12); g.fill(); g.restore(); }
function lungs(x, y, s, sq) { g.save(); g.translate(x, y); g.scale(s * (1 - .35 * sq), s); g.fillStyle = '#ff8fb0'; for (const sd of [-1, 1]) { g.beginPath(); g.ellipse(sd * 55, 20, 48, 80, sd * .15, 0, TAU); g.fill(); } g.fillStyle = '#e06a90'; g.fillRect(-8, -80, 16, 70); g.restore(); g.fillStyle = '#8a8fb0'; g.fillRect(x - 140 * s, y - 70 * s, 22 * s, 160 * s); g.fillRect(x + 118 * s, y - 70 * s, 22 * s, 160 * s); }
function gauge(x, y, r, label, a = 1, col = P.red) { if (a <= 0) return; g.save(); g.globalAlpha *= a; g.fillStyle = P.white; g.beginPath(); g.arc(x, y, r, 0, TAU); g.fill(); g.strokeStyle = P.navy; g.lineWidth = r * .08; g.stroke(); g.strokeStyle = col; g.lineWidth = r * .1; g.lineCap = 'round'; g.beginPath(); g.moveTo(x, y); g.lineTo(x + Math.cos(-.4) * r * .75, y + Math.sin(-.4) * r * .75); g.stroke(); g.restore(); text(label, x, y + r * .7, r * .42, col, 1000, null, 0, 'center', a); }
function burj(x, tipY, s) { g.save(); g.translate(x, tipY); g.scale(s, s); g.fillStyle = '#c9d3e8'; const steps = [[0, 6], [120, 18], [300, 34], [520, 54], [780, 76], [1100, 100], [1500, 130], [2000, 160]]; g.beginPath(); g.moveTo(0, 0); for (const [h, w] of steps) g.lineTo(w, -h); for (let i = steps.length - 1; i >= 0; i--) g.lineTo(-steps[i][1] * .8, -steps[i][0]); g.closePath(); g.fill(); g.fillStyle = 'rgba(40,60,110,.3)'; g.beginPath(); g.moveTo(0, 0); for (const [h, w] of steps) g.lineTo(w, -h); g.lineTo(0, -2000); g.closePath(); g.fill(); g.restore(); }
function everest(x, tipY, s, up = false) { g.save(); g.translate(x, tipY); g.scale(s, up ? s : -s); g.fillStyle = '#8a8fb0'; g.beginPath(); g.moveTo(-420, 600); g.lineTo(-120, 150); g.lineTo(0, 0); g.lineTo(150, 180); g.lineTo(440, 600); g.closePath(); g.fill(); g.fillStyle = '#6a6f92'; g.beginPath(); g.moveTo(0, 0); g.lineTo(150, 180); g.lineTo(440, 600); g.lineTo(80, 600); g.closePath(); g.fill(); g.fillStyle = P.white; g.beginPath(); g.moveTo(-90, 110); g.lineTo(0, 0); g.lineTo(110, 130); g.lineTo(40, 110); g.lineTo(0, 150); g.lineTo(-40, 100); g.closePath(); g.fill(); g.restore(); }
function eyes(t, n, seed, a = 1) { const R = mulberry(seed); for (let i = 0; i < n; i++) { const x = R() * W, y = 350 + R() * 1050, bl = Math.sin(t * 2 + i * 1.7) > .85 ? .1 : 1; g.save(); g.globalAlpha = a * (.6 + .4 * R()); g.fillStyle = R() < .5 ? '#c8ff8a' : '#ffe58a'; for (const dx of [-12, 12]) { g.beginPath(); g.ellipse(x + dx, y, 7, 7 * bl, 0, 0, TAU); g.fill(); } g.restore(); } }
function vent(x, y, s, t) { g.save(); g.translate(x, y); g.scale(s, s); for (let i = 0; i < 6; i++) { const u = (t * .3 + i / 6) % 1; g.fillStyle = `rgba(30,30,40,${.7 * (1 - u)})`; g.beginPath(); g.arc(Math.sin(u * 6 + i) * 40 * u, -260 - u * 600, 50 + u * 120, 0, TAU); g.fill(); } g.fillStyle = '#2a2530'; g.beginPath(); g.moveTo(-120, 200); g.lineTo(-60, -260); g.lineTo(60, -260); g.lineTo(120, 200); g.fill(); glow(0, -250, 130, '255,120,40', .55); g.fillStyle = '#ff7a2e'; g.beginPath(); g.ellipse(0, -258, 50, 14, 0, 0, TAU); g.fill(); g.restore(); }
function shrimp(x, y, s, t, ph) { g.save(); g.translate(x + Math.sin(t * 2 + ph) * 14, y + Math.cos(t * 1.6 + ph) * 10); g.scale(s, s); g.strokeStyle = '#ffd2dc'; g.lineWidth = 16; g.lineCap = 'round'; g.beginPath(); g.arc(0, 0, 26, .6, 3.6); g.stroke(); g.lineWidth = 3; g.beginPath(); g.moveTo(-20, -14); g.lineTo(-50, -40); g.stroke(); g.restore(); }
function stopwatch(x, y, r, label, a = 1) { if (a <= 0) return; g.save(); g.globalAlpha *= a; g.fillStyle = P.white; g.beginPath(); g.arc(x, y, r, 0, TAU); g.fill(); g.fillRect(x - 14, y - r - 30, 28, 30); g.strokeStyle = P.navy; g.lineWidth = 8; g.beginPath(); g.moveTo(x, y); g.lineTo(x + r * .5, y - r * .55); g.stroke(); g.restore(); text(label, x, y + r + 60, 48, P.gold, 1000, P.navy, 10, 'center', a); }
function titanic(x, y, s) { g.save(); g.translate(x, y); g.scale(s, s); g.fillStyle = '#1b1820'; g.beginPath(); g.moveTo(-420, -60); g.lineTo(-40, -70); g.lineTo(-20, 60); g.lineTo(-380, 60); g.closePath(); g.fill(); g.fillStyle = '#7a2a2a'; g.fillRect(-380, 30, 360, 30); g.fillStyle = '#c98f12'; g.fillRect(-300, -130, 50, 70); g.fillRect(-180, -130, 50, 70); g.fillStyle = '#1b1820'; g.save(); g.translate(170, 20); g.rotate(.25); g.beginPath(); g.moveTo(-60, -70); g.lineTo(260, -40); g.lineTo(230, 60); g.lineTo(-40, 60); g.closePath(); g.fill(); g.restore(); g.fillStyle = 'rgba(160,100,60,.5)'; for (let i = 0; i < 9; i++) g.fillRect(-380 + i * 40, -50, 18, 10); g.restore(); }
function fangtooth(x, y, s, t) { g.save(); g.translate(x, y + Math.sin(t * 2) * 8); g.scale(s, s); g.fillStyle = '#4a3a42'; g.beginPath(); g.ellipse(0, 0, 110, 70, 0, 0, TAU); g.fill(); g.beginPath(); g.moveTo(90, 0); g.lineTo(170, -50); g.lineTo(170, 50); g.fill(); g.fillStyle = P.white; for (let i = 0; i < 5; i++) { g.beginPath(); g.moveTo(-100 + i * 18, 10); g.lineTo(-92 + i * 18, 50); g.lineTo(-84 + i * 18, 10); g.fill(); } g.save(); g.translate(-50, -20); face(34, 'annoyed', t, -1, 3); g.restore(); g.restore(); }
function hagfish(x, y, s, t) { g.save(); g.translate(x, y); g.scale(s, s); g.strokeStyle = '#ff9fb8'; g.lineWidth = 34; g.lineCap = 'round'; g.beginPath(); for (let i = 0; i <= 20; i++) { const u = i / 20, px = -200 + u * 400, py = Math.sin(u * 8 + t * 4) * 26; i ? g.lineTo(px, py) : g.moveTo(px, py); } g.stroke(); g.fillStyle = P.navy; g.beginPath(); g.arc(-200, -6, 5, 0, TAU); g.fill(); g.restore(); }
function dumbo(x, y, s, t) { g.save(); g.translate(x, y + Math.sin(t * 2.4) * 16); g.scale(s, s); const f = Math.sin(t * 6) * .4; g.fillStyle = '#ff8fb0'; for (const sd of [-1, 1]) { g.save(); g.translate(sd * 60, -40); g.rotate(sd * (.6 + f)); g.beginPath(); g.ellipse(sd * 30, 0, 44, 22, 0, 0, TAU); g.fill(); g.restore(); } g.beginPath(); g.arc(0, 0, 80, Math.PI, TAU); g.lineTo(80, 30); for (let i = 0; i < 6; i++) g.quadraticCurveTo(70 - i * 30, 70, 55 - i * 30, 30); g.closePath(); g.fill(); g.save(); g.translate(0, -10); face(48, 'happy', t, 0, 4); g.restore(); g.restore(); }
function snailfish(x, y, s, t) { g.save(); g.translate(x, y + Math.sin(t * 2) * 10); g.scale(s, s); g.fillStyle = 'rgba(255,220,230,.92)'; g.beginPath(); g.ellipse(0, 0, 90, 60, 0, 0, TAU); g.fill(); g.beginPath(); g.moveTo(60, -30); g.quadraticCurveTo(220, -10 + Math.sin(t * 4) * 20, 260, 0); g.quadraticCurveTo(220, 20 + Math.sin(t * 4) * 20, 60, 30); g.fill(); g.save(); g.translate(-20, -6); face(46, 'happy', t, -1, 5); g.restore(); g.restore(); }
function trieste(x, y, s, t) { g.save(); g.translate(x, y); g.scale(s, s); g.fillStyle = '#9aa3b8'; g.beginPath(); g.roundRect(-260, -170, 520, 150, 70); g.fill(); g.fillStyle = '#7a839a'; g.fillRect(-20, -230, 40, 60); g.fillStyle = '#5a6078'; g.fillRect(-20, -20, 40, 60); g.fillStyle = '#c9ced9'; g.beginPath(); g.arc(0, 90, 80, 0, TAU); g.fill(); g.fillStyle = '#bfe8ff'; g.beginPath(); g.arc(0, 90, 50, 0, TAU); g.fill(); for (const dx of [-18, 18]) { g.fillStyle = P.skin; g.beginPath(); g.arc(dx, 92, 16, 0, TAU); g.fill(); g.save(); g.translate(dx, 94); face(14, 'happy', t, 0, dx); g.restore(); } g.restore(); text('TRIESTE', x, y - 90 * s, 46 * s, P.navy, 1000, null, 0); }
function challenger(x, y, s) { g.save(); g.translate(x, y); g.scale(s, s); g.fillStyle = '#5fcf7a'; g.beginPath(); g.roundRect(-55, -330, 110, 400, 55); g.fill(); g.fillStyle = '#3fa35e'; g.fillRect(-55, -60, 110, 30); g.fillStyle = '#bfe8ff'; g.beginPath(); g.arc(0, 40, 36, 0, TAU); g.fill(); g.restore(); }
function clapper(x, y, s, t) { g.save(); g.translate(x, y); g.scale(s, s); g.fillStyle = '#1b1840'; g.fillRect(-80, -20, 160, 110); g.save(); g.translate(-80, -20); g.rotate(-.3 * Math.max(0, Math.sin(t * 6))); g.fillStyle = P.white; g.fillRect(0, -30, 160, 30); g.fillStyle = '#1b1840'; for (let i = 0; i < 4; i++) g.fillRect(10 + i * 40, -30, 20, 30); g.restore(); g.restore(); }
function kaiko(x, y, s, t) { g.save(); g.translate(x, y); g.scale(s, s); g.fillStyle = '#ffc73a'; g.beginPath(); g.roundRect(-150, -110, 300, 220, 30); g.fill(); g.fillStyle = '#e8a91a'; g.fillRect(-150, 40, 300, 30); g.fillStyle = '#bfe8ff'; g.beginPath(); g.arc(-70, -30, 34, 0, TAU); g.arc(70, -30, 34, 0, TAU); g.fill(); g.strokeStyle = '#8a8fb0'; g.lineWidth = 18; g.lineCap = 'round'; const a = Math.sin(t * 2) * .3; g.beginPath(); g.moveTo(120, 80); g.lineTo(200, 160 + a * 40); g.lineTo(150, 240); g.stroke(); g.restore(); text('KAIKO', x, y - 140 * s, 44 * s, P.gold, 1000, P.navy, 10); }
function seabed(t, y, col = '#2a2540', trench = 0) { g.fillStyle = col; g.beginPath(); g.moveTo(0, y); for (let x = 0; x <= W; x += 30) { const c = Math.abs(x - CX) < 240 * trench ? (1 - Math.abs(x - CX) / (240 * trench)) * 700 * trench : 0; g.lineTo(x, y + Math.sin(x / 90) * 14 + c); } g.lineTo(W, H); g.lineTo(0, H); g.fill(); }

// ───────── the depth gauge (top): metres and feet
function depthGauge(d, a = 1) {
  card(CX, 175, 700, 150, a, 'rgba(12,10,44,.8)'); g.save(); g.globalAlpha = a; g.strokeStyle = P.cyan; g.lineWidth = 6; g.beginPath(); g.roundRect(CX - 350, 100, 700, 150, 26); g.stroke(); g.restore();
  text(`${Math.round(d).toLocaleString('en-US')} m`, CX, 200, 82, P.gold, 1000, null, 0, 'center', a); text(`${Math.round(d * 3.281).toLocaleString('en-US')} ft  ·  DEPTH`, CX, 238, 28, '#cfe8ff', 900, null, 0, 'center', a);
}

// ───────── the stops of each part: depth + what's there
const cue = {};
const STOPS = PART === 1 ? [
  { d: 0, surface: 1, draw: (t) => {                                // hook: Everest sinks into a cube of ocean
      sea(t); const sink = ss(seg(t, .3, cue.mile)), cx = CX, cy = 1010;
      g.save(); g.globalAlpha = .9; g.fillStyle = '#1f6fc0'; g.beginPath(); g.roundRect(cx - 360, cy - 300, 720, 760, 30); g.fill(); g.restore();
      g.save(); g.beginPath(); g.roundRect(cx - 360, cy - 300, 720, 760, 30); g.clip(); everest(cx, lerp(cy - 280, cy + 30, sink), .75, true); g.fillStyle = 'rgba(40,140,220,.45)'; g.fillRect(cx - 360, cy - 300, 720, 760); g.restore();
      g.strokeStyle = 'rgba(255,255,255,.7)'; g.lineWidth = 6; g.beginPath(); g.roundRect(cx - 360, cy - 300, 720, 760, 30); g.stroke();
      if (sink > .95) { K.arrow(cx + 420, cy - 290, cx + 420, cy + 20, P.gold, 10); K.arrow(cx + 420, cy + 20, cx + 420, cy - 290, P.gold, 10); text('still 2 km', cx + 300, cy - 120, 46, P.gold, 1000, P.navy, 10, 'center'); text('(1.3 mi)', cx + 300, cy - 70, 34, P.white, 900, P.navy, 8, 'center'); }
      g.save(); g.translate(CX, 330); text('EVEREST WOULD', 0, -30, 92, P.white, 1000, P.navy, 16); text('DROWN', 0, 100, 150, P.gold, 1000, P.navy, 18); g.restore();
    } },
  { d: 0, surface: 1, draw: (t) => {                                // let's sink
      sea(t); const dive = ss(seg(t, cue.sink - .2, cue.sink + .5));
      sub(CX, lerp(820, 1500, dive), .9, t, { mood: 'happy', look: 0, tilt: dive * .5 });
      g.fillStyle = 'rgba(255,255,255,.55)'; for (let i = 0; i < 8; i++) { const x = 120 + i * 120; g.beginPath(); g.ellipse(x + Math.sin(t * 2 + i) * 14, 830, 40, 8, 0, 0, TAU); g.fill(); }
      const kq = pop(t, cue.there - .2); if (kq > 0) bubble(CX + 150, 580, 300, 110, "What's down there?", kq, P.navy, -1);
    } },
  { d: 30, draw: (t) => {                                           // 99% + the bathtub
      const kp = pop(t, cue.p99 - .2, .5); if (kp > 0) { g.save(); g.translate(CX, 640); g.scale(kp, kp); g.fillStyle = '#5fcf7a'; g.beginPath(); g.arc(0, 0, 210, 0, TAU); g.fill(); g.fillStyle = '#3fb5e8'; g.beginPath(); g.moveTo(0, 0); g.arc(0, 0, 210, -Math.PI / 2 + .06, -Math.PI / 2 + TAU); g.closePath(); g.fill(); text('99%', 0, 30, 110, P.white, 1000, P.navy, 14); text('of all living space', 0, 280, 44, P.white, 900, P.navy, 10); g.restore(); }
      const kb = pop(t, cue.bathtub - .2, .5); if (kb > 0) { const a = 1; g.save(); g.translate(CX, 1150); g.scale(kb, kb); g.fillStyle = P.white; g.beginPath(); g.roundRect(-300, -60, 600, 180, [10, 10, 90, 90]); g.fill(); g.fillStyle = '#3fb5e8'; g.fillRect(-280, -50, 560, 40); g.fillStyle = '#c9ced9'; for (const dx of [-230, 230]) g.fillRect(dx - 10, 110, 20, 60); text('1,100 km', 0, 70, 64, P.navy, 1000, null, 0); g.restore(); }
    } },
  { d: 100, draw: (t) => {                                          // human + blue whale
      whale(CX + 60, 760, 1.15, t, { mood: 'happy' });
      g.save(); g.translate(170, 1150); g.scale(.35, .35); diver(0, 0, 1, t, 0); g.restore(); text('you', 170, 1290, 40, P.white, 900, P.navy, 10, 'center');
      text('blue whale', CX + 60, 980, 48, '#bcd0f0', 1000, P.navy, 10, 'center', ss(seg(t, cue.blue - .2, cue.blue + .2)));
    } },
  { d: 210, draw: (t) => {                                          // USS Triton
      milSub(CX, 720, .95, 'USS TRITON');
      const kg = pop(t, cue.circle - .3, .5); if (kg > 0) { g.save(); g.translate(CX, 1130); g.scale(kg, kg); K.earth(0, 0, 130, t, 'happy', { look: 0 }); g.strokeStyle = P.gold; g.lineWidth = 8; g.setLineDash([18, 14]); g.beginPath(); g.ellipse(0, 0, 210, 70, -.2, 0, TAU); g.stroke(); g.setLineDash([]); const a = t * 1.5; g.fillStyle = '#2a3150'; g.beginPath(); g.ellipse(Math.cos(a) * 210 * Math.cos(-.2) - Math.sin(a) * 70 * Math.sin(-.2), Math.cos(a) * 210 * Math.sin(-.2) + Math.sin(a) * 70 * Math.cos(-.2), 34, 12, 0, 0, TAU); g.fill(); g.restore(); text('1960', CX, 1320, 56, P.gold, 1000, P.navy, 10, 'center', kg); }
    } },
  { d: 253, draw: (t) => {                                          // free dive, 26× pressure, lungs
      g.strokeStyle = 'rgba(255,255,255,.6)'; g.lineWidth = 6; g.beginPath(); g.moveTo(330, 0); g.lineTo(330, 1300); g.stroke();
      g.save(); g.translate(330, 700); g.rotate(Math.PI); diver(0, 0, 1.1, t, 1); g.restore();
      text('one breath', 330, 1000, 44, P.white, 900, P.navy, 10, 'center', ss(seg(t, cue.breath - .2, cue.breath + .2)));
      gauge(780, 640, 140, '26×', ss(seg(t, cue.p26 - .3, cue.p26)));
      const sq = ss(seg(t, cue.crush - .2, cue.crush + .5)); if (t > cue.crush - .4) lungs(780, 1060, 1.1, sq);
    } },
  { d: 500, draw: (t) => {                                          // whales manage it; sperm whale vs giant squid
      whale(300, 620, .75, t, { mood: 'happy', ph: 1 }); text('blue whale · 500 m', 300, 760, 40, '#bcd0f0', 1000, P.navy, 10, 'center', ss(seg(t, cue.reach - .2, cue.reach + .2)));
      const sp = ss(seg(t, cue.sperm - .3, cue.sperm + 1.6));
      squid(lerp(820, 380, sp), lerp(980, 1300, sp), .8, t); whale(lerp(1150, 650, sp), lerp(900, 1220, sp), .7, t, { kind: 'sperm', mood: 'keen', tilt: .35, flip: true });
      text('sperm whale', lerp(1150, 650, sp), lerp(900, 1220, sp) - 140, 40, '#cfd3e3', 1000, P.navy, 10, 'center', ss(seg(t, cue.sperm - .2, cue.sperm + .2)));
    } },
  { d: 730, alarm: 1, draw: (t) => {                                // attack sub danger zone
      milSub(CX + 120, 1150, .8, '', { col: '#30344a' });
      const al = (Math.sin(t * 10) > 0 ? .22 : .05) * ss(seg(t, cue.attack - .3, cue.attack)); g.fillStyle = `rgba(255,40,60,${al})`; g.fillRect(0, 0, W, H);
      for (let i = 0; i < 9; i++) { g.fillStyle = i % 2 ? '#ffc73a' : '#1b1840'; g.fillRect(i * 120, 1370, 120, 26); }
      text('DANGER ZONE', CX, 1350, 60, P.red, 1000, P.white, 10, 'center', ss(seg(t, cue.attack - .2, cue.attack + .2)));
      if (t > cue.implode) { const k = Math.sin((t - cue.implode) * 30) * 4; g.strokeStyle = P.white; g.lineWidth = 6; g.beginPath(); g.moveTo(CX + 80 + k, 1110); g.lineTo(CX + 110, 1150); g.lineTo(CX + 90, 1190); g.stroke(); }
    } },
  { d: 828, draw: (t) => {                                          // the Burj Khalifa hung upside down
      const dn = ss(seg(t, cue.burj - .2, cue.tip));
      burj(CX + 220, lerp(-200, 900, dn), .5);
      text('BURJ KHALIFA · 828 m', CX + 220, lerp(-300, 400, dn), 40, P.white, 1000, P.navy, 10, 'center', dn);
    } },
  { d: 1000, dark: 1, draw: (t) => {                               // the midnight zone; cliffhanger
      const bl = ss(seg(t, cue.runs - .2, cue.runs + .8)); g.fillStyle = `rgba(0,0,0,${.75 * bl})`; g.fillRect(0, 0, W, H);
      eyes(t, 14, 7, ss(seg(t, cue.things - .2, cue.things + .6)));
      text('MIDNIGHT ZONE', CX, 1300, 64, '#c8ff8a', 1000, P.navy, 12, 'center', ss(seg(t, cue.below - .2, cue.below + .3)));
      const k2 = pop(t, cue.part2 - .1, .4); if (k2 > 0) { g.save(); g.translate(CX, 640); g.scale(k2, k2); g.fillStyle = P.gold; g.beginPath(); g.roundRect(-260, -80, 520, 160, 40); g.fill(); text('PART 2 →', 0, 30, 90, P.navy, 1000, null, 0); g.restore(); }
    } },
] : [
  { d: 1000, dark: 1, draw: (t) => {                               // hook: the sun has never shone here
      g.fillStyle = 'rgba(0,0,0,.6)'; g.fillRect(0, 0, W, H); eyes(t, 10, 3, .9);
      const sw = (t * .9) % 4; if (sw < 2) { const x = lerp(1250, -300, sw / 2); g.save(); g.globalAlpha = .7; g.fillStyle = '#0a0a14'; g.beginPath(); g.ellipse(x, 1000, 260, 70, 0, 0, TAU); g.fill(); g.beginPath(); g.moveTo(x + 240, 1000); g.lineTo(x + 340, 930); g.lineTo(x + 340, 1070); g.fill(); g.restore(); }
      g.save(); g.translate(CX, 600); text('THE SUN HAS', 0, -30, 92, P.white, 1000, P.navy, 16); text('NEVER SHONE HERE', 0, 90, 100, P.gold, 1000, P.navy, 18); g.restore();
    } },
  { d: 2300, dark: 1, draw: (t) => {                               // vents and eyeless shrimp
      seabed(t, 1330); vent(CX + 160, 1200, 1, t);
      for (let i = 0; i < 14; i++) { const R = mulberry(i + 40); shrimp(CX - 120 + R() * 520, 1000 + R() * 300, .9, t, i); }
      const k = ss(seg(t, cue.vents - .3, cue.vents + .2)); if (k > 0) { card(260, 520, 320, 110, k); text('≈2 °C', 260, 540, 60, P.cyan, 1000, null, 0, 'center', k); card(820, 640, 340, 110, k); text('400 °C+', 820, 660, 60, '#ff8a3c', 1000, null, 0, 'center', k); }
    } },
  { d: 2992, dark: 1, draw: (t) => {                               // Cuvier's beaked whale
      whale(CX + 40, 760, .95, t, { kind: 'beaked', mood: 'smug' });
      text("Cuvier's beaked whale", CX, 980, 46, '#e0e2ee', 1000, P.navy, 10, 'center', ss(seg(t, cue.cuvier - .2, cue.cuvier + .2)));
      stopwatch(CX, 1180, 100, '3 h 42 min', ss(seg(t, cue.held - .2, cue.held + .3)));
    } },
  { d: 3800, dark: 1, draw: (t) => {                               // the Titanic; and still, life
      seabed(t, 1250, '#221d30'); titanic(CX + 90, 1180, .95);
      gauge(850, 520, 110, '380×', ss(seg(t, cue.p380 - .3, cue.p380)));
      const kf = pop(t, cue.fang - .2, .45); if (kf > 0) { g.save(); g.translate(250, 560); g.scale(kf, kf); fangtooth(0, 0, .9, t); g.restore(); }
      const kh = pop(t, cue.hag - .2, .45); if (kh > 0) { g.save(); g.translate(330, 820); g.scale(kh, kh); hagfish(0, 0, .8, t); g.restore(); }
      const kd = pop(t, cue.dumbo - .2, .45); if (kd > 0) { g.save(); g.translate(780, 830); g.scale(kd, kd); dumbo(0, 0, 1.1, t); g.restore(); }
    } },
  { d: 6000, dark: 1, draw: (t) => {                               // the hadal zone: the floor splits
      const sp = ss(seg(t, cue.hadal - .3, cue.trench + .4)); seabed(t, 1150, '#1f1a2c', sp);
      text('HADAL ZONE', CX, 900, 80, '#c8ff8a', 1000, P.navy, 14, 'center', ss(seg(t, cue.hadal - .2, cue.hadal + .2)));
    } },
  { d: 8336, dark: 1, draw: (t) => {                               // the snailfish
      g.fillStyle = '#16121f'; g.fillRect(0, 0, 220, H); g.fillRect(W - 220, 0, 220, H);
      snailfish(CX + 120, 900, 1.3, t); text('deepest fish ever filmed', CX + 60, 1120, 44, '#ffdce6', 1000, P.navy, 10, 'center', ss(seg(t, cue.fish - .2, cue.fish + .2)));
    } },
  { d: 8849, dark: 1, draw: (t) => {                               // Everest's summit, upside down
      g.fillStyle = '#16121f'; g.fillRect(0, 0, 220, H); g.fillRect(W - 220, 0, 220, H);
      const dn = ss(seg(t, VO.d07, cue.stops)); everest(CX + 200, lerp(-400, 900, dn), .9);
      text('EVEREST · 8,849 m', CX + 200, lerp(-600, 300, dn), 44, P.white, 1000, P.navy, 10, 'center', dn);
      text('still not the bottom', CX, 1300, 52, P.gold, 1000, P.navy, 10, 'center', ss(seg(t, cue.still - .2, cue.still + .2)));
    } },
  { d: 10935, dark: 1, draw: (t) => {                              // Challenger Deep: Trieste 1960, Cameron 2012
      seabed(t, 1300, '#1a1626'); text('CHALLENGER DEEP', CX, 1380, 48, P.gold, 1000, P.navy, 10, 'center', 1);
      const kt = ss(seg(t, VO.d08 + .3, cue.reached + .3)); trieste(CX + 20, lerp(400, 1130, kt), .9, t); text('1960', CX + 20, lerp(150, 880, kt), 50, P.gold, 1000, P.navy, 10, 'center', kt);
      const kc = pop(t, cue.cameron - .2, .5); if (kc > 0) { g.save(); g.translate(880, 900); g.scale(kc, kc); challenger(0, 0, .9); clapper(0, -380, .7, t); text('2012', 0, 170, 50, P.gold, 1000, P.navy, 10, 'center'); g.restore(); }
    } },
  { d: 10935, dark: 1, draw: (t) => {                              // Kaiko; 20+ visitors
      seabed(t, 1300, '#1a1626'); kaiko(430, 960, .85, t);
      const n = Math.round(350 * ss(seg(t, cue.kaiko, cue.species + .6))); card(430, 620, 380, 130, 1); text(`${n} species`, 430, 640, 62, P.gold, 1000, null, 0, 'center', 1);
      const kq = ss(seg(t, cue.since - .2, cue.touched)); if (kq > 0) { for (let i = 0; i < 5; i++) { const R = mulberry(i + 60); g.save(); g.globalAlpha = kq; sub(760 + (i % 2) * 120, 520 + i * 150 + R() * 40, .32, t + i, { mood: 'happy', look: -1 }); g.restore(); } text('20+ visitors', 800, 1360, 50, P.white, 1000, P.navy, 10, 'center', kq); }
    } },
  { d: 10935, dark: 1, draw: (t) => {                              // only 5–10% explored
      g.fillStyle = 'rgba(0,0,0,.5)'; g.fillRect(0, 0, W, H);
      const km = pop(t, cue.explored - .2, .5); if (km > 0) { g.save(); g.translate(CX, 720); g.scale(km, km); g.fillStyle = '#0b0a24'; g.beginPath(); g.roundRect(-420, -230, 840, 460, 30); g.fill(); g.save(); g.beginPath(); g.roundRect(-420, -230, 840, 460, 30); g.clip(); g.fillStyle = '#3fb5e8'; g.fillRect(-420, -230, 70, 460); g.restore(); g.strokeStyle = P.cyan; g.lineWidth = 6; g.beginPath(); g.roundRect(-420, -230, 840, 460, 30); g.stroke(); text('5–10% explored', -10, 300, 64, P.gold, 1000, P.navy, 12); g.restore(); }
      eyes(t, 26, 11, ss(seg(t, cue.explored + .6, cue.explored + 1.4)));
    } },
  { d: 0, surface: 1, draw: (t) => {                               // the beach: maybe don't look down
      sea(t); g.fillStyle = '#f5d08a'; g.beginPath(); g.moveTo(0, 820); g.quadraticCurveTo(300, 760, 520, 830); g.lineTo(0, 860); g.fill();
      g.save(); g.translate(CX + 60, 820); g.scale(.5, .5); diver(0, 0, 1, t, 0); g.restore();
      const look = ss(seg(t, cue.look - .3, cue.look + .3));
      g.fillStyle = 'rgba(6,20,50,.6)'; g.fillRect(0, 1250, W, H - 1250);
      glow(CX - 60, 1440, 90 * look, '200,255,140', .8); g.fillStyle = '#c8ff8a'; g.beginPath(); g.arc(CX - 60, 1440, 14 * look, 0, TAU); g.fill();
      if (look > .5) bubble(CX + 260, 620, 200, 110, '…nope', pop(t, cue.look + .3), P.navy, -1);
    } },
];
if (PART === 1) Object.assign(cue, { mile: at('c01', 'mile'), there: at('c02', 'there'), sink: at('c02', 'sink'), p99: at('c03', '99'), bathtub: at('c03', 'bathtub'), blue: at('c04', 'blue'), circle: at('c05', 'circle'), breath: at('c06', 'breath'), p26: at('c06', '26'), crush: at('c06', 'crush'), reach: at('c07', 'reach'), sperm: at('c07', 'sperm'), attack: at('c08', 'attack'), implode: at('c08', 'implode'), burj: at('c09', 'burj'), tip: at('c09', 'tip'), runs: at('c10', 'runs'), below: at('c10', 'below'), things: at('c10', 'things'), part2: at('c10', 'part') });
else Object.assign(cue, { vents: at('d02', 'vents'), cuvier: at('d03', 'covea'), held: at('d03', 'held'), p380: at('d04', '380'), fang: at('d04', 'fang'), hag: at('d04', 'hagfish'), dumbo: at('d04', 'dumbo'), hadal: at('d05', 'hadal'), trench: at('d05', 'trenches'), fish: at('d06', 'deepest'), stops: at('d07', 'stops'), still: at('d07', 'still'), reached: at('d08', 'reached'), cameron: at('d08', 'director'), kaiko: at('d09', 'kaiko'), species: at('d09', 'species'), since: at('d09', 'since'), touched: at('d09', 'touched'), explored: at('d10', 'explored'), look: at('d11', 'look') });

// ───────── frame: each stop dives in from the last (gauge counts, snow streams up, a short shake)
function depthAt(t) { const i = sceneAt(t), d1 = STOPS[i].d, d0 = i > 0 ? STOPS[i - 1].d : d1; return lerp(d0, d1, eio(seg(t, S[i], S[i] + DIVE))); }
function travelAt(t) { let tr = 0; for (let i = 1; i <= sceneAt(t); i++) tr += 1400 * eio(seg(t, S[i], S[i] + DIVE)); return tr + t * 30; }
function render(t) {
  g.setTransform(1, 0, 0, 1, 0, 0); g.globalAlpha = 1;
  const i = sceneAt(t), st = STOPS[i], d = depthAt(t), u = clamp((t - S[i]) / DIVE);
  const shake = i > 0 && u < 1 && !st.surface ? Math.sin(u * Math.PI) * 8 * Math.sin(t * 60) : 0;
  g.save(); g.translate(0, shake);
  if (!st.surface) { water(t, d, travelAt(t)); }
  const draw = (k, a, dy) => { g.save(); g.globalAlpha = a; g.translate(0, dy); STOPS[k].draw(t); g.restore(); };
  if (i > 0 && u < 1 && !(st.surface && STOPS[i - 1].surface && i === 1)) { draw(i - 1, 1 - ss(seg(u, 0, .5)), -700 * eio(u)); draw(i, ss(seg(u, .3, 1)), 700 * (1 - eo(u))); }
  else draw(i, 1, 0);
  if (!st.surface) { const dark = clamp((d - 700) / 300); sub(165, 1185, .5, t, { mood: st.alarm && t > S[i] + .5 ? 'scared' : dark > .5 ? 'worried' : 'happy', look: .8, light: dark, sweat: st.alarm ? 1 : 0 }); }
  g.restore();
  if (!st.surface) depthGauge(d);
  captions(t);
  const fo = seg(t, DUR - .6, DUR); if (fo > 0) { g.fillStyle = `rgba(0,0,0,${fo})`; g.fillRect(0, 0, W, H); }
}

// ───────── captions: word-pops, key words in gold (lower middle, above the Shorts UI)
const FIX = { 'meters': 'metres', 'meters.': 'metres.', 'meters,': 'metres,', "covea's": "Cuvier's", 'jack': 'Jacques', 'picard': 'Piccard', 'yeah,': 'Yet', 'tooth': 'tooth', 'it\'s': "it's" };
const KEY = new Set(['everest', 'mile', 'underwater', 'sink', '99', 'bathtub', '1100', 'km', '100', 'blue', 'whales', 'triton', '1960', '210', '253', 'breath', '26', 'crush', 'lungs', 'survive', '500', 'sperm', 'squid', '730', 'implode', 'burj', 'khalifa', 'tip', '1000', 'sunlight', 'night', 'forever', 'part', '2',
  'never', 'alive', 'eyes', 'shrimp', 'volcanoes', '400', '3', 'mammal', 'three', 'hours', '3800', 'titanic', '380', 'fang', 'hagfish', 'dumbo', '6', 'hadal', 'trenches', '8', 'snail', 'summit', 'bottom', 'challenger', 'deep', '11', 'cameron', 'solo', 'kaiko', '350', '20', 'people', '5', 'beach', 'look', 'down']);
const CAP = [];
for (const [id, ws] of Object.entries(words)) {
  const toks = []; for (const w of ws) { const lw = w[0].toLowerCase(); const s = FIX[lw] ?? w[0]; if (/^[,.%\-]/.test(s) && toks.length) { const p = toks[toks.length - 1]; p.w += s; p.t1 = w[2]; } else toks.push({ w: s, k: w[0], t0: Math.max(0, w[1]), t1: w[2] }); }
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
  rows.forEach((row, ri) => { const tot = row.reduce((p, w) => p + w.wd, 0); let x = CX - tot / 2; const y = 1530 + ri * 88;
    for (const w of row) { const k = clamp((t - w.t0) / .1); if (k > 0) { g.save(); g.globalAlpha = k; g.translate(x, y); const s = .85 + .15 * eo(k); g.scale(s, s); g.lineJoin = 'round'; g.lineWidth = 16; g.strokeStyle = P.navy; g.textAlign = 'left'; g.strokeText(w.s, 0, 0); g.fillStyle = KEY.has(nrm(w.k)) ? P.gold : P.white; g.fillText(w.s, 0, 0); g.restore(); } x += w.wd; } });
  g.restore();
}

// ───────── events for the score and the mix
const EV = [];
for (const [id, t] of Object.entries(VO)) EV.push({ type: 'vo', id, t });
for (const [k, v] of Object.entries(cue)) EV.push({ type: 'cue', name: k, t: +v.toFixed(3) });
S.forEach((s, i) => { if (i > 0 && i < S.length - 1) EV.push({ type: 'scene', i, t: +s.toFixed(3), d: STOPS[i].d, dark: STOPS[i].dark ? 1 : 0, surface: STOPS[i].surface ? 1 : 0 }); });
EV.sort((a, b) => a.t - b.t);
window.EV = EV; window.DUR = DUR; window.render = render;
window.SUBS = lines.map((l, i) => { const ws = words[l.id], t0 = VO[l.id] - .05, nx = lines[i + 1] ? VO[lines[i + 1].id] - .05 : DUR; return { t0, t1: Math.max(Math.min(VO[l.id] + ws[ws.length - 1][2] + .6, nx), t0 + 1.8), text: l.sub || l.text }; });
render(+(new URLSearchParams(location.search).get('t') ?? 1.5));
window.READY = true;
