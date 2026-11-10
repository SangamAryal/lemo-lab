"""Score for "What If Earth Had Rings?" (original, synthesized). A wide, dreamy pad and a soft pluck arpeggio, a new chord for
every beat; a bell when a scene lands, a hush on "the strange part", a low, older colour for 466 million years ago,
and a warm resolve for "look up"."""
import os, sys, json, numpy as np, soundfile as sf
LIB = os.environ['LIB']; sys.path.insert(0, LIB)
from core.audio.sfx import SR, bp, lp, hp, add, limit
HERE = os.path.dirname(os.path.abspath(__file__))
ev = json.load(open(os.path.join(HERE, 'events.json'))); DUR = ev['dur']
T = {e['name']: e['t'] for e in ev['ev'] if e['type'] == 'cue'}
SCN = [e['t'] for e in ev['ev'] if e['type'] == 'scene']
rng = np.random.default_rng(4); NS = int((DUR + 3) * SR); out = np.zeros((NS, 2), np.float32)
tt = lambda d: np.arange(int(d * SR)) / SR
hz = lambda m: 440 * 2 ** ((m - 69) / 12)
def put(x, t, g=1., pan=0.):
    if 0 <= t < DUR + 2: add(out, np.asarray(x, np.float32), t, g, pan)
def pad(ms, d, v=.3, bright=1800, att=.6, rel=.8):
    t = tt(d); x = np.zeros(len(t))
    for m in ms:
        for det in (-.07, .06):
            ph = 2 * np.pi * hz(m) * 2 ** (det / 12) * t + rng.uniform(0, 6); x += sum(np.sin(k * ph) / k ** 1.3 for k in range(1, 7))
    return lp(x, bright) * np.minimum(1, t / att) * np.minimum(1, np.maximum(0, d - t) / rel) * v * .07
def pluck(m, v=.4, d=.5, b=3600):
    f = hz(m); t = tt(d); x = sum(np.sin(2 * np.pi * f * k * t) / k * np.exp(-t * (4 + k * 3)) for k in range(1, 7)); return lp(x * np.minimum(1, t / .002), b) * v * .4
def bell(m, v=.4): t = tt(2.0); return sum(np.sin(2 * np.pi * hz(m) * r * t) * np.exp(-t / tau) * a for r, tau, a in [(1, 1.1, 1), (2.0, .45, .2), (3.01, .25, .12)]) * v * .26
def bass(m, d, v=.5): t = tt(d); x = np.sin(2 * np.pi * hz(m) * t) + .3 * np.sin(4 * np.pi * hz(m) * t); return x * np.minimum(1, t / .015) * np.exp(-t / 1.0) * np.minimum(1, np.maximum(0, d - t) / .06) * v * .5
def every(a, b, s):
    t = a
    while t < b - 1e-6: yield t; t += s
B = 60 / 92
# one chord per scene: (notes, energy)
CH = [([57, 60, 64, 67], .5), ([53, 57, 60, 64], .6), ([50, 53, 57, 60], .55), ([52, 55, 59, 62], .65), ([50, 54, 57, 62], .8),
      ([52, 55, 58, 62], .85), ([45, 52, 57], .35), ([41, 48, 53, 56], .6), ([53, 57, 60, 64], .55)]
s = [0] + SCN + [DUR]
for i, (ch, en) in enumerate(CH):
    a, b = s[i], s[i + 1]
    put(pad(ch, b - a + .5, .25 * en + .06, 1100 + 1500 * en), a)
    for j, t in enumerate(every(a + .05, b, B)): put(bass(ch[0] - 12 + [0, 0, 7, 5][j % 4], B * .95, .4 * en), t)
    if i != 6:
        for j, t in enumerate(every(a + .05, b, B / 2)): put(pluck(ch[[0, 2, 1, 3, 2, 1][j % 6] % len(ch)] + 12, .2 * en, .45), t, 1, (-1) ** j * .35)
    if i > 0: put(bell(ch[0] + 24, .35), a + .4, 1, (-1) ** i * .3)
i0, i1 = int((T['strange'] - .1) * SR), int((T['strange'] + .6) * SR); out[i0:i1] *= np.linspace(1, .15, i1 - i0)[:, None] ** 2
put(bell(81, .5), T['look']); put(bell(88, .35), T['once'] + .1)
out = hp(out.T, 35).T.astype(np.float32); out = np.stack([limit(out[:, c], .9) for c in range(2)], 1)
os.makedirs(os.path.join(HERE, 'music'), exist_ok=True); sf.write(os.path.join(HERE, 'music/score.wav'), out[:int(DUR * SR)], SR)
print('score', DUR, 'peak', float(np.abs(out).max()))
