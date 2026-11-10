"""Voice lines → voices/<id>.wav (pauses inside a line squeezed to 0.12 s), timeline.json (when each line starts) and
mouth.json (each line's loudness at 30 Hz, so the speaking planet's mouth moves with its voice)."""
import json, os, numpy as np, soundfile as sf
HERE = os.path.dirname(os.path.abspath(__file__)); SR = 24000
src = os.path.join(HERE, 'wav')
L = json.load(open(os.path.join(HERE, 'lines.json')))
def squeeze(w, thr=.012, maxgap=.2):
    win = int(.01 * SR); n = len(w) // win; e = np.array([np.abs(w[i*win:(i+1)*win]).max() for i in range(n)]); out = []; i = 0
    while i < n:
        if e[i] < thr:
            j = i
            while j < n and e[j] < thr: j += 1
            out.append(w[i*win:(i + min(j - i, int(maxgap / .01)))*win]); i = j
        else: out.append(w[i*win:(i+1)*win]); i += 1
    return np.concatenate(out + [w[n*win:]])
# extra breathing room before some lines (seconds, on top of the 0.12 s gap)
EXTRA = {'02': .25, '03': .3, '04': .45, '05': .3, '06': .4, '07': .4, '08': .4, '09': .3, '10': .55, '11': .3, '12': .3, '13': .5, '14': .35}
lines, t = [], .35
done = set()
for l in L:
    i = l['id']
    if len(i) > 2:                                              # a group line (e.g. 10a, 10b…) = several voices at once
        if i[:2] in done: continue
        done.add(i[:2]); ws = [sf.read(os.path.join(src, x['id'] + '.wav'))[0] for x in L if x['id'][:2] == i[:2] and len(x['id']) > 2]
        w = np.zeros(max(len(x) for x in ws))
        for x in ws: w[:len(x)] += x * .6
        i, who, text = i[:2], 'all', l.get('group_text', 'WHAT?!')
    else: w = squeeze(sf.read(os.path.join(src, i + '.wav'))[0]); who, text = l['who'], l['text']
    t += EXTRA.get(i, 0)
    sf.write(os.path.join(HERE, 'voices', i + '.wav'), w.astype(np.float32), SR)
    hop = SR // 30; env = [float(np.sqrt(np.mean(w[k:k+hop] ** 2))) for k in range(0, len(w), hop)]; m = max(env) or 1
    lines.append({'id': i, 'who': who, 'text': text, 't': round(t, 3), 'd': round(len(w) / SR, 3), 'mouth': [round(min(1, e / m * 1.4), 2) for e in env]})
    t += len(w) / SR + .22
json.dump({'lines': lines, 'dur': round(t + 2.2, 2)}, open(os.path.join(HERE, 'timeline.json'), 'w'))
print('dur', round(t + 2.2, 2)); [print(x['id'], x['who'], x['t'], x['d']) for x in lines]
