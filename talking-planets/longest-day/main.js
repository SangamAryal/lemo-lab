// Talking Planets #1 — "Who has the longest day?" Planets argue about whose day is longest (1 day = 1 spin) and Venus wins.
// Flat Beyond Everything kit art with light 2.5D depth (parallax by depth, a camera that drifts to whoever is talking),
// vertical 1080×1920, deterministic in t. Each planet's mouth follows the loudness of its own voice line (timeline.json).
import * as K from './kit.js';
import { clamp, lerp, seg, ss, eio, eo, mulberry, TAU } from '/core/lib.js';
const { P, text, glow, sparkle } = K;
const W = 1080, H = 1920, CX = W / 2;
const g = document.getElementById('c').getContext('2d'); K.setup(g, W, H); K.makeStars(120, 7);
await document.fonts.load('900 80px NU'); await document.fonts.load('800 40px NU');
const TL = await (await fetch('timeline.json')).json();
const LN = Object.fromEntries(TL.lines.map(l => [l.id, l])), DUR = TL.dur;
const at = id => LN[id].t, end = id => LN[id].t + LN[id].d;
const dot = (x, y, r, c, a = 1) => { g.globalAlpha = a; g.fillStyle = c; g.beginPath(); g.arc(x, y, r, 0, TAU); g.fill(); g.globalAlpha = 1; };
const pop = (t, t0, d = .35) => { const u = clamp((t - t0) / d); return u <= 0 ? 0 : 1 + Math.sin(u * Math.PI) * .2 * (1 - u) - (1 - eo(u)) * 0; };

// ───────── who is talking, and how open their mouth is
const speaking = t => TL.lines.find(l => t >= l.t && t < l.t + l.d);
function mouthOf(who, t) {
  const l = TL.lines.find(l => (l.who === who || l.who === 'all') && t >= l.t && t < l.t + l.d); if (!l) return 0;
  const k = (t - l.t) * 30, i = Math.floor(k), a = l.mouth[i] || 0, b = l.mouth[i + 1] || 0; return lerp(a, b, k - i);
}

// ───────── the cast: world position, radius, depth (parallax), when they arrive, colours
const C = {
  jupiter: { x: 790, y: 830, r: 185, z: .82, in: -1, col: '#e3b07c' },
  mars: { x: 190, y: 780, r: 82, z: .9, in: -1, col: '#e0623e' },
  earth: { x: 430, y: 1090, r: 118, z: 1, in: -1 },
  mercury: { x: 215, y: 1330, r: 66, z: 1.08, in: at('07') - .45 },
  venus: { x: 770, y: 1290, r: 122, z: 1.05, in: at('09') - .55, col: '#f2d48a' },
};
const ORDER = ['jupiter', 'mars', 'earth', 'venus', 'mercury'];   // back to front
const NAME = { earth: 'EARTH', jupiter: 'JUPITER', mars: 'MARS', mercury: 'MERCURY', venus: 'VENUS', all: 'EVERYONE' };
const TAG = { earth: '#4fa3ff', jupiter: '#e8a25a', mars: '#ff6a4d', mercury: '#b9bccb', venus: '#ffc73a', all: '#ffffff' };
// moods over time: [from, mood]
const MOOD = {
  earth: [[0, 'happy'], [at('03'), 'smug'], [at('05'), 'happy'], [at('06') + .9, 'annoyed'], [at('08'), 'keen'], [at('09'), 'happy'], [at('10') - .05, 'scared'], [at('11') + 2, 'worried'], [at('16'), 'love']],
  jupiter: [[0, 'smug'], [at('03') + .6, 'worried'], [at('04'), 'smug'], [at('05'), 'annoyed'], [at('10') - .05, 'scared'], [at('11') + 2, 'worried'], [at('13'), 'annoyed'], [at('14'), 'scared'], [at('16'), 'love']],
  mars: [[0, 'annoyed'], [at('06'), 'smug'], [at('07') + .6, 'scared'], [at('08'), 'annoyed'], [at('10') - .05, 'scared'], [at('11') + 2, 'worried'], [at('16'), 'love']],
  mercury: [[0, 'keen'], [at('09') + .4, 'worried'], [at('10') - .05, 'scared'], [at('16'), 'love']],
  venus: [[0, 'smug']],
};
const moodOf = (w, t) => { let m = MOOD[w][0][1]; for (const [t0, mm] of MOOD[w]) if (t >= t0) m = mm; return m; };

// ───────── camera: drifts toward the speaker; a punch-in on "WHAT"
function camera(t) {
  const keys = TL.lines.map(l => { const c = l.who === 'all' ? { x: 520, y: 1060 } : C[l.who]; return { t: l.t - .25, x: c.x, y: c.y, z: l.who === 'all' ? 1.0 : 1.07 }; });
  let fx = 540, fy = 1060, fz = 1;
  for (const k of keys) { const u = ss(seg(t, k.t, k.t + .7)); fx = lerp(fx, lerp(540, k.x, .35), u); fy = lerp(fy, lerp(1060, k.y, .3), u); fz = lerp(fz, k.z, u); }
  const pu = seg(t, at('10'), at('10') + .12) * (1 - ss(seg(t, at('10') + .3, at('11') + .4))); fz += .14 * pu;
  const sh = pu > 0 ? Math.sin(t * 90) * 10 * pu : 0;
  return { x: fx + sh, y: fy, z: fz };
}
const proj = (cam, c) => ({ x: CX + (c.x - cam.x) * cam.z * c.z + (cam.x - 540) * (1 - c.z) * .0, y: 1060 + (c.y - cam.y) * cam.z * c.z, s: cam.z * (.9 + .1 * c.z) });

// ───────── bodies
function bands(x, y, r, col, spin, list, spot) {
  g.save(); g.beginPath(); g.arc(x, y, r, 0, TAU); g.clip(); g.fillStyle = col; g.fillRect(x - r, y - r, 2 * r, 2 * r);
  for (const [v, h, c] of list) { g.fillStyle = c; g.beginPath(); g.ellipse(x, y + v * r, r * 1.2, h * r, 0, 0, TAU); g.fill(); }
  if (spot) { const a = spin % TAU, vis = Math.cos(a); if (vis > -.05) { g.fillStyle = spot; g.beginPath(); g.ellipse(x + Math.sin(a) * r * .8, y + r * .38, r * .22 * Math.max(.15, vis), r * .12, 0, 0, TAU); g.fill(); } }
  g.fillStyle = 'rgba(30,20,60,.3)'; g.beginPath(); g.arc(x + r * .35, y + r * .1, r * 1.1, 0, TAU); g.arc(x - r * .15, y - r * .08, r * 1.02, 0, TAU, true); g.fill('evenodd');
  g.restore();
}
function shades(r, slide = 0) {                                   // sunglasses; slide 1 = down the nose
  g.save(); g.translate(0, -r * .05 + slide * r * .14); g.fillStyle = '#16122e';
  for (const s of [-1, 1]) { g.beginPath(); g.ellipse(s * r * .3, 0, r * .2, r * .13, 0, 0, TAU); g.fill(); }
  g.fillRect(-r * .12, -r * .04, r * .24, r * .05); g.fillStyle = 'rgba(255,255,255,.55)';
  for (const s of [-1, 1]) { g.beginPath(); g.ellipse(s * r * .3 - r * .07, -r * .04, r * .05, r * .025, -.4, 0, TAU); g.fill(); }
  g.restore();
}
function openMouth(r, o) {
  if (o < .06) return; const w = r * (.1 + .05 * o), h = r * (.03 + .13 * o);
  g.fillStyle = P.navy; g.beginPath(); g.ellipse(0, r * .25, w, h, 0, 0, TAU); g.fill();
  g.fillStyle = '#ff6b8a'; g.beginPath(); g.ellipse(0, r * .25 + h * .5, w * .6, h * .38, 0, 0, TAU); g.fill();
}
function body(w, x, y, r, t, mood, look, spin) {
  if (w === 'earth') K.earth(x, y, r, t, mood, { rot: spin, look });
  else if (w === 'mercury') {                                   // Mercury: darker brown-grey, packed with craters, bright ray craters, a sun-baked warm side
    glow(x, y, r * 1.5, '255,170,110', .18);
    g.save(); g.beginPath(); g.arc(x, y, r, 0, TAU); g.clip();
    g.fillStyle = '#8a7d74'; g.fillRect(x - r, y - r, 2 * r, 2 * r);
    for (const [u, v, s, c] of [[-.4, -.3, .55, '#776a62'], [.45, .35, .5, '#6f625a'], [.1, -.7, .35, '#9a8c82'], [-.6, .5, .4, '#7d7068']]) { g.fillStyle = c; g.beginPath(); g.ellipse(x + u * r, y + v * r, s * r, s * r * .7, u, 0, TAU); g.fill(); }
    const R = mulberry(31);
    for (let k = 0; k < 16; k++) { const cx = x + (R() * 2 - 1) * r * .9, cy = y + (R() * 2 - 1) * r * .9, cr = r * (.05 + R() * .11);
      if (Math.abs(cx - x) < r * .62 && cy - y > -r * .35 && cy - y < r * .5) continue;
      g.fillStyle = '#5e524b'; g.beginPath(); g.arc(cx, cy, cr, 0, TAU); g.fill(); g.strokeStyle = 'rgba(220,205,190,.55)'; g.lineWidth = r * .02; g.beginPath(); g.arc(cx, cy, cr, Math.PI * 1.1, Math.PI * 1.9); g.stroke(); }
    g.strokeStyle = 'rgba(240,232,220,.6)'; g.lineWidth = r * .025; g.lineCap = 'round';      // a bright ray crater
    for (let k = 0; k < 9; k++) { const a = k / 9 * TAU + .3, cx = x + r * .5, cy = y - r * .45; g.beginPath(); g.moveTo(cx + Math.cos(a) * r * .07, cy + Math.sin(a) * r * .07); g.lineTo(cx + Math.cos(a) * r * (.3 + .15 * (k % 2)), cy + Math.sin(a) * r * (.3 + .15 * (k % 2))); g.stroke(); }
    dot(x + r * .5, y - r * .45, r * .07, '#f2ebe0');
    const hot = g.createLinearGradient(x - r, y, x + r, y); hot.addColorStop(0, 'rgba(255,140,60,.45)'); hot.addColorStop(.45, 'rgba(255,140,60,0)'); g.fillStyle = hot; g.fillRect(x - r, y - r, 2 * r, 2 * r);
    g.fillStyle = 'rgba(30,20,60,.32)'; g.beginPath(); g.arc(x + r * .35, y + r * .1, r * 1.1, 0, TAU); g.arc(x - r * .15, y - r * .08, r * 1.02, 0, TAU, true); g.fill('evenodd');
    g.restore(); g.save(); g.translate(x, y); K.face(r, mood, t, look, 2.2); g.restore(); }
  else {
    const c = C[w];
    if (w === 'jupiter') { glow(x, y, r * 1.5, '255,210,160', .2); bands(x, y, r, c.col, spin, [[-.62, .1, '#c98c5a'], [-.3, .09, '#f3d2a6'], [.0, .11, '#c4825a'], [.3, .08, '#f0caa0'], [.6, .1, '#b97a52']], '#c2482e'); }
    if (w === 'mars') { glow(x, y, r * 1.5, '255,120,90', .22); bands(x, y, r, c.col, spin, [[-.25, .14, '#c24d2e'], [.35, .12, '#c85532']], '#a83a22'); g.fillStyle = 'rgba(255,255,255,.85)'; g.beginPath(); g.ellipse(x, y - r * .92, r * .38, r * .12, 0, 0, TAU); g.fill(); }
    if (w === 'venus') { glow(x, y, r * 1.6, '255,220,140', .3); bands(x, y, r, c.col, spin, [[-.5, .12, '#e8c070'], [-.12, .09, '#fbe3a8'], [.25, .14, '#e3b664'], [.62, .1, '#f6dc9c']], null); }
    g.save(); g.translate(x, y); K.face(r, mood, t, look, w.length); g.restore();
  }
}

// ───────── one character, with entrance, talking bounce, props
function character(w, t, cam, spk) {
  const c = C[w]; if (c.in > 0 && t < c.in) return;
  let { x, y, s } = proj(cam, c), r = c.r * s;
  const e = c.in > 0 ? clamp((t - c.in) / .6) : 1;
  if (w === 'mercury' && e < 1) { x -= (1 - eo(e)) * 400; y -= Math.abs(Math.sin(e * Math.PI * 2.5)) * 120 * (1 - e); }
  if (w === 'venus' && e < 1) { x += (1 - eo(e)) * 520; y -= Math.sin(e * Math.PI) * 40; }
  const mo = mouthOf(w, t); y -= mo * r * .05; y += Math.sin(t * 1.6 + c.r) * 6;
  if (w === 'jupiter') { const shr = 1 - .07 * ss(seg(t, at('04'), at('04') + .4)) * (1 - ss(seg(t, at('05'), at('05') + .5))); r *= shr; }
  const sx = spk && spk.who !== 'all' && spk.who !== w ? proj(cam, C[spk.who]).x : (w === 'venus' ? x - 100 : CX);
  let look = clamp((sx - x) / 300, -1, 1); if (t > at('16')) look = clamp((proj(cam, C.venus).x - x) / 300, -1, 1); if (w === 'venus' && t > at('16')) look = 0;
  // spin speeds (what the beat is about)
  let spin = t * .3;
  if (w === 'jupiter') spin = t * .3 + 14 * ss(seg(t, at('03'), at('03') + .3)) * (t - at('03')) * (t < at('05') ? 1 : 0) + (t >= at('05') ? 14 * (at('05') - at('03')) : 0);
  if (w === 'mercury') spin = t * .08;
  if (w === 'venus') spin = -t * .05 - (t > at('14') ? (t - at('14')) * .9 : 0);
  // spotlight on Venus at the end
  if (w === 'venus' && t > at('16') - .2) { const a = ss(seg(t, at('16') - .2, at('16') + .4)); g.save(); g.globalAlpha = .22 * a; const gr = g.createLinearGradient(x, 0, x, y); gr.addColorStop(0, 'rgba(255,240,190,0)'); gr.addColorStop(1, 'rgba(255,240,190,1)'); g.fillStyle = gr; g.beginPath(); g.moveTo(x - 60, 0); g.lineTo(x + 60, 0); g.lineTo(x + r * 1.5, y + r); g.lineTo(x - r * 1.5, y + r); g.fill(); g.restore(); }
  body(w, x, y, r, t, moodOf(w, t), look, spin);
  g.save(); g.translate(x, y); openMouth(r, mo);
  if (w === 'venus') { const sl = t > at('17') ? Math.sin(clamp((t - at('17')) / .6) * Math.PI) : 0; shades(r, sl); }
  g.restore();
  // props
  if (w === 'earth') { g.save(); g.translate(x + r * .95, y + r * .45); g.rotate(-.5); g.fillStyle = '#2a2850'; g.fillRect(-7, 0, 14, r * .55); g.fillStyle = '#5a5f8a'; g.beginPath(); g.arc(0, 0, 17, 0, TAU); g.fill(); g.restore(); }
  if (w === 'venus') { const cx = x - r * 1.05, cy = y + r * .55; g.fillStyle = 'rgba(255,255,255,.85)'; g.beginPath(); g.moveTo(cx - 24, cy - 40); g.lineTo(cx + 24, cy - 40); g.lineTo(cx + 18, cy + 30); g.lineTo(cx - 18, cy + 30); g.fill(); g.fillStyle = '#ff7aa8'; g.fillRect(cx - 21, cy - 18, 42, 46); g.strokeStyle = '#3fe0ff'; g.lineWidth = 6; g.beginPath(); g.moveTo(cx + 6, cy - 40); g.lineTo(cx + 18, cy - 78); g.stroke(); }
  if (w === 'jupiter' && t > at('04') - .1 && t < at('05') + .3) { const a = fadeIO(t, at('04') - .1, at('05') + .3); g.save(); g.globalAlpha = a; g.fillStyle = '#7fd3ff'; const dx = x + r * .62, dy = y - r * .55 + ((t - at('04')) * 40) % 60; g.beginPath(); g.moveTo(dx, dy - 26); g.quadraticCurveTo(dx + 18, dy + 4, dx, dy + 14); g.quadraticCurveTo(dx - 18, dy + 4, dx, dy - 26); g.fill(); g.restore(); }
  if (w === 'jupiter' && t > at('03') && t < at('05')) { const a = fadeIO(t, at('03'), at('05')); g.save(); g.globalAlpha = a * .8; g.strokeStyle = '#fff'; g.lineWidth = 6; g.lineCap = 'round'; for (let k = 0; k < 4; k++) { const yy = y - r * .6 + k * r * .4; g.beginPath(); g.moveTo(x - r * 1.35, yy); g.lineTo(x - r * 1.1, yy); g.stroke(); } g.restore(); }
  if (w === 'mercury' && t > at('12') - .1 && t < at('13') + .4) { const a = fadeIO(t, at('12') - .1, at('13') + .4), on = Math.floor(t * 8) % 2; g.save(); g.globalAlpha = a; glow(x, y - r * 1.25, 90, on ? '255,60,80' : '60,140,255', .7); g.fillStyle = on ? '#ff3b5c' : '#3f8cff'; g.beginPath(); g.arc(x, y - r * 1.05, 26, Math.PI, 0); g.fill(); g.fillStyle = '#d9dbe8'; g.fillRect(x - 32, y - r * 1.05, 64, 12); g.restore(); }
  if (w === 'jupiter' && t > at('13') && t < at('14') + .3) { /* squint handled by mood */ }
  return { x, y, r };
}
const fadeIO = (t, a, b, d = .25) => ss(seg(t, a, a + d)) * (1 - ss(seg(t, b - d, b)));

// ───────── spin arrows (line 14): everyone else ↺, Venus ↻
function spinArrow(x, y, r, dir, col, a, t) {
  if (a <= 0) return; g.save(); g.globalAlpha = a; g.strokeStyle = col; g.lineWidth = 10; g.lineCap = 'round';
  const a0 = -2.4 + (dir > 0 ? t * 2 : -t * 2) % .6, a1 = a0 + 1.8;
  g.beginPath(); g.ellipse(x, y, r * 1.32, r * .5, 0, a0, a1); g.stroke();
  const ae = dir > 0 ? a1 : a0, px = x + Math.cos(ae) * r * 1.32, py = y + Math.sin(ae) * r * .5, tx = -Math.sin(ae) * dir, ty = Math.cos(ae) * .38 * dir, n = Math.hypot(tx, ty);
  g.fillStyle = col; g.beginPath(); g.moveTo(px + tx / n * 26, py + ty / n * 26); g.lineTo(px - ty / n * 18, py + tx / n * 18); g.lineTo(px + ty / n * 18, py - tx / n * 18); g.fill();
  g.restore();
}

// ───────── UI: pinned title, HUD, stat cards, bars, captions
const REVEAL = [['jupiter', '03', '~10 h'], ['earth', '05', '~24 h'], ['mars', '06', '24 h 37 m'], ['mercury', '07', '59 days'], ['venus', '09', '243 days']];
function title(t) {
  g.fillStyle = 'rgba(8,6,30,.55)'; g.fillRect(0, 0, W, 445);
  text('WHO HAS THE', CX, 150, 70, P.white, 1000, P.navy, 14);
  text('LONGEST DAY?', CX, 245, 96, P.gold, 1000, P.navy, 16);
  g.fillStyle = 'rgba(255,255,255,.12)'; g.beginPath(); g.roundRect(CX - 170, 280, 340, 56, 28); g.fill();
  text('1 day = 1 spin', CX, 320, 34, '#d9d4ff', 900, null, 0);
  // HUD: shortest → longest
  REVEAL.forEach(([w, id, val], i) => {
    const x = 170 + i * 185, y = 383, on = t >= at(id), k = pop(t, at(id));
    g.fillStyle = 'rgba(255,255,255,.14)'; g.beginPath(); g.arc(x, y, 14, 0, TAU); g.fill();
    if (on) { const s = Math.max(.01, k); dot(x, y, 14 * s, w === 'venus' ? P.gold : TAG[w]); if (w === 'venus') glow(x, y, 40, '255,199,58', .5); }
    text(on ? val : '?', x, y + 46, 24, on ? (w === 'venus' ? P.gold : '#d9d4ff') : 'rgba(255,255,255,.35)', 900, null, 0);
    if (i < 4) { g.fillStyle = 'rgba(255,255,255,.18)'; g.fillRect(x + 22, y - 2, 141, 4); }
  });
}
function statCard(t) {
  for (let i = 0; i < REVEAL.length; i++) {
    const [w, id, val] = REVEAL[i], t0 = at(id), t1 = i < 4 ? at(REVEAL[i + 1][1]) - .05 : at('11') - .1;
    if (t < t0 - .05 || t > t1) continue;
    const k = pop(t, t0, .4), a = 1 - ss(seg(t, t1 - .2, t1)); if (k <= 0) continue;
    g.save(); g.globalAlpha = a; g.translate(CX, 500); g.scale(k, k);
    g.fillStyle = 'rgba(12,10,44,.85)'; g.beginPath(); g.roundRect(-330, -62, 660, 124, 62); g.fill();
    g.strokeStyle = w === 'venus' ? P.gold : TAG[w]; g.lineWidth = 6; g.stroke();
    text(NAME[w], -40, 18, 46, TAG[w], 1000, null, 0, 'right'); text('·', 0, 18, 46, P.white, 1000, null, 0);
    text({ '~10 h': '~10 HOURS', '~24 h': '~24 HOURS', '24 h 37 m': '24 H 37 MIN' }[val] || val.toUpperCase(), 40, 18, 52, P.white, 1000, null, 0, 'left');
    g.restore();
  }
}
function dayYearBars(t) {
  const t0 = at('11'), t1 = at('12') + .1; if (t < t0 - .1 || t > t1) return;
  const a = fadeIO(t, t0 - .1, t1, .3);
  g.save(); g.globalAlpha = a; g.fillStyle = 'rgba(8,6,30,.82)'; g.beginPath(); g.roundRect(60, 470, 960, 420, 40); g.fill();
  text('VENUS', CX, 545, 46, P.gold, 1000, null, 0);
  const u = clamp((t - t0 - .3) / 2.6), DAY = 243, YEAR = 224.7, MAXW = 640, days = u * 260;
  for (const [lab, val, y, col] of [['1 YEAR', YEAR, 650, '#7fd3ff'], ['1 DAY', DAY, 790, P.gold]]) {
    text(lab, 100, y + 14, 40, P.white, 1000, null, 0, 'left');
    g.fillStyle = 'rgba(255,255,255,.12)'; g.beginPath(); g.roundRect(290, y - 26, MAXW, 52, 26); g.fill();
    const f = Math.min(days, val) / 260; g.fillStyle = col; g.beginPath(); g.roundRect(290, y - 26, Math.max(52, MAXW * f), 52, 26); g.fill();
    const shown = Math.round(Math.min(days, val)); text(`${shown} days`, 300 + MAXW * f - 12, y + 12, 32, P.navy, 1000, null, 0, 'right');
    if (days >= val) { const k = pop(t, t0 + .3 + val / 260 * 2.6); if (k > 0) { g.save(); g.translate(290 + MAXW * val / 260 + 38, y); g.scale(k, k); dot(0, 0, 24, col); text('✓', 0, 12, 34, P.navy, 1000, null, 0); g.restore(); } }
  }
  const k = pop(t, t0 + 2.95); if (k > 0) { g.save(); g.translate(CX, 865); g.scale(k, k); text('DAY  >  YEAR', 0, 0, 46, P.white, 1000, P.navy, 12); g.restore(); }
  g.restore();
}
function captions(t) {
  const l = TL.lines.find(l => t >= l.t - .05 && t < l.t + l.d + .35); if (!l) return;
  const k = pop(t, l.t - .05, .25), a = 1 - ss(seg(t, l.t + l.d + .2, l.t + l.d + .35));
  g.save(); g.globalAlpha = a; g.translate(CX, 1560); g.scale(.92 + .08 * Math.min(1, k), .92 + .08 * Math.min(1, k));
  g.font = '1000 34px NU'; const tw = g.measureText(NAME[l.who]).width + 50;
  g.fillStyle = TAG[l.who]; g.beginPath(); g.roundRect(-tw / 2, -96, tw, 52, 26); g.fill(); text(NAME[l.who], 0, -58, 34, P.navy, 1000, null, 0);
  const KEYW = /^(tiny|winning\?|Earth\.|ten|twenty-four|forty|fifty-nine|two|hundred|forty-three|twenty-five|longer|backwards|west|slow!?|day|year\.?|WHAT\?!)/i;
  const words = l.text.replace(/^\.\.\. /, '').split(' '); g.font = '1000 66px NU';
  const rows = [[]]; let rw = 0; for (const w of words) { const ww = g.measureText(w + ' ').width; if (rw + ww > 920 && rows[rows.length - 1].length) { rows.push([]); rw = 0; } rows[rows.length - 1].push([w, ww]); rw += ww; }
  rows.forEach((row, ri) => { let x = -row.reduce((p, w) => p + w[1], 0) / 2; for (const [w, ww] of row) { text(w, x, 30 + ri * 80, 66, KEYW.test(w) ? P.gold : P.white, 1000, P.navy, 14, 'left'); x += ww; } });
  g.restore();
}

// ───────── Venus ground shot (line 15): the Sun comes up in the west
function venusGround(t, a) {
  if (a <= 0) return; const u = clamp((t - at('15') + .3) / 3);
  g.save(); g.globalAlpha = a;
  const sky = g.createLinearGradient(0, 0, 0, H); sky.addColorStop(0, '#6b3a1e'); sky.addColorStop(.45, '#c9702e'); sky.addColorStop(.62, '#e8a04a'); sky.addColorStop(1, '#5a2e14'); g.fillStyle = sky; g.fillRect(0, 0, W, H);
  const sx = 230, sy = 1080 - u * 260; glow(sx, sy, 320, '255,230,170', .45); dot(sx, sy, 70, 'rgba(255,240,200,.75)');
  for (let k = 0; k < 7; k++) { const yy = 520 + k * 95, off = (t * (18 + k * 6) + k * 170) % 1400 - 200; g.fillStyle = `rgba(${150 + k * 12},${80 + k * 8},40,.35)`; for (let j = -1; j < 3; j++) { g.beginPath(); g.ellipse(off + j * 700 - 300, yy, 420, 34 + k * 3, 0, 0, TAU); g.fill(); } }
  // ground with perspective lines
  const hy = 1180; g.fillStyle = '#4a2410'; g.fillRect(0, hy, W, H - hy);
  g.strokeStyle = 'rgba(255,170,90,.25)'; g.lineWidth = 3; for (let k = -8; k <= 8; k++) { g.beginPath(); g.moveTo(CX + k * 30, hy); g.lineTo(CX + k * 260, H); g.stroke(); }
  for (let k = 1; k < 9; k++) { const yy = hy + (H - hy) * (k / 9) ** 1.8; g.beginPath(); g.moveTo(0, yy); g.lineTo(W, yy); g.stroke(); }
  const R = mulberry(9); for (let k = 0; k < 14; k++) { const d = .2 + R() * .8, x = R() * W, y = hy + 20 + d * 380, s = 14 + d * 60; g.fillStyle = '#2f160a'; g.beginPath(); g.ellipse(x, y, s * 1.4, s * .7, 0, Math.PI, TAU); g.fill(); }
  // compass
  g.save(); g.translate(CX, 1335); g.fillStyle = 'rgba(12,10,44,.75)'; g.beginPath(); g.roundRect(-300, -50, 600, 100, 50); g.fill();
  text('W', -230, 18, 52, P.gold, 1000, null, 0); text('E', 230, 18, 52, '#d9d4ff', 1000, null, 0); text('← SUNRISE', -60, 16, 38, P.white, 1000, null, 0); g.restore();
  const k = pop(t, at('15') + .2); if (k > 0) { g.save(); g.translate(CX, 500); g.scale(k, k); g.fillStyle = 'rgba(12,10,44,.8)'; g.beginPath(); g.roundRect(-300, -58, 600, 116, 58); g.fill(); text('ON VENUS', 0, 18, 56, P.gold, 1000, null, 0); g.restore(); }
  g.restore();
}

// ───────── frame
function render(t) {
  g.setTransform(1, 0, 0, 1, 0, 0); g.globalAlpha = 1;
  const cam = camera(t), spk = speaking(t);
  K.bg(t);
  const ground = fadeIO(t, at('15') - .35, at('16') - .1, .35);
  if (ground < 1) {
    const out = TL.lines.find(l => l.id === '11'), dim = fadeIO(t, at('11') - .1, at('12') + .1, .3) * .55;
    // spin arrows (line 14)
    const sa = fadeIO(t, at('14') + .9, at('15') - .1);
    for (const w of ORDER) { const p = character(w, t, cam, spk); C[w].p = p; }
    if (sa > 0) { spinArrow(C.earth.p.x, C.earth.p.y, C.earth.p.r, -1, '#7fd3ff', sa, t); spinArrow(C.venus.p.x, C.venus.p.y, C.venus.p.r, 1, P.gold, sa, t);
      text('everyone else', C.earth.p.x, C.earth.p.y - C.earth.p.r * 1.5, 34, '#7fd3ff', 1000, P.navy, 10, 'center', sa); text('me', C.venus.p.x, C.venus.p.y - C.venus.p.r * 1.45, 40, P.gold, 1000, P.navy, 10, 'center', sa); }
    if (dim > 0) { g.fillStyle = `rgba(5,4,20,${dim})`; g.fillRect(0, 0, W, H); }
  }
  venusGround(t, ground);
  title(t); statCard(t); dayYearBars(t);
  // the ask at the end
  const ca = pop(t, at('17') + .4, .4); if (ca > 0) { g.save(); g.translate(CX, 520); g.scale(ca, ca); g.fillStyle = 'rgba(12,10,44,.88)'; g.beginPath(); g.roundRect(-450, -80, 900, 160, 40); g.fill(); g.strokeStyle = P.gold; g.lineWidth = 5; g.stroke(); text("Which planet's day", 0, -10, 50, P.white, 1000, null, 0); text('would YOU survive? ↓', 0, 52, 50, P.gold, 1000, null, 0); g.restore(); }
  captions(t);
  const fo = seg(t, DUR - .5, DUR); if (fo > 0) { g.fillStyle = `rgba(0,0,0,${fo})`; g.fillRect(0, 0, W, H); }
}

// ───────── thumbnail (?thumb=1): its own composition, not a frame from the film
function thumb() {
  g.setTransform(1, 0, 0, 1, 0, 0); K.bg(3);
  glow(CX, 1050, 700, '255,200,90', .35);
  for (let k = 0; k < 18; k++) { const a = k / 18 * TAU; g.save(); g.globalAlpha = .1; g.fillStyle = '#ffd34a'; g.beginPath(); g.moveTo(CX, 1050); g.arc(CX, 1050, 1300, a, a + TAU / 36); g.fill(); g.restore(); }
  const cam = { x: 540, y: 1060, z: 1 };
  const place = { jupiter: [880, 720, 150], mars: [170, 690, 90], earth: [170, 1430, 120], mercury: [900, 1470, 80] };
  const mood0 = moodOf; 
  for (const [w, [x, y, r]] of Object.entries(place)) { body(w, x, y, r, 1.3, 'scared', w === 'jupiter' || w === 'mercury' ? -1 : 1, 1); g.save(); g.translate(x, y); openMouth(r, .9); g.restore(); }
  // sweat drops on the onlookers
  for (const [x, y] of [[960, 600], [230, 610], [250, 1330]]) { g.fillStyle = '#7fd3ff'; g.beginPath(); g.moveTo(x, y - 30); g.quadraticCurveTo(x + 20, y + 4, x, y + 16); g.quadraticCurveTo(x - 20, y + 4, x, y - 30); g.fill(); }
  // Venus, huge, unbothered
  body('venus', CX, 1060, 290, 1.3, 'smug', 0, -.4); g.save(); g.translate(CX, 1060); shades(290, 0); g.restore();
  const cx = CX + 345, cy = 1200; g.save(); g.translate(cx, cy); g.scale(2.2, 2.2); g.fillStyle = 'rgba(255,255,255,.9)'; g.beginPath(); g.moveTo(-24, -40); g.lineTo(24, -40); g.lineTo(18, 30); g.lineTo(-18, 30); g.fill(); g.fillStyle = '#ff7aa8'; g.fillRect(-21, -18, 42, 46); g.strokeStyle = '#3fe0ff'; g.lineWidth = 6; g.beginPath(); g.moveTo(6, -40); g.lineTo(18, -78); g.stroke(); g.restore();
  // headline
  text('HER DAY IS', CX, 230, 110, P.white, 1000, P.navy, 20);
  text('LONGER THAN', CX, 360, 118, P.white, 1000, P.navy, 20);
  text('HER YEAR?!', CX, 505, 150, P.gold, 1000, P.navy, 24);
  g.save(); g.translate(CX, 1450); g.rotate(-.05); g.fillStyle = P.gold; g.beginPath(); g.roundRect(-250, -70, 500, 140, 70); g.fill(); text('243 DAYS', 0, 28, 84, P.navy, 1000, null, 0); g.restore();
}
const TH = new URLSearchParams(location.search).get('thumb');

// events for the mix: each line, plus card pops
const EV = TL.lines.map(l => ({ type: 'vo', id: l.id, t: l.t }));
window.EV = EV; window.DUR = DUR; window.render = render;
window.SUBS = TL.lines.map(l => ({ t0: l.t, t1: l.t + l.d + .3, text: `${NAME[l.who]}: ${l.text.replace(/^\.\.\. /, '')}` }));
if (TH) { window.render = () => thumb(); thumb(); } else render(+(new URLSearchParams(location.search).get('t') ?? 1.2));
window.READY = true;
