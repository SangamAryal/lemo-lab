"""SFX + VO + score → mix.wav. A record scratch on the reveal, cartoon pops when things appear, a sip, a fly, a thermometer
pop, confetti, flickering bulbs, a big zoom-out whoosh, pinball ticks for the photon, a zip and a ping, proton boings and a
wall thud, a tunnelling shimmer and a fusion ding, clock ticks, a flare roar, a sad fizzle, a fish plop, a wink sparkle."""
import os, sys, json, numpy as np, soundfile as sf, soxr
LIB = os.environ['LIB']; sys.path.insert(0, LIB)
from core.audio.sfx import SR, bp, lp, hp, add, compress, limit
from core.audio import sampler as S
HERE = os.path.dirname(os.path.abspath(__file__))
ev = json.load(open(os.path.join(HERE, 'events.json'))); E = ev['ev']; DUR = ev['dur']
T = {e['name']: e['t'] for e in E if e['type'] == 'cue'}; VO = {e['id']: e['t'] for e in E if e['type'] == 'vo'}
rng = np.random.default_rng(12); NS = int((DUR + 1) * SR)
fx, vo = np.zeros((NS, 2), np.float32), np.zeros((NS, 2), np.float32)
tt = lambda d: np.arange(int(d * SR)) / SR
db = lambda x: 10 ** (x / 20)
def put(buf, x, t, g=1., pan=0.):
    if 0 <= t < DUR: add(buf, np.asarray(x, np.float32), t, g, pan)
def popf(v=.5, f=700): t = tt(.12); return np.sin(2 * np.pi * np.cumsum(f * (1 + 1.5 * np.exp(-t / .02))) / SR) * np.exp(-t / .04) * v
def whoosh(d=.5, v=.6, lo=300, hi=4000): t = tt(d); return bp(rng.standard_normal(len(t)), lo, hi) * np.sin(np.pi * t / d) ** 2 * .4 * v
def ping(v=.5, f=1760): t = tt(1.0); return (np.sin(2 * np.pi * f * t) + .3 * np.sin(4 * np.pi * f * t)) * np.exp(-t / .3) * v * .4
def boing(v=.5, f=220): t = tt(.6); ff = f * (1 + .5 * np.sin(2 * np.pi * 9 * t) * np.exp(-t / .2)); return np.sin(2 * np.pi * np.cumsum(ff) / SR) * np.exp(-t / .25) * v * .5
def tick(v=.3): n = int(.02 * SR); return bp(rng.standard_normal(n), 2000, 8000) * np.exp(-np.arange(n) / SR / .004) * v
def scratch(v=.6):                                              # a record scratch: a fast pitch wobble on a buzzy tone + noise
    t = tt(.45); f = 300 + 900 * np.abs(np.sin(2 * np.pi * 3.2 * t)); x = np.sign(np.sin(2 * np.pi * np.cumsum(f) / SR)) * .3 + bp(rng.standard_normal(len(t)), 800, 5000) * .6
    return x * np.exp(-t / .2) * v * .5
def slurp(v=.4): t = tt(.7); return bp(rng.standard_normal(len(t)), 600, 2400) * (.5 + .5 * np.sin(2 * np.pi * 14 * t)) * np.sin(np.pi * t / .7) * v * .5
def buzz(d, v=.15): t = tt(d); return bp(np.sign(np.sin(2 * np.pi * (180 + 20 * np.sin(2 * np.pi * 3 * t)) * t)), 150, 2000) * np.minimum(1, t / .1) * np.minimum(1, (d - t) / .2) * v
def thud(v=.7): t = tt(.4); return (np.sin(2 * np.pi * (70 + 40 * np.exp(-t / .02)) * t) * np.exp(-t / .1) + lp(rng.standard_normal(len(t)), 400) * np.exp(-t / .05)) * v
def shimmer(d=1.2, v=.4): t = tt(d); return sum(np.sin(2 * np.pi * f * t + rng.uniform(0, 6)) * (.5 + .5 * np.sin(2 * np.pi * 7 * t + k)) for k, f in enumerate([1568, 2093, 2637, 3136])) * np.sin(np.pi * t / d) * v * .06
def roar(d, v=.6): t = tt(d); return lp(rng.standard_normal(len(t)), 500) * np.minimum(1, t / .4) * np.minimum(1, (d - t) / .3) * v * 2
def fizzle(v=.5): t = tt(1.4); f = 600 * np.exp(-t / .5) + 80; return (np.sin(2 * np.pi * np.cumsum(f) / SR) * .4 + bp(rng.standard_normal(len(t)), 2000, 7000) * .4 * np.exp(-t / .3)) * np.exp(-t / .6) * v
def plop(v=.5): t = tt(.25); return np.sin(2 * np.pi * np.cumsum(300 + 900 * t / .25) / SR) * np.exp(-t / .06) * v
def confetti(v=.3):
    x = np.zeros(int(1.2 * SR))
    for _ in range(40): o = int(rng.uniform(0, 1.1) * SR); x[o:o + 200] += bp(rng.standard_normal(200), 3000, 9000) * rng.uniform(.3, 1)
    return x * v
def flick(v=.25): t = tt(.06); return bp(rng.standard_normal(len(t)), 3000, 9000) * np.exp(-t / .01) * v

for e in E:
    if e['type'] == 'scene': put(fx, whoosh(.55, .7), e['t'] - .2, 1, 0)
put(fx, scratch(.5), T['lazy'] - .05, 1, 0)
for name, f in [('take', 760), ('compost', 640), ('body', 700), ('congrats', 980), ('outperf', 600), ('light', 820), ('fusion', 600), ('only', 700),
                ('average', 640), ('billion', 900), ('twist', 600), ('pacing', 820)]:
    put(fx, popf(.45, f), T[name] - .15, 1, rng.uniform(-.3, .3))
put(fx, popf(.5, 1300), T['core'] + .5, 1, .4); put(fx, buzz(1.2, .18), T['heap'] + .2, 1, .5); put(fx, confetti(.35), T['congrats'], 1, 0); put(fx, slurp(.45), T['cv'] - .1, 1, .5)
for k in range(8): put(fx, flick(.2), T['light'] + .1 + k * .17, 1, .4)
put(fx, boing(.6, 260), T['push'] - .15, 1, -.3); put(fx, boing(.5, 300), T['push'] - .1, 1, .3)
put(fx, thud(.6), T['only'] - .1, 1, 0); put(fx, shimmer(1.4, .6), T['tunnel'], 1, -.2); put(fx, ping(.6, 1568), T['anyway'] - .05, 1, 0)
for t in np.arange(T['billion'] - .3, T['turn'] + .6, .09): put(fx, tick(.18), t, 1, .4)
for k in range(12): put(fx, boing(.12, 400 + 30 * k), T['many'] + k * .08, 1, rng.uniform(-.6, .6))
put(fx, ping(.6, 2093), T['pulls'] + .05, 1, .3); put(fx, whoosh(T['second'] - T['hundred'] + .6, 1.0, 120, 1800), T['hundred'] - .2, 1, 0); put(fx, shimmer(1.6, .7), T['hundred'] + .4, 1, 0)
put(fx, roar(T['burned'] - T['easy'] + .4, .5), T['easy'] - .2, 1, 0); put(fx, fizzle(.6), T['burned'] + .05, 1, 0); put(fx, plop(.5), T['crawled'] + .8, 1, .5)
put(fx, shimmer(1.2, .7), T['star'] - .1, 1, -.3)

lines = json.load(open(os.path.join(HERE, 'lines.json')))
vm = np.zeros(NS, np.float32)
for L in lines:
    y, sr = sf.read(os.path.join(HERE, 'voices', L['id'] + '.wav')); y = soxr.resample(y.astype(np.float32), sr, SR)
    i = int(VO[L['id']] * SR); vm[i:i + len(y)] += y[:NS - i]
vm = hp(vm, 70); vm = compress(vm / (np.abs(vm).max() + 1e-9) * .8, thr=.2, ratio=3.0, att=.004, rel=.1).astype(np.float32)
vo[:, 0] = vm; vo[:, 1] = vm; vo = vo * .92 + S.room(vo, size=.15, mix=.08) * .08
mus, _ = sf.read(os.path.join(HERE, 'music/score.wav')); mus = mus[:NS]
if len(mus) < NS: mus = np.pad(mus, ((0, NS - len(mus)), (0, 0)))
env = np.convolve(np.abs(vm), np.ones(int(.05 * SR)) / int(.05 * SR), 'same'); on = (env > .02).astype(np.float32)
dk = np.zeros(NS, np.float32); g = 0.
for j in range(0, NS, 240): g += (on[j] - g) * (240 / int(.06 * SR) if on[j] > g else 240 / int(.4 * SR)); dk[j:j + 240] = g
mus = mus * (1 - (1 - db(-8)) * dk)[:, None]
def rms(x): m = np.abs(x).max(1) > 1e-4; return float(np.sqrt(np.mean(x[m] ** 2))) if m.any() else 1.
vr, mr, fr = rms(vo), rms(mus), rms(fx)
mix = vo + mus * (vr / mr) * db(-7) + fx * (vr / fr) * db(-11)
mix = np.stack([limit(mix[:, c], .95) for c in range(2)], 1)
sf.write(os.path.join(HERE, 'mix.wav'), mix[:int(DUR * SR)].astype(np.float32), SR)
print('rms vo/music/fx dB', round(20 * np.log10(vr), 1), round(20 * np.log10(mr), 1), round(20 * np.log10(fr), 1), 'peak', float(np.abs(mix).max()))
