#!/bin/sh
# "Mars Has a Clingy Moon" — flat-vector explainer, 1080×1920. Rebuilds the film from this folder.
#   sh build.sh [--vo]     (--vo regenerates the Kokoro bm_george narration; KOKORO=folder with kokoro-v1.0.onnx + voices-v1.0.bin)
# Needs: Node 20+, ffmpeg, uv, a GPU-capable headless Chrome (LEMO_ANGLE=vulkan on Linux), and the Lemo-Opuscar library (LIB).
# In a cloud session: LIB=$PWD/../tools/cloud-engine (see tools/cloud-engine/README.md).
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
[ -x "$LIB/.venv/bin/python" ] || PY=python3
SIZE="--size 1080x1920"
cd "$LIB"
if [ "$1" = "--vo" ]; then
  $PY "$HERE/voice_kokoro.py" "${KOKORO:-$HOME/kokoro}"   # Kokoro bm_george, the Moon-breakup voice
fi
node core/render/events.mjs "$HERE" $SIZE
$PY "$HERE/music.py"
$PY "$HERE/mix.py"
node core/render/video.mjs "$HERE" --fps 24 --workers 4 $SIZE --out "$HERE/out/video.mp4"
sh "$HERE/tools/mux.sh" "$HERE/out/video.mp4" "$HERE/mix.wav" "$HERE/clingy-moon.mp4" 24 1
node "$HERE/tools/subs.mjs" && $PY core/render/srt.py "$HERE/out/subs.json" "$HERE/clingy-moon.srt"
node core/render/still.mjs "$HERE" 4.6 $SIZE --out "$HERE/out" --prefix poster_
cp "$HERE/out/poster_4.6.jpg" "$HERE/poster.jpg"
node core/render/still.mjs "$HERE" 0 --page 'index.html?thumb=v' --out "$HERE/out" --prefix thumb_v_ && cp "$HERE/out/thumb_v_0.jpg" "$HERE/thumbnail.jpg"
node core/render/still.mjs "$HERE" 0 --page 'index.html?thumb=h' --out "$HERE/out" --prefix thumb_h_ && ffmpeg -y -loglevel error -i "$HERE/out/thumb_h_0.jpg" -vf "crop=1080:608:0:0,scale=1280:720" -q:v 2 "$HERE/thumbnail-16x9.jpg"
echo "done: $HERE/clingy-moon.mp4"
