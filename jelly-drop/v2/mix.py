"""ASMR sound for Jelly Drop v2, driven by each round's physics track (track.json, per frame): soft ceramic taps and a sliding
hiss on the ramps (louder with speed), a metal ting in the gold funnel, a slow wet squelch with sticky pops while a jelly squeezes
(louder with how fast it deforms), a 'shloop' when it clears the neck, a wet splat on the turntable and small jiggle squishes,
over a faint turntable hum and room tone. Close and dry, no reverb tails, no music in front."""
import os, sys, json, numpy as np, soundfile as sf
LIB = os.environ['LIB']; sys.path.insert(0, LIB)
from core.audio.sfx import SR, bp, lp, hp, add, limit
HERE = os.path.dirname(os.path.abspath(__file__))
DUR = json.load(open(os.path.join(HERE, 'events.json')))['dur']
R = json.load(open(os.path.join(HERE, 'rounds.json'))); FPS, INTRO = 30, .2
rng = np.random.default_rng(11); NS = int((DUR + 1) * SR); fx = np.zeros((NS, 2), np.float32)
tt = lambda d: np.arange(int(d * SR)) / SR
def put(x, t, g=1., pan=0.):
    if 0 <= t < DUR: add(fx, np.asarray(x, np.float32), t, g, pan)
def tap(k, f=2200): t = tt(.18); return (np.sin(2 * np.pi * f * t) * np.exp(-t / .018) * .5 + bp(rng.standard_normal(len(t)), 1500, 6000) * np.exp(-t / .004)) * k
def thup(k): t = tt(.25); return (np.sin(2 * np.pi * (140 + 120 * np.exp(-t / .02)) * t) * np.exp(-t / .05) + bp(rng.standard_normal(len(t)), 300, 2500) * np.exp(-t / .01) * .5) * k
def ting(k): t = tt(1.4); return sum(np.sin(2 * np.pi * f * t + rng.uniform(0, 6)) * np.exp(-t / d) * a for f, d, a in [(1240, .5, .6), (3310, .25, .3), (5870, .12, .15)]) * k * .5
def sticky(n, d, k):                                              # little sticky pops: very short, wet clicks
    x = np.zeros(int(d * SR))
    for _ in range(n):
        o = int(rng.uniform(0, max(.01, d - .03)) * SR); tq = tt(.02); f = rng.uniform(900, 2600); c = np.sin(2 * np.pi * f * tq * (1 - tq * 15)) * np.exp(-tq / .003)
        x[o:o + len(c)] += c[:len(x) - o] * rng.uniform(.3, 1)
    return x * k
def squelch(d, env, k):                                           # wet squelch: noise through a slowly wandering formant, gurgly
    t = tt(d); n = rng.standard_normal(len(t)); c = 600 + 500 * np.sin(2 * np.pi * .9 * t + rng.uniform(0, 6)) + 200 * np.sin(2 * np.pi * 3.1 * t)
    x = np.zeros(len(t)); blk = 1024
    for i in range(0, len(t), blk): ci = max(320., c[i]); x[i:i + blk] = bp(n[i:i + blk + 2048], ci * .6, ci * 1.7)[:len(x[i:i + blk])]
    g = (.55 + .45 * np.sin(2 * np.pi * 7 * t + np.sin(2 * np.pi * 1.3 * t) * 3)) * np.interp(np.arange(len(t)), np.linspace(0, len(t), len(env)), env)
    return lp(x * g, 3000) * k
def shloop(k): t = tt(.45); f = 900 * np.exp(-t / .12) + 120; return (np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-t / .15) * .5 + bp(rng.standard_normal(len(t)), 400, 2000) * np.exp(-t / .08) * .4) * k
def splat(k): t = tt(.5); return (lp(rng.standard_normal(len(t)), 1400) * np.exp(-t / .05) * 1.3 + np.sin(2 * np.pi * (85 + 50 * np.exp(-t / .04)) * t) * np.exp(-t / .12)) * k
def squish(k): t = tt(.16); return bp(rng.standard_normal(len(t)), 500, 1800) * np.sin(np.pi * t / .16) * .5 * k
def hiss(d, env, k, lo=2500, hi=9000):
    t = tt(d); x = bp(rng.standard_normal(len(t)), lo, hi); return x * np.interp(np.arange(len(t)), np.linspace(0, len(t), len(env)), env) * k

for ri, r in enumerate(R):
    d = json.load(open(os.path.join(HERE, f"frames-{r['level']}", 'track.json'))); tr = d['track']; pin = d.get('pin') or 10 ** 6
    t0 = INTRO + sum((q['last'] - q['first'] + 1) / FPS for q in R[:ri]); F = lambda f: t0 + (f - r['first']) / FPS
    z = np.array([p['z'] for p in tr]); x = np.array([p['x'] for p in tr]); sq = np.array([p['squash'] for p in tr])
    v = np.stack([np.gradient(x), np.gradient(z)], 1); sp = np.hypot(v[:, 0], v[:, 1]); az = np.gradient(v[:, 1])
    lo, hi = r['first'] - 1, r['last']
    # impacts (sharp upward change of vertical speed)
    for i in range(max(lo, 2), hi - 1):
        dv = v[i + 1, 1] - v[i - 1, 1]
        if dv > .02 and v[i - 1, 1] < -.01:
            k = min(1, dv * 9); onfun = abs(x[i]) < 1.1 and 2.6 < z[i] < 3.4
            if i + 1 < pin: put(ting(k * .8) if onfun and r['level'] == 0 else (tap(k * .7) if r['level'] == 0 else thup(k)), F(i + 1), 1, x[i] * .15)
            elif z[i] < 1.7: put(splat(min(1, k * 1.3)), F(i + 1), 1, 0); put(sticky(10, .5, .25), F(i + 1) + .05, 1, 0)
    # sliding on the ramps (supported, moving): a soft hiss (rigid) or a rubbery drag (gummy), with speed
    sup = (az > -.006) & (sp > .015) & (z > 3.4) & (np.arange(len(z)) + 1 < pin)
    env = np.where(sup, np.clip(sp * 12, 0, 1), 0)[lo:hi]; env = np.convolve(env, np.ones(5) / 5, 'same')
    if env.max() > 0: put(hiss((hi - lo) / FPS, env, .18, 2500, 9000) if r['level'] == 0 else hiss((hi - lo) / FPS, env, .28, 300, 1500), F(r['first']), 1, 0)
    # the squeeze: deformation rate drives a squelch and sticky pops; a shloop as it clears the neck
    if pin < hi:
        a = max(pin - 1, lo); dsq = np.abs(np.gradient(sq))[a:hi]; env = np.clip(np.convolve(dsq * 6, np.ones(7) / 7, 'same'), 0, 1)
        put(squelch((hi - a) / FPS, env, .55), F(a + 1), 1, -.05)
        for i in range(a, hi):
            if dsq[i - a] > .04 and rng.random() < .5: put(sticky(3, .12, min(1, dsq[i - a] * 4) * .3), F(i + 1), 1, rng.uniform(-.2, .2))
        cl = [i for i in range(a, hi) if z[i] < 2.2]
        if cl: put(shloop(.9), F(cl[0] + 1) - .05, 1, 0)
        landed = [i for i in range(a, hi) if z[i] < 1.7]
        if landed:                                                 # jiggle: a little squish on each squash peak
            for i in range(landed[0] + 6, hi - 1):
                if sq[i] > sq[i - 1] and sq[i] > sq[i + 1] and abs(sq[i] - sq[i - 3]) > .05: put(squish(.5), F(i + 1), 1, rng.uniform(-.2, .2))
    put(tap(.35, 3200), t0 - .02, 1, 0)                             # the round-change click

# room tone, the turntable hum, and a barely-there pad
t = tt(DUR + .5); room = lp(rng.standard_normal(len(t)), 500) * .012 + np.sin(2 * np.pi * 58 * t) * .004 * (1 + .3 * np.sin(2 * np.pi * .5 * t))
pad = sum(np.sin(2 * np.pi * f * t + rng.uniform(0, 6)) for f in (220, 277.2, 329.6, 440)) * .006 * (1 - np.exp(-t / 2))
for c in range(2): fx[:len(t), c] += (room + pad)[:NS]
mix = np.stack([limit(fx[:, c] * 1.4, .95) for c in range(2)], 1)
sf.write(os.path.join(HERE, 'mix.wav'), mix[:int(DUR * SR)].astype(np.float32), SR); print('mix', DUR, float(np.abs(mix).max()))
