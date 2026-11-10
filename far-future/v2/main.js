// "One Day the Night Sky Will Be Empty" (v2, story-first) — flat-vector explainer, vertical 1080×1920, canvas 2D, deterministic in t.
// Beyond Everything brand style (kit.js is shared with the Moon and Lazy Sun films). A gold time odometer at the top;
// every jump is a fast-forward: speed lines, a white flash, the counter rolling up to the next era.
import * as K from './kit.js';
import { clamp, lerp, seg, ss, eio, eo, mulberry, TAU } from '/core/lib.js';
const { P, text, sparkle, glow, card, bubble, face, pop } = K;

const W = 1080, H = 1920, CX = W / 2;
const cv = document.getElementById('c'), g = cv.getContext('2d');
K.setup(g, W, H); K.makeStars(110, 5);
await document.fonts.load('900 80px NU'); await document.fonts.load('800 40px NU');
const words = await (await fetch('voices/words.json')).json();
const lines = await (await fetch('lines.json')).json();
const dur = await (await fetch('voices/dur.json')).json();

// ───────── timeline: each line starts after the previous one plus a half-second jump
const IDS = lines.map(l => l.id), VO = {};
{ let t = .2; for (const id of IDS) { VO[id] = +t.toFixed(3); t += dur[id] + (id === 'b12' ? .7 : .45); } }
const DUR = +(VO.b13 + dur.b13 + 1.8).toFixed(2);
const nrm = s => s.toLowerCase().replace(/[^a-z0-9]/g, '');
const at = (id, w, k = 0, e = 1) => { let n = 0; for (const x of words[id]) if (nrm(x[0]).startsWith(nrm(w)) && n++ === k) return VO[id] + Math.max(0, x[e]); throw new Error(`${w} in ${id}`); };
const JUMP = .5;                                                   // the fast-forward window before each era
const S = [0, VO.b02 - .25, ...IDS.slice(2).map(id => VO[id] - JUMP), DUR];
const ERA = [0, 0, 1e3, 1e4, 1e5, 1e6, 1e7, 1e8, 1e9, 5e9, 1e10, 1e11, 0];
const SCENE_FOR = [14, 0, 1, 2, 3, 4, 5, 7, 9, 10, 11, 12, 13];
const NEVER = 1e9;
const T = {
  empty: at('b01', 'empty'), hold: at('b02', 'forward'),
  talk: at('b03', 'way'), old: at('b03', 'old'), north1: at('b03', 'english') + .4,
  vega: at('b04', 'vega'), nobody: at('b04', 'star') + .2,
  betel: at('b05', 'betelgeuse'), exploded: at('b05', 'exploded'), orion: at('b05', 'orion'),
  passing: at('b06', 'passing'), knocks: at('b06', 'knocks'),
  africa: at('b07', 'africa'), ocean: at('b07', 'ocean'),
  tears: NEVER, rings6: NEVER, crash: NEVER, pangaea: NEVER,
  rained: VO.b08 + .3, so7: at('b08', 'mars') - .1, fashion: at('b08', 'fashion'),
  brighter: at('b09', 'hotter'), boil: at('b09', 'boils'), lazy: at('b09', 'sun'), strange: at('b09', 'strange'),
  swells: at('b10', 'swells'), andromeda: at('b10', 'andromeda'), coin: at('b10', 'coin'),
  white: at('b11', 'white'), size: at('b11', 'dwarf') + .4,
  space: at('b12', 'space'), slipped: at('b12', 'vanished'), anyone: at('b12', 'anyone'),
  enjoy: at('b13', 'look'), limited: at('b13', 'limited'),
};
const sceneAt = t => { let i = 0; while (i < S.length - 2 && t >= S[i + 1]) i++; return i; };

// ───────── extra characters for this film
function starChar(x, y, r, t, col, o = {}) {                       // a four-point star with a face
  glow(x, y, r * 2.6, o.rgb || '255,240,180', .5 * (o.a ?? 1));
  g.save(); g.globalAlpha *= o.a ?? 1; sparkle(x, y, r * 1.5, col); g.fillStyle = col; g.beginPath(); g.arc(x, y, r * .62, 0, TAU); g.fill();
  g.translate(x, y); face(r * .55, o.mood || 'happy', t, o.look || 0, o.seed || 0, o.lookY || 0);
  if (o.badge) { g.fillStyle = P.white; g.beginPath(); g.roundRect(-r * 1.1, r * .75, r * 2.2, r * .5, r * .12); g.fill(); text(o.badge, 0, r * 1.1, r * .3, P.navy, 1000, null, 0); }
  if (o.mug) { g.fillStyle = P.white; g.beginPath(); g.roundRect(r * .7, -r * .1, r * .4, r * .45, r * .08); g.fill(); g.strokeStyle = P.white; g.lineWidth = r * .07; g.beginPath(); g.arc(r * 1.12, r * .12, r * .1, -1.4, 1.4); g.stroke(); }
  g.restore();
}
function planetChar(x, y, r, t, c1, c2, mood = 'happy', o = {}) {   // Mars, Saturn: banded ball, cel shadow, face
  g.save(); g.translate(x, y); glow(0, 0, r * 1.5, o.rgb || '255,150,110', .25);
  g.beginPath(); g.arc(0, 0, r, 0, TAU); g.save(); g.clip(); g.fillStyle = c1; g.fillRect(-r, -r, 2 * r, 2 * r);
  g.fillStyle = c2; for (const [v, h] of o.bands || [[-.45, .12], [.35, .1]]) { g.beginPath(); g.ellipse(0, v * r, r * 1.1, h * r, 0, 0, TAU); g.fill(); }
  for (const [cx, cy, s] of o.spots || []) { g.beginPath(); g.ellipse(cx * r, cy * r, s * r, s * r * .6, 0, 0, TAU); g.fill(); }
  g.fillStyle = 'rgba(40,20,70,.3)'; g.beginPath(); g.arc(r * .35, r * .1, r * 1.1, 0, TAU); g.arc(-r * .15, -r * .08, r * 1.02, 0, TAU, true); g.fill('evenodd');
  g.restore(); face(r, mood, t, o.look || 0, o.seed || 0, o.lookY || 0); g.restore();
}
function ringArc(x, y, rx, ry, tilt, a0, a1, col, w, dots = 0, t = 0, a = 1) {
  g.save(); g.globalAlpha *= a; g.translate(x, y); g.rotate(tilt);
  if (!dots) { g.strokeStyle = col; g.lineWidth = w; g.beginPath(); g.ellipse(0, 0, rx, ry, 0, a0, a1); g.stroke(); }
  else { const R = mulberry(31); for (let i = 0; i < dots; i++) { const th = a0 + R() * (a1 - a0) + t * .3, rr = 1 + (R() - .5) * .25; g.fillStyle = R() < .5 ? col : '#ffffff'; g.beginPath(); g.arc(Math.cos(th) * rx * rr, Math.sin(th) * ry * rr, 2 + R() * 5, 0, TAU); g.fill(); } }
  g.restore();
}
function galaxy(x, y, r, seed = 7, a = 1, rot = 0, tilt = .62) {
  if (a <= 0) return; const R = mulberry(seed); g.save(); g.globalAlpha = a;
  const c0 = g.createRadialGradient(x, y, 0, x, y, r * .4); c0.addColorStop(0, 'rgba(255,240,220,.95)'); c0.addColorStop(1, 'rgba(255,200,240,0)'); g.fillStyle = c0; g.fillRect(x - r, y - r, 2 * r, 2 * r);
  const n = Math.min(700, 120 + r * 3);
  for (let i = 0; i < n; i++) { const arm = i % 2, u = R(), th = u * 3.4 * Math.PI + arm * Math.PI + rot, rr = r * (.08 + .92 * u), j = (R() - .5) * r * .16;
    g.globalAlpha = a * (.3 + .6 * (1 - u)) * R(); g.fillStyle = R() < .5 ? '#ff9fd8' : R() < .5 ? '#8fe6ff' : '#fff2c8';
    g.beginPath(); g.arc(x + Math.cos(th) * rr + j, y + Math.sin(th) * rr * tilt + j * .6, 1 + R() * Math.max(1.5, r / 60), 0, TAU); g.fill(); }
  g.restore();
}
function africaEarth(x, y, r, t, split = 0) {                      // Earth turned to Africa, with the rift opening in the east
  g.save(); g.translate(x, y); glow(0, 0, r * 1.4, '90,170,255', .28);
  g.beginPath(); g.arc(0, 0, r, 0, TAU); g.save(); g.clip(); g.fillStyle = P.ocean; g.fillRect(-r, -r, 2 * r, 2 * r);
  const A = [[-.38, -.62], [-.05, -.68], [.22, -.6], [.34, -.42], [.52, -.18], [.5, -.02], [.36, .12], [.3, .36], [.16, .62], [.02, .72], [-.1, .56], [-.14, .3], [-.3, .1], [-.55, -.02], [-.62, -.28], [-.52, -.5]];
  const rift = [[.2, -.6], [.24, -.38], [.3, -.18], [.22, .02], [.18, .24], [.14, .48]];
  g.fillStyle = P.land; g.beginPath(); A.forEach(([u, v], i) => i ? g.lineTo(u * r, v * r) : g.moveTo(u * r, v * r)); g.closePath(); g.fill();
  g.fillStyle = '#e8c15a'; g.beginPath(); g.ellipse(-.15 * r, -.4 * r, .32 * r, .14 * r, 0, 0, TAU); g.fill();   // the Sahara
  g.fillStyle = P.land; g.beginPath(); g.ellipse(.55 * r, .42 * r, .05 * r, .14 * r, .3, 0, TAU); g.fill();         // Madagascar
  if (split > 0) { const w = split * .07 * r; g.strokeStyle = '#4aa0ff'; g.lineWidth = 6 + w; g.lineJoin = 'round'; g.lineCap = 'round'; g.beginPath(); rift.forEach(([u, v], i) => i ? g.lineTo(u * r, v * r) : g.moveTo(u * r, v * r)); g.stroke();
    g.fillStyle = P.land; g.beginPath(); g.moveTo(.2 * r, -.6 * r); rift.forEach(([u, v]) => g.lineTo(u * r + w * .6, v * r)); g.lineTo(.36 * r, .12 * r); g.lineTo(.5 * r, -.02 * r); g.lineTo(.52 * r, -.18 * r); g.closePath(); g.globalAlpha = 0; g.fill(); g.globalAlpha = 1; }
  g.fillStyle = 'rgba(255,255,255,.9)'; g.beginPath(); g.ellipse(0, -r * .93, r * .45, r * .12, 0, 0, TAU); g.fill();
  g.fillStyle = 'rgba(20,30,90,.28)'; g.beginPath(); g.arc(r * .35, r * .1, r * 1.1, 0, TAU); g.arc(-r * .15, -r * .08, r * 1.02, 0, TAU, true); g.fill('evenodd');
  g.restore(); g.restore();
}
function blob(cx, cy, s, seed, col) { const R = mulberry(seed); g.fillStyle = col; g.beginPath(); for (let i = 0; i <= 10; i++) { const a = i / 10 * TAU, rr = s * (.7 + .5 * R()); i ? g.lineTo(cx + Math.cos(a) * rr * 1.2, cy + Math.sin(a) * rr) : g.moveTo(cx + Math.cos(a) * rr * 1.2, cy + Math.sin(a) * rr); } g.closePath(); g.fill(); }
function coin(x, y, r, t, a = 1) {
  if (a <= 0) return; const sy = Math.cos(t * 14), up = Math.abs(Math.sin(t * 3.5)) * 120;
  g.save(); g.globalAlpha *= a; g.translate(x, y - up); g.scale(1, Math.max(.08, Math.abs(sy)));
  g.fillStyle = '#c98f12'; g.beginPath(); g.arc(0, 8, r, 0, TAU); g.fill(); g.fillStyle = P.gold; g.beginPath(); g.arc(0, 0, r, 0, TAU); g.fill();
  g.strokeStyle = '#ffe58a'; g.lineWidth = 6; g.beginPath(); g.arc(0, 0, r * .78, 0, TAU); g.stroke();
  text(sy > 0 ? 'HIT' : 'MISS', 0, r * .18, r * .5, P.navy, 1000, null, 0); g.restore();
}

// ───────── the odometer (top) and the fast-forward button
const fmt = n => Math.round(n).toLocaleString('en-US');
function odometer(t) {
  const k = sceneAt(t), u = k > 1 ? ss(seg(t, S[k], S[k] + JUMP)) : 1;
  const prev = ERA[Math.max(0, k - 1)], cur = ERA[k];
  card(CX, 175, 820, 150, 1, 'rgba(12,10,44,.82)');
  g.save(); g.strokeStyle = P.gold; g.lineWidth = 6; g.beginPath(); g.roundRect(CX - 410, 100, 820, 150, 26); g.stroke(); g.restore();
  if (cur === 0) { text('TODAY', CX, 200, 82, P.gold, 1000, null, 0); text(k === 12 ? 'back to' : 'now', CX, 133, 28, '#cfc4ff', 900, null, 0); }
  else { const v = Math.exp(lerp(Math.log(Math.max(1, prev)), Math.log(cur), u)), s = '+' + fmt(v), px = s.length > 14 ? 66 : s.length > 11 ? 74 : 82; text(s, CX, 200, px, P.gold, 1000, null, 0); text('YEARS FROM NOW', CX, 238, 26, '#cfc4ff', 900, null, 0); }
  const f = k > 1 && k < 12 ? 1 - seg(t, S[k], S[k] + .6) : 0;
  g.save(); g.translate(CX + 410, 175); g.fillStyle = f > 0 ? `rgba(255,77,109,${.6 + .4 * f})` : 'rgba(255,77,109,.5)'; g.beginPath(); g.arc(0, 0, 46 * (1 + .25 * f), 0, TAU); g.fill();
  g.fillStyle = P.white; for (const dx of [-16, 8]) { g.beginPath(); g.moveTo(dx - 10, -18); g.lineTo(dx + 14, 0); g.lineTo(dx - 10, 18); g.fill(); } g.restore();
}
function speedLines(t, k) {                                       // radial streaks during a jump
  if (k <= 0) return; const R = mulberry(Math.floor(t * 30));
  g.save(); g.globalAlpha = k; g.strokeStyle = 'rgba(255,255,255,.75)'; g.lineCap = 'round';
  for (let i = 0; i < 46; i++) { const a = R() * TAU, r0 = 200 + R() * 400, l = 200 + R() * 500; g.lineWidth = 3 + R() * 6; g.beginPath(); g.moveTo(CX + Math.cos(a) * r0, 900 + Math.sin(a) * r0); g.lineTo(CX + Math.cos(a) * (r0 + l), 900 + Math.sin(a) * (r0 + l)); g.stroke(); }
  g.restore();
}

// ───────── scenes
const SC = [];
// 0 · hook: Earth and the big fast-forward button
SC[0] = (t) => {
  K.bg(t);
  const press = ss(seg(t, T.hold, T.hold + .25));
  K.earth(CX - 190, 1010, 200, t, t > T.hold - .6 ? 'scared' : 'worried', { look: 1, lookY: .4 });
  // the button on a pedestal
  const bx = CX + 250, by = 1150;
  g.fillStyle = '#3a3366'; g.beginPath(); g.roundRect(bx - 110, by, 220, 210, 20); g.fill(); g.fillStyle = '#4a4290'; g.beginPath(); g.roundRect(bx - 130, by - 20, 260, 50, 20); g.fill();
  g.fillStyle = '#b8294a'; g.beginPath(); g.ellipse(bx, by - 20, 110, 40, 0, 0, TAU); g.fill();
  g.fillStyle = P.red; g.beginPath(); g.ellipse(bx, by - 50 + press * 26, 100, 38, 0, 0, TAU); g.fill(); g.fillRect(bx - 100, by - 50 + press * 26, 200, 30 - press * 26); g.beginPath(); g.ellipse(bx, by - 80 + press * 26, 100, 38, 0, 0, TAU); g.fill();
  g.fillStyle = P.white; for (const dx of [-24, 12]) { g.beginPath(); g.moveTo(bx + dx - 16, by - 96 + press * 26); g.lineTo(bx + dx + 20, by - 80 + press * 26); g.lineTo(bx + dx - 16, by - 64 + press * 26); g.fill(); }
  // Earth's stubby hand reaches for it
  const reach = ss(seg(t, T.hold - .5, T.hold)); g.save(); g.strokeStyle = P.land; g.lineWidth = 34; g.lineCap = 'round'; g.beginPath(); g.moveTo(CX - 30, 1000); g.quadraticCurveTo(CX + 80, 900 + 60 * reach, lerp(CX + 60, bx - 10, reach), lerp(1010, by - 90 + press * 26, reach)); g.stroke(); g.restore();
};
// 1 · 1,000 years: Old English and a drifting North Star
SC[1] = (t) => {
  K.bg(t);
  // the pole marker and the North Star sliding off it
  const px = CX, py = 520; g.save(); g.strokeStyle = 'rgba(185,168,255,.5)'; g.lineWidth = 4; g.setLineDash([12, 10]); g.beginPath(); g.arc(px, py, 70, 0, TAU); g.moveTo(px - 110, py); g.lineTo(px + 110, py); g.moveTo(px, py - 110); g.lineTo(px, py + 110); g.stroke(); g.setLineDash([]); g.restore();
  text('POLE', px + 120, py - 80, 28, '#cfc4ff', 900, null, 0);
  const dr = ss(seg(t, T.north1 - .2, T.north1 + 1.5));
  starChar(px + dr * 190, py + dr * 70, 62, t, '#fff1a8', { mood: dr > .3 ? 'worried' : 'happy', badge: 'NORTH STAR', look: -1 });
  // you and someone from the year 3000
  K.person(300, 1300, .8, t, { mood: 'happy', look: 1, lookY: 0 });
  g.save(); g.translate(780, 1300); g.scale(-1, 1); K.person(0, 0, .8, t, { mood: t > T.old ? 'worried' : 'happy', look: 1, lookY: 0 }); g.restore();
  g.save(); g.fillStyle = '#3fe0ff'; g.beginPath(); g.roundRect(700, 1010, 140, 34, 14); g.fill(); g.restore();          // a future visor
  const k1 = pop(t, T.talk - .3); if (k1 > 0) bubble(330, 870, 340, 110, t > T.old ? 'Hwæt up?' : "What's up?", k1, P.navy, 1);
  const k2 = pop(t, T.old + .2); if (k2 > 0) bubble(780, 890, 140, 110, '?!', k2, P.red, -1);
  text('Old English', 330, 790, 40, P.gold, 900, P.navy, 10, 'center', ss(seg(t, T.old, T.old + .3)) * (1 - ss(seg(t, T.north1 + 1.2, T.north1 + 1.6))));
};
// 2 · 10,000 years: Vega takes the pole; Polaris arrives late with a coffee
SC[2] = (t) => {
  K.bg(t);
  const px = CX + 40, py = 720; g.save(); g.strokeStyle = 'rgba(185,168,255,.5)'; g.lineWidth = 4; g.setLineDash([12, 10]); g.beginPath(); g.arc(px, py, 90, 0, TAU); g.moveTo(px - 140, py); g.lineTo(px + 140, py); g.moveTo(px, py - 140); g.lineTo(px, py + 140); g.stroke(); g.setLineDash([]); g.restore();
  // Earth's slow wobble swings its axis toward the new pole
  { const ex = 800, ey = 1180, wob = Math.sin((t - S[2]) * 2.2) * .35 - .15, ax = Math.sin(wob), ay = -Math.cos(wob);
    g.save(); g.strokeStyle = 'rgba(255,255,255,.7)'; g.lineWidth = 6; g.setLineDash([14, 10]); g.beginPath(); g.moveTo(ex - ax * 150, ey - ay * 150); g.lineTo(ex + ax * 260, ey + ay * 260); g.stroke(); g.setLineDash([]); g.restore();
    K.earth(ex, ey, 95, t, 'happy', { look: -.4, lookY: -.8 }); text('wobble', ex, ey + 160, 40, '#cfc4ff', 900, P.navy, 10, 'center', 1); }
  const kv = pop(t, T.vega - .2, .5); if (kv > 0) { g.save(); g.translate(px, py); g.scale(kv, kv); starChar(0, 0, 90, t, '#bfe8ff', { mood: 'smug', badge: 'NORTH STAR', rgb: '170,220,255', look: -1 }); g.restore(); text('Vega', px, py - 170, 52, '#bfe8ff', 1000, P.navy, 12, 'center', kv); }
  const arr = ss(seg(t, T.nobody - .9, T.nobody + .2));
  starChar(lerp(-120, 230, arr), 1120, 62, t, '#fff1a8', { mood: t > T.nobody + .1 ? 'scared' : 'happy', mug: 1, look: 1 });
  if (t > T.nobody + .2) { text('Polaris', 230, 1280, 44, P.white, 900, P.navy, 10, 'center', 1); bubble(380, 960, 120, 100, '!?', pop(t, T.nobody + .2), P.red, -1); }
};
// 3 · 100,000 years: Betelgeuse goes; Orion loses a shoulder
SC[3] = (t) => {
  K.bg(t, '#070420', '#160c40');
  const boom = seg(t, T.exploded - .1, T.exploded + .9), gone = t > T.exploded + .3, droop = ss(seg(t, T.orion, T.orion + .7));
  const O = { head: [540, 470], ls: [400, 600], rs: [690, 590], b1: [470, 840], b2: [545, 850], b3: [620, 860], lk: [430, 1190], rk: [680, 1180], rh: [790, 450] };
  const ls = [O.ls[0] - droop * 40, O.ls[1] + droop * 120];
  const lh = [lerp(310, 330, droop), lerp(420, 860, droop)];
  const L = [[O.head, O.rs], [O.head, ls], [ls, O.b1], [O.rs, O.b3], [O.b1, O.lk], [O.b3, O.rk], [O.rs, O.rh], [ls, lh], [O.b1, O.b2], [O.b2, O.b3]];
  g.save(); g.strokeStyle = 'rgba(185,168,255,.6)'; g.lineWidth = 5; g.lineCap = 'round'; for (const [a, b] of L) { g.beginPath(); g.moveTo(a[0], a[1]); g.lineTo(b[0], b[1]); g.stroke(); } g.restore();
  for (const p of [O.head, O.rs, O.b1, O.b2, O.b3, O.lk, O.rk, O.rh, lh]) { glow(p[0], p[1], 40, '200,220,255', .5); g.fillStyle = '#e8eeff'; g.beginPath(); g.arc(p[0], p[1], 10, 0, TAU); g.fill(); }
  if (!gone) { glow(ls[0], ls[1], 90, '255,90,60', .7); g.fillStyle = '#ff6a4a'; g.beginPath(); g.arc(ls[0], ls[1], 22, 0, TAU); g.fill(); }
  if (boom > 0 && boom < 1) { glow(ls[0], ls[1], 600 * eo(boom), '255,240,220', .9 * (1 - boom)); sparkle(ls[0], ls[1], 260 * Math.sin(boom * Math.PI), P.white); }
  text('Betelgeuse', 400, 700, 40, '#ff9a8a', 900, P.navy, 10, 'center', ss(seg(t, T.betel - .2, T.betel + .2)) * (gone ? 0 : 1));
  text('?', 330, 380, 110, P.gold, 1000, P.navy, 14, 'center', droop);
  text('Orion', CX, 1340, 52, P.white, 900, P.navy, 12, 'center', ss(seg(t, S[3] + .4, S[3] + .8)));
};
// 4 · 1 million years: Gliese 710 bowls through the comet cloud
SC[4] = (t) => {
  K.bg(t);
  K.sunChar(CX, 820, 70, t, { mood: t > T.knocks ? 'worried' : 'sleepy', look: .7 });
  const R = mulberry(6), cr = 420, knock = seg(t, T.knocks - .4, T.knocks + 1.4);
  const gu = seg(t, S[4] + .3, T.knocks + 1.4), gx = lerp(1180, -120, gu), gy = lerp(360, 1240, gu);
  for (let i = 0; i < 90; i++) {
    const a = R() * TAU, rr = cr * (.9 + R() * .25); let x = CX + Math.cos(a) * rr, y = 820 + Math.sin(a) * rr * .9;
    const near = Math.hypot(x - lerp(1180, -120, .62), y - lerp(360, 1240, .62)) < 260 && R() < .9;
    if (near && knock > 0) { const k = ss(knock); x = lerp(x, CX + (x - CX) * .35, k); y = lerp(y, 820 + (y - 820) * .35, k); g.save(); g.globalAlpha = .6 * k; g.strokeStyle = '#9fe9ff'; g.lineWidth = 5; g.beginPath(); g.moveTo(x, y); g.lineTo(x + (x - CX) * .25, y + (y - 820) * .25); g.stroke(); g.restore(); }
    g.fillStyle = near ? '#bff2ff' : 'rgba(200,210,255,.6)'; g.beginPath(); g.arc(x, y, near ? 6 : 4, 0, TAU); g.fill();
  }
  text('comet cloud', CX + 300, 400, 34, '#cfc4ff', 900, null, 0, 'center', ss(seg(t, S[4] + .3, S[4] + .7)) * (1 - ss(seg(t, T.passing, T.passing + .3))));
  starChar(gx, gy, 70, t, '#ffb36a', { mood: 'annoyed', rgb: '255,170,100', look: -1, lookY: 1 });
  text('Gliese 710', gx, gy - 120, 40, '#ffd2a8', 900, P.navy, 10, 'center', ss(seg(t, T.passing - .2, T.passing + .2)));
};
// 5 · 10 million years: Africa splits; a new ocean
SC[5] = (t) => {
  K.bg(t);
  const split = ss(seg(t, T.africa, T.ocean + .5));
  africaEarth(CX, 860, 400, t, split);
  const k = pop(t, T.ocean - .1); if (k > 0) { K.arrow(CX + 330, 1350, CX + 150, 1080, P.white, 12, k); g.save(); g.translate(CX + 300, 1400); g.scale(k, k); card(0, 0, 360, 90); text('new ocean', 0, 16, 50, P.cyan, 1000, null, 0); g.restore(); }
};
// 6 · 30 million years: Mars tears Phobos apart into a ring
SC[6] = (t) => {
  K.bg(t, '#140720', '#3a1430');
  const mx = CX, my = 860, tear = seg(t, T.tears - .1, T.tears + 1.0), ring = ss(seg(t, T.tears + .3, T.rings6 + .3));
  const happy = t > T.rings6 - .2;
  ringArc(mx, my, 360, 90, -.15, Math.PI, TAU, '#e8b8a0', 0, 260, t, ring);
  planetChar(mx, my, 220, t, '#e2603a', '#c44a2a', happy ? 'love' : tear > 0 ? 'smug' : 'happy', { spots: [[-.4, .3, .15], [.3, -.4, .1]], bands: [], look: .6 });
  ringArc(mx, my, 360, 90, -.15, 0, Math.PI, '#e8b8a0', 0, 260, t, ring);
  if (ring < 1) { const a = -.6 + (t - S[6]) * .5, px = mx + Math.cos(a) * 330, py = my + Math.sin(a) * 90 - 70;
    g.save(); g.globalAlpha = 1 - ring; g.translate(px, py); g.scale(1 + tear * 1.6, 1 - tear * .5);
    for (let i = 0; i < (tear > .2 ? 7 : 1); i++) { const R = mulberry(i + 1), ox = tear > .2 ? (R() - .5) * 90 * tear : 0, oy = tear > .2 ? (R() - .5) * 50 : 0; g.fillStyle = '#9a8f88'; g.beginPath(); g.ellipse(ox, oy, tear > .2 ? 16 : 46, tear > .2 ? 12 : 32, .3, 0, TAU); g.fill(); }
    if (tear < .2) { g.translate(0, 0); face(30, 'scared', t, -1, 2); }
    g.restore(); text('Phobos', px, py - 70, 38, '#e8dcff', 900, P.navy, 10, 'center', 1 - ss(seg(t, T.tears, T.tears + .4))); }
  // a hand mirror
  const km = pop(t, T.rings6, .45); if (km > 0) { g.save(); g.translate(mx + 300, my + 300); g.rotate(-.5); g.scale(km, km); g.fillStyle = '#c98f12'; g.fillRect(-10, 40, 20, 110); g.fillStyle = P.gold; g.beginPath(); g.ellipse(0, 0, 60, 76, 0, 0, TAU); g.fill(); g.fillStyle = '#bfe8ff'; g.beginPath(); g.ellipse(0, 0, 48, 64, 0, 0, TAU); g.fill(); g.fillStyle = 'rgba(255,255,255,.7)'; g.fillRect(-24, -40, 12, 50); g.restore(); }
  text('Mars', mx, 1320, 52, P.white, 900, P.navy, 12, 'center', ss(seg(t, S[6] + .4, S[6] + .8)));
};
// 7 · 100 million years: Saturn's rings rain away; Mars has rings, Saturn doesn't
SC[7] = (t) => {
  K.bg(t);
  const rain = ss(seg(t, T.rained - .3, T.rained + 1.0)), split = ss(seg(t, T.so7 - .2, T.so7 + .4));
  const sx = lerp(CX, 760, split), sy = 860, sr = lerp(230, 150, split);
  ringArc(sx, sy, sr * 2, sr * .55, -.25, Math.PI, TAU, '#f1d9a8', sr * .22, 0, t, 1 - rain);
  planetChar(sx, sy, sr, t, '#e8c27a', '#c99a52', rain > .6 ? 'sad' : 'happy', { bands: [[-.5, .1], [-.1, .08], [.35, .12]], rgb: '255,220,150', lookY: rain > .3 ? 1 : 0 });
  ringArc(sx, sy, sr * 2, sr * .55, -.25, 0, Math.PI, '#f1d9a8', sr * .22, 0, t, 1 - rain);
  if (rain > 0 && rain < 1) { const R = mulberry(5); for (let i = 0; i < 60; i++) { const a = R() * TAU, u = (R() + t * 1.4) % 1; const x0 = sx + Math.cos(a) * sr * 2 * Math.cos(-.25), y0 = sy + Math.sin(a) * sr * .55 + Math.cos(a) * sr * 2 * Math.sin(-.25); const x = lerp(x0, sx + (x0 - sx) * .3, u), y = lerp(y0, sy + (y0 - sy) * .3, u); g.fillStyle = `rgba(241,217,168,${.8 * (1 - u)})`; g.beginPath(); g.ellipse(x, y, 4, 9, 0, 0, TAU); g.fill(); } }
  if (split > 0) { g.save(); g.globalAlpha = split; ringArc(300, sy, 270, 64, -.15, Math.PI, TAU, '#e8b8a0', 0, 200, t); planetChar(300, sy, 150, t, '#e2603a', '#c44a2a', 'smug', { spots: [[-.4, .3, .15]], bands: [], look: 1 }); ringArc(300, sy, 270, 64, -.15, 0, Math.PI, '#e8b8a0', 0, 200, t); g.restore();
    text('Mars', 300, 1120, 48, P.white, 900, P.navy, 12, 'center', split); text('Saturn', 760, 1120, 48, P.white, 900, P.navy, 12, 'center', split); }
};
// 8 · 250 million years: the continents crash together; PANGAEA 2
SC[8] = (t) => {
  K.bg(t);
  const mx = 90, my = 520, mw = 900, mh = 560, u = ss(seg(t, T.crash - .3, T.crash + 1.2));
  g.save(); g.fillStyle = '#2f6fd0'; g.beginPath(); g.roundRect(mx, my, mw, mh, 40); g.fill(); g.clip();
  const C = [[[230, 680], [430, 760], 90, 3], [[300, 920], [470, 860], 80, 4], [[560, 640], [520, 760], 100, 5], [[600, 860], [560, 860], 90, 6], [[820, 700], [640, 780], 110, 7], [[860, 960], [620, 900], 60, 8]];
  for (const [a, b, s, seed] of C) blob(lerp(a[0], b[0], u), lerp(a[1], b[1], u), s, seed, P.land);
  g.restore();
  g.save(); g.strokeStyle = 'rgba(255,255,255,.3)'; g.lineWidth = 6; g.beginPath(); g.roundRect(mx, my, mw, mh, 40); g.stroke(); g.restore();
  const kp = pop(t, T.pangaea - .1, .5);
  if (kp > 0) { g.save(); g.translate(CX + 150, 1150); g.rotate(.08); g.scale(kp, kp); g.fillStyle = '#1b1840'; g.beginPath(); g.roundRect(-210, -150, 420, 300, 20); g.fill(); g.strokeStyle = P.gold; g.lineWidth = 8; g.stroke();
    text('PANGAEA 2', 0, -20, 70, P.gold, 1000, null, 0); text('THE SEQUEL', 0, 40, 36, P.white, 900, null, 0); text('★ ★ ★ ★ ★', 0, 100, 30, P.gold, 900, null, 0); g.restore(); }
};
// 9 · 1 billion years: the lazy Sun gets to work; the oceans boil away
SC[9] = (t) => {
  K.bg(t, '#200a2a', '#4a1a30');
  const work = ss(seg(t, T.lazy, T.lazy + .5)), heat = ss(seg(t, T.brighter - .3, T.boil + 1.2));
  K.sunChar(CX, 560, 230 + heat * 40, t, { mood: work > .5 ? 'keen' : heat > .3 ? 'smug' : 'sleepy', shades: work > .5 ? null : -1, mug: 1 - work, flare: heat * .6 });
  if (work > 0) { g.save(); g.globalAlpha = work; g.translate(CX, 560 - (230 + heat * 40) * .62); g.fillStyle = P.red; g.fillRect(-150, -20, 300, 26); g.restore(); }
  K.earth(CX, 1170, 190, t, heat > .5 ? 'scared' : 'worried', { grey: heat * .55, look: 0, lookY: -.8 });
  if (heat > .2) for (let i = 0; i < 6; i++) { const u = (t * .5 + i / 6) % 1; g.save(); g.globalAlpha = (1 - u) * .6 * heat; g.fillStyle = '#e8e4ff'; g.beginPath(); g.arc(CX - 150 + i * 60 + Math.sin(u * 6 + i) * 20, 980 - u * 240, 22 + u * 30, 0, TAU); g.fill(); g.restore(); }
  if (heat > .4) { g.fillStyle = '#7fd4ff'; for (const [dx, dy] of [[-150, -60], [160, -30]]) { g.beginPath(); g.ellipse(CX + dx, 1170 + dy, 12, 18, 0, 0, TAU); g.fill(); } }   // sweat
};
// 10 · 5 billion years: the red giant, Andromeda, a coin flip
SC[10] = (t) => {
  K.bg(t, '#1a0510', '#3a0a14');
  const sw = ss(seg(t, T.swells - .3, T.swells + 1.0));
  const r = lerp(140, 380, sw);
  glow(CX, 980, r * 2.2, '255,90,60', .5); g.fillStyle = '#ff7a4a'; g.beginPath(); g.arc(CX, 980, r * 1.1, 0, TAU); g.fill(); g.fillStyle = '#ff5a3c'; g.beginPath(); g.arc(CX, 980, r, 0, TAU); g.fill();
  g.save(); g.translate(CX, 980); face(r, sw > .5 ? 'smug' : 'sleepy', t, 0); g.restore();
  K.earth(CX + 330, 1360, 60, t, 'scared', { look: -1 });
  const ga = ss(seg(t, T.andromeda - .3, T.andromeda + .8)); galaxy(lerp(1250, 830, ga), lerp(200, 420, ga), 240, 9, ga, t * .1, .5);
  text('Andromeda', 820, 640, 44, '#ffc8ec', 900, P.navy, 10, 'center', ga);
  const kc = ss(seg(t, T.coin - .3, T.coin)); coin(260, 520, 100, t, kc);
};
// 11 · 10 billion years: a white dwarf the size of Earth
SC[11] = (t) => {
  K.bg(t, '#05041a', '#100a30');
  for (const [c, r0] of [['rgba(255,120,180,.18)', 470], ['rgba(120,200,255,.16)', 380]]) { g.save(); g.strokeStyle = c; g.lineWidth = 60; g.beginPath(); g.ellipse(CX, 860, r0, r0 * .82, .3, 0, TAU); g.stroke(); g.restore(); }
  const kw = pop(t, T.white - .2, .5);
  if (kw > 0) { g.save(); g.translate(CX - 120, 880); g.scale(kw, kw); glow(0, 0, 320, '220,235,255', .6); g.fillStyle = '#f4f7ff'; g.beginPath(); g.arc(0, 0, 110, 0, TAU); g.fill(); face(110, 'sleepy', t, .5, 0, .3);
    g.fillStyle = '#ff9fb8'; g.beginPath(); g.moveTo(-130, 40); g.quadraticCurveTo(0, 150, 130, 40); g.lineTo(140, 120); g.quadraticCurveTo(0, 200, -140, 120); g.fill(); g.restore(); }
  const ks = ss(seg(t, T.size - .3, T.size + .2));
  if (ks > 0) { g.save(); g.globalAlpha = ks; g.strokeStyle = P.cyan; g.lineWidth = 6; g.setLineDash([16, 12]); g.beginPath(); g.arc(CX + 200, 880, 110, 0, TAU); g.stroke(); g.setLineDash([]); g.restore(); K.earth(CX + 200, 880, 100, t, 'happy', { look: -1 }); text('same size', CX + 40, 1110, 50, P.cyan, 1000, P.navy, 12, 'center', ks); }
};
// 12 · 100 billion years: every other galaxy slips out of view
const GAL = (() => { const R = mulberry(41), a = []; for (let i = 0; i < 26; i++) { const ang = R() * TAU, d = 260 + R() * 520; a.push({ ang, d, r: 30 + R() * 40, s: i + 3, off: R() }); } return a; })();
SC[12] = (t) => {
  g.fillStyle = '#04030f'; g.fillRect(0, 0, W, H);
  const dark = ss(seg(t, T.space - .2, T.slipped + .6));
  K.bg(t, '#0a0626', '#1d1152', 1 - dark);
  for (const G of GAL) { const out = ss(seg(t, T.space - .4 + G.off * .8, T.slipped + .2 + G.off * .6)); const d = G.d * (1 + 1.6 * out); galaxy(CX + Math.cos(G.ang) * d, 880 + Math.sin(G.ang) * d * 1.1, G.r * (1 - .4 * out), G.s, 1 - out, t * .05, .6); }
  glow(CX, 880, 420, '255,200,240', .35); galaxy(CX, 880, 330, 77, 1, t * .05, .55);
  text('our merged galaxy', CX, 1210, 40, '#ffc8ec', 900, P.navy, 10, 'center', ss(seg(t, T.slipped, T.slipped + .4)));
  const ka = pop(t, T.anyone - .1, .5); if (ka > 0) { bubble(CX + 230, 600, 380, 110, 'Is this all?', ka, P.navy, -1); }
};
// 13 · today: enjoy it, it's a limited edition
SC[13] = (t) => {
  K.bg(t, '#0e0738', '#2a1466');
  galaxy(250, 440, 120, 12, .9, t * .05); galaxy(840, 640, 90, 13, .8, t * .05); galaxy(640, 330, 60, 14, .7, t * .05);
  K.deckchair(330, 1230, 1.1, P.red); K.deckchair(760, 1230, 1.1, P.cyan);
  K.person(320, 1230, .8, t, { mug: 1, mood: 'happy', look: .3, lookY: -.8 });
  K.earth(760, 1090, 120, t, 'love', { look: -.2, lookY: -.8 });
  const kl = pop(t, T.limited - .15, .4);
  if (kl > 0) { g.save(); g.translate(CX, 760); g.rotate(-.12); g.scale(kl, kl); g.fillStyle = P.gold; g.beginPath(); g.roundRect(-330, -70, 660, 140, 28); g.fill(); g.strokeStyle = P.white; g.lineWidth = 8; g.setLineDash([18, 10]); g.beginPath(); g.roundRect(-312, -54, 624, 108, 20); g.stroke(); g.setLineDash([]); text('LIMITED EDITION', 0, 24, 66, P.navy, 1000, null, 0); g.restore(); }
};

// 14 · hook: today's sky, then everything blinks out
const HGAL = [[230, 520, 120, 21], [820, 700, 95, 22], [640, 420, 60, 23], [300, 900, 70, 24], [860, 1030, 55, 25]];
SC[14] = (t) => {
  g.fillStyle = '#05040f'; g.fillRect(0, 0, W, H);
  const out = ss(seg(t, .5, T.empty + .3));
  K.bg(t, '#0e0738', '#2a1466', 1 - out * .97);
  HGAL.forEach(([x, y, r, sd], i) => galaxy(x, y, r, sd, 1 - ss(seg(t, .5 + i * .3, .9 + i * .3)), t * .05));
  { g.save(); g.translate(CX, 1500 - 330); text('THIS SKY WILL', 0, -330, 88, P.white, 1000, P.navy, 16); text('DISAPPEAR', 0, -200, 132, P.gold, 1000, P.navy, 18); g.restore(); }
  K.earth(CX, 1180, 150, t, out > .5 ? 'scared' : 'worried', { look: .3, lookY: -1 });
};

// ───────── captions: word-pops, key words in gold (lower middle, above the Shorts UI)
const FIX = { 'neighborhood': 'neighbourhood', 'beetlejuice': 'Betelgeuse' };
const KEY = new Set(['empty', 'completely', 'fashion', 'cyclical', 'strange', 'vanished', 'entire', 'forward', 'africa', 'splits', 'hundred', 'billion', '90', 'seconds', 'thousand', 'old', 'english', 'north', 'star', 'vega', '10', '000', '100', 'beetlejuice', 'exploded', 'shoulder', 'million', 'comets', 'africa', 'ocean', '30', 'mars', 'rings', 'saturn', '250', 'pangaea', 'sequel', '1', 'boil', 'lazy', '5', 'red', 'giant', 'andromeda', 'coin', 'flip', 'white', 'dwarf', 'earth', 'universe', 'limited', 'edition', 'one', 'two']);
const CAP = [];
for (const [id, ws] of Object.entries(words)) {
  const toks = []; for (const w of ws) { const s = FIX[w[0].toLowerCase().replace(/[.,]$/, '')] ? FIX[w[0].toLowerCase().replace(/[.,]$/, '')] + (w[0].match(/[.,]$/)?.[0] || '') : w[0]; if (/^[,.]/.test(s) && toks.length) { const p = toks[toks.length - 1]; p.w += s; p.t1 = w[2]; } else toks.push({ w: s, k: w[0], t0: Math.max(0, w[1]), t1: w[2] }); }
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
  rows.forEach((row, ri) => { const tot = row.reduce((p, w) => p + w.wd, 0); let x = CX - tot / 2; const y = 1530 + ri * 88;
    for (const w of row) { const k = clamp((t - w.t0) / .1); if (k > 0) { g.save(); g.globalAlpha = k; g.translate(x, y); const s = .85 + .15 * eo(k); g.scale(s, s); g.lineJoin = 'round'; g.lineWidth = 16; g.strokeStyle = P.navy; g.textAlign = 'left'; g.strokeText(w.s, 0, 0); g.fillStyle = KEY.has(nrm(w.k)) ? P.gold : P.white; g.fillText(w.s, 0, 0); g.restore(); } x += w.wd; } });
  g.restore();
}

// ───────── frame: a fast-forward between eras (zoom-through, streaks, flash), the odometer on top
function render(t) {
  g.setTransform(1, 0, 0, 1, 0, 0); g.globalAlpha = 1;
  const i = sceneAt(t), s0 = S[i];
  const draw = (k, tt, z, a) => { g.save(); g.globalAlpha = a; g.translate(CX, 900); g.scale(z, z); g.translate(-CX, -900); SC[SCENE_FOR[k]](tt); g.restore(); };
  const u = clamp((t - s0) / JUMP);
  if (i > 1 && u < 1) { draw(i - 1, t, 1 + .5 * eio(u), 1 - ss(seg(u, .35, .7))); if (u > .35) draw(i, t, 1.25 - .25 * eo(seg(u, .35, 1)), ss(seg(u, .35, .8))); speedLines(t, Math.sin(u * Math.PI)); const fl = 1 - Math.abs(u - .5) / .15; if (fl > 0) { g.fillStyle = `rgba(255,255,255,${.55 * fl})`; g.fillRect(0, 0, W, H); } }
  else draw(i, t, 1 + (t - s0) * .004, 1);
  g.setTransform(1, 0, 0, 1, 0, 0); g.globalAlpha = 1;
  odometer(t);
  captions(t);
  const fi = 0, fo = seg(t, DUR - .6, DUR); if (fi > 0 || fo > 0) { g.fillStyle = `rgba(0,0,0,${Math.max(fi, fo)})`; g.fillRect(0, 0, W, H); }
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
