// People for "What If a Rogue Planet Passed Earth?": a cast of everyday characters whose faces carry the story
// (wonder, shock, relief, fear). Flat vector in the Beyond Everything style, drawn on top of kit.js.
//   person(x, y, s, t, o)  full body, feet at (x, y), about 610·s px tall
//   bust(x, y, s, t, o)    a reaction close-up: head and shoulders, the shoulders' base at (x, y)
// o: skin, hair, hairCol, top, topD, legs, glasses, coat (lab coat), mood, arms, look, lookY, blink, tilt, bob, held
import * as K from './kit.js';
import { clamp, TAU } from '/core/lib.js';
const { P } = K;
let g;
export function setup(ctx) { g = ctx; }

export const SKIN = ['#f2c29b', '#e0a87c', '#c58658', '#9a6440', '#6e4630'];
export const CAST = {                                             // recurring characters, so the viewer recognises them
  you: { skin: SKIN[1], hair: 'short', hairCol: '#2b2140', top: '#5b6cff', topD: '#4252d6', legs: '#2d2f5e' },
  mum: { skin: SKIN[1], hair: 'long', hairCol: '#4a2a1e', top: '#e2557b', topD: '#b83d62', legs: '#33305e' },
  astro: { skin: SKIN[3], hair: 'curly', hairCol: '#1d1a2e', top: '#3fa8a0', topD: '#2f8a83', legs: '#2d2f5e', glasses: 1, coat: 1 },
  astro2: { skin: SKIN[0], hair: 'bun', hairCol: '#c9733a', top: '#8a5cff', topD: '#6c45d6', legs: '#2d2f5e', glasses: 1, coat: 1 },
  gran: { skin: SKIN[2], hair: 'bald', hairCol: '#d8d8e8', top: '#f2a65a', topD: '#d68a40', legs: '#4a3a5e', glasses: 1 },
  kid2: { skin: SKIN[4], hair: 'spiky', hairCol: '#14121f', top: '#ffc73a', topD: '#e0a820', legs: '#2d4a8a' },
  teen: { skin: SKIN[0], hair: 'bun', hairCol: '#e8c14a', top: '#5fcf7a', topD: '#44ad5f', legs: '#2d2f5e' },
  dad: { skin: SKIN[4], hair: 'short', hairCol: '#14121f', top: '#ff6b5a', topD: '#d94f40', legs: '#30305a', beard: 1 },
};
export const as = (name, o = {}) => ({ ...CAST[name], ...o });

// ───────── face: r = head radius. look/lookY move the eyes (-1..1); lookY -1 = looking up
export function face(r, mood, t, look = 0, lookY = 0, seed = 0) {
  const ex = r * .34, ey = -r * .02 + lookY * r * .06, lx = look * r * .07;
  const blink = ((t + seed * 1.37) % 3.9) < .11 && !['relief', 'cry', 'sleepy'].includes(mood);
  const wide = mood === 'shock' || mood === 'awe' || mood === 'scared';
  g.lineCap = 'round'; g.lineJoin = 'round';
  for (const s of [-1, 1]) {
    g.save(); g.translate(s * ex + lx, ey);
    if (mood === 'relief' || mood === 'sleepy' || mood === 'cry') {                         // closed, curved eyes
      g.strokeStyle = P.navy; g.lineWidth = r * .07; g.beginPath();
      if (mood === 'relief') g.arc(0, r * .05, r * .13, Math.PI * 1.15, Math.PI * 1.85); else g.arc(0, -r * .06, r * .13, Math.PI * .15, Math.PI * .85);
      g.stroke();
    } else if (blink) { g.strokeStyle = P.navy; g.lineWidth = r * .06; g.beginPath(); g.moveTo(-r * .12, 0); g.lineTo(r * .12, 0); g.stroke(); }
    else if (wide) {                                                                              // white eyes, small pupils
      const er = r * (mood === 'awe' ? .17 : .2);
      g.fillStyle = P.white; g.strokeStyle = P.navy; g.lineWidth = r * .035; g.beginPath(); g.ellipse(0, 0, er, er * 1.15, 0, 0, TAU); g.fill(); g.stroke();
      g.fillStyle = P.navy; g.beginPath(); g.arc(look * er * .35, lookY * er * .45, er * (mood === 'awe' ? .55 : .38), 0, TAU); g.fill();
      if (mood === 'awe') { g.fillStyle = P.white; g.beginPath(); g.arc(look * er * .35 - er * .18, lookY * er * .45 - er * .2, er * .2, 0, TAU); g.fill(); }
    } else {
      const ew = r * .11, eh = r * (mood === 'think' || mood === 'angry' ? .1 : .15);
      g.fillStyle = P.navy; g.beginPath(); g.ellipse(0, 0, ew, eh, 0, 0, TAU); g.fill();
      g.fillStyle = P.white; g.beginPath(); g.arc(-ew * .3, -eh * .35, ew * .38, 0, TAU); g.fill();
    }
    // brows
    g.strokeStyle = P.navy; g.lineWidth = r * .05; g.beginPath();
    const by = -r * (wide ? .32 : .24);
    if (mood === 'shock' || mood === 'awe') { g.arc(0, by + r * .12, r * .16, Math.PI * 1.2, Math.PI * 1.8); }
    else if (mood === 'worried' || mood === 'scared' || mood === 'sad' || mood === 'cry') { g.moveTo(s * r * .15, by + r * .04); g.lineTo(-s * r * .12, by - r * .07); }
    else if (mood === 'angry') { g.moveTo(s * r * .15, by - r * .06); g.lineTo(-s * r * .12, by + r * .05); }
    else if (mood === 'think') { const up = s > 0 ? r * .08 : 0; g.moveTo(-r * .13, by - up); g.lineTo(r * .13, by - up - (s > 0 ? r * .03 : 0)); }
    else { g.moveTo(-r * .12, by); g.quadraticCurveTo(0, by - r * .06, r * .12, by); }
    g.stroke();
    g.restore();
  }
  // cheeks
  if (mood !== 'scared' && mood !== 'shock') { g.fillStyle = 'rgba(255,120,150,.45)'; for (const s of [-1, 1]) { g.beginPath(); g.ellipse(s * r * .52, r * .2, r * .1, r * .06, 0, 0, TAU); g.fill(); } }
  // mouth
  const my = r * .32; g.strokeStyle = P.navy; g.fillStyle = P.navy; g.lineWidth = r * .055;
  g.beginPath();
  switch (mood) {
    case 'happy': case 'relief': g.arc(0, my - r * .1, r * .15, Math.PI * .15, Math.PI * .85); g.stroke(); break;
    case 'grin': g.moveTo(-r * .2, my - r * .04); g.quadraticCurveTo(0, my - r * .02, r * .2, my - r * .04); g.quadraticCurveTo(0, my + r * .26, -r * .2, my - r * .04); g.fill();
      g.fillStyle = P.white; g.beginPath(); g.moveTo(-r * .15, my - r * .02); g.lineTo(r * .15, my - r * .02); g.lineTo(r * .12, my + r * .05); g.lineTo(-r * .12, my + r * .05); g.fill(); break;
    case 'awe': g.ellipse(0, my, r * .08, r * .1, 0, 0, TAU); g.fill(); break;
    case 'shock': { const o = 1 + .06 * Math.sin(t * 9); g.ellipse(0, my + r * .04, r * .13 * o, r * .2 * o, 0, 0, TAU); g.fill();
      g.fillStyle = '#ff7a8a'; g.beginPath(); g.ellipse(0, my + r * .15 * o, r * .08, r * .06, 0, 0, TAU); g.fill(); break; }
    case 'scared': { g.fillStyle = P.white; g.beginPath(); g.roundRect(-r * .2, my - r * .06, r * .4, r * .14, r * .05); g.fill(); g.stroke();
      g.lineWidth = r * .025; g.beginPath(); g.moveTo(-r * .2, my + r * .01); g.lineTo(r * .2, my + r * .01); for (let i = -1; i <= 1; i++) { g.moveTo(i * r * .1, my - r * .06); g.lineTo(i * r * .1, my + r * .08); } g.stroke(); break; }
    case 'worried': g.moveTo(-r * .14, my + r * .03); g.quadraticCurveTo(-r * .07, my - r * .04, 0, my + r * .02); g.quadraticCurveTo(r * .07, my + r * .07, r * .14, my); g.stroke(); break;
    case 'sad': case 'cry': g.arc(0, my + r * .12, r * .13, Math.PI * 1.15, Math.PI * 1.85); g.stroke(); break;
    case 'angry': case 'think': g.moveTo(-r * .12, my + r * .02); g.lineTo(r * .1, my - r * .01); g.stroke(); break;
    case 'talk': { const o = .4 + .6 * Math.abs(Math.sin(t * 11)); g.ellipse(0, my, r * .12, r * .1 * o + r * .02, 0, 0, TAU); g.fill(); break; }
    default: g.moveTo(-r * .1, my); g.lineTo(r * .1, my); g.stroke();
  }
  if (mood === 'cry') {
    g.fillStyle = '#9fe2ff'; for (const s of [-1, 1]) { const p = (t * .9 + (s > 0 ? .5 : 0)) % 1; g.beginPath(); g.ellipse(s * ex + lx + s * r * .02, ey + r * .15 + p * r * .5, r * .05, r * .08, 0, 0, TAU); g.fill(); }
  }
  if (mood === 'scared' || mood === 'shock') { g.fillStyle = '#9fe2ff'; g.beginPath(); const sx = r * .72, sy = -r * .42 + ((t * .7) % 1) * r * .3; g.moveTo(sx, sy - r * .1); g.quadraticCurveTo(sx + r * .08, sy + r * .02, sx, sy + r * .06); g.quadraticCurveTo(sx - r * .08, sy + r * .02, sx, sy - r * .1); g.fill(); }
}

// ───────── head with hair, glasses, beard (centre 0,0, radius r)
function hairBack(r, o) {
  g.fillStyle = o.hairCol;
  if (o.hair === 'long') { g.beginPath(); g.roundRect(-r * 1.12, -r * .6, r * 2.24, r * 2.0, [r, r, r * .35, r * .35]); g.fill(); }
  if (o.hair === 'bun') { g.beginPath(); g.arc(0, -r * 1.12, r * .42, 0, TAU); g.fill(); }
}
function hairFront(r, o) {
  g.fillStyle = o.hairCol;
  switch (o.hair) {
    case 'short': g.beginPath(); g.arc(0, -r * .2, r * 1.03, Math.PI * 1.02, Math.PI * 1.98); g.fill(); g.beginPath(); g.ellipse(-r * .55, -r * .62, r * .55, r * .38, -.5, 0, TAU); g.fill(); break;
    case 'long': g.beginPath(); g.arc(0, -r * .15, r * 1.06, Math.PI * 1.0, Math.PI * 2.0); g.fill(); g.beginPath(); g.ellipse(r * .3, -r * .62, r * .7, r * .34, .35, 0, TAU); g.fill(); break;
    case 'bun': g.beginPath(); g.arc(0, -r * .18, r * 1.03, Math.PI * 1.03, Math.PI * 1.97); g.fill(); break;
    case 'curly': for (let i = 0; i < 9; i++) { const a = Math.PI * (1.0 + i / 8), rr = r * 1.0; g.beginPath(); g.arc(Math.cos(a) * rr, Math.sin(a) * rr * .95 - r * .08, r * .3, 0, TAU); g.fill(); } g.beginPath(); g.arc(0, -r * .3, r * .85, Math.PI, TAU); g.fill(); break;
    case 'spiky': g.beginPath(); g.moveTo(-r * 1.02, -r * .15); for (let i = 0; i <= 6; i++) { const a = Math.PI * (1.0 + i / 6); g.lineTo(Math.cos(a) * r * 1.0, Math.sin(a) * r * .9 - r * .1); if (i < 6) { const b = Math.PI * (1.0 + (i + .5) / 6); g.lineTo(Math.cos(b) * r * 1.38, Math.sin(b) * r * 1.3 - r * .1); } } g.closePath(); g.fill(); break;
    case 'bald': for (const s of [-1, 1]) { g.beginPath(); g.ellipse(s * r * .9, -r * .1, r * .2, r * .32, 0, 0, TAU); g.fill(); } break;
  }
}
export function head(r, t, o) {
  hairBack(r, o);
  g.fillStyle = o.skin; for (const s of [-1, 1]) { g.beginPath(); g.ellipse(s * r * .98, r * .05, r * .16, r * .22, 0, 0, TAU); g.fill(); }   // ears
  g.beginPath(); g.arc(0, 0, r, 0, TAU); g.fill();
  if (o.beard) { g.fillStyle = o.hairCol; g.beginPath(); g.arc(0, 0, r, Math.PI * .12, Math.PI * .88); g.quadraticCurveTo(-r * .3, r * .5, 0, r * .55); g.quadraticCurveTo(r * .3, r * .5, Math.cos(Math.PI * .12) * r, Math.sin(Math.PI * .12) * r); g.fill(); }
  hairFront(r, o);
  face(r, o.mood || 'happy', t, o.look ?? 0, o.lookY ?? 0, o.seed ?? 0);
  if (o.glasses) { g.strokeStyle = '#1b1a33'; g.lineWidth = r * .05; const ey = -r * .02 + (o.lookY ?? 0) * r * .06; for (const s of [-1, 1]) { g.beginPath(); g.arc(s * r * .34, ey, r * .23, 0, TAU); g.stroke(); } g.beginPath(); g.moveTo(-r * .11, ey); g.lineTo(r * .11, ey); g.stroke(); }
}

// ───────── arms. Shoulders at (±60, -360) in body units. Each pose gives [elbow, hand] for left (-1) and right (+1)
function armPose(mode, t, o) {
  const f = Math.sin(t * 12) * 30, w = Math.sin(t * 9) * 30;
  switch (mode) {
    case 'up': return [[[-130, -460], [-150, -580]], [[130, -460], [150, -580]]];
    case 'flail': return [[[-130, -460], [-150 + f, -560 - f]], [[130, -460], [150 - f, -560 + f]]];
    case 'cheer': { const b = Math.abs(Math.sin(t * 7)) * 30; return [[[-140, -470], [-120, -600 - b]], [[140, -470], [120, -600 - b]]]; }
    case 'point': return [[[-100, -260], [-95, -190]], [[150, -420], [230, -560]]];
    case 'pointL': return [[[-150, -420], [-230, -560]], [[100, -260], [95, -190]]];
    case 'cheeks': return [[[-150, -330], [-78, -440]], [[150, -330], [78, -440]]];
    case 'mouth': return [[[-120, -300], [-22, -415]], [[120, -300], [22, -415]]];
    case 'head': return [[[-170, -520], [-70, -560]], [[170, -520], [70, -560]]];
    case 'binoc': return [[[-130, -330], [-40, -470]], [[130, -330], [40, -470]]];
    case 'phone': return [[[-100, -260], [-95, -190]], [[110, -260], [30, -330]]];
    case 'phone2': return [[[-110, -260], [-30, -330]], [[110, -260], [30, -330]]];
    case 'hips': return [[[-150, -290], [-80, -230]], [[150, -290], [80, -230]]];
    case 'wave': return [[[-100, -260], [-90, -190]], [[150, -420], [170 + w, -540]]];
    case 'hold': return [[[-100, -260], [-95, -190]], [[120, -250], [170, -200]]];        // right hand out to the side (holding a hand / a bag)
    case 'holdL': return [[[-120, -250], [-170, -200]], [[100, -260], [95, -190]]];
    case 'shrug': return [[[-150, -300], [-190, -360]], [[150, -300], [190, -360]]];
    case 'type': return [[[-110, -260], [-60, -250]], [[110, -260], [60, -250]]];
    default: return [[[-100, -260], [-95, -190]], [[100, -260], [95, -190]]];
  }
}
function arms(t, o, front) {
  const mode = o.arms || 'down', near = ['cheeks', 'mouth', 'binoc', 'head'].includes(mode);
  if (near !== front) return;
  const pose = armPose(mode, t, o);
  [-1, 1].forEach((sd, i) => {
    const [[ex, ey], [hx, hy]] = pose[i];
    g.strokeStyle = o.coat ? '#eef1fb' : o.top; g.lineWidth = 40; g.lineCap = 'round';
    g.beginPath(); g.moveTo(sd * 60, -360); g.quadraticCurveTo(ex, ey, hx, hy); g.stroke();
    g.fillStyle = o.skin; g.beginPath(); g.arc(hx, hy, 24, 0, TAU); g.fill();
  });
  if (mode === 'binoc') { g.fillStyle = '#1b1a33'; for (const s of [-1, 1]) { g.beginPath(); g.roundRect(s * 34 - 26, -505, 52, 70, 14); g.fill(); } g.fillRect(-10, -490, 20, 30); g.fillStyle = '#7fd3ff'; for (const s of [-1, 1]) { g.beginPath(); g.arc(s * 34, -505, 18, Math.PI, TAU); g.fill(); } }
  if (mode === 'phone' || mode === 'phone2') { g.fillStyle = '#1b1a33'; g.beginPath(); g.roundRect(-4, -390, 60, 100, 10); g.fill(); g.fillStyle = o.screen || '#7fd3ff'; g.fillRect(3, -382, 46, 82); }
}

// ───────── full body
export function person(x, y, s, t, o = {}) {
  g.save(); g.translate(x, y + (o.bob ? Math.abs(Math.sin(t * 7 + (o.seed || 0))) * -14 * o.bob : 0)); g.rotate(o.rot || 0); g.scale(s * (o.flip ? -1 : 1), s);
  // legs + shoes
  g.strokeStyle = o.legs; g.lineWidth = 46; g.lineCap = 'round';
  const step = o.walk ? Math.sin(t * 8 + (o.seed || 0)) : 0;
  for (const sd of [-1, 1]) { g.beginPath(); g.moveTo(sd * 26, -170); g.lineTo(sd * 30 + step * sd * 40, -24); g.stroke(); }
  g.fillStyle = '#f4f4fb'; for (const sd of [-1, 1]) { g.beginPath(); g.roundRect(sd * 30 + step * sd * 40 - 30 + sd * 10, -34, 62, 32, 14); g.fill(); }
  // body
  g.fillStyle = o.top; g.beginPath(); g.roundRect(-76, -405, 152, 255, 60); g.fill();
  g.fillStyle = o.topD; g.beginPath(); g.roundRect(-76, -405, 50, 255, [60, 0, 0, 60]); g.fill();
  if (o.coat) { g.fillStyle = '#eef1fb'; g.beginPath(); g.roundRect(-82, -405, 164, 300, [60, 60, 20, 20]); g.fill(); g.fillStyle = o.top; g.beginPath(); g.moveTo(-34, -405); g.lineTo(0, -320); g.lineTo(34, -405); g.fill(); g.fillStyle = '#c9cee6'; g.fillRect(-3, -320, 6, 200); }
  arms(t, o, false);
  // head
  const hy = -478 + Math.sin(t * 1.3 + (o.seed || 0)) * 2;
  g.save(); g.translate(0, hy); g.rotate(o.tilt || 0); head(68, t, o); g.restore();
  arms(t, o, true);
  if (o.held) o.held(g);
  g.restore();
}

// ───────── reaction close-up: shoulders at the bottom (x, y), head above. r = head radius at s = 1 is 150
export function bust(x, y, s, t, o = {}) {
  g.save(); g.translate(x, y); g.scale(s, s);
  const sh = o.shake ? [Math.sin(t * 61) * 6 * o.shake, Math.cos(t * 47) * 4 * o.shake] : [0, 0];
  g.translate(...sh);
  g.fillStyle = o.coat ? '#eef1fb' : o.top; g.beginPath(); g.roundRect(-270, -230, 540, 330, [170, 170, 0, 0]); g.fill();
  if (o.coat) { g.fillStyle = o.top; g.beginPath(); g.moveTo(-80, -230); g.lineTo(0, -90); g.lineTo(80, -230); g.fill(); }
  else { g.fillStyle = o.topD; g.beginPath(); g.roundRect(-270, -230, 120, 330, [170, 0, 0, 0]); g.fill(); }
  g.fillStyle = o.skin; g.fillRect(-45, -290, 90, 80); g.fillStyle = 'rgba(0,0,0,.12)'; g.fillRect(-45, -240, 90, 26);
  g.save(); g.translate(0, -420 + Math.sin(t * 1.4) * 3); g.rotate(o.tilt || 0); head(150, t, o); g.restore();
  const hands = o.arms;
  if (hands === 'cheeks' || hands === 'mouth' || hands === 'head') {
    const pts = hands === 'cheeks' ? [[-170, -360], [170, -360]] : hands === 'mouth' ? [[-50, -330], [50, -330]] : [[-150, -540], [150, -540]];
    for (const [hx, hy] of pts) { g.strokeStyle = o.coat ? '#eef1fb' : o.top; g.lineWidth = 80; g.lineCap = 'round'; g.beginPath(); g.moveTo(Math.sign(hx) * 230, 60); g.quadraticCurveTo(Math.sign(hx) * 300, -150, hx, hy + 40); g.stroke(); g.fillStyle = o.skin; g.beginPath(); g.ellipse(hx, hy, 52, 62, 0, 0, TAU); g.fill(); }
  }
  if (o.held) o.held(g);
  g.restore();
}
