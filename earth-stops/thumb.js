// Thumbnail for "What If Earth Stopped Spinning?" — drawn, not a video frame. thumb.html?size=v (1080×1920, Shorts) or
// ?size=h (1280×720). A person and their house thrown mid-air over the city, Earth behind them holding a STOP sign,
// and big "1,600 km/h" type.
import * as K from './kit.js';
import * as PR from './props.js';
import { TAU } from '/core/lib.js';
const { P, text, glow, sparkle } = K;
const V = new URLSearchParams(location.search).get('size') !== 'h';
const W = V ? 1080 : 1280, H = V ? 1920 : 720;
const cv = document.getElementById('c'); cv.width = W; cv.height = H; const g = cv.getContext('2d');
K.setup(g, W, H); PR.setup(g, W, H);
await document.fonts.load('1000 80px NU');

function rays(x, y, n, a) {                                         // a comic burst behind Earth
  g.save(); g.translate(x, y); g.globalAlpha = a;
  for (let i = 0; i < n; i++) { const a0 = i / n * TAU, a1 = a0 + TAU / n / 2; g.fillStyle = i % 2 ? '#ffe9a8' : '#fff4d1'; g.beginPath(); g.moveTo(0, 0); g.arc(0, 0, 2200, a0, a1); g.fill(); }
  g.restore();
}
function speedLines(x, y, len, n, sp, a = .9) {                    // motion lines trailing to the left (thrown east)
  g.save(); g.strokeStyle = `rgba(255,255,255,${a})`; g.lineCap = 'round';
  for (let i = 0; i < n; i++) { const yy = y + (i - (n - 1) / 2) * sp, l = len * (i % 2 ? .7 : 1); g.lineWidth = 12; g.beginPath(); g.moveTo(x - 30, yy); g.lineTo(x - 30 - l, yy); g.stroke(); }
  g.restore();
}
function bigType(s, x, y, px, col, ow, align = 'center', rot = 0) {
  g.save(); g.translate(x, y); g.rotate(rot); g.font = `1000 ${px}px NU`; g.textAlign = align; g.lineJoin = 'round';
  g.fillStyle = P.navy; g.fillText(s, 10, 14);                     // drop shadow
  g.lineWidth = ow; g.strokeStyle = P.navy; g.strokeText(s, 0, 0); g.fillStyle = col; g.fillText(s, 0, 0); g.restore();
}

function render() {
  const t = 1.3;
  g.setTransform(1, 0, 0, 1, 0, 0);
  const sk = g.createLinearGradient(0, 0, 0, H); sk.addColorStop(0, '#3fb2ee'); sk.addColorStop(1, '#bfe9ff'); g.fillStyle = sk; g.fillRect(0, 0, W, H);
  if (V) {
    const ex = 640, ey = 790, er = 320;
    rays(ex, ey, 28, .55); glow(ex, ey, 620, '255,255,255', .5);
    PR.city(1560, 1, '#7dbfe6');
    g.fillStyle = PR.HILL; g.fillRect(0, 1560, W, H - 1560); g.fillStyle = '#8c8aa8'; g.fillRect(0, 1600, W, 110); g.fillStyle = PR.HILLD; g.fillRect(0, 1710, W, H - 1710);
    PR.earthStop(ex, ey, er, t, 'annoyed', { rot: 1.2, screech: 0, look: -.9, lookY: .7 });
    // the house and the person, mid-air, thrown east
    speedLines(640, 1330, 260, 4, 46);
    PR.house(790, 1420, .85, .32);
    speedLines(200, 1200, 200, 3, 50);
    PR.stander(300, 1420, .82, t, { mood: 'scared', arms: 'flail', legs: 'kick', rot: .55, lookY: -.3 });
    sparkle(130, 960, 34, P.white); sparkle(960, 1180, 26, P.white);
    // type: the number is the hook
    bigType('1,600', CXv(), 280, 230, P.gold, 30);
    bigType('km/h', CXv(), 430, 120, P.white, 24);
    g.save(); g.translate(W / 2, 1620); g.rotate(-.04); g.fillStyle = P.red; g.beginPath(); g.roundRect(-380, -70, 760, 120, 30); g.fill(); text('IF EARTH STOPPED', 0, 18, 72, P.white, 1000, null, 0); g.restore();
  } else {
    const ex = 1020, ey = 360, er = 235;
    rays(ex, ey, 26, .55); glow(ex, ey, 460, '255,255,255', .5);
    PR.city(640, 1, '#7dbfe6');
    g.fillStyle = PR.HILL; g.fillRect(0, 640, W, 80); g.fillStyle = '#8c8aa8'; g.fillRect(0, 660, W, 40);
    PR.earthStop(ex, ey, er, t, 'annoyed', { rot: 1.2, screech: 0, look: -.9, lookY: .7 });
    speedLines(530, 500, 180, 3, 40);
    PR.house(650, 590, .5, .32);
    speedLines(200, 520, 150, 3, 40);
    PR.stander(300, 640, .43, t, { mood: 'scared', arms: 'flail', legs: 'kick', rot: .55, lookY: -.3 });
    bigType('1,600', 40, 190, 190, P.gold, 26, 'left');
    bigType('km/h', 60, 300, 100, P.white, 20, 'left');
    g.save(); g.translate(340, 370); g.rotate(-.04); g.fillStyle = P.red; g.beginPath(); g.roundRect(-300, -45, 600, 84, 24); g.fill(); text('IF EARTH STOPPED', 0, 14, 54, P.white, 1000, null, 0); g.restore();
  }
}
function CXv() { return W / 2; }
render();
window.render = render; window.READY = true;
