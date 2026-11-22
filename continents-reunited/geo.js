// Continents for "What If All Continents Reunited?": rough hand-drawn outlines (lon, lat), a merge from today's map to a
// Pangaea-like supercontinent, drawn either as a flat map or on a globe. Stylised on purpose, not a real reconstruction.
import * as K from './kit.js';
import { lerp, TAU } from '/core/lib.js';
const { P } = K;
let g;
export function setup(ctx) { g = ctx; }
const D = Math.PI / 180;
// outlines, clockwise-ish, in degrees
const C = {
  na: { col: '#5fcf7a', pts: [[-165, 65], [-140, 70], [-115, 70], [-95, 72], [-82, 66], [-78, 58], [-62, 56], [-55, 50], [-66, 44], [-70, 41], [-76, 36], [-81, 31], [-80, 25], [-83, 29], [-90, 29], [-97, 27], [-97, 21], [-91, 18], [-87, 15], [-83, 9], [-78, 8], [-86, 12], [-95, 16], [-105, 20], [-110, 24], [-117, 32], [-124, 40], [-125, 49], [-133, 56], [-150, 60], [-165, 60]] },
  gl: { col: '#e8f1ff', pts: [[-55, 60], [-44, 60], [-32, 66], [-20, 72], [-20, 80], [-35, 83], [-60, 82], [-72, 78], [-58, 72], [-52, 66]], pivot: 'na' },
  sa: { col: '#7fd88a', pts: [[-78, 8], [-72, 12], [-62, 10], [-52, 5], [-50, 0], [-40, -3], [-35, -7], [-38, -14], [-40, -22], [-48, -27], [-53, -34], [-58, -38], [-63, -42], [-66, -48], [-68, -55], [-74, -52], [-74, -42], [-72, -30], [-71, -18], [-77, -12], [-81, -5], [-80, 1]] },
  eu: { col: '#5fcf7a', pts: [[-10, 36], [-9, 43], [-2, 47], [4, 51], [8, 54], [8, 57], [5, 61], [13, 67], [24, 71], [40, 68], [60, 70], [80, 73], [100, 77], [125, 73], [150, 71], [178, 68], [172, 61], [160, 56], [142, 52], [140, 42], [128, 38], [122, 31], [119, 23], [108, 20], [106, 11], [101, 3], [98, 9], [97, 16], [91, 22], [86, 20], [80, 13], [77, 8], [73, 18], [67, 24], [57, 25], [56, 18], [52, 16], [44, 12], [39, 20], [34, 28], [36, 36], [28, 37], [22, 37], [20, 40], [13, 38], [12, 44], [3, 43], [-4, 37]] },
  af: { col: '#e9c46a', pts: [[-17, 21], [-14, 28], [-9, 33], [-2, 36], [10, 37], [20, 32], [32, 31], [34, 27], [39, 16], [43, 12], [51, 11], [48, 3], [41, -3], [40, -12], [35, -22], [32, -29], [27, -34], [20, -35], [17, -29], [12, -17], [13, -8], [9, -2], [9, 4], [3, 6], [-8, 5], [-13, 8], [-17, 14]] },
  au: { col: '#f2a65a', pts: [[114, -22], [122, -17], [130, -12], [136, -12], [142, -11], [145, -16], [146, -19], [153, -26], [152, -33], [148, -38], [140, -38], [135, -34], [130, -32], [124, -34], [115, -34], [113, -27]] },
  an: { col: '#eef4ff', pts: [[0, -70], [25, -68], [55, -66], [85, -66], [108, -69], [104, -79], [72, -86], [30, -86], [2, -82], [-14, -76]] },
};
// where each piece goes in the supercontinent: shift (deg) and turn (deg) about its own centre (pivot piece for Greenland)
const TO = { na: [52, -12, -18], gl: [52, -12, -18], sa: [36, 8, -30], eu: [0, -6, 0], af: [0, 0, 0], au: [-52, -16, 30], an: [-26, 33, 0] };
const CEN = {};
for (const [k, c] of Object.entries(C)) { let x = 0, y = 0; for (const [a, b] of c.pts) { x += a; y += b; } CEN[k] = [x / c.pts.length, y / c.pts.length]; }
export const KEYS = ['an', 'au', 'sa', 'af', 'na', 'gl', 'eu'];
// a continent's outline at merge k (0 = today, 1 = one supercontinent); jit adds a small drift wobble
export function shape(key, k) {
  const [dx, dy, rot] = TO[key], [cx, cy] = CEN[C[key].pivot || key], a = rot * k * D, ca = Math.cos(a), sa = Math.sin(a);
  return C[key].pts.map(([x, y]) => { const u = x - cx, v = y - cy; return [cx + u * ca - v * sa + dx * k, cy + u * sa + v * ca + dy * k]; });
}
export function centre(k) { return [lerp(20, 8, k), lerp(10, -2, k)]; }       // where the land mass sits (for framing)
export const colOf = key => C[key].col;
function trace(pts, proj) { g.beginPath(); pts.forEach((p, i) => { const [x, y] = proj(p); i ? g.lineTo(x, y) : g.moveTo(x, y); }); g.closePath(); }
// flat map: o.x, o.y (centre), o.sc (px per degree), o.k, o.lon0/lat0 (map centre), o.tint (fn key → colour), o.a
export function map(o) {
  const sc = o.sc, k = o.k ?? 0, lon0 = o.lon0 ?? 10, lat0 = o.lat0 ?? 0;
  const proj = ([lon, lat]) => [o.x + (lon - lon0) * sc, o.y - (lat - lat0) * sc];
  g.save(); g.globalAlpha *= o.a ?? 1;
  if (o.sea !== false) {
    const w = 360 * sc * (o.wide ?? .94), h = 175 * sc * (o.tall ?? .94);
    g.fillStyle = o.seaCol || '#2f6fd0'; g.beginPath(); g.roundRect(o.x - w / 2, o.y - h / 2, w, h, 40); g.fill();
    g.clip(); g.strokeStyle = 'rgba(255,255,255,.08)'; g.lineWidth = 3;
    for (let l = -180; l <= 180; l += 30) { g.beginPath(); g.moveTo(...proj([l + lon0, -90])); g.lineTo(...proj([l + lon0, 90])); g.stroke(); }
    for (let l = -60; l <= 60; l += 30) { g.beginPath(); g.moveTo(...proj([lon0 - 200, l])); g.lineTo(...proj([lon0 + 200, l])); g.stroke(); }
  }
  for (const key of KEYS) {
    const pts = shape(key, k);
    g.save(); g.translate(sc * .8, sc * 1.1); trace(pts, proj); g.fillStyle = 'rgba(10,20,70,.35)'; g.fill(); g.restore();
    trace(pts, proj); g.fillStyle = o.tint ? o.tint(key) : colOf(key); g.fill();
    g.lineJoin = 'round'; g.lineWidth = Math.max(2, sc * .9); g.strokeStyle = 'rgba(23,22,63,.45)'; g.stroke();
  }
  g.restore();
  return proj;
}
// globe: continents on an orthographic sphere with the house face on top. o.k, o.lon0, o.lat0, o.mood, o.look, o.face
export function globe(x, y, r, t, o = {}) {
  const k = o.k ?? 0, lon0 = (o.lon0 ?? 10) * D, lat0 = (o.lat0 ?? 12) * D, s0 = Math.sin(lat0), c0 = Math.cos(lat0);
  g.save(); g.translate(x, y);
  K.glow(0, 0, r * 1.45, '90,170,255', .28);
  g.beginPath(); g.arc(0, 0, r, 0, TAU); g.save(); g.clip();
  g.fillStyle = P.ocean; g.fillRect(-r, -r, 2 * r, 2 * r);
  const proj = ([lon, lat]) => { const l = lon * D - lon0, p = lat * D, cc = s0 * Math.sin(p) + c0 * Math.cos(p) * Math.cos(l);
    let px = r * Math.cos(p) * Math.sin(l), py = -r * (c0 * Math.sin(p) - s0 * Math.cos(p) * Math.cos(l));
    if (cc < 0) { const m = Math.hypot(px, py) || 1; px = px / m * r * 1.02; py = py / m * r * 1.02; } return [px, py, cc]; };
  for (const key of KEYS) {
    const pts = shape(key, k), pp = pts.map(proj); if (pp.every(q => q[2] < 0)) continue;
    g.beginPath(); pp.forEach(([px, py], i) => i ? g.lineTo(px, py) : g.moveTo(px, py)); g.closePath();
    g.fillStyle = o.tint ? o.tint(key) : colOf(key); g.fill(); g.lineJoin = 'round'; g.lineWidth = r * .012; g.strokeStyle = 'rgba(23,22,63,.35)'; g.stroke();
  }
  g.fillStyle = 'rgba(20,30,90,.28)'; g.beginPath(); g.arc(r * .35, r * .1, r * 1.1, 0, TAU); g.arc(-r * .15, -r * .08, r * 1.02, 0, TAU, true); g.fill('evenodd');
  g.restore();
  if (o.face !== false) K.face(r, o.mood || 'happy', t, o.look || 0, .7, o.lookY || 0);
  g.restore();
}
// one point riding on a continent (e.g. a city or a fossil site) at merge k
export function pt(key, [x, y], k) {
  const [dx, dy, rot] = TO[key], [cx, cy] = CEN[C[key].pivot || key], a = rot * k * D, u = x - cx, v = y - cy;
  return [cx + u * Math.cos(a) - v * Math.sin(a) + dx * k, cy + u * Math.sin(a) + v * Math.cos(a) + dy * k];
}
