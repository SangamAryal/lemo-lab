"""SFX + VO + score → mix.wav. Dense, punchy sound design (about one effect per second): a whoosh on every cut, whoosh→boom on
the big reveals, pops on every card and soft ticks on the gold caption words, plus meme SFX on the jokes (record scratch, vine
boom, oven ding, bonk, stamp, womp-womp, sad bloop, error buzz, sad trombone, relief sigh) and scene sounds (waves, crab clicks,
clock ticks, spawning pops, an owl, a light switch, a wub-wub wobble, shuffle skips). All synthesized here; no samples."""
import os, sys, json, numpy as np, soundfile as sf, soxr
LIB = os.environ['LIB']; sys.path.insert(0, LIB)
from core.audio.sfx import SR, bp, lp, hp, add, compress, limit
from core.audio import sampler as SM
HERE = os.path.dirname(os.path.abspath(__file__))
ev = json.load(open(os.path.join(HERE, 'events.json'))); E = ev['ev']; DUR = ev['dur']
T = {e['name']: e['t'] for e in E if e['type'] == 'cue'}; VO = {e['id']: e['t'] for e in E if e['type'] == 'vo'}; SCN = [e['t'] for e in E if e['type'] == 'scene']
rng = np.random.default_rng(12); NS = int((DUR + 1) * SR)
fx, vo, mb = np.zeros((NS, 2), np.float32), np.zeros((NS, 2), np.float32), np.zeros((NS, 2), np.float32)
tt = lambda d: np.arange(int(d * SR)) / SR; db = lambda x: 10 ** (x / 20)
def put(x, t, g=1., pan=0.):
    if 0 <= t < DUR: add(fx, np.asarray(x, np.float32), t, g, pan)
sweep = lambda f0, f1, d: np.cumsum(f0 * (f1 / f0) ** (tt(d) / d)) / SR
# ── the palette
def whoosh(d=.5, v=.6, lo=300, hi=5000): t = tt(d); return bp(rng.standard_normal(len(t)), lo, hi) * np.sin(np.pi * t / d) ** 2 * .45 * v
def boom(v=.9): t = tt(1.2); return (np.sin(2 * np.pi * sweep(90, 38, 1.2)) * np.exp(-t / .35) + lp(rng.standard_normal(len(t)), 200) * np.exp(-t / .08) * .6) * v
def vine(v=.9): t = tt(1.6); x = np.sin(2 * np.pi * sweep(70, 34, 1.6)) * np.exp(-t / .55) + np.sin(2 * np.pi * sweep(140, 68, 1.6)) * np.exp(-t / .3) * .4 + lp(rng.standard_normal(len(t)), 300) * np.exp(-t / .05); return np.tanh(x * 2.2) * v * .6
def popf(v=.45, f=700): t = tt(.12); return np.sin(2 * np.pi * np.cumsum(f * (1 + 1.5 * np.exp(-t / .02))) / SR) * np.exp(-t / .04) * v
def tick(v=.15): n = int(.02 * SR); return bp(rng.standard_normal(n), 2500, 8000) * np.exp(-np.arange(n) / SR / .004) * v
def scratch(v=.7): t = tt(.45); f = 300 + 900 * np.abs(np.sin(2 * np.pi * 3.2 * t)); return (np.sign(np.sin(2 * np.pi * np.cumsum(f) / SR)) * .3 + bp(rng.standard_normal(len(t)), 800, 5000) * .6) * np.exp(-t / .2) * v * .5
def ding(f=1760, v=.5): t = tt(1.2); return (np.sin(2 * np.pi * f * t) + .4 * np.sin(2 * np.pi * f * 2.76 * t) * np.exp(-t / .2)) * np.exp(-t / .45) * v * .35
def bonk(v=.6): t = tt(.25); return (np.sin(2 * np.pi * sweep(420, 260, .25)) * np.exp(-t / .05) + bp(rng.standard_normal(len(t)), 800, 3000) * np.exp(-t / .008)) * v
def stamp(v=.8): t = tt(.35); return (lp(rng.standard_normal(len(t)), 600) * np.exp(-t / .04) * 1.4 + np.sin(2 * np.pi * 70 * t) * np.exp(-t / .1)) * v
def bend(f0, f1, d, v=.4, wah=0):                                 # a muted brass-ish note (womp / sad trombone)
    t = tt(d); ph = 2 * np.pi * sweep(f0, f1, d); x = sum(np.sin(k * ph) / k for k in range(1, 8)) * (1 + .15 * np.sin(2 * np.pi * 5.5 * t))
    return lp(x, 1300) * (1 - .45 * wah * (.5 + .5 * np.cos(2 * np.pi * 3 * t))) * np.minimum(1, t / .03) * np.minimum(1, (d - t) / .08) * v * .25
def womp(v=.5): return np.concatenate([bend(330, 300, .35, v, 1), bend(300, 200, .9, v, 1)])
def sad_trombone(v=.5): return np.concatenate([bend(f, f * .97, .32, v) for f in (311, 294, 277)] + [bend(262, 240, 1.0, v, 1)])
def bloop(v=.5, f0=500, f1=180): t = tt(.25); return np.sin(2 * np.pi * sweep(f0, f1, .25)) * np.exp(-t / .07) * v
def poof(v=.6): t = tt(.5); return bp(rng.standard_normal(len(t)), 400, 6000) * np.exp(-t / .12) * v * .8
def click(v=.4): t = tt(.03); return bp(rng.standard_normal(len(t)), 1500, 7000) * np.exp(-t / .004) * v
def crabclick(v=.3): t = tt(.03); return (bp(rng.standard_normal(len(t)), 2500, 6000) * np.exp(-t / .003)) * v
def glitch(d=.6, v=.35): t = tt(d); x = np.sign(np.sin(2 * np.pi * (220 + 200 * (rng.random(len(t)) > .995).cumsum() % 3) * t)); return bp(x * (np.sin(2 * np.pi * 18 * t) > 0), 300, 3000) * v * .4
def owl(v=.3): t = tt(.9); f = 380 * (1 + .03 * np.sin(2 * np.pi * 6 * t)); env = np.exp(-((t - .2) / .12) ** 2) + .8 * np.exp(-((t - .6) / .16) ** 2); return np.sin(2 * np.pi * np.cumsum(f) / SR) * env * v
def wub(d=1.6, v=.45):                                            # a wobble bass: a saw through a lowpass swept by a 3 Hz LFO
    t = tt(d); x = sum(np.sin(2 * np.pi * 55 * k * t) / k for k in range(1, 9)); y = np.zeros(len(t)); blk = 512
    for i in range(0, len(t), blk): y[i:i + blk] = lp(x[i:i + blk + 1024], 150 + 900 * (.5 + .5 * np.sin(2 * np.pi * 3 * t[i])))[:len(y[i:i + blk])]
    return y * np.minimum(1, t / .05) * np.minimum(1, (d - t) / .1) * v
def sigh(v=.4): t = tt(1.0); return bp(rng.standard_normal(len(t)), 300, 1600) * np.exp(-((t - .35) / .25) ** 2) * v
def shimmer(d=1.2, v=.4): t = tt(d); return sum(np.sin(2 * np.pi * f * t + rng.uniform(0, 6)) * (.5 + .5 * np.sin(2 * np.pi * 7 * t + k)) for k, f in enumerate([1568, 2093, 2637, 3136])) * np.sin(np.pi * t / d) * v * .06
def waves(d, v=.12): t = tt(d); return lp(rng.standard_normal(len(t)), 900) * (.55 + .45 * np.sin(2 * np.pi * .35 * t)) * np.minimum(1, t / .5) * np.minimum(1, (d - t) / .5) * v * 2
def underwater(d, v=.1): t = tt(d); return lp(rng.standard_normal(len(t)), 300) * np.minimum(1, t / .4) * np.minimum(1, (d - t) / .4) * v * 3

# ── real meme clips (Pixabay, trimmed in /home/sangam/lemo-lab/meme-sfx/clips) replace the synthesized stand-ins
CLIPDIR = '/home/sangam/lemo-lab/meme-sfx/clips'
def clip(name, v=1.):
    y, sr = sf.read(os.path.join(CLIPDIR, name + '.wav')); y = y.astype(np.float32) if y.ndim == 1 else y.mean(1).astype(np.float32)
    y = soxr.resample(y, sr, SR); return y / (np.abs(y).max() + 1e-9) * .9 * v
vine = lambda v=.9: clip('vine-boom', v)
bonk = lambda v=.6: clip('bonk', v * 1.2)
scratch = lambda v=.7: clip('record-scratch', v)
sad_trombone = lambda v=.5: clip('sad-trombone', v * 1.2)

# ── every cut: a whoosh; the big reveals: whoosh → boom
for k, t0 in enumerate(SCN): put(whoosh(.55, .8, 250, 5000 if k % 2 else 3000), t0 - .1, 1, (-1) ** k * .2)
for t0 in (T['out'], T['biggest'], VO['m17'] + .2): put(whoosh(.6, 1, 200, 4000), t0 - .55, 1, 0); put(boom(.9), t0, 1, 0)
# ── jokes and scene sounds
put(scratch(.8), T['gone'] - .05, 1, 0); put(glitch(.5, .45), T['dis'] - .05, 1, 0); put(poof(.6), T['dis'] + .1, 1, -.2); put(whoosh(1.6, .7, 150, 2500), .2, 1, 0); put(boom(.7), T['dis'] + .05, 1, 0)
put(click(.5), T['warning'] + .1, 1, .3); put(vine(.95), T['out'], 1, 0); put(poof(.6), T['out'] + .1, 1, .3); put(whoosh(.7, .9, 400, 7000), T['out'] + .05, 1, .5)
put(ding(1568, .55), T['cooked'], 1, 0); put(bonk(.6), T['cooked'] + .35, 1, 0)
put(stamp(.9), T['L'] - .02, 1, 0); put(waves(SCN[5] - SCN[2], .1), SCN[2], 1, 0)
put(whoosh(1.2, .6, 200, 2500), T['tugs'] - .3, 1, -.2)
put(womp(.55), T['half'] + .1, 1, 0)
put(underwater(SCN[6] - SCN[5] + .4, .12), SCN[5], 1, 0); put(whoosh(1.4, .5, 150, 1200), T['weaker'], 1, 0); put(bloop(.5), T['food'] + .45, 1, .2)
for k in range(10): put(crabclick(.35), T['crabs'] + k * .07, 1, .3)
put(scratch(.5), T['lose'] + .1, 1, 0)
for k in range(8): put(tick(.25), T['clocks'] - .2 + k * .25, 1, (-1) ** k * .3)
put(underwater(SCN[10] - SCN[7], .08), SCN[7], 1, 0)
for k in range(28): put(popf(.18, rng.uniform(900, 1600)), T['release'] - .4 + k * .07 + rng.uniform(0, .05), 1, rng.uniform(-.5, .5))
put(shimmer(1.6, .6), T['release'], 1, 0)
put(glitch(.6, .4), T['signal'], 1, 0); [put(popf(.25, 800), T['timing'] + k * .55, 1, rng.uniform(-.4, .4)) for k in range(5)]; put(glitch(.4, .5), T['apart'], 1, 0)
put(click(.7), T['darker'] - .05, 1, 0); put(owl(.3), T['darker'] + .6, 1, -.4); put(click(.7), T['full'] - .05, 1, 0)
put(ding(2093, .35), T['steady'], 1, 0)
put(wub(1.8, .5), T['wobble'], 1, 0); put(whoosh(.5, .8, 400, 6000), T['wobble'] + 1.3, 1, 0)
for k in range(int((SCN[14] - (T['wobble'] + 1.5)) * 1.2)): put(whoosh(.35, .45, 600, 6000), T['wobble'] + 1.5 + k / 1.2, 1, (-1) ** k * .3)
for k in range(int((SCN[15] - SCN[14]) * 1.6)): put(click(.5), SCN[14] + .3 + k / 1.6, 1, .2)
put(sad_trombone(.55), T['vibe'] + .05, 1, 0)
put(sigh(.45), T['spinning'] - .2, 1, 0); put(ding(2349, .5), T['spinning'] + .25, 1, 0)
put(vine(.9), T['carrying'], 1, 0)
# ── meme voice drops (recreated with Microsoft voices, see meme-vo/), placed in the pauses after the joke lines
D = json.load(open(os.path.join(HERE, 'voices/dur.json')))
def meme(name, speed=1.0):
    y, sr = sf.read(os.path.join(HERE, 'meme-vo', name + '.wav')); y = y.astype(np.float32) if y.ndim == 1 else y.mean(1).astype(np.float32)
    y = soxr.resample(y, sr, SR / speed)                             # speed > 1: faster and higher (chipmunk); < 1: slower and deeper
    return y / (np.abs(y).max() + 1e-9) * .9
end = lambda i: VO[i] + D[i]
def putm(x, t, g=1., pan=0.):
    if 0 <= t < DUR: add(mb, np.asarray(x, np.float32), t, g, pan)
putm(meme('bye', 1.1), end('m02') + .22, 1.8, .2)
putm(clip('oh-no'), end('m03') + .1, 1.1, 0)
putm(clip('oof'), end('m04') + .1, 1.2, 0); put(bonk(.4), end('m04') + .1, 1, 0)
putm(clip('bruh'), end('m07') + .1, 1.3, 0); put(vine(.7), end('m07') + .12, 1, 0)
putm(meme('damage', 1.0), end('m08') + .1, 1.2, 0); put(boom(.8), end('m08') + .55, 1, 0)
putm(meme('nah', .9), end('m15') + .1, 1.2, 0)
putm(meme('sheesh', 1.0), end('m17') + .15, 1.2, 0)
# ── louder classic meme stingers
def airhorn(v=.6):
    t = tt(1.1); x = sum(np.sign(np.sin(2 * np.pi * f * t)) for f in (466, 554, 622)) / 3; gate = np.zeros(len(t))
    for a0, a1 in ((0, .16), (.22, .38), (.45, 1.05)): gate[int(a0 * SR):int(a1 * SR)] = 1
    return lp(x * gate * (1 + .2 * np.sin(2 * np.pi * 9 * t)), 3500) * v * .5
def dundun(v=.5): return np.concatenate([bend(196, 196, .32, v), np.zeros(int(.06 * SR)), bend(185, 185, .32, v), np.zeros(int(.06 * SR)), bend(156, 150, 1.0, v)])
def errbeep(v=.4): t = tt(.5); return np.sign(np.sin(2 * np.pi * np.where(t < .2, 880, 660) * t)) * np.minimum(1, (.5 - t) / .05) * v * .25
airhorn = lambda v=.6: clip('airhorn', v * 1.1)
dundun = lambda v=.5: clip('dun-dun-dun', v * 1.2)
errbeep = lambda v=.4: clip('error', v * 1.3)
put(airhorn(.65), T['carrying'] + .1, 1, 0); put(dundun(.6), T['biggest'] - .1, 1, 0); put(errbeep(.5), T['apart'], 1, 0); put(errbeep(.4), T['signal'] + .1, 1, .2)
put(vine(1.0), T['out'] + .02, 1.3, 0)

# ── pops on every card, soft ticks on the gold caption words
for c in ('out', 'half', 'currents', 'pools', 'thousands', 'apart', 'hundred', 'tilt', 'seasons', 'millions', 'shuffle', 'vibe', 'spinning', 'carrying'): put(popf(.35, 760), T[c] - .05, 1, rng.uniform(-.3, .3))
words = json.load(open(os.path.join(HERE, 'voices/words.json')))
KEY = {'moon', 'gone', 'cooked', 'oceans', 'gravity', 'tides', 'sun', 'half', 'weaker', 'currents', 'food', 'crabs', 'snails', 'clocks', 'corals', 'moonlight', 'spawn', 'thousands', 'eggs', 'signal', 'darker', 'hundred', 'starlight', 'tilt', 'steady', 'seasons', 'wobble', 'millions', 'extremes', 'shuffle', 'panic', 'spinning', 'granted', 'carrying'}
for id_, ws in words.items():
    for w in ws:
        if ''.join(ch for ch in w[0].lower() if ch.isalnum()) in KEY: put(tick(.07), VO[id_] + max(0, w[1]), 1, rng.uniform(-.4, .4))

# ── voice, music (steady; ducked only a little), master
lines = json.load(open(os.path.join(HERE, 'lines.json'))); vm = np.zeros(NS, np.float32)
for Ln in lines:
    y, sr = sf.read(os.path.join(HERE, 'voices', Ln['id'] + '.wav')); y = soxr.resample(y.astype(np.float32), sr, SR); i = int(VO[Ln['id']] * SR); vm[i:i + len(y)] += y[:NS - i]
vm = hp(vm, 70); vm = compress(vm / (np.abs(vm).max() + 1e-9) * .8, thr=.2, ratio=3.0, att=.004, rel=.1).astype(np.float32)
vo[:, 0] = vm; vo[:, 1] = vm; vo = vo * .92 + SM.room(vo, size=.15, mix=.08) * .08
mus, _ = sf.read(os.path.join(HERE, 'music/score.wav')); mus = mus[:NS]
if len(mus) < NS: mus = np.pad(mus, ((0, NS - len(mus)), (0, 0)))
env = np.convolve(np.abs(vm), np.ones(int(.05 * SR)) / int(.05 * SR), 'same'); on = (env > .02).astype(np.float32)
dk = np.zeros(NS, np.float32); gk = 0.
for j in range(0, NS, 240): gk += (on[j] - gk) * (240 / int(.08 * SR) if on[j] > gk else 240 / int(.5 * SR)); dk[j:j + 240] = gk
mus = mus * (1 - (1 - db(-4)) * dk)[:, None]
def rms(x): m = np.abs(x).max(1) > 1e-4; return float(np.sqrt(np.mean(x[m] ** 2))) if m.any() else 1.
vr, mr, fr = rms(vo), rms(mus), rms(fx)
mix = vo + mus * (vr / mr) * db(-9) + fx * (vr / fr) * db(-9) + mb * (vr / rms(mb)) * db(-1)      # meme voice drops sit at voice level
mix = np.stack([limit(mix[:, c], .95) for c in range(2)], 1)
sf.write(os.path.join(HERE, 'mix.wav'), mix[:int(DUR * SR)].astype(np.float32), SR)
print('rms vo/music/fx dB', round(20 * np.log10(vr), 1), round(20 * np.log10(mr), 1), round(20 * np.log10(fr), 1))
