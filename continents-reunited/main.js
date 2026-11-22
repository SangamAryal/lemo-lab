// "What If All Continents Reunited?" — flat-vector explainer, vertical 1080×1920, canvas 2D, deterministic in t.
// Beyond Everything brand style (kit.js shared with the other films; geo.js draws the continents). Nineteen beats, one
// per line, built as "show, then reward": every scene is followed by a payoff fact (Pangaea, the fossils, 80 % of
// trade, Zion's dunes, the Himalaya-sized mountains, fingernail speed, the mammal study, the supercontinent cycle).
import * as K from './kit.js';
import * as G from './geo.js';
import { clamp, lerp, seg, ss, eio, eo, mulberry, TAU } from '/core/lib.js';
const { P, text, sparkle, glow, card, bubble, pop } = K;
import * as PR from './props.js';
const { stander, sky, ground, tree, cloud, thermo } = PR;

const W = 1080, H = 1920, CX = W / 2;
const cv = document.getElementById('c'), g = cv.getContext('2d');
K.setup(g, W, H); K.makeStars(110, 41); PR.setup(g, W, H); G.setup(g);
await document.fonts.load('900 80px NU'); await document.fonts.load('800 40px NU');
const words = await (await fetch('voices/words.json')).json();
const lines = await (await fetch('lines.json')).json();
const dur = await (await fetch('voices/dur.json')).json();

// ───────── timeline: one scene per line; takes are trimmed by tools/voice.py, so the line gap stays small
const IDS = lines.map(l => l.id), VO = {};
const LINE_GAP = .2, GAP = { s01: .3, s03: .3, s14: .35, s17: .3 };   // a beat after the crash, the fossils, before "don't panic" and the twist
{ let t = .25; for (const id of IDS) { VO[id] = +t.toFixed(3); t += dur[id] + (GAP[id] ?? LINE_GAP); } }
const LAST = IDS[IDS.length - 1], DUR = +(VO[LAST] + dur[LAST] + 1.3).toFixed(2);
const nrm = s => s.toLowerCase().replace(/[^a-z0-9]/g, '');
const at = (id, w, k = 0, e = 1) => { let n = 0; for (const x of words[id]) if (nrm(x[0]).startsWith(nrm(w)) && n++ === k) return VO[id] + Math.max(0, x[e]); throw new Error(`${w} in ${id}`); };
const S = [0, ...IDS.slice(1).map(id => VO[id] - .2), DUR];
const sceneAt = t => { let i = 0; while (i < S.length - 2 && t >= S[i + 1]) i++; return i; };
const XF = .4, LOOP = .7;
const T = {
  moving: at('s01', 'moving'), crash: at('s01', 'crash'), together: at('s01', 'together'),
  happened: at('s02', 'happened'), three: at('s02', 'three'), land: at('s02', 'land'), supercontinent: at('s02', 'supercontinent'), pangaea: at('s02', 'pangaea'),
  fossils: at('s03', 'fossils'), reptile: at('s03', 'reptile'), brazil: at('s03', 'brazil'), africa: at('s03', 'africa'),
  reunited: at('s04', 'reunited'),
  drive: at('s05', 'drive'), york: at('s05', 'york'), london: at('s05', 'london'), planes: at('s05', 'planes'), ferries: at('s05', 'ferries'),
  ships: at('s06', 'ships'), eighty: at('s06', 'eighty'), trade: at('s06', 'trade'), trucks: at('s06', 'trucks'), trains: at('s06', 'trains'),
  middle: at('s07', 'middle'), brutal: at('s07', 'brutal'), farther: at('s07', 'farther'), today7: at('s07', 'today'),
  ocean8: at('s08', 'ocean'), summers: at('s08', 'summers'), forty: at('s08', 'forty'), winters: at('s08', 'winters'), freeze: at('s08', 'freeze'),
  rain: at('s09', 'rain'), dry: at('s09', 'dry'), centre: at('s09', 'centre'), deserts: at('s09', 'deserts'),
  had: at('s10', 'had'), dunes: at('s10', 'dunes'), stone: at('s10', 'stone'), red: at('s10', 'red'), zion: at('s10', 'zion'),
  coasts: at('s11', 'coasts'), mega: at('s11', 'megamonsoons'), india: at('s11', 'india'),
  oneocean: at('s12', 'one'), fewer: at('s12', 'fewer'), shallow: at('s12', 'shallow'), life: at('s12', 'life'),
  collide: at('s13', 'collide'), crumples: at('s13', 'crumples'), mountains: at('s13', 'mountains'),
  central: at('s14', 'central'), himalayas: at('s14', 'himalayas'), today14: at('s14', 'today'), appalachians: at('s14', 'appalachians'),
  panic: at('s15', 'panic'), cant: at('s15', 'can'), suddenly: at('s15', 'suddenly'), fingernails: at('s15', 'fingernails'),
  next: at('s16', 'next'), two: at('s16', 'two'), million: at('s16', 'million'), away: at('s16', 'away'),
  study: at('s17', 'study'), hot: at('s17', 'hot'), mammals: at('s17', 'mammals'), tenth: at('s17', 'tenth'),
  twist: at('s18', 'twist'), three18: at('s18', 'three'), pangaea18: at('s18', 'pangaea'), latest: at('s18', 'latest'),
  planet: at('s19', 'planet'), continent19: at('s19', 'continent'), ocean19: at('s19', 'ocean'), already: at('s19', 'already'),
};

function tag(x, y, s, sub, k, col = P.gold) {
  if (k <= 0) return; g.save(); g.font = '1000 76px NU'; let w = Math.max(520, g.measureText(s).width + 120); if (sub) { g.font = '800 40px NU'; w = Math.max(w, g.measureText(sub).width + 90); } g.translate(x, y); g.scale(k, k); card(0, 0, w, sub ? 180 : 120, 1);
  text(s, 0, sub ? 8 : 22, 76, col, 1000, null, 0); if (sub) text(sub, 0, 62, 40, P.white, 800, null, 0); g.restore();
}
function stamp(s, x, y, px, col, k, rot = -.06, ol = P.navy) { if (k <= 0) return; g.save(); g.translate(x, y); g.scale(k, k); g.rotate(rot); text(s, 0, 0, px, col, 1000, ol, px * .16); g.restore(); }
const bg = (t, top = P.bg0, bot = P.bg1) => K.bg(t, top, bot, g.globalAlpha);
const shake = (t, a) => a > 0 ? [Math.sin(t * 53) * a, Math.cos(t * 47) * a] : [0, 0];
function cross(x, y, r, k) { if (k <= 0) return; g.save(); g.translate(x, y); g.scale(k, k); g.strokeStyle = P.red; g.lineWidth = 22; g.lineCap = 'round'; g.beginPath(); g.moveTo(-r, -r); g.lineTo(r, r); g.moveTo(r, -r); g.lineTo(-r, r); g.stroke(); g.restore(); }
function inArrows(x, y, r, t, a) {                                     // arrows pushing the land together
  if (a <= 0) return; for (let i = 0; i < 4; i++) { const q = i / 4 * TAU + .4, p = (t * .8 + i * .25) % 1, r0 = r * (1.55 - .25 * p);
    K.arrow(x + Math.cos(q) * r0, y + Math.sin(q) * r0, x + Math.cos(q) * (r0 - 110), y + Math.sin(q) * (r0 - 110), P.white, 14, a * (1 - p * .6)); }
}

// ───────── small props
function meso(x, y, s, t, fossil = 0, rot = 0) {                     // Mesosaurus: a slim freshwater reptile; fossil = bone-on-rock version
  g.save(); g.translate(x, y); g.rotate(rot); g.scale(s, s);
  if (fossil) { g.fillStyle = '#8a7a6a'; g.beginPath(); g.ellipse(0, 0, 170, 80, 0, 0, TAU); g.fill(); g.fillStyle = '#a8957f'; g.beginPath(); g.ellipse(-10, -8, 150, 62, 0, 0, TAU); g.fill(); }
  const col = fossil ? '#f4ead2' : '#5fae8a', sw = fossil ? 0 : Math.sin(t * 6) * 10;
  g.strokeStyle = col; g.fillStyle = col; g.lineCap = 'round';
  g.lineWidth = 16; g.beginPath(); g.moveTo(-40, 0); g.quadraticCurveTo(-90, 10 + sw, -140, -6 - sw); g.stroke();          // tail
  g.beginPath(); g.ellipse(0, 0, 50, 18, 0, 0, TAU); g.fill();                                                                  // body
  g.lineWidth = 8; g.beginPath(); g.moveTo(40, -2); g.lineTo(130, -10); g.stroke();                                             // long snout
  g.beginPath(); g.arc(52, -6, 14, 0, TAU); g.fill();
  g.lineWidth = 7; for (const [lx, d] of [[-25, 1], [25, 1], [-25, -1], [25, -1]]) { g.beginPath(); g.moveTo(lx, 0); g.lineTo(lx + 14, 30 * d); g.stroke(); }
  if (fossil) { g.strokeStyle = '#8a7a6a'; g.lineWidth = 3; for (let i = -3; i <= 3; i++) { g.beginPath(); g.moveTo(i * 12, -14); g.lineTo(i * 12, 14); g.stroke(); } }
  else { g.fillStyle = P.navy; g.beginPath(); g.arc(56, -10, 4, 0, TAU); g.fill(); }
  g.restore();
}
function car(x, y, s, t) {
  g.save(); g.translate(x, y + Math.sin(t * 20) * 2); g.scale(s, s);
  g.fillStyle = P.red; g.beginPath(); g.roundRect(-150, -70, 300, 80, 26); g.fill(); g.beginPath(); g.roundRect(-80, -130, 170, 70, [30, 40, 0, 0]); g.fill();
  g.fillStyle = '#9fe2ff'; g.beginPath(); g.roundRect(-64, -118, 66, 50, 10); g.fill(); g.beginPath(); g.roundRect(12, -118, 62, 50, [10, 26, 0, 0]); g.fill();
  g.fillStyle = '#ffe58a'; g.fillRect(135, -50, 16, 20);
  for (const wx of [-85, 85]) { g.fillStyle = P.navy; g.beginPath(); g.arc(wx, 10, 36, 0, TAU); g.fill(); g.fillStyle = '#c9ced9'; g.beginPath(); g.arc(wx, 10, 14, 0, TAU); g.fill(); g.strokeStyle = P.navy; g.lineWidth = 5; const a = t * 12; g.beginPath(); g.moveTo(wx + Math.cos(a) * 14, 10 + Math.sin(a) * 14); g.lineTo(wx - Math.cos(a) * 14, 10 - Math.sin(a) * 14); g.stroke(); }
  g.restore();
}
function plane(x, y, s) { g.save(); g.translate(x, y); g.scale(s, s); g.fillStyle = P.white; g.beginPath(); g.ellipse(0, 0, 110, 20, 0, 0, TAU); g.fill(); g.beginPath(); g.moveTo(-20, 0); g.lineTo(-60, -80); g.lineTo(-30, -80); g.lineTo(30, 0); g.lineTo(-30, 80); g.lineTo(-60, 80); g.closePath(); g.fill(); g.beginPath(); g.moveTo(-90, 0); g.lineTo(-110, -40); g.lineTo(-90, -40); g.lineTo(-70, 0); g.fill(); g.restore(); }
function ferry(x, y, s) { g.save(); g.translate(x, y); g.scale(s, s); g.fillStyle = P.white; g.beginPath(); g.moveTo(-110, -10); g.lineTo(110, -10); g.lineTo(80, 40); g.lineTo(-90, 40); g.fill(); g.fillStyle = '#ffe2b8'; g.fillRect(-60, -60, 110, 50); g.fillStyle = P.red; g.fillRect(10, -95, 26, 36); g.fillStyle = '#3d8be8'; g.fillRect(-120, 40, 240, 16); g.restore(); }
function ship(x, y, s, t, grey = 0) {
  g.save(); g.translate(x, y + Math.sin(t * 2) * 5); g.rotate(Math.sin(t * 1.6) * .02); g.scale(s, s);
  const cols = grey ? ['#8b8fa8', '#9ea2b8', '#7c809a', '#a8acc0'] : ['#ff6b5a', '#ffc73a', '#3fa8ff', '#5fcf7a'];
  for (let r = 0; r < 3; r++) for (let c = 0; c < 6; c++) { g.fillStyle = cols[(r * 3 + c * 2) % 4]; g.fillRect(-230 + c * 66, -60 - r * 44, 62, 40); }
  g.fillStyle = '#f2f2f8'; g.fillRect(170, -150, 70, 130); g.fillStyle = '#7fd3ff'; g.fillRect(180, -138, 50, 22);
  g.fillStyle = grey ? '#555a78' : P.navy; g.beginPath(); g.moveTo(-290, -20); g.lineTo(300, -20); g.lineTo(260, 60); g.lineTo(-260, 60); g.closePath(); g.fill();
  g.fillStyle = P.red; g.fillRect(-270, 30, 520, 14);
  g.restore();
}
function truck(x, y, s, t) {
  g.save(); g.translate(x, y); g.scale(s, s);
  g.fillStyle = '#e9ecf6'; g.beginPath(); g.roundRect(-220, -170, 290, 150, 10); g.fill(); g.fillStyle = '#ff6b5a'; g.fillRect(-220, -60, 290, 16);
  g.fillStyle = P.gold; g.beginPath(); g.roundRect(80, -140, 110, 120, [10, 40, 10, 10]); g.fill(); g.fillStyle = '#9fe2ff'; g.beginPath(); g.roundRect(120, -126, 56, 44, [6, 26, 6, 6]); g.fill();
  for (const wx of [-170, -90, 140]) { g.fillStyle = P.navy; g.beginPath(); g.arc(wx, -10, 30, 0, TAU); g.fill(); g.fillStyle = '#c9ced9'; g.beginPath(); g.arc(wx, -10, 11, 0, TAU); g.fill(); }
  g.restore();
}
function train(x, y, s, t) {
  g.save(); g.translate(x, y); g.scale(s, s);
  for (let i = 0; i < 4; i++) { const cx = -i * 250; g.fillStyle = i ? ['#3fa8ff', '#5fcf7a', '#ff9a5c'][i % 3] : P.red; g.beginPath(); g.roundRect(cx - 115, -140, 230, 120, i ? 12 : [12, 60, 12, 12]); g.fill();
    g.fillStyle = '#c9e9ff'; for (let w = 0; w < 3; w++) g.fillRect(cx - 95 + w * 66, -120, 46, 36);
    for (const wx of [-70, 70]) { g.fillStyle = P.navy; g.beginPath(); g.arc(cx + wx, -14, 22, 0, TAU); g.fill(); } }
  g.restore();
}
function sweat(x, y, t, a = 1) { if (a <= 0) return; g.save(); g.globalAlpha *= a; for (let i = 0; i < 3; i++) { const p = (t * 1.3 + i / 3) % 1; g.fillStyle = '#9fe2ff'; g.beginPath(); const xx = x + (i - 1) * 60, yy = y + p * 120; g.moveTo(xx, yy - 22); g.quadraticCurveTo(xx + 16, yy, xx, yy + 10); g.quadraticCurveTo(xx - 16, yy, xx, yy - 22); g.globalAlpha = a * (1 - p); g.fill(); } g.restore(); }
function snowflake(x, y, r, a = 1) { g.save(); g.globalAlpha *= a; g.translate(x, y); g.strokeStyle = P.white; g.lineWidth = r * .18; g.lineCap = 'round'; for (let i = 0; i < 3; i++) { g.rotate(Math.PI / 3); g.beginPath(); g.moveTo(-r, 0); g.lineTo(r, 0); g.stroke(); } g.restore(); }
function rainFall(x0, x1, y0, y1, t, n, a = 1, slant = .2) {
  if (a <= 0) return; const R = mulberry(9); g.save(); g.globalAlpha *= a; g.strokeStyle = 'rgba(200,225,255,.85)'; g.lineWidth = 5; g.lineCap = 'round';
  for (let i = 0; i < n; i++) { const x = x0 + R() * (x1 - x0), sp = 900 + R() * 600, y = y0 + ((R() * (y1 - y0) + t * sp) % (y1 - y0)); g.beginPath(); g.moveTo(x, y); g.lineTo(x - slant * 60, y + 60); g.stroke(); }
  g.restore();
}
function rainCloud(x, y, s, dark = 0) { g.save(); g.translate(x, y); g.scale(s, s); g.fillStyle = dark ? '#5d6488' : '#e8eefc'; for (const [cx, cy, r] of [[-110, 10, 70], [-40, -40, 95], [60, -20, 85], [130, 15, 60]]) { g.beginPath(); g.arc(cx, cy, r, 0, TAU); g.fill(); } g.fillRect(-170, 10, 330, 70); g.restore(); }
function dunes(y, t, a = 1) {
  if (a <= 0) return; g.save(); g.globalAlpha *= a;
  for (const [yy, c, amp, ph] of [[y - 140, '#f3c77a', 70, 0], [y - 60, '#e9b25e', 90, 1.7], [y + 30, '#dd9f4c', 80, 3.1]]) { g.fillStyle = c; g.beginPath(); g.moveTo(0, H); for (let x = 0; x <= W; x += 20) g.lineTo(x, yy - amp * Math.abs(Math.sin(x * .006 + ph))); g.lineTo(W, H); g.fill(); }
  g.restore();
}
function cliffs(y, k, t) {                                            // Zion-style red sandstone cliffs, with cross-bedding lines
  if (k <= 0) return; g.save(); g.globalAlpha *= clamp(k * 2);
  const blocks = [[-40, 340, 760, '#d4673f'], [260, 280, 560, '#e07a4a'], [520, 330, 860, '#c95a36'], [820, 300, 640, '#e3884f']];
  for (const [x, w, h, c] of blocks) { const hh = h * eo(k), top = y - hh; g.fillStyle = c; g.beginPath(); g.moveTo(x, y); g.lineTo(x + 20, top + 40); g.quadraticCurveTo(x + w * .5, top - 20, x + w - 20, top + 30); g.lineTo(x + w, y); g.fill();
    g.save(); g.clip(); g.strokeStyle = 'rgba(255,230,200,.28)'; g.lineWidth = 6; for (let yy = top + 60; yy < y; yy += 70) { g.beginPath(); g.moveTo(x, yy); g.quadraticCurveTo(x + w * .4, yy - 34, x + w, yy + 12); g.stroke(); } g.fillStyle = 'rgba(255,240,220,.25)'; g.fillRect(x, top - 30, w, Math.min(hh, 140)); g.restore(); }
  g.fillStyle = '#3fa35e'; for (let i = 0; i < 9; i++) { g.beginPath(); g.arc(40 + i * 125, y + 10, 34 + (i % 3) * 8, 0, TAU); g.fill(); }
  g.restore();
}
function umbrella(x, y, s, t) { g.save(); g.translate(x, y); g.scale(s, s); g.rotate(Math.sin(t * 7) * .15 - .2); g.strokeStyle = P.navy; g.lineWidth = 10; g.beginPath(); g.moveTo(0, 0); g.lineTo(0, 220); g.stroke(); g.fillStyle = P.red; g.beginPath(); g.arc(0, 0, 170, Math.PI, TAU); g.fill(); g.fillStyle = '#c93b54'; for (let i = 0; i < 4; i++) { g.beginPath(); g.arc(-127 + i * 85, 0, 43, Math.PI, TAU); g.fill(); } g.restore(); }
function palm(x, y, s, t, bend) {
  g.save(); g.translate(x, y); g.scale(s, s); g.strokeStyle = '#8a5a34'; g.lineWidth = 34; g.lineCap = 'round';
  const tx = 120 * bend + Math.sin(t * 6) * 20 * bend; g.beginPath(); g.moveTo(0, 0); g.quadraticCurveTo(20, -220, tx, -440); g.stroke();
  g.fillStyle = '#3fa35e'; for (let i = 0; i < 6; i++) { const q = -Math.PI / 2 + (i - 2.5) * .55 + bend * .9 + Math.sin(t * 9 + i) * .15 * bend; g.save(); g.translate(tx, -440); g.rotate(q); g.beginPath(); g.ellipse(110, 0, 120, 26, 0, 0, TAU); g.fill(); g.restore(); }
  g.restore();
}
function fish(x, y, s, t, col = '#ff8a3c', flip = 1) { g.save(); g.translate(x + Math.sin(t * 2 + x) * 10, y); g.scale(s * flip, s); g.fillStyle = col; g.beginPath(); g.ellipse(0, 0, 60, 34, 0, 0, TAU); g.fill(); g.beginPath(); g.moveTo(-50, 0); g.lineTo(-95, -32); g.lineTo(-95, 32); g.fill(); g.fillStyle = P.navy; g.beginPath(); g.arc(30, -8, 7, 0, TAU); g.fill(); g.restore(); }
function hand(x, y, s, grow) {                                         // a finger, nail growing
  g.save(); g.translate(x, y); g.scale(s, s); g.rotate(-.12);
  g.fillStyle = P.skin; g.beginPath(); g.roundRect(-90, -340, 180, 560, 90); g.fill(); g.fillStyle = P.skinD; g.fillRect(-90, 60, 180, 10); g.fillRect(-90, -100, 180, 8);
  g.fillStyle = '#ffd6dc'; g.beginPath(); g.roundRect(-62, -330 - grow * 60, 124, 160 + grow * 60, [60, 60, 30, 30]); g.fill();
  g.fillStyle = '#fff4f6'; g.beginPath(); g.roundRect(-62, -330 - grow * 60, 124, 30 + grow * 60, [60, 60, 0, 0]); g.fill();
  g.restore();
}
function mouse(x, y, s, t) { g.save(); g.translate(x, y + Math.abs(Math.sin(t * 6 + x)) * -8); g.scale(s, s); g.fillStyle = '#b8a8c8'; g.beginPath(); g.ellipse(0, 0, 50, 34, 0, 0, TAU); g.fill(); g.beginPath(); g.arc(30, -32, 18, 0, TAU); g.arc(-6, -34, 18, 0, TAU); g.fill(); g.strokeStyle = '#b8a8c8'; g.lineWidth = 6; g.beginPath(); g.moveTo(-48, 6); g.quadraticCurveTo(-90, 0, -96, -30); g.stroke(); g.fillStyle = P.navy; g.beginPath(); g.arc(30, -6, 6, 0, TAU); g.fill(); g.fillStyle = '#ff8ab2'; g.beginPath(); g.arc(50, 2, 6, 0, TAU); g.fill(); g.restore(); }
function ridge(y, hs, t, snow = 0, cols = ['#7a6aa8', '#8e7fc0'], round = 0) {   // a mountain range from a height profile; round 0 = jagged peaks, 1 = worn-down hills
  const n = hs.length, dx = W / (n - 1);
  cols.forEach((c, j) => { g.fillStyle = c; g.beginPath(); g.moveTo(0, H); g.lineTo(-dx, y);
    for (let i = 0; i < n; i++) { const x = i * dx + (j ? dx / 2 : 0), h = hs[(i + j * 2) % n] * (j ? .8 : 1), vx = x - dx / 2, vy = y - h * .35 * (1 - round);
      g.lineTo(vx, vy); if (round > .5) g.quadraticCurveTo(x, y - h * 1.9, x + dx / 2, y - h * .2); else g.lineTo(x, y - h); }
    g.lineTo(W + dx, y); g.lineTo(W, H); g.fill();
    if (snow > 0 && j) { g.fillStyle = `rgba(255,255,255,${snow})`; for (let i = 0; i < n; i++) { const x = i * dx + dx / 2, h = hs[(i + 2) % n] * .8; if (h < 250) continue; const f = h / 600; g.beginPath(); g.moveTo(x, y - h); g.lineTo(x - 60 * f, y - h + 90 * f); g.lineTo(x - 15 * f, y - h + 70 * f); g.lineTo(x + 20 * f, y - h + 95 * f); g.lineTo(x + 55 * f, y - h + 80 * f); g.closePath(); g.fill(); } } });
}
// ───────── scenes
const SC = [];
SC[0] = (t) => {                                                    // hook: every continent is moving, and will crash back together
  bg(t);
  const kc = ss(seg(t, T.crash - .3, T.together + .3)), [sx, sy] = shake(t, 9 * Math.max(0, 1 - Math.abs(t - T.crash - .2) / .5));
  inArrows(CX, 1050, 300, t, ss(seg(t, T.moving - .3, T.moving + .2)));
  G.globe(CX + sx, 1050 + sy, 300, t, { k: .42 * kc, lon0: 10 + t * 2, lat0: 10, mood: t < T.moving ? 'happy' : t < T.crash - .1 ? 'worried' : 'scared', look: kc > .5 ? Math.sin(t * 5) * .5 : 0 });
  g.save(); g.translate(CX, 300); text('WHAT IF ALL CONTINENTS', 0, -10, 76, P.white, 1000, P.navy, 16); text('REUNITED?', 0, 130, 150, P.gold, 1000, P.navy, 22); g.restore();
};
SC[1] = (t) => {                                                    // the reward: it happened before, Pangaea
  bg(t);
  const k = eio(seg(t, T.three - .3, T.supercontinent + .2));
  G.map({ x: CX, y: 1040, sc: 2.85, k, lon0: lerp(10, 2, k) });
  const kc = pop(t, T.happened - .2); if (kc > 0) { g.save(); g.translate(CX, 470); g.scale(kc, kc); card(0, 0, 820, 170, 1); text('⏪  ' + (k < .02 ? 'today' : Math.round(300 * k) + ' million years ago'), 0, 20, 62, P.cyan, 1000, null, 0); text('rewinding the map', 0, 66, 36, P.white, 800, null, 0); g.restore(); }
  stamp('PANGAEA', CX, 1440, 150, P.gold, pop(t, T.pangaea - .15));
};
SC[2] = (t) => {                                                    // the proof: the same reptile in Brazil and South Africa
  bg(t);
  const ks = eio(seg(t, T.brazil - .6, T.africa + .4)), k = lerp(1, .05, ks), sc = 3.6, lon0 = -12, lat0 = -8;
  const proj = G.map({ x: CX, y: 1040, sc, k, lon0, lat0, wide: .78, tall: 1.12 });
  const pb = proj(G.pt('sa', [-62, -14], k)), pa = proj(G.pt('af', [30, -22], k));
  const kf = pop(t, T.fossils - .1);
  if (ks < .5) { g.save(); g.globalAlpha *= 1 - ss(ks * 2); meso((pb[0] + pa[0]) / 2, (pb[1] + pa[1]) / 2 - 20, .9, t); g.restore(); }
  if (kf > 0) { g.save(); g.translate(pb[0], pb[1]); g.scale(kf, kf); meso(0, 0, .48, t, 1, -.2); g.restore(); g.save(); g.translate(pa[0], pa[1]); g.scale(kf, kf); meso(0, 0, .48, t, 1, .15); g.restore(); }
  const kb = pop(t, T.brazil - .1), ka = pop(t, T.africa - .2);
  if (kb > 0) { g.save(); g.translate(pb[0], pb[1] + 105); g.scale(kb, kb); text('Brazil', 0, 0, 58, P.white, 1000, P.navy, 12); g.restore(); }
  if (ka > 0) { g.save(); g.translate(pa[0], pa[1] + 105); g.scale(ka, ka); text('South Africa', 0, 0, 58, P.white, 1000, P.navy, 12); g.restore(); }
  if (kb > 0 && ka > 0) { g.save(); g.setLineDash([18, 14]); g.strokeStyle = P.gold; g.lineWidth = 8; g.globalAlpha *= ka; g.beginPath(); g.moveTo(pb[0] + 70, pb[1] - 60); g.quadraticCurveTo((pb[0] + pa[0]) / 2, Math.min(pb[1], pa[1]) - 240, pa[0] - 70, pa[1] - 60); g.stroke(); g.restore(); }
  tag(CX, 330, 'Mesosaurus', 'same freshwater reptile, two continents', pop(t, T.reptile - .1), P.cyan);
};
SC[3] = (t) => {                                                    // so what if they all reunited?
  bg(t);
  const k = eio(seg(t, VO.s04 + .1, T.reunited + .35)), crash = Math.max(0, 1 - Math.abs(t - T.reunited - .35) / .4), [sx, sy] = shake(t, 12 * crash);
  inArrows(CX, 1050, 330, t, 1 - k);
  G.globe(CX + sx, 1050 + sy, 330, t, { k, lon0: lerp(10, 0, k), lat0: lerp(12, 0, k), mood: k < .95 ? 'keen' : 'scared' });
  if (crash > 0) { g.save(); g.globalAlpha = crash; for (let i = 0; i < 10; i++) { const q = i / 10 * TAU; sparkle(CX + Math.cos(q) * 420, 1050 + Math.sin(q) * 420, 40, P.gold); } g.restore(); }
  stamp('ONE CONTINENT?', CX, 470, 100, P.gold, pop(t, T.reunited - .1));
};
SC[4] = (t) => {                                                    // drive from New York to London
  sky(); ground(1420);
  const proj = G.map({ x: CX, y: 700, sc: 4.2, k: 1, lon0: -25, lat0: 38, wide: .55, tall: .78 });
  const ny = proj(G.pt('na', [-74, 41], 1)), ld = proj(G.pt('eu', [0, 51], 1)), kr = seg(t, T.york - .2, T.london + .4);
  if (kr > 0) { g.save(); g.setLineDash([16, 12]); g.lineDashOffset = -t * 60; g.strokeStyle = P.red; g.lineWidth = 9; g.beginPath(); g.moveTo(...ny); g.lineTo(lerp(ny[0], ld[0], kr), lerp(ny[1], ld[1], kr)); g.stroke(); g.restore(); }
  for (const [p, s, w] of [[ny, 'New York', T.york], [ld, 'London', T.london]]) { const kp = pop(t, w - .15); if (kp > 0) { g.fillStyle = P.red; g.beginPath(); g.arc(p[0], p[1], 16 * kp, 0, TAU); g.fill(); g.save(); g.translate(p[0], p[1] - 34); g.scale(kp, kp); text(s, 0, 0, 44, P.white, 1000, P.navy, 10); g.restore(); } }
  car(lerp(-200, W + 200, ((t - VO.s05) / 4.5) % 1), 1490, .9, t);
  for (const [x, f, w] of [[290, plane, T.planes], [790, ferry, T.ferries]]) { const kk = pop(t, w - .15); if (kk > 0) { g.save(); g.translate(x, 1160); g.scale(kk, kk); card(0, 0, 300, 200, 1); f(0, 0, .9); g.restore(); cross(x, 1160, 70, pop(t, w + .05)); } }
};
SC[5] = (t) => {                                                    // ships carry ~80 % of world trade; trucks and trains take over
  sky('#7fc8f0', '#d6f0ff');
  g.fillStyle = '#3d8be8'; g.fillRect(0, 980, W, H - 980); g.fillStyle = '#2f6fd0'; for (let i = 0; i < 6; i++) g.fillRect(0, 1040 + i * 60, W, 8);
  const go = ss(seg(t, T.trucks - .3, T.trains + .6));
  ship(lerp(CX, -500, go), 990, 1.05, t, go > .1 ? 1 : 0);
  if (go > 0) { g.fillStyle = PR.HILL; g.fillRect(lerp(W, 0, go), 1300, W, H - 1300); g.fillStyle = '#8c8aa8'; g.fillRect(lerp(W, 0, go), 1500, W, 110); g.fillStyle = '#6a5a4a'; g.fillRect(lerp(W, 0, go), 1420, W, 12);
    truck(lerp(W + 300, 700, eo(seg(t, T.trucks - .1, T.trucks + .8))), 1600, .9, t); train(lerp(W + 1200, 900, eo(seg(t, T.trains - .1, T.trains + .9))), 1420, .8, t); }
  const k8 = pop(t, T.eighty - .15); if (k8 > 0) { g.save(); g.translate(CX, 560); g.scale(k8, k8); card(0, 0, 640, 260, 1); text(Math.round(80 * clamp(seg(t, T.eighty - .1, T.eighty + .5))) + '%', 0, 40, 170, P.gold, 1000, null, 0); text('of world trade goes by sea', 0, 105, 38, P.white, 800, null, 0); g.restore(); }
  tag(CX, 300, 'ships → trucks + trains', null, pop(t, T.trucks - .1), P.cyan);
};
SC[6] = (t) => {                                                    // the middle: farther from the sea than anywhere today
  bg(t);
  const proj = G.map({ x: CX, y: 1000, sc: 3.4, k: 1, lon0: 4, lat0: 6, wide: .8, tall: 1.3, tint: key => key === 'gl' || key === 'an' ? G.colOf(key) : lerp(0, 1, ss(seg(t, T.brutal - .3, T.brutal + .5))) > .5 ? '#e9b25e' : G.colOf(key) });
  const p = proj([2, 22]), q = proj([-6, 52]), kp = pop(t, T.middle - .15);
  if (kp > 0) { for (let i = 0; i < 3; i++) { const r = ((t * .7 + i / 3) % 1) * 260; g.strokeStyle = `rgba(255,77,109,${1 - r / 260})`; g.lineWidth = 8; g.beginPath(); g.arc(p[0], p[1], r, 0, TAU); g.stroke(); }
    g.save(); g.translate(p[0], p[1]); g.scale(kp, kp); g.fillStyle = P.red; g.beginPath(); g.arc(0, -60, 34, Math.PI * .8, Math.PI * 2.2); g.lineTo(0, 0); g.closePath(); g.fill(); g.fillStyle = P.white; g.beginPath(); g.arc(0, -60, 13, 0, TAU); g.fill(); g.restore(); }
  const kf = ss(seg(t, T.farther - .2, T.farther + .5)); if (kf > 0) { g.save(); g.setLineDash([14, 12]); g.strokeStyle = P.white; g.lineWidth = 7; g.beginPath(); g.moveTo(p[0], p[1] - 10); g.lineTo(lerp(p[0], q[0], kf), lerp(p[1] - 10, q[1], kf)); g.stroke(); g.restore(); }
  tag(CX, 330, 'far from the sea', "today's record: about 2,500 km", pop(t, T.today7 - .3), P.red);
};
SC[7] = (t) => {                                                    // no ocean to calm the weather: scorching summers, freezing winters
  const ks = ss(seg(t, T.summers - .3, T.summers)), kw = ss(seg(t, T.winters - .3, T.winters));
  { const gr = g.createLinearGradient(0, 0, 0, 960); gr.addColorStop(0, '#ff8a3c'); gr.addColorStop(1, '#ffc46a'); g.fillStyle = gr; g.fillRect(0, 0, W, 960); }
  K.sunBody(170, 200, 110 + 10 * Math.sin(t * 3), t, { flare: .6 });
  g.fillStyle = '#e9b25e'; g.fillRect(0, 860, W, 100);
  stander(CX - 80, 900, .62, t, { mood: ks > .5 ? 'annoyed' : 'happy', arms: 'down' }); sweat(CX - 80, 520, t, ks);
  thermo(860, 760, lerp(.5, 1, ks), P.red, 1); stamp('40 °C+', 860, 380, 96, P.white, pop(t, T.forty - .15), -.08, '#c2410c');
  { const gr = g.createLinearGradient(0, 960, 0, H); gr.addColorStop(0, '#5b7fd6'); gr.addColorStop(1, '#2a3f8a'); g.fillStyle = gr; g.fillRect(0, 960, W, H - 960); }
  g.fillStyle = '#eef4ff'; g.fillRect(0, 1560, W, 360);
  const R = mulberry(4); for (let i = 0; i < 26; i++) snowflake(R() * W, 960 + ((R() * 600 + t * 90) % 620), 10 + R() * 12, .4 + .6 * kw);
  stander(CX - 80 + Math.sin(t * 40) * 6 * kw, 1600, .62, t, { mood: kw > .5 ? 'sad' : 'happy', arms: kw > .5 ? 'hold' : 'down' });
  thermo(860, 1440, lerp(.5, .05, kw), '#3fa8ff', 1); stamp('FREEZING', 860, 1100, 80, P.white, pop(t, T.freeze - .15), -.08, '#1e3a8a');
  g.fillStyle = 'rgba(0,0,0,' + .45 * (1 - ks) + ')'; g.fillRect(0, 0, W, 960); g.fillStyle = 'rgba(0,0,0,' + .45 * (1 - kw) + ')'; g.fillRect(0, 960, W, 960);
  tag(CX, 960, 'no ocean to calm it', null, pop(t, T.ocean8 - .15) * (1 - ss(seg(t, T.summers, T.summers + .3))), P.cyan);
};
SC[8] = (t) => {                                                    // rain clouds dry out before the centre: giant deserts
  sky('#7fc8f0', '#d6f0ff');
  const kc = seg(t, T.rain - .4, T.centre + .3), cx = lerp(120, 860, ss(kc)), cs = lerp(1.2, .45, kc);
  const kd = ss(seg(t, T.dry - .3, T.deserts + .4));
  g.fillStyle = '#3d8be8'; g.beginPath(); g.moveTo(0, 1250); for (let x = 0; x <= 260; x += 20) g.lineTo(x, 1250 + Math.sin(x * .05 + t * 3) * 8); g.lineTo(260, H); g.lineTo(0, H); g.fill();
  { const gr = g.createLinearGradient(240, 0, W, 0); gr.addColorStop(0, '#3fa866'); gr.addColorStop(lerp(1, .35, kd), '#3fa866'); gr.addColorStop(Math.min(1, lerp(1, .55, kd) + .01), '#e9b25e'); gr.addColorStop(1, '#e9b25e'); g.fillStyle = gr; g.beginPath(); g.moveTo(240, H); g.lineTo(240, 1240); g.quadraticCurveTo(600, 1160, W, 1200); g.lineTo(W, H); g.fill(); }
  if (kd > .2) { g.save(); g.globalAlpha *= kd; g.beginPath(); g.rect(560, 1100, W, 800); g.clip(); dunes(1330, t); g.restore(); }
  for (const [x, s] of [[320, .5], [430, .42]]) tree(x, 1235, s, 0, t);
  rainFall(cx - 150 * cs, cx + 150 * cs, 1000, 1230, t, Math.round(40 * (1 - kc)), 1 - kc);
  rainCloud(cx, 880, cs, 0);
  if (kd > 0) { for (let i = 0; i < 3; i++) { const R = mulberry(i); const sx = 700 + i * 120 + Math.sin(t * 2 + i) * 20; g.save(); g.globalAlpha *= kd * .6; g.strokeStyle = '#fff3c4'; g.lineWidth = 6; g.beginPath(); g.moveTo(sx, 1200); g.quadraticCurveTo(sx + 30, 1120, sx, 1050); g.stroke(); g.restore(); } }
  const kl = pop(t, T.dry - .1); if (kl > 0) { g.save(); g.translate(150, 1420); g.scale(kl, kl); text('coast: wet', 0, 0, 44, P.white, 1000, P.navy, 10, 'left'); g.restore(); }
  tag(CX, 330, 'giant deserts', 'the rain runs out before the middle', pop(t, T.deserts - .15), P.gold);
};
SC[9] = (t) => {                                                    // Pangaea's dunes became the red cliffs of Zion
  sky('#5fb6f0', '#cfeaff');
  const k = seg(t, T.stone - .4, T.red + .4);
  cliffs(1500, k, t); dunes(1500, t, 1 - ss(k * 1.3));
  g.fillStyle = '#c98a4a'; g.fillRect(0, 1500, W, H - 1500);
  if (k > .6) stander(560, 1500, .2, t, { mood: 'keen', arms: 'up' });
  const kz = pop(t, T.zion - .15); if (kz > 0) { g.save(); g.translate(CX, 1580); g.scale(kz, kz); card(0, 0, 820, 110, 1); text('Zion National Park, Utah', 0, 18, 52, P.white, 1000, null, 0); g.restore(); }
  const kp = pop(t, T.had - .15); if (kp > 0) { g.save(); g.translate(CX, 520); g.scale(kp, kp); card(0, 0, 640, 110, 1); text(k < .5 ? 'Pangaea, 190 million years ago' : 'today', 0, 18, 46, P.gold, 1000, null, 0); g.restore(); }
  tag(CX, 330, 'dunes → stone', 'the Navajo Sandstone', pop(t, T.stone - .15), '#ffb35a');
};
SC[10] = (t) => {                                                   // megamonsoons on the coasts
  const fl = Math.max(0, 1 - Math.abs(t - T.mega - .1) / .12) + Math.max(0, 1 - Math.abs(t - T.india) / .1) * .6;
  sky('#3a4170', '#7b84b0');
  rainCloud(260, 260, 1.4, 1); rainCloud(800, 220, 1.6, 1); rainCloud(560, 380, 1.2, 1);
  g.fillStyle = '#2a63b8'; g.beginPath(); g.moveTo(0, H); for (let x = 0; x <= W; x += 20) g.lineTo(x, 1380 + Math.sin(x * .02 + t * 5) * 30 - (x < 500 ? 0 : (x - 500) * .1)); g.lineTo(W, H); g.fill();
  g.fillStyle = '#c9a46a'; g.beginPath(); g.moveTo(420, H); g.quadraticCurveTo(700, 1380, W, 1340); g.lineTo(W, H); g.fill();
  palm(880, 1360, .85, t, .8);
  stander(620, 1460, .55, t, { mood: 'scared', arms: 'hold' }); umbrella(670, 1060, .9, t);
  rainFall(0, W, 400, 1500, t, 120, 1, .5);
  if (fl > 0) { g.fillStyle = `rgba(255,255,255,${.6 * fl})`; g.fillRect(0, 0, W, H); g.strokeStyle = '#fff7c0'; g.lineWidth = 12; g.globalAlpha = fl; g.beginPath(); g.moveTo(420, 420); g.lineTo(360, 620); g.lineTo(440, 640); g.lineTo(350, 900); g.stroke(); g.globalAlpha = 1; }
  stamp('MEGAMONSOONS', CX, 640, 116, P.cyan, pop(t, T.mega - .15));
  tag(CX, 330, 'wilder than India’s', 'monsoon rains on the coasts', pop(t, T.india - .2), P.white);
};
SC[11] = (t) => {                                                   // one giant ocean; less shallow sea for sea life
  const kx = ss(seg(t, T.fewer - .5, T.fewer));
  if (kx < 1) { g.save(); g.globalAlpha *= 1 - kx; bg(t); G.globe(CX, 1050, 320, t, { k: 1, lon0: 130 + t * 3, lat0: 0, mood: 'keen', look: -.4 }); stamp('ONE OCEAN', CX, 520, 130, P.cyan, pop(t, T.oneocean - .1)); g.restore(); }
  if (kx > 0) { g.save(); g.globalAlpha *= kx;
    sky('#7fc8f0', '#d6f0ff');
    const sh = lerp(620, 220, ss(seg(t, T.shallow - .2, T.life + .4)));   // shelf length
    g.fillStyle = '#5aa8f0'; g.fillRect(0, 900, W, H - 900); g.fillStyle = '#2f5fb0'; g.fillRect(0, 1350, W, H - 1350);
    g.fillStyle = '#e9c46a'; g.beginPath(); g.moveTo(W, 850); g.lineTo(W - 120, 900); g.lineTo(W - 120 - sh, 1120); g.lineTo(W - 220 - sh, 1700); g.lineTo(W - 260 - sh, H); g.lineTo(W, H); g.fill();
    g.fillStyle = '#ffd36a'; g.fillRect(W - 120 - sh, 1112, sh, 12);
    const R = mulberry(3), n = Math.round(lerp(8, 3, ss(seg(t, T.life - .3, T.life + .5))));
    for (let i = 0; i < 8; i++) { const x = W - 140 - R() * sh * .95, y = 960 + R() * 130; g.save(); g.globalAlpha *= i < n ? 1 : .15; fish(x, y, .55, t, ['#ff8a3c', '#ffc73a', '#ff6a9a'][i % 3], i % 2 ? 1 : -1); g.restore(); }
    for (let i = 0; i < 4; i++) { g.fillStyle = '#ff6a9a'; const x = W - 160 - i * sh / 4; g.beginPath(); g.ellipse(x, 1105, 22, 34, 0, 0, TAU); g.fill(); }
    fish(260, 1550, .5, t, '#9aa0c0'); text('deep ocean', 260, 1680, 40, 'rgba(255,255,255,.7)', 900, null, 0);
    const ks = pop(t, T.shallow - .15); if (ks > 0) { g.save(); g.translate(W - 140 - sh / 2, 860); g.scale(ks, ks); text('shallow sea', 0, 0, 46, P.white, 1000, P.navy, 10); g.restore(); }
    tag(CX, 330, 'fewer coastlines', 'less shallow sea, less room for sea life', pop(t, T.fewer - .1), P.cyan);
    g.restore(); }
};
SC[12] = (t) => {                                                   // continents collide and crumple into mountains
  sky('#8fc8f0', '#dff2ff');
  const k = ss(seg(t, T.collide - .3, T.mountains + .4)), push = lerp(0, 1, ss(seg(t, VO.s13, T.collide + .3)));
  const cols = ['#7a5a3a', '#a07040', '#c98a4a', '#5fcf7a'];
  for (let j = 3; j >= 0; j--) { g.fillStyle = cols[j]; g.beginPath(); g.moveTo(0, H);
    for (let x = 0; x <= W; x += 10) { const d = (x - CX) / 260, up = k * 520 * Math.exp(-d * d) * (1 + .18 * Math.sin(x * .05 + j)) * (1 - j * .08); g.lineTo(x, 1700 - j * 110 - up); }
    g.lineTo(W, H); g.fill(); }
  const ka = 1 - k * .5; K.arrow(40 + push * 60, 1560, 280 + push * 60, 1560, P.white, 20, ka); K.arrow(W - 40 - push * 60, 1560, W - 280 - push * 60, 1560, P.white, 20, ka);
  stamp('CRUNCH!', CX, 560, 120, P.red, pop(t, T.crumples - .15), -.08, P.white);
  tag(CX, 330, 'mountains', 'where continents crash', pop(t, T.mountains - .15), P.gold);
};
SC[13] = (t) => {                                                   // Pangaea's central mountains rivalled the Himalayas; today the Appalachians
  sky('#8fc8f0', '#dff2ff');
  const e = ss(seg(t, T.today14 - .2, T.appalachians + .4)), hs = [520, 780, 900, 640, 860, 700, 480].map(h => lerp(h, h * .32 + 60, e));
  ridge(1600, hs, t, 1 - e, e > .5 ? ['#3f8f5a', '#5fbf7a'] : ['#6f5f9e', '#8a7bbf'], e);
  g.fillStyle = '#3fa866'; g.fillRect(0, 1600, W, H - 1600);
  const kh = ss(seg(t, T.himalayas - .3, T.himalayas)) * (1 - e); if (kh > 0) { g.save(); g.globalAlpha *= kh; g.setLineDash([16, 12]); g.strokeStyle = P.white; g.lineWidth = 7; g.beginPath(); g.moveTo(0, 1600 - 880); g.lineTo(W, 1600 - 880); g.stroke(); g.restore(); text('Himalaya height', W - 30, 1600 - 900, 44, P.white, 1000, P.navy, 10, 'right', kh); }
  const kc = pop(t, T.central - .15); if (kc > 0) { g.save(); g.translate(CX, 520); g.scale(kc, kc); card(0, 0, 820, 110, 1); text(e < .5 ? 'Central Pangean Mountains' : 'Appalachians, today', 0, 18, 50, e < .5 ? P.gold : '#7be093', 1000, null, 0); g.restore(); }
  tag(CX, 330, e < .5 ? 'Himalaya-sized?' : 'worn down', e < .5 ? 'may have rivalled the Himalayas' : '300 million years of erosion', pop(t, e < .5 ? T.central - .1 : T.today14 - .1), e < .5 ? '#ffb35a' : '#7be093');
};
SC[14] = (t) => {                                                   // don't panic: continents move about as fast as fingernails grow
  bg(t);
  stamp("DON'T PANIC", CX, 330, 110, P.cyan, pop(t, T.panic - .2) * (1 - ss(seg(t, T.cant - .4, T.cant - .2))));
  const kc = pop(t, T.cant - .15); if (kc > 0) { g.save(); g.translate(CX, 380); g.scale(kc, kc); g.rotate(-.05); text("CAN'T HAPPEN", 0, -30, 104, P.gold, 1000, P.navy, 18); text('SUDDENLY', 0, 90, 104, P.gold, 1000, P.navy, 18); g.restore(); }
  const kf = ss(seg(t, T.fingernails - .8, T.fingernails - .3)), grow = ss(seg(t, T.fingernails - .3, VO.s15 + dur.s15 + .2));
  if (kf > 0) { g.save(); g.globalAlpha *= kf; hand(330, 1250, 1, grow); g.restore();
    G.globe(800, 1100, 170, t, { k: .05 * grow, lon0: 10, lat0: 10, mood: 'sleepy' });
    text('≈', 560, 1130, 110, P.white, 1000, P.navy, 12, 'center', kf); }
  tag(CX, 1540, 'a few cm a year', 'continents ≈ fingernails', pop(t, T.fingernails - .1), P.cyan);
};
SC[15] = (t) => {                                                   // the next supercontinent: ~250 million years away
  bg(t);
  const kn = ss(seg(t, T.two - .1, T.away)), n = Math.round(250 * kn);
  G.globe(CX, 1100, 310, t, { k: kn, lon0: lerp(10, 0, kn), lat0: lerp(12, 0, kn), mood: kn > .9 ? 'happy' : 'sleepy' });
  const kc = pop(t, T.next - .15); if (kc > 0) { g.save(); g.translate(CX, 470); g.scale(kc, kc); card(0, 0, 860, 220, 1); text(n + ' million', 0, 20, 110, P.gold, 1000, null, 0); text('years from now', 0, 80, 42, P.white, 800, null, 0); g.restore(); }
  tag(CX, 1580, 'the next supercontinent', null, pop(t, T.away - .1), P.cyan);
};
SC[16] = (t) => {                                                   // one study: so hot that mammals could live on ~a tenth of it
  bg(t, '#2a0d24', '#5a1a2a');
  const kh = ss(seg(t, T.hot - .3, T.hot + .4));
  K.sunBody(900, 300, 120 + 8 * Math.sin(t * 3), t, { flare: .7 });
  const proj = G.map({ x: CX, y: 1060, sc: 3.3, k: 1, lon0: 4, lat0: 4, wide: .8, tall: 1.25, seaCol: '#2a5aa8', tint: key => kh > .5 ? (key === 'an' ? '#7be093' : '#ff6a3c') : G.colOf(key) });
  if (kh > .5) { const km = pop(t, T.mammals - .15); for (const [p, s] of [[[-12, -62], 1], [[40, 56], .9], [[-60, 40], .8]]) { const q = proj(p); g.save(); g.globalAlpha *= km; g.fillStyle = '#7be093'; g.beginPath(); g.arc(q[0], q[1], 70 * s, 0, TAU); g.fill(); mouse(q[0], q[1], .7 * s * km, t); g.restore(); } }
  stamp('TOO HOT', CX, 600, 120, '#ffb35a', pop(t, T.hot - .15), -.06);
  tag(CX, 330, '≈ 8–16% of land', 'livable for mammals · one 2023 model', pop(t, T.tenth - .2), '#7be093');
};
SC[17] = (t) => {                                                   // the twist: Earth has done this at least three times
  bg(t);
  const R0 = 330, cx = CX, cy = 1080, kr = ss(seg(t, T.twist - .3, T.twist + .4));
  if (kr > 0) { g.save(); g.globalAlpha *= kr; g.strokeStyle = 'rgba(255,199,58,.55)'; g.lineWidth = 14; g.setLineDash([30, 22]); g.lineDashOffset = -t * 80; g.beginPath(); g.arc(cx, cy, R0, 0, TAU); g.stroke(); g.restore(); }
  const nodes = [['Nuna', '~1.8 bn yrs ago', -Math.PI / 2, T.three18 - .2], ['Rodinia', '~1 bn yrs ago', 0, T.three18 + .1], ['Pangaea', '~300 m yrs ago', Math.PI / 2, T.pangaea18 - .1], ['next?', '~250 m yrs ahead', Math.PI, T.latest]];
  for (const [nm, sub, q, w] of nodes) { const k = pop(t, w - .1); if (k <= 0) continue; const x = cx + Math.cos(q) * R0, y = cy + Math.sin(q) * R0;
    g.save(); g.translate(x, y); g.scale(k, k); G.globe(0, 0, 95, t, { k: nm === 'next?' ? .6 + .4 * Math.sin(t * 2) ** 2 : 1, lon0: q * 40, lat0: 0, face: nm === 'Pangaea' ? true : false, mood: 'happy' });
    text(nm, 0, 150, 52, nm === 'Pangaea' ? P.gold : P.white, 1000, P.navy, 10); text(sub, 0, 196, 34, P.cyan, 900, P.navy, 8); g.restore(); }
  stamp('TWIST', CX, 330, 130, P.red, pop(t, T.twist - .15), -.08, P.white);
  tag(CX, 1640, 'the supercontinent cycle', null, pop(t, T.latest - .1), P.gold);
};
SC[18] = (t) => {                                                   // ending: one planet, one continent, one ocean; already on our way
  bg(t);
  const kb = ss(seg(t, T.already - .3, T.already + .6)), k = lerp(1, .12, kb);
  inArrows(CX, 1050, 300, t, kb);
  G.globe(CX, 1050, 300, t, { k, lon0: lerp(0, 10, kb), lat0: lerp(0, 10, kb), mood: kb > .5 ? 'wink' : 'smug' });
  const items = [['ONE PLANET', T.planet], ['ONE CONTINENT', T.continent19], ['ONE OCEAN', T.ocean19]];
  items.forEach(([s, w], i) => { const kk = pop(t, w - .15) * (1 - kb); if (kk > 0) { g.save(); g.translate(CX, 300 + i * 120); g.scale(kk, kk); text(s, 0, 0, 96, i === 1 ? P.gold : P.white, 1000, P.navy, 16); g.restore(); } });
  stamp('ALREADY MOVING', CX, 420, 104, P.cyan, pop(t, T.already - .1));
};

// ───────── captions: word-pops, key words in gold (lower middle, above the Shorts UI)
const KEY = new Set(['continent', 'moving', 'crash', 'together', 'happened', 'three', 'hundred', 'million', 'supercontinent', 'pangaea', 'fossils', 'reptile', 'brazil', 'south', 'africa', 'reunited',
  'drive', 'new', 'york', 'london', 'planes', 'ferries', 'eighty', 'percent', 'trucks', 'trains', 'middle', 'brutal', 'sea', 'forty', 'degrees', 'freeze', 'deserts', 'dunes', 'stone', 'red', 'cliffs', 'zion',
  'megamonsoons', 'indias', 'ocean', 'shallow', 'life', 'mountains', 'himalayas', 'appalachians', 'panic', 'suddenly', 'fingernails', 'two', 'fifty', 'away', 'hot', 'mammals', 'tenth', 'twist', 'latest',
  'planet', 'already']);
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
  rows.forEach((row, ri) => { const tot = row.reduce((p, w) => p + w.wd, 0); let x = CX - tot / 2; const y = 1720 + ri * 88;
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
S.forEach((s, i) => { if (i > 0 && i < S.length - 1) EV.push({ type: 'scene', i, t: +s.toFixed(3) }); });
EV.sort((a, b) => a.t - b.t);
window.EV = EV; window.DUR = DUR; window.render = render; window.S = S; window.T = T; window.VO = VO;
window.SUBS = lines.map((l, i) => { const ws = words[l.id], t0 = VO[l.id] - .05, nx = lines[i + 1] ? VO[lines[i + 1].id] - .05 : DUR; return { t0, t1: Math.max(Math.min(VO[l.id] + ws[ws.length - 1][2] + .6, nx), t0 + 1.8), text: l.sub || l.text }; });
render(+(new URLSearchParams(location.search).get('t') ?? .5));
window.READY = true;
