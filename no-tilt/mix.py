"""No-tilt film. SFX + narration + score → mix.wav. About one effect a second: a soft whoosh at each scene change, pops on labels and
stamps, a thud on each stamp, whoosh→boom on reveals ("food", "January", "straight", "never comes", "No signal", "crashed"), waves at
the beach, a clock tick for the same-every-day world, rain and thunder for the monsoon, wind and ice creaks at the poles, birdsong in
the park and in spring, a sparkle for the Moon. All synthesized; no samples, no meme SFX."""
import os, sys, json, numpy as np, soundfile as sf, soxr
LIB = os.environ['LIB']; sys.path.insert(0, LIB)
from core.audio.sfx import SR, bp, lp, hp, add, compress, limit
from core.audio import sampler as SM
HERE = os.path.dirname(os.path.abspath(__file__))
TL = json.load(open(os.path.join(HERE, 'timeline.json'))); DUR = TL['dur']; L = TL['lines']; AT = {l['id']: l['t'] for l in L}; EN = {l['id']: l['t'] + l['d'] for l in L}
rng = np.random.default_rng(12); NS = int((DUR + 1) * SR)
fx = np.zeros((NS, 2), np.float32); vo = np.zeros((NS, 2), np.float32)
tt = lambda d: np.arange(int(max(d, .01) * SR)) / SR; db = lambda x: 10 ** (x / 20)
def put(x, t, g=1., pan=0.):
    if 0 <= t < DUR: add(fx, np.asarray(x, np.float32), t, g, pan)
sweep = lambda f0, f1, d: np.cumsum(f0 * (f1 / f0) ** (tt(d) / d)) / SR
env = lambda t, a, r: np.minimum(1, t / a) * np.minimum(1, (t[-1] - t) / r + 1e-9)
def whoosh(d=.5, v=.6, lo=300, hi=5000): t = tt(d); return bp(rng.standard_normal(len(t)), lo, hi) * np.sin(np.pi * t / d) ** 2 * .45 * v
def boom(v=.9): t = tt(1.2); return (np.sin(2*np.pi*sweep(90, 38, 1.2)) * np.exp(-t/.35) + lp(rng.standard_normal(len(t)), 200) * np.exp(-t/.08) * .6) * v
def popf(v=.45, f=700): t = tt(.12); return np.sin(2*np.pi*np.cumsum(f * (1 + 1.5*np.exp(-t/.02))) / SR) * np.exp(-t/.04) * v
def ding(f=1760, v=.5): t = tt(1.2); return (np.sin(2*np.pi*f*t) + .4*np.sin(2*np.pi*f*2.76*t)*np.exp(-t/.2)) * np.exp(-t/.45) * v * .35
def shimmer(d=1.2, v=.4): t = tt(d); return sum(np.sin(2*np.pi*f*t + rng.uniform(0, 6)) * (.5 + .5*np.sin(2*np.pi*7*t + k)) for k, f in enumerate([1568, 2093, 2637, 3136])) * np.sin(np.pi*t/d) * v * .06
def waves(d, v=.12): t = tt(d); return lp(rng.standard_normal(len(t)), 900) * (.55 + .45*np.sin(2*np.pi*.35*t)) * env(t, .5, .5) * v * 2
def wind(d, v=.15): t = tt(d); return bp(rng.standard_normal(len(t)), 150, 900) * (.6 + .4*np.sin(2*np.pi*.3*t)) * env(t, .4, .4) * v * 2
def rainn(d, v=.15): t = tt(d); return bp(rng.standard_normal(len(t)), 2000, 9000) * env(t, .6, .6) * v
def tick(v=.15): n = int(.02 * SR); return bp(rng.standard_normal(n), 2500, 8000) * np.exp(-np.arange(n)/SR/.004) * v
def rumble(d, v=.4): t = tt(d); return lp(rng.standard_normal(len(t)), 120) * env(t, .5, .5) * v * 3
def thunder(v=.5): t = tt(2.4); return (lp(rng.standard_normal(len(t)), 260) * np.exp(-t/.7) * (1 + .6*np.sin(2*np.pi*3*t)) + bp(rng.standard_normal(len(t)), 600, 3000) * np.exp(-t/.06) * .5) * v * 1.6
def crack(v=.5): t = tt(.4); return (bp(rng.standard_normal(len(t)), 300, 4000) * np.exp(-t/.05) + np.sin(2*np.pi*90*t) * np.exp(-t/.15) * .5) * v
def creak(v=.3): t = tt(.7); return bp(np.sign(np.sin(2*np.pi*np.cumsum(60 + 30*np.sin(2*np.pi*1.3*t))/SR)) * rng.uniform(.6, 1, len(t)), 200, 1600) * np.sin(np.pi*t/.7) * v * .5
def stamp(v=.8): t = tt(.35); return (lp(rng.standard_normal(len(t)), 600) * np.exp(-t/.04) * 1.4 + np.sin(2*np.pi*70*t) * np.exp(-t/.1)) * v
def flip(v=.3): t = tt(.1); return bp(rng.standard_normal(len(t)), 1200, 5000) * np.sin(np.pi*t/.1) * v
def birds(d, v=.1):
    out = np.zeros(int(d*SR))
    for k in range(int(d*1.5)):
        t = tt(.18); f = 2800 + 900*np.sin(2*np.pi*14*t); y = np.sin(2*np.pi*np.cumsum(f)/SR) * np.sin(np.pi*t/.18) * v; i = int(rng.uniform(0, d - .2) * SR); out[i:i+len(y)] += y[:len(out)-i]
    return out
W_ = json.load(open(os.path.join(HERE, 'words.json')))
def wd(n, w, k=0):
    id_ = 'l%02d' % n; c = 0
    for q in W_[id_]:
        if ''.join(ch for ch in q[0].lower() if ch.isalnum()).startswith(w):
            if c == k: return AT[id_] + max(0, q[1])
            c += 1
    return AT[id_]
A = lambda n: AT['l%02d' % n]; E_ = lambda n: EN['l%02d' % n]
# a soft whoosh at every scene change
CUTS = [A(n) - .3 for n in (2, 3, 4, 5, 6, 8, 9, 10, 11, 12, 13, 14, 15, 16)] + [wd(7, 'but') - .25]
for k, c in enumerate(sorted(CUTS)): put(whoosh(.6, .7, 250, 5000 if k % 2 else 3200), c - .2, 1, (-1)**k * .25)
# hook: the lean label, Earth stands up, the plate empties
put(popf(.4, 800), wd(1, 'leaning'), 1, 0); put(whoosh(.9, .7, 300, 4000), wd(1, 'stood') - .1, 1, 0); put(popf(.4, 1000), wd(1, 'stood') + .25, 1, 0)
put(popf(.45, 600), wd(1, "you'd") - .1, 1, .2); put(boom(.7), wd(1, 'food'), 1, 0); put(popf(.5, 400), wd(1, 'food') + .35, 1, 0)
# Q1: the beach, the orbit, the lean
put(waves(E_(2) - A(2) + .4, .12), A(2) - .3, 1, 0); put(birds(3, .06), A(2), 1, .4); put(popf(.4, 800), wd(2, 'why'), 1, 0); put(popf(.4, 700), wd(2, 'most') + .1, 1, 0)
put(popf(.4, 600), A(3), 1, 0); put(popf(.4, 500), wd(3, 'closest') - .2, 1, -.2); put(boom(.75), wd(3, 'january'), 1, 0); put(popf(.5, 900), wd(3, 'january'), 1, 0)
put(popf(.35, 650), wd(3, 'northern'), 1, .3); put(stamp(.6), wd(3, 'winter') + .3, 1, 0)
put(popf(.4, 700), wd(4, 'lean'), 1, 0); put(popf(.45, 900), wd(4, '23'), 1, 0); put(whoosh(.9, .6, 300, 3000), wd(4, 'so') - .1, 1, .3)
put(popf(.4, 700), wd(4, 'your'), 1, 0); put(shimmer(1, .5), wd(4, 'leans'), 1, .3); put(stamp(.6), wd(4, 'sunlight'), 1, .3)
put(popf(.4, 600), wd(4, 'other') - .1, 1, -.4); put(stamp(.6), wd(4, 'away'), 1, -.3)
# stand it up straight
put(whoosh(1.3, .9, 200, 4000), wd(5, 'stand'), 1, 0); put(boom(.9), wd(5, 'straight'), 1, 0); put(popf(.45, 1000), wd(5, 'straight') + .1, 1, 0)
# the same every day: birds and a clock tick, a flip for each month
put(birds(wd(7, 'but') - A(6), .07), A(6), 1, -.3)
for k, t0 in enumerate(np.arange(A(6), wd(7, 'but') - .2, .42)): put(flip(.22), t0, 1, .1); put(tick(.12), t0 + .21, 1, -.2)
put(popf(.4, 700), wd(6, '12'), 1, 0); put(stamp(.75), wd(6, 'no', 1) + .1, 1, -.1); put(stamp(.75), wd(6, 'no', 2) + .1, 1, .1)
# the problem: rain follows the seasons
put(boom(.5), wd(7, 'problem'), 1, 0); put(popf(.45, 500), wd(7, 'problem'), 1, 0); put(popf(.4, 800), wd(7, 'rain'), 1, 0); put(rainn(E_(7) - wd(7, 'seasons'), .06), wd(7, 'seasons'), 1, 0)
# the monsoon: heat, wind, rain, thunder → it never comes
MO, NV = wd(8, 'monsoon'), wd(8, 'never')
put(popf(.4, 700), wd(8, 'wet'), 1, 0); put(wind(MO - wd(8, 'pulls') + .4, .12), wd(8, 'pulls'), 1, -.3); put(whoosh(1.6, .5, 200, 1600), wd(8, 'pulls'), 1, .3)
put(rainn(wd(8, 'with') - MO + .5, .2), MO - .3, 1, 0); put(thunder(.55), MO + .2, 1, -.2); put(popf(.45, 800), MO, 1, 0); put(popf(.4, 900), wd(8, 'billion'), 1, 0)
put(thunder(.4), wd(8, 'billion') + .6, 1, .3); put(boom(.9), NV + .1, 1, 0); put(stamp(.8), NV + .15, 1, 0); put(wind(E_(8) - NV + .8, .1), NV + .3, 1, 0)
# the poles: wind, ice creaks
put(wind(E_(9) - A(9) + .6, .16), A(9) - .3, 1, 0); put(popf(.4, 700), wd(9, 'never'), 1, 0); put(popf(.4, 900), wd(9, 'ice'), 1, 0)
for k, d in enumerate((0, .7, 1.3)): put(creak(.35), wd(9, 'ice') + d, 1, (-1)**k * .3)
put(crack(.4), wd(9, 'grows'), 1, 0)
# the calendar: park, then it shakes
put(birds(E_(10) - A(10) + .4, .07), A(10), 1, .3); put(popf(.45, 700), wd(10, 'their') - .1, 1, 0)
for k in range(5): put(flip(.2), wd(10, 'their') + .1 + k * .16, 1, 0)
put(crack(.35), wd(10, 'calendar'), 1, 0); put(popf(.4, 500), wd(10, 'calendar') + .2, 1, 0)
# waiting for a signal
put(birds(E_(11) - A(11) + .4, .08), A(11), 1, .3); put(popf(.4, 700), wd(11, 'wait'), 1, 0); put(popf(.4, 800), wd(11, 'wait', 1), 1, 0); put(popf(.4, 1000), wd(11, 'longer'), 1, .3)
for k in range(8): put(tick(.1), wd(11, 'birds') + k * .5, 1, rng.uniform(-.4, .4))
put(boom(.75), wd(11, 'never') + .1, 1, 0); put(stamp(.8), wd(11, 'never') + .1, 1, 0)
# narrow strips
put(popf(.45, 800), wd(12, 'narrow'), 1, 0); put(whoosh(.7, .5, 600, 6000), wd(12, 'narrow') - .2, 1, -.4); put(whoosh(.7, .5, 600, 6000), wd(12, 'narrow') - .2, 1, .4); put(popf(.4, 600), wd(12, 'just'), 1, 0)
# where did the lean come from?
put(popf(.5, 700), wd(13, 'from'), 1, .3); put(popf(.45, 500), wd(13, 'accident'), 1, 0); put(rumble(1.5, .2), wd(13, 'accident'), 1, 0)
# the crash
CR = wd(14, 'crashed')
put(popf(.4, 800), A(14) + .1, 1, 0); put(whoosh(CR - wd(14, 'world') + .3, .9, 150, 3000), wd(14, 'world') - .2, 1, .4); put(rumble(CR - wd(14, 'world'), .3), wd(14, 'world'), 1, .2)
put(boom(1.0), CR, 1, 0); put(crack(.7), CR, 1, 0); put(rumble(2.4, .5), CR + .1, 1, 0); put(whoosh(.8, .7, 200, 3000), wd(14, 'knocked'), 1, -.3); put(popf(.45, 600), wd(14, 'knocked') + .1, 1, 0)
# the Moon
put(shimmer(1.6, .7), wd(15, 'moon') - .2, 1, -.3); put(popf(.45, 900), wd(15, 'moon'), 1, -.2); put(popf(.4, 700), wd(15, 'gravity'), 1, 0); put(ding(1568, .35), wd(15, 'steady'), 1, 0)
# spring
put(birds(DUR - A(16), .1), A(16) - .2, 1, -.3); put(birds(DUR - A(16), .08), A(16) + .4, 1, .4); put(popf(.4, 900), wd(16, 'spring'), 1, 0); put(shimmer(1.4, .5), wd(16, 'spring'), 1, .2)
put(popf(.45, 800), wd(16, 'remember'), 1, -.4); put(boom(.6), wd(16, 'crash'), 1, 0); put(popf(.45, 700), wd(16, 'crash') + .05, 1, 0); put(ding(2093, .4), E_(16) + .5, 1, 0); put(popf(.45, 880), E_(16) + .5, 1, 0)
# voices
vm = np.zeros(NS, np.float32)
for l in L:
    y, sr = sf.read(os.path.join(HERE, 'voices', l['id'] + '.wav')); y = soxr.resample(y.astype(np.float32), sr, SR); i = int(l['t'] * SR); vm[i:i + len(y)] += y[:NS - i]
vm = hp(vm, 70); vm = compress(vm / (np.abs(vm).max() + 1e-9) * .8, thr=.2, ratio=3.0, att=.004, rel=.1).astype(np.float32)
vo[:, 0] = vm; vo[:, 1] = vm; vo = vo * .94 + SM.room(vo, size=.12, mix=.06) * .06
mus, _ = sf.read(os.path.join(HERE, 'music/score.wav')); mus = mus[:NS]
if len(mus) < NS: mus = np.pad(mus, ((0, NS - len(mus)), (0, 0)))
ev = np.convolve(np.abs(vm), np.ones(int(.05*SR)) / int(.05*SR), 'same'); on = (ev > .02).astype(np.float32)
dk = np.zeros(NS, np.float32); gk = 0.
for j in range(0, NS, 240): gk += (on[j] - gk) * (240 / int(.08*SR) if on[j] > gk else 240 / int(.5*SR)); dk[j:j+240] = gk
mus = mus * (1 - (1 - db(-4)) * dk)[:, None]
def rms(x): m = np.abs(x).max(1) > 1e-4; return float(np.sqrt(np.mean(x[m] ** 2))) if m.any() else 1.
vr, mr, fr = rms(vo), rms(mus), rms(fx)
mix = vo + mus * (vr / mr) * db(-7) + fx * (vr / fr) * db(-10)
mix = np.stack([limit(mix[:, c], .95) for c in range(2)], 1)
sf.write(os.path.join(HERE, 'mix.wav'), mix[:int(DUR * SR)].astype(np.float32), SR)
print('rms vo/music/fx dB', round(20*np.log10(vr), 1), round(20*np.log10(mr), 1), round(20*np.log10(fr), 1))
