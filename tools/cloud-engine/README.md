# cloud-engine — a stand-in for ~/lemo-opuscar

Cloud sessions don't have the Lemo-Opuscar library, so this is a minimal stand-in with the same interface the
film folders use: `core/lib.js`, `core/render/{page,events,video,still}.mjs`, `core/render/srt.py`,
`core/audio/{sfx,sampler}.py`. It renders with the preinstalled Playwright Chromium and ffmpeg.

    export LIB=$PWD/tools/cloud-engine
    pip install numpy scipy soundfile soxr
    cd sun-vanished && node $LIB/core/render/events.mjs . && python3 music.py && python3 mix.py
    node $LIB/core/render/video.mjs . --fps 24 --workers 4 --out out/video.mp4
    sh tools/mux.sh out/video.mp4 mix.wav sun-vanished.mp4 24 1

On your own machine, keep using the real library (`LIB=~/lemo-opuscar sh build.sh`); its mix will sound a little different.
