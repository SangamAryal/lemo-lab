// "What If the Sun Vanished?" — flat-vector explainer, vertical 1080×1920, canvas 2D, deterministic in t.
// Beyond Everything brand style (kit.js shared with the Moon, Earth Rings and Earth Stops films). Fourteen beats, one per
// line: the hook (the Sun goes POOF, Earth doesn't notice), the last light still on its way, Earth circling nothing,
// lights out at 8:20, the straight-line exit with the Moon in tow, Jupiter's last hour, the freeze, the ice blanket and
// the vents, the Sun back and grumpy, and the eight-minute-old sunlight on your face. The last frame loops into the first.
import * as K from './kit.js';
import { clamp, lerp, seg, ss, eio, eo, mulberry, TAU } from '/core/lib.js';
const { P, text, sparkle, glow, card, bubble, pop } = K;
import * as PR from './props.js';
const { stander, tree, sky, ground, city, thermo } = PR;

const W = 1080, H = 1920, CX = W / 2;
const cv = document.getElementById('c'), g = cv.getContext('2d');
K.setup(g, W, H); K.makeStars(110, 9); PR.setup(g, W, H);
await document.fonts.load('900 80px NU'); await document.fonts.load('800 40px NU');
const words = await (await fetch('voices/words.json')).json();
const lines = await (await fetch('lines.json')).json();
const dur = await (await fetch('voices/dur.json')).json();

// ───────── timeline: one scene per line
const IDS = lines.map(l => l.id), VO = {};
const GAP = { s03: .7, s07: .55 };                                  // a beat of air before the blackout and before the freeze
{ let t = .25; for (const id of IDS) { VO[id] = +t.toFixed(3); t += dur[id] + (GAP[id] ?? .4); } }
const LAST = IDS[IDS.length - 1], DUR = +(VO[LAST] + dur[LAST] + 1.4).toFixed(2);
const nrm = s => s.toLowerCase().replace(/[^a-z0-9]/g, '');
const at = (id, w, k = 0, e = 1) => { let n = 0; for (const x of words[id]) if (nrm(x[0]).startsWith(nrm(w)) && n++ === k) return VO[id] + Math.max(0, x[e]); throw new Error(`${w} in ${id}`); };
const S = [0, ...IDS.slice(1).map(id => VO[id] - .3), DUR];
const sceneAt = t => { let i = 0; while (i < S.length - 2 && t >= S[i + 1]) i++; return i; };
const XF = .45, LOOP = .7;
const T = {
  vanished: at('s01', 'vanished'), wouldnt: at('s01', 'wouldn'), eight: at('s01', 'eight'),
  long: at('s02', 'long'), last: at('s02', 'last'), way: at('s02', 'way'),
  circling: at('s03', 'circling'), nothing: at('s03', 'nothing'), gravity: at('s03', 'gravity'), light: at('s03', 'light'),
  eight4: at('s04', 'eight'), twenty: at('s04', 'twenty'), out: at('s04', 'out'),
  flies: at('s05', 'flies'), straight: at('s05', 'straight'), thirty: at('s05', 'thirty'),
  moon6: at('s06', 'moon'), holds: at('s06', 'holds'),
  dark: at('s07', 'dark'), jupiter: at('s07', 'jupiter'), hour: at('s07', 'hour'),
  plants: at('s08', 'plants'), food: at('s08', 'food'),
  week: at('s09', 'week'), minus: at('s09', 'minus'), average: at('s09', 'average'),
  year: at('s10', 'year'), seventy: at('s10', 'seventy'), freeze: at('s10', 'freeze'),
  ice: at('s11', 'ice'), blanket: at('s11', 'blanket'), deep: at('s11', 'deep'), below: at('s11', 'below'),
  vents: at('s12', 'vents'), life: at('s12', 'life'), never: at('s12', 'never'), going: at('s12', 'going'),
  good: at('s13', 'good'), vanish: at('s13', 'vanish'), mass: at('s13', 'mass'), somewhere: at('s13', 'somewhere'),
  relax: at('s14', 'relax'), face: at('s14', 'face'), left: at('s14', 'left'), ago: at('s14', 'ago'),
};
const OUT = T.out + .05;                                           // the moment the lights go out

function tag(x, y, s, sub, k, col = P.gold) {
  if (k <= 0) return; g.save(); g.font = '1000 76px NU'; const w = Math.max(520, g.measureText(s).width + 120); g.translate(x, y); g.scale(k, k); card(0, 0, w, sub ? 180 : 120, 1);
  text(s, 0, sub ? 8 : 22, 76, col, 1000, null, 0); if (sub) text(sub, 0, 62, 40, P.white, 800, null, 0); g.restore();
}
const bg = (t, top = P.bg0, bot = P.bg1, a = 1) => K.bg(t, top, bot, a * g.globalAlpha);
const darkBg = (t, k = 1) => { bg(t, '#05041a', '#0e0a2e'); };
function ghost(x, y, r, a = 1) {                                   // the dashed outline where the Sun used to be
  if (a <= 0) return; g.save(); g.globalAlpha *= a; g.setLineDash([22, 18]); g.strokeStyle = 'rgba(255,207,74,.55)'; g.lineWidth = 7; g.beginPath(); g.arc(x, y, r, 0, TAU); g.stroke(); g.restore();
}
function shades(x, y, r, rot = 0, a = 1) {
  if (a <= 0) return; g.save(); g.globalAlpha *= a; g.translate(x, y); g.rotate(rot);
  g.fillStyle = '#1b1a33'; for (const s of [-1, 1]) { g.beginPath(); g.roundRect(s * r * .3 - r * .17, -r * .1, r * .34, r * .2, r * .08); g.fill(); }
  g.fillStyle = 'rgba(255,255,255,.35)'; for (const s of [-1, 1]) { g.beginPath(); g.roundRect(s * r * .3 - r * .12, -r * .07, r * .1, r * .05, r * .02); g.fill(); }
  g.strokeStyle = '#1b1a33'; g.lineWidth = r * .035; g.beginPath(); g.moveTo(-r * .13, -r * .02); g.lineTo(r * .13, -r * .02); g.stroke(); g.restore();
}
function poof(x, y, r, u) {                                        // a cartoon puff of smoke, u 0..1
  if (u <= 0 || u >= 1) return; const R = mulberry(77);
  g.save(); g.globalAlpha *= 1 - ss(seg(u, .5, 1));
  for (let i = 0; i < 14; i++) { const a = i / 14 * TAU + R() * .4, d = r * (.3 + 1.1 * eo(u)) * (.7 + R() * .5), s = r * (.32 + .25 * R()) * (1 - .4 * u); g.fillStyle = i % 3 ? '#f3eefc' : '#d8d0f0'; g.beginPath(); g.arc(x + Math.cos(a) * d, y + Math.sin(a) * d, s, 0, TAU); g.fill(); }
  g.fillStyle = '#ffffff'; g.beginPath(); g.arc(x, y, r * .55 * (1 - u), 0, TAU); g.fill();
  for (let i = 0; i < 6; i++) { const a = i / 6 * TAU + .3; sparkle(x + Math.cos(a) * r * 1.6 * eo(u), y + Math.sin(a) * r * 1.6 * eo(u), 30 * (1 - u), P.gold); }
  g.restore();
}
function clock(x, y, s, k, col = P.white) {
  if (k <= 0) return; g.save(); g.translate(x, y); g.scale(k, k); card(0, 0, 440, 170, 1); text(s, 0, 36, 112, col, 1000, null, 0); g.restore();
}
const fmtClock = sec => `${Math.floor(sec / 60)}:${String(Math.floor(sec % 60)).padStart(2, '0')}`;
// the moon in the sky (ground POV), fading
function skyMoon(x, y, r, a) { if (a <= 0) return; g.save(); g.globalAlpha *= a; K.moon(x, y, r, 0, 'happy', { noFace: true }); g.restore(); }
function snow(t, n, a = 1, seed = 4) {
  if (a <= 0) return; const R = mulberry(seed); g.save(); g.globalAlpha *= a; g.fillStyle = P.white;
  for (let i = 0; i < n; i++) { const x0 = R() * W, sp = 60 + R() * 90, r = 3 + R() * 6, y = ((R() * H + t * sp) % (H + 40)) - 20, x = x0 + Math.sin(t * 1.2 + i) * 20; g.globalAlpha = a * (.5 + .5 * R()); g.beginPath(); g.arc(x, y, r, 0, TAU); g.fill(); }
  g.restore();
}
function sunflower(x, y, s, t, droop, mood) {
  g.save(); g.translate(x, y); g.scale(s, s);
  const bend = droop * 1.1, hx = Math.sin(bend) * 230, hy = -480 + (1 - Math.cos(bend)) * 230;
  g.strokeStyle = '#3fa35e'; g.lineWidth = 26; g.lineCap = 'round'; g.beginPath(); g.moveTo(0, 0); g.quadraticCurveTo(0, -300, hx, hy); g.stroke();
  g.fillStyle = lerp(0, 1, droop) > .5 ? '#5a9a62' : P.land; for (const sd of [-1, 1]) { g.save(); g.translate(0, -180); g.rotate(sd * (1.1 + droop * .5)); g.beginPath(); g.ellipse(0, -70, 34, 80, 0, 0, TAU); g.fill(); g.restore(); }
  g.translate(hx, hy); g.rotate(bend * 1.2);
  const pc = droop > .5 ? '#c9a23a' : '#ffcf3a';
  for (let i = 0; i < 14; i++) { const a = i / 14 * TAU; g.fillStyle = i % 2 ? pc : '#ffb627'; g.save(); g.rotate(a); g.beginPath(); g.ellipse(0, -130, 34, 70 - droop * 15, 0, 0, TAU); g.fill(); g.restore(); }
  g.fillStyle = '#7a4a2a'; g.beginPath(); g.arc(0, 0, 100, 0, TAU); g.fill();
  face(90, mood, t);
  g.restore();
}
const face = (r, mood, t) => K.face(r, mood, t, 0, 1.7, .3);
function iceSheet(x0, x1, y, h, a = 1) {
  if (a <= 0 || x1 <= x0) return; g.save(); g.globalAlpha *= a; g.fillStyle = '#e8f6ff'; g.fillRect(x0, y, x1 - x0, h); g.fillStyle = '#bfe3f7'; g.fillRect(x0, y + h * .55, x1 - x0, h * .45);
  g.strokeStyle = 'rgba(120,170,210,.8)'; g.lineWidth = 5; const R = mulberry(31); g.beginPath();
  for (let i = 0; i < 9; i++) { const cx = x0 + R() * (x1 - x0); g.moveTo(cx, y + 6); g.lineTo(cx + 30 - R() * 60, y + h * .6); g.lineTo(cx + 40 - R() * 80, y + h - 6); } g.stroke(); g.restore();
}
function worm(x, y, h, t, ph, mood) {                              // a tube worm: white tube, red plume, tiny face
  const sw = Math.sin(t * 2 + ph) * 18;
  g.strokeStyle = '#efe9f5'; g.lineWidth = 34; g.lineCap = 'round'; g.beginPath(); g.moveTo(x, y); g.quadraticCurveTo(x + sw * .4, y - h * .5, x + sw, y - h); g.stroke();
  g.fillStyle = '#ff4d6d'; for (let i = 0; i < 5; i++) { const a = -Math.PI / 2 + (i - 2) * .38 + Math.sin(t * 3 + ph + i) * .08; g.beginPath(); g.ellipse(x + sw + Math.cos(a) * 34, y - h + Math.sin(a) * 34, 14, 30, a + Math.PI / 2, 0, TAU); g.fill(); }
  g.save(); g.translate(x + sw, y - h + 4); K.face(26, mood, t, 0, ph, 0); g.restore();
}
function vent(x, y, s, t) {
  g.save(); g.translate(x, y); g.scale(s, s);
  glow(0, -330, 260, '255,120,40', .35 + .1 * Math.sin(t * 3));
  g.fillStyle = '#2a2140'; g.beginPath(); g.moveTo(-170, 0); g.lineTo(-60, -320); g.lineTo(60, -320); g.lineTo(170, 0); g.fill();
  g.fillStyle = '#3a2f58'; g.beginPath(); g.moveTo(-60, -320); g.lineTo(-10, -320); g.lineTo(-60, 0); g.lineTo(-170, 0); g.fill();
  g.fillStyle = '#ff8a3c'; g.beginPath(); g.ellipse(0, -322, 54, 14, 0, 0, TAU); g.fill();
  for (let i = 0; i < 9; i++) { const ph = (t * .45 + i / 9) % 1, r = 40 + ph * 110; g.globalAlpha = .75 * (1 - ph); g.fillStyle = i % 2 ? '#3b2f4f' : '#4a3a5e'; g.beginPath(); g.arc(Math.sin(i * 2.3 + t) * 30 * ph, -340 - ph * 620, r, 0, TAU); g.fill(); }
  g.restore();
}
function shrimp(x, y, s, t, mood) {
  g.save(); g.translate(x, y + Math.sin(t * 2.4) * 10); g.scale(s, s);
  g.fillStyle = '#ff9a8a'; for (let i = 0; i < 5; i++) { g.beginPath(); g.ellipse(-i * 34, i * i * 3, 46 - i * 6, 40 - i * 5, 0, 0, TAU); g.fill(); }
  g.fillStyle = '#ff7a6a'; g.beginPath(); g.moveTo(-160, 50); g.lineTo(-220, 20); g.lineTo(-210, 90); g.fill();
  g.strokeStyle = '#ff7a6a'; g.lineWidth = 5; g.beginPath(); g.moveTo(30, -20); g.quadraticCurveTo(120, -110, 170, -60); g.moveTo(30, -20); g.quadraticCurveTo(110, -140, 190, -120); g.stroke();
  const wv = Math.sin(t * 9) * .4; g.strokeStyle = '#ff9a8a'; g.lineWidth = 12; g.beginPath(); g.moveTo(10, 20); g.lineTo(60 + Math.cos(wv) * 10, -40 + Math.sin(wv) * 30); g.stroke();
  g.save(); g.translate(10, -5); K.face(34, mood, t, .4, 2.2, 0); g.restore();
  g.restore();
}

// ───────── scenes
const SC = [];
SC[0] = (t) => {                                                   // hook: the Sun goes POOF; Earth, far off, has no idea
  bg(t);
  const u = seg(t, T.vanished - .15, T.vanished + .9), gone = t > T.vanished + .05;
  const sx = CX, sy = 760, sr = 230;
  if (!gone) { const k = 1 - ss(seg(t, T.vanished - .15, T.vanished + .05)) * .15; K.sunChar(sx, sy, sr * k, t, { mood: t > T.vanished - .5 ? 'keen' : 'sleepy', shades: 1, look: .2 }); }
  else { ghost(sx, sy, sr, ss(seg(t, T.vanished + .6, T.vanished + 1.2)) * .6);
    const fall = Math.max(0, t - T.vanished - .2); shades(sx + fall * 30, sy - sr * .05 + 160 * fall * fall * .4, sr, fall * .6, 1 - ss(seg(t, T.eight - .2, T.eight + .6))); }
  poof(sx, sy, sr, u);
  // Earth, still lit by the light already on its way
  const ex = 830, ey = 1330; glow(ex - 40, ey - 40, 260, '255,210,120', .35);
  K.earth(ex, ey, 130, t, 'happy', { look: -.6 });
  const kb = pop(t, T.wouldnt - .2); if (kb > 0) bubble(ex - 120, ey - 240, 330, 90, 'nice day!', kb, P.navy, 1);
  clock(CX - 230, 1250, '8 min', pop(t, T.eight - .1), P.gold);
  g.save(); g.translate(CX, 230); text('WHAT IF THE SUN', 0, -10, 92, P.white, 1000, P.navy, 16); text('VANISHED?', 0, 110, 132, P.gold, 1000, P.navy, 20); g.restore();
};
SC[1] = (t) => {                                                   // the last of the light is still on its way
  bg(t);
  const ax = 210, ay = 420, ex = 830, ey = 1330;
  ghost(ax, ay, 150, .6);
  // the beam's tail leaves the empty spot and travels toward Earth
  const s0 = seg(t, VO.s02 - .3, VO.s02 + dur.s02 + .4) * .82, L = Math.hypot(ex - ax, ey - ay), ux = (ex - ax) / L, uy = (ey - ay) / L;
  const tx = ax + ux * L * s0, ty = ay + uy * L * s0;
  g.save(); const gr = g.createLinearGradient(tx, ty, ex, ey); gr.addColorStop(0, 'rgba(255,220,120,0)'); gr.addColorStop(.15, 'rgba(255,220,120,.55)'); gr.addColorStop(1, 'rgba(255,230,150,.75)');
  g.strokeStyle = gr; g.lineWidth = 120; g.lineCap = 'round'; g.beginPath(); g.moveTo(tx, ty); g.lineTo(ex, ey); g.stroke(); g.restore();
  glow(ex - 40, ey - 40, 260, '255,210,120', .4);
  K.earth(ex, ey, 130, t, 'happy', { look: -.7, lookY: -.6 });
  for (let i = 0; i < 6; i++) { const p = (s0 + .06 + i * .14 + (t * .05) % .14); if (p > .97) continue; const px = ax + ux * L * p, py = ay + uy * L * p; K.photon(px, py, 30, t + i, { mood: 'keen', look: .6 }); }
  // the last photon, at the very tail, running to keep up
  const kl = ss(seg(t, T.last - .4, T.last)); if (kl > 0) { g.save(); g.globalAlpha *= kl; K.photon(tx + ux * 20, ty + uy * 20, 34, t, { mood: 'worried', look: .6 }); g.restore(); bubble(tx + 150, ty - 110, 340, 84, 'wait for me!', pop(t, T.last), P.navy, -1); }
  tag(CX, 300, '≈ 8 minutes', 'Sun → Earth, at light speed', pop(t, T.long - .1));
};
SC[2] = (t) => {                                                   // Earth keeps circling nothing: gravity is as slow as light
  bg(t);
  const cx = CX, cy = 760, R = 330;
  g.save(); g.setLineDash([16, 16]); g.strokeStyle = 'rgba(185,168,255,.5)'; g.lineWidth = 6; g.beginPath(); g.arc(cx, cy, R, 0, TAU); g.stroke(); g.restore();
  ghost(cx, cy, 120, .7);
  const kq = pop(t, T.nothing - .1); if (kq > 0) { g.save(); g.translate(cx, cy); g.scale(kq, kq); text('?', 0, 40, 140, P.gold, 1000, P.navy, 16); g.restore(); }
  const a = -Math.PI * .1 + (t - VO.s03) * .55, ex = cx + Math.cos(a) * R, ey = cy + Math.sin(a) * R;
  glow(ex, ey, 160, '255,210,120', .25);
  K.earth(ex, ey, 92, t, 'happy', { look: -Math.cos(a) });
  // the race: light and gravity, neck and neck
  const kr = ss(seg(t, T.gravity - .3, T.gravity + .2));
  if (kr > 0) { const p = seg(t, T.gravity - .2, T.light + .9), x = lerp(120, 960, eio(p));
    g.save(); g.globalAlpha *= kr; card(CX, 1290, 960, 260, 1);
    K.arrow(110, 1240, x, 1240, P.gold, 18, 1); text("LIGHT", 140, 1222, 46, P.gold, 1000, null, 0, 'left');
    K.arrow(110, 1350, x, 1350, P.cyan, 18, 1); text("GRAVITY", 140, 1332, 46, P.cyan, 1000, null, 0, 'left'); g.restore(); }
  const kt = pop(t, T.light - .1); if (kt > 0) tag(CX, 300, 'same speed', 'gravity news travels at light speed', kt, P.cyan);
};
SC[3] = (t) => {                                                   // 8:20 — the lights go out
  const out = t >= OUT;
  if (!out) bg(t); else darkBg(t);
  const ex = CX, ey = 1050;
  if (!out) glow(ex - 60, ey - 60, 420, '255,210,120', .45);
  K.earth(ex, ey, 260, t, out ? 'scared' : 'happy', { grey: out ? .75 : 0, look: out ? 0 : -.5 });
  const sec = t < T.eight4 ? 495 : lerp(495, 500, seg(t, T.eight4, T.twenty + .2));
  const s = t < T.twenty ? Math.min(499, Math.floor(sec)) : 500;
  clock(CX, 420, out ? '8:20' : fmtClock(s), 1, out ? P.red : P.white);
  if (out && t < OUT + .12) { g.fillStyle = 'rgba(255,255,255,.4)'; g.fillRect(0, 0, W, H); }
  const kt = ss(seg(t, OUT + .35, OUT + .7)); if (kt > 0) text('LIGHTS OUT', CX, 700, 110, P.white, 1000, P.navy, 18, 'center', kt);
};
SC[4] = (t) => {                                                   // a straight line, 30 km/s
  darkBg(t);
  const d = (t - VO.s05) * 260, ex = CX, ey = 980, R = 900;
  // the old orbit curves away below while Earth carries straight on
  g.save(); g.setLineDash([16, 16]); g.strokeStyle = 'rgba(185,168,255,.45)'; g.lineWidth = 6; g.beginPath(); g.arc(ex - d, ey + R, R, Math.PI * 1.05, Math.PI * 1.95); g.stroke(); g.restore();
  const ks = ss(seg(t, T.straight - .3, T.straight + .3));
  if (ks > 0) { g.save(); g.globalAlpha *= ks; g.setLineDash([30, 20]); g.strokeStyle = P.gold; g.lineWidth = 8; g.beginPath(); g.moveTo(ex - 600, ey); g.lineTo(ex + 600, ey); g.stroke(); g.restore(); }
  PR.screech(ex, ey, 150, ss(seg(t, T.flies - .3, T.flies)), t);
  K.earth(ex, ey, 150, t, 'scared', { grey: .7, look: .8 });
  tag(CX, 400, '30 km/s', '(about 107,000 km/h)', pop(t, T.thirty - .1));
};
SC[5] = (t) => {                                                   // the Moon comes with us
  darkBg(t);
  const drift = (t - VO.s06) * 12, ex = CX - 140, ey = 1000 - drift * .3;
  PR.screech(ex, ey, 150, .6, t);
  K.earth(ex, ey, 150, t, t > T.moon6 + .3 ? 'happy' : 'worried', { grey: .65, look: .8 });
  const km = eo(seg(t, T.moon6 - .5, T.moon6 + .3)), mx = lerp(1300, CX + 250, km), my = ey - 160 + Math.sin(t * 2) * 10;
  const kt = ss(seg(t, T.holds - .5, T.holds));
  if (kt > 0) { g.save(); g.globalAlpha *= kt; g.setLineDash([14, 12]); g.strokeStyle = P.cyan; g.lineWidth = 8; g.beginPath(); g.moveTo(ex + 150, ey - 30); g.quadraticCurveTo((ex + mx) / 2, ey - 40 + 60, mx - 70, my); g.stroke(); g.restore();
    text('gravity', (ex + mx) / 2 + 20, ey + 90, 52, P.cyan, 1000, P.navy, 10, 'center', kt); }
  g.save(); g.globalAlpha *= km; K.moon(mx, my, 75, t, 'love', { tilt: .2 }); g.restore();
  const kb = pop(t, T.moon6 + .3); if (kb > 0) bubble(mx, my - 150, 260, 84, 'wait up!', kb * (1 - ss(seg(t, T.holds - .3, T.holds))), P.navy, -1);
  tag(CX, 400, 'still together', null, pop(t, T.holds), P.cyan);
};
SC[6] = (t) => {                                                   // ground at night: the Moon goes dark, Jupiter hangs on
  bg(t, '#04031a', '#14113a');
  city(1430, 1, '#0d0b2a');
  ground(1420, 1);
  stander(300, 1440, .62, t, { mood: 'worried', arms: 'down', look: .5, lookY: -.8 });
  const km = 1 - ss(seg(t, T.dark - .4, T.dark + .5)); skyMoon(330, 520, 90, km * .95 + .05);
  const kj = ss(seg(t, T.jupiter - .5, T.jupiter)), fadeJ = 1 - .7 * ss(seg(t, T.hour + .2, S[7] + .2)), jx = 780, jy = 640;
  if (kj > 0) { g.save(); g.globalAlpha *= kj * fadeJ; glow(jx, jy, 120, '255,230,180', .6); sparkle(jx, jy, 46, '#fff1c8'); g.fillStyle = '#ffe9b8'; g.beginPath(); g.arc(jx, jy, 16, 0, TAU); g.fill(); g.restore();
    text('Jupiter', jx, jy + 110, 52, '#ffe9b8', 1000, P.navy, 10, 'center', kj * fadeJ); }
  tag(CX, 300, '+1 hour', 'its light was already on the way', pop(t, T.hour - .1));
};
SC[7] = (t) => {                                                   // plants stop making food
  bg(t, '#04031a', '#14113a');
  ground(1420, 1);
  const dr = ss(seg(t, T.plants, T.food + .6));
  sunflower(560, 1440, 1.2, t, dr, dr > .4 ? 'sad' : 'worried');
  tree(170, 1440, .8, 0, t); tree(930, 1440, .7, 0, t + 1);
  const kc = pop(t, T.food - .15);
  if (kc > 0) { g.save(); g.translate(CX, 360); g.scale(kc, kc); card(0, 0, 620, 200, 1); text('PHOTOSYNTHESIS', 0, -24, 56, P.white, 1000, null, 0); g.rotate(-.06); text('CLOSED', 0, 66, 86, P.red, 1000, null, 0); g.restore(); }
};
SC[8] = (t) => {                                                   // a week: about −18 °C
  bg(t, '#060624', '#1a1c48');
  snow(t, 60, ss(seg(t, VO.s09 - .3, VO.s09 + .6)));
  city(1430, 1, '#121034'); ground(1420, 1);
  g.save(); g.fillStyle = 'rgba(240,248,255,.9)'; g.fillRect(0, 1405, W, 26); g.restore();
  stander(330, 1440, .62, t + Math.sin(t * 40) * .02, { mood: 'scared', arms: 'hold', look: .4 });
  const lv = lerp(.7, .32, ss(seg(t, T.week, T.minus + .8)));
  thermo(820, 1180, lv, '#3fa8ff');
  tag(CX, 360, '≈ −18 °C', '(0 °F) · after 1 week', pop(t, T.minus - .1), '#7fd3ff');
};
SC[9] = (t) => {                                                   // a year: about −70 °C, the sea freezes over
  bg(t, '#060624', '#1a1c48');
  snow(t, 40, .8, 11);
  const hy = 1150; g.fillStyle = '#1d3a78'; g.fillRect(0, hy, W, H - hy);
  for (let i = 0; i < 7; i++) { g.strokeStyle = 'rgba(120,170,255,.3)'; g.lineWidth = 6; g.beginPath(); for (let x = 0; x <= W; x += 30) g.lineTo(x, hy + 40 + i * 110 + Math.sin(x * .02 + t * 2 + i) * 8); g.stroke(); }
  const fz = ss(seg(t, T.freeze - .5, T.freeze + 1.2)); iceSheet(0, W * fz, hy - 10, H - hy + 10);
  const lv = lerp(.32, .04, ss(seg(t, T.year, T.seventy + .6))); thermo(860, 900, lv, '#3fa8ff');
  tag(CX, 360, '≈ −70 °C', 'after 1 year', pop(t, T.seventy - .1), '#7fd3ff');
};
SC[10] = (t) => {                                                  // under the ice: a blanket, liquid water, warmth from below
  const gr = g.createLinearGradient(0, 0, 0, H); gr.addColorStop(0, '#05041a'); gr.addColorStop(.3, '#0f2f6a'); gr.addColorStop(1, '#071a3c'); g.fillStyle = gr; g.fillRect(0, 0, W, H);
  const iy = 380; iceSheet(0, W, iy, 200); snow(t, 20, .6, 3);
  const kb = pop(t, T.blanket - .1); if (kb > 0) { g.save(); g.translate(CX, iy + 110); g.scale(kb, kb); text('ICE BLANKET', 0, 0, 72, '#17305e', 1000, null, 0); g.restore(); }
  // the seafloor and its warm glow
  g.fillStyle = '#231a3a'; g.beginPath(); g.moveTo(0, 1480); for (let x = 0; x <= W; x += 90) g.lineTo(x, 1480 + Math.sin(x * .013) * 40); g.lineTo(W, H); g.lineTo(0, H); g.fill();
  const kw = ss(seg(t, T.below - .6, T.below + .2)); glow(CX, 1500, 600, '255,120,40', .35 * kw);
  for (let i = 0; i < 5; i++) { const ph = (t * .5 + i * .2) % 1, x = 160 + i * 190; K.arrow(x, 1440 - ph * 300, x, 1340 - ph * 300, '#ff9a3c', 14, kw * Math.sin(ph * Math.PI)); }
  const kd = ss(seg(t, T.deep - .2, T.deep + .4));
  if (kd > 0) { for (let i = 0; i < 10; i++) { const R = mulberry(i + 50), x = R() * W, y = 700 + R() * 650 - ((t * 40 + i * 70) % 600); g.globalAlpha = kd * .5; g.strokeStyle = '#9fd8ff'; g.lineWidth = 4; g.beginPath(); g.arc(x, y, 8 + R() * 10, 0, TAU); g.stroke(); } g.globalAlpha = 1;
    text('still liquid', CX, 950, 84, '#9fd8ff', 1000, P.navy, 14, 'center', kd); }
};
SC[11] = (t) => {                                                  // the vents: life that never needed the Sun
  const gr = g.createLinearGradient(0, 0, 0, H); gr.addColorStop(0, '#040a22'); gr.addColorStop(1, '#0b1636'); g.fillStyle = gr; g.fillRect(0, 0, W, H);
  g.fillStyle = '#1c1530'; g.beginPath(); g.moveTo(0, 1460); for (let x = 0; x <= W; x += 90) g.lineTo(x, 1460 + Math.sin(x * .011 + 1) * 40); g.lineTo(W, H); g.lineTo(0, H); g.fill();
  vent(700, 1470, 1.1, t);
  const kl = ss(seg(t, T.life - .5, T.life + .1));
  for (const [x, h, ph] of [[150, 230, 0], [240, 300, 1.3], [330, 200, 2.1], [430, 260, .7]]) worm(x, 1480, h * (.3 + .7 * kl), t, ph, t > T.never ? 'smug' : 'happy');
  shrimp(330, 1020, .9, t, t > T.never ? 'smug' : 'happy');
  const kb = pop(t, T.never); if (kb > 0) bubble(430, 860, 300, 90, 'what Sun?', kb, P.navy, -1);
  tag(CX, 360, 'no Sun needed', 'powered by heat and chemicals', pop(t, T.going - .2), '#ff9a3c');
};
SC[12] = (t) => {                                                  // the good news: the Sun can't just vanish
  bg(t);
  const k = pop(t, VO.s13 - .1, .5);
  if (k > 0) K.sunChar(CX, 900, 250 * k, t, { mood: t > T.vanish - .2 ? 'annoyed' : 'smug', shades: t > T.vanish - .2 ? -1 : 1, look: -.2 });
  const kb = pop(t, T.vanish + .1); if (kb > 0) bubble(CX + 150, 560, 520, 100, "I'm not going anywhere", kb, P.navy, -1);
  tag(CX, 1370, '333,000 Earths', 'of mass, with nowhere to go', pop(t, T.mass - .1));
};
SC[13] = (t) => {                                                  // eight-minute-old sunlight on your face
  sky(); ground();
  const sx = 280, sy = 420; K.sunChar(sx, sy, 170, t, { mood: 'sleepy', shades: 0, mug: 1, sip: .5 + .5 * Math.sin(t * 1.2) });
  K.deckchair(640, 1330, 1.05);
  K.person(600, 1300, .8, t, { mood: t > T.relax ? 'sleepy' : 'happy', look: -.6, lookY: -.6 });
  const fx = 590, fy = 1040;
  for (let i = 0; i < 4; i++) { const p = ((t - VO.s14) * .35 + i * .25) % 1; if (t < VO.s14) continue; K.photon(lerp(sx + 120, fx, p), lerp(sy + 90, fy, p), 26, t + i, { mood: 'happy', watch: i === 0 }); }
  const kt = pop(t, T.left - .1); if (kt > 0) tag(CX, 1600 - 900, '8 minutes old', null, kt);
};

// ───────── captions: word-pops, key words in gold (lower middle, above the Shorts UI)
const KEY = new Set(['sun', 'vanished', 'eight', 'minutes', 'sunlight', 'way', 'circling', 'nothing', 'gravity', 'speed', 'light', 'twenty', 'out', 'straight', 'thirty', 'second', 'moon', 'holds', 'dark', 'jupiter', 'hour', 'plants', 'food', 'week', 'minus', 'eighteen', 'year', 'seventy', 'freeze', 'ice', 'blanket', 'liquid', 'below', 'vents', 'life', 'never', 'good', 'vanish', 'mass', 'somewhere', 'relax', 'face', 'ago']);
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
  rows.forEach((row, ri) => { const tot = row.reduce((p, w) => p + w.wd, 0); let x = CX - tot / 2; const y = 1640 + ri * 88;
    for (const w of row) { const k = clamp((t - w.t0) / .1); if (k > 0) { g.save(); g.globalAlpha = k; g.translate(x, y); const s = .85 + .15 * eo(k); g.scale(s, s); g.lineJoin = 'round'; g.lineWidth = 16; g.strokeStyle = P.navy; g.textAlign = 'left'; g.strokeText(w.s, 0, 0); g.fillStyle = KEY.has(nrm(w.k)) ? P.gold : P.white; g.fillText(w.s, 0, 0); g.restore(); } x += w.wd; } });
  g.restore();
}

// ───────── frame: a quick crossfade + push-in between scenes (a hard cut into the blackout); the end loops into the start
function render(t) {
  g.setTransform(1, 0, 0, 1, 0, 0); g.globalAlpha = 1;
  const i = sceneAt(t), s0 = S[i], u = clamp((t - s0) / XF);
  const draw = (k, z, a, tt = t) => { g.save(); g.globalAlpha = a; g.translate(CX, 1000); g.scale(z, z); g.translate(-CX, -1000); SC[k](tt); g.restore(); };
  if (i > 0 && u < 1) { draw(i - 1, 1 + .08 * eio(u), 1); draw(i, 1.06 - .06 * eo(u), ss(u)); }
  else draw(i, 1 + (t - s0) * .006, 1);
  const lk = seg(t, DUR - LOOP, DUR); if (lk > 0) draw(0, 1, ss(lk), 0);
  g.setTransform(1, 0, 0, 1, 0, 0); g.globalAlpha = 1;
  const silent = t >= OUT && t < OUT + .3;                         // no caption during the 0.3 s of black silence
  if (lk < 1 && !silent) { g.save(); g.globalAlpha = 1 - lk; captions(t); g.restore(); }
}

// ───────── events for the score and the mix
const EV = [];
for (const [id, t] of Object.entries(VO)) EV.push({ type: 'vo', id, t });
for (const [k, v] of Object.entries(T)) EV.push({ type: 'cue', name: k, t: +v.toFixed(3) });
EV.push({ type: 'cue', name: 'blackout', t: +OUT.toFixed(3) });
S.forEach((s, i) => { if (i > 0 && i < S.length - 1) EV.push({ type: 'scene', i, t: +s.toFixed(3) }); });
EV.sort((a, b) => a.t - b.t);
window.EV = EV; window.DUR = DUR; window.render = render;
window.SUBS = lines.map((l, i) => { const ws = words[l.id], t0 = VO[l.id] - .05, nx = lines[i + 1] ? VO[lines[i + 1].id] - .05 : DUR; return { t0, t1: Math.max(Math.min(VO[l.id] + ws[ws.length - 1][2] + .6, nx), t0 + 1.8), text: l.sub || l.text }; });
render(+(new URLSearchParams(location.search).get('t') ?? .5));
window.READY = true;
