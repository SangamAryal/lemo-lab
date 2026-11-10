#!/bin/sh
# "What If the Asteroid Had Missed Earth?" — rebuilds the film from this folder: prep (voices/timeline) → score → mix → video → mux.
set -e
LIB=${LIB:-/home/sangam/lemo-opuscar}; HERE=$(cd "$(dirname "$0")" && pwd); export LIB; export LEMO_ANGLE=${LEMO_ANGLE:-vulkan}
for d in "$HOME"/.nvm/versions/node/*/bin; do [ -x "$d/node" ] && NODEBIN=$d; done; PATH="$NODEBIN:$PATH"
PY=$LIB/.venv/bin/python
$PY "$HERE/prep.py" > /dev/null
$PY "$HERE/music.py"; $PY "$HERE/mix.py"
cd "$LIB"
node core/render/video.mjs "$HERE" --fps 30 --workers 4 --size 1080x1920 --out "$HERE/out/video.mp4"
sh "$HERE/tools/mux.sh" "$HERE/out/video.mp4" "$HERE/mix.wav" "$HERE/asteroid-missed.mp4" 30 1
# poster.jpg = a separately designed thumbnail (main.js ?thumb=1), not a frame from the film
node core/render/still.mjs "$HERE" 0 --size 1080x1920 --q "thumb=1" --out "$HERE/out" --prefix thumb_ && cp "$HERE/out/thumb_0.jpg" "$HERE/poster.jpg"
echo "done: $HERE/asteroid-missed.mp4"
