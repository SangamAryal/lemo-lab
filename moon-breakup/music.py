"""Score for "The Moon Is Leaving": a warm synth-and-bell explainer score (original, synthesized).
Bb major for the couple; a pulsing pluck for the mechanics; a dusty flashback pad; a bouncy bit for the dinosaurs;
a minor turn for the last eclipse; a low rumble for the red giant; a bright resolve for today's perfect eclipse."""
import os, sys, json, numpy as np, soundfile as sf
LIB = os.environ['LIB']; sys.path.insert(0, LIB)
from core.audio.sfx import SR, bp, lp, hp, add, limit
HERE = os.path.dirname(os.path.abspath(__file__))
ev = json.load(open(os.path.join(HERE, 'events.json'))); DUR = ev['dur']
T = {e['name']: e['t'] for e in ev['ev'] if e['type'] == 'cue'}; VO = {e['id']: e['t'] for e in ev['ev'] if e['type'] == 'vo'}
SCN = [e['t'] for e in ev['ev'] if e['type'] == 'scene']
rng = np.random.default_rng(6); NS = int((DUR + 3) * SR); out = np.zeros((NS, 2), np.float32)
tt = lambda d: np.arange(int(d * SR)) / SR
hz = lambda m: 440 * 2 ** ((m - 69) / 12)
def put(x, t, g=1., pan=0.):
    if 0 <= t < DUR + 2: add(out, np.asarray(x, np.float32), t, g, pan)
def pad(ms, d, v=.3, bright=1800, att=1.0, rel=1.4):
    t = tt(d); x = np.zeros(len(t))
    for m in ms:
        for det in (-.07, .06):
            ph = 2 * np.pi * hz(m) * 2 ** (det / 12) * t + rng.uniform(0, 6); x += sum(np.sin(k * ph) / k ** 1.3 for k in range(1, 7))
    return lp(x, bright) * np.minimum(1, t / att) * np.minimum(1, (d - t) / rel) * v * .07
def pluck(m, v=.4, d=.6, b=3800):
    f = hz(m); t = tt(d); x = sum(np.sin(2 * np.pi * f * k * t) / k * np.exp(-t * (3 + k * 2)) for k in range(1, 7)); return lp(x * np.minimum(1, t / .002), b) * v * .4
def bell(m, v=.4): t = tt(2.4); return sum(np.sin(2 * np.pi * hz(m) * r * t) * np.exp(-t / tau) * a for r, tau, a in [(1, 1.3, 1), (2.0, .5, .2), (3.01, .3, .12), (5.4, .12, .08)]) * v * .26
def bass(m, d, v=.5): t = tt(d); x = np.sin(2 * np.pi * hz(m) * t) + .35 * np.sin(4 * np.pi * hz(m) * t); return x * np.minimum(1, t / .02) * np.exp(-t / 1.4) * np.minimum(1, (d - t) / .1) * v * .5
def kick(v=.5): t = tt(.35); return np.sin(2 * np.pi * (50 + 90 * np.exp(-t / .03)) * t) * np.exp(-t / .12) * v
def shaker(v=.2): t = tt(.06); return bp(rng.standard_normal(len(t)), 4000, 10000) * np.exp(-t / .02) * v
def every(a, b, s):
    t = a
    while t < b - 1e-6: yield t; t += s
B = .5                                     # 120 bpm
CH = {'Bb': [58, 62, 65, 70], 'Gm': [55, 58, 62, 67], 'Eb': [51, 58, 63, 67], 'F': [53, 57, 60, 65], 'Cm': [48, 55, 60, 63], 'Dm': [50, 57, 62, 65]}
ROOT = {'Bb': 34, 'Gm': 31, 'Eb': 39, 'F': 29, 'Cm': 36, 'Dm': 38}
def section(t0, t1, prog, arp=True, drums=False, v=1., bright=2200):
    bar = 4 * B; k = 0
    for t in every(t0, t1, bar):
        c = prog[k % len(prog)]; d = min(bar + .4, t1 - t + .4)
        put(pad(CH[c], d, .3 * v, bright, .4, .5), t, 1, 0); put(bass(ROOT[c], min(bar, t1 - t), .5 * v), t)
        if arp:
            notes = CH[c] + [CH[c][1] + 12]
            for i, tq in enumerate(every(t, min(t + bar, t1), B / 2)): put(pluck(notes[[0, 2, 1, 3, 4, 3, 1, 2][i % 8]] + 12, .3 * v), tq, 1, (-1) ** i * .3)
        if drums:
            for i, tq in enumerate(every(t, min(t + bar, t1), B)): put(kick(.35 * v), tq) if i % 2 == 0 else None; put(shaker(.12 * v), tq + B / 2, 1, .3)
        k += 1
s = [0] + SCN + [DUR]
# the couple, the drift, the ruler
section(.3, s[2], ['Bb', 'Gm', 'Eb', 'F'], arp=False, v=.9)
for i, t in enumerate(every(.6, s[2], B * 2)): put(bell([77, 74, 70, 72][i % 4], .3), t, 1, (-1) ** i * .3)
put(bell(82, .45), T['cm'], 1, .2); put(bell(86, .3), T['nail'], 1, -.2)
# mirrors and lasers, then the mechanics: a steady pulse
section(s[2], s[3], ['Eb', 'F', 'Gm', 'F'], arp=True, v=.8)
section(s[3], s[5], ['Bb', 'F', 'Gm', 'Eb'], arp=True, drums=True, v=.9)
put(bell(89, .5), T['tugs'], 1, .3); put(bell(77, .5), T['brakes'], 1, -.3)
# flashback: dusty, low, slow
section(s[5], s[6], ['Cm', 'Gm', 'Eb', 'F'], arp=False, v=.9, bright=1100)
for i, t in enumerate(every(s[5] + .2, s[6], B * 1.5)): put(pluck([60, 63, 67, 70][i % 4], .25, 1.2, 2200), t, 1, (-1) ** i * .4)
# dinosaurs: bouncy
section(s[6], s[7], ['Bb', 'Eb', 'F', 'Bb'], arp=True, drums=True, v=1.0)
for t in every(T['d372'] - .3, T['d372'] + 1.2, 1 / 6): put(pluck(84, .2, .15), t, 1, .4)       # calendar flips
# the last eclipse: minor, thinning
section(s[7], s[8], ['Gm', 'Eb', 'Cm', 'Dm'], arp=False, v=.9, bright=1500)
put(bell(74, .5), T['noMore'], 1, 0); put(bell(70, .4), T['noMore'] + .4, 1, 0)
# the red giant: low swell
put(pad([34, 41, 46], s[9] - s[8] + .5, .5, 700, 1.5, .6), s[8]); put(bass(22, s[9] - s[8], .6), s[8])
# today: bright resolve
section(s[9], DUR - 1.5, ['Eb', 'F', 'Bb', 'Bb'], arp=True, v=.9, bright=2800)
for i, t in enumerate(every(s[9] + .3, DUR - 2, B)): put(bell([82, 86, 89, 86][i % 4], .25), t, 1, (-1) ** i * .3)
put(pad(CH['Bb'] + [74], 3.2, .4, 3000, .2, 2.5), DUR - 3.3); put(bell(82, .5), DUR - 3.3)
out = hp(out.T, 35).T.astype(np.float32); out = np.stack([limit(out[:, c], .9) for c in range(2)], 1)
os.makedirs(os.path.join(HERE, 'music'), exist_ok=True); sf.write(os.path.join(HERE, 'music/score.wav'), out[:int(DUR * SR)], SR)
print('score', DUR, 'peak', float(np.abs(out).max()))
