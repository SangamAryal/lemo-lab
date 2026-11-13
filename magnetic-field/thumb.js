// Thumbnail for "What If Earth Lost Its Magnetic Field?" — drawn, not a video frame. thumb.html?size=v (1080×1920,
// Shorts) or ?size=h (1280×720). A scared Earth with its shield shattering, the solar wind pouring in, a lost compass.
import * as K from './kit.js';
import { TAU, mulberry } from '/core/lib.js';
const { P, text, glow, sparkle } = K;
const V = new URLSearchParams(location.search).get('size') !== 'h';
const W = V ? 1080 : 1280, H = V ? 1920 : 720;
const cv = document.getElementById('c'); cv.width = W; cv.height = H; const g = cv.getContext('2d');
K.setup(g, W, H); K.makeStars(V ? 120 : 80, 21);
await document.fonts.load('1000 80px NU');

function shards(x, y, R, n, seed) {                                  // the broken shield: cyan arcs flying apart
  const Rn = mulberry(seed); g.save(); g.lineCap = 'round';
  for (let i = 0; i < n; i++) { const a = i / n * TAU + Rn() * .2, d = R * (1 + Rn() * .25), len = .35 + Rn() * .2;
    g.strokeStyle = `rgba(63,224,255,${.6 + Rn() * .4})`; g.lineWidth = R * .045; g.beginPath(); g.arc(x + Math.cos(a) * (d - R), y + Math.sin(a) * (d - R), d, a, a + len); g.stroke(); }
  for (let i = 0; i < 10; i++) { const a = Rn() * TAU, d = R * (1.05 + Rn() * .3); sparkle(x + Math.cos(a) * d, y + Math.sin(a) * d, R * .06, '#bff6ff'); }
  g.restore();
}
function windDots(x0, y0, x1, y1, n, r, seed) {
  const Rn = mulberry(seed);
  for (let i = 0; i < n; i++) { const x = x0 + Rn() * (x1 - x0), y = y0 + Rn() * (y1 - y0);
    g.strokeStyle = 'rgba(255,120,140,.4)'; g.lineWidth = r; g.lineCap = 'round'; g.beginPath(); g.moveTo(x - r * 5, y); g.lineTo(x, y); g.stroke();
    g.fillStyle = '#ff6a80'; g.beginPath(); g.arc(x, y, r, 0, TAU); g.fill(); }
}
function compass(x, y, r, ang) {
  g.save(); g.translate(x, y); g.rotate(-.15);
  g.fillStyle = '#c98a3a'; g.beginPath(); g.arc(0, 0, r * 1.12, 0, TAU); g.fill(); g.fillStyle = '#f6f1e4'; g.beginPath(); g.arc(0, 0, r, 0, TAU); g.fill();
  text('N', 0, -r * .52, r * .3, P.navy, 1000, null, 0);
  g.rotate(ang); g.fillStyle = P.red; g.beginPath(); g.moveTo(0, -r * .78); g.lineTo(r * .13, 0); g.lineTo(-r * .13, 0); g.fill();
  g.fillStyle = '#8a8fb0'; g.beginPath(); g.moveTo(0, r * .78); g.lineTo(r * .13, 0); g.lineTo(-r * .13, 0); g.fill(); g.restore();
  text('?', x + r * .9, y - r * .7, r * .9, P.gold, 1000, P.navy, r * .1);
}
function bigType(s, x, y, px, col, ow, align = 'center', rot = 0) {
  g.save(); g.translate(x, y); g.rotate(rot); g.font = `1000 ${px}px NU`; g.textAlign = align; g.lineJoin = 'round';
  g.fillStyle = P.navy; g.fillText(s, 10, 14); g.lineWidth = ow; g.strokeStyle = P.navy; g.strokeText(s, 0, 0); g.fillStyle = col; g.fillText(s, 0, 0); g.restore();
}
function pill(x, y, s, px, w, h, rot = -.04) { g.save(); g.translate(x, y); g.rotate(rot); g.fillStyle = P.red; g.beginPath(); g.roundRect(-w / 2, -h / 2, w, h, h / 4); g.fill(); text(s, 0, px * .36, px, P.white, 1000, null, 0); g.restore(); }
function render() {
  const t = 1.3; g.setTransform(1, 0, 0, 1, 0, 0);
  K.bg(t);
  if (V) {
    windDots(0, 760, 480, 1450, 26, 16, 3);
    shards(W / 2 + 80, 1110, 380, 9, 5); glow(W / 2 + 80, 1110, 420, '63,224,255', .18);
    K.earth(W / 2 + 80, 1110, 280, t, 'scared', { look: -.7 });
    bigType('NO', W / 2, 330, 260, P.cyan, 34); bigType('SHIELD', W / 2, 560, 220, P.cyan, 30);
    compass(200, 1560, 120, 2.3);
    pill(W / 2 + 90, 1730, 'MAGNETIC FIELD: OFF', 58, 780, 116);
  } else {
    windDots(560, 120, 820, 640, 18, 10, 3);
    shards(1040, 380, 230, 9, 5); glow(1040, 380, 260, '63,224,255', .18);
    K.earth(1040, 380, 165, t, 'scared', { look: -.7 });
    bigType('NO', 40, 230, 200, P.cyan, 26, 'left'); bigType('SHIELD', 40, 420, 170, P.cyan, 24, 'left');
    pill(330, 570, 'MAGNETIC FIELD: OFF', 46, 600, 90);
  }
}
render();
window.render = render; window.READY = true;
