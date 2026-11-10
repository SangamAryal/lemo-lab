// Drawing kit shared with the Beyond Everything films (lazy-sun, moon-breakup): palette, stars, glows, characters.
import { clamp, lerp, seg, ss, eio, eo, mulberry, TAU } from '/core/lib.js';
let g, W, H;
export function setup(ctx, w, h) { g = ctx; W = w; H = h; }
// ───────── palette and drawing kit (from the Moon film)
export const P = { bg0: '#0a0626', bg1: '#1d1152', star: '#b9a8ff', spark: '#ece6ff', navy: '#17163f', gold: '#ffc73a', red: '#ff4d6d', cyan: '#3fe0ff', white: '#ffffff',
  ocean: '#3d8be8', land: '#5fcf7a', moon: '#cfd4ea', moonD: '#a3a9c9', crater: '#b4b9d6', sun: '#ffcf4a', sunD: '#ff9a2e', core: '#fff3b0', skin: '#f2b48c', skinD: '#d9946b', hair: '#2b2140', hood: '#5b6cff', hoodD: '#4252d6', jeans: '#2d2f5e',
  couch: '#e2557b', couchD: '#b83d62', brown: '#7a4a2a', brownD: '#5a3418', leaf: '#5fcf7a', proton: '#ff5a6e', protonD: '#d63a52', brick: '#c9654a', brickD: '#a24a35' };
let STARS = [];
export function makeStars(n, seed = 5) { const R0 = mulberry(seed); STARS = Array.from({ length: n }, () => ({ x: R0() * W, y: R0() * H, k: R0(), r: R0(), tw: R0() * 6 })); }
export function bg(t, top = P.bg0, bot = P.bg1, a = 1) {
  g.save(); g.globalAlpha = a; const gr = g.createLinearGradient(0, 0, 0, H); gr.addColorStop(0, top); gr.addColorStop(1, bot); g.fillStyle = gr; g.fillRect(0, 0, W, H);
  for (const [x, y, r, c] of [[200, 520, 420, 'rgba(120,60,200,.16)'], [900, 1250, 520, 'rgba(70,40,180,.14)'], [420, 1700, 480, 'rgba(160,70,200,.10)']]) { const n = g.createRadialGradient(x, y, 0, x, y, r); n.addColorStop(0, c); n.addColorStop(1, 'rgba(0,0,0,0)'); g.fillStyle = n; g.fillRect(x - r, y - r, 2 * r, 2 * r); }
  for (const s of STARS) { const tw = .55 + .45 * Math.sin(t * 2 + s.tw); if (s.k < .13) sparkle(s.x, s.y, (10 + s.r * 14) * (.8 + .2 * tw), P.spark, .9 * a); else { g.globalAlpha = (.3 + .5 * s.r) * tw * a; g.fillStyle = P.star; g.beginPath(); g.arc(s.x, s.y, 1.4 + s.r * 2.6, 0, TAU); g.fill(); } }
  g.restore();
}
export function sparkle(x, y, r, col = P.spark, a = 1) { g.save(); g.globalAlpha *= a; g.fillStyle = col; g.beginPath(); g.moveTo(x, y - r); g.quadraticCurveTo(x + r * .14, y - r * .14, x + r, y); g.quadraticCurveTo(x + r * .14, y + r * .14, x, y + r); g.quadraticCurveTo(x - r * .14, y + r * .14, x - r, y); g.quadraticCurveTo(x - r * .14, y - r * .14, x, y - r); g.fill(); g.restore(); }
export function glow(x, y, r, rgb, a = .6) { const gr = g.createRadialGradient(x, y, 0, x, y, r); gr.addColorStop(0, `rgba(${rgb},${a})`); gr.addColorStop(1, `rgba(${rgb},0)`); g.fillStyle = gr; g.fillRect(x - r, y - r, 2 * r, 2 * r); }
export function text(s, x, y, px, col = P.white, wt = 900, outline = P.navy, ow = 14, align = 'center', a = 1) {
  if (a <= 0) return; g.save(); g.globalAlpha *= a; g.font = `${wt} ${px}px NU`; g.textAlign = align; g.textBaseline = 'alphabetic'; g.lineJoin = 'round';
  if (outline) { g.lineWidth = ow; g.strokeStyle = outline; g.strokeText(s, x, y); } g.fillStyle = col; g.fillText(s, x, y); g.restore();
}
export const pop = (t, t0, d = .35) => { const u = clamp((t - t0) / d); return u <= 0 ? 0 : 1 + Math.sin(u * Math.PI) * .18 * (1 - u) - (1 - eo(u)) * .9; };
export const fade = (t, a, b, d = .3) => ss(seg(t, a, a + d)) * (1 - ss(seg(t, b - d, b)));
export function arrow(x0, y0, x1, y1, col, w = 16, a = 1) {
  if (a <= 0) return; g.save(); g.globalAlpha *= a; g.strokeStyle = g.fillStyle = col; g.lineWidth = w; g.lineCap = 'round';
  const ang = Math.atan2(y1 - y0, x1 - x0), hl = w * 2.2; g.beginPath(); g.moveTo(x0, y0); g.lineTo(x1 - Math.cos(ang) * hl * .6, y1 - Math.sin(ang) * hl * .6); g.stroke();
  g.beginPath(); g.moveTo(x1, y1); g.lineTo(x1 - Math.cos(ang - .5) * hl, y1 - Math.sin(ang - .5) * hl); g.lineTo(x1 - Math.cos(ang + .5) * hl, y1 - Math.sin(ang + .5) * hl); g.closePath(); g.fill(); g.restore();
}
export function card(x, y, w, h, a = 1, fill = 'rgba(12,10,44,.72)') { if (a <= 0) return; g.save(); g.globalAlpha *= a; g.fillStyle = fill; g.beginPath(); g.roundRect(x - w / 2, y - h / 2, w, h, 24); g.fill(); g.strokeStyle = 'rgba(185,168,255,.4)'; g.lineWidth = 3; g.stroke(); g.restore(); }
export function bubble(x, y, w, h, s, a = 1, col = P.navy, tail = -1) { if (a <= 0) return; g.save(); g.globalAlpha *= a; g.fillStyle = P.white; g.beginPath(); g.roundRect(x - w / 2, y - h / 2, w, h, h / 2.4); g.fill(); g.beginPath(); g.moveTo(x + tail * w * .2, y + h / 2 - 4); g.lineTo(x + tail * w * .34, y + h / 2 + 40); g.lineTo(x + tail * w * .05, y + h / 2 - 4); g.fill(); g.restore(); text(s, x, y + h * .16, h * .42, col, 1000, null, 0, 'center', a); }

// ───────── characters
// mood: happy | sleepy | smug | wink | annoyed | worried | sad | keen | scared | love
export function face(r, mood, t, look = 0, blinkSeed = 0, lookY = 0) {
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
export function sunBody(x, y, r, t, o = {}) {
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
export function sunChar(x, y, r, t, o = {}) {
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
export function earth(x, y, r, t, mood = 'happy', o = {}) {
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
export function person(x, y, s, t, o = {}) {
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
export function couch(x, y, s) {
  g.save(); g.translate(x, y); g.scale(s, s);
  g.fillStyle = P.couchD; g.beginPath(); g.roundRect(-260, -230, 500, 260, 50); g.fill();
  g.fillStyle = P.couch; g.beginPath(); g.roundRect(-250, -20, 480, 110, 40); g.fill();
  g.fillStyle = P.couch; g.beginPath(); g.roundRect(-300, -100, 90, 200, 40); g.fill(); g.beginPath(); g.roundRect(200, -100, 90, 200, 40); g.fill();
  g.fillStyle = '#7a2a48'; g.fillRect(-230, 90, 30, 50); g.fillRect(190, 90, 30, 50);
  g.restore();
}
export function deckchair(x, y, s, col = P.red) {
  g.save(); g.translate(x, y); g.scale(s, s);
  g.strokeStyle = '#c78a4a'; g.lineWidth = 16; g.lineCap = 'round';
  g.beginPath(); g.moveTo(-150, 160); g.lineTo(120, -40); g.moveTo(150, 160); g.lineTo(-90, -10); g.moveTo(-180, -170); g.lineTo(140, 160); g.stroke();
  g.save(); g.beginPath(); g.moveTo(-190, -190); g.lineTo(-120, -210); g.quadraticCurveTo(40, 10, 150, 60); g.lineTo(110, 110); g.quadraticCurveTo(-20, 40, -190, -190); g.clip();
  for (let i = -6; i < 8; i++) { g.fillStyle = i % 2 ? col : P.white; g.beginPath(); g.moveTo(-300 + i * 50, -300); g.lineTo(-260 + i * 50, -300); g.lineTo(-60 + i * 50, 200); g.lineTo(-100 + i * 50, 200); g.fill(); }
  g.restore(); g.restore();
}
export function cube(x, y, s, t, a = 1) {
  if (a <= 0) return; g.save(); g.globalAlpha *= a; g.translate(x, y);
  glow(0, 0, s * 1.6, '255,220,120', .55);
  const d = s * .5;
  g.fillStyle = '#ffe58a'; g.beginPath(); g.moveTo(-s / 2, -s / 2); g.lineTo(-s / 2 + d * .7, -s / 2 - d * .5); g.lineTo(s / 2 + d * .7, -s / 2 - d * .5); g.lineTo(s / 2, -s / 2); g.fill();
  g.fillStyle = '#ffb347'; g.beginPath(); g.moveTo(s / 2, -s / 2); g.lineTo(s / 2 + d * .7, -s / 2 - d * .5); g.lineTo(s / 2 + d * .7, s / 2 - d * .5); g.lineTo(s / 2, s / 2); g.fill();
  g.fillStyle = '#ffd25e'; g.fillRect(-s / 2, -s / 2, s, s);
  g.fillStyle = 'rgba(255,255,255,.35)'; g.fillRect(-s / 2 + s * .1, -s / 2 + s * .1, s * .25, s * .08);
  g.restore();
}
export function compost(x, y, s, t) {
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
export function meter(x, y, val, label, col, a = 1) {
  if (a <= 0) return; card(x, y, 300, 130, a); text(val, x, y + 10, 62, col, 1000, null, 0, 'center', a); text(label, x, y + 50, 30, P.white, 800, null, 0, 'center', a);
}
export function photon(x, y, r, t, o = {}) {
  glow(x, y, r * 3, '255,240,150', .55);
  g.save(); g.translate(x, y); g.rotate(Math.sin(t * 6) * .1);
  sparkle(0, 0, r * 1.6, '#fff4b0'); g.fillStyle = '#ffe46a'; g.beginPath(); g.arc(0, 0, r * .8, 0, TAU); g.fill();
  face(r * .8, o.mood || 'happy', t, o.look || 0, 3.3);
  if (o.watch) { g.fillStyle = P.navy; g.beginPath(); g.arc(-r * 1.0, r * .5, r * .32, 0, TAU); g.fill(); g.fillStyle = P.white; g.beginPath(); g.arc(-r * 1.0, r * .5, r * .22, 0, TAU); g.fill(); }
  g.restore();
}
export function proton(x, y, r, t, o = {}) {
  g.save(); g.translate(x, y); g.globalAlpha *= o.alpha ?? 1;
  glow(0, 0, r * 1.8, '255,90,110', .3);
  g.fillStyle = P.proton; g.beginPath(); g.arc(0, 0, r, 0, TAU); g.fill();
  g.fillStyle = 'rgba(120,10,40,.25)'; g.beginPath(); g.arc(r * .35, r * .1, r * 1.1, 0, TAU); g.arc(-r * .15, -r * .08, r * 1.02, 0, TAU, true); g.fill('evenodd');
  face(r, o.mood || 'annoyed', t, o.look || 0, o.seed || 0);
  text('+', 0, -r * .5, r * .55, P.white, 1000, null, 0);
  if (o.arms) { g.strokeStyle = P.protonD; g.lineWidth = r * .14; g.lineCap = 'round'; g.beginPath(); g.moveTo(-r * .8, r * .55); g.lineTo(r * .4, r * .75); g.moveTo(r * .8, r * .55); g.lineTo(-r * .4, r * .75); g.stroke(); }
  g.restore();
}
export function dino(x, y, s, t) {
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
export function fish(x, y, s, t, o = {}) {
  g.save(); g.translate(x, y); g.scale(s * (o.flip ? -1 : 1), s);
  g.fillStyle = '#ff8a3c'; g.beginPath(); g.ellipse(0, 0, 90, 55, 0, 0, TAU); g.fill();
  g.beginPath(); g.moveTo(-70, 0); g.lineTo(-140, -50); g.lineTo(-130, 0); g.lineTo(-140, 50); g.fill();
  g.fillStyle = '#ffb36a'; g.beginPath(); g.ellipse(10, 20, 50, 20, 0, 0, TAU); g.fill();
  g.save(); g.translate(45, -10); face(40, o.mood || 'sleepy', t, .5, 4); g.restore();
  if (o.shrug) { g.strokeStyle = '#ff8a3c'; g.lineWidth = 12; g.lineCap = 'round'; for (const sd of [-1, 1]) { g.beginPath(); g.moveTo(10 + sd * 40, 40); g.lineTo(10 + sd * 80, 20 - 30 * o.shrug); g.stroke(); } }
  g.restore();
}

export function moon(x, y, r, t, mood = 'happy', o = {}) {
  g.save(); g.translate(x, y); g.rotate(o.tilt || 0);
  glow(0, 0, r * 1.5, '200,200,255', .22);
  g.beginPath(); g.arc(0, 0, r, 0, TAU); g.save(); g.clip();
  g.fillStyle = P.moon; g.fillRect(-r, -r, 2 * r, 2 * r);
  for (const [cx, cy, s] of [[-.45, -.45, .2], [.4, -.55, .13], [.55, .35, .18], [-.55, .4, .12], [.05, .65, .1], [-.1, -.75, .08]]) { g.fillStyle = P.crater; g.beginPath(); g.arc(cx * r, cy * r, s * r, 0, TAU); g.fill(); g.fillStyle = P.moonD; g.beginPath(); g.arc(cx * r + s * r * .2, cy * r + s * r * .2, s * r * .75, 0, TAU); g.fill(); }
  g.fillStyle = 'rgba(40,30,100,.3)'; g.beginPath(); g.arc(r * .35, r * .1, r * 1.1, 0, TAU); g.arc(-r * .15, -r * .08, r * 1.02, 0, TAU, true); g.fill('evenodd');
  g.restore();
  if (!o.noFace) face(r, mood, t, o.look || 0, 1.3);
  g.restore();
}
