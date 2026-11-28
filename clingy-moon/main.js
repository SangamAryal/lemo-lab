// "Mars Has a Clingy Moon" — the sequel to "The Moon Is Slowly Breaking Up With Us". Flat-vector explainer, vertical 1080×1920,
// canvas 2D, deterministic in t. Same kit as moon-breakup (characters with faces, cel shading, sparkle stars, word-pop captions).
import { clamp, lerp, seg, ss, eio, eo, mulberry, TAU } from '/core/lib.js';

const W = 1080, H = 1920, CX = W / 2;
const cv = document.getElementById('c'), g = cv.getContext('2d');
await document.fonts.load('900 80px NU'); await document.fonts.load('800 40px NU');
const words = await (await fetch('voices/words.json')).json();
const dur = await (await fetch('voices/dur.json')).json();
const lines = await (await fetch('lines.json')).json();

// ───────── timeline: each line starts after the previous one plus a small gap (longer before and after punchlines)
const GAP = { v10: .55, v11: .5, v12: .4, v13: .55 };
const VO = {}; { let t = .6; for (const L of lines) { t += GAP[L.id] || 0; VO[L.id] = +t.toFixed(3); t += dur[L.id] + .28; } }
const DUR = +(VO.v13 + dur.v13 + 2.2).toFixed(2);
const nrm = s => s.toLowerCase().replace(/[^a-z0-9]/g, '');
const at = (id, w, k = 0, e = 1) => { let n = 0; for (const x of words[id]) if (nrm(x[0]).startsWith(nrm(w)) && n++ === k) return VO[id] + Math.max(0, x[e]); throw new Error(`${w} in ${id}`); };
const IDS = lines.map(l => l.id);
const S = [0, ...IDS.slice(1).map(id => VO[id] - .25), DUR];   // scene starts, one scene per line
const T = {
  slowly: at('v01', 'slowly'), mars: at('v01', 'mars'), opposite: at('v01', 'opposite'),
  phobos: at('v02', 'phobos'), clingy: at('v02', 'clingy'), km: at('v02', '6'), ground1: at('v02', 'ground'), sixty: at('v02', '60'),
  laps: at('v03', 'laps'), three: at('v03', 'three'), fromGround: at('v03', 'from'), west: at('v03', 'west'), east: at('v03', 'east'),
  moving: at('v04', 'moving'), two: at('v04', 'two'), century: at('v04', 'century'),
  backwards: at('v05', 'backwards'), faster: at('v05', 'faster'), spins: at('v05', 'spins'), bulge: at('v05', 'bulge'), lags: at('v05', 'lags'), drags: at('v05', 'drags'),
  hug: at('v06', 'hug'), survive: at('v06', 'survive'),
  strain: at('v07', 'strain'), grooves: at('v07', 'grooves'), stretch: at('v07', 'stretch'), pulling: at('v07', 'pulling'),
  rover: at('v08', 'perseverance'), crossing: at('v08', 'crossing'), forty: at('v08', '40'),
  million: at('v09', '30'), tear: at('v09', 'tear'), ring: at('v09', 'ring'),
  finally: at('v10', 'finally'), ringOn: at('v10', 'ring'),
  deimos: at('v11', 'deimos'), drifting: at('v11', 'drifting'), ours: at('v11', 'ours'),
  names: at('v12', 'names'), pName: at('v12', 'phobos'), dName: at('v12', 'deimos'), fear: at('v12', 'fear'), dread: at('v12', 'dread'), redPlanet: at('v12', 'red'), flags: at('v12', 'flags'),
  rather: at('v13', 'rather'), leaves: at('v13', 'leaves'), never: at('v13', 'never'),
};
const sceneAt = t => { let i = 0; while (i < S.length - 2 && t >= S[i + 1]) i++; return i; };

// ───────── palette and drawing kit
const P = { bg0: '#0a0626', bg1: '#1d1152', star: '#b9a8ff', spark: '#ece6ff', navy: '#17163f', gold: '#ffc73a', red: '#ff4d6d', cyan: '#3fe0ff', white: '#ffffff',
  ocean: '#3d8be8', oceanD: '#2a63b8', land: '#5fcf7a', landD: '#3fa35e', moon: '#cfd4ea', moonD: '#a3a9c9', crater: '#b4b9d6', blush: '#ff9fb8', sun: '#ffcf4a', sunD: '#ff9a2e' };
const R0 = mulberry(5), STARS = Array.from({ length: 110 }, () => ({ x: R0() * W, y: R0() * H, k: R0(), r: R0(), tw: R0() * 6 }));
function bg(t, top = P.bg0, bot = P.bg1, a = 1) {
  g.save(); g.globalAlpha = a; const gr = g.createLinearGradient(0, 0, 0, H); gr.addColorStop(0, top); gr.addColorStop(1, bot); g.fillStyle = gr; g.fillRect(0, 0, W, H);
  for (const [x, y, r, c] of [[200, 520, 420, 'rgba(120,60,200,.16)'], [900, 1250, 520, 'rgba(70,40,180,.14)'], [420, 1700, 480, 'rgba(160,70,200,.10)']]) { const n = g.createRadialGradient(x, y, 0, x, y, r); n.addColorStop(0, c); n.addColorStop(1, 'rgba(0,0,0,0)'); g.fillStyle = n; g.fillRect(x - r, y - r, 2 * r, 2 * r); }
  for (const s of STARS) { const y = s.y, tw = .55 + .45 * Math.sin(t * 2 + s.tw); if (s.k < .13) sparkle(s.x, y, (10 + s.r * 14) * (.8 + .2 * tw), P.spark, .9 * a); else { g.globalAlpha = (.3 + .5 * s.r) * tw * a; g.fillStyle = P.star; g.beginPath(); g.arc(s.x, y, 1.4 + s.r * 2.6, 0, TAU); g.fill(); } }
  g.restore();
}
function sparkle(x, y, r, col = P.spark, a = 1) { g.save(); g.globalAlpha *= a; g.fillStyle = col; g.beginPath(); g.moveTo(x, y - r); g.quadraticCurveTo(x + r * .14, y - r * .14, x + r, y); g.quadraticCurveTo(x + r * .14, y + r * .14, x, y + r); g.quadraticCurveTo(x - r * .14, y + r * .14, x - r, y); g.quadraticCurveTo(x - r * .14, y - r * .14, x, y - r); g.fill(); g.restore(); }
function glow(x, y, r, rgb, a = .6) { const gr = g.createRadialGradient(x, y, 0, x, y, r); gr.addColorStop(0, `rgba(${rgb},${a})`); gr.addColorStop(1, `rgba(${rgb},0)`); g.fillStyle = gr; g.fillRect(x - r, y - r, 2 * r, 2 * r); }
function text(s, x, y, px, col = P.white, wt = 900, outline = P.navy, ow = 14, align = 'center', a = 1) {
  if (a <= 0) return; g.save(); g.globalAlpha *= a; g.font = `${wt} ${px}px NU`; g.textAlign = align; g.textBaseline = 'alphabetic'; g.lineJoin = 'round';
  if (outline) { g.lineWidth = ow; g.strokeStyle = outline; g.strokeText(s, x, y); } g.fillStyle = col; g.fillText(s, x, y); g.restore();
}
const pop = (t, t0, d = .35) => { const u = clamp((t - t0) / d); return u <= 0 ? 0 : 1 + Math.sin(u * Math.PI) * .18 * (1 - u) - (1 - eo(u)) * .9; };   // scale-in with a little overshoot
function arrow(x0, y0, x1, y1, col, w = 16, a = 1) {
  if (a <= 0) return; g.save(); g.globalAlpha *= a; g.strokeStyle = g.fillStyle = col; g.lineWidth = w; g.lineCap = 'round';
  const ang = Math.atan2(y1 - y0, x1 - x0), hl = w * 2.2; g.beginPath(); g.moveTo(x0, y0); g.lineTo(x1 - Math.cos(ang) * hl * .6, y1 - Math.sin(ang) * hl * .6); g.stroke();
  g.beginPath(); g.moveTo(x1, y1); g.lineTo(x1 - Math.cos(ang - .5) * hl, y1 - Math.sin(ang - .5) * hl); g.lineTo(x1 - Math.cos(ang + .5) * hl, y1 - Math.sin(ang + .5) * hl); g.closePath(); g.fill(); g.restore();
}

// ───────── the characters
// face: mood = 'happy' | 'worried' | 'annoyed' | 'sad' | 'guilty' | 'scared' | 'love'; look = eye offset (-1..1)
function face(r, mood, t, look = 0, blinkSeed = 0) {
  const ex = r * .3, ey = -r * .05, ew = r * .11, eh = r * .15;
  const bl = ((t + blinkSeed) % 3.7) < .12 ? .12 : 1;                      // blink
  g.fillStyle = P.navy;
  for (const s of [-1, 1]) {
    g.save(); g.translate(s * ex + look * r * .06, ey);
    if (mood === 'annoyed') { g.beginPath(); g.ellipse(0, 0, ew, eh * .55, 0, 0, TAU); g.fill(); g.lineWidth = r * .045; g.strokeStyle = P.navy; g.lineCap = 'round'; g.beginPath(); g.moveTo(-ew * 1.2, -eh * (s > 0 ? .9 : 1.5)); g.lineTo(ew * 1.2, -eh * (s > 0 ? 1.5 : .9)); g.stroke(); }
    else if (mood === 'love') { g.fillStyle = P.red; g.beginPath(); g.moveTo(0, eh * .6); g.bezierCurveTo(-ew * 1.6, -eh * .2, -ew * .5, -eh * 1.2, 0, -eh * .3); g.bezierCurveTo(ew * .5, -eh * 1.2, ew * 1.6, -eh * .2, 0, eh * .6); g.fill(); g.fillStyle = P.navy; }
    else { g.beginPath(); g.ellipse(0, 0, ew, eh * bl, 0, 0, TAU); g.fill(); if (bl > .5) { g.fillStyle = P.white; g.beginPath(); g.arc(-ew * .3, -eh * .35, ew * .38, 0, TAU); g.fill(); g.fillStyle = P.navy; } }
    if (mood === 'worried' || mood === 'scared' || mood === 'sad') { g.lineWidth = r * .04; g.strokeStyle = P.navy; g.lineCap = 'round'; g.beginPath(); g.moveTo(-ew * 1.1, -eh * (s > 0 ? 1.7 : 1.2)); g.lineTo(ew * 1.1, -eh * (s > 0 ? 1.2 : 1.7)); g.stroke(); }
    g.restore();
  }
  g.fillStyle = 'rgba(255,140,170,.55)'; for (const s of [-1, 1]) { g.beginPath(); g.ellipse(s * r * .5, r * .17, r * .1, r * .06, 0, 0, TAU); g.fill(); }
  g.strokeStyle = P.navy; g.lineWidth = r * .045; g.lineCap = 'round'; g.beginPath();
  const my = r * .22;
  if (mood === 'happy' || mood === 'love') g.arc(0, my - r * .08, r * .14, Math.PI * .15, Math.PI * .85);
  else if (mood === 'guilty') { g.moveTo(-r * .12, my); g.quadraticCurveTo(0, my + r * .04, r * .12, my - r * .04); }
  else if (mood === 'annoyed') { g.moveTo(-r * .1, my + r * .02); g.lineTo(r * .1, my - r * .01); }
  else if (mood === 'scared') { g.stroke(); g.fillStyle = P.navy; g.beginPath(); g.ellipse(0, my + r * .02, r * .07, r * .09, 0, 0, TAU); g.fill(); return; }
  else g.arc(0, my + r * .1, r * .12, Math.PI * 1.15, Math.PI * 1.85);   // sad / worried
  g.stroke();
}
function earth(x, y, r, t, mood = 'happy', o = {}) {
  g.save(); g.translate(x, y); if (o.squash) g.scale(1 + o.squash, 1 - o.squash);
  glow(0, 0, r * 1.45, '90,170,255', .28);
  g.beginPath(); g.arc(0, 0, r, 0, TAU); g.save(); g.clip();
  g.fillStyle = P.ocean; g.fillRect(-r, -r, 2 * r, 2 * r);
  const rot = (o.rot ?? t * .25) % TAU;                                     // continents slide across as it spins
  for (const [u, v, s] of [[.2, -.35, .42], [.75, .15, .5], [1.3, -.1, .36], [1.85, .4, .3], [2.6, -.3, .45], [3.4, .25, .4], [4.2, -.2, .5], [5.0, .3, .35], [5.7, -.45, .3]]) {
    const a = u + rot, cx = Math.sin(a) * r, vis = Math.cos(a); if (vis < -.1) continue;
    g.fillStyle = P.land; g.beginPath(); g.ellipse(cx, v * r, r * s * .55 * Math.max(.2, vis), r * s * .36, 0, 0, TAU); g.ellipse(cx + r * s * .25 * vis, v * r + r * s * .2, r * s * .35 * Math.max(.2, vis), r * s * .25, 0, 0, TAU); g.fill();
  }
  g.fillStyle = 'rgba(255,255,255,.9)'; g.beginPath(); g.ellipse(0, -r * .93, r * .45, r * .12, 0, 0, TAU); g.fill();   // ice cap
  g.fillStyle = 'rgba(20,30,90,.28)'; g.beginPath(); g.arc(r * .35, r * .1, r * 1.1, 0, TAU); g.arc(-r * .15, -r * .08, r * 1.02, 0, TAU, true); g.fill('evenodd');   // cel shadow
  g.restore();
  if (!o.noFace) face(r, mood, t, o.look || 0, 0);
  g.restore();
}
function moon(x, y, r, t, mood = 'happy', o = {}) {
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
function sun(x, y, r, t, o = {}) {
  const red = o.red || 0;
  glow(x, y, r * (2.2 + .1 * Math.sin(t * 2)), red ? '255,90,60' : '255,200,80', .5);
  g.save(); g.translate(x, y);
  const N = 14; g.fillStyle = red ? '#ff7a4a' : P.sunD; g.beginPath(); for (let i = 0; i <= N * 2; i++) { const a = i / (N * 2) * TAU + t * .15, rr = r * (i % 2 ? 1.12 : 1.24); g.lineTo(Math.cos(a) * rr, Math.sin(a) * rr); } g.fill();
  g.fillStyle = red ? '#ff5a3c' : P.sun; g.beginPath(); g.arc(0, 0, r, 0, TAU); g.fill();
  g.fillStyle = red ? 'rgba(160,30,30,.3)' : 'rgba(255,140,40,.35)'; g.beginPath(); g.arc(r * .3, r * .15, r * 1.05, 0, TAU); g.arc(-r * .12, -r * .06, r, 0, TAU, true); g.fill('evenodd');
  g.restore();
}
function hand(x0, y0, x1, y1, col, w) { g.save(); g.strokeStyle = col; g.lineWidth = w; g.lineCap = 'round'; g.beginPath(); g.moveTo(x0, y0); g.quadraticCurveTo((x0 + x1) / 2, Math.min(y0, y1) - w, x1, y1); g.stroke(); g.restore(); }
function card(x, y, w, h, a = 1) { g.save(); g.globalAlpha *= a; g.fillStyle = 'rgba(12,10,44,.72)'; g.beginPath(); g.roundRect(x - w / 2, y - h / 2, w, h, 24); g.fill(); g.strokeStyle = 'rgba(185,168,255,.4)'; g.lineWidth = 3; g.stroke(); g.restore(); }

// ───────── new characters: Mars, and the two potato moons
Object.assign(P, { mars: '#e8703f', marsD: '#b9482b', marsL: '#f59a64', marsP: '#c4542f', pho: '#a08a7a', phoD: '#7a6658', phoL: '#c2ad9c', dei: '#c9b6a2', deiD: '#9c8a78',
  sand0: '#d9824e', sand1: '#b85c33', sky0: '#e9b58a', sky1: '#c98458', flag: '#ff3b4e' });
function mars(x, y, r, t, mood = 'happy', o = {}) {
  g.save(); g.translate(x, y); if (o.squash) g.scale(1 + o.squash, 1 - o.squash);
  glow(0, 0, r * 1.45, '255,120,70', .26);
  g.beginPath(); g.arc(0, 0, r, 0, TAU); g.save(); g.clip();
  g.fillStyle = P.mars; g.fillRect(-r, -r, 2 * r, 2 * r);
  const rot = (o.rot ?? t * .2) % TAU;                                        // dark plains slide across as it spins
  for (const [u, v, s] of [[.3, -.25, .5], [1.2, .2, .36], [2.1, -.05, .58], [3.0, .35, .3], [3.9, -.3, .42], [4.8, .15, .5], [5.6, -.1, .32]]) {
    const a = u + rot, cx = Math.sin(a) * r, vis = Math.cos(a); if (vis < -.1) continue;
    g.fillStyle = P.marsP; g.beginPath(); g.ellipse(cx, v * r, r * s * .5 * Math.max(.2, vis), r * s * .22, .2, 0, TAU); g.fill();
    g.fillStyle = P.marsL; g.beginPath(); g.ellipse(cx - r * s * .3 * vis, v * r - r * s * .3, r * s * .22 * Math.max(.2, vis), r * s * .1, 0, 0, TAU); g.fill();
  }
  g.fillStyle = 'rgba(255,255,255,.92)'; g.beginPath(); g.ellipse(0, -r * .95, r * .38, r * .1, 0, 0, TAU); g.fill();   // polar cap
  g.fillStyle = 'rgba(90,20,30,.28)'; g.beginPath(); g.arc(r * .35, r * .1, r * 1.1, 0, TAU); g.arc(-r * .15, -r * .08, r * 1.02, 0, TAU, true); g.fill('evenodd');
  g.restore();
  if (!o.noFace) face(r, mood, t, o.look || 0, .7);
  g.restore();
}
// a lumpy potato moon. o: { col, dark, light, rot, grooves (0..1), crack (0..1), squash, shades }
function potatoPath(r, seed = 0) {
  g.beginPath();
  for (let i = 0; i <= 48; i++) { const a = i / 48 * TAU, k = 1 + .1 * Math.cos(2 * a) + .05 * Math.sin(3 * a + 1 + seed) + .03 * Math.cos(5 * a + seed * 2); g.lineTo(Math.cos(a) * r * 1.22 * k, Math.sin(a) * r * .92 * k); }
  g.closePath();
}
function potato(x, y, r, t, mood = 'happy', o = {}) {
  const col = o.col || P.pho, dark = o.dark || P.phoD, light = o.light || P.phoL, seed = o.seed || 0;
  g.save(); g.translate(x, y); g.rotate(o.rot || 0); if (o.squash) g.scale(1 + o.squash, 1 - o.squash * .7);
  glow(0, 0, r * 1.6, '230,200,180', .16);
  potatoPath(r, seed); g.fillStyle = col; g.fill();
  g.save(); potatoPath(r, seed); g.clip();
  // craters (Phobos keeps its big Stickney crater on the left)
  for (const [cx, cy, s] of (o.big === false ? [] : [[-.72, .05, .34]]).concat([[.55, -.4, .14], [.75, .35, .12], [-.2, -.6, .1], [.1, .6, .11], [-.5, -.45, .08]])) {
    g.fillStyle = dark; g.beginPath(); g.arc(cx * r, cy * r, s * r, 0, TAU); g.fill(); g.fillStyle = light; g.beginPath(); g.arc(cx * r - s * r * .2, cy * r - s * r * .25, s * r * .55, 0, TAU); g.fill(); }
  // the grooves: long parallel stretch marks
  const gv = o.grooves || 0;
  if (gv > 0) { g.strokeStyle = dark; g.lineCap = 'round'; g.lineWidth = r * .045;
    for (let i = 0; i < 6; i++) { const yy = (-.55 + i * .22) * r, L = clamp(gv * 1.6 - i * .1); if (L <= 0) continue; g.beginPath(); for (let k = 0; k <= 20 * L; k++) { const u = k / 20, xx = (-1.1 + u * 2.2) * r; g.lineTo(xx, yy + Math.sin(u * 3 + i) * r * .05 + (xx / r) ** 2 * r * .06); } g.stroke(); } }
  g.fillStyle = 'rgba(40,25,30,.3)'; g.beginPath(); g.arc(r * .4, r * .12, r * 1.25, 0, TAU); g.arc(-r * .2, -r * .1, r * 1.12, 0, TAU, true); g.fill('evenodd');
  // cracks
  const ck = o.crack || 0;
  if (ck > 0) { g.strokeStyle = '#2a1a20'; g.lineWidth = r * .06; g.lineJoin = 'round'; const R = mulberry(31);
    for (let j = 0; j < 4; j++) { let px = 0, py = 0, a = j * TAU / 4 + .4; g.beginPath(); g.moveTo(px, py); for (let k = 0; k < 5 * ck; k++) { a += (R() - .5) * .9; px += Math.cos(a) * r * .28; py += Math.sin(a) * r * .22; g.lineTo(px, py); } g.stroke(); } }
  g.restore();
  if (!o.noFace) { g.save(); g.translate(r * .15, -r * .02); face(r * .72, mood, t, o.look || 0, 2.1 + seed); g.restore(); }
  if (o.shades) { g.save(); g.translate(r * .15 + (o.look || 0) * r * .04, -r * .06); g.fillStyle = '#111'; for (const s of [-1, 1]) { g.beginPath(); g.roundRect(s * r * .22 - r * .16, -r * .1, r * .32, r * .2, r * .06); g.fill(); } g.fillRect(-r * .1, -r * .05, r * .2, r * .04); g.restore(); }
  g.restore();
}
function arm(x0, y0, x1, y1, bend, col = P.marsD, w = 34) {
  const mx = (x0 + x1) / 2, my = (y0 + y1) / 2, dx = x1 - x0, dy = y1 - y0, L = Math.hypot(dx, dy) || 1, cx = mx - dy / L * bend, cy = my + dx / L * bend;
  g.save(); g.strokeStyle = col; g.lineWidth = w; g.lineCap = 'round'; g.beginPath(); g.moveTo(x0, y0); g.quadraticCurveTo(cx, cy, x1, y1); g.stroke();
  g.fillStyle = col; g.beginPath(); g.arc(x1, y1, w * .75, 0, TAU); g.fill(); g.restore();
}
function heart(x, y, s, col = P.red, a = 1, broken = 0) {
  if (a <= 0) return; g.save(); g.globalAlpha *= a; g.translate(x, y); g.scale(s, s); g.fillStyle = col;
  const shape = () => { g.beginPath(); g.moveTo(0, 30); g.bezierCurveTo(-60, -10, -30, -55, 0, -22); g.bezierCurveTo(30, -55, 60, -10, 0, 30); g.fill(); };
  if (!broken) shape();
  else for (const sd of [-1, 1]) { g.save(); g.translate(sd * broken * 16, broken * 8); g.rotate(sd * broken * .22); g.beginPath(); g.moveTo(0, -60); g.lineTo(sd * 8, -22); g.lineTo(-sd * 6, -4); g.lineTo(sd * 6, 12); g.lineTo(0, 40); g.lineTo(sd * 80, 40); g.lineTo(sd * 80, -60); g.closePath(); g.clip(); shape(); g.restore(); }
  g.restore();
}
function bubble(x, y, s, str, k, tail = -1) {
  if (k <= 0) return; g.save(); g.translate(x, y); g.scale(k, k); g.font = `1000 ${s}px NU`; const w = g.measureText(str).width + s * 1.1, h = s * 1.7;
  g.fillStyle = P.white; g.beginPath(); g.roundRect(-w / 2, -h / 2, w, h, h / 2.4); g.fill();
  g.beginPath(); g.moveTo(tail * w * .2, h * .4); g.lineTo(tail * w * .34, h * .95); g.lineTo(tail * w * .02, h * .45); g.fill();
  text(str, 0, s * .36, s, P.navy, 1000, null, 0); g.restore();
}
function flag(x, y, s, t, k) { if (k <= 0) return; g.save(); g.translate(x, y); g.scale(k * s, k * s); g.fillStyle = '#e8e0d8'; g.fillRect(-4, -120, 8, 120);
  g.fillStyle = P.flag; g.beginPath(); g.moveTo(4, -120); for (let i = 0; i <= 10; i++) g.lineTo(4 + i * 9, -120 + Math.sin(t * 6 + i * .6) * 5); for (let i = 10; i >= 0; i--) g.lineTo(4 + i * 9, -70 + Math.sin(t * 6 + i * .6) * 5); g.fill(); g.restore(); }
function ground(t, sky0 = P.sky0, sky1 = P.sky1) {
  const gr = g.createLinearGradient(0, 0, 0, H); gr.addColorStop(0, sky1); gr.addColorStop(.62, sky0); gr.addColorStop(1, sky0); g.fillStyle = gr; g.fillRect(0, 0, W, H);
  g.fillStyle = '#c06a40'; g.beginPath(); g.moveTo(0, 1180); for (let x = 0; x <= W; x += 30) g.lineTo(x, 1180 - Math.max(0, Math.sin(x / 210 + .6)) * 110 - Math.sin(x / 53) * 10); g.lineTo(W, H); g.lineTo(0, H); g.fill();   // far hills
  g.fillStyle = P.sand0; g.beginPath(); g.moveTo(0, 1290); for (let x = 0; x <= W; x += 30) g.lineTo(x, 1290 + Math.sin(x / 170 + 1) * 24); g.lineTo(W, H); g.lineTo(0, H); g.fill();
  g.fillStyle = P.sand1; for (const [x, y, rx] of [[160, 1420, 60], [820, 1380, 40], [930, 1760, 90], [380, 1800, 70], [640, 1600, 30]]) { g.beginPath(); g.ellipse(x, y, rx, rx * .45, 0, Math.PI, TAU); g.fill(); }
}
function rover(x, y, s) { g.save(); g.translate(x, y); g.scale(s, s);
  g.fillStyle = '#3a3340'; for (const wx of [-110, 0, 110]) { g.beginPath(); g.arc(wx, 40, 34, 0, TAU); g.fill(); } g.fillStyle = '#8c8494'; for (const wx of [-110, 0, 110]) { g.beginPath(); g.arc(wx, 40, 14, 0, TAU); g.fill(); }
  g.strokeStyle = '#d8d4dc'; g.lineWidth = 10; g.beginPath(); g.moveTo(-110, 40); g.lineTo(-50, -10); g.lineTo(0, 40); g.moveTo(-50, -10); g.lineTo(60, -10); g.lineTo(110, 40); g.stroke();
  g.fillStyle = '#f2f0f4'; g.beginPath(); g.roundRect(-140, -80, 280, 80, 14); g.fill(); g.fillStyle = '#c9c4cf'; g.fillRect(-140, -20, 280, 20);
  g.fillStyle = '#d8d4dc'; g.fillRect(70, -230, 14, 150); g.fillStyle = '#f2f0f4'; g.beginPath(); g.roundRect(40, -280, 90, 56, 10); g.fill();
  g.fillStyle = '#17163f'; for (const ex of [62, 106]) { g.beginPath(); g.arc(ex, -252, 13, 0, TAU); g.fill(); } g.fillStyle = '#fff'; for (const ex of [58, 102]) { g.beginPath(); g.arc(ex, -256, 4, 0, TAU); g.fill(); }
  g.restore(); }
function box(x, y, s, str) { g.save(); g.translate(x, y); g.scale(s, s); g.fillStyle = '#d9a86a'; g.fillRect(-70, -55, 140, 110); g.fillStyle = '#b8864a'; g.fillRect(-70, -55, 140, 22); g.fillStyle = '#c99858'; g.fillRect(-12, -55, 24, 110);
  text(str, 0, 22, 30, P.navy, 1000, null, 0); g.restore(); }
function suitcase(x, y, s) { g.save(); g.translate(x, y); g.scale(s, s); g.fillStyle = '#3fb7ff'; g.beginPath(); g.roundRect(-55, -40, 110, 80, 12); g.fill(); g.strokeStyle = '#2a7ab8'; g.lineWidth = 8; g.beginPath(); g.roundRect(-20, -58, 40, 22, 6); g.stroke(); g.fillStyle = '#ffc73a'; g.fillRect(-55, -6, 110, 10); g.restore(); }

// ───────── scenes
const SC = [];
const kpop = (t, t0, x, y, fn, d = .4) => { const k = pop(t, t0, d); if (k > 0) { g.save(); g.translate(x, y); g.scale(k, k); fn(k); g.restore(); } };
// 0 · our Moon drifts off… then whip over to Mars, where Phobos is glued on
SC[0] = (t) => {
  bg(t);
  const sw = eio(seg(t, T.mars - .35, T.mars + .25));                      // whip-pan from the Earth couple to the Mars couple
  g.save(); g.translate(-sw * W * 1.1, 0);
  const gap = ss(seg(t, T.slowly - .2, T.slowly + 1.0)) * 90;
  earth(CX - 170 - gap * .3, 1000, 190, t, t > T.slowly ? 'sad' : 'happy', { look: t > T.slowly ? 1 : .6 });
  moon(CX + 230 + gap, 960 - gap * .2, 120, t, 'guilty', { look: 1, tilt: Math.sin(t * 1.4) * .05 });
  if (t > T.slowly - .1) suitcase(CX + 330 + gap, 1110 - gap * .2, .9);
  g.restore();
  if (sw > 0) {
    g.save(); g.translate((1 - sw) * W * 1.1, 0);
    const hb = 1 + .03 * Math.sin(t * 7);
    mars(CX - 70, 1010, 230, t, t > T.opposite ? 'worried' : 'happy', { look: 1 });
    potato(CX + 215, 870, 92 * hb, t, 'love', { rot: -.35, look: -1 });
    for (let i = 0; i < 4; i++) { const ph = (t * .6 + i / 4) % 1; heart(CX + 250 + Math.sin(i * 2.1 + t * 2) * 60, 760 - ph * 260, .9 + i * .1, P.red, Math.sin(ph * Math.PI)); }
    g.restore();
  }
  const k0 = pop(t, .15, .5) * (1 - seg(t, T.mars - .4, T.mars - .1));
  if (k0 > 0) { g.save(); g.translate(CX, 330); g.scale(k0, k0); text('Our Moon', 0, -10, 100); text('is leaving…', 0, 90, 100, P.gold); g.restore(); }
  const k1 = pop(t, T.mars, .5); if (k1 > 0) { g.save(); g.translate(CX, 330); g.scale(k1, k1); text('Mars has a', 0, -10, 100); text('CLINGY MOON', 0, 100, 112, P.gold); g.restore(); }
};
// 1 · 6,000 km up; our Moon keeps 60× more space
SC[1] = (t) => {
  bg(t);
  const mx = CX, my = 1060, mr = 250, pa = -Math.PI / 2 - .55 + (t - S[1]) * .12, pd = mr + 170;
  g.save(); g.strokeStyle = 'rgba(185,168,255,.35)'; g.setLineDash([16, 14]); g.lineWidth = 4; g.beginPath(); g.arc(mx, my, pd, 0, TAU); g.stroke(); g.restore();
  mars(mx, my, mr, t, t > T.clingy ? 'guilty' : 'happy', { look: Math.cos(pa) });
  const px = mx + Math.cos(pa) * pd, py = my + Math.sin(pa) * pd;
  potato(px, py, 70, t, 'love', { rot: pa + Math.PI / 2 + .2, look: 0 });
  if (t > T.clingy - .2 && t < T.km - .2) heart(px + 70, py - 90, .8 * pop(t, T.clingy - .2), P.red, 1);
  // the 6,000 km bracket from the surface to Phobos
  const kb = ss(seg(t, T.km - .3, T.km + .2));
  if (kb > 0) { const a = pa, x0 = mx + Math.cos(a) * (mr + 6), y0 = my + Math.sin(a) * (mr + 6), x1 = mx + Math.cos(a) * (pd - 64), y1 = my + Math.sin(a) * (pd - 64);
    g.save(); g.globalAlpha *= kb; g.strokeStyle = P.gold; g.lineWidth = 8; g.lineCap = 'round'; g.beginPath(); g.moveTo(x0, y0); g.lineTo(lerp(x0, x1, kb), lerp(y0, y1, kb)); g.stroke(); g.restore();
    kpop(t, T.km - .1, x0 - 250, (y0 + y1) / 2 - 10, () => { text('6,000 km', 0, 0, 82, P.gold); text('above the ground', 0, 50, 36, P.white, 800); }); }
  // our Moon's distance, for comparison
  const kc = ss(seg(t, T.sixty - .6, T.sixty - .1));
  if (kc > 0) { g.save(); g.globalAlpha *= kc; card(CX, 330, 940, 250);
    earth(170, 330, 54, t, 'sad', { look: 1 }); moon(910, 330, 34, t, 'guilty', { look: 1 });
    g.strokeStyle = P.cyan; g.lineWidth = 6; g.setLineDash([14, 12]); g.beginPath(); g.moveTo(240, 330); g.lineTo(lerp(240, 860, ss(seg(t, T.sixty - .4, T.sixty + .4))), 330); g.stroke(); g.setLineDash([]);
    text('our Moon: 384,000 km', CX, 285, 40, P.white, 900, P.navy, 8); g.restore();
    kpop(t, T.sixty, CX, 412, () => text('60× more space', 0, 0, 64, P.cyan, 1000)); }
};
// 2 · three laps a day; rises in the west, sets in the east
SC[2] = (t) => {
  const gv = ss(seg(t, T.fromGround - .5, T.fromGround));                   // orbit view → ground view
  if (gv < 1) {
    g.save(); g.globalAlpha *= 1 - gv; bg(t);
    const mx = CX, my = 960, mr = 230, pd = mr + 160, u = Math.max(0, t - (T.laps - .4)), pa = -Math.PI / 2 + u * 3.4;
    g.strokeStyle = 'rgba(185,168,255,.35)'; g.setLineDash([16, 14]); g.lineWidth = 4; g.beginPath(); g.arc(mx, my, pd, 0, TAU); g.stroke(); g.setLineDash([]);
    for (let k = 1; k < 7; k++) { const a = pa - k * .09; g.globalAlpha = (1 - gv) * (.5 - k * .07); g.fillStyle = P.phoL; g.beginPath(); g.arc(mx + Math.cos(a) * pd, my + Math.sin(a) * pd, 40 - k * 4, 0, TAU); g.fill(); }   // speed trail
    g.globalAlpha = 1 - gv;
    mars(mx, my, mr, t, 'worried', { look: Math.cos(pa), rot: (t - S[2]) * .3 });
    potato(mx + Math.cos(pa) * pd, my + Math.sin(pa) * pd, 60, t, 'happy', { rot: pa + Math.PI / 2, look: 0 });
    kpop(t, T.three - .15, CX, 330, () => { card(0, 0, 620, 190); text('3 laps', 0, 10, 96, P.gold, 1000, null, 0); text('every Mars day', 0, 62, 38, P.white, 800, null, 0); });
    g.restore();
  }
  if (gv > 0) {
    g.save(); g.globalAlpha *= gv; ground(t);
    // Phobos crosses the sky west → east (left → right) on an arc
    const u = clamp((t - (T.west - .9)) / (T.east + .7 - (T.west - .9))), ax = lerp(-80, W + 80, u), ay = 1180 - Math.sin(u * Math.PI) * 720;
    potato(ax, ay, 62, t, 'happy', { rot: -.2 + u * .4, look: 1 });
    g.strokeStyle = 'rgba(255,255,255,.55)'; g.lineWidth = 5; g.setLineDash([12, 14]); g.beginPath(); for (let k = 0; k <= 40; k++) { const v = k / 40; g.lineTo(lerp(-80, W + 80, v), 1180 - Math.sin(v * Math.PI) * 720); } g.stroke(); g.setLineDash([]);
    text('WEST', 130, 1250, 58, P.white, 1000, P.navy, 12, 'center', ss(seg(t, T.west - .3, T.west)));
    text('EAST', W - 130, 1250, 58, P.white, 1000, P.navy, 12, 'center', ss(seg(t, T.east - .3, T.east)));
    kpop(t, T.west - .1, 250, 1110, () => text('rises', 0, 0, 52, P.gold, 1000, P.navy, 12));
    kpop(t, T.east - .1, W - 250, 1110, () => text('sets', 0, 0, 52, P.gold, 1000, P.navy, 12));
    kpop(t, T.fromGround + .1, CX, 300, () => text('backwards!', 0, 0, 84, P.white, 1000, P.navy, 14));
    g.restore();
  }
};
// 3 · moving in: a little closer every century
SC[3] = (t) => {
  bg(t);
  const mx = CX - 140, my = 1050, mr = 260, cl = ss(seg(t, T.moving - .3, T.century + .6));
  mars(mx, my, mr, t, t > T.moving ? 'scared' : 'worried', { look: 1 });
  const px = lerp(CX + 330, CX + 250, cl), py = lerp(820, 850, cl), hop = Math.abs(Math.sin(t * 6)) * 16 * (1 - cl * .6);
  potato(px, py - hop, 86, t, 'love', { rot: -.25, look: -1 });
  if (t > T.moving - .3) box(px + 10, py + 160 - hop, .9 * pop(t, T.moving - .3), 'MY STUFF');
  kpop(t, T.moving, px + 30, py - 170, () => bubble(0, 0, 44, 'hiii roomie', 1, -1));
  kpop(t, T.two - .1, CX, 330, () => { card(0, 0, 640, 190); text('−2 m', 0, 20, 100, P.gold, 1000, null, 0); text('closer every century', 0, 70, 38, P.white, 800, null, 0); });
};
// 4 · same physics, backwards: the bulge lags and drags Phobos down
SC[4] = (t) => {
  bg(t);
  const ex = CX, ey = 1010, er = 190, u = t - S[4];
  const spiral = ss(seg(t, T.drags - .2, T.drags + 1.4)), pd = lerp(400, 330, spiral);
  g.save(); g.strokeStyle = 'rgba(185,168,255,.3)'; g.setLineDash([16, 14]); g.lineWidth = 4; g.beginPath(); g.arc(ex, ey, pd, 0, TAU); g.stroke(); g.setLineDash([]); g.restore();
  const ma = -Math.PI / 2 - .6 + u * .55;
  const bk = ss(seg(t, T.bulge - .4, T.bulge + .3)), lag = ss(seg(t, T.lags - .4, T.lags + .3)) * .5, ba = ma - lag;
  if (bk > 0) { g.save(); g.translate(ex, ey); g.rotate(ba); g.fillStyle = 'rgba(255,170,120,.5)'; g.beginPath(); g.ellipse(0, 0, er * (1 + .32 * bk), er * (1 + .04 * bk), 0, 0, TAU); g.fill(); g.restore(); }
  mars(ex, ey, er, t, 'happy', { rot: u * .25, look: Math.cos(ma) });
  // spin arrows (slow) and the orbit arrow (fast)
  const sa = ss(seg(t, T.spins - .3, T.spins + .2)); if (sa > 0) { g.save(); g.globalAlpha *= sa; g.strokeStyle = P.cyan; g.lineWidth = 10; g.lineCap = 'round'; const sp = u * .25; for (const k of [0, Math.PI]) { g.beginPath(); g.arc(ex, ey, er + 40, k + sp, k + sp + .9); g.stroke(); const a2 = k + sp + .9; arrow(ex + Math.cos(a2 - .1) * (er + 40), ey + Math.sin(a2 - .1) * (er + 40), ex + Math.cos(a2 + .05) * (er + 40), ey + Math.sin(a2 + .05) * (er + 40), P.cyan, 10); } g.restore(); }
  const px = ex + Math.cos(ma) * pd, py = ey + Math.sin(ma) * pd;
  potato(px, py, 66, t, t > T.drags ? 'scared' : 'happy', { rot: ma + Math.PI / 2, look: 0 });
  const fa = ss(seg(t, T.faster - .3, T.faster + .2)); if (fa > 0) arrow(px + Math.cos(ma + Math.PI / 2) * 20, py + Math.sin(ma + Math.PI / 2) * 20, px + Math.cos(ma + Math.PI / 2) * 170, py + Math.sin(ma + Math.PI / 2) * 170, P.gold, 14, fa);
  const tip = [ex + Math.cos(ba) * er * 1.32, ey + Math.sin(ba) * er * 1.32];
  const da = ss(seg(t, T.drags - .3, T.drags + .2)); if (da > 0) { arrow(px - Math.cos(ma) * 70, py - Math.sin(ma) * 70, lerp(px, tip[0], .55), lerp(py, tip[1], .55), P.red, 16, da); }
  text('bulge', tip[0] - 30, tip[1] + 70, 40, '#ffb38a', 900, P.navy, 10, 'center', bk);
  // labels: who is faster
  text('Phobos orbits FAST', CX, 510, 50, P.gold, 1000, P.navy, 10, 'center', fa);
  text('Mars spins slow', CX, 575, 50, P.cyan, 1000, P.navy, 10, 'center', sa);
  // the comparison card: ours gets pushed out, Phobos gets pulled in
  kpop(t, T.backwards - .2, CX, 320, () => { card(0, 0, 900, 220);
    moon(-330, -30, 40, t, 'guilty', { look: 1 }); arrow(-280, -30, -150, -90, P.cyan, 12); text('our Moon: pushed OUT', 50, -18, 44, P.white, 900, null, 0);
    potato(-330, 60, 34, t, 'scared', { rot: .3 }); arrow(-160, 30, -275, 65, P.red, 12); text('Phobos: pulled IN', 30, 74, 44, P.red, 900, null, 0); });
};
// 5 · a hug it won't survive
SC[5] = (t) => {
  bg(t, '#120626', '#2c0f3c');
  const mx = CX - 90, my = 1020, mr = 290, sq = ss(seg(t, T.hug - .3, T.hug + .6)), sv = ss(seg(t, T.survive - .3, T.survive + .3));
  const px = lerp(CX + 330, CX + 245, sq), py = 860;
  mars(mx, my, mr, t, 'love', { look: 1 });
  potato(px, py, 92, t, sv > .3 ? 'scared' : 'love', { rot: -.4, squash: sq * .1 + sv * .12, look: -1 });
  // Mars's arms wrap around Phobos
  if (sq > 0) { g.save(); g.globalAlpha *= sq; arm(mx + mr * .55, my - mr * .83, px + 50, py - 60, -70, P.marsD, 38); arm(mx + mr * .97, my - mr * .05, px + 75, py + 45, 60, P.marsD, 38); g.restore(); }
  for (let i = 0; i < 5; i++) { const ph = (t * .5 + i / 5) % 1; heart(CX + 180 + Math.sin(i * 1.7 + t) * 120, 700 - ph * 300, 1 + i * .08, P.red, Math.sin(ph * Math.PI) * (1 - sv)); }
  if (sv > 0) heart(CX + 250, 560, 2.2, P.red, 1, sv);
  if (t > T.hug) { const shake = sv * 6 * Math.sin(t * 50); kpop(t, T.hug, px + 40 + shake, py - 190, () => bubble(0, 0, 40, sv > .4 ? 'too tight!!' : 'aww', 1, -1)); }
};
// 6 · the grooves: stretch marks
SC[6] = (t) => {
  bg(t);
  mars(-60, 1780, 520, t, 'happy', { look: 1 });                            // a big Mars in the corner, pulling
  const gv = ss(seg(t, T.grooves - .4, T.grooves + 1.0)), st = .04 * Math.sin(t * 3) * ss(seg(t, T.pulling - .3, T.pulling + .3));
  potato(CX + 60, 760, 290, t, t > T.stretch ? 'guilty' : 'worried', { rot: -.1, grooves: gv, look: -.6, squash: -st });
  if (t > T.stretch - .2) { g.save(); g.translate(CX + 60, 760); g.fillStyle = 'rgba(255,120,160,.6)'; for (const s of [-1, 1]) { g.beginPath(); g.ellipse(s * 120 + 40, 40, 40, 20, 0, 0, TAU); g.fill(); } g.restore(); }   // extra blush
  kpop(t, T.grooves - .1, CX + 60, 330, () => text('grooves', 0, 0, 80, P.white, 1000, P.navy, 14));
  const ks = pop(t, T.stretch - .1); if (ks > 0) { g.save(); g.translate(CX + 60, 330); g.scale(ks, ks); g.fillStyle = 'rgba(0,0,0,0)'; g.restore(); }
  if (t > T.stretch - .1) { const k = pop(t, T.stretch - .1); g.save(); g.translate(CX + 60, 1210); g.scale(k, k); card(0, 0, 640, 140); text('stretch marks?', 0, 22, 70, P.gold, 1000, null, 0); g.restore(); }
  const pa = ss(seg(t, T.pulling - .3, T.pulling + .2)); if (pa > 0) { arrow(CX - 170, 900, CX - 330, 1060, P.red, 16, pa); arrow(CX + 300, 640, CX + 430, 540, P.red, 16, pa * .8); }
  if (t > T.strain - .2 && t < T.grooves - .3) text('the strain…', CX + 60, 330, 72, P.white, 1000, P.navy, 14, 'center', ss(seg(t, T.strain - .2, T.strain + .1)));
};
// 7 · Perseverance films the eclipse
SC[7] = (t) => {
  ground(t, '#d9a67c', '#b27450');
  const sx = CX + 120, sy = 520, sr = 120;
  glow(sx, sy, sr * 2.6, '255,235,200', .55); g.fillStyle = '#fff3d6'; g.beginPath(); g.arc(sx, sy, sr, 0, TAU); g.fill();
  const u = clamp((t - (T.crossing - .6)) / (T.forty + .8 - (T.crossing - .6))), px = lerp(sx - 300, sx + 300, u);
  g.save(); g.beginPath(); g.arc(sx, sy, sr * 1.0, 0, TAU); g.rect(sx + 600, sy - 600, -1200, 1200); g.restore();
  potato(px, sy + 10, 62, t, 'happy', { col: '#4a3a3a', dark: '#2e2426', light: '#5a4848', rot: -.2, look: -1, big: false });
  rover(300, 1330, 1.05);
  const kc = pop(t, T.rover - .2); if (kc > 0) text('Perseverance', 300, 985, 48, P.white, 1000, P.navy, 12, 'center', kc);
  // the camera's view: a little screen with a REC dot
  if (t > T.crossing - .4) { const k = pop(t, T.crossing - .4); g.save(); g.translate(sx, sy); g.scale(k, k); g.strokeStyle = 'rgba(255,255,255,.85)'; g.lineWidth = 6; const s = 230;
    for (const [a, b] of [[-1, -1], [1, -1], [1, 1], [-1, 1]]) { g.beginPath(); g.moveTo(a * s, b * s + -b * 50); g.lineTo(a * s, b * s); g.lineTo(a * s + -a * 50, b * s); g.stroke(); }
    if (Math.floor(t * 2) % 2) { g.fillStyle = P.flag; g.beginPath(); g.arc(-s + 40, -s + 40, 14, 0, TAU); g.fill(); } text('REC', -s + 100, -s + 54, 36, P.white, 1000, null, 0); g.restore(); }
  if (t > T.forty - .4) { const k = pop(t, T.forty - .4); g.save(); g.translate(CX + 140, 880); g.scale(k, k); card(0, 0, 520, 160); text('~40 seconds', 0, 22, 74, P.gold, 1000, null, 0); g.restore(); }
};
// 8 · torn apart → a ring
SC[8] = (t) => {
  bg(t);
  const mx = CX, my = 1000, mr = 250, tr = ss(seg(t, T.tear - .2, T.tear + .5)), sp = ss(seg(t, T.tear + .3, T.ring + .6));
  // the ring forms (back half behind Mars)
  const ring = (front) => { if (sp <= 0) return; const R = mulberry(77); for (let i = 0; i < 260; i++) { const a = R() * TAU, rr = lerp(330, 470, R()), fa = (a + t * .3) % TAU, inFront = Math.sin(fa) > 0; if (inFront !== front) continue; if (R() > sp) continue;
      const x = mx + Math.cos(fa) * rr, y = my + Math.sin(fa) * rr * .3; g.fillStyle = R() > .5 ? P.phoL : P.pho; g.beginPath(); g.arc(x, y, 3 + R() * 6, 0, TAU); g.fill(); } };
  g.save(); g.translate(mx, my); g.rotate(-.25); g.translate(-mx, -my); ring(false); g.restore();
  mars(mx, my, mr, t, sp > .5 ? 'guilty' : 'happy', { look: 1 });
  g.save(); g.translate(mx, my); g.rotate(-.25); g.translate(-mx, -my); ring(true); g.restore();
  // Phobos, then its pieces
  const px = mx + 300, py = my - 200;
  if (sp < .6) {
    g.save(); g.globalAlpha *= 1 - ss(seg(sp, .2, .6));
    if (tr < .6) potato(px, py, 78, t, t > T.tear - .3 ? 'scared' : 'worried', { rot: -.3, crack: tr * 1.6, look: -1 });
    else { const R = mulberry(4); for (let i = 0; i < 12; i++) { const a = R() * TAU, d = sp * 260 + tr * 40, x = px + Math.cos(a) * d * (.5 + R()), y = py + Math.sin(a) * d * .5 * (.5 + R()); g.fillStyle = i % 2 ? P.pho : P.phoD; g.beginPath(); g.arc(x, y, 22 - sp * 12, 0, TAU); g.fill(); } }
    g.restore();
  }
  kpop(t, T.million - .1, CX, 330, () => { card(0, 0, 820, 180); text('30–50 million', 0, 10, 82, P.gold, 1000, null, 0); text('years from now', 0, 60, 38, P.white, 800, null, 0); });
};
// 9 · Mars puts a ring on it
SC[9] = (t) => {
  bg(t, '#1a0830', '#3a1050');
  const mx = CX, my = 980, mr = 250;
  const ring = (front) => { const R = mulberry(77); for (let i = 0; i < 300; i++) { const a = R() * TAU, rr = lerp(330, 470, R()), fa = (a + t * .3) % TAU; if ((Math.sin(fa) > 0) !== front) continue; const x = mx + Math.cos(fa) * rr, y = my + Math.sin(fa) * rr * .3; g.fillStyle = R() > .5 ? P.phoL : P.pho; g.beginPath(); g.arc(x, y, 3 + R() * 6, 0, TAU); g.fill(); } };
  g.save(); g.translate(mx, my); g.rotate(-.25); g.translate(-mx, -my); ring(false); g.restore();
  mars(mx, my, mr, t, 'love', { look: 0 });
  g.save(); g.translate(mx, my); g.rotate(-.25); g.translate(-mx, -my); ring(true); g.restore();
  // a diamond on the ring
  const kd = pop(t, T.ringOn - .2, .5); if (kd > 0) { g.save(); g.translate(mx + 430, my + 30); g.rotate(-.25); g.scale(kd, kd); g.fillStyle = '#bff3ff'; g.beginPath(); g.moveTo(0, 50); g.lineTo(-46, 0); g.lineTo(-26, -30); g.lineTo(26, -30); g.lineTo(46, 0); g.closePath(); g.fill(); g.fillStyle = '#ffffff'; g.beginPath(); g.moveTo(-26, -30); g.lineTo(0, 0); g.lineTo(26, -30); g.closePath(); g.fill(); g.restore(); sparkle(mx + 470, my - 40, 40 * kd, P.spark, 1); sparkle(mx + 380, my + 70, 24 * kd, P.spark, .9); }
  const R = mulberry(12); for (let i = 0; i < 24; i++) { const x = R() * W, y0 = R() * 600, sp = 120 + R() * 160, y = (y0 + (t - T.ringOn) * sp) % 1500; if (t > T.ringOn) { g.fillStyle = [P.gold, P.red, P.cyan, P.white][i % 4]; g.save(); g.translate(x, y + 150); g.rotate(t * 3 + i); g.fillRect(-8, -4, 16, 8); g.restore(); } }
  kpop(t, T.ringOn - .1, CX, 330, () => { text('put a ring', 0, 0, 104, P.gold, 1000); text('on it', 0, 100, 104, P.gold, 1000); });
};
// 10 · Deimos quietly drifts away — just like ours
SC[10] = (t) => {
  bg(t);
  const dr = ss(seg(t, T.drifting - .3, T.ours + .6));
  mars(CX - 220, 980, 210, t, t > T.drifting ? 'sad' : 'worried', { look: 1 });
  const dx = lerp(CX + 150, CX + 330, dr), dy = lerp(860, 760, dr);
  potato(dx, dy, 72, t, 'happy', { col: P.dei, dark: P.deiD, light: '#ddd0c0', rot: .2, look: 1, shades: true, big: false, seed: 2 });
  suitcase(dx + 50, dy + 110, .8);
  kpop(t, T.deimos - .1, dx, dy - 130, () => text('Deimos', 0, 0, 58, P.white, 1000, P.navy, 12));
  for (let i = 0; i < 3; i++) { const a = ss(seg(t, T.drifting, T.drifting + .3)); g.save(); g.globalAlpha *= a * .7; g.strokeStyle = P.spark; g.lineWidth = 6; g.lineCap = 'round'; g.beginPath(); g.moveTo(dx - 90 - i * 22, dy - 30 + i * 30); g.lineTo(dx - 140 - i * 22, dy - 30 + i * 30); g.stroke(); g.restore(); }
  // and ours, in a little card
  const ko = ss(seg(t, T.ours - .5, T.ours));
  if (ko > 0) { g.save(); g.globalAlpha *= ko; card(CX, 1240, 760, 220); const mdx = lerp(CX + 60, CX + 250, ss(seg(t, T.ours - .3, T.ours + 1)));
    earth(CX - 230, 1240, 70, t, 'sad', { look: 1 }); moon(mdx, 1230, 46, t, 'guilty', { look: 1 }); suitcase(mdx + 34, 1290, .45); text('just like ours', CX, 1160, 44, P.cyan, 1000, P.navy, 10); g.restore(); }
};
// 11 · Fear and Dread. Red planet, red flags.
SC[11] = (t) => {
  bg(t, '#1a0510', '#3a0a18');
  mars(CX, 1080, 230, t, t > T.flags - .2 ? 'guilty' : 'happy', { look: 0 });
  const kp = pop(t, T.pName - .2); if (kp > 0) { g.save(); g.translate(CX - 250, 590); g.scale(kp, kp); potato(0, -10, 60, t, 'happy', { rot: -.2 }); g.restore(); }
  const kdm = pop(t, T.dName - .2); if (kdm > 0) { g.save(); g.translate(CX + 250, 590); g.scale(kdm, kdm); potato(0, -10, 44, t, 'happy', { col: P.dei, dark: P.deiD, light: '#ddd0c0', big: false, seed: 2 }); g.restore(); }
  text('Phobos', CX - 250, 705, 52, P.white, 1000, P.navy, 12, 'center', kp ? 1 : 0);
  text('Deimos', CX + 250, 705, 52, P.white, 1000, P.navy, 12, 'center', kdm ? 1 : 0);
  kpop(t, T.fear - .1, CX - 250, 785, () => text('= FEAR', 0, 0, 64, P.red, 1000, P.navy, 12));
  kpop(t, T.dread - .1, CX + 250, 785, () => text('= DREAD', 0, 0, 64, P.red, 1000, P.navy, 12));
  const R = mulberry(3); const spots = [[CX - 150, 980], [CX + 150, 975], [CX - 235, 1110], [CX + 215, 1080], [CX - 70, 1310], [CX + 120, 1290], [CX - 20, 945], [CX - 190, 1240]];
  spots.forEach(([x, y], i) => flag(x, y, 1, t + i, pop(t, T.flags - .25 + i * .07, .3)));
  kpop(t, T.redPlanet - .1, CX, 330, () => text('red planet', 0, 0, 90, P.white, 1000));
  kpop(t, T.flags - .1, CX, 430, () => text('RED FLAGS', 0, 0, 104, P.flag, 1000));
};
// 12 · which would you rather have?
SC[12] = (t) => {
  bg(t);
  const gap = ss(seg(t, S[12], T.leaves + .6)) * 120;
  card(CX, 720, 960, 380);
  earth(CX - 260, 720, 110, t, 'sad', { look: 1 }); moon(CX + 120 + gap, 700, 70, t, 'guilty', { look: 1 }); suitcase(CX + 170 + gap, 780, .6);
  text('leaves you', CX + 160, 600, 52, P.cyan, 1000, P.navy, 10, 'center', ss(seg(t, T.leaves - .3, T.leaves)));
  card(CX, 1180, 960, 380);
  mars(CX - 140, 1190, 140, t, 'scared', { look: 1 }); potato(CX + 40, 1110, 62, t, 'love', { rot: -.4, look: -1, squash: .06 });
  arm(CX - 50, 1110, CX + 50, 1150, -40, P.marsD, 24);
  heart(CX + 110, 1020, .9, P.red, 1);
  text('never lets go', CX + 240, 1300, 52, P.red, 1000, P.navy, 10, 'center', ss(seg(t, T.never - .3, T.never)));
  kpop(t, S[12] + .2, CX, 330, () => { text('which would', 0, 0, 84, P.white, 1000); text('you rather?', 0, 90, 84, P.gold, 1000); });
};
const SCENE_FOR = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12];

// ───────── captions: word-pops, key words in gold (lower middle, above the Shorts UI)
const KEY = new Set(['moon', 'slowly', 'opposite', 'phobos', 'clingy', '6000', 'kilometres', '60', 'three', 'west', 'east', 'moving', 'two', 'metres', 'century', 'backwards', 'faster', 'bulge', 'drags', 'hug', 'survive', 'grooves', 'stretch', 'marks', 'perseverance', 'sun', '40', 'seconds', '30', '50', 'million', 'tear', 'ring', 'deimos', 'drifting', 'ours', 'fear', 'dread', 'red', 'flags', 'leaves', 'never']);
const CAP = [];

for (const [id, ws] of Object.entries(words)) {
  const toks = []; for (const w of ws) { if (/^[,.]/.test(w[0]) && toks.length) { const p = toks[toks.length - 1]; p.w += w[0]; p.t1 = w[2]; } else toks.push({ w: w[0], t0: Math.max(0, w[1]), t1: w[2] }); }
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
    for (const w of row) { const k = clamp((t - w.t0) / .1); if (k > 0) { g.save(); g.globalAlpha = k; g.translate(x, y); const s = .85 + .15 * eo(k); g.scale(s, s); g.lineJoin = 'round'; g.lineWidth = 16; g.strokeStyle = P.navy; g.textAlign = 'left'; g.strokeText(w.s, 0, 0); g.fillStyle = KEY.has(nrm(w.w)) ? P.gold : P.white; g.fillText(w.s, 0, 0); g.restore(); } x += w.wd; } });
  g.restore();
}

// ───────── frame: scenes with a zoom-and-fade transition between them
function render(t) {
  g.setTransform(1, 0, 0, 1, 0, 0); g.globalAlpha = 1;
  const i = sceneAt(t), s0 = S[i], tr = .45;
  const draw = (k, tt, z, a) => { g.save(); g.globalAlpha = a; g.translate(CX, H / 2); g.scale(z, z); g.translate(-CX, -H / 2); SC[SCENE_FOR[k]](tt); g.restore(); };
  const u = clamp((t - s0) / tr);
  if (i > 0 && u < 1 && SCENE_FOR[i] !== SCENE_FOR[i - 1]) { draw(i - 1, t, 1 + .12 * eio(u), 1); draw(i, t, .9 + .1 * eo(u), eo(u)); }
  else draw(i, t, 1 + (t - s0) * .004, 1);                                   // a slow push inside each scene
  g.setTransform(1, 0, 0, 1, 0, 0); g.globalAlpha = 1;
  captions(t);
  const fi = 1 - seg(t, 0, .3), fo = seg(t, DUR - .6, DUR); if (fi > 0 || fo > 0) { g.fillStyle = `rgba(0,0,0,${Math.max(fi, fo)})`; g.fillRect(0, 0, W, H); }
}

// ───────── events for the score and the mix
const EV = [];
for (const [id, t] of Object.entries(VO)) EV.push({ type: 'vo', id, t });
for (const [k, v] of Object.entries(T)) EV.push({ type: 'cue', name: k, t: +v.toFixed(3) });
S.forEach((s, i) => { if (i > 0 && i < S.length - 1) EV.push({ type: 'scene', i, t: +s.toFixed(3) }); });
EV.sort((a, b) => a.t - b.t);
window.EV = EV; window.DUR = DUR; window.render = render;
window.SUBS = lines.map((l, i) => { const ws = words[l.id], t0 = VO[l.id] - .05, nx = lines[i + 1] ? VO[lines[i + 1].id] - .05 : DUR; return { t0, t1: Math.max(Math.min(VO[l.id] + ws[ws.length - 1][2] + .6, nx), t0 + 1.8), text: l.sub || l.text }; });

// ───────── thumbnails (index.html?thumb=v → 1080×1920; ?thumb=h → a 1080×608 band at the top, scaled to 1280×720 afterwards)
function thumb(kind) {
  g.setTransform(1, 0, 0, 1, 0, 0); g.globalAlpha = 1; const t = 2.0;
  if (kind === 'v') {
    bg(t);
    mars(CX - 90, 1120, 330, t, 'love', { look: 1 });
    potato(CX + 250, 900, 120, t, 'love', { rot: -.4, look: -1, squash: .05 });
    arm(CX - 90 + 330 * .55, 1120 - 330 * .83, CX + 300, 840, -80, P.marsD, 44); arm(CX - 90 + 330 * .97, 1120 - 330 * .05, CX + 330, 960, 70, P.marsD, 44);
    heart(CX + 330, 750, 1.6); heart(CX + 190, 715, 1.0, P.red, .85); heart(CX + 440, 670, .8, P.red, .7);
    moon(170, 1640, 70, t, 'guilty', { look: -1 }); suitcase(215, 1715, .55); text('ours left…', 200, 1560, 44, P.cyan, 1000, P.navy, 10);
    text('MARS HAS A', CX, 300, 120, P.white, 1000, P.navy, 18); text('CLINGY', CX, 450, 170, P.gold, 1000, P.navy, 22); text('MOON', CX, 610, 170, P.gold, 1000, P.navy, 22);
  } else {
    g.fillStyle = '#000'; g.fillRect(0, 0, W, H); g.save(); g.beginPath(); g.rect(0, 0, W, 608); g.clip(); bg(t);
    mars(250, 390, 220, t, 'love', { look: 1 }); potato(470, 240, 82, t, 'love', { rot: -.4, look: -1 });
    arm(250 + 220 * .55, 390 - 220 * .83, 500, 200, -60, P.marsD, 32); arm(250 + 220 * .97, 390 - 220 * .05, 520, 280, 50, P.marsD, 32);
    heart(560, 120, 1.0); heart(620, 70, .6, P.red, .8);
    text('MARS HAS A', 800, 200, 66, P.white, 1000, P.navy, 12); text('CLINGY', 800, 330, 118, P.gold, 1000, P.navy, 16); text('MOON', 800, 450, 118, P.gold, 1000, P.navy, 16);
    g.restore();
  }
}
const QS = new URLSearchParams(location.search);
if (QS.get('thumb')) window.render = () => thumb(QS.get('thumb'));
window.render(+(QS.get('t') ?? 1.5));
window.READY = true;
