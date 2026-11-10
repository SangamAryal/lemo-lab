// Talking Planets #2 — "What If Another Star Replaced the Sun?" The Sun takes a day off and sends four replacements
// (Sirius B, Proxima, Sirius A, Betelgeuse); Earth reacts, with a quick ground shot of what it would mean, and rejects each one.
// Flat Beyond Everything kit art with light 2.5D (a perspective orbit ring, camera drift), 1080×1920, deterministic in t.
// Mouths follow each line's loudness (timeline.json). ?thumb=1 draws the thumbnail instead.
import * as K from './kit.js';
import { clamp, lerp, seg, ss, eio, eo, mulberry, TAU } from '/core/lib.js';
const { P, text, glow } = K;
const W = 1080, H = 1920, CX = W / 2;
const g = document.getElementById('c').getContext('2d'); K.setup(g, W, H); K.makeStars(130, 11);
await document.fonts.load('900 80px NU'); await document.fonts.load('800 40px NU');
const TL = await (await fetch('timeline.json')).json();
const LN = Object.fromEntries(TL.lines.map(l => [l.id, l])), DUR = TL.dur;
const at = id => LN[id].t, end = id => LN[id].t + LN[id].d, mid = id => LN[id].t + LN[id].d / 2;
const dot = (x, y, r, c, a = 1) => { g.globalAlpha = a; g.fillStyle = c; g.beginPath(); g.arc(x, y, r, 0, TAU); g.fill(); g.globalAlpha = 1; };
const pop = (t, t0, d = .35) => { const u = clamp((t - t0) / d); return u <= 0 ? 0 : 1 + Math.sin(u * Math.PI) * .2 * (1 - u); };
const fadeIO = (t, a, b, d = .25) => ss(seg(t, a, a + d)) * (1 - ss(seg(t, b - d, b)));
function mouthOf(who, t) {
  const l = TL.lines.find(l => l.who === who && t >= l.t && t < l.t + l.d); if (!l) return 0;
  const k = (t - l.t) * 30, i = Math.floor(k); return lerp(l.mouth[i] || 0, l.mouth[i + 1] || 0, k - i);
}
function openMouth(r, o, y = .25) {
  if (o < .06) return; const w = r * (.1 + .05 * o), h = r * (.03 + .13 * o);
  g.fillStyle = P.navy; g.beginPath(); g.ellipse(0, r * y, w, h, 0, 0, TAU); g.fill();
  g.fillStyle = '#ff6b8a'; g.beginPath(); g.ellipse(0, r * y + h * .5, w * .6, h * .38, 0, 0, TAU); g.fill();
}
const NAME = { earth: 'EARTH', sun: 'SUN', siriusb: 'SIRIUS B', proxima: 'PROXIMA', siriusa: 'SIRIUS A', betelgeuse: 'BETELGEUSE' };
const TAG = { earth: '#4fa3ff', sun: '#ffc73a', siriusb: '#d6ecff', proxima: '#ff7a5c', siriusa: '#8fd0ff', betelgeuse: '#ff4d3a' };

// ───────── the four replacements
const STARS = {
  siriusb: { in: at('02') - .25, out: at('05') - .15, r: 92, body: '#f4f9ff', rim: '#bcd9ff', glow: '200,225,255', card: ['SIRIUS B', 'WHITE DWARF'], mood: 'happy' },
  proxima: { in: at('05') - .25, out: at('08') - .2, r: 112, body: '#ff7a52', rim: '#d94a2e', glow: '255,110,70', card: ['PROXIMA', 'RED DWARF'], mood: 'happy' },
  siriusa: { in: at('08') - .25, out: at('10') - .25, r: 205, body: '#eaf5ff', rim: '#9cc8ff', glow: '170,210,255', card: ['SIRIUS A', '25× BRIGHTER'], mood: 'smug' },
  betelgeuse: { in: at('10') - .25, out: at('14') - .3, r: 250, body: '#e8452e', rim: '#a8221a', glow: '255,80,50', card: ['BETELGEUSE', 'RED SUPERGIANT'], mood: 'sleepy' },
};
const KEYS = ['siriusb', 'proxima', 'siriusa', 'betelgeuse'];
const REJECT = { siriusb: end('04'), proxima: end('07') + .75, siriusa: end('09'), betelgeuse: end('13') };
const SPOT = { x: CX, y: 860 };                                  // where the Sun normally sits
const EARTH0 = { x: 850, y: 1040, r: 92 };

function starBody(k, x, y, r, t, mood, mo) {
  const S = STARS[k];
  glow(x, y, r * (k === 'siriusa' ? 3.2 : 2.2), S.glow, k === 'siriusa' ? .55 : .45);
  if (k === 'siriusa') { g.save(); g.globalAlpha = .5; g.strokeStyle = 'rgba(220,240,255,.8)'; g.lineWidth = 6; for (let i = 0; i < 6; i++) { const a = i / 6 * Math.PI + t * .2; g.beginPath(); g.moveTo(x - Math.cos(a) * r * 2.3, y - Math.sin(a) * r * 2.3); g.lineTo(x + Math.cos(a) * r * 2.3, y + Math.sin(a) * r * 2.3); g.stroke(); } g.restore(); }
  g.save(); g.beginPath(); g.arc(x, y, r, 0, TAU); g.clip();
  const gr = g.createRadialGradient(x - r * .3, y - r * .3, r * .1, x, y, r); gr.addColorStop(0, '#ffffff'); gr.addColorStop(.35, S.body); gr.addColorStop(1, S.rim); g.fillStyle = gr; g.fillRect(x - r, y - r, 2 * r, 2 * r);
  if (k === 'betelgeuse') { const R = mulberry(5); for (let i = 0; i < 22; i++) { g.fillStyle = `rgba(${150 + R() * 80},${30 + R() * 40},20,.35)`; g.beginPath(); g.arc(x + (R() * 2 - 1) * r * .9, y + (R() * 2 - 1) * r * .9, r * (.12 + R() * .2), 0, TAU); g.fill(); } }
  g.restore();
  g.save(); g.translate(x, y); K.face(r, mood, t, 0, k.length); openMouth(r, mo); g.restore();
}

// ───────── Earth: orbits, freezes, gets flung away, sweats, hugs
function earthState(t) {
  let { x, y } = EARTH0, r = EARTH0.r, rot = t * .4;
  const fly = ss(seg(t, at('06') + .5, end('07') + .1)) * (1 - ss(seg(t, end('07') + .1, end('07') + .75)));
  x += fly * 420; y -= fly * 560; rot += fly * 6;
  const hug = ss(seg(t, at('15') - .1, at('15') + .5)); x = lerp(x, CX + 240, hug); y = lerp(y, SPOT.y + 40, hug);
  const big = seg(t, at('10') - .25, at('10') + 1.2) * (1 - seg(t, at('14') - .4, at('14') + .1));        // pulled back for Betelgeuse
  return { x, y, r: r * (1 - .6 * ss(big)), rot, fly };
}
const MOOD_E = () => [[0, 'happy'], [at('01') + 1.6, 'worried'], [at('03'), 'keen'], [at('04'), 'sad'], [at('05'), 'happy'], [at('06'), 'scared'], [end('07') + .8, 'happy'], [at('08') + .5, 'annoyed'], [at('09'), 'scared'], [at('10'), 'worried'], [at('11'), 'scared'], [at('12'), 'worried'], [at('14'), 'keen'], [at('15'), 'love']];
let ME; const moodE = t => { ME = ME || MOOD_E(); let m = 'happy'; for (const [t0, mm] of ME) if (t >= t0) m = mm; return m; };
function earthChar(t, cam) {
  const e = earthState(t); if (cam.wide > .5) return e;
  const look = clamp((SPOT.x - e.x) / 300, -1, 1), mo = mouthOf('earth', t);
  K.earth(e.x, e.y - mo * 4, e.r, t, moodE(t), { rot: e.rot, look });
  g.save(); g.translate(e.x, e.y); openMouth(e.r, mo);
  const ice = fadeIO(t, at('04') + .6, at('05') + .2, .4);           // frozen Earth
  if (ice > 0) { g.globalAlpha = ice * .55; g.fillStyle = '#bfe6ff'; g.beginPath(); g.arc(0, 0, e.r, 0, TAU); g.fill(); g.globalAlpha = ice; g.strokeStyle = '#ffffff'; g.lineWidth = 4; for (let i = 0; i < 6; i++) { const a = i / 6 * TAU; g.beginPath(); g.moveTo(Math.cos(a) * e.r * .55, Math.sin(a) * e.r * .55); g.lineTo(Math.cos(a) * e.r * .95, Math.sin(a) * e.r * .95); g.stroke(); } g.globalAlpha = 1; }
  const sw = fadeIO(t, at('08') + .4, end('09') + .3);                // sweat
  if (sw > 0) { g.globalAlpha = sw; g.fillStyle = '#7fd3ff'; for (const [dx, ph] of [[.75, 0], [-.8, .5]]) { const dy = -e.r * .6 + ((t + ph) * 60) % 50; g.beginPath(); g.moveTo(dx * e.r, dy - 22); g.quadraticCurveTo(dx * e.r + 15, dy + 4, dx * e.r, dy + 12); g.quadraticCurveTo(dx * e.r - 15, dy + 4, dx * e.r, dy - 22); g.fill(); } g.globalAlpha = 1; }
  g.restore();
  if (t > at('15')) { for (let i = 0; i < 5; i++) { const u = ((t - at('15')) * .7 + i * .2) % 1; heart(CX + 100 + Math.sin(i * 2.3) * 160, SPOT.y - 160 - u * 260, 22 + i * 3, 1 - u); } }
  return e;
}
function heart(x, y, s, a) { g.save(); g.globalAlpha = a; g.fillStyle = P.red; g.translate(x, y); g.beginPath(); g.moveTo(0, s * .35); g.bezierCurveTo(-s * 1.1, -s * .3, -s * .4, -s * 1.1, 0, -s * .45); g.bezierCurveTo(s * .4, -s * 1.1, s * 1.1, -s * .3, 0, s * .35); g.fill(); g.restore(); }

// ───────── the orbit ring (2.5D perspective ellipse), it snaps when Proxima can't hold Earth
function orbit(t, a = 1) {
  const snap = ss(seg(t, at('06') + .3, at('06') + .8)) * (1 - ss(seg(t, end('07') + .1, end('07') + .7)));
  const glowRing = ss(seg(t, at('15'), at('15') + .6));
  g.save(); g.globalAlpha = a * (.55 + .4 * glowRing); g.strokeStyle = glowRing > 0 ? `rgba(255,${210 - 30 * glowRing},120,1)` : 'rgba(170,190,255,1)'; g.lineWidth = 4 + 3 * glowRing; g.setLineDash([16, 14]);
  const gap = snap * 1.2, a0 = .45;                                  // the gap opens where Earth sits
  g.beginPath(); g.ellipse(SPOT.x, SPOT.y + 40, 430, 150, 0, a0 + gap, a0 + TAU - gap); g.stroke(); g.restore();
}

// ───────── the Sun: leaves with an OUT OF OFFICE sign, comes back with a mug
function sunState(t) {
  const out = ss(seg(t, end('01') + .1, end('01') + .8)), back = ss(seg(t, at('14') - .45, at('14') + .2));
  return { x: SPOT.x - 900 * out * (1 - back), on: out < 1 || back > 0 };
}
function sun(t) {
  const s = sunState(t); if (!s.on) return; const r = 150, mo = mouthOf('sun', t);
  const hugging = t > at('15');
  K.sunChar(s.x, SPOT.y, r, t, { mood: hugging ? 'love' : t > at('14') - .5 ? 'smug' : 'sleepy', shades: hugging ? -1 : 0, mug: t > at('14') - .5 ? 1 : 0, sip: 0 });
  g.save(); g.translate(s.x, SPOT.y); openMouth(r, mo, .3); g.restore();
  const sg = fadeIO(t, .0, end('01') + .8, .2);                     // the sign
  if (sg > 0 && t < end('01') + .8) { g.save(); g.globalAlpha = sg; g.translate(s.x - 260, SPOT.y + 160); g.rotate(-.12); g.fillStyle = '#fff'; g.beginPath(); g.roundRect(-150, -55, 300, 110, 16); g.fill(); g.strokeStyle = P.red; g.lineWidth = 8; g.stroke(); text('OUT OF', 0, -6, 40, P.red, 1000, null, 0); text('OFFICE', 0, 38, 40, P.red, 1000, null, 0); g.restore(); }
}

// ───────── Betelgeuse wide view: the inner planets' orbits all inside the star
function wideView(t, a) {
  if (a <= 0) return; const u = ss(seg(t, at('10') - .1, at('10') + 1.6)), cy = 1000;
  g.save(); g.globalAlpha = a;
  const AU = 185, R = lerp(.05, 3.6, u) * AU;                       // radius ~3.6 AU (a mid estimate; every estimate reaches past Mars at 1.52 AU)
  glow(CX, cy, R * 1.5, '255,80,50', .5);
  const gr = g.createRadialGradient(CX, cy, R * .2, CX, cy, R); gr.addColorStop(0, '#ff8a4a'); gr.addColorStop(.7, '#e8452e'); gr.addColorStop(1, 'rgba(168,34,26,.95)'); g.fillStyle = gr; g.beginPath(); g.arc(CX, cy, R, 0, TAU); g.fill();
  const lab = ss(seg(t, at('11') - .2, at('11') + .3));
  for (const [n, au, col] of [['MERCURY', .39, '#c9bdb4'], ['VENUS', .72, '#f2d48a'], ['EARTH', 1, '#4fa3ff'], ['MARS', 1.52, '#ff6a4d']]) {
    g.strokeStyle = 'rgba(255,255,255,.75)'; g.lineWidth = 3; g.setLineDash([8, 8]); g.beginPath(); g.ellipse(CX, cy, au * AU, au * AU * .35, 0, 0, TAU); g.stroke(); g.setLineDash([]);
    const ang = { MERCURY: 2.2, VENUS: -2.4, EARTH: .7, MARS: -.6 }[n], px = CX + Math.cos(ang) * au * AU, py = cy + Math.sin(ang) * au * AU * .35; dot(px, py, n === 'EARTH' ? 13 : 9, col);
    if (lab > 0 && (n === 'EARTH' || n === 'MARS')) text(n, px + (n === 'EARTH' ? 60 : 50), py + (n === 'EARTH' ? 50 : -22), 36, P.white, 1000, P.navy, 10, 'center', lab);
  }
  if (lab > 0) { g.save(); g.globalAlpha = a * lab; g.translate(CX, 1330); g.fillStyle = 'rgba(12,10,44,.85)'; g.beginPath(); g.roundRect(-260, -42, 520, 84, 42); g.fill(); text('ALL INSIDE THE STAR', 0, 14, 38, P.gold, 1000, null, 0); g.restore(); }
  g.restore();
}

// ───────── ground shots
function frozenStreet(t, a) {
  if (a <= 0) return; const u = clamp((t - at('04') + .2) / 2.6);
  g.save(); g.globalAlpha = a;
  const sky = g.createLinearGradient(0, 0, 0, H); sky.addColorStop(0, '#05061a'); sky.addColorStop(.6, '#101a3a'); sky.addColorStop(1, '#1d2a4a'); g.fillStyle = sky; g.fillRect(0, 0, W, H);
  glow(760, 640, 60, '220,235,255', .8); dot(760, 640, 9, '#fff');                  // the tiny dim "sun"
  const R = mulberry(4); g.fillStyle = '#0b0f24';                                     // houses
  for (let i = 0; i < 6; i++) { const x = i * 190 - 30, h = 380 + R() * 220, y = 1380 - h; g.fillRect(x, y, 170, h); g.beginPath(); g.moveTo(x - 10, y); g.lineTo(x + 85, y - 90); g.lineTo(x + 180, y); g.fill();
    for (let wy = 0; wy < 3; wy++) for (let wx = 0; wx < 2; wx++) { const fx = x + 30 + wx * 70, fy = y + 50 + wy * 110; if (fy > 1320) continue; g.fillStyle = '#ffd98a'; g.fillRect(fx, fy, 46, 60); g.fillStyle = `rgba(220,240,255,${.25 + .7 * u})`; g.fillRect(fx, fy, 46, 60 * u); g.fillStyle = '#0b0f24'; } }
  g.fillStyle = '#dfefff'; g.fillRect(0, 1380, W, H - 1380);                           // snow on the street
  g.strokeStyle = 'rgba(160,200,240,.6)'; g.lineWidth = 3; for (let k = -6; k <= 6; k++) { g.beginPath(); g.moveTo(CX + k * 30, 1380); g.lineTo(CX + k * 240, H); g.stroke(); }
  for (let i = 0; i < 70; i++) { const x = (R() * W + t * 40 * (.5 + R())) % W, y = (R() * H + t * 120 * (.5 + R())) % 1400; dot(x, y, 2 + R() * 4, '#fff', .8); }   // snowfall
  g.save(); g.globalAlpha = a * u * .9; const fr = g.createRadialGradient(CX, 1000, 300, CX, 1000, 1100); fr.addColorStop(0, 'rgba(200,235,255,0)'); fr.addColorStop(1, 'rgba(200,235,255,.75)'); g.fillStyle = fr; g.fillRect(0, 0, W, H); g.restore();
  temp(t, at('04') + .2, '-150°C', '#9fdcff', a);
  g.restore();
}
function boilingBeach(t, a) {
  if (a <= 0) return;
  g.save(); g.globalAlpha = a;
  const sky = g.createLinearGradient(0, 0, 0, 1100); sky.addColorStop(0, '#ffffff'); sky.addColorStop(1, '#bfe2ff'); g.fillStyle = sky; g.fillRect(0, 0, W, 1100);
  glow(CX, 560, 520, '255,255,255', .9); dot(CX, 560, 150, '#fff');
  const sea = g.createLinearGradient(0, 1000, 0, 1450); sea.addColorStop(0, '#3fa6d8'); sea.addColorStop(1, '#2a7fb8'); g.fillStyle = sea; g.fillRect(0, 1000, W, 450);
  const R = mulberry(8); for (let i = 0; i < 40; i++) { const x = R() * W, y0 = 1020 + R() * 420, ph = (t * 1.5 + R()) % 1; g.strokeStyle = `rgba(255,255,255,${.7 * (1 - ph)})`; g.lineWidth = 3; g.beginPath(); g.arc(x, y0 - ph * 30, 5 + R() * 10 + ph * 6, 0, TAU); g.stroke(); }
  g.fillStyle = '#f2d49a'; g.fillRect(0, 1440, W, H - 1440);
  for (let i = 0; i < 9; i++) { const x = 60 + i * 120, ph = (t * .6 + i * .37) % 1; g.save(); g.globalAlpha = a * .5 * (1 - ph); g.strokeStyle = '#fff'; g.lineWidth = 16; g.lineCap = 'round'; g.beginPath(); g.moveTo(x, 1000 - ph * 400); g.bezierCurveTo(x + 40, 920 - ph * 400, x - 40, 860 - ph * 400, x, 780 - ph * 400); g.stroke(); g.restore(); }
  temp(t, at('09') + .1, '100°C+', '#ff7a52', a);
  g.restore();
}
function redSky(t, a) {
  if (a <= 0) return;
  g.save(); g.globalAlpha = a;
  const sky = g.createLinearGradient(0, 0, 0, H); sky.addColorStop(0, '#ff6a3a'); sky.addColorStop(.5, '#c8281c'); sky.addColorStop(1, '#5a0a0a'); g.fillStyle = sky; g.fillRect(0, 0, W, H);
  const R = mulberry(3); for (let i = 0; i < 26; i++) { const x = R() * W, y = R() * 1200, r = 60 + R() * 160; g.fillStyle = `rgba(255,${120 + R() * 80},60,${.12 + R() * .15})`; g.beginPath(); g.arc(x + Math.sin(t + i) * 10, y, r, 0, TAU); g.fill(); }
  g.fillStyle = '#2a0606'; g.beginPath(); g.moveTo(0, 1420); for (let x = 0; x <= W; x += 60) g.lineTo(x, 1380 - Math.abs(Math.sin(x * .013)) * 120 - (x % 180 ? 0 : 40)); g.lineTo(W, H); g.lineTo(0, H); g.fill();
  const k = pop(t, mid('11') + .1); if (k > 0) { g.save(); g.translate(CX, 1250); g.scale(k, k); g.fillStyle = 'rgba(12,10,44,.85)'; g.beginPath(); g.roundRect(-300, -50, 600, 100, 50); g.fill(); text('THE WHOLE SKY', 0, 16, 44, P.gold, 1000, null, 0); g.restore(); }
  g.restore();
}
function temp(t, t0, s, col, a) { const k = pop(t, t0); if (k <= 0) return; g.save(); g.globalAlpha = a; g.translate(CX, 1250); g.scale(k, k); g.fillStyle = 'rgba(12,10,44,.85)'; g.beginPath(); g.roundRect(-220, -66, 440, 132, 66); g.fill(); g.strokeStyle = col; g.lineWidth = 6; g.stroke(); text(s, 0, 26, 76, col, 1000, null, 0); g.restore(); }

// ───────── UI
function title(t) {
  g.fillStyle = 'rgba(8,6,30,.6)'; g.fillRect(0, 0, W, 360);
  text('WHAT IF ANOTHER STAR', CX, 130, 66, P.white, 1000, P.navy, 14);
  text('REPLACED THE SUN?', CX, 225, 82, P.gold, 1000, P.navy, 16);
  const n = KEYS.filter(k => t >= STARS[k].in + .1).length;
  text(n ? `REPLACEMENT ${n} / 4` : 'REPLACEMENTS', 330, 312, 30, '#d9d4ff', 1000, null, 0, 'center');
  KEYS.forEach((k, i) => {
    const x = 610 + i * 110, y = 300, on = t >= STARS[k].in + .1, S = STARS[k];
    dot(x, y, 26, on ? S.body : 'rgba(255,255,255,.12)'); if (on) glow(x, y, 50, S.glow, .35);
    const xk = pop(t, REJECT[k], .3); if (xk > 0) { g.save(); g.translate(x, y); g.scale(xk, xk); g.strokeStyle = P.red; g.lineWidth = 9; g.lineCap = 'round'; g.beginPath(); g.moveTo(-20, -20); g.lineTo(20, 20); g.moveTo(20, -20); g.lineTo(-20, 20); g.stroke(); g.restore(); }
  });
}
function starCard(t) {
  for (const k of KEYS) {
    const S = STARS[k], t0 = S.in + .2, t1 = k === 'betelgeuse' ? at('11') - .1 : S.out; if (t < t0 || t > t1) continue;
    const kk = pop(t, t0, .4), a = 1 - ss(seg(t, t1 - .2, t1));
    g.save(); g.globalAlpha = a; g.translate(CX, 440); g.scale(kk, kk);
    g.fillStyle = 'rgba(12,10,44,.85)'; g.beginPath(); g.roundRect(-330, -60, 660, 120, 60); g.fill(); g.strokeStyle = TAG[k]; g.lineWidth = 6; g.stroke();
    text(S.card[0], 0, -4, 44, TAG[k], 1000, null, 0); text(S.card[1], 0, 38, 30, P.white, 900, null, 0); g.restore();
  }
  const sz = fadeIO(t, at('03'), at('04') + .1);                    // "same size" bracket
  if (sz > 0) { const e = earthState(t); g.save(); g.globalAlpha = sz; g.strokeStyle = P.gold; g.lineWidth = 5; g.setLineDash([10, 8]); for (const yy of [-1, 1]) { g.beginPath(); g.moveTo(SPOT.x - 120, SPOT.y + yy * 92); g.lineTo(e.x + 120, e.y + yy * 92); g.stroke(); } g.restore(); text('SAME SIZE!', (SPOT.x + e.x) / 2, (SPOT.y + e.y) / 2 - 150, 46, P.gold, 1000, P.navy, 12, 'center', sz); }
}
function captions(t) {
  const l = TL.lines.find(l => t >= l.t - .05 && t < l.t + l.d + .35); if (!l) return;
  const k = pop(t, l.t - .05, .25), a = 1 - ss(seg(t, l.t + l.d + .2, l.t + l.d + .35));
  g.save(); g.globalAlpha = a; g.translate(CX, 1560); const s = .92 + .08 * Math.min(1, k); g.scale(s, s);
  g.font = '1000 34px NU'; const tw = g.measureText(NAME[l.who]).width + 50;
  g.fillStyle = TAG[l.who]; g.beginPath(); g.roundRect(-tw / 2, -96, tw, 52, 26); g.fill(); text(NAME[l.who], 0, -58, 34, P.navy, 1000, null, 0);
  const KEYW = /^(white|dwarf|same|size|dim\.?|freezing\.?|closest|light\.?|orbit!?|Twenty-five|brighter\.?|boiling\.?|Mars\.?|inside|explode\?|Someday\.?|never|day|off)/i;
  const words = l.text.replace(/\.\.\./g, '…').split(' '); g.font = '1000 66px NU';
  const rows = [[]]; let rw = 0; for (const w of words) { const ww = g.measureText(w + ' ').width; if (rw + ww > 920 && rows[rows.length - 1].length) { rows.push([]); rw = 0; } rows[rows.length - 1].push([w, ww]); rw += ww; }
  const bw = Math.max(...rows.map(r => r.reduce((p, w) => p + w[1], 0))) + 60; g.fillStyle = 'rgba(10,8,36,.62)'; g.beginPath(); g.roundRect(-bw / 2, -34, bw, rows.length * 80 + 40, 30); g.fill();
  rows.forEach((row, ri) => { let x = -row.reduce((p, w) => p + w[1], 0) / 2; for (const [w, ww] of row) { text(w, x, 30 + ri * 80, 66, KEYW.test(w) ? P.gold : P.white, 1000, P.navy, 14, 'left'); x += ww; } });
  g.restore();
}

// ───────── frame
function render(t) {
  g.setTransform(1, 0, 0, 1, 0, 0); g.globalAlpha = 1;
  const wide = fadeIO(t, at('10') - .25, mid('11'), .35), close = fadeIO(t, mid('11') + 1.2, at('14') - .2, .35);
  const cam = { wide };
  K.bg(t);
  // space stage
  const zoom = 1 + .04 * Math.sin(t * .4);
  g.save(); g.translate(CX, 960); g.scale(zoom, zoom); g.translate(-CX, -960);
  orbit(t, 1 - wide);
  // the empty spot spotlight after the Sun leaves
  const empty = fadeIO(t, end('01') + .5, at('02') + .2, .2); if (empty > 0) { g.save(); g.globalAlpha = empty * .35; g.fillStyle = '#fff8d8'; g.beginPath(); g.moveTo(CX - 50, 0); g.lineTo(CX + 50, 0); g.lineTo(CX + 200, SPOT.y + 100); g.lineTo(CX - 200, SPOT.y + 100); g.fill(); g.restore(); text('?', CX, SPOT.y + 40, 140, 'rgba(255,255,255,.6)', 1000, null, 0, 'center', empty); }
  for (const k of KEYS) {
    const S = STARS[k]; if (t < S.in || t > S.out + .3) continue;
    if (k === 'betelgeuse' && (wide > .5 || close > 0)) continue;
    const kin = k === 'proxima' ? Math.min(1, clamp((t - S.in) / .5)) : pop(t, S.in, .4), kout = 1 - ss(seg(t, S.out, S.out + .3));
    let x = SPOT.x, y = SPOT.y + 40; if (k === 'proxima' && t < S.in + .5) y -= Math.abs(Math.sin((t - S.in) * 9)) * 80 * (1 - (t - S.in) / .5);
    const r = S.r * Math.max(.01, kin) * kout, mo = mouthOf(k, t);
    if (r > 2) starBody(k, x, y, r, t, k === 'proxima' && t > at('07') - .1 ? 'wink' : S.mood, mo);
    if (k === 'proxima' && t > at('07') - .2 && t < end('07') + .6) { const wv = Math.sin(t * 14) * .4; g.save(); g.translate(x + r * 1.05, y - r * .2); g.rotate(wv); g.fillStyle = S.body; g.beginPath(); g.ellipse(0, -24, 16, 28, 0, 0, TAU); g.fill(); g.restore(); }
  }
  sun(t);
  earthChar(t, cam);
  g.restore();
  // Betelgeuse close-up for "aren't you going to explode?"
  if (close > 0) { g.save(); g.globalAlpha = close; starBody('betelgeuse', CX, 560, 640, t, t > at('13') ? 'smug' : 'sleepy', mouthOf('betelgeuse', t)); K.earth(820, 1290, 70, t, moodE(t), { rot: t * .4, look: -1, lookY: -1 }); g.save(); g.translate(820, 1290); openMouth(70, mouthOf('earth', t)); g.restore();
    const sk = pop(t, at('13') + .3); if (sk > 0) { g.save(); g.translate(300, 1150); g.rotate(-.1); g.scale(sk, sk); g.fillStyle = P.gold; g.beginPath(); g.roundRect(-190, -55, 380, 110, 30); g.fill(); text('SOMEDAY…', 0, 20, 56, P.navy, 1000, null, 0); g.restore(); }
    text('~100,000 YEARS?', 300, 1250, 30, '#ffd6c8', 1000, P.navy, 8, 'center', sk > 0 ? Math.min(1, sk) : 0);
    g.restore(); }
  wideView(t, wide);
  // the rewind after Proxima flings Earth away
  const rw = fadeIO(t, end('07') + .1, end('07') + .75, .1);
  if (rw > 0) { g.save(); g.globalAlpha = rw * .25; g.fillStyle = '#fff'; for (let y = (t * 900) % 24; y < H; y += 24) g.fillRect(0, y, W, 3); g.restore(); text('◀◀ REWIND', CX, 1300, 70, P.white, 1000, P.navy, 14, 'center', rw); }
  frozenStreet(t, fadeIO(t, at('04') - .25, end('04') + .25, .3));
  boilingBeach(t, fadeIO(t, at('09') - .2, end('09') + .25, .3));
  redSky(t, fadeIO(t, mid('11') - .15, mid('11') + 1.35, .3));
  title(t); starCard(t);
  const ca = pop(t, at('15') + .5, .4); if (ca > 0) { g.save(); g.translate(CX, 470); g.scale(ca, ca); g.fillStyle = 'rgba(12,10,44,.88)'; g.beginPath(); g.roundRect(-430, -70, 860, 140, 40); g.fill(); g.strokeStyle = P.gold; g.lineWidth = 5; g.stroke(); text('Which star would', 0, -8, 48, P.white, 1000, null, 0); text('YOU pick? ↓', 0, 48, 48, P.gold, 1000, null, 0); g.restore(); }
  captions(t);
  const fo = seg(t, DUR - .5, DUR); if (fo > 0) { g.fillStyle = `rgba(0,0,0,${fo})`; g.fillRect(0, 0, W, H); }
}

// ───────── thumbnail (?thumb=1): its own composition
function thumb() {
  g.setTransform(1, 0, 0, 1, 0, 0); K.bg(2);
  starBody('betelgeuse', 760, 1050, 520, 1, 'smug', 0);
  K.earth(250, 1150, 120, 1.2, 'scared', { rot: 1, look: 1 }); g.save(); g.translate(250, 1150); openMouth(120, .9); g.restore();
  g.fillStyle = '#7fd3ff'; for (const [x, y] of [[345, 1035], [150, 1060]]) { g.beginPath(); g.moveTo(x, y - 30); g.quadraticCurveTo(x + 20, y + 4, x, y + 16); g.quadraticCurveTo(x - 20, y + 4, x, y - 30); g.fill(); }
  K.sunChar(170, 760, 90, 1, { mood: 'worried' }); text('me??', 170, 640, 40, P.white, 1000, P.navy, 10);
  text('WHAT IF THIS', CX, 230, 110, P.white, 1000, P.navy, 20);
  text('REPLACED', CX, 360, 118, P.white, 1000, P.navy, 20);
  text('OUR SUN?!', CX, 500, 140, P.gold, 1000, P.navy, 24);
  g.save(); g.translate(CX + 120, 1480); g.rotate(-.05); g.fillStyle = P.gold; g.beginPath(); g.roundRect(-300, -66, 600, 132, 66); g.fill(); text('PAST MARS', 0, 26, 76, P.navy, 1000, null, 0); g.restore();
}
const TH = new URLSearchParams(location.search).get('thumb');
window.EV = TL.lines.map(l => ({ type: 'vo', id: l.id, t: l.t })); window.DUR = DUR;
window.SUBS = TL.lines.map(l => ({ t0: l.t, t1: l.t + l.d + .3, text: `${NAME[l.who]}: ${l.text}` }));
if (TH) { window.render = () => thumb(); thumb(); } else { window.render = render; render(+(new URLSearchParams(location.search).get('t') ?? 1.2)); }
window.READY = true;
