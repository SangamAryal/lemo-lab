"""Score for "Journey to the Bottom of the Ocean" (original, synthesized). A slow, curious undersea pulse: soft plucked
arpeggio and warm pad near the surface that sink in pitch and brightness as the depth gauge climbs, a sonar ping on every
new depth, a tense low pulse in the danger zone, a near-silent heartbeat drone in the dark, a bright beach tag at the end."""
import os, sys, json, numpy as np, soundfile as sf
LIB = os.environ['LIB']; sys.path.insert(0, LIB)
from core.audio.sfx import SR, bp, lp, hp, add, limit
HERE = os.path.dirname(os.path.abspath(__file__))
ev = json.load(open(os.path.join(HERE, 'events.json'))); DUR = ev['dur']; E = ev['ev']
SC = [e for e in E if e['type'] == 'scene']
rng = np.random.default_rng(5); NS = int((DUR + 3) * SR); out = np.zeros((NS, 2), np.float32)
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
def pluck(m, v=.4, d=.6, b=3000): f = hz(m); t = tt(d); x = sum(np.sin(2 * np.pi * f * k * t) / k * np.exp(-t * (3 + k * 2)) for k in range(1, 6)); return lp(x * np.minimum(1, t / .002), b) * v * .35
def bass(m, d, v=.5): t = tt(d); x = np.sin(2 * np.pi * hz(m) * t); return x * np.minimum(1, t / .02) * np.exp(-t / 1.2) * np.minimum(1, np.maximum(0, d - t) / .1) * v * .6
def ping(m, v=.4): t = tt(2.5); f = hz(m); return np.sin(2 * np.pi * f * t) * np.exp(-t / .7) * (1 + .3 * np.sin(2 * np.pi * 5 * t)) * v * .3
def beat(v=.5): t = tt(.25); return np.sin(2 * np.pi * (45 + 20 * np.exp(-t / .03)) * t) * np.exp(-t / .09) * v
def every(a, b, st):
    t = a
    while t < b - 1e-6: yield t; t += st
B = 60 / 76
bounds = [0] + [e['t'] for e in SC] + [DUR]
depths = [0] + [e['d'] for e in SC]
darks = [0] + [e['dark'] for e in SC]
surf = [1] + [e['surface'] for e in SC]
for i in range(len(bounds) - 1):
    a, b, d = bounds[i], bounds[i + 1], depths[i]
    sink = min(1, d / 11000) ** .5                     # deeper = lower and darker
    root = round(50 - 14 * sink); minor = d > 600
    ch = [root, root + (3 if minor else 4), root + 7, root + (10 if minor else 11)]
    bright = 2600 - 1900 * sink
    if surf[i] and d == 0 and i == len(bounds) - 2 and len(bounds) > 3 and darks[i - 1]:   # the beach tag
        put(pad([62, 66, 69, 74], b - a + .5, .4, 3000, .2, 1.5), a)
        for j, t in enumerate(every(a + .1, b, B / 2)): put(pluck([74, 78, 81, 86][j % 4], .3), t, 1, (-1) ** j * .3)
        continue
    put(pad(ch, b - a + .5, .3 if not darks[i] else .2, bright), a)
    for j, t in enumerate(every(a + .05, b, B)): put(bass(root - 24 + [0, 7][j % 2], B * .95, .45), t)
    if not darks[i]:
        for j, t in enumerate(every(a + .05, b, B / 2)): put(pluck(ch[[0, 2, 1, 3][j % 4]] + 12, .22, .6, bright + 600), t, 1, (-1) ** j * .35)
    else:
        for t in every(a + .1, b, B): put(beat(.35), t); put(beat(.2), t + .22)      # a slow heartbeat in the dark
    if i > 0: put(ping(81 - 10 * sink, .5), a + .3, 1, .4)
out = hp(out.T, 30).T.astype(np.float32); out = np.stack([limit(out[:, c], .9) for c in range(2)], 1)
os.makedirs(os.path.join(HERE, 'music'), exist_ok=True); sf.write(os.path.join(HERE, 'music/score.wav'), out[:int(DUR * SR)], SR)
print('score', DUR, 'peak', float(np.abs(out).max()))
