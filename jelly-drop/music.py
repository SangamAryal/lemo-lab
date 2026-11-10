"""A soft, satisfying lo-fi bed for Jelly Drop (original, synthesized): mellow electric-piano chords, a round sub bass, a light
brushed beat; it ducks a touch at each round change."""
import os, sys, json, numpy as np, soundfile as sf
LIB = os.environ['LIB']; sys.path.insert(0, LIB)
from core.audio.sfx import SR, bp, lp, hp, add, limit
HERE = os.path.dirname(os.path.abspath(__file__))
ev = json.load(open(os.path.join(HERE, 'events.json'))); DUR = ev['dur']
rng = np.random.default_rng(7); NS = int((DUR + 2) * SR); out = np.zeros((NS, 2), np.float32)
tt = lambda d: np.arange(int(d * SR)) / SR; hz = lambda m: 440 * 2 ** ((m - 69) / 12)
def put(x, t, g=1., pan=0.):
    if 0 <= t < DUR + 1: add(out, np.asarray(x, np.float32), t, g, pan)
def ep(m, d, v=.3): t = tt(d); f = hz(m); x = (np.sin(2 * np.pi * f * t) + .25 * np.sin(4 * np.pi * f * t) * np.exp(-t * 3)) * np.exp(-t * 1.3) * (1 + .1 * np.sin(2 * np.pi * 5 * t)); return lp(x * np.minimum(1, t / .01), 2500) * v * .3
def bass(m, d, v=.5): t = tt(d); return np.sin(2 * np.pi * hz(m) * t) * np.minimum(1, t / .02) * np.exp(-t / .9) * v * .5
def kick(v=.4): t = tt(.25); return np.sin(2 * np.pi * (50 + 60 * np.exp(-t / .03)) * t) * np.exp(-t / .1) * v
def brush(v=.12): t = tt(.12); return bp(rng.standard_normal(len(t)), 3000, 9000) * np.exp(-t / .03) * v
B = 60 / 84
PROG = [[50, 57, 60, 64], [45, 52, 55, 60], [47, 54, 57, 62], [43, 50, 55, 59]]
t = 0.; i = 0
while t < DUR:
    ch = PROG[(i // 4) % 4]
    if i % 4 == 0:
        for k, m in enumerate(ch[1:]): put(ep(m + 12, B * 4), t + k * .02, 1, (k - 1) * .3)
        put(bass(ch[0] - 12, B * 2), t); put(bass(ch[0] - 5, B * 2), t + B * 2)
    put(kick(.35 if i % 2 == 0 else .0), t); put(brush(.1 if i % 2 else .05), t + B / 2, 1, .3)
    t += B; i += 1
out = hp(out.T, 30).T.astype(np.float32); out = np.stack([limit(out[:, c], .9) for c in range(2)], 1)
os.makedirs(os.path.join(HERE, 'music'), exist_ok=True); sf.write(os.path.join(HERE, 'music/score.wav'), out[:int(DUR * SR)], SR); print('score', DUR)
