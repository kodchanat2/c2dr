---
name: 2d-reels
description: Create a Thai vertical short (YouTube Shorts / Reels / TikTok, 720×1280) in the 2D "what-if / explainer / story" style — flat vector scenes with depth blur, highlighted Thai subtitles, cream HUD info cards, Thai TTS narration, SFX and BGM. Use when the user asks to make a short video / reel / คลิปสั้น from a topic. Project-scoped (lives in this repo only; needs the repo's .env TTS key and assets/bgm). Stops once for user approval of the script.
---

# 2d-reels

Produces a finished `clips/<slug>/renders/final.mp4` from a topic. The repo root is the working directory. Read `CLAUDE.md` first; it holds the decisions this skill relies on.

Status: **v1, validated** by producing the cat-beatbox clip (2026-10-30). Clips are output and stay out of git.

## Hard rules

- **One approval gate.** Stop and wait for the user after the script (step 2). After approval, the storyboard is written and the build proceeds without waiting (user decision 2026-10-30); still show the storyboard summary in chat
- **Branding**: only `config/brand.json` and its logo. Never the reference channel's name or logo
- **Visuals are code-drawn**: SVG/React, or 3D via `@remotion/three` made to *look 2D* (toon shading)
  - No AI image generation
  - Hands are always the rigged `SkinnedHand`, never primitives
  - New third-party assets need a permissive license, and the license file goes next to the asset
- **Facts**: for science or what-if claims, compute the numbers and record the assumptions in `script.md`. For a deliberately absurd premise, keep it internally consistent and say it is fiction

## Workflow

### 1. Scaffold

```bash
scripts/new-clip.sh <slug>          # kebab-case slug
```

This creates `clips/<slug>/` as a **data folder**, rendered by the shared `engine/` Remotion project. There is one `node_modules`, in `engine/`, installed on first use. Contents:

- `script.md`, `storyboard.md`, `NOTES.md`
- `shots.json`, `storyboard.tsx`, `lab.tsx`, `sets/` (clip-only components)
- `public/`: `vo/`, `bgm/`; `sfx/`, `models/` and `brand/` are restored automatically by `scripts/prepare-clip.sh`
- `renders/`, `tsconfig.json`

Clip code imports the library through aliases:

- `@lib/…` → `engine/src`
- `@clip/…` → the clip folder
- `@config/…` → `config/`

### 2. Script → **STOP for approval**

Write `clips/<slug>/script.md`:

- **Structure: Hook → Context → Reveal/Twist** (optionally a closing line). The beats and wording are free; the concept is not. Default: the clip resolves on its own, with no "next episode" teaser unless asked
- **Length**: target a 55–65 s finished clip
  - Estimate: **clip ≈ chars ÷ 12.5 + 0.3 s × lines + 3 s** (end card). VO at the default 1.35× tempo runs ~12.5 Thai chars/s; each line adds a 0.3 s gap
  - So a 60 s clip ≈ **600–650 visible chars** over 16–20 lines (cat-beatbox: 806 chars / 20 lines → 73 s, too long)
  - Lines of 25–40 chars; one line ≈ one shot ≈ 2.5–4 s
  - State the estimate in `script.md` and offer cuts if over
- **Table columns**: # · Beat · VO (Thai) · Highlight words and colour · HUD number
- **Highlight colours**: yellow = key fact/number; red = danger/twist; red box `{R:}` = the punchline of a beat (1–3 per clip)
- **HUD numbers**: give every number a unit and a short EN caps label

Show the user the script in chat (compact list) and wait.

### 3. Storyboard (no approval wait)

Write `clips/<slug>/storyboard.md` with one row per cut:

| # | ~Dur | Set | Visual/motion | HUD card | Highlight | SFX |
|---|---|---|---|---|---|---|

- Reuse library sets first (`references/components.md`). Mark anything new as **NEW ASSET**
- Split long lines into `a`/`b` cuts so no shot exceeds ~4 s
- List the BGM choice (files under `assets/bgm/<mood>/`) and which line the twist track starts on

Show the user a compact version, then continue straight to step 4.

### 4. Data + VO

1. Write `clips/<slug>/shots.json`. The schema is in `references/shots-schema.md`
   - Subtitle chunks use the markup `{y:…}` `{r:…}` `{R:…}`
   - Use `say` when the spoken form differs from the subtitle (e.g. `09:00` → `เก้าโมงเช้า`)
2. Choose the voice and persona in `shots.json`
   - `voice`: **Charon** (most stable)
   - `style`: a persona that fits the genre (calm documentary, playful mock-serious, tense). Always keep the "same pitch and energy on every line" sentence
3. Generate the VO (Gemini Live, single session, pitch QA, default 1.35× tempo, truncated takes retried):
   ```bash
   node scripts/tts/generate-vo.mjs clips/<slug>/shots.json clips/<slug>/public/vo
   ```
   - Check the last line: total seconds and F0 range. Calm personas give a spread of ~20 Hz; playful ones ~30 Hz
   - If one line is an outlier, delete its `<id>.raw.wav` and re-run (other lines are cached). `--force` regenerates everything
4. Copy the chosen BGM tracks:
   ```bash
   cp assets/bgm/<mood>/<file> clips/<slug>/public/bgm/main.mp3
   cp assets/bgm/<mood>/<file> clips/<slug>/public/bgm/twist.mp3   # optional
   ```
   Then set `bgm.twistLine` in `shots.json`

### 5. Build scenes

1. Replace `clips/<slug>/storyboard.tsx` with one entry per line id. Import the library via `@lib/components/...` and `@lib/theme`
   - Worked examples:
     - `examples/moon.storyboard.tsx`: space + rooftop sets, HUD via `hud`
     - `examples/nuclear.storyboard.tsx`: cards as JSX, 3D hands/phone, smoke
     - `examples/cat-beatbox.storyboard.tsx` (+ `cat-beatbox.shots.json`): characters (cats + person), living room, box, blackout city
2. Put **NEW ASSETs** in `clips/<slug>/sets/<Name>.tsx` and import them as `@clip/sets/<Name>`
   - Build each one in `clips/<slug>/lab.tsx` first (export `AssetLab`). Render it with `scripts/still.sh <slug> 0 AssetLab` → `renders/assetlab-0.jpg`. Iterate until it reads well
   - Follow the style rules in `references/style.md` (depth blur, toon 3D, palette, chrome)
3. Type-check: `engine/node_modules/.bin/tsc -p clips/<slug>/tsconfig.json`

### 6. Review stills before the full render

```bash
scripts/review-stills.sh <slug>     # 2 stills per line → renders/stills-sheet.jpg
```

- Open the sheet and check:
  - subtitle legibility, and subtitles on faces
  - card overlap
  - character/hand anatomy
  - framing (crops, props in corners)
  - empty-looking frames
- Fix, then re-check single frames with `scripts/still.sh <slug> <frame>`
- In cat-beatbox this pass caught two real problems before the full render

### 7. Render + master + contact sheet

```bash
scripts/render-clip.sh <slug>
```

This writes `renders/final.mp4` (−11 LUFS), `renders/sheet.jpg` (24 frames). Open the sheet and look at it. Report to the user:

- Path, duration and loudness
- What you checked
- Known weak shots, honestly

Record learnings in `clips/<slug>/NOTES.md`.

### 8. Grow the library

- Move reusable new assets from `clips/<slug>/sets/` into `engine/src/components/` and update the clip's imports to `@lib/...`
- Then make sure the engine and **every** clip still type-check, because all clips share the library:
  - `cd engine && npx tsc --noEmit`
  - for each clip: `engine/node_modules/.bin/tsc -p clips/<clip>/tsconfig.json`
- Add them to `references/components.md`
- Add any new failure + fix to the table below

## When things go wrong

| Symptom | Fix |
|---|---|
| TTS reads the style text aloud | You used a generateContent TTS model. Use `generate-vo.mjs` (Live API, style goes in the system instruction) |
| Narrator sounds like a different person mid-clip | Re-run `generate-vo.mjs`; it keeps one session and re-takes pitch outliers. Delete `<id>.raw.wav` to force a fresh take |
| `Cannot find module '@clip/…'` or a package from a clip file | Render through the scripts (they set `CLIP` and run inside `engine/`); type-check with the clip's `tsconfig.json` |
| 3D object missing in stills | Async loads must use `delayRender` at **module scope** (see `SkinnedHand.tsx`), not inside the R3F tree |
| Fingers don't bend | The WebXR hand rig has no joint hierarchy; pose via `SKIN_POSES` / `poseChain` only |
| Thai word breaks mid-word in a highlight | Highlight spans are `nowrap`; shorten the chunk |
| VO pitch spread is wide (>~35 Hz) | Expressive personas (and the Puck voice) drift more. Prefer Charon; delete the outlier's `<id>.raw.wav` and re-run |
| Subtitle covers a face | The subtitle band sits at y ≈ 780–860. Keep faces below ~880 (characters standing on the floor) or above ~700 |
| Emoji missing in render | Headless Chrome may lack an emoji font. Draw the icon in SVG |
| Clip too long | Trim script text (fastest), split fewer cuts, or lower `LINE_GAP_FRAMES` |
