// "What If a Black Hole Replaced Our Sun?" — flat-vector explainer, vertical 1080×1920, canvas 2D, deterministic in t.
// Beyond Everything brand style (kit.js shared with the Sun Vanished and Magnetic Field films). Fourteen beats, one per
// line: the swap, Earth not swallowed (same mass, same pull), the tiny dark hole, the last eight minutes of sunlight, a
// black sky at noon, cities on street lights, the strained grid, the first week's freeze, dying crops, the weather
// winding down, the frozen oceans, people and vent life hanging on, why the Sun can't do this, and the payoff: still
// orbiting, in the dark. The last frame loops.
import * as K from './kit.js';
import { clamp, lerp, seg, ss, eio, eo, mulberry, TAU } from '/core/lib.js';
const { P, text, sparkle, glow, card, bubble, pop } = K;
import * as PR from './props.js';

const W = 1080, H = 1920, CX = W / 2;
const cv = document.getElementById('c'), g = cv.getContext('2d');
K.setup(g, W, H); K.makeStars(120, 33); PR.setup(g, W, H);
await document.fonts.load('900 80px NU'); await document.fonts.load('800 40px NU');
const words = await (await fetch('voices/words.json')).json();
const lines = await (await fetch('lines.json')).json();
const dur = await (await fetch('voices/dur.json')).json();

// ───────── timeline: one scene per line. The takes are already trimmed (tools/voice.py), so a small gap is enough.
const IDS = lines.map(l => l.id), VO = {};
const LINE_GAP = .2, GAP = { s04: .3, s12: .35 };                    // a beat before the lights go out, and before "the good news"
{ let t = .25; for (const id of IDS) { VO[id] = +t.toFixed(3); t += dur[id] + (GAP[id] ?? LINE_GAP); } }
const LAST = IDS[IDS.length - 1], DUR = +(VO[LAST] + dur[LAST] + 1.4).toFixed(2);
const nrm = s => s.toLowerCase().replace(/[^a-z0-9]/g, '');
const at = (id, w, k = 0, e = 1) => { let n = 0; for (const x of words[id]) if (nrm(x[0]).startsWith(nrm(w)) && n++ === k) return VO[id] + Math.max(0, x[e]); throw new Error(`${w} in ${id}`); };
const S = [0, ...IDS.slice(1).map(id => VO[id] - .2), DUR];
const sceneAt = t => { let i = 0; while (i < S.length - 2 && t >= S[i + 1]) i++; return i; };
const XF = .4, LOOP = .7;
const T = {
  imagine: at('s01', 'imagine'), replaced: at('s01', 'replaced'), black1: at('s01', 'black'), mass: at('s01', 'mass'),
  swallowed: at('s02', 'swallowed'), no: at('s02', 'no'), pull: at('s02', 'pull'), same: at('s02', 'same'), orbiting: at('s02', 'orbiting'),
  tiny: at('s03', 'tiny'), six: at('s03', 'six'), glow: at('s03', 'glow'),
  eight: at('s04', 'eight'), nothing: at('s04', 'nothing'), sunlight: at('s04', 'sunlight'), way: at('s04', 'way'),
  lights: at('s05', 'lights'), out: at('s05', 'out'), daytime: at('s05', 'daytime'), black5: at('s05', 'black'), moon: at('s05', 'moon'), dark: at('s05', 'dark'),
  cities: at('s06', 'cities'), street: at('s06', 'street'), allday: at('s06', 'day'), solar: at('s06', 'solar'), power: at('s06', 'power'),
  heating: at('s07', 'heating'), once: at('s07', 'once'), grids: at('s07', 'grids'), struggle: at('s07', 'struggle'),
  week: at('s08', 'week'), temperature: at('s08', 'temperature'), eighteen: at('s08', 'eighteen'),
  plants: at('s09', 'plants'), food: at('s09', 'food'), crops: at('s09', 'crops'), animals: at('s09', 'animals'), hungry: at('s09', 'hungry'),
  weather: at('s10', 'weather'), heat: at('s10', 'heat'), wind: at('s10', 'wind'), rain: at('s10', 'rain'),
  seventy: at('s11', 'seventy'), oceans: at('s11', 'oceans'), freeze: at('s11', 'freeze'), thicker: at('s11', 'thicker'),
  people: at('s12', 'people'), underground: at('s12', 'underground'), nuclear: at('s12', 'nuclear'), geothermal: at('s12', 'geothermal'), vents: at('s12', 'vents'),
  good: at('s13', 'good'), cant: at('s13', 'cant'), small: at('s13', 'small'), black13: at('s13', 'black'),
  nightmare: at('s14', 'nightmare'), swallowed14: at('s14', 'swallowed'), orbiting14: at('s14', 'orbiting'), alive: at('s14', 'alive'),
};
const SWAP = T.replaced - .1;                                       // the moment the Sun becomes a black hole

function tag(x, y, s, sub, k, col = P.gold) {
  if (k <= 0) return; g.save(); g.font = '1000 76px NU'; const w = Math.max(520, g.measureText(s).width + 120); g.translate(x, y); g.scale(k, k); card(0, 0, w, sub ? 180 : 120, 1);
  text(s, 0, sub ? 8 : 22, 76, col, 1000, null, 0); if (sub) { g.font = '800 40px NU'; text(sub, 0, 62, 40, P.white, 800, null, 0); } g.restore();
}
const bg = (t, top = P.bg0, bot = P.bg1) => K.bg(t, top, bot, g.globalAlpha);
function stamp(s, x, y, px, col, k, rot = -.06) { if (k <= 0) return; g.save(); g.translate(x, y); g.rotate(rot); g.scale(k, k); text(s, 0, 0, px, col, 1000, P.navy, px * .16); g.restore(); }

// ───────── the black hole: a dark ball ringed by bent starlight. o.mood draws a face in light ink, o.disk (0..1) a glowing
// meal disk, o.horizon a dashed event-horizon ring. Drawn far bigger than to scale (the real one is about 6 km wide).
function hole(x, y, r, t, o = {}) {
  g.save(); g.translate(x, y);
  glow(0, 0, r * 2.4, '140,90,255', .22);
  if (o.disk) { g.save(); g.globalAlpha *= o.disk; g.scale(1, .32); for (let i = 0; i < 3; i++) { const gr = g.createRadialGradient(0, 0, r * 1.1, 0, 0, r * (2.6 - i * .3)); gr.addColorStop(0, 'rgba(255,220,120,.95)'); gr.addColorStop(.5, 'rgba(255,130,60,.6)'); gr.addColorStop(1, 'rgba(255,90,60,0)'); g.fillStyle = gr; g.beginPath(); g.arc(0, 0, r * 2.6, 0, TAU); g.fill(); } g.restore(); }
  g.lineWidth = r * .05; for (let i = 0; i < 3; i++) { g.strokeStyle = `rgba(${['220,200,255', '170,140,255', '255,210,240'][i]},${.75 - i * .2})`; g.beginPath(); g.ellipse(0, 0, r * (1.06 + i * .07), r * (1.06 + i * .07), t * .2 + i, 0, TAU); g.stroke(); }
  for (let i = 0; i < 6; i++) { const a = t * (.4 + i * .05) + i * 1.05, rr = r * (1.14 + (i % 3) * .07); sparkle(Math.cos(a) * rr, Math.sin(a) * rr, r * .07, '#efe8ff', .7); }
  g.fillStyle = '#030208'; g.beginPath(); g.arc(0, 0, r, 0, TAU); g.fill();
  if (o.disk) { g.save(); g.globalAlpha *= o.disk; g.beginPath(); g.rect(-r * 3, 0, r * 6, r * 3); g.clip(); g.scale(1, .32); const gr = g.createRadialGradient(0, 0, r * 1.05, 0, 0, r * 2.6); gr.addColorStop(0, 'rgba(255,230,150,1)'); gr.addColorStop(.5, 'rgba(255,140,60,.7)'); gr.addColorStop(1, 'rgba(255,90,60,0)'); g.fillStyle = gr; g.beginPath(); g.arc(0, 0, r * 2.6, 0, TAU); g.arc(0, 0, r * 1.02, 0, TAU, true); g.fill('evenodd'); g.restore(); }
  if (o.horizon) { g.save(); g.globalAlpha *= o.horizon; g.strokeStyle = P.gold; g.lineWidth = 6; g.setLineDash([22, 16]); g.lineDashOffset = -t * 30; g.beginPath(); g.arc(0, 0, r * 1.0, 0, TAU); g.stroke(); g.restore(); }
  if (o.mood) { const nv = P.navy; P.navy = '#d9d2ff'; K.face(r * .8, o.mood, t, o.look || 0, 1.9, 0); P.navy = nv; }
  g.restore();
}
function orbit(x, y, R, a = 1, col = 'rgba(185,168,255,.5)') { if (a <= 0) return; g.save(); g.globalAlpha *= a; g.strokeStyle = col; g.lineWidth = 5; g.setLineDash([18, 16]); g.beginPath(); g.arc(x, y, R, 0, TAU); g.stroke(); g.restore(); }
function astronaut(x, y, s, t, mood, o = {}) {                      // o.rot, o.sx / o.sy (stretch)
  g.save(); g.translate(x, y); g.rotate(o.rot || 0); g.scale(s * (o.sx || 1), s * (o.sy || 1));
  g.fillStyle = '#eef0f8'; g.beginPath(); g.roundRect(-50, 20, 100, 120, 36); g.fill();
  g.strokeStyle = '#eef0f8'; g.lineWidth = 34; g.lineCap = 'round'; g.beginPath(); g.moveTo(-40, 50); g.lineTo(-90, 110 + Math.sin(t * 3) * 10); g.moveTo(40, 50); g.lineTo(90, 0 + Math.cos(t * 3) * 10); g.moveTo(-25, 130); g.lineTo(-30, 190); g.moveTo(25, 130); g.lineTo(35, 190); g.stroke();
  g.fillStyle = P.red; g.fillRect(-50, 70, 100, 14);
  g.fillStyle = '#eef0f8'; g.beginPath(); g.arc(0, -30, 72, 0, TAU); g.fill();
  g.fillStyle = '#20264f'; g.beginPath(); g.roundRect(-52, -70, 104, 78, 34); g.fill();
  g.save(); g.translate(0, -30); K.face(44, mood, t, 0, 1.1, 0); g.restore();
  g.restore();
}
function noodle(x, y, len, t, col = '#ffd36a', a = 1) {            // a wiggly spaghetti strand
  if (a <= 0) return; g.save(); g.globalAlpha *= a; g.strokeStyle = col; g.lineWidth = 12; g.lineCap = 'round'; g.beginPath();
  for (let i = 0; i <= 30; i++) { const u = i / 30; g.lineTo(x + Math.sin(u * 9 + t * 4) * 18, y + u * len); } g.stroke(); g.restore();
}
function scale(x, y, t, a = 1, tilt = 0) {                           // a balance: beam, two pans
  if (a <= 0) return; g.save(); g.globalAlpha *= a; g.translate(x, y);
  g.fillStyle = '#c9b8ff'; g.beginPath(); g.moveTo(-60, 330); g.lineTo(60, 330); g.lineTo(14, 0); g.lineTo(-14, 0); g.fill();
  g.rotate(tilt); g.fillStyle = '#e9e2ff'; g.beginPath(); g.roundRect(-380, -14, 760, 28, 14); g.fill();
  g.strokeStyle = '#e9e2ff'; g.lineWidth = 5; for (const sd of [-1, 1]) { g.beginPath(); g.moveTo(sd * 360, 0); g.lineTo(sd * 360 - 120, 200); g.moveTo(sd * 360, 0); g.lineTo(sd * 360 + 120, 200); g.stroke();
    g.fillStyle = '#e9e2ff'; g.beginPath(); g.ellipse(sd * 360, 210, 150, 26, 0, 0, TAU); g.fill(); }
  g.fillStyle = P.gold; g.beginPath(); g.arc(0, 0, 22, 0, TAU); g.fill(); g.restore();
}
const sunAt = (x, y, r, t, mood = 'sleepy', o = {}) => K.sunChar(x, y, r, t, { mood, shades: o.shades ?? .6, look: o.look ?? 0, mug: o.mug, sip: o.sip, flare: o.flare, grey: o.grey });
function frost(x, y, r, k) {                                        // ice creeping over a planet
  if (k <= 0) return; g.save(); g.beginPath(); g.arc(x, y, r, 0, TAU); g.clip(); g.globalAlpha = .75 * k; g.fillStyle = '#dff3ff';
  for (const sd of [-1, 1]) { g.beginPath(); g.ellipse(x, y + sd * r, r * 1.3, r * (.15 + .9 * k), 0, 0, TAU); g.fill(); }
  g.globalAlpha = .35 * k; g.fillRect(x - r, y - r, 2 * r, 2 * r); g.restore();
}

function moonDisk(x, y, r, t, dark) {                                // the Moon in the sky; dark 0..1 = no sunlight on it
  K.moon(x, y, r, t, dark > .5 ? 'worried' : 'sleepy');
  if (dark > 0) { g.save(); g.globalAlpha = .82 * dark; g.fillStyle = '#0b0a1c'; g.beginPath(); g.arc(x, y, r + 2, 0, TAU); g.fill(); g.restore(); g.save(); g.globalAlpha = .5 * dark; g.strokeStyle = '#3a3670'; g.lineWidth = 4; g.beginPath(); g.arc(x, y, r, 0, TAU); g.stroke(); g.restore(); }
}
function nightSky(k = 1) {                                          // black daytime sky with stars
  g.fillStyle = '#05040f'; g.fillRect(0, 0, W, H);
  for (let i = 0; i < 70; i++) { const R = mulberry(i + 70); g.fillStyle = `rgba(220,215,255,${(.3 + .6 * R()) * k})`; g.beginPath(); g.arc(R() * W, R() * 1300, 1.5 + R() * 2.5, 0, TAU); g.fill(); }
}
function lit(x, y, r, a) { if (a > 0) glow(x, y, r, '255,220,120', .45 * a); }
function panel(x, y, w, k) {                                        // a rooftop solar panel; k = 0 working, 1 dead
  g.save(); g.translate(x, y); g.rotate(-.25); g.fillStyle = '#28408f'; g.fillRect(-w / 2, -20, w, 40);
  g.strokeStyle = 'rgba(160,200,255,.6)'; g.lineWidth = 2; for (let i = 1; i < 4; i++) { g.beginPath(); g.moveTo(-w / 2 + i * w / 4, -20); g.lineTo(-w / 2 + i * w / 4, 20); g.stroke(); }
  g.fillStyle = `rgba(255,240,150,${.6 * (1 - k)})`; g.fillRect(-w / 2, -20, w, 40); g.restore();
}
function pylon(x, y, s, t, spark) {
  g.save(); g.translate(x, y); g.scale(s, s); g.strokeStyle = '#8a8fb0'; g.lineWidth = 10; g.lineCap = 'round';
  g.beginPath(); g.moveTo(-80, 0); g.lineTo(0, -520); g.lineTo(80, 0); g.moveTo(-60, -120); g.lineTo(60, -120); g.moveTo(-40, -260); g.lineTo(40, -260); g.moveTo(-120, -420); g.lineTo(120, -420); g.moveTo(-60, -120); g.lineTo(40, -260); g.moveTo(60, -120); g.lineTo(-40, -260); g.stroke();
  if (spark > 0) { const R = mulberry(Math.floor(t * 10)); for (let i = 0; i < 3; i++) sparkle((R() - .5) * 240, -420 + (R() - .5) * 40, 30 + R() * 30, '#fff3a0', spark); }
  g.restore();
}
function cow(x, y, s, t, mood) {
  g.save(); g.translate(x, y); g.scale(s, s);
  g.fillStyle = '#f4f1ea'; for (const lx of [-70, -30, 40, 80]) g.fillRect(lx - 14, 30, 28, 110);
  g.beginPath(); g.roundRect(-120, -70, 240, 130, 60); g.fill();
  g.fillStyle = '#3a3550'; for (const [sx, sy, r] of [[-60, -30, 30], [30, 0, 24], [80, -40, 18]]) { g.beginPath(); g.arc(sx, sy, r, 0, TAU); g.fill(); }
  g.fillStyle = '#f4f1ea'; g.beginPath(); g.ellipse(160, -70, 70, 62, 0, 0, TAU); g.fill();
  g.fillStyle = '#ffb3c1'; g.beginPath(); g.ellipse(190, -40, 44, 28, 0, 0, TAU); g.fill();
  g.fillStyle = '#d9c7a0'; for (const sd of [-1, 1]) { g.beginPath(); g.ellipse(160 + sd * 50, -125, 12, 26, sd * .5, 0, TAU); g.fill(); }
  g.save(); g.translate(150, -85); K.face(40, mood, t, .4, 3.7, 0); g.restore();
  g.restore();
}
function stalk(x, y, h, wilt, t, i) {                               // a crop plant: green and upright -> brown and drooping
  const c = `rgb(${lerp(95, 150, wilt)},${lerp(207, 110, wilt)},${lerp(122, 60, wilt)})`, sw = Math.sin(t * 1.5 + i) * 4 * (1 - wilt);
  g.save(); g.strokeStyle = c; g.lineWidth = 8; g.lineCap = 'round'; g.beginPath(); g.moveTo(x, y); g.quadraticCurveTo(x + sw, y - h * .6, x + sw + wilt * 60, y - h + wilt * h * .45); g.stroke();
  g.fillStyle = c; for (let k = 1; k < 4; k++) { const yy = y - h * k / 4.2, d = (k % 2 ? 1 : -1); g.beginPath(); g.ellipse(x + d * 26, yy + wilt * 30, 30, 10, d * (.5 + wilt * 1.1), 0, TAU); g.fill(); }
  g.fillStyle = wilt > .5 ? '#a98a4a' : '#ffd36a'; g.beginPath(); g.ellipse(x + sw + wilt * 60, y - h + wilt * h * .45 - 14, 14, 26, wilt * 1.4, 0, TAU); g.fill(); g.restore();
}
function vent(x, y, s, t) {
  g.save(); g.translate(x, y); g.scale(s, s);
  glow(0, -120, 160, '255,120,60', .35);
  g.fillStyle = '#4a3a5a'; g.beginPath(); g.moveTo(-90, 0); g.lineTo(-40, -150); g.lineTo(40, -150); g.lineTo(90, 0); g.fill();
  for (let i = 0; i < 6; i++) { const p = (t * .5 + i / 6) % 1; g.fillStyle = `rgba(60,50,80,${.7 * (1 - p)})`; g.beginPath(); g.arc(Math.sin(p * 6 + i) * 20 * p, -160 - p * 320, 26 + p * 50, 0, TAU); g.fill(); }
  g.restore();
}

// ───────── scenes
const SC = [];
SC[0] = (t) => {                                                    // hook: the Sun becomes a black hole
  bg(t);
  const cx = CX, cy = 1000, R = 360, on = t >= SWAP, k = ss(seg(t, SWAP, SWAP + .35));
  orbit(cx, cy, R);
  if (k < 1) { g.save(); g.globalAlpha *= 1 - k; sunAt(cx, cy, 170 * (1 - .5 * k), t, 'sleepy', { shades: .6 }); g.restore(); }
  if (on) hole(cx, cy, lerp(40, 120, eo(k)), t, { mood: 'smug' });
  if (on && t < SWAP + .2) { g.save(); g.globalAlpha = .45 * (1 - (t - SWAP) / .2); g.fillStyle = '#efe6ff'; g.fillRect(0, 0, W, H); g.restore(); }
  const ang = -.6 + t * .35, ex = cx + Math.cos(ang) * R, ey = cy + Math.sin(ang) * R;
  K.earth(ex, ey, 80, t, !on ? 'happy' : 'scared', { look: on ? -Math.cos(ang) : 0 });
  const km = pop(t, T.mass - .1); if (km > 0) bubble(ex + 20, ey - 150, 300, 84, 'same mass?!', km, P.navy, -1);
  g.save(); g.translate(CX, 230); text('WHAT IF A BLACK HOLE', 0, -10, 76, P.white, 1000, P.navy, 16); text('REPLACED OUR SUN?', 0, 100, 92, P.gold, 1000, P.navy, 20); g.restore();
  text('not to scale', CX - 300, 1440, 34, 'rgba(255,255,255,.55)', 800, null, 0, 'center', k);
};
SC[1] = (t) => {                                                    // swallowed? no: same pull, same orbit
  bg(t);
  const cx = CX, cy = 1000, R = 380; orbit(cx, cy, R, 1, 'rgba(63,224,255,.55)');
  hole(cx, cy, 100, t, { mood: t > T.no ? 'sleepy' : 'smug' });
  const ang = .5 + (t - VO.s02) * .45, ex = cx + Math.cos(ang) * R, ey = cy + Math.sin(ang) * R, ko = ss(seg(t, T.orbiting - .3, T.orbiting + .3));
  if (ko > 0) { g.save(); g.lineCap = 'round'; for (let i = 1; i < 18; i++) { const a = ang - i * .045; g.globalAlpha = (1 - i / 18) * .6 * ko; g.strokeStyle = P.cyan; g.lineWidth = 16 * (1 - i / 18); g.beginPath(); g.arc(cx, cy, R, a - .05, a); g.stroke(); } g.restore(); }
  K.earth(ex, ey, 90, t, t < T.no ? 'scared' : 'happy', { look: -Math.cos(ang) });
  const ka = ss(seg(t, T.swallowed - .3, T.swallowed)) * (1 - ss(seg(t, T.no, T.no + .3)));
  if (ka > 0) K.arrow(ex - Math.cos(ang) * 110, ey - Math.sin(ang) * 110, cx + Math.cos(ang) * 160, cy + Math.sin(ang) * 160, P.red, 16, ka);
  stamp('NOPE', CX, 1560, 140, P.cyan, pop(t, T.no - .05), -.08);
  tag(CX, 340, 'same mass = same pull', 'Earth keeps its orbit', pop(t, T.same - .2), P.cyan);
};
SC[2] = (t) => {                                                    // tiny, and dark
  bg(t);
  const ksq = eio(seg(t, T.tiny - .3, T.tiny + .7)), r = lerp(380, 5, ksq);
  if (ksq < 1) { g.save(); g.globalAlpha *= 1 - ss(seg(ksq, .9, 1)); sunAt(CX, 1000, r, t, ksq > .2 ? 'scared' : 'happy', { shades: ksq > .2 ? null : .6 }); g.restore(); }
  if (ksq > .9) { glow(CX, 1000, 60, '170,140,255', .6); g.fillStyle = '#030208'; g.beginPath(); g.arc(CX, 1000, 6, 0, TAU); g.fill(); }
  if (ksq > .2) for (let i = 0; i < 10; i++) { const a = i / 10 * TAU + .3, d = lerp(560, r + 30, ksq); K.arrow(CX + Math.cos(a) * (d + 90), 1000 + Math.sin(a) * (d + 90), CX + Math.cos(a) * d, 1000 + Math.sin(a) * d, '#ffb35a', 14, (1 - ss(seg(ksq, .85, 1))) * ss(seg(ksq, .2, .35))); }
  const km = pop(t, T.six - .4); if (km > 0) { g.save(); g.translate(780, 1380); g.scale(km, km);
    g.strokeStyle = P.white; g.lineWidth = 10; g.beginPath(); g.arc(0, 0, 170, 0, TAU); g.stroke(); g.fillStyle = 'rgba(12,10,44,.85)'; g.beginPath(); g.arc(0, 0, 165, 0, TAU); g.fill();
    g.save(); g.beginPath(); g.arc(0, 0, 160, 0, TAU); g.clip(); hole(0, -10, 70, t, {}); g.restore();
    g.strokeStyle = P.gold; g.lineWidth = 6; g.beginPath(); g.moveTo(-70, 100); g.lineTo(70, 100); g.moveTo(-70, 88); g.lineTo(-70, 112); g.moveTo(70, 88); g.lineTo(70, 112); g.stroke();
    text('6 km', 0, 150, 40, P.gold, 1000, P.navy, 8);
    g.strokeStyle = P.white; g.lineWidth = 22; g.lineCap = 'round'; g.beginPath(); g.moveTo(120, 120); g.lineTo(220, 220); g.stroke(); g.restore();
    g.save(); g.globalAlpha *= km * .6; g.strokeStyle = P.white; g.lineWidth = 4; g.setLineDash([10, 10]); g.beginPath(); g.moveTo(CX + 10, 1010); g.lineTo(780 - 150, 1380 - 90); g.stroke(); g.restore(); }
  stamp('NO GLOW', 300, 1560, 100, '#c9b8ff', pop(t, T.glow - .1), -.06);
  tag(CX, 340, '≈ 6 km wide', 'today’s Sun: 1.4 million km', pop(t, T.six - .1), '#c9b8ff');
};
SC[3] = (t) => {                                                    // the last sunlight still on its way
  bg(t);
  const hx = 170, hy = 720, ex = 860, ey = 1260;
  hole(hx, hy, 90, t, {});
  for (let i = 0; i < 7; i++) { const p = ((t - VO.s04) * .45 + i / 7) % 1; const x = lerp(hx + 120, ex - 110, p), y = lerp(hy + 70, ey - 70, p); K.photon(x, y, 26, t + i, { mood: 'happy' }); }
  glow(ex, ey, 260, '255,220,120', .35);
  K.earth(ex, ey, 120, t, 'happy', { look: -.7 });
  const kb = pop(t, T.nothing - .1); if (kb > 0) bubble(ex - 40, ey - 220, 320, 84, 'all good?', kb, P.navy, 1);
  const kc = ss(seg(t, T.eight - .3, T.eight)); if (kc > 0) { const end = VO.s05 + .1, u = clamp((t - T.eight + .3) / (end - T.eight + .3)), s = Math.round(u * 499); g.save(); g.globalAlpha *= kc; card(CX - 40, 1480, 520, 150, 1); text(`${Math.floor(s / 60)} min ${String(s % 60).padStart(2, '0')} s`, CX - 40, 1510, 80, s >= 495 ? P.red : P.gold, 1000, null, 0); g.restore(); }
  tag(CX, 340, 'last light still on its way', null, pop(t, T.sunlight - .1), P.gold);
};
SC[4] = (t) => {                                                    // the lights go out: black daytime sky, dark Moon
  const kd = ss(seg(t, T.out - .2, T.out + .4)), km = ss(seg(t, T.moon - .1, T.dark + .3));
  PR.sky('#5cc4f2', '#bfe9ff'); g.save(); g.globalAlpha = kd; nightSky(ss(seg(t, T.daytime, T.black5 + .3))); g.restore();
  if (kd < 1) { g.save(); g.globalAlpha = 1 - kd; sunAt(840, 360, 110, t, 'happy', { shades: .6 }); g.restore(); }
  moonDisk(260, 520, 90, t, km);
  PR.ground(1420, kd > .5); PR.tree(150, 1430, .9, 0, t); PR.tree(950, 1430, .8, 0, t + 1);
  if (kd > 0) { g.save(); g.globalAlpha = .55 * kd; g.fillStyle = '#05040f'; g.fillRect(0, 1100, W, H); g.restore(); }
  PR.stander(CX, 1440, .7, t, { mood: kd > .5 ? 'scared' : 'happy', arms: kd > .5 ? 'up' : 'down', lookY: -.8 });
  stamp('LIGHTS OUT', CX, 760, 120, P.red, pop(t, T.out - .05), -.05);
  tag(CX, 300, 'black sky at noon', 'and no moonlight either', pop(t, T.black5 - .2), '#c9b8ff');
};
SC[5] = (t) => {                                                    // cities: street lights on all day, solar panels dead
  nightSky(1);
  PR.city(1330, 1, '#1f2350');
  for (const [x, w, h] of [[0, 120, 260], [110, 90, 380], [200, 140, 220], [330, 80, 320], [600, 110, 300], [700, 150, 420], [840, 90, 250], [920, 160, 340]]) { const R = mulberry(x + 1); for (let i = 0; i < 10; i++) { if (R() < .45) continue; g.fillStyle = 'rgba(255,214,120,.85)'; g.fillRect(x + 14 + Math.floor(R() * (w - 34) / 22) * 22, 1330 - h + 24 + Math.floor(R() * (h - 60) / 40) * 40, 12, 18); } }
  PR.ground(1420, 1);
  const kl = ss(seg(t, T.street - .3, T.street + .2));
  for (const x of [160, 560, 960]) { lit(x + 50, 1080, 260, kl); PR.lamppost(x, 1440, .65); }
  const ks = ss(seg(t, T.solar - .3, T.solar + .2));
  PR.house(360, 1400, .55); PR.house(760, 1400, .55); panel(340, 1230, 120, ks); panel(740, 1230, 120, ks);
  if (ks > 0) { text('0 W', 340, 1150, 56, P.red, 1000, P.navy, 10, 'center', ks); text('0 W', 740, 1150, 56, P.red, 1000, P.navy, 10, 'center', ks); }
  const kc = pop(t, T.cities - .1); if (kc > 0) { g.save(); g.translate(CX, 640); g.scale(kc, kc); card(0, 0, 420, 130, 1); text('12:00 NOON', 0, 24, 70, P.gold, 1000, null, 0); g.restore(); }
  tag(CX, 340, 'street lights on all day', 'solar panels: nothing', pop(t, T.allday - .2), P.gold);
};
SC[6] = (t) => {                                                    // everyone heats at once; the grid strains
  nightSky(1); PR.ground(1420, 1);
  const kh = ss(seg(t, T.heating - .3, T.heating + .3)), kg = ss(seg(t, T.grids - .3, T.struggle + .4));
  for (const [x, s] of [[200, .5], [520, .5], [840, .5]]) { PR.house(x, 1430, s); lit(x, 1350, 140, kh); }
  for (const x of [200, 520, 840]) { g.save(); g.globalAlpha = kh; g.fillStyle = '#ff9a3c'; g.fillRect(x - 58, 1345, 30, 28); g.fillRect(x + 36, 1345, 30, 28); g.restore(); }
  pylon(CX, 1180, .9, t, ss(seg(t, T.struggle - .2, T.struggle + .2)));
  g.save(); g.strokeStyle = '#8a8fb0'; g.lineWidth = 4; for (const sd of [-1, 1]) { g.beginPath(); g.moveTo(CX + sd * 108, 802); g.quadraticCurveTo(CX + sd * 330, 900, CX + sd * 560, 820); g.stroke(); } g.restore();
  const v = clamp(.35 + .75 * kg); g.save(); card(CX, 560, 820, 170, 1); text('POWER DEMAND', CX, 520, 44, P.white, 1000, null, 0);
  g.fillStyle = 'rgba(255,255,255,.15)'; g.beginPath(); g.roundRect(CX - 360, 555, 720, 46, 23); g.fill();
  g.fillStyle = v > .9 ? P.red : v > .6 ? P.gold : P.cyan; g.beginPath(); g.roundRect(CX - 360, 555, 720 * Math.min(1, v), 46, 23); g.fill(); g.restore();
  stamp('OVERLOAD', CX, 1580, 110, P.red, pop(t, T.struggle), -.05);
  tag(CX, 300, 'everyone heats at once', null, pop(t, T.once - .2), '#ffb35a');
};
SC[7] = (t) => {                                                    // within a week: about -18 °C
  bg(t, '#03020a', '#0b0920');
  const kf = ss(seg(t, T.week - .3, T.eighteen + .6)), temp = lerp(15, -18, kf);
  K.earth(CX - 120, 1020, 270, t, temp < 0 ? 'worried' : 'sad', { look: .5, grey: .55 });
  frost(CX - 120, 1020, 270, kf * .6);
  PR.thermo(880, 1180, clamp((temp + 25) / 50), temp < 0 ? '#7fd0ff' : P.red, 1);
  text(`${Math.round(temp)} °C`, 880, 1360, 64, temp < 0 ? '#9fd8ff' : P.white, 1000, P.navy, 12);
  for (let i = 0; i < 16; i++) { const R = mulberry(i + 3), x = R() * W, y = ((t * 60 * (.5 + R())) + R() * H) % H; g.fillStyle = `rgba(230,245,255,${.5 * kf})`; g.beginPath(); g.arc(x, y, 5 + R() * 5, 0, TAU); g.fill(); }
  tag(CX, 340, '≈ −18 °C', 'on average, within a week', pop(t, T.eighteen - .1), '#9fd8ff');
};
SC[8] = (t) => {                                                    // no light, no food: crops die, animals go hungry
  nightSky(.8);
  g.fillStyle = '#2a2140'; g.fillRect(0, 1180, W, H - 1180); g.fillStyle = '#3a2c4e'; for (let r = 0; r < 4; r++) g.fillRect(0, 1250 + r * 90, W, 20);
  const kw = ss(seg(t, T.crops - .5, T.crops + 1.2));
  for (let r = 0; r < 3; r++) for (let i = 0; i < 9; i++) stalk(60 + i * 120 + (r % 2) * 60, 1270 + r * 90, 170 - r * 10, clamp(kw * (1.2 - r * .15 - i * .02)), t, i + r * 9);
  const kc = ss(seg(t, T.animals - .4, T.animals)); if (kc > 0) { g.save(); g.globalAlpha *= kc; cow(560, 1010, .8, t, t > T.hungry - .2 ? 'sad' : 'worried'); g.restore(); }
  const kb = pop(t, T.hungry - .1); if (kb > 0) bubble(760, 820, 260, 84, 'hungry…', kb, P.navy, -1);
  tag(CX, 340, 'no light = no food', 'plants need sunlight to make it', pop(t, T.food - .2), P.land);
};
SC[9] = (t) => {                                                    // the weather winds down
  bg(t, '#03020a', '#0b0920');
  const kd = ss(seg(t, T.heat - .3, T.rain + .8)), ex = CX, ey = 1000, er = 260;
  K.earth(ex, ey, er, t, kd > .5 ? 'sad' : 'worried', { look: 0, grey: .5 });
  g.save(); g.beginPath(); g.arc(ex, ey, er, 0, TAU); g.clip(); g.globalAlpha = .75 * (1 - kd);
  for (let i = 0; i < 3; i++) { const a = t * (1.1 - kd) * (i % 2 ? -1 : 1) + i * 2; g.strokeStyle = '#ffffff'; g.lineWidth = 26; g.lineCap = 'round'; g.beginPath(); g.arc(ex + Math.cos(i * 2.1) * 90, ey + Math.sin(i * 2.1) * 120, 70 + i * 16, a, a + 3.6); g.stroke(); } g.restore();
  for (const [x, y, sd] of [[160, 700, 1], [900, 1320, -1], [180, 1300, 1]]) { const p = (t * .6 + x) % 1; K.arrow(x - sd * 60 + sd * p * 60, y, x + sd * 80 + sd * p * 60, y, P.cyan, 14, (1 - kd) * .9); }
  PR.cloud(820, 560, .9, 1 - kd * .7); const kr = 1 - ss(seg(t, T.rain - .2, T.rain + .6));
  for (let i = 0; i < 9; i++) { const R = mulberry(i + 40), x = 740 + R() * 170, y = 610 + ((t * 300 + R() * 200) % 200); g.strokeStyle = `rgba(120,190,255,${.8 * kr})`; g.lineWidth = 5; g.beginPath(); g.moveTo(x, y); g.lineTo(x - 6, y + 26); g.stroke(); }
  tag(CX, 340, 'the Sun runs the weather', 'no heat → little wind or rain', pop(t, T.heat - .2), P.cyan);
};
SC[10] = (t) => {                                                   // within a year: about -70 °C; the ice thickens
  const gr = g.createLinearGradient(0, 0, 0, H); gr.addColorStop(0, '#05040f'); gr.addColorStop(.45, '#0b0920'); gr.addColorStop(.46, '#0c2a5c'); gr.addColorStop(1, '#03122e'); g.fillStyle = gr; g.fillRect(0, 0, W, H);
  for (let i = 0; i < 40; i++) { const R = mulberry(i + 50); g.fillStyle = `rgba(185,168,255,${.3 + .4 * R()})`; g.beginPath(); g.arc(R() * W, R() * 860, 1.5 + R() * 2, 0, TAU); g.fill(); }
  const ki = ss(seg(t, T.oceans - .3, T.freeze + .6)), kt = ss(seg(t, T.thicker - .4, T.thicker + 1.2)), ih = lerp(0, 120, ki) + 180 * kt, top = 880;
  g.fillStyle = '#dff3ff'; g.fillRect(0, top - 10, W, ih + 10 * ki); g.fillStyle = '#b8e4ff'; g.fillRect(0, top + ih - 18 * ki, W, 18 * ki);
  g.strokeStyle = `rgba(150,200,240,${ki})`; g.lineWidth = 4; for (let i = 0; i < 9; i++) { const x = 60 + i * 120; g.beginPath(); g.moveTo(x, top); g.lineTo(x + 30, top + ih * .6); g.stroke(); }
  if (kt > 0) K.arrow(960, top + 30, 960, top + ih - 20, '#5aa0d8', 12, kt);
  K.fish(380 + Math.sin(t * .7) * 140, 1420 + Math.sin(t * 1.4) * 30, 1.0, t, { mood: 'worried', flip: Math.cos(t * .7) < 0 });
  text('ICE', 160, top + ih * .6 + 20, 60, '#5aa0d8', 1000, null, 0, 'center', ki);
  tag(CX, 360, '≈ −70 °C', 'within a year', pop(t, T.seventy - .1), '#9fd8ff');
};
SC[11] = (t) => {                                                   // a few people underground; life at the vents
  nightSky(.9);
  g.fillStyle = '#e8f4ff'; g.fillRect(0, 560, W, 70);                               // frozen surface
  const gr = g.createLinearGradient(0, 630, 0, 1240); gr.addColorStop(0, '#4a3628'); gr.addColorStop(1, '#2c1f18'); g.fillStyle = gr; g.fillRect(0, 630, W, 610);
  const kp = ss(seg(t, T.people - .3, T.underground + .2));
  g.save(); g.globalAlpha = kp; g.fillStyle = '#20264f'; g.beginPath(); g.roundRect(120, 760, 840, 380, 40); g.fill(); glow(CX, 960, 360, '255,190,110', .45);
  PR.stander(420, 1110, .42, t, { mood: 'worried', arms: 'down' }); PR.stander(560, 1110, .38, t + 1, { mood: 'happy', arms: 'wave' });
  const kn = ss(seg(t, T.nuclear - .2, T.nuclear + .2)), kg = ss(seg(t, T.geothermal - .2, T.geothermal + .2));
  g.globalAlpha = kp * kn; g.fillStyle = '#ffd34a'; g.beginPath(); g.arc(800, 930, 60, 0, TAU); g.fill(); g.fillStyle = P.navy; for (let i = 0; i < 3; i++) { const a = i * TAU / 3 - Math.PI / 2; g.beginPath(); g.moveTo(800, 930); g.arc(800, 930, 50, a - .5, a + .5); g.fill(); } g.beginPath(); g.arc(800, 930, 12, 0, TAU); g.fill();
  g.restore(); text('nuclear', 800, 1040, 40, P.gold, 1000, P.navy, 8, 'center', kp * kn);
  g.save(); g.globalAlpha = kg; g.fillStyle = '#ff7a3a'; g.fillRect(250, 1140, 34, 100); glow(267, 1200, 90, '255,120,60', .6); g.restore(); text('geothermal', 300, 1040, 40, '#ff9a5c', 1000, P.navy, 8, 'center', kg);
  g.fillStyle = '#071a3c'; g.fillRect(0, 1240, W, 420); g.fillStyle = '#dff3ff'; g.fillRect(0, 1240, W, 30);
  const kv = ss(seg(t, T.vents - .4, T.vents + .2)); g.save(); g.globalAlpha = kv; g.fillStyle = '#2b2236'; g.fillRect(0, 1600, W, 60); vent(760, 1610, .7, t); K.fish(420 + Math.sin(t * .8) * 80, 1450, .7, t, { mood: 'happy', flip: Math.cos(t * .8) < 0 }); g.restore();
  tag(CX, 300, 'a few might hang on', 'nuclear + geothermal power', pop(t, T.people - .1), '#ffb35a');
};
SC[12] = (t) => {                                                   // the good news: the Sun is too small
  bg(t);
  sunAt(300, 1080, 150, t, t > T.small ? 'smug' : 'happy', { mug: 1, sip: .5 + .5 * Math.sin(t * 1.2), shades: .4 });
  const kb = ss(seg(t, T.small - .4, T.small + .2));
  if (kb > 0) { g.save(); g.globalAlpha *= kb; glow(790, 980, 380, '150,190,255', .35); g.fillStyle = '#9fc4ff'; g.beginPath(); g.arc(790, 980, 250, 0, TAU); g.fill(); g.fillStyle = 'rgba(40,60,160,.25)'; g.beginPath(); g.arc(790 + 85, 1005, 275, 0, TAU); g.arc(790 - 35, 972, 255, 0, TAU, true); g.fill('evenodd'); g.restore();
    g.save(); g.globalAlpha *= kb; g.translate(790, 980); K.face(130, 'smug', t, -.6, 2.2, 0); g.restore(); text('a giant star', 790, 1340, 54, '#9fc4ff', 1000, P.navy, 10, 'center', kb); }
  text('the Sun', 300, 1340, 54, P.gold, 1000, P.navy, 10, 'center', kb);
  stamp('CAN’T HAPPEN', CX, 650, 110, P.cyan, pop(t, T.cant - .1), -.05);
  tag(CX, 340, 'far too small', 'black holes come from stars ~20× heavier', pop(t, T.black13 - .3), P.gold);
};
SC[13] = (t) => {                                                   // payoff: orbiting perfectly, in the dark
  bg(t, '#03020a', '#0b0920');
  const cx = CX, cy = 1000, R = 380; orbit(cx, cy, R, 1, 'rgba(185,168,255,.45)');
  hole(cx, cy, 110, t, { mood: 'sleepy' });
  const ang = -2.2 + (t - VO.s14) * .4, ex = cx + Math.cos(ang) * R, ey = cy + Math.sin(ang) * R;
  const ko = ss(seg(t, T.orbiting14 - .3, T.orbiting14 + .3)); if (ko > 0) { g.save(); g.lineCap = 'round'; for (let i = 1; i < 22; i++) { const a = ang - i * .045; g.globalAlpha = (1 - i / 22) * .5 * ko; g.strokeStyle = '#c9b8ff'; g.lineWidth = 14 * (1 - i / 22); g.beginPath(); g.arc(cx, cy, R, a - .05, a); g.stroke(); } g.restore(); }
  K.earth(ex, ey, 100, t, 'sad', { look: -Math.cos(ang), grey: .6 }); frost(ex, ey, 100, .7);
  const kx = ss(seg(t, T.swallowed14 - .3, T.swallowed14)) * (1 - ss(seg(t, T.orbiting14 - .2, T.orbiting14 + .2)));
  if (kx > 0) { text('swallowed?', CX, 1480, 80, P.white, 1000, P.navy, 14, 'center', kx); g.save(); g.globalAlpha = kx; g.strokeStyle = P.red; g.lineWidth = 12; g.beginPath(); g.moveTo(CX - 230, 1455); g.lineTo(CX + 230, 1455); g.stroke(); g.restore(); }
  const kl = pop(t, T.alive - .1); if (kl > 0) { g.save(); g.translate(CX, 1440); g.scale(kl, kl); text('STILL ORBITING…', 0, 0, 96, P.white, 1000, P.navy, 16); text('IN THE DARK', 0, 110, 110, P.gold, 1000, P.navy, 18); g.restore(); }
  tag(CX, 320, 'the real nightmare', null, pop(t, T.nightmare - .2), P.red);
};

// ───────── captions: word-pops, key words in gold (lower middle, above the Shorts UI)
const KEY = new Set(['black', 'hole', 'sun', 'suns', 'mass', 'swallowed', 'no', 'pull', 'same', 'orbiting', 'tiny', 'six', 'glow', 'eight', 'minutes', 'sunlight', 'lights', 'out', 'daytime', 'moon', 'dark', 'cities', 'street', 'solar', 'power', 'heating', 'grids', 'struggle', 'week', 'minus', 'eighteen', 'plants', 'food', 'crops', 'animals', 'hungry', 'weather', 'heat', 'wind', 'rain', 'seventy', 'oceans', 'freeze', 'thicker', 'people', 'underground', 'nuclear', 'geothermal', 'vents', 'small', 'nightmare', 'perfectly', 'alive']);
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
  const ws = c.words.map(w => ({ ...w, s: w.w.replace(/[,:]$/, ''), wd: g.measureText(w.w.replace(/[,:]$/, '') + ' ').width }));
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
EV.push({ type: 'cue', name: 'swap', t: +SWAP.toFixed(3) });
S.forEach((s, i) => { if (i > 0 && i < S.length - 1) EV.push({ type: 'scene', i, t: +s.toFixed(3) }); });
EV.sort((a, b) => a.t - b.t);
window.EV = EV; window.DUR = DUR; window.render = render;
window.SUBS = lines.map((l, i) => { const ws = words[l.id], t0 = VO[l.id] - .05, nx = lines[i + 1] ? VO[lines[i + 1].id] - .05 : DUR; return { t0, t1: Math.max(Math.min(VO[l.id] + ws[ws.length - 1][2] + .6, nx), t0 + 1.8), text: l.sub || l.text }; });
render(+(new URLSearchParams(location.search).get('t') ?? .5));
window.READY = true;
