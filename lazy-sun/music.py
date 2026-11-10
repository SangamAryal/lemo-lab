"""Score for "The Sun Is Lazy" (original, synthesized). An epic swell for the first line that cuts dead on the reveal, then a
lazy lounge groove (soft electric piano, brushed shaker, round bass, 84 bpm) that carries the film. Plucky arpeggios for the
photon's pinball ride, a tense pulse for the protons, elevator music for the waiting room, a minor drop for the twist,
a warm build for "oceans… dinosaurs… you", and a laid-back resolve at the end."""
import os, sys, json, numpy as np, soundfile as sf
LIB = os.environ['LIB']; sys.path.insert(0, LIB)
from core.audio.sfx import SR, bp, lp, hp, add, limit
HERE = os.path.dirname(os.path.abspath(__file__))
ev = json.load(open(os.path.join(HERE, 'events.json'))); DUR = ev['dur']
T = {e['name']: e['t'] for e in ev['ev'] if e['type'] == 'cue'}; VO = {e['id']: e['t'] for e in ev['ev'] if e['type'] == 'vo'}
SCN = [e['t'] for e in ev['ev'] if e['type'] == 'scene']
rng = np.random.default_rng(8); NS = int((DUR + 3) * SR); out = np.zeros((NS, 2), np.float32)
tt = lambda d: np.arange(int(d * SR)) / SR
hz = lambda m: 440 * 2 ** ((m - 69) / 12)
def put(x, t, g=1., pan=0.):
    if 0 <= t < DUR + 2: add(out, np.asarray(x, np.float32), t, g, pan)
def pad(ms, d, v=.3, bright=1800, att=1.0, rel=1.4):
    t = tt(d); x = np.zeros(len(t))
    for m in ms:
        for det in (-.07, .06):
            ph = 2 * np.pi * hz(m) * 2 ** (det / 12) * t + rng.uniform(0, 6); x += sum(np.sin(k * ph) / k ** 1.3 for k in range(1, 7))
    return lp(x, bright) * np.minimum(1, t / att) * np.minimum(1, np.maximum(0, d - t) / rel) * v * .07
def epiano(m, d=1.2, v=.35):                                    # a soft Rhodes-ish tine: FM bell over a sine body
    t = tt(d); f = hz(m); mod = np.sin(2 * np.pi * f * 14 * t) * np.exp(-t / .05) * 1.2
    return (np.sin(2 * np.pi * f * t + mod) * np.exp(-t / .9) + .3 * np.sin(4 * np.pi * f * t) * np.exp(-t / .3)) * np.minimum(1, t / .004) * np.minimum(1, (d - t) / .08) * v * .3
def pluck(m, v=.4, d=.5, b=3600):
    f = hz(m); t = tt(d); x = sum(np.sin(2 * np.pi * f * k * t) / k * np.exp(-t * (4 + k * 3)) for k in range(1, 7)); return lp(x * np.minimum(1, t / .002), b) * v * .4
def bell(m, v=.4): t = tt(2.0); return sum(np.sin(2 * np.pi * hz(m) * r * t) * np.exp(-t / tau) * a for r, tau, a in [(1, 1.1, 1), (2.0, .45, .2), (3.01, .25, .12)]) * v * .26
def bass(m, d, v=.5): t = tt(d); x = np.sin(2 * np.pi * hz(m) * t) + .3 * np.sin(4 * np.pi * hz(m) * t); return x * np.minimum(1, t / .015) * np.exp(-t / .9) * np.minimum(1, np.maximum(0, d - t) / .06) * v * .5
def kick(v=.5): t = tt(.3); return np.sin(2 * np.pi * (48 + 70 * np.exp(-t / .03)) * t) * np.exp(-t / .12) * v
def brush(v=.15, d=.18): t = tt(d); return bp(rng.standard_normal(len(t)), 2500, 9000) * np.exp(-t / .06) * v
def every(a, b, s):
    t = a
    while t < b - 1e-6: yield t; t += s
B = 60 / 84                                                     # lounge tempo
CH = {'Fmaj7': [53, 57, 60, 64], 'Em7': [52, 55, 59, 62], 'Dm7': [50, 53, 57, 60], 'Cmaj7': [48, 52, 55, 59], 'Bbmaj7': [46, 50, 53, 57],
      'Am7': [45, 48, 52, 55], 'Gm7': [43, 46, 50, 53], 'C7': [48, 52, 55, 58], 'Fm': [53, 56, 60, 65], 'Db': [49, 53, 56, 61]}
ROOT = {'Fmaj7': 29, 'Em7': 28, 'Dm7': 26, 'Cmaj7': 36, 'Bbmaj7': 34, 'Am7': 33, 'Gm7': 31, 'C7': 36, 'Fm': 29, 'Db': 25}
def lounge(t0, t1, prog, v=1., drums=True, keys=True):
    bar = 4 * B; k = 0
    for t in every(t0, t1, bar):
        c = prog[k % len(prog)]; e = min(t + bar, t1)
        put(pad(CH[c], e - t + .3, .18 * v, 1400, .3, .4), t)
        for i, tq in enumerate(every(t, e, B)):
            put(bass(ROOT[c] + [0, 0, 7, 5][i % 4], B * .9, .5 * v), tq)
            if keys and i in (1, 3): [put(epiano(m + 12, B * 1.6, .3 * v), tq + B * .1 + j * .012, 1, (-1) ** j * .2) for j, m in enumerate(CH[c])]
            if drums:
                if i % 2 == 0: put(kick(.35 * v), tq)
                put(brush(.14 * v), tq + B * .66, 1, .3); put(brush(.09 * v), tq, 1, -.2)
        k += 1
s = [0] + SCN + [DUR]
# 1 · the epic swell, cut dead on the reveal
put(pad([41, 48, 53, 57, 60, 65], T['cut'] - .3, .6, 2600, 1.2, .05), .2); put(bass(17, T['cut'] - .4, .6), .3)
for i, t in enumerate(every(.5, T['cut'] - .3, .55)): put(bell([77, 81, 84, 89][i % 4], .22 + i * .03), t, 1, (-1) ** i * .3)
# 2 · lounge from the reveal through the compost heap, the couch and the zoom-out
lounge(T['lazy'] - .1, s[2], ['Fmaj7', 'Em7', 'Dm7', 'Cmaj7'])
put(bell(84, .45), T['compost'] + .3, 1, .3)
lounge(s[2], s[3], ['Bbmaj7', 'Am7', 'Gm7', 'C7'], v=.9)
put(bell(89, .5), T['congrats'], 1, .2); put(bell(93, .4), T['congrats'] + .2, 1, -.2)
put(pad([41, 48, 53, 57, 64], s[4] - s[3] + .5, .5, 2200, 1.0, 1.0), s[3]); put(bell(77, .5), T['big'], 1, 0); put(bell(84, .4), T['big'] + .3, 1, 0)
# 3 · the photon's pinball ride: quick plucks, then a lift for "eight minutes"
lounge(s[4], s[5], ['Dm7', 'Bbmaj7', 'Fmaj7', 'C7'], v=.8, keys=False)
for i, t in enumerate(every(s[4] + .2, T['crossed'], B / 4)): put(pluck([74, 77, 81, 79, 77, 72, 74, 76][i % 8] + 12 * (i % 16 > 7), .22, .3), t, 1, (-1) ** i * .4)
put(bell(96, .5), T['minutes'], 1, .4)
# 4 · protons: a tense, bouncy pulse in D minor, a sparkle on the fusion
for t in every(s[5], s[6], B / 2): put(bass(26, B * .45, .45), t); put(pluck(62 + 12 * (int((t - s[5]) / B) % 2), .15, .2), t + B / 4, 1, .3)
put(pad([50, 53, 57, 62], s[6] - s[5] + .4, .25, 1200, .5, .5), s[5])
for i, m in enumerate([86, 89, 93, 98]): put(bell(m, .45), T['anyway'] + i * .08, 1, (i - 1.5) * .3)
# 5 · the waiting room: elevator bossa
for t in every(s[6], s[7], B):
    put(bass([33, 40][int((t - s[6]) / B) % 2], B * .8, .4), t); put(brush(.1), t + B / 2, 1, .3)
for i, t in enumerate(every(s[6] + .1, s[7], B / 2)): put(epiano([69, 72, 76, 74, 72, 69, 67, 69][i % 8] + 12, .5, .25), t, 1, .2)
# 6 · the twist: the beat drops, minor pad, a falling line on "burned out"
put(pad(CH['Fm'], s[8] - s[7] + .6, .45, 1300, .3, .8), s[7]); put(bass(29, T['burned'] - s[7], .5), s[7])
for i, m in enumerate([77, 75, 72, 68, 65]): put(pluck(m, .35, .9, 2200), T['burned'] + i * .22, 1, 0)
# 7 · it took its time: a warm build into "you"
lounge(s[8], s[9], ['Bbmaj7', 'C7', 'Am7', 'Dm7'], v=.95)
for k, nm in [(0, 'oceans'), (1, 'dinos'), (2, 'you14')]: put(bell([81, 84, 89][k], .45), T[nm], 1, (k - 1) * .4)
# 8 · the resolve
lounge(s[9], DUR - 2.0, ['Fmaj7', 'Em7', 'Dm7', 'Cmaj7'])
put(pad(CH['Fmaj7'] + [69], 3.0, .4, 2600, .2, 2.4), DUR - 3.0); put(bell(89, .5), T['star'], 1, .3); put(bell(84, .4), DUR - 3.0)
out = hp(out.T, 35).T.astype(np.float32); out = np.stack([limit(out[:, c], .9) for c in range(2)], 1)
os.makedirs(os.path.join(HERE, 'music'), exist_ok=True); sf.write(os.path.join(HERE, 'music/score.wav'), out[:int(DUR * SR)], SR)
print('score', DUR, 'peak', float(np.abs(out).max()))
