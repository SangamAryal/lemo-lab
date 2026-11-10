"""Score for "The Next 100 Billion Years" (original, synthesized). A ticking, curious pulse that grows with every jump:
each era is a new two-bar loop (soft pluck arpeggio + pad + bass), stepping up a key as the numbers get bigger, with a riser
into every jump and a bell on every landing. Heat and drama from the billion-year mark, a hush for the empty universe,
a warm resolve for "enjoy tonight's sky"."""
import os, sys, json, numpy as np, soundfile as sf
LIB = os.environ['LIB']; sys.path.insert(0, LIB)
from core.audio.sfx import SR, bp, lp, hp, add, limit
HERE = os.path.dirname(os.path.abspath(__file__))
ev = json.load(open(os.path.join(HERE, 'events.json'))); DUR = ev['dur']
T = {e['name']: e['t'] for e in ev['ev'] if e['type'] == 'cue'}; VO = {e['id']: e['t'] for e in ev['ev'] if e['type'] == 'vo'}
SCN = [e['t'] for e in ev['ev'] if e['type'] == 'scene']
rng = np.random.default_rng(3); NS = int((DUR + 3) * SR); out = np.zeros((NS, 2), np.float32)
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
def pluck(m, v=.4, d=.45, b=3600):
    f = hz(m); t = tt(d); x = sum(np.sin(2 * np.pi * f * k * t) / k * np.exp(-t * (5 + k * 3)) for k in range(1, 7)); return lp(x * np.minimum(1, t / .002), b) * v * .4
def bell(m, v=.4): t = tt(2.0); return sum(np.sin(2 * np.pi * hz(m) * r * t) * np.exp(-t / tau) * a for r, tau, a in [(1, 1.1, 1), (2.0, .45, .2), (3.01, .25, .12)]) * v * .26
def bass(m, d, v=.5): t = tt(d); x = np.sin(2 * np.pi * hz(m) * t) + .3 * np.sin(4 * np.pi * hz(m) * t); return x * np.minimum(1, t / .015) * np.exp(-t / .8) * np.minimum(1, np.maximum(0, d - t) / .06) * v * .5
def kick(v=.5): t = tt(.3); return np.sin(2 * np.pi * (48 + 80 * np.exp(-t / .03)) * t) * np.exp(-t / .11) * v
def tick(v=.15): n = int(.02 * SR); return bp(rng.standard_normal(n), 3000, 9000) * np.exp(-np.arange(n) / SR / .004) * v
def riser(d=.6, v=.4): t = tt(d); return bp(rng.standard_normal(len(t)), 600, 7000) * (t / d) ** 2 * v * .5 + np.sin(2 * np.pi * np.cumsum(200 + 1400 * (t / d) ** 2) / SR) * (t / d) ** 2 * v * .15
def every(a, b, s):
    t = a
    while t < b - 1e-6: yield t; t += s
B = 60 / 100
MINOR = {1: [0, 3, 7, 10], 0: [0, 4, 7, 11]}
s = [0] + SCN + [DUR]
# era by era: (root, major?, energy)
ERA = [(50, 1, .5), (50, 1, .6), (52, 1, .65), (52, 0, .7), (53, 1, .7), (55, 1, .75), (55, 1, .8), (57, 0, .8), (57, 1, .85), (58, 0, .95), (53, 0, 1.0), (50, 0, .6), (45, 0, .35), (50, 1, .6)]
for i, (root, maj, en) in enumerate(ERA):
    a, b = s[i], s[i + 1]; ch = [root + x for x in (MINOR[0] if maj else MINOR[1])]
    put(pad(ch, b - a + .4, .25 * en + .05, 1200 + 1600 * en), a)
    for j, t in enumerate(every(a + .05, b, B)): put(bass(root - 24 + [0, 0, 7, 5][j % 4], B * .9, .45 * en), t)
    if i not in (12,):
        for j, t in enumerate(every(a + .05, b, B / 2)): put(pluck(ch[[0, 2, 1, 3, 2, 1][j % 6]] + 12, .22 * en, .4), t, 1, (-1) ** j * .35)
        for j, t in enumerate(every(a + .05, b, B)):
            put(tick(.12), t + B / 2, 1, .4)                                  # the clock
            if i >= 4 and j % 2 == 0: put(kick(.3 * en), t)
    if i > 0: put(riser(.5, .45), a - .02); put(bell(ch[0] + 24, .45), a + .5, 1, (-1) ** i * .3)
# the empty universe: a single high drone, then the warm resolve
put(pad([69, 76], s[13] - s[12] + .6, .2, 3000, 1.5, 1.0), s[12])
put(pad([62, 66, 69, 74], DUR - s[13] + .5, .4, 2600, .3, 2.0), s[13]); put(bell(86, .5), T['limited']); put(bell(81, .4), T['limited'] + .25)
out = hp(out.T, 35).T.astype(np.float32); out = np.stack([limit(out[:, c], .9) for c in range(2)], 1)
os.makedirs(os.path.join(HERE, 'music'), exist_ok=True); sf.write(os.path.join(HERE, 'music/score.wav'), out[:int(DUR * SR)], SR)
print('score', DUR, 'peak', float(np.abs(out).max()))
