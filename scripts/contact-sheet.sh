#!/usr/bin/env bash
# 24-frame contact sheet (6x4) spread evenly across a video, for visual review.
# Usage: scripts/contact-sheet.sh <in.mp4> <out.jpg>
set -euo pipefail
IN="${1:?usage: contact-sheet.sh <in.mp4> <out.jpg>}"
OUT="${2:?usage: contact-sheet.sh <in.mp4> <out.jpg>}"
DUR="$(ffprobe -v error -show_entries format=duration -of csv=p=0 "$IN")"
ffmpeg -v error -y -i "$IN" -vf "fps=24/$DUR,scale=180:-1,tile=6x4" -frames:v 1 "$OUT"
