#!/bin/sh
# "What If the Sun Vanished?" — flat-vector explainer, 1080×1920. Rebuilds the film from this folder.
#   sh build.sh [--vo]     (--vo regenerates the narration: Ryan +5% per line with tools/voice.py)
# Needs: Node 20+, ffmpeg, uv, a GPU-capable headless Chrome (LEMO_ANGLE=vulkan on Linux), and the Lemo-Opuscar library (LIB).
set -e
LIB=${LIB:-/home/sangam/lemo-opuscar}
HERE=$(cd "$(dirname "$0")" && pwd)
export LIB
export LEMO_ANGLE=${LEMO_ANGLE:-vulkan}
[ -f "$LIB/core/render/video.mjs" ] || { echo "set LIB to the library folder"; exit 1; }
if ! node -e 'process.exit(+process.versions.node.split(".")[0] < 20)' 2>/dev/null; then
  for d in "$HOME"/.nvm/versions/node/*/bin; do [ -x "$d/node" ] && NODEBIN=$d; done
  [ -n "$NODEBIN" ] && PATH="$NODEBIN:$PATH" || { echo "Node 20+ is needed"; exit 1; }
fi
PY="uv run --no-project --python $LIB/.venv/bin/python"
SIZE="--size 1080x1920"
cd "$LIB"
if [ "$1" = "--vo" ]; then
  $PY "$HERE/tools/voice.py" "$HERE"
fi
node core/render/events.mjs "$HERE" $SIZE
$PY "$HERE/music.py"
$PY "$HERE/mix.py"
node core/render/video.mjs "$HERE" --fps 24 --workers 4 $SIZE --out "$HERE/out/video.mp4"
sh "$HERE/tools/mux.sh" "$HERE/out/video.mp4" "$HERE/mix.wav" "$HERE/sun-vanished.mp4" 24 1
node "$HERE/tools/subs.mjs" && $PY core/render/srt.py "$HERE/out/subs.json" "$HERE/sun-vanished.srt"
node core/render/still.mjs "$HERE" 1.8 $SIZE --out "$HERE/out" --prefix poster_
cp "$HERE/out/poster_1.8.jpg" "$HERE/poster.jpg"
echo "done: $HERE/sun-vanished.mp4"
