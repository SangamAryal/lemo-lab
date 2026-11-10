#!/bin/sh
# Render today's 2 "Did you know?" photos from facts.json (in order, skipping facts already used; state in used.txt).
#   sh make.sh [count=2]      → prints the paths of the new JPGs; warns when fewer than 10 unused facts remain.
set -e
HERE=$(cd "$(dirname "$0")" && pwd); LIB=${LIB:-/home/sangam/lemo-opuscar}; export LIB; export LEMO_ANGLE=${LEMO_ANGLE:-vulkan}
for d in "$HOME"/.nvm/versions/node/*/bin; do [ -x "$d/node" ] && NODEBIN=$d; done; PATH="$NODEBIN:$PATH"
N=${1:-2}; DAY=$(date +%F); touch "$HERE/used.txt"; mkdir -p "$HERE/out"
IDS=$(python3 -c "
import json; used=set(open('$HERE/used.txt').read().split()); ids=[f['id'] for f in json.load(open('$HERE/facts.json')) if f['id'] not in used]
print(' '.join(ids[:$N]))")
[ -z "$IDS" ] && { echo "NO_FACTS_LEFT"; exit 3; }
cd "$LIB"
for id in $IDS; do
  node core/render/still.mjs "$HERE" 0 --size 1080x1350 --q "fact=$id" --out "$HERE/out" --prefix "tmp_" > /dev/null
  mv "$HERE/out/tmp_0.jpg" "$HERE/out/${DAY}_$id.jpg"; echo "$id" >> "$HERE/used.txt"; echo "$HERE/out/${DAY}_$id.jpg"
done
LEFT=$(python3 -c "
import json; used=set(open('$HERE/used.txt').read().split()); print(sum(f['id'] not in used for f in json.load(open('$HERE/facts.json'))))")
[ "$LEFT" -lt 10 ] && echo "WARNING_FACTS_LEFT=$LEFT"
true
