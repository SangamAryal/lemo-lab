"""Score (original, synthesized): a mellow lo-fi bed for a narrated explainer. Plucky e-piano chords, round bass, soft kick
and hats, steady level the whole way; it drops out for a beat on "we'll never see most of them" and swells for the ending."""
import os, sys, json, numpy as np, soundfile as sf
LIB = os.environ['LIB']; sys.path.insert(0, LIB)
from core.audio.sfx import SR, bp, lp, hp, add, limit
HERE = os.path.dirname(os.path.abspath(__file__))
TL = json.load(open(os.path.join(HERE, 'timeline.json'))); DUR = TL['dur']; AT = {l['id']: l['t'] for l in TL['lines']}
rng = np.random.default_rng(3); NS = int((DUR + 3) * SR); out = np.zeros((NS, 2), np.float32)
tt = lambda d: np.arange(int(d * SR)) / SR; hz = lambda m: 440 * 2 ** ((m - 69) / 12)
def put(x, t, g=1., pan=0.):
    if 0 <= t < DUR + 2: add(out, np.asarray(x, np.float32), t, g, pan)
def ep(m, d, v=.3): t = tt(d); f = hz(m); x = (np.sin(2*np.pi*f*t) + .35*np.sin(4*np.pi*f*t)*np.exp(-t*4)) * np.exp(-t*2.2); return lp(x*np.minimum(1, t/.005), 3000) * v * .3
def bass(m, d, v=.5): t = tt(d); return np.sin(2*np.pi*hz(m)*t) * np.minimum(1, t/.01) * np.exp(-t/.5) * v * .55
def kick(v=.35): t = tt(.22); return np.sin(2*np.pi*(50 + 70*np.exp(-t/.025))*t) * np.exp(-t/.1) * v
def hat(v=.06): t = tt(.06); return bp(rng.standard_normal(len(t)), 5500, 10000) * np.exp(-t/.015) * v
def snap(v=.12): t = tt(.12); return bp(rng.standard_normal(len(t)), 1200, 4000) * np.exp(-t/.03) * v
B = 60 / 78
PROG = [[45, 60, 64, 67], [41, 60, 64, 69], [48, 64, 67, 71], [43, 59, 62, 67]]     # Cmaj7 · Am7 · Fmaj7 · G
WHAT0, WHAT1 = AT["08"] - .2, AT["08"] + 1.3
t = 0.; i = 0
while t < DUR + 1:
    ch = PROG[(i // 4) % 4]; v = 1.25 if t > AT['13'] else 1
    if not (WHAT0 <= t < WHAT1):
        for k, m in enumerate(ch[1:]):
            put(ep(m, B * .9, .26 * v), t + k * .012, 1, (k - 1) * .35)
            if i % 2: put(ep(m + 12, B * .4, .1 * v), t + B * .5 + k * .01, 1, (1 - k) * .35)
        put(bass(ch[0] - 12 if i % 2 == 0 else ch[0] - 5, B, .5 * v), t)
        put(kick(.32 * v), t) if i % 2 == 0 else put(snap(.12 * v), t)
        put(hat(.05), t + B / 2, 1, .3)
    t += B; i += 1
out = hp(out.T, 30).T.astype(np.float32); out = np.stack([limit(out[:, c], .9) for c in range(2)], 1)
os.makedirs(os.path.join(HERE, 'music'), exist_ok=True); sf.write(os.path.join(HERE, 'music/score.wav'), out[:int(DUR * SR)], SR); print('score', DUR)
