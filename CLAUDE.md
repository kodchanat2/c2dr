# claude-video

## Goal

Build a Claude Skill that produces Thai YouTube Shorts mimicking the style of the reference videos in `docs/resource/resource.md` (8 clips from one channel, files in `docs/resource/videos/`, thumbnails in `docs/resource/thumbnails/`).

This is a research-heavy project: expect many experiments before the skill stabilizes. Claude may freely create and update project-level Markdown (`CLAUDE.md`, `AGENTS.md`, `docs/**`) to record findings, decisions, and conventions.

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

- **Visuals**: Claude-only. Claude draws everything as code (SVG/React rendered with Remotion); no AI image generation. Extra Claude plugins/skills are allowed: the official Remotion plugin, the local `remotion-video-creation` skill, `video-editing`
- **TTS**: Google, free-tier API key in `.env` as `GEMINI_API_KEY` (template: `.env.example`). Some models are unavailable on free tier, so the TTS layer must be a swappable adapter and must probe which model works. Candidates: Gemini TTS preview models, Live API native audio. Thai support is unverified until we test with the key
- **Autonomy**: the skill MUST stop for user approval of the script and the storyboard before rendering
- **Branding**: mock only for now. Name "Lumo", logo `assets/brand/logo.svg`. Never use the reference channel's branding
- **Branding config**: `config/brand.json` (channelName, logo, watermark, endCardHandle)
- **BGM**: users drop files into `assets/bgm/<mood>/` (mystery, horror, funny, epic, chill, tech). Audio files are gitignored
- **SFX**: automatic, from SFXMint (CC0) or generated with ffmpeg
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

- Put experiments under `experiments/<NN>-<slug>/` with a short `NOTES.md` recording the goal, result, and next step
- Put durable findings in `docs/research/`
- Keep generated media out of git unless it is a deliberate reference sample
