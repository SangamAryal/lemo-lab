"""Score (original, synthesized), dark and dramatic, following the story in D minor: a low drone and lonely piano for the hook,
a driving pulse and riser into the impact with a heavy brass hit, ticking mystery, a hit and war drums for the blast, a bare
heartbeat in the darkness, a fragile moment for "our ancestor", a stalking ostinato to the giant foot, a rising build, three
hits on "No apes / No cities / No you" then silence, a held mystery, and a lift into D major only at the very end."""
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
rng = np.random.default_rng(7); NS = int((DUR + 4) * SR); out = np.zeros((NS, 2), np.float32)
tt = lambda d: np.arange(int(d * SR)) / SR; hz = lambda m: 440 * 2 ** ((m - 69) / 12)
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
def heart(v=.8): t = tt(.32); x = np.sin(2*np.pi*52*t) * np.exp(-t/.09) * v; return x
def steps(a, b, dt): return np.arange(a, b, dt)
HIT1, IMP, STOMP = wd(2, 'mexico'), wd(4, 'impact'), wd(12, 'badger') - .15
nos = [A(14) + max(0, q[1]) for q in W_['l14'] if key(q[0]) == 'no'][-3:]
DINO = wd(17, 'dinosaur')
# hook: drone and a lonely piano
put(drone(26, A(2) + .4, .5), 0); [put(piano(m, .34), d) for m, d in zip((74, 77, 81, 76), (.1, .75, 1.4, 2.05))]
# Q1: a driving pulse and a riser into the impact
for i, t0 in enumerate(steps(A(2) - .05, HIT1 - .05, .25)): put(pulse(38 if i % 8 < 6 else 41, .42 + .3 * (t0 - A(2)) / (HIT1 - A(2))), t0, 1, (-1) ** i * .12)
for t0 in steps(A(2) - .05, HIT1 - .1, 1.0): put(taiko(.45), t0)
put(pad((50, 53, 57), HIT1 - A(2) + .3, .5, 700), A(2)); put(riser(HIT1 - A(2) - .2, .34), A(2) + .2)
put(braam(1.0), HIT1); put(taiko(1, 50), HIT1)
# the grain of sand: ticking mystery
put(drone(26, A(4) - HIT1 + .5, .4), HIT1 + .6); put(pad((46, 50, 53), A(4) - HIT1 - .4, .42, 620), HIT1 + 1.0)
for t0 in steps(HIT1 + .9, A(4), .5): put(wood(.13), t0, 1, .3)
for m, d in zip((69, 70, 69, 65), (0, .5, 1, 1.5)): put(piano(m, .3), wd(3, 'how') + d)
# the dive, then the blast
put(drone(26, IMP - A(4) + .3, .55, 420), A(4)); put(pad((38, 45), IMP - A(4), .45, 420), A(4)); put(riser(IMP - A(4), .34), A(4)); put(high((86, 87), IMP - A(4), .1), A(4))
put(braam(1.0, (26, 33, 38)), IMP); put(taiko(1, 50), IMP)
for i, t0 in enumerate(steps(IMP + .5, A(7) - .3, .5)): put(taiko(.5 + (.24 if i % 4 == 0 else 0)), t0, 1, (-1) ** i * .15)
put(pad((50, 53, 57), wd(5, 'study') - IMP + .5, .55, 800), IMP + .3); put(pad((43, 50, 58), A(7) - wd(5, 'study'), .55, 800), wd(5, 'study'))
put(high((81, 82), A(7) - wd(5, 'study'), .1), wd(5, 'study')); put(braam(.7, (31, 38)), A(6) + 1.3)
# Q2: nearly nothing but a heartbeat
put(drone(26, A(9) - A(7) + .4, .5, 240), A(7) - .2); put(high((86, 87), A(9) - A(7), .08), A(7))
for t0 in steps(A(7), A(9) - .3, 1.1): put(heart(.85), t0); put(heart(.6), t0 + .28)
# the burrows: fragile; our ancestor: one warm chord
put(drone(26, A(11) - A(9) + .2, .3, 220), A(9)); [put(piano(m, .28), A(9) + d) for m, d in zip((62, 65, 69, 67, 65, 69), (.2, 1.0, 1.8, 2.6, 3.4, 4.2))]
put(pad((53, 57, 60, 65), A(11) - A(10) + .4, .5, 1300, .5, .8), A(10) - .1); put(piano(77, .4), wd(10, 'ancestor'))
# Q3: the stalking ostinato to the giant foot
for i, t0 in enumerate(steps(A(11) - .1, STOMP - .08, .25)): put(pulse((38, 38, 41, 38, 38, 44, 38, 43)[i % 8], .38 + .28 * (t0 - A(11)) / (STOMP - A(11))), t0, 1, (-1) ** i * .15)
put(pad((50, 53, 56), STOMP - A(11) + .2, .42, 640), A(11)); put(riser(STOMP - A(11) - .1, .24), A(11) + .1)
put(braam(1.0), STOMP); put(taiko(1, 48), STOMP)
for t0 in steps(STOMP + .6, A(13) - .2, .5): put(pulse(38, .4), t0)
put(drone(26, A(13) - STOMP, .4), STOMP + .5)
# the rise of the mammals: the build
for m, d0 in (((50, 53, 57), 0), ((46, 53, 58), .34), ((48, 55, 60), .67)): put(pad(m, (A(14) - A(13)) * .4, .55, 1100, .25, .4), A(13) + (A(14) - A(13)) * d0)
for i, t0 in enumerate(steps(A(13), A(14), .5)): put(taiko(.5 + .35 * (t0 - A(13)) / (A(14) - A(13))), t0, 1, (-1) ** i * .1)
for i, t0 in enumerate(steps(A(13), A(14), .25)): put(pulse((38, 45)[i % 2], .42), t0)
# "that door may never open": tension, then three hits and silence
for i, t0 in enumerate(steps(A(14), nos[0] - .1, .25)): put(pulse(38, .5), t0)
put(riser(nos[0] - A(14), .34), A(14))
for i, t0 in enumerate(nos): put(braam(.9 + .05 * i, (26 - 2 * i, 38 - 2 * i, 45 - 2 * i), 1.4), t0); put(taiko(1, 54 - 4 * i), t0)
# Q4: a held mystery, then the lift
put(drone(26, A(16) - A(15) + .3, .34, 240), A(15) - .25); [put(piano(m, .3), A(15) + d) for m, d in zip((62, 69, 70), (.1, 1.0, 1.9))]
for t0 in steps(A(15) + .4, A(16), .5): put(wood(.12), t0, 1, -.3)
put(pad((50, 54, 57, 62), A(17) - A(16) + .5, .55, 1500, .7, .6), A(16)); put(high((81, 86), A(17) - A(16), .13), A(16))
for t0 in steps(A(17), DINO - .1, .5): put(wood(.12), t0, 1, .3)
put(drone(26, DINO - A(17) + .3, .34, 260), A(17)); put(riser(DINO - A(17), .24), A(17))
put(braam(1.0, (26, 38, 42, 45)), DINO); put(taiko(1, 50), DINO)
put(pad((50, 54, 57, 62, 66), DUR - DINO + 1, .78, 1900, .3, 1.8), DINO); put(drone(26, DUR - DINO + 1, .48, 420), DINO)
for i, t0 in enumerate(steps(DINO + 1, DUR - 1.2, 1.0)): put(taiko(.55), t0)
for m, d in zip((74, 78, 81, 86), (1, 1.5, 2, 2.5)): put(piano(m, .36), DINO + d)
out = hp(out.T, 28).T.astype(np.float32); out = np.stack([limit(out[:, c], .9) for c in range(2)], 1)
os.makedirs(os.path.join(HERE, 'music'), exist_ok=True); sf.write(os.path.join(HERE, 'music/score.wav'), out[:int(DUR * SR)], SR); print('score', DUR)
