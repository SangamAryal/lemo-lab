// Beyond Everything — channel art in the films' flat-vector style. ?which=avatar1 | avatar2 | banner (page size sets the canvas).
import * as K from './kit.js';
import { TAU, mulberry } from '/core/lib.js';
const { P } = K;
const cv = document.getElementById('c'), W = innerWidth, H = innerHeight; cv.width = W; cv.height = H;
const g = cv.getContext('2d'); K.setup(g, W, H);
await document.fonts.load('900 80px NU'); await document.fonts.load('800 40px NU');
const which = new URLSearchParams(location.search).get('which') || 'banner';
const t = 1.3;                                       // a fixed moment: eyes open, rays settled

function ringed(x, y, r, c1, c2, tilt = -.35) {        // a small ringed planet for decoration
  g.save(); g.translate(x, y); g.rotate(tilt);
  g.strokeStyle = 'rgba(255,220,180,.85)'; g.lineWidth = r * .18; g.beginPath(); g.ellipse(0, 0, r * 1.9, r * .5, 0, Math.PI, TAU); g.stroke();
  g.fillStyle = c1; g.beginPath(); g.arc(0, 0, r, 0, TAU); g.fill();
  g.fillStyle = c2; g.beginPath(); g.ellipse(0, -r * .3, r * .95, r * .16, 0, 0, TAU); g.fill(); g.beginPath(); g.ellipse(0, r * .35, r * .9, r * .14, 0, 0, TAU); g.fill();
  g.fillStyle = 'rgba(30,20,80,.3)'; g.beginPath(); g.arc(r * .35, r * .1, r * 1.1, 0, TAU); g.arc(-r * .15, -r * .08, r * 1.02, 0, TAU, true); g.fill('evenodd');
  g.strokeStyle = 'rgba(255,220,180,.85)'; g.beginPath(); g.ellipse(0, 0, r * 1.9, r * .5, 0, 0, Math.PI); g.stroke();
  g.restore();
}
function nebula(list) { for (const [x, y, r, c] of list) { const n = g.createRadialGradient(x, y, 0, x, y, r); n.addColorStop(0, c); n.addColorStop(1, 'rgba(0,0,0,0)'); g.fillStyle = n; g.fillRect(x - r, y - r, 2 * r, 2 * r); } }

function galaxy(x, y, r, seed = 7, a = 1) {                  // a soft spiral galaxy: two arms of dots in pink and cyan
  const R = mulberry(seed); g.save(); g.globalAlpha = a;
  const c0 = g.createRadialGradient(x, y, 0, x, y, r * .35); c0.addColorStop(0, 'rgba(255,240,220,.9)'); c0.addColorStop(1, 'rgba(255,200,240,0)'); g.fillStyle = c0; g.fillRect(x - r, y - r, 2 * r, 2 * r);
  for (let i = 0; i < 900; i++) { const arm = i % 2, u = R(), th = u * 3.4 * Math.PI + arm * Math.PI, rr = r * (.08 + .92 * u), j = (R() - .5) * r * .16 * (1 - u * .5);
    const px = x + Math.cos(th) * rr + j, py = y + Math.sin(th) * rr * .62 + j * .6; g.globalAlpha = a * (.25 + .6 * (1 - u)) * R();
    g.fillStyle = R() < .5 ? '#ff9fd8' : R() < .5 ? '#8fe6ff' : '#fff2c8'; g.beginPath(); g.arc(px, py, 1 + R() * 3.2, 0, TAU); g.fill(); }
  g.restore();
}
function badge(W) {                                           // the channel's gold badge rim (sits inside YouTube's circle crop)
  const c = W / 2; g.save(); g.strokeStyle = '#ffc73a'; g.lineWidth = W * .028; g.beginPath(); g.arc(c, c, W * .468, 0, TAU); g.stroke();
  g.strokeStyle = 'rgba(255,240,190,.55)'; g.lineWidth = W * .006; g.beginPath(); g.arc(c, c, W * .445, 0, TAU); g.stroke(); g.restore();
}
function telescope(x0, y0, x1, y1, w) {
  const a = Math.atan2(y1 - y0, x1 - x0), L = Math.hypot(x1 - x0, y1 - y0);
  g.save(); g.translate(x0, y0); g.rotate(a);
  g.fillStyle = '#e8e4ff'; g.beginPath(); g.roundRect(0, -w * .45, L * .55, w * .9, w * .2); g.fill();
  g.fillStyle = '#ff4d6d'; g.beginPath(); g.roundRect(L * .5, -w * .58, L * .5, w * 1.16, w * .25); g.fill();
  g.fillStyle = '#ffc73a'; g.fillRect(L * .48, -w * .62, w * .35, w * 1.24); g.fillRect(L * .94, -w * .66, w * .3, w * 1.32);
  g.fillStyle = 'rgba(30,20,80,.25)'; g.fillRect(0, w * .1, L, w * .5);
  g.fillStyle = '#9fe9ff'; g.beginPath(); g.ellipse(L * 1.02, 0, w * .2, w * .55, 0, 0, TAU); g.fill();
  g.restore();
}

if (which === 'avatar3') {                           // monogram: BE inside a Saturn ring, Earth and the Moon riding it
  K.makeStars(60, 11); K.bg(t, '#120840', '#2a1466');
  galaxy(400, 400, 360, 5, .55);
  const cx = 395, cy = 410, rx = 318, ry = 86, tilt = -.32;
  const ring = (a0, a1, col, w) => { g.save(); g.translate(cx, cy); g.rotate(tilt); g.strokeStyle = col; g.lineWidth = w; g.lineCap = 'round'; g.beginPath(); g.ellipse(0, 0, rx, ry, 0, a0, a1); g.stroke(); g.restore(); };
  ring(Math.PI, TAU, 'rgba(255,199,58,.55)', 30); ring(Math.PI, TAU, 'rgba(255,240,190,.5)', 6);           // the ring's far side, behind the letters
  g.save(); g.font = '1000 300px NU'; const wB = g.measureText('B').width, wE = g.measureText('E').width; g.restore();
  const x0 = cx - (wB + wE - 10) / 2;
  K.text('B', x0, cy + 108, 300, P.white, 1000, P.navy, 30, 'left'); K.text('E', x0 + wB - 10, cy + 108, 300, P.gold, 1000, P.navy, 30, 'left');
  ring(0, Math.PI, '#ffc73a', 30); ring(0, Math.PI, 'rgba(255,250,220,.8)', 6);                            // near side, in front
  { const a = .42, ex = cx + rx * Math.cos(a) * Math.cos(tilt) - ry * Math.sin(a) * Math.sin(tilt), ey = cy + rx * Math.cos(a) * Math.sin(tilt) + ry * Math.sin(a) * Math.cos(tilt); K.earth(ex, ey, 54, t, 'happy', { look: -1, lookY: -.6, rot: 1.1 }); } K.moon(150, 300, 34, t, 'love', { look: 1 });
  K.sparkle(620, 170, 26); K.sparkle(180, 600, 20, P.gold); K.sparkle(560, 680, 12, P.cyan);
  badge(800);
} else if (which === 'avatar4') {                    // Earth looks beyond: a telescope aimed at a galaxy
  K.makeStars(60, 12); K.bg(t, '#120840', '#2a1466');
  galaxy(590, 220, 200, 8, .95);
  K.sparkle(450, 140, 22); K.sparkle(700, 400, 16, P.cyan); K.sparkle(130, 420, 20, P.gold);
  K.moon(165, 215, 62, t, 'love', { look: 1 });
  K.earth(320, 540, 205, t, 'happy', { look: 1, lookY: -1.2, rot: 1.1 });
  telescope(430, 410, 555, 290, 54);
  g.fillStyle = '#5fcf7a'; g.beginPath(); g.arc(470, 395, 30, 0, TAU); g.fill(); g.fillStyle = '#3fa35e'; g.beginPath(); g.arc(478, 402, 22, 0, TAU); g.fill();                         // a little hand on the telescope
  K.sparkle(590, 220, 40 , '#fff6dc');
  badge(800);
} else if (which === 'avatar1') {                           // Earth and the Moon, the channel's couple
  K.makeStars(46, 3); K.bg(t, '#140a44', '#2a1466');
  nebula([[560, 260, 380, 'rgba(255,120,200,.18)'], [220, 640, 360, 'rgba(80,140,255,.16)']]);
  K.earth(370, 450, 235, t, 'happy', { look: .9, rot: 1.1 });
  K.moon(630, 245, 95, t, 'love', { look: -.9, tilt: .1 });
  K.sparkle(150, 190, 30); K.sparkle(690, 600, 22, P.gold); K.sparkle(560, 110, 14);
} else if (which === 'avatar2') {                    // the lazy Sun
  K.makeStars(46, 4); K.bg(t, '#140a44', '#2a1466');
  nebula([[400, 420, 420, 'rgba(255,150,80,.18)']]);
  K.sunChar(390, 420, 230, t, { mood: 'smug', shades: -1, mug: 1, tilt: -.1, look: .4 });
  K.sparkle(130, 170, 28); K.sparkle(690, 640, 22, P.gold);
} else {                                             // banner 2560×1440; safe area for every device: 1546×423 in the middle
  K.makeStars(260, 9); K.bg(t, '#0e0738', '#26135e');
  nebula([[500, 500, 700, 'rgba(120,60,220,.22)'], [2100, 900, 760, 'rgba(255,110,170,.14)'], [1280, 720, 900, 'rgba(70,40,190,.16)']]);
  const cy = 720;
  // centre: the name and the promise
  g.save(); g.font = '1000 88px NU'; const w1 = g.measureText('BEYOND ').width, w2 = g.measureText('EVERYTHING').width; g.restore();
  const x0 = 1280 - (w1 + w2) / 2;
  K.text('BEYOND ', x0, cy + 32, 88, P.white, 1000, P.navy, 16, 'left'); K.text('EVERYTHING', x0 + w1, cy + 32, 88, P.gold, 1000, P.navy, 16, 'left');
  // inside the safe area: Earth and the Moon on the left, the lazy Sun on the right
  K.earth(650, cy + 4, 90, t, 'happy', { look: 1, rot: 1.1 });
  K.moon(755, cy - 74, 38, t, 'love', { look: -1 });
  K.sunChar(1915, cy + 4, 84, t, { mood: 'smug', shades: -1, mug: 1, tilt: -.1, look: -.6 });
  // outside it (desktop/TV): a photon, a ringed planet, a proton, sparkles
  K.photon(2330, 640, 40, t, { look: -1 });
  ringed(300, 760, 70, '#ff9a5c', '#e57a3e');
  K.proton(140, 600, 46, t, { mood: 'happy', look: 1 });
  K.photon(2460, 820, 26, t + .5, { look: -1, mood: 'sleepy' });
  const R = mulberry(2); for (let i = 0; i < 18; i++) K.sparkle(R() * 2560, R() * 1440, 10 + R() * 22, [P.spark, P.gold, P.cyan][i % 3], .9);
  if (new URLSearchParams(location.search).has('guides')) {           // the safe areas, for checking only
    g.strokeStyle = '#3fe0ff'; g.lineWidth = 4; g.setLineDash([16, 12]); g.strokeRect(1280 - 773, 720 - 211.5, 1546, 423);
    g.strokeStyle = '#ff4d6d'; g.strokeRect(0, 720 - 211.5, 2560, 423); g.setLineDash([]);
  }
}
window.DUR = 1; window.render = () => {}; window.READY = true;
