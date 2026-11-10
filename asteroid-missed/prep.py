"""voices/dur.json → timeline.json: when each narration line starts. Extra room at each quest change."""
import json, os
HERE = os.path.dirname(os.path.abspath(__file__)); L = json.load(open(os.path.join(HERE, 'lines.json'))); D = json.load(open(os.path.join(HERE, 'voices/dur.json')))
EXTRA = {'l02': .2, 'l04': .35, 'l05': .1, 'l06': .15, 'l07': .6, 'l08': .25, 'l09': .15, 'l10': .15, 'l11': .6, 'l12': .35, 'l13': .15, 'l14': .15, 'l15': .8, 'l16': .25, 'l17': .3}
t, out = .15, []
for l in L:
    t += EXTRA.get(l['id'], 0); out.append({'id': l['id'], 't': round(t, 3), 'd': D[l['id']]}); t += D[l['id']] + .32
json.dump({'lines': out, 'dur': round(t + 2.4, 2)}, open(os.path.join(HERE, 'timeline.json'), 'w')); print('dur', round(t + 2.4, 2))
# word timings come from speech recognition: fix its spelling so the subtitles match the script
W = json.load(open(os.path.join(HERE, 'voices/words.json')))
FIX = {'kilometers': 'kilometres', 'sulphur': 'sulfur', 'sun': 'Sun', 'animal': 'animals', 'earth': 'Earth', "earth's": "Earth's"}
for id_, ws in W.items():
    out2 = []
    for w in ws:
        s = w[0]; core = s.rstrip('.,?!'); tail = s[len(core):]
        if core.lower() in FIX and not (id_ != 'l08' and core.lower() == 'animal'): s = FIX[core.lower()] + tail
        if out2 and (s.startswith('-') or s.startswith('%')): out2[-1][0] += s; out2[-1][2] = w[2]; continue
        if out2 and out2[-1][0].lower() == 'oil' and core.lower() == 'rich': out2[-1][0] = 'oil-rich' + tail; out2[-1][2] = w[2]; continue
        out2.append([s, w[1], w[2]])
    W[id_] = out2
json.dump(W, open(os.path.join(HERE, 'words.json'), 'w'), ensure_ascii=False)
