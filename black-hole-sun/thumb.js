// Thumbnail for "What If a Black Hole Replaced Our Sun?" — drawn, not a video frame. thumb.html?size=v (1080×1920,
// Shorts) or ?size=h (1280×720). A smug black hole where the Sun should be, a scared Earth still on its orbit, the old
// Sun's outline crossed out.
import * as K from './kit.js';
import { TAU } from '/core/lib.js';
const { P, text, glow, sparkle } = K;
const V = new URLSearchParams(location.search).get('size') !== 'h';
const W = V ? 1080 : 1280, H = V ? 1920 : 720;
const cv = document.getElementById('c'); cv.width = W; cv.height = H; const g = cv.getContext('2d');
K.setup(g, W, H); K.makeStars(V ? 120 : 80, 33);
await document.fonts.load('1000 80px NU');

function hole(x, y, r, t) {
  glow(x, y, r * 2.6, '150,100,255', .35);
  g.save(); g.translate(x, y); g.scale(1, .3); const gr = g.createRadialGradient(0, 0, r * 1.05, 0, 0, r * 2.4); gr.addColorStop(0, 'rgba(200,170,255,.0)'); gr.addColorStop(.1, 'rgba(210,190,255,.55)'); gr.addColorStop(1, 'rgba(120,80,255,0)'); g.fillStyle = gr; g.beginPath(); g.arc(0, 0, r * 2.4, 0, TAU); g.fill(); g.restore();
  g.lineWidth = r * .06; for (let i = 0; i < 3; i++) { g.strokeStyle = `rgba(${['230,215,255', '170,140,255', '255,210,240'][i]},${.9 - i * .2})`; g.beginPath(); g.arc(x, y, r * (1.06 + i * .08), 0, TAU); g.stroke(); }
  for (let i = 0; i < 8; i++) { const a = i * .8 + .3; sparkle(x + Math.cos(a) * r * 1.2, y + Math.sin(a) * r * 1.2, r * .08, '#f2ecff'); }
  g.fillStyle = '#030208'; g.beginPath(); g.arc(x, y, r, 0, TAU); g.fill();
  g.save(); g.translate(x, y); const nv = P.navy; P.navy = '#e2dcff'; K.face(r * .8, 'smug', t, 0, 1.9, 0); P.navy = nv; g.restore();
}
function ghostSun(x, y, r) {                                         // the Sun that used to be there, dashed and crossed out
  g.save(); g.strokeStyle = 'rgba(255,207,74,.75)'; g.lineWidth = r * .04; g.setLineDash([r * .14, r * .1]); g.beginPath(); g.arc(x, y, r, 0, TAU); g.stroke(); g.restore();
}
function bigType(s, x, y, px, col, ow, align = 'center', rot = 0) {
  g.save(); g.translate(x, y); g.rotate(rot); g.font = `1000 ${px}px NU`; g.textAlign = align; g.lineJoin = 'round';
  g.fillStyle = P.navy; g.fillText(s, 10, 14); g.lineWidth = ow; g.strokeStyle = P.navy; g.strokeText(s, 0, 0); g.fillStyle = col; g.fillText(s, 0, 0); g.restore();
}
function pill(x, y, s, px, w, h, col = P.red, rot = -.04) { g.save(); g.translate(x, y); g.rotate(rot); g.fillStyle = col; g.beginPath(); g.roundRect(-w / 2, -h / 2, w, h, h / 4); g.fill(); text(s, 0, px * .36, px, P.white, 1000, null, 0); g.restore(); }
function orbit(x, y, R) { g.save(); g.strokeStyle = 'rgba(185,168,255,.55)'; g.lineWidth = 6; g.setLineDash([22, 18]); g.beginPath(); g.arc(x, y, R, 0, TAU); g.stroke(); g.restore(); }
function render() {
  const t = 1.3; g.setTransform(1, 0, 0, 1, 0, 0);
  K.bg(t, '#05031a', '#1d1152');
  if (V) {
    const cx = W / 2, cy = 1080;
    orbit(cx, cy, 430); ghostSun(cx, cy, 330); hole(cx, cy, 230, t);
    K.earth(cx + 300, cy + 310, 110, t, 'scared', { look: -.8 });
    bigType('OUR SUN', W / 2, 300, 180, P.gold, 30); bigType('A BLACK HOLE?', W / 2, 500, 124, '#d9ccff', 26);
    pill(W / 2, 1700, 'SAME PULL. NO LIGHT.', 62, 820, 120, P.red);
  } else {
    const cx = 1070, cy = 360;
    orbit(cx, cy, 290); ghostSun(cx, cy, 215); hole(cx, cy, 150, t);
    K.earth(cx - 225, cy + 215, 75, t, 'scared', { look: .8 });
    bigType('OUR SUN', 40, 220, 150, P.gold, 24, 'left'); bigType('A BLACK HOLE?', 40, 390, 92, '#d9ccff', 20, 'left');
    pill(330, 560, 'SAME PULL. NO LIGHT.', 46, 600, 92, P.red);
  }
}
render();
window.render = render; window.READY = true;
