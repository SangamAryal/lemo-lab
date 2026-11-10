// TikTok photo carousel slide (3:4, 1080×1440 — fits TikTok's photo feed without cropping), Beyond Everything flat style: "5 amazing facts about <topic>".
// ?topic=<id>&slide=0 is the cover; slides 1..5 count down #5 → #1 (facts[0] … facts[4]; the best fact is last).
import * as K from './kit.js';
import { mulberry, TAU } from '/core/lib.js';
const { P, text, glow } = K;
const W = 1080, H = 1440, CX = W / 2;
const g = document.getElementById('c').getContext('2d'); K.setup(g, W, H);
await document.fonts.load('900 80px NU'); await document.fonts.load('800 40px NU');
const TOPICS = await (await fetch('topics.json')).json();
const Q = new URLSearchParams(location.search), TP = TOPICS.find(t => t.id === Q.get('topic')) || TOPICS[0], SL = +(Q.get('slide') || 0);
const dot = (x, y, r, c, a = 1) => { g.globalAlpha = a; g.fillStyle = c; g.beginPath(); g.arc(x, y, r, 0, TAU); g.fill(); g.globalAlpha = 1; };
const scaled = (k, x, y, f) => { g.save(); g.translate(x, y); g.scale(k, k); g.translate(-x, -y); f(); g.restore(); };
function wrap(s, px, maxW) { g.font = `1000 ${px}px NU`; const out = []; let line = ''; for (const w of s.split(' ')) { const t = line ? line + ' ' + w : w; if (g.measureText(t).width > maxW && line) { out.push(line); line = w; } else line = t; } if (line) out.push(line); return out; }
function planet(x, y, r, col, o = {}) {
  glow(x, y, r * 1.6, '255,220,170', .18);
  if (o.ring === true) { g.save(); g.strokeStyle = 'rgba(240,215,160,.85)'; g.lineWidth = r * .16; g.beginPath(); g.ellipse(x, y, r * 2, r * .5, -.25, Math.PI, TAU); g.stroke(); g.restore(); }
  if (o.ring === 'vertical') { g.save(); g.strokeStyle = 'rgba(200,240,245,.6)'; g.lineWidth = r * .08; g.beginPath(); g.ellipse(x, y, r * .45, r * 1.8, .1, -Math.PI / 2, Math.PI / 2, true); g.stroke(); g.restore(); }
  g.save(); g.beginPath(); g.arc(x, y, r, 0, TAU); g.clip(); g.fillStyle = col; g.fillRect(x - r, y - r, 2 * r, 2 * r);
  g.fillStyle = 'rgba(255,255,255,.12)'; for (const [v, h] of [[-.45, .1], [.05, .08], [.5, .1]]) { g.beginPath(); g.ellipse(x, y + v * r, r * 1.1, h * r, 0, 0, TAU); g.fill(); }
  if (o.spot) { g.fillStyle = '#c4482e'; g.beginPath(); g.ellipse(x + r * .25, y + r * .3, r * .28, r * .16, 0, 0, TAU); g.fill(); }
  g.fillStyle = 'rgba(30,20,60,.3)'; g.beginPath(); g.arc(x + r * .35, y + r * .1, r * 1.1, 0, TAU); g.arc(x - r * .15, y - r * .08, r * 1.02, 0, TAU, true); g.fill('evenodd'); g.restore();
  g.save(); g.translate(x, y); K.face(r, o.mood || 'happy', 0, 0, 3.3); g.restore();
  if (o.ring === true) { g.save(); g.strokeStyle = 'rgba(240,215,160,.9)'; g.lineWidth = r * .16; g.beginPath(); g.ellipse(x, y, r * 2, r * .5, -.25, 0, Math.PI); g.stroke(); g.restore(); }
  if (o.ring === 'vertical') { g.save(); g.strokeStyle = 'rgba(200,240,245,.7)'; g.lineWidth = r * .08; g.beginPath(); g.ellipse(x, y, r * .45, r * 1.8, .1, -Math.PI / 2, Math.PI / 2); g.stroke(); g.restore(); }
}
function illustration(F, cy) {
  const m = F.motif;
  if (m === 'planet') planet(CX, cy, 170, F.color || '#e8b27a', { ring: F.ring, spot: F.spot });
  else if (m === 'sun') { glow(CX, cy, 380, '255,200,80', .35); K.sunChar(CX, cy, 165, 0, { mood: 'happy' }); }
  else if (m === 'moon') { glow(CX, cy, 300, '220,230,255', .35); K.moon(CX, cy, 160, 0, 'happy', {}); if (F.prints) { g.fillStyle = 'rgba(80,80,110,.55)'; for (const [dx, dy, a] of [[-40, 60, -.4], [10, 95, -.3]]) { g.save(); g.translate(CX + dx, cy + dy); g.rotate(a); g.beginPath(); g.ellipse(0, 0, 13, 24, 0, 0, TAU); g.fill(); g.restore(); } } }
  else if (m === 'earth') { K.earth(CX, cy, 170, 0, 'happy', { rot: 1.1 });
    if (F.core) { g.save(); g.beginPath(); g.arc(CX, cy, 170, -1.2, .2); g.lineTo(CX, cy); g.closePath(); g.clip(); dot(CX, cy, 170, '#c4482e'); dot(CX, cy, 120, '#ff8a3c'); dot(CX, cy, 60, '#ffd34a'); g.restore(); }
    if (F.station) { g.save(); g.strokeStyle = 'rgba(255,255,255,.35)'; g.setLineDash([10, 10]); g.lineWidth = 3; g.beginPath(); g.ellipse(CX, cy, 240, 70, -.2, 0, TAU); g.stroke(); g.restore(); g.fillStyle = '#c9ced9'; g.fillRect(CX + 200, cy - 75, 40, 10); g.fillStyle = '#2f5fd0'; g.fillRect(CX + 185, cy - 90, 14, 40); g.fillRect(CX + 241, cy - 90, 14, 40); } }
  else if (m === 'earthmoon') { K.earth(CX - 240, cy, 120, 0, 'worried', { look: 1, rot: 1.1 }); glow(CX + 250, cy, 140, '220,230,255', .3); K.moon(CX + 250, cy, 62, 0, 'happy', { look: -1 }); g.save(); g.setLineDash([14, 14]); g.strokeStyle = 'rgba(255,255,255,.45)'; g.lineWidth = 4; g.beginPath(); g.moveTo(CX - 90, cy); g.lineTo(CX + 160, cy); g.stroke(); g.restore(); }
  else if (m === 'compare') { const big = F.big === 'Sun', bc = big ? '#ffcf4a' : '#e8b27a', bx = CX - 90, by = cy - 70;
    glow(bx, by, 260, big ? '255,200,80' : '255,220,170', .3); dot(bx, by, 150, bc); g.save(); g.translate(bx, by); K.face(150, 'smug', 0, .5, 2); g.restore();
    K.earth(CX + 230, cy + 40, 26, 0, 'scared', { look: -1, rot: 1.1 });
    text(F.big, bx, by + 195, 32, '#cfd3ff', 900, null, 0); text(F.small, CX + 230, cy + 95, 26, '#cfd3ff', 900, null, 0); }
  else if (m === 'dino') { g.save(); g.translate(CX + 40, cy + 30); g.scale(.55, .55); K.dino(0, 0, 1, 0); g.restore(); }
  else if (m === 'fish') { K.fish(CX - 40, cy, 2.1, 0, { mood: 'smug' }); }
  else if (m === 'redgiant') { glow(CX, cy, 420, '255,90,60', .45); dot(CX, cy, 230, '#ff6a4a'); g.save(); g.translate(CX, cy); K.face(230, 'sleepy', 0, 0, 2); g.restore(); K.earth(CX + 300, cy - 230, 30, 0, 'scared', { look: -1, rot: 1.1 }); }
  else if (m === 'blackhole') { glow(CX, cy, 360, '255,150,60', .35); g.save(); g.translate(CX, cy); g.rotate(-.25); for (const [rx, ry, c, w] of [[290, 70, '#ffb347', 26], [250, 60, '#ff7a3c', 18], [320, 80, 'rgba(255,220,150,.5)', 8]]) { g.strokeStyle = c; g.lineWidth = w; g.beginPath(); g.ellipse(0, 0, rx, ry, 0, Math.PI, TAU); g.stroke(); } g.restore();
    dot(CX, cy, 150, '#05030c'); g.strokeStyle = 'rgba(255,200,120,.8)'; g.lineWidth = 6; g.beginPath(); g.arc(CX, cy, 152, 0, TAU); g.stroke();
    g.save(); g.translate(CX, cy); g.rotate(-.25); for (const [rx, ry, c, w] of [[290, 70, '#ffb347', 26], [250, 60, '#ff7a3c', 18]]) { g.strokeStyle = c; g.lineWidth = w; g.beginPath(); g.ellipse(0, 0, rx, ry, 0, 0, Math.PI); g.stroke(); } g.restore();
    g.save(); g.translate(CX, cy); K.face(110, 'smug', 0, 0, 5); g.restore(); }
  else if (m === 'stars') { const R = mulberry(5); for (let i = 0; i < 14; i++) { const x = CX + (R() - .5) * 760, y = cy + (R() - .5) * 420; K.sparkle(x, y, 10 + R() * 26, i % 3 ? '#ece6ff' : '#ffd36a'); }
    if (F.pair) { glow(CX - 110, cy, 200, '255,210,120', .35); glow(CX + 110, cy, 160, '160,200,255', .35); K.sunBody(CX - 110, cy, 90, 0); dot(CX + 120, cy + 10, 65, '#a8c8ff'); g.save(); g.translate(CX + 120, cy + 10); K.face(65, 'happy', 0, -1, 4); g.restore(); g.save(); g.translate(CX - 110, cy); K.face(90, 'happy', 0, 1, 3); g.restore(); }
    else { glow(CX, cy, 220, '255,230,150', .35); K.sparkle(CX, cy, 150, '#ffe9a6'); g.save(); g.translate(CX, cy + 10); K.face(60, 'happy', 0, 0, 2); g.restore(); } }
  else { glow(CX, cy, 300, '255,199,58', .18); text(F.big || '!', CX, cy + 70, 220, P.gold, 1000, P.navy, 18); }
}
function sky(seed, clear) {
  const gr = g.createLinearGradient(0, 0, 0, H); gr.addColorStop(0, '#0b0826'); gr.addColorStop(1, '#1c1250'); g.fillStyle = gr; g.fillRect(0, 0, W, H);
  const R = mulberry(seed); for (let i = 0; i < 110; i++) { const x = R() * W, y = R() * H, r = .8 + R() * 2.4; if (clear.some(([a, b, c, d]) => x > a && x < c && y > b && y < d)) continue; dot(x, y, r, '#c9c2ff', .25 + .5 * R()); }
}
function render() {
  if (SL === 0) {                                                   // cover
    sky(TP.id.length * 13 + 1, [[80, 170, 1000, 520], [250, 1150, 830, 1270]]);
    text('5 AMAZING FACTS', CX, 250, 74, P.gold, 1000, null, 0);
    text('ABOUT', CX, 345, 58, P.white, 1000, null, 0);
    const t = TP.title, px = t.length > 9 ? 110 : 145; text(t, CX, 495, px, P.white, 1000, P.navy, 16);
    scaled(1.05, CX, 820, () => illustration({ ...TP.cover }, 820));
    g.fillStyle = 'rgba(255,255,255,.12)'; g.beginPath(); g.roundRect(CX - 190, 1160, 380, 88, 44); g.fill();
    text('swipe  →', CX, 1220, 48, P.white, 1000, null, 0);
  } else {                                                          // fact slide: countdown #5 … #1
    const n = 6 - SL, F = TP.facts[SL - 1], head = wrap(F.head, 68, 900), hy0 = 440, lh = 78, hEnd = hy0 + (head.length - 1) * lh;
    sky(TP.id.length * 13 + SL * 7, [[80, 130, 1000, hEnd + 30], [80, 1100, 1000, 1260]]);
    glow(CX, 230, 170, '255,199,58', .25); dot(CX, 230, 92, P.gold); text(String(n), CX, 270, 120, P.navy, 1000, null, 0);
    if (n === 1) text('AND #1\u2026', CX, 365, 34, P.gold, 1000, null, 0);
    head.forEach((l, i) => text(l, CX, hy0 + i * lh, 68, P.white, 1000, null, 0));
    const cy = Math.min(860, Math.max(820, hEnd + 250)); scaled(head.length > 3 ? .8 : .95, CX, cy, () => illustration(F, cy));
    text(F.stat, CX, 1150, F.stat.length > 18 ? 60 : 74, P.gold, 1000, null, 0);
    text(F.sub, CX, 1215, F.sub.length > 42 ? 30 : 36, '#b9b3e6', 800, null, 0);
  }
  text('BEYOND EVERYTHING', CX, 1370, 22, 'rgba(255,255,255,.35)', 900, null, 0);
}
render();
window.DUR = 1; window.EV = []; window.SUBS = []; window.render = () => render(); window.READY = true;
