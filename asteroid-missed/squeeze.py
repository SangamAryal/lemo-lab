"""raw/<id>.wav → voices/<id>.wav: only over-long pauses are shortened, to a natural breath at each full stop (0.42 s), and
commas are left alone. Questions and dramatic lines keep a longer beat. Then a fresh dur.json."""
import json, os, numpy as np, soundfile as sf
HERE = os.path.dirname(os.path.abspath(__file__)); SR = 24000
KEEP = {'l14': .55, 'l03': .55, 'l07': .55, 'l15': .55}   # questions and dramatic lines keep a longer beat
def squeeze(w, maxgap, thr=.012):
    win = int(.01 * SR); n = len(w) // win; e = np.array([np.abs(w[i*win:(i+1)*win]).max() for i in range(n)]); out = []; i = 0
    while i < n:
        if e[i] < thr:
            j = i
            while j < n and e[j] < thr: j += 1
            out.append(w[i*win:(i + min(j - i, int(maxgap / .01)))*win]); i = j
        else: out.append(w[i*win:(i+1)*win]); i += 1
    return np.concatenate(out + [w[n*win:]])
D = {}
for l in json.load(open(os.path.join(HERE, 'lines.json'))):
    w, sr = sf.read(os.path.join(HERE, 'raw', l['id'] + '.wav')); w = squeeze(w, KEEP.get(l['id'], .42))
    sf.write(os.path.join(HERE, 'voices', l['id'] + '.wav'), w.astype(np.float32), SR); D[l['id']] = round(len(w) / SR, 3)
json.dump(D, open(os.path.join(HERE, 'voices/dur.json'), 'w')); print(round(sum(D.values()), 1), 's speech')
