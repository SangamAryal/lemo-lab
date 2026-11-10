"""Score for "What If Earth Had Rings?" short v2 (original, synthesized). A steady, mellow lo-fi bed the whole way through
(soft electric-piano chords, a round bass, a light kick and brushed hats), barely moving in level, as in our sound reference.
It cuts out for a beat on "gone" (the record scratch), and swells for the payoff."""
import os, sys, json, numpy as np, soundfile as sf
LIB = os.environ['LIB']; sys.path.insert(0, LIB)
from core.audio.sfx import SR, bp, lp, hp, add, limit
HERE = os.path.dirname(os.path.abspath(__file__))
ev = json.load(open(os.path.join(HERE, 'events.json'))); DUR = ev['dur']
T = {e['name']: e['t'] for e in ev['ev'] if e['type'] == 'cue'}; VO = {e['id']: e['t'] for e in ev['ev'] if e['type'] == 'vo'}
rng = np.random.default_rng(5); NS = int((DUR + 3) * SR); out = np.zeros((NS, 2), np.float32)
tt = lambda d: np.arange(int(d * SR)) / SR; hz = lambda m: 440 * 2 ** ((m - 69) / 12)
def put(x, t, g=1., pan=0.):
    if 0 <= t < DUR + 2: add(out, np.asarray(x, np.float32), t, g, pan)
def ep(m, d, v=.3): t = tt(d); f = hz(m); x = (np.sin(2 * np.pi * f * t) + .3 * np.sin(4 * np.pi * f * t) * np.exp(-t * 3)) * np.exp(-t * 1.1) * (1 + .08 * np.sin(2 * np.pi * 4.5 * t)); return lp(x * np.minimum(1, t / .01), 2400) * v * .3
def bass(m, d, v=.5): t = tt(d); return np.sin(2 * np.pi * hz(m) * t) * np.minimum(1, t / .02) * np.exp(-t / 1.1) * v * .5
def kick(v=.35): t = tt(.25); return np.sin(2 * np.pi * (48 + 60 * np.exp(-t / .03)) * t) * np.exp(-t / .11) * v
def hat(v=.06): t = tt(.07); return bp(rng.standard_normal(len(t)), 5000, 9000) * np.exp(-t / .02) * v
B = 60 / 88
PROG = [[50, 57, 60, 65], [46, 53, 57, 62], [43, 50, 55, 58], [45, 52, 55, 60]]
t = 0.; i = 0
while t < DUR + 1:
    ch = PROG[(i // 4) % 4]; end = t > VO['r09']; v = 1.25 if end else 1
    if i % 4 == 0:
        for k, m in enumerate(ch[1:]): put(ep(m + 12, B * 4, .3 * v), t + k * .015, 1, (k - 1) * .3)
        put(bass(ch[0] - 12, B * 2, .5 * v), t); put(bass(ch[0] - 5, B * 2, .5 * v), t + B * 2)
    put(kick(.3 * v), t) if i % 2 == 0 else put(kick(.12 * v), t + B * .75)
    put(hat(.05), t + B / 2, 1, .3); put(hat(.03), t + B * .75, 1, -.3)
    t += B; i += 1
i0, i1 = int((T['strange'] - .02) * SR), int((T['strange'] + .6) * SR); out[i0:i1] *= .15        # a hush on 'the strange part'
out = hp(out.T, 30).T.astype(np.float32); out = np.stack([limit(out[:, c], .9) for c in range(2)], 1)
os.makedirs(os.path.join(HERE, 'music'), exist_ok=True); sf.write(os.path.join(HERE, 'music/score.wav'), out[:int(DUR * SR)], SR); print('score', DUR)
