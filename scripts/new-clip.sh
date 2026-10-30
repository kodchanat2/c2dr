#!/usr/bin/env bash
# Scaffold a new clip as a data folder rendered by the shared engine/ project (no per-clip node_modules):
#   clips/<slug>/{script.md, storyboard.md, NOTES.md, shots.json, storyboard.tsx, lab.tsx, sets/, public/, renders/, tsconfig.json}
# Usage: scripts/new-clip.sh <slug>
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
SLUG="${1:?usage: new-clip.sh <slug>}"
[[ "$SLUG" =~ ^[a-z0-9][a-z0-9-]*$ ]] || { echo "slug must be kebab-case: $SLUG" >&2; exit 1; }
CLIP="$ROOT/clips/$SLUG"
[[ -e "$CLIP" ]] && { echo "already exists: $CLIP" >&2; exit 1; }

mkdir -p "$CLIP"/{sets,renders}
cp "$ROOT/engine/sample/shots.json" "$ROOT/engine/sample/storyboard.tsx" "$ROOT/engine/sample/lab.tsx" "$CLIP/"
printf '# Script — %s\n\nStatus: draft\n' "$SLUG" > "$CLIP/script.md"
printf '# Storyboard — %s\n\nStatus: draft\n' "$SLUG" > "$CLIP/storyboard.md"
printf '# %s\n\n## Log\n' "$SLUG" > "$CLIP/NOTES.md"
cat > "$CLIP/tsconfig.json" <<'JSON'
{
  "extends": "../../engine/tsconfig.clip.json",
  "compilerOptions": {
    "paths": {
      "@clip/*": ["./*"],
      "@lib/*": ["../../engine/src/*"],
      "@config/*": ["../../config/*"],
      "*": ["../../engine/node_modules/@types/*", "../../engine/node_modules/*"]
    }
  },
  "include": ["*.ts", "*.tsx", "sets", "../../engine/src"]
}
JSON

# engine install (once, shared), models, logo, SFX
"$ROOT/scripts/prepare-clip.sh" "$SLUG"
echo "created $CLIP"
