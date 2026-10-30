#!/usr/bin/env bash
# Render one frame of a clip (or of its asset lab) with the shared engine.
# Usage: scripts/still.sh <slug> <frame> [Reel|AssetLab]
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
SLUG="${1:?usage: still.sh <slug> <frame> [Reel|AssetLab]}"
FRAME="${2:?usage: still.sh <slug> <frame> [Reel|AssetLab]}"
COMP="${3:-Reel}"
OUT="$ROOT/clips/$SLUG/renders/$(echo "$COMP" | tr "[:upper:]" "[:lower:]")-$FRAME.jpg"
"$ROOT/scripts/prepare-clip.sh" "$SLUG"
(cd "$ROOT/engine" && CLIP="$SLUG" npx remotion still "$COMP" "$OUT" --frame="$FRAME" --log=error)
echo "$OUT"
