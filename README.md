# lemo-lab

Films and posts for the **Beyond Everything** science channel (YouTube Shorts, TikTok, Facebook).

Each film folder (e.g. `asteroid-missed/`, `no-tilt/`) holds the script (`lines.json`, `SCRIPT.md`),
the Canvas scene code (`main.js`), music/SFX synths (`music.py`, `mix.py`) and `build.sh`.
Rendering uses the engine in `~/lemo-opuscar` (not in this repo). Audio and video outputs are
git-ignored; run `sh build.sh` in a film folder to rebuild them.

`posts/` holds the daily fact photos and TikTok carousel automation.
