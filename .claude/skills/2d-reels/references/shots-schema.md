# shots.json schema

Location: `clips/<slug>/shots.json`. Typed as `ShotsFile` in `engine/src/timeline.ts`.

```jsonc
{
  "title": "ถ้า…",                        // end-card title
  "episode": "EP.1 …",                   // only for endCard.type = "series"
  "summary": "สรุปสั้น ๆ",                  // end-card summary / question
  "voice": "Charon",                     // Gemini Live prebuilt voice
  "style": "…",                          // optional Live system instruction (persona); default: calm low male documentary voice
  "endCard": { "type": "simple", "seconds": 3 },  // "simple" | "series"
  "bgm": { "twistLine": "15" },          // line id where bgm/twist.mp3 takes over (omit = main track only)
  "lines": [
    {
      "id": "01",                                  // two-digit, matches storyboard.tsx keys
      "subs": ["ถ้าวันหนึ่ง", "อเมริกา{r:เกิดบ้า}"],     // subtitle chunks, shown in order, timed by length
      "say": "…",                                  // optional: spoken text when it differs from subs
      "target": 2.4                                // optional: pin the line to N seconds (reference matching)
    }
  ]
}
```

**Subtitle markup**
- `{y:text}`: yellow
- `{r:text}`: red
- `{R:text}`: red pill box (punchline)

**Chunks**: 6–20 visible chars each. Two or three chunks per line is typical.
