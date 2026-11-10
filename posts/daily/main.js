// Daily "Did you know?" science-fact photo (Facebook 4:5, 1080×1350) in the Beyond Everything flat style.
// Renders one fact from facts.json, chosen by ?fact=<id>. The illustration comes from the fact's motif:
// planet · sun · moon · earth · earthmoon · compare · dino · fish · bignum.
import * as K from './kit.js';
import { mulberry, TAU } from '/core/lib.js';
const { P, text, glow } = K;
const W = 1080, H = 1350, CX = W / 2;
const g = document.getElementById('c').getContext('2d'); K.setup(g, W, H);
await document.fonts.load('900 80px NU'); await document.fonts.load('800 40px NU');
const FACTS = await (await fetch('facts.json')).json();
const id = new URLSearchParams(location.search).get('fact') || FACTS[0].id;
const F = FACTS.find(f => f.id === id) || FACTS[0];

const dot = (x, y, r, c, a = 1) => { g.globalAlpha = a; g.fillStyle = c; g.beginPath(); g.arc(x, y, r, 0, TAU); g.fill(); g.globalAlpha = 1; };
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
function illustration(cy) {
  const m = F.motif;
  if (m === 'planet') planet(CX, cy, 170, F.color || '#e8b27a', { ring: F.ring, spot: F.spot });
  else if (m === 'sun') { glow(CX, cy, 380, '255,200,80', .35); K.sunChar(CX, cy, 165, 0, { mood: 'happy' }); }
  else if (m === 'moon') { glow(CX, cy, 300, '220,230,255', .35); K.moon(CX, cy, 160, 0, 'happy', {}); g.fillStyle = 'rgba(80,80,110,.55)'; for (const [dx, dy, a] of [[-40, 60, -.4], [10, 95, -.3]]) { g.save(); g.translate(CX + dx, cy + dy); g.rotate(a); g.beginPath(); g.ellipse(0, 0, 13, 24, 0, 0, TAU); g.fill(); g.restore(); } }
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
  else { glow(CX, cy, 300, '255,199,58', .18); text(F.big || '!', CX, cy + 70, 220, P.gold, 1000, P.navy, 18); }
}
function render() {
  const gr = g.createLinearGradient(0, 0, 0, H); gr.addColorStop(0, '#0b0826'); gr.addColorStop(1, '#1c1250'); g.fillStyle = gr; g.fillRect(0, 0, W, H);
  const head = wrap(F.head, 84, 860), hy0 = 300, lh = 95, hEnd = hy0 + (head.length - 1) * lh;
  const R = mulberry(F.id.length * 7 + 3), clear = [[110, 140, 970, hEnd + 40], [110, 990, 970, 1140], [330, 1255, 750, 1305]];
  for (let i = 0; i < 70; i++) { const x = R() * W, y = R() * H, r = .8 + R() * 2.2; if (clear.some(([a, b, c, d]) => x > a && x < c && y > b && y < d)) continue; dot(x, y, r, '#c9c2ff', .25 + .5 * R()); }
  text('DID YOU KNOW?', CX, 200, 46, P.gold, 1000, null, 0);
  head.forEach((l, i) => text(l, CX, hy0 + i * lh, 84, P.white, 1000, null, 0));
  illustration(Math.min(800, hEnd + 340));
  text(F.stat, CX, 1050, F.stat.length > 18 ? 62 : 76, P.gold, 1000, null, 0);
  text(F.sub, CX, 1120, F.sub.length > 40 ? 32 : 38, '#b9b3e6', 800, null, 0);
  text('BEYOND EVERYTHING', CX, 1290, 22, 'rgba(255,255,255,.35)', 900, null, 0);
}
render();
window.DUR = 1; window.EV = []; window.SUBS = []; window.render = () => render(); window.READY = true;
