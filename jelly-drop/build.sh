#!/bin/sh
# Jelly Drop test — rebuild the film from the Blender frames (render them first with course.py; see its header).
set -e
LIB=${LIB:-/home/sangam/lemo-opuscar}; HERE=$(cd "$(dirname "$0")" && pwd); export LIB; export LEMO_ANGLE=${LEMO_ANGLE:-vulkan}
for d in "$HOME"/.nvm/versions/node/*/bin; do [ -x "$d/node" ] && NODEBIN=$d; done; PATH="$NODEBIN:$PATH"
PY="uv run --no-project --python $LIB/.venv/bin/python"; SIZE="--size 1080x1920"; cd "$LIB"
node core/render/events.mjs "$HERE" $SIZE
$PY "$HERE/music.py"; $PY "$HERE/mix.py"
node core/render/video.mjs "$HERE" --fps 30 --workers 4 $SIZE --out "$HERE/out/video.mp4"
sh "$HERE/tools/mux.sh" "$HERE/out/video.mp4" "$HERE/mix.wav" "$HERE/jelly-drop-test.mp4" 30 1
echo "done: $HERE/jelly-drop-test.mp4"
