// Thumbnail for "What If the Sun Vanished?" — drawn, not a video frame. thumb.html?size=v (1080×1920, Shorts) or
// ?size=h (1280×720). The Sun gone in a POOF with only its shades left hanging in space, a worried Earth, big "8:20".
import * as K from './kit.js';
import { TAU, mulberry } from '/core/lib.js';
const { P, text, glow, sparkle } = K;
const V = new URLSearchParams(location.search).get('size') !== 'h';
const W = V ? 1080 : 1280, H = V ? 1920 : 720;
const cv = document.getElementById('c'); cv.width = W; cv.height = H; const g = cv.getContext('2d');
K.setup(g, W, H); K.makeStars(V ? 120 : 80, 9);
await document.fonts.load('1000 80px NU');

function poof(x, y, r) {                                           // the puff where the Sun was
  const R = mulberry(77); glow(x, y, r * 2.4, '255,200,90', .35);
  for (let i = 0; i < 16; i++) { const a = i / 16 * TAU + R() * .4, d = r * (.75 + R() * .45), s = r * (.38 + .22 * R()); g.fillStyle = i % 3 ? '#f3eefc' : '#d8d0f0'; g.beginPath(); g.arc(x + Math.cos(a) * d, y + Math.sin(a) * d, s, 0, TAU); g.fill(); }
  g.fillStyle = '#ffffff'; g.beginPath(); g.arc(x, y, r * .8, 0, TAU); g.fill();
  for (let i = 0; i < 8; i++) { const a = i / 8 * TAU + .2; sparkle(x + Math.cos(a) * r * 1.85, y + Math.sin(a) * r * 1.85, r * .16, P.gold); }
}
function shades(x, y, r, rot) {
  g.save(); g.translate(x, y); g.rotate(rot); g.fillStyle = '#1b1a33';
  for (const s of [-1, 1]) { g.beginPath(); g.roundRect(s * r * .3 - r * .17, -r * .1, r * .34, r * .2, r * .08); g.fill(); }
  g.fillStyle = 'rgba(255,255,255,.4)'; for (const s of [-1, 1]) { g.beginPath(); g.roundRect(s * r * .3 - r * .12, -r * .07, r * .1, r * .05, r * .02); g.fill(); }
  g.strokeStyle = '#1b1a33'; g.lineWidth = r * .04; g.beginPath(); g.moveTo(-r * .13, -r * .02); g.lineTo(r * .13, -r * .02); g.stroke(); g.restore();
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
    poof(W / 2, 880, 250); shades(W / 2 + 20, 880, 330, -.12);
    glow(780, 1450, 300, '255,210,120', .3); K.earth(780, 1460, 210, t, 'scared', { look: -.6 });
    bigType('8:20', W / 2, 400, 270, P.gold, 32);
    pill(W / 2, 1720, 'THE SUN IS GONE', 70, 780, 120);
  } else {
    poof(930, 330, 160); shades(945, 330, 210, -.12);
    K.earth(1130, 575, 112, t, 'scared', { look: -.8 });
    bigType('8:20', 40, 250, 230, P.gold, 28, 'left');
    pill(330, 400, 'THE SUN IS GONE', 50, 560, 86);
  }
}
render();
window.render = render; window.READY = true;
