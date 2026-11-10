// Jelly Drop v2 — five rounds (0/25/50/75/100% soft) rendered in Blender (course2.py), played back to back at 30 fps with the
// round label and a softness meter. Rounds after the second skip the (identical) ramp ride and cut in just before the funnel.
import * as K from './kit.js';
import { clamp, seg, ss } from '/core/lib.js';
const { P, text, pop } = K;
const W = 1080, H = 1920, CX = W / 2;
const cv = document.getElementById('c'), g = cv.getContext('2d'); K.setup(g, W, H);
await document.fonts.load('900 80px NU');
const ROUNDS = await (await fetch('rounds.json')).json();
const FPS = 30, INTRO = .2; let t0 = INTRO; for (const r of ROUNDS) { r.t0 = t0; r.n = r.last - r.first + 1; t0 += r.n / FPS; }
const DUR = +(t0 + .5).toFixed(2);
const img = (L, f) => new Promise((res, rej) => { const im = new Image(); im.onload = () => res(im); im.onerror = rej; im.src = `frames-${L}/${String(f).padStart(4, '0')}.webp`; });
const EV = ROUNDS.map((r, i) => ({ type: 'scene', i, t: +r.t0.toFixed(3) }));

async function render(t) {
  let ri = ROUNDS.findIndex((r, i) => t < (ROUNDS[i + 1]?.t0 ?? 1e9)); if (ri < 0) ri = 0; const r = ROUNDS[ri];
  const f = clamp(r.first + Math.floor((t - r.t0) * FPS), r.first, r.last), im = await img(r.level, f);
  g.setTransform(1, 0, 0, 1, 0, 0); g.globalAlpha = 1; g.drawImage(im, 0, 0, W, H);
  const k = pop(t, r.t0 - .05, .4), prev = ri ? ROUNDS[ri - 1].level / 100 : 0, fill = prev + (r.level / 100 - prev) * ss(seg(t, r.t0 + .05, r.t0 + .6));
  g.save(); g.translate(CX, 210); g.scale(.9 + .1 * k, .9 + .1 * k); text(`${r.level}% SOFT`, 0, 0, 118, P.white, 1000, '#5b3a2e', 18); g.restore();
  g.fillStyle = 'rgba(91,58,46,.45)'; g.beginPath(); g.roundRect(CX - 300, 266, 600, 44, 22); g.fill();
  if (fill > .01) { g.fillStyle = '#8b5cf6'; g.beginPath(); g.roundRect(CX - 294, 272, 588 * fill, 32, 16); g.fill(); }
  g.fillStyle = '#ffffff'; g.beginPath(); g.arc(CX - 294 + 16 + (588 - 32) * fill, 288, 20, 0, Math.PI * 2); g.fill();
  const fl = 1 - clamp((t - r.t0) / .16); if (ri > 0 && fl > 0) { g.fillStyle = `rgba(255,255,255,${.6 * fl})`; g.fillRect(0, 0, W, H); }
  const fo = seg(t, DUR - .4, DUR); if (fo > 0) { g.fillStyle = `rgba(0,0,0,${fo})`; g.fillRect(0, 0, W, H); }
}
window.EV = EV; window.DUR = DUR; window.render = render; window.SUBS = [];
await render(+(new URLSearchParams(location.search).get('t') ?? 1));
window.READY = true;
