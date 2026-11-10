"""Talking Planets #2 v2 (star swap). SFX + voices + score → mix.wav. About one effect a second: a soft whoosh when the talk passes to another planet, pops on the
stat cards and HUD dots, whoosh→boom on Venus's reveal and on "WHAT?!", a speed-whoosh for Jupiter's spin, boings for Mercury's
entrance, a little siren on "That's illegal", sparkles for Venus, wind on Venus's surface, a ding on "main character".
All synthesized; no samples, no meme SFX."""
import os, sys, json, numpy as np, soundfile as sf, soxr
LIB = os.environ['LIB']; sys.path.insert(0, LIB)
from core.audio.sfx import SR, bp, lp, hp, add, compress, limit
from core.audio import sampler as SM
HERE = os.path.dirname(os.path.abspath(__file__))
TL = json.load(open(os.path.join(HERE, 'timeline.json'))); DUR = TL['dur']; L = TL['lines']; AT = {l['id']: l['t'] for l in L}; EN = {l['id']: l['t'] + l['d'] for l in L}
rng = np.random.default_rng(12); NS = int((DUR + 1) * SR)
fx = np.zeros((NS, 2), np.float32); vo = np.zeros((NS, 2), np.float32)
tt = lambda d: np.arange(int(d * SR)) / SR; db = lambda x: 10 ** (x / 20)
def put(x, t, g=1., pan=0.):
    if 0 <= t < DUR: add(fx, np.asarray(x, np.float32), t, g, pan)
sweep = lambda f0, f1, d: np.cumsum(f0 * (f1 / f0) ** (tt(d) / d)) / SR
def whoosh(d=.5, v=.6, lo=300, hi=5000): t = tt(d); return bp(rng.standard_normal(len(t)), lo, hi) * np.sin(np.pi * t / d) ** 2 * .45 * v
def boom(v=.9): t = tt(1.2); return (np.sin(2*np.pi*sweep(90, 38, 1.2)) * np.exp(-t/.35) + lp(rng.standard_normal(len(t)), 200) * np.exp(-t/.08) * .6) * v
def popf(v=.45, f=700): t = tt(.12); return np.sin(2*np.pi*np.cumsum(f * (1 + 1.5*np.exp(-t/.02))) / SR) * np.exp(-t/.04) * v
def boing(v=.4, f=220): t = tt(.35); return np.sin(2*np.pi*np.cumsum(f * (1 + .6*np.sin(2*np.pi*18*t) * np.exp(-t/.12))) / SR) * np.exp(-t/.12) * v
def ding(f=1760, v=.5): t = tt(1.2); return (np.sin(2*np.pi*f*t) + .4*np.sin(2*np.pi*f*2.76*t)*np.exp(-t/.2)) * np.exp(-t/.45) * v * .35
def shimmer(d=1.2, v=.4): t = tt(d); return sum(np.sin(2*np.pi*f*t + rng.uniform(0, 6)) * (.5 + .5*np.sin(2*np.pi*7*t + k)) for k, f in enumerate([1568, 2093, 2637, 3136])) * np.sin(np.pi*t/d) * v * .06
def siren(d=1.0, v=.25): t = tt(d); f = 900 + 300 * np.sign(np.sin(2*np.pi*4*t)); return np.sin(2*np.pi*np.cumsum(f)/SR) * np.minimum(1, t/.02) * np.minimum(1, (d-t)/.1) * v * .5
def wind(d, v=.15): t = tt(d); return bp(rng.standard_normal(len(t)), 150, 900) * (.6 + .4*np.sin(2*np.pi*.3*t)) * np.minimum(1, t/.4) * np.minimum(1, (d-t)/.4) * v * 2
def sip(v=.3): t = tt(.35); return bp(rng.standard_normal(len(t)), 900, 3000) * (np.sin(2*np.pi*14*t) > 0) * np.exp(-t/.15) * v
def tick(v=.15): n = int(.02 * SR); return bp(rng.standard_normal(n), 2500, 8000) * np.exp(-np.arange(n)/SR/.004) * v
def freeze(v=.35): t = tt(1.4); return bp(rng.standard_normal(len(t)), 3000, 9000) * (np.sin(2*np.pi*23*t) > .3) * np.exp(-t/.6) * v
def rumble(d, v=.4): t = tt(d); return lp(rng.standard_normal(len(t)), 120) * np.minimum(1, t/.5) * np.minimum(1, (d-t)/.5) * v * 3
def creak(v=.3): t = tt(.6); return bp(np.sign(np.sin(2*np.pi*np.cumsum(90 + 40*np.sin(2*np.pi*3*t))/SR)), 300, 1500) * np.exp(-t/.25) * v * .4
def thermo_tick(v=.15): return tick(v)
# scene cuts: a whoosh on every one (the cut times mirror main.js SC)
CUTS = [AT['03'] - .45, AT['07'] - .25, AT['10'] - .3, AT['12'] - .25, AT['13'] - .5, AT['16'] - .25, AT['19'] - .3, AT['20'] - .3, AT['22'] - .5, AT['25'] - .2, AT['30'] - .3, AT['32'] - .6]
for k, c in enumerate(CUTS): put(whoosh(.55, .75, 250, 5000 if k % 2 else 3200), c - .2, 1, (-1)**k * .25)
# intro: snore z's, the sign, the Sun leaves
for k in range(3): put(popf(.15, 500 + 60*k), AT['01'] + .3 + k * .6, 1, .3)
put(popf(.4, 420), EN['01'] + .05, 1, -.4); put(whoosh(.7, .9, 200, 4000), EN['02'] - .1, 1, -.6)
# section starts: boom
for t0, v in ((AT['03'] - .45, .6), (AT['13'] - .5, .8), (AT['22'] - .5, 1.0)): put(boom(v), t0 + .05, 1, 0); put(tick(.3), t0 + .25, 1, .4)
# Proxima
for k in range(3): put(boing(.33 - k*.07, 300 + k*50), AT['03'] - .4 + k * .17, 1, 0)
put(popf(.4, 700), AT['06'] + .5, 1, 0); put(creak(.4), AT['06'] + .8, 1, 0); put(popf(.3, 300), AT['06'] + 1.5, 1, -.3)
put(popf(.5, 260), AT['07'], 1, 0); put(whoosh(2.6, .6, 200, 2500), AT['07'] + .1, 1, .3); put(whoosh(1.0, .7, 300, 4000), AT['08'], 1, .5)
put(popf(.45, 500), AT['09'] + .9, 1, 0)
put(popf(.3, 700), AT['10'] + .1, 1, -.4); put(wind(EN['11'] - AT['10'] + .5, .12), AT['10'] - .3, 1, 0)
put(popf(.45, 600), AT['10'] + 1.6, 1, 0); put(freeze(.45), AT['11'], 1, 0); put(popf(.45, 500), AT['11'] + 1.4, 1, 0)
put(boom(.5), AT['12'] + .9, 1, 0); put(popf(.5, 240), AT['12'] + .9, 1, 0)
# Sirius A
put(shimmer(1.6, .8), AT['13'] - .5, 1, .3); put(popf(.5, 980), AT['13'] - .45, 1, 0); put(popf(.4, 800), AT['13'] + 1.2, 1, 0)
put(ding(1318, .3), AT['14'] + .3, 1, .3); put(whoosh(1.4, .8, 300, 3000), AT['15'], 1, 0)
put(whoosh(1.3, .6, 300, 3000), AT['16'] + .3, 1, 0)
for k in range(9): put(whoosh(.45, .5, 600, 6000), AT['16'] + 1.6 + k * 3 + 1.5, 1, .3)
put(popf(.45, 900), AT['16'] + 3.2, 1, 0); put(popf(.4, 700), AT['17'] + 1.0, 1, 0); put(popf(.45, 600), AT['18'] + 1.4, 1, 0); put(shimmer(1.0, .5), AT['18'] + 1.4, 1, 0)
for k in range(30): put(popf(.12, rng.uniform(500, 1500)), AT['19'] + rng.uniform(-.2, EN['19'] - AT['19'] + .3), 1, rng.uniform(-.6, .6))
put(popf(.45, 600), AT['19'] + .3, 1, 0)
for k in range(4): put(popf(.2, 400 + 80*k), AT['20'] + .8 + k * .2, 1, .4)
put(popf(.4, 900), AT['20'] + 1.2, 1, .4); put(popf(.45, 700), AT['21'] - .15, 1, .3)
# Betelgeuse
put(rumble(EN['24'] - AT['22'] + .6, .4), AT['22'] - .5, 1, 0); put(whoosh(2.0, .8, 150, 2500), AT['24'], 1, 0); put(popf(.4, 800), AT['24'] + 1.6, 1, 0)
put(boom(.8), AT['25'] - .15, 1, 0); put(rumble(EN['29'] - AT['25'] + .5, .3), AT['25'] - .2, 1, 0); put(popf(.4, 700), AT['25'] + .1, 1, 0)
put(popf(.35, 1300), AT['26'], 1, -.5); put(popf(.35, 900), AT['27'], 1, .5); put(popf(.4, 800), AT['28'] + .3, 1, 0); put(popf(.4, 800), AT['29'] + .6, 1, 0); put(popf(.3, 600), AT['29'] + .1, 1, .4)
put(popf(.45, 500), AT['31'] + .4, 1, 0)
# ending
put(whoosh(.7, .9, 200, 4000), AT['32'] - .7, 1, -.5); put(ding(1760, .4), AT['32'] + .2, 1, 0)
for k, d in enumerate((.2, 1.6, 3.0)): put(popf(.45, 600 + 150 * k), AT['33'] + d, 1, -.4 + .4 * k)
put(popf(.35, 1100), AT['34'] + .1, 1, 0); put(shimmer(1.8, .7), AT['35'] + 1.2, 1, 0); put(ding(2349, .5), AT['35'] + 1.3, 1, 0)
put(popf(.4, 700), AT['36'] + .1, 1, 0); put(popf(.45, 880), AT['36'] + .5, 1, 0)
# voices
vm = np.zeros(NS, np.float32)
for l in L:
    y, sr = sf.read(os.path.join(HERE, 'voices', l['id'] + '.wav')); y = soxr.resample(y.astype(np.float32), sr, SR); i = int(l['t'] * SR); vm[i:i + len(y)] += y[:NS - i]
vm = hp(vm, 70); vm = compress(vm / (np.abs(vm).max() + 1e-9) * .8, thr=.2, ratio=3.0, att=.004, rel=.1).astype(np.float32)
vo[:, 0] = vm; vo[:, 1] = vm; vo = vo * .94 + SM.room(vo, size=.12, mix=.06) * .06
mus, _ = sf.read(os.path.join(HERE, 'music/score.wav')); mus = mus[:NS]
if len(mus) < NS: mus = np.pad(mus, ((0, NS - len(mus)), (0, 0)))
env = np.convolve(np.abs(vm), np.ones(int(.05*SR)) / int(.05*SR), 'same'); on = (env > .02).astype(np.float32)
dk = np.zeros(NS, np.float32); gk = 0.
for j in range(0, NS, 240): gk += (on[j] - gk) * (240 / int(.08*SR) if on[j] > gk else 240 / int(.5*SR)); dk[j:j+240] = gk
mus = mus * (1 - (1 - db(-4)) * dk)[:, None]
def rms(x): m = np.abs(x).max(1) > 1e-4; return float(np.sqrt(np.mean(x[m] ** 2))) if m.any() else 1.
vr, mr, fr = rms(vo), rms(mus), rms(fx)
mix = vo + mus * (vr / mr) * db(-10) + fx * (vr / fr) * db(-10)
mix = np.stack([limit(mix[:, c], .95) for c in range(2)], 1)
sf.write(os.path.join(HERE, 'mix.wav'), mix[:int(DUR * SR)].astype(np.float32), SR)
print('rms vo/music/fx dB', round(20*np.log10(vr), 1), round(20*np.log10(mr), 1), round(20*np.log10(fr), 1))
