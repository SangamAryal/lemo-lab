// Thumbnail for "What If All Continents Reunited?" — drawn, not a video frame. thumb.html?size=v (1080×1920, Shorts)
// or ?size=h (1280×720). A scared Earth whose continents are smashing together, impact stars, big "ONE CONTINENT".
import * as K from './kit.js';
import * as G from './geo.js';
import { TAU } from '/core/lib.js';
const { P, text, glow, sparkle } = K;
const V = new URLSearchParams(location.search).get('size') !== 'h';
const W = V ? 1080 : 1280, H = V ? 1920 : 720;
const cv = document.getElementById('c'); cv.width = W; cv.height = H; const g = cv.getContext('2d');
K.setup(g, W, H); K.makeStars(V ? 120 : 80, 41); G.setup(g);
await document.fonts.load('1000 80px NU');

function crashArrows(x, y, r) { for (let i = 0; i < 4; i++) { const q = i / 4 * TAU + .4; K.arrow(x + Math.cos(q) * r * 1.6, y + Math.sin(q) * r * 1.6, x + Math.cos(q) * r * 1.2, y + Math.sin(q) * r * 1.2, P.white, r * .06, 1); } }
function stars(x, y, r) { for (let i = 0; i < 8; i++) { const q = i / 8 * TAU + .2; sparkle(x + Math.cos(q) * r * 1.38, y + Math.sin(q) * r * 1.38, r * .12, P.gold); } }
function bigType(s, x, y, px, col, ow, align = 'center', rot = 0) {
  g.save(); g.translate(x, y); g.rotate(rot); g.font = `1000 ${px}px NU`; g.textAlign = align; g.lineJoin = 'round';
  g.fillStyle = P.navy; g.fillText(s, 10, 14); g.lineWidth = ow; g.strokeStyle = P.navy; g.strokeText(s, 0, 0); g.fillStyle = col; g.fillText(s, 0, 0); g.restore();
}
function pill(x, y, s, px, w, h, rot = -.04) { g.save(); g.translate(x, y); g.rotate(rot); g.fillStyle = P.red; g.beginPath(); g.roundRect(-w / 2, -h / 2, w, h, h / 4); g.fill(); text(s, 0, px * .36, px, P.white, 1000, null, 0); g.restore(); }
function render() {
  const t = 1.3; g.setTransform(1, 0, 0, 1, 0, 0);
  K.bg(t);
  if (V) {
    const x = W / 2, y = 1100, r = 300; glow(x, y, r * 1.8, '90,170,255', .2);
    stars(x, y, r); crashArrows(x, y, r); G.globe(x, y, r, t, { k: .8, lon0: 2, lat0: 4, mood: 'scared', look: .3 });
    bigType('ONE', W / 2, 330, 210, P.white, 30); bigType('CONTINENT', W / 2, 540, 170, P.gold, 28);
    pill(W / 2, 1700, 'ALL LAND CRASHES TOGETHER', 54, 960, 116);
  } else {
    const x = 1060, y = 380, r = 185; glow(x, y, r * 1.8, '90,170,255', .2);
    stars(x, y, r); crashArrows(x, y, r); G.globe(x, y, r, t, { k: .8, lon0: 2, lat0: 4, mood: 'scared', look: .3 });
    bigType('ONE', 50, 250, 190, P.white, 26, 'left'); bigType('CONTINENT', 50, 420, 122, P.gold, 22, 'left');
    pill(310, 570, 'PANGAEA 2.0', 56, 520, 100);
  }
}
render();
window.render = render; window.READY = true;
