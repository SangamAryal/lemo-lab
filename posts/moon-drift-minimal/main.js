// Facebook photo post, minimal version (4:5, 1080×1350): "Did you know? The Moon drifts away from Earth every year."
// Fact: ~3.8 cm/yr (Apollo lunar laser ranging), about the speed fingernails grow.
import * as K from './kit.js';
import { mulberry, TAU } from '/core/lib.js';
const { P, text, glow } = K;
const W = 1080, H = 1350, CX = W / 2;
const g = document.getElementById('c').getContext('2d'); K.setup(g, W, H); K.makeStars(40, 23);
await document.fonts.load('900 80px NU'); await document.fonts.load('800 40px NU');
function render() {
  const gr = g.createLinearGradient(0, 0, 0, H); gr.addColorStop(0, '#0b0826'); gr.addColorStop(1, '#1c1250'); g.fillStyle = gr; g.fillRect(0, 0, W, H);
  const R = mulberry(7), clear = [[150, 140, 930, 520], [150, 990, 930, 1140], [330, 1255, 750, 1305]];   // keep the text areas free of stars
  for (let i = 0; i < 70; i++) { const x = R() * W, y = R() * H, r = .8 + R() * 2.2; if (clear.some(([a, b, c, d]) => x > a && x < c && y > b && y < d)) continue; g.globalAlpha = .25 + .5 * R(); g.fillStyle = '#c9c2ff'; g.beginPath(); g.arc(x, y, r, 0, TAU); g.fill(); }
  g.globalAlpha = 1;
  text('DID YOU KNOW?', CX, 200, 46, P.gold, 1000, null, 0);
  text('The Moon drifts', CX, 300, 84, P.white, 1000, null, 0);
  text('away from Earth', CX, 395, 84, P.white, 1000, null, 0);
  text('every year.', CX, 490, 84, P.white, 1000, null, 0);
  // Earth and the Moon, with the growing gap between them
  const ey = 800, ex = 300, mx = 790;
  K.earth(ex, ey, 120, 1.2, 'worried', { look: 1, rot: 1.1 });
  glow(mx, ey, 140, '220,230,255', .3); K.moon(mx, ey, 62, 0, 'happy', { look: -1 });
  g.save(); g.setLineDash([14, 14]); g.strokeStyle = 'rgba(255,255,255,.45)'; g.lineWidth = 4; g.beginPath(); g.moveTo(ex + 150, ey); g.lineTo(mx - 90, ey); g.stroke(); g.restore();
  K.arrow(mx + 80, ey, mx + 170, ey, P.gold, 10);
  text('3.8 cm a year', CX, 1050, 76, P.gold, 1000, null, 0);
  text('about as fast as your fingernails grow', CX, 1120, 38, '#b9b3e6', 800, null, 0);
  text('BEYOND EVERYTHING', CX, 1290, 22, 'rgba(255,255,255,.35)', 900, null, 0);
}
render();
window.DUR = 1; window.EV = []; window.SUBS = []; window.render = () => render();
window.READY = true;
