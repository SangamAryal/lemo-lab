"""Score for "What If the Sun Vanished?" (original, synthesized). A bright, bouncy pad + pluck arpeggio while the
light is still arriving, a hard cut to 0.3 s of silence at 8:20 when the lights go out, a driving low pulse as Earth
flies off, a hollow, cold colour for the dark and the freeze, a warmer lift under the ice and at the vents, and the
bright groove back when the Sun returns."""
import os, sys, json, numpy as np, soundfile as sf
LIB = os.environ['LIB']; sys.path.insert(0, LIB)
from core.audio.sfx import SR, bp, lp, hp, add, limit
HERE = os.path.dirname(os.path.abspath(__file__))
ev = json.load(open(os.path.join(HERE, 'events.json'))); DUR = ev['dur']
T = {e['name']: e['t'] for e in ev['ev'] if e['type'] == 'cue'}
SCN = [e['t'] for e in ev['ev'] if e['type'] == 'scene']
rng = np.random.default_rng(7); NS = int((DUR + 3) * SR); out = np.zeros((NS, 2), np.float32)
tt = lambda d: np.arange(int(d * SR)) / SR
hz = lambda m: 440 * 2 ** ((m - 69) / 12)
def put(x, t, g=1., pan=0.):
    if 0 <= t < DUR + 2: add(out, np.asarray(x, np.float32), t, g, pan)
def pad(ms, d, v=.3, bright=1800, att=.5, rel=.6):
    t = tt(d); x = np.zeros(len(t))
    for m in ms:
        for det in (-.07, .06):
            ph = 2 * np.pi * hz(m) * 2 ** (det / 12) * t + rng.uniform(0, 6); x += sum(np.sin(k * ph) / k ** 1.3 for k in range(1, 7))
    return lp(x, bright) * np.minimum(1, t / att) * np.minimum(1, np.maximum(0, d - t) / rel) * v * .07
def pluck(m, v=.4, d=.45, b=3600):
    f = hz(m); t = tt(d); x = sum(np.sin(2 * np.pi * f * k * t) / k * np.exp(-t * (4 + k * 3)) for k in range(1, 7)); return lp(x * np.minimum(1, t / .002), b) * v * .4
def bell(m, v=.4): t = tt(2.0); return sum(np.sin(2 * np.pi * hz(m) * r * t) * np.exp(-t / tau) * a for r, tau, a in [(1, 1.1, 1), (2.0, .45, .2), (3.01, .25, .12)]) * v * .26
def bass(m, d, v=.5): t = tt(d); x = np.sin(2 * np.pi * hz(m) * t) + .3 * np.sin(4 * np.pi * hz(m) * t); return x * np.minimum(1, t / .015) * np.exp(-t / 1.0) * np.minimum(1, np.maximum(0, d - t) / .06) * v * .5
def kick(v=.6): t = tt(.35); return np.sin(2 * np.pi * np.cumsum(50 + 110 * np.exp(-t / .04)) / SR) * np.exp(-t / .12) * v
def hat(v=.2): n = int(.05 * SR); return bp(rng.standard_normal(n), 6000, 12000) * np.exp(-np.arange(n) / SR / .012) * v
def every(a, b, s):
    t = a
    while t < b - 1e-6: yield t; t += s
B = 60 / 100
# one chord per scene: (notes, energy, style)  style: 'spin' bouncy, 'chaos' driving, 'still' hollow
CH = [([57, 60, 64, 67], .7, 'spin'), ([53, 57, 60, 64], .6, 'spin'), ([55, 59, 62, 66], .6, 'spin'), ([52, 55, 59, 62], .6, 'spin'),
      ([45, 52, 55, 60], .9, 'chaos'),
      ([50, 57, 60], .35, 'still'), ([48, 55, 62], .35, 'still'), ([45, 52, 59], .4, 'still'), ([44, 51, 56, 59], .4, 'still'), ([43, 50, 55, 58], .45, 'still'),
      ([48, 55, 60, 64], .5, 'still'), ([53, 57, 60, 65], .45, 'spin'),
      ([55, 59, 62, 67], .6, 'spin'), ([57, 60, 64, 69], .65, 'spin')]
s = [0] + SCN + [DUR]
assert len(CH) == len(s) - 1, (len(CH), len(s))
for i, (ch, en, st) in enumerate(CH):
    a, b = s[i], s[i + 1]
    if st == 'still': put(pad(ch, b - a + .6, .3 * en + .08, 700 + 900 * en, att=1.0, rel=1.0), a)
    else: put(pad(ch, b - a + .4, .22 * en + .05, 1300 + 1500 * en), a)
    if st == 'spin':
        for j, t in enumerate(every(a + .05, b, B)): put(bass(ch[0] - 12 + [0, 0, 7, 5][j % 4], B * .95, .4 * en), t)
        for j, t in enumerate(every(a + .05, b, B / 2)): put(pluck(ch[[0, 2, 1, 3, 2, 1][j % 6] % len(ch)] + 12, .2 * en, .4), t, 1, (-1) ** j * .35)
    elif st == 'chaos':
        for j, t in enumerate(every(a + .05, b, B / 2)): put(bass(ch[0] - 12 + (0 if j % 4 < 3 else 1), B * .48, .55 * en), t)
        for j, t in enumerate(every(a + .05, b, B)): put(kick(.5 * en), t)
        for j, t in enumerate(every(a + .05 + B / 4, b, B / 2)): put(hat(.25), t, 1, (-1) ** j * .4)
    else:
        for j, t in enumerate(every(a + .4, b, B * 2)): put(pluck(ch[j % len(ch)] + 12, .12 * en, 1.2, 1800), t, 1, (-1) ** j * .5)
    if i > 0: put(bell(ch[0] + 24, .3), a + .4, 1, (-1) ** i * .3)
# the blackout: duck under "the lights go out", hard silence for 0.3 s, then the dark creeps back in
o0 = T['blackout']; i0, i1, i2 = int((o0 - .6) * SR), int(o0 * SR), int((o0 + .3) * SR)
out[i0:i1] *= np.linspace(1, .35, i1 - i0)[:, None]; out[i1:i2] = 0
i3 = int(s[4] * SR); out[i2:i3] *= np.linspace(0, .6, i3 - i2)[:, None] ** 2
put(bell(84, .5), T['good']); put(bell(81, .35), T['relax'] + .1); put(bell(88, .3), T['ago'] + .2)
out = hp(out.T, 35).T.astype(np.float32); out = np.stack([limit(out[:, c], .9) for c in range(2)], 1)
os.makedirs(os.path.join(HERE, 'music'), exist_ok=True); sf.write(os.path.join(HERE, 'music/score.wav'), out[:int(DUR * SR)], SR)
print('score', DUR, 'peak', float(np.abs(out).max()))
