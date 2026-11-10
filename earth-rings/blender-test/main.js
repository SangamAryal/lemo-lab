// "What If Earth Had Rings?" — Blender look test (lines 1–3 of v2, about 15 s). Canvas 2D, our flat Beyond Everything drawing kit,
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

// ───────── Blender's frames (3D world, transparent background) and its per-frame screen positions
const PROJ = await (await fetch('proj.json')).json(), NF = PROJ.frames.length;
let CAM = { az: 0, el: 0 };
const frameImg = f => new Promise((res, rej) => { const im = new Image(); im.onload = () => res(im); im.onerror = rej; im.src = `frames/${String(f).padStart(4, '0')}.webp`; });

// ───────── parallax stars: the kit background (far) + two nearer layers that slide with the camera
const STAR2 = Array.from({ length: 90 }, (_, i) => { const R = mulberry(i + 50); return { x: R(), y: R(), r: R(), k: R() < .25 }; });
function stars(t) {
  const sx = CAM.az * 900, sy = CAM.el * 900;
  g.save(); g.translate(((-sx * .15) % W + W) % W - W, 0); K.bg(t); g.translate(W, 0); K.bg(t); g.restore();
  for (const [lay, f, sz] of [[0, .45, 1], [1, .9, 1.8]]) for (const [i, s] of STAR2.entries()) { if (i % 2 !== lay) continue;
    const x = ((s.x * W * 1.6 - sx * f) % (W * 1.6) + W * 1.6) % (W * 1.6) - W * .3, y = ((s.y * H * 1.4 + sy * f) % (H * 1.4) + H * 1.4) % (H * 1.4) - H * .2;
    if (s.k) sparkle(x, y, (8 + s.r * 10) * sz, P.spark, .8); else { g.globalAlpha = .4 + .4 * s.r; g.fillStyle = P.star; g.beginPath(); g.arc(x, y, (1.2 + s.r * 2) * sz, 0, TAU); g.fill(); g.globalAlpha = 1; } }
}

// ───────── frame: 2D stars → 2D Sun → Blender's 3D frame → 2D face on Earth → type and captions
async function render(t) {
  const f = Math.min(NF - 1, Math.max(0, Math.round(t * PROJ.fps))), P3 = PROJ.frames[f], img = await frameImg(f);
  g.setTransform(1, 0, 0, 1, 0, 0); g.globalAlpha = 1; g.filter = 'none';
  CAM = { az: P3.az, el: P3.el }; stars(t);
  const [sx, sy, ss_, sz] = P3.sun; if (sz > 0) { glow(sx, sy, 3.2 * ss_, '255,210,120', .35); K.sunChar(sx, sy, 1.25 * ss_, t, { mood: 'happy' }); }
  { const [gx, gy, gs] = P3.earth; glow(gx, gy, 1.45 * gs, '90,170,255', .28); }
  g.drawImage(img, 0, 0, W, H);
  const [ex, ey, es] = P3.earth, face = ss(seg(t, T.earth3 - .25, T.earth3 + .15));
  if (face > 0) { g.save(); g.globalAlpha = face; g.translate(ex, ey); K.face(es, 'wink', t, -.2, .7); g.restore(); }
  overlay(t, { x: ex, y: ey });
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
await render(+(new URLSearchParams(location.search).get('t') ?? 1.5));
window.READY = true;
