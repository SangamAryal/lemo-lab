// "What If a Black Hole Replaced Our Sun?" — flat-vector explainer, vertical 1080×1920, canvas 2D, deterministic in t.
// Beyond Everything brand style (kit.js shared with the Sun Vanished and Magnetic Field films). Fourteen beats, one per
// line: the swap and Earth not falling in, same mass = same pull, the unchanged orbit, how tiny the hole is, why it is
// dark, the last eight minutes of sunlight, the freeze, the ocean under the ice, a trip closer, spaghettification, the
// point of no return, why the Sun can't do this, its real future, and the payoff: it's the light. The last frame loops.
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
const LINE_GAP = .2, GAP = { s06: .35, s11: .35 };                  // a touch more air after the sky goes black and before "the good news"
{ let t = .25; for (const id of IDS) { VO[id] = +t.toFixed(3); t += dur[id] + (GAP[id] ?? LINE_GAP); } }
const LAST = IDS[IDS.length - 1], DUR = +(VO[LAST] + dur[LAST] + 1.4).toFixed(2);
const nrm = s => s.toLowerCase().replace(/[^a-z0-9]/g, '');
const at = (id, w, k = 0, e = 1) => { let n = 0; for (const x of words[id]) if (nrm(x[0]).startsWith(nrm(w)) && n++ === k) return VO[id] + Math.max(0, x[e]); throw new Error(`${w} in ${id}`); };
const S = [0, ...IDS.slice(1).map(id => VO[id] - .2), DUR];
const sceneAt = t => { let i = 0; while (i < S.length - 2 && t >= S[i + 1]) i++; return i; };
const XF = .4, LOOP = .7;
const T = {
  black1: at('s01', 'black'), replaced: at('s01', 'replaced'), now1: at('s01', 'now'), sucked: at('s01', 'sucked'),
  same: at('s02', 'same'), mass: at('s02', 'mass'), pull: at('s02', 'pull'), same2: at('s02', 'same', 1),
  circling: at('s03', 'circling'), year3: at('s03', 'year'), thirty: at('s03', 'thirty'),
  tiny: at('s04', 'tiny'), whole: at('s04', 'whole'), squeezed: at('s04', 'squeezed'), six: at('s04', 'six'), wide: at('s04', 'wide'),
  dark: at('s05', 'dark'), falling: at('s05', 'falling'), glow: at('s05', 'glow'),
  sunlight: at('s06', 'sunlight'), arriving: at('s06', 'arriving'), eight: at('s06', 'eight'), sky: at('s06', 'sky'), black6: at('s06', 'black'),
  week: at('s07', 'week'), minus7: at('s07', 'minus'), eighteen: at('s07', 'eighteen'), average: at('s07', 'average'),
  seventy: at('s08', 'seventy'), oceans: at('s08', 'oceans'), freeze: at('s08', 'freeze'), liquid: at('s08', 'liquid'), ages: at('s08', 'ages'),
  fly: at('s09', 'fly'), close: at('s09', 'close'), feet: at('s09', 'feet'), harder: at('s09', 'harder'), head: at('s09', 'head'),
  edge10: at('s10', 'edge'), stretch: at('s10', 'stretch'), thin: at('s10', 'thin'), spaghetti: at('s10', 'spaghetti'),
  edge11: at('s11', 'edge'), point: at('s11', 'point'), ret: at('s11', 'return'), light11: at('s11', 'light'), out: at('s11', 'out'),
  good: at('s12', 'good'), cant: at('s12', 'cant'), small: at('s12', 'small'), black12: at('s12', 'black'),
  five: at('s13', 'five'), swell: at('s13', 'swell'), red: at('s13', 'red'), shrink: at('s13', 'shrink'), white: at('s13', 'white'),
  gravity: at('s14', 'gravity'), alive: at('s14', 'alive'), light14: at('s14', 'light'),
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

// ───────── scenes
const SC = [];
SC[0] = (t) => {                                                    // hook: the Sun becomes a black hole; Earth keeps going
  bg(t);
  const cx = CX, cy = 1000, R = 360, on = t >= SWAP, k = ss(seg(t, SWAP, SWAP + .35));
  orbit(cx, cy, R);
  if (k < 1) { g.save(); g.globalAlpha *= 1 - k; sunAt(cx, cy, 170 * (1 - .5 * k), t, 'sleepy', { shades: .6 }); g.restore(); }
  if (on) hole(cx, cy, lerp(40, 120, eo(k)), t, { mood: t > T.sucked ? 'smug' : 'sleepy' });
  if (on && t < SWAP + .2) { g.save(); g.globalAlpha = .45 * (1 - (t - SWAP) / .2); g.fillStyle = '#efe6ff'; g.fillRect(0, 0, W, H); g.restore(); }
  const ang = -.6 + t * .35, ex = cx + Math.cos(ang) * R, ey = cy + Math.sin(ang) * R * .999;
  K.earth(ex, ey, 80, t, !on ? 'happy' : t < T.sucked + .3 ? 'scared' : 'happy', { look: on ? -Math.cos(ang) : 0 });
  const kq = pop(t, T.sucked - .3); if (kq > 0) { const fx = cx + Math.cos(ang) * R * .55, fy = cy + Math.sin(ang) * R * .55; K.arrow(ex - Math.cos(ang) * 100, ey - Math.sin(ang) * 100, fx, fy, P.red, 14, kq * (1 - ss(seg(t, T.sucked + .2, T.sucked + .5)))); }
  stamp('NOPE', CX + 230, 1540, 130, P.cyan, pop(t, T.sucked + .2), -.08);
  g.save(); g.translate(CX, 230); text('WHAT IF A BLACK HOLE', 0, -10, 76, P.white, 1000, P.navy, 16); text('REPLACED OUR SUN?', 0, 100, 92, P.gold, 1000, P.navy, 20); g.restore();
  text('not to scale', CX - 300, 1440, 34, 'rgba(255,255,255,.55)', 800, null, 0, 'center', k);
};
SC[1] = (t) => {                                                    // same mass, same pull
  bg(t);
  const kb = ss(seg(t, VO.s02 - .2, VO.s02 + .3)), tilt = Math.sin(t * 2) * .05 * (1 - ss(seg(t, T.mass, T.mass + .6)));
  scale(CX, 820, t, kb, tilt);
  const py = 820 + 210 - 20; sunAt(CX - 360 - Math.sin(tilt) * 0, py - 110 + tilt * 360, 100, t, 'smug'); hole(CX + 360, py - 110 - tilt * 360, 80, t, { mood: 'smug' });
  text('SUN', CX - 360, py + 80, 50, P.gold, 1000, P.navy, 10); text('BLACK HOLE', CX + 360, py + 80, 50, '#c9b8ff', 1000, P.navy, 10);
  const ks = pop(t, T.mass - .1); if (ks > 0) { g.save(); g.translate(CX, 640); g.scale(ks, ks); text('=', 0, 40, 150, P.white, 1000, P.navy, 18); g.restore(); }
  const kp = ss(seg(t, T.pull - .3, T.pull + .2));
  if (kp > 0) { K.earth(CX, 1450, 90, t, 'happy', { look: 0, lookY: -.5 }); for (const sd of [-1, 1]) K.arrow(CX + sd * 30, 1340, CX + sd * 260, 1180, sd < 0 ? P.gold : '#c9b8ff', 16, kp); }
  tag(CX, 340, 'same mass = same pull', 'from out here', pop(t, T.same2 - .2), P.cyan);
};
SC[2] = (t) => {                                                    // the orbit doesn't change
  bg(t);
  const cx = CX, cy = 1000, R = 400; orbit(cx, cy, R, 1, 'rgba(63,224,255,.55)');
  hole(cx, cy, 70, t, { mood: 'sleepy' });
  const ang = -1.2 + (t - VO.s03) * .55;
  g.save(); g.lineCap = 'round'; for (let i = 1; i < 18; i++) { const a = ang - i * .045; g.globalAlpha = (1 - i / 18) * .6; g.strokeStyle = P.cyan; g.lineWidth = 16 * (1 - i / 18); g.beginPath(); g.arc(cx, cy, R, a - .05, a); g.stroke(); } g.restore();
  const ex = cx + Math.cos(ang) * R, ey = cy + Math.sin(ang) * R;
  K.earth(ex, ey, 90, t, 'happy', { look: Math.sin(ang) });
  const kb = pop(t, T.circling); if (kb > 0) bubble(ex, ey - 160, 300, 84, 'business as usual', kb, P.navy, -1);
  tag(CX, 340, '≈ 30 km/s', 'one lap a year, same as now', pop(t, T.thirty - .1), P.cyan);
};
SC[3] = (t) => {                                                    // tiny: the Sun's whole mass in a ball ~6 km wide
  bg(t);
  const ksq = eio(seg(t, T.squeezed - .2, T.squeezed + .9)), r = lerp(380, 5, ksq);
  if (ksq < 1) { g.save(); g.globalAlpha *= 1 - ss(seg(ksq, .9, 1)); sunAt(CX, 1000, r, t, ksq > .2 ? 'scared' : 'happy', { shades: ksq > .2 ? null : .6 }); g.restore(); }
  if (ksq > .9) { glow(CX, 1000, 60, '170,140,255', .6); g.fillStyle = '#030208'; g.beginPath(); g.arc(CX, 1000, 6, 0, TAU); g.fill(); }
  if (ksq > .2) for (let i = 0; i < 10; i++) { const a = i / 10 * TAU + .3, d = lerp(560, r + 30, ksq); K.arrow(CX + Math.cos(a) * (d + 90), 1000 + Math.sin(a) * (d + 90), CX + Math.cos(a) * d, 1000 + Math.sin(a) * d, '#ffb35a', 14, (1 - ss(seg(ksq, .85, 1))) * ss(seg(ksq, .2, .35))); }
  const km = pop(t, T.six - .4); if (km > 0) { g.save(); g.translate(780, 1420); g.scale(km, km);
    g.strokeStyle = P.white; g.lineWidth = 10; g.beginPath(); g.arc(0, 0, 170, 0, TAU); g.stroke(); g.fillStyle = 'rgba(12,10,44,.85)'; g.beginPath(); g.arc(0, 0, 165, 0, TAU); g.fill();
    g.save(); g.beginPath(); g.arc(0, 0, 160, 0, TAU); g.clip(); hole(0, -10, 70, t, {}); g.restore();
    g.strokeStyle = P.gold; g.lineWidth = 6; g.beginPath(); g.moveTo(-70, 100); g.lineTo(70, 100); g.moveTo(-70, 88); g.lineTo(-70, 112); g.moveTo(70, 88); g.lineTo(70, 112); g.stroke();
    text('6 km', 0, 150, 40, P.gold, 1000, P.navy, 8);
    g.strokeStyle = P.white; g.lineWidth = 22; g.lineCap = 'round'; g.beginPath(); g.moveTo(120, 120); g.lineTo(220, 220); g.stroke(); g.restore();
    sparkle(CX, 1000, 30, '#efe8ff', km); g.save(); g.globalAlpha *= km * .6; g.strokeStyle = P.white; g.lineWidth = 4; g.setLineDash([10, 10]); g.beginPath(); g.moveTo(CX + 10, 1010); g.lineTo(780 - 150, 1420 - 90); g.stroke(); g.restore(); }
  tag(CX, 340, '≈ 6 km wide', 'today’s Sun: 1.4 million km', pop(t, T.six - .1), '#c9b8ff');
};
SC[4] = (t) => {                                                    // dark: nothing to eat, nothing to glow
  bg(t, '#04030f', '#0d0826');
  hole(CX, 900, 210, t, { mood: t > T.glow ? 'sad' : 'sleepy' });
  const ki = ss(seg(t, T.falling - .3, T.falling + .2));
  if (ki > 0) { g.save(); g.globalAlpha *= ki; card(CX, 1430, 820, 300, 1);
    g.save(); g.translate(CX - 250, 1430); g.scale(.5, .5); hole(0, 0, 110, t, { disk: 1 }); g.restore();
    text('with a meal:', CX + 150, 1395, 44, P.white, 800, null, 0); text('it glows', CX + 150, 1465, 64, '#ffb35a', 1000, null, 0);
    const kx = ss(seg(t, T.glow - .3, T.glow)); if (kx > 0) { g.strokeStyle = P.red; g.lineWidth = 18; g.lineCap = 'round'; g.globalAlpha *= kx; g.beginPath(); g.moveTo(CX - 380, 1310); g.lineTo(CX + 380, 1550); g.stroke(); }
    g.restore(); }
  tag(CX, 340, 'nothing to eat', 'nothing to glow', pop(t, T.glow - .2), '#c9b8ff');
};
SC[5] = (t) => {                                                    // the last sunlight still on its way, then black
  const dk = ss(seg(t, T.black6 - .2, T.black6 + .3));
  bg(t, '#0a0626', '#1d1152'); if (dk > 0) { g.save(); g.globalAlpha = .75 * dk; g.fillStyle = '#000'; g.fillRect(0, 0, W, H); g.restore(); }
  const hx = 170, hy = 720, ex = 860, ey = 1260;
  hole(hx, hy, 90, t, {});
  const tail = clamp((t - T.sky + .2) / 1.2);                       // the end of the light stream reaches Earth as the sky goes black
  for (let i = 0; i < 7; i++) { const p = ((t - VO.s06) * .45 + i / 7) % 1; if (p < tail) continue; const x = lerp(hx + 120, ex - 110, p), y = lerp(hy + 70, ey - 70, p); K.photon(x, y, 26, t + i, { mood: 'happy' }); }
  if (dk < 1) glow(ex, ey, 260, '255,220,120', .35 * (1 - dk));
  K.earth(ex, ey, 120, t, dk > .5 ? 'scared' : 'happy', { look: -.7, grey: dk * .5 });
  const kc = ss(seg(t, T.eight - .3, T.eight)); if (kc > 0) { const u = clamp((t - T.eight + .3) / (T.sky - T.eight + .5)), s = Math.round(u * 500); g.save(); g.globalAlpha *= kc; card(CX - 40, 1480, 520, 150, 1); text(`${Math.floor(s / 60)} min ${String(s % 60).padStart(2, '0')} s`, CX - 40, 1510, 80, s >= 500 ? P.red : P.gold, 1000, null, 0); g.restore(); }
  tag(CX, 340, 'last light still on its way', null, pop(t, T.sunlight), P.gold);
  stamp('LIGHTS OUT', CX, 1000, 120, P.red, pop(t, T.black6 - .1), -.05);
};
SC[6] = (t) => {                                                    // within a week: about -18 °C
  bg(t, '#03020a', '#0b0920');
  const kf = ss(seg(t, T.week - .3, T.average + .5)), temp = lerp(15, -18, kf);
  K.earth(CX - 120, 1020, 270, t, temp < 0 ? 'worried' : 'sad', { look: .5, grey: .55 });
  frost(CX - 120, 1020, 270, kf * .6);
  PR.thermo(880, 1180, clamp((temp + 25) / 50), temp < 0 ? '#7fd0ff' : P.red, 1);
  text(`${Math.round(temp)} °C`, 880, 1360, 64, temp < 0 ? '#9fd8ff' : P.white, 1000, P.navy, 12);
  for (let i = 0; i < 16; i++) { const R = mulberry(i + 3), x = R() * W, y = ((t * 60 * (.5 + R())) + R() * H) % H; g.fillStyle = `rgba(230,245,255,${.5 * kf})`; g.beginPath(); g.arc(x, y, 5 + R() * 5, 0, TAU); g.fill(); }
  tag(CX, 340, '≈ −18 °C', 'on average, within a week', pop(t, T.eighteen - .1), '#9fd8ff');
};
SC[7] = (t) => {                                                    // within a year: about -70 °C; ice on top, liquid below
  const gr = g.createLinearGradient(0, 0, 0, H); gr.addColorStop(0, '#05040f'); gr.addColorStop(.45, '#0b0920'); gr.addColorStop(.46, '#0c2a5c'); gr.addColorStop(1, '#03122e'); g.fillStyle = gr; g.fillRect(0, 0, W, H);
  for (let i = 0; i < 40; i++) { const R = mulberry(i + 50); g.fillStyle = `rgba(185,168,255,${.3 + .4 * R()})`; g.beginPath(); g.arc(R() * W, R() * 860, 1.5 + R() * 2, 0, TAU); g.fill(); }
  const ki = ss(seg(t, T.oceans - .3, T.freeze + .6)), ih = lerp(0, 150, ki), top = 880;
  g.fillStyle = '#dff3ff'; g.fillRect(0, top - 10, W, ih + 10 * ki); g.fillStyle = '#b8e4ff'; g.fillRect(0, top + ih - 18 * ki, W, 18 * ki);
  g.strokeStyle = `rgba(150,200,240,${ki})`; g.lineWidth = 4; for (let i = 0; i < 9; i++) { const x = 60 + i * 120; g.beginPath(); g.moveTo(x, top); g.lineTo(x + 30, top + ih * .6); g.stroke(); }
  for (let i = 0; i < 10; i++) { const R = mulberry(i + 9), x = R() * W, y = top + ih + 60 + ((t * 25 + R() * 900) % 900); g.strokeStyle = 'rgba(160,210,255,.4)'; g.lineWidth = 3; g.beginPath(); g.arc(x, y, 6 + R() * 6, 0, TAU); g.stroke(); }
  const kl = ss(seg(t, T.liquid - .4, T.liquid));
  K.fish(380 + Math.sin(t * .7) * 140, 1360 + Math.sin(t * 1.4) * 30, 1.1, t, { mood: kl > .5 ? 'happy' : 'sleepy', flip: Math.cos(t * .7) < 0 });
  K.fish(760 + Math.sin(t * .6 + 2) * 120, 1580, .8, t + 1, { mood: 'happy', flip: Math.cos(t * .6 + 2) < 0 });
  text('ICE', 160, top + ih * .7, 60, '#5aa0d8', 1000, null, 0, 'center', ki);
  text('still liquid', CX, 1180, 66, P.cyan, 1000, P.navy, 12, 'center', kl);
  tag(CX, 360, '≈ −70 °C', 'within a year', pop(t, T.seventy - .1), '#9fd8ff');
};
SC[8] = (t) => {                                                    // fly closer: feet pulled harder than head
  bg(t);
  const hx = 220, hy = 1000; hole(hx, hy, 140, t, { mood: 'smug', look: 1 });
  const ka = ss(seg(t, VO.s09 - .2, VO.s09 + .6)), ax = lerp(1100, 700, ka) + Math.sin(t * 1.5) * 10;
  astronaut(ax, hy, 1.05, t, t > T.feet ? 'scared' : 'happy', { rot: Math.PI / 2 });
  const kf = ss(seg(t, T.feet - .3, T.feet + .1)), kh = ss(seg(t, T.head - .3, T.head + .1));
  K.arrow(ax - 180, hy - 120, ax - 420, hy - 120, P.red, 26, kf); text('feet: BIG pull', ax - 300, hy - 170, 46, P.red, 1000, P.navy, 10, 'center', kf);
  K.arrow(ax + 100, hy + 150, ax, hy + 150, P.gold, 12, kh); text('head: smaller pull', ax + 30, hy + 240, 46, P.gold, 1000, P.navy, 10, 'center', kh);
  tag(CX, 340, 'feet first', 'the near side gets pulled harder', pop(t, T.harder - .1), P.red);
};
SC[9] = (t) => {                                                    // spaghettification
  bg(t);
  const hx = 160, hy = 1000; hole(hx, hy, 140, t, { mood: 'smug', look: 1 });
  const ks = eio(seg(t, T.stretch - .4, T.thin + .5)), ax = lerp(640, 560, ks);
  astronaut(ax, hy, .95, t, 'scared', { rot: Math.PI / 2, sx: 1 - .55 * ks, sy: 1 + 1.6 * ks });
  for (let i = 0; i < 6; i++) { const R = mulberry(i + 2); g.save(); g.globalAlpha = .5 * ks; g.strokeStyle = P.white; g.lineWidth = 6; g.lineCap = 'round'; const y = hy - 120 + R() * 240, x = 800 + R() * 160 - ((t * 500 + R() * 400) % 400); g.beginPath(); g.moveTo(x, y); g.lineTo(x + 100, y); g.stroke(); g.restore(); }
  const kn = pop(t, T.spaghetti - .1);
  if (kn > 0) { for (let i = 0; i < 5; i++) noodle(260 + i * 140, 1250, 160, t + i, i % 2 ? '#ffd36a' : '#ffc04a', kn); g.save(); g.translate(CX, 1520); g.scale(kn, kn); text('SPAGHETTIFICATION', 0, 0, 92, P.gold, 1000, P.navy, 16); g.restore(); }
  tag(CX, 340, 'stretched thin', 'long before the edge', pop(t, T.edge10 - .1), '#ffb35a');
};
SC[10] = (t) => {                                                   // the event horizon: point of no return
  bg(t);
  const cx = CX, cy = 1050, r = 230, kh = ss(seg(t, T.edge11 - .3, T.edge11 + .3));
  hole(cx, cy, r, t, { horizon: kh, mood: 'sleepy' });
  text('event horizon', cx, cy - r - 40, 52, P.gold, 1000, P.navy, 10, 'center', kh);
  const kl = ss(seg(t, T.light11 - .5, T.light11)), u = clamp((t - T.light11 + .5) / 1.6);
  if (kl > 0) { // one photon just outside escapes on a bent path, one inside spirals in
    const a1 = lerp(-2.6, -.4, u), r1 = r * 1.6, x1 = cx + Math.cos(a1) * r1 + u * 200, y1 = cy + Math.sin(a1) * r1 * .8;
    K.photon(x1, y1, 30, t, { mood: 'happy' });
    const a2 = lerp(2.4, 6.2, u), r2 = lerp(r * 1.5, r * .6, u), x2 = cx + Math.cos(a2) * r2, y2 = cy + Math.sin(a2) * r2;
    if (r2 > r * .75) K.photon(x2, y2, 30 * clamp((r2 - r * .7) / (r * .3)), t + 1, { mood: 'scared' });
  }
  const kb = pop(t, T.ret - .1); if (kb > 0) bubble(cx + 230, cy - r - 170, 360, 90, 'no way back', kb, P.navy, -1);
  tag(CX, 340, 'the point of no return', 'not even light gets out', pop(t, T.out - .3), P.gold);
};
SC[11] = (t) => {                                                   // the good news: the Sun is too small
  bg(t);
  sunAt(300, 1080, 150, t, t > T.small ? 'smug' : 'happy', { mug: 1, sip: .5 + .5 * Math.sin(t * 1.2), shades: .4 });
  const kb = ss(seg(t, T.small - .4, T.small + .2));
  if (kb > 0) { g.save(); g.globalAlpha *= kb; glow(790, 980, 380, '150,190,255', .35); g.fillStyle = '#9fc4ff'; g.beginPath(); g.arc(790, 980, 250, 0, TAU); g.fill(); g.fillStyle = 'rgba(40,60,160,.25)'; g.beginPath(); g.arc(790 + 85, 1005, 275, 0, TAU); g.arc(790 - 35, 972, 255, 0, TAU, true); g.fill('evenodd'); g.restore();
    g.save(); g.globalAlpha *= kb; g.translate(790, 980); K.face(130, 'smug', t, -.6, 2.2, 0); g.restore(); text('a giant star', 790, 1340, 54, '#9fc4ff', 1000, P.navy, 10, 'center', kb); }
  text('the Sun', 300, 1340, 54, P.gold, 1000, P.navy, 10, 'center', kb);
  stamp('CAN’T HAPPEN', CX, 650, 110, P.cyan, pop(t, T.cant - .1), -.05);
  tag(CX, 340, 'far too small', 'black holes come from stars ~20× heavier', pop(t, T.black12 - .3), P.gold);
};
SC[12] = (t) => {                                                   // the real future: red giant, then white dwarf
  bg(t);
  const kg = eio(seg(t, T.swell - .2, T.red + .6)), kd = eio(seg(t, T.shrink - .2, T.white + .4));
  const cx = CX, cy = 1050;
  if (kd < 1) { g.save(); g.globalAlpha *= 1 - ss(seg(kd, .5, 1));
    const r = lerp(150, 420, kg) * (1 - .8 * kd);
    if (kg > 0) { glow(cx, cy, r * 1.8, '255,90,60', .5 * kg); g.fillStyle = `rgb(${lerp(255, 235, kg)},${lerp(207, 90, kg)},${lerp(74, 60, kg)})`; g.beginPath(); g.arc(cx, cy, r, 0, TAU); g.fill(); g.save(); g.translate(cx, cy); K.face(r * .9, 'sleepy', t, 0, 1.4, 0); g.restore(); }
    else sunAt(cx, cy, 150, t, 'sleepy', { shades: .6 });
    g.restore(); }
  if (kd > .4) { const k = ss(seg(kd, .4, 1)); g.save(); g.globalAlpha *= k; glow(cx, cy, 160, '220,235,255', .7); g.fillStyle = '#f2f6ff'; g.beginPath(); g.arc(cx, cy, 70, 0, TAU); g.fill(); g.translate(cx, cy); K.face(64, 'sleepy', t, 0, 2.7, 0); g.restore(); }
  text('red giant', cx, cy + 520, 66, '#ff8a6a', 1000, P.navy, 12, 'center', ss(seg(t, T.red - .2, T.red + .1)) * (1 - ss(seg(t, T.shrink, T.shrink + .3))));
  text('white dwarf', cx, cy + 260, 66, P.white, 1000, P.navy, 12, 'center', ss(seg(t, T.white - .2, T.white + .1)));
  tag(CX, 340, '≈ 5 billion years', 'from now', pop(t, T.five - .1), P.gold);
};
SC[13] = (t) => {                                                   // payoff: it's the light
  bg(t);
  const sx = 230, sy = 640, ex = 760, ey = 1180;
  for (let i = 0; i < 7; i++) { const a = Math.atan2(ey - sy, ex - sx) + (i - 3) * .07; g.save(); g.globalAlpha = .18 + .08 * Math.sin(t * 2 + i); g.strokeStyle = '#ffe58a'; g.lineWidth = 30; g.beginPath(); g.moveTo(sx, sy); g.lineTo(sx + Math.cos(a) * 1000, sy + Math.sin(a) * 1000); g.stroke(); g.restore(); }
  sunAt(sx, sy, 190, t, 'sleepy', { mug: 1, sip: .5 + .5 * Math.sin(t * 1.2), shades: 0, look: .6 });
  K.earth(ex, ey, 170, t, t > T.light14 - .2 ? 'love' : 'happy', { look: -.6 });
  const kg = ss(seg(t, T.gravity - .3, T.gravity + .2)) * (1 - .6 * ss(seg(t, T.light14 - .4, T.light14)));
  if (kg > 0) { K.arrow(ex - 160, ey - 110, sx + 260, sy + 160, '#c9b8ff', 12, kg); text('gravity', 470, 980, 52, '#c9b8ff', 1000, P.navy, 10, 'center', kg); }
  const kl = pop(t, T.light14 - .1); if (kl > 0) { g.save(); g.translate(CX, 1500); g.scale(kl, kl); text('IT’S THE LIGHT', 0, 0, 110, P.gold, 1000, P.navy, 18); g.restore(); }
  tag(CX, 300, 'what keeps you alive?', null, pop(t, T.alive - .2), P.cyan);
};

// ───────── captions: word-pops, key words in gold (lower middle, above the Shorts UI)
const KEY = new Set(['black', 'hole', 'sun', 'suns', 'sucked', 'same', 'mass', 'pull', 'circling', 'year', 'thirty', 'tiny', 'squeezed', 'six', 'dark', 'glow', 'sunlight', 'eight', 'minutes', 'week', 'minus', 'eighteen', 'seventy', 'oceans', 'freeze', 'liquid', 'feet', 'head', 'harder', 'edge', 'stretch', 'thin', 'spaghettification', 'return', 'light', 'small', 'five', 'billion', 'red', 'giant', 'white', 'dwarf', 'gravity', 'alive']);
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
