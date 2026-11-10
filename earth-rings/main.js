// "What If Earth Had Rings?" — flat-vector explainer, vertical 1080×1920, canvas 2D, deterministic in t.
// Beyond Everything brand style (kit.js shared with the Moon, Lazy Sun and Far Future films). Nine beats, one per line:
// Earth in its new ring, the arch over a backyard by day and by night, the ring shadow, a satellite crash, the Moon
// tugging, the twist (466 million years ago), and the plain sky again.
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
{ let t = .2; for (const id of IDS) { VO[id] = +t.toFixed(3); t += dur[id] + .45; } }
const LAST = IDS[IDS.length - 1], DUR = +(VO[LAST] + dur[LAST] + 1.8).toFixed(2);
const nrm = s => s.toLowerCase().replace(/[^a-z0-9]/g, '');
const at = (id, w, k = 0, e = 1) => { let n = 0; for (const x of words[id]) if (nrm(x[0]).startsWith(nrm(w)) && n++ === k) return VO[id] + Math.max(0, x[e]); throw new Error(`${w} in ${id}`); };
const S = [0, ...IDS.slice(1).map(id => VO[id] - .3), DUR];
const sceneAt = t => { let i = 0; while (i < S.length - 2 && t >= S[i + 1]) i++; return i; };
const XF = .45;                                                    // crossfade between scenes
const T = {
  saturn: at('r01', 'saturn'),
  step: at('r02', 'step'), arch: at('r02', 'giant'), across: at('r02', 'across'),
  night: VO.r03, catch: at('r03', 'catch'), brighter: at('r03', 'brighter'),
  shadows: at('r04', 'shadows'), winter: at('r04', 'winter'), colder: at('r04', 'colder'),
  space: at('r05', 'space'), rocks: at('r05', 'rocks'), smash: at('r05', 'smash'),
  last: at('r06', 'last'), moon: at('r06', 'moon'), crashing: at('r06', 'crashing'), shooting: at('r06', 'shooting'),
  could: VO.r07, strange: at('r07', 'strange'), already: at('r07', 'already'),
  sci: VO.r08, ring466: at('r08', 'ring'), years: at('r08', '466'), cool: at('r08', 'cool'),
  look: at('r09', 'look'), plain: at('r09', 'plain'), once: at('r09', 'ring'),
};

// ───────── the ring: stroked bands + loose rocks, split into the half behind the planet and the half in front
const ICE = [[1.0, 26, '#f3e6c8', .9], [1.12, 16, '#cdb68c', .75], [1.23, 30, '#fff4dc', .85], [1.36, 12, '#b89f78', .6]];
const ROCK = [[1.0, 24, '#9a93a8', .9], [1.13, 18, '#6f6880', .8], [1.25, 26, '#b2abbe', .8], [1.37, 10, '#5d5670', .6]];
function ring(x, y, rx, ry, tilt, half, t, a = 1, o = {}) {
  if (a <= 0) return;
  const base = g.globalAlpha * a, a0 = half === 'back' ? Math.PI : 0, a1 = half === 'back' ? TAU : Math.PI, sw = o.sweep ?? 1;
  g.save(); g.translate(x, y); g.rotate(tilt);
  for (const [k, w, col, al] of o.bands || ICE) { g.globalAlpha = base * al; g.strokeStyle = col; g.lineWidth = w * (o.ws || 1); g.beginPath(); g.ellipse(0, 0, rx * k, ry * k, 0, a0, a0 + (a1 - a0) * sw); g.stroke(); }
  const R = mulberry(o.seed || 7); g.globalAlpha = base;
  for (let i = 0; i < 70; i++) { const u = (R() + t * .015 * (1 + R())) % 1, th = a0 + u * (a1 - a0), kk = .95 + R() * .45; if (u > sw) continue; g.fillStyle = R() < .5 ? '#ffffff' : (o.bands === ROCK ? '#8a8399' : '#e3cfa4'); g.beginPath(); g.arc(Math.cos(th) * rx * kk, Math.sin(th) * ry * kk, (2 + R() * 4) * (o.ws || 1), 0, TAU); g.fill(); }
  g.restore();
}
function ringedEarth(x, y, r, t, mood, o = {}) {
  const tilt = o.tilt ?? -.32, rx = r * (o.rx ?? 1.9), ry = r * (o.ry ?? .42), ra = o.ra ?? 1, opt = { bands: o.bands, seed: o.seed, ws: o.ws, sweep: o.sweep };
  ring(x, y, rx, ry, tilt, 'back', t, ra, opt);
  K.earth(x, y, r, t, mood, { look: o.look || 0, lookY: o.lookY || 0 });
  if (o.under) o.under();
  ring(x, y, rx, ry, tilt, 'front', t, ra, opt);
}

// ───────── extra characters for this film
function planetChar(x, y, r, t, c1, c2, mood = 'happy', o = {}) {   // Saturn: banded ball, cel shadow, face
  g.save(); g.translate(x, y); glow(0, 0, r * 1.5, '255,210,140', .25);
  g.beginPath(); g.arc(0, 0, r, 0, TAU); g.save(); g.clip(); g.fillStyle = c1; g.fillRect(-r, -r, 2 * r, 2 * r);
  g.fillStyle = c2; for (const [v, h] of [[-.45, .12], [.1, .1], [.5, .12]]) { g.beginPath(); g.ellipse(0, v * r, r * 1.1, h * r, 0, 0, TAU); g.fill(); }
  g.fillStyle = 'rgba(40,20,70,.3)'; g.beginPath(); g.arc(r * .35, r * .1, r * 1.1, 0, TAU); g.arc(-r * .15, -r * .08, r * 1.02, 0, TAU, true); g.fill('evenodd');
  g.restore(); K.face(r, mood, t, o.look || 0, 2.4); g.restore();
}
function saturn(x, y, r, t, mood) {
  ring(x, y, r * 2.1, r * .5, -.25, 'back', t, 1, { ws: .45, seed: 3 });
  planetChar(x, y, r, t, '#f0c878', '#d9a85a', mood, { look: -1 });
  ring(x, y, r * 2.1, r * .5, -.25, 'front', t, 1, { ws: .45, seed: 3 });
}
function satellite(x, y, s, rot, t, mood = 'happy') {
  g.save(); g.translate(x, y); g.rotate(rot); g.scale(s, s);
  for (const dx of [-1, 1]) { g.fillStyle = '#2f5fd0'; g.fillRect(dx * 70 - (dx < 0 ? 120 : 0), -34, 120, 68); g.strokeStyle = '#8fb3ff'; g.lineWidth = 3; for (let k = 1; k < 4; k++) { g.beginPath(); g.moveTo(dx * 70 - (dx < 0 ? 120 : 0) + k * 30, -34); g.lineTo(dx * 70 - (dx < 0 ? 120 : 0) + k * 30, 34); g.stroke(); } }
  g.fillStyle = '#c9ced9'; g.fillRect(-72, -6, 144, 12);
  g.fillStyle = P.gold; g.beginPath(); g.roundRect(-60, -55, 120, 110, 18); g.fill(); g.fillStyle = '#e8a91a'; g.beginPath(); g.roundRect(-60, 20, 120, 35, [0, 0, 18, 18]); g.fill();
  g.strokeStyle = '#c9ced9'; g.lineWidth = 6; g.beginPath(); g.moveTo(0, -55); g.lineTo(0, -95); g.stroke(); g.fillStyle = P.white; g.beginPath(); g.arc(0, -100, 10, 0, TAU); g.fill();
  g.translate(0, -4); K.face(46, mood, t, .5, 3.3); g.restore();
}
function rock(x, y, r, rot, col = '#8a8399') {
  g.save(); g.translate(x, y); g.rotate(rot); g.fillStyle = col; g.beginPath();
  for (let i = 0; i < 7; i++) { const a = i / 7 * TAU, rr = r * (.75 + .25 * Math.sin(i * 2.3)); g.lineTo(Math.cos(a) * rr, Math.sin(a) * rr); }
  g.closePath(); g.fill(); g.fillStyle = 'rgba(30,20,60,.3)'; g.beginPath(); g.arc(r * .2, r * .2, r * .45, 0, TAU); g.fill(); g.restore();
}
function burst(x, y, k, r = 90) {                                  // impact sparks, k = 0..1 progress
  if (k <= 0 || k >= 1) return; glow(x, y, r * 1.6 * (1 - k * .5), '255,220,120', .8 * (1 - k));
  for (let i = 0; i < 10; i++) { const a = i / 10 * TAU + .3, d = r * (.3 + k * 1.2); sparkle(x + Math.cos(a) * d, y + Math.sin(a) * d, 18 * (1 - k) + 4, i % 2 ? P.gold : P.white, 1 - k); }
}
function snowflake(x, y, r, a = 1) {
  g.save(); g.globalAlpha *= a; g.strokeStyle = P.white; g.lineWidth = r * .22; g.lineCap = 'round';
  for (let i = 0; i < 3; i++) { const q = i / 3 * Math.PI; g.beginPath(); g.moveTo(x - Math.cos(q) * r, y - Math.sin(q) * r); g.lineTo(x + Math.cos(q) * r, y + Math.sin(q) * r); g.stroke(); }
  g.restore();
}

// ───────── the backyard: a hill, a deck chair, someone looking up; the arch across the sky
const HILL = '#3fa866', HILLD = '#2d8a52';
function backyard(t, night, archK, o = {}) {
  if (night) K.bg(t, '#090726', '#271a66');
  else { const gr = g.createLinearGradient(0, 0, 0, 1300); gr.addColorStop(0, '#5cc4f2'); gr.addColorStop(1, '#bfe9ff'); g.fillStyle = gr; g.fillRect(0, 0, W, H); K.sunBody(900, 300, 70, t); }
  // the arch: an ellipse from the east horizon to the west one
  if (archK > 0) {
    const ax = CX, ay = 1700, rx = 1050, ry = 1300, a0 = Math.PI, a1 = a0 + Math.PI * archK, bright = night ? 1 : .85;
    if (night) { g.save(); g.globalAlpha = .55 * (o.glow ?? 1); g.strokeStyle = 'rgba(255,240,200,.35)'; g.lineWidth = 260; g.beginPath(); g.ellipse(ax, ay, rx, ry, 0, a0, a1); g.stroke(); g.restore(); }
    for (const [k, w, col, al] of [[1, 70, night ? '#fff6dc' : '#ffffff', .95 * bright], [1.07, 40, night ? '#e9d7b0' : '#f3ecdc', .8 * bright], [1.13, 24, night ? '#fffbe8' : '#ffffff', .75 * bright], [.94, 16, '#d8c49c', .55 * bright]]) {
      g.save(); g.globalAlpha = al * (o.ra ?? 1); g.strokeStyle = col; g.lineWidth = w; g.beginPath(); g.ellipse(ax, ay, rx * k, ry * k, 0, a0, a1); g.stroke(); g.restore();
    }
  }
  if (o.ghost) { g.save(); g.globalAlpha = o.ghost; g.setLineDash([26, 22]); g.strokeStyle = 'rgba(255,240,200,.8)'; g.lineWidth = 10; g.beginPath(); g.ellipse(CX, 1700, 1050, 1300, 0, Math.PI, TAU); g.stroke(); g.restore(); }
  // the ground
  const lit = o.lit || 0;
  g.fillStyle = night ? `rgb(${lerp(22, 60, lit)},${lerp(40, 100, lit)},${lerp(70, 110, lit)})` : HILL;
  g.beginPath(); g.moveTo(0, 1290); g.quadraticCurveTo(CX, 1180, W, 1300); g.lineTo(W, H); g.lineTo(0, H); g.fill();
  g.fillStyle = night ? 'rgba(0,0,0,.3)' : HILLD; g.beginPath(); g.moveTo(0, 1420); g.quadraticCurveTo(CX, 1360, W, 1440); g.lineTo(W, H); g.lineTo(0, H); g.fill();
  K.deckchair(CX - 10, 1275, .95);
  K.person(CX - 60, 1300, .95, t, { mood: o.mood || 'happy', look: o.look ?? .2, lookY: -1, mug: o.mug });
  if (night && lit > 0) glow(CX - 60, 1050, 420, '255,240,200', .25 * lit);
}

// ───────── scenes
const SC = [];
SC[0] = (t) => {                                                   // hook: Earth in a Saturn ring; Saturn not amused
  K.bg(t);
  ringedEarth(CX, 1050, 250, t, 'smug', { look: -.4 });
  const ks = ss(seg(t, T.saturn - .4, T.saturn + .1)); if (ks > 0) { g.save(); g.globalAlpha = ks; saturn(lerp(1250, 860, eo(ks)), 1390, 85, t, 'annoyed'); g.restore(); if (t > T.saturn + .3) bubble(800, 1220, 270, 90, 'copycat.', pop(t, T.saturn + .3), P.navy, 1); }
  g.save(); g.translate(CX, 330); text('WHAT IF EARTH', 0, -20, 92, P.white, 1000, P.navy, 16); text('HAD RINGS?', 0, 110, 140, P.gold, 1000, P.navy, 18); g.restore();
};
SC[1] = (t) => {                                                   // the arch by day
  backyard(t, 0, eio(seg(t, T.arch - .3, T.across + .6)), { mood: t > T.arch + .3 ? 'love' : 'happy', look: .2 });
  const kw = pop(t, T.across + .2); if (kw > 0) bubble(830, 1000, 230, 90, 'whoa', kw, P.navy, -1);
};
SC[2] = (t) => {                                                   // by night: the ring still shines
  const lit = ss(seg(t, T.catch - .2, T.brighter + .4));
  backyard(t, 1, 1, { lit, glow: .4 + .6 * lit, mood: lit > .7 ? 'sleepy' : 'happy', look: .2 });
  K.moon(880, 830, 55, t, 'happy', { look: -1 });
  const kb = pop(t, T.brighter + .3); if (kb > 0) bubble(800, 1010, 330, 100, 'too bright!', kb, P.navy, -1);
};
SC[3] = (t) => {                                                   // the ring shadow and a colder winter
  K.bg(t);
  K.sunChar(-20, 520, 150, t, { mood: 'happy' }); glow(-20, 520, 600, '255,210,120', .15);
  const sh = ss(seg(t, T.shadows - .2, T.shadows + .6)), cold = ss(seg(t, T.winter - .2, T.colder + .3));
  const shiver = cold * Math.sin(t * 40) * 4;
  ringedEarth(CX + 120 + shiver, 1030, 260, t, cold > .5 ? 'worried' : 'happy', { look: -.5, under: () => {
    if (sh <= 0) return; g.save(); g.beginPath(); g.arc(CX + 120 + shiver, 1030, 260, 0, TAU); g.clip(); g.translate(CX + 120 + shiver, 1030); g.rotate(-.32);
    g.fillStyle = `rgba(8,6,40,${.72 * sh})`; g.fillRect(-300, 90, 600, 140); g.restore();
    for (let i = 0; i < 7; i++) { const R = mulberry(i + 11), fy = (R() + t * .25) % 1; snowflake(CX + 120 + shiver - 200 + R() * 400, 1080 + fy * 160 - (R() - .5) * 80, 10 + R() * 6, cold * .9); }
  } });
  const kl = ss(seg(t, T.shadows, T.shadows + .3)); if (kl > 0) { K.arrow(260, 1380, CX + 40, 1200, P.gold, 10, kl); text('ring shadow', 250, 1430, 50, P.gold, 1000, P.navy, 10, 'center', kl); }
  const kw = pop(t, T.colder); if (kw > 0) { g.save(); g.translate(860, 650); g.scale(kw, kw); card(0, 0, 300, 110, 1); text('COLDER', 0, 20, 60, P.cyan, 1000, null, 0); g.restore(); }
};
SC[4] = (t) => {                                                   // rocks vs a satellite
  K.bg(t);
  ringedEarth(CX, 1120, 300, t, t > T.smash ? 'scared' : 'worried', { tilt: -.12, rx: 2.1, ry: .36, look: -.6, lookY: -.4 });
  const hit = T.smash + .15, u = seg(t, VO.r05, hit), after = Math.max(0, t - hit);
  const sx = after > 0 ? lerp(175, -400, ss(clamp(after / 2))) : lerp(-150, 175, u), sy = after > 0 ? 1080 - after * 260 : lerp(600, 1080, u);
  satellite(sx, sy, .8, after > 0 ? -after * 6 : .35, t, after > 0 ? 'scared' : 'happy');
  for (let i = 0; i < 6; i++) { const R = mulberry(i + 70), rx = lerp(560, 205, seg(t, T.rocks - .3 + i * .08, hit)) + R() * 60, ry = 1110 + (R() - .5) * 60; if (t < hit + .1) rock(rx, ry, 14 + R() * 14, t * 2 + i); }
  burst(195, 1085, seg(t, hit, hit + .8), 110);
  const kc = pop(t, hit); if (kc > 0) { g.save(); g.translate(CX + 160, 600); g.scale(kc, kc); g.rotate(-.12); text('CRASH!', 0, 0, 120, P.red, 1000, P.white, 14); g.restore(); }
};
SC[5] = (t) => {                                                   // the Moon tugs, rocks collide, shooting stars
  K.bg(t);
  const tug = ss(seg(t, T.moon - .3, T.moon + .5)), wob = tug * Math.sin(t * 3.2) * .09;
  const mx = 880, my = 520 + Math.sin(t * 1.5) * 8;
  if (tug > 0) { g.save(); g.globalAlpha = tug; g.setLineDash([22, 16]); g.strokeStyle = P.gold; g.lineWidth = 8; g.beginPath(); g.moveTo(mx - 80, my + 60); g.quadraticCurveTo(820, 820, 840 + Math.sin(t * 3.2) * 20, 960); g.stroke(); g.restore(); }
  K.moon(mx, my, 110, t, tug > .5 ? 'keen' : 'happy', { look: -.6 });
  ringedEarth(CX - 60, 1080, 250, t, t > T.shooting ? 'scared' : 'worried', { tilt: -.3 + wob, ry: .42 + wob * .8, look: .5, lookY: -.6 });
  if (t > T.crashing - .2) for (let i = 0; i < 4; i++) { const ph = ((t - T.crashing) * 1.2 + i * .27) % 1, R = mulberry(i + 90), a = R() * Math.PI, px = CX - 60 + Math.cos(a) * 480 * Math.cos(-.3) - Math.sin(a) * 105 * Math.sin(-.3), py = 1080 + Math.cos(a) * 480 * Math.sin(-.3) + Math.sin(a) * 105 * Math.cos(-.3); burst(px, py, ph, 50); }
  if (t > T.shooting - .2) for (let i = 0; i < 5; i++) { const R = mulberry(i + 120), ph = ((t - T.shooting) * .9 + R()) % 1, x0 = 60 + R() * 300 + i * 120, y0 = 600 + R() * 120, x1 = CX - 60 + (R() - .5) * 220, y1 = 860;
    const x = lerp(x0, x1, ph), y = lerp(y0, y1, ph); g.save(); g.globalAlpha = Math.sin(ph * Math.PI); g.strokeStyle = '#ffd98a'; g.lineWidth = 7; g.lineCap = 'round'; g.beginPath(); g.moveTo(x - (x1 - x0) * .18, y - (y1 - y0) * .18); g.lineTo(x, y); g.stroke(); glow(x, y, 30, '255,220,140', .9); g.restore(); }
  const kn = pop(t, T.last); if (kn > 0) { g.save(); g.translate(300, 380); g.scale(kn, kn); card(0, 0, 360, 110, 1 - ss(seg(t, T.moon + .5, T.moon + .9))); text('NOT FOREVER', 0, 20, 52, P.gold, 1000, null, 0, 'center', 1 - ss(seg(t, T.moon + .5, T.moon + .9))); g.restore(); }
};
SC[6] = (t) => {                                                   // the twist
  g.fillStyle = '#04030c'; g.fillRect(0, 0, W, H); K.bg(t, P.bg0, P.bg1, .5);
  const kq = pop(t, VO.r07 + .1), kx = pop(t, T.already);
  K.earth(CX, 1080, 200, t, t > T.already ? 'scared' : 'worried', { look: 0, lookY: -.5 });
  if (t < T.already) { g.save(); g.translate(CX, 640); g.scale(kq, kq); text('?', 0, 60, 300, P.gold, 1000, P.navy, 20); g.restore(); }
  if (t > T.strange - .1 && t < T.strange + .5) { g.fillStyle = 'rgba(0,0,0,.5)'; g.fillRect(0, 0, W, H); }
  if (kx > 0) { g.save(); g.translate(CX, 560); g.scale(kx, kx); text('IT MIGHT HAVE', 0, -40, 80, P.white, 1000, P.navy, 14); text('HAD THEM', 0, 90, 130, P.gold, 1000, P.navy, 18); g.restore(); }
};
SC[7] = (t) => {                                                   // 466 million years ago: a rocky ring and a cooling Earth
  K.bg(t, '#120a30', '#2b1650');
  const kd = pop(t, VO.r08 + .05), kr = ss(seg(t, T.ring466 - .3, T.ring466 + .6)), cool = ss(seg(t, T.cool - .4, T.cool + .8));
  ringedEarth(CX, 1080, 240, t, cool > .5 ? 'sleepy' : 'happy', { bands: ROCK, ra: kr, sweep: kr, seed: 9, look: .3, under: () => {
    if (cool <= 0) return; g.save(); g.beginPath(); g.arc(CX, 1080, 240, 0, TAU); g.clip(); g.fillStyle = `rgba(255,255,255,${.92 * cool})`;
    g.beginPath(); g.ellipse(CX, 1080 - 240, 260, 60 + 90 * cool, 0, 0, TAU); g.fill(); g.beginPath(); g.ellipse(CX, 1080 + 240, 260, 50 + 80 * cool, 0, 0, TAU); g.fill(); g.restore();
  } });
  if (kd > 0) { g.save(); g.translate(CX, 470); g.scale(kd, kd); card(0, 0, 820, 230, 1); text('466 MILLION', 0, -10, 100, P.gold, 1000, null, 0); text('YEARS AGO', 0, 70, 56, P.white, 1000, null, 0); g.restore(); }
  const km = ss(seg(t, T.ring466 + .3, T.ring466 + .7)); if (km > 0) text('a rocky ring?', 800, 1400, 48, '#d8d2e6', 1000, P.navy, 10, 'center', km);
  const kc = ss(seg(t, T.cool - .2, T.cool + .2)); if (kc > 0) text('maybe an ice age', 300, 1400, 48, P.cyan, 1000, P.navy, 10, 'center', kc);
  const kn = ss(seg(t, VO.r08 + .8, VO.r08 + 1.2)) * (1 - ss(seg(t, T.ring466 + .1, T.ring466 + .5))); if (kn > 0) text('long before dinosaurs', CX, 650, 44, '#d8d2e6', 900, P.navy, 8, 'center', kn);
};
SC[8] = (t) => {                                                   // tonight: a plain sky, and the ghost of a ring
  const gh = ss(seg(t, T.once - .3, T.once + .6));
  backyard(t, 1, 0, { ghost: gh * .8, mood: gh > .5 ? 'wink' : 'happy', look: .2 });
  K.moon(880, 830, 55, t, 'happy', { look: -1 });
};

// ───────── captions: word-pops, key words in gold (lower middle, above the Shorts UI)
const FIX = { 'earth': 'Earth', 'moon': 'Moon' };
const KEY = new Set(['earth', 'rings', 'saturn', 'giant', 'arch', 'sky', 'night', 'sunlight', 'brighter', 'shadows', 'winter', 'shade', 'colder', 'space', 'rocks', 'smash', 'satellite', 'forever', 'moon', 'crashing', 'shooting', 'stars', 'strange', 'already', 'rocky', 'ring', '466', 'million', 'cool', 'planet', 'tonight', 'look', 'up']);
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
  rows.forEach((row, ri) => { const tot = row.reduce((p, w) => p + w.wd, 0); let x = CX - tot / 2; const y = 1600 + ri * 88;
    for (const w of row) { const k = clamp((t - w.t0) / .1); if (k > 0) { g.save(); g.globalAlpha = k; g.translate(x, y); const s = .85 + .15 * eo(k); g.scale(s, s); g.lineJoin = 'round'; g.lineWidth = 16; g.strokeStyle = P.navy; g.textAlign = 'left'; g.strokeText(w.s, 0, 0); g.fillStyle = KEY.has(nrm(w.k)) ? P.gold : P.white; g.fillText(w.s, 0, 0); g.restore(); } x += w.wd; } });
  g.restore();
}

// ───────── frame: a quick crossfade + push-in between scenes
function render(t) {
  g.setTransform(1, 0, 0, 1, 0, 0); g.globalAlpha = 1;
  const i = sceneAt(t), s0 = S[i], u = clamp((t - s0) / XF);
  const draw = (k, z, a) => { g.save(); g.globalAlpha = a; g.translate(CX, 1000); g.scale(z, z); g.translate(-CX, -1000); SC[k](t); g.restore(); };
  if (i > 0 && u < 1) { draw(i - 1, 1 + .08 * eio(u), 1); draw(i, 1.06 - .06 * eo(u), ss(u)); }
  else draw(i, 1 + (t - s0) * .006, 1);
  g.setTransform(1, 0, 0, 1, 0, 0); g.globalAlpha = 1;
  captions(t);
  const fo = seg(t, DUR - .6, DUR); if (fo > 0) { g.fillStyle = `rgba(0,0,0,${fo})`; g.fillRect(0, 0, W, H); }
}

// ───────── events for the score and the mix
const EV = [];
for (const [id, t] of Object.entries(VO)) EV.push({ type: 'vo', id, t });
for (const [k, v] of Object.entries(T)) EV.push({ type: 'cue', name: k, t: +v.toFixed(3) });
S.forEach((s, i) => { if (i > 0 && i < S.length - 1) EV.push({ type: 'scene', i, t: +s.toFixed(3) }); });
EV.sort((a, b) => a.t - b.t);
window.EV = EV; window.DUR = DUR; window.render = render;
window.SUBS = lines.map((l, i) => { const ws = words[l.id], t0 = VO[l.id] - .05, nx = lines[i + 1] ? VO[lines[i + 1].id] - .05 : DUR; return { t0, t1: Math.max(Math.min(VO[l.id] + ws[ws.length - 1][2] + .6, nx), t0 + 1.8), text: l.sub || l.text }; });
render(+(new URLSearchParams(location.search).get('t') ?? 1.5));
window.READY = true;
