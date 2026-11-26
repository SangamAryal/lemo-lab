// Thumbnail for "What If a Rogue Planet Passed Earth?" — drawn, not a video frame. thumb.html?size=v (1080×1920, Shorts)
// or ?size=h (1280×720). A giant striped planet looming right next to a small Earth, and a shocked face.
import * as K from './kit.js';
import * as G from './geo.js';
import * as PP from './people.js';
import * as PL from './planet.js';
const { P, glow } = K;
const V = new URLSearchParams(location.search).get('size') !== 'h';
const W = V ? 1080 : 1280, H = V ? 1920 : 720;
const cv = document.getElementById('c'); cv.width = W; cv.height = H; const g = cv.getContext('2d');
K.setup(g, W, H); K.makeStars(V ? 120 : 80, 23); G.setup(g); PP.setup(g); PL.setup(g);
await document.fonts.load('1000 80px NU');
function bigType(s, x, y, px, col, ow, rot = 0) {
  g.save(); g.translate(x, y); g.rotate(rot); g.font = `1000 ${px}px NU`; g.textAlign = 'center'; g.lineJoin = 'round';
  g.fillStyle = P.navy; g.fillText(s, 10, 14); g.lineWidth = ow; g.strokeStyle = P.navy; g.strokeText(s, 0, 0); g.fillStyle = col; g.fillText(s, 0, 0); g.restore();
}
function pill(x, y, s, px, w, h, rot = -.04) { g.save(); g.translate(x, y); g.rotate(rot); g.fillStyle = P.red; g.beginPath(); g.roundRect(-w / 2, -h / 2, w, h, h / 4); g.fill(); K.text(s, 0, px * .36, px, P.white, 1000, null, 0); g.restore(); }
function render() {
  const t = 2.0; g.setTransform(1, 0, 0, 1, 0, 0); K.bg(t);
  const you = PP.as('you', { mood: 'shock', arms: 'cheeks', lookY: -1, look: -.4 });
  if (V) {
    PL.rogue(560, 880, 420, t, { lit: .9, ang: 2.5 });
    G.globe(860, 1330, 110, t, { k: 0, face: false, lon0: -20, lat0: 18 });
    bigType('ROGUE', W / 2, 330, 220, P.gold, 30); bigType('PLANET', W / 2, 520, 170, P.white, 28);
    PP.bust(300, 1920, 1.0, t, you);
    pill(W / 2, 1190, 'IT PASSES EARTH', 64, 660, 124);
  } else {
    PL.rogue(380, 380, 300, t, { lit: .9, ang: 2.5 });
    G.globe(700, 560, 70, t, { k: 0, face: false, lon0: -20, lat0: 18 });
    bigType('ROGUE', 960, 200, 150, P.gold, 22); bigType('PLANET', 960, 330, 120, P.white, 20);
    PP.bust(1000, 720, .6, t, you);
  }
}
render(); window.render = render; window.READY = true;
