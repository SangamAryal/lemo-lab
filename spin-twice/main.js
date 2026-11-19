// "What If Earth Spun Twice as Fast?" — flat-vector explainer, vertical 1080×1920, canvas 2D, deterministic in t.
// Beyond Everything brand style (kit.js shared with the Earth Stops, Sun Vanished and Magnetic Field films). Seventeen
// beats, one per line: Earth wakes up spinning double, the 12-hour day, "less sleep?", the 730-day calendar, the body
// clock that can't keep up, the oceans piling up at the equator, a 1 % lighter you, Jupiter-like wind bands, hotter
// tropics and colder poles, what a sudden spin-up would do, the 1,600 km/h wind, why it can't happen, and the ending.
import * as K from './kit.js';
import { clamp, lerp, seg, ss, eio, eo, mulberry, TAU } from '/core/lib.js';
const { P, text, sparkle, glow, card, bubble, pop } = K;
import * as PR from './props.js';
const { stander, sky, ground, house, tree, city, thermo, screech } = PR;

const W = 1080, H = 1920, CX = W / 2;
const cv = document.getElementById('c'), g = cv.getContext('2d');
K.setup(g, W, H); K.makeStars(110, 33); PR.setup(g, W, H);
await document.fonts.load('900 80px NU'); await document.fonts.load('800 40px NU');
const words = await (await fetch('voices/words.json')).json();
const lines = await (await fetch('lines.json')).json();
const dur = await (await fetch('voices/dur.json')).json();

// ───────── timeline: one scene per line; takes are trimmed by tools/voice.py, so the line gap stays small
const IDS = lines.map(l => l.id), VO = {};
const LINE_GAP = .2, GAP = { s06: .45, s09: .35, s11: .35 };          // + a beat to watch the city drown                 // a beat before "but that's if…" and before the good news
{ let t = .25; for (const id of IDS) { VO[id] = +t.toFixed(3); t += dur[id] + (GAP[id] ?? LINE_GAP); } }
const LAST = IDS[IDS.length - 1], DUR = +(VO[LAST] + dur[LAST] + 1.4).toFixed(2);
const nrm = s => s.toLowerCase().replace(/[^a-z0-9]/g, '');
const at = (id, w, k = 0, e = 1) => { let n = 0; for (const x of words[id]) if (nrm(x[0]).startsWith(nrm(w)) && n++ === k) return VO[id] + Math.max(0, x[e]); throw new Error(`${w} in ${id}`); };
const S = [0, ...IDS.slice(1).map(id => VO[id] - .2), DUR];
const sceneAt = t => { let i = 0; while (i < S.length - 2 && t >= S[i + 1]) i++; return i; };
const XF = .4, LOOP = .7;
const T = {
  woke: at('s01', 'woke'), twice1: at('s01', 'twice'), fast: at('s01', 'fast'),
  twelve: at('s02', 'twelve'), sunrise: at('s02', 'sunrise'), sunset: at('s02', 'sunset'), midnight: at('s02', 'midnight'), often: at('s02', 'often'),
  sleep: at('s03', 'sleep'), crazier: at('s03', 'crazier'),
  calendar: at('s04', 'calendar'), year: at('s04', 'year'), seven: at('s04', 'seven'), days: at('s04', 'days'),
  body: at('s05', 'body'), squeeze: at('s05', 'squeeze'), sleep5: at('s05', 'sleep'), up: at('s05', 'up'), next: at('s05', 'next'),
  flings: at('s06', 'flings'), oceans: at('s06', 'oceans'), equator6: at('s06', 'equator'), poles6: at('s06', 'poles'), drain: at('s06', 'drain'), drown: at('s06', 'drown'), cities: at('s06', 'cities'),
  jet: at('p01', 'jet'), health: at('p01', 'health'), animals: at('a01', 'animals'), birds: at('a01', 'birds'), bees: at('a01', 'bees'), flowers: at('a01', 'flowers'), off: at('a01', 'off'),
  crops: at('c01', 'crops'), inner: at('c01', 'inner'), harvests: at('c01', 'harvests'), shrink: at('c01', 'shrink'),
  tide: at('t01', 'tide'), six: at('t01', 'six'), twelve2: at('t01', 'twelve'),
  weigh: at('s07', 'weigh'), percent: at('s07', 'percent'), equator7: at('s07', 'equator'),
  winds: at('s08', 'winds'), bend: at('s08', 'bend'), bands: at('s08', 'bands'), jupiter: at('s08', 'jupiter'),
  heat: at('s09', 'heat'), tropics: at('s09', 'tropics'), hotter: at('s09', 'hotter'), colder: at('s09', 'colder'),
  slowly10: at('s10', 'slowly'), overnight: at('s10', 'overnight'), air10: at('s10', 'air'), old: at('s10', 'old'),
  ground: at('s11', 'ground'), race: at('s11', 'race'), sixteen: at('s11', 'sixteen'), surges: at('s11', 'surges'),
  good: at('s12', 'good'), cant: at('s12', 'can'), slowing: at('s12', 'slowing'), moon: at('s12', 'moon'),
  hack: at('s13', 'hack'), clock: at('s13', 'clock'), everything: at('s13', 'everything'),
};

function tag(x, y, s, sub, k, col = P.gold) {
  if (k <= 0) return; g.save(); g.font = '1000 76px NU'; let w = Math.max(520, g.measureText(s).width + 120); if (sub) { g.font = '800 40px NU'; w = Math.max(w, g.measureText(sub).width + 90); } g.translate(x, y); g.scale(k, k); card(0, 0, w, sub ? 180 : 120, 1);
  text(s, 0, sub ? 8 : 22, 76, col, 1000, null, 0); if (sub) text(sub, 0, 62, 40, P.white, 800, null, 0); g.restore();
}
const bg = (t, top = P.bg0, bot = P.bg1) => K.bg(t, top, bot, g.globalAlpha);
function spinArrows(x, y, r, t, sp = 1, a = 1, col = P.gold) {    // curved arrows circling a planet
  if (a <= 0) return; g.save(); g.globalAlpha *= a; g.strokeStyle = col; g.lineWidth = 14; g.lineCap = 'round';
  for (let i = 0; i < 2; i++) { const a0 = t * sp + i * Math.PI; g.beginPath(); g.ellipse(x, y, r * 1.35, r * .42, 0, a0, a0 + 1.6); g.stroke();
    const ae = a0 + 1.6, px = x + Math.cos(ae) * r * 1.35, py = y + Math.sin(ae) * r * .42, tx = -Math.sin(ae) * r * 1.35, ty = Math.cos(ae) * r * .42, L = Math.hypot(tx, ty);
    K.arrow(px - tx / L * 30, py - ty / L * 30, px + tx / L * 10, py + ty / L * 10, col, 14, 1); }
  g.restore();
}
function badge(x, y, s, k, col = P.red) { if (k <= 0) return; g.save(); g.translate(x, y); g.scale(k, k); g.rotate(-.12); g.fillStyle = col; g.beginPath(); g.arc(0, 0, 110, 0, TAU); g.fill(); g.strokeStyle = P.white; g.lineWidth = 8; g.stroke(); text(s, 0, 30, 92, P.white, 1000, null, 0); g.restore(); }
function bed(x, y, s, t, mood, o = {}) {                           // a person in bed, head on a pillow, under a blanket
  g.save(); g.translate(x, y); g.scale(s, s);
  g.fillStyle = '#7a4a2a'; g.fillRect(-300, -40, 30, 160); g.fillRect(270, 0, 30, 120);
  g.fillStyle = P.white; g.beginPath(); g.roundRect(-290, -60, 580, 100, 30); g.fill();
  g.fillStyle = '#e8eefc'; g.beginPath(); g.roundRect(-270, -130, 170, 80, 36); g.fill();
  const hy = -130 + (o.up ? -60 : 0);
  g.fillStyle = P.skin; g.beginPath(); g.arc(-185, hy, 64, 0, TAU); g.fill();
  g.fillStyle = P.hair; g.beginPath(); g.arc(-185, hy - 12, 66, Math.PI * 1.02, Math.PI * 1.98); g.fill();
  g.save(); g.translate(-185, hy + 8); K.face(54, mood, t, o.look || 0, 2.1, 0); g.restore();
  g.fillStyle = P.hood; g.beginPath(); g.roundRect(-120, -110, 400, 110, 40); g.fill(); g.fillStyle = P.hoodD; g.fillRect(-120, -40, 400, 30);
  if (o.zzz) for (let i = 0; i < 3; i++) { const p = (t * .6 + i / 3) % 1; text('z', -110 + p * 120, -220 - p * 160, 40 + i * 14, P.white, 1000, P.navy, 8, 'center', 1 - p); }
  if (o.phone) { glow(-90, -200, 110, '120,230,255', .3); g.fillStyle = '#20203a'; g.beginPath(); g.roundRect(-110, -250, 44, 76, 8); g.fill(); g.fillStyle = '#7fe6ff'; g.beginPath(); g.roundRect(-105, -244, 34, 64, 5); g.fill(); }
  g.restore();
}
function dial(x, y, r, t, ang, a = 1) {                            // a 12-hour clock dial, Sun and Moon riding the hand
  if (a <= 0) return; g.save(); g.globalAlpha *= a; g.translate(x, y);
  card(0, 0, r * 2.4, r * 2.4, 1);
  g.strokeStyle = 'rgba(255,255,255,.25)'; g.lineWidth = 6; g.beginPath(); g.arc(0, 0, r, 0, TAU); g.stroke();
  for (let i = 0; i < 12; i++) { const q = i / 12 * TAU - Math.PI / 2; text(String(i || 12), Math.cos(q) * r * .78, Math.sin(q) * r * .78 + 14, 40, P.white, 900, null, 0); }
  const sx = Math.cos(ang - Math.PI / 2) * r, sy = Math.sin(ang - Math.PI / 2) * r;
  g.strokeStyle = P.gold; g.lineWidth = 10; g.lineCap = 'round'; g.beginPath(); g.moveTo(0, 0); g.lineTo(sx * .9, sy * .9); g.stroke();
  K.sunBody(sx, sy, 34, t); g.fillStyle = P.moon; g.beginPath(); g.arc(-sx, -sy, 28, 0, TAU); g.fill();
  g.restore();
}
function waterEarth(x, y, r, t, k, a = 1) {                        // cross-section: oceans flow from the poles to a bulge at the equator
  g.save(); g.globalAlpha *= a; g.translate(x, y);
  g.fillStyle = '#3d8be8'; const bx = r * (1.05 + .26 * k), by = r * (1.05 - .05 * k);
  g.beginPath(); g.ellipse(0, 0, bx, by, 0, 0, TAU); g.fill();
  g.fillStyle = '#c98a4a'; g.beginPath(); g.ellipse(0, 0, r * (1 + .02 * k), r * (1 - .02 * k), 0, 0, TAU); g.fill();
  g.fillStyle = P.land; for (const [u, v, s] of [[-.4, -.55, .22], [.35, -.62, .18], [-.3, .58, .2], [.4, .6, .16]]) { g.beginPath(); g.ellipse(u * r, v * r, s * r, s * r * .55, 0, 0, TAU); g.fill(); }
  g.fillStyle = 'rgba(61,139,232,' + (1 - k) + ')'; g.beginPath(); g.ellipse(0, -r * .92, r * .4, r * .1, 0, 0, TAU); g.ellipse(0, r * .92, r * .4, r * .1, 0, 0, TAU); g.fill();
  g.fillStyle = 'rgba(20,30,90,.25)'; g.beginPath(); g.arc(r * .35, r * .1, r * 1.1, 0, TAU); g.arc(-r * .15, -r * .08, r * 1.02, 0, TAU, true); g.fill('evenodd');
  g.setLineDash([16, 14]); g.strokeStyle = 'rgba(255,255,255,.6)'; g.lineWidth = 5; g.beginPath(); g.moveTo(-bx - 60, 0); g.lineTo(bx + 60, 0); g.stroke(); g.setLineDash([]);
  g.restore();
}
function scale(x, y, s, val, t) {                                  // a bathroom scale with a readout
  g.save(); g.translate(x, y); g.scale(s, s);
  g.fillStyle = '#e9ecf6'; g.beginPath(); g.roundRect(-170, -40, 340, 80, 26); g.fill();
  g.fillStyle = P.navy; g.beginPath(); g.roundRect(-90, -24, 180, 44, 10); g.fill();
  text(val, 0, 12, 36, '#7fe6ff', 1000, null, 0); g.restore();
}
function jupiter(x, y, r, t, a = 1) {
  if (a <= 0) return; g.save(); g.globalAlpha *= a; g.translate(x, y); g.beginPath(); g.arc(0, 0, r, 0, TAU); g.save(); g.clip();
  const cols = ['#e8c9a0', '#c48a5a', '#f2dcc0', '#b5774a', '#ead2b0', '#c48a5a', '#f2dcc0', '#b5774a'];
  cols.forEach((c, i) => { g.fillStyle = c; g.fillRect(-r, -r + i * r / 4, 2 * r, r / 4 + 1); });
  g.fillStyle = '#d0603a'; g.beginPath(); g.ellipse(r * .3 + Math.sin(t) * 4, r * .35, r * .22, r * .12, 0, 0, TAU); g.fill();
  g.fillStyle = 'rgba(40,20,60,.25)'; g.beginPath(); g.arc(r * .35, r * .1, r * 1.1, 0, TAU); g.arc(-r * .15, -r * .08, r * 1.02, 0, TAU, true); g.fill('evenodd');
  g.restore(); text('Jupiter', 0, r + 60, 44, '#f2dcc0', 1000, P.navy, 10); g.restore();
}
function bands(x, y, r, t, k) {                                    // alternating wind bands drawn over Earth
  if (k <= 0) return; g.save(); g.beginPath(); g.arc(x, y, r, 0, TAU); g.clip();
  const n = 7; for (let i = 0; i < n; i++) { const yy = y - r + (i + .5) * 2 * r / n, dir = i % 2 ? 1 : -1;
    g.globalAlpha = k * .55; g.fillStyle = i % 2 ? 'rgba(255,255,255,.35)' : 'rgba(255,220,160,.25)'; g.fillRect(x - r, yy - r / n, 2 * r, 2 * r / n);
    g.globalAlpha = k; for (let j = 0; j < 3; j++) { const p = ((t * .5 * dir + j / 3) % 1 + 1) % 1, ax = x - r + p * 2 * r; K.arrow(ax - dir * 40, yy, ax + dir * 20, yy, P.white, 8, 1); } }
  g.restore();
}
function airShell(x, y, r, t, lag, a = 1) {                        // the atmosphere as a dashed cyan shell that lags the spin
  if (a <= 0) return; g.save(); g.globalAlpha *= a; g.strokeStyle = P.cyan; g.lineWidth = 10; g.setLineDash([40, 30]); g.lineDashOffset = -lag;
  g.beginPath(); g.arc(x, y, r * 1.22, 0, TAU); g.stroke(); g.restore();
}
function wave(x0, y, h, t, k) {                                    // a big surge rolling in from the left
  if (k <= 0) return; const front = lerp(-200, W + 300, k), crest = h;
  g.fillStyle = '#2a63b8'; g.beginPath(); g.moveTo(-10, H); g.lineTo(-10, y - crest * .7); g.lineTo(front - 160, y - crest); g.quadraticCurveTo(front + 60, y - crest, front, y - crest * .3); g.quadraticCurveTo(front + 30, y, front - 20, y + 60); g.lineTo(front - 20, H); g.fill();
  g.fillStyle = P.white; for (let i = 0; i < 7; i++) { const R = mulberry(i + 3); g.beginPath(); g.arc(front - 40 - R() * 160, y - crest + R() * 60 + Math.sin(t * 6 + i) * 8, 16 + R() * 20, 0, TAU); g.fill(); }
}

function skyline(t, a = 1, lit = 0) {                              // a city block with windows
  const R = mulberry(17); g.save(); g.globalAlpha *= a;
  for (const [x, w, h, c] of [[-20, 170, 520, '#8aa4d8'], [140, 130, 760, '#6f8cc8'], [260, 190, 600, '#9bb4e2'], [440, 150, 880, '#7d97d0'], [580, 200, 650, '#8aa4d8'], [770, 140, 820, '#6f8cc8'], [900, 200, 560, '#9bb4e2']]) {
    g.fillStyle = c; g.fillRect(x, 1500 - h, w, h);
    g.fillStyle = 'rgba(255,255,255,.12)'; g.fillRect(x + w * .7, 1500 - h, w * .3, h);
    for (let yy = 1500 - h + 40; yy < 1480; yy += 70) for (let xx = x + 20; xx < x + w - 30; xx += 46) { g.fillStyle = R() < .5 ? '#ffe58a' : '#c8d8ff'; g.fillRect(xx, yy, 24, 34); }
  }
  g.restore();
}
function cityDrown(t, w, a = 1) {                                  // water rising through a city, a person on a rooftop, a floating car
  if (a <= 0) return; g.save(); g.globalAlpha *= a;
  sky('#5f6f9a', '#a9b8d8'); skyline(t);
  const lvl = lerp(1560, 1020, eo(w));
  stander(510, 1500 - 880, .42, t, { mood: 'scared', arms: 'flail' });
  g.fillStyle = 'rgba(42,99,184,.92)'; g.beginPath(); g.moveTo(0, H); for (let x = 0; x <= W; x += 20) g.lineTo(x, lvl + Math.sin(x * .02 + t * 4) * 14); g.lineTo(W, H); g.fill();
  g.fillStyle = 'rgba(61,139,232,.9)'; g.beginPath(); g.moveTo(0, H); for (let x = 0; x <= W; x += 20) g.lineTo(x, lvl + 40 + Math.sin(x * .025 - t * 3) * 10); g.lineTo(W, H); g.fill();
  g.fillStyle = P.white; for (let i = 0; i < 12; i++) { const x = (i * 97 + t * 60) % W; g.beginPath(); g.arc(x, lvl + Math.sin(x * .02 + t * 4) * 14, 10, 0, TAU); g.fill(); }
  g.save(); g.translate(780, lvl - 10 + Math.sin(t * 3) * 10); g.rotate(Math.sin(t * 2) * .15); g.fillStyle = P.red; g.beginPath(); g.roundRect(-90, -50, 180, 60, 20); g.fill(); g.beginPath(); g.roundRect(-50, -90, 100, 50, 16); g.fill(); g.fillStyle = '#7fd3ff'; g.fillRect(-36, -80, 72, 30); g.fillStyle = P.navy; for (const sx of [-55, 55]) { g.beginPath(); g.arc(sx, 12, 22, 0, TAU); g.fill(); } g.restore();
  g.restore();
}
function batteryIcon(x, y, lvl, a = 1) {
  if (a <= 0) return; g.save(); g.globalAlpha *= a; g.translate(x, y);
  g.fillStyle = P.white; g.beginPath(); g.roundRect(-110, -55, 220, 110, 20); g.fill(); g.fillRect(110, -22, 18, 44);
  g.fillStyle = P.navy; g.beginPath(); g.roundRect(-98, -43, 196, 86, 12); g.fill();
  g.fillStyle = lvl < .3 ? P.red : '#5fcf7a'; g.beginPath(); g.roundRect(-90, -35, 180 * lvl, 70, 8); g.fill(); g.restore();
}
function bee(x, y, s, t, mood) {
  g.save(); g.translate(x, y); g.scale(s, s);
  g.fillStyle = 'rgba(255,255,255,.75)'; const fl = Math.sin(t * 40) * .3; for (const sd of [-1, 1]) { g.save(); g.rotate(sd * (.5 + fl)); g.beginPath(); g.ellipse(sd * 10, -50, 26, 44, 0, 0, TAU); g.fill(); g.restore(); }
  g.fillStyle = '#ffc73a'; g.beginPath(); g.ellipse(0, 0, 70, 50, 0, 0, TAU); g.fill();
  g.fillStyle = P.navy; for (const bx of [-25, 10]) g.fillRect(bx, -48, 16, 96);
  g.save(); g.translate(40, -4); K.face(30, mood, t, 0, 1.4, 0); g.restore(); g.restore();
}
function birdy(x, y, s, t, ph = 0) {
  g.save(); g.translate(x, y); g.scale(s, s); const fl = Math.sin(t * 10 + ph);
  g.fillStyle = '#ff8a5c'; g.beginPath(); g.ellipse(0, 0, 60, 34, 0, 0, TAU); g.fill();
  g.beginPath(); g.moveTo(-10, -6); g.quadraticCurveTo(-40, -70 * fl, -90, -60 * fl); g.lineTo(20, -6); g.fill();
  g.beginPath(); g.arc(52, -18, 24, 0, TAU); g.fill(); g.fillStyle = P.gold; g.beginPath(); g.moveTo(72, -20); g.lineTo(98, -12); g.lineTo(72, -6); g.fill();
  g.fillStyle = P.navy; g.beginPath(); g.arc(58, -24, 5, 0, TAU); g.fill(); g.restore();
}
function flower(x, y, s, t, open) {
  g.save(); g.translate(x, y); g.scale(s, s);
  g.strokeStyle = '#3fa35e'; g.lineWidth = 14; g.beginPath(); g.moveTo(0, 0); g.lineTo(0, -220); g.stroke();
  g.translate(0, -220); for (let i = 0; i < 8; i++) { g.save(); g.rotate(i / 8 * TAU); g.fillStyle = i % 2 ? '#ff6a9a' : '#ff8ab2'; g.beginPath(); g.ellipse(0, -30 - 30 * open, 22, 30 + 20 * open, 0, 0, TAU); g.fill(); g.restore(); }
  g.fillStyle = P.gold; g.beginPath(); g.arc(0, 0, 32, 0, TAU); g.fill(); g.restore();
}
function wheat(x, y, s, t, droop) {
  g.save(); g.translate(x, y); g.scale(s, s); g.rotate(Math.sin(t * 1.5 + x) * .04 + droop * .5);
  g.strokeStyle = droop > .5 ? '#a8925a' : '#7fbf5a'; g.lineWidth = 8; g.beginPath(); g.moveTo(0, 0); g.quadraticCurveTo(0, -120, droop * 60, -200 + droop * 40); g.stroke();
  g.fillStyle = droop > .5 ? '#b8a060' : '#ffd36a'; for (let i = 0; i < 5; i++) { g.beginPath(); g.ellipse(droop * 60 + (i % 2 ? 8 : -8), -200 + droop * 40 - i * 18 * (1 - droop * .5), 10, 16, 0, 0, TAU); g.fill(); }
  g.restore();
}

// ───────── scenes
const SC = [];
SC[0] = (t) => {                                                    // hook: Earth wakes up spinning double
  bg(t);
  const k2 = ss(seg(t, T.twice1 - .3, T.twice1 + .3)), sp = lerp(.25, 1.1, k2), rot = t * .25 + Math.max(0, t - T.twice1 + .3) * (sp - .25);
  screech(CX, 1000, 230, k2 * .8, t);
  spinArrows(CX, 1000, 230, rot * 2.4, 1, .4 + .6 * k2);
  K.earth(CX, 1000, 230, t, t < T.woke ? 'sleepy' : k2 > .5 ? 'scared' : 'worried', { rot });
  badge(CX + 250, 760, '×2', pop(t, T.twice1 - .1));
  g.save(); g.translate(CX, 210); text('WHAT IF EARTH SPUN', 0, -10, 84, P.white, 1000, P.navy, 16); text('TWICE AS FAST?', 0, 110, 124, P.gold, 1000, P.navy, 20); g.restore();
};
SC[1] = (t) => {                                                    // a 12-hour day: sunrise, sunset, midnight on fast-forward
  const u = ((t - VO.s02) / 2.4 + .1), day = .5 + .5 * Math.sin(u * TAU - Math.PI / 2);
  const c = (a, b) => `rgb(${a.map((v, i) => Math.round(lerp(v, b[i], day))).join(',')})`;
  sky(c([10, 8, 40], [92, 196, 242]), c([30, 20, 80], [191, 233, 255]));
  if (day < .4) { g.save(); g.globalAlpha = 1 - day / .4; K.bg(t, 'rgba(0,0,0,0)', 'rgba(0,0,0,0)', 1 - day / .4); g.restore(); }
  const sa = u * TAU, sx = CX - Math.sin(sa) * 520, sy = 1400 - Math.cos(sa) * -1 * 0 - Math.max(-200, -Math.cos(sa - Math.PI) * 900);
  K.sunBody(CX + Math.cos(sa + Math.PI) * 460, 1380 - Math.sin(sa) * 900, 90, t);
  g.fillStyle = P.moon; g.beginPath(); g.arc(CX - Math.cos(sa + Math.PI) * 460, 1380 + Math.sin(sa) * 900, 60, 0, TAU); g.fill();
  ground(1420, day < .5 ? 1 : 0); city(1430, 1, day < .5 ? '#1b1a44' : '#8fc9ec');
  dial(CX, 700, 170, t, u * TAU, ss(seg(t, T.twelve - .5, T.twelve)));
  for (const [w, s, x] of [['sunrise', 'sunrise', 220], ['sunset', 'sunset', CX], ['midnight', 'midnight', 860]]) { const k = pop(t, T[w] - .1); if (k > 0) { g.save(); g.translate(x, 1050); g.scale(k, k); card(0, 0, 280, 90, 1); text(s, 0, 16, 46, P.gold, 1000, null, 0); g.restore(); } }
  tag(CX, 300, '12-hour day', null, pop(t, T.twelve - .1));
};
SC[2] = (t) => {                                                    // "less sleep?" … much crazier
  bg(t, '#120d3a', '#2a1c5e');
  bed(CX, 1250, 1.3, t, t > T.crazier - .2 ? 'scared' : 'sleepy', { zzz: t < T.crazier - .2, up: t > T.crazier - .2 });
  const ks = pop(t, T.sleep - .1); if (ks > 0) bubble(CX + 120, 820, 360, 96, 'less sleep?', ks * (1 - ss(seg(t, T.crazier - .4, T.crazier - .2))), P.navy, -1);
  const kc = pop(t, T.crazier - .1); if (kc > 0) { g.save(); g.translate(CX, 560); g.scale(kc, kc); g.rotate(-.06); text('MUCH CRAZIER', 0, 0, 120, P.red, 1000, P.white, 16); g.restore(); }
};
SC[3] = (t) => {                                                    // the calendar breaks: about 730 days a year
  bg(t);
  const kn = ss(seg(t, T.seven - .2, T.days + .3)), n = Math.round(lerp(365, 730, kn));
  g.save(); g.translate(CX, 980); g.rotate(Math.sin(t * 2) * .02);
  g.fillStyle = P.white; g.beginPath(); g.roundRect(-300, -280, 600, 560, 40); g.fill();
  g.fillStyle = P.red; g.beginPath(); g.roundRect(-300, -280, 600, 150, [40, 40, 0, 0]); g.fill();
  text('DAYS PER YEAR', 0, -185, 52, P.white, 1000, null, 0);
  text(String(n), 0, 120, 230, n > 365 ? P.red : P.navy, 1000, null, 0);
  g.restore();
  if (t > T.calendar - .2 && t < T.seven) { for (let i = 0; i < 6; i++) { const R = mulberry(i + Math.floor(t * 8)); g.save(); g.translate(CX + (R() - .5) * 700, 700 + R() * 600); g.rotate(R() * 2); g.fillStyle = '#fff'; g.globalAlpha = .8; g.fillRect(-40, -50, 80, 100); g.restore(); } }
  tag(CX, 360, '≈ 730 days', 'same orbit, half-length days', pop(t, T.days - .1));
};
SC[4] = (t) => {                                                    // the body clock can't squeeze into 12 hours
  bg(t, '#0b0830', '#1d1452');
  const k2 = ss(seg(t, T.up - .4, T.up));
  g.save(); g.globalAlpha *= 1 - k2 * .55; card(CX, 760, 900, 420, 1); text('NIGHT 1', CX, 620, 54, P.gold, 1000, null, 0); bed(CX, 900, .9, t, 'sleepy', { zzz: 1 }); g.restore();
  g.save(); g.globalAlpha *= .45 + .55 * k2; card(CX, 1260, 900, 420, 1); text('NIGHT 2', CX, 1120, 54, P.gold, 1000, null, 0); bed(CX, 1400, .9, t, 'worried', { up: 1, phone: 1, look: .5 }); g.restore();
  tag(CX, 300, 'body clock ≈ 24 h', "it can't squeeze into 12", pop(t, T.squeeze - .1), P.cyan);
};
SC[5] = (t) => {                                                    // permanent jet lag
  bg(t, '#0b0830', '#1d1452');
  const k = ss(seg(t, VO.p01, T.health + .4));
  batteryIcon(CX, 760, lerp(.9, .15, k), 1);
  stander(CX, 1500, .8, t, { mood: k > .5 ? 'sad' : 'sleepy', arms: 'hold', look: .3 });
  const kj = pop(t, T.jet - .1); if (kj > 0) { g.save(); g.translate(CX, 560); g.scale(kj, kj); g.rotate(-.05); text('PERMANENT JET LAG', 0, 0, 92, P.gold, 1000, P.navy, 16); g.restore(); }
  tag(CX, 300, 'out of sync', 'linked to poor sleep and health problems', pop(t, T.health - .2), P.red);
};
SC[6] = (t) => {                                                    // animals run on 24-hour clocks too
  const u = (t - VO.a01) / 2.4, day = .5 + .5 * Math.sin(u * TAU);
  const c = (a, b) => `rgb(${a.map((v, i) => Math.round(lerp(v, b[i], day))).join(',')})`;
  sky(c([12, 10, 44], [92, 196, 242]), c([34, 24, 84], [191, 233, 255])); ground(1420, day < .5 ? 1 : 0);
  const lost = t > T.off - .3;
  const kb = ss(seg(t, T.birds - .4, T.birds)); if (kb > 0) { g.save(); g.globalAlpha *= kb; birdy(300 + Math.cos(t * 2) * (lost ? 90 : 20), 620 + Math.sin(t * 2) * (lost ? 50 : 10), .95, t); g.restore(); }
  const ke = ss(seg(t, T.bees - .4, T.bees)); if (ke > 0) { g.save(); g.globalAlpha *= ke; bee(760 + Math.sin(t * 3) * (lost ? 120 : 30), 900 + Math.cos(t * 2.5) * 40, .9, t, lost ? 'worried' : 'happy'); g.restore(); }
  const kf = ss(seg(t, T.flowers - .4, T.flowers)); if (kf > 0) { g.save(); g.globalAlpha *= kf; for (const [x, ph] of [[420, 0], [620, 1.5], [820, 3]]) flower(x, 1440, .9, t, lost ? .5 + .5 * Math.sin(t * 5 + ph) : day); g.restore(); }
  if (lost) { const kq = pop(t, T.off - .2); for (const [x, y] of [[300, 480], [760, 760], [620, 1100]]) { g.save(); g.translate(x, y); g.scale(kq, kq); text('?', 0, 0, 100, P.gold, 1000, P.navy, 14); g.restore(); } }
  tag(CX, 300, 'animals have clocks too', 'birds · bees · flowers', pop(t, T.animals - .1), P.cyan);
};
SC[7] = (t) => {                                                    // crops grow worse when their clocks are out of step
  sky('#7fc8f0', '#d6f0ff');
  g.fillStyle = '#8a6a3a'; g.fillRect(0, 1250, W, H - 1250); g.fillStyle = '#a07a44'; for (let r = 0; r < 5; r++) g.fillRect(0, 1290 + r * 90, W, 26);
  const d = ss(seg(t, T.inner - .3, T.shrink + .3));
  for (let r = 0; r < 4; r++) for (let i = 0; i < 9; i++) wheat(60 + i * 120 + (r % 2) * 60, 1300 + r * 90, .8 + r * .12, t + r, d * (.6 + .4 * ((i + r) % 3) / 2));
  const kh = pop(t, T.harvests - .1);
  if (kh > 0) { g.save(); g.translate(CX, 820); g.scale(kh, kh); g.fillStyle = '#c78a4a'; g.beginPath(); g.moveTo(-170, -40); g.lineTo(170, -40); g.lineTo(130, 120); g.lineTo(-130, 120); g.fill();
    const fill = lerp(1, .3, ss(seg(t, T.shrink - .3, T.shrink + .4))); g.fillStyle = '#ffd36a'; for (let i = 0; i < 12 * fill; i++) { g.beginPath(); g.arc(-130 + (i % 6) * 52, -50 - Math.floor(i / 6) * 40, 30, 0, TAU); g.fill(); } g.restore(); }
  tag(CX, 340, 'harvests could shrink', "plant clocks out of step with the day", pop(t, T.shrink - .2), P.gold);
};
SC[8] = (t) => {                                                    // high tide every ~6 hours
  sky('#7fc8f0', '#d6f0ff');
  g.fillStyle = '#ffe0a3'; g.beginPath(); g.moveTo(0, 1500); g.quadraticCurveTo(500, 1300, W, 1200); g.lineTo(W, H); g.lineTo(0, H); g.fill();
  house(900, 1210, .45); tree(720, 1250, .5, 0, t);
  const ph = (t - VO.t01) / 1.4 * TAU, lvl = 1440 - 160 * (.5 + .5 * Math.sin(ph));
  g.fillStyle = '#3d8be8'; g.beginPath(); g.moveTo(0, H); for (let x = 0; x <= W; x += 20) g.lineTo(x, lvl + x * .12 + Math.sin(x * .03 + t * 3) * 8); g.lineTo(W, H); g.fill();
  dial(CX, 700, 150, t, ph, ss(seg(t, T.tide - .4, T.tide)));
  K.arrow(120, 1300, 120, lvl > 1360 ? 1160 : 1380, P.white, 14, .8);
  tag(CX, 340, 'high tide every ~6 h', 'instead of every ~12 h', pop(t, T.six - .1), P.cyan);
};
SC[9] = (t) => {                                                    // the oceans flow to the equator
  bg(t);
  const k = ss(seg(t, T.flings - .2, T.drown + .6)), ex = CX, ey = 1000, er = 300;
  waterEarth(ex, ey, er, t, k);
  const ka = ss(seg(t, T.oceans - .2, T.oceans + .3)) * (1 - ss(seg(t, T.drown, T.drown + .8)) * .5);
  for (const sd of [-1, 1]) for (const dx of [-120, 120]) K.arrow(ex + dx, ey + sd * er * .85, ex + dx * 1.3, ey + sd * er * .35, P.cyan, 16, ka);
  const kd = pop(t, T.drain - .1); if (kd > 0) { g.save(); g.translate(ex, ey - er - 90); g.scale(kd, kd); text('seas drain', 0, 0, 56, '#ffb35a', 1000, P.navy, 12); g.restore(); }
  const kw = pop(t, T.drown - .1); if (kw > 0) { g.save(); g.translate(ex + er + 40, ey - 70); g.scale(kw, kw); text('cities drown', 0, 0, 56, P.cyan, 1000, P.navy, 12, 'right'); g.restore(); }
  tag(CX, 340, 'water piles up', 'at the equator, kilometres deep', pop(t, T.equator6 - .1), P.cyan);
  const kc = ss(seg(t, T.cities - .35, T.cities + .05)); if (kc > 0) { cityDrown(t, seg(t, T.cities - .2, S[10] + .4), kc); tag(CX, 1320, 'cities drown', 'near the equator', pop(t, T.drown - .1), P.cyan); }
};
SC[10] = (t) => {                                                    // about 1 % lighter at the equator
  sky(); ground(1420);
  const k = ss(seg(t, T.weigh, T.percent + .3)), kg = (70 - .7 * k).toFixed(1);
  scale(CX, 1400, 1.3, `${kg} kg`, t);
  stander(CX, 1350, .72, t, { mood: k > .5 ? 'happy' : 'keen', arms: k > .5 ? 'up' : 'down', lookY: .6 });
  tag(CX, 360, '≈ 1% lighter', 'at the equator · the spin pulls you out', pop(t, T.percent - .1), P.cyan);
};
SC[11] = (t) => {                                                    // winds bend harder and split into bands, like Jupiter
  bg(t);
  const kb = ss(seg(t, T.bands - .4, T.bands + .4));
  K.earth(CX - 80, 1050, 280, t, 'worried', { rot: t * .5, look: .6 });
  bands(CX - 80, 1050, 280, t, kb);
  const kj = ss(seg(t, T.jupiter - .4, T.jupiter + .1)); jupiter(860, 620, 130, t, kj);
  const kw = ss(seg(t, T.winds - .3, T.bend + .2)) * (1 - kb);
  if (kw > 0) for (let i = 0; i < 4; i++) { const y0 = 850 + i * 130; g.save(); g.globalAlpha *= kw; g.strokeStyle = P.white; g.lineWidth = 10; g.lineCap = 'round'; g.beginPath(); g.moveTo(CX - 330, y0); g.quadraticCurveTo(CX - 80, y0 - 60 + i * 30, CX + 170, y0 + (i < 2 ? -80 : 80)); g.stroke(); g.restore(); }
  tag(CX, 340, 'more wind bands', 'a faster spin bends winds harder', pop(t, T.bands - .1), P.white);
};
SC[12] = (t) => {                                                    // hotter tropics, colder poles
  bg(t);
  const k = ss(seg(t, T.tropics - .3, T.colder + .4)), ex = CX, ey = 1050, er = 300;
  K.earth(ex, ey, er, t, 'worried', { look: 0 });
  g.save(); g.beginPath(); g.arc(ex, ey, er, 0, TAU); g.clip();
  g.globalAlpha = .55 * k; g.fillStyle = '#ff5a3c'; g.fillRect(ex - er, ey - er * .38, 2 * er, er * .76);
  g.fillStyle = '#7fd3ff'; g.fillRect(ex - er, ey - er, 2 * er, er * .4); g.fillRect(ex - er, ey + er * .6, 2 * er, er * .4); g.restore();
  const kh = ss(seg(t, T.heat - .3, T.heat + .2)) * (1 - k * .6);
  for (const sd of [-1, 1]) { K.arrow(ex + 340, ey, ex + 340, ey + sd * 230, '#ffb35a', 16, kh); }
  thermo(150, 1180, lerp(.5, .9, ss(seg(t, T.hotter - .3, T.hotter + .3))), P.red, k);
  thermo(930, 1180, lerp(.5, .1, ss(seg(t, T.colder - .3, T.colder + .3))), '#3fa8ff', k);
  tag(CX, 340, 'less heat to the poles', 'tropics hotter · poles colder', pop(t, T.tropics - .2), '#ffb35a');
};
SC[13] = (t) => {                                                    // overnight: the air and oceans keep their old speed
  bg(t);
  const ko = ss(seg(t, T.overnight - .3, T.overnight + .2)), rot = t * .25 + Math.max(0, t - T.overnight) * 1.4;
  const lag = (t * .25) * 300;
  airShell(CX, 1050, 260, t, lag, ss(seg(t, T.air10 - .4, T.air10)));
  screech(CX, 1050, 260, ko, t);
  K.earth(CX, 1050, 260, t, ko > .5 ? 'scared' : 'happy', { rot, look: ko > .5 ? Math.sin(t * 4) : 0 });
  const kl = pop(t, T.old - .1); if (kl > 0) { g.save(); g.translate(CX, 690); g.scale(kl, kl); card(0, 0, 520, 100, 1); text('air: old speed', 0, 18, 52, P.cyan, 1000, null, 0); g.restore(); }
  tag(CX, 340, t < T.overnight - .3 ? 'slow spin-up: fine' : 'overnight?', null, pop(t, t < T.overnight - .3 ? T.slowly10 - .2 : T.overnight - .1), t < T.overnight - .3 ? P.cyan : P.red);
};
SC[14] = (t) => {                                                   // 1,600+ km/h wind and giant surges at the equator
  sky('#6a7fa8', '#c7d4ea');
  const kw = ss(seg(t, T.race - .4, T.race + .2)), sh = Math.sin(t * 40) * 8 * kw;
  g.save(); g.translate(sh, 0);
  ground(1420);
  for (const [x, s, ph] of [[220, .7, 0], [720, .75, 1.2]]) house(x - kw * 30 * Math.sin(t * 8 + ph), 1420, s, -kw * .12);
  tree(470, 1420, .6, -kw * .5, t); tree(950, 1420, .55, -kw * .45, t + 1);
  g.restore();
  if (kw > 0) { const R = mulberry(5); g.save(); g.globalAlpha *= kw; g.strokeStyle = 'rgba(255,255,255,.8)'; g.lineCap = 'round'; for (let i = 0; i < 26; i++) { const y = 300 + R() * 1150, len = 120 + R() * 220, x = W + 200 - ((t * 2600 + R() * 2000) % (W + 600)); g.lineWidth = 4 + R() * 8; g.beginPath(); g.moveTo(x, y); g.lineTo(x + len, y); g.stroke(); } g.restore(); }
  wave(0, 1450, 520, t, ss(seg(t, T.surges - .5, T.surges + 1.4)));
  tag(CX, 360, '1,600+ km/h', 'ground vs air, at the equator', pop(t, T.sixteen - .1), P.red);
};
SC[15] = (t) => {                                                   // the good news: it can't happen; the Moon brakes the spin
  bg(t);
  const kc = pop(t, T.cant - .1); if (kc > 0) { g.save(); g.translate(CX, 560); g.scale(kc, kc); g.rotate(-.05); text("CAN'T HAPPEN", 0, 0, 120, P.gold, 1000, P.navy, 18); g.restore(); }
  const ks = ss(seg(t, T.slowing - .3, T.slowing + .3));
  K.earth(CX - 120, 1100, 230, t, t > T.good - .2 ? 'happy' : 'worried', { rot: t * lerp(.25, .1, ks) });
  const km = ss(seg(t, T.moon - .5, T.moon)), mx = lerp(1250, 880, eo(km)), my = 900;
  if (km > 0) { g.save(); g.setLineDash([14, 12]); g.strokeStyle = P.cyan; g.lineWidth = 8; g.globalAlpha *= km; g.beginPath(); g.moveTo(CX + 100, 1060); g.quadraticCurveTo(760, 940, mx - 80, my + 20); g.stroke(); g.restore(); }
  K.moon(mx, my, 90, t, 'smug', { tilt: .2 });
  tag(CX, 1540, 'slowing down', 'days get ~2 ms longer per century', pop(t, T.slowing - .1), P.cyan);
};
SC[16] = (t) => {                                                   // ending: a productivity hack? it would change everything
  sky(); ground(1420);
  K.sunChar(200, 380, 150, t, { mood: 'sleepy', shades: 0, mug: 1, sip: .5 + .5 * Math.sin(t * 1.2) });
  K.deckchair(640, 1330, 1.05);
  K.person(600, 1300, .8, t, { mood: t > T.clock ? 'worried' : 'happy', phone: t < T.clock, look: -.6, lookY: -.6 });
  const kh = pop(t, T.hack - .2); if (kh > 0) bubble(760, 820, 420, 96, '12 h = more done!', kh * (1 - ss(seg(t, T.clock - .3, T.clock))), P.navy, -1);
  const ke = pop(t, T.everything - .2); if (ke > 0) { g.save(); g.translate(CX, 600); g.scale(ke, ke); card(0, 0, 900, 140, 1); text('it changes EVERYTHING', 0, 22, 72, P.gold, 1000, null, 0); g.restore(); }
};

// ───────── captions: word-pops, key words in gold (lower middle, above the Shorts UI)
const KEY = new Set(['jet', 'lag', 'health', 'animals', 'birds', 'bees', 'flowers', 'crops', 'harvests', 'shrink', 'tide', 'six', 'spinning', 'twice', 'fast', 'twelve', 'hours', 'sunrise', 'sunset', 'midnight', 'sleep', 'crazier', 'calendar', 'seven', 'hundred', 'thirty', 'days', 'body', 'clock', 'next', 'oceans', 'equator', 'drain', 'drown', 'one', 'percent', 'less', 'winds', 'bands', 'jupiters', 'hotter', 'colder', 'overnight', 'old', 'speed', 'sixteen', 'kilometres', 'surges', 'cant', 'slowing', 'moon', 'twelvehour', 'hack', 'everything']);
const CAP = [];
for (const [id, ws] of Object.entries(words)) {
  const toks = ws.map(w => ({ w: w[0], k: w[0], t0: Math.max(0, w[1]), t1: w[2] }));
  let line = [], n = 0; const flush = () => { if (line.length) CAP.push({ words: line.map(x => ({ ...x, t0: VO[id] + x.t0, t1: VO[id] + x.t1 })) }); line = []; n = 0; };
  for (const tk of toks) { line.push(tk); n += tk.w.length + 1; if (n > 18 || /[.?!,:]$/.test(tk.w) && n > 9) flush(); }
  flush();
}
for (let i = 0; i < CAP.length; i++) { const c = CAP[i], e = c.words[c.words.length - 1].t1; c.t0 = c.words[0].t0 - .05; c.t1 = i + 1 < CAP.length ? Math.min(CAP[i + 1].words[0].t0 - .02, e + .7) : e + .8; }
function captions(t) {
  const c = CAP.find(c => t >= c.t0 && t < c.t1); if (!c) return;
  g.save(); g.font = '900 74px NU';
  const ws = c.words.map(w => ({ ...w, s: w.w.replace(/[,]$/, ''), wd: g.measureText(w.w.replace(/[,]$/, '') + ' ').width }));
  const rows = [[]]; let rw = 0; for (const w of ws) { if (rw + w.wd > 900 && rows[rows.length - 1].length) { rows.push([]); rw = 0; } rows[rows.length - 1].push(w); rw += w.wd; }
  rows.forEach((row, ri) => { const tot = row.reduce((p, w) => p + w.wd, 0); let x = CX - tot / 2; const y = 1700 + ri * 88;
    for (const w of row) { const k = clamp((t - w.t0) / .1); if (k > 0) { g.save(); g.globalAlpha = k; g.translate(x, y); const s = .85 + .15 * eo(k); g.scale(s, s); g.lineJoin = 'round'; g.lineWidth = 16; g.strokeStyle = P.navy; g.textAlign = 'left'; g.strokeText(w.s, 0, 0); g.fillStyle = KEY.has(nrm(w.k)) ? P.gold : P.white; g.fillText(w.s, 0, 0); g.restore(); } x += w.wd; } });
  g.restore();
}

// ───────── frame: a quick crossfade + push-in between scenes; the end loops into the start
function render(t) {
  g.setTransform(1, 0, 0, 1, 0, 0); g.globalAlpha = 1;
  const i = sceneAt(t), s0 = S[i], u = clamp((t - s0) / XF);
  const draw = (k, z, a, tt = t) => { g.save(); g.globalAlpha = a; g.translate(CX, 1000); g.scale(z, z); g.translate(-CX, -1000); SC[k](tt); g.restore(); };
  if (i > 0 && u < 1) { draw(i - 1, 1 + .08 * eio(u), 1); draw(i, 1.06 - .06 * eo(u), ss(u)); }
  else draw(i, 1 + (t - s0) * .006, 1);
  const lk = seg(t, DUR - LOOP, DUR); if (lk > 0) draw(0, 1, ss(lk), 0);
  g.setTransform(1, 0, 0, 1, 0, 0); g.globalAlpha = 1;
  if (lk < 1) { g.save(); g.globalAlpha = 1 - lk; captions(t); g.restore(); }
}

// ───────── events for the score and the mix
const EV = [];
for (const [id, t] of Object.entries(VO)) EV.push({ type: 'vo', id, t });
for (const [k, v] of Object.entries(T)) EV.push({ type: 'cue', name: k, t: +v.toFixed(3) });
S.forEach((s, i) => { if (i > 0 && i < S.length - 1) EV.push({ type: 'scene', i, t: +s.toFixed(3) }); });
EV.sort((a, b) => a.t - b.t);
window.EV = EV; window.DUR = DUR; window.render = render;
window.SUBS = lines.map((l, i) => { const ws = words[l.id], t0 = VO[l.id] - .05, nx = lines[i + 1] ? VO[lines[i + 1].id] - .05 : DUR; return { t0, t1: Math.max(Math.min(VO[l.id] + ws[ws.length - 1][2] + .6, nx), t0 + 1.8), text: l.sub || l.text }; });
render(+(new URLSearchParams(location.search).get('t') ?? .5));
window.READY = true;
