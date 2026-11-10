#!/bin/sh
# Render today's TikTok carousel: the next unused topic from topics.json → 6 slides (cover + facts #5..#1).
#   sh make.sh               → prints the output folder; warns when fewer than 3 unused topics remain.
set -e
HERE=$(cd "$(dirname "$0")" && pwd); LIB=${LIB:-/home/sangam/lemo-opuscar}; export LIB; export LEMO_ANGLE=${LEMO_ANGLE:-vulkan}
for d in "$HOME"/.nvm/versions/node/*/bin; do [ -x "$d/node" ] && NODEBIN=$d; done; PATH="$NODEBIN:$PATH"
DAY=$(date +%F); touch "$HERE/used.txt"
TP=$(python3 -c "
import json; used=set(open('$HERE/used.txt').read().split()); ids=[t['id'] for t in json.load(open('$HERE/topics.json')) if t['id'] not in used]
print(ids[0] if ids else '')")
[ -z "$TP" ] && { echo "NO_TOPICS_LEFT"; exit 3; }
OUT="$HERE/out/${DAY}_$TP"; mkdir -p "$OUT"; cd "$LIB"
for s in 0 1 2 3 4 5; do
  node core/render/still.mjs "$HERE" 0 --size 1080x1440 --q "topic=$TP&slide=$s" --out "$OUT" --prefix "tmp_" > /dev/null
  mv "$OUT/tmp_0.jpg" "$OUT/0$((s + 1)).jpg"
done
echo "$TP" >> "$HERE/used.txt"; echo "$OUT"
LEFT=$(python3 -c "
import json; used=set(open('$HERE/used.txt').read().split()); print(sum(t['id'] not in used for t in json.load(open('$HERE/topics.json'))))")
[ "$LEFT" -lt 3 ] && echo "WARNING_TOPICS_LEFT=$LEFT"
true
