// "What If Earth Lost Its Magnetic Field?" — flat-vector explainer, vertical 1080×1920, canvas 2D, deterministic in t.
// Beyond Everything brand style (kit.js shared with the Sun Vanished, Moon and Earth Stops films). Thirteen beats, one
// per line: the shield switches off and the compass gives up, the iron dynamo in the core, the lazy Sun's wind, the
// bubble that bends it, satellites and astronauts, lost animals, the air as a second shield, the slow leak, Mars, why
// Earth holds on, the near-miss 41,000 years ago, the pole flips, and the shield back on. The last frame loops.
import * as K from './kit.js';
import { clamp, lerp, seg, ss, eio, eo, mulberry, TAU } from '/core/lib.js';
const { P, text, sparkle, glow, card, bubble, pop } = K;
import * as PR from './props.js';
const { stander, sky, ground } = PR;

const W = 1080, H = 1920, CX = W / 2;
const cv = document.getElementById('c'), g = cv.getContext('2d');
K.setup(g, W, H); K.makeStars(110, 21); PR.setup(g, W, H);
await document.fonts.load('900 80px NU'); await document.fonts.load('800 40px NU');
const words = await (await fetch('voices/words.json')).json();
const lines = await (await fetch('lines.json')).json();
const dur = await (await fetch('voices/dur.json')).json();

// ───────── timeline: one scene per line. The takes are already trimmed (tools/voice.py), so a small gap is enough.
const IDS = lines.map(l => l.id), VO = {};
const LINE_GAP = .2, GAP = { s07: .35 };                             // a touch more air before "the real danger is slow"
{ let t = .25; for (const id of IDS) { VO[id] = +t.toFixed(3); t += dur[id] + (GAP[id] ?? LINE_GAP); } }
const LAST = IDS[IDS.length - 1], DUR = +(VO[LAST] + dur[LAST] + 1.4).toFixed(2);
const nrm = s => s.toLowerCase().replace(/[^a-z0-9]/g, '');
const at = (id, w, k = 0, e = 1) => { let n = 0; for (const x of words[id]) if (nrm(x[0]).startsWith(nrm(w)) && n++ === k) return VO[id] + Math.max(0, x[e]); throw new Error(`${w} in ${id}`); };
const S = [0, ...IDS.slice(1).map(id => VO[id] - .2), DUR];
const sceneAt = t => { let i = 0; while (i < S.length - 2 && t >= S[i + 1]) i++; return i; };
const XF = .4, LOOP = .7;
const T = {
  magnetic: at('s01', 'magnetic'), switched: at('s01', 'switched'), compass: at('s01', 'compass'), north: at('s01', 'north'),
  iron: at('s02', 'iron'), swirling: at('s02', 'swirling'), core: at('s02', 'core'), thousand: at('s02', 'thousand'),
  shield: at('s03', 'shield'), sun3: at('s03', 'sun'), wind3: at('s03', 'wind'), four: at('s03', 'four'),
  bends: at('s04', 'bends'), around: at('s04', 'around'), without: at('s04', 'without'), directly: at('s04', 'directly'),
  satellites: at('s05', 'satellites'), astronauts: at('s05', 'astronauts'), hit: at('s05', 'hit'), radiation: at('s05', 'radiation'),
  turtles: at('s06', 'turtles'), salmon: at('s06', 'salmon'), birds: at('s06', 'birds'), navigate: at('s06', 'navigate'), lost: at('s06', 'lost'),
  ground: at('s07', 'ground'), fine: at('s07', 'fine'), thick: at('s07', 'thick'), second: at('s07', 'second'),
  danger: at('s08', 'danger'), slow: at('s08', 'slow'), strip: at('s08', 'strip'), bit: at('s08', 'bit', 1),
  mars: at('s09', 'mars'), died: at('s09', 'died'), lostAir: at('s09', 'lost'), air9: at('s09', 'air'),
  hundreds: at('s10', 'hundreds'), years10: at('s10', 'years'), gravity: at('s10', 'gravity'), tighter: at('s10', 'tighter'),
  forty: at('s11', 'forty'), drop: at('s11', 'drop'), tenth: at('s11', 'tenth'), strength: at('s11', 'strength'),
  life: at('s12', 'life'), poles: at('s12', 'poles'), swapped: at('s12', 'swapped'), times: at('s12', 'times'),
  thank: at('s13', 'thank'), iron13: at('s13', 'iron'), feet: at('s13', 'feet'), lazy: at('s13', 'lazy'), hair: at('s13', 'hair'),
};
const OFF = T.switched + .05;                                       // the moment the field switches off

function tag(x, y, s, sub, k, col = P.gold) {
  if (k <= 0) return; g.save(); g.font = '1000 76px NU'; const w = Math.max(520, g.measureText(s).width + 120); g.translate(x, y); g.scale(k, k); card(0, 0, w, sub ? 180 : 120, 1);
  text(s, 0, sub ? 8 : 22, 76, col, 1000, null, 0); if (sub) text(sub, 0, 62, 40, P.white, 800, null, 0); g.restore();
}
const bg = (t, top = P.bg0, bot = P.bg1) => K.bg(t, top, bot, g.globalAlpha);
const face = (r, mood, t, look = 0, seed = 1.7) => K.face(r, mood, t, look, seed, .3);

// ───────── the magnetic field: dipole loops around a planet at (x, y), radius r. sq squashes the sunward (left) side,
// st stretches the night side, a = opacity, fl = flicker (0..1) as it dies
function field(x, y, r, t, a = 1, o = {}) {
  if (a <= 0) return; const sq = o.sq ?? 1, st = o.st ?? 1, fl = o.fl || 0, col = o.col || '63,224,255';
  g.save(); g.lineCap = 'round';
  for (const [k, L] of [1.7, 2.4, 3.3, 4.4].entries()) {
    const lam = Math.acos(Math.sqrt(1 / L)), flick = fl ? (Math.sin(t * 31 + k * 2.1) > .3 - fl ? 1 - fl : .15) : 1;
    g.globalAlpha = a * flick * (.85 - k * .12); g.strokeStyle = `rgba(${col},1)`; g.lineWidth = 9 - k;
    g.setLineDash([26, 18]); g.lineDashOffset = -t * 40;
    for (const side of [-1, 1]) {
      const sc = side < 0 ? sq : st; g.beginPath();
      for (let i = 0; i <= 40; i++) { const l = -lam + 2 * lam * i / 40, rr = L * r * Math.cos(l) ** 2; g.lineTo(x + side * rr * Math.cos(l) * sc, y - rr * Math.sin(l)); }
      g.stroke();
    }
  }
  g.restore();
}
// solar-wind particles flowing left → right. shield 0..1 bends them around a bubble of radius R centred on (ex, ey)
function wind(t, ex, ey, R, shield, o = {}) {
  const n = o.n ?? 26, x0 = o.x0 ?? -60, sp = o.sp ?? 520, seed = o.seed ?? 3, rr = o.r ?? 13, a = o.a ?? 1; if (a <= 0) return;
  const Rn = mulberry(seed);
  for (let i = 0; i < n; i++) {
    const y0 = (o.y0 ?? 300) + Rn() * (o.h ?? 1300), ph = Rn(), span = (o.x1 ?? W + 80) - x0;
    const x = x0 + ((t * sp / span + ph) % 1) * span;
    let y = y0; const dy = y0 - ey;
    const env = ss(seg(x, ex - R * 1.6, ex - R * .3)) * (1 - ss(seg(x, ex + R * .2, ex + R * 2.6)) * .6);
    if (Math.abs(dy) < R * 1.05) y = ey + Math.sign(dy || 1) * lerp(Math.abs(dy), R * 1.05 + (R - Math.abs(dy)) * .2, env * shield);
    const hitX = ex - Math.sqrt(Math.max(0, (o.er ?? 0) ** 2 - dy * dy));
    if (shield < .5 && o.er && Math.abs(dy) < o.er && x > hitX) { const u = clamp((x - hitX) / 90); if (u < 1) sparkle(hitX, y, 34 * (1 - u), '#ffd0d8', 1 - u); continue; }
    g.save(); g.globalAlpha *= a; g.strokeStyle = 'rgba(255,120,140,.35)'; g.lineWidth = rr * .9; g.lineCap = 'round'; g.beginPath(); g.moveTo(x - 60, y); g.lineTo(x, y); g.stroke();
    g.fillStyle = '#ff6a80'; g.beginPath(); g.arc(x, y, rr, 0, TAU); g.fill(); g.fillStyle = '#ffd0d8'; g.beginPath(); g.arc(x - rr * .3, y - rr * .3, rr * .35, 0, TAU); g.fill(); g.restore();
  }
}
function compass(x, y, r, ang, a = 1) {
  if (a <= 0) return; g.save(); g.globalAlpha *= a; g.translate(x, y);
  g.fillStyle = '#c98a3a'; g.beginPath(); g.arc(0, 0, r * 1.12, 0, TAU); g.fill();
  g.fillStyle = '#f6f1e4'; g.beginPath(); g.arc(0, 0, r, 0, TAU); g.fill();
  g.strokeStyle = 'rgba(23,22,63,.35)'; g.lineWidth = 4; for (let i = 0; i < 12; i++) { const q = i / 12 * TAU; g.beginPath(); g.moveTo(Math.cos(q) * r * .82, Math.sin(q) * r * .82); g.lineTo(Math.cos(q) * r * .92, Math.sin(q) * r * .92); g.stroke(); }
  text('N', 0, -r * .52, r * .3, P.navy, 1000, null, 0);
  g.rotate(ang); g.fillStyle = P.red; g.beginPath(); g.moveTo(0, -r * .78); g.lineTo(r * .13, 0); g.lineTo(-r * .13, 0); g.fill();
  g.fillStyle = '#8a8fb0'; g.beginPath(); g.moveTo(0, r * .78); g.lineTo(r * .13, 0); g.lineTo(-r * .13, 0); g.fill();
  g.fillStyle = P.navy; g.beginPath(); g.arc(0, 0, r * .08, 0, TAU); g.fill(); g.restore();
}
function cutaway(x, y, r, t) {                                      // Earth's insides: crust, mantle, swirling outer core, inner core
  g.save(); g.translate(x, y);
  glow(0, 0, r * 1.4, '255,150,60', .25);
  g.fillStyle = P.ocean; g.beginPath(); g.arc(0, 0, r, 0, TAU); g.fill();
  g.fillStyle = '#c8643a'; g.beginPath(); g.arc(0, 0, r * .94, 0, TAU); g.fill();
  g.fillStyle = '#ff9a2e'; g.beginPath(); g.arc(0, 0, r * .55, 0, TAU); g.fill();
  g.strokeStyle = '#ffd36a'; g.lineWidth = r * .03; g.lineCap = 'round';
  for (let i = 0; i < 6; i++) { const a0 = t * 1.6 + i / 6 * TAU, rr = r * (.36 + .12 * (i % 2)); g.beginPath(); g.arc(0, 0, rr, a0, a0 + 1.1); g.stroke();
    const ae = a0 + 1.1; K.arrow(Math.cos(ae - .15) * rr, Math.sin(ae - .15) * rr, Math.cos(ae) * rr, Math.sin(ae) * rr, '#ffd36a', r * .03, 1); }
  g.fillStyle = '#ffe9a0'; g.beginPath(); g.arc(0, 0, r * .2, 0, TAU); g.fill();
  g.restore();
}
function satellite(x, y, s, t, hurt = 0) {
  g.save(); g.translate(x, y); g.rotate(Math.sin(t * .8) * .15 + hurt * Math.sin(t * 40) * .08); g.scale(s, s);
  g.fillStyle = '#3a55c8'; for (const sd of [-1, 1]) { g.fillRect(sd * 70 - (sd < 0 ? 120 : 0), -34, 120, 68); }
  g.strokeStyle = 'rgba(255,255,255,.4)'; g.lineWidth = 3; for (const sd of [-1, 1]) for (let i = 1; i < 4; i++) { g.beginPath(); g.moveTo(sd * (70 + i * 30), -34); g.lineTo(sd * (70 + i * 30), 34); g.stroke(); }
  g.fillStyle = '#d7d9e8'; g.beginPath(); g.roundRect(-70, -60, 140, 120, 18); g.fill(); g.fillStyle = '#ffc73a'; g.fillRect(-70, 20, 140, 16);
  g.save(); g.translate(0, -10); K.face(46, hurt > .5 ? 'scared' : 'happy', t, 0, 2.6, 0); g.restore();
  g.restore();
}
function astronaut(x, y, s, t, mood) {
  g.save(); g.translate(x, y + Math.sin(t * 1.5) * 8); g.rotate(Math.sin(t * .7) * .2); g.scale(s, s);
  g.fillStyle = '#eef0f8'; g.beginPath(); g.roundRect(-50, 20, 100, 120, 36); g.fill();
  g.strokeStyle = '#eef0f8'; g.lineWidth = 34; g.lineCap = 'round'; g.beginPath(); g.moveTo(-40, 50); g.lineTo(-90, 110); g.moveTo(40, 50); g.lineTo(90, 0); g.moveTo(-25, 130); g.lineTo(-30, 190); g.moveTo(25, 130); g.lineTo(35, 190); g.stroke();
  g.fillStyle = '#eef0f8'; g.beginPath(); g.arc(0, -30, 72, 0, TAU); g.fill();
  g.fillStyle = '#20264f'; g.beginPath(); g.roundRect(-52, -70, 104, 78, 34); g.fill();
  g.save(); g.translate(0, -30); K.face(44, mood, t, 0, 1.1, 0); g.restore();
  g.restore();
}
function turtle(x, y, s, t, mood, look = 0) {
  g.save(); g.translate(x, y + Math.sin(t * 1.6) * 10); g.scale(s, s);
  const fl = Math.sin(t * 3) * .35; g.fillStyle = '#7fd0a0';
  for (const [fx, fy, sd] of [[-90, -55, -1], [90, -55, 1], [-80, 60, -1], [80, 60, 1]]) { g.save(); g.translate(fx, fy); g.rotate(sd * (.6 + fl * (fy < 0 ? 1 : -.5))); g.beginPath(); g.ellipse(sd * 40, 0, 60, 24, 0, 0, TAU); g.fill(); g.restore(); }
  g.beginPath(); g.ellipse(150, -10, 58, 48, 0, 0, TAU); g.fill();
  g.fillStyle = '#3f9a63'; g.beginPath(); g.ellipse(0, 0, 135, 105, 0, 0, TAU); g.fill();
  g.strokeStyle = '#2d7a4c'; g.lineWidth = 7; for (const [a, b] of [[-40, -30], [40, -30], [0, 40]]) { g.beginPath(); g.arc(a, b, 38, 0, TAU); g.stroke(); }
  g.save(); g.translate(158, -14); K.face(40, mood, t, look, 3.1, 0); g.restore();
  g.restore();
}
function bird(x, y, s, t, ph = 0) {
  g.save(); g.translate(x, y); g.scale(s, s); const fl = Math.sin(t * 10 + ph);
  g.fillStyle = '#ffffff'; g.beginPath(); g.ellipse(0, 0, 60, 30, 0, 0, TAU); g.fill();
  g.beginPath(); g.moveTo(-10, -6); g.quadraticCurveTo(-40, -70 * fl, -90, -60 * fl); g.lineTo(20, -6); g.fill();
  g.beginPath(); g.arc(52, -16, 22, 0, TAU); g.fill(); g.fillStyle = P.gold; g.beginPath(); g.moveTo(70, -18); g.lineTo(96, -10); g.lineTo(70, -6); g.fill();
  g.fillStyle = P.navy; g.beginPath(); g.arc(58, -22, 5, 0, TAU); g.fill(); g.restore();
}
function mars(x, y, r, t, mood, o = {}) {
  g.save(); g.translate(x, y);
  if (o.air) glow(0, 0, r * 1.5, '255,170,140', .35 * o.air);
  g.beginPath(); g.arc(0, 0, r, 0, TAU); g.save(); g.clip();
  g.fillStyle = '#d9653b'; g.fillRect(-r, -r, 2 * r, 2 * r);
  for (const [cx, cy, s] of [[-.4, -.35, .18], [.35, -.5, .12], [.5, .3, .2], [-.5, .45, .14], [.05, .6, .1]]) { g.fillStyle = '#b84d2a'; g.beginPath(); g.arc(cx * r, cy * r, s * r, 0, TAU); g.fill(); }
  g.fillStyle = 'rgba(255,255,255,.85)'; g.beginPath(); g.ellipse(0, -r * .94, r * .3, r * .09, 0, 0, TAU); g.fill();
  g.fillStyle = 'rgba(60,20,40,.28)'; g.beginPath(); g.arc(r * .35, r * .1, r * 1.1, 0, TAU); g.arc(-r * .15, -r * .08, r * 1.02, 0, TAU, true); g.fill('evenodd');
  g.restore(); face(r, mood, t, o.look || 0, 2.4); g.restore();
}
function air(x, y, r, t, a = 1, peel = 0) {                          // a hazy atmosphere ring; peel > 0 sheds wisps to the right
  if (a <= 0) return; g.save(); g.globalAlpha *= a;
  const gr = g.createRadialGradient(x, y, r * .95, x, y, r * 1.3); gr.addColorStop(0, 'rgba(120,200,255,.55)'); gr.addColorStop(1, 'rgba(120,200,255,0)'); g.fillStyle = gr; g.beginPath(); g.arc(x, y, r * 1.3, 0, TAU); g.fill();
  if (peel > 0) { const R = mulberry(9); for (let i = 0; i < 18; i++) { const ph = (t * .35 + R()) % 1, a0 = (R() - .5) * 2.2, d = r * (1.1 + ph * 2.4); g.globalAlpha = a * peel * (1 - ph) * .8; g.fillStyle = '#9fd8ff'; g.beginPath(); g.arc(x + Math.cos(a0 * (1 - ph * .6)) * d, y + Math.sin(a0 * (1 - ph * .6)) * d * .7, 10 + R() * 10, 0, TAU); g.fill(); } }
  g.restore();
}
const sunLeft = (t, mood = 'sleepy', o = {}) => K.sunChar(o.x ?? 120, o.y ?? 640, o.r ?? 240, t, { mood, shades: o.shades ?? .6, look: .8, mug: o.mug, sip: o.sip, flare: o.flare });

// ───────── scenes
const SC = [];
SC[0] = (t) => {                                                    // hook: the shield switches off, the compass gives up
  bg(t);
  const ex = CX, ey = 980, er = 190, on = t < OFF;
  const fl = ss(seg(t, OFF - .5, OFF)), fieldA = on ? 1 : 1 - ss(seg(t, OFF, OFF + .25));
  field(ex, ey, er, t, fieldA, { fl: on ? fl * .8 : 1 });
  if (!on && t < OFF + .15) { g.save(); g.globalAlpha = .35; g.fillStyle = '#bff6ff'; g.fillRect(0, 0, W, H); g.restore(); }
  K.earth(ex, ey, er, t, t > OFF + .2 ? 'worried' : 'happy', { look: t > OFF + .2 ? Math.sin(t * 3) : 0 });
  const kq = pop(t, T.compass - .3); if (kq > 0) { g.save(); g.translate(CX + 260, 1420); g.scale(kq, kq);
    const drift = t < T.compass ? 0 : Math.sin((t - T.compass) * 2.2) * 2.4 + (t - T.compass) * 1.3; compass(0, 0, 130, drift); g.restore(); }
  const kn = pop(t, T.north); if (kn > 0) bubble(CX - 220, 1330, 300, 90, 'north...?', kn, P.navy, 1);
  g.save(); g.translate(CX, 210); text('WHAT IF EARTH LOST ITS', 0, -10, 78, P.white, 1000, P.navy, 16); text('MAGNETIC FIELD?', 0, 110, 116, P.cyan, 1000, P.navy, 20); g.restore();
};
SC[1] = (t) => {                                                    // the dynamo: liquid iron swirling in the core
  bg(t);
  const ex = CX, ey = 980, er = 330, kf = ss(seg(t, T.swirling - .3, T.swirling + .6));
  field(ex, ey, er * .7, t, kf * .7, { sq: 1.2, st: 1.2 });
  cutaway(ex, ey, er, t);
  const ki = pop(t, T.iron - .1); if (ki > 0) { g.save(); g.translate(ex, ey + 40); g.scale(ki, ki); text('liquid iron', 0, 0, 58, P.white, 1000, P.navy, 12); g.restore(); }
  K.earth(170, 1540, 90, t, 'smug', { look: .6 }); const kb = pop(t, T.swirling + .3); if (kb > 0) bubble(330, 1400, 260, 84, 'tickles', kb, P.navy, -1);
  tag(CX, 360, '≈ 3,000 km down', 'the outer core, hotter than lava', pop(t, T.thousand - .1), '#ffb35a');
};
SC[2] = (t) => {                                                    // the lazy Sun's wind
  bg(t);
  const flare = ss(seg(t, T.wind3 - .3, T.wind3 + .3)) * .8;
  wind(t, 99999, 0, 0, 0, { n: 30, x0: 120, sp: 760, y0: 380, h: 900, a: ss(seg(t, T.wind3 - .4, T.wind3)) });
  sunLeft(t, t > T.wind3 ? 'smug' : 'sleepy', { x: 150, y: 820, r: 230, flare, shades: .7 });
  K.earth(900, 1350, 120, t, 'worried', { look: -.8 });
  const kp = ss(seg(t, T.wind3 - .1, T.wind3 + .4));
  if (kp > 0) for (let i = 0; i < 3; i++) { const p = ((t - T.wind3) * .3 + i * .33) % 1; K.proton(lerp(330, 860, p), 640 + i * 120 + Math.sin(t * 3 + i) * 20, 40, t + i, { mood: 'annoyed', alpha: kp, seed: i }); }
  const ks = pop(t, T.shield - .1); if (ks > 0) { g.save(); g.translate(880, 360); g.scale(ks, ks); text('SHIELD', 0, 0, 104, P.cyan, 1000, P.navy, 18); g.restore(); }
  tag(CX, 1640 - 1080, '≈ 400 km/s', 'the solar wind', pop(t, T.four - .1), '#ff8a9c');
};
SC[3] = (t) => {                                                    // the field bends the wind around us — then it's gone
  bg(t);
  const ex = 760, ey = 1000, er = 140, sh = 1 - ss(seg(t, T.without - .1, T.without + .3));
  field(ex, ey, er, t, sh, { sq: .62, st: 1.7 });
  if (sh > 0) { g.save(); g.globalAlpha *= sh * .5; g.strokeStyle = P.cyan; g.lineWidth = 8; g.beginPath(); g.ellipse(ex + 160, ey, 560, 420, 0, Math.PI * .62, Math.PI * 1.38); g.stroke(); g.restore(); }
  wind(t, ex, ey, 420, sh, { n: 34, x0: -60, sp: 560, y0: 380, h: 1240, er: er, seed: 5 });
  K.earth(ex, ey, er, t, sh > .5 ? 'happy' : 'scared', { look: -.8 });
  const kb = pop(t, T.around - .1) * sh; if (kb > 0) bubble(ex - 20, ey - 270, 280, 84, 'missed!', kb, P.navy, 1);
  tag(CX, 360, t < T.without ? 'deflected' : 'direct hit', null, pop(t, t < T.without ? T.bends - .1 : T.directly - .2), t < T.without ? P.cyan : P.red);
};
SC[4] = (t) => {                                                    // satellites and astronauts take the first hit
  bg(t);
  K.earth(CX, 2050, 520, t, 'worried', { look: 0 });
  wind(t, 99999, 0, 0, 0, { n: 30, x0: -60, sp: 700, y0: 300, h: 1200, seed: 8 });
  const hs = ss(seg(t, T.hit - .3, T.hit + .2));
  satellite(330, 760, .9, t, hs); astronaut(760, 1060, .95, t, t > T.radiation - .3 ? 'scared' : 'happy');
  if (hs > 0) { const R = mulberry(Math.floor(t * 12)); for (let i = 0; i < 4; i++) sparkle(330 + (R() - .5) * 300, 760 + (R() - .5) * 140, 30 + R() * 20, '#ffd0d8', hs); }
  tag(CX, 360, 'more radiation', 'no bubble to hide in', pop(t, T.radiation - .1), P.red);
};
SC[5] = (t) => {                                                    // the navigators get lost
  const gr = g.createLinearGradient(0, 0, 0, H); gr.addColorStop(0, '#0b2d6a'); gr.addColorStop(1, '#06173c'); g.fillStyle = gr; g.fillRect(0, 0, W, H);
  for (let i = 0; i < 8; i++) { g.strokeStyle = 'rgba(120,180,255,.15)'; g.lineWidth = 5; g.beginPath(); for (let x = 0; x <= W; x += 30) g.lineTo(x, 520 + i * 170 + Math.sin(x * .015 + t * 1.5 + i) * 10); g.stroke(); }
  const lost = t > T.lost - .2;
  const kt = ss(seg(t, T.turtles - .5, T.turtles)); g.save(); g.globalAlpha *= kt; turtle(380 + Math.sin(t * .8) * 40, 1150, 1.1, t, lost ? 'worried' : 'happy', Math.sin(t * 2)); g.restore();
  const kf = ss(seg(t, T.salmon - .4, T.salmon)); g.save(); g.globalAlpha *= kf; K.fish(800, 1450 + Math.sin(t * 2) * 15, 1, t, { mood: lost ? 'worried' : 'happy', flip: lost && Math.sin(t * 2.5) > 0 }); g.restore();
  const kb = ss(seg(t, T.birds - .4, T.birds)); if (kb > 0) { const a = t * 1.8; g.save(); g.globalAlpha *= kb; bird(760 + Math.cos(a) * (lost ? 120 : 0) + (lost ? 0 : (t - T.birds) * 80), 760 + Math.sin(a) * (lost ? 60 : 0), .9, t); g.restore(); }
  if (lost) { const kq = pop(t, T.lost - .2); for (const [x, y] of [[380, 920], [800, 1290], [760, 600]]) { g.save(); g.translate(x, y); g.scale(kq, kq); text('?', 0, 0, 110, P.gold, 1000, P.navy, 14); g.restore(); } }
  tag(CX, 300, 'built-in compass', 'turtles · salmon · birds', pop(t, T.navigate - .2), P.cyan);
};
SC[6] = (t) => {                                                    // on the ground you're fine: the air is shield #2
  sky('#2a3a8a', '#7fb8ea'); ground(1420);
  const ab = 520; const gr = g.createLinearGradient(0, ab - 120, 0, ab + 120); gr.addColorStop(0, 'rgba(160,220,255,0)'); gr.addColorStop(.5, 'rgba(160,220,255,.55)'); gr.addColorStop(1, 'rgba(160,220,255,0)');
  const ka = ss(seg(t, T.thick - .4, T.thick + .2)); g.save(); g.globalAlpha *= .4 + .6 * ka; g.fillStyle = gr; g.fillRect(0, ab - 120, W, 240); g.restore();
  const R = mulberry(4); for (let i = 0; i < 14; i++) { const x = R() * W, ph = (t * .9 + R()) % 1, y = -40 + ph * (ab + 40); if (y > ab - 20) { sparkle(x, ab - 10, 30, '#ffd0d8', 1 - ph); continue; } g.fillStyle = '#ff6a80'; g.beginPath(); g.arc(x, y, 12, 0, TAU); g.fill(); }
  stander(CX, 1440, .7, t, { mood: t > T.fine - .3 ? 'happy' : 'worried', arms: t > T.fine ? 'wave' : 'down', look: 0, lookY: -.6 });
  tag(CX, 760, 'shield #2: the air', '10 tonnes of it above every m²', pop(t, T.second - .2), '#9fd8ff');
};
SC[7] = (t) => {                                                    // the slow leak
  bg(t);
  const ex = 680, ey = 1000, er = 200, kp = ss(seg(t, T.strip - .4, T.strip + .5));
  wind(t, 99999, 0, 0, 0, { n: 26, x0: -60, x1: ex - er * 1.1, sp: 600, y0: ey - 300, h: 600, seed: 12 });
  air(ex, ey, er, t, 1, kp);
  K.earth(ex, ey, er, t, kp > .3 ? 'sad' : 'worried', { look: -.6 });
  const kc = pop(t, T.slow - .1); if (kc > 0) { g.save(); g.translate(CX, 360); g.scale(kc, kc); text('SLOW', 0, 0, 130, P.gold, 1000, P.navy, 20); g.restore(); }
  tag(CX, 1560, 'bit by bit', 'the upper air drifts off to space', pop(t, T.bit - .1), '#9fd8ff');
};
SC[8] = (t) => {                                                    // Mars: field died, air gone
  bg(t, '#120620', '#2a0f2e');
  const kd = ss(seg(t, T.died - .2, T.died + .5)), ka = 1 - ss(seg(t, T.lostAir - .2, T.air9 + .6));
  field(CX, 980, 240, t, (1 - kd) * .8, { col: '255,170,120', fl: kd });
  mars(CX, 980, 240, t, ka > .5 ? 'worried' : 'sad', { air: ka, look: -.3 });
  wind(t, 99999, 0, 0, 0, { n: 18, x0: -60, x1: CX - 250, sp: 600, y0: 760, h: 440, seed: 14, a: kd });
  text('MARS', CX, 1360, 96, '#ff9a6a', 1000, P.navy, 16, 'center', ss(seg(t, T.mars - .3, T.mars)));
  tag(CX, 400, 'most of its air: gone', 'its field died billions of years ago', pop(t, T.air9 - .2), '#ff9a6a');
};
SC[9] = (t) => {                                                    // ...but slowly, and Earth holds on tighter
  bg(t);
  const kh = pop(t, T.hundreds - .1); if (kh > 0) tag(CX, 340, '100s of millions', 'of years', kh);
  mars(260, 1150, 110, t, 'sad', { look: .6 });
  air(720, 1100, 230, t, 1); K.earth(720, 1100, 230, t, t > T.tighter - .4 ? 'smug' : 'happy', { look: -.4 });
  const kg = ss(seg(t, T.gravity - .3, T.gravity + .2));
  if (kg > 0) for (let i = 0; i < 8; i++) { const a = i / 8 * TAU, p = (t * .8 + i * .125) % 1, d = lerp(370, 250, eio(p)); K.arrow(720 + Math.cos(a) * (d + 70), 1100 + Math.sin(a) * (d + 70), 720 + Math.cos(a) * d, 1100 + Math.sin(a) * d, P.cyan, 12, kg * Math.sin(p * Math.PI)); }
  text('gravity', 720, 1470, 64, P.cyan, 1000, P.navy, 12, 'center', kg);
};
SC[10] = (t) => {                                                   // 41,000 years ago: below a tenth
  bg(t);
  const v = lerp(1, .07, ss(seg(t, T.drop - .2, T.tenth + .4)));
  field(CX, 1060, 200, t, .25 + .75 * v, { fl: 1 - v > .5 ? .5 : 0 });
  K.earth(CX, 1060, 200, t, v < .3 ? 'scared' : 'happy', { look: 0 });
  tag(CX, 340, '41,000 years ago', 'the Laschamp event', pop(t, T.forty - .1));
  const kb = ss(seg(t, VO.s11, VO.s11 + .4)); if (kb > 0) { g.save(); g.globalAlpha *= kb; card(CX, 1520, 860, 190, 1); text('FIELD STRENGTH', CX, 1480, 44, P.white, 1000, null, 0);
    g.fillStyle = 'rgba(255,255,255,.15)'; g.beginPath(); g.roundRect(CX - 380, 1510, 760, 50, 25); g.fill();
    g.fillStyle = v < .3 ? P.red : P.cyan; g.beginPath(); g.roundRect(CX - 380, 1510, 760 * v, 50, 25); g.fill();
    text(`${Math.round(v * 100)}%`, CX + 340, 1480, 44, v < .3 ? P.red : P.cyan, 1000, null, 0, 'right'); g.restore(); }
};
SC[11] = (t) => {                                                   // life carried on; the poles have flipped hundreds of times
  bg(t);
  const ex = CX, ey = 1000, er = 230, fs = ss(seg(t, T.swapped - .3, T.times + .6)), rot = fs * Math.PI * 3;
  field(ex, ey, er, t, .8);
  K.earth(ex, ey, er, t, 'happy', { look: 0 });
  g.save(); g.translate(ex, ey); g.rotate(rot);
  for (const [s, y, c] of [['N', -er - 90, P.red], ['S', er + 150, '#8fa0ff']]) { g.save(); g.translate(0, y); g.rotate(-rot); text(s, 0, 30, 110, c, 1000, P.navy, 16); g.restore(); }
  g.restore();
  const kl = pop(t, T.life - .1); if (kl > 0) bubble(ex + 230, ey - 300, 300, 90, 'still here!', kl, P.navy, -1);
  tag(CX, 340, 'flipped 100s of times', 'last time: 780,000 years ago', pop(t, T.times - .2), '#8fa0ff');
};
SC[12] = (t) => {                                                   // thank the hot iron: the shield is back on
  bg(t);
  const ex = 740, ey = 1050, er = 170, kf = ss(seg(t, VO.s13 - .1, VO.s13 + .5));
  field(ex, ey, er, t, kf, { sq: .62, st: 1.6 });
  wind(t, ex, ey, 440, kf, { n: 26, x0: 120, sp: 520, y0: 520, h: 1100, er, seed: 7 });
  sunLeft(t, 'sleepy', { x: 200, y: 560, r: 190, mug: 1, sip: .5 + .5 * Math.sin(t * 1.2), shades: 0 });
  K.earth(ex, ey, er, t, t > T.hair - .2 ? 'wink' : 'happy', { look: -.6 });
  const ki = pop(t, T.iron13 - .1); if (ki > 0) { text('thanks, iron', ex, ey + 280, 60, '#ffb35a', 1000, P.navy, 12, 'center', ki); }
  const kb = pop(t, T.hair - .1); if (kb > 0) bubble(ex + 40, ey - 290, 330, 90, 'not today!', kb, P.navy, 1);
};

// ───────── captions: word-pops, key words in gold (lower middle, above the Shorts UI)
const KEY = new Set(['magnetic', 'field', 'compass', 'north', 'iron', 'core', 'thousand', 'shield', 'wind', 'hundred', 'second', 'bends', 'around', 'directly', 'satellites', 'astronauts', 'radiation', 'turtles', 'salmon', 'birds', 'lost', 'ground', 'fine', 'air', 'slow', 'strip', 'atmosphere', 'mars', 'died', 'millions', 'gravity', 'tighter', 'fortyone', 'tenth', 'strength', 'life', 'poles', 'swapped', 'times', 'hot', 'feet', 'lazy', 'hair']);
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
EV.push({ type: 'cue', name: 'off', t: +OFF.toFixed(3) });
S.forEach((s, i) => { if (i > 0 && i < S.length - 1) EV.push({ type: 'scene', i, t: +s.toFixed(3) }); });
EV.sort((a, b) => a.t - b.t);
window.EV = EV; window.DUR = DUR; window.render = render;
window.SUBS = lines.map((l, i) => { const ws = words[l.id], t0 = VO[l.id] - .05, nx = lines[i + 1] ? VO[lines[i + 1].id] - .05 : DUR; return { t0, t1: Math.max(Math.min(VO[l.id] + ws[ws.length - 1][2] + .6, nx), t0 + 1.8), text: l.sub || l.text }; });
render(+(new URLSearchParams(location.search).get('t') ?? .5));
window.READY = true;
