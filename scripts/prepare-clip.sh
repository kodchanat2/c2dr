#!/usr/bin/env bash
# Restore a clip's generated/shared public assets (models, logo, SFX) and make sure the engine is installed.
# Called by render-clip.sh / review-stills.sh / still.sh, so a freshly cloned clip renders without extra steps.
# Usage: scripts/prepare-clip.sh <slug>
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
CLIP="$ROOT/clips/${1:?usage: prepare-clip.sh <slug>}"
[[ -f "$CLIP/shots.json" ]] || { echo "not a clip: $CLIP" >&2; exit 1; }
[[ -d "$ROOT/engine/node_modules" ]] || (cd "$ROOT/engine" && npm install --silent)
mkdir -p "$CLIP/public/brand" "$CLIP/public/vo" "$CLIP/public/bgm"
rsync -a "$ROOT/engine/sample/public/models/" "$CLIP/public/models/"
LOGO="$(node -e 'console.log(require(process.argv[1]).logo)' "$ROOT/config/brand.json")"
cp "$ROOT/$LOGO" "$CLIP/public/brand/logo.svg"
[[ -f "$CLIP/public/sfx/sting.wav" ]] || "$ROOT/scripts/sfx/generate-sfx.sh" "$CLIP/public/sfx" >/dev/null
[[ -f "$CLIP/public/vo/vo.json" ]] || echo "warning: no VO yet; run scripts/tts/generate-vo.mjs $CLIP/shots.json $CLIP/public/vo" >&2
