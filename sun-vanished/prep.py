"""Cut the one-take ElevenLabs narration into the script's lines → voices/sXX.wav, voices/dur.json, voices/words.json.
   python prep.py voices/narration.mp3
Line cuts: the pauses between paragraphs, chosen to sit closest to where the script's text says each line should end.
Word times: each line's voiced time is shared out by word length, and the words that end in punctuation snap to the
pauses inside the line. Good enough for word-pop captions and animation cues; an ASR pass can replace it later."""
import json, os, subprocess, sys, numpy as np, soundfile as sf
HERE = os.path.dirname(os.path.abspath(__file__)); SR = 48000; HOP = int(.01 * SR)
src = sys.argv[1] if len(sys.argv) > 1 else os.path.join(HERE, 'voices/narration.mp3')
raw = subprocess.run(['ffmpeg', '-v', 'error', '-i', src, '-ac', '1', '-ar', str(SR), '-f', 'f32le', '-'], capture_output=True, check=True).stdout
y = np.frombuffer(raw, np.float32).copy()
lines = json.load(open(os.path.join(HERE, 'lines.json')))
n = len(y) // HOP; e = np.sqrt(np.mean(y[:n * HOP].reshape(n, HOP) ** 2, 1)) + 1e-9
db = 20 * np.log10(e / e.max()); voiced = db > -38
def runs(mask):                                                   # [(start, end)] of True runs, in frames
    d = np.diff(np.r_[0, mask.astype(int), 0]); return list(zip(np.where(d == 1)[0], np.where(d == -1)[0]))
sil = [(a, b) for a, b in runs(~voiced) if b - a >= 22 and a > 0 and b < n]   # pauses ≥ 0.22 s inside the take
v0, v1 = runs(voiced)[0][0], runs(voiced)[-1][1]
# where each line should end if speech were spread by characters
ch = np.array([len(l['text']) + 12 for l in lines], float); exp = v0 + (v1 - v0) * np.cumsum(ch)[:-1] / ch.sum()
cand = [((a + b) / 2, b - a) for a, b in sil]; K = len(lines) - 1
# DP: pick K pauses in order, cost = distance from the expected cut (in s²) − a bonus for long pauses
INF = 1e18; C = len(cand); best = np.full((K + 1, C + 1), INF); arg = np.zeros((K + 1, C + 1), int); best[0, :] = 0
for k in range(1, K + 1):
    for j in range(k, C + 1):
        m, l = cand[j - 1]; c = ((m - exp[k - 1]) / 100) ** 2 / 4 - np.log(l / 22) * 1.5
        p = best[k - 1, k - 1:j]; i = int(np.argmin(p)); best[k, j] = p[i] + c; arg[k, j] = i + k - 1
j = int(np.argmin(best[K, K:])) + K; cuts = []
for k in range(K, 0, -1): cuts.append(cand[j - 1]); j = arg[k, j]
cuts = cuts[::-1]
bounds = [v0] + [int(m) for m, _ in cuts] + [v1]
os.makedirs(os.path.join(HERE, 'voices'), exist_ok=True); dur, words = {}, {}
for i, L in enumerate(lines):
    a, b = bounds[i], bounds[i + 1]
    vv = voiced[a:b]; r = runs(vv); s0, s1 = a + r[0][0], a + r[-1][1]           # trim to the speech
    s0 = max(0, s0 - 4); s1 = min(n, s1 + 8)
    seg = y[s0 * HOP:s1 * HOP].copy(); f = int(.008 * SR); seg[:f] *= np.linspace(0, 1, f); seg[-f:] *= np.linspace(1, 0, f)
    sf.write(os.path.join(HERE, 'voices', L['id'] + '.wav'), seg, SR); dur[L['id']] = round(len(seg) / SR, 3)
    # words: share the voiced frames by length; punctuation words end at an inner pause when one is near
    vm = voiced[s0:s1]; inner = [((p + q) / 2) for p, q in runs(~vm) if q - p >= 10 and p > 0 and q < len(vm)]
    ws = L['text'].split(); wt = np.array([len(w.strip('.,:?!')) + 1.5 for w in ws], float)
    cum = np.cumsum(vm) ; tot = cum[-1]
    def frame_at(v): return int(np.searchsorted(cum, v))
    ends = [frame_at(tot * x) for x in np.cumsum(wt) / wt.sum()]
    for k, w in enumerate(ws[:-1]):
        if w[-1] in '.,:?!' and inner:
            p = min(inner, key=lambda z: abs(z - ends[k]))
            if abs(p - ends[k]) < 45: ends[k] = int(p)
    ends = list(np.maximum.accumulate(ends)); out = []; st = int(np.argmax(vm))
    for k, w in enumerate(ws):
        t0 = st if k == 0 else ends[k - 1]
        if k > 0:                                                  # skip a pause before the word
            while t0 < len(vm) - 1 and not vm[t0] and t0 < ends[k] - 3: t0 += 1
        out.append([w, -0.6 if k == 0 else round(t0 / 100, 3), round(ends[k] / 100, 3)])
    words[L['id']] = out
json.dump(dur, open(os.path.join(HERE, 'voices/dur.json'), 'w'), indent=1)
json.dump(words, open(os.path.join(HERE, 'voices/words.json'), 'w'), indent=0)
print('lines', len(lines), 'total', round(sum(dur.values()), 2), 's'); print({k: v for k, v in dur.items()})
