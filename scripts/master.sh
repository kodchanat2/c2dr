#!/usr/bin/env bash
# Final loudness master for Shorts: -11 LUFS integrated, -1 dBTP (matches the references). Video stream is copied.
# Usage: scripts/master.sh <in.mp4> <out.mp4>
set -euo pipefail
IN="${1:?usage: master.sh <in.mp4> <out.mp4>}"
OUT="${2:?usage: master.sh <in.mp4> <out.mp4>}"
ffmpeg -v error -y -i "$IN" -c:v copy -af "loudnorm=I=-11:TP=-1:LRA=9" -c:a aac -b:a 192k "$OUT"
ffmpeg -nostats -i "$OUT" -af ebur128=framelog=quiet -f null - 2>&1 | grep -A6 Summary | grep "I:" | tr -s ' '
