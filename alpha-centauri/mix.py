"""Alpha Centauri film. SFX + narration + score → mix.wav. About one effect a second: a soft whoosh when the talk passes to another planet, pops on the
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
def waves(d, v=.12): t = tt(d); return lp(rng.standard_normal(len(t)), 900) * (.55 + .45*np.sin(2*np.pi*.35*t)) * np.minimum(1, t/.5) * np.minimum(1, (d-t)/.5) * v * 2
def underwater(d, v=.1): t = tt(d); return lp(rng.standard_normal(len(t)), 300) * np.minimum(1, t/.4) * np.minimum(1, (d-t)/.4) * v * 3
def bloop(v=.5, f0=500, f1=180): t = tt(.25); return np.sin(2*np.pi*sweep(f0, f1, .25)) * np.exp(-t/.07) * v
def wind(d, v=.15): t = tt(d); return bp(rng.standard_normal(len(t)), 150, 900) * (.6 + .4*np.sin(2*np.pi*.3*t)) * np.minimum(1, t/.4) * np.minimum(1, (d-t)/.4) * v * 2
def sip(v=.3): t = tt(.35); return bp(rng.standard_normal(len(t)), 900, 3000) * (np.sin(2*np.pi*14*t) > 0) * np.exp(-t/.15) * v
def tick(v=.15): n = int(.02 * SR); return bp(rng.standard_normal(n), 2500, 8000) * np.exp(-np.arange(n)/SR/.004) * v
def rumble(d, v=.4): t = tt(d); return lp(rng.standard_normal(len(t)), 120) * np.minimum(1, t/.5) * np.minimum(1, (d-t)/.5) * v * 3
def sizzle(d, v=.25): t = tt(d); return bp(rng.standard_normal(len(t)), 3000, 9000) * (.6 + .4*np.sin(2*np.pi*9*t)) * np.minimum(1, t/.2) * np.minimum(1, (d-t)/.3) * v
def crack(v=.5): t = tt(.4); return (bp(rng.standard_normal(len(t)), 300, 4000) * np.exp(-t/.05) + np.sin(2*np.pi*90*t) * np.exp(-t/.15) * .5) * v
def stamp(v=.8): t = tt(.35); return (lp(rng.standard_normal(len(t)), 600) * np.exp(-t/.04) * 1.4 + np.sin(2*np.pi*70*t) * np.exp(-t/.1)) * v
def birds(d, v=.12):
    out = np.zeros(int(d*SR))
    for k in range(int(d*1.5)):
        t = tt(.18); f = 2800 + 900*np.sin(2*np.pi*14*t); x = np.sin(2*np.pi*np.cumsum(f)/SR) * np.sin(np.pi*t/.18) * v; i = int(rng.uniform(0, d - .2) * SR); out[i:i+len(x)] += x[:len(out)-i]
    return out
def bubbles(d, v=.2):
    out = np.zeros(int(d*SR))
    for k in range(int(d*5)): x = popf(v*rng.uniform(.4, 1), rng.uniform(400, 1200)); i = int(rng.uniform(0, d - .2) * SR); out[i:i+len(x)] += x[:len(out)-i]
    return out
CUTS = [AT['02'] - .3, AT['03'] - .25, AT['04'] - .4, AT['07'] - .3, AT['09'] - .3, AT['11'] - .3, AT['12'] - .3, AT['16'] - .35, AT['18'] - .25, AT['18'] + (EN['18'] - AT['18']) / 2 - .1, AT['19'] - .25, AT['20'] - .35, AT['23'] - .3, AT['25'] - .3, AT['26'] - .35]
for k, c in enumerate(CUTS): put(whoosh(.55, .75, 250, 5000 if k % 2 else 3200), c - .2, 1, (-1)**k * .25)
# hook: the swap
put(whoosh(.6, .9, 200, 4000), .9, 1, 0); put(boom(.8), 1.4, 1, 0); put(shimmer(1.2, .6), 1.4, 1, 0); put(popf(.4, 800), 1.8, 1, 0)
# countdown ticks from line 02 to 08, a ding on zero
t0 = AT['02']
while t0 < AT['08'] - .1: put(tick(.12 if (t0 - AT['02']) % 1 > .5 else .18), t0, 1, .4); t0 += .5
put(birds(AT['04'] - AT['02'], .1), AT['02'], 1, -.3); put(birds(AT['09'] - AT['07'], .1), AT['07'], 1, -.3)
put(whoosh(2.0, .5, 400, 3000), AT['03'] + .3, 1, .4)
put(popf(.4, 900), AT['03'] + (EN['03'] - AT['03']) / 2, 1, 0)
# meet: star pops, spec rows
put(boom(.6), AT['04'] - .3, 1, 0); put(shimmer(1.4, .6), AT['04'] - .3, 1, 0); put(popf(.45, 800), AT['04'], 1, 0); put(popf(.4, 700), AT['05'] + .5, 1, 0)
for k, d in enumerate((.1, 1.2, 2.4)): put(popf(.4, 700 + 120*k), AT['06'] + d, 1, -.3 + .3*k)
# zero: the flash
put(whoosh(.6, 1, 200, 4000), AT['08'] - .55, 1, 0); put(boom(1.0), AT['08'], 1, 0); put(ding(1568, .4), AT['08'] + .05, 1, 0)
put(sizzle(EN['11'] - AT['09'] + .3, .18), AT['09'], 1, 0); put(popf(.45, 600), AT['09'] + 1.2, 1, 0)
for k in range(9): put(whoosh(.3, .35, 1500, 7000), AT['10'] + .2 + k * .4, 1, rng.uniform(-.6, .6))
put(popf(.4, 800), AT['10'] + .6, 1, 0)
for k in range(12): put(tick(.14), AT['11'] + k * .25, 1, .5)
put(popf(.45, 600), AT['11'] + 1.5, 1, 0)
# orbit
put(popf(.45, 400), AT['12'] + .4, 1, 0); put(bloop(.35, 420, 200), AT['12'] + .6, 1, 0)
put(whoosh(1.3, .6, 300, 3000), AT['13'] + .8, 1, 0)
for k in range(4): put(whoosh(.5, .45, 600, 6000), AT['13'] + 2 + k * 4 + 2, 1, .3)
put(popf(.45, 900), AT['14'] + 3.5, 1, 0); [put(whoosh(.25, .35, 2000, 8000), AT['14'] + 3.5 + k * .15, 1, rng.uniform(-.5, .5)) for k in range(3)]
put(popf(.45, 600), AT['15'] + 1.6, 1, 0)
# oceans, reef, storm, ice
put(waves(EN['17'] - AT['16'] + .5, .1), AT['16'] - .35, 1, 0); put(popf(.4, 700), AT['17'] + .3, 1, 0)
put(underwater(EN['18'] - AT['18'] + .2, .1), AT['18'] - .25, 1, 0); put(bubbles(2.5, .18), AT['18'], 1, 0); put(popf(.4, 800), AT['18'] + .4, 1, 0)
put(rumble(2.4, .35), AT['18'] + (EN['18'] - AT['18']) / 2, 1, 0); put(wind(2.4, .15), AT['18'] + (EN['18'] - AT['18']) / 2, 1, 0)
for k in range(3): put(crack(.45), AT['19'] + .3 + k * .45, 1, -.4 + .4*k)
put(waves(EN['19'] - AT['19'] + .3, .12), AT['19'] - .2, 1, 0); put(popf(.4, 700), AT['19'] + .4, 1, 0)
# Mars
put(wind(EN['22'] - AT['20'] + .3, .1), AT['20'] - .3, 1, 0); put(popf(.45, 600), AT['20'] + .1, 1, 0); put(popf(.4, 800), AT['21'] + .3, 1, 0); put(popf(.4, 900), AT['22'] + 1.2, 1, 0)
put(shimmer(1.6, .5), AT['22'] + 2, 1, 0); put(popf(.35, 700), AT['22'] + 3.5, 1, 0)
# packing, stamps
put(stamp(.8), AT['23'] + 1.4, 1, 0); put(stamp(.8), AT['24'] + 1.6, 1, 0)
# Venus loop
put(popf(.4, 700), AT['25'] + .3, 1, 0); put(whoosh(1.6, .6, 300, 3000), AT['25'] + 2.4, 1, 0); put(rumble(3, .3), AT['25'] + (EN['25'] - AT['25']) / 2, 1, 0); put(popf(.45, 500), AT['25'] + (EN['25'] - AT['25']) / 2 + .2, 1, 0)
# outro
put(birds(EN['27'] - AT['26'] + 1, .1), AT['26'] - .3, 1, -.3); put(popf(.4, 800), AT['26'] + 1.5, 1, 0); put(shimmer(1.8, .7), AT['27'] + .3, 1, 0); put(ding(2349, .45), AT['27'] + .35, 1, 0); put(popf(.45, 880), EN['27'] + .1, 1, 0)
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
