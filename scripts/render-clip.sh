#!/usr/bin/env bash
# Type-check, render with the shared engine, master loudness, and write a contact sheet.
# Usage: scripts/render-clip.sh <slug>
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
SLUG="${1:?usage: render-clip.sh <slug>}"
CLIP="$ROOT/clips/$SLUG"
OUT="$CLIP/renders"
"$ROOT/scripts/prepare-clip.sh" "$SLUG"
"$ROOT/engine/node_modules/.bin/tsc" -p "$CLIP/tsconfig.json"
(cd "$ROOT/engine" && CLIP="$SLUG" npx remotion render Reel "$OUT/raw.mp4" --log=error)
"$ROOT/scripts/master.sh" "$OUT/raw.mp4" "$OUT/final.mp4"
"$ROOT/scripts/contact-sheet.sh" "$OUT/final.mp4" "$OUT/sheet.jpg"
echo "final: $OUT/final.mp4 ($(ffprobe -v error -show_entries format=duration -of csv=p=0 "$OUT/final.mp4") s)"
