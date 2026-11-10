// "What If Earth Stopped Spinning?" — flat-vector explainer, vertical 1080×1920, canvas 2D, deterministic in t.
// Beyond Everything brand style (kit.js shared with the Moon, Earth Rings and Far Future films). Seventeen beats, one per
// line: the hook (Earth hits the brakes, you don't), the speed at the equator, the sudden stop, people, houses, air and
// sea thrown east, the still planet (six-month days, a baked side and a frozen side, polar oceans, a thinner shield),
// the relief, the real slow-down, the Moon as the brake, and back to the street. The last frame loops into the first.
import * as K from './kit.js';
import { clamp, lerp, seg, ss, eio, eo, mulberry, TAU } from '/core/lib.js';
const { P, text, sparkle, glow, card, bubble, pop } = K;

const W = 1080, H = 1920, CX = W / 2;
const cv = document.getElementById('c'), g = cv.getContext('2d');
K.setup(g, W, H); K.makeStars(110, 5);
await document.fonts.load('900 80px NU'); await document.fonts.load('800 40px NU');
const words = await (await fetch('voices/words.json')).json();
const lines = await (await fetch('lines.json')).json();
const dur = await (await fetch('voices/dur.json')).json();

// ───────── timeline: one scene per line
const IDS = lines.map(l => l.id), VO = {};
{ let t = .2; for (const id of IDS) { VO[id] = +t.toFixed(3); t += dur[id] + (id === 'l03' ? .6 : .45); } }
const LAST = IDS[IDS.length - 1], DUR = +(VO[LAST] + dur[LAST] + 1.4).toFixed(2);
const nrm = s => s.toLowerCase().replace(/[^a-z0-9]/g, '');
const at = (id, w, k = 0, e = 1) => { let n = 0; for (const x of words[id]) if (nrm(x[0]).startsWith(nrm(w)) && n++ === k) return VO[id] + Math.max(0, x[e]); throw new Error(`${w} in ${id}`); };
const S = [0, ...IDS.slice(1).map(id => VO[id] - .3), DUR];
const sceneAt = t => { let i = 0; while (i < S.length - 2 && t >= S[i + 1]) i++; return i; };
const XF = .45;                                                    // crossfade between scenes
const LOOP = .7;                                                   // the last LOOP s dissolve into the first frame
const T = {
  wouldnt: at('l01', 'wouldn'),
  moving: at('l02', 'moving'), equator: at('l02', 'equator'), speed: at('l02', '1600'),
  feel: at('l03', 'feel'), everything: at('l03', 'everything'),
  stop: at('l04', 'stopped'), second: at('l04', 'second'), allgo: at('l04', 'all'),
  you5: VO.l05, house: at('l05', 'house'), trees: at('l05', 'trees'), rock: at('l05', 'rock'), east: at('l05', 'east'),
  air: at('l06', 'air'), wind: at('l06', 'wind'), tornado: at('l06', 'tornado'), most: at('l06', 'most'),
  oceans: at('l07', 'oceans'), crash: at('l07', 'crashing'),
  survived: at('l08', 'survived'), still: at('l08', 'still'),
  sunrise: at('l09', 'sunrise'), daylight: at('l09', 'daylight'), night: at('l09', 'night'),
  bakes: at('l10', 'bakes'), freezes: at('l10', 'freezes'),
  move: at('l11', 'move'), bulge: at('l11', 'bulge'), piles: at('l11', 'piles'),
  drains: at('l12', 'drains'), poles: at('l12', 'poles'), continent: at('l12', 'continent'),
  shield: at('l13', 'shield'), weaken: at('l13', 'weaken'), radiation: at('l13', 'radiation'),
  good: at('l14', 'good'), fast: at('l14', 'fast'),
  weird: at('l15', 'weird'), slowing: at('l15', 'slowing'), century: at('l15', 'century'), longer: at('l15', 'longer'),
  braking: at('l16', 'breaking'), moon: at('l16', 'moon'), same: at('l16', 'same'), leaving: at('l16', 'leaving'),
  worry: at('l17', 'worry'), billions: at('l17', 'billions'), hold: at('l17', 'hold'),
};

// ───────── props for this film
const SKIN = P.skin;
// a standing person. o.rot (whole body), o.arms: 'down' | 'up' | 'flail' | 'hold' | 'wave', o.legs: 'stand' | 'kick'
function stander(x, y, s, t, o = {}) {
  g.save(); g.translate(x, y); g.rotate(o.rot || 0); g.scale(s, s);
  const kick = o.legs === 'kick' ? Math.sin(t * 14) : 0;
  g.strokeStyle = P.jeans; g.lineWidth = 46; g.lineCap = 'round';
  for (const sd of [-1, 1]) { g.beginPath(); g.moveTo(sd * 24, -170); g.lineTo(sd * (30 + kick * sd * 30), -20 + Math.abs(kick) * -20); g.stroke(); }
  g.fillStyle = P.white; for (const sd of [-1, 1]) { g.beginPath(); g.roundRect(sd * (30 + kick * sd * 30) - 26 + sd * 12, -30 + Math.abs(kick) * -20, 62, 32, 14); g.fill(); }
  g.fillStyle = P.hood; g.beginPath(); g.roundRect(-75, -400, 150, 250, 60); g.fill();
  g.fillStyle = P.hoodD; g.beginPath(); g.roundRect(-75, -400, 50, 250, [60, 0, 0, 60]); g.fill();
  // arms
  g.strokeStyle = P.hood; g.lineWidth = 40;
  const arm = (sd, ex, ey, hx, hy) => { g.strokeStyle = P.hood; g.beginPath(); g.moveTo(sd * 60, -360); g.quadraticCurveTo(ex, ey, hx, hy); g.stroke(); g.fillStyle = SKIN; g.beginPath(); g.arc(hx, hy, 24, 0, TAU); g.fill(); };
  const mode = o.arms || 'down';
  if (mode === 'up' || mode === 'flail') { const f = mode === 'flail' ? Math.sin(t * 12) * 30 : 0; arm(-1, -130, -460, -150 + f, -560 - f); arm(1, 130, -460, 150 - f, -560 + f); }
  else if (mode === 'hold') { arm(-1, 50, -330, 95, -340); arm(1, 120, -380, 95, -400); }
  else if (mode === 'wave') { const a = Math.sin(t * 9) * 30; arm(-1, -100, -260, -90, -190); arm(1, 150, -420, 170 + a, -540); }
  else { arm(-1, -100, -260, -95, -190); arm(1, 100, -260, 95, -190); }
  const hy = -470 + Math.sin(t * 1.3) * 2;
  g.fillStyle = SKIN; g.beginPath(); g.arc(0, hy, 68, 0, TAU); g.fill();
  g.fillStyle = P.hair; g.beginPath(); g.arc(0, hy - 14, 70, Math.PI * 1.02, Math.PI * 1.98); g.fill(); g.beginPath(); g.ellipse(-46, hy - 40, 38, 28, -.5, 0, TAU); g.fill();
  g.save(); g.translate(0, hy + 10); K.face(58, o.mood || 'happy', t, o.look ?? 0, 2.1, o.lookY ?? 0); g.restore();
  g.restore();
}
function house(x, y, s, rot = 0) {
  g.save(); g.translate(x, y); g.rotate(rot); g.scale(s, s);
  g.fillStyle = '#ffe2b8'; g.fillRect(-150, -220, 300, 220);
  g.fillStyle = '#f4c98f'; g.fillRect(60, -220, 90, 220);
  g.fillStyle = P.brick; g.beginPath(); g.moveTo(-185, -210); g.lineTo(0, -360); g.lineTo(185, -210); g.closePath(); g.fill();
  g.fillStyle = P.brickD; g.beginPath(); g.moveTo(0, -360); g.lineTo(185, -210); g.lineTo(90, -210); g.closePath(); g.fill();
  g.fillStyle = '#5a3a8a'; g.beginPath(); g.roundRect(-40, -120, 80, 120, [30, 30, 0, 0]); g.fill();
  g.fillStyle = '#7fd3ff'; for (const wx of [-115, 75]) { g.fillRect(wx, -170, 60, 55); } g.fillStyle = P.white; for (const wx of [-115, 75]) { g.fillRect(wx + 27, -170, 6, 55); g.fillRect(wx, -146, 60, 6); }
  g.restore();
}
function tree(x, y, s, rot = 0, t = 0) {
  g.save(); g.translate(x, y); g.rotate(rot); g.scale(s, s);
  g.fillStyle = P.brown; g.beginPath(); g.roundRect(-18, -140, 36, 140, 10); g.fill();
  const sw = Math.sin(t * 2) * 4;
  for (const [cx, cy, r, c] of [[-40 + sw, -170, 70, '#3fa35e'], [40 + sw, -175, 72, '#3fa35e'], [sw, -235, 85, P.land], [-25 + sw, -200, 50, '#7be093']]) { g.fillStyle = c; g.beginPath(); g.arc(cx, cy, r, 0, TAU); g.fill(); }
  g.restore();
}
function cloud(x, y, s, a = 1) {
  g.save(); g.globalAlpha *= a; g.translate(x, y); g.scale(s, s); g.fillStyle = P.white;
  for (const [cx, cy, r] of [[-70, 10, 45], [-20, -15, 60], [45, 0, 50], [85, 15, 35]]) { g.beginPath(); g.arc(cx, cy, r, 0, TAU); g.fill(); }
  g.fillRect(-110, 10, 230, 40); g.restore();
}
function lamppost(x, y, s) {
  g.save(); g.translate(x, y); g.scale(s, s);
  g.fillStyle = '#3c3a6a'; g.fillRect(-14, -560, 28, 560); g.fillRect(-40, -20, 80, 20);
  g.beginPath(); g.moveTo(-14, -560); g.quadraticCurveTo(0, -620, 80, -610); g.lineTo(80, -590); g.quadraticCurveTo(10, -600, 14, -560); g.fill();
  g.fillStyle = '#ffe58a'; g.beginPath(); g.ellipse(85, -580, 40, 18, 0, 0, Math.PI); g.fill();
  g.restore();
}
function stopSign(x, y, s, rot = 0) {
  g.save(); g.translate(x, y); g.rotate(rot); g.scale(s, s);
  g.fillStyle = '#c9ced9'; g.fillRect(-9, 0, 18, 260);
  g.fillStyle = P.white; g.beginPath(); for (let i = 0; i < 8; i++) { const a = (i + .5) / 8 * TAU; g.lineTo(Math.cos(a) * 118, Math.sin(a) * 118); } g.closePath(); g.fill();
  g.fillStyle = '#e8304f'; g.beginPath(); for (let i = 0; i < 8; i++) { const a = (i + .5) / 8 * TAU; g.lineTo(Math.cos(a) * 104, Math.sin(a) * 104); } g.closePath(); g.fill();
  g.restore(); g.save(); g.translate(x, y); g.rotate(rot); text('STOP', 0, 22 * s, 64 * s, P.white, 1000, null, 0); g.restore();
}
function screech(x, y, r, a, t) {                                  // speed / brake lines on one side of a body
  if (a <= 0) return; g.save(); g.globalAlpha *= a; g.strokeStyle = P.white; g.lineWidth = 10; g.lineCap = 'round';
  for (let i = 0; i < 5; i++) { const yy = y - r * .6 + i * r * .3, j = Math.sin(t * 30 + i) * 8; g.beginPath(); g.moveTo(x - r - 40 - j, yy); g.lineTo(x - r - 140 - i % 2 * 50 - j, yy); g.stroke(); }
  g.restore();
}
function thermo(x, y, lvl, col, a = 1) {                           // a thermometer, lvl 0..1
  if (a <= 0) return; g.save(); g.globalAlpha *= a; g.translate(x, y);
  g.fillStyle = P.white; g.beginPath(); g.roundRect(-26, -230, 52, 230, 26); g.fill(); g.beginPath(); g.arc(0, 20, 46, 0, TAU); g.fill();
  g.fillStyle = col; g.beginPath(); g.arc(0, 20, 34, 0, TAU); g.fill(); const h = 30 + 180 * lvl; g.beginPath(); g.roundRect(-13, 10 - h, 26, h, 13); g.fill();
  g.strokeStyle = 'rgba(23,22,63,.35)'; g.lineWidth = 4; for (let i = 0; i < 5; i++) { g.beginPath(); g.moveTo(14, -200 + i * 40); g.lineTo(26, -200 + i * 40); g.stroke(); }
  g.restore();
}
function tornado(x, y, s, t, a = 1) {
  if (a <= 0) return; g.save(); g.globalAlpha *= a; g.translate(x, y); g.scale(s, s);
  for (let i = 0; i < 7; i++) { const yy = -i * 38, w = 26 + i * 20, sw = Math.sin(t * 6 + i * .8) * 10; g.fillStyle = i % 2 ? '#9aa0c0' : '#b9bfdc'; g.beginPath(); g.ellipse(sw, yy, w, 16, 0, 0, TAU); g.fill(); }
  g.restore();
}
function sky(top = '#5cc4f2', bot = '#bfe9ff') { const gr = g.createLinearGradient(0, 0, 0, 1400); gr.addColorStop(0, top); gr.addColorStop(1, bot); g.fillStyle = gr; g.fillRect(0, 0, W, H); }
function ground(y = 1420, night = 0) {
  g.fillStyle = night ? '#24305e' : HILL; g.fillRect(0, y, W, H - y);
  g.fillStyle = night ? '#1a2248' : '#8c8aa8'; g.fillRect(0, y + 40, W, 120);                  // the road
  g.fillStyle = night ? 'rgba(255,255,255,.25)' : 'rgba(255,255,255,.8)'; for (let i = 0; i < 6; i++) g.fillRect(40 + i * 190, y + 94, 100, 12);
  g.fillStyle = night ? '#1b2650' : HILLD; g.fillRect(0, y + 160, W, H - y - 160);
}
const HILL = '#3fa866', HILLD = '#2d8a52';
function city(y, a = 1, col = '#8fc9ec') {
  g.save(); g.globalAlpha *= a; g.fillStyle = col;
  for (const [x, w, h] of [[0, 120, 260], [110, 90, 380], [200, 140, 220], [330, 80, 320], [600, 110, 300], [700, 150, 420], [840, 90, 250], [920, 160, 340]]) g.fillRect(x, y - h, w, h);
  g.restore();
}
// Earth with a small arm holding a stop sign (the hook and the stop)
function earthStop(x, y, r, t, mood, o = {}) {
  const sx = x - r * 1.25, sy = y - r * .35, sk = o.sign ?? 1;
  if (sk > 0) { g.save(); g.globalAlpha *= sk; g.strokeStyle = '#4fa3f0'; g.lineWidth = r * .14; g.lineCap = 'round'; g.beginPath(); g.moveTo(x - r * .8, y + r * .2); g.quadraticCurveTo(x - r * 1.2, y + r * .3, sx, sy + r * .55); g.stroke(); g.restore(); stopSign(sx, sy, r / 260 * sk, -.15); }
  screech(x, y, r, o.screech || 0, t);
  K.earth(x + (o.shake ? Math.sin(t * 50) * o.shake : 0), y, r, t, mood, { rot: o.rot, look: o.look || 0, lookY: o.lookY || 0 });
}
// a pill tag
function tag(x, y, s, sub, k, col = P.gold) {
  if (k <= 0) return; g.save(); g.font = '1000 76px NU'; const w = Math.max(560, g.measureText(s).width + 120); g.translate(x, y); g.scale(k, k); card(0, 0, w, sub ? 180 : 120, 1);
  text(s, 0, sub ? 8 : 22, 76, col, 1000, null, 0); if (sub) text(sub, 0, 62, 40, P.white, 800, null, 0); g.restore();
}
// K.bg resets globalAlpha; this keeps a scene's fade-in during the crossfade
const bg = (t, top = P.bg0, bot = P.bg1, a = 1) => K.bg(t, top, bot, a * g.globalAlpha);
const dashArrow = (x0, y0, x1, y1, a, col = P.gold, w = 14) => K.arrow(x0, y0, x1, y1, col, w, a);

// Earth's spin angle: steady, frozen at the stop, still for the "still planet" beats, then spinning again
function spin(t) {
  if (t < T.stop + .15) return t * .9;
  if (t < VO.l14 + 1) return (T.stop + .15) * .9;
  return (T.stop + .15) * .9 + (t - VO.l14 - 1) * .7 * ss(clamp((t - VO.l14 - 1) / 1.5));
}

// ───────── scenes
const SC = [];
SC[0] = (t) => {                                                   // hook: Earth slams the brakes, you don't
  sky(); city(1430, .7);
  earthStop(690, 760, 210, t, 'annoyed', { rot: 1.2, screech: 1, look: -.8, lookY: .6 });
  ground();
  lamppost(170, 1440, .9);
  const fly = ss(seg(t, T.wouldnt - .3, T.wouldnt + 1.2)), lift = .25 + .75 * fly;
  stander(lerp(470, 1200, eio(fly)), 1440 - lift * 130 - fly * 280, .62, t, { mood: 'scared', arms: 'flail', legs: 'kick', rot: .12 + fly * .9, lookY: -.5 });
  g.save(); g.translate(CX, 240); text('WHAT IF EARTH', 0, -10, 88, P.white, 1000, P.navy, 16); text('STOPPED SPINNING?', 0, 100, 96, P.gold, 1000, P.navy, 18); g.restore();
};
SC[1] = (t) => {                                                   // zoom out to the spinning Earth; the speed tag at the equator
  bg(t);
  const z = eio(seg(t, VO.l02 - .3, T.moving + .3)), r = lerp(900, 300, z), y = lerp(1500, 980, z);
  K.earth(CX, y, r, t, 'happy', { rot: spin(t), look: -.3 });
  const ke = ss(seg(t, T.equator - .2, T.equator + .4));
  if (ke > 0) { g.save(); g.globalAlpha = ke; g.setLineDash([18, 14]); g.strokeStyle = P.gold; g.lineWidth = 7; g.beginPath(); g.ellipse(CX, y, r, r * .12, 0, 0, Math.PI); g.stroke(); g.restore();
    const ph = (t * .5) % 1, px = CX + Math.sin(lerp(-1.3, 1.3, ph)) * r, py = y + Math.cos(lerp(-1.3, 1.3, ph)) * r * .12;
    glow(px, py, 40, '255,210,120', .9); g.fillStyle = P.gold; g.beginPath(); g.arc(px, py, 14, 0, TAU); g.fill();
    dashArrow(CX + 120, y + r * .12 + 70, CX + 320, y + r * .12 + 40, ke); }
  tag(CX, 460, '1,600 km/h', '(about 1,000 mph)', pop(t, T.speed - .1));
  const kq = ss(seg(t, T.equator - .2, T.equator + .3)); if (kq > 0) text('equator', CX - 300, y + 30, 46, P.gold, 1000, P.navy, 10, 'center', kq * (1 - ss(seg(t, T.speed - .3, T.speed))));
};
SC[2] = (t) => {                                                   // everything moves with you
  sky(); const dx = (t * 30) % 300;
  for (let i = -1; i < 5; i++) cloud(i * 300 + dx - 100, 330 + (i % 2) * 70, .9, .9);
  city(1430, .7);
  ground();
  house(800, 1440, .95); tree(250, 1440, 1.0, 0, t);
  stander(520, 1440, .62, t, { mood: t > T.feel ? 'sleepy' : 'happy', arms: 'down', look: .4 });
  const it = [[520, 1000], [800, 1010], [250, 1060], [300 + dx - 100, 230], [900 + dx - 100 - 300, 300]];
  it.forEach(([x, y], i) => { const k = pop(t, T.everything - .2 + i * .12); if (k > 0) { g.save(); g.translate(x, y); g.scale(k, k); K.arrow(-60, 0, 60, 0, P.gold, 14, 1); g.restore(); } });
  const kb = pop(t, T.feel); if (kb > 0) bubble(330, 920, 300, 90, 'feel nothing', kb, P.navy, 1);
  const kt = ss(seg(t, T.everything + .5, T.everything + .9)); if (kt > 0) text('all moving together', CX, 560, 56, P.white, 1000, P.navy, 12, 'center', kt);
};
SC[3] = (t) => {                                                   // the sudden stop: freeze frame, a one-second clock
  const stopK = t > T.stop + .15 ? 1 : 0;
  bg(t);
  const sh = stopK * Math.max(0, 1 - (t - T.stop - .15) / .6) * 14;
  earthStop(CX + 60, 1000, 300, t, stopK ? 'scared' : 'happy', { rot: spin(t), sign: ss(seg(t, T.stop - .3, T.stop + .1)), screech: stopK * (1 - ss(seg(t, T.stop + .6, T.stop + 1.4))), shake: sh, look: -.4 });
  if (t > T.stop + .15 && t < T.stop + .3) { g.fillStyle = 'rgba(255,255,255,.55)'; g.fillRect(0, 0, W, H); }
  const kc = pop(t, T.second - .2); if (kc > 0) { g.save(); g.translate(CX, 460); g.scale(kc, kc); card(0, 0, 420, 170, 1); text('0:01', 0, 34, 110, P.red, 1000, null, 0); g.restore(); }
  const ka = ss(seg(t, T.allgo - .1, T.allgo + .4));
  if (ka > 0) for (let i = 0; i < 4; i++) { const yy = 820 + i * 120; dashArrow(CX + 400 - 80, yy, CX + 490, yy - 20, ka * (.6 + .4 * Math.sin(t * 8 + i))); }
};
SC[4] = (t) => {                                                   // you, your house, the trees: thrown east; only rock stays
  sky(); city(1430, .7);
  // ground cut-away: the bedrock shows up on "rock"
  ground();
  const kr = ss(seg(t, T.rock - .3, T.rock + .2));
  if (kr > 0) { g.save(); g.globalAlpha = kr; g.fillStyle = '#6b5a8a'; g.fillRect(0, 1600, W, 320); g.fillStyle = '#58487a'; for (let i = 0; i < 9; i++) { g.beginPath(); g.arc(60 + i * 125, 1660 + (i % 3) * 70, 34, 0, TAU); g.fill(); } g.restore(); text('solid rock stays', CX, 1390, 48, P.white, 1000, P.navy, 10, 'center', kr * (1 - ss(seg(t, T.east + .4, T.east + .8)))); }
  const fl = (t0) => ss(seg(t, t0 - .2, t0 + 2.2));
  // more of the town, from further west, keeps flying past
  for (let i = 0; i < 9; i++) { const R = mulberry(i + 200), t0 = T.trees + .3 + i * .42, u = seg(t, t0, t0 + 1.9); if (u <= 0 || u >= 1) continue;
    const x = lerp(-250, 1350, u), y = 1300 - R() * 700 - Math.sin(u * Math.PI) * 150, k = i % 3, rot = u * (2 + R() * 3) * (R() < .5 ? 1 : -1);
    if (k === 0) house(x, y, .35 + R() * .2, rot); else if (k === 1) tree(x, y, .45 + R() * .3, rot, t); else stander(x, y, .3 + R() * .1, t, { mood: 'scared', arms: 'flail', legs: 'kick', rot }); }
  const fh = fl(T.house), ft = fl(T.trees), fy = fl(T.you5 + .1);
  house(lerp(760, 1500, eio(fh)), 1440 - Math.sin(fh * Math.PI) * 280, .85, fh * 1.1);
  tree(lerp(200, 1450, eio(ft)), 1440 - Math.sin(ft * Math.PI) * 320, .9, ft * 1.6, t);
  tree(lerp(370, 1500, eio(fl(T.trees + .15))), 1440 - Math.sin(fl(T.trees + .15) * Math.PI) * 220, .7, fl(T.trees + .15) * 1.9, t);
  stander(lerp(520, 1350, eio(fy)), 1440 - Math.sin(fy * Math.PI) * 420 - fy * 100, .6, t, { mood: 'scared', arms: 'flail', legs: 'kick', rot: fy * 2.2 });
  // the house's empty foundation
  if (fh > .1) { g.fillStyle = '#6f6a8f'; g.fillRect(640, 1430, 240, 20); }
  const ke = pop(t, T.east - .2); if (ke > 0) { g.save(); g.translate(CX, 520); g.scale(ke, ke); K.arrow(-240, 0, 240, 0, P.gold, 34, 1); text('EAST', 0, -60, 90, P.gold, 1000, P.navy, 16); g.restore(); }
};
SC[5] = (t) => {                                                   // the air keeps going: a wind faster than any tornado
  sky('#8fb8d8', '#d8ecf6'); city(1430, .6, '#a6c4dc');
  ground();
  const kw = ss(seg(t, T.wind - .4, T.wind + .3)), wx = lerp(-700, 1500, ss(seg(t, T.wind - .3, T.most + .6)));
  // the wind: streaks sweeping right
  g.save(); g.strokeStyle = 'rgba(255,255,255,.85)'; g.lineCap = 'round';
  for (let i = 0; i < 26; i++) { const R = mulberry(i + 40), y = 300 + R() * 1100, len = 160 + R() * 260, x = ((t * (1800 + R() * 900) + R() * 2000) % 2400) - 600; g.globalAlpha = (.25 + .5 * R()) * kw; g.lineWidth = 6 + R() * 10; g.beginPath(); g.moveTo(x, y); g.lineTo(x + len, y + Math.sin(t * 3 + i) * 10); g.stroke(); }
  g.restore();
  const kair = ss(seg(t, T.air - .2, T.air + .3));
  for (let i = 0; i < 3; i++) cloud(lerp(200 + i * 300, 1600 + i * 300, ss(seg(t, T.wind - .2 + i * .1, T.wind + 1.4))), 380 + i * 90, .8, kair);
  // the tornado stays behind
  const kt = ss(seg(t, T.tornado - .3, T.tornado + .2)); tornado(230, 1430, 1.1, t, kt);
  if (kt > 0) text('tornado', 230, 1520, 44, P.white, 1000, P.navy, 10, 'center', kt);
  if (kw > 0) { g.save(); g.globalAlpha = kw * .35; const gr = g.createLinearGradient(wx - 400, 0, wx, 0); gr.addColorStop(0, 'rgba(255,255,255,0)'); gr.addColorStop(1, 'rgba(255,255,255,.9)'); g.fillStyle = gr; g.fillRect(wx - 400, 0, 400, 1440); g.restore(); }
  tree(760, 1440, .9, -.25 * kw + Math.sin(t * 10) * .05 * kw, t);
  const kx = pop(t, T.tornado + .3); if (kx > 0) { g.save(); g.translate(720, 560); g.scale(kx, kx); card(0, 0, 440, 210, 1); text('×3', 0, 10, 120, P.gold, 1000, null, 0); text('faster than the worst', 0, 66, 34, P.white, 800, null, 0); g.restore(); }
  const km = ss(seg(t, T.most - .1, T.most + .3)); if (km > 0) text('across most of the planet', CX, 1000, 50, P.white, 1000, P.navy, 12, 'center', km);
};
SC[6] = (t) => {                                                   // the oceans keep going: the sea rolls sideways over the coast
  sky('#7fc8f0', '#d6f0ff');
  const sea = '#3d8be8', seaD = '#2a63b8';
  // beach and the land behind it, east to the right
  g.fillStyle = '#ffe0a3'; g.beginPath(); g.moveTo(0, 1360); g.quadraticCurveTo(500, 1300, W, 1260); g.lineTo(W, H); g.lineTo(0, H); g.fill();
  g.fillStyle = HILL; g.beginPath(); g.moveTo(560, 1300); g.quadraticCurveTo(800, 1240, W, 1230); g.lineTo(W, H); g.lineTo(560, H); g.fill();
  house(880, 1250, .55); tree(680, 1290, .6, 0, t);
  // umbrella
  g.save(); g.translate(330, 1370); g.strokeStyle = '#8a6a4a'; g.lineWidth = 10; g.beginPath(); g.moveTo(0, 0); g.lineTo(0, -180); g.stroke();
  g.fillStyle = P.red; g.beginPath(); g.arc(0, -180, 120, Math.PI, TAU); g.fill(); g.fillStyle = P.white; g.beginPath(); g.moveTo(0, -300); g.lineTo(-40, -180); g.lineTo(40, -180); g.fill(); g.restore();
  // the sea: a calm strip on the left, then a sideways surge
  const ks = ss(seg(t, T.oceans - .2, T.crash + 1.4)), front = lerp(160, 900, ks), crest = 170 + 150 * ss(seg(t, T.oceans, T.crash));
  g.fillStyle = seaD; g.beginPath(); g.moveTo(0, 1300 - crest * .6); g.lineTo(front - 120, 1320 - crest); g.quadraticCurveTo(front + 80, 1330 - crest, front, 1360 - crest * .3); g.quadraticCurveTo(front + 40, 1380, front - 20, 1400); g.lineTo(front - 20, H); g.lineTo(0, H); g.fill();
  g.fillStyle = sea; g.beginPath(); g.moveTo(0, 1360 - crest * .5); g.lineTo(front - 200, 1370 - crest * .8); g.quadraticCurveTo(front - 20, 1380 - crest * .8, front - 60, 1420 - crest * .2); g.lineTo(front - 60, H); g.lineTo(0, H); g.fill();
  g.fillStyle = P.white; for (let i = 0; i < 6; i++) { const R = mulberry(i + 3); g.beginPath(); g.arc(front - 40 - R() * 140, 1340 - crest + R() * 80 + Math.sin(t * 6 + i) * 8, 16 + R() * 18, 0, TAU); g.fill(); }
  const ka = ss(seg(t, T.oceans - .1, T.oceans + .3)); if (ka > 0) { K.arrow(front - 380, 1050 - crest * .3, front - 120, 1050 - crest * .3, P.gold, 22, ka); }
  const kc = pop(t, T.crash); if (kc > 0) { g.save(); g.translate(CX + 120, 520); g.scale(kc, kc); g.rotate(-.1); text('SPLASH!', 0, 0, 120, P.cyan, 1000, P.white, 14); g.restore(); }
};
SC[7] = (t) => {                                                   // calm after the storm; Earth dazed
  bg(t);
  K.earth(CX, 1020, 280, t, t > T.still - .2 ? 'worried' : 'sleepy', { rot: spin(t), look: Math.sin(t * 1.6) * .8 });
  for (let i = 0; i < 3; i++) { const a = t * 2.4 + i * TAU / 3; sparkle(CX + Math.cos(a) * 200, 700 + Math.sin(a) * 40, 22, P.gold, 1 - ss(seg(t, T.still - .5, T.still))); }
  const kq = pop(t, T.still - .1); if (kq > 0) { g.save(); g.translate(CX, 470); g.scale(kq, kq); text('A STILL PLANET?', 0, 0, 100, P.gold, 1000, P.navy, 16); g.restore(); }
  const ks = ss(seg(t, T.survived - .2, T.survived + .3)) * (1 - ss(seg(t, T.still - .5, T.still))); if (ks > 0) bubble(CX + 260, 680, 260, 90, 'I survived?', ks, P.navy, -1);
};
SC[8] = (t) => {                                                   // one sunrise a year: the Sun crawls, a calendar flips, then night
  const nk = ss(seg(t, T.night - .4, T.night + .3));
  const day = ss(seg(t, VO.l09 - .2, T.night - .4)), su = lerp(.04, .96, day);
  sky(nk > 0 ? `rgb(${lerp(92, 9, nk)},${lerp(196, 7, nk)},${lerp(242, 38, nk)})` : '#5cc4f2', nk > 0 ? `rgb(${lerp(191, 39, nk)},${lerp(233, 26, nk)},${lerp(255, 102, nk)})` : '#bfe9ff');
  if (nk > 0) bg(t, P.bg0, P.bg1, nk);
  // the Sun's slow arc across the sky (rises at the left, sets at the right)
  const sx = lerp(80, 1000, su), sy = 1300 - Math.sin(su * Math.PI) * 950;
  if (nk < 1) { g.save(); g.globalAlpha = 1 - nk; K.sunBody(sx, sy, 80, t); g.restore(); }
  g.save(); g.globalAlpha = .5 * (1 - nk); g.setLineDash([16, 18]); g.strokeStyle = P.white; g.lineWidth = 6; g.beginPath(); for (let k = 0; k <= 30; k++) { const u = lerp(.04, .96, k / 30); g.lineTo(lerp(80, 1000, u), 1300 - Math.sin(u * Math.PI) * 950); } g.stroke(); g.restore();
  city(1430, 1, nk > .5 ? '#2a2f66' : '#8fc9ec'); ground(1420, nk);
  stander(CX, 1440, .55, t, { mood: nk > .5 ? 'sleepy' : 'happy', arms: 'down', look: lerp(-1, 1, su), lookY: -.6 });
  // calendar
  const M = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'];
  const mi = Math.min(11, Math.floor(day * 6 + ss(seg(t, T.night, T.night + 2.4)) * 6));
  const kc = ss(seg(t, VO.l09, VO.l09 + .3)); if (kc > 0) { g.save(); g.globalAlpha = kc; g.translate(850, 760); g.fillStyle = P.white; g.beginPath(); g.roundRect(-110, -100, 220, 210, 24); g.fill(); g.fillStyle = P.red; g.beginPath(); g.roundRect(-110, -100, 220, 70, [24, 24, 0, 0]); g.fill(); text(M[mi], 0, -48, 46, P.white, 1000, null, 0); if (nk > .5) { g.fillStyle = '#5b6cff'; g.beginPath(); g.arc(0, 40, 46, 0, TAU); g.fill(); g.fillStyle = P.white; g.beginPath(); g.arc(20, 26, 42, 0, TAU); g.fill(); } else { g.fillStyle = '#ff9a2e'; g.beginPath(); g.arc(0, 40, 40, 0, TAU); g.fill(); } g.restore(); }
  const k1 = pop(t, T.sunrise - .1) * (1 - ss(seg(t, T.daylight - .5, T.daylight - .2))); if (k1 > 0) tag(CX, 300, '1 SUNRISE', 'a year', k1);
  const k2 = pop(t, T.daylight - .1) * (1 - nk); if (k2 > 0) tag(CX, 300, '6 MONTHS', 'of daylight', k2);
  const k3 = pop(t, T.night); if (k3 > 0) tag(CX, 300, '6 MONTHS', 'of night', k3, '#9fb0ff');
};
SC[9] = (t) => {                                                   // the day side bakes, the night side freezes
  bg(t);
  K.sunChar(-40, 1000, 170, t, { mood: 'happy' }); glow(-40, 1000, 640, '255,200,100', .2);
  const r = 300, x = CX + 110, y = 1000, kb = ss(seg(t, T.bakes - .3, T.bakes + .4)), kf = ss(seg(t, T.freezes - .3, T.freezes + .4));
  K.earth(x, y, r, t, kf > .5 ? 'worried' : (kb > .5 ? 'annoyed' : 'happy'), { rot: spin(t), look: -.4, noFace: false });
  g.save(); g.beginPath(); g.arc(x, y, r, 0, TAU); g.clip();
  g.fillStyle = `rgba(255,120,40,${.55 * kb})`; g.fillRect(x - r, y - r, r, 2 * r);
  g.fillStyle = `rgba(150,220,255,${.6 * kf})`; g.fillRect(x, y - r, r, 2 * r);
  g.fillStyle = `rgba(10,10,60,${.35 * kf})`; g.fillRect(x, y - r, r, 2 * r);
  if (kf > 0) for (let i = 0; i < 6; i++) { const R = mulberry(i + 5); g.fillStyle = `rgba(255,255,255,${.85 * kf})`; g.beginPath(); g.ellipse(x + 40 + R() * 220, y - 220 + R() * 440, 30 + R() * 40, 14 + R() * 10, 0, 0, TAU); g.fill(); }
  g.restore();
  K.face(r, kf > .5 ? 'scared' : (kb > .5 ? 'annoyed' : 'happy'), t, 0, .7);
  if (kb > 0) { g.save(); g.globalAlpha = kb * .8; g.strokeStyle = '#ffb36a'; g.lineWidth = 8; g.lineCap = 'round'; for (let i = 0; i < 3; i++) { const xx = x - r - 40 + i * 50; g.beginPath(); for (let k = 0; k < 12; k++) g.lineTo(xx + Math.sin(t * 8 + k + i) * 10, y - 420 + k * 18); g.stroke(); } g.restore(); }
  g.save(); g.translate(x, y); g.strokeStyle = 'rgba(255,255,255,.6)'; g.lineWidth = 4; g.setLineDash([12, 10]); g.beginPath(); g.moveTo(0, -r - 20); g.lineTo(0, r + 20); g.stroke(); g.restore();
  thermo(260, 560, ss(seg(t, T.bakes - .2, T.bakes + .8)), P.red, kb); if (kb > 0) text('DAY SIDE', 260, 700, 48, '#ffb36a', 1000, P.navy, 10, 'center', kb);
  thermo(860, 560, 1 - ss(seg(t, T.freezes - .2, T.freezes + .8)) * .95, P.cyan, kf); if (kf > 0) text('NIGHT SIDE', 860, 700, 48, P.cyan, 1000, P.navy, 10, 'center', kf);
};
// a planet with oceans as bands: belt (0..1) = water piled at the equator, drain (0..1) = water at the poles, land band in between
function bandEarth(x, y, r, t, o = {}) {
  const sq = o.squash || 0, rx = r * (1 + sq), ry = r * (1 - sq * .7);
  g.save(); g.translate(x, y);
  glow(0, 0, r * 1.45, '90,170,255', .28);
  g.beginPath(); g.ellipse(0, 0, rx, ry, 0, 0, TAU); g.save(); g.clip();
  g.fillStyle = P.land; g.fillRect(-rx, -ry, 2 * rx, 2 * ry);
  g.fillStyle = '#3fa35e'; for (let i = 0; i < 7; i++) { const R = mulberry(i + 21), a = (R() * TAU + (o.rot || 0)) % TAU, cx = Math.sin(a) * rx; if (Math.cos(a) < 0) continue; g.beginPath(); g.ellipse(cx, (R() - .5) * ry * .6, 50 * Math.cos(a) + 10, 26, 0, 0, TAU); g.fill(); }
  const dr = o.drain || 0, belt = o.belt ?? 1;
  // water at the middle (belt) — shrinks as it drains
  const bh = ry * lerp(.55, 0, dr) * belt; if (bh > 1) { g.fillStyle = P.ocean; g.fillRect(-rx, -bh, 2 * rx, 2 * bh); }
  // the polar oceans grow
  const ph = ry * lerp(.0, .45, dr); if (ph > 1) { g.fillStyle = P.ocean; g.fillRect(-rx, -ry, 2 * rx, ph); g.fillRect(-rx, ry - ph, 2 * rx, ph); }
  g.fillStyle = 'rgba(255,255,255,.9)'; g.beginPath(); g.ellipse(0, -ry * .95, rx * .4, ry * .1, 0, 0, TAU); g.fill();
  g.fillStyle = 'rgba(20,30,90,.28)'; g.beginPath(); g.ellipse(rx * .35, ry * .1, rx * 1.1, ry * 1.1, 0, 0, TAU); g.ellipse(-rx * .15, -ry * .08, rx * 1.02, ry * 1.02, 0, 0, TAU, true); g.fill('evenodd');
  g.restore();
  K.face(Math.min(rx, ry), o.mood || 'happy', t, o.look || 0, .7);
  g.restore();
}
SC[10] = (t) => {                                                  // spinning makes a bulge; the water piles up at the middle
  bg(t);
  const kb = ss(seg(t, T.bulge - .3, T.bulge + .5)), kp = ss(seg(t, T.piles - .3, T.piles + .5));
  bandEarth(CX, 1000, 300, t, { squash: .16 * kb, belt: .35 + .65 * kp, rot: t * .5, mood: 'happy', look: .2 });
  for (const sd of [-1, 1]) K.arrow(CX + sd * 360, 1000, CX + sd * (420 + 40 * kb), 1000, P.gold, 18, kb);
  // spin arrow
  g.save(); g.strokeStyle = P.white; g.lineWidth = 10; g.globalAlpha = .8; g.beginPath(); g.ellipse(CX, 640, 160, 40, 0, .2, Math.PI - .2); g.stroke(); g.restore();
  const kq = pop(t, T.bulge - .1); if (kq > 0) { g.save(); g.translate(CX, 420); g.scale(kq, kq); text('BULGE', 0, 0, 120, P.gold, 1000, P.navy, 16); g.restore(); }
  const kw = ss(seg(t, T.piles, T.piles + .4)); if (kw > 0) text('water piles up here', CX, 1420, 50, P.cyan, 1000, P.navy, 12, 'center', kw);
  if (kb > 0) text('(exaggerated)', CX, 500, 36, '#d8d2e6', 800, P.navy, 8, 'center', kb);
};
SC[11] = (t) => {                                                  // without the spin: two polar oceans and one big continent
  bg(t);
  const kd = ss(seg(t, T.drains - .2, T.poles + .8));
  bandEarth(CX, 1000, 320, t, { squash: .16 * (1 - kd), belt: 1, drain: kd, rot: 0, mood: kd > .8 ? 'keen' : 'worried', look: 0 });
  if (kd > 0 && kd < 1) for (const sd of [-1, 1]) K.arrow(CX + 380, 1000 + sd * 40, CX + 380, 1000 + sd * 260, P.cyan, 16, Math.sin(kd * Math.PI));
  const kp = ss(seg(t, T.poles - .1, T.poles + .4)); if (kp > 0) { text('polar ocean', CX, 620, 46, P.cyan, 1000, P.navy, 10, 'center', kp); text('polar ocean', CX, 1430, 46, P.cyan, 1000, P.navy, 10, 'center', kp); }
  const kc = pop(t, T.continent - .1); if (kc > 0) { g.save(); g.translate(CX, 420); g.scale(kc, kc); card(0, 0, 820, 150, 1); text('ONE HUGE CONTINENT', 0, 24, 70, P.land, 1000, null, 0); g.restore(); }
};
SC[12] = (t) => {                                                  // the magnetic shield thins and the Sun's particles get in
  bg(t);
  const kw = ss(seg(t, T.weaken - .3, T.weaken + .7)), kr = ss(seg(t, T.radiation - .6, T.radiation + .4));
  K.sunChar(-60, 520, 190, t, { mood: 'smug' }); glow(-60, 520, 560, '255,200,100', .18);
  const ex = CX + 160, ey = 1080;
  // field loops
  g.save(); g.strokeStyle = P.cyan; g.lineCap = 'round';
  for (let i = 1; i <= 4; i++) { const s = 180 + i * 70; g.globalAlpha = (.75 - i * .1) * (1 - .75 * kw); g.lineWidth = 9 * (1 - .6 * kw); if (kw > .3) g.setLineDash([30, 24 + 40 * kw]); for (const sd of [-1, 1]) { g.beginPath(); g.ellipse(ex + sd * s * .55, ey, s * .55, s * .9, 0, 0, TAU); g.stroke(); } }
  g.restore();
  const sk = 1 - .7 * kw; if (sk > 0) { g.save(); g.globalAlpha = .18 * sk; g.fillStyle = P.cyan; g.beginPath(); g.ellipse(ex, ey, 470, 420, 0, 0, TAU); g.fill(); g.restore(); }
  // particles from the Sun: deflected at first, then leaking in
  for (let i = 0; i < 22; i++) { const R = mulberry(i + 60), ph = ((t - VO.l13 + 1) * .55 + R()) % 1, y0 = 520 + (R() - .5) * 700, leak = kw > .5 && R() < .2 + .6 * kr;
    let x = lerp(80, ex, ph), y = lerp(y0, ey + (R() - .5) * 300, ph);
    if (!leak && x > ex - 460) { const d = (x - (ex - 460)) / 300; y += Math.sign(y0 - ey + .1) * d * d * 260; }
    if (leak && ph > .92) continue;
    g.fillStyle = leak ? '#ffcf4a' : '#ff9a2e'; g.beginPath(); g.arc(x, y, leak ? 10 : 8, 0, TAU); g.fill(); glow(x, y, 26, '255,190,90', .6); }
  K.earth(ex, ey, 200, t, kw > .5 ? 'worried' : 'happy', { rot: spin(t), look: -.8 });
  const kt = ss(seg(t, T.shield - .2, T.shield + .3)); if (kt > 0) text('magnetic shield', ex, 640, 50, P.cyan, 1000, P.navy, 12, 'center', kt * (1 - kw * .3));
  const kq = pop(t, T.weaken - .1); if (kq > 0) tag(ex - 60, 1580 - 140, 'WEAKER', 'more radiation gets in', kq, P.red);
};
SC[13] = (t) => {                                                  // good news: nothing can stop Earth that fast. Phew.
  bg(t);
  K.earth(CX, 1050, 300, t, t > T.fast ? 'happy' : 'sleepy', { rot: spin(t), look: 0 });
  // spin arrows
  const ks = ss(seg(t, VO.l14 + .6, VO.l14 + 1.4)); if (ks > 0) { g.save(); g.globalAlpha = ks; g.strokeStyle = P.gold; g.lineWidth = 12; g.lineCap = 'round'; g.beginPath(); g.ellipse(CX, 1050, 400, 110, 0, .3, Math.PI - .3); g.stroke(); g.restore(); K.arrow(CX - 330, 1120, CX - 380, 1080, P.gold, 12, ks); }
  const kp = pop(t, T.fast - .1); if (kp > 0) { g.save(); g.translate(CX, 520); g.scale(kp, kp); g.rotate(-.06); text('PHEW', 0, 0, 170, P.gold, 1000, P.navy, 20); g.restore(); }
  const kg = pop(t, T.good - .1) * (1 - ss(seg(t, T.fast - .3, T.fast))); if (kg > 0) tag(CX, 520, 'GOOD NEWS', null, kg, P.land);
};
SC[14] = (t) => {                                                  // weird news: the day is getting longer
  bg(t);
  K.earth(CX, 1150, 240, t, 'sleepy', { rot: spin(t), look: .3 });
  const kw = pop(t, T.weird - .1) * (1 - ss(seg(t, T.slowing - .5, T.slowing - .2))); if (kw > 0) tag(CX, 470, 'WEIRD NEWS', null, kw, P.cyan);
  const ksl = ss(seg(t, T.slowing - .1, T.slowing + .4)) * (1 - ss(seg(t, T.century - .6, T.century - .2))); if (ksl > 0) text('slowing down…', CX, 490, 80, P.white, 1000, P.navy, 14, 'center', ksl);
  const kc = pop(t, T.century - .2);
  if (kc > 0) { g.save(); g.translate(CX, 520); g.scale(kc, kc); card(0, 0, 900, 300, 1);
    text('ONE DAY', 0, -70, 44, '#d8d2e6', 900, null, 0);
    text('24h 00m 00', 70, 30, 80, P.white, 1000, null, 0, 'right');
    const kl = ss(seg(t, T.longer - .8, T.longer)); text('.002s', 70, 30, 80, P.gold, 1000, null, 0, 'left', .35 + .65 * kl);
    text('longer every century', 0, 110, 44, P.gold, 900, null, 0, 'center', ss(seg(t, T.longer - .3, T.longer + .2)));
    g.restore(); }
};
SC[15] = (t) => {                                                  // the Moon is the brake
  bg(t);
  const km = ss(seg(t, T.moon - .4, T.moon + .2)), tug = ss(seg(t, T.moon, T.moon + .8));
  const ex = 360, ey = 1100, r = 220, mx = lerp(1200, 830, eo(km)), my = 600;
  // the tidal bulge (an ocean ellipse pulled toward the Moon)
  const ang = Math.atan2(my - ey, mx - ex);
  if (tug > 0) { g.save(); g.translate(ex, ey); g.rotate(ang + .25); g.globalAlpha = .85 * tug; g.fillStyle = P.ocean; g.beginPath(); g.ellipse(0, 0, r * 1.22, r * 1.02, 0, 0, TAU); g.fill(); g.restore(); }
  K.earth(ex, ey, r, t, tug > .5 ? 'annoyed' : 'worried', { rot: spin(t), look: .9, lookY: -.6 });
  if (tug > 0) { g.save(); g.globalAlpha = tug; g.setLineDash([22, 16]); g.strokeStyle = P.gold; g.lineWidth = 8; g.beginPath(); g.moveTo(mx - 90, my + 60); g.quadraticCurveTo(700, 820, ex + r * 1.1, ey - r * .4); g.stroke(); g.restore(); }
  if (km > 0) { g.save(); g.globalAlpha = km; K.moon(mx, my + Math.sin(t * 1.5) * 8, 120, t, 'worried', { look: -.8, tilt: Math.sin(t * 2) * .05 });
    // a guilty little wave
    g.strokeStyle = P.moonD; g.lineWidth = 22; g.lineCap = 'round'; const wv = Math.sin(t * 8) * .4; g.beginPath(); g.moveTo(mx - 100, my + 40); g.lineTo(mx - 160 + Math.sin(wv) * 30, my - 50); g.stroke(); g.restore(); }
  const kq = pop(t, T.braking - .1) * (1 - ss(seg(t, T.moon - .4, T.moon))); if (kq > 0) { g.save(); g.translate(CX, 480); g.scale(kq, kq); text('WHO\'S BRAKING?', 0, 0, 96, P.gold, 1000, P.navy, 16); g.restore(); }
  const kb = pop(t, T.moon + .4) * (1 - ss(seg(t, T.same - .3, T.same))); if (kb > 0) bubble(mx - 40, my - 200, 240, 90, 'sorry…', kb, P.navy, 1);
  const kc = pop(t, T.same - .1); if (kc > 0) { g.save(); g.translate(CX, 380); g.scale(kc, kc); card(0, 0, 860, 170, 1); text('WATCH', 0, -18, 40, P.red, 1000, null, 0); text('The Moon is breaking up with us', 0, 42, 48, P.white, 1000, null, 0); g.restore(); }
};
SC[16] = (t) => {                                                  // back to the street: safe, holding on anyway
  sky(); city(1430, .7);
  K.earth(690, 760, 210, t, 'happy', { rot: spin(t), look: -.6, lookY: .5 });
  ground();
  lamppost(540, 1440, .9);
  const kh = ss(seg(t, T.hold - .4, T.hold + .2));
  stander(lerp(420, 480, kh), 1440, .62, t, { mood: kh > .5 ? 'wink' : 'happy', arms: kh > .3 ? 'hold' : 'down', look: -.4 });
  const kb = pop(t, T.billions - .1); if (kb > 0) tag(CX, 300, 'BILLIONS', 'of years', kb);
  const kw = pop(t, T.worry - .1) * (1 - ss(seg(t, T.billions - .4, T.billions - .1))); if (kw > 0) tag(CX, 300, "DON'T WORRY", null, kw, P.land);
};

// ───────── captions: word-pops, key words in gold (lower middle, above the Shorts UI)
const FIX = { 'earth': 'Earth', 'moon': 'Moon', '1600': '1,600', 'kilometers': 'kilometres', '1': 'One', '6': 'six', 'breaking': 'braking', 'right': 'Right' };
const KEY = new Set(['earth', 'spinning', 'stopped', 'moving', 'equator', '1600', 'kilometers', 'everything', 'second', 'keep', 'house', 'trees', 'rock', 'east', 'air', 'wind', 'tornado', 'oceans', 'crashing', 'still', 'sunrise', '6', 'months', 'daylight', 'night', 'bakes', 'freezes', 'bulge', 'middle', 'water', 'poles', 'continent', 'magnetic', 'shield', 'radiation', 'good', 'fast', 'weird', 'slowing', 'century', 'thousandths', 'longer', 'breaking', 'moon', 'leaving', 'billions', 'hold']);
const CAP = [];
for (const [id, ws] of Object.entries(words)) {
  const toks = []; for (const w of ws) { const b = w[0].toLowerCase().replace(/[.,?]$/, ''), s = FIX[b] ? FIX[b] + (w[0].match(/[.,?]$/)?.[0] || '') : w[0]; if (/^[,.]/.test(s) && toks.length) { const p = toks[toks.length - 1]; p.w += s; p.t1 = w[2]; } else toks.push({ w: s, k: w[0], t0: Math.max(0, w[1]), t1: w[2] }); }
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
  rows.forEach((row, ri) => { const tot = row.reduce((p, w) => p + w.wd, 0); let x = CX - tot / 2; const y = 1640 + ri * 88;
    for (const w of row) { const k = clamp((t - w.t0) / .1); if (k > 0) { g.save(); g.globalAlpha = k; g.translate(x, y); const s = .85 + .15 * eo(k); g.scale(s, s); g.lineJoin = 'round'; g.lineWidth = 16; g.strokeStyle = P.navy; g.textAlign = 'left'; g.strokeText(w.s, 0, 0); g.fillStyle = KEY.has(nrm(w.k)) ? P.gold : P.white; g.fillText(w.s, 0, 0); g.restore(); } x += w.wd; } });
  g.restore();
}

// ───────── frame: a quick crossfade + push-in between scenes; the end dissolves into the opening frame so it loops
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
