import json, sys
subs = json.load(open(sys.argv[1]))
f = lambda t: '%02d:%02d:%02d,%03d' % (t // 3600, t % 3600 // 60, t % 60, round(t * 1000) % 1000)
open(sys.argv[2], 'w').write(''.join(f"{i+1}\n{f(s['t0'])} --> {f(s['t1'])}\n{s['text']}\n\n" for i, s in enumerate(subs))); print('srt', len(subs))
