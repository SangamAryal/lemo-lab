#!/bin/sh
# bake every round; for soft rounds bake twice: first to find when it clears the neck, then with the re-inflation timed to that
B=${BLENDER:-/var/tmp/blender/blender-4.2.23-linux-x64/blender}; HERE=$(cd "$(dirname "$0")" && pwd)
for L in ${LEVELS:-0 25 50 75 100}; do
  O=/var/tmp/jd2-$L; mkdir -p $O; $B -b -P $HERE/course2.py -- $L $O --bake-only > $O/bake.log 2>&1
  if [ $L -gt 0 ]; then
    PF=$(python3 -c "
import json; d=json.load(open('$O/track.json')); t=d['track']; p=d['pin'] or 0
f=[x['f'] for x in t if x['f']>p and x['z']<2.2]; print(f[0]+2 if f else 1000000)")
    echo "level $L pin $(python3 -c "import json;print(json.load(open('$O/track.json'))['pin'])") passes_at $PF" > $O/pf.txt
    PFRAME=$PF $B -b -P $HERE/course2.py -- $L $O --bake-only > $O/bake2.log 2>&1
  fi
  python3 -c "
import json; t=json.load(open('$O/track.json'))['track']; print('L$L', [(x['f'],round(x['x'],2),round(x['z'],2),x['squash']) for x in t[0:240:12]])"
  cat $O/pf.txt 2>/dev/null
done
