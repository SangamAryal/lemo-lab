"""Score for "What If a Rogue Planet Passed Earth?" (original, synthesized). Cinematic and story-led: a wide pad for the
wonder beats, a ticking pulse for the disasters, a low drone for the dread, a glassy shimmer for the alien moon, a
heartbeat under the countdown, and an unresolved chord for the final question."""
import os, sys, json, numpy as np, soundfile as sf
LIB = os.environ['LIB']; sys.path.insert(0, LIB)
from core.audio.sfx import SR, bp, lp, hp, add, limit
HERE = os.path.dirname(os.path.abspath(__file__))
ev = json.load(open(os.path.join(HERE, 'events.json'))); DUR = ev['dur']
T = {e['name']: e['t'] for e in ev['ev'] if e['type'] == 'cue'}
SCN = [e['t'] for e in ev['ev'] if e['type'] == 'scene']
rng = np.random.default_rng(11); NS = int((DUR + 3) * SR); out = np.zeros((NS, 2), np.float32)
tt = lambda d: np.arange(int(d * SR)) / SR
hz = lambda m: 440 * 2 ** ((m - 69) / 12)
def put(x, t, g=1., pan=0.):
    if 0 <= t < DUR + 2: add(out, np.asarray(x, np.float32), t, g, pan)
def pad(ms, d, v=.3, bright=1800, att=.8, rel=1.0):
    t = tt(d); x = np.zeros(len(t))
    for m in ms:
        for det in (-.08, .07):
            ph = 2 * np.pi * hz(m) * 2 ** (det / 12) * t + rng.uniform(0, 6); x += sum(np.sin(k * ph) / k ** 1.4 for k in range(1, 7))
    return lp(x, bright) * np.minimum(1, t / att) * np.minimum(1, np.maximum(0, d - t) / rel) * v * .06
def drone(m, d, v=.4): t = tt(d); x = np.sin(2 * np.pi * hz(m) * t) + .5 * np.sin(2 * np.pi * hz(m) * 1.004 * t) + .3 * np.sin(2 * np.pi * hz(m + 1) * t); return lp(x, 300) * (.7 + .3 * np.sin(2 * np.pi * .3 * t)) * np.minimum(1, t / 1.2) * np.minimum(1, np.maximum(0, d - t) / 1.0) * v * .4
def shimmer(ms, d, v=.3): t = tt(d); x = sum(np.sin(2 * np.pi * hz(m) * t + rng.uniform(0, 6)) * (.5 + .5 * np.sin(2 * np.pi * (3 + k) * t)) for k, m in enumerate(ms)); return x * np.minimum(1, t / 1.0) * np.minimum(1, np.maximum(0, d - t) / 1.0) * v * .05
def pluck(m, v=.4, d=.6, b=3000):
    f = hz(m); t = tt(d); x = sum(np.sin(2 * np.pi * f * k * t) / k * np.exp(-t * (3 + k * 3)) for k in range(1, 6)); return lp(x * np.minimum(1, t / .003), b) * v * .4
def bell(m, v=.4): t = tt(2.5); return sum(np.sin(2 * np.pi * hz(m) * r * t) * np.exp(-t / tau) * a for r, tau, a in [(1, 1.4, 1), (2.0, .5, .2), (3.01, .3, .12)]) * v * .26
def bass(m, d, v=.5): t = tt(d); x = np.sin(2 * np.pi * hz(m) * t) + .35 * np.sin(4 * np.pi * hz(m) * t); return x * np.minimum(1, t / .01) * np.exp(-t / .5) * np.minimum(1, np.maximum(0, d - t) / .05) * v * .5
def kick(v=.6): t = tt(.4); return np.sin(2 * np.pi * np.cumsum(45 + 100 * np.exp(-t / .04)) / SR) * np.exp(-t / .15) * v
def tickk(v=.15): n = int(.03 * SR); return bp(rng.standard_normal(n), 4000, 10000) * np.exp(-np.arange(n) / SR / .006) * v
def boom(v=.8): t = tt(3.0); return (np.sin(2 * np.pi * np.cumsum(30 + 60 * np.exp(-t / .2)) / SR) * np.exp(-t / .9) + lp(rng.standard_normal(len(t)), 200) * np.exp(-t / .4) * .5) * v
def every(a, b, s):
    t = a
    while t < b - 1e-6: yield t; t += s
B = 60 / 92
Dm, Bb, F, C, Gm, A7, Ebm = [50, 57, 62, 65], [46, 53, 58, 62], [53, 57, 60, 65], [48, 55, 60, 64], [43, 50, 55, 58], [45, 52, 55, 61], [51, 58, 61, 66]
ST = [(Dm, 'wonder', .6), (Bb, 'wonder', .6), (F, 'wonder', .65), (Dm, 'tension', .7), (F, 'still', .5), (Gm, 'tension', .65),
      (Bb, 'wonder', .7), (F, 'wonder', .85), (Dm, 'tension', .85), (Gm, 'tension', .75), (C, 'still', .5), (Dm, 'dread', .8),
      (A7, 'tension', .8), (Dm, 'dread', .7), (Bb, 'still', .6), (F, 'wonder', .7), (Bb, 'wonder', .8)]
s = [0] + SCN + [DUR]
assert len(ST) == len(s) - 1, (len(ST), len(s))
for i, (ch, st, en) in enumerate(ST):
    a, b = s[i], s[i + 1]; d = b - a + .8
    if st == 'wonder':
        put(pad(ch, d, .3 * en + .1, 1200 + 1600 * en), a)
        for j, t in enumerate(every(a + .1, b, B)): put(pluck(ch[[0, 2, 3, 1][j % 4]] + 12, .16 * en, .9), t, 1, (-1) ** j * .4)
    elif st == 'tension':
        put(pad(ch, d, .22 * en + .06, 900 + 900 * en), a)
        for j, t in enumerate(every(a + .05, b, B / 2)): put(bass(ch[0] - 12, B * .45, .5 * en), t)
        for j, t in enumerate(every(a + .05, b, B)): put(kick(.45 * en), t)
        for j, t in enumerate(every(a + .05 + B / 4, b, B / 2)): put(tickk(.18), t, 1, (-1) ** j * .4)
    elif st == 'dread': put(drone(ch[0] - 12, d, .6 * en), a); put(pad(ch, d, .18, 600, 1.2, 1.2), a)
    elif st == 'eerie': put(shimmer([m + 24 for m in ch], d, .8 * en), a); put(drone(ch[0] - 12, d, .35 * en), a)
    elif st == 'heart':
        put(drone(ch[0] - 12, d, .5), a)
        for t in every(a + .1, b, 60 / 70): put(kick(.6), t); put(kick(.35), t + .22)
    else: put(pad(ch, d, .25 * en + .08, 800, 1.2, 1.2), a)
for k, v in [('passed', .5), ('none', .5), ('watch', .45)]: put(bell(74 if k != 'none' else 81, v), T[k])
put(boom(.7), T['but11'] - .05); put(boom(.45), T['never'] - .05)
out = hp(out.T, 30).T.astype(np.float32); out = np.stack([limit(out[:, c], .9) for c in range(2)], 1)
os.makedirs(os.path.join(HERE, 'music'), exist_ok=True); sf.write(os.path.join(HERE, 'music/score.wav'), out[:int(DUR * SR)], SR)
print('score', DUR, 'peak', float(np.abs(out).max()))
