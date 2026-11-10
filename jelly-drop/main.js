// Jelly Drop — "0% vs 100% soft" test. Blender renders the two physics runs (course.py); this page plays them back to back
// at 30 fps with the round label and a softness meter, and exposes the impact timings (from each run's track.json) for the sound.
import * as K from './kit.js';
import { clamp, seg, ss, eo } from '/core/lib.js';
const { P, text, pop } = K;
const W = 1080, H = 1920, CX = W / 2;
const cv = document.getElementById('c'), g = cv.getContext('2d'); K.setup(g, W, H);
await document.fonts.load('900 80px NU');
const ROUNDS = [{ dir: 'frames-rigid', label: '0% SOFT', soft: 0, n: 120 }, { dir: 'frames-soft', label: '100% SOFT', soft: 1, n: 150 }];
for (const r of ROUNDS) r.track = (await (await fetch(`${r.dir}/track.json`)).json()).track;
const FPS = 30, INTRO = .25; let t0 = INTRO; for (const r of ROUNDS) { r.t0 = t0; t0 += r.n / FPS; }
const DUR = +(t0 + .6).toFixed(2);
const img = (dir, f) => new Promise((res, rej) => { const im = new Image(); im.onload = () => res(im); im.onerror = rej; im.src = `${dir}/${String(f).padStart(4, '0')}.webp`; });

// impacts from the tracks: a sharp change of vertical speed (landing, jamming) and the squeeze (fast height change of the jelly)
const EV = [];
for (const [ri, r] of ROUNDS.entries()) {
  EV.push({ type: 'scene', i: ri, t: +r.t0.toFixed(3) });
  const z = r.track.map(p => p.z), sq = r.track.map(p => p.squash);
  for (let i = 2; i < z.length - 1; i++) {
    const v0 = z[i - 1] - z[i - 2], v1 = z[i + 1] - z[i], dv = v1 - v0;
    if (v0 < -.03 && dv > .025) EV.push({ type: 'cue', name: r.soft ? 'splat' : 'clunk', t: +(r.t0 + (i - 1) / FPS).toFixed(3), k: +Math.min(1, dv * 8).toFixed(2) });
    const ds = sq[i] - sq[i - 1]; if (r.soft && i > 15 && Math.abs(ds) > .06) EV.push({ type: 'cue', name: 'squish', t: +(r.t0 + (i - 1) / FPS).toFixed(3), k: +Math.min(1, Math.abs(ds) * 3).toFixed(2) });
  }
}
EV.sort((a, b) => a.t - b.t);

async function render(t) {
  let ri = ROUNDS.findIndex((r, i) => t < (ROUNDS[i + 1]?.t0 ?? 1e9)); if (ri < 0) ri = 0; const r = ROUNDS[ri];
  const f = clamp(Math.floor((t - r.t0) * FPS) + 1, 1, r.n), im = await img(r.dir, f);
  g.setTransform(1, 0, 0, 1, 0, 0); g.globalAlpha = 1; g.drawImage(im, 0, 0, W, H);
  // the round label and the softness meter (it fills when the round starts)
  const k = pop(t, r.t0 - .05, .4), fill = ss(seg(t, r.t0 + .1, r.t0 + .7)) * r.soft;
  g.save(); g.translate(CX, 230); g.scale(.9 + .1 * k, .9 + .1 * k); text(r.label, 0, 0, 120, P.white, 1000, '#2b2f4a', 18); g.restore();
  g.fillStyle = 'rgba(43,47,74,.55)'; g.beginPath(); g.roundRect(CX - 300, 290, 600, 44, 22); g.fill();
  if (fill > 0) { g.fillStyle = '#ff5a5f'; g.beginPath(); g.roundRect(CX - 294, 296, 588 * fill, 32, 16); g.fill(); }
  g.fillStyle = '#ffffff'; g.beginPath(); g.arc(CX - 294 + 588 * fill + (fill ? -16 : 16), 312, 20, 0, Math.PI * 2); g.fill();
  const fl = 1 - clamp((t - r.t0) / .18); if (ri > 0 && fl > 0) { g.fillStyle = `rgba(255,255,255,${.7 * fl})`; g.fillRect(0, 0, W, H); }
  const fo = seg(t, DUR - .4, DUR); if (fo > 0) { g.fillStyle = `rgba(0,0,0,${fo})`; g.fillRect(0, 0, W, H); }
}
window.EV = EV; window.DUR = DUR; window.render = render; window.SUBS = [];
await render(+(new URLSearchParams(location.search).get('t') ?? 1));
window.READY = true;
