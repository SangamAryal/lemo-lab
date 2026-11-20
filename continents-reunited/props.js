// Props for "What If Earth Stopped Spinning?" (the film and its thumbnail): a standing person, a house, trees, the
// street, the city, Earth holding a stop sign. Drawn in the Beyond Everything style on top of kit.js.
import * as K from './kit.js';
import { lerp, mulberry, TAU } from '/core/lib.js';
const { P, text } = K;
let g, W, H;
export function setup(ctx, w, h) { g = ctx; W = w; H = h; }
const SKIN = P.skin;
// a standing person. o.rot (whole body), o.arms: 'down' | 'up' | 'flail' | 'hold' | 'wave', o.legs: 'stand' | 'kick'
export function stander(x, y, s, t, o = {}) {
  g.save(); g.translate(x, y); g.rotate(o.rot || 0); g.scale(s, s);
  const kick = o.legs === 'kick' ? Math.sin(t * 14) : 0;
  g.strokeStyle = P.jeans; g.lineWidth = 46; g.lineCap = 'round';
  for (const sd of [-1, 1]) { g.beginPath(); g.moveTo(sd * 24, -170); g.lineTo(sd * (30 + kick * sd * 30), -20 + Math.abs(kick) * -20); g.stroke(); }
  g.fillStyle = P.white; for (const sd of [-1, 1]) { g.beginPath(); g.roundRect(sd * (30 + kick * sd * 30) - 26 + sd * 12, -30 + Math.abs(kick) * -20, 62, 32, 14); g.fill(); }
  g.fillStyle = P.hood; g.beginPath(); g.roundRect(-75, -400, 150, 250, 60); g.fill();
  g.fillStyle = P.hoodD; g.beginPath(); g.roundRect(-75, -400, 50, 250, [60, 0, 0, 60]); g.fill();
  // arms
  g.strokeStyle = P.hood; g.lineWidth = 40;
  const arm = (sd, ex, ey, hx, hy) => { g.strokeStyle = P.hood; g.beginPath(); g.moveTo(sd * 60, -360); g.quadraticCurveTo(ex, ey, hx, hy); g.stroke(); g.fillStyle = SKIN; g.beginPath(); g.arc(hx, hy, 24, 0, TAU); g.fill(); };
  const mode = o.arms || 'down';
  if (mode === 'up' || mode === 'flail') { const f = mode === 'flail' ? Math.sin(t * 12) * 30 : 0; arm(-1, -130, -460, -150 + f, -560 - f); arm(1, 130, -460, 150 - f, -560 + f); }
  else if (mode === 'hold') { arm(-1, 50, -330, 95, -340); arm(1, 120, -380, 95, -400); }
  else if (mode === 'wave') { const a = Math.sin(t * 9) * 30; arm(-1, -100, -260, -90, -190); arm(1, 150, -420, 170 + a, -540); }
  else { arm(-1, -100, -260, -95, -190); arm(1, 100, -260, 95, -190); }
  const hy = -470 + Math.sin(t * 1.3) * 2;
  g.fillStyle = SKIN; g.beginPath(); g.arc(0, hy, 68, 0, TAU); g.fill();
  g.fillStyle = P.hair; g.beginPath(); g.arc(0, hy - 14, 70, Math.PI * 1.02, Math.PI * 1.98); g.fill(); g.beginPath(); g.ellipse(-46, hy - 40, 38, 28, -.5, 0, TAU); g.fill();
  g.save(); g.translate(0, hy + 10); K.face(58, o.mood || 'happy', t, o.look ?? 0, 2.1, o.lookY ?? 0); g.restore();
  g.restore();
}
export function house(x, y, s, rot = 0) {
  g.save(); g.translate(x, y); g.rotate(rot); g.scale(s, s);
  g.fillStyle = '#ffe2b8'; g.fillRect(-150, -220, 300, 220);
  g.fillStyle = '#f4c98f'; g.fillRect(60, -220, 90, 220);
  g.fillStyle = P.brick; g.beginPath(); g.moveTo(-185, -210); g.lineTo(0, -360); g.lineTo(185, -210); g.closePath(); g.fill();
  g.fillStyle = P.brickD; g.beginPath(); g.moveTo(0, -360); g.lineTo(185, -210); g.lineTo(90, -210); g.closePath(); g.fill();
  g.fillStyle = '#5a3a8a'; g.beginPath(); g.roundRect(-40, -120, 80, 120, [30, 30, 0, 0]); g.fill();
  g.fillStyle = '#7fd3ff'; for (const wx of [-115, 75]) { g.fillRect(wx, -170, 60, 55); } g.fillStyle = P.white; for (const wx of [-115, 75]) { g.fillRect(wx + 27, -170, 6, 55); g.fillRect(wx, -146, 60, 6); }
  g.restore();
}
export function tree(x, y, s, rot = 0, t = 0) {
  g.save(); g.translate(x, y); g.rotate(rot); g.scale(s, s);
  g.fillStyle = P.brown; g.beginPath(); g.roundRect(-18, -140, 36, 140, 10); g.fill();
  const sw = Math.sin(t * 2) * 4;
  for (const [cx, cy, r, c] of [[-40 + sw, -170, 70, '#3fa35e'], [40 + sw, -175, 72, '#3fa35e'], [sw, -235, 85, P.land], [-25 + sw, -200, 50, '#7be093']]) { g.fillStyle = c; g.beginPath(); g.arc(cx, cy, r, 0, TAU); g.fill(); }
  g.restore();
}
export function cloud(x, y, s, a = 1) {
  g.save(); g.globalAlpha *= a; g.translate(x, y); g.scale(s, s); g.fillStyle = P.white;
  for (const [cx, cy, r] of [[-70, 10, 45], [-20, -15, 60], [45, 0, 50], [85, 15, 35]]) { g.beginPath(); g.arc(cx, cy, r, 0, TAU); g.fill(); }
  g.fillRect(-110, 10, 230, 40); g.restore();
}
export function lamppost(x, y, s) {
  g.save(); g.translate(x, y); g.scale(s, s);
  g.fillStyle = '#3c3a6a'; g.fillRect(-14, -560, 28, 560); g.fillRect(-40, -20, 80, 20);
  g.beginPath(); g.moveTo(-14, -560); g.quadraticCurveTo(0, -620, 80, -610); g.lineTo(80, -590); g.quadraticCurveTo(10, -600, 14, -560); g.fill();
  g.fillStyle = '#ffe58a'; g.beginPath(); g.ellipse(85, -580, 40, 18, 0, 0, Math.PI); g.fill();
  g.restore();
}
export function stopSign(x, y, s, rot = 0) {
  g.save(); g.translate(x, y); g.rotate(rot); g.scale(s, s);
  g.fillStyle = '#c9ced9'; g.fillRect(-9, 0, 18, 260);
  g.fillStyle = P.white; g.beginPath(); for (let i = 0; i < 8; i++) { const a = (i + .5) / 8 * TAU; g.lineTo(Math.cos(a) * 118, Math.sin(a) * 118); } g.closePath(); g.fill();
  g.fillStyle = '#e8304f'; g.beginPath(); for (let i = 0; i < 8; i++) { const a = (i + .5) / 8 * TAU; g.lineTo(Math.cos(a) * 104, Math.sin(a) * 104); } g.closePath(); g.fill();
  g.restore(); g.save(); g.translate(x, y); g.rotate(rot); text('STOP', 0, 22 * s, 64 * s, P.white, 1000, null, 0); g.restore();
}
export function screech(x, y, r, a, t) {                                  // speed / brake lines on one side of a body
  if (a <= 0) return; g.save(); g.globalAlpha *= a; g.strokeStyle = P.white; g.lineWidth = 10; g.lineCap = 'round';
  for (let i = 0; i < 5; i++) { const yy = y - r * .6 + i * r * .3, j = Math.sin(t * 30 + i) * 8; g.beginPath(); g.moveTo(x - r - 40 - j, yy); g.lineTo(x - r - 140 - i % 2 * 50 - j, yy); g.stroke(); }
  g.restore();
}
export function thermo(x, y, lvl, col, a = 1) {                           // a thermometer, lvl 0..1
  if (a <= 0) return; g.save(); g.globalAlpha *= a; g.translate(x, y);
  g.fillStyle = P.white; g.beginPath(); g.roundRect(-26, -230, 52, 230, 26); g.fill(); g.beginPath(); g.arc(0, 20, 46, 0, TAU); g.fill();
  g.fillStyle = col; g.beginPath(); g.arc(0, 20, 34, 0, TAU); g.fill(); const h = 30 + 180 * lvl; g.beginPath(); g.roundRect(-13, 10 - h, 26, h, 13); g.fill();
  g.strokeStyle = 'rgba(23,22,63,.35)'; g.lineWidth = 4; for (let i = 0; i < 5; i++) { g.beginPath(); g.moveTo(14, -200 + i * 40); g.lineTo(26, -200 + i * 40); g.stroke(); }
  g.restore();
}
export function tornado(x, y, s, t, a = 1) {
  if (a <= 0) return; g.save(); g.globalAlpha *= a; g.translate(x, y); g.scale(s, s);
  for (let i = 0; i < 7; i++) { const yy = -i * 38, w = 26 + i * 20, sw = Math.sin(t * 6 + i * .8) * 10; g.fillStyle = i % 2 ? '#9aa0c0' : '#b9bfdc'; g.beginPath(); g.ellipse(sw, yy, w, 16, 0, 0, TAU); g.fill(); }
  g.restore();
}
export function sky(top = '#5cc4f2', bot = '#bfe9ff') { const gr = g.createLinearGradient(0, 0, 0, 1400); gr.addColorStop(0, top); gr.addColorStop(1, bot); g.fillStyle = gr; g.fillRect(0, 0, W, H); }
export function ground(y = 1420, night = 0) {
  g.fillStyle = night ? '#24305e' : HILL; g.fillRect(0, y, W, H - y);
  g.fillStyle = night ? '#1a2248' : '#8c8aa8'; g.fillRect(0, y + 40, W, 120);                  // the road
  g.fillStyle = night ? 'rgba(255,255,255,.25)' : 'rgba(255,255,255,.8)'; for (let i = 0; i < 6; i++) g.fillRect(40 + i * 190, y + 94, 100, 12);
  g.fillStyle = night ? '#1b2650' : HILLD; g.fillRect(0, y + 160, W, H - y - 160);
}
export const HILL = '#3fa866', HILLD = '#2d8a52';
export function city(y, a = 1, col = '#8fc9ec') {
  g.save(); g.globalAlpha *= a; g.fillStyle = col;
  for (const [x, w, h] of [[0, 120, 260], [110, 90, 380], [200, 140, 220], [330, 80, 320], [600, 110, 300], [700, 150, 420], [840, 90, 250], [920, 160, 340]]) g.fillRect(x, y - h, w, h);
  g.restore();
}
// Earth with a small arm holding a stop sign (the hook and the stop)
export function earthStop(x, y, r, t, mood, o = {}) {
  const sx = x - r * 1.25, sy = y - r * .35, sk = o.sign ?? 1;
  if (sk > 0) { g.save(); g.globalAlpha *= sk; g.strokeStyle = '#4fa3f0'; g.lineWidth = r * .14; g.lineCap = 'round'; g.beginPath(); g.moveTo(x - r * .8, y + r * .2); g.quadraticCurveTo(x - r * 1.2, y + r * .3, sx, sy + r * .55); g.stroke(); g.restore(); stopSign(sx, sy, r / 260 * sk, -.15); }
  screech(x, y, r, o.screech || 0, t);
  K.earth(x + (o.shake ? Math.sin(t * 50) * o.shake : 0), y, r, t, mood, { rot: o.rot, look: o.look || 0, lookY: o.lookY || 0 });
}
