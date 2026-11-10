"""Beyond the Edge film. SFX + narration + score → mix.wav. About one effect a second: a soft whoosh when the talk passes to another planet, pops on the
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
CUTS = [AT['01'] + 2.4, AT['04'] - .4, AT['05'] - .3, AT['06'] - .35, AT['07'] - .35, AT['08'] - .3, AT['10'] - .4, AT['12'] - .35, AT['13'] - .4, AT['14'] - .25]
for k, c in enumerate(CUTS): put(whoosh(.55, .7, 250, 5000 if k % 2 else 3200), c - .2, 1, (-1)**k * .25)
def beep(f=880, v=.18): t = tt(.1); return np.sin(2*np.pi*f*t) * np.exp(-t/.04) * v
# the dish picks up a signal
for k in range(6): put(beep(760 + 90*(k % 3), .16), .4 + k * .36, 1, .4)
put(popf(.4, 800), .5, 1, 0)
# the beam, stretching space
put(boom(.6), AT['01'] + 2.5, 1, 0); put(popf(.4, 700), AT['01'] + 3.3, 1, 0); put(whoosh(4.5, .55, 200, 2200), AT['02'] - .2, 1, 0); put(rumble(EN['03'] - AT['02'], .22), AT['02'], 1, 0)
put(popf(.45, 900), AT['02'] + 1.2, 1, 0); put(popf(.4, 700), AT['03'] + .6, 1, 0)
# the bubble
put(whoosh(.6, .9, 200, 4000), AT['04'] - .4, 1, 0); put(boom(.8), AT['04'] + .2, 1, 0); put(shimmer(1.8, .7), AT['04'] + .2, 1, 0); put(popf(.4, 800), AT['04'] + .5, 1, 0); put(popf(.45, 650), AT['04'] + 2.5, 1, 0); put(popf(.3, 1100), AT['04'] + 3.8, 1, 0)
for d, f in ((1.5, 900), (2.4, 1100), (2.6, 700)): put(popf(.4, f), AT['05'] + d, 1, .3)
put(shimmer(1, .4), AT['05'] + 1.5, 1, .4); put(shimmer(1, .4), AT['05'] + 2.4, 1, -.2)
# the wall
put(popf(.4, 500), AT['06'] + .1, 1, 0); put(stamp(.8), AT['06'] + 1.1, 1, 0)
for k in range(10): put(popf(.2, rng.uniform(180, 340)), AT['06'] + 1.2 + k * .07, 1, rng.uniform(-.6, .6))
put(popf(.4, 800), AT['06'] + 2.1, 1, 0)
# space keeps going
put(whoosh(5, .55, 200, 2500), AT['07'], 1, 0); put(popf(.4, 700), AT['07'] + .4, 1, 0); put(shimmer(2, .5), AT['07'] + 1.5, 1, 0); put(popf(.35, 900), AT['07'] + .3, 1, .3)
# never
put(boom(.6), AT['08'] + .1, 1, 0); put(whoosh(5, .5, 150, 1800), AT['09'] + .2, 1, 0); put(rumble(EN['09'] - AT['09'], .24), AT['09'], 1, 0); put(popf(.4, 700), AT['09'] + 1.4, 1, 0); put(popf(.4, 600), AT['09'] + 3.9, 1, 0); put(stamp(.9), AT['09'] + 5, 1, 0); put(boom(.5), AT['09'] + 5, 1, 0)
# forever, infinite
put(popf(.45, 500), AT['10'] - .2, 1, 0); put(popf(.4, 700), AT['10'] + 1.6, 1, 0); put(whoosh(.5, .8, 300, 4000), AT['11'] - .3, 1, 0); put(boom(.6), AT['11'] - .1, 1, 0); put(shimmer(1.5, .6), AT['11'], 1, 0)
# the ant
for k in range(int((EN['12'] - AT['12']) * 5)): put(tick(.08), AT['12'] + k * .2, 1, rng.uniform(-.3, .3))
put(popf(.4, 800), AT['12'] + 2.4, 1, 0); put(popf(.4, 650), AT['12'] + 3, 1, 0)
# hill, speck
put(shimmer(1.6, .5), AT['13'] + .6, 1, 0); put(popf(.4, 800), AT['13'] + .9, 1, 0)
put(whoosh(2.6, .8, 150, 2500), AT['14'] - .1, 1, 0); put(boom(.7), EN['14'] - .2, 1, 0); put(popf(.4, 700), EN['14'] - .4, 1, 0); put(ding(2093, .4), EN['14'] + .4, 1, 0); put(popf(.4, 880), EN['14'] + .4, 1, 0)
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
