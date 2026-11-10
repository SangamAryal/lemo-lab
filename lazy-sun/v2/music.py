"""Score for "The Sun Is Terrible at Its Job" (v2, original, synthesized). A lazy lounge groove (soft electric piano,
brushed shaker, round bass) from the first frame; it drops out for the question beat (0.3 s of silence), turns into a tense
pulse for the protons, sparkles for the 10^38 reveal, goes minor for the burn-out, and resolves for "pacing itself"."""
import os, sys, json, numpy as np, soundfile as sf
LIB = os.environ['LIB']; sys.path.insert(0, LIB)
from core.audio.sfx import SR, bp, lp, hp, add, limit
HERE = os.path.dirname(os.path.abspath(__file__))
ev = json.load(open(os.path.join(HERE, 'events.json'))); DUR = ev['dur']
T = {e['name']: e['t'] for e in ev['ev'] if e['type'] == 'cue'}; VO = {e['id']: e['t'] for e in ev['ev'] if e['type'] == 'vo'}
s = [0] + [e['t'] for e in ev['ev'] if e['type'] == 'scene'] + [DUR]
rng = np.random.default_rng(8); NS = int((DUR + 3) * SR); out = np.zeros((NS, 2), np.float32)
tt = lambda d: np.arange(int(d * SR)) / SR
hz = lambda m: 440 * 2 ** ((m - 69) / 12)
def put(x, t, g=1., pan=0.):
    if 0 <= t < DUR + 2: add(out, np.asarray(x, np.float32), t, g, pan)
def pad(ms, d, v=.3, bright=1800, att=.4, rel=.6):
    t = tt(d); x = np.zeros(len(t))
    for m in ms:
        for det in (-.07, .06):
            ph = 2 * np.pi * hz(m) * 2 ** (det / 12) * t + rng.uniform(0, 6); x += sum(np.sin(k * ph) / k ** 1.3 for k in range(1, 7))
    return lp(x, bright) * np.minimum(1, t / att) * np.minimum(1, np.maximum(0, d - t) / rel) * v * .07
def epiano(m, d=1.2, v=.35):
    t = tt(d); f = hz(m); mod = np.sin(2 * np.pi * f * 14 * t) * np.exp(-t / .05) * 1.2
    return (np.sin(2 * np.pi * f * t + mod) * np.exp(-t / .9) + .3 * np.sin(4 * np.pi * f * t) * np.exp(-t / .3)) * np.minimum(1, t / .004) * np.minimum(1, np.maximum(0, d - t) / .08) * v * .3
def pluck(m, v=.4, d=.4): f = hz(m); t = tt(d); x = sum(np.sin(2 * np.pi * f * k * t) / k * np.exp(-t * (5 + k * 3)) for k in range(1, 6)); return lp(x, 3200) * v * .35
def bell(m, v=.4): t = tt(2.0); return sum(np.sin(2 * np.pi * hz(m) * r * t) * np.exp(-t / tau) * a for r, tau, a in [(1, 1.1, 1), (2.0, .45, .2), (3.01, .25, .12)]) * v * .26
def bass(m, d, v=.5): t = tt(d); x = np.sin(2 * np.pi * hz(m) * t) + .3 * np.sin(4 * np.pi * hz(m) * t); return x * np.minimum(1, t / .015) * np.exp(-t / .9) * np.minimum(1, np.maximum(0, d - t) / .06) * v * .5
def kick(v=.5): t = tt(.3); return np.sin(2 * np.pi * (48 + 70 * np.exp(-t / .03)) * t) * np.exp(-t / .12) * v
def brush(v=.15, d=.18): t = tt(d); return bp(rng.standard_normal(len(t)), 2500, 9000) * np.exp(-t / .06) * v
def every(a, b, st):
    t = a
    while t < b - 1e-6: yield t; t += st
B = 60 / 88
CH = {'F': [53, 57, 60, 64], 'Em': [52, 55, 59, 62], 'Dm': [50, 53, 57, 60], 'C': [48, 52, 55, 59], 'Bb': [46, 50, 53, 57], 'Am': [45, 48, 52, 55], 'Fm': [53, 56, 60, 65]}
RT = {'F': 29, 'Em': 28, 'Dm': 26, 'C': 36, 'Bb': 34, 'Am': 33, 'Fm': 29}
def lounge(t0, t1, prog, v=1., drums=True):
    for k, t in enumerate(every(t0, t1, 4 * B)):
        c = prog[k % len(prog)]; e = min(t + 4 * B, t1)
        put(pad(CH[c], e - t + .3, .18 * v, 1400), t)
        for i, tq in enumerate(every(t, e, B)):
            put(bass(RT[c] + [0, 0, 7, 5][i % 4], B * .9, .5 * v), tq)
            if i in (1, 3): [put(epiano(m + 12, B * 1.6, .3 * v), tq + B * .1 + j * .012, 1, (-1) ** j * .2) for j, m in enumerate(CH[c])]
            if drums:
                if i % 2 == 0: put(kick(.35 * v), tq)
                put(brush(.14 * v), tq + B * .66, 1, .3); put(brush(.09 * v), tq, 1, -.2)
lounge(0, VO['a04'] + .3, ['F', 'Em', 'Dm', 'C'])
lounge(VO['a05'] - .1, s[5], ['Dm', 'Bb', 'Dm', 'Bb'], v=.8, drums=False)
for t in every(s[4], s[5], B / 2): put(bass(26, B * .45, .4), t); put(pluck(62 + 12 * (int((t - s[4]) / B) % 2), .14), t + B / 4, 1, .3)
for i, m in enumerate([86, 89, 93, 98]): put(bell(m, .45), T['anyway'] + i * .08, 1, (i - 1.5) * .3)
for t in every(s[5], s[6], B):
    put(bass([33, 40][int((t - s[5]) / B) % 2], B * .8, .4), t); put(brush(.1), t + B / 2, 1, .3)
for i, t in enumerate(every(s[5] + .1, s[6], B / 2)): put(epiano([69, 72, 76, 74, 72, 69, 67, 69][i % 8] + 12, .5, .25), t, 1, .2)
lounge(s[6], s[7], ['Bb', 'C', 'Am', 'Dm'], v=.9)
for i, t in enumerate(every(T['hundred'], s[7], .09)): put(bell(84 + [0, 4, 7, 12][i % 4], .16), t, 1, (-1) ** i * .5)
put(pad(CH['Fm'], s[8] - s[7] + .5, .45, 1300), s[7]); put(bass(29, T['burned'] - s[7], .5), s[7])
for i, m in enumerate([77, 75, 72, 68, 65]): put(pluck(m, .35, .9), T['burned'] + i * .22, 1, 0)
lounge(s[8], DUR - 1.2, ['F', 'C'], v=.95)
put(pad(CH['F'] + [69], 2.4, .4, 2600, .2, 1.8), DUR - 2.4); put(bell(89, .5), T['star'], 1, .3)
out = hp(out.T, 35).T.astype(np.float32); out = np.stack([limit(out[:, c], .9) for c in range(2)], 1)
os.makedirs(os.path.join(HERE, 'music'), exist_ok=True); sf.write(os.path.join(HERE, 'music/score.wav'), out[:int(DUR * SR)], SR)
print('score', DUR, 'peak', float(np.abs(out).max()))
