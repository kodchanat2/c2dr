# claude-video

## Goal

Build a Claude Skill that produces Thai YouTube Shorts mimicking the style of the reference videos in `docs/resource/resource.md` (8 clips from one channel, files in `docs/resource/videos/`, thumbnails in `docs/resource/thumbnails/`). The reference media is local-only, not in git.

**Status (2026-10-30)**: the skill exists and is validated. It is **`2d-reels`** at `.claude/skills/2d-reels/`; to make a clip, follow `SKILL.md`. The research phase (experiments 01–03) is done; new work happens as clips plus library improvements. Claude may freely create and update project-level Markdown (`CLAUDE.md`, `AGENTS.md`, `docs/**`) to record findings, decisions, and conventions.

## Project layout

| Path | What |
|---|---|
| `.claude/skills/2d-reels/` | The skill: `SKILL.md` (workflow), `references/` (components, shots schema, style rules), `examples/` (worked storyboards) |
| `engine/` | The **one** Remotion project (one `node_modules`) that renders every clip. Contents: component library `src/components/`, timeline, VO/BGM/SFX wiring, `sample/` clip. `CLIP=<slug>` selects the clip; aliases are `@clip`, `@lib`, `@config` (`remotion.config.ts`) |
| `clips/<slug>/` | **Output, local only (gitignored).** One clip, data only (a few MB): `script.md`, `storyboard.md`, `NOTES.md`, `shots.json`, `storyboard.tsx`, `lab.tsx`, `sets/`, `public/` (vo/bgm/sfx/models/brand all gitignored), `renders/` (gitignored), `tsconfig.json` |
| `scripts/` | `new-clip.sh`, `prepare-clip.sh`, `still.sh`, `review-stills.sh`, `render-clip.sh`, `master.sh`, `contact-sheet.sh`, `tts/`, `sfx/`, `research/` |
| `experiments/01–03` | **Local only, not in git.** Research used to build the skill: moon what-if → visual fidelity → shot-for-shot nuclear recreation. Their `NOTES.md` explain why things are the way they are; the durable conclusions are already folded into this file and the skill |
| `config/brand.json`, `assets/brand/` | Branding (mock "Lumo") |
| `assets/bgm/<mood>/` | User-supplied music (gitignored) |
| `docs/research/` | Durable findings (pacing) |

## Reference style (observed 2026-10-30)

**Format**
- 720×1280, 30fps, h264 + aac
- 43–71s typical (one horror clip is 159s)
- Cut every ~2.5–4s (15–35 scene cuts per clip)
- Continuous Thai voiceover + BGM, no silent gaps

**Visuals**
- Flat 2D vector illustration with blurred background (depth-of-field look)
- Puppet-rigged characters with joint rotation (limbs swing, simple gestures)
- Centered Thai subtitle per phrase; keywords highlighted yellow or red, or boxed in red
- Cream HUD cards in the top area. Each card has a Thai label plus an ENGLISH SMALL-CAPS sublabel. Card contents: clock time, rule number, counters, stats, progress bars, rankings
- Recurring props: phone-in-hand UI, blue blueprint/map diagrams, paper notes or contracts, polaroids
- End card: series name, EP number, "ตอนต่อไป" teaser
- Channel watermark and logo in the top-right. Do NOT copy the original "Sigma Lens"/"Real Lens" branding; use the user's own

**Narrative concept** (keep the concept; wording and beats are free)
- Hook → Context → Reveal/Twist, optionally a cliffhanger to the next EP
- The references' phrasings ("ถ้าคุณ…", "กฎข้อแรก", timeline beats like 06:00 → 08:00) are examples, not a fixed template

**Genre**: anything, chosen to fit the clip's topic. The references happen to cover three sub-genres:
1. Simulation (`MzxTUWsUpyU`, `mA8DIyqvuQI`, `QU-UpzmDG1M`, `P18OWp6TMXk`)
2. Explainer, with bilingual TH/EN subtitles (`848Pu0D6Wfc`, `IMn4l_dJLEw`)
3. Horror (`XcFwcSwGNjo`, `WdCM-5tJpww`). `WdCM-5tJpww` differs: subtitles sit in a black box and there are no HUD cards

## Decisions (2026-10-30)

- **Visuals**: Claude draws everything as code; no AI image generation. Extra Claude plugins/skills are allowed: the official Remotion plugin, the local `remotion-video-creation` skill, `video-editing`
  - Since 2026-10-30, 3D is allowed **as long as it looks 2D** (user decision, exp 03 path B): `@remotion/three` with toon shading (banded gradient, rim light, ink outline). Use it for hands, close-up props and smoke
  - Permissively licensed 3D assets are OK when needed for anatomy (e.g. WebXR `generic-hand`, MIT). Always copy the license next to the asset
  - Hands must use a real rigged mesh, never primitives (procedural capsule hands looked like Pinocchio)
- **TTS**: Google, free-tier API key in `.env` as `GEMINI_API_KEY` (template: `.env.example`)
  - Use the **Gemini Live API** with model `gemini-3.8-live` (user's choice; it does not hit the free-tier limit). Adapter: `scripts/tts/gemini-live-tts.mjs`
  - Batch generation: `scripts/tts/generate-vo.mjs`
    - Uses **one Live session for all lines**; separate sessions made the narrator sound like a different person
    - Re-takes pitch (F0) outliers and truncated takes
    - Trims silence, normalises loudness, applies `atempo` (default 1.35, cap 1.5; optional per-line `target`)
    - Writes `vo.json`
  - The speaking style goes in the Live **system instruction**. With the generateContent TTS models (`gemini-3.8-flash-tts` etc.), style text put in the prompt gets read aloud, so don't use them for styled narration
  - Thai is verified to work and is read verbatim (back-checked with whisper). Default voice: **Charon**; Puck and expressive personas drift in pitch
- **Autonomy**: the skill MUST stop for user approval of the **script**. The storyboard no longer needs approval (user, 2026-10-30): write it, show a summary, continue
- **Skill location**: `.claude/skills/2d-reels/` in this repo only (never install globally): it depends on this repo's `.env`, `assets/bgm/`, `engine/` and `scripts/`
- **Branding**: mock only for now. Name "Lumo", logo `assets/brand/logo.svg`. Never use the reference channel's branding
- **Branding config**: `config/brand.json` (channelName, logo, watermark, endCardHandle)
- **BGM**: users drop files into `assets/bgm/<mood>/` (mystery, horror, funny, epic, chill, tech). Audio files are gitignored
- **SFX**: synthesized with ffmpeg (`scripts/sfx/generate-sfx.sh`, 19 sounds), so there are no license issues
- **Audience**: the repo is shared so others can re-create clips. `README.md` is the user-facing setup guide; keep it in sync when setup steps change

## Research tooling (experimental — never mention in README)

- `faster-whisper` lives in `.venv-research/` (gitignored)
- Transcribe the references with `.venv-research/bin/python -I scripts/research/transcribe.py docs/resource/videos docs/research/transcripts`
- The transcribe script uses model `large-v3-turbo` and writes word timestamps to `docs/research/transcripts/<id>.json` and `.txt`
- Use this only to study the references' pacing and wording, never as part of the skill pipeline

## Environment

- Available: `ffmpeg` and `ffprobe` (Homebrew), `python3`, `node`
- Not installed: `yt-dlp`

## Conventions

- **Clips**: make them through the `2d-reels` skill into `clips/<slug>/`. Clips are output and never committed; a clip worth keeping as a reference goes into `.claude/skills/2d-reels/examples/` (storyboard + shots). Log learnings in the clip's `NOTES.md`, and fold reusable assets and fixes back into `engine/` and the skill (`SKILL.md` step 8)
- **No per-clip node_modules.** Clips never get their own Remotion project (copying one per clip cost 1.2 GB each; user decision 2026-10-30). Everything renders through `engine/`
- **Experiments**: only for open research questions, under `experiments/<NN>-<slug>/` with a `NOTES.md` (goal, result, next step). Never commit them; put conclusions worth keeping into `CLAUDE.md`, the skill, or `docs/research/`
- **Findings**: durable ones go in `docs/research/`
- **Media**: keep generated media out of git unless it is a deliberate reference sample
- **New assets**: build them in the `AssetLab` composition first, then place them into shots
- **Audio**: final master with `scripts/master.sh` (−11 LUFS, matches the references). Keep SFX around 0.2 volume
- **Engine changes affect every clip**: after changing `engine/`, type-check the engine (`npx tsc --noEmit` in `engine/`) and every clip (`engine/node_modules/.bin/tsc -p clips/<slug>/tsconfig.json`)
