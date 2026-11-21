"""SFX + VO + score -> mix.wav for What If a Rogue Planet Passed Earth?"""
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

def bubbles(d, v=.3):
    x = np.zeros(int(d * SR))
    for k in range(int(d * 8)):
        o = int(rng.uniform(0, d - .1) * SR); tq = tt(.08); f = rng.uniform(150, 400); b = np.sin(2 * np.pi * np.cumsum(f * (1 + tq * 8)) / SR) * np.exp(-tq / .03) * .5; x[o:o + len(b)] += b[:len(x) - o]
    return x * v
def rain(d, v=.3): t = tt(d); return bp(rng.standard_normal(len(t)), 2500, 9000) * (.4 + .6 * (rng.random(len(t)) > .995)) * np.minimum(1, t / .3) * np.minimum(1, (d - t) / .3) * v
def crack(v=.6): t = tt(.6); return (bp(rng.standard_normal(len(t)), 1500, 6000) * np.exp(-t / .05) + lp(rng.standard_normal(len(t)), 200) * np.exp(-t / .3) * 2) * v
def slap(v=.6): t = tt(.2); return bp(rng.standard_normal(len(t)), 600, 4000) * np.exp(-t / .03) * v * 1.5
def rumble(d, v=.6): t = tt(d); return lp(rng.standard_normal(len(t)), 110) * np.minimum(1, t / .6) * np.minimum(1, (d - t) / .4) * v * 3
def screech(d=.9, v=.5):                                         # tyre / brake screech: a squealing, wobbling tone + hiss
    t = tt(d); f = 2400 + 300 * np.sin(2 * np.pi * 23 * t) - 600 * t / d; x = np.sin(2 * np.pi * np.cumsum(f) / SR) * .5 + bp(rng.standard_normal(len(t)), 2500, 7000) * .5
    return x * np.minimum(1, t / .03) * np.minimum(1, (d - t) / .15) * v * .5
def wave(d=1.6, v=.7): t = tt(d); return (lp(rng.standard_normal(len(t)), 900) * 2 + bp(rng.standard_normal(len(t)), 1500, 6000) * .4) * np.sin(np.pi * np.minimum(1, t / d * 1.4)) ** 2 * np.exp(-np.maximum(0, t - d * .7) / .3) * v
def zap(v=.5): t = tt(.35); return (np.sign(np.sin(2 * np.pi * np.cumsum(1800 - 1500 * t / .35) / SR)) * .3 + bp(rng.standard_normal(len(t)), 2000, 8000) * .5) * np.exp(-t / .1) * v
def hum(d, v=.3): t = tt(d); return (np.sin(2 * np.pi * 110 * t) + .5 * np.sin(2 * np.pi * 220 * t + 1) + .2 * np.sin(2 * np.pi * 330 * t)) * np.minimum(1, t / .2) * np.minimum(1, (d - t) / .2) * v * .3
def powerdown(v=.6): t = tt(1.0); f = 400 * np.exp(-t / .3) + 40; return np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-t / .5) * v
def siren(d, v=.3): t = tt(d); f = 700 + 250 * np.sin(2 * np.pi * .8 * t); return np.sin(2 * np.pi * np.cumsum(f) / SR) * np.minimum(1, t / .3) * np.minimum(1, (d - t) / .3) * v * .3
def beep(v=.3, f=1200, d=.12): t = tt(d); return np.sin(2 * np.pi * f * t) * np.minimum(1, (d - t) / .02) * v * .4
def crowd(d, v=.3): t = tt(d); return bp(rng.standard_normal(len(t)), 300, 2500) * (.6 + .4 * np.sin(2 * np.pi * 1.3 * t) * np.sin(2 * np.pi * .4 * t)) * np.minimum(1, t / .5) * np.minimum(1, (d - t) / .5) * v
def glitch(d=.6, v=.4): x = np.zeros(int(d * SR)); [x.__setitem__(slice(o, o + 600), bp(rng.standard_normal(600), 1000, 7000) * rng.uniform(.3, 1)) for o in rng.integers(0, len(x) - 600, 14)]; return x * v
for e in E:
    if e['type'] == 'scene': put(fx, whoosh(.5, .55, 250, 5000), e['t'] - .05, 1, 0)
put(fx, shimmer(2.0, .5), T['planet1'], 1, .3); put(fx, ping(.35, 1320), T['passed'], 1, 0)
put(fx, boing(.3, 200), T['comet'] + .25, 1, -.3); put(fx, boing(.3, 170), T['asteroid'] + .3, 1, .3); put(fx, thud(.7), T['whole'], 1, 0); put(fx, popf(.4, 600), T['nosun'], 1, .3)
[put(fx, ping(.15, 1600 + 200 * k), T['rogue'] + k * .12, 1, rng.uniform(-.5, .5)) for k in range(8)]
put(fx, beep(.4, 1400), T['spot'], 1, .2); put(fx, beep(.4, 1400), T['spot'] + .25, 1, .2); put(fx, whoosh(1.0, .5, 400, 4000), T['racing'], 1, .2)
[put(fx, tick(.25), T['check'] + k * .09, 1, .3) for k in range(12)]; put(fx, popf(.6, 900), T['hit'], 1, 0); put(fx, confetti(.2), T['hit'] + .05, 1, 0)
[put(fx, tick(.25), T['twenty6'] - .1 + k * .045, 1, 0) for k in range(26)]; put(fx, thud(.8), T['earths'], 1, .3); [put(fx, plop(.12), T['three6'] + k * .05, 1, .4) for k in range(20)]
put(fx, shimmer(1.4, .4), T['brightest'], 1, .3); put(fx, flick(.4), T['binoculars'], 1, 0)
put(fx, crowd(4.0, .25), T['nobody'] - .3, 1, 0); put(fx, roar(2.0, .3), T['bigger'], 1, 0)
put(fx, rumble(2.0, .4), T['gravity'], 1, 0); put(fx, wave(2.0, .7), T['surge'] - .2, 1, -.2); put(fx, siren(3.0, .35), T['seaside'], 1, .4)
put(fx, rumble(1.5, .7), T['faults'] - .1, 1, 0); put(fx, crack(.5), T['slip'], 1, 0)
put(fx, whoosh(1.4, .4, 200, 2000), T['gone'] - .5, 1, .4)
put(fx, rumble(2.0, .5), T['drags'], 1, 0); put(fx, popf(.5, 700), T['three12'], 1, 0)
put(fx, fizzle(.5), T['hotter'], 1, 0); put(fx, whoosh(1.6, .5, 1000, 7000), T['ice'] - .2, 1, 0); [put(fx, flick(.3), T['two14'] + k * .07, 1, .3) for k in range(6)]
put(fx, hum(2.5, .3), T['zoom'] - .2, 1, 0); put(fx, ping(.3, 1760), T['moons15'], 1, 0)
put(fx, bubbles(2.0, .25), T['ocean16'] - .3, 1, 0); put(fx, thud(.4), T['squeezed'], 1, -.3); put(fx, thud(.4), T['squeezed'] + .3, 1, .3)
put(fx, scratch(.4), T['night17'] - .3, 1, 0); [put(fx, ping(.12, 2000 + 150 * k), T['lights'] + k * .09, 1, rng.uniform(-.6, .6)) for k in range(12)]
put(fx, shimmer(2.0, .5), T['oursun'], 1, 0)
[put(fx, beep(.35, 880 if k % 2 else 1175, .18), T['message'] - .2 + k * .3, 1, rng.uniform(-.4, .4)) for k in range(8)]
put(fx, glitch(.7, .35), VO['s20'] - .4, 1, 0); put(fx, glitch(.5, .25), T['stay20'] + .5, 1, 0)
[put(fx, zap(.25), T['send'] + k * .25, 1, rng.uniform(-.5, .5)) for k in range(8)]; put(fx, crowd(3.0, .3), T['refugees'] - 1.0, 1, 0)
for k in ['c3', 'c2', 'c1']: put(fx, thud(.9), T[k] - .05, 1, 0)
put(fx, popf(.5, 700), T['would'] - .05, 1, -.3); put(fx, popf(.5, 600), T['would'] + .15, 1, .3)

lines = json.load(open(os.path.join(HERE, 'lines.json')))
vm = np.zeros(NS, np.float32)
for L in lines:
    y, sr = sf.read(os.path.join(HERE, 'voices', L['id'] + '.wav')); y = soxr.resample(y.astype(np.float32), sr, SR)
    if L['id'] == 's20':                                         # the alien: ring-modulated, doubled a little lower, with an echo
        tq = np.arange(len(y)) / SR; r = y * (.65 + .35 * np.sin(2 * np.pi * 55 * tq)); dl = int(.023 * SR)
        y = r + np.concatenate([np.zeros(dl, np.float32), r[:-dl]]) * .45; ec = int(.21 * SR); y = np.concatenate([y, np.zeros(ec, np.float32)]); y[ec:] += y[:-ec] * .3
    if L['id'] == 's22': y = y * .9
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
