// "The Sun Is Terrible at Its Job" (v2, story-first) — flat-vector explainer, vertical 1080×1920, canvas 2D, deterministic in t.
// Same look as the Moon film: lineless shapes, two-tone cel shading, soft glows, sparkle stars, gold keyword captions.
// The Sun is a character (sleepy eyes, sunglasses, a mug). Our own designs.
import { clamp, lerp, seg, ss, eio, eo, mulberry, TAU } from '/core/lib.js';

const W = 1080, H = 1920, CX = W / 2;
const cv = document.getElementById('c'), g = cv.getContext('2d');
await document.fonts.load('900 80px NU'); await document.fonts.load('800 40px NU');
const words = await (await fetch('voices/words.json')).json();
const lines = await (await fetch('lines.json')).json();

// ───────── timeline
const dur = await (await fetch('voices/dur.json')).json();
const IDS = lines.map(l => l.id), VO = {};
{ let t = .25; for (const id of IDS) { VO[id] = +t.toFixed(3); t += dur[id] + (id === 'a04' ? .75 : .35); } }   // a beat of silence after the question
const DUR = +(VO.a10 + dur.a10 + 1.6).toFixed(2);
const nrm = s => s.toLowerCase().replace(/[^a-z0-9]/g, '');
const at = (id, w, k = 0, e = 1) => { let n = 0; for (const x of words[id]) if (nrm(x[0]).startsWith(nrm(w)) && n++ === k) return VO[id] + Math.max(0, x[e]); throw new Error(`${w} in ${id}`); };
const vEnd = id => { const ws = words[id]; return VO[id] + ws[ws.length - 1][2]; };
const S = [0, VO.a02 - .35, VO.a03 - .35, VO.a04 - .35, VO.a05 - .3, VO.a07 - .3, VO.a08 - .3, VO.a09 - .3, VO.a10 - .3, DUR];   // scene starts
// the v1 scenes are reused; their cue names are re-pointed at the v2 words
const NEVER = 1e9;
const T = {
  cut: -1, lazy: at('a01', 'terrible'),
  take: at('a02', 'one'), core: at('a02', 'core'), puts: at('a02', 'makes'), compost: at('a02', 'compost'), heap: at('a02', 'heap'),
  body: at('a03', 'make'), several: at('a03', 'that'), congrats: at('a03', 'per') - .2, outperf: at('a03', 'outperforming'), please: at('a03', 'outperforming') + .6, cv: at('a03', 'star'),
  light: at('a04', 'light'), just: NEVER, big: NEVER, face: NEVER, core8: NEVER, thousands: NEVER, crossed: NEVER, minutes: NEVER, suddenly: NEVER,
  fusion: at('a05', 'protons'), push: at('a05', 'shove'), normal: at('a05', 'shove') + .8, never: NEVER,
  only: at('a06', 'only'), tunnel: at('a06', 'tunneling'), walking: at('a06', 'walking'), anyway: at('a06', 'anyway'),
  average: at('a07', 'average'), billion: at('a07', 'billion'), turn: at('a07', 'turn'),
  many: at('a08', 'many'), pulls: at('a08', 'pulls'), hundred: at('a08', 'hundred'), second: at('a08', 'second'),
  twist: at('a09', 'secret'), easy: at('a09', 'easy'), burned: at('a09', 'burned'), crawled: at('a09', 'life'),
  instead: NEVER, time14: NEVER, oceans: NEVER, dinos: NEVER, you14: NEVER,
  lazy15: at('a10', 'lazy'), pacing: at('a10', 'pacing'), star: at('a10', 'itself'),
};
const sceneAt = t => { let i = 0; while (i < S.length - 2 && t >= S[i + 1]) i++; return i; };

// ───────── palette and drawing kit (from the Moon film)
const P = { bg0: '#0a0626', bg1: '#1d1152', star: '#b9a8ff', spark: '#ece6ff', navy: '#17163f', gold: '#ffc73a', red: '#ff4d6d', cyan: '#3fe0ff', white: '#ffffff',
  ocean: '#3d8be8', land: '#5fcf7a', sun: '#ffcf4a', sunD: '#ff9a2e', core: '#fff3b0', skin: '#f2b48c', skinD: '#d9946b', hair: '#2b2140', hood: '#5b6cff', hoodD: '#4252d6', jeans: '#2d2f5e',
  couch: '#e2557b', couchD: '#b83d62', brown: '#7a4a2a', brownD: '#5a3418', leaf: '#5fcf7a', proton: '#ff5a6e', protonD: '#d63a52', brick: '#c9654a', brickD: '#a24a35' };
const R0 = mulberry(5), STARS = Array.from({ length: 110 }, () => ({ x: R0() * W, y: R0() * H, k: R0(), r: R0(), tw: R0() * 6 }));
function bg(t, top = P.bg0, bot = P.bg1, a = 1) {
  g.save(); g.globalAlpha = a; const gr = g.createLinearGradient(0, 0, 0, H); gr.addColorStop(0, top); gr.addColorStop(1, bot); g.fillStyle = gr; g.fillRect(0, 0, W, H);
  for (const [x, y, r, c] of [[200, 520, 420, 'rgba(120,60,200,.16)'], [900, 1250, 520, 'rgba(70,40,180,.14)'], [420, 1700, 480, 'rgba(160,70,200,.10)']]) { const n = g.createRadialGradient(x, y, 0, x, y, r); n.addColorStop(0, c); n.addColorStop(1, 'rgba(0,0,0,0)'); g.fillStyle = n; g.fillRect(x - r, y - r, 2 * r, 2 * r); }
  for (const s of STARS) { const tw = .55 + .45 * Math.sin(t * 2 + s.tw); if (s.k < .13) sparkle(s.x, s.y, (10 + s.r * 14) * (.8 + .2 * tw), P.spark, .9 * a); else { g.globalAlpha = (.3 + .5 * s.r) * tw * a; g.fillStyle = P.star; g.beginPath(); g.arc(s.x, s.y, 1.4 + s.r * 2.6, 0, TAU); g.fill(); } }
  g.restore();
}
function sparkle(x, y, r, col = P.spark, a = 1) { g.save(); g.globalAlpha *= a; g.fillStyle = col; g.beginPath(); g.moveTo(x, y - r); g.quadraticCurveTo(x + r * .14, y - r * .14, x + r, y); g.quadraticCurveTo(x + r * .14, y + r * .14, x, y + r); g.quadraticCurveTo(x - r * .14, y + r * .14, x - r, y); g.quadraticCurveTo(x - r * .14, y - r * .14, x, y - r); g.fill(); g.restore(); }
function glow(x, y, r, rgb, a = .6) { const gr = g.createRadialGradient(x, y, 0, x, y, r); gr.addColorStop(0, `rgba(${rgb},${a})`); gr.addColorStop(1, `rgba(${rgb},0)`); g.fillStyle = gr; g.fillRect(x - r, y - r, 2 * r, 2 * r); }
function text(s, x, y, px, col = P.white, wt = 900, outline = P.navy, ow = 14, align = 'center', a = 1) {
  if (a <= 0) return; g.save(); g.globalAlpha *= a; g.font = `${wt} ${px}px NU`; g.textAlign = align; g.textBaseline = 'alphabetic'; g.lineJoin = 'round';
  if (outline) { g.lineWidth = ow; g.strokeStyle = outline; g.strokeText(s, x, y); } g.fillStyle = col; g.fillText(s, x, y); g.restore();
}
const pop = (t, t0, d = .35) => { const u = clamp((t - t0) / d); return u <= 0 ? 0 : 1 + Math.sin(u * Math.PI) * .18 * (1 - u) - (1 - eo(u)) * .9; };
const fade = (t, a, b, d = .3) => ss(seg(t, a, a + d)) * (1 - ss(seg(t, b - d, b)));
function arrow(x0, y0, x1, y1, col, w = 16, a = 1) {
  if (a <= 0) return; g.save(); g.globalAlpha *= a; g.strokeStyle = g.fillStyle = col; g.lineWidth = w; g.lineCap = 'round';
  const ang = Math.atan2(y1 - y0, x1 - x0), hl = w * 2.2; g.beginPath(); g.moveTo(x0, y0); g.lineTo(x1 - Math.cos(ang) * hl * .6, y1 - Math.sin(ang) * hl * .6); g.stroke();
  g.beginPath(); g.moveTo(x1, y1); g.lineTo(x1 - Math.cos(ang - .5) * hl, y1 - Math.sin(ang - .5) * hl); g.lineTo(x1 - Math.cos(ang + .5) * hl, y1 - Math.sin(ang + .5) * hl); g.closePath(); g.fill(); g.restore();
}
function card(x, y, w, h, a = 1, fill = 'rgba(12,10,44,.72)') { if (a <= 0) return; g.save(); g.globalAlpha *= a; g.fillStyle = fill; g.beginPath(); g.roundRect(x - w / 2, y - h / 2, w, h, 24); g.fill(); g.strokeStyle = 'rgba(185,168,255,.4)'; g.lineWidth = 3; g.stroke(); g.restore(); }
function bubble(x, y, w, h, s, a = 1, col = P.navy, tail = -1) { if (a <= 0) return; g.save(); g.globalAlpha *= a; g.fillStyle = P.white; g.beginPath(); g.roundRect(x - w / 2, y - h / 2, w, h, h / 2.4); g.fill(); g.beginPath(); g.moveTo(x + tail * w * .2, y + h / 2 - 4); g.lineTo(x + tail * w * .34, y + h / 2 + 40); g.lineTo(x + tail * w * .05, y + h / 2 - 4); g.fill(); g.restore(); text(s, x, y + h * .16, h * .42, col, 1000, null, 0, 'center', a); }

// ───────── characters
// mood: happy | sleepy | smug | wink | annoyed | worried | sad | keen | scared | love
function face(r, mood, t, look = 0, blinkSeed = 0, lookY = 0) {
  const ex = r * .3, ey = -r * .05, ew = r * .11, eh = r * .15;
  const bl = ((t + blinkSeed) % 3.7) < .12 ? .12 : 1;
  g.fillStyle = P.navy;
  for (const s of [-1, 1]) {
    g.save(); g.translate(s * ex + look * r * .06, ey + lookY * r * .05);
    if (mood === 'sleepy' || mood === 'smug' || (mood === 'wink' && s < 0)) {
      g.beginPath(); g.ellipse(0, 0, ew, eh * .9, 0, 0, Math.PI); g.fill();
      g.lineWidth = r * .04; g.strokeStyle = P.navy; g.lineCap = 'round'; g.beginPath(); g.moveTo(-ew * 1.25, -eh * .05); g.lineTo(ew * 1.25, eh * .05 * s); g.stroke();
    } else if (mood === 'wink') { g.lineWidth = r * .045; g.strokeStyle = P.navy; g.lineCap = 'round'; g.beginPath(); g.arc(0, eh * .4, ew * 1.1, Math.PI * 1.15, Math.PI * 1.85); g.stroke(); }
    else if (mood === 'annoyed') { g.beginPath(); g.ellipse(0, 0, ew, eh * .55, 0, 0, TAU); g.fill(); g.lineWidth = r * .045; g.strokeStyle = P.navy; g.lineCap = 'round'; g.beginPath(); g.moveTo(-ew * 1.2, -eh * (s > 0 ? .9 : 1.5)); g.lineTo(ew * 1.2, -eh * (s > 0 ? 1.5 : .9)); g.stroke(); }
    else if (mood === 'love') { g.fillStyle = P.red; g.beginPath(); g.moveTo(0, eh * .6); g.bezierCurveTo(-ew * 1.6, -eh * .2, -ew * .5, -eh * 1.2, 0, -eh * .3); g.bezierCurveTo(ew * .5, -eh * 1.2, ew * 1.6, -eh * .2, 0, eh * .6); g.fill(); g.fillStyle = P.navy; }
    else { const k = mood === 'keen' || mood === 'scared' ? 1.25 : 1; g.beginPath(); g.ellipse(0, 0, ew * k, eh * bl * k, 0, 0, TAU); g.fill(); if (bl > .5) { g.fillStyle = P.white; g.beginPath(); g.arc(-ew * .3, -eh * .35, ew * .38 * k, 0, TAU); g.fill(); g.fillStyle = P.navy; } }
    if (mood === 'worried' || mood === 'scared' || mood === 'sad') { g.lineWidth = r * .04; g.strokeStyle = P.navy; g.lineCap = 'round'; g.beginPath(); g.moveTo(-ew * 1.1, -eh * (s > 0 ? 1.7 : 1.2)); g.lineTo(ew * 1.1, -eh * (s > 0 ? 1.2 : 1.7)); g.stroke(); }
    g.restore();
  }
  g.fillStyle = 'rgba(255,120,150,.5)'; for (const s of [-1, 1]) { g.beginPath(); g.ellipse(s * r * .5, r * .17, r * .1, r * .06, 0, 0, TAU); g.fill(); }
  g.strokeStyle = P.navy; g.lineWidth = r * .045; g.lineCap = 'round'; g.beginPath();
  const my = r * .22;
  if (mood === 'happy' || mood === 'love' || mood === 'smug' || mood === 'wink') g.arc(0, my - r * .08, r * .14, Math.PI * .15, Math.PI * .85);
  else if (mood === 'sleepy') { g.moveTo(-r * .08, my + r * .02); g.quadraticCurveTo(0, my + r * .05, r * .08, my + r * .02); }
  else if (mood === 'annoyed') { g.moveTo(-r * .1, my + r * .02); g.lineTo(r * .1, my - r * .01); }
  else if (mood === 'keen') { g.stroke(); g.fillStyle = P.navy; g.beginPath(); g.arc(0, my - r * .04, r * .15, 0, Math.PI); g.fill(); g.fillStyle = P.red; g.beginPath(); g.ellipse(0, my + r * .07, r * .07, r * .035, 0, 0, TAU); g.fill(); return; }
  else if (mood === 'scared') { g.stroke(); g.fillStyle = P.navy; g.beginPath(); g.ellipse(0, my + r * .02, r * .07, r * .09, 0, 0, TAU); g.fill(); return; }
  else g.arc(0, my + r * .1, r * .12, Math.PI * 1.15, Math.PI * 1.85);
  g.stroke();
}
function sunBody(x, y, r, t, o = {}) {
  const grey = o.grey || 0, col = (a, b) => grey ? `rgb(${lerp(a[0], b[0], grey)},${lerp(a[1], b[1], grey)},${lerp(a[2], b[2], grey)})` : `rgb(${a})`;
  if (!grey || grey < 1) glow(x, y, r * (2.2 + .1 * Math.sin(t * 2)), '255,200,80', .5 * (1 - grey) * (o.glow ?? 1));
  g.save(); g.translate(x, y);
  const N = 14, wob = o.flare || 0; g.fillStyle = col([255, 154, 46], [90, 84, 110]); g.beginPath();
  for (let i = 0; i <= N * 2; i++) { const a = i / (N * 2) * TAU + t * .15, rr = r * (i % 2 ? 1.12 : 1.24 + wob * (.15 + .1 * Math.sin(t * 13 + i))); g.lineTo(Math.cos(a) * rr, Math.sin(a) * rr); } g.fill();
  g.fillStyle = col([255, 207, 74], [120, 114, 140]); g.beginPath(); g.arc(0, 0, r, 0, TAU); g.fill();
  g.fillStyle = grey ? 'rgba(30,20,60,.3)' : 'rgba(255,140,40,.35)'; g.beginPath(); g.arc(r * .3, r * .15, r * 1.05, 0, TAU); g.arc(-r * .12, -r * .06, r, 0, TAU, true); g.fill('evenodd');
  g.restore();
}
// the Sun character: o.mood, o.shades (0 = on the eyes, 1 = slid down the nose, -1 = pushed up), o.mug (0..1 shown), o.sip (0..1), o.tilt
function sunChar(x, y, r, t, o = {}) {
  sunBody(x, y, r, t, o);
  g.save(); g.translate(x, y); g.rotate(o.tilt || 0);
  face(r, o.mood || 'sleepy', t, o.look || 0, 0, o.lookY || 0);
  if (o.shades != null) {
    const sy = -r * .05 + (o.shades > 0 ? o.shades * r * .2 : o.shades * r * .32);
    g.fillStyle = '#1b1a33'; for (const s of [-1, 1]) { g.beginPath(); g.roundRect(s * r * .3 - r * .17, sy - r * .1, r * .34, r * .2, r * .08); g.fill(); }
    g.fillStyle = 'rgba(255,255,255,.35)'; for (const s of [-1, 1]) { g.beginPath(); g.roundRect(s * r * .3 - r * .12, sy - r * .07, r * .1, r * .05, r * .02); g.fill(); }
    g.strokeStyle = '#1b1a33'; g.lineWidth = r * .035; g.beginPath(); g.moveTo(-r * .13, sy - r * .02); g.lineTo(r * .13, sy - r * .02); g.stroke();
  }
  if (o.mug) {
    const sip = o.sip || 0, mx = lerp(r * .78, r * .2, sip), my = lerp(r * .55, r * .3, sip), rot = -sip * .9;
    g.save(); g.globalAlpha *= o.mug; g.translate(mx, my); g.rotate(rot);
    g.fillStyle = P.white; g.beginPath(); g.roundRect(-r * .13, -r * .15, r * .26, r * .3, r * .05); g.fill();
    g.strokeStyle = P.white; g.lineWidth = r * .045; g.beginPath(); g.arc(r * .15, 0, r * .07, -1.4, 1.4); g.stroke();
    g.fillStyle = P.red; g.fillRect(-r * .13, -r * .03, r * .26, r * .06);
    g.fillStyle = P.sun; g.beginPath(); g.arc(-r * .14, r * .05, r * .09, 0, TAU); g.fill();                // the little hand
    g.strokeStyle = 'rgba(255,255,255,.6)'; g.lineWidth = r * .02; g.lineCap = 'round';
    for (let i = 0; i < 2; i++) { const ph = t * 1.5 + i * 1.7; g.beginPath(); g.moveTo(-r * .04 + i * r * .08, -r * .2); g.quadraticCurveTo(-r * .1 + i * r * .08 + Math.sin(ph) * r * .05, -r * .3, -r * .03 + i * r * .08, -r * .4); g.stroke(); }
    g.restore();
  }
  g.restore();
}
function earth(x, y, r, t, mood = 'happy', o = {}) {
  g.save(); g.translate(x, y);
  const grey = o.grey || 0;
  glow(0, 0, r * 1.45, '90,170,255', .28 * (1 - grey));
  g.beginPath(); g.arc(0, 0, r, 0, TAU); g.save(); g.clip();
  g.fillStyle = P.ocean; g.fillRect(-r, -r, 2 * r, 2 * r);
  const rot = (o.rot ?? t * .25) % TAU;
  for (const [u, v, s] of [[.2, -.35, .42], [.75, .15, .5], [1.3, -.1, .36], [1.85, .4, .3], [2.6, -.3, .45], [3.4, .25, .4], [4.2, -.2, .5], [5.0, .3, .35], [5.7, -.45, .3]]) {
    const a = u + rot, cx = Math.sin(a) * r, vis = Math.cos(a); if (vis < -.1) continue;
    g.fillStyle = P.land; g.beginPath(); g.ellipse(cx, v * r, r * s * .55 * Math.max(.2, vis), r * s * .36, 0, 0, TAU); g.ellipse(cx + r * s * .25 * vis, v * r + r * s * .2, r * s * .35 * Math.max(.2, vis), r * s * .25, 0, 0, TAU); g.fill();
  }
  g.fillStyle = 'rgba(255,255,255,.9)'; g.beginPath(); g.ellipse(0, -r * .93, r * .45, r * .12, 0, 0, TAU); g.fill();
  if (grey) { g.fillStyle = `rgba(70,70,90,${.85 * grey})`; g.fillRect(-r, -r, 2 * r, 2 * r); }
  g.fillStyle = 'rgba(20,30,90,.28)'; g.beginPath(); g.arc(r * .35, r * .1, r * 1.1, 0, TAU); g.arc(-r * .15, -r * .08, r * 1.02, 0, TAU, true); g.fill('evenodd');
  g.restore();
  if (!o.noFace) face(r, mood, t, o.look || 0, .7);
  g.restore();
}
// a person sitting (couch / deck chair). o.phone, o.mug, o.wave (0..1), o.heat (0..1), o.mood
function person(x, y, s, t, o = {}) {
  g.save(); g.translate(x, y); g.scale(s, s);
  if (o.heat) { const p = .8 + .2 * Math.sin(t * 3); glow(0, -150, 330 * p, '255,140,60', .45 * o.heat); }
  // legs: thighs forward, shins down
  g.fillStyle = P.jeans; g.beginPath(); g.roundRect(-70, -40, 190, 70, 34); g.fill(); g.beginPath(); g.roundRect(80, -40, 60, 170, 28); g.fill();
  g.fillStyle = P.white; g.beginPath(); g.roundRect(70, 110, 100, 40, 18); g.fill();                    // shoes
  // body (hoodie)
  g.fillStyle = P.hood; g.beginPath(); g.roundRect(-95, -250, 170, 230, 70); g.fill();
  g.fillStyle = P.hoodD; g.beginPath(); g.roundRect(-95, -250, 60, 230, [70, 0, 0, 70]); g.fill();
  // head
  const hy = -320 + Math.sin(t * 1.3) * 2;
  g.fillStyle = P.skin; g.beginPath(); g.arc(-10, hy, 72, 0, TAU); g.fill();
  g.fillStyle = P.hair; g.beginPath(); g.arc(-10, hy - 14, 74, Math.PI * 1.02, Math.PI * 1.98); g.fill(); g.beginPath(); g.ellipse(-60, hy - 40, 40, 30, -.5, 0, TAU); g.fill();
  g.save(); g.translate(-10, hy + 10); face(60, o.mood || 'happy', t, o.look ?? .8, 2.1, o.lookY ?? .6); g.restore();
  // arms
  g.strokeStyle = P.hood; g.lineWidth = 46; g.lineCap = 'round';
  if (o.wave) { const a = Math.sin(t * 9) * .35 * o.wave; g.beginPath(); g.moveTo(40, -210); g.lineTo(130 + Math.cos(-1.2 + a) * 10, -260 - 60 * o.wave); g.lineTo(150 + Math.sin(a) * 50, -380 * o.wave - 120 * (1 - o.wave)); g.stroke(); g.fillStyle = P.skin; g.beginPath(); g.arc(150 + Math.sin(a) * 50, -390 * o.wave - 120 * (1 - o.wave), 30, 0, TAU); g.fill(); }
  else { g.beginPath(); g.moveTo(40, -210); g.quadraticCurveTo(110, -120, 100, -170); g.stroke(); g.fillStyle = P.skin; g.beginPath(); g.arc(100, -175, 28, 0, TAU); g.fill(); }
  if (o.phone) { g.save(); g.translate(108, -200); g.rotate(-.3); g.fillStyle = '#20203a'; g.beginPath(); g.roundRect(-26, -46, 52, 92, 10); g.fill(); g.fillStyle = '#7fe6ff'; g.beginPath(); g.roundRect(-20, -38, 40, 76, 6); g.fill(); g.restore(); glow(80, -230, 120, '120,230,255', .25); }
  if (o.mug) { g.save(); g.translate(112, -190); g.fillStyle = P.white; g.beginPath(); g.roundRect(-26, -34, 52, 62, 10); g.fill(); g.strokeStyle = P.white; g.lineWidth = 9; g.beginPath(); g.arc(28, -4, 14, -1.4, 1.4); g.stroke(); g.fillStyle = P.cyan; g.fillRect(-26, -10, 52, 12); g.restore(); }
  g.restore();
}
function couch(x, y, s) {
  g.save(); g.translate(x, y); g.scale(s, s);
  g.fillStyle = P.couchD; g.beginPath(); g.roundRect(-260, -230, 500, 260, 50); g.fill();
  g.fillStyle = P.couch; g.beginPath(); g.roundRect(-250, -20, 480, 110, 40); g.fill();
  g.fillStyle = P.couch; g.beginPath(); g.roundRect(-300, -100, 90, 200, 40); g.fill(); g.beginPath(); g.roundRect(200, -100, 90, 200, 40); g.fill();
  g.fillStyle = '#7a2a48'; g.fillRect(-230, 90, 30, 50); g.fillRect(190, 90, 30, 50);
  g.restore();
}
function deckchair(x, y, s, col = P.red) {
  g.save(); g.translate(x, y); g.scale(s, s);
  g.strokeStyle = '#c78a4a'; g.lineWidth = 16; g.lineCap = 'round';
  g.beginPath(); g.moveTo(-150, 160); g.lineTo(120, -40); g.moveTo(150, 160); g.lineTo(-90, -10); g.moveTo(-180, -170); g.lineTo(140, 160); g.stroke();
  g.save(); g.beginPath(); g.moveTo(-190, -190); g.lineTo(-120, -210); g.quadraticCurveTo(40, 10, 150, 60); g.lineTo(110, 110); g.quadraticCurveTo(-20, 40, -190, -190); g.clip();
  for (let i = -6; i < 8; i++) { g.fillStyle = i % 2 ? col : P.white; g.beginPath(); g.moveTo(-300 + i * 50, -300); g.lineTo(-260 + i * 50, -300); g.lineTo(-60 + i * 50, 200); g.lineTo(-100 + i * 50, 200); g.fill(); }
  g.restore(); g.restore();
}
function cube(x, y, s, t, a = 1) {
  if (a <= 0) return; g.save(); g.globalAlpha *= a; g.translate(x, y);
  glow(0, 0, s * 1.6, '255,220,120', .55);
  const d = s * .5;
  g.fillStyle = '#ffe58a'; g.beginPath(); g.moveTo(-s / 2, -s / 2); g.lineTo(-s / 2 + d * .7, -s / 2 - d * .5); g.lineTo(s / 2 + d * .7, -s / 2 - d * .5); g.lineTo(s / 2, -s / 2); g.fill();
  g.fillStyle = '#ffb347'; g.beginPath(); g.moveTo(s / 2, -s / 2); g.lineTo(s / 2 + d * .7, -s / 2 - d * .5); g.lineTo(s / 2 + d * .7, s / 2 - d * .5); g.lineTo(s / 2, s / 2); g.fill();
  g.fillStyle = '#ffd25e'; g.fillRect(-s / 2, -s / 2, s, s);
  g.fillStyle = 'rgba(255,255,255,.35)'; g.fillRect(-s / 2 + s * .1, -s / 2 + s * .1, s * .25, s * .08);
  g.restore();
}
function compost(x, y, s, t) {
  g.save(); g.translate(x, y); g.scale(s, s);
  g.fillStyle = P.brownD; g.beginPath(); g.ellipse(0, 0, 210, 120, 0, Math.PI, TAU); g.fill();
  g.fillStyle = P.brown; g.beginPath(); g.ellipse(-20, -6, 180, 100, 0, Math.PI, TAU); g.fill();
  g.fillStyle = P.leaf; for (const [lx, ly, r] of [[-90, -50, 26], [40, -80, 22], [110, -30, 18], [-20, -20, 16]]) { g.beginPath(); g.ellipse(lx, ly, r * 1.5, r * .7, .6, 0, TAU); g.fill(); }
  g.fillStyle = '#ffd84a'; g.beginPath(); g.ellipse(-30, -95, 46, 14, -.3, 0, TAU); g.fill();               // banana peel
  g.fillStyle = '#ff8a3c'; g.beginPath(); g.arc(80, -70, 14, 0, TAU); g.fill();
  g.strokeStyle = 'rgba(255,255,255,.55)'; g.lineWidth = 8; g.lineCap = 'round';
  for (let i = 0; i < 3; i++) { const ph = t * 1.3 + i * 2.1, sx = -60 + i * 60; g.globalAlpha = .6 + .4 * Math.sin(ph); g.beginPath(); g.moveTo(sx, -120); g.quadraticCurveTo(sx - 20 + Math.sin(ph) * 14, -170, sx, -220); g.quadraticCurveTo(sx + 20, -260, sx, -300); g.stroke(); }
  g.restore();
}
function meter(x, y, val, label, col, a = 1) {
  if (a <= 0) return; card(x, y, 300, 130, a); text(val, x, y + 10, 62, col, 1000, null, 0, 'center', a); text(label, x, y + 50, 30, P.white, 800, null, 0, 'center', a);
}
function photon(x, y, r, t, o = {}) {
  glow(x, y, r * 3, '255,240,150', .55);
  g.save(); g.translate(x, y); g.rotate(Math.sin(t * 6) * .1);
  sparkle(0, 0, r * 1.6, '#fff4b0'); g.fillStyle = '#ffe46a'; g.beginPath(); g.arc(0, 0, r * .8, 0, TAU); g.fill();
  face(r * .8, o.mood || 'happy', t, o.look || 0, 3.3);
  if (o.watch) { g.fillStyle = P.navy; g.beginPath(); g.arc(-r * 1.0, r * .5, r * .32, 0, TAU); g.fill(); g.fillStyle = P.white; g.beginPath(); g.arc(-r * 1.0, r * .5, r * .22, 0, TAU); g.fill(); }
  g.restore();
}
function proton(x, y, r, t, o = {}) {
  g.save(); g.translate(x, y); g.globalAlpha *= o.alpha ?? 1;
  glow(0, 0, r * 1.8, '255,90,110', .3);
  g.fillStyle = P.proton; g.beginPath(); g.arc(0, 0, r, 0, TAU); g.fill();
  g.fillStyle = 'rgba(120,10,40,.25)'; g.beginPath(); g.arc(r * .35, r * .1, r * 1.1, 0, TAU); g.arc(-r * .15, -r * .08, r * 1.02, 0, TAU, true); g.fill('evenodd');
  face(r, o.mood || 'annoyed', t, o.look || 0, o.seed || 0);
  text('+', 0, -r * .5, r * .55, P.white, 1000, null, 0);
  if (o.arms) { g.strokeStyle = P.protonD; g.lineWidth = r * .14; g.lineCap = 'round'; g.beginPath(); g.moveTo(-r * .8, r * .55); g.lineTo(r * .4, r * .75); g.moveTo(r * .8, r * .55); g.lineTo(-r * .4, r * .75); g.stroke(); }
  g.restore();
}
function dino(x, y, s, t) {
  g.save(); g.translate(x, y + Math.sin(t * 3) * 6); g.scale(s, s);
  g.fillStyle = '#ff9a5c'; g.beginPath(); g.ellipse(0, 0, 200, 110, 0, 0, TAU); g.fill();
  g.beginPath(); g.moveTo(120, -40); g.quadraticCurveTo(220, -250, 260, -430); g.lineTo(320, -420); g.quadraticCurveTo(250, -200, 180, 20); g.fill();
  g.beginPath(); g.ellipse(300, -440, 70, 46, -.2, 0, TAU); g.fill();
  g.beginPath(); g.moveTo(-180, -20); g.quadraticCurveTo(-320, 20, -380, 90); g.quadraticCurveTo(-300, 40, -170, 50); g.fill();
  for (const lx of [-120, -40, 60, 140]) g.fillRect(lx - 24, 60, 48, 110);
  g.fillStyle = '#e57a3e'; for (const [sx, sy] of [[-60, -40], [10, -70], [80, -40], [-20, 20]]) { g.beginPath(); g.arc(sx, sy, 22, 0, TAU); g.fill(); }
  g.save(); g.translate(318, -450); g.fillStyle = P.navy; g.beginPath(); g.ellipse(0, 0, 9, 13, 0, 0, TAU); g.fill(); g.fillStyle = P.white; g.beginPath(); g.arc(-3, -4, 4, 0, TAU); g.fill(); g.restore();
  g.strokeStyle = P.navy; g.lineWidth = 6; g.lineCap = 'round'; g.beginPath(); g.arc(330, -430, 20, .2, 1.2); g.stroke();
  g.restore();
}
function fish(x, y, s, t, o = {}) {
  g.save(); g.translate(x, y); g.scale(s * (o.flip ? -1 : 1), s);
  g.fillStyle = '#ff8a3c'; g.beginPath(); g.ellipse(0, 0, 90, 55, 0, 0, TAU); g.fill();
  g.beginPath(); g.moveTo(-70, 0); g.lineTo(-140, -50); g.lineTo(-130, 0); g.lineTo(-140, 50); g.fill();
  g.fillStyle = '#ffb36a'; g.beginPath(); g.ellipse(10, 20, 50, 20, 0, 0, TAU); g.fill();
  g.save(); g.translate(45, -10); face(40, o.mood || 'sleepy', t, .5, 4); g.restore();
  if (o.shrug) { g.strokeStyle = '#ff8a3c'; g.lineWidth = 12; g.lineCap = 'round'; for (const sd of [-1, 1]) { g.beginPath(); g.moveTo(10 + sd * 40, 40); g.lineTo(10 + sd * 80, 20 - 30 * o.shrug); g.stroke(); } }
  g.restore();
}

// ───────── scenes
const SC = [];
// 0 · "the most powerful thing in our sky" → hard cut: lounging in a deck chair
SC[0] = (t) => {
  if (t < T.cut) {
    const gr = g.createLinearGradient(0, 0, 0, H); gr.addColorStop(0, '#2a0b3d'); gr.addColorStop(1, '#ff7a3c'); g.fillStyle = gr; g.fillRect(0, 0, W, H);
    for (const s of STARS) { if (s.y > 800) continue; g.globalAlpha = .45 * s.r; g.fillStyle = P.spark; g.beginPath(); g.arc(s.x, s.y, 1.5 + s.r * 2, 0, TAU); g.fill(); } g.globalAlpha = 1;
    const r = lerp(250, 330, ss(seg(t, 0, T.cut)));
    glow(CX, 780, r * 3.2, '255,210,120', .5);
    for (let i = 0; i < 16; i++) { const a = i / 16 * TAU + t * .08, l = r * (1.6 + .4 * Math.sin(i * 1.7 + t * 2)); g.save(); g.strokeStyle = 'rgba(255,240,190,.28)'; g.lineWidth = 14; g.lineCap = 'round'; g.beginPath(); g.moveTo(CX + Math.cos(a) * r * 1.25, 780 + Math.sin(a) * r * 1.25); g.lineTo(CX + Math.cos(a) * l, 780 + Math.sin(a) * l); g.stroke(); g.restore(); }
    sunBody(CX, 780, r, t);
    for (const [x, y, rr] of [[CX + 260, 560, 40], [CX - 300, 1040, 28], [CX + 330, 1150, 22]]) sparkle(x, y, rr * (.8 + .2 * Math.sin(t * 3 + x)), '#fff6d8', .9);
    // a far horizon
    g.fillStyle = '#3a1630'; g.beginPath(); g.moveTo(0, 1420); for (let x = 0; x <= W; x += 40) g.lineTo(x, 1420 + Math.sin(x / 130) * 26); g.lineTo(W, H); g.lineTo(0, H); g.fill();
    return;
  }
  bg(t);
  const lz = ss(seg(t, T.lazy - .1, T.lazy + .4));
  deckchair(CX + 30, 1110, 1.5);
  sunChar(CX - 10, 830, 230, t, { mood: lz > .5 ? 'sleepy' : 'happy', shades: lerp(0, 1, lz), mug: 1, tilt: -.12, look: .3, lookY: lz * .4 });
  { g.save(); g.translate(CX, 330); text('The Sun Is', 0, -30, 92); text('BAD AT ITS JOB', 0, 100, 112, P.gold, 1000, P.navy, 18); g.restore(); }
};
// 1 · one cubic metre of core → a compost heap
SC[1] = (t) => {
  bg(t);
  const mv = ss(seg(t, T.puts - .3, T.puts + .6));                                // the Sun slides up and away
  const sy = lerp(800, -500, mv), sr = 330;
  if (mv < 1) {
    sunBody(CX, sy, sr, t);
    // the cut-away wedge: layers down to the core
    g.save(); g.translate(CX, sy); g.beginPath(); g.moveTo(0, 0); g.arc(0, 0, sr * 1.01, -.15, 1.25); g.closePath(); g.fillStyle = '#ff7a2e'; g.fill();
    g.beginPath(); g.moveTo(0, 0); g.arc(0, 0, sr * .62, -.15, 1.25); g.closePath(); g.fillStyle = '#ffb33a'; g.fill();
    g.beginPath(); g.arc(0, 0, sr * .28, 0, TAU); g.fillStyle = P.core; g.fill(); g.restore();
    g.save(); g.translate(CX, sy); g.rotate(-.05); face(sr, 'sleepy', t, -.6, 0, .2); g.restore();
    text('core', CX + 210, sy + 120, 42, P.white, 900, P.navy, 10, 'center', fade(t, T.take - .2, T.puts, .3));
  }
  // the cube: lifted out of the core like a slice of cake
  const lift = ss(seg(t, T.take - .1, T.take + .9));
  const cyA = lerp(sy + 30, 330, lift), csA = lerp(60, 170, lift);
  cube(lerp(CX + 40, CX - 200, mv), lerp(cyA, 1080, mv), lerp(csA, 200, mv), t, ss(seg(t, T.take - .2, T.take + .1)));
  // thermometer bursts
  const th = fade(t, T.core - .3, T.puts + .1, .2);
  if (th > 0) { const tx = CX + 250, ty = 430, fill = ss(seg(t, T.core - .2, T.core + .5)); g.save(); g.globalAlpha = th; g.fillStyle = P.white; g.beginPath(); g.roundRect(tx - 22, ty - 170, 44, 230, 22); g.fill(); g.beginPath(); g.arc(tx, ty + 70, 42, 0, TAU); g.fill(); g.fillStyle = P.red; g.beginPath(); g.arc(tx, ty + 70, 30, 0, TAU); g.fill(); g.fillRect(tx - 10, ty + 60 - 220 * fill, 20, 220 * fill); g.restore(); if (fill >= 1) { for (let i = 0; i < 5; i++) { const a = -Math.PI / 2 + (i - 2) * .45, d = 40 + 70 * seg(t, T.core + .5, T.core + .9); g.save(); g.globalAlpha = th * (1 - seg(t, T.core + .6, T.core + 1.1)); g.fillStyle = P.red; g.beginPath(); g.arc(tx + Math.cos(a) * d, ty - 170 + Math.sin(a) * d, 10, 0, TAU); g.fill(); g.restore(); } sparkle(tx, ty - 180, 34, P.gold, th); } }
  // the compost heap next to it
  const kc = pop(t, T.compost - .25, .5);
  if (kc > 0) { g.save(); g.translate(CX + 230, 1170); g.scale(kc, kc); compost(0, 0, 1.1, t); g.restore(); }
  meter(CX - 200, 760, '~280 W', 'per cubic metre', P.gold, ss(seg(t, T.puts + .4, T.puts + .8)));
  meter(CX + 230, 760, '~280 W', 'compost heap', P.gold, ss(seg(t, T.heap - .1, T.heap + .3)));
  // a fly lands on the cube
  const fl = seg(t, T.heap + .3, T.heap + 1.4);
  if (fl > 0) { const fx = lerp(CX + 420, CX - 190, ss(fl)) + Math.sin(t * 25) * 10 * (1 - fl), fy = lerp(900, 960, ss(fl)) + Math.cos(t * 31) * 12 * (1 - fl); g.fillStyle = 'rgba(220,240,255,.75)'; g.beginPath(); g.ellipse(fx - 8, fy - 14, 12, 7, -.5 + Math.sin(t * 60) * .4, 0, TAU); g.ellipse(fx + 8, fy - 14, 12, 7, .5 - Math.sin(t * 60) * .4, 0, TAU); g.fill(); g.fillStyle = P.navy; g.beginPath(); g.ellipse(fx, fy, 14, 10, 0, 0, TAU); g.fill(); }
};
// 2 · your body beats it; employee of the month
SC[2] = (t) => {
  bg(t, '#130a33', '#2a1450');
  const heat = ss(seg(t, T.body - .2, T.body + .6));
  couch(CX - 20, 1260, 1.05);
  person(CX - 40, 1230, 1.0, t, { phone: 1, heat, mood: t > T.congrats ? 'happy' : 'sleepy', look: .8, lookY: .7 });
  // the bar chart (line 5)
  const ca = fade(t, S[2] + .1, T.congrats + .2, .3);
  if (ca > 0) {
    card(CX, 470, 760, 520, ca);
    const base = 650, grow = ss(seg(t, T.several - .3, T.several + .6));
    const hs = 60, hy = lerp(60, 330, grow);
    g.save(); g.globalAlpha = ca; g.fillStyle = P.sunD; g.beginPath(); g.roundRect(CX - 230, base - hs, 160, hs, 14); g.fill(); g.fillStyle = '#ff8a5c'; g.beginPath(); g.roundRect(CX + 70, base - hy, 160, hy, 14); g.fill(); g.restore();
    text('Sun core', CX - 150, base + 50, 38, P.white, 900, null, 0, 'center', ca); text('You', CX + 150, base + 50, 38, P.white, 900, null, 0, 'center', ca);
    text('~280', CX - 150, base - hs - 20, 44, P.gold, 1000, null, 0, 'center', ca); text(grow > .5 ? '~1,300' : '?', CX + 150, base - hy - 20, 44, P.gold, 1000, null, 0, 'center', ca);
    text('watts per cubic metre', CX, 270, 36, '#cfc4ff', 800, null, 0, 'center', ca);
  }
  // employee of the month (line 6)
  const ka = pop(t, T.congrats - .1, .5);
  if (ka > 0) {
    g.save(); g.translate(CX - 30, 1020); g.scale(ka, ka);
    g.strokeStyle = P.gold; g.lineWidth = 22; g.beginPath(); g.roundRect(-330, -330, 660, 610, 30); g.stroke();
    g.fillStyle = P.gold; g.beginPath(); g.roundRect(-300, -420, 600, 110, 24); g.fill();
    text('★ EMPLOYEE OF THE MONTH ★', 0, -350, 40, P.navy, 1000, null, 0);
    g.restore();
    if (t < T.congrats + 1.4) for (let i = 0; i < 14; i++) { const R = mulberry(i + 3), u = seg(t, T.congrats, T.congrats + 1.4), a = R() * TAU, d = 200 + R() * 400; sparkle(CX - 30 + Math.cos(a) * d * eo(u), 900 + Math.sin(a) * d * eo(u) + 200 * u * u, 16 + R() * 12, [P.gold, P.cyan, P.red, P.spark][i % 4], 1 - u); }
  }
  // the Sun peeks in from the right, offended, and sips
  const pk = ss(seg(t, T.outperf - .4, T.outperf + .3));
  if (pk > 0) { const sip = ss(seg(t, T.cv - .3, T.cv + .3)) * (1 - ss(seg(t, T.cv + 1.0, T.cv + 1.5))); sunChar(lerp(1300, 940, pk), 420, 190, t, { mood: t > T.please - .2 ? 'sleepy' : 'annoyed', mug: 1, sip, look: -1, tilt: .15, glow: .6 }); }
};
// 3 · how? It's just very, very big (zoom out of a grid of cubes into the whole Sun; Earth for scale)
SC[3] = (t) => {
  bg(t, '#0a0626', '#1d1152');
  const RW = 3400, z = Math.exp(lerp(Math.log(1.0), Math.log(330 / RW), eio(seg(t, T.just - .4, T.big + .1)))), cy = 820;
  const ph = seg(t, S[3], T.just - .2);
  // first: the compost heap plugged into the solar system
  if (t < T.just) {
    const a = 1 - ss(seg(t, T.just - .6, T.just - .1));
    g.save(); g.globalAlpha = a;
    compost(CX - 180, 1150, .9, t);
    g.strokeStyle = '#2b2b4a'; g.lineWidth = 12; g.lineCap = 'round'; g.beginPath(); g.moveTo(CX - 60, 1110); g.bezierCurveTo(CX + 80, 1250, CX + 200, 900, CX + 230, 700); g.stroke();
    const flick = (Math.sin(t * 23) > .3 || t < T.light) ? 0 : 1;
    earth(CX + 240, 600, 110, t, flick ? 'worried' : 'happy', { look: -.6 });
    g.fillStyle = flick ? '#5a5a7a' : '#fff1a8'; g.beginPath(); g.arc(CX + 360, 480, 40, 0, TAU); g.fill(); if (!flick) glow(CX + 360, 480, 120, '255,240,150', .6);
    text('?', CX - 180, 900, 140, P.gold, 1000, P.navy, 16, 'center', ss(seg(t, T.light, T.light + .3)));
    g.restore();
  }
  if (t > T.just - .6) {
    const a = ss(seg(t, T.just - .6, T.just - .1));
    g.save(); g.globalAlpha = a; g.translate(CX, cy); g.scale(z, z);
    glow(0, 0, RW * 2.2, '255,200,80', .45);
    g.save(); g.beginPath(); g.arc(0, 0, RW, 0, TAU); g.clip(); g.fillStyle = P.sun; g.fillRect(-RW, -RW, RW * 2, RW * 2);
    const st = 200, view = H / 2 / z + st;
    for (let x = -RW; x < RW; x += st) for (let y = -RW; y < RW; y += st) { if (Math.abs(x) > view || Math.abs(y) > view) continue; const d = Math.hypot(x, y) / RW; g.fillStyle = d < .3 ? '#fff1a8' : d < .6 ? '#ffd25e' : '#ffb347'; g.fillRect(x + 8, y + 8, st - 16, st - 16); }
    g.fillStyle = 'rgba(255,140,40,.35)'; g.beginPath(); g.arc(RW * .3, RW * .15, RW * 1.05, 0, TAU); g.arc(-RW * .12, -RW * .06, RW, 0, TAU, true); g.fill('evenodd');
    g.restore();
    g.restore();
    // the face appears once the whole Sun is in view
    const fa = ss(seg(t, T.big - .2, T.big + .2)); if (fa > 0) { g.save(); g.globalAlpha = fa; g.translate(CX, cy); face(RW * z, 'smug', t, .5); g.restore(); }
    // Earth, for scale (109× smaller across)
    const ea = ss(seg(t, T.big - .2, T.big + .2)), ex = CX + 300, ey = cy + 360, er = Math.max(5, RW * z / 109);
    if (ea > 0) { g.save(); g.globalAlpha = ea; g.fillStyle = P.ocean; g.beginPath(); g.arc(ex, ey, er, 0, TAU); g.fill(); g.restore(); arrow(ex + 30, ey + 150, ex + 4, ey + 16, P.white, 8, ea); text('Earth', ex + 40, ey + 210, 44, P.white, 900, P.navy, 10, 'center', ea); text('(for scale)', ex + 40, ey + 254, 32, '#cfc4ff', 800, null, 0, 'center', ea); }
  }
};
// 4 · the photon: thousands of years inside, eight minutes outside
const RWALK = (() => { const R = mulberry(17), pts = []; let a = 0; for (let k = 0; k <= 70; k++) { a += (R() - .5) * 2.6; pts.push([Math.cos(a), Math.sin(a), R()]); } return pts; })();
SC[4] = (t) => {
  bg(t, '#0a0626', '#1d1152');
  const sx = CX, sy = 1150, sr = 700;
  // the Sun's interior seen as a big cut-away dome
  glow(sx, sy, sr * 1.6, '255,190,80', .45);
  g.fillStyle = '#ff9a2e'; g.beginPath(); g.arc(sx, sy, sr, 0, TAU); g.fill();
  g.fillStyle = '#d9542a'; g.beginPath(); g.arc(sx, sy, sr * .93, 0, TAU); g.fill();
  g.fillStyle = '#b8402a'; g.beginPath(); g.arc(sx, sy, sr * .6, 0, TAU); g.fill();
  g.fillStyle = '#9a3328'; g.beginPath(); g.arc(sx, sy, sr * .28, 0, TAU); g.fill();
  const R = mulberry(4); for (let i = 0; i < 46; i++) { const a = Math.PI + R() * Math.PI, d = 120 + R() * (sr - 160); g.fillStyle = 'rgba(255,190,140,.35)'; g.beginPath(); g.arc(sx + Math.cos(a) * d, sy + Math.sin(a) * d, 10 + R() * 8, 0, TAU); g.fill(); }
  // Earth up in the corner
  earth(880, 300, 85, t, t > T.minutes ? 'happy' : 'sleepy', { look: -1, lookY: .6 });
  // the walk: tight zigzag inside, drifting outward until "crossed"
  const t0 = T.face - .2, t1 = T.crossed - .1, u = seg(t, t0, t1), N = RWALK.length - 1, kf = u * N, k = Math.floor(Math.min(kf, N - 1)), fr = kf - k;
  const posAt = j => { const p = RWALK[j], rad = 40 + (sr - 60) * Math.pow(j / N, 1.1) * (.85 + .15 * p[2]); const ang = -Math.PI / 2 + Math.atan2(p[1], p[0]) * .55; return [sx + Math.cos(ang) * rad, sy + Math.sin(ang) * rad]; };
  let px, py;
  if (t < t1) {
    const A = posAt(k), B = posAt(k + 1); px = lerp(A[0], B[0], ss(fr)); py = lerp(A[1], B[1], ss(fr));
    g.save(); g.strokeStyle = 'rgba(255,250,210,.8)'; g.lineWidth = 6; g.setLineDash([10, 10]); g.beginPath(); for (let j = Math.max(0, k - 8); j <= k; j++) { const q = posAt(j); j === Math.max(0, k - 8) ? g.moveTo(q[0], q[1]) : g.lineTo(q[0], q[1]); } g.lineTo(px, py); g.stroke(); g.restore();
  } else { const E = posAt(N); px = E[0]; py = E[1]; }
  // out of the surface: checks the watch, then zips to Earth
  const zip = ss(seg(t, T.minutes - .5, T.minutes + .1)), surf = [sx + (px - sx) * 1.0, sy - sr - 40];
  if (t >= t1) { const out = ss(seg(t, t1, t1 + .4)); px = lerp(px, surf[0], out); py = lerp(py, surf[1], out); px = lerp(px, 840, zip); py = lerp(py, 340, zip); }
  if (zip > 0 && zip < 1) { g.save(); g.strokeStyle = 'rgba(255,240,170,.8)'; g.lineWidth = 18; g.lineCap = 'round'; g.beginPath(); g.moveTo(surf[0], surf[1]); g.lineTo(px, py); g.stroke(); g.restore(); }
  const watching = t > t1 + .2 && t < T.minutes - .5;
  if (zip < 1) photon(px, py, 46, t, { mood: watching ? 'worried' : 'happy', watch: watching ? 1 : 0, look: watching ? -1 : 0 });
  else sparkle(860, 330, 40 * (1 - seg(t, T.minutes + .1, T.minutes + .8)), '#fff4b0');
  if (watching) bubble(px + 120, py - 120, 120, 90, '!', 1, P.red, -1);
  // the counter and the montage
  const yrs = Math.floor(lerp(0, 10000, ss(seg(t, t0, T.thousands + .5))));
  const ca = fade(t, t0, T.crossed + .3, .3);
  card(300, 300, 440, 170, ca); text(yrs.toLocaleString('en-US'), 300, 320, 78, P.gold, 1000, null, 0, 'center', ca); text('years inside', 300, 362, 32, P.white, 800, null, 0, 'center', ca);
  const ic = [['🏛', .25], ['🏰', .55], ['📱', .85]]; // drawn as simple shapes below (no emoji fonts)
  const mu = seg(t, t0, T.thousands + .5);
  if (ca > 0) for (let i = 0; i < 3; i++) { const a = ss(seg(mu, ic[i][1] - .1, ic[i][1])) * ca; if (a <= 0) continue; g.save(); g.globalAlpha = a; g.translate(140 + i * 160, 445); g.fillStyle = '#e8dcff';
    if (i === 0) { g.beginPath(); g.moveTo(-60, 40); g.lineTo(0, -50); g.lineTo(60, 40); g.fill(); }
    else if (i === 1) { g.fillRect(-50, -20, 100, 60); for (const bx of [-50, -10, 30]) g.fillRect(bx, -40, 20, 20); g.fillStyle = P.navy; g.fillRect(-12, 10, 24, 30); }
    else { g.beginPath(); g.roundRect(-26, -46, 52, 92, 10); g.fill(); g.fillStyle = '#7fe6ff'; g.fillRect(-20, -38, 40, 70); }
    g.restore(); }
  const k8 = pop(t, T.minutes - .1); if (k8 > 0) { g.save(); g.translate(700, 560); g.scale(k8, k8); card(0, 0, 320, 130); text('8 min', 0, 18, 72, P.gold, 1000, null, 0); g.restore(); }
};
// 5 · protons push each other away; quantum tunnelling through THE RULES
SC[5] = (t) => {
  bg(t, '#2a0b20', '#4a1430');
  const cy = 860;
  const bump = seg(t, T.push - .2, T.push + .3), apart = ss(seg(t, T.push + .1, T.push + .8));
  const wall = ss(seg(t, T.only - .3, T.only + .2)), tun = ss(seg(t, T.tunnel - .1, T.walking + .2));
  let ax = lerp(CX - 160, CX - 330, apart), bx = lerp(CX + 160, CX + 330, apart);
  const pre = ss(seg(t, S[4], T.push - .2)); ax = lerp(CX - 380, ax, pre); bx = lerp(CX + 380, bx, pre);
  if (t < T.push + .1) { ax = lerp(CX - 380, CX - 120, ss(seg(t, T.fusion, T.push))); bx = lerp(CX + 380, CX + 120, ss(seg(t, T.fusion, T.push))); }
  // A walks through the wall toward B
  ax = lerp(ax, bx - 230, tun);
  const inWall = tun > .3 && tun < .75;
  const fuse = ss(seg(t, T.anyway - .2, T.anyway + .3));
  const back = t > T.normal && t < T.only;
  if (wall > 0) { g.save(); g.globalAlpha = wall; const wy = cy - 260, wh = 520; for (let r = 0; r < 8; r++) for (let c = 0; c < 3; c++) { g.fillStyle = (r + c) % 2 ? P.brick : P.brickD; g.fillRect(CX - 75 + c * 50 + (r % 2) * 25 - 25, wy + r * 65, 48, 62); } g.fillStyle = P.white; g.beginPath(); g.roundRect(CX - 150, wy - 110, 300, 90, 20); g.fill(); text('THE RULES', CX, wy - 50, 44, P.navy, 1000, null, 0); g.restore(); }
  if (bump > 0 && bump < 1) { const k = Math.sin(bump * Math.PI); glow(CX, cy, 220 * k, '255,255,255', .6 * k); }
  if (apart > 0 && apart < 1 && t < T.only) { arrow(CX - 110, cy, CX - 260, cy, P.white, 12, 1 - apart); arrow(CX + 110, cy, CX + 260, cy, P.white, 12, 1 - apart); }
  if (fuse < 1) {
    proton(ax, cy, 110, t, { mood: inWall ? 'keen' : back ? 'annoyed' : tun > .9 ? 'happy' : 'annoyed', look: back ? -1 : 1, arms: back, alpha: inWall ? .5 : 1, seed: 0 });
    proton(bx, cy, 110, t, { mood: tun > .9 ? 'scared' : back ? 'annoyed' : 'annoyed', look: back ? 1 : -1, arms: back, seed: 1.7 });
  }
  if (fuse > 0) { glow((ax + bx) / 2, cy, 420 * fuse, '255,230,140', .8 * (1 - seg(t, T.anyway + .4, T.anyway + 1.4))); sparkle((ax + bx) / 2, cy, 120 * pop(t, T.anyway - .1, .5), P.gold); if (fuse >= 1) { proton((ax + bx) / 2 - 60, cy, 100, t, { mood: 'happy', seed: .3 }); g.fillStyle = '#9fb6ff'; g.beginPath(); g.arc((ax + bx) / 2 + 70, cy, 96, 0, TAU); g.fill(); g.save(); g.translate((ax + bx) / 2 + 70, cy); face(96, 'happy', t, -1, 2); g.restore(); } }
  const kq = pop(t, T.tunnel - .2); if (kq > 0 && t < T.anyway + 2) { g.save(); g.translate(CX, 360); g.scale(kq, kq); card(0, 0, 640, 140); text('quantum tunnelling', 0, 20, 58, P.gold, 1000, null, 0); g.restore(); }
  const kp = pop(t, T.push - .1); if (kp > 0 && t < T.only - .3) { g.save(); g.translate(CX, 360); g.scale(kp, kp); text('+  pushes  +', 0, 0, 72, P.white); g.restore(); }
};
// 6 · the waiting room: ~9 billion years for its turn
SC[6] = (t) => {
  const gr = g.createLinearGradient(0, 0, 0, H); gr.addColorStop(0, '#2b2556'); gr.addColorStop(1, '#3d3478'); g.fillStyle = gr; g.fillRect(0, 0, W, H);
  g.fillStyle = '#4a4290'; g.fillRect(0, 1180, W, 740);
  // NOW SERVING sign and a clock
  card(330, 420, 420, 170, 1, '#1b1840'); text('NOW SERVING', 330, 385, 34, '#cfc4ff', 900, null, 0); text('#3', 330, 470, 84, P.red, 1000, null, 0);
  const sp = t * (1 + 30 * ss(seg(t, T.billion - .3, T.billion + .3)));
  g.fillStyle = P.white; g.beginPath(); g.arc(820, 420, 110, 0, TAU); g.fill(); g.strokeStyle = P.navy; g.lineWidth = 10; g.lineCap = 'round'; g.beginPath(); g.moveTo(820, 420); g.lineTo(820 + Math.cos(sp * 4) * 80, 420 + Math.sin(sp * 4) * 80); g.moveTo(820, 420); g.lineTo(820 + Math.cos(sp / 3) * 55, 420 + Math.sin(sp / 3) * 55); g.stroke();
  // chairs and protons
  for (let i = 0; i < 3; i++) { const x = 230 + i * 310; g.fillStyle = '#6b5fc0'; g.beginPath(); g.roundRect(x - 120, 1060, 240, 50, 16); g.fill(); g.beginPath(); g.roundRect(x - 120, 880, 40, 200, 16); g.fill(); g.fillRect(x - 100, 1110, 20, 90); g.fillRect(x + 80, 1110, 20, 90); }
  proton(230, 990, 90, t, { mood: 'sleepy', seed: .4 }); proton(850, 990, 90, t, { mood: 'sleepy', seed: 2.2 });
  proton(540, 990, 100, t, { mood: 'sad', look: -.5, seed: 1.1 });
  // the ticket
  const kt = pop(t, T.average - .1); if (kt > 0) { g.save(); g.translate(540, 1180); g.rotate(-.06); g.scale(kt, kt); g.fillStyle = '#fff3c4'; g.beginPath(); g.roundRect(-230, -60, 460, 120, 16); g.fill(); text('#9,000,000,000', 0, 22, 62, P.navy, 1000, null, 0); g.restore(); }
  // a cobweb grows over the waiting proton
  const cw = ss(seg(t, T.billion, T.turn + .4)); if (cw > 0) { g.save(); g.globalAlpha = .8 * cw; g.strokeStyle = P.white; g.lineWidth = 3; const ox = 430, oy = 880, L = 200 * cw; for (let k = 0; k < 5; k++) { const a = k / 4 * Math.PI / 2; g.beginPath(); g.moveTo(ox, oy); g.lineTo(ox + Math.cos(a) * L, oy + Math.sin(a) * L); g.stroke(); } for (let r = 1; r <= 3; r++) { g.beginPath(); for (let k = 0; k < 5; k++) { const a = k / 4 * Math.PI / 2, q = L * r / 3.4; k ? g.lineTo(ox + Math.cos(a) * q, oy + Math.sin(a) * q) : g.moveTo(ox + Math.cos(a) * q, oy + Math.sin(a) * q); } g.stroke(); } g.restore(); }
  const kb = pop(t, T.billion - .1); if (kb > 0) { g.save(); g.translate(CX, 230); g.scale(kb, kb); text('~9 billion years', 0, 0, 84, P.gold); g.restore(); }
};
// 7 · the twist: a keen Sun burns out; Earth stays grey; a fish declines
SC[7] = (t) => {
  bg(t, '#0a0626', '#1d1152');
  const burn = seg(t, T.easy - .2, T.burned + .2), fizz = ss(seg(t, T.burned - .1, T.burned + .7));
  const r = lerp(220, 300, ss(burn)) * (1 - fizz * .75);
  if (fizz < 1) { sunChar(CX, 540, r, t, { mood: fizz > .3 ? 'sad' : 'keen', flare: ss(burn) * (1 - fizz), grey: fizz }); if (burn > 0 && fizz < .5) { g.save(); g.translate(CX, 540 - r * .62); g.fillStyle = P.red; g.fillRect(-r * .8, -r * .12, r * 1.6, r * .14); g.restore(); } }
  else { sunChar(CX, 540, r, t, { mood: 'sad', grey: 1 }); }
  if (fizz > .3) for (let i = 0; i < 4; i++) { const u = (t * .4 + i * .25) % 1; g.save(); g.globalAlpha = (1 - u) * .5 * fizz; g.fillStyle = '#8a86a8'; g.beginPath(); g.arc(CX - 40 + i * 30 + Math.sin(u * 6 + i) * 20, 540 - r - u * 260, 26 + u * 40, 0, TAU); g.fill(); g.restore(); }
  // fuel gauge
  const ga = fade(t, T.easy - .3, T.crawled, .3); if (ga > 0) { card(CX, 210, 520, 110, ga); g.save(); g.globalAlpha = ga; g.fillStyle = '#3a3366'; g.beginPath(); g.roundRect(CX - 220, 190, 400, 40, 20); g.fill(); const f = 1 - ss(burn); g.fillStyle = f > .3 ? '#5dff9a' : P.red; g.beginPath(); g.roundRect(CX - 220, 190, Math.max(1, 400 * f), 40, 20); g.fill(); g.restore(); text('FUEL', CX + 215, 222, 30, P.white, 1000, null, 0, 'left', ga); }
  earth(CX, 1120, 170, t, fizz > .4 ? 'sad' : 'worried', { grey: fizz * .9, look: 0, lookY: -.5 });
  // inset: a beach and a fish that changes its mind
  const ki = pop(t, T.crawled - .3, .5);
  if (ki > 0) { g.save(); g.translate(830, 1260); g.scale(ki, ki); g.beginPath(); g.arc(0, 0, 170, 0, TAU); g.fillStyle = '#5a5470'; g.fill(); g.save(); g.clip(); g.fillStyle = '#3a5a8a'; g.fillRect(-170, 20, 340, 160); g.fillStyle = '#8a8098'; g.beginPath(); g.moveTo(-170, 30); g.quadraticCurveTo(0, -10, 170, 60); g.lineTo(170, -170); g.lineTo(-170, -170); g.fill();
    const back = ss(seg(t, T.crawled + .6, T.crawled + 1.3)); fish(lerp(-10, -60, back), lerp(-10, 90, back), .7, t, { mood: 'sleepy', shrug: 1 - back }); g.restore();
    g.strokeStyle = P.white; g.lineWidth = 8; g.beginPath(); g.arc(0, 0, 170, 0, TAU); g.stroke(); g.restore(); }
  const kw = pop(t, T.twist - .1); if (kw > 0 && t < T.easy) { g.save(); g.translate(CX, 210); g.scale(kw, kw); text('the secret', 0, 0, 64, P.gold); g.restore(); }
};
// 8 · it took its time: oceans, dinosaurs, you
SC[8] = (t) => {
  bg(t);
  sunChar(250, 430, 150, t, { mood: 'sleepy', shades: -1, mug: 1, sip: ss(seg(t, T.instead + .1, T.instead + .6)) * (1 - ss(seg(t, T.time14 + .3, T.time14 + .8))), look: 1, tilt: -.08 });
  // the timeline ribbon
  const ra = ss(seg(t, S[8] + .2, S[8] + .7)), ry = 760;
  g.save(); g.globalAlpha = ra; g.fillStyle = 'rgba(255,255,255,.18)'; g.beginPath(); g.roundRect(80, ry - 10, 920, 20, 10); g.fill();
  const prog = ss(seg(t, S[8] + .2, T.you14 + .3)); g.fillStyle = P.gold; g.beginPath(); g.roundRect(80, ry - 10, 920 * prog, 20, 10); g.fill(); g.restore();
  text('4.6 billion years', 760, 690, 46, P.gold, 900, P.navy, 10, 'center', ra);
  const ko = pop(t, T.oceans - .1, .45); if (ko > 0) { g.save(); g.translate(230, 1080); g.scale(ko, ko); g.fillStyle = P.ocean; g.beginPath(); g.arc(0, 0, 130, 0, TAU); g.fill(); g.fillStyle = '#6fb4ff'; for (let i = 0; i < 3; i++) { g.beginPath(); g.moveTo(-100, -40 + i * 40); for (let x = -100; x <= 100; x += 20) g.lineTo(x, -40 + i * 40 + Math.sin(x / 15 + t * 3) * 8); g.lineWidth = 10; g.strokeStyle = '#a8d4ff'; g.stroke(); } g.restore(); text('oceans', 230, 1260, 44, P.white, 900, P.navy, 10, 'center', ko); arrow(230, 790, 230, 930, 'rgba(255,255,255,.6)', 8, ko); }
  const kd = pop(t, T.dinos - .1, .45); if (kd > 0) { g.save(); g.translate(560, 1200); g.scale(kd * .55, kd * .55); dino(-40, 0, 1, t); g.restore(); text('dinosaurs', 560, 1350, 44, P.white, 900, P.navy, 10, 'center', kd); arrow(560, 790, 560, 900, 'rgba(255,255,255,.6)', 8, kd); }
  const ky = pop(t, T.you14 - .1, .45); if (ky > 0) { g.save(); g.translate(880, 1200); g.scale(ky * .55, ky * .55); person(0, 0, 1, t, { wave: ss(seg(t, T.you14, T.you14 + .4)), mood: 'happy', look: -.5, lookY: 0 }); g.restore(); text('you', 880, 1350, 44, P.gold, 900, P.navy, 10, 'center', ky); arrow(880, 790, 880, 920, 'rgba(255,255,255,.6)', 8, ky); }
};
// 9 · pacing yourself. Like a star.
SC[9] = (t) => {
  bg(t, '#120a3a', '#3a1a5a');
  const sunsetGlow = .5 + .5 * Math.sin(t * .5); glow(CX, 1500, 900, '255,140,90', .18 + .05 * sunsetGlow);
  deckchair(310, 1150, 1.15, P.red); deckchair(780, 1150, 1.15, P.cyan);
  const wink = t > T.star - .15;
  sunChar(300, 930, 170, t, { mood: wink ? 'wink' : 'sleepy', shades: wink ? -1 : lerp(0, -1, ss(seg(t, T.star - .5, T.star - .15))), mug: 1, tilt: -.12, look: .8 });
  person(770, 1150, .85, t, { mug: 1, mood: t > T.pacing ? 'smug' : 'sleepy', look: -.8, lookY: .2 });
  if (wink) { sparkle(420, 820, 46 * pop(t, T.star - .1, .4), P.spark); sparkle(470, 760, 24 * pop(t, T.star, .4), P.gold); }
  const kp = pop(t, T.pacing - .1); if (kp > 0) { g.save(); g.translate(CX, 390); g.scale(kp, kp); text('pacing itself', 0, 0, 96, P.gold); g.restore(); }
};

// 10 · probability made visible: 100 pairs try, one tunnels; then zoom out to the whole core
SC[10] = (t) => {
  bg(t, '#2a0b20', '#4a1430');
  const z = Math.exp(lerp(0, Math.log(.14), eio(seg(t, T.hundred - .2, T.second + .4)))), st = 92;
  g.save(); g.translate(CX - st / 2, 820 - st / 2); g.scale(z, z);
  const view = (H / 2) / z + st, n = Math.ceil(view / st);
  for (let i = -n; i <= n; i++) for (let j = -n; j <= n; j++) {
    const x = i * st, y = j * st, inGrid = Math.abs(i) <= 4.5 && Math.abs(j) <= 4.5;
    const hsh = ((i * 73856093) ^ (j * 19349663) ^ Math.floor(t * 7) * 83492791) >>> 0, lucky = (hsh % 997) < 6;
    const hero = i === 2 && j === -1, won = hero && t > T.pulls;
    if (!inGrid && t < T.hundred - .2) continue;                      // first just the 100 pairs
    if (z > .45) {                                      // close up: little proton pairs bouncing off each other
      const ph = Math.sin(t * 9 + i * 1.7 + j * 2.3), d = 14 + 8 * Math.max(0, ph);
      g.fillStyle = won ? P.gold : P.proton; g.beginPath(); g.arc(x - d, y, 11, 0, TAU); g.fill(); g.beginPath(); g.arc(x + d, y, 11, 0, TAU); g.fill();
      if (won) { glow(x, y, 120, '255,220,120', .8); sparkle(x, y, 60, P.gold); }
    } else { g.fillStyle = (lucky && t > T.hundred) ? P.gold : 'rgba(255,90,110,.55)'; g.fillRect(x - 18, y - 9, 36, 18); }
  }
  g.restore();
  const fa = 1 - ss(seg(t, T.hundred - .2, T.hundred + .3));
  text('99 bounce off…', CX, 300, 64, P.white, 1000, P.navy, 14, 'center', fa * ss(seg(t, S[6] + .2, S[6] + .5)));
  text('1 gets through', CX, 380, 64, P.gold, 1000, P.navy, 14, 'center', fa * ss(seg(t, T.pulls - .1, T.pulls + .2)));
  const kc = pop(t, T.hundred + .4, .5); if (kc > 0) { g.save(); g.translate(CX, 340); g.scale(kc, kc); card(0, 0, 820, 200); text('~10³⁸ fusions', 0, 10, 92, P.gold, 1000, null, 0); text('every single second', 0, 70, 40, P.white, 900, null, 0); g.restore(); }
};
const SCENE_FOR = [0, 1, 2, 3, 5, 6, 10, 7, 9];

// ───────── captions: word-pops, key words in gold (lower middle, above the Shorts UI)
const FIX = { meter: 'metre', 'meter.': 'metre.', weights: 'waits', 'tunneling.': 'tunnelling.', 'for,': 'for:' };
const KEY = new Set(['terrible', 'job', '15', 'million', 'degrees', 'compost', 'heap', 'star', 'outperforming', 'fusion', 'hard', 'positive', 'cheat', 'quantum', 'tunneling', 'wall', '9', 'billion', 'trillion', 'second', 'secret', 'burned', 'life', 'lazy', 'pacing']);
const CAP = [];
for (const [id, ws] of Object.entries(words)) {
  const toks = []; for (const w of ws) { const s = FIX[w[0].toLowerCase()] ?? w[0]; if (/^[,.]/.test(s) && toks.length) { const p = toks[toks.length - 1]; p.w += s; p.t1 = w[2]; } else toks.push({ w: s, k: w[0], t0: Math.max(0, w[1]), t1: w[2] }); }
  let line = [], n = 0; const flush = () => { if (line.length) CAP.push({ words: line.map(x => ({ ...x, t0: VO[id] + x.t0, t1: VO[id] + x.t1 })) }); line = []; n = 0; };
  for (const tk of toks) { line.push(tk); n += tk.w.length + 1; if (n > 18 || /[.?!,]$/.test(tk.w) && n > 9) flush(); }
  flush();
}
for (let i = 0; i < CAP.length; i++) { const c = CAP[i], e = c.words[c.words.length - 1].t1; c.t0 = c.words[0].t0 - .05; c.t1 = i + 1 < CAP.length ? Math.min(CAP[i + 1].words[0].t0 - .02, e + .7) : e + .8; }
function captions(t) {
  const c = CAP.find(c => t >= c.t0 && t < c.t1); if (!c) return;
  g.save(); g.font = '900 74px NU';
  const ws = c.words.map(w => ({ ...w, s: w.w.replace(/[,]$/, ''), wd: g.measureText(w.w.replace(/[,]$/, '') + ' ').width }));
  const rows = [[]]; let rw = 0; for (const w of ws) { if (rw + w.wd > 900 && rows[rows.length - 1].length) { rows.push([]); rw = 0; } rows[rows.length - 1].push(w); rw += w.wd; }
  rows.forEach((row, ri) => { const tot = row.reduce((p, w) => p + w.wd, 0); let x = CX - tot / 2; const y = 1500 + ri * 88;
    for (const w of row) { const k = clamp((t - w.t0) / .1); if (k > 0) { g.save(); g.globalAlpha = k; g.translate(x, y); const s = .85 + .15 * eo(k); g.scale(s, s); g.lineJoin = 'round'; g.lineWidth = 16; g.strokeStyle = P.navy; g.textAlign = 'left'; g.strokeText(w.s, 0, 0); g.fillStyle = KEY.has(nrm(w.k)) ? P.gold : P.white; g.fillText(w.s, 0, 0); g.restore(); } x += w.wd; } });
  g.restore();
}

// ───────── frame: scenes with a zoom-and-fade transition between them
function render(t) {
  g.setTransform(1, 0, 0, 1, 0, 0); g.globalAlpha = 1;
  const i = sceneAt(t), s0 = S[i], tr = .45;
  const draw = (k, tt, z, a) => { g.save(); g.globalAlpha = a; g.translate(CX, H / 2); g.scale(z, z); g.translate(-CX, -H / 2); SC[SCENE_FOR[k]](tt); g.restore(); };
  const u = clamp((t - s0) / tr);
  if (i > 0 && u < 1) { draw(i - 1, t, 1 + .12 * eio(u), 1); draw(i, t, .9 + .1 * eo(u), eo(u)); }
  else draw(i, t, 1 + (t - s0) * .004, 1);
  g.setTransform(1, 0, 0, 1, 0, 0); g.globalAlpha = 1;
  if (t >= T.cut && t < T.cut + .12) { g.fillStyle = `rgba(255,255,255,${.6 * (1 - (t - T.cut) / .12)})`; g.fillRect(0, 0, W, H); }   // the hard cut to the deck chair
  captions(t);
  const fi = 0, fo = seg(t, DUR - .6, DUR);   // no fade-in: the first frame must read as a still if (fi > 0 || fo > 0) { g.fillStyle = `rgba(0,0,0,${Math.max(fi, fo)})`; g.fillRect(0, 0, W, H); }
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
