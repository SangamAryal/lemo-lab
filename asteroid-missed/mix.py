"""Asteroid film. SFX + narration + score → mix.wav. About one effect a second: a soft whoosh when the talk passes to another planet, pops on the
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
W_ = json.load(open(os.path.join(HERE, 'words.json')))
def wd(n, w, k=0):
    id_ = 'l%02d' % n; c = 0
    for q in W_[id_]:
        if ''.join(ch for ch in q[0].lower() if ch.isalnum()).startswith(w) and c == k: return AT[id_] + max(0, q[1])
        if ''.join(ch for ch in q[0].lower() if ch.isalnum()).startswith(w): c += 1
    return AT[id_]
A = lambda n: AT['l%02d' % n]; E_ = lambda n: EN['l%02d' % n]
CUTS = [A(n) - .3 for n in (2, 3, 4, 5, 7, 9, 10, 11, 12, 13, 14, 15, 16, 17)]
for k, c in enumerate(CUTS): put(whoosh(.6, .75, 250, 5000 if k % 2 else 3200), c - .2, 1, (-1)**k * .25)
def birds(d, v=.1):
    out = np.zeros(int(d*SR))
    for k in range(int(d*1.5)):
        t = tt(.18); f = 2800 + 900*np.sin(2*np.pi*14*t); y = np.sin(2*np.pi*np.cumsum(f)/SR) * np.sin(np.pi*t/.18) * v; i = int(rng.uniform(0, d - .2) * SR); out[i:i+len(y)] += y[:len(out)-i]
    return out
def coo(v=.25): t = tt(.5); return np.sin(2*np.pi*(420 + 40*np.sin(2*np.pi*5*t))*t) * np.sin(np.pi*t/.5) * v
def stomp(v=1): t = tt(.7); return (np.sin(2*np.pi*sweep(70, 34, .7)) * np.exp(-t/.2) + lp(rng.standard_normal(len(t)), 300) * np.exp(-t/.05)) * v
def flap(v=.3): t = tt(.12); return bp(rng.standard_normal(len(t)), 300, 1400) * np.sin(np.pi*t/.12) * v
# hook: city birds, rewind
put(birds(3.2, .1), .1, 1, -.3); put(whoosh(.9, .9, 500, 7000), E_(1) - .5, 1, 0)
for k in range(8): put(tick(.14), E_(1) - .5 + k * .1, 1, .3)
# Q1: the strike
put(birds(5, .09), A(2), 1, .3); put(popf(.4, 800), A(2) + .1, 1, 0); put(whoosh(2.2, .9, 200, 3500), wd(2, 'asteroid'), 1, .4); put(boom(.8), wd(2, 'mexico') + .1, 1, 0); put(rumble(1.8, .4), wd(2, 'mexico') + .2, 1, 0)
put(popf(.45, 1100), wd(3, 'grain') - .2, 1, .3); put(shimmer(1, .5), wd(3, 'grain'), 1, .3); put(popf(.5, 500), wd(3, 'how'), 1, 0)
put(underwater(wd(4, 'packed') + .6 - A(4), .1), A(4), 1, 0); put(whoosh(2.4, .5, 150, 1400), A(4) + .1, 1, 0); put(popf(.4, 700), wd(4, 'packed'), 1, -.3); put(popf(.4, 500), wd(4, 'packed') + .3, 1, .3)
put(boom(1.0), wd(4, 'impact') - .1, 1, 0); put(rumble(E_(4) - wd(4, 'impact') + .6, .45), wd(4, 'impact'), 1, 0); put(whoosh(2, .8, 200, 2500), wd(4, 'impact'), 1, 0)
put(rumble(3, .25), A(5), 1, 0)
for i, d in enumerate((.6, .8, 1.0, 1.2, 1.4)): put(popf(.3, 500 + 80*i), wd(5, 'study') + d, 1, -.4 + .2*i)
put(popf(.45, 800), wd(5, '13'), 1, 0); put(stomp(.5), A(6) + 1.4, 1, 0); put(popf(.45, 650), A(6) + 1.6, 1, 0)
# Q2: the dark
put(wind(E_(8) - A(7) + .4, .14), A(7) - .3, 1, 0); put(popf(.4, 500), wd(7, 'no'), 1, 0); put(popf(.45, 800), wd(7, 'what'), 1, 0)
put(stomp(.7), A(8) + .9, 1, -.3); put(stomp(.5), A(8) + 1.5, 1, .3); put(popf(.4, 700), wd(8, 'large'), 1, 0)
for w, f in (('burrows', 600), ('seeds', 800), ('insects', 950), ('rotting', 700)): put(popf(.35, f), wd(9, w), 1, rng.uniform(-.3, .3))
for k in range(10): put(tick(.08), A(9) + .6 + k * .45, 1, rng.uniform(-.4, .4))
put(shimmer(1.4, .6), wd(10, 'ancestor') - .2, 1, 0); put(popf(.45, 880), wd(10, 'ancestor'), 1, 0)
# Q3: missed
put(whoosh(2.0, .9, 200, 3500), A(11) - .2, 1, -.4); put(popf(.5, 900), wd(11, 'missed'), 1, 0); put(ding(1568, .35), wd(11, 'missed') + .05, 1, 0)
put(stomp(1.0), wd(12, 'badger') - .15, 1, -.3); put(popf(.4, 700), wd(12, 'badger'), 1, 0)
for k in range(3): put(popf(.4, 500 + 120*k), wd(12, 'every') + .15 + k * .3, 1, -.3 + .3*k)
for k in range(3): put(popf(.35, 800 + 120*k), wd(13, 'jobs') + k * .2, 1, -.3 + .3*k)
put(birds(4, .08), A(13) + .5, 1, .3); put(whoosh(2.4, .5, 200, 2000), wd(13, 'within'), 1, 0); put(popf(.4, 700), wd(13, 'within'), 1, 0)
for w in ('apes', 'cities', 'you'): put(stamp(.7), wd(14, w), 1, 0)
put(stomp(.5), wd(14, 'you') + .9, 1, .3); put(stomp(.4), wd(14, 'you') + 1.5, 1, .1)
# Q4: did they?
put(wind(E_(15) - A(15), .1), A(15) - .2, 1, 0); put(popf(.45, 800), wd(15, 'did'), 1, 0)
for k in range(10): put(flap(.25), A(16) + .1 + k * .24, 1, .2)
put(shimmer(1.6, .6), A(16) + .5, 1, 0); put(popf(.4, 800), wd(16, 'made'), 1, 0)
put(birds(5, .08), A(17), 1, -.3); put(coo(.25), wd(17, 'pigeon') + .2, 1, .3); put(coo(.2), wd(17, 'pigeon') + .8, 1, .3)
put(boom(.6), wd(17, 'dinosaur'), 1, 0); put(popf(.45, 800), wd(17, 'dinosaur'), 1, 0); put(ding(2093, .4), E_(17) + .3, 1, 0); put(popf(.4, 880), E_(17) + .3, 1, 0)
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
mix = vo + mus * (vr / mr) * db(-7) + fx * (vr / fr) * db(-10)
mix = np.stack([limit(mix[:, c], .95) for c in range(2)], 1)
sf.write(os.path.join(HERE, 'mix.wav'), mix[:int(DUR * SR)].astype(np.float32), SR)
print('rms vo/music/fx dB', round(20*np.log10(vr), 1), round(20*np.log10(mr), 1), round(20*np.log10(fr), 1))
