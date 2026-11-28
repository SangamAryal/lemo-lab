"""SFX + VO + score → mix.wav for "Mars Has a Clingy Moon": the Moon-breakup SFX kit (cartoon pops, whooshes, boings, zaps,
clock ticks, sad fall, shimmer) on this film's cues, plus a squeeze, a crack-and-crumble, a camera beep and flag flaps."""
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
def popf(v=.5, f=700):
    t = tt(.12); return np.sin(2 * np.pi * np.cumsum(f * (1 + 1.5 * np.exp(-t / .02))) / SR) * np.exp(-t / .04) * v
def whoosh(d=.5, v=.6): t = tt(d); return bp(rng.standard_normal(len(t)), 300, 4000) * np.sin(np.pi * t / d) ** 2 * .4 * v
def zap(d=.5, v=.5): t = tt(d); f = 2400 * np.exp(-t / .2) + 400; return np.sign(np.sin(2 * np.pi * np.cumsum(f) / SR)) * np.exp(-t / .25) * .15 * v
def ping(v=.5): t = tt(1.0); return (np.sin(2 * np.pi * 1760 * t) + .3 * np.sin(2 * np.pi * 3520 * t)) * np.exp(-t / .3) * v * .4
def stretch(d=1.2, v=.4): t = tt(d); f = 300 + 500 * t / d; return np.sin(2 * np.pi * np.cumsum(f) / SR) * np.sin(np.pi * t / d) * (.6 + .4 * np.sin(2 * np.pi * 18 * t)) * v * .2
def boing(v=.5): t = tt(.6); f = 220 * (1 + .5 * np.sin(2 * np.pi * 9 * t) * np.exp(-t / .2)); return np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-t / .25) * v * .5
def whirr(d, v=.3): t = tt(d); return bp(rng.standard_normal(len(t)), 200, 1200) * (.6 + .4 * np.sin(2 * np.pi * 6 * t)) * np.minimum(1, t / .3) * np.minimum(1, (d - t) / .3) * v
def tick(v=.3): n = int(.02 * SR); return bp(rng.standard_normal(n), 2000, 8000) * np.exp(-np.arange(n) / SR / .004) * v
def flip(v=.3): t = tt(.08); return bp(rng.standard_normal(len(t)), 1500, 6000) * np.exp(-t / .02) * v
def stomp(v=.7): t = tt(.5); return (np.sin(2 * np.pi * (60 + 40 * np.exp(-t / .03)) * t) * np.exp(-t / .15) + lp(rng.standard_normal(len(t)), 300) * np.exp(-t / .08) * .5) * v
def bubbles(d, v=.3):
    x = np.zeros(int(d * SR))
    for k in range(int(d * 7)):
        o = int(rng.uniform(0, d - .1) * SR); tq = tt(.08); f = rng.uniform(150, 400); b = np.sin(2 * np.pi * np.cumsum(f * (1 + tq * 8)) / SR) * np.exp(-tq / .03) * .5; x[o:o + len(b)] += b[:len(x) - o]
    return x * v
def sadfall(v=.4): t = tt(1.4); f = 392 * 2 ** (-np.floor(t / .35) / 12 * 1.5); x = sum(np.sin(2 * np.pi * np.cumsum(f * k) / SR) / k for k in range(1, 5)); return lp(x, 1800) * np.minimum(1, (1.4 - t) / .2) * v * .25
def rumble(d, v=.8): t = tt(d); return lp(rng.standard_normal(len(t)), 90) * np.minimum(1, t / 1.0) * np.minimum(1, (d - t) / .5) * 4 * v
def shimmer(v=.4): t = tt(2.0); return sum(np.sin(2 * np.pi * f * t + rng.uniform(0, 6)) * np.exp(-t / .8) * (.5 + .5 * np.sin(2 * np.pi * 7 * t + k)) for k, f in enumerate([2093, 2637, 3136, 4186])) * v * .08


def crumble(d=1.2, v=.6):
    x = np.zeros(int(d * SR))
    for k in range(40):
        o = int(rng.uniform(0, d - .1) * SR); n = int(.05 * SR); b = bp(rng.standard_normal(n), 600, 5000) * np.exp(-np.arange(n) / SR / .01); x[o:o + n] += b[:len(x) - o] * rng.uniform(.3, 1)
    return x * v * .5
def crack(v=.7): t = tt(.25); return (bp(rng.standard_normal(len(t)), 1500, 7000) * np.exp(-t / .03) + np.sin(2 * np.pi * 90 * t) * np.exp(-t / .08)) * v
def squeeze(v=.5): t = tt(.7); f = 500 + 300 * np.sin(np.pi * t / .7); return np.sign(np.sin(2 * np.pi * np.cumsum(f) / SR)) * np.sin(np.pi * t / .7) * .08 * v
def beep(v=.4): t = tt(.12); return np.sin(2 * np.pi * 1320 * t) * np.minimum(1, (.12 - t) / .02) * v * .3
def flap(v=.3): t = tt(.18); return bp(rng.standard_normal(len(t)), 400, 2500) * np.sin(np.pi * t / .18) * (.6 + .4 * np.sin(2 * np.pi * 30 * t)) * v

for e in E:
    if e['type'] == 'scene': put(fx, whoosh(.55, .7), e['t'] - .2, 1, 0)
for name, f in [('slowly', 520), ('mars', 760), ('clingy', 900), ('km', 760), ('sixty', 820), ('three', 700), ('west', 640), ('east', 760), ('moving', 700), ('two', 760),
                ('backwards', 600), ('faster', 820), ('bulge', 600), ('strain', 520), ('grooves', 700), ('stretch', 820), ('rover', 700), ('forty', 900), ('million', 760),
                ('deimos', 700), ('pName', 640), ('dName', 760), ('fear', 600), ('dread', 560), ('redPlanet', 700), ('leaves', 760), ('never', 900)]:
    put(fx, popf(.45, f), T[name] - .2, 1, rng.uniform(-.3, .3))
put(fx, whoosh(.5, .9), T['mars'] - .45, 1, .4)                                   # the whip-pan to Mars
for k in range(3): put(fx, whoosh(.35, .5), T['laps'] - .3 + k * .62, 1, (-1) ** k * .5)   # three fast laps
put(fx, boing(.5), T['moving'] + .1, 1, .3); put(fx, stomp(.35), T['century'], 1, .2)
put(fx, whirr(T['drags'] - T['spins'] + 1.2, .22), T['spins'] - .3, 1, 0); put(fx, boing(.5), T['drags'], 1, .3)
put(fx, squeeze(.7), T['hug'] - .1, 1, .2); put(fx, crack(.5), T['survive'] - .05, 1, .2); put(fx, sadfall(.35), T['survive'] + .2, 1, 0)
put(fx, stretch(1.2, .35), T['pulling'] - .3, 1, 0)
for k in range(3): put(fx, beep(.4), T['crossing'] - .4 + k * .25, 1, .2)
for t in np.arange(T['crossing'], T['forty'] + .5, .25): put(fx, tick(.15), t, 1, -.3)
put(fx, crack(.8), T['tear'] - .1, 1, .2); put(fx, crumble(1.4, .6), T['tear'] + .1, 1, .2); put(fx, sadfall(.4), T['tear'] + .3, 1, 0)
put(fx, shimmer(.6), T['ring'] - .1, 1, 0); put(fx, shimmer(.7), T['ringOn'] - .2, 1, 0); put(fx, popf(.6, 1100), T['ringOn'], 1, 0)
put(fx, whoosh(.8, .5), T['drifting'], 1, .6)
for k in range(8): put(fx, flap(.35), T['flags'] - .25 + k * .07, 1, rng.uniform(-.5, .5))
put(fx, sadfall(.35), T['flags'] + .3, 1, 0)
put(fx, shimmer(.4), T['never'] + .3, 1, 0)

lines = json.load(open(os.path.join(HERE, 'lines.json')))
vm = np.zeros(NS, np.float32)
for L in lines:
    y, sr = sf.read(os.path.join(HERE, 'voices', L['id'] + '.wav')); y = soxr.resample(y.astype(np.float32), sr, SR)
    i = int(VO[L['id']] * SR); vm[i:i + len(y)] += y[:NS - i]
vm = hp(vm, 70); vm = compress(vm / (np.abs(vm).max() + 1e-9) * .8, thr=.2, ratio=3.0, att=.004, rel=.1).astype(np.float32)
vo[:, 0] = vm; vo[:, 1] = vm; vo = vo * .9 + S.room(vo, size=.15, mix=.08) * .1
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
