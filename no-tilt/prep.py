"""voices/dur.json → timeline.json: when each narration line starts. Extra room at each quest change.
Word timings come from speech recognition; the spelling is taken back from the script so the subtitles match it."""
import json, os
HERE = os.path.dirname(os.path.abspath(__file__)); L = json.load(open(os.path.join(HERE, 'lines.json'))); D = json.load(open(os.path.join(HERE, 'voices/dur.json')))
EXTRA = {'l02': .45, 'l03': .15, 'l04': .25, 'l05': .7, 'l06': .3, 'l07': .5, 'l08': .2, 'l09': .3, 'l10': .7, 'l11': .2, 'l12': .25, 'l13': .8, 'l14': .25, 'l15': .3, 'l16': .7}
t, out = .15, []
for l in L:
    t += EXTRA.get(l['id'], 0); out.append({'id': l['id'], 't': round(t, 3), 'd': D[l['id']]}); t += D[l['id']] + .32
json.dump({'lines': out, 'dur': round(t + 2.6, 2)}, open(os.path.join(HERE, 'timeline.json'), 'w')); print('dur', round(t + 2.6, 2))
W = json.load(open(os.path.join(HERE, 'voices/words.json')))
for l in L:
    ws, tx = W[l['id']], l['text'].split()
    if len(ws) == len(tx): W[l['id']] = [[s, w[1], w[2]] for s, w in zip(tx, ws)]
    else: print('word count differs, kept as heard:', l['id'], len(ws), len(tx))
json.dump(W, open(os.path.join(HERE, 'words.json'), 'w'), ensure_ascii=False)
