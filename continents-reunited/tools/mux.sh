#!/bin/sh
# mux + master: two-pass loudnorm to -14 LUFS / TP -1.2, light grain, H.264 + AAC.
# Same recipe as the library's core/render/mux.sh, minus its decoded-length check, which misfires on ffmpeg 4.4
# (loudnorm's 3 s look-ahead makes -progress stop short of the real end).
#   sh tools/mux.sh video.mp4 mix.wav out.mp4 [fps=24] [grain=1]
set -e
V=$1; A=$2; O=$3; FPS=${4:-24}; GR=${5:-1}
M=$(ffmpeg -hide_banner -nostats -i "$A" -af loudnorm=I=-14:TP=-1.2:LRA=11:print_format=json -f null - 2>&1)
J=$(echo "$M" | sed -n '/{/,/}/p'); g() { echo "$J" | grep "\"$1\"" | sed 's/.*: "\(.*\)".*/\1/'; }
LN="loudnorm=I=-14:TP=-1.2:LRA=11:measured_I=$(g input_i):measured_TP=$(g input_tp):measured_LRA=$(g input_lra):measured_thresh=$(g input_thresh):offset=$(g target_offset):linear=true"
VD=$(ffprobe -v error -show_entries format=duration -of csv=p=0 "$V")
VF="fps=$FPS"; [ "$GR" = 0 ] || VF="$VF,noise=c0s=$GR:allf=t"
ffmpeg -y -loglevel error -i "$V" -i "$A" -filter_complex "[0:v]$VF,format=yuv420p[v];[1:a]$LN,aresample=48000,aformat=channel_layouts=stereo,apad=whole_dur=$VD[a]" \
  -map "[v]" -map "[a]" -c:v libx264 -preset slow -crf 19 -r "$FPS" -c:a aac -b:a 256k -movflags +faststart -shortest "$O"
echo "$O"
ffmpeg -hide_banner -nostats -i "$O" -af ebur128=peak=true -f null - 2>&1 | grep -E "^\s+(I|LRA|Peak):" | head -3
