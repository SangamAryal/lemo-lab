#!/bin/sh
# render the five rounds (after tune.sh): level first last
B=${BLENDER:-/var/tmp/blender/blender-4.2.23-linux-x64/blender}; HERE=$(cd "$(dirname "$0")" && pwd)
while read L A Z; do
  O=/var/tmp/jd2-$L
  PF=$(python3 -c "import json;d=json.load(open('$O/track.json'));t=d['track'];p=d['pin'] or 0;f=[x['f'] for x in t if p and x['f']>p and x['z']<2.2];print(f[0]+2 if f else 1000000)")
  PFRAME=$PF $B -b -P $HERE/course2.py -- $L $O --scale 75 --first $A --last $Z > $O/render.log 2>&1 && echo "rendered $L $A-$Z"
done <<EOR
0 1 140
25 1 230
50 95 265
75 95 250
100 95 240
EOR
