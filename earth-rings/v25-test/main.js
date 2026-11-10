// "What If Earth Had Rings?" — 2.5D look test (lines 1–3 of v2, about 15 s). Canvas 2D, our flat Beyond Everything drawing kit,
// but placed in a real 3D world seen through a perspective camera: the ring is a true 3D annulus (split into the half behind and the
// half in front of Earth, with Earth's shadow falling across it), its rocks are 3D points sorted by depth, near rocks get
// depth-of-field blur, and three star layers move with parallax. Camera: orbit → crane up over the Sun and the habitable zone →
// swing back for the reveal. Deterministic in t.
import * as K from './kit.js';
import { clamp, lerp, seg, ss, eio, eo, mulberry, TAU } from '/core/lib.js';
const { P, text, card, pop, glow, sparkle } = K;

const W = 1080, H = 1920, CX = W / 2, CY = H / 2;
const cv = document.getElementById('c'), g = cv.getContext('2d');
K.setup(g, W, H); K.makeStars(70, 5);
await document.fonts.load('900 80px NU'); await document.fonts.load('800 40px NU');
const words = await (await fetch('voices/words.json')).json();
const lines = await (await fetch('lines.json')).json();
const dur = await (await fetch('voices/dur.json')).json();
const IDS = lines.map(l => l.id), VO = {};
{ let t = .2; for (const id of IDS) { VO[id] = +t.toFixed(3); t += dur[id] + .45; } }
const LAST = IDS[IDS.length - 1], DUR = +(VO[LAST] + dur[LAST] + 1.8).toFixed(2);
const nrm = s => s.toLowerCase().replace(/[^a-z0-9]/g, '');
const at = (id, w, k = 0, e = 1) => { let n = 0; for (const x of words[id]) if (nrm(x[0]).startsWith(nrm(w)) && n++ === k) return VO[id] + Math.max(0, x[e]); throw new Error(`${w} in ${id}`); };
const T = { ring1: at('e01', 'ring'), spot: at('e02', 'spot'), newW: at('e02', 'new'), earth3: at('e03', 'earth'), y466: at('e03', '466') };
const S = [0, VO.e02 - .3, VO.e03 - .3, DUR];

// ───────── tiny 3D: vectors, camera, projection
const v3 = (x, y, z) => ({ x, y, z }), add = (a, b) => v3(a.x + b.x, a.y + b.y, a.z + b.z), sub = (a, b) => v3(a.x - b.x, a.y - b.y, a.z - b.z), mul = (a, k) => v3(a.x * k, a.y * k, a.z * k);
const dot = (a, b) => a.x * b.x + a.y * b.y + a.z * b.z, crs = (a, b) => v3(a.y * b.z - a.z * b.y, a.z * b.x - a.x * b.z, a.x * b.y - a.y * b.x), nz = a => mul(a, 1 / Math.hypot(a.x, a.y, a.z));
const SUN = v3(0, 0, 0), E = v3(12, 0, 0), RE = 1;
let CAM = null;
function setCam(tgt, dist, az, el, fov = 40) {
  const pos = add(tgt, v3(dist * Math.cos(el) * Math.sin(az), dist * Math.sin(el), dist * Math.cos(el) * Math.cos(az)));
  const f = nz(sub(tgt, pos)), r = nz(crs(f, v3(0, 1, 0))), u = crs(r, f);
  CAM = { pos, f, r, u, F: (H / 2) / Math.tan(fov / 2 * Math.PI / 180), az, el };
}
function pr(p) { const d = sub(p, CAM.pos), z = dot(d, CAM.f); return { x: CX + dot(d, CAM.r) / z * CAM.F, y: CY - dot(d, CAM.u) / z * CAM.F, z, s: CAM.F / z }; }

// ───────── the ring: Earth's equatorial plane, tilted; basis vectors u, w in that plane
const TILT = .38, RN = nz(v3(-Math.sin(TILT), Math.cos(TILT), 0)), RU = nz(crs(RN, v3(0, 0, 1))), RW = crs(RN, RU);
const BANDS = [[1.45, 1.62, [154, 147, 168], .55], [1.68, 1.98, [196, 189, 208], .9], [1.98, 2.05, [93, 86, 112], .3], [2.05, 2.32, [170, 162, 186], .8], [2.32, 2.45, [120, 112, 138], .45]];
const ringPt = (r, a) => add(E, add(mul(RU, r * Math.cos(a)), mul(RW, r * Math.sin(a))));
const SUNDIR = nz(sub(SUN, E));
const inEarthShadow = p => { const d = sub(p, E), along = dot(d, SUNDIR); if (along > 0) return 0; const perp = Math.hypot(...['x', 'y', 'z'].map(k => d[k] - SUNDIR[k] * along)); return perp < RE ? 1 : 0; };
const NSEG = 160;
function ringPass(front, a = 1) {                                 // draw the ring quads that are in front of (or behind) Earth's centre
  if (a <= 0) return; const ez = pr(E).z;
  for (const [r0, r1, col, al] of BANDS) for (let i = 0; i < NSEG; i++) {
    const a0 = i / NSEG * TAU, a1 = (i + 1.06) / NSEG * TAU, am = (a0 + a1) / 2, pm = ringPt((r0 + r1) / 2, am), q = pr(pm);
    if ((q.z < ez) !== front) continue;
    const sh = inEarthShadow(pm), c = sh ? col.map(v => v * .42) : col;
    const p0 = pr(ringPt(r0, a0)), p1 = pr(ringPt(r1, a0)), p2 = pr(ringPt(r1, a1)), p3 = pr(ringPt(r0, a1));
    g.fillStyle = `rgba(${c.map(Math.round).join(',')},${al * a})`; g.beginPath(); g.moveTo(p0.x, p0.y); g.lineTo(p1.x, p1.y); g.lineTo(p2.x, p2.y); g.lineTo(p3.x, p3.y); g.closePath(); g.fill();
  }
}
const ROCKS = (() => { const R = mulberry(9), a = []; for (let i = 0; i < 320; i++) a.push({ a: R() * TAU, r: 1.45 + R() * 1.0, h: (R() - .5) * .05, s: .012 + R() * R() * .045, sp: .05 + R() * .04, c: R() < .5 ? '#ffffff' : '#b2abbe', rot: R() * 6 }); return a; })();
function rockPass(t, front, a = 1) {
  if (a <= 0) return; const ez = pr(E).z;
  for (const k of ROCKS) { const p = add(ringPt(k.r, k.a + t * k.sp), mul(RN, k.h)), q = pr(p); if ((q.z < ez) !== front) continue; const rr = k.s * q.s; if (rr < .6) continue;
    g.globalAlpha = a * (inEarthShadow(p) ? .35 : 1); rock2(q.x, q.y, rr, k.rot + t, k.c); }
  g.globalAlpha = 1;
}
function rock2(x, y, r, rot, col) { g.save(); g.translate(x, y); g.rotate(rot); g.fillStyle = col; g.beginPath(); for (let i = 0; i < 6; i++) { const a = i / 6 * TAU, rr = r * (.75 + .25 * Math.sin(i * 2.3)); g.lineTo(Math.cos(a) * rr, Math.sin(a) * rr); } g.closePath(); g.fill(); g.restore(); }

// near rocks between the camera and Earth: depth of field (blurred when far from the focus plane)
const NEAR = (() => { const R = mulberry(31), a = []; for (let i = 0; i < 7; i++) a.push(v3(12 + (R() - .5) * 9, (R() - .5) * 5, 4 + R() * 5)); return a; })();
function nearRocks(t, a = 1) {
  if (a <= 0) return; const fz = pr(E).z;
  for (const [i, p0] of NEAR.entries()) { const p = add(p0, v3(Math.sin(t * .3 + i) * .4, Math.cos(t * .25 + i) * .3, 0)), q = pr(p); if (q.z < .5) continue; const rr = .07 * q.s; if (rr > 160 || q.x < -300 || q.x > W + 300) continue;
    const blur = Math.min(10, Math.abs(q.z - fz) * 1.4); g.save(); g.filter = `blur(${blur.toFixed(1)}px)`; g.globalAlpha = a * .9; rock2(q.x, q.y, rr, t * .4 + i, '#3a3260'); g.globalAlpha = a * .5; rock2(q.x - rr * .2, q.y - rr * .2, rr * .55, t * .4 + i, '#6a6090'); g.restore(); }
}

// ───────── parallax stars: the kit background (far) + two nearer layers that slide with the camera
const STAR2 = Array.from({ length: 90 }, (_, i) => { const R = mulberry(i + 50); return { x: R(), y: R(), r: R(), k: R() < .25 }; });
function stars(t) {
  const sx = CAM.az * 900, sy = CAM.el * 900;
  g.save(); g.translate(((-sx * .15) % W + W) % W - W, 0); K.bg(t); g.translate(W, 0); K.bg(t); g.restore();
  for (const [lay, f, sz] of [[0, .45, 1], [1, .9, 1.8]]) for (const [i, s] of STAR2.entries()) { if (i % 2 !== lay) continue;
    const x = ((s.x * W * 1.6 - sx * f) % (W * 1.6) + W * 1.6) % (W * 1.6) - W * .3, y = ((s.y * H * 1.4 + sy * f) % (H * 1.4) + H * 1.4) % (H * 1.4) - H * .2;
    if (s.k) sparkle(x, y, (8 + s.r * 10) * sz, P.spark, .8); else { g.globalAlpha = .4 + .4 * s.r; g.fillStyle = P.star; g.beginPath(); g.arc(x, y, (1.2 + s.r * 2) * sz, 0, TAU); g.fill(); g.globalAlpha = 1; } }
}

// ───────── the orbital plane: the habitable zone (an annulus around the Sun) and Earth's orbit, in perspective
function annulus(c, r0, r1, fill, n = 160) {
  g.fillStyle = fill; g.beginPath();
  for (let i = 0; i <= n; i++) { const a = i / n * TAU, q = pr(add(c, v3(Math.cos(a) * r1, 0, Math.sin(a) * r1))); i ? g.lineTo(q.x, q.y) : g.moveTo(q.x, q.y); }
  for (let i = n; i >= 0; i--) { const a = i / n * TAU, q = pr(add(c, v3(Math.cos(a) * r0, 0, Math.sin(a) * r0))); g.lineTo(q.x, q.y); }
  g.fill('evenodd');
}

// ───────── camera choreography (blend orbit parameters, so moves are true orbits, not straight lines)
const tgtE = add(E, v3(0, .25, 0));
function cam(t) {
  const A = { t: tgtE, d: 11.5, az: lerp(-.75, -.35, t / 4), el: lerp(.12, .2, t / 4) };
  const B = { t: v3(7.6, 0, 0), d: 31, az: Math.PI / 2 - .12, el: 1.02 };
  const C = { t: tgtE, d: lerp(10.5, 9.2, ss(seg(t, 9, DUR))), az: lerp(-.25, .2, seg(t, 8.6, DUR)), el: .2 };
  const k1 = eio(seg(t, 3.4, 6.2)), k2 = eio(seg(t, 8.3, 10.2));
  const m = (a, b, k) => ({ t: add(mul(a.t, 1 - k), mul(b.t, k)), d: lerp(a.d, b.d, k), az: lerp(a.az, b.az, k), el: lerp(a.el, b.el, k) });
  const c = k2 > 0 ? m(m(A, B, k1), C, k2) : m(A, B, k1); setCam(c.t, c.d, c.az, c.el);
}

// ───────── frame
function render(t) {
  g.setTransform(1, 0, 0, 1, 0, 0); g.globalAlpha = 1; g.filter = 'none';
  cam(t); stars(t);
  const zone = ss(seg(t, Math.max(T.spot, 5.4) - .5, Math.max(T.spot, 5.4) + .4)) * (1 - ss(seg(t, 8.4, 9.6)));
  if (zone > 0) annulus(SUN, 10.2, 13.8, `rgba(95,207,122,${.26 * zone})`);
  const orb = ss(seg(t, 3.8, 5.2)) * (1 - ss(seg(t, 8.4, 9.6))); if (orb > 0) annulus(SUN, 11.96, 12.04, `rgba(255,255,255,${.4 * orb})`, 240);
  const ps = pr(SUN); if (ps.z > 0) { glow(ps.x, ps.y, 3.2 * ps.s, '255,210,120', .35); K.sunChar(ps.x, ps.y, 1.25 * ps.s, t, { mood: 'happy' }); }
  ringPass(false); rockPass(t, false);
  const pe = pr(E), face = ss(seg(t, T.earth3 - .25, T.earth3 + .15));
  K.earth(pe.x, pe.y, RE * pe.s, t, 'wink', { rot: t * .35 - CAM.az, noFace: face < .5, look: -.2 });
  ringPass(true); rockPass(t, true);
  nearRocks(t, 1 - ss(seg(t, 3.6, 5)) + ss(seg(t, 9.5, 11)));
  overlay(t, pe);
  captions(t);
  const fo = seg(t, DUR - .6, DUR); if (fo > 0) { g.fillStyle = `rgba(0,0,0,${fo})`; g.fillRect(0, 0, W, H); }
}

function overlay(t, pe) {
  const aA = 1 - ss(seg(t, 3.2, 3.9));
  if (aA > 0) {
    const sc = .5 + .5 * Math.sin(t * 3), R = 300; g.save(); g.globalAlpha = aA; g.strokeStyle = `rgba(63,224,255,${.5 + .3 * sc})`; g.lineWidth = 6;
    for (const [sx, sy] of [[-1, -1], [1, -1], [1, 1], [-1, 1]]) { g.beginPath(); g.moveTo(pe.x + sx * R, pe.y + sy * (R - 80)); g.lineTo(pe.x + sx * R, pe.y + sy * R); g.lineTo(pe.x + sx * (R - 80), pe.y + sy * R); g.stroke(); } g.restore();
    text('SCANNING…', pe.x, pe.y + 380, 40, P.cyan, 1000, P.navy, 8, 'center', aA * (.6 + .4 * sc));
    g.save(); g.globalAlpha = aA; g.translate(CX, 330); text('WHAT IS', 0, -20, 92, P.white, 1000, P.navy, 16); text('THIS PLANET?', 0, 110, 120, P.gold, 1000, P.navy, 18); g.restore();
  }
  const aB = ss(seg(t, Math.max(T.spot, 5.6) - .3, Math.max(T.spot, 5.6) + .2)) * (1 - ss(seg(t, 8.2, 8.8)));
  if (aB > 0) { text('habitable zone', CX, pe.y - 440, 56, '#8af0a6', 1000, P.navy, 10, 'center', aB); text('just right for life', CX, pe.y - 380, 42, P.white, 900, P.navy, 8, 'center', aB); }
  const ks = pop(t, T.newW) * (1 - ss(seg(t, 8.2, 8.8)));
  if (ks > 0) { g.save(); g.translate(CX, pe.y - 230); g.rotate(-.12); g.scale(ks, ks); g.strokeStyle = P.red; g.lineWidth = 10; g.beginPath(); g.roundRect(-230, -60, 460, 120, 20); g.stroke(); text('NEW WORLD?', 0, 22, 70, P.red, 1000, null, 0); g.restore(); }
  const ke = pop(t, T.earth3); if (ke > 0) { g.save(); g.translate(CX, 380); g.scale(ke, ke); text("IT'S EARTH", 0, 40, 130, P.gold, 1000, P.navy, 18); g.restore(); }
  const ky = pop(t, T.y466 - .1); if (ky > 0) { g.save(); g.translate(CX, 1400); g.scale(ky, ky); card(0, 0, 760, 170, 1); text('466 MILLION', 0, -5, 84, P.gold, 1000, null, 0); text('YEARS AGO', 0, 58, 46, P.white, 1000, null, 0); g.restore(); }
}

// ───────── captions (same as the 2D films)
const FIX = { 'earth': 'Earth' };
const KEY = new Set(['planet', 'oceans', 'ring', 'saturn', 'life', 'earth', '466', 'million', 'new', 'world']);
const CAP = [];
for (const [id, ws] of Object.entries(words)) {
  const toks = []; for (const w of ws) { const b = w[0].toLowerCase().replace(/[.,?]$/, ''), s = FIX[b] ? FIX[b] + (w[0].match(/[.,?]$/)?.[0] || '') : w[0]; if (/^[,.\-]/.test(s) && toks.length) { const p = toks[toks.length - 1]; p.w += s.replace(/^-/, ' '); p.t1 = w[2]; } else toks.push({ w: s, k: w[0], t0: Math.max(0, w[1]), t1: w[2] }); }
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
