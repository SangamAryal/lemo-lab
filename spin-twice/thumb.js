// Thumbnail for "What If Earth Spun Twice as Fast?" — drawn, not a video frame. thumb.html?size=v (1080×1920, Shorts)
// or ?size=h (1280×720). A dizzy Earth whipping round with speed lines, a red "×2" badge, big "12-HOUR DAY".
import * as K from './kit.js';
import { TAU } from '/core/lib.js';
const { P, text, glow } = K;
const V = new URLSearchParams(location.search).get('size') !== 'h';
const W = V ? 1080 : 1280, H = V ? 1920 : 720;
const cv = document.getElementById('c'); cv.width = W; cv.height = H; const g = cv.getContext('2d');
K.setup(g, W, H); K.makeStars(V ? 120 : 80, 33);
await document.fonts.load('1000 80px NU');

function whirl(x, y, r) {                                           // motion arcs and speed lines around a spinning planet
  g.save(); g.lineCap = 'round';
  for (let i = 0; i < 3; i++) { g.strokeStyle = `rgba(255,199,58,${.9 - i * .25})`; g.lineWidth = r * (.07 - i * .015); g.beginPath(); g.ellipse(x, y, r * (1.3 + i * .14), r * (.42 + i * .05), 0, Math.PI * (.05 + i * .1), Math.PI * (.85 + i * .1)); g.stroke(); }
  g.strokeStyle = 'rgba(255,255,255,.85)'; for (let i = 0; i < 5; i++) { const yy = y - r * .6 + i * r * .3; g.lineWidth = r * .05; g.beginPath(); g.moveTo(x - r * 1.15, yy); g.lineTo(x - r * (1.6 + (i % 2) * .3), yy); g.stroke(); }
  g.restore();
}
function badge(x, y, r, s) { g.save(); g.translate(x, y); g.rotate(-.15); g.fillStyle = P.red; g.beginPath(); g.arc(0, 0, r, 0, TAU); g.fill(); g.strokeStyle = P.white; g.lineWidth = r * .08; g.stroke(); text(s, 0, r * .3, r * .9, P.white, 1000, null, 0); g.restore(); }
function bigType(s, x, y, px, col, ow, align = 'center', rot = 0) {
  g.save(); g.translate(x, y); g.rotate(rot); g.font = `1000 ${px}px NU`; g.textAlign = align; g.lineJoin = 'round';
  g.fillStyle = P.navy; g.fillText(s, 10, 14); g.lineWidth = ow; g.strokeStyle = P.navy; g.strokeText(s, 0, 0); g.fillStyle = col; g.fillText(s, 0, 0); g.restore();
}
function pill(x, y, s, px, w, h, rot = -.04) { g.save(); g.translate(x, y); g.rotate(rot); g.fillStyle = P.red; g.beginPath(); g.roundRect(-w / 2, -h / 2, w, h, h / 4); g.fill(); text(s, 0, px * .36, px, P.white, 1000, null, 0); g.restore(); }
function render() {
  const t = 1.3; g.setTransform(1, 0, 0, 1, 0, 0);
  K.bg(t);
  if (V) {
    const x = W / 2 + 40, y = 1080, r = 290; glow(x, y, r * 1.8, '90,170,255', .2);
    K.earth(x, y, r, t, 'scared', { rot: 2.2, look: .4 }); whirl(x, y, r); badge(x + r * .95, y - r * .9, 130, '×2');
    bigType('12-HOUR', W / 2, 330, 210, P.gold, 30); bigType('DAY', W / 2, 560, 230, P.gold, 32);
    pill(W / 2, 1720, 'EARTH SPINS TWICE AS FAST', 56, 940, 116);
  } else {
    const x = 1010, y = 370, r = 190; glow(x, y, r * 1.8, '90,170,255', .2);
    K.earth(x, y, r, t, 'scared', { rot: 2.2, look: .4 }); whirl(x, y, r); badge(x + r * .95, y - r * .85, 90, '×2');
    bigType('12-HOUR', 40, 240, 170, P.gold, 24, 'left'); bigType('DAY', 40, 430, 180, P.gold, 26, 'left');
    pill(360, 580, 'EARTH SPINS ×2', 52, 560, 96);
  }
}
render();
window.render = render; window.READY = true;
