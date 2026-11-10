// "What If the Moon Suddenly Disappeared?" — flat-vector Beyond Everything style in 2.5D (perspective space shots from the
// Earth Rings v3 engine; ground, beach, tide-pool, reef and street scenes in parallax layers), vertical 1080×1920, canvas 2D,
// deterministic in t. Every beat is shown where it happens; space only when the idea is in space.
import * as K from './kit.js';
import { clamp, lerp, seg, ss, eio, eo, mulberry, TAU } from '/core/lib.js';
const { P, text, sparkle, glow, card, bubble, pop } = K;

const W = 1080, H = 1920, CX = W / 2, CY = H / 2;
const cv = document.getElementById('c'), g = cv.getContext('2d');
K.setup(g, W, H); K.makeStars(110, 5);
await document.fonts.load('900 80px NU'); await document.fonts.load('800 40px NU');
const words = await (await fetch('voices/words.json')).json();
const lines = await (await fetch('lines.json')).json();
const dur = await (await fetch('voices/dur.json')).json();

// ───────── timeline: one scene per line
const IDS = lines.map(l => l.id), VO = {};
{ let t = .25; for (const id of IDS) { VO[id] = +t.toFixed(3); t += dur[id] + .45; } }
const LAST = IDS[IDS.length - 1], DUR = +(VO[LAST] + dur[LAST] + 1.8).toFixed(2);
const nrm = s => s.toLowerCase().replace(/[^a-z0-9]/g, '');
const at = (id, w, k = 0, e = 1) => { let n = 0; for (const x of words[id]) if (nrm(x[0]).startsWith(nrm(w)) && n++ === k) return VO[id] + Math.max(0, x[e]); throw new Error(`${w} in ${id}`); };
const S = [0, ...IDS.slice(1).map(id => VO[id] - .3), DUR];
const sceneAt = t => { let i = 0; while (i < S.length - 2 && t >= S[i + 1]) i++; return i; };
const XF = .4;
const T = {
  gone: at('m01', 'gone'), look: at('m02', 'look'), there: at('m02', 'there'), warning: at('m02', 'warning'), out: at('m02', 'out'),
  happens: at('m03', 'happens'), cooked: at('m03', 'cooked'), oceans: at('m04', 'oceans'), L: at('m04', 'l'),
  gravity: at('m05', 'gravity'), tugs: at('m05', 'tugs'), rise: at('m05', 'rise'), fall: at('m05', 'fall'),
  sun6: at('m06', 'sun'), vanish: at('m06', 'vanish'), shrink: at('m06', 'shrink'), half: at('m06', 'half'),
  weaker: at('m07', 'weaker'), currents: at('m07', 'currents'), food: at('m07', 'food'), depends: at('m07', 'depends'),
  pools: at('m08', 'tide'), crabs: at('m08', 'crabs'), lose: at('m08', 'lose'),
  clocks: at('m09', 'clocks'), moonlight: at('m10', 'moonlight'), spawn: at('m10', 'spawn'), thousands: at('m10', 'thousands'), release: at('m10', 'release'),
  signal: at('m11', 'signal'), timing: at('m11', 'timing'), apart: at('m11', 'apart'),
  darker: at('m12', 'darker'), full: at('m12', 'full'), hundred: at('m12', 'hundred'),
  biggest: at('m13', 'biggest'), tilt: at('m13', 'tilt'), steady: at('m13', 'steady'),
  seasons: at('m14', 'seasons'), wobble: at('m14', 'wobble'), millions: at('m14', 'millions'),
  extremes: at('m15', 'extremes'), shuffle: at('m15', 'shuffle'), vibe: at('m15', 'vibe'),
  panic: at('m16', 'panic'), fly: at('m16', 'fly'), spinning: at('m16', 'spinning'),
  granted: at('m17', 'granted'), carrying: at('m17', 'carrying'),
};

// ───────── 2.5D: a tiny 3D world drawn with the flat kit (perspective camera, depth-sorted bodies, perspective rings)
let GA = 1;                                                          // the alpha of the scene being drawn (crossfades)
const v3 = (x, y, z) => ({ x, y, z }), add = (a, b) => v3(a.x + b.x, a.y + b.y, a.z + b.z), sub = (a, b) => v3(a.x - b.x, a.y - b.y, a.z - b.z), mul = (a, k) => v3(a.x * k, a.y * k, a.z * k);
const dot3 = (a, b) => a.x * b.x + a.y * b.y + a.z * b.z, crs = (a, b) => v3(a.y * b.z - a.z * b.y, a.z * b.x - a.x * b.z, a.x * b.y - a.y * b.x), nz = a => mul(a, 1 / Math.hypot(a.x, a.y, a.z));
const mix3 = (a, b, k) => add(mul(a, 1 - k), mul(b, k));
const rotY = (p, a) => v3(p.x * Math.cos(a) + p.z * Math.sin(a), p.y, -p.x * Math.sin(a) + p.z * Math.cos(a));
const O = v3(0, 0, 0), SUNDIR = v3(-1, 0, 0);
let CAM = null;
function setCam(tgt, dist, az, el, fov = 40) {
  const pos = add(tgt, v3(dist * Math.cos(el) * Math.sin(az), dist * Math.sin(el), dist * Math.cos(el) * Math.cos(az)));
  const f = nz(sub(tgt, pos)), r = nz(crs(f, v3(0, 1, 0))), u = crs(r, f);
  CAM = { pos, f, r, u, F: (H / 2) / Math.tan(fov / 2 * Math.PI / 180), az, el, tgt };
}
function pr(p) { const d = sub(p, CAM.pos), z = Math.max(.05, dot3(d, CAM.f)); return { x: CX + dot3(d, CAM.r) / z * CAM.F, y: CY - dot3(d, CAM.u) / z * CAM.F, z, s: CAM.F / z }; }
function Ring(c, tilt = .38, yaw = 0) { const n = nz(rotY(v3(-Math.sin(tilt), Math.cos(tilt), 0), yaw)), u = nz(crs(n, v3(0, 0, 1))), w = crs(n, u); return { c, n, u, w }; }
const rpt = (R, r, a) => add(R.c, add(mul(R.u, r * Math.cos(a)), mul(R.w, r * Math.sin(a))));
function shadowed(p, c, rad) { const d = sub(p, c), al = dot3(d, SUNDIR); if (al > 0) return false; return Math.hypot(d.x - SUNDIR.x * al, d.y - SUNDIR.y * al, d.z - SUNDIR.z * al) < rad; }
const ROCK3 = [[1.45, 1.62, [154, 147, 168], .55], [1.68, 1.98, [196, 189, 208], .9], [1.98, 2.05, [93, 86, 112], .3], [2.05, 2.32, [170, 162, 186], .8], [2.32, 2.45, [120, 112, 138], .45]];
const ICE3 = [[1.45, 1.62, [205, 182, 140], .6], [1.68, 1.98, [255, 244, 220], .92], [1.98, 2.05, [184, 159, 120], .3], [2.05, 2.32, [243, 230, 200], .85], [2.32, 2.45, [205, 182, 140], .45]];
function ringQuads(R, front, o) {                                  // o: bands, k (body radius), a, from, span, rb (shadowing body radius)
  const a = (o.a ?? 1) * GA; if (a <= 0) return; const ez = pr(R.c).z, k = o.k || 1, n = o.n || 150, a0 = o.from ?? 0, span = o.span ?? TAU;
  for (const [r0, r1, col, al] of o.bands || ROCK3) for (let i = 0; i < n; i++) {
    const aa = a0 + span * i / n, ab = a0 + span * (i + 1.08) / n, pm = rpt(R, (r0 + r1) / 2 * k, (aa + ab) / 2), q = pr(pm);
    if ((q.z < ez) !== front) continue;
    const c = shadowed(pm, R.c, k * (o.rb ?? 1)) ? col.map(v => v * .42) : col;
    const p0 = pr(rpt(R, r0 * k, aa)), p1 = pr(rpt(R, r1 * k, aa)), p2 = pr(rpt(R, r1 * k, ab)), p3 = pr(rpt(R, r0 * k, ab));
    g.globalAlpha = al * a; g.fillStyle = `rgb(${c.map(Math.round).join(',')})`; g.beginPath(); g.moveTo(p0.x, p0.y); g.lineTo(p1.x, p1.y); g.lineTo(p2.x, p2.y); g.lineTo(p3.x, p3.y); g.closePath(); g.fill();
  }
  g.globalAlpha = GA;
}
const ROCKS3 = (() => { const R = mulberry(9), a = []; for (let i = 0; i < 300; i++) a.push({ a: R() * TAU, r: 1.45 + R(), h: (R() - .5) * .05, s: .012 + R() * R() * .045, sp: .05 + R() * .04, c: R() < .5 ? '#ffffff' : '#b2abbe', rot: R() * 6 }); return a; })();
function ringRocks(R, front, t, o) {
  const a = (o.a ?? 1) * GA; if (a <= 0) return; const ez = pr(R.c).z, k = o.k || 1, a0 = o.from ?? 0, span = o.span ?? TAU;
  for (const r of ROCKS3) { let an = r.a + t * r.sp; if (span < TAU) { const rel = ((an - a0) % TAU + TAU) % TAU; if (rel > span) continue; }
    const p = add(rpt(R, r.r * k, an), mul(R.n, r.h * k)), q = pr(p); if ((q.z < ez) !== front) continue; const rr = r.s * k * q.s; if (rr < .6) continue;
    g.globalAlpha = a * (shadowed(p, R.c, k) ? .35 : 1); rock2(q.x, q.y, rr, r.rot + t, o.rockCol || r.c); }
  g.globalAlpha = GA;
}
function rock2(x, y, r, rot, col) { g.save(); g.translate(x, y); g.rotate(rot); g.fillStyle = col; g.beginPath(); for (let i = 0; i < 6; i++) { const a = i / 6 * TAU, rr = r * (.75 + .25 * Math.sin(i * 2.3)); g.lineTo(Math.cos(a) * rr, Math.sin(a) * rr); } g.closePath(); g.fill(); g.restore(); }
// a list of bodies → drawn far to near; a body with a ring draws ring-back, body, ring-front
function world(items, t) {
  const L = items.filter(Boolean).map(it => ({ ...it, q: pr(it.p) })).filter(it => it.q.z > .1).sort((a, b) => b.q.z - a.q.z);
  for (const it of L) {
    if (it.ring) { ringQuads(it.ring.R, false, it.ring); if (it.ring.rocks !== false) ringRocks(it.ring.R, false, t, it.ring); }
    it.draw(it.q);
    if (it.ring) { ringQuads(it.ring.R, true, it.ring); if (it.ring.rocks !== false) ringRocks(it.ring.R, true, t, it.ring); }
  }
}
const earthB = (p, t, mood, o = {}) => ({ p, ring: o.ring ? { R: Ring(p, o.tilt ?? .38), bands: o.ring, k: 1, a: o.ra ?? 1, from: o.from, span: o.span } : null,
  draw: q => { K.earth(q.x, q.y, q.s, t, mood, { rot: (o.rot ?? t * .3) - CAM.az, noFace: o.noFace, look: o.look || 0, lookY: o.lookY || 0 }); if (o.after) o.after(q); } });
const saturnB = (p, r, t, mood, o = {}) => ({ p, ring: { R: Ring(p, o.tilt ?? .45), bands: ICE3, k: r, a: o.ra ?? 1, rocks: false }, draw: q => planetChar(q.x, q.y, r * q.s, t, '#f0c878', '#d9a85a', mood, { look: o.look ?? -1 }) });
const moonB = (p, r, t, mood, o = {}) => ({ p, draw: q => K.moon(q.x, q.y, r * q.s, t, mood, { look: o.look ?? 0 }) });
const rockB = (p, r, t, mood, o = {}) => ({ p, draw: q => asteroid(q.x, q.y, r * q.s, t, mood, { rot: o.rot ?? t * .4, look: o.look ?? 0, sx: o.sx, sy: o.sy, crack: o.crack }) });
const sunB = (p, r, t) => ({ p, draw: q => { glow(q.x, q.y, 2.6 * r * q.s, '255,210,120', .35); K.sunChar(q.x, q.y, r * q.s, t, { mood: 'happy' }); } });
function streak3(p0, p1, ph, col = '#ffd98a', w = 7) { const a = pr(mix3(p0, p1, Math.max(0, ph - .14))), b = pr(mix3(p0, p1, ph)); g.save(); g.globalAlpha = GA * Math.sin(Math.min(1, ph) * Math.PI) ** .5; g.strokeStyle = col; g.lineWidth = w; g.lineCap = 'round'; g.beginPath(); g.moveTo(a.x, a.y); g.lineTo(b.x, b.y); g.stroke(); g.restore(); glow(b.x, b.y, 26, '255,210,130', .8 * GA); }
function dashed3(pts, col, w = 6, a = 1) { if (a <= 0) return; g.save(); g.globalAlpha = GA * a; g.setLineDash([22, 16]); g.strokeStyle = col; g.lineWidth = w; g.beginPath(); pts.forEach((p, i) => { const q = pr(p); i ? g.lineTo(q.x, q.y) : g.moveTo(q.x, q.y); }); g.stroke(); g.restore(); }
const circle3 = (R, r, n = 120) => Array.from({ length: n + 1 }, (_, i) => rpt(R, r, i / n * TAU));
function annulus3(c, r0, r1, fill, n = 160) {
  g.fillStyle = fill; g.beginPath();
  for (let i = 0; i <= n; i++) { const a = i / n * TAU, q = pr(add(c, v3(Math.cos(a) * r1, 0, Math.sin(a) * r1))); i ? g.lineTo(q.x, q.y) : g.moveTo(q.x, q.y); }
  for (let i = n; i >= 0; i--) { const a = i / n * TAU, q = pr(add(c, v3(Math.cos(a) * r0, 0, Math.sin(a) * r0))); g.lineTo(q.x, q.y); }
  g.fill('evenodd');
}
// parallax stars (the kit background + two nearer layers) and depth-of-field rocks near the camera
const STAR2 = Array.from({ length: 90 }, (_, i) => { const R = mulberry(i + 50); return { x: R(), y: R(), r: R(), k: R() < .25 }; });
function stars(t, top, bot) {
  const sx = (CAM ? CAM.az : 0) * 900, sy = (CAM ? CAM.el : 0) * 900;
  g.save(); g.translate(((-sx * .15) % W + W) % W - W, 0); K.bg(t, top, bot, GA); g.translate(W, 0); K.bg(t, top, bot, GA); g.restore();
  for (const [lay, f, sz] of [[0, .45, 1], [1, .9, 1.8]]) for (const [i, s] of STAR2.entries()) { if (i % 2 !== lay) continue;
    const x = ((s.x * W * 1.6 - sx * f) % (W * 1.6) + W * 1.6) % (W * 1.6) - W * .3, y = ((s.y * H * 1.4 + sy * f) % (H * 1.4) + H * 1.4) % (H * 1.4) - H * .2;
    if (s.k) sparkle(x, y, (8 + s.r * 10) * sz, P.spark, .8 * GA); else { g.globalAlpha = (.4 + .4 * s.r) * GA; g.fillStyle = P.star; g.beginPath(); g.arc(x, y, (1.2 + s.r * 2) * sz, 0, TAU); g.fill(); g.globalAlpha = GA; } }
}
const NEAR = (() => { const R = mulberry(31), a = []; for (let i = 0; i < 7; i++) a.push(v3((R() - .5) * 9, (R() - .5) * 5, (R() - .5) * 9)); return a; })();
function nearRocks(t, a = 1) {
  if (a <= 0) return; const fz = pr(CAM.tgt).z;
  for (const [i, o] of NEAR.entries()) { const p = add(mix3(CAM.tgt, CAM.pos, .55), add(o, v3(Math.sin(t * .3 + i) * .4, Math.cos(t * .25 + i) * .3, 0))), q = pr(p); if (q.z < .5) continue; const rr = .07 * q.s; if (rr > 160 || q.x < -300 || q.x > W + 300) continue;
    const blur = Math.min(10, Math.abs(q.z - fz) * 1.4); g.save(); g.filter = `blur(${blur.toFixed(1)}px)`; g.globalAlpha = GA * a * .9; rock2(q.x, q.y, rr, t * .4 + i, '#3a3260'); g.globalAlpha = GA * a * .5; rock2(q.x - rr * .2, q.y - rr * .2, rr * .55, t * .4 + i, '#6a6090'); g.restore(); }
}
const lt = (i, t) => clamp((t - S[i]) / (S[i + 1] - S[i]));     // local 0..1 time of scene i

// ───────── small helpers
const dot = (x, y, r, col, a = 1) => { if (a <= 0) return; g.save(); g.globalAlpha *= a; g.fillStyle = col; g.beginPath(); g.arc(x, y, r, 0, TAU); g.fill(); g.restore(); };
const par = (i, t, f) => { const u = lt(i, t); return [lerp(45, -45, u) * f, lerp(-18, 18, eio(u)) * f]; };   // parallax drift per layer
function L(i, t, f, fn) { const [x, y] = par(i, t, f); g.save(); g.translate(x, y); fn(); g.restore(); }
function cardPop(t, t0, x, y, w, h, s, px, col = P.gold, life = 99) { const k = pop(t, t0) * (1 - ss(seg(t, t0 + life, t0 + life + .3))); if (k <= 0) return; g.save(); g.translate(x, y); g.scale(k, k); card(0, 0, w, h, 1); text(s, 0, px * .36, px, col, 1000, null, 0); g.restore(); }
function poof(x, y, k, r = 120) { if (k <= 0 || k >= 1) return; for (let i = 0; i < 7; i++) { const a = i / 7 * TAU, d = r * eo(k); dot(x + Math.cos(a) * d, y + Math.sin(a) * d, r * .45 * (1 - k * .6), '#e8e6f5', (1 - k) * .9); } }
function shades(x, y, r, a = 1) { if (a <= 0) return; g.save(); g.globalAlpha *= a; g.fillStyle = '#17163f'; for (const s of [-1, 1]) { g.beginPath(); g.roundRect(x + s * r * .38 - r * .3, y - r * .2, r * .6, r * .32, r * .12); g.fill(); } g.fillRect(x - r * .1, y - r * .15, r * .2, r * .07); g.fillStyle = 'rgba(255,255,255,.5)'; g.fillRect(x - r * .58, y - r * .15, r * .14, r * .05); g.restore(); }
// a standing person (the channel's hoodie character): o.point (arm up), o.wave, o.mood, o.look/lookY, o.hood colour, o.shorts, o.scarf
function kid(x, y, s, t, o = {}) {
  g.save(); g.translate(x, y); g.scale(s, s);
  const hood = o.hood || P.hood, hoodD = o.hoodD || P.hoodD;
  g.fillStyle = o.shorts ? P.skin : P.jeans; for (const dx of [-30, 18]) { g.beginPath(); g.roundRect(dx, -120, 34, 120, 14); g.fill(); }
  if (o.shorts) { g.fillStyle = '#f2a33a'; g.beginPath(); g.roundRect(-34, -130, 90, 50, 12); g.fill(); }
  g.fillStyle = P.white; for (const dx of [-38, 14]) { g.beginPath(); g.roundRect(dx, -12, 50, 22, 10); g.fill(); }
  g.fillStyle = hood; g.beginPath(); g.roundRect(-55, -290, 120, 180, 50); g.fill(); g.fillStyle = hoodD; g.beginPath(); g.roundRect(-55, -290, 40, 180, [50, 0, 0, 50]); g.fill();
  g.strokeStyle = hood; g.lineWidth = 34; g.lineCap = 'round';
  if (o.point) { const a = -1.2 + Math.sin(t * 2) * .05; g.beginPath(); g.moveTo(40, -250); g.lineTo(40 + Math.cos(a) * 110, -250 + Math.sin(a) * 110); g.stroke(); dot(40 + Math.cos(a) * 118, -250 + Math.sin(a) * 118, 18, P.skin); }
  else if (o.wave) { const a = -1.9 + Math.sin(t * 9) * .4; g.beginPath(); g.moveTo(40, -250); g.lineTo(40 + Math.cos(a) * 110, -250 + Math.sin(a) * 110); g.stroke(); dot(40 + Math.cos(a) * 118, -250 + Math.sin(a) * 118, 18, P.skin); }
  else { g.beginPath(); g.moveTo(40, -250); g.quadraticCurveTo(70, -190, 55, -140); g.stroke(); dot(55, -135, 17, P.skin); }
  g.beginPath(); g.moveTo(-40, -250); g.quadraticCurveTo(-70, -190, -55, -140); g.stroke(); dot(-55, -135, 17, P.skin);
  if (o.scarf) { g.fillStyle = P.red; g.beginPath(); g.roundRect(-50, -300, 110, 34, 14); g.fill(); g.fillRect(20, -290, 26, 90); }
  const hy = -350; dot(5, hy, 64, P.skin); g.fillStyle = o.hair || P.hair; g.beginPath(); g.arc(5, hy - 12, 66, Math.PI * 1.02, Math.PI * 1.98); g.fill();
  g.save(); g.translate(5, hy + 8); K.face(54, o.mood || 'happy', t, o.look ?? 0, o.seed || 2.1, o.lookY ?? 0); g.restore();
  g.restore();
}
// a night city skyline (far) and a rooftop ledge (near)
function skyline(t, col = '#1b1846', lit = 1, seed = 3) {
  const R = mulberry(seed); g.fillStyle = col; let x = -120;
  while (x < W + 120) { const w = 90 + R() * 120, h = 220 + R() * 420; g.fillRect(x, 1300 - h, w, h + 700);
    for (let wy = 1300 - h + 30; wy < 1280; wy += 50) for (let wx = x + 18; wx < x + w - 24; wx += 34) if (R() < .45 * lit) { g.fillStyle = `rgba(255,214,120,${.55 + .4 * R()})`; g.fillRect(wx, wy, 16, 24); g.fillStyle = col; }
    x += w + 10; }
}
function rooftop(t) { g.fillStyle = '#2a2560'; g.fillRect(-100, 1320, W + 200, 700); g.fillStyle = '#3a3478'; g.fillRect(-100, 1300, W + 200, 40); g.fillStyle = '#22204f'; for (let x = -60; x < W + 100; x += 140) g.fillRect(x, 1340, 8, 600); }
function moonSpot(x, y, r, a) { if (a <= 0) return; g.save(); g.globalAlpha *= a; g.setLineDash([16, 12]); g.strokeStyle = 'rgba(255,255,255,.7)'; g.lineWidth = 6; g.beginPath(); g.arc(x, y, r, 0, TAU); g.stroke(); g.restore(); text('404', x, y + 22, 72, P.white, 1000, P.navy, 10, 'center', a); text('moon not found', x, y + 70, 30, '#cfd3ff', 900, P.navy, 6, 'center', a); }
function crowdP(x, y, s, t, i) { const cols = ['#ff7a59', '#5b6cff', '#3fb58a', '#f2a33a', '#c45bd9']; kid(x, y, s, t + i, { hood: cols[i % 5], hoodD: 'rgba(0,0,0,.15)', mood: t > T.cooked ? 'scared' : 'worried', lookY: -1, look: (i % 3 - 1) * .3, seed: i * 1.7, hair: ['#2b2140', '#7a4a2a', '#d9a35a'][i % 3] }); }
// beach: sea, waterline (wl 0 = low tide … 1 = high tide), wet sand, tide markers
function beach(t, i, wl, o = {}) {
  const gr = g.createLinearGradient(0, 0, 0, 900); gr.addColorStop(0, '#6cc8f5'); gr.addColorStop(1, '#cdeffc'); g.fillStyle = gr; g.fillRect(0, 0, W, H);
  L(i, t, .15, () => { K.sunBody(820, o.sunY ?? 260, 70, t); });
  L(i, t, .35, () => { g.fillStyle = '#9fd8e8'; g.fillRect(-100, 840, W + 200, 60); });
  const wy = lerp(1080, 1330, wl);
  L(i, t, .7, () => {
    g.fillStyle = '#f3d79a'; g.beginPath(); g.moveTo(-100, 900); g.lineTo(W + 100, 900); g.lineTo(W + 100, 1920); g.lineTo(-100, 1920); g.fill();
    g.fillStyle = '#e2c27f'; g.fillRect(-100, 1080, W + 200, 260);                         // the wet band between the tides
    const gs = g.createLinearGradient(0, 860, 0, wy); gs.addColorStop(0, '#2f86d6'); gs.addColorStop(1, '#5fc3ee'); g.fillStyle = gs;
    g.beginPath(); g.moveTo(-100, 860); g.lineTo(W + 100, 860); for (let x = W + 100; x >= -100; x -= 30) g.lineTo(x, wy + Math.sin(x / 70 + t * 2.4) * 10); g.fill();
    g.strokeStyle = 'rgba(255,255,255,.85)'; g.lineWidth = 8; g.beginPath(); for (let x = -100; x <= W + 100; x += 30) { const yy = wy + Math.sin(x / 70 + t * 2.4) * 10; x === -100 ? g.moveTo(x, yy) : g.lineTo(x, yy); } g.stroke();
    for (let k = 0; k < 4; k++) { const y = 880 + k * 50 + ((t * 30) % 50); g.strokeStyle = 'rgba(255,255,255,.35)'; g.lineWidth = 4; g.beginPath(); g.moveTo(80 + k * 200, y); g.lineTo(240 + k * 200, y); g.stroke(); }
    if (o.markers) for (const [yy, lab, col] of [[1330, 'HIGH TIDE', P.gold], [1080, 'LOW TIDE', P.white]]) { g.fillStyle = '#7a4a2a'; g.fillRect(900, yy - 110, 14, 120); g.fillStyle = col; g.beginPath(); g.roundRect(830, yy - 150, 160, 52, 10); g.fill(); text(lab, 910, yy - 112, 30, P.navy, 1000, null, 0); }
  });
  if (o.near) L(i, t, 1, o.near);
}
// underwater: light rays, sand, seaweed, drifting plankton (speed v)
function underwater(t, i, v = 1, dark = 0) {
  const gr = g.createLinearGradient(0, 0, 0, H); gr.addColorStop(0, dark ? '#0b1d4a' : '#2a9bd8'); gr.addColorStop(1, dark ? '#05102c' : '#0d3f7a'); g.fillStyle = gr; g.fillRect(0, 0, W, H);
  L(i, t, .2, () => { for (let k = 0; k < 5; k++) { g.save(); g.globalAlpha = (dark ? .06 : .13) * (.6 + .4 * Math.sin(t + k)); g.fillStyle = '#ffffff'; g.beginPath(); g.moveTo(120 + k * 220, -50); g.lineTo(220 + k * 220, -50); g.lineTo(60 + k * 260, 1500); g.lineTo(-40 + k * 260, 1500); g.fill(); g.restore(); } });
  L(i, t, .5, () => { g.fillStyle = dark ? '#2a2a4a' : '#e8d39b'; g.beginPath(); g.moveTo(-100, 1360); for (let x = -100; x <= W + 100; x += 40) g.lineTo(x, 1350 + Math.sin(x / 120) * 25); g.lineTo(W + 100, 1920); g.lineTo(-100, 1920); g.fill(); });
  L(i, t, .8, () => { for (let k = 0; k < 6; k++) { const x = 60 + k * 200; g.strokeStyle = dark ? '#1f6a5a' : '#3fb58a'; g.lineWidth = 16; g.lineCap = 'round'; g.beginPath(); g.moveTo(x, 1400); for (let j = 1; j <= 6; j++) g.lineTo(x + Math.sin(t * 1.5 + j * .7 + k) * 18 * j / 3, 1400 - j * 55); g.stroke(); } });
  for (let k = 0; k < 70; k++) { const R = mulberry(k + 300), x = ((R() * W * 1.3 + t * 120 * v * (.6 + R())) % (W * 1.3)) - W * .15, y = 200 + R() * 1150 + Math.sin(t + k) * 10; dot(x, y, 3 + R() * 4, dark ? 'rgba(180,220,255,.35)' : 'rgba(220,255,230,.75)'); }
}
function crab(x, y, s, t, o = {}) {
  g.save(); g.translate(x, y); g.scale(s, s); g.strokeStyle = '#d63a52'; g.lineWidth = 12; g.lineCap = 'round';
  for (let k = 0; k < 3; k++) for (const sd of [-1, 1]) { g.beginPath(); g.moveTo(sd * 50, 10 + k * 14); g.lineTo(sd * (100 + k * 8), 40 + k * 18 + Math.sin(t * 8 + k) * 4); g.stroke(); }
  for (const sd of [-1, 1]) { g.beginPath(); g.moveTo(sd * 60, -10); g.lineTo(sd * 105, -60); g.stroke(); dot(sd * 112, -72, 26, '#ff5a6e'); }
  g.fillStyle = '#ff5a6e'; g.beginPath(); g.ellipse(0, 0, 80, 52, 0, 0, TAU); g.fill();
  for (const sd of [-1, 1]) { g.strokeStyle = '#ff5a6e'; g.lineWidth = 8; g.beginPath(); g.moveTo(sd * 22, -40); g.lineTo(sd * 26, -78); g.stroke(); dot(sd * 26, -86, 15, P.white); dot(sd * 26 + (o.look || 0) * 4, -84, 7, P.navy); }
  g.save(); g.translate(0, 10); K.face(46, o.mood || 'happy', t, 0, 6.6); g.restore();
  if (o.sign) { g.fillStyle = '#7a4a2a'; g.fillRect(104, -150, 8, 90); g.fillStyle = P.white; g.beginPath(); g.roundRect(60, -205, 150, 60, 8); g.fill(); text('CLOSED', 135, -165, 30, P.red, 1000, null, 0); }
  g.restore();
}
function snail(x, y, s, t) { g.save(); g.translate(x, y); g.scale(s, s); g.fillStyle = '#c9a3ff'; g.beginPath(); g.roundRect(-70, -20, 150, 40, 20); g.fill(); g.fillStyle = '#f2a33a'; g.beginPath(); g.arc(0, -40, 50, 0, TAU); g.fill(); g.strokeStyle = '#c47a1a'; g.lineWidth = 7; g.beginPath(); g.arc(0, -40, 26, 0, Math.PI * 1.6); g.stroke(); g.save(); g.translate(60, -10); K.face(20, 'worried', t, 0, 7.7); g.restore(); g.restore(); }
// reef: branching, brain and fan corals with faces; a little alarm clock on each (o.clocks)
const CORALS = [[150, 1290, 1, '#ff7aa8', 'b'], [370, 1330, .9, '#ffb36a', 'r'], [590, 1290, 1.1, '#b07aff', 'b'], [800, 1340, .9, '#5fd3c4', 'r'], [960, 1280, 1, '#ff7a59', 'f']];
function coral(x, y, s, col, kind, t, o = {}) {
  g.save(); g.translate(x, y); g.scale(s, s); g.fillStyle = col; g.strokeStyle = col; g.lineCap = 'round';
  if (kind === 'b') { g.lineWidth = 26; for (const [a, l] of [[-1.9, 160], [-1.57, 210], [-1.25, 170], [-2.3, 110], [-.85, 120]]) { g.beginPath(); g.moveTo(0, 0); const ex = Math.cos(a) * l, ey = Math.sin(a) * l; g.quadraticCurveTo(ex * .4, ey * .7, ex, ey); g.stroke(); dot(ex, ey, 18, col); } }
  else if (kind === 'r') { g.beginPath(); g.ellipse(0, -60, 110, 75, 0, Math.PI, 0); g.fill(); g.strokeStyle = 'rgba(0,0,0,.15)'; g.lineWidth = 6; for (let k = 0; k < 4; k++) { g.beginPath(); g.moveTo(-90 + k * 20, -10); g.bezierCurveTo(-60 + k * 30, -110, 20 + k * 20, -40, 80 - k * 5, -110 + k * 20); g.stroke(); } }
  else { g.globalAlpha *= .9; g.beginPath(); g.moveTo(0, 0); for (let k = 0; k <= 12; k++) { const a = Math.PI + k / 12 * Math.PI, rr = 190 + Math.sin(k * 2) * 15; g.lineTo(Math.cos(a) * rr * .8, Math.sin(a) * rr); } g.fill(); }
  g.save(); g.translate(0, kind === 'b' ? -60 : -45); K.face(42, o.mood || 'happy', t, o.look || 0, x * .01, o.lookY || 0); g.restore();
  if (o.clock) { g.save(); g.translate(70, -170); g.fillStyle = P.white; g.beginPath(); g.arc(0, 0, 32, 0, TAU); g.fill(); g.strokeStyle = P.navy; g.lineWidth = 5; g.stroke(); g.beginPath(); g.moveTo(0, 0); g.lineTo(0, -20); g.moveTo(0, 0); g.lineTo(Math.cos(t * 3) * 16, Math.sin(t * 3) * 16); g.stroke(); dot(-22, -30, 10, P.red); dot(22, -30, 10, P.red); g.restore(); }
  g.restore();
}
// a village road at night: houses (far), road, people; lit = how much moonlight
function village(t, i, lit) {
  K.bg(t, '#070622', '#1a1450');
  L(i, t, .15, () => { if (lit > 0) { glow(820, 300, 260, '220,230,255', .4 * lit); K.moon(820, 300, 80, t, 'happy', { look: -1 }); } });
  L(i, t, .5, () => { const R = mulberry(8); for (let k = 0; k < 6; k++) { const x = -60 + k * 210, w = 170, h = 150 + R() * 80; g.fillStyle = `rgb(${lerp(20, 70, lit)},${lerp(18, 64, lit)},${lerp(50, 120, lit)})`; g.fillRect(x, 1150 - h, w, h + 40); g.beginPath(); g.moveTo(x - 15, 1150 - h); g.lineTo(x + w / 2, 1150 - h - 90); g.lineTo(x + w + 15, 1150 - h); g.fill(); g.fillStyle = 'rgba(255,214,120,.8)'; g.fillRect(x + 60, 1150 - h + 50, 40, 46); } });
  L(i, t, .85, () => { g.fillStyle = `rgb(${lerp(14, 60, lit)},${lerp(14, 58, lit)},${lerp(30, 90, lit)})`; g.fillRect(-100, 1190, W + 200, 800); g.fillStyle = `rgba(255,255,255,${.08 + .25 * lit})`; for (let x = -40; x < W + 100; x += 160) g.fillRect(x, 1380, 90, 14); });
  L(i, t, 1, () => { for (const [x, sd, c] of [[300, 0, '#ff7a59'], [700, 1, '#3fb58a']]) { if (lit > .05) { g.save(); g.globalAlpha = .35 * lit; g.fillStyle = '#05051a'; g.beginPath(); g.ellipse(x - 90, 1395, 130, 24, -.15, 0, TAU); g.fill(); g.restore(); } kid(x, 1390, .62, t + sd, { hood: c, hoodD: 'rgba(0,0,0,.2)', mood: lit > .5 ? 'happy' : 'scared', wave: lit > .5 && sd === 1, seed: sd + 3 }); } });
  const dk = 1 - lit; if (dk > 0) { g.fillStyle = `rgba(2,2,12,${.88 * dk})`; g.fillRect(0, 0, W, H); for (const [x, y] of [[320, 1150], [690, 1150], [180, 900], [930, 980]]) { dot(x - 14, y, 9 * dk, P.white); dot(x + 14, y, 9 * dk, P.white); } g.save(); g.globalAlpha = .5 * dk; const gr = g.createRadialGradient(700, 1180, 10, 700, 1180, 420); gr.addColorStop(0, 'rgba(255,250,210,.9)'); gr.addColorStop(1, 'rgba(255,250,210,0)'); g.fillStyle = gr; g.beginPath(); g.moveTo(700, 1180); g.lineTo(1080, 900); g.lineTo(1080, 1500); g.fill(); g.restore(); }
}
// park through the seasons: s = 0 summer, 1 autumn, 2 winter (fractional blends); hot = scorching extreme
function park(t, i, sIdx, o = {}) {
  const sky = sIdx < 1 ? ['#6cc8f5', '#cdeffc'] : sIdx < 2 ? ['#f5b46c', '#fde3c3'] : ['#9fb4d8', '#e6eef8'];
  const gr = g.createLinearGradient(0, 0, 0, 1300); gr.addColorStop(0, o.hot ? '#ff9a5a' : sky[0]); gr.addColorStop(1, o.hot ? '#ffe2a8' : sky[1]); g.fillStyle = gr; g.fillRect(0, 0, W, H);
  L(i, t, .15, () => { if (sIdx < 2 || o.hot) K.sunBody(820, 280, o.hot ? 120 : 70, t, { glow: o.hot ? 2 : 1 }); });
  const winter = sIdx >= 2 && !o.hot;
  L(i, t, .55, () => { g.fillStyle = winter ? '#dfe9f7' : o.hot ? '#d9b36a' : '#7ccf8a'; g.beginPath(); g.moveTo(-200, 1250); for (let x = -200; x <= W + 200; x += 60) g.lineTo(x, 1200 - 60 * Math.sin(x / 230 + 2)); g.lineTo(W + 200, 1400); g.lineTo(-200, 1400); g.fill(); });
  L(i, t, .85, () => {
    g.fillStyle = winter ? '#f4f8ff' : o.hot ? '#e8c27a' : '#5fbf6a'; g.fillRect(-100, 1280, W + 200, 700);
    g.fillStyle = '#7a4a2a'; g.fillRect(230, 900, 50, 400);
    const leaf = o.hot ? '#b5a04a' : sIdx < 1 ? '#3fae5a' : sIdx < 2 ? '#f08a3c' : null;
    if (leaf) for (const [dx, dy, r] of [[0, -40, 150], [-100, 40, 110], [110, 30, 120], [10, 80, 120]]) dot(255 + dx, 860 + dy, r, leaf);
    else { g.strokeStyle = '#7a4a2a'; g.lineWidth = 16; for (const a of [-2.2, -1.6, -1]) { g.beginPath(); g.moveTo(255, 920); g.lineTo(255 + Math.cos(a) * 200, 920 + Math.sin(a) * 200); g.stroke(); } dot(255, 760, 40, '#ffffff', .9); }
    if (o.palm) { g.strokeStyle = '#8a5a34'; g.lineWidth = 24; g.beginPath(); g.moveTo(840, 1300); g.quadraticCurveTo(870, 1100, 820, 950); g.stroke(); g.fillStyle = winter ? '#ffffff' : '#3fb86a'; for (const a of [-2.6, -2, -1.2, -.5, .2]) { g.save(); g.translate(820, 950); g.rotate(a); g.beginPath(); g.ellipse(80, 0, 90, 22, .25, 0, TAU); g.fill(); g.restore(); } }
    if (sIdx >= 1 && sIdx < 2 && !o.hot) for (let k = 0; k < 10; k++) { const R = mulberry(k + 50), y = (R() * 600 + t * 120) % 700 + 700; g.save(); g.translate(150 + R() * 300, y); g.rotate(t * 2 + k); g.fillStyle = '#f08a3c'; g.beginPath(); g.ellipse(0, 0, 14, 8, 0, 0, TAU); g.fill(); g.restore(); }
  });
  L(i, t, 1, () => { kid(620, 1460, .8, t, { mood: o.mood || 'happy', shorts: o.shorts, scarf: o.scarf, look: -.3 }); });
  if (winter || o.snow) for (let k = 0; k < 40; k++) { const R = mulberry(k + 90), y = (R() * H + t * 110) % 1500; dot(R() * W + Math.sin(t + k) * 20, y, 4 + R() * 5, '#ffffff', .85); }
  if (o.hot) { g.save(); g.globalAlpha = .15; for (let k = 0; k < 6; k++) { g.strokeStyle = '#ffffff'; g.lineWidth = 6; g.beginPath(); for (let x = 0; x <= W; x += 20) g.lineTo(x, 1000 + k * 60 + Math.sin(x / 40 + t * 6 + k) * 8); g.stroke(); } g.restore(); }
}
// Earth's axis through a 2.5D Earth: tilt angle (rad) leaning toward +x, wobble about the vertical
const axisDir = (tilt, prec) => v3(Math.sin(tilt) * Math.cos(prec), Math.cos(tilt), Math.sin(tilt) * Math.sin(prec));
function axisLine(dir, len, col = P.gold, a = 1) { const p0 = pr(mul(dir, -len)), p1 = pr(mul(dir, len)); g.save(); g.globalAlpha = GA * a; g.strokeStyle = col; g.lineWidth = 8; g.lineCap = 'round'; g.beginPath(); g.moveTo(p0.x, p0.y); g.lineTo(p1.x, p1.y); g.stroke(); g.restore(); dot(p1.x, p1.y, 10, col, a); }

// ───────── scenes, one per line
const SC = [];
SC[0] = (t) => {                                                   // the Moon is gone: rooftop, a kid points at the empty spot
  K.bg(t, '#090726', '#271a66');
  L(0, t, .15, () => moonSpot(760, 430, 110, 1));
  L(0, t, .4, () => skyline(t, '#1b1846', 1, 3));
  L(0, t, .75, () => rooftop(t));
  L(0, t, 1, () => kid(330, 1520, 1.05, t, { point: 1, mood: t > T.gone ? 'scared' : 'worried', lookY: -1, look: .6 }));
  g.save(); g.translate(CX, 230); text('THE MOON', 0, -10, 112, P.white, 1000, P.navy, 16); text('IS GONE', 0, 110, 140, P.gold, 1000, P.navy, 18); g.restore();
};
SC[1] = (t) => {                                                   // space: the Moon puts on shades, peace sign, and zips off
  const u = lt(1, t); setCam(v3(1.5, .2, 0), 12, lerp(-.25, -.05, u), .12); stars(t);
  const lv = ss(seg(t, T.out - .1, T.out + .7)), mp = add(v3(3.6, .9, 0), v3(lv * 14, lv * 6, -lv * 8));
  world([earthB(O, t, t > T.out + .3 ? 'scared' : 'happy', { look: 1, lookY: -.3 }), lv < .95 && { p: mp, draw: q => { K.moon(q.x, q.y, .7 * q.s, t, 'smug', { look: -1 }); shades(q.x, q.y - .08 * q.s, .7 * q.s, ss(seg(t, T.warning, T.warning + .4))); } }], t);
  const q = pr(v3(3.6, .9, 0)); poof(q.x, q.y, seg(t, T.out + .1, T.out + .9), 160);
  if (t > T.warning + .3 && t < T.out + .1) bubble(q.x - 60, q.y - 230, 220, 90, 'peace out', pop(t, T.warning + .3), P.navy, 1);
  cardPop(t, T.out, CX, 360, 420, 120, "I'M OUT", 64, P.white, 1.6);
};
SC[2] = (t) => {                                                   // the street: everyone looks up — are we cooked?
  K.bg(t, '#090726', '#271a66');
  L(2, t, .15, () => moonSpot(540, 380, 100, .6));
  L(2, t, .45, () => skyline(t, '#211d55', .8, 7));
  L(2, t, .8, () => { g.fillStyle = '#1a1840'; g.fillRect(-100, 1300, W + 200, 700); });
  L(2, t, 1, () => { [[160, 1500, .7], [380, 1560, .78], [610, 1520, .72], [840, 1560, .8], [990, 1480, .62]].forEach(([x, y, s], k) => crowdP(x, y, s, t, k)); });
  const kh = pop(t, T.cooked - .1); if (kh > 0) { g.save(); g.translate(CX, 760); g.scale(kh, kh); K.earth(0, 0, 150, t, 'scared', { look: 0, lookY: -.4 }); g.fillStyle = P.white; g.beginPath(); g.roundRect(-90, -250, 180, 110, 50); g.fill(); g.fillRect(-70, -170, 140, 40); g.restore(); text('COOKED?', CX, 1020, 70, P.gold, 1000, P.navy, 12, 'center', kh); }
};
SC[3] = (t) => {                                                   // the beach: the oceans take an L
  beach(t, 3, .55 + .05 * Math.sin(t));
  const k = pop(t, T.L - .05, .35); if (k > 0) { g.save(); g.translate(CX, 920); g.rotate(-.12); g.scale(1.6 - .6 * k, 1.6 - .6 * k); g.globalAlpha = Math.min(1, k * 1.5); text('L', 0, 120, 380, P.red, 1000, P.white, 18); g.restore(); }
  L(3, t, 1, () => kid(170, 1700, .7, t, { mood: t > T.L ? 'sad' : 'happy', look: .5 }));
};
SC[4] = (t) => {                                                   // split: the Moon tugs the ocean bulge (space) / the tide climbs the beach (ground)
  const ph = (t - S[4]) * 1.05, wl = .5 + .5 * Math.sin(ph - 1.4);
  K.bg(t, '#0a0826', '#1d1152', GA);
  g.save(); g.beginPath(); g.rect(0, 840, W, H - 840); g.clip(); g.translate(0, 100); beach(t, 4, wl, { markers: 1 }); g.restore();
  g.save(); g.beginPath(); g.rect(0, 0, W, 840); g.clip();
  const ma = -.5 + (t - S[4]) * .25, ex = 380, ey = 470, mx = ex + Math.cos(ma) * 440, my = ey + Math.sin(ma) * 230;
  g.save(); g.translate(ex, ey); g.rotate(ma); g.fillStyle = '#2f7fe0'; g.beginPath(); g.ellipse(0, 0, 205 + 18 * ss(seg(t, T.tugs - .3, T.tugs + .4)), 172, 0, 0, TAU); g.fill(); g.restore();
  K.earth(ex, ey, 165, t, 'happy', { look: Math.cos(ma), lookY: Math.sin(ma) * .5 });
  K.moon(mx, my, 70, t, 'keen', { look: -1 });
  const ka = ss(seg(t, T.gravity - .2, T.gravity + .3)); if (ka > 0) { g.save(); g.globalAlpha = ka; g.setLineDash([16, 12]); g.strokeStyle = P.gold; g.lineWidth = 6; for (const o of [-40, 0, 40]) { g.beginPath(); g.moveTo(mx - 80 * Math.cos(ma), my - 80 * Math.sin(ma) + o); g.lineTo(ex + 230 * Math.cos(ma), ey + 230 * Math.sin(ma) + o * .5); g.stroke(); } g.restore(); }
  text('tidal bulge', ex, ey - 210, 36, '#9ad7ff', 1000, P.navy, 8, 'center', ka);
  g.restore(); g.fillStyle = P.gold; g.fillRect(0, 836, W, 8);
  text(wl > .5 ? 'HIGH TIDE' : 'LOW TIDE', 200, 920, 46, P.white, 1000, P.navy, 10, 'center', 1);
};
SC[5] = (t) => {                                                   // the pier tide gauge: Sun-only tides are less than half
  const sh = ss(seg(t, T.shrink - .2, T.half + .5)), amp = lerp(1, .42, sh), wl = .5 + .5 * amp * Math.sin((t - S[5]) * 2.2);
  const gr = g.createLinearGradient(0, 0, 0, 900); gr.addColorStop(0, '#6cc8f5'); gr.addColorStop(1, '#cdeffc'); g.fillStyle = gr; g.fillRect(0, 0, W, H);
  L(5, t, .15, () => K.sunChar(830, 300, 110, t, { mood: sh > .3 ? 'annoyed' : 'happy', shades: 0, look: -.5 }));
  const wy = lerp(1350, 950, wl);
  L(5, t, .85, () => {
    g.fillStyle = '#2f86d6'; g.fillRect(-100, wy, W + 200, 1100); g.strokeStyle = 'rgba(255,255,255,.8)'; g.lineWidth = 7; g.beginPath(); for (let x = -100; x <= W + 100; x += 30) { const yy = wy + Math.sin(x / 60 + t * 3) * 8; x === -100 ? g.moveTo(x, yy) : g.lineTo(x, yy); } g.stroke();
    g.fillStyle = '#8a5a34'; for (const x of [80, 300, 520]) g.fillRect(x, 700, 36, 1300); g.fillStyle = '#a8703f'; g.fillRect(40, 680, 560, 40);
    g.fillStyle = P.white; g.fillRect(700, 700, 90, 760); g.strokeStyle = P.navy; g.lineWidth = 4; g.strokeRect(700, 700, 90, 760);
    for (let k = 0; k <= 19; k++) { const y = 720 + k * 38; g.fillStyle = k % 5 === 0 ? P.red : P.navy; g.fillRect(700, y, k % 5 === 0 ? 60 : 34, 5); }
    for (const [y, a] of [[lerp(1350, 950, 1), 1 - sh], [lerp(1350, 950, 0), 1 - sh]]) if (a > 0) { g.save(); g.globalAlpha = a * .8; g.setLineDash([14, 10]); g.strokeStyle = P.gold; g.lineWidth = 5; g.beginPath(); g.moveTo(640, y); g.lineTo(860, y); g.stroke(); g.restore(); }
  });
  cardPop(t, T.half - .1, CX, 430, 640, 140, 'SUN-ONLY TIDES: < ½', 56);
};
SC[6] = (t) => {                                                   // underwater by the coast: the currents slow, the food settles
  const slow = ss(seg(t, T.weaker - .2, T.depends)), v = lerp(1.6, .15, slow);
  underwater(t, 6, v);
  const ka = 1 - slow * .7; for (let k = 0; k < 3; k++) { const y = 500 + k * 230, x0 = ((t * 260 * v + k * 300) % 1400) - 300; K.arrow(x0, y, x0 + 220, y, `rgba(255,255,255,${.5 * ka})`, 14, ka); }
  L(6, t, 1, () => { const hun = t > T.food + .4; K.fish(560 + Math.sin(t) * 20, 960, 1.2, t, { mood: hun ? 'sad' : 'happy', flip: false }); if (hun) bubble(760, 760, 260, 90, '…food?', pop(t, T.food + .4), P.navy, -1); });
  cardPop(t, T.currents, CX, 300, 520, 110, 'WEAKER CURRENTS', 54, '#9ad7ff');
};
SC[7] = (t) => {                                                   // a tide pool from a crab's eye view
  const gr = g.createLinearGradient(0, 0, 0, 900); gr.addColorStop(0, '#7fd0f2'); gr.addColorStop(1, '#d6f2fb'); g.fillStyle = gr; g.fillRect(0, 0, W, H);
  L(7, t, .3, () => { g.fillStyle = '#2f86d6'; g.fillRect(-100, 760, W + 200, 160); });
  L(7, t, .7, () => { g.fillStyle = '#8a8398'; for (const [x, y, rx, ry] of [[100, 1050, 260, 200], [980, 1000, 280, 230], [540, 1550, 700, 260]]) { g.beginPath(); g.ellipse(x, y, rx, ry, 0, 0, TAU); g.fill(); } g.fillStyle = '#6f6880'; g.beginPath(); g.ellipse(540, 1250, 520, 200, 0, 0, TAU); g.fill();
    g.fillStyle = '#4aa8e0'; const wl = 1 - ss(seg(t, T.lose - .5, T.lose + 1)) * .5; g.beginPath(); g.ellipse(540, 1250, 470 * (.7 + .3 * wl), 160 * wl, 0, 0, TAU); g.fill();
    for (let k = 0; k < 5; k++) dot(380 + k * 90, 1250 + Math.sin(k * 2) * 40, 10, 'rgba(255,255,255,.4)'); });
  L(7, t, 1, () => { crab(480, 1210, 1.1, t, { mood: t > T.lose ? 'sad' : 'happy', sign: t > T.lose, look: Math.sin(t) }); snail(760, 1190, .9, t); });
  cardPop(t, T.pools + .2, CX, 380, 460, 110, 'TIDE POOLS', 60, P.gold, 2.2);
};
SC[8] = (t) => {                                                   // the reef at night: animals that set their clocks by the Moon
  underwater(t, 8, .3, 1);
  L(8, t, .2, () => { glow(CX, 120, 420, '220,230,255', .35); K.moon(CX, 160, 90, t, 'happy', { look: 0, lookY: 1 }); });
  L(8, t, 1, () => CORALS.forEach(([x, y, s, c, k], j) => coral(x, y, s, c, k, t, { clock: pop(t, T.clocks - .3 + j * .1) > .5, look: 0, lookY: -1 })));
};
SC[9] = (t) => {                                                   // moonlight: the whole reef spawns on the same night
  underwater(t, 9, .3, 1);
  L(9, t, .2, () => { glow(CX, 120, 460, '220,230,255', .45); K.moon(CX, 160, 90, t, 'love', { lookY: 1 }); for (let k = 0; k < 4; k++) { g.save(); g.globalAlpha = .12; g.fillStyle = '#e8f0ff'; g.beginPath(); g.moveTo(CX - 60 + k * 30, 160); g.lineTo(CX - 420 + k * 260, 1400); g.lineTo(CX - 300 + k * 260, 1400); g.fill(); g.restore(); } });
  const rel = seg(t, T.release - .6, DUR);
  L(9, t, 1, () => { CORALS.forEach(([x, y, s, c, k]) => coral(x, y, s, c, k, t, { mood: rel > 0 ? 'love' : 'happy', lookY: -1 })); });
  if (rel > 0) for (let k = 0; k < 140; k++) { const R = mulberry(k + 700), x0 = CORALS[k % 5][0] + (R() - .5) * 160, y = CORALS[k % 5][1] - 150 - (t - (T.release - .6)) * (90 + R() * 120) - R() * 60; if (y < 150) continue; dot(x0 + Math.sin(t * 2 + k) * 14, y, 6 + R() * 6, R() < .5 ? '#ffb3cf' : '#ffd7e6', Math.min(1, rel * 6)); }
  cardPop(t, T.thousands, CX, 1520 - 120, 560, 100, 'SAME NIGHT. ALL OF THEM.', 44, '#ffd7e6');
};
SC[10] = (t) => {                                                  // no Moon, no signal: confused corals, out of sync
  underwater(t, 10, .3, 1); g.fillStyle = 'rgba(0,0,10,.35)'; g.fillRect(0, 0, W, H);
  L(10, t, .2, () => moonSpot(CX, 170, 85, .7));
  L(10, t, 1, () => CORALS.forEach(([x, y, s, c, k], j) => { coral(x, y, s, c, k, t, { mood: 'worried', look: Math.sin(t * 2 + j) }); text('?', x + 40, y - 230 + Math.sin(t * 3 + j) * 8, 70, P.gold, 1000, P.navy, 10, 'center', pop(t, T.signal + j * .2)); }));
  for (let k = 0; k < 5; k++) { const t0 = T.timing + k * .55; if (t < t0) continue; for (let j = 0; j < 8; j++) { const R = mulberry(k * 9 + j), y = CORALS[k][1] - 150 - (t - t0) * (100 + R() * 80); dot(CORALS[k][0] + (R() - .5) * 120, y, 7, '#ffb3cf', Math.max(0, 1 - (t - t0) * .4)); } }
  cardPop(t, T.apart, CX, 1380, 360, 100, 'ERROR 404', 54, P.red);
};
SC[11] = (t) => {                                                  // the village road: moonlit, then pitch dark
  const lit = 1 - ss(seg(t, T.darker - .3, T.darker + .2)) + ss(seg(t, T.full - .2, T.full + .1)) * (1 - ss(seg(t, T.hundred + .8, T.hundred + 1.2)));
  village(t, 11, clamp(lit));
  cardPop(t, T.hundred, CX, 330, 520, 130, '~100× BRIGHTER', 62);
};
SC[12] = (t) => {                                                  // space: the Moon keeps Earth's tilt steady (a gyroscope)
  const u = lt(12, t); setCam(O, 9.5, lerp(-.4, .1, u), .18); stars(t);
  const ma = (t - S[12]) * .35, mp = v3(Math.cos(ma) * 3.6, .3, Math.sin(ma) * 3.6), dir = axisDir(.41, 0);
  const R2 = Ring(O, .41); dashed3(circle3(R2, 1.55), P.gold, 6, ss(seg(t, T.steady - .4, T.steady + .2)));
  world([earthB(O, t, 'happy', { look: .4 }), moonB(mp, .45, t, 'smug', { look: -1 })], t);
  axisLine(dir, 1.6, P.gold, ss(seg(t, T.tilt - .3, T.tilt + .2)));
  cardPop(t, T.tilt + .2, CX, 360, 360, 110, '23.4° TILT', 58);
};
SC[13] = (t) => {                                                  // the tilt makes seasons → without the Moon it could wobble
  const u = lt(13, t), wob = ss(seg(t, T.wobble - .3, T.wobble + .6));
  if (t < T.wobble + 1.5) {
    setCam(O, 9.5, lerp(.1, .3, u), .18); stars(t);
    const tilt = .41 + wob * .35 * Math.sin((t - T.wobble) * 4), dir = axisDir(tilt, wob * (t - T.wobble) * 2);
    world([earthB(O, t, wob > .5 ? 'scared' : 'happy', { look: .3 })], t); axisLine(dir, 1.6, wob > .5 ? P.red : P.gold);
    const kp = 1 - ss(seg(t, T.wobble + 1.1, T.wobble + 1.5)); if (kp < 1) { g.fillStyle = `rgba(255,255,255,${1 - kp})`; g.fillRect(0, 0, W, H); }
  } else park(t, 13, ((t - T.wobble - 1.5) * 1.2) % 3);
  const ks = pop(t, T.seasons); if (ks > 0 && t < T.wobble) { g.save(); g.translate(CX, 360); g.scale(ks, ks); card(0, 0, 520, 110, 1); text('TILT = SEASONS', 0, 22, 58, P.gold, 1000, null, 0); g.restore(); }
  if (t > T.millions) cardPop(t, T.millions, CX, 330, 620, 110, 'over MILLIONS of years', 50, P.white);
};
SC[14] = (t) => {                                                  // seasons swing to extremes — climate on shuffle
  const k = Math.floor((t - S[14]) * 1.6), hot = k % 2 === 0;
  park(t, 14, hot ? 0 : 2.5, { hot, palm: 1, snow: !hot, shorts: 1, scarf: 1, mood: hot ? 'scared' : 'worried' });
  const ksh = pop(t, T.shuffle - .2); if (ksh > 0) { g.save(); g.translate(CX, 360); g.scale(ksh, ksh); card(0, 0, 760, 200, 1, 'rgba(12,10,44,.85)'); text("Earth's climate", -60, -20, 46, P.white, 1000, null, 0); text(hot ? 'SUMMER: way too hot' : 'WINTER: way too cold', -60, 40, 38, hot ? '#ffb36a' : '#9ad7ff', 900, null, 0); dot(300, 0, 52, P.gold); g.strokeStyle = P.navy; g.lineWidth = 9; g.beginPath(); g.moveTo(270, -22); g.lineTo(330, 22); g.moveTo(270, 22); g.lineTo(330, -22); g.stroke(); K.arrow(318, -14, 334, -26, P.navy, 6); K.arrow(318, 14, 334, 26, P.navy, 6); g.restore(); }
  if (t > T.vibe - .1) text('NOT A VIBE', CX, 620, 90, P.red, 1000, P.white, 14, 'center', pop(t, T.vibe - .1));
};
SC[15] = (t) => {                                                  // don't panic: Earth keeps orbiting and spinning; tiny people wave
  const u = lt(15, t); setCam(O, 6.5, lerp(-.3, .2, u), .25); stars(t);
  world([earthB(O, t, 'happy', { rot: t * .8, look: 0, after: q => { for (let k = 0; k < 5; k++) { const a = -Math.PI / 2 + (k - 2) * .32; g.save(); g.translate(q.x + Math.cos(a) * q.s * 1.0, q.y + Math.sin(a) * q.s * 1.0); g.rotate(a + Math.PI / 2); kid(0, 0, .22, t + k, { wave: 1, hood: ['#ff7a59', '#3fb58a', '#f2a33a', '#c45bd9', '#5b6cff'][k], hoodD: 'rgba(0,0,0,.2)', seed: k }); g.restore(); } } })], t);
  const kp = pop(t, T.spinning + .2); if (kp > 0) { g.save(); g.translate(CX + 220, 380); g.rotate(.12); g.scale(kp, kp); g.fillStyle = P.gold; g.beginPath(); g.roundRect(-170, -70, 340, 140, 36); g.fill(); text('PHEW', 0, 30, 90, P.navy, 1000, null, 0); g.restore(); }
};
SC[16] = (t) => {                                                  // payoff: the Moon zooms back, carrying a tiny Earth — loops to frame 1
  K.bg(t, '#090726', '#271a66');
  const back = ss(seg(t, VO.m17 + .2, VO.m17 + 1.3)), mx = lerp(1400, 760, eo(back)), my = lerp(-200, 430, eo(back));
  L(16, t, .15, () => { if (back > 0) { glow(mx, my, 330, '220,230,255', .35 * back); K.moon(mx, my, 110, t, 'smug', { look: -1 }); shades(mx, my - 10, 110, 1); const ke = ss(seg(t, T.carrying - .3, T.carrying + .2)); if (ke > 0) K.earth(mx + 70, my - 120, 46 * ke, t, 'love', { look: -1 }); } });
  L(16, t, .4, () => skyline(t, '#1b1846', 1, 3));
  L(16, t, .75, () => rooftop(t));
  L(16, t, 1, () => kid(330, 1520, 1.05, t, { point: back > .9, mood: back > .9 ? 'love' : 'worried', lookY: -1, look: .6 }));
  cardPop(t, T.carrying, CX, 300, 600, 130, 'BRO CARRIED US', 64, P.gold);
};

const CONT = new Set();

// ───────── captions: word-pops, key words in gold (lower middle, above the Shorts UI)
const FIX = { 'moon': 'Moon', "moon's": "Moon's", 'sun': 'Sun', 'earth': 'Earth', "earth's": "Earth's", 'pools': 'pulls', 'tidepools': 'Tide pools', 'l': 'L' };
const KEY = new Set(['moon', 'gone', 'out', 'cooked', 'l', 'oceans', 'gravity', 'tides', 'sun', 'half', 'weaker', 'currents', 'food', 'tidepools', 'crabs', 'snails', 'clocks', 'corals', 'moonlight', 'spawn', 'thousands', 'eggs', 'signal', 'apart', 'darker', 'hundred', 'starlight', 'tilt', 'steady', 'seasons', 'wobble', 'millions', 'extremes', 'shuffle', 'vibe', 'panic', 'spinning', 'granted', 'carrying', 'bro', 'bros']);
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
  const draw = (k, z, a) => { g.save(); GA = a; g.globalAlpha = a; g.translate(CX, 1000); g.scale(z, z); g.translate(-CX, -1000); SC[k](t); g.restore(); GA = 1; g.filter = 'none'; };
  if (i > 0 && u < 1 && !CONT.has(i)) { draw(i - 1, 1 + .08 * eio(u), 1); draw(i, 1.06 - .06 * eo(u), ss(u)); }
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
