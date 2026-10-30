#!/usr/bin/env bash
# Render two stills per VO line (at 30% and 75% of the line) and tile them, for review before the full render.
# Usage: scripts/review-stills.sh <slug>
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
CLIP="$ROOT/clips/${1:?usage: review-stills.sh <slug>}"
"$ROOT/scripts/prepare-clip.sh" "$1"
OUT="$CLIP/renders/stills"
rm -rf "$OUT" && mkdir -p "$OUT"
FRAMES="$(node -e '
const [shots, vo] = [require(process.argv[1]), require(process.argv[2])];
const d = Object.fromEntries(vo.map((v) => [v.id, v.duration]));
let c = 0; const out = [];
for (const l of shots.lines) {
  const f = l.target ? Math.max(Math.round(l.target * 30), Math.ceil(d[l.id] * 30) + 3) : Math.ceil(d[l.id] * 30) + 9;
  out.push(c + Math.floor(f * 0.3), c + Math.floor(f * 0.75)); c += f;
}
console.log(out.join(" "));
' "$CLIP/shots.json" "$CLIP/public/vo/vo.json")"
cd "$ROOT/engine"
for f in $FRAMES; do CLIP="${1}" npx remotion still Reel "$OUT/s$(printf %05d "$f").jpg" --frame="$f" --log=error >/dev/null; done
ffmpeg -v error -y -pattern_type glob -i "$OUT/s*.jpg" -vf "scale=160:-1,tile=8x6" -frames:v 1 "$CLIP/renders/stills-sheet.jpg"
echo "review sheet: $CLIP/renders/stills-sheet.jpg"
