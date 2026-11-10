// Facebook photo post (4:5, 1080×1350): "The Moon is leaving us" — Beyond Everything flat-vector style, one still frame.
// Fact: the Moon recedes ~3.8 cm/yr (Apollo lunar laser ranging) ≈ fingernail growth; in ~600 Myr total solar eclipses end.
import * as K from './kit.js';
import { TAU } from '/core/lib.js';
const { P, text, glow, card, bubble } = K;
const W = 1080, H = 1350, CX = W / 2;
const g = document.getElementById('c').getContext('2d'); K.setup(g, W, H); K.makeStars(90, 7);
await document.fonts.load('900 80px NU'); await document.fonts.load('800 40px NU');
const dot = (x, y, r, c) => { g.fillStyle = c; g.beginPath(); g.arc(x, y, r, 0, TAU); g.fill(); };
function shades(x, y, r) { g.fillStyle = '#17163f'; for (const s of [-1, 1]) { g.beginPath(); g.roundRect(x + s * r * .38 - r * .3, y - r * .2, r * .6, r * .32, r * .12); g.fill(); } g.fillRect(x - r * .1, y - r * .15, r * .2, r * .07); g.fillStyle = 'rgba(255,255,255,.55)'; g.fillRect(x - r * .58, y - r * .15, r * .14, r * .05); }
function suitcase(x, y, s) { g.save(); g.translate(x, y); g.scale(s, s); g.fillStyle = '#ff7a59'; g.beginPath(); g.roundRect(-55, -40, 110, 80, 14); g.fill(); g.fillStyle = '#e0573a'; g.fillRect(-55, -6, 110, 10); g.strokeStyle = '#3a2a4a'; g.lineWidth = 9; g.beginPath(); g.roundRect(-22, -62, 44, 26, 10); g.stroke(); g.restore(); }
function phone(x, y, s, rot) { g.save(); g.translate(x, y); g.rotate(rot); g.scale(s, s); g.fillStyle = '#20203a'; g.beginPath(); g.roundRect(-30, -55, 60, 110, 12); g.fill(); g.fillStyle = '#7fe6ff'; g.beginPath(); g.roundRect(-24, -46, 48, 88, 7); g.fill(); g.restore(); }
function render() {
  K.bg(0, '#0a0626', '#2a1466');
  glow(CX, 700, 520, '120,80,255', .18);
  // headline
  text('THE MOON IS', CX, 150, 92, P.white, 1000, P.navy, 16);
  text('LEAVING US', CX, 275, 150, P.gold, 1000, P.navy, 20);
  // Earth (left, texting) and the Moon (right, shades, suitcase, walking off)
  const ex = 255, ey = 640, mx = 840, my = 560;
  K.earth(ex, ey, 165, 1.2, 'sad', { look: .9, lookY: -.2, rot: 1.1 });
  phone(ex + 150, ey + 95, 1.15, .25);
  bubble(ex + 70, ey - 250, 250, 100, 'u up?', 1, P.navy, -1);
  glow(mx, my, 230, '220,230,255', .35);
  K.moon(mx, my, 105, 0, 'smug', { look: 1 }); shades(mx, my - 8, 105);
  suitcase(mx + 120, my + 120, .9);
  g.save(); g.strokeStyle = 'rgba(255,255,255,.55)'; g.lineWidth = 5; g.setLineDash([4, 18]); g.lineCap = 'round'; g.beginPath(); g.moveTo(mx + 30, my + 150); g.quadraticCurveTo(mx - 60, my + 260, mx - 180, my + 240); g.stroke(); g.restore();   // footstep trail
  // "left on read" under the moon
  g.save(); g.fillStyle = 'rgba(255,255,255,.12)'; g.beginPath(); g.roundRect(mx - 150, my - 205, 300, 60, 30); g.fill(); g.restore();
  text('left on read', mx, my - 163, 38, '#cfd3ff', 900, null, 0);
  // measuring tape between them: +3.8 cm / year
  const ty = 865, x0 = 150, x1 = 930;
  g.fillStyle = P.gold; g.beginPath(); g.roundRect(x0, ty - 26, x1 - x0, 52, 12); g.fill();
  g.fillStyle = '#e8a91a'; for (let x = x0 + 20; x < x1 - 10; x += 24) g.fillRect(x, ty - 26, 4, (Math.round((x - x0) / 24) % 5 === 0) ? 30 : 16);
  K.arrow(x1 - 40, ty + 60, x1 + 30, ty + 60, P.gold, 12);
  text('+3.8 cm farther every year', CX - 20, ty + 82, 52, P.white, 1000, P.navy, 12);
  // fingernail comparison
  card(CX, 1035, 920, 120, 1, 'rgba(12,10,44,.75)');
  g.save(); g.translate(170, 1035); g.fillStyle = P.skin; g.beginPath(); g.roundRect(-34, -40, 68, 90, 30); g.fill(); g.fillStyle = '#ffe3d2'; g.beginPath(); g.roundRect(-24, -34, 48, 40, [18, 18, 10, 10]); g.fill(); g.strokeStyle = '#d9946b'; g.lineWidth = 4; g.beginPath(); g.moveTo(-24, -34); g.lineTo(24, -34); g.stroke(); g.restore();
  text('about as fast as your', 600, 1022, 46, P.white, 900, null, 0); text('FINGERNAILS GROW', 600, 1072, 50, P.gold, 1000, null, 0);
  // payoff
  text('In ~600 million years, it won’t fully cover the Sun.', CX, 1195, 38, '#cfd3ff', 900, P.navy, 6);
  text('No more total solar eclipses.', CX, 1252, 46, P.white, 1000, P.navy, 8);
  text('BEYOND EVERYTHING', 120, 1338, 18, 'rgba(255,255,255,.5)', 900, null, 0, 'left');
}
render();
window.DUR = 1; window.EV = []; window.SUBS = []; window.render = () => render();
window.READY = true;
