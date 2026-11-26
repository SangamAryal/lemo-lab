// The rogue planet (a banded giant with no star of its own) and moons, shared by main.js and thumb.js.
import * as K from './kit.js';
import { TAU } from '/core/lib.js';
const { P, glow } = K;
let g;
export function setup(ctx) { g = ctx; }
// ───────── the rogue planet: a banded giant, mauve and cream (it has no star, so it is lit only when it nears ours)
// o.lit: 0 = dark (barely lit, faint glow at the rim), 1 = sunlit; o.ang = direction of the light; o.moons = draw its moons
const BANDS = ['#e9d8c4', '#c9a58a', '#f2e6d6', '#a77d6e', '#e4c9ae', '#8d6a78', '#d9b89c', '#f0dcc4', '#9c7480', '#d7bba3'];
export function rogue(x, y, r, t, o = {}) {
  const lit = o.lit ?? 1, ang = o.ang ?? -2.4;
  if (lit > 0) glow(x, y, r * 1.5, '255,214,170', .22 * lit);
  glow(x, y, r * 1.25, '170,140,255', .25 * (1 - lit) + .08);
  g.save(); g.translate(x, y); g.beginPath(); g.arc(0, 0, r, 0, TAU); g.clip();
  const n = BANDS.length; for (let i = 0; i < n; i++) { const y0 = i ? -r + i * 2 * r / n : -r * 1.2; g.fillStyle = BANDS[i]; g.beginPath(); g.moveTo(-r, y0);
    for (let k = 0; k <= 24; k++) { const xx = -r + k * r / 12; g.lineTo(xx, y0 + Math.sin(xx / r * 5 + i * 1.7 + t * .4) * r * .025); }
    g.lineTo(r, r); g.lineTo(-r, r); g.closePath(); g.fill(); }
  const sx = ((t * .05 + .3) % 1.4 - .7) * r * 1.6; g.fillStyle = '#b5524a'; g.beginPath(); g.ellipse(sx, r * .32, r * .2, r * .11, 0, 0, TAU); g.fill();   // its storm
  g.fillStyle = '#d97a64'; g.beginPath(); g.ellipse(sx, r * .32, r * .12, r * .06, 0, 0, TAU); g.fill();
  // shading: a terminator away from the light, and the dark side when unlit
  const lx = Math.cos(ang), ly = Math.sin(ang);
  const sh = g.createLinearGradient(lx * r, ly * r, -lx * r, -ly * r); sh.addColorStop(0, 'rgba(20,10,50,0)'); sh.addColorStop(.55, `rgba(20,10,50,${.25 + .3 * (1 - lit)})`); sh.addColorStop(1, `rgba(12,6,36,${.75 + .2 * (1 - lit)})`);
  g.fillStyle = sh; g.fillRect(-r, -r, 2 * r, 2 * r);
  if (lit < 1) { g.fillStyle = `rgba(14,8,40,${.75 * (1 - lit)})`; g.fillRect(-r, -r, 2 * r, 2 * r); }
  g.restore();
  g.save(); g.strokeStyle = `rgba(210,190,255,${.35 + .25 * (1 - lit)})`; g.lineWidth = Math.max(2, r * .025); g.beginPath(); g.arc(x, y, r, ang - 1.3, ang + 1.3); g.stroke(); g.restore();
  if (o.moons) for (const [d, a0, sp, mr] of [[1.9, .4, .25, .1], [2.5, 2.6, .17, .07]]) { const a = a0 + t * sp; moonBall(x + Math.cos(a) * r * d, y + Math.sin(a) * r * d * .35, r * mr, '#c9d6e6', '#9aa8bf'); }
}
export function moonBall(x, y, r, c = P.moon, c2 = P.crater) {
  g.save(); g.fillStyle = c; g.beginPath(); g.arc(x, y, r, 0, TAU); g.fill();
  g.fillStyle = c2; for (const [a, b, s] of [[-.35, -.3, .22], [.3, .1, .16], [-.1, .4, .13], [.4, -.4, .1]]) { g.beginPath(); g.arc(x + a * r, y + b * r, s * r, 0, TAU); g.fill(); }
  g.fillStyle = 'rgba(20,20,60,.25)'; g.beginPath(); g.arc(x + r * .3, y + r * .1, r * 1.05, 0, TAU); g.arc(x - r * .12, y - r * .06, r, 0, TAU, true); g.fill('evenodd'); g.restore();
}
export const fullMoon = (x, y, r) => { glow(x, y, r * 2.2, '230,235,255', .25); moonBall(x, y, r, '#eef0f8', '#cfd4e6'); };
