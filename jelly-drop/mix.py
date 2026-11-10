"""SFX + score → mix.wav for Jelly Drop: a hard metal clunk when the rigid ball jams, wet squishes as the jelly squeezes, a
splat and soft wobble boings when it lands, a whoosh on each drop."""
import os, sys, json, numpy as np, soundfile as sf
LIB = os.environ['LIB']; sys.path.insert(0, LIB)
from core.audio.sfx import SR, bp, lp, hp, add, limit
HERE = os.path.dirname(os.path.abspath(__file__))
ev = json.load(open(os.path.join(HERE, 'events.json'))); E = ev['ev']; DUR = ev['dur']
rng = np.random.default_rng(3); NS = int((DUR + 1) * SR); fx = np.zeros((NS, 2), np.float32)
tt = lambda d: np.arange(int(d * SR)) / SR
def put(buf, x, t, g=1., pan=0.):
    if 0 <= t < DUR: add(buf, np.asarray(x, np.float32), t, g, pan)
def clunk(k): t = tt(.7); x = sum(np.sin(2 * np.pi * f * t + rng.uniform(0, 6)) * np.exp(-t / d) for f, d in [(410, .25), (1130, .12), (2370, .06), (3900, .03)]); return (x * .3 + lp(rng.standard_normal(len(t)), 900) * np.exp(-t / .02)) * (.5 + .5 * k)
def squish(k): t = tt(.35); f = 180 + 500 * np.exp(-t / .1); return (bp(rng.standard_normal(len(t)), 300, 1800) * (.6 + .4 * np.sin(2 * np.pi * 30 * t)) * np.sin(np.pi * t / .35) * .5 + np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-t / .12) * .3) * (.4 + .6 * k)
def splat(k): t = tt(.5); return (lp(rng.standard_normal(len(t)), 1200) * np.exp(-t / .07) * 1.2 + np.sin(2 * np.pi * (90 + 60 * np.exp(-t / .05)) * t) * np.exp(-t / .15) * .8) * (.5 + .5 * k)
def boing(k, f=150): t = tt(.5); ff = f * (1 + .25 * np.sin(2 * np.pi * 7 * t) * np.exp(-t / .2)); return np.sin(2 * np.pi * np.cumsum(ff) / SR) * np.exp(-t / .2) * .35 * k
def whoosh(d=.6): t = tt(d); return bp(rng.standard_normal(len(t)), 400, 3000) * np.sin(np.pi * t / d) ** 2 * .3
last = -1
for e in E:
    if e['type'] == 'scene': put(fx, whoosh(.7), e['t'] + .15, .8)
    elif e['type'] == 'cue':
        if e['t'] - last < .08: continue
        last = e['t']; k = e.get('k', .6)
        if e['name'] == 'clunk': put(fx, clunk(k), e['t'], 1, -.1)
        elif e['name'] == 'splat': put(fx, splat(k), e['t'], 1, 0); put(fx, boing(.6, 130), e['t'] + .2, 1, .1)
        elif e['name'] == 'squish': put(fx, squish(k), e['t'], .9, rng.uniform(-.2, .2))
mus, _ = sf.read(os.path.join(HERE, 'music/score.wav')); mus = mus[:NS]
if len(mus) < NS: mus = np.pad(mus, ((0, NS - len(mus)), (0, 0)))
mix = mus * .5 + fx * 1.0
mix = np.stack([limit(mix[:, c], .95) for c in range(2)], 1)
sf.write(os.path.join(HERE, 'mix.wav'), mix[:int(DUR * SR)].astype(np.float32), SR); print('mix', DUR)
