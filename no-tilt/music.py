"""Score (original, synthesized), following the story in D minor until the very end: a low drone and lonely piano for the hook with a
hit on "food", a light ticking puzzle for Q1 with a hit on "January", a warm swell for the lean, a riser → braam as Earth is stood up,
a flat looping figure for the same-every-day world, a driving build into the monsoon and a hit + drop on "never comes", a cold high
pad for the poles, a fragile piano for the lost calendar, a ticking wait and a hit on "No signal", held mystery for "where did the lean
come from?", a riser and the heaviest braam on "crashed", a warm lift for the Moon, and D major for spring."""
import os, sys, json, numpy as np, soundfile as sf
LIB = os.environ['LIB']; sys.path.insert(0, LIB)
from core.audio.sfx import SR, bp, lp, hp, add, limit
HERE = os.path.dirname(os.path.abspath(__file__))
TL = json.load(open(os.path.join(HERE, 'timeline.json'))); DUR = TL['dur']; W_ = json.load(open(os.path.join(HERE, 'words.json')))
AT = {l['id']: l['t'] for l in TL['lines']}; EN = {l['id']: l['t'] + l['d'] for l in TL['lines']}
A = lambda n: AT['l%02d' % n]; E_ = lambda n: EN['l%02d' % n]
key = lambda s: ''.join(c for c in s.lower() if c.isalnum())
def wd(n, w, k=0):
    hits = [q for q in W_['l%02d' % n] if key(q[0]).startswith(w)]; return A(n) + max(0, hits[k][1]) if len(hits) > k else A(n)
rng = np.random.default_rng(23); NS = int((DUR + 4) * SR); out = np.zeros((NS, 2), np.float32)
tt = lambda d: np.arange(int(max(d, .01) * SR)) / SR; hz = lambda m: 440 * 2 ** ((m - 69) / 12)
def put(x, t, g=1., pan=0.):
    if 0 <= t < DUR + 3: add(out, np.asarray(x, np.float32), t, g, pan)
def fade(x, a, b): n = len(x); e = np.ones(n); ia, ib = min(n, int(a * SR)), min(n, int(b * SR)); e[:ia] = np.linspace(0, 1, ia); e[n - ib:] *= np.linspace(1, 0, ib); return x * e
def saw(f, d, n=7): t = tt(d); return sum(np.sin(2 * np.pi * f * k * t + k) / k for k in range(1, n))
def pad(ms, d, v=.3, cut=900, a=.8, r=1.2): return fade(lp(sum(saw(hz(m), d) + saw(hz(m) * 1.004, d) for m in ms), cut), a, r) * v * .1
def drone(m, d, v=.4, cut=320): t = tt(d); return fade(lp(saw(hz(m), d, 9) * (1 + .22 * np.sin(2 * np.pi * .23 * t)), cut), .8, 1) * v * .3
def piano(m, v=.3, d=2.4): t = tt(d); f = hz(m); return (np.sin(2*np.pi*f*t) + .45*np.sin(4*np.pi*f*t)*np.exp(-t*3) + .2*np.sin(6*np.pi*f*t)*np.exp(-t*6)) * np.exp(-t*1.5) * np.minimum(1, t/.004) * v * .4
def pulse(m, v=.5, d=.2): t = tt(d); return lp(saw(hz(m), d, 8), 700) * np.exp(-t / .07) * np.minimum(1, t/.003) * v * .4
def taiko(v=.7, f=62): t = tt(.9); return (np.sin(2*np.pi*np.cumsum(f * (1 + 1.2*np.exp(-t/.02)))/SR) * np.exp(-t/.24) + lp(rng.standard_normal(len(t)), 900) * np.exp(-t/.02) * .5) * v
def braam(v=.9, ms=(26, 38, 45), d=3.2): t = tt(d); return lp(sum(saw(hz(m), d, 12) for m in ms), 1100) * np.exp(-t / .95) * np.minimum(1, t/.012) * v * .26
def riser(d, v=.4):
    t = tt(d); y = np.concatenate([bp(rng.standard_normal(int(d * SR / 8) + 1), 300 + 3500 * (k / 8) ** 2, 800 + 6000 * (k / 8) ** 2) for k in range(8)])[:len(t)]; return y * (t / d) ** 2.2 * v
def high(ms, d, v=.12): t = tt(d); return fade(sum(np.sin(2*np.pi*hz(m)*t + 4*np.sin(2*np.pi*5.2*t)*.02) for m in ms), .9, 1.1) * v * .25
def wood(v=.1): t = tt(.05); return bp(rng.standard_normal(len(t)), 1800, 4200) * np.exp(-t/.012) * v
def pluck(m, v=.25): t = tt(.6); f = hz(m); return (np.sin(2*np.pi*f*t) + .3*np.sin(4*np.pi*f*t)) * np.exp(-t*7) * np.minimum(1, t/.002) * v * .4
steps = lambda a, b, dt: np.arange(a, b, dt)
FOOD, JAN, STR8, NEVER, SIGNAL, CRASH, MOON, SPRING = wd(1, 'food'), wd(3, 'january'), wd(5, 'straight'), wd(8, 'never'), wd(11, 'never'), wd(14, 'crashed'), wd(15, 'moon'), A(16)
# hook: drone, a lonely piano, a hit on "food"
put(drone(26, A(2) + .3, .45), 0); [put(piano(m, .32), d) for m, d in zip((74, 77, 81, 76), (.1, .7, 1.3, 1.9))]
put(riser(FOOD - wd(1, 'stood'), .25), wd(1, 'stood')); put(braam(.8, (26, 38)), FOOD); put(taiko(.9, 52), FOOD)
# Q1: a light ticking puzzle; a hit on "January"; a warm swell for the lean
put(pad((50, 53, 57), JAN - A(2) + .2, .38, 700), A(2)); put(drone(26, A(4) - A(2), .3, 260), A(2) + .2)
for i, t0 in enumerate(steps(A(2), JAN - .1, .5)): put(wood(.12), t0, 1, (-1) ** i * .3)
for i, t0 in enumerate(steps(A(2) + .1, JAN - .1, 1.0)): put(pluck((62, 65, 69, 65)[i % 4], .3), t0)
put(braam(.75, (31, 38, 43)), JAN); put(taiko(.8, 54), JAN); put(high((86, 87), A(4) - JAN, .08), JAN + .4)
for m, d in zip((65, 64, 62), (.6, 1.3, 2.0)): put(piano(m, .28), wd(3, 'middle') + d - 1.2)
put(pad((50, 57, 62, 65), E_(4) - A(4) + .5, .5, 1200, 1, 1), A(4)); [put(piano(m, .3), A(4) + d) for m, d in zip((69, 72, 74, 77, 76), (.1, 2.2, 4.3, 6.4, 8.2))]
# stand it up: riser → whoosh-boom
put(riser(STR8 - A(5) + .9, .38), A(5) - .9); put(drone(26, STR8 - A(5) + 1, .45, 420), A(5) - .9)
put(braam(1.0, (26, 33, 38)), STR8); put(taiko(1, 50), STR8)
# the same every day: a flat looping figure that never changes
for i, t0 in enumerate(steps(A(6) - .2, wd(7, 'but') - .1, .25)): put(pluck((62, 69, 65, 69)[i % 4], .26), t0, 1, (-1) ** i * .2)
put(pad((50, 57, 62), wd(7, 'but') - A(6) + .2, .3, 800), A(6) - .2)
for w, k in (('no', 1), ('no', 2)):   # k=0 is "Now"
    put(taiko(.7, 58), wd(6, w, k))
# the problem → the monsoon builds → it never comes
put(braam(.7, (31, 38)), wd(7, 'problem')); put(drone(26, A(8) - wd(7, 'problem'), .4), wd(7, 'problem'))
for i, t0 in enumerate(steps(wd(7, 'seasons'), A(8), .5)): put(pulse(38, .38), t0)
MO = wd(8, 'monsoon')
for i, t0 in enumerate(steps(A(8), NEVER - .1, .25)): put(pulse((38, 38, 41, 38, 45, 38, 43, 41)[i % 8], .36 + .3 * (t0 - A(8)) / (NEVER - A(8))), t0, 1, (-1) ** i * .15)
for t0 in steps(A(8), NEVER - .1, 1.0): put(taiko(.5), t0)
put(pad((50, 53, 57), MO - A(8), .45, 800), A(8)); put(pad((46, 53, 58, 62), NEVER - MO + .2, .55, 1300), MO)
put(riser(NEVER - wd(8, 'with'), .3), wd(8, 'with'))
put(braam(1.0), NEVER); put(taiko(1, 48), NEVER); put(drone(26, A(9) - NEVER + .5, .45, 240), NEVER + .4)
# the poles: a cold high pad
put(high((81, 86, 88), A(10) - A(9) + .3, .14), A(9) - .2); put(pad((38, 45, 50), A(10) - A(9) + .3, .38, 500), A(9) - .2)
for t0 in steps(A(9), A(10) - .2, .5): put(wood(.08), t0, 1, .4)
# the calendar: a fragile piano
put(drone(26, A(11) - A(10) + .2, .3, 220), A(10)); [put(piano(m, .3), A(10) + d) for m, d in zip((62, 65, 69, 67, 65), (.1, .8, 1.5, 2.2, 3.0))]
# waiting: a ticking wait, a hit on "No signal"
for i, t0 in enumerate(steps(A(11), SIGNAL - .1, .5)): put(wood(.13), t0, 1, (-1) ** i * .3)
for i, t0 in enumerate(steps(A(11), SIGNAL - .1, 1.0)): put(pluck((62, 65, 62, 64)[i % 4], .26), t0)
put(pad((50, 53, 57), SIGNAL - A(11), .38, 700), A(11)); put(riser(SIGNAL - wd(11, 'now'), .26), wd(11, 'now'))
put(braam(.85, (26, 38, 41)), SIGNAL); put(taiko(.9, 52), SIGNAL)
# narrow strips: low and uneasy
put(drone(26, A(13) - A(12) + .4, .4, 260), A(12) - .2); put(pad((38, 46, 53), A(13) - A(12), .38, 600), A(12))
for t0 in steps(A(12), A(13) - .2, 1.0): put(pulse(38, .3), t0)
# where did the lean come from: held mystery
put(drone(26, A(14) - A(13) + .3, .34, 240), A(13) - .2); [put(piano(m, .3), A(13) + d) for m, d in zip((62, 69, 70), (.1, 1.0, 1.9))]
for t0 in steps(A(13) + .4, A(14), .5): put(wood(.12), t0, 1, -.3)
put(braam(.6, (31, 38)), wd(13, 'accident'))
# the crash: riser → the heaviest braam; "knocked it sideways"
for i, t0 in enumerate(steps(A(14), CRASH - .1, .25)): put(pulse(38, .38 + .3 * (t0 - A(14)) / (CRASH - A(14))), t0)
put(riser(CRASH - A(14), .4), A(14)); put(pad((50, 53, 56), CRASH - A(14), .45, 700), A(14))
put(braam(1.15, (24, 36, 43, 48), 3.6), CRASH); put(taiko(1.1, 46), CRASH); put(taiko(.8, 54), wd(14, 'knocked'))
put(drone(26, A(15) - CRASH + .4, .5, 300), CRASH + .3)
# the Moon: a warm lift
put(pad((50, 57, 60, 65), MOON - A(15) + .2, .4, 900), A(15)); put(pad((46, 53, 58, 62, 65), E_(15) - MOON + .6, .55, 1500, .6, .8), MOON)
put(high((81, 86), E_(15) - MOON + .4, .1), MOON); [put(piano(m, .32), MOON + d) for m, d in zip((70, 74, 77, 81), (0, .6, 1.2, 1.8))]
# spring: D major, the payoff
put(pad((50, 54, 57, 62, 66), DUR - SPRING + 1, .7, 1900, .5, 1.8), SPRING - .2); put(drone(26, DUR - SPRING + 1, .4, 420), SPRING - .2)
for i, t0 in enumerate(steps(SPRING, DUR - 1.2, .5)): put(pluck((62, 66, 69, 74)[i % 4], .24), t0, 1, (-1) ** i * .2)
for i, t0 in enumerate(steps(SPRING + .5, DUR - 1.2, 1.0)): put(taiko(.4), t0)
cr = wd(16, 'crash'); put(braam(.8, (26, 38, 42, 45)), cr); put(taiko(.9, 50), cr)
for m, d in zip((74, 78, 81, 86), (.5, 1.0, 1.5, 2.0)): put(piano(m, .36), cr + d)
out = hp(out.T, 28).T.astype(np.float32); out = np.stack([limit(out[:, c], .9) for c in range(2)], 1)
os.makedirs(os.path.join(HERE, 'music'), exist_ok=True); sf.write(os.path.join(HERE, 'music/score.wav'), out[:int(DUR * SR)], SR); print('score', DUR)
