// "What If a Rogue Planet Passed Earth?" — flat-vector story Short, vertical 1080×1920, canvas 2D, deterministic in t.
// The new presentation style: told to "you", a time-stamped escalation (Year 1 → Year 5 → the week of the pass), people
// reacting on screen in every beat, key words only (no caption boxes), and a twist that turns the facts into a choice.
import * as K from './kit.js';
import * as G from './geo.js';
import * as PP from './people.js';
import * as PL from './planet.js';
import { clamp, lerp, seg, ss, eio, eo, mulberry, TAU } from '/core/lib.js';
const { P, sparkle, glow, pop } = K;
const { person, bust, as } = PP;

const W = 1080, H = 1920, CX = W / 2;
const cv = document.getElementById('c'), g = cv.getContext('2d');
K.setup(g, W, H); K.makeStars(120, 23); G.setup(g); PP.setup(g); PL.setup(g);
const { rogue, moonBall, fullMoon } = PL;
await document.fonts.load('900 80px NU'); await document.fonts.load('800 40px NU'); await document.fonts.load('italic 800 40px NU');
const words = await (await fetch('voices/words.json')).json();
const lines = await (await fetch('lines.json')).json();
const dur = await (await fetch('voices/dur.json')).json();

// ───────── timeline. One scene per line, except the countdown (s23–s25 share a scene)
const IDS = lines.map(l => l.id), VO = {};
const LINE_GAP = .2, GAP = { s01: .35, s06: .3, s10: .3, s11: .35, s14: .35, s15: .45, s17: .45, s19: .4, s20: .45, s21: .3, s22: .45, s23: .55, s24: .55, s25: .6 };
{ let t = .3; for (const id of IDS) { VO[id] = +t.toFixed(3); t += dur[id] + (GAP[id] ?? LINE_GAP); } }
const LAST = IDS[IDS.length - 1], DUR = +(VO[LAST] + dur[LAST] + 1.6).toFixed(2);
const nrm = s => s.toLowerCase().replace(/[^a-z0-9]/g, '');
const at = (id, w, k = 0, e = 1) => { let n = 0; for (const x of words[id]) if (nrm(x[0]).startsWith(nrm(w)) && n++ === k) return VO[id] + Math.max(0, x[e]); throw new Error(`${w} in ${id}`); };
const end = id => VO[id] + dur[id];
const SAME = new Set(['s24', 's25']);
const SIDS = IDS.filter(id => !SAME.has(id));
const S = [0, ...SIDS.slice(1).map(id => VO[id] - .2), DUR];
const sceneAt = t => { let i = 0; while (i < S.length - 2 && t >= S[i + 1]) i++; return i; };
const XF = .35, LOOP = .8;
const T = {
  giant: at('s01', 'giant'), planet1: at('s01', 'planet'), drifting: at('s01', 'drifting'), passed: at('s01', 'passed'), earth1: at('s01', 'earth'),
  comet: at('s02', 'comet'), asteroid: at('s02', 'asteroid'), whole: at('s02', 'whole'), jupiter: at('s02', 'jupiter'), nosun: at('s02', 'sun'),
  rogue: at('s03', 'rogue'), real: at('s03', 'real'), galaxy: at('s03', 'galaxy'), more: at('s03', 'more'), stars3: at('s03', 'stars'),
  year1: at('s04', 'year'), spot: at('s04', 'spot'), neptune: at('s04', 'neptune'), racing: at('s04', 'racing'), twenty4: at('s04', 'twenty'), second4: at('s04', 'second'),
  check: at('s05', 'check'), wont: at('s05', 'won'), hit: at('s05', 'hit'), miss: at('s05', 'miss'), ten: at('s05', 'ten'), km5: at('s05', 'kilometres'),
  safe: at('s06', 'safe'), only: at('s06', 'only'), twenty6: at('s06', 'twenty'), moon6: at('s06', 'moon'), weighs: at('s06', 'weighs'), three6: at('s06', 'three'), earths: at('s06', 'earths'),
  year5: at('s07', 'year'), brightest: at('s07', 'brightest'), moon7: at('s07', 'moon'), binoculars: at('s07', 'binoculars'), stripes: at('s07', 'stripes'),
  week: at('s08', 'week'), bigger: at('s08', 'bigger'), full: at('s08', 'full'), nobody: at('s08', 'nobody'), everyone: at('s08', 'everyone'), staring: at('s08', 'staring'),
  gravity: at('s09', 'gravity'), harder: at('s09', 'harder'), tides9: at('s09', 'tides'), surge: at('s09', 'surge'), seaside: at('s09', 'seaside'), leave: at('s09', 'leave'),
  scientists: at('s10', 'scientists'), quakes: at('s10', 'earthquakes'), tides10: at('s10', 'tides'), faults: at('s10', 'faults'), slip: at('s10', 'slip'),
  days11: at('s11', 'days'), gone: at('s11', 'gone'), but11: at('s11', 'but'), something: at('s11', 'something'),
  pull: at('s12', 'pull'), drags: at('s12', 'drags'), orbit: at('s12', 'orbit'), three12: at('s12', 'three'),
  closer: at('s13', 'closer'), sun13: at('s13', 'sun'), hotter: at('s13', 'hotter'), forecast: at('s13', 'forecast'),
  farther: at('s14', 'farther'), ice: at('s14', 'ice'), year14: at('s14', 'year'), two14: at('s14', 'two'), weeks: at('s14', 'weeks'),
  strangest: at('s15', 'strangest'), leaves15: at('s15', 'leaves'), telescopes: at('s15', 'telescopes'), zoom: at('s15', 'zoom'), moons15: at('s15', 'moons'),
  night17: at('s17', 'night'), lights: at('s17', 'lights'),
  cities: VO.s18, civ: at('s18', 'civilization'), drifted: at('s18', 'drifted'), millions18: at('s18', 'millions'), oursun: at('s18', 'sun'), first: at('s18', 'first'), close18: at('s18', 'close'),
  message: at('s19', 'message'), phone: at('s19', 'phone'), same: at('s19', 'same'),
  star20: at('s20', 'star'), warm20: at('s20', 'warm'), please: at('s20', 'please'), let20: at('s20', 'let'), stay20: at('s20', 'stay'),
  leaves21: at('s21', 'leaves'), three21: at('s21', 'three'), dark21: at('s21', 'dark'), forever: at('s21', 'forever'), send: at('s21', 'send'), millions21: at('s21', 'millions'), nobody21: at('s21', 'nobody'), refugees: at('s21', 'refugees'), invaders: at('s21', 'invaders'),
  mum: VO.s22, scared22: at('s22', 'scared'),
  c3: VO.s23, c2: VO.s24, c1: VO.s25,
  would: VO.s26, stay26: at('s26', 'stay'), choose: at('s26', 'choose'),
};

// ───────── type: plain key words, no boxes (thick outline + soft shadow so they read on any background)
function word(s, x, y, px, col = P.white, k = 1, rot = 0, maxW = 960, wt = 1000) {
  if (k <= 0) return; g.save(); g.font = `${wt} ${px}px NU`; const w = g.measureText(s).width, f = Math.min(1, maxW / w);
  g.translate(x, y); g.rotate(rot); g.scale(k * f, k * f); g.textAlign = 'center'; g.textBaseline = 'alphabetic'; g.lineJoin = 'round';
  g.fillStyle = 'rgba(5,3,25,.45)'; g.fillText(s, 0, px * .08);
  g.lineWidth = px * .2; g.strokeStyle = P.navy; g.strokeText(s, 0, 0); g.fillStyle = col; g.fillText(s, 0, 0); g.restore();
}
const keyAt = (t, t0, t1 = 1e9) => pop(t, t0 - .12) * (1 - ss(seg(t, t1 - .2, t1)));
function when(s, t, t0, sub) {                                     // the time stamp: YEAR 1, YEAR 5, PASS WEEK
  const k = pop(t, t0 - .15, .3); if (k <= 0) return;
  word(s, CX, 250, 118, P.gold, k, -.03);
  if (sub) word(sub, CX, 318, 44, P.white, k, -.03, 900, 900);
}
function quote(s, x, y, px, col, t, t0, ws) {                       // spoken lines from characters: word by word, italic, no box
  g.save(); const A = g.globalAlpha; g.font = `italic 900 ${px}px NU`; g.textAlign = 'left'; g.lineJoin = 'round';
  const parts = s.split(' '), sp = g.measureText(' ').width, widths = parts.map(p => g.measureText(p).width), tot = widths.reduce((a, b) => a + b, 0) + sp * (parts.length - 1);
  let xx = x - tot / 2;
  parts.forEach((p, i) => { const k = clamp((t - (ws ? ws[i] : t0)) / .12); if (k > 0) { g.globalAlpha = A * k; g.lineWidth = px * .2; g.strokeStyle = P.navy; g.strokeText(p, xx, y); g.fillStyle = col; g.fillText(p, xx, y); } xx += widths[i] + sp; });
  g.restore();
}
const wordTimes = (id, from, n) => words[id].slice(from, from + n).map(w => VO[id] + Math.max(0, w[1]));
const shake = (t, a) => a > 0 ? [Math.sin(t * 53) * a, Math.cos(t * 47) * a] : [0, 0];
function cross(x, y, r, k) { if (k <= 0) return; g.save(); g.translate(x, y); g.scale(k, k); g.strokeStyle = P.red; g.lineWidth = 20; g.lineCap = 'round'; g.beginPath(); g.moveTo(-r, -r); g.lineTo(r, r); g.moveTo(r, -r); g.lineTo(-r, r); g.stroke(); g.restore(); }
function tick(x, y, r, k, col = '#5fe08a') { if (k <= 0) return; g.save(); g.translate(x, y); g.scale(k, k); g.strokeStyle = col; g.lineWidth = 22; g.lineCap = 'round'; g.lineJoin = 'round'; g.beginPath(); g.moveTo(-r, 0); g.lineTo(-r * .3, r * .7); g.lineTo(r, -r * .7); g.stroke(); g.restore(); }

// ───────── backgrounds
const bg = (t, top = P.bg0, bot = P.bg1) => K.bg(t, top, bot, g.globalAlpha);
function sky(t, top, bot, stars = 1) {
  const gr = g.createLinearGradient(0, 0, 0, H); gr.addColorStop(0, top); gr.addColorStop(1, bot); g.fillStyle = gr; g.fillRect(0, 0, W, H);
  if (stars) { const A = g.globalAlpha, R = mulberry(77); g.fillStyle = '#d8d0ff'; for (let i = 0; i < 90; i++) { const x = R() * W, y = R() * 1300, r = .8 + R() * 2.2, tw = .5 + .5 * Math.sin(t * 2 + i); g.globalAlpha = A * stars * (.25 + .6 * R()) * tw; g.beginPath(); g.arc(x, y, r, 0, TAU); g.fill(); } g.globalAlpha = A; }
}
function hills(y, col, amp = 40, seed = 3) {
  const R = mulberry(seed); g.fillStyle = col; g.beginPath(); g.moveTo(0, H); g.lineTo(0, y);
  const n = 6, ph = R() * 6; for (let i = 0; i <= 60; i++) { const x = i / 60 * W; g.lineTo(x, y + Math.sin(x / W * n + ph) * amp + Math.sin(x / W * 13 + ph * 2) * amp * .3); }
  g.lineTo(W, H); g.closePath(); g.fill();
}
function skyline(y, col, win, t, seed = 5, lit = 1) {
  const A = g.globalAlpha, R = mulberry(seed); let x = -20;
  while (x < W + 20) { const w = 90 + R() * 110, h = 160 + R() * 330; g.fillStyle = col; g.fillRect(x, y - h, w, h + 400);
    for (let yy = y - h + 26; yy < y - 20; yy += 46) for (let xx = x + 16; xx < x + w - 26; xx += 34) { if (R() < .45 * lit) { g.fillStyle = win; g.globalAlpha = A * (.55 + .45 * Math.sin(t * .7 + xx + yy) ** 2); g.fillRect(xx, yy, 16, 22); g.globalAlpha = A; } }
    x += w + 6; }
}
function house(x, y, s, col = '#2c2a5c', roof = '#3b2f6a', win = '#ffd36a') {
  g.save(); g.translate(x, y); g.scale(s, s); g.fillStyle = col; g.fillRect(-150, -220, 300, 220);
  g.fillStyle = roof; g.beginPath(); g.moveTo(-185, -210); g.lineTo(0, -360); g.lineTo(185, -210); g.closePath(); g.fill();
  g.fillStyle = win; g.fillRect(-110, -170, 60, 55); g.fillRect(50, -170, 60, 55); g.fillStyle = '#1b1a40'; g.beginPath(); g.roundRect(-35, -120, 70, 120, [30, 30, 0, 0]); g.fill(); g.restore();
}

const earth = (x, y, r, t, o = {}) => G.globe(x, y, r, t, { k: 0, face: false, lon0: o.lon0 ?? -20, lat0: o.lat0 ?? 18, ...o });
function monitor(x, y, w, h, t, a = 1) {
  g.save(); g.globalAlpha *= a; g.fillStyle = '#2a2850'; g.beginPath(); g.roundRect(x - w / 2 - 24, y - h / 2 - 24, w + 48, h + 48, 30); g.fill();
  g.fillStyle = '#070c22'; g.beginPath(); g.roundRect(x - w / 2, y - h / 2, w, h, 16); g.fill();
  g.strokeStyle = 'rgba(80,200,255,.08)'; g.lineWidth = 2; for (let yy = y - h / 2 + 8; yy < y + h / 2; yy += 8) { g.beginPath(); g.moveTo(x - w / 2, yy); g.lineTo(x + w / 2, yy); g.stroke(); }
  g.restore();
}
function ring(x, y, rx, ry, col, lw = 3, dash) { g.save(); g.strokeStyle = col; g.lineWidth = lw; if (dash) g.setLineDash(dash); g.beginPath(); g.ellipse(x, y, rx, ry, 0, 0, TAU); g.stroke(); g.restore(); }
function dot(x, y, r, col) { g.fillStyle = col; g.beginPath(); g.arc(x, y, r, 0, TAU); g.fill(); }
function label(s, x, y, px, col = P.white, a = 1, align = 'center') { if (a <= 0) return; g.save(); g.globalAlpha *= a; g.font = `900 ${px}px NU`; g.textAlign = align; g.lineJoin = 'round'; g.lineWidth = px * .22; g.strokeStyle = P.navy; g.strokeText(s, x, y); g.fillStyle = col; g.fillText(s, x, y); g.restore(); }

// ───────── small props
function comet(x, y, s, t) { g.save(); g.translate(x, y); g.scale(s, s); const gr = g.createLinearGradient(0, 0, 330, -150); gr.addColorStop(0, 'rgba(160,230,255,.85)'); gr.addColorStop(1, 'rgba(160,230,255,0)'); g.fillStyle = gr; g.beginPath(); g.moveTo(0, -30); g.lineTo(340, -190); g.lineTo(360, -90); g.lineTo(0, 30); g.closePath(); g.fill(); glow(0, 0, 90, '170,235,255', .7); dot(0, 0, 34, '#e9fbff'); g.restore(); }
function asteroid(x, y, s, t) { g.save(); g.translate(x, y); g.rotate(t * .3); g.scale(s, s); g.fillStyle = '#8f8496'; g.beginPath(); const R = mulberry(4); for (let i = 0; i < 12; i++) { const a = i / 12 * TAU, r = 70 + R() * 26; g.lineTo(Math.cos(a) * r * 1.3, Math.sin(a) * r); } g.closePath(); g.fill(); g.fillStyle = '#6f6578'; for (const [a, b, r] of [[-30, -10, 18], [28, 18, 13], [10, -32, 9]]) dot(a, b, r, '#6f6578'); g.restore(); }
function galaxy(x, y, r, t, a = 1) {
  g.save(); g.globalAlpha *= a; const A = g.globalAlpha; g.translate(x, y); g.rotate(t * .03); glow(0, 0, r * .45, '255,230,190', .7);
  const R = mulberry(12); for (let i = 0; i < 1400; i++) { const arm = i % 2, d = Math.pow(R(), .7) * r, q = d / r * 5.2 + arm * Math.PI + (R() - .5) * .55; const xx = Math.cos(q) * d, yy = Math.sin(q) * d * .62;
    g.fillStyle = d < r * .25 ? '#ffe6c0' : (R() < .5 ? '#c9b8ff' : '#9fd8ff'); g.globalAlpha = A * (.25 + R() * .6); g.fillRect(xx, yy, 2.4, 2.4); }
  g.restore();
}
function sign(x, y, s, txt, col, t, sw = 0) { g.save(); g.translate(x, y); g.rotate(Math.sin(t * 3 + x) * .05 + sw); g.scale(s, s); g.fillStyle = '#8a5a3a'; g.fillRect(-8, -40, 16, 220); g.fillStyle = '#fff6e6'; g.beginPath(); g.roundRect(-160, -150, 320, 120, 14); g.fill(); g.font = '1000 54px NU'; g.textAlign = 'center'; g.fillStyle = col; g.fillText(txt, 0, -72); g.restore(); }
function thermo(x, y, s, k, hot = 1) { g.save(); g.translate(x, y); g.scale(s, s); g.fillStyle = '#f4f4fb'; g.beginPath(); g.roundRect(-30, -300, 60, 300, 30); g.fill(); dot(0, 20, 52, '#f4f4fb'); const c = hot ? '#ff4d3a' : '#3fa8ff'; dot(0, 20, 38, c); g.fillStyle = c; const hh = 40 + 230 * k; g.beginPath(); g.roundRect(-16, 10 - hh, 32, hh, 16); g.fill(); g.restore(); }
function suitcase(x, y, s) { g.save(); g.translate(x, y); g.scale(s, s); g.fillStyle = '#ffc73a'; g.beginPath(); g.roundRect(-60, -90, 120, 90, 12); g.fill(); g.strokeStyle = '#c9961c'; g.lineWidth = 8; g.beginPath(); g.roundRect(-22, -112, 44, 26, 8); g.stroke(); g.restore(); }
function alien(x, y, s, t, o = {}) {                                  // a moon-dweller: tall, soft, big dark eyes, a glowing feeler
  g.save(); g.translate(x, y); g.scale(s, s); const sw = Math.sin(t * 1.6 + (o.seed || 0)) * .04; g.rotate(sw);
  g.fillStyle = o.col || '#5fb8c9'; g.beginPath(); g.moveTo(-70, 0); g.quadraticCurveTo(-90, -260, -40, -330); g.lineTo(40, -330); g.quadraticCurveTo(90, -260, 70, 0); g.closePath(); g.fill();
  g.beginPath(); g.ellipse(0, -420, 95, 110, 0, 0, TAU); g.fill();
  g.strokeStyle = o.col || '#5fb8c9'; g.lineWidth = 10; g.beginPath(); g.moveTo(0, -520); g.quadraticCurveTo(30, -590, 10, -630); g.stroke(); glow(10, -635, 40, '255,220,120', .9); dot(10, -635, 12, '#fff2b0');
  const bl = !o.still && ((t + (o.seed || 0)) % 4.3) < .12 ? .15 : 1;
  for (const sx of [-1, 1]) { g.fillStyle = '#0d0b26'; g.beginPath(); g.ellipse(sx * 40, -420, 30, 44 * bl, sx * -.3, 0, TAU); g.fill(); if (bl > .5) dot(sx * 40 - 8, -436, 9, 'rgba(255,255,255,.8)'); }
  if (o.lit) { g.fillStyle = `rgba(255,220,150,${.35 * o.lit})`; g.beginPath(); g.ellipse(-40, -440, 50, 90, 0, 0, TAU); g.fill(); }
  g.restore();
}
function dome(x, y, r, t, k) { g.save(); g.fillStyle = `rgba(120,200,255,${.18})`; g.strokeStyle = 'rgba(160,220,255,.6)'; g.lineWidth = 4; g.beginPath(); g.arc(x, y, r, Math.PI, TAU); g.fill(); g.stroke();
  const R = mulberry(Math.round(x)); for (let i = 0; i < 9; i++) { const bx = x - r * .7 + R() * r * 1.4, bh = r * (.25 + R() * .45); g.fillStyle = '#1d2450'; g.fillRect(bx, y - bh, r * .14, bh); if (k > 0) { g.fillStyle = `rgba(255,214,120,${k})`; for (let yy = y - bh + 8; yy < y - 6; yy += 16) g.fillRect(bx + 5, yy, r * .05, 7); } }
  g.restore(); }

// ───────── scenes
const SC = [];
const cue = (t, a, b) => ss(seg(t, a, b));

SC[0] = (t) => {                                                    // hook: something new in the night sky
  sky(t, '#0b0830', '#2a1a5e');
  const k = cue(t, .2, T.earth1 + .3), r = lerp(60, 160, eio(k));
  rogue(720, 700, r, t, { lit: lerp(.2, .7, k), ang: -2.6 });
    fullMoon(160, 760, 40);
  hills(1450, '#1d3a3f', 30, 4); house(160, 1520, .85); hills(1560, '#16302f', 20, 8);
  const sh = cue(t, T.passed - .1, T.passed + .2);
  person(560, 1680, .95, t, as('you', { mood: sh > .5 ? 'shock' : (t > T.drifting ? 'awe' : 'happy'), arms: sh > .5 ? 'cheeks' : 'down', lookY: -1, look: .6 }));
  word('WHAT IF A', CX, 250, 92, P.white, 1); word('ROGUE PLANET', CX, 360, 128, P.gold, 1); word('PASSED EARTH?', CX, 470, 110, P.white, 1);
};
SC[1] = (t) => {                                                    // not a comet, not an asteroid: a whole planet, no sun
  bg(t);
  const kc = pop(t, T.comet - .3), ka = pop(t, T.asteroid - .3), kp = cue(t, T.whole - .3, T.whole + .4);
  g.save(); g.globalAlpha *= 1 - kp * .85; comet(200, 470, .8 * kc, t); label('COMET', 260, 640, 60, P.white, kc); cross(260, 470, 90, pop(t, T.comet + .25));
  asteroid(820, 520, .9 * ka, t); label('ASTEROID', 800, 680, 60, P.white, ka); cross(820, 520, 90, pop(t, T.asteroid + .3)); g.restore();
  rogue(CX, lerp(1250, 1100, eo(kp)), 330 * (.35 + .65 * eo(kp)), t, { lit: lerp(.08, .45, kp), ang: -2.2 });
  word('A WHOLE PLANET', CX, 1580, 104, P.gold, keyAt(t, T.whole));
  const kj = pop(t, T.jupiter - .1); if (kj > 0) word('JUPITER-SIZED', CX, 1690, 64, P.white, kj);
  const ks = pop(t, T.nosun - .15); if (ks > 0) { g.save(); g.translate(890, 420); g.scale(ks, ks); K.sunBody(0, 0, 70, t, { grey: .6 }); cross(0, 0, 80, 1); g.restore(); word('NO SUN', 890, 590, 70, P.white, ks); }
};
SC[2] = (t) => {                                                    // rogue planets are real; maybe more than stars
  bg(t, '#060418', '#140c3a');
  galaxy(CX, 820, 470, t, cue(t, VO.s03 - .3, VO.s03 + .4));
  const A = g.globalAlpha, R = mulberry(31), kr = cue(t, T.rogue - .1, T.galaxy + 1.2);
  for (let i = 0; i < 60; i++) { const q = R() * TAU, d = 60 + R() * 440, x = CX + Math.cos(q) * d, y = 820 + Math.sin(q) * d * .62, on = clamp(kr * 60 - i); if (on <= 0) continue;
    g.save(); g.globalAlpha = A * on * (.6 + .4 * Math.sin(t * 4 + i)); g.strokeStyle = P.cyan; g.lineWidth = 3; g.beginPath(); g.arc(x, y, 10, 0, TAU); g.stroke(); dot(x, y, 4, '#9a7ab0'); g.restore(); }
  word('ROGUE PLANETS', CX, 330, 116, P.gold, keyAt(t, T.rogue));
  word('THEY\'RE REAL', CX, 430, 70, P.white, keyAt(t, T.real));
  word('MORE THAN STARS?', CX, 1370, 96, P.cyan, keyAt(t, T.more));
  bust(250, 1920, .78, t, as('teen', { mood: t > T.more ? 'shock' : 'awe', lookY: -1, look: .5 }));
};
SC[3] = (t) => {                                                    // YEAR 1: spotted past Neptune, 26 km/s
  sky(t, '#0a0a24', '#1a1640', 0);
  monitor(CX, 820, 900, 820, t);
  const cx = CX, cy = 820; g.save(); g.beginPath(); g.roundRect(cx - 450, cy - 410, 900, 820, 16); g.clip();
  K.sunBody(cx, cy, 22, t, { glow: .6 }); for (const [rr, c] of [[50, '#5aa0ff'], [95, '#e9b98a'], [150, '#d8c08a'], [230, '#8fe0e8'], [330, '#6a8dff']]) { ring(cx, cy, rr, rr * .62, 'rgba(120,180,255,.35)', 2); }
  dot(cx + 50, cy, 7, '#5aa0ff'); dot(cx - 330 * .7, cy - 330 * .62 * .7, 10, '#6a8dff'); label('NEPTUNE', cx - 231, cy - 170, 30, '#9fb4ff', 1);
  const kd = cue(t, T.spot - .2, end('s04')), px = lerp(cx + 420, cx + 300, kd), py = lerp(cy - 380, cy - 250, kd);
  g.strokeStyle = 'rgba(255,90,110,.7)'; g.setLineDash([8, 10]); g.lineWidth = 4; g.beginPath(); g.moveTo(cx + 470, cy - 440); g.lineTo(px, py); g.stroke(); g.setLineDash([]);
  if (t > T.spot - .2) { const bl = .5 + .5 * Math.sin(t * 10); glow(px, py, 40, '255,80,100', .6 * bl); dot(px, py, 11, '#ff5a6e'); ring(px, py, 26, 26, `rgba(255,90,110,${bl})`, 3); label('UNKNOWN OBJECT', px - 40, py + 70, 32, '#ff8a9a', 1, 'right'); }
  const kr = cue(t, T.racing - .1, T.racing + 1.4); if (kr > 0) { g.strokeStyle = 'rgba(255,90,110,.5)'; g.setLineDash([14, 14]); g.lineWidth = 4; g.beginPath(); g.moveTo(px, py); g.lineTo(lerp(px, cx + 50, kr), lerp(py, cy, kr)); g.stroke(); g.setLineDash([]); }
  g.restore();
  when('YEAR 1', t, VO.s04);
  word('26 KM PER SECOND', CX, 1340, 92, P.gold, keyAt(t, T.twenty4));
  const sh = t > T.racing;
  bust(300, 1920, .8, t, as('astro', { mood: sh ? 'shock' : 'think', arms: sh && t > T.racing + .4 ? 'cheeks' : null, lookY: -1, look: .5, shake: sh ? .6 : 0 }));
  bust(820, 1920, .66, t, as('astro2', { mood: t > T.twenty4 ? 'scared' : 'awe', lookY: -1, look: -.4 }));
};
SC[4] = (t) => {                                                    // they check: it will miss, by 10 million km
  sky(t, '#0a0a24', '#1a1640', 0);
  monitor(CX, 760, 900, 760, t);
  const cx = CX, cy = 760; g.save(); g.beginPath(); g.roundRect(cx - 450, cy - 380, 900, 760, 16); g.clip();
  K.sunBody(cx - 200, cy + 150, 46, t, { glow: .7 }); ring(cx - 200, cy + 150, 300, 300, 'rgba(120,180,255,.4)', 3);
  const ex = cx - 200 + 300 * Math.cos(-.55), ey = cy + 150 + 300 * Math.sin(-.55); earth(ex, ey, 26, t);
  const kp = cue(t, T.check - .3, T.wont + .3);
  g.strokeStyle = 'rgba(255,120,140,.8)'; g.lineWidth = 5; g.setLineDash([12, 12]); g.lineDashOffset = -t * 40; g.beginPath();
  for (let i = 0; i <= 40; i++) { const u = i / 40; if (u > kp) break; const x = lerp(cx + 450, cx - 450, u), y = cy - 360 + u * 380 + Math.sin(u * 3) * 30; i ? g.lineTo(x, y) : g.moveTo(x, y); } g.stroke(); g.setLineDash([]);
  const nn = Math.floor(cue(t, T.check, T.wont) * 6); for (let i = 0; i < nn; i++) label(['Δv', 'r⊕', 'μ', 'v∞', 'b', 'e'][i] + ' = ' + (3.1 + i * 1.7).toFixed(2), cx + 330, cy + 200 + i * 30 - 80, 22, '#7fd3ff', .7, 'right');
  const km = pop(t, T.miss - .15); if (km > 0) { const qx = lerp(cx + 450, cx - 450, .41), qy = cy - 360 + .41 * 380 + Math.sin(.41 * 3) * 30; g.strokeStyle = '#5fe08a'; g.lineWidth = 4; g.beginPath(); g.moveTo(ex, ey); g.lineTo(qx, qy); g.stroke(); }
  g.restore();
  word('IMPACT?', CX, 280, 100, P.red, keyAt(t, T.check + .4, T.wont - .05));
  if (t > T.hit) { tick(CX - 230, 270, 46, pop(t, T.hit)); word('MISS', CX + 40, 300, 120, '#5fe08a', pop(t, T.hit)); }
  word('10,000,000 KM', CX, 1290, 100, P.gold, keyAt(t, T.ten));
  const ok = t > T.hit;
  bust(300, 1920, .8, t, as('astro', { mood: ok ? 'grin' : 'worried', lookY: ok ? 0 : -1, look: ok ? .2 : .4 }));
  bust(800, 1920, .7, t, as('astro2', { mood: ok ? 'relief' : 'worried', arms: ok ? null : 'mouth', lookY: -1 }));
};
SC[5] = (t) => {                                                    // sounds safe? 26× the Moon's distance; 300 Earths
  bg(t);
  const sw = cue(t, T.weighs - .4, T.weighs + .1);
  const A = g.globalAlpha;
  if (sw < 1) { g.save(); g.globalAlpha *= 1 - sw;
    const y0 = 1420, y1 = 520, step = (y0 - y1) / 26, kn = cue(t, T.twenty6 - .2, T.moon6 + .1);
    earth(CX, y0 + 50, 70, t); label('EARTH', CX + 170, y0 + 70, 40, P.white, 1, 'left');
    for (let i = 1; i <= 26; i++) { const on = clamp(kn * 26 - i + 1); if (on <= 0) continue; const y = y0 - i * step; g.globalAlpha = A * (1 - sw) * on; dot(CX, y + 30, 9, P.moon); g.strokeStyle = 'rgba(207,212,234,.4)'; g.lineWidth = 3; g.beginPath(); g.moveTo(CX - 30, y + 30); g.lineTo(CX + 30, y + 30); g.stroke(); }
    g.globalAlpha = A * (1 - sw); label('1 Moon distance', CX - 60, y0 - step + 40, 30, P.moon, kn > .04 ? 1 : 0, 'right');
    rogue(CX, y1 - 70, 120, t, { lit: .6 });
    word(Math.max(1, Math.round(kn * 26)) + '× THE MOON\'S DISTANCE', CX, 260, 96, P.gold, keyAt(t, T.twenty6));
    word('SOUNDS SAFE?', CX, 260, 90, P.white, keyAt(t, T.safe, T.twenty6 - .05));
    g.restore(); }
  if (sw > 0) { g.save(); g.globalAlpha *= sw;                      // the balance: one planet vs 300 Earths
    const tilt = .12 * cue(t, T.three6 - .3, T.earths + .3), bx = CX, by = 900;
    g.fillStyle = '#c9cee6'; g.fillRect(bx - 14, by, 28, 520); g.fillRect(bx - 160, by + 520, 320, 30);
    g.save(); g.translate(bx, by); g.rotate(-tilt); g.fillStyle = '#e9ecf6'; g.fillRect(-350, -12, 700, 24);
    for (const sd of [-1, 1]) { g.strokeStyle = '#c9cee6'; g.lineWidth = 6; g.beginPath(); g.moveTo(sd * 330, 0); g.lineTo(sd * 330 - 120, 220); g.moveTo(sd * 330, 0); g.lineTo(sd * 330 + 120, 220); g.stroke(); }
    g.restore();
    const ly = by + Math.sin(tilt) * 330 + 230, ry = by - Math.sin(tilt) * 330 + 230;
    for (const [x, y] of [[bx - 330, ly], [bx + 330, ry]]) { g.fillStyle = '#e9ecf6'; g.beginPath(); g.ellipse(x, y, 150, 26, 0, 0, TAU); g.fill(); }
    rogue(bx - 330, ly - 150, 140, t, { lit: .7 });
    const ne = Math.floor(cue(t, T.three6 - .2, T.earths + .5) * 300), R = mulberry(5);
    for (let i = 0, row = 0, n = 0; i < ne; i++) { const per = Math.max(2, 34 - row * 2); if (n >= per) { row++; n = 0; } const x = bx + 330 + (n - (Math.max(2, 34 - row * 2) - 1) / 2) * 9, y = ry - 14 - row * 9; n++; dot(x, y, 5.5, R() < .55 ? P.ocean : P.land); }
    word('= 300 EARTHS', CX, 420, 112, P.gold, keyAt(t, T.three6));
    label('1 rogue planet', bx - 330, ly + 90, 44, P.white, 1); label('300 Earths', bx + 330, ry + 90, 44, P.white, 1);
    g.restore(); }
  bust(880, 1920, .55, t, as('you', { mood: t > T.earths ? 'scared' : t > T.only ? 'worried' : 'happy', lookY: -1, look: -.5 }));
};
SC[6] = (t) => {                                                    // YEAR 5: brightest after the Moon; stripes in binoculars
  sky(t, '#0d0b33', '#3a2466');
  fullMoon(220, 560, 50); const pk = .8 + .2 * Math.sin(t * 3); glow(780, 520, 120, '255,230,200', .45 * pk); rogue(780, 520, 22, t, { lit: 1, ang: 2.6 }); sparkle(780, 520, 70 * pk, '#fff', .55);
  skyline(1350, '#1e1a45', '#ffd36a', t, 7); g.fillStyle = '#15123a'; g.fillRect(0, 1440, W, 480);
  const kb = cue(t, T.binoculars - .2, T.binoculars + .3);
  person(250, 1780, .82, t, as('gran', { mood: 'awe', arms: 'point', lookY: -1, look: .6 }));
  person(560, 1800, .86, t, as('dad', { mood: 'grin', arms: kb > .3 ? 'binoc' : 'down', lookY: -1, look: .5, seed: 1 }));
  person(850, 1780, .8, t, as('teen', { mood: 'awe', arms: 'phone', lookY: -1, look: -.3, seed: 2, screen: '#ffe6c0' }));
  if (kb > 0) { g.save(); g.globalAlpha *= kb; const cx = CX, cy = 760, rr = 300 * (.6 + .4 * eo(kb));
    g.fillStyle = '#2a2850'; for (const sd of [-1, 1]) { g.beginPath(); g.arc(cx + sd * rr * .55, cy, rr + 16, 0, TAU); g.fill(); }
    g.fillStyle = '#04030f'; for (const sd of [-1, 1]) { g.beginPath(); g.arc(cx + sd * rr * .55, cy, rr, 0, TAU); g.fill(); }
    g.save(); g.beginPath(); g.arc(cx - rr * .55, cy, rr, 0, TAU); g.arc(cx + rr * .55, cy, rr, 0, TAU); g.clip(); rogue(cx, cy, rr * .75, t, { lit: 1, ang: 2.6 }); g.restore(); g.restore(); }
  when('YEAR 5', t, VO.s07);
  word('BRIGHTEST', CX, 1050, 100, P.gold, keyAt(t, T.brightest, T.binoculars - .1)); word('AFTER THE MOON', CX, 1140, 70, P.white, keyAt(t, T.moon7, T.binoculars - .1));
  word('STRIPES', CX, 1220, 100, P.gold, keyAt(t, T.stripes));
};
SC[7] = (t) => {                                                    // the week of the pass: bigger than the full Moon; nobody sleeps
  sky(t, '#120a30', '#4a2a5e');
  const kr = cue(t, VO.s08 - .3, T.full + .5), r = lerp(160, 360, eio(kr));
  rogue(640, 720, r, t, { lit: 1, ang: 2.5 });
  fullMoon(150, 330, 46); label('the full Moon', 150, 420, 34, P.moon, cue(t, T.full - .3, T.full));
  hills(1330, '#2a1f4a', 26, 2); hills(1420, '#1c1638', 18, 9);
  const crowd = [['gran', 120, 1660, .6, 'awe', 'down'], ['kid2', 300, 1700, .52, 'grin', 'point'], ['mum', 470, 1700, .66, 'awe', 'mouth'], ['dad', 660, 1690, .68, 'awe', 'down'], ['teen', 840, 1700, .62, 'awe', 'phone'], ['astro2', 1000, 1670, .58, 'awe', 'cheeks']];
  const ns = t > T.nobody;
  crowd.forEach(([n, x, y, s, m, a], i) => person(x, y, s, t, as(n, { mood: ns && i % 2 ? 'grin' : m, arms: a, lookY: -1, look: (640 - x) / 600, seed: i })));
  person(560, 1900, 1.0, t, as('you', { mood: 'awe', lookY: -1, look: .2 }));
  when('PASS WEEK', t, VO.s08 - .1);
  word('BIGGER THAN', CX, 1160, 84, P.white, keyAt(t, T.bigger, T.nobody - .1)); word('THE FULL MOON', CX, 1260, 100, P.gold, keyAt(t, T.full, T.nobody - .1));
  word('NOBODY SLEEPS', CX, 1210, 104, P.gold, keyAt(t, T.nobody));
};
SC[8] = (t) => {                                                    // gravity tugs harder than the Moon; tides surge; evacuate
  const sw = cue(t, T.tides9 - .35, T.tides9 + .05);
  if (sw < 1) { g.save(); g.globalAlpha *= 1 - sw; bg(t);
    const b = cue(t, T.gravity, T.harder + .5); rogue(250, 520, 210, t, { lit: 1, ang: .6 });
    g.save(); g.translate(700, 1040); g.rotate(-.75); g.fillStyle = 'rgba(80,160,255,.55)'; g.beginPath(); g.ellipse(0, 0, 230 * (1 + .25 * b), 230 * (1 - .05 * b), 0, 0, TAU); g.fill(); g.restore();
    earth(700, 1040, 210, t, { lon0: -40 });
    for (let i = 0; i < 3; i++) { const p = (t * .9 + i / 3) % 1; K.arrow(lerp(560, 400, p), lerp(870, 680, p), lerp(520, 360, p), lerp(820, 630, p), P.gold, 16, b * (1 - p)); }
    word('STRONGER PULL', CX, 1430, 96, P.gold, keyAt(t, T.gravity)); word('THAN THE MOON', CX, 1530, 72, P.white, keyAt(t, T.harder));
    g.restore(); }
  if (sw > 0) { g.save(); g.globalAlpha *= sw;
    sky(t, '#1a1640', '#3a2a66'); rogue(820, 360, 190, t, { lit: 1, ang: 2.4 });
    const lv = cue(t, T.surge - .3, end('s09') + .6);
    house(220, 1240, .9); house(820, 1250, .8, '#33306a');
    g.fillStyle = '#1c2a4a'; g.fillRect(0, 1240, W, 700);
    const wy = lerp(1330, 1150, lv); g.fillStyle = 'rgba(61,139,232,.88)'; g.beginPath(); g.moveTo(0, H); g.lineTo(0, wy);
    for (let i = 0; i <= 40; i++) { const x = i / 40 * W; g.lineTo(x, wy + Math.sin(x / 80 + t * 3) * 14); } g.lineTo(W, H); g.fill();
    g.strokeStyle = 'rgba(255,255,255,.5)'; g.lineWidth = 5; g.beginPath(); for (let i = 0; i <= 40; i++) { const x = i / 40 * W; g.lineTo(x, wy + Math.sin(x / 80 + t * 3) * 14); } g.stroke();
    const sl = (Math.sin(t * 12) > 0) ? 1 : 0; glow(980, 1000, 120, sl ? '255,60,80' : '60,120,255', .6);
    const ev = cue(t, T.seaside - .2, T.leave + .3), wx = lerp(0, -260, ev);
    person(330 + wx, 1600, .72, t, as('mum', { mood: 'worried', arms: 'hold', walk: 1, look: -.6 }));
    person(520 + wx, 1630, .55, t, as('kid2', { mood: 'scared', arms: 'holdL', walk: 1, seed: 1, look: .6, lookY: -.5 }));
    person(740 + wx, 1610, .72, t, as('dad', { mood: 'worried', arms: 'hold', walk: 1, seed: 2, look: -.6 })); suitcase(870 + wx, 1530, 1);
    word('TIDES SURGE', CX, 650, 112, P.cyan, keyAt(t, T.tides9, T.seaside)); word('EVACUATE', CX, 650, 120, P.red, keyAt(t, T.seaside));
    g.restore(); }
};
SC[9] = (t) => {                                                    // scientists watch for earthquakes
  sky(t, '#0a0a24', '#1a1640', 0);
  monitor(CX, 700, 900, 560, t);
  g.save(); g.beginPath(); g.roundRect(CX - 450, 420, 900, 560, 16); g.clip();
  g.strokeStyle = '#5fe08a'; g.lineWidth = 4; g.beginPath(); const R = mulberry(3);
  for (let i = 0; i <= 300; i++) { const x = CX - 450 + i * 3, tt = t * 2 - (300 - i) * .01, big = clamp(1 - Math.abs(tt - (T.faults * 2)) / .6), a = 10 + 6 * Math.sin(tt * 9) + 45 * cue(t - (300 - i) * .005, T.quakes, T.quakes + .6) * (.6 + .4 * Math.sin(tt * 23)) + 150 * big * Math.sin(tt * 47) * (.5 + .5 * Math.sin(i)); const y = 700 + a * Math.sin(i * 1.7 + tt * 30) * .5; i ? g.lineTo(x, y) : g.moveTo(x, y); } g.stroke();
  label('SEISMOGRAPH', CX - 420, 470, 32, '#5fe08a', .8, 'left'); g.restore();
  word('EARTHQUAKES?', CX, 280, 104, P.gold, keyAt(t, T.quakes));
  word('tides can tip faults', CX, 1110, 58, P.white, keyAt(t, T.tides10), 0, 960, 900); word('that are ready to slip', CX, 1180, 58, P.white, keyAt(t, T.faults), 0, 960, 900);
  const sk = cue(t, T.faults - .1, T.faults + .2) * (1 - cue(t, T.slip + .4, T.slip + 1));
  bust(310, 1920, .78, t, as('astro2', { mood: sk > .3 ? 'scared' : 'worried', lookY: -1, look: .5, shake: sk }));
  bust(800, 1920, .7, t, as('astro', { mood: 'think', lookY: -1, look: -.4 }));
};
SC[10] = (t) => {                                                   // then it's gone… but it takes something with it
  const dk = cue(t, T.but11 - .2, T.but11 + .4);
  sky(t, '#0b0830', dk > 0 ? '#3a1530' : '#2a1a5e');
  if (dk > 0) { g.fillStyle = `rgba(120,20,40,${.35 * dk})`; g.fillRect(0, 0, W, H); }
  const kg = cue(t, VO.s11 - .2, T.gone + .3); rogue(lerp(560, 860, kg), lerp(700, 330, kg), lerp(260, 30, eio(kg)), t, { lit: 1, ang: 2.4 });
  hills(1430, '#1d3a3f', 30, 4); hills(1540, '#16302f', 20, 8);
  person(330, 1720, .82, t, as('mum', { mood: dk > .5 ? 'worried' : 'relief', arms: dk > .5 ? 'down' : 'wave', look: .4, lookY: -.6 }));
  person(700, 1740, .86, t, as('you', { mood: dk > .5 ? 'scared' : 'grin', arms: dk > .5 ? 'down' : 'cheer', look: .3, lookY: -.8, seed: 1 }));
  word('GONE', CX, 1100, 120, P.white, keyAt(t, T.gone, T.but11 - .1));
  word('BUT…', CX, 1100, 140, P.red, keyAt(t, T.but11), dk ? (Math.sin(t * 30) * .01) : 0);
};
SC[11] = (t) => {                                                   // Earth's orbit shifts by up to 3 %
  bg(t);
  const cx = CX, cy = 900, R0 = 340, k = cue(t, T.drags - .2, T.orbit + .6);
  K.sunBody(cx, cy, 80, t);
  ring(cx, cy, R0, R0, 'rgba(255,255,255,.4)', 4, [14, 14]);
  const R1 = R0 * (1 + .09 * k); ring(cx + 30 * k, cy, R1, R0 * (1 + .03 * k), `rgba(255,199,58,${k})`, 6);
  const a = -.9 + t * .25, ex = cx + 30 * k + Math.cos(a) * lerp(R0, R1, k), ey = cy + Math.sin(a) * R0 * (1 + .03 * k); earth(ex, ey, 34, t);
  const pk = cue(t, VO.s12 - .4, T.drags + .6); rogue(lerp(1100, -100, pk), lerp(380, 640, pk), 90, t, { lit: 1, ang: 3.1 });
  if (pk > .2 && pk < .9) K.arrow(ex, ey, ex + (lerp(1100, -100, pk) - ex) * .25, ey + (lerp(380, 640, pk) - ey) * .25, P.gold, 14, 1);
  label('old orbit', cx - R0 - 10, cy + 60, 36, P.white, k, 'right'); label('new orbit', cx + R1 * .72, cy + R0 * .86 + 40, 36, P.gold, k, 'left');
  word('ORBIT SHIFTED', CX, 330, 112, P.gold, keyAt(t, T.orbit)); word('UP TO 3%', CX, 1440, 120, P.white, keyAt(t, T.three12));
  bust(880, 1920, .55, t, as('astro', { mood: 'shock', lookY: -1, look: -.5 }));
};
SC[12] = (t) => {                                                   // a little closer: hotter than any climate forecast
  sky(t, '#ff9a5c', '#ffcf7a', 0); g.fillStyle = 'rgba(255,80,40,.18)'; g.fillRect(0, 0, W, H);
  const k = cue(t, T.closer - .3, T.sun13 + .4); K.sunBody(CX, 420, lerp(150, 220, k), t, { flare: .6 });
  g.fillStyle = '#d98a4a'; g.fillRect(0, 1350, W, 600); hills(1340, '#c97a3c', 20, 6);
  for (let i = 0; i < 5; i++) { const x = 100 + i * 220, wv = Math.sin(t * 4 + i) * 10; g.strokeStyle = 'rgba(255,255,255,.25)'; g.lineWidth = 6; g.beginPath(); g.moveTo(x, 1200); g.quadraticCurveTo(x + 20 + wv, 1150, x, 1100); g.quadraticCurveTo(x - 20 - wv, 1050, x, 1000); g.stroke(); }
  thermo(860, 1300, 1.2, cue(t, T.hotter - .3, T.forecast + .5), 1);
  person(420, 1760, .95, t, as('dad', { mood: 'scared', arms: 'head', look: .3, lookY: -.6 }));
  word('CLOSER TO THE SUN', CX, 760, 96, P.white, keyAt(t, T.closer, T.hotter - .05)); word('HOTTER', CX, 760, 150, P.red, keyAt(t, T.hotter)); word('than any climate forecast', CX, 870, 56, P.white, keyAt(t, T.forecast), 0, 960, 900);
};
SC[13] = (t) => {                                                   // a little farther: an ice age; the year changes by two weeks
  sky(t, '#9fb6e0', '#dfe9fb', 0);
  const k = cue(t, T.farther - .3, T.ice + .4); glow(CX, 360, 260, '255,250,230', .5); dot(CX, 360, lerp(110, 70, k), '#fff8e0');
  g.fillStyle = '#f2f6ff'; g.fillRect(0, 1350, W, 600); hills(1340, '#e4ecfb', 20, 6);
  const R = mulberry(8); for (let i = 0; i < 90; i++) { const x = (R() * W + Math.sin(t + i) * 30) % W, y = (R() * H + t * (80 + R() * 80)) % H; K.sparkle(x, y, 6 + R() * 8, '#fff', .9); }
  person(330, 1760, .95, t, as('gran', { mood: 'scared', arms: 'hips', look: .4, rot: Math.sin(t * 40) * .02, top: '#3fa8ff', topD: '#2d86d6', held: c => { c.fillStyle = '#e6334f'; c.beginPath(); c.roundRect(-80, -420, 160, 46, 22); c.fill(); c.fillRect(30, -400, 40, 130); } }));
  for (let i = 0; i < 3; i++) { const p = (t * .8 + i / 3) % 1; g.fillStyle = `rgba(255,255,255,${.6 * (1 - p)})`; g.beginPath(); g.arc(330 + 70 + p * 120, 1760 - .95 * 470 + 20 - p * 40, 14 + p * 26, 0, TAU); g.fill(); }
  const kc = cue(t, T.year14 - .3, T.year14 + .1);
  word('FARTHER OUT', CX, 760, 110, P.white, keyAt(t, T.farther, T.ice - .05)); word('ICE AGE', CX, 760, 150, '#7fd3ff', keyAt(t, T.ice, T.year14 - .1));
  if (kc > 0) { g.save(); g.globalAlpha *= kc; g.translate(780, 1230); g.rotate(.06); g.fillStyle = '#fff'; g.beginPath(); g.roundRect(-170, -210, 340, 360, 20); g.fill(); g.fillStyle = P.red; g.beginPath(); g.roundRect(-170, -210, 340, 90, [20, 20, 0, 0]); g.fill();
    label('YEAR', 0, -145, 54, P.white, 1); const d = 365 + Math.round(Math.sin((t - T.year14) * 2.2) * 14); g.font = '1000 120px NU'; g.textAlign = 'center'; g.fillStyle = P.navy; g.fillText(d, 0, 30); g.font = '800 44px NU'; g.fillText('days', 0, 100); g.restore(); }
  word('± 2 WEEKS', CX, 760, 130, P.gold, keyAt(t, T.two14));
};
SC[14] = (t) => {                                                   // the strangest part: telescopes zoom in on one of its moons
  sky(t, '#05040f', '#100a2a', 0);
  const z = cue(t, T.zoom - .2, T.moons15 + .4), cx = CX, cy = 760, rr = 380;
  g.save(); g.beginPath(); g.arc(cx, cy, rr, 0, TAU); g.fillStyle = '#04030c'; g.fill(); g.clip();
  const zs = lerp(1, 5.2, eio(z)), mx = cx + 220, my = cy - 110;
  g.translate(cx, cy); g.scale(zs, zs); g.translate(-lerp(cx, mx, eio(z)), -lerp(cy, my, eio(z)));
  rogue(cx - 60, cy + 60, 210, t, { lit: .9, ang: 2.4 }); moonBall(mx, my, 34, '#c9d6e6', '#9aa8bf'); moonBall(cx - 300, cy + 240, 18, '#d8c9e6', '#b0a2c4');
  g.restore();
  g.strokeStyle = 'rgba(160,220,255,.5)'; g.lineWidth = 3; g.beginPath(); g.moveTo(cx - rr, cy); g.lineTo(cx - 40, cy); g.moveTo(cx + 40, cy); g.lineTo(cx + rr, cy); g.moveTo(cx, cy - rr); g.lineTo(cx, cy - 40); g.moveTo(cx, cy + 40); g.lineTo(cx, cy + rr); g.stroke();
  g.strokeStyle = '#2a2850'; g.lineWidth = 30; g.beginPath(); g.arc(cx, cy, rr + 15, 0, TAU); g.stroke();
  label('ZOOM ×' + Math.round(lerp(1, 400, z * z)), cx + rr - 20, cy + rr - 20, 34, P.cyan, 1, 'right');
  word('THE STRANGEST PART', CX, 250, 84, P.white, keyAt(t, T.strangest, T.telescopes));
  word('ONE OF ITS MOONS', CX, 1290, 96, P.gold, keyAt(t, T.moons15));
  bust(CX, 1920, .78, t, as('astro2', { mood: z > .6 ? 'awe' : 'think', lookY: -1, look: 0 }));
};
SC[15] = (t) => {                                                   // and on its night side, there are lights
  bg(t, '#020208', '#07061a');
  const cx = CX, cy = 800, r = 400, kl = cue(t, T.lights - .2, T.lights + 1.0);
  g.save(); g.beginPath(); g.arc(cx, cy, r, 0, TAU); g.clip(); g.fillStyle = '#d9ecff'; g.fillRect(cx - r, cy - r, 2 * r, 2 * r);
  const sh = g.createLinearGradient(cx + r, cy, cx - r, cy); sh.addColorStop(0, 'rgba(6,6,24,0)'); sh.addColorStop(.25, 'rgba(6,6,24,.9)'); sh.addColorStop(1, 'rgba(4,4,18,1)'); g.fillStyle = sh; g.fillRect(cx - r, cy - r, 2 * r, 2 * r);
  const R = mulberry(19); for (let i = 0; i < 160; i++) { const a = R() * TAU, d = Math.sqrt(R()) * r * .95, x = cx - r * .25 + Math.cos(a) * d * .75, y = cy + Math.sin(a) * d; const on = clamp(kl * 160 - i * .9); if (on <= 0 || x > cx + r * .35) continue; const cl = R() < .2 ? 7 : 3.5; glow(x, y, cl * 5, '255,200,110', .35 * on); dot(x, y, cl, `rgba(255,224,150,${on})`); }
  g.restore();
  word('LIGHTS', CX, 1340, 150, P.gold, keyAt(t, T.lights));
  word('THE NIGHT SIDE', CX, 280, 84, P.white, keyAt(t, T.night17, end('s17') + .1));
  const sk = cue(t, T.lights, T.lights + .2);
  bust(270, 1920, .78, t, as('astro', { mood: sk > .5 ? 'shock' : 'think', arms: sk > .5 ? 'head' : null, lookY: -1, look: .6, shake: sk }));
  bust(830, 1920, .7, t, as('astro2', { mood: sk > .5 ? 'shock' : 'awe', arms: sk > .5 ? 'mouth' : null, lookY: -1, look: -.5, seed: 2 }));
};
SC[16] = (t) => {                                                   // cities: a civilization that has drifted in the dark; our Sun is their first star
  const ks = cue(t, T.oursun - .4, T.first + .4);
  sky(t, '#02020a', ks > 0 ? '#3a2a1a' : '#0a0a24', 1 - ks * .7);
  if (ks > 0) { glow(CX, 1180, 700 * ks, '255,210,140', .55 * ks); K.sunBody(CX, lerp(1400, 1130, ks), 70, t, { glow: ks }); }
  g.fillStyle = '#c7d6ec'; g.beginPath(); g.moveTo(0, 1250); for (let i = 0; i <= 20; i++) g.lineTo(i / 20 * W, 1250 + Math.sin(i * 1.3) * 20); g.lineTo(W, H); g.lineTo(0, H); g.fill();
  g.fillStyle = `rgba(10,10,40,${.75 - .35 * ks})`; g.fillRect(0, 1230, W, 700);
  const kc = cue(t, VO.s18 - .3, VO.s18 + .5); dome(250, 1300, 190, t, kc); dome(720, 1290, 260, t, kc); dome(1010, 1310, 120, t, kc);
  alien(330, 1720, .75, t, { lit: ks }); alien(560, 1760, .6, t, { col: '#7fa8e0', seed: 2, lit: ks }); alien(780, 1730, .7, t, { col: '#8fd0b0', seed: 4, lit: ks });
  word('CITIES', CX, 300, 140, P.gold, keyAt(t, T.cities, T.civ - .05)); word('A CIVILIZATION', CX, 300, 110, P.white, keyAt(t, T.civ, T.millions18 - .1));
  word('MILLIONS OF YEARS', CX, 300, 96, P.white, keyAt(t, T.millions18, T.oursun - .1)); word('IN THE DARK', CX, 400, 84, P.cyan, keyAt(t, T.millions18 + .2, T.oursun - .1));
  word('THEIR FIRST STAR', CX, 330, 112, P.gold, keyAt(t, T.first));
};
SC[17] = (t) => {                                                   // a message reaches every phone on Earth at once
  sky(t, '#0d0b33', '#2a1a5e');
  skyline(1250, '#1e1a45', '#ffd36a', t, 3, .7); g.fillStyle = '#15123a'; g.fillRect(0, 1350, W, 600);
  const km = cue(t, T.message - .2, T.phone + .2), ring_ = Math.sin(t * 30) * 4 * (km > 0 ? 1 : 0);
  const crowd = [['teen', 140, 1780, .8], ['gran', 340, 1830, .78], ['dad', 740, 1830, .84], ['kid2', 950, 1800, .66]];
  crowd.forEach(([n, x, y, s], i) => person(x, y, s, t, as(n, { mood: km > .5 ? 'shock' : 'happy', arms: 'phone2', lookY: .8, seed: i, screen: km > .5 ? '#7fffd4' : '#7fd3ff' })));
  g.save(); g.translate(CX + ring_, 780); g.scale(.6 + .4 * eo(km), .6 + .4 * eo(km)); g.globalAlpha *= km;
  g.fillStyle = '#1b1a33'; g.beginPath(); g.roundRect(-230, -420, 460, 840, 50); g.fill(); g.fillStyle = '#071226'; g.beginPath(); g.roundRect(-205, -390, 410, 780, 34); g.fill();
  label('INCOMING', 0, -260, 56, P.cyan, 1); label('origin: unknown', 0, -205, 34, P.white, .8);
  g.strokeStyle = P.cyan; g.lineWidth = 6; g.beginPath(); for (let i = 0; i <= 60; i++) { const x = -170 + i * 340 / 60, y = 0 + Math.sin(i * .7 + t * 14) * 60 * Math.sin(i / 60 * Math.PI) * (.4 + .6 * Math.abs(Math.sin(t * 5 + i * .1))); i ? g.lineTo(x, y) : g.moveTo(x, y); } g.stroke();
  g.fillStyle = '#5fe08a'; g.beginPath(); g.arc(-90, 260, 56, 0, TAU); g.fill(); g.fillStyle = P.red; g.beginPath(); g.arc(90, 260, 56, 0, TAU); g.fill(); g.restore();
  word('EVERY PHONE ON EARTH', CX, 260, 84, P.gold, keyAt(t, T.phone));
  word('AT THE SAME TIME', CX, 1340, 84, P.white, keyAt(t, T.same));
};
SC[18] = (t) => {                                                   // the alien speaks: "Your star is warm. Please. Let us stay."
  bg(t, '#020410', '#07122a');
  g.save(); const fl = .85 + .15 * Math.sin(t * 40) * Math.sin(t * 7); g.globalAlpha *= fl; glow(CX, 820, 520, '80,220,255', .25);
  for (let y = 300; y < 1400; y += 10) { g.fillStyle = 'rgba(80,220,255,.05)'; g.fillRect(0, y, W, 4); }
  alien(CX, 1420, 1.55, t, { col: '#5fd0e8', still: 1 });
  g.restore();
  const ws = wordTimes('s20', 0, 8);
  quote('“Your star is warm.', CX, 1530, 76, '#9ff0ff', t, 0, ws.slice(0, 4));
  quote('Please. Let us stay.”', CX, 1630, 76, '#9ff0ff', t, 0, ws.slice(4, 8));
};
SC[19] = (t) => {                                                   // their planet leaves in three days; refugees or invaders?
  sky(t, '#0d0b33', '#2a1a5e');
  const kl = cue(t, VO.s21, end('s21')); rogue(lerp(700, 860, kl), lerp(420, 300, kl), lerp(120, 70, kl), t, { lit: lerp(.9, .4, kl), ang: 2.6, moons: 1 });
  word('3 DAYS LEFT', CX, 250, 104, P.gold, keyAt(t, T.three21, T.send));
  word('MILLIONS', CX, 250, 120, P.white, keyAt(t, T.millions21, T.refugees - .2));
  const kss = cue(t, T.send - .2, T.send + 2.5); if (kss > 0) { const R = mulberry(14); for (let i = 0; i < 70; i++) { const p = (t * (.12 + R() * .1) + R()) % 1, sx = lerp(700, 860, kl) + (R() - .5) * 60, x = lerp(sx, 100 + R() * 880, p), y = lerp(lerp(420, 300, kl), 1350, p); glow(x, y, 18, '160,240,255', .5 * kss * (1 - p * .5)); dot(x, y, 4, `rgba(220,250,255,${kss})`); } }
  g.fillStyle = '#15123a'; g.fillRect(0, 1420, W, 500); hills(1420, '#1f1a48', 14, 3);
  const kr = keyAt(t, T.refugees), ki = keyAt(t, T.invaders);
  sign(270, 1350, .9, 'WELCOME', '#2f9e5a', t); sign(810, 1350, .9, 'GO HOME', '#d6334f', t, .05);
  person(150, 1760, .62, t, as('teen', { mood: 'grin', arms: 'cheer', look: .2 })); person(370, 1780, .6, t, as('gran', { mood: 'happy', arms: 'wave', seed: 1 }));
  person(700, 1780, .66, t, as('dad', { mood: 'angry', arms: 'hips', seed: 2, look: -.3 })); person(920, 1760, .6, t, as('astro2', { mood: 'worried', arms: 'mouth', seed: 3 }));
  word('REFUGEES?', 280, 1020, 84, '#5fe08a', kr, -.05, 440); word('INVADERS?', 800, 1120, 84, P.red, ki, .05, 440);
  if (t > T.nobody21 && t < T.refugees) word('NOBODY KNOWS', CX, 1050, 100, P.white, keyAt(t, T.nobody21, T.refugees));
};
SC[20] = (t) => {                                                   // "Mum? Are they scared too?"
  sky(t, '#0d0b33', '#3a2466');
  g.fillStyle = '#241f4e'; g.fillRect(0, 0, W, H); g.save(); g.beginPath(); g.rect(240, 200, 600, 640); g.clip(); sky(t, '#0d0b33', '#3a2466'); rogue(640, 420, 110, t, { lit: .5, ang: 2.6, moons: 1 }); g.restore();
  g.fillStyle = '#4a4380'; g.fillRect(530, 200, 20, 640); g.fillRect(240, 510, 600, 20); g.strokeStyle = '#4a4380'; g.lineWidth = 24; g.strokeRect(240, 200, 600, 640);     // a window
  bust(320, 1920, 1.0, t, as('mum', { mood: 'worried', look: .7, lookY: .2 }));
  bust(800, 1920, .78, t, as('kid2', { mood: t > T.mum && t < end('s22') ? 'talk' : 'worried', look: -.7, lookY: -.3 }));
  const ws = wordTimes('s22', 0, 5); quote('“Mum? Are they scared too?”', CX, 1020, 70, P.white, t, 0, ws);
};
SC[21] = (t) => {                                                   // countdown: three days, two, one
  bg(t, '#08061c', '#1d1152');
  const k3 = keyAt(t, T.c3, T.c2), k2 = keyAt(t, T.c2, T.c1), k1 = keyAt(t, T.c1);
  const kl = cue(t, T.c3, T.c1 + 1); rogue(CX, 640, lerp(170, 60, kl), t, { lit: lerp(.7, .2, kl), ang: 2.6, moons: 1 });
  for (const [n, k] of [['3', k3], ['2', k2], ['1', k1]]) word(n, CX, 1260, 380, n === '1' ? P.red : P.gold, k);
  label(t < T.c2 ? 'DAYS LEFT' : t < T.c1 ? 'DAYS LEFT' : 'DAY LEFT', CX, 1360, 60, P.white, k3 + k2 + k1);
  bust(CX, 1920, .62, t, as('you', { mood: 'worried', lookY: -1, look: 0 }));
};
SC[22] = (t) => {                                                   // would you let them stay? what would you choose?
  bg(t);
  const ka = pop(t, T.would - .1), kb = pop(t, T.would + .1);
  for (const [x, txt, col, colD, k] of [[300, 'LET THEM', '#2fbf6a', '#1f8a4c', ka], [780, 'SAY NO', '#e6334f', '#a8233a', kb]]) {
    if (k <= 0) continue; const pr = .5 + .5 * Math.sin(t * 5 + x); g.save(); g.translate(x, 900); g.scale(k, k);
    glow(0, 0, 300, col === '#2fbf6a' ? '60,220,120' : '255,60,90', .25 + .15 * pr);
    g.fillStyle = colD; g.beginPath(); g.ellipse(0, 30, 200, 80, 0, 0, TAU); g.fill(); g.fillRect(-200, -20, 400, 50);
    g.fillStyle = col; g.beginPath(); g.ellipse(0, -20, 200, 80, 0, 0, TAU); g.fill();
    g.restore();
    word(txt, x, 1100, 74, P.white, k, 0, 420); if (x < CX) word('STAY', x, 1180, 74, P.white, k, 0, 420);
  }
  word('WHAT WOULD', CX, 320, 110, P.white, keyAt(t, T.choose - .4, DUR - LOOP)); word('YOU CHOOSE?', CX, 440, 124, P.gold, keyAt(t, T.choose - .2, DUR - LOOP));
  person(CX, 1820, .7, t, as('you', { mood: 'think', arms: 'down', look: Math.sin(t * 1.6), lookY: .3 }));
};

// ───────── frame: a quick crossfade + push-in between scenes; the end loops into the start
function render(t) {
  g.setTransform(1, 0, 0, 1, 0, 0); g.globalAlpha = 1;
  const i = sceneAt(t), s0 = S[i], u = clamp((t - s0) / XF);
  const draw = (k, z, a, tt = t) => { g.save(); g.globalAlpha = a; g.translate(CX, 1000); g.scale(z, z); g.translate(-CX, -1000); SC[k](tt); g.restore(); };
  if (i > 0 && u < 1) { draw(i - 1, 1 + .06 * eio(u), 1); draw(i, 1.05 - .05 * eo(u), ss(u)); }
  else draw(i, 1 + (t - s0) * .005, 1);
  const lk = seg(t, DUR - LOOP, DUR); if (lk > 0) draw(0, 1, ss(lk), 0);
  g.setTransform(1, 0, 0, 1, 0, 0); g.globalAlpha = 1;
}

// ───────── events for the score and the mix
const EV = [];
for (const [id, t] of Object.entries(VO)) EV.push({ type: 'vo', id, t });
for (const [k, v] of Object.entries(T)) EV.push({ type: 'cue', name: k, t: +v.toFixed(3) });
S.forEach((s, i) => { if (i > 0 && i < S.length - 1) EV.push({ type: 'scene', i, t: +s.toFixed(3) }); });
EV.sort((a, b) => a.t - b.t);
window.EV = EV; window.DUR = DUR; window.render = render; window.S = S; window.T = T; window.VO = VO;
window.SUBS = lines.map((l, i) => { const ws = words[l.id], t0 = VO[l.id] - .05, nx = lines[i + 1] ? VO[lines[i + 1].id] - .05 : DUR; return { t0, t1: Math.max(Math.min(VO[l.id] + ws[ws.length - 1][2] + .6, nx), t0 + .8), text: l.sub || l.text }; });
render(+(new URLSearchParams(location.search).get('t') ?? .5));
window.READY = true;
